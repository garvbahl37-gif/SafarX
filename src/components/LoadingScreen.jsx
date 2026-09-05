import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/**
 * Cinematic boot sequence — a four-act film.
 *
 *   I   Waypoints ignite across a dark map and a flight path draws itself
 *   II  सफ़र ("safar" — journey) is inked in, then flooded with gold
 *   III The Devanagari dissolves and the SafarX wordmark assembles
 *   IV  Letterbox opens, the frame pushes in, and the app is revealed
 */

const TOTAL_MS = 3800;
const MORPH_AT = 2150;

// Waypoints across the composition — deterministic, no Math.random
const WAYPOINTS = [
  { x: "12%", y: "34%", d: 0.35 },
  { x: "31%", y: "58%", d: 0.5 },
  { x: "50%", y: "28%", d: 0.65 },
  { x: "69%", y: "62%", d: 0.8 },
  { x: "88%", y: "40%", d: 0.95 },
];

const MOTES = [
  { x: -38, y: -22, d: 0.2, s: 3 },
  { x: 30, y: -34, d: 0.9, s: 2 },
  { x: -24, y: 28, d: 0.5, s: 2 },
  { x: 41, y: 18, d: 1.4, s: 3 },
  { x: -46, y: 6, d: 1.1, s: 2 },
  { x: 18, y: 36, d: 0.7, s: 2 },
  { x: 8, y: -42, d: 1.7, s: 3 },
  { x: -14, y: -8, d: 0.3, s: 2 },
  { x: 46, y: -14, d: 2.1, s: 2 },
  { x: -33, y: 40, d: 1.9, s: 3 },
];

const EASE_FILM = [0.76, 0, 0.24, 1];
const EASE_OUT = [0.22, 1, 0.36, 1];

