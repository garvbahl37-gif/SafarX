/**
 * GoogleEarthExplorer — SafarX "Orbital view".
 *
 * Search any Indian place, drop into satellite imagery, and browse
 * high-resolution photography of the site. Styled to the Peacock & Gold
 * system: ink glass chrome, gold accents, Fraunces place names,
 * Space Grotesk coordinates.
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Search,
  Globe,
  MapPin,
  Navigation,
  RotateCcw,
  Maximize2,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Camera,
  ArrowLeft,
  Compass,
  ImageOff,
} from "lucide-react";
import {
  CompassLoader,
  GlassButton,
  GlassIconButton,
  ViewportHud,
  StateNotice,
} from "./VirtualTour/ImmersiveChrome";
import { EASE, formatCoords } from "./VirtualTour/immersiveUtils";
import LoopVideo from './media/LoopVideo';

/** Indian landmarks the orbital view opens with. */
const SUGGESTED_PLACES = [
  { name: "Taj Mahal", location: "Agra, Uttar Pradesh", query: "Taj Mahal, Agra", wiki: "Taj Mahal", lat: 27.1751, lng: 78.0421 },
  { name: "Amber Fort", location: "Jaipur, Rajasthan", query: "Amber Fort, Jaipur", wiki: "Amer Fort", lat: 26.9855, lng: 75.8513 },
  { name: "Hampi", location: "Ballari, Karnataka", query: "Hampi, Karnataka", wiki: "Hampi", lat: 15.335, lng: 76.46 },
  { name: "Golden Temple", location: "Amritsar, Punjab", query: "Golden Temple, Amritsar", wiki: "Golden Temple", lat: 31.62, lng: 74.8765 },
  { name: "Varanasi ghats", location: "Varanasi, Uttar Pradesh", query: "Dashashwamedh Ghat, Varanasi", wiki: "Ghats in Varanasi", lat: 25.3072, lng: 83.0104 },
  { name: "Mehrangarh", location: "Jodhpur, Rajasthan", query: "Mehrangarh Fort, Jodhpur", wiki: "Mehrangarh", lat: 26.298, lng: 73.0186 },
  { name: "Konark Sun Temple", location: "Puri, Odisha", query: "Konark Sun Temple", wiki: "Konark Sun Temple", lat: 19.8876, lng: 86.0945 },
  { name: "Meenakshi Temple", location: "Madurai, Tamil Nadu", query: "Meenakshi Temple, Madurai", wiki: "Meenakshi Temple", lat: 9.9195, lng: 78.1193 },
  { name: "Alleppey backwaters", location: "Alappuzha, Kerala", query: "Alappuzha backwaters, Kerala", wiki: "Alappuzha", lat: 9.4981, lng: 76.3388 },
  { name: "Gateway of India", location: "Mumbai, Maharashtra", query: "Gateway of India, Mumbai", wiki: "Gateway of India", lat: 18.922, lng: 72.8347 },
  { name: "Nubra Valley", location: "Ladakh", query: "Nubra Valley, Ladakh", wiki: "Nubra Valley", lat: 34.68, lng: 77.56 },
  { name: "Sundarbans", location: "South 24 Parganas, West Bengal", query: "Sundarbans National Park", wiki: "Sundarbans", lat: 21.9497, lng: 88.9468 },
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

const GoogleEarthExplorer = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [activeCoords, setActiveCoords] = useState(null);
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

  const reduce = useReducedMotion();
  const rise = (y = 20) => (reduce ? { opacity: 0 } : { opacity: 0, y });

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
        const c = f.geometry?.coordinates || [];
        return {
          name: p.name || query,
          description: [p.city, p.state, p.country].filter(Boolean).join(", "),
          type: (p.osm_value || p.type || "").replace(/_/g, " "),
          lat: c[1],
          lng: c[0],
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

  const handleSearch = (query = searchQuery, coords = null) => {
    if (!query.trim()) return;
    const q = query.trim();
    setIsLoading(true);
    setActiveQuery(q);
    setActiveCoords(coords);
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
    handleSearch(place.query, { lat: place.lat, lng: place.lng });
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
        const s = suggestions[selectedSuggestionIdx];
        handleSearch(s.name, { lat: s.lat, lng: s.lng });
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
    handleSearch(place.name, { lat: place.lat, lng: place.lng });
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

  // Lightbox keyboard navigation
  const closeLightbox = useCallback(() => setLightboxIdx(-1), []);
  useEffect(() => {
    if (lightboxIdx < 0) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") setLightboxIdx((i) => Math.min(i + 1, placeImages.length - 1));
      if (e.key === "ArrowLeft") setLightboxIdx((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIdx, placeImages.length, closeLightbox]);

  const mapsEmbedUrl = activeQuery
    ? `https://www.google.com/maps?q=${encodeURIComponent(activeQuery)}&t=k&z=17&ie=UTF8&iwloc=&output=embed`
    : "";

  /* Mysore Palace and its formal gardens on a slow drone push — the frame the
     headline is actually describing, and one that survives being blown up to
     fill a hero. The two clips before it did not: a 960x540 remote file, then
     a Charminar aerial that was mostly haze and grey rooftops. Palace footage
     holds its colour and its symmetry, so the hero reads as heritage rather
     than as a city seen through smog. */
  const BG_VIDEO_URL = "/media/earth-mysore-palace.mp4";

  const coordReadout = activeCoords
    ? formatCoords(activeCoords.lat, activeCoords.lng)
    : null;

  return (
    <div className="relative min-h-screen bg-ink-950 font-sans text-ivory">
      {/* ── Background ── */}
      <div className="absolute inset-0 z-0 overflow-hidden film-grain vignette" aria-hidden="true">
        {BG_VIDEO_URL && (
          <LoopVideo
            src={BG_VIDEO_URL}
            className="absolute inset-0 h-full w-full object-cover opacity-95 video-crisp"
          />
        )}

        {/* One legibility scrim, weighted to the bottom where the copy sits —
            the previous three stacked overlays crushed the footage to black. */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/50 via-ink-950/30 to-ink-950" />
        {/* Pool of shade under the headline and search, so type stays legible
            while the edges of the frame keep their detail. */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_58%_46%_at_50%_50%,rgba(6,20,18,0.72)_0%,rgba(6,20,18,0.35)_55%,transparent_78%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(212,168,67,0.09)_0%,transparent_60%)]" />
      </div>

      {/* ── Hero / search ── */}
      <section className="relative flex min-h-[86vh] items-center justify-center px-6 pb-28 pt-24">
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <Motion.div
            initial={rise(16)}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/[0.09] bg-ink-950/60 px-5 py-2 backdrop-blur-xl"
          >
            <span className="route-dot animate-pulse" aria-hidden="true" />
            <span className="font-data text-[11px] uppercase tracking-[0.26em] text-saffron">
              Orbital view
            </span>
            <span className="h-3 w-px bg-white/15" aria-hidden="true" />
            <span className="font-data text-[11px] uppercase tracking-[0.18em] text-ivory-faint">
              20.59° N · 78.96° E
            </span>
          </Motion.div>

          <Motion.h2
            initial={rise(26)}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease: EASE }}
            className="mb-5 font-display text-4xl font-light leading-[1.04] tracking-tight text-ivory md:text-7xl"
          >
            See India{" "}
            <em className="font-medium italic text-saffron-bright">from above</em>
          </Motion.h2>

          <Motion.p
            initial={rise(18)}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.16, ease: EASE }}
            className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-ivory-muted md:text-lg"
          >
            Circle a fort, a ghat, or a coastline from a satellite's seat — live
            satellite imagery, high-resolution photography, and a jump straight
            into Google Earth 3D.
          </Motion.p>

          {/* Search */}
          <Motion.div
            initial={rise(18)}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.24, ease: EASE }}
            className="mx-auto mb-6 max-w-2xl"
          >
            <div className="relative z-20">
              <div
                className={`relative flex items-center rounded-full border bg-ink-900/80 p-2 backdrop-blur-2xl transition-colors duration-500 ${focused
                  ? "border-saffron/40 shadow-2xl"
                  : "border-white/[0.09] hover:border-white/20"
                  }`}
              >
                <div className="pl-4 pr-2">
                  {isLoading ? (
                    <Compass className="h-5 w-5 animate-spin text-saffron" aria-hidden="true" />
                  ) : (
                    <Search
                      className={`h-5 w-5 transition-colors duration-300 ${focused ? "text-saffron" : "text-ivory-faint"}`}
                      aria-hidden="true"
                    />
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
                  placeholder="Try the Taj Mahal, Hampi, or Mehrangarh"
                  aria-label="Search for a place to view from orbit"
                  className="flex-1 border-none bg-transparent px-3 py-4 text-lg font-medium text-ivory placeholder-ivory-faint outline-none"
                  autoComplete="off"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(""); setSuggestions([]); setShowSuggestions(false); inputRef.current?.focus(); }}
                    aria-label="Clear search"
                    className="p-2 text-ivory-faint transition-colors hover:text-ivory"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleSearch()}
                  disabled={isLoading || !searchQuery.trim()}
                  className="ml-1 flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-b from-saffron-bright to-saffron px-6 py-3.5 text-sm font-bold tracking-wide text-ink-950 transition-opacity disabled:cursor-not-allowed disabled:opacity-30 sm:px-8"
                >
                  <span>{isLoading ? "Rising…" : "Take me up"}</span>
                  <Navigation className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Autocomplete */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <Motion.div
                  ref={suggestionsRef}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.24, ease: EASE }}
                  className="absolute left-0 right-0 top-full z-50 mt-3 overflow-hidden rounded-3xl border border-white/[0.09] bg-ink-900/95 p-2 shadow-2xl backdrop-blur-3xl"
                  role="listbox"
                  aria-label="Place suggestions"
                >
                  {suggestions.map((place, idx) => (
                    <button
                      key={`${place.name}-${idx}`}
                      type="button"
                      role="option"
                      aria-selected={idx === selectedSuggestionIdx}
                      onClick={() => selectSuggestion(place)}
                      onMouseEnter={() => setSelectedSuggestionIdx(idx)}
                      className={`group/item flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left transition-colors duration-200 ${idx === selectedSuggestionIdx ? "bg-white/[0.06]" : "hover:bg-white/[0.04]"}`}
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${idx === selectedSuggestionIdx
                          ? "border-saffron/30 bg-saffron/10"
                          : "border-white/[0.07] bg-white/[0.04] group-hover/item:border-saffron/25"
                          }`}
                      >
                        <MapPin
                          className={`h-4 w-4 transition-colors ${idx === selectedSuggestionIdx ? "text-saffron" : "text-ivory-faint group-hover/item:text-saffron"}`}
                          aria-hidden="true"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ivory">
                          {place.name}
                        </span>
                        <span className="block truncate font-data text-[11px] uppercase tracking-[0.12em] text-ivory-faint">
                          {place.description || formatCoords(place.lat, place.lng) || "Location"}
                        </span>
                      </span>
                      {place.type && (
                        <span className="shrink-0 rounded-md border border-white/[0.09] bg-white/[0.04] px-2 py-0.5 font-data text-[9px] uppercase tracking-[0.14em] text-ivory-faint">
                          {place.type}
                        </span>
                      )}
                    </button>
                  ))}
                  {isFetchingSuggestions && (
                    <div className="flex items-center justify-center gap-2 border-t border-white/[0.06] py-3">
                      <span className="route-dot animate-pulse" aria-hidden="true" />
                      <span className="font-data text-[10px] uppercase tracking-[0.22em] text-ivory-faint">
                        Searching
                      </span>
                    </div>
                  )}
                </Motion.div>
              )}
            </AnimatePresence>
          </Motion.div>
        </div>
      </section>

      {/* ── Satellite viewer ── */}
      <AnimatePresence>
        {activeQuery && (
          <Motion.section
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 32 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="relative z-10 px-6 pb-12"
          >
            <div
              ref={containerRef}
              className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-white/[0.07] bg-ink-900/70 shadow-2xl backdrop-blur-xl"
            >
              {/* Viewer header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] bg-ink-950/80 px-4 py-3.5 backdrop-blur-xl md:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  {onBack && (
                    <GlassButton icon={ArrowLeft} onClick={onBack} className="mr-1">
                      <span className="hidden sm:inline">Street view</span>
                      <span className="sm:hidden">Back</span>
                    </GlassButton>
                  )}
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-saffron/30 bg-saffron/10">
                    <Globe className="h-4 w-4 text-saffron" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-base font-medium italic text-ivory">
                      {activeQuery}
                    </h3>
                    <p className="font-data text-[10px] uppercase tracking-[0.2em] text-ivory-faint">
                      {coordReadout || "Satellite imagery"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <GlassButton icon={Globe} tone="gold" onClick={openInGoogleEarth}>
                    <span className="hidden md:inline">Open in Google Earth 3D</span>
                    <span className="md:hidden">Earth 3D</span>
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </GlassButton>
                  <GlassIconButton
                    icon={RotateCcw}
                    label="Reload satellite view"
                    onClick={() => handleSearch(activeQuery, activeCoords)}
                  />
                  <GlassIconButton
                    icon={Maximize2}
                    label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    pressed={isFullscreen}
                    onClick={toggleFullscreen}
                  />
                  <GlassIconButton
                    icon={X}
                    label="Close satellite view"
                    onClick={() => { setActiveQuery(""); setActiveCoords(null); }}
                  />
                </div>
              </div>

              {/* Loading veil */}
              <AnimatePresence>
                {isLoading && (
                  <Motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="absolute inset-0 z-20 flex items-center justify-center bg-ink-950/90 backdrop-blur-sm"
                  >
                    <CompassLoader
                      label="Bringing the satellite overhead"
                      detail={coordReadout || activeQuery}
                    />
                  </Motion.div>
                )}
              </AnimatePresence>

              {/* Heads-up readout */}
              {!isLoading && (
                <ViewportHud
                  badge="Live satellite"
                  name={activeQuery}
                  coords={coordReadout}
                  meta="Google Earth · imagery"
                  className="absolute bottom-5 left-5 z-20"
                />
              )}

              <iframe
                src={mapsEmbedUrl}
                onLoad={handleIframeLoad}
                className="w-full bg-ink-950"
                style={{ height: "70vh", border: "none" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Satellite view of ${activeQuery}`}
              />
            </div>
          </Motion.section>
        )}
      </AnimatePresence>

      {/* ── Photography ── */}
      <AnimatePresence>
        {activeQuery && (
          <Motion.section
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="relative z-10 px-6 pb-12"
          >
            <div className="mx-auto max-w-7xl">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <Camera className="h-4 w-4 text-saffron" aria-hidden="true" />
                <h3 className="font-display text-xl font-medium text-ivory">
                  Photographs of{" "}
                  <em className="italic text-saffron-bright">{activeQuery}</em>
                </h3>
                {!isLoadingImages && placeImages.length > 0 && (
                  <span className="rounded-full border border-white/[0.09] px-3 py-1 font-data text-[10px] uppercase tracking-[0.18em] text-ivory-faint">
                    {placeImages.length} frames
                  </span>
                )}
              </div>

              {isLoadingImages ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {[...Array(15)].map((_, i) => (
                    <div
                      key={i}
                      className="shimmer aspect-[4/3] rounded-2xl border border-white/[0.05] bg-ink-800"
                    />
                  ))}
                </div>
              ) : placeImages.length === 0 ? (
                <div className="rounded-3xl border border-white/[0.07] bg-ink-900/60 py-16">
                  <StateNotice
                    icon={ImageOff}
                    title="No photographs found for this spot"
                    body="Wikimedia Commons has nothing catalogued under this name yet. Try the nearest town or the monument's full name — for example, “Mehrangarh Fort, Jodhpur”."
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {placeImages.map((img, idx) => (
                    <Motion.button
                      key={img.thumb}
                      type="button"
                      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: Math.min(idx * 0.03, 0.6), ease: EASE }}
                      onClick={() => setLightboxIdx(idx)}
                      aria-label={`Open ${img.title} full size`}
                      className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/[0.07] text-left transition-colors duration-500 hover:border-saffron/35"
                    >
                      <img
                        src={img.thumb}
                        alt={img.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      <span className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <span className="absolute inset-x-0 bottom-0 translate-y-full p-3 transition-transform duration-300 group-hover:translate-y-0">
                        <span className="block truncate text-xs font-semibold text-ivory">{img.title}</span>
                        <span className="block truncate font-data text-[10px] uppercase tracking-[0.12em] text-ivory-faint">
                          {img.artist}
                        </span>
                      </span>
                      <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.12] bg-ink-950/70 opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">
                        <Maximize2 className="h-3 w-3 text-saffron" aria-hidden="true" />
                      </span>
                    </Motion.button>
                  ))}
                </div>
              )}
            </div>
          </Motion.section>
        )}
      </AnimatePresence>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxIdx >= 0 && placeImages[lightboxIdx] && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-ink-950/96 backdrop-blur-xl"
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label={placeImages[lightboxIdx].title}
          >
            <GlassIconButton
              icon={X}
              label="Close photo"
              onClick={closeLightbox}
              className="absolute right-6 top-6 z-10 !h-11 !w-11"
            />
            {lightboxIdx > 0 && (
              <GlassIconButton
                icon={ChevronLeft}
                label="Previous photo"
                onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => i - 1); }}
                className="absolute left-4 z-10 !h-11 !w-11 md:left-8"
              />
            )}
            {lightboxIdx < placeImages.length - 1 && (
              <GlassIconButton
                icon={ChevronRight}
                label="Next photo"
                onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => i + 1); }}
                className="absolute right-4 z-10 !h-11 !w-11 md:right-8"
              />
            )}
            <Motion.div
              key={lightboxIdx}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="relative max-h-[85vh] max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={placeImages[lightboxIdx].full}
                alt={placeImages[lightboxIdx].title}
                className="max-h-[80vh] max-w-full rounded-2xl border border-white/[0.07] object-contain shadow-2xl"
              />
              <div className="absolute inset-x-0 bottom-0 rounded-b-2xl bg-gradient-to-t from-ink-950 via-ink-950/70 to-transparent p-5">
                <p className="font-display text-lg font-medium italic text-ivory">
                  {placeImages[lightboxIdx].title}
                </p>
                <p className="mt-1 font-data text-[10px] uppercase tracking-[0.18em] text-ivory-faint">
                  {placeImages[lightboxIdx].artist}
                </p>
              </div>
              <div className="absolute right-4 top-4 rounded-full border border-white/[0.09] bg-ink-950/70 px-3 py-1 font-data text-[10px] uppercase tracking-[0.18em] text-ivory-muted backdrop-blur-md">
                {lightboxIdx + 1} / {placeImages.length}
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* ── Preset destinations ── */}
      <section className="relative z-10 px-6 pb-20 pt-16">
        <div className="mx-auto max-w-7xl">
          <Motion.div
            initial={rise(16)}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
            className="mb-8"
          >
            <p className="eyebrow mb-3">Start here</p>
            <h3 className="font-display text-2xl font-light text-ivory md:text-3xl">
              Twelve Indian sites worth{" "}
              <em className="font-medium italic text-saffron-bright">an orbit</em>
            </h3>
          </Motion.div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {SUGGESTED_PLACES.map((place, index) => {
              const thumbUrl = cardThumbs[place.wiki];
              const isActive = activeQuery === place.query;
              return (
                <Motion.button
                  key={place.name}
                  type="button"
                  initial={rise(16)}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: Math.min(0.04 * index, 0.5), ease: EASE }}
                  onClick={() => handleSuggestedClick(place)}
                  aria-pressed={isActive}
                  aria-label={`View ${place.name}, ${place.location} from orbit`}
                  className={`heritage-card group relative text-left ${isActive ? "!border-saffron/45" : ""}`}
                >
                  <div className="relative aspect-square overflow-hidden bg-ink-800">
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={`${place.name}, ${place.location}`}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ink-800 to-ink-900">
                        <Globe className="h-7 w-7 text-saffron/40" aria-hidden="true" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-transparent" />
                  </div>
                  <div className="bg-ink-800 p-3">
                    <h4 className="truncate font-display text-sm font-medium italic text-ivory">
                      {place.name}
                    </h4>
                    <p className="mt-1 truncate font-data text-[9px] uppercase tracking-[0.14em] text-ivory-faint">
                      {formatCoords(place.lat, place.lng)}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-ivory-muted">
                      <MapPin className="h-3 w-3 shrink-0 text-saffron/70" aria-hidden="true" />
                      {place.location}
                    </p>
                  </div>
                  {isActive && (
                    <span className="route-dot absolute right-2.5 top-2.5 animate-pulse" aria-hidden="true" />
                  )}
                </Motion.button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default GoogleEarthExplorer;
