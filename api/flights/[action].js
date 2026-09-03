import { airport } from "./_airports.js";
import { rateLimit, clientIp } from "../trains/_ratelimit.js";

/**
 * Flight status, from Aviation Stack.
 *
 * The key used to be VITE_AVIATION_STACK_API_KEY, which Vite compiles into
 * the client bundle — anyone who opened devtools could read it and spend the
 * ten thousand calls this account gets each month. It is read from the server
 * environment here and never leaves it.
 *
 * One thing this cannot do, and does not pretend to: the free plan returns no
 * live aircraft positions. Checked against twenty flights with status
 * "active" — every one came back with a null `live` block. So this is a
 * status board, not a radar. Where a position is shown at all it is derived
 * from the schedule and labelled as an estimate, because a dot drawn on a map
 * looks like a measurement whether or not it is one.
 */

const BASE = "https://api.aviationstack.com/v1";

/* A flight's status changes on the order of minutes, and the quota is small.
   Two people checking the same flight inside the same minute should cost one
   request, not two. */
const TTL = 90_000;
const cache = new Map();

const cached = (key, load) => {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.value;
  const value = load().catch((err) => {
    cache.delete(key);
    throw err;
  });
  cache.set(key, { at: Date.now(), value });
  return value;
};

const call = async (path) => {
  const key = process.env.AVIATIONSTACK_API_KEY;
  if (!key) throw Object.assign(new Error("Flight tracking is not configured."), { status: 503 });

  const res = await fetch(`${BASE}${path}&access_key=${encodeURIComponent(key)}`);
  const body = await res.json().catch(() => ({}));

  if (body?.error) {
    /* Their own codes say more than the HTTP status: usage_limit_reached is a
       real answer, not an outage. */
    const code = body.error.code || body.error.type;
    const message =
      code === "usage_limit_reached" || code === "rate_limit_reached"
        ? "This month's flight lookups are used up."
        : body.error.message || body.error.info || "Flight data is not coming through.";
    throw Object.assign(new Error(message), { status: res.status || 502, code });
  }
  if (!res.ok) throw Object.assign(new Error(`Aviation Stack returned ${res.status}.`), { status: res.status });
  return body;
};

/** Minutes between two ISO timestamps, or null if either is missing. */
const minutesBetween = (a, b) => {
  if (!a || !b) return null;
  const diff = (new Date(b).getTime() - new Date(a).getTime()) / 60000;
  return Number.isFinite(diff) ? Math.round(diff) : null;
};

const shapeEnd = (end) => {
  const known = airport(end?.iata);
  return {
    iata: end?.iata || null,
    icao: end?.icao || null,
    name: end?.airport || known?.name || null,
    /* Coordinates come from the baked table; the flights response has none. */
    lat: known?.lat ?? null,
    lng: known?.lng ?? null,
    country: known?.country || null,
    terminal: end?.terminal || null,
    gate: end?.gate || null,
    baggage: end?.baggage || null,
    scheduled: end?.scheduled || null,
    estimated: end?.estimated || null,
    actual: end?.actual || null,
    delayMinutes: typeof end?.delay === "number" ? end.delay : null,
    timezone: end?.timezone || null,
  };
};

/**
 * Roughly where the aircraft is, worked out from the clock rather than
 * measured. Only ever returned for a flight that is actually in the air, and
 * always alongside `estimated: true` so the map can say so.
 */
