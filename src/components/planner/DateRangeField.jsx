import React from "react";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { AlertTriangle, CalendarDays, Sunrise, Sunset } from "lucide-react";
import { EASE, dayCountBetween, formatDate, todayISO } from "./plannerOptions";
import RangeCalendar from "./RangeCalendar";

/**
 * Trip window: start/end dates plus the active hours of each day.
 * Invalid ranges explain exactly what to change, not just that it's wrong.
 */
const DateRangeField = ({ values, onChange }) => {
  const reduce = useReducedMotion();
  const { startDate, endDate, startTime, endTime } = values;

  const days = dayCountBetween(startDate, endDate);
  const min = todayISO();

  let error = null;
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    error = `Your end date (${formatDate(endDate)}) falls before your start date (${formatDate(startDate)}). Move the end date to ${formatDate(startDate)} or later.`;
  } else if (startTime && endTime && startTime >= endTime) {
    error = "The day should end after it starts — set the end of day later than the start, for example 09:00 to 20:00.";
  }

  const field = (id, label, Icon, name, type, extra = {}) => (
    <div>
      <label htmlFor={id} className="form-label flex items-center gap-2">
        <Icon size={13} className="text-saffron" aria-hidden="true" />
        {label}
      </label>
      <input
        id={id}
        type={type}
        name={name}
        value={values[name]}
        onChange={(e) => onChange(name, e.target.value)}
        className="glass-input w-full [color-scheme:dark]"
        aria-invalid={error ? true : undefined}
        {...extra}
      />
    </div>
  );

  return (
    <div>
      {/* Selected range readout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {[
          { key: "startDate", label: "Start date", Icon: Sunrise, value: startDate },
          { key: "endDate", label: "End date", Icon: Sunset, value: endDate },
        ].map(({ key, label, Icon, value }) => (
          <div
            key={key}
            className={`rounded-xl border px-4 py-3.5 transition-colors duration-300 ${
              value ? "border-saffron/35 bg-saffron/[0.06]" : "border-white/[0.08] bg-white/[0.02]"
            }`}
          >
            <span className="form-label flex items-center gap-2 !mb-1.5">
              <Icon size={13} className="text-saffron" aria-hidden="true" />
              {label}
            </span>
            <span className={`font-data text-[15px] tabular-nums ${value ? "text-ivory" : "text-ivory-faint"}`}>
              {value ? formatDate(value) : "Not picked"}
            </span>
          </div>
        ))}
      </div>

      <RangeCalendar
        startDate={startDate}
        endDate={endDate}
        minDate={min}
        onChange={(nextStart, nextEnd) => {
          onChange("startDate", nextStart);
          onChange("endDate", nextEnd);
        }}
      />

      <AnimatePresence initial={false}>
        {error && (
          <Motion.p
            role="alert"
            initial={reduce ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduce ? undefined : { opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="mt-4 flex items-start gap-2.5 rounded-xl border border-saffron/40 bg-saffron/10 p-3.5 text-sm text-ivory leading-relaxed"
          >
            <AlertTriangle size={15} className="text-saffron mt-0.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </Motion.p>
        )}
      </AnimatePresence>

      {!error && days > 0 && (
        <p className="mt-4 flex flex-wrap items-center gap-2.5 font-data text-[11px] uppercase tracking-[0.18em] text-ivory-faint">
          <span className="route-dot" aria-hidden="true" />
          {days} {days === 1 ? "day" : "days"} · {Math.max(days - 1, 0)} {days - 1 === 1 ? "night" : "nights"}
          <span className="route-line w-8 hidden sm:inline-block" aria-hidden="true" />
          {formatDate(startDate)} → {formatDate(endDate)}
        </p>
      )}

      <div className="mt-8 pt-7 border-t border-white/[0.07]">
        <p className="eyebrow-muted mb-4">Hours you want to be out</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {field("planner-start-time", "Day starts", Sunrise, "startTime", "time")}
          {field("planner-end-time", "Day ends", Sunset, "endTime", "time")}
        </div>
        <p className="mt-3 text-sm text-ivory-faint leading-relaxed">
          SafarX packs each day inside this window — useful if you travel with early risers or prefer late starts.
        </p>
      </div>
    </div>
  );
};

export default DateRangeField;
