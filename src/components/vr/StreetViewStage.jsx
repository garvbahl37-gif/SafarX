/**
 * StreetViewStage — the Street View half of the panorama surface.
 *
 * `PanoramaViewer` paints Wikimedia and Mapillary panoramas itself, on the
 * inside of a three.js sphere, wearing nothing but SafarX chrome. Street View
 * cannot be painted that way: Google's terms allow their imagery on screen
 * only through Google's own renderer, and forbid removing the logo or the
 * image-capture line. Lifting the tiles into our sphere would be a breach, not
 * a shortcut, so this component hands the panorama id to Google instead.
 *
 * What it does do is strip every optional control Google offers — compass,
 * zoom, pan, address bar, links, road labels, fullscreen, motion tracking —
 * so what remains is the imagery, the small corner logo the terms require,
 * and SafarX's own HUD layered over the top. It renders inside the same shell
 * as every other vantage, so switching between a curated Wikimedia panorama
 * and a Street View one is one control and no visible change of context.
 *
 * The imperative handle mirrors the three.js scene's exactly — `zoomBy`,
 * `reset`, `setAutoRotate` — so the glass control row drives both stages
 * without knowing which one is mounted.
 */

import React, { useEffect, useRef } from "react";
import { loadStreetViewLibrary } from "../../services/googleStreetViewService";

/* Street View zoom is a level, roughly 0 (widest) to 5 (tightest), where the
   three.js stage thinks in degrees of field of view. The control row calls
   `zoomBy(8)` to widen and `zoomBy(-8)` to tighten, so a step of eight degrees
   maps to a quarter of a Street View level — close enough that the two stages
   feel like the same button. */
const ZOOM_MIN = 0;
const ZOOM_MAX = 4;
const DEGREES_PER_LEVEL = 32;

const AUTO_ROTATE_SPEED = 0.035; // degrees per frame — matches the sphere stage

const StreetViewStage = ({
    panoId,
    heading = 0,
    autoRotate = false,
    reduceMotion = false,
    controlsRef,
    onReady,
    onError,
    className = "",
}) => {
    const mountRef = useRef(null);
    const panoRef = useRef(null);
    /* Callbacks are held in refs so a parent that re-creates them inline does
       not tear the panorama down and rebuild it on every render. */
    const onReadyRef = useRef(onReady);
    const onErrorRef = useRef(onError);
    onReadyRef.current = onReady;
    onErrorRef.current = onError;

    /* ── Build the panorama ─────────────────────────────────────────── */
    useEffect(() => {
        const mount = mountRef.current;
        if (!mount || !panoId) return undefined;

        let cancelled = false;
        let frame = null;
        let rotating = false;
        let listener = null;

        loadStreetViewLibrary()
            .then((lib) => {
                if (cancelled) return;

                const panorama = new lib.StreetViewPanorama(mount, {
                    pano: panoId,
                    pov: { heading, pitch: 0 },
                    zoom: 1,
                    // Everything below is the chrome strip. The Google logo and
                    // the image-capture line are not in this list because the
                    // terms do not permit removing them.
                    disableDefaultUI: true,
                    addressControl: false,
                    linksControl: false,
                    panControl: false,
                    zoomControl: false,
                    fullscreenControl: false,
                    motionTrackingControl: false,
                    imageDateControl: false,
                    enableCloseButton: false,
                    showRoadLabels: false,
                    // The vantage switcher is how a visitor moves between
                    // viewpoints here, the same as on a curated tour. Letting
                    // them also walk off down the road would desync the label
                    // and credit shown for the vantage they started from.
                    clickToGo: false,
                    scrollwheel: true,
                    visible: true,
                });

                panoRef.current = panorama;

                /* Resolution is by id, so the panorama is frequently already
                   OK by the time the listener is attached and `status_changed`
                   never fires. Reading the status directly covers that race;
                   `settled` keeps whichever path wins from firing twice. */
                let settled = false;
                const report = () => {
                    if (cancelled || settled) return;
                    const status = panorama.getStatus();
                    if (!status) return;
                    settled = true;
                    if (status === "OK") onReadyRef.current?.();
                    else onErrorRef.current?.(new Error(`Street View returned ${status}.`));
                };

                listener = panorama.addListener("status_changed", report);
                report();

                /* ── Control surface, matching the three.js stage ──── */
                const step = () => {
                    if (cancelled || !rotating) return;
                    const pov = panorama.getPov();
                    panorama.setPov({
                        heading: (pov.heading + AUTO_ROTATE_SPEED * 4) % 360,
                        pitch: pov.pitch,
                    });
                    frame = requestAnimationFrame(step);
                };

                controlsRef.current = {
                    zoomBy: (degrees) => {
                        const current = panorama.getZoom() ?? 1;
                        const next = current - degrees / DEGREES_PER_LEVEL;
                        panorama.setZoom(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next)));
                    },
                    reset: () => {
                        panorama.setPov({ heading, pitch: 0 });
                        panorama.setZoom(1);
                    },
                    setAutoRotate: (on) => {
                        rotating = on && !reduceMotion;
                        if (frame) cancelAnimationFrame(frame);
                        frame = null;
                        if (rotating) frame = requestAnimationFrame(step);
                    },
                };

                if (autoRotate && !reduceMotion) {
                    controlsRef.current.setAutoRotate(true);
                }
            })
            .catch((err) => {
                if (!cancelled) onErrorRef.current?.(err);
            });

        return () => {
            cancelled = true;
            if (frame) cancelAnimationFrame(frame);
            listener?.remove?.();
            /* Google has no `destroy` for a panorama; dropping the reference
               and emptying the node is the documented way to release it. */
            panoRef.current = null;
            if (controlsRef) controlsRef.current = null;
            mount.replaceChildren();
        };
        // `autoRotate` is deliberately absent: it is applied through the
        // imperative handle below so toggling it never rebuilds the panorama.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [panoId, heading, reduceMotion, controlsRef]);

    return <div ref={mountRef} className={`absolute inset-0 ${className}`} aria-hidden="true" />;
};

export default StreetViewStage;
