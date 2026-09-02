/**
 * SafarX Bollywood & Travel Audio Tracks
 * Each track has a searchQuery for the JioSaavn API to fetch the real song.
 * Falls back to ambient synth if the API is unavailable.
 */

export const BOLLYWOOD_TRAVEL_TRACKS = [
  {
    id: 'ilahi',
    title: 'Ilahi',
    movie: 'Yeh Jawaani Hai Deewani',
    artist: 'Arijit Singh',
    emoji: '🎒',
    tag: '🔥 Top Travel Anthem',
    mood: 'Backpacking & Carefree',
    searchQuery: 'Ilahi Yeh Jawaani Hai Deewani',
    streamUrl: null, // Will be fetched from JioSaavn API
  },
  {
    id: 'safarnama',
    title: 'Safarnama',
    movie: 'Tamasha',
    artist: 'Lucky Ali',
    emoji: '🛣️',
    tag: '⭐ Road Trip Soul',
    mood: 'Nostalgic & Soulful',
    searchQuery: 'Safarnama Tamasha',
    streamUrl: null,
  },
  {
    id: 'kabira',
    title: 'Kabira',
    movie: 'Yeh Jawaani Hai Deewani',
    artist: 'Tochi Raina & Rekha Bhardwaj',
    emoji: '🪕',
    tag: '🌄 Sufi Acoustic',
    mood: 'Soulful & Heartfelt',
    searchQuery: 'Kabira Yeh Jawaani Hai Deewani',
    streamUrl: null,
  },
  {
    id: 'patakha-guddi',
    title: 'Patakha Guddi',
    movie: 'Highway',
    artist: 'Nooran Sisters & A.R. Rahman',
    emoji: '🔥',
    tag: '⚡ Desert Highway',
    mood: 'High Energy & Wild',
    searchQuery: 'Patakha Guddi Highway',
    streamUrl: null,
  },
  {
    id: 'matargashti',
    title: 'Matargashti',
    movie: 'Tamasha',
    artist: 'Mohit Chauhan',
    emoji: '💃',
    tag: '🎉 Upbeat Wanderlust',
    mood: 'Playful & Joyful',
    searchQuery: 'Matargashti Tamasha',
    streamUrl: null,
  },
  {
    id: 'yun-hi-chala',
    title: 'Yun Hi Chala Chal',
    movie: 'Swades',
    artist: 'Udit Narayan & Hariharan',
    emoji: '🚗',
    tag: '⛰️ Iconic Highway',
    mood: 'Inspirational & Vast',
    searchQuery: 'Yun Hi Chala Chal Swades',
    streamUrl: null,
  },
  {
    id: 'khaabon-ke-parinday',
    title: 'Khaabon Ke Parinday',
    movie: 'Zindagi Na Milegi Dobara',
    artist: 'Mohit Chauhan',
    emoji: '🕊️',
    tag: '🌅 Golden Hour',
    mood: 'Breezy & Dreamy',
    searchQuery: 'Khaabon Ke Parinday Zindagi Na Milegi Dobara',
    streamUrl: null,
  },
  {
    id: 'hawayein',
    title: 'Hawayein',
    movie: 'Jab Harry Met Sejal',
    artist: 'Arijit Singh',
    emoji: '✨',
    tag: '🌇 Sunset Romance',
    mood: 'Warm & Romantic',
    searchQuery: 'Hawayein Jab Harry Met Sejal',
    streamUrl: null,
  },
  {
    id: 'dil-chahta-hai',
    title: 'Dil Chahta Hai',
    movie: 'Dil Chahta Hai',
    artist: 'Shankar Mahadevan',
    emoji: '🌊',
    tag: '🏖️ Road Trip Classic',
    mood: 'Youthful & Vibrant',
    searchQuery: 'Dil Chahta Hai title track',
    streamUrl: null,
  },
  {
    id: 'chaudhary',
    title: 'Chaudhary',
    movie: 'Coke Studio India',
    artist: 'Mame Khan & Amit Trivedi',
    emoji: '🪘',
    tag: '🏰 Rajasthani Folk',
    mood: 'Royal & Traditional',
    searchQuery: 'Chaudhary Mame Khan Coke Studio',
    streamUrl: null,
  }
];

export const CURATED_TRACKS = BOLLYWOOD_TRAVEL_TRACKS;

/**
 * Fetch real streaming URL for a track from the server's JioSaavn proxy
 */
export async function fetchSongStreamUrl(track) {
  try {
    const query = track.searchQuery || `${track.title} ${track.movie}`;
    const serverUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const res = await fetch(`${serverUrl}/music/search?q=${encodeURIComponent(query)}&limit=3`);
    
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    
    const data = await res.json();
    
    if (!data.success || !data.results?.length) {
      throw new Error('No results found');
    }

    // Find the best match — prefer exact title match
    const titleLower = track.title.toLowerCase();
    const bestMatch = data.results.find(r => 
      r.title.toLowerCase().includes(titleLower)
    ) || data.results[0];

    return {
      streamUrl: bestMatch.streamUrl,
      title: bestMatch.title,
      artist: bestMatch.artist,
      album: bestMatch.album,
      image: bestMatch.image,
      duration: bestMatch.duration || 180,
    };
  } catch (err) {
    console.warn(`Failed to fetch song "${track.title}":`, err.message);
    return null;
  }
}

/**
 * Custom Search for ANY song online via JioSaavn proxy
 */
export async function searchOnlineSongs(query) {
  if (!query || !query.trim()) return [];
  try {
    const serverUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const res = await fetch(`${serverUrl}/music/search?q=${encodeURIComponent(query.trim())}&limit=8`);
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.results) return [];

    return data.results.map(song => ({
      id: `custom_${song.id || Math.random().toString(36).substring(2, 7)}`,
      title: song.title,
      movie: song.album || 'Single / Album',
      artist: song.artist || 'Artist',
      emoji: '🎵',
      tag: '🔍 Searched',
      mood: 'Custom Track',
      image: song.image,
      duration: song.duration || 180,
      streamUrl: song.streamUrl
    }));
  } catch (err) {
    console.error('Song search failed:', err);
    return [];
  }
}

