import React, { useState } from "react";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import SrishtiRings from "./SrishtiRings";

const EASE = [0.22, 1, 0.36, 1];

/**
 * The way in to Srishti.
 *
 * Not a chat bubble and not a headset icon — a small live instance of the same
 * ring field she appears as, so the button is her rather than a picture of
 * her. It breathes on its own, and her name in Devanagari unfurls beside it on
 * approach.
 */
const SrishtiLauncher = ({ onOpen, hidden = false }) => {
  const [hovered, setHovered] = useState(false);
  const reduce = useReducedMotion();

  if (hidden) return null;

  return (
    <Motion.button
      type="button"
      onClick={onOpen}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: 1.1 }}
      aria-label="Talk to Srishti"
      className="group fixed bottom-6 right-6 z-[70] flex items-center gap-0 rounded-full
                 border border-saffron/25 bg-ink-900/85 py-1.5 pl-1.5 pr-1.5 backdrop-blur-xl
                 shadow-[0_18px_44px_rgba(0,0,0,0.55)] transition-colors duration-500
                 hover:border-saffron/55 focus-visible:border-saffron/70 focus-visible:outline-none"
    >
      {/* Her, in miniature and alive. */}
      <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full">
        <SrishtiRings state={hovered ? "listening" : "idle"} size={44} />
      </span>

      {/* Name unfurls rather than sitting there — the button stays small at rest. */}
      <AnimatePresence>
        {hovered && (
          <Motion.span
            initial={reduce ? { opacity: 0 } : { width: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { width: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { width: 0, opacity: 0 }}
            transition={{ duration: 0.42, ease: EASE }}
            className="overflow-hidden whitespace-nowrap"
          >
            <span className="flex flex-col items-start pl-2.5 pr-3 text-left">
              <span className="font-devanagari text-[15px] leading-none text-saffron-bright">
                सृष्टि
              </span>
              <span className="mt-1 font-data text-[8.5px] uppercase tracking-[0.2em] text-ivory-faint">
                Ask her anything
              </span>
            </span>
          </Motion.span>
        )}
      </AnimatePresence>
    </Motion.button>
  );
};

export default SrishtiLauncher;
