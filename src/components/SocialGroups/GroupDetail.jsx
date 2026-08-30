import React, { useState, useEffect } from 'react';
import { ArrowLeft, Share2, MapPin, Users, Calendar, MessageSquare, Shield, Info, ImageIcon, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import Sibling Components
import GroupAbout from './GroupAbout';
import GroupEvents from './GroupEvents';
import GroupPhotos from './GroupPhotos';
import GroupChat from './GroupChat';
import GroupSplit from './GroupSplit';
import MemberList from './MemberList';

const GroupDetail = ({ group, onBack, initialTab = 'about', isJoined, onToggleJoin }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Use distinct hero image from group data or fallback
  const bgImage = group.image || "https://images.pexels.com/photos/2048865/pexels-photo-2048865.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: group.name,
          text: `Check out this group: ${group.name} on SafarX!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleJoin = () => {
    onToggleJoin();
  };

  // Mock Members Images
  const memberImages = [
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&q=80"
  ];

  /* Talk and money first: they are what a group is actually for, and what
     people come back to. Everything else is reference. */
  const tabs = [
    { id: 'discussions', label: 'Chat', icon: MessageSquare },
    { id: 'split', label: 'Split', icon: Wallet },
    { id: 'about', label: 'About', icon: Info },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'events', label: 'Meetups', icon: Calendar },
    { id: 'photos', label: 'Photos', icon: ImageIcon },
  ];

  return (
    <div className="min-h-screen bg-ink-950 font-sans text-ivory-muted w-full relative">

      {/* Background stars effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden h-[150vh]">
        {/* Rendering some tiny dots to simulate stars */}
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-saffron rounded-full"
            style={{
              width: Math.random() * 2 + 'px',
              height: Math.random() * 2 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.5 + 0.1
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <div className="relative w-full h-[60vh] min-h-[450px]">
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-50">
          <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 bg-ink-950/40 backdrop-blur-md rounded-full text-ivory border border-white/[0.07] hover:bg-white/10 transition">
            <ArrowLeft size={16} /> <span className="text-sm font-medium">Back</span>
          </button>
        </div>

        <div className="absolute inset-0">
          <img
            src={bgImage}
            alt={group.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-transparent" />
        </div>

        {/* Hero Content positioned at the bottom left */}
        <div className="absolute bottom-0 left-0 w-full p-6 sm:px-10 pb-8">
          <div className="max-w-6xl mx-auto flex flex-col gap-4">
            <div className="self-start px-3 py-1 rounded-full border border-saffron/35 text-saffron text-xs font-data font-semibold uppercase tracking-widest bg-saffron/10">
              {group.category || 'Cultural'}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold text-ivory tracking-tight">
              {group.name || "Group"}
            </h1>

            <div className="flex flex-wrap items-center gap-5 text-sm text-ivory-muted mt-1">
              <div className="flex items-center gap-2"><MapPin size={16} className="text-saffron" /> {group.destination?.city || "Unknown City"}, {group.destination?.country || "Unknown Country"}</div>
              <div className="flex items-center gap-2"><Users size={16} className="text-saffron" /> {group.memberCount || 1} members</div>
              <div className="flex items-center gap-2"><Calendar size={16} className="text-saffron" /> Next: {group.upcomingMeetups?.[0]?.dateTime ? new Date(group.upcomingMeetups[0].dateTime).toLocaleDateString() : 'TBD'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="bg-ink-900 border-y border-white/[0.07] sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 flex items-center gap-8 overflow-x-auto scrollbar-hide h-16">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                        h-full flex items-center gap-2 text-sm font-data font-bold border-b-2 transition-colors whitespace-nowrap px-1 uppercase tracking-wide
                        ${activeTab === tab.id
                  ? 'border-saffron text-saffron'
                  : 'border-transparent text-ivory-faint hover:text-ivory-muted hover:border-white/20'}
                    `}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="relative z-10 w-full px-6 sm:px-10 py-8 min-h-[500px]">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="max-w-6xl mx-auto"
        >
          {activeTab === 'about' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="col-span-1 lg:col-span-2 space-y-8 flex flex-col">

                {/* About Section */}
                <div className="bg-ink-800 border border-white/[0.07] rounded-2xl p-6 sm:p-8">
                  <h2 className="text-ivory font-display font-semibold text-xl mb-4">About {group.name || "this group"}</h2>
                  <p className="text-ivory-muted text-sm leading-relaxed">
                    {group.description || "Join our community to meet new friends, explore shared interests, and have a great time together. Everyone is welcome!"}
                  </p>
                </div>

                {/* Upcoming Meetups Section */}
                <div>
                  <h2 className="text-ivory font-display font-semibold text-xl mb-4">Upcoming Meetups</h2>
                  {group.upcomingMeetups && group.upcomingMeetups.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {group.upcomingMeetups.slice(0, 2).map((meetup, idx) => (
                        <div key={idx} className="bg-ink-800 border border-white/[0.07] rounded-2xl p-6 flex flex-col gap-3">
                          <h3 className="text-ivory font-bold text-lg">{meetup.title}</h3>
                          <div className="flex text-sm text-ivory-muted gap-2 items-center"><Calendar size={16} className="text-saffron" /> {new Date(meetup.dateTime).toLocaleDateString()}</div>
                          <div className="flex text-sm text-ivory-muted gap-2 items-center"><MapPin size={16} className="text-saffron" /> {meetup.location?.name || "TBD"}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-ink-800 border border-white/[0.07] rounded-2xl p-6 text-center">
                      <p className="text-ivory-faint text-sm">No upcoming meetups scheduled.</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <button
                    onClick={handleJoin}
                    className="btn-primary px-10 py-4 text-sm tracking-wide"
                  >
                    {isJoined ? 'JOINED' : 'JOIN GROUP'}
                  </button>
                  <button
                    onClick={handleNativeShare}
                    className="btn-ghost px-8 py-4 text-sm flex items-center gap-2 tracking-wide"
                  >
                    <Share2 size={16} /> SHARE
                  </button>
                </div>
              </div>

              {/* Right Column */}
              <div className="col-span-1 space-y-6">

                {/* Group Admin Card */}
                <div className="bg-ink-800 border border-white/[0.07] rounded-2xl p-6 flex flex-col items-center text-center">
                  <img
                    src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80"
                    alt="Admin"
                    className="w-20 h-20 rounded-full object-cover border-2 border-saffron shadow-[0_0_15px_rgba(212,168,67,0.3)] mb-4"
                  />
                  <h3 className="text-ivory font-bold text-lg tracking-tight">Emre Yildiz</h3>
                  <p className="text-ivory-faint text-xs mb-6 uppercase tracking-wider font-data font-semibold">Group Admin</p>

                  <button className="w-full btn-ghost text-xs py-3.5 justify-center flex items-center gap-2 uppercase tracking-widest">
                    <MessageSquare size={16} /> MESSAGE
                  </button>
                </div>

                {/* Members Card */}
                <div className="bg-ink-800 border border-white/[0.07] rounded-2xl p-6">
                  <h3 className="text-ivory font-bold text-base mb-5">Members ({group.memberCount || 1})</h3>
                  <div className="flex -space-x-3 overflow-hidden px-1">
                    {(group.members?.length > 0 ? group.members.slice(0, 8).map(m => m.avatar || m.userAvatar) : memberImages).map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt="Member"
                        className="w-12 h-12 rounded-full object-cover border-2 border-ink-800 hover:-translate-y-1 transition-transform cursor-pointer relative z-0 hover:z-10"
                      />
                    ))}
                  </div>
                </div>

                {/* Safety Score Card */}
                <div className="bg-ink-800 border border-white/[0.07] rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4 text-ivory font-bold text-base">
                    <Shield size={18} className="text-saffron" /> Safety Score
                  </div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-5xl font-data font-bold text-saffron leading-none drop-shadow-[0_0_10px_rgba(212,168,67,0.4)]">92</span>
                    <span className="text-ivory-faint text-sm font-semibold">/ 100</span>
                  </div>
                  <div className="h-2 w-full bg-ink-900 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-gradient-to-r from-saffron to-saffron-bright w-[92%] rounded-full shadow-[0_0_10px_rgba(212,168,67,0.5)]"></div>
                  </div>
                </div>

                {/* Location Card */}
                <div className="bg-ink-800 border border-white/[0.07] rounded-2xl p-6 min-h-[160px] flex flex-col">
                  <div className="flex items-center gap-2 mb-6 text-ivory font-bold text-base">
                    <MapPin size={18} className="text-saffron" /> Location
                  </div>
                  <div className="flex-1 flex items-center justify-center text-center">
                    <p className="text-ivory-faint text-sm font-medium">{group.destination?.city || "Unknown City"}, {group.destination?.country || "Unknown Country"}</p>
                  </div>
                </div>

              </div>
            </div>
          )}
          {activeTab === 'events' && <div className="bg-ink-900/60 rounded-2xl p-6 border border-white/[0.07]"><GroupEvents group={group} /></div>}
          {activeTab === 'members' && <div className="bg-ink-900/60 rounded-2xl p-6 border border-white/[0.07]"><MemberList groupId={group.groupId} /></div>}
          {activeTab === 'photos' && <div className="bg-ink-900/60 rounded-2xl p-6 border border-white/[0.07]"><GroupPhotos group={group} /></div>}
          {activeTab === 'discussions' && <GroupChat group={group} isJoined={isJoined} />}
          {activeTab === 'split' && <GroupSplit group={group} isJoined={isJoined} />}
        </motion.div>
      </div>
    </div>
  );
};

export default GroupDetail;
