import React from 'react';
import { MapPin, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import SafetyRatingBadge from './SafetyRatingBadge';

const GroupAbout = ({ group }) => {
  // --- HELPER: Generate Deterministic Dummy Data based on Group ID ---
  const getHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const seed = getHash(group.groupId || group.name);

  // 1. Mock Members
  const userNames = ["Alice", "Bob", "Charlie", "Diana", "Evan", "Fiona", "George", "Hannah", "Ian", "Julia", "Kevin", "Liam", "Mia", "Noah", "Olivia", "Peter", "Quinn", "Rachel", "Sam", "Tina", "Ursula", "Victor", "Wendy", "Xander", "Yara", "Zack"];

  const generateDummyMembers = (count) => {
    return Array.from({ length: count }).map((_, i) => {
      const nameIndex = (seed + i) % userNames.length;
      const name = userNames[nameIndex];
      return {
        userId: `dummy_${group.groupId}_${i}`,
        username: name,
        avatar: `https://ui-avatars.com/api/?name=${name}+${userNames[(nameIndex + 1) % userNames.length]}&background=random&color=fff`
      };
    });
  };

  const membersPreview = (group.members && group.members.length > 0)
    ? group.members.slice(0, 12)
    : generateDummyMembers(12);

  // 2. Mock Organizers
  const organizers = (group.members && group.members.some(m => m.role === 'admin'))
    ? group.members.filter(m => m.role === 'admin')
    : [
      { userId: 'org1', avatar: `https://ui-avatars.com/api/?name=${group.name.substring(0, 2)}&background=0D8ABC&color=fff`, username: 'Group Admin' }
    ];

  // 3. Mock Events
  const eventTypes = ["Social Mixer", "Workshop", "Networking", "Coffee & Chat", "Guided Tour", "Dinner", "Outdoor Adventure", "Language Exchange"];

  const generateDummyEvents = (count) => {
    return Array.from({ length: count }).map((_, i) => {
      const typeIndex = (seed + i) % eventTypes.length;
      const dayOffset = (seed + i * 5) % 30; // Random day in next 30 days
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + dayOffset + 1);

      return {
        id: `evt_${group.groupId}_${i}`,
        title: `${eventTypes[typeIndex]} - ${group.name}`,
        date: eventDate,
        location: `${group.destination?.city} City Center`,
        image: (group.gallery && group.gallery.length > 0)
          ? group.gallery[i % group.gallery.length].url
          : "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
      };

    });
  };

  const upcomingEvents = (group.upcomingMeetups && group.upcomingMeetups.length > 0)
    ? group.upcomingMeetups
    : generateDummyEvents(2);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Left Column: Description & Details */}
      <div className="lg:col-span-2 space-y-8">
        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/50">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">About us</h2>
            {/* Sparkle Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L14.24 9.76L22 12L14.24 14.24L12 22L9.76 14.24L2 12L9.76 9.76L12 2Z" fill="#06b6d4" />
            </svg>
          </div>

          <div className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
            {group.description || (
              <>
                <p className="mb-3">Welcome to {group.name}! We are a community dedicated to connecting people in {group.destination?.city}.</p>
                <p>Join us to meet new friends, explore the city, and have a great time together. Everyone is welcome!</p>
              </>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Upcoming meetups <span className="text-gray-400 font-normal ml-1 text-sm bg-gray-100 px-2 py-0.5 rounded-full">{upcomingEvents.length}</span></h2>
            <button className="text-cyan-600 font-bold text-sm hover:text-cyan-700 transition-colors flex items-center gap-1 group">See all <span className="group-hover:translate-x-1 transition-transform">→</span></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {upcomingEvents.map((event, i) => {
              // Fix: Handle both 'date' (mock) and 'dateTime' (real) properties
              const dateString = event.date || event.dateTime;
              const dateObj = dateString ? new Date(dateString) : new Date(); // Fallback to now if invalid

              // Validate date object
              const isValidDate = !isNaN(dateObj.getTime());
              const safeDate = isValidDate ? dateObj : new Date();

              const month = safeDate.toLocaleString('default', { month: 'short' }).toUpperCase();
              const day = safeDate.getDate();
              const time = safeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              // Fix: Handle missing event image with group image or generic fallback
              const eventImage = event.image || group.image || "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260";

              return (
                <div key={i} className="group cursor-pointer bg-white border border-gray-100 rounded-2xl p-3 hover:shadow-xl hover:shadow-sky-100/50 transition-all duration-300">
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-3">
                    <img src={eventImage} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2 py-1 rounded-lg shadow-lg border border-white/20">
                      <span className="block text-[10px] font-extrabold text-center text-cyan-600 uppercase tracking-widest">{month}</span>
                      <span className="block text-lg font-black text-center text-gray-900 leading-none">{day < 10 ? `0${day}` : day}</span>
                    </div>
                  </div>
                  <div className="px-2 pb-1">
                    <h3 className="font-bold text-base text-gray-900 mb-1 group-hover:text-cyan-600 transition-colors line-clamp-1">{event.title}</h3>
                    <p className="text-xs text-sky-600 font-bold mb-1.5">{safeDate.toDateString()} • {time}</p>
                    <p className="text-xs text-gray-500 truncate flex items-center gap-1.5"><MapPin size={12} className="text-gray-400" /> {typeof event.location === 'object' ? event.location.name : event.location}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="bg-gradient-to-br from-cyan-50/50 to-sky-50/50 p-6 rounded-2xl border border-cyan-100/50 shadow-sm">
          <h3 className="text-lg font-bold mb-4 text-cyan-950 tracking-tight">What we're about</h3>
          <div className="flex flex-wrap gap-2.5">
            {([group.category, 'Community', 'Social', 'Events', 'Networking']).filter(Boolean).map((tag, i) => (
              <span key={i} className="px-4 py-1.5 bg-white text-cyan-700 rounded-full text-sm font-semibold hover:bg-cyan-50 transition-colors cursor-default border border-cyan-100 shadow-sm shadow-cyan-100/50">
                {tag}
              </span>
            ))}
          </div>
        </section>
      </div>

      {/* Right Sidebar */}
      <div className="space-y-6">

        {/* Organizers Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/50">
          <h3 className="font-bold text-gray-900 mb-4 text-base tracking-tight">Organizers</h3>
          <div className="space-y-4">
            {organizers.map((org, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={org.avatar || org.userAvatar}
                    alt={org.username}
                    className="w-12 h-12 rounded-full border-2 border-white shadow-md shadow-gray-200"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{org.username || 'Group Admin'}</p>
                  <p className="text-xs text-cyan-600 font-bold mt-0.5 tracking-wide uppercase">Group Owner</p>
                </div>
                <button className="ml-auto p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-full transition-colors flex-shrink-0">
                  <MessageCircle size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Member Preview Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-base tracking-tight">
              Members <span className="text-gray-500 font-normal text-sm ml-1 bg-gray-100 px-2 py-0.5 rounded-full">{group.memberCount}</span>
            </h3>
          </div>

          <div className="flex flex-wrap gap-3">
            {membersPreview.map((member, i) => (
              <motion.img
                whileHover={{ scale: 1.15, y: -2 }}
                key={i}
                src={member.avatar || member.userAvatar}
                alt="Member"
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm cursor-pointer object-cover hover:z-10 relative transition-shadow hover:shadow-md"
                title={member.username || `Member ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Location Card */}
        <div className="p-6 rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/50 bg-gradient-to-br from-gray-50 to-white">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-gradient-to-br from-red-50 to-red-100 text-red-500 rounded-xl shadow-sm border border-red-100">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base tracking-tight">Location</h3>
              <p className="text-gray-600 text-sm mt-1">{group.destination?.city}, {group.destination?.country}</p>
              <button
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(group.destination?.city + ', ' + group.destination?.country)}`, '_blank')}
                className="text-cyan-600 text-[11px] font-extrabold mt-3 hover:text-cyan-700 transition-colors uppercase tracking-widest flex items-center gap-1 group"
              >
                VIEW MAP <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Safety Score Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 text-base tracking-tight">Safety Score</h3>
            <div className="scale-110 origin-right"><SafetyRatingBadge score={(seed % 50) / 10 + 5} size="sm" /></div>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            Based on community reports and verified check-ins in this area.
          </p>
        </div>

      </div>
    </div>
  );
};

export default GroupAbout;
