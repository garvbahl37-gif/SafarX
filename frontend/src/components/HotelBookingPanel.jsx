import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Hotel, Calendar, Users, MapPin, Search,
    Star, BedDouble, ChevronDown, Loader, MapPinned,
} from 'lucide-react';
import { useHotelSearch } from '../hooks/useHotelSearch';
import HotelSearchResults from './HotelSearchResults';
import HotelDetailModal from './HotelDetailModal';

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
        locationSuggestions,
        selectedLocation,
        searchResults,
        hotelDetails,
        loadingLocation,
        loadingSearch,
        loadingDetails,
        error,
        sortDisclaimer,
        hasSearched,
        searchLocation,
        setSelectedLocation,
        setLocationSuggestions,
        searchHotels,
        getHotelDetails,
        clearResults,
        closeDetails,
    } = useHotelSearch();

    const popularDestinations = [
        'Dubai', 'Bali', 'Paris', 'Bangkok', 'Maldives', 'Singapore'
    ];

    const sortOptions = [
        { label: 'Popular', value: '' },
        { label: 'Best Value', value: 'BEST_VALUE' },
        { label: 'Price: Low to High', value: 'PRICE_LOW_TO_HIGH' },
        { label: 'Traveller Ranking', value: 'POPULARITY' },
        { label: 'Distance to Centre', value: 'DISTANCE_FROM_CITY_CENTER' },
    ];

    const today = new Date().toISOString().split('T')[0];
    const isFormValid = selectedLocation && checkIn && checkOut;

    /* ── Destination input handler ── */
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

    /* ── Select a suggestion ── */
    const handleSelectSuggestion = (suggestion) => {
        const cleanTitle = suggestion.title.replace(/<\/?b>/g, '');
        setDestination(cleanTitle);
        setSelectedLocation(suggestion);   // suggestion now has both documentId AND geoId
        setShowSuggestions(false);
        setLocationSuggestions([]);
    };


    /* ── Popular destination chip ── */
    const handlePopularDestination = (dest) => {
        setDestination(dest);
        setSelectedLocation(null);
        searchLocation(dest);
        setShowSuggestions(true);
    };

    /* ── Search submit ── */
    const handleSearch = async () => {
        if (!isFormValid) return;
        setShowResults(true);
        await searchHotels({
            geoId: selectedLocation.geoId,  // ← use clean geoId, not documentId
            checkIn,
            checkOut,
            adults: guests,
            rooms,
            sort: sortBy || undefined,
            rating: starRating > 0 ? starRating * 10 : 0,
            currencyCode: 'USD',
        });
    };

    /* ── Hotel card click → fetch details ── */
    const handleHotelClick = async (hotel) => {
        await getHotelDetails({
            id: hotel.id,
            checkIn,
            checkOut,
            adults: guests,
            rooms,
            currency: 'USD',
        });
    };

    /* ── Close suggestions on outside click ── */
    useEffect(() => {
        const handler = (e) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(e.target) &&
                !destinationRef.current?.contains(e.target)
            ) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <>
            {/* ── Hotel Detail Modal (portal-like, above everything) ── */}
            <AnimatePresence>
                {(hotelDetails || loadingDetails) && (
                    <HotelDetailModal
                        hotel={hotelDetails}
                        loading={loadingDetails}
                        onClose={closeDetails}
                        checkIn={checkIn}
                        checkOut={checkOut}
                    />
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 60 }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="h-full flex flex-col"
                style={{ width: '100%' }}
            >
                {/* Outer glow */}
                <div
                    className="absolute -inset-px rounded-2xl md:rounded-3xl pointer-events-none"
                    style={{
                        background:
                            'linear-gradient(135deg,rgba(139,92,246,.25) 0%,rgba(0,229,255,.15) 100%)',
                        filter: 'blur(1px)',
                        zIndex: -1,
                    }}
                />

                <AnimatePresence mode="wait">
                    {/* ════════════════════════════
                        RESULTS VIEW
                    ════════════════════════════ */}
                    {showResults ? (
                        <HotelSearchResults
                            key="results"
                            results={searchResults}
                            loading={loadingSearch}
                            error={error}
                            sortDisclaimer={sortDisclaimer}
                            hasSearched={hasSearched}
                            onHotelClick={handleHotelClick}
                            onClose={() => {
                                setShowResults(false);
                                clearResults();
                            }}
                            checkIn={checkIn}
                            checkOut={checkOut}
                            adults={guests}
                            rooms={rooms}
                            destination={destination}
                        />
                    ) : (

                        /* ════════════════════════════
                            SEARCH FORM VIEW
                        ════════════════════════════ */
                        <motion.div
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col h-full glass-panel rounded-2xl md:rounded-3xl overflow-hidden relative"
                        >
                            {/* Top shimmer */}
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet/40 to-transparent" />

                            {/* ── Header ── */}
                            <div className="p-4 md:p-5 border-b border-white/5 flex-shrink-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-br from-violet to-purple-400 rounded-xl blur-lg opacity-50" />
                                            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-violet to-purple-400 flex items-center justify-center shadow-lg">
                                                <Hotel size={18} className="text-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-white font-semibold text-base">
                                                Hotel Booking
                                            </h3>
                                            <p className="text-slate-400 text-xs flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 bg-violet rounded-full animate-pulse" />
                                                Find perfect stays
                                            </p>
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={onClose}
                                        className="p-2 rounded-xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                                    >
                                        <X size={18} />
                                    </motion.button>
                                </div>
                            </div>

                            {/* ── Scrollable Form Body ── */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 scrollbar-hide">

                                {/* ── Destination ── */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Destination
                                    </label>

                                    <div className="relative" ref={destinationRef}>
                                        <MapPin
                                            size={14}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-violet z-10"
                                        />
                                        <input
                                            type="text"
                                            value={destination}
                                            onChange={(e) => handleDestinationChange(e.target.value)}
                                            onFocus={() =>
                                                locationSuggestions.length > 0 &&
                                                setShowSuggestions(true)
                                            }
                                            placeholder="City, region, or hotel name"
                                            className="w-full glass-input rounded-xl pl-9 pr-9 py-3 text-sm text-white placeholder-slate-500 focus:outline-none"
                                        />

                                        {/* Loading spinner */}
                                        {loadingLocation && (
                                            <Loader
                                                size={14}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-violet animate-spin"
                                            />
                                        )}

                                        {/* Green dot = location confirmed */}
                                        {selectedLocation && !loadingLocation && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-400" />
                                        )}

                                        {/* ── Suggestions dropdown ── */}
                                        <AnimatePresence>
                                            {showSuggestions && locationSuggestions.length > 0 && (
                                                <motion.div
                                                    ref={suggestionsRef}
                                                    initial={{ opacity: 0, y: -8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -8 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute top-full left-0 right-0 mt-1 z-50 rounded-2xl overflow-hidden shadow-2xl"
                                                    style={{
                                                        background: 'rgba(10,15,30,0.97)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        backdropFilter: 'blur(20px)',
                                                        maxHeight: '240px',
                                                        overflowY: 'auto',
                                                    }}
                                                >
                                                    {locationSuggestions.map((s, idx) => (
                                                        <motion.button
                                                            key={s.documentId}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: idx * 0.03 }}
                                                            onClick={() => handleSelectSuggestion(s)}
                                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                                                        >
                                                            {/* Icon */}
                                                            <div
                                                                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${s.trackingItems === 'hotel'
                                                                    ? 'bg-violet/20'
                                                                    : 'bg-teal-500/20'
                                                                    }`}
                                                            >
                                                                {s.trackingItems === 'hotel' ? (
                                                                    <Hotel size={13} className="text-violet" />
                                                                ) : (
                                                                    <MapPinned size={13} className="text-teal-400" />
                                                                )}
                                                            </div>

                                                            {/* Text */}
                                                            <div className="flex-1 min-w-0">
                                                                <p
                                                                    className="text-white text-sm font-medium truncate"
                                                                    dangerouslySetInnerHTML={{ __html: s.title }}
                                                                />
                                                                <p className="text-slate-500 text-xs truncate">
                                                                    {s.secondaryText}
                                                                </p>
                                                            </div>

                                                            {/* Hotel thumbnail */}
                                                            {s.image?.urlTemplate && (
                                                                <img
                                                                    src={s.image.urlTemplate
                                                                        .replace('{width}', '48')
                                                                        .replace('{height}', '48')}
                                                                    alt=""
                                                                    className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                                                                />
                                                            )}
                                                        </motion.button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Selected location badge */}
                                    {selectedLocation && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl w-fit"
                                            style={{
                                                background: 'rgba(34,197,94,0.1)',
                                                border: '1px solid rgba(34,197,94,0.25)',
                                            }}
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                            <span className="text-green-400 text-xs font-semibold truncate max-w-[200px]">
                                                {selectedLocation.secondaryText}
                                            </span>
                                        </motion.div>
                                    )}
                                </div>

                                {/* ── Popular Destinations ── */}
                                <div className="flex flex-wrap gap-2">
                                    {popularDestinations.map((d) => (
                                        <motion.button
                                            key={d}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handlePopularDestination(d)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${destination === d
                                                ? 'text-white border-violet/60'
                                                : 'text-slate-400 border-white/10 hover:text-white hover:border-white/20'
                                                }`}
                                            style={
                                                destination === d
                                                    ? { background: 'rgba(139,92,246,0.25)' }
                                                    : { background: 'rgba(255,255,255,0.03)' }
                                            }
                                        >
                                            {d}
                                        </motion.button>
                                    ))}
                                </div>

                                {/* ── Stay Dates ── */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Stay Dates
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {/* Check-in */}
                                        <div className="relative">
                                            <Calendar
                                                size={14}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
                                            />
                                            <input
                                                type="date"
                                                value={checkIn}
                                                min={today}
                                                onChange={(e) => {
                                                    setCheckIn(e.target.value);
                                                    if (checkOut && e.target.value >= checkOut) {
                                                        setCheckOut('');
                                                    }
                                                }}
                                                className="w-full glass-input rounded-xl pl-9 pr-3 py-3 text-sm text-white focus:outline-none appearance-none"
                                                style={{ colorScheme: 'dark' }}
                                            />
                                            {!checkIn && (
                                                <span className="absolute left-9 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">
                                                    Check-in
                                                </span>
                                            )}
                                        </div>

                                        {/* Check-out */}
                                        <div className="relative">
                                            <Calendar
                                                size={14}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
                                            />
                                            <input
                                                type="date"
                                                value={checkOut}
                                                min={checkIn || today}
                                                onChange={(e) => setCheckOut(e.target.value)}
                                                className="w-full glass-input rounded-xl pl-9 pr-3 py-3 text-sm text-white focus:outline-none appearance-none"
                                                style={{ colorScheme: 'dark' }}
                                            />
                                            {!checkOut && (
                                                <span className="absolute left-9 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">
                                                    Check-out
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Night count pill */}
                                    {checkIn && checkOut && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center gap-1.5 text-xs text-violet font-semibold"
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-violet" />
                                            {Math.max(
                                                1,
                                                Math.round(
                                                    (new Date(checkOut) - new Date(checkIn)) /
                                                    (1000 * 60 * 60 * 24)
                                                )
                                            )}{' '}
                                            night stay
                                        </motion.div>
                                    )}
                                </div>

                                {/* ── Guests & Rooms ── */}
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Guests */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            Guests
                                        </label>
                                        <div className="glass-input rounded-xl flex items-center justify-between px-3 py-3">
                                            <Users size={14} className="text-slate-400" />
                                            <div className="flex items-center gap-2">
                                                <motion.button
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => setGuests(Math.max(1, guests - 1))}
                                                    className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center text-sm transition-colors"
                                                >
                                                    −
                                                </motion.button>
                                                <span className="text-white text-sm font-semibold w-4 text-center">
                                                    {guests}
                                                </span>
                                                <motion.button
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => setGuests(Math.min(10, guests + 1))}
                                                    className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center text-sm transition-colors"
                                                >
                                                    +
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rooms */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            Rooms
                                        </label>
                                        <div className="glass-input rounded-xl flex items-center justify-between px-3 py-3">
                                            <BedDouble size={14} className="text-slate-400" />
                                            <div className="flex items-center gap-2">
                                                <motion.button
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => setRooms(Math.max(1, rooms - 1))}
                                                    className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center text-sm transition-colors"
                                                >
                                                    −
                                                </motion.button>
                                                <span className="text-white text-sm font-semibold w-4 text-center">
                                                    {rooms}
                                                </span>
                                                <motion.button
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => setRooms(Math.min(5, rooms + 1))}
                                                    className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center text-sm transition-colors"
                                                >
                                                    +
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Star Rating ── */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Minimum Star Rating
                                    </label>
                                    <div className="flex gap-2">
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setStarRating(0)}
                                            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                                            style={
                                                starRating === 0
                                                    ? {
                                                        background:
                                                            'linear-gradient(135deg,#8B5CF6,#7c3aed)',
                                                        color: '#fff',
                                                    }
                                                    : {
                                                        background: 'rgba(255,255,255,0.04)',
                                                        color: '#94a3b8',
                                                        border: '1px solid rgba(255,255,255,0.08)',
                                                    }
                                            }
                                        >
                                            Any
                                        </motion.button>

                                        {[3, 4, 5].map((s) => (
                                            <motion.button
                                                key={s}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setStarRating(s)}
                                                className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1"
                                                style={
                                                    starRating === s
                                                        ? {
                                                            background:
                                                                'linear-gradient(135deg,rgba(251,191,36,.85),rgba(245,158,11,.85))',
                                                            color: '#1e1b4b',
                                                        }
                                                        : {
                                                            background: 'rgba(255,255,255,0.04)',
                                                            color: '#94a3b8',
                                                            border: '1px solid rgba(255,255,255,0.08)',
                                                        }
                                                }
                                            >
                                                <Star
                                                    size={11}
                                                    className={starRating === s ? 'fill-current' : ''}
                                                />
                                                {s}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* ── Sort By ── */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Sort By
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="w-full glass-input rounded-xl px-3 py-3 text-sm text-white focus:outline-none appearance-none cursor-pointer"
                                            style={{ colorScheme: 'dark', background: 'transparent' }}
                                        >
                                            {sortOptions.map((o) => (
                                                <option
                                                    key={o.value}
                                                    value={o.value}
                                                    style={{ background: '#0f172a' }}
                                                >
                                                    {o.label}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown
                                            size={14}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                        />
                                    </div>
                                </div>

                                {/* ── Validation hint ── */}
                                {!isFormValid && (
                                    <div className="flex items-start gap-2 text-xs text-slate-500">
                                        <span className="mt-0.5">ℹ️</span>
                                        <span>
                                            {!selectedLocation
                                                ? 'Select a destination from the suggestions.'
                                                : !checkIn
                                                    ? 'Choose a check-in date.'
                                                    : 'Choose a check-out date.'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* ── Search Button ── */}
                            <div className="p-4 md:p-5 border-t border-white/5 flex-shrink-0">
                                <motion.button
                                    whileHover={isFormValid ? { scale: 1.02 } : {}}
                                    whileTap={isFormValid ? { scale: 0.98 } : {}}
                                    onClick={handleSearch}
                                    disabled={!isFormValid || loadingSearch}
                                    className="w-full btn group relative overflow-hidden flex items-center justify-center gap-2 transition-all"
                                    style={{
                                        background: isFormValid
                                            ? 'linear-gradient(135deg,#8B5CF6 0%,#7c3aed 100%)'
                                            : 'rgba(255,255,255,0.05)',
                                        color: isFormValid ? 'white' : '#475569',
                                        boxShadow: isFormValid
                                            ? '0 4px 20px rgba(139,92,246,.3)'
                                            : 'none',
                                        cursor: isFormValid ? 'pointer' : 'not-allowed',
                                        padding: '12px',
                                        borderRadius: '12px',
                                    }}
                                >
                                    {loadingSearch ? (
                                        <>
                                            <Loader size={16} className="animate-spin" />
                                            <span className="font-semibold">Searching...</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="absolute inset-0 bg-gradient-to-r from-teal/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <Search size={16} className="relative z-10" />
                                            <span className="relative z-10 font-semibold">
                                                Search Hotels
                                            </span>
                                        </>
                                    )}
                                </motion.button>

                                <p className="text-center text-[10px] text-slate-600 mt-2">
                                    Best rates guaranteed · Free cancellation available
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </>
    );
};

export default HotelBookingPanel;