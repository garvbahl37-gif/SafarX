import React, { useState, useEffect, useRef } from "react";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
    Search,
    MapPin,
    ArrowRight,
    Sparkles,
    Compass,
} from "lucide-react";
import { placesService } from "../../services/placesService";
import { EASE, formatCoords } from "./immersiveUtils";

/** Hand-picked Indian starting points. */
const QUICK_PLACES = [
    { label: "Taj Mahal", query: "Taj Mahal, Agra", lat: 27.1751, lng: 78.0421 },
    { label: "Chandni Chowk", query: "Chandni Chowk, Delhi", lat: 28.6506, lng: 77.2303 },
    { label: "Marine Drive", query: "Marine Drive, Mumbai", lat: 18.9432, lng: 72.8231 },
    { label: "Hampi", query: "Hampi, Karnataka", lat: 15.335, lng: 76.46 },
    { label: "Fort Kochi", query: "Fort Kochi, Kerala", lat: 9.9658, lng: 76.2422 },
];

/* ── Main SearchBar ─────────────────────────────────────── */
export const SearchBar = ({ onSearch, isLoading }) => {
    const [q, setQ] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [focused, setFocused] = useState(false);
    const [activeIdx, setActiveIdx] = useState(-1);
    const ref = useRef(null);
    const dropdownRef = useRef(null);
    const reduce = useReducedMotion();

    const BG_VIDEO_URL =
        "https://res.cloudinary.com/dnmhqosoa/video/upload/v1772206804/bg7-optimized-4k_blfunq.mp4";

    useEffect(() => {
        const t = setTimeout(() => ref.current?.focus(), 600);
        return () => clearTimeout(t);
    }, []);

    /* Debounced autocomplete — Photon logic retained */
    useEffect(() => {
        if (!q.trim() || q.trim().length < 2) {
            setSuggestions([]);
            return;
        }

        const debounce = setTimeout(() => {
            placesService.getPredictions(q).then((preds) => {
                setSuggestions(preds || []);
                setActiveIdx(-1);
            });
        }, 300);

        return () => clearTimeout(debounce);
    }, [q]);

    /* Close dropdown when clicking outside */
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setSuggestions([]);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const go = (e) => {
        e.preventDefault();

        if (q.trim() && !isLoading) {
            setSuggestions([]);
            onSearch(q.trim(), null);
        }
    };

    /* Arrow-key navigation through the suggestion list */
    const onKeyDown = (e) => {
        if (!suggestions.length) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIdx((i) => (i < suggestions.length - 1 ? i + 1 : 0));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIdx((i) => (i > 0 ? i - 1 : suggestions.length - 1));
        } else if (e.key === "Escape") {
            setSuggestions([]);
            setActiveIdx(-1);
        } else if (e.key === "Enter" && activeIdx >= 0 && suggestions[activeIdx]) {
            e.preventDefault();
            selectSuggestion(suggestions[activeIdx]);
        }
    };

    /* Suggestion selection with Photon coordinates */
    const selectSuggestion = (suggestion) => {
        const displayText = suggestion.description;

        setQ(displayText);
        setSuggestions([]);

        if (!isLoading) {
            onSearch(displayText, suggestion._coords || null);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center font-sans">

            {/* ── Background layer ── */}
            <div className="absolute inset-0 bg-ink-950 overflow-hidden">
                {BG_VIDEO_URL && (
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="auto"
                        className="absolute inset-0 w-full h-full object-cover opacity-70"
                        src={BG_VIDEO_URL}
                    />
                )}

                <div className="absolute inset-0 bg-gradient-to-b from-ink-950/70 via-ink-950/30 to-ink-950/85" />
            </div>

            {/* ── Foreground content ── */}
            <div className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center">

                <Motion.div
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: EASE }}
                    className="w-full text-center"
                >

                    {/* Eyebrow */}
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="inline-flex items-center gap-3 mb-8"
                    >
                        <span className="route-dot animate-pulse" aria-hidden="true" />
                        <span className="eyebrow">Street view · stand anywhere in India</span>
                        <span className="hidden h-3 w-px bg-white/15 sm:block" aria-hidden="true" />
                        <span className="hidden font-data text-[11px] uppercase tracking-[0.18em] text-ivory-faint sm:block">
                            20.59° N · 78.96° E
                        </span>
                    </Motion.div>

                    {/* Title */}
                    <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-light tracking-tight text-ivory mb-6 leading-[1.02]">
                        Walk the streets{" "}
                        <em className="italic font-medium text-saffron-bright">before you land</em>
                    </h1>

                    <p className="text-base sm:text-lg text-ivory-muted max-w-xl mx-auto mb-10 leading-relaxed">
                        Type a monument, a bazaar, or an address — and stand there in
                        street-level 360° a moment later.
                    </p>

                </Motion.div>

                {/* ── Search container ── */}
                <Motion.div
                    ref={dropdownRef}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.25, ease: EASE }}
                    className="relative w-full max-w-2xl"
                >

                    <form onSubmit={go} className="relative z-20">
                        <div
                            className={`relative flex items-center p-2 rounded-full transition-colors duration-500 backdrop-blur-2xl border bg-ink-900/80 ${focused
                                ? "border-saffron/40 shadow-2xl"
                                : "border-white/[0.09] hover:border-white/20"
                                }`}
                        >

                            <div className="pl-4 pr-2">
                                {isLoading ? (
                                    <Compass className="w-5 h-5 animate-spin text-saffron" aria-hidden="true" />
                                ) : (
                                    <Search
                                        className={`w-5 h-5 ${focused ? "text-saffron" : "text-ivory-faint"}`}
                                        aria-hidden="true"
                                    />
                                )}
                            </div>

                            <input
                                ref={ref}
                                type="text"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                onKeyDown={onKeyDown}
                                role="combobox"
                                aria-expanded={suggestions.length > 0}
                                aria-controls="streetview-suggestions"
                                aria-autocomplete="list"
                                onFocus={() => setFocused(true)}
                                onBlur={() => setTimeout(() => setFocused(false), 200)}
                                placeholder="Try the Taj Mahal, Hampi, or Chandni Chowk"
                                aria-label="Search for a place to view in 360°"
                                disabled={isLoading}
                                autoComplete="off"
                                className="flex-1 bg-transparent py-4 px-3 text-ivory text-lg placeholder-ivory-faint outline-none border-none font-medium"
                            />

                            <button
                                type="submit"
                                disabled={isLoading || !q.trim()}
                                className="bg-gradient-to-b from-saffron-bright to-saffron text-ink-950 px-6 sm:px-8 py-3.5 rounded-full font-bold text-sm tracking-wide disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 transition-opacity"
                            >
                                <span>{isLoading ? "Loading…" : "Stand there"}</span>
                                <ArrowRight className="w-4 h-4" aria-hidden="true" />
                            </button>

                        </div>
                    </form>

                    {/* Suggestions dropdown */}
                    <AnimatePresence>
                        {suggestions.length > 0 && !isLoading && (
                            <Motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="absolute w-full mt-3 bg-ink-900/95 backdrop-blur-3xl border border-white/[0.09] rounded-3xl shadow-2xl overflow-hidden z-50 p-2"
                                id="streetview-suggestions"
                                role="listbox"
                                aria-label="Matching places"
                            >
                                {suggestions.map((s, i) => (
                                    <button
                                        key={s.place_id || i}
                                        type="button"
                                        role="option"
                                        aria-selected={i === activeIdx}
                                        onMouseEnter={() => setActiveIdx(i)}
                                        onClick={() => selectSuggestion(s)}
                                        className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 transition-colors duration-200 group/item ${i === activeIdx ? "bg-white/[0.06]" : "hover:bg-white/5"
                                            }`}
                                    >
                                        <div
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors shrink-0 ${s._source === "landmark_db"
                                                ? "bg-saffron/10 border-saffron/25"
                                                : "bg-white/5 border-white/5 group-hover/item:border-saffron/25"
                                                }`}
                                        >
                                            {s._source === "landmark_db" ? (
                                                <Sparkles className="w-4 h-4 text-saffron" aria-hidden="true" />
                                            ) : (
                                                <MapPin
                                                    className="w-4 h-4 text-ivory-faint group-hover/item:text-saffron transition-colors"
                                                    aria-hidden="true"
                                                />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-ivory/90 truncate group-hover/item:text-ivory">
                                                    {s.structured_formatting?.main_text || s.description}
                                                </p>
                                                {s._source === "landmark_db" && (
                                                    <span className="shrink-0 font-data text-[8px] uppercase tracking-wider bg-saffron/15 text-saffron px-1.5 py-0.5 rounded-md border border-saffron/25">
                                                        Best view
                                                    </span>
                                                )}
                                                {s._quality >= 8 && s._source !== "landmark_db" && (
                                                    <span className="shrink-0 font-data text-[8px] uppercase tracking-wider bg-white/[0.07] text-ivory/70 px-1.5 py-0.5 rounded-md border border-white/[0.12]">
                                                        HD
                                                    </span>
                                                )}
                                            </div>
                                            <p className="truncate font-data text-[11px] uppercase tracking-[0.12em] text-ivory-faint">
                                                {s.structured_formatting?.secondary_text ||
                                                    formatCoords(s._coords?.lat, s._coords?.lng) ||
                                                    "Location"}
                                            </p>
                                        </div>
                                        <ArrowRight
                                            className="w-3.5 h-3.5 ml-auto text-transparent group-hover/item:text-ivory-faint transition-colors shrink-0"
                                            aria-hidden="true"
                                        />
                                    </button>
                                ))}

                                {/* Attribution */}
                                <div className="px-5 py-2 border-t border-white/[0.06]">
                                    <p className="text-center font-data text-[9px] uppercase tracking-[0.14em] text-ivory-faint/70">
                                        OpenStreetMap · landmark coordinates hand-verified
                                    </p>
                                </div>
                            </Motion.div>
                        )}
                    </AnimatePresence>

                    {/* Quick jumps */}
                    <Motion.div
                        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.45, ease: EASE }}
                        className="mt-8"
                    >
                        <div className="mb-4 flex items-center gap-4">
                            <span className="route-line flex-1" aria-hidden="true" />
                            <span className="font-data text-[10px] uppercase tracking-[0.24em] text-ivory-faint">
                                Or start here
                            </span>
                            <span className="route-line flex-1" aria-hidden="true" />
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                            {QUICK_PLACES.map((p) => (
                                <button
                                    key={p.label}
                                    type="button"
                                    disabled={isLoading}
                                    onClick={() => {
                                        setQ(p.query);
                                        setSuggestions([]);
                                        onSearch(p.query, { lat: p.lat, lng: p.lng });
                                    }}
                                    className="rounded-full border border-white/[0.09] bg-ink-900/70 px-4 py-2 font-data text-[10px] uppercase tracking-[0.16em] text-ivory-muted backdrop-blur-xl transition-colors duration-300 hover:border-saffron/35 hover:text-ivory disabled:opacity-40"
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </Motion.div>

                </Motion.div>

            </div>
        </div>
    );
};
