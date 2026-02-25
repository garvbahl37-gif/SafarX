// frontend/src/components/FlightBookingPanel.jsx

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Plane, ArrowLeftRight, Calendar, Users,
    MapPin, Search, ArrowRight, ChevronDown,
    Loader2, AlertCircle,
} from 'lucide-react';
import { searchFlights } from '../services/flightApi';
import FlightResultsPanel from './FlightResultsPanel';

const FlightBookingPanel = ({ onClose }) => {
    const [tripType, setTripType] = useState('one-way');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [departure, setDeparture] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [passengers, setPassengers] = useState(1);
    const [travelClass, setTravelClass] = useState('Economy');

    // API state
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchResults, setSearchResults] = useState(null);
    const [traceId, setTraceId] = useState(null);

    const swapLocations = () => {
        setFrom(to);
        setTo(from);
    };

    const handleSearch = async () => {
        setError(null);
        setSearchResults(null);

        // Basic field validation
        if (!from.trim()) {
            setError('Please enter origin city or airport code');
            return;
        }
        if (!to.trim()) {
            setError('Please enter destination city or airport code');
            return;
        }
        if (!departure) {
            setError('Please select a departure date');
            return;
        }
        if (tripType === 'round' && !returnDate) {
            setError('Please select a return date for round trip');
            return;
        }
        if (from.trim().toUpperCase() === to.trim().toUpperCase()) {
            setError('Origin and destination cannot be the same');
            return;
        }

        // ── NEW: Minimum advance booking check ────────────────────
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const depDate = new Date(departure);
        depDate.setHours(0, 0, 0, 0);

        const diffDays = Math.floor((depDate - today) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            setError('Departure date cannot be in the past');
            return;
        }

        if (diffDays < 7) {
            setError(
                `Please select a date at least 7 days from today. ` +
                `Earliest you can book: ${getMinDate()}`
            );
            return;
        }
        // ──────────────────────────────────────────────────────────

        setIsLoading(true);

        try {
            const result = await searchFlights({
                from,
                to,
                departure,
                returnDate,
                passengers,
                travelClass,
                tripType,
            });

            if (result.success && result.data.flights.length > 0) {
                setSearchResults(result.data);
                setTraceId(result.data.trace_id);
            } else if (result.success && result.data.flights.length === 0) {
                setError(
                    'No flights found for this route and date. ' +
                    'Try a different date or route.'
                );
            } else {
                setError('Search failed. Please try again.');
            }
        } catch (err) {
            const message =
                err.response?.data?.detail ||
                err.message ||
                'Failed to search flights. Please try again.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    // ── NEW: Helper to get minimum bookable date ───────────────────
    const getMinDate = () => {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        return date.toISOString().split('T')[0];
    };

    // Show results panel if we have results
    if (searchResults) {
        return (
            <FlightResultsPanel
                results={searchResults}
                traceId={traceId}
                searchParams={{ from, to, departure, returnDate, passengers, travelClass, tripType }}
                onBack={() => setSearchResults(null)}
                onClose={onClose}
            />
        );
    }

    const classes = ['Economy', 'Business', 'First'];
    const today = new Date().toISOString().split('T')[0];

    return (
        <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="h-full flex flex-col"
            style={{ width: '100%' }}
        >
            <div className="flex flex-col h-full glass-panel rounded-2xl md:rounded-3xl overflow-hidden relative">
                {/* Top shimmer */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ocean/40 to-transparent" />

                {/* Header */}
                <div className="p-4 md:p-5 border-b border-white/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-ocean to-teal rounded-xl blur-lg opacity-50" />
                                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-ocean to-teal flex items-center justify-center shadow-lg">
                                    <Plane size={18} className="text-white" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-white font-semibold text-base">Flight Booking</h3>
                                <p className="text-slate-400 text-xs flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-ocean rounded-full animate-pulse" />
                                    Real-time prices via TBO
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

                    {/* Trip Type Toggle */}
                    <div className="flex gap-2 mt-4">
                        {['round', 'one-way'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTripType(t)}
                                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${tripType === t
                                    ? 'bg-gradient-to-r from-ocean to-violet text-white shadow-lg shadow-ocean/20'
                                    : 'glass text-slate-400 hover:text-white'
                                    }`}
                            >
                                {t === 'round' ? '⇄ Round Trip' : '→ One Way'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 scrollbar-hide">

                    {/* Error Display */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
                            >
                                <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                                <p className="text-red-400 text-xs">{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* From / To */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Route
                        </label>
                        <div className="relative flex flex-col gap-2">
                            <div className="relative">
                                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-teal" />
                                <input
                                    type="text"
                                    value={from}
                                    onChange={(e) => setFrom(e.target.value.toUpperCase())}
                                    placeholder="From — DEL, BOM, SIN..."
                                    maxLength={3}
                                    className="w-full glass-input rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none uppercase"
                                />
                            </div>

                            <div className="flex justify-center">
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 180 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={swapLocations}
                                    transition={{ duration: 0.3 }}
                                    className="w-8 h-8 rounded-full glass flex items-center justify-center text-teal hover:bg-white/10 transition-colors border border-white/10"
                                >
                                    <ArrowLeftRight size={13} />
                                </motion.button>
                            </div>

                            <div className="relative">
                                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-violet" />
                                <input
                                    type="text"
                                    value={to}
                                    onChange={(e) => setTo(e.target.value.toUpperCase())}
                                    placeholder="To — DXB, LHR, JFK..."
                                    maxLength={3}
                                    className="w-full glass-input rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none uppercase"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Dates
                        </label>
                        <div className={`grid gap-2 ${tripType === 'round' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            <div className="relative">
                                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="date"
                                    value={departure}
                                    min={getMinDate()}
                                    onChange={(e) => setDeparture(e.target.value)}
                                    className="w-full glass-input rounded-xl pl-9 pr-3 py-3 text-sm text-white focus:outline-none appearance-none"
                                    style={{ colorScheme: 'dark' }}
                                />

                                {!departure && (
                                    <span className="absolute left-9 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">
                                        Departure
                                    </span>
                                )}
                            </div>
                            {tripType === 'round' && (
                                <input
                                    type="date"
                                    value={returnDate}
                                    min={departure || getMinDate()}
                                    onChange={(e) => setReturnDate(e.target.value)}
                                    className="w-full glass-input rounded-xl pl-9 pr-3 py-3 text-sm text-white focus:outline-none appearance-none"
                                    style={{ colorScheme: 'dark' }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Passengers & Class */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Passengers
                            </label>
                            <div className="glass-input rounded-xl flex items-center justify-between px-3 py-3">
                                <Users size={14} className="text-slate-400" />
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPassengers(Math.max(1, passengers - 1))}
                                        className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center text-sm transition-colors"
                                    >−</button>
                                    <span className="text-white text-sm font-semibold w-4 text-center">
                                        {passengers}
                                    </span>
                                    <button
                                        onClick={() => setPassengers(Math.min(9, passengers + 1))}
                                        className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center text-sm transition-colors"
                                    >+</button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Class
                            </label>
                            <div className="relative">
                                <select
                                    value={travelClass}
                                    onChange={(e) => setTravelClass(e.target.value)}
                                    className="w-full glass-input rounded-xl px-3 py-3 text-sm text-white focus:outline-none appearance-none cursor-pointer"
                                    style={{ colorScheme: 'dark', background: 'transparent' }}
                                >
                                    {classes.map(c => (
                                        <option key={c} value={c} style={{ background: '#0f172a' }}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Popular Routes */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Popular Routes
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { from: 'DEL', to: 'DXB' },
                                { from: 'BOM', to: 'LHR' },
                                { from: 'BOM', to: 'SIN' },
                                { from: 'DEL', to: 'JFK' },
                            ].map((route) => (
                                <button
                                    key={`${route.from}-${route.to}`}
                                    onClick={() => { setFrom(route.from); setTo(route.to); }}
                                    className="chip text-xs flex items-center gap-1.5"
                                >
                                    <span>{route.from}</span>
                                    <ArrowRight size={10} className="text-teal" />
                                    <span>{route.to}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Search Button */}
                <div className="p-4 md:p-5 border-t border-white/5">
                    <motion.button
                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                        onClick={handleSearch}
                        disabled={isLoading}
                        className="w-full btn btn-primary group relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-teal/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        {isLoading ? (
                            <>
                                <Loader2 size={16} className="relative z-10 animate-spin" />
                                <span className="relative z-10 font-semibold">Searching...</span>
                            </>
                        ) : (
                            <>
                                <Search size={16} className="relative z-10" />
                                <span className="relative z-10 font-semibold">Search Flights</span>
                            </>
                        )}
                    </motion.button>
                    <p className="text-center text-[10px] text-slate-600 mt-2">
                        Prices shown in INR. Additional taxes may apply.
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default FlightBookingPanel;