import { useState, useMemo } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
    X, TrainFront, Search, Clock, ArrowRight, ChevronLeft,
    MapPin, CalendarDays, Info, Radio, Ticket, ArrowLeftRight, Gauge,
} from 'lucide-react';
import { trainApi } from '../services/trainApi';
import { findStations } from '../../../data/indiaStations';
import DateField from '../../../components/ui/DateField';
import { toISO } from '../../../components/ui/dateUtils';

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

/* A station field that predicts from the first keystroke, against the list
   bundled with the app — IRCTC's own lookup only resolves an exact code. */
const StationField = ({ label, value, onPick, placeholder }) => {
    const [text, setText] = useState('');
    const [open, setOpen] = useState(false);
    const matches = useMemo(() => (open ? findStations(text, 6) : []), [text, open]);

    return (
        <div className="flex-1 min-w-0 relative">
            <span className="block font-data text-[9.5px] uppercase tracking-[0.16em] text-ivory-faint mb-1.5 pl-1">
                {label}
            </span>
            <input
                value={value ? `${value.name} · ${value.code}` : text}
                onChange={(e) => { setText(e.target.value); setOpen(true); if (value) onPick(null); }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                placeholder={placeholder}
                className="agent-field w-full px-3.5 py-3 text-[13px]"
                aria-label={label}
            />
            <AnimatePresence>
                {open && matches.length > 0 && !value && (
                    <Motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.16 }}
                        role="listbox"
                        className="agent-scroll absolute top-full left-0 right-0 mt-1.5 z-50 rounded-xl overflow-y-auto
                                   bg-ink-800 border border-white/[0.1] shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
                        style={{ maxHeight: 200 }}
                    >
                        {matches.map((station) => (
                            <button
                                key={station.code}
                                type="button"
                                role="option"
                                aria-selected="false"
                                onMouseDown={() => { onPick(station); setText(''); setOpen(false); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left cursor-pointer
                                           border-b border-white/[0.05] last:border-0 hover:bg-saffron/[0.07] transition-colors"
                            >
                                <span className="font-data text-[10px] tabular-nums text-saffron w-12 shrink-0">{station.code}</span>
                                <span className="flex-1 min-w-0">
                                    <span className="block text-[12.5px] truncate text-ivory">{station.name}</span>
                                    <span className="block text-[10px] truncate text-ivory-faint">{station.city}</span>
                                </span>
                            </button>
                        ))}
                    </Motion.div>
                )}
            </AnimatePresence>
        </div>
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
const MODES = [
    { id: 'route', label: 'Route', icon: ArrowLeftRight },
    { id: 'train', label: 'Train', icon: TrainFront },
    { id: 'live', label: 'Live', icon: Radio },
    { id: 'pnr', label: 'PNR', icon: Ticket },
];

const TrainBookingPanel = ({ onClose }) => {
    const [mode, setMode] = useState('route');
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searched, setSearched] = useState(false);
    const [openTrain, setOpenTrain] = useState(null);

    /* Route */
    const [from, setFrom] = useState(null);
    const [to, setTo] = useState(null);
    const [date, setDate] = useState(toISO(new Date()));

    /* Live and PNR */
    const [trainNo, setTrainNo] = useState('');
    const [pnr, setPnr] = useState('');
    const [liveStatus, setLiveStatus] = useState(null);
    const [ticket, setTicket] = useState(null);

    const reset = () => { setError(null); setSearched(true); };

    const swapEnds = () => { setFrom(to); setTo(from); };

    const runRoute = async () => {
        if (!from || !to || loading) return;
        setLoading(true); reset(); setResults([]);
        try {
            const { data } = await trainApi.between(from.code, to.code, date);
            setResults(data || []);
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    };

    const runLive = async () => {
        if (!/^\d{5}$/.test(trainNo) || loading) return;
        setLoading(true); reset(); setLiveStatus(null);
        try {
            const { data } = await trainApi.live(trainNo);
            setLiveStatus(data);
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    };

    const runPnr = async () => {
        if (!/^\d{10}$/.test(pnr.replace(/\s/g, '')) || loading) return;
        setLoading(true); reset(); setTicket(null);
        try {
            const { data } = await trainApi.pnr(pnr.replace(/\s/g, ''));
            setTicket(data);
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    };

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

    /* One button, four jobs — whichever mode is open. */
    const ACTIONS = {
        route: { label: 'Find trains', busy: 'Searching the timetable…', icon: Search,
                 note: 'Direct trains on your date', can: Boolean(from && to && date), run: runRoute },
        train: { label: 'Search trains', busy: 'Searching trains…', icon: Search,
                 note: 'Search by train name or number', can: query.trim().length >= 2, run: runSearch },
        live:  { label: 'Track this train', busy: 'Asking the network…', icon: Radio,
                 note: 'Position and delay, live from IRCTC', can: /^\d{5}$/.test(trainNo), run: runLive },
        pnr:   { label: 'Check status', busy: 'Checking the chart…', icon: Ticket,
                 note: 'Your booking, never stored', can: /^\d{10}$/.test(pnr), run: runPnr },
    };
    const action = ACTIONS[mode];
    const canRun = action.can;
    const run = action.run;

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

                        {/* ── Mode ── */}
                        <div className="px-4 md:px-5 pt-4 shrink-0">
                            <div className="flex gap-1 p-1 rounded-full bg-white/[0.03] border border-white/[0.07]" role="tablist">
                                {MODES.map((m) => (
                                    <button
                                        key={m.id}
                                        role="tab"
                                        aria-selected={mode === m.id}
                                        onClick={() => { setMode(m.id); setError(null); setSearched(false); }}
                                        className={`flex-1 py-2 rounded-full font-data text-[10px] uppercase tracking-[0.12em]
                                                    transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                            mode === m.id
                                                ? 'bg-gradient-to-br from-saffron-bright to-saffron text-ink-950 font-semibold'
                                                : 'text-ivory-muted hover:text-ivory'
                                        }`}
                                    >
                                        <m.icon size={11} aria-hidden="true" />
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── Body ── */}
                        <div className="agent-scroll flex-1 overflow-y-auto p-4 md:p-5 space-y-5">

                            {/* ─── ROUTE ─── */}
                            {mode === 'route' && (
                                <div className="space-y-3">
                                    <div className="flex items-end gap-2">
                                        <StationField label="From" value={from} onPick={setFrom} placeholder="Delhi, NDLS…" />
                                        <button
                                            onClick={swapEnds}
                                            aria-label="Swap stations"
                                            className="mb-1 w-9 h-9 rounded-full border border-white/[0.09] flex items-center justify-center shrink-0
                                                       text-ivory/70 hover:text-saffron hover:border-saffron/40 transition-colors cursor-pointer"
                                        >
                                            <ArrowLeftRight size={13} />
                                        </button>
                                        <StationField label="To" value={to} onPick={setTo} placeholder="Jaipur, JP…" />
                                    </div>

                                    <div>
                                        <span className="block font-data text-[9.5px] uppercase tracking-[0.16em] text-ivory-faint mb-1.5 pl-1">
                                            Date of journey
                                        </span>
                                        <DateField value={date} onChange={setDate} min={toISO(new Date())} placeholder="Pick a date" />
                                    </div>
                                </div>
                            )}

                            {/* ─── TRAIN BY NAME OR NUMBER ─── */}
                            {mode === 'train' && (
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
                                    {!searched && (
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {['Rajdhani', 'Shatabdi', 'Vande Bharat', 'Duronto'].map((suggestion) => (
                                                <button key={suggestion} onClick={() => setQuery(suggestion)} className="agent-chip px-3 py-1.5 text-[11px]">
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ─── LIVE RUNNING STATUS ─── */}
                            {mode === 'live' && (
                                <div className="space-y-2.5">
                                    <span className="eyebrow-muted block">Train number</span>
                                    <div className="relative">
                                        <Radio size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 text-ivory-faint" aria-hidden="true" />
                                        <input
                                            value={trainNo}
                                            onChange={(e) => setTrainNo(e.target.value.replace(/\D/g, '').slice(0, 5))}
                                            onKeyDown={(e) => e.key === 'Enter' && runLive()}
                                            placeholder="12951"
                                            inputMode="numeric"
                                            className="agent-field w-full pl-9 pr-3 py-3 font-data text-[13px] tabular-nums tracking-[0.1em]"
                                            aria-label="Train number"
                                        />
                                    </div>

                                    {liveStatus && (
                                        <Motion.div
                                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, ease: EASE }}
                                            className="agent-card p-4 rounded-2xl space-y-3"
                                        >
                                            <div>
                                                <h4 className="font-display text-[15px] text-ivory leading-snug">{liveStatus.name}</h4>
                                                <p className="font-data text-[9.5px] uppercase tracking-[0.16em] text-ivory-faint mt-1 tabular-nums">
                                                    {liveStatus.number} · {liveStatus.from.code} → {liveStatus.to.code}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`agent-tag px-3 py-1.5 text-[10px] ${
                                                    liveStatus.status.delayMinutes > 15 ? 'agent-tag-gold' : 'agent-tag-jade'
                                                }`}>
                                                    <Gauge size={10} aria-hidden="true" />
                                                    {liveStatus.status.delayMinutes === 0
                                                        ? 'On time'
                                                        : `${liveStatus.status.delayMinutes} min late`}
                                                </span>
                                                {liveStatus.status.atStation && (
                                                    <span className="agent-tag agent-tag-quiet px-3 py-1.5 text-[10px]">
                                                        <MapPin size={10} aria-hidden="true" />
                                                        {liveStatus.status.atStation.state} {liveStatus.status.atStation.name}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="font-data text-[9.5px] uppercase tracking-[0.14em] text-ivory-faint">
                                                {liveStatus.status.message}
                                                {liveStatus.status.kmFromSource != null ? ` · ${liveStatus.status.kmFromSource} km run` : ''}
                                            </p>
                                        </Motion.div>
                                    )}

                                    {liveStatus?.route?.length > 0 && (
                                        <div className="space-y-1.5 pt-1">
                                            <span className="eyebrow-muted block">Scheduled · expected</span>
                                            {liveStatus.route.map((stop, i) => (
                                                <div key={`${stop.code}-${i}`} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                                                    <span className="flex-1 min-w-0">
                                                        <span className="block text-[12.5px] truncate text-ivory">{stop.name}</span>
                                                        <span className="block font-data text-[9px] uppercase tracking-[0.14em] text-ivory-faint">{stop.code}</span>
                                                    </span>
                                                    <span className="text-right shrink-0 font-data tabular-nums">
                                                        <span className="block text-[12px] text-ivory-faint line-through decoration-ivory/25">
                                                            {stop.scheduledArrival || stop.scheduledDeparture || '—'}
                                                        </span>
                                                        <span className="block text-[12.5px] text-saffron">
                                                            {stop.estimatedArrival || stop.estimatedDeparture || '—'}
                                                        </span>
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ─── PNR ─── */}
                            {mode === 'pnr' && (
                                <div className="space-y-2.5">
                                    <span className="eyebrow-muted block">PNR number</span>
                                    <div className="relative">
                                        <Ticket size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 text-ivory-faint" aria-hidden="true" />
                                        <input
                                            value={pnr}
                                            onChange={(e) => setPnr(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            onKeyDown={(e) => e.key === 'Enter' && runPnr()}
                                            placeholder="Ten digits from your ticket"
                                            inputMode="numeric"
                                            className="agent-field w-full pl-9 pr-3 py-3 font-data text-[13px] tabular-nums tracking-[0.12em]"
                                            aria-label="PNR number"
                                        />
                                    </div>
                                    <p className="font-data text-[9px] uppercase tracking-[0.14em] text-ivory-faint pl-1">
                                        Read from IRCTC and shown to you · never stored
                                    </p>

                                    {ticket && (
                                        <Motion.div
                                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, ease: EASE }}
                                            className="agent-card p-4 rounded-2xl space-y-3"
                                        >
                                            <div>
                                                <h4 className="font-display text-[15px] text-ivory leading-snug">
                                                    {ticket.trainName || 'Your booking'}
                                                </h4>
                                                <p className="font-data text-[9.5px] uppercase tracking-[0.16em] text-ivory-faint mt-1 tabular-nums">
                                                    {[ticket.trainNumber, ticket.from && ticket.to && `${ticket.from} → ${ticket.to}`,
                                                      ticket.journeyDate, ticket.travelClass].filter(Boolean).join(' · ')}
                                                </p>
                                            </div>

                                            <div className="space-y-1.5">
                                                {ticket.passengers.map((p) => (
                                                    <div key={p.number} className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                                                        <span className="font-data text-[10px] uppercase tracking-[0.14em] text-ivory-faint">
                                                            Passenger {p.number}
                                                        </span>
                                                        <span className="text-right">
                                                            <span className="block font-data text-[12.5px] text-saffron">{p.current || p.booking || '—'}</span>
                                                            {(p.coach || p.berth) && (
                                                                <span className="block font-data text-[9.5px] uppercase tracking-[0.12em] text-ivory-faint">
                                                                    {[p.coach, p.berth].filter(Boolean).join(' · ')}
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </Motion.div>
                                    )}
                                </div>
                            )}

                            {error && (
                                <div className="agent-card p-3.5 rounded-2xl flex items-start gap-2.5">
                                    <Info size={13} className="text-saffron mt-0.5 shrink-0" aria-hidden="true" />
                                    <p className="text-[12px] leading-relaxed text-ivory-muted">{error}</p>
                                </div>
                            )}

                            {searched && !loading && !error && (mode === 'route' || mode === 'train') && results.length === 0 && (
                                <p className="text-[12.5px] text-ivory-faint text-center py-6">
                                    {mode === 'route'
                                        ? 'Nothing runs directly between those two on that date.'
                                        : 'No train matched that. Try a name like “Rajdhani”, or a five-digit number.'}
                                </p>
                            )}

                            {results.length > 0 && (mode === 'route' || mode === 'train') && (
                                <>
                                    <div className="flex items-center gap-3">
                                        <span className="eyebrow whitespace-nowrap">
                                            {results.length} train{results.length > 1 ? 's' : ''}
                                        </span>
                                        <span className="route-line flex-1" aria-hidden="true" />
                                    </div>

                                    <div className="space-y-2.5">
                                        {results.map((train, i) => (
                                            <Motion.button
                                                key={`${train.number}-${i}`}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.3, ease: EASE }}
                                                onClick={() => train.schedule?.length && setOpenTrain(train)}
                                                aria-label={train.schedule?.length ? `Route of ${train.name}` : train.name}
                                                className={`agent-card w-full text-left p-4 rounded-2xl space-y-3 transition-colors group ${
                                                    train.schedule?.length ? 'cursor-pointer hover:border-saffron/30' : 'cursor-default'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <h4 className="font-display text-[15px] text-ivory truncate">
                                                            <Highlight text={train.name} match={mode === 'train' ? query : ''} />
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

                                                <div className="flex items-center gap-3">
                                                    <div className="min-w-0">
                                                        <p className="font-data text-[15px] text-ivory tabular-nums leading-none">{train.from.time || '—'}</p>
                                                        <p className="font-data text-[9.5px] uppercase tracking-[0.14em] text-ivory-faint mt-1 truncate">{train.from.code}</p>
                                                    </div>
                                                    <div className="flex-1 flex items-center gap-1.5 min-w-0">
                                                        <span className="route-line flex-1" aria-hidden="true" />
                                                        {train.stops ? (
                                                            <span className="font-data text-[9px] uppercase tracking-[0.12em] text-ivory-faint shrink-0">
                                                                {train.stops} stops
                                                            </span>
                                                        ) : null}
                                                        <span className="route-line flex-1" aria-hidden="true" />
                                                    </div>
                                                    <div className="min-w-0 text-right">
                                                        <p className="font-data text-[15px] text-ivory tabular-nums leading-none">{train.to.time || '—'}</p>
                                                        <p className="font-data text-[9.5px] uppercase tracking-[0.14em] text-ivory-faint mt-1 truncate">
                                                            {train.to.code}{train.nights > 0 ? ` +${train.nights}` : ''}
                                                        </p>
                                                    </div>
                                                </div>

                                                {train.classes?.length > 0 && (
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        {train.classes.slice(0, 5).map((cls) => (
                                                            <span key={cls} className="agent-tag agent-tag-gold px-2.5 py-1 text-[9.5px]">{cls}</span>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-1.5 pt-2 border-t border-white/[0.07]">
                                                    <CalendarDays size={10} className="text-ivory-faint shrink-0" aria-hidden="true" />
                                                    {train.daily ? (
                                                        <span className="font-data text-[9.5px] uppercase tracking-[0.14em] text-horizon">Runs daily</span>
                                                    ) : (
                                                        <span className="flex items-center gap-1">
                                                            {DAYS.map((day) => (
                                                                <span key={day} className={`font-data text-[9px] uppercase tracking-[0.06em] ${
                                                                    train.runsOn.includes(day) ? 'text-saffron' : 'text-ivory/20'
                                                                }`}>{day[0]}</span>
                                                            ))}
                                                        </span>
                                                    )}
                                                </div>
                                            </Motion.button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>


                        {/* ── Action ── */}
                        <div className="p-4 md:p-5 border-t border-white/[0.07] bg-ink-950/30 shrink-0">
                            <Motion.button
                                whileHover={canRun && !loading ? { y: -1 } : undefined}
                                whileTap={canRun && !loading ? { scale: 0.99 } : undefined}
                                transition={{ duration: 0.25, ease: EASE }}
                                onClick={run}
                                disabled={!canRun || loading}
                                className="agent-btn-gold w-full py-3.5 text-sm"
                                aria-label={action.label}
                            >
                                {loading ? (
                                    <>
                                        <span className="flex items-center gap-1.5" aria-hidden="true">
                                            <span className="agent-waypoint" />
                                            <span className="agent-waypoint" />
                                            <span className="agent-waypoint" />
                                        </span>
                                        <span className="font-data text-[11px] uppercase tracking-[0.18em]">{action.busy}</span>
                                    </>
                                ) : (
                                    <>
                                        <action.icon size={16} />
                                        <span>{action.label}</span>
                                    </>
                                )}
                            </Motion.button>

                            <p className="text-center font-data text-[9.5px] uppercase tracking-[0.18em] text-ivory-faint mt-3">
                                {action.note}
                            </p>
                        </div>
                    </Motion.div>
                )}
            </AnimatePresence>
        </Motion.div>
    );
};

export default TrainBookingPanel;
