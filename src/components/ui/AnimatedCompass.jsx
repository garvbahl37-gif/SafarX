import React, { useId } from "react";
import { motion as Motion, useReducedMotion } from "framer-motion";

/**
 * AnimatedCompass — the app's signature loading instrument.
 *
 * A brass-and-gold marine compass: an engraved bezel with degree ticks and
 * cardinal letters, a slowly counter-rotating rose, a needle that swings with
 * spring physics and settles north, a sweeping direction-finder arc, and a
 * glass dome highlight. Everything is SVG + transforms, so it stays crisp at
 * any size and cheap to animate.
 *
 * Sizes: 64–80 inline, 120–200 as a page centrepiece.
 */
const AnimatedCompass = ({
  size = 140,
  spin = true,
  needleTo = -18,
  className = "",
  title = "Loading",
}) => {
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const animate = spin && !reduce;

  const TICKS = Array.from({ length: 72 }, (_, i) => i * 5);

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={title}
    >
      {/* Warm bloom behind the instrument */}
      {!reduce && (
        <Motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(212,168,67,0.20) 0%, rgba(212,168,67,0.05) 45%, transparent 70%)",
          }}
          animate={{ opacity: [0.45, 0.9, 0.45], scale: [0.94, 1.06, 0.94] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={`rim-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E5BE5C" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#D4A843" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#A67E2B" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id={`needleN-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F0D48A" />
            <stop offset="100%" stopColor="#D4A843" />
          </linearGradient>
          <linearGradient id={`needleS-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(242,239,230,0.42)" />
            <stop offset="100%" stopColor="rgba(242,239,230,0.16)" />
          </linearGradient>
          <linearGradient id={`sweep-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#D4A843" stopOpacity="0" />
            <stop offset="100%" stopColor="#D4A843" stopOpacity="0.85" />
          </linearGradient>
          <radialGradient id={`dome-${uid}`} cx="34%" cy="26%" r="62%">
            <stop offset="0%" stopColor="#F2EFE6" stopOpacity="0.16" />
            <stop offset="55%" stopColor="#F2EFE6" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#F2EFE6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Case */}
        <circle cx="100" cy="100" r="94" fill="rgba(6,20,18,0.55)" />
        <circle cx="100" cy="100" r="94" fill="none" stroke={`url(#rim-${uid})`} strokeWidth="2" />
        <circle cx="100" cy="100" r="86" fill="none" stroke="rgba(212,168,67,0.18)" strokeWidth="1" />

        {/* Direction-finder sweep */}
        {animate && (
          <Motion.g
            style={{ originX: "100px", originY: "100px" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "linear" }}
          >
            <path
              d="M100 100 L100 14 A86 86 0 0 1 161 39 Z"
              fill={`url(#sweep-${uid})`}
              opacity="0.28"
            />
          </Motion.g>
        )}

        {/* Rose: ticks + cardinals, counter-rotating slowly */}
        <Motion.g
          style={{ originX: "100px", originY: "100px" }}
          animate={animate ? { rotate: [0, -360] } : undefined}
          transition={{ duration: 42, repeat: Infinity, ease: "linear" }}
        >
          {TICKS.map((deg) => {
            const major = deg % 45 === 0;
            const mid = deg % 15 === 0;
            const len = major ? 13 : mid ? 8 : 4;
            const rad = (deg * Math.PI) / 180;
            const r1 = 78 - len;
            return (
              <line
                key={deg}
                x1={100 + Math.sin(rad) * r1}
                y1={100 - Math.cos(rad) * r1}
                x2={100 + Math.sin(rad) * 78}
                y2={100 - Math.cos(rad) * 78}
                stroke={major ? "rgba(212,168,67,0.85)" : "rgba(242,239,230,0.24)"}
                strokeWidth={major ? 2 : 1}
                strokeLinecap="round"
              />
            );
          })}

          {[
            ["N", 0],
            ["E", 90],
            ["S", 180],
            ["W", 270],
          ].map(([letter, deg]) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <text
                key={letter}
                x={100 + Math.sin(rad) * 58}
                y={100 - Math.cos(rad) * 58}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="15"
                fontFamily="'Space Grotesk', monospace"
                letterSpacing="1"
                fill={letter === "N" ? "#E5BE5C" : "rgba(242,239,230,0.5)"}
                fontWeight={letter === "N" ? 700 : 500}
              >
                {letter}
              </text>
            );
          })}

          {/* Engraved inner ring */}
          <circle
            cx="100"
            cy="100"
            r="44"
            fill="none"
            stroke="rgba(242,239,230,0.10)"
            strokeWidth="1"
            strokeDasharray="2 6"
          />
        </Motion.g>

        {/* Needle — swings, then settles */}
        <Motion.g
          style={{ originX: "100px", originY: "100px" }}
          initial={{ rotate: needleTo - 150 }}
          animate={
            animate
              ? { rotate: [needleTo - 26, needleTo + 20, needleTo - 9, needleTo + 4, needleTo] }
              : { rotate: needleTo }
          }
          transition={
            animate
              ? { duration: 5.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
              : { type: "spring", stiffness: 60, damping: 12 }
          }
        >
          {/* North half */}
          <path d="M100 30 L108 100 L100 112 L92 100 Z" fill={`url(#needleN-${uid})`} />
          {/* South half */}
          <path d="M100 170 L92 100 L100 88 L108 100 Z" fill={`url(#needleS-${uid})`} />
          {/* Luminous tip */}
          <circle cx="100" cy="34" r="3.5" fill="#F0D48A">
            {animate && (
              <animate
                attributeName="opacity"
                values="1;0.35;1"
                dur="2.2s"
                repeatCount="indefinite"
              />
            )}
          </circle>
        </Motion.g>

        {/* Pivot */}
        <circle cx="100" cy="100" r="8" fill="#0A1D1A" stroke="rgba(212,168,67,0.7)" strokeWidth="1.5" />
        <circle cx="100" cy="100" r="2.6" fill="#E5BE5C" />

        {/* Glass dome */}
        <circle cx="100" cy="100" r="86" fill={`url(#dome-${uid})`} pointerEvents="none" />
      </svg>
    </div>
  );
};

export default AnimatedCompass;
