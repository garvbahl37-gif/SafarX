/**
 * streetViewService — Google Street View as a *third* source of real 360°
 * imagery, for the sites Wikimedia never covered.
 *
 * Why this exists. Hard rule #1 of the design system is that a VR tour is
 * never a video, so every tour has to earn a genuine pannable panorama. The
 * freely-licensed well ran dry at 34 tours: Commons' Indian 360° categories,
 * a targeted sweep of 75 destinations, Mapillary and Openverse were all
 * measured and all exhausted. Hampi, Fatehpur Sikri, Amber, the Golden Temple
 * and Bangla Sahib simply have no openly-licensed equirectangular file.
 * Street View does have them.
 *
 * What this is NOT. It is not a way to get Google's imagery into our own
 * three.js sphere. Street View pixels may only be painted by Google's own
 * renderer, and the Google logo and image-capture line may not be removed —
 * that is the Maps Platform terms, not a preference. So this module resolves
 * *identifiers* (panorama ids) and `StreetViewStage` hands them to Google's
 * renderer with every optional control switched off, so the panorama sits
 * inside SafarX's chrome wearing as little of Google's as the terms allow.
 *
 * What we get in exchange is the thing that actually matters: the visitor
 * still stands at Hampi and looks around by dragging. It is a real panorama,
 * not a video embed, so rule #1 holds.
 *
 * Resolution is by coordinates at runtime rather than by hard-coded panorama
 * ids, because ids churn as Google re-drives a road. A tour may still pin a
 * specific `panoId` when the nearest capture is not the good one — the view
 * from inside a courtyard rather than the car park outside it.
 */

/* ── Config ─────────────────────────────────────────────────────────── */

export const GOOGLE_MAPS_KEY_ENV = "VITE_GOOGLE_MAPS_KEY";
export const GOOGLE_MAPS_CONSOLE_URL =
    "https://console.cloud.google.com/google/maps-apis/api-list";

/**
 * Street View imagery is Google's, and the terms require the credit to stay on
 * screen. `StreetViewStage` keeps Google's own logo (which is what actually
 * discharges the obligation); this line is rendered in our type beside it so
 * the source reads the same way the Wikimedia and Mapillary credits do.
 */
export const STREET_VIEW_ATTRIBUTION = "Imagery © Google · Street View";

/** How far from the tour's coordinates we will accept a capture, in metres. */
const DEFAULT_RADIUS = 140;

/* ── Errors ─────────────────────────────────────────────────────────── */

export const StreetViewErrorCode = {
    NO_KEY: "NO_KEY",
    LOAD_FAILED: "LOAD_FAILED",
    NO_COVERAGE: "NO_COVERAGE",
};

export class StreetViewError extends Error {
    constructor(code, message) {
        super(message);
        this.name = "StreetViewError";
        this.code = code;
    }
}

/* ── Key ────────────────────────────────────────────────────────────── */

export const getGoogleMapsKey = () => {
    const raw = import.meta.env?.[GOOGLE_MAPS_KEY_ENV];
    const key = typeof raw === "string" ? raw.trim() : "";
    return key ? key : null;
};

export const hasGoogleMapsKey = () => getGoogleMapsKey() !== null;

/* ── Loader ─────────────────────────────────────────────────────────── */

/**
 * Loads the Maps JavaScript API exactly once per page.
 *
 * `loading=async` is the modern bootstrap: the script resolves a callback and
 * individual libraries are then pulled in through `importLibrary`, so we only
 * ever ship the Street View half of the API rather than all of Maps.
 */
let loaderPromise = null;

