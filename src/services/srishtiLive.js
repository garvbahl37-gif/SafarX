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
        // She has been talked over. Everything queued is now stale.
        this.#flush();
        this.h.onState?.("listening");
        break;
      case "turn-complete":
        if (!this.queued.size) {
          this.speaking = false;
          this.h.onState?.("listening");
        }
        break;
      case "said":
        this.h.onSaid?.(msg.text);
        break;
      case "heard":
        this.h.onHeard?.(msg.text);
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

    // Queue behind whatever is already playing, or start now if she has been
    // silent. A small lead avoids clicking between chunks.
    const now = this.out.currentTime;
    if (this.playAt < now) this.playAt = now + 0.04;
    source.start(this.playAt);
    this.playAt += audio.duration;

    this.queued.add(source);
    source.onended = () => {
      this.queued.delete(source);
      if (!this.queued.size) {
        this.speaking = false;
        this.h.onState?.("listening");
      }
    };

    if (!this.speaking) {
      this.speaking = true;
      this.h.onState?.("speaking");
    }
  }

  #flush() {
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
    this.#flush();
    this.socket.send(JSON.stringify({ type: "text", text }));
  }

  mute(on) {
    this.muted = on;
    if (on) this.#flush();
  }

  stop() {
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
