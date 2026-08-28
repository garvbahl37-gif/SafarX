import React from "react";
import { motion as Motion, useReducedMotion } from "framer-motion";

/**
 * JourneyStrip — an ambient band of travel beneath the planner headline.
 *
 * A dashed route runs the width of the hero with a car and a train moving
 * along it in opposite directions, past milestone waypoints. It is decorative
 * and loops forever, so it stays cheap: transforms and opacity only.
 */

const STOPS = [12, 34, 56, 78, 94];

const JourneyStrip = ({ className = "" }) => {
  const reduce = useReducedMotion();

  return (
    <div
      className={`relative h-16 w-full max-w-3xl mx-auto ${className}`}
      aria-hidden="true"
    >
      {/* The route */}
      <span className="route-line absolute inset-x-0 top-1/2 -translate-y-1/2 block" />

      {/* Milestones */}
      {STOPS.map((left, i) => (
        <Motion.span
          key={i}
          className="absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-saffron"
          style={{ left: `${left}%` }}
          animate={reduce ? undefined : { opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 3.2, delay: i * 0.5, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Car, heading right */}
      <Motion.span
        className="absolute top-1/2 -translate-y-1/2"
        initial={{ left: "-6%" }}
        animate={reduce ? { left: "40%" } : { left: ["-6%", "106%"] }}
        transition={reduce ? { duration: 0 } : { duration: 13, repeat: Infinity, ease: "linear" }}
      >
        <svg width="46" height="22" viewBox="-24 -11 48 22" className="overflow-visible">
          <path d="M13 0 L40 -11 L40 11 Z" fill="#E5BE5C" opacity="0.16" />
          <rect x="-15" y="-7" width="30" height="14" rx="5" fill="#E5BE5C" />
          <rect x="-6" y="-5" width="12" height="10" rx="3" fill="#061412" opacity="0.6" />
          <circle cx="-8" cy="8" r="3" fill="#061412" />
          <circle cx="8" cy="8" r="3" fill="#061412" />
          <circle cx="14" cy="0" r="2" fill="#FFF6DC" />
        </svg>
      </Motion.span>

      {/* Train, heading left along the same line, offset below */}
      <Motion.span
        className="absolute top-1/2 translate-y-[3px]"
        initial={{ left: "104%" }}
        animate={reduce ? { left: "60%" } : { left: ["104%", "-14%"] }}
        transition={
          reduce
            ? { duration: 0 }
            : { duration: 19, repeat: Infinity, ease: "linear", delay: 3 }
        }
      >
        <svg width="86" height="20" viewBox="0 -10 86 20" className="overflow-visible">
          {/* engine */}
          <rect x="0" y="-7" width="26" height="13" rx="4" fill="#2E8B74" />
          <rect x="4" y="-5" width="8" height="7" rx="2" fill="#061412" opacity="0.55" />
          <circle cx="2" cy="0" r="1.8" fill="#FFF6DC" />
          {/* carriages */}
          {[30, 50, 70].map((x) => (
            <g key={x}>
              <rect x={x} y="-6" width="16" height="11" rx="3" fill="#3FA98E" opacity="0.85" />
              <rect x={x + 3} y="-3.5" width="4" height="4" rx="1" fill="#061412" opacity="0.45" />
              <rect x={x + 9} y="-3.5" width="4" height="4" rx="1" fill="#061412" opacity="0.45" />
            </g>
          ))}
          {/* wheels */}
          {[6, 20, 34, 44, 54, 64, 74, 82].map((x) => (
            <circle key={x} cx={x} cy="7" r="2.2" fill="#061412" />
          ))}
        </svg>
      </Motion.span>
    </div>
  );
};

export default JourneyStrip;
