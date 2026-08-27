import React, { useMemo, useState } from "react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { Wand2, X } from "lucide-react";
import { TRIP_TYPES, resolveDestination, getSeason, SEASONS } from "../../utils/checklistGenerator";
import { getIcon } from "./icons";
import DateField from "../ui/DateField";

const EMPTY = {
  name: "",
  destination: "",
  tripType: "general",
  startDate: "",
  days: 4,
  adults: 2,
  children: 0,
  hasFemaleTravellers: false,
};

/**
 * Trip creation / editing form. Validation messages say what to do next,
 * never just "invalid".
 */
const TripForm = ({ initial, mode = "create", onSubmit, onCancel }) => {
  const reduce = useReducedMotion();
  const [form, setForm] = useState({ ...EMPTY, ...(initial || {}) });
  const [errors, setErrors] = useState({});

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  /** Live read-back so the traveller can see what the engine understood. */
  const preview = useMemo(() => {
    if (!form.destination.trim()) return null;
    const profile = resolveDestination(form.destination);
    const month = form.startDate ? new Date(form.startDate).getMonth() : new Date().getMonth();
    const season = getSeason(month);
    return { profile, season: SEASONS[season]?.label || "Post-monsoon" };
  }, [form.destination, form.startDate]);

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Give the trip a name so you can find it later — “Ladakh in January”.";
    if (!form.destination.trim())
      next.destination = "Add a destination — a state or city is enough, like “Munnar, Kerala”.";
    const days = Number(form.days);
    if (!days || days < 1 || days > 60) next.days = "Duration must be between 1 and 60 days.";
    const adults = Number(form.adults);
    if (!adults || adults < 1) next.adults = "At least one adult has to travel.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      name: form.name.trim(),
      destination: form.destination.trim(),
      days: Number(form.days),
      adults: Number(form.adults),
      children: Number(form.children),
    });
  };

  const fieldError = (key) =>
    errors[key] ? (
      <p role="alert" className="mt-1.5 text-[12px] leading-snug text-saffron">
        {errors[key]}
      </p>
    ) : null;

  return (
    <Motion.form
      onSubmit={submit}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass-panel p-5 sm:p-6"
      noValidate
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <span className="eyebrow">{mode === "create" ? "New trip" : "Edit trip"}</span>
          <h2 className="mt-2 font-display text-2xl text-ivory">
            {mode === "create" ? (
              <>
                Tell us where, and we&apos;ll <em className="italic text-saffron">pack it for you</em>
              </>
            ) : (
              "Update trip details"
            )}
          </h2>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel"
            className="rounded-lg border border-white/[0.07] p-2 text-ivory-faint transition-colors hover:border-saffron/35 hover:text-ivory"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="form-label" htmlFor="trip-name">
            Trip name
          </label>
          <input
            id="trip-name"
            className="glass-input"
            placeholder="Winter run to Ladakh"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            aria-invalid={Boolean(errors.name)}
          />
          {fieldError("name")}
        </div>

        <div className="sm:col-span-2">
          <label className="form-label" htmlFor="trip-destination">
            Destination
          </label>
          <input
            id="trip-destination"
            className="glass-input"
            placeholder="Leh, Ladakh"
            value={form.destination}
            onChange={(e) => set("destination", e.target.value)}
            aria-invalid={Boolean(errors.destination)}
          />
          {fieldError("destination")}
          {preview && !errors.destination && (
            <p className="mt-2 font-data text-[11px] uppercase tracking-[0.16em] text-ivory-faint">
              Reads as <span className="text-saffron">{preview.profile.label}</span> · {preview.profile.region} ·{" "}
              {preview.season}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <span className="form-label">Trip type</span>
          <div className="flex flex-wrap gap-2">
            {TRIP_TYPES.map((t) => {
              const Icon = getIcon(t.icon);
              const active = form.tripType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => set("tripType", t.id)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] transition-colors duration-300 ${
                    active
                      ? "border-saffron/50 bg-saffron/15 text-saffron"
                      : "border-white/[0.07] bg-white/[0.02] text-ivory-muted hover:border-saffron/35 hover:text-ivory"
                  }`}
                >
                  <Icon size={14} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="form-label" htmlFor="trip-start">
            Departure date
          </label>
          <DateField
            id="trip-start"
            value={form.startDate}
            onChange={(v) => set("startDate", v)}
            placeholder="Pick a departure date"
          />
        </div>

        <div>
          <label className="form-label" htmlFor="trip-days">
            Duration (days)
          </label>
          <input
            id="trip-days"
            type="number"
            min="1"
            max="60"
            className="glass-input [color-scheme:dark]"
            value={form.days}
            onChange={(e) => set("days", e.target.value)}
            aria-invalid={Boolean(errors.days)}
          />
          {fieldError("days")}
        </div>

        <div>
          <label className="form-label" htmlFor="trip-adults">
            Adults
          </label>
          <input
            id="trip-adults"
            type="number"
            min="1"
            max="20"
            className="glass-input [color-scheme:dark]"
            value={form.adults}
            onChange={(e) => set("adults", e.target.value)}
            aria-invalid={Boolean(errors.adults)}
          />
          {fieldError("adults")}
        </div>

        <div>
          <label className="form-label" htmlFor="trip-children">
            Children
          </label>
          <input
            id="trip-children"
            type="number"
            min="0"
            max="20"
            className="glass-input [color-scheme:dark]"
            value={form.children}
            onChange={(e) => set("children", e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="trip-female"
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3"
          >
            <input
              id="trip-female"
              type="checkbox"
              checked={form.hasFemaleTravellers}
              onChange={(e) => set("hasFemaleTravellers", e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-white/20 bg-transparent text-saffron focus:ring-saffron/40"
            />
            <span>
              <span className="block text-sm text-ivory">Women travelling in this group</span>
              <span className="mt-0.5 block text-[12px] leading-relaxed text-ivory-faint">
                Adds sanitary supplies, a stole and a personal safety alarm — stock that remote stops rarely carry.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="submit" className="btn-primary">
          <Wand2 size={16} />
          {mode === "create" ? "Generate my checklist" : "Save & regenerate"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-ghost">
            Cancel
          </button>
        )}
      </div>
    </Motion.form>
  );
};

export default TripForm;
