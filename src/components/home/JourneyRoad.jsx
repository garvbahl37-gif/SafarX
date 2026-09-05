import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";

/**
 * JourneyRoad — the stages of a trip, as a pass crossed from left to right.
 *
 * This has been through two worse shapes. First a motorway: a 30px asphalt
 * ribbon running top to bottom, 2,300 units tall, nearly four screens in
 * which only one stage was ever on screen. Then the same descent as a
 * switchback, which was a third shorter but still a descent — and on a
 * phone the stages overlapped each other.
 *
 * So the road turned. It now crosses the section once, west to east, and
 * the whole thing sits inside a single screen: a strip of trail, the seven
 * stages named along it, and one panel underneath carrying whichever stage
 * the traveller has reached.
 *
 * The animation is its own. It used to be welded to the scrollbar, which
 * meant the journey only happened if you kept scrolling and ran backwards
 * if you scrolled up. Here a marker crosses the pass on a loop whether you
 * touch anything or not, trailing a lit comet of road behind it, and the
 * panel follows it. Point at a milestone and it stops and waits on that
 * stage; take the pointer away and it carries on.
 *
 * The trail is drawn as a surveyor's dotted line rather than a road
 * surface: a hairline of dots reads as a route on a map, where 30px of grey
 * read as a bar across the page.
 */

/* `switches` is how many hairpins fall between one stage and the next. One
   bend per stage, stretched across the width a name needs, comes out as a
   gentle meander; three tight turns in the same span give the switchbacks
   their frequency while the corridor stays shallow enough to leave room
   above and below for the labels. An odd number also lands the trail on the
   opposite rail, which is what keeps the stages alternating sides. */
const DESKTOP = { band: 216, top: 86, bottom: 142, run: 38, curve: 62, flare: 22, switches: 3, pad: 58 };
const MOBILE = { band: 156, top: 52, bottom: 100, run: 30, curve: 48, flare: 16, switches: 1, pad: 28 };

/** How long the marker takes to cross the whole pass, per stage. */
const SECONDS_PER_STAGE = 2.2;

/**
 * The trail, west to east, and the point on it where each stage waits.
 * @returns {{d: string, width: number, anchors: {x: number, y: number, side: "top"|"bottom"}[]}}
 */
const buildRoad = (count, g) => {
  const anchors = [];
  let y = g.top;
  let x = g.pad;
  let turn = 0;
  let d = `M ${x} ${y}`;

  for (let i = 0; i < count; i += 1) {
    /* The run this stage stands beside. */
    const from = x;
    x += g.run;
    d += ` L ${x} ${y}`;
    anchors.push({ x: (from + x) / 2, y, side: y === g.top ? "top" : "bottom" });

    if (i < count - 1) {
      for (let k = 0; k < g.switches; k += 1) {
        /* Every turn identical reads as a coil, not a road. A deterministic
           wobble on the turn's index varies how far each bend runs and how
           hard it flares, so the crossing looks like it is answering a
           hillside rather than being wound onto a spool — and it lays down
           the same way on every load, which a random one would not. */
        turn += 1;
        const c = g.curve * (1 + Math.sin(turn * 2.399) * 0.2);
        const f = g.flare * (1 + Math.cos(turn * 1.7) * 0.24);
        /* Both control points are thrown outward — the first past the rail
           being left, the second past the rail being joined — so the curve
           bulges beyond each and comes back. Held level with each other it
           would be a lane change; thrown wide like this it is a turn you
           would have to slow down for. */
        const next = y === g.top ? g.bottom : g.top;
        const out = y === g.top ? -f : f;
        d += ` C ${x + c * 0.38} ${y + out}, ${x + c * 0.62} ${next - out}, ${x + c} ${next}`;
        y = next;
        x += c;
      }
    }
  }

  return { d, width: x + g.pad, anchors };
};

