// src/services/safetyService.js
import { getEmergencyContactsForState } from "../data/emergencyContacts";
import { getSafetyMetricsForState } from "../data/safetyMetrics";

const EMERGENCY_CONTACTS_KEY = "safarx_emergency_contacts";

/**
 * Default initial emergency contacts structure
 */
const DEFAULT_CONTACTS = [
 {
 id: "contact_1",
 name: "Primary Contact (Family/Friend)",
 phone: "",
 relationship: "Family",
 isPrimary: true
 },
 {
 id: "contact_2",
 name: "Secondary Contact",
 phone: "",
 relationship: "Friend",
 isPrimary: false
 }
];

/**
 * Normalizes phone numbers to standard WhatsApp format (with country code)
 * If 10 digits provided, automatically prepends 91 (India)
 */
export function formatWhatsAppPhoneNumber(phone) {
 if (!phone) return "";
 let digits = String(phone).replace(/[^\d]/g, "");
 if (digits.length === 11 && digits.startsWith("0")) {
 digits = "91" + digits.slice(1);
 } else if (digits.length === 10) {
 digits = "91" + digits;
 }
 return digits;
}

/**
 * Cleans phone strings to standard callable `tel:`URIs that open the native Phone dialer app
 * with digits pre-filled on the numpad.
 */
export function getCleanTelUri(rawString) {
 if (!rawString) return "tel:112";
 const firstPart = String(rawString).split("/")[0].split("(")[0].trim();
 const cleaned = firstPart.replace(/[^\d+]/g, "");
 return cleaned ? `tel:${cleaned}` : "tel:112";
}

/**
 * Splits combined helpline strings into multiple callable badges with direct tel: URIs
 */
export function extractCallableNumbers(rawString) {
 if (!rawString) return [{ label: "112", tel: "tel:112" }];
 const parts = String(rawString).split("/").map(p => p.trim()).filter(Boolean);
 return parts.map(part => {
 const pureDigits = part.split("(")[0].replace(/[^\d+]/g, "");
 return {
 label: part,
 tel: pureDigits ? `tel:${pureDigits}` : "tel:112"
 };
 });
}

/**
 * Get saved emergency contacts from local storage (synced per user if signed in)
 */
export function getSavedEmergencyContacts(userId = null) {
 try {
 if (userId) {
 const userRaw = localStorage.getItem(`${EMERGENCY_CONTACTS_KEY}_${userId}`);
 if (userRaw) {
 const parsed = JSON.parse(userRaw);
 if (Array.isArray(parsed) && parsed.length > 0) return parsed;
 }
 }
 const raw = localStorage.getItem(EMERGENCY_CONTACTS_KEY);
 if (!raw) return DEFAULT_CONTACTS;
 const parsed = JSON.parse(raw);
 return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CONTACTS;
 } catch (err) {
 console.warn("Failed to load emergency contacts from localStorage:", err);
 return DEFAULT_CONTACTS;
 }
}

/**
 * Save emergency contacts to local storage and bind to user account
 */
export function saveEmergencyContacts(contacts, userId = null) {
 try {
 const serialized = JSON.stringify(contacts);
 localStorage.setItem(EMERGENCY_CONTACTS_KEY, serialized);
 if (userId) {
 localStorage.setItem(`${EMERGENCY_CONTACTS_KEY}_${userId}`, serialized);
 }
 return true;
 } catch (err) {
 console.error("Failed to save emergency contacts:", err);
 return false;
 }
}

/**
 * Get real-time device Geolocation coordinates
 */
export function getCurrentDeviceLocation() {
 return new Promise((resolve, reject) => {
 if (!navigator.geolocation) {
 reject(new Error("Geolocation is not supported by your browser"));
 return;
 }

 navigator.geolocation.getCurrentPosition((position) => {
 resolve({
 latitude: position.coords.latitude,
 longitude: position.coords.longitude,
 accuracy: Math.round(position.coords.accuracy),
 altitude: position.coords.altitude,
 speed: position.coords.speed,
 timestamp: new Date(position.timestamp).toISOString()
 });
 },
 (error) => {
 reject(error);
 },
 {
 enableHighAccuracy: true,
 timeout: 12000,
 maximumAge: 5000
 }
 );
 });
}

