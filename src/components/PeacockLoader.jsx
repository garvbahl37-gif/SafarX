import React, { useEffect, useMemo, useRef } from "react";
import "./PeacockLoader.css";

/**
 * PeacockLoader — the SafarX peacock, drawn and animated.
 *
 * A real peacock rather than an abstract mark: its own indigo neck and
 * crested head, a scalloped covert wing over a teal body, gold legs, and
 * a train of seventeen eyed feathers. The gold S of Safar is a separate
 * ribbon woven through the bird — behind the neck at the top, across the
 * body below — so the letter and the bird read as one emblem without the
 * letter having to *be* the bird.
 *
 * The bird assembles before it displays, which is what makes the train
 * the hero rather than the opening act:
 *
 *   0.10s  a gold journey path draws west to east, waypoints lighting,
 *          and the horizon circle closes behind the bird
 *   0.45s  the S ribbon inks in as one stroke, sheen chasing it
 *   1.00s  legs, then the body settles onto them
 *   1.25s  the wing builds row by row, scale over scale
 *   1.60s  the neck grows up out of the body
 *   1.85s  head, beak, eye flashes, then the crest plume by plume
 *   2.10s  covert plumes fan out, then the eyed feathers over them
 *   2.7s   the ocelli bloom, each a beat behind its own feather
 *   3.9s   a ring of light crosses the train, a highlight rakes it,
 *          the head lifts and the eye catches the light
 *
 * Roughly 4.4s to build, then it holds and breathes.
 *
 * All geometry lives in one 580×480 viewBox. The train pivots on
 * (272, 375) — behind the bird's rump. Nothing is animated but
 * `transform`, `opacity` and `stroke-dashoffset`.
 */

const PIVOT_X = 272;
const PIVOT_Y = 375;

const MAIN_COUNT = 17; // eyed feathers
const COVERT_COUNT = 25; // filler plumes behind them

/** When the build-in finishes, in ms. The loader holds after this. */
export const PEACOCK_BUILD_MS = 4400;

// One place for the storyboard, so re-timing does not mean hunting
// through JSX. Seconds, to match CSS.
const T = {
  path: 0.1,
  circle: 0.35,
  waypoint: 0.8,
  ribbon: 0.45,
  sheen: 0.72,
  legs: 1.0,
  body: 1.1,
  wing: 1.25,
  neck: 1.6,
  head: 1.85,
  crest: 2.02,
  crestTip: 2.28,
  covert: 2.1,
  main: 2.2,
  ocellus: 0.5, // relative to its own feather
  pulse: 3.85,
  rake: 3.95,
  lift: 3.8,
  glint: 4.2,
};

/* ── Train construction ───────────────────────────────────────── */

/**
 * The fine barbs of a train feather leave the shaft at a steep angle and
 * sweep up toward the eye, which is what makes it read as a frond rather
 * than a leaf. Sixteen pairs, emitted as one path node per feather.
 */
function barbStrands(len) {
  const parts = [];
  const N = 24;
  for (let j = 0; j < N; j++) {
    const u = 0.1 + (j / (N - 1)) * 0.82;
    const y0 = PIVOT_Y - len * u;
    const w = 24 * Math.sin(Math.PI * Math.pow(u, 0.8));
    const y1 = y0 - w * 0.95;
    parts.push(
      `M${PIVOT_X} ${y0.toFixed(1)}Q${(PIVOT_X - w * 0.7).toFixed(1)} ${(
        y0 -
        w * 0.2
      ).toFixed(1)} ${(PIVOT_X - w).toFixed(1)} ${y1.toFixed(1)}`
    );
    parts.push(
      `M${PIVOT_X} ${y0.toFixed(1)}Q${(PIVOT_X + w * 0.7).toFixed(1)} ${(
        y0 -
        w * 0.2
      ).toFixed(1)} ${(PIVOT_X + w).toFixed(1)} ${y1.toFixed(1)}`
    );
  }
  return parts.join("");
}

/** The core of an ocellus is a heart, not a disc. */
function heartPath(cx, cy, k) {
  return (
    `M${cx} ${cy - 4.6 * k}` +
    `C${cx - 2.6 * k} ${cy - 9 * k} ${cx - 7.6 * k} ${cy - 7.8 * k} ${cx - 7.6 * k} ${cy - 2.6 * k}` +
    `C${cx - 7.6 * k} ${cy + 2.6 * k} ${cx - 3.4 * k} ${cy + 5.8 * k} ${cx} ${cy + 9 * k}` +
    `C${cx + 3.4 * k} ${cy + 5.8 * k} ${cx + 7.6 * k} ${cy + 2.6 * k} ${cx + 7.6 * k} ${cy - 2.6 * k}` +
    `C${cx + 7.6 * k} ${cy - 7.8 * k} ${cx + 2.6 * k} ${cy - 9 * k} ${cx} ${cy - 4.6 * k}Z`
  );
}

