import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, X, Plane, Clock, Users, Zap,
    Shield, ChevronDown, SlidersHorizontal,
    TrendingUp, Timer, Ban, CheckCircle, Sparkles,
} from 'lucide-react';
import {
    formatDuration, formatFare, formatTime, formatDate, isNextDay,
} from '../services/flightApi';

const SORT_OPTIONS = [
    { value: 'price_asc', label: 'Price: Low to High', icon: '₹↑' },
    { value: 'price_desc', label: 'Price: High to Low', icon: '₹↓' },
    { value: 'duration_asc', label: 'Duration: Shortest', icon: '⏱↑' },
    { value: 'dep_asc', label: 'Departure: Earliest', icon: '🌅' },
    { value: 'dep_desc', label: 'Departure: Latest', icon: '🌙' },
];

const STOP_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'direct', label: 'Direct' },
    { value: '1stop', label: '1 Stop' },
    { value: '2stop', label: '2+' },
];

const AIRLINE_COLORS = {
    'AI': { from: '#ef4444', to: '#f97316', text: '#dc2626' },
    '6E': { from: '#6366f1', to: '#3b82f6', text: '#4f46e5' },
    'SG': { from: '#eab308', to: '#ef4444', text: '#ca8a04' },
    'G8': { from: '#10b981', to: '#06b6d4', text: '#059669' },
    'EK': { from: '#dc2626', to: '#eab308', text: '#dc2626' },
};

const getAirlineStyle = (code) =>
    AIRLINE_COLORS[code] || { from: '#0EA5E9', to: '#8B5CF6', text: '#0284C7' };

