import React from "react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { INTERESTS_OPTIONS, EASE } from "./plannerOptions";

/**
 * Multi-select interest tiles. Selected ids are sent to Gemini verbatim.
 */
const InterestChips = ({ selected, onToggle }) => {
  const reduce = useReducedMotion();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5" role="group" aria-label="Trip interests">
      {INTERESTS_OPTIONS.map((interest, i) => {
        const active = selected.includes(interest.id);
        const Icon = interest.icon;
        return (
          <Motion.button
            key={interest.id}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(interest.id)}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: reduce ? 0 : i * 0.03, ease: EASE }}
            whileHover={reduce ? undefined : { y: -3 }}
            whileTap={reduce ? undefined : { scale: 0.97 }}
            className={`relative flex flex-col items-center justify-center gap-2.5 px-3 py-5 rounded-xl border transition-colors duration-300 ${
              active
                ? "bg-saffron/10 border-saffron/60"
                : "bg-ink-800 border-white/[0.07] hover:border-saffron/35 hover:bg-ink-700"
            }`}
          >
            {active && (
              <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-saffron flex items-center justify-center">
                <Check size={10} className="text-ink-950" aria-hidden="true" />
              </span>
            )}
            <Icon size={20} className={active ? "text-saffron" : "text-ivory-faint"} aria-hidden="true" />
            <span className={`text-sm text-center leading-tight ${active ? "text-ivory font-medium" : "text-ivory-muted"}`}>
              {interest.label}
            </span>
          </Motion.button>
        );
      })}
    </div>
  );
};

export default InterestChips;
