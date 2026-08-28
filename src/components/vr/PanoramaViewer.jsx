/**
 * PanoramaViewer — SafarX's own 360° panorama surface.
 *
 * Hard rule #1 of the design system: VR tours are never YouTube videos. This
 * component is what replaces them. It resolves a real equirectangular image
 * for the site — the tour's own curated, verified panorama first, a live
 * Mapillary capture second — and paints it on the inside of a three.js sphere:
 * draggable, zoomable, and wearing nothing but SafarX chrome.
 *
 * There is deliberately no third-party viewer SDK here: no iframes, no vendor
 * buttons, no vendor logos. What we owe each source is attribution, and that is
 * rendered in our own type — the curated credit line for a curated image, the
 * Mapillary credit when the live capture is on screen.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useReducedMotion } from "framer-motion";
import {
    Maximize2,
    Minimize2,
    RotateCcw,
    Orbit,
    Plus,
    Minus,
    Radio,
    MapPinOff,
    WifiOff,
    KeyRound,
} from "lucide-react";
import {
    describeMapillaryError,
    MapillaryErrorCode,
    MAPILLARY_TOKEN_ENV,
    MAPILLARY_DEVELOPER_URL,
} from "../../services/mapillaryService";
import {
    resolvePanorama,
    findLivePanorama,
    clearPanoramaCache,
    PanoramaSource,
} from "../../services/panoramaService";
import {
    CompassLoader,
    StateNotice,
    ViewportHud,
    GlassIconButton,
} from "../VirtualTour/ImmersiveChrome";
import { formatCoords } from "../VirtualTour/immersiveUtils";

/* ── Camera limits ──────────────────────────────────────────────────── */
const FOV_MIN = 50;
const FOV_MAX = 100;
const FOV_DEFAULT = 78;
const PITCH_LIMIT = 85;
const DAMPING = 0.12;
const INERTIA_DECAY = 0.93;
const AUTO_ROTATE_SPEED = 0.035; // degrees per frame — a slow drift

/* ── Texture loading ────────────────────────────────────────────────── */

/**
 * Loads the equirectangular JPEG.
 *
 * Pass 1 streams the bytes through THREE.FileLoader so the CompassLoader can
 * show *real* download progress. If that path is blocked (CORS, a proxy that
 * strips Content-Length), pass 2 falls back to a plain TextureLoader with an
 * indeterminate loader — the panorama still arrives, just without a bar.
 */
function loadPanoramaTexture(url, { onProgress, isCancelled }) {
    return new Promise((resolve, reject) => {
        const finish = (texture, objectUrl) => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
            if (isCancelled()) {
                texture.dispose();
                return;
            }
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.minFilter = THREE.LinearFilter;
            texture.generateMipmaps = false;
            resolve(texture);
        };

        const loadDirect = () => {
            new THREE.TextureLoader().load(
                url,
                (texture) => finish(texture, null),
                undefined,
                () =>
                    reject(
                        new Error("The panorama image could not be downloaded.")
                    )
            );
        };

        const fileLoader = new THREE.FileLoader();
        fileLoader.setResponseType("blob");
        fileLoader.load(
            url,
            (blob) => {
                if (isCancelled()) return;
                const objectUrl = URL.createObjectURL(blob);
                new THREE.TextureLoader().load(
                    objectUrl,
                    (texture) => finish(texture, objectUrl),
                    undefined,
                    () => {
                        URL.revokeObjectURL(objectUrl);
                        loadDirect();
                    }
                );
            },
            (event) => {
                if (event?.lengthComputable && event.total > 0) {
                    onProgress(Math.round((event.loaded / event.total) * 100));
                }
            },
            () => loadDirect()
        );
    });
}

/* ── Component ──────────────────────────────────────────────────────── */

