import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Plane } from "lucide-react";

/**
 * Cinematic boot sequence.
 *
 * A single gold waypoint ignites, a flight path draws itself across the
 * screen, the Devanagari word सफ़र ("safar" — journey) is inked in, then
 * transforms into the SafarX wordmark. Roughly a 3.4s film.
 */

const TOTAL_MS = 3400;
const MORPH_AT = 2000; // Devanagari hands over to the Latin wordmark

// Deterministic drifting dust motes — no Math.random so runs look identical
const MOTES = [
  { x: -38, y: -22, d: 0.2, s: 3 },
  { x: 30, y: -34, d: 0.9, s: 2 },
  { x: -24, y: 28, d: 0.5, s: 2 },
  { x: 41, y: 18, d: 1.4, s: 3 },
  { x: -46, y: 6, d: 1.1, s: 2 },
  { x: 18, y: 36, d: 0.7, s: 2 },
  { x: 8, y: -42, d: 1.7, s: 3 },
  { x: -14, y: -8, d: 0.3, s: 2 },
];

const LoadingScreen = () => {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState("devanagari");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const morph = setTimeout(() => setPhase("latin"), reduce ? 400 : MORPH_AT);
    return () => clearTimeout(morph);
  }, [reduce]);

  useEffect(() => {
    const started = Date.now();
    const tick = setInterval(() => {
      const pct = Math.min(((Date.now() - started) / (TOTAL_MS - 300)) * 100, 100);
      setProgress(pct);
      if (pct >= 100) clearInterval(tick);
    }, 60);
    return () => clearInterval(tick);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        filter: "blur(16px)",
        scale: 1.06,
        transition: { duration: 0.75, ease: [0.76, 0, 0.24, 1] },
      }}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-ink-950 text-ivory overflow-hidden film-grain vignette"
      role="status"
      aria-label="Loading SafarX"
    >
      {/* Warm horizon glow that swells as the sequence runs */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: [0, 0.9, 0.65], scale: [0.6, 1.15, 1] }}
        transition={{ duration: 3, ease: "easeOut", times: [0, 0.6, 1] }}
        className="absolute w-[780px] h-[780px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(212,168,67,0.13) 0%, rgba(46,139,116,0.06) 42%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Ignition rings */}
      {!reduce &&
        [0, 1, 2].map((i) => (
          <motion.span
            key={i}
            initial={{ scale: 0.2, opacity: 0.5 }}
            animate={{ scale: 4.5, opacity: 0 }}
            transition={{ duration: 2.2, delay: 0.15 + i * 0.22, ease: "easeOut" }}
            className="absolute w-40 h-40 rounded-full border border-saffron/40 pointer-events-none"
            aria-hidden="true"
          />
        ))}

      {/* Drifting gold dust */}
      {!reduce &&
        MOTES.map((m, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, x: `${m.x}vw`, y: `${m.y}vh` }}
            animate={{ opacity: [0, 0.7, 0], y: `${m.y - 6}vh` }}
            transition={{ duration: 3, delay: m.d, ease: "easeOut" }}
            style={{ width: m.s, height: m.s }}
            className="absolute rounded-full bg-saffron pointer-events-none"
            aria-hidden="true"
          />
        ))}

      <div className="relative z-10 flex flex-col items-center px-6 w-full">
        {/* ---------- The flight path ---------- */}
        <div className="relative w-[min(88vw,660px)] h-10 mb-2" aria-hidden="true">
          {/* Waypoint ignites first */}
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-saffron shadow-[0_0_22px_rgba(212,168,67,0.9)]"
          />
          {/* Dashed route draws outward from the waypoint */}
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="route-line block absolute inset-x-0 top-1/2 -translate-y-1/2"
          />
          {/* Aircraft runs the line */}
          {!reduce && (
            <motion.span
              initial={{ left: "0%", opacity: 0 }}
              animate={{ left: "100%", opacity: [0, 1, 1, 0] }}
              transition={{ duration: 2.1, delay: 0.6, ease: "easeInOut" }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-saffron"
            >
              <Plane size={16} className="drop-shadow-[0_0_10px_rgba(212,168,67,0.8)]" />
            </motion.span>
          )}
        </div>

        {/* ---------- Wordmark: सफ़र → SafarX ---------- */}
        <div className="relative h-[clamp(5rem,15vw,9rem)] flex items-center justify-center w-full">
          <AnimatePresence mode="wait">
            {phase === "devanagari" ? (
              <motion.div
                key="deva"
                exit={{
                  opacity: 0,
                  scale: 1.5,
                  filter: "blur(14px)",
                  transition: { duration: 0.55, ease: [0.76, 0, 0.24, 1] },
                }}
                className="relative"
              >
                {/* Outline is inked first… */}
                <motion.span
                  initial={{ opacity: 0, letterSpacing: "0.5em" }}
                  animate={{ opacity: 1, letterSpacing: "0.06em" }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                  className="font-devanagari text-[clamp(3.5rem,11vw,7rem)] leading-none text-transparent block"
                  style={{ WebkitTextStroke: "1.4px rgba(212,168,67,0.85)" }}
                >
                  सफ़र
                </motion.span>
                {/* …then flooded with gold, left to right */}
                <motion.span
                  initial={{ clipPath: "inset(0 100% 0 0)" }}
                  animate={{ clipPath: "inset(0 0% 0 0)" }}
                  transition={{ duration: 0.9, delay: 0.85, ease: [0.76, 0, 0.24, 1] }}
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-baseline gap-1"
              >
                {"Safar".split("").map((letter, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: "0.7em", filter: "blur(10px)", rotateX: -70 }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)", rotateX: 0 }}
                    transition={{
                      duration: 0.7,
                      delay: 0.1 + i * 0.07,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="font-display italic font-medium text-[clamp(3rem,10vw,6.5rem)] leading-none tracking-tight inline-block"
                  >
                    {letter}
                  </motion.span>
                ))}
                {/* The X lands last, with a flare */}
                <motion.span
                  initial={{ opacity: 0, scale: 0.4, filter: "blur(14px)" }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    filter: "blur(0px)",
                    textShadow: [
                      "0 0 0px rgba(212,168,67,0)",
                      "0 0 44px rgba(212,168,67,0.95)",
                      "0 0 18px rgba(212,168,67,0.45)",
                    ],
                  }}
                  transition={{ duration: 0.8, delay: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                  className="font-data font-bold text-saffron text-[clamp(2.6rem,8.5vw,5.4rem)] leading-none inline-block ml-1"
                >
                  X
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ---------- Tagline ---------- */}
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.7em" }}
          animate={{ opacity: 1, letterSpacing: "0.32em" }}
          transition={{ duration: 1, delay: reduce ? 0.4 : 2.6, ease: [0.22, 1, 0.36, 1] }}
          className="font-data text-[10px] md:text-[11px] uppercase text-ivory-faint mt-6 text-center"
        >
          Discover Incredible India
        </motion.p>

        {/* ---------- Progress ---------- */}
        <div className="mt-12 flex items-center gap-4" aria-hidden="true">
          <span className="relative block w-40 md:w-56 h-[2px] bg-white/10 overflow-hidden rounded-full">
            <motion.span
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-saffron-deep via-saffron to-saffron-bright"
              style={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </span>
          <span className="font-data text-[11px] text-saffron/80 tabular-nums w-9">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Letterbox bars slide away as the film ends */}
      {!reduce && (
        <>
          <motion.div
            initial={{ height: "18vh" }}
            animate={{ height: "0vh" }}
            transition={{ duration: 1.4, delay: 0.2, ease: [0.76, 0, 0.24, 1] }}
            className="absolute top-0 inset-x-0 bg-ink-950 pointer-events-none"
            aria-hidden="true"
          />
          <motion.div
            initial={{ height: "18vh" }}
            animate={{ height: "0vh" }}
            transition={{ duration: 1.4, delay: 0.2, ease: [0.76, 0, 0.24, 1] }}
            className="absolute bottom-0 inset-x-0 bg-ink-950 pointer-events-none"
            aria-hidden="true"
          />
        </>
      )}
    </motion.div>
  );
};

export default LoadingScreen;
