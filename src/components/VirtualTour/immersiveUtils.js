/**
 * Shared helpers for the SafarX immersive surfaces
 * (Street view + Orbital view).
 */

/** Signature motion curve used across SafarX. */
export const EASE = [0.22, 1, 0.36, 1];

/**
 * Format a lat/lng pair the way SafarX writes coordinates everywhere else:
 *   27.17° N · 78.04° E
 * Returns null when either value is missing, so callers can hide the readout.
 */
export const formatCoords = (lat, lng) => {
    const a = Number(lat);
    const b = Number(lng);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
    return `${Math.abs(a).toFixed(2)}° ${a >= 0 ? "N" : "S"} · ${Math.abs(b).toFixed(2)}° ${b >= 0 ? "E" : "W"}`;
};

/** Trim a long geocoder string down to the first two parts. */
export const shortPlaceName = (name = "") =>
    name.split(",").slice(0, 2).join(",").trim();
