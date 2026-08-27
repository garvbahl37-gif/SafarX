import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, ArrowRight, Plus as MdGroupAdd, X, Trash2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// import { useGroupMeetups } from '../../hooks/social/useMeetups'; // Switching to local logic for specific request
import MeetupCard from './MeetupCard';
import MeetupDetail from './MeetupDetail';

const GroupEvents = ({ group }) => {
    // Scoped Mock Data
    const [events, setEvents] = useState([]);

    useEffect(() => {
        // Seed data based on group ID
        // Structure MUST match MeetupCard expectations
        const seedEvents = [
            {
                meetupId: 1,
                title: `${group.name} Monthly Meetup`,
                dateTime: '2026-03-15T10:00:00', // ISO string for MeetupCard
                duration: 120, // minutes
                location: { name: group.destination?.city || 'City Center' },
                attendees: [
                    { username: 'Alice', status: 'going' },
                    { username: 'Bob', status: 'going' },
                    { username: 'Charlie', status: 'interested' }
                ],
                image: group.image,
                description: 'Join us for our regular monthly gathering!'
            }
        ];
        setEvents(seedEvents);
    }, [group.groupId]);

    const [selectedMeetupId, setSelectedMeetupId] = useState(null);
    const [isPlanning, setIsPlanning] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', date: '', location: '' });

    const handleCreate = (e) => {
        e.preventDefault();
        if (!newEvent.title || !newEvent.date) return;

        const created = {
            meetupId: Date.now(),
            title: newEvent.title,
            dateTime: `${newEvent.date}T10:00:00`, // Default time
            duration: 60, // Default duration
            location: { name: newEvent.location || 'TBD' },
            attendees: [{ username: 'You', status: 'going' }],
            image: group.image, // improved fallback
            description: 'New community event'
        };

        setEvents([created, ...events]);
        setNewEvent({ title: '', date: '', location: '' });
        setIsPlanning(false);
    };

    const handleDelete = (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to cancel this event?')) {
            setEvents(events.filter(ev => ev.meetupId !== id));
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">

            {/* Meetup Detail Modal */}
            <AnimatePresence>
                {selectedMeetupId && (
                    <MeetupDetail
                        meetup={events.find(m => m.meetupId === selectedMeetupId)}
                        onClose={() => setSelectedMeetupId(null)}
                    />
                )}
            </AnimatePresence>

            <div className="flex items-center justify-between mb-0">
                <h2 className="text-xl font-display font-semibold text-ivory">Upcoming Meetups ({events.length})</h2>

                {!isPlanning && (
                    <button
                        onClick={() => setIsPlanning(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-saffron/15 text-saffron font-bold rounded-xl hover:bg-saffron/25 transition-colors text-sm border border-saffron/20"
                    >
                        <MdGroupAdd size={18} />
                        Plan Meetup
                    </button>
                )}
            </div>

            {/* Planning Form */}
            <AnimatePresence>
                {isPlanning && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-ink-800 border border-white/[0.07] rounded-2xl p-6 relative overflow-hidden"
                        onSubmit={handleCreate}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-ivory">Plan a new event</h3>
                            <button type="button" onClick={() => setIsPlanning(false)} className="p-1 hover:bg-white/10 rounded-full text-ivory-faint hover:text-ivory-muted" aria-label="Close form">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="col-span-1 md:col-span-2 space-y-1">
                                <label className="form-label">Event Title</label>
                                <input
                                    className="glass-input w-full font-bold"
                                    placeholder="e.g. Sunset Hike"
                                    value={newEvent.title}
                                    onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="form-label">Date</label>
                                <input
                                    type="date"
                                    className="glass-input w-full font-medium [color-scheme:dark]"
                                    value={newEvent.date}
                                    onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="form-label">Location</label>
                                <input
                                    className="glass-input w-full font-medium"
                                    placeholder="e.g. Central Park"
                                    value={newEvent.location}
                                    onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button className="btn-primary px-8 py-3">
                                Create Event
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="space-y-4">
                {events.length > 0 ? (
                    events.map(meetup => (
                        <div key={meetup.meetupId} className="relative group">
                            <MeetupCard
                                meetup={meetup}
                                onClick={() => setSelectedMeetupId(meetup.meetupId)}
                            />
                            {/* Delete Button (Owner Only - Mocked) */}
                            <button
                                onClick={(e) => handleDelete(e, meetup.meetupId)}
                                className="absolute top-4 right-4 p-2 bg-ink-900/90 backdrop-blur text-red-400 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20 z-10 border border-white/[0.07]"
                                title="Cancel Event"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white/[0.03] rounded-2xl border border-dashed border-white/10">
                        <Calendar size={48} className="mx-auto text-ivory-faint mb-4" />
                        <p className="text-ivory-muted font-medium">No event scheduled yet</p>
                        <button
                            onClick={() => setIsPlanning(true)}
                            className="mt-4 px-6 py-2 bg-transparent border border-white/20 rounded-full text-sm font-bold text-ivory-muted hover:bg-white/5 hover:border-saffron/35 transition-colors"
                        >
                            Suggest an Event
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
};

export default GroupEvents;
