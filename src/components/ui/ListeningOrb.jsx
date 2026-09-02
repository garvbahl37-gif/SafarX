import React, { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * The orb that shows SafarX is listening.
 *
 * The point of an orb is that it answers you. A spinner tells you the app is
 * busy; an orb that swells on a loud syllable and settles in a pause tells you
 * the microphone is genuinely picking you up — which is the one thing you
 * actually want to know while talking to a screen. So every radius here is
 * driven by measured amplitude, not by a timer pretending to be one.
 *
 * Drawn in saffron on ink rather than the usual white-on-black, so it belongs
 * to this app rather than looking borrowed.
 *
 * @param {() => number} level current loudness, 0–1, sampled per frame
 * @param {number} size canvas edge in CSS pixels
 */

const TAU = Math.PI * 2;
const GOLD = [212, 168, 67];
const GOLD_BRIGHT = [229, 190, 92];
const JADE = [46, 139, 116];

const rgba = ([r, g, b], a) => `rgba(${r},${g},${b},${a})`;

/* Three lobes at incommensurate speeds. Using rates that never line up keeps
   the silhouette from visibly repeating, which is what makes a blob read as
   alive rather than as a looping animation. */
const LOBES = [
  { freq: 3, speed: 0.55, amp: 0.055 },
  { freq: 5, speed: -0.37, amp: 0.035 },
  { freq: 2, speed: 0.23, amp: 0.045 },
];

const ListeningOrb = ({ level, size = 132, className = "" }) => {
  const canvasRef = useRef(null);
  const levelRef = useRef(level);
  const reduce = useReducedMotion();

  levelRef.current = level;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const mid = size / 2;
    const base = size * 0.27;

    /* The raw signal is twitchy. Chasing it with a spring gives the orb
       weight — it leans into a loud syllable instead of snapping to it. */
    let shown = 0;
    let velocity = 0;
    let raf;
    let t = 0;

    const blob = (radius, phase, wobble) => {
      ctx.beginPath();
      for (let a = 0; a <= TAU + 0.01; a += 0.06) {
        let r = radius;
        for (const lobe of LOBES) {
          r += radius * lobe.amp * wobble * Math.sin(a * lobe.freq + t * lobe.speed + phase);
        }
        const x = mid + Math.cos(a) * r;
        const y = mid + Math.sin(a) * r;
        if (a === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    };

    const draw = () => {
      const target = Math.max(0, Math.min(1, levelRef.current?.() ?? 0));
      const k = 0.14;
      const damping = 0.72;
      velocity = (velocity + (target - shown) * k) * damping;
      shown += velocity;
      t += reduce ? 0 : 0.02;

      ctx.clearRect(0, 0, size, size);

      /* A resting breath so the orb is never dead on screen, plus the part
         that is actually you talking. */
      const breath = reduce ? 0 : Math.sin(t * 1.1) * 0.03;
      const swell = shown * 0.42;
      const core = base * (1 + breath + swell);
      const wobble = reduce ? 0 : 0.4 + shown * 1.4;

      // ── Outer halo: the loudest, softest ring ──────────────────────────
      const haloR = core * 2.15;
      const halo = ctx.createRadialGradient(mid, mid, core * 0.7, mid, mid, haloR);
      halo.addColorStop(0, rgba(GOLD, 0.16 + shown * 0.2));
      halo.addColorStop(0.55, rgba(GOLD, 0.05 + shown * 0.07));
      halo.addColorStop(1, rgba(GOLD, 0));
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(mid, mid, haloR, 0, TAU);
      ctx.fill();

      // ── Jade shell, offset in phase so it drifts against the core ──────
      ctx.fillStyle = rgba(JADE, 0.2 + shown * 0.16);
      blob(core * 1.42, 1.9, wobble);
      ctx.fill();

      // ── The body ───────────────────────────────────────────────────────
      const body = ctx.createRadialGradient(
        mid - core * 0.3, mid - core * 0.34, core * 0.12,
        mid, mid, core * 1.12
      );
      body.addColorStop(0, rgba(GOLD_BRIGHT, 0.97));
      body.addColorStop(0.5, rgba(GOLD, 0.85));
      body.addColorStop(1, rgba(GOLD, 0.42));
      ctx.fillStyle = body;
      blob(core, 0, wobble);
      ctx.fill();

      // ── Specular highlight, so it reads as a sphere and not a disc ──────
      const gloss = ctx.createRadialGradient(
        mid - core * 0.36, mid - core * 0.4, 0,
        mid - core * 0.36, mid - core * 0.4, core * 0.75
      );
      gloss.addColorStop(0, "rgba(255,252,244,0.75)");
      gloss.addColorStop(1, "rgba(255,252,244,0)");
      ctx.fillStyle = gloss;
      ctx.beginPath();
      ctx.arc(mid - core * 0.3, mid - core * 0.32, core * 0.62, 0, TAU);
      ctx.fill();

      // ── A ring that only appears when you are actually talking ─────────
      if (shown > 0.04) {
        ctx.strokeStyle = rgba(GOLD_BRIGHT, Math.min(0.5, shown * 0.7));
        ctx.lineWidth = 1.25;
        blob(core * 1.75 + shown * size * 0.06, 3.4, wobble * 0.8);
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [size, reduce]);

  /* No width/height attributes here on purpose. The effect sets them to the
     device-pixel size and then scales the context to match; leaving them in
     the JSX means React re-applies the CSS-pixel value on every parent
     re-render, which resets the backing store — clearing the canvas and
     throwing away the DPR transform. The parent re-renders on every word of
     the interim transcript, so that blanked the orb precisely while someone
     was talking to it. Size is expressed in CSS only. */
  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className={className}
      aria-hidden="true"
    />
  );
};

/* The transcript above it changes constantly; the orb depends on none of it. */
export default React.memo(ListeningOrb);
