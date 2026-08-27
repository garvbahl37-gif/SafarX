import React from "react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { PackageCheck, AlertTriangle, Scale, CalendarClock, ShieldCheck } from "lucide-react";
import { formatWeight, daysUntil } from "../../utils/checklistGenerator";

const RING = 54;
const CIRCUMFERENCE = 2 * Math.PI * RING;

/** Countdown copy that reads like a person wrote it. */
function countdownCopy(startDate) {
  const d = daysUntil(startDate);
  if (d === null) return { value: "—", label: "No date set" };
  if (d > 1) return { value: String(d), label: d === 1 ? "day to go" : "days to go" };
  if (d === 1) return { value: "1", label: "day to go" };
  if (d === 0) return { value: "0", label: "departing today" };
  return { value: String(Math.abs(d)), label: "days since departure" };
}

const StatTile = ({ icon: Icon, value, label, hint, accent = false }) => (
  <div
    className={`rounded-xl border px-3 py-3 ${
      accent ? "border-saffron/30 bg-saffron/[0.07]" : "border-white/[0.07] bg-white/[0.02]"
    }`}
  >
    <div className="flex items-center gap-1.5 text-ivory-faint">
      <Icon size={13} className={accent ? "text-saffron" : ""} />
      <span className="font-data text-[10px] uppercase tracking-[0.18em]">{label}</span>
    </div>
    <p className={`mt-1.5 font-data text-xl ${accent ? "text-saffron" : "text-ivory"}`}>{value}</p>
    {hint && <p className="mt-0.5 text-[11px] leading-snug text-ivory-faint">{hint}</p>}
  </div>
);

/**
 * Trip readiness at a glance: overall packed %, a separate critical-items
 * gate, estimated pack weight, and the departure countdown.
 */
const ReadinessPanel = ({ trip, stats }) => {
  const reduce = useReducedMotion();
  const countdown = countdownCopy(trip.startDate);
  const criticalLeft = stats.criticalTotal - stats.criticalPacked;

  return (
    <section className="glass-panel p-5 sm:p-6" aria-label="Trip readiness">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        {/* ---- ring ---- */}
        <div className="relative mx-auto h-32 w-32 shrink-0 sm:mx-0">
          <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90" aria-hidden="true">
            <circle cx="64" cy="64" r={RING} fill="none" stroke="rgba(242,239,230,0.08)" strokeWidth="8" />
            <Motion.circle
              cx="64"
              cy="64"
              r={RING}
              fill="none"
              stroke="url(#readinessGrad)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              initial={reduce ? false : { strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - stats.percent / 100) }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
            <defs>
              <linearGradient id="readinessGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#E5BE5C" />
                <stop offset="100%" stopColor="#D4A843" />
              </linearGradient>
            </defs>
          </svg>
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            role="progressbar"
            aria-valuenow={stats.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Overall packing progress"
          >
            <span className="font-data text-3xl text-ivory">{stats.percent}%</span>
            <span className="font-data text-[10px] uppercase tracking-[0.2em] text-ivory-faint">packed</span>
          </div>
        </div>

        {/* ---- stats ---- */}
        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            <StatTile
              icon={PackageCheck}
              value={`${stats.packed}/${stats.total}`}
              label="Items"
              hint={stats.remaining ? `${stats.remaining} to go` : "All done"}
            />
            <StatTile
              icon={ShieldCheck}
              value={`${stats.criticalPacked}/${stats.criticalTotal}`}
              label="Critical"
              hint={criticalLeft > 0 ? `${criticalLeft} must-haves left` : "Locked in"}
              accent={criticalLeft > 0}
            />
            <StatTile
              icon={Scale}
              value={formatWeight(stats.totalWeight)}
              label="Est. weight"
              hint={`${formatWeight(stats.packedWeight)} in the bag`}
            />
            <StatTile icon={CalendarClock} value={countdown.value} label="Countdown" hint={countdown.label} />
          </div>

          {/* ---- readiness banner ---- */}
          <Motion.div
            key={stats.criticalReady ? "ready" : "not-ready"}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={`mt-3 flex items-start gap-3 rounded-xl border px-4 py-3 ${
              stats.criticalReady
                ? "border-saffron/40 bg-gradient-to-r from-saffron/15 to-transparent"
                : "border-white/[0.07] bg-white/[0.02]"
            }`}
          >
            {stats.criticalReady ? (
              <PackageCheck size={18} className="mt-0.5 shrink-0 text-saffron" />
            ) : (
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-ivory-faint" />
            )}
            <div>
              <p className={`font-display text-base ${stats.criticalReady ? "text-ivory" : "text-ivory-muted"}`}>
                {stats.criticalReady ? (
                  <>
                    You&apos;re <em className="italic text-saffron">ready to travel</em>
                  </>
                ) : stats.criticalTotal === 0 ? (
                  "No critical items flagged yet"
                ) : (
                  `${criticalLeft} critical item${criticalLeft === 1 ? "" : "s"} still unpacked`
                )}
              </p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-ivory-faint">
                {stats.criticalReady
                  ? stats.allReady
                    ? "Every item on this list is in the bag. Have a good safar."
                    : "Every must-have is packed. The rest is comfort — you can leave without it."
                  : stats.criticalTotal === 0
                    ? "Mark the things you cannot travel without as CRIT to track them here."
                    : "These are the things you cannot buy at the destination. Clear them first."}
              </p>
            </div>
          </Motion.div>
        </div>
      </div>
    </section>
  );
};

export default ReadinessPanel;
