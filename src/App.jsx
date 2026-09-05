import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Toast from "./components/ui/Toast";
import { useUser, useAuth } from "@clerk/clerk-react";
import { Scroll } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SrishtiLauncher from "./components/srishti/SrishtiLauncher";
import SrishtiPanel from "./components/srishti/SrishtiPanel";
import LoadingScreen from "./components/LoadingScreen";

// IMPORT ANONYMOUS SUPABASE CLIENT (NO Clerk interference)
import { supabase } from "./lib/supabaseClient";

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";
import LoadingSpinner from "./components/LoadingSpinner";
import GlobalMusicPlayer from "./components/GlobalMusicPlayer";


// Components

// Pages
import HomePage from "./pages/HomePage";
import AuthPage, { SsoCallback } from "./pages/AuthPage";
import WorldToursPage from "./pages/WorldToursPage";

import HiddenGemsPage from "./pages/HiddenGemsPage";

import AgentPage from "./pages/AgentPage/App";
import MapPage from "./pages/MapPage";
import UploadPage from "./pages/UploadPage";

import FlightTrackerPage from "./pages/FlightTrackerPage";
import ItineraryPlanner from "./pages/ItineraryPlanner";
import PreTripChecklist from './components/PreTripChecklist';
import DocumentVault from './pages/DocumentVault';
import SocialPage from './pages/SocialPage';

import TravelDiary from './pages/TravelDiaryPage/TravelDiary';
import DiaryViewer from './pages/TravelDiaryPage/DiaryViewer';
import SafetyHubPage from './pages/SafetyHubPage';
import FloatingSOSWidget from './components/safety/FloatingSOSWidget';

import { createOrUpdateUser } from "./services/userService";

// Route configuration for easy management
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
 social: "/social",
 diary: "/diary",
 safety: "/safety",
};

// Page titles for SEO
const PAGE_TITLES = {
 "/": "SafarX — Discover Incredible India",
 "/360tour": "VR Previews — SafarX",
 "/itinerary": "Trip Planning — SafarX",
 "/gems": "Hidden Gems — SafarX",
 "/chat": "SafarX Agent",
 "/map": "Local Insights — SafarX",
 "/checklist": "Pre-trip Checklist — SafarX",
 "/upload": "Share a Hidden Gem — SafarX",
 "/tracker": "Track a Flight or Train — SafarX",
 "/vault": "Document Vault — SafarX",
 "/social": "Safar Groups — SafarX",
 "/diary": "AI Cinematic Reel & Digital Diary — SafarX",
 "/safety": "Tourist Safety Hub & Live SOS — SafarX",
};

// Routes that open with full-bleed media, so they must not be top-padded.
/* Arriving at one of these means something already sent you there; a
 three-second title sequence in front of it is an interruption. */
const INTRO_SKIP_PATHS = new Set(["/signin", "/signup", "/sso-callback"]);
const INTRO_PLAYED = "safarx:intro-played";

const FULL_BLEED_PAGES = new Set([
 "home", "tracker", "360tour", "gems", "itinerary", "map",
  // The diary opens on a full-bleed hero that runs under the floating nav.
  "diary",
]);

// Helper function to get current page ID from path
function getPageIdFromPath(pathname) {
 if (pathname === "/") return "home";
 // Remove leading slash and return
 return pathname.slice(1);
}

