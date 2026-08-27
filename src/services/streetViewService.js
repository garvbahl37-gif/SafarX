// streetViewService.js
// ══════════════════════════════════════════════════════════════════
// MULTI-SOURCE PANORAMA ENGINE
// Searches 7+ free sources for the best quality VR panorama
// Zero API keys required — everything is free
// ══════════════════════════════════════════════════════════════════

/* ─── Source Registry ────────────────────────────────────────────
   Each source has: search(), getImageUrl(), quality rating
   Sources are tried in order until we find a panorama
   ─────────────────────────────────────────────────────────────── */

const SOURCES = {
    GOOGLE_SV: "google_streetview",
    WIKIMEDIA_PANO: "wikimedia_panorama",
    WIKIMEDIA_IMAGE: "wikimedia_image",
    FLICKR_PANO: "flickr_panorama",
    PANORAMAX: "panoramax",
    BING_STREETSIDE: "bing_streetside",
    WIKIPEDIA_IMAGE: "wikipedia_image",
    GENERATED: "generated",
};

/* ══════════════════════════════════════════════════════════════════
   MAIN API — Called by VRScene.jsx
   ══════════════════════════════════════════════════════════════════ */

/**
 * Search all sources for the best available panorama
 * Returns metadata about what was found
 */
export const getStreetViewMetadata = async (lat, lng) => {
    console.log(`[PanoEngine] Searching for panoramas near ${lat}, ${lng}`);

    // Run all searches in parallel for speed
    const results = await Promise.allSettled([
        searchGoogleStreetView(lat, lng),
        searchWikimediaPanoramas(lat, lng),
        searchFlickrPanoramas(lat, lng),
        searchPanoramax(lat, lng),
        searchWikipediaImages(lat, lng),
        searchWikimediaImages(lat, lng),
    ]);

    // Collect successful results
    const found = results
        .filter((r) => r.status === "fulfilled" && r.value?.available)
        .map((r) => r.value)
        .sort((a, b) => (b.quality || 0) - (a.quality || 0)); // Sort by quality

    console.log(
        `[PanoEngine] Found ${found.length} sources:`,
        found.map((f) => `${f.source}(q:${f.quality})`)
    );

    if (found.length > 0) {
        const best = found[0];
        console.log(`[PanoEngine] Best source: ${best.source} (quality: ${best.quality})`);
        return best;
    }

    // Fallback: Generate panorama from map tiles (always works)
    console.log("[PanoEngine] Using generated panorama fallback");
    return {
        available: true,
        imageId: `generated_${lat}_${lng}`,
        panoId: `generated_${lat}_${lng}`,
        isPano: true,
        lat,
        lng,
        compassAngle: 0,
        source: SOURCES.GENERATED,
        quality: 1,
    };
};

/**
 * Get the actual image URL(s) for loading into Three.js
 * Called by VRPanoramaViewer after getStreetViewMetadata
 */
export const getImageUrls = async (imageId) => {
    try {
        // Parse the source from imageId prefix
        if (imageId.startsWith("gsv_")) {
            return await getGoogleSVImageUrls(imageId);
        }
        if (imageId.startsWith("wiki_")) {
            return await getWikimediaImageUrl(imageId);
        }
        if (imageId.startsWith("flickr_")) {
            return await getFlickrImageUrl(imageId);
        }
        if (imageId.startsWith("pmax_")) {
            return await getPanoramaxImageUrl(imageId);
        }
        if (imageId.startsWith("wpimg_")) {
            return await getWikipediaImageUrl(imageId);
        }
        if (imageId.startsWith("generated_")) {
            const parts = imageId.replace("generated_", "").split("_");
            return {
                id: imageId,
                source: SOURCES.GENERATED,
                lat: parseFloat(parts[0]),
                lng: parseFloat(parts[1]),
                isPano: true,
            };
        }

        return null;
    } catch (error) {
        console.error("[PanoEngine] getImageUrls error:", error);
        return null;
    }
};

/**
 * Get nearby navigation points
 */
