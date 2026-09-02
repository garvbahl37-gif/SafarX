// src/data/indianHolidaysSeasonality.js
/**
 * Official Indian National Gazetted & Restricted Holidays Calendar, Major Festivals,
 * and Seasonal Tourism Footfall Profiles.
 * Sources:
 * - Department of Personnel & Training (DoPT), Govt of India Gazetted Holiday List
 * - India Tourism Statistics (Ministry of Tourism / data.gov.in)
 * - India Meteorological Department (IMD) Climatic Suitability Normals
 */

export const GAZETTED_HOLIDAYS_CALENDAR = [
 { name: "Republic Day", month: 1, day: 26, isNational: true, surgeMultiplier: 1.6, tag: "National Holiday" },
 { name: "Maha Shivratri", month: 3, day: 8, isNational: false, surgeMultiplier: 1.45, tag: "Cultural Festival" },
 { name: "Holi (Festival of Colors)", month: 3, day: 25, isNational: true, surgeMultiplier: 1.7, tag: "High Surge (Vrindavan, Mathura, Jaipur)" },
 { name: "Good Friday", month: 3, day: 29, isNational: true, surgeMultiplier: 1.5, tag: "Long Weekend" },
 { name: "Eid-ul-Fitr", month: 4, day: 11, isNational: true, surgeMultiplier: 1.4, tag: "Festival Holiday" },
 { name: "Mahavir Jayanti", month: 4, day: 21, isNational: true, surgeMultiplier: 1.3, tag: "Gazetted Holiday" },
 { name: "Buddha Purnima", month: 5, day: 23, isNational: true, surgeMultiplier: 1.45, tag: "Buddhist Circuits Surge" },
 { name: "Eid-ul-Adha (Bakrid)", month: 6, day: 17, isNational: true, surgeMultiplier: 1.35, tag: "Gazetted Holiday" },
 { name: "Muharram", month: 7, day: 17, isNational: true, surgeMultiplier: 1.25, tag: "Gazetted Holiday" },
 { name: "Independence Day", month: 8, day: 15, isNational: true, surgeMultiplier: 1.75, tag: "National Long Weekend Surge" },
 { name: "Janmashtami", month: 8, day: 26, isNational: true, surgeMultiplier: 1.55, tag: "Pilgrimage Rush" },
 { name: "Ganesh Chaturthi", month: 9, day: 7, isNational: false, surgeMultiplier: 1.65, tag: "High Surge (Maharashtra, Goa)" },
 { name: "Gandhi Jayanti", month: 10, day: 2, isNational: true, surgeMultiplier: 1.6, tag: "National Holiday" },
 { name: "Dussehra (Vijayadashami)", month: 10, day: 12, isNational: true, surgeMultiplier: 1.8, tag: "Peak Festival Surge (Mysuru, Kolkata)" },
 { name: "Diwali (Deepavali)", month: 11, day: 1, isNational: true, surgeMultiplier: 1.9, tag: "Super Peak Festive Holiday" },
 { name: "Govardhan Puja / Bhai Dooj", month: 11, day: 2, isNational: false, surgeMultiplier: 1.6, tag: "Extended Holiday" },
 { name: "Guru Nanak Jayanti", month: 11, day: 15, isNational: true, surgeMultiplier: 1.5, tag: "High Surge (Amritsar)" },
 { name: "Christmas Day", month: 12, day: 25, isNational: true, surgeMultiplier: 1.95, tag: "Super Peak Year-End Surge (Goa, Manali, Shimla, Kerala)" },
 { name: "New Year's Eve & Day", month: 12, day: 31, isNational: false, surgeMultiplier: 2.0, tag: "Highest Footfall Surge Worldwide" }
];