export function loadStreetViewLibrary() {
    if (loaderPromise) return loaderPromise;

    const key = getGoogleMapsKey();
    if (!key) {
        return Promise.reject(
            new StreetViewError(
                StreetViewErrorCode.NO_KEY,
                "No Google Maps API key is configured."
            )
        );
    }

    loaderPromise = new Promise((resolve, reject) => {
        // A previous mount may already have finished the bootstrap.
        if (window.google?.maps?.importLibrary) {
            window.google.maps.importLibrary("streetView").then(resolve, reject);
            return;
        }

        const callbackName = "__safarxGoogleMapsReady";
        const script = document.createElement("script");
        script.src =
            "https://maps.googleapis.com/maps/api/js" +
            `?key=${encodeURIComponent(key)}` +
            "&v=weekly&loading=async" +
            `&callback=${callbackName}`;
        script.async = true;

        window[callbackName] = () => {
            delete window[callbackName];
            window.google.maps.importLibrary("streetView").then(resolve, reject);
        };

        script.onerror = () => {
            delete window[callbackName];
            // Let a later mount retry rather than caching the failure forever.
            loaderPromise = null;
            reject(
                new StreetViewError(
                    StreetViewErrorCode.LOAD_FAILED,
                    "Google Maps could not be reached."
                )
            );
        };

        document.head.appendChild(script);
    });

    return loaderPromise;
}

/* ── Geometry ───────────────────────────────────────────────────────── */
/* Local copies rather than an import from mapillaryService: that module's
   helpers are private to it, and reaching into it would couple two sources
   that should be able to change independently. */

const rad = (d) => (d * Math.PI) / 180;

const metresBetween = (a, b) => {
    const R = 6371000;
    const dLat = rad(b.lat - a.lat);
    const dLng = rad(b.lng - a.lng);
    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return Math.round(2 * R * Math.asin(Math.sqrt(h)));
};

const COMPASS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

const bearingFrom = (origin, point) => {
    const dLng = rad(point.lng - origin.lng);
    const y = Math.sin(dLng) * Math.cos(rad(point.lat));
    const x =
        Math.cos(rad(origin.lat)) * Math.sin(rad(point.lat)) -
        Math.sin(rad(origin.lat)) * Math.cos(rad(point.lat)) * Math.cos(dLng);
    const deg = (Math.atan2(y, x) * 180) / Math.PI;
    return COMPASS[Math.round(((deg + 360) % 360) / 45) % 8];
};

/* ── Capture date ───────────────────────────────────────────────────── */

/**
 * Street View reports `imageDate` as `YYYY-MM` (occasionally `YYYY-MM-DD`).
 * Rendered as "June 2023" to match the Mapillary credit line's shape.
 */
export const formatCaptureDate = (imageDate) => {
    if (!imageDate) return null;
    const [year, month] = String(imageDate).split("-");
    if (!year) return null;
    if (!month) return year;
    const date = new Date(Number(year), Number(month) - 1, 1);
    if (Number.isNaN(date.getTime())) return year;
    return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
};

/* ── Cache ──────────────────────────────────────────────────────────── */

const cache = new Map();
const cacheKey = (lat, lng, panoId) =>
    panoId ? `pano:${panoId}` : `${lat.toFixed(4)},${lng.toFixed(4)}`;

export const clearStreetViewCache = () => cache.clear();

/* ── Shaping ────────────────────────────────────────────────────────── */

const shape = (data, origin, label) => {
    const latLng = data?.location?.latLng;
    const point = latLng ? { lat: latLng.lat(), lng: latLng.lng() } : null;
    const metres = point && origin ? metresBetween(origin, point) : null;

    return {
        panoId: data.location.pano,
        // Google's own `description` is a street address more often than a
        // place ("Ring Road"), so it is only used when we have nothing better.
        label: label || data.location.description || data.location.shortDescription || null,
        description: data.location.description || null,
        copyright: data.copyright || null,
        imageDate: data.imageDate || null,
        // The direction the capture vehicle faced — the sane opening heading.
        centerHeading: data.tiles?.centerHeading ?? 0,
        links: (data.links || []).map((l) => l.pano).filter(Boolean),
        lat: point?.lat ?? null,
        lng: point?.lng ?? null,
        metres,
        bearing: point && origin && metres > 25 ? bearingFrom(origin, point) : null,
    };
};

