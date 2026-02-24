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
            return 'from-ocean to-teal';
        }
        if (url.includes('hotel') || url.includes('booking') || url.includes('airbnb')) {
            return 'from-violet to-purple-400';
        }
        return 'from-emerald to-teal';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-[420px] z-50"
        >
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-ocean via-violet to-teal rounded-3xl opacity-30 blur-xl" />

            <div className="relative glass-strong rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                {/* Header */}
                <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", delay: 0.2 }}
                                className="relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald to-teal rounded-xl blur-lg opacity-50" />
                                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald to-teal flex items-center justify-center">
                                    <Search className="w-5 h-5 text-white" />
                                </div>
                            </motion.div>
                            <div>
                                <h2 className="text-white font-bold">Search Results</h2>
                                <p className="text-slate-400 text-xs">
                                    Found {results.results.length} options
                                </p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </motion.button>
                    </div>

                    {/* Search Query Chip */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-2 px-3 py-2 glass rounded-xl"
                    >
                        <TrendingUp className="w-4 h-4 text-teal" />
                        <span className="text-sm text-slate-300 truncate flex-1">
                            "{results.query}"
                        </span>
                        <span className="badge badge-primary">Live</span>
                    </motion.div>
                </div>

                {/* Results List */}
                <div className="max-h-80 overflow-y-auto p-3 space-y-2 scrollbar-hide">
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
                            className="block p-3 glass rounded-xl hover:bg-white/5 transition-all group cursor-pointer"
                        >
                            <div className="flex items-start gap-3">
                                {/* Icon */}
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getTypeColor(result.url)} bg-opacity-20 flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                                    {getIconForUrl(result.url)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <h3 className="text-white font-medium text-sm truncate group-hover:text-teal transition-colors">
                                            {result.title}
                                        </h3>
                                        <ArrowUpRight className="w-4 h-4 text-slate-500 flex-shrink-0 opacity-0 group-hover:opacity-100 group-hover:text-teal transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </div>

                                    <p className="text-slate-500 text-xs mb-2 flex items-center gap-1">
                                        <Globe size={10} />
                                        {getDomainFromUrl(result.url)}
                                    </p>

                                    <p className="text-slate-400 text-xs line-clamp-2">
                                        {result.content}
                                    </p>

                                    {/* Score & Tags */}
                                    <div className="flex items-center gap-2 mt-2">
                                        {result.score > 0 && (
                                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/10 border border-gold/20">
                                                <Star className="w-3 h-3 text-gold fill-current" />
                                                <span className="text-[10px] text-gold font-medium">
                                                    {(result.score * 100).toFixed(0)}% match
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald/10 border border-emerald/20">
                                            <Shield className="w-3 h-3 text-emerald" />
                                            <span className="text-[10px] text-emerald font-medium">Verified</span>
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
                        className="p-4 border-t border-white/10"
                    >
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br from-violet/10 to-ocean/10 border border-violet/20">
                            <div className="p-1.5 rounded-lg bg-violet/20">
                                <Sparkles size={14} className="text-violet" />
                            </div>
                            <div>
                                <p className="text-violet text-xs font-semibold uppercase tracking-wider mb-1">
                                    AI Summary
                                </p>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    {results.answer}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Footer */}
                <div className="p-3 border-t border-white/10 bg-slate-950/30">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onClose}
                        className="w-full btn btn-secondary text-sm"
                    >
                        <X size={14} />
                        Close Results
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default BookingResults;