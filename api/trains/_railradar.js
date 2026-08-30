/**
 * RailRadar — live running status and seat availability.
 *
 * Added because the two things travellers actually ask about were the two
 * things SafarX could not answer. Live status ran on a RapidAPI plan whose
 * monthly quota is spent, and seat availability did not exist at all.
 *
 * The quota here is small — a thousand requests a month on the free plan, and
 * sixty a minute — so this is used only where nothing else can answer. Trains
 * between two stations keeps running off the baked-in timetable, which costs
 * nothing, answers instantly and does not run out.
 *
 * Responses are cached in the instance for a couple of minutes. A running
 * train's position is worthless when stale, but two people asking about the
 * same Rajdhani inside the same minute should not cost two requests out of a
 * thousand.
 */

const BASE = "https://railradar.in/api/v1";

/** Live positions go stale fast; a seat calendar does not move by the minute. */
const TTL = { live: 60_000, seats: 15 * 60_000, between: 60 * 60_000 };

const cache = new Map();

const cached = (key, ttl, load) => {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttl) return hit.value;
  const value = load().catch((err) => {
    cache.delete(key);
    throw err;
  });
  cache.set(key, { at: Date.now(), value });
  return value;
};

const call = async (path) => {
  const key = process.env.RAILRADAR_API_KEY;
  if (!key) throw Object.assign(new Error("RailRadar is not configured."), { status: 503 });

  const res = await fetch(`${BASE}${path}`, { headers: { "X-API-Key": key } });
  const body = await res.json().catch(() => ({}));

  if (!res.ok || body?.success === false) {
    const code = body?.error?.code;
    const message = body?.error?.message || `RailRadar returned ${res.status}.`;
    /* Their own upstream codes are more useful than a generic failure — a
       flushed PNR is a real answer, not an outage. */
    throw Object.assign(new Error(message), { status: res.status, code });
  }
  return body.data;
};

/** Where a train is now, and how late. */
export const liveStatus = (trainNo) =>
  cached(`live:${trainNo}`, TTL.live, () => call(`/trains/${trainNo}/live`));

/**
 * A fourteen-day seat calendar for one class and quota.
 * @param {string} trainNo five digits
 * @param {object} leg from, to, date (YYYY-MM-DD), classCode, quota
 */
export const seatCalendar = (trainNo, { from, to, date, classCode = "SL", quota = "GN" }) =>
  cached(
    `seats:${trainNo}:${from}:${to}:${date}:${classCode}:${quota}`,
    TTL.seats,
    () =>
      call(
        `/trains/${trainNo}/seats?journeyDate=${encodeURIComponent(date)}` +
          `&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}` +
          `&classCode=${encodeURIComponent(classCode)}&quota=${encodeURIComponent(quota)}`
      )
  );

/** Everything running between two stations, live rather than from the bake. */
export const trainsBetween = (from, to) =>
  cached(`between:${from}:${to}`, TTL.between, () =>
    call(`/trains/between/${encodeURIComponent(from)}/${encodeURIComponent(to)}`)
  );

/* ── Shaping ────────────────────────────────────────────────────────── */

/** Onto the shape the live panel already renders. */
export const shapeLive = (d, trainNo) => ({
  number: d.trainNumber || trainNo,
  name: d.trainName || null,
  from: { code: d.train?.source?.code || null, name: d.train?.source?.name || null },
  to: { code: d.train?.destination?.code || null, name: d.train?.destination?.name || null },
  startDate: d.startDate || null,
  runsOn: d.train?.runDays || [],
  status: {
    // "not-started" is a real state, not a missing one.
    state: d.status || null,
    live: Boolean(d.isLive),
    delayMinutes: typeof d.delayMinutes === "number" ? d.delayMinutes : null,
    updatedAt: d.lastUpdatedAt || null,
    at: d.currentLocation?.stationName || d.currentLocation?.station?.name || null,
    next: d.nextHalt?.stationName || d.nextHalt?.station?.name || null,
    nextAt: d.nextHalt?.expectedArrival || d.nextHalt?.scheduledArrival || null,
  },
  route: (d.route || []).map((s) => ({
    code: s.station?.code || s.stationCode || null,
    name: s.station?.name || s.stationName || null,
    scheduled: s.scheduledArrival || s.scheduledDeparture || null,
    actual: s.actualArrival || s.actualDeparture || null,
    delayMinutes: typeof s.delayMinutes === "number" ? s.delayMinutes : null,
    day: s.day ?? null,
  })),
  source: "railradar",
});

/** The seat calendar, as days a traveller can scan. */
export const shapeSeats = (d) => ({
  number: d.trainNumber,
  name: d.trainName,
  classCode: d.classCode,
  quota: d.quotaCode,
  generatedAt: d.generatedAt,
  days: (d.calendar || []).map((c) => ({
    date: c.date,
    status: c.status,
    code: c.statusCode,
    available: Boolean(c.isAvailable),
    seats: typeof c.availableSeats === "number" ? c.availableSeats : null,
  })),
});
