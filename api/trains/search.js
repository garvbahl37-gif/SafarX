/**
 * Train search — IRCTC's index, via RapidAPI.
 *
 * The subscribed plan exposes one endpoint: a lookup by train number or name.
 * It answers with the train's whole timetable, so a search returns the route
 * as well as the ends. There is no station-to-station search on this plan
 * (that lives behind a different, unsubscribed API), so nothing here pretends
 * to offer one.
 */

const HOST = "indian-railway-irctc.p.rapidapi.com";
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** "YYYYYYY" — one flag per weekday, starting Monday. */
const runsOn = (flags = "") =>
  DAYS.filter((_, i) => String(flags)[i] === "Y");

/** "17:00" and "08:32" on day 2 → "15h 32m". */
const duration = (schedule = []) => {
  const first = schedule[0];
  const last = schedule[schedule.length - 1];
  if (!first?.departureTime || !last?.arrivalTime) return null;
  const mins = (t) => {
    const [h, m] = String(t).split(":").map(Number);
    return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null;
  };
  const start = mins(first.departureTime);
  const end = mins(last.arrivalTime);
  if (start == null || end == null) return null;
  const days = Math.max(0, Number(last.dayCount || 1) - Number(first.dayCount || 1));
  const total = end - start + days * 1440;
  if (total <= 0) return null;
  return `${Math.floor(total / 60)}h ${String(total % 60).padStart(2, "0")}m`;
};

const halt = (s) => (s.haltTime && s.haltTime !== "--" ? s.haltTime.slice(0, 5) : null);
const time = (t) => (t && t !== "--" ? t : null);

export default async function handler(req, res) {
  const query = String(req.query.query || "").trim();
  if (query.length < 2) return res.status(200).json({ data: [] });

  const key = process.env.RAPIDAPI_KEY;
  if (!key) {
    return res.status(503).json({ error: "Train search is not configured — RAPIDAPI_KEY is missing." });
  }

  try {
    const upstream = await fetch(
      `https://${HOST}/api/trains-search/v1/train/${encodeURIComponent(query)}?startDay=1&isH5=true&client=web`,
      { headers: { "x-rapidapi-key": key, "x-rapidapi-host": HOST, "x-rapid-api": "rapid-api-database" } }
    );

    if (!upstream.ok) {
      const body = (await upstream.text()).slice(0, 200);
      return res.status(upstream.status === 429 ? 429 : 502).json({
        error: /MONTHLY quota/i.test(body)
          ? "Live train data has used up this month's quota."
          : "IRCTC did not answer. Try again in a moment.",
      });
    }

    const body = await upstream.json();
    const rows = (body.body || []).flatMap((section) => section.trains || []);

    const data = rows.map((t) => {
      const schedule = (t.schedule || []).map((s) => ({
        code: s.stationCode,
        name: s.stationName,
        arrival: time(s.arrivalTime),
        departure: time(s.departureTime),
        halt: halt(s),
        km: Number(s.distance || 0),
        day: Number(s.dayCount || 1),
      }));
      const first = schedule[0];
      const last = schedule[schedule.length - 1];

      return {
        number: t.trainNumber,
        name: t.trainName,
        from: { code: t.stationFrom, name: t.origin, time: first?.departure || null },
        to: { code: t.stationTo, name: t.destination, time: last?.arrival || null },
        duration: duration(t.schedule),
        distance: last?.km || null,
        nights: last ? Math.max(0, last.day - 1) : 0,
        runsOn: runsOn(t.runningOn),
        daily: String(t.runningOn) === "YYYYYYY",
        classes: t.journeyClasses || [],
        stops: schedule.length,
        schedule,
      };
    });

    // A timetable is stable for the day; caching keeps the quota for real searches.
    res.setHeader("Cache-Control", "public, s-maxage=21600, stale-while-revalidate=86400");
    return res.status(200).json({ data });
  } catch (err) {
    return res.status(502).json({
      error: "Could not reach IRCTC.",
      detail: String(err).slice(0, 200),
    });
  }
}
