/**
 * Stays API — Booking.com, proxied through this site's own /api/stays
 * functions so the RapidAPI key is never shipped to the browser.
 *
 * VITE_API_URL still wins when it is set, for pointing the app at a
 * self-hosted backend instead.
 */
/* Always same-origin: these functions are deployed alongside the site. */
const BASE_URL = '/api/stays';

const handleResponse = async (response) => {
    // A missing function falls through to the SPA, which answers with HTML.
    // Parsing that as JSON produced "Unexpected token '<'", which told the
    // traveller nothing about what actually went wrong.
    const isJson = (response.headers.get('content-type') || '').includes('application/json');
    if (!isJson) {
        throw new Error(
            response.status === 404
                ? 'Stay search is not available on this build yet.'
                : `Stay search is temporarily unavailable (${response.status}).`
        );
    }
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(body.error || body.detail || `Booking.com is not responding (${response.status}).`);
    }
    return body;
};

const buildQueryString = (params) => {
    const filtered = Object.entries(params)
        .filter(([, v]) => v !== null && v !== undefined && v !== '' && v !== 0)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    return filtered.length ? '?' + filtered.join('&') : '';
};

export const hotelApi = {
    searchLocation: async (query) =>
        handleResponse(await fetch(`${BASE_URL}/search-location${buildQueryString({ query })}`)),

    searchHotels: async (params) =>
        handleResponse(await fetch(`${BASE_URL}/search${buildQueryString(params)}`)),

    /* `parts` picks which sections to fetch: base, rooms, reviews, nearby. */
    getHotelDetails: async (params) =>
        handleResponse(await fetch(`${BASE_URL}/details${buildQueryString(params)}`)),
};
