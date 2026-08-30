/**
 * srishtiLive — the browser half of Srishti's voice.
 *
 * Holds one socket open to our own server, which holds one to Gemini. The
 * microphone streams up as raw 16kHz PCM and her voice streams back at 24kHz,
 * so she starts answering while you are still finishing your sentence — first
 * audio lands about 670ms after you stop, against a floor of 3.4 seconds for
 * anything that has to render speech from finished text.
 *
 * Turn-taking and interruption are Gemini's: it hears when you begin and when
 * you stop, and it tells us the moment you talk over her so we can drop what
 * is queued.
 */

const MIC_RATE = 16000;
const HER_RATE = 24000;

/* While she is speaking, the microphone is hearing her as well as you. Echo
   cancellation removes most of it but not all, and what survives was enough to
   register as an interruption and cut her off mid-sentence. So while she talks,
   only sound clearly louder than the leftovers is passed on — which is what
   actually interrupting someone sounds like. */
/* Speech has to clear this to count. The bar is raised while she is talking,
   because then the microphone is also hearing her. */
const SPEECH_LEVEL = 0.035;
const BARGE_IN_LEVEL = 0.085;

/* Her voice keeps arriving from the speakers for a moment after the last chunk
   plays, so the higher bar stays up briefly after she finishes. */
const ECHO_TAIL_MS = 500;

/* Quiet for this long ends an utterance. Long enough to pause mid-sentence. */
const END_OF_SPEECH_MS = 800;

/* Audio arrives over the network in uneven bursts. Starting playback the
   instant the first chunk lands means the second one is late and you hear a
   gap — the flicker in her voice. A short head start absorbs the jitter; long
   enough to cover a hiccup, short enough that nobody notices her beginning. */
const JITTER_BUFFER_S = 0.18;

/* Captures the microphone off the main thread and hands up 16kHz PCM16. */
const WORKLET = `
class Tap extends AudioWorkletProcessor {
  constructor() {
    super();
    this._carry = 0;
  }
  process(inputs) {
    const input = inputs[0]?.[0];
    if (!input) return true;
    // sampleRate is whatever the device gave us; step down to 16k by taking
    // the nearest sample. Speech survives this far better than it survives
    // the main thread being busy.
    const ratio = sampleRate / ${MIC_RATE};
    const out = new Int16Array(Math.floor((input.length - this._carry) / ratio) + 1);
    let n = 0;
    for (let i = this._carry; i < input.length; i += ratio) {
      const s = Math.max(-1, Math.min(1, input[Math.floor(i)]));
      out[n++] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    this._carry = (this._carry + n * ratio) - input.length;
    if (this._carry < 0) this._carry = 0;
    if (n > 0) this.port.postMessage(out.subarray(0, n));
    return true;
  }
}
registerProcessor('srishti-tap', Tap);
`;

/** Root mean square of a PCM16 frame, 0–1 — how loud this slice of sound is. */
const rms = (samples) => {
  let sum = 0;
  for (let i = 0; i < samples.length; i += 1) {
    const v = samples[i] / 32768;
    sum += v * v;
  }
  return Math.sqrt(sum / samples.length);
};

export class LiveSession {
  /**
   * @param {object} handlers
   * @param {(state: "connecting"|"ready"|"listening"|"speaking"|"closed") => void} handlers.onState
   * @param {(text: string) => void} [handlers.onSaid] her words, as she says them
   * @param {(text: string) => void} [handlers.onHeard] your words, as she hears them
   * @param {(to: string, tourId: string|null) => void} [handlers.onNavigate]
   * @param {(name: string) => void} [handlers.onTool]
   * @param {(message: string) => void} [handlers.onError]
   */
  constructor(handlers = {}) {
    this.h = handlers;
    this.socket = null;
    this.mic = null;
    this.micContext = null;
    this.node = null;
    this.out = null;
    this.analyser = null;
    this.analyserData = null;
    this.playAt = 0;
    this.queued = new Set();
    this.speaking = false;
    this.muted = false;
    /* True from her first chunk until the turn is done. `speaking` tracks
       whether sound is leaving the speakers this instant and flickers between
       chunks; this does not, and it is what the microphone is judged against.
       Gating on `speaking` left gaps in which her own voice reached Gemini,
       which read it as an interruption and cut her off — the breaking up. */
    this.herTurn = false;
    this.herTurnEndedAt = 0;

    /* We tell Gemini where each utterance begins and ends rather than letting
       it work that out from the audio, so the decision can take into account
       the one thing only this side knows: whether the sound is her. */
    this.userSpeaking = false;
    this.lastLoudAt = 0;
    this.silenceTimer = null;
    /* A fixed threshold suits one microphone and one room. This one settles on
       whatever it hears in the first moments and judges speech against that,
       so a quiet laptop mic is not ignored and a noisy hall is not permanently
       triggered. */
    this.floor = null;
    this.floorSamples = [];

    /* Transcripts arrive a few words at a time and have to be assembled, but
       only within one exchange: appending them forever ran every answer into
       the one before it. `pending` marks that the next fragment belongs to a
       new turn and should replace what is on screen rather than extend it. */
    this.heard = "";
    this.said = "";
    this.pending = { heard: false, said: false };
  }

