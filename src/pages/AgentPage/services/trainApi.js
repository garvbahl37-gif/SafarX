/**
 * Trains API — IRCTC, proxied through this site's own /api/trains functions so
 * the RapidAPI key stays server-side.
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

const get = async (path) => handleResponse(await fetch(`${BASE_URL}/${path}`));

export const trainApi = {
    /** Trains by name or number, with their full timetable. */
    search: (query) => get(`search?query=${encodeURIComponent(query)}`),
    /** Everything running between two stations on a date. */
    between: (from, to, date) =>
        get(`between?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`),
    /** Where a train is right now. */
    live: (trainNo) => get(`live?trainNo=${encodeURIComponent(trainNo)}`),
    /** Ticket status. Never cached — the response names passengers. */
    pnr: (pnr) => get(`pnr?pnr=${encodeURIComponent(pnr)}`),
};
