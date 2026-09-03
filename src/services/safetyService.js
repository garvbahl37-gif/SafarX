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
/**
 * Where the device is.
 *
 * The previous version asked for a high-accuracy fix with a twelve second
 * timeout, and that fails for three separate reasons that all look identical
 * to a traveller — "GPS not working".
 *
 * First, the timeout covers the permission prompt. The clock starts when you
 * call, not when the person answers, so anyone who takes twelve seconds to
 * read "SafarX wants to know your location" gets a TIMEOUT even though they
 * pressed Allow. Second, enableHighAccuracy forces a hardware fix; indoors,
 * and on most desktops, that returns POSITION_UNAVAILABLE — macOS reports
 * kCLErrorLocationUnknown — while a coarse network fix would have answered
 * instantly. Third, maximumAge of five seconds rejects a perfectly good fix
 * obtained six seconds ago and starts the whole acquisition again.
 *
 * So this asks for the cheap answer first and refines afterwards. A coarse
 * fix that arrives in a second is worth more in an emergency than a precise
 * one that never arrives, and precision is no use if nobody is told where to
 * look.
 *
 * @param {object} [opts]
 * @param {number} [opts.timeout] total budget in ms, prompt included
 * @returns {Promise<object>} coords, plus `precise` telling you which stage answered
 */
export function getCurrentDeviceLocation({ timeout = 30000 } = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(Object.assign(new Error("This browser cannot share a location."), { kind: "unsupported" }));
      return;
    }
    /* A page served over plain http gets no location at all in any modern
       browser, and the error it returns does not say so. */
    if (!window.isSecureContext) {
      reject(Object.assign(new Error("Location needs a secure (https) connection."), { kind: "insecure" }));
      return;
    }

    const shape = (position, precise) => ({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: Math.round(position.coords.accuracy),
      altitude: position.coords.altitude,
      speed: position.coords.speed,
      precise,
      timestamp: new Date(position.timestamp).toISOString(),
    });

    /* Three different things go wrong here and they need three different
       instructions. Telling someone to "check browser location permissions"
       when macOS has Location Services switched off for Chrome sends them
       looking in the one place that cannot fix it — and that is the case
       that produces kCLErrorLocationUnknown, which is what desktops mostly
       hit. */
    const fail = (error) => {
      const kind =
        error.code === 1 ? "denied" : error.code === 3 ? "timeout" : "unavailable";
      const message =
        kind === "denied"
          ? "Location is blocked for this site. Click the padlock in your address bar, allow Location, then try again."
          : kind === "timeout"
            ? "Location is taking too long to arrive. Move near a window or outdoors and try again."
            : "Your device could not work out where it is. Check that Location Services are switched on for your browser in your computer or phone's own settings.";
      reject(Object.assign(new Error(message), { kind, code: error.code }));
    };

    const started = Date.now();
    const remaining = () => Math.max(4000, timeout - (Date.now() - started));

    /* Stage two: a hardware fix, only after the coarse one has failed. */
    const precise = () =>
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(shape(position, true)),
        fail,
        { enableHighAccuracy: true, timeout: remaining(), maximumAge: 0 }
      );

    /* Stage one: whatever the network already knows. A fix from the last
       minute is fine — nobody has crossed a state line in that time. */
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(shape(position, false)),
      (error) => {
        // A refusal is a final answer, not something to retry harder.
        if (error.code === 1) {
          fail(error);
          return;
        }
        precise();
      },
      { enableHighAccuracy: false, timeout: Math.min(8000, timeout), maximumAge: 60000 }
    );
  });
}

/**
 * Keep following the device after the first fix.
 *
 * The beacon calls its readout a live location, which was not true of a
 * single snapshot taken when the panel opened — someone being driven away
 * from where they pressed the button is exactly who needs this.
 *
 * @param {(coords: object) => void} onUpdate
 * @returns {() => void} stop watching
 */
export function watchDeviceLocation(onUpdate) {
  if (!navigator.geolocation || !window.isSecureContext) return () => {};

  const id = navigator.geolocation.watchPosition(
    (position) => {
      onUpdate({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: Math.round(position.coords.accuracy),
        altitude: position.coords.altitude,
        speed: position.coords.speed,
        precise: true,
        timestamp: new Date(position.timestamp).toISOString(),
      });
    },
    /* Errors here are not worth surfacing: there is already a fix on screen
       from the initial call, and this only ever improves on it. */
    () => {},
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 15000 }
  );

  return () => navigator.geolocation.clearWatch(id);
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
 resolved: true,
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
 /* `resolved` is the part callers need. This never threw, so a failed
    lookup used to reach the UI as the perfectly plausible-looking place
    "Current Location, India" and get set as the safety feed's
    destination — a successful-looking result naming nowhere. */
 return {
 resolved: false,
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
 accuracy = null,
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

 /* A fix is not guaranteed, and a missing one must read as missing. The
    alternative — which this used to do — is a map link to coordinates nobody
    measured, under a heading that calls them live. */
 const located = Number.isFinite(latitude) && Number.isFinite(longitude);
 const mapsLink = located ? `https://maps.google.com/?q=${latitude},${longitude}` : null;
 const stateContacts = getEmergencyContactsForState(state);

 let message = ` *[SAFARX EMERGENCY SOS]* \n\n`;
 message += `I am in an emergency situation and need immediate help / check-in.\n\n`;
 if (located) {
 message += ` *Live Location:* ${latitude.toFixed(5)}° N, ${longitude.toFixed(5)}° E`;
 message += accuracy ? ` (accurate to about ${accuracy}m)\n` : `\n`;
 if (address) {
 message += ` *Address / Area:* ${address}\n`;
 }
 message += ` *Google Maps Link:* ${mapsLink}\n`;
 } else {
 message += ` *Location:* UNAVAILABLE — my phone could not get a GPS fix.\n`;
 message += `Please call me to find out where I am. Do not assume a location.\n`;
 if (address) {
 message += ` *Last known area:* ${address}\n`;
 }
 }
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
