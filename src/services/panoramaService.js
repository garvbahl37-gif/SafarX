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
 *      or more hand-verified equirectangular files on Wikimedia Commons, each
 *      labelled with the vantage point it was shot from. This is what
 *      guarantees a tour works, and what feeds the viewer's vantage switcher.
 *      A 2:1 aspect ratio is necessary but nowhere near sufficient to call a
 *      file equirectangular — a narrow slice of a sphere and an 18:9 phone
 *      crop are both exactly 2:1 and both render as a smear — so sourcing also
 *      requires GPano XMP with full-sphere crop values, a 360 camera in EXIF,
 *      or membership of a Commons 360°/photosphere category, plus a look at
 *      the rendered thumbnail. `scripts/verify-panoramas.py` is the last gate.
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
    findPanoramasNear,
    formatCaptureDate,
    hasMapillaryToken,
    clearPanoramaCache as clearMapillaryCache,
    MAPILLARY_ATTRIBUTION,
} from "./mapillaryService";
import {
    findStreetViewVantages,
    formatCaptureDate as formatStreetViewDate,
    hasGoogleMapsKey,
    clearStreetViewCache,
    STREET_VIEW_ATTRIBUTION,
} from "./googleStreetViewService";

/* ── Source tags ────────────────────────────────────────────────────── */

export const PanoramaSource = {
    CURATED: "curated",
    MAPILLARY: "mapillary",
    STREET_VIEW: "streetview",
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
 * Tours that opt into Google Street View, by id and by coordinate.
 *
 * A tour declares `"streetView": { … }` in `vrTours.json` when no freely
 * licensed panorama of the site exists. It is consulted only *after* the
 * curated lookup comes back empty, so no tour that already ships a verified
 * Wikimedia image can ever be moved onto Google imagery by accident.
 */
const svById = new Map();
const svByCoord = new Map();

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
    // Read before the early exit below: a Street View tour is precisely one
    // with no curated vantages, so it would otherwise never be indexed.
    if (tour?.streetView) {
        const config = {
            ...(typeof tour.streetView === "object" ? tour.streetView : {}),
            name: tour.name,
            lat: tour.latitude,
            lng: tour.longitude,
        };
        if (tour.id) svById.set(tour.id, config);
        const svKey = coordKey(tour.latitude, tour.longitude);
        if (svKey && !svByCoord.has(svKey)) svByCoord.set(svKey, config);
    }

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

/** The Street View opt-in for a tour, looked up by id first, then coordinates. */
function getStreetViewConfig({ tourId, latitude, longitude } = {}) {
    if (tourId && svById.has(tourId)) return svById.get(tourId);
    const key = coordKey(latitude, longitude);
    if (key && svByCoord.has(key)) return svByCoord.get(key);
    return null;
}

/** Whether a tour is served by Street View rather than a curated panorama. */
export const isStreetViewTour = (options = {}) =>
    !getCuratedPanoramas(options).length && Boolean(getStreetViewConfig(options));

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
    // Name each vantage by where it stands, so the switcher reads as a walk
    // around the place rather than a list of identical captures.
    label: result.metres > 40 && result.bearing
        ? `${result.metres} m ${result.bearing}`
        : "Live street capture",
    captureLabel: formatCaptureDate(result.capturedAt),
    capturedAt: result.capturedAt ?? null,
    mapillaryId: result.mapillaryId ?? null,
    lat: result.lat ?? null,
    lng: result.lng ?? null,
});

/**
 * Street View vantages carry no `imageUrl`: there is no file for us to fetch,
 * only an id that Google's own renderer resolves. `StreetViewStage` reads
 * `panoId`, and the viewer branches on `source` to decide which stage to mount.
 */
const shapeStreetView = (vantage) => ({
    imageUrl: null,
    panoId: vantage.panoId,
    heading: vantage.centerHeading ?? 0,
    source: PanoramaSource.STREET_VIEW,
    provider: PanoramaSource.STREET_VIEW,
    attribution: STREET_VIEW_ATTRIBUTION,
    label: vantage.label || "Street View",
    captureLabel: formatStreetViewDate(vantage.imageDate),
    capturedAt: vantage.imageDate ?? null,
    mapillaryId: null,
    lat: vantage.lat ?? null,
    lng: vantage.lng ?? null,
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

    // 2 — a site the free sources never covered, which has opted into Street
    //     View. Google's imagery is still a real, draggable panorama rather
    //     than a video, so rule #1 holds — it is just painted by Google's
    //     renderer instead of ours, because their terms require that.
    const streetView = getStreetViewConfig({ tourId, latitude, longitude });
    /* Remembered so Mapillary's failure below cannot masquerade as the cause.
       A Street View tour with no key has a known, fixable diagnosis, and the
       viewer already has the right words for it. */
    const streetViewLacksKey = Boolean(streetView) && !hasGoogleMapsKey();
    if (streetView && hasGoogleMapsKey()) {
        try {
            const found = await findStreetViewVantages(latitude, longitude, {
                panoId: streetView.panoId ?? null,
                radius: streetView.radius ?? undefined,
                limit: streetView.limit ?? 5,
                label: streetView.label ?? null,
                signal,
            });
            if (found.length) return found.map(shapeStreetView);
        } catch {
            /* A key that is present but unauthorised — the API not enabled on
               the project, no billing account, a referrer restriction that does
               not cover this host — must not take the viewer down with it. A
               configured-but-rejected key is a deployment problem, not a reason
               to deny the visitor the Mapillary capture below or the honest
               empty state. Swallowed deliberately, exactly as Mapillary's own
               enhancement path is. */
        }
    }

    // 3 — no curated image for this site yet, so ask Mapillary for live ones.
    //     A place is worth more than one viewpoint, so take several captures
    //     spread around the site rather than only the closest.
    let live = [];
    try {
        live = await findPanoramasNear(latitude, longitude, { signal, limit: 6 });
    } catch (err) {
        /* Mapillary is the last resort, and for a tour that has nothing else
           its failure is the honest answer — so it is rethrown. But for a
           Street View tour running without a key, Mapillary was never the
           point: reporting its 500 sends the reader off debugging the wrong
           service. Fall through to the empty state instead, which the viewer
           renders as "this tour needs a Google Maps key". */
        if (!streetViewLacksKey) throw err;
    }
    if (live.length) return live.map(shapeMapillary);

    // 4 — the honest empty state.
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

/**
 * Live captures to offer *alongside* a tour's curated images, so a site with
 * one verified panorama can still be walked around. Same contract as
 * `findLivePanorama`: every failure is swallowed, because a tour that is
 * already painting a verified image must not be disturbed by Mapillary.
 *
 * @returns {Promise<object[]>} Shaped panoramas, possibly empty.
 */
export async function findLiveVantages(latitude, longitude, { signal, limit = 4 } = {}) {
    if (!hasMapillaryToken()) return [];
    try {
        const live = await findPanoramasNear(latitude, longitude, { signal, limit });
        return live.map(shapeMapillary);
    } catch {
        return [];
    }
}

/** Clears the live-lookup caches. Curated entries are static, so untouched. */
export const clearPanoramaCache = () => {
    clearMapillaryCache();
    clearStreetViewCache();
};