  #startHeard() {
    if (!this.pending.heard) return;
    this.pending.heard = false;
    this.heard = "";
    // A new question means her last answer is history.
    this.said = "";
    this.h.onSaid?.("");
  }

  #startSaid() {
    if (!this.pending.said) return;
    this.pending.said = false;
    this.said = "";
  }

  /** Both sides of the exchange are finished; the next fragment starts a new one. */
  #endTurn() {
    this.pending = { heard: true, said: true };
  }

  /** Her loudness right now, 0–1, for the rings. */
  level() {
    if (!this.analyser || !this.speaking) return 0;
    this.analyser.getByteTimeDomainData(this.analyserData);
    let sum = 0;
    for (let i = 0; i < this.analyserData.length; i += 1) {
      const v = (this.analyserData[i] - 128) / 128;
      sum += v * v;
    }
    return Math.min(1, Math.sqrt(sum / this.analyserData.length) * 3.4);
  }

  async start() {
    this.h.onState?.("connecting");

    // The microphone first: no point opening a socket we cannot feed.
    this.mic = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
      },
    });

    this.micContext = new (window.AudioContext || window.webkitAudioContext)();
    await this.micContext.resume();
    const blob = new Blob([WORKLET], { type: "application/javascript" });
    await this.micContext.audioWorklet.addModule(URL.createObjectURL(blob));

    this.out = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: HER_RATE });
    await this.out.resume();
    this.analyser = this.out.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyserData = new Uint8Array(this.analyser.fftSize);
    this.analyser.connect(this.out.destination);

    const scheme = location.protocol === "https:" ? "wss" : "ws";
    this.socket = new WebSocket(`${scheme}://${location.host}/api/srishti/live`);
    this.socket.binaryType = "arraybuffer";

    this.socket.onmessage = (event) => this.#onMessage(event);
    this.socket.onerror = () => this.h.onError?.("I lost the connection. Try again?");
    this.socket.onclose = () => {
      this.h.onState?.("closed");
      this.#teardownAudio();
    };

    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Srishti did not pick up.")), 12000);
      this.socket.onopen = () => {
        clearTimeout(timer);
        resolve();
      };
    });

    // Only start streaming once the socket is up, so nothing is lost.
    const source = this.micContext.createMediaStreamSource(this.mic);
    this.node = new AudioWorkletNode(this.micContext, "srishti-tap");
    this.node.port.onmessage = (e) => {
      if (this.muted || this.socket?.readyState !== WebSocket.OPEN) return;
      this.#hear(e.data);
      // Audio always flows; only the activity markers gate a turn.
      this.socket.send(e.data.buffer);
    };
    source.connect(this.node);
    // Kept out of the speakers — this node exists to read the microphone.
    this.node.connect(this.micContext.destination);
    this.node.disconnect(this.micContext.destination);
  }

  #onMessage(event) {
    if (event.data instanceof ArrayBuffer) {
      this.#play(event.data);
      return;
    }
    let msg;
    try {
      msg = JSON.parse(event.data);
    } catch {
      return;
    }

    switch (msg.type) {
      case "ready":
        this.h.onState?.("listening");
        break;
      case "interrupted":
        // She has been talked over. Everything queued is now stale, and so is
        // the half-finished sentence on screen.
        this.herTurn = false;
        this.herTurnEndedAt = Date.now();
        this.#flush();
        this.#endTurn();
        this.h.onState?.("listening");
        break;
      case "turn-complete":
        this.herTurn = false;
        this.herTurnEndedAt = Date.now();
        this.#endTurn();
        if (!this.queued.size) {
          this.speaking = false;
          this.h.onState?.("listening");
        }
        break;
      case "said":
        this.#startSaid();
        this.said += msg.text;
        this.h.onSaid?.(this.said);
        break;
      case "heard":
        this.#startHeard();
        this.heard += msg.text;
        this.h.onHeard?.(this.heard);
        break;
      case "navigate":
        this.h.onNavigate?.(msg.to, msg.tourId);
        break;
      case "tool":
        this.h.onTool?.(msg.name);
        break;
      case "error":
        this.h.onError?.(msg.message);
        break;
      case "closed":
        if (msg.reason === "session-limit") {
          this.h.onError?.("We've been talking a while — tap to start again.");
        }
        break;
      default:
        break;
    }
  }

  /** Schedules a chunk so the pieces play as one continuous voice. */
  #play(buffer) {
    if (!this.out) return;
    const pcm = new Int16Array(buffer);
    if (!pcm.length) return;

    const audio = this.out.createBuffer(1, pcm.length, HER_RATE);
    const channel = audio.getChannelData(0);
    for (let i = 0; i < pcm.length; i += 1) channel[i] = pcm[i] / 32768;

    const source = this.out.createBufferSource();
    source.buffer = audio;
    source.connect(this.analyser);

    /* Each chunk is scheduled immediately after the one before, so the pieces
       play as one unbroken voice. The timeline is only re-based when it has
       actually fallen behind — re-basing on every chunk was what made her
       stutter, because each new chunk restarted the clock a fraction late. */
    const now = this.out.currentTime;
    if (this.playAt < now + 0.02) this.playAt = now + JITTER_BUFFER_S;
    source.start(this.playAt);
    this.playAt += audio.duration;

    this.queued.add(source);
    source.onended = () => {
      this.queued.delete(source);
      /* An empty queue does not mean she has finished — the next chunk may
         still be in flight. She is done only when nothing is queued and the
         timeline has actually run out. */
      if (!this.queued.size && this.out && this.out.currentTime >= this.playAt - 0.05) {
        this.speaking = false;
        this.h.onState?.("listening");
      }
    };

    if (!this.speaking) {
      this.speaking = true;
      this.h.onState?.("speaking");
    }
    this.herTurn = true;
  }

  /**
   * Decides whether this slice of sound is someone talking, and marks the
   * start and end of an utterance for Gemini.
   */
  #hear(frame) {
    const level = rms(frame);

    // Listen to the room before judging anything against it.
    if (this.floor === null) {
      this.floorSamples.push(level);
      if (this.floorSamples.length < 25) return;
      const sorted = [...this.floorSamples].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      this.floor = Math.max(0.004, median);
      this.floorSamples = [];
    }

    const guarded = this.herTurn || Date.now() - this.herTurnEndedAt < ECHO_TAIL_MS;
    // Speech stands clear of the room; interrupting her has to stand clear of
    // her voice as well.
    const bar = Math.max(
      guarded ? BARGE_IN_LEVEL : SPEECH_LEVEL,
      this.floor * (guarded ? 6 : 3)
    );
    const now = Date.now();

    if (level > bar) {
      this.lastLoudAt = now;
      if (!this.userSpeaking) {
        this.userSpeaking = true;
        this.#send({ type: "speech-start" });
      }
      clearTimeout(this.silenceTimer);
      this.silenceTimer = setTimeout(() => this.#endUtterance(), END_OF_SPEECH_MS);
    }
  }

  #endUtterance() {
    if (!this.userSpeaking) return;
    this.userSpeaking = false;
    this.#send({ type: "speech-end" });
  }

  #send(message) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  #flush() {
    this.herTurn = false;
    for (const source of this.queued) {
      try {
        source.onended = null;
        source.stop();
      } catch {
        /* already finished */
      }
    }
    this.queued.clear();
    this.speaking = false;
    this.playAt = 0;
  }

  /** Ask by typing — same conversation, no microphone. */
  say(text) {
    if (this.socket?.readyState !== WebSocket.OPEN) return;
    this.#endUtterance();
    clearTimeout(this.silenceTimer);
    this.#flush();
    this.#endTurn();
    this.heard = text;
    this.said = "";
    this.h.onHeard?.(text);
    this.h.onSaid?.("");
    this.pending.heard = false;
    this.socket.send(JSON.stringify({ type: "text", text }));
  }

  mute(on) {
    this.muted = on;
    if (on) this.#flush();
  }

  stop() {
    clearTimeout(this.silenceTimer);
    this.#flush();
    try {
      this.socket?.close();
    } catch {
      /* already closed */
    }
    this.socket = null;
    this.#teardownAudio();
  }

  #teardownAudio() {
    this.mic?.getTracks().forEach((t) => t.stop());
    this.node?.disconnect();
    this.micContext?.close().catch(() => {});
    this.out?.close().catch(() => {});
    this.mic = null;
    this.node = null;
    this.micContext = null;
    this.out = null;
    this.analyser = null;
  }
}
