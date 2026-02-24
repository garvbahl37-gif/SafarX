import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Clock,
    MapPin,
    Utensils,
    Camera,
    Star,
    DollarSign,
    Lightbulb,
    ChevronDown,
    ChevronUp,
    X,
    Download,
    Share2,
    Sparkles,
    Sun,
    Sunset,
    Moon,
    Coffee,
    Navigation
} from 'lucide-react';
import { useState } from 'react';

const Itinerary = ({ itinerary, onClose }) => {
    const [expandedDay, setExpandedDay] = useState(1);

    if (!itinerary) return null;

    const parseItinerary = (text) => {
        const days = [];
        const dayRegex = /Day\s*(\d+)/gi;
        const parts = text.split(dayRegex);

        for (let i = 1; i < parts.length; i += 2) {
            const dayNum = parts[i];
            const content = parts[i + 1] || '';
            days.push({
                day: parseInt(dayNum),
                content: content.trim()
            });
        }

        return days.length > 0 ? days : [{ day: 1, content: text }];
    };

    const days = parseItinerary(itinerary.itinerary || '');

    const dayIcons = [Sun, Coffee, Camera, Sunset, Moon];

    return (
        <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col overflow-hidden"
        >
            {/* Background with blur */}
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-950" />

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-coral/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet/10 rounded-full blur-3xl" />

            {/* Content Container */}
            <div className="relative z-10 flex flex-col h-full">

                {/* Header */}
                <div className="p-5 border-b border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", delay: 0.2 }}
                                className="relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-coral to-rose rounded-2xl blur-lg opacity-50" />
                                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-coral to-rose flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-white" />
                                </div>
                            </motion.div>
                            <div>
                                <motion.h2
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-white font-bold text-lg"
                                >
                                    {itinerary.destination}
                                </motion.h2>
                                <motion.p
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-slate-400 text-sm"
                                >
                                    {itinerary.days} Day Adventure
                                </motion.p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="p-2.5 rounded-xl glass hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </motion.button>
                    </div>

                    {/* Stats Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center gap-3"
                    >
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs">
                            <Clock size={12} className="text-teal" />
                            <span className="text-slate-300">{itinerary.days} Days</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs">
                            <MapPin size={12} className="text-coral" />
                            <span className="text-slate-300">{days.length} Stops</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-xs">
                            <Sparkles size={12} className="text-gold" />
                            <span className="text-gold font-medium">AI Curated</span>
                        </div>
                    </motion.div>
                </div>

                {/* Days List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                    {days.map((day, idx) => {
                        const IconComponent = dayIcons[idx % dayIcons.length];
                        const isExpanded = expandedDay === day.day;

                        return (
                            <motion.div
                                key={day.day}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * idx }}
                                className="relative"
                            >
                                {/* Timeline Connector */}
                                {idx < days.length - 1 && (
                                    <div className="absolute left-6 top-16 bottom-0 w-px bg-gradient-to-b from-white/20 to-transparent" />
                                )}

                                <div className={`glass rounded-2xl overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-1 ring-ocean/50 shadow-lg shadow-ocean/10' : ''
                                    }`}>
                                    {/* Day Header */}
                                    <button
                                        onClick={() => setExpandedDay(isExpanded ? null : day.day)}
                                        className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
                                    >
                                        {/* Day Number Badge */}
                                        <div className={`relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isExpanded
                                            ? 'bg-gradient-to-br from-ocean to-violet shadow-lg shadow-ocean/30'
                                            : 'bg-white/5 border border-white/10'
                                            }`}>
                                            <span className={`font-bold text-lg ${isExpanded ? 'text-white' : 'text-slate-300'}`}>
                                                {day.day}
                                            </span>
                                        </div>

                                        {/* Day Info */}
                                        <div className="flex-1 text-left">
                                            <h3 className="text-white font-semibold flex items-center gap-2">
                                                Day {day.day}
                                                <IconComponent size={14} className={isExpanded ? 'text-teal' : 'text-slate-500'} />
                                            </h3>
                                            <p className="text-slate-400 text-sm line-clamp-1">
                                                {day.content.substring(0, 60)}...
                                            </p>
                                        </div>

                                        {/* Expand Icon */}
                                        <motion.div
                                            animate={{ rotate: isExpanded ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                            className={`p-2 rounded-lg ${isExpanded ? 'bg-ocean/20 text-ocean' : 'text-slate-500'}`}
                                        >
                                            <ChevronDown size={18} />
                                        </motion.div>
                                    </button>

                                    {/* Expanded Content */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-4 pt-0 space-y-4">
                                                    {/* Divider */}
                                                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                                                    {/* Activity Content */}
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2 text-teal">
                                                            <Camera size={14} />
                                                            <span className="text-xs font-semibold uppercase tracking-wider">Activities</span>
                                                        </div>
                                                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                                            {day.content}
                                                        </p>
                                                    </div>

                                                    {/* Quick Action Tags */}
                                                    <div className="flex flex-wrap gap-2 pt-2">
                                                        <span className="chip text-xs">
                                                            <Utensils size={12} />
                                                            Food Spots
                                                        </span>
                                                        <span className="chip text-xs">
                                                            <Navigation size={12} />
                                                            Directions
                                                        </span>
                                                        <span className="chip text-xs">
                                                            <DollarSign size={12} />
                                                            ~$50-100
                                                        </span>
                                                        <span className="chip text-xs">
                                                            <Star size={12} className="text-gold" />
                                                            Must See
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* Pro Tips Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * days.length + 0.2 }}
                        className="relative overflow-hidden rounded-2xl"
                    >
                        {/* Gradient Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-violet/20 via-ocean/10 to-teal/20" />
                        <div className="absolute inset-0 glass" />

                        <div className="relative p-5">
                            <div className="flex items-center gap-2 text-gold mb-4">
                                <div className="p-2 rounded-lg bg-gold/10">
                                    <Lightbulb size={16} />
                                </div>
                                <span className="font-semibold">Pro Travel Tips</span>
                            </div>

                            <ul className="space-y-3">
                                {[
                                    "Book accommodations 2-3 weeks in advance",
                                    "Download offline maps for the area",
                                    "Try local street food for authentic experiences",
                                    "Keep digital copies of important documents"
                                ].map((tip, i) => (
                                    <motion.li
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + i * 0.1 }}
                                        className="flex items-start gap-3 text-sm text-slate-300"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-teal mt-2 flex-shrink-0" />
                                        {tip}
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-white/10 bg-slate-950/50 backdrop-blur-xl">
                    <div className="flex gap-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 btn btn-secondary"
                        >
                            <Download size={16} />
                            <span>Export PDF</span>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 btn btn-primary"
                        >
                            <Share2 size={16} />
                            <span>Share Trip</span>
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Itinerary;