import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Dictation for the composer, plus the loudness the orb is drawn from.
 *
 * Two separate things happen when you hold down a mic button, and they need
 * separate machinery. The words come from the browser's own speech
 * recogniser. The *movement* — the reason an orb reads as listening rather
 * than as a spinner — has to come from the microphone's actual amplitude,
 * which the recogniser will not tell you. So this opens a media stream of its
 * own and runs an analyser over it. One permission prompt covers both.
 *
 * Loudness is handed out as a getter rather than as state on purpose. The orb
 * samples it every animation frame; putting that in React would re-render the
 * whole chat sixty times a second to move a circle.
 */

const Recognition =
  typeof window !== "undefined" &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);

/** Whether dictation can work here at all. Firefox, notably, ships no recogniser. */
export const speechSupported = Boolean(Recognition);

/* Speech comes in bursts with real gaps between phrases. Ending the moment the
   recogniser reports a pause cuts people off mid-thought, so a stop is only
   honoured after this much continuous quiet. */
const SILENCE_MS = 2600;

export const useSpeechInput = ({ lang = "en-IN", onFinal, onInterim } = {}) => {
  const [listening, setListening] = useState(false);
  /* True between the click and the microphone actually opening. The first
     time someone dictates, a browser permission prompt sits in that gap —
     without a state for it the button looks broken while they read it. */
  const [starting, setStarting] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState(null);

  const recogRef = useRef(null);
  const streamRef = useRef(null);
  const audioRef = useRef(null);
  const analyserRef = useRef(null);
  const binsRef = useRef(null);
  const levelRef = useRef(0);
  const silenceRef = useRef(null);
  /* Set when the user stops it, so onend knows not to restart. */
  const stoppingRef = useRef(false);
  const onFinalRef = useRef(onFinal);
  const onInterimRef = useRef(onInterim);

  onFinalRef.current = onFinal;
  onInterimRef.current = onInterim;

  /** Smoothed 0–1 loudness. Read this from an animation frame. */
  const getLevel = useCallback(() => levelRef.current, []);

  const teardownAudio = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    /* close() rejects if the context is already closed — which happens when
       the tab is backgrounded mid-listen. */
    audioRef.current?.close?.().catch(() => {});
    audioRef.current = null;
    analyserRef.current = null;
    levelRef.current = 0;
  }, []);

  const stop = useCallback(() => {
    stoppingRef.current = true;
    clearTimeout(silenceRef.current);
    try {
      recogRef.current?.stop();
    } catch {
      /* stopping one that never started is not an error worth surfacing */
    }
    teardownAudio();
    setListening(false);
    setStarting(false);
    setInterim("");
  }, [teardownAudio]);

  const start = useCallback(async () => {
    if (!Recognition || listening || starting) return;
    setError(null);
    setStarting(true);
    stoppingRef.current = false;

    /* The meter first. If the microphone is refused we want to say so before
       the recogniser opens its own prompt and fails more cryptically. */
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      /* Without smoothing the orb jitters on every consonant. */
      analyser.smoothingTimeConstant = 0.75;
      ctx.createMediaStreamSource(stream).connect(analyser);
      analyserRef.current = analyser;
      binsRef.current = new Uint8Array(analyser.frequencyBinCount);
    } catch {
      setError("SafarX needs microphone access to hear you.");
      teardownAudio();
      setStarting(false);
      return;
    }

    const recog = new Recognition();
    recog.lang = lang;
    recog.continuous = true;
    recog.interimResults = true;

    recog.onresult = (event) => {
      let live = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) {
          onFinalRef.current?.(text.trim());
        } else {
          live += text;
        }
      }
      setInterim(live);
      onInterimRef.current?.(live);

      /* Any speech at all resets the quiet timer. */
      clearTimeout(silenceRef.current);
      silenceRef.current = setTimeout(stop, SILENCE_MS);
    };

    recog.onerror = (event) => {
      /* "no-speech" and "aborted" are ordinary — someone opened the mic and
         said nothing, or closed it. Only real faults are worth a message. */
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setError("SafarX needs microphone access to hear you.");
      } else if (event.error === "network") {
        setError("Speech recognition needs a connection.");
      }
      if (event.error !== "no-speech") stop();
    };

    recog.onend = () => {
      /* Chrome ends the session on its own after a pause even with
         continuous set. Restart unless the user actually asked to stop. */
      if (stoppingRef.current) return;
      try {
        recog.start();
      } catch {
        stop();
      }
    };

    try {
      recog.start();
    } catch {
      setError("Could not start listening. Try again.");
      teardownAudio();
      setStarting(false);
      return;
    }

    recogRef.current = recog;
    setStarting(false);
    setListening(true);
    silenceRef.current = setTimeout(stop, SILENCE_MS);
  }, [lang, listening, starting, stop, teardownAudio]);

  /* Sample the analyser on a frame loop while listening. */
  useEffect(() => {
    if (!listening) return undefined;
    let frame;
    const tick = () => {
      const analyser = analyserRef.current;
      const bins = binsRef.current;
      if (analyser && bins) {
        analyser.getByteFrequencyData(bins);
        let sum = 0;
        /* Speech lives low in the spectrum; the top bins are mostly hiss. */
        const used = Math.floor(bins.length * 0.6);
        for (let i = 0; i < used; i += 1) sum += bins[i];
        const mean = sum / used / 255;
        /* Normal speech sits near 0.15 raw, so lift it into a usable range
           and let it saturate rather than clip hard at a shout. */
        levelRef.current = Math.min(1, mean * 3.2);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [listening]);

  const toggle = useCallback(() => {
    if (listening || starting) stop();
    else start();
  }, [listening, starting, start, stop]);

  /* Leaving the page with the microphone open is not acceptable. */
  useEffect(() => () => {
    stoppingRef.current = true;
    clearTimeout(silenceRef.current);
    try {
      recogRef.current?.abort();
    } catch {
      /* already gone */
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioRef.current?.close?.().catch(() => {});
  }, []);

  return {
    listening, starting, interim, error,
    start, stop, toggle, getLevel,
    supported: speechSupported,
  };
};

export default useSpeechInput;
