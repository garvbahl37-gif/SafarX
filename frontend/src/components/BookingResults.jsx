import { motion, AnimatePresence } from 'framer-motion';
import {
    ExternalLink,
    Star,
    Globe,
    Plane,
    Hotel,
    X,
    Search,
    TrendingUp,
    Sparkles,
    ArrowUpRight,
    Tag,
    Shield
} from 'lucide-react';

const BookingResults = ({ results, onClose }) => {
    if (!results?.results?.length) return null;

    const getIconForUrl = (url) => {
        if (url.includes('flight') || url.includes('skyscanner') || url.includes('kayak')) {
            return <Plane className="w-4 h-4" />;
        }
        if (url.includes('hotel') || url.includes('booking') || url.includes('airbnb')) {
            return <Hotel className="w-4 h-4" />;
        }
        return <Globe className="w-4 h-4" />;
    };

    const getDomainFromUrl = (url) => {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return url;
        }
    };

    const getTypeColor = (url) => {
        if (url.includes('flight') || url.includes('skyscanner') || url.includes('kayak')) {
            return 'from-sky-500 to-teal-400';
        }
        if (url.includes('hotel') || url.includes('booking') || url.includes('airbnb')) {
            return 'from-violet-500 to-fuchsia-400';
        }
        return 'from-emerald-500 to-teal-400';
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="h-full flex flex-col" style={{ width: '100%' }}
        >
            <div className="flex flex-col h-full rounded-2xl md:rounded-3xl overflow-hidden relative"
                style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,249,255,0.97) 100%)',
                    border: '1.5px solid rgba(255,255,255,0.9)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(14,165,233,0.1)',
                }}>
                {/* Rainbow top line */}
                <div className="absolute top-0 left-0 right-0 h-1 z-10"
                    style={{ background: 'linear-gradient(90deg, #0EA5E9, #8B5CF6, #EC4899, #F97316, #10B981)' }} />

                {/* Decorative bg blob */}
                <div className="absolute top-0 right-0 w-56 h-56 pointer-events-none opacity-50"
                    style={{ background: 'radial-gradient(circle at 80% 20%, rgba(14,165,233,0.1) 0%, transparent 65%)' }} />
                <div className="absolute bottom-20 left-0 w-40 h-40 pointer-events-none opacity-40"
                    style={{ background: 'radial-gradient(circle at 20% 80%, rgba(139,92,246,0.1) 0%, transparent 65%)' }} />

                {/* Header */}
                <div className="relative p-4 md:p-5 border-b"
                    style={{ borderColor: 'rgba(14,165,233,0.1)', background: 'rgba(255,255,255,0.6)' }}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", delay: 0.2 }}
                                className="relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald to-teal rounded-xl blur-lg opacity-40" />
                                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-emerald to-teal flex items-center justify-center shadow-lg">
                                    <Search className="w-5 h-5 text-black" />
                                </div>
                            </motion.div>
                            <div>
                                <h2 className="font-bold text-base" style={{ color: '#0f172a' }}>Search Results</h2>
                                <p className="text-xs flex items-center gap-1.5" style={{ color: '#64748b' }}>
                                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#10B981' }} />
                                    Found {results.results.length} options
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
                            <X className="w-5 h-5" />
                        </motion.button>
                    </div>

                    {/* Search Query Chip */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-2 px-3 py-2 mt-4 rounded-xl"
                        style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.12)' }}
                    >
                        <TrendingUp className="w-4 h-4" style={{ color: '#0EA5E9' }} />
                        <span className="text-sm font-medium truncate flex-1" style={{ color: '#334155' }}>
                            "{results.query}"
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full"
                            style={{ background: 'rgba(16,185,129,0.15)', color: '#059669' }}>Live</span>
                    </motion.div>
                </div>

                {/* Results List */}
                <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-3 scrollbar-hide">
                    {results.results.map((result, idx) => (
                        <motion.a
                            key={idx}
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * idx }}
                            whileHover={{ scale: 1.02, x: 4 }}
                            className="block p-3 rounded-xl transition-all group cursor-pointer relative overflow-hidden"
                            style={{
                                background: 'rgba(255,255,255,0.7)',
                                border: '1.5px solid rgba(255,255,255,0.9)',
                                boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
                            }}
                        >
                            <motion.div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.05), rgba(139,92,246,0.05))' }}
                            />

                            <div className="flex items-start gap-3 relative z-10">
                                {/* Icon */}
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getTypeColor(result.url)} flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-md`}>
                                    {getIconForUrl(result.url)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <h3 className="font-bold text-sm truncate transition-colors" style={{ color: '#0f172a' }}>
                                            {result.title}
                                        </h3>
                                        <ArrowUpRight className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                            style={{ color: '#0EA5E9' }} />
                                    </div>

                                    <p className="text-xs mb-2 flex items-center gap-1 font-medium" style={{ color: '#64748b' }}>
                                        <Globe size={10} />
                                        {getDomainFromUrl(result.url)}
                                    </p>

                                    <p className="text-xs line-clamp-2" style={{ color: '#475569' }}>
                                        {result.content}
                                    </p>

                                    {/* Score & Tags */}
                                    <div className="flex items-center gap-2 mt-2.5">
                                        {result.score > 0 && (
                                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                                                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                                                <Star className="w-3 h-3 fill-current" style={{ color: '#D97706' }} />
                                                <span className="text-[10px] font-bold" style={{ color: '#B45309' }}>
                                                    {(result.score * 100).toFixed(0)}% match
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                                            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                                            <Shield className="w-3 h-3" style={{ color: '#059669' }} />
                                            <span className="text-[10px] font-bold" style={{ color: '#047857' }}>Verified</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.a>
                    ))}
                </div>

                {/* AI Summary */}
                {results.answer && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="p-4 border-t"
                        style={{ borderColor: 'rgba(139,92,246,0.1)', background: 'rgba(255,255,255,0.6)' }}
                    >
                        <div className="flex items-start gap-3 p-3.5 rounded-xl relative overflow-hidden"
                            style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)' }}>
                            <div className="absolute top-0 right-0 w-32 h-32 opacity-20 pointer-events-none"
                                style={{ background: 'radial-gradient(circle at top right, #8B5CF6, transparent 70%)' }} />

                            <div className="p-1.5 rounded-lg relative z-10" style={{ background: 'rgba(139,92,246,0.15)' }}>
                                <Sparkles size={14} style={{ color: '#7C3AED' }} />
                            </div>
                            <div className="relative z-10">
                                <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#7C3AED' }}>
                                    AI Summary
                                </p>
                                <p className="text-sm leading-relaxed" style={{ color: '#334155' }}>
                                    {results.answer}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Footer Minimal Close Action */}
                <div className="p-4 md:p-5 border-t"
                    style={{ borderColor: 'rgba(14,165,233,0.1)', background: 'rgba(255,255,255,0.6)' }}>
                    <motion.button
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onClose}
                        className="w-full relative overflow-hidden rounded-2xl py-3.5 flex items-center justify-center gap-2.5 font-semibold text-sm transition-all"
                        style={{
                            background: 'rgba(241,245,249,0.8)',
                            border: '1px solid rgba(226,232,240,0.8)',
                            color: '#475569',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                        }}
                    >
                        <X size={16} />
                        Close Results
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default BookingResults;