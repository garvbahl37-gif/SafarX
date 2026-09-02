// src/services/crowdPredictionService.js
import { GAZETTED_HOLIDAYS_CALENDAR, REGIONAL_FESTIVALS, DESTINATION_SEASONALITY } from "../data/indianHolidaysSeasonality";
import hiddenGems from "../data/hiddengems.json";

/**
 * Calculates a comprehensive crowd prediction score (0 - 100%)
 * for a destination on a given date and optional time.
 *
 * @param {string} destination - e.g. "Jaipur", "Goa", "Taj Mahal", "Manali", "Kerala"
 * @param {string|Date} dateInput - ISO string or Date object
 * @param {number} [hour=11] - Hour of day (0 - 23)
 * @returns {Object} Complete crowd forecast and load-spreading recommendation
 */
export function predictCrowdLevel(destination, dateInput, hour = 11) {
 const date = dateInput ? new Date(dateInput) : new Date();
 const month = date.getMonth() + 1; // 1 - 12
 const dayOfMonth = date.getDate();
 const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

 // Find matching destination seasonality profile
 const matchedState = findMatchingStateProfile(destination);
 const seasonality = DESTINATION_SEASONALITY[matchedState] || {
 peakMonths: [10, 11, 12, 1, 2],
 shoulderMonths: [3, 4, 9],
 offPeakMonths: [5, 6, 7, 8],
 monsoonMonths: [7, 8],
 quietestHours: "07:00 AM - 09:30 AM",
 peakHours: "02:00 PM - 06:00 PM",
 loadSpreadingTip: "Visit early morning to beat guided tourist buses."
 };

 // 1. Seasonality Base Score (0 - 45 pts)
 let seasonScore = 20;
 let seasonStatus = "regular";
 if (seasonality.peakMonths.includes(month)) {
 seasonScore = 42;
 seasonStatus = "peak_season";
 } else if (seasonality.shoulderMonths.includes(month)) {
 seasonScore = 28;
 seasonStatus = "shoulder_season";
 } else if (seasonality.monsoonMonths.includes(month)) {
 seasonScore = 14;
 seasonStatus = "monsoon_low";
 } else if (seasonality.offPeakMonths.includes(month)) {
 seasonScore = 15;
 seasonStatus = "off_peak";
 }

 // 2. Holiday & Festival Multiplier (0 - 30 pts)
 let holidayScore = 0;
 let activeHoliday = null;
 let activeFestival = null;

 // Check Gazetted National/Regional Holiday
 const matchingHoliday = GAZETTED_HOLIDAYS_CALENDAR.find((h) => h.month === month && Math.abs(h.day - dayOfMonth) <= 1
 );
 if (matchingHoliday) {
 holidayScore += Math.round(25 * (matchingHoliday.surgeMultiplier - 1));
 activeHoliday = matchingHoliday;
 }

 // Check Regional Festival
 const matchingFestival = REGIONAL_FESTIVALS.find((f) =>
 month >= f.startMonth &&
 month <= f.endMonth &&
 f.surgeRegions.some((r) => destination.toLowerCase().includes(r.toLowerCase()))
 );
 if (matchingFestival) {
 holidayScore += Math.round(20 * (matchingFestival.multiplier - 1));
 activeFestival = matchingFestival;
 }

 // 3. Day of Week Surge (0 - 15 pts)
 let dayOfWeekScore = 4;
 let isWeekend = false;
 if (dayOfWeek === 0 || dayOfWeek === 6) {
 // Saturday or Sunday
 dayOfWeekScore = 14;
 isWeekend = true;
 } else if (dayOfWeek === 5) {
 // Friday
 dayOfWeekScore = 9;
 } else if (dayOfWeek === 1) {
 // Monday
 dayOfWeekScore = 6;
 }

 // 4. Diurnal (Hourly) Curve (0 - 15 pts)
 let hourScore = 5;
 if (hour >= 6 && hour < 9) {
 hourScore = 3; // Early morning tranquility
 } else if (hour >= 9 && hour < 12) {
 hourScore = 11; // Morning surge
 } else if (hour >= 12 && hour < 15) {
 hourScore = 8; // Midday heat lull
 } else if (hour >= 15 && hour < 19) {
 hourScore = 14; // Sunset / evening peak
 } else if (hour >= 19 && hour < 22) {
 hourScore = 7; // Night activity
 } else {
 hourScore = 1; // Late night / pre-dawn
 }

 // Aggregate Total Crowd Score (capped at 100)
 const totalScore = Math.min(100, Math.max(12, seasonScore + holidayScore + dayOfWeekScore + hourScore));

 // Determine Level Category & Visual Color
 let level = "Low";
 let color = "emerald";
 let statusEmoji = "";
 let recommendation = "Ideal time to visit! Minimal queues and plenty of open space.";

 if (totalScore >= 80) {
 level = "Super Surge";
 color = "rose";
 statusEmoji = "";
 recommendation = "Heavy tourist rush expected. Pre-book monument entry slots and consider visiting during the recommended quiet window.";
 } else if (totalScore >= 65) {
 level = "High";
 color = "amber";
 statusEmoji = "";
 recommendation = "Busy visitor density. Arrive early or late afternoon to avoid peak bus queues.";
 } else if (totalScore >= 45) {
 level = "Moderate";
 color = "blue";
 statusEmoji = "";
 recommendation = "Normal tourist footfall. Smooth experience with moderate waiting times.";
 }

 // Compute 24-Hour Curve
 const hourlyCurve = generate24HourCurve(seasonScore, holidayScore, dayOfWeekScore);

 // Suggest Load-Spreading Alternate Hidden Gems
 const alternateGems = findAlternateHiddenGems(matchedState || destination);

 return {
 destination,
 matchedState,
 date: date.toISOString().split("T")[0],
 selectedHour: hour,
 score: totalScore,
 level,
 color,
 statusEmoji,
 seasonStatus,
 isWeekend,
 activeHoliday: activeHoliday ? `${activeHoliday.name} (${activeHoliday.tag})` : null,
 activeFestival: activeFestival ? `${activeFestival.name}` : null,
 recommendation,
 quietestHours: seasonality.quietestHours,
 peakHours: seasonality.peakHours,
 loadSpreadingTip: seasonality.loadSpreadingTip,
 hourlyCurve,
 alternateGems
 };
}

