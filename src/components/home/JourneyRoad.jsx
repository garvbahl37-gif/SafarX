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

/* The road climbs. A serpentine that only travels sideways is a snake —
   there is nothing mountainous about it, because nothing gains height. So
   the corridor's centreline rises from the bottom-left to the top-right,
   and the switchbacks zig-zag about that rising line rather than about a
   flat one.

   Everything narrows on the way up. The bends get tighter, the runs get
   shorter and the sway shrinks, because that is what a hill road does when
   it recedes from you — and it is what turns a flat pattern into a slope
   with depth.

   `switches` is how many hairpins fall between one stage and the next. One
   bend per stage, stretched across the width a name needs, comes out as a
   gentle meander; three tight turns in the same span give the switchbacks
   their frequency. */
const DESKTOP = {
  band: 440, pad: 58, switches: 3,
  yStart: 336, yEnd: 104,     // bottom-left up to top-right
  ampStart: 29, ampEnd: 13,   // sway either side of the climb
  curveStart: 96, curveEnd: 58,
  runStart: 46, runEnd: 28,
  wNear: 34, wFar: 7,         // carriageway, near to far
};
const MOBILE = {
  band: 330, pad: 26, switches: 1,
  yStart: 236, yEnd: 84,
  ampStart: 22, ampEnd: 11,
  curveStart: 78, curveEnd: 52,
  runStart: 32, runEnd: 22,
  wNear: 22, wFar: 6,
};

/**
 * A ridge line for the country behind the road. Straight segments, because
 * a mountain skyline is faceted, and rising to the right so the range agrees
 * with the climb in front of it.
 */
const buildRidge = (width, base, peak, seed) => {
  const n = 11;
  let d = `M 0 ${base}`;
  for (let i = 0; i <= n; i += 1) {
    const t = i / n;
    const jag = 1 - 0.42 * Math.abs(Math.sin(i * seed));
    d += ` L ${(t * width).toFixed(1)} ${(base - peak * (0.22 + 0.78 * t) * jag).toFixed(1)}`;
  }
  return `${d} L ${width} ${base} Z`;
};

/** How long the marker takes to cross the whole pass, per stage. */
const SECONDS_PER_STAGE = 2.2;

/**
 * The climb, sampled as points rather than emitted as a path string.
 *
 * A stroked line cannot look like a road, however it bends — it has one
 * width everywhere, so nothing about it recedes. What makes a road read as
 * a road is carriageway: two edges that converge as they go away from you,
 * with a broken line down the middle. That needs the centreline as *points*,
 * so each one can be pushed out along its own normal by a half-width that
 * shrinks with distance. Hence sampling the curves here rather than handing
 * a `d` string to the browser.
 *
 * @returns {{pts: {x,y,t}[], anchors: {x,y,t,i,amp,side}[], width: number}}
 */
const buildRoad = (count, g) => {
  const mix = (a, b, t) => a + (b - a) * t;
  const pts = [];
  const anchors = [];
  const totalTurns = Math.max(1, (count - 1) * g.switches);

  const push = (x, y) => {
    const last = pts[pts.length - 1];
    if (last && Math.abs(last.x - x) < 0.01 && Math.abs(last.y - y) < 0.01) return;
    pts.push({ x, y });
  };
  /* Sampled rather than handed to the renderer, so the ribbon can be built
     off the same points the centreline uses and the two cannot disagree. */
  const cubic = (p0, c1, c2, p3, steps = 16) => {
    for (let i = 1; i <= steps; i += 1) {
      const t = i / steps;
      const u = 1 - t;
      push(
        u * u * u * p0.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * p3.x,
        u * u * u * p0.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * p3.y
      );
    }
  };

  let turn = 0;
  let x = g.pad;
  let side = 1; // +1 below the centreline of the climb, -1 above it
  let y = mix(g.yStart, g.yEnd, 0) + side * mix(g.ampStart, g.ampEnd, 0);
  push(x, y);

  for (let i = 0; i < count; i += 1) {
    const p = turn / totalTurns;
    const amp = mix(g.ampStart, g.ampEnd, p);

    /* The run this stage stands beside. It rides the rail, and the rail is
       itself climbing, so the run is never quite level. */
    const from = x;
    x += mix(g.runStart, g.runEnd, p);
    y = mix(g.yStart, g.yEnd, p) + side * amp;
    push(x, y);
    anchors.push({
      x: (from + x) / 2,
      y,
      t: p,
      i: pts.length - 1,
      amp,
      side: side > 0 ? "bottom" : "top",
    });

    if (i < count - 1) {
      for (let k = 0; k < g.switches; k += 1) {
        /* Every turn identical reads as a coil. A deterministic wobble on the
           turn's index varies how far each bend runs and how hard it flares,
           so the climb answers a hillside instead of looking wound onto a
           spool — and lays down the same way on every load. */
        turn += 1;
        const q = turn / totalTurns;
        const c = mix(g.curveStart, g.curveEnd, q) * (1 + Math.sin(turn * 2.399) * 0.18);
        const a2 = mix(g.ampStart, g.ampEnd, q);
        const f = a2 * 0.5 * (1 + Math.cos(turn * 1.7) * 0.24);
        const nextSide = -side;
        const ny = mix(g.yStart, g.yEnd, q) + nextSide * a2;
        cubic(
          { x, y },
          { x: x + c * 0.38, y: y - side * f },
          { x: x + c * 0.62, y: ny - nextSide * f },
          { x: x + c, y: ny }
        );
        x += c;
        y = ny;
        side = nextSide;
      }
    }
  }

  /* Progress along the finished line, which is what every width, radius and
     opacity downstream is keyed to. Distance-based rather than index-based:
     the samples are denser through the bends, so counting them would make the
     road narrow in jerks at every corner. */
  let run = 0;
  const cum = pts.map((pt, i) => {
    if (i > 0) run += Math.hypot(pt.x - pts[i - 1].x, pt.y - pts[i - 1].y);
    return run;
  });
  pts.forEach((pt, i) => {
    pt.t = run ? cum[i] / run : 0;
  });
  anchors.forEach((a) => {
    a.t = pts[a.i]?.t ?? a.t;
  });

  return { pts, anchors, width: x + g.pad };
};

