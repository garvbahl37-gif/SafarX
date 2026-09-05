/**
 * Itinerary generation, moved off the browser.
 *
 * The planner used to call Gemini straight from `aiService.js` with
 * `import.meta.env.VITE_GEMINI_API_KEY`. That key was never set — and setting it
 * would have been the wrong fix twice over. Vite only exposes `VITE_` variables
 * by writing them into the client bundle, so the key would have shipped to every
 * visitor, readable in devtools and spendable by anyone; and `api/_server.js`
 * already states the rule this project runs on, that a secret must never take a
 * VITE_ prefix or reach the client. So the call happens here instead.
 *
 * The prompt is built server-side from the brief rather than accepted ready-made
 * from the page. A `{ prompt }` endpoint is an open Gemini proxy on the app's
 * quota: anyone could point it at anything. Taking only the fields the planner
 * collects keeps what is spent to what the planner is for.
 */

import { rateLimit, clientIp } from "./trains/_ratelimit.js";

const MODEL = "gemini-2.5-flash";
const ENDPOINT = (model) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

const season = (month) => {
  if ([12, 1, 2].includes(month)) return "winter";
  if ([3, 4, 5].includes(month)) return "summer";
  if ([6, 7, 8, 9].includes(month)) return "monsoon";
  return "autumn";
};

/** Trim anything free-text before it reaches the model. */
const clean = (value, max = 200) => String(value ?? "").slice(0, max).trim();

function buildPrompt(brief) {
  const {
    destination, state, startDate, endDate, startTime, endTime,
    pace, travelStyle, interests, travellers, budget, specialRequests,
  } = brief;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.max(1, Math.min(30, Math.ceil((end - start) / 86400000) + 1));
  const when = season(start.getMonth() + 1);
  /* Every destination in SafarX is Indian — that is a hard rule of the design
     system, and the prompt used to say "expert global travel planner" and offer
     to pick anywhere in the world, which is how a trip to Lisbon could come
     back from an app whose whole claim is Incredible India. */
  const where = clean(destination) || clean(state) || "";

  return {
    days,
    prompt: `You are an expert Indian travel planner. Create a detailed ${days}-day itinerary${
      where ? ` for ${where}` : " for an Indian destination you choose"
    } during ${when}.

TRIP PARAMETERS
- Dates: ${clean(startDate, 40)} to ${clean(endDate, 40)} (${days} days)
- Active hours: ${clean(startTime, 12) || "09:00"} to ${clean(endTime, 12) || "20:00"}
- Pace: ${clean(pace, 40) || "Moderate"}
- Travel style: ${clean(travelStyle, 60) || "Balanced"}
- Interests: ${clean(interests, 300) || "General sightseeing"}
- Group: ${clean(travellers, 120) || "Adults"}
- Budget: ${budget ? `₹${clean(budget, 20)} total` : "Flexible"}
- Special requests: ${clean(specialRequests, 400) || "None"}

REQUIREMENTS
1. Return ONLY valid JSON. No prose, no markdown fences.
2. Every destination and activity must be in India. Never suggest anywhere outside India.
3. Honour the '${clean(pace, 40) || "Moderate"}' pace and the stated interests.
4. Keep activities appropriate for the group, including children and seniors where named.
5. All costs in INR, as plain numbers.
6. Use exactly this shape:
{
  "selectedState": "Destination name",
  "recommendationReason": "Why this place suits this season",
  "tripSummary": "Short overview honouring the pace and style",
  "days": [
    {
      "dayNumber": 1,
      "date": "YYYY-MM-DD",
      "theme": "Theme of the day",
      "activities": [
        {
          "startTime": "HH:MM",
          "endTime": "HH:MM",
          "title": "Activity name",
          "shortDescription": "One sentence",
          "location": "Specific place",
          "estimatedCostINR": 500,
          "duration": "2 hours"
        }
      ]
    }
  ],
  "costBreakdown": { "totalEstimatedCostINR": 15000, "costPerDayAverage": 3000 },
  "travelTips": ["Tip 1", "Tip 2"]
}`,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST." });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(503).json({
      error: "The planner is not configured — GEMINI_API_KEY is missing on the server.",
    });
  }

  /* Writing an itinerary is the most expensive call the app makes. */
  const burst = rateLimit(`itinerary:${clientIp(req)}`, { limit: 8, windowMs: 60_000 });
  if (!burst.ok) {
    res.setHeader("Retry-After", String(burst.retryAfter));
    return res.status(429).json({ error: "Give the planner a moment to catch up." });
  }

  const brief = req.body || {};
  if (!brief.startDate || !brief.endDate) {
    return res.status(400).json({ error: "A start and end date are needed." });
  }

  const { prompt } = buildPrompt(brief);

  const ask = () =>
    fetch(`${ENDPOINT(MODEL)}?key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.9, responseMimeType: "application/json" },
      }),
    });

  try {
    /* Gemini answers 503 UNAVAILABLE when the model is briefly oversubscribed,
       and says so itself: spikes are temporary. That is worth waiting out here
       rather than showing the traveller a failure they can only fix by pressing
       the same button again — a whole itinerary is a slow thing to lose. */
    let upstream = await ask();
    for (let attempt = 0; upstream.status === 503 && attempt < 2; attempt += 1) {
      await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)));
      upstream = await ask();
    }

    if (!upstream.ok) {
      const detail = await upstream.text();
      console.error("[itinerary] upstream", upstream.status, detail.slice(0, 300));
      /* Name the side that failed. "Please try again" against a disabled key
         sends someone round the same loop forever. */
      if (upstream.status === 503) {
        return res.status(503).json({
          error: "Gemini is busy right now — give it a minute and try again.",
        });
      }
      if (upstream.status === 429) {
        return res.status(429).json({ error: "The planner has hit its rate limit for the moment." });
      }
      if (upstream.status === 400 || upstream.status === 403) {
        return res.status(502).json({
          error: "The planner's API key was rejected — check GEMINI_API_KEY on the server.",
        });
      }
      return res.status(502).json({ error: "The planner could not be reached." });
    }

    const data = await upstream.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
    if (!text.trim()) {
      return res.status(502).json({ error: "The planner returned nothing." });
    }

    /* `responseMimeType: application/json` makes fences unlikely, not
       impossible — the model still occasionally wraps its answer. */
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    let itinerary;
    try {
      itinerary = JSON.parse(cleaned);
    } catch {
      console.error("[itinerary] unparseable:", cleaned.slice(0, 300));
      return res.status(502).json({ error: "The planner's answer could not be read." });
    }

    return res.status(200).json(itinerary);
  } catch (err) {
    console.error("[itinerary]", err);
    return res.status(502).json({ error: "The planner could not be reached." });
  }
}
