import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Plane, Hotel, MessageSquare } from 'lucide-react';

/* ─── Animated Counter ─── */
const Counter = ({ target, delay = 0 }) => {
    const [value, setValue] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            const duration = 1400;
            const steps = 60;
            const increment = target / steps;
            let step = 0;
            const interval = setInterval(() => {
                step++;
                const current = Math.min(Math.round(increment * step), target);
                setValue(current);
                if (step >= steps) clearInterval(interval);
            }, duration / steps);
            return () => clearInterval(interval);
        }, delay);
        return () => clearTimeout(timer);
    }, [target, delay]);

    return <span className="tabular-nums">{value.toLocaleString()}+</span>;
};

/* ─── Logo Mark ─── */
const LogoMark = () => (
    <motion.div
        animate={{
            boxShadow: [
                '0 0 0 0px rgba(14,165,233,0)',
                '0 0 0 14px rgba(14,165,233,0.06)',
                '0 0 0 0px rgba(14,165,233,0)',
            ],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="flex items-center justify-center rounded-2xl"
        style={{
            width: 60,
            height: 60,
            background: 'linear-gradient(135deg,#0EA5E9,#8B5CF6)',
            boxShadow: '0 8px 28px rgba(14,165,233,0.35)',
        }}
    >
        <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
            <Plane size={26} className="text-white" />
        </motion.div>
    </motion.div>
);

/* ─── Feature Pill ─── */
const FeaturePill = ({ icon: Icon, label, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col items-center gap-1.5"
    >
        <div
            className="flex items-center justify-center rounded-xl"
            style={{
                width: 40,
                height: 40,
                background: `${color}12`,
                border: `1px solid ${color}22`,
            }}
        >
            <Icon size={17} style={{ color }} />
        </div>
        <span
            className="text-[10px] font-semibold tracking-wide"
            style={{ color: '#94a3b8' }}
        >
            {label}
        </span>
    </motion.div>
);

/* ─── Floating Particle (lightweight) ─── */
const Particle = ({ x, y, size, color, duration, delay }) => (
    <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ left: x, top: y, width: size, height: size, background: color }}
        animate={{ y: [0, -18, 0], opacity: [0.25, 0.6, 0.25] }}
        transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
);

/* ─── Soft Wave (SVG, GPU-only transform) ─── */
const SoftWave = ({ color, opacity, duration, delay, yOffset }) => (
    <motion.div
        className="absolute left-0 right-0 pointer-events-none"
        style={{ bottom: yOffset }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
        <svg
            viewBox="0 0 800 80"
            preserveAspectRatio="none"
            style={{ width: '100%', height: 80, opacity, display: 'block' }}
        >
            <path
                d="M0,40 C150,80 350,0 500,40 C650,80 750,20 800,40 L800,80 L0,80 Z"
                fill={color}
            />
        </svg>
    </motion.div>
);

/* ─── Main Loading Screen ─── */
const AILoadingScreen = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState(0);
    const [done, setDone] = useState(false);

    const phases = [
        { label: 'Initialising systems', color: '#0EA5E9' },
        { label: 'Loading destinations', color: '#8B5CF6' },
        { label: 'Preparing AI companion', color: '#EC4899' },
        { label: 'Ready for take‑off', color: '#10B981' },
    ];

    const stats = [
        { value: 190, label: 'Countries', color: '#0EA5E9', delay: 600 },
        { value: 5000, label: 'Destinations', color: '#8B5CF6', delay: 800 },
        { value: 1200, label: 'Airlines', color: '#EC4899', delay: 1000 },
    ];

    const features = [
        { icon: MessageSquare, label: 'AI Support', color: '#0EA5E9', delay: 0.6 },
        { icon: Hotel, label: 'Hotel', color: '#8B5CF6', delay: 0.7 },
        { icon: Plane, label: 'Flight', color: '#EC4899', delay: 0.8 },
    ];

    /* small particles — only 6, cheap to animate */
    const particles = [
        { x: '10%', y: '18%', size: 5, color: 'rgba(14,165,233,0.45)', duration: 5, delay: 0 },
        { x: '85%', y: '14%', size: 4, color: 'rgba(139,92,246,0.45)', duration: 6.5, delay: 0.8 },
        { x: '7%', y: '72%', size: 4, color: 'rgba(236,72,153,0.4)', duration: 7, delay: 1.2 },
        { x: '88%', y: '68%', size: 5, color: 'rgba(249,115,22,0.4)', duration: 5.5, delay: 0.4 },
        { x: '48%', y: '8%', size: 3, color: 'rgba(16,185,129,0.45)', duration: 6, delay: 1.6 },
        { x: '70%', y: '85%', size: 4, color: 'rgba(14,165,233,0.4)', duration: 4.5, delay: 0.6 },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setDone(true);
                        setTimeout(() => onComplete?.(), 600);
                    }, 300);
                    return 100;
                }
                return prev + 1;
            });
        }, 32);
        return () => clearInterval(interval);
    }, [onComplete]);

    useEffect(() => {
        if (progress < 25) setPhase(0);
        else if (progress < 55) setPhase(1);
        else if (progress < 82) setPhase(2);
        else setPhase(3);
    }, [progress]);

    return (
        <AnimatePresence>
            {!done && (
                <motion.div
                    key="loader"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.03 }}
                    transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
                    className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden"
                    style={{
                        background: 'linear-gradient(145deg,#f0f9ff 0%,#faf5ff 50%,#fff7ed 100%)',
                    }}
                >

                    {/* ── 3 ambient blobs (opacity + scale only — no position change) ── */}
                    <motion.div
                        className="absolute rounded-full pointer-events-none"
                        animate={{ scale: [1, 1.12, 1], opacity: [0.55, 0.8, 0.55] }}
                        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                            width: 420, height: 420,
                            top: '-15%', left: '-12%',
                            background: 'radial-gradient(circle,rgba(14,165,233,0.13) 0%,transparent 70%)',
                        }}
                    />
                    <motion.div
                        className="absolute rounded-full pointer-events-none"
                        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.75, 0.5] }}
                        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                        style={{
                            width: 360, height: 360,
                            top: '-8%', right: '-10%',
                            background: 'radial-gradient(circle,rgba(139,92,246,0.11) 0%,transparent 70%)',
                        }}
                    />
                    <motion.div
                        className="absolute rounded-full pointer-events-none"
                        animate={{ scale: [1, 1.08, 1], opacity: [0.45, 0.7, 0.45] }}
                        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                        style={{
                            width: 320, height: 320,
                            bottom: '-10%', left: '8%',
                            background: 'radial-gradient(circle,rgba(236,72,153,0.09) 0%,transparent 70%)',
                        }}
                    />

                    {/* ── Subtle grid ── */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            backgroundImage:
                                'linear-gradient(rgba(14,165,233,0.028) 1px,transparent 1px),' +
                                'linear-gradient(90deg,rgba(14,165,233,0.028) 1px,transparent 1px)',
                            backgroundSize: '60px 60px',
                        }}
                    />

                    {/* ── Soft waves at bottom ── */}
                    <SoftWave
                        color="rgba(14,165,233,0.06)"
                        opacity={1}
                        duration={8}
                        delay={0}
                        yOffset={0}
                    />
                    <SoftWave
                        color="rgba(139,92,246,0.05)"
                        opacity={1}
                        duration={10}
                        delay={1.5}
                        yOffset={20}
                    />

                    {/* ── Light particles ── */}
                    {particles.map((p, i) => (
                        <Particle key={i} {...p} />
                    ))}

                    {/* ── Card ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 28, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                        className="relative z-10 flex flex-col items-center"
                        style={{
                            width: 340,
                            padding: '40px 32px 36px',
                            background: 'rgba(255,255,255,0.88)',
                            border: '1px solid rgba(255,255,255,0.95)',
                            borderRadius: 28,
                            boxShadow:
                                '0 24px 64px rgba(0,0,0,0.08),' +
                                '0 6px 20px rgba(14,165,233,0.09),' +
                                'inset 0 1px 0 rgba(255,255,255,1)',
                            backdropFilter: 'blur(20px)',
                        }}
                    >
                        {/* Rainbow top line */}
                        <div
                            className="absolute top-0 left-6 right-6 h-px rounded-full"
                            style={{
                                background:
                                    'linear-gradient(90deg,#0EA5E9,#8B5CF6,#EC4899,#F97316,#10B981)',
                                opacity: 0.75,
                            }}
                        />

                        {/* Logo */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                        >
                            <LogoMark />
                        </motion.div>

                        {/* Brand */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-5 text-center"
                        >
                            <h1
                                className="font-black text-3xl tracking-tight leading-none"
                                style={{ color: '#0f172a' }}
                            >
                                Safar
                                <span
                                    style={{
                                        background: 'linear-gradient(135deg,#0EA5E9,#8B5CF6)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}
                                >
                                    X
                                </span>
                            </h1>
                            <p
                                className="text-[10px] font-bold uppercase tracking-[0.2em] mt-1.5"
                                style={{ color: '#94a3b8' }}
                            >
                                AI Travel Companion
                            </p>
                        </motion.div>

                        {/* Progress bar + phase */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="w-full mt-8 space-y-2.5"
                        >
                            {/* Phase label */}
                            <div className="flex items-center gap-2">
                                <motion.div
                                    animate={{ opacity: [1, 0.2, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                    style={{ background: phases[phase].color }}
                                />
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={phase}
                                        initial={{ opacity: 0, x: -6 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 6 }}
                                        transition={{ duration: 0.2 }}
                                        className="text-xs font-semibold"
                                        style={{ color: '#64748b' }}
                                    >
                                        {phases[phase].label}
                                    </motion.span>
                                </AnimatePresence>
                            </div>

                            {/* Bar */}
                            <div
                                className="w-full h-1.5 rounded-full overflow-hidden"
                                style={{ background: 'rgba(14,165,233,0.07)' }}
                            >
                                <motion.div
                                    className="h-full rounded-full relative overflow-hidden"
                                    style={{
                                        width: `${progress}%`,
                                        background: `linear-gradient(90deg,${phases[phase].color},${phases[Math.min(phase + 1, 3)].color
                                            })`,
                                        transition: 'width 0.1s ease, background 0.5s ease',
                                    }}
                                >
                                    <motion.div
                                        className="absolute inset-0"
                                        animate={{ x: ['-100%', '200%'] }}
                                        transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                                        style={{
                                            background:
                                                'linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)',
                                        }}
                                    />
                                </motion.div>
                            </div>

                            {/* Phase step indicators */}
                            <div className="flex gap-1.5">
                                {phases.map((p, i) => (
                                    <motion.div
                                        key={i}
                                        className="flex-1 h-0.5 rounded-full"
                                        animate={{ opacity: i <= phase ? 1 : 0.2 }}
                                        transition={{ duration: 0.4 }}
                                        style={{ background: i <= phase ? p.color : '#e2e8f0' }}
                                    />
                                ))}
                            </div>
                        </motion.div>

                        {/* Divider */}
                        <motion.div
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="w-full h-px my-6"
                            style={{
                                background:
                                    'linear-gradient(90deg,transparent,rgba(14,165,233,0.15),rgba(139,92,246,0.15),transparent)',
                            }}
                        />

                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.55 }}
                            className="flex items-center justify-between w-full mb-6"
                        >
                            {stats.map((s) => (
                                <div key={s.label} className="flex flex-col items-center gap-0.5">
                                    <span
                                        className="font-black text-lg leading-none"
                                        style={{ color: s.color }}
                                    >
                                        <Counter target={s.value} delay={s.delay} />
                                    </span>
                                    <span
                                        className="text-[10px] font-semibold uppercase tracking-wider"
                                        style={{ color: '#94a3b8' }}
                                    >
                                        {s.label}
                                    </span>
                                </div>
                            ))}
                        </motion.div>

                        {/* Divider */}
                        <motion.div
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            transition={{ delay: 0.58, duration: 0.5 }}
                            className="w-full h-px mb-6"
                            style={{
                                background:
                                    'linear-gradient(90deg,transparent,rgba(139,92,246,0.15),rgba(236,72,153,0.15),transparent)',
                            }}
                        />

                        {/* Feature pills */}
                        <div className="flex items-center justify-center gap-8 w-full">
                            {features.map((f) => (
                                <FeaturePill key={f.label} {...f} />
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AILoadingScreen;