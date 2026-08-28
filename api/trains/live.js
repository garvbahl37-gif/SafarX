import { callIrctc, failTrains, JOURNEY_HOST } from "./_irctc.js";

/**
 * Where a train is right now, and how late.
 *
 * Nothing here is cached: a running position is worthless a few minutes old.
 */
export default async function handler(req, res) {
  const trainNo = String(req.query.trainNo || "").trim();
  const startDay = String(req.query.startDay || "1");

  if (!/^\d{5}$/.test(trainNo)) {
    return res.status(400).json({ error: "A five-digit train number is required." });
  }

  try {
    const body = await callIrctc(
      JOURNEY_HOST,
      `api/v1/live-train-status?trainNo=${trainNo}&startDay=${encodeURIComponent(startDay)}`
    );

    const t = body.trainDetails || {};
    const s = body.liveStatus || {};

    const data = {
      number: t.number || trainNo,
      name: t.name || null,
      from: { code: t.source?.code || null, name: t.source?.name || null },
      to: { code: t.destination?.code || null, name: t.destination?.name || null },
      startDate: t.startDate || null,
      runsOn: t.runDays || [],
      status: {
        message: s.currentMessage || null,
        lastUpdated: s.lastUpdated || null,
        delayMinutes: typeof s.delayInMinutes === "number" ? s.delayInMinutes : null,
        atStation: s.currentStation?.name
          ? { name: String(s.currentStation.name).replace(/~$/, ""), code: s.currentStation.code || null, state: s.currentStation.status || null }
          : null,
        kmFromSource: typeof s.distanceFromSourceKm === "number" ? s.distanceFromSourceKm : null,
        terminated: Boolean(s.isTerminated),
      },
      route: (body.route || []).map((r) => ({
        sequence: r.stationSequence,
        name: r.stationName,
        code: r.stationCode,
        scheduledArrival: r.scheduledArrivalTime || null,
        estimatedArrival: r.estimatedArrivalTime || null,
        scheduledDeparture: r.scheduledDepartureTime || null,
        estimatedDeparture: r.estimatedDepartureTime || null,
        km: r.distanceFromSource ?? null,
        day: r.dayCount ?? null,
      })),
    };

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ data });
  } catch (err) {
    return failTrains(res, err);
  }
}
