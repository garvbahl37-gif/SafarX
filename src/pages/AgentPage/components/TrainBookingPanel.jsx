import { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
    X, TrainFront, Search, Clock, ArrowRight, ChevronLeft,
    MapPin, CalendarDays, Info,
} from 'lucide-react';
import { trainApi } from '../services/trainApi';

const EASE = [0.22, 1, 0.36, 1];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/* Marks the typed fragment without trusting provider HTML. */
const Highlight = ({ text = '', match = '' }) => {
    const needle = match.trim().toLowerCase();
    const at = needle ? text.toLowerCase().indexOf(needle) : -1;
    if (at < 0) return text;
    return (
        <>
            {text.slice(0, at)}
            <b className="text-saffron font-semibold">{text.slice(at, at + needle.length)}</b>
            {text.slice(at + needle.length)}
        </>
    );
};

/* ══════════════ ROUTE — every halt on the way ══════════════ */
const RouteView = ({ train, onBack, onClose }) => (
    <Motion.div
        key="route"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 30 }}
        transition={{ duration: 0.28, ease: EASE }}
        className="agent-panel flex flex-col h-full rounded-2xl md:rounded-3xl overflow-hidden relative shadow-[0_24px_64px_rgba(0,0,0,0.45)]"
    >
        <div className="absolute top-0 left-0 right-0 h-px z-20 bg-gradient-to-r from-transparent via-saffron/50 to-transparent" aria-hidden="true" />

        <div className="relative p-4 md:p-5 border-b border-white/[0.07] bg-ink-950/30 shrink-0">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        onClick={onBack}
                        aria-label="Back to train results"
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 border border-white/[0.09]
                                   text-ivory/70 hover:text-saffron hover:border-saffron/40 transition-colors cursor-pointer"
                    >
                        <ChevronLeft size={15} />
                    </button>
                    <div className="min-w-0">
                        <h3 className="font-display text-[17px] text-ivory truncate">{train.name}</h3>
                        <p className="font-data text-[10px] uppercase tracking-[0.16em] text-ivory-faint mt-0.5 tabular-nums">
                            {train.number} · {train.stops} stops · {train.distance} km
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    aria-label="Close train search"
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 border border-white/[0.09]
                               text-ivory/70 hover:text-saffron hover:border-saffron/40 transition-colors cursor-pointer"
                >
                    <X size={15} />
                </button>
            </div>
        </div>

        <div className="agent-scroll flex-1 overflow-y-auto p-4 md:p-5">
            <ol className="relative space-y-0">
                {train.schedule.map((stop, i) => {
                    const last = i === train.schedule.length - 1;
                    return (
                        <Motion.li
                            key={`${stop.code}-${i}`}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: Math.min(i * 0.04, 0.4), duration: 0.28, ease: EASE }}
                            className="relative flex gap-3.5 pl-1"
                        >
                            {/* The line down the platform */}
                            <div className="flex flex-col items-center shrink-0 w-3">
                                <span className={`w-2.5 h-2.5 rounded-full mt-1.5 ${
                                    i === 0 || last
                                        ? 'bg-saffron shadow-[0_0_10px_rgba(212,168,67,0.5)]'
                                        : 'bg-ivory/25'
                                }`} aria-hidden="true" />
                                {!last && <span className="flex-1 w-px my-1 bg-gradient-to-b from-saffron/30 to-white/[0.08]" aria-hidden="true" />}
                            </div>

                            <div className={`flex-1 min-w-0 flex items-start justify-between gap-3 ${last ? 'pb-1' : 'pb-5'}`}>
                                <div className="min-w-0">
                                    <p className="text-[13px] text-ivory truncate">{stop.name}</p>
                                    <p className="font-data text-[9.5px] uppercase tracking-[0.14em] text-ivory-faint mt-0.5">
                                        {stop.code}
                                        {stop.halt ? ` · halt ${stop.halt}` : ''}
                                        {stop.km > 0 ? ` · ${stop.km} km` : ''}
                                    </p>
                                </div>

                                <div className="text-right shrink-0 font-data tabular-nums">
                                    <p className="text-[13px] text-ivory">
                                        {stop.arrival || stop.departure}
                                    </p>
                                    {stop.arrival && stop.departure && (
                                        <p className="text-[10px] text-ivory-faint mt-0.5">dep {stop.departure}</p>
                                    )}
                                    {stop.day > 1 && (
                                        <p className="text-[9px] uppercase tracking-[0.14em] text-saffron/70 mt-0.5">
                                            day {stop.day}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Motion.li>
                    );
                })}
            </ol>
        </div>

        <div className="p-4 md:p-5 border-t border-white/[0.07] bg-ink-950/30 shrink-0">
            <a
                href={`https://www.irctc.co.in/nget/train-search`}
                target="_blank"
                rel="noopener noreferrer"
                className="agent-btn-gold w-full py-3.5 text-sm"
            >
                <span>Book on IRCTC</span>
                <ArrowRight size={15} />
            </a>
            <p className="text-center font-data text-[9.5px] uppercase tracking-[0.18em] text-ivory-faint mt-3">
                Timings from IRCTC · seats booked on their site
            </p>
        </div>
    </Motion.div>
);

