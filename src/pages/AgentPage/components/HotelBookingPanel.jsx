import { useState, useRef, useEffect } from 'react';
import DateRangeField from '../../../components/ui/DateRangeField';
import { toISO } from '../../../components/ui/dateUtils';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
    X, Hotel, Calendar, Users, MapPin, Search,
    Star, BedDouble, ChevronDown, MapPinned, Info,
} from 'lucide-react';
import { useHotelSearch } from '../hooks/useHotelSearch';
import HotelSearchResults from './HotelSearchResults';
import HotelDetailModal from './HotelDetailModal';

const EASE = [0.22, 1, 0.36, 1];

/* Marks the typed part of a suggestion without trusting provider HTML. */
const Highlight = ({ text = '', match = '' }) => {
    const at = match ? text.toLowerCase().indexOf(match.trim().toLowerCase()) : -1;
    if (at < 0 || !match.trim()) return text;
    return (
        <>
            {text.slice(0, at)}
            <b className="text-saffron font-semibold">{text.slice(at, at + match.trim().length)}</b>
            {text.slice(at + match.trim().length)}
        </>
    );
};

const HotelBookingPanel = ({ onClose }) => {
    const [destination, setDestination] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(2);
    const [rooms, setRooms] = useState(1);
    const [starRating, setStarRating] = useState(0);
    const [sortBy, setSortBy] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const destinationRef = useRef(null);
    const suggestionsRef = useRef(null);

    const {
        locationSuggestions, selectedLocation, searchResults, hotelDetails,
        loadingLocation, loadingSearch, loadingDetails, error, sortDisclaimer,
        hasSearched, searchLocation, setSelectedLocation, setLocationSuggestions,
        searchHotels, getHotelDetails, clearResults, closeDetails,
    } = useHotelSearch();

    const sortOptions = [
        { label: 'Popular', value: '' },
        { label: 'Best value', value: 'BEST_VALUE' },
        { label: 'Price — low to high', value: 'PRICE_LOW_TO_HIGH' },
        { label: 'Traveller ranking', value: 'POPULARITY' },
        { label: 'Distance to centre', value: 'DISTANCE_FROM_CITY_CENTER' },
    ];

    // Local, not UTC: before 05:30 IST toISOString() still reports yesterday.
    const today = toISO(new Date());
    const isFormValid = selectedLocation && checkIn && checkOut;

    const handleDestinationChange = (value) => {
        setDestination(value);
        setSelectedLocation(null);
        if (value.length >= 2) {
            searchLocation(value);
            setShowSuggestions(true);
        } else {
            setLocationSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSelectSuggestion = (suggestion) => {
        setDestination(suggestion.name);
        setSelectedLocation(suggestion);
        setShowSuggestions(false);
        setLocationSuggestions([]);
    };

    const handleSearch = async () => {
        if (!isFormValid) return;
        setShowResults(true);
        await searchHotels({
            destId: selectedLocation.destId,
            searchType: selectedLocation.searchType,
            checkIn, checkOut,
            adults: guests, rooms,
            sort: sortBy || undefined,
            rating: starRating,
            currency: 'INR',
        });
    };

    const handleHotelClick = async (hotel) => {
        await getHotelDetails({
            id: hotel.id, checkIn, checkOut,
            adults: guests, rooms, currency: 'INR', parts: 'base',
        });
    };

    /* Tabs fetch their own section the first time they are opened. */
    const loadDetailPart = (id, parts) =>
        getHotelDetails({
            id, checkIn, checkOut,
            adults: guests, rooms, currency: 'INR', parts,
        });

    useEffect(() => {
        const handler = (e) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(e.target) &&
                !destinationRef.current?.contains(e.target)
            ) setShowSuggestions(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <>
            {/* Hotel Detail Modal */}
            <AnimatePresence>
                {(hotelDetails || loadingDetails) && (
                    <HotelDetailModal
                        hotel={hotelDetails} loading={loadingDetails}
                        onLoadPart={loadDetailPart}
                        onClose={closeDetails}
                    />
                )}
            </AnimatePresence>

            <Motion.div
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 60 }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="h-full flex flex-col"
                style={{ width: '100%' }}
            >
                <AnimatePresence mode="wait">

                    {/* ══════════════ RESULTS VIEW ══════════════ */}
                    {showResults ? (
                        <HotelSearchResults
                            key="results"
                            results={searchResults} loading={loadingSearch}
                            error={error} sortDisclaimer={sortDisclaimer}
                            hasSearched={hasSearched}
                            onHotelClick={handleHotelClick}
                            onClose={() => { setShowResults(false); clearResults(); }}
                            checkIn={checkIn} checkOut={checkOut}
                            adults={guests} rooms={rooms}
                            destination={destination}
                        />
                    ) : (

                        /* ══════════════ SEARCH FORM VIEW ══════════════ */
                        <Motion.div
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="agent-panel flex flex-col h-full rounded-2xl md:rounded-3xl overflow-hidden relative shadow-[0_24px_64px_rgba(0,0,0,0.45)]"
                        >
                            {/* Gold filament */}
                            <div
                                className="absolute top-0 left-0 right-0 h-px z-20 bg-gradient-to-r from-transparent via-saffron/50 to-transparent"
                                aria-hidden="true"
                            />

                            {/* ── Header ── */}
                            <div className="relative p-4 md:p-5 border-b border-white/[0.07] bg-ink-950/30 shrink-0">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span
                                            className="w-10 h-10 rounded-xl flex items-center justify-center bg-saffron/10 border border-saffron/25 shrink-0"
                                            aria-hidden="true"
                                        >
                                            <Hotel size={17} className="text-saffron" />
                                        </span>
                                        <div className="min-w-0">
                                            <h3 className="font-display text-[17px] leading-tight text-ivory">Stays</h3>
                                            <p className="flex items-center gap-1.5 mt-1">
                                                <span className="route-dot" aria-hidden="true" />
                                                <span className="font-data text-[9.5px] uppercase tracking-[0.18em] text-ivory-faint">
                                                    Heritage hotels to homestays
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={onClose}
                                        className="agent-icon-btn p-2 shrink-0"
                                        aria-label="Close hotel search"
                                    >
                                        <X size={17} />
                                    </button>
                                </div>
                            </div>

                            {/* ── Scrollable form body ── */}
                            <div className="agent-scroll flex-1 overflow-y-auto p-4 md:p-5 space-y-6">

                                {/* ── Destination ── */}
                                <div className="space-y-2.5">
                                    <label htmlFor="hotel-destination" className="eyebrow-muted block">
                                        Destination
                                    </label>

                                    <div className="relative" ref={destinationRef}>
                                        <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 text-saffron" aria-hidden="true" />
                                        <input
                                            id="hotel-destination"
                                            type="text"
                                            value={destination}
                                            onChange={(e) => handleDestinationChange(e.target.value)}
                                            onFocus={() =>
                                                locationSuggestions.length > 0 && setShowSuggestions(true)
                                            }
                                            placeholder="City, region, or property name"
                                            autoComplete="off"
                                            aria-expanded={showSuggestions}
                                            className="agent-field w-full pl-9 pr-10 py-3 text-sm"
                                        />

                                        {/* Looking-up indicator */}
                                        {loadingLocation && (
                                            <span
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1"
                                                aria-hidden="true"
                                            >
                                                <span className="agent-waypoint" />
                                                <span className="agent-waypoint" />
                                                <span className="agent-waypoint" />
                                            </span>
                                        )}

                                        {/* Confirmed */}
                                        {selectedLocation && !loadingLocation && (
                                            <span
                                                className="route-dot absolute right-4 top-1/2 -translate-y-1/2"
                                                aria-hidden="true"
                                            />
                                        )}

                                        {/* ── Suggestions dropdown ── */}
                                        <AnimatePresence>
                                            {showSuggestions && locationSuggestions.length > 0 && (
                                                <Motion.div
                                                    ref={suggestionsRef}
                                                    initial={{ opacity: 0, y: -8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -8 }}
                                                    transition={{ duration: 0.18 }}
                                                    role="listbox"
                                                    aria-label="Destination suggestions"
                                                    className="agent-scroll absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl overflow-y-auto
                                                               bg-ink-800 border border-white/[0.1] shadow-[0_20px_48px_rgba(0,0,0,0.55)]"
                                                    style={{ maxHeight: '240px' }}
                                                >
                                                    {locationSuggestions.map((s, idx) => (
                                                        <Motion.button
                                                            key={s.id}
                                                            initial={{ opacity: 0, x: -6 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: idx * 0.04 }}
                                                            onClick={() => handleSelectSuggestion(s)}
                                                            role="option"
                                                            aria-selected={selectedLocation?.id === s.id}
                                                            className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer
                                                                       border-b border-white/[0.05] last:border-0
                                                                       hover:bg-saffron/[0.07] transition-colors"
                                                        >
                                                            <span
                                                                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-white/[0.04] border border-white/[0.07]"
                                                                aria-hidden="true"
                                                            >
                                                                {s.destType === 'hotel'
                                                                    ? <Hotel size={13} className="text-saffron" />
                                                                    : <MapPinned size={13} className="text-saffron" />
                                                                }
                                                            </span>

                                                            <span className="flex-1 min-w-0">
                                                                <span className="block text-[13px] font-medium truncate text-ivory">
                                                                    <Highlight text={s.name} match={destination} />
                                                                </span>
                                                                <span className="block text-[11px] truncate text-ivory-faint">
                                                                    {s.secondaryText}
                                                                </span>
                                                            </span>

                                                            {s.hotels > 0 && (
                                                                <span className="font-data text-[9.5px] tabular-nums text-ivory-faint shrink-0">
                                                                    {s.hotels.toLocaleString('en-IN')}
                                                                </span>
                                                            )}

                                                            {s.image && (
                                                                <img
                                                                    src={s.image}
                                                                    alt=""
                                                                    loading="lazy"
                                                                    className="w-9 h-9 rounded-xl object-cover shrink-0"
                                                                />
                                                            )}
                                                        </Motion.button>
                                                    ))}
                                                </Motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Selected location */}
                                    <AnimatePresence>
                                        {selectedLocation && (
                                            <Motion.div
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="agent-tag agent-tag-jade px-3 py-1.5 text-[10px] w-fit"
                                            >
                                                <span className="truncate max-w-[220px] normal-case tracking-normal">
                                                    {selectedLocation.secondaryText}
                                                </span>
                                            </Motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* ── Stay dates ── */}
                                <div className="space-y-2.5">
                                    <span className="eyebrow-muted block">Stay dates</span>
                                    <DateRangeField
                                        startValue={checkIn}
                                        endValue={checkOut}
                                        onChange={(nextIn, nextOut) => {
                                            setCheckIn(nextIn);
                                            setCheckOut(nextOut);
                                        }}
                                        min={today}
                                        startLabel="Check-in"
                                        endLabel="Check-out"
                                        unit="night"
                                    />
                                </div>

                                {/* ── Guests & Rooms ── */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2.5">
                                        <span className="eyebrow-muted block">Guests</span>
                                        <div className="agent-field flex items-center justify-between px-3 py-2.5">
                                            <Users size={14} className="text-ivory-faint" aria-hidden="true" />
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setGuests(Math.max(1, guests - 1))}
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-semibold cursor-pointer
                                                               bg-white/[0.05] border border-white/[0.07] text-ivory hover:border-saffron/35"
                                                    aria-label="Remove a guest"
                                                >−</button>
                                                <span className="font-data text-sm w-5 text-center text-ivory tabular-nums" aria-live="polite">
                                                    {guests}
                                                </span>
                                                <button
                                                    onClick={() => setGuests(Math.min(10, guests + 1))}
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-semibold cursor-pointer
                                                               bg-white/[0.05] border border-white/[0.07] text-ivory hover:border-saffron/35"
                                                    aria-label="Add a guest"
                                                >+</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2.5">
                                        <span className="eyebrow-muted block">Rooms</span>
                                        <div className="agent-field flex items-center justify-between px-3 py-2.5">
                                            <BedDouble size={14} className="text-ivory-faint" aria-hidden="true" />
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setRooms(Math.max(1, rooms - 1))}
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-semibold cursor-pointer
                                                               bg-white/[0.05] border border-white/[0.07] text-ivory hover:border-saffron/35"
                                                    aria-label="Remove a room"
                                                >−</button>
                                                <span className="font-data text-sm w-5 text-center text-ivory tabular-nums" aria-live="polite">
                                                    {rooms}
                                                </span>
                                                <button
                                                    onClick={() => setRooms(Math.min(5, rooms + 1))}
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-semibold cursor-pointer
                                                               bg-white/[0.05] border border-white/[0.07] text-ivory hover:border-saffron/35"
                                                    aria-label="Add a room"
                                                >+</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Star rating ── */}
                                <div className="space-y-2.5">
                                    <span className="eyebrow-muted flex items-center gap-1.5">
                                        <Star size={10} className="text-saffron" aria-hidden="true" />
                                        Minimum rating
                                    </span>
                                    <div
                                        className="flex gap-1 p-1 rounded-full bg-white/[0.03] border border-white/[0.07]"
                                        role="group"
                                        aria-label="Minimum star rating"
                                    >
                                        <button
                                            onClick={() => setStarRating(0)}
                                            aria-pressed={starRating === 0}
                                            className={`flex-1 py-2 rounded-full font-data text-[10px] uppercase tracking-[0.14em] transition-all cursor-pointer ${starRating === 0
                                                ? 'bg-gradient-to-br from-saffron-bright to-saffron text-ink-950 font-semibold'
                                                : 'text-ivory-muted hover:text-ivory'
                                                }`}
                                        >
                                            Any
                                        </button>

                                        {[3, 4, 5].map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => setStarRating(s)}
                                                aria-pressed={starRating === s}
                                                aria-label={`${s} stars and up`}
                                                className={`flex-1 py-2 rounded-full font-data text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1 ${starRating === s
                                                    ? 'bg-gradient-to-br from-saffron-bright to-saffron text-ink-950 font-semibold'
                                                    : 'text-ivory-muted hover:text-ivory'
                                                    }`}
                                            >
                                                <Star
                                                    size={10}
                                                    className={starRating === s ? 'fill-current' : ''}
                                                    aria-hidden="true"
                                                />
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* ── Sort by ── */}
                                <div className="space-y-2.5">
                                    <label htmlFor="hotel-sort" className="eyebrow-muted block">Sort by</label>
                                    <div className="relative">
                                        <select
                                            id="hotel-sort"
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="agent-field w-full px-3 py-3 pr-9 text-sm appearance-none cursor-pointer"
                                        >
                                            {sortOptions.map((o) => (
                                                <option key={o.value} value={o.value}>{o.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown
                                            size={14}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-ivory-faint"
                                            aria-hidden="true"
                                        />
                                    </div>
                                </div>

                                {/* ── Validation hint ── */}
                                <AnimatePresence>
                                    {!isFormValid && (
                                        <Motion.div
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.07]"
                                        >
                                            <Info size={14} className="text-saffron shrink-0 mt-0.5" aria-hidden="true" />
                                            <span className="text-xs leading-relaxed text-ivory-muted">
                                                {!selectedLocation
                                                    ? 'Pick a destination from the suggestions to continue.'
                                                    : !checkIn
                                                        ? 'Choose a check-in date to continue.'
                                                        : 'Choose a check-out date to continue.'
                                                }
                                            </span>
                                        </Motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* ── Search button ── */}
                            <div className="p-4 md:p-5 border-t border-white/[0.07] bg-ink-950/30 shrink-0">
                                <Motion.button
                                    whileHover={isFormValid && !loadingSearch ? { y: -1 } : undefined}
                                    whileTap={isFormValid && !loadingSearch ? { scale: 0.99 } : undefined}
                                    transition={{ duration: 0.25, ease: EASE }}
                                    onClick={handleSearch}
                                    disabled={!isFormValid || loadingSearch}
                                    className="agent-btn-gold w-full py-3.5 text-sm"
                                    aria-label="Search stays"
                                >
                                    {loadingSearch ? (
                                        <>
                                            <span className="flex items-center gap-1.5" aria-hidden="true">
                                                <span className="agent-waypoint" />
                                                <span className="agent-waypoint" />
                                                <span className="agent-waypoint" />
                                            </span>
                                            <span className="font-data text-[11px] uppercase tracking-[0.18em]">
                                                Searching stays…
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <Search size={16} />
                                            <span>Search stays</span>
                                        </>
                                    )}
                                </Motion.button>

                                <p className="text-center font-data text-[9.5px] uppercase tracking-[0.18em] text-ivory-faint mt-3">
                                    Free cancellation on many stays
                                </p>
                            </div>
                        </Motion.div>
                    )}
                </AnimatePresence>
            </Motion.div>
        </>
    );
};

export default HotelBookingPanel;
