import { motion } from 'framer-motion';
import { Star, MapPin, Award, Wifi } from 'lucide-react';

const RatingBubbles = ({ rating }) => {
    const filled = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full ${i <= filled
                        ? 'bg-green-400'
                        : i === filled + 1 && half
                            ? 'bg-green-400/50'
                            : 'bg-white/10'
                        }`}
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01, y: -2 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={() => onClick(hotel)}
            className="relative glass-panel rounded-2xl overflow-hidden cursor-pointer group"
            style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
            }}
        >
            {/* Image Section */}
            <div className="relative h-44 overflow-hidden">
                {hotel.thumbnail ? (
                    <img
                        src={hotel.thumbnail}
                        alt={hotel.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-violet/20 to-purple-900/30 flex items-center justify-center">
                        <span className="text-slate-500 text-sm">No image</span>
                    </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {/* Badges */}
                <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
                    {isBestOfBest && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' }}>
                            <Award size={9} /> Best of Best
                        </span>
                    )}
                    {isTravellersChoice && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{ background: 'rgba(34,197,94,0.85)', color: '#fff' }}>
                            <Star size={9} className="fill-white" />
                            Travellers' Choice
                        </span>
                    )}
                    {hotel.primaryInfo?.includes('breakfast') && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{ background: 'rgba(6,182,212,0.8)', color: '#fff' }}>
                            🍳 Breakfast included
                        </span>
                    )}
                </div>

                {/* Rating bubble bottom-right of image */}
                <div className="absolute bottom-2 right-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
                        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
                        <RatingBubbles rating={hotel.rating} />
                        <span className="text-white text-xs font-bold">{hotel.rating}</span>
                    </div>
                </div>
            </div>

            {/* Info Section */}
            <div className="p-3.5 space-y-2.5">
                <div>
                    <h3 className="text-white font-semibold text-sm leading-tight line-clamp-1 group-hover:text-violet-300 transition-colors">
                        {hotel.title}
                    </h3>
                    {hotel.secondaryInfo && (
                        <div className="flex items-center gap-1 mt-0.5">
                            <MapPin size={11} className="text-slate-500 flex-shrink-0" />
                            <span className="text-slate-400 text-xs truncate">{hotel.secondaryInfo}</span>
                        </div>
                    )}
                </div>

                {/* Reviews & Provider */}
                <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">
                        {hotel.reviewCount} reviews
                    </span>
                    {hotel.provider && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>
                            via {hotel.provider}
                        </span>
                    )}
                </div>

                {/* View Details Button */}
                <motion.div
                    className="w-full py-2 rounded-xl text-xs font-semibold text-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(124,58,237,0.3))',
                        border: '1px solid rgba(139,92,246,0.4)',
                        color: '#c4b5fd'
                    }}
                >
                    View Details →
                </motion.div>
            </div>
        </motion.div>
    );
};

export default HotelCard;