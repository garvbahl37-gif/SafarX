/**
 * ImmersiveChrome — the shared dark-glass furniture used by the SafarX
 * street view and orbital view surfaces.
 *
 * Everything here follows the "Peacock & Gold" system: ink glass pills,
 * hairline borders, gold icons, Fraunces for place names, Space Grotesk
 * for coordinates and eyebrows. All motion respects prefers-reduced-motion.
 */

import React from "react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { EASE } from "./immersiveUtils";

/* ── Icon-only glass button ─────────────────────────────────────────── */
export const GlassIconButton = ({
    icon: Icon,
    label,
    onClick,
    active = false,
    pressed,
    className = "",
    ...rest
}) => (
    <button
        type="button"
        onClick={onClick}
        aria-label={label}
        title={label}
        {...(pressed === undefined ? {} : { "aria-pressed": pressed })}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-xl transition-colors duration-300 ${active
            ? "border-saffron/45 bg-saffron/15 text-saffron"
            : "border-white/[0.09] bg-ink-950/70 text-ivory-muted hover:border-saffron/35 hover:text-saffron"
            } ${className}`}
        {...rest}
    >
        {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
    </button>
);

/* ── Glass pill button with a label ─────────────────────────────────── */
export const GlassButton = ({
    icon: Icon,
    children,
    onClick,
    tone = "ghost",
    className = "",
    ...rest
}) => (
    <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold tracking-wide backdrop-blur-xl transition-colors duration-300 ${tone === "gold"
            ? "border-saffron/45 bg-saffron/15 text-saffron hover:bg-saffron/25"
            : "border-white/[0.09] bg-ink-950/70 text-ivory hover:border-saffron/35"
            } ${className}`}
        {...rest}
    >
        {Icon && <Icon className="h-4 w-4 shrink-0 text-saffron" aria-hidden="true" />}
        {children}
    </button>
);

/* ── Static eyebrow badge (route dot + label) ───────────────────────── */
export const LiveBadge = ({ label = "Live", className = "" }) => (
    <span
        className={`inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-ink-950/70 px-3 py-1.5 backdrop-blur-xl ${className}`}
    >
        <span className="route-dot animate-pulse" aria-hidden="true" />
        <span className="font-data text-[10px] uppercase tracking-[0.24em] text-saffron">
            {label}
        </span>
    </span>
);

/* ── Heads-up readout: place name + coordinates ─────────────────────── */
export const ViewportHud = ({
    badge = "Live",
    name,
    coords,
    meta,
    className = "",
}) => {
    const reduce = useReducedMotion();

    return (
        <Motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
            className={`pointer-events-none select-none ${className}`}
        >
            <div className="glass-panel max-w-[19rem] px-4 py-3">
                <div className="mb-2 flex items-center gap-2">
                    <span className="route-dot animate-pulse" aria-hidden="true" />
                    <span className="font-data text-[10px] uppercase tracking-[0.24em] text-saffron">
                        {badge}
                    </span>
                </div>
                {name && (
                    <p className="truncate font-display text-lg font-medium italic leading-tight text-ivory">
                        {name}
                    </p>
                )}
                {coords && (
                    <p className="mt-1 font-data text-[11px] uppercase tracking-[0.16em] text-ivory-faint">
                        {coords}
                    </p>
                )}
                {meta && (
                    <p className="mt-2 font-data text-[10px] uppercase tracking-[0.18em] text-ivory-faint">
                        {meta}
                    </p>
                )}
            </div>
        </Motion.div>
    );
};