const FlightResultsPanel = ({ results, traceId, searchParams, onBack, onClose }) => {
    const { flights = [], total_results = 0 } = results;
    const [sortBy, setSortBy] = useState('price_asc');
    const [stopFilter, setStopFilter] = useState('all');
    const [maxPrice, setMaxPrice] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [airlineFilter, setAirlineFilter] = useState('all');

    const uniqueAirlines = useMemo(() => {
        const seen = new Set();
        const airlines = [{ code: 'all', name: 'All Airlines' }];
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
        <motion.div
            initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="h-full flex flex-col rounded-2xl md:rounded-3xl overflow-hidden relative"
            style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,249,255,0.97) 100%)',
                border: '1.5px solid rgba(255,255,255,0.9)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(14,165,233,0.1)',
            }}>

            {/* Rainbow top line */}
            <div className="absolute top-0 left-0 right-0 h-1 z-10"
                style={{ background: 'linear-gradient(90deg, #0EA5E9, #8B5CF6, #EC4899, #F97316, #10B981)' }} />

            {/* Header */}
            <div className="relative p-4 border-b shrink-0"
                style={{ borderColor: 'rgba(14,165,233,0.1)', background: 'rgba(255,255,255,0.7)' }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <motion.button whileHover={{ scale: 1.1, x: -2 }} whileTap={{ scale: 0.9 }}
                            onClick={onBack}
                            className="p-2 rounded-xl transition-all"
                            style={{ background: 'rgba(14,165,233,0.08)', color: '#0EA5E9' }}>
                            <ArrowLeft size={16} />
                        </motion.button>
                        <div>
                            <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: '#0f172a' }}>
                                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-white text-xs"
                                    style={{ background: 'linear-gradient(135deg, #0EA5E9, #8B5CF6)' }}>
                                    {searchParams.from} <Plane size={10} /> {searchParams.to}
                                </span>
                            </h3>
                            <p className="text-[11px] mt-0.5 font-medium" style={{ color: '#64748b' }}>
                                {total_results} flights · {formatDate(searchParams.departure)}
                                {searchParams.passengers > 1 && ` · ${searchParams.passengers} pax`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => setShowFilters(v => !v)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                            style={showFilters
                                ? { background: 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(139,92,246,0.1))', color: '#0284C7', border: '1.5px solid rgba(14,165,233,0.25)' }
                                : { background: 'rgba(255,255,255,0.8)', color: '#64748b', border: '1.5px solid rgba(255,255,255,0.9)' }}>
                            <SlidersHorizontal size={12} />
                            Filters
                            {showFilters && (
                                <span className="w-1.5 h-1.5 rounded-full"
                                    style={{ background: '#0EA5E9' }} />
                            )}
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="p-2 rounded-xl transition-all"
                            style={{ background: 'rgba(0,0,0,0.04)', color: '#64748b' }}>
                            <X size={16} />
                        </motion.button>
                    </div>
                </div>

                {/* Filter Panel */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="overflow-hidden">
                            <div className="pt-4 space-y-4">
                                {/* Sort By */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                                        style={{ color: '#94a3b8' }}>
                                        <TrendingUp size={10} style={{ color: '#0EA5E9' }} /> Sort By
                                    </label>
                                    <div className="relative">
                                        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                                            className="w-full rounded-xl px-3 py-2.5 text-xs focus:outline-none appearance-none cursor-pointer font-medium glass-input"
                                            style={{ colorScheme: 'light', color: '#0f172a', background: 'transparent' }}>
                                            {SORT_OPTIONS.map(opt => (
                                                <option key={opt.value} value={opt.value}
                                                    style={{ background: '#fff', color: '#0f172a' }}>
                                                    {opt.icon} {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                            style={{ color: '#94a3b8' }} />
                                    </div>
                                </div>

                                {/* Stops */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                                        style={{ color: '#94a3b8' }}>
                                        <Timer size={10} style={{ color: '#10B981' }} /> Stops
                                    </label>
                                    <div className="flex gap-1.5 p-1 rounded-xl"
                                        style={{ background: 'rgba(14,165,233,0.04)', border: '1px solid rgba(14,165,233,0.08)' }}>
                                        {STOP_OPTIONS.map(opt => (
                                            <button key={opt.value} onClick={() => setStopFilter(opt.value)}
                                                className="flex-1 py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all"
                                                style={stopFilter === opt.value
                                                    ? { background: 'linear-gradient(135deg, #0EA5E9, #8B5CF6)', color: '#fff', boxShadow: '0 2px 8px rgba(14,165,233,0.3)' }
                                                    : { color: '#64748b' }}>
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Airline */}
                                {uniqueAirlines.length > 2 && (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                                            style={{ color: '#94a3b8' }}>
                                            <Plane size={10} style={{ color: '#8B5CF6' }} /> Airline
                                        </label>
                                        <div className="relative">
                                            <select value={airlineFilter} onChange={e => setAirlineFilter(e.target.value)}
                                                className="w-full rounded-xl px-3 py-2.5 text-xs focus:outline-none appearance-none cursor-pointer font-medium glass-input"
                                                style={{ colorScheme: 'light', color: '#0f172a', background: 'transparent' }}>
                                                {uniqueAirlines.map(a => (
                                                    <option key={a.code} value={a.code}
                                                        style={{ background: '#fff', color: '#0f172a' }}>{a.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                                style={{ color: '#94a3b8' }} />
                                        </div>
                                    </div>
                                )}

                                {/* Max Price */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider flex items-center justify-between"
                                        style={{ color: '#94a3b8' }}>
                                        <span>Max Price</span>
                                        <span className="font-bold text-xs px-2 py-0.5 rounded-lg"
                                            style={{ background: 'rgba(14,165,233,0.1)', color: '#0284C7' }}>
                                            {formatFare(maxPrice)}
                                        </span>
                                    </label>
                                    <input type="range" min={priceRange.min} max={priceRange.max} step={500}
                                        value={maxPrice || priceRange.max}
                                        onChange={e => setMaxPrice(Number(e.target.value))}
                                        className="w-full cursor-pointer"
                                        style={{
                                            background: `linear-gradient(to right, #0EA5E9 ${((maxPrice - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%, rgba(14,165,233,0.15) 0%)`,
                                        }} />
                                    <div className="flex justify-between text-[9px] font-medium" style={{ color: '#94a3b8' }}>
                                        <span>{formatFare(priceRange.min)}</span>
                                        <span>{formatFare(priceRange.max)}</span>
                                    </div>
                                </div>

                                {/* Count + Reset */}
                                <div className="flex items-center justify-between pt-1">
                                    <span className="text-[11px] font-medium" style={{ color: '#64748b' }}>
                                        Showing{' '}
                                        <span className="font-bold" style={{ color: '#0EA5E9' }}>{filteredFlights.length}</span>
                                        {' '}of {total_results} flights
                                    </span>
                                    <button onClick={resetFilters}
                                        className="text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all"
                                        style={{ background: 'rgba(249,115,22,0.08)', color: '#F97316' }}>
                                        Reset All
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Flight List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide">
                {filteredFlights.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-6">
                        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}
                            className="w-16 h-16 rounded-2xl flex items-center justify-center"
                            style={{ background: 'rgba(14,165,233,0.08)' }}>
                            <Ban size={32} style={{ color: 'rgba(14,165,233,0.4)' }} />
                        </motion.div>
                        <div>
                            <p className="font-semibold" style={{ color: '#475569' }}>No flights match your filters</p>
                            <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Try adjusting or resetting filters</p>
                        </div>
                        <button onClick={resetFilters}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white"
                            style={{ background: 'linear-gradient(135deg, #0EA5E9, #8B5CF6)' }}>
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    filteredFlights.map((flight, index) => (
                        <FlightCard key={flight.result_index || index} flight={flight}
                            traceId={traceId} passengerCount={searchParams.passengers} index={index} />
                    ))
                )}
            </div>
        </motion.div>
    );
};

const FlightCard = ({ flight, traceId, passengerCount, index }) => {
    const { airline, origin, destination, duration, accumulated_duration, stop_count, fare, is_lcc, is_refundable } = flight;
    const displayDuration = duration && duration > 0 ? duration : accumulated_duration;
    const depTime = formatTime(origin?.departure_time);
    const arrTime = formatTime(destination?.arrival_time);
    const nextDay = isNextDay(origin?.departure_time, destination?.arrival_time);
    const airlineStyle = getAirlineStyle(airline?.code);

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            whileHover={{ scale: 1.015, y: -2 }}
            className="relative rounded-2xl overflow-hidden cursor-pointer group transition-all"
            style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,249,255,0.95) 100%)',
                border: '1.5px solid rgba(255,255,255,0.9)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
            }}>

            {/* Colored top accent line */}
            <div className="absolute top-0 left-0 right-0 h-0.5"
                style={{ background: `linear-gradient(90deg, ${airlineStyle.from}, ${airlineStyle.to})` }} />

            {/* Hover overlay */}
            <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: `linear-gradient(135deg, rgba(14,165,233,0.03) 0%, rgba(139,92,246,0.03) 100%)` }} />

            <div className="p-4">
                {/* Row 1: Airline + Tags */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                            style={{ background: `linear-gradient(135deg, ${airlineStyle.from}25, ${airlineStyle.to}15)`, border: `1px solid ${airlineStyle.from}30` }}>
                            <span className="text-[11px] font-black" style={{ color: airlineStyle.text }}>
                                {airline?.code || '??'}
                            </span>
                        </div>
                        <div>
                            <p className="font-bold text-xs" style={{ color: '#0f172a' }}>
                                {airline?.name || airline?.code || 'Unknown'}
                            </p>
                            <p className="text-[10px] font-medium" style={{ color: '#94a3b8' }}>
                                {airline?.code}{airline?.flight_number}
                                {airline?.fare_class && <span> · {airline.fare_class}</span>}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        {is_lcc && (
                            <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black"
                                style={{ background: 'rgba(6,182,212,0.1)', color: '#0891B2', border: '1px solid rgba(6,182,212,0.25)' }}>
                                <Zap size={7} /> LCC
                            </span>
                        )}
                        {is_refundable ? (
                            <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black"
                                style={{ background: 'rgba(16,185,129,0.1)', color: '#059669', border: '1px solid rgba(16,185,129,0.25)' }}>
                                <CheckCircle size={7} /> Refundable
                            </span>
                        ) : (
                            <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black"
                                style={{ background: 'rgba(239,68,68,0.08)', color: '#DC2626', border: '1px solid rgba(239,68,68,0.2)' }}>
                                <Ban size={7} /> Non-Ref
                            </span>
                        )}
                    </div>
                </div>

                {/* Row 2: Times + Route */}
                <div className="flex items-center justify-between mb-3.5">
                    {/* Departure */}
                    <div className="text-left min-w-[64px]">
                        <p className="font-black text-xl leading-none tabular-nums" style={{ color: '#0f172a' }}>{depTime}</p>
                        <p className="font-bold text-xs mt-1" style={{ color: '#0EA5E9' }}>{origin?.airport_code}</p>
                        {origin?.city_name && <p className="text-[9px] truncate max-w-[60px]" style={{ color: '#94a3b8' }}>{origin.city_name}</p>}
                        {origin?.terminal && <p className="text-[9px]" style={{ color: '#94a3b8' }}>T{origin.terminal}</p>}
                    </div>

                    {/* Middle */}
                    <div className="flex flex-col items-center gap-1.5 flex-1 px-3">
                        <div className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: '#64748b' }}>
                            <Clock size={9} />
                            <span>{formatDuration(displayDuration)}</span>
                        </div>
                        <div className="flex items-center w-full gap-1.5">
                            <div className="h-px flex-1 rounded-full" style={{ background: 'linear-gradient(90deg, rgba(14,165,233,0.15), rgba(14,165,233,0.4))' }} />
                            <div className="w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
                                style={{ background: 'linear-gradient(135deg, #0EA5E9, #8B5CF6)', boxShadow: '0 2px 8px rgba(14,165,233,0.35)' }}>
                                <Plane size={9} className="text-white" />
                            </div>
                            <div className="h-px flex-1 rounded-full" style={{ background: 'linear-gradient(90deg, rgba(14,165,233,0.4), rgba(139,92,246,0.15))' }} />
                        </div>
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full"
                            style={stop_count === 0
                                ? { background: 'rgba(16,185,129,0.1)', color: '#059669', border: '1px solid rgba(16,185,129,0.2)' }
                                : stop_count === 1
                                    ? { background: 'rgba(245,158,11,0.1)', color: '#D97706', border: '1px solid rgba(245,158,11,0.2)' }
                                    : { background: 'rgba(239,68,68,0.08)', color: '#DC2626', border: '1px solid rgba(239,68,68,0.15)' }
                            }>
                            {stop_count === 0 ? '✦ Direct' : `${stop_count} Stop${stop_count > 1 ? 's' : ''}`}
                        </span>
                    </div>

                    {/* Arrival */}
                    <div className="text-right min-w-[64px]">
                        <div className="flex items-start justify-end gap-1">
                            <p className="font-black text-xl leading-none tabular-nums" style={{ color: '#0f172a' }}>{arrTime}</p>
                            {nextDay && (
                                <span className="text-[8px] font-black mt-0.5 px-1 rounded"
                                    style={{ background: 'rgba(245,158,11,0.12)', color: '#D97706' }}>+1</span>
                            )}
                        </div>
                        <p className="font-bold text-xs mt-1" style={{ color: '#8B5CF6' }}>{destination?.airport_code}</p>
                        {destination?.city_name && <p className="text-[9px] truncate max-w-[60px] ml-auto" style={{ color: '#94a3b8' }}>{destination.city_name}</p>}
                        {destination?.terminal && <p className="text-[9px]" style={{ color: '#94a3b8' }}>T{destination.terminal}</p>}
                    </div>
                </div>

                {/* Row 3: Fare + Select */}
                <div className="flex items-center justify-between pt-3 border-t"
                    style={{ borderColor: 'rgba(14,165,233,0.08)' }}>
                    <div>
                        <div className="flex items-baseline gap-1.5">
                            <p className="font-black text-lg leading-none" style={{ color: '#0f172a' }}>
                                {formatFare(passengerCount > 1 ? fare?.offered_fare / passengerCount : fare?.offered_fare)}
                            </p>
                            {passengerCount > 1 && <span className="text-[10px] font-medium" style={{ color: '#94a3b8' }}>/ person</span>}
                        </div>
                        {passengerCount > 1 && (
                            <p className="text-[10px] font-medium mt-0.5" style={{ color: '#64748b' }}>
                                Total: {formatFare(fare?.offered_fare)}
                            </p>
                        )}
                        <p className="text-[9px] font-medium mt-0.5" style={{ color: '#94a3b8' }}>
                            {fare?.currency || 'INR'} · Taxes incl.
                        </p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                        className="px-5 py-2.5 rounded-xl text-white text-xs font-black shadow-lg transition-all"
                        style={{
                            background: 'linear-gradient(135deg, #0EA5E9, #8B5CF6)',
                            boxShadow: '0 4px 16px rgba(14,165,233,0.35)',
                        }}
                        onClick={() => {
                            console.log('Selected flight:', { result_index: flight.result_index, trace_id: traceId, fare: fare?.offered_fare, is_lcc });
                            alert(`Flight Selected!\n\n${airline?.name} ${airline?.code}${airline?.flight_number}\n${depTime} → ${arrTime}\n${formatFare(fare?.offered_fare)}\n\nBooking flow coming soon!`);
                        }}>
                        Select ✈
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default FlightResultsPanel;