import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Hotel, Calendar, Users, MapPin, Search,
    Star, BedDouble, ChevronDown, Loader, MapPinned, Sparkles,
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
        locationSuggestions, selectedLocation, searchResults, hotelDetails,
        loadingLocation, loadingSearch, loadingDetails, error, sortDisclaimer,
        hasSearched, searchLocation, setSelectedLocation, setLocationSuggestions,
        searchHotels, getHotelDetails, clearResults, closeDetails,
    } = useHotelSearch();



    const sortOptions = [
        { label: 'Popular', value: '' },
        { label: 'Best Value', value: 'BEST_VALUE' },
        { label: 'Price: Low to High', value: 'PRICE_LOW_TO_HIGH' },
        { label: 'Traveller Ranking', value: 'POPULARITY' },
        { label: 'Distance to Centre', value: 'DISTANCE_FROM_CITY_CENTER' },
    ];

    const today = new Date().toISOString().split('T')[0];
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
        const cleanTitle = suggestion.title.replace(/<\/?b>/g, '');
        setDestination(cleanTitle);
        setSelectedLocation(suggestion);
        setShowSuggestions(false);
        setLocationSuggestions([]);
    };



    const handleSearch = async () => {
        if (!isFormValid) return;
        setShowResults(true);
        await searchHotels({
            geoId: selectedLocation.geoId,
            checkIn, checkOut,
            adults: guests, rooms,
            sort: sortBy || undefined,
            rating: starRating > 0 ? starRating * 10 : 0,
            currencyCode: 'USD',
        });
    };

    const handleHotelClick = async (hotel) => {
        await getHotelDetails({
            id: hotel.id, checkIn, checkOut,
            adults: guests, rooms, currency: 'USD',
        });
    };

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

    /* ─── night count helper ─── */
    const nightCount = checkIn && checkOut
        ? Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)))
        : 0;

    return (
        <>
            {/* Hotel Detail Modal */}
            <AnimatePresence>
                {(hotelDetails || loadingDetails) && (
                    <HotelDetailModal
                        hotel={hotelDetails} loading={loadingDetails}
                        onClose={closeDetails} checkIn={checkIn} checkOut={checkOut}
                    />
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, x: 60, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.97 }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="h-full flex flex-col"
                style={{ width: '100%' }}
            >
                <AnimatePresence mode="wait">

                    {/* ══════════════════════════════
                        RESULTS VIEW
                    ══════════════════════════════ */}
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

                        /* ══════════════════════════════
                            SEARCH FORM VIEW
                        ══════════════════════════════ */
                        <motion.div
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col h-full rounded-2xl md:rounded-3xl overflow-hidden relative"
                            style={{
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(250,245,255,0.97) 100%)',
                                border: '1.5px solid rgba(255,255,255,0.9)',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(139,92,246,0.1)',
                            }}
                        >
                            {/* Rainbow top accent line */}
                            <div
                                className="absolute top-0 left-0 right-0 h-1 z-10"
                                style={{ background: 'linear-gradient(90deg, #8B5CF6, #EC4899, #F97316, #F59E0B, #10B981)' }}
                            />

                            {/* Decorative background blobs */}
                            <div
                                className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
                                style={{
                                    background: 'radial-gradient(circle at 80% 20%, rgba(139,92,246,0.1) 0%, transparent 65%)',
                                    opacity: 0.6,
                                }}
                            />
                            <div
                                className="absolute bottom-24 left-0 w-48 h-48 pointer-events-none"
                                style={{
                                    background: 'radial-gradient(circle at 20% 80%, rgba(236,72,153,0.08) 0%, transparent 65%)',
                                    opacity: 0.5,
                                }}
                            />

                            {/* ── Header ── */}
                            <div
                                className="relative p-4 md:p-5 border-b flex-shrink-0"
                                style={{
                                    borderColor: 'rgba(139,92,246,0.1)',
                                    background: 'rgba(255,255,255,0.65)',
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <motion.div
                                            className="relative"
                                            whileHover={{ scale: 1.08 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                        >
                                            {/* Glow */}
                                            <div
                                                className="absolute inset-0 rounded-xl blur-md opacity-55"
                                                style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}
                                            />
                                            <div
                                                className="relative w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
                                                style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' }}
                                            >
                                                <Hotel size={18} className="text-white" />
                                            </div>
                                        </motion.div>
                                        <div>
                                            <h3 className="font-bold text-base" style={{ color: '#0f172a' }}>
                                                Hotel Booking
                                            </h3>
                                            <p className="text-xs flex items-center gap-1.5" style={{ color: '#64748b' }}>
                                                <span
                                                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                                                    style={{ background: '#8B5CF6' }}
                                                />
                                                Find perfect stays worldwide
                                            </p>
                                        </div>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={onClose}
                                        className="p-2 rounded-xl transition-all"
                                        style={{ background: 'rgba(0,0,0,0.04)', color: '#64748b' }}
                                    >
                                        <X size={18} />
                                    </motion.button>
                                </div>
                            </div>

                            {/* ── Scrollable Form Body ── */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-5 scrollbar-hide">

                                {/* ── Destination ── */}
                                <div className="space-y-2.5">
                                    <label
                                        className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                                        style={{ color: '#64748b' }}
                                    >
                                        <span
                                            className="w-1.5 h-1.5 rounded-full"
                                            style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}
                                        />
                                        Destination
                                    </label>

                                    <div className="relative" ref={destinationRef}>
                                        <MapPin
                                            size={14}
                                            className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10"
                                            style={{ color: '#8B5CF6' }}
                                        />
                                        <input
                                            type="text"
                                            value={destination}
                                            onChange={(e) => handleDestinationChange(e.target.value)}
                                            onFocus={() =>
                                                locationSuggestions.length > 0 && setShowSuggestions(true)
                                            }
                                            placeholder="City, region, or hotel name"
                                            className="w-full rounded-xl pl-9 pr-10 py-3 text-sm font-medium focus:outline-none glass-input"
                                            style={{ color: '#0f172a' }}
                                        />

                                        {/* Spinner */}
                                        {loadingLocation && (
                                            <Loader
                                                size={14}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin"
                                                style={{ color: '#8B5CF6' }}
                                            />
                                        )}

                                        {/* Green confirmed dot */}
                                        {selectedLocation && !loadingLocation && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full"
                                                style={{
                                                    background: '#10B981',
                                                    boxShadow: '0 0 8px rgba(16,185,129,0.55)',
                                                }}
                                            />
                                        )}

                                        {/* ── Suggestions dropdown ── */}
                                        <AnimatePresence>
                                            {showSuggestions && locationSuggestions.length > 0 && (
                                                <motion.div
                                                    ref={suggestionsRef}
                                                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                                    transition={{ duration: 0.18 }}
                                                    className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl overflow-hidden"
                                                    style={{
                                                        background: 'rgba(255,255,255,0.98)',
                                                        border: '1.5px solid rgba(139,92,246,0.15)',
                                                        boxShadow: '0 16px 48px rgba(0,0,0,0.1), 0 4px 16px rgba(139,92,246,0.1)',
                                                        backdropFilter: 'blur(20px)',
                                                        maxHeight: '240px',
                                                        overflowY: 'auto',
                                                    }}
                                                >
                                                    {locationSuggestions.map((s, idx) => (
                                                        <motion.button
                                                            key={s.documentId}
                                                            initial={{ opacity: 0, x: -8 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: idx * 0.04 }}
                                                            onClick={() => handleSelectSuggestion(s)}
                                                            className="w-full flex items-center gap-3 px-4 py-3 text-left border-b transition-colors last:border-0"
                                                            style={{ borderColor: 'rgba(139,92,246,0.07)' }}
                                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.05)'}
                                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                        >
                                                            {/* Icon */}
                                                            <div
                                                                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                                                style={s.trackingItems === 'hotel'
                                                                    ? { background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }
                                                                    : { background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }
                                                                }
                                                            >
                                                                {s.trackingItems === 'hotel'
                                                                    ? <Hotel size={13} style={{ color: '#8B5CF6' }} />
                                                                    : <MapPinned size={13} style={{ color: '#06B6D4' }} />
                                                                }
                                                            </div>

                                                            {/* Text */}
                                                            <div className="flex-1 min-w-0">
                                                                <p
                                                                    className="text-sm font-semibold truncate"
                                                                    style={{ color: '#0f172a' }}
                                                                    dangerouslySetInnerHTML={{ __html: s.title }}
                                                                />
                                                                <p className="text-xs truncate" style={{ color: '#94a3b8' }}>
                                                                    {s.secondaryText}
                                                                </p>
                                                            </div>

                                                            {/* Thumbnail */}
                                                            {s.image?.urlTemplate && (
                                                                <img
                                                                    src={s.image.urlTemplate
                                                                        .replace('{width}', '48')
                                                                        .replace('{height}', '48')}
                                                                    alt=""
                                                                    className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
                                                                />
                                                            )}
                                                        </motion.button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Selected location badge */}
                                    <AnimatePresence>
                                        {selectedLocation && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl w-fit"
                                                style={{
                                                    background: 'rgba(16,185,129,0.08)',
                                                    border: '1.5px solid rgba(16,185,129,0.22)',
                                                }}
                                            >
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ background: '#10B981', boxShadow: '0 0 6px rgba(16,185,129,0.5)' }}
                                                />
                                                <span
                                                    className="text-xs font-semibold truncate max-w-[200px]"
                                                    style={{ color: '#059669' }}
                                                >
                                                    {selectedLocation.secondaryText}
                                                </span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>




                                {/* ── Stay Dates ── */}
                                <div className="space-y-2.5">
                                    <label
                                        className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                                        style={{ color: '#64748b' }}
                                    >
                                        <span
                                            className="w-1.5 h-1.5 rounded-full"
                                            style={{ background: 'linear-gradient(135deg, #F97316, #F59E0B)' }}
                                        />
                                        Stay Dates
                                    </label>
                                    <div className="grid grid-cols-2 gap-2.5">

                                        {/* Check-in */}
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs text-slate-400 pl-1">Check-in</label>

                                            <div className="relative">
                                                <Calendar
                                                    size={14}
                                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10"
                                                    style={{ color: '#94a3b8' }}
                                                />

                                                <input
                                                    type="date"
                                                    value={checkIn}
                                                    min={today}
                                                    onChange={(e) => {
                                                        setCheckIn(e.target.value);
                                                        if (checkOut && e.target.value >= checkOut) setCheckOut('');
                                                    }}
                                                    className="w-full rounded-xl pl-9 pr-3 py-3 text-sm focus:outline-none appearance-none glass-input text-[15px]"
                                                    style={{ colorScheme: 'light', color: checkIn ? '#0f172a' : '#94a3b8' }}
                                                />
                                            </div>
                                        </div>

                                        {/* Check-out */}
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs text-slate-400 pl-1">Check-out</label>

                                            <div className="relative">
                                                <Calendar
                                                    size={14}
                                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10"
                                                    style={{ color: '#94a3b8' }}
                                                />

                                                <input
                                                    type="date"
                                                    value={checkOut}
                                                    min={checkIn || today}
                                                    onChange={(e) => setCheckOut(e.target.value)}
                                                    className="w-full rounded-xl pl-9 pr-3 py-3 text-sm focus:outline-none appearance-none glass-input text-[15px]"
                                                    style={{ colorScheme: 'light', color: checkOut ? '#0f172a' : '#94a3b8' }}
                                                />
                                            </div>
                                        </div>

                                    </div>

                                    {/* Night count pill */}
                                    <AnimatePresence>
                                        {nightCount > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -4, scale: 0.9 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -4 }}
                                                className="flex items-center gap-2 w-fit px-3 py-1.5 rounded-xl"
                                                style={{
                                                    background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.06))',
                                                    border: '1.5px solid rgba(139,92,246,0.18)',
                                                }}
                                            >
                                                <span
                                                    className="w-1.5 h-1.5 rounded-full"
                                                    style={{ background: '#8B5CF6' }}
                                                />
                                                <span className="text-xs font-bold" style={{ color: '#7C3AED' }}>
                                                    🌙 {nightCount} night{nightCount > 1 ? 's' : ''} stay
                                                </span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* ── Guests & Rooms ── */}
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Guests */}
                                    <div className="space-y-2">
                                        <label
                                            className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                                            style={{ color: '#64748b' }}
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#0EA5E9' }} />
                                            Guests
                                        </label>
                                        <div className="rounded-xl flex items-center justify-between px-3 py-3 glass-input">
                                            <Users size={14} style={{ color: '#94a3b8' }} />
                                            <div className="flex items-center gap-2">
                                                <motion.button
                                                    whileTap={{ scale: 0.85 }}
                                                    whileHover={{ scale: 1.1 }}
                                                    onClick={() => setGuests(Math.max(1, guests - 1))}
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black transition-all"
                                                    style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}
                                                >−</motion.button>
                                                <span className="font-black text-sm w-5 text-center" style={{ color: '#0f172a' }}>
                                                    {guests}
                                                </span>
                                                <motion.button
                                                    whileTap={{ scale: 0.85 }}
                                                    whileHover={{ scale: 1.1 }}
                                                    onClick={() => setGuests(Math.min(10, guests + 1))}
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black transition-all"
                                                    style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}
                                                >+</motion.button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rooms */}
                                    <div className="space-y-2">
                                        <label
                                            className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                                            style={{ color: '#64748b' }}
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#EC4899' }} />
                                            Rooms
                                        </label>
                                        <div className="rounded-xl flex items-center justify-between px-3 py-3 glass-input">
                                            <BedDouble size={14} style={{ color: '#94a3b8' }} />
                                            <div className="flex items-center gap-2">
                                                <motion.button
                                                    whileTap={{ scale: 0.85 }}
                                                    whileHover={{ scale: 1.1 }}
                                                    onClick={() => setRooms(Math.max(1, rooms - 1))}
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black transition-all"
                                                    style={{ background: 'rgba(236,72,153,0.1)', color: '#EC4899' }}
                                                >−</motion.button>
                                                <span className="font-black text-sm w-5 text-center" style={{ color: '#0f172a' }}>
                                                    {rooms}
                                                </span>
                                                <motion.button
                                                    whileTap={{ scale: 0.85 }}
                                                    whileHover={{ scale: 1.1 }}
                                                    onClick={() => setRooms(Math.min(5, rooms + 1))}
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black transition-all"
                                                    style={{ background: 'rgba(236,72,153,0.1)', color: '#EC4899' }}
                                                >+</motion.button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Star Rating ── */}
                                <div className="space-y-2.5">
                                    <label
                                        className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                                        style={{ color: '#64748b' }}
                                    >
                                        <Star size={11} style={{ color: '#F59E0B' }} />
                                        Minimum Star Rating
                                    </label>
                                    <div className="flex gap-2 p-1 rounded-2xl"
                                        style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.1)' }}>
                                        {/* Any */}
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            whileHover={{ scale: 1.04 }}
                                            onClick={() => setStarRating(0)}
                                            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                                            style={starRating === 0
                                                ? {
                                                    background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                                                    color: '#fff',
                                                    boxShadow: '0 4px 12px rgba(139,92,246,0.3)',
                                                }
                                                : { color: '#94a3b8' }
                                            }
                                        >
                                            Any
                                        </motion.button>

                                        {[3, 4, 5].map((s) => (
                                            <motion.button
                                                key={s}
                                                whileTap={{ scale: 0.95 }}
                                                whileHover={{ scale: 1.04 }}
                                                onClick={() => setStarRating(s)}
                                                className="flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                                                style={starRating === s
                                                    ? {
                                                        background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                                                        color: '#fff',
                                                        boxShadow: '0 4px 12px rgba(245,158,11,0.35)',
                                                    }
                                                    : { color: '#94a3b8' }
                                                }
                                            >
                                                <Star
                                                    size={11}
                                                    style={starRating === s ? { fill: '#fff', color: '#fff' } : {}}
                                                />
                                                {s}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* ── Sort By ── */}
                                <div className="space-y-2.5">
                                    <label
                                        className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                                        style={{ color: '#64748b' }}
                                    >
                                        <span
                                            className="w-1.5 h-1.5 rounded-full"
                                            style={{ background: 'linear-gradient(135deg, #06B6D4, #0EA5E9)' }}
                                        />
                                        Sort By
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="w-full rounded-xl px-3 py-3 text-sm focus:outline-none appearance-none cursor-pointer font-medium glass-input"
                                            style={{ colorScheme: 'light', color: '#0f172a', background: 'transparent' }}
                                        >
                                            {sortOptions.map((o) => (
                                                <option
                                                    key={o.value}
                                                    value={o.value}
                                                    style={{ background: '#fff', color: '#0f172a' }}
                                                >
                                                    {o.label}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown
                                            size={14}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                            style={{ color: '#94a3b8' }}
                                        />
                                    </div>
                                </div>

                                {/* ── Validation hint ── */}
                                <AnimatePresence>
                                    {!isFormValid && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-start gap-2.5 p-3 rounded-xl"
                                            style={{
                                                background: 'rgba(14,165,233,0.06)',
                                                border: '1px solid rgba(14,165,233,0.15)',
                                            }}
                                        >
                                            <span className="text-base leading-none mt-0.5">ℹ️</span>
                                            <span className="text-xs font-medium" style={{ color: '#0284C7' }}>
                                                {!selectedLocation
                                                    ? 'Select a destination from the suggestions to continue.'
                                                    : !checkIn
                                                        ? 'Choose a check-in date to continue.'
                                                        : 'Choose a check-out date to continue.'
                                                }
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* ── Search Button ── */}
                            <div
                                className="p-4 md:p-5 border-t flex-shrink-0"
                                style={{
                                    borderColor: 'rgba(139,92,246,0.1)',
                                    background: 'rgba(255,255,255,0.65)',
                                }}
                            >
                                <motion.button
                                    whileHover={isFormValid ? { scale: 1.02, y: -1 } : {}}
                                    whileTap={isFormValid ? { scale: 0.98 } : {}}
                                    onClick={handleSearch}
                                    disabled={!isFormValid || loadingSearch}
                                    className="w-full relative overflow-hidden rounded-2xl py-3.5 flex items-center justify-center gap-2.5 font-semibold text-sm transition-all"
                                    style={isFormValid
                                        ? {
                                            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                                            color: 'white',
                                            boxShadow: '0 6px 24px rgba(139,92,246,0.4), 0 2px 8px rgba(236,72,153,0.2)',
                                            cursor: 'pointer',
                                        }
                                        : {
                                            background: 'rgba(148,163,184,0.15)',
                                            color: '#94a3b8',
                                            cursor: 'not-allowed',
                                        }
                                    }
                                >
                                    {/* Shimmer on hover */}
                                    {isFormValid && (
                                        <motion.div
                                            className="absolute inset-0 pointer-events-none"
                                            style={{
                                                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)',
                                            }}
                                            animate={{ x: ['-100%', '200%'] }}
                                            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                                        />
                                    )}

                                    {loadingSearch ? (
                                        <>
                                            <Loader size={17} className="animate-spin relative z-10" />
                                            <span className="relative z-10 font-semibold">Searching Hotels...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Search size={17} className="relative z-10" />
                                            <span className="relative z-10 font-semibold">Search Hotels</span>
                                            <Hotel size={14} className="relative z-10 opacity-75" />
                                        </>
                                    )}
                                </motion.button>

                                <p className="text-center text-[10px] mt-2.5 font-medium" style={{ color: '#94a3b8' }}>
                                    🏨 Best rates guaranteed · Free cancellation available
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