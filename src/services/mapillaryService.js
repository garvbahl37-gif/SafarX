/**
 * mapillaryService — resolves a real, ready-to-render equirectangular
 * panorama for any point in India from the Mapillary Graph API (v4).
 *
 * Why the raw Graph API and not `mapillary-js`: the official viewer ships its
 * own chrome (logos, buttons, attribution bars) that fights the SafarX
 * "Peacock & Gold" system. We only need one thing from Mapillary — the URL of
 * a 360° JPEG — and we paint it ourselves in three.js.
 *
 * The key fact this whole approach rests on: for images where `is_pano` is
 * true, `thumb_2048_url` / `thumb_original_url` are already full
 * equirectangular projections. They can be handed straight to a
 * THREE.TextureLoader and mapped onto the inside of a sphere — no stitching,
 * no tiles, no SDK.
 *
 * Attribution is not optional: every rendered panorama must credit
 * "Imagery © Mapillary contributors" alongside its capture date.
 */

/* ── Configuration ──────────────────────────────────────────────────── */

export const MAPILLARY_TOKEN_ENV = "VITE_MAPILLARY_TOKEN";
export const MAPILLARY_DEVELOPER_URL = "https://www.mapillary.com/dashboard/developers";
export const MAPILLARY_ATTRIBUTION = "Imagery © Mapillary contributors";

const GRAPH_ENDPOINT = "https://graph.mapillary.com/images";
const FIELDS = "id,thumb_2048_url,thumb_original_url,computed_geometry,geometry,captured_at,is_pano";

/** Bounding-box half-widths in degrees, tried smallest first. */
// Widen generously: monument coordinates are a point, but the nearest 360°
// capture is often a street or two away.
const SEARCH_RADII = [0.005, 0.015, 0.03];
// Mapillary's Indian coverage is dominated by flat (non-360) captures, so a
// small page almost never contains a panorama — Delhi needed ~500 results
// before its first one appeared. Ask for a big page and filter client-side.
const RESULT_LIMIT = 500;
const REQUEST_TIMEOUT_MS = 12000;

/** Two captures closer together than this are the same vantage point. */
const MIN_VANTAGE_SPACING_M = 55;

const EARTH_R = 6371000;
const rad = (d) => (d * Math.PI) / 180;

/** Equirectangular approximation — accurate enough over a few hundred metres. */
const metresBetween = (a, b) => {
    if (!a || !b) return Infinity;
    const x = rad(b.lng - a.lng) * Math.cos(rad((a.lat + b.lat) / 2));
    const y = rad(b.lat - a.lat);
    return Math.sqrt(x * x + y * y) * EARTH_R;
};

const COMPASS = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"];

/** Which way the capture lies from the site's own coordinates. */
const bearingFrom = (lat, lng, point) => {
    if (!point) return null;
    const dy = point.lat - lat;
    const dx = (point.lng - lng) * Math.cos(rad(lat));
    if (!dx && !dy) return null;
    const deg = (Math.atan2(dx, dy) * 180) / Math.PI;
    return COMPASS[Math.round(((deg + 360) % 360) / 45) % 8];
};

/* ── Typed errors ───────────────────────────────────────────────────── */

export const MapillaryErrorCode = {
    NO_TOKEN: "NO_TOKEN",
    NETWORK: "NETWORK",
    NO_COVERAGE: "NO_COVERAGE",
    BAD_INPUT: "BAD_INPUT",
};

export class MapillaryError extends Error {
    constructor(code, message, cause = null) {
        super(message);
        this.name = "MapillaryError";
        this.code = code;
        this.cause = cause;
    }
}

/* ── Token ──────────────────────────────────────────────────────────── */

/**
 * Reads the Vite env token. Kept as a function (not a module constant) so a
 * token added to `.env` after a hot reload is picked up without a rebuild of
 * this module's frozen top-level state.
 */
export const getMapillaryToken = () => {
    const raw = import.meta.env?.[MAPILLARY_TOKEN_ENV];
    const token = typeof raw === "string" ? raw.trim() : "";
    return token.length > 0 ? token : null;
};

/** True when a usable Mapillary client token is configured. */
export const hasMapillaryToken = () => getMapillaryToken() !== null;

