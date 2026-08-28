import React, { useMemo, useState } from "react";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  MONTHS, DOW, addMonths, monthCells, isSame, startOfDay, toISO,
} from "./dateUtils";

/**
 * The calendar surface shared by DateField and DateRangeField.
 *
 * Renders one or two months of a Monday-first grid. In range mode the days
 * between the two ends carry a gold band, and hovering extends a preview of
 * that band so the length of the stay is visible before it is committed.
 */
const CalendarPanel = ({
  mode = "single",
  start = null,
  end = null,
  picking = "start",
  minDate = null,
  maxDate = null,
  months = 2,
  cursor,
  onCursorChange,
  onPick,
}) => {
  const reduce = useReducedMotion();
  const today = useMemo(() => startOfDay(new Date()), []);
  const [hover, setHover] = useState(null);
  const [dir, setDir] = useState(0);

  // While the second end is being chosen, the hovered day stands in for it.
  const previewEnd = mode === "range" && !end && picking === "end" && hover && start && hover > start
    ? hover
    : end;

  const isDisabled = (d) => (minDate && d < minDate) || (maxDate && d > maxDate);

  const move = (n) => {
    setDir(n);
    onCursorChange(addMonths(cursor, n));
  };

  const canGoBack = !minDate || cursor > addMonths(minDate, 0);

  const renderMonth = (monthStart, showLeftNav, showRightNav) => (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-3.5 h-8">
        <span className="w-8">
          {showLeftNav && (
            <button
              type="button"
              onClick={() => move(-1)}
              disabled={!canGoBack}
              aria-label="Previous month"
              className="w-8 h-8 rounded-full border border-white/[0.08] flex items-center justify-center
                         text-ivory/60 transition-all duration-300 hover:text-saffron hover:border-saffron/40
                         hover:bg-saffron/[0.06] disabled:opacity-25 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>
          )}
        </span>

        <span className="flex items-baseline gap-2" aria-live="polite">
          <span className="font-display text-[16px] text-ivory tracking-tight">
            {MONTHS[monthStart.getMonth()]}
          </span>
          <span className="font-data text-[11px] tabular-nums text-saffron/70">
            {monthStart.getFullYear()}
          </span>
        </span>

        <span className="w-8 flex justify-end">
          {showRightNav && (
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Next month"
              className="w-8 h-8 rounded-full border border-white/[0.08] flex items-center justify-center
                         text-ivory/60 transition-all duration-300 hover:text-saffron hover:border-saffron/40
                         hover:bg-saffron/[0.06]"
            >
              <ChevronRight size={14} />
            </button>
          )}
        </span>
      </div>

      <div className="grid grid-cols-7 mb-1" aria-hidden="true">
        {DOW.map((d) => (
          <span
            key={d}
            className="h-6 flex items-center justify-center font-data text-[9px] uppercase
                       tracking-[0.14em] text-ivory-faint"
          >
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7" role="grid">
        {monthCells(monthStart).map(({ date: d, outside }, i) => {
          const disabled = outside || isDisabled(d);
          const isStart = !outside && isSame(d, start);
          const isEnd = !outside && isSame(d, previewEnd);
          const isEdge = isStart || isEnd;
          const inBand = mode === "range" && start && previewEnd && d >= start && d <= previewEnd;
          const isToday = isSame(d, today);
          const weekend = i % 7 >= 5;

          return (
            <div
              key={toISO(d)}
              className={`relative h-9 flex items-center justify-center ${
                inBand ? "bg-saffron/[0.08]" : ""
              } ${inBand && (isStart || i % 7 === 0) ? "rounded-l-full" : ""} ${
                inBand && (isEnd || i % 7 === 6) ? "rounded-r-full" : ""
              }`}
            >
              {/* Neighbouring-month days hold the band open but are not pickable. */}
              {!outside && (
                <button
                  type="button"
                  role="gridcell"
                  disabled={disabled}
                  onClick={() => onPick(d)}
                  onMouseEnter={() => setHover(d)}
                  onMouseLeave={() => setHover(null)}
                  aria-selected={isEdge}
                  aria-label={d.toDateString()}
                  className={`relative w-9 h-9 rounded-full font-data text-[12.5px] tabular-nums
                              transition-all duration-200 ${
                    disabled
                      ? "text-ivory/[0.14] cursor-not-allowed"
                      : isEdge
                        ? "bg-gradient-to-br from-saffron-bright to-saffron text-ink-950 font-bold shadow-[0_6px_18px_rgba(212,168,67,0.4)] scale-105"
                        : weekend
                          ? "text-saffron/60 hover:bg-white/[0.08] hover:text-ivory"
                          : "text-ivory/85 hover:bg-white/[0.08] hover:text-ivory"
                  }`}
                >
                  {d.getDate()}
                  {isToday && !isEdge && (
                    <span
                      className="absolute left-1/2 -translate-x-1/2 bottom-1.5 w-1 h-1 rounded-full bg-saffron"
                      aria-hidden="true"
                    />
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Motion.div
        key={toISO(cursor)}
        initial={reduce ? false : { opacity: 0, x: dir > 0 ? 16 : -16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={reduce ? undefined : { opacity: 0, x: dir > 0 ? -16 : 16 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="flex gap-7"
        onMouseLeave={() => setHover(null)}
      >
        {renderMonth(cursor, true, months === 1)}
        {months === 2 && (
          <>
            <span className="w-px bg-gradient-to-b from-transparent via-white/[0.09] to-transparent" aria-hidden="true" />
            {renderMonth(addMonths(cursor, 1), false, true)}
          </>
        )}
      </Motion.div>
    </AnimatePresence>
  );
};

export default CalendarPanel;
