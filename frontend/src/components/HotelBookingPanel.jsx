import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    X,
    Hotel,
    Calendar,
    Users,
    MapPin,
    Search,
    Star,
    BedDouble,
    ChevronDown,
} from 'lucide-react';

const HotelBookingPanel = ({ onClose }) => {
    const [destination, setDestination] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(2);
    const [rooms, setRooms] = useState(1);
    const [starRating, setStarRating] = useState(0); // 0 = any
    const [sortBy, setSortBy] = useState('Popular');

    const popularDestinations = ['Dubai', 'Bali', 'Paris', 'Bangkok', 'Maldives', 'Singapore'];

    return (
        <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="h-full flex flex-col"
            style={{ width: '100%' }}
        >
            {/* Outer glow */}
            <div className="absolute -inset-px rounded-2xl md:rounded-3xl pointer-events-none"
                style={{
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.25) 0%, rgba(0,229,255,0.15) 100%)',
                    filter: 'blur(1px)',
                    zIndex: -1,
                }}
            />

            <div className="flex flex-col h-full glass-panel rounded-2xl md:rounded-3xl overflow-hidden relative">
                {/* Top shimmer line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet/40 to-transparent" />

                {/* Header */}
                <div className="p-4 md:p-5 border-b border-white/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-violet to-purple-400 rounded-xl blur-lg opacity-50" />
                                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-violet to-purple-400 flex items-center justify-center shadow-lg">
                                    <Hotel size={18} className="text-white" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-white font-semibold text-base">Hotel Booking</h3>
                                <p className="text-slate-400 text-xs flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-violet rounded-full animate-pulse" />
                                    Find perfect stays
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
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 scrollbar-hide">

                    {/* Destination */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Destination</label>
                        <div className="relative">
                            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-violet" />
                            <input
                                type="text"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                placeholder="City, region, or hotel name"
                                className="w-full glass-input rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Popular Destinations */}
                    <div className="flex flex-wrap gap-2">
                        {popularDestinations.map((d) => (
                            <button
                                key={d}
                                onClick={() => setDestination(d)}
                                className={`chip text-xs transition-all ${destination === d ? 'chip-active' : ''
                                    }`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>

                    {/* Check-in / Check-out */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stay Dates</label>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="relative">
                                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="date"
                                    value={checkIn}
                                    onChange={(e) => setCheckIn(e.target.value)}
                                    className="w-full glass-input rounded-xl pl-9 pr-3 py-3 text-sm text-white focus:outline-none appearance-none"
                                    style={{ colorScheme: 'dark' }}
                                />
                                {!checkIn && (
                                    <span className="absolute left-9 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">Check-in</span>
                                )}
                            </div>
                            <div className="relative">
                                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="date"
                                    value={checkOut}
                                    onChange={(e) => setCheckOut(e.target.value)}
                                    className="w-full glass-input rounded-xl pl-9 pr-3 py-3 text-sm text-white focus:outline-none appearance-none"
                                    style={{ colorScheme: 'dark' }}
                                />
                                {!checkOut && (
                                    <span className="absolute left-9 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">Check-out</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Guests & Rooms */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Guests</label>
                            <div className="glass-input rounded-xl flex items-center justify-between px-3 py-3">
                                <Users size={14} className="text-slate-400" />
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setGuests(Math.max(1, guests - 1))}
                                        className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center text-sm transition-colors"
                                    >−</button>
                                    <span className="text-white text-sm font-semibold w-4 text-center">{guests}</span>
                                    <button
                                        onClick={() => setGuests(Math.min(10, guests + 1))}
                                        className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center text-sm transition-colors"
                                    >+</button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rooms</label>
                            <div className="glass-input rounded-xl flex items-center justify-between px-3 py-3">
                                <BedDouble size={14} className="text-slate-400" />
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setRooms(Math.max(1, rooms - 1))}
                                        className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center text-sm transition-colors"
                                    >−</button>
                                    <span className="text-white text-sm font-semibold w-4 text-center">{rooms}</span>
                                    <button
                                        onClick={() => setRooms(Math.min(5, rooms + 1))}
                                        className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center text-sm transition-colors"
                                    >+</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Star Rating Filter */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Star Rating</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setStarRating(0)}
                                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${starRating === 0
                                        ? 'bg-gradient-to-r from-violet to-purple-400 text-white'
                                        : 'glass text-slate-400 hover:text-white'
                                    }`}
                            >
                                Any
                            </button>
                            {[3, 4, 5].map((stars) => (
                                <button
                                    key={stars}
                                    onClick={() => setStarRating(stars)}
                                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 ${starRating === stars
                                            ? 'bg-gradient-to-r from-gold/80 to-gold text-slate-900'
                                            : 'glass text-slate-400 hover:text-white'
                                        }`}
                                >
                                    <Star size={11} className={starRating === stars ? 'fill-current' : ''} />
                                    {stars}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sort By */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sort By</label>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full glass-input rounded-xl px-3 py-3 text-sm text-white focus:outline-none appearance-none cursor-pointer"
                                style={{ colorScheme: 'dark', background: 'transparent' }}
                            >
                                {['Popular', 'Price: Low to High', 'Price: High to Low', 'Star Rating', 'Guest Rating'].map(o => (
                                    <option key={o} value={o} style={{ background: '#0f172a' }}>{o}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Search Button */}
                <div className="p-4 md:p-5 border-t border-white/5">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full btn group relative overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7c3aed 100%)', color: 'white', boxShadow: '0 4px 20px rgba(139,92,246,0.3)' }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-teal/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Search size={16} className="relative z-10" />
                        <span className="relative z-10 font-semibold">Search Hotels</span>
                    </motion.button>
                    <p className="text-center text-[10px] text-slate-600 mt-2">
                        Best rates guaranteed. Free cancellation available.
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default HotelBookingPanel;
