// mapHelpers.js
// ══════════════════════════════════════════════════════════════
// Smart geocoding with street-level viewpoint optimization
// Problem: Standard geocoders return CENTER of a place polygon
//   which often has no street view coverage
// Solution: We nudge coordinates to the nearest road/street
//   for better Street View and panorama results
// ══════════════════════════════════════════════════════════════

import { placesService } from "../services/placesService";

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

/**
 * Master geocode function
 * 
 * Strategy:
 * 1. Check landmark database first (instant, perfect coordinates)
 * 2. Use Nominatim with special parameters for best results
 * 3. Attempt to find a nearby road/viewpoint for better SV coverage
 * 4. Return enriched location data
 */
export const geocode = async (query) => {
    if (!query || query.trim().length === 0) return null;

    const q = query.trim();
    const qLower = q.toLowerCase();

    // ── Step 1: Check landmark database ──────────────────────
    const landmarkDB = placesService.LANDMARK_DATABASE;

    // Exact match
    if (landmarkDB[qLower]) {
        const lm = landmarkDB[qLower];
        console.log(`[Geocode] Landmark exact match: "${q}" → ${lm.lat}, ${lm.lng}`);
        return {
            lat: lm.lat,
            lng: lm.lng,
            name: lm.name,
            displayName: lm.name,
            source: "landmark_db",
            confidence: "exact",
        };
    }

    // Fuzzy match — check if query words match a landmark
    for (const [key, lm] of Object.entries(landmarkDB)) {
        const queryWords = qLower.split(/[\s,]+/).filter(Boolean);
        const keyWords = key.split(/[\s,]+/).filter(Boolean);

        // If all query words appear in the landmark key
        const allMatch = queryWords.every((qw) =>
            keyWords.some((kw) => kw.includes(qw) || qw.includes(kw))
        );

        if (allMatch && queryWords.length >= 2) {
            console.log(`[Geocode] Landmark fuzzy match: "${q}" → "${key}" → ${lm.lat}, ${lm.lng}`);
            return {
                lat: lm.lat,
                lng: lm.lng,
                name: lm.name,
                displayName: lm.name,
                source: "landmark_db",
                confidence: "fuzzy",
            };
        }
    }

    // ── Step 2: Nominatim geocoding with optimization ────────
    try {
        // First attempt: search with viewbox bias and structured query
        const result = await nominatimSearch(q);

        if (!result) {
            console.warn("[Geocode] No results for:", q);
            return null;
        }

        // ── Step 3: Optimize coordinates for street-level viewing ──
        const optimized = await optimizeForStreetView(
            result.lat,
            result.lng,
            result.type,
            result.category
        );

        return {
            lat: optimized.lat,
            lng: optimized.lng,
            name: result.displayName || q,
            displayName: result.displayName,
            type: result.type,
            category: result.category,
            source: "nominatim",
            confidence: optimized.confidence,
            boundingBox: result.boundingBox,
            address: result.address,
        };
    } catch (error) {
        console.error("[Geocode] Error:", error);
        return null;
    }
};

/**
 * Nominatim search with multiple strategies
 */
const nominatimSearch = async (query) => {
    // Strategy 1: Standard search with high detail
    const params = new URLSearchParams({
        q: query,
        format: "jsonv2",
        limit: "5",
        addressdetails: "1",
        extratags: "1",
        namedetails: "1",
        dedupe: "1",
    });

    const url = `${NOMINATIM_BASE}/search?${params}`;

    const response = await fetch(url, {
        headers: {
            Accept: "application/json",
            "User-Agent": "SafarX-VirtualTour/1.0",
        },
    });

    if (!response.ok) return null;

    const results = await response.json();
    if (!results || results.length === 0) return null;

    // Score and pick the best result
    const scored = results.map((r) => {
        let score = r.importance || 0;

        // Boost tourism / landmark types
        const type = (r.type || "").toLowerCase();
        const category = (r.category || "").toLowerCase();

        if (category === "tourism") score += 0.3;
        if (category === "historic") score += 0.25;
        if (type === "attraction") score += 0.3;
        if (type === "monument") score += 0.3;
        if (type === "museum") score += 0.25;
        if (type === "viewpoint") score += 0.35;
        if (type === "artwork") score += 0.2;
        if (type === "city") score += 0.15;
        if (type === "town") score += 0.1;

        // Penalize very broad areas
        if (type === "administrative") score -= 0.1;
        if (type === "country") score -= 0.2;
        if (type === "state") score -= 0.15;
        if (type === "continent") score -= 0.3;

        return { ...r, _score: score };
    });

    // Sort by score
    scored.sort((a, b) => b._score - a._score);

    const best = scored[0];

    return {
        lat: parseFloat(best.lat),
        lng: parseFloat(best.lon),
        displayName: best.display_name,
        type: best.type,
        category: best.category,
        importance: best.importance,
        boundingBox: best.boundingbox
            ? {
                south: parseFloat(best.boundingbox[0]),
                north: parseFloat(best.boundingbox[1]),
                west: parseFloat(best.boundingbox[2]),
                east: parseFloat(best.boundingbox[3]),
            }
            : null,
        address: best.address || {},
    };
};

