import { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

/* Ink-and-gold tooltip, matched to the agent surfaces */
const ARROW_COLOR = '#102822';

const Tooltip = ({ children, content, position = 'top' }) => {
    const [visible, setVisible] = useState(false);

    /* ── Position maps ── */
    const wrapperPos = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2.5',
        bottom: 'top-full  left-1/2 -translate-x-1/2 mt-2.5',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2.5',
        right: 'left-full  top-1/2 -translate-y-1/2 ml-2.5',
    };

    /* Entry/exit direction */
    const entryVariants = {
        top: { initial: { opacity: 0, y: 6, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 } },
        bottom: { initial: { opacity: 0, y: -6, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 } },
        left: { initial: { opacity: 0, x: 6, scale: 0.95 }, animate: { opacity: 1, x: 0, scale: 1 } },
        right: { initial: { opacity: 0, x: -6, scale: 0.95 }, animate: { opacity: 1, x: 0, scale: 1 } },
    };

    /* Arrow styles */
    const arrowConfig = {
        top: {
            className: 'absolute left-1/2 -translate-x-1/2 top-full',
            style: {
                width: 0, height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: `5px solid ${ARROW_COLOR}`,
            },
        },
        bottom: {
            className: 'absolute left-1/2 -translate-x-1/2 bottom-full',
            style: {
                width: 0, height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderBottom: `5px solid ${ARROW_COLOR}`,
            },
        },
        left: {
            className: 'absolute top-1/2 -translate-y-1/2 left-full',
            style: {
                width: 0, height: 0,
                borderTop: '5px solid transparent',
                borderBottom: '5px solid transparent',
                borderLeft: `5px solid ${ARROW_COLOR}`,
            },
        },
        right: {
            className: 'absolute top-1/2 -translate-y-1/2 right-full',
            style: {
                width: 0, height: 0,
                borderTop: '5px solid transparent',
                borderBottom: '5px solid transparent',
                borderRight: `5px solid ${ARROW_COLOR}`,
            },
        },
    };

    const ev = entryVariants[position] || entryVariants.top;
    const arrow = arrowConfig[position] || arrowConfig.top;

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
            onFocus={() => setVisible(true)}
            onBlur={() => setVisible(false)}
        >
            {children}

            <AnimatePresence>
                {visible && (
                    <Motion.div
                        role="tooltip"
                        initial={ev.initial}
                        animate={ev.animate}
                        exit={ev.initial}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        className={`absolute z-[9999] ${wrapperPos[position]}`}
                        style={{ pointerEvents: 'none' }}
                    >
                        {/* Bubble */}
                        <div
                            className="relative px-3 py-2 rounded-xl whitespace-nowrap
                                       bg-ink-800 border border-white/[0.1] text-ivory
                                       font-data text-[10px] uppercase tracking-[0.16em]
                                       shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
                        >
                            {/* Gold filament */}
                            <span
                                className="absolute top-0 left-3 right-3 h-px rounded-full bg-gradient-to-r from-transparent via-saffron/60 to-transparent"
                                aria-hidden="true"
                            />
                            {content}
                        </div>

                        {/* Arrow */}
                        <div className={arrow.className} style={arrow.style} aria-hidden="true" />
                    </Motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Tooltip;
