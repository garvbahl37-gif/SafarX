import React from "react";
import { motion } from "framer-motion";

/**
 * Signature section header — a dashed "flight path" route line with a
 * coordinate/route-code eyebrow, the recurring motif of the Night Atlas system.
 *
 * <SectionHeading eyebrow="27.17° N · 78.04° E" title="Wonders in every direction" />
 */
const SectionHeading = ({
  eyebrow,
  title,
  lede,
  align = "center",
  className = "",
}) => {
  const aligned = align === "left";
  return (
    <div
      className={`${aligned ? "text-left items-start" : "text-center items-center"} flex flex-col ${className}`}
    >
      <div className={`flex items-center gap-4 mb-5 w-full ${aligned ? "" : "justify-center"}`}>
        {!aligned && <RouteSegment flip />}
        <span className="eyebrow whitespace-nowrap">{eyebrow}</span>
        <RouteSegment />
      </div>
      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="font-display text-4xl md:text-5xl font-medium text-ivory tracking-tight leading-[1.1]"
      >
        {title}
      </motion.h2>
      {lede && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className={`mt-5 text-ivory-muted text-base md:text-lg leading-relaxed max-w-2xl ${aligned ? "" : "mx-auto"}`}
        >
          {lede}
        </motion.p>
      )}
    </div>
  );
};

/** Short dashed segment ending in a glowing waypoint dot. */
const RouteSegment = ({ flip = false }) => (
  <span className={`flex items-center gap-1.5 ${flip ? "flex-row-reverse" : ""}`}>
    <span className="route-line w-10 md:w-16 inline-block" />
    <span className="route-dot inline-block" />
  </span>
);

/** Full-width dashed divider with an animated waypoint — use between sections. */
export const RouteDivider = ({ className = "" }) => (
  <div className={`relative flex items-center gap-3 ${className}`} aria-hidden="true">
    <span className="route-dot" />
    <span className="route-line flex-1" />
    <span className="route-dot" />
  </div>
);

export default SectionHeading;
