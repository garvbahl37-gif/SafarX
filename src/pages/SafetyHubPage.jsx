// src/pages/SafetyHubPage.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  MapPin,
  Calendar,
  PhoneCall,
  Share2,
  Sparkles,
  Radio,
  Building2,
  TrendingDown,
  Lock,
  ChevronRight,
  Search,
  LocateFixed
} from "lucide-react";
import toast from "react-hot-toast";
import CrowdPredictionCard from "../components/safety/CrowdPredictionCard";
import SafetyAdvisor from "../components/safety/SafetyAdvisor";
import EmergencyDirectory from "../components/safety/EmergencyDirectory";
import SOSBeaconModal from "../components/safety/SOSBeaconModal";
import { getCurrentDeviceLocation, reverseGeocodeCoords } from "../services/safetyService";

const POPULAR_DESTINATIONS = [
  "Goa",
  "Rajasthan",
  "Kerala",
  "Himachal Pradesh",
  "Ladakh",
  "Uttarakhand",
  "Tamil Nadu",
  "Karnataka",
  "Uttar Pradesh",
  "Meghalaya",
  "Sikkim",
  "Delhi"
];

export default function SafetyHubPage() {
  const [selectedDestination, setSelectedDestination] = useState("Rajasthan");
  const [customInput, setCustomInput] = useState("Rajasthan");
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState("advisor"); // 'advisor' | 'crowd' | 'directory'
  const [gpsLocation, setGpsLocation] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  useEffect(() => {
    // Attempt background high accuracy GPS lock
    handleAutoLocate();
  }, []);

  const handleAutoLocate = async () => {
    setGpsLoading(true);
    try {
      const coords = await getCurrentDeviceLocation();
      const geocoded = await reverseGeocodeCoords(coords.latitude, coords.longitude);
      setGpsLocation({ ...coords, ...geocoded });
      if (geocoded.state) {
        setSelectedDestination(geocoded.state);
        setCustomInput(geocoded.state);
      }
    } catch (e) {
      console.log("Auto-location optional fallback active");
    } finally {
      setGpsLoading(false);
    }
  };

  const handleSyncCurrentLocation = async () => {
    setGpsLoading(true);
    toast.loading("Detecting your live GPS location…", { id: "gps-sync" });
    try {
      const coords = await getCurrentDeviceLocation();
      const geocoded = await reverseGeocodeCoords(coords.latitude, coords.longitude);
      setGpsLocation({ ...coords, ...geocoded });
      const locationName = geocoded.city ? `${geocoded.city}, ${geocoded.state}` : (geocoded.state || "Delhi");
      setSelectedDestination(locationName);
      setCustomInput(locationName);
      toast.dismiss("gps-sync");
      toast.success(`Safety feed updated to your live location: ${locationName}`, { icon: "📍" });
    } catch (err) {
      toast.dismiss("gps-sync");
      toast.error("Could not access GPS. Please check browser location permissions.");
    } finally {
      setGpsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-950 text-ivory pt-24 pb-20 px-4 sm:px-6 md:px-12 relative overflow-hidden">
      {/* Background Ambience Glows */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        {/* ======================================================== */}
        {/* HERO SECTION */}
        {/* ======================================================== */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/10 pb-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono uppercase tracking-widest">
              <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
              <span>SafarX Tourist Safety & Crowd Intelligence Layer</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-bold tracking-tight text-ivory">
              Travel with Confidence, <br />
              <span className="bg-gradient-to-r from-red-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
                Guarded Everywhere.
              </span>
            </h1>

            <p className="text-sand-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              Authentic multi-factor crowd forecasting to avoid suffocating queues, paired with verified 24x7 government emergency response, women safety ratings, and one-tap live WhatsApp location broadcasting.
            </p>

            {/* Destination Search & Quick Selector */}
            <div className="pt-2 space-y-3">
              <label className="block text-[11px] uppercase tracking-wider text-sand-400 font-semibold">
                Active Destination / Region / Monument
              </label>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-sand-400 pointer-events-none" />
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => {
                      setCustomInput(e.target.value);
                      if (e.target.value.trim().length > 1) {
                        setSelectedDestination(e.target.value.trim());
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && customInput.trim()) {
                        setSelectedDestination(customInput.trim());
                        toast.success(`Showing safety feed for ${customInput.trim()}`);
                      }
                    }}
                    placeholder="Search any place (e.g. Varanasi, Hampi, Agra, Shimla)..."
                    className="w-full bg-ink-900/90 border border-white/15 focus:border-red-500/80 rounded-2xl pl-10 pr-8 py-2.5 text-xs sm:text-sm text-ivory placeholder-sand-500 focus:outline-none shadow-inner transition"
                  />
                  {customInput && (
                    <button
                      onClick={() => {
                        setCustomInput("");
                        setSelectedDestination("Rajasthan");
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sand-400 hover:text-white text-xs p-1"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Primary Update Feed with Live GPS button */}
                <button
                  onClick={handleSyncCurrentLocation}
                  disabled={gpsLoading}
                  className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition shrink-0 shadow-lg shadow-red-900/30 cursor-pointer active:scale-95"
                >
                  <LocateFixed className={`w-3.5 h-3.5 ${gpsLoading ? "animate-spin" : ""}`} />
                  <span>{gpsLoading ? "Acquiring GPS…" : "Update Safety Feed (My Location)"}</span>
                </button>
              </div>

              {/* Quick Pills */}
              <div className="pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  {POPULAR_DESTINATIONS.map((dest) => (
                    <button
                      key={dest}
                      onClick={() => {
                        setSelectedDestination(dest);
                        setCustomInput(dest);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        selectedDestination.toLowerCase() === dest.toLowerCase()
                          ? "bg-red-600 text-white shadow-md shadow-red-900/30 scale-105"
                          : "bg-ink-900/80 text-sand-300 hover:text-white border border-white/10 hover:border-white/20"
                      }`}
                    >
                      {dest}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick SOS Trigger Card */}
          <div className="bg-gradient-to-br from-red-950/80 via-ink-900 to-ink-950 border-2 border-red-500/40 rounded-3xl p-6 shadow-2xl flex flex-col justify-between gap-5 lg:min-w-[340px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-red-400 font-bold uppercase tracking-wider">
                <Radio className="w-4 h-4 animate-ping" />
                <span>Live Emergency Core</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                ERSS 112 Ready
              </span>
            </div>

            <div>
              <p className="text-xs text-sand-400">Current GPS Detection:</p>
              <p className="text-sm font-bold text-ivory mt-0.5">
                {gpsLocation ? `${gpsLocation.city}, ${gpsLocation.state}` : "GPS Ready · Tap to Broadcast"}
              </p>
            </div>

            <button
              onClick={() => setIsSOSOpen(true)}
              className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2.5 shadow-xl shadow-red-900/50 transition active:scale-95 cursor-pointer"
            >
              <ShieldAlert className="w-5 h-5 animate-pulse" />
              Open Emergency SOS Beacon
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* QUICK DIAL 24x7 HOTLINES BAR */}
        {/* ======================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <a
            href="tel:112"
            className="bg-ink-900/70 hover:bg-red-950/40 border border-white/10 hover:border-red-500/40 p-4 rounded-2xl flex items-center gap-3 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-base shadow">
              112
            </div>
            <div>
              <p className="text-xs font-bold text-ivory group-hover:text-red-300 transition">National Emergency</p>
              <p className="text-[11px] text-sand-500">Police, Fire, Ambulance</p>
            </div>
          </a>

          <a
            href="tel:1363"
            className="bg-ink-900/70 hover:bg-amber-950/40 border border-white/10 hover:border-amber-500/40 p-4 rounded-2xl flex items-center gap-3 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-base shadow">
              1363
            </div>
            <div>
              <p className="text-xs font-bold text-ivory group-hover:text-amber-300 transition">Tourist Helpline</p>
              <p className="text-[11px] text-sand-500">Ministry of Tourism (12 Lngs)</p>
            </div>
          </a>

          <a
            href="tel:1091"
            className="bg-ink-900/70 hover:bg-rose-950/40 border border-white/10 hover:border-rose-500/40 p-4 rounded-2xl flex items-center gap-3 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-base shadow">
              1091
            </div>
            <div>
              <p className="text-xs font-bold text-ivory group-hover:text-rose-300 transition">Women in Distress</p>
              <p className="text-[11px] text-sand-500">24x7 NCW Response</p>
            </div>
          </a>

          <a
            href="tel:108"
            className="bg-ink-900/70 hover:bg-emerald-950/40 border border-white/10 hover:border-emerald-500/40 p-4 rounded-2xl flex items-center gap-3 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow">
              108
            </div>
            <div>
              <p className="text-xs font-bold text-ivory group-hover:text-emerald-300 transition">Medical Ambulance</p>
              <p className="text-[11px] text-sand-500">Free Emergency Transport</p>
            </div>
          </a>
        </div>

        {/* ======================================================== */}
        {/* MAIN NAVIGATION TABS */}
        {/* ======================================================== */}
        <div className="flex border-b border-white/10 gap-4 text-sm sm:text-base font-semibold">
          <button
            onClick={() => setActiveMainTab("advisor")}
            className={`pb-4 px-2 transition flex items-center gap-2 border-b-2 ${
              activeMainTab === "advisor"
                ? "border-red-500 text-red-400 font-bold"
                : "border-transparent text-sand-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            360° Safety Measures (Before/During/After)
          </button>

          <button
            onClick={() => setActiveMainTab("crowd")}
            className={`pb-4 px-2 transition flex items-center gap-2 border-b-2 ${
              activeMainTab === "crowd"
                ? "border-red-500 text-red-400 font-bold"
                : "border-transparent text-sand-400 hover:text-white"
            }`}
          >
            <Users className="w-5 h-5" />
            AI Crowd Prediction & Quiet Windows
          </button>

          <button
            onClick={() => setActiveMainTab("directory")}
            className={`pb-4 px-2 transition flex items-center gap-2 border-b-2 ${
              activeMainTab === "directory"
                ? "border-red-500 text-red-400 font-bold"
                : "border-transparent text-sand-400 hover:text-white"
            }`}
          >
            <Building2 className="w-5 h-5" />
            Emergency Contacts & Embassies
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB CONTENTS */}
        {/* ======================================================== */}
        {activeMainTab === "advisor" && (
          <SafetyAdvisor
            selectedDestination={selectedDestination}
            onOpenSOS={() => setIsSOSOpen(true)}
          />
        )}

        {activeMainTab === "crowd" && (
          <CrowdPredictionCard
            destination={selectedDestination}
            onSelectAlternative={(gem) => {
              setSelectedDestination(gem.state || gem.title);
              setActiveMainTab("advisor");
            }}
          />
        )}

        {activeMainTab === "directory" && (
          <EmergencyDirectory />
        )}
      </div>

      {/* Persistent SOS Modal */}
      <SOSBeaconModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        defaultDestination={selectedDestination}
      />
    </div>
  );
}
