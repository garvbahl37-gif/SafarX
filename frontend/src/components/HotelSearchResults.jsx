import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, AlertCircle, ChevronLeft, Loader } from 'lucide-react';
import HotelCard from './HotelCard';

/* ── Skeleton Card ── */
const SkeletonCard = ({ index }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08 }}
        className="rounded-2xl overflow-hidden"
        style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.85), rgba(250,245,255,0.9))',
            border: '1.5px solid rgba(255,255,255,0.9)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        }}
    >
        {/* Image skeleton */}
        <div
            className="h-44 relative overflow-hidden"
            style={{ background: 'rgba(139,92,246,0.06)' }}
        >
            <motion.div
                className="absolute inset-0"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
                style={{
                    background:
                        'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                }}
            />
        </div>

        {/* Text skeleton */}
        <div className="p-4 space-y-2.5">
            <div
                className="h-4 rounded-xl overflow-hidden"
                style={{ width: '72%', background: 'rgba(139,92,246,0.08)' }}
            >
                <motion.div
                    className="h-full"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'linear', delay: 0.1 }}
                    style={{
                        background:
                            'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                    }}
                />
            </div>
            <div
                className="h-3 rounded-xl overflow-hidden"
                style={{ width: '50%', background: 'rgba(139,92,246,0.06)' }}
            >
                <motion.div
                    className="h-full"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'linear', delay: 0.2 }}
                    style={{
                        background:
                            'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                    }}
                />
            </div>
            <div
                className="h-3 rounded-xl overflow-hidden"
                style={{ width: '35%', background: 'rgba(139,92,246,0.05)' }}
            >
                <motion.div
                    className="h-full"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'linear', delay: 0.3 }}
                    style={{
                        background:
                            'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                    }}
                />
            </div>
        </div>
    </motion.div>
);

/* ── Main Component ── */
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
        <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="h-full flex flex-col rounded-2xl md:rounded-3xl overflow-hidden relative"
            style={{
                background:
                    'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(250,245,255,0.97) 100%)',
                border: '1.5px solid rgba(255,255,255,0.9)',
                boxShadow:
                    '0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(139,92,246,0.1)',
            }}
        >
            {/* Rainbow top line */}
            <div
                className="absolute top-0 left-0 right-0 h-1 z-10"
                style={{
                    background:
                        'linear-gradient(90deg, #8B5CF6, #EC4899, #F97316, #F59E0B, #10B981)',
                }}
            />

            {/* ── Header ── */}
            <div
                className="relative p-4 border-b flex-shrink-0"
                style={{
                    borderColor: 'rgba(139,92,246,0.1)',
                    background: 'rgba(255,255,255,0.7)',
                }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <motion.button
                            whileHover={{ scale: 1.1, x: -2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="p-2 rounded-xl transition-all"
                            style={{ background: 'rgba(139,92,246,0.08)', color: '#8B5CF6' }}
                        >
                            <ChevronLeft size={16} />
                        </motion.button>

                        <div>
                            <h3 className="font-bold text-sm flex items-center gap-2"
                                style={{ color: '#0f172a' }}>
                                <span className="text-base">🏨</span>
                                {destination || 'Hotels'}
                            </h3>
                            <p className="text-[11px] mt-0.5 font-medium" style={{ color: '#64748b' }}>
                                {checkIn} → {checkOut}
                                {' · '}{adults} guest{adults > 1 ? 's' : ''}
                                {' · '}{rooms} room{rooms > 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        className="p-2 rounded-xl transition-all"
                        style={{ background: 'rgba(0,0,0,0.04)', color: '#64748b' }}
                    >
                        <X size={18} />
                    </motion.button>
                </div>

                {/* Sort disclaimer */}
                {sortDisclaimer && !loading && (
                    <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[11px] mt-2.5 leading-relaxed font-medium"
                        style={{ color: '#94a3b8' }}
                        dangerouslySetInnerHTML={{ __html: sortDisclaimer }}
                    />
                )}
            </div>

            {/* ── Content ── */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">

                {/* Error */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-start gap-3 p-4 rounded-2xl mb-4"
                            style={{
                                background: 'rgba(239,68,68,0.06)',
                                border: '1.5px solid rgba(239,68,68,0.18)',
                            }}
                        >
                            <AlertCircle
                                size={18}
                                className="flex-shrink-0 mt-0.5"
                                style={{ color: '#EF4444' }}
                            />
                            <div>
                                <p className="font-bold text-sm" style={{ color: '#DC2626' }}>
                                    Search Failed
                                </p>
                                <p className="text-xs mt-0.5" style={{ color: '#EF4444' }}>
                                    {error}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Loading skeletons */}
                {loading && (
                    <div className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2.5 mb-5 px-1"
                        >
                            <div className="relative">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                >
                                    <Loader size={17} style={{ color: '#8B5CF6' }} />
                                </motion.div>
                            </div>
                            <span className="text-sm font-semibold" style={{ color: '#64748b' }}>
                                Searching hotels in{' '}
                                <span style={{ color: '#7C3AED' }}>{destination}</span>...
                            </span>
                        </motion.div>
                        {[0, 1, 2, 3].map((i) => (
                            <SkeletonCard key={i} index={i} />
                        ))}
                    </div>
                )}

                {/* Results */}
                {!loading && results.length > 0 && (
                    <div className="space-y-4">
                        {/* Count badge */}
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between px-1"
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className="text-xs font-bold px-3 py-1 rounded-full"
                                    style={{
                                        background:
                                            'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.07))',
                                        color: '#7C3AED',
                                        border: '1px solid rgba(139,92,246,0.2)',
                                    }}
                                >
                                    ✨ {results.length} Hotels Found
                                </span>
                            </div>
                        </motion.div>

                        <AnimatePresence>
                            {results.map((hotel, index) => (
                                <motion.div
                                    key={hotel.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{
                                        delay: index * 0.05,
                                        type: 'spring',
                                        stiffness: 280,
                                        damping: 24,
                                    }}
                                >
                                    <HotelCard
                                        hotel={hotel}
                                        checkIn={checkIn}
                                        checkOut={checkOut}
                                        adults={adults}
                                        rooms={rooms}
                                        onClick={onHotelClick}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Empty state */}
                {!loading && hasSearched && results.length === 0 && !error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center h-48 text-center gap-4"
                    >
                        <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
                            style={{
                                background:
                                    'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.06))',
                                border: '1.5px solid rgba(139,92,246,0.15)',
                            }}
                        >
                            🏨
                        </motion.div>
                        <div>
                            <p className="font-bold text-sm" style={{ color: '#475569' }}>
                                No hotels found
                            </p>
                            <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
                                Try adjusting your search dates or filters
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={onClose}
                            className="px-5 py-2 rounded-xl text-xs font-bold text-white"
                            style={{
                                background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                                boxShadow: '0 4px 14px rgba(139,92,246,0.35)',
                            }}
                        >
                            ← Modify Search
                        </motion.button>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default HotelSearchResults;