const LoadingScreen = () => {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState("devanagari");
  const [progress, setProgress] = useState(0);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const done = () => !cancelled && setFontsReady(true);
    if (document.fonts?.ready) {
      document.fonts.ready.then(done).catch(done);
      // Never let a slow font host hold the boot screen hostage.
      const bail = setTimeout(done, 1200);
      return () => {
        cancelled = true;
        clearTimeout(bail);
      };
    }
    done();
    return undefined;
  }, []);

  useEffect(() => {
    const morph = setTimeout(() => setPhase("latin"), reduce ? 400 : MORPH_AT);
    return () => clearTimeout(morph);
  }, [reduce]);

  useEffect(() => {
    const started = Date.now();
    const tick = setInterval(() => {
      const pct = Math.min(((Date.now() - started) / (TOTAL_MS - 400)) * 100, 100);
      setProgress(pct);
      if (pct >= 100) clearInterval(tick);
    }, 50);
    return () => clearInterval(tick);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 1.08,
        filter: "blur(18px)",
        transition: { duration: 0.8, ease: EASE_FILM },
      }}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-ink-950 text-ivory overflow-hidden film-grain vignette"
      role="status"
      aria-label="Loading SafarX"
    >
      {/* ── Slow camera push-in on the whole composition ── */}
      <motion.div
        initial={{ scale: reduce ? 1 : 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: TOTAL_MS / 1000, ease: "linear" }}
        className="absolute inset-0"
      >
        {/* Drifting contour grid — a map coming into focus */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0.28] }}
          transition={{ duration: 2.6, times: [0, 0.5, 1], ease: "easeOut" }}
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(rgba(212,168,67,0.16) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
            maskImage: "radial-gradient(ellipse 60% 55% at 50% 50%, black, transparent)",
            WebkitMaskImage: "radial-gradient(ellipse 60% 55% at 50% 50%, black, transparent)",
          }}
          aria-hidden="true"
        />

        {/* Horizon glow swelling behind everything */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
          <motion.div
            initial={{ opacity: 0, scale: 0.55 }}
            animate={{ opacity: [0, 0.95, 0.7], scale: [0.55, 1.2, 1] }}
            transition={{ duration: 3.2, ease: "easeOut", times: [0, 0.6, 1] }}
            className="w-[840px] h-[840px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(212,168,67,0.14) 0%, rgba(46,139,116,0.07) 42%, transparent 70%)",
            }}
          />
        </div>

        {/* ── ACT I · waypoints ignite across the map ── */}
        {!reduce &&
          WAYPOINTS.map((w, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0, x: "-50%", y: "-50%" }}
              animate={{ opacity: [0, 1, 0.35], scale: [0, 1.6, 1], x: "-50%", y: "-50%" }}
              transition={{ duration: 1.6, delay: w.d, ease: EASE_OUT }}
              style={{ left: w.x, top: w.y }}
              className="absolute w-1.5 h-1.5 rounded-full bg-saffron shadow-[0_0_16px_rgba(212,168,67,0.9)]"
              aria-hidden="true"
            />
          ))}

        {/* Opening light sweep */}
        {!reduce && (
          <motion.div
            initial={{ x: "-120%", opacity: 0 }}
            animate={{ x: "120%", opacity: [0, 0.55, 0] }}
            transition={{ duration: 1.7, delay: 0.1, ease: "easeInOut" }}
            className="absolute inset-y-0 w-1/3 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(229,190,92,0.14), transparent)",
            }}
            aria-hidden="true"
          />
        )}

        {/* Ignition rings */}
        {!reduce && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                initial={{ scale: 0.2, opacity: 0.55 }}
                animate={{ scale: 5, opacity: 0 }}
                transition={{ duration: 2.4, delay: 0.2 + i * 0.26, ease: "easeOut" }}
                className="absolute w-40 h-40 rounded-full border border-saffron/35"
              />
            ))}
          </div>
        )}

        {/* Drifting gold dust */}
        {!reduce &&
          MOTES.map((m, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, x: `${m.x}vw`, y: `${m.y}vh` }}
              animate={{ opacity: [0, 0.75, 0], y: `${m.y - 7}vh` }}
              transition={{ duration: 3.2, delay: m.d, ease: "easeOut" }}
              style={{ width: m.s, height: m.s, left: "50%", top: "50%" }}
              className="absolute rounded-full bg-saffron pointer-events-none will-change-transform"
              aria-hidden="true"
            />
          ))}
      </motion.div>

      {/* ── Foreground stack ── */}
      <div className="relative z-10 flex flex-col items-center px-6 w-full">
        {/* Wordmark: सफ़र → SafarX */}
        <div
          className="relative h-[clamp(5rem,15vw,9rem)] flex items-center justify-center w-full transition-opacity duration-300"
          style={{ opacity: fontsReady ? 1 : 0 }}
        >
          <AnimatePresence mode="wait">
            {phase === "devanagari" ? (
              <motion.div
                key="deva"
                exit={{
                  opacity: 0,
                  scale: 1.5,
                  filter: "blur(16px)",
                  transition: { duration: 0.34, ease: EASE_FILM },
                }}
                className="relative"
              >
                <motion.span
                  initial={{ opacity: 0, letterSpacing: "0.55em" }}
                  animate={{ opacity: 1, letterSpacing: "0.06em" }}
                  transition={{ duration: 1.2, ease: EASE_OUT }}
                  className="font-devanagari text-[clamp(3.5rem,11vw,7rem)] leading-none text-transparent block"
                  style={{ WebkitTextStroke: "1.4px rgba(212,168,67,0.85)" }}
                >
                  सफ़र
                </motion.span>
                <motion.span
                  initial={{ clipPath: "inset(0 100% 0 0)" }}
                  animate={{ clipPath: "inset(0 0% 0 0)" }}
                  transition={{ duration: 1, delay: 0.95, ease: EASE_FILM }}
                  className="font-devanagari text-[clamp(3.5rem,11vw,7rem)] leading-none absolute inset-0 text-saffron"
                  style={{ letterSpacing: "0.06em" }}
                  aria-hidden="true"
                >
                  सफ़र
                </motion.span>
              </motion.div>
            ) : (
              <motion.div
                key="latin"
                /* The focus-pull belongs to the whole wordmark, not to each
                   letter. A filter clips to its own region, and Fraunces'
                   italic f overhangs its advance width by more than half —
                   blurred per letter, its ascender was cut off and the clip
                   resized every frame, which is the flicker. One filter over
                   the line has room for every glyph, and is one layer instead
                   of five. */
                initial={{ opacity: 0, filter: "blur(14px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.75, ease: EASE_OUT }}
                className="flex items-baseline gap-1 px-[0.12em]"
              >
                {"Safar".split("").map((letter, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: "0.75em", rotateX: -75 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 0.6, delay: 0.04 + i * 0.055, ease: EASE_OUT }}
                    style={{ willChange: "transform, opacity", backfaceVisibility: "hidden" }}
                    className="font-display italic font-medium text-[clamp(3rem,10vw,6.5rem)] leading-none tracking-tight inline-block"
                  >
                    {letter}
                  </motion.span>
                ))}
                <motion.span
                  initial={{ opacity: 0, scale: 0.35, filter: "blur(16px)" }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    filter: "blur(0px)",
                    textShadow: [
                      "0 0 0px rgba(212,168,67,0)",
                      "0 0 52px rgba(212,168,67,1)",
                      "0 0 20px rgba(212,168,67,0.5)",
                    ],
                  }}
                  transition={{ duration: 0.7, delay: 0.36, ease: [0.34, 1.56, 0.64, 1] }}
                  className="font-data font-bold text-saffron text-[clamp(2.6rem,8.5vw,5.4rem)] leading-none inline-block ml-1"
                >
                  X
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.75em" }}
          animate={{ opacity: 1, letterSpacing: "0.32em" }}
          transition={{ duration: 1, delay: reduce ? 0.4 : 2.75, ease: EASE_OUT }}
          className="font-data text-[10px] md:text-[11px] uppercase text-ivory-faint mt-6 text-center"
        >
          Discover Incredible India
        </motion.p>

        {/* Progress — a discreet readout, no bar (the compass carries the wait) */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduce ? 0.4 : 2.9, duration: 0.8 }}
          className="mt-9 font-data text-[11px] tracking-[0.34em] text-saffron/70 tabular-nums"
          aria-hidden="true"
        >
          {String(Math.round(progress)).padStart(3, "0")}
        </motion.span>
      </div>

      {/* ── Film framing marks ── */}
      {!reduce && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="absolute inset-6 md:inset-10 pointer-events-none"
          aria-hidden="true"
        >
          {[
            "top-0 left-0 border-l border-t",
            "top-0 right-0 border-r border-t",
            "bottom-0 left-0 border-l border-b",
            "bottom-0 right-0 border-r border-b",
          ].map((pos, i) => (
            <span key={i} className={`absolute ${pos} w-7 h-7 border-saffron/60`} />
          ))}
        </motion.div>
      )}

      {/* ── Letterbox bars open like a shutter ── */}
      {!reduce && (
        <>
          <motion.div
            initial={{ height: "22vh" }}
            animate={{ height: "0vh" }}
            transition={{ duration: 1.6, delay: 0.25, ease: EASE_FILM }}
            className="absolute top-0 inset-x-0 bg-ink-950 pointer-events-none z-20"
            aria-hidden="true"
          />
          <motion.div
            initial={{ height: "22vh" }}
            animate={{ height: "0vh" }}
            transition={{ duration: 1.6, delay: 0.25, ease: EASE_FILM }}
            className="absolute bottom-0 inset-x-0 bg-ink-950 pointer-events-none z-20"
            aria-hidden="true"
          />
        </>
      )}
    </motion.div>
  );
};

export default LoadingScreen;