/* ── On-brand loader: a compass ring over a drawing route line ──────── */
export const CompassLoader = ({
    label = "Loading",
    detail,
    progress = null,
    size = 88,
    className = "",
}) => {
    const reduce = useReducedMotion();
    const pct = progress === null ? null : Math.max(0, Math.min(100, Math.round(progress)));

    return (
        <div
            className={`flex flex-col items-center text-center ${className}`}
            role="status"
            aria-live="polite"
        >
            <div className="relative" style={{ width: size, height: size }}>
                {/* Fixed bezel + cardinal ticks */}
                <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
                    <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(242,239,230,0.09)" strokeWidth="1" />
                    <circle
                        cx="50"
                        cy="50"
                        r="34"
                        fill="none"
                        stroke="rgba(242,239,230,0.07)"
                        strokeWidth="1"
                        strokeDasharray="2 7"
                    />
                    {[0, 90, 180, 270].map((deg) => (
                        <line
                            key={deg}
                            x1="50"
                            y1="4"
                            x2="50"
                            y2="11"
                            stroke="rgba(242,239,230,0.22)"
                            strokeWidth="1.2"
                            transform={`rotate(${deg} 50 50)`}
                        />
                    ))}
                </svg>

                {/* Sweeping gold arc — the needle */}
                <Motion.svg
                    viewBox="0 0 100 100"
                    className="absolute inset-0 h-full w-full"
                    animate={reduce ? undefined : { rotate: 360 }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
                    aria-hidden="true"
                >
                    <circle
                        cx="50"
                        cy="50"
                        r="46"
                        fill="none"
                        className="stroke-saffron"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeDasharray="52 237"
                    />
                    <circle cx="50" cy="4" r="2.6" className="fill-saffron" />
                </Motion.svg>

                {/* Centre waypoint */}
                <span
                    className="route-dot absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    aria-hidden="true"
                />
            </div>

            <p className="mt-5 font-display text-base font-medium italic text-ivory">{label}</p>
            {detail && (
                <p className="mt-1.5 font-data text-[10px] uppercase tracking-[0.22em] text-ivory-faint">
                    {detail}
                </p>
            )}

            {pct === null ? (
                /* No measurable progress — three waypoints pulsing along a route */
                <div className="mt-5 flex items-center gap-2" aria-hidden="true">
                    {[0, 1, 2].map((i) => (
                        <Motion.span
                            key={i}
                            className="route-dot"
                            animate={reduce ? undefined : { opacity: [0.25, 1, 0.25] }}
                            transition={{
                                duration: 1.4,
                                repeat: Infinity,
                                delay: i * 0.22,
                                ease: "easeInOut",
                            }}
                        />
                    ))}
                </div>
            ) : (
                <div className="mt-6 w-60 max-w-[70vw]">
                    <div className="relative">
                        <div className="route-line" aria-hidden="true" />
                        <div
                            className="absolute inset-y-0 left-0 h-px bg-saffron transition-[width] duration-300 ease-out"
                            style={{ width: `${pct}%` }}
                            aria-hidden="true"
                        />
                        <span
                            className="route-dot absolute -top-[2px] -translate-x-1/2 transition-[left] duration-300 ease-out"
                            style={{ left: `${pct}%` }}
                            aria-hidden="true"
                        />
                    </div>
                    <p className="mt-3 font-data text-[10px] uppercase tracking-[0.24em] text-ivory-faint">
                        {pct}%
                    </p>
                </div>
            )}
        </div>
    );
};

/* ── Empty / error state ────────────────────────────────────────────── */
export const StateNotice = ({
    icon: Icon,
    title,
    body,
    actionLabel,
    onAction,
    tone = "neutral",
    className = "",
}) => (
    <div
        className={`mx-auto max-w-md px-6 text-center ${className}`}
        role={tone === "error" ? "alert" : undefined}
    >
        {Icon && (
            <span
                className={`mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border ${tone === "error"
                    ? "border-saffron/30 bg-saffron/10 text-saffron"
                    : "border-white/[0.09] bg-ink-800 text-ivory-faint"
                    }`}
            >
                <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
        )}
        <h3 className="font-display text-2xl font-medium italic text-ivory">{title}</h3>
        {body && <p className="mx-auto mt-3 text-sm leading-relaxed text-ivory-muted">{body}</p>}
        {actionLabel && onAction && (
            <button type="button" onClick={onAction} className="btn-ghost mt-6 !px-6 !py-2.5 text-sm">
                {actionLabel}
            </button>
        )}
    </div>
);
