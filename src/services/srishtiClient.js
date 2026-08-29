/**
 * srishtiClient — the plumbing behind Srishti's voice.
 *
 * Three jobs: take what the traveller says, ask the server what she says back,
 * and play her answer while reporting how loud she is so the rings can move
 * with her.
 *
 * Her words and her voice arrive separately on purpose. Rendering speech takes
 * about four times as long as deciding what to say, so the caller shows the
 * text the moment it lands and the sound catches up.
 */

const TURN_URL = "/api/srishti/turn";
const SPEAK_URL = "/api/srishti/speak";

/* ── Listening ──────────────────────────────────────────────────────── */

/**
 * Records one turn from the microphone. Push-to-talk rather than automatic
 * voice detection: a demo happens in a loud room, and a false trigger mid
 * sentence is worse than holding a button.
 */
export class Listener {
  constructor() {
    this.recorder = null;
    this.chunks = [];
    this.stream = null;
  }

  /** @returns {Promise<void>} resolves once the microphone is live. */
  async start() {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
    });
    this.chunks = [];
    // Opus in WebM is what every browser agrees on, and Gemini reads it directly.
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";
    this.recorder = new MediaRecorder(this.stream, { mimeType });
    this.recorder.ondataavailable = (e) => e.data.size && this.chunks.push(e.data);
    this.recorder.start();
  }

  /** @returns {Promise<{audio: string, mimeType: string}|null>} base64 audio. */
  async stop() {
    if (!this.recorder) return null;
    const done = new Promise((resolve) => {
      this.recorder.onstop = resolve;
    });
    this.recorder.stop();
    await done;
    this.stream?.getTracks().forEach((t) => t.stop());

    const blob = new Blob(this.chunks, { type: this.recorder.mimeType });
    this.recorder = null;
    this.stream = null;
    // Too short to contain speech — a mis-tap rather than a question.
    if (blob.size < 1200) return null;

    const buffer = await blob.arrayBuffer();
    return { audio: toBase64(buffer), mimeType: blob.type.split(";")[0] };
  }

  cancel() {
    try {
      this.recorder?.stop();
    } catch {
      /* already stopped */
    }
    this.stream?.getTracks().forEach((t) => t.stop());
    this.recorder = null;
    this.stream = null;
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
 * One turn. Returns her words, plus where she wants the app to go.
 * @returns {Promise<{text:string, navigate:string|null, tourId:string|null, toolsUsed:string[]}>}
 */
export const ask = async ({ audio, mimeType, text, history = [], mode = "chat" }) => {
  const res = await fetch(TURN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ audio, mimeType, text, history, mode }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "Srishti could not answer just now.");
  return body;
};

/* ── Speaking ───────────────────────────────────────────────────────── */

/**
 * Plays a line in Srishti's voice and reports her loudness, frame by frame, so
 * the rings can breathe with her.
 */
export class Voice {
  constructor() {
    this.context = null;
    this.source = null;
    this.analyser = null;
    this.data = null;
  }

  /** 0 while silent, climbing toward 1 at her loudest. */
  level() {
    if (!this.analyser) return 0;
    this.analyser.getByteTimeDomainData(this.data);
    let sum = 0;
    for (let i = 0; i < this.data.length; i += 1) {
      const v = (this.data[i] - 128) / 128;
      sum += v * v;
    }
    // Root mean square, lifted — speech rarely approaches full scale.
    return Math.min(1, Math.sqrt(sum / this.data.length) * 3.2);
  }

  stop() {
    try {
      this.source?.stop();
    } catch {
      /* not playing */
    }
    this.source = null;
  }

  /**
   * @param {string} text what she should say
   * @returns {Promise<void>} resolves when she has finished speaking
   */
  async say(text) {
    const res = await fetch(SPEAK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
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
        this.source = null;
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
