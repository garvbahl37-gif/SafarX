/**
 * Static Image Service - Lightweight Version
 * Replaced pexels_images.json dependency with high-quality remote placeholders
 * to optimize project size.
 */

const FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80", // Paris
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80", // Dubai
    "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=800&q=80", // Venice
    "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=800&q=80", // London
    "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80", // Kyoto
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80", // Santorini
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80", // Road trip
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80", // Yosemite
];

/**
 * Get images for a city from the pre-fetched cache
 * @param {string} cityName - City name (e.g., "Paris", "Cape Town", "Bangkok")
 * @returns {Array} Array of image strings
 */
export const getCityImages = (cityName) => {
    return FALLBACK_IMAGES;
};

/**
 * Get a specific number of images for a city
 * @param {string} cityName - City name
 * @param {number} count - Number of images to return
 * @param {number} offset - Starting offset for variety
 * @returns {Array} Array of image objects
 */
export const getCityImagesSlice = (cityName, count = 10, offset = 0) => {
    const images = getCityImages(cityName);
    if (images.length === 0) return [];

    const result = [];
    for (let i = 0; i < count; i++) {
        const idx = (offset + i) % images.length;
        result.push(images[idx]);
    }
    return result;
};

export default FALLBACK_IMAGES;
