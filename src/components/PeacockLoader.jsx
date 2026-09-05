import React, { useEffect, useMemo, useRef } from "react";
import "./PeacockLoader.css";

/**
 * PeacockLoader — the SafarX mark, drawn and animated.
 *
 * The bird from the app icon: a gold "S" that is also a peacock's neck
 * — the S of Safar — crowned with a crest, one folded wing at its side,
 * and a train that unfurls behind it. A gold journey path runs beneath
 * the whole thing and draws itself first, so the sequence reads as a
 * journey unfolding rather than a logo appearing.
 *
 * The bird assembles before it displays, which is the order that makes
 * the train the hero rather than the opening act:
 *
 *   0.10s  the journey path draws itself west to east, waypoints lighting
 *   0.35s  the S inks in as one stroke, sheen chasing it
 *   1.15s  head and beak, then the crest, plume by plume
 *   1.45s  the wing unfolds in four layered plates
 *   1.75s  the covert plumes fan out — the mass behind the train
 *   1.85s  the eyed feathers sweep over them, centre first
 *   2.4s   the ocelli bloom, each a beat behind its own feather
 *   3.6s   a ring of light crosses the train, a highlight rakes it,
 *          the head lifts a few degrees and the eye catches the light
 *
 * Roughly 4.1s to build, then it holds and breathes: the train sways,
 * the gold rims glint in a slow wave, and the whole thing answers the
 * pointer with a few pixels of parallax.
 *
 * All geometry lives in one 520×470 viewBox, pivoting on (260, 396).
 * Nothing is animated but `transform`, `opacity` and `stroke-dashoffset`.
 */

const PIVOT_X = 260;
const PIVOT_Y = 396;

const MAIN_COUNT = 21; // eyed feathers
const COVERT_COUNT = 27; // filler plumes behind them

/** When the build-in finishes, in ms. The loader holds after this. */
export const PEACOCK_BUILD_MS = 4100;

// One place for the storyboard, so re-timing does not mean hunting
// through JSX. Seconds, to match CSS.
const T = {
  path: 0.1,
  waypoint: 0.55,
  body: 0.35,
  sheen: 0.62,
  head: 1.15,
  crest: 1.35,
  crestTip: 1.62,
  wing: 1.45,
  covert: 1.75,
  main: 1.85,
  ocellus: 0.48, // relative to its own feather
  pulse: 3.55,
  rake: 3.65,
  lift: 3.5,
  glint: 3.95,
  birds: 3.85,
};

/* ── Feather construction ─────────────────────────────────────── */

/**
 * The hairline barbs combed off the shaft. Nine pairs, each leaving the
 * quill and sweeping up and out — this is the detail that reads as a
 * feather rather than a leaf, and it costs one path node per feather.
 */
function barbStrands(len, lean) {
  const parts = [];
  const N = 9;
  for (let j = 0; j < N; j++) {
    const u = 0.14 + (j / (N - 1)) * 0.76;
    const y0 = PIVOT_Y - len * u;
    const y1 = PIVOT_Y - len * Math.min(u + 0.13, 0.99);
    const w = 15.5 * Math.sin(Math.PI * Math.pow(u, 0.82));
    const ym = (y0 + y1) / 2;
    const bow = lean * 3.2 * u;
    parts.push(
      `M${PIVOT_X + bow} ${y0.toFixed(1)}Q${(PIVOT_X - w * 0.5 + bow).toFixed(
        1
      )} ${ym.toFixed(1)} ${(PIVOT_X - w + bow).toFixed(1)} ${y1.toFixed(1)}`
    );
    parts.push(
      `M${PIVOT_X + bow} ${y0.toFixed(1)}Q${(PIVOT_X + w * 0.5 + bow).toFixed(
        1
      )} ${ym.toFixed(1)} ${(PIVOT_X + w + bow).toFixed(1)} ${y1.toFixed(1)}`
    );
  }
  return parts.join("");
}

/** The indigo core of an ocellus is a heart, not a disc. */
function heartPath(cx, cy) {
  return (
    `M${cx} ${cy - 4.2}` +
    `C${cx - 2.2} ${cy - 8.2} ${cx - 6.6} ${cy - 7.2} ${cx - 6.6} ${cy - 2.6}` +
    `C${cx - 6.6} ${cy + 2.2} ${cx - 3} ${cy + 5.1} ${cx} ${cy + 7.9}` +
    `C${cx + 3} ${cy + 5.1} ${cx + 6.6} ${cy + 2.2} ${cx + 6.6} ${cy - 2.6}` +
    `C${cx + 6.6} ${cy - 7.2} ${cx + 2.2} ${cy - 8.2} ${cx} ${cy - 4.2}Z`
  );
}

