import React, { useEffect, useRef, useState } from "react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";

/**
 * JourneyRoad — the trip stages told as a drive across India.
 *
 * A winding road is painted in as you scroll, a car drives it, and each stage
 * lights up as the car reaches its waypoint. Car and pin positions come from
 * the real SVG path via getPointAtLength, so nothing drifts off the tarmac
 * when the viewBox scales.
 */


// A longer road with enough bends to carry six stops.

// Where each stage sits along the road (0–1 of its length).

const JourneyRoad = ({ stages, onPageChange }) => {
  const reduce = useReducedMotion();
  const sectionRef = useRef(null);
  /* How far down the list you have read.
     This used to be measured along the road's SVG path — which meant it only
     worked at lg and above, since the road was hidden below that, so on a
     phone no station ever lit up. Watching the stations themselves is both
     simpler and correct at every width: one is reached when it reaches the
     middle of the screen. */
  /* How far down the list you have read.
     This used to be measured along the road's SVG path, which meant it only
     worked at lg and above — the road was hidden below that, so on a phone no
     station ever lit up. Measuring the stations themselves is simpler and
     correct at every width.

     A scroll listener rather than an IntersectionObserver, deliberately: an
     observer only fires when an element crosses its boundary, so jumping the
     page — an anchor link, a restored scroll position, a fast flick — skips
     stations that never report and leaves the count stale. Reading seven
     rectangles on a frame we were painting anyway is cheaper than being
     wrong. */
  const [passed, setPassed] = useState(0);
  const listRef = useRef(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return undefined;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const items = list.querySelectorAll("[data-stage]");
      if (!items.length) return;
      const line = window.innerHeight * 0.62;
      let reached = 0;
      items.forEach((el) => {
        if (el.getBoundingClientRect().top < line) reached += 1;
      });
      setPassed((was) => (was === reached ? was : reached));
    };

    /* One measurement per frame at most, however fast the wheel turns. */
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [stages.length]);

  return (
    <div ref={sectionRef}>
      {/* ── The drive (desktop) ── */}

      {/* ── The stages, threaded on the road rather than parked under it ──
          Seven of them in a three-column grid left a last row holding one
          card beside two empty slots, which is what made the section read as
          loose blocks. They are stations on a line now: the count stops
          mattering, each one is lighter than a bordered box, and the dashed
          rule continues the road drawn above instead of restarting the
          composition. Numbering earns its place here because this genuinely
          is a sequence. */}
      <div ref={listRef} className="relative mx-auto max-w-3xl">
        {/* The route itself, behind the nodes. It lives out here rather than
            inside the list: an ol may only contain li elements, and a stray
            span in there is invalid markup that a screen reader has to
            reconcile. */}
        <span
          className="absolute left-[19px] top-2 bottom-2 w-px bg-[repeating-linear-gradient(to_bottom,rgba(212,168,67,0.34)_0_6px,transparent_6px_13px)] sm:left-[23px]"
          aria-hidden="true"
        />

        <ol>
        {stages.map((stage, i) => {
          const active = passed > i;
          const Icon = stage.icon || MapPin;
          return (
            <Motion.li
              key={stage.step}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-70px" }}
              transition={{ duration: 0.5, delay: Math.min(i * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
              data-stage=""
              className="relative"
            >
              <button
                type="button"
                onClick={() => onPageChange(stage.page)}
                className="group flex w-full items-start gap-5 rounded-2xl py-6 pl-0 pr-4 text-left transition-colors duration-300 sm:gap-7"
              >
                {/* The node sits on the line, so it has to hide the dashes
                    behind it — hence the solid ink fill. */}
                <span
                  className={`relative z-10 mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-ink-950 transition-colors duration-500 sm:h-12 sm:w-12 ${
                    active
                      ? "border-saffron/50 text-saffron"
                      : "border-white/[0.1] text-ivory/40 group-hover:border-white/25"
                  }`}
                >
                  <Icon size={17} aria-hidden="true" />
                </span>

                <span className="min-w-0 flex-1 pt-1">
                  <span
                    className={`font-data text-[10px] uppercase tracking-[0.24em] transition-colors duration-500 ${
                      active ? "text-saffron" : "text-ivory-faint"
                    }`}
                  >
                    {stage.step} · {stage.phase}
                  </span>

                  <h3 className="mt-2 font-display text-[1.35rem] font-medium leading-snug text-ivory md:text-[1.5rem]">
                    {stage.title}
                  </h3>

                  <p className="mt-2 max-w-[54ch] font-sans text-[14.5px] leading-relaxed text-ivory-muted">
                    {stage.desc}
                  </p>

                  <span className="mt-4 inline-flex items-center gap-2 font-sans text-[13px] font-semibold text-saffron">
                    {stage.cta}
                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </span>
              </button>

              {/* A rule between stations, never after the last. */}
              {i < stages.length - 1 && (
                <span className="ml-[60px] block h-px bg-white/[0.06] sm:ml-[76px]" aria-hidden="true" />
              )}
            </Motion.li>
          );
        })}
        </ol>
      </div>
    </div>
  );
};

export default JourneyRoad;
