
import React, { useState } from 'react';
import { useGroupMembers } from '../../hooks/social/useGroupMembers';
import MemberCard from './MemberCard';
import { Search, Filter } from 'lucide-react';

const MemberList = ({ groupId }) => {
    const { members, loading, searchMembers, filterMembers } = useGroupMembers(groupId);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all'); // all, admin, verified, online

    if (loading) return <div className="p-8 text-center text-gray-400">Loading members...</div>;

    let displayMembers = searchMembers(searchQuery);
    if (activeFilter !== 'all') {
        const filters = {};
        if (activeFilter === 'admin') filters.role = 'admin';
        if (activeFilter === 'verified') filters.verified = true;
        if (activeFilter === 'online') filters.online = true;
        displayMembers = filterMembers(filters, displayMembers);
    }

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 text-white">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search members..."
                        className="w-full pl-10 pr-4 py-3 bg-[#121622] border border-white/10 rounded-xl focus:border-cyan-500/50 outline-none transition-all placeholder-gray-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {['all', 'admin', 'verified', 'online'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-5 py-3 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-colors border ${activeFilter === filter
                                    ? 'bg-cyan-500 text-black border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                                    : 'bg-[#121622] text-gray-400 border-white/5 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayMembers.map(member => (
                    <MemberCard key={member.userId} member={member} />
                ))}
                {displayMembers.length === 0 && (
                    <div className="col-span-full text-center py-10 text-gray-500 bg-[#121622] rounded-xl border border-white/5">
                        No members found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemberList;
