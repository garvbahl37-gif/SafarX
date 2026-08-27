import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";

/* ---------- date helpers (local time, no libraries) ---------- */

const toISO = (d) => {
  const t = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return t.toISOString().slice(0, 10);
};
const parseISO = (s) => {
  if (!s) return null;
  const d = new Date(`${s}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
};
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const isSame = (a, b) => a && b && toISO(a) === toISO(b);

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function monthCells(monthStart) {
  const y = monthStart.getFullYear();
  const m = monthStart.getMonth();
  const lead = (new Date(y, m, 1).getDay() + 6) % 7; // Monday-first
  const total = new Date(y, m + 1, 0).getDate();
  const cells = Array(lead).fill(null);
  for (let d = 1; d <= total; d += 1) cells.push(new Date(y, m, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/**
 * DateField — a premium replacement for `<input type="date">`.
 *
 * Renders a glass trigger showing a readable date, and opens a themed
 * calendar in a portal so it is never clipped by an overflow-hidden parent.
 * Falls back cleanly: the value contract is still an ISO `YYYY-MM-DD` string.
 */
const DateField = ({
  id,
  value,
  onChange,
  min,
  max,
  label,
  placeholder = "Select a date",
  className = "",
  disabled = false,
}) => {
  const reduce = useReducedMotion();
  const today = useMemo(() => new Date(new Date().setHours(0, 0, 0, 0)), []);
  const selected = parseISO(value);
  const minDate = parseISO(min);
  const maxDate = parseISO(max);

  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(() => startOfMonth(selected || minDate || today));
  const [coords, setCoords] = useState(null);
  const [dir, setDir] = useState(0);
  const triggerRef = useRef(null);
  const popRef = useRef(null);

  // Keep the visible month in step with an externally-changed value
  useEffect(() => {
    if (selected) setCursor(startOfMonth(selected));
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  // Position the portal under the trigger, flipping up when short on room
  const place = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const H = 380;
    const below = window.innerHeight - r.bottom;
    setCoords({
      left: Math.min(Math.max(r.left, 12), window.innerWidth - 336),
      top: below < H && r.top > H ? r.top - H - 8 : r.bottom + 8,
      width: r.width,
    });
  };

  useEffect(() => {
    if (!open) return undefined;
    place();
    const onScroll = () => place();
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onClick = (e) => {
      if (
        popRef.current && !popRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) setOpen(false);
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const disabledDay = (d) =>
    (minDate && d < minDate) || (maxDate && d > maxDate);

  const pick = (d) => {
    if (disabledDay(d)) return;
    onChange(toISO(d));
    setOpen(false);
  };

  const move = (n) => {
    setDir(n);
    setCursor((c) => addMonths(c, n));
  };

  const pretty = selected
    ? selected.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "";

  return (
    <>
      {label && (
        <label htmlFor={id} className="form-label flex items-center gap-2">
          <CalendarDays size={13} className="text-saffron" aria-hidden="true" />
          {label}
        </label>
      )}

      <button
        id={id}
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`w-full flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${
          open
            ? "border-saffron/55 bg-white/[0.07]"
            : selected
              ? "border-saffron/30 bg-white/[0.04] hover:border-saffron/45"
              : "border-white/[0.09] bg-white/[0.03] hover:border-white/25"
        } ${className}`}
      >
        <span className={`font-data text-[14px] tabular-nums ${selected ? "text-ivory" : "text-ivory-faint"}`}>
          {pretty || placeholder}
        </span>
        <span className="flex items-center gap-2 shrink-0">
          {selected && !disabled && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear date"
              onClick={(e) => { e.stopPropagation(); onChange(""); }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); e.preventDefault(); onChange(""); }
              }}
              className="text-ivory-faint hover:text-saffron transition-colors"
            >
              <X size={13} />
            </span>
          )}
          <CalendarDays size={15} className={open || selected ? "text-saffron" : "text-ivory-faint"} aria-hidden="true" />
        </span>
      </button>

      {open && coords && createPortal(
        <AnimatePresence>
          <Motion.div
            ref={popRef}
            role="dialog"
            aria-label="Choose a date"
            initial={reduce ? false : { opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "fixed", left: coords.left, top: coords.top, width: 324, zIndex: 9999 }}
            className="rounded-2xl border border-white/[0.1] bg-ink-900/97 backdrop-blur-2xl shadow-[0_28px_70px_rgba(0,0,0,0.7)] p-4"
          >
            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button" onClick={() => move(-1)} aria-label="Previous month"
                className="w-8 h-8 rounded-full border border-white/[0.09] flex items-center justify-center text-ivory/70 hover:text-saffron hover:border-saffron/40 transition-colors"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="font-data text-[11px] uppercase tracking-[0.2em] text-ivory-muted" aria-live="polite">
                {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
              </span>
              <button
                type="button" onClick={() => move(1)} aria-label="Next month"
                className="w-8 h-8 rounded-full border border-white/[0.09] flex items-center justify-center text-ivory/70 hover:text-saffron hover:border-saffron/40 transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1.5" aria-hidden="true">
              {DOW.map((d) => (
                <span key={d} className="h-7 flex items-center justify-center font-data text-[9.5px] uppercase text-ivory-faint">
                  {d}
                </span>
              ))}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <Motion.div
                key={toISO(cursor)}
                initial={reduce ? false : { opacity: 0, x: dir > 0 ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? undefined : { opacity: 0, x: dir > 0 ? -20 : 20 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-7 gap-1"
                role="grid"
              >
                {monthCells(cursor).map((d, i) =>
                  d ? (
                    <button
                      key={i}
                      type="button"
                      role="gridcell"
                      disabled={disabledDay(d)}
                      onClick={() => pick(d)}
                      aria-selected={isSame(d, selected)}
                      aria-label={d.toDateString()}
                      className={`h-9 rounded-lg font-data text-[12.5px] tabular-nums transition-all duration-200 ${
                        disabledDay(d)
                          ? "text-ivory/15 cursor-not-allowed"
                          : isSame(d, selected)
                            ? "bg-gradient-to-br from-saffron-bright to-saffron text-ink-950 font-bold shadow-[0_4px_14px_rgba(212,168,67,0.35)]"
                            : isSame(d, today)
                              ? "text-saffron border border-saffron/40 hover:bg-white/[0.07]"
                              : "text-ivory/80 hover:bg-white/[0.07] hover:text-ivory"
                      }`}
                    >
                      {d.getDate()}
                    </button>
                  ) : (
                    <span key={i} className="h-9" />
                  )
                )}
              </Motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.07]">
              <button
                type="button"
                onClick={() => { onChange(""); setOpen(false); }}
                className="font-data text-[10px] uppercase tracking-[0.18em] text-ivory-faint hover:text-ivory transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => !disabledDay(today) && pick(today)}
                disabled={disabledDay(today)}
                className="font-data text-[10px] uppercase tracking-[0.18em] text-saffron hover:text-saffron-bright transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Today
              </button>
            </div>
          </Motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default DateField;
