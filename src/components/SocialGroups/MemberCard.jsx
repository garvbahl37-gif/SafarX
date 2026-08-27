
import React, { useState } from 'react';
import { Shield, MessageCircle, MoreVertical, CheckCircle, UserPlus } from 'lucide-react';

const MemberCard = ({ member, compact = false }) => {
    const [showMenu, setShowMenu] = useState(false);

    // Safety Score Color
    const getScoreColor = (score) => {
        if (score >= 9) return 'text-green-600 bg-green-50';
        if (score >= 7) return 'text-yellow-600 bg-yellow-50';
        return 'text-orange-600 bg-orange-50';
    }

    if (compact) {
        return (
            <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group">
                <div className="relative">
                    <img
                        src={member.avatar || `https://ui-avatars.com/api/?name=${member.username}`}
                        alt={member.username}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                    {member.status === 'online' && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className='flex items-center gap-1'>
                        <p className="text-sm font-bold text-gray-900 truncate">{member.username}</p>
                        {member.verified && <CheckCircle size={12} className="text-blue-500" />}
                    </div>
                    {member.role !== 'member' && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${member.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {member.role}
                        </span>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="relative flex items-center gap-3 p-3 border border-white/5 rounded-xl bg-[#121622] shadow-sm hover:shadow-md transition-all group">
            {/* Avatar */}
            <div className="relative">
                <img
                    src={member.avatar || member.userAvatar || `https://ui-avatars.com/api/?name=${member.username}`}
                    alt={member.username}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#121622] shadow-sm"
                />
                {member.verified && (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-[#121622] rounded-full p-[1px]" title="Verified Member">
                        <CheckCircle className="w-4 h-4 text-cyan-500 fill-[#121622]" />
                    </div>
                )}
            </div>

            <div className='flex-1 min-w-0'>
                <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="font-bold text-sm text-white truncate">{member.username}</h4>
                    {member.role === 'admin' && (
                        <span className="bg-cyan-900/40 text-cyan-400 text-[9px] font-bold px-1.5 py-px rounded uppercase tracking-wider">Admin</span>
                    )}
                </div>

                <div className="flex items-center gap-3 text-xs">
                    <div className={`flex items-center gap-1 font-bold ${getScoreColor(member.safetyScore)} px-1.5 py-px rounded`}>
                        <Shield size={10} />
                        {member.safetyScore || 'N/A'}
                    </div>
                    <span className="text-gray-400 font-medium">Joined {new Date(member.joinedAt || Date.now()).toLocaleDateString()}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
                <button className="p-1.5 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-full transition-colors" title="Message">
                    <MessageCircle size={16} />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-sky-500 hover:bg-sky-50 rounded-full transition-colors" title="Add Friend">
                    <UserPlus size={16} />
                </button>
            </div>
        </div>
    );
};

export default MemberCard;