/**
 * Reverse-geocode latitude and longitude into human readable address & state
 * using OpenStreetMap Nominatim with caching
 */
const geocodeCache = new Map();

export async function reverseGeocodeCoords(latitude, longitude) {
 const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
 if (geocodeCache.has(cacheKey)) {
 return geocodeCache.get(cacheKey);
 }

 try {
 const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
 const response = await fetch(url, {
 headers: {
 "Accept-Language": "en",
 "User-Agent": "SafarX-TouristSafety/1.0 (tourism.safarx.app)"
 }
 });

 if (!response.ok) throw new Error("Geocoding failed");
 const data = await response.json();

 const address = data.address || {};
 const state = address.state || address.province || address.territory || "India";
 const city = address.city || address.town || address.village || address.county || address.state_district || "Current Location";
 const formattedAddress = data.display_name || `${city}, ${state}`;

 const result = {
 formattedAddress,
 city,
 state,
 country: address.country || "India",
 postcode: address.postcode || ""
 };

 geocodeCache.set(cacheKey, result);
 return result;
 } catch (err) {
 console.warn("Reverse geocode failed, using coordinates fallback:", err);
 return {
 formattedAddress: `Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`,
 city: "Current Location",
 state: "India",
 country: "India",
 postcode: ""
 };
 }
}

/**
 * Constructs an authentic formatted WhatsApp SOS distress message
 * and generates the WhatsApp Web/App direct recipient URL.
 */
export function buildWhatsAppSOSPayload({
 recipientPhone = "",
 latitude,
 longitude,
 address = "",
 state = "",
 activeTripName = "Active Travel Journey",
 batteryLevel = null,
 customNote = ""
}) {
 const timeString = new Date().toLocaleString("en-IN", {
 timeZone: "Asia/Kolkata",
 dateStyle: "medium",
 timeStyle: "short"
 });

 const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
 const stateContacts = getEmergencyContactsForState(state);

 let message = ` *[SAFARX EMERGENCY SOS]* \n\n`;
 message += `I am in an emergency situation and need immediate help / check-in.\n\n`;
 message += ` *Live Location:* ${latitude.toFixed(5)}° N, ${longitude.toFixed(5)}° E\n`;
 if (address) {
 message += ` *Address / Area:* ${address}\n`;
 }
 message += ` *Google Maps Link:* ${mapsLink}\n`;
 message += `⏱ *Time (IST):* ${timeString}\n`;
 if (batteryLevel !== null) {
 message += ` *Device Battery:* ${batteryLevel}%\n`;
 }
 if (activeTripName) {
 message += ` *Active Trip:* ${activeTripName}\n`;
 }
 if (customNote) {
 message += ` *Note:* ${customNote}\n`;
 }
 message += `\n *Local State Emergency Numbers:*`;
 message += `\n• National ERSS: 112`;
 message += `\n• Women Helpline: ${stateContacts.womenHelpline || "1091 / 181"}`;
 message += `\n• Tourist Police: ${stateContacts.touristPolice || "1363"}`;
 message += `\n\n_Sent via SafarX Tourist Safety Layer_`;

 const encodedText = encodeURIComponent(message);
  
 // Format clean international phone number
 const cleanPhone = formatWhatsAppPhoneNumber(recipientPhone);
 const waUrl = cleanPhone 
 ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`
 : `https://api.whatsapp.com/send?text=${encodedText}`;

 return {
 rawMessage: message,
 encodedText,
 whatsappUrl: waUrl,
 cleanPhone,
 mapsLink
 };
}

/**
 * Synthesizes an emergency alarm siren using Web Audio API
 */
let audioCtx = null;
let sirenOscillator = null;
let sirenInterval = null;

