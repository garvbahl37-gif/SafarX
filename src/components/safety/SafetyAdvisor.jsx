// src/components/safety/SafetyAdvisor.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/clerk-react";
import {
 ShieldCheck,
 ShieldAlert,
 MapPin,
 PhoneCall,
 CheckCircle2,
 Circle,
 AlertTriangle,
 Heart,
 Moon,
 Car,
 Cross,
 UserCheck,
 Radio,
 Star,
 Send,
 Sparkles,
 RefreshCw,
 ExternalLink,
 ChevronDown,
 LocateFixed,
 Navigation
} from "lucide-react";
import toast from "react-hot-toast";
import {
 get360SafetyMeasures,
 getCurrentDeviceLocation,
 reverseGeocodeCoords,
 getCleanTelUri
} from "../../services/safetyService";
import { getEmergencyContactsForState } from "../../data/emergencyContacts";

const CHECKLIST_STORAGE_KEY = "safarx_safety_checklist_state";

export default function SafetyAdvisor({
 selectedDestination = "Rajasthan",
 onOpenSOS = null
}) {
 const { user } = useUser();
 const [activeTab, setActiveTab] = useState("before"); // 'before' | 'during' | 'after'
 const [currentDestination, setCurrentDestination] = useState(selectedDestination);
 const [safetyData, setSafetyData] = useState(null);
 const [deviceLocation, setDeviceLocation] = useState(null);
 const [locLoading, setLocLoading] = useState(false);
 const [checkedItems, setCheckedItems] = useState({});
  
 // Post-trip Review State
 const [reviewForm, setReviewForm] = useState({
 location: selectedDestination || "Rajasthan",
 rating: 5,
 womenSafetyRating: 5,
 nightLighting: "Good",
 scamEncountered: "No",
 comment: ""
 });
 const [submittedReviews, setSubmittedReviews] = useState([
 {
 id: 1,
 user: "Ananya S. (Solo Traveler)",
 dest: "Kerala (Fort Kochi)",
 rating: 5,
 womenSafetyRating: 5,
 text: "Felt very secure walking around Fort Kochi even around 10 PM. Pink Police patrol was visible at the beach walkway.",
 date: "2 days ago"
 },
 {
 id: 2,
 user: "Priya & Rohit",
 dest: "Rajasthan (Udaipur)",
 rating: 4.8,
 womenSafetyRating: 4.9,
 text: "Paryatan Mitra assistance near City Palace was great. Authorized guides with government ID badges made a big difference.",
 date: "5 days ago"
 }
 ]);

 // Load checklist progress from localStorage
 useEffect(() => {
 try {
 const storageKey = user?.id ? `${CHECKLIST_STORAGE_KEY}_${user.id}` : CHECKLIST_STORAGE_KEY;
 const saved = localStorage.getItem(storageKey);
 if (saved) setCheckedItems(JSON.parse(saved));
 } catch (e) {}
 }, [user?.id]);

 // Update safety data on destination change
 useEffect(() => {
 if (selectedDestination) {
 setCurrentDestination(selectedDestination);
 setReviewForm((prev) => ({ ...prev, location: selectedDestination }));
 }
 }, [selectedDestination]);

 useEffect(() => {
 if (currentDestination) {
 const data = get360SafetyMeasures(currentDestination);
 setSafetyData(data);
 }
 }, [currentDestination]);

 const toggleChecklist = (id) => {
 const next = { ...checkedItems, [id]: !checkedItems[id] };
 setCheckedItems(next);
 const storageKey = user?.id ? `${CHECKLIST_STORAGE_KEY}_${user.id}` : CHECKLIST_STORAGE_KEY;
 localStorage.setItem(storageKey, JSON.stringify(next));
 };

 const handleFetchCurrentGPS = async () => {
 setLocLoading(true);
 /* Finding you and naming where you are are two requests that fail for
    unrelated reasons. Keeping them in one try meant a rate-limited
    geocoder threw away a working GPS fix and reported itself as a
    location error. */
 let coords;
 try {
 coords = await getCurrentDeviceLocation();
 } catch (err) {
 // The helper already distinguishes a block, a timeout and an OS-level
 // failure; repeating one guess for all three helps nobody.
 toast.error(err.message || "Could not get your location.");
 setLocLoading(false);
 return;
 }

 setDeviceLocation(coords);
 try {
 const geocoded = await reverseGeocodeCoords(coords.latitude, coords.longitude);
 setDeviceLocation({ ...coords, ...geocoded });
 if (!geocoded.resolved) {
 toast("Found you, but the place name lookup is unavailable right now.");
 return;
 }
 const detectedName = geocoded.city ? `${geocoded.city}, ${geocoded.state}` : geocoded.state;
 setCurrentDestination(geocoded.state || geocoded.city);
 setReviewForm((prev) => ({ ...prev, location: detectedName }));
 toast.success(`Location synced: ${detectedName}`);
 } catch {
 toast("Found you, but the place name lookup is unavailable right now.");
 } finally {
 setLocLoading(false);
 }
 };

 const handleUseCurrentLocForReview = async () => {
 setLocLoading(true);
 let coords;
 try {
 coords = await getCurrentDeviceLocation();
 } catch (e) {
 toast.error(e.message || "Could not get your location. Type the place name instead.");
 setLocLoading(false);
 return;
 }
 try {
 const geocoded = await reverseGeocodeCoords(coords.latitude, coords.longitude);
 if (!geocoded.resolved) {
 toast("Found you, but could not name the area — type the place name instead.");
 return;
 }
 const locStr = geocoded.city ? `${geocoded.city}, ${geocoded.state}` : geocoded.state;
 setReviewForm((prev) => ({ ...prev, location: locStr }));
 toast.success(`Review location set to: ${locStr}`);
 } catch {
 toast("Found you, but could not name the area — type the place name instead.");
 } finally {
 setLocLoading(false);
 }
 };

 const handleSubmitReview = (e) => {
 e.preventDefault();
 if (!reviewForm.comment.trim()) {
 toast.error("Please add a short comment about your safety experience");
 return;
 }

 const userName = user?.fullName || user?.firstName || (user?.primaryEmailAddress?.emailAddress ? user.primaryEmailAddress.emailAddress.split("@")[0] : "Verified Traveler");
 const targetPlace = reviewForm.location.trim() || currentDestination;

 const newRev = {
 id: Date.now(),
 user: userName,
 dest: targetPlace,
 rating: reviewForm.rating,
 womenSafetyRating: reviewForm.womenSafetyRating,
 text: reviewForm.comment,
 date: "Just now"
 };

 setSubmittedReviews([newRev, ...submittedReviews]);
 setReviewForm({ location: targetPlace, rating: 5, womenSafetyRating: 5, nightLighting: "Good", scamEncountered: "No", comment: "" });
 toast.success(`Thank you! Safety review published for ${targetPlace}`);
 };

 if (!safetyData) return null;

 const stateContacts = getEmergencyContactsForState(safetyData.state);

 return (<div className="bg-ink-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl text-ivory space-y-6">
 {/* Header & 3-Phase Navigation */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
 <div>
 <div className="flex items-center gap-2 text-xs font-data uppercase tracking-widest text-horizon-bright mb-1">
 <ShieldCheck className="w-4 h-4" />
 <span>360° Tourist Safety Intelligence & Protective Layer</span>
 </div>
 <h3 className="text-2xl sm:text-3xl font-display font-light text-ivory flex items-center gap-2">
 Safety Measures for <span className="text-ivory">{safetyData.state}</span>
 </h3>
 <p className="text-xs text-ivory-muted">
 Official emergency response, verified women safety scores, and proactive measures before, during & after travel
 </p>
 </div>

 {/* Sync with Current GPS */}
 <button
 onClick={handleFetchCurrentGPS}
 disabled={locLoading}
 className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-ink-950 hover:bg-ink-800 border border-white/15 text-xs text-ivory-muted hover:text-ivory transition shrink-0"
 >
 <RefreshCw className={`w-3.5 h-3.5 ${locLoading ? "animate-spin text-horizon-bright" : ""}`} />
 <span>{locLoading ? "Detecting GPS…" : "Sync with Live GPS"}</span>
 </button>
 </div>

 {/* 3-Phase Lifecycle Tabs */}
 <div className="grid grid-cols-3 gap-2 bg-ink-950/80 p-1.5 rounded-2xl border border-white/10 text-xs sm:text-sm font-semibold">
 <button
 onClick={() => setActiveTab("before")}
 className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 ${
 activeTab === "before"
 ? "bg-gradient-to-r from-horizon to-horizon text-ivory shadow-lg"
 : "text-ivory-muted hover:text-ivory"
 }`}
 >
 <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px]">1</span>
 <span>Before Travel</span>
 </button>

 <button
 onClick={() => setActiveTab("during")}
 className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 ${
 activeTab === "during"
 ? "bg-gradient-to-r from-danger to-danger text-ivory shadow-lg"
 : "text-ivory-muted hover:text-ivory"
 }`}
 >
 <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px]">2</span>
 <span>During Travel (Live SOS)</span>
 </button>

 <button
 onClick={() => setActiveTab("after")}
 className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 ${
 activeTab === "after"
 ? "bg-gradient-to-r from-horizon to-horizon text-ivory shadow-lg"
 : "text-ivory-muted hover:text-ivory"
 }`}
 >
 <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px]">3</span>
 <span>After Travel</span>
 </button>
 </div>

 {/* ======================================================== */}
 {/* PHASE 1: BEFORE TRAVEL (Planning & Preparation) */}
 {/* ======================================================== */}
 {activeTab === "before" && (<div className="space-y-6">
 {/* Safety Scores Grid */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 <div className="bg-ink-950/80 border border-white/10 rounded-2xl p-4 text-center">
 <div className="flex items-center justify-center gap-1 text-horizon-bright mb-1">
 <Heart className="w-4 h-4" />
 <span className="font-data text-[10px] font-medium uppercase tracking-[0.18em]">Women Safety</span>
 </div>
 <p className="text-2xl sm:text-3xl font-medium font-display text-ivory">
 {safetyData.scores.womenSafety}<span className="text-xs text-ivory-faint font-sans">/10</span>
 </p>
 <p className="text-[11px] text-horizon-bright mt-0.5">High Confidence</p>
 </div>

 <div className="bg-ink-950/80 border border-white/10 rounded-2xl p-4 text-center">
 <div className="flex items-center justify-center gap-1 text-horizon-bright mb-1">
 <Moon className="w-4 h-4" />
 <span className="font-data text-[10px] font-medium uppercase tracking-[0.18em]">Night Transit</span>
 </div>
 <p className="text-2xl sm:text-3xl font-medium font-display text-ivory">
 {safetyData.scores.nightSafety}<span className="text-xs text-ivory-faint font-sans">/10</span>
 </p>
 <p className="text-[11px] text-horizon-bright mt-0.5">Safe Corridors</p>
 </div>

 <div className="bg-ink-950/80 border border-white/10 rounded-2xl p-4 text-center">
 <div className="flex items-center justify-center gap-1 text-saffron-bright mb-1">
 <Car className="w-4 h-4" />
 <span className="font-data text-[10px] font-medium uppercase tracking-[0.18em]">Transport Safety</span>
 </div>
 <p className="text-2xl sm:text-3xl font-medium font-display text-ivory">
 {safetyData.scores.transportSafety}<span className="text-xs text-ivory-faint font-sans">/10</span>
 </p>
 <p className="text-[11px] text-saffron-bright mt-0.5">Verified Fleets</p>
 </div>

 <div className="bg-ink-950/80 border border-white/10 rounded-2xl p-4 text-center">
 <div className="flex items-center justify-center gap-1 text-danger-bright mb-1">
 <Cross className="w-4 h-4" />
 <span className="font-data text-[10px] font-medium uppercase tracking-[0.18em]">Medical Access</span>
 </div>
 <p className="text-2xl sm:text-3xl font-medium font-display text-ivory">
 {safetyData.scores.medical}<span className="text-xs text-ivory-faint font-sans">/10</span>
 </p>
 <p className="text-[11px] text-danger-bright mt-0.5">Civil & 108 Fleet</p>
 </div>
 </div>

 {/* Pre-Trip Mandatory Safety Measures */}
 <div className="space-y-3">
 <h4 className="font-data text-[11px] font-medium uppercase tracking-[0.18em] text-ivory-muted flex items-center gap-2">
 <ShieldCheck className="w-4 h-4 text-horizon-bright" />
 Pre-Trip Safety Protocol & Documentation Check
 </h4>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 {safetyData.preTripMeasures.map((item, idx) => {
 const isDone = !!checkedItems[`pretrip_${safetyData.state}_${idx}`];
 return (<button
 key={idx}
 type="button"
 onClick={() => toggleChecklist(`pretrip_${safetyData.state}_${idx}`)}
 className={`text-left p-4 rounded-2xl border transition flex items-start gap-3 group ${
 isDone
 ? "bg-horizon-deep/20 border-horizon/30 text-ivory-muted"
 : "bg-ink-950/80 border-white/10 hover:border-white/20 text-ivory"
 }`}
 >
 <div className="mt-0.5 shrink-0">
 {isDone ? (<CheckCircle2 className="w-5 h-5 text-horizon-bright" />
 ) : (<Circle className="w-5 h-5 text-ivory-faint group-hover:text-horizon-bright" />
 )}
 </div>
 <div>
 <div className="flex items-center gap-2">
 <span className="text-[10px] uppercase font-data px-2 py-0.5 rounded-full bg-white/10 text-ivory-muted">
 {item.tag}
 </span>
 <p className={`text-xs font-bold ${isDone ? "line-through text-ivory-faint" : "text-ivory"}`}>
 {item.title}
 </p>
 </div>
 <p className="text-xs text-ivory-muted mt-1 leading-relaxed">{item.desc}</p>
 </div>
 </button>
 );
 })}
 </div>
 </div>

 {/* State Emergency Contacts Snapshot */}
 <div className="bg-ink-950/90 border border-white/10 rounded-2xl p-5 space-y-3">
 <div className="flex items-center justify-between">
 <h4 className="font-data text-[11px] font-medium uppercase tracking-[0.18em] text-ivory-muted flex items-center gap-2">
 <Radio className="w-4 h-4 text-horizon-bright" />
 Verified Government Helplines for {safetyData.state}
 </h4>
 <span className="text-[11px] text-ivory-faint">ERSS 112 Active</span>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
 <a
 href={getCleanTelUri(stateContacts.police)}
 className="bg-ink-900 hover:bg-ink-800 border border-white/10 hover:border-danger/40 p-3 rounded-xl transition flex flex-col justify-between group"
 >
 <p className="text-ivory-muted text-[11px] flex items-center justify-between">
 <span>State Police Control</span>
 <PhoneCall className="w-3.5 h-3.5 text-danger-bright group-hover:scale-110 transition" />
 </p>
 <p className="font-bold font-data text-ivory mt-1">{stateContacts.police}</p>
 </a>

 <a
 href={getCleanTelUri(stateContacts.womenHelpline)}
 className="bg-ink-900 hover:bg-ink-800 border border-white/10 hover:border-danger/40 p-3 rounded-xl transition flex flex-col justify-between group"
 >
 <p className="text-ivory-muted text-[11px] flex items-center justify-between">
 <span>Women Helpline (WCD)</span>
 <PhoneCall className="w-3.5 h-3.5 text-danger-bright group-hover:scale-110 transition" />
 </p>
 <p className="font-bold font-data text-danger-bright mt-1">{stateContacts.womenHelpline}</p>
 </a>

 <a
 href={getCleanTelUri(stateContacts.touristPolice)}
 className="bg-ink-900 hover:bg-ink-800 border border-white/10 hover:border-saffron/40 p-3 rounded-xl transition flex flex-col justify-between group"
 >
 <p className="text-ivory-muted text-[11px] flex items-center justify-between">
 <span>Tourist Police / Mitra</span>
 <PhoneCall className="w-3.5 h-3.5 text-saffron-bright group-hover:scale-110 transition" />
 </p>
 <p className="font-bold font-data text-saffron-bright mt-1 truncate">{stateContacts.touristPolice}</p>
 </a>
 </div>
 {stateContacts.stateNotes && (<p className="text-xs text-ivory-muted bg-white/5 p-3 rounded-xl border border-white/5">
 <strong className="text-ivory">State Advisory:</strong> {stateContacts.stateNotes}
 </p>
 )}
 </div>
 </div>
 )}

 {/* ======================================================== */}
 {/* PHASE 2: DURING TRAVEL (Live GPS & Emergency SOS) */}
 {/* ======================================================== */}
 {activeTab === "during" && (<div className="space-y-6">
 {/* Big SOS Trigger Banner */}
 <div className="bg-gradient-to-r from-danger-950/60 via-danger-900/40 to-ink-950 border-2 border-danger/40 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-2xl">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-danger text-ivory flex items-center justify-center shrink-0 shadow-lg shadow-danger-900/50">
 <ShieldAlert className="w-8 h-8 animate-pulse" />
 </div>
 <div>
 <h4 className="text-xl font-display text-ivory">
 Active Tourist SOS Beacon
 </h4>
 <p className="text-xs text-danger-bright mt-0.5 max-w-md">
 Broadcasts your live GPS coordinates, battery status, and customized distress message directly to family via WhatsApp and triggers siren.
 </p>
 </div>
 </div>

 <button
 onClick={onOpenSOS}
 className="w-full sm:w-auto bg-gradient-to-r from-danger to-danger hover:from-danger hover:to-danger text-ivory font-bold text-sm py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-danger-900/50 transition-transform active:scale-95 shrink-0"
 >
 <ShieldAlert className="w-5 h-5" />
 Trigger SOS Beacon
 </button>
 </div>

 {/* During Travel Guidelines */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 {safetyData.duringTripMeasures.map((item, idx) => (<div
 key={idx}
 className="bg-ink-950/80 border border-white/10 rounded-2xl p-4 space-y-1.5"
 >
 <div className="flex items-center gap-2">
 <span className="text-[10px] uppercase font-data px-2 py-0.5 rounded-full bg-danger/15 text-danger-bright">
 {item.tag}
 </span>
 <p className="text-xs font-bold text-ivory">{item.title}</p>
 </div>
 <p className="text-xs text-ivory-muted leading-relaxed">{item.desc}</p>
 </div>
 ))}
 </div>

 {/* Direct Rapid Call Grid */}
 <div className="bg-ink-950/80 border border-white/10 rounded-2xl p-5 space-y-3">
 <h4 className="font-data text-[11px] font-medium uppercase tracking-[0.18em] text-ivory-muted flex items-center gap-2">
 <PhoneCall className="w-4 h-4 text-horizon-bright" />
 One-Tap Direct Govt Dispatch Links
 </h4>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
 <a
 href="tel:112"
 className="p-3 bg-danger-950/40 hover:bg-danger-900/50 border border-danger/30 rounded-xl text-center font-bold text-danger-bright hover:text-ivory transition flex items-center justify-center gap-1.5"
 >
 <PhoneCall className="w-3.5 h-3.5 text-danger-bright" />
 Dial 112 (ERSS)
 </a>
 <a
 href="tel:1091"
 className="p-3 bg-danger-950/40 hover:bg-danger-900/50 border border-danger/30 rounded-xl text-center font-bold text-danger-bright hover:text-ivory transition flex items-center justify-center gap-1.5"
 >
 <PhoneCall className="w-3.5 h-3.5 text-danger-bright" />
 Dial 1091 (Women)
 </a>
 <a
 href="tel:1363"
 className="p-3 bg-saffron-900/40 hover:bg-saffron-900/50 border border-saffron/30 rounded-xl text-center font-bold text-saffron-bright hover:text-ivory transition flex items-center justify-center gap-1.5"
 >
 <PhoneCall className="w-3.5 h-3.5 text-saffron-bright" />
 Dial 1363 (Tourist)
 </a>
 <a
 href="tel:108"
 className="p-3 bg-horizon-deep/40 hover:bg-horizon-deep/50 border border-horizon/30 rounded-xl text-center font-bold text-horizon-bright hover:text-ivory transition flex items-center justify-center gap-1.5"
 >
 <PhoneCall className="w-3.5 h-3.5 text-horizon-bright" />
 Dial 108 (Ambulance)
 </a>
 </div>
 </div>
 </div>
 )}

 {/* ======================================================== */}
 {/* PHASE 3: AFTER TRAVEL (Community Ratings & Reviews) */}
 {/* ======================================================== */}
 {activeTab === "after" && (<div className="space-y-6">
 {/* Post Trip Measures Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 {safetyData.postTripMeasures.map((item, idx) => (<div
 key={idx}
 className="bg-ink-950/80 border border-white/10 rounded-2xl p-4 space-y-1.5"
 >
 <span className="text-[10px] uppercase font-data px-2 py-0.5 rounded-full bg-horizon/15 text-horizon-bright">
 {item.tag}
 </span>
 <p className="text-xs font-bold text-ivory">{item.title}</p>
 <p className="text-xs text-ivory-muted leading-relaxed">{item.desc}</p>
 </div>
 ))}
 </div>

 {/* Submit Safety Feedback Form */}
 <form
 onSubmit={handleSubmitReview}
 className="rounded-[26px] border border-white/[0.08] bg-ink-950/70 p-6 sm:p-8 space-y-7"
 >
 <div className="mb-1">
 <p className="eyebrow mb-2">Community</p>
 <h4 className="font-display text-[1.35rem] font-medium leading-snug text-ivory">
 Rate the safety of somewhere you have been
 </h4>
 <p className="mt-1.5 font-sans text-[13px] leading-relaxed text-ivory-muted">
 Other travellers read these before they book. Say what you actually found.
 </p>
 </div>

 {/* Custom Location Field with GPS Autofill */}
 <div className="space-y-1.5">
 <label className="mb-2 block font-data text-[10px] font-medium uppercase tracking-[0.18em] text-ivory-muted">
 Location / Monument / City Visited
 </label>
 <div className="flex items-center gap-2">
 <div className="relative flex-1">
 <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ivory-muted" />
 <input
 type="text"
 value={reviewForm.location}
 onChange={(e) => setReviewForm({ ...reviewForm, location: e.target.value })}
 placeholder="Enter place name (e.g. Fort Kochi, Taj Mahal, Calangute Beach, Udaipur)..."
 className="w-full bg-ink-900 border border-white/15 focus:border-horizon rounded-xl pl-9 pr-3 py-2 text-xs text-ivory focus:outline-none transition"
 />
 </div>
 <button
 type="button"
 onClick={handleUseCurrentLocForReview}
 disabled={locLoading}
 title="Detect & Use Current GPS Location"
 className="px-3.5 py-2 bg-ink-900 hover:bg-ink-800 border border-white/15 hover:border-horizon/40 rounded-xl text-xs text-horizon-bright hover:text-horizon-bright flex items-center gap-1.5 transition shrink-0 cursor-pointer"
 >
 <LocateFixed className={`w-3.5 h-3.5 ${locLoading ? "animate-spin" : ""}`} />
 <span className="text-[11px] font-semibold">Use GPS</span>
 </button>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div>
 <label className="mb-2 block font-data text-[10px] font-medium uppercase tracking-[0.18em] text-ivory-muted">
 Overall Safety Rating (1-5)
 </label>
 <select
 value={reviewForm.rating}
 onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
 className="w-full bg-ink-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-ivory focus:outline-none focus:border-ivory-muted"
 >
 <option value={5}>5 / 5 — Exceptionally safe</option>
 <option value={4}>4 / 5 — Very safe</option>
 <option value={3}>3 / 5 — Moderate</option>
 <option value={2}>2 / 5 — Needs caution</option>
 <option value={1}>1 / 5 — Unsafe</option>
 </select>
 </div>

 <div>
 <label className="mb-2 block font-data text-[10px] font-medium uppercase tracking-[0.18em] text-ivory-muted">
 Women Safety Comfort
 </label>
 <select
 value={reviewForm.womenSafetyRating}
 onChange={(e) => setReviewForm({ ...reviewForm, womenSafetyRating: Number(e.target.value) })}
 className="w-full bg-ink-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-ivory focus:outline-none focus:border-ivory-muted"
 >
 <option value={5}>High (Pink Police / Respectful)</option>
 <option value={4}>Good (Safe with Normal Caution)</option>
 <option value={3}>Moderate (Avoid Solo Late Nights)</option>
 <option value={2}>Challenging (Frequent Harassment)</option>
 </select>
 </div>

 <div>
 <label className="mb-2 block font-data text-[10px] font-medium uppercase tracking-[0.18em] text-ivory-muted">
 Did you encounter any touts/scams?
 </label>
 <select
 value={reviewForm.scamEncountered}
 onChange={(e) => setReviewForm({ ...reviewForm, scamEncountered: e.target.value })}
 className="w-full bg-ink-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-ivory focus:outline-none focus:border-ivory-muted"
 >
 <option value="No">No - Smooth & Verified</option>
 <option value="Minor">Minor - High souvenir haggling</option>
 <option value="Yes">Yes - Fake ticket / guide touts</option>
 </select>
 </div>
 </div>

 <div>
 <label className="mb-2 block font-data text-[10px] font-medium uppercase tracking-[0.18em] text-ivory-muted">
 Your Safety Experience & Community Tips
 </label>
 <textarea
 rows={2}
 value={reviewForm.comment}
 onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
 placeholder="Share advice on lighting, reliable cabs, friendly police booths, or areas to avoid at night…"
 className="w-full bg-ink-900 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-ivory placeholder-ivory-faint focus:outline-none focus:border-ivory-muted"
 />
 </div>

 <button
 type="submit"
 className="bg-horizon hover:bg-horizon text-ivory font-bold text-xs py-2.5 px-5 rounded-xl flex items-center gap-2 transition cursor-pointer"
 >
 <Send className="w-4 h-4" />
 Publish Safety Review
 </button>
 </form>

 {/* Community Verified Safety Feed */}
 <div className="space-y-3">
 <div className="mb-5">
 <p className="eyebrow mb-2">From other travellers</p>
 <h4 className="font-display text-[1.35rem] font-medium leading-snug text-ivory">
 What people found on the ground
 </h4>
 </div>

 <div className="space-y-2.5">
 {submittedReviews.map((rev) => (<div
 key={rev.id}
 className="bg-ink-950/80 border border-white/10 rounded-2xl p-4 space-y-1.5"
 >
 <div className="flex items-center justify-between text-xs">
 <div className="flex items-center gap-2">
 <span className="font-bold text-ivory">{rev.user}</span>
 <span className="text-horizon-bright bg-horizon/10 border border-horizon/20 px-2 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1">
 <MapPin className="w-3 h-3" />
 {rev.dest}
 </span>
 </div>
 <span className="text-ivory-faint text-[11px]">{rev.date}</span>
 </div>
 <p className="text-xs text-ivory-muted leading-relaxed">{rev.text}</p>
 </div>
 ))}
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
