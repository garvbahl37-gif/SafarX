import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Plane, ArrowLeftRight, Calendar, Users,
    MapPin, Search, ArrowRight, ChevronDown,
    Loader2, AlertCircle, Sparkles,
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

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchResults, setSearchResults] = useState(null);
    const [traceId, setTraceId] = useState(null);

    const swapLocations = () => { setFrom(to); setTo(from); };

    const getMinDate = () => {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        return date.toISOString().split('T')[0];
    };

    const handleSearch = async () => {
        setError(null);
        setSearchResults(null);
        if (!from.trim()) { setError('Please enter origin city or airport code'); return; }
        if (!to.trim()) { setError('Please enter destination city or airport code'); return; }
        if (!departure) { setError('Please select a departure date'); return; }
        if (tripType === 'round' && !returnDate) { setError('Please select a return date for round trip'); return; }
        if (from.trim().toUpperCase() === to.trim().toUpperCase()) { setError('Origin and destination cannot be the same'); return; }

        const today = new Date(); today.setHours(0, 0, 0, 0);
        const depDate = new Date(departure); depDate.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((depDate - today) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) { setError('Departure date cannot be in the past'); return; }
        if (diffDays < 7) { setError(`Please select a date at least 7 days from today. Earliest: ${getMinDate()}`); return; }

        setIsLoading(true);
        try {
            const result = await searchFlights({ from, to, departure, returnDate, passengers, travelClass, tripType });
            if (result.success && result.data.flights.length > 0) {
                setSearchResults(result.data); setTraceId(result.data.trace_id);
            } else if (result.success && result.data.flights.length === 0) {
                setError('No flights found for this route and date. Try a different date or route.');
            } else { setError('Search failed. Please try again.'); }
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Failed to search flights. Please try again.');
        } finally { setIsLoading(false); }
    };

    if (searchResults) {
        return (
            <FlightResultsPanel
                results={searchResults} traceId={traceId}
                searchParams={{ from, to, departure, returnDate, passengers, travelClass, tripType }}
                onBack={() => setSearchResults(null)} onClose={onClose}
            />
        );
    }

    const classes = ['Economy', 'Business', 'First'];

    return (
        <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="h-full flex flex-col" style={{ width: '100%' }}
        >
            <div className="flex flex-col h-full rounded-2xl md:rounded-3xl overflow-hidden relative"
                style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,249,255,0.97) 100%)',
                    border: '1.5px solid rgba(255,255,255,0.9)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(14,165,233,0.1)',
                }}>

                {/* Rainbow top line */}
                <div className="absolute top-0 left-0 right-0 h-1 z-10"
                    style={{ background: 'linear-gradient(90deg, #0EA5E9, #8B5CF6, #EC4899, #F97316, #10B981)' }} />

                {/* Decorative bg blob */}
                <div className="absolute top-0 right-0 w-56 h-56 pointer-events-none opacity-50"
                    style={{ background: 'radial-gradient(circle at 80% 20%, rgba(14,165,233,0.1) 0%, transparent 65%)' }} />
                <div className="absolute bottom-20 left-0 w-40 h-40 pointer-events-none opacity-40"
                    style={{ background: 'radial-gradient(circle at 20% 80%, rgba(139,92,246,0.1) 0%, transparent 65%)' }} />

                {/* Header */}
                <div className="relative p-4 md:p-5 border-b"
                    style={{ borderColor: 'rgba(14,165,233,0.1)', background: 'rgba(255,255,255,0.6)' }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <motion.div className="relative"
                                whileHover={{ rotate: [0, -15, 15, 0] }}
                                transition={{ duration: 0.5 }}>
                                <div className="absolute inset-0 rounded-xl blur-md opacity-50"
                                    style={{ background: 'linear-gradient(135deg, #0EA5E9, #06B6D4)' }} />
                                <div className="relative w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
                                    style={{ background: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)' }}>
                                    <Plane size={18} className="text-white" />
                                </div>
                            </motion.div>
                            <div>
                                <h3 className="font-bold text-base" style={{ color: '#0f172a' }}>Flight Booking</h3>
                                <p className="text-xs flex items-center gap-1.5" style={{ color: '#64748b' }}>
                                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#0EA5E9' }} />
                                    Real-time prices via TBO
                                </p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="p-2 rounded-xl transition-all"
                            style={{ background: 'rgba(0,0,0,0.04)', color: '#64748b' }}>
                            <X size={18} />
                        </motion.button>
                    </div>

                    {/* Trip Type Toggle */}
                    <div className="flex gap-1.5 mt-4 p-1 rounded-2xl"
                        style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.12)' }}>
                        {['round', 'one-way'].map((t) => (
                            <motion.button key={t}
                                onClick={() => setTripType(t)}
                                whileTap={{ scale: 0.97 }}
                                className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all"
                                style={tripType === t
                                    ? { background: 'linear-gradient(135deg, #0EA5E9, #8B5CF6)', color: 'white', boxShadow: '0 4px 14px rgba(14,165,233,0.35)' }
                                    : { color: '#64748b' }}>
                                {t === 'round' ? '⇄ Round Trip' : '→ One Way'}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-5 scrollbar-hide">

                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="flex items-start gap-2.5 p-3.5 rounded-2xl"
                                style={{ background: 'rgba(249,115,22,0.08)', border: '1.5px solid rgba(249,115,22,0.2)' }}>
                                <AlertCircle size={15} style={{ color: '#F97316', marginTop: 1, flexShrink: 0 }} />
                                <p className="text-xs font-medium" style={{ color: '#EA580C' }}>{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* From / To */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                            style={{ color: '#64748b' }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'linear-gradient(135deg, #0EA5E9, #8B5CF6)' }} />
                            Route
                        </label>
                        <div className="relative flex flex-col gap-2">
                            {/* From */}
                            <motion.div className="relative" whileFocus={{ scale: 1.01 }}>
                                <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10"
                                    style={{ color: '#0EA5E9' }} />
                                <input
                                    type="text" value={from}
                                    onChange={(e) => setFrom(e.target.value.toUpperCase())}
                                    placeholder="From — DEL, BOM, SIN..."
                                    maxLength={3}
                                    className="w-full rounded-xl pl-9 pr-4 py-3 text-sm font-semibold focus:outline-none uppercase tracking-wider glass-input"
                                    style={{ color: '#0f172a' }}
                                />
                            </motion.div>

                            {/* Swap */}
                            <div className="flex justify-center">
                                <motion.button
                                    whileHover={{ scale: 1.15, rotate: 180 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={swapLocations}
                                    transition={{ duration: 0.35 }}
                                    className="w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all"
                                    style={{
                                        background: 'linear-gradient(135deg, #0EA5E9, #8B5CF6)',
                                        boxShadow: '0 4px 14px rgba(14,165,233,0.35)',
                                    }}>
                                    <ArrowLeftRight size={14} className="text-white" />
                                </motion.button>
                            </div>

                            {/* To */}
                            <motion.div className="relative" whileFocus={{ scale: 1.01 }}>
                                <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10"
                                    style={{ color: '#8B5CF6' }} />
                                <input
                                    type="text" value={to}
                                    onChange={(e) => setTo(e.target.value.toUpperCase())}
                                    placeholder="To — DXB, LHR, JFK..."
                                    maxLength={3}
                                    className="w-full rounded-xl pl-9 pr-4 py-3 text-sm font-semibold focus:outline-none uppercase tracking-wider glass-input"
                                    style={{ color: '#0f172a' }}
                                />
                            </motion.div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-2">
                        <label
                            className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                            style={{ color: '#64748b' }}
                        >
                            <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ background: 'linear-gradient(135deg, #F97316, #F59E0B)' }}
                            />
                            Dates
                        </label>

                        <div className={`grid gap-2.5 ${tripType === 'round' ? 'grid-cols-2' : 'grid-cols-1'}`}>

                            {/* Departure */}
                            <div className="flex flex-col gap-1">
                                <span className="text-[11px] text-slate-400 pl-1">Departure</span>

                                <div className="relative">
                                    <Calendar
                                        size={14}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10"
                                        style={{ color: '#94a3b8' }}
                                    />

                                    <input
                                        type="date"
                                        value={departure}
                                        min={getMinDate()}
                                        onChange={(e) => setDeparture(e.target.value)}
                                        className="w-full rounded-xl pl-9 pr-5 py-2 text-[15px] focus:outline-none appearance-none glass-input date-input"
                                        style={{ colorScheme: 'light', color: departure ? '#0f172a' : '#94a3b8' }}
                                    />
                                </div>
                            </div>

                            {/* Return */}
                            {tripType === 'round' && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-[11px] text-slate-400 pl-1">Return</span>

                                    <div className="relative">
                                        <Calendar
                                            size={14}
                                            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10"
                                            style={{ color: '#94a3b8' }}
                                        />

                                        <input
                                            type="date"
                                            value={returnDate}
                                            min={departure || getMinDate()}
                                            onChange={(e) => setReturnDate(e.target.value)}
                                            className="w-full rounded-xl pl-9 pr-5 py-2 text-[15px] focus:outline-none appearance-none glass-input date-input"
                                            style={{ colorScheme: 'light', color: returnDate ? '#0f172a' : '#94a3b8' }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Passengers & Class */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                                style={{ color: '#64748b' }}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#10B981' }} />
                                Passengers
                            </label>
                            <div className="rounded-xl flex items-center justify-between px-3 py-3 glass-input">
                                <Users size={14} style={{ color: '#94a3b8' }} />
                                <div className="flex items-center gap-2">
                                    <motion.button whileTap={{ scale: 0.85 }}
                                        onClick={() => setPassengers(Math.max(1, passengers - 1))}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold transition-all"
                                        style={{ background: 'rgba(14,165,233,0.1)', color: '#0EA5E9' }}>−</motion.button>
                                    <span className="font-bold text-sm w-4 text-center" style={{ color: '#0f172a' }}>{passengers}</span>
                                    <motion.button whileTap={{ scale: 0.85 }}
                                        onClick={() => setPassengers(Math.min(9, passengers + 1))}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold transition-all"
                                        style={{ background: 'rgba(14,165,233,0.1)', color: '#0EA5E9' }}>+</motion.button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                                style={{ color: '#64748b' }}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#8B5CF6' }} />
                                Class
                            </label>
                            <div className="relative">
                                <select value={travelClass} onChange={(e) => setTravelClass(e.target.value)}
                                    className="w-full rounded-xl px-3 py-3 text-sm focus:outline-none appearance-none cursor-pointer glass-input font-medium"
                                    style={{ colorScheme: 'light', color: '#0f172a', background: 'transparent' }}>
                                    {classes.map(c => (
                                        <option key={c} value={c} style={{ background: '#fff', color: '#0f172a' }}>{c}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                    style={{ color: '#94a3b8' }} />
                            </div>
                        </div>
                    </div>

                    {/* Popular Routes */}
                    <div className="space-y-2.5">
                        <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                            style={{ color: '#64748b' }}>
                            <Sparkles size={11} style={{ color: '#F59E0B' }} />
                            Popular Routes
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { from: 'DEL', to: 'DXB', flag: '🇮🇳→🇦🇪' },
                                { from: 'BOM', to: 'LHR', flag: '🇮🇳→🇬🇧' },
                                { from: 'BOM', to: 'SIN', flag: '🇮🇳→🇸🇬' },
                                { from: 'DEL', to: 'JFK', flag: '🇮🇳→🇺🇸' },
                            ].map((route) => (
                                <motion.button
                                    key={`${route.from}-${route.to}`}
                                    onClick={() => { setFrom(route.from); setTo(route.to); }}
                                    whileHover={{ scale: 1.05, y: -1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                                    style={{
                                        background: from === route.from && to === route.to
                                            ? 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(139,92,246,0.1))'
                                            : 'rgba(255,255,255,0.7)',
                                        border: from === route.from && to === route.to
                                            ? '1.5px solid rgba(14,165,233,0.3)'
                                            : '1.5px solid rgba(255,255,255,0.8)',
                                        color: from === route.from && to === route.to ? '#0284C7' : '#64748b',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                    }}>
                                    <span>{route.from}</span>
                                    <ArrowRight size={10} style={{ color: '#0EA5E9' }} />
                                    <span>{route.to}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Search Button */}
                <div className="p-4 md:p-5 border-t"
                    style={{ borderColor: 'rgba(14,165,233,0.1)', background: 'rgba(255,255,255,0.6)' }}>
                    <motion.button
                        whileHover={{ scale: isLoading ? 1 : 1.02, y: isLoading ? 0 : -1 }}
                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                        onClick={handleSearch}
                        disabled={isLoading}
                        className="w-full relative overflow-hidden rounded-2xl py-3.5 flex items-center justify-center gap-2.5 font-semibold text-sm text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{
                            background: 'linear-gradient(135deg, #0EA5E9 0%, #8B5CF6 100%)',
                            boxShadow: '0 6px 24px rgba(14,165,233,0.4), 0 2px 8px rgba(139,92,246,0.2)',
                        }}>
                        {/* Shimmer */}
                        <motion.div
                            className="absolute inset-0 opacity-0 hover:opacity-100"
                            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent, rgba(255,255,255,0.1))' }}
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        />
                        {isLoading ? (
                            <>
                                <Loader2 size={17} className="animate-spin relative z-10" />
                                <span className="relative z-10">Searching Flights...</span>
                            </>
                        ) : (
                            <>
                                <Search size={17} className="relative z-10" />
                                <span className="relative z-10">Search Flights</span>
                                <Plane size={14} className="relative z-10 opacity-70" />
                            </>
                        )}
                    </motion.button>
                    <p className="text-center text-[10px] mt-2.5 font-medium" style={{ color: '#94a3b8' }}>
                        ✈️ Prices in INR · Additional taxes may apply
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default FlightBookingPanel;