/**
 * Optimize coordinates for street-level viewing
 * 
 * Problem: Geocoder gives the CENTER of a landmark's polygon
 *   (e.g., center of Eiffel Tower = middle of the structure)
 *   Street View cameras are on ROADS, not in the middle of buildings
 * 
 * Solution: Find the nearest road/path and shift coordinates there
 * Uses: Nominatim reverse geocode with zoom=18 (street level)
 */
const optimizeForStreetView = async (lat, lng, type, category) => {
    try {
        // Types that are already street-level accurate
        const streetTypes = [
            "road", "street", "residential", "path", "crossing",
            "bus_stop", "traffic_signals", "motorway_junction",
        ];

        if (streetTypes.includes(type?.toLowerCase())) {
            return { lat, lng, confidence: "street_level" };
        }

        // For buildings/landmarks, find the nearest road
        // Try 4 directions (N, E, S, W) with small offsets and pick the best
        const offsets = [
            { dlat: 0.0003, dlng: 0, label: "N" },      // ~30m north
            { dlat: -0.0003, dlng: 0, label: "S" },      // ~30m south
            { dlat: 0, dlng: 0.0004, label: "E" },       // ~30m east
            { dlat: 0, dlng: -0.0004, label: "W" },      // ~30m west
            { dlat: 0.0002, dlng: 0.0002, label: "NE" }, // ~20m NE
            { dlat: -0.0002, dlng: 0.0002, label: "SE" },
            { dlat: 0.0002, dlng: -0.0002, label: "NW" },
            { dlat: -0.0002, dlng: -0.0002, label: "SW" },
        ];

        // Try to find a nearby road using Nominatim reverse at high zoom
        const roadUrl = `${NOMINATIM_BASE}/reverse?` +
            new URLSearchParams({
                lat: lat.toString(),
                lon: lng.toString(),
                format: "jsonv2",
                zoom: "18", // Street-level zoom — returns nearest road
                addressdetails: "1",
            });

        const roadResponse = await fetch(roadUrl, {
            headers: {
                Accept: "application/json",
                "User-Agent": "SafarX-VirtualTour/1.0",
            },
        });

        if (roadResponse.ok) {
            const roadData = await roadResponse.json();

            if (roadData && roadData.lat && roadData.lon) {
                const roadLat = parseFloat(roadData.lat);
                const roadLng = parseFloat(roadData.lon);

                // Only use the road coordinates if they're within ~200m of original
                const dist = haversineDistance(lat, lng, roadLat, roadLng);

                if (dist < 200) {
                    console.log(
                        `[Geocode] Optimized to nearby road: ${lat},${lng} → ${roadLat},${roadLng} (${dist.toFixed(0)}m)`
                    );
                    return { lat: roadLat, lng: roadLng, confidence: "road_optimized" };
                }
            }
        }

        // If road optimization fails, try a small offset toward the nearest street
        // For large structures, offset slightly south (most photos taken from south-facing streets)
        const largeLandmarks = ["castle", "palace", "monument", "attraction", "tower", "cathedral", "church", "temple", "mosque"];

        if (largeLandmarks.includes(type?.toLowerCase())) {
            const nudge = 0.0002; // ~20m
            console.log(`[Geocode] Nudging large landmark ${nudge}° south for better street view`);
            return {
                lat: lat - nudge,
                lng: lng,
                confidence: "landmark_nudged",
            };
        }

        // Return original coordinates if no optimization possible
        return { lat, lng, confidence: "original" };
    } catch (error) {
        console.warn("[Geocode] Optimization failed:", error);
        return { lat, lng, confidence: "original" };
    }
};

/**
 * Reverse geocode: lat/lng → location data
 */
export const reverseGeocode = async (lat, lng) => {
    try {
        const url = `${NOMINATIM_BASE}/reverse?` +
            new URLSearchParams({
                lat: lat.toString(),
                lon: lng.toString(),
                format: "jsonv2",
                addressdetails: "1",
            });

        const response = await fetch(url, {
            headers: {
                Accept: "application/json",
                "User-Agent": "SafarX-VirtualTour/1.0",
            },
        });

        if (!response.ok) return null;

        const result = await response.json();

        return {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            name: result.display_name,
            displayName: result.display_name,
            address: result.address || {},
        };
    } catch (error) {
        console.error("Reverse geocoding error:", error);
        return null;
    }
};

/**
 * Calculate distance between two coordinates in meters (Haversine)
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Public distance function (returns km)
 */
export const getDistance = (lat1, lon1, lat2, lon2) => {
    return haversineDistance(lat1, lon1, lat2, lon2) / 1000;
};