import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { takeIntent, onIntent } from "../services/srishtiIntent";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowLeft, ArrowRight, Sparkles, MapPin, CalendarDays, Heart,
  IndianRupee, ClipboardCheck, Users, Gauge, Wallet, PenLine, Info,
} from "lucide-react";

import { generateItinerary } from "../services/aiService";
import StepProgress from "./planner/StepProgress";
import DestinationPicker from "./planner/DestinationPicker";
import DateRangeField from "./planner/DateRangeField";
import ChoiceCards from "./planner/ChoiceCards";
import InterestChips from "./planner/InterestChips";
import BudgetSlider from "./planner/BudgetSlider";
import TravellerCounter from "./planner/TravellerCounter";
import TripSummaryRail from "./planner/TripSummaryRail";
import {
  PLANNER_STEPS, TRAVEL_PACES, TRAVEL_STYLES,
  EASE, formatINR, formatDate, dayCountBetween,
} from "./planner/plannerOptions";

/**
 * Guided, five-leg trip brief.
 *
 * The submitted payload is unchanged from the original single-page form:
 * { destination, startDate, endDate, startTime, endTime, pace, travelStyle,
 *   interests, travelingWithChildren, travelingWithSeniors, budget,
 *   specialRequests } — traveller counts are UI state only and are folded back
 * into the two booleans the Gemini prompt expects.
 */
/* The five legs, in the order the form walks them. Named the same way in
   `itinerary_step` so Srishti and the form mean one thing by "dates". */
const LEG_ORDER = ["destination", "dates", "interests", "budget", "review"];