function buildTrain() {
  const mid = (MAIN_COUNT - 1) / 2;

  const main = Array.from({ length: MAIN_COUNT }, (_, i) => {
    const t = (i - mid) / mid; // -1 … 1, 0 at the centre feather
    const spread = Math.abs(t);
    const angle = t * 90;

    // Longest at the centre, shortest at the rim — the silhouette of a
    // real display is a rounded arc, not a half-disc. The wobble keeps
    // the ocelli off a single circle, which otherwise reads as beads on
    // a necklace rather than a train.
    const len =
      272 *
      (0.62 + 0.38 * Math.cos(spread * 1.28)) *
      (1 + 0.05 * Math.sin(i * 2.399));

    // Per-feather curvature and eye placement, deterministic so the
    // layout is identical on every load.
    const lean = Math.sin(i * 1.7) * 0.9;
    const eyeNudge = Math.sin(i * 3.3) * 2.2;
    const eyeScale = 1 + Math.sin(i * 1.13) * 0.06;

    const eyeY = PIVOT_Y - len + 19 + eyeNudge;
    const tipY = PIVOT_Y - len;

    // Emerald and teal at the centre walking to peacock blue at the rim,
    // dimming as it goes so the outer feathers fall back into shadow.
    const hue = 167 + 29 * Math.pow(spread, 1.15);
    const sat = 78 - 6 * spread;
    const lTip = 33 - 7 * spread;
    const lMid = 21 - 5 * spread;

    const delay = T.main + spread * 0.5;

    return {
      i,
      angle,
      eyeY,
      eyeScale,
      spread,
      delay,
      eyeDelay: delay + T.ocellus,
      glintDelay: 3.9 + i * 0.1,
      grad: `px-p${i}`,
      gradStops: [
        { at: "0%", c: `hsl(${hue} ${sat}% ${lMid * 0.5}%)`, o: 0 },
        { at: "26%", c: `hsl(${hue} ${sat}% ${lMid}%)`, o: 0.34 },
        { at: "72%", c: `hsl(${hue} ${sat}% ${lTip}%)`, o: 0.62 },
        { at: "100%", c: `hsl(${hue + 5} ${sat + 6}% ${lTip + 9}%)`, o: 0.72 },
      ],
      gradY2: tipY,
      quill: `M${PIVOT_X} ${PIVOT_Y}C${PIVOT_X - 5 + lean * 4} ${
        PIVOT_Y - len * 0.42
      } ${PIVOT_X + 5 + lean * 3} ${PIVOT_Y - len * 0.76} ${
        PIVOT_X + lean * 2
      } ${eyeY}`,
      barb: `M${PIVOT_X} ${PIVOT_Y}C${PIVOT_X - 11 + lean * 3} ${
        PIVOT_Y - len * 0.45
      } ${PIVOT_X - 12 + lean * 3} ${PIVOT_Y - len * 0.83} ${
        PIVOT_X + lean * 2
      } ${tipY + 12}C${PIVOT_X + 12 + lean * 3} ${PIVOT_Y - len * 0.83} ${
        PIVOT_X + 11 + lean * 3
      } ${PIVOT_Y - len * 0.45} ${PIVOT_X} ${PIVOT_Y}Z`,
      strands: barbStrands(len, lean),
      heart: heartPath(PIVOT_X + lean * 2, eyeY + 1),
      eyeX: PIVOT_X + lean * 2,
    };
  });

  const cMid = (COVERT_COUNT - 1) / 2;
  const coverts = Array.from({ length: COVERT_COUNT }, (_, i) => {
    const t = (i - cMid) / cMid;
    const spread = Math.abs(t);
    const angle = t * 99; // splayed wider than the eyed feathers
    const len = 214 * (0.54 + 0.46 * Math.cos(spread * 1.4));
    const tipY = PIVOT_Y - len;
    const hue = 168 + 26 * Math.pow(spread, 1.1);

    return {
      i,
      angle,
      delay: T.covert + spread * 0.4,
      grad: `px-c${i}`,
      gradStops: [
        { at: "0%", c: `hsl(${hue} 62% 8%)`, o: 0 },
        { at: "55%", c: `hsl(${hue} 64% 15%)`, o: 0.5 },
        { at: "100%", c: `hsl(${hue} 66% 23%)`, o: 0.72 },
      ],
      gradY2: tipY,
      plume: `M${PIVOT_X} ${PIVOT_Y}C${PIVOT_X - 8} ${PIVOT_Y - len * 0.5} ${
        PIVOT_X - 10
      } ${PIVOT_Y - len * 0.85} ${PIVOT_X} ${tipY}C${PIVOT_X + 10} ${
        PIVOT_Y - len * 0.85
      } ${PIVOT_X + 8} ${PIVOT_Y - len * 0.5} ${PIVOT_X} ${PIVOT_Y}Z`,
    };
  });

  return { main, coverts };
}

