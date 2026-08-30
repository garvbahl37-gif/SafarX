import React, { useRef, useState, useLayoutEffect } from "react";
import {
  motion as Motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import { ArrowRight, Flag, MapPin } from "lucide-react";

/**
 * JourneyRoad — the trip stages told as a drive across India.
 *
 * A winding road is painted in as you scroll, a car drives it, and each stage
 * lights up as the car reaches its waypoint. Car and pin positions come from
 * the real SVG path via getPointAtLength, so nothing drifts off the tarmac
 * when the viewBox scales.
 */

const VIEW_W = 1200;
const VIEW_H = 300;

// A longer road with enough bends to carry six stops.
const ROAD_D =
  "M 26 214 C 120 120 210 104 300 150 S 452 246 548 176 S 700 74 800 132 " +
  "S 950 232 1046 168 S 1140 108 1176 128";

// Where each stage sits along the road (0–1 of its length).
const STOPS = [0.04, 0.22, 0.4, 0.58, 0.77, 0.96];

const JourneyRoad = ({ stages, onPageChange }) => {
  const reduce = useReducedMotion();
  const sectionRef = useRef(null);
  const pathRef = useRef(null);

  const carRef = useRef(null);
  const [pins, setPins] = useState([]);
  const [ticks, setTicks] = useState([]);
  const [passed, setPassed] = useState(0);
  const [len, setLen] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.9", "end 0.5"],
  });

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

    // Milestone ticks between the stops, drawn perpendicular to the road.
    const marks = [];
    for (let i = 1; i < 48; i += 1) {
      const at = (total * i) / 48;
      const p = path.getPointAtLength(at);
      const q = path.getPointAtLength(Math.min(at + 2, total));
      const a = Math.atan2(q.y - p.y, q.x - p.x) + Math.PI / 2;
      marks.push({
        x1: p.x + Math.cos(a) * 15,
        y1: p.y + Math.sin(a) * 15,
        x2: p.x + Math.cos(a) * 19,
        y2: p.y + Math.sin(a) * 19,
      });
    }
    setTicks(marks);

    const start = path.getPointAtLength(0);
    place(start.x, start.y, 0);
  }, []);

  const place = (x, y, angle) => {
    carRef.current?.setAttribute("transform", `translate(${x} ${y}) rotate(${angle})`);
  };

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const path = pathRef.current;
    if (!path || !len) return;
    const t = Math.max(0, Math.min(1, v));
    const at = len * t;
    const p = path.getPointAtLength(at);
    const ahead = path.getPointAtLength(Math.min(at + 6, len));
    place(p.x, p.y, (Math.atan2(ahead.y - p.y, ahead.x - p.x) * 180) / Math.PI);

    /* Six changes over the whole scroll, not one per frame — this is the only
       thing on the road that still costs a render. */
    const reached = STOPS.filter((stop) => t >= stop - 0.015).length;
    setPassed((was) => (was === reached ? was : reached));
  });

  /* Uncovers the centre line as the car drives it. A single dash the length of
     the whole road, retracted to nothing — so the road is revealed once, in
     order, rather than a dash pattern sliding along it. */
  const revealOffset = useTransform(scrollYProgress, [0, 0.95], [len, 0]);

  return (
    <div ref={sectionRef}>
      {/* ── The drive (desktop) ── */}
      <div className="relative hidden lg:block mb-10" aria-hidden="true">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="jr-road" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#17352D" stopOpacity="0" />
              <stop offset="6%" stopColor="#17352D" stopOpacity="1" />
              <stop offset="50%" stopColor="#1e4038" />
              <stop offset="94%" stopColor="#17352D" stopOpacity="1" />
              <stop offset="100%" stopColor="#17352D" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="jr-beam" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFF6DC" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#FFF6DC" stopOpacity="0" />
            </linearGradient>
            <filter id="jr-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Tarmac, fading in and out at the ends */}
          <path d={ROAD_D} fill="none" stroke="url(#jr-road)" strokeWidth="30" strokeLinecap="round" />
          <path
            d={ROAD_D}
            fill="none"
            stroke="rgba(242,239,230,0.06)"
            strokeWidth="32"
            strokeLinecap="round"
          />

          {/* Roadside milestone ticks */}
          {ticks.map((t, i) => (
            <line
              key={i}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke="rgba(242,239,230,0.12)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          ))}

          {/* Painted centre line, drawn as you scroll.
              The dashes themselves must not move. Animating strokeDashoffset
              on a 16/18 pattern slid it along the tarmac instead of laying it
              down — forty-odd cycles across one section, which reads as a
              strobe rather than a road being painted. The dashes now sit still
              and a mask uncovers them from the start of the road onward. */}
          {!reduce && len > 0 && (
            <mask id="jr-reveal" maskUnits="userSpaceOnUse">
              <Motion.path
                d={ROAD_D}
                fill="none"
                stroke="#fff"
                strokeWidth="40"
                strokeLinecap="round"
                strokeDasharray={len}
                style={{ strokeDashoffset: revealOffset }}
              />
            </mask>
          )}
          <path
            ref={pathRef}
            d={ROAD_D}
            fill="none"
            stroke="#D4A843"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="16 18"
            opacity="0.85"
            mask={!reduce && len > 0 ? "url(#jr-reveal)" : undefined}
          />

          {/* Waypoints */}
          {pins.map((p, i) => {
            const reached = passed > i;
            return (
              <g key={i}>
                {reached && (
                  <circle cx={p.x} cy={p.y} r="19" fill="none" stroke="#D4A843" strokeWidth="2" opacity="0.3" filter="url(#jr-glow)" />
                )}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="18"
                  fill="#0A1D1A"
                  stroke={reached ? "#D4A843" : "rgba(242,239,230,0.2)"}
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
                  fill={reached ? "#E5BE5C" : "rgba(242,239,230,0.42)"}
                  style={{ transition: "fill 400ms ease" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </text>
              </g>
            );
          })}

          {/* The car */}
          <g ref={carRef} transform="translate(26 214)">
            {/* Headlight throw — a soft cone, not a hard grey triangle */}
            <path d="M22 -2 L64 -13 L64 13 L22 2 Z" fill="url(#jr-beam)" />

            {/* Side profile: bonnet, greenhouse, boot */}
            <path
              d="M-23 3
                 L-22 -2 Q-21.5 -4 -18 -4.6
                 L-11 -5.4 Q-8 -12 -1 -12.4
                 L6 -12.4 Q11 -12 13.5 -5.6
                 L19 -4.8 Q23 -4 23 0.4
                 L23 3 Q23 5 21 5
                 L-21 5 Q-23 5 -23 3 Z"
              fill="#E5BE5C"
            />
            {/* Glass */}
            <path d="M-9.5 -5.6 Q-7 -10.6 -1.4 -11 L-1.4 -5.6 Z" fill="#0A1D1A" opacity="0.55" />
            <path d="M1.4 -11 L5.6 -11 Q9.6 -10.6 11.6 -5.6 L1.4 -5.6 Z" fill="#0A1D1A" opacity="0.55" />
            {/* Wheels */}
            <circle cx="-12.5" cy="5" r="4.6" fill="#061412" />
            <circle cx="-12.5" cy="5" r="1.9" fill="#8C7A4A" />
            <circle cx="12.5" cy="5" r="4.6" fill="#061412" />
            <circle cx="12.5" cy="5" r="1.9" fill="#8C7A4A" />
            {/* Lamps */}
            <circle cx="22" cy="-0.6" r="1.8" fill="#FFF6DC" filter="url(#jr-glow)" />
            <circle cx="-22.4" cy="-0.6" r="1.4" fill="#E05252" opacity="0.85" />
          </g>
        </svg>
      </div>

      {/* ── Stage cards ── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stages.map((stage, i) => {
          const active = passed > i;
          const Icon = stage.icon || MapPin;
          return (
            <Motion.button
              key={stage.step}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, delay: (i % 3) * 0.08 }}
              onClick={() => onPageChange(stage.page)}
              className={`group relative text-left rounded-2xl border p-6 md:p-7 transition-all duration-500 hover:-translate-y-1 ${
                active
                  ? "border-saffron/35 bg-ink-800/70 shadow-[0_18px_50px_-24px_rgba(212,168,67,0.5)]"
                  : "border-white/[0.07] bg-ink-800/40 hover:border-white/20"
              }`}
            >
              {/* Gold filament along the top edge once reached */}
              <span
                className={`absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-saffron to-transparent transition-opacity duration-500 ${
                  active ? "opacity-70" : "opacity-0"
                }`}
                aria-hidden="true"
              />

              <div className="flex items-center gap-3 mb-5">
                <span
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors duration-500 ${
                    active
                      ? "border-saffron/45 bg-saffron/10"
                      : "border-white/[0.09] bg-white/[0.03]"
                  }`}
                >
                  <Icon
                    size={17}
                    className={active ? "text-saffron" : "text-ivory/45"}
                    aria-hidden="true"
                  />
                </span>
                <span className="flex flex-col">
                  <span
                    className={`font-data text-[10px] tracking-[0.24em] uppercase transition-colors duration-500 ${
                      active ? "text-saffron" : "text-ivory-faint"
                    }`}
                  >
                    {stage.step} · {stage.phase}
                  </span>
                </span>
              </div>

              <h3 className="font-display text-[1.4rem] md:text-[1.5rem] font-medium text-ivory leading-snug mb-3">
                {stage.title}
              </h3>
              <p className="text-ivory-muted text-[14.5px] leading-relaxed mb-5">
                {stage.desc}
              </p>
              <span className="inline-flex items-center gap-2 text-saffron text-[13px] font-bold tracking-wide">
                {stage.cta}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default JourneyRoad;
