import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { MOCK_GROUPS } from '../../data/socialMockData';
import { REAL_WORLD_GROUPS } from '../../data/realWorldGroups';
import { getCityImages } from '../../utils/staticImageService';

export const useGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Track if images have been assigned (no API calls needed!)
  const [imagesAssigned, setImagesAssigned] = useState(false);

  // Helper: Simple string hash for deterministic random numbers
  const getHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  // 1. Get Custom User Groups from cache
  const getCustomGroups = () => {
    try {
      const saved = localStorage.getItem('safar_custom_groups');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  };

  const fetchGroups = async (filters = {}) => {
    if (!imagesAssigned) setLoading(true);

    // 1. Initial Data Merge (Disabled Custom Local Storage Groups for Demo purity)
    // Only return the 6 demo mock groups
    let allGroups = [...MOCK_GROUPS.slice(0, 6)];

    // 2. Assign Images from Static Cache (NO API CALLS!)
    if (!imagesAssigned) {
      // Group items by city for efficient image distribution
      const cityGroupsMap = {};

      allGroups.forEach(group => {
        const city = group.destination?.city || 'Paris'; // Default to Paris

        if (!cityGroupsMap[city]) {
          cityGroupsMap[city] = [];
        }
        cityGroupsMap[city].push(group);
      });

      // Assign images from pre-fetched cache
      Object.entries(cityGroupsMap).forEach(([city, groupsInCity]) => {
        // Get all images for this city from static cache
        const cityImages = getCityImages(city);

        if (cityImages.length > 0) {
          groupsInCity.forEach((group, index) => {
            // Simple Linear Congruential Generator (LCG) for deterministic randomness
            // seeded by the group ID. This guarantees the same group gets the same images,
            // but different groups get different images.
            const seedStr = group.groupId + "v1";
            let seed = 0;
            for (let i = 0; i < seedStr.length; i++) {
              seed = ((seed << 5) - seed) + seedStr.charCodeAt(i);
              seed |= 0; // Convert to 32bit integer
            }
            seed = Math.abs(seed);

            const lcg = () => {
              seed = (1664525 * seed + 1013904223) % 4294967296;
              return seed / 4294967296;
            };

            // Create a pool of indices available for this city
            let indices = Array.from({ length: cityImages.length }, (_, i) => i);

            // Shuffle indices using our seeded random
            // Fisher-Yates shuffle
            for (let i = indices.length - 1; i > 0; i--) {
              const j = Math.floor(lcg() * (i + 1));
              [indices[i], indices[j]] = [indices[j], indices[i]];
            }

            // Assign Hero Image (pick 1st from shuffled)
            const heroIndex = indices[0];
            const heroImage = cityImages[heroIndex];

            // Prioritize the group's predefined image if it's an external URL (like unsplash), 
            // otherwise use the city image, otherwise fallback to existing
            if (group.image && group.image.includes('unsplash.com')) {
              // Keep the existing high-quality image
            } else {
              group.image = heroImage?.url || heroImage || group.image;
            }

            // Assign Gallery (pick next 8 from shuffled)
            // If we run out of unique images, we loop back
            group.gallery = Array.from({ length: 8 }).map((_, i) => {
              const idx = indices[(i + 1) % indices.length];
              const img = cityImages[idx];

              // Handle both object format and string URL format
              if (typeof img === 'object') {
                return {
                  id: `img_${idx}_${group.groupId}`,
                  url: img.url,
                  thumbnail: img.thumbnail || img.url,
                  caption: city,
                  user: img.photographer || 'Pexels'
                };
              } else {
                // Legacy: plain URL string
                return {
                  id: `img_${idx}_${group.groupId}`,
                  url: img,
                  thumbnail: img,
                  caption: city,
                  user: 'Pexels'
                };
              }
            });
          });
        }
      });

      setImagesAssigned(true);
    }

    // 3. Filtering Logic
    let filtered = allGroups;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(g =>
        g.name.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.destination.city.toLowerCase().includes(q) ||
        g.destination.country.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q)
      );
    }

    if (filters.destination) {
      const destTerms = filters.destination.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);

      if (destTerms.length > 0) {
        filtered = filtered.filter(g => {
          const city = g.destination.city.toLowerCase();
          const country = g.destination.country.toLowerCase();
          return destTerms.some(term => city.includes(term) || country.includes(term));
        });
      }
    }

    if (filters.interests && filters.interests.length > 0) {
      filtered = filtered.filter(g =>
        filters.interests.some(interest =>
          g.name.toLowerCase().includes(interest.toLowerCase()) ||
          g.description.toLowerCase().includes(interest.toLowerCase()) ||
          g.category.toLowerCase().includes(interest.toLowerCase())
        )
      );
    }

    setGroups(filtered);
    setLoading(false);
  };

  useEffect(() => {
    fetchGroups();
  }, []); // Run on mount

  const getGroupById = (id) => {
    // Find within the internal state 'groups' if populated, 
    // otherwise fall back to raw data & custom cache
    const customGroups = getCustomGroups();
    return groups.find(g => g.groupId === id) || [...customGroups, ...REAL_WORLD_GROUPS, ...MOCK_GROUPS].find(g => g.groupId === id);
  };

  const addGroup = (newGroupData) => {
    const newGroup = {
      groupId: `g_${Date.now()}`,
      name: newGroupData.name,
      description: newGroupData.description,
      destination: {
        city: newGroupData.destination.split(',')[0].trim(),
        country: newGroupData.destination.split(',')[1]?.trim() || 'Global'
      },
      category: 'Social',
      memberCount: 1,
      rating: 5.0,
      image: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
      members: [],
      upcomingMeetups: [],
      gallery: [],
      privacy: newGroupData.privacy,
      ...newGroupData
    };

    // Save it to custom persistent cache
    const customGroups = getCustomGroups();
    localStorage.setItem('safar_custom_groups', JSON.stringify([newGroup, ...customGroups]));

    setGroups(prev => [newGroup, ...prev]);

    // Automatically have the creator join their own group!
    setJoinedGroupIds(prev => {
      const updated = [...prev, newGroup.groupId];
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });

    return newGroup;
  };

  // Joined Groups State (Persisted)
  const { user } = useUser();
  const storageKey = user?.primaryEmailAddress?.emailAddress
    ? `safar_joined_groups_${user.primaryEmailAddress.emailAddress}`
    : 'safar_joined_groups_guest';

  const [joinedGroupIds, setJoinedGroupIds] = useState([]);

  // Load from local storage on mount or when user changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setJoinedGroupIds(JSON.parse(saved));
      } else {
        setJoinedGroupIds([]); // No old state saved for this user
      }
    } catch (e) {
      console.error("Failed to load joined groups", e);
    }
  }, [storageKey]);

  // Save to localStorage specifically on intentional toggles only
  const toggleJoinGroup = (groupId) => {
    setJoinedGroupIds(prev => {
      let updated;
      if (prev.includes(groupId)) {
        updated = prev.filter(id => id !== groupId);
      } else {
        updated = [...prev, groupId];
      }
      // Instantly write to correct storageKey securely
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  };

  const isGroupJoined = (groupId) => joinedGroupIds.includes(groupId);

  // Helper: Get full objects for joined groups
  const getJoinedGroups = () => {
    // Combine all potential sources
    const customGroups = getCustomGroups();
    const all = [...groups, ...customGroups, ...REAL_WORLD_GROUPS, ...MOCK_GROUPS];
    // Deduplicate by ID
    const uniqueMap = new Map();
    all.forEach(g => uniqueMap.set(g.groupId, g));

    return joinedGroupIds.map(id => uniqueMap.get(id)).filter(Boolean);
  };

  return {
    groups,
    loading,
    fetchGroups,
    getGroupById,
    addGroup,
    joinedGroupIds,
    toggleJoinGroup,
    isGroupJoined,
    getJoinedGroups
  };
};
