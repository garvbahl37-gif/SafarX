import { motion } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import RotatingText from './RotatingText';

const AILoadingScreen = () => {
    return (
        <motion.div
            key="ai-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.015 }}
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ background: '#0a0a14' }}
        >
            {/* Ambient glow */}
            <div
                className="absolute"
                style={{
                    width: 420,
                    height: 420,
                    borderRadius: '50%',
                    background:
                        'radial-gradient(circle, rgba(139, 92, 246, 0.10) 0%, rgba(139,92,246,0.04) 40%, transparent 70%)',
                    filter: 'blur(36px)',
                    pointerEvents: 'none',
                }}
            />

            {/* Center cluster */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                className="relative z-10 flex flex-col items-center gap-5 sm:gap-6"
            >
                {/* Brand row */}
                <div className="flex items-baseline gap-3">
                    {/* Brand */}
                    <span
                        className="text-[3.2rem] sm:text-[4.8rem] md:text-[5.8rem] lg:text-[6.6rem] leading-[0.9] font-extrabold text-white tracking-tight"
                        style={{ fontFamily: "'Inter', 'Outfit', system-ui, sans-serif" }}
                    >
                        Safar<span className="text-gradient-secondary">X</span>
                    </span>

                    {/* Rotating badge */}
                    <div className="translate-y-[0.06em]">
                        <RotatingText
                            texts={['Loading', 'Exploring', 'Mapping', 'Preparing']}
                            mainClassName="
                px-3.5 md:px-4.5
                bg-violet text-white
                overflow-hidden
                py-[0.24em]
                rounded-xl
                text-[3rem] sm:text-[4.2rem] md:text-[5.1rem] lg:text-[5.8rem]
                leading-[0.95]
                font-extrabold tracking-tight
                shadow-[0_0_28px_rgba(139,92,246,0.35)]
              "
                            staggerFrom="last"
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '-120%' }}
                            staggerDuration={0.025}
                            splitLevelClassName="overflow-hidden"
                            transition={{ type: 'spring', damping: 32, stiffness: 420 }}
                            rotationInterval={1200}
                            style={{ fontFamily: "'Inter', 'Outfit', system-ui, sans-serif" }}
                        />
                    </div>
                </div>

                {/* Lottie */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.25, duration: 0.55 }}
                    className="w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52"
                >
                    <DotLottieReact
                        src="https://lottie.host/21c9f2a2-2e7d-4121-a9eb-b695141401c1/disk5q30Dy.lottie"
                        loop
                        autoplay
                        speed={4}
                    />
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default AILoadingScreen;