import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Heart,
  Share2,
  Compass,
  ArrowRight,
  ArrowUpRight,
  X,
  Star,
  Users,
  Route,
  Signal,
  Footprints,
  Calendar,
  Landmark,
  Lightbulb,
} from "lucide-react";
import { AnimatePresence, motion as Motion } from "framer-motion";

import SectionHeading from "../components/ui/SectionHeading";
import GemSearchBar from "../components/gems/GemSearchBar";
import gemsData from "../data/hiddengems.json";
import { useBookmarks } from "../hooks/useBookmarks";
import GemThumbnail from "../components/gems/GemThumbnail";
import { cdnImage } from "../utils/imageCdn";

const EASE = [0.22, 1, 0.36, 1];

/* Resolve gem image filenames against the bundled assets folder. */
const gemImageModules = import.meta.glob("../assets/hidden-gems/*", {
  eager: true,
  import: "default",
});
/* What a card shows when it has no photograph.
   This was a stock shot of the Taj Mahal, and when Wikimedia started
   rate-limiting the grid every gem on the page fell back to it — ninety-six
   cards captioned Chand Baori and Sandakphu, all showing the Taj. A fallback
   that depicts a real, identifiable place will eventually be shown under the
   wrong name, so this one depicts nothing: an inline gradient in the app's own
   ink and saffron, which also cannot itself fail to load. */
