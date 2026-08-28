import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Compass,
  Waves,
  Building,
  Crown,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Maximize,
  Calendar,
  Clock,
  ChevronLeft,
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import PanoramaViewer from "../components/vr/PanoramaViewer";

const EASE = [0.22, 1, 0.36, 1];

// 360° tour locations — Indian heritage only.
// `vrTourId` points at the matching entry in vrTours.json, which is where the
// verified equirectangular panoramas live. A site may have several vantage
// points; PanoramaViewer resolves the whole list and offers a switcher.
const locations = [
  {
    id: 1,
    vrTourId: "taj-mahal",
    name: "Taj Mahal",
    place: "Agra, Uttar Pradesh",
    coords: "27.17° N · 78.04° E",
    subtitle: "Marble by moonlight and morning",
    description:
      "Walk the charbagh gardens and stand before the mausoleum itself — the 360° view puts you on the marble platform where photographs are never enough.",
    latitude: 27.17501,
    longitude: 78.0421,
    icon: Crown,
    category: "Mughal wonder",
    highlights: ["Main mausoleum", "Charbagh gardens", "Yamuna riverfront"],
    bestTime: "October – March",
  },
  {
    id: 2,
    vrTourId: "varanasi",
    name: "Varanasi",
    place: "Uttar Pradesh",
    coords: "25.32° N · 83.01° E",
    subtitle: "The oldest living city on the Ganga",
    description:
      "Drift past the ghats at dawn, where prayer, trade, and river life have run together for three thousand years — all of it visible in one slow turn.",
    latitude: 25.3068,
    longitude: 83.0104,
    icon: Sparkles,
    category: "Sacred city",
    highlights: ["Dashashwamedh Ghat", "Ganga aarti", "Old city lanes"],
    bestTime: "October – March",
  },
  {
    id: 3,
    vrTourId: "jaipur",
    name: "Jaipur",
    place: "Rajasthan",
    coords: "26.92° N · 75.82° E",
    subtitle: "The pink city of the Rajputs",
    description:
      "Circle Amber Fort's ramparts and look down into the City Palace courtyards — the royal capital of Rajasthan, seen the way its builders imagined it.",
    latitude: 26.98631,
    longitude: 75.85066,
    icon: Building,
    category: "Royal heritage",
    highlights: ["Amber Fort", "City Palace", "Hawa Mahal"],
    bestTime: "October – March",
  },
  {
    id: 4,
    vrTourId: null,   // no verified panorama yet — the viewer shows its empty state
    name: "Andaman Islands",
    place: "Bay of Bengal",
    coords: "11.62° N · 92.73° E",
    subtitle: "India's far blue frontier",
    description:
      "Hover over reefs and empty white beaches at the edge of the map — the clearest water in India, from above and below the surface.",
    latitude: 11.98320,
    longitude: 92.94940,
    icon: Waves,
    category: "Island wilderness",
    highlights: ["Radhanagar Beach", "Coral reefs", "Mangrove creeks"],
    bestTime: "October – May",
  },
];

