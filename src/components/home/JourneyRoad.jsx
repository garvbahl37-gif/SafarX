import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";

/**
 * JourneyRoad — the seven stages of a trip, told as a drive.
 *
 * The road is the section, not an illustration above it. It runs down the
 * page: a straight, a bend into the other lane, another straight, and so on,
 * with a stage waiting at each straight and a car that travels the whole
 * thing as you scroll — forwards when you scroll down, back when you scroll
 * up, because it is tied to where the page is rather than to an animation
 * that has been triggered.
 *
 * The road and the stages come from one geometry function. When the earlier
 * version drew the road separately from the cards beneath it, the two could
 * disagree and did; here a stage cannot sit anywhere the road does not go.
 *
 * A phone gets the same road drawn straight. Snaking across a 390px screen
 * leaves no width for the words, and the previous build's answer — hiding the
 * road below lg — meant the progress it drove never worked on a phone at all.
 */

/* One lane each side on desktop, one lane full stop on a phone.
   Each geometry carries its own viewBox width, so its numbers mean roughly
   what they will measure on screen. Sharing a 1000-wide box across both put
   the phone at a 0.39 scale, where 280 units of spacing came out as 109
   pixels and every stage sat on top of the next. */
const DESKTOP = { view: 1000, left: 400, right: 600, straight: 200, curve: 150, stroke: 30, gutter: 62 };
const MOBILE = { view: 390, left: 34, right: 34, straight: 214, curve: 44, stroke: 22, gutter: 62 };

/**
 * The road, and the point on it where each stage waits.
 * @returns {{d: string, height: number, anchors: {x: number, y: number, side: "left"|"right"}[]}}
 */
const buildRoad = (count, g) => {
  const anchors = [];
  let x = g.left;
  let y = 0;
  let d = `M ${x} ${y}`;

  for (let i = 0; i < count; i += 1) {
    /* The straight this stage stands beside. */
    const from = y;
    y += g.straight;
    d += ` L ${x} ${y}`;
    anchors.push({ x, y: (from + y) / 2, side: x === g.left ? "left" : "right" });

    if (i < count - 1) {
      /* Into the other lane. Control points held level with each end so the
         bend leaves and arrives travelling straight down — a road, not a
         zigzag with rounded corners. */
      const next = x === g.left ? g.right : g.left;
      const mid = y + g.curve / 2;
      d += ` C ${x} ${mid}, ${next} ${mid}, ${next} ${y + g.curve}`;
      x = next;
      y += g.curve;
    }
  }

  return { d, height: y, anchors };
};

