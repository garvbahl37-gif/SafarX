import { motion as Motion } from 'framer-motion';
import {
    Star,
    Globe,
    Plane,
    Hotel,
    X,
    Search,
    ArrowUpRight,
    ShieldCheck,
    Sparkle,
} from 'lucide-react';

const EASE = [0.22, 1, 0.36, 1];

const BookingResults = ({ results, onClose }) => {
    if (!results?.results?.length) return null;

    const getIconForUrl = (url) => {
        if (url.includes('flight') || url.includes('skyscanner') || url.includes('kayak')) {
            return <Plane size={15} aria-hidden="true" />;
        }
        if (url.includes('hotel') || url.includes('booking') || url.includes('airbnb')) {
            return <Hotel size={15} aria-hidden="true" />;
        }
        return <Globe size={15} aria-hidden="true" />;
    };

    const getDomainFromUrl = (url) => {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return url;
        }
    };

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
                                <Search size={17} className="text-saffron" />
                            </span>
                            <div className="min-w-0">
                                <h2 className="font-display text-[17px] leading-tight text-ivory">Sources</h2>
                                <p className="flex items-center gap-1.5 mt-1">
                                    <span className="route-dot" aria-hidden="true" />
                                    <span className="font-data text-[9.5px] uppercase tracking-[0.18em] text-ivory-faint">
                                        {results.results.length} found
                                    </span>
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="agent-icon-btn p-2 shrink-0"
                            aria-label="Close search results"
                        >
                            <X size={17} />
                        </button>
                    </div>

                    {/* Query */}
                    {results.query && (
                        <div className="flex items-center gap-2 px-3 py-2 mt-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                            <Sparkle size={13} className="text-saffron shrink-0" aria-hidden="true" />
                            <span className="text-[13px] truncate flex-1 text-ivory-muted">
                                {results.query}
                            </span>
                            <span className="agent-tag agent-tag-gold px-2 py-0.5 text-[9px]">Live</span>
                        </div>
                    )}
                </div>

                {/* ── Results list ── */}
                <div className="agent-scroll flex-1 overflow-y-auto p-4 md:p-5 space-y-3">
                    {results.results.map((result, idx) => (
                        <Motion.a
                            key={idx}
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(idx * 0.05, 0.4), duration: 0.28, ease: EASE }}
                            whileHover={{ y: -2 }}
                            className="agent-card agent-card-lift block p-3.5 rounded-2xl cursor-pointer group"
                        >
                            <div className="flex items-start gap-3">
                                <span
                                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                                               bg-saffron/10 border border-saffron/25 text-saffron"
                                    aria-hidden="true"
                                >
                                    {getIconForUrl(result.url)}
                                </span>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h3 className="text-[13.5px] font-medium text-ivory agent-clamp-1">
                                            {result.title}
                                        </h3>
                                        <ArrowUpRight
                                            size={14}
                                            className="shrink-0 text-saffron opacity-0 group-hover:opacity-100 transition-opacity"
                                            aria-hidden="true"
                                        />
                                    </div>

                                    <p className="flex items-center gap-1.5 font-data text-[9.5px] uppercase tracking-[0.14em] text-ivory-faint mb-2">
                                        <Globe size={9} aria-hidden="true" />
                                        {getDomainFromUrl(result.url)}
                                    </p>

                                    <p className="text-xs leading-relaxed text-ivory-muted agent-clamp-2">
                                        {result.content}
                                    </p>

                                    <div className="flex items-center gap-1.5 mt-3">
                                        {result.score > 0 && (
                                            <span className="agent-tag agent-tag-gold px-2 py-0.5 text-[9px]">
                                                <Star size={9} className="fill-current" aria-hidden="true" />
                                                {(result.score * 100).toFixed(0)}% match
                                            </span>
                                        )}
                                        <span className="agent-tag agent-tag-jade px-2 py-0.5 text-[9px]">
                                            <ShieldCheck size={9} aria-hidden="true" /> Verified
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Motion.a>
                    ))}
                </div>

                {/* ── Agent summary ── */}
                {results.answer && (
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="p-4 border-t border-white/[0.07] bg-ink-950/30"
                    >
                        <div className="p-3.5 rounded-xl bg-saffron/[0.06] border border-saffron/20">
                            <p className="eyebrow mb-2">Agent summary</p>
                            <p className="text-[13px] leading-relaxed text-ivory-muted">
                                {results.answer}
                            </p>
                        </div>
                    </Motion.div>
                )}

                {/* ── Footer ── */}
                <div className="p-4 md:p-5 border-t border-white/[0.07] bg-ink-950/30 shrink-0">
                    <button
                        onClick={onClose}
                        className="agent-btn-quiet w-full py-3 text-sm"
                        aria-label="Close search results"
                    >
                        <X size={15} />
                        Close results
                    </button>
                </div>
            </div>
        </Motion.div>
    );
};

export default BookingResults;
