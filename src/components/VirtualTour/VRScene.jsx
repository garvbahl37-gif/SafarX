// VRScene.jsx
// Normal view: Google Street View iframe (free, no API key)
// VR mode:     Three.js + Wikimedia/generated panoramas + WebXR
//
// Chrome follows the SafarX "Peacock & Gold" system — ink glass pills,
// gold icons, Fraunces place names, Space Grotesk coordinates.

import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
    ArrowLeft,
    Maximize,
    Minimize,
    AlertCircle,
    Glasses,
    Monitor,
    Info,
    Keyboard,
    X,
} from "lucide-react";
import VRPanoramaViewer from "./VRPanoramaViewer";
import { getStreetViewMetadata } from "../../services/streetViewService";
import {
    CompassLoader,
    GlassButton,
    GlassIconButton,
    StateNotice,
    ViewportHud,
} from "./ImmersiveChrome";
import { EASE, formatCoords, shortPlaceName } from "./immersiveUtils";

/* ── Google Street View embed (free, no key) ──────────────── */
const streetViewUrl = (lat, lng) =>
    `https://maps.google.com/maps?q=${lat},${lng}&layer=c&cbll=${lat},${lng}&cbp=12,0,0,0,0&output=svembed`;

const KEY_HINTS = [
    { key: "Drag", action: "Look around" },
    { key: "W / ↑", action: "Look up" },
    { key: "S / ↓", action: "Look down" },
    { key: "A / ←", action: "Look left" },
    { key: "D / →", action: "Look right" },
    { key: "Q / −", action: "Zoom out" },
    { key: "E / +", action: "Zoom in" },
    { key: "Scroll", action: "Zoom" },
];

