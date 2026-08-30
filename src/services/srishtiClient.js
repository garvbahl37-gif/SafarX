/**
 * srishtiClient — the plumbing behind Srishti's voice.
 *
 * Once the microphone is granted she stays open: she hears when you start
 * talking, hears when you stop, answers, and listens again. No button held
 * down, no turn-taking to remember — which is the whole difference between
 * operating a voice interface and talking to someone.
 *
 * Her words and her voice arrive separately on purpose. Rendering speech takes
 * about four times as long as deciding what to say, so the caller shows the
 * text the moment it lands and the sound catches up.
 */

const TURN_URL = "/api/srishti/turn";
const SPEAK_URL = "/api/srishti/speak";

/* ── Hearing ────────────────────────────────────────────────────────── */

/** How much louder than the room a sound must be before it counts as speech. */
const SPEECH_OVER_NOISE = 2.6;
/** A floor, so a silent room does not make every rustle count as talking. */
const MIN_SPEECH_LEVEL = 0.028;
/** Silence this long ends a turn. Long enough to think mid-sentence. */
const END_OF_TURN_MS = 1100;
/** Ignore blips this short — a cough, a chair, a door. */
const MIN_UTTERANCE_MS = 350;
/** Never let one turn run away. */
const MAX_UTTERANCE_MS = 20000;

/**
 * Keeps the microphone open and reports whole utterances.
 *
 * The room is measured first and everything is judged relative to that, so it
 * works in a quiet flat and in a conference hall without tuning.
 */
export class Ears {
  constructor({ onUtterance, onStateChange, onLevel } = {}) {
    this.onUtterance = onUtterance;
    this.onStateChange = onStateChange;
    this.onLevel = onLevel;

    this.stream = null;
    this.context = null;
    this.analyser = null;
    this.data = null;
    this.recorder = null;
    this.chunks = [];

    this.noiseFloor = 0.012;
    this.speaking = false;
    this.speechStartedAt = 0;
    this.lastLoudAt = 0;
    this.raf = 0;
    /* Raised while she talks so her own voice cannot start a turn, and set
       hard while a reply is in flight so nothing is recorded over it. */
    this.gate = 1;
    this.deaf = false;
  }

  /** @returns {Promise<void>} resolves once the microphone is live. */
  async open() {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
      },
    });

    this.context = new (window.AudioContext || window.webkitAudioContext)();
    await this.context.resume();
    const source = this.context.createMediaStreamSource(this.stream);
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.6;
    this.data = new Uint8Array(this.analyser.fftSize);
    source.connect(this.analyser);

    // Listen to the room for a moment before deciding what counts as speech.
    await this.#measureRoom();
    this.#watch();
  }

  close() {
    cancelAnimationFrame(this.raf);
    this.#stopRecorder();
    this.stream?.getTracks().forEach((t) => t.stop());
    this.context?.close().catch(() => {});
    this.stream = null;
    this.context = null;
    this.analyser = null;
  }

  /** Stop hearing entirely — while a reply is being fetched. */
  deafen() {
    this.deaf = true;
    this.#abandonUtterance();
  }

  /** Hear again. `gate` above 1 makes her harder to trigger. */
  listen(gate = 1) {
    this.gate = gate;
    this.deaf = false;
    this.lastLoudAt = 0;
  }

  level() {
    if (!this.analyser) return 0;
    this.analyser.getByteTimeDomainData(this.data);
    let sum = 0;
    for (let i = 0; i < this.data.length; i += 1) {
      const v = (this.data[i] - 128) / 128;
      sum += v * v;
    }
    return Math.sqrt(sum / this.data.length);
  }

  async #measureRoom() {
    const samples = [];
    const until = performance.now() + 420;
    await new Promise((resolve) => {
      const tick = () => {
        samples.push(this.level());
        if (performance.now() < until) requestAnimationFrame(tick);
        else resolve();
      };
      tick();
    });
    samples.sort((a, b) => a - b);
    // The median, not the mean: a single door slam should not deafen her.
    this.noiseFloor = Math.max(0.006, samples[Math.floor(samples.length / 2)] || 0.012);
  }

  #watch() {
    const tick = () => {
      const level = this.level();
      this.onLevel?.(Math.min(1, level * 4));

      if (!this.deaf) {
        const threshold = Math.max(MIN_SPEECH_LEVEL, this.noiseFloor * SPEECH_OVER_NOISE) * this.gate;
        const now = performance.now();

        if (level > threshold) {
          this.lastLoudAt = now;
          if (!this.speaking) this.#beginUtterance(now);
        } else if (this.speaking) {
          const quietFor = now - this.lastLoudAt;
          const spokeFor = now - this.speechStartedAt;
          if (quietFor > END_OF_TURN_MS || spokeFor > MAX_UTTERANCE_MS) {
            this.#endUtterance(spokeFor);
          }
        }
      }

      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  #beginUtterance(now) {
    this.speaking = true;
    this.speechStartedAt = now;
    this.chunks = [];
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";
    try {
      this.recorder = new MediaRecorder(this.stream, { mimeType });
      this.recorder.ondataavailable = (e) => e.data.size && this.chunks.push(e.data);
      this.recorder.start();
      this.onStateChange?.("hearing");
    } catch {
      this.speaking = false;
    }
  }

  #endUtterance(spokeFor) {
    const recorder = this.recorder;
    this.speaking = false;
    this.recorder = null;
    if (!recorder) return;

    recorder.onstop = async () => {
      const blob = new Blob(this.chunks, { type: recorder.mimeType });
      this.chunks = [];
      // Too short, or too small to hold a word.
      if (spokeFor < MIN_UTTERANCE_MS || blob.size < 1600) {
        this.onStateChange?.("waiting");
        return;
      }
      const buffer = await blob.arrayBuffer();
      this.onUtterance?.({ audio: toBase64(buffer), mimeType: recorder.mimeType.split(";")[0] });
    };
    try {
      recorder.stop();
    } catch {
      /* already stopped */
    }
  }

  #abandonUtterance() {
    this.speaking = false;
    this.#stopRecorder();
  }

  #stopRecorder() {
    if (!this.recorder) return;
    this.recorder.ondataavailable = null;
    this.recorder.onstop = null;
    try {
      this.recorder.stop();
    } catch {
      /* already stopped */
    }
    this.recorder = null;
    this.chunks = [];
  }
}

const toBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  // Chunked: a single spread of a megabyte-long array blows the call stack.
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
};

/* ── Asking ─────────────────────────────────────────────────────────── */

/**
 * One turn.
 * @returns {Promise<{text:string, language:string, navigate:string|null, tourId:string|null, toolsUsed:string[]}>}
 */
export const ask = async ({ audio, mimeType, text, history = [], mode = "chat", signal }) => {
  const res = await fetch(TURN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ audio, mimeType, text, history, mode }),
    signal,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "Srishti could not answer just now.");
  return body;
};

/* ── Speaking ───────────────────────────────────────────────────────── */

/**
 * Plays a line in Srishti's voice and reports her loudness so the rings can
 * breathe with her. Carries the language so Hindi is spoken by someone who
 * speaks Hindi rather than read by someone who does not.
 */
export class Voice {
  constructor() {
    this.context = null;
    this.source = null;
    this.analyser = null;
    this.data = null;
  }

  level() {
    if (!this.analyser || !this.source) return 0;
    this.analyser.getByteTimeDomainData(this.data);
    let sum = 0;
    for (let i = 0; i < this.data.length; i += 1) {
      const v = (this.data[i] - 128) / 128;
      sum += v * v;
    }
    return Math.min(1, Math.sqrt(sum / this.data.length) * 3.2);
  }

  /** Cut her off mid-word — what happens when someone talks over her. */
  stop() {
    const source = this.source;
    this.source = null;
    if (!source) return;
    try {
      source.onended = null;
      source.stop();
    } catch {
      /* not playing */
    }
  }

  get speaking() {
    return Boolean(this.source);
  }

  /**
   * @param {string} text what she should say
   * @param {string} [language] BCP-47 tag, e.g. hi-IN
   * @returns {Promise<void>} resolves when she finishes, or when interrupted
   */
  async say(text, language) {
    const res = await fetch(SPEAK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.audio) throw new Error(body.error || "Her voice did not come through.");

    this.context ||= new (window.AudioContext || window.webkitAudioContext)();
    await this.context.resume();

    const pcm = decodePcm16(body.audio);
    const buffer = this.context.createBuffer(1, pcm.length, body.sampleRate || 24000);
    buffer.copyToChannel(pcm, 0);

    this.stop();
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 512;
    this.data = new Uint8Array(this.analyser.fftSize);

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.analyser);
    this.analyser.connect(this.context.destination);
    this.source = source;

    return new Promise((resolve) => {
      source.onended = () => {
        if (this.source === source) this.source = null;
        resolve();
      };
      source.start();
    });
  }
}

/** Raw signed 16-bit PCM, little-endian, as base64 → floats for Web Audio. */
const decodePcm16 = (base64) => {
  const binary = atob(base64);
  const samples = new Float32Array(binary.length / 2);
  for (let i = 0; i < samples.length; i += 1) {
    const lo = binary.charCodeAt(i * 2);
    const hi = binary.charCodeAt(i * 2 + 1);
    const int = (hi << 8) | lo;
    samples[i] = (int >= 0x8000 ? int - 0x10000 : int) / 32768;
  }
  return samples;
};
