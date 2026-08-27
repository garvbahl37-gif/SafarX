
import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const GroupSearchFilters = ({ filters, onChange, onClose }) => {
    return (
        <div className="w-full flex flex-col gap-4 p-2 text-white">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-light tracking-widest uppercase text-white/50">Refine Search</h2>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors">
                    <X size={16} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Destination */}
                <div className="space-y-1">
                    <label className="text-[11px] font-medium text-white/40 uppercase tracking-wide">Destination</label>
                    <select
                        value={filters.destination}
                        onChange={(e) => onChange({ destination: e.target.value })}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500/50 outline-none transition-all font-light appearance-none"
                    >
                        <option value="" className="bg-gray-900 text-gray-500">Select City...</option>
                        {[
                            "Paris, France",
                            "London, UK",
                            "New York, USA",
                            "Tokyo, Japan",
                            "Barcelona, Spain",
                            "Bali, Indonesia",
                            "Rome, Italy",
                            "Berlin, Germany",
                            "Amsterdam, Netherlands",
                            "Dubai, UAE"
                        ].map(city => (
                            <option key={city} value={city} className="bg-gray-900 text-gray-300">
                                {city}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Dates */}
                <div className="space-y-1">
                    <label className="text-[11px] font-medium text-white/40 uppercase tracking-wide">Start Date</label>
                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => onChange({ startDate: e.target.value })}
                        onClick={(e) => e.target.showPicker && e.target.showPicker()}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500/50 outline-none transition-all font-light"
                    />
                </div>

                {/* Group Size */}
                <div className="space-y-1">
                    <label className="text-[11px] font-medium text-white/40 uppercase tracking-wide">Group Size</label>
                    <select
                        value={filters.groupSize}
                        onChange={(e) => onChange({ groupSize: e.target.value })}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500/50 outline-none transition-all font-light appearance-none"
                    >
                        <option value="any" className="bg-gray-900 text-gray-300">Any Size</option>
                        <option value="small" className="bg-gray-900 text-gray-300">Small (1-10)</option>
                        <option value="medium" className="bg-gray-900 text-gray-300">Medium (10-30)</option>
                        <option value="large" className="bg-gray-900 text-gray-300">Large (30+)</option>
                    </select>
                </div>

                {/* Verified Toggle */}
                <div className="flex items-end h-full pb-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters.verifiedOnly ? 'bg-cyan-500 border-cyan-500' : 'border-white/20 group-hover:border-white/40'}`}>
                            {filters.verifiedOnly && <X size={12} className="text-white" />}
                        </div>
                        <input
                            type="checkbox"
                            checked={filters.verifiedOnly}
                            onChange={(e) => onChange({ verifiedOnly: e.target.checked })}
                            className="hidden"
                        />
                        <span className="text-sm font-light text-white/80 group-hover:text-white transition-colors">Verified Only</span>
                    </label>
                </div>
            </div>

            {/* Interests */}
            <div className="space-y-1 pt-2">
                <label className="text-[11px] font-medium text-white/40 uppercase tracking-wide">Interests</label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                    {[
                        'Adventure', 'Art & Culture', 'Backpacking', 'Beach', 'Camping',
                        'Climbing', 'Cooking', 'Cycling', 'Dancing', 'Digital Nomads',
                        'Diving', 'Festivals', 'Food & Drink', 'Hiking', 'History',
                        'Kayaking', 'Language Exchange', 'Luxury', 'Meditation', 'Museums',
                        'Music', 'Nature', 'Nightlife', 'Photography', 'Rafting',
                        'Road Trips', 'Running', 'Sailing', 'Shopping', 'Skiing',
                        'Snorkeling', 'Solo Travel', 'Surfing', 'Trekking', 'Volunteer',
                        'Wellness', 'Wildlife', 'Wine Tasting', 'Yoga'
                    ].map(interest => (
                        <label key={interest} className={`cursor-pointer px-3 py-1 rounded-full border text-xs font-light transition-all ${filters.interests?.includes(interest)
                            ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-200'
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                            }`}>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={filters.interests?.includes(interest)}
                                onChange={(e) => {
                                    const newInterests = e.target.checked
                                        ? [...(filters.interests || []), interest]
                                        : (filters.interests || []).filter(i => i !== interest);
                                    onChange({ interests: newInterests });
                                }}
                            />
                            {interest}
                        </label>
                    ))}
                </div>
            </div>

            <div className="pt-4 mt-2 border-t border-white/5">
                <button
                    onClick={onClose}
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2 rounded-lg transition-all text-sm tracking-wide"
                >
                    Apply Filters
                </button>
            </div>
        </div>
    );
};

export default GroupSearchFilters;
