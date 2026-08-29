import { callIrctc, failTrains, PNR_HOST } from "./_irctc.js";
import { rateLimit, clientIp } from "./_ratelimit.js";

/**
 * Ticket status for a PNR.
 *
 * The response carries passenger names, ages and seat numbers, so nothing
 * here is cached, logged or stored — it is read from the railway, handed to
 * the traveller who asked for it, and forgotten. `no-store` is on the
 * response for the same reason.
 */

/* "23-12-2023  22:05" → "23 Dec 2023, 22:05" */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const prettyDate = (raw) => {
  const m = /^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}:\d{2})/.exec(String(raw || "").trim());
  if (!m) return String(raw || "").trim() || null;
  return `${Number(m[1])} ${MONTHS[Number(m[2]) - 1]} ${m[3]}, ${m[4]}`;
};

export default async function handler(req, res) {
  const pnr = String(req.query.pnr || "").replace(/\s/g, "");
  if (!/^\d{10}$/.test(pnr)) {
    return res.status(400).json({ error: "A PNR is ten digits." });
  }

  /* Someone checking their own ticket does it a handful of times. Anything
     past that is walking the PNR space for other people's names. */
  const quota = rateLimit(`pnr:${clientIp(req)}`, { limit: 8, windowMs: 60_000 });
  if (!quota.ok) {
    res.setHeader("Retry-After", String(quota.retryAfter));
    return res.status(429).json({
      error: "Too many PNR checks from this connection. Try again in a minute.",
    });
  }

  try {
    const d = await callIrctc(PNR_HOST, `name/${pnr}`);

    if (d?.errorMsg) {
      return res.status(404).json({ error: String(d.errorMsg).slice(0, 200) });
    }

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
      data: {
        pnr: d.pnrNo || pnr,
        trainNumber: d.trainNum ?? null,
        trainName: d.trainName ?? null,
        journeyDate: prettyDate(d.departureDate),
        arrivalDate: prettyDate(d.arrivalDate),
        from: d.boardingPoint || d.stationFrom || null,
        to: d.reservationUpTo || d.stationTo || null,
        travelClass: d.journeyClass ?? null,
        chartPrepared: d.chartStts ?? null,
        passengers: (d.passengerDetailsDTO || []).map((p, i) => ({
          number: p.serialNo ?? i + 1,
          name: p.displayName || p.name || null,
          age: p.age || null,
          gender: p.gender || null,
          current: p.seatStts || null,
          booking: p.quotaCode || null,
          coach: p.coachNo || null,
          berth: p.seatNo || null,
        })),
      },
    });
  } catch (err) {
    return failTrains(res, err);
  }
}