function buildTrain() {
  const mid = (MAIN_COUNT - 1) / 2;

  const main = Array.from({ length: MAIN_COUNT }, (_, i) => {
    const t = (i - mid) / mid; // -1 … 1, 0 at the centre feather
    const spread = Math.abs(t);
    const angle = t * 88;

    // Longest at the centre, shortest at the rim. The wobble keeps the
    // ocelli off a single circle, which otherwise reads as beads on a
    // necklace rather than a train.
    const len =
      306 *
      (0.66 + 0.34 * Math.cos(spread * 1.22)) *
      (1 + 0.04 * Math.sin(i * 2.399));

    const eyeScale = 1 + Math.sin(i * 1.13) * 0.05;
    const eyeY = PIVOT_Y - len + 29;
    const tipY = PIVOT_Y - len;
    const delay = T.main + spread * 0.48;

    return {
      i,
      angle,
      eyeY,
      eyeScale,
      spread,
      delay,
      eyeDelay: delay + T.ocellus,
      glintDelay: 4.2 + i * 0.12,
      grad: `px-p${i}`,
      gradY2: tipY,
      // A soft frond silhouette under the barbs, so the feather has body
      // as well as texture.
      frond: `M${PIVOT_X} ${PIVOT_Y}C${PIVOT_X - 17} ${PIVOT_Y - len * 0.45} ${
        PIVOT_X - 24
      } ${PIVOT_Y - len * 0.82} ${PIVOT_X} ${tipY + 24}C${PIVOT_X + 24} ${
        PIVOT_Y - len * 0.82
      } ${PIVOT_X + 17} ${PIVOT_Y - len * 0.45} ${PIVOT_X} ${PIVOT_Y}Z`,
      strands: barbStrands(len),
      shaft: `M${PIVOT_X} ${PIVOT_Y}L${PIVOT_X} ${eyeY}`,
      heart: heartPath(PIVOT_X, eyeY + 1, 1.08),
    };
  });

  const cMid = (COVERT_COUNT - 1) / 2;
  const coverts = Array.from({ length: COVERT_COUNT }, (_, i) => {
    const t = (i - cMid) / cMid;
    const spread = Math.abs(t);
    const angle = t * 100;
    const len = 232 * (0.5 + 0.5 * Math.cos(spread * 1.45));
    const tipY = PIVOT_Y - len;
    const hue = 150 + 34 * Math.pow(spread, 1.1);

    return {
      i,
      angle,
      delay: T.covert + spread * 0.4,
      grad: `px-c${i}`,
      gradStops: [
        { at: "0%", c: `hsl(${hue} 54% 8%)`, o: 0 },
        { at: "55%", c: `hsl(${hue} 56% 15%)`, o: 0.5 },
        { at: "100%", c: `hsl(${hue} 58% 23%)`, o: 0.7 },
      ],
      gradY2: tipY,
      plume: `M${PIVOT_X} ${PIVOT_Y}C${PIVOT_X - 9} ${PIVOT_Y - len * 0.5} ${
        PIVOT_X - 12
      } ${PIVOT_Y - len * 0.85} ${PIVOT_X} ${tipY}C${PIVOT_X + 12} ${
        PIVOT_Y - len * 0.85
      } ${PIVOT_X + 9} ${PIVOT_Y - len * 0.5} ${PIVOT_X} ${PIVOT_Y}Z`,
    };
  });

  return { main, coverts };
}


/**
 * A covert scale: rounded at the crown, tapering to a soft point. Plain
 * ellipses read as fish scales; a peacock's coverts are little feathers.
 */
function tongue(x, y, r) {
  return (
    `M${x - r} ${y - r * 0.15}` +
    `C${x - r} ${y - r * 1.08} ${x + r} ${y - r * 1.08} ${x + r} ${y - r * 0.15}` +
    `C${x + r} ${y + r * 0.58} ${x + r * 0.46} ${y + r * 1.06} ${x} ${y + r * 1.12}` +
    `C${x - r * 0.46} ${y + r * 1.06} ${x - r} ${y + r * 0.58} ${x - r} ${y - r * 0.15}Z`
  );
}

