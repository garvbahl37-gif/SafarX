import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { CalendarDays, ChevronRight, X } from "lucide-react";
import CalendarPanel from "./CalendarPanel";
import {
  toISO, parseISO, startOfDay, startOfMonth, addDays, nightsBetween,
  prettyDate, weekdayOf, useAnchoredPopover,
} from "./dateUtils";

/* Weekend = the coming Friday through Sunday. */
const nextFriday = (from) => {
  const delta = (5 - ((from.getDay() + 6) % 7 + 1) + 7) % 7;
  return addDays(from, delta === 0 ? 7 : delta);
};

/**
 * DateRangeField — one control for a pair of dates that belong together
 * (check-in/check-out, departure/return).
 *
 * Both ends share a single calendar, so the span between them is visible as
 * a band while it is being chosen rather than being two disconnected inputs.
 * The value contract stays ISO `YYYY-MM-DD` strings, as the native input had.
 */
const DateRangeField = ({
  startValue,
  endValue,
  onChange,
  min,
  max,
  startLabel = "Start",
  endLabel = "End",
  unit = "night",
  presets = true,
  className = "",
}) => {
  const reduce = useReducedMotion();
  const today = useMemo(() => startOfDay(new Date()), []);
  const start = parseISO(startValue);
  const end = parseISO(endValue);
  const minDate = parseISO(min) || today;
  const maxDate = parseISO(max);

  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState("start");
  const [cursor, setCursor] = useState(() => startOfMonth(start || minDate));
  const [narrow, setNarrow] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 780
  );

  const triggerRef = useRef(null);
  const popRef = useRef(null);
  const closeTimer = useRef(null);

  const months = narrow ? 1 : 2;
  const width = narrow ? 340 : 664;
  const coords = useAnchoredPopover({
    open,
    onClose: () => setOpen(false),
    triggerRef,
    popRef,
    width,
    height: 430,
  });

  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 780);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const openAt = (which) => {
    setPicking(which);
    setCursor(startOfMonth((which === "end" ? end || start : start) || minDate));
    setOpen(true);
  };

  const handlePick = (d) => {
    if (picking === "start" || !start || d <= start) {
      onChange(toISO(d), "");
      setPicking("end");
      return;
    }
    onChange(toISO(start), toISO(d));
    // Hold the panel open a beat so the completed range is seen before it goes.
    closeTimer.current = setTimeout(() => setOpen(false), 280);
  };

  const applyPreset = (from, nights) => {
    onChange(toISO(from), toISO(addDays(from, nights)));
    setCursor(startOfMonth(from));
    setPicking("end");
  };

  const clear = () => {
    onChange("", "");
    setPicking("start");
  };

  const nights = nightsBetween(start, end);

  const segment = (which, label, date) => {
    const active = open && picking === which;
    return (
      <button
        type="button"
        onClick={() => openAt(which)}
        aria-haspopup="dialog"
        aria-expanded={open && picking === which}
        className={`flex-1 min-w-0 text-left px-4 py-3 transition-colors duration-300 ${
          active ? "bg-saffron/[0.07]" : "hover:bg-white/[0.03]"
        }`}
      >
        <span
          className={`block font-data text-[9.5px] uppercase tracking-[0.16em] mb-1 transition-colors duration-300 ${
            active ? "text-saffron" : "text-ivory-faint"
          }`}
        >
          {label}
        </span>
        <span
          className={`block font-data text-[15px] tabular-nums leading-none truncate ${
            date ? "text-ivory" : "text-ivory-faint"
          }`}
        >
          {date ? prettyDate(date) : "Select"}
        </span>
        <span className="block font-sans text-[10px] text-ivory-faint mt-1 truncate">
          {date ? weekdayOf(date) : " "}
        </span>
      </button>
    );
  };

  return (
    <>
      <div
        ref={triggerRef}
        className={`flex items-stretch rounded-2xl border overflow-hidden transition-all duration-300 ${
          open
            ? "border-saffron/50 bg-white/[0.05] shadow-[0_0_0_3px_rgba(212,168,67,0.09)]"
            : start || end
              ? "border-saffron/25 bg-white/[0.03] hover:border-saffron/40"
              : "border-white/[0.09] bg-white/[0.03] hover:border-white/20"
        } ${className}`}
      >
        {segment("start", startLabel, start)}

        <div className="relative w-px my-2 bg-gradient-to-b from-transparent via-white/[0.12] to-transparent shrink-0">
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {nights > 0 ? (
              <span
                className="flex items-center justify-center min-w-[30px] h-[22px] px-1.5 rounded-full
                           bg-ink-800 border border-saffron/35 font-data text-[10px] tabular-nums
                           text-saffron shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
              >
                {nights}
                {unit.charAt(0).toUpperCase()}
              </span>
            ) : (
              <span className="flex items-center justify-center w-[22px] h-[22px] rounded-full bg-ink-800 border border-white/[0.09]">
                <ChevronRight size={11} className="text-ivory-faint" aria-hidden="true" />
              </span>
            )}
          </span>
        </div>

        {segment("end", endLabel, end)}

        <span className="flex items-center pr-3.5 pl-1 shrink-0">
          {start || end ? (
            <button
              type="button"
              onClick={clear}
              aria-label="Clear dates"
              className="w-7 h-7 rounded-full flex items-center justify-center text-ivory-faint
                         hover:text-saffron hover:bg-white/[0.06] transition-colors duration-300"
            >
              <X size={13} />
            </button>
          ) : (
            <CalendarDays size={15} className="text-ivory-faint" aria-hidden="true" />
          )}
        </span>
      </div>

      {createPortal(
        <AnimatePresence>
          {open && coords && (
          <Motion.div
            ref={popRef}
            role="dialog"
            aria-label={`Choose ${startLabel} and ${endLabel}`}
            initial={reduce ? false : { opacity: 0, y: coords.origin === "top" ? -10 : 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: coords.origin === "top" ? -10 : 10, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "fixed",
              left: coords.left,
              top: coords.top,
              width: coords.width,
              zIndex: 9999,
              transformOrigin: coords.origin,
            }}
            className="rounded-[22px] border border-white/[0.1] bg-ink-900/[0.97] backdrop-blur-2xl
                       shadow-[0_32px_90px_rgba(0,0,0,0.75)] p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="eyebrow text-saffron/80">
                {picking === "start" ? startLabel : endLabel}
              </span>
              {nights > 0 && (
                <span className="font-display italic text-[13px] text-ivory-muted">
                  {nights} {unit}{nights > 1 ? "s" : ""}
                </span>
              )}
            </div>

            <CalendarPanel
              mode="range"
              start={start}
              end={end}
              picking={picking}
              minDate={minDate}
              maxDate={maxDate}
              months={months}
              cursor={cursor}
              onCursorChange={setCursor}
              onPick={handlePick}
            />

            <div className="flex items-center justify-between gap-3 mt-4 pt-3.5 border-t border-white/[0.07]">
              {presets ? (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { label: "Tonight", from: today, nights: 1 },
                    { label: "Weekend", from: nextFriday(today), nights: 2 },
                    { label: "3 nights", from: start || today, nights: 3 },
                    { label: "A week", from: start || today, nights: 7 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => applyPreset(p.from, p.nights)}
                      className="px-2.5 py-1 rounded-full border border-white/[0.09] bg-white/[0.02]
                                 font-data text-[9.5px] uppercase tracking-[0.12em] text-ivory-muted
                                 transition-all duration-300 hover:border-saffron/40 hover:text-saffron
                                 hover:bg-saffron/[0.06]"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              ) : <span />}

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="shrink-0 px-3.5 py-1.5 rounded-full bg-gradient-to-br from-saffron-bright to-saffron
                           font-data text-[9.5px] uppercase tracking-[0.14em] text-ink-950 font-bold
                           transition-transform duration-300 hover:scale-[1.04]"
              >
                Done
              </button>
            </div>
            </Motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default DateRangeField;
