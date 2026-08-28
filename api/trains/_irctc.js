/**
 * IRCTC (RapidAPI) — journeys, live running, and ticket status.
 *
 * Two hosts are in play. `indian-railway-irctc` indexes trains by name or
 * number and carries the full timetable; `irctc-train-api` answers the three
 * things a traveller actually asks on the day: what runs between these two
 * stations, where is my train, and is my seat confirmed.
 */

export const SEARCH_HOST = "indian-railway-irctc.p.rapidapi.com";
export const JOURNEY_HOST = "irctc-train-api.p.rapidapi.com";

export const callIrctc = async (host, path, extraHeaders = {}) => {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) {
    const err = new Error("Train search is not configured — RAPIDAPI_KEY is missing.");
    err.status = 503;
    throw err;
  }

  const upstream = await fetch(`https://${host}/${path}`, {
    headers: {
      "x-rapidapi-key": key,
      "x-rapidapi-host": host,
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });

  if (!upstream.ok) {
    const body = (await upstream.text()).slice(0, 200);
    const err = new Error("IRCTC did not answer. Try again in a moment.");
    err.status = upstream.status === 429 ? 429 : 502;
    err.quotaExhausted = /MONTHLY quota/i.test(body);
    throw err;
  }

  const body = await upstream.json();
  // The journey host answers 200 with status:false and an error string.
  if (body?.status === false) {
    const err = new Error(body.error || "IRCTC could not answer that.");
    err.status = 400;
    throw err;
  }
  return body;
};

export const failTrains = (res, err) => {
  const status = err.status || 502;
  return res.status(status).json({
    error: err.quotaExhausted
      ? "Live train data has used up this month's quota."
      : err.message || "Could not reach IRCTC.",
  });
};

/** IRCTC wants DD-MM-YYYY; the app speaks ISO everywhere else. */
export const toIrctcDate = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ""));
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
};

/** "12:05 PM" → "12:05"; the rest of the app shows 24-hour times. */
export const to24h = (value) => {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(String(value || "").trim());
  if (!m) return String(value || "").trim() || null;
  let hour = Number(m[1]) % 12;
  if (/PM/i.test(m[3])) hour += 12;
  return `${String(hour).padStart(2, "0")}:${m[2]}`;
};

/**
 * The journey endpoint returns station labels with the code, a role and a
 * distance run together: "C Shivaji Mah T (CSMT)Starting station4km from MMCT".
 */
export const parseStationLabel = (raw) => {
  const text = String(raw || "");
  const code = /\(([A-Z0-9]{2,8})\)/.exec(text)?.[1] || null;
  const name = text.split("(")[0].trim() || null;
  const note = text.split(")").slice(1).join(")").trim();
  return {
    code,
    name,
    note: note.replace(/([a-z])([A-Z])/g, "$1 · $2").replace(/(\d+km)/, " · $1") || null,
  };
};
