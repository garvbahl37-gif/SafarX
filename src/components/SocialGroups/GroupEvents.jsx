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
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upcoming Meetups ({events.length})</h2>

                {!isPlanning && (
                    <button
                        onClick={() => setIsPlanning(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 text-sm dark:bg-cyan-500/20 dark:text-cyan-400 dark:hover:bg-cyan-500/30 dark:shadow-none"
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
                        className="bg-white border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-50 relative overflow-hidden dark:bg-[#121622] dark:border-white/5 dark:shadow-none"
                        onSubmit={handleCreate}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-blue-900 dark:text-white">Plan a new event</h3>
                            <button type="button" onClick={() => setIsPlanning(false)} className="p-1 hover:bg-blue-50 rounded-full text-gray-400 dark:hover:bg-white/10 dark:text-gray-500 dark:hover:text-gray-300">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="col-span-1 md:col-span-2 space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase dark:text-gray-400">Event Title</label>
                                <input
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:bg-white focus:border-blue-500 outline-none dark:bg-[#0B0E14] dark:border-white/10 dark:text-white dark:focus:border-cyan-500/50"
                                    placeholder="e.g. Sunset Hike"
                                    value={newEvent.title}
                                    onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase dark:text-gray-400">Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-gray-900 focus:bg-white focus:border-blue-500 outline-none dark:bg-[#0B0E14] dark:border-white/10 dark:text-white [color-scheme:dark] dark:focus:border-cyan-500/50"
                                    value={newEvent.date}
                                    onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase dark:text-gray-400">Location</label>
                                <input
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-gray-900 focus:bg-white focus:border-blue-500 outline-none dark:bg-[#0B0E14] dark:border-white/10 dark:text-white dark:focus:border-cyan-500/50"
                                    placeholder="e.g. Central Park"
                                    value={newEvent.location}
                                    onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:bg-cyan-500/20 dark:text-cyan-400 dark:hover:bg-cyan-500/30 dark:shadow-none">
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
                                className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 z-10 dark:bg-[#121622]/90 dark:text-red-400 dark:hover:bg-red-500/20"
                                title="Cancel Event"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300 dark:bg-white/5 dark:border-white/10">
                        <Calendar size={48} className="mx-auto text-gray-400 mb-4 dark:text-gray-500" />
                        <p className="text-gray-500 font-medium dark:text-gray-400">No event scheduled yet</p>
                        <button
                            onClick={() => setIsPlanning(true)}
                            className="mt-4 px-6 py-2 bg-white border border-gray-300 rounded-full text-sm font-bold text-gray-700 hover:bg-gray-50 dark:bg-transparent dark:border-white/20 dark:text-gray-300 dark:hover:bg-white/5"
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