const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="10">
       <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
         <stop offset="0" stop-color="#102822"/>
         <stop offset="1" stop-color="#0A1D1A"/>
       </linearGradient></defs>
       <rect width="16" height="10" fill="url(#g)"/>
     </svg>`
  );

/** Every photograph a gem has, resolved and served through the image CDN.
    503 photographs hotlinked from Wikimedia is precisely the pattern it
    rate-limits — see src/utils/imageCdn.js. */
const imagesFor = (gem) =>
  (gem.images || [])
    .map((file) => resolveImage(file))
    .filter(Boolean)
    .map((url) => cdnImage(url, 640));

const resolveImage = (file) => {
  if (!file) return FALLBACK_IMAGE;
  // Entries added after the local asset set use a full remote URL.
  if (/^https?:\/\//i.test(file)) return file;
  const hit = Object.entries(gemImageModules).find(([path]) =>
    path.endsWith(`/${file}`)
  );
  return hit ? hit[1] : FALLBACK_IMAGE;
};

const imageFor = (gem) => cdnImage(resolveImage(gem.images?.[0]), 640);

const CATEGORY_LABELS = {
  All: "All",
  temple: "Temples",
  fort: "Forts",
  nature: "Nature",
  village: "Villages",
  trek: "Treks",
  beach: "Beaches",
  wildlife: "Wildlife",
  cave: "Caves",
  eatery: "Classic tables",
};

const REGION_LABELS = {
  All: "All regions",
  north: "North",
  south: "South",
  east: "East",
  west: "West",
  central: "Central",
  northeast: "Northeast",
};

const HiddenGemsPage = ({ onPageChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  const [region, setRegion] = useState("All");
  const [stateFilter, setStateFilter] = useState("All");
  const [openGem, setOpenGem] = useState(null);
  const [focusGemId, setFocusGemId] = useState(null);

  const cardRefs = useRef(new Map());

  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();

  const categories = useMemo(
    () => ["All", ...new Set(gemsData.map((g) => g.category))],
    []
  );
  const regions = useMemo(
    () => ["All", ...new Set(gemsData.map((g) => g.region))],
    []
  );

  const displayGems = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return gemsData.filter((gem) => {
      const matchesSearch =
        q === "" ||
        gem.title.toLowerCase().includes(q) ||
        gem.location.toLowerCase().includes(q) ||
        gem.state.toLowerCase().includes(q) ||
        gem.category.toLowerCase().includes(q) ||
        gem.description.toLowerCase().includes(q);
      const matchesCategory = category === "All" || gem.category === category;
      const matchesRegion = region === "All" || gem.region === region;
      const matchesState = stateFilter === "All" || gem.state === stateFilter;
      return matchesSearch && matchesCategory && matchesRegion && matchesState;
    });
  }, [searchTerm, category, region, stateFilter]);

  /* ---------------- filter handlers ---------------- */

  const handleRegionChange = useCallback((next) => {
    setRegion(next);
    setStateFilter("All");
  }, []);

  const handleSelectPlace = useCallback((gem) => {
    setRegion("All");
    setCategory("All");
    setStateFilter("All");
    setSearchTerm(gem.title);
    setFocusGemId(gem.id);
  }, []);

  const handleSelectState = useCallback((next) => {
    setSearchTerm("");
    setRegion("All");
    setStateFilter(next);
  }, []);

  const handleSelectRegion = useCallback((next) => {
    setSearchTerm("");
    setStateFilter("All");
    setRegion(next);
  }, []);

  const handleSelectCategory = useCallback((next) => {
    setSearchTerm("");
    setCategory(next);
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setCategory("All");
    setRegion("All");
    setStateFilter("All");
  }, []);

  const activeFilters = useMemo(() => {
    const chips = [];
    if (searchTerm.trim())
      chips.push({
        key: "search",
        label: `“${searchTerm.trim()}”`,
        clear: () => setSearchTerm(""),
      });
    if (region !== "All")
      chips.push({
        key: "region",
        label: REGION_LABELS[region] || region,
        clear: () => setRegion("All"),
      });
    if (stateFilter !== "All")
      chips.push({
        key: "state",
        label: stateFilter,
        clear: () => setStateFilter("All"),
      });
    if (category !== "All")
      chips.push({
        key: "category",
        label: CATEGORY_LABELS[category] || category,
        clear: () => setCategory("All"),
      });
    return chips;
  }, [searchTerm, region, stateFilter, category]);

  /* Selecting a place from the autocomplete scrolls to its card and opens it. */
  useEffect(() => {
    if (focusGemId === null) return;
    cardRefs.current.get(focusGemId)?.scrollIntoView({ block: "center" });
    const gem = gemsData.find((g) => g.id === focusGemId);
    if (gem) setOpenGem(gem);
    setFocusGemId(null);
  }, [focusGemId]);

  const handleBookmarkToggle = (e, gem) => {
    e.stopPropagation();
    const gemId = `gem-${gem.id}`;
    if (isBookmarked(gemId, "hidden_gem")) {
      removeBookmark(gemId, "hidden_gem");
    } else {
      addBookmark({
        id: gemId,
        type: "hidden_gem",
        title: gem.title,
        description: gem.description,
        state: gem.state,
        images: [imageFor(gem)],
        rating: gem.rating,
        originalGem: gem,
      });
    }
  };

  const handleShare = async (e, gem) => {
    e.stopPropagation();
    const payload = {
      title: `${gem.title} — SafarX`,
      text: `${gem.title}, ${gem.location}. ${gem.description}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(payload);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(
          `${payload.title}\n${payload.text}\n${payload.url}`
        );
      }
    } catch {
      /* user dismissed the share sheet — nothing to do */
    }
  };

  const closeDetail = useCallback(() => setOpenGem(null), []);

  // Escape closes the detail panel
  useEffect(() => {
    if (!openGem) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeDetail();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openGem, closeDetail]);

  return (
    <div className="min-h-screen bg-ink-950 pb-24">
      {/* ======================= HERO ======================= */}
      <section className="relative h-[68vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none bg-ink-900">
          {/* Nohkalikai Falls, Meghalaya — one of the gems in our own data,
              and about as off-the-tourist-map as India gets. */}
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster="https://images.unsplash.com/photo-1571536802807-30451e3955d8?w=1600&auto=format&fit=crop&q=70"
            className="absolute top-1/2 left-1/2 w-[177.77vh] min-w-full min-h-[56.25vw] -translate-x-1/2 -translate-y-1/2 object-cover video-crisp"
          >
            <source
              src="https://videos.pexels.com/video-files/33560749/14268660_2560_1440_60fps.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/28 to-ink-950/25" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto on-media">
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <p className="flex items-center justify-center gap-3 mb-6">
              <span className="route-dot" />
              <span className="eyebrow">Field notes · off every tourist map</span>
            </p>

            <h1 className="font-display text-5xl md:text-7xl font-light text-ivory leading-[1.05] tracking-tight mb-6">
              Hidden gems of{" "}
              <em className="italic font-medium text-saffron-bright">Incredible India</em>
            </h1>

            <p className="text-ivory-muted text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-6">
              Stepwells, ghost towns, cliff temples, and living root bridges — places
              travelers and locals shared before the crowds found them.
            </p>

            <p className="font-data text-[11px] uppercase tracking-[0.2em] text-saffron">
              {displayGems.length} of {gemsData.length} places mapped
            </p>
          </Motion.div>
        </div>
      </section>

      {/* ======================= SEARCH & FILTERS ======================= */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-14 -mt-10 relative z-20">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
          className="max-w-2xl mx-auto"
        >
          <GemSearchBar
            gems={gemsData}
            value={searchTerm}
            onValueChange={setSearchTerm}
            regionLabels={REGION_LABELS}
            categoryLabels={CATEGORY_LABELS}
            onRegionChange={handleRegionChange}
            onSelectPlace={handleSelectPlace}
            onSelectState={handleSelectState}
            onSelectRegion={handleSelectRegion}
            onSelectCategory={handleSelectCategory}
          />
        </Motion.div>

        {/* Category chips */}
        <div
          className="flex flex-wrap justify-center gap-2 mt-6"
          role="group"
          aria-label="Filter gems by category"
        >
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={`font-data text-[11px] uppercase tracking-[0.14em] px-4 py-2 rounded-full border transition-colors duration-300 ${
                category === c
                  ? "bg-saffron text-ink-950 border-saffron"
                  : "border-white/[0.12] text-ivory-muted hover:text-ivory hover:border-saffron/35"
              }`}
            >
              {CATEGORY_LABELS[c] || c}
            </button>
          ))}
        </div>

        {/* Region chips — region used to sit as a native select inside the
            search pill, which brought the browser's own box and arrow with it. */}
        <div
          className="flex flex-wrap justify-center gap-2 mt-3"
          role="group"
          aria-label="Filter gems by region"
        >
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              aria-pressed={region === r}
              className={`font-data text-[10px] uppercase tracking-[0.16em] px-3.5 py-1.5 rounded-full border transition-colors duration-300 ${
                region === r
                  ? "border-saffron/60 bg-saffron/12 text-saffron"
                  : "border-white/[0.08] text-ivory-faint hover:text-ivory-muted hover:border-white/20"
              }`}
            >
              {REGION_LABELS[r] || r}
            </button>
          ))}
        </div>

        {/* Active filters */}
        {activeFilters.length > 0 && (
          <div
            className="flex flex-wrap items-center justify-center gap-2 mt-5"
            aria-label="Active filters"
          >
            <span className="font-data text-[10px] uppercase tracking-[0.2em] text-ivory-faint mr-1">
              Filtering by
            </span>
            {activeFilters.map((chip) => (
              <button
                key={chip.key}
                onClick={chip.clear}
                aria-label={`Remove filter ${chip.label}`}
                className="group flex items-center gap-2 font-data text-[11px] uppercase tracking-[0.12em] px-3 py-1.5 rounded-full border border-saffron/30 bg-saffron/10 text-saffron hover:border-saffron/60 transition-colors duration-300"
              >
                {chip.label}
                <X size={11} className="opacity-70 group-hover:opacity-100" aria-hidden="true" />
              </button>
            ))}
            <button
              onClick={clearAllFilters}
              className="font-data text-[11px] uppercase tracking-[0.12em] px-3 py-1.5 text-ivory-faint hover:text-ivory transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ======================= GEMS GRID ======================= */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-14 mt-14">
        {displayGems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayGems.map((gem, index) => (
              <Motion.article
                key={gem.id}
                ref={(el) => {
                  if (el) cardRefs.current.set(gem.id, el);
                  else cardRefs.current.delete(gem.id);
                }}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.65, delay: (index % 3) * 0.08, ease: EASE }}
                className="group relative bg-ink-800 rounded-2xl overflow-hidden border border-white/[0.07] hover:border-saffron/35 transition-colors duration-500 flex flex-col scroll-mt-28"
              >
                {/* Image */}
                <div className="relative h-60 overflow-hidden">
                  <GemThumbnail
                    images={imagesFor(gem)}
                    alt={`${gem.title}, ${gem.location}`}
                    fallback={FALLBACK_IMAGE}
                    className="transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />

                  {/* Actions */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={(e) => handleBookmarkToggle(e, gem)}
                      aria-label={
                        isBookmarked(`gem-${gem.id}`, "hidden_gem")
                          ? `Remove ${gem.title} from saved places`
                          : `Save ${gem.title}`
                      }
                      className={`p-2 backdrop-blur-md rounded-full transition-colors border ${
                        isBookmarked(`gem-${gem.id}`, "hidden_gem")
                          ? "bg-saffron text-ink-950 border-saffron"
                          : "bg-ink-950/50 text-ivory border-white/[0.12] hover:border-saffron/50 hover:text-saffron"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isBookmarked(`gem-${gem.id}`, "hidden_gem") ? "fill-current" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                    <button
                      onClick={(e) => handleShare(e, gem)}
                      aria-label={`Share ${gem.title}`}
                      className="p-2 bg-ink-950/50 backdrop-blur-md rounded-full text-ivory border border-white/[0.12] hover:border-saffron/50 hover:text-saffron transition-colors"
                    >
                      <Share2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Location eyebrow + name over the scrim */}
                  <div className="absolute bottom-0 inset-x-0 p-5">
                    <p className="eyebrow !text-[10px] mb-1.5">{gem.location}</p>
                    <h2 className="font-display italic text-2xl font-medium text-ivory">
                      {gem.title}
                    </h2>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex flex-col flex-grow">
                  <p className="text-ivory-muted text-sm leading-relaxed line-clamp-3 mb-5">
                    {gem.description}
                  </p>

                  <div className="flex items-center gap-4 font-data text-[11px] tracking-[0.08em] text-ivory/70 uppercase mb-5">
                    <span className="flex items-center gap-1.5">
                      <Star size={11} className="text-saffron fill-saffron" aria-hidden="true" />
                      {gem.rating}
                    </span>
                    <span className="w-px h-3 bg-white/20" aria-hidden="true" />
                    <span className="flex items-center gap-1.5">
                      <Users size={11} className="text-saffron/80" aria-hidden="true" />
                      {gem.visitors}
                    </span>
                    <span className="w-px h-3 bg-white/20" aria-hidden="true" />
                    <span className="flex items-center gap-1.5">
                      <Footprints size={11} className="text-saffron/80" aria-hidden="true" />
                      {gem.difficulty}
                    </span>
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-white/[0.07] pt-4">
                    <span className="font-data text-[10px] uppercase tracking-[0.16em] text-ivory-faint">
                      {gem.state}
                    </span>

                    <button
                      onClick={() => setOpenGem(gem)}
                      className="flex items-center gap-2 text-[13px] font-bold text-saffron hover:text-saffron-bright transition-colors group/btn"
                    >
                      View details
                      <ArrowRight
                        className="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>
              </Motion.article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-6 bg-ink-900/60 rounded-3xl border border-white/[0.07] mx-auto max-w-2xl">
            <Compass className="w-12 h-12 text-ivory-faint mx-auto mb-5" aria-hidden="true" />
            <h3 className="font-display text-2xl text-ivory mb-3">
              No gems match{" "}
              {searchTerm.trim() ? (
                <em className="italic text-saffron-bright">“{searchTerm.trim()}”</em>
              ) : (
                "those filters"
              )}
            </h3>
            <p className="text-ivory-muted max-w-md mx-auto mb-7 leading-relaxed">
              All {gemsData.length} places are still here — widen the region, drop a
              category, or search by state instead.
            </p>
            <button onClick={clearAllFilters} className="btn-outline">
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* ======================= SHARE-A-GEM CTA ======================= */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-14 mt-20">
        <Motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="rounded-3xl border border-white/[0.07] bg-ink-900 px-8 py-12 md:px-14 flex flex-col md:flex-row md:items-center gap-8"
        >
          <div className="flex-1">
            <SectionHeading
              align="left"
              eyebrow="Anonymous uploads"
              title="Know a place like these?"
              lede="Every gem on this page came from someone who chose to share it. Add yours — no name attached, ever."
            />
          </div>
          <button onClick={() => onPageChange("upload")} className="btn-primary shrink-0 self-start md:self-center">
            Share a hidden gem
            <ArrowUpRight size={16} aria-hidden="true" />
          </button>
        </Motion.div>
      </div>

      {/* ======================= DETAIL PANEL ======================= */}
      <AnimatePresence>
        {openGem && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8"
            role="dialog"
            aria-modal="true"
            aria-label={`Details for ${openGem.title}`}
          >
            <button
              className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm cursor-default"
              onClick={closeDetail}
              aria-label="Close details"
              tabIndex={-1}
            />

            <Motion.div
              initial={{ opacity: 0, y: 32, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="relative w-full max-w-3xl max-h-[86vh] overflow-y-auto bg-ink-900 border border-white/[0.09] rounded-3xl shadow-2xl"
            >
              {/* Header image */}
              <div className="relative h-56 md:h-64 shrink-0">
                {/* The detail view cycles too, and a little slower: someone
                    who has opened a place is reading, not scanning. */}
                <GemThumbnail
                  images={imagesFor(openGem)}
                  video={openGem.video || null}
                  alt={`${openGem.title}, ${openGem.location}`}
                  fallback={FALLBACK_IMAGE}
                  interval={4200}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/30 to-transparent" />
                <button
                  onClick={closeDetail}
                  aria-label="Close details"
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-ink-950/60 backdrop-blur-md border border-white/[0.15] hover:border-saffron/50 flex items-center justify-center text-ivory transition-colors"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
                <div className="absolute bottom-0 inset-x-0 p-6 md:p-8 pb-4">
                  <p className="eyebrow !text-[10px] mb-2">
                    {openGem.location} · {REGION_LABELS[openGem.region] || openGem.region}
                  </p>
                  <h2 className="font-display italic text-3xl md:text-4xl font-medium text-ivory">
                    {openGem.title}
                  </h2>
                </div>
              </div>

              <div className="p-6 md:p-8 pt-4">
                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-4 font-data text-[11px] tracking-[0.08em] text-ivory/70 uppercase mb-6">
                  <span className="flex items-center gap-1.5">
                    <Star size={11} className="text-saffron fill-saffron" aria-hidden="true" />
                    {openGem.rating}
                  </span>
                  <span className="w-px h-3 bg-white/20" aria-hidden="true" />
                  <span className="flex items-center gap-1.5">
                    <Users size={11} className="text-saffron/80" aria-hidden="true" />
                    {openGem.visitors}
                  </span>
                  <span className="w-px h-3 bg-white/20" aria-hidden="true" />
                  <span className="flex items-center gap-1.5">
                    <Route size={11} className="text-saffron/80" aria-hidden="true" />
                    {openGem.distance}
                  </span>
                  <span className="w-px h-3 bg-white/20" aria-hidden="true" />
                  <span className="flex items-center gap-1.5">
                    <Footprints size={11} className="text-saffron/80" aria-hidden="true" />
                    {openGem.difficulty}
                  </span>
                </div>

                <p className="text-ivory-muted text-[15px] leading-relaxed mb-8">
                  {openGem.description}
                </p>

                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  <DetailBlock
                    icon={Landmark}
                    label="Why it matters"
                    text={openGem.cultural_significance}
                  />
                  <DetailBlock
                    icon={Calendar}
                    label="Best time to visit"
                    text={openGem.best_time_visit}
                  />
                  <DetailBlock
                    icon={Route}
                    label="Getting there"
                    text={openGem.how_to_reach}
                  />
                  <DetailBlock
                    icon={Lightbulb}
                    label="Local tips"
                    text={openGem.local_tips}
                  />
                  <DetailBlock
                    icon={Footprints}
                    label="On the ground"
                    text={openGem.accessibility}
                  />
                  <DetailBlock
                    icon={Signal}
                    label="Connectivity"
                    text={openGem.connectivity}
                  />
                </div>

                {openGem.nearby_attractions?.length > 0 && (
                  <div className="mb-8">
                    <h3 className="font-data text-[10px] uppercase tracking-[0.2em] text-saffron mb-3">
                      Nearby
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {openGem.nearby_attractions.map((a) => (
                        <span
                          key={a}
                          className="font-data text-[10px] tracking-[0.12em] uppercase text-ivory/70 border border-white/[0.12] rounded-full px-3 py-1.5"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 border-t border-white/[0.07] pt-6">
                  <button
                    onClick={() => {
                      closeDetail();
                      onPageChange("itinerary");
                    }}
                    className="btn-primary"
                  >
                    <Calendar size={15} aria-hidden="true" />
                    Plan a trip here
                  </button>
                  <button
                    onClick={(e) => handleBookmarkToggle(e, openGem)}
                    className="btn-ghost"
                  >
                    <Heart
                      size={15}
                      className={
                        isBookmarked(`gem-${openGem.id}`, "hidden_gem")
                          ? "fill-saffron text-saffron"
                          : ""
                      }
                      aria-hidden="true"
                    />
                    {isBookmarked(`gem-${openGem.id}`, "hidden_gem") ? "Saved" : "Save"}
                  </button>
                </div>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/** Small labeled info card used inside the detail panel. */
const DetailBlock = ({ icon, label, text }) => {
  const Icon = icon;
  if (!text) return null;
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-ink-800 p-5">
      <h3 className="font-data text-[10px] uppercase tracking-[0.2em] text-saffron mb-2.5 flex items-center gap-2">
        <Icon size={12} aria-hidden="true" />
        {label}
      </h3>
      <p className="text-ivory/85 text-[13px] leading-relaxed">{text}</p>
    </div>
  );
};

export default HiddenGemsPage;