const TourPage360 = ({ onPageChange }) => {
  const [activeLocation, setActiveLocation] = useState(0);
  const [viewStats, setViewStats] = useState({
    totalViews: 0,
    activeViewers: 0,
  });
  const viewerRef = useRef(null);

  // Simulated live stats
  useEffect(() => {
    const interval = setInterval(() => {
      setViewStats({
        totalViews: Math.floor(Math.random() * 1000) + 15000,
        activeViewers: Math.floor(Math.random() * 50) + 120,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Reset the loading veil whenever the viewer switches location
  useEffect(() => {
  }, [activeLocation]);

  const enterFullscreen = () => {
    const el = viewerRef.current;
    if (el?.requestFullscreen) el.requestFullscreen();
    else if (el?.webkitRequestFullscreen) el.webkitRequestFullscreen();
  };

  const currentLocation = locations[activeLocation];

  return (
    <div className="min-h-screen bg-ink-950 text-ivory">
      {/* ======================= HERO ======================= */}
      <section className="relative h-[80vh] w-full overflow-hidden flex flex-col justify-center items-center">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source
              src="https://res.cloudinary.com/dnmhqosoa/video/upload/v1775633706/homepage_fxyylp.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-ink-950/30" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <p className="flex items-center justify-center gap-3 mb-6">
              <span className="route-dot" />
              <span className="eyebrow">360° explorer · {currentLocation.coords}</span>
            </p>

            <h1 className="font-display text-5xl md:text-7xl font-light text-ivory leading-[1.05] tracking-tight mb-6">
              Step inside India,{" "}
              <em className="italic font-medium text-saffron-bright">before you arrive</em>
            </h1>

            <p className="text-ivory-muted text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Four interactive 360° panoramas of India's landmarks — drag to look around,
              zoom in, and decide where the real trip begins.
            </p>

            <div className="mt-16 text-ivory-faint flex flex-col items-center gap-3" aria-hidden="true">
              <p className="font-data text-[10px] uppercase tracking-[0.4em]">Scroll to explore</p>
              <div className="w-px h-12 bg-gradient-to-b from-ivory/40 to-transparent" />
            </div>
          </Motion.div>
        </div>
      </section>

      {/* ======================= LOCATION NAV ======================= */}
      <div className="sticky top-[72px] z-50 bg-ink-950/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-14 py-3">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => onPageChange("home")}
              className="flex items-center gap-1.5 text-ivory-muted hover:text-saffron transition-colors font-data font-medium tracking-[0.16em] text-[10px] uppercase shrink-0"
            >
              <ChevronLeft size={14} aria-hidden="true" />
              <span>Home</span>
            </button>

            <div
              className="flex items-center gap-2 overflow-x-auto"
              role="group"
              aria-label="Choose a 360° location"
            >
              {locations.map((location, index) => {
                const IconComponent = location.icon;
                return (
                  <button
                    key={location.id}
                    onClick={() => setActiveLocation(index)}
                    aria-pressed={activeLocation === index}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-data text-[11px] uppercase tracking-[0.1em] transition-colors duration-300 whitespace-nowrap border ${
                      activeLocation === index
                        ? "bg-saffron text-ink-950 border-saffron"
                        : "text-ivory-muted border-white/[0.1] hover:text-ivory hover:border-saffron/35"
                    }`}
                  >
                    <IconComponent size={13} aria-hidden="true" />
                    <span>{location.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ======================= ACTIVE LOCATION ======================= */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-14 py-16 md:py-20">
        <AnimatePresence mode="wait">
          {locations.map((location, index) => {
            if (index !== activeLocation) return null;

            return (
              <Motion.div
                key={location.id}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                {/* Location header */}
                <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 items-end mb-10">
                  <div>
                    <p className="flex items-center gap-3 mb-5">
                      <span className="route-dot" />
                      <span className="eyebrow">{location.coords}</span>
                      <span className="route-line w-10 hidden sm:inline-block" />
                      <span className="eyebrow-muted">{location.category}</span>
                    </p>

                    <h2 className="font-display italic text-4xl md:text-6xl font-medium text-ivory leading-tight mb-3">
                      {location.name}
                    </h2>
                    <p className="text-ivory-muted text-sm mb-5 flex items-center gap-2">
                      <MapPin size={13} className="text-saffron/80" aria-hidden="true" />
                      {location.place} — {location.subtitle}
                    </p>

                    <p className="text-ivory-muted text-[15px] leading-relaxed max-w-xl">
                      {location.description}
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="rounded-2xl border border-white/[0.07] bg-ink-800 p-5">
                      <h3 className="font-data text-[10px] uppercase tracking-[0.2em] text-saffron mb-4">
                        Highlights
                      </h3>
                      <ul className="space-y-2.5">
                        {location.highlights.map((highlight) => (
                          <li
                            key={highlight}
                            className="text-ivory/85 text-sm flex items-center gap-2.5"
                          >
                            <ArrowRight size={12} className="text-saffron shrink-0" aria-hidden="true" />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-white/[0.07] bg-ink-800 p-5">
                      <h3 className="font-data text-[10px] uppercase tracking-[0.2em] text-saffron mb-4">
                        Best time to visit
                      </h3>
                      <p className="text-ivory/85 text-sm flex items-center gap-2.5 mb-4">
                        <Calendar size={13} className="text-saffron/80 shrink-0" aria-hidden="true" />
                        {location.bestTime}
                      </p>
                      <p className="text-ivory-faint text-[13px] leading-snug flex items-start gap-2.5">
                        <Clock size={13} className="text-saffron/60 shrink-0 mt-0.5" aria-hidden="true" />
                        Early morning light works best in the panorama, and on the ground.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 360° viewer */}
                <div className="rounded-3xl overflow-hidden border border-white/[0.09] bg-ink-900 shadow-2xl">
                  <div className="px-5 md:px-7 py-4 border-b border-white/[0.06] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-9 h-9 rounded-full bg-ink-800 border border-saffron/30 flex items-center justify-center shrink-0">
                        <RotateCcw size={15} className="text-saffron" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-ivory text-sm font-bold truncate">
                          360° panorama · {location.name}
                        </p>
                        <p className="text-ivory-faint text-xs truncate">
                          Click and drag to look around
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="hidden sm:flex items-center gap-2 font-data text-[11px] uppercase tracking-[0.12em] text-ivory/70">
                        <span className="route-dot animate-pulse" />
                        Live · {viewStats.activeViewers || 120} exploring
                      </span>
                      <button
                        onClick={enterFullscreen}
                        aria-label="View panorama fullscreen"
                        className="w-9 h-9 rounded-full border border-white/[0.12] hover:border-saffron/40 flex items-center justify-center text-ivory-muted hover:text-ivory transition-colors"
                      >
                        <Maximize size={15} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div ref={viewerRef} className="relative bg-ink-950">
                    <PanoramaViewer
                      key={location.id}
                      tourId={location.vrTourId}
                      latitude={location.latitude}
                      longitude={location.longitude}
                      name={location.name}
                      region={location.place}
                      className="w-full aspect-video min-h-[420px] block"
                    />
                  </div>
                </div>
              </Motion.div>
            );
          })}
        </AnimatePresence>

        {/* Prev / next */}
        <div className="flex items-center justify-center gap-5 mt-12">
          <button
            onClick={() => setActiveLocation(Math.max(0, activeLocation - 1))}
            disabled={activeLocation === 0}
            className="btn-ghost disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={15} aria-hidden="true" />
            Previous stop
          </button>

          <span className="font-data text-xs text-ivory-faint tabular-nums" aria-live="polite">
            {String(activeLocation + 1).padStart(2, "0")} / {String(locations.length).padStart(2, "0")}
          </span>

          <button
            onClick={() =>
              setActiveLocation(Math.min(locations.length - 1, activeLocation + 1))
            }
            disabled={activeLocation === locations.length - 1}
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next stop
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* ======================= CTA ======================= */}
      <section className="relative py-24 md:py-32 overflow-hidden border-t border-white/[0.06]">
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source
              src="https://res.cloudinary.com/dnmhqosoa/video/upload/v1772875114/cl_wa7x6o.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-ink-950/80" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950 via-transparent to-ink-950" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <Motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <h2 className="font-display text-4xl md:text-6xl font-light text-ivory leading-[1.08] tracking-tight mb-6">
              Seen enough of the screen?
              <br />
              <em className="italic text-saffron-bright font-medium">Go stand there.</em>
            </h2>
            <p className="text-ivory-muted text-base md:text-lg mb-10 max-w-xl mx-auto">
              Turn a panorama into a plan — find the hidden places nearby, or build the
              itinerary that gets you to the real thing.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => onPageChange("gems")} className="btn-primary">
                <Compass size={16} aria-hidden="true" />
                Find hidden gems
              </button>
              <button onClick={() => onPageChange("itinerary")} className="btn-ghost">
                <Calendar size={16} aria-hidden="true" />
                Plan the trip
              </button>
            </div>
          </Motion.div>
        </div>
      </section>
    </div>
  );
};

export default TourPage360;
