/**
 * panoramaService — the single place that answers "what 360° image do we paint
 * for this tour?".
 *
 * Hard rule #1 of the design system says VR tours are never YouTube videos, so
 * every tour has to earn a real equirectangular panorama. Mapillary alone could
 * not carry that: its Indian 360° coverage is genuinely patchy — Varanasi,
 * Delhi and (barely) Agra return `is_pano` imagery, and the other eleven sites
 * return nothing at all. Leaning on it as the sole source meant most tours fell
 * through to the "coming soon" state.
 *
 * So the order of resolution is:
 *
 *   1. The **curated** panorama recorded on the tour in `vrTours.json` — a
 *      hand-verified, 2:1 equirectangular file on Wikimedia Commons. This is
 *      what guarantees a tour works.
 *   2. A **live Mapillary** lookup — used as the source when a tour has no
 *      curated image, and offered alongside the curated one as an optional
 *      "live capture" when both exist.
 *   3. `null` — the honest empty state. Never a video fallback.
 *
 * Every result carries its own attribution string, because both sources are
 * licensed imagery and the credit has to be on screen.
 */

import vrTours from "../data/vrTours.json";
import {
    findPanoramaNear,
    formatCaptureDate,
    hasMapillaryToken,
    clearPanoramaCache as clearMapillaryCache,
    MAPILLARY_ATTRIBUTION,
} from "./mapillaryService";

/* ── Source tags ────────────────────────────────────────────────────── */

export const PanoramaSource = {
    CURATED: "curated",
    MAPILLARY: "mapillary",
};

/* ── Curated index ──────────────────────────────────────────────────── */

/**
 * Coordinates are rounded to ~11 m so a call site that passes the tour's
 * latitude/longitude (but not its id) still finds the curated entry. That
 * keeps `PanoramaViewer` working unchanged wherever it is already mounted
 * with nothing but a coordinate pair.
 */
const coordKey = (lat, lng) => {
    const a = Number(lat);
    const b = Number(lng);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
    return `${a.toFixed(4)},${b.toFixed(4)}`;
};

const byId = new Map();
const byCoord = new Map();

for (const tour of vrTours) {
    if (!tour?.panorama) continue;
    const entry = {
        imageUrl: tour.panorama,
        credit: tour.panoramaCredit || null,
        provider: tour.panoramaSource || "wikimedia",
        name: tour.name,
        lat: tour.latitude,
        lng: tour.longitude,
    };
    if (tour.id) byId.set(tour.id, entry);
    const key = coordKey(tour.latitude, tour.longitude);
    // First tour at a coordinate wins; ids are the unambiguous lookup.
    if (key && !byCoord.has(key)) byCoord.set(key, entry);
}

/** The curated record for a tour, looked up by id first, then by coordinates. */
export function getCuratedPanorama({ tourId, latitude, longitude } = {}) {
    if (tourId && byId.has(tourId)) return byId.get(tourId);
    const key = coordKey(latitude, longitude);
    if (key && byCoord.has(key)) return byCoord.get(key);
    return null;
}

/** How many of the shipped tours have a verified panorama. Used by tests. */
export const curatedPanoramaCount = () => byId.size;

/* ── Shaping ────────────────────────────────────────────────────────── */

const shapeCurated = (entry, overrides = {}) => ({
    imageUrl: overrides.imageUrl || entry.imageUrl,
    source: PanoramaSource.CURATED,
    provider: overrides.provider || entry.provider,
    attribution: overrides.credit || entry.credit || null,
    captureLabel: null,
    capturedAt: null,
    mapillaryId: null,
    lat: entry.lat ?? null,
    lng: entry.lng ?? null,
});

const shapeMapillary = (result) => ({
    imageUrl: result.imageUrl,
    source: PanoramaSource.MAPILLARY,
    provider: PanoramaSource.MAPILLARY,
    attribution: MAPILLARY_ATTRIBUTION,
    captureLabel: formatCaptureDate(result.capturedAt),
    capturedAt: result.capturedAt ?? null,
    mapillaryId: result.mapillaryId ?? null,
    lat: result.lat ?? null,
    lng: result.lng ?? null,
});

/* ── Public API ─────────────────────────────────────────────────────── */

/**
 * Resolves the panorama a tour should open with.
 *
 * @param {object}  options
 * @param {string}  [options.tourId]      Tour id from `vrTours.json`.
 * @param {number}  [options.latitude]
 * @param {number}  [options.longitude]
 * @param {string}  [options.panorama]    Curated URL passed straight in by a
 *                                        call site that already has the tour.
 * @param {string}  [options.panoramaCredit]
 * @param {string}  [options.panoramaSource]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<object|null>} A shaped panorama, or `null` when neither a
 *          curated image nor Mapillary coverage exists.
 * @throws {MapillaryError} only on the Mapillary path — a tour with a curated
 *          image never fails, whatever Mapillary is doing.
 */
export async function resolvePanorama({
    tourId,
    latitude,
    longitude,
    panorama,
    panoramaCredit,
    panoramaSource,
    signal,
} = {}) {
    // 1 — curated, either handed to us or looked up from the tour data.
    if (panorama) {
        return shapeCurated(
            { imageUrl: panorama, credit: panoramaCredit, provider: panoramaSource, lat: latitude, lng: longitude },
            {}
        );
    }

    const curated = getCuratedPanorama({ tourId, latitude, longitude });
    if (curated) {
        return shapeCurated(curated, {
            credit: panoramaCredit,
            provider: panoramaSource,
        });
    }

    // 2 — no curated image for this site yet, so ask Mapillary for a live one.
    const live = await findPanoramaNear(latitude, longitude, { signal });
    if (live) return shapeMapillary(live);

    // 3 — the honest empty state.
    return null;
}

/**
 * Background lookup for the *optional* live capture offered alongside a curated
 * panorama. Deliberately swallows every failure: a missing token, a flaky
 * network or an absent capture must never disturb a tour that is already
 * painting a verified image.
 *
 * @returns {Promise<object|null>} A shaped Mapillary panorama, or `null`.
 */
export async function findLivePanorama(latitude, longitude, { signal } = {}) {
    if (!hasMapillaryToken()) return null;
    try {
        const live = await findPanoramaNear(latitude, longitude, { signal });
        return live ? shapeMapillary(live) : null;
    } catch {
        return null;
    }
}

/** Clears the Mapillary lookup cache. Curated entries are static, so untouched. */
export const clearPanoramaCache = () => clearMapillaryCache();
