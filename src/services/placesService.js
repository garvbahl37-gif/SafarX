// placesService.js
// ══════════════════════════════════════════════════════════════
// Smart autocomplete with multiple providers for best results
// Uses: Photon (primary) + Nominatim (enrichment)
// Returns precise coordinates optimized for street-level viewing
// ══════════════════════════════════════════════════════════════

const PHOTON_BASE = "https://photon.komoot.io/api";
const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

/**
 * Known landmarks with EXACT coordinates for best street-level views
 * These bypass geocoding entirely for guaranteed quality
 */
const LANDMARK_DATABASE = {
    // Europe
    "eiffel tower": { lat: 48.85837, lng: 2.29448, name: "Eiffel Tower, Paris, France" },
    "louvre": { lat: 48.86074, lng: 2.33792, name: "Louvre Museum, Paris, France" },
    "notre dame": { lat: 48.85296, lng: 2.34990, name: "Notre-Dame de Paris, France" },
    "arc de triomphe": { lat: 48.87378, lng: 2.29510, name: "Arc de Triomphe, Paris, France" },
    "sacre coeur": { lat: 48.88670, lng: 2.34310, name: "Sacré-Cœur, Paris, France" },
    "colosseum": { lat: 41.89021, lng: 12.49223, name: "Colosseum, Rome, Italy" },
    "trevi fountain": { lat: 41.90098, lng: 12.48323, name: "Trevi Fountain, Rome, Italy" },
    "vatican": { lat: 41.90222, lng: 12.45733, name: "Vatican City, Rome, Italy" },
    "leaning tower of pisa": { lat: 43.72297, lng: 10.39657, name: "Leaning Tower of Pisa, Italy" },
    "big ben": { lat: 51.50073, lng: -0.12457, name: "Big Ben, London, UK" },
    "tower bridge": { lat: 51.50553, lng: -0.07537, name: "Tower Bridge, London, UK" },
    "buckingham palace": { lat: 51.50140, lng: -0.14189, name: "Buckingham Palace, London, UK" },
    "london eye": { lat: 51.50340, lng: -0.11950, name: "London Eye, London, UK" },
    "sagrada familia": { lat: 41.40363, lng: 2.17432, name: "Sagrada Família, Barcelona, Spain" },
    "santorini": { lat: 36.41610, lng: 25.43220, name: "Santorini, Greece" },
    "acropolis": { lat: 37.97159, lng: 23.72647, name: "Acropolis, Athens, Greece" },
    "brandenburg gate": { lat: 52.51627, lng: 13.37770, name: "Brandenburg Gate, Berlin, Germany" },
    "neuschwanstein": { lat: 47.55762, lng: 10.74973, name: "Neuschwanstein Castle, Germany" },
    "blue mosque": { lat: 41.00543, lng: 28.97644, name: "Blue Mosque, Istanbul, Turkey" },
    "hagia sophia": { lat: 41.00854, lng: 28.98014, name: "Hagia Sophia, Istanbul, Turkey" },
    "charles bridge": { lat: 50.08649, lng: 14.41120, name: "Charles Bridge, Prague, Czech Republic" },
    "amsterdam canals": { lat: 52.36833, lng: 4.88935, name: "Amsterdam Canals, Netherlands" },

    // Asia
    "taj mahal": { lat: 27.17406, lng: 78.04174, name: "Taj Mahal, Agra, India" },
    "india gate": { lat: 28.61278, lng: 77.22966, name: "India Gate, New Delhi, India" },
    "gateway of india": { lat: 18.92185, lng: 72.83469, name: "Gateway of India, Mumbai, India" },
    "red fort": { lat: 28.65615, lng: 77.24101, name: "Red Fort, Delhi, India" },
    "hawa mahal": { lat: 26.92395, lng: 75.82670, name: "Hawa Mahal, Jaipur, India" },
    "golden temple": { lat: 31.62001, lng: 74.87655, name: "Golden Temple, Amritsar, India" },
    "mount fuji": { lat: 35.36050, lng: 138.72740, name: "Mount Fuji, Japan" },
    "tokyo tower": { lat: 35.65858, lng: 139.74544, name: "Tokyo Tower, Japan" },
    "shibuya crossing": { lat: 35.65940, lng: 139.70060, name: "Shibuya Crossing, Tokyo, Japan" },
    "fushimi inari": { lat: 34.96714, lng: 135.77270, name: "Fushimi Inari Shrine, Kyoto, Japan" },
    "angkor wat": { lat: 13.41249, lng: 103.86698, name: "Angkor Wat, Siem Reap, Cambodia" },
    "great wall": { lat: 40.43174, lng: 116.57040, name: "Great Wall of China, Badaling" },
    "great wall of china": { lat: 40.43174, lng: 116.57040, name: "Great Wall of China, Badaling" },
    "forbidden city": { lat: 39.91650, lng: 116.39720, name: "Forbidden City, Beijing, China" },
    "petronas towers": { lat: 3.15778, lng: 101.71170, name: "Petronas Towers, Kuala Lumpur, Malaysia" },
    "marina bay sands": { lat: 1.28350, lng: 103.86080, name: "Marina Bay Sands, Singapore" },
    "burj khalifa": { lat: 25.19720, lng: 55.27437, name: "Burj Khalifa, Dubai, UAE" },
    "palm jumeirah": { lat: 25.11243, lng: 55.13890, name: "Palm Jumeirah, Dubai, UAE" },
    "petra": { lat: 30.32854, lng: 35.44425, name: "Petra, Jordan" },

    // Americas
    "statue of liberty": { lat: 40.68925, lng: -74.04445, name: "Statue of Liberty, New York, USA" },
    "times square": { lat: 40.75800, lng: -73.98560, name: "Times Square, New York, USA" },
    "central park": { lat: 40.78230, lng: -73.96530, name: "Central Park, New York, USA" },
    "brooklyn bridge": { lat: 40.70607, lng: -73.99683, name: "Brooklyn Bridge, New York, USA" },
    "empire state": { lat: 40.74843, lng: -73.98566, name: "Empire State Building, New York, USA" },
    "golden gate bridge": { lat: 37.81990, lng: -122.47830, name: "Golden Gate Bridge, San Francisco, USA" },
    "hollywood sign": { lat: 34.13416, lng: -118.32154, name: "Hollywood Sign, Los Angeles, USA" },
    "grand canyon": { lat: 36.05470, lng: -112.14010, name: "Grand Canyon, Arizona, USA" },
    "niagara falls": { lat: 43.08280, lng: -79.07420, name: "Niagara Falls, Ontario, Canada" },
    "machu picchu": { lat: -13.16305, lng: -72.54497, name: "Machu Picchu, Cusco, Peru" },
    "christ the redeemer": { lat: -22.95192, lng: -43.21070, name: "Christ the Redeemer, Rio de Janeiro, Brazil" },
    "chichen itza": { lat: 20.68297, lng: -88.56825, name: "Chichén Itzá, Mexico" },
    "white house": { lat: 38.89767, lng: -77.03655, name: "The White House, Washington DC, USA" },
    "las vegas strip": { lat: 36.11465, lng: -115.17280, name: "Las Vegas Strip, Nevada, USA" },

    // Africa & Oceania
    "pyramids of giza": { lat: 29.97742, lng: 31.13225, name: "Pyramids of Giza, Egypt" },
    "great pyramid": { lat: 29.97916, lng: 31.13421, name: "Great Pyramid of Giza, Egypt" },
    "sphinx": { lat: 29.97531, lng: 31.13775, name: "Great Sphinx of Giza, Egypt" },
    "table mountain": { lat: -33.96254, lng: 18.40352, name: "Table Mountain, Cape Town, South Africa" },
    "sydney opera house": { lat: -33.85680, lng: 151.21530, name: "Sydney Opera House, Australia" },
    "sydney harbour bridge": { lat: -33.85230, lng: 151.21080, name: "Sydney Harbour Bridge, Australia" },
    "uluru": { lat: -25.34430, lng: 131.03690, name: "Uluru (Ayers Rock), Australia" },

    // Scenic / Nature
    "mount everest": { lat: 27.98800, lng: 86.92500, name: "Mount Everest Base Camp, Nepal" },
    "northern lights": { lat: 69.64907, lng: 18.95507, name: "Tromsø, Norway (Northern Lights)" },
    "aurora borealis": { lat: 69.64907, lng: 18.95507, name: "Tromsø, Norway (Northern Lights)" },
    "maldives": { lat: 4.17560, lng: 73.50930, name: "Maldives" },
    "bora bora": { lat: -16.50055, lng: -151.74147, name: "Bora Bora, French Polynesia" },
    "victoria falls": { lat: -17.92428, lng: 25.85673, name: "Victoria Falls, Zambia/Zimbabwe" },
    "iguazu falls": { lat: -25.69530, lng: -54.43680, name: "Iguazú Falls, Argentina/Brazil" },
    "ha long bay": { lat: 20.91010, lng: 107.18240, name: "Ha Long Bay, Vietnam" },
    "banff": { lat: 51.17840, lng: -115.57080, name: "Banff National Park, Canada" },
};

