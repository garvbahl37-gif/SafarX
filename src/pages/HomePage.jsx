import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Star,
  Users,
  MapPin,
  Calendar,
  Globe as GlobeIcon,
  MessageCircle,
  Camera,
  CheckCircle,
  Plane,
  FolderOpen,
  Upload,
  Compass,
} from "lucide-react";

import SectionHeading, { RouteDivider } from "../components/ui/SectionHeading";
import CurvedLoop from "../components/animations/CurvedLoop";
import vrToursData from "../data/vrTours.json";

/* ------------------------------------------------------------------ */
/*  Hero slides — each slide is a place with real coordinates          */
/* ------------------------------------------------------------------ */

const SLIDES = [
  {
    id: "india",
    coords: "20.59° N · 78.96° E",
    place: "Incredible India",
    title: "Every journey",
    titleAccent: "begins here",
    description:
      "Preview India's heritage in immersive 360°, plan with AI, and travel with everything you need in one place.",
    url: "https://res.cloudinary.com/dnmhqosoa/video/upload/v1775633394/done_fy2tix.mp4",
  },
  {
    id: "coast",
    coords: "15.30° N · 74.12° E",
    place: "Goa · The Konkan Coast",
    title: "Where the map",
    titleAccent: "turns turquoise",
    description:
      "From Goa's beaches to the backwaters of Kerala — compare shores, stays, and seasons before booking a night.",
    url: "https://res.cloudinary.com/dnmhqosoa/video/upload/v1775633150/ocean_fe7jkv.mp4",
  },
  {
    id: "cities",
    coords: "28.61° N · 77.21° E",
    place: "Delhi · The Great Cities",
    title: "Feel the pulse",
    titleAccent: "of the megacity",
    description:
      "Street-level 360° views of Delhi, Mumbai, and Jaipur — with local insights that guidebooks miss.",
    url: "https://res.cloudinary.com/dnmhqosoa/video/upload/v1775633136/vibrantcities_na8xqe.mp4",
  },
  {
    id: "ghats",
    coords: "10.09° N · 77.06° E",
    place: "The Western Ghats",
    title: "Get lost where",
    titleAccent: "the wild still is",
    description:
      "Misty tea hills, hidden waterfalls, and the trails locals actually take — shared by travelers like you.",
    url: "https://res.cloudinary.com/dnmhqosoa/video/upload/v1775633434/lastpage_hv47ap.mp4",
  },
];

const SLIDE_DURATION = 9000;

/* ------------------------------------------------------------------ */
/*  Toolkit bento                                                      */
/* ------------------------------------------------------------------ */

const TOOLKIT = [
  {
    id: "360tour",
    title: "VR Previews",
    desc: "Step inside India's monuments and hotels in high-fidelity 360° before you book.",
    icon: Camera,
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&auto=format&fit=crop&q=80",
    span: "md:col-span-2 md:row-span-2",
  },
  {
    id: "itinerary",
    title: "AI Trip Planner",
    desc: "Day-by-day itineraries tuned to your pace, budget, and interests.",
    icon: Calendar,
    image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=900&auto=format&fit=crop&q=80",
    span: "md:col-span-2",
  },
  {
    id: "tracker",
    title: "Flight Tracker",
    desc: "Follow any aircraft live across the globe.",
    icon: Plane,
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&auto=format&fit=crop&q=80",
  },
  {
    id: "vault",
    title: "Document Vault",
    desc: "Tickets, visas, and IDs — secured and offline-ready.",
    icon: FolderOpen,
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=900&auto=format&fit=crop&q=80",
  },
  {
    id: "social",
    title: "Safar Groups",
    desc: "Plan group trips and split the logistics, not the fun.",
    icon: Users,
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=900&auto=format&fit=crop&q=80",
    span: "md:col-span-2",
  },
  {
    id: "gems",
    title: "Hidden Gems",
    desc: "Secret spots shared by locals — off every tourist map.",
    icon: Compass,
    image: "https://images.unsplash.com/photo-1571536802807-30451e3955d8?w=900&auto=format&fit=crop&q=80",
    span: "md:col-span-2",
  },
];

/* ------------------------------------------------------------------ */
/*  Journey stages — a real sequence, so the numbering means something */
/* ------------------------------------------------------------------ */

const STAGES = [
  {
    step: "01",
    phase: "Before you go",
    title: "See it before you believe it",
    desc: "Tour destinations, hotels, and neighborhoods in immersive VR. Build an AI itinerary around what you actually loved — not what a brochure promised.",
    page: "360tour",
    cta: "Open VR previews",
  },
  {
    step: "02",
    phase: "On the way",
    title: "Everything important, one pocket",
    desc: "Your documents live in an encrypted vault, your flight is tracked live, and your checklist makes sure nothing gets left on the kitchen table.",
    page: "vault",
    cta: "Open the vault",
  },
  {
    step: "03",
    phase: "On the ground",
    title: "A local in your corner, 24/7",
    desc: "SafarX answers in seconds — bookings, trains, translations, and the places nearby that locals actually go. Powered by Gemini.",
    page: "chat",
    cta: "Ask SafarX",
  },
];

/* ------------------------------------------------------------------ */
/*  Featured destinations — real tour links, fare-tag style meta       */
/* ------------------------------------------------------------------ */

const DESTINATIONS = [
  {
    tourId: "taj-mahal",
    name: "Taj Mahal",
    country: "Agra, Uttar Pradesh",
    coords: "27.17° N · 78.04° E",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=900&auto=format&fit=crop&q=80",
    rating: 4.9,
    season: "Oct – Mar",
    budget: "₹3k / day",
  },
  {
    tourId: "jaipur",
    name: "Amber Fort",
    country: "Jaipur, Rajasthan",
    coords: "26.99° N · 75.85° E",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=900&auto=format&fit=crop&q=80",
    rating: 4.8,
    season: "Oct – Mar",
    budget: "₹2.5k / day",
  },
  {
    tourId: "varanasi",
    name: "Ghats of Varanasi",
    country: "Uttar Pradesh",
    coords: "25.32° N · 83.01° E",
    image: "https://images.unsplash.com/photo-1561359313-0639aad49ca6?w=900&auto=format&fit=crop&q=80",
    rating: 4.9,
    season: "Nov – Feb",
    budget: "₹2k / day",
  },
  {
    tourId: "hampi",
    name: "Hampi",
    country: "Karnataka",
    coords: "15.34° N · 76.46° E",
    image: "https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?w=900&auto=format&fit=crop&q=80",
    rating: 4.8,
    season: "Oct – Feb",
    budget: "₹1.8k / day",
  },
  {
    tourId: "kerala",
    name: "Kerala Backwaters",
    country: "Alleppey, Kerala",
    coords: "9.50° N · 76.34° E",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=900&auto=format&fit=crop&q=80",
    rating: 4.9,
    season: "Sep – Mar",
    budget: "₹4k / day",
  },
  {
    tourId: "ladakh",
    name: "Ladakh",
    country: "Leh, Trans-Himalaya",
    coords: "34.15° N · 77.58° E",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=900&auto=format&fit=crop&q=80",
    rating: 4.9,
    season: "May – Sep",
    budget: "₹3.5k / day",
  },
];

const STATS = [
  { value: "500+", label: "Heritage sites mapped" },
  { value: "43", label: "UNESCO World Heritage sites" },
  { value: "50K", label: "Travelers onboard" },
  { value: "24/7", label: "SafarX support" },
];

/* ================================================================== */

const HomePage = ({ onPageChange }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const videoY = useTransform(scrollYProgress, [0, 1], ["0px", "160px"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  // Auto-advance the hero
  useEffect(() => {
    const t = setInterval(
      () => setActiveSlide((i) => (i + 1) % SLIDES.length),
      SLIDE_DURATION
    );
    return () => clearInterval(t);
  }, [activeSlide]);

  const openTour = useCallback(
    (tourId) => {
      const tour = vrToursData.find((t) => t.id === tourId);
      onPageChange("360tour", tour);
    },
    [onPageChange]
  );

  const slide = SLIDES[activeSlide];

  return (
    <div className="min-h-screen bg-ink-950">
      {/* ============================ HERO ============================ */}
      <section
        ref={heroRef}
        className="relative h-screen overflow-hidden flex items-end bg-ink-950"
        aria-label="Featured journeys"
      >
        {/* Video backdrop */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ y: videoY }}
              className="absolute inset-0"
            >
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
                src={slide.url}
              />
            </motion.div>
          </AnimatePresence>
          {/* Legibility scrim — bottom-heavy, warm-tinted */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/45 to-ink-950/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950/60 via-transparent to-transparent" />
        </div>

        {/* Editorial stack */}
        <motion.div
          style={{ opacity: contentOpacity }}
          className="relative z-20 w-full max-w-[1440px] mx-auto px-6 md:px-14 pb-36 md:pb-32"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl"
            >
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="flex items-center gap-3 mb-6"
              >
                <span className="route-dot" />
                <span className="eyebrow">{slide.coords}</span>
                <span className="route-line w-12 hidden sm:inline-block" />
                <span className="eyebrow-muted">{slide.place}</span>
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-ivory text-5xl sm:text-6xl md:text-[5.25rem] font-light leading-[1.02] tracking-tight mb-7"
              >
                {slide.title}{" "}
                <em className="font-medium italic text-saffron-bright">
                  {slide.titleAccent}
                </em>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-ivory-muted text-base md:text-lg leading-relaxed max-w-xl mb-10"
              >
                {slide.description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="flex flex-wrap items-center gap-4"
              >
                <button onClick={() => onPageChange("itinerary")} className="btn-primary">
                  Plan a trip
                  <ArrowRight size={16} />
                </button>
                <button onClick={() => onPageChange("360tour")} className="btn-ghost">
                  <Camera size={16} />
                  Preview in VR
                </button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Slide index — thin progress bars, route-log style */}
        <div className="absolute bottom-10 right-6 md:right-14 z-30 flex items-end gap-2.5">
          {SLIDES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setActiveSlide(idx)}
              aria-label={`Show ${s.place}`}
              className="group flex flex-col items-center gap-2 pb-1"
            >
              <span
                className={`hidden md:block font-data text-[9px] tracking-[0.2em] uppercase transition-colors duration-300 ${
                  activeSlide === idx ? "text-saffron" : "text-ivory/25 group-hover:text-ivory/60"
                }`}
              >
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="relative block w-9 md:w-12 h-[2px] bg-white/15 overflow-hidden rounded-full">
                {activeSlide === idx && (
                  <motion.span
                    key={`bar-${activeSlide}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
                    className="absolute inset-0 bg-saffron origin-left"
                  />
                )}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ======================= STATS BAND ======================= */}
      <section className="border-b border-white/[0.06] bg-ink-900">
        <div className="max-w-[1440px] mx-auto px-6 md:px-14 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="flex items-baseline gap-3"
            >
              <span className="font-data text-3xl md:text-4xl font-medium text-ivory tabular-nums">
                {stat.value}
              </span>
              <span className="text-[11px] uppercase tracking-[0.16em] text-ivory-faint leading-tight">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ======================= TOOLKIT BENTO ======================= */}
      <section id="explore-more-section" className="py-24 md:py-32 bg-ink-950">
        <div className="max-w-[1440px] mx-auto px-6 md:px-14">
          <SectionHeading
            eyebrow="The Safar Toolkit"
            title="One companion for the whole journey"
            lede="Nine tools that used to be nine different apps — previews, planning, tracking, documents, and a community of travelers."
            className="mb-16"
          />

          <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[190px] md:auto-rows-[210px] gap-4">
            {TOOLKIT.map((tool, i) => (
              <motion.button
                key={tool.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.65, delay: (i % 4) * 0.07 }}
                onClick={() => onPageChange(tool.id)}
                className={`group relative overflow-hidden rounded-2xl border border-white/[0.07] text-left hover:border-saffron/35 transition-colors duration-500 ${tool.span || ""}`}
              >
                <img
                  src={tool.image}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-65 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/40 to-ink-950/10" />
                <div className="relative h-full p-6 flex flex-col justify-between">
                  <span className="w-10 h-10 rounded-xl bg-ink-950/60 backdrop-blur-md border border-white/[0.09] flex items-center justify-center">
                    <tool.icon size={17} className="text-saffron" />
                  </span>
                  <span>
                    <span className="flex items-center gap-2 text-lg font-bold text-ivory mb-1">
                      {tool.title}
                      <ArrowUpRight
                        size={15}
                        className="text-saffron opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300"
                      />
                    </span>
                    <span className="block text-[13px] text-ivory-muted leading-snug max-w-[36ch]">
                      {tool.desc}
                    </span>
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= 360° WINDOW ======================= */}
      <section className="py-24 md:py-32 bg-ink-900 border-y border-white/[0.06]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-14">
          <div className="grid lg:grid-cols-[1fr_1.6fr] gap-12 items-center">
            <div>
              <SectionHeading
                align="left"
                eyebrow="27.17° N · 78.04° E"
                title={
                  <>
                    Try before <em className="italic text-saffron-bright">you fly</em>
                  </>
                }
                lede="This is a live 360° window inside the Taj Mahal — drag it. Every heritage site on SafarX can be walked through like this before you spend a rupee on it."
              />
              <button
                onClick={() => onPageChange("360view")}
                className="btn-primary mt-8"
              >
                Explore all 360° views
                <ArrowRight size={16} />
              </button>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative rounded-3xl overflow-hidden border border-white/[0.09] shadow-2xl aspect-[16/10] bg-ink-800"
            >
              <iframe
                src="https://www.youtube.com/embed/2aJ9cOwbzxo?rel=0&modestbranding=1"
                title="360° preview of the Taj Mahal"
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; gyroscope; encrypted-media; picture-in-picture"
                allowFullScreen
              />
              <div className="absolute bottom-4 left-4 glass-panel !rounded-full px-4 py-2 flex items-center gap-2.5 pointer-events-none">
                <span className="route-dot animate-pulse" />
                <span className="font-data text-[11px] tracking-[0.2em] uppercase text-ivory/80">
                  360° · Taj Mahal, Agra
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ======================= JOURNEY STAGES ======================= */}
      <section className="py-24 md:py-32 bg-ink-950">
        <div className="max-w-[1440px] mx-auto px-6 md:px-14">
          <SectionHeading
            eyebrow="Departure → Arrival"
            title="Built around the shape of a trip"
            className="mb-20"
          />

          <div className="relative">
            {/* Connecting route line across the three stages */}
            <div className="hidden md:block absolute top-[22px] left-[12%] right-[12%] route-line" aria-hidden="true" />

            <div className="grid md:grid-cols-3 gap-10 md:gap-8">
            {STAGES.map((stage, i) => (
              <motion.div
                key={stage.step}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: i * 0.12 }}
                className="relative flex flex-col"
              >
                <div className="flex items-center gap-4 mb-6">
                  <span className="relative z-10 w-11 h-11 rounded-full bg-ink-800 border border-saffron/40 flex items-center justify-center font-data text-sm text-saffron">
                    {stage.step}
                  </span>
                  <span className="eyebrow-muted">{stage.phase}</span>
                </div>
                <h3 className="font-display text-2xl md:text-[1.7rem] font-medium text-ivory leading-snug mb-4">
                  {stage.title}
                </h3>
                <p className="text-ivory-muted text-[15px] leading-relaxed mb-6 flex-1">
                  {stage.desc}
                </p>
                <button
                  onClick={() => onPageChange(stage.page)}
                  className="group inline-flex items-center gap-2 text-saffron text-[13px] font-bold tracking-wide self-start"
                >
                  {stage.cta}
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======================= TICKER ======================= */}
      <div className="bg-ink-900 border-y border-white/[0.06] py-1 text-saffron/40">
        <CurvedLoop
          marqueeText="AGRA • JAIPUR • VARANASI • HAMPI • ALLEPPEY • LEH • GOA • DELHI • RISHIKESH • KHAJURAHO • "
          speed={1.2}
          curveAmount={24}
          className="text-2xl font-black tracking-widest"
        />
      </div>

      {/* ======================= DESTINATIONS ======================= */}
      <section className="py-24 md:py-32 bg-ink-950">
        <div className="max-w-[1440px] mx-auto px-6 md:px-14">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
            <SectionHeading
              align="left"
              eyebrow="Field notes"
              title="Places travelers keep returning to"
            />
            <button
              onClick={() => onPageChange("360tour")}
              className="group inline-flex items-center gap-2 text-saffron text-[13px] font-bold tracking-wide shrink-0"
            >
              Browse all VR tours
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {DESTINATIONS.map((dest, i) => (
              <motion.button
                key={dest.tourId}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.65, delay: (i % 3) * 0.08 }}
                onClick={() => openTour(dest.tourId)}
                className="group relative rounded-2xl overflow-hidden border border-white/[0.07] text-left hover:border-saffron/35 transition-colors duration-500"
              >
                <div className="relative h-[300px] overflow-hidden">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/25 to-transparent" />

                  {/* Rating chip */}
                  <span className="absolute top-4 right-4 glass-panel !rounded-full px-3 py-1.5 flex items-center gap-1.5">
                    <Star size={12} className="text-saffron fill-saffron" />
                    <span className="font-data text-xs text-ivory">{dest.rating}</span>
                  </span>

                  <div className="absolute bottom-0 inset-x-0 p-6">
                    <p className="eyebrow !text-[10px] mb-2">{dest.coords}</p>
                    <h3 className="font-display italic text-3xl font-medium text-ivory mb-1">
                      {dest.name}
                    </h3>
                    <p className="text-ivory-muted text-[13px] mb-4">{dest.country}</p>

                    {/* Fare-tag meta row */}
                    <div className="flex items-center gap-4 font-data text-[11px] tracking-[0.08em] text-ivory/70 uppercase">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={11} className="text-saffron/80" />
                        {dest.season}
                      </span>
                      <span className="w-px h-3 bg-white/20" />
                      <span>{dest.budget}</span>
                      <span className="ml-auto flex items-center gap-1 text-saffron opacity-0 group-hover:opacity-100 transition-opacity duration-300 normal-case tracking-normal font-sans font-bold">
                        Enter VR
                        <ArrowUpRight size={12} />
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= CTA ======================= */}
      <section className="relative py-28 md:py-40 overflow-hidden">
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            src="https://res.cloudinary.com/dnmhqosoa/video/upload/v1775633171/neeche_ef76ax.mp4"
          />
          <div className="absolute inset-0 bg-ink-950/75" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950 via-transparent to-ink-950" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <RouteDivider className="max-w-[240px] mx-auto mb-10" />
          <h2 className="font-display text-4xl md:text-6xl font-light text-ivory leading-[1.08] tracking-tight mb-6">
            Incredible India is calling.
            <br />
            <em className="italic text-saffron-bright font-medium">Start your safar.</em>
          </h2>
          <p className="text-ivory-muted text-base md:text-lg mb-10 max-w-xl mx-auto">
            Join fifty thousand travelers exploring India's heritage with certainty and confidence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => onPageChange("itinerary")} className="btn-primary">
              <Calendar size={16} />
              Plan your trip
            </button>
            <button onClick={() => onPageChange("360tour")} className="btn-ghost">
              <Camera size={16} />
              Explore in VR
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
