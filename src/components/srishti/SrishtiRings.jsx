import React, { useEffect, useRef } from "react";

/**
 * Srishti's presence, drawn rather than avatared.
 *
 * A kolam is drawn at an Indian doorstep to welcome whoever arrives, and she is
 * the doorstep of SafarX — so she is a field of rings in the same dashed
 * texture as the route lines elsewhere in the app, not a face and not a
 * chat-assistant orb.
 *
 * The one idea worth remembering: rings travel *inward* while she listens and
 * *outward* while she speaks. Direction carries the state, so you can tell
 * whose turn it is from across a room, before reading a word or noticing a
 * colour.
 */

const RING_COUNT = 7;
const TAU = Math.PI * 2;

const PALETTE = {
  gold: [212, 168, 67],
  goldBright: [229, 190, 92],
  jade: [46, 139, 116],
};

const rgba = ([r, g, b], a) => `rgba(${r},${g},${b},${a})`;

/**
 * @param {object} props
 * @param {"idle"|"listening"|"thinking"|"speaking"} props.state
 * @param {() => number} [props.level] current loudness, 0–1
 * @param {number} [props.size] canvas edge in CSS pixels
 */
const SrishtiRings = ({ state = "idle", level, size = 320 }) => {
  const canvasRef = useRef(null);
  const stateRef = useRef(state);
  const levelRef = useRef(level);

  stateRef.current = state;
  levelRef.current = level;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    let raf = 0;
    let phase = 0;
    let smoothed = 0;
    const start = performance.now();

    const draw = (now) => {
      const mode = stateRef.current;
      const elapsed = (now - start) / 1000;

      // Loudness leads the movement while she talks; otherwise the rings
      // breathe on a slow sine so she never looks switched off.
      const raw = mode === "speaking" ? (levelRef.current?.() ?? 0) : 0;
      const breath = (Math.sin(elapsed * 1.1) + 1) / 2;
      const target = mode === "speaking" ? Math.max(0.25, raw) : mode === "listening" ? 0.42 + breath * 0.16 : 0.2 + breath * 0.14;
      smoothed += (target - smoothed) * (mode === "speaking" ? 0.35 : 0.06);

      // Inward while she receives, outward while she gives.
      const direction = mode === "listening" ? -1 : 1;
      const speed = mode === "thinking" ? 0.16 : mode === "listening" ? 0.28 : 0.42;
      if (!reduced) phase += direction * speed * 0.016;

      const hue =
        mode === "listening" ? PALETTE.jade : mode === "speaking" ? PALETTE.goldBright : PALETTE.gold;

      const cx = size / 2;
      const cy = size / 2;
      const maxR = size * 0.46;

      ctx.clearRect(0, 0, size, size);

      for (let i = 0; i < RING_COUNT; i += 1) {
        // Each ring sits at a fixed step, drifting by the shared phase, and
        // wraps so the field never empties.
        const offset = (i / RING_COUNT + phase) % 1;
        const t = offset < 0 ? offset + 1 : offset;
        const radius = maxR * (0.24 + t * 0.76) * (1 + smoothed * 0.16);

        // Fade at both ends of the travel so rings arrive and leave, not blink.
        const edge = Math.min(t / 0.18, (1 - t) / 0.22, 1);
        const alpha = Math.max(0, edge) * (0.34 + smoothed * 0.5);
        if (alpha <= 0.005) continue;

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, TAU);
        ctx.strokeStyle = rgba(hue, alpha);
        ctx.lineWidth = 1.15 + smoothed * 1.5;
        // The same dashed texture as the route lines through the rest of SafarX.
        ctx.setLineDash([2.5, 7]);
        ctx.lineDashOffset = -elapsed * 14 * direction;
        ctx.stroke();
      }

      // A still centre: the lamp the rings leave from and return to.
      const coreR = size * 0.055 * (1 + smoothed * 0.5);
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 4.5);
      glow.addColorStop(0, rgba(hue, 0.5 + smoothed * 0.4));
      glow.addColorStop(0.35, rgba(hue, 0.14 + smoothed * 0.16));
      glow.addColorStop(1, rgba(hue, 0));
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 4.5, 0, TAU);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, TAU);
      ctx.fillStyle = rgba(mode === "listening" ? PALETTE.jade : PALETTE.goldBright, 0.92);
      ctx.fill();

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [size]);

  const label = {
    idle: "Srishti, waiting",
    listening: "Srishti is listening",
    thinking: "Srishti is thinking",
    speaking: "Srishti is speaking",
  }[state];

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={label}
      style={{ width: size, height: size, display: "block" }}
    />
  );
};

export default SrishtiRings;