/* ── Body geometry ────────────────────────────────────────────
   Authored in its own space and placed with one group transform, so
   these coordinates are also what the transform-origins below refer to.
   ─────────────────────────────────────────────────────────────── */

const S_PATH =
  "M278 148C234 116 180 132 184 176C188 218 258 222 264 262C270 300 226 328 182 312";

// The crest, arcing up and away from the crown.
const CREST = [0, 1, 2, 3, 4].map((i) => ({
  i,
  stalk: `M${280 + i * 4} 119C${283 + i * 5} ${105 - i * 2} ${291 + i * 7} ${
    97 - i * 4
  } ${297 + i * 9} ${87 - i * 6}`,
  tip: { cx: 297 + i * 9, cy: 87 - i * 6 },
}));

// Four nested plates, outermost first — deep peacock through to blue.
const WING = [
  { d: "M240 208C204 218 174 244 162 298C198 288 228 256 246 222Z", f: "url(#px-wing-1)", o: 0.9 },
  { d: "M240 214C209 224 184 248 174 290C204 278 228 252 245 224Z", f: "url(#px-wing-2)", o: 0.88 },
  { d: "M241 220C215 228 194 250 186 282C212 270 229 250 244 226Z", f: "url(#px-wing-3)", o: 0.8 },
  { d: "M241 226C221 232 204 250 198 274C219 264 230 250 243 230Z", f: "url(#px-wing-4)", o: 0.7 },
];

// Thin linework suggesting the flights, running with the wing's spine.
const WING_LINES = [
  "M238 214C206 224 180 248 170 292",
  "M240 220C212 230 190 252 182 284",
  "M241 226C218 234 200 254 194 278",
];

// The journey: a thin gold road running the width of the composition,
// dipping under the bird. Authored in viewBox space, not body space.
const JOURNEY =
  "M26 452C118 436 168 410 232 404C300 398 352 420 404 434C440 444 466 448 496 450";
const WAYPOINTS = [
  { cx: 118, cy: 431, d: 0.72 },
  { cx: 232, cy: 404, d: 0.94 },
  { cx: 356, cy: 422, d: 1.16 },
];

/* ── Component ────────────────────────────────────────────────── */

