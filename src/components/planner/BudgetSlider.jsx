import React from "react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { IndianRupee, Infinity as InfinityIcon } from "lucide-react";
import {
  BUDGET_MIN, BUDGET_MAX, BUDGET_STEP, BUDGET_PRESETS, formatINR, EASE,
} from "./plannerOptions";

/**
 * Budget slider in ₹ with a live total, a per-day breakdown hint, and a
 * "keep it flexible" escape hatch (which sends an empty budget, exactly as
 * the old empty number field did).
 */
const BudgetSlider = ({ value, onChange, days = 0, travellers = 1 }) => {
  const reduce = useReducedMotion();
  const flexible = value === "" || value === null || value === undefined;
  const amount = flexible ? 40000 : Number(value);
  const pct = ((amount - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100;

  const perDay = days > 0 ? amount / days : 0;
  const perPersonPerDay = days > 0 && travellers > 0 ? amount / days / travellers : 0;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="eyebrow-muted mb-2">Total trip budget</p>
          <Motion.p
            key={flexible ? "flex" : amount}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="font-data text-4xl sm:text-5xl font-medium text-saffron tabular-nums leading-none"
          >
            {flexible ? "Flexible" : formatINR(amount)}
          </Motion.p>
        </div>

        <button
          type="button"
          onClick={() => onChange(flexible ? String(amount) : "")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full border font-data text-[10px] uppercase tracking-[0.18em] transition-colors ${
            flexible
              ? "bg-saffron/12 border-saffron/50 text-saffron"
              : "bg-white/[0.05] border-white/[0.1] text-ivory-muted hover:border-saffron/35 hover:text-ivory"
          }`}
        >
          {flexible ? <IndianRupee size={13} aria-hidden="true" /> : <InfinityIcon size={13} aria-hidden="true" />}
          {flexible ? "Set an amount" : "Keep it flexible"}
        </button>
      </div>

      <label htmlFor="planner-budget" className="sr-only">Total trip budget in rupees</label>
      <div className="relative">
        <input
          id="planner-budget"
          type="range"
          min={BUDGET_MIN}
          max={BUDGET_MAX}
          step={BUDGET_STEP}
          value={amount}
          disabled={flexible}
          onChange={(e) => onChange(e.target.value)}
          aria-valuetext={flexible ? "Flexible budget" : formatINR(amount)}
          className="w-full h-1.5 appearance-none rounded-full cursor-pointer accent-saffron disabled:opacity-40 disabled:cursor-not-allowed
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-saffron
            [&::-webkit-slider-thumb]:shadow-[0_0_14px_rgba(212,168,67,0.65)] [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-ink-950 [&::-webkit-slider-thumb]:cursor-grab
            [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-saffron [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-ink-950"
          style={{
            background: flexible
              ? "rgba(242,239,230,0.08)"
              : `linear-gradient(90deg, #D4A843 0%, #D4A843 ${pct}%, rgba(242,239,230,0.08) ${pct}%, rgba(242,239,230,0.08) 100%)`,
          }}
        />
      </div>

      <div className="mt-2.5 flex justify-between font-data text-[10px] uppercase tracking-[0.16em] text-ivory-faint">
        <span>{formatINR(BUDGET_MIN)}</span>
        <span>{formatINR(BUDGET_MAX)}+</span>
      </div>

      {/* Presets */}
      <div className="mt-6 flex flex-wrap gap-2">
        {BUDGET_PRESETS.map((preset) => {
          const active = !flexible && Number(value) === preset;
          return (
            <button
              key={preset}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(String(preset))}
              className={`px-4 py-2 rounded-full border font-data text-xs tabular-nums transition-colors ${
                active
                  ? "bg-saffron/12 border-saffron/50 text-saffron"
                  : "bg-white/[0.04] border-white/[0.08] text-ivory-muted hover:border-saffron/35 hover:text-ivory"
              }`}
            >
              {formatINR(preset)}
            </button>
          );
        })}
      </div>

      {/* Per-day hint */}
      <div className="mt-6 rounded-2xl border border-white/[0.07] bg-ink-800 p-5">
        {flexible ? (
          <p className="text-sm text-ivory-muted leading-relaxed">
            No ceiling set — SafarX will price the trip against your travel style instead and still show a ₹ estimate for every day.
          </p>
        ) : days > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-data text-[10px] uppercase tracking-[0.18em] text-ivory-faint mb-1.5">Per day</p>
              <p className="font-data text-xl text-ivory tabular-nums">{formatINR(perDay)}</p>
            </div>
            <div>
              <p className="font-data text-[10px] uppercase tracking-[0.18em] text-ivory-faint mb-1.5">
                Per traveller / day
              </p>
              <p className="font-data text-xl text-ivory tabular-nums">{formatINR(perPersonPerDay)}</p>
            </div>
            <p className="col-span-2 text-sm text-ivory-faint leading-relaxed">
              Across {days} {days === 1 ? "day" : "days"} for {travellers} {travellers === 1 ? "traveller" : "travellers"} — stays, food, transport, and tickets.
            </p>
          </div>
        ) : (
          <p className="text-sm text-ivory-muted leading-relaxed">
            Pick your dates and this splits into a per-day figure.
          </p>
        )}
      </div>
    </div>
  );
};

export default BudgetSlider;
