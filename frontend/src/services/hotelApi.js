const BASE_URL = 'http://localhost:8000/api/hotels';

const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `HTTP error ${response.status}`);
    }
    return response.json();
};

const buildQueryString = (params) => {
    const filtered = Object.entries(params)
        .filter(([, v]) => v !== null && v !== undefined && v !== '' && v !== 0)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    return filtered.length ? '?' + filtered.join('&') : '';
};

export const hotelApi = {
    searchLocation: async (query) => {
        const qs = buildQueryString({ query });
        return handleResponse(await fetch(`${BASE_URL}/search-location${qs}`));
    },

    getFilters: async (geoId, checkIn, checkOut) => {
        const qs = buildQueryString({ geoId, checkIn, checkOut });
        return handleResponse(await fetch(`${BASE_URL}/filters${qs}`));
    },

    searchHotels: async (params) => {
        const qs = buildQueryString(params);
        return handleResponse(await fetch(`${BASE_URL}/search${qs}`));
    },

    searchHotelsByLocation: async (params) => {
        const qs = buildQueryString(params);
        return handleResponse(await fetch(`${BASE_URL}/search-by-location${qs}`));
    },

    getHotelDetails: async (params) => {
        const qs = buildQueryString(params);
        return handleResponse(await fetch(`${BASE_URL}/details${qs}`));
    },
};