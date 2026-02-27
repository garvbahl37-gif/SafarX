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

    // ── Debounced location search ──────────────────────────────
    const searchLocation = useCallback((query) => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        if (!query || query.length < 2) {
            setLocationSuggestions([]);
            return;
        }

        debounceTimer.current = setTimeout(async () => {
            setLoadingLocation(true);
            setError(null);
            try {
                const result = await hotelApi.searchLocation(query);
                setLocationSuggestions(result.data || []);
            } catch (err) {
                setError(err.message);
                setLocationSuggestions([]);
            } finally {
                setLoadingLocation(false);
            }
        }, 400);
    }, []);

    // ── Search hotels ──────────────────────────────────────────
    const searchHotels = useCallback(async ({
        geoId,          // ← clean numeric id from backend
        checkIn,
        checkOut,
        adults = 2,
        rooms = 1,
        sort = null,
        rating = 0,
        currencyCode = 'USD',
        pageNumber = 1,
    }) => {
        setLoadingSearch(true);
        setError(null);
        setHasSearched(true);

        try {
            const result = await hotelApi.searchHotels({
                geoId,
                checkIn,
                checkOut,
                adults,
                rooms,
                sort,
                rating,
                currencyCode,
                pageNumber,
            });
            setSearchResults(result.data || []);
            setSortDisclaimer(result.sortDisclaimer || '');
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
        currency = 'USD',
    }) => {
        setLoadingDetails(true);
        setError(null);

        try {
            const result = await hotelApi.getHotelDetails({
                id,
                checkIn,
                checkOut,
                adults,
                rooms,
                currency,
            });
            setHotelDetails(result.data);
            setSelectedHotel(id);
        } catch (err) {
            setError(err.message);
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