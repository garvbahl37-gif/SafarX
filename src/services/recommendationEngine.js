/**
 * SafarX Hidden Gems Recommendation Engine
 * 
 * Logic to surface off-the-beaten-path destinations based on user location and filters.
 */

// Note: Usage requires passing the destinations dataset. 
// This allows for better testing and decoupling from the file system.

/**
 * Calculates the Haversine distance between two points in kilometers.
 * @param {number} lat1 User Latitude
 * @param {number} lon1 User Longitude
 * @param {number} lat2 Destination Latitude
 * @param {number} lon2 Destination Longitude
 * @returns {number} Distance in kilometers
 */
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return Number(d.toFixed(1));
};

const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
};

/**
 * Main function to get hidden gems.
 * 
 * @param {Object} params Input parameters
 * @param {number} params.userLat User's latitude
 * @param {number} params.userLon User's longitude
 * @param {string} params.selectedCountry Country to explore
 * @param {string} [params.preference] Optional: 'nature', 'cultural', 'adventure', 'relaxation', 'budget'
 * @param {Array} params.destinations The dataset of destinations to filter and rank
 * @returns {Object} Structured recommendation response
 */
export const getHiddenGems = ({ userLat, userLon, selectedCountry, preference = null, destinations = [] }) => {

    // 1. FILTERING
    let gems = destinations.filter(dest => {
        // Must match country (case-insensitive) OR allow "All"
        if (selectedCountry && selectedCountry !== "All" && dest.country.toLowerCase() !== selectedCountry.toLowerCase()) return false;

        // "Hidden Gem" Criteria:
        // - Popularity < 40 (Slightly lenient to catch 'emerging' gems)
        // - Crowd Level must be 'low' or 'medium' (exclude 'high')
        // - Type must NOT be 'megacity' or 'capital'
        const isHidden =
            dest.popularity_score < 40 &&
            dest.crowd_level !== 'high' &&
            !['megacity', 'capital'].includes(dest.destination_type);

        return isHidden;
    });

    // 2. SCORING & RANKING
    gems = gems.map(gem => {
        const distance = getDistanceKm(userLat, userLon, gem.latitude, gem.longitude);

        // Base Score: Start with 100
        let score = 100;

        // Proximity Boost: Closer is better (decay factor)
        // -5 points for every 1000km away
        score -= (distance / 1000) * 5;

        // Popularity Boost: Less popular is better for "hidden" aspect
        // Add (40 - popularity) points. E.g., pop 10 adds 30 pts.
        score += (40 - gem.popularity_score);

        // Safety Boost: +5 for every point above 7
        if (gem.safety_index > 7) {
            score += (gem.safety_index - 7) * 5;
        }

        // Preference Boost: +20 points if matches user preference
        if (preference && gem.travel_theme.toLowerCase() === preference.toLowerCase()) {
            score += 20;
        }

        // Special logic for 'budget' preference
        if (preference === 'budget' && gem.avg_budget_per_day < 50) {
            score += 25;
        }

        return {
            ...gem,
            distance_km: distance,
            match_score: Math.round(score)
        };
    });

    // Sort by Distance (Ascending) so nearest gems show first
    gems.sort((a, b) => a.distance_km - b.distance_km);

    // 3. ENRICHMENT (Why Hidden? & Image Query)
    gems = gems.map(gem => {
        return {
            id: gem.id,
            city: gem.city,
            country: gem.country,
            distance_km: gem.distance_km,
            // Prefer the rich "why_hidden" from JSON, fallback to template if missing
            why_hidden: gem.why_hidden || `A ${gem.crowd_level}-crowd ${gem.destination_type} perfect for ${gem.travel_theme} lovers.`,
            description: gem.description, // Pass through the rich description!
            destination_type: gem.destination_type,
            travel_theme: gem.travel_theme,
            avg_budget_per_day: gem.avg_budget_per_day,
            safety_index: gem.safety_index,
            image: gem.image, // Pass the correct image path!
            match_score: gem.match_score,
            coordinates: { lat: gem.latitude, lon: gem.longitude }
        };
    });

    return {
        user_location: {
            latitude: userLat,
            longitude: userLon,
            country: "Detected (Simulated)"
        },
        selected_country: selectedCountry,
        preference_applied: preference,
        hidden_gems: gems
    };
};