const JourneyRoad = ({ stages, onPageChange }) => {
  const reduce = useReducedMotion();
  const sectionRef = useRef(null);
  const pathRef = useRef(null);
  const carRef = useRef(null);
  const travelledRef = useRef(null);
  const dashRef = useRef(null);

  const [narrow, setNarrow] = useState(false);
  const [passed, setPassed] = useState(0);

  useEffect(() => {
    const check = () => setNarrow(window.matchMedia("(max-width: 1023px)").matches);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const geometry = narrow ? MOBILE : DESKTOP;
  const road = useMemo(
    () => buildRoad(stages.length, geometry),
    [stages.length, geometry]
  );

  /* Where the page is, turned into a position on the road.
     A scroll listener rather than an IntersectionObserver: an observer only
     reports when something crosses its edge, so jumping the page leaves the
     car parked where it last saw one. */
  useEffect(() => {
    const section = sectionRef.current;
    const path = pathRef.current;
    if (!section || !path) return undefined;

    const total = path.getTotalLength();
    let frame = 0;

    const measure = () => {
      frame = 0;
      const box = section.getBoundingClientRect();
      /* 0 as the section's top reaches the lower third of the screen, 1 once
         its bottom has passed the upper third — so the drive happens while
         the section is the thing being looked at. */
      const span = box.height + window.innerHeight * 0.34;
      const travelled = window.innerHeight * 0.66 - box.top;
      const t = Math.max(0, Math.min(1, travelled / span));

      const at = total * t;
      const p = path.getPointAtLength(at);
      const ahead = path.getPointAtLength(Math.min(at + 4, total));
      const angle = (Math.atan2(ahead.y - p.y, ahead.x - p.x) * 180) / Math.PI;
      /* +90 because the car is drawn nose-up and the road runs downward. */
      carRef.current?.setAttribute(
        "transform",
        `translate(${p.x} ${p.y}) rotate(${angle + 90})`
      );

      /* One dash as long as the whole road, retracted to expose exactly the
         stretch already driven. A dash *pattern* scrubbed this way slides,
         which reads as the surface moving under a stationary car; a single
         dash draws. */
      if (travelledRef.current) {
        travelledRef.current.style.strokeDasharray = `${total}`;
        travelledRef.current.style.strokeDashoffset = `${total - at}`;
      }
      /* Lane markings appear only where the road has been drawn, so they
         arrive with it rather than sitting on tarmac nobody has reached. */
      if (dashRef.current) {
        dashRef.current.style.strokeDasharray = `0 ${Math.max(0, at)} 14 20`;
        dashRef.current.style.strokeDashoffset = "0";
      }

      const reached = road.anchors.filter((a) => a.y <= p.y).length;
      setPassed((was) => (was === reached ? was : reached));
    };

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
  }, [road]);

  return (
    <div ref={sectionRef} className="relative mx-auto max-w-5xl">
      {/* The road. Sized by its own viewBox so the stages, positioned as
          percentages of the same geometry, always land on it. */}
      <svg
        viewBox={`0 0 ${geometry.view} ${road.height}`}
        className="w-full"
        aria-hidden="true"
      >
        <defs>
          {/* The tarmac has a sheen down its length rather than a flat fill,
              which is what stops a 30px stroke reading as a grey bar. */}
          <linearGradient id="jr-tarmac" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0.02)" />
            <stop offset="45%" stopColor="rgba(255,255,255,0.07)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
          </linearGradient>
          <linearGradient id="jr-travelled" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D4A843" />
            <stop offset="100%" stopColor="#E5BE5C" />
          </linearGradient>
          <filter id="jr-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Road not yet reached: an outline, not a surface. */}
        <path
          d={road.d}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={geometry.stroke}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          ref={pathRef}
          d={road.d}
          fill="none"
          stroke="url(#jr-tarmac)"
          strokeWidth={geometry.stroke}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Road already driven, drawn by retracting one dash the length of
            the whole path. This is the difference between a road that exists
            and waits for you, and one you are making by travelling it — and
            it is a real reveal rather than a dash pattern sliding along,
            which only ever looks like the surface is moving. */}
        <path
          ref={travelledRef}
          d={road.d}
          fill="none"
          stroke="url(#jr-travelled)"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.85"
          vectorEffect="non-scaling-stroke"
          filter="url(#jr-glow)"
        />

        {/* Lane markings, only on the stretch behind the car. */}
        <path
          ref={dashRef}
          d={road.d}
          fill="none"
          stroke="rgba(6,20,18,0.55)"
          strokeWidth="2"
          strokeLinecap="butt"
          vectorEffect="non-scaling-stroke"
        />

        {/* Kilometre stones, the way an Indian highway marks them: a yellow
            cap over a white body. A numbered stone says how far along you
            are; a plain dot says only that something is there. */}
        {road.anchors.map((a, i) => {
          const on = passed > i;
          return (
            <g key={i} transform={`translate(${a.x} ${a.y})`} style={{ transition: 'opacity .4s ease' }}>
              <rect
                x="-13" y="-17" width="26" height="34" rx="12"
                fill={on ? '#F2EFE6' : '#0A1D1A'}
                stroke={on ? '#E5BE5C' : 'rgba(255,255,255,0.2)'}
                strokeWidth="2"
                style={{ transition: 'fill .45s ease, stroke .45s ease' }}
              />
              <path
                d="M -13 -5 L -13 -5 A 13 12 0 0 1 13 -5 Z"
                fill={on ? '#E5BE5C' : 'rgba(255,255,255,0.14)'}
                style={{ transition: 'fill .45s ease' }}
              />
              <text
                x="0" y="9"
                textAnchor="middle"
                className="font-data"
                fontSize="11"
                fontWeight="700"
                fill={on ? '#0A1D1A' : 'rgba(242,239,230,0.45)'}
                style={{ transition: 'fill .45s ease' }}
              >
                {i + 1}
              </text>
            </g>
          );
        })}

        {/* The car. */}
        <g ref={carRef}>
          <g transform="translate(-11 -17)">
            <rect x="0" y="0" width="22" height="34" rx="8" fill="#E5BE5C" stroke="#061412" strokeWidth="2.5" />
            <rect x="4.5" y="5" width="13" height="9" rx="3" fill="#061412" opacity="0.65" />
            <rect x="4.5" y="20" width="13" height="7" rx="3" fill="#061412" opacity="0.4" />
          </g>
          {/* Headlights on the road ahead. */}
          <path d="M -9 -20 L -20 -54 L 20 -54 L 9 -20 Z" fill="#E5BE5C" opacity="0.09" />
        </g>
      </svg>

      {/* The stages, each pinned to its own straight. */}
      <ol className="absolute inset-0">
        {stages.map((stage, i) => {
          const anchor = road.anchors[i];
          const active = passed > i;
          const Icon = stage.icon || MapPin;
          /* On desktop a stage sits in the empty half opposite its lane; on a
             phone the road hugs the left edge and everything sits to its
             right. */
          const rightOfRoad = narrow || anchor.side === "left";

          return (
            <Motion.li
              key={stage.step}
              data-stage=""
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute"
              /* The carriageway is the strip between the two lanes, so text
                 belongs outside both — not merely on the far side of the one
                 lane this stage happens to sit in. Measuring from the wider
                 lane is what keeps a paragraph off the road when the road
                 bends back under it. */
              style={{
                top: `${(anchor.y / road.height) * 100}%`,
                [rightOfRoad ? "left" : "right"]: `${
                  ((rightOfRoad
                    ? geometry.right + geometry.gutter
                    : geometry.view - (geometry.left - geometry.gutter)) /
                    geometry.view) *
                  100
                }%`,
                width: narrow ? undefined : "31%",
                right: rightOfRoad && narrow ? "5%" : undefined,
                transform: "translateY(-50%)",
              }}
            >
              <button
                type="button"
                onClick={() => onPageChange(stage.page)}
                className={`group block w-full text-left ${rightOfRoad ? "" : "lg:text-right"}`}
              >
                <span
                  className={`inline-flex items-center gap-2 font-data text-[10px] uppercase tracking-[0.24em] transition-colors duration-500 ${
                    active ? "text-saffron" : "text-ivory-faint"
                  }`}
                >
                  <Icon size={13} aria-hidden="true" />
                  {stage.step} · {stage.phase}
                </span>

                <h3 className="mt-2 font-display text-[1.2rem] font-medium leading-snug text-ivory md:text-[1.4rem]">
                  {stage.title}
                </h3>

                <p className="mt-1.5 font-sans text-[13.5px] leading-relaxed text-ivory-muted">
                  {stage.desc}
                </p>

                <span className="mt-2.5 inline-flex items-center gap-2 font-sans text-[12.5px] font-semibold text-saffron">
                  {stage.cta}
                  <ArrowRight
                    size={13}
                    className="transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </button>
            </Motion.li>
          );
        })}
      </ol>
    </div>
  );
};

export default JourneyRoad;
