// src/components/safety/SOSQuickPanel.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/clerk-react";
import {
  PhoneCall,
  Share2,
  Volume2,
  VolumeX,
  Copy,
  Check,
  MapPin,
  RefreshCw,
  ChevronRight,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getCurrentDeviceLocation,
  watchDeviceLocation,
  reverseGeocodeCoords,
  buildWhatsAppSOSPayload,
  getSavedEmergencyContacts,
  formatWhatsAppPhoneNumber,
  startEmergencySiren,
  stopEmergencySiren,
} from "../../services/safetyService";

/**
 * SOSQuickPanel — the fast path, as a popover rather than a takeover.
 *
 * The full beacon puts three tabs, a recipient picker, a note field and a
 * payload preview in front of you. That is a reasonable amount of screen
 * for configuring an emergency; it is an unreasonable amount for having
 * one. Someone who has just pressed a red button wants two things inside
 * two seconds — a phone call, and for somebody to know where they are.
 *
 * So this panel carries exactly those, at thumb size, anchored to the
 * button that opened it. Everything else — editing contacts, the state
 * helpline directory, the custom note — is one tap away in the full
 * beacon, which is still there and unchanged.
 *
 * Deliberately absent: the full beacon's five-second "Broadcasting in Ns"
 * countdown. Nothing was ever wired to fire when it reached zero, so it
 * announced a broadcast that never happened. Here every send is an
 * explicit tap, which needs no cancel affordance.
 */

const QUICK_LINES = [
  { number: "108", label: "Ambulance" },
  { number: "1091", label: "Women" },
  { number: "1363", label: "Tourist" },
];

