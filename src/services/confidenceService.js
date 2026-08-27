// src/services/confidenceService.js

// Language database (local - no API needed)
const LANGUAGE_DATABASE = {
    'tokyo': { primary: 'Japanese', difficulty: 3, score: 60 },
    'paris': { primary: 'French', difficulty: 2, score: 75 },
    'london': { primary: 'English', difficulty: 1, score: 95 },
    'berlin': { primary: 'German', difficulty: 2, score: 75 },
    'bangkok': { primary: 'Thai', difficulty: 3, score: 50 },
    'dubai': { primary: 'Arabic/English', difficulty: 2, score: 80 },
    'singapore': { primary: 'English/Mandarin', difficulty: 1, score: 90 },
    'mumbai': { primary: 'Hindi/English', difficulty: 1, score: 95 },
    'delhi': { primary: 'Hindi/English', difficulty: 1, score: 95 },
    'new york': { primary: 'English', difficulty: 1, score: 95 },
    'sydney': { primary: 'English', difficulty: 1, score: 95 },
    'rome': { primary: 'Italian', difficulty: 2, score: 70 },
    'barcelona': { primary: 'Catalan/Spanish', difficulty: 2, score: 75 },
    'amsterdam': { primary: 'Dutch/English', difficulty: 1, score: 90 },
    'istanbul': { primary: 'Turkish/English', difficulty: 2, score: 75 },
    'mexico city': { primary: 'Spanish/English', difficulty: 1, score: 85 },
    'buenos aires': { primary: 'Spanish/English', difficulty: 1, score: 85 },
    'toronto': { primary: 'English', difficulty: 1, score: 95 },
    'seoul': { primary: 'Korean/English', difficulty: 2, score: 70 },
    'shanghai': { primary: 'Mandarin/English', difficulty: 2, score: 65 },
    'hong kong': { primary: 'Cantonese/English', difficulty: 1, score: 90 },
    'kuala lumpur': { primary: 'Malay/English', difficulty: 1, score: 85 },
    'jakarta': { primary: 'Indonesian', difficulty: 2, score: 65 },
    'manila': { primary: 'Filipino/English', difficulty: 1, score: 90 },
    'hanoi': { primary: 'Vietnamese', difficulty: 3, score: 55 },
    'prague': { primary: 'Czech/English', difficulty: 2, score: 75 },
    'budapest': { primary: 'Hungarian/English', difficulty: 2, score: 70 },
    'vienna': { primary: 'German/English', difficulty: 1, score: 85 },
    'zurich': { primary: 'German/English', difficulty: 1, score: 90 },
    'stockholm': { primary: 'Swedish/English', difficulty: 1, score: 95 },
    'copenhagen': { primary: 'Danish/English', difficulty: 1, score: 95 },
    'oslo': { primary: 'Norwegian/English', difficulty: 1, score: 95 },
    'helsinki': { primary: 'Finnish/English', difficulty: 1, score: 90 },
    'moscow': { primary: 'Russian', difficulty: 3, score: 50 },
    'st petersburg': { primary: 'Russian', difficulty: 3, score: 50 },
    'athens': { primary: 'Greek/English', difficulty: 2, score: 75 },
    'lisbon': { primary: 'Portuguese/English', difficulty: 2, score: 75 },
    'madrid': { primary: 'Spanish/English', difficulty: 1, score: 80 },
    'brussels': { primary: 'French/Dutch/English', difficulty: 1, score: 90 },
    'edinburgh': { primary: 'English', difficulty: 1, score: 95 },
    'dublin': { primary: 'English', difficulty: 1, score: 95 },
    'reykjavik': { primary: 'Icelandic/English', difficulty: 1, score: 90 },
    'cairo': { primary: 'Arabic/English', difficulty: 2, score: 70 },
    'marrakech': { primary: 'Arabic/French', difficulty: 2, score: 65 },
    'cape town': { primary: 'English/Afrikaans', difficulty: 1, score: 90 },
    'nairobi': { primary: 'Swahili/English', difficulty: 1, score: 85 },
    'rio de janeiro': { primary: 'Portuguese', difficulty: 2, score: 65 },
    'sao paulo': { primary: 'Portuguese', difficulty: 2, score: 65 },
    'lima': { primary: 'Spanish/English', difficulty: 1, score: 75 },
    'bogota': { primary: 'Spanish/English', difficulty: 1, score: 75 },
    'santiago': { primary: 'Spanish/English', difficulty: 1, score: 80 },
    'vancouver': { primary: 'English', difficulty: 1, score: 95 },
    'montreal': { primary: 'French/English', difficulty: 1, score: 90 },
    'chicago': { primary: 'English', difficulty: 1, score: 95 },
    'los angeles': { primary: 'English/Spanish', difficulty: 1, score: 95 },
    'san francisco': { primary: 'English', difficulty: 1, score: 95 },
    'miami': { primary: 'English/Spanish', difficulty: 1, score: 95 },
    'boston': { primary: 'English', difficulty: 1, score: 95 },
    'seattle': { primary: 'English', difficulty: 1, score: 95 },
    'las vegas': { primary: 'English', difficulty: 1, score: 95 },
    'orlando': { primary: 'English', difficulty: 1, score: 95 },
    'melbourne': { primary: 'English', difficulty: 1, score: 95 },
    'brisbane': { primary: 'English', difficulty: 1, score: 95 },
    'perth': { primary: 'English', difficulty: 1, score: 95 },
    'auckland': { primary: 'English', difficulty: 1, score: 95 },
    'queenstown': { primary: 'English', difficulty: 1, score: 95 },
};

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const cache = new Map();

