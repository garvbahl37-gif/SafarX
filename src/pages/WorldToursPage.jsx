import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
    X,
    AlertCircle,
    Globe,
    Navigation2,
    ArrowLeft,
    ArrowUpRight,
    Play,
    Clock,
    Eye,
    Film,
    Calendar,
    ChevronDown,
    BookOpen,
    Compass,
    Map as MapIcon,
    Layers,
} from "lucide-react";
import { geocode } from "../utils/mapHelpers";
import { SearchBar } from "../components/VirtualTour/SearchBar";
import { VRScene } from "../components/VirtualTour/VRScene";
import GoogleEarthExplorer from "../components/GoogleEarthExplorer";
import SectionHeading from "../components/ui/SectionHeading";
import vrTours from "../data/vrTours.json";
import PanoramaViewer from "../components/vr/PanoramaViewer";
import TourStory from "../components/vr/TourStory";
import { cdnImageCropped, originalFrom } from "../utils/imageCdn";

const EASE = [0.22, 1, 0.36, 1];

/* ── Hero footage ───────────────────────────────────────────────────────
   Mehrangarh Fort, Jodhpur, at 1080p60. Deliberately not the 4K Taj clip the
   home page opens with: repeating it across two pages reads as a template, and
   the 4K/60 renditions are slow to start and stutter on a mid-range laptop.
   Both the file and the poster were curl-checked before being committed. */
const HERO_VIDEO =
    "https://videos.pexels.com/video-files/17453762/17453762-uhd_2560_1440_24fps.mp4";
const HERO_POSTER =
    "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1600&auto=format&fit=crop&q=70";

const MODES = [
    { id: "tours", label: "VR tours", icon: Film },
    { id: "streetview", label: "Street view", icon: Navigation2 },
    { id: "earth", label: "Orbital view", icon: Globe },
];

/* ── Free-roam modes ────────────────────────────────────────────────────
   Each card says what the mode actually does and when you would reach for it,
   over a verified image. Images are Commons files already shipping in the tour
   galleries, so they are covered by the same verification pass. */
const FREE_ROAM = [
    {
        id: "streetview",
        icon: Navigation2,
        title: "Street view",
        benefit: "Stand at any address in India and look around at eye level.",
        detail:
            "Search a landmark, a station, a market street — anywhere with coverage — and you are dropped at ground level facing it. Use it to work out where the entrance is, how far the walk from the station really is, or what a neighbourhood looks like before you book a room in it.",
        action: "Search a place",
        image:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Dashashwamedh_Ghat%2C_Ganga%2C_Varanasi.jpg/1280px-Dashashwamedh_Ghat%2C_Ganga%2C_Varanasi.jpg",
        alt: "The ghats at Varanasi from street level",
        mode: "streetview",
    },
    {
        id: "earth",
        icon: Globe,
        title: "Orbital view",
        benefit: "Sweep over forts, ghats and coastlines from a satellite's seat.",
        detail:
            "The whole country in 3D terrain — tilt into the Himalaya, follow the Konkan coast, or circle a fort to see how its walls actually sit on the ridge. Use it for the shape of a place: the valley a monastery hangs over, how close a beach is to the road.",
        action: "Open orbital view",
        image:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Pangong_Lake%2C_Ladakh_valley.jpg/1280px-Pangong_Lake%2C_Ladakh_valley.jpg",
        alt: "Pangong Tso in the Ladakh valley from above",
        mode: "earth",
    },
    {
        id: "map",
        icon: MapIcon,
        title: "The atlas",
        benefit: "Every tour, hidden gem and heritage city pinned on one map.",
        detail:
            "The flat view of the same content — filterable by layer, with distances you can measure. Use it when you are stitching a route together and need to know what else is within an afternoon's drive of where you already are.",
        action: "Open the map",
        image:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Hampi_-_Hemakuta_Hill%2C_Virupaksha_Temple.jpg/1280px-Hampi_-_Hemakuta_Hill%2C_Virupaksha_Temple.jpg",
        alt: "Virupaksha Temple seen from Hemakuta Hill, Hampi",
        page: "map",
    },
];

