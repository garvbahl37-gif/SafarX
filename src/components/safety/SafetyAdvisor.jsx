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
    try {
      const coords = await getCurrentDeviceLocation();
      const geocoded = await reverseGeocodeCoords(coords.latitude, coords.longitude);
      setDeviceLocation({ ...coords, ...geocoded });
      const detectedName = geocoded.city ? `${geocoded.city}, ${geocoded.state}` : geocoded.state;
      setCurrentDestination(geocoded.state || geocoded.city);
      setReviewForm((prev) => ({ ...prev, location: detectedName }));
      toast.success(`Location synced: ${detectedName}`);
    } catch (err) {
      toast.error("Could not access GPS. Check browser location permissions.");
    } finally {
      setLocLoading(false);
    }
  };

  const handleUseCurrentLocForReview = async () => {
    setLocLoading(true);
    try {
      const coords = await getCurrentDeviceLocation();
      const geocoded = await reverseGeocodeCoords(coords.latitude, coords.longitude);
      const locStr = geocoded.city ? `${geocoded.city}, ${geocoded.state}` : geocoded.state;
      setReviewForm((prev) => ({ ...prev, location: locStr }));
      toast.success(`Review location set to: ${locStr}`, { icon: "📍" });
    } catch (e) {
      toast.error("Could not fetch GPS. Please enter place name manually.");
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

  return (
    <div className="bg-ink-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl text-ivory space-y-6">
      {/* Header & 3-Phase Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>360° Tourist Safety Intelligence & Protective Layer</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold font-display text-ivory flex items-center gap-2">
            Safety Measures for <span className="text-sand-200">{safetyData.state}</span>
          </h3>
          <p className="text-xs text-sand-400">
            Official emergency response, verified women safety scores, and proactive measures before, during & after travel
          </p>
        </div>

        {/* Sync with Current GPS */}
        <button
          onClick={handleFetchCurrentGPS}
          disabled={locLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-ink-950 hover:bg-ink-800 border border-white/15 text-xs text-sand-300 hover:text-white transition shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${locLoading ? "animate-spin text-emerald-400" : ""}`} />
          <span>{locLoading ? "Detecting GPS…" : "Sync with Live GPS"}</span>
        </button>
      </div>

      {/* 3-Phase Lifecycle Tabs */}
      <div className="grid grid-cols-3 gap-2 bg-ink-950/80 p-1.5 rounded-2xl border border-white/10 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab("before")}
          className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === "before"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
              : "text-sand-400 hover:text-white"
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px]">1</span>
          <span>Before Travel</span>
        </button>

        <button
          onClick={() => setActiveTab("during")}
          className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === "during"
              ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg"
              : "text-sand-400 hover:text-white"
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px]">2</span>
          <span>During Travel (Live SOS)</span>
        </button>

        <button
          onClick={() => setActiveTab("after")}
          className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === "after"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
              : "text-sand-400 hover:text-white"
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px]">3</span>
          <span>After Travel</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* PHASE 1: BEFORE TRAVEL (Planning & Preparation) */}
      {/* ======================================================== */}
      {activeTab === "before" && (
        <div className="space-y-6">
          {/* Safety Scores Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-ink-950/80 border border-white/10 rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-400 mb-1">
                <Heart className="w-4 h-4" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Women Safety</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black font-display text-ivory">
                {safetyData.scores.womenSafety}<span className="text-xs text-sand-500 font-sans">/10</span>
              </p>
              <p className="text-[11px] text-emerald-300 mt-0.5">High Confidence</p>
            </div>

            <div className="bg-ink-950/80 border border-white/10 rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-indigo-400 mb-1">
                <Moon className="w-4 h-4" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Night Transit</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black font-display text-ivory">
                {safetyData.scores.nightSafety}<span className="text-xs text-sand-500 font-sans">/10</span>
              </p>
              <p className="text-[11px] text-indigo-300 mt-0.5">Safe Corridors</p>
            </div>

            <div className="bg-ink-950/80 border border-white/10 rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
                <Car className="w-4 h-4" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Transport Safety</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black font-display text-ivory">
                {safetyData.scores.transportSafety}<span className="text-xs text-sand-500 font-sans">/10</span>
              </p>
              <p className="text-[11px] text-amber-300 mt-0.5">Verified Fleets</p>
            </div>

            <div className="bg-ink-950/80 border border-white/10 rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-rose-400 mb-1">
                <Cross className="w-4 h-4" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Medical Access</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black font-display text-ivory">
                {safetyData.scores.medical}<span className="text-xs text-sand-500 font-sans">/10</span>
              </p>
              <p className="text-[11px] text-rose-300 mt-0.5">Civil & 108 Fleet</p>
            </div>
          </div>

          {/* Pre-Trip Mandatory Safety Measures */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sand-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Pre-Trip Safety Protocol & Documentation Check
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {safetyData.preTripMeasures.map((item, idx) => {
                const isDone = !!checkedItems[`pretrip_${safetyData.state}_${idx}`];
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleChecklist(`pretrip_${safetyData.state}_${idx}`)}
                    className={`text-left p-4 rounded-2xl border transition flex items-start gap-3 group ${
                      isDone
                        ? "bg-blue-950/20 border-blue-500/30 text-sand-400"
                        : "bg-ink-950/80 border-white/10 hover:border-white/20 text-ivory"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-blue-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-sand-500 group-hover:text-blue-300" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/10 text-sand-300">
                          {item.tag}
                        </span>
                        <p className={`text-xs font-bold ${isDone ? "line-through text-sand-500" : "text-ivory"}`}>
                          {item.title}
                        </p>
                      </div>
                      <p className="text-xs text-sand-400 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* State Emergency Contacts Snapshot */}
          <div className="bg-ink-950/90 border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-sand-300 flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                Verified Government Helplines for {safetyData.state}
              </h4>
              <span className="text-[11px] text-sand-500">ERSS 112 Active</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <a
                href={getCleanTelUri(stateContacts.police)}
                className="bg-ink-900 hover:bg-ink-800 border border-white/10 hover:border-red-500/40 p-3 rounded-xl transition flex flex-col justify-between group"
              >
                <p className="text-sand-400 text-[11px] flex items-center justify-between">
                  <span>State Police Control</span>
                  <PhoneCall className="w-3.5 h-3.5 text-red-400 group-hover:scale-110 transition" />
                </p>
                <p className="font-bold font-mono text-ivory mt-1">{stateContacts.police}</p>
              </a>

              <a
                href={getCleanTelUri(stateContacts.womenHelpline)}
                className="bg-ink-900 hover:bg-ink-800 border border-white/10 hover:border-rose-500/40 p-3 rounded-xl transition flex flex-col justify-between group"
              >
                <p className="text-sand-400 text-[11px] flex items-center justify-between">
                  <span>Women Helpline (WCD)</span>
                  <PhoneCall className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition" />
                </p>
                <p className="font-bold font-mono text-rose-300 mt-1">{stateContacts.womenHelpline}</p>
              </a>

              <a
                href={getCleanTelUri(stateContacts.touristPolice)}
                className="bg-ink-900 hover:bg-ink-800 border border-white/10 hover:border-amber-500/40 p-3 rounded-xl transition flex flex-col justify-between group"
              >
                <p className="text-sand-400 text-[11px] flex items-center justify-between">
                  <span>Tourist Police / Mitra</span>
                  <PhoneCall className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition" />
                </p>
                <p className="font-bold font-mono text-amber-300 mt-1 truncate">{stateContacts.touristPolice}</p>
              </a>
            </div>
            {stateContacts.stateNotes && (
              <p className="text-xs text-sand-400 bg-white/5 p-3 rounded-xl border border-white/5">
                💡 <strong className="text-sand-200">State Advisory:</strong> {stateContacts.stateNotes}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PHASE 2: DURING TRAVEL (Live GPS & Emergency SOS) */}
      {/* ======================================================== */}
      {activeTab === "during" && (
        <div className="space-y-6">
          {/* Big SOS Trigger Banner */}
          <div className="bg-gradient-to-r from-red-950/60 via-rose-900/40 to-ink-950 border-2 border-red-500/40 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-900/50">
                <ShieldAlert className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xl font-bold font-display text-white">
                  Active Tourist SOS Beacon
                </h4>
                <p className="text-xs text-red-200 mt-0.5 max-w-md">
                  Broadcasts your live GPS coordinates, battery status, and customized distress message directly to family via WhatsApp and triggers siren.
                </p>
              </div>
            </div>

            <button
              onClick={onOpenSOS}
              className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-red-900/50 transition-transform active:scale-95 shrink-0"
            >
              <ShieldAlert className="w-5 h-5" />
              Trigger SOS Beacon
            </button>
          </div>

          {/* During Travel Guidelines */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {safetyData.duringTripMeasures.map((item, idx) => (
              <div
                key={idx}
                className="bg-ink-950/80 border border-white/10 rounded-2xl p-4 space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300">
                    {item.tag}
                  </span>
                  <p className="text-xs font-bold text-ivory">{item.title}</p>
                </div>
                <p className="text-xs text-sand-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Direct Rapid Call Grid */}
          <div className="bg-ink-950/80 border border-white/10 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sand-300 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              One-Tap Direct Govt Dispatch Links
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <a
                href="tel:112"
                className="p-3 bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 rounded-xl text-center font-bold text-red-300 hover:text-white transition flex items-center justify-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5 text-red-400" />
                Dial 112 (ERSS)
              </a>
              <a
                href="tel:1091"
                className="p-3 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/30 rounded-xl text-center font-bold text-rose-300 hover:text-white transition flex items-center justify-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
                Dial 1091 (Women)
              </a>
              <a
                href="tel:1363"
                className="p-3 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/30 rounded-xl text-center font-bold text-amber-300 hover:text-white transition flex items-center justify-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                Dial 1363 (Tourist)
              </a>
              <a
                href="tel:108"
                className="p-3 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 rounded-xl text-center font-bold text-emerald-300 hover:text-white transition flex items-center justify-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                Dial 108 (Ambulance)
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PHASE 3: AFTER TRAVEL (Community Ratings & Reviews) */}
      {/* ======================================================== */}
      {activeTab === "after" && (
        <div className="space-y-6">
          {/* Post Trip Measures Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {safetyData.postTripMeasures.map((item, idx) => (
              <div
                key={idx}
                className="bg-ink-950/80 border border-white/10 rounded-2xl p-4 space-y-1.5"
              >
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300">
                  {item.tag}
                </span>
                <p className="text-xs font-bold text-ivory">{item.title}</p>
                <p className="text-xs text-sand-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Submit Safety Feedback Form */}
          <form
            onSubmit={handleSubmitReview}
            className="bg-ink-950/80 border border-white/10 rounded-2xl p-5 space-y-4"
          >
            <h4 className="text-sm font-bold text-ivory flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              Rate & Review Destination Safety
            </h4>

            {/* Custom Location Field with GPS Autofill */}
            <div className="space-y-1.5">
              <label className="block text-[11px] text-sand-300 font-semibold uppercase tracking-wider">
                Location / Monument / City Visited
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sand-400" />
                  <input
                    type="text"
                    value={reviewForm.location}
                    onChange={(e) => setReviewForm({ ...reviewForm, location: e.target.value })}
                    placeholder="Enter place name (e.g. Fort Kochi, Taj Mahal, Calangute Beach, Udaipur)..."
                    className="w-full bg-ink-900 border border-white/15 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2 text-xs text-ivory focus:outline-none transition"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleUseCurrentLocForReview}
                  disabled={locLoading}
                  title="Detect & Use Current GPS Location"
                  className="px-3.5 py-2 bg-ink-900 hover:bg-ink-800 border border-white/15 hover:border-emerald-500/40 rounded-xl text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition shrink-0 cursor-pointer"
                >
                  <LocateFixed className={`w-3.5 h-3.5 ${locLoading ? "animate-spin" : ""}`} />
                  <span className="text-[11px] font-semibold">Use GPS</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-sand-400 mb-1 font-semibold">
                  Overall Safety Rating (1-5)
                </label>
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                  className="w-full bg-ink-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-ivory focus:outline-none focus:border-sand-400"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5/5) Exceptionally Safe</option>
                  <option value={4}>⭐⭐⭐⭐ (4/5) Very Safe</option>
                  <option value={3}>⭐⭐⭐ (3/5) Moderate Safety</option>
                  <option value={2}>⭐⭐ (2/5) Needs Caution</option>
                  <option value={1}>⭐ (1/5) Unsafe / Challenging</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-sand-400 mb-1 font-semibold">
                  Women Safety Comfort
                </label>
                <select
                  value={reviewForm.womenSafetyRating}
                  onChange={(e) => setReviewForm({ ...reviewForm, womenSafetyRating: Number(e.target.value) })}
                  className="w-full bg-ink-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-ivory focus:outline-none focus:border-sand-400"
                >
                  <option value={5}>High (Pink Police / Respectful)</option>
                  <option value={4}>Good (Safe with Normal Caution)</option>
                  <option value={3}>Moderate (Avoid Solo Late Nights)</option>
                  <option value={2}>Challenging (Frequent Harassment)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-sand-400 mb-1 font-semibold">
                  Did you encounter any touts/scams?
                </label>
                <select
                  value={reviewForm.scamEncountered}
                  onChange={(e) => setReviewForm({ ...reviewForm, scamEncountered: e.target.value })}
                  className="w-full bg-ink-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-ivory focus:outline-none focus:border-sand-400"
                >
                  <option value="No">No - Smooth & Verified</option>
                  <option value="Minor">Minor - High souvenir haggling</option>
                  <option value="Yes">Yes - Fake ticket / guide touts</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-sand-400 mb-1 font-semibold">
                Your Safety Experience & Community Tips
              </label>
              <textarea
                rows={2}
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                placeholder="Share advice on lighting, reliable cabs, friendly police booths, or areas to avoid at night…"
                className="w-full bg-ink-900 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-ivory placeholder-sand-600 focus:outline-none focus:border-sand-400"
              />
            </div>

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-5 rounded-xl flex items-center gap-2 transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Publish Safety Review
            </button>
          </form>

          {/* Community Verified Safety Feed */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sand-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Community Safety Insights & Verified Reports
            </h4>

            <div className="space-y-2.5">
              {submittedReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-ink-950/80 border border-white/10 rounded-2xl p-4 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ivory">{rev.user}</span>
                      <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {rev.dest}
                      </span>
                    </div>
                    <span className="text-sand-500 text-[11px]">{rev.date}</span>
                  </div>
                  <p className="text-xs text-sand-300 leading-relaxed">{rev.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
