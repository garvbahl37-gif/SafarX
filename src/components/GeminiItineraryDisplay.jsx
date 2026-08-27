import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  MapPin, Calendar, Clock, Wallet, Lightbulb, Backpack, CheckCircle,
  Map as MapIcon, ArrowRight, ShieldAlert, Download, Loader
} from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const GeminiItineraryDisplay = ({ itinerary, formData }) => {
  const itineraryRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!itinerary) return null;

  const {
    selectedState,
    recommendationReason,
    recommendedCities,
    tripSummary,
    days,
    costBreakdown,
    generalSafetyRecommendations,
    travelTips,
    packingRecommendations,
  } = itinerary;

  const handleDownloadPDF = async () => {
    if (!itineraryRef.current) return;

    try {
      setIsDownloading(true);
      toast.loading("Preparing your PDF…", { id: "pdf-toast" });

      const element = itineraryRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // Higher resolution
        useCORS: true,
        backgroundColor: "#070A12", // Match ink-950 background
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

      pdf.save(`SafarX-Itinerary-${selectedState}.pdf`);

      toast.dismiss("pdf-toast");
      toast.success("PDF saved to your downloads", { duration: 3000 });
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.dismiss("pdf-toast");
      toast.error("The PDF couldn't be generated — try again in a moment");
    } finally {
      setIsDownloading(false);
    }
  };

  // --- Styles ---
  const inkCard = "bg-ink-800/80 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-6";
  const sectionTitle = "flex items-center gap-2.5 mb-5";
  const sectionTitleText = "font-data text-[11px] uppercase tracking-[0.22em] text-ivory/80";

  return (
    <div className="space-y-8 mt-10">

      {/* Wrapper for PDF Capture */}
      <div ref={itineraryRef} className="p-4 bg-ink-950 rounded-3xl">

        {/* 1. Trip header card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] mb-8 bg-ink-900">
          {/* Soft saffron glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-saffron/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

          <div className="relative z-10 p-8 md:p-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="route-dot" aria-hidden="true" />
              <span className="eyebrow">Route confirmed</span>
              <span className="route-line w-14 hidden sm:inline-block" aria-hidden="true" />
            </div>

            <h2 className="font-display italic text-4xl md:text-5xl font-medium text-ivory tracking-tight mb-6">
              {selectedState}
            </h2>

            {recommendationReason && (
              <div className="flex items-start gap-3 bg-white/[0.04] rounded-xl p-4 border border-white/[0.07] mb-6 max-w-3xl">
                <Lightbulb size={18} className="text-saffron mt-0.5 shrink-0" aria-hidden="true" />
                <p className="text-ivory-muted text-sm leading-relaxed">{recommendationReason}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {recommendedCities && recommendedCities.length > 0 && (
                <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-ink-800 border border-white/[0.07] font-data text-xs text-ivory-muted">
                  <MapPin size={13} className="text-saffron" aria-hidden="true" />
                  {recommendedCities.join(" → ")}
                </span>
              )}
              <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-ink-800 border border-white/[0.07] font-data text-xs text-ivory-muted">
                <Calendar size={13} className="text-saffron" aria-hidden="true" />
                {formData.startDate} – {formData.endDate}
              </span>
              <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-saffron/10 border border-saffron/30 font-data text-xs text-saffron">
                <Wallet size={13} aria-hidden="true" />
                ₹{costBreakdown?.totalEstimatedCostINR?.toLocaleString("en-IN") || "TBD"}
              </span>
            </div>

            {tripSummary && (
              <div className="mt-8 pt-8 border-t border-white/[0.07]">
                <p className="text-ivory-muted leading-relaxed">{tripSummary}</p>
              </div>
            )}
          </div>
        </div>

        {/* 2. Day-by-day */}
        <div className="space-y-6 mb-8">
          <h3 className="flex items-center justify-center gap-4">
            <span className="route-line w-10 md:w-16" aria-hidden="true" />
            <span className="font-display text-3xl md:text-4xl font-medium text-ivory tracking-tight">
              Day by day
            </span>
            <span className="route-line w-10 md:w-16" aria-hidden="true" />
          </h3>

          {days?.map((day) => (
            <div key={day.dayNumber} className={`${inkCard} hover:border-saffron/35 transition-colors duration-500`}>
              {/* Day header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-white/[0.07] gap-4">
                <div>
                  <div className="font-data text-[11px] uppercase tracking-[0.22em] text-saffron mb-1.5">
                    Day {String(day.dayNumber).padStart(2, "0")}
                  </div>
                  <h4 className="font-display text-2xl font-medium text-ivory">{day.date}</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {day.theme && (
                    <span className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-ivory-muted text-xs">
                      {day.theme}
                    </span>
                  )}
                  {day.dayTotal && (
                    <span className="px-3 py-1 rounded-full bg-saffron/10 border border-saffron/25 text-saffron font-data text-xs">
                      ₹{day.dayTotal.toLocaleString("en-IN")} est.
                    </span>
                  )}
                </div>
              </div>

              {/* Activities timeline */}
              <div className="space-y-6 relative pl-4 md:pl-0">
                {/* Vertical route line for tablet+ */}
                <div
                  className="hidden md:block absolute left-[8.5rem] top-2 bottom-2 w-px bg-gradient-to-b from-saffron/40 via-white/10 to-transparent"
                  aria-hidden="true"
                />

                {day.activities?.map((activity, idx) => (
                  <div key={idx} className="relative md:grid md:grid-cols-[8rem_auto] gap-8 group">

                    {/* Time column */}
                    <div className="mb-2 md:mb-0 md:text-right">
                      <div className="inline-block md:block bg-ink-900 px-3 py-1 rounded-lg text-ivory font-data text-sm border border-white/[0.07] group-hover:border-saffron/30 transition">
                        {activity.startTime}
                      </div>
                      <div className="hidden md:block font-data text-ivory-faint text-xs mt-1.5">{activity.duration}</div>
                    </div>

                    {/* Waypoint dot */}
                    <div
                      className="hidden md:block absolute left-[8.5rem] top-4 w-2.5 h-2.5 bg-saffron rounded-full -translate-x-[5px] shadow-[0_0_10px_rgba(232,163,61,0.6)] z-10"
                      aria-hidden="true"
                    />

                    {/* Content card */}
                    <div className="bg-ink-900/70 rounded-xl p-5 border border-white/[0.06] hover:border-saffron/25 transition-colors duration-300">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <h5 className="text-base font-bold text-ivory">{activity.title}</h5>
                        {activity.estimatedCostINR > 0 && (
                          <span className="shrink-0 text-saffron font-data font-medium text-sm">
                            ₹{activity.estimatedCostINR.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      <p className="text-ivory-muted text-sm mb-3 leading-relaxed">{activity.shortDescription}</p>

                      <div className="flex flex-wrap gap-3 font-data text-[11px] uppercase tracking-[0.08em] text-ivory-faint">
                        {activity.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={11} className="text-saffron/80" aria-hidden="true" /> {activity.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1 md:hidden">
                          <Clock size={11} className="text-saffron/80" aria-hidden="true" /> {activity.duration}
                        </span>
                      </div>

                      {/* Transport & safety notes */}
                      {(activity.recommendedTransport || activity.safetyTips) && (
                        <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-col gap-2">
                          {activity.recommendedTransport && (
                            <div className="text-xs text-ivory-muted flex items-center gap-2">
                              <ArrowRight size={12} className="text-saffron shrink-0" aria-hidden="true" />
                              Transport: {activity.recommendedTransport}
                            </div>
                          )}
                          {activity.safetyTips && (
                            <div className="text-xs text-ivory-muted flex items-start gap-2 bg-white/[0.04] p-2.5 rounded-lg border border-white/[0.07]">
                              <ShieldAlert size={12} className="text-saffron mt-0.5 shrink-0" aria-hidden="true" />
                              <span>{activity.safetyTips}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 3. Cost & info grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cost breakdown */}
          {costBreakdown && (
            <div className={`${inkCard} md:col-span-2`}>
              <h3 className={sectionTitle}>
                <Wallet size={15} className="text-saffron" aria-hidden="true" />
                <span className={sectionTitleText}>Cost breakdown</span>
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Transport", value: costBreakdown.totalTransportCostINR },
                  { label: "Dining", value: costBreakdown.totalFoodCostINR },
                  { label: "Activities", value: costBreakdown.totalActivityTicketsCostINR },
                  { label: "Daily avg", value: costBreakdown.costPerDayAverage },
                ].map((item, i) => (
                  <div key={i} className="bg-ink-900/70 p-4 rounded-xl border border-white/[0.06] text-center hover:border-saffron/30 transition">
                    <p className="font-data text-[10px] uppercase tracking-[0.18em] text-ivory-faint mb-1.5">{item.label}</p>
                    <p className="font-data text-xl md:text-2xl font-medium text-ivory tabular-nums">
                      ₹{item.value?.toLocaleString("en-IN") || 0}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-5 border-t border-white/[0.07] flex justify-between items-center px-1">
                <span className="text-ivory-muted text-sm">Total estimated budget</span>
                <span className="font-data text-2xl md:text-3xl font-medium text-saffron tabular-nums">
                  ₹{costBreakdown.totalEstimatedCostINR?.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          )}

          {/* Safety */}
          {generalSafetyRecommendations?.length > 0 && (
            <div className={inkCard}>
              <h3 className={sectionTitle}>
                <ShieldAlert size={15} className="text-saffron" aria-hidden="true" />
                <span className={sectionTitleText}>Stay safe</span>
              </h3>
              <ul className="space-y-3">
                {generalSafetyRecommendations.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-ivory-muted text-sm leading-relaxed">
                    <span className="route-dot mt-1.5 shrink-0" aria-hidden="true" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Travel tips */}
          {travelTips?.length > 0 && (
            <div className={inkCard}>
              <h3 className={sectionTitle}>
                <Lightbulb size={15} className="text-saffron" aria-hidden="true" />
                <span className={sectionTitleText}>Traveler tips</span>
              </h3>
              <ul className="space-y-3">
                {travelTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-ivory-muted text-sm leading-relaxed">
                    <CheckCircle size={14} className="text-saffron mt-0.5 shrink-0" aria-hidden="true" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Packing */}
          {packingRecommendations?.length > 0 && (
            <div className={`${inkCard} md:col-span-2`}>
              <h3 className={sectionTitle}>
                <Backpack size={15} className="text-saffron" aria-hidden="true" />
                <span className={sectionTitleText}>Pack for this route</span>
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {packingRecommendations.map((item, idx) => (
                  <span
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

        {/* Footer for PDF */}
        <div className="mt-8 text-center font-data text-[11px] uppercase tracking-[0.18em] text-ivory-faint py-4 border-t border-white/[0.07]">
          Generated by SafarX · {new Date().toLocaleDateString()}
        </div>

      </div> {/* End of PDF capture wrapper */}

      {/* Download action — outside PDF wrapper */}
      <div className="flex justify-center pt-2 pb-6">
        <button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <span className="flex items-center gap-2">
              <Loader size={16} className="animate-spin" aria-hidden="true" />
              Preparing PDF…
            </span>
          ) : (
            <span className="flex items-center gap-2">
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
