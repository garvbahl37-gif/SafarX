import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Star, MapPin, Car, ChevronLeft,
    ChevronRight, Award, Loader,
} from 'lucide-react';

/* ══════════════════════════════════════════════
   PHOTO GALLERY
══════════════════════════════════════════════ */
const PhotoGallery = ({ photos }) => {
    const [current, setCurrent] = useState(0);
    if (!photos || photos.length === 0) return null;

    const buildUrl = (template) =>
        template?.replace('{width}', '800').replace('{height}', '500') || '';

    return (
        <div className="relative h-56 rounded-2xl overflow-hidden group">
            <motion.img
                key={current}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                src={buildUrl(photos[current]?.urlTemplate)}
                alt="Hotel"
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = ''; }}
            />

            {/* Gradient overlay */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.05) 50%, transparent 100%)',
                }}
            />

            {/* Nav buttons */}
            {photos.length > 1 && (
                <>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setCurrent((c) => (c - 1 + photos.length) % photos.length)}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl
                                   opacity-0 group-hover:opacity-100 transition-all duration-300"
                        style={{
                            background: 'rgba(255,255,255,0.92)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        }}
                    >
                        <ChevronLeft size={16} style={{ color: '#374151' }} />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setCurrent((c) => (c + 1) % photos.length)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl
                                   opacity-0 group-hover:opacity-100 transition-all duration-300"
                        style={{
                            background: 'rgba(255,255,255,0.92)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        }}
                    >
                        <ChevronRight size={16} style={{ color: '#374151' }} />
                    </motion.button>
                </>
            )}

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {photos.slice(0, 8).map((_, i) => (
                    <motion.button
                        key={i}
                        onClick={() => setCurrent(i)}
                        animate={{
                            width: i === current ? 20 : 6,
                            background: i === current
                                ? 'linear-gradient(90deg, #8B5CF6, #EC4899)'
                                : 'rgba(255,255,255,0.55)',
                        }}
                        transition={{ duration: 0.25 }}
                        className="h-1.5 rounded-full"
                    />
                ))}
            </div>

            {/* Photo count badge */}
            <div
                className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-xl
                           text-xs font-bold text-white"
                style={{
                    background: 'rgba(0,0,0,0.52)',
                    backdropFilter: 'blur(6px)',
                }}
            >
                {current + 1} / {Math.min(photos.length, 8)}
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════
   RATING BAR
══════════════════════════════════════════════ */
const RatingBar = ({ label, percentage, count, color }) => (
    <div className="flex items-center gap-2.5">
        <span
            className="text-xs font-medium w-16 flex-shrink-0"
            style={{ color: '#64748b' }}
        >
            {label}
        </span>
        <div
            className="flex-1 h-2 rounded-full overflow-hidden"
            style={{ background: 'rgba(0,0,0,0.06)' }}
        >
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: color }}
            />
        </div>
        <span
            className="text-xs font-semibold w-8 text-right"
            style={{ color: '#94a3b8' }}
        >
            {count}
        </span>
    </div>
);

/* ══════════════════════════════════════════════
   NEARBY ITEM CARD (shared for restaurants & attractions)
══════════════════════════════════════════════ */
const NearbyCard = ({ item, index, accentColor }) => (
    <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.06 }}
        className="flex items-center gap-3 p-3 rounded-xl transition-colors"
        style={{
            background: 'rgba(255,255,255,0.75)',
            border: '1px solid rgba(139,92,246,0.08)',
        }}
    >
        {item.cardPhoto?.urlTemplate && (
            <img
                src={item.cardPhoto.urlTemplate
                    .replace('{width}', '60')
                    .replace('{height}', '60')}
                className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                alt={item.title}
            />
        )}
        <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: '#0f172a' }}>
                {item.title}
            </p>
            <p className="text-[10px] font-medium" style={{ color: '#94a3b8' }}>
                {item.primaryInfo}
            </p>
        </div>
        <span
            className="text-[10px] font-bold flex-shrink-0 px-2 py-0.5 rounded-lg"
            style={{
                background: `${accentColor}12`,
                color: accentColor,
                border: `1px solid ${accentColor}22`,
            }}
        >
            {item.distance}
        </span>
    </motion.div>
);