export const VRScene = ({ place, onBack }) => {
    const [viewMode, setViewMode] = useState("normal");
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [hasIframeError, setHasIframeError] = useState(false);

    const [vrMeta, setVrMeta] = useState(null);
    const [vrMetaLoading, setVrMetaLoading] = useState(false);
    const [vrError, setVrError] = useState(null);
    const [vrSupported, setVrSupported] = useState(false);
    const [showControls, setShowControls] = useState(false);

    const containerRef = useRef(null);
    const reduce = useReducedMotion();

    const shortName = shortPlaceName(place?.name || "");
    const coords = formatCoords(place?.lat, place?.lng);

    // Check WebXR
    useEffect(() => {
        if (navigator.xr) {
            navigator.xr
                .isSessionSupported("immersive-vr")
                .then(setVrSupported)
                .catch(() => setVrSupported(false));
        }
    }, []);

    // Fullscreen
    const toggleFullscreen = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;
        if (!document.fullscreenElement)
            el.requestFullscreen?.() || el.webkitRequestFullscreen?.();
        else document.exitFullscreen?.() || document.webkitExitFullscreen?.();
    }, []);

    useEffect(() => {
        const h = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", h);
        return () => document.removeEventListener("fullscreenchange", h);
    }, []);

    // iframe timeout
    useEffect(() => {
        const t = setTimeout(() => {
            if (!iframeLoaded) setIframeLoaded(true);
        }, 8000);
        return () => clearTimeout(t);
    }, [iframeLoaded]);

    // Enter VR
    const handleEnterVR = useCallback(async () => {
        if (vrMeta) {
            setViewMode("vr");
            return;
        }

        setVrMetaLoading(true);
        setVrError(null);

        try {
            const meta = await getStreetViewMetadata(place.lat, place.lng);
            if (meta.available) {
                setVrMeta(meta);
                setViewMode("vr");
            } else {
                setVrError(
                    meta.message ||
                    "No panorama has been published for this spot yet. Try a busier road or a landmark nearby."
                );
            }
        } catch (err) {
            console.warn("VR metadata error:", err);
            setVrError("Could not prepare VR mode. Check your connection and try again.");
        } finally {
            setVrMetaLoading(false);
        }
    }, [place, vrMeta]);

    /* ═══ VR MODE ═══════════════════════════════════════════════ */
    if (viewMode === "vr" && vrMeta) {
        return (
            <Motion.div
                ref={containerRef}
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="relative h-screen w-full select-none overflow-hidden bg-ink-950"
            >
                <VRPanoramaViewer
                    panoId={vrMeta.imageId || vrMeta.panoId}
                    placeName={shortName}
                    coords={coords}
                    isPano={vrMeta.isPano}
                    onError={() => {
                        setViewMode("normal");
                        setVrError("The panorama could not be rendered. Street view is still available.");
                    }}
                />

                {/* Top chrome */}
                <div className="pointer-events-none absolute inset-x-4 top-4 z-[60] flex items-start justify-between gap-3">
                    <GlassButton
                        icon={Monitor}
                        onClick={() => setViewMode("normal")}
                        className="pointer-events-auto"
                    >
                        Street view
                    </GlassButton>

                    <div className="hidden items-center gap-2 sm:flex">
                        <span className="inline-flex items-center gap-2 rounded-full border border-saffron/35 bg-saffron/12 px-3 py-1.5 backdrop-blur-xl">
                            <Glasses className="h-3.5 w-3.5 text-saffron" aria-hidden="true" />
                            <span className="font-data text-[10px] uppercase tracking-[0.24em] text-saffron">
                                VR 360°
                            </span>
                        </span>
                        <span className="inline-flex max-w-[15rem] items-center gap-2 rounded-full border border-white/[0.09] bg-ink-950/70 px-3 py-1.5 backdrop-blur-xl">
                            <span className="route-dot animate-pulse" aria-hidden="true" />
                            <span className="truncate font-data text-[10px] uppercase tracking-[0.16em] text-ivory-muted">
                                {coords || shortName}
                            </span>
                        </span>
                    </div>

                    <GlassButton icon={ArrowLeft} onClick={onBack} className="pointer-events-auto">
                        Search
                    </GlassButton>
                </div>

                {/* Keyboard help */}
                <GlassIconButton
                    icon={Keyboard}
                    label={showControls ? "Hide keyboard controls" : "Show keyboard controls"}
                    pressed={showControls}
                    onClick={() => setShowControls((v) => !v)}
                    className="absolute bottom-5 right-5 z-[60]"
                />

                <AnimatePresence>
                    {showControls && (
                        <Motion.div
                            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                            transition={{ duration: 0.3, ease: EASE }}
                            className="glass-panel absolute bottom-16 right-5 z-[60] w-60 p-4"
                        >
                            <p className="eyebrow mb-3 !text-[10px]">Controls</p>
                            {KEY_HINTS.map(({ key, action }) => (
                                <div
                                    key={key}
                                    className="flex items-center justify-between border-b border-white/[0.06] py-1.5 last:border-0"
                                >
                                    <span className="rounded border border-white/[0.09] bg-white/[0.05] px-2 py-0.5 font-data text-[10px] text-ivory-muted">
                                        {key}
                                    </span>
                                    <span className="text-[11px] text-ivory-faint">{action}</span>
                                </div>
                            ))}
                            {!vrSupported && (
                                <div className="mt-3 flex items-start gap-2 rounded-lg border border-saffron/25 bg-saffron/10 p-2.5">
                                    <Info className="mt-0.5 h-3 w-3 shrink-0 text-saffron" aria-hidden="true" />
                                    <p className="text-[10px] leading-relaxed text-ivory-muted">
                                        No headset detected. Connect one and open SteamVR or Oculus to
                                        enter immersive mode.
                                    </p>
                                </div>
                            )}
                        </Motion.div>
                    )}
                </AnimatePresence>
            </Motion.div>
        );
    }

    /* ═══ NORMAL VIEW ═══════════════════════════════════════════ */
    return (
        <Motion.div
            ref={containerRef}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.01 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="relative h-screen w-full select-none overflow-hidden bg-ink-950"
        >
            {/* Google Street View iframe — free, no API key */}
            <iframe
                src={streetViewUrl(place.lat, place.lng)}
                className="h-full w-full border-0"
                allowFullScreen
                referrerPolicy="no-referrer"
                loading="eager"
                allow="accelerometer; gyroscope"
                onLoad={() => setIframeLoaded(true)}
                onError={() => setHasIframeError(true)}
                title={`Street view of ${shortName || "the selected place"}`}
            />

            {/* Loading */}
            <AnimatePresence>
                {!iframeLoaded && !hasIframeError && (
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: EASE }}
                        className="absolute inset-0 z-30 flex items-center justify-center bg-ink-950"
                    >
                        <CompassLoader
                            label="Finding your footing on the street"
                            detail={coords || shortName}
                        />
                    </Motion.div>
                )}
            </AnimatePresence>

            {/* iframe error */}
            {hasIframeError && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-ink-950">
                    <StateNotice
                        icon={AlertCircle}
                        tone="error"
                        title="No street imagery here"
                        body="Nobody has driven a camera down this road yet. Search for a nearby junction, a main road, or the landmark itself."
                        actionLabel="Back to search"
                        onAction={onBack}
                    />
                </div>
            )}

            {/* Chrome */}
            {!hasIframeError && (
                <>
                    {/* Back */}
                    <div className="absolute left-4 top-4 z-[60]">
                        <GlassButton icon={ArrowLeft} onClick={onBack}>
                            Back to search
                        </GlassButton>
                    </div>

                    {/* Heads-up readout */}
                    <ViewportHud
                        badge="Live · 360°"
                        name={shortName}
                        coords={coords}
                        meta="Street level"
                        className="absolute right-4 top-4 z-[60]"
                    />

                    {/* Bottom dock */}
                    {iframeLoaded && (
                        <Motion.div
                            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
                            className="absolute bottom-5 left-1/2 z-[60] -translate-x-1/2"
                        >
                            <div className="flex items-center gap-2 rounded-full border border-white/[0.09] bg-ink-950/75 px-2 py-1.5 backdrop-blur-2xl">
                                <span className="flex items-center gap-2 rounded-full bg-white/[0.05] px-3 py-1.5">
                                    <Monitor className="h-3.5 w-3.5 text-saffron/80" aria-hidden="true" />
                                    <span className="font-data text-[9px] uppercase tracking-[0.2em] text-ivory-muted">
                                        Street
                                    </span>
                                </span>

                                <span className="h-6 w-px bg-white/10" aria-hidden="true" />

                                <button
                                    type="button"
                                    onClick={handleEnterVR}
                                    disabled={vrMetaLoading}
                                    aria-label="Enter VR mode"
                                    className="group flex items-center gap-2 rounded-full border border-saffron/40 bg-saffron/12 px-4 py-2 transition-colors duration-300 hover:bg-saffron/22 disabled:opacity-50"
                                >
                                    {vrMetaLoading ? (
                                        <span className="route-dot animate-pulse" aria-hidden="true" />
                                    ) : (
                                        <Glasses className="h-3.5 w-3.5 text-saffron" aria-hidden="true" />
                                    )}
                                    <span className="font-data text-[10px] font-semibold uppercase tracking-[0.18em] text-saffron">
                                        {vrMetaLoading ? "Preparing" : "Enter VR"}
                                    </span>
                                </button>

                                <span className="h-6 w-px bg-white/10" aria-hidden="true" />

                                <GlassIconButton
                                    icon={isFullscreen ? Minimize : Maximize}
                                    label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                                    pressed={isFullscreen}
                                    onClick={toggleFullscreen}
                                    className="!border-transparent !bg-transparent"
                                />
                            </div>
                        </Motion.div>
                    )}

                    {/* VR error */}
                    <AnimatePresence>
                        {vrError && (
                            <Motion.div
                                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                                transition={{ duration: 0.35, ease: EASE }}
                                className="glass-panel absolute bottom-24 left-1/2 z-[70] flex max-w-sm -translate-x-1/2 items-start gap-3 px-5 py-3.5"
                                role="alert"
                            >
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-saffron" aria-hidden="true" />
                                <p className="text-xs leading-relaxed text-ivory-muted">{vrError}</p>
                                <button
                                    type="button"
                                    onClick={() => setVrError(null)}
                                    aria-label="Dismiss message"
                                    className="shrink-0 text-ivory-faint transition-colors hover:text-ivory"
                                >
                                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                                </button>
                            </Motion.div>
                        )}
                    </AnimatePresence>

                    {/* First-run hint */}
                    {iframeLoaded && (
                        <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 animate-[safarxFade_5s_forwards]">
                            <div className="glass-panel px-5 py-3 text-center">
                                <p className="text-xs font-medium text-ivory-muted">
                                    Drag to look around in 360°
                                </p>
                                <p className="mt-1 font-data text-[10px] uppercase tracking-[0.18em] text-ivory-faint">
                                    Enter VR for the headset experience
                                </p>
                            </div>
                        </div>
                    )}
                </>
            )}

            <style>{`
                @keyframes safarxFade{0%,60%{opacity:1}100%{opacity:0}}
                @media (prefers-reduced-motion: reduce){
                    .animate-\\[safarxFade_5s_forwards\\]{animation:none;opacity:0}
                }
            `}</style>
        </Motion.div>
    );
};