// ============================================
// 1. NOMINATIM API - Get Coordinates
// ============================================
export async function getCoordinates(destination) {
    try {
        const cacheKey = `coords-${destination.toLowerCase()}`;

        // Check cache first
        if (cache.has(cacheKey)) {
            const cached = cache.get(cacheKey);
            if (Date.now() - cached.timestamp < CACHE_DURATION) {
                console.log('✓ Coordinates from cache');
                return cached.data;
            }
        }

        // Add a small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));

        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`;

        const response = await Promise.race([
            fetch(url, {
                headers: {
                    'User-Agent': 'Safari360-TravelApp/1.0 (lucky.kumar.ug23@nsut.ac.in)'
                }
            }),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), 15000) // 15s timeout
            )
        ]);

        if (!response.ok) {
            console.error('Nominatim API error:', response.status);
            throw new Error('Nominatim API failed');
        }

        const data = await response.json();

        if (data.length === 0) {
            console.error('Destination not found:', destination);
            throw new Error('Destination not found');
        }

        const coordinates = {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
            displayName: data[0].display_name
        };

        // Cache the result
        cache.set(cacheKey, {
            data: coordinates,
            timestamp: Date.now()
        });

        console.log('✓ Coordinates fetched from Nominatim:', coordinates);
        return coordinates;
    } catch (error) {
        console.error('❌ Error getting coordinates:', error);

        // Return fallback coordinates for common destinations
        const fallbackCoords = {
            'tokyo': { lat: 35.6762, lng: 139.6503, displayName: 'Tokyo, Japan' },
            'paris': { lat: 48.8566, lng: 2.3522, displayName: 'Paris, France' },
            'london': { lat: 51.5074, lng: -0.1278, displayName: 'London, UK' },
            'new york': { lat: 40.7128, lng: -74.0060, displayName: 'New York, USA' },
            'dubai': { lat: 25.2048, lng: 55.2708, displayName: 'Dubai, UAE' },
            'singapore': { lat: 1.3521, lng: 103.8198, displayName: 'Singapore' },
            'mumbai': { lat: 19.0760, lng: 72.8777, displayName: 'Mumbai, India' },
            'delhi': { lat: 28.7041, lng: 77.1025, displayName: 'Delhi, India' },
        };

        const destLower = destination.toLowerCase();
        if (fallbackCoords[destLower]) {
            console.log('⚠️ Using fallback coordinates for', destination);
            return fallbackCoords[destLower];
        }

        return null;
    }
}


// ============================================
// 2. WIKIDATA API - Get Safety Score
// ============================================
export async function getSafetyScore(destination) {
    try {
        const cacheKey = `safety-${destination.toLowerCase()}`;

        if (cache.has(cacheKey)) {
            const cached = cache.get(cacheKey);
            if (Date.now() - cached.timestamp < CACHE_DURATION) {
                console.log('✓ Safety score from cache');
                return cached.data;
            }
        }

        // Search for the destination on Wikidata
        const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(destination)}&language=en&format=json&origin=*`;

        const searchResponse = await Promise.race([
            fetch(searchUrl),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), 15000) // 15s timeout
            )
        ]);

        if (!searchResponse.ok) throw new Error('Wikidata search failed');

        const searchData = await searchResponse.json();

        if (!searchData.search || searchData.search.length === 0) {
            console.warn('⚠️ Destination not found on Wikidata, using default safety score');
            const defaultScore = 75;
            cache.set(cacheKey, { data: defaultScore, timestamp: Date.now() });
            return defaultScore;
        }

        const entityId = searchData.search[0].id;

        // Get detailed entity data
        const entityUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${entityId}&props=claims&language=en&format=json&origin=*`;

        const entityResponse = await Promise.race([
            fetch(entityUrl),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), 15000) // 15s timeout
            )
        ]);

        if (!entityResponse.ok) throw new Error('Wikidata entity fetch failed');

        const entityData = await entityResponse.json();
        const claims = entityData.entities[entityId].claims;

        // Calculate safety based on available claims
        let safetyScore = 70; // default baseline

        // Check for properties that indicate development and safety
        if (claims) {
            // Property P131: located in (helps determine development level)
            if (claims.P131) {
                safetyScore = 75;
            }

            // Property P17: country - check if it's a developed nation
            if (claims.P17) {
                safetyScore = 80;
            }

            // Check for capital city (generally safer with more security)
            if (claims.P1376) {
                safetyScore = 85;
            }

            // Adjust based on population (very large cities might have lower safety)
            if (claims.P1082) {
                try {
                    const population = claims.P1082[0].mainsnak.datavalue.value.amount;
                    if (population > 10000000) safetyScore -= 5; // Very large city
                } catch (e) {
                    // Ignore parsing errors
                }
            }
        }

        // Ensure score is within bounds
        safetyScore = Math.max(Math.min(safetyScore, 100), 40);

        cache.set(cacheKey, { data: safetyScore, timestamp: Date.now() });
        console.log('✓ Safety score fetched from Wikidata:', safetyScore);
        return safetyScore;
    } catch (error) {
        console.error('❌ Error getting safety score:', error);
        return 75; // Fallback score
    }
}

// ============================================
// 3. OPENWEATHER API - Get Weather Comfort
// ============================================
export async function getWeatherComfort(lat, lng, date) {
    try {
        const cacheKey = `weather-${lat}-${lng}-${date}`;

        if (cache.has(cacheKey)) {
            const cached = cache.get(cacheKey);
            if (Date.now() - cached.timestamp < CACHE_DURATION) {
                console.log('✓ Weather comfort from cache');
                return cached.data;
            }
        }

        const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
        if (!apiKey) {
            console.error('❌ OpenWeather API key not configured');
            throw new Error('OpenWeather API key not configured');
        }

        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;

        const response = await Promise.race([
            fetch(url),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), 15000) // 15s timeout
            )
        ]);

        if (!response.ok) {
            const errorData = await response.text();
            console.error('OpenWeather API error:', errorData);
            throw new Error('OpenWeather API failed');
        }

        const data = await response.json();

        // Calculate comfort score based on weather conditions
        const temp = data.main.temp;
        const humidity = data.main.humidity;
        const windSpeed = data.wind.speed;
        const condition = data.weather[0].main;

        let comfortScore = 100;

        // Temperature adjustment (ideal 15-25°C)
        if (temp < 0 || temp > 40) comfortScore -= 20;
        else if (temp < 10 || temp > 35) comfortScore -= 10;
        else if (temp < 15 || temp > 30) comfortScore -= 5;

        // Humidity adjustment (ideal 40-60%)
        if (humidity < 30 || humidity > 80) comfortScore -= 10;
        else if (humidity < 40 || humidity > 70) comfortScore -= 5;

        // Wind speed adjustment (ideal < 10 m/s)
        if (windSpeed > 20) comfortScore -= 15;
        else if (windSpeed > 15) comfortScore -= 10;
        else if (windSpeed > 10) comfortScore -= 5;

        // Weather condition adjustment
        const badConditions = ['Thunderstorm', 'Tornado', 'Hurricane'];
        const moderateConditions = ['Rain', 'Snow', 'Sleet'];

        if (badConditions.includes(condition)) comfortScore -= 20;
        else if (moderateConditions.includes(condition)) comfortScore -= 10;

        const finalScore = Math.max(Math.min(comfortScore, 100), 20);

        cache.set(cacheKey, { data: finalScore, timestamp: Date.now() });
        console.log('✓ Weather comfort fetched from OpenWeather:', finalScore);
        return finalScore;
    } catch (error) {
        console.error('❌ Error getting weather comfort:', error);
        return 75; // Fallback score
    }
}

// ============================================
// 4. SMART FALLBACK - Get Crowd Level (No API)
// ============================================
export function getCrowdLevel(destination, date) {
    const cacheKey = `crowd-${destination.toLowerCase()}-${date}`;

    if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log('✓ Crowd level from cache');
            return cached.data;
        }
    }

    // Smart calculation based on date and destination
    const travelDate = new Date(date);
    const month = travelDate.getMonth(); // 0-11
    const dayOfWeek = travelDate.getDay(); // 0=Sunday, 6=Saturday

    let crowdScore = 50; // baseline

    // Peak tourist months (summer & holidays)
    if ([5, 6, 7].includes(month)) crowdScore += 20; // Jun, Jul, Aug
    else if ([11, 0].includes(month)) crowdScore += 15; // Dec, Jan
    else if ([3, 4, 9, 10].includes(month)) crowdScore += 10; // Apr, May, Oct, Nov

    // Weekend bonus
    if ([0, 6].includes(dayOfWeek)) crowdScore += 8;

    // Popular destinations
    const destinationLower = destination.toLowerCase();
    const popularDestinations = {
        'tokyo': 15, 'paris': 18, 'london': 15, 'dubai': 12,
        'new york': 17, 'singapore': 10, 'barcelona': 16, 'rome': 18,
        'amsterdam': 14, 'bangkok': 12, 'bali': 13, 'maldives': 10,
    };

    for (const [dest, bonus] of Object.entries(popularDestinations)) {
        if (destinationLower.includes(dest)) {
            crowdScore += bonus;
            break;
        }
    }

    // February penalty (low season)
    if (month === 1) crowdScore -= 10;

    // Cap between 30-90
    crowdScore = Math.max(30, Math.min(90, crowdScore));

    cache.set(cacheKey, { data: crowdScore, timestamp: Date.now() });
    console.log('✓ Crowd level calculated (smart algorithm):', crowdScore);
    return crowdScore;
}


// ============================================
// LOCAL DATABASE - Get Language Friendliness
// ============================================
export function getLanguageFriendliness(destination) {
    const destination_lower = destination.toLowerCase();

    // Check exact match
    if (LANGUAGE_DATABASE[destination_lower]) {
        const data = LANGUAGE_DATABASE[destination_lower];
        console.log(`✓ Language friendliness from database: ${data.primary}`);
        return data.score;
    }

    // Check partial match
    for (const [key, value] of Object.entries(LANGUAGE_DATABASE)) {
        if (destination_lower.includes(key) || key.includes(destination_lower)) {
            console.log(`✓ Language friendliness from database (partial match): ${value.primary}`);
            return value.score;
        }
    }

    // Default fallback
    console.warn('⚠️ Language not in database, using default');
    return 70;
}

// ============================================
// MAIN FUNCTION - Fetch All Scores
// ============================================
export async function fetchConfidenceScores(destination, travelDate, coordinates = null) {
    try {
        console.log('🚀 Starting confidence score calculation...');

        // Step 1: Get coordinates if not provided (needed for weather)
        const finalCoords = coordinates || await getCoordinates(destination);
        if (!finalCoords) {
            throw new Error('Could not get destination coordinates');
        }

        // Step 2: Fetch all scores in parallel
        const [
            safety,
            weather,
            language
        ] = await Promise.all([
            getSafetyScore(destination),
            getWeatherComfort(finalCoords.lat, finalCoords.lng, travelDate),
            Promise.resolve(getLanguageFriendliness(destination))
        ]);

        // Get crowd level synchronously (no API needed)
        const crowd = getCrowdLevel(destination, travelDate);


        // Step 3: Calculate weighted overall score
        const weights = {
            safety: 0.30,     // 30%
            weather: 0.25,    // 25%
            crowd: 0.25,      // 25%
            language: 0.20    // 20%
        };

        const overall = Math.round(
            (safety * weights.safety) +
            (weather * weights.weather) +
            (crowd * weights.crowd) +
            (language * weights.language)
        );

        const result = {
            safety,
            weather,
            crowd,
            language,
            overall,
            coordinates: finalCoords,
            timestamp: Date.now()
        };

        console.log('✅ All scores calculated successfully:', result);
        return result;
    } catch (error) {
        console.error('❌ Error in fetchConfidenceScores:', error);
        throw error;
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function getTravelTips(scores) {
    const tips = [];

    if (scores.safetyScore < 60) {
        tips.push('🛡️ Increase safety measures - avoid isolated areas at night');
    }

    if (scores.weatherScore < 50) {
        tips.push('☀️ Pack weather-appropriate gear - challenging conditions expected');
    }

    if (scores.crowdScore > 75) {
        tips.push('👥 Book accommodations early - peak season expected');
    }

    if (scores.languageScore < 70) {
        tips.push('🗣️ Learn basic phrases - limited English spoken');
    }

    if (scores.overallScore < 50) {
        tips.push('⚠️ Consider alternative destinations with better conditions');
    }

    if (tips.length === 0) {
        tips.push('✅ Great destination choice! Enjoy your trip!');
    }

    return tips;
}

export function clearCache() {
    cache.clear();
    console.log('🗑️ Cache cleared');
}

export function getCacheStats() {
    return {
        size: cache.size,
        entries: Array.from(cache.keys())
    };
}
