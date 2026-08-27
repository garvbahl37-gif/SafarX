import React, { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { MapPin, RotateCcw, ArrowDown } from "lucide-react";
import GeminiItineraryForm from "../components/GeminiItineraryForm";
import GeminiItineraryDisplay from "../components/GeminiItineraryDisplay";
import SimpleMarkdownDisplay from "../components/SimpleMarkdownDisplay";

const ItineraryPlanner = ({ selectedItem }) => {
  const [itinerary, setItinerary] = useState(null);
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const resultsRef = React.useRef(null);

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

  const handleNewItinerary = () => {
    setItinerary(null);
    setFormData(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
        className="relative min-h-[62vh] overflow-hidden flex items-end"
        aria-label="AI trip planner"
      >
        {/* Video backdrop */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="https://res.cloudinary.com/dnmhqosoa/video/upload/v1772188196/itenary_oajmr2.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/55 to-ink-950/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950/55 via-transparent to-transparent" />
        </div>

        {/* Editorial stack */}
        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 md:px-14 pb-16 md:pb-20 pt-24">
          <Motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <p className="flex items-center gap-3 mb-6">
              <span className="route-dot" />
              <span className="eyebrow">20.59° N · 78.96° E</span>
              <span className="route-line w-12 hidden sm:inline-block" />
              <span className="eyebrow-muted">AI trip planner</span>
            </p>

            <h1 className="font-display text-ivory text-4xl sm:text-5xl md:text-6xl font-light leading-[1.05] tracking-tight mb-6">
              {itinerary ? (
                <>
                  Your route is <em className="font-medium italic text-saffron-bright">ready</em>
                </>
              ) : (
                <>
                  Every day, <em className="font-medium italic text-saffron-bright">planned to the hour</em>
                </>
              )}
            </h1>

            <p className="text-ivory-muted text-base md:text-lg leading-relaxed max-w-xl">
              {itinerary
                ? `A day-by-day plan through ${itinerary.selectedState || "your destination"} — timings, transport, and a ₹ budget for every stop.`
                : "Tell SafarX where you're headed and how you like to travel. It drafts a day-by-day Indian itinerary with timings, transport, and ₹ budgets."}
            </p>

            {!itinerary && (
              <p className="mt-10 flex items-center gap-2.5 font-data text-[11px] uppercase tracking-[0.22em] text-ivory-faint">
                <ArrowDown size={14} className="text-saffron" aria-hidden="true" />
                Scroll to plan
              </p>
            )}
          </Motion.div>
        </div>
      </section>

      {/* ======================= FORM & RESULTS ======================= */}
      <div className="relative pb-24 px-6 md:px-14">
        <div className="max-w-5xl mx-auto">

          {/* Form panel */}
          {!itinerary && (
            <Motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative mt-4"
            >
              <div className="glass-panel !rounded-3xl p-8 md:p-12 border border-white/[0.07]">
                <div className="flex items-center gap-5 mb-10 pb-8 border-b border-white/[0.07]">
                  <span className="w-14 h-14 shrink-0 rounded-2xl bg-ink-800 border border-saffron/30 flex items-center justify-center">
                    <MapPin className="text-saffron" size={24} aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="font-display text-3xl md:text-4xl font-medium text-ivory tracking-tight leading-tight">
                      Design your journey
                    </h2>
                    <p className="mt-1.5 font-data text-[11px] uppercase tracking-[0.22em] text-ivory-faint">
                      Tailor every detail
                    </p>
                  </div>
                </div>

                <GeminiItineraryForm onItineraryGenerated={handleItineraryGenerated} />
              </div>
            </Motion.div>
          )}

          {/* Results */}
          <AnimatePresence>
            {itinerary && formData && (
              <Motion.div
                ref={resultsRef}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                {isLoading ? (
                  <div className="text-center py-24 mt-4 rounded-3xl bg-ink-900 border border-white/[0.07]">
                    <span className="route-dot mx-auto mb-6 block animate-pulse !w-2.5 !h-2.5" aria-hidden="true" />
                    <h3 className="font-display text-3xl font-medium text-ivory mb-3">
                      Charting your route…
                    </h3>
                    <p className="text-ivory-muted text-sm">
                      SafarX is matching seasons, timings, and budgets to your trip.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mt-4 mb-2 flex justify-center">
                      <span className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-saffron/10 border border-saffron/30">
                        <span className="route-dot" aria-hidden="true" />
                        <span className="font-data text-[11px] uppercase tracking-[0.22em] text-saffron">
                          Itinerary ready
                        </span>
                      </span>
                    </div>
                    {typeof itinerary === 'string' ? (
                      <SimpleMarkdownDisplay markdown={itinerary} />
                    ) : (
                      <GeminiItineraryDisplay itinerary={itinerary} formData={formData} />
                    )}
                    <div className="flex justify-center">
                      <button
                        onClick={handleNewItinerary}
                        className="btn-ghost mt-6"
                      >
                        <RotateCcw size={15} aria-hidden="true" />
                        Plan another trip
                      </button>
                    </div>
                  </>
                )}
              </Motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ItineraryPlanner;
