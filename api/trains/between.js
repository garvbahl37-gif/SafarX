import { createRequire } from "node:module";

/* Loaded through require so the JSON is traced into the deployed bundle and
   parsed once per cold start rather than on every request. */
const timetable = createRequire(import.meta.url)("./timetable.json");
import { STATIONS } from "../../src/data/indiaStations.js";
import { callIrctc, failTrains, JOURNEY_HOST, toIrctcDate, to24h, parseStationLabel } from "./_irctc.js";

/**
 * Every train between two stations.
 *
 * Answered from the timetable bundled with this function, not from a metered
 * API. Every train API within reach allows about fifty calls a month, which a
 * single afternoon of demoing exhausts — and a timetable does not need to be
 * live to be right. This costs nothing, never runs out, and answers in
 * milliseconds. The live endpoints stay on the API, where being live is the
 * entire point.
 *
 * The dataset predates the Vande Bharat and Tejas services, so when it finds
 * nothing the request still falls through to IRCTC.
 */

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/* Most Delhi-Jaipur trains leave from Sarai Rohilla or Old Delhi, not New
   Delhi: searching the one station a traveller picked returns 3 trains where
   the city has 42. A journey is between cities, so a chosen station carries
   its siblings with it. */
const cityOf = new Map(STATIONS.map((s) => [s.code, s.city]));
const siblings = new Map();
for (const s of STATIONS) {
  if (!siblings.has(s.city)) siblings.set(s.city, []);
  siblings.get(s.city).push(s.code);
}
const expandCity = (code) => siblings.get(cityOf.get(code)) || [code];

/* Built once per cold start, then reused across invocations. */
const codeToIndex = new Map(timetable.stations.map((s, i) => [s[0], i]));

const hhmm = (minutes) =>
  minutes == null ? null : `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

const spell = (minutes) =>
  minutes == null || minutes < 0 ? null : `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;

/** Minutes from one stop to another, carrying the day counter. */
const gap = (fromStop, toStop) => {
  const start = fromStop[2] ?? fromStop[1];
  const end = toStop[1] ?? toStop[2];
  if (start == null || end == null) return null;
  const days = Math.max(0, (toStop[3] || 1) - (fromStop[3] || 1));
  const total = end - start + days * 1440;
  return total > 0 ? total : total + 1440;
};

const searchTimetable = (fromCode, toCode) => {
  const origins = new Set(expandCity(fromCode).map((c) => codeToIndex.get(c)).filter((i) => i !== undefined));
  const targets = new Set(expandCity(toCode).map((c) => codeToIndex.get(c)).filter((i) => i !== undefined));
  if (!origins.size || !targets.size) return [];

  const found = [];
  for (const train of timetable.trains) {
    const fromAt = train.s.findIndex((stop) => origins.has(stop[0]));
    if (fromAt < 0) continue;
    const toAt = train.s.findIndex((stop, i) => i > fromAt && targets.has(stop[0]));
    if (toAt < 0) continue;

    const boarding = train.s[fromAt];
    const alighting = train.s[toAt];
    // Only count where it actually stops, not every point it runs through.
    let halts = 0;
    for (let i = fromAt + 1; i < toAt; i += 1) if (train.s[i][4]) halts += 1;
    const minutes = gap(boarding, alighting);

    found.push({
      number: train.n,
      name: train.t,
      from: { code: timetable.stations[boarding[0]][0], name: timetable.stations[boarding[0]][1], time: hhmm(boarding[2] ?? boarding[1]) },
      to: { code: timetable.stations[alighting[0]][0], name: timetable.stations[alighting[0]][1], time: hhmm(alighting[1] ?? alighting[2]) },
      duration: spell(minutes),
      minutes,
      stops: halts,
      nights: Math.max(0, (alighting[3] || 1) - (boarding[3] || 1)),
      classes: train.c || [],
      type: train.y || null,
      // A static timetable knows the run, not which weekdays it runs.
      runsOn: [],
      daily: false,
    });
  }

  return found.sort((x, y) => (x.minutes ?? 1e9) - (y.minutes ?? 1e9));
};

export default async function handler(req, res) {
  const { from, to, date } = req.query;
  if (!from || !to) {
    return res.status(400).json({ error: "Both station codes are required." });
  }

  const fromCode = String(from).toUpperCase();
  const toCode = String(to).toUpperCase();

  const local = searchTimetable(fromCode, toCode);
  if (local.length) {
    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
    return res.status(200).json({
      data: local,
      meta: { from: fromCode, to: toCode, count: local.length, source: "timetable" },
    });
  }

  /* Nothing in the bundled timetable — it may be a newer service. */
  try {
    const journeyDate = toIrctcDate(date) || toIrctcDate(new Date().toISOString().slice(0, 10));
    const body = await callIrctc(
      JOURNEY_HOST,
      `api/v1/trains-between-stations?startStationCode=${encodeURIComponent(fromCode)}` +
        `&endStationCode=${encodeURIComponent(toCode)}&date=${journeyDate}`
    );

    const data = (Array.isArray(body?.data) ? body.data : []).map((row) => {
      const schedule = row.schedule || {};
      const origin = parseStationLabel(schedule.origin?.code);
      const destination = parseStationLabel(schedule.destination?.code);
      const runs = schedule.runningDays || {};
      const m = /(\d+)\s*h\s*(\d+)?/i.exec(String(schedule.duration || ""));
      return {
        number: row.trainNumber,
        name: row.trainName,
        from: { code: origin.code, name: origin.name, time: to24h(schedule.departureTime) },
        to: { code: destination.code, name: destination.name, time: to24h(schedule.arrivalTime) },
        duration: m ? `${m[1]}h ${String(m[2] || 0).padStart(2, "0")}m` : null,
        stops: 0,
        nights: 0,
        classes: (row.inventory || []).map((i) => i.classCode || i.code).filter(Boolean),
        runsOn: DAY_NAMES.filter((d) => runs[d]),
        daily: DAY_NAMES.every((d) => runs[d]),
      };
    });

    return res.status(200).json({
      data,
      meta: { from: fromCode, to: toCode, count: data.length, source: "irctc" },
    });
  } catch (err) {
    if (err.quotaExhausted || err.status === 429) {
      return res.status(200).json({
        data: [],
        meta: { from: fromCode, to: toCode, count: 0, source: "timetable" },
      });
    }
    return failTrains(res, err);
  }
}