export const getNearbyImages = async (imageId) => {
    if (imageId.startsWith("generated_") || imageId.startsWith("gsv_")) {
        const lat = parseFloat(imageId.split("_")[1]) || 0;
        const lng = parseFloat(imageId.split("_")[2]) || 0;
        const offset = 0.0005;
        return [
            { imageId: `generated_${lat + offset}_${lng}`, lat: lat + offset, lng, direction: "North" },
            { imageId: `generated_${lat}_${lng + offset}`, lat, lng: lng + offset, direction: "East" },
            { imageId: `generated_${lat - offset}_${lng}`, lat: lat - offset, lng, direction: "South" },
            { imageId: `generated_${lat}_${lng - offset}`, lat, lng: lng - offset, direction: "West" },
        ];
    }
    return [];
};

/**
 * Generate panorama tiles for canvas stitching
 */
export const generatePanoramaTiles = (lat, lng) => {
    const tiles = [];
    const directions = [
        { heading: 0, label: "N" },
        { heading: 45, label: "NE" },
        { heading: 90, label: "E" },
        { heading: 135, label: "SE" },
        { heading: 180, label: "S" },
        { heading: 225, label: "SW" },
        { heading: 270, label: "W" },
        { heading: 315, label: "NW" },
    ];

    for (const dir of directions) {
        const rad = (dir.heading * Math.PI) / 180;
        const oLat = lat + Math.cos(rad) * 0.0001;
        const oLng = lng + Math.sin(rad) * 0.0001;

        // Use multiple tile sources for better quality
        tiles.push({
            heading: dir.heading,
            label: dir.label,
            // OpenStreetMap rendered tiles (multiple zoom levels for quality)
            urls: [
                `https://tile.openstreetmap.org/${18}/${lonToTileX(oLng, 18)}/${latToTileY(oLat, 18)}.png`,
                `https://a.tile.openstreetmap.fr/hot/${18}/${lonToTileX(oLng, 18)}/${latToTileY(oLat, 18)}.png`,
            ],
            lat: oLat,
            lng: oLng,
        });
    }

    return tiles;
};

/* ══════════════════════════════════════════════════════════════════
   SOURCE 1: Google Street View (Unofficial Tiles — Free)
   
   Google serves Street View tiles without an API key through
   their tile servers. This gives us proper 360° equirectangular
   panoramas at the highest quality available.
   ══════════════════════════════════════════════════════════════════ */

