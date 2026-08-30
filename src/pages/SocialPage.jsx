import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Sparkles, Plus, X, ArrowLeft, Users } from 'lucide-react';
import { useGroups } from '../hooks/social/useGroups';
import GroupExplorer from '../components/SocialGroups/GroupExplorer';
import GroupDetail from '../components/SocialGroups/GroupDetail';
import GroupSearchFilters from '../components/SocialGroups/GroupSearchFilters';
import GroupCreationForm from '../components/SocialGroups/GroupCreationForm';
import TravelMatchMaker from '../components/SocialGroups/TravelMatchMaker';

const SocialPage = ({ onBack }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [selectedGroupTab, setSelectedGroupTab] = useState('discussions');
    const { getGroupById, addGroup, getJoinedGroups, toggleJoinGroup, isGroupJoined } = useGroups();

    // Modal State
    const [activeModal, setActiveModal] = useState(null); // 'create' | 'match' | null
    const [createError, setCreateError] = useState(null);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [showJoinedGroups, setShowJoinedGroups] = useState(false);

    // Listen for reset events from Header
    useEffect(() => {
        if (location.state?.resetSocialPage) {
            setSelectedGroupId(null);
            setSearchQuery('');
            setIsSearchActive(false);
            setShowJoinedGroups(false);
            setShowFilters(false);
            setActiveModal(null);

            // Clear the state so it doesn't loop
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate, location.pathname]);

    // Update active state when search query changes
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setIsSearchActive(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [searchQuery]);

    // Filters State
    const [filters, setFilters] = useState({
        destination: '',
        startDate: '2026-03-15',
        endDate: '2026-03-22',
        interests: [],
        groupSize: 'any',
        language: 'any'
    });

    const handleGroupClick = (groupId, tab = 'discussions') => {
        setSelectedGroupId(groupId);
        setSelectedGroupTab(tab);
        window.scrollTo(0, 0);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim().length > 0) {
            setIsSearchActive(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const selectedGroup = selectedGroupId ? getGroupById(selectedGroupId) : null;

    return (
        <div className="min-h-screen relative overflow-x-hidden bg-ink-950">
            {/* Backdrop — travelers image under a heavy ink scrim */}
            <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
                <img
                    src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1920&auto=format&fit=crop&q=70"
                    alt=""
                    className="w-full h-full object-cover opacity-25"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-ink-950/80 via-ink-950/70 to-ink-950" />
            </div>

            {createError && (
                <div role="alert" className="fixed inset-x-0 top-24 z-[70] mx-auto w-fit max-w-[90vw] rounded-full border border-[#E05252]/35 bg-[#E05252]/[0.12] px-5 py-2.5 font-sans text-[13.5px] text-[#F0A8A8] backdrop-blur-xl">
                    {createError}
                    <button onClick={() => setCreateError(null)} className="ml-3 font-data text-[10px] uppercase tracking-[0.16em] text-ivory-faint hover:text-ivory">Dismiss</button>
                </div>
            )}

            {/* Modals Layer */}
            <AnimatePresence>
                {activeModal === 'create' && (
                    <GroupCreationForm
                        onClose={() => setActiveModal(null)}
                        /* Creating a group is a round trip now, so open it only
                           once the server has actually made it. */
                        onSubmit={async (data) => {
                            try {
                                const created = await addGroup(data);
                                setActiveModal(null);
                                setSelectedGroupId(created.groupId);
                            } catch (err) {
                                setCreateError(err.message);
                            }
                        }}
                    />
                )}
                {activeModal === 'match' && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-2xl"
                        >
                            <button
                                onClick={() => setActiveModal(null)}
                                aria-label="Close travel matchmaker"
                                className="absolute -top-12 right-0 text-ivory-faint hover:text-ivory p-2 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                            <TravelMatchMaker />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Content Layer */}
            <div className={`relative z-10 min-h-screen flex flex-col transition-all duration-300 ${isSearchActive ? 'justify-start pt-0' : 'justify-center items-center'}`}>

                {selectedGroup ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-[100] bg-ink-950 overflow-y-auto"
                    >
                        <GroupDetail
                            group={selectedGroup}
                            initialTab={selectedGroupTab}
                            onBack={() => setSelectedGroupId(null)}
                            onCreateGroup={() => setActiveModal('create')}
                            isJoined={isGroupJoined(selectedGroup.groupId)}
                            onToggleJoin={() => toggleJoinGroup(selectedGroup.groupId)}
                        />
                    </motion.div>
                ) : (
                    <>
                        {/* Editorial hero above the panel */}
                        {!isSearchActive && !selectedGroup && (
                            <motion.div
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                                className="w-full text-center mt-2 mb-8 relative z-20 px-6"
                            >
                                <p className="flex items-center justify-center gap-3 mb-5">
                                    <span className="route-line w-12 hidden sm:inline-block" />
                                    <span className="route-dot" />
                                    <span className="eyebrow">Safar Groups</span>
                                    <span className="route-dot" />
                                    <span className="route-line w-12 hidden sm:inline-block" />
                                </p>
                                <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-light text-ivory tracking-tight leading-[1.05]">
                                    Travel better,{' '}
                                    <em className="italic font-medium text-saffron-bright">together</em>
                                </h1>
                            </motion.div>
                        )}

                        {/* Central glass panel / sticky search bar */}
                        <div
                            className={`transition-all duration-500 ease-in-out relative z-20
                        ${isSearchActive
                                    ? 'w-full sticky top-[72px] z-50 border-b border-white/[0.07] bg-ink-950/85 backdrop-blur-xl px-4 py-5 rounded-none'
                                    : 'w-[90%] max-w-3xl glass-panel p-8 mx-auto mb-12'
                                }
                    `}
                        >
                            <div className={`mx-auto ${isSearchActive ? 'max-w-7xl flex flex-col md:flex-row items-center gap-6 justify-between' : 'flex flex-col items-center text-center'}`}>

                                {/* Title Section */}
                                <div className={`flex flex-col ${isSearchActive ? 'items-start text-left mb-0' : 'items-center text-center mb-4'}`}>
                                    {!isSearchActive && (
                                        <>
                                            <p className="text-ivory-muted text-base leading-relaxed max-w-md">
                                                Join groups of travelers heading the same way — share plans, costs, and the road across India.
                                            </p>

                                            {/* Joined Groups Button (Compact) */}
                                            <button
                                                onClick={() => setShowJoinedGroups(!showJoinedGroups)}
                                                aria-expanded={showJoinedGroups}
                                                className="mt-5 flex items-center gap-2 px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.09] hover:border-saffron/35 rounded-full text-ivory text-sm font-medium transition-all"
                                            >
                                                <Users size={15} className="text-saffron" />
                                                <span>My groups</span>
                                                <span className="font-data text-[11px] bg-white/10 px-1.5 py-0.5 rounded-full tabular-nums">
                                                    {getJoinedGroups().length}
                                                </span>
                                            </button>
                                        </>
                                    )}
                                    {isSearchActive && (
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => {
                                                    setSearchQuery('');
                                                    setIsSearchActive(false);
                                                }}
                                                aria-label="Back to Safar Groups"
                                                className="p-2 -ml-2 text-ivory-muted hover:text-ivory transition-colors rounded-full hover:bg-white/[0.08]"
                                            >
                                                <ArrowLeft size={22} />
                                            </button>
                                            <span className="hidden md:flex items-center gap-3">
                                                <span className="route-dot" />
                                                <span className="eyebrow">Safar Groups</span>
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Search & Actions Section */}
                                <div className={`w-full ${isSearchActive ? 'flex-1 flex items-center gap-4 justify-end' : 'flex flex-col gap-4 w-full mt-2'}`}>

                                    {/* Search bar row */}
                                    <div className={`flex flex-col md:flex-row gap-3 w-full ${isSearchActive ? 'justify-end' : ''}`}>
                                        <form onSubmit={handleSearchSubmit} className={`relative flex-1 ${isSearchActive ? 'max-w-xl' : ''}`}>
                                            <input
                                                type="text"
                                                placeholder="Search groups — try 'Trekking in Himachal'"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                aria-label="Search travel groups"
                                                className="glass-input w-full !py-3.5 !pl-12 !pr-5 text-ivory placeholder:text-ivory-faint"
                                            />
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ivory-faint" size={18} />
                                            {isSearchActive && searchQuery && (
                                                <button
                                                    type="button"
                                                    onClick={() => { setSearchQuery(''); setIsSearchActive(false); }}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 font-data text-[10px] text-ivory-faint hover:text-ivory uppercase tracking-[0.16em] transition-colors"
                                                >
                                                    Clear
                                                </button>
                                            )}
                                        </form>

                                        {/* Filter Toggle */}
                                        <button
                                            onClick={() => setShowFilters(!showFilters)}
                                            aria-expanded={showFilters}
                                            className={`flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm transition-all border ${showFilters
                                                ? 'bg-saffron text-ink-950 border-transparent'
                                                : 'bg-white/[0.05] text-ivory border-white/[0.09] hover:border-saffron/35 hover:bg-white/[0.08]'}`}
                                        >
                                            <Filter size={16} />
                                            <span>Filters</span>
                                        </button>
                                    </div>

                                    {/* Action Buttons */}
                                    {!isSearchActive && (
                                        <div className="flex flex-col md:flex-row gap-3 w-full">
                                            <button
                                                onClick={() => setActiveModal('match')}
                                                className="btn-primary flex-1 justify-center"
                                            >
                                                <Sparkles size={16} />
                                                Find my match
                                            </button>
                                            <button
                                                onClick={() => setActiveModal('create')}
                                                className="btn-ghost flex-1 justify-center"
                                            >
                                                <Plus size={16} />
                                                Create a group
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Expandable Filters Panel */}
                            <AnimatePresence>
                                {showFilters && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pt-6 border-t border-white/[0.07] mt-6">
                                            <GroupSearchFilters
                                                filters={filters}
                                                onChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))}
                                                onClose={() => setShowFilters(false)}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Joined Groups Panel */}
                        <AnimatePresence>
                            {showJoinedGroups && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    className="fixed top-24 right-4 z-[60] w-[320px] max-h-[70vh] bg-ink-900/90 backdrop-blur-2xl shadow-2xl flex flex-col rounded-2xl border border-white/[0.09] overflow-hidden"
                                >
                                    <div className="p-4 border-b border-white/[0.07] flex items-center justify-between bg-white/[0.03] sticky top-0 z-10">
                                        <h2 className="font-data text-[11px] uppercase tracking-[0.16em] flex items-center gap-2 text-ivory">
                                            <Users size={14} className="text-saffron" />
                                            My joined groups
                                        </h2>
                                        <button
                                            onClick={() => setShowJoinedGroups(false)}
                                            aria-label="Close joined groups panel"
                                            className="p-1 hover:bg-white/[0.08] rounded-full transition-colors"
                                        >
                                            <X size={16} className="text-ivory-muted hover:text-ivory" />
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4">
                                        {getJoinedGroups().length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                                                <div className="w-14 h-14 bg-white/[0.04] rounded-full flex items-center justify-center border border-white/[0.07]">
                                                    <Users size={26} className="text-ivory-faint" />
                                                </div>
                                                <p className="font-display text-lg text-ivory">No groups yet</p>
                                                <p className="text-sm text-ivory-muted">Join a group below and it will show up here.</p>
                                                <button
                                                    onClick={() => setShowJoinedGroups(false)}
                                                    className="btn-primary !py-2.5 !px-6 text-sm"
                                                >
                                                    Explore groups
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-3">
                                                {getJoinedGroups().map(group => (
                                                    <button
                                                        key={group.groupId}
                                                        onClick={() => {
                                                            setShowJoinedGroups(false);
                                                            handleGroupClick(group.groupId);
                                                        }}
                                                        className="bg-ink-800 p-3.5 rounded-xl border border-white/[0.07] cursor-pointer hover:border-saffron/35 hover:bg-ink-700 transition-all flex gap-4 items-center group text-left w-full"
                                                    >
                                                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-ink-950 border border-white/[0.07]">
                                                            <img
                                                                src={group.image}
                                                                alt={group.name}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform opacity-85 group-hover:opacity-100"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-ivory truncate text-sm">{group.name}</h3>
                                                            <p className="font-data text-[10px] uppercase tracking-[0.12em] text-saffron mt-1">
                                                                {group.category}
                                                            </p>
                                                            <p className="text-xs text-ivory-muted mt-1 truncate">
                                                                {group.destination?.city}, {group.destination?.country}
                                                            </p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Results Section */}
                        <AnimatePresence>
                            <motion.div
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: 0.12, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                                className="w-full max-w-7xl mx-auto px-4 pb-8"
                            >
                                <GroupExplorer
                                    headless={true}
                                    onGroupClick={handleGroupClick}
                                    externalSearchQuery={searchQuery}
                                    externalFilters={filters}
                                />
                            </motion.div>
                        </AnimatePresence>
                    </>
                )}

            </div>
        </div>
    );
};


export default SocialPage;