// Inner app component
export default function App() {
 const navigate = useNavigate();
 const location = useLocation();
 const [searchQuery, setSearchQuery] = useState("");
 const [selectedItem, setSelectedItem] = useState(null);
 /* The boot sequence is an arrival, and you only arrive once. It used to run
 on every full document load, so signing in played it twice — once landing
 on /signin, again on the way back — and three times through Google, which
 also passes through /sso-callback. It now plays once per browser session,
 and never on a page you were sent to rather than chose. */
 const [isMainLoading, setIsMainLoading] = useState(() => {
 if (typeof window === "undefined") return false;
 if (INTRO_SKIP_PATHS.has(window.location.pathname)) return false;
 try {
 return !window.sessionStorage.getItem(INTRO_PLAYED);
 } catch {
 return true; // private browsing: show it, rather than never showing it
 }
 });

 const { user: clerkUser, isSignedIn, isLoaded } = useUser();
 const { getToken } = useAuth();

 // Get current page ID from URL path
 const currentPage = getPageIdFromPath(location.pathname);

 // FIXED: Only sync user data (NO auth token mixing)
 useEffect(() => {
 if (isLoaded && isSignedIn && clerkUser) {
 createOrUpdateUser(clerkUser)
 .then(() => {
 console.log("Clerk user profile synced (data only)");
 })
 .catch((err) => {
 console.warn("User sync failed (non-critical):", err.message);
 });
 }
 }, [isLoaded, isSignedIn, clerkUser]);

 // FIXED: NO Supabase auth sync - Uploads use ANONYMOUS client
 useEffect(() => {
 if (isSignedIn) {
 console.log("Clerk signed in:",
 clerkUser?.emailAddresses[0]?.emailAddress
 );
 console.log("Hidden gems uploads remain 100% ANONYMOUS (separate client)"
 );
 } else {
 console.log("Clerk signed out - Uploads still work anonymously");
 }
 }, [isSignedIn, clerkUser]);

 // Update document title based on current route
 useEffect(() => {
 document.title = PAGE_TITLES[location.pathname] || "SafarX — Discover Incredible India";
 }, [location.pathname]);

 // Navigation handler - now uses router
 const handlePageChange = (page, item = null) => {
 const path = ROUTES[page] || "/";
 setSelectedItem(item);
 navigate(path);
 // Instant, not smooth: gliding the old page upward while the next one
 // mounts reads as the layout lurching rather than as a scroll.
 window.scrollTo({ top: 0, behavior: "instant" });
 };

 // The header navigates with the router directly, which would leave a stale
 // selectedItem behind — so clicking "VR Tours" re-opened the last tour you
 // viewed. Drop the selection whenever the route changes on its own.
 const itemPathRef = React.useRef(location.pathname);
 useEffect(() => {
 if (location.pathname !== itemPathRef.current) {
 itemPathRef.current = location.pathname;
 setSelectedItem((current) => (current === null ? current : null));
 }
 }, [location.pathname]);

 // Common props for pages
 const pageProps = {
 user: clerkUser,
 isSignedIn,
 searchQuery,
 onSearchChange: setSearchQuery,
 onPageChange: handlePageChange,
 selectedItem,
 /* So a page can hand someone to Srishti without making them find the
    floating launcher in the corner. */
 onAskSrishti: () => setSrishtiOpen(true),
 };

 // Cinematic boot sequence runs ~3.8s — never block the app on auth loading
 useEffect(() => {
 if (!isMainLoading) return undefined;
 const timer = setTimeout(() => {
 setIsMainLoading(false);
 try {
 window.sessionStorage.setItem(INTRO_PLAYED, "1");
 } catch {
 /* private browsing — the intro simply plays again next load */
 }
 }, 3800);
 return () => clearTimeout(timer);
 }, [isMainLoading]);

 const [srishtiOpen, setSrishtiOpen] = useState(false);

 // Hide header/footer on certain pages
 /* Signing in is its own room: no nav, no footer, and no Srishti hovering
 over the password field. */
 const AUTH_PAGES = new Set(["signin", "signup", "sso-callback"]);
 const hideHeaderFooter = currentPage === "chat" || AUTH_PAGES.has(currentPage);

 return (<AnimatePresence mode="wait">
 {isMainLoading ? (<LoadingScreen key="loader" />
 ) : (<motion.div
 key="main-content"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.8 }}
 className="min-h-screen bg-ink-950"
 >
 {!hideHeaderFooter && <GlobalMusicPlayer />}

 {/* Srishti travels with you rather than living on a page of her own —
 she can be asked from anywhere, and steps aside to the corner when
 she opens something for you. Hidden inside the agent, which is
 already a conversation. */}
 <SrishtiLauncher onOpen={() => setSrishtiOpen(true)} hidden={srishtiOpen || hideHeaderFooter} />
 <SrishtiPanel
 open={srishtiOpen}
 onClose={() => setSrishtiOpen(false)}
 onPageChange={handlePageChange}
 />
 {/* Hide Header on Salahkar & Story pages */}
 {!hideHeaderFooter && (<Header
 currentPage={currentPage}
 onPageChange={handlePageChange}
 searchQuery={searchQuery}
 onSearchChange={setSearchQuery}
 />
 )}
 {/* Adjust main padding based on current page */}
 {/* Pages whose first element is full-bleed media run to the top of
 the viewport and sit under the floating navbar. Padding them
 leaves a dead ink strip between the nav and the hero. */}
 <main
 className={
 hideHeaderFooter || FULL_BLEED_PAGES.has(currentPage)
 ? "min-h-screen"
 : "min-h-screen pt-24"
 }
 >
 <Routes>
 <Route path="/" element={<HomePage {...pageProps} />} />
 <Route path="/360tour" element={<WorldToursPage {...pageProps} />} />
 <Route path="/gems" element={<HiddenGemsPage {...pageProps} />} />
 <Route path="/itinerary" element={<ItineraryPlanner {...pageProps} />} />
 <Route path="/chat" element={<AgentPage {...pageProps} />} />
 <Route path="/map" element={<MapPage {...pageProps} />} />
 <Route path="/checklist" element={<PreTripChecklist />} />
 <Route path="/upload" element={<UploadPage {...pageProps} />} />
 <Route path="/tracker" element={<FlightTrackerPage />} />
 <Route path="/vault" element={<DocumentVault {...pageProps} />} />
 {/* 360° Explorer was a thinner second copy of VR Tours. Old links
 and bookmarks land on the real thing rather than falling through to
 the catch-all, which would have dropped them on the home page. */}
 <Route path="/360view" element={<Navigate to="/360tour" replace />} />
 <Route path="/social" element={<SocialPage onBack={() => handlePageChange("home")} />} />
 <Route path="/signin" element={<AuthPage mode="signin" />} />
 <Route path="/signup" element={<AuthPage mode="signup" />} />
 {/* Where Google sends the traveller back to. Clerk finishes the
 handshake and forwards them on. */}
 <Route path="/sso-callback" element={<SsoCallback />} />
 <Route path="/diary" element={<TravelDiary {...pageProps} />} />
 <Route path="/diary/:id" element={<DiaryViewer {...pageProps} />} />
 <Route path="/diary/view" element={<DiaryViewer {...pageProps} />} />
 <Route path="/safety" element={<SafetyHubPage {...pageProps} />} />
 {/* Fallback to home for unknown routes */}
 <Route path="*" element={<HomePage {...pageProps} />} />
 </Routes>
 </main>
 {/* Not in that room either. It mounts outside <Routes>, so it was the one
 piece of chrome the auth pages never excluded — and on the sign-in screen
 it sat squarely on top of the vista's strapline. */}
 {!AUTH_PAGES.has(currentPage) && (
 <FloatingSOSWidget defaultDestination="Current Location" />
 )}
 {/* Every toast in the app renders through our own component, so the
     ~130 existing toast.success / toast.error calls did not have to be
     touched to be redressed. */}
 <Toaster
 position="top-right"
 gutter={10}
 containerStyle={{ top: 88, right: 20 }}
 toastOptions={{ duration: 4000 }}
 >
 {(t) => <Toast t={t} />}
 </Toaster>
 {!hideHeaderFooter && (<Footer onPageChange={handlePageChange} />
 )}


 </motion.div>
 )}
 </AnimatePresence>
 );
}