const searchGoogleStreetView = async (lat, lng) => {
    try {
        // Step 1: Find the nearest panorama ID using the unofficial endpoint
        const metaUrl = `https://maps.googleapis.com/maps/api/js/GeoPhotoService.SingleImageSearch?pb=!1m5!1sapiv3!5sUS!11m2!1m1!1b0!2m4!1m2!3d${lat}!4d${lng}!2d50!3m10!2m2!1sen!2sUS!9m1!1e2!11m4!1m3!1e2!2b1!3e2!4m10!1e1!1e2!1e3!1e4!1e8!1e6!5m1!1e2!6m1!1e2&callback=_xdc_._v2mub5`;

        const response = await fetch(metaUrl);
        if (!response.ok) return { available: false };

        const text = await response.text();

        // Parse the JSONP response to extract pano ID
        const panoIdMatch = text.match(/\[\[2,"([a-zA-Z0-9_-]+)"\]/);
        if (!panoIdMatch) {
            // Try alternative pattern
            const altMatch = text.match(/"([a-zA-Z0-9_-]{22,})"/);
            if (!altMatch) return { available: false };

            return {
                available: true,
                imageId: `gsv_${altMatch[1]}`,
                panoId: altMatch[1],
                isPano: true,
                lat,
                lng,
                source: SOURCES.GOOGLE_SV,
                quality: 10, // Highest quality
            };
        }

        return {
            available: true,
            imageId: `gsv_${panoIdMatch[1]}`,
            panoId: panoIdMatch[1],
            isPano: true,
            lat,
            lng,
            source: SOURCES.GOOGLE_SV,
            quality: 10,
        };
    } catch (error) {
        console.log("[GoogleSV] Search failed:", error.message);
        return { available: false };
    }
};

/**
 * Get Google Street View tile URLs for stitching
 * Google SV tiles are organized in zoom levels:
 * zoom=0: 1×1 (416×416)
 * zoom=1: 2×1 
 * zoom=2: 4×2
 * zoom=3: 8×4 (best quality for VR)
 * zoom=4: 16×8
 * zoom=5: 32×16 (ultra-high res)
 */
const getGoogleSVImageUrls = async (imageId) => {
    const panoId = imageId.replace("gsv_", "");

    // Use zoom level 3 (8×4 tiles = 3328×1664 total) for good VR quality
    // Or zoom level 4 (16×8 = 6656×3328) for ultra quality
    const zoom = 3;
    const tilesX = Math.pow(2, zoom); // 8 columns at zoom 3
    const tilesY = Math.pow(2, zoom - 1); // 4 rows at zoom 3

    const tiles = [];
    for (let y = 0; y < tilesY; y++) {
        for (let x = 0; x < tilesX; x++) {
            tiles.push({
                url: `https://streetviewpixels-pa.googleapis.com/v1/tile?cb_client=maps_sv.tactile&panoid=${panoId}&x=${x}&y=${y}&zoom=${zoom}&nbt=1&fover=2`,
                x,
                y,
                col: x,
                row: y,
            });
        }
    }

    return {
        id: imageId,
        panoId,
        source: SOURCES.GOOGLE_SV,
        isPano: true,
        tileMode: true,
        zoom,
        tilesX,
        tilesY,
        tileWidth: 512,
        tileHeight: 512,
        totalWidth: tilesX * 512,
        totalHeight: tilesY * 512,
        tiles,
    };
};

/* ══════════════════════════════════════════════════════════════════
   SOURCE 2: Wikimedia Commons 360° Panoramas
   Quality: ★★★★★ (professional panoramas, up to 20000px wide)
   ══════════════════════════════════════════════════════════════════ */

const searchWikimediaPanoramas = async (lat, lng) => {
    try {
        const url =
            `https://commons.wikimedia.org/w/api.php?` +
            new URLSearchParams({
                action: "query",
                format: "json",
                origin: "*",
                generator: "geosearch",
                ggscoord: `${lat}|${lng}`,
                ggsradius: "10000",
                ggslimit: "30",
                ggsnamespace: "6",
                prop: "imageinfo|categories",
                iiprop: "url|size|mime|extmetadata",
                iiurlwidth: "4096",
                cllimit: "20",
            }).toString();

        const response = await fetch(url);
        if (!response.ok) return { available: false };

        const data = await response.json();
        const pages = data.query?.pages;
        if (!pages) return { available: false };

        // Score each image for panorama quality
        let bestImage = null;
        let bestScore = 0;

        for (const page of Object.values(pages)) {
            const info = page.imageinfo?.[0];
            if (!info) continue;
            if (!info.mime?.startsWith("image/")) continue;

            const w = info.width || 0;
            const h = info.height || 0;
            if (w < 800 || h < 400) continue;

            const ratio = w / h;
            const cats = (page.categories || []).map((c) => c.title.toLowerCase());
            const title = (page.title || "").toLowerCase();
            const desc = info.extmetadata?.ImageDescription?.value?.toLowerCase() || "";

            // Calculate panorama score
            let score = 0;

            // Aspect ratio scoring (equirectangular is 2:1)
            if (ratio >= 1.9 && ratio <= 2.1) score += 50; // Perfect equirectangular
            else if (ratio >= 1.7 && ratio <= 2.3) score += 40;
            else if (ratio >= 1.5) score += 20;
            else score += 5;

            // Category/title scoring
            if (cats.some((c) => c.includes("equirectangular"))) score += 40;
            if (cats.some((c) => c.includes("360"))) score += 35;
            if (cats.some((c) => c.includes("panorama"))) score += 30;
            if (cats.some((c) => c.includes("spherical"))) score += 35;
            if (title.includes("panorama")) score += 20;
            if (title.includes("360")) score += 25;
            if (title.includes("equirectangular")) score += 30;
            if (desc.includes("360")) score += 15;
            if (desc.includes("panorama")) score += 10;

            // Resolution scoring
            if (w >= 8000) score += 30;
            else if (w >= 4000) score += 20;
            else if (w >= 2000) score += 10;

            // Pixels total
            score += Math.min(20, Math.floor((w * h) / 1000000));

            if (score > bestScore) {
                bestScore = score;
                bestImage = {
                    available: true,
                    imageId: `wiki_${encodeURIComponent(page.title.replace("File:", ""))}`,
                    panoId: `wiki_${encodeURIComponent(page.title.replace("File:", ""))}`,
                    isPano: ratio >= 1.7,
                    lat,
                    lng,
                    source: SOURCES.WIKIMEDIA_PANO,
                    quality: Math.min(9, Math.floor(score / 15)),
                    thumbUrl: info.thumburl || info.url,
                    originalUrl: info.url,
                    width: w,
                    height: h,
                    title: page.title,
                    score,
                };
            }
        }

        // Only return if quality is decent
        if (bestImage && bestScore >= 30) {
            return bestImage;
        }

        return { available: false };
    } catch (error) {
        console.log("[Wikimedia Pano] Error:", error.message);
        return { available: false };
    }
};

const getWikimediaImageUrl = async (imageId) => {
    try {
        const filename = decodeURIComponent(imageId.replace("wiki_", ""));
        const url =
            `https://commons.wikimedia.org/w/api.php?` +
            new URLSearchParams({
                action: "query",
                format: "json",
                origin: "*",
                titles: `File:${filename}`,
                prop: "imageinfo",
                iiprop: "url|size",
                iiurlwidth: "8192",
            }).toString();

        const response = await fetch(url);
        if (!response.ok) return null;

        const data = await response.json();
        const pages = data.query?.pages;
        if (!pages) return null;

        for (const page of Object.values(pages)) {
            const info = page.imageinfo?.[0];
            if (info) {
                return {
                    id: imageId,
                    source: SOURCES.WIKIMEDIA_PANO,
                    url2048: info.thumburl,
                    urlOriginal: info.url,
                    isPano: (info.width / info.height) >= 1.7,
                    width: info.width,
                    height: info.height,
                };
            }
        }
        return null;
    } catch {
        return null;
    }
};

/* ══════════════════════════════════════════════════════════════════
   SOURCE 3: Flickr Equirectangular Photos
   Quality: ★★★★☆ (Community 360° photos, free API)
   Flickr API key is free — no credit card needed
   Get one at: https://www.flickr.com/services/api/misc.api_keys.html
   ══════════════════════════════════════════════════════════════════ */

// Flickr API key (free, no card — sign up at flickr.com/services/api)
// If you don't have one, this source is simply skipped
const FLICKR_API_KEY = import.meta.env.VITE_FLICKR_API_KEY || "";

const searchFlickrPanoramas = async (lat, lng) => {
    if (!FLICKR_API_KEY) return { available: false };

    try {
        // Search for equirectangular/360 photos near the location
        const url =
            `https://api.flickr.com/services/rest/?` +
            new URLSearchParams({
                method: "flickr.photos.search",
                api_key: FLICKR_API_KEY,
                format: "json",
                nojsoncallback: "1",
                lat: lat.toString(),
                lon: lng.toString(),
                radius: "5", // 5km
                radius_units: "km",
                tags: "equirectangular,360,panorama,spherical",
                tag_mode: "any",
                content_type: "1", // Photos only
                media: "photos",
                extras: "url_o,url_l,url_k,o_dims,geo,tags",
                sort: "relevance",
                per_page: "10",
            }).toString();

        const response = await fetch(url);
        if (!response.ok) return { available: false };

        const data = await response.json();
        const photos = data.photos?.photo;
        if (!photos || photos.length === 0) return { available: false };

        // Find the best panorama
        for (const photo of photos) {
            const w = parseInt(photo.o_width || photo.width_o) || 0;
            const h = parseInt(photo.o_height || photo.height_o) || 0;
            const ratio = w / h;
            const tags = (photo.tags || "").toLowerCase();

            // Must be panoramic aspect ratio
            const isPano =
                ratio >= 1.7 ||
                tags.includes("equirectangular") ||
                tags.includes("360") ||
                tags.includes("spherical");

            if (!isPano) continue;

            // Get the highest quality URL available
            const imageUrl = photo.url_o || photo.url_k || photo.url_l;
            if (!imageUrl) continue;

            return {
                available: true,
                imageId: `flickr_${photo.id}`,
                panoId: `flickr_${photo.id}`,
                isPano: true,
                lat: parseFloat(photo.latitude) || lat,
                lng: parseFloat(photo.longitude) || lng,
                source: SOURCES.FLICKR_PANO,
                quality: 8,
                thumbUrl: imageUrl,
                originalUrl: photo.url_o || imageUrl,
                width: w,
                height: h,
                title: photo.title,
            };
        }

        return { available: false };
    } catch (error) {
        console.log("[Flickr] Error:", error.message);
        return { available: false };
    }
};

const getFlickrImageUrl = async (imageId) => {
    if (!FLICKR_API_KEY) return null;

    try {
        const photoId = imageId.replace("flickr_", "");
        const url =
            `https://api.flickr.com/services/rest/?` +
            new URLSearchParams({
                method: "flickr.photos.getSizes",
                api_key: FLICKR_API_KEY,
                format: "json",
                nojsoncallback: "1",
                photo_id: photoId,
            }).toString();

        const response = await fetch(url);
        if (!response.ok) return null;

        const data = await response.json();
        const sizes = data.sizes?.size;
        if (!sizes) return null;

        // Get the largest available size
        const original = sizes.find((s) => s.label === "Original");
        const large = sizes.find((s) => s.label === "Large 2048" || s.label === "Large");
        const best = original || large || sizes[sizes.length - 1];

        return {
            id: imageId,
            source: SOURCES.FLICKR_PANO,
            urlOriginal: best.source,
            url2048: (large || best).source,
            isPano: true,
            width: parseInt(best.width) || 4096,
            height: parseInt(best.height) || 2048,
        };
    } catch {
        return null;
    }
};

/* ══════════════════════════════════════════════════════════════════
   SOURCE 4: Panoramax (French Government / OpenStreetMap France)
   Quality: ★★★★☆ (Government-captured street imagery)
   Free API, no key needed
   Coverage: Excellent in France, growing in EU
   API: https://panoramax.openstreetmap.fr/api
   ══════════════════════════════════════════════════════════════════ */

const searchPanoramax = async (lat, lng) => {
    try {
        const url =
            `https://panoramax.openstreetmap.fr/api/search?` +
            new URLSearchParams({
                lon: lng.toString(),
                lat: lat.toString(),
                limit: "5",
            }).toString();

        const response = await fetch(url, {
            headers: { Accept: "application/json" },
        });
        if (!response.ok) return { available: false };

        const data = await response.json();
        const features = data.features;
        if (!features || features.length === 0) return { available: false };

        // Find closest feature with a picture
        const best = features[0];
        const coords = best.geometry?.coordinates;
        const props = best.properties || {};

        if (!props.id) return { available: false };

        return {
            available: true,
            imageId: `pmax_${props.id}`,
            panoId: `pmax_${props.id}`,
            isPano: true,
            lat: coords?.[1] || lat,
            lng: coords?.[0] || lng,
            source: SOURCES.PANORAMAX,
            quality: 7,
            capturedAt: props.datetime,
        };
    } catch (error) {
        console.log("[Panoramax] Error:", error.message);
        return { available: false };
    }
};

const getPanoramaxImageUrl = async (imageId) => {
    try {
        const id = imageId.replace("pmax_", "");

        // Get the HD image URL
        const url = `https://panoramax.openstreetmap.fr/api/pictures/${id}`;
        const response = await fetch(url, {
            headers: { Accept: "application/json" },
        });
        if (!response.ok) return null;

        const data = await response.json();

        // Panoramax serves images at different qualities
        const hdUrl =
            data.assets?.hd?.href ||
            data.assets?.sd?.href ||
            data.assets?.thumb?.href;

        if (!hdUrl) return null;

        return {
            id: imageId,
            source: SOURCES.PANORAMAX,
            urlOriginal: hdUrl,
            url2048: hdUrl,
            isPano: true,
            width: 4096,
            height: 2048,
        };
    } catch {
        return null;
    }
};

/* ══════════════════════════════════════════════════════════════════
   SOURCE 5: Wikipedia Featured Images
   Quality: ★★★☆☆ (High-quality editorial images of landmarks)
   Free, no key needed
   ══════════════════════════════════════════════════════════════════ */

const searchWikipediaImages = async (lat, lng) => {
    try {
        // Search Wikipedia for articles near the location
        const url =
            `https://en.wikipedia.org/w/api.php?` +
            new URLSearchParams({
                action: "query",
                format: "json",
                origin: "*",
                generator: "geosearch",
                ggscoord: `${lat}|${lng}`,
                ggsradius: "10000",
                ggslimit: "10",
                prop: "pageimages|coordinates",
                piprop: "original|thumbnail",
                pithumbsize: "2048",
                pilimit: "10",
            }).toString();

        const response = await fetch(url);
        if (!response.ok) return { available: false };

        const data = await response.json();
        const pages = data.query?.pages;
        if (!pages) return { available: false };

        // Find the best image
        let bestImage = null;
        let bestSize = 0;

        for (const page of Object.values(pages)) {
            const original = page.original;
            const thumb = page.thumbnail;

            if (!original?.source) continue;

            const w = original.width || 0;
            const h = original.height || 0;
            const pixels = w * h;

            if (pixels > bestSize && w >= 1000) {
                bestSize = pixels;
                bestImage = {
                    available: true,
                    imageId: `wpimg_${page.pageid}`,
                    panoId: `wpimg_${page.pageid}`,
                    isPano: w / h >= 1.7,
                    lat,
                    lng,
                    source: SOURCES.WIKIPEDIA_IMAGE,
                    quality: 5,
                    thumbUrl: thumb?.source || original.source,
                    originalUrl: original.source,
                    width: w,
                    height: h,
                    title: page.title,
                };
            }
        }

        return bestImage || { available: false };
    } catch (error) {
        console.log("[Wikipedia] Error:", error.message);
        return { available: false };
    }
};

const getWikipediaImageUrl = async (imageId) => {
    try {
        const pageId = imageId.replace("wpimg_", "");
        const url =
            `https://en.wikipedia.org/w/api.php?` +
            new URLSearchParams({
                action: "query",
                format: "json",
                origin: "*",
                pageids: pageId,
                prop: "pageimages",
                piprop: "original",
            }).toString();

        const response = await fetch(url);
        if (!response.ok) return null;

        const data = await response.json();
        const page = Object.values(data.query?.pages || {})[0];
        const original = page?.original;

        if (!original?.source) return null;

        return {
            id: imageId,
            source: SOURCES.WIKIPEDIA_IMAGE,
            urlOriginal: original.source,
            url2048: original.source,
            isPano: (original.width / original.height) >= 1.7,
            width: original.width,
            height: original.height,
        };
    } catch {
        return null;
    }
};

/* ══════════════════════════════════════════════════════════════════
   SOURCE 6: Wikimedia Commons General Images (Non-panorama)
   Lower priority but fills gaps
   ══════════════════════════════════════════════════════════════════ */

const searchWikimediaImages = async (lat, lng) => {
    try {
        const url =
            `https://commons.wikimedia.org/w/api.php?` +
            new URLSearchParams({
                action: "query",
                format: "json",
                origin: "*",
                generator: "geosearch",
                ggscoord: `${lat}|${lng}`,
                ggsradius: "5000",
                ggslimit: "15",
                ggsnamespace: "6",
                prop: "imageinfo",
                iiprop: "url|size|mime",
                iiurlwidth: "4096",
            }).toString();

        const response = await fetch(url);
        if (!response.ok) return { available: false };

        const data = await response.json();
        const pages = data.query?.pages;
        if (!pages) return { available: false };

        let bestImage = null;
        let bestSize = 0;

        for (const page of Object.values(pages)) {
            const info = page.imageinfo?.[0];
            if (!info) continue;
            if (!info.mime?.startsWith("image/")) continue;

            const w = info.width || 0;
            const h = info.height || 0;
            if (w < 1000) continue;

            const pixels = w * h;
            if (pixels > bestSize) {
                bestSize = pixels;
                bestImage = {
                    available: true,
                    imageId: `wiki_${encodeURIComponent(page.title.replace("File:", ""))}`,
                    panoId: `wiki_${encodeURIComponent(page.title.replace("File:", ""))}`,
                    isPano: w / h >= 1.7,
                    lat,
                    lng,
                    source: SOURCES.WIKIMEDIA_IMAGE,
                    quality: 4,
                    thumbUrl: info.thumburl || info.url,
                    originalUrl: info.url,
                    width: w,
                    height: h,
                };
            }
        }

        return bestImage || { available: false };
    } catch (error) {
        console.log("[Wikimedia Images] Error:", error.message);
        return { available: false };
    }
};

/* ══════════════════════════════════════════════════════════════════
   TILE MATH HELPERS
   ══════════════════════════════════════════════════════════════════ */

function lonToTileX(lon, zoom) {
    return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}

function latToTileY(lat, zoom) {
    return Math.floor(
        ((1 -
            Math.log(
                Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
            ) /
            Math.PI) /
            2) *
        Math.pow(2, zoom)
    );
}