/**
 * Trains API — IRCTC, proxied through this site's own /api/trains function
 * so the RapidAPI key stays server-side.
 */
const BASE_URL = '/api/trains';

const handleResponse = async (response) => {
    const isJson = (response.headers.get('content-type') || '').includes('application/json');
    if (!isJson) {
        throw new Error(
            response.status === 404
                ? 'Train search is not available on this build yet.'
                : `Train search is temporarily unavailable (${response.status}).`
        );
    }
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || `IRCTC is not responding (${response.status}).`);
    return body;
};

export const trainApi = {
    search: async (query) =>
        handleResponse(await fetch(`${BASE_URL}/search?query=${encodeURIComponent(query)}`)),
};
