
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, X, Share2, Navigation } from 'lucide-react';
import { useMeetups } from '../../hooks/social/useMeetups';
import RSVPButtons from './RSVPButtons';
import MemberCard from './MemberCard';

const MeetupDetail = ({ meetupId, onClose }) => {
  const { meetup, loading, updateRSVP } = useMeetups(meetupId);
  const [userRSVP, setUserRSVP] = useState(null);

  useEffect(() => {
    if (meetup) {
      const me = meetup.attendees.find(a => a.userId === 'user_current');
      setUserRSVP(me?.status || null);
    }
  }, [meetup]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!meetup) return null;

  const handleRSVP = async (status) => {
    await updateRSVP(meetupId, status);
    setUserRSVP(status);
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-2xl w-full mx-auto relative flex flex-col max-h-[90vh]">
         {/* Hero */}
         <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white relative flex-shrink-0">
             <button onClick={onClose} className="absolute top-4 right-4 bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors">
                 <X size={20} />
             </button>
             <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                 {meetup.meetupType}
             </span>
             <h2 className="text-3xl font-bold mb-2">{meetup.title}</h2>
             <p className="opacity-90 flex items-center gap-2 text-sm">Organized by <span className="font-bold underline">{meetup.createdBy.username}</span></p>
         </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
             {/* RSVP Section */}
             <div className="bg-white border rounded-2xl p-5 shadow-sm">
                 <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-gray-900">Are you going?</h3>
                     <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded-lg">
                         {meetup.maxAttendees - meetup.attendees.filter(a => a.status === 'going').length} spots left
                     </span>
                 </div>
                 <RSVPButtons currentStatus={userRSVP} onRSVP={handleRSVP} />
             </div>

             {/* Details Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-4">
                     <div className="flex items-start gap-4">
                         <div className="bg-blue-50 p-3 rounded-xl"><Calendar className="text-blue-600" /></div>
                         <div>
                             <p className="text-xs text-gray-500 font-bold uppercase">Date</p>
                             <p className="font-bold text-gray-900">{new Date(meetup.dateTime).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                         </div>
                     </div>
                     <div className="flex items-start gap-4">
                         <div className="bg-orange-50 p-3 rounded-xl"><Clock className="text-orange-600" /></div>
                         <div>
                             <p className="text-xs text-gray-500 font-bold uppercase">Time</p>
                             <p className="font-bold text-gray-900">{new Date(meetup.dateTime).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}</p>
                             <p className="text-sm text-gray-500">Duration: {meetup.duration} mins</p>
                         </div>
                     </div>
                 </div>

                 <div className="space-y-4">
                     <div className="flex items-start gap-4">
                         <div className="bg-red-50 p-3 rounded-xl"><MapPin className="text-red-600" /></div>
                         <div>
                             <p className="text-xs text-gray-500 font-bold uppercase">Location</p>
                             <p className="font-bold text-gray-900">{meetup.location.name}</p>
                             <p className="text-sm text-gray-500 leading-tight mb-2">{meetup.location.address}</p>
                             <button className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline">
                                 <Navigation size={12} /> Get Directions
                             </button>
                         </div>
                     </div>
                 </div>
             </div>

             {/* Description */}
             <div>
                 <h3 className="font-bold text-gray-900 mb-2">About this Meetup</h3>
                 <p className="text-gray-600 leading-relaxed text-sm">{meetup.description}</p>
             </div>

             {/* Attendees */}
             <div>
                 <h3 className="font-bold text-gray-900 mb-4 flex items-center justify-between">
                     Attendees 
                     <span className="text-sm text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-lg">{meetup.attendees.length} people</span>
                 </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {meetup.attendees.map(a => (
                         <MemberCard key={a.userId} member={a} compact />
                     ))}
                 </div>
             </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-gray-50 flex gap-3 flex-shrink-0">
            <button className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors flex items-center justify-center gap-2">
                <Share2 size={18} /> Share
            </button>
             <button onClick={onClose} className="flex-1 py-3 bg-white border border-gray-200 text-gray-900 font-bold hover:bg-gray-50 rounded-xl transition-colors">
                Close
            </button>
        </div>
    </div>
  );
};

export default MeetupDetail;
