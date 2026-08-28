/**
 * Shared plumbing for the Booking.com (RapidAPI) stay endpoints.
 *
 * The RapidAPI key stays server-side. A VITE_ prefixed key would be inlined
 * into the client bundle, so the browser only ever talks to /api/stays/*.
 */

const HOST = "booking-com15.p.rapidapi.com";

export const callBooking = async (path, params) => {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) {
    const err = new Error("RAPIDAPI_KEY is missing on the server.");
    err.status = 503;
    throw err;
  }

  const qs = new URLSearchParams(
    Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== ""
    )
  );

  const upstream = await fetch(`https://${HOST}/api/v1/${path}?${qs}`, {
    headers: { "x-rapidapi-key": key, "x-rapidapi-host": HOST },
  });

  if (!upstream.ok) {
    const body = (await upstream.text()).slice(0, 300);
    const err = new Error(`Booking.com replied ${upstream.status}.`);
    err.status = upstream.status === 429 ? 429 : 502;
    // RapidAPI answers 429 both for a burst and for an exhausted plan; only
    // the body distinguishes them, and they need different advice.
    err.quotaExhausted = /exceeded the MONTHLY quota/i.test(body);
    err.detail = body;
    throw err;
  }

  return upstream.json();
};

/** Rupee formatting, rounded — fares move too much for paise to mean anything. */
export const formatMoney = (value, currency = "INR") => {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${Math.round(value)}`;
  }
};

export const fail = (res, err) => {
  const status = err.status || 502;
  const message = err.quotaExhausted
    ? "Live stay data has used up this month's Booking.com quota. It returns when the plan resets, or sooner on a larger plan."
    : status === 429
      ? "Too many searches just now — wait a few seconds and try again."
      : err.message || "Could not reach Booking.com.";
  return res.status(status).json({ error: message, quotaExhausted: Boolean(err.quotaExhausted) });
};