const JourneyRoad = ({ stages, onPageChange }) => {
  const reduce = useReducedMotion();
  const pathRef = useRef(null);
  const markerRef = useRef(null);
  const cometRef = useRef(null);
  const holdRef = useRef(null); // milestone the pointer is resting on

  const [narrow, setNarrow] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const check = () => setNarrow(window.matchMedia("(max-width: 767px)").matches);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const geometry = narrow ? MOBILE : DESKTOP;
  const road = useMemo(() => buildRoad(stages.length, geometry), [stages.length, geometry]);

  /* The crossing. One rAF loop drives the marker and the comet directly
     through refs — the panel is the only thing that re-renders, and only
     when the stage under the marker actually changes. */
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return undefined;

    const total = path.getTotalLength();
    const tail = total * 0.16;

    /* Reduced motion gets the finished pass and no travelling light. */
    if (reduce) {
      cometRef.current?.style.setProperty("stroke-dasharray", `${total}`);
      cometRef.current?.style.setProperty("stroke-dashoffset", "0");
      const p = path.getPointAtLength(total);
      markerRef.current?.setAttribute("transform", `translate(${p.x} ${p.y})`);
      return undefined;
    }

    const duration = stages.length * SECONDS_PER_STAGE * 1000;
    let raf = 0;
    let start = performance.now();
    let pausedAt = null;

    const place = (t) => {
      const at = total * t;
      const p = path.getPointAtLength(at);
      markerRef.current?.setAttribute("transform", `translate(${p.x} ${p.y})`);
      /* A comet rather than a growing line. A line that grows to full and
         snaps back to nothing every lap draws attention to the seam; a
         fixed-length tail chasing the marker has no seam to see. */
      if (cometRef.current) {
        /* Pattern is [dash tail][gap total], so it repeats every tail+total
           and the dash sits at path position -offset. We want it to *end* at
           the marker, so it must start a tail's length behind: offset =
           tail - at. Using total - at instead wraps a whole period and puts
           the lit stretch a tail's length in front of the marker, which is
           what it was doing — a comet leading its own head. Negative offsets
           are legal and are what carry it correctly at the start. */
        cometRef.current.style.strokeDasharray = `${tail} ${total}`;
        cometRef.current.style.strokeDashoffset = `${tail - at}`;
      }
      const reached = road.anchors.reduce(
        (acc, a, i) => (path.getPointAtLength(at).x >= a.x ? i : acc),
        0
      );
      setActive((was) => (was === reached ? was : reached));
    };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (holdRef.current !== null) {
        /* Parked on a milestone the pointer is resting on. */
        if (pausedAt === null) pausedAt = now;
        return;
      }
      if (pausedAt !== null) {
        start += now - pausedAt;
        pausedAt = null;
      }
      place(((now - start) % duration) / duration);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [road, reduce, stages.length]);

  /* Resting on a milestone parks the crossing there; leaving resumes it. */
  const hold = (i) => {
    holdRef.current = i;
    setActive(i);
    const path = pathRef.current;
    const a = road.anchors[i];
    if (!path || !a) return;
    markerRef.current?.setAttribute("transform", `translate(${a.x} ${a.y})`);
  };
  const release = () => {
    holdRef.current = null;
  };

  const stage = stages[active] || stages[0];
  const StageIcon = stage.icon || MapPin;

  return (
    <div className="mx-auto max-w-5xl">
      {/* ── The pass ── */}
      <div className="relative" onMouseLeave={release}>
        <svg
          viewBox={`0 0 ${road.width} ${geometry.band}`}
          className="w-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="jr-lit" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#D4A843" stopOpacity="0" />
              <stop offset="60%" stopColor="#D4A843" />
              <stop offset="100%" stopColor="#F2DC9A" />
            </linearGradient>
            <filter id="jr-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* The hillside the road is cut into. Barely there on purpose —
              enough to say the trail is crossing something. */}
          {!narrow && (
            <g aria-hidden="true">
              {[-30, 30].map((off) => (
                <path
                  key={off}
                  d={buildRoad(stages.length, {
                    ...geometry,
                    top: geometry.top + off,
                    bottom: geometry.bottom + off,
                  }).d}
                  fill="none"
                  stroke="rgba(229,190,92,0.05)"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </g>
          )}

          {/* The route as surveyed — the whole way, from the start, because
              the road exists before you drive it. */}
          <path
            ref={pathRef}
            d={road.d}
            fill="none"
            stroke="rgba(229,190,92,0.38)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="0.5 9"
            vectorEffect="non-scaling-stroke"
          />

          {/* The stretch under the traveller, lit. */}
          <path
            ref={cometRef}
            d={road.d}
            fill="none"
            stroke="url(#jr-lit)"
            strokeWidth="3"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            filter="url(#jr-glow)"
          />

          {/* Milestones. */}
          {road.anchors.map((a, i) => {
            const on = i === active;
            return (
              <g key={i} transform={`translate(${a.x} ${a.y})`}>
                <circle
                  r={narrow ? 14 : 12}
                  fill={on ? "#E5BE5C" : "#0A1D1A"}
                  stroke={on ? "#F2EFE6" : "rgba(229,190,92,0.35)"}
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                  style={{ transition: "fill .4s ease, stroke .4s ease" }}
                />
                {/* Numerals only where they can be read. On a phone the
                    whole pass is about 334px wide, so a numbered stone comes
                    out at three pixels — the panel below names the stage
                    anyway. */}
                {!narrow && (
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    className="font-data"
                    fontSize="11"
                    fontWeight="700"
                    fill={on ? "#0A1D1A" : "rgba(242,239,230,0.5)"}
                    style={{ transition: "fill .4s ease" }}
                  >
                    {i + 1}
                  </text>
                )}
              </g>
            );
          })}

          {/* Where the traveller has got to. A lit point, not a vehicle — a
              car at this scale is a shape nobody can read. */}
          <g ref={markerRef}>
            <circle r={narrow ? 15 : 13} fill="rgba(229,190,92,0.16)" />
            <circle r={narrow ? 6 : 5} fill="#F2EFE6" filter="url(#jr-glow)" />
          </g>
        </svg>

        {/* Phase names along the pass, above or below their own milestone.
            Hit targets as well as labels — they park the crossing. */}
        {!narrow && (
          <ul className="pointer-events-none absolute inset-0">
            {stages.map((s, i) => {
              const a = road.anchors[i];
              const above = a.side === "top";
              return (
                <li
                  key={s.step}
                  className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${(a.x / road.width) * 100}%`,
                    top: `${(((above
                      ? geometry.top - geometry.flare - 26
                      : geometry.bottom + geometry.flare + 26) /
                      geometry.band) *
                      100)}%`,
                  }}
                >
                  <button
                    type="button"
                    onMouseEnter={() => hold(i)}
                    onFocus={() => hold(i)}
                    onBlur={release}
                    onClick={() => setActive(i)}
                    className={`whitespace-nowrap font-data text-[10px] uppercase tracking-[0.2em] transition-colors duration-400 ${
                      i === active ? "text-saffron" : "text-ivory-faint hover:text-ivory-muted"
                    }`}
                  >
                    {s.phase}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── Whichever stage the traveller has reached ── */}
      <div className="relative mt-6 min-h-[176px] md:mt-8 md:min-h-[158px]">
        <AnimatePresence initial={false}>
          <Motion.div
            key={stage.step}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 top-0 mx-auto max-w-2xl text-center"
          >
            <span className="inline-flex items-center gap-2 font-data text-[10px] uppercase tracking-[0.24em] text-saffron">
              <StageIcon size={12} aria-hidden="true" />
              {stage.step} · {stage.phase}
            </span>

            <h3 className="mt-2.5 font-display text-[1.45rem] font-medium leading-snug text-ivory md:text-[1.75rem]">
              {stage.title}
            </h3>

            <p className="mx-auto mt-2 max-w-xl font-sans text-[13.5px] leading-relaxed text-ivory-muted">
              {stage.desc}
            </p>

            <button
              type="button"
              onClick={() => onPageChange(stage.page)}
              className="group mt-3.5 inline-flex items-center gap-2 font-sans text-[13px] font-semibold text-saffron"
            >
              {stage.cta}
              <ArrowRight
                size={13}
                className="transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </button>
          </Motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default JourneyRoad;
