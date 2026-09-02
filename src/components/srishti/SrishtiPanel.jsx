import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, Mic, MicOff, Keyboard, CornerDownLeft } from "lucide-react";
import SrishtiRings from "./SrishtiRings";
import vrTours from "../../data/vrTours.json";
import { setIntent } from "../../services/srishtiIntent";
import { LiveSession } from "../../services/srishtiLive";

const EASE = [0.22, 1, 0.36, 1];

/* Things worth saying out loud, in the languages people actually use here. */
const OPENERS = [
  { text: "Trains from Delhi to Jaipur", hint: "Live timetable" },
  { text: "मुझे उदयपुर में होटल चाहिए", hint: "Stays, in Hindi" },
  { text: "Show me Varanasi in 360", hint: "She opens it" },
  { text: "Hidden gems near Kochi", hint: "Off the guidebook" },
];

/** What she just did, phrased for a person rather than named after an endpoint. */
const TOOL_LABEL = {
  search_stays: "searched stays",
  trains_between: "checked the timetable",
  pnr_status: "checked your ticket",
  find_vr_tour: "found a 360° tour",
  hidden_gems_near: "looked for hidden gems",
  plan_itinerary: "drew up an itinerary",
  emergency_sos: "opened the emergency beacon",
  check_safety: "checked how safe it is",
  create_reel: "set up your reel",
  open_page: "opened the page",
};

