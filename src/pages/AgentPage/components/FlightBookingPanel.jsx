import { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
    X, Plane, ArrowLeftRight, Users,
    MapPin, Search, ArrowRight, ChevronDown,
    AlertCircle,
} from 'lucide-react';
import { searchFlights } from '../services/flightApi';
import DateField from '../../../components/ui/DateField';
import DateRangeField from '../../../components/ui/DateRangeField';
import { toISO } from '../../../components/ui/dateUtils';
import FlightResultsPanel from './FlightResultsPanel';

const EASE = [0.22, 1, 0.36, 1];

/* Domestic trunk routes — all Indian */
const POPULAR_ROUTES = [
    { from: 'DEL', to: 'GOI', label: 'Delhi · Goa' },
    { from: 'BOM', to: 'IXL', label: 'Mumbai · Leh' },
    { from: 'BLR', to: 'COK', label: 'Bengaluru · Kochi' },
    { from: 'DEL', to: 'JAI', label: 'Delhi · Jaipur' },
];

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
        // Local, not UTC: before 05:30 IST toISOString() still reports yesterday.
        return toISO(date);
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
        <Motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="h-full flex flex-col" style={{ width: '100%' }}
        >
            <div className="agent-panel flex flex-col h-full rounded-2xl md:rounded-3xl overflow-hidden relative shadow-[0_24px_64px_rgba(0,0,0,0.45)]">

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
                                <Plane size={17} className="text-saffron" />
                            </span>
                            <div className="min-w-0">
                                <h3 className="font-display text-[17px] leading-tight text-ivory">Flights</h3>
                                <p className="flex items-center gap-1.5 mt-1">
                                    <span className="route-dot" aria-hidden="true" />
                                    <span className="font-data text-[9.5px] uppercase tracking-[0.18em] text-ivory-faint">
                                        Live fares in ₹
                                    </span>
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="agent-icon-btn p-2 shrink-0"
                            aria-label="Close flight search"
                        >
                            <X size={17} />
                        </button>
                    </div>

                    {/* Trip Type Toggle */}
                    <div
                        className="flex gap-1 mt-4 p-1 rounded-full bg-white/[0.03] border border-white/[0.07]"
                        role="group"
                        aria-label="Trip type"
                    >
                        {['round', 'one-way'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTripType(t)}
                                aria-pressed={tripType === t}
                                className={`flex-1 py-2 px-3 rounded-full font-data text-[10px] uppercase tracking-[0.16em] transition-all cursor-pointer ${tripType === t
                                    ? 'bg-gradient-to-br from-saffron-bright to-saffron text-ink-950 font-semibold shadow-[0_4px_14px_rgba(212,168,67,0.3)]'
                                    : 'text-ivory-muted hover:text-ivory'
                                    }`}
                            >
                                {t === 'round' ? 'Round trip' : 'One way'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Form Body ── */}
                <div className="agent-scroll flex-1 overflow-y-auto p-4 md:p-5 space-y-6">

                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <Motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                role="alert"
                                className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#E05252]/10 border border-[#E05252]/30"
                            >
                                <AlertCircle size={15} className="text-[#E8807F] mt-0.5 shrink-0" />
                                <p className="text-xs leading-relaxed text-[#E8807F]">{error}</p>
                            </Motion.div>
                        )}
                    </AnimatePresence>

                    {/* From / To */}
                    <div className="space-y-2.5">
                        <span className="eyebrow-muted block">Route</span>
                        <div className="relative flex flex-col gap-2">
                            <div className="relative">
                                <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 text-saffron" aria-hidden="true" />
                                <label htmlFor="flight-from" className="sr-only">Origin airport code</label>
                                <input
                                    id="flight-from"
                                    type="text" value={from}
                                    onChange={(e) => setFrom(e.target.value.toUpperCase())}
                                    placeholder="From — DEL, BOM, BLR…"
                                    maxLength={3}
                                    className="agent-field w-full pl-9 pr-4 py-3 font-data text-sm uppercase tracking-[0.14em]"
                                />
                            </div>

                            {/* Swap */}
                            <div className="flex justify-center">
                                <Motion.button
                                    whileHover={{ rotate: 180 }}
                                    whileTap={{ scale: 0.92 }}
                                    onClick={swapLocations}
                                    transition={{ duration: 0.35 }}
                                    className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer
                                               bg-saffron/10 border border-saffron/25 text-saffron hover:bg-saffron/16"
                                    aria-label="Swap origin and destination"
                                >
                                    <ArrowLeftRight size={14} />
                                </Motion.button>
                            </div>

                            <div className="relative">
                                <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 text-saffron" aria-hidden="true" />
                                <label htmlFor="flight-to" className="sr-only">Destination airport code</label>
                                <input
                                    id="flight-to"
                                    type="text" value={to}
                                    onChange={(e) => setTo(e.target.value.toUpperCase())}
                                    placeholder="To — GOI, IXL, COK…"
                                    maxLength={3}
                                    className="agent-field w-full pl-9 pr-4 py-3 font-data text-sm uppercase tracking-[0.14em]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-2.5">
                        <span className="eyebrow-muted block">Dates</span>

                        {tripType === 'round' ? (
                            <DateRangeField
                                startValue={departure}
                                endValue={returnDate}
                                onChange={(out, back) => {
                                    setDeparture(out);
                                    setReturnDate(back);
                                }}
                                min={getMinDate()}
                                startLabel="Departure"
                                endLabel="Return"
                                unit="day"
                                presets={false}
                            />
                        ) : (
                            <DateField
                                id="flight-departure"
                                value={departure}
                                onChange={setDeparture}
                                min={getMinDate()}
                                placeholder="Departure date"
                            />
                        )}
                    </div>

                    {/* Passengers & Class */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2.5">
                            <span className="eyebrow-muted block">Passengers</span>
                            <div className="agent-field flex items-center justify-between px-3 py-2.5">
                                <Users size={14} className="text-ivory-faint" aria-hidden="true" />
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPassengers(Math.max(1, passengers - 1))}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-semibold cursor-pointer
                                                   bg-white/[0.05] border border-white/[0.07] text-ivory hover:border-saffron/35"
                                        aria-label="Remove a passenger"
                                    >−</button>
                                    <span className="font-data text-sm w-5 text-center text-ivory tabular-nums" aria-live="polite">
                                        {passengers}
                                    </span>
                                    <button
                                        onClick={() => setPassengers(Math.min(9, passengers + 1))}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-semibold cursor-pointer
                                                   bg-white/[0.05] border border-white/[0.07] text-ivory hover:border-saffron/35"
                                        aria-label="Add a passenger"
                                    >+</button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <label htmlFor="flight-class" className="eyebrow-muted block">Class</label>
                            <div className="relative">
                                <select
                                    id="flight-class"
                                    value={travelClass}
                                    onChange={(e) => setTravelClass(e.target.value)}
                                    className="agent-field w-full px-3 py-3 pr-9 text-sm appearance-none cursor-pointer"
                                >
                                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ivory-faint" aria-hidden="true" />
                            </div>
                        </div>
                    </div>

                    {/* Popular Routes */}
                    <div className="space-y-2.5">
                        <span className="eyebrow-muted block">Popular routes</span>
                        <div className="flex flex-wrap gap-2">
                            {POPULAR_ROUTES.map((route) => {
                                const active = from === route.from && to === route.to;
                                return (
                                    <button
                                        key={`${route.from}-${route.to}`}
                                        onClick={() => { setFrom(route.from); setTo(route.to); }}
                                        className={`agent-chip px-3 py-1.5 font-data text-[11px] tracking-[0.08em] ${active ? 'agent-chip-active' : ''
                                            }`}
                                        aria-label={`Set route ${route.label}`}
                                        aria-pressed={active}
                                    >
                                        <span>{route.from}</span>
                                        <ArrowRight size={10} className={active ? '' : 'text-saffron'} aria-hidden="true" />
                                        <span>{route.to}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Search Button ── */}
                <div className="p-4 md:p-5 border-t border-white/[0.07] bg-ink-950/30 shrink-0">
                    <Motion.button
                        whileHover={isLoading ? undefined : { y: -1 }}
                        whileTap={isLoading ? undefined : { scale: 0.99 }}
                        transition={{ duration: 0.25, ease: EASE }}
                        onClick={handleSearch}
                        disabled={isLoading}
                        className="agent-btn-gold w-full py-3.5 text-sm"
                        aria-label="Search flights"
                    >
                        {isLoading ? (
                            <>
                                <span className="flex items-center gap-1.5" aria-hidden="true">
                                    <span className="agent-waypoint" />
                                    <span className="agent-waypoint" />
                                    <span className="agent-waypoint" />
                                </span>
                                <span className="font-data text-[11px] uppercase tracking-[0.18em]">
                                    Searching flights…
                                </span>
                            </>
                        ) : (
                            <>
                                <Search size={16} />
                                <span>Search flights</span>
                            </>
                        )}
                    </Motion.button>
                    <p className="text-center font-data text-[9.5px] uppercase tracking-[0.18em] text-ivory-faint mt-3">
                        Fares in ₹ · taxes may apply
                    </p>
                </div>
            </div>
        </Motion.div>
    );
};

export default FlightBookingPanel;