const estimatePosition = (from, to, status) => {
  if (status !== "active") return null;
  if (from.lat == null || to.lat == null) return null;

  const off = from.actual || from.estimated || from.scheduled;
  const on = to.estimated || to.scheduled;
  const total = minutesBetween(off, on);
  if (!total || total <= 0) return null;

  const elapsed = minutesBetween(off, new Date().toISOString());
  if (elapsed == null) return null;
  const t = Math.max(0, Math.min(1, elapsed / total));

  /* Great-circle interpolation. A straight line in latitude and longitude
     bends the wrong way over any distance worth flying. */
  const rad = Math.PI / 180;
  const [lat1, lon1, lat2, lon2] = [from.lat * rad, from.lng * rad, to.lat * rad, to.lng * rad];
  const d = 2 * Math.asin(Math.sqrt(
    Math.sin((lat2 - lat1) / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2
  ));
  if (!d) return null;

  const A = Math.sin((1 - t) * d) / Math.sin(d);
  const B = Math.sin(t * d) / Math.sin(d);
  const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
  const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
  const z = A * Math.sin(lat1) + B * Math.sin(lat2);

  return {
    lat: +(Math.atan2(z, Math.sqrt(x * x + y * y)) / rad).toFixed(4),
    lng: +(Math.atan2(y, x) / rad).toFixed(4),
    progress: +t.toFixed(3),
    minutesRemaining: Math.max(0, total - elapsed),
    /* Said plainly, and carried all the way to the screen. */
    estimated: true,
  };
};

const shapeFlight = (f) => {
  const from = shapeEnd(f.departure);
  const to = shapeEnd(f.arrival);
  return {
    date: f.flight_date || null,
    status: f.flight_status || null,
    number: f.flight?.iata || f.flight?.icao || null,
    airline: { name: f.airline?.name || null, iata: f.airline?.iata || null },
    aircraft: f.aircraft?.iata || f.aircraft?.icao || null,
    from,
    to,
    /* The API's own live block, when it exists. It does not on this plan. */
    live: f.live
      ? {
          lat: f.live.latitude, lng: f.live.longitude,
          altitude: f.live.altitude, speed: f.live.speed_horizontal,
          direction: f.live.direction, onGround: f.live.is_ground,
          estimated: false,
        }
      : estimatePosition(from, to, f.flight_status),
    durationMinutes: minutesBetween(
      from.scheduled, to.scheduled
    ),
  };
};

/** One flight by its IATA number, e.g. AI302 or 6E2341. */
const trackFlight = async (req, res) => {
  const number = String(req.query?.flight || "").trim().toUpperCase().replace(/\s+/g, "");
  if (!/^[A-Z0-9]{2,3}\d{1,4}$/.test(number)) {
    return res.status(400).json({ error: "Give a flight number like AI302 or 6E2341." });
  }

  const body = await cached(`flight:${number}`, () =>
    call(`/flights?flight_iata=${encodeURIComponent(number)}&limit=6`)
  );

  const flights = (body.data || []).map(shapeFlight).filter((f) => f.number);
  if (!flights.length) {
    return res.status(404).json({ error: `Nothing scheduled for ${number} right now.` });
  }

  /* Newest first, so today's leg leads rather than last week's. */
  flights.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  return res.status(200).json({ flights, liveDataAvailable: flights.some((f) => f.live && !f.live.estimated) });
};

/** Departures or arrivals for an airport, e.g. DEL. */
const airportBoard = async (req, res) => {
  const iata = String(req.query?.airport || "").trim().toUpperCase();
  const direction = req.query?.direction === "arrival" ? "arr" : "dep";
  if (!/^[A-Z]{3}$/.test(iata)) {
    return res.status(400).json({ error: "Give an airport code like DEL or BOM." });
  }

  const body = await cached(`board:${direction}:${iata}`, () =>
    call(`/flights?${direction}_iata=${iata}&limit=20`)
  );

  const flights = (body.data || []).map(shapeFlight).filter((f) => f.number);
  res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=600");
  return res.status(200).json({ airport: airport(iata), direction, flights });
};

const ROUTES = { track: trackFlight, board: airportBoard };

export default async function handler(req, res) {
  const action = req.query?.action || req.url.split("?")[0].split("/").pop();
  const route = ROUTES[action];
  if (!route) return res.status(404).json({ error: `No flights endpoint called "${action}".` });

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: `${req.method} is not allowed here.` });
  }

  /* The quota is the scarce thing here, not our CPU. */
  const burst = rateLimit(`flights:${clientIp(req)}`, { limit: 20, windowMs: 60_000 });
  if (!burst.ok) {
    res.setHeader("Retry-After", String(burst.retryAfter));
    return res.status(429).json({ error: "Too many lookups from this connection." });
  }

  try {
    return await route(req, res);
  } catch (err) {
    return res.status(err.status || 502).json({ error: err.message || "Flight data is unavailable." });
  }
}
