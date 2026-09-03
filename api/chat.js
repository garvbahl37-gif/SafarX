import { rateLimit, clientIp } from "./trains/_ratelimit.js";

/**
 * The SafarX Agent's chat, streamed.
 *
 * The agent used to post to a HuggingFace Space, which answered in about
 * eleven seconds warm and twenty-three cold, and answered all at once — so
 * the traveller watched a blank panel for the whole of it. Measured, not
 * guessed: 22.7s on a cold call, 11.2s on the next one.
 *
 * Nothing here makes a large model think faster. What it does is stop hiding
 * the answer until the model has finished: the first words now land in under
 * two seconds and the rest arrive as they are written, which is the whole
 * difference between waiting and reading.
 *
 * This replaces the Groq route that used to live at this path, whose model
 * (llama-3.3-70b-versatile) Groq has since decommissioned — every call was
 * returning a 404. Reusing the file matters: Vercel's Hobby plan allows
 * twelve functions and SafarX has twelve.
 */

const OLLAMA_URL = "https://ollama.com/api/chat";

/* gpt-oss:120b, chosen by measurement rather than by size. Against the same
   prompt it reached its first token in 1.7s where the 20b took 8.7s — the
   smaller model spends longer reasoning before it commits to a word — and it
   wrote a better answer in half the total time. The rest of the catalogue
   (glm, kimi, deepseek, qwen) returns 402 on this key. */
const MODEL = process.env.OLLAMA_MODEL || "gpt-oss:120b";

const SYSTEM = `You are the SafarX Agent, a travel companion for India.

Answer like someone who has actually been there. Be specific: name the road,
the station, the hour of day worth going. Give real prices in rupees and say
when a price is a rough one. If you do not know something — an entry fee, a
timing that changes seasonally — say so rather than inventing it.

Keep it tight. Short paragraphs, and a list only when the content is genuinely
a list. Use markdown headings for anything longer than a few lines. Never open
with "Certainly!" or "Great question" — start with the answer.

You cover India. If asked about somewhere else, say so and offer the closest
Indian equivalent. You can search and suggest, but you never book or pay for
anything; for that, point at the booking panels in the app.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: `${req.method} is not allowed here.` });
  }

  const key = process.env.OLLAMA_API_KEY;
  if (!key) {
    return res.status(503).json({ error: "The agent is not configured on this deployment." });
  }

  const burst = rateLimit(`chat:${clientIp(req)}`, { limit: 20, windowMs: 60_000 });
  if (!burst.ok) {
    res.setHeader("Retry-After", String(burst.retryAfter));
    return res.status(429).json({ error: "That is a lot of questions at once. Give it a minute." });
  }

  const { messages = [] } = req.body || {};
  if (!Array.isArray(messages) || !messages.length) {
    return res.status(400).json({ error: "Send at least one message." });
  }

  /* Only the last few turns go upstream. The whole transcript would grow the
     prompt without bound, and prompt length is the one part of time-to-first
     token we control. */
  const history = messages
    .filter((m) => m && typeof m.content === "string" && m.content.trim())
    .slice(-12)
    .map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content).slice(0, 8000),
    }));

  let upstream;
  try {
    upstream = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: SYSTEM }, ...history],
        stream: true,
      }),
    });
  } catch {
    return res.status(502).json({ error: "Could not reach the model. Check your connection." });
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    return res.status(upstream.status || 502).json({
      error: "The model could not answer that. Try again in a moment.",
      detail: detail.slice(0, 300),
    });
  }

  /* Server-sent events. The no-transform matters on Vercel: without it a
     proxy is free to buffer the whole response and hand it over at the end,
     which would undo the entire point of streaming. */
  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  const send = (event) => res.write(`data: ${JSON.stringify(event)}\n\n`);

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      /* Ollama streams newline-delimited JSON, and a chunk can split a line
         in half — so keep the tail until its newline arrives. */
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.trim()) continue;
        let parsed;
        try {
          parsed = JSON.parse(line);
        } catch {
          continue;
        }

        /* gpt-oss reasons out loud on a separate channel before it answers.
           That is worth showing as a state — the panel can say it is
           thinking — but it is not the reply and must never be pasted into
           one. */
        const thinking = parsed.message?.thinking;
        if (thinking) send({ type: "thinking" });

        const content = parsed.message?.content;
        if (content) send({ type: "token", value: content });

        if (parsed.done) {
          send({ type: "done", model: parsed.model, tokens: parsed.eval_count ?? null });
        }
      }
    }
  } catch {
    send({ type: "error", message: "The answer stopped part way. Send that again." });
  }

  res.end();
}
