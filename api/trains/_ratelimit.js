/**
 * A small per-IP rate limiter for the endpoints that are worth abusing.
 *
 * The PNR lookup is the reason this exists. It takes a ten-digit number and
 * returns a real passenger's name, age and berth, and it sits on a public URL
 * with no sign-in — so without a limit it is an open tool for harvesting
 * personal data by walking the PNR space, and for draining the API quota
 * while doing it. The railway's own lookup puts a captcha in front of that;
 * this is the cheapest equivalent.
 *
 * State is per instance, so it is a speed bump rather than a wall — a
 * distributed store would be the real answer if this ever left demo scale.
 * It still turns "script a million lookups" into something that needs
 * distributed effort, and it protects the quota, which is what actually
 * breaks first.
 */

const buckets = new Map();

/** Trust the platform's own header before anything the caller can set. */
export const clientIp = (req) =>
  (req.headers["x-real-ip"] ||
    String(req.headers["x-forwarded-for"] || "").split(",")[0] ||
    "unknown").trim();

/**
 * @returns {{ok: true} | {ok: false, retryAfter: number}}
 */
export const rateLimit = (key, { limit, windowMs }) => {
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);

  if (hits.length >= limit) {
    buckets.set(key, hits);
    return { ok: false, retryAfter: Math.ceil((windowMs - (now - hits[0])) / 1000) };
  }

  hits.push(now);
  buckets.set(key, hits);

  // Keep the map from growing without bound on a long-lived instance.
  if (buckets.size > 5000) {
    for (const [k, times] of buckets) {
      if (!times.length || now - times[times.length - 1] > windowMs) buckets.delete(k);
    }
  }
  return { ok: true };
};
