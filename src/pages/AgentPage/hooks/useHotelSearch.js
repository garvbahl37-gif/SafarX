// frontend/src/hooks/useHotelSearch.js

import { useState, useCallback, useRef } from 'react';
import { hotelApi } from '../services/hotelApi';

export const useHotelSearch = () => {
    const [locationSuggestions, setLocationSuggestions] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [hotelDetails, setHotelDetails] = useState(null);

    const [loadingLocation, setLoadingLocation] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const [error, setError] = useState(null);
    const [sortDisclaimer, setSortDisclaimer] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    const debounceTimer = useRef(null);
    const lastQueryRef = useRef('');

    // ── Debounced location search ──────────────────────────────
    const searchLocation = useCallback((query) => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        const normalized = query.trim().toLowerCase();

        // skip short queries
        if (!normalized || normalized.length < 3) {
            setLocationSuggestions([]);
            return;
        }

        // skip duplicate queries
        if (lastQueryRef.current === normalized) {
            return;
        }

        debounceTimer.current = setTimeout(async () => {
            lastQueryRef.current = normalized;
            setLoadingLocation(true);
            setError(null);

            try {
                const result = await hotelApi.searchLocation(normalized);
                setLocationSuggestions(result.data || []);
            } catch (err) {
                if (err.response?.status === 429) {
                    // silently ignore rate limit
                    return;
                }
                setError(err.message);
                setLocationSuggestions([]);
            } finally {
                setLoadingLocation(false);
            }
        }, 700);
    }, []);

    // ── Search hotels ──────────────────────────────────────────
    const searchHotels = useCallback(async ({
        destId,
        searchType = 'CITY',
        checkIn,
        checkOut,
        adults = 2,
        rooms = 1,
        sort = null,
        rating = 0,
        currency = 'INR',
        page = 1,
    }) => {
        setLoadingSearch(true);
        setError(null);
        setHasSearched(true);

        try {
            const result = await hotelApi.searchHotels({
                destId,
                searchType,
                checkIn,
                checkOut,
                adults,
                rooms,
                sort,
                rating,
                currency,
                page,
            });
            setSearchResults(result.data || []);
            setSortDisclaimer(result.meta?.nights
                ? `Nightly rates include taxes and charges, averaged over ${result.meta.nights} night${result.meta.nights > 1 ? 's' : ''}.`
                : '');
        } catch (err) {
            setError(err.message);
            setSearchResults([]);
        } finally {
            setLoadingSearch(false);
        }
    }, []);

    // ── Get hotel details ──────────────────────────────────────
    const getHotelDetails = useCallback(async ({
        id,
        checkIn,
        checkOut,
        adults = 2,
        rooms = 1,
        currency = 'INR',
        parts = 'base',
    }) => {
        setLoadingDetails(true);
        setError(null);

        try {
            const result = await hotelApi.getHotelDetails({
                id, checkIn, checkOut, adults, rooms, currency, parts,
            });
            // Tabs load their own sections, so merge rather than replace —
            // opening Reviews must not wipe the photos already on screen.
            setHotelDetails((prev) =>
                parts === 'base' ? result.data : { ...(prev || {}), ...result.data }
            );
            setSelectedHotel(id);
            return result.data;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoadingDetails(false);
        }
    }, []);

    const clearResults = useCallback(() => {
        setSearchResults([]);
        setHasSearched(false);
        setError(null);
        setSortDisclaimer('');
    }, []);

    const closeDetails = useCallback(() => {
        setHotelDetails(null);
        setSelectedHotel(null);
    }, []);

    return {
        locationSuggestions,
        selectedLocation,
        searchResults,
        hotelDetails,
        selectedHotel,
        sortDisclaimer,
        hasSearched,
        loadingLocation,
        loadingSearch,
        loadingDetails,
        error,
        searchLocation,
        setSelectedLocation,
        setLocationSuggestions,
        searchHotels,
        getHotelDetails,
        clearResults,
        closeDetails,
    };
};