const PeacockLoader = ({ reduce = false, className = "" }) => {
  const { main, coverts } = useMemo(buildTrain, []);
  const rootRef = useRef(null);

  // Pointer parallax. Writes two custom properties straight onto the
  // root on an animation frame — no React state, so moving the mouse
  // never re-renders the 300-node tree. The depths live in the CSS.
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
      viewBox="0 0 520 470"
      preserveAspectRatio="xMidYMid meet"
      className={`px-svg ${reduce ? "px-reduced" : ""} ${className}`}
      role="img"
      aria-label="SafarX"
    >
      <defs>
        {/* One gradient per feather, spanning that feather's own length,
            so a short rim feather is as saturated at its tip as a long
            central one. */}
        {[...coverts, ...main].map((f) => (
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

        {/* Quills — gold at the tip, dissolving into the base. */}
        <linearGradient
          id="px-quill"
          gradientUnits="userSpaceOnUse"
          x1={PIVOT_X}
          y1={PIVOT_Y}
          x2={PIVOT_X}
          y2="110"
        >
          <stop offset="0%" stopColor="#8E6A25" stopOpacity="0" />
          <stop offset="42%" stopColor="#C99532" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#F2D27A" stopOpacity="0.8" />
        </linearGradient>

        {/* The ocellus, outside in: bronze halo, gold, jade, indigo. */}
        <radialGradient id="px-eye-bronze" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#B98B38" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#6B4A18" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="px-eye-gold" cx="50%" cy="40%" r="62%">
          <stop offset="0%" stopColor="#F4D47A" />
          <stop offset="48%" stopColor="#D6A84B" />
          <stop offset="100%" stopColor="#8E6A25" />
        </radialGradient>
        <radialGradient id="px-eye-jade" cx="50%" cy="38%" r="64%">
          <stop offset="0%" stopColor="#0FA88C" />
          <stop offset="58%" stopColor="#0B6B57" />
          <stop offset="100%" stopColor="#073B35" />
        </radialGradient>
        <radialGradient id="px-eye-indigo" cx="46%" cy="32%" r="72%">
          <stop offset="0%" stopColor="#0E93BE" />
          <stop offset="46%" stopColor="#086080" />
          <stop offset="100%" stopColor="#052A3E" />
        </radialGradient>

        {/* Brushed gold: dark gold → warm → pale → warm. */}
        <linearGradient id="px-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8E6A25" />
          <stop offset="26%" stopColor="#D6A84B" />
          <stop offset="54%" stopColor="#F4D47A" />
          <stop offset="80%" stopColor="#C99532" />
          <stop offset="100%" stopColor="#E6C069" />
        </linearGradient>
        <linearGradient id="px-gold-soft" x1="8%" y1="0%" x2="92%" y2="100%">
          <stop offset="0%" stopColor="#D6A84B" />
          <stop offset="100%" stopColor="#8E6A25" />
        </linearGradient>
        <linearGradient
          id="px-journey"
          gradientUnits="userSpaceOnUse"
          x1="26"
          y1="0"
          x2="496"
          y2="0"
        >
          <stop offset="0%" stopColor="#8E6A25" stopOpacity="0" />
          <stop offset="24%" stopColor="#D6A84B" stopOpacity="0.75" />
          <stop offset="76%" stopColor="#D6A84B" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#8E6A25" stopOpacity="0" />
        </linearGradient>

        {/* Wing plates, deep peacock out to peacock blue. */}
        <linearGradient id="px-wing-1" x1="80%" y1="0%" x2="10%" y2="100%">
          <stop offset="0%" stopColor="#0B6B57" />
          <stop offset="100%" stopColor="#052722" />
        </linearGradient>
        <linearGradient id="px-wing-2" x1="80%" y1="0%" x2="10%" y2="100%">
          <stop offset="0%" stopColor="#078B78" />
          <stop offset="100%" stopColor="#073B35" />
        </linearGradient>
        <linearGradient id="px-wing-3" x1="80%" y1="0%" x2="10%" y2="100%">
          <stop offset="0%" stopColor="#0A8F7C" />
          <stop offset="100%" stopColor="#075558" />
        </linearGradient>
        <linearGradient id="px-wing-4" x1="80%" y1="0%" x2="10%" y2="100%">
          <stop offset="0%" stopColor="#0B7E9C" />
          <stop offset="100%" stopColor="#0A5F7E" />
        </linearGradient>

        <radialGradient id="px-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D6A84B" stopOpacity="0.22" />
          <stop offset="40%" stopColor="#078B78" stopOpacity="0.13" />
          <stop offset="100%" stopColor="#078B78" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="px-ground" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#010A08" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#010A08" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="px-reflect" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D6A84B" stopOpacity="0.17" />
          <stop offset="100%" stopColor="#D6A84B" stopOpacity="0" />
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
        <mask id="px-fan-mask" maskUnits="userSpaceOnUse">
          <circle cx={PIVOT_X} cy={PIVOT_Y} r="300" fill="url(#px-fan-mask-grad)" />
        </mask>
      </defs>

      {/* Ambient light behind the plumage */}
      <g className="px-par-glow">
        <ellipse
          className="px-halo"
          cx="260"
          cy="308"
          rx="256"
          ry="224"
          fill="url(#px-halo)"
        />
      </g>

      {/* ── The journey: drawn before anything else exists ────── */}
      <g id="journey-path">
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
            r="2.4"
            fill="#F2D27A"
          />
        ))}
      </g>

      {/* Ground shadow and the gold cast under the train */}
      <ellipse
        className="px-fade"
        style={{ "--d": "1.6s", "--o": 1 }}
        cx="260"
        cy="408"
        rx="132"
        ry="16"
        fill="url(#px-ground)"
      />
      <ellipse
        className="px-fade"
        style={{ "--d": "3.2s", "--o": 1 }}
        cx="260"
        cy="420"
        rx="212"
        ry="26"
        fill="url(#px-reflect)"
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
              <path d={f.barb} fill={`url(#${f.grad})`} />
              <path
                d={f.strands}
                fill="none"
                stroke={`url(#${f.grad})`}
                strokeWidth="1.15"
                strokeLinecap="round"
                opacity={1 - f.spread * 0.22}
              />
              <path
                d={f.quill}
                fill="none"
                stroke="url(#px-quill)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <g
                className="px-ocellus"
                style={{
                  "--ed": `${f.eyeDelay}s`,
                  "--es": f.eyeScale,
                  transformOrigin: `${f.eyeX}px ${f.eyeY}px`,
                }}
              >
                <ellipse cx={f.eyeX} cy={f.eyeY} rx="18" ry="22.5" fill="url(#px-eye-bronze)" />
                <ellipse cx={f.eyeX} cy={f.eyeY} rx="13.2" ry="17" fill="url(#px-eye-gold)" />
                <ellipse cx={f.eyeX} cy={f.eyeY} rx="10" ry="13.2" fill="url(#px-eye-jade)" />
                <path d={f.heart} fill="url(#px-eye-indigo)" />
                <path
                  d={f.heart}
                  fill="none"
                  stroke="#5FB8D6"
                  strokeWidth="0.9"
                  opacity="0.4"
                />
                {/* The tiny gold accent at the centre of the eye */}
                <circle cx={f.eyeX} cy={f.eyeY + 0.5} r="1.6" fill="#F2D27A" opacity="0.85" />
                <ellipse
                  cx={f.eyeX - 1.8}
                  cy={f.eyeY - 4.2}
                  rx="1.8"
                  ry="2.4"
                  fill="#F5F0DF"
                  opacity="0.4"
                />
                <ellipse
                  className="px-glint"
                  style={{ "--sd": `${f.glintDelay}s` }}
                  cx={f.eyeX}
                  cy={f.eyeY}
                  rx="13.2"
                  ry="17"
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
          rx="248"
          ry="248"
          fill="none"
          stroke="#D6A84B"
          strokeWidth="1.6"
        />

        {/* A raking highlight crossing the plumage on the diagonal */}
        <g mask="url(#px-fan-mask)">
          <rect
            className="px-rake"
            style={{ "--d": `${T.rake}s` }}
            x="-140"
            y="60"
            width="88"
            height="440"
            fill="url(#px-rake-grad)"
          />
        </g>
      </g>

      {/* ── The bird ──────────────────────────────────────────── */}
      <g className="px-par-body">
        <g
          id="peacock"
          transform="translate(20 63) scale(0.98)"
          style={{ filter: "drop-shadow(0 0 16px rgba(214,168,75,0.34))" }}
        >
          {/* The S — neck, breast and body in one stroke */}
          <path
            id="peacock-body"
            className="px-ink"
            style={{ "--d": `${T.body}s`, "--dur": "1150ms" }}
            pathLength="1"
            d={S_PATH}
            fill="none"
            stroke="url(#px-gold)"
            strokeWidth="23"
            strokeLinecap="round"
          />
          {/* Sheen chasing the stroke */}
          <path
            className="px-ink"
            style={{ "--d": `${T.sheen}s`, "--dur": "1150ms" }}
            pathLength="1"
            d={S_PATH}
            fill="none"
            stroke="#F7EDCA"
            strokeWidth="3.6"
            strokeLinecap="round"
            opacity="0.5"
            transform="translate(-3.5 -3.5)"
          />

          {/* ── The folded wing ───────────────────────────────── */}
          <g id="peacock-wing">
            {WING.map((w, i) => (
              <path
                key={i}
                className="px-wing"
                style={{ "--d": `${T.wing + i * 0.09}s`, "--o": w.o }}
                d={w.d}
                fill={w.f}
                opacity={w.o}
              />
            ))}
            {/* Gold contour and the thin flight lines inside it */}
            <path
              className="px-ink"
              style={{ "--d": `${T.wing + 0.3}s`, "--dur": "900ms" }}
              pathLength="1"
              d={WING[0].d}
              fill="none"
              stroke="#D6A84B"
              strokeWidth="1"
              opacity="0.55"
            />
            {WING_LINES.map((d, i) => (
              <path
                key={i}
                className="px-ink"
                style={{ "--d": `${T.wing + 0.42 + i * 0.07}s`, "--dur": "760ms" }}
                pathLength="1"
                d={d}
                fill="none"
                stroke="#D6A84B"
                strokeWidth="0.6"
                opacity="0.32"
              />
            ))}
          </g>

          {/* The sweep at the foot of the S */}
          <path
            className="px-pop"
            style={{ "--d": `${T.wing + 0.1}s`, transformOrigin: "212px 316px" }}
            d="M176 306C214 330 272 324 314 288C300 330 226 348 170 322Z"
            fill="url(#px-gold-soft)"
          />

          {/* ── Head, beak and crest ──────────────────────────── */}
          <g className="px-headlift" style={{ "--d": `${T.lift}s` }}>
            <g
              id="peacock-head"
              className="px-pop"
              style={{ "--d": `${T.head}s`, transformOrigin: "288px 138px" }}
            >
              <path
                d="M268 143C263 128 274 114 289 116C302 118 310 129 308 142C307 151 300 157 291 156L315 171L288 162C276 160 269 152 268 143Z"
                fill="url(#px-gold)"
              />
              {/* A highlight on the beak */}
              <path
                d="M295 158L311 168"
                stroke="#F4D47A"
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.7"
              />
              <circle cx="291" cy="132" r="3.1" fill="#052A24" />
              <circle cx="292.2" cy="130.9" r="1" fill="#F5F0DF" opacity="0.8" />
              {/* One brief catchlight, late */}
              <circle
                className="px-eyeglint"
                style={{ "--d": `${T.glint}s` }}
                cx="290"
                cy="133.4"
                r="1.5"
                fill="#F4D47A"
              />
            </g>

            <g id="crest">
              {CREST.map((c) => (
                <g key={c.i}>
                  <path
                    className="px-ink"
                    style={{ "--d": `${T.crest + c.i * 0.065}s`, "--dur": "500ms" }}
                    pathLength="1"
                    d={c.stalk}
                    fill="none"
                    stroke="#D6A84B"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <ellipse
                    className="px-pop"
                    style={{
                      "--d": `${T.crestTip + c.i * 0.065}s`,
                      transformOrigin: `${c.tip.cx}px ${c.tip.cy}px`,
                    }}
                    cx={c.tip.cx}
                    cy={c.tip.cy}
                    rx="3.2"
                    ry="4.6"
                    fill="#F2D27A"
                  />
                </g>
              ))}
            </g>
          </g>
        </g>
      </g>

      {/* Two birds leaving, as on the icon */}
      {[
        { d: T.birds, x: 452, y: 132, s: 1 },
        { d: T.birds + 0.18, x: 481, y: 106, s: 0.76 },
      ].map((b, i) => (
        <path
          key={i}
          className="px-bird"
          style={{ "--d": `${b.d}s`, transformOrigin: `${b.x}px ${b.y}px` }}
          d={`M${b.x - 10 * b.s} ${b.y}q${5 * b.s} ${-5.5 * b.s} ${10 * b.s} 0q${
            5 * b.s
          } ${-5.5 * b.s} ${10 * b.s} 0`}
          fill="none"
          stroke="#D6A84B"
          strokeWidth={1.7 * b.s}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
};

/**
 * PeacockMark — the same bird reduced to what survives at 16px: the
 * S-neck, the head and crest, and seven plumes with a single eye ring
 * each. Static, no animation, no gradients per feather. Use it for the
 * favicon, the nav logo and anywhere the full loader is too much.
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

      {/* Plumes, pivoting on the bird's base */}
      <g transform="translate(50 78)">
        {plumes.map((p) => (
          <g key={p.i} transform={`rotate(${p.angle})`}>
            <path
              d={`M0 0C-4 ${-p.len * 0.5} -5 ${-p.len * 0.85} 0 ${-p.len}C5 ${
                -p.len * 0.85
              } 4 ${-p.len * 0.5} 0 0Z`}
              fill="#0B6B57"
            />
            <circle cy={-p.len + 5} r="4.2" fill="#D6A84B" />
            <circle cy={-p.len + 5} r="2.4" fill="#086080" />
          </g>
        ))}
      </g>

      {/* The S-neck — the one shape the mark cannot lose */}
      <path
        d="M62 26C51 18 38 22 39 33C40 43 57 44 58 54C60 63 49 70 38 66"
        fill="none"
        stroke="url(#pm-gold)"
        strokeWidth="9"
        strokeLinecap="round"
      />
      {/* Head, beak, crest */}
      <path
        d="M56 25C55 19 59 14 65 15C70 16 73 20 72 25C72 29 69 31 65 31L74 35L64 33C59 32 57 29 56 25Z"
        fill="url(#pm-gold)"
      />
      <circle cx="65" cy="22" r="1.5" fill="#052A24" />
      <path
        d="M63 14C65 9 69 6 73 3"
        stroke="#D6A84B"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="73" cy="3" r="2" fill="#F2D27A" />
    </svg>
  );
};

export default PeacockLoader;