const PanoramaViewer = ({
    latitude,
    longitude,
    name,
    region,
    tourId,
    panorama: curatedUrl,
    panoramaCredit,
    panoramaSource,
    className = "",
}) => {
    const reduce = useReducedMotion();

    const shellRef = useRef(null);
    const mountRef = useRef(null);
    const controlsRef = useRef(null);

    // `resolved` is what the tour opens with (curated, or Mapillary when the
    // site has no curated image yet). `live` is the optional Mapillary capture
    // offered *alongside* a curated one, and `showLive` picks between them.
    const [resolved, setResolved] = useState(null);
    const [live, setLive] = useState(null);
    const [showLive, setShowLive] = useState(false);
    const [phase, setPhase] = useState("locating"); // locating | loading | ready | empty | error
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(null);
    const [attempt, setAttempt] = useState(0);
    const [autoRotate, setAutoRotate] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Memoised so the three.js effect below re-runs on a real source change,
    // not on every render.
    const active = useMemo(
        () => (showLive && live ? live : resolved),
        [showLive, live, resolved]
    );

    const coordLabel = formatCoords(latitude, longitude);
    const captureLabel = active?.captureLabel || null;
    const canSwapSource = Boolean(resolved && live && resolved !== live);

    /* ── 1. Resolve the panorama this tour opens with ───────────────── */
    useEffect(() => {
        const controller = new AbortController();
        let alive = true;

        setPhase("locating");
        setResolved(null);
        setLive(null);
        setShowLive(false);
        setError(null);
        setProgress(null);

        resolvePanorama({
            tourId,
            latitude,
            longitude,
            panorama: curatedUrl,
            panoramaCredit,
            panoramaSource,
            signal: controller.signal,
        })
            .then((result) => {
                if (!alive) return;
                if (!result) {
                    setPhase("empty");
                    return;
                }
                setResolved(result);
                setPhase("loading");
            })
            .catch((err) => {
                if (!alive || err?.name === "AbortError") return;
                setError(err);
                setPhase("error");
            });

        return () => {
            alive = false;
            controller.abort();
        };
    }, [
        tourId,
        latitude,
        longitude,
        curatedUrl,
        panoramaCredit,
        panoramaSource,
        attempt,
    ]);

    /* ── 1b. Mapillary as an enhancement, never as a dependency ─────── */
    // When a curated image is already on screen we still ask Mapillary whether
    // it has a recent street-level capture here. If it does, the viewer offers
    // it as a second source. Every failure is swallowed inside the service —
    // a tour that is already painting a verified panorama must not break
    // because a token is missing or the network blipped.
    useEffect(() => {
        if (resolved?.source !== PanoramaSource.CURATED) return undefined;

        const controller = new AbortController();
        let alive = true;

        findLivePanorama(latitude, longitude, { signal: controller.signal }).then(
            (result) => {
                if (alive && result) setLive(result);
            }
        );

        return () => {
            alive = false;
            controller.abort();
        };
    }, [resolved, latitude, longitude]);

    /* ── 2. Build the three.js scene around the panorama ─────────────── */
    useEffect(() => {
        const mount = mountRef.current;
        const imageUrl = active?.imageUrl;
        if (!mount || !imageUrl) return undefined;

        let cancelled = false;
        const isCancelled = () => cancelled;

        /* Renderer + scene + camera */
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(mount.clientWidth || 1, mount.clientHeight || 1);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.domElement.style.display = "block";
        renderer.domElement.style.touchAction = "none";
        renderer.domElement.style.cursor = "grab";
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            FOV_DEFAULT,
            (mount.clientWidth || 1) / (mount.clientHeight || 1),
            0.1,
            1100
        );
        camera.position.set(0, 0, 0.01);

        /* The sphere we live inside: flip it so the texture faces in. */
        const geometry = new THREE.SphereGeometry(500, 64, 40);
        geometry.scale(-1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x061412 });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        /* Camera state — plain refs, never React state, so the rAF loop is free */
        const view = {
            lon: 0,
            lat: 0,
            targetLon: 0,
            targetLat: 0,
            fov: FOV_DEFAULT,
            targetFov: FOV_DEFAULT,
            velLon: 0,
            velLat: 0,
        };
        let dragging = false;
        let autoRotateOn = false;
        let pointerCount = 0;
        let pinchStart = 0;
        let pinchStartFov = FOV_DEFAULT;
        const pointers = new Map();
        const last = { x: 0, y: 0 };
        const target = new THREE.Vector3();

        const stopAutoRotate = () => {
            if (!autoRotateOn) return;
            autoRotateOn = false;
            setAutoRotate(false);
        };

        /* ── Pointer / wheel handlers ───────────────────────────────── */
        const canvas = renderer.domElement;

        const onPointerDown = (event) => {
            pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
            pointerCount = pointers.size;
            if (pointerCount === 1) {
                dragging = true;
                last.x = event.clientX;
                last.y = event.clientY;
                view.velLon = 0;
                view.velLat = 0;
                canvas.style.cursor = "grabbing";
                canvas.setPointerCapture?.(event.pointerId);
            } else if (pointerCount === 2) {
                dragging = false;
                const [a, b] = [...pointers.values()];
                pinchStart = Math.hypot(a.x - b.x, a.y - b.y) || 1;
                pinchStartFov = view.targetFov;
            }
            stopAutoRotate();
        };

        const onPointerMove = (event) => {
            if (!pointers.has(event.pointerId)) return;
            pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

            if (pointers.size === 2) {
                const [a, b] = [...pointers.values()];
                const spread = Math.hypot(a.x - b.x, a.y - b.y) || 1;
                view.targetFov = THREE.MathUtils.clamp(
                    pinchStartFov * (pinchStart / spread),
                    FOV_MIN,
                    FOV_MAX
                );
                return;
            }

            if (!dragging) return;
            const scale = (view.fov / FOV_DEFAULT) * 0.11;
            const dx = (event.clientX - last.x) * scale;
            const dy = (event.clientY - last.y) * scale;
            last.x = event.clientX;
            last.y = event.clientY;

            view.targetLon -= dx;
            view.targetLat = THREE.MathUtils.clamp(
                view.targetLat + dy,
                -PITCH_LIMIT,
                PITCH_LIMIT
            );
            view.velLon = -dx;
            view.velLat = dy;
        };

        const onPointerUp = (event) => {
            pointers.delete(event.pointerId);
            pointerCount = pointers.size;
            if (pointerCount === 0) {
                dragging = false;
                canvas.style.cursor = "grab";
            }
            canvas.releasePointerCapture?.(event.pointerId);
        };

        const onWheel = (event) => {
            event.preventDefault();
            stopAutoRotate();
            view.targetFov = THREE.MathUtils.clamp(
                view.targetFov + event.deltaY * 0.05,
                FOV_MIN,
                FOV_MAX
            );
        };

        canvas.addEventListener("pointerdown", onPointerDown);
        canvas.addEventListener("pointermove", onPointerMove);
        canvas.addEventListener("pointerup", onPointerUp);
        canvas.addEventListener("pointercancel", onPointerUp);
        canvas.addEventListener("pointerleave", onPointerUp);
        canvas.addEventListener("wheel", onWheel, { passive: false });

        /* ── Imperative API for the glass control buttons ───────────── */
        controlsRef.current = {
            zoomBy: (delta) => {
                view.targetFov = THREE.MathUtils.clamp(
                    view.targetFov + delta,
                    FOV_MIN,
                    FOV_MAX
                );
            },
            reset: () => {
                view.targetLon = 0;
                view.targetLat = 0;
                view.targetFov = FOV_DEFAULT;
                view.velLon = 0;
                view.velLat = 0;
            },
            setAutoRotate: (on) => {
                autoRotateOn = on;
            },
        };

        /* ── Resize ─────────────────────────────────────────────────── */
        const resize = () => {
            const w = mount.clientWidth || 1;
            const h = mount.clientHeight || 1;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        const observer =
            typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize);
        observer?.observe(mount);
        window.addEventListener("resize", resize);

        /* ── Render loop ────────────────────────────────────────────── */
        let frame = 0;
        const tick = () => {
            frame = requestAnimationFrame(tick);

            if (!dragging) {
                if (Math.abs(view.velLon) > 0.001 || Math.abs(view.velLat) > 0.001) {
                    view.targetLon += view.velLon;
                    view.targetLat = THREE.MathUtils.clamp(
                        view.targetLat + view.velLat,
                        -PITCH_LIMIT,
                        PITCH_LIMIT
                    );
                    view.velLon *= INERTIA_DECAY;
                    view.velLat *= INERTIA_DECAY;
                } else if (autoRotateOn) {
                    view.targetLon += AUTO_ROTATE_SPEED;
                }
            }

            view.lon += (view.targetLon - view.lon) * DAMPING;
            view.lat += (view.targetLat - view.lat) * DAMPING;
            view.fov += (view.targetFov - view.fov) * 0.15;

            if (Math.abs(camera.fov - view.fov) > 0.01) {
                camera.fov = view.fov;
                camera.updateProjectionMatrix();
            }

            const phi = THREE.MathUtils.degToRad(90 - view.lat);
            const theta = THREE.MathUtils.degToRad(view.lon);
            target.setFromSphericalCoords(1, phi, theta);
            camera.lookAt(target);

            renderer.render(scene, camera);
        };
        frame = requestAnimationFrame(tick);

        /* ── Texture ────────────────────────────────────────────────── */
        let texture = null;
        setProgress(null);

        loadPanoramaTexture(imageUrl, {
            onProgress: (pct) => {
                if (!cancelled) setProgress(pct);
            },
            isCancelled,
        })
            .then((loaded) => {
                if (cancelled) {
                    loaded.dispose();
                    return;
                }
                texture = loaded;
                material.map = texture;
                material.color.set(0xffffff);
                material.needsUpdate = true;
                setProgress(100);
                setPhase("ready");
                if (!reduce) {
                    autoRotateOn = true;
                    setAutoRotate(true);
                }
            })
            .catch((err) => {
                if (cancelled) return;
                setError(err);
                setPhase("error");
            });

        /* ── Teardown: nothing may survive an unmount ───────────────── */
        return () => {
            cancelled = true;
            cancelAnimationFrame(frame);
            controlsRef.current = null;

            canvas.removeEventListener("pointerdown", onPointerDown);
            canvas.removeEventListener("pointermove", onPointerMove);
            canvas.removeEventListener("pointerup", onPointerUp);
            canvas.removeEventListener("pointercancel", onPointerUp);
            canvas.removeEventListener("pointerleave", onPointerUp);
            canvas.removeEventListener("wheel", onWheel);
            window.removeEventListener("resize", resize);
            observer?.disconnect();

            scene.remove(sphere);
            geometry.dispose();
            if (material.map) material.map.dispose();
            texture?.dispose();
            material.dispose();

            renderer.dispose();
            renderer.forceContextLoss?.();
            if (canvas.parentNode === mount) mount.removeChild(canvas);
        };
    }, [active, reduce]);

    /* ── Fullscreen ─────────────────────────────────────────────────── */
    useEffect(() => {
        const onChange = () =>
            setIsFullscreen(Boolean(document.fullscreenElement));
        document.addEventListener("fullscreenchange", onChange);
        return () => document.removeEventListener("fullscreenchange", onChange);
    }, []);

    const toggleFullscreen = useCallback(() => {
        const el = shellRef.current;
        if (!el) return;
        if (document.fullscreenElement) document.exitFullscreen?.();
        else el.requestFullscreen?.();
    }, []);

    const toggleAutoRotate = useCallback(() => {
        setAutoRotate((on) => {
            const next = !on;
            controlsRef.current?.setAutoRotate(next);
            return next;
        });
    }, []);

    const retry = useCallback(() => {
        clearPanoramaCache();
        setAttempt((n) => n + 1);
    }, []);

    /* Swap between the curated panorama and the live Mapillary capture. */
    const toggleSource = useCallback(() => {
        setShowLive((on) => !on);
        setProgress(null);
        setPhase("loading");
    }, []);

    /* ── Overlays ───────────────────────────────────────────────────── */

    const isBusy = phase === "locating" || phase === "loading";
    const noToken = error?.code === MapillaryErrorCode.NO_TOKEN;

    const renderOverlay = () => {
        if (isBusy) {
            return (
                <CompassLoader
                    label={
                        phase === "locating"
                            ? "Finding a 360° capture"
                            : "Unrolling the panorama"
                    }
                    detail={coordLabel || name}
                    progress={phase === "loading" ? progress : null}
                />
            );
        }

        if (phase === "empty") {
            return (
                <StateNotice
                    icon={MapPinOff}
                    title="Panorama coming soon"
                    body={`We haven't verified a 360° image of ${name || "this site"} yet, and there's no street-level capture within about a kilometre of it either. We add sites as freely licensed panoramas appear — never as a video embed.`}
                    actionLabel="Check again"
                    onAction={retry}
                />
            );
        }

        if (phase === "error" && noToken) {
            return (
                <StateNotice
                    icon={KeyRound}
                    tone="error"
                    title="360° imagery needs a Mapillary token"
                    body={
                        <>
                            Add{" "}
                            <code className="font-data text-saffron">
                                {MAPILLARY_TOKEN_ENV}
                            </code>{" "}
                            to your <code className="font-data">.env</code> file and
                            restart the dev server. Mapillary access tokens are free —
                            create one at{" "}
                            <a
                                href={MAPILLARY_DEVELOPER_URL}
                                target="_blank"
                                rel="noreferrer"
                                className="text-saffron underline decoration-saffron/40 underline-offset-4 hover:decoration-saffron"
                            >
                                mapillary.com/dashboard/developers
                            </a>
                            .
                        </>
                    }
                    actionLabel="Try again"
                    onAction={retry}
                />
            );
        }

        if (phase === "error") {
            const copy = describeMapillaryError(error);
            return (
                <StateNotice
                    icon={WifiOff}
                    tone="error"
                    title={copy.title}
                    body={error?.message || copy.body}
                    actionLabel="Try again"
                    onAction={retry}
                />
            );
        }

        return null;
    };

    const overlay = renderOverlay();

    return (
        <div
            ref={shellRef}
            className={`relative h-full w-full overflow-hidden bg-ink-950 ${className}`}
        >
            {/* The panorama itself */}
            <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />

            {/* Screen-reader description of what the canvas shows */}
            <p className="sr-only">
                {phase === "ready"
                    ? `Interactive 360° panorama of ${name || "this site"}${coordLabel ? ` at ${coordLabel}` : ""}. Drag to look around, scroll to zoom.`
                    : "Loading a 360° panorama."}
            </p>

            {/* Loading / empty / error veil */}
            {overlay && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-ink-950/95 px-6">
                    {overlay}
                </div>
            )}

            {/* HUD — place name, coordinates, 360° badge */}
            {phase === "ready" && (
                <ViewportHud
                    badge="360°"
                    name={name}
                    coords={coordLabel}
                    meta={region ? `${region} · drag to look around` : "Drag to look around"}
                    className="absolute left-4 top-4 z-10 md:left-6 md:top-6"
                />
            )}

            {/* Attribution — legally required, and rendered in our own type.
                Whichever source is on screen is the one that gets credited. */}
            {phase === "ready" && active?.attribution && (
                <div className="pointer-events-none absolute bottom-4 left-4 z-10 max-w-[70%] md:bottom-6 md:left-6">
                    <p className="glass-panel !rounded-full px-3.5 py-1.5 font-data text-[10px] uppercase tracking-[0.14em] text-ivory-faint">
                        {active.attribution}
                        {captureLabel ? ` · Captured ${captureLabel}` : ""}
                    </p>
                </div>
            )}

            {/* Glass controls */}
            {phase === "ready" && (
                <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 md:bottom-6 md:right-6">
                    {canSwapSource && (
                        <GlassIconButton
                            icon={Radio}
                            label={
                                showLive
                                    ? "Show the curated panorama"
                                    : "Show the live street-level capture"
                            }
                            pressed={showLive}
                            active={showLive}
                            onClick={toggleSource}
                        />
                    )}
                    <GlassIconButton
                        icon={Minus}
                        label="Zoom out"
                        onClick={() => controlsRef.current?.zoomBy(8)}
                    />
                    <GlassIconButton
                        icon={Plus}
                        label="Zoom in"
                        onClick={() => controlsRef.current?.zoomBy(-8)}
                    />
                    <GlassIconButton
                        icon={Orbit}
                        label={autoRotate ? "Stop auto-rotate" : "Start auto-rotate"}
                        pressed={autoRotate}
                        active={autoRotate}
                        onClick={toggleAutoRotate}
                    />
                    <GlassIconButton
                        icon={RotateCcw}
                        label="Reset the view"
                        onClick={() => controlsRef.current?.reset()}
                    />
                    <GlassIconButton
                        icon={isFullscreen ? Minimize2 : Maximize2}
                        label={isFullscreen ? "Exit fullscreen" : "View fullscreen"}
                        pressed={isFullscreen}
                        onClick={toggleFullscreen}
                    />
                </div>
            )}
        </div>
    );
};

export default PanoramaViewer;
