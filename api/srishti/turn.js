import { SRISHTI_SYSTEM, KAHANI_SYSTEM } from "./_persona.js";
import { TOOL_DECLARATIONS, runTool } from "./_tools.js";
import { rateLimit, clientIp } from "../trains/_ratelimit.js";

/**
 * One turn of a conversation with Srishti.
 *
 * The browser sends what the traveller said — as audio, or as text — and gets
 * back what she says, as audio, plus anything the app should do while she says
 * it.
 *
 * Why a turn endpoint and not the Live API's socket: the Live socket needs a
 * credential in the browser. Ephemeral tokens are the sanctioned way to do
 * that, and they mint fine on this key but Google refuses them at the socket
 * ("Method doesn't allow unregistered callers"), so the only thing that opens
 * a Live session here is the raw API key. Putting that in the bundle would
 * hand anyone the account. Everything below therefore runs server-side, and
 * the key never leaves it. Barge-in and true interruption are what this costs;
 * a WebSocket proxy is the upgrade path when it is worth the held connection.
 */

const API = "https://generativelanguage.googleapis.com/v1beta/models";
/* Free-tier quota is counted per model per day, so a spent one is not a spent
   account. She works down this list rather than going quiet. */
const BRAINS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-flash-latest"];
const MAX_TOOL_ROUNDS = 3;

const callGemini = async (model, body) => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    const err = new Error("Srishti is not configured — GEMINI_API_KEY is missing.");
    err.status = 503;
    throw err;
  }
  const res = await fetch(`${API}/${model}:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300);
    const err = new Error(
      /RESOURCE_EXHAUSTED|quota/i.test(detail)
        ? "Srishti has used up today's free Gemini quota. It resets tomorrow, or sooner with billing enabled."
        : "Srishti could not answer that just now."
    );
    err.status = res.status === 429 ? 429 : 502;
    err.exhausted = res.status === 429;
    throw err;
  }
  return res.json();
};

/** Asks the first model with quota left. */
const think = async (body) => {
  let last;
  for (const model of BRAINS) {
    try {
      return await callGemini(model, body);
    } catch (err) {
      last = err;
      if (!err.exhausted) throw err;
    }
  }
  throw last;
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST." });
  }

  /* Each turn costs a model call and a speech call. */
  const burst = rateLimit(`srishti:${clientIp(req)}`, { limit: 20, windowMs: 60_000 });
  if (!burst.ok) {
    res.setHeader("Retry-After", String(burst.retryAfter));
    return res.status(429).json({ error: "Give me a moment to catch up." });
  }

  const { audio, mimeType, text, history = [], mode = "chat" } = req.body || {};
  if (!audio && !text) {
    return res.status(400).json({ error: "Send speech or text." });
  }

  /* Her tools call this same deployment. Locally that is plain http. */
  const host = req.headers["x-forwarded-host"] || req.headers.host || "";
  const scheme = req.headers["x-forwarded-proto"] || (host.startsWith("localhost") ? "http" : "https");
  const origin = `${scheme}://${host}`;

  try {
    const said = audio
      ? [{ inlineData: { mimeType: mimeType || "audio/webm", data: audio } }]
      : [{ text }];

    const contents = [
      ...history.slice(-8).map((m) => ({
        role: m.role === "srishti" ? "model" : "user",
        parts: [{ text: m.text }],
      })),
      { role: "user", parts: said },
    ];

    const request = {
      contents,
      systemInstruction: { parts: [{ text: mode === "kahani" ? KAHANI_SYSTEM : SRISHTI_SYSTEM }] },
      tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
      generationConfig: { temperature: 0.85, maxOutputTokens: 800 },
    };

    /* She may need a tool, then another once she sees the answer. */
    const used = [];
    let navigate = null;
    let tourId = null;
    let reply = null;

    for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
      const out = await think(request);
      const parts = out.candidates?.[0]?.content?.parts || [];
      const calls = parts.filter((p) => p.functionCall).map((p) => p.functionCall);

      if (!calls.length) {
        reply = parts.map((p) => p.text).filter(Boolean).join(" ").trim();
        break;
      }

      request.contents.push({ role: "model", parts });
      const responses = [];
      for (const call of calls) {
        let result;
        try {
          result = await runTool(call.name, call.args || {}, { origin });
        } catch (err) {
          result = { error: String(err.message || err).slice(0, 120) };
        }
        used.push(call.name);
        if (result?.navigate) {
          navigate = result.navigate;
          tourId = result.tourId || null;
        }
        responses.push({ functionResponse: { name: call.name, response: { result } } });
      }
      request.contents.push({ role: "user", parts: responses });
    }

    if (!reply) reply = "Sorry — I lost my thread there. Ask me again?";

    /* Deliberately no audio here. Rendering her voice takes four times as
       long as working out what to say, and holding the words back until the
       sound is ready makes her feel slow. The browser shows this immediately,
       moves the app if she asked it to, and fetches the speech separately. */
    return res.status(200).json({
      text: reply,
      navigate,
      tourId,
      toolsUsed: used,
    });
  } catch (err) {
    return res.status(err.status || 502).json({
      error: err.message || "Srishti is not available right now.",
    });
  }
}
