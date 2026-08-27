// VRPanoramaViewer.jsx
// Multi-source VR panorama renderer
// Handles: Google SV tiles, Wikimedia 360°, Flickr panos,
//          Panoramax, Wikipedia images, Generated panoramas

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { AlertCircle, Image as ImageIcon } from "lucide-react";
import { getImageUrls, generatePanoramaTiles } from "../../services/streetViewService";
import { CompassLoader, StateNotice } from "./ImmersiveChrome";
import { EASE } from "./immersiveUtils";

const SOURCE_LABELS = {
    google_streetview: "Google Street View 360°",
    wikimedia_panorama: "Wikimedia Commons panorama",
    wikimedia_image: "Wikimedia Commons",
    flickr_panorama: "Flickr 360° photo",
    panoramax: "Panoramax street imagery",
    wikipedia_image: "Wikipedia",
    generated: "Panorama built from map data",
};

const VRPanoramaViewer = ({ panoId, placeName, coords, isPano = true, onError }) => {
    const mountRef = useRef(null);
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);
    const sceneRef = useRef(null);
    const sphereRef = useRef(null);
    const vrButtonRef = useRef(null);
    const isDraggingRef = useRef(false);
    const previousMouseRef = useRef({ x: 0, y: 0 });
    const rotationRef = useRef({ x: 0, y: 0 });
    const cleanupFnsRef = useRef([]);

    const [loadingState, setLoadingState] = useState({
        isLoading: true,
        progress: 0,
        message: "Warming up the viewer",
        error: null,
    });
    const [vrSupported, setVrSupported] = useState(false);
    const [isInVR, setIsInVR] = useState(false);
    const [sourceLabel, setSourceLabel] = useState("");
    const [isFlatProjection, setIsFlatProjection] = useState(false);

    useEffect(() => {
        if (navigator.xr) {
            navigator.xr.isSessionSupported("immersive-vr")
                .then(setVrSupported)
                .catch(() => setVrSupported(false));
        }
    }, []);

    // ─── Load Texture — Handles ALL Sources ───────────────────
    const loadTexture = useCallback(async () => {
        setLoadingState({
            isLoading: true,
            progress: 5,
            message: "Fetching panorama data",
            error: null,
        });

        try {
            const imageData = await getImageUrls(panoId);
            if (!imageData) throw new Error("No image data available");

            const src = imageData.source || "unknown";
            setSourceLabel(SOURCE_LABELS[src] || src);

            // ─── CASE 1: Google Street View Tiles ───
            if (imageData.tileMode && imageData.tiles) {
                setLoadingState((p) => ({
                    ...p,
                    progress: 10,
                    message: "Loading Street View tiles",
                }));
                return await loadGoogleSVTiles(imageData);
            }

            // ─── CASE 2: Direct Image URL (Wikimedia, Flickr, etc.) ───
            if (imageData.urlOriginal || imageData.url2048) {
                setLoadingState((p) => ({
                    ...p,
                    progress: 15,
                    message: "Loading the panorama",
                }));
                const imgUrl = imageData.urlOriginal || imageData.url2048;
                return await loadDirectImage(imgUrl, imageData.isPano);
            }

            // ─── CASE 3: Generated Panorama ───
            if (imageData.lat !== undefined && imageData.lng !== undefined) {
                setLoadingState((p) => ({
                    ...p,
                    progress: 10,
                    message: "Building a panorama from map data",
                }));
                return await buildGeneratedPanorama(imageData.lat, imageData.lng);
            }

            throw new Error("Unknown image data format");
        } catch (error) {
            console.warn("[VRPanorama] Could not prepare texture:", error?.message || error);
            throw error;
        }
    }, [panoId]);

    /**
     * Load Google Street View tiles and stitch into equirectangular
     * This gives the BEST quality — real 360° street view
     */
    const loadGoogleSVTiles = async (imageData) => {
        const { tiles, tilesX, tilesY, tileWidth, tileHeight } = imageData;
        const totalWidth = tilesX * tileWidth;
        const totalHeight = tilesY * tileHeight;

        const canvas = document.createElement("canvas");
        canvas.width = totalWidth;
        canvas.height = totalHeight;
        const ctx = canvas.getContext("2d");

        // Black background
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, totalWidth, totalHeight);

        const total = tiles.length;
        let loaded = 0;
        let failed = 0;

        const loadPromises = tiles.map((tile) => {
            return new Promise((resolve) => {
                const img = new window.Image();
                img.crossOrigin = "anonymous";

                img.onload = () => {
                    ctx.drawImage(
                        img,
                        tile.x * tileWidth,
                        tile.y * tileHeight,
                        tileWidth,
                        tileHeight
                    );
                    loaded++;
                    const pct = 10 + Math.floor((loaded / total) * 70);
                    setLoadingState((p) => ({
                        ...p,
                        progress: pct,
                        message: `Loading tiles · ${loaded}/${total}`,
                    }));
                    resolve(true);
                };

                img.onerror = () => {
                    failed++;
                    loaded++;
                    console.warn(`Tile ${tile.x},${tile.y} failed`);
                    resolve(false);
                };

                img.src = tile.url;
            });
        });

        await Promise.all(loadPromises);

        if (failed > total * 0.5) {
            throw new Error(`Too many tiles failed (${failed}/${total})`);
        }

        console.log(
            `[GoogleSV] Loaded ${loaded - failed}/${total} tiles (${totalWidth}x${totalHeight})`
        );

        setLoadingState((p) => ({
            ...p,
            progress: 85,
            message: "Building the 360° sphere",
        }));

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;

        return { texture, isPanoTexture: true };
    };

    /**
     * Load a direct image URL as texture
     */
    const loadDirectImage = (url, isPanoImg) => {
        return new Promise((resolve, reject) => {
            const loader = new THREE.TextureLoader();
            loader.setCrossOrigin("anonymous");

            loader.load(
                url,
                (texture) => {
                    texture.colorSpace = THREE.SRGBColorSpace;
                    texture.minFilter = THREE.LinearFilter;
                    texture.magFilter = THREE.LinearFilter;
                    texture.generateMipmaps = false;
                    setLoadingState((p) => ({ ...p, progress: 80, message: "Building the 360° sphere" }));
                    resolve({ texture, isPanoTexture: isPanoImg });
                },
                (progress) => {
                    if (progress.total > 0) {
                        const pct = 15 + Math.floor((progress.loaded / progress.total) * 60);
                        setLoadingState((p) => ({
                            ...p,
                            progress: pct,
                            message: `Downloading imagery · ${Math.round((progress.loaded / progress.total) * 100)}%`,
                        }));
                    }
                },
                (err) => {
                    console.error("Image load error:", err);
                    reject(new Error("Failed to load panorama image"));
                }
            );
        });
    };

    /**
     * Build panorama from OSM map tiles
     */
    const buildGeneratedPanorama = async (lat, lng) => {
        const tiles = generatePanoramaTiles(lat, lng);
        const tileSize = 256;
        const cols = tiles.length;
        const rows = 3;

        const canvas = document.createElement("canvas");
        canvas.width = tileSize * cols;
        canvas.height = tileSize * rows;
        const ctx = canvas.getContext("2d");

        // Sky gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGrad.addColorStop(0, "#061412");
        skyGrad.addColorStop(0.15, "#0A1D1A");
        skyGrad.addColorStop(0.33, "#17352D");
        skyGrad.addColorStop(0.5, "#2E8B74");
        skyGrad.addColorStop(0.7, "#102822");
        skyGrad.addColorStop(1, "#061412");
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let loaded = 0;
        const loadPromises = tiles.map((tile, idx) => {
            return new Promise((resolve) => {
                const img = new window.Image();
                img.crossOrigin = "anonymous";
                img.onload = () => {
                    // Middle row: main map tiles
                    ctx.drawImage(img, idx * tileSize, tileSize, tileSize, tileSize);
                    // Top row: sky-tinted version
                    ctx.save();
                    ctx.globalAlpha = 0.3;
                    ctx.drawImage(img, idx * tileSize, 0, tileSize, tileSize);
                    ctx.restore();
                    // Bottom row: darker ground
                    ctx.save();
                    ctx.globalAlpha = 0.4;
                    ctx.translate(idx * tileSize + tileSize / 2, tileSize * 2 + tileSize / 2);
                    ctx.scale(1, -0.7);
                    ctx.drawImage(img, -tileSize / 2, -tileSize / 2, tileSize, tileSize);
                    ctx.restore();

                    loaded++;
                    const pct = 10 + Math.floor((loaded / tiles.length) * 60);
                    setLoadingState((p) => ({
                        ...p,
                        progress: pct,
                        message: `Stitching panorama · ${loaded}/${tiles.length}`,
                    }));
                    resolve(true);
                };
                img.onerror = () => {
                    loaded++;
                    // Try fallback URL
                    if (tile.urls && tile.urls.length > 1) {
                        const fallbackImg = new window.Image();
                        fallbackImg.crossOrigin = "anonymous";
                        fallbackImg.onload = () => {
                            ctx.drawImage(fallbackImg, idx * tileSize, tileSize, tileSize, tileSize);
                            resolve(true);
                        };
                        fallbackImg.onerror = () => resolve(false);
                        fallbackImg.src = tile.urls[1];
                    } else {
                        resolve(false);
                    }
                };
                img.src = tile.urls?.[0] || tile.url;
            });
        });

        await Promise.all(loadPromises);

        // Compass labels
        ctx.fillStyle = "rgba(212,168,67,0.22)";
        ctx.font = "bold 28px sans-serif";
        ctx.textAlign = "center";
        tiles.forEach((tile, i) => {
            ctx.fillText(tile.label, i * tileSize + tileSize / 2, tileSize + tileSize - 15);
        });

        setLoadingState((p) => ({ ...p, progress: 80, message: "Building the 360° sphere" }));

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;

        return { texture, isPanoTexture: true };
    };

    // ─── Init Three.js Scene ──────────────────────────────────
    const initScene = useCallback(async () => {
        if (!mountRef.current || !panoId) return;

        try {
            const { texture, isPanoTexture } = await loadTexture();
            setIsFlatProjection(!isPanoTexture);

            setLoadingState((p) => ({ ...p, progress: 90, message: "Starting the renderer" }));

            const renderer = new THREE.WebGLRenderer({
                antialias: true,
                powerPreference: "high-performance",
            });
            const w = mountRef.current.clientWidth;
            const h = mountRef.current.clientHeight;
            renderer.setSize(w, h);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.xr.enabled = true;
            renderer.outputColorSpace = THREE.SRGBColorSpace;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.1;
            mountRef.current.appendChild(renderer.domElement);
            rendererRef.current = renderer;

            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0x000000);
            sceneRef.current = scene;

            const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 2000);
            camera.position.set(0, 0, 0);
            cameraRef.current = camera;

            // Sphere
            const geo = new THREE.SphereGeometry(500, 64, 32);
            geo.scale(-1, 1, 1);
            const mat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.FrontSide });
            const sphere = new THREE.Mesh(geo, mat);
            scene.add(sphere);
            sphereRef.current = sphere;

            // Floor ring
            const ringGeo = new THREE.RingGeometry(1.5, 1.7, 64);
            const ringMat = new THREE.MeshBasicMaterial({
                color: 0xd4a843, transparent: true, opacity: 0.12, side: THREE.DoubleSide,
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = -Math.PI / 2;
            ring.position.y = -1.6;
            scene.add(ring);

            // Crosshair
            const dotGeo = new THREE.SphereGeometry(0.015, 16, 16);
            const dotMat = new THREE.MeshBasicMaterial({
                color: 0xd4a843, transparent: true, opacity: 0.3,
            });
            const dot = new THREE.Mesh(dotGeo, dotMat);
            dot.position.set(0, 0, -2);
            camera.add(dot);
            scene.add(camera);

            if (vrSupported) setupVRButton(renderer);

            const onResize = () => {
                if (!mountRef.current) return;
                camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
            };
            window.addEventListener("resize", onResize);
            cleanupFnsRef.current.push(() => window.removeEventListener("resize", onResize));

            renderer.setAnimationLoop(() => {
                if (!renderer.xr.isPresenting) {
                    camera.rotation.order = "YXZ";
                    camera.rotation.y = rotationRef.current.y;
                    camera.rotation.x = rotationRef.current.x;
                }
                renderer.render(scene, camera);
            });

            setLoadingState({ isLoading: false, progress: 100, message: "", error: null });
        } catch (error) {
            console.error("VR init error:", error);
            setLoadingState({ isLoading: false, progress: 0, message: "", error: error.message });
            onError?.();
        }
    }, [panoId, isPano, vrSupported, loadTexture, onError]);

    // ─── VR Button ────────────────────────────────────────────
    const setupVRButton = useCallback((renderer) => {
        if (!mountRef.current) return;
        const btn = document.createElement("button");
        btn.id = "vr-btn";
        btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg"><path d="M2 9a2 2 0 012-2h16a2 2 0 012 2v6a2 2 0 01-2 2h-4l-2 3-2-3H4a2 2 0 01-2-2V9z"/><circle cx="8" cy="12" r="1"/><circle cx="16" cy="12" r="1"/></svg><span>Enter VR</span>`;
        btn.setAttribute("aria-label", "Enter VR with a connected headset");
        Object.assign(btn.style, {
            position: "absolute", bottom: "80px", left: "50%", transform: "translateX(-50%)",
            zIndex: "100", display: "flex", alignItems: "center", gap: "10px",
            padding: "13px 26px", background: "rgba(212,168,67,0.14)", backdropFilter: "blur(16px)",
            border: "1px solid rgba(212,168,67,0.45)", borderRadius: "999px", color: "#E5BE5C",
            fontSize: "12px", fontWeight: "700", letterSpacing: "0.16em", textTransform: "uppercase",
            cursor: "pointer", transition: "background 0.3s ease, transform 0.3s ease",
            fontFamily: '"Space Grotesk", monospace', outline: "none",
        });
        btn.onmouseenter = () => {
            btn.style.background = "rgba(212,168,67,0.26)";
            btn.style.transform = "translateX(-50%) translateY(-2px)";
        };
        btn.onmouseleave = () => {
            btn.style.background = "rgba(212,168,67,0.14)";
            btn.style.transform = "translateX(-50%)";
        };
        btn.onclick = async () => {
            try {
                if (renderer.xr.isPresenting) {
                    renderer.xr.getSession()?.end();
                } else {
                    const session = await navigator.xr.requestSession("immersive-vr", {
                        optionalFeatures: ["local-floor", "bounded-floor", "hand-tracking"],
                    });
                    renderer.xr.setSession(session);
                    btn.querySelector("span").textContent = "Exit VR";
                    setIsInVR(true);
                    session.addEventListener("end", () => {
                        btn.querySelector("span").textContent = "Enter VR";
                        setIsInVR(false);
                    });
                }
            } catch (err) {
                console.warn("VR session error:", err);
                alert(
                    `VR could not start: ${err.message}\n\nConnect a headset and open SteamVR or Oculus, then try again.`
                );
            }
        };
        vrButtonRef.current = btn;
        mountRef.current.appendChild(btn);
    }, []);

    // ─── Mouse / Keyboard / Touch Controls ────────────────────
    const setupControls = useCallback(() => {
        const el = mountRef.current;
        if (!el) return () => { };

        const onMD = (e) => {
            if (e.button !== 0) return;
            isDraggingRef.current = true;
            previousMouseRef.current = { x: e.clientX, y: e.clientY };
            el.style.cursor = "grabbing";
        };
        const onMM = (e) => {
            if (!isDraggingRef.current) return;
            const dx = e.clientX - previousMouseRef.current.x;
            const dy = e.clientY - previousMouseRef.current.y;
            previousMouseRef.current = { x: e.clientX, y: e.clientY };
            rotationRef.current.y -= dx * 0.004;
            rotationRef.current.x = clamp(rotationRef.current.x - dy * 0.004, -1.5, 1.5);
        };
        const onMU = () => { isDraggingRef.current = false; el.style.cursor = "grab"; };
        const onWh = (e) => {
            if (!cameraRef.current) return;
            cameraRef.current.fov = clamp(cameraRef.current.fov + e.deltaY * 0.05, 30, 100);
            cameraRef.current.updateProjectionMatrix();
        };

        let lt = null, lp = null;
        const onTS = (e) => {
            if (e.touches.length === 1) lt = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            else if (e.touches.length === 2) lp = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        };
        const onTM = (e) => {
            e.preventDefault();
            if (e.touches.length === 1 && lt) {
                const dx = e.touches[0].clientX - lt.x, dy = e.touches[0].clientY - lt.y;
                lt = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                rotationRef.current.y -= dx * 0.004;
                rotationRef.current.x = clamp(rotationRef.current.x - dy * 0.004, -1.5, 1.5);
            } else if (e.touches.length === 2 && lp && cameraRef.current) {
                const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
                cameraRef.current.fov = clamp(cameraRef.current.fov - (d - lp) * 0.1, 30, 100);
                cameraRef.current.updateProjectionMatrix();
                lp = d;
            }
        };
        const onTE = () => { lt = null; lp = null; };

        const keys = new Set();
        const onKD = (e) => keys.add(e.key.toLowerCase());
        const onKU = (e) => keys.delete(e.key.toLowerCase());
        const kl = setInterval(() => {
            const sp = 0.03;
            if (keys.has("arrowleft") || keys.has("a")) rotationRef.current.y += sp;
            if (keys.has("arrowright") || keys.has("d")) rotationRef.current.y -= sp;
            if (keys.has("arrowup") || keys.has("w")) rotationRef.current.x = clamp(rotationRef.current.x - sp, -1.5, 1.5);
            if (keys.has("arrowdown") || keys.has("s")) rotationRef.current.x = clamp(rotationRef.current.x + sp, -1.5, 1.5);
            if ((keys.has("q") || keys.has("-")) && cameraRef.current) { cameraRef.current.fov = Math.min(100, cameraRef.current.fov + 0.5); cameraRef.current.updateProjectionMatrix(); }
            if ((keys.has("e") || keys.has("=")) && cameraRef.current) { cameraRef.current.fov = Math.max(30, cameraRef.current.fov - 0.5); cameraRef.current.updateProjectionMatrix(); }
        }, 16);

        el.addEventListener("mousedown", onMD);
        window.addEventListener("mousemove", onMM);
        window.addEventListener("mouseup", onMU);
        el.addEventListener("wheel", onWh, { passive: true });
        el.addEventListener("touchstart", onTS, { passive: true });
        el.addEventListener("touchmove", onTM, { passive: false });
        el.addEventListener("touchend", onTE, { passive: true });
        window.addEventListener("keydown", onKD);
        window.addEventListener("keyup", onKU);
        el.style.cursor = "grab";

        return () => {
            clearInterval(kl);
            el.removeEventListener("mousedown", onMD);
            window.removeEventListener("mousemove", onMM);
            window.removeEventListener("mouseup", onMU);
            el.removeEventListener("wheel", onWh);
            el.removeEventListener("touchstart", onTS);
            el.removeEventListener("touchmove", onTM);
            el.removeEventListener("touchend", onTE);
            window.removeEventListener("keydown", onKD);
            window.removeEventListener("keyup", onKU);
        };
    }, []);

    // ─── Lifecycle ────────────────────────────────────────────
    useEffect(() => {
        let cc;
        const boot = async () => { await initScene(); cc = setupControls(); };
        boot();
        return () => {
            cc?.();
            cleanupFnsRef.current.forEach((fn) => fn());
            cleanupFnsRef.current = [];
            if (rendererRef.current) {
                rendererRef.current.setAnimationLoop(null);
                rendererRef.current.dispose();
                if (mountRef.current?.contains(rendererRef.current.domElement))
                    mountRef.current.removeChild(rendererRef.current.domElement);
                rendererRef.current = null;
            }
            if (vrButtonRef.current && mountRef.current?.contains(vrButtonRef.current)) {
                mountRef.current.removeChild(vrButtonRef.current);
                vrButtonRef.current = null;
            }
            if (sphereRef.current) {
                sphereRef.current.geometry?.dispose();
                sphereRef.current.material?.map?.dispose();
                sphereRef.current.material?.dispose();
            }
            sceneRef.current?.clear();
        };
    }, [panoId]);

    // ─── Render ───────────────────────────────────────────────
    return (
        <div className="relative h-full w-full bg-ink-950">
            <div ref={mountRef} className="h-full w-full" />

            {/* Loading */}
            <AnimatePresence>
                {loadingState.isLoading && (
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: EASE }}
                        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-ink-950 px-6"
                    >
                        <CompassLoader
                            label={loadingState.message}
                            detail={placeName || coords}
                            progress={loadingState.progress}
                        />
                        {sourceLabel && (
                            <p className="mt-6 font-data text-[10px] uppercase tracking-[0.2em] text-ivory-faint/70">
                                Source · {sourceLabel}
                            </p>
                        )}
                    </Motion.div>
                )}
            </AnimatePresence>

            {/* Error */}
            {loadingState.error && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-ink-950">
                    <StateNotice
                        icon={AlertCircle}
                        tone="error"
                        title="This panorama could not be rendered"
                        body={`${loadingState.error}. Go back and try a nearby landmark, or stay in street view for this spot.`}
                    />
                </div>
            )}

            {/* Source credit — fades away */}
            {!loadingState.isLoading && !loadingState.error && sourceLabel && (
                <div className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 animate-[safarxFadeSlow_8s_forwards]">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-ink-950/70 px-3 py-1.5 backdrop-blur-xl">
                        <ImageIcon className="h-3 w-3 text-saffron/80" aria-hidden="true" />
                        <span className="font-data text-[10px] uppercase tracking-[0.16em] text-ivory-faint">
                            {sourceLabel}
                            {isFlatProjection ? " · flat photo projected" : ""}
                        </span>
                    </span>
                </div>
            )}

            {/* Heads-up readout */}
            {!loadingState.isLoading && !loadingState.error && (placeName || coords) && (
                <div className="pointer-events-none absolute bottom-5 left-5 z-20 max-w-[16rem]">
                    <div className="glass-panel px-4 py-3">
                        <div className="mb-1.5 flex items-center gap-2">
                            <span className="route-dot animate-pulse" aria-hidden="true" />
                            <span className="font-data text-[10px] uppercase tracking-[0.24em] text-saffron">
                                360°
                            </span>
                        </div>
                        {placeName && (
                            <p className="truncate font-display text-base font-medium italic text-ivory">
                                {placeName}
                            </p>
                        )}
                        {coords && (
                            <p className="mt-1 font-data text-[10px] uppercase tracking-[0.16em] text-ivory-faint">
                                {coords}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* First-run hint */}
            {!loadingState.isLoading && !loadingState.error && (
                <div className="pointer-events-none absolute bottom-5 left-1/2 z-20 -translate-x-1/2">
                    <div className="glass-panel animate-[safarxFadeSlow_6s_forwards] px-5 py-3 text-center">
                        <p className="text-xs font-medium text-ivory-muted">
                            Drag to look around · scroll to zoom
                        </p>
                        <p className="mt-1 font-data text-[10px] uppercase tracking-[0.18em] text-ivory-faint">
                            WASD or arrows ·{" "}
                            {vrSupported ? "Headset detected" : "Connect a headset for immersive mode"}
                        </p>
                    </div>
                </div>
            )}

            {/* Headset session active */}
            {isInVR && (
                <div className="absolute left-1/2 top-4 z-50 -translate-x-1/2 rounded-full border border-saffron/40 bg-saffron/15 px-4 py-1.5 backdrop-blur-xl">
                    <div className="flex items-center gap-2">
                        <span className="route-dot animate-pulse" aria-hidden="true" />
                        <span className="font-data text-[10px] font-semibold uppercase tracking-[0.24em] text-saffron">
                            VR mode active
                        </span>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes safarxFadeSlow{0%,40%{opacity:1}100%{opacity:0}}
                @media (prefers-reduced-motion: reduce){
                    .animate-\\[safarxFadeSlow_8s_forwards\\],
                    .animate-\\[safarxFadeSlow_6s_forwards\\]{animation:none;opacity:0}
                }
            `}</style>
        </div>
    );
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export default VRPanoramaViewer;