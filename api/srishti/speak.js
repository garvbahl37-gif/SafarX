import { SRISHTI_VOICE } from "./_persona.js";
import { rateLimit, clientIp } from "../trains/_ratelimit.js";

/**
 * Srishti's voice, on its own.
 *
 * Rendering speech takes roughly four times as long as deciding what to say,
 * so it is split out: the browser shows her words the moment they exist and
 * asks for the sound separately. Returns raw 24kHz signed 16-bit PCM as
 * base64 — the browser feeds it straight into an AudioBuffer.
 */

/* Speech quota is per model too. */
const VOICE_MODELS = ["gemini-3.1-flash-tts-preview", "gemini-2.5-flash-preview-tts"];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST." });
  }

  const burst = rateLimit(`speak:${clientIp(req)}`, { limit: 30, windowMs: 60_000 });
  if (!burst.ok) {
    res.setHeader("Retry-After", String(burst.retryAfter));
    return res.status(429).json({ error: "Too many requests." });
  }

  const text = String(req.body?.text || "").slice(0, 1200);
  if (!text.trim()) return res.status(400).json({ error: "Nothing to say." });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(503).json({ error: "Srishti's voice is not configured." });

  const payload = JSON.stringify({
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: req.body?.voice || SRISHTI_VOICE } },
      },
    },
  });

  for (const model of VOICE_MODELS) {
    try {
      const upstream = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: payload }
      );
      if (!upstream.ok) continue;
      const out = await upstream.json();
      const audio = out.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!audio) continue;
      res.setHeader("Cache-Control", "private, max-age=600");
      return res.status(200).json({ audio, sampleRate: 24000 });
    } catch {
      /* try the next voice model */
    }
  }

  // She can still be read when she cannot be heard.
  return res.status(502).json({ error: "Her voice did not come through." });
}