export const REGIONAL_FESTIVALS = [
 { name: "Rann Utsav (Kutch, Gujarat)", startMonth: 11, endMonth: 2, surgeRegions: ["Gujarat", "Kutch"], multiplier: 1.7 },
 { name: "Pushkar Camel Fair (Rajasthan)", startMonth: 11, endMonth: 11, surgeRegions: ["Rajasthan", "Pushkar", "Ajmer"], multiplier: 1.9 },
 { name: "Hornbill Festival (Nagaland)", startMonth: 12, endMonth: 12, surgeRegions: ["Nagaland", "Kohima"], multiplier: 2.1 },
 { name: "Durga Puja (Kolkata & Bengal)", startMonth: 10, endMonth: 10, surgeRegions: ["West Bengal", "Kolkata"], multiplier: 2.2 },
 { name: "Onam (Kerala)", startMonth: 8, endMonth: 9, surgeRegions: ["Kerala", "Alappuzha", "Kochi"], multiplier: 1.8 },
 { name: "Hemis Festival (Ladakh)", startMonth: 6, endMonth: 7, surgeRegions: ["Ladakh", "Leh"], multiplier: 1.85 },
 { name: "Konark Dance Festival (Odisha)", startMonth: 12, endMonth: 12, surgeRegions: ["Odisha", "Puri", "Konark"], multiplier: 1.65 }
];

/**
 * Seasonal Footfall Matrix per State / Destination (1 = Jan, 12 = Dec)
 * Status: 'peak' | 'shoulder' | 'off-peak' | 'monsoon'
 */
