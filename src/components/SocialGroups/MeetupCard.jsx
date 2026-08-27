
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react';

const MeetupCard = ({ meetup, onClick }) => {
    const attendingCount = meetup.attendees.filter(a => a.status === 'going').length;

    return (
        <motion.div
            className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group flex gap-4 items-center dark:bg-[#121622] dark:border-white/5 dark:hover:border-cyan-500/30 dark:shadow-none"
            onClick={() => onClick(meetup.meetupId)}
            whileHover={{ scale: 1.01 }}
        >
            {/* Date Box / Image */}
            <div className="w-14 h-14 rounded-xl bg-blue-50/50 flex flex-col items-center justify-center text-blue-600 flex-shrink-0 border border-blue-100/50 backdrop-blur-sm dark:bg-cyan-500/10 dark:border-cyan-500/20 dark:text-cyan-400">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-500 dark:text-cyan-500">{new Date(meetup.dateTime).toLocaleDateString(undefined, { month: 'short' })}</span>
                <span className="text-lg font-bold leading-none text-blue-700 dark:text-cyan-400">{new Date(meetup.dateTime).getDate()}</span>
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate text-[15px] mb-1 tracking-tight group-hover:text-blue-600 transition-colors dark:text-white dark:group-hover:text-cyan-400">{meetup.title}</h4>

                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                        <Clock size={12} className="text-orange-500 dark:text-orange-400" />
                        <span>{new Date(meetup.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <MapPin size={12} className="text-gray-400 dark:text-gray-500" />
                        <span className="truncate max-w-[100px]">{meetup.location.name}</span>
                    </div>
                </div>
            </div>

            <div className="hidden sm:flex items-center -space-x-2 mr-2">
                {meetup.attendees.slice(0, 3).map((a, i) => (
                    <img key={i} src={a.userAvatar || `https://ui-avatars.com/api/?name=${a.username}`} className="w-6 h-6 rounded-full border border-white dark:border-[#121622]" />
                ))}
                {attendingCount > 3 && <span className="w-6 h-6 rounded-full bg-gray-100 border border-white flex items-center justify-center text-[10px] text-gray-500 font-bold dark:bg-white/10 dark:border-[#121622] dark:text-gray-300">+{attendingCount - 3}</span>}
            </div>

            <span className="p-2 text-gray-300 group-hover:text-blue-600 transition-colors dark:text-gray-600 dark:group-hover:text-cyan-400">
                <ArrowRight size={18} />
            </span>
        </motion.div>
    );
};

export default MeetupCard;
