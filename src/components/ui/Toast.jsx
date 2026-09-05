// src/components/ui/Toast.jsx
import React from "react";
import toast, { resolveValue } from "react-hot-toast";
import { Check, AlertTriangle, Info, Loader2, X } from "lucide-react";

/**
 * The house notification: a capsule.
 *
 * react-hot-toast's default is a white pill with a coloured tick, which on a
 * dark teal application looks like a browser alert nobody styled. This
 * replaces the chrome without touching a single call site — it is passed as
 * the Toaster's render function, so every existing toast.success and
 * toast.error in the app comes out in the new dress.
 *
 * Emoji are deliberately absent. They render differently on every platform,
 * they sit at a different optical weight to the type beside them, and a
 * rocket in front of "Planning your itinerary" is not a status — it is
 * decoration standing where an icon should be. Lucide glyphs instead.
 */

const TONES = {
  success: { Icon: Check, accent: "#D4A843", tint: "rgba(212,168,67,0.16)", ring: "rgba(212,168,67,0.45)" },
  error: { Icon: AlertTriangle, accent: "#E05252", tint: "rgba(224,82,82,0.16)", ring: "rgba(224,82,82,0.45)" },
  loading: { Icon: Loader2, accent: "#3FA98E", tint: "rgba(46,139,116,0.18)", ring: "rgba(46,139,116,0.45)" },
  blank: { Icon: Info, accent: "#8FB9AC", tint: "rgba(143,185,172,0.14)", ring: "rgba(143,185,172,0.38)" },
};

/* The countdown runs around the icon rather than along the bottom edge. In a
   stadium the ends curve away, so a straight bar either pokes out of the
   shape or has to be inset far enough that it reads as a stray line. */
const R = 15;
const CIRCUMFERENCE = 2 * Math.PI * R;

export default function Toast({ t }) {
  const { Icon, accent, tint, ring } = TONES[t.type] || TONES.blank;
  const message = resolveValue(t.message, t);
  /* A loading toast waits on real work, so it has no time to count down. */
  const timed = Number.isFinite(t.duration) && t.type !== "loading";

  return (
    <div
      className={`pointer-events-auto flex min-w-[300px] max-w-[440px] items-center gap-3 rounded-full
                  border border-white/[0.10] bg-ink-900/95 py-2 pl-2 pr-2.5
                  shadow-[0_18px_50px_-14px_rgba(0,0,0,0.8)] backdrop-blur-2xl
                  ${t.visible ? "toast-in" : "toast-out"}`}
      style={{ boxShadow: `0 18px 50px -14px rgba(0,0,0,0.8), inset 0 0 0 1px ${ring}22` }}
    >
      <span className="relative grid h-8 w-8 shrink-0 place-items-center">
        {timed && (
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 32 32" aria-hidden="true">
            <circle cx="16" cy="16" r={R} fill="none" stroke={ring} strokeOpacity="0.3" strokeWidth="1.5" />
            <circle
              className="toast-ring"
              cx="16"
              cy="16"
              r={R}
              fill="none"
              stroke={accent}
              strokeWidth="1.5"
              strokeLinecap="round"
              style={{
                strokeDasharray: CIRCUMFERENCE,
                "--c": CIRCUMFERENCE,
                animationDuration: `${t.duration}ms`,
              }}
            />
          </svg>
        )}
        <span
          className="grid h-[26px] w-[26px] place-items-center rounded-full"
          style={{ background: tint }}
          aria-hidden="true"
        >
          <Icon
            size={13}
            strokeWidth={2.5}
            style={{ color: accent }}
            className={t.type === "loading" ? "animate-spin" : undefined}
          />
        </span>
      </span>

      <p
        {...t.ariaProps}
        className="min-w-0 flex-1 text-[13.5px] font-medium leading-snug text-ivory line-clamp-2"
      >
        {message}
      </p>

      <button
        type="button"
        onClick={() => toast.dismiss(t.id)}
        aria-label="Dismiss"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-ivory-faint
                   transition hover:bg-white/10 hover:text-ivory"
      >
        <X size={13} />
      </button>
    </div>
  );
}
