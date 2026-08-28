import React, { useCallback, useRef, useState } from "react";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowDown, Sparkles, Compass, Route, IndianRupee } from "lucide-react";

import GeminiItineraryForm from "../components/GeminiItineraryForm";
import GeminiItineraryDisplay from "../components/GeminiItineraryDisplay";
import SimpleMarkdownDisplay from "../components/SimpleMarkdownDisplay";
import GeneratingRoute from "../components/planner/GeneratingRoute";
import { EASE } from "../components/planner/plannerOptions";
import JourneyStrip from "../components/planner/JourneyStrip";

const ASSURANCES = [
  { icon: Route, title: "Hour by hour", copy: "Every day laid out with timings, travel legs, and how long each stop takes." },
  { icon: IndianRupee, title: "Priced in ₹", copy: "Tickets, food, and transport costed per activity, per day, and per trip." },
  { icon: Compass, title: "Season aware", copy: "SafarX checks the month against the region before it commits to a route." },
];

const ItineraryPlanner = ({ selectedItem }) => {
  const reduce = useReducedMotion();

  const [itinerary, setItinerary] = useState(null);
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState(null);
  const [regenerateSignal, setRegenerateSignal] = useState(0);
  const [formKey, setFormKey] = useState(0);

  const resultsRef = useRef(null);
  const formRef = useRef(null);

  const busy = isLoading || isGenerating;
  const showResult = Boolean(itinerary && formData && !busy);
  const showForm = !itinerary && !busy;

  const handleLoadingChange = useCallback((loading, snapshot) => {
    setIsGenerating(loading);
    if (loading && snapshot) setDraft(snapshot);
  }, []);

  const handleItineraryGenerated = (result, form) => {
    setIsLoading(true);
    setTimeout(() => {
      setItinerary(result);
      setFormData(form);
      setIsLoading(false);

      // Auto-scroll to top of results
      setTimeout(() => {
        if (resultsRef.current) {
          const yOffset = -100; // Offset for header/padding
          const y = resultsRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    }, 500);
  };

  /** Back to the brief with every answer preserved. */
  const handleTweak = useCallback(() => {
    setItinerary(null);
    setFormData(null);
    requestAnimationFrame(() => {
      if (!formRef.current) return;
      window.scrollTo({
        top: formRef.current.getBoundingClientRect().top + window.pageYOffset - 110,
        behavior: reduce ? "auto" : "smooth",
      });
    });
  }, [reduce]);

  /** Same brief, fresh draft — the mounted form re-submits itself. */
  const handleRegenerate = useCallback(() => {
    setRegenerateSignal((n) => n + 1);
  }, []);

  /** Empty the brief and start again. */
  const handleNewItinerary = useCallback(() => {
    setItinerary(null);
    setFormData(null);
    setDraft(null);
    setFormKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, [reduce]);

  // Check for incoming AI-generated itinerary data from selectedItem prop
  React.useEffect(() => {
    // Prop handling logic
  }, []);

  React.useEffect(() => {
    if (selectedItem && selectedItem.generatedItinerary) {
      setItinerary(selectedItem.generatedItinerary);
      setFormData({
        startDate: "Flexible",
        endDate: "Flexible",
        startTime: "Morning",
        endTime: "Evening"
      });
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      }, 500);
    }
  }, [selectedItem]);

  return (
    <div className="min-h-screen bg-ink-950">

      {/* ======================= HERO ======================= */}
      <section
        className="relative min-h-[64vh] md:min-h-[68vh] overflow-hidden flex items-center justify-center"
        aria-label="AI trip planner"
      >
        {/* Video backdrop */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1600&auto=format&fit=crop&q=70"
            className="w-full h-full object-cover"
          >
            <source src="https://videos.pexels.com/video-files/35000186/14827904_2560_1440_30fps.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-ink-950/30" />
          {/* Pool of shade behind the centred copy */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_50%,rgba(6,20,18,0.62)_0%,transparent_75%)]" />
        </div>

        {/* Editorial stack */}
        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-5 sm:px-6 md:px-14 py-16 text-center">
          <Motion.div
            initial={reduce ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="max-w-3xl mx-auto"
          >
            <p className="flex flex-wrap items-center justify-center gap-3 mb-6">
              <span className="route-dot" aria-hidden="true" />
              <span className="eyebrow">20.59° N · 78.96° E</span>
              <span className="route-line w-12 hidden sm:inline-block" aria-hidden="true" />
              <span className="eyebrow-muted">AI trip planner</span>
            </p>

            <h1 className="font-display text-ivory text-4xl sm:text-5xl md:text-6xl font-light leading-[1.05] tracking-tight mb-6">
              {itinerary ? (
                <>
                  Your route is <em className="font-medium italic text-saffron-bright">ready</em>
                </>
              ) : (
                <>
                  Plan a trip through{" "}
                  <em className="font-medium italic text-saffron-bright">Incredible India</em>
                </>
              )}
            </h1>

            <p className="text-ivory-muted text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              {itinerary
                ? `A day-by-day plan through ${itinerary.selectedState || "your destination"} — timings, transport, and a ₹ budget for every stop.`
                : "The Taj at sunrise, the ghats of Varanasi, Kerala's backwaters, the high passes of Ladakh — tell SafarX where you are headed and it drafts the days, the travel legs, and a ₹ budget you can actually book against."}
            </p>

            {/* Ambient journey: a car and a train running the route */}
            <JourneyStrip className="mt-8" />

            {!itinerary && (
              <p className="mt-4 flex items-center justify-center gap-2.5 font-data text-[11px] uppercase tracking-[0.22em] text-ivory-faint">
                <ArrowDown size={14} className="text-saffron" aria-hidden="true" />
                Five steps to a full plan
              </p>
            )}
          </Motion.div>
        </div>
      </section>

      {/* ======================= ASSURANCES ======================= */}
      {!itinerary && !busy && (
        <section className="px-5 sm:px-6 md:px-14 pt-12 md:pt-16" aria-label="What SafarX plans for you">
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
            {ASSURANCES.map((item, i) => {
              const Icon = item.icon;
              return (
                <Motion.div
                  key={item.title}
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.55, delay: reduce ? 0 : i * 0.08, ease: EASE }}
                  className="rounded-2xl border border-white/[0.07] bg-ink-900 p-5"
                >
                  <span className="mb-4 w-9 h-9 rounded-xl bg-saffron/10 border border-saffron/30 flex items-center justify-center">
                    <Icon size={16} className="text-saffron" aria-hidden="true" />
                  </span>
                  <h2 className="font-data text-[11px] uppercase tracking-[0.2em] text-ivory mb-2">{item.title}</h2>
                  <p className="text-sm text-ivory-muted leading-relaxed">{item.copy}</p>
                </Motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* ======================= FORM & RESULTS ======================= */}
      <div className="relative pt-10 md:pt-14 pb-24 px-5 sm:px-6 md:px-14">
        <div className="max-w-6xl mx-auto">

          {/* Brief — stays mounted so answers survive tweak & regenerate */}
          <div ref={formRef} className={showForm ? "" : "hidden"} aria-hidden={showForm ? undefined : true}>
            <GeminiItineraryForm
              key={formKey}
              onItineraryGenerated={handleItineraryGenerated}
              onLoadingChange={handleLoadingChange}
              regenerateSignal={regenerateSignal}
            />
          </div>

          {/* Generating */}
          <AnimatePresence>
            {busy && (
              <Motion.div
                key="generating"
                initial={reduce ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <GeneratingRoute destination={draft?.destination} />
              </Motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {showResult && (
              <Motion.div
                ref={resultsRef}
                key="result"
                initial={reduce ? false : { opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: 40 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <div className="mb-2 flex justify-center">
                  <span className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-saffron/10 border border-saffron/30">
                    <Sparkles size={13} className="text-saffron" aria-hidden="true" />
                    <span className="font-data text-[11px] uppercase tracking-[0.22em] text-saffron">
                      Itinerary ready
                    </span>
                  </span>
                </div>

                {typeof itinerary === 'string' ? (
                  <SimpleMarkdownDisplay markdown={itinerary} />
                ) : (
                  <GeminiItineraryDisplay
                    itinerary={itinerary}
                    formData={formData}
                    onRegenerate={handleRegenerate}
                    onTweak={handleTweak}
                  />
                )}

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleNewItinerary}
                    className="btn-ghost mt-8"
                  >
                    <Compass size={15} aria-hidden="true" />
                    Start a new trip
                  </button>
                </div>
              </Motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ItineraryPlanner;
