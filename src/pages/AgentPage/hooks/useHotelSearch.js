// frontend/src/hooks/useHotelSearch.js

import { useState, useCallback, useRef } from 'react';
import { hotelApi } from '../services/hotelApi';
import { findPlaces } from '../../../data/indiaPlaces';

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

    // ── Location search ────────────────────────────────────────
    /* The gazetteer is bundled with the app, so the list appears on the first
       keystroke with no network round-trip. The provider is asked afterwards,
       debounced, only to add what the local list did not know — the field is
       never waiting on it. */
    const searchLocation = useCallback((query) => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        const normalized = query.trim().toLowerCase();
        if (normalized.length < 2) {
            setLocationSuggestions([]);
            lastQueryRef.current = '';
            return;
        }

        const local = findPlaces(normalized, 8);
        setLocationSuggestions(local);

        // A confident local answer needs nothing else.
        if (local.length >= 3 || lastQueryRef.current === normalized) return;

        debounceTimer.current = setTimeout(async () => {
            lastQueryRef.current = normalized;
            setLoadingLocation(true);
            try {
                const result = await hotelApi.searchLocation(normalized);
                const remote = result.data || [];
                if (remote.length) {
                    const seen = new Set(local.map((p) => p.name.toLowerCase()));
                    setLocationSuggestions([
                        ...local,
                        ...remote.filter((r) => !seen.has(String(r.name).toLowerCase())),
                    ].slice(0, 8));
                }
            } catch {
                // The local list is already on screen; a provider outage is not
                // the traveller's problem.
            } finally {
                setLoadingLocation(false);
            }
        }, 220);
    }, []);

    // ── Search hotels ──────────────────────────────────────────
    const searchHotels = useCallback(async ({
        destId,
        // Agoda searches by city name rather than by a point, so the name has
        // to survive this hop or that provider can never be the fallback.
        place,
        lat,
        lng,
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
                place,
                lat,
                lng,
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
        provider,
    }) => {
        setLoadingDetails(true);
        setError(null);

        try {
            const result = await hotelApi.getHotelDetails({
                id, checkIn, checkOut, adults, rooms, currency, parts, provider,
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