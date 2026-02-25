// frontend/src/components/FlightResultsPanel.jsx

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, X, Plane, Clock, Users, Zap,
    Shield, ChevronDown, SlidersHorizontal,
    TrendingUp, Timer, Ban, CheckCircle,
} from 'lucide-react';
import {
    formatDuration,
    formatFare,
    formatTime,
    formatDate,
    isNextDay,
} from '../services/flightApi';

// ─── Filter & Sort Options ────────────────────────────────────
const SORT_OPTIONS = [
    { value: 'price_asc', label: 'Price: Low to High', icon: '₹↑' },
    { value: 'price_desc', label: 'Price: High to Low', icon: '₹↓' },
    { value: 'duration_asc', label: 'Duration: Shortest', icon: '⏱↑' },
    { value: 'dep_asc', label: 'Departure: Earliest', icon: '🌅' },
    { value: 'dep_desc', label: 'Departure: Latest', icon: '🌙' },
];

const STOP_OPTIONS = [
    { value: 'all', label: 'All Flights' },
    { value: 'direct', label: 'Direct Only' },
    { value: '1stop', label: '1 Stop' },
    { value: '2stop', label: '2+ Stops' },
];

const AIRLINE_COLORS = {
    'AI': 'from-red-500/20 to-orange-500/20',
    '6E': 'from-indigo-500/20 to-blue-500/20',
    'SG': 'from-yellow-500/20 to-red-500/20',
    'G8': 'from-green-500/20 to-teal-500/20',
    'EK': 'from-red-600/20 to-yellow-500/20',
    'KW': 'from-blue-600/20 to-cyan-500/20',
};

const getAirlineGradient = (code) =>
    AIRLINE_COLORS[code] || 'from-ocean/20 to-violet/20';


// ─── Main Results Panel ───────────────────────────────────────

