import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Plane, TrainFront } from 'lucide-react';

/**
 * One journey, drawn as the line it is.
 *
 * The page is about a thing moving between two points, so the two points and
 * the line between them are the page — not a grid of cards with the same
 * facts written out as labels. SafarX already draws dashed routes as a motif;
 * here that motif carries the actual information, which is the only reason a
 * decoration deserves to stay in a design.
 *
 * Flights and trains share it deliberately. What differs is what can honestly
 * be claimed: RailRadar reports where a train actually is, while Aviation
 * Stack's free plan returns no aircraft positions at all, so a flight's marker
 * is worked out from the timetable. The strip says which it is showing rather
 * than letting a dot on a line imply a measurement.
 */

const pad = (n) => String(n).padStart(2, '0');

/** Local clock time, or a dash. Never a guess. */
const clock = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const lateness = (minutes) => {
  if (minutes == null) return null;
  if (minutes <= 0) return { text: 'On time', tone: 'text-horizon-bright' };
  if (minutes < 60) return { text: `${minutes} min late`, tone: 'text-saffron-bright' };
  const h = Math.floor(minutes / 60);
  return { text: `${h}h ${minutes % 60}m late`, tone: 'text-danger-bright' };
};

const JourneyStrip = ({
  mode = 'flight',
  code, operator, statusLabel, statusTone = 'text-ivory-muted',
  from, to, progress = null, progressNote = null, delayMinutes = null,
  continuous = false,
}) => {
  const reduce = useReducedMotion();
  const Icon = mode === 'train' ? TrainFront : Plane;
  const late = lateness(delayMinutes);
  /* Kept off the very ends so the marker never sits on top of a station. */
  const at = progress == null ? null : Math.min(0.94, Math.max(0.06, progress));

  return (
    <div className="rounded-[26px] border border-white/[0.08] bg-ink-900/70 p-6 sm:p-8 backdrop-blur-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <div className="flex items-baseline gap-3">
          <span className="font-data text-[1.6rem] tracking-[0.04em] text-ivory">{code}</span>
          {operator && (
            <span className="font-sans text-[13.5px] text-ivory-muted">{operator}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {late && <span className={`font-sans text-[13px] ${late.tone}`}>{late.text}</span>}
          <span className={`font-sans text-[13px] ${statusTone}`}>{statusLabel}</span>
        </div>
      </div>

      {/* ── The line ───────────────────────────────────────────────────── */}
      <div className="mt-7 flex items-center gap-3 sm:gap-5">
        <End code={from.code} name={from.name} align="left" />

        <div className="relative flex-1 pt-1">
          <span className="route-line block w-full" aria-hidden="true" />
          {/* The part of the line already travelled, so progress reads at a
              glance rather than only from where the marker happens to sit. */}
          {at != null && (
            <motion.span
              initial={reduce ? false : { width: 0 }}
              animate={{ width: `${at * 100}%` }}
              transition={{
                duration: reduce ? 0 : continuous ? 1.05 : 1.1,
                ease: continuous ? 'linear' : [0.22, 1, 0.36, 1],
              }}
              className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-saffron/60"
              aria-hidden="true"
            />
          )}

          {at != null && (
            <motion.span
              initial={reduce ? false : { left: '6%', opacity: 0 }}
              animate={{ left: `${at * 100}%`, opacity: 1 }}
              /* Between halts the position is recomputed every second, so the
                 marker eases linearly across each of those steps and reads as
                 a slow crawl instead of a heartbeat. Arriving somewhere new
                 still gets the softer curve. */
              transition={{
                duration: reduce ? 0 : continuous ? 1.05 : 1.1,
                ease: continuous ? 'linear' : [0.22, 1, 0.36, 1],
              }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
              aria-hidden="true"
            >
              <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-saffron text-ink-950 shadow-[0_0_0_5px_rgba(6,20,18,0.9)]">
                {continuous && !reduce && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-saffron opacity-60" />
                )}
                <Icon size={14} className={`relative ${mode === 'flight' ? 'rotate-90' : ''}`} />
              </span>
            </motion.span>
          )}
        </div>

        <End code={to.code} name={to.name} align="right" />
      </div>

      {/* ── Times under each end, where a boarding pass puts them ──────── */}
      <div className="mt-5 flex items-start justify-between gap-4">
        <TimeBlock
          align="left"
          scheduled={from.scheduled}
          actual={from.actual || from.estimated}
          detail={[from.terminal && `Terminal ${from.terminal}`, from.gate && `Gate ${from.gate}`]
            .filter(Boolean).join(' · ')}
        />
        {progressNote && (
          <p className="max-w-[46%] pt-1 text-center font-sans text-[12px] leading-relaxed text-ivory-faint">
            {progressNote}
          </p>
        )}
        <TimeBlock
          align="right"
          scheduled={to.scheduled}
          actual={to.actual || to.estimated}
          detail={[to.terminal && `Terminal ${to.terminal}`, to.baggage && `Belt ${to.baggage}`]
            .filter(Boolean).join(' · ')}
        />
      </div>
    </div>
  );
};

const End = ({ code, name, align }) => (
  <div className={`min-w-0 ${align === 'right' ? 'text-right' : ''}`}>
    <p className="font-data text-[1.75rem] leading-none tracking-[0.06em] text-ivory">{code || '—'}</p>
    <p className="mt-1.5 max-w-[9rem] truncate font-sans text-[12.5px] text-ivory-faint">{name || ''}</p>
  </div>
);

/* Scheduled stays visible when it has been overtaken, struck through, because
   "was 06:15, now 06:39" is the useful sentence — not just "06:39". */
const TimeBlock = ({ scheduled, actual, detail, align }) => {
  const moved = actual && scheduled && clock(actual) !== clock(scheduled);
  return (
    <div className={align === 'right' ? 'text-right' : ''}>
      <p className="flex items-baseline gap-2 font-data text-[15px] text-ivory"
         style={align === 'right' ? { justifyContent: 'flex-end' } : undefined}>
        {moved && (
          <span className="text-[12.5px] text-ivory-faint line-through">{clock(scheduled)}</span>
        )}
        <span className={moved ? 'text-saffron-bright' : ''}>{clock(actual || scheduled)}</span>
      </p>
      {detail && <p className="mt-1 font-sans text-[12px] text-ivory-faint">{detail}</p>}
    </div>
  );
};

export default JourneyStrip;