export const DESTINATION_SEASONALITY = {
 "Goa": {
 peakMonths: [11, 12, 1, 2],
 shoulderMonths: [3, 4, 10],
 offPeakMonths: [5, 6, 7, 8, 9],
 monsoonMonths: [6, 7, 8, 9],
 quietestHours: "07:00 AM - 10:30 AM",
 peakHours: "04:30 PM - 09:30 PM",
 loadSpreadingTip: "South Goa beaches (Agonda, Palolem, Galgibaga) have 60% lower footfall than Baga/Calangute."
 },
 "Rajasthan": {
 peakMonths: [10, 11, 12, 1, 2, 3],
 shoulderMonths: [4, 9],
 offPeakMonths: [5, 6, 7, 8],
 monsoonMonths: [7, 8],
 quietestHours: "08:00 AM - 10:00 AM",
 peakHours: "02:30 PM - 06:00 PM",
 loadSpreadingTip: "Visit Amer Fort or Mehrangarh right at 08:30 AM opening to beat guided bus tours."
 },
 "Himachal Pradesh": {
 peakMonths: [4, 5, 6, 12, 1],
 shoulderMonths: [3, 9, 10, 11],
 offPeakMonths: [7, 8],
 monsoonMonths: [7, 8],
 quietestHours: "07:30 AM - 10:00 AM",
 peakHours: "03:00 PM - 07:00 PM",
 loadSpreadingTip: "Opt for Old Manali, Naggar, or Sethan instead of congested Mall Road during summer."
 },
 "Ladakh": {
 peakMonths: [6, 7, 8],
 shoulderMonths: [5, 9],
 offPeakMonths: [10, 11, 12, 1, 2, 3, 4],
 monsoonMonths: [],
 quietestHours: "06:30 AM - 09:30 AM",
 peakHours: "11:00 AM - 04:00 PM",
 loadSpreadingTip: "Visit Thiksey Monastery for morning sunrise prayers at 06:00 AM for serenity."
 },
 "Kerala": {
 peakMonths: [9, 10, 11, 12, 1, 2, 3],
 shoulderMonths: [4, 5],
 offPeakMonths: [6, 7, 8],
 monsoonMonths: [6, 7, 8],
 quietestHours: "06:30 AM - 09:00 AM",
 peakHours: "03:30 PM - 07:00 PM",
 loadSpreadingTip: "Explore Munroe Island or Wayanad backwaters for quiet kayaking over crowded Alleppey canals."
 },
 "Uttarakhand": {
 peakMonths: [4, 5, 6, 9, 10, 12],
 shoulderMonths: [3, 11],
 offPeakMonths: [7, 8, 1, 2],
 monsoonMonths: [7, 8],
 quietestHours: "06:00 AM - 09:00 AM",
 peakHours: "04:00 PM - 07:30 PM (Ganga Aarti)",
 loadSpreadingTip: "Attend Parmarth Niketan or Shatrughna Ghat Ganga Aarti to avoid Triveni Ghat stampedes."
 },
 "Uttar Pradesh": {
 peakMonths: [10, 11, 12, 1, 2, 3],
 shoulderMonths: [4, 9],
 offPeakMonths: [5, 6, 7, 8],
 monsoonMonths: [7, 8],
 quietestHours: "06:00 AM - 08:30 AM (Sunrise entry)",
 peakHours: "01:30 PM - 05:30 PM",
 loadSpreadingTip: "Book sunrise slot for Taj Mahal (entry gates open 30 min before sunrise); Fridays Taj Mahal is closed."
 },
 "Tamil Nadu": {
 peakMonths: [11, 12, 1, 2],
 shoulderMonths: [7, 8, 9, 10],
 offPeakMonths: [3, 4, 5, 6],
 monsoonMonths: [10, 11],
 quietestHours: "06:00 AM - 08:30 AM",
 peakHours: "05:00 PM - 08:30 PM",
 loadSpreadingTip: "Temples (Madurai Meenakshi, Brihadisvara) have special morning darshan with minimal waiting."
 },
 "Karnataka": {
 peakMonths: [10, 11, 12, 1, 2],
 shoulderMonths: [7, 8, 9, 3],
 offPeakMonths: [4, 5, 6],
 monsoonMonths: [6, 7, 8],
 quietestHours: "06:30 AM - 09:00 AM",
 peakHours: "03:00 PM - 06:30 PM",
 loadSpreadingTip: "Visit Hampi Vittala Temple and Matanga Hill at sunrise; rent bicycles on Hippie Island side."
 },
 "West Bengal": {
 peakMonths: [10, 11, 12, 1, 2],
 shoulderMonths: [3, 4, 9],
 offPeakMonths: [5, 6, 7, 8],
 monsoonMonths: [6, 7, 8, 9],
 quietestHours: "07:00 AM - 09:30 AM",
 peakHours: "03:30 PM - 07:30 PM",
 loadSpreadingTip: "Visit Victoria Memorial and Howrah Ghats in the cool morning hours."
 },
 "Meghalaya": {
 peakMonths: [9, 10, 11, 12, 1, 2, 3, 4],
 shoulderMonths: [5],
 offPeakMonths: [6, 7, 8],
 monsoonMonths: [6, 7, 8],
 quietestHours: "07:00 AM - 09:30 AM",
 peakHours: "12:00 PM - 04:00 PM",
 loadSpreadingTip: "Start early for Double Decker Living Root Bridge trek (Nongriat) to return before afternoon heat."
 },
 "Maharashtra": {
 peakMonths: [10, 11, 12, 1, 2],
 shoulderMonths: [6, 7, 8, 9], // Monsoon tourism for waterfalls & ghats
 offPeakMonths: [3, 4, 5],
 monsoonMonths: [6, 7, 8, 9],
 quietestHours: "06:30 AM - 09:00 AM",
 peakHours: "04:30 PM - 09:00 PM",
 loadSpreadingTip: "Visit Marine Drive or Gateway of India at sunrise; explore Matheran or Bhandardara over crowded Lonavala."
 },
 "Gujarat": {
 peakMonths: [11, 12, 1, 2],
 shoulderMonths: [9, 10, 3],
 offPeakMonths: [4, 5, 6, 7, 8],
 monsoonMonths: [7, 8],
 quietestHours: "07:00 AM - 09:30 AM",
 peakHours: "05:00 PM - 08:30 PM",
 loadSpreadingTip: "Visit White Desert (Rann of Kutch) during full-moon sunset and early dawn for minimal footfall."
 },
 "Madhya Pradesh": {
 peakMonths: [10, 11, 12, 1, 2, 3],
 shoulderMonths: [7, 8, 9],
 offPeakMonths: [4, 5, 6],
 monsoonMonths: [7, 8],
 quietestHours: "06:30 AM - 09:00 AM",
 peakHours: "02:00 PM - 06:00 PM",
 loadSpreadingTip: "Visit Khajuraho Western Group of Temples right at 6:00 AM opening for stunning empty light."
 },
 "Jammu and Kashmir": {
 peakMonths: [4, 5, 6, 7, 12, 1],
 shoulderMonths: [8, 9, 10, 11],
 offPeakMonths: [2, 3],
 monsoonMonths: [],
 quietestHours: "07:00 AM - 09:30 AM",
 peakHours: "11:00 AM - 04:30 PM",
 loadSpreadingTip: "Take early morning Shikara ride on Dal Lake around 6:00 AM for floating vegetable market."
 },
 "Punjab": {
 peakMonths: [10, 11, 12, 1, 2, 3],
 shoulderMonths: [4, 9],
 offPeakMonths: [5, 6, 7, 8],
 monsoonMonths: [7, 8],
 quietestHours: "04:00 AM - 07:00 AM (Amrit Vela)",
 peakHours: "05:00 PM - 09:00 PM (Palki Sahib ceremony)",
 loadSpreadingTip: "Visit Golden Temple at 4:30 AM for sublime calmness and shortest queue at Harmandir Sahib."
 },
 "Andhra Pradesh": {
 peakMonths: [10, 11, 12, 1, 2],
 shoulderMonths: [7, 8, 9],
 offPeakMonths: [3, 4, 5, 6],
 monsoonMonths: [8, 9, 10],
 quietestHours: "05:30 AM - 08:30 AM",
 peakHours: "03:30 PM - 08:00 PM",
 loadSpreadingTip: "Book Special Entry Darshan (SED) online well in advance for Tirupati Balaji to avoid 12+ hour wait."
 },
 "Telangana": {
 peakMonths: [10, 11, 12, 1, 2],
 shoulderMonths: [7, 8, 9],
 offPeakMonths: [3, 4, 5, 6],
 monsoonMonths: [7, 8, 9],
 quietestHours: "07:00 AM - 09:30 AM",
 peakHours: "04:00 PM - 08:30 PM",
 loadSpreadingTip: "Visit Golconda Fort in early morning before afternoon heat and sound-and-light crowd."
 },
 "Odisha": {
 peakMonths: [10, 11, 12, 1, 2, 3],
 shoulderMonths: [7, 8, 9],
 offPeakMonths: [4, 5, 6],
 monsoonMonths: [7, 8, 9],
 quietestHours: "06:00 AM - 08:30 AM",
 peakHours: "04:00 PM - 08:00 PM",
 loadSpreadingTip: "Visit Konark Sun Temple at 6:00 AM for majestic sunrise without tourist buses."
 },
 "Sikkim": {
 peakMonths: [3, 4, 5, 10, 11],
 shoulderMonths: [9, 12],
 offPeakMonths: [1, 2, 6, 7, 8],
 monsoonMonths: [6, 7, 8],
 quietestHours: "06:00 AM - 08:30 AM",
 peakHours: "10:30 AM - 03:30 PM",
 loadSpreadingTip: "Visit Tsomgo Lake early before afternoon mountain mist and military convoy traffic."
 },
 "Delhi": {
 peakMonths: [10, 11, 12, 1, 2, 3],
 shoulderMonths: [4, 9],
 offPeakMonths: [5, 6, 7, 8],
 monsoonMonths: [7, 8],
 quietestHours: "06:30 AM - 09:00 AM",
 peakHours: "01:00 PM - 05:30 PM",
 loadSpreadingTip: "Visit Qutub Minar, Humayun's Tomb and Red Fort at opening time (07:00 AM) to skip ticket counter queues."
 }
};