const FlightResultsPanel = ({ results, traceId, searchParams, onBack, onClose }) => {
    const { flights = [], total_results = 0 } = results;

    // Filter & sort state
    const [sortBy, setSortBy] = useState('price_asc');
    const [stopFilter, setStopFilter] = useState('all');
    const [maxPrice, setMaxPrice] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [airlineFilter, setAirlineFilter] = useState('all');

    // Get unique airlines from results
    const uniqueAirlines = useMemo(() => {
        const seen = new Set();
        const airlines = [{ code: 'all', name: 'All Airlines' }];
        flights.forEach(f => {
            const code = f.airline?.code;
            const name = f.airline?.name;
            if (code && !seen.has(code)) {
                seen.add(code);
                airlines.push({ code, name: name || code });
            }
        });
        return airlines;
    }, [flights]);

    // Get price range for slider
    const priceRange = useMemo(() => {
        if (!flights.length) return { min: 0, max: 100000 };
        const prices = flights.map(f => f.fare?.offered_fare || 0);
        return {
            min: Math.min(...prices),
            max: Math.max(...prices),
        };
    }, [flights]);

    // Initialize maxPrice once
    useMemo(() => {
        if (maxPrice === null && priceRange.max > 0) {
            setMaxPrice(priceRange.max);
        }
    }, [priceRange]);

    // Apply filters + sorting
    const filteredFlights = useMemo(() => {
        let result = [...flights];

        // Stop filter
        if (stopFilter === 'direct') {
            result = result.filter(f => f.stop_count === 0);
        } else if (stopFilter === '1stop') {
            result = result.filter(f => f.stop_count === 1);
        } else if (stopFilter === '2stop') {
            result = result.filter(f => f.stop_count >= 2);
        }

        // Airline filter
        if (airlineFilter !== 'all') {
            result = result.filter(f => f.airline?.code === airlineFilter);
        }

        // Price filter
        if (maxPrice !== null) {
            result = result.filter(f => (f.fare?.offered_fare || 0) <= maxPrice);
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case 'price_asc':
                    return (a.fare?.offered_fare || 0) - (b.fare?.offered_fare || 0);
                case 'price_desc':
                    return (b.fare?.offered_fare || 0) - (a.fare?.offered_fare || 0);
                case 'duration_asc':
                    return (a.duration || a.accumulated_duration || 0)
                        - (b.duration || b.accumulated_duration || 0);
                case 'dep_asc':
                    return new Date(a.origin?.departure_time || 0)
                        - new Date(b.origin?.departure_time || 0);
                case 'dep_desc':
                    return new Date(b.origin?.departure_time || 0)
                        - new Date(a.origin?.departure_time || 0);
                default:
                    return 0;
            }
        });

        return result;
    }, [flights, sortBy, stopFilter, maxPrice, airlineFilter]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="h-full flex flex-col glass-panel rounded-2xl md:rounded-3xl overflow-hidden relative"
        >
            {/* Top shimmer */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ocean/40 to-transparent" />

            {/* ── Header ─────────────────────────────────────── */}
            <div className="p-4 border-b border-white/5 shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onBack}
                            className="p-2 rounded-xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                        >
                            <ArrowLeft size={16} />
                        </motion.button>
                        <div>
                            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                                <span>{searchParams.from}</span>
                                <Plane size={12} className="text-ocean" />
                                <span>{searchParams.to}</span>
                            </h3>
                            <p className="text-slate-400 text-[11px]">
                                {total_results} flights · {formatDate(searchParams.departure)}
                                {searchParams.passengers > 1 && ` · ${searchParams.passengers} pax`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Filter toggle button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowFilters(v => !v)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${showFilters
                                ? 'bg-ocean/20 text-ocean border border-ocean/30'
                                : 'glass text-slate-400 hover:text-white border border-white/10'
                                }`}
                        >
                            <SlidersHorizontal size={12} />
                            Filters
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                        >
                            <X size={16} />
                        </motion.button>
                    </div>
                </div>

                {/* ── Filter Panel ──────────────────────────── */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-3 space-y-3">

                                {/* Sort By */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                        <TrendingUp size={10} /> Sort By
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={sortBy}
                                            onChange={e => setSortBy(e.target.value)}
                                            className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white focus:outline-none appearance-none cursor-pointer"
                                            style={{ colorScheme: 'dark', background: 'transparent' }}
                                        >
                                            {SORT_OPTIONS.map(opt => (
                                                <option
                                                    key={opt.value}
                                                    value={opt.value}
                                                    style={{ background: '#0f172a' }}
                                                >
                                                    {opt.icon} {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Stops filter */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                        <Timer size={10} /> Stops
                                    </label>
                                    <div className="flex gap-1.5">
                                        {STOP_OPTIONS.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setStopFilter(opt.value)}
                                                className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-semibold transition-all ${stopFilter === opt.value
                                                    ? 'bg-ocean/20 text-ocean border border-ocean/30'
                                                    : 'glass text-slate-500 hover:text-slate-300 border border-white/5'
                                                    }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Airline filter */}
                                {uniqueAirlines.length > 2 && (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                            <Plane size={10} /> Airline
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={airlineFilter}
                                                onChange={e => setAirlineFilter(e.target.value)}
                                                className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white focus:outline-none appearance-none cursor-pointer"
                                                style={{ colorScheme: 'dark', background: 'transparent' }}
                                            >
                                                {uniqueAirlines.map(a => (
                                                    <option
                                                        key={a.code}
                                                        value={a.code}
                                                        style={{ background: '#0f172a' }}
                                                    >
                                                        {a.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                )}

                                {/* Max Price slider */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                                        <span>Max Price</span>
                                        <span className="text-ocean font-bold">
                                            {formatFare(maxPrice)}
                                        </span>
                                    </label>
                                    <input
                                        type="range"
                                        min={priceRange.min}
                                        max={priceRange.max}
                                        step={500}
                                        value={maxPrice || priceRange.max}
                                        onChange={e => setMaxPrice(Number(e.target.value))}
                                        className="w-full h-1 rounded-full appearance-none cursor-pointer"
                                        style={{
                                            background: `linear-gradient(to right, #0066ff ${((maxPrice - priceRange.min) /
                                                (priceRange.max - priceRange.min)) * 100
                                                }%, rgba(255,255,255,0.1) 0%)`,
                                        }}
                                    />
                                    <div className="flex justify-between text-[9px] text-slate-600">
                                        <span>{formatFare(priceRange.min)}</span>
                                        <span>{formatFare(priceRange.max)}</span>
                                    </div>
                                </div>

                                {/* Results count + reset */}
                                <div className="flex items-center justify-between pt-1">
                                    <span className="text-[11px] text-slate-400">
                                        Showing{' '}
                                        <span className="text-white font-semibold">
                                            {filteredFlights.length}
                                        </span>
                                        {' '}of {total_results} flights
                                    </span>
                                    <button
                                        onClick={() => {
                                            setSortBy('price_asc');
                                            setStopFilter('all');
                                            setAirlineFilter('all');
                                            setMaxPrice(priceRange.max);
                                        }}
                                        className="text-[10px] text-ocean hover:text-ocean/80 font-semibold transition-colors"
                                    >
                                        Reset All
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Flight List ─────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-hide">
                {filteredFlights.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                        <Ban size={40} className="opacity-20" />
                        <p className="text-sm font-medium">No flights match your filters</p>
                        <button
                            onClick={() => {
                                setSortBy('price_asc');
                                setStopFilter('all');
                                setAirlineFilter('all');
                                setMaxPrice(priceRange.max);
                            }}
                            className="text-xs text-ocean hover:underline"
                        >
                            Reset filters
                        </button>
                    </div>
                ) : (
                    filteredFlights.map((flight, index) => (
                        <FlightCard
                            key={flight.result_index || index}
                            flight={flight}
                            traceId={traceId}
                            passengerCount={searchParams.passengers}
                            index={index}
                        />
                    ))
                )}
            </div>
        </motion.div>
    );
};


// ─── Single Flight Card ───────────────────────────────────────

const FlightCard = ({ flight, traceId, passengerCount, index }) => {
    const {
        airline,
        origin,
        destination,
        duration,
        accumulated_duration,
        stop_count,
        fare,
        is_lcc,
        is_refundable,
    } = flight;

    // Use accumulated_duration as fallback if duration is 0
    const displayDuration = duration && duration > 0
        ? duration
        : accumulated_duration;

    const depTime = formatTime(origin?.departure_time);
    const arrTime = formatTime(destination?.arrival_time);
    const nextDay = isNextDay(origin?.departure_time, destination?.arrival_time);
    const gradient = getAirlineGradient(airline?.code);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03, duration: 0.2 }}
            whileHover={{ scale: 1.01, y: -1 }}
            className="relative rounded-xl border border-white/5 hover:border-ocean/25 transition-all overflow-hidden cursor-pointer group"
            style={{ background: 'rgba(255,255,255,0.03)' }}
        >
            {/* Card gradient top line */}
            <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${gradient} opacity-60`} />

            <div className="p-3.5">
                {/* ── Row 1: Airline + Tags ─────────────────── */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        {/* Airline icon */}
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center border border-white/5`}>
                            <span className="text-white text-[10px] font-bold">
                                {airline?.code || '??'}
                            </span>
                        </div>
                        <div>
                            <p className="text-white text-xs font-semibold leading-none">
                                {airline?.name || airline?.code || 'Unknown'}
                            </p>
                            <p className="text-slate-500 text-[10px] mt-0.5">
                                {airline?.code}{airline?.flight_number}
                                {airline?.fare_class && (
                                    <span className="ml-1 text-slate-600">
                                        · {airline.fare_class}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-1">
                        {is_lcc && (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-teal/10 text-teal text-[9px] font-bold border border-teal/20">
                                <Zap size={7} /> LCC
                            </span>
                        )}
                        {is_refundable ? (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[9px] font-bold border border-green-500/20">
                                <CheckCircle size={7} /> Refundable
                            </span>
                        ) : (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[9px] font-bold border border-red-500/20">
                                <Ban size={7} /> Non-Ref
                            </span>
                        )}
                    </div>
                </div>

                {/* ── Row 2: Times + Route ─────────────────── */}
                <div className="flex items-center justify-between mb-3">

                    {/* Departure */}
                    <div className="text-left min-w-[60px]">
                        <p className="text-white font-bold text-xl leading-none tabular-nums">
                            {depTime}
                        </p>
                        <p className="text-slate-400 text-[11px] font-semibold mt-1">
                            {origin?.airport_code || searchParams?.from}
                        </p>
                        {origin?.city_name && (
                            <p className="text-slate-600 text-[9px] truncate max-w-[60px]">
                                {origin.city_name}
                            </p>
                        )}
                        {origin?.terminal && (
                            <p className="text-slate-600 text-[9px]">
                                T{origin.terminal}
                            </p>
                        )}
                    </div>

                    {/* Middle: duration + stops */}
                    <div className="flex flex-col items-center gap-1 flex-1 px-2">
                        {/* Duration */}
                        <div className="flex items-center gap-1 text-slate-500 text-[10px]">
                            <Clock size={9} />
                            <span>{formatDuration(displayDuration)}</span>
                        </div>

                        {/* Flight path line */}
                        <div className="flex items-center w-full gap-1">
                            <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-white/15" />
                            <div className="w-4 h-4 rounded-full bg-ocean/20 border border-ocean/30 flex items-center justify-center">
                                <Plane size={8} className="text-ocean" />
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-r from-white/15 to-white/5" />
                        </div>

                        {/* Stop badge */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stop_count === 0
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : stop_count === 1
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                            {stop_count === 0
                                ? '✦ Direct'
                                : `${stop_count} Stop${stop_count > 1 ? 's' : ''}`}
                        </span>
                    </div>

                    {/* Arrival */}
                    <div className="text-right min-w-[60px]">
                        <div className="flex items-start justify-end gap-1">
                            <p className="text-white font-bold text-xl leading-none tabular-nums">
                                {arrTime}
                            </p>
                            {/* Next day indicator */}
                            {nextDay && (
                                <span className="text-[8px] text-amber-400 font-bold mt-0.5 bg-amber-400/10 px-1 rounded">
                                    +1
                                </span>
                            )}
                        </div>
                        <p className="text-slate-400 text-[11px] font-semibold mt-1">
                            {destination?.airport_code || searchParams?.to}
                        </p>
                        {destination?.city_name && (
                            <p className="text-slate-600 text-[9px] truncate max-w-[60px] ml-auto">
                                {destination.city_name}
                            </p>
                        )}
                        {destination?.terminal && (
                            <p className="text-slate-600 text-[9px]">
                                T{destination.terminal}
                            </p>
                        )}
                    </div>
                </div>

                {/* ── Row 3: Fare + Select ─────────────────── */}
                <div className="flex items-center justify-between pt-2.5 border-t border-white/5">
                    <div>
                        <div className="flex items-baseline gap-1.5">
                            <p className="text-white font-bold text-base leading-none">
                                {formatFare(
                                    passengerCount > 1
                                        ? fare?.offered_fare / passengerCount
                                        : fare?.offered_fare
                                )}
                            </p>
                            {passengerCount > 1 && (
                                <span className="text-slate-500 text-[10px]">/ person</span>
                            )}
                        </div>
                        {passengerCount > 1 && (
                            <p className="text-slate-500 text-[10px] mt-0.5">
                                Total: {formatFare(fare?.offered_fare)}
                            </p>
                        )}
                        <p className="text-slate-600 text-[9px] mt-0.5">
                            {fare?.currency || 'INR'} · Taxes incl.
                        </p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-ocean to-violet text-white text-xs font-bold shadow-lg shadow-ocean/20 group-hover:shadow-ocean/40 transition-shadow"
                        onClick={() => {
                            // TODO: open passenger details / booking form
                            console.log('Selected flight:', {
                                result_index: flight.result_index,
                                trace_id: traceId,
                                fare: fare?.offered_fare,
                                is_lcc,
                            });
                            alert(
                                `Flight Selected!\n\n` +
                                `${airline?.name} ${airline?.code}${airline?.flight_number}\n` +
                                `${depTime} → ${arrTime}\n` +
                                `${formatFare(fare?.offered_fare)}\n\n` +
                                `Booking flow coming soon!`
                            );
                        }}
                    >
                        Select →
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default FlightResultsPanel;