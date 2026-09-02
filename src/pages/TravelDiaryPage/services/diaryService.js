/**
 * SafarX — Diary Storage & Sharing Service
 * Public Share URL & QR Code Generator for all browsers & devices
 */

export const SAMPLE_RAJASTHAN_JOURNEY = {
  id: 'rajasthan-royal-odyssey-sample',
  tripTitle: 'Royal Echoes of Rajasthan',
  travelerName: 'Aarav & Meera',
  dateRange: 'Oct 12 – Oct 18, 2026',
  destination: 'Rajasthan, India',
  summary: 'A 7-day golden journey across the Pink City, the Blue Fortresses of Marwar, the romantic lakes of Mewar, and the starlit dunes of Thar.',
  totalDistance: '940 km',
  totalSpots: 16,
  photos: [
    { id: 'p1', url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80', location: 'Hawa Mahal, Jaipur', day: 'Day 01', tag: 'Pink City', caption: '953 pink sandstone jharokhas singing with the morning desert breeze.', date: 'Oct 12, 2026', lat: 26.9239, lng: 75.8267, weather: '28°C Sunny' },
    { id: 'p2', url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80', location: 'Amer Fort, Jaipur', day: 'Day 01', tag: 'Royal Fortress', caption: 'Sheesh Mahal reflecting a single candle into a million starlit skies.', date: 'Oct 12, 2026', lat: 26.9855, lng: 75.8513, weather: '27°C Golden Hour' },
    { id: 'p3', url: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=80', location: 'Jal Mahal, Jaipur', day: 'Day 02', tag: 'Water Palace', caption: 'Floating palace in Man Sagar Lake at twilight tranquility.', date: 'Oct 13, 2026', lat: 26.9656, lng: 75.8458, weather: '26°C Sunset' },
    { id: 'p4', url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80', location: 'Patrika Gate, Jaipur', day: 'Day 02', tag: 'Vibrant Frescoes', caption: 'Every archway painted with stories of Rajasthan\'s legendary kingdoms.', date: 'Oct 13, 2026', lat: 26.8373, lng: 75.8085, weather: '29°C Clear' },
    { id: 'p5', url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80', location: 'Mehrangarh Fort, Jodhpur', day: 'Day 03', tag: 'Citadel of the Sun', caption: 'Standing guard above the Blue City for five hundred years.', date: 'Oct 14, 2026', lat: 26.2980, lng: 73.0188, weather: '31°C Crisp' },
    { id: 'p6', url: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80', location: 'Blue City Alleys, Jodhpur', day: 'Day 03', tag: 'Cobblestone Heritage', caption: 'Indigo walls, wandering peacocks, and the scent of freshly fried mirchi vadas.', date: 'Oct 14, 2026', lat: 26.2950, lng: 73.0150, weather: '30°C Warm' },
    { id: 'p7', url: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1200&q=80', location: 'Jaswant Thada, Jodhpur', day: 'Day 03', tag: 'Marble Cenotaph', caption: 'Carved sheets of Makrana marble glowing translucent in the noon sun.', date: 'Oct 14, 2026', lat: 26.3044, lng: 73.0239, weather: '29°C Sunny' },
    { id: 'p8', url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80', location: 'City Palace, Udaipur', day: 'Day 04', tag: 'Venice of the East', caption: 'Balconies overlooking the serene emerald waters of Lake Pichola.', date: 'Oct 15, 2026', lat: 24.5764, lng: 73.6835, weather: '26°C Breezy' },
    { id: 'p9', url: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1200&q=80', location: 'Lake Pichola Boat Ride', day: 'Day 04', tag: 'Sunset Cruise', caption: 'Sun dipping behind the Aravalli hills, casting gold across the lake.', date: 'Oct 15, 2026', lat: 24.5722, lng: 73.6775, weather: '25°C Twilight' },
    { id: 'p10', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80', location: 'Sam Sand Dunes, Jaisalmer', day: 'Day 05', tag: 'Thar Desert Safari', caption: 'Rippling desert sands shifting with the eternal desert winds.', date: 'Oct 16, 2026', lat: 26.8322, lng: 70.5050, weather: '32°C Desert Sun' },
    { id: 'p11', url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80', location: 'Golden Fort (Sonar Qila)', day: 'Day 06', tag: 'Living Fort', caption: 'A fortress carved from yellow sandstone where artisans still reside.', date: 'Oct 17, 2026', lat: 26.9124, lng: 70.9128, weather: '30°C Golden' },
    { id: 'p12', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80', location: 'Patwon Ki Haveli, Jaisalmer', day: 'Day 06', tag: 'Intricate Jali Carvings', caption: 'Stone carved like delicate lace by 19th-century silk and spice traders.', date: 'Oct 17, 2026', lat: 26.9178, lng: 70.9185, weather: '29°C Sunny' },
    { id: 'p13', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80', location: 'Gadisar Lake, Jaisalmer', day: 'Day 06', tag: 'Sacred Waters', caption: 'Feeding catfish under Tilon Ki Pol in the quiet desert morning.', date: 'Oct 17, 2026', lat: 26.9068, lng: 70.9234, weather: '23°C Calm' },
    { id: 'p14', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', location: 'Pushkar Brahma Lake Ghats', day: 'Day 07', tag: 'Spiritual Ghats', caption: 'Sacred chants, floating marigold diyas, and peaceful desert evenings.', date: 'Oct 18, 2026', lat: 26.4897, lng: 74.5511, weather: '26°C Sacred' },
    { id: 'p15', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80', location: 'Night Sky — Desert Camp', day: 'Day 07', tag: 'Stargazing', caption: 'Under a billion stars in the Thar, where folk songs echo by campfire.', date: 'Oct 18, 2026', lat: 26.8300, lng: 70.5000, weather: '18°C Starlit' },
    { id: 'p16', url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80', location: 'Sunrise — Amer Fort Hilltop', day: 'Day 07', tag: 'Golden Hour', caption: 'First light painting the ramparts of Amer in molten amber.', date: 'Oct 18, 2026', lat: 26.9876, lng: 75.8513, weather: '22°C Misty Dawn' },
  ]
};

const STORAGE_INDEX_KEY = 'safarx_diary_index';
const STORAGE_ITEM_PREFIX = 'safarx_diary_item_';

// Public production web app host fallback for mobile QR code scanning
const PUBLIC_PRODUCTION_BASE = 'https://bharatverse11-safarx.hf.space';

export const diaryService = {
  saveJourney(journey) {
    try {
      const shareId = journey.shareId || `sfx_${Math.random().toString(36).slice(2, 10)}`;
      const toSave = { ...journey, shareId, savedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_ITEM_PREFIX + shareId, JSON.stringify(toSave));

      const index = diaryService.getIndex();
      const existing = index.findIndex(i => i.shareId === shareId);
      const meta = { shareId, tripTitle: journey.tripTitle, savedAt: toSave.savedAt, photoCount: journey.photos?.length || 0 };
      if (existing >= 0) index[existing] = meta;
      else index.unshift(meta);
      localStorage.setItem(STORAGE_INDEX_KEY, JSON.stringify(index.slice(0, 50)));

      return shareId;
    } catch (e) {
      console.warn('Failed to save diary:', e);
      return journey.shareId || 'sample';
    }
  },

  getIndex() {
    try { return JSON.parse(localStorage.getItem(STORAGE_INDEX_KEY) || '[]'); }
    catch { return []; }
  },

  getJourneyByShareId(shareId) {
    if (shareId === 'sample' || shareId === SAMPLE_RAJASTHAN_JOURNEY.id) return SAMPLE_RAJASTHAN_JOURNEY;
    try {
      const raw = localStorage.getItem(STORAGE_ITEM_PREFIX + shareId);
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return SAMPLE_RAJASTHAN_JOURNEY;
  },

  getAllJourneys() {
    try {
      const index = diaryService.getIndex();
      const result = index.map(i => diaryService.getJourneyByShareId(i.shareId)).filter(Boolean);
      if (!result.some(j => j.id === SAMPLE_RAJASTHAN_JOURNEY.id)) result.push(SAMPLE_RAJASTHAN_JOURNEY);
      return result;
    } catch { return [SAMPLE_RAJASTHAN_JOURNEY]; }
  },

  /**
   * Build Public Shareable URLs & QR Code Target
   * Ensures QR code NEVER uses 'localhost' when scanned on mobile devices.
   */
  buildShareUrls(journey, shareId) {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    // Base URL for universal browser access
    const baseHost = isLocalhost ? PUBLIC_PRODUCTION_BASE : window.location.origin;

    // Self-contained encoded data for instant cross-device story opening
    let encodedDataUrl = `${baseHost}/diary/view?id=${shareId}`;
    try {
      const safePhotos = (journey.photos || [])
        .filter(p => p.url && !p.url.startsWith('blob:'))
        .slice(0, 16)
        .map(p => ({ u: p.url, l: p.location, c: p.caption, d: p.day, t: p.tag, la: p.lat, ln: p.lng }));

      const compactPayload = {
        t: journey.tripTitle,
        n: journey.travelerName,
        s: journey.summary,
        p: safePhotos,
      };

      const base64Str = btoa(unescape(encodeURIComponent(JSON.stringify(compactPayload))));
      const candidate = `${baseHost}/diary/view?data=${encodeURIComponent(base64Str)}`;
      if (candidate.length <= 2600) {
        encodedDataUrl = candidate;
      }
    } catch { /* fallback to short ID */ }

    // Direct local link for same-browser preview testing
    const localDevUrl = `${window.location.origin}/diary/view?id=${shareId}`;

    return {
      publicUrl: encodedDataUrl,
      localDevUrl: localDevUrl,
      qrUrl: encodedDataUrl, // Universal QR link that opens in any mobile browser
      isLocalhost
    };
  },

  decodeFromUrl(dataParam) {
    try {
      const decoded = decodeURIComponent(escape(atob(decodeURIComponent(dataParam))));
      const compact = JSON.parse(decoded);
      return {
        id: `decoded_${Date.now()}`,
        tripTitle: compact.t || 'Shared Journey',
        travelerName: compact.n || 'SafarX Traveler',
        summary: compact.s || '',
        totalSpots: compact.p?.length || 0,
        photos: (compact.p || []).map((p, idx) => ({
          id: `dp_${idx}`,
          url: p.u, location: p.l, caption: p.c, day: p.d, tag: p.t,
          lat: p.la, lng: p.ln, date: 'Recorded Story'
        }))
      };
    } catch { return null; }
  }
};
