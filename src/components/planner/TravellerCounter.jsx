import React from "react";
import { Minus, Plus, User, Baby, Accessibility } from "lucide-react";

const GROUPS = [
  { key: "adults", label: "Adults", hint: "13 and over", icon: User, min: 1, max: 20 },
  { key: "children", label: "Children", hint: "0 – 12 years", icon: Baby, min: 0, max: 12 },
  { key: "seniors", label: "Seniors", hint: "65 and over", icon: Accessibility, min: 0, max: 12 },
];

/**
 * Adults / children / seniors steppers.
 *
 * The Gemini payload only carries the `travelingWithChildren` and
 * `travelingWithSeniors` booleans — the counts are derived into those by the
 * parent, so the request body is unchanged.
 */
const TravellerCounter = ({ counts, onChange }) => (
  <div className="flex flex-col gap-3">
    {GROUPS.map((group) => {
      const Icon = group.icon;
      const value = counts[group.key];
      const id = `planner-count-${group.key}`;
      return (
        <div
          key={group.key}
          className="flex items-center gap-4 p-4 rounded-2xl bg-ink-800 border border-white/[0.07] hover:border-saffron/25 transition-colors"
        >
          <span
            className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border ${
              value > 0 ? "bg-saffron/12 border-saffron/35 text-saffron" : "bg-white/[0.04] border-white/[0.07] text-ivory-faint"
            }`}
          >
            <Icon size={17} aria-hidden="true" />
          </span>

          <div className="min-w-0 flex-1">
            <p id={id} className="text-ivory text-sm font-medium">{group.label}</p>
            <p className="font-data text-[10px] uppercase tracking-[0.16em] text-ivory-faint mt-0.5">{group.hint}</p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onChange(group.key, Math.max(group.min, value - 1))}
              disabled={value <= group.min}
              aria-label={`Remove one ${group.label.toLowerCase().replace(/s$/, "")}`}
              className="w-9 h-9 rounded-full border border-white/[0.1] bg-white/[0.04] text-ivory flex items-center justify-center hover:border-saffron/45 hover:text-saffron transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-white/[0.1] disabled:hover:text-ivory"
            >
              <Minus size={15} aria-hidden="true" />
            </button>

            <output
              htmlFor={id}
              aria-live="polite"
              className="w-9 text-center font-data text-lg text-ivory tabular-nums"
            >
              {value}
            </output>

            <button
              type="button"
              onClick={() => onChange(group.key, Math.min(group.max, value + 1))}
              disabled={value >= group.max}
              aria-label={`Add one ${group.label.toLowerCase().replace(/s$/, "")}`}
              className="w-9 h-9 rounded-full border border-white/[0.1] bg-white/[0.04] text-ivory flex items-center justify-center hover:border-saffron/45 hover:text-saffron transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      );
    })}
  </div>
);

export default TravellerCounter;
