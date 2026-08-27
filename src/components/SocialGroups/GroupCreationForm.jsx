
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Calendar, Lock, Globe } from 'lucide-react';

const GroupCreationForm = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        destination: '',
        startDate: '',
        endDate: '',
        maxMembers: '20',
        budget: 'Flexible',
        ageGroup: 'Any',
        rules: '',
        privacy: 'public'
    });

    const handleCreate = () => {
        if (onSubmit) {
            onSubmit(formData);
        } else {
            // Fallback if no handler
            if (onClose) onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="flex items-center justify-center px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-white to-sky-50/50 flex-none relative">
                    <div className="text-center w-full">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Start a Group</h2>
                        <p className="text-sm text-gray-500 font-medium mt-1">Create your community and invite travelers</p>
                    </div>
                    <button onClick={onClose} className="absolute right-6 p-2 hover:bg-sky-100 rounded-full text-gray-400 hover:text-sky-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-sky-200 scrollbar-track-transparent flex-1">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Basic Info & Location */}
                        <div className="space-y-6">
                            {/* Name */}
                            <div className="space-y-2">
                                <label className="text-xs font-extrabold text-sky-600 uppercase tracking-widest">Community Name *</label>
                                <input
                                    required
                                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none transition-all placeholder-gray-400 shadow-inner"
                                    placeholder="e.g. Paris Photography Walk"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    autoFocus
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-xs font-extrabold text-cyan-600 uppercase tracking-widest">Purpose & Description *</label>
                                <textarea
                                    required
                                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all placeholder-gray-400 resize-none h-32 shadow-inner leading-relaxed"
                                    placeholder="What is the main goal of this group? Who should join?"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Right Column: Logistics & Details */}
                        <div className="space-y-6">
                            {/* Destination */}
                            <div className="space-y-2">
                                <label className="text-xs font-extrabold text-sky-700 uppercase tracking-widest flex items-center gap-1.5">
                                    <MapPin size={14} className="text-sky-500" /> Target Destination
                                </label>
                                <input
                                    className="w-full bg-white border border-sky-100 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none transition-all shadow-sm"
                                    placeholder="City, Country"
                                    value={formData.destination}
                                    onChange={e => setFormData({ ...formData, destination: e.target.value })}
                                />
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-sky-50/30 border border-sky-100/50">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-extrabold text-cyan-700 uppercase tracking-widest flex items-center gap-1">
                                        <Calendar size={12} className="text-cyan-500" /> Start Date
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full bg-white border border-cyan-100 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-800 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all shadow-sm cursor-pointer"
                                        value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                        onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-extrabold text-cyan-700 uppercase tracking-widest flex items-center gap-1">
                                        <Calendar size={12} className="text-cyan-500 opacity-50" /> End Date
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full bg-white border border-cyan-100 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-800 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all shadow-sm cursor-pointer"
                                        value={formData.endDate}
                                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                        onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                    />
                                </div>
                            </div>

                            {/* Logistics Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Max Members</label>
                                    <select
                                        className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 focus:bg-white focus:border-sky-400 outline-none cursor-pointer"
                                        value={formData.maxMembers}
                                        onChange={e => setFormData({ ...formData, maxMembers: e.target.value })}
                                    >
                                        <option value="10">Intimate (10)</option>
                                        <option value="20">Small (20)</option>
                                        <option value="50">Medium (50)</option>
                                        <option value="Unlimited">Unlimited</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Expected Budget</label>
                                    <select
                                        className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 focus:bg-white focus:border-sky-400 outline-none cursor-pointer"
                                        value={formData.budget}
                                        onChange={e => setFormData({ ...formData, budget: e.target.value })}
                                    >
                                        <option value="Budget">Budget</option>
                                        <option value="Flexible">Flexible</option>
                                        <option value="Luxury">Luxury</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Full-Width Section */}
                    <div className="mt-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Group Rules / Requirements <span className="text-gray-400 normal-case font-normal">(Optional)</span></label>
                            <input
                                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:bg-white focus:border-cyan-400 outline-none transition-all placeholder-gray-400"
                                placeholder="e.g. Must be physically fit for advanced hiking"
                                value={formData.rules}
                                onChange={e => setFormData({ ...formData, rules: e.target.value })}
                            />
                        </div>

                        {/* Privacy Toggle & Submit Row */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-gray-100">
                            {/* Privacy Toggle */}
                            <div className="bg-gray-100 p-1.5 rounded-xl flex relative border border-gray-200/50 shadow-inner w-full sm:w-64 flex-none">
                                <div
                                    className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white shadow-md rounded-lg border border-gray-100 transition-all duration-300 ease-out"
                                    style={{ left: formData.privacy === 'public' ? '6px' : 'calc(50% + 0px)' }}
                                />
                                <button
                                    onClick={() => setFormData({ ...formData, privacy: 'public' })}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold relative z-10 transition-colors ${formData.privacy === 'public' ? 'text-cyan-700' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <Globe size={14} className={formData.privacy === 'public' ? 'text-cyan-500' : ''} /> Public
                                </button>
                                <button
                                    onClick={() => setFormData({ ...formData, privacy: 'private' })}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold relative z-10 transition-colors ${formData.privacy === 'private' ? 'text-sky-600' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <Lock size={14} className={formData.privacy === 'private' ? 'text-sky-500' : ''} /> Private
                                </button>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleCreate}
                                className="w-full sm:w-auto flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-sky-500/30 hover:shadow-cyan-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-sm flex items-center justify-center gap-2"
                            >
                                Create Group
                            </button>
                        </div>
                    </div>

                </div>
            </motion.div>
        </div>
    );
};

export default GroupCreationForm;