/** The centreline itself, for the marker to ride and the lane line to follow. */
const centreLine = (pts) =>
  pts.map((p, i) => `${i ? "L" : "M"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

/** Half the carriageway at a given point, narrowing as the road recedes. */
const halfWidth = (t, g) => (g.wNear + (g.wFar - g.wNear) * t) / 2;

/**
 * The carriageway: every centreline point pushed out along its own normal,
 * up one edge and back down the other. This is the whole illusion — the
 * edges converge because the half-width shrinks, and converging edges are
 * what the eye reads as distance.
 */
const carriageway = (pts, g) => {
  const left = [];
  const right = [];
  for (let i = 0; i < pts.length; i += 1) {
    const p = pts[i];
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const hw = halfWidth(p.t, g);
    left.push([p.x - (dy / len) * hw, p.y + (dx / len) * hw]);
    right.push([p.x + (dy / len) * hw, p.y - (dx / len) * hw]);
  }
  const fwd = left.map((q, i) => `${i ? "L" : "M"} ${q[0].toFixed(1)} ${q[1].toFixed(1)}`);
  const back = right.reverse().map((q) => `L ${q[0].toFixed(1)} ${q[1].toFixed(1)}`);
  return `${fwd.join(" ")} ${back.join(" ")} Z`;
};

/**
 * The broken line down the middle. Drawn as tapering quads rather than a
 * dashed stroke, because a dashed stroke keeps one width for its whole
 * length and would undo the perspective the carriageway just bought.
 */
const laneLine = (pts, g) => {
  const out = [];
  const step = 10;
  const dash = 5;
  for (let i = 0; i + dash < pts.length; i += step) {
    const seg = [];
    for (let k = 0; k <= dash; k += 1) {
      const p = pts[i + k];
      const a = pts[Math.max(0, i + k - 1)];
      const b = pts[Math.min(pts.length - 1, i + k + 1)];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const hw = Math.max(0.35, halfWidth(p.t, g) * 0.09);
      seg.push([
        [p.x - (dy / len) * hw, p.y + (dx / len) * hw],
        [p.x + (dy / len) * hw, p.y - (dx / len) * hw],
      ]);
    }
    const fwd = seg.map((q, k) => `${k ? "L" : "M"} ${q[0][0].toFixed(1)} ${q[0][1].toFixed(1)}`);
    const back = seg.reverse().map((q) => `L ${q[1][0].toFixed(1)} ${q[1][1].toFixed(1)}`);
    out.push(`${fwd.join(" ")} ${back.join(" ")} Z`);
  }
  return out.join(" ");
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
  /* How much road stays lit behind the traveller. */
  const tailLen = road.width * 0.24;
  const shape = useMemo(
    () => ({
      centre: centreLine(road.pts),
      surface: carriageway(road.pts, geometry),
      lanes: laneLine(road.pts, geometry),
    }),
    [road, geometry]
  );

  /* The crossing. One rAF loop drives the marker and the comet directly
     through refs — the panel is the only thing that re-renders, and only
     when the stage under the marker actually changes. */
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return undefined;

    const total = path.getTotalLength();

    const place = (t) => {
      const at = total * t;
      const p = path.getPointAtLength(at);
      markerRef.current?.setAttribute("transform", `translate(${p.x} ${p.y})`);
      /* The lit window's bright edge sits on the traveller; everything to
         its left fades back into unlit tarmac. */
      cometRef.current?.setAttribute("x", `${p.x - tailLen}`);
      const reached = road.anchors.reduce((acc, a, i) => (p.x >= a.x ? i : acc), 0);
      setActive((was) => (was === reached ? was : reached));
    };

    /* Reduced motion gets the finished climb, parked at the summit. */
    if (reduce) {
      place(1);
      return undefined;
    }

    const duration = stages.length * SECONDS_PER_STAGE * 1000;
    let raf = 0;
    let start = performance.now();
    let pausedAt = null;

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
  }, [road, reduce, stages.length, tailLen]);

  /* Resting on a milestone parks the crossing there; leaving resumes it. */
  const hold = (i) => {
    holdRef.current = i;
    setActive(i);
    const a = road.anchors[i];
    if (!a) return;
    markerRef.current?.setAttribute("transform", `translate(${a.x} ${a.y})`);
    cometRef.current?.setAttribute("x", `${a.x - tailLen}`);
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
            {/* Near tarmac catches more light than far tarmac. */}
            <linearGradient id="jr-asphalt" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#22443C" />
              <stop offset="55%" stopColor="#16332E" />
              <stop offset="100%" stopColor="#0D211E" />
            </linearGradient>
            <linearGradient id="jr-lit" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#E5BE5C" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#F2DC9A" stopOpacity="0.85" />
            </linearGradient>
            {/* A soft-edged window that slides along with the traveller. */}
            <linearGradient id="jr-comet-fade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#000" />
              <stop offset="55%" stopColor="#8a8a8a" />
              <stop offset="100%" stopColor="#fff" />
            </linearGradient>
            {/* The ranges run to the edge of the drawing, where they stop
                dead and leave a vertical lip against the page. Feathering
                them out sideways lets the country end without a seam. */}
            <linearGradient id="jr-edge-fade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#000" />
              <stop offset="7%" stopColor="#fff" />
              <stop offset="93%" stopColor="#fff" />
              <stop offset="100%" stopColor="#000" />
            </linearGradient>
            <mask id="jr-ridge-mask" maskUnits="userSpaceOnUse">
              <rect x="0" y="0" width={road.width} height={geometry.band} fill="url(#jr-edge-fade)" />
            </mask>
            <mask id="jr-comet-mask" maskUnits="userSpaceOnUse">
              <rect ref={cometRef} x={-tailLen * 2} y="0" width={tailLen} height={geometry.band * 2} fill="url(#jr-comet-fade)" />
            </mask>
            {/* The ranges fade out downward. Filled flat they were a slab
                with a hard bottom edge and a visible lip at each side, which
                read as a box drawn behind the road rather than as country. */}
            <linearGradient id="jr-ridge-far" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2E8B74" stopOpacity="0.11" />
              <stop offset="100%" stopColor="#2E8B74" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="jr-ridge-near" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0B3C35" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#0B3C35" stopOpacity="0" />
            </linearGradient>
            <filter id="jr-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* The country the road is cut into. Two ranges, the far one
              paler, so the climb has something to climb. Barely there on
              purpose — this is background, not subject. */}
          <g aria-hidden="true" mask="url(#jr-ridge-mask)">
            <path d={buildRidge(road.width, geometry.band, geometry.band * 0.60, 2.1)} fill="url(#jr-ridge-far)" />
            <path d={buildRidge(road.width, geometry.band, geometry.band * 0.42, 3.7)} fill="url(#jr-ridge-near)" />
          </g>

          {/* Terraces following the road. */}
          {!narrow && (
            <g aria-hidden="true">
              {[-30, 30].map((off) => (
                <path
                  key={off}
                  d={buildRoad(stages.length, {
                    ...geometry,
                    yStart: geometry.yStart + off,
                    yEnd: geometry.yEnd + off,
                  }).d}
                  fill="none"
                  stroke="rgba(229,190,92,0.05)"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </g>
          )}

          {/* The road itself. Asphalt laid between two converging edges,
              lighter where it is near and sinking into the hillside as it
              goes — the gradient does as much of the recession as the taper
              does. */}
          <path d={shape.surface} fill="url(#jr-asphalt)" />
          <path
            d={shape.surface}
            fill="none"
            stroke="rgba(229,190,92,0.30)"
            strokeWidth="1"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <path d={shape.lanes} fill="rgba(242,239,230,0.34)" />

          {/* The centreline the marker rides. Never painted — it exists so
              the marker and the lit stretch have something to follow. */}
          <path ref={pathRef} d={shape.centre} fill="none" stroke="none" />

          {/* The stretch under the traveller, lit. Masked rather than
              dashed: a dash pattern along a tapering ribbon cannot follow
              its width, but a mask sliding over the finished road can. */}
          <g mask="url(#jr-comet-mask)">
            {/* No blur on this one. A gaussian over the whole carriageway
                is re-rasterised every frame as the mask slides past, which
                cost enough to stall the page; the glow belongs on the marker,
                which is small. */}
            <path d={shape.surface} fill="url(#jr-lit)" />
            <path d={shape.lanes} fill="#FBF3D8" />
          </g>

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
                    top: `${((a.y + (above ? -1 : 1) * (a.amp * 0.5 + 30)) /
                      geometry.band) *
                      100}%`,
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
