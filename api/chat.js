/**
 * SafarX Agent — Groq chat proxy.
 *
 * The key lives here, server-side. A VITE_ prefixed key would be inlined
 * into the client bundle and readable by anyone who opens devtools, so the
 * browser never sees it: it posts to /api/chat and this function forwards
 * the call to Groq.
 */

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are SafarX, a travel companion for Incredible India.
You help travellers plan trips across India: itineraries, heritage sites,
seasons, transport, and what a day realistically costs.

Rules:
- India only. If asked about somewhere else, say that SafarX covers India and
  offer the closest Indian equivalent.
- Money is always in rupees, written like ₹4,500.
- Be specific and practical: name real places, real months, real travel times.
- Keep answers short and scannable. Lead with the answer, not a preamble.
- If you are unsure of a fact such as an entry fee or opening time, say so
  rather than inventing it.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST." });
  }

  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return res.status(503).json({
      error:
        "The agent is not configured yet — GROQ_API_KEY is missing on the server.",
    });
  }

  try {
    const { messages = [], temperature = 0.6 } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Send a non-empty messages array." });
    }

    const upstream = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature,
        max_tokens: 1200,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      return res.status(upstream.status).json({
        error: "The model could not answer that. Try again in a moment.",
        detail: detail.slice(0, 400),
      });
    }

    const data = await upstream.json();
    return res.status(200).json({
      reply: data.choices?.[0]?.message?.content ?? "",
      model: data.model,
    });
  } catch (err) {
    return res.status(502).json({
      error: "Could not reach the model. Check your connection and try again.",
      detail: String(err).slice(0, 200),
    });
  }
}