/**
 * Smart autocomplete — tries landmark DB first, then Photon API
 * Returns results formatted for SearchBar.jsx dropdown
 */
const getPredictions = async (query, limit = 7) => {
    if (!query || query.trim().length < 2) return [];

    const q = query.trim().toLowerCase();
    const results = [];

    // ── Step 1: Check landmark database (instant, guaranteed quality) ──
    const landmarkMatches = Object.entries(LANDMARK_DATABASE)
        .filter(([key]) => {
            // Fuzzy match: check if query is contained in key or key starts with query
            return key.includes(q) || q.split(" ").every((word) => key.includes(word));
        })
        .slice(0, 3) // Max 3 landmark results
        .map(([key, data]) => ({
            place_id: `landmark_${key.replace(/\s+/g, "_")}`,
            description: data.name,
            structured_formatting: {
                main_text: data.name.split(",")[0].trim(),
                secondary_text: data.name.split(",").slice(1).join(",").trim(),
            },
            _coords: {
                lat: data.lat,
                lng: data.lng,
            },
            _source: "landmark_db",
            _quality: 10, // Highest quality — exact coordinates
        }));

    results.push(...landmarkMatches);

    // ── Step 2: Fetch from Photon API (broader coverage) ──
    try {
        const photonUrl = `${PHOTON_BASE}?q=${encodeURIComponent(query.trim())}&limit=${limit + 3}&lang=en`;

        const response = await fetch(photonUrl, {
            headers: { Accept: "application/json" },
        });

        if (response.ok) {
            const data = await response.json();

            if (data.features && data.features.length > 0) {
                const photonResults = data.features
                    .map((feature, index) => {
                        const props = feature.properties || {};
                        const coords = feature.geometry?.coordinates || [0, 0];

                        // Build readable description
                        const nameParts = [];
                        if (props.name) nameParts.push(props.name);
                        if (props.street) nameParts.push(props.street);
                        if (props.city || props.town || props.village) {
                            nameParts.push(props.city || props.town || props.village);
                        }
                        if (props.state) nameParts.push(props.state);
                        if (props.country) nameParts.push(props.country);

                        const description =
                            nameParts.length > 0
                                ? nameParts.join(", ")
                                : "Unknown Location";

                        const mainText =
                            props.name ||
                            props.street ||
                            props.city ||
                            description.split(",")[0];

                        const secondaryText =
                            nameParts.slice(1).join(", ") || props.country || "";

                        // Quality scoring for Photon results
                        let quality = 5;
                        const osmValue = (props.osm_value || "").toLowerCase();
                        const osmKey = (props.osm_key || "").toLowerCase();

                        // Boost tourism/landmark/attraction results
                        if (osmValue === "attraction" || osmValue === "museum") quality = 8;
                        if (osmValue === "monument" || osmValue === "memorial") quality = 8;
                        if (osmValue === "viewpoint") quality = 9;
                        if (osmKey === "tourism") quality = Math.max(quality, 7);
                        if (osmKey === "historic") quality = Math.max(quality, 7);
                        if (osmValue === "city" || osmValue === "town") quality = 6;
                        if (osmValue === "village" || osmValue === "hamlet") quality = 4;

                        // Boost results that have a name matching the query
                        if (
                            props.name &&
                            props.name.toLowerCase().includes(q)
                        ) {
                            quality += 1;
                        }

                        return {
                            place_id: `photon_${props.osm_id || index}_${index}`,
                            description,
                            structured_formatting: {
                                main_text: mainText,
                                secondary_text: secondaryText,
                            },
                            _coords: {
                                lat: coords[1],
                                lng: coords[0],
                            },
                            _source: "photon",
                            _quality: quality,
                            _osmType: osmValue,
                        };
                    })
                    // Filter out results that duplicate landmark DB results
                    .filter((photonResult) => {
                        return !landmarkMatches.some(
                            (lm) =>
                                Math.abs(lm._coords.lat - photonResult._coords.lat) < 0.001 &&
                                Math.abs(lm._coords.lng - photonResult._coords.lng) < 0.001
                        );
                    });

                results.push(...photonResults);
            }
        }
    } catch (error) {
        console.warn("Photon API error:", error);
    }

    // ── Step 3: Sort by quality and deduplicate ──
    const sorted = results
        .sort((a, b) => (b._quality || 0) - (a._quality || 0))
        .slice(0, limit);

    return sorted;
};

/**
 * Reverse geocode: coordinates → address string
 */
const reverseGeocode = async (lat, lng) => {
    try {
        const url = `${PHOTON_BASE}/reverse?lat=${lat}&lon=${lng}&limit=1&lang=en`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.features && data.features.length > 0) {
            const props = data.features[0].properties;
            const parts = [];
            if (props.name) parts.push(props.name);
            if (props.city || props.town) parts.push(props.city || props.town);
            if (props.country) parts.push(props.country);
            return parts.join(", ") || "Unknown Location";
        }

        return "Unknown Location";
    } catch (error) {
        console.error("Reverse geocode error:", error);
        return "Unknown Location";
    }
};

export const placesService = {
    getPredictions,
    reverseGeocode,
    LANDMARK_DATABASE,
};