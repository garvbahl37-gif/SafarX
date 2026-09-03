// src/components/safety/CrowdPredictionCard.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
 Users,
 Clock,
 TrendingDown,
 Sparkles,
 AlertCircle,
 Sun,
 Compass,
 ArrowRight,
 ShieldCheck,
 Zap
} from "lucide-react";
import { predictCrowdLevel } from "../../services/crowdPredictionService";
import DateField from "../ui/DateField";
import { toISO } from "../ui/dateUtils";

export default function CrowdPredictionCard({
 destination = "Jaipur",
 /* Local date, not UTC. toISOString() is a UTC calendar date, so on an IST
    machine before 05:30 this defaulted to yesterday — and once the picker
    below floors at today, yesterday is out of range and the forecast opens
    on a date it will not let you select. */
 initialDate = toISO(new Date()),
 onSelectAlternative = null
}) {
 const [selectedDest, setSelectedDest] = useState(destination);
 const [selectedDate, setSelectedDate] = useState(initialDate);
 const [selectedHour, setSelectedHour] = useState(10); // 10 AM default
 const [prediction, setPrediction] = useState(null);

 useEffect(() => {
 if (destination) setSelectedDest(destination);
 }, [destination]);

 useEffect(() => {
 if (selectedDest && selectedDate) {
 const pred = predictCrowdLevel(selectedDest, selectedDate, selectedHour);
 setPrediction(pred);
 }
 }, [selectedDest, selectedDate, selectedHour]);

 if (!prediction) return null;

 const getScoreBadgeColor = (score) => {
 if (score >= 80) return "text-danger-bright bg-danger/10 border-danger/30";
 if (score >= 65) return "text-saffron-bright bg-saffron/10 border-saffron/30";
 if (score >= 45) return "text-horizon-bright bg-horizon/10 border-horizon/30";
 return "text-horizon-bright bg-horizon/10 border-horizon/30";
 };

 const getBarColor = (score) => {
 if (score >= 80) return "bg-danger";
 if (score >= 65) return "bg-saffron";
 if (score >= 45) return "bg-horizon";
 return "bg-horizon";
 };

 return (<div className="bg-ink-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl text-ivory space-y-6">
 {/* Header & Controls */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
 <div>
 <div className="flex items-center gap-2 text-xs font-data uppercase tracking-widest text-ivory-muted mb-1">
 <Users className="w-4 h-4 text-horizon-bright" />
 <span>AI Crowd Prediction Engine · Footfall Forecaster</span>
 </div>
 <h3 className="text-xl sm:text-2xl font-display text-ivory flex items-center gap-2 flex-wrap">
 <span>Crowd Level & Quiet Windows</span>
 <span className="text-ivory-faint font-normal text-sm">for</span>
 <span className="text-saffron-bright font-bold bg-saffron/10 border border-saffron/20 px-2.5 py-0.5 rounded-xl text-sm sm:text-base">
 {selectedDest}
 </span>
 </h3>
 <p className="text-xs text-ivory-muted mt-0.5">
 Computed from seasonality normals ({prediction.matchedState}), official holidays, and hourly footfall distribution
 </p>
 </div>

 {/* The forecast date. The same calendar the rest of the app uses — this
     input was the last native one left, and the browser's own picker
     arrives white, in the system font, with a blue selection. */}
 <div className="w-[190px] shrink-0">
 <DateField
 value={selectedDate}
 onChange={setSelectedDate}
 min={toISO(new Date())}
 placeholder="Pick a date"
 />
 </div>
 </div>

 {/* Main Score & Status Meter */}
 <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
 {/* Left: Score Gauge */}
 <div className="md:col-span-5 bg-ink-950/80 border border-white/10 rounded-2xl p-5 text-center flex flex-col items-center justify-center relative overflow-hidden">
 {prediction.activeHoliday && (<div className="absolute top-2 right-2 flex items-center gap-1 bg-danger/20 border border-danger/30 text-danger-bright text-[10px] px-2 py-0.5 rounded-full font-medium">
 <Zap className="w-3 h-3 text-danger-bright animate-pulse" />
 Holiday Surge
 </div>
 )}

 <span className="text-4xl sm:text-5xl font-medium font-display tracking-tight text-ivory flex items-baseline justify-center gap-1">
 {prediction.score}%
 <span className="text-sm font-sans font-normal text-ivory-muted">density</span>
 </span>

 <div
 className={`mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getScoreBadgeColor(prediction.score
 )}`}
 >
 <span>{prediction.statusEmoji}</span>
 <span>{prediction.level} Crowd Level</span>
 </div>

 <p className="text-xs text-ivory-muted mt-3 leading-relaxed max-w-xs">
 {prediction.recommendation}
 </p>

 {/* Holiday/Festival alerts if any */}
 {prediction.activeHoliday && (<div className="mt-3 text-[11px] text-saffron-bright bg-saffron/10 border border-saffron/20 px-3 py-1 rounded-xl w-full">
 {prediction.activeHoliday}
 </div>
 )}
 {prediction.activeFestival && (<div className="mt-1 text-[11px] text-saffron-bright bg-saffron/10 border border-saffron/20 px-3 py-1 rounded-xl w-full">
 {prediction.activeFestival}
 </div>
 )}
 </div>

 {/* Right: Load Spreading & Quiet Window Guidance */}
 <div className="md:col-span-7 space-y-3.5">
 <div className="bg-horizon-deep/30 border border-horizon/30 rounded-2xl p-4 flex items-start gap-3">
 <div className="w-9 h-9 rounded-xl bg-horizon/20 text-horizon-bright flex items-center justify-center shrink-0 mt-0.5">
 <TrendingDown className="w-5 h-5" />
 </div>
 <div>
 <p className="text-xs font-bold text-horizon-bright uppercase tracking-wider">
 Recommended Quiet Visiting Window
 </p>
 <p className="text-ivory font-semibold text-sm sm:text-base mt-0.5">
 {prediction.quietestHours}
 </p>
 <p className="text-ivory-muted text-xs mt-1">
 Peak visitor rush happens between <span className="text-saffron-bright font-semibold">{prediction.peakHours}</span>.
 </p>
 </div>
 </div>

 <div className="bg-ink-950/60 border border-white/10 rounded-2xl p-4 text-xs text-ivory-muted space-y-1">
 <div className="flex items-center gap-2 text-ivory font-semibold mb-1">
 <Sparkles className="w-4 h-4 text-saffron-bright" />
 <span>Smart Load Spreading Tip</span>
 </div>
 <p className="leading-relaxed">{prediction.loadSpreadingTip}</p>
 </div>
 </div>
 </div>

 {/* Hourly Footfall Projection Chart */}
 <div className="bg-ink-950/70 border border-white/10 rounded-2xl p-5 space-y-3">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
 <span className="text-xs font-semibold text-ivory-muted uppercase tracking-wider flex items-center gap-1.5">
 <Clock className="w-4 h-4 text-ivory-muted" />
 Hourly Visitor Density Trajectory (06:00 AM - 10:00 PM)
 </span>
 <span className="text-[11px] text-ivory-faint font-data">
 Selected: {selectedHour > 12 ? `${selectedHour - 12}:00 PM` : `${selectedHour}:00 AM`}
 </span>
 </div>

 {/* Bar Chart Visualizer */}
 <div className="pt-2 grid grid-cols-8 sm:grid-cols-16 gap-1.5 items-end h-28 border-b border-white/10 pb-2">
 {prediction.hourlyCurve.map((slot) => {
 const isSelected = slot.hour === selectedHour;
 return (<button
 key={slot.hour}
 type="button"
 onClick={() => setSelectedHour(slot.hour)}
 title={`${slot.label}: ${slot.crowdScore}% crowd density`}
 className={`group flex flex-col items-center justify-end h-full w-full focus:outline-none transition ${
 isSelected ? "scale-105" : "hover:opacity-90"
 }`}
 >
 {/* Bar */}
 <div className="w-full flex flex-col items-center justify-end h-full">
 <div
 style={{ height: `${Math.max(12, slot.crowdScore)}%` }}
 className={`w-full rounded-t-sm transition-all ${
 isSelected
 ? "bg-gradient-to-t from-danger to-saffron-bright ring-2 ring-white"
 : getBarColor(slot.crowdScore)
 } ${slot.isQuiet ? "opacity-75" : ""}`}
 />
 </div>
 {/* Hour Label */}
 <span
 className={`text-[8.5px] font-data mt-1 whitespace-nowrap transition-colors ${
 isSelected ? "text-ivory font-bold scale-110" : "text-ivory-faint hover:text-ivory-muted"
 }`}
 >
 {slot.label}
 </span>
 </button>
 );
 })}
 </div>

 <div className="flex items-center justify-between text-[11px] text-ivory-faint pt-1">
 <span className="flex items-center gap-1">
 <span className="w-2 h-2 rounded-full bg-horizon" /> Low (0-45%)
 </span>
 <span className="flex items-center gap-1">
 <span className="w-2 h-2 rounded-full bg-horizon" /> Moderate (45-65%)
 </span>
 <span className="flex items-center gap-1">
 <span className="w-2 h-2 rounded-full bg-saffron" /> High (65-80%)
 </span>
 <span className="flex items-center gap-1">
 <span className="w-2 h-2 rounded-full bg-danger" /> Super Surge (&gt;80%)
 </span>
 </div>
 </div>

 {/* Alternate Hidden Gems (Load Spreading) */}
 {prediction.alternateGems && prediction.alternateGems.length > 0 && (<div className="space-y-3 pt-2">
 <div className="flex items-center justify-between">
 <h4 className="text-xs font-bold uppercase tracking-wider text-ivory-muted flex items-center gap-2">
 <Compass className="w-4 h-4 text-horizon-bright" />
 Lesser-Crowded Alternatives in {prediction.matchedState || prediction.destination}
 </h4>
 <span className="text-[11px] text-horizon-bright font-medium">SIH Sustainable Tourism</span>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 {prediction.alternateGems.map((gem) => (<div
 key={gem.id}
 className="bg-ink-950/80 border border-white/10 hover:border-horizon/40 rounded-2xl p-3.5 transition group flex flex-col justify-between"
 >
 <div>
 <div className="flex items-center justify-between text-[10px] text-horizon-bright mb-1">
 <span className="bg-horizon/15 px-2 py-0.5 rounded-full capitalize">
 {gem.category || "Hidden Sanctuary"}
 </span>
 <span className="text-ivory-muted"> {gem.rating}</span>
 </div>
 <p className="font-bold text-ivory text-sm group-hover:text-horizon-bright transition">
 {gem.title}
 </p>
 <p className="text-ivory-faint text-xs mt-0.5">{gem.location}</p>
 </div>

 <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-ivory-muted">
 <span>{gem.visitors}</span>
 {onSelectAlternative && (<button
 onClick={() => onSelectAlternative(gem)}
 className="text-horizon-bright hover:text-horizon-bright flex items-center gap-1 font-semibold"
 >
 Explore <ArrowRight className="w-3 h-3" />
 </button>
 )}
 </div>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 );
}