/* ══════════════════════════════════════════════
   MAIN MODAL
══════════════════════════════════════════════ */
const HotelDetailModal = ({ hotel, loading, onClose, checkIn, checkOut }) => {
    const [activeTab, setActiveTab] = useState('overview');

    /* ── Loading state ── */
    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center"
                style={{
                    background: 'rgba(255,255,255,0.82)',
                    backdropFilter: 'blur(14px)',
                }}
            >
                <div className="flex flex-col items-center gap-5">
                    {/* Animated icon */}
                    <div className="relative">
                        {/* Outer ring */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                            className="w-20 h-20 rounded-2xl"
                            style={{
                                background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.1))',
                                border: '2px solid transparent',
                                backgroundClip: 'padding-box',
                                boxShadow: '0 0 0 2px rgba(139,92,246,0.2), 0 8px 24px rgba(139,92,246,0.15)',
                            }}
                        />
                        {/* Spinner */}
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center"
                            animate={{ rotate: -360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        >
                            <Loader size={32} style={{ color: '#8B5CF6' }} />
                        </motion.div>
                    </div>

                    <div className="text-center">
                        <p className="font-bold text-base" style={{ color: '#0f172a' }}>
                            Loading Hotel Details
                        </p>
                        <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
                            Fetching the best information for you...
                        </p>
                    </div>

                    {/* Animated dots */}
                    <div className="flex gap-1.5">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
                                transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                                className="w-2 h-2 rounded-full"
                                style={{
                                    background: i === 0
                                        ? '#8B5CF6'
                                        : i === 1
                                            ? '#EC4899'
                                            : '#F97316',
                                }}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>
        );
    }

    if (!hotel) return null;

    const tabs = ['overview', 'amenities', 'reviews', 'location'];
    const ratingCounts = hotel.reviews?.ratingCounts || {};

    const tabIcons = {
        overview: '🏨',
        amenities: '✨',
        reviews: '⭐',
        location: '📍',
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
                style={{
                    background: 'rgba(15,23,42,0.45)',
                    backdropFilter: 'blur(14px)',
                }}
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <motion.div
                    initial={{ opacity: 0, y: 70, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 70, scale: 0.94 }}
                    transition={{ type: 'spring', damping: 26, stiffness: 260 }}
                    className="relative w-full sm:max-w-lg max-h-[90vh]
                               overflow-hidden rounded-t-3xl sm:rounded-3xl flex flex-col"
                    style={{
                        background: 'linear-gradient(160deg, rgba(255,255,255,0.99) 0%, rgba(250,245,255,0.99) 100%)',
                        border: '1.5px solid rgba(255,255,255,0.92)',
                        boxShadow:
                            '0 32px 80px rgba(0,0,0,0.14), 0 8px 24px rgba(139,92,246,0.1)',
                    }}
                >
                    {/* Rainbow top accent */}
                    <div
                        className="absolute top-0 left-0 right-0 h-1 z-20 rounded-t-3xl"
                        style={{
                            background:
                                'linear-gradient(90deg, #8B5CF6, #EC4899, #F97316, #F59E0B, #10B981)',
                        }}
                    />

                    {/* Close button */}
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        className="absolute top-4 right-4 z-30 p-2 rounded-xl transition-all"
                        style={{
                            background: 'rgba(255,255,255,0.95)',
                            border: '1px solid rgba(0,0,0,0.07)',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                        }}
                    >
                        <X size={18} style={{ color: '#374151' }} />
                    </motion.button>

                    {/* ── Scrollable body ── */}
                    <div className="overflow-y-auto flex-1 scrollbar-hide">

                        {/* Photo Gallery */}
                        <div className="p-4 pb-0">
                            <PhotoGallery photos={hotel.photos} />
                        </div>

                        {/* Basic Info */}
                        <div className="p-4 space-y-3.5">

                            {/* Title + ranking */}
                            <div>
                                <h2
                                    className="font-black text-xl leading-tight"
                                    style={{ color: '#0f172a' }}
                                >
                                    {hotel.title}
                                </h2>
                                {hotel.rankingDetails && (
                                    <p
                                        className="text-xs mt-1 font-semibold"
                                        style={{ color: '#7C3AED' }}
                                        dangerouslySetInnerHTML={{ __html: hotel.rankingDetails }}
                                    />
                                )}
                            </div>

                            {/* Rating row */}
                            <div className="flex items-center gap-3">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl"
                                    style={{
                                        background: 'rgba(16,185,129,0.08)',
                                        border: '1.5px solid rgba(16,185,129,0.22)',
                                    }}
                                >
                                    <span
                                        className="font-black text-lg leading-none"
                                        style={{ color: '#059669' }}
                                    >
                                        {hotel.rating}
                                    </span>
                                    <Star
                                        size={14}
                                        style={{ color: '#059669', fill: '#059669' }}
                                    />
                                </motion.div>

                                <div className="flex-1">
                                    <p className="font-bold text-sm" style={{ color: '#0f172a' }}>
                                        {hotel.reviews?.count?.toLocaleString()} Reviews
                                    </p>
                                    {hotel.location?.address && (
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <MapPin size={11} style={{ color: '#94a3b8' }} />
                                            <p
                                                className="text-xs line-clamp-1"
                                                style={{ color: '#64748b' }}
                                            >
                                                {hotel.location.address}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Price card */}
                            {hotel.price?.displayPrice && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.15 }}
                                    className="p-3.5 rounded-2xl flex items-center justify-between"
                                    style={{
                                        background:
                                            'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.05))',
                                        border: '1.5px solid rgba(139,92,246,0.18)',
                                    }}
                                >
                                    <div>
                                        <p
                                            className="text-[11px] font-semibold"
                                            style={{ color: '#94a3b8' }}
                                        >
                                            Price per night
                                        </p>
                                        <p
                                            className="font-black text-2xl mt-0.5 leading-none"
                                            style={{ color: '#7C3AED' }}
                                        >
                                            {hotel.price.displayPrice}
                                        </p>
                                    </div>

                                    {hotel.price.freeCancellation && (
                                        <span
                                            className="text-xs font-bold px-2.5 py-1.5 rounded-xl"
                                            style={{
                                                background: 'rgba(16,185,129,0.1)',
                                                color: '#059669',
                                                border: '1.5px solid rgba(16,185,129,0.22)',
                                            }}
                                        >
                                            ✓ Free Cancel
                                        </span>
                                    )}
                                </motion.div>
                            )}
                        </div>

                        {/* ── Tabs ── */}
                        <div className="px-4">
                            <div
                                className="flex gap-1 p-1 rounded-2xl mb-4"
                                style={{
                                    background: 'rgba(139,92,246,0.05)',
                                    border: '1px solid rgba(139,92,246,0.1)',
                                }}
                            >
                                {tabs.map((tab) => (
                                    <motion.button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex-1 py-2 rounded-xl text-[11px] font-bold
                                                   capitalize transition-all flex items-center
                                                   justify-center gap-1"
                                        style={
                                            activeTab === tab
                                                ? {
                                                    background:
                                                        'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                                                    color: '#fff',
                                                    boxShadow:
                                                        '0 4px 12px rgba(139,92,246,0.32)',
                                                }
                                                : { color: '#94a3b8' }
                                        }
                                    >
                                        <span>{tabIcons[tab]}</span>
                                        <span className="hidden sm:inline">{tab}</span>
                                    </motion.button>
                                ))}
                            </div>

                            {/* ── Tab Content ── */}
                            <AnimatePresence mode="wait">

                                {/* ─────────── OVERVIEW ─────────── */}
                                {activeTab === 'overview' && (
                                    <motion.div
                                        key="overview"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.22 }}
                                        className="space-y-4 pb-6"
                                    >
                                        {/* Description */}
                                        {hotel.about?.title && (
                                            <div
                                                className="p-4 rounded-2xl"
                                                style={{
                                                    background: 'rgba(255,255,255,0.75)',
                                                    border: '1.5px solid rgba(139,92,246,0.1)',
                                                }}
                                            >
                                                <p
                                                    className="text-sm leading-relaxed"
                                                    style={{ color: '#475569' }}
                                                >
                                                    {hotel.about.title}
                                                </p>
                                            </div>
                                        )}

                                        {/* Tags */}
                                        {hotel.about?.tags?.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {hotel.about.tags.map((tag, i) => (
                                                    <motion.span
                                                        key={tag}
                                                        initial={{ opacity: 0, scale: 0.85 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        className="px-3 py-1 rounded-full text-xs font-semibold"
                                                        style={{
                                                            background: 'rgba(139,92,246,0.08)',
                                                            color: '#7C3AED',
                                                            border: '1px solid rgba(139,92,246,0.18)',
                                                        }}
                                                    >
                                                        {tag}
                                                    </motion.span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Getting There */}
                                        {hotel.location?.gettingThere?.content?.length > 0 && (
                                            <div className="space-y-2">
                                                <h4
                                                    className="font-bold text-sm flex items-center gap-2"
                                                    style={{ color: '#0f172a' }}
                                                >
                                                    <span
                                                        className="w-6 h-6 rounded-lg flex items-center justify-center"
                                                        style={{ background: 'rgba(139,92,246,0.1)' }}
                                                    >
                                                        <Car size={13} style={{ color: '#8B5CF6' }} />
                                                    </span>
                                                    Getting There
                                                </h4>
                                                {hotel.location.gettingThere.content.map((info, i) => (
                                                    <motion.p
                                                        key={i}
                                                        initial={{ opacity: 0, x: -6 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.07 }}
                                                        className="text-xs font-medium flex items-start gap-2 pl-2"
                                                        style={{ color: '#64748b' }}
                                                    >
                                                        <span
                                                            className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                                                            style={{ background: '#8B5CF6' }}
                                                        />
                                                        {info}
                                                    </motion.p>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* ─────────── AMENITIES ─────────── */}
                                {activeTab === 'amenities' && (
                                    <motion.div
                                        key="amenities"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.22 }}
                                        className="space-y-4 pb-6"
                                    >
                                        {(hotel.amenitiesScreen || []).length === 0 && (
                                            <div
                                                className="flex flex-col items-center justify-center py-10 gap-3"
                                            >
                                                <span className="text-4xl">✨</span>
                                                <p
                                                    className="text-sm font-medium"
                                                    style={{ color: '#94a3b8' }}
                                                >
                                                    No amenity info available
                                                </p>
                                            </div>
                                        )}

                                        {(hotel.amenitiesScreen || []).map((section, sIdx) => (
                                            <motion.div
                                                key={section.title}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: sIdx * 0.07 }}
                                            >
                                                <h4
                                                    className="font-bold text-sm mb-2.5 flex items-center gap-2"
                                                    style={{ color: '#0f172a' }}
                                                >
                                                    <span
                                                        className="h-px flex-1"
                                                        style={{
                                                            background:
                                                                'linear-gradient(90deg, rgba(139,92,246,0.3), transparent)',
                                                        }}
                                                    />
                                                    {section.title}
                                                    <span
                                                        className="h-px flex-1"
                                                        style={{
                                                            background:
                                                                'linear-gradient(270deg, rgba(139,92,246,0.3), transparent)',
                                                        }}
                                                    />
                                                </h4>
                                                <div className="grid grid-cols-2 gap-1.5">
                                                    {section.content.map((item, iIdx) => (
                                                        <motion.div
                                                            key={item}
                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: sIdx * 0.07 + iIdx * 0.03 }}
                                                            className="flex items-center gap-2 px-3 py-2
                                                                       rounded-xl text-xs font-medium"
                                                            style={{
                                                                background: 'rgba(255,255,255,0.78)',
                                                                border: '1px solid rgba(139,92,246,0.1)',
                                                                color: '#475569',
                                                            }}
                                                        >
                                                            <div
                                                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                                                style={{
                                                                    background:
                                                                        'linear-gradient(135deg, #8B5CF6, #EC4899)',
                                                                }}
                                                            />
                                                            {item}
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}

                                {/* ─────────── REVIEWS ─────────── */}
                                {activeTab === 'reviews' && (
                                    <motion.div
                                        key="reviews"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.22 }}
                                        className="space-y-4 pb-6"
                                    >
                                        {/* Rating breakdown card */}
                                        <div
                                            className="p-4 rounded-2xl space-y-3"
                                            style={{
                                                background: 'rgba(255,255,255,0.75)',
                                                border: '1.5px solid rgba(139,92,246,0.1)',
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-baseline gap-2">
                                                    <span
                                                        className="font-black text-4xl leading-none"
                                                        style={{ color: '#059669' }}
                                                    >
                                                        {hotel.reviews?.ratingValue}
                                                    </span>
                                                    <Star
                                                        size={20}
                                                        style={{ color: '#059669', fill: '#059669' }}
                                                    />
                                                </div>
                                                <span
                                                    className="text-xs font-semibold px-2.5 py-1 rounded-xl"
                                                    style={{
                                                        background: 'rgba(16,185,129,0.08)',
                                                        color: '#059669',
                                                        border: '1px solid rgba(16,185,129,0.18)',
                                                    }}
                                                >
                                                    {hotel.reviews?.count?.toLocaleString()} reviews
                                                </span>
                                            </div>

                                            <RatingBar
                                                label="Excellent"
                                                percentage={ratingCounts.excellent?.percentage || 0}
                                                count={ratingCounts.excellent?.count || 0}
                                                color="linear-gradient(90deg, #10B981, #34D399)"
                                            />
                                            <RatingBar
                                                label="Very Good"
                                                percentage={ratingCounts.veryGood?.percentage || 0}
                                                count={ratingCounts.veryGood?.count || 0}
                                                color="linear-gradient(90deg, #84CC16, #A3E635)"
                                            />
                                            <RatingBar
                                                label="Average"
                                                percentage={ratingCounts.average?.percentage || 0}
                                                count={ratingCounts.average?.count || 0}
                                                color="linear-gradient(90deg, #F59E0B, #FCD34D)"
                                            />
                                            <RatingBar
                                                label="Poor"
                                                percentage={ratingCounts.poor?.percentage || 0}
                                                count={ratingCounts.poor?.count || 0}
                                                color="linear-gradient(90deg, #F97316, #FB923C)"
                                            />
                                            <RatingBar
                                                label="Terrible"
                                                percentage={ratingCounts.terrible?.percentage || 0}
                                                count={ratingCounts.terrible?.count || 0}
                                                color="linear-gradient(90deg, #EF4444, #F87171)"
                                            />
                                        </div>

                                        {/* Individual review cards */}
                                        {(hotel.reviews?.content || []).map((review, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.07 }}
                                                className="p-4 rounded-2xl space-y-2.5"
                                                style={{
                                                    background: 'rgba(255,255,255,0.75)',
                                                    border: '1.5px solid rgba(139,92,246,0.08)',
                                                }}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <h5
                                                        className="font-bold text-sm leading-tight"
                                                        style={{ color: '#0f172a' }}
                                                    >
                                                        {review.title}
                                                    </h5>
                                                    <span
                                                        className="text-[10px] font-medium flex-shrink-0 px-2 py-0.5 rounded-lg"
                                                        style={{
                                                            background: 'rgba(148,163,184,0.1)',
                                                            color: '#94a3b8',
                                                        }}
                                                    >
                                                        {review.publishedDate}
                                                    </span>
                                                </div>

                                                <p
                                                    className="text-xs leading-relaxed line-clamp-4"
                                                    style={{ color: '#475569' }}
                                                    dangerouslySetInnerHTML={{
                                                        __html: review.text?.replace(/<br\s*\/?>/gi, ' '),
                                                    }}
                                                />

                                                <div className="flex items-center gap-2 pt-1 border-t"
                                                    style={{ borderColor: 'rgba(139,92,246,0.07)' }}>
                                                    <div
                                                        className="w-7 h-7 rounded-full overflow-hidden"
                                                        style={{
                                                            background: 'rgba(139,92,246,0.08)',
                                                            border: '1.5px solid rgba(139,92,246,0.15)',
                                                        }}
                                                    >
                                                        {review.userProfile?.avatar?.urlTemplate && (
                                                            <img
                                                                src={review.userProfile.avatar.urlTemplate
                                                                    .replace('{width}', '48')
                                                                    .replace('{height}', '48')}
                                                                alt="avatar"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        )}
                                                    </div>
                                                    <span
                                                        className="text-[10px] font-medium"
                                                        style={{ color: '#94a3b8' }}
                                                    >
                                                        {review.userProfile?.deprecatedContributionCount}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        ))}

                                        {/* Empty state */}
                                        {(!hotel.reviews?.content || hotel.reviews.content.length === 0) && (
                                            <div className="flex flex-col items-center justify-center py-10 gap-3">
                                                <span className="text-4xl">⭐</span>
                                                <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>
                                                    No reviews yet
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* ─────────── LOCATION ─────────── */}
                                {activeTab === 'location' && (
                                    <motion.div
                                        key="location"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.22 }}
                                        className="space-y-4 pb-6"
                                    >
                                        {/* Address */}
                                        {hotel.location?.address && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.97 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="p-4 rounded-2xl"
                                                style={{
                                                    background: 'rgba(255,255,255,0.75)',
                                                    border: '1.5px solid rgba(139,92,246,0.1)',
                                                }}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                                        style={{
                                                            background:
                                                                'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(236,72,153,0.08))',
                                                            border: '1.5px solid rgba(139,92,246,0.18)',
                                                        }}
                                                    >
                                                        <MapPin size={18} style={{ color: '#8B5CF6' }} />
                                                    </div>
                                                    <div>
                                                        <p
                                                            className="font-bold text-sm"
                                                            style={{ color: '#0f172a' }}
                                                        >
                                                            Address
                                                        </p>
                                                        <p
                                                            className="text-xs mt-0.5 leading-relaxed"
                                                            style={{ color: '#64748b' }}
                                                        >
                                                            {hotel.location.address}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Restaurants Nearby */}
                                        {hotel.restaurantsNearby?.content?.length > 0 && (
                                            <div>
                                                <h4
                                                    className="font-bold text-sm mb-2.5 flex items-center gap-2"
                                                    style={{ color: '#0f172a' }}
                                                >
                                                    <span
                                                        className="w-7 h-7 rounded-xl flex items-center justify-center text-base"
                                                        style={{
                                                            background: 'rgba(249,115,22,0.1)',
                                                            border: '1px solid rgba(249,115,22,0.2)',
                                                        }}
                                                    >
                                                        🍽️
                                                    </span>
                                                    Restaurants Nearby
                                                </h4>
                                                <div className="space-y-2">
                                                    {hotel.restaurantsNearby.content
                                                        .slice(0, 4)
                                                        .map((r, i) => (
                                                            <NearbyCard
                                                                key={i}
                                                                item={r}
                                                                index={i}
                                                                accentColor="#F97316"
                                                            />
                                                        ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Attractions Nearby */}
                                        {hotel.attractionsNearby?.content?.length > 0 && (
                                            <div>
                                                <h4
                                                    className="font-bold text-sm mb-2.5 flex items-center gap-2"
                                                    style={{ color: '#0f172a' }}
                                                >
                                                    <span
                                                        className="w-7 h-7 rounded-xl flex items-center justify-center text-base"
                                                        style={{
                                                            background: 'rgba(14,165,233,0.1)',
                                                            border: '1px solid rgba(14,165,233,0.2)',
                                                        }}
                                                    >
                                                        🎡
                                                    </span>
                                                    Attractions Nearby
                                                </h4>
                                                <div className="space-y-2">
                                                    {hotel.attractionsNearby.content
                                                        .slice(0, 4)
                                                        .map((a, i) => (
                                                            <NearbyCard
                                                                key={i}
                                                                item={a}
                                                                index={i}
                                                                accentColor="#0EA5E9"
                                                            />
                                                        ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Empty state */}
                                        {!hotel.location?.address &&
                                            !hotel.restaurantsNearby?.content?.length &&
                                            !hotel.attractionsNearby?.content?.length && (
                                                <div className="flex flex-col items-center justify-center py-10 gap-3">
                                                    <span className="text-4xl">📍</span>
                                                    <p
                                                        className="text-sm font-medium"
                                                        style={{ color: '#94a3b8' }}
                                                    >
                                                        No location info available
                                                    </p>
                                                </div>
                                            )}
                                    </motion.div>
                                )}

                            </AnimatePresence>
                        </div>
                        {/* end px-4 */}
                    </div>
                    {/* end scrollable */}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default HotelDetailModal;