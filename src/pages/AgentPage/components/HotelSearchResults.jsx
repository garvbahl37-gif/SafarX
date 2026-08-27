import { motion as Motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, ChevronLeft, Hotel } from 'lucide-react';
import HotelCard from './HotelCard';

const EASE = [0.22, 1, 0.36, 1];

/* ── Skeleton card ── */
const SkeletonCard = ({ index }) => (
    <Motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08, duration: 0.3, ease: EASE }}
        className="agent-card rounded-2xl overflow-hidden"
        aria-hidden="true"
    >
        <div className="agent-shimmer h-44" />
        <div className="p-4 space-y-2.5">
            <div className="agent-shimmer h-4 rounded-lg" style={{ width: '72%' }} />
            <div className="agent-shimmer h-3 rounded-lg" style={{ width: '50%' }} />
            <div className="agent-shimmer h-3 rounded-lg" style={{ width: '35%' }} />
        </div>
    </Motion.div>
);

/* ── Main component ── */
const HotelSearchResults = ({
    results,
    loading,
    error,
    sortDisclaimer,
    hasSearched,
    onHotelClick,
    onClose,
    checkIn,
    checkOut,
    adults,
    rooms,
    destination,
}) => {
    return (
        <Motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
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
                            onClick={onClose}
                            className="agent-icon-btn p-2 shrink-0"
                            aria-label="Back to hotel search"
                        >
                            <ChevronLeft size={15} />
                        </button>

                        <div className="min-w-0">
                            <h3 className="font-display text-[16px] leading-tight text-ivory truncate">
                                {destination || 'Stays'}
                            </h3>
                            <p className="font-data text-[9.5px] uppercase tracking-[0.16em] text-ivory-faint mt-1 truncate">
                                {checkIn} → {checkOut}
                                {' · '}{adults} guest{adults > 1 ? 's' : ''}
                                {' · '}{rooms} room{rooms > 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="agent-icon-btn p-2 shrink-0"
                        aria-label="Close hotel results"
                    >
                        <X size={15} />
                    </button>
                </div>

                {/* Sort disclaimer */}
                {sortDisclaimer && !loading && (
                    <Motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[11px] mt-2.5 leading-relaxed text-ivory-faint"
                        dangerouslySetInnerHTML={{ __html: sortDisclaimer }}
                    />
                )}
            </div>

            {/* ── Content ── */}
            <div className="agent-scroll flex-1 overflow-y-auto p-4" aria-live="polite">

                {/* Error */}
                <AnimatePresence>
                    {error && (
                        <Motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            role="alert"
                            className="flex items-start gap-3 p-4 rounded-2xl mb-4 bg-[#E05252]/10 border border-[#E05252]/30"
                        >
                            <AlertCircle size={17} className="shrink-0 mt-0.5 text-[#E8807F]" aria-hidden="true" />
                            <div>
                                <p className="text-sm font-medium text-[#E8807F]">Search failed</p>
                                <p className="text-xs mt-1 leading-relaxed text-ivory-muted">{error}</p>
                            </div>
                        </Motion.div>
                    )}
                </AnimatePresence>

                {/* Loading */}
                {loading && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-5 px-1">
                            <span className="flex items-center gap-1.5" aria-hidden="true">
                                <span className="agent-waypoint" />
                                <span className="agent-waypoint" />
                                <span className="agent-waypoint" />
                            </span>
                            <span className="font-data text-[10px] uppercase tracking-[0.2em] text-ivory-faint">
                                Searching stays in {destination}…
                            </span>
                        </div>
                        {[0, 1, 2, 3].map((i) => (
                            <SkeletonCard key={i} index={i} />
                        ))}
                    </div>
                )}

                {/* Results */}
                {!loading && results.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <span className="route-dot" aria-hidden="true" />
                            <span className="font-data text-[10px] uppercase tracking-[0.2em] text-saffron">
                                Found {results.length} stays
                            </span>
                            <span className="route-line flex-1" aria-hidden="true" />
                        </div>

                        <AnimatePresence>
                            {results.map((hotel, index) => (
                                <Motion.div
                                    key={hotel.id}
                                    initial={{ opacity: 0, y: 18 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{
                                        delay: Math.min(index * 0.05, 0.4),
                                        duration: 0.3,
                                        ease: EASE,
                                    }}
                                >
                                    <HotelCard hotel={hotel} onClick={onHotelClick} />
                                </Motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Empty state */}
                {!loading && hasSearched && results.length === 0 && !error && (
                    <Motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="flex flex-col items-center justify-center h-56 text-center gap-4"
                    >
                        <span
                            className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/[0.04] border border-white/[0.07]"
                            aria-hidden="true"
                        >
                            <Hotel size={24} className="text-ivory-faint" />
                        </span>
                        <div>
                            <p className="font-display text-lg text-ivory">No stays found</p>
                            <p className="text-xs mt-1.5 text-ivory-muted">
                                Try different dates, or widen the star filter
                            </p>
                        </div>
                        <button onClick={onClose} className="agent-btn-gold px-5 py-2.5 text-xs">
                            Modify search
                        </button>
                    </Motion.div>
                )}
            </div>
        </Motion.div>
    );
};

export default HotelSearchResults;
