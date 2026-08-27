
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Plus, MapPin, Sparkles } from 'lucide-react';
import { useGroups } from '../../hooks/social/useGroups';
import GroupCard from './GroupCard';
import GroupSearchFilters from './GroupSearchFilters';
import GroupCreationForm from './GroupCreationForm';
import TravelMatchMaker from './TravelMatchMaker';

const GroupExplorer = ({ onGroupClick, headless = false, externalSearchQuery, externalFilters }) => {
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [internalFilters, setInternalFilters] = useState({
    destination: '',
    startDate: '2026-03-15',
    endDate: '2026-03-22',
    interests: [],
    groupSize: 'any',
    language: 'any'
  });

  // Use external props if provided (headless mode) or internal state
  const searchQuery = headless ? externalSearchQuery : internalSearchQuery;
  const filters = headless ? externalFilters : internalFilters;

  // Setters only used for internal mode
  const setSearchQuery = headless ? () => { } : setInternalSearchQuery;
  const setFilters = headless ? () => { } : setInternalFilters;

  const [showFilters, setShowFilters] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showMatchMaker, setShowMatchMaker] = useState(false);
  const { groups, loading, fetchGroups } = useGroups();

  useEffect(() => {
    fetchGroups({ ...filters, search: searchQuery });
  }, [filters, searchQuery]);

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  if (showCreate) {
    return <GroupCreationForm onClose={() => setShowCreate(false)} />;
  }

  // In headless mode, we only return the results grid part or specific sections
  // But to keep it simple, we'll wrap the "Explorer" UI in a check

  if (headless) {
    // Headless mode: Returns ONLY the grid of results (or loading/empty states)
    // The parent handles the UI for search/filters
    return (
      <div className="max-w-7xl mx-auto px-4">
        {/* Groups List */}
        <div className="mb-12">
          {/* Only show title if needed, maybe parameterized? sticking to minimal for headless */}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-80 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-20 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <p className="text-white text-lg font-medium mb-4">
                No groups found matching your criteria.
              </p>
              <button
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold"
                onClick={() => setShowCreate(true)}
              >
                Create Your Own Group
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {groups.map((group, index) => (
                <motion.div
                  key={group.groupId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GroupCard group={group} onClick={onGroupClick} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
        {/* Reusing Create Modal if triggered from empty state */}
        {/* Ideally parent handles create, but keeping local state for modal for now is fine */}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-900">
            👥 Discover Travel Groups
          </h1>
          <div className="flex gap-2">
            <motion.button
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMatchMaker(!showMatchMaker)}
            >
              <Sparkles className="w-5 h-5" />
              {showMatchMaker ? 'Close MatchMaker' : 'Find My Match'}
            </motion.button>
          </div>
        </div>

        {/* AI MatchMaker Section */}
        <AnimatePresence>
          {showMatchMaker && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
            >
              <TravelMatchMaker />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Destination & Dates */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-xl shadow-sm">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{filters.destination}</p>
              <p className="text-sm text-gray-600 font-medium">
                {filters.startDate} - {filters.endDate}
              </p>
            </div>
          </div>
          <button
            className="text-blue-600 text-sm font-bold hover:underline"
            onClick={() => setShowFilters(true)}
          >
            Change Destination
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <button
            className="flex items-center gap-2 px-6 py-3.5 border-2 border-gray-200 bg-white rounded-xl font-bold hover:bg-gray-50 transition-colors relative"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-5 h-5" />
            Filters
            {Object.values(filters).filter(v => v !== 'any' && v.length > 0 && typeof v === 'string').length > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full absolute -top-2 -right-2 border-2 border-white">
                {Object.values(filters).filter(v => v !== 'any' && v.length > 0 && typeof v === 'string').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <>
            <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setShowFilters(false)} />
            <GroupSearchFilters
              filters={filters}
              onChange={handleFilterChange}
              onClose={() => setShowFilters(false)}
            />
          </>
        )}
      </AnimatePresence>

      {/* Groups List */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">🔥 Trending Groups</h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500 text-lg font-medium mb-4">
              No groups found matching your criteria.
            </p>
            <button
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold"
              onClick={() => setShowCreate(true)}
            >
              Create Your Own Group
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {groups.map((group, index) => (
              <motion.div
                key={group.groupId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GroupCard group={group} onClick={onGroupClick} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Group CTA */}
      <div className="text-center py-12 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border-2 border-yellow-100">
        <p className="text-gray-600 mb-4 text-lg">
          💡 Can't find a group that matches your travel plans?
        </p>
        <button
          className="bg-white text-yellow-700 px-8 py-3 rounded-xl font-bold shadow-sm border border-yellow-200 hover:bg-yellow-50 transition-colors"
          onClick={() => setShowCreate(true)}
        >
          Create Your Own Group
        </button>
      </div>
    </div>
  );
};

export default GroupExplorer;
