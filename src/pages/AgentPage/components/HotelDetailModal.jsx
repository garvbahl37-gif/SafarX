import { useState, useRef, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
    X, Star, MapPin, Car, ChevronLeft, ChevronRight, Clock, Users,
    Hotel, Sparkle, MessageSquare, Compass, UtensilsCrossed, Landmark,
    BedDouble, ThumbsUp, ThumbsDown, Loader,
} from 'lucide-react';

const EASE = [0.22, 1, 0.36, 1];

/* ══════════════════════════════════════════════
   PHOTO GALLERY
   ══════════════════════════════════════════════ */
const PhotoGallery = ({ photos, title }) => {
    const [current, setCurrent] = useState(0);
    if (!photos || photos.length === 0) return null;

    const buildUrl = (template) =>
        template?.replace('{width}', '800').replace('{height}', '500') || '';

    return (
        <div className="relative h-56 rounded-2xl overflow-hidden group border border-white/[0.07]">
            <Motion.img
                key={current}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: EASE }}
                src={buildUrl(photos[current]?.urlTemplate)}
                alt={`${title || 'Property'} — photo ${current + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = ''; }}
            />

            {/* Ink scrim */}
            <div
                className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent"
                aria-hidden="true"
            />

            {photos.length > 1 && (
                <>
                    <button
                        onClick={() => setCurrent((c) => (c - 1 + photos.length) % photos.length)}
                        className="agent-icon-btn absolute left-2.5 top-1/2 -translate-y-1/2 p-2
                                   bg-ink-950/70 backdrop-blur-sm opacity-0 group-hover:opacity-100
                                   focus-visible:opacity-100 transition-opacity"
                        aria-label="Previous photo"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <button
                        onClick={() => setCurrent((c) => (c + 1) % photos.length)}
                        className="agent-icon-btn absolute right-2.5 top-1/2 -translate-y-1/2 p-2
                                   bg-ink-950/70 backdrop-blur-sm opacity-0 group-hover:opacity-100
                                   focus-visible:opacity-100 transition-opacity"
                        aria-label="Next photo"
                    >
                        <ChevronRight size={16} />
                    </button>
                </>
            )}

            {/* Waypoint indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                {photos.slice(0, 8).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        aria-label={`Go to photo ${i + 1}`}
                        aria-current={i === current}
                        className="h-1.5 rounded-full cursor-pointer transition-all"
                        style={{
                            width: i === current ? 20 : 6,
                            background: i === current ? '#D4A843' : 'rgba(242,239,230,0.35)',
                            boxShadow: i === current ? '0 0 8px rgba(212,168,67,0.6)' : 'none',
                        }}
                    />
                ))}
            </div>

            {/* Count */}
            <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full font-data text-[10px] tabular-nums
                             text-ivory bg-ink-950/70 border border-white/[0.1] backdrop-blur-sm">
                {current + 1} / {Math.min(photos.length, 8)}
            </span>
        </div>
    );
};

/* ══════════════════════════════════════════════
   RATING BAR
   ══════════════════════════════════════════════ */
const RatingBar = ({ label, percentage, count }) => (
    <div className="flex items-center gap-2.5">
        <span className="font-data text-[9.5px] uppercase tracking-[0.14em] w-16 shrink-0 text-ivory-faint">
            {label}
        </span>
        <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/[0.06]">
            <Motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-saffron-deep to-saffron-bright"
            />
        </div>
        <span className="font-data text-[10px] w-9 text-right tabular-nums text-ivory-muted">
            {count}
        </span>
    </div>
);

/* ══════════════════════════════════════════════
   NEARBY ITEM CARD
   ══════════════════════════════════════════════ */

const PartLoading = ({ label }) => (
    <div className="flex items-center justify-center gap-2.5 py-8" role="status">
        <Loader size={13} className="text-saffron animate-spin" aria-hidden="true" />
        <span className="font-data text-[10px] uppercase tracking-[0.16em] text-ivory-faint">{label}</span>
    </div>
);

/* ══════════════════════════════════════════════
   MAIN MODAL
   ══════════════════════════════════════════════ */
const TABS = [
    { id: 'overview', label: 'Overview', icon: Hotel },
    { id: 'rooms', label: 'Rooms', icon: BedDouble, part: 'rooms' },
    { id: 'amenities', label: 'Amenities', icon: Sparkle },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare, part: 'reviews' },
    { id: 'location', label: 'Location', icon: Compass, part: 'nearby' },
];

const HotelDetailModal = ({ hotel, loading, onLoadPart, onClose }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [pending, setPending] = useState(null);
    const asked = useRef(new Set());

    /* Each tab pays for its own data the first time it is opened, so a
       property nobody scrolls past costs a single upstream call. */
    const openTab = (tab) => {
        setActiveTab(tab.id);
        if (!tab.part || !hotel?.id || asked.current.has(tab.part)) return;
        asked.current.add(tab.part);
        setPending(tab.part);
        Promise.resolve(onLoadPart?.(hotel.id, tab.part)).finally(() => setPending(null));
    };

    useEffect(() => {
        // A different property means the parts already fetched no longer apply.
        asked.current = new Set();
        setActiveTab('overview');
    }, [hotel?.id]);

    /* ── Loading state ── */
    if (loading) {
        return (
            <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/85 backdrop-blur-md"
                role="status"
                aria-label="Loading property details"
            >
                <div className="flex flex-col items-center gap-6 px-6 text-center">
                    <div className="flex items-center gap-2" aria-hidden="true">
                        <span className="agent-waypoint" />
                        <span className="agent-waypoint" />
                        <span className="agent-waypoint" />
                    </div>
                    <div>
                        <p className="font-display text-xl text-ivory">Pulling the details</p>
                        <p className="font-data text-[10px] uppercase tracking-[0.2em] text-ivory-faint mt-2.5">
                            Photos · rates · reviews
                        </p>
                    </div>
                    <span className="agent-route-live block w-40" aria-hidden="true" />
                </div>
            </Motion.div>
        );
    }

    if (!hotel) return null;

    const ratingCounts = hotel.reviews?.ratingCounts || {};

    return (
        <AnimatePresence>
            <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4
                           bg-ink-950/80 backdrop-blur-md"
                onClick={(e) => e.target === e.currentTarget && onClose()}
                role="dialog"
                aria-modal="true"
                aria-label={hotel.title}
            >
                <Motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 60 }}
                    transition={{ type: 'spring', damping: 26, stiffness: 260 }}
                    className="agent-panel relative w-full sm:max-w-lg max-h-[90vh]
                               overflow-hidden rounded-t-3xl sm:rounded-3xl flex flex-col
                               shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
                >
                    {/* Gold filament */}
                    <div
                        className="absolute top-0 left-0 right-0 h-px z-20 bg-gradient-to-r from-transparent via-saffron/50 to-transparent"
                        aria-hidden="true"
                    />

                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="agent-icon-btn absolute top-4 right-4 z-30 p-2 bg-ink-950/70 backdrop-blur-sm"
                        aria-label="Close property details"
                    >
                        <X size={17} />
                    </button>

                    {/* ── Scrollable body ── */}
                    <div className="agent-scroll overflow-y-auto flex-1">

                        {/* Gallery */}
                        <div className="p-4 pb-0">
                            <PhotoGallery photos={hotel.photos} title={hotel.title} />
                        </div>

                        {/* Basic info */}
                        <div className="p-4 space-y-4">
                            <div>
                                <h2 className="font-display text-[22px] leading-tight text-ivory">
                                    {hotel.title}
                                </h2>
                            </div>

                            {/* Rating row */}
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-saffron/10 border border-saffron/25">
                                    <span className="font-data text-lg font-semibold leading-none text-saffron tabular-nums">
                                        {hotel.rating}
                                    </span>
                                    <Star size={13} className="text-saffron fill-current" aria-hidden="true" />
                                </span>

                                <div className="flex-1 min-w-0">
                                    <p className="font-data text-[10px] uppercase tracking-[0.16em] text-ivory-muted">
                                        {hotel.reviewCount?.toLocaleString()} reviews
                                    </p>
                                    {hotel.location?.address && (
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <MapPin size={11} className="text-ivory-faint shrink-0" aria-hidden="true" />
                                            <p className="text-[11.5px] agent-clamp-1 text-ivory-faint">
                                                {hotel.location.address}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Price */}
                            {hotel.price?.displayPrice && (
                                <div className="agent-card p-4 rounded-2xl flex items-center justify-between gap-3">
                                    <div>
                                        <p className="font-data text-[9.5px] uppercase tracking-[0.18em] text-ivory-faint">
                                            Per night
                                        </p>
                                        <p className="font-data text-2xl font-semibold mt-1.5 leading-none text-saffron">
                                            {hotel.price.displayPrice}
                                        </p>
                                    </div>

                                    {hotel.price.freeCancellation && (
                                        <span className="agent-tag agent-tag-jade px-3 py-1.5 text-[10px]">
                                            Free cancellation
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ── Tabs ── */}
                        <div className="px-4">
                            <div
                                className="flex gap-1 p-1 rounded-full mb-5 bg-white/[0.03] border border-white/[0.07]"
                                role="tablist"
                                aria-label="Property information"
                            >
                                {TABS.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => openTab(tab)}
                                        role="tab"
                                        aria-selected={activeTab === tab.id}
                                        aria-label={tab.label}
                                        className={`flex-1 py-2 rounded-full font-data text-[10px] uppercase tracking-[0.12em]
                                                    transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === tab.id
                                                ? 'bg-gradient-to-br from-saffron-bright to-saffron text-ink-950 font-semibold'
                                                : 'text-ivory-muted hover:text-ivory'
                                            }`}
                                    >
                                        <tab.icon size={11} aria-hidden="true" />
                                        <span className="hidden sm:inline">{tab.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* ── Tab content ── */}
                            <AnimatePresence mode="wait">

                                {/* ─────────── OVERVIEW ─────────── */}
                                {activeTab === 'overview' && (
                                    <Motion.div
                                        key="overview"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.22, ease: EASE }}
                                        role="tabpanel"
                                        className="space-y-4 pb-6"
                                    >
                                        {hotel.about?.title && (
                                            <div className="agent-card p-4 rounded-2xl">
                                                <p className="text-[13.5px] leading-relaxed text-ivory-muted">
                                                    {hotel.about.title}
                                                </p>
                                            </div>
                                        )}

                                        {hotel.about?.tags?.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {hotel.about.tags.map((tag, i) => (
                                                    <Motion.span
                                                        key={tag}
                                                        initial={{ opacity: 0, y: 6 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.04, duration: 0.25, ease: EASE }}
                                                        className="agent-tag px-3 py-1 text-[10px]"
                                                    >
                                                        {tag}
                                                    </Motion.span>
                                                ))}
                                            </div>
                                        )}

                                        {hotel.about?.description && (
                                            <div className="space-y-2.5">
                                                <h4 className="flex items-center gap-2 font-display text-[15px] text-ivory">
                                                    <Landmark size={14} className="text-saffron" aria-hidden="true" />
                                                    About this property
                                                </h4>
                                                <p className="text-[12.5px] leading-relaxed whitespace-pre-line text-ivory-muted">
                                                    {hotel.about.description}
                                                </p>
                                            </div>
                                        )}

                                        {(hotel.checkin || hotel.checkout) && (
                                            <div className="grid grid-cols-2 gap-2.5">
                                                {[
                                                    { label: 'Check-in', value: hotel.checkin },
                                                    { label: 'Check-out', value: hotel.checkout },
                                                ].filter((r) => r.value).map((r) => (
                                                    <div key={r.label} className="agent-card p-3.5 rounded-2xl">
                                                        <p className="flex items-center gap-1.5 font-data text-[9px] uppercase tracking-[0.16em] text-ivory-faint">
                                                            <Clock size={10} className="text-saffron" aria-hidden="true" />
                                                            {r.label}
                                                        </p>
                                                        <p className="font-data text-[14px] text-ivory mt-1.5 tabular-nums">{r.value}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                    </Motion.div>
                                )}

                                {/* ─────────── ROOMS ─────────── */}
                                {activeTab === 'rooms' && (
                                    <Motion.div
                                        key="rooms"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.22, ease: EASE }}
                                        role="tabpanel"
                                        className="space-y-3 pb-6"
                                    >
                                        {pending === 'rooms' && <PartLoading label="Checking what is free" />}

                                        {pending !== 'rooms' && (hotel.rooms || []).length === 0 && (
                                            <p className="text-[12.5px] text-ivory-faint py-6 text-center">
                                                No rooms are on offer for these dates.
                                            </p>
                                        )}

                                        {(hotel.rooms || []).map((room, i) => (
                                            <Motion.div
                                                key={room.id}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: Math.min(i * 0.05, 0.3), duration: 0.28, ease: EASE }}
                                                className="agent-card p-4 rounded-2xl space-y-2.5"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <h5 className="font-display text-[14.5px] leading-snug text-ivory">
                                                        {room.name}
                                                    </h5>
                                                    {room.pricePerNight && (
                                                        <span className="text-right shrink-0">
                                                            <span className="block font-data text-[15px] font-semibold text-saffron leading-none">
                                                                {room.pricePerNight}
                                                            </span>
                                                            <span className="block font-data text-[9px] uppercase tracking-[0.14em] text-ivory-faint mt-1">
                                                                per night
                                                            </span>
                                                        </span>
                                                    )}
                                                </div>

                                                {room.detail && (
                                                    <p className="text-[12px] leading-relaxed agent-clamp-2 text-ivory-muted">
                                                        {room.detail}
                                                    </p>
                                                )}

                                                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                                    {room.sleeps > 0 && (
                                                        <span className="agent-tag agent-tag-quiet px-2.5 py-1 text-[9.5px]">
                                                            <Users size={9} aria-hidden="true" />
                                                            Sleeps {room.sleeps}
                                                        </span>
                                                    )}
                                                    {room.beds.map((bed) => (
                                                        <span key={bed} className="agent-tag agent-tag-quiet px-2.5 py-1 text-[9.5px]">
                                                            <BedDouble size={9} aria-hidden="true" />
                                                            {bed}
                                                        </span>
                                                    ))}
                                                    {room.breakfast && (
                                                        <span className="agent-tag agent-tag-quiet px-2.5 py-1 text-[9.5px]">
                                                            <UtensilsCrossed size={9} aria-hidden="true" />
                                                            Breakfast
                                                        </span>
                                                    )}
                                                    {room.refundable && (
                                                        <span className="agent-tag agent-tag-jade px-2.5 py-1 text-[9.5px]">
                                                            Free cancellation
                                                        </span>
                                                    )}
                                                </div>
                                            </Motion.div>
                                        ))}
                                    </Motion.div>
                                )}

                                {/* ─────────── AMENITIES ─────────── */}
                                {activeTab === 'amenities' && (
                                    <Motion.div
                                        key="amenities"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.22, ease: EASE }}
                                        role="tabpanel"
                                        className="space-y-5 pb-6"
                                    >
                                        {(hotel.amenitiesScreen || []).length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-12 gap-3">
                                                <Sparkle size={24} className="text-ivory-faint" aria-hidden="true" />
                                                <p className="text-[13px] text-ivory-muted">
                                                    No amenity information available
                                                </p>
                                            </div>
                                        )}

                                        {(hotel.amenitiesScreen || []).map((section, sIdx) => (
                                            <Motion.div
                                                key={section.title}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: sIdx * 0.06, duration: 0.3, ease: EASE }}
                                            >
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className="eyebrow whitespace-nowrap">{section.title}</span>
                                                    <span className="route-line flex-1" aria-hidden="true" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-1.5">
                                                    {section.content.map((item, iIdx) => (
                                                        <Motion.span
                                                            key={item}
                                                            initial={{ opacity: 0, y: 6 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{
                                                                delay: sIdx * 0.06 + Math.min(iIdx * 0.02, 0.2),
                                                                duration: 0.25,
                                                                ease: EASE,
                                                            }}
                                                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px]
                                                                       bg-white/[0.03] border border-white/[0.07] text-ivory-muted"
                                                        >
                                                            <span className="route-dot shrink-0" aria-hidden="true" />
                                                            {item}
                                                        </Motion.span>
                                                    ))}
                                                </div>
                                            </Motion.div>
                                        ))}
                                    </Motion.div>
                                )}

                                {/* ─────────── REVIEWS ─────────── */}
                                {activeTab === 'reviews' && (
                                    <Motion.div
                                        key="reviews"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.22, ease: EASE }}
                                        role="tabpanel"
                                        className="space-y-4 pb-6"
                                    >
                                        {/* Rating breakdown */}
                                        <div className="agent-card p-4 rounded-2xl space-y-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="font-data text-4xl font-semibold leading-none text-saffron tabular-nums">
                                                        {hotel.score ?? hotel.rating}
                                                    </span>
                                                    <Star size={18} className="text-saffron fill-current" aria-hidden="true" />
                                                </div>
                                                <span className="agent-tag agent-tag-quiet px-2.5 py-1 text-[9.5px]">
                                                    {hotel.reviewCount?.toLocaleString()} reviews
                                                </span>
                                            </div>

                                            <RatingBar label="Excellent" percentage={ratingCounts.excellent?.percentage || 0} count={ratingCounts.excellent?.count || 0} />
                                            <RatingBar label="Very good" percentage={ratingCounts.veryGood?.percentage || 0} count={ratingCounts.veryGood?.count || 0} />
                                            <RatingBar label="Average" percentage={ratingCounts.average?.percentage || 0} count={ratingCounts.average?.count || 0} />
                                            <RatingBar label="Poor" percentage={ratingCounts.poor?.percentage || 0} count={ratingCounts.poor?.count || 0} />
                                            <RatingBar label="Terrible" percentage={ratingCounts.terrible?.percentage || 0} count={ratingCounts.terrible?.count || 0} />
                                        </div>

                                        {pending === 'reviews' && <PartLoading label="Reading the reviews" />}

                                        {/* Individual reviews — Booking collects praise and
                                            complaint separately, so they stay apart here. */}
                                        {(hotel.reviews?.content || []).map((review, i) => (
                                            <Motion.div
                                                key={`${review.author?.name}-${i}`}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: Math.min(i * 0.06, 0.4), duration: 0.3, ease: EASE }}
                                                className="agent-card p-4 rounded-2xl space-y-2.5"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <h5 className="font-display text-[14px] leading-snug text-ivory">
                                                        {review.title || 'A stay here'}
                                                    </h5>
                                                    {review.score != null && (
                                                        <span className="font-data text-[11px] font-semibold text-saffron tabular-nums shrink-0">
                                                            {review.score}
                                                        </span>
                                                    )}
                                                </div>

                                                {review.pros && (
                                                    <p className="text-[12.5px] leading-relaxed flex items-start gap-2 text-ivory-muted">
                                                        <ThumbsUp size={11} className="text-horizon mt-0.5 shrink-0" aria-hidden="true" />
                                                        {review.pros}
                                                    </p>
                                                )}
                                                {review.cons && (
                                                    <p className="text-[12.5px] leading-relaxed flex items-start gap-2 text-ivory-muted">
                                                        <ThumbsDown size={11} className="text-ivory-faint mt-0.5 shrink-0" aria-hidden="true" />
                                                        {review.cons}
                                                    </p>
                                                )}

                                                <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-white/[0.07]">
                                                    <span className="font-data text-[9.5px] uppercase tracking-[0.14em] text-ivory-faint">
                                                        {review.author?.name}
                                                        {review.author?.type ? ` · ${review.author.type}` : ''}
                                                    </span>
                                                    <span className="font-data text-[9.5px] uppercase tracking-[0.14em] text-ivory-faint shrink-0">
                                                        {review.publishedDate}
                                                    </span>
                                                </div>
                                            </Motion.div>
                                        ))}
                                    </Motion.div>
                                )}

                                {/* ─────────── LOCATION ─────────── */}
                                {activeTab === 'location' && (
                                    <Motion.div
                                        key="location"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.22, ease: EASE }}
                                        role="tabpanel"
                                        className="space-y-5 pb-6"
                                    >
                                        {hotel.location?.address && (
                                            <div className="agent-card p-4 rounded-2xl">
                                                <div className="flex items-start gap-3">
                                                    <span
                                                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-saffron/10 border border-saffron/25"
                                                        aria-hidden="true"
                                                    >
                                                        <MapPin size={17} className="text-saffron" />
                                                    </span>
                                                    <div>
                                                        <p className="eyebrow-muted">Address</p>
                                                        <p className="text-[12.5px] mt-1.5 leading-relaxed text-ivory-muted">
                                                            {hotel.location.address}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {pending === 'nearby' && <PartLoading label="Looking around" />}

                                        {(hotel.landmarks || []).length > 0 && (
                                            <div>
                                                <h4 className="flex items-center gap-2 font-display text-[15px] text-ivory mb-3">
                                                    <Landmark size={14} className="text-saffron" aria-hidden="true" />
                                                    What is close by
                                                </h4>
                                                <div className="space-y-2">
                                                    {hotel.landmarks.map((place, i) => (
                                                        <Motion.div
                                                            key={place.name}
                                                            initial={{ opacity: 0, x: -6 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: Math.min(i * 0.05, 0.35), duration: 0.28, ease: EASE }}
                                                            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                                                        >
                                                            <span className="route-dot shrink-0" aria-hidden="true" />
                                                            <span className="flex-1 min-w-0 text-[12.5px] truncate text-ivory">
                                                                {place.name}
                                                            </span>
                                                            {place.score != null && (
                                                                <span className="font-data text-[10px] tabular-nums text-saffron/70 shrink-0">
                                                                    {place.score}
                                                                </span>
                                                            )}
                                                            {place.km != null && (
                                                                <span className="font-data text-[10px] uppercase tracking-[0.12em] text-ivory-faint shrink-0 tabular-nums">
                                                                    {place.km} km
                                                                </span>
                                                            )}
                                                        </Motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {pending !== 'nearby' && (hotel.landmarks || []).length === 0 && (
                                            <p className="text-[12.5px] text-ivory-faint py-4 text-center">
                                                Nothing catalogued around this address yet.
                                            </p>
                                        )}

                                    </Motion.div>
                                )}

                            </AnimatePresence>
                        </div>
                    </div>
                </Motion.div>
            </Motion.div>
        </AnimatePresence>
    );
};

export default HotelDetailModal;
