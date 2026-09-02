import React, { useCallback, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion as Motion, useReducedMotion } from "framer-motion";
import toast from "react-hot-toast";
import {
 MapPin, Calendar, Moon, Wallet, Lightbulb, Backpack, CheckCircle,
 ShieldAlert, Download, Loader, Copy, RefreshCw, SlidersHorizontal, Users,
 ArrowRight,
} from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import CrowdPredictionCard from "./safety/CrowdPredictionCard";

import DayCard from "./planner/DayCard";
import DayJumpNav from "./planner/DayJumpNav";
import { itineraryToText, copyText } from "./planner/itineraryToText";
import { EASE, formatINR, formatDate, dayCountBetween } from "./planner/plannerOptions";

/**
 * Premium presentation of a generated itinerary — hero brief, a route-line
 * timeline of days, costs in ₹, and the share/regenerate actions.
 *
 * `onRegenerate` and `onTweak` are optional; without them the extra actions
 * simply don't render, so the original two-prop contract still works.
 */
const GeminiItineraryDisplay = ({ itinerary, formData, onRegenerate, onTweak }) => {
 const itineraryRef = useRef(null);
 const reduce = useReducedMotion();
 const [isDownloading, setIsDownloading] = useState(false);
 const [copied, setCopied] = useState(false);

 const days = useMemo(() => itinerary?.days ?? [], [itinerary]);

 const [expanded, setExpanded] = useState(() => {
 const initial = {};
 (itinerary?.days ?? []).forEach((d, i) => { initial[d.dayNumber] = i < 3; });
 return initial;
 });

 const allExpanded = days.length > 0 && days.every((d) => expanded[d.dayNumber]);

 const setAll = useCallback((value) => {
 setExpanded(() => {
 const next = {};
 days.forEach((d) => { next[d.dayNumber] = value; });
 return next;
 });
 }, [days]);

 const toggleDay = useCallback((dayNumber) => {
 setExpanded((prev) => ({ ...prev, [dayNumber]: !prev[dayNumber] }));
 }, []);

 const handleDownloadPDF = useCallback(async () => {
 if (!itineraryRef.current) return;

 setIsDownloading(true);
 toast.loading("Preparing your PDF…", { id: "pdf-toast" });

 // Collapsed days would be missing from the capture — open everything first.
 setAll(true);
 await new Promise((resolve) => setTimeout(resolve, 700));

 try {
 const element = itineraryRef.current;
 const canvas = await html2canvas(element, {
 scale: 2, // Higher resolution
 useCORS: true,
 backgroundColor: "#061412", // Match ink-950 background
 logging: false
 });

 const imgData = canvas.toDataURL("image/png");
 const pdf = new jsPDF("p", "mm", "a4");
 const pdfWidth = pdf.internal.pageSize.getWidth();
 const pdfHeight = pdf.internal.pageSize.getHeight();

 const imgWidth = pdfWidth;
 const imgHeight = (canvas.height * imgWidth) / canvas.width;

 let heightLeft = imgHeight;
 let position = 0;

 // First page
 pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
 heightLeft -= pdfHeight;

 // Subsequent pages if content overflows
 while (heightLeft > 0) {
 position = heightLeft - imgHeight;
 pdf.addPage();
 pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
 heightLeft -= pdfHeight;
 }

 pdf.save(`SafarX-Itinerary-${itinerary?.selectedState}.pdf`);

 toast.dismiss("pdf-toast");
 toast.success("PDF saved to your downloads", { duration: 3000 });
 } catch (error) {
 console.error("PDF Generation Error:", error);
 toast.dismiss("pdf-toast");
 toast.error("The PDF couldn't be generated — try again in a moment");
 } finally {
 setIsDownloading(false);
 }
 }, [itinerary, setAll]);

 const handleCopy = useCallback(async () => {
 try {
 await copyText(itineraryToText(itinerary, formData));
 setCopied(true);
 toast.success("Itinerary copied — paste it straight into WhatsApp");
 setTimeout(() => setCopied(false), 2500);
 } catch (error) {
 console.error("Clipboard error:", error);
 toast.error("Couldn't copy the itinerary — try again");
 }
 }, [itinerary, formData]);

 if (!itinerary) return null;

 const {
 selectedState,
 recommendationReason,
 recommendedCities,
 tripSummary,
 costBreakdown,
 generalSafetyRecommendations,
 travelTips,
 packingRecommendations,
 } = itinerary;

 const dayCount = days.length || dayCountBetween(formData?.startDate, formData?.endDate);
 const nights = Math.max(dayCount - 1, 0);
 const datesKnown = formData?.startDate && formData?.endDate && formData.startDate !== "Flexible";

 const inkCard = "bg-ink-800 border border-white/[0.07] rounded-2xl p-6";
 const sectionTitle = "flex items-center gap-2.5 mb-5";
 const sectionTitleText = "font-data text-[11px] uppercase tracking-[0.22em] text-ivory/80";

 const chip = (Icon, children, gold = false) => (<span
 className={`flex items-center gap-2 px-4 py-2 rounded-full font-data text-xs tabular-nums ${
 gold
 ? "bg-saffron/10 border border-saffron/35 text-saffron"
 : "bg-white/[0.05] border border-white/[0.08] text-ivory-muted"
 }`}
 >
 <Icon size={13} className={gold ? "" : "text-saffron"} aria-hidden="true" />
 {children}
 </span>
 );

 return (<div className="mt-8">
 {/* ---------- Actions ---------- */}
 <div className="flex flex-wrap gap-2.5 justify-center mb-8">
 <button
 type="button"
 onClick={handleDownloadPDF}
 disabled={isDownloading}
 className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
 >
 {isDownloading ? (<>
 <Loader size={15} className="animate-spin" aria-hidden="true" />
 Preparing PDF…
 </>
 ) : (<>
 <Download size={15} aria-hidden="true" />
 Download PDF
 </>
 )}
 </button>

 <button type="button" onClick={handleCopy} className="btn-ghost">
 {copied ? <CheckCircle size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
 {copied ? "Copied" : "Copy for WhatsApp"}
 </button>

 {onTweak && (<button type="button" onClick={onTweak} className="btn-ghost">
 <SlidersHorizontal size={15} aria-hidden="true" />
 Tweak &amp; regenerate
 </button>
 )}

 {onRegenerate && (<button type="button" onClick={onRegenerate} className="btn-ghost">
 <RefreshCw size={15} aria-hidden="true" />
 Regenerate
 </button>
 )}
 </div>

 {/* ---------- PDF capture wrapper ---------- */}
 <div ref={itineraryRef} className="p-4 sm:p-5 bg-ink-950 rounded-3xl">

 {/* Hero brief */}
 <Motion.header
 initial={reduce ? false : { opacity: 0, y: 24 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, ease: EASE }}
 className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-ink-900 mb-8"
 >
 <div className="absolute -top-28 -right-24 w-80 h-80 bg-saffron/[0.09] rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

 <div className="relative z-10 p-6 sm:p-9 md:p-11">
 <p className="flex items-center gap-3 mb-5">
 <span className="route-dot" aria-hidden="true" />
 <span className="eyebrow">Route confirmed</span>
 <span className="route-line flex-1 max-w-[10rem]" aria-hidden="true" />
 </p>

 <h2 className="font-display italic text-4xl sm:text-5xl md:text-6xl font-medium text-ivory tracking-tight leading-[1.05] mb-6">
 {selectedState}
 </h2>

 <div className="flex flex-wrap gap-2.5">
 {datesKnown && chip(Calendar, `${formatDate(formData.startDate)} – ${formatDate(formData.endDate)}`)}
 {dayCount > 0 && chip(Moon, `${dayCount} ${dayCount === 1 ? "day" : "days"} · ${nights} ${nights === 1 ? "night" : "nights"}`)}
 {recommendedCities?.length > 0 && chip(MapPin, recommendedCities.join(" → "))}
 {formData?.travelStyle && chip(Users, formData.travelStyle)}
 {chip(Wallet, costBreakdown?.totalEstimatedCostINR
 ? formatINR(costBreakdown.totalEstimatedCostINR)
 : "Costs below", true)}
 </div>

 {recommendationReason && (<div className="mt-7 flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.04] p-4 max-w-3xl">
 <Lightbulb size={17} className="text-saffron mt-0.5 shrink-0" aria-hidden="true" />
 <p className="text-ivory-muted text-sm leading-relaxed">{recommendationReason}</p>
 </div>
 )}

 {tripSummary && (<p className="mt-7 pt-7 border-t border-white/[0.07] text-ivory-muted leading-relaxed max-w-3xl">
 {tripSummary}
 </p>
 )}
 </div>
 </Motion.header>

 {/* Day-by-day */}
 {days.length > 0 && (<section aria-label="Day by day plan" className="mb-8">
 <h3 className="flex items-center justify-center gap-4 mb-6">
 <span className="route-line w-10 md:w-20" aria-hidden="true" />
 <span className="font-display text-3xl md:text-4xl font-light text-ivory tracking-tight">
 Day by day
 </span>
 <span className="route-line w-10 md:w-20" aria-hidden="true" />
 </h3>

 {days.length > 3 && (<DayJumpNav
 days={days}
 allExpanded={allExpanded}
 onToggleAll={() => setAll(!allExpanded)}
 onJump={(dayNumber) => setExpanded((prev) => ({ ...prev, [dayNumber]: true }))}
 />
 )}

 <div className="space-y-4 mt-5">
 {days.map((day, index) => (<DayCard
 key={day.dayNumber}
 day={day}
 index={index}
 expanded={Boolean(expanded[day.dayNumber])}
 onToggle={() => toggleDay(day.dayNumber)}
 />
 ))}
 </div>
 </section>
 )}

 {/* Cost & info */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 {costBreakdown && (<div className={`${inkCard} md:col-span-2`}>
 <h3 className={sectionTitle}>
 <Wallet size={15} className="text-saffron" aria-hidden="true" />
 <span className={sectionTitleText}>Cost breakdown</span>
 </h3>
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
 {[
 { label: "Transport", value: costBreakdown.totalTransportCostINR },
 { label: "Dining", value: costBreakdown.totalFoodCostINR },
 { label: "Activities", value: costBreakdown.totalActivityTicketsCostINR },
 { label: "Daily avg", value: costBreakdown.costPerDayAverage },
 ].map((item) => (<div
 key={item.label}
 className="bg-ink-900 p-4 rounded-xl border border-white/[0.06] text-center hover:border-saffron/30 transition-colors"
 >
 <p className="font-data text-[10px] uppercase tracking-[0.18em] text-ivory-faint mb-1.5">{item.label}</p>
 <p className="font-data text-xl md:text-2xl font-medium text-ivory tabular-nums">
 {formatINR(item.value || 0)}
 </p>
 </div>
 ))}
 </div>
 <div className="mt-6 pt-5 border-t border-white/[0.07] flex flex-wrap gap-3 justify-between items-center px-1">
 <span className="text-ivory-muted text-sm">Total estimated budget</span>
 <span className="font-data text-2xl md:text-3xl font-medium text-saffron tabular-nums">
 {formatINR(costBreakdown.totalEstimatedCostINR || 0)}
 </span>
 </div>
 </div>
 )}

 {generalSafetyRecommendations?.length > 0 && (<div className={inkCard}>
 <h3 className={sectionTitle}>
 <ShieldAlert size={15} className="text-saffron" aria-hidden="true" />
 <span className={sectionTitleText}>Stay safe</span>
 </h3>
 <ul className="space-y-3">
 {generalSafetyRecommendations.map((tip, idx) => (<li key={idx} className="flex items-start gap-3 text-ivory-muted text-sm leading-relaxed">
 <span className="route-dot mt-1.5 shrink-0" aria-hidden="true" />
 {tip}
 </li>
 ))}
 </ul>
 </div>
 )}

 {travelTips?.length > 0 && (<div className={inkCard}>
 <h3 className={sectionTitle}>
 <Lightbulb size={15} className="text-saffron" aria-hidden="true" />
 <span className={sectionTitleText}>Traveller tips</span>
 </h3>
 <ul className="space-y-3">
 {travelTips.map((tip, idx) => (<li key={idx} className="flex items-start gap-3 text-ivory-muted text-sm leading-relaxed">
 <CheckCircle size={14} className="text-saffron mt-0.5 shrink-0" aria-hidden="true" />
 <span>{tip}</span>
 </li>
 ))}
 </ul>
 </div>
 )}

 {packingRecommendations?.length > 0 && (<div className={`${inkCard} md:col-span-2`}>
 <h3 className={sectionTitle}>
 <Backpack size={15} className="text-saffron" aria-hidden="true" />
 <span className={sectionTitleText}>Pack for this route</span>
 </h3>
 <div className="flex flex-wrap gap-2.5">
 {packingRecommendations.map((item, idx) => (<span
 key={idx}
 className="px-3 py-1.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-ivory-muted text-sm"
 >
 {item}
 </span>
 ))}
 </div>
 </div>
 )}
 </div>

 {/* Real-Time Crowd Forecast & Load Spreading for Itinerary */}
 <div className="mt-8">
 <CrowdPredictionCard
 destination={formData?.destination || itinerary?.destination || "Rajasthan"}
 initialDate={formData?.startDate && formData?.startDate !== "Flexible" ? formData.startDate : new Date().toISOString().split("T")[0]}
 />
 </div>

 {/* Safety Hub Deep Link Banner */}
 <div className="mt-6 bg-gradient-to-r from-danger-950/40 via-ink-900 to-ink-950 border border-danger/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-danger/20 text-danger-bright flex items-center justify-center shrink-0">
 <ShieldAlert className="w-5 h-5" />
 </div>
 <div>
 <p className="text-sm font-bold text-ivory">Tourist Safety Layer & Emergency SOS</p>
 <p className="text-xs text-ivory-muted">
 Verified state emergency helplines, safety index, and 1-tap live emergency broadcast.
 </p>
 </div>
 </div>
 <Link
 to="/safety"
 className="px-4 py-2 bg-danger hover:bg-danger text-ivory font-semibold text-xs rounded-xl flex items-center gap-1.5 transition shrink-0"
 >
 <span>Open Safety Hub</span>
 <ArrowRight className="w-3.5 h-3.5" />
 </Link>
 </div>

 {/* Footer for PDF */}
 <p className="mt-8 pt-5 border-t border-white/[0.07] text-center font-data text-[10px] uppercase tracking-[0.2em] text-ivory-faint">
 Generated by SafarX · {new Date().toLocaleDateString("en-IN")}
 </p>

 </div> {/* End of PDF capture wrapper */}

 {/* Download action — outside PDF wrapper */}
 <div className="flex justify-center pt-2 pb-6">
 <button
 onClick={handleDownloadPDF}
 disabled={isDownloading}
 className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
 >
 {isDownloading ? (<span className="flex items-center gap-2">
 <Loader size={16} className="animate-spin" aria-hidden="true" />
 Preparing PDF…
 </span>
 ) : (<span className="flex items-center gap-2">
 <Download size={16} aria-hidden="true" />
 Download as PDF
 </span>
 )}
 </button>
 </div>
 </div>
 );
};

export default GeminiItineraryDisplay;
