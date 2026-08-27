// VRPanoramaViewer.jsx
// Multi-source VR panorama renderer
// Handles: Google SV tiles, Wikimedia 360°, Flickr panos,
//          Panoramax, Wikipedia images, Generated panoramas

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { Loader2, AlertCircle, Image as ImageIcon } from "lucide-react";
import { getImageUrls, generatePanoramaTiles } from "../../services/streetViewService";

const SOURCE_LABELS = {
    google_streetview: "Google Street View 360°",
    wikimedia_panorama: "Wikimedia Commons Panorama",
    wikimedia_image: "Wikimedia Commons",
    flickr_panorama: "Flickr 360° Photo",
    panoramax: "Panoramax Street Imagery",
    wikipedia_image: "Wikipedia",
    generated: "Generated Panorama",
};

const VRPanoramaViewer = ({ panoId, placeName, isPano = true, onError }) => {
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
        message: "Initializing...",
        error: null,
    });
    const [vrSupported, setVrSupported] = useState(false);
    const [isInVR, setIsInVR] = useState(false);
    const [sourceLabel, setSourceLabel] = useState("");

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
            message: "Fetching panorama data...",
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
                    message: "Loading Google Street View tiles...",
                }));
                return await loadGoogleSVTiles(imageData);
            }

            // ─── CASE 2: Direct Image URL (Wikimedia, Flickr, etc.) ───
            if (imageData.urlOriginal || imageData.url2048) {
                setLoadingState((p) => ({
                    ...p,
                    progress: 15,
                    message: "Loading panorama image...",
                }));
                const imgUrl = imageData.urlOriginal || imageData.url2048;
                return await loadDirectImage(imgUrl, imageData.isPano);
            }

            // ─── CASE 3: Generated Panorama ───
            if (imageData.lat !== undefined && imageData.lng !== undefined) {
                setLoadingState((p) => ({
                    ...p,
                    progress: 10,
                    message: "Generating panorama from map data...",
                }));
                return await buildGeneratedPanorama(imageData.lat, imageData.lng);
            }

            throw new Error("Unknown image data format");
        } catch (error) {
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
                        message: `Loading tiles... ${loaded}/${total}`,
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
            message: "Building VR sphere...",
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
                    setLoadingState((p) => ({ ...p, progress: 80, message: "Building VR sphere..." }));
                    resolve({ texture, isPanoTexture: isPanoImg });
                },
                (progress) => {
                    if (progress.total > 0) {
                        const pct = 15 + Math.floor((progress.loaded / progress.total) * 60);
                        setLoadingState((p) => ({
                            ...p,
                            progress: pct,
                            message: `Downloading... ${Math.round((progress.loaded / progress.total) * 100)}%`,
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
        skyGrad.addColorStop(0, "#0a1628");
        skyGrad.addColorStop(0.15, "#1a2744");
        skyGrad.addColorStop(0.33, "#2d4a7a");
        skyGrad.addColorStop(0.5, "#1e3a5f");
        skyGrad.addColorStop(0.7, "#1a2744");
        skyGrad.addColorStop(1, "#0a1628");
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
                        message: `Generating panorama... ${loaded}/${tiles.length}`,
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
        ctx.fillStyle = "rgba(6,182,212,0.15)";
        ctx.font = "bold 28px sans-serif";
        ctx.textAlign = "center";
        tiles.forEach((tile, i) => {
            ctx.fillText(tile.label, i * tileSize + tileSize / 2, tileSize + tileSize - 15);
        });

        setLoadingState((p) => ({ ...p, progress: 80, message: "Building VR sphere..." }));

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

            setLoadingState((p) => ({ ...p, progress: 90, message: "Starting renderer..." }));

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
                color: 0x06b6d4, transparent: true, opacity: 0.1, side: THREE.DoubleSide,
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = -Math.PI / 2;
            ring.position.y = -1.6;
            scene.add(ring);

            // Crosshair
            const dotGeo = new THREE.SphereGeometry(0.015, 16, 16);
            const dotMat = new THREE.MeshBasicMaterial({
                color: 0x06b6d4, transparent: true, opacity: 0.25,
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
        Object.assign(btn.style, {
            position: "absolute", bottom: "80px", left: "50%", transform: "translateX(-50%)",
            zIndex: "100", display: "flex", alignItems: "center", gap: "10px",
            padding: "14px 28px", background: "rgba(6,182,212,0.12)", backdropFilter: "blur(16px)",
            border: "1px solid rgba(6,182,212,0.35)", borderRadius: "50px", color: "#fff",
            fontSize: "14px", fontWeight: "700", cursor: "pointer", transition: "all 0.25s ease",
            fontFamily: "inherit", outline: "none",
        });
        btn.onmouseenter = () => {
            btn.style.background = "rgba(6,182,212,0.25)";
            btn.style.transform = "translateX(-50%) scale(1.05)";
        };
        btn.onmouseleave = () => {
            btn.style.background = "rgba(6,182,212,0.12)";
            btn.style.transform = "translateX(-50%) scale(1)";
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
                alert(`VR Error: ${err.message}\n\nCheck headset + SteamVR/Oculus.`);
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
        <div className="relative w-full h-full bg-black">
            <div ref={mountRef} className="w-full h-full" />

            {loadingState.isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B0E14] z-50">
                    <div className="relative w-16 h-16 mb-6">
                        <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping" />
                        <Loader2 className="absolute inset-0 m-auto w-6 h-6 text-cyan-400 animate-spin" />
                    </div>
                    <p className="text-white font-semibold text-sm mb-3">{loadingState.message}</p>
                    <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
                            style={{ width: `${loadingState.progress}%` }} />
                    </div>
                    <p className="text-white/30 text-xs mt-2">{loadingState.progress}%</p>
                    {sourceLabel && (
                        <p className="text-white/15 text-[10px] mt-4">Source: {sourceLabel}</p>
                    )}
                </div>
            )}

            {loadingState.error && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0B0E14] z-50">
                    <div className="text-center max-w-sm px-6">
                        <AlertCircle className="w-12 h-12 text-red-400/60 mx-auto mb-4" />
                        <p className="text-white font-semibold mb-2">VR Load Failed</p>
                        <p className="text-white/40 text-sm">{loadingState.error}</p>
                    </div>
                </div>
            )}

            {!loadingState.isLoading && !loadingState.error && sourceLabel && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none animate-[fadeOut_8s_forwards]">
                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/10">
                        <ImageIcon className="w-3 h-3 text-white/40" />
                        <span className="text-[10px] text-white/40 font-medium">{sourceLabel}</span>
                    </div>
                </div>
            )}

            {!loadingState.isLoading && !loadingState.error && (
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                    <div className="bg-black/50 backdrop-blur-md rounded-xl px-5 py-3 border border-white/10 text-center animate-[fadeOut_6s_forwards]">
                        <p className="text-white/70 text-xs font-medium mb-1">🖱️ Drag to look • Scroll to zoom</p>
                        <p className="text-white/30 text-[10px]">
                            WASD / Arrows • {vrSupported ? "VR headset detected ↓" : "Connect VR headset for immersive mode"}
                        </p>
                    </div>
                </div>
            )}

            {isInVR && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-cyan-500/20 border border-cyan-500/40 backdrop-blur-md rounded-full px-4 py-1.5">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="text-cyan-300 text-xs font-bold tracking-wider">VR MODE ACTIVE</span>
                    </div>
                </div>
            )}

            <style>{`@keyframes fadeOut{0%,40%{opacity:1}100%{opacity:0}}`}</style>
        </div>
    );
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export default VRPanoramaViewer;