import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, AlertCircle, ChevronLeft, Loader } from 'lucide-react';
import HotelCard from './HotelCard';

const SkeletonCard = () => (
    <div className="glass-panel rounded-2xl overflow-hidden animate-pulse"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="h-44 bg-white/5" />
        <div className="p-3.5 space-y-2">
            <div className="h-4 bg-white/5 rounded-lg w-3/4" />
            <div className="h-3 bg-white/5 rounded-lg w-1/2" />
            <div className="h-3 bg-white/5 rounded-lg w-1/3" />
        </div>
    </div>
);

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
            className="h-full flex flex-col glass-panel rounded-2xl md:rounded-3xl overflow-hidden relative"
        >
            {/* Top shimmer */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet/40 to-transparent" />

            {/* Header */}
            <div className="p-4 border-b border-white/5 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <div>
                            <h3 className="text-white font-semibold text-sm">
                                {destination || 'Hotels'}
                            </h3>
                            <p className="text-slate-400 text-xs">
                                {checkIn} → {checkOut} · {adults} guests · {rooms} room{rooms > 1 ? 's' : ''}
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

                {/* Sort disclaimer */}
                {sortDisclaimer && !loading && (
                    <p className="text-slate-500 text-[11px] mt-2 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: sortDisclaimer }} />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                {/* Error */}
                {error && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl mb-4"
                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
                        <div>
                            <p className="text-red-400 text-sm font-semibold">Search Failed</p>
                            <p className="text-red-400/70 text-xs mt-0.5">{error}</p>
                        </div>
                    </div>
                )}

                {/* Loading Skeletons */}
                {loading && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Loader size={16} className="text-violet animate-spin" />
                            <span className="text-slate-400 text-sm">Searching hotels...</span>
                        </div>
                        {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
                    </div>
                )}

                {/* Results Grid */}
                {!loading && results.length > 0 && (
                    <div className="space-y-4">
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                            {results.length} Hotels Found
                        </p>
                        <AnimatePresence>
                            {results.map((hotel, index) => (
                                <motion.div
                                    key={hotel.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
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

                {/* Empty State */}
                {!loading && hasSearched && results.length === 0 && !error && (
                    <div className="flex flex-col items-center justify-center h-48 text-center">
                        <div className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center"
                            style={{ background: 'rgba(139,92,246,0.1)' }}>
                            <Search size={28} className="text-violet/50" />
                        </div>
                        <p className="text-slate-400 text-sm font-semibold">No hotels found</p>
                        <p className="text-slate-600 text-xs mt-1">Try adjusting your search filters</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default HotelSearchResults;