/**
 * The fine scaling on the neck and breast, as one path of small arcs laid
 * in offset rows. Emitted whole and clipped to the body part it belongs
 * to, so 150-odd scales cost a single node.
 */
function scaleField({ x0, x1, y0, y1, stepX, stepY, r }) {
  const parts = [];
  let row = 0;
  for (let y = y0; y <= y1; y += stepY, row++) {
    const offset = row % 2 ? stepX / 2 : 0;
    for (let x = x0 + offset; x <= x1; x += stepX) {
      parts.push(`M${x - r} ${y}A${r} ${r * 1.15} 0 0 1 ${x + r} ${y}`);
    }
  }
  return parts.join("");
}

const NECK_SCALE_FIELD = scaleField({
  x0: 214, x1: 336, y0: 148, y1: 330, stepX: 12, stepY: 9, r: 6,
});
const BODY_SCALE_FIELD = scaleField({
  x0: 142, x1: 324, y0: 280, y1: 418, stepX: 15, stepY: 11, r: 7.5,
});

/* ── The bird ─────────────────────────────────────────────────── */

// The S of Safar, as its own ribbon: behind the neck at the top, across
// the body below, so letter and bird interlock.
const RIBBON =
  "M366 226C316 180 232 190 214 236C198 278 300 296 318 336C336 378 292 424 232 410";

// Indigo neck, drawn as a tapered outline rather than a stroke so it
// narrows properly from shoulder to head.
const NECK =
  "M220 326C226 260 246 194 306 146L318 156C272 200 258 260 256 328Z";

const HEAD =
  "M316 150C308 124 324 104 348 104C370 104 384 119 382 137C380 153 366 164 347 164C330 164 320 160 316 150Z";
const BEAK = "M380 132L407 141L379 148Z";

// The covert wing: rows of overlapping scales, lower rows in front, so
// they lie like roof tiles. Greens at the shoulder cooling to teal at
// the edge.
const WING_ROWS = [
  { cy: 302, xs: [200, 228, 254], r: 17, fill: "url(#px-wing-0)" },
  { cy: 324, xs: [180, 208, 236, 262], r: 19, fill: "url(#px-wing-1)" },
  { cy: 348, xs: [164, 192, 220, 248], r: 21, fill: "url(#px-wing-2)" },
  { cy: 374, xs: [156, 184, 212, 240], r: 23, fill: "url(#px-wing-3)" },
  { cy: 400, xs: [154, 182, 210, 236], r: 24, fill: "url(#px-wing-4)" },
];

// The primaries trailing off the wing's lower edge.
const WING_PRIMARIES = [
  "M186 388C152 400 120 418 100 436C126 420 160 406 194 398Z",
  "M198 400C170 412 144 428 126 444C150 438 180 424 206 412Z",
  "M210 412C186 422 166 434 150 448C174 444 196 432 218 422Z",
];

// Crest: seven racquet-tipped plumes, as a peacock's crown actually is.
const CREST = Array.from({ length: 7 }, (_, k) => {
  const ang = ((-42 + k * 11) * Math.PI) / 180;
  const bx = 340 + k * 1.8;
  const by = 104;
  const L = 42 - Math.abs(k - 3) * 2;
  const tx = bx + Math.sin(ang) * L;
  const ty = by - Math.cos(ang) * L;
  return {
    k,
    stalk: `M${bx} ${by}Q${bx + Math.sin(ang) * L * 0.45 - 1} ${
      by - Math.cos(ang) * L * 0.5
    } ${tx.toFixed(1)} ${ty.toFixed(1)}`,
    tip: { cx: +tx.toFixed(1), cy: +ty.toFixed(1) },
  };
});

const LEGS = ["M222 404L218 444", "M252 402L256 444"];
const FEET = [
  "M206 451L218 444L230 451M218 444L216 453",
  "M244 451L256 444L268 451M256 444L254 453",
];

// The journey: a thin gold road across the composition, and the horizon
// circle it crosses.
const JOURNEY =
  "M28 448C128 432 190 412 250 408C320 403 382 420 442 434C492 445 522 448 556 450";
const WAYPOINTS = [
  { cx: 128, cy: 432, d: T.waypoint },
  { cx: 250, cy: 408, d: T.waypoint + 0.22 },
  { cx: 400, cy: 425, d: T.waypoint + 0.44 },
];

