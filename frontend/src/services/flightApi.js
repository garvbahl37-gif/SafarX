// frontend/src/services/flightApi.js

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 60000,
});

const CABIN_CLASS_MAP = {
    'Economy': 2,
    'PremiumEconomy': 3,
    'Business': 4,
    'First': 6,
};

export const searchFlights = async (searchParams) => {
    const { from, to, departure, returnDate, passengers, travelClass, tripType } = searchParams;

    if (!from || !to || !departure) {
        throw new Error('Please fill in origin, destination and departure date');
    }

    const payload = {
        origin: from.toUpperCase().trim(),
        destination: to.toUpperCase().trim(),
        departure_date: departure,
        return_date: tripType === 'round' ? returnDate : null,
        adult_count: passengers,
        child_count: 0,
        infant_count: 0,
        cabin_class: CABIN_CLASS_MAP[travelClass] || 2,
        trip_type: tripType === 'round' ? 'round' : 'one-way',
        direct_flight: false,
    };

    const response = await apiClient.post('/flights/search', payload);
    return response.data;
};

export const bookFlight = async (bookingData) => {
    const response = await apiClient.post('/flights/book', bookingData);
    return response.data;
};

export const ticketFlightLCC = async (ticketData) => {
    const response = await apiClient.post('/flights/ticket/lcc', ticketData);
    return response.data;
};

export const ticketFlightNonLCC = async (ticketData) => {
    const response = await apiClient.post('/flights/ticket/non-lcc', ticketData);
    return response.data;
};

export const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) return 'N/A';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
};

export const formatFare = (amount) => {
    if (!amount && amount !== 0) return '₹--';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};

/**
 * Parses TBO datetime strings which come in multiple formats:
 * Format 1: "2026-03-20T06:30:00"          → standard ISO
 * Format 2: "/Date(1742444400000+0530)/"    → .NET JSON date
 * Format 3: "2026-03-20T06:30:00+05:30"    → ISO with timezone
 */
export const formatTime = (dateTimeStr) => {
    if (!dateTimeStr) return '--:--';

    try {
        let date;

        // ── Handle .NET /Date(timestamp+offset)/ format ───────
        // TBO sometimes returns this format from older endpoints
        const dotNetMatch = dateTimeStr.match(/\/Date\((\d+)([+-]\d{4})?\)\//);
        if (dotNetMatch) {
            date = new Date(parseInt(dotNetMatch[1]));
        } else {
            // ── Handle standard ISO format ─────────────────────
            date = new Date(dateTimeStr);
        }

        // Check if date is valid
        if (isNaN(date.getTime())) return '--:--';

        // Format as HH:MM in 24hr
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Asia/Kolkata', // IST for Indian flights
        });

    } catch {
        return '--:--';
    }
};

export const formatDate = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    try {
        let date;
        const dotNetMatch = dateTimeStr.match(/\/Date\((\d+)([+-]\d{4})?\)\//);
        if (dotNetMatch) {
            date = new Date(parseInt(dotNetMatch[1]));
        } else {
            date = new Date(dateTimeStr);
        }
        if (isNaN(date.getTime())) return dateTimeStr;
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return dateTimeStr;
    }
};

// Check if arrival is next day compared to departure
export const isNextDay = (depStr, arrStr) => {
    if (!depStr || !arrStr) return false;
    try {
        const dep = new Date(depStr);
        const arr = new Date(arrStr);
        if (isNaN(dep.getTime()) || isNaN(arr.getTime())) return false;
        return arr.getDate() > dep.getDate() || arr.getMonth() > dep.getMonth();
    } catch {
        return false;
    }
};