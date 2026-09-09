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
import CountUp from "../components/ui/CountUp";
import JourneyRoad from "../components/home/JourneyRoad";
import vrToursData from "../data/vrTours.json";
import AskSrishti from "../components/ui/AskSrishti";

/* ------------------------------------------------------------------ */
/* Hero slides — each slide is a place with real coordinates */
/* ------------------------------------------------------------------ */

const SLIDES = [
 {
 id: "kerala",
 ghost: "केरल",
 coords: "9.50° N · 76.34° E",
 place: "Backwaters · Kerala",
 title: "Drift through",
 titleAccent: "God's own country",
 description:
 "Houseboats, palm canals, and slow water. Compare stays and seasons before you book a single night.",
 url: "https://videos.pexels.com/video-files/38298494/16262224_1920_1080_60fps.mp4",
 thumb: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=160&auto=format&fit=crop&q=60",
 },
 {
 id: "varanasi",
 ghost: "काशी",
 coords: "25.32° N · 83.01° E",
 place: "The Ghats · Varanasi",
 title: "Older than",
 titleAccent: "history itself",
 description:
 "Dusk over the Ganga, five thousand years deep. Walk the ghats in 360° before your boat ever touches the water.",
 url: "/media/hero-ladakh.mp4",
 thumb: "https://images.unsplash.com/photo-1561359313-0639aad49ca6?w=160&auto=format&fit=crop&q=60",
 },
 {
 id: "agra",
 ghost: "आगरा",
 coords: "27.17° N · 78.04° E",
 place: "Taj Mahal · Agra",
 title: "Every safar",
 titleAccent: "begins here",
 description:
 "Sunrise over the Taj. Preview India's heritage in immersive 360°, plan with AI, and carry everything you need in one place.",
 url: "/media/hero-taj.mp4",
 thumb: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=160&auto=format&fit=crop&q=60",
 },
 {
 id: "himalaya",
 ghost: "हिमालय",
 coords: "34.15° N · 77.58° E",
 place: "The High Passes · Ladakh",
 title: "Stand on the",
 titleAccent: "roof of India",
 description:
 "Mist over the high Himalaya. Scout altitude, weather, and routes in VR before you commit to the climb.",
 url: "https://videos.pexels.com/video-files/30152886/12929642_1920_1080_30fps.mp4",
 thumb: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=160&auto=format&fit=crop&q=60",
 },
 {
 id: "jaipur",
 ghost: "जयपुर",
 coords: "26.92° N · 75.82° E",
 place: "The Pink City · Jaipur",
 title: "Feel the pulse",
 titleAccent: "of the bazaar",
 description:
 "Jaipur's streets at dusk — forts above, markets below. Local insights that guidebooks miss, from people who live there.",
 url: "https://videos.pexels.com/video-files/37056813/15698517_1920_1080_50fps.mp4",
 thumb: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=160&auto=format&fit=crop&q=60",
 },
];

const SLIDE_DURATION = 10000;

/* Word-stagger reveal for the display headline */
const headlineContainer = {
 hidden: {},
 show: { transition: { staggerChildren: 0.09, delayChildren: 0.35 } },
};
const headlineWord = {
 hidden: { opacity: 0, y: "0.6em", filter: "blur(8px)" },
 show: {
 opacity: 1,
 y: 0,
 filter: "blur(0px)",
 transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
 },
};

/* ------------------------------------------------------------------ */
/* Toolkit bento */
/* ------------------------------------------------------------------ */

const TOOLKIT = [
 {
 id: "360tour",
 title: "VR Previews",
 desc: "Step inside India's monuments and hotels in high-fidelity 360° before you book.",
 icon: Camera,
 image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1800&auto=format&fit=crop&q=80",
 span: "md:col-span-2 md:row-span-2",
 },
 {
 id: "itinerary",
 title: "AI Trip Planner",
 desc: "Day-by-day itineraries tuned to your pace, budget, and interests.",
 icon: Calendar,
 image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1400&auto=format&fit=crop&q=80",
 /* The Taj sits high in this frame. On a card this wide and short a centre
    crop takes the dome clean off, which is what it was doing. */
 focus: "center 22%",
 span: "md:col-span-2",
 },
 {
 id: "tracker",
 title: "Flight Tracker",
 desc: "Follow any aircraft live across the globe.",
 icon: Plane,
 image: "https://images.unsplash.com/photo-1649478388995-b157c433db1a?w=1400&auto=format&fit=crop&q=80",
 },
 {
 id: "vault",
 title: "Document Vault",
 desc: "Tickets, visas, and IDs — secured and offline-ready.",
 icon: FolderOpen,
 image: "https://images.unsplash.com/photo-1706880471208-88328ff11505?w=1400&auto=format&fit=crop&q=80",
 },
 {
 id: "social",
 title: "Safar Groups",
 desc: "Plan group trips and split the logistics, not the fun.",
 icon: Users,
 image: "https://images.unsplash.com/photo-1519955266818-0231b63402bc?w=1400&auto=format&fit=crop&q=80",
 span: "md:col-span-2",
 },
 {
 id: "gems",
 title: "Hidden Gems",
 desc: "Secret spots shared by locals — off every tourist map.",
 icon: Compass,
 image: "https://images.unsplash.com/photo-1571536802807-30451e3955d8?w=1400&auto=format&fit=crop&q=80",
 span: "md:col-span-2",
 },
];

/* ------------------------------------------------------------------ */
/* Journey stages — a real sequence, so the numbering means something */
/* ------------------------------------------------------------------ */

const STAGES = [
 {
 step: "01",
 phase: "Dream it",
 title: "See it before you believe it",
 desc: "Walk through monuments, ghats and hotel rooms in full 360° — so you know exactly what you are booking.",
 page: "360tour",
 cta: "Open VR previews",
 icon: Camera,
 },
 {
 step: "02",
 phase: "Plan it",
 title: "A day-by-day plan in minutes",
 desc: "Tell SafarX your dates, pace and budget in ₹. It drafts the route, the timings and what a day actually costs.",
 page: "itinerary",
 cta: "Plan a trip",
 icon: Calendar,
 },
 {
 step: "03",
 phase: "Pack for it",
 title: "Nothing left on the kitchen table",
 desc: "A checklist built from where you are going and when — thermals for Spiti in January, dry bags for a Kerala monsoon.",
 page: "checklist",
 cta: "Build a checklist",
 icon: CheckCircle,
 },
 {
 step: "04",
 phase: "On the way",
 title: "Papers and flights, always on you",
 desc: "Tickets and IDs in an encrypted vault, your aircraft tracked live across the sky. Both work when the signal does not.",
 page: "vault",
 cta: "Open the vault",
 icon: FolderOpen,
 },
 {
 step: "05",
 phase: "On the ground",
 title: "A local in your corner, 24/7",
 desc: "Ask in Hindi or English and get an answer in seconds — trains, stays, and the places nearby that locals actually go.",
 page: "chat",
 cta: "Ask SafarX",
 icon: MessageCircle,
 },
 {
 step: "06",
 phase: "Pass it on",
 title: "Leave the map better than you found it",
 desc: "Share the spot the guidebooks missed, and travel the next one with people heading the same way.",
 page: "gems",
 cta: "See hidden gems",
 icon: Compass,
 },
 {
 step: "07",
 phase: "Relive & Share",
 title: "Cinematic Reel & Digital Diary",
 desc: "Upload 15–20 photos from your trip. Get an instant 9:16 cinematic Reel with Ken Burns motion, Indian folk music, and a shareable QR story.",
 page: "diary",
 cta: "Create Travel Reel",
 },
];

/* ------------------------------------------------------------------ */
/* Featured destinations — real tour links, fare-tag style meta */
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
 tourId: "thanjavur",
 name: "Brihadeeswarar Temple",
 country: "Thanjavur, Tamil Nadu",
 coords: "10.78° N · 79.13° E",
 image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Brihadeeswarar_Temple_3482.jpg/1280px-Brihadeeswarar_Temple_3482.jpg",
 rating: 4.8,
 season: "Nov – Feb",
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
 { num: 500, suffix: "+", label: "Heritage sites mapped" },
 { num: 43, suffix: "", label: "UNESCO World Heritage sites" },
 { num: 50, suffix: "K", label: "Travelers onboard" },
 { num: 22, suffix: "", label: "Languages, once Kahani ships" },
];

/* ------------------------------------------------------------------ */
/* Voices from the road */
/* ------------------------------------------------------------------ */

const VOICES = [
 { quote: "I walked the ghats in VR at 2am and booked the trip by morning.", name: "Ananya R.", place: "Varanasi, Nov" },
 { quote: "The planner budgeted Ladakh better than I could have. Even the oxygen stops.", name: "Vikram S.", place: "Leh, Jun" },
 { quote: "Split five people's expenses across a Goa week without one argument.", name: "Meera J.", place: "Palolem, Feb" },
 { quote: "It sent me to Ziro Valley. I'd never even heard the name before.", name: "Karthik N.", place: "Arunachal, Sep" },
 { quote: "Every ticket and ID in one place when the hotel asked at midnight.", name: "Fatima A.", place: "Jaipur, Dec" },
 { quote: "The hidden gems list had my own grandmother's village on it.", name: "Rohit D.", place: "Majuli, Oct" },
];

/* ================================================================== */

const HomePage = ({ onPageChange, onAskSrishti }) => {
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
 const t = setInterval(() => setActiveSlide((i) => (i + 1) % SLIDES.length),
 SLIDE_DURATION
 );
 return () => clearInterval(t);
 }, [activeSlide]);

 const openTour = useCallback((tourId) => {
 const tour = vrToursData.find((t) => t.id === tourId);
 onPageChange("360tour", tour);
 },
 [onPageChange]
 );

 const slide = SLIDES[activeSlide];

 return (<div className="min-h-screen bg-ink-950">
 {/* ============================ HERO ============================ */}
 <section
 ref={heroRef}
 className="relative h-screen overflow-hidden flex items-end bg-ink-950 film-grain vignette"
 aria-label="Featured journeys across India"
 >
 {/* Cinematic video backdrop — wipe reveal + slow Ken Burns */}
 <div className="absolute inset-0 z-0">
 <AnimatePresence mode="popLayout">
 <motion.div
 key={slide.id}
 initial={{ clipPath: "inset(0 0 0 100%)" }}
 animate={{ clipPath: "inset(0 0 0 0%)" }}
 exit={{ opacity: 0, transition: { duration: 0.9 } }}
 transition={{ duration: 1.3, ease: [0.76, 0, 0.24, 1] }}
 style={{ y: videoY }}
 className="absolute inset-0"
 >
 <motion.div
 initial={{ scale: 1.045 }}
 animate={{ scale: 1 }}
 transition={{ duration: SLIDE_DURATION / 1000 + 2, ease: "linear" }}
 className="absolute inset-0 will-change-transform"
 >
 <video
 autoPlay
 muted
 loop
 playsInline
 preload="auto"
 /* No poster.
    A poster is a still shown until the video can play, so the hero
    opened on a photograph and swapped to motion — on the first load
    and again on every rotation. Two things make dropping it safe:
    the slide films are 1080p now rather than 4K, so the first frame
    arrives in a quarter of the time, and the next slide is already
    being fetched while this one is still playing. */
 className="w-full h-full object-cover video-crisp"
 src={slide.url}
 />
 </motion.div>
 </motion.div>
 </AnimatePresence>
 {/* The next slide's film, fetched while this one is still playing.
 
     Only the active slide is mounted, so each rotation started its video
     from cold and the poster sat there — a photograph, then a jump to
     motion, every few seconds. Pulling the next one an interval early
     means it is decoded before it is needed and the poster underneath
     never gets its chance to show.
 
     Hidden rather than absent: a browser will not preload what is not in
     the document, and display:none lets it skip the fetch entirely. */}
 <video
   key={`preload-${(activeSlide + 1) % SLIDES.length}`}
   src={SLIDES[(activeSlide + 1) % SLIDES.length].url}
   preload="auto"
   muted
   playsInline
   aria-hidden="true"
   tabIndex={-1}
   className="pointer-events-none absolute h-px w-px opacity-0"
 />
 
 {/* Legibility scrims — bottom-heavy, teal-tinted */}
 <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-ink-950/25" />
 <div className="absolute inset-0 bg-gradient-to-r from-ink-950/65 via-ink-950/10 to-transparent" />
 </div>

 {/* Monumental Devanagari ghost word */}
 <AnimatePresence mode="wait">
 <motion.span
 key={`ghost-${slide.id}`}
 initial={{ opacity: 0, x: 60 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -40 }}
 transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
 aria-hidden="true"
 className="absolute top-[12%] right-[-2%] z-10 font-devanagari italic select-none pointer-events-none leading-none text-[clamp(7rem,22vw,20rem)] text-transparent"
 style={{ WebkitTextStroke: "1.5px rgba(212, 168, 67, 0.28)" }}
 >
 {slide.ghost}
 </motion.span>
 </AnimatePresence>

 {/* Editorial stack */}
 <motion.div
 style={{ opacity: contentOpacity }}
 className="relative z-20 w-full max-w-[1440px] mx-auto px-6 md:px-14 pb-32 md:pb-24"
 >
 <AnimatePresence mode="wait">
 <motion.div
 key={slide.id}
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0, transition: { duration: 0.35 } }}
 transition={{ duration: 0.4 }}
 className="max-w-3xl"
 >
 <motion.p
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.7, delay: 0.2 }}
 className="flex items-center gap-3 mb-6"
 >
 <span className="route-dot" />
 <span className="eyebrow">{slide.coords}</span>
 <span className="route-line w-12 hidden sm:inline-block" />
 <span className="eyebrow-muted">{slide.place}</span>
 </motion.p>

 {/* Word-staggered display headline */}
 <motion.h1
 variants={headlineContainer}
 initial="hidden"
 animate="show"
 className="font-display text-ivory text-5xl sm:text-6xl md:text-[5.5rem] font-light leading-[1.02] tracking-tight mb-7"
 >
 {slide.title.split(" ").map((word, i) => (<motion.span key={i} variants={headlineWord} className="inline-block mr-[0.28em]">
 {word}
 </motion.span>
 ))}
 <br className="hidden sm:block" />
 {slide.titleAccent.split(" ").map((word, i) => (<motion.span
 key={`a-${i}`}
 variants={headlineWord}
 className="inline-block mr-[0.28em] font-medium italic text-saffron-bright"
 >
 {word}
 </motion.span>
 ))}
 </motion.h1>

 <motion.p
 initial={{ opacity: 0, y: 24 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.8, delay: 0.7 }}
 className="text-ivory-muted text-base md:text-lg leading-relaxed max-w-xl mb-10"
 >
 {slide.description}
 </motion.p>

 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.8, delay: 0.85 }}
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

 {/* Chapter rail — thumbnails on desktop */}
 <div className="absolute bottom-8 right-6 md:right-14 z-30">
 {/* Desktop: thumbnail cards */}
 <div className="hidden md:flex items-end gap-3">
 {SLIDES.map((s, idx) => (<button
 key={s.id}
 onClick={() => setActiveSlide(idx)}
 aria-label={`Show ${s.place}`}
 aria-current={activeSlide === idx ? "true" : undefined}
 className={`group relative rounded-xl overflow-hidden border transition-all duration-500 ${
 activeSlide === idx
 ? "w-24 h-16 border-saffron/70 shadow-glow"
 : "w-16 h-12 border-white/15 opacity-55 hover:opacity-90 hover:border-white/40"
 }`}
 >
 <img src={s.thumb} alt="" className="absolute inset-0 w-full h-full object-cover" />
 <span className="absolute inset-0 bg-gradient-to-t from-ink-950/80 to-transparent" />
 <span
 className={`absolute bottom-1 left-1.5 font-data text-[8px] tracking-[0.18em] uppercase ${
 activeSlide === idx ? "text-saffron" : "text-ivory/70"
 }`}
 >
 {String(idx + 1).padStart(2, "0")}
 </span>
 {/* Auto-advance progress */}
 {activeSlide === idx && (<motion.span
 key={`bar-${activeSlide}`}
 initial={{ scaleX: 0 }}
 animate={{ scaleX: 1 }}
 transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
 className="absolute bottom-0 inset-x-0 h-[2px] bg-saffron origin-left"
 />
 )}
 </button>
 ))}
 </div>
 {/* Mobile: compact progress bars */}
 <div className="flex md:hidden items-center gap-2">
 {SLIDES.map((s, idx) => (<button
 key={s.id}
 onClick={() => setActiveSlide(idx)}
 aria-label={`Show ${s.place}`}
 className="relative block w-8 h-[3px] bg-white/20 overflow-hidden rounded-full"
 >
 {activeSlide === idx && (<motion.span
 key={`mbar-${activeSlide}`}
 initial={{ scaleX: 0 }}
 animate={{ scaleX: 1 }}
 transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
 className="absolute inset-0 bg-saffron origin-left"
 />
 )}
 </button>
 ))}
 </div>
 </div>

 </section>

 {/* ======================= STATS BAND ======================= */}
 <section className="border-b border-white/[0.06] bg-ink-900">
 <div className="max-w-[1440px] mx-auto px-6 md:px-14 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
 {STATS.map((stat, i) => (<motion.div
 key={stat.label}
 initial={{ opacity: 0, y: 16 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.6, delay: i * 0.08 }}
 className="flex items-baseline gap-3"
 >
 <CountUp
 value={stat.num}
 suffix={stat.suffix}
 className="font-data text-3xl md:text-[2.6rem] font-medium text-ivory tabular-nums leading-none"
 />
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
 lede="Everything a trip across India needs — previews, planning, tracking, documents, and a community of travelers — in one place."
 className="mb-16"
 />

 <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[210px] md:auto-rows-[236px] gap-4">
 {TOOLKIT.map((tool, i) => (<motion.button
 key={tool.id}
 initial={{ opacity: 0, y: 34, scale: 0.98 }}
 whileInView={{ opacity: 1, y: 0, scale: 1 }}
 viewport={{ once: true, margin: "-60px" }}
 transition={{ duration: 0.75, delay: (i % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
 whileHover={{ y: -6 }}
 onClick={() => onPageChange(tool.id)}
 className={`group relative overflow-hidden rounded-[22px] border border-white/[0.08] text-left transition-[border-color,box-shadow] duration-500 hover:border-saffron/45 hover:shadow-[0_28px_70px_-20px_rgba(0,0,0,0.85),0_0_46px_-16px_rgba(212,168,67,0.5)] ${tool.span || ""}`}
 >
 {/* Photograph */}
 <img
 src={tool.image}
 alt=""
 loading="lazy"
 style={tool.focus ? { objectPosition: tool.focus } : undefined}
 className="absolute inset-0 w-full h-full object-cover opacity-[0.78] saturate-[1.05] contrast-[1.06] group-hover:opacity-95 group-hover:scale-[1.06] transition-all duration-[900ms] ease-out"
 />
 {/* Legibility scrim — deep at the base, clear at the top */}
 <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/55 to-ink-950/5" />
 {/* Warm tint that blooms on hover */}
 <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-t from-saffron/18 via-transparent to-transparent" />
 {/* Light sweep across the card on hover */}
 <span
 aria-hidden="true"
 className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:translate-x-[420%] transition-all duration-[1100ms] ease-out pointer-events-none"
 style={{ background: "linear-gradient(90deg, transparent, rgba(245,242,234,0.14), transparent)" }}
 />
 {/* Hairline inner edge for depth */}
 <span className="absolute inset-0 rounded-[22px] ring-1 ring-inset ring-white/[0.07] pointer-events-none" aria-hidden="true" />

 <div className="relative h-full p-6 md:p-7 flex flex-col justify-between">
 <span className="w-11 h-11 rounded-2xl bg-ink-950/55 backdrop-blur-xl border border-white/[0.12] flex items-center justify-center shadow-lg group-hover:border-saffron/50 group-hover:bg-ink-950/70 transition-colors duration-500">
 <tool.icon size={18} className="text-saffron" />
 </span>
 <span>
 <span className="flex items-center gap-2 font-display text-[1.45rem] md:text-[1.6rem] font-medium text-ivory mb-1.5 tracking-tight">
 {tool.title}
 <ArrowUpRight
 size={17}
 className="text-saffron opacity-0 -translate-x-1.5 translate-y-1.5 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-400"
 />
 </span>
 <span className="block text-[13.5px] text-ivory/70 group-hover:text-ivory/90 leading-snug max-w-[38ch] transition-colors duration-500">
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
 lede="Step inside the Taj before you ever queue for a ticket. Every heritage site on SafarX can be walked through in full 360° — so you know exactly what you are booking."
 />
 <button
 onClick={() => onPageChange("360tour")}
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
 <video
 autoPlay
 muted
 loop
 playsInline
 preload="auto"
 className="absolute inset-0 w-full h-full object-cover video-crisp"
 /* A different angle on the Taj from the one the hero opens with.
    Both were the same three-second clip, so scrolling this page played
    it to you twice. This is a low, close view where the hero is a wide
    one — and 1080p at 3.8MB rather than 4K at 9.3, since the card is a
    16:10 panel in a column and never runs full width. */
 src="https://videos.pexels.com/video-files/19705899/19705899-hd_1920_1080_30fps.mp4"
 />
 <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-transparent to-ink-950/25" />

 {/* Live badge */}
 <div className="absolute top-4 left-4 glass-panel !rounded-full px-4 py-2 flex items-center gap-2.5 pointer-events-none">
 <span className="route-dot animate-pulse" />
 <span className="font-data text-[11px] tracking-[0.2em] uppercase text-ivory/85">
 360° · Taj Mahal, Agra
 </span>
 </div>

 {/* Enter-the-tour affordance */}
 <button
 onClick={() => openTour("taj-mahal")}
 className="group/tour absolute inset-0 flex items-center justify-center"
 aria-label="Open the Taj Mahal 360° tour"
 >
 <span className="w-20 h-20 rounded-full bg-ink-950/55 backdrop-blur-xl border border-saffron/40 flex items-center justify-center transition-all duration-500 group-hover/tour:scale-110 group-hover/tour:bg-saffron group-hover/tour:border-saffron">
 <Camera size={26} className="text-saffron transition-colors duration-500 group-hover/tour:text-ink-950" />
 </span>
 </button>

 <div className="absolute bottom-4 inset-x-4 flex items-center justify-between pointer-events-none">
 <span className="font-data text-[10px] tracking-[0.22em] uppercase text-ivory/55">
 14 tours available
 </span>
 <span className="font-data text-[10px] tracking-[0.22em] uppercase text-saffron">
 Tap to enter
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
 lede="Before you go, on the way, and once you are on the ground — follow the road."
 className="mb-20"
 />

 <JourneyRoad stages={STAGES} onPageChange={onPageChange} />
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
 {DESTINATIONS.map((dest, i) => (<motion.button
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

 {/* ======================= VOICES ======================= */}
 <section className="pt-24 md:pt-32 pb-14 md:pb-16 bg-ink-900 border-y border-white/[0.06] overflow-hidden">
 <div className="max-w-[1440px] mx-auto px-6 md:px-14">
 <SectionHeading
 eyebrow="Voices from the road"
 title="Trips that actually happened"
 className="mb-16"
 />
 </div>

 {/* Two rows drifting in opposite directions */}
 {[0, 1].map((row) => (<div
 key={row}
 className="relative flex overflow-hidden mb-4 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]"
 >
 <motion.div
 className="flex gap-4 shrink-0"
 animate={{ x: row === 0 ? ["0%", "-50%"] : ["-50%", "0%"] }}
 transition={{ duration: row === 0 ? 46 : 54, repeat: Infinity, ease: "linear" }}
 >
 {[...VOICES, ...VOICES].map((v, i) => (<figure
 key={`${row}-${i}`}
 className="w-[330px] md:w-[400px] shrink-0 rounded-2xl border border-white/[0.07] bg-ink-800/70 backdrop-blur-sm p-6 hover:border-saffron/30 transition-colors duration-500"
 >
 <span className="route-dot mb-4 block" aria-hidden="true" />
 <blockquote className="font-display text-[1.05rem] md:text-[1.15rem] text-ivory/90 leading-relaxed mb-5">
 “{v.quote}”
 </blockquote>
 <figcaption className="flex items-center gap-3">
 <span className="text-[13px] font-semibold text-ivory">{v.name}</span>
 <span className="route-line w-6" aria-hidden="true" />
 <span className="font-data text-[10px] uppercase tracking-[0.2em] text-ivory-faint">
 {v.place}
 </span>
 </figcaption>
 </figure>
 ))}
 </motion.div>
 </div>
 ))}
 </section>

 {/* ======================= CTA ======================= */}
 <section className="relative py-28 md:py-40 overflow-hidden">
 <div className="absolute inset-0">
 <video
 autoPlay
 muted
 loop
 playsInline
 className="w-full h-full object-cover video-crisp"
 src="/media/taj-window.mp4"
 />
 <div className="absolute inset-0 bg-ink-950/58" />
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

 {/* Under the buttons, not beside them: those are for people who already
     know what they want. */}
 <AskSrishti onAsk={onAskSrishti} className="mt-7" />
 </div>
 </section>
 </div>
 );
};

export default HomePage;
