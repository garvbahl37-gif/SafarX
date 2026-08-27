
import React from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Globe, Check, TrendingUp } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

const GroupCard = ({ group, onClick }) => {
  // const navigate = useNavigate();

  const calculateMatchScore = () => {
    // Simplified matching algorithm
    return Math.floor(Math.random() * 30) + 70; // 70-100%
  };

  const matchScore = calculateMatchScore();

  // Use fetched image or fallback to a fast placeholder (avoiding Unsplash random which can be slow/rate-limited)
  const bgImage = group.image || "https://images.pexels.com/photos/210186/pexels-photo-210186.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=800";


  // Dummy Members Logic
  const members = (group.members && group.members.length > 0)
    ? group.members
    : Array.from({ length: 4 }).map((_, i) => ({
      userId: `dummy_${group.groupId}_${i}`,
      username: `Member ${i}`,
      avatar: `https://ui-avatars.com/api/?name=${group.name.substring(0, 2)}+${i}&background=random&color=fff`
    }));

  return (
    <motion.div
      className="bg-ink-800 rounded-2xl overflow-hidden border border-white/[0.07] cursor-pointer transition-all duration-300 hover:border-saffron/35 hover:bg-ink-700 hover:shadow-2xl hover:shadow-saffron/10 h-full flex flex-col justify-between group relative"
      whileHover={{ y: -4 }}
      onClick={() => onClick(group.groupId)}
    >
      {/* Group Image - Premium Large */}
      <div className="h-64 overflow-hidden bg-ink-900 relative">
        <img
          src={bgImage}
          alt={group.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
        />
        {/* Subtle Gradient Overlay for premium feel */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/20 to-transparent"></div>
      </div>

      <div className="p-5 flex flex-col flex-grow relative z-10 -mt-8">
        {/* Header content pulled up over the image slightly */}
        <div className="mb-3">
          <h3 className="text-lg font-display font-semibold text-ivory leading-tight line-clamp-1 tracking-tight group-hover:text-saffron-bright transition-colors drop-shadow-md pb-1" title={group.name}>
            {group.name}
          </h3>
          <p className="text-xs text-ivory-muted font-medium flex items-center gap-2">
            <Users size={14} className="text-saffron" />
            {group.memberCount} members
          </p>
        </div>

        {/* Description */}
        <p className="text-ivory-faint text-sm line-clamp-2 leading-relaxed mb-4 flex-grow font-light">{group.description}</p>

        {/* Footer Info */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/[0.07]">
          {/* Members Stack */}
          <div className="flex items-center -space-x-2">
            {members.slice(0, 4).map((member) => (
              <img
                key={member.userId}
                src={member.avatar || member.userAvatar}
                alt={member.username}
                className="w-7 h-7 rounded-full border-2 border-ink-900 object-cover bg-white/10 shadow-sm"
              />
            ))}
            {(group.memberCount > 4) && (
              <div className="w-7 h-7 rounded-full bg-saffron/15 border-2 border-ink-900 flex items-center justify-center text-[10px] font-bold text-saffron">
                +{group.memberCount - 4}
              </div>
            )}
          </div>

          {/* Action */}
          <button
            className="text-xs font-bold text-ink-950 bg-gradient-to-r from-saffron-bright to-saffron hover:from-saffron hover:to-saffron-bright px-4 py-1.5 rounded-full transition-all shadow-lg hover:shadow-saffron/25"
            onClick={(e) => {
              e.stopPropagation();
              onClick(group.groupId, 'about');
            }}
          >
            Join Now
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default GroupCard;