/* ── In-memory cache ────────────────────────────────────────────────── */

/**
 * Keyed by coordinates rounded to ~11 m. A tour always opens on the same
 * point, so re-entering a tour costs zero network.
 * Only successful lookups (including an honest `null` for "no coverage") are
 * cached — network blips and aborts stay retryable.
 */
const cache = new Map();
const cacheKey = (lat, lng) => `${lat.toFixed(4)},${lng.toFixed(4)}`;

/** Drops every cached lookup (used by the viewer's retry action). */
export const clearPanoramaCache = () => cache.clear();

/* ── Helpers ────────────────────────────────────────────────────────── */

const bbox = (lat, lng, r) =>
    [lng - r, lat - r, lng + r, lat + r].map((n) => n.toFixed(6)).join(",");

const pointOf = (image) => {
    const geo = image?.computed_geometry || image?.geometry;
    const coords = geo?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) return null;
    const [lng, lat] = coords;
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
};

/** Cheap squared planar distance — only ever used to rank nearby candidates. */
const distanceScore = (point, lat, lng) => {
    if (!point) return Number.POSITIVE_INFINITY;
    const dLat = point.lat - lat;
    const dLng = (point.lng - lng) * Math.cos((lat * Math.PI) / 180);
    return dLat * dLat + dLng * dLng;
};

/**
 * Formats a Mapillary `captured_at` (epoch milliseconds) as a short, honest
 * capture date for the viewer chrome: "Captured Mar 2023".
 */
export const formatCaptureDate = (capturedAt) => {
    if (!Number.isFinite(capturedAt)) return null;
    const date = new Date(capturedAt);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
};

/* ── Fetch one bounding box ─────────────────────────────────────────── */

async function fetchImagesInBbox(token, box, signal) {
    const url =
        `${GRAPH_ENDPOINT}?access_token=${encodeURIComponent(token)}` +
        `&fields=${encodeURIComponent(FIELDS)}` +
        `&bbox=${encodeURIComponent(box)}` +
        `&limit=${RESULT_LIMIT}`;

    // Own controller so we can add a timeout on top of the caller's signal.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const relay = () => controller.abort();
    if (signal) {
        if (signal.aborted) controller.abort();
        else signal.addEventListener("abort", relay, { once: true });
    }

    try {
        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new MapillaryError(
                    MapillaryErrorCode.NO_TOKEN,
                    "Mapillary rejected the access token. Check VITE_MAPILLARY_TOKEN."
                );
            }
            throw new MapillaryError(
                MapillaryErrorCode.NETWORK,
                `Mapillary responded with ${response.status}.`
            );
        }

        const payload = await response.json();
        return Array.isArray(payload?.data) ? payload.data : [];
    } catch (err) {
        // A caller-driven abort must surface as an abort, not as a failure.
        if (err?.name === "AbortError") {
            if (signal?.aborted) throw err;
            throw new MapillaryError(
                MapillaryErrorCode.NETWORK,
                "Mapillary took too long to answer."
            );
        }
        if (err instanceof MapillaryError) throw err;
        throw new MapillaryError(
            MapillaryErrorCode.NETWORK,
            "Could not reach Mapillary. Check your connection.",
            err
        );
    } finally {
        clearTimeout(timer);
        if (signal) signal.removeEventListener("abort", relay);
    }
}

/* ── Public API ─────────────────────────────────────────────────────── */

/**
 * Finds the best 360° panorama near a point.
 *
 * Ranking: `is_pano` images only, then the most recent capture, then the
 * closest to the requested point.
 *
 * @param {number} lat
 * @param {number} lng
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<{
 *   imageUrl: string,
 *   capturedAt: number|null,
 *   mapillaryId: string,
 *   lat: number,
 *   lng: number,
 * } | null>} `null` when Mapillary simply has no 360° coverage there.
 * @throws {MapillaryError} NO_TOKEN · NETWORK · BAD_INPUT
 */