const WorldToursPage = ({ onPageChange, setIsImmersiveMode, selectedItem }) => {
    const reduce = useReducedMotion();
    const [activeTab, setActiveTab] = useState("tours");
    const [step, setStep] = useState(1);
    const [place, setPlace] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [category, setCategory] = useState("All");
    const [activeTour, setActiveTour] = useState(
        selectedItem && Number.isFinite(selectedItem.latitude) ? selectedItem : null
    );

    // The open tour is one scrolling surface: panorama first, then its story.
    // These refs let the "Read about…" affordance move between the two.
    const playerRef = useRef(null);
    const storyRef = useRef(null);

    useEffect(() => {
        if (setIsImmersiveMode) {
            setIsImmersiveMode((activeTab === "streetview" && step > 1) || Boolean(activeTour));
        }
    }, [step, activeTab, activeTour, setIsImmersiveMode]);

    /* Srishti can open a tour while this page is already on screen, and the
       initial state above only runs on mount. Without this, asking for a
       second place leaves the first one playing. */
    useEffect(() => {
        if (selectedItem && Number.isFinite(selectedItem.latitude)) {
            setActiveTour(selectedItem);
        }
    }, [selectedItem]);

    // Close the tour player with Escape
    useEffect(() => {
        if (!activeTour) return;
        const onKey = (e) => {
            if (e.key === "Escape") setActiveTour(null);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [activeTour]);

    // A newly opened tour always starts at the panorama, never mid-story.
    useEffect(() => {
        if (activeTour) playerRef.current?.scrollTo({ top: 0 });
    }, [activeTour]);

    const scrollToStory = useCallback(() => {
        storyRef.current?.scrollIntoView({
            behavior: reduce ? "auto" : "smooth",
            block: "start",
        });
    }, [reduce]);

    const categories = useMemo(
        () => ["All", ...new Set(vrTours.map((t) => t.category))],
        []
    );

    const visibleTours = useMemo(
        () => (category === "All" ? vrTours : vrTours.filter((t) => t.category === category)),
        [category]
    );

    // Headline numbers for the hero — counted from the data, never hardcoded,
    // so they cannot drift as tours and vantage points are added.
    const stats = useMemo(() => {
        const vantages = vrTours.reduce(
            (n, t) => n + (Array.isArray(t.panoramas) ? t.panoramas.length : t.panorama ? 1 : 0),
            0
        );
        const states = new Set(vrTours.map((t) => t.country));
        return { tours: vrTours.length, vantages, states: states.size };
    }, []);

    /**
     * handleSearch
     * supports Photon coordinates optimization
     */
    const handleSearch = useCallback(async (q, directCoords = null) => {
        setIsLoading(true);
        setError(null);

        try {
            let result;

            if (directCoords && directCoords.lat && directCoords.lng) {
                result = {
                    lat: directCoords.lat,
                    lng: directCoords.lng,
                    name: q,
                    displayName: q,
                };
            } else {
                result = await geocode(q);
            }

            if (result) {
                setPlace(result);
                setStep(2);
            } else {
                setError("We couldn't find that place. Try adding the city — for example, “Hampi, Karnataka”.");
            }
        } catch (err) {
            console.error("Search error:", err);
            setError("The search didn't go through. Check your connection and try again.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setStep(1);
        setPlace(null);
    }, []);

    const switchMode = (mode) => {
        setActiveTab(mode);
        setStep(1);
        setPlace(null);
    };

    // ─────────────────────────────────────────────────────────────────
    // FULLSCREEN STREET VIEW
    // ─────────────────────────────────────────────────────────────────
    if (activeTab === "streetview" && step === 2 && place) {
        return (
            <Motion.div
                key="immersive"
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.015 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="fixed inset-0 z-[999] bg-ink-950"
            >
                <VRScene place={place} onBack={reset} />
            </Motion.div>
        );
    }

    // ─────────────────────────────────────────────────────────────────
    // FULLSCREEN VR TOUR PLAYER
    //
    // One scrolling surface rather than a fixed viewport: the panorama fills
    // the first screen, and the place's story sits directly beneath it. The
    // canvas swallows the wheel (that is its zoom), so there is an explicit
    // affordance down to the story rather than only a scroll gesture.
    // ─────────────────────────────────────────────────────────────────
    const tourPlayer = (
        <AnimatePresence>
            {activeTour && (
                <Motion.div
                    key={`player-${activeTour.id}`}
                    ref={playerRef}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="fixed inset-0 z-[999] overflow-y-auto overscroll-contain bg-ink-950"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`360° tour of ${activeTour.name}`}
                >
                    {/* Player top bar — sticky, so leaving is always one click away */}
                    <div className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/[0.07] bg-ink-950/90 px-4 py-4 backdrop-blur-md md:px-8">
                        <button
                            onClick={() => setActiveTour(null)}
                            className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-ivory transition-colors duration-200 hover:border-saffron/40"
                        >
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            <span className="text-sm font-semibold tracking-wide">All tours</span>
                        </button>

                        <div className="hidden min-w-0 items-center gap-3 sm:flex">
                            <span className="route-dot animate-pulse" />
                            <span className="truncate font-data text-[11px] uppercase tracking-[0.2em] text-ivory/80">
                                360° · {activeTour.name} · {activeTour.country}
                            </span>
                        </div>

                        <button
                            onClick={() => setActiveTour(null)}
                            aria-label="Close tour"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-ivory-muted transition-colors hover:border-saffron/40 hover:text-ivory"
                        >
                            <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </div>

                    {/* 360° panorama — rendered in-app, never an embed */}
                    <div className="relative h-[calc(100svh-4.25rem)] min-h-[26rem] bg-ink-950">
                        <PanoramaViewer
                            key={activeTour.id}
                            tourId={activeTour.id}
                            latitude={activeTour.latitude}
                            longitude={activeTour.longitude}
                            name={activeTour.name}
                            region={activeTour.country}
                            panoramas={activeTour.panoramas}
                            panorama={activeTour.panorama}
                            panoramaCredit={activeTour.panoramaCredit}
                            panoramaSource={activeTour.panoramaSource}
                            className="absolute inset-0"
                        />
                    </div>

                    {/* Tour notes */}
                    <div className="border-t border-white/[0.07] bg-ink-900/95 px-4 py-5 backdrop-blur-md md:px-8">
                        <div className="mx-auto flex max-w-[1440px] flex-col gap-5 md:flex-row md:items-start md:gap-10">
                            <div className="min-w-0 flex-1">
                                <p className="eyebrow !text-[10px] mb-2">
                                    {activeTour.category} · {activeTour.country}
                                </p>
                                <h2 className="mb-2 font-display text-2xl font-medium italic text-ivory md:text-3xl">
                                    {activeTour.name}
                                </h2>
                                <p className="max-w-2xl text-sm leading-relaxed text-ivory-muted">
                                    {activeTour.description}
                                </p>
                            </div>

                            <div className="shrink-0 md:text-right">
                                <div className="mb-4 flex flex-wrap gap-2 md:justify-end">
                                    {(activeTour.highlights || []).map((h) => (
                                        <span
                                            key={h}
                                            className="rounded-full border border-white/[0.12] px-3 py-1 font-data text-[10px] uppercase tracking-[0.12em] text-ivory/70"
                                        >
                                            {h}
                                        </span>
                                    ))}
                                </div>
                                <div className="mb-4 flex items-center gap-4 font-data text-[11px] uppercase tracking-[0.08em] text-ivory/60 md:justify-end">
                                    <span className="flex items-center gap-1.5">
                                        <Clock size={11} className="text-saffron/80" aria-hidden="true" />
                                        {activeTour.duration}
                                    </span>
                                    <span className="h-3 w-px bg-white/20" aria-hidden="true" />
                                    <span className="flex items-center gap-1.5">
                                        <Eye size={11} className="text-saffron/80" aria-hidden="true" />
                                        {activeTour.views} views
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2 md:justify-end">
                                    {activeTour.story && (
                                        <button
                                            onClick={scrollToStory}
                                            className="btn-ghost !py-2.5 !px-5 text-sm"
                                        >
                                            <BookOpen size={14} aria-hidden="true" />
                                            Read about {activeTour.name.split(",")[0]}
                                            <ChevronDown size={14} aria-hidden="true" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onPageChange("itinerary")}
                                        className="btn-primary !py-2.5 !px-5 text-sm"
                                    >
                                        <Calendar size={14} aria-hidden="true" />
                                        Plan this trip
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* The place itself, below the 360° view */}
                    <div ref={storyRef}>
                        <TourStory tour={activeTour} />
                    </div>
                </Motion.div>
            )}
        </AnimatePresence>
    );

    // ─────────────────────────────────────────────────────────────────
    // MAIN PAGE
    // ─────────────────────────────────────────────────────────────────
    return (
        <div className="relative w-full min-h-screen bg-ink-950 font-sans text-ivory">
            {tourPlayer}

            {/* ── Mode switcher ──
                Absolutely positioned over the hero, not in flow: in flow its top
                padding rendered as a dead ink band between the navbar and the
                video. Not `fixed` either — pinning it made the pill float over
                the tour cards further down the page. `top-[6.5rem]` clears the
                72px floating navbar (fixed, pt-4 + h-14) with room to spare, and
                z-[40] keeps it under the navbar's z-[60]. */}
            <div className="absolute inset-x-0 top-[6.5rem] z-[40] flex justify-center px-4">
                <div
                    className="inline-flex items-center gap-1 rounded-full border border-white/[0.09] bg-ink-950/85 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
                    role="group"
                    aria-label="Choose a viewing mode"
                >
                    {MODES.map((mode) => {
                        const isActive = activeTab === mode.id;
                        return (
                            <button
                                key={mode.id}
                                onClick={() => switchMode(mode.id)}
                                aria-pressed={isActive}
                                className={`relative inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2.5 font-data text-[10px] font-medium uppercase tracking-[0.12em] transition-colors duration-300 sm:px-4 sm:text-[11px] sm:tracking-[0.14em] md:px-5 md:text-xs ${
                                    isActive
                                        ? "text-ink-950"
                                        : "text-ivory-muted hover:bg-white/[0.06] hover:text-ivory"
                                }`}
                            >
                                {isActive && (
                                    <Motion.span
                                        layoutId="mode-capsule"
                                        transition={{ duration: 0.4, ease: EASE }}
                                        className="absolute inset-0 rounded-full bg-gradient-to-br from-saffron-bright to-saffron shadow-[0_4px_16px_rgba(212,168,67,0.4)]"
                                        aria-hidden="true"
                                    />
                                )}
                                {/* Dropped below `sm` so three pills still fit
                                    across a 375px viewport without clipping. */}
                                <mode.icon
                                    className="relative z-10 hidden h-4 w-4 shrink-0 sm:block"
                                    aria-hidden="true"
                                />
                                <span className="relative z-10">{mode.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Error toast ── */}
            <AnimatePresence>
                {error && (
                    <Motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className="fixed top-40 left-1/2 z-[200] flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-saffron/30 bg-ink-900/95 px-5 py-3 shadow-2xl backdrop-blur-xl"
                        role="alert"
                    >
                        <AlertCircle className="h-4 w-4 shrink-0 text-saffron" aria-hidden="true" />
                        <p className="text-sm text-ivory-muted">{error}</p>
                        <button onClick={() => setError(null)} aria-label="Dismiss message">
                            <X className="h-3 w-3 text-ivory-faint transition-colors hover:text-ivory" aria-hidden="true" />
                        </button>
                    </Motion.div>
                )}
            </AnimatePresence>

            {/* ── Tab content ── */}
            <AnimatePresence mode="wait">
                {activeTab === "tours" ? (
                    <Motion.div
                        key="tours"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: EASE }}
                        className="w-full min-h-screen"
                    >
                        {/* ── Hero ──
                            Full-bleed footage with exactly one scrim. Stacking
                            several crushed the video to black, so legibility is
                            handled by `on-media` on the copy instead. */}
                        {/* `pt-24` is inside the section, so the video (absolute
                            inset-0) still fills to the top of the viewport — it
                            only pushes the centred copy clear of the overlaid
                            mode switcher, which sits at 104–156px. */}
                        <section className="relative isolate flex min-h-[62vh] items-center justify-center overflow-hidden pt-24 md:min-h-[72vh] md:pt-28">
                            <video
                                autoPlay
                                muted
                                loop
                                playsInline
                                preload="metadata"
                                poster={HERO_POSTER}
                                src={HERO_VIDEO}
                                aria-hidden="true"
                                className="absolute inset-0 -z-10 h-full w-full object-cover video-crisp"
                            />
                            <div
                                className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950 via-ink-950/45 to-ink-950/30"
                                aria-hidden="true"
                            />
                            {/* Pool of shade under the copy — this footage is
                                bright and busy, and type was washing out. */}
                            <div
                                className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_56%_50%_at_50%_52%,rgba(6,20,18,0.78)_0%,rgba(6,20,18,0.4)_55%,transparent_80%)]"
                                aria-hidden="true"
                            />

                            <div className="on-media relative mx-auto w-full max-w-3xl px-6 py-20 text-center md:px-8">
                                <SectionHeading
                                    eyebrow="20.59° N · 78.96° E · 360° previews"
                                    title={
                                        <>
                                            VR tours of{" "}
                                            <em className="font-medium italic text-saffron-bright">
                                                Incredible India
                                            </em>
                                        </>
                                    }
                                    lede="Step inside monuments, ghats and cave temples in full 360° — real equirectangular panoramas, rendered here, with nobody else's player around them. Drag to look around, then scroll into the story of the place."
                                />

                                <Motion.dl
                                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
                                    className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 md:gap-x-12"
                                >
                                    {[
                                        { n: stats.tours, label: "guided tours" },
                                        { n: stats.vantages, label: "verified vantage points" },
                                        { n: stats.states, label: "states & territories" },
                                    ].map((stat) => (
                                        <div key={stat.label} className="flex items-baseline gap-2.5">
                                            <dt className="sr-only">{stat.label}</dt>
                                            <dd className="font-display text-3xl font-medium text-ivory md:text-4xl">
                                                {stat.n}
                                            </dd>
                                            <span className="font-data text-[10px] uppercase tracking-[0.16em] text-ivory-muted">
                                                {stat.label}
                                            </span>
                                        </div>
                                    ))}
                                </Motion.dl>
                            </div>
                        </section>

                        {/* Gallery */}
                        <section className="pt-12 pb-24 md:pt-14 md:pb-32">
                            <div className="mx-auto max-w-[1440px] px-6 md:px-14">
                                {/* Category filter */}
                                {categories.length > 2 && (
                                    <div
                                        className="mb-12 flex flex-wrap justify-center gap-2"
                                        role="group"
                                        aria-label="Filter tours by category"
                                    >
                                        {categories.map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => setCategory(c)}
                                                aria-pressed={category === c}
                                                className={`rounded-full border px-4 py-2 font-data text-[11px] uppercase tracking-[0.14em] transition-colors duration-300 ${
                                                    category === c
                                                        ? "border-saffron bg-saffron text-ink-950"
                                                        : "border-white/[0.12] text-ivory-muted hover:border-saffron/35 hover:text-ivory"
                                                }`}
                                            >
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {visibleTours.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                        {visibleTours.map((tour, i) => {
                                            const vantages = Array.isArray(tour.panoramas)
                                                ? tour.panoramas.length
                                                : 0;
                                            return (
                                                <Motion.button
                                                    key={tour.id}
                                                    initial={{ opacity: 0, y: 28 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true, margin: "-60px" }}
                                                    transition={{ duration: 0.65, delay: (i % 3) * 0.08, ease: EASE }}
                                                    onClick={() => setActiveTour(tour)}
                                                    className="group relative overflow-hidden rounded-2xl border border-white/[0.07] text-left transition-colors duration-500 hover:border-saffron/35"
                                                    aria-label={`Open the 360° tour of ${tour.name}`}
                                                >
                                                    <div className="relative h-[300px] overflow-hidden bg-ink-800">
                                                        <img
                                                            /* Cropped by the CDN to the card's own shape rather than by
                                                               object-cover taking the middle. A portrait photograph in a
                                                               landscape card loses its top and bottom, which is how Qutub
                                                               Minar arrived without the top of the minaret; `a=attention`
                                                               keeps whatever part of the frame carries the detail. */
                                                            src={cdnImageCropped(tour.thumbnail, 460, 1.45)}
                                                            alt={`${tour.name}, ${tour.country}`}
                                                            loading="lazy"
                                                            decoding="async"
                                                            onError={(e) => {
                                                                /* Try the original before giving up on the picture. */
                                                                const source = originalFrom(e.target.src);
                                                                if (source) {
                                                                    e.target.src = source;
                                                                    return;
                                                                }
                                                                e.target.onerror = null;
                                                                e.target.style.opacity = "0";
                                                            }}
                                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />

                                                        {/* Play affordance */}
                                                        <span
                                                            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.12] bg-ink-950/60 text-saffron opacity-80 backdrop-blur-md transition-all duration-300 group-hover:border-saffron/50 group-hover:opacity-100"
                                                            aria-hidden="true"
                                                        >
                                                            <Play size={14} className="ml-0.5 fill-saffron" />
                                                        </span>

                                                        {/* How many vantage points this site was shot from */}
                                                        {vantages > 1 && (
                                                            <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-ink-950/70 px-2.5 py-1 font-data text-[10px] uppercase tracking-[0.12em] text-ivory/80 backdrop-blur-md">
                                                                <Layers size={10} className="text-saffron" aria-hidden="true" />
                                                                {vantages} views
                                                            </span>
                                                        )}

                                                        <div className="absolute inset-x-0 bottom-0 p-6">
                                                            <p className="eyebrow !text-[10px] mb-2">{tour.category}</p>
                                                            <h3 className="mb-1 font-display text-3xl font-medium italic text-ivory">
                                                                {tour.name}
                                                            </h3>
                                                            <p className="mb-4 text-[13px] text-ivory-muted">{tour.country}</p>

                                                            <div className="flex items-center gap-4 font-data text-[11px] uppercase tracking-[0.08em] text-ivory/70">
                                                                <span className="flex items-center gap-1.5">
                                                                    <Clock size={11} className="text-saffron/80" aria-hidden="true" />
                                                                    {tour.duration}
                                                                </span>
                                                                <span className="h-3 w-px bg-white/20" aria-hidden="true" />
                                                                <span className="flex items-center gap-1.5">
                                                                    <Eye size={11} className="text-saffron/80" aria-hidden="true" />
                                                                    {tour.views}
                                                                </span>
                                                                <span className="ml-auto flex items-center gap-1 font-sans font-bold normal-case tracking-normal text-saffron opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                                                    Enter VR
                                                                    <ArrowUpRight size={12} aria-hidden="true" />
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Motion.button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="mx-auto max-w-2xl rounded-3xl border border-white/[0.07] bg-ink-900/60 py-20 text-center">
                                        <Film className="mx-auto mb-4 h-12 w-12 text-ivory-faint" aria-hidden="true" />
                                        <h3 className="mb-2 font-display text-2xl text-ivory">No tours in this category yet</h3>
                                        <p className="mx-auto max-w-md text-ivory-muted">
                                            Try another category — new 360° tours are added as verified panoramas appear.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* ── Free roam ──
                            Three real cards rather than loose blurbs: what the
                            mode does, when you would use it, and one action. */}
                        <section className="border-t border-white/[0.06] bg-ink-900 py-20 md:py-28">
                            <div className="mx-auto max-w-[1440px] px-6 md:px-14">
                                <SectionHeading
                                    eyebrow="Free roam · no ticket required"
                                    title={
                                        <>
                                            Go beyond the{" "}
                                            <em className="font-medium italic text-saffron-bright">
                                                guided tours
                                            </em>
                                        </>
                                    }
                                    lede="The tours above are the places we have verified panoramas for. These three modes cover everywhere else in India — at eye level, from orbit, or laid flat on a map."
                                    className="mb-12 md:mb-16"
                                />

                                <div className="grid gap-5 md:grid-cols-3">
                                    {FREE_ROAM.map((card, i) => {
                                        const CardIcon = card.icon;
                                        return (
                                            <Motion.button
                                                key={card.id}
                                                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 26 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true, margin: "-60px" }}
                                                transition={{ duration: 0.7, delay: i * 0.09, ease: EASE }}
                                                onClick={() =>
                                                    card.page ? onPageChange(card.page) : switchMode(card.mode)
                                                }
                                                className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-800 text-left transition-colors duration-500 hover:border-saffron/35"
                                            >
                                                {/* Illustrative visual */}
                                                <div className="relative h-40 overflow-hidden bg-ink-700 sm:h-44">
                                                    <img
                                                        src={card.image}
                                                        alt={card.alt}
                                                        loading="lazy"
                                                        decoding="async"
                                                        onError={(e) => {
                                                            e.currentTarget.onerror = null;
                                                            e.currentTarget.style.opacity = "0";
                                                        }}
                                                        className="h-full w-full object-cover opacity-80 transition-all duration-[900ms] ease-out group-hover:scale-105 group-hover:opacity-100"
                                                    />
                                                    <div
                                                        className="absolute inset-0 bg-gradient-to-t from-ink-800 via-ink-800/35 to-transparent"
                                                        aria-hidden="true"
                                                    />
                                                    {/* Icon tile */}
                                                    <span
                                                        className="absolute bottom-4 left-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.12] bg-ink-950/70 text-saffron backdrop-blur-md transition-colors duration-500 group-hover:border-saffron/45"
                                                        aria-hidden="true"
                                                    >
                                                        <CardIcon size={18} />
                                                    </span>
                                                </div>

                                                <div className="flex flex-1 flex-col p-6">
                                                    <h3 className="mb-2 font-display text-xl font-medium text-ivory md:text-2xl">
                                                        {card.title}
                                                    </h3>
                                                    <p className="mb-3 text-[14px] font-medium leading-snug text-saffron/90">
                                                        {card.benefit}
                                                    </p>
                                                    <p className="mb-6 text-[13.5px] leading-relaxed text-ivory-muted">
                                                        {card.detail}
                                                    </p>

                                                    <span className="mt-auto flex items-center gap-2 border-t border-white/[0.07] pt-4 font-data text-[11px] uppercase tracking-[0.14em] text-ivory transition-colors duration-300 group-hover:text-saffron">
                                                        {card.action}
                                                        <ArrowUpRight
                                                            size={14}
                                                            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                                            aria-hidden="true"
                                                        />
                                                    </span>
                                                </div>
                                            </Motion.button>
                                        );
                                    })}
                                </div>

                                <Motion.p
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
                                    className="mt-10 flex items-center gap-3 font-data text-[11px] uppercase tracking-[0.14em] text-ivory-faint"
                                >
                                    <Compass size={13} className="text-saffron/70" aria-hidden="true" />
                                    Every panorama is a verified, freely licensed image — never a video embed
                                </Motion.p>
                            </div>
                        </section>
                    </Motion.div>
                ) : activeTab === "streetview" ? (
                    <Motion.div
                        key="search"
                        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduce ? { opacity: 0 } : { opacity: 0, y: -14 }}
                        transition={{ duration: 0.45, ease: EASE }}
                        className="w-full min-h-screen"
                    >
                        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
                    </Motion.div>
                ) : (
                    <Motion.div
                        key="earth"
                        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
                        transition={{ duration: 0.45, ease: EASE }}
                        className="w-full min-h-screen"
                    >
                        <GoogleEarthExplorer onBack={() => switchMode("streetview")} />
                    </Motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WorldToursPage;
