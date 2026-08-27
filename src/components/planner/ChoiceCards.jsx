import React from "react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { EASE } from "./plannerOptions";

/**
 * Visual single-select cards (travel pace, travel style).
 */
const ChoiceCards = ({ options, value, onChange, label, columns = "sm:grid-cols-3" }) => {
  const reduce = useReducedMotion();

  return (
    <div className={`grid grid-cols-1 ${columns} gap-3`} role="radiogroup" aria-label={label}>
      {options.map((opt, i) => {
        const active = value === opt.id;
        const Icon = opt.icon;
        return (
          <Motion.button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-pressed={active}
            onClick={() => onChange(opt.id)}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: reduce ? 0 : i * 0.06, ease: EASE }}
            whileHover={reduce ? undefined : { y: -3 }}
            className={`relative flex flex-col items-start text-left p-5 rounded-2xl border transition-colors duration-300 ${
              active
                ? "bg-saffron/10 border-saffron/60"
                : "bg-ink-800 border-white/[0.07] hover:border-saffron/35 hover:bg-ink-700"
            }`}
          >
            {active && (
              <span className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full bg-saffron flex items-center justify-center">
                <Check size={12} className="text-ink-950" aria-hidden="true" />
              </span>
            )}
            <span
              className={`mb-4 w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
                active ? "bg-saffron/15 border-saffron/40 text-saffron" : "bg-white/[0.04] border-white/[0.07] text-ivory-faint"
              }`}
            >
              <Icon size={18} aria-hidden="true" />
            </span>
            <span className="font-display text-lg font-medium text-ivory leading-tight">{opt.label}</span>
            <span className="mt-1.5 text-sm text-ivory-muted leading-snug">{opt.desc}</span>
            {opt.meta && (
              <span className="mt-3 font-data text-[10px] uppercase tracking-[0.18em] text-ivory-faint">
                {opt.meta}
              </span>
            )}
          </Motion.button>
        );
      })}
    </div>
  );
};

export default ChoiceCards;