/* ── Component ────────────────────────────────────────────────── */

const PeacockLoader = ({ reduce = false, className = "" }) => {
  const { main, coverts } = useMemo(buildTrain, []);
  const rootRef = useRef(null);

  // Pointer parallax. Writes two custom properties straight onto the
  // root on an animation frame — no React state, so moving the mouse
  // never re-renders the several-hundred-node tree. Depths live in CSS.
  useEffect(() => {
    if (reduce) return undefined;
    if (!window.matchMedia?.("(pointer: fine)").matches) return undefined;

    const el = rootRef.current;
    if (!el) return undefined;

    let frame = 0;
    let nx = 0;
    let ny = 0;

    const apply = () => {
      frame = 0;
      el.style.setProperty("--px", nx.toFixed(3));
      el.style.setProperty("--py", ny.toFixed(3));
    };

    const onMove = (e) => {
      nx = (e.clientX / window.innerWidth) * 2 - 1;
      ny = (e.clientY / window.innerHeight) * 2 - 1;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduce]);

  return (
    <svg
      ref={rootRef}
      viewBox="0 0 580 480"
      preserveAspectRatio="xMidYMid meet"
      className={`px-svg ${reduce ? "px-reduced" : ""} ${className}`}
      role="img"
      aria-label="SafarX"
    >
      <defs>
        {/* One gradient per covert, spanning its own length. */}
        {coverts.map((f) => (
          <linearGradient
            key={f.grad}
            id={f.grad}
            gradientUnits="userSpaceOnUse"
            x1={PIVOT_X}
            y1={PIVOT_Y}
            x2={PIVOT_X}
            y2={f.gradY2}
          >
            {f.gradStops.map((s, k) => (
              <stop key={k} offset={s.at} stopColor={s.c} stopOpacity={s.o} />
            ))}
          </linearGradient>
        ))}
        {/* Train fronds share one green ramp — real train feathers are
            all the same green; only the eyes carry the colour. */}
        {main.map((f) => (
          <linearGradient
            key={f.grad}
            id={f.grad}
            gradientUnits="userSpaceOnUse"
            x1={PIVOT_X}
            y1={PIVOT_Y}
            x2={PIVOT_X}
            y2={f.gradY2}
          >
            <stop offset="0%" stopColor="#14472F" stopOpacity="0" />
            <stop offset="30%" stopColor="#226B44" stopOpacity="0.6" />
            <stop offset="78%" stopColor="#37A05A" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#4CBA6A" stopOpacity="0.95" />
          </linearGradient>
        ))}

        {/* Shafts — pale gold, brightening toward the eye. */}
        <linearGradient
          id="px-shaft"
          gradientUnits="userSpaceOnUse"
          x1={PIVOT_X}
          y1={PIVOT_Y}
          x2={PIVOT_X}
          y2="70"
        >
          <stop offset="0%" stopColor="#8E6A25" stopOpacity="0" />
          <stop offset="40%" stopColor="#C9982F" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#F2DC9A" stopOpacity="0.95" />
        </linearGradient>

        {/* The ocellus, outside in: cream halo, gold, green, cyan, navy. */}
        <radialGradient id="px-eye-halo" cx="50%" cy="44%" r="60%">
          <stop offset="0%" stopColor="#EFE0AE" stopOpacity="0.95" />
          <stop offset="72%" stopColor="#D8C075" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#9B7F35" stopOpacity="0.1" />
        </radialGradient>
        <radialGradient id="px-eye-gold" cx="50%" cy="40%" r="62%">
          <stop offset="0%" stopColor="#F2CE6B" />
          <stop offset="60%" stopColor="#E3B84E" />
          <stop offset="100%" stopColor="#B8862C" />
        </radialGradient>
        <radialGradient id="px-eye-green" cx="50%" cy="38%" r="64%">
          <stop offset="0%" stopColor="#57B863" />
          <stop offset="62%" stopColor="#2F8A4E" />
          <stop offset="100%" stopColor="#17603C" />
        </radialGradient>
        <radialGradient id="px-eye-cyan" cx="48%" cy="36%" r="66%">
          <stop offset="0%" stopColor="#3FC4D2" />
          <stop offset="60%" stopColor="#1BA3B8" />
          <stop offset="100%" stopColor="#127A96" />
        </radialGradient>
        <radialGradient id="px-eye-navy" cx="44%" cy="30%" r="74%">
          <stop offset="0%" stopColor="#2B4FB8" />
          <stop offset="52%" stopColor="#14318A" />
          <stop offset="100%" stopColor="#0A1B52" />
        </radialGradient>

        {/* Brushed gold: dark gold → warm → pale → warm. */}
        <linearGradient id="px-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8E6A25" />
          <stop offset="24%" stopColor="#D6A84B" />
          <stop offset="52%" stopColor="#F4D47A" />
          <stop offset="78%" stopColor="#C99532" />
          <stop offset="100%" stopColor="#EBC96F" />
        </linearGradient>

        {/* The bird's own colours. */}
        <linearGradient id="px-neck" x1="20%" y1="100%" x2="80%" y2="0%">
          <stop offset="0%" stopColor="#0C2E56" />
          <stop offset="50%" stopColor="#144C7E" />
          <stop offset="100%" stopColor="#1B6A9C" />
        </linearGradient>
        <linearGradient id="px-head" x1="10%" y1="90%" x2="90%" y2="10%">
          <stop offset="0%" stopColor="#0E3A66" />
          <stop offset="100%" stopColor="#1E6E9E" />
        </linearGradient>
        <radialGradient id="px-body" cx="62%" cy="32%" r="72%">
          <stop offset="0%" stopColor="#1E7F72" />
          <stop offset="60%" stopColor="#125A5C" />
          <stop offset="100%" stopColor="#0A3340" />
        </radialGradient>
        <linearGradient id="px-wing-0" x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="#5FB86A" />
          <stop offset="100%" stopColor="#2F7A46" />
        </linearGradient>
        <linearGradient id="px-wing-1" x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="#4CA85F" />
          <stop offset="100%" stopColor="#256E4A" />
        </linearGradient>
        <linearGradient id="px-wing-2" x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="#369465" />
          <stop offset="100%" stopColor="#1B6257" />
        </linearGradient>
        <linearGradient id="px-wing-3" x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="#238478" />
          <stop offset="100%" stopColor="#145466" />
        </linearGradient>
        <linearGradient id="px-wing-4" x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="#18708C" />
          <stop offset="100%" stopColor="#0E4460" />
        </linearGradient>

        <linearGradient
          id="px-journey"
          gradientUnits="userSpaceOnUse"
          x1="28"
          y1="0"
          x2="556"
          y2="0"
        >
          <stop offset="0%" stopColor="#8E6A25" stopOpacity="0" />
          <stop offset="24%" stopColor="#D6A84B" stopOpacity="0.8" />
          <stop offset="76%" stopColor="#D6A84B" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#8E6A25" stopOpacity="0" />
        </linearGradient>

        <radialGradient id="px-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D6A84B" stopOpacity="0.2" />
          <stop offset="40%" stopColor="#0B6B57" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#0B6B57" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="px-ground" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#01100C" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#01100C" stopOpacity="0" />
        </radialGradient>

        {/* The raking highlight that crosses the open train. */}
        <linearGradient id="px-rake-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F5F0DF" stopOpacity="0" />
          <stop offset="50%" stopColor="#F5F0DF" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#F5F0DF" stopOpacity="0" />
        </linearGradient>

        {/* A soft mask, not a clip path: a hard circular edge across the
            rake reads as a pane of glass laid over the composition. */}
        <radialGradient id="px-fan-mask-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="55%" stopColor="#fff" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
        <clipPath id="px-neck-clip">
          <path d={NECK} />
        </clipPath>
        <clipPath id="px-body-clip">
          <ellipse cx="232" cy="344" rx="84" ry="68" transform="rotate(-10 232 344)" />
        </clipPath>

        <mask id="px-fan-mask" maskUnits="userSpaceOnUse">
          <circle cx={PIVOT_X} cy={PIVOT_Y} r="320" fill="url(#px-fan-mask-grad)" />
        </mask>
      </defs>

      {/* Ambient light behind the plumage */}
      <g className="px-par-glow">
        <ellipse
          className="px-halo"
          cx="272"
          cy="300"
          rx="280"
          ry="238"
          fill="url(#px-halo)"
        />
      </g>

      {/* ── The journey: drawn before the bird exists ─────────── */}
      <g id="journey-path">
        <circle
          className="px-ink"
          style={{ "--d": `${T.circle}s`, "--dur": "1600ms" }}
          pathLength="1"
          cx="272"
          cy="352"
          r="120"
          fill="none"
          stroke="#D6A84B"
          strokeWidth="1"
          opacity="0.3"
        />
        <path
          className="px-ink"
          style={{ "--d": `${T.path}s`, "--dur": "1400ms" }}
          pathLength="1"
          d={JOURNEY}
          fill="none"
          stroke="url(#px-journey)"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        {WAYPOINTS.map((w) => (
          <circle
            key={w.cx}
            className="px-waypoint"
            style={{ "--d": `${w.d}s`, transformOrigin: `${w.cx}px ${w.cy}px` }}
            cx={w.cx}
            cy={w.cy}
            r="2.6"
            fill="#F2D27A"
          />
        ))}
      </g>

      {/* Ground shadow the bird stands on */}
      <ellipse
        className="px-fade"
        style={{ "--d": "1.3s", "--o": 1 }}
        cx="238"
        cy="456"
        rx="112"
        ry="12"
        fill="url(#px-ground)"
      />

      <g className="px-par-tail" id="tail">
        {/* ── Covert plumes: the mass behind the train ────────── */}
        <g id="coverts" opacity="0.85">
          {coverts.map((c) => (
            <path
              key={c.i}
              className="px-feather"
              style={{
                "--a": `${c.angle}deg`,
                "--d": `${c.delay}s`,
                "--dur": "1050ms",
              }}
              d={c.plume}
              fill={`url(#${c.grad})`}
            />
          ))}
        </g>

        {/* ── The eyed feathers ───────────────────────────────── */}
        <g id="feathers">
          {main.map((f) => (
            <g
              key={f.i}
              className="px-feather"
              id={`tail-feather-${String(f.i + 1).padStart(2, "0")}`}
              style={{ "--a": `${f.angle}deg`, "--d": `${f.delay}s` }}
            >
              <path d={f.frond} fill={`url(#${f.grad})`} opacity="0.68" />
              <path
                d={f.strands}
                fill="none"
                stroke={`url(#${f.grad})`}
                strokeWidth="0.85"
                strokeLinecap="round"
              />
              <path
                d={f.shaft}
                fill="none"
                stroke="url(#px-shaft)"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <g
                className="px-ocellus"
                style={{
                  "--ed": `${f.eyeDelay}s`,
                  "--es": f.eyeScale,
                  transformOrigin: `${PIVOT_X}px ${f.eyeY}px`,
                }}
              >
                <ellipse cx={PIVOT_X} cy={f.eyeY} rx="24" ry="29" fill="url(#px-eye-halo)" />
                <ellipse cx={PIVOT_X} cy={f.eyeY} rx="19.5" ry="24.5" fill="url(#px-eye-gold)" />
                <ellipse cx={PIVOT_X} cy={f.eyeY} rx="14.8" ry="18.6" fill="url(#px-eye-green)" />
                <ellipse cx={PIVOT_X} cy={f.eyeY + 0.4} rx="10.6" ry="13.4" fill="url(#px-eye-cyan)" />
                <path d={f.heart} fill="url(#px-eye-navy)" />
                <ellipse
                  cx={PIVOT_X - 2.8}
                  cy={f.eyeY - 5.2}
                  rx="2.2"
                  ry="3"
                  fill="#EAF4FF"
                  opacity="0.32"
                />
                <ellipse
                  className="px-glint"
                  style={{ "--sd": `${f.glintDelay}s` }}
                  cx={PIVOT_X}
                  cy={f.eyeY}
                  rx="19.5"
                  ry="24.5"
                  fill="none"
                  stroke="#F2D27A"
                  strokeWidth="1.2"
                />
              </g>
            </g>
          ))}
        </g>

        {/* Light travelling outward through the open train */}
        <ellipse
          className="px-pulse"
          style={{ "--d": `${T.pulse}s` }}
          cx={PIVOT_X}
          cy={PIVOT_Y}
          rx="296"
          ry="296"
          fill="none"
          stroke="#D6A84B"
          strokeWidth="1.6"
        />

        {/* A raking highlight crossing the plumage on the diagonal */}
        <g mask="url(#px-fan-mask)">
          <rect
            className="px-rake"
            style={{ "--d": `${T.rake}s` }}
            x="-150"
            y="40"
            width="92"
            height="470"
            fill="url(#px-rake-grad)"
          />
        </g>
      </g>

      {/* ── The bird ──────────────────────────────────────────── */}
      <g className="px-par-body">
        <g id="peacock">
          {/* Legs, then the body settling onto them */}
          <g id="legs">
            {LEGS.map((d, i) => (
              <path
                key={i}
                className="px-ink"
                style={{ "--d": `${T.legs + i * 0.08}s`, "--dur": "620ms" }}
                pathLength="1"
                d={d}
                fill="none"
                stroke="#C99532"
                strokeWidth="4"
                strokeLinecap="round"
              />
            ))}
            {FEET.map((d, i) => (
              <path
                key={i}
                className="px-ink"
                style={{ "--d": `${T.legs + 0.35 + i * 0.08}s`, "--dur": "480ms" }}
                pathLength="1"
                d={d}
                fill="none"
                stroke="#C99532"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </g>

          <g
            id="body"
            className="px-rise"
            style={{ "--d": `${T.body}s`, transformOrigin: "232px 410px" }}
          >
            <ellipse
              cx="232"
              cy="344"
              rx="84"
              ry="68"
              transform="rotate(-10 232 344)"
              fill="url(#px-body)"
            />
            <g clipPath="url(#px-body-clip)">
              <path
                d={BODY_SCALE_FIELD}
                fill="none"
                stroke="#3FA48E"
                strokeWidth="0.9"
                opacity="0.3"
              />
            </g>
            {/* Rim light along the back, where the sky would catch it */}
            <path
              d="M162 320C180 284 214 266 256 272C288 277 306 296 310 320"
              fill="none"
              stroke="#5FD0B4"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.28"
            />
          </g>

          {/* ── The covert wing, laid on like roof tiles ───────── */}
          <g id="peacock-wing">
            {WING_PRIMARIES.map((d, i) => (
              <path
                key={i}
                className="px-wing"
                style={{ "--d": `${T.wing + 0.5 + i * 0.07}s`, "--o": 0.95 }}
                d={d}
                fill="url(#px-wing-4)"
                opacity="0.95"
              />
            ))}
            {WING_ROWS.map((row, r) =>
              row.xs.map((x, c) => (
                <g
                  key={`${r}-${c}`}
                  className="px-pop"
                  style={{
                    "--d": `${T.wing + r * 0.09 + c * 0.03}s`,
                    transformOrigin: `${x}px ${row.cy}px`,
                  }}
                >
                  <path
                    d={tongue(x, row.cy, row.r)}
                    fill={row.fill}
                    stroke="#C9982F"
                    strokeWidth="0.8"
                    strokeOpacity="0.55"
                  />
                  <path
                    d={`M${x} ${row.cy - row.r * 0.85}L${x} ${row.cy + row.r * 0.95}`}
                    stroke="#0B3A31"
                    strokeWidth="0.7"
                    strokeLinecap="round"
                    opacity="0.35"
                  />
                </g>
              ))
            )}
          </g>

          {/* ── The S of Safar, woven through the bird ─────────── */}
          <g id="ribbon" style={{ filter: "drop-shadow(0 0 14px rgba(214,168,75,0.32))" }}>
            <path
              className="px-ink"
              style={{ "--d": `${T.ribbon}s`, "--dur": "1150ms" }}
              pathLength="1"
              d={RIBBON}
              fill="none"
              stroke="url(#px-gold)"
              strokeWidth="28"
              strokeLinecap="round"
            />
            <path
              className="px-ink"
              style={{ "--d": `${T.sheen}s`, "--dur": "1150ms" }}
              pathLength="1"
              d={RIBBON}
              fill="none"
              stroke="#FBF3D8"
              strokeWidth="3.4"
              strokeLinecap="round"
              opacity="0.5"
              transform="translate(-4 -4)"
            />
          </g>
          {/* The neck grows up out of the body, head and crest on top */}
          <g className="px-headlift" style={{ "--d": `${T.lift}s` }}>
            <g className="px-neck" style={{ "--d": `${T.neck}s` }}>
              <path d={NECK} fill="url(#px-neck)" />
              <g clipPath="url(#px-neck-clip)">
                <path
                  d={NECK_SCALE_FIELD}
                  fill="none"
                  stroke="#4FA6D6"
                  strokeWidth="0.85"
                  opacity="0.38"
                />
                {/* The shaded side of the throat */}
                <path
                  d="M220 326C226 260 246 194 306 146L312 151C268 196 248 260 246 328Z"
                  fill="#061F3C"
                  opacity="0.34"
                />
              </g>
              {/* Highlight down the front of the neck */}
              <path
                d="M316 156C278 198 262 254 258 320"
                fill="none"
                stroke="#6FC2E8"
                strokeWidth="1.8"
                strokeLinecap="round"
                opacity="0.3"
              />
            </g>

            <g
              id="peacock-head"
              className="px-pop"
              style={{ "--d": `${T.head}s`, transformOrigin: "349px 132px" }}
            >
              <path d={HEAD} fill="url(#px-head)" />
              <path d={BEAK} fill="#E9D9A8" />
              <path
                d="M382 134L404 141"
                stroke="#FBF3D8"
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.7"
              />
              {/* The white eye-stripes a real peacock has */}
              <ellipse cx="350" cy="117" rx="9" ry="3.8" transform="rotate(-14 350 117)" fill="#F3EFE0" opacity="0.9" />
              <ellipse cx="353" cy="146" rx="8" ry="3.4" transform="rotate(-8 353 146)" fill="#F3EFE0" opacity="0.85" />
              <circle cx="355" cy="131" r="4.5" fill="#06121F" />
              <circle cx="356.4" cy="129.4" r="1.3" fill="#F5F0DF" opacity="0.85" />
              <circle
                className="px-eyeglint"
                style={{ "--d": `${T.glint}s` }}
                cx="353"
                cy="132"
                r="2"
                fill="#F4D47A"
              />
            </g>

            <g id="crest">
              {CREST.map((c) => (
                <g key={c.k}>
                  <path
                    className="px-ink"
                    style={{ "--d": `${T.crest + c.k * 0.055}s`, "--dur": "460ms" }}
                    pathLength="1"
                    d={c.stalk}
                    fill="none"
                    stroke="#1A5A8C"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <g
                    className="px-pop"
                    style={{
                      "--d": `${T.crestTip + c.k * 0.055}s`,
                      transformOrigin: `${c.tip.cx}px ${c.tip.cy}px`,
                    }}
                  >
                    <ellipse cx={c.tip.cx} cy={c.tip.cy} rx="4" ry="5.4" fill="#E3B84E" />
                    <ellipse cx={c.tip.cx} cy={c.tip.cy} rx="2.6" ry="3.6" fill="#1BA3B8" />
                    <ellipse cx={c.tip.cx} cy={c.tip.cy + 0.4} rx="1.2" ry="1.8" fill="#14318A" />
                  </g>
                </g>
              ))}
            </g>
          </g>

        </g>
      </g>
    </svg>
  );
};

/**
 * PeacockMark — the same bird reduced to what survives at 16px: the
 * S-neck, the head and crest, and seven plumes with a single eye ring
 * each. Static, no animation. Use it for the favicon, the nav logo and
 * anywhere the full loader is too much.
 */
export const PeacockMark = ({ size = 32, className = "", title = "SafarX" }) => {
  const plumes = Array.from({ length: 7 }, (_, i) => {
    const t = (i - 3) / 3;
    const angle = t * 76;
    const len = 42 * (0.66 + 0.34 * Math.cos(Math.abs(t) * 1.3));
    return { i, angle, len };
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id="pm-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F4D47A" />
          <stop offset="55%" stopColor="#D6A84B" />
          <stop offset="100%" stopColor="#8E6A25" />
        </linearGradient>
      </defs>

      <g transform="translate(50 78)">
        {plumes.map((p) => (
          <g key={p.i} transform={`rotate(${p.angle})`}>
            <path
              d={`M0 0C-4 ${-p.len * 0.5} -5 ${-p.len * 0.85} 0 ${-p.len}C5 ${
                -p.len * 0.85
              } 4 ${-p.len * 0.5} 0 0Z`}
              fill="#2F7A46"
            />
            <circle cy={-p.len + 5} r="4.2" fill="#E3B84E" />
            <circle cy={-p.len + 5} r="2.4" fill="#14318A" />
          </g>
        ))}
      </g>

      {/* The S — the one shape the mark cannot lose */}
      <path
        d="M62 26C51 18 38 22 39 33C40 43 57 44 58 54C60 63 49 70 38 66"
        fill="none"
        stroke="url(#pm-gold)"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M56 25C55 19 59 14 65 15C70 16 73 20 72 25C72 29 69 31 65 31L74 35L64 33C59 32 57 29 56 25Z"
        fill="url(#pm-gold)"
      />
      <circle cx="65" cy="22" r="1.5" fill="#06121F" />
      <path d="M63 14C65 9 69 6 73 3" stroke="#D6A84B" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <circle cx="73" cy="3" r="2" fill="#F2D27A" />
    </svg>
  );
};

export default PeacockLoader;
