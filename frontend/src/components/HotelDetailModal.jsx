import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Star, MapPin, Wifi, Coffee, Car, ChevronLeft,
    ChevronRight, MessageSquare, Award, Loader, Phone
} from 'lucide-react';

const PhotoGallery = ({ photos }) => {
    const [current, setCurrent] = useState(0);

    if (!photos || photos.length === 0) return null;

    const buildUrl = (template) =>
        template?.replace('{width}', '800').replace('{height}', '500') || '';

    return (
        <div className="relative h-56 rounded-2xl overflow-hidden group">
            <img
                src={buildUrl(photos[current]?.urlTemplate)}
                alt="Hotel"
                className="w-full h-full object-cover transition-all duration-500"
                onError={(e) => { e.target.src = ''; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

            {/* Nav buttons */}
            {photos.length > 1 && (
                <>
                    <button
                        onClick={() => setCurrent((c) => (c - 1 + photos.length) % photos.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: 'rgba(0,0,0,0.6)' }}
                    >
                        <ChevronLeft size={16} className="text-white" />
                    </button>
                    <button
                        onClick={() => setCurrent((c) => (c + 1) % photos.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: 'rgba(0,0,0,0.6)' }}
                    >
                        <ChevronRight size={16} className="text-white" />
                    </button>
                </>
            )}

            {/* Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {photos.slice(0, 8).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-white w-3' : 'bg-white/40'
                            }`}
                    />
                ))}
            </div>

            {/* Photo count */}
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs text-white"
                style={{ background: 'rgba(0,0,0,0.6)' }}>
                {current + 1}/{Math.min(photos.length, 8)}
            </div>
        </div>
    );
};

const RatingBar = ({ label, percentage, count, color }) => (
    <div className="flex items-center gap-2">
        <span className="text-slate-400 text-xs w-16 flex-shrink-0">{label}</span>
        <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="h-full rounded-full"
                style={{ background: color }}
            />
        </div>
        <span className="text-slate-500 text-xs w-8 text-right">{count}</span>
    </div>
);

const HotelDetailModal = ({ hotel, loading, onClose, checkIn, checkOut }) => {
    const [activeTab, setActiveTab] = useState('overview');

    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
            >
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                            style={{ background: 'rgba(139,92,246,0.2)' }}>
                            <Loader size={28} className="text-violet animate-spin" />
                        </div>
                    </div>
                    <p className="text-slate-400 text-sm">Loading hotel details...</p>
                </div>
            </motion.div>
        );
    }

    if (!hotel) return null;

    const tabs = ['overview', 'amenities', 'reviews', 'location'];

    const ratingCounts = hotel.reviews?.ratingCounts || {};

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
                style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <motion.div
                    initial={{ opacity: 0, y: 60, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 60, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    className="relative w-full sm:max-w-lg max-h-[90vh] overflow-hidden rounded-t-3xl sm:rounded-3xl flex flex-col"
                    style={{
                        background: 'linear-gradient(145deg, rgba(15,23,42,0.98) 0%, rgba(23,15,42,0.98) 100%)',
                        border: '1px solid rgba(255,255,255,0.08)',
                    }}
                >
                    {/* Close Button */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 rounded-xl"
                        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
                    >
                        <X size={18} className="text-white" />
                    </motion.button>

                    {/* Scrollable Content */}
                    <div className="overflow-y-auto flex-1 scrollbar-hide">
                        {/* Photo Gallery */}
                        <div className="p-4 pb-0">
                            <PhotoGallery photos={hotel.photos} />
                        </div>

                        {/* Basic Info */}
                        <div className="p-4 space-y-3">
                            <div>
                                <h2 className="text-white font-bold text-xl leading-tight">{hotel.title}</h2>
                                {hotel.rankingDetails && (
                                    <p className="text-violet-400 text-xs mt-1 font-semibold"
                                        dangerouslySetInnerHTML={{ __html: hotel.rankingDetails }} />
                                )}
                            </div>

                            {/* Rating Overview */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                                    style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                                    <span className="text-green-400 font-bold text-lg">{hotel.rating}</span>
                                    <Star size={14} className="text-green-400 fill-current" />
                                </div>
                                <div>
                                    <p className="text-white text-sm font-semibold">
                                        {hotel.reviews?.count?.toLocaleString()} Reviews
                                    </p>
                                    {hotel.location?.address && (
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <MapPin size={11} className="text-slate-500" />
                                            <p className="text-slate-400 text-xs line-clamp-1">{hotel.location.address}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Price */}
                            {hotel.price?.displayPrice && (
                                <div className="p-3 rounded-xl flex items-center justify-between"
                                    style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                                    <div>
                                        <p className="text-slate-400 text-xs">Price per night</p>
                                        <p className="text-violet-300 font-bold text-lg">{hotel.price.displayPrice}</p>
                                    </div>
                                    {hotel.price.freeCancellation && (
                                        <span className="text-xs text-green-400 font-semibold">Free Cancellation</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Tabs */}
                        <div className="px-4">
                            <div className="flex gap-1 p-1 rounded-xl mb-4"
                                style={{ background: 'rgba(255,255,255,0.04)' }}>
                                {tabs.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${activeTab === tab
                                            ? 'text-white'
                                            : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                        style={activeTab === tab ? {
                                            background: 'linear-gradient(135deg, #8B5CF6, #7c3aed)'
                                        } : {}}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Tab: Overview */}
                            {activeTab === 'overview' && (
                                <div className="space-y-4 pb-6">
                                    {hotel.about?.title && (
                                        <div className="p-4 rounded-2xl"
                                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                            <p className="text-slate-300 text-sm leading-relaxed">{hotel.about.title}</p>
                                        </div>
                                    )}
                                    {hotel.about?.tags?.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {hotel.about.tags.map((tag) => (
                                                <span key={tag} className="px-3 py-1 rounded-full text-xs font-semibold"
                                                    style={{ background: 'rgba(139,92,246,0.15)', color: '#c4b5fd' }}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {/* Getting There */}
                                    {hotel.location?.gettingThere?.content?.length > 0 && (
                                        <div>
                                            <h4 className="text-white text-sm font-semibold mb-2">Getting There</h4>
                                            {hotel.location.gettingThere.content.map((info, i) => (
                                                <p key={i} className="text-slate-400 text-xs flex items-center gap-2">
                                                    <Car size={12} className="text-violet" /> {info}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tab: Amenities */}
                            {activeTab === 'amenities' && (
                                <div className="space-y-4 pb-6">
                                    {(hotel.amenitiesScreen || []).map((section) => (
                                        <div key={section.title}>
                                            <h4 className="text-white text-sm font-semibold mb-2">{section.title}</h4>
                                            <div className="grid grid-cols-2 gap-1.5">
                                                {section.content.map((item) => (
                                                    <div key={item} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400"
                                                        style={{ background: 'rgba(255,255,255,0.03)' }}>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-violet flex-shrink-0" />
                                                        {item}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Tab: Reviews */}
                            {activeTab === 'reviews' && (
                                <div className="space-y-4 pb-6">
                                    {/* Rating breakdown */}
                                    <div className="p-4 rounded-2xl space-y-2.5"
                                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-white font-bold text-2xl">{hotel.reviews?.ratingValue}</span>
                                            <span className="text-slate-400 text-xs">{hotel.reviews?.count?.toLocaleString()} reviews</span>
                                        </div>
                                        <RatingBar label="Excellent" percentage={ratingCounts.excellent?.percentage || 0}
                                            count={ratingCounts.excellent?.count || 0} color="#22c55e" />
                                        <RatingBar label="Very Good" percentage={ratingCounts.veryGood?.percentage || 0}
                                            count={ratingCounts.veryGood?.count || 0} color="#84cc16" />
                                        <RatingBar label="Average" percentage={ratingCounts.average?.percentage || 0}
                                            count={ratingCounts.average?.count || 0} color="#eab308" />
                                        <RatingBar label="Poor" percentage={ratingCounts.poor?.percentage || 0}
                                            count={ratingCounts.poor?.count || 0} color="#f97316" />
                                        <RatingBar label="Terrible" percentage={ratingCounts.terrible?.percentage || 0}
                                            count={ratingCounts.terrible?.count || 0} color="#ef4444" />
                                    </div>

                                    {/* Review Cards */}
                                    {(hotel.reviews?.content || []).map((review, i) => (
                                        <div key={i} className="p-4 rounded-2xl space-y-2"
                                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                            <div className="flex items-start justify-between gap-2">
                                                <h5 className="text-white text-sm font-semibold">{review.title}</h5>
                                                <span className="text-slate-500 text-[10px] flex-shrink-0">{review.publishedDate}</span>
                                            </div>
                                            <p className="text-slate-400 text-xs leading-relaxed line-clamp-4"
                                                dangerouslySetInnerHTML={{ __html: review.text?.replace(/<br\s*\/?>/gi, ' ') }} />
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full overflow-hidden bg-white/5">
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
                                                <span className="text-slate-500 text-[10px]">
                                                    {review.userProfile?.deprecatedContributionCount}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Tab: Location */}
                            {activeTab === 'location' && (
                                <div className="space-y-4 pb-6">
                                    {hotel.location?.address && (
                                        <div className="p-4 rounded-2xl"
                                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                            <div className="flex items-start gap-3">
                                                <MapPin size={16} className="text-violet flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-white text-sm font-semibold">Address</p>
                                                    <p className="text-slate-400 text-xs mt-0.5">{hotel.location.address}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Nearby Restaurants */}
                                    {hotel.restaurantsNearby?.content?.length > 0 && (
                                        <div>
                                            <h4 className="text-white text-sm font-semibold mb-2">Restaurants Nearby</h4>
                                            <div className="space-y-2">
                                                {hotel.restaurantsNearby.content.slice(0, 4).map((r, i) => (
                                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                                                        style={{ background: 'rgba(255,255,255,0.03)' }}>
                                                        {r.cardPhoto?.urlTemplate && (
                                                            <img
                                                                src={r.cardPhoto.urlTemplate.replace('{width}', '60').replace('{height}', '60')}
                                                                className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                                                                alt={r.title}
                                                            />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-white text-xs font-semibold truncate">{r.title}</p>
                                                            <p className="text-slate-500 text-[10px]">{r.primaryInfo}</p>
                                                        </div>
                                                        <span className="text-violet text-[10px] flex-shrink-0">{r.distance}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Nearby Attractions */}
                                    {hotel.attractionsNearby?.content?.length > 0 && (
                                        <div>
                                            <h4 className="text-white text-sm font-semibold mb-2">Attractions Nearby</h4>
                                            <div className="space-y-2">
                                                {hotel.attractionsNearby.content.slice(0, 4).map((a, i) => (
                                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                                                        style={{ background: 'rgba(255,255,255,0.03)' }}>
                                                        <div className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden bg-white/5">
                                                            {a.cardPhoto?.urlTemplate && (
                                                                <img
                                                                    src={a.cardPhoto.urlTemplate.replace('{width}', '60').replace('{height}', '60')}
                                                                    className="w-full h-full object-cover"
                                                                    alt={a.title}
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-white text-xs font-semibold truncate">{a.title}</p>
                                                            <p className="text-slate-500 text-[10px]">{a.primaryInfo}</p>
                                                        </div>
                                                        <span className="text-violet text-[10px] flex-shrink-0">{a.distance}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default HotelDetailModal;