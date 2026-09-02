// src/components/safety/SOSBeaconModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/clerk-react";
import {
 ShieldAlert,
 AlertTriangle,
 PhoneCall,
 Share2,
 Volume2,
 VolumeX,
 X,
 MapPin,
 Clock,
 Battery,
 UserCheck,
 Radio,
 Copy,
 Check,
 ExternalLink,
 ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";
import {
 getCurrentDeviceLocation,
 reverseGeocodeCoords,
 buildWhatsAppSOSPayload,
 getSavedEmergencyContacts,
 saveEmergencyContacts,
 formatWhatsAppPhoneNumber,
 getCleanTelUri,
 startEmergencySiren,
 stopEmergencySiren
} from "../../services/safetyService";
import { getEmergencyContactsForState } from "../../data/emergencyContacts";

export default function SOSBeaconModal({ isOpen, onClose, defaultDestination = "Current Location" }) {
 const { user } = useUser();
 const [countdown, setCountdown] = useState(5);
 const [isArmed, setIsArmed] = useState(true); // 5s countdown active
 const [isSirenActive, setIsSirenActive] = useState(false);
 const [isStrobeActive, setIsStrobeActive] = useState(false);
 const [locationData, setLocationData] = useState(null);
 const [locationLoading, setLocationLoading] = useState(true);
 const [contacts, setContacts] = useState([]);
 const [selectedContactPhone, setSelectedContactPhone] = useState("");
 const [customNote, setCustomNote] = useState("");
 const [copied, setCopied] = useState(false);
 const [batteryLevel, setBatteryLevel] = useState(null);
 const [activeTab, setActiveTab] = useState("sos"); // 'sos' | 'contacts' | 'direct_call'
 const countdownRef = useRef(null);

 // Load Contacts & Battery on mount or when user changes
 useEffect(() => {
 if (!isOpen) {
 stopEmergencySiren();
 setIsSirenActive(false);
 setIsStrobeActive(false);
 return;
 }

 // Reset countdown when opened
 setCountdown(5);
 setIsArmed(true);

 const saved = getSavedEmergencyContacts(user?.id);
 setContacts(saved);
 const primary = saved.find((c) => c.isPrimary && c.phone) || saved.find((c) => c.phone);
 if (primary) setSelectedContactPhone(primary.phone);

 // Read Battery Status if supported
 if (navigator.getBattery) {
 navigator.getBattery().then((batt) => {
 setBatteryLevel(Math.round(batt.level * 100));
 }).catch(() => {});
 }

 // Fetch Live GPS Location
 fetchLiveLocation();

 return () => {
 stopEmergencySiren();
 if (countdownRef.current) clearInterval(countdownRef.current);
 };
 }, [isOpen, user?.id]);

 // Countdown timer for auto-arm / accidental trigger cancel
 useEffect(() => {
 if (!isOpen || !isArmed) return;

 countdownRef.current = setInterval(() => {
 setCountdown((prev) => {
 if (prev <= 1) {
 clearInterval(countdownRef.current);
 setIsArmed(false);
 // Play initial alert beep / haptic
 if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
 return 0;
 }
 return prev - 1;
 });
 }, 1000);

 return () => {
 if (countdownRef.current) clearInterval(countdownRef.current);
 };
 }, [isOpen, isArmed]);

 const fetchLiveLocation = async () => {
 setLocationLoading(true);
 try {
 const coords = await getCurrentDeviceLocation();
 const geocoded = await reverseGeocodeCoords(coords.latitude, coords.longitude);
 setLocationData({
 ...coords,
 ...geocoded
 });
 } catch (err) {
 console.warn("GPS direct access failed, using fallback:", err);
 setLocationData({
 latitude: 28.6139,
 longitude: 77.2090,
 formattedAddress: "Connaught Place, New Delhi, India (Approximate fallback)",
 city: "New Delhi",
 state: "Delhi",
 country: "India",
 accuracy: 100
 });
 } finally {
 setLocationLoading(false);
 }
 };

 const handleCancelCountdown = () => {
 if (countdownRef.current) clearInterval(countdownRef.current);
 setIsArmed(false);
 toast.success("Countdown cancelled. Safety dashboard ready.");
 };

 const toggleSiren = () => {
 if (isSirenActive) {
 stopEmergencySiren();
 setIsSirenActive(false);
 setIsStrobeActive(false);
 toast("Siren & strobe deactivated");
 } else {
 const started = startEmergencySiren();
 if (started) {
 setIsSirenActive(true);
 setIsStrobeActive(true);
 toast.error("EMERGENCY SIREN ACTIVE", { duration: 4000 });
 }
 }
 };

 const getPayload = () => {
 const lat = locationData?.latitude || 28.6139;
 const lng = locationData?.longitude || 77.2090;
 return buildWhatsAppSOSPayload({
 recipientPhone: selectedContactPhone,
 latitude: lat,
 longitude: lng,
 address: locationData?.formattedAddress || defaultDestination,
 state: locationData?.state || "Delhi",
 activeTripName: defaultDestination,
 batteryLevel,
 customNote
 });
 };

 const handleSendWhatsApp = () => {
 const payload = getPayload();
 if (!selectedContactPhone) {
 toast("No emergency phone selected. Opening WhatsApp broadcast...", { icon: "ℹ" });
 } else {
 toast.success(`Broadcasting SOS directly to ${formatWhatsAppPhoneNumber(selectedContactPhone)}...`);
 }
 window.open(payload.whatsappUrl, "_blank", "noopener,noreferrer");
 };

 const handleCopySOSMessage = () => {
 const payload = getPayload();
 navigator.clipboard.writeText(payload.rawMessage);
 setCopied(true);
 toast.success("SOS Message & GPS link copied to clipboard!");
 setTimeout(() => setCopied(false), 3000);
 };

 const handleSaveContact = (id, field, value) => {
 const updated = contacts.map((c) => (c.id === id ? { ...c, [field]: value } : c));
 setContacts(updated);
 saveEmergencyContacts(updated, user?.id);
 };

 if (!isOpen) return null;

 const stateContacts = getEmergencyContactsForState(locationData?.state || "Delhi");

 return (<AnimatePresence>
 <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 pt-16 sm:pt-20 pb-12 overflow-y-auto">
 {/* Backdrop */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={onClose}
 className={`fixed inset-0 bg-ink-950/90 backdrop-blur-lg transition-colors ${
 isStrobeActive ? "animate-pulse bg-danger-950/80" : ""
 }`}
 />

 {/* Modal Container */}
 <motion.div
 initial={{ scale: 0.94, opacity: 0, y: 20 }}
 animate={{ scale: 1, opacity: 1, y: 0 }}
 exit={{ scale: 0.94, opacity: 0, y: 20 }}
 transition={{ type: "spring", damping: 25, stiffness: 300 }}
 className="relative w-full max-w-2xl bg-ink-900 border-2 border-danger/40 rounded-3xl shadow-2xl overflow-hidden z-10 text-ivory my-auto"
 >
 {/* Header Banner */}
 <div className="relative bg-gradient-to-r from-danger via-danger to-saffron-deep p-5 sm:p-6 text-ivory flex items-center justify-between shadow-md">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
 <ShieldAlert className="w-7 h-7 text-ivory animate-pulse" />
 </div>
 <div>
 <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight flex items-center gap-2">
 SafarX Emergency SOS
 <span className="text-xs font-data font-normal uppercase bg-white/25 px-2 py-0.5 rounded-full">
 24x7 Beacon
 </span>
 </h2>
 <p className="text-xs sm:text-sm text-danger-bright font-sans">
 Govt ERSS 112 Integrated · Direct WhatsApp Live Broadcast
 </p>
 </div>
 </div>

 {/* High Contrast Prominent Close Cross Button */}
 <button
 type="button"
 onClick={onClose}
 className="w-10 h-10 rounded-2xl bg-black/40 hover:bg-black/60 text-ivory border border-white/30 transition-all flex items-center justify-center shadow-xl cursor-pointer hover:scale-105 active:scale-95 shrink-0"
 title="Close SOS Modal (ESC)"
 aria-label="Close"
 >
 <X className="w-6 h-6" />
 </button>
 </div>

 {/* Countdown Warning Bar if armed */}
 {isArmed && (<div className="bg-saffron/15 border-b border-saffron/30 px-5 py-3 flex items-center justify-between">
 <div className="flex items-center gap-2 text-saffron-bright text-xs sm:text-sm">
 <Clock className="w-4 h-4 animate-spin" />
 <span>
 Broadcasting in <strong className="text-saffron-200 text-base">{countdown}s</strong> — tap Cancel if accidental
 </span>
 </div>
 <button
 onClick={handleCancelCountdown}
 className="px-3 py-1 bg-saffron hover:bg-saffron-bright text-ink-950 font-bold text-xs rounded-lg transition"
 >
 Cancel Countdown
 </button>
 </div>
 )}

 {/* Navigation Tabs */}
 <div className="flex border-b border-white/10 bg-ink-950/60 px-4 pt-2 gap-2 text-xs sm:text-sm font-medium">
 <button
 onClick={() => setActiveTab("sos")}
 className={`pb-3 px-4 flex items-center gap-2 transition border-b-2 ${
 activeTab === "sos"
 ? "border-danger text-danger-bright font-semibold"
 : "border-transparent text-ivory-muted hover:text-ivory"
 }`}
 >
 <Share2 className="w-4 h-4" />
 WhatsApp SOS Broadcast
 </button>
 <button
 onClick={() => setActiveTab("direct_call")}
 className={`pb-3 px-4 flex items-center gap-2 transition border-b-2 ${
 activeTab === "direct_call"
 ? "border-danger text-danger-bright font-semibold"
 : "border-transparent text-ivory-muted hover:text-ivory"
 }`}
 >
 <PhoneCall className="w-4 h-4" />
 Direct Emergency Helplines
 </button>
 <button
 onClick={() => setActiveTab("contacts")}
 className={`pb-3 px-4 flex items-center gap-2 transition border-b-2 ${
 activeTab === "contacts"
 ? "border-danger text-danger-bright font-semibold"
 : "border-transparent text-ivory-muted hover:text-ivory"
 }`}
 >
 <UserCheck className="w-4 h-4" />
 Trusted Contacts ({contacts.filter((c) => c.phone).length})
 </button>
 </div>

 {/* Modal Body */}
 <div className="p-5 sm:p-6 max-h-[68vh] overflow-y-auto space-y-5">
 {/* Live GPS Strip */}
 <div className="bg-ink-950/80 border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
 <div className="flex items-start gap-2.5 flex-1 min-w-[240px]">
 <div className="w-7 h-7 rounded-lg bg-danger/20 text-danger-bright flex items-center justify-center shrink-0 mt-0.5">
 <MapPin className="w-4 h-4" />
 </div>
 <div>
 <p className="text-ivory-muted font-medium">Verified Current GPS Location</p>
 {locationLoading ? (<p className="text-ivory-faint animate-pulse">Acquiring high accuracy GPS lock…</p>
 ) : (<>
 <p className="text-ivory font-semibold text-sm">
 {locationData?.city}, {locationData?.state}
 </p>
 <p className="text-ivory-faint text-[11px] font-data">
 {locationData?.latitude?.toFixed(5)}° N, {locationData?.longitude?.toFixed(5)}° E (±{locationData?.accuracy || 15}m)
 </p>
 </>
 )}
 </div>
 </div>

 <div className="flex items-center gap-3">
 {batteryLevel !== null && (<div className="flex items-center gap-1 text-ivory-muted bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
 <Battery className="w-4 h-4 text-horizon-bright" />
 <span>{batteryLevel}%</span>
 </div>
 )}
 <button
 onClick={toggleSiren}
 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs transition border ${
 isSirenActive
 ? "bg-danger text-ivory border-danger-bright animate-bounce"
 : "bg-ink-800 text-ivory-muted hover:text-ivory border-white/10 hover:border-danger/50"
 }`}
 >
 {isSirenActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-danger-bright" />}
 {isSirenActive ? "Stop Siren" : "Sound Alarm"}
 </button>
 </div>
 </div>

 {/* TAB 1: WhatsApp SOS Broadcast */}
 {activeTab === "sos" && (<div className="space-y-4">
 {/* Target WhatsApp Recipient */}
 <div>
 <div className="flex items-center justify-between mb-1.5">
 <label className="block text-xs font-semibold text-ivory-muted uppercase tracking-wider">
 Emergency WhatsApp Recipient
 </label>
 <button
 type="button"
 onClick={() => setActiveTab("contacts")}
 className="text-[11px] text-horizon-bright hover:text-horizon-bright font-semibold flex items-center gap-1 transition cursor-pointer"
 >
 <UserCheck className="w-3 h-3" />
 {contacts.some((c) => c.phone) ? "Edit Saved Contacts" : "+ Add Saved Contact"}
 </button>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
 {/* Saved contacts with phone */}
 {contacts
 .filter((c) => c.phone)
 .map((contact) => (<button
 key={contact.id}
 type="button"
 onClick={() => setSelectedContactPhone(contact.phone)}
 className={`text-left p-3 rounded-xl border text-xs transition flex items-center justify-between cursor-pointer ${
 selectedContactPhone === contact.phone
 ? "bg-horizon-deep/50 border-horizon text-horizon-bright ring-1 ring-horizon/50"
 : "bg-ink-950/50 border-white/10 text-ivory-muted hover:border-white/25"
 }`}
 >
 <div>
 <p className="font-semibold text-ivory flex items-center gap-1.5">
 {contact.name}
 {contact.isPrimary && (<span className="text-[10px] bg-horizon/20 text-horizon-bright px-1.5 py-0.2 rounded font-medium">
 Primary
 </span>
 )}
 </p>
 <p className="text-ivory-muted text-[11px] font-data mt-0.5">
 {contact.phone}
 </p>
 </div>
 {selectedContactPhone === contact.phone && (<Check className="w-4 h-4 text-horizon-bright shrink-0" />
 )}
 </button>
 ))}

 {/* Option: Choose Contact in WhatsApp */}
 <button
 type="button"
 onClick={() => setSelectedContactPhone("")}
 className={`text-left p-3 rounded-xl border text-xs transition flex items-center justify-between cursor-pointer ${
 !selectedContactPhone
 ? "bg-horizon-deep/50 border-horizon text-horizon-bright ring-1 ring-horizon/50"
 : "bg-ink-950/50 border-white/10 text-ivory-muted hover:border-white/25"
 }`}
 >
 <div>
 <p className="font-semibold text-ivory flex items-center gap-1.5">
 <span>Select in WhatsApp</span>
 <span className="text-[10px] bg-horizon/20 text-horizon-bright px-1.5 py-0.2 rounded font-medium">
 Any Contact
 </span>
 </p>
 <p className="text-ivory-muted text-[11px] mt-0.5">
 Pick any friend, family or group inside WhatsApp
 </p>
 </div>
 {!selectedContactPhone && (<Check className="w-4 h-4 text-horizon-bright shrink-0" />
 )}
 </button>
 </div>

 {/* Status hint */}
 <p className="text-[11px] text-ivory-muted mt-2">
 {selectedContactPhone ? (<span className="text-horizon-bright font-medium">
 Will dispatch directly to <span className="font-data">{selectedContactPhone}</span>
 </span>
 ) : (<span className="text-saffron-bright font-medium">
 ℹ WhatsApp will prompt you to select any contact or group from your phone book.
 </span>
 )}
 </p>
 </div>

 {/* Optional Custom Emergency Note */}
 <div>
 <label className="block text-xs font-semibold text-ivory-muted mb-1.5 uppercase tracking-wider">
 Custom Situation Note (Optional)
 </label>
 <input
 type="text"
 value={customNote}
 onChange={(e) => setCustomNote(e.target.value)}
 placeholder="e.g. Cab broke down on highway / medical emergency / lost on trek"
 className="w-full bg-ink-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-ivory placeholder-ivory-faint focus:outline-none focus:border-danger"
 />
 </div>

 {/* Big Action Buttons */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
 <button
 onClick={handleSendWhatsApp}
 className="w-full bg-gradient-to-r from-horizon to-horizon hover:from-horizon hover:to-horizon-bright text-ivory font-bold text-sm py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-horizon-deep/30 transition-transform active:scale-98 cursor-pointer"
 >
 <Share2 className="w-5 h-5" />
 Broadcast via WhatsApp
 </button>

 <button
 onClick={handleCopySOSMessage}
 className="w-full bg-ink-800 hover:bg-ink-700 text-ivory font-semibold text-sm py-3.5 px-4 rounded-2xl border border-white/15 flex items-center justify-center gap-2 transition cursor-pointer"
 >
 {copied ? <Check className="w-4 h-4 text-horizon-bright" /> : <Copy className="w-4 h-4 text-ivory-muted" />}
 {copied ? "Message Copied!" : "Copy Full SOS Text"}
 </button>
 </div>

 {/* Live Message Preview Accordion */}
 <div className="bg-ink-950/60 border border-white/10 rounded-2xl p-4 text-xs font-data text-ivory-muted space-y-1.5 whitespace-pre-line leading-relaxed">
 <div className="text-[10px] font-sans font-semibold uppercase text-ivory-faint tracking-wider mb-1 flex items-center justify-between">
 <span>Generated Distress Payload</span>
 <span className="text-horizon-bright">Live GPS Connected</span>
 </div>
 {getPayload().rawMessage}
 </div>
 </div>
 )}

 {/* TAB 2: Direct Emergency Helplines */}
 {activeTab === "direct_call" && (<div className="space-y-3">
 <p className="text-xs text-ivory-muted mb-2">
 Direct one-tap government dispatch lines for <strong className="text-ivory">{locationData?.state || "India"}</strong>:
 </p>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
 <a
 href="tel:112"
 className="p-3.5 bg-danger-950/40 hover:bg-danger-900/50 border border-danger/40 rounded-2xl flex items-center justify-between group transition"
 >
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-danger text-ivory flex items-center justify-center font-bold text-base shadow">
 112
 </div>
 <div>
 <p className="font-bold text-ivory text-sm">National Emergency</p>
 <p className="text-[11px] text-danger-bright">Police, Fire & Ambulance</p>
 </div>
 </div>
 <PhoneCall className="w-5 h-5 text-danger-bright group-hover:scale-110 transition-transform" />
 </a>

 <a
 href="tel:1091"
 className="p-3.5 bg-danger-950/40 hover:bg-danger-900/50 border border-danger/40 rounded-2xl flex items-center justify-between group transition"
 >
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-danger text-ivory flex items-center justify-center font-bold text-base shadow">
 1091
 </div>
 <div>
 <p className="font-bold text-ivory text-sm">Women in Distress</p>
 <p className="text-[11px] text-danger-bright">NCW 24x7 Helpline</p>
 </div>
 </div>
 <PhoneCall className="w-5 h-5 text-danger-bright group-hover:scale-110 transition-transform" />
 </a>

 <a
 href="tel:1363"
 className="p-3.5 bg-saffron-900/40 hover:bg-saffron-900/50 border border-saffron/40 rounded-2xl flex items-center justify-between group transition"
 >
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-saffron-deep text-ivory flex items-center justify-center font-bold text-base shadow">
 1363
 </div>
 <div>
 <p className="font-bold text-ivory text-sm">Tourist Helpline</p>
 <p className="text-[11px] text-saffron-bright">Ministry of Tourism (12 langs)</p>
 </div>
 </div>
 <PhoneCall className="w-5 h-5 text-saffron-bright group-hover:scale-110 transition-transform" />
 </a>

 <a
 href="tel:108"
 className="p-3.5 bg-horizon-deep/40 hover:bg-horizon-deep/50 border border-horizon/40 rounded-2xl flex items-center justify-between group transition"
 >
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-horizon text-ivory flex items-center justify-center font-bold text-base shadow">
 108
 </div>
 <div>
 <p className="font-bold text-ivory text-sm">Medical Ambulance</p>
 <p className="text-[11px] text-horizon-bright">Emergency Medical Service</p>
 </div>
 </div>
 <PhoneCall className="w-5 h-5 text-horizon-bright group-hover:scale-110 transition-transform" />
 </a>
 </div>

 {/* State Police Specific Nodal Note */}
 <div className="bg-ink-950/70 border border-white/10 rounded-2xl p-4 text-xs space-y-1.5 mt-3">
 <p className="text-ivory-muted font-semibold flex items-center gap-1.5">
 <Radio className="w-4 h-4 text-saffron-bright" />
 {locationData?.state || "State"} Tourist Police & Nodal Assistance:
 </p>
 <a
 href={getCleanTelUri(stateContacts.touristPolice)}
 className="inline-flex items-center gap-1.5 text-saffron-bright hover:text-ivory font-data bg-white/5 px-2.5 py-1 rounded-lg transition"
 >
 <PhoneCall className="w-3 h-3 text-saffron-bright" />
 <span>{stateContacts.touristPolice || "Dial 1363 (24x7 Multi-lingual)"}</span>
 </a>
 <p className="text-ivory-faint text-[11px]">{stateContacts.stateNotes}</p>
 </div>
 </div>
 )}

 {/* TAB 3: Configure Trusted Contacts */}
 {activeTab === "contacts" && (<div className="space-y-4">
 <p className="text-xs text-ivory-muted">
 Save your family or emergency contacts. When you tap Broadcast via WhatsApp, their number will be pre-targeted with your exact GPS link and distress message.
 </p>

 {contacts.map((contact, idx) => (<div
 key={contact.id}
 className="bg-ink-950/80 border border-white/10 rounded-2xl p-4 space-y-3"
 >
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold text-ivory uppercase tracking-wider flex items-center gap-2">
 <span className="w-5 h-5 rounded-full bg-danger/20 text-danger-bright flex items-center justify-center text-[10px]">
 {idx + 1}
 </span>
 {contact.isPrimary ? "Primary Contact" : "Secondary Contact"}
 </span>
 {contact.isPrimary && (<span className="text-[10px] bg-horizon/20 text-horizon-bright px-2 py-0.5 rounded-full font-medium">
 Auto-Selected for WhatsApp
 </span>
 )}
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-[11px] text-ivory-muted mb-1">Contact Name</label>
 <input
 type="text"
 value={contact.name}
 onChange={(e) => handleSaveContact(contact.id, "name", e.target.value)}
 placeholder="e.g. Mom, Brother, Friend"
 className="w-full bg-ink-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-ivory focus:outline-none focus:border-danger"
 />
 </div>
 <div>
 <label className="block text-[11px] text-ivory-muted mb-1">WhatsApp Phone (with Country Code)</label>
 <input
 type="tel"
 value={contact.phone}
 onChange={(e) => handleSaveContact(contact.id, "phone", e.target.value)}
 placeholder="e.g. 919876543210"
 className="w-full bg-ink-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-ivory font-data focus:outline-none focus:border-danger"
 />
 </div>
 </div>
 </div>
 ))}

 <button
 onClick={() => {
 toast.success("Emergency contacts saved securely in local storage!");
 setActiveTab("sos");
 }}
 className="w-full bg-danger hover:bg-danger text-ivory font-semibold text-xs py-2.5 rounded-xl transition"
 >
 Save & Return to SOS Broadcast
 </button>
 </div>
 )}
 </div>

 {/* Footer */}
 <div className="bg-ink-950 border-t border-white/10 px-6 py-3.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-ivory-faint">
 <span className="flex items-center gap-1.5">
 <span className="w-2 h-2 rounded-full bg-horizon-bright animate-pulse" />
 SafarX Emergency Core active & encrypted
 </span>
 <div className="flex items-center gap-3">
 <span className="text-ivory-muted hidden sm:inline">Press ESC or</span>
 <button
 type="button"
 onClick={onClose}
 className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-ivory font-medium text-xs transition border border-white/10 cursor-pointer"
 >
 Close Beacon
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 </AnimatePresence>
 );
}
