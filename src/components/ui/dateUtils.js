import { useCallback, useEffect, useRef, useState } from "react";

/* ---------- date helpers (local time, no libraries) ---------- */

export const toISO = (d) => {
  const t = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return t.toISOString().slice(0, 10);
};

export const parseISO = (s) => {
  if (!s) return null;
  const d = new Date(`${s}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
export const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const isSame = (a, b) => Boolean(a && b) && toISO(a) === toISO(b);
export const nightsBetween = (a, b) =>
  a && b ? Math.round((startOfDay(b) - startOfDay(a)) / 86400000) : 0;

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
export const DOW = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

/**
 * Monday-first grid, padded to whole weeks so every month is the same shape.
 * Padding cells carry their real neighbouring-month date rather than null, so
 * a selected range can draw its band continuously across a week that straddles
 * two months instead of stopping dead at the edge of the grid.
 */
export const monthCells = (monthStart) => {
  const y = monthStart.getFullYear();
  const m = monthStart.getMonth();
  const lead = (new Date(y, m, 1).getDay() + 6) % 7;
  const total = new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let i = lead; i > 0; i -= 1) cells.push({ date: new Date(y, m, 1 - i), outside: true });
  for (let d = 1; d <= total; d += 1) cells.push({ date: new Date(y, m, d), outside: false });
  for (let d = total + 1; cells.length % 7 !== 0; d += 1) {
    cells.push({ date: new Date(y, m, d), outside: true });
  }
  return cells;
};

export const prettyDate = (d, opts) =>
  d ? d.toLocaleDateString("en-IN", opts ?? { day: "numeric", month: "short" }) : "";

export const weekdayOf = (d) =>
  d ? d.toLocaleDateString("en-IN", { weekday: "long" }) : "";

/**
 * Anchors a portalled popover to a trigger element, flipping above when there
 * is not enough room below and clamping to the viewport on small screens.
 * Returns coords plus the wiring the popover needs to dismiss itself.
 */
export const useAnchoredPopover = ({ open, onClose, triggerRef, popRef, width, height }) => {
  const [coords, setCoords] = useState(null);

  // Callers pass a fresh arrow function every render; holding it in a ref keeps
  // it out of the effect's dependencies, which would otherwise re-run — and
  // re-measure, and re-render — on every single render.
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  const place = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const w = Math.min(width, window.innerWidth - 24);
    const below = window.innerHeight - r.bottom;
    const flip = below < height && r.top > below;
    const next = {
      width: w,
      left: Math.min(Math.max(r.left, 12), Math.max(12, window.innerWidth - w - 12)),
      top: flip ? Math.max(12, r.top - height - 10) : r.bottom + 10,
      origin: flip ? "bottom" : "top",
    };
    // Only re-render when the position actually moved.
    setCoords((prev) =>
      prev && prev.width === next.width && prev.left === next.left &&
      prev.top === next.top && prev.origin === next.origin
        ? prev
        : next
    );
  }, [triggerRef, width, height]);

  useEffect(() => {
    if (!open) return undefined;
    place();
    const onScroll = () => place();
    const onKey = (e) => e.key === "Escape" && closeRef.current();
    const onDown = (e) => {
      if (
        popRef.current && !popRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) closeRef.current();
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open, place, popRef, triggerRef]);

  return coords;
};