async function findPanoramaSetNear(lat, lng, { signal, limit = 1 } = {}) {
    const targetLat = Number(lat);
    const targetLng = Number(lng);

    if (!Number.isFinite(targetLat) || !Number.isFinite(targetLng)) {
        throw new MapillaryError(
            MapillaryErrorCode.BAD_INPUT,
            "This site has no coordinates yet, so there is nothing to look up."
        );
    }

    const token = getMapillaryToken();
    if (!token) {
        throw new MapillaryError(
            MapillaryErrorCode.NO_TOKEN,
            `360° imagery needs a free Mapillary token in ${MAPILLARY_TOKEN_ENV}.`
        );
    }

    const key = `${cacheKey(targetLat, targetLng)}:${limit}`;
    if (cache.has(key)) return cache.get(key);

    for (const radius of SEARCH_RADII) {
        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

        const images = await fetchImagesInBbox(
            token,
            bbox(targetLat, targetLng, radius),
            signal
        );

        const panoramas = images
            .filter((img) => img?.is_pano === true)
            .map((img) => ({
                image: img,
                point: pointOf(img),
                capturedAt: Number.isFinite(img?.captured_at) ? img.captured_at : 0,
            }))
            .filter(({ image }) => Boolean(image.thumb_2048_url || image.thumb_original_url));

        if (panoramas.length === 0) continue;

        panoramas.sort((a, b) => {
            if (b.capturedAt !== a.capturedAt) return b.capturedAt - a.capturedAt;
            return (
                distanceScore(a.point, targetLat, targetLng) -
                distanceScore(b.point, targetLat, targetLng)
            );
        });

        // A street is captured every few metres, so the top of that list is
        // often ten frames of the same doorway. Walk it and keep only captures
        // that stand far enough apart to be a different place to stand.
        const chosen = [];
        for (const candidate of panoramas) {
            if (chosen.length >= limit) break;
            const far = chosen.every(
                (kept) => metresBetween(kept.point, candidate.point) >= MIN_VANTAGE_SPACING_M
            );
            if (far) chosen.push(candidate);
        }

        const results = chosen.map((entry) => ({
            imageUrl: entry.image.thumb_2048_url || entry.image.thumb_original_url,
            capturedAt: entry.capturedAt || null,
            mapillaryId: String(entry.image.id),
            lat: entry.point?.lat ?? targetLat,
            lng: entry.point?.lng ?? targetLng,
            bearing: bearingFrom(targetLat, targetLng, entry.point),
            metres: Math.round(metresBetween({ lat: targetLat, lng: targetLng }, entry.point)),
        }));

        cache.set(key, results);
        return results;
    }

    // Searched out to ~1.1 km and found no 360° imagery. That is a real,
    // honest answer — never a reason to fall back to third-party video.
    cache.set(key, []);
    return [];
}

/**
 * Several 360° captures around one place, spread far enough apart to be worth
 * switching between — the live equivalent of a tour's curated vantage list.
 */
export async function findPanoramasNear(lat, lng, { signal, limit = 6 } = {}) {
    return findPanoramaSetNear(lat, lng, { signal, limit });
}

/** The single best capture near a point, or null. */
export async function findPanoramaNear(lat, lng, { signal } = {}) {
    const set = await findPanoramaSetNear(lat, lng, { signal, limit: 1 });
    return set.length ? set[0] : null;
}

/** Human-readable copy for a failed lookup, used by the viewer's StateNotice. */
export const describeMapillaryError = (error) => {
    if (error?.code === MapillaryErrorCode.NO_TOKEN) {
        return {
            title: "360° imagery needs a Mapillary token",
            body: `Add ${MAPILLARY_TOKEN_ENV} to your .env file and restart the dev server. Mapillary tokens are free.`,
        };
    }
    if (error?.code === MapillaryErrorCode.BAD_INPUT) {
        return {
            title: "No coordinates for this site",
            body: "This tour has no verified latitude and longitude yet, so there is nothing to look up.",
        };
    }
    if (error?.code === MapillaryErrorCode.NO_COVERAGE) {
        return {
            title: "Panorama coming soon",
            body: "Mapillary has no 360° coverage at this site yet. We add sites as street-level imagery appears.",
        };
    }
    return {
        title: "Couldn't reach Mapillary",
        body: "The panorama request didn't go through. Check your connection and try again.",
    };
};
