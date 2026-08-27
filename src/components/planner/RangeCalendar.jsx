import React, { useMemo, useState, useRef, useEffect } from "react";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EASE } from "./plannerOptions";

/* ---------- date helpers (all local-time, no libraries) ---------- */

const iso = (d) => {
  const t = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return t.toISOString().slice(0, 10);
};
const parse = (s) => (s ? new Date(`${s}T00:00:00`) : null);
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const sameDay = (a, b) => a && b && iso(a) === iso(b);
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW = ["M", "T", "W", "T", "F", "S", "S"];

/** Days for a month grid, Monday-first, padded with nulls. */
function monthGrid(monthStart) {
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const first = new Date(year, month, 1);
  // getDay(): 0=Sun … 6=Sat → shift so Monday is column 0
  const lead = (first.getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  const cells = Array(lead).fill(null);
  for (let d = 1; d <= count; d += 1) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/* ---------- component ---------- */

/**
 * Two-month range calendar for the trip window.
 * Click once to set the start, again to set the end; clicking an earlier
 * date than the current start restarts the range from there.
 */
const RangeCalendar = ({ startDate, endDate, onChange, minDate }) => {
  const reduce = useReducedMotion();
  const today = useMemo(() => new Date(new Date().setHours(0, 0, 0, 0)), []);
  const min = parse(minDate) || today;

  const start = parse(startDate);
  const end = parse(endDate);

  const [cursor, setCursor] = useState(() => startOfMonth(start || today));
  const [hovered, setHovered] = useState(null);
  const [dir, setDir] = useState(0);
  const gridRef = useRef(null);

  // follow the selection when it moves to another month
  useEffect(() => {
    if (start) setCursor(startOfMonth(start));
  }, [startDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const move = (n) => {
    setDir(n);
    setCursor((c) => addMonths(c, n));
  };

  const pick = (day) => {
    if (!day) return;
    if (!start || (start && end)) {
      onChange(iso(day), "");
      return;
    }
    if (day < start) {
      onChange(iso(day), "");
      return;
    }
    onChange(iso(start), iso(day));
  };

  // the end of the range being previewed while hovering
  const previewEnd = !end && hovered && start && hovered > start ? hovered : end;

  const inRange = (day) => {
    if (!day || !start) return false;
    const last = previewEnd;
    if (!last) return false;
    return day > start && day < last;
  };

  const months = [cursor, addMonths(cursor, 1)];

  const dayClasses = (day) => {
    if (!day) return "";
    const disabled = day < min;
    const isStart = sameDay(day, start);
    const isEnd = sameDay(day, previewEnd);
    const between = inRange(day);
    const isToday = sameDay(day, today);

    if (disabled) return "text-ivory/15 cursor-not-allowed";
    if (isStart || isEnd)
      return "bg-gradient-to-br from-saffron-bright to-saffron text-ink-950 font-bold shadow-[0_4px_14px_rgba(212,168,67,0.35)]";
    if (between) return "bg-saffron/15 text-ivory";
    if (isToday) return "text-saffron border border-saffron/40";
    return "text-ivory/80 hover:bg-white/[0.07] hover:text-ivory";
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-ink-900/70 backdrop-blur-xl p-5">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={() => move(-1)}
          disabled={startOfMonth(cursor) <= startOfMonth(min)}
          aria-label="Previous month"
          className="w-9 h-9 rounded-full border border-white/[0.09] flex items-center justify-center text-ivory/70 hover:text-saffron hover:border-saffron/40 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex-1 flex items-center justify-center gap-2" aria-live="polite">
          <span className="route-line w-8 hidden sm:block" aria-hidden="true" />
          <span className="font-data text-[11px] uppercase tracking-[0.22em] text-ivory-muted whitespace-nowrap">
            {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
            <span className="hidden sm:inline">
              {" — "}
              {MONTHS[addMonths(cursor, 1).getMonth()]} {addMonths(cursor, 1).getFullYear()}
            </span>
          </span>
          <span className="route-line w-8 hidden sm:block" aria-hidden="true" />
        </div>

        <button
          type="button"
          onClick={() => move(1)}
          aria-label="Next month"
          className="w-9 h-9 rounded-full border border-white/[0.09] flex items-center justify-center text-ivory/70 hover:text-saffron hover:border-saffron/40 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Month grids */}
      <div className="overflow-hidden" ref={gridRef}>
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <Motion.div
            key={iso(cursor)}
            custom={dir}
            initial={reduce ? false : { opacity: 0, x: dir > 0 ? 28 : -28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: dir > 0 ? -28 : 28 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-7"
          >
            {months.map((m, mi) => (
              <div key={mi} className={mi === 1 ? "hidden sm:block" : ""}>
                <p className="sm:hidden font-data text-[10px] uppercase tracking-[0.2em] text-ivory-faint mb-3">
                  {MONTHS[m.getMonth()]} {m.getFullYear()}
                </p>
                <div className="grid grid-cols-7 gap-1 mb-2" aria-hidden="true">
                  {DOW.map((d, i) => (
                    <span
                      key={i}
                      className="h-7 flex items-center justify-center font-data text-[10px] uppercase text-ivory-faint"
                    >
                      {d}
                    </span>
                  ))}
                </div>
                <div
                  className="grid grid-cols-7 gap-1"
                  role="grid"
                  aria-label={`${MONTHS[m.getMonth()]} ${m.getFullYear()}`}
                >
                  {monthGrid(m).map((day, i) =>
                    day ? (
                      <button
                        key={i}
                        type="button"
                        role="gridcell"
                        disabled={day < min}
                        onClick={() => pick(day)}
                        onMouseEnter={() => setHovered(day)}
                        onMouseLeave={() => setHovered(null)}
                        aria-label={day.toDateString()}
                        aria-selected={sameDay(day, start) || sameDay(day, end)}
                        className={`h-9 rounded-lg font-data text-[12.5px] tabular-nums transition-all duration-200 ${dayClasses(day)}`}
                      >
                        {day.getDate()}
                      </button>
                    ) : (
                      <span key={i} className="h-9" />
                    )
                  )}
                </div>
              </div>
            ))}
          </Motion.div>
        </AnimatePresence>
      </div>

      {/* Helper line */}
      <p className="mt-5 pt-4 border-t border-white/[0.06] font-data text-[10px] uppercase tracking-[0.18em] text-ivory-faint">
        {!start
          ? "Pick your first day"
          : !end
            ? "Now pick the last day"
            : "Tap any date to start over"}
      </p>
    </div>
  );
};

export default RangeCalendar;
