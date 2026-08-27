import React, { useEffect, useState } from "react";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { GENERATING_MESSAGES, EASE } from "./plannerOptions";

const PATH = "M 20 120 C 90 40, 150 190, 230 100 S 350 30, 430 110 S 540 175, 600 90";
const WAYPOINTS = [
  { x: 20, y: 120 }, { x: 155, y: 118 }, { x: 300, y: 74 }, { x: 445, y: 118 }, { x: 600, y: 90 },
];

/**
 * On-brand generating state — the route line draws itself across the card
 * while waypoints light up and the status copy cycles.
 */
const GeneratingRoute = ({ destination }) => {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % GENERATING_MESSAGES.length);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-ink-900 px-6 py-14 sm:px-10 sm:py-20"
      role="status"
      aria-live="polite"
    >
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[28rem] h-[28rem] bg-saffron/[0.07] rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="relative max-w-2xl mx-auto text-center">
        <p className="flex items-center justify-center gap-3 mb-8">
          <span className="route-line w-10 sm:w-16" aria-hidden="true" />
          <span className="eyebrow">Drafting itinerary</span>
          <span className="route-line w-10 sm:w-16" aria-hidden="true" />
        </p>

        {/* Drawing route */}
        <svg
          viewBox="0 0 620 200"
          className="w-full h-28 sm:h-36 mb-10"
          fill="none"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid meet"
        >
          <path d={PATH} stroke="rgba(242,239,230,0.09)" strokeWidth="1.5" strokeDasharray="6 7" />
          <Motion.path
            d={PATH}
            stroke="#D4A843"
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.9 }}
            animate={reduce ? { pathLength: 1 } : { pathLength: [0, 1, 1], opacity: [0.9, 0.9, 0] }}
            transition={reduce ? { duration: 0.4 } : { duration: 3.4, repeat: Infinity, ease: EASE, times: [0, 0.75, 1] }}
          />
          {WAYPOINTS.map((p, i) => (
            <g key={i}>
              <Motion.circle
                cx={p.x} cy={p.y} r="10"
                fill="rgba(212,168,67,0.18)"
                initial={{ scale: 0.4, opacity: 0 }}
                animate={reduce ? { scale: 1, opacity: 0.4 } : { scale: [0.4, 1.5, 0.4], opacity: [0, 0.55, 0] }}
                transition={reduce ? { duration: 0.3 } : { duration: 3.4, repeat: Infinity, delay: i * 0.55, ease: "easeOut" }}
                style={{ transformOrigin: `${p.x}px ${p.y}px` }}
              />
              <circle cx={p.x} cy={p.y} r="3.5" fill="#E5BE5C" />
            </g>
          ))}
        </svg>

        <div className="min-h-[5.5rem]">
          <AnimatePresence mode="wait" initial={false}>
            <Motion.h3
              key={index}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="font-display text-2xl sm:text-4xl font-light text-ivory tracking-tight"
            >
              {GENERATING_MESSAGES[index]}
            </Motion.h3>
          </AnimatePresence>
        </div>

        <p className="mt-4 text-ivory-muted text-sm sm:text-base leading-relaxed">
          {destination
            ? <>Matching seasons, timings, and ₹ budgets across <em className="not-italic text-ivory">{destination.replace(/, India$/, "")}</em>. This usually takes under a minute.</>
            : "Matching seasons, timings, and ₹ budgets to your trip. This usually takes under a minute."}
        </p>

        <div className="mt-10 flex justify-center gap-2" aria-hidden="true">
          {GENERATING_MESSAGES.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === index ? "w-7 bg-saffron" : "w-1.5 bg-white/15"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GeneratingRoute;
