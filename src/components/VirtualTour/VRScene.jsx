// VRScene.jsx
// Normal View: Google Street View iframe (free, no API key)
// VR Mode: Three.js + Wikimedia/Generated panoramas + WebXR

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
    Loader2,
    ArrowLeft,
    Maximize,
    Minimize,
    AlertCircle,
    Glasses,
    Monitor,
    Info,
    Keyboard,
} from "lucide-react";
import VRPanoramaViewer from "./VRPanoramaViewer";
import { getStreetViewMetadata } from "../../services/streetViewService";

/* ── Google Street View embed (free, no key) ──────────────── */
const streetViewUrl = (lat, lng) =>
    `https://maps.google.com/maps?q=${lat},${lng}&layer=c&cbll=${lat},${lng}&cbp=12,0,0,0,0&output=svembed`;

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
                setVrError(meta.message || "No panorama data available.");
            }
        } catch (err) {
            setVrError("Failed to prepare VR mode.");
        } finally {
            setVrMetaLoading(false);
        }
    }, [place, vrMeta]);

    /* ═══ VR MODE ═══════════════════════════════════════════════ */
    if (viewMode === "vr" && vrMeta) {
        return (
            <div
                ref={containerRef}
                className="relative w-full h-screen bg-black overflow-hidden select-none"
            >
                <VRPanoramaViewer
                    panoId={vrMeta.imageId || vrMeta.panoId}
                    placeName={place.name}
                    isPano={vrMeta.isPano}
                    onError={() => {
                        setViewMode("normal");
                        setVrError("VR rendering failed.");
                    }}
                />

                {/* Top bar */}
                <div className="absolute top-4 left-4 right-4 z-[60] flex items-center justify-between pointer-events-none">
                    <button
                        onClick={() => setViewMode("normal")}
                        className="pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 hover:bg-black/80 transition-all"
                    >
                        <Monitor className="w-3.5 h-3.5 text-white/70" />
                        <span className="text-[11px] font-semibold text-white/60">
                            Normal View
                        </span>
                    </button>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 backdrop-blur-md border border-cyan-500/20">
                            <Glasses className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="text-[10px] font-bold text-cyan-300 tracking-wider uppercase">
                                VR 360°
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-[10px] font-medium text-white/50 max-w-[180px] truncate">
                                {place.name?.split(",").slice(0, 2).join(",").trim()}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={onBack}
                        className="pointer-events-auto flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 hover:bg-black/80 transition-all"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 text-white/70" />
                        <span className="text-[11px] font-semibold text-white/60">
                            Search
                        </span>
                    </button>
                </div>

                {/* Controls toggle */}
                <button
                    onClick={() => setShowControls(!showControls)}
                    className="absolute bottom-5 right-5 z-[60] w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/80 transition-all"
                >
                    <Keyboard className="w-4 h-4 text-white/40" />
                </button>

                {showControls && (
                    <div className="absolute bottom-16 right-5 z-[60] bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 w-56">
                        <p className="text-white/70 text-xs font-bold mb-3 uppercase tracking-wider">
                            Controls
                        </p>
                        {[
                            { key: "🖱️ Drag", action: "Look around" },
                            { key: "W / ↑", action: "Look up" },
                            { key: "S / ↓", action: "Look down" },
                            { key: "A / ←", action: "Look left" },
                            { key: "D / →", action: "Look right" },
                            { key: "Q / -", action: "Zoom out" },
                            { key: "E / +", action: "Zoom in" },
                            { key: "Scroll", action: "Zoom" },
                            { key: "VR Btn", action: "Enter headset" },
                        ].map(({ key, action }) => (
                            <div
                                key={key}
                                className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0"
                            >
                                <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-white/60">
                                    {key}
                                </span>
                                <span className="text-[10px] text-white/30">{action}</span>
                            </div>
                        ))}
                        {!vrSupported && (
                            <div className="mt-3 flex items-start gap-2 p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                <Info className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" />
                                <p className="text-[9px] text-amber-300/70">
                                    No VR headset detected. Connect headset and open SteamVR/Oculus.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    /* ═══ NORMAL VIEW ═══════════════════════════════════════════ */
    return (
        <div
            ref={containerRef}
            className="relative w-full h-screen bg-black select-none overflow-hidden"
        >
            {/* Loading */}
            {!iframeLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0B0E14] z-30">
                    <div className="text-center">
                        <div className="relative w-14 h-14 mx-auto mb-4">
                            <div className="absolute inset-0 rounded-full border border-cyan-500/15 animate-ping" />
                            <Loader2 className="absolute inset-0 m-auto w-5 h-5 text-cyan-400 animate-spin" />
                        </div>
                        <p className="text-white/70 text-sm font-medium">
                            Loading 360° Street View
                        </p>
                        <p className="text-white/30 text-[10px] mt-1">
                            {place.name?.split(",").slice(0, 2).join(",").trim()}
                        </p>
                    </div>
                </div>
            )}

            {/* Google Street View iframe — FREE, no API key */}
            <iframe
                src={streetViewUrl(place.lat, place.lng)}
                className="w-full h-full border-0"
                allowFullScreen
                referrerPolicy="no-referrer"
                loading="eager"
                allow="accelerometer; gyroscope"
                onLoad={() => setIframeLoaded(true)}
                onError={() => setHasIframeError(true)}
                title="360° Street View"
            />

            {/* iframe error */}
            {hasIframeError && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0B0E14] z-30">
                    <div className="text-center max-w-[300px]">
                        <AlertCircle className="w-10 h-10 text-red-400/70 mx-auto mb-3" />
                        <p className="text-white/80 text-sm font-semibold mb-1">
                            Street View Unavailable
                        </p>
                        <p className="text-white/40 text-xs">
                            No coverage at this location.
                        </p>
                        <button
                            onClick={onBack}
                            className="mt-4 px-4 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white/60 text-xs font-medium hover:bg-white/[0.1] transition-all"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            )}

            {/* Controls when loaded */}
            {iframeLoaded && (
                <>
                    {/* Back */}
                    <div className="absolute top-4 left-4 z-[60]">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/[0.06] hover:bg-black/80 transition-all"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 text-white/70" />
                            <span className="text-[11px] font-medium text-white/50">
                                Back
                            </span>
                        </button>
                    </div>

                    {/* Location badge */}
                    <div className="absolute top-4 right-4 z-[60]">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/[0.05]">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-[10px] font-medium text-white/50 truncate max-w-[200px]">
                                {place.name?.split(",").slice(0, 2).join(",").trim()}
                            </span>
                        </div>
                    </div>

                    {/* Bottom controls */}
                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[60]">
                        <div className="flex items-center gap-2 px-2 py-1.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/[0.06]">
                            {/* Current mode */}
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5">
                                <Monitor className="w-3.5 h-3.5 text-white/40" />
                                <span className="text-[9px] font-bold uppercase tracking-wider text-white/25">
                                    Normal
                                </span>
                            </div>

                            <div className="w-px h-6 bg-white/10" />

                            {/* VR button */}
                            <button
                                onClick={handleEnterVR}
                                disabled={vrMetaLoading}
                                className="relative group flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 disabled:opacity-50 overflow-hidden"
                                style={{
                                    background:
                                        "linear-gradient(135deg, rgba(6,182,212,0.15), rgba(99,102,241,0.15))",
                                    border: "1px solid rgba(6,182,212,0.25)",
                                }}
                            >
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-cyan-500/10 to-indigo-500/10" />
                                {vrMetaLoading ? (
                                    <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                                ) : (
                                    <Glasses className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                                )}
                                <span className="text-[11px] font-bold text-cyan-300 tracking-wide relative z-10">
                                    {vrMetaLoading ? "Preparing..." : "Enter VR Mode"}
                                </span>
                                {vrSupported && !vrMetaLoading && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                )}
                            </button>

                            <div className="w-px h-6 bg-white/10" />

                            <CtrlBtn
                                icon={isFullscreen ? Minimize : Maximize}
                                label={isFullscreen ? "Exit" : "Full"}
                                onClick={toggleFullscreen}
                            />
                        </div>
                    </div>

                    {/* VR error */}
                    {vrError && (
                        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[70] bg-red-500/10 border border-red-500/30 backdrop-blur-xl rounded-2xl px-5 py-3 flex items-center gap-3 max-w-sm">
                            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                            <p className="text-xs text-red-300">{vrError}</p>
                            <button onClick={() => setVrError(null)}>
                                <span className="text-white/40 text-xs hover:text-white/70">
                                    ✕
                                </span>
                            </button>
                        </div>
                    )}

                    {/* Hint */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 animate-[fadeOut_4s_forwards]">
                        <div className="bg-black/50 backdrop-blur-md rounded-lg px-4 py-2.5 border border-white/[0.05] text-center">
                            <p className="text-white/60 text-xs font-medium">
                                Drag to explore in 360°
                            </p>
                            <p className="text-white/25 text-[10px] mt-0.5">
                                Click "Enter VR Mode" for headset experience
                            </p>
                        </div>
                    </div>
                </>
            )}

            <style>{`@keyframes fadeOut{0%{opacity:1}70%{opacity:1}100%{opacity:0;pointer-events:none}}`}</style>
        </div>
    );
};

const CtrlBtn = ({ icon: Icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all cursor-pointer hover:bg-white/[0.04] active:scale-95"
    >
        <Icon className="w-4 h-4 text-white/50" />
        <span className="text-[8px] font-semibold uppercase tracking-wider text-white/25">
            {label}
        </span>
    </button>
);