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
 *   1. The **curated** panoramas recorded on the tour in `vrTours.json` — one
 *      or more hand-verified, 2:1 equirectangular files on Wikimedia Commons,
 *      each labelled with the vantage point it was shot from. This is what
 *      guarantees a tour works, and what feeds the viewer's vantage switcher.
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

/**
 * Normalises a tour's panorama fields into a list of vantage points.
 *
 * A tour may carry either the newer `panoramas` array — `{ url, label, credit,
 * source }` per vantage — or the older single `panorama` string. Both shapes
 * are read here so nothing that still writes the old field breaks.
 */
function readVantages(tour) {
    const list = Array.isArray(tour?.panoramas) ? tour.panoramas : [];
    const entries = list
        .filter((p) => p && p.url)
        .map((p, i) => ({
            imageUrl: p.url,
            label: p.label || `Vantage ${i + 1}`,
            credit: p.credit || null,
            provider: p.source || "wikimedia",
        }));

    if (entries.length) return entries;

    // Legacy single-panorama tour.
    if (tour?.panorama) {
        return [
            {
                imageUrl: tour.panorama,
                label: tour.name || "360° view",
                credit: tour.panoramaCredit || null,
                provider: tour.panoramaSource || "wikimedia",
            },
        ];
    }
    return [];
}

for (const tour of vrTours) {
    const vantages = readVantages(tour);
    if (!vantages.length) continue;
    const entry = {
        vantages,
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
function getCuratedEntry({ tourId, latitude, longitude } = {}) {
    if (tourId && byId.has(tourId)) return byId.get(tourId);
    const key = coordKey(latitude, longitude);
    if (key && byCoord.has(key)) return byCoord.get(key);
    return null;
}

/**
 * The tour's *first* curated vantage, flattened into the single-panorama shape
 * this module has always returned. Kept so existing callers keep working.
 */
export function getCuratedPanorama(options = {}) {
    const entry = getCuratedEntry(options);
    if (!entry) return null;
    const first = entry.vantages[0];
    return {
        imageUrl: first.imageUrl,
        credit: first.credit,
        provider: first.provider,
        label: first.label,
        name: entry.name,
        lat: entry.lat,
        lng: entry.lng,
    };
}

/** Every curated vantage point for a tour, in authoring order. */
export function getCuratedPanoramas(options = {}) {
    const entry = getCuratedEntry(options);
    if (!entry) return [];
    return entry.vantages.map((v) => ({ ...v, lat: entry.lat, lng: entry.lng }));
}

/** How many of the shipped tours have at least one verified panorama. */
export const curatedPanoramaCount = () => byId.size;

/** How many verified vantage points ship in total. Used by tests. */
export const curatedVantageCount = () =>
    [...byId.values()].reduce((n, e) => n + e.vantages.length, 0);

/* ── Shaping ────────────────────────────────────────────────────────── */

const shapeCurated = (entry, overrides = {}) => ({
    imageUrl: overrides.imageUrl || entry.imageUrl,
    source: PanoramaSource.CURATED,
    provider: overrides.provider || entry.provider || "wikimedia",
    attribution: overrides.credit || entry.credit || null,
    /** The vantage point this image was shot from — drives the viewer's switcher. */
    label: overrides.label || entry.label || null,
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
    label: "Live street capture",
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
    panoramas,
    panoramaCredit,
    panoramaSource,
    signal,
} = {}) {
    const set = await resolvePanoramaSet({
        tourId,
        latitude,
        longitude,
        panorama,
        panoramas,
        panoramaCredit,
        panoramaSource,
        signal,
    });
    return set.length ? set[0] : null;
}

/**
 * Resolves *every* vantage point a tour can offer, in authoring order.
 *
 * This is what the viewer's vantage switcher is built on. The rules are the
 * same as `resolvePanorama`: curated images win, a live Mapillary capture is
 * the fallback for a site with none, and an empty array is the honest empty
 * state. A tour with curated images never depends on Mapillary being up.
 *
 * @param {object} options — same as `resolvePanorama`, plus:
 * @param {Array}  [options.panoramas] Vantage list passed straight in by a call
 *                 site that already has the tour: `{ url, label, credit, source }`.
 * @returns {Promise<object[]>} Shaped panoramas — possibly empty, never null.
 */
export async function resolvePanoramaSet({
    tourId,
    latitude,
    longitude,
    panorama,
    panoramas,
    panoramaCredit,
    panoramaSource,
    signal,
} = {}) {
    // 1 — curated vantages handed to us by the call site.
    const handed = (Array.isArray(panoramas) ? panoramas : []).filter((p) => p?.url);
    if (handed.length) {
        return handed.map((p, i) =>
            shapeCurated({
                imageUrl: p.url,
                credit: p.credit,
                provider: p.source,
                label: p.label || `Vantage ${i + 1}`,
                lat: latitude,
                lng: longitude,
            })
        );
    }

    // 1b — a single curated URL handed in, the older call shape.
    if (panorama) {
        return [
            shapeCurated({
                imageUrl: panorama,
                credit: panoramaCredit,
                provider: panoramaSource,
                label: null,
                lat: latitude,
                lng: longitude,
            }),
        ];
    }

    // 1c — looked up from the tour data by id, then by coordinates.
    const curated = getCuratedPanoramas({ tourId, latitude, longitude });
    if (curated.length) {
        return curated.map((entry) =>
            shapeCurated(entry, {
                credit: curated.length === 1 ? panoramaCredit : undefined,
                provider: panoramaSource,
            })
        );
    }

    // 2 — no curated image for this site yet, so ask Mapillary for a live one.
    const live = await findPanoramaNear(latitude, longitude, { signal });
    if (live) return [shapeMapillary(live)];

    // 3 — the honest empty state.
    return [];
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
