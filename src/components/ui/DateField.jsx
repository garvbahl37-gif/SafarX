import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { CalendarDays, X } from "lucide-react";
import CalendarPanel from "./CalendarPanel";
import { toISO, parseISO, startOfDay, startOfMonth, useAnchoredPopover } from "./dateUtils";

/**
 * DateField — a premium replacement for `<input type="date">`.
 *
 * Renders a glass trigger showing a readable date and opens the shared
 * CalendarPanel in a portal, so it is never clipped by an overflow-hidden
 * parent. The value contract is an ISO `YYYY-MM-DD` string, as before.
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
  const today = useMemo(() => startOfDay(new Date()), []);
  const selected = parseISO(value);
  const minDate = parseISO(min);
  const maxDate = parseISO(max);

  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(() => startOfMonth(selected || minDate || today));
  const triggerRef = useRef(null);
  const popRef = useRef(null);

  const coords = useAnchoredPopover({
    open,
    onClose: () => setOpen(false),
    triggerRef,
    popRef,
    width: 348,
    height: 412,
  });

  // Keep the visible month in step with an externally-changed value
  useEffect(() => {
    if (selected) setCursor(startOfMonth(selected));
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const outOfRange = (d) => (minDate && d < minDate) || (maxDate && d > maxDate);

  const pick = (d) => {
    if (outOfRange(d)) return;
    onChange(toISO(d));
    setOpen(false);
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
        className={`w-full flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${
          open
            ? "border-saffron/55 bg-white/[0.07] shadow-[0_0_0_3px_rgba(212,168,67,0.09)]"
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

      {createPortal(
        <AnimatePresence>
          {open && coords && (
          <Motion.div
            ref={popRef}
            role="dialog"
            aria-label="Choose a date"
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
            <CalendarPanel
              mode="single"
              start={selected}
              minDate={minDate}
              maxDate={maxDate}
              months={1}
              cursor={cursor}
              onCursorChange={setCursor}
              onPick={pick}
            />

            <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-white/[0.07]">
              <button
                type="button"
                onClick={() => { onChange(""); setOpen(false); }}
                className="font-data text-[10px] uppercase tracking-[0.16em] text-ivory-faint hover:text-ivory transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => !outOfRange(today) && pick(today)}
                disabled={outOfRange(today)}
                className="font-data text-[10px] uppercase tracking-[0.16em] text-saffron hover:text-saffron-bright transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Today
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

export default DateField;
