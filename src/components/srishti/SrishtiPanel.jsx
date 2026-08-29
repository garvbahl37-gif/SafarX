import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, Mic, Keyboard, CornerDownLeft } from "lucide-react";
import SrishtiRings from "./SrishtiRings";
import { Listener, Voice, ask } from "../../services/srishtiClient";

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
  open_page: "opened the page",
};

const SrishtiPanel = ({ open, onClose }) => {
  const navigate = useNavigate();

  const [state, setState] = useState("idle"); // idle | listening | thinking | speaking
  const [caption, setCaption] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [error, setError] = useState(null);
  const [docked, setDocked] = useState(false);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");

  const listener = useRef(null);
  const voice = useRef(null);
  const history = useRef([]);
  const inputRef = useRef(null);

  voice.current ||= new Voice();

  /* Reset everything when she is dismissed. */
  useEffect(() => {
    if (open) return;
    listener.current?.cancel();
    voice.current?.stop();
    setState("idle");
    setDocked(false);
    setTyping(false);
  }, [open]);

  useEffect(() => {
    if (typing) inputRef.current?.focus();
  }, [typing]);

  const respond = useCallback(
    async (payload) => {
      setError(null);
      setState("thinking");
      try {
        const reply = await ask({ ...payload, history: history.current });

        history.current = [
          ...history.current,
          { role: "user", text: payload.text || "(spoken)" },
          { role: "srishti", text: reply.text },
        ].slice(-8);

        setCaption(reply.text);
        setReceipts((reply.toolsUsed || []).map((t) => TOOL_LABEL[t] || t));

        // She moves the app first, then talks over it — so pull her aside to
        // the corner where the page is visible behind her.
        if (reply.navigate) {
          setDocked(true);
          navigate(reply.navigate, reply.tourId ? { state: { tourId: reply.tourId } } : undefined);
        }

        setState("speaking");
        await voice.current.say(reply.text);
        setState("idle");
      } catch (err) {
        setError(err.message);
        setState("idle");
      }
    },
    [navigate]
  );

  const startListening = useCallback(async () => {
    if (state === "listening" || state === "thinking") return;
    voice.current?.stop();
    setError(null);
    setCaption(null);
    setReceipts([]);
    listener.current = new Listener();
    try {
      await listener.current.start();
      setState("listening");
    } catch {
      setError("I can't reach your microphone. Check the browser's permission for this site.");
      setState("idle");
    }
  }, [state]);

  const stopListening = useCallback(async () => {
    if (state !== "listening") return;
    const clip = await listener.current?.stop();
    if (!clip) {
      setState("idle");
      setError("That was too short to hear. Hold the button while you speak.");
      return;
    }
    respond(clip);
  }, [state, respond]);

  const send = (text) => {
    const said = text.trim();
    if (!said) return;
    setDraft("");
    setTyping(false);
    respond({ text: said });
  };

  /* Space to talk, escape to leave. */
  useEffect(() => {
    if (!open) return undefined;
    const down = (e) => {
      if (e.key === "Escape") return onClose();
      if (e.code === "Space" && !typing && !e.repeat && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        startListening();
      }
      return undefined;
    };
    const up = (e) => {
      if (e.code === "Space" && !typing) {
        e.preventDefault();
        stopListening();
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [open, typing, startListening, stopListening, onClose]);

  const status = {
    idle: "Hold to speak",
    listening: "Listening",
    thinking: "One moment",
    speaking: "Srishti",
  }[state];

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
              <SrishtiRings state={state} level={() => voice.current?.level() ?? 0} size={docked ? 74 : 300} />

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
                <p className="mt-8 font-data text-[10px] uppercase tracking-[0.28em] text-saffron">
                  {status}
                </p>

                {/* What she says, as a caption rather than a chat bubble.
                    Only the last thing — this is a conversation, not a log. */}
                <div className="mt-5 flex min-h-[7.5rem] max-w-2xl items-start justify-center">
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
                      onPointerDown={startListening}
                      onPointerUp={stopListening}
                      onPointerLeave={stopListening}
                      disabled={state === "thinking" || state === "speaking"}
                      aria-label="Hold to speak to Srishti"
                      className={`flex h-16 w-16 items-center justify-center rounded-full border transition-all duration-300
                                  disabled:cursor-not-allowed disabled:opacity-40 ${
                                    state === "listening"
                                      ? "border-horizon/60 bg-horizon/15 text-horizon scale-110"
                                      : "border-saffron/35 bg-saffron/10 text-saffron hover:border-saffron/60 hover:bg-saffron/15"
                                  }`}
                    >
                      <Mic size={22} />
                    </button>
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
                  onPointerDown={startListening}
                  onPointerUp={stopListening}
                  disabled={state === "thinking" || state === "speaking"}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors disabled:opacity-40 ${
                    state === "listening"
                      ? "border-horizon/60 bg-horizon/15 text-horizon"
                      : "border-saffron/35 bg-saffron/10 text-saffron"
                  }`}
                  aria-label="Hold to speak to Srishti"
                >
                  <Mic size={14} />
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
