import React from "react";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown, MapPin, Clock, ArrowRight, ShieldAlert } from "lucide-react";
import { EASE, formatINR } from "./plannerOptions";

/**
 * One day of the itinerary — a collapsible card whose activities run down a
 * dashed route line with glowing gold waypoints.
 */
const DayCard = ({ day, index, expanded, onToggle }) => {
  const reduce = useReducedMotion();
  const activities = day.activities || [];
  const bodyId = `itinerary-day-${day.dayNumber}-body`;
  const headId = `itinerary-day-${day.dayNumber}`;

  return (
    <Motion.article
      id={headId}
      initial={reduce ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: reduce ? 0 : Math.min(index, 4) * 0.05, ease: EASE }}
      className="relative scroll-mt-32 rounded-2xl border border-white/[0.07] bg-ink-800 transition-colors duration-500 hover:border-saffron/35"
    >
      {/* Day header */}
      <h4>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={bodyId}
          className="w-full flex items-start sm:items-center justify-between gap-4 p-5 sm:p-6 text-left rounded-2xl"
        >
          <span className="flex items-start sm:items-center gap-4 min-w-0">
            <span className="relative shrink-0 w-12 h-12 rounded-xl bg-saffron/10 border border-saffron/30 flex flex-col items-center justify-center">
              <span className="font-data text-[8px] uppercase tracking-[0.16em] text-saffron/70 leading-none">Day</span>
              <span className="font-data text-base font-medium text-saffron leading-none mt-0.5 tabular-nums">
                {String(day.dayNumber).padStart(2, "0")}
              </span>
            </span>
            <span className="min-w-0">
              <span className="block font-display text-xl sm:text-2xl font-medium text-ivory leading-tight truncate">
                {day.theme || day.date}
              </span>
              <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-data text-[10px] uppercase tracking-[0.16em] text-ivory-faint">
                {day.theme && day.date && <span>{day.date}</span>}
                <span>{activities.length} {activities.length === 1 ? "stop" : "stops"}</span>
                {day.dayTotal > 0 && <span className="text-saffron">{formatINR(day.dayTotal)}</span>}
              </span>
            </span>
          </span>

          <span className="shrink-0 flex items-center gap-3">
            <Motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
              className="w-8 h-8 rounded-full border border-white/[0.1] bg-white/[0.04] flex items-center justify-center text-ivory-muted"
            >
              <ChevronDown size={15} aria-hidden="true" />
            </Motion.span>
          </span>
        </button>
      </h4>

      {/* Day body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <Motion.div
            id={bodyId}
            key="body"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="px-5 sm:px-6 pb-6 pt-1">
              <div className="relative pl-7 sm:pl-9">
                {/* Vertical route line */}
                <span
                  className="absolute left-[7px] sm:left-[9px] top-3 bottom-3 w-px bg-gradient-to-b from-saffron/50 via-white/10 to-transparent"
                  aria-hidden="true"
                />

                <ol className="space-y-4">
                  {activities.map((activity, idx) => (
                    <li key={idx} className="relative">
                      {/* Waypoint */}
                      <span
                        className="absolute -left-7 sm:-left-9 top-5 w-[9px] h-[9px] rounded-full bg-saffron shadow-[0_0_10px_rgba(212,168,67,0.7)] translate-x-[3px] sm:translate-x-[5px]"
                        aria-hidden="true"
                      />

                      <div className="rounded-xl border border-white/[0.06] bg-ink-900 p-4 sm:p-5 hover:border-saffron/25 transition-colors duration-300">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5 mb-2">
                          <span className="font-data text-xs text-saffron tabular-nums tracking-wide">
                            {activity.startTime}
                            {activity.endTime ? ` – ${activity.endTime}` : ""}
                          </span>
                          {activity.estimatedCostINR > 0 && (
                            <span className="font-data text-sm text-saffron tabular-nums">
                              {formatINR(activity.estimatedCostINR)}
                            </span>
                          )}
                        </div>

                        <h5 className="text-base font-semibold text-ivory leading-snug">{activity.title}</h5>

                        {activity.shortDescription && (
                          <p className="mt-2 text-sm text-ivory-muted leading-relaxed">{activity.shortDescription}</p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 font-data text-[10px] uppercase tracking-[0.14em] text-ivory-faint">
                          {activity.location && (
                            <span className="flex items-center gap-1.5">
                              <MapPin size={11} className="text-saffron/80" aria-hidden="true" />
                              {activity.location}
                            </span>
                          )}
                          {activity.duration && (
                            <span className="flex items-center gap-1.5">
                              <Clock size={11} className="text-saffron/80" aria-hidden="true" />
                              {activity.duration}
                            </span>
                          )}
                        </div>

                        {(activity.recommendedTransport || activity.safetyTips) && (
                          <div className="mt-4 pt-3.5 border-t border-white/[0.06] flex flex-col gap-2.5">
                            {activity.recommendedTransport && (
                              <p className="flex items-start gap-2 text-xs text-ivory-muted leading-relaxed">
                                <ArrowRight size={12} className="text-saffron mt-0.5 shrink-0" aria-hidden="true" />
                                <span>Getting there: {activity.recommendedTransport}</span>
                              </p>
                            )}
                            {activity.safetyTips && (
                              <p className="flex items-start gap-2 rounded-lg border border-white/[0.07] bg-white/[0.04] p-2.5 text-xs text-ivory-muted leading-relaxed">
                                <ShieldAlert size={12} className="text-saffron mt-0.5 shrink-0" aria-hidden="true" />
                                <span>{activity.safetyTips}</span>
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </Motion.article>
  );
};

export default DayCard;