export function startEmergencySiren() {
 try {
 if (!audioCtx) {
 audioCtx = new (window.AudioContext || window.webkitAudioContext)();
 }
 if (audioCtx.state === "suspended") {
 audioCtx.resume();
 }

 stopEmergencySiren(); // Ensure clean state

 sirenOscillator = audioCtx.createOscillator();
 const gainNode = audioCtx.createGain();

 sirenOscillator.type = "sawtooth";
 gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);

 sirenOscillator.connect(gainNode);
 gainNode.connect(audioCtx.destination);

 let high = false;
 sirenOscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // 880 Hz
 sirenOscillator.start();

 sirenInterval = setInterval(() => {
 if (!sirenOscillator || !audioCtx) return;
 const targetFreq = high ? 650 : 980;
 sirenOscillator.frequency.exponentialRampToValueAtTime(targetFreq, audioCtx.currentTime + 0.25);
 high = !high;
 }, 300);

 return true;
 } catch (err) {
 console.error("Failed to start audio siren:", err);
 return false;
 }
}

export function stopEmergencySiren() {
 if (sirenInterval) {
 clearInterval(sirenInterval);
 sirenInterval = null;
 }
 if (sirenOscillator) {
 try {
 sirenOscillator.stop();
 sirenOscillator.disconnect();
 } catch (e) {
 // Ignored
 }
 sirenOscillator = null;
 }
}

/**
 * Returns comprehensive 360° safety measures for Pre-Trip, During-Trip, and Post-Trip
 */
export function get360SafetyMeasures(stateName) {
 const metrics = getSafetyMetricsForState(stateName);
 const contacts = getEmergencyContactsForState(stateName);

 return {
 state: metrics.state,
 scores: {
 overall: metrics.overallScore,
 womenSafety: metrics.womenSafetyScore,
 nightSafety: metrics.nightSafetyScore,
 transportSafety: metrics.transportSafetyScore,
 medical: metrics.medicalAccessibility
 },
 preTripMeasures: [
 {
 title: "Verify Regional Entry & Permits",
 desc: contacts.stateNotes || "Ensure Inner Line Permits (ILP) or heritage entry slots are booked in advance.",
 tag: "Documentation"
 },
 {
 title: "Save State Emergency Helplines",
 desc: `Police: ${contacts.police} | Women Helpline: ${contacts.womenHelpline} | Tourist Police: ${contacts.touristPolice}`,
 tag: "Helplines"
 },
 {
 title: "Pre-trip Medical & Health Readiness",
 desc: `Nearest tertiary emergency hospital: ${contacts.hospital || "District Civil Hospital & 108 Emergency Ambulance"}. Carry prescribed medications and basic first-aid.`,
 tag: "Medical"
 },
 {
 title: "Digital Document Backup",
 desc: "Save encrypted copies of Passport/Aadhaar and travel insurance inside the SafarX Document Vault.",
 tag: "Security"
 }
 ],
 duringTripMeasures: [
 {
 title: "Live GPS & Emergency Contact Sharing",
 desc: "Keep SafarX live tracking active and test 1-Click WhatsApp SOS broadcasting with your primary contact.",
 tag: "Live Tracking"
 },
 {
 title: "Night Transit & Women Safety",
 desc: metrics.safeTransitAdvice || "Use government prepaid counters or verified app-based cabs for late evening transit.",
 tag: "Transit Safety"
 },
 {
 title: "Scam & Tout Awareness",
 desc: metrics.scamWarnings || "Engage only certified ASI licensed guides and verified state tourism registered operators.",
 tag: "Scam Protection"
 },
 {
 title: "Police & Helpdesk Touchpoints",
 desc: metrics.touristPolicePresence || "State Tourist Police kiosks active across major monuments and transport hubs.",
 tag: "Tourist Police"
 }
 ],
 postTripMeasures: [
 {
 title: "Community Safety Rating",
 desc: "Share your authentic experience on women safety, street lighting, and local transit to assist fellow travelers.",
 tag: "Community"
 },
 {
 title: "Report Unsafe Zones or Touts",
 desc: "Anonymously flag persistent tout harassment or poorly lit transit spots for official review.",
 tag: "Reporting"
 },
 {
 title: "Expense & Guide Verification",
 desc: "Review your guide and driver to promote ethical and verified local tourism operators.",
 tag: "Verification"
 }
 ]
 };
}
