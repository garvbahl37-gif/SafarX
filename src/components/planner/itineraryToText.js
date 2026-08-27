import { formatINR, formatDate } from "./plannerOptions";

/**
 * Flattens a generated itinerary into WhatsApp-friendly plain text.
 * Kept deliberately emoji-free and ₹-first.
 */
export function itineraryToText(itinerary, formData = {}) {
  if (!itinerary) return "";

  const lines = [];
  const dest = itinerary.selectedState || formData.destination || "Your trip";

  lines.push(`${dest.toUpperCase()} — SafarX itinerary`);

  if (formData.startDate && formData.endDate) {
    lines.push(`${formatDate(formData.startDate)} to ${formatDate(formData.endDate)}`);
  }
  if (itinerary.costBreakdown?.totalEstimatedCostINR) {
    lines.push(`Estimated total: ${formatINR(itinerary.costBreakdown.totalEstimatedCostINR)}`);
  }
  if (itinerary.recommendedCities?.length) {
    lines.push(`Route: ${itinerary.recommendedCities.join(" - ")}`);
  }
  if (itinerary.tripSummary) {
    lines.push("", itinerary.tripSummary);
  }

  (itinerary.days || []).forEach((day) => {
    lines.push("", "-----------------------------");
    lines.push(`DAY ${day.dayNumber}${day.date ? ` - ${day.date}` : ""}${day.theme ? ` - ${day.theme}` : ""}`);
    (day.activities || []).forEach((a) => {
      const cost = a.estimatedCostINR > 0 ? ` (${formatINR(a.estimatedCostINR)})` : "";
      lines.push(`${a.startTime || ""}  ${a.title}${cost}`);
      if (a.location) lines.push(`   at ${a.location}`);
      if (a.shortDescription) lines.push(`   ${a.shortDescription}`);
    });
    if (day.dayTotal > 0) lines.push(`Day total: ${formatINR(day.dayTotal)}`);
  });

  const cb = itinerary.costBreakdown;
  if (cb) {
    lines.push("", "-----------------------------", "COSTS");
    if (cb.totalTransportCostINR) lines.push(`Transport: ${formatINR(cb.totalTransportCostINR)}`);
    if (cb.totalFoodCostINR) lines.push(`Dining: ${formatINR(cb.totalFoodCostINR)}`);
    if (cb.totalActivityTicketsCostINR) lines.push(`Activities: ${formatINR(cb.totalActivityTicketsCostINR)}`);
    if (cb.costPerDayAverage) lines.push(`Daily average: ${formatINR(cb.costPerDayAverage)}`);
    if (cb.totalEstimatedCostINR) lines.push(`TOTAL: ${formatINR(cb.totalEstimatedCostINR)}`);
  }

  if (itinerary.travelTips?.length) {
    lines.push("", "TIPS");
    itinerary.travelTips.forEach((t) => lines.push(`- ${t}`));
  }
  if (itinerary.packingRecommendations?.length) {
    lines.push("", `PACK: ${itinerary.packingRecommendations.join(", ")}`);
  }

  lines.push("", "Planned with SafarX");
  return lines.join("\n");
}

/** Clipboard write with a legacy fallback for non-secure contexts. */
export async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  document.body.removeChild(area);
}
