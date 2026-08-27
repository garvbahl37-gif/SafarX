import React, { useState } from "react";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { getIcon } from "./icons";

const TONE = {
  critical: {
    wrap: "border-saffron/40 bg-saffron/[0.08]",
    icon: "text-saffron",
    tag: "Altitude",
  },
  warning: {
    wrap: "border-saffron/25 bg-saffron/[0.045]",
    icon: "text-saffron/80",
    tag: "Heads up",
  },
  info: {
    wrap: "border-white/[0.07] bg-white/[0.02]",
    icon: "text-ivory-muted",
    tag: "Note",
  },
};

/**
 * India-specific advisories generated from the trip config — monsoon windows,
 * altitude acclimatisation, permits, hotel ID copies.
 */
const InsightNotes = ({ insights = [] }) => {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(true);
  if (!insights.length) return null;

  return (
    <section aria-label="Trip advisories">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="insight-list"
        className="flex w-full items-center gap-3"
      >
        <span className="eyebrow whitespace-nowrap">Before you go · {insights.length}</span>
        <span className="route-line flex-1" aria-hidden="true" />
        <Motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: reduce ? 0 : 0.3 }}
          className="text-ivory-faint"
        >
          <ChevronDown size={16} />
        </Motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <Motion.ul
            id="insight-list"
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="grid gap-3 pt-4 md:grid-cols-2">
              {insights.map((note, i) => {
                const tone = TONE[note.tone] || TONE.info;
                const Icon = getIcon(note.icon);
                return (
                  <Motion.li
                    key={note.id}
                    initial={reduce ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    className={`rounded-xl border px-4 py-3.5 ${tone.wrap}`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon size={17} className={`mt-0.5 shrink-0 ${tone.icon}`} />
                      <div className="min-w-0">
                        <p className="font-display text-[0.9375rem] leading-snug text-ivory">{note.title}</p>
                        <p className="mt-1.5 text-[13px] leading-relaxed text-ivory-muted">{note.body}</p>
                      </div>
                    </div>
                  </Motion.li>
                );
              })}
            </div>
          </Motion.ul>
        )}
      </AnimatePresence>
    </section>
  );
};

export default InsightNotes;
