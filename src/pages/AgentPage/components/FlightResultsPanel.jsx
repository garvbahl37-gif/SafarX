import { useState, useMemo } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, X, Plane, Clock, Zap,
    ChevronDown, SlidersHorizontal,
    TrendingUp, Timer, Ban, CheckCircle,
} from 'lucide-react';
import {
    formatDuration, formatFare, formatTime, formatDate, isNextDay,
} from '../services/flightApi';

const EASE = [0.22, 1, 0.36, 1];

const SORT_OPTIONS = [
    { value: 'price_asc', label: 'Fare — low to high' },
    { value: 'price_desc', label: 'Fare — high to low' },
    { value: 'duration_asc', label: 'Duration — shortest' },
    { value: 'dep_asc', label: 'Departure — earliest' },
    { value: 'dep_desc', label: 'Departure — latest' },
];

const STOP_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'direct', label: 'Direct' },
    { value: '1stop', label: '1 stop' },
    { value: '2stop', label: '2+' },
];

const FlightResultsPanel = ({ results, traceId, searchParams, onBack, onClose }) => {
    const { flights = [], total_results = 0 } = results;
    const [sortBy, setSortBy] = useState('price_asc');
    const [stopFilter, setStopFilter] = useState('all');
    const [maxPrice, setMaxPrice] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [airlineFilter, setAirlineFilter] = useState('all');

    const uniqueAirlines = useMemo(() => {
        const seen = new Set();
        const airlines = [{ code: 'all', name: 'All airlines' }];
        flights.forEach(f => {
            const code = f.airline?.code; const name = f.airline?.name;
            if (code && !seen.has(code)) { seen.add(code); airlines.push({ code, name: name || code }); }
        });
        return airlines;
    }, [flights]);

    const priceRange = useMemo(() => {
        if (!flights.length) return { min: 0, max: 100000 };
        const prices = flights.map(f => f.fare?.offered_fare || 0);
        return { min: Math.min(...prices), max: Math.max(...prices) };
    }, [flights]);

    useMemo(() => {
        if (maxPrice === null && priceRange.max > 0) setMaxPrice(priceRange.max);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [priceRange]);

    const filteredFlights = useMemo(() => {
        let result = [...flights];
        if (stopFilter === 'direct') result = result.filter(f => f.stop_count === 0);
        else if (stopFilter === '1stop') result = result.filter(f => f.stop_count === 1);
        else if (stopFilter === '2stop') result = result.filter(f => f.stop_count >= 2);
        if (airlineFilter !== 'all') result = result.filter(f => f.airline?.code === airlineFilter);
        if (maxPrice !== null) result = result.filter(f => (f.fare?.offered_fare || 0) <= maxPrice);
        result.sort((a, b) => {
            switch (sortBy) {
                case 'price_asc': return (a.fare?.offered_fare || 0) - (b.fare?.offered_fare || 0);
                case 'price_desc': return (b.fare?.offered_fare || 0) - (a.fare?.offered_fare || 0);
                case 'duration_asc': return (a.duration || a.accumulated_duration || 0) - (b.duration || b.accumulated_duration || 0);
                case 'dep_asc': return new Date(a.origin?.departure_time || 0) - new Date(b.origin?.departure_time || 0);
                case 'dep_desc': return new Date(b.origin?.departure_time || 0) - new Date(a.origin?.departure_time || 0);
                default: return 0;
            }
        });
        return result;
    }, [flights, sortBy, stopFilter, maxPrice, airlineFilter]);

    const resetFilters = () => {
        setSortBy('price_asc'); setStopFilter('all');
        setAirlineFilter('all'); setMaxPrice(priceRange.max);
    };

    return (
        <Motion.div
            initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="agent-panel h-full flex flex-col rounded-2xl md:rounded-3xl overflow-hidden relative shadow-[0_24px_64px_rgba(0,0,0,0.45)]"
        >
            {/* Gold filament */}
            <div
                className="absolute top-0 left-0 right-0 h-px z-20 bg-gradient-to-r from-transparent via-saffron/50 to-transparent"
                aria-hidden="true"
            />

            {/* ── Header ── */}
            <div className="relative p-4 border-b border-white/[0.07] bg-ink-950/30 shrink-0">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <button
                            onClick={onBack}
                            className="agent-icon-btn p-2 shrink-0"
                            aria-label="Back to flight search"
                        >
                            <ArrowLeft size={15} />
                        </button>
                        <div className="min-w-0">
                            <p className="flex items-center gap-2 font-data text-sm tracking-[0.14em] text-ivory">
                                <span>{searchParams.from}</span>
                                <span className="route-line w-6" aria-hidden="true" />
                                <Plane size={11} className="text-saffron" aria-hidden="true" />
                                <span className="route-line w-6" aria-hidden="true" />
                                <span>{searchParams.to}</span>
                            </p>
                            <p className="font-data text-[9.5px] uppercase tracking-[0.16em] text-ivory-faint mt-1 truncate">
                                {total_results} flights · {formatDate(searchParams.departure)}
                                {searchParams.passengers > 1 && ` · ${searchParams.passengers} pax`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => setShowFilters(v => !v)}
                            aria-expanded={showFilters}
                            aria-label="Toggle filters"
                            className={`agent-chip px-3 py-2 text-xs ${showFilters ? 'agent-chip-active' : ''}`}
                        >
                            <SlidersHorizontal size={12} />
                            <span className="hidden sm:inline">Filters</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="agent-icon-btn p-2"
                            aria-label="Close flight results"
                        >
                            <X size={15} />
                        </button>
                    </div>
                </div>

                {/* ── Filter Panel ── */}
                <AnimatePresence>
                    {showFilters && (
                        <Motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="overflow-hidden"
                        >
                            <div className="pt-4 space-y-4">
                                {/* Sort By */}
                                <div className="space-y-1.5">
                                    <label htmlFor="flight-sort" className="eyebrow-muted flex items-center gap-1.5">
                                        <TrendingUp size={10} className="text-saffron" aria-hidden="true" /> Sort by
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="flight-sort"
                                            value={sortBy}
                                            onChange={e => setSortBy(e.target.value)}
                                            className="agent-field w-full px-3 py-2.5 pr-9 text-xs appearance-none cursor-pointer"
                                        >
                                            {SORT_OPTIONS.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ivory-faint" aria-hidden="true" />
                                    </div>
                                </div>

                                {/* Stops */}
                                <div className="space-y-1.5">
                                    <span className="eyebrow-muted flex items-center gap-1.5">
                                        <Timer size={10} className="text-saffron" aria-hidden="true" /> Stops
                                    </span>
                                    <div className="flex gap-1 p-1 rounded-full bg-white/[0.03] border border-white/[0.07]" role="group" aria-label="Stops">
                                        {STOP_OPTIONS.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setStopFilter(opt.value)}
                                                aria-pressed={stopFilter === opt.value}
                                                className={`flex-1 py-1.5 px-1 rounded-full font-data text-[10px] uppercase tracking-[0.1em] transition-all cursor-pointer ${stopFilter === opt.value
                                                    ? 'bg-gradient-to-br from-saffron-bright to-saffron text-ink-950 font-semibold'
                                                    : 'text-ivory-muted hover:text-ivory'
                                                    }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Airline */}
                                {uniqueAirlines.length > 2 && (
                                    <div className="space-y-1.5">
                                        <label htmlFor="flight-airline" className="eyebrow-muted flex items-center gap-1.5">
                                            <Plane size={10} className="text-saffron" aria-hidden="true" /> Airline
                                        </label>
                                        <div className="relative">
                                            <select
                                                id="flight-airline"
                                                value={airlineFilter}
                                                onChange={e => setAirlineFilter(e.target.value)}
                                                className="agent-field w-full px-3 py-2.5 pr-9 text-xs appearance-none cursor-pointer"
                                            >
                                                {uniqueAirlines.map(a => (
                                                    <option key={a.code} value={a.code}>{a.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ivory-faint" aria-hidden="true" />
                                        </div>
                                    </div>
                                )}

                                {/* Max Price */}
                                <div className="space-y-2">
                                    <label htmlFor="flight-max-price" className="eyebrow-muted flex items-center justify-between">
                                        <span>Max fare</span>
                                        <span className="font-data text-[11px] tracking-normal normal-case text-saffron">
                                            {formatFare(maxPrice)}
                                        </span>
                                    </label>
                                    <input
                                        id="flight-max-price"
                                        type="range" min={priceRange.min} max={priceRange.max} step={500}
                                        value={maxPrice || priceRange.max}
                                        onChange={e => setMaxPrice(Number(e.target.value))}
                                        className="agent-range w-full cursor-pointer"
                                    />
                                    <div className="flex justify-between font-data text-[9px] text-ivory-faint">
                                        <span>{formatFare(priceRange.min)}</span>
                                        <span>{formatFare(priceRange.max)}</span>
                                    </div>
                                </div>

                                {/* Count + Reset */}
                                <div className="flex items-center justify-between pt-1">
                                    <span className="font-data text-[10px] uppercase tracking-[0.14em] text-ivory-faint">
                                        <span className="text-saffron">{filteredFlights.length}</span> of {total_results}
                                    </span>
                                    <button
                                        onClick={resetFilters}
                                        className="agent-chip px-3 py-1 font-data text-[10px] uppercase tracking-[0.14em]"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </Motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Boarding passes ── */}
            <div className="agent-scroll flex-1 overflow-y-auto p-3 space-y-3">
                {filteredFlights.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-6">
                        <span
                            className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/[0.04] border border-white/[0.07]"
                            aria-hidden="true"
                        >
                            <Ban size={26} className="text-ivory-faint" />
                        </span>
                        <div>
                            <p className="font-display text-lg text-ivory">No flights match</p>
                            <p className="text-xs mt-1.5 text-ivory-muted">Loosen a filter and try again</p>
                        </div>
                        <button onClick={resetFilters} className="agent-btn-gold px-5 py-2.5 text-xs">
                            Reset filters
                        </button>
                    </div>
                ) : (
                    filteredFlights.map((flight, index) => (
                        <FlightCard key={flight.result_index || index} flight={flight}
                            traceId={traceId} passengerCount={searchParams.passengers} index={index} />
                    ))
                )}
            </div>
        </Motion.div>
    );
};

/* ══════════════════════════════════════════════
   BOARDING PASS
   ══════════════════════════════════════════════ */
const FlightCard = ({ flight, traceId, passengerCount, index }) => {
    const { airline, origin, destination, duration, accumulated_duration, stop_count, fare, is_lcc, is_refundable } = flight;
    const displayDuration = duration && duration > 0 ? duration : accumulated_duration;
    const depTime = formatTime(origin?.departure_time);
    const arrTime = formatTime(destination?.arrival_time);
    const nextDay = isNextDay(origin?.departure_time, destination?.arrival_time);

    return (
        <Motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.28, ease: EASE }}
            whileHover={{ y: -2 }}
            className="agent-pass rounded-2xl overflow-hidden"
        >
            <div className="p-4 pb-5">
                {/* ── Carrier row ── */}
                <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <span
                            className="w-9 h-9 rounded-xl flex items-center justify-center bg-saffron/10 border border-saffron/25 shrink-0"
                            aria-hidden="true"
                        >
                            <span className="font-data text-[11px] font-bold text-saffron">
                                {airline?.code || '--'}
                            </span>
                        </span>
                        <div className="min-w-0">
                            <p className="text-[13px] font-medium text-ivory truncate">
                                {airline?.name || airline?.code || 'Unknown carrier'}
                            </p>
                            <p className="font-data text-[9.5px] uppercase tracking-[0.14em] text-ivory-faint truncate">
                                {airline?.code}{airline?.flight_number}
                                {airline?.fare_class && ` · ${airline.fare_class}`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                        {is_lcc && (
                            <span className="agent-tag agent-tag-quiet px-2 py-0.5 text-[9px]">
                                <Zap size={8} aria-hidden="true" /> LCC
                            </span>
                        )}
                        {is_refundable ? (
                            <span className="agent-tag agent-tag-jade px-2 py-0.5 text-[9px]">
                                <CheckCircle size={8} aria-hidden="true" /> Refundable
                            </span>
                        ) : (
                            <span className="agent-tag agent-tag-quiet px-2 py-0.5 text-[9px]">
                                <Ban size={8} aria-hidden="true" /> Non-ref
                            </span>
                        )}
                    </div>
                </div>

                {/* ── Route ── */}
                <div className="flex items-end justify-between gap-2">
                    {/* Departure */}
                    <div className="text-left min-w-[68px]">
                        <p className="font-data text-[26px] font-bold leading-none tracking-[0.08em] text-ivory">
                            {origin?.airport_code || '---'}
                        </p>
                        <p className="font-data text-[15px] leading-none tabular-nums text-saffron mt-2">
                            {depTime}
                        </p>
                        {origin?.city_name && (
                            <p className="text-[9.5px] text-ivory-faint truncate max-w-[70px] mt-1.5">
                                {origin.city_name}
                            </p>
                        )}
                        {origin?.terminal && (
                            <p className="font-data text-[9px] uppercase tracking-[0.14em] text-ivory-faint">
                                T{origin.terminal}
                            </p>
                        )}
                    </div>

                    {/* Path */}
                    <div className="flex flex-col items-center gap-2 flex-1 px-2 pb-1">
                        <span className="flex items-center gap-1 font-data text-[9.5px] uppercase tracking-[0.14em] text-ivory-muted">
                            <Clock size={9} aria-hidden="true" />
                            {formatDuration(displayDuration)}
                        </span>
                        <div className="flex items-center w-full gap-1.5" aria-hidden="true">
                            <span className="route-dot shrink-0" />
                            <span className="agent-route-static flex-1" />
                            <Plane size={12} className="text-saffron shrink-0 rotate-45" />
                            <span className="agent-route-static flex-1" />
                            <span className="route-dot shrink-0" />
                        </div>
                        <span
                            className={`agent-tag px-2.5 py-0.5 text-[9px] ${stop_count === 0 ? 'agent-tag-jade' : 'agent-tag-quiet'
                                }`}
                        >
                            {stop_count === 0 ? 'Direct' : `${stop_count} stop${stop_count > 1 ? 's' : ''}`}
                        </span>
                    </div>

                    {/* Arrival */}
                    <div className="text-right min-w-[68px]">
                        <p className="font-data text-[26px] font-bold leading-none tracking-[0.08em] text-ivory">
                            {destination?.airport_code || '---'}
                        </p>
                        <p className="font-data text-[15px] leading-none tabular-nums text-saffron mt-2">
                            {arrTime}
                            {nextDay && (
                                <span className="align-super ml-0.5 text-[9px]">+1</span>
                            )}
                        </p>
                        {destination?.city_name && (
                            <p className="text-[9.5px] text-ivory-faint truncate max-w-[70px] ml-auto mt-1.5">
                                {destination.city_name}
                            </p>
                        )}
                        {destination?.terminal && (
                            <p className="font-data text-[9px] uppercase tracking-[0.14em] text-ivory-faint">
                                T{destination.terminal}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Perforation ── */}
            <div className="relative h-0" aria-hidden="true">
                <span className="agent-notch left-[-7px] top-[-7px]" />
                <span className="agent-notch right-[-7px] top-[-7px]" />
                <span className="agent-route-static absolute left-3.5 right-3.5 top-0" />
            </div>

            {/* ── Stub: fare + select ── */}
            <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-4">
                <div>
                    <p className="font-data text-[9px] uppercase tracking-[0.18em] text-ivory-faint">
                        {passengerCount > 1 ? 'Per person' : 'Total fare'}
                    </p>
                    <p className="font-data text-[21px] font-semibold leading-none text-saffron tabular-nums mt-1.5">
                        {formatFare(passengerCount > 1 ? fare?.offered_fare / passengerCount : fare?.offered_fare)}
                    </p>
                    {passengerCount > 1 && (
                        <p className="font-data text-[9.5px] uppercase tracking-[0.14em] text-ivory-muted mt-1.5">
                            {passengerCount} pax · {formatFare(fare?.offered_fare)}
                        </p>
                    )}
                    <p className="font-data text-[9px] uppercase tracking-[0.14em] text-ivory-faint mt-1">
                        {fare?.currency || 'INR'} · taxes incl.
                    </p>
                </div>

                <button
                    className="agent-btn-gold px-5 py-2.5 text-xs"
                    aria-label={`Select ${airline?.name || 'flight'} ${airline?.code}${airline?.flight_number}, ${depTime} to ${arrTime}`}
                    onClick={() => {
                        console.log('Selected flight:', { result_index: flight.result_index, trace_id: traceId, fare: fare?.offered_fare, is_lcc });
                        alert(`Flight selected\n\n${airline?.name} ${airline?.code}${airline?.flight_number}\n${depTime} → ${arrTime}\n${formatFare(fare?.offered_fare)}\n\nBooking flow coming soon.`);
                    }}
                >
                    Select
                </button>
            </div>
        </Motion.div>
    );
};

export default FlightResultsPanel;
