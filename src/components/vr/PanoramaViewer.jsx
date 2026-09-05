/**
 * PanoramaViewer — SafarX's own 360° panorama surface.
 *
 * Hard rule #1 of the design system: VR tours are never YouTube videos. This
 * component is what replaces them. It resolves real equirectangular imagery
 * for the site — the tour's own curated, verified panoramas first, a live
 * Mapillary capture second — and paints it on the inside of a three.js sphere:
 * draggable, zoomable, and wearing nothing but SafarX chrome.
 *
 * A site may have been shot from several vantage points (the four gateways at
 * Sanchi, inside and outside the Qutb colonnade, six caves at Ellora). Those
 * arrive as a list, and the viewer offers a switcher for them. Selecting one
 * re-runs the scene effect below, which disposes the old texture, geometry and
 * renderer before the next image is fetched — the same teardown an unmount
 * performs, so switching leaks nothing.
 *
 * There is deliberately no third-party viewer SDK on that path: no iframes, no
 * vendor buttons, no vendor logos. What we owe each source is attribution, and
 * that is rendered in our own type — the curated credit line for a curated
 * image, the Mapillary credit when a live capture is on screen.
 *
 * Google Street View is the one exception, and only for the sites the free
 * sources never covered. Its terms allow the imagery on screen solely through
 * Google's renderer and forbid removing the logo, so those vantages mount
 * `StreetViewStage` instead of the sphere below. It is still a real panorama
 * the visitor drags to look around — rule #1 holds — and every other piece of
 * chrome on screen is still ours.
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
    resolvePanoramaSet,
    findLiveVantages,
    clearPanoramaCache,
    isStreetViewTour,
    PanoramaSource,
} from "../../services/panoramaService";
import {
    hasGoogleMapsKey,
    GOOGLE_MAPS_KEY_ENV,
    GOOGLE_MAPS_CONSOLE_URL,
} from "../../services/googleStreetViewService";
import StreetViewStage from "./StreetViewStage";
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
    panoramas: curatedSet,
    panoramaCredit,
    panoramaSource,
    className = "",
}) => {
    const reduce = useReducedMotion();

    const shellRef = useRef(null);
    const mountRef = useRef(null);
    const controlsRef = useRef(null);
    /* The active pill in the vantage switcher. Sanchi ships eleven vantage
       points, so the strip scrolls — without this the selected one can end up
       off-screen after a keyboard or programmatic change. */
    const activeVantageRef = useRef(null);

    // `vantages` is every 360° view this site offers, in authoring order:
    // the tour's curated images first, then any live Mapillary captures near
    // the same coordinates. `vantageIndex` is the one on screen.
    const [vantages, setVantages] = useState([]);
    const [vantageIndex, setVantageIndex] = useState(0);
    const [phase, setPhase] = useState("locating"); // locating | loading | ready | empty | error
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(null);
    const [attempt, setAttempt] = useState(0);
    const [autoRotate, setAutoRotate] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // The curated vantage currently selected. Clamped, because the vantage list
    // is replaced whenever the tour changes and the old index may not exist.
    const resolved = useMemo(
        () => vantages[Math.min(vantageIndex, vantages.length - 1)] || null,
        [vantages, vantageIndex]
    );

    // Memoised so the three.js effect below re-runs on a real source change,
    // not on every render.
    const active = resolved;

    const coordLabel = formatCoords(latitude, longitude);
    const captureLabel = active?.captureLabel || null;
    // The switcher only earns its space when there is somewhere else to go.
    const hasVantages = vantages.length > 1;

    /* Street View vantages carry a `panoId` and no image file, so they are
       painted by `StreetViewStage` rather than by the three.js effect below —
       which skips itself for exactly that reason, having no `imageUrl`. */
    const isStreetView = active?.source === PanoramaSource.STREET_VIEW;

    /* A tour that opted into Street View but has no key configured would
       otherwise fall through to the generic "coming soon" state, which is the
       wrong diagnosis: the imagery exists, the credential does not. */
    const needsMapsKey =
        phase === "empty" &&
        !hasGoogleMapsKey() &&
        isStreetViewTour({ tourId, latitude, longitude });

    const onStageReady = useCallback(() => {
        setPhase("ready");
        setProgress(null);
    }, []);

    const onStageError = useCallback((err) => {
        setError(err);
        setPhase("error");
    }, []);

    /* ── 1. Resolve the panorama this tour opens with ───────────────── */
    useEffect(() => {
        const controller = new AbortController();
        let alive = true;

        setPhase("locating");
        setVantages([]);
        setVantageIndex(0);
        setError(null);
        setProgress(null);

        resolvePanoramaSet({
            tourId,
            latitude,
            longitude,
            panorama: curatedUrl,
            panoramas: curatedSet,
            panoramaCredit,
            panoramaSource,
            signal: controller.signal,
        })
            .then((result) => {
                if (!alive) return;
                if (!result.length) {
                    setPhase("empty");
                    return;
                }
                setVantages(result);
                setVantageIndex(0);
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
        curatedSet,
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

        /* A place is worth more than one viewpoint. Mapillary's captures are
           appended to the switcher so a site with a single verified panorama
           can still be walked around; only when there are none does the older
           single-capture swap button appear instead. */
        findLiveVantages(latitude, longitude, { signal: controller.signal, limit: 4 }).then(
            (results) => {
                if (!alive || !results.length) return;
                setVantages((current) => {
                    if (!current.length) return current;
                    const seen = new Set(current.map((v) => v.imageUrl));
                    const fresh = results.filter((v) => !seen.has(v.imageUrl));
                    if (!fresh.length) return current;
                    // The curated images stay first; the tour still opens on one.
                    return current[0]?.source === PanoramaSource.MAPILLARY
                        ? current
                        : [...current, ...fresh];
                });
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

    /* Move to another vantage point at the same site.

       Nothing is disposed by hand here: changing `vantageIndex` changes
       `active`, the scene effect's dependency, so React tears the old scene
       down through its cleanup before building the new one. */
    const selectVantage = useCallback(
        (index) => {
            if (index === vantageIndex) return;
            setVantageIndex(index);
            setProgress(null);
            setPhase("loading");
        },
        [vantageIndex]
    );

    /* Keep the selected vantage pill visible inside the scrolling strip. */
    useEffect(() => {
        const el = activeVantageRef.current;
        if (!el?.scrollIntoView) return;
        el.scrollIntoView({
            behavior: reduce ? "auto" : "smooth",
            block: "nearest",
            inline: "center",
        });
    }, [vantageIndex, reduce]);

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

        if (needsMapsKey) {
            return (
                <StateNotice
                    icon={KeyRound}
                    title="This tour needs a Google Maps key"
                    body={
                        <>
                            No freely licensed 360° image of{" "}
                            {name || "this site"} exists, so this tour is served
                            by Street View. Add{" "}
                            <code className="font-data text-saffron">
                                {GOOGLE_MAPS_KEY_ENV}
                            </code>{" "}
                            to your <code className="font-data">.env</code> file
                            with the Maps JavaScript API enabled, then restart
                            the dev server — see{" "}
                            <a
                                href={GOOGLE_MAPS_CONSOLE_URL}
                                target="_blank"
                                rel="noreferrer"
                                className="text-saffron underline decoration-saffron/40 underline-offset-4 hover:decoration-saffron"
                            >
                                the Maps Platform console
                            </a>
                            .
                        </>
                    }
                    actionLabel="Try again"
                    onAction={retry}
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
            {/* The panorama itself — our sphere, or Google's renderer for the
                handful of sites only Street View covers. */}
            <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />
            {isStreetView && (
                <StreetViewStage
                    key={active.panoId}
                    panoId={active.panoId}
                    heading={active.heading}
                    autoRotate={autoRotate}
                    reduceMotion={Boolean(reduce)}
                    controlsRef={controlsRef}
                    onReady={onStageReady}
                    onError={onStageError}
                />
            )}

            {/* Screen-reader description of what the canvas shows */}
            <p className="sr-only">
                {phase === "ready"
                    ? `Interactive 360° panorama of ${name || "this site"}${active?.label ? `, ${active.label}` : ""}${coordLabel ? `, at ${coordLabel}` : ""}. Drag to look around, scroll to zoom.${hasVantages ? ` ${vantages.length} vantage points are available.` : ""}`
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
                    meta={
                        active?.label && hasVantages
                            ? `${active.label} · drag to look around`
                            : region
                              ? `${region} · drag to look around`
                              : "Drag to look around"
                    }
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

            {/* Vantage-point switcher — only when the site was shot more than once.
                Sits above the controls row so it never collides with them, and
                scrolls horizontally at narrow widths rather than wrapping. */}
            {hasVantages && (phase === "ready" || phase === "loading") && (
                <div
                    className="absolute bottom-[4.25rem] left-1/2 z-10 flex max-w-[calc(100%-1.5rem)] -translate-x-1/2 gap-1.5 overflow-x-auto rounded-full border border-white/[0.09] bg-ink-950/80 p-1.5 backdrop-blur-xl [scrollbar-width:none] md:bottom-[5.25rem] md:max-w-[min(70%,52rem)] [&::-webkit-scrollbar]:hidden"
                    role="group"
                    aria-label={`Vantage points at ${name || "this site"}`}
                >
                    {vantages.map((v, i) => {
                        const isActive = i === vantageIndex;
                        return (
                            <button
                                key={v.imageUrl || v.panoId}
                                ref={isActive ? activeVantageRef : null}
                                type="button"
                                onClick={() => selectVantage(i)}
                                aria-pressed={isActive}
                                title={v.label}
                                className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 font-data text-[10px] uppercase tracking-[0.12em] transition-colors duration-300 md:text-[11px] ${
                                    isActive
                                        ? "bg-saffron text-ink-950"
                                        : "text-ivory-muted hover:bg-white/[0.07] hover:text-ivory"
                                }`}
                            >
                                {v.label}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Glass controls */}
            {phase === "ready" && (
                <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 md:bottom-6 md:right-6">
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