/* ── Lookup ─────────────────────────────────────────────────────────── */

async function getPanorama(service, request) {
    try {
        const { data } = await service.getPanorama(request);
        return data?.location?.pano ? data : null;
    } catch {
        // The API rejects with ZERO_RESULTS when nothing is in range, which is
        // an answer rather than a failure.
        return null;
    }
}

/**
 * Every Street View vantage worth offering at a site, nearest first.
 *
 * One `getPanorama` call returns a single capture, so a site would otherwise
 * be a single frozen viewpoint. Each panorama also lists its neighbours, so we
 * walk those links outward from the nearest capture — which is what turns a
 * tour into a short walk around the place rather than one stare.
 *
 * @param {number} lat
 * @param {number} lng
 * @param {object} [options]
 * @param {string} [options.panoId]  Pin a hand-picked capture as the opener.
 * @param {number} [options.radius]  Search radius in metres.
 * @param {number} [options.limit]   Maximum vantages to return.
 * @param {string} [options.label]   Label for the opening vantage.
 * @returns {Promise<object[]>} Shaped vantages — empty when there is no coverage.
 * @throws {StreetViewError} on a missing key or an unreachable Maps API only.
 */
export async function findStreetViewVantages(
    lat,
    lng,
    { panoId = null, radius = DEFAULT_RADIUS, limit = 5, label = null, signal } = {}
) {
    const origin = { lat: Number(lat), lng: Number(lng) };
    if (!Number.isFinite(origin.lat) || !Number.isFinite(origin.lng)) return [];

    const key = cacheKey(origin.lat, origin.lng, panoId);
    if (cache.has(key)) return cache.get(key);

    const lib = await loadStreetViewLibrary();
    const service = new lib.StreetViewService();

    // A pinned id wins; otherwise take the nearest outdoor capture. OUTDOOR
    // keeps us out of the shop and restaurant interiors that Google also
    // hosts, which are not what a heritage tour is promising.
    const seed = await getPanorama(
        service,
        panoId
            ? { pano: panoId }
            : {
                  location: origin,
                  radius,
                  source: lib.StreetViewSource.OUTDOOR,
                  preference: lib.StreetViewPreference.NEAREST,
              }
    );

    if (!seed) {
        cache.set(key, []);
        return [];
    }

    const vantages = [shape(seed, origin, label)];
    const seen = new Set([vantages[0].panoId]);
    const queue = [...vantages[0].links];

    // Breadth-first along the links, staying inside the radius so the walk
    // does not wander off down the approach road.
    while (queue.length && vantages.length < limit) {
        if (signal?.aborted) break;
        const next = queue.shift();
        if (!next || seen.has(next)) continue;
        seen.add(next);

        const data = await getPanorama(service, { pano: next });
        if (!data) continue;

        const vantage = shape(data, origin, null);
        if (vantage.metres != null && vantage.metres > radius) continue;

        vantage.label = vantage.bearing
            ? `${vantage.metres} m ${vantage.bearing}`
            : "A few steps on";
        vantages.push(vantage);
        queue.push(...vantage.links);
    }

    cache.set(key, vantages);
    return vantages;
}

/* ── Copy ───────────────────────────────────────────────────────────── */

export const describeStreetViewError = (error) => {
    switch (error?.code) {
        case StreetViewErrorCode.NO_KEY:
            return {
                title: "Street View needs a Google Maps key",
                body: "This tour is served by Google Street View, which needs a Maps JavaScript API key before it can paint anything.",
            };
        case StreetViewErrorCode.LOAD_FAILED:
            return {
                title: "Google Maps could not be reached",
                body: "The Street View library failed to load. Check the connection and the key's HTTP referrer restrictions.",
            };
        default:
            return {
                title: "This panorama could not be opened",
                body: "Street View returned nothing for this site. Try again in a moment.",
            };
    }
};
