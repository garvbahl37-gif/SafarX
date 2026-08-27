import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * Boarding-pass style boot screen: the wordmark fades in over a dashed
 * route line whose waypoint travels left → right as the app loads.
 */
const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          clearInterval(timer);
          return 100;
        }
        return Math.min(old + Math.random() * 18, 100);
      });
    }, 90);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        filter: "blur(12px)",
        transition: { duration: 0.7, ease: [0.43, 0.13, 0.23, 0.96] },
      }}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-ink-950 text-ivory overflow-hidden"
    >
      {/* Warm ambient glow */}
      <motion.div
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[640px] h-[640px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(212,168,67,0.08) 0%, rgba(46,139,116,0.04) 45%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-baseline gap-1 mb-3"
        >
          <span className="font-display italic font-medium text-6xl md:text-8xl tracking-tight">
            Safar
          </span>
          <span className="font-data text-5xl md:text-7xl text-saffron font-bold tracking-[0.02em]">
            X
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="eyebrow-muted mb-14"
        >
          Discover Incredible India
        </motion.p>

        {/* Route-line progress: waypoint flies along the dashed path */}
        <div className="relative w-72 md:w-[420px]" aria-hidden="true">
          <div className="route-line w-full" />
          <motion.span
            className="route-dot absolute -top-[2px]"
            style={{ left: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>

        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 font-data text-[12px] tracking-[0.3em] text-ivory-faint tabular-nums"
        >
          {Math.round(progress)}%
        </motion.span>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
