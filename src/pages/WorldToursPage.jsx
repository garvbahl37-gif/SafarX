import React, { useState, useCallback, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { geocode } from "../utils/mapHelpers";
import { SearchBar } from "../components/VirtualTour/SearchBar";
import { VRScene } from "../components/VirtualTour/VRScene";
import GoogleEarthExplorer from "../components/GoogleEarthExplorer";
import SectionHeading from "../components/ui/SectionHeading";
import vrTours from "../data/vrTours.json";

const EASE = [0.22, 1, 0.36, 1];

/** Fallback thumbnail straight from the tour's own video. */
const youtubeThumb = (videoId) => `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

const MODES = [
    { id: "tours", label: "VR tours", icon: Film },
    { id: "streetview", label: "Street view", icon: Navigation2 },
    { id: "earth", label: "Orbital view", icon: Globe },
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
        selectedItem && selectedItem.videoId ? selectedItem : null
    );

    useEffect(() => {
        if (setIsImmersiveMode) {
            setIsImmersiveMode((activeTab === "streetview" && step > 1) || Boolean(activeTour));
        }
    }, [step, activeTab, activeTour, setIsImmersiveMode]);

    // Close the tour player with Escape
    useEffect(() => {
        if (!activeTour) return;
        const onKey = (e) => {
            if (e.key === "Escape") setActiveTour(null);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [activeTour]);

    const categories = useMemo(
        () => ["All", ...new Set(vrTours.map((t) => t.category))],
        []
    );

    const visibleTours = useMemo(
        () => (category === "All" ? vrTours : vrTours.filter((t) => t.category === category)),
        [category]
    );

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
    // ─────────────────────────────────────────────────────────────────
    const tourPlayer = (
        <AnimatePresence>
            {activeTour && (
                <Motion.div
                    key={`player-${activeTour.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="fixed inset-0 z-[999] bg-ink-950 flex flex-col"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`360° tour of ${activeTour.name}`}
                >
                    {/* Player top bar */}
                    <div className="flex items-center justify-between gap-4 px-4 md:px-8 py-4 border-b border-white/[0.07] bg-ink-950/90 backdrop-blur-md">
                        <button
                            onClick={() => setActiveTour(null)}
                            className="flex items-center gap-2 text-ivory px-4 py-2 rounded-full border border-white/15 hover:border-saffron/40 transition-colors duration-200"
                        >
                            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                            <span className="text-sm font-semibold tracking-wide">All tours</span>
                        </button>

                        <div className="hidden sm:flex items-center gap-3 min-w-0">
                            <span className="route-dot animate-pulse" />
                            <span className="font-data text-[11px] tracking-[0.2em] uppercase text-ivory/80 truncate">
                                360° · {activeTour.name} · {activeTour.country}
                            </span>
                        </div>

                        <button
                            onClick={() => setActiveTour(null)}
                            aria-label="Close tour"
                            className="w-9 h-9 rounded-full border border-white/15 hover:border-saffron/40 flex items-center justify-center text-ivory-muted hover:text-ivory transition-colors"
                        >
                            <X className="w-4 h-4" aria-hidden="true" />
                        </button>
                    </div>

                    {/* 360° video */}
                    <div className="relative flex-1 bg-ink-950">
                        <iframe
                            src={`https://www.youtube.com/embed/${activeTour.videoId}?rel=0&modestbranding=1&autoplay=1`}
                            title={`360° tour of ${activeTour.name}`}
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; autoplay; gyroscope; encrypted-media; picture-in-picture"
                            allowFullScreen
                        />
                    </div>

                    {/* Tour notes */}
                    <div className="border-t border-white/[0.07] bg-ink-900/95 backdrop-blur-md px-4 md:px-8 py-5 max-h-[38vh] overflow-y-auto">
                        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-start gap-5 md:gap-10">
                            <div className="min-w-0 flex-1">
                                <p className="eyebrow !text-[10px] mb-2">
                                    {activeTour.category} · {activeTour.country}
                                </p>
                                <h2 className="font-display italic text-2xl md:text-3xl font-medium text-ivory mb-2">
                                    {activeTour.name}
                                </h2>
                                <p className="text-ivory-muted text-sm leading-relaxed max-w-2xl">
                                    {activeTour.description}
                                </p>
                            </div>

                            <div className="shrink-0 md:text-right">
                                <div className="flex md:justify-end flex-wrap gap-2 mb-4">
                                    {(activeTour.highlights || []).map((h) => (
                                        <span
                                            key={h}
                                            className="font-data text-[10px] tracking-[0.12em] uppercase text-ivory/70 border border-white/[0.12] rounded-full px-3 py-1"
                                        >
                                            {h}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex md:justify-end items-center gap-4 font-data text-[11px] tracking-[0.08em] text-ivory/60 uppercase mb-4">
                                    <span className="flex items-center gap-1.5">
                                        <Clock size={11} className="text-saffron/80" aria-hidden="true" />
                                        {activeTour.duration}
                                    </span>
                                    <span className="w-px h-3 bg-white/20" aria-hidden="true" />
                                    <span className="flex items-center gap-1.5">
                                        <Eye size={11} className="text-saffron/80" aria-hidden="true" />
                                        {activeTour.views} views
                                    </span>
                                </div>
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
                </Motion.div>
            )}
        </AnimatePresence>
    );

    // ─────────────────────────────────────────────────────────────────
    // MAIN PAGE
    // ─────────────────────────────────────────────────────────────────
    return (
        <div className="bg-ink-950 text-ivory font-sans w-full min-h-screen">
            {tourPlayer}

            {/* ── Mode switcher ── */}
            <div className="fixed top-24 inset-x-0 z-[80] flex justify-center pointer-events-none px-4">
                <div
                    className="pointer-events-auto inline-flex items-center gap-1 rounded-full border border-white/[0.09] bg-ink-950/85 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
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
                                className={`relative inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 font-data text-[11px] font-medium uppercase tracking-[0.14em] transition-colors duration-300 md:px-5 md:text-xs ${
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
                                <mode.icon className="relative z-10 h-4 w-4 shrink-0" aria-hidden="true" />
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
                        <AlertCircle className="w-4 h-4 text-saffron shrink-0" aria-hidden="true" />
                        <p className="text-sm text-ivory-muted">{error}</p>
                        <button onClick={() => setError(null)} aria-label="Dismiss message">
                            <X className="w-3 h-3 text-ivory-faint hover:text-ivory transition-colors" aria-hidden="true" />
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
                        {/* Gallery */}
                        <section className="pt-28 md:pt-32 pb-24 md:pb-32">
                            <div className="max-w-[1440px] mx-auto px-6 md:px-14">
                                <SectionHeading
                                    eyebrow="20.59° N · 78.96° E · VR previews"
                                    title={
                                        <>
                                            VR tours of{" "}
                                            <em className="italic text-saffron-bright font-medium">
                                                Incredible India
                                            </em>
                                        </>
                                    }
                                    lede="Step inside monuments, ghats, and valleys in full 360° — filmed on location, played right here. Drag inside the video to look around."
                                    className="mb-12"
                                />

                                {/* Category filter */}
                                {categories.length > 2 && (
                                    <div
                                        className="flex flex-wrap justify-center gap-2 mb-12"
                                        role="group"
                                        aria-label="Filter tours by category"
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
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {visibleTours.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {visibleTours.map((tour, i) => (
                                            <Motion.button
                                                key={tour.id}
                                                initial={{ opacity: 0, y: 28 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true, margin: "-60px" }}
                                                transition={{ duration: 0.65, delay: (i % 3) * 0.08, ease: EASE }}
                                                onClick={() => setActiveTour(tour)}
                                                className="group relative rounded-2xl overflow-hidden border border-white/[0.07] text-left hover:border-saffron/35 transition-colors duration-500"
                                                aria-label={`Watch the 360° tour of ${tour.name}`}
                                            >
                                                <div className="relative h-[300px] overflow-hidden bg-ink-800">
                                                    <img
                                                        src={tour.thumbnail}
                                                        alt={`${tour.name}, ${tour.country}`}
                                                        loading="lazy"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = youtubeThumb(tour.videoId);
                                                        }}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />

                                                    {/* Play affordance */}
                                                    <span
                                                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-ink-950/60 backdrop-blur-md border border-white/[0.12] flex items-center justify-center text-saffron opacity-80 group-hover:opacity-100 group-hover:border-saffron/50 transition-all duration-300"
                                                        aria-hidden="true"
                                                    >
                                                        <Play size={14} className="fill-saffron ml-0.5" />
                                                    </span>

                                                    <div className="absolute bottom-0 inset-x-0 p-6">
                                                        <p className="eyebrow !text-[10px] mb-2">{tour.category}</p>
                                                        <h3 className="font-display italic text-3xl font-medium text-ivory mb-1">
                                                            {tour.name}
                                                        </h3>
                                                        <p className="text-ivory-muted text-[13px] mb-4">{tour.country}</p>

                                                        <div className="flex items-center gap-4 font-data text-[11px] tracking-[0.08em] text-ivory/70 uppercase">
                                                            <span className="flex items-center gap-1.5">
                                                                <Clock size={11} className="text-saffron/80" aria-hidden="true" />
                                                                {tour.duration}
                                                            </span>
                                                            <span className="w-px h-3 bg-white/20" aria-hidden="true" />
                                                            <span className="flex items-center gap-1.5">
                                                                <Eye size={11} className="text-saffron/80" aria-hidden="true" />
                                                                {tour.views}
                                                            </span>
                                                            <span className="ml-auto flex items-center gap-1 text-saffron opacity-0 group-hover:opacity-100 transition-opacity duration-300 normal-case tracking-normal font-sans font-bold">
                                                                Enter VR
                                                                <ArrowUpRight size={12} aria-hidden="true" />
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Motion.button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 bg-ink-900/60 rounded-3xl border border-white/[0.07] max-w-2xl mx-auto">
                                        <Film className="w-12 h-12 text-ivory-faint mx-auto mb-4" aria-hidden="true" />
                                        <h3 className="font-display text-2xl text-ivory mb-2">No tours in this category yet</h3>
                                        <p className="text-ivory-muted max-w-md mx-auto">
                                            Try another category — new 360° tours are added as we film them.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Free-roam modes */}
                        <section className="py-20 md:py-24 bg-ink-900 border-t border-white/[0.06]">
                            <div className="max-w-[1440px] mx-auto px-6 md:px-14">
                                <SectionHeading
                                    align="left"
                                    eyebrow="Free roam"
                                    title="Go beyond the guided tours"
                                    lede="Drop into any street in India, or circle a monument from orbit — no ticket required."
                                    className="mb-10"
                                />
                                <div className="grid sm:grid-cols-2 gap-5 max-w-3xl">
                                    <Motion.button
                                        initial={{ opacity: 0, y: 24 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6, ease: EASE }}
                                        onClick={() => switchMode("streetview")}
                                        className="group text-left rounded-2xl border border-white/[0.07] bg-ink-800 p-6 hover:border-saffron/35 transition-colors duration-500"
                                    >
                                        <Navigation2 size={18} className="text-saffron mb-4" aria-hidden="true" />
                                        <span className="flex items-center gap-2 text-lg font-bold text-ivory mb-1">
                                            Street view
                                            <ArrowUpRight
                                                size={15}
                                                className="text-saffron opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                aria-hidden="true"
                                            />
                                        </span>
                                        <span className="block text-[13px] text-ivory-muted leading-snug">
                                            Stand at any address or landmark and look around at street level.
                                        </span>
                                    </Motion.button>
                                    <Motion.button
                                        initial={{ opacity: 0, y: 24 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
                                        onClick={() => switchMode("earth")}
                                        className="group text-left rounded-2xl border border-white/[0.07] bg-ink-800 p-6 hover:border-saffron/35 transition-colors duration-500"
                                    >
                                        <Globe size={18} className="text-saffron mb-4" aria-hidden="true" />
                                        <span className="flex items-center gap-2 text-lg font-bold text-ivory mb-1">
                                            Orbital view
                                            <ArrowUpRight
                                                size={15}
                                                className="text-saffron opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                aria-hidden="true"
                                            />
                                        </span>
                                        <span className="block text-[13px] text-ivory-muted leading-snug">
                                            Sweep over forts, ghats, and coastlines from a satellite's seat.
                                        </span>
                                    </Motion.button>
                                </div>
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
