import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
        top: { initial: { opacity: 0, y: 6, scale: 0.93 }, animate: { opacity: 1, y: 0, scale: 1 } },
        bottom: { initial: { opacity: 0, y: -6, scale: 0.93 }, animate: { opacity: 1, y: 0, scale: 1 } },
        left: { initial: { opacity: 0, x: 6, scale: 0.93 }, animate: { opacity: 1, x: 0, scale: 1 } },
        right: { initial: { opacity: 0, x: -6, scale: 0.93 }, animate: { opacity: 1, x: 0, scale: 1 } },
    };

    /* Arrow styles */
    const arrowConfig = {
        top: {
            className: 'absolute left-1/2 -translate-x-1/2 top-full',
            style: {
                width: 0, height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: '5px solid rgba(255,255,255,0.95)',
                filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.06))',
            },
        },
        bottom: {
            className: 'absolute left-1/2 -translate-x-1/2 bottom-full',
            style: {
                width: 0, height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderBottom: '5px solid rgba(255,255,255,0.95)',
                filter: 'drop-shadow(0 -1px 1px rgba(0,0,0,0.06))',
            },
        },
        left: {
            className: 'absolute top-1/2 -translate-y-1/2 left-full',
            style: {
                width: 0, height: 0,
                borderTop: '5px solid transparent',
                borderBottom: '5px solid transparent',
                borderLeft: '5px solid rgba(255,255,255,0.95)',
                filter: 'drop-shadow(1px 0 1px rgba(0,0,0,0.06))',
            },
        },
        right: {
            className: 'absolute top-1/2 -translate-y-1/2 right-full',
            style: {
                width: 0, height: 0,
                borderTop: '5px solid transparent',
                borderBottom: '5px solid transparent',
                borderRight: '5px solid rgba(255,255,255,0.95)',
                filter: 'drop-shadow(-1px 0 1px rgba(0,0,0,0.06))',
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
                    <motion.div
                        role="tooltip"
                        initial={ev.initial}
                        animate={ev.animate}
                        exit={ev.initial}
                        transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                        className={`absolute z-[9999] ${wrapperPos[position]}`}
                        style={{ pointerEvents: 'none' }}
                    >
                        {/* Bubble */}
                        <div
                            className="relative px-3.5 py-2 rounded-xl text-xs font-semibold
                                       whitespace-nowrap"
                            style={{
                                background:
                                    'linear-gradient(135deg,rgba(255,255,255,0.97) 0%,rgba(250,245,255,0.97) 100%)',
                                border: '1.5px solid rgba(139,92,246,0.18)',
                                color: '#334155',
                                boxShadow:
                                    '0 8px 24px rgba(0,0,0,0.1),0 2px 8px rgba(139,92,246,0.12),' +
                                    'inset 0 1px 0 rgba(255,255,255,0.9)',
                                backdropFilter: 'blur(12px)',
                            }}
                        >
                            {/* Gradient accent line */}
                            <div
                                className="absolute top-0 left-3 right-3 h-px rounded-full"
                                style={{
                                    background:
                                        'linear-gradient(90deg,transparent,rgba(139,92,246,0.4),transparent)',
                                }}
                            />

                            {content}
                        </div>

                        {/* Arrow */}
                        <div className={arrow.className} style={arrow.style} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Tooltip;