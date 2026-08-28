import { callIrctc, failTrains, JOURNEY_HOST, toIrctcDate, to24h, parseStationLabel } from "./_irctc.js";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** "22 h 05 min" → "22h 05m", to match the rest of the app. */
const tidyDuration = (raw) => {
  const m = /(\d+)\s*h\s*(\d+)?\s*min?/i.exec(String(raw || ""));
  return m ? `${m[1]}h ${String(m[2] || 0).padStart(2, "0")}m` : (raw || null);
};

/**
 * Every train running between two stations on a date.
 *
 * This is the search a traveller actually starts from, and it needed a second
 * IRCTC subscription — the other host only indexes trains by name or number.
 */
export default async function handler(req, res) {
  const { from, to, date } = req.query;
  if (!from || !to) {
    return res.status(400).json({ error: "Both station codes are required." });
  }

  const journeyDate = toIrctcDate(date) || toIrctcDate(new Date().toISOString().slice(0, 10));

  try {
    const body = await callIrctc(
      JOURNEY_HOST,
      `api/v1/trains-between-stations?startStationCode=${encodeURIComponent(String(from).toUpperCase())}` +
        `&endStationCode=${encodeURIComponent(String(to).toUpperCase())}&date=${journeyDate}`
    );

    const rows = Array.isArray(body?.data) ? body.data : [];
    const data = rows.map((row) => {
      const schedule = row.schedule || {};
      const origin = parseStationLabel(schedule.origin?.code);
      const destination = parseStationLabel(schedule.destination?.code);
      const runs = schedule.runningDays || {};

      return {
        number: row.trainNumber,
        name: row.trainName,
        from: { code: origin.code, name: origin.name, note: origin.note, time: to24h(schedule.departureTime) },
        to: { code: destination.code, name: destination.name, note: destination.note, time: to24h(schedule.arrivalTime) },
        duration: tidyDuration(schedule.duration),
        runsOn: DAYS.filter((d) => runs[d]),
        daily: DAYS.every((d) => runs[d]),
        classes: (row.inventory || []).map((i) => i.classCode || i.code).filter(Boolean),
      };
    });

    // A timetable for a given date does not change through the day.
    res.setHeader("Cache-Control", "public, s-maxage=10800, stale-while-revalidate=86400");
    return res.status(200).json({ data, meta: { from, to, date: journeyDate, count: data.length } });
  } catch (err) {
    return failTrains(res, err);
  }
}
