/**
 * TourStory — the editorial section that sits underneath an open 360° tour.
 *
 * The panorama answers "what does it look like from here?". Everything below
 * it answers the questions a visitor asks next: what is this place, who built
 * it and when, when should I come, what will it cost, and what should I not
 * walk past. That content lives on each tour in `vrTours.json` under `story`,
 * so this component only lays it out — it invents nothing.
 *
 * The layout is deliberately editorial rather than dashboard-like: a Fraunces
 * italic tagline, an intro set to a comfortable ~65-character measure, a
 * `font-data` facts strip, numbered things-to-look-for, a real image grid, and
 * the practical tips kept in their own panel so they read as advice rather than
 * as more prose.
 *
 * Every reveal is `whileInView` with `once: true`, and every one of them
 * collapses to a plain fade when the visitor has asked for reduced motion.
 */

import React from "react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import {
    CalendarRange,
    Clock3,
    Ticket,
    Hourglass,
    Plane,
    TrainFront,
    Lightbulb,
    Camera,
} from "lucide-react";
import { RouteDivider } from "../ui/SectionHeading";

const EASE = [0.22, 1, 0.36, 1];

/** Latitude/longitude in the app's coordinate-eyebrow format. */
const formatCoords = (lat, lng) => {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    const ns = lat >= 0 ? "N" : "S";
    const ew = lng >= 0 ? "E" : "W";
    return `${Math.abs(lat).toFixed(2)}° ${ns} · ${Math.abs(lng).toFixed(2)}° ${ew}`;
};

/** The facts strip, in the order a trip actually gets planned. */
const FACT_ROWS = [
    { key: "bestTime", label: "Best time", icon: CalendarRange },
    { key: "hours", label: "Hours", icon: Clock3 },
    { key: "entry", label: "Entry", icon: Ticket },
    { key: "duration", label: "Time needed", icon: Hourglass },
    { key: "nearestAirport", label: "Nearest airport", icon: Plane },
    { key: "nearestStation", label: "Nearest station", icon: TrainFront },
];

/**
 * One `whileInView` reveal. Shared so every block in the section rises the
 * same way, and so reduced motion is handled in exactly one place.
 */
const Reveal = ({ children, delay = 0, from = "up", className = "" }) => {
    const reduce = useReducedMotion();
    const offset =
        from === "left" ? { x: -28, y: 0 } : from === "right" ? { x: 28, y: 0 } : { x: 0, y: 30 };
    return (
        <Motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, ...offset, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-70px" }}
            transition={{ duration: reduce ? 0.4 : 0.8, delay: reduce ? 0 : delay, ease: EASE }}
            className={className}
        >
            {children}
        </Motion.div>
    );
};

/** A rule that draws itself across as the section arrives. */
const DrawLine = ({ className = "" }) => {
    const reduce = useReducedMotion();
    return (
        <Motion.span
            aria-hidden="true"
            initial={reduce ? { opacity: 1 } : { scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-70px" }}
            transition={{ duration: 1, ease: EASE }}
            className={`route-line block origin-left ${className}`}
        />
    );
};

/** Counts a number up once it scrolls into view. */
const CountIn = ({ children, className = "" }) => {
    const reduce = useReducedMotion();
    return (
        <Motion.span
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: EASE }}
            className={className}
        >
            {children}
        </Motion.span>
    );
};

const TourStory = ({ tour }) => {
    const story = tour?.story;
    if (!story) return null;

    const coords = formatCoords(tour.latitude, tour.longitude);
    const facts = FACT_ROWS.filter((row) => story.visiting?.[row.key]);
    const gallery = story.gallery || [];
    const seeThis = story.seeThis || [];
    const tips = story.tips || [];

    return (
        <section
            className="bg-ink-950 border-t border-white/[0.07]"
            aria-label={`About ${tour.name}`}
        >
            <div className="mx-auto w-full max-w-[1240px] px-5 py-16 sm:px-8 md:px-12 md:py-24">
                {/* ── Opening: eyebrow, tagline, intro ─────────────────── */}
                <Reveal>
                    <p className="eyebrow !text-[10px]">
                        {coords ? `${coords} · ` : ""}
                        {tour.country}
                    </p>

                    <h2 className="mt-5 max-w-[22ch] font-display text-3xl font-medium italic leading-[1.15] tracking-tight text-saffron-bright sm:text-4xl md:text-[2.75rem]">
                        {story.tagline}
                    </h2>

                    <p className="mt-7 max-w-[65ch] text-[15px] leading-[1.75] text-ivory-muted md:text-base">
                        {story.intro}
                    </p>
                </Reveal>

                <RouteDivider className="my-12 md:my-16" />

                {/* ── History + facts strip ────────────────────────────── */}
                <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-16">
                    <Reveal from="left">
                        <h3 className="eyebrow !text-[10px] mb-4">The short history</h3>
                        <p className="max-w-[65ch] text-[15px] leading-[1.8] text-ivory-muted">
                            {story.history}
                        </p>
                    </Reveal>

                    {facts.length > 0 && (
                        <Reveal from="right" delay={0.1}>
                            <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-900/60">
                                <h3 className="eyebrow !text-[10px] border-b border-white/[0.07] px-5 py-4">
                                    Planning it
                                </h3>
                                <dl className="divide-y divide-white/[0.06]">
                                    {facts.map((row, i) => {
                                        // Capitalised local, not a destructured
                                        // param: this config has no react plugin,
                                        // so a JSX-only identifier in argument
                                        // position reads as unused.
                                        const RowIcon = row.icon;
                                        return (
                                            <Motion.div
                                                key={row.key}
                                                initial={{ opacity: 0, x: 12 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true, margin: "-40px" }}
                                                transition={{ duration: 0.5, delay: 0.14 + i * 0.07, ease: EASE }}
                                                className="flex items-start gap-3 px-5 py-3.5"
                                            >
                                                <RowIcon
                                                    size={14}
                                                    className="mt-0.5 shrink-0 text-saffron/80"
                                                    aria-hidden="true"
                                                />
                                                <div className="min-w-0">
                                                    <dt className="font-data text-[10px] uppercase tracking-[0.14em] text-ivory-faint">
                                                        {row.label}
                                                    </dt>
                                                    <dd className="mt-1 font-data text-[12.5px] leading-snug text-ivory">
                                                        {story.visiting[row.key]}
                                                    </dd>
                                                </div>
                                            </Motion.div>
                                        );
                                    })}
                                </dl>
                            </div>
                        </Reveal>
                    )}
                </div>

                {/* ── What to look for ─────────────────────────────────── */}
                {seeThis.length > 0 && (
                    <div className="mt-16 md:mt-24">
                        <Reveal>
                            <h3 className="eyebrow !text-[10px] mb-2">What to look for</h3>
                            <p className="max-w-[52ch] font-display text-2xl font-medium leading-tight tracking-tight text-ivory md:text-3xl">
                                {seeThis.length} things most visitors walk straight past
                            </p>
                        </Reveal>

                        <ol className="mt-9 grid gap-x-10 gap-y-8 sm:grid-cols-2">
                            {seeThis.map((item, i) => (
                                <Reveal key={item.title} delay={(i % 2) * 0.08}>
                                    <li className="group relative list-none pt-5 transition-colors duration-500">
                                        <Motion.span
                                            aria-hidden="true"
                                            initial={{ scaleX: 0 }}
                                            whileInView={{ scaleX: 1 }}
                                            viewport={{ once: true, margin: "-60px" }}
                                            transition={{ duration: 0.9, delay: 0.1 + (i % 2) * 0.08, ease: EASE }}
                                            className="absolute inset-x-0 top-0 block h-px origin-left bg-white/[0.09] transition-colors duration-500 group-hover:bg-saffron/40"
                                        />
                                        <div className="mb-3 flex items-center gap-3">
                                            <Motion.span
                                                initial={{ scale: 0 }}
                                                whileInView={{ scale: 1 }}
                                                viewport={{ once: true, margin: "-60px" }}
                                                transition={{ duration: 0.5, delay: 0.28 + (i % 2) * 0.08, ease: [0.34, 1.56, 0.64, 1] }}
                                                className="route-dot shrink-0"
                                                aria-hidden="true"
                                            />
                                            <span className="font-data text-[10px] uppercase tracking-[0.18em] text-saffron/85">
                                                {String(i + 1).padStart(2, "0")}
                                            </span>
                                            <span
                                                className="route-line hidden flex-1 sm:inline-block"
                                                aria-hidden="true"
                                            />
                                        </div>
                                        <h4 className="mb-2 font-display text-lg font-medium leading-snug text-ivory md:text-xl">
                                            {item.title}
                                        </h4>
                                        <p className="max-w-[46ch] text-[14px] leading-relaxed text-ivory-muted">
                                            {item.detail}
                                        </p>
                                    </li>
                                </Reveal>
                            ))}
                        </ol>
                    </div>
                )}

                {/* ── Gallery ──────────────────────────────────────────── */}
                {gallery.length > 0 && (
                    <div className="mt-16 md:mt-24">
                        <Reveal>
                            <div className="mb-8 flex flex-wrap items-baseline justify-between gap-3">
                                <h3 className="eyebrow !text-[10px]">On the ground</h3>
                                <p className="flex items-center gap-2 font-data text-[10px] uppercase tracking-[0.14em] text-ivory-faint">
                                    <Camera size={12} aria-hidden="true" />
                                    {gallery.length} photographs
                                </p>
                            </div>
                        </Reveal>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {gallery.map((image, i) => (
                                <Reveal key={image.url} delay={(i % 4) * 0.09} from={i % 2 ? "right" : "left"}>
                                    <figure className="group relative h-full overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-800 transition-colors duration-500 hover:border-saffron/35">
                                        <div className="relative aspect-[4/3] overflow-hidden bg-ink-700/40">
                                            {/* Fade in on decode so a slow image
                                                arrives gracefully instead of popping. */}
                                            <img
                                                src={image.url}
                                                alt={image.caption}
                                                width="500"
                                                height="375"
                                                loading={i < 4 ? "eager" : "lazy"}
                                                fetchPriority={i < 2 ? "high" : "auto"}
                                                decoding="async"
                                                onLoad={(e) => {
                                                    e.currentTarget.style.opacity = "1";
                                                }}
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.style.opacity = "0";
                                                }}
                                                style={{ opacity: 0, transition: "opacity 600ms ease" }}
                                                className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
                                            />
                                            <div
                                                className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/25 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-70"
                                                aria-hidden="true"
                                            />
                                        </div>
                                        <figcaption className="absolute inset-x-0 bottom-0 p-4">
                                            <p className="text-[13px] font-medium leading-snug text-ivory">
                                                {image.caption}
                                            </p>
                                            {image.credit && (
                                                <p className="mt-1.5 font-data text-[9px] uppercase leading-relaxed tracking-[0.1em] text-ivory-faint">
                                                    {image.credit}
                                                </p>
                                            )}
                                        </figcaption>
                                    </figure>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Tips ─────────────────────────────────────────────── */}
                {tips.length > 0 && (
                    <Reveal className="mt-16 md:mt-24">
                        <div className="rounded-3xl border border-white/[0.07] bg-ink-900/70 p-6 sm:p-8 md:p-10">
                            <div className="mb-6 flex items-center gap-3">
                                <span
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-saffron/25 bg-saffron/10 text-saffron"
                                    aria-hidden="true"
                                >
                                    <Lightbulb size={15} />
                                </span>
                                <h3 className="eyebrow !text-[10px]">Worth knowing first</h3>
                            </div>

                            <ul className="grid gap-5 md:grid-cols-3 md:gap-8">
                                {tips.map((tip) => (
                                    <li
                                        key={tip}
                                        className="border-l border-white/[0.09] pl-4 text-[14px] leading-relaxed text-ivory-muted md:border-l-0 md:border-t md:pl-0 md:pt-4"
                                    >
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Reveal>
                )}
            </div>
        </section>
    );
};

export default TourStory;
