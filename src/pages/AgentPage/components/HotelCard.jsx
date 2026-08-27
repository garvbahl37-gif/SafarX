import { motion as Motion } from 'framer-motion';
import { Star, MapPin, Award, Coffee, ArrowRight } from 'lucide-react';

const EASE = [0.22, 1, 0.36, 1];

/* Five gold waypoints — the rating read as a route, not as stars */
const RatingDots = ({ rating }) => {
    const filled = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return (
        <div className="flex items-center gap-0.5" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((i) => (
                <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                        background:
                            i <= filled
                                ? '#D4A843'
                                : i === filled + 1 && half
                                    ? 'rgba(212,168,67,0.45)'
                                    : 'rgba(242,239,230,0.16)',
                        boxShadow: i <= filled ? '0 0 6px rgba(212,168,67,0.5)' : 'none',
                    }}
                />
            ))}
        </div>
    );
};

const HotelCard = ({ hotel, onClick }) => {
    const isTravellersChoice = hotel.badge?.type === 'TRAVELLER_CHOICE';
    const isBestOfBest = hotel.badge?.type === 'BEST_OF_BEST';
    const hasBreakfast = hotel.primaryInfo?.toLowerCase().includes('breakfast');

    return (
        <Motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3, ease: EASE }}
            onClick={() => onClick(hotel)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick(hotel);
                }
            }}
            role="button"
            tabIndex={0}
            aria-label={`View details for ${hotel.title}`}
            className="agent-card relative rounded-2xl overflow-hidden cursor-pointer group"
        >
            {/* ── Image with ink scrim ── */}
            <div className="relative h-44 overflow-hidden">
                {hotel.thumbnail ? (
                    <img
                        src={hotel.thumbnail}
                        alt={hotel.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-ink-900">
                        <span className="font-data text-[10px] uppercase tracking-[0.2em] text-ivory-faint">
                            No image
                        </span>
                    </div>
                )}

                {/* Ink scrim */}
                <div
                    className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/25 to-transparent"
                    aria-hidden="true"
                />

                {/* Badges */}
                <div className="absolute top-2.5 left-2.5 flex gap-1.5 flex-wrap z-10">
                    {isBestOfBest && (
                        <span className="agent-tag agent-tag-gold px-2 py-0.5 text-[9px] backdrop-blur-sm">
                            <Award size={9} aria-hidden="true" /> Best of best
                        </span>
                    )}
                    {isTravellersChoice && (
                        <span className="agent-tag agent-tag-gold px-2 py-0.5 text-[9px] backdrop-blur-sm">
                            <Star size={9} className="fill-current" aria-hidden="true" /> Travellers' choice
                        </span>
                    )}
                    {hasBreakfast && (
                        <span className="agent-tag agent-tag-jade px-2 py-0.5 text-[9px] backdrop-blur-sm">
                            <Coffee size={9} aria-hidden="true" /> Breakfast
                        </span>
                    )}
                </div>

                {/* Rating */}
                {hotel.rating != null && (
                    <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-ink-950/70 border border-white/[0.1] backdrop-blur-sm">
                        <RatingDots rating={hotel.rating} />
                        <span className="font-data text-[11px] font-semibold text-saffron tabular-nums">
                            {hotel.rating}
                        </span>
                    </div>
                )}
            </div>

            {/* ── Info ── */}
            <div className="p-4 space-y-3">
                <div>
                    <h3 className="font-display text-[15px] leading-snug text-ivory agent-clamp-1 group-hover:text-saffron-bright transition-colors">
                        {hotel.title}
                    </h3>
                    {hotel.secondaryInfo && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                            <MapPin size={11} className="text-ivory-faint shrink-0" aria-hidden="true" />
                            <span className="text-[11.5px] truncate text-ivory-muted">
                                {hotel.secondaryInfo}
                            </span>
                        </div>
                    )}
                </div>

                {/* Price + reviews */}
                <div className="flex items-end justify-between gap-2 pt-3 border-t border-white/[0.07]">
                    <div>
                        {hotel.price?.displayPrice ? (
                            <>
                                <p className="font-data text-[9px] uppercase tracking-[0.16em] text-ivory-faint">
                                    Per night
                                </p>
                                <p className="font-data text-base font-semibold text-saffron leading-none mt-1">
                                    {hotel.price.displayPrice}
                                </p>
                            </>
                        ) : (
                            <p className="font-data text-[9.5px] uppercase tracking-[0.16em] text-ivory-faint">
                                Rate on request
                            </p>
                        )}
                    </div>

                    <span className="font-data text-[9.5px] uppercase tracking-[0.14em] text-ivory-faint">
                        {hotel.reviewCount} reviews
                    </span>
                </div>

                {/* Reveal-on-hover CTA */}
                <span className="flex items-center gap-1.5 font-data text-[10px] uppercase tracking-[0.18em] text-saffron opacity-0 group-hover:opacity-100 transition-opacity">
                    View details <ArrowRight size={11} aria-hidden="true" />
                </span>
            </div>
        </Motion.div>
    );
};

export default HotelCard;
