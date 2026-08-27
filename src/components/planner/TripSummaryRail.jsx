import React from "react";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MapPin, CalendarDays, Users, Wallet, Heart, Compass, Gauge } from "lucide-react";
import { formatINR, formatDate, EASE } from "./plannerOptions";

const Row = ({ icon, label, children, empty }) => {
  const Icon = icon;
  return (
  <div className="flex items-start gap-3 py-3.5">
    <span
      className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center border ${
        empty ? "bg-white/[0.03] border-white/[0.06] text-ivory-faint" : "bg-saffron/10 border-saffron/30 text-saffron"
      }`}
    >
      <Icon size={14} aria-hidden="true" />
    </span>
    <div className="min-w-0 flex-1">
      <p className="font-data text-[10px] uppercase tracking-[0.18em] text-ivory-faint mb-1">{label}</p>
      <div className={`text-sm leading-snug ${empty ? "text-ivory-faint italic" : "text-ivory"}`}>{children}</div>
    </div>
  </div>
  );
};

/**
 * Live trip summary — updates as the traveller fills the stepped form.
 * Sticky alongside the form on desktop, a plain card on mobile.
 */
const TripSummaryRail = ({
  destination, startDate, endDate, days, counts, budget, interests, pace, travelStyle, filledCount, totalFields,
}) => {
  const reduce = useReducedMotion();
  const nights = Math.max(days - 1, 0);
  const pct = totalFields > 0 ? Math.round((filledCount / totalFields) * 100) : 0;

  const travellerText = [
    `${counts.adults} ${counts.adults === 1 ? "adult" : "adults"}`,
    counts.children > 0 ? `${counts.children} ${counts.children === 1 ? "child" : "children"}` : null,
    counts.seniors > 0 ? `${counts.seniors} ${counts.seniors === 1 ? "senior" : "seniors"}` : null,
  ].filter(Boolean).join(" · ");

  return (
    <aside
      aria-label="Trip summary so far"
      className="glass-panel !rounded-3xl border border-white/[0.07] p-6 lg:sticky lg:top-28"
    >
      <div className="flex items-center gap-3 mb-1">
        <span className="route-dot" aria-hidden="true" />
        <span className="eyebrow">Your trip so far</span>
        <span className="route-line flex-1" aria-hidden="true" />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <Motion.h3
          key={destination || "unset"}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="mt-4 mb-5 font-display italic text-3xl font-medium text-ivory leading-tight break-words"
        >
          {destination ? destination.replace(/, India$/, "") : "Somewhere in India"}
        </Motion.h3>
      </AnimatePresence>

      <div className="divide-y divide-white/[0.06] border-t border-white/[0.06]">
        <Row icon={MapPin} label="Destination" empty={!destination}>
          {destination || "Not chosen yet"}
        </Row>

        <Row icon={CalendarDays} label="Dates" empty={!startDate || !endDate}>
          {startDate && endDate ? (
            <>
              {formatDate(startDate)} → {formatDate(endDate)}
              <span className="block mt-1 font-data text-xs text-saffron tabular-nums">
                {days} {days === 1 ? "day" : "days"} · {nights} {nights === 1 ? "night" : "nights"}
              </span>
            </>
          ) : "Pick a travel window"}
        </Row>

        <Row icon={Users} label="Travellers">{travellerText}</Row>

        <Row icon={Wallet} label="Budget" empty={budget === ""}>
          {budget === "" ? "Flexible" : (
            <>
              <span className="font-data tabular-nums">{formatINR(budget)}</span>
              {days > 0 && (
                <span className="block mt-1 font-data text-xs text-ivory-faint tabular-nums">
                  ≈ {formatINR(Number(budget) / days)} / day
                </span>
              )}
            </>
          )}
        </Row>

        <Row icon={Gauge} label="Pace & style">
          {pace} · {travelStyle}
        </Row>

        <Row icon={Heart} label="Interests" empty={interests.length === 0}>
          {interests.length === 0 ? "Nothing picked — SafarX will keep it general" : (
            <span className="flex flex-wrap gap-1.5 mt-0.5">
              {interests.map((i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-full bg-saffron/10 border border-saffron/25 font-data text-[10px] uppercase tracking-[0.12em] text-saffron"
                >
                  {i}
                </span>
              ))}
            </span>
          )}
        </Row>
      </div>

      {/* Completeness meter */}
      <div className="mt-6 pt-5 border-t border-white/[0.06]">
        <div className="flex items-center justify-between mb-2.5">
          <span className="font-data text-[10px] uppercase tracking-[0.18em] text-ivory-faint">Plan detail</span>
          <span className="font-data text-[10px] uppercase tracking-[0.18em] text-saffron tabular-nums">{pct}%</span>
        </div>
        <div
          className="h-1 rounded-full bg-white/[0.07] overflow-hidden"
          role="progressbar"
          aria-label="How complete your trip brief is"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        >
          <Motion.div
            className="h-full bg-gradient-to-r from-saffron to-saffron-bright"
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
          />
        </div>
        <p className="mt-3 flex items-center gap-2 text-xs text-ivory-faint leading-relaxed">
          <Compass size={12} className="text-saffron shrink-0" aria-hidden="true" />
          The more you tell SafarX, the sharper the day plan.
        </p>
      </div>
    </aside>
  );
};

export default TripSummaryRail;
