import { motion } from 'framer-motion';
import { Star, MapPin, Award } from 'lucide-react';

const RatingBubbles = ({ rating }) => {
    const filled = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <div
                    key={i}
                    className="w-2 h-2 rounded-full transition-all"
                    style={{
                        background: i <= filled
                            ? 'linear-gradient(135deg, #10B981, #34D399)'
                            : i === filled + 1 && half
                                ? 'rgba(16,185,129,0.45)'
                                : 'rgba(0,0,0,0.08)',
                    }}
                />
            ))}
        </div>
    );
};

const HotelCard = ({ hotel, checkIn, checkOut, adults, rooms, onClick }) => {
    const isTravellersChoice = hotel.badge?.type === 'TRAVELLER_CHOICE';
    const isBestOfBest = hotel.badge?.type === 'BEST_OF_BEST';

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.015, y: -3 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            onClick={() => onClick(hotel)}
            className="relative rounded-2xl overflow-hidden cursor-pointer group"
            style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(250,245,255,0.97) 100%)',
                border: '1.5px solid rgba(255,255,255,0.9)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            }}
        >
            {/* Colored top accent */}
            <div
                className="absolute top-0 left-0 right-0 h-0.5 z-10"
                style={{ background: 'linear-gradient(90deg, #8B5CF6, #EC4899, #F97316)' }}
            />

            {/* Hover glow overlay */}
            <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none rounded-2xl"
                style={{
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.04) 0%, rgba(236,72,153,0.03) 100%)',
                    boxShadow: 'inset 0 0 0 1.5px rgba(139,92,246,0.2)',
                }}
            />

            {/* Image */}
            <div className="relative h-44 overflow-hidden">
                {hotel.thumbnail ? (
                    <img
                        src={hotel.thumbnail}
                        alt={hotel.title}
                        className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-108"
                        style={{ transition: 'transform 0.6s ease' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                ) : (
                    <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.1))' }}
                    >
                        <span className="text-sm font-medium" style={{ color: '#94a3b8' }}>No image</span>
                    </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)' }} />

                {/* Badges */}
                <div className="absolute top-2.5 left-2.5 flex gap-1.5 flex-wrap z-10">
                    {isBestOfBest && (
                        <motion.span
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black text-white"
                            style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', boxShadow: '0 2px 8px rgba(245,158,11,0.4)' }}
                        >
                            <Award size={9} /> Best of Best
                        </motion.span>
                    )}
                    {isTravellersChoice && (
                        <motion.span
                            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.05 }}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black text-white"
                            style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 2px 8px rgba(16,185,129,0.4)' }}
                        >
                            <Star size={9} style={{ fill: '#fff' }} /> Travellers' Choice
                        </motion.span>
                    )}
                    {hotel.primaryInfo?.toLowerCase().includes('breakfast') && (
                        <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                            style={{ background: 'linear-gradient(135deg, #06B6D4, #0EA5E9)', boxShadow: '0 2px 8px rgba(14,165,233,0.3)' }}
                        >
                            🍳 Breakfast
                        </span>
                    )}
                </div>

                {/* Rating pill */}
                <div className="absolute bottom-2.5 right-2.5 z-10">
                    <div
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                        style={{
                            background: 'rgba(255,255,255,0.92)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.95)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                        }}
                    >
                        <RatingBubbles rating={hotel.rating} />
                        <span className="font-black text-xs" style={{ color: '#059669' }}>{hotel.rating}</span>
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="p-4 space-y-2.5">
                <div>
                    <h3
                        className="font-bold text-sm leading-tight line-clamp-1 transition-colors duration-200"
                        style={{ color: '#0f172a' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#7C3AED'}
                        onMouseLeave={e => e.currentTarget.style.color = '#0f172a'}
                    >
                        {hotel.title}
                    </h3>
                    {hotel.secondaryInfo && (
                        <div className="flex items-center gap-1 mt-1">
                            <MapPin size={11} style={{ color: '#94a3b8', flexShrink: 0 }} />
                            <span className="text-xs truncate" style={{ color: '#64748b' }}>
                                {hotel.secondaryInfo}
                            </span>
                        </div>
                    )}
                </div>

                {/* Reviews + Provider */}
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium" style={{ color: '#94a3b8' }}>
                        {hotel.reviewCount} reviews
                    </span>
                    {hotel.provider && (
                        <span
                            className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold"
                            style={{
                                background: 'rgba(139,92,246,0.08)',
                                color: '#7C3AED',
                                border: '1px solid rgba(139,92,246,0.18)',
                            }}
                        >
                            via {hotel.provider}
                        </span>
                    )}
                </div>

                {/* View Details Button */}
                <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="w-full py-2 rounded-xl text-xs font-bold text-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                    style={{
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(236,72,153,0.08))',
                        border: '1.5px solid rgba(139,92,246,0.25)',
                        color: '#7C3AED',
                    }}
                >
                    View Details →
                </motion.div>
            </div>
        </motion.div>
    );
};

export default HotelCard;