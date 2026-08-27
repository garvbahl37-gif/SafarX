import { motion as Motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Plane } from 'lucide-react';

/**
 * Agent boot screen.
 *
 * Deliberately lighter than the main app's cinematic four-act film — that
 * already played on the way in. This is a short handoff: the SafarX wordmark,
 * a flight path drawing itself across the frame, and a font-data status line.
 */

const RUN_MS = 1400;
const EASE = [0.22, 1, 0.36, 1];

/* Waypoints that ignite across the frame while the route draws */
const WAYPOINTS = [
    { x: '16%', y: '32%', d: 0.1 },
    { x: '38%', y: '62%', d: 0.24 },
    { x: '62%', y: '28%', d: 0.38 },
    { x: '84%', y: '58%', d: 0.52 },
];

const PHASES = [
    'Waking the agent',
    'Loading India routes',
    'Fares · stays · seasons',
    'Ready for take-off',
];

const AILoadingScreen = ({ onComplete }) => {
    const reduce = useReducedMotion();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const started = Date.now();
        const tick = setInterval(() => {
            const pct = Math.min(((Date.now() - started) / RUN_MS) * 100, 100);
            setProgress(pct);
            if (pct >= 100) {
                clearInterval(tick);
                onComplete?.();
            }
        }, 30);
        return () => clearInterval(tick);
    }, [onComplete]);

    const phase =
        progress < 25 ? 0 : progress < 55 ? 1 : progress < 88 ? 2 : 3;

    return (
        <Motion.div
            initial={{ opacity: 1 }}
            exit={{
                opacity: 0,
                scale: 1.04,
                filter: 'blur(12px)',
                transition: { duration: 0.55, ease: EASE },
            }}
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center
                       overflow-hidden bg-ink-950 text-ivory film-grain vignette"
            role="status"
            aria-label="Loading the SafarX Agent"
        >
            {/* Contour grid */}
            <div className="agent-grid absolute inset-0 opacity-60" aria-hidden="true" />

            {/* Horizon glow */}
            <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                aria-hidden="true"
            >
                <Motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 0.85, scale: 1 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="w-[620px] h-[620px] rounded-full"
                    style={{
                        background:
                            'radial-gradient(circle, rgba(212,168,67,0.14) 0%, rgba(46,139,116,0.06) 45%, transparent 70%)',
                    }}
                />
            </div>

            {/* Waypoints igniting */}
            {!reduce &&
                WAYPOINTS.map((w, i) => (
                    <Motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0, x: '-50%', y: '-50%' }}
                        animate={{ opacity: [0, 1, 0.32], scale: [0, 1.5, 1], x: '-50%', y: '-50%' }}
                        transition={{ duration: 1.1, delay: w.d, ease: EASE }}
                        style={{ left: w.x, top: w.y }}
                        className="route-dot absolute"
                        aria-hidden="true"
                    />
                ))}

            {/* ── Wordmark block ── */}
            <div className="relative z-10 flex flex-col items-center px-6">
                <Motion.span
                    initial={{ opacity: 0, letterSpacing: '0.6em' }}
                    animate={{ opacity: 1, letterSpacing: '0.32em' }}
                    transition={{ duration: 0.7, ease: EASE }}
                    className="eyebrow-muted mb-6"
                >
                    SafarX Agent
                </Motion.span>

                <div className="flex items-baseline gap-1">
                    {'Safar'.split('').map((letter, i) => (
                        <Motion.span
                            key={i}
                            initial={{ opacity: 0, y: '0.5em', filter: 'blur(8px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            transition={{ duration: 0.5, delay: 0.06 + i * 0.05, ease: EASE }}
                            className="font-display italic font-medium leading-none tracking-tight
                                       text-[clamp(2.6rem,9vw,4.6rem)] inline-block"
                        >
                            {letter}
                        </Motion.span>
                    ))}
                    <Motion.span
                        initial={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            filter: 'blur(0px)',
                            textShadow: [
                                '0 0 0px rgba(212,168,67,0)',
                                '0 0 40px rgba(212,168,67,0.9)',
                                '0 0 16px rgba(212,168,67,0.45)',
                            ],
                        }}
                        transition={{ duration: 0.6, delay: 0.3, ease: [0.34, 1.4, 0.64, 1] }}
                        className="font-data font-bold text-saffron leading-none
                                   text-[clamp(2.2rem,7.5vw,3.8rem)] inline-block ml-1"
                    >
                        X
                    </Motion.span>
                </div>

                {/* ── Route-line progress ── */}
                <div className="mt-10 w-[min(20rem,72vw)]" aria-hidden="true">
                    <div className="relative h-4 flex items-center">
                        {/* Dashed path */}
                        <span className="route-line absolute inset-x-0" />

                        {/* Drawn-so-far path in gold */}
                        <span
                            className="absolute left-0 h-px"
                            style={{
                                width: `${progress}%`,
                                background:
                                    'linear-gradient(90deg, rgba(166,126,43,0.4), rgba(229,190,92,0.95))',
                            }}
                        />

                        {/* Origin waypoint */}
                        <span className="route-dot absolute left-0 -translate-x-1/2" />

                        {/* The aircraft riding the path */}
                        <span
                            className="absolute -translate-x-1/2 text-saffron"
                            style={{ left: `${progress}%`, transition: 'left 0.12s linear' }}
                        >
                            <Plane size={13} className="rotate-45" />
                        </span>

                        {/* Destination waypoint */}
                        <span
                            className="absolute right-0 translate-x-1/2 w-[5px] h-[5px] rounded-full"
                            style={{
                                background: progress >= 99 ? '#D4A843' : 'rgba(242,239,230,0.2)',
                                boxShadow:
                                    progress >= 99 ? '0 0 10px rgba(212,168,67,0.7)' : 'none',
                            }}
                        />
                    </div>

                    {/* Status row */}
                    <div className="mt-5 flex items-center justify-between gap-4">
                        <AnimatePresence mode="wait">
                            <Motion.span
                                key={phase}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.2 }}
                                className="font-data text-[10px] uppercase tracking-[0.22em] text-ivory-faint"
                            >
                                {PHASES[phase]}
                            </Motion.span>
                        </AnimatePresence>
                        <span className="font-data text-[11px] tabular-nums text-saffron/80">
                            {Math.round(progress)}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Film framing marks */}
            {!reduce && (
                <Motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.25 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="absolute inset-6 md:inset-10 pointer-events-none"
                    aria-hidden="true"
                >
                    {[
                        'top-0 left-0 border-l border-t',
                        'top-0 right-0 border-r border-t',
                        'bottom-0 left-0 border-l border-b',
                        'bottom-0 right-0 border-r border-b',
                    ].map((pos, i) => (
                        <span key={i} className={`absolute ${pos} w-6 h-6 border-saffron/60`} />
                    ))}
                </Motion.div>
            )}
        </Motion.div>
    );
};

export default AILoadingScreen;