/* ══════════════ PANEL ══════════════ */
const TrainBookingPanel = ({ onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searched, setSearched] = useState(false);
    const [openTrain, setOpenTrain] = useState(null);

    const runSearch = async () => {
        const q = query.trim();
        if (q.length < 2 || loading) return;
        setLoading(true);
        setError(null);
        setSearched(true);
        try {
            const { data } = await trainApi.search(q);
            setResults(data || []);
        } catch (err) {
            setError(err.message);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="h-full flex flex-col"
            style={{ width: '100%' }}
        >
            <AnimatePresence mode="wait">
                {openTrain ? (
                    <RouteView
                        train={openTrain}
                        onBack={() => setOpenTrain(null)}
                        onClose={onClose}
                    />
                ) : (
                    <Motion.div
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="agent-panel flex flex-col h-full rounded-2xl md:rounded-3xl overflow-hidden relative shadow-[0_24px_64px_rgba(0,0,0,0.45)]"
                    >
                        <div className="absolute top-0 left-0 right-0 h-px z-20 bg-gradient-to-r from-transparent via-saffron/50 to-transparent" aria-hidden="true" />

                        {/* ── Header ── */}
                        <div className="relative p-4 md:p-5 border-b border-white/[0.07] bg-ink-950/30 shrink-0">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span
                                        className="w-10 h-10 rounded-xl flex items-center justify-center bg-saffron/10 border border-saffron/25 shrink-0"
                                        aria-hidden="true"
                                    >
                                        <TrainFront size={17} className="text-saffron" />
                                    </span>
                                    <div className="min-w-0">
                                        <h3 className="font-display text-[18px] text-ivory leading-none">Trains</h3>
                                        <p className="font-data text-[9.5px] uppercase tracking-[0.18em] text-ivory-faint mt-1.5">
                                            Routes, timings and classes
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    aria-label="Close train search"
                                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 border border-white/[0.09]
                                               text-ivory/70 hover:text-saffron hover:border-saffron/40 transition-colors cursor-pointer"
                                >
                                    <X size={15} />
                                </button>
                            </div>
                        </div>

                        {/* ── Body ── */}
                        <div className="agent-scroll flex-1 overflow-y-auto p-4 md:p-5 space-y-5">
                            <div className="space-y-2.5">
                                <span className="eyebrow-muted block">Train name or number</span>
                                <div className="relative">
                                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 text-ivory-faint" aria-hidden="true" />
                                    <input
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && runSearch()}
                                        placeholder="Rajdhani, Vande Bharat, 12951…"
                                        className="agent-field w-full pl-9 pr-3 py-3 text-[13px]"
                                        aria-label="Train name or number"
                                    />
                                </div>
                            </div>

                            {!searched && (
                                <div className="flex flex-wrap gap-1.5">
                                    {['Rajdhani', 'Shatabdi', 'Vande Bharat', 'Duronto', '12951'].map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => { setQuery(suggestion); }}
                                            className="agent-chip px-3 py-1.5 text-[11px]"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {error && (
                                <div className="agent-card p-3.5 rounded-2xl flex items-start gap-2.5">
                                    <Info size={13} className="text-saffron mt-0.5 shrink-0" aria-hidden="true" />
                                    <p className="text-[12px] leading-relaxed text-ivory-muted">{error}</p>
                                </div>
                            )}

                            {searched && !loading && !error && results.length === 0 && (
                                <p className="text-[12.5px] text-ivory-faint text-center py-6">
                                    No train matched that. Try a name like “Rajdhani”, or a five-digit number.
                                </p>
                            )}

                            {results.length > 0 && (
                                <div className="flex items-center gap-3">
                                    <span className="eyebrow whitespace-nowrap">
                                        {results.length} train{results.length > 1 ? 's' : ''}
                                    </span>
                                    <span className="route-line flex-1" aria-hidden="true" />
                                </div>
                            )}

                            <div className="space-y-2.5">
                                {results.map((train, i) => (
                                    <Motion.button
                                        key={`${train.number}-${i}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: Math.min(i * 0.05, 0.35), duration: 0.3, ease: EASE }}
                                        onClick={() => setOpenTrain(train)}
                                        aria-label={`Route of ${train.name}`}
                                        className="agent-card w-full text-left p-4 rounded-2xl space-y-3 cursor-pointer
                                                   hover:border-saffron/30 transition-colors group"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <h4 className="font-display text-[15px] text-ivory truncate">
                                                    <Highlight text={train.name} match={query} />
                                                </h4>
                                                <p className="font-data text-[9.5px] uppercase tracking-[0.16em] text-ivory-faint mt-1 tabular-nums">
                                                    {train.number}
                                                </p>
                                            </div>
                                            {train.duration && (
                                                <span className="agent-tag agent-tag-quiet px-2.5 py-1 text-[9.5px] shrink-0">
                                                    <Clock size={9} aria-hidden="true" />
                                                    {train.duration}
                                                </span>
                                            )}
                                        </div>

                                        {/* Ends of the run */}
                                        <div className="flex items-center gap-3">
                                            <div className="min-w-0">
                                                <p className="font-data text-[15px] text-ivory tabular-nums leading-none">
                                                    {train.from.time || '—'}
                                                </p>
                                                <p className="font-data text-[9.5px] uppercase tracking-[0.14em] text-ivory-faint mt-1 truncate">
                                                    {train.from.code}
                                                </p>
                                            </div>

                                            <div className="flex-1 flex items-center gap-1.5 min-w-0">
                                                <span className="route-line flex-1" aria-hidden="true" />
                                                <span className="font-data text-[9px] uppercase tracking-[0.12em] text-ivory-faint shrink-0">
                                                    {train.stops} stops
                                                </span>
                                                <span className="route-line flex-1" aria-hidden="true" />
                                            </div>

                                            <div className="min-w-0 text-right">
                                                <p className="font-data text-[15px] text-ivory tabular-nums leading-none">
                                                    {train.to.time || '—'}
                                                </p>
                                                <p className="font-data text-[9.5px] uppercase tracking-[0.14em] text-ivory-faint mt-1 truncate">
                                                    {train.to.code}
                                                    {train.nights > 0 ? ` +${train.nights}` : ''}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                            <span className="agent-tag agent-tag-quiet px-2.5 py-1 text-[9.5px]">
                                                <MapPin size={9} aria-hidden="true" />
                                                {train.from.name} → {train.to.name}
                                            </span>
                                            {train.classes.slice(0, 4).map((cls) => (
                                                <span key={cls} className="agent-tag agent-tag-gold px-2.5 py-1 text-[9.5px]">
                                                    {cls}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-1.5 pt-2 border-t border-white/[0.07]">
                                            <CalendarDays size={10} className="text-ivory-faint shrink-0" aria-hidden="true" />
                                            {train.daily ? (
                                                <span className="font-data text-[9.5px] uppercase tracking-[0.14em] text-horizon">
                                                    Runs daily
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1">
                                                    {DAYS.map((day) => (
                                                        <span
                                                            key={day}
                                                            className={`font-data text-[9px] uppercase tracking-[0.06em] ${
                                                                train.runsOn.includes(day) ? 'text-saffron' : 'text-ivory/20'
                                                            }`}
                                                        >
                                                            {day[0]}
                                                        </span>
                                                    ))}
                                                </span>
                                            )}
                                        </div>
                                    </Motion.button>
                                ))}
                            </div>
                        </div>

                        {/* ── Search button ── */}
                        <div className="p-4 md:p-5 border-t border-white/[0.07] bg-ink-950/30 shrink-0">
                            <Motion.button
                                whileHover={query.trim().length >= 2 && !loading ? { y: -1 } : undefined}
                                whileTap={query.trim().length >= 2 && !loading ? { scale: 0.99 } : undefined}
                                transition={{ duration: 0.25, ease: EASE }}
                                onClick={runSearch}
                                disabled={query.trim().length < 2 || loading}
                                className="agent-btn-gold w-full py-3.5 text-sm"
                                aria-label="Search trains"
                            >
                                {loading ? (
                                    <>
                                        <span className="flex items-center gap-1.5" aria-hidden="true">
                                            <span className="agent-waypoint" />
                                            <span className="agent-waypoint" />
                                            <span className="agent-waypoint" />
                                        </span>
                                        <span className="font-data text-[11px] uppercase tracking-[0.18em]">
                                            Searching trains…
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Search size={16} />
                                        <span>Search trains</span>
                                    </>
                                )}
                            </Motion.button>

                            <p className="text-center font-data text-[9.5px] uppercase tracking-[0.18em] text-ivory-faint mt-3">
                                Search by train name or number
                            </p>
                        </div>
                    </Motion.div>
                )}
            </AnimatePresence>
        </Motion.div>
    );
};

export default TrainBookingPanel;
