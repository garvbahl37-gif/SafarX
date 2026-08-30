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
  /* Real members or none. This used to invent twelve travellers called Alice,
     Bob and Charlie, and an organiser named after a stock portrait — people
     who do not exist, presented as the group you were about to join. */
  const membersPreview = (group.members || []).slice(0, 12);
  const organizers = (group.members || []).filter((m) => m.role === 'organiser' || m.role === 'admin');

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
        <section className="bg-ink-800 p-6 rounded-2xl border border-white/[0.07]">
          <div className="flex items-center gap-2 mb-4 border-b border-white/[0.07] pb-3">
            <h2 className="text-xl font-display font-semibold text-ivory tracking-tight">About us</h2>
            {/* Sparkle Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L14.24 9.76L22 12L14.24 14.24L12 22L9.76 14.24L2 12L9.76 9.76L12 2Z" fill="#D4A843" />
            </svg>
          </div>

          <div className="text-sm leading-relaxed text-ivory-muted whitespace-pre-wrap">
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
            <h2 className="text-xl font-display font-semibold text-ivory tracking-tight">Upcoming meetups <span className="text-ivory-faint font-normal ml-1 text-sm bg-white/[0.06] px-2 py-0.5 rounded-full">{upcomingEvents.length}</span></h2>
            <button className="text-saffron font-bold text-sm hover:text-saffron-bright transition-colors flex items-center gap-1 group">See all <span className="group-hover:translate-x-1 transition-transform">→</span></button>
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
                <div key={i} className="group cursor-pointer bg-ink-800 border border-white/[0.07] rounded-2xl p-3 hover:border-saffron/35 hover:bg-ink-700 transition-all duration-300">
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-3">
                    <img src={eventImage} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-3 right-3 bg-ink-900/90 backdrop-blur-md px-2 py-1 rounded-lg shadow-lg border border-white/[0.07]">
                      <span className="block text-[10px] font-data font-bold text-center text-saffron uppercase tracking-widest">{month}</span>
                      <span className="block text-lg font-black text-center text-ivory leading-none">{day < 10 ? `0${day}` : day}</span>
                    </div>
                  </div>
                  <div className="px-2 pb-1">
                    <h3 className="font-bold text-base text-ivory mb-1 group-hover:text-saffron transition-colors line-clamp-1">{event.title}</h3>
                    <p className="text-xs text-saffron font-data font-bold mb-1.5">{safeDate.toDateString()} • {time}</p>
                    <p className="text-xs text-ivory-faint truncate flex items-center gap-1.5"><MapPin size={12} className="text-ivory-faint" /> {typeof event.location === 'object' ? event.location.name : event.location}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="bg-ink-800 p-6 rounded-2xl border border-white/[0.07]">
          <h3 className="text-lg font-display font-semibold mb-4 text-ivory tracking-tight">What we're about</h3>
          <div className="flex flex-wrap gap-2.5">
            {([group.category, 'Community', 'Social', 'Events', 'Networking']).filter(Boolean).map((tag, i) => (
              <span key={i} className="px-4 py-1.5 bg-white/[0.06] text-ivory-muted rounded-full text-sm font-semibold hover:bg-saffron/10 hover:text-saffron transition-colors cursor-default border border-white/[0.07]">
                {tag}
              </span>
            ))}
          </div>
        </section>
      </div>

      {/* Right Sidebar */}
      <div className="space-y-6">

        {/* Organizers Card */}
        <div className="bg-ink-800 p-6 rounded-2xl border border-white/[0.07]">
          <h3 className="font-display font-semibold text-ivory mb-4 text-base tracking-tight">Organizers</h3>
          <div className="space-y-4">
            {organizers.map((org, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={org.avatar || org.userAvatar}
                    alt={org.username}
                    className="w-12 h-12 rounded-full border-2 border-ink-700 shadow-md"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-horizon border-2 border-ink-800 rounded-full"></div>
                </div>
                <div>
                  <p className="font-bold text-ivory text-sm">{org.username || 'Group Admin'}</p>
                  <p className="text-xs text-saffron font-data font-bold mt-0.5 tracking-wide uppercase">Group Owner</p>
                </div>
                <button className="ml-auto p-2 text-ivory-faint hover:text-saffron hover:bg-saffron/10 rounded-full transition-colors flex-shrink-0" aria-label="Message organizer">
                  <MessageCircle size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Member Preview Card */}
        <div className="bg-ink-800 p-6 rounded-2xl border border-white/[0.07]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-ivory text-base tracking-tight">
              Members <span className="text-ivory-faint font-normal text-sm ml-1 bg-white/[0.06] px-2 py-0.5 rounded-full">{group.memberCount}</span>
            </h3>
          </div>

          <div className="flex flex-wrap gap-3">
            {membersPreview.map((member, i) => (
              <motion.img
                whileHover={{ scale: 1.15, y: -2 }}
                key={i}
                src={member.avatar || member.userAvatar}
                alt="Member"
                className="w-10 h-10 rounded-full border-2 border-ink-700 shadow-sm cursor-pointer object-cover hover:z-10 relative transition-shadow hover:shadow-md"
                title={member.username || `Member ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Location Card */}
        <div className="p-6 rounded-2xl border border-white/[0.07] bg-ink-800">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-saffron/10 text-saffron rounded-xl border border-saffron/20">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="font-display font-semibold text-ivory text-base tracking-tight">Location</h3>
              <p className="text-ivory-muted text-sm mt-1">{group.destination?.city}, {group.destination?.country}</p>
              <button
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(group.destination?.city + ', ' + group.destination?.country)}`, '_blank')}
                className="text-saffron text-[11px] font-data font-bold mt-3 hover:text-saffron-bright transition-colors uppercase tracking-widest flex items-center gap-1 group"
              >
                VIEW MAP <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Safety Score Card */}
        <div className="bg-ink-800 p-6 rounded-2xl border border-white/[0.07]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-ivory text-base tracking-tight">Safety Score</h3>
            <div className="scale-110 origin-right"><SafetyRatingBadge score={(seed % 50) / 10 + 5} size="sm" /></div>
          </div>
          <p className="text-sm text-ivory-faint leading-relaxed">
            Based on community reports and verified check-ins in this area.
          </p>
        </div>

      </div>
    </div>
  );
};

export default GroupAbout;