/**
 * Generates an hourly footfall trajectory from 6 AM to 11 PM
 */
function generate24HourCurve(seasonScore, holidayScore, dayOfWeekScore) {
 const base = seasonScore + holidayScore + dayOfWeekScore;
 const hours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

 return hours.map((h) => {
 let diurnalOffset = 0;
 if (h === 6 || h === 7) diurnalOffset = -18;
 else if (h === 8) diurnalOffset = -8;
 else if (h >= 9 && h <= 11) diurnalOffset = 8;
 else if (h === 12 || h === 13) diurnalOffset = 2;
 else if (h >= 14 && h <= 15) diurnalOffset = 5;
 else if (h >= 16 && h <= 18) diurnalOffset = 15; // Sunset peak
 else if (h >= 19 && h <= 21) diurnalOffset = 0;
 else if (h >= 22) diurnalOffset = -12;

 const val = Math.min(100, Math.max(10, Math.round(base * 0.75 + diurnalOffset)));
 const formattedHour = h > 12 ? `${h - 12} PM` : h === 12 ? "12 PM" : `${h} AM`;

 return {
 hour: h,
 label: formattedHour,
 crowdScore: val,
 isQuiet: val <= 40,
 isPeak: val >= 75
 };
 });
}

function findMatchingStateProfile(dest) {
 if (!dest) return "Rajasthan";
 const query = dest.toLowerCase().trim();
 const keys = Object.keys(DESTINATION_SEASONALITY);
 for (const k of keys) {
 if (query.includes(k.toLowerCase()) || k.toLowerCase().includes(query)) return k;
 }
 // Popular cities, monuments & regions mapping
 if (query.includes("jaipur") || query.includes("udaipur") || query.includes("jodhpur") || query.includes("jaisalmer") || query.includes("pushkar") || query.includes("bikaner") || query.includes("mount abu") || query.includes("ranthambore")) return "Rajasthan";
 if (query.includes("agra") || query.includes("taj mahal") || query.includes("varanasi") || query.includes("kashi") || query.includes("mathura") || query.includes("vrindavan") || query.includes("ayodhya") || query.includes("lucknow") || query.includes("prayagraj") || query.includes("sarnath")) return "Uttar Pradesh";
 if (query.includes("shimla") || query.includes("manali") || query.includes("dharamshala") || query.includes("spiti") || query.includes("kasol") || query.includes("kaza") || query.includes("bir billing") || query.includes("dalhousie") || query.includes("kullu") || query.includes("jibhi")) return "Himachal Pradesh";
 if (query.includes("leh") || query.includes("nubra") || query.includes("pangong") || query.includes("zanskar") || query.includes("kargil") || query.includes("khardung")) return "Ladakh";
 if (query.includes("munnar") || query.includes("kochi") || query.includes("cochin") || query.includes("alleppey") || query.includes("alappuzha") || query.includes("varkala") || query.includes("wayanad") || query.includes("kovalam") || query.includes("thekkady")) return "Kerala";
 if (query.includes("rishikesh") || query.includes("haridwar") || query.includes("mussoorie") || query.includes("nainital") || query.includes("kedarnath") || query.includes("badrinath") || query.includes("auli") || query.includes("chopta") || query.includes("jim corbett") || query.includes("dehradun")) return "Uttarakhand";
 if (query.includes("bengaluru") || query.includes("bangalore") || query.includes("hampi") || query.includes("mysuru") || query.includes("mysore") || query.includes("coorg") || query.includes("gokarna") || query.includes("chikmagalur") || query.includes("badami") || query.includes("udupi") || query.includes("dandeli")) return "Karnataka";
 if (query.includes("chennai") || query.includes("madurai") || query.includes("ooty") || query.includes("rameswaram") || query.includes("kanyakumari") || query.includes("mahabalipuram") || query.includes("kodaikanal") || query.includes("thanjavur")) return "Tamil Nadu";
 if (query.includes("kolkata") || query.includes("darjeeling") || query.includes("sundarbans") || query.includes("kalimpong") || query.includes("digha")) return "West Bengal";
 if (query.includes("shillong") || query.includes("cherrapunji") || query.includes("cherrapunjee") || query.includes("dawki") || query.includes("mawlynnong") || query.includes("nongriat")) return "Meghalaya";
 if (query.includes("mumbai") || query.includes("pune") || query.includes("lonavala") || query.includes("khandala") || query.includes("mahabaleshwar") || query.includes("ajanta") || query.includes("ellora") || query.includes("alibaug") || query.includes("shirdi") || query.includes("nashik") || query.includes("matheran")) return "Maharashtra";
 if (query.includes("goa") || query.includes("calangute") || query.includes("baga") || query.includes("anjuna") || query.includes("panaji") || query.includes("palolem") || query.includes("vagator") || query.includes("candolim")) return "Goa";
 if (query.includes("ahmedabad") || query.includes("kutch") || query.includes("rann of kutch") || query.includes("somnath") || query.includes("dwarka") || query.includes("gir") || query.includes("statue of unity") || query.includes("surat") || query.includes("vadodara")) return "Gujarat";
 if (query.includes("bhopal") || query.includes("indore") || query.includes("khajuraho") || query.includes("ujjain") || query.includes("gwalior") || query.includes("orchha") || query.includes("kanha") || query.includes("bandhavgarh") || query.includes("pachmarhi")) return "Madhya Pradesh";
 if (query.includes("srinagar") || query.includes("gulmarg") || query.includes("pahalgam") || query.includes("sonmarg") || query.includes("jammu") || query.includes("katra") || query.includes("vaishno devi")) return "Jammu and Kashmir";
 if (query.includes("amritsar") || query.includes("golden temple") || query.includes("chandigarh") || query.includes("wagah")) return "Punjab";
 if (query.includes("tirupati") || query.includes("visakhapatnam") || query.includes("vizag") || query.includes("gandikota") || query.includes("araku") || query.includes("vijayawada")) return "Andhra Pradesh";
 if (query.includes("hyderabad") || query.includes("charminar") || query.includes("golconda") || query.includes("warangal")) return "Telangana";
 if (query.includes("puri") || query.includes("konark") || query.includes("bhubaneswar") || query.includes("chilika")) return "Odisha";
 if (query.includes("gangtok") || query.includes("pelling") || query.includes("lachung") || query.includes("yumthang") || query.includes("tsomgo")) return "Sikkim";
 if (query.includes("delhi") || query.includes("new delhi") || query.includes("red fort") || query.includes("qutub") || query.includes("india gate") || query.includes("ncr") || query.includes("noida") || query.includes("gurgaon")) return "Delhi";
  
 return "Rajasthan";
}

function findAlternateHiddenGems(stateOrDest) {
 if (!Array.isArray(hiddenGems)) return [];
 const query = stateOrDest.toLowerCase();

 const matched = hiddenGems.filter((gem) => {
 const gemState = (gem.state || "").toLowerCase();
 const gemLoc = (gem.location || "").toLowerCase();
 return gemState.includes(query) || query.includes(gemState) || gemLoc.includes(query);
 });

 return matched.slice(0, 3).map((g) => ({
 id: g.id,
 title: g.title,
 location: g.location,
 state: g.state,
 rating: g.rating || 4.8,
 category: g.category,
 visitors: g.visitors || "Few tourists"
 }));
}
