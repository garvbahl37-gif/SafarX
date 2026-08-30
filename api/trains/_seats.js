import { seatCalendar, shapeSeats } from "./_railradar.js";
import { rateLimit, clientIp } from "./_ratelimit.js";

/**
 * Whether there is actually a seat, for the next fortnight.
 *
 * The question every traveller asks after "which train" and the one SafarX
 * could never answer. One request covers fourteen days, which is what makes
 * it affordable on a thousand-a-month quota.
 */
export default async function handler(req, res) {
  const burst = rateLimit(`seats:${clientIp(req)}`, { limit: 15, windowMs: 60_000 });
  if (!burst.ok) {
    res.setHeader("Retry-After", String(burst.retryAfter));
    return res.status(429).json({ error: "Too many searches from this connection. Try again shortly." });
  }

  const { trainNo, from, to, date, classCode = "SL", quota = "GN" } = req.query || {};
  if (!/^\d{5}$/.test(String(trainNo || ""))) {
    return res.status(400).json({ error: "A five-digit train number is required." });
  }
  if (!from || !to || !date) {
    return res.status(400).json({ error: "A journey needs a from, a to and a date." });
  }

  try {
    const data = shapeSeats(await seatCalendar(trainNo, { from, to, date, classCode, quota }));
    // A seat calendar is worth caching at the edge; it does not move by the minute.
    res.setHeader("Cache-Control", "public, s-maxage=900, stale-while-revalidate=3600");
    return res.status(200).json({ data });
  } catch (err) {
    return res
      .status(err.status === 503 ? 503 : 502)
      .json({ error: err.message || "Seat availability is not coming through." });
  }
}
