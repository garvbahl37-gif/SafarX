import React, { useRef, useState, useLayoutEffect } from "react";
import {
  motion as Motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import { ArrowRight } from "lucide-react";

/**
 * JourneyRoad — the three trip stages told as a drive.
 *
 * A winding road is drawn across the section as you scroll, a car runs along
 * it, and each stage lights up as the car reaches its waypoint. Positions are
 * read off the real SVG path with getPointAtLength, so the car and the pins
 * always sit exactly on the tarmac no matter how the viewBox scales.
 */

const VIEW_W = 1200;
const VIEW_H = 230;

// One continuous road across the band.
const ROAD_D =
  "M 30 170 C 170 60 300 58 430 128 S 690 226 830 118 S 1070 46 1170 96";

// Where each stage sits along the road (0–1 of its length).
const STOPS = [0.06, 0.5, 0.95];

const JourneyRoad = ({ stages, onPageChange }) => {
  const reduce = useReducedMotion();
  const sectionRef = useRef(null);
  const pathRef = useRef(null);

  const [car, setCar] = useState({ x: 30, y: 170, angle: 0 });
  const [pins, setPins] = useState([]);
  const [passed, setPassed] = useState(0);
  const [len, setLen] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.85", "end 0.55"],
  });

  // Measure the path once it exists, and place the waypoint pins on it.
  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const total = path.getTotalLength();
    setLen(total);
    setPins(
      STOPS.map((t) => {
        const p = path.getPointAtLength(total * t);
        return { x: p.x, y: p.y };
      })
    );
    const start = path.getPointAtLength(0);
    setCar({ x: start.x, y: start.y, angle: 0 });
  }, []);

  // Drive the car along the path from scroll progress.
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const path = pathRef.current;
    if (!path || !len) return;
    const t = Math.max(0, Math.min(1, v));
    const at = len * t;
    const p = path.getPointAtLength(at);
    // Tangent from a point just ahead, so the car banks into the curves.
    const ahead = path.getPointAtLength(Math.min(at + 6, len));
    const angle = (Math.atan2(ahead.y - p.y, ahead.x - p.x) * 180) / Math.PI;
    setCar({ x: p.x, y: p.y, angle });
    setPassed(STOPS.filter((s) => t >= s - 0.02).length);
  });

  // The road paints in as you scroll.
  const dashOffset = useTransform(scrollYProgress, [0, 0.95], [len, 0]);

  return (
    <div ref={sectionRef}>
      {/* ── The drive (desktop) ── */}
      <div className="relative hidden md:block mb-4" aria-hidden="true">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="w-full h-auto overflow-visible"
        >
          <defs>
            <linearGradient id="jr-road" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#17352D" />
              <stop offset="50%" stopColor="#1e4038" />
              <stop offset="100%" stopColor="#17352D" />
            </linearGradient>
            <filter id="jr-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Tarmac */}
          <path
            d={ROAD_D}
            fill="none"
            stroke="url(#jr-road)"
            strokeWidth="26"
            strokeLinecap="round"
          />
          {/* Kerb highlight */}
          <path
            d={ROAD_D}
            fill="none"
            stroke="rgba(242,239,230,0.07)"
            strokeWidth="28"
            strokeLinecap="round"
            opacity="0.5"
          />

          {/* Painted centre line, drawn as you scroll */}
          <Motion.path
            ref={pathRef}
            d={ROAD_D}
            fill="none"
            stroke="#D4A843"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={reduce ? undefined : `14 16`}
            style={reduce ? undefined : { strokeDashoffset: dashOffset }}
            opacity="0.85"
          />

          {/* Waypoints */}
          {pins.map((p, i) => {
            const reached = passed > i;
            return (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="17"
                  fill="#0A1D1A"
                  stroke={reached ? "#D4A843" : "rgba(242,239,230,0.22)"}
                  strokeWidth="2"
                  style={{ transition: "stroke 400ms ease" }}
                />
                <text
                  x={p.x}
                  y={p.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="12"
                  fontFamily="'Space Grotesk', monospace"
                  fill={reached ? "#E5BE5C" : "rgba(242,239,230,0.45)"}
                  style={{ transition: "fill 400ms ease" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </text>
                {reached && (
                  <circle cx={p.x} cy={p.y} r="17" fill="none" stroke="#D4A843" strokeWidth="2" opacity="0.35" filter="url(#jr-glow)" />
                )}
              </g>
            );
          })}

          {/* The car */}
          <g
            transform={`translate(${car.x} ${car.y}) rotate(${car.angle})`}
            style={{ transition: reduce ? undefined : "transform 120ms linear" }}
          >
            {/* headlight wash */}
            <path d="M19 0 L68 -19 L68 19 Z" fill="#E5BE5C" opacity="0.14" />
            {/* body */}
            <rect x="-21" y="-10" width="42" height="20" rx="7" fill="#E5BE5C" />
            {/* cabin */}
            <rect x="-9" y="-7.5" width="17" height="15" rx="4" fill="#0A1D1A" opacity="0.6" />
            {/* wheels */}
            <circle cx="-11" cy="11" r="4.4" fill="#061412" />
            <circle cx="11" cy="11" r="4.4" fill="#061412" />
            {/* headlight */}
            <circle cx="20" cy="0" r="3" fill="#FFF6DC" filter="url(#jr-glow)" />
            {/* tail lamp */}
            <circle cx="-21" cy="0" r="2" fill="#E05252" opacity="0.8" />
          </g>
        </svg>
      </div>

      {/* ── Stage cards ── */}
      <div className="grid md:grid-cols-3 gap-10 md:gap-8">
        {stages.map((stage, i) => {
          const active = passed > i;
          return (
            <Motion.div
              key={stage.step}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="relative flex flex-col"
            >
              <div className="flex items-center gap-4 mb-6">
                {/* Mobile keeps a plain numbered marker */}
                <span
                  className={`md:hidden relative z-10 w-11 h-11 rounded-full bg-ink-800 border flex items-center justify-center font-data text-sm transition-colors duration-500 ${
                    active ? "border-saffron/60 text-saffron" : "border-white/15 text-ivory/50"
                  }`}
                >
                  {stage.step}
                </span>
                <span
                  className={`eyebrow-muted transition-colors duration-500 ${active ? "!text-saffron" : ""}`}
                >
                  {stage.phase}
                </span>
              </div>

              <h3 className="font-display text-2xl md:text-[1.7rem] font-medium text-ivory leading-snug mb-4">
                {stage.title}
              </h3>
              <p className="text-ivory-muted text-[15px] leading-relaxed mb-6 flex-1">
                {stage.desc}
              </p>
              <button
                onClick={() => onPageChange(stage.page)}
                className="group inline-flex items-center gap-2 text-saffron text-[13px] font-bold tracking-wide self-start"
              >
                {stage.cta}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default JourneyRoad;