export default function SOSQuickPanel({
  onClose,
  onOpenFull,
  defaultDestination = "Current Location",
}) {
  const { user } = useUser();
  const panelRef = useRef(null);

  const [location, setLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(true);
  const [locError, setLocError] = useState(null);
  const [contact, setContact] = useState(null);
  const [sirenOn, setSirenOn] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchLocation = useCallback(async () => {
    setLocLoading(true);
    setLocError(null);
    try {
      const coords = await getCurrentDeviceLocation();
      setLocation(coords);
      // The address is a nicety; the numbers are what rescuers need. Show
      // the fix now and let the name land late.
      reverseGeocodeCoords(coords.latitude, coords.longitude)
        .then((geo) => setLocation((prev) => (prev ? { ...prev, ...geo } : prev)))
        .catch(() => {});
    } catch (err) {
      setLocError(err.message || "Could not get your location.");
      setLocation(null);
    } finally {
      setLocLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = getSavedEmergencyContacts(user?.id);
    setContact(saved.find((c) => c.isPrimary && c.phone) || saved.find((c) => c.phone) || null);
    fetchLocation();
    return () => {
      stopEmergencySiren();
    };
  }, [user?.id, fetchLocation]);

  // Keep the fix current — the person this exists for may be moving.
  useEffect(() => {
    if (locError) return undefined;
    return watchDeviceLocation((coords) => {
      setLocation((prev) => {
        // Never let a noisy reading widen a tight one.
        if (prev?.accuracy && coords.accuracy > prev.accuracy * 2) return prev;
        return { ...prev, ...coords };
      });
    });
  }, [locError]);

  // Escape, and any click that lands outside, close the panel.
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    const onDown = (e) => {
      if (!panelRef.current?.contains(e.target)) onClose();
    };
    window.addEventListener("keydown", onKey);
    // Deferred: the click that opened the panel is still propagating.
    const t = setTimeout(() => window.addEventListener("pointerdown", onDown), 0);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
      clearTimeout(t);
    };
  }, [onClose]);

  /* Passes through only what is actually known. With no fix, the builder
     writes "location unavailable" rather than inventing a pin — the message
     still sends, because someone in trouble without GPS still needs help. */
  const payload = () =>
    buildWhatsAppSOSPayload({
      recipientPhone: contact?.phone || "",
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
      accuracy: location?.accuracy ?? null,
      address: location?.formattedAddress || "",
      state: location?.state || "",
      activeTripName: defaultDestination,
      batteryLevel: null,
      customNote: "",
    });

  const sendWhatsApp = () => {
    const p = payload();
    toast.success(
      contact?.phone
        ? `Sending your location to ${contact.name || formatWhatsAppPhoneNumber(contact.phone)}…`
        : "Opening WhatsApp — pick anyone to send to."
    );
    window.open(p.whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const copyMessage = () => {
    navigator.clipboard.writeText(payload().rawMessage);
    setCopied(true);
    toast.success("SOS message and location link copied.");
    setTimeout(() => setCopied(false), 2500);
  };

  const toggleSiren = () => {
    if (sirenOn) {
      stopEmergencySiren();
      setSirenOn(false);
      toast("Siren off");
    } else if (startEmergencySiren()) {
      setSirenOn(true);
      toast.error("SIREN ON", { duration: 3000 });
    }
  };

  return (
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-label="Emergency quick actions"
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.96 }}
      transition={{ type: "spring", damping: 26, stiffness: 340 }}
      className="fixed bottom-24 left-6 z-50 w-[336px] max-w-[calc(100vw-3rem)]
                 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-[26px]
                 border border-white/12 bg-ink-900/95 text-ivory shadow-2xl
                 shadow-black/60 backdrop-blur-2xl"
      style={{ transformOrigin: "bottom left" }}
    >
      {/* A hairline of danger along the top edge — enough to say what this
          is without painting the whole panel red. */}
      <div className="h-[3px] rounded-t-[26px] bg-gradient-to-r from-danger via-danger-bright to-saffron" />

      <div className="p-4">
        {/* Header: what it is, where you are, and a way out */}
        <div className="mb-3.5 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-data text-[10px] uppercase tracking-[0.2em] text-danger-bright">
              Emergency
            </p>
            <div className="mt-1 flex items-start gap-1.5 text-[11px]">
              <MapPin className="mt-[3px] h-3 w-3 shrink-0 text-ivory-faint" />
              <div className="min-w-0">
                {locLoading ? (
                  <span className="animate-pulse text-ivory-faint">Finding you…</span>
                ) : locError ? (
                  <button
                    type="button"
                    onClick={fetchLocation}
                    className="inline-flex items-center gap-1 text-left font-medium text-danger-bright hover:text-ivory"
                  >
                    Location unavailable
                    <RefreshCw className="h-3 w-3" />
                  </button>
                ) : location ? (
                  <>
                    <span className="block truncate font-medium text-ivory">
                      {location.city ? `${location.city}, ${location.state}` : "Locating address…"}
                    </span>
                    <span className="font-data text-[10px] text-ivory-faint">
                      ±{location.accuracy}m · live
                    </span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full
                       text-ivory-faint transition hover:bg-white/10 hover:text-ivory"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* The two things that matter, at thumb size */}
        <a
          href="tel:112"
          className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-danger to-danger-bright
                     px-4 py-3 shadow-lg shadow-danger-900/40 transition active:scale-[0.98]"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-black/25 font-data text-base font-bold">
            112
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold leading-tight">Call emergency</span>
            <span className="block text-[11px] text-ivory/75">Police · Fire · Ambulance</span>
          </span>
          <PhoneCall className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110" />
        </a>

        <button
          type="button"
          onClick={sendWhatsApp}
          className="group mt-2 flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r
                     from-horizon-deep to-horizon px-4 py-3 text-left shadow-lg
                     shadow-horizon-deep/30 transition active:scale-[0.98]"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-black/20">
            <Share2 className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold leading-tight">Send my location</span>
            <span className="block truncate text-[11px] text-ivory/75">
              {contact?.phone
                ? `WhatsApp ${contact.name || formatWhatsAppPhoneNumber(contact.phone)}`
                : "WhatsApp — choose anyone"}
            </span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </button>

        {/* Secondary pair */}
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={toggleSiren}
            className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5
                        text-xs font-semibold transition ${
                          sirenOn
                            ? "border-danger-bright bg-danger text-ivory"
                            : "border-white/12 bg-white/5 text-ivory-muted hover:border-danger/50 hover:text-ivory"
                        }`}
          >
            {sirenOn ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            {sirenOn ? "Stop siren" : "Siren"}
          </button>

          <button
            type="button"
            onClick={copyMessage}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-white/12
                       bg-white/5 px-3 py-2.5 text-xs font-semibold text-ivory-muted
                       transition hover:border-white/25 hover:text-ivory"
          >
            {copied ? (
              <Check className="h-4 w-4 text-horizon-bright" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        {/* One-tap lines that are not 112 */}
        <div className="mt-3 flex items-center gap-1.5">
          {QUICK_LINES.map((l) => (
            <a
              key={l.number}
              href={`tel:${l.number}`}
              className="flex flex-1 flex-col items-center rounded-xl border border-white/10
                         bg-ink-950/60 py-2 transition hover:border-danger/40 hover:bg-ink-800"
            >
              <span className="font-data text-sm font-bold text-ivory">{l.number}</span>
              <span className="text-[9px] uppercase tracking-wider text-ivory-faint">
                {l.label}
              </span>
            </a>
          ))}
        </div>

        {/* Everything the fast path deliberately left out */}
        <button
          type="button"
          onClick={onOpenFull}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-2
                     text-[11px] font-medium text-ivory-muted transition hover:text-ivory"
        >
          Contacts, note &amp; all helplines
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
