import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    MapPin,
    Loader2,
    ArrowRight,
    Sparkles,
} from "lucide-react";
import { placesService } from "../../services/placesService";

/* ── Main SearchBar ─────────────────────────────────────── */
export const SearchBar = ({ onSearch, isLoading }) => {
    const [q, setQ] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [focused, setFocused] = useState(false);
    const ref = useRef(null);
    const dropdownRef = useRef(null);

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

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full text-center"
                >

                    {/* Eyebrow */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="inline-flex items-center gap-3 mb-8"
                    >
                        <span className="route-dot" />
                        <span className="eyebrow">Street view · stand anywhere in India</span>
                    </motion.div>

                    {/* Title */}
                    <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-light tracking-tight text-ivory mb-6 leading-[1.02]">
                        Walk the streets{" "}
                        <em className="italic font-medium text-saffron-bright">before you land</em>
                    </h1>

                    <p className="text-base sm:text-lg text-ivory-muted max-w-xl mx-auto mb-10 leading-relaxed">
                        Type a monument, a bazaar, or an address — and stand there in
                        street-level 360° a moment later.
                    </p>

                </motion.div>

                {/* ── Search container ── */}
                <motion.div
                    ref={dropdownRef}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
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
                                    <Loader2 className="w-5 h-5 animate-spin text-saffron" aria-hidden="true" />
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
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="absolute w-full mt-3 bg-ink-900/95 backdrop-blur-3xl border border-white/[0.09] rounded-3xl shadow-2xl overflow-hidden z-50 p-2"
                            >
                                {suggestions.map((s, i) => (
                                    <button
                                        key={s.place_id || i}
                                        onClick={() => selectSuggestion(s)}
                                        className="w-full text-left px-5 py-4 hover:bg-white/5 rounded-2xl flex items-center gap-4 transition-colors duration-200 group/item"
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
                                            <p className="text-[11px] text-ivory-faint truncate font-medium">
                                                {s.structured_formatting?.secondary_text || "Explore location"}
                                            </p>
                                        </div>
                                        <ArrowRight
                                            className="w-3.5 h-3.5 ml-auto text-transparent group-hover/item:text-ivory-faint transition-colors shrink-0"
                                            aria-hidden="true"
                                        />
                                    </button>
                                ))}

                                {/* Attribution */}
                                <div className="px-5 py-2 border-t border-white/5">
                                    <p className="text-[9px] text-ivory-faint/60 text-center">
                                        Powered by OpenStreetMap · Landmark coordinates hand-verified
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </motion.div>

            </div>
        </div>
    );
};