const SrishtiPanel = ({ open, onClose, onPageChange }) => {
  const navigate = useNavigate();

  const [state, setState] = useState("idle"); // idle | listening | thinking | speaking
  const [caption, setCaption] = useState(null);
  const [heard, setHeard] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [error, setError] = useState(null);
  const [docked, setDocked] = useState(false);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const [live, setLive] = useState(false);
  const [muted, setMuted] = useState(false);

  const session = useRef(null);
  const inputRef = useRef(null);

  /* Reset everything when she is dismissed. */
  useEffect(() => {
    if (open) return;
    session.current?.stop();
    session.current = null;
    setState("idle");
    setLive(false);
    setMuted(false);
    setDocked(false);
    setTyping(false);
  }, [open]);

  /* Never leave the microphone open behind us. */
  useEffect(() => () => session.current?.stop(), []);

  useEffect(() => {
    if (typing) inputRef.current?.focus();
  }, [typing]);

  /** Opens the microphone and the socket. After this she simply listens. */
  const goLive = useCallback(async () => {
    if (session.current) return;
    setError(null);
    setState("thinking");

    const next = new LiveSession({
      onState: (s2) => {
        if (s2 === "closed") {
          session.current = null;
          setLive(false);
          setState("idle");
          return;
        }
        setState(s2 === "connecting" ? "thinking" : s2);
      },
      // The session assembles each turn; these are whole strings, not deltas.
      onHeard: (text) => setHeard(text || null),
      onSaid: (text) => setCaption(text || null),
      onNavigate: (to, tourId, intent) => {
        setDocked(true);
        // Published before navigating, so the page finds it as it mounts.
        if (intent) setIntent(intent);
        /* The tour goes to the VR tours page, which knows all 34 of them and
           opens whichever it is handed. The 360° explorer carries its own list
           of four and always opens the first — which is the Taj, so asking for
           the Taj looked right and asking for anything else quietly showed the
           Taj instead. */
        const tour = tourId && vrTours.find((t) => t.id === tourId);
        if (tour && onPageChange) onPageChange("360tour", tour);
        else navigate(to);
      },
      onTool: (name) => setReceipts((prev) => [...new Set([...prev, TOOL_LABEL[name] || name])]),
      onError: (message) => setError(message),
    });

    try {
      await next.start();
      session.current = next;
      setLive(true);
      setMuted(false);
    } catch (err) {
      setError(
        err?.name === "NotAllowedError"
          ? "I need the microphone to hear you. Allow it for this site and tap again."
          : err?.message || "I couldn't start listening."
      );
      setState("idle");
    }
  }, [navigate, onPageChange]);

  const toggleMute = useCallback(() => {
    setMuted((wasMuted) => {
      const next = !wasMuted;
      session.current?.mute(next);
      return next;
    });
  }, []);

  const send = (text) => {
    const said = text.trim();
    if (!said) return;
    setDraft("");
    setTyping(false);
    setCaption(null);
    setHeard(said);
    if (session.current) session.current.say(said);
    else setError("Tap the microphone first — she listens live.");
  };



  useEffect(() => {
    if (!open) return undefined;
    const down = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [open, onClose]);

  const status = !live
    ? "Tap to start talking"
    : muted
      ? "Microphone off"
      : { idle: "Listening", listening: "Listening", thinking: "Connecting", speaking: "Srishti" }[state];

  return (
    <AnimatePresence>
      {open && (
        <Motion.div
          key="srishti"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className={
            docked
              ? "fixed bottom-6 right-6 z-[80] w-[min(23rem,calc(100vw-3rem))]"
              : "fixed inset-0 z-[80] flex items-center justify-center"
          }
        >
          {/* The field she stands in. Dismissed when docked so the page shows. */}
          {!docked && (
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-ink-950/[0.97] backdrop-blur-2xl"
              onClick={onClose}
              aria-hidden="true"
            >
              {/* A pool of shade under her, so the rings sit on ink rather than
                  on whatever page she was called from. */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_45%,rgba(6,20,18,0.96)_0%,rgba(6,20,18,0.82)_60%,rgba(6,20,18,0.7)_100%)]" />
            </Motion.div>
          )}

          <Motion.div
            layout
            transition={{ duration: 0.5, ease: EASE }}
            className={
              docked
                ? "relative rounded-3xl border border-white/[0.1] bg-ink-900/95 backdrop-blur-2xl p-4 shadow-[0_28px_80px_rgba(0,0,0,0.7)]"
                : "relative flex flex-col items-center px-6 text-center"
            }
          >
            <button
              onClick={onClose}
              aria-label="Close Srishti"
              className="absolute -top-1 right-0 z-10 flex h-9 w-9 items-center justify-center rounded-full
                         border border-white/[0.09] text-ivory/60 transition-colors hover:border-saffron/40 hover:text-saffron"
              style={docked ? { top: "0.5rem", right: "0.5rem" } : { top: "-4.5rem", right: "-0.5rem" }}
            >
              <X size={15} />
            </button>

            <div className={docked ? "flex items-center gap-3" : "flex flex-col items-center"}>
              <SrishtiRings state={state} level={() => session.current?.level() ?? 0} size={docked ? 74 : 300} />

              {docked && (
                <div className="min-w-0 flex-1">
                  <p className="font-data text-[9px] uppercase tracking-[0.2em] text-saffron">{status}</p>
                  <p className="mt-1 line-clamp-3 font-display text-[13.5px] leading-snug text-ivory">
                    {caption || "Ask me anything."}
                  </p>
                </div>
              )}
            </div>

            {!docked && (
              <>
                {/* Her name, and the state she is in — one line, no chrome. */}
                <div className="mt-8 flex items-center justify-center gap-3">
                  <p className="font-data text-[10px] uppercase tracking-[0.28em] text-saffron">{status}</p>
                </div>

                {/* What she says, as a caption rather than a chat bubble.
                    Only the last thing — this is a conversation, not a log. */}
                {/* What she heard you say. Small, above her reply, so a
                    mishearing is obvious rather than mysterious. */}
                <div className="mt-4 flex min-h-[1.5rem] items-center justify-center">
                  <AnimatePresence mode="wait">
                    {heard && (
                      <Motion.p
                        key={heard}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="max-w-xl truncate text-[13px] text-ivory-faint"
                      >
                        “{heard}”
                      </Motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-2 flex min-h-[7.5rem] max-w-2xl items-start justify-center">
                  <AnimatePresence mode="wait">
                    {error ? (
                      <Motion.p
                        key="error"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="max-w-md text-[15px] leading-relaxed text-ivory-muted"
                      >
                        {error}
                      </Motion.p>
                    ) : caption ? (
                      <Motion.p
                        key={caption}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.45, ease: EASE }}
                        className="font-display text-[clamp(1.25rem,3vw,1.9rem)] font-light italic leading-[1.35] text-ivory"
                        style={{ textWrap: "balance" }}
                      >
                        {caption}
                      </Motion.p>
                    ) : (
                      <Motion.p
                        key="prompt"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="font-display text-[clamp(1.25rem,3vw,1.9rem)] font-light italic text-ivory-faint"
                      >
                        मैं सृष्टि हूँ. Ask me anything about India.
                      </Motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* What she actually did, so the work is visible rather than magic. */}
                <div className="flex min-h-[1.5rem] items-center gap-2">
                  <AnimatePresence>
                    {receipts.map((r) => (
                      <Motion.span
                        key={r}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="font-data text-[9.5px] uppercase tracking-[0.16em] text-ivory-faint"
                      >
                        <span className="route-dot mr-2 inline-block align-middle" aria-hidden="true" />
                        {r}
                      </Motion.span>
                    ))}
                  </AnimatePresence>
                </div>

                {/* One control. The microphone is the interface. */}
                <div className="mt-10 flex flex-col items-center gap-5">
                  {typing ? (
                    <div className="flex w-[min(30rem,calc(100vw-3rem))] items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-5 py-3">
                      <input
                        ref={inputRef}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && send(draft)}
                        placeholder="Type instead"
                        aria-label="Ask Srishti"
                        className="w-full bg-transparent text-[15px] text-ivory placeholder:text-ivory-faint focus:outline-none"
                      />
                      <button
                        onClick={() => send(draft)}
                        aria-label="Send"
                        className="text-ivory-faint transition-colors hover:text-saffron"
                      >
                        <CornerDownLeft size={15} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={live ? toggleMute : goLive}
                      aria-label={
                        !live ? "Start talking to Srishti" : muted ? "Turn the microphone on" : "Turn the microphone off"
                      }
                      className={`flex h-16 w-16 items-center justify-center rounded-full border transition-all duration-500 ${
                        !live
                          ? "border-saffron/40 bg-saffron/10 text-saffron hover:border-saffron/70 hover:bg-saffron/20"
                          : muted
                            ? "border-white/[0.12] bg-white/[0.04] text-ivory-faint hover:text-ivory"
                            : state === "listening"
                              ? "scale-110 border-horizon/60 bg-horizon/15 text-horizon"
                              : "border-saffron/35 bg-saffron/10 text-saffron"
                      }`}
                    >
                      {live && muted ? <MicOff size={22} /> : <Mic size={22} />}
                    </button>
                  )}

                  {/* Once she is listening there is nothing to press — say so,
                      so nobody sits waiting for a button. */}
                  {live && !muted && (
                    <p className="font-data text-[9px] uppercase tracking-[0.18em] text-ivory-faint">
                      Just talk — she hears you. Interrupt any time.
                    </p>
                  )}

                  <button
                    onClick={() => setTyping((v) => !v)}
                    className="flex items-center gap-2 font-data text-[9.5px] uppercase tracking-[0.18em] text-ivory-faint transition-colors hover:text-ivory"
                  >
                    <Keyboard size={11} aria-hidden="true" />
                    {typing ? "Use your voice" : "Too loud? Type instead"}
                  </button>
                </div>

                {/* Openers, only while she has nothing to say yet. */}
                <AnimatePresence>
                  {!caption && !error && state === "idle" && (
                    <Motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mt-10 flex flex-wrap items-center justify-center gap-2"
                    >
                      {OPENERS.map((o) => (
                        <button
                          key={o.text}
                          onClick={() => send(o.text)}
                          className="group rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2
                                     text-left transition-colors hover:border-saffron/35 hover:bg-saffron/[0.06]"
                        >
                          <span className="block text-[12.5px] text-ivory">{o.text}</span>
                          <span className="block font-data text-[8.5px] uppercase tracking-[0.16em] text-ivory-faint">
                            {o.hint}
                          </span>
                        </button>
                      ))}
                    </Motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            {/* Docked: one control, so she can be sent away or asked again. */}
            {docked && (
              <div className="mt-3 flex items-center gap-2 border-t border-white/[0.07] pt-3">
                <button
                  onClick={live ? toggleMute : goLive}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                    live && !muted
                      ? "border-horizon/60 bg-horizon/15 text-horizon"
                      : "border-saffron/35 bg-saffron/10 text-saffron"
                  }`}
                  aria-label={live && !muted ? "Turn the microphone off" : "Turn the microphone on"}
                >
                  {live && muted ? <MicOff size={14} /> : <Mic size={14} />}
                </button>
                <button
                  onClick={() => setDocked(false)}
                  className="font-data text-[9px] uppercase tracking-[0.16em] text-ivory-faint transition-colors hover:text-saffron"
                >
                  Full view
                </button>
              </div>
            )}
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
};

export default SrishtiPanel;