const GeminiItineraryForm = ({ onItineraryGenerated, onLoadingChange, regenerateSignal = 0, brief = null }) => {
  const reduce = useReducedMotion();

  const [form, setForm] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    startTime: "09:00",
    endTime: "20:00",
    pace: "Moderate",
    travelStyle: "Mid Range",
    interests: [],
    travelingWithChildren: false,
    travelingWithSeniors: false,
    budget: "",
    specialRequests: "",
  });

  const [counts, setCounts] = useState({ adults: 2, children: 0, seniors: 0 });
  const [step, setStep] = useState(0);
  const [furthest, setFurthest] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showStepHint, setShowStepHint] = useState(false);

  const panelRef = useRef(null);
  const lastStep = PLANNER_STEPS.length - 1;

  const days = dayCountBetween(form.startDate, form.endDate);
  const travellers = counts.adults + counts.children + counts.seniors;

  /* ---------------- field helpers ---------------- */

  const setField = useCallback((name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleCountChange = useCallback((key, value) => {
    setCounts((prev) => {
      const next = { ...prev, [key]: value };
      setForm((f) => ({
        ...f,
        travelingWithChildren: next.children > 0,
        travelingWithSeniors: next.seniors > 0,
      }));
      return next;
    });
  }, []);

  const toggleInterest = useCallback((interestId) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter((i) => i !== interestId)
        : [...prev.interests, interestId],
    }));
  }, []);

  /* ---------------- step gating ---------------- */

  const stepIssue = useMemo(() => {
    if (step === 0 && !form.destination.trim()) {
      return "Pick a destination — search for any Indian state or city, or tap one of the cards.";
    }
    if (step === 1) {
      if (!form.startDate || !form.endDate) return "Choose both a start and an end date to continue.";
      if (new Date(form.startDate) > new Date(form.endDate)) {
        return "Your end date is before your start date — move it later to continue.";
      }
      if (form.startTime >= form.endTime) {
        return "The day has to end after it starts — adjust your active hours to continue.";
      }
    }
    return null;
  }, [step, form.destination, form.startDate, form.endDate, form.startTime, form.endTime]);

  const goToStep = useCallback((next) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
    setFurthest((f) => Math.max(f, next));
    setShowStepHint(false);
    if (panelRef.current) {
      const top = panelRef.current.getBoundingClientRect().top;
      if (top < 80 || top > window.innerHeight * 0.6) {
        window.scrollTo({
          top: panelRef.current.getBoundingClientRect().top + window.pageYOffset - 110,
          behavior: reduce ? "auto" : "smooth",
        });
      }
    }
  }, [step, reduce]);

  const handleNext = useCallback(() => {
    if (stepIssue) {
      setShowStepHint(true);
      return;
    }
    goToStep(Math.min(step + 1, lastStep));
  }, [stepIssue, goToStep, step, lastStep]);

  const handleBack = useCallback(() => goToStep(Math.max(step - 1, 0)), [goToStep, step]);

  /* ---------------- submit (payload unchanged) ---------------- */

  const submit = useCallback(async () => {
    const finalDest = form.destination;

    if (!finalDest) {
      toast.error("Choose a destination before generating an itinerary");
      goToStep(0);
      return;
    }
    if (!form.startDate || !form.endDate) {
      toast.error("Pick both a start and an end date for your trip");
      goToStep(1);
      return;
    }
    if (new Date(form.startDate) > new Date(form.endDate)) {
      toast.error("The end date is before the start date — swap them and try again");
      goToStep(1);
      return;
    }

    try {
      setLoading(true);
      onLoadingChange?.(true, { ...form, destination: finalDest });
      const itinerary = await generateItinerary({ ...form, destination: finalDest });
      onItineraryGenerated(itinerary, form);
    } catch (err) {
      console.error(err);
      toast.error("The itinerary couldn't be generated — check your connection and try again");
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  }, [form, onItineraryGenerated, onLoadingChange, goToStep]);

  const handleSubmit = (e) => {
    e.preventDefault();
    submit();
  };

  // Re-run the same brief when the page asks for a fresh draft.
  const submitRef = useRef(submit);
  submitRef.current = submit;
  // Track the signal VALUE, not a "first run" flag: StrictMode invokes effects
  // twice on mount, so a boolean guard gets consumed by the first pass and the
  // second pass fires a submit against an empty form.
  /* Srishti has taken the brief. She used to fill every field and drop the
     traveller on the last leg, which showed them a finished form they never
     saw being written — and gave them no moment to correct a date she had
     misheard. So the form walks the legs instead: it fills what she already
     knows, moves through those legs one at a time so each is seen, and stops
     at the first leg she has no answer for, which is the one she then asks
     about. `walkTo` is that stopping point. */
  const briefRan = useRef(null);
  const [walkTo, setWalkTo] = useState(null);

  useEffect(() => {
    if (!brief?.destination) return;
    const signature = JSON.stringify(brief);
    if (briefRan.current === signature) return;
    briefRan.current = signature;

    const filled = {
      destination: brief.destination,
      startDate: brief.startDate || "",
      endDate: brief.endDate || "",
      pace: brief.pace || "",
      budget: brief.budget || "",
      interests: brief.interests?.length ? brief.interests : [],
    };
    setForm((prev) => ({
      ...prev,
      destination: filled.destination,
      startDate: filled.startDate || prev.startDate,
      endDate: filled.endDate || prev.endDate,
      pace: filled.pace || prev.pace,
      budget: filled.budget || prev.budget,
      interests: filled.interests.length ? filled.interests : prev.interests,
    }));
    if (brief.adults) setCounts((prev) => ({ ...prev, adults: brief.adults }));

    if (!brief.walk) {
      setStep(lastStep);
      setFurthest(lastStep);
      return;
    }

    /* The first leg she cannot answer from what was said. Dates count only
       when both ends are known — half a date range is not an answer. */
    const answered = [
      Boolean(filled.destination),
      Boolean(filled.startDate && filled.endDate),
      filled.interests.length > 0,
      Boolean(filled.budget),
    ];
    let stop = answered.findIndex((ok) => !ok);
    if (stop === -1) stop = lastStep;

    setStep(0);
    setFurthest(0);
    setWalkTo(stop);
  }, [brief, lastStep]);

  /* One leg at a time, slowly enough to be read. Jumping straight to the
     stopping point would be the old behaviour with extra steps. */
  useEffect(() => {
    if (walkTo === null) return undefined;
    if (step >= walkTo) {
      setWalkTo(null);
      return undefined;
    }
    const timer = setTimeout(() => goToStep(step + 1), reduce ? 300 : 1500);
    return () => clearTimeout(timer);
  }, [walkTo, step, goToStep, reduce]);

  /* Each answer she collects lands on the form and moves it on. This is how
     the conversation and the page stay in step: she asks for one thing, the
     traveller says it, and they watch it be written down. */
  useEffect(() => {
    const apply = (intent) => {
      if (intent?.type !== "itinerary-step") return;
      const { leg, fill = {}, submit } = intent.payload || {};

      setForm((prev) => ({
        ...prev,
        ...(fill.destination ? { destination: fill.destination } : null),
        ...(fill.startDate ? { startDate: fill.startDate } : null),
        ...(fill.endDate ? { endDate: fill.endDate } : null),
        ...(fill.pace ? { pace: fill.pace } : null),
        ...(fill.budget ? { budget: fill.budget } : null),
        ...(fill.interests?.length ? { interests: fill.interests } : null),
      }));
      if (fill.adults) setCounts((prev) => ({ ...prev, adults: fill.adults }));

      const index = LEG_ORDER.indexOf(leg);
      if (index >= 0) goToStep(index);

      /* Submitting is deferred a beat so the fields above have rendered —
         otherwise the plan is written from the state as it was before her
         last answer landed. */
      if (submit) setTimeout(() => submitRef.current(), 350);
    };
    apply(takeIntent("itinerary-step"));
    return onIntent(apply);
  }, [goToStep]);

  const lastSignal = useRef(regenerateSignal);
  useEffect(() => {
    if (regenerateSignal === lastSignal.current) return;
    lastSignal.current = regenerateSignal;
    submitRef.current();
  }, [regenerateSignal]);

  // Enter advances instead of submitting a half-filled brief.
  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;
    // Buttons and textareas handle Enter themselves.
    if (["TEXTAREA", "BUTTON", "SELECT"].includes(e.target.tagName)) return;
    if (step !== lastStep) {
      e.preventDefault();
      handleNext();
    }
  };

  /* ---------------- summary completeness ---------------- */

  const filledCount = [
    Boolean(form.destination),
    Boolean(form.startDate && form.endDate),
    form.interests.length > 0,
    form.budget !== "",
    Boolean(form.specialRequests.trim()),
    travellers > 0,
  ].filter(Boolean).length;

  /* ---------------- step bodies ---------------- */

  const stepHeader = (Icon, title, lede) => (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-9 h-9 rounded-xl bg-saffron/10 border border-saffron/30 flex items-center justify-center">
          <Icon size={16} className="text-saffron" aria-hidden="true" />
        </span>
        <span className="eyebrow">{PLANNER_STEPS[step].coords}</span>
        <span className="route-line flex-1" aria-hidden="true" />
      </div>
      <h3 className="font-display text-3xl sm:text-4xl font-light text-ivory tracking-tight leading-[1.1]">
        {title}
      </h3>
      <p className="mt-3 text-ivory-muted text-sm sm:text-base leading-relaxed max-w-xl">{lede}</p>
    </div>
  );

  const steps = [
    /* 0 — Destination */
    <div key="destination">
      {stepHeader(MapPin, <>Where are you <em className="italic font-medium text-saffron-bright">headed</em>?</>,
        "Search all 36 states and union territories, or start from a route travellers love.")}
      <DestinationPicker
        value={form.destination}
        onChange={(value) => setField("destination", value)}
      />
    </div>,

    /* 1 — Dates & pace */
    <div key="dates">
      {stepHeader(CalendarDays, <>When, and at what <em className="italic font-medium text-saffron-bright">pace</em>?</>,
        "Your travel window sets the number of days; the pace decides how much gets packed into each one.")}
      <DateRangeField
        values={{
          startDate: form.startDate,
          endDate: form.endDate,
          startTime: form.startTime,
          endTime: form.endTime,
        }}
        onChange={setField}
      />
      <div className="mt-10 pt-8 border-t border-white/[0.07]">
        <p className="flex items-center gap-2.5 mb-5">
          <Gauge size={14} className="text-saffron" aria-hidden="true" />
          <span className="eyebrow-muted">Travel pace</span>
        </p>
        <ChoiceCards
          options={TRAVEL_PACES}
          value={form.pace}
          onChange={(v) => setField("pace", v)}
          label="Travel pace"
        />
      </div>
    </div>,

    /* 2 — Interests */
    <div key="interests">
      {stepHeader(Heart, <>What pulls you <em className="italic font-medium text-saffron-bright">out the door</em>?</>,
        "Pick as many as you like — SafarX weights the day plan towards them. Skip it and you'll get a balanced route.")}
      <InterestChips selected={form.interests} onToggle={toggleInterest} />
      <p className="mt-6 flex items-center gap-2.5 font-data text-[11px] uppercase tracking-[0.18em] text-ivory-faint">
        <span className="route-dot" aria-hidden="true" />
        {form.interests.length === 0 ? "None selected" : `${form.interests.length} selected`}
      </p>
    </div>,

    /* 3 — Budget & group */
    <div key="budget">
      {stepHeader(IndianRupee, <>What's the <em className="italic font-medium text-saffron-bright">budget</em>?</>,
        "A rough ceiling for the whole trip — stays, food, transport, and tickets. Every cost SafarX quotes is in ₹.")}
      <BudgetSlider
        value={form.budget}
        onChange={(v) => setField("budget", v)}
        days={days}
        travellers={travellers}
      />

      <div className="mt-10 pt-8 border-t border-white/[0.07]">
        <p className="flex items-center gap-2.5 mb-5">
          <Wallet size={14} className="text-saffron" aria-hidden="true" />
          <span className="eyebrow-muted">Travel style</span>
        </p>
        <ChoiceCards
          options={TRAVEL_STYLES}
          value={form.travelStyle}
          onChange={(v) => setField("travelStyle", v)}
          label="Travel style"
        />
      </div>

      <div className="mt-10 pt-8 border-t border-white/[0.07]">
        <p className="flex items-center gap-2.5 mb-5">
          <Users size={14} className="text-saffron" aria-hidden="true" />
          <span className="eyebrow-muted">Who's travelling</span>
        </p>
        <TravellerCounter counts={counts} onChange={handleCountChange} />
        <p className="mt-4 flex items-start gap-2.5 text-xs text-ivory-faint leading-relaxed">
          <Info size={13} className="text-saffron mt-0.5 shrink-0" aria-hidden="true" />
          Adding children or seniors tells SafarX to keep activities age-appropriate and step-free where it can.
        </p>
      </div>
    </div>,

    /* 4 — Review */
    <div key="review">
      {stepHeader(ClipboardCheck, <>Ready when <em className="italic font-medium text-saffron-bright">you are</em></>,
        "One last look at the brief. Tap any waypoint above to go back and change something.")}

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: "Destination", value: form.destination.replace(/, India$/, "") || "—", step: 0 },
          {
            label: "Dates",
            value: form.startDate && form.endDate
              ? `${formatDate(form.startDate)} → ${formatDate(form.endDate)} · ${days} ${days === 1 ? "day" : "days"}`
              : "—",
            step: 1,
          },
          { label: "Daily window", value: `${form.startTime} – ${form.endTime}`, step: 1 },
          { label: "Pace", value: form.pace, step: 1 },
          { label: "Travel style", value: form.travelStyle, step: 3 },
          { label: "Budget", value: form.budget === "" ? "Flexible" : formatINR(form.budget), step: 3 },
          {
            label: "Travellers",
            value: `${counts.adults} adults${counts.children ? ` · ${counts.children} children` : ""}${counts.seniors ? ` · ${counts.seniors} seniors` : ""}`,
            step: 3,
          },
          {
            label: "Interests",
            value: form.interests.length ? form.interests.join(" · ") : "Balanced route",
            step: 2,
          },
        ].map((row) => (
          <button
            key={row.label}
            type="button"
            onClick={() => goToStep(row.step)}
            className="text-left p-4 rounded-2xl bg-ink-800 border border-white/[0.07] hover:border-saffron/35 transition-colors group"
          >
            <dt className="font-data text-[10px] uppercase tracking-[0.18em] text-ivory-faint mb-1.5 flex items-center gap-2">
              {row.label}
              <PenLine size={11} className="text-saffron opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
            </dt>
            <dd className="text-ivory text-sm leading-snug">{row.value}</dd>
          </button>
        ))}
      </dl>

      <div className="mt-8">
        <label htmlFor="planner-requests" className="form-label">Anything else SafarX should know?</label>
        <textarea
          id="planner-requests"
          name="specialRequests"
          value={form.specialRequests}
          onChange={(e) => setField("specialRequests", e.target.value)}
          rows={3}
          placeholder="Jain or vegetarian meals, a wheelchair-friendly route, one must-see temple, no early mornings…"
          className="glass-input w-full resize-none"
        />
      </div>
    </div>,
  ];

  /* ---------------- render ---------------- */

  const variants = {
    enter: (dir) => (reduce ? { opacity: 0 } : { opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => (reduce ? { opacity: 0 } : { opacity: 0, x: dir > 0 ? -40 : 40 }),
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_21rem] gap-6 lg:gap-8 items-start">
      <form
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        ref={panelRef}
        className="glass-panel !rounded-3xl border border-white/[0.07] p-6 sm:p-9 lg:p-10"
        aria-label="Trip planner"
      >
        <StepProgress
          steps={PLANNER_STEPS}
          current={step}
          furthest={furthest}
          onJump={goToStep}
        />

        <div className="mt-9 pt-9 border-t border-white/[0.07]">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <Motion.div
              key={PLANNER_STEPS[step].id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: reduce ? 0.15 : 0.42, ease: EASE }}
            >
              {steps[step]}
            </Motion.div>
          </AnimatePresence>
        </div>

        {/* Gate hint */}
        <AnimatePresence initial={false}>
          {showStepHint && stepIssue && (
            <Motion.p
              role="alert"
              initial={reduce ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={reduce ? undefined : { opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="mt-8 flex items-start gap-2.5 rounded-xl border border-saffron/40 bg-saffron/10 p-3.5 text-sm text-ivory leading-relaxed"
            >
              <Info size={15} className="text-saffron mt-0.5 shrink-0" aria-hidden="true" />
              <span>{stepIssue}</span>
            </Motion.p>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-10 pt-8 border-t border-white/[0.07] flex flex-col-reverse sm:flex-row gap-3 sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 0}
            className="btn-ghost justify-center sm:justify-start disabled:opacity-35 disabled:cursor-not-allowed"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            Back
          </button>

          {step < lastStep ? (
            <button
              type="button"
              onClick={handleNext}
              aria-disabled={Boolean(stepIssue)}
              className={`btn-primary justify-center ${stepIssue ? "opacity-55" : ""}`}
            >
              Continue
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="btn-primary justify-center !py-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-ink-950/40 border-t-ink-950 rounded-full" aria-hidden="true" />
                  Drafting your itinerary…
                </>
              ) : (
                <>
                  <Sparkles size={16} aria-hidden="true" />
                  Generate itinerary
                </>
              )}
            </button>
          )}
        </div>
      </form>

      <TripSummaryRail
        destination={form.destination}
        startDate={form.startDate}
        endDate={form.endDate}
        days={days}
        counts={counts}
        budget={form.budget}
        interests={form.interests}
        pace={form.pace}
        travelStyle={form.travelStyle}
        filledCount={filledCount}
        totalFields={6}
      />
    </div>
  );
};

export default GeminiItineraryForm;
