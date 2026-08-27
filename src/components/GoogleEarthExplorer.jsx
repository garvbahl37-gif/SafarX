import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Globe,
  MapPin,
  Navigation,
  Loader2,
  Sparkles,
  RotateCcw,
  Maximize2,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Camera,
  ArrowLeft,
} from "lucide-react";

const SUGGESTED_PLACES = [
  { name: "Eiffel Tower", location: "Paris, France", query: "Eiffel Tower, Paris", wiki: "Eiffel Tower" },
  { name: "Taj Mahal", location: "Agra, India", query: "Taj Mahal, Agra", wiki: "Taj Mahal" },
  { name: "Grand Canyon", location: "Arizona, USA", query: "Grand Canyon, Arizona", wiki: "Grand Canyon" },
  { name: "Great Wall of China", location: "Beijing, China", query: "Great Wall of China", wiki: "Great Wall of China" },
  { name: "Machu Picchu", location: "Cusco, Peru", query: "Machu Picchu, Peru", wiki: "Machu Picchu" },
  { name: "Colosseum", location: "Rome, Italy", query: "Colosseum, Rome", wiki: "Colosseum" },
  { name: "Santorini", location: "Greece", query: "Santorini, Greece", wiki: "Santorini" },
  { name: "Mount Fuji", location: "Japan", query: "Mount Fuji, Japan", wiki: "Mount Fuji" },
  { name: "Petra", location: "Jordan", query: "Petra, Jordan", wiki: "Petra" },
  { name: "Angkor Wat", location: "Cambodia", query: "Angkor Wat, Cambodia", wiki: "Angkor Wat" },
  { name: "Niagara Falls", location: "Canada/USA", query: "Niagara Falls", wiki: "Niagara Falls" },
  { name: "Sydney Opera House", location: "Sydney, Australia", query: "Sydney Opera House", wiki: "Sydney Opera House" },
];

// Fetch images from Wikimedia Commons
const fetchWikimediaImages = async (query, limit = 50) => {
  const res = await fetch(
    `https://commons.wikimedia.org/w/api.php?action=query&generator=search` +
    `&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}` +
    `&gsrlimit=${limit}&prop=imageinfo&iiprop=url|extmetadata|mime|dimensions` +
    `&iiurlwidth=800&format=json&origin=*`
  );
  const data = await res.json();
  const pages = data?.query?.pages;
  if (!pages) return [];

  return Object.values(pages)
    .filter((p) => {
      const mime = p.imageinfo?.[0]?.mime || "";
      const w = p.imageinfo?.[0]?.thumbwidth || 0;
      return mime.startsWith("image/") && !mime.includes("svg") && w > 300;
    })
    .map((p) => ({
      thumb: p.imageinfo[0]?.thumburl || p.imageinfo[0]?.url,
      full: p.imageinfo[0]?.url,
      title: (p.title || "").replace("File:", "").replace(/\.[^.]+$/, "").replace(/_/g, " "),
      artist:
        p.imageinfo[0]?.extmetadata?.Artist?.value?.replace(/<[^>]*>/g, "") ||
        "Wikimedia Commons",
      width: p.imageinfo[0]?.thumbwidth || 800,
    }))
    .filter((img) => img.thumb);
};

