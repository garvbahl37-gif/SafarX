
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="bg-ink-900 border border-white/[0.07] rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="flex items-center justify-center px-8 py-6 border-b border-white/[0.07] bg-ink-850 flex-none relative">
                    <div className="text-center w-full">
                        <h2 className="text-2xl font-display font-semibold text-ivory tracking-tight">Start a Group</h2>
                        <p className="text-sm text-ivory-muted font-medium mt-1">Create your community and invite travelers</p>
                    </div>
                    <button onClick={onClose} className="absolute right-6 p-2 hover:bg-white/[0.06] rounded-full text-ivory-faint hover:text-saffron transition-colors" aria-label="Close">
                        <X size={24} />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="p-8 overflow-y-auto flex-1">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Basic Info & Location */}
                        <div className="space-y-6">
                            {/* Name */}
                            <div className="space-y-2">
                                <label className="form-label">Community Name *</label>
                                <input
                                    required
                                    className="glass-input w-full text-sm font-semibold"
                                    placeholder="e.g. Jaipur Photography Walk"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    autoFocus
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="form-label">Purpose & Description *</label>
                                <textarea
                                    required
                                    className="glass-input w-full text-sm font-medium resize-none h-32 leading-relaxed"
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
                                <label className="form-label flex items-center gap-1.5">
                                    <MapPin size={14} className="text-saffron" /> Target Destination
                                </label>
                                <input
                                    className="glass-input w-full text-sm font-medium"
                                    placeholder="City, State"
                                    value={formData.destination}
                                    onChange={e => setFormData({ ...formData, destination: e.target.value })}
                                />
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-ink-800 border border-white/[0.07]">
                                <div className="space-y-2">
                                    <label className="form-label flex items-center gap-1">
                                        <Calendar size={12} className="text-saffron" /> Start Date
                                    </label>
                                    <input
                                        type="date"
                                        className="glass-input w-full text-xs font-bold cursor-pointer"
                                        value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                        onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="form-label flex items-center gap-1">
                                        <Calendar size={12} className="text-saffron opacity-50" /> End Date
                                    </label>
                                    <input
                                        type="date"
                                        className="glass-input w-full text-xs font-bold cursor-pointer"
                                        value={formData.endDate}
                                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                        onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                    />
                                </div>
                            </div>

                            {/* Logistics Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="form-label">Max Members</label>
                                    <select
                                        className="glass-input w-full text-sm font-semibold cursor-pointer"
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
                                    <label className="form-label">Expected Budget</label>
                                    <select
                                        className="glass-input w-full text-sm font-semibold cursor-pointer"
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
                            <label className="form-label">Group Rules / Requirements <span className="text-ivory-faint normal-case font-normal">(Optional)</span></label>
                            <input
                                className="glass-input w-full text-sm font-medium"
                                placeholder="e.g. Must be physically fit for advanced hiking"
                                value={formData.rules}
                                onChange={e => setFormData({ ...formData, rules: e.target.value })}
                            />
                        </div>

                        {/* Privacy Toggle & Submit Row */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-white/[0.07]">
                            {/* Privacy Toggle */}
                            <div className="bg-ink-800 p-1.5 rounded-xl flex relative border border-white/[0.07] w-full sm:w-64 flex-none">
                                <div
                                    className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-ink-700 shadow-md rounded-lg border border-saffron/20 transition-all duration-300 ease-out"
                                    style={{ left: formData.privacy === 'public' ? '6px' : 'calc(50% + 0px)' }}
                                />
                                <button
                                    onClick={() => setFormData({ ...formData, privacy: 'public' })}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold relative z-10 transition-colors ${formData.privacy === 'public' ? 'text-saffron' : 'text-ivory-faint hover:text-ivory-muted'}`}
                                >
                                    <Globe size={14} className={formData.privacy === 'public' ? 'text-saffron' : ''} /> Public
                                </button>
                                <button
                                    onClick={() => setFormData({ ...formData, privacy: 'private' })}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold relative z-10 transition-colors ${formData.privacy === 'private' ? 'text-saffron' : 'text-ivory-faint hover:text-ivory-muted'}`}
                                >
                                    <Lock size={14} className={formData.privacy === 'private' ? 'text-saffron' : ''} /> Private
                                </button>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleCreate}
                                className="btn-primary w-full sm:w-auto flex-1 justify-center text-sm"
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
