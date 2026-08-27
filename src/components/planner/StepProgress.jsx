import React from "react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { EASE } from "./plannerOptions";

/**
 * Route-line progress indicator — each step is a waypoint on a dashed flight
 * path. Completed legs light up in gold; the active waypoint pulses.
 *
 * Steps behind the furthest-reached one are clickable so travellers can go
 * back and edit without losing their place.
 */
const StepProgress = ({ steps, current, furthest = current, onJump }) => {
  const reduce = useReducedMotion();
  const total = steps.length;
  const pct = total > 1 ? Math.round((current / (total - 1)) * 100) : 0;

  return (
    <div className="w-full">
      <div
        className="flex items-center"
        role="progressbar"
        aria-label="Trip planner progress"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current + 1}
        aria-valuetext={`Step ${current + 1} of ${total} — ${steps[current]?.label}`}
      >
        {steps.map((step, i) => {
          const done = i < current;
          const active = i === current;
          const reachable = i <= furthest;
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              {i > 0 && (
                <span className="relative flex-1 mx-1.5 sm:mx-2.5 h-px" aria-hidden="true">
                  <span className="route-line absolute inset-0" />
                  <Motion.span
                    className="absolute inset-y-0 left-0 bg-saffron/70"
                    initial={false}
                    animate={{ width: i <= current ? "100%" : "0%" }}
                    transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
                    style={{ height: 1 }}
                  />
                </span>
              )}

              <button
                type="button"
                onClick={reachable && onJump ? () => onJump(i) : undefined}
                disabled={!reachable || !onJump}
                aria-current={active ? "step" : undefined}
                aria-label={`Step ${i + 1} of ${total}: ${step.label}${done ? " (completed)" : ""}`}
                className={`group relative flex flex-col items-center gap-2 shrink-0 rounded-xl px-1 py-1
                  ${reachable && onJump ? "cursor-pointer" : "cursor-default"}
                  disabled:cursor-default`}
              >
                <span
                  className={`relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border transition-colors duration-300
                    ${active
                      ? "bg-saffron text-ink-950 border-saffron"
                      : done
                        ? "bg-saffron/15 text-saffron border-saffron/50"
                        : "bg-ink-800 text-ivory-faint border-white/[0.07] group-hover:border-saffron/35"}`}
                >
                  {active && !reduce && (
                    <Motion.span
                      className="absolute inset-0 rounded-full bg-saffron/35"
                      animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative">
                    {done ? <Check size={16} aria-hidden="true" /> : <Icon size={16} aria-hidden="true" />}
                  </span>
                </span>

                <span
                  className={`hidden sm:block font-data text-[10px] uppercase tracking-[0.18em] whitespace-nowrap transition-colors
                    ${active ? "text-saffron" : done ? "text-ivory-muted" : "text-ivory-faint"}`}
                >
                  {step.label}
                </span>
                <span
                  className={`sm:hidden font-data text-[9px] uppercase tracking-[0.16em] whitespace-nowrap
                    ${active ? "text-saffron" : "text-ivory-faint"}`}
                >
                  {step.short}
                </span>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      <p className="mt-4 font-data text-[10px] uppercase tracking-[0.22em] text-ivory-faint">
        Step {current + 1} / {total} · {pct}% charted
      </p>
    </div>
  );
};

export default StepProgress;