const GoogleEarthExplorer = ({ activeTab, onTabChange, onBack }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focused, setFocused] = useState(false);
  const [selectedSuggestionIdx, setSelectedSuggestionIdx] = useState(-1);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [placeImages, setPlaceImages] = useState([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(-1);
  const [cardThumbs, setCardThumbs] = useState({});

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  // Wikipedia thumbnails for preset cards
  useEffect(() => {
    const titles = SUGGESTED_PLACES.map((p) => p.wiki).join("|");
    fetch(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(titles)}&prop=pageimages&pithumbsize=400&format=json&origin=*`
    )
      .then((r) => r.json())
      .then((data) => {
        const pages = data?.query?.pages;
        if (!pages) return;
        const thumbMap = {};
        Object.values(pages).forEach((p) => {
          if (p.thumbnail?.source) thumbMap[p.title] = p.thumbnail.source;
        });
        setCardThumbs(thumbMap);
      })
      .catch(() => { });
  }, []);

  // Photon geocoder autocomplete
  const fetchSuggestions = async (query) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setIsFetchingSuggestions(true);
    try {
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8&lang=en`,
        { signal: abortRef.current.signal }
      );
      const data = await res.json();
      const results = (data?.features || []).map((f) => {
        const p = f.properties || {};
        return {
          name: p.name || query,
          description: [p.city, p.state, p.country].filter(Boolean).join(", "),
          type: (p.osm_value || p.type || "").replace(/_/g, " "),
        };
      });
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (err) {
      if (err.name !== "AbortError") console.warn("Photon error:", err);
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  const handleSearch = (query = searchQuery) => {
    if (!query.trim()) return;
    const q = query.trim();
    setIsLoading(true);
    setActiveQuery(q);
    setSearchQuery(q);
    setShowSuggestions(false);
    fetchPlaceImages(q);
    window.open(
      `https://earth.google.com/web/search/${encodeURIComponent(q)}`,
      "_blank"
    );
  };

  const fetchPlaceImages = async (query) => {
    setIsLoadingImages(true);
    setPlaceImages([]);
    try {
      const [primary, secondary] = await Promise.all([
        fetchWikimediaImages(query, 50),
        fetchWikimediaImages(`${query} landmark view`, 30),
      ]);
      const seen = new Set();
      const merged = [...primary, ...secondary].filter((img) => {
        if (seen.has(img.thumb)) return false;
        seen.add(img.thumb);
        return true;
      });
      setPlaceImages(merged.slice(0, 30));
    } catch (err) {
      console.warn("Image fetch error:", err);
      setPlaceImages([]);
    } finally {
      setIsLoadingImages(false);
    }
  };

  const handleSuggestedClick = (place) => {
    setSearchQuery(place.query);
    handleSearch(place.query);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedSuggestionIdx(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestionIdx((p) => (p < suggestions.length - 1 ? p + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIdx((p) => (p > 0 ? p - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      if (selectedSuggestionIdx >= 0 && suggestions[selectedSuggestionIdx]) {
        handleSearch(suggestions[selectedSuggestionIdx].name);
      } else {
        handleSearch();
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (place) => {
    setSearchQuery(place.name);
    setShowSuggestions(false);
    handleSearch(place.name);
  };

  useEffect(() => {
    const handler = (e) => {
      if (
        suggestionsRef.current && !suggestionsRef.current.contains(e.target) &&
        inputRef.current && !inputRef.current.contains(e.target)
      ) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleIframeLoad = () => setIsLoading(false);

  const openInGoogleEarth = () => {
    if (activeQuery)
      window.open(`https://earth.google.com/web/search/${encodeURIComponent(activeQuery)}`, "_blank");
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) containerRef.current?.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const mapsEmbedUrl = activeQuery
    ? `https://www.google.com/maps?q=${encodeURIComponent(activeQuery)}&t=k&z=17&ie=UTF8&iwloc=&output=embed`
    : "";

  const BG_VIDEO_URL = "https://res.cloudinary.com/dnmhqosoa/video/upload/q_auto:best,f_auto/v1772895382/1851190-uhd_3840_2160_25fps_vpbivx.mp4";

  return (
    <div className="relative min-h-screen bg-[#020617] text-white font-sans">
      {/* ── Background Layer ── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Video Background */}
        {BG_VIDEO_URL && (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
            src={BG_VIDEO_URL}
          />
        )}

        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/30 via-transparent to-[#020617]/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.12)_0%,transparent_70%)]" />

        {/* Mesh Gradient overlay */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(at 0% 0%, hsla(199,100%,33%,1) 0, transparent 50%), 
                             radial-gradient(at 50% 0%, hsla(187,100%,42%,1) 0, transparent 50%), 
                             radial-gradient(at 100% 0%, hsla(242,100%,70%,1) 0, transparent 50%)`
        }} />
      </div>

      {/* ── Hero / Search ──────────────────────────────────────────────────── */}
      <section className="relative min-h-screen py-20 px-6 pb-48 flex items-center justify-center">

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center pt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-8 backdrop-blur-md"
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-slate-200 tracking-wide uppercase">SafarX Orbital™</span>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-7xl font-heritage font-bold mb-4 drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)] filter"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-saffron-bright via-saffron to-saffron-deep">
              See Earth From Above
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto mb-10"
          >
            Explore any destination from orbit — high-resolution satellite imagery, 4K place photography, and full Google Earth 3D integration.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-2xl mx-auto mb-6"
          >
            <div className="relative z-20">
              {/* Shadow layer for depth */}
              <div className={`absolute inset-0 rounded-[22px] transition-opacity duration-700 pointer-events-none 
                    ${focused ? "opacity-10 shadow-[0_0_40px_rgba(6,182,212,0.2)]" : "opacity-0"}`} />

              {/* Main search capsule */}
              <div className={`relative flex items-center p-2 rounded-[22px] transition-all duration-500 backdrop-blur-2xl border 
                    ${focused
                  ? "bg-white/10 border-white/20 shadow-2xl"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"}`}
              >
                <div className="pl-4 pr-2">
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                  ) : (
                    <Search className={`w-5 h-5 transition-colors duration-300 ${focused ? "text-cyan-400" : "text-white/30"}`} />
                  )}
                </div>

                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => { setFocused(true); if (suggestions.length > 0) setShowSuggestions(true); }}
                  onBlur={() => setTimeout(() => setFocused(false), 200)}
                  placeholder="Search any place... (e.g. Eiffel Tower, Taj Mahal)"
                  className="flex-1 bg-transparent py-4 px-3 text-white text-lg placeholder-white/20 outline-none focus:outline-none focus:ring-0 border-none font-medium"
                  style={{ outline: 'none', boxShadow: 'none' }}
                  autoComplete="off"
                />

                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(""); setSuggestions([]); setShowSuggestions(false); inputRef.current?.focus(); }}
                    className="p-2 text-white/30 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSearch()}
                  disabled={isLoading || !searchQuery.trim()}
                  className="group relative overflow-hidden bg-white text-black px-8 py-3.5 rounded-[16px] font-bold text-sm tracking-wide transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed flex items-center gap-2 shrink-0 ml-1"
                >
                  <span className="relative z-10 transition-colors duration-300 group-hover:text-black">
                    {isLoading ? "Exploring..." : "Explore"}
                  </span>
                  <Navigation className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </div>

            {/* Autocomplete Dropdown */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  ref={suggestionsRef}
                  initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                  animate={{ opacity: 1, y: 0, scaleY: 1 }}
                  exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 right-0 top-full mt-2 z-50 bg-slate-900/95 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/50"
                  style={{ transformOrigin: "top" }}
                >
                  {suggestions.map((place, idx) => (
                    <button
                      key={`${place.name}-${idx}`}
                      onClick={() => selectSuggestion(place)}
                      onMouseEnter={() => setSelectedSuggestionIdx(idx)}
                      className={`w-full text-left px-5 py-4 hover:bg-white/5 rounded-2xl flex items-center gap-4 transition-all duration-200 group/item ${idx === selectedSuggestionIdx ? "bg-white/5" : ""}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${idx === selectedSuggestionIdx ? "bg-cyan-500/10 border-cyan-500/20" : "bg-white/5 border-white/5 group-hover/item:bg-cyan-500/10 group-hover/item:border-cyan-500/20"}`}>
                        <MapPin className={`w-4 h-4 transition-all ${idx === selectedSuggestionIdx ? "text-cyan-400 scale-110" : "text-white/40 group-hover/item:text-cyan-400 group-hover/item:scale-110"}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-semibold truncate transition-colors ${idx === selectedSuggestionIdx ? "text-white" : "text-white/90 group-hover/item:text-white"}`}>
                          {place.name}
                        </p>
                        <p className="text-[11px] text-white/30 truncate font-medium">
                          {place.description || "Explore location"}
                        </p>
                      </div>
                      {place.type && (
                        <span className="text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded-md capitalize flex-shrink-0 border border-white/5">{place.type}</span>
                      )}
                    </button>
                  ))}
                  {isFetchingSuggestions && (
                    <div className="flex items-center justify-center py-3 border-t border-white/5">
                      <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                      <span className="ml-2 text-xs text-slate-500">Searching...</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section >

      {/* ── Map Viewer ─────────────────────────────────────────────────────── */}
      < AnimatePresence >
        {activeQuery && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.6 }}
            className="px-6 pb-12"
          >
            <div
              ref={containerRef}
              className="max-w-7xl mx-auto relative rounded-3xl overflow-hidden border border-white/10 bg-slate-900/50 shadow-2xl shadow-black/50"
            >
              {/* Viewer Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-slate-900/80 border-b border-white/5 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  {/* Back to VR Tours — only shown when onBack is provided */}
                  {onBack && (
                    <button
                      onClick={onBack}
                      className="flex items-center gap-2 bg-white/5 hover:bg-emerald-600/80 text-white px-3 py-2 rounded-xl border border-white/10 hover:border-emerald-500/50 text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 mr-1"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Back to Immersive</span>
                    </button>
                  )}
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-saffron-bright to-saffron flex items-center justify-center">
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{activeQuery}</h3>
                    <p className="text-xs text-slate-500">Satellite View</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={openInGoogleEarth}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Open in Google Earth 3D</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleSearch(activeQuery)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                    title="Reload"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                    title="Fullscreen"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveQuery("")}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Loading Overlay */}
              {isLoading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-white/10 border-t-cyan-400 rounded-full animate-spin" />
                      <Globe className="w-6 h-6 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium tracking-wide">Loading satellite view...</p>
                  </div>
                </div>
              )}

              <iframe
                src={mapsEmbedUrl}
                onLoad={handleIframeLoad}
                className="w-full bg-slate-950"
                style={{ height: "70vh", border: "none" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Satellite View - ${activeQuery}`}
              />
            </div>
          </motion.section>
        )}
      </AnimatePresence >

      {/* ── Image Gallery ──────────────────────────────────────────────────── */}
      < AnimatePresence >
        {activeQuery && (placeImages.length > 0 || isLoadingImages) && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.5 }}
            className="px-6 pb-12"
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center space-x-3 mb-6">
                <Camera className="w-5 h-5 text-cyan-400" />
                <h3 className="text-xl font-bold text-white">Photos of {activeQuery}</h3>
                {isLoadingImages && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />}
                {!isLoadingImages && placeImages.length > 0 && (
                  <span className="text-xs text-slate-500 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    {placeImages.length} photos
                  </span>
                )}
              </div>

              {isLoadingImages && placeImages.length === 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {[...Array(15)].map((_, i) => (
                    <div key={i} className="aspect-[4/3] rounded-2xl bg-slate-800/50 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {placeImages.map((img, idx) => (
                    <motion.div
                      key={img.thumb}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, delay: Math.min(idx * 0.03, 0.6) }}
                      onClick={() => setLightboxIdx(idx)}
                      className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer border border-white/5 hover:border-cyan-500/40 transition-all duration-500 hover:shadow-[0_0_40px_rgba(6,182,212,0.15)] hover:-translate-y-1"
                    >
                      <img
                        src={img.thumb}
                        alt={img.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-xs font-semibold text-white truncate">{img.title}</p>
                        <p className="text-[10px] text-slate-400 truncate">{img.artist}</p>
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/20">
                          <Maximize2 className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence >

      {/* ── Lightbox ───────────────────────────────────────────────────────── */}
      < AnimatePresence >
        {lightboxIdx >= 0 && placeImages[lightboxIdx] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl flex items-center justify-center"
            onClick={() => setLightboxIdx(-1)}
          >
            <button
              onClick={() => setLightboxIdx(-1)}
              className="absolute top-6 right-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/10"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            {lightboxIdx > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => i - 1); }}
                className="absolute left-4 md:left-8 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/10"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
            )}
            {lightboxIdx < placeImages.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => i + 1); }}
                className="absolute right-4 md:right-8 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/10"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            )}
            <motion.div
              key={lightboxIdx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="max-w-[90vw] max-h-[85vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={placeImages[lightboxIdx].full}
                alt={placeImages[lightboxIdx].title}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 rounded-b-lg">
                <p className="text-sm font-bold text-white">{placeImages[lightboxIdx].title}</p>
                <p className="text-xs text-slate-400">📷 {placeImages[lightboxIdx].artist}</p>
              </div>
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-slate-300">
                {lightboxIdx + 1} / {placeImages.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence >

      {/* ── Suggested Places Grid ──────────────────────────────────────────── */}
      <section className="px-6 pt-16 pb-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center space-x-3 mb-8"
          >
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="text-2xl font-bold text-white drop-shadow-lg">Popular Destinations</h3>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {SUGGESTED_PLACES.map((place, index) => {
              const thumbUrl = cardThumbs[place.wiki];
              return (
                <motion.button
                  key={place.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 * index }}
                  onClick={() => handleSuggestedClick(place)}
                  className={`group relative rounded-2xl overflow-hidden border transition-all duration-500 text-left ${activeQuery === place.query
                    ? "border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.2)]"
                    : "border-white/5 hover:border-white/20 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]"
                    } hover:-translate-y-1`}
                >
                  <div className="aspect-square relative overflow-hidden bg-slate-800">
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={place.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-ink-800 to-ink-900">
                        <Globe className="w-8 h-8 text-cyan-400/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                  <div className="p-3 bg-slate-900/90">
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                      {place.name}
                    </h4>
                    <div className="flex items-center space-x-1 mt-1">
                      <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                      <span className="text-[11px] text-slate-500 truncate">{place.location}</span>
                    </div>
                  </div>
                  {activeQuery === place.query && (
                    <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </section >

    </div >
  );
};

export default GoogleEarthExplorer;