import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Globe,
  MapPin,
  Users,
  CheckCircle,
  Upload,
  ChevronDown,
  Film,
  Sparkles,
  ShieldAlert,
  Plane,
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import AccountMenu from "./AccountMenu";
import { createOrUpdateUser } from "../services/userService";

const ROUTES = {
  home: "/",
  "360tour": "/360tour",
  gems: "/gems",
  itinerary: "/itinerary",
  chat: "/chat",
  map: "/map",
  checklist: "/checklist",
  upload: "/upload",
  tracker: "/tracker",
  vault: "/vault",
  "360view": "/360view",
  social: "/social",
  diary: "/diary",
  safety: "/safety",
};

function getPageIdFromPath(pathname) {
  if (pathname === "/") return "home";
  return pathname.slice(1);
}

const PRIMARY_LINKS = [
  { id: "home", label: "Home" },
  { id: "360tour", label: "VR Tours" },
  { id: "itinerary", label: "Plan a Trip" },
  { id: "safety", label: "Safety & SOS" },
  { id: "diary", label: "Digital Diary" },
  { id: "gems", label: "Hidden Gems" },
  { id: "tracker", label: "Flights" },
  { id: "vault", label: "Vault" },
  { id: "chat", label: "SafarX Agent" },
];

const MORE_LINKS = [
  { id: "safety", label: "Safety Hub & SOS", icon: ShieldAlert, desc: "Crowd forecasts, 24x7 ERSS 112 & emergency SOS" },
  { id: "diary", label: "Digital Diary", icon: Film, desc: "Turn photos into cinematic reels & share" },
  { id: "tracker", label: "Flight Tracker", icon: Plane, desc: "Follow any flight live" },
  { id: "360view", label: "360° Explorer", icon: Globe, desc: "Street-level India views" },
  { id: "social", label: "Safar Groups", icon: Users, desc: "Travel with your people" },
  { id: "checklist", label: "Trip Checklist", icon: CheckCircle, desc: "Pack with confidence" },
  { id: "map", label: "Local Insights", icon: MapPin, desc: "Navigate like a local" },
  { id: "upload", label: "Share a Gem", icon: Upload, desc: "Add your secret spot" },
];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const lastScrollY = useRef(0);
  const moreRef = useRef(null);
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();

  const currentPage = getPageIdFromPath(location.pathname);

  const handleNavigation = (pageId) => {
    navigate(ROUTES[pageId] || "/");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsMenuOpen(false);
    setShowMore(false);
  };

  // Hide on scroll down, reveal on scroll up
  const handleScroll = useCallback(() => {
    const y = window.scrollY;
    setAtTop(y < 24);

    const delta = y - lastScrollY.current;
    // Ignore micro-jitter
    if (Math.abs(delta) > 6) {
      if (delta > 0 && y > 140) {
        setIsHidden(true);
        setShowMore(false);
      } else if (delta < 0) {
        setIsHidden(false);
      }
      lastScrollY.current = y;
    }
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Close the "More" menu on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setShowMore(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (isLoaded && isSignedIn && clerkUser) {
      createOrUpdateUser(clerkUser);
    }
  }, [isLoaded, isSignedIn, clerkUser]);

  const isMoreActive = MORE_LINKS.some((l) => l.id === currentPage);

  return (
    <>
      {/* Floating capsule bar */}
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: isHidden && !isMenuOpen ? -104 : 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 inset-x-0 z-[60] flex justify-center pointer-events-none px-4 pt-4"
      >
        <div
          className={`pointer-events-auto flex items-center gap-1 md:gap-2 rounded-full pl-5 pr-2 h-14 max-w-full transition-all duration-500 border ${
            atTop && !isMenuOpen
              ? "bg-ink-950/55 border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
              : "bg-ink-950/85 border-white/[0.1] shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
          } backdrop-blur-2xl`}
        >
          {/* Wordmark */}
          <button
            onClick={() => handleNavigation("home")}
            className="flex items-baseline gap-0.5 group shrink-0 mr-2 md:mr-4"
            aria-label="SafarX home"
          >
            <span className="font-display italic font-medium text-[1.3rem] text-ivory tracking-tight">
              Safar
            </span>
            <span className="font-data text-[1.1rem] text-saffron tracking-[0.04em] font-bold">
              X
            </span>
          </button>

          <span className="hidden lg:block w-px h-5 bg-white/10 mr-1" aria-hidden="true" />

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Primary">
            {PRIMARY_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavigation(link.id)}
                className={`relative px-3 py-2 rounded-full text-[12.5px] font-semibold tracking-wide whitespace-nowrap transition-colors duration-300 ${
                  currentPage === link.id
                    ? "text-ink-950"
                    : "text-ivory/70 hover:text-ivory hover:bg-white/[0.06]"
                }`}
                aria-current={currentPage === link.id ? "page" : undefined}
              >
                {currentPage === link.id && (
                  <motion.span
                    layoutId="nav-capsule"
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-saffron-bright to-saffron shadow-[0_4px_16px_rgba(212,168,67,0.4)]"
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </button>
            ))}

            {/* More dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setShowMore((v) => !v)}
                aria-expanded={showMore}
                aria-haspopup="menu"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[12.5px] font-semibold tracking-wide transition-colors duration-300 ${
                  isMoreActive || showMore
                    ? "text-saffron bg-white/[0.05]"
                    : "text-ivory/70 hover:text-ivory hover:bg-white/[0.06]"
                }`}
              >
                More
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${showMore ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {showMore && (
                  <motion.div
                    initial={{ opacity: 0, y: 14, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 14, scale: 0.96 }}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                    role="menu"
                    className="absolute right-0 top-full mt-4 w-80 rounded-3xl bg-ink-900/95 backdrop-blur-2xl border border-white/[0.1] shadow-[0_24px_64px_rgba(0,0,0,0.6)] overflow-hidden p-2"
                  >
                    {MORE_LINKS.map((item) => (
                      <button
                        key={item.id}
                        role="menuitem"
                        onClick={() => handleNavigation(item.id)}
                        className={`w-full flex items-center gap-3.5 p-3 rounded-2xl text-left transition-colors duration-200 group ${
                          currentPage === item.id ? "bg-white/[0.06]" : "hover:bg-white/[0.05]"
                        }`}
                      >
                        <span className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.06] flex items-center justify-center shrink-0 group-hover:border-saffron/40 transition-colors">
                          <item.icon size={16} className="text-ivory/80 group-hover:text-saffron transition-colors" />
                        </span>
                        <span>
                          <span className="block text-[13px] font-semibold text-ivory">{item.label}</span>
                          <span className="block text-[11px] text-ivory-faint">{item.desc}</span>
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          <span className="hidden md:block w-px h-5 bg-white/10 mx-1" aria-hidden="true" />

          {/* Auth */}
          <div className="hidden md:flex items-center gap-1.5">
            {isSignedIn && clerkUser ? (
              <div className="px-2">
                <AccountMenu onNavigate={handleNavigation} />
              </div>
            ) : (
              isLoaded && (
                <>
                  <button
                    onClick={() => navigate("/signin")}
                    className="px-3.5 py-2 rounded-full text-[13px] font-semibold text-ivory/75 hover:text-ivory hover:bg-white/[0.06] transition-colors"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => navigate("/signup")}
                    className="px-5 py-2 rounded-full text-[13px] font-bold text-ink-950 bg-gradient-to-br from-saffron-bright to-saffron hover:shadow-glow transition-shadow duration-300"
                  >
                    Get started
                  </button>
                </>
              )
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMenuOpen((v) => !v)}
            className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center text-ivory hover:bg-white/[0.07] transition-colors ml-auto"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden fixed inset-0 bg-ink-950/97 backdrop-blur-2xl z-[55] overflow-y-auto"
          >
            <nav className="px-6 pt-24 pb-10 flex flex-col gap-1" aria-label="Mobile">
              {PRIMARY_LINKS.map((link, idx) => (
                <motion.button
                  key={link.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => handleNavigation(link.id)}
                  className={`flex items-center justify-between py-4 border-b border-white/[0.06] text-left ${
                    currentPage === link.id ? "text-saffron" : "text-ivory"
                  }`}
                >
                  <span className="font-display text-2xl font-medium">{link.label}</span>
                  {currentPage === link.id && <span className="route-dot" />}
                </motion.button>
              ))}

              <p className="eyebrow-muted mt-8 mb-3">Toolkit</p>
              <div className="grid grid-cols-2 gap-2">
                {MORE_LINKS.map((item, idx) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.04 }}
                    onClick={() => handleNavigation(item.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-colors ${
                      currentPage === item.id
                        ? "border-saffron/40 bg-white/[0.05]"
                        : "border-white/[0.07] hover:bg-white/[0.04]"
                    }`}
                  >
                    <item.icon size={16} className="text-saffron shrink-0" />
                    <span className="text-[13px] font-semibold text-ivory">{item.label}</span>
                  </motion.button>
                ))}
              </div>

              {!isSignedIn && isLoaded && (
                <div className="flex gap-3 mt-8">
                  <button onClick={() => { setIsMenuOpen(false); navigate("/signin"); }} className="btn-ghost flex-1">
                    Sign in
                  </button>
                  <button onClick={() => { setIsMenuOpen(false); navigate("/signup"); }} className="btn-primary flex-1">
                    Get started
                  </button>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
