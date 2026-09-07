"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * The four diagrams on the /titanecosystem rail.
 *
 * They live apart from the section so that file stays about LAYOUT — the
 * scroll line, the pointer, the alternating columns — and this one is only
 * about drawing. Pick one with `<PartVisual kind="…" />`.
 *
 *   orbit      a dot that splits into six, blooms outward, merges down to
 *              three, and falls back in — reproduced from a reference clip
 *   mandala    three rings of nodes that turn and breathe through each other
 *   web        a spider crossing a square grid, spinning threads to the nearest
 *   monogram   a letter cloud that turns once in 3D, then scrambles into a
 *              dot-matrix "TC" with a field band above and below
 *
 * THREE ENGINES, each for a reason:
 *
 *   CSS keyframes   the orbit and the star. They loop forever with no input,
 *                   so they should keep going whether or not React renders.
 *   rAF + refs      the spider. Its body moves every frame and its threads are
 *                   `x1`/`y1`/`x2`/`y2` — SVG attributes CSS cannot animate.
 *                   Writing them through refs avoids re-rendering the whole
 *                   grid sixty times a second — and every dot is re-lit each
 *                   frame as well, so that is 77 nodes plus 16 threads.
 *   Canvas          the monogram, because a couple of thousand particles is
 *                   far past what the DOM will animate. See its own note.
 *
 * NOTHING STARTS UNTIL IT IS SEEN. Every visual is wrapped by PartVisual in an
 * observed element: the CSS ones are paused through `animation-play-state`,
 * and the two rAF loops check the same flag themselves.
 *
 * DETERMINISM. Anything rendered on the server — the SVG dot field, the
 * triangle's vertices — is hand-picked, never Math.random, because a random
 * value chosen during render differs between server and client and React would
 * report a hydration mismatch. The canvas is exempt: it builds its particles
 * inside an effect, which only ever runs on the client.
 */

/* ─────────────────────────────────────────────────────────
   Shared geometry. Sizes are `min(vw, vh)` against the
   1728x1117 reference so they shrink on narrow AND short
   screens, then clamp at both ends.
   ───────────────────────────────────────────────────────── */
export const VISUAL_SIZE = "clamp(220px, min(26vw, 40vh), 440px)";
/** The mandala runs larger — see the note on its wrapper. */
const MANDALA_SIZE = "clamp(280px, min(40vw, 60vh), 660px)";

const STROKE = "rgba(255,255,255,0.45)";
/** Mandala. The ring-to-ring spokes stay faint on purpose — they only read
 *  where they overlap, which is what gives the reference its woven look. */
const MANDALA_EDGE = "rgba(255,255,255,0.13)";
/** The polygon each ring closes on itself — the figure, as opposed to the web
 *  behind it. Its alpha ramps with the ring's own radius: white when the ring
 *  is at its innermost, and back down to the spokes' tone at its outermost, so
 *  only the inner figure is picked out. */
const MANDALA_EDGE_IN = 0.55;
const MANDALA_EDGE_OUT = 0.13;
const MANDALA_NODE_FILL = "rgba(255,255,255,0.92)";
/** The spider. White on navy, as the reference is white on black — the threads
 *  keep only a faint cool cast so they sit in the section's palette. */
const SPIDER_BODY = "rgba(235,244,255,0.98)";
const SPIDER_THREAD = "rgba(214,232,255,0.78)";

export type VisualKind = "orbit" | "mandala" | "web" | "monogram";

/* ═════════════════════════════════════════════════════════
   KEYFRAMES — injected once by the section.
   ═════════════════════════════════════════════════════════ */
export const VISUAL_KEYFRAMES = () => `
@keyframes eco-spin { to { transform: rotate(360deg); } }
@keyframes eco-spin-slow { to { transform: rotate(360deg); } }
@keyframes eco-spin-back { to { transform: rotate(-360deg); } }

/* NOTHING RUNS UNTIL THE READER GETS THERE.
   Every visual is wrapped in [data-eco-visual], and until its observer reports
   it on screen the wrapper is "idle" and every animation inside is paused.
   Without this, all four start on mount: by the time the last part on the rail
   is scrolled to, its orbit has been cycling unseen for a minute and is caught
   mid-collapse. PAUSING rather than never-starting is deliberate — a visual
   scrolled away and back resumes where it was instead of snapping to 0%.

   The spider and the monogram are canvas/rAF rather than CSS, so this rule
   cannot reach them; each gates its own loop on the same observer. */
[data-eco-visual="idle"],
[data-eco-visual="idle"] * {
  animation-play-state: paused !important;
}
`;

/* ═════════════════════════════════════════════════════════
   1. ORBIT
   ═════════════════════════════════════════════════════════ */
/**
 * Reproduced from the reference clip (720x720, 60fps, 24.2s), measured frame
 * by frame with a radial profile: at each radius, how many of 180 sampled
 * angles are lit. A radius where most are lit is a ring; a radius where a few
 * discrete arcs are lit is the satellites, and the arc count is how many.
 *
 * THE CLIP IS TWO LOOPS, NOT ONE. That is the thing an earlier build missed —
 * it reproduced the first and stopped there.
 *
 *   LOOP ONE  t=0.4-7.4   The ring stays SMALL, fixed at r=13 the whole way.
 *                         One dot becomes six, they bloom to r=84, six merge
 *                         down to three, and the three fall back in.
 *   LOOP TWO  t=10.2-19.6 Starts as a PAIR, not six — two dots spreading left
 *                         and right to r=78. Then the RING ITSELF GROWS, 13 up
 *                         to 48 between t=12.6 and t=15.6, and only once it is
 *                         out do the satellites multiply, 2-3-4-5-6 over eight
 *                         tenths of a second, redistributing evenly each time.
 *                         Then they collapse and the big ring shrinks back to
 *                         13, which is where loop one starts again.
 *
 * Why this is rAF and not CSS keyframes like it used to be: the satellite
 * COUNT changes, and the survivors redistribute around the circle when it
 * does. Six fixed elements with their own keyframes cannot express "five dots
 * evenly spaced" — the positions depend on how many there currently are. In
 * JS the whole timeline is just a table of measurements and a lerp.
 *
 * The clip's white transition cards (t=0-0.2, 1.6-2.0, 9.2-9.4) are NOT
 * reproduced; they are edit points in a showreel, not part of the mechanism.
 */

/** Measured stops as [reference second, value]. Radii are in the 240px frame
 *  the measurements were taken in; RADIUS_SCALE converts to a fraction of the
 *  box. Everything is expressed on the clip's own clock, so the numbers below
 *  can be checked against it directly. */
type Stop = [number, number];

const ORBIT_T0 = 0.4; // the clip's first settled frame
const ORBIT_T1 = 24.0;

/** The ring: fixed at 13 through loop one, grown to 48 in loop two, back down. */
const ORBIT_RING: Stop[] = [
  [0.4, 13], [12.4, 13], [12.6, 17], [12.8, 30], [13.0, 35], [13.6, 42],
  [14.0, 44], [14.2, 45], [14.4, 46], [14.8, 47], [15.6, 48], [21.2, 48],
  [21.4, 46], [21.6, 45], [22.0, 25], [22.2, 19], [22.6, 13], [24.0, 13],
];

/** The satellites' orbit radius across both loops. Zero is "home". */
const ORBIT_SAT: Stop[] = [
  [0.4, 0], [0.8, 5], [1.0, 36], [1.2, 51], [1.4, 63], [2.2, 75], [2.6, 77],
  [3.0, 80], [3.4, 82], [3.8, 84], [6.4, 84], [6.6, 82], [6.8, 64], [7.0, 37],
  [7.2, 24], [7.4, 0], [10.0, 0],
  [10.2, 22], [10.4, 45], [10.6, 53], [10.8, 62], [11.2, 68], [11.6, 73],
  [12.0, 76], [12.4, 77], [12.6, 78], [15.6, 76], [16.8, 75], [17.2, 74],
  [18.2, 73], [18.8, 72], [19.0, 66], [19.2, 51], [19.4, 24], [19.6, 0],
  [24.0, 0],
];

/** How many satellites there are. Fractional on purpose: the in-between values
 *  are what spread the dots apart as one more arrives, which is what the clip
 *  does — five dots sit at 72 degrees, six at 60. */
const ORBIT_COUNT_STOPS: Stop[] = [
  /* SIX DROPS TO TWO WHILE EVERYTHING IS HOME. The satellites are at radius
     zero from t=7.4 to t=10.2, and the switch has to happen inside that
     window. It used to run from 10.0 to 10.2 — which is exactly when they
     emerge — so the count was passing through 5, 4 and 3 as they came out and
     you saw five dots originate before it settled to two. */
  [0.4, 6], [4.4, 6], [7.4, 6], [7.5, 2],
  [16.2, 2], [16.4, 3], [16.6, 4], [16.8, 5], [17.0, 6], [24.0, 6],
];

/** Loop one's merge: six become three between t=3.4 and t=4.4. Measured angles
 *  go 0/60/120/180/240/300 to 60/180/300 — every other dot walks 60 degrees
 *  onto its neighbour and is absorbed there, so the three that remain are the
 *  ORIGINAL odd ones rather than a fresh even spread. */
const ORBIT_MERGE_FROM = 3.4;
const ORBIT_MERGE_TO = 4.4;
/** Loop one's satellites are back at the centre — and stay there until loop
 *  two starts them again at t=10.2. ANY change to how many satellites there
 *  are, or to how they are placed, has to happen inside this window, because
 *  it is the only stretch where nothing is drawn to jump. */
const ORBIT_HOME = 7.4;

/** Rotation, in degrees, as measured. Loop one holds still while it blooms and
 *  only turns after the merge (-12.8 deg/s); loop two holds until the six are
 *  established and then turns the other way (+13 deg/s). The 90-degree offset
 *  at t=10.2 is what puts loop two's opening pair left-and-right rather than
 *  on the hexagon's up axis, which is where the clip has it. */
const ORBIT_TURN: Stop[] = [
  [0.4, 0], [3.4, 0], [7.4, -51], [10.1, -51],
  [10.2, 90], [16.8, 90], [19.6, 126], [24.0, 126],
];

/** Satellite diameter against its own orbit radius: measured 15.9 at r=30 and
 *  25.0 at r=84, which is this line. So a satellite grows as it travels. */
const ORBIT_DOT_BASE = 10.85;
const ORBIT_DOT_SLOPE = 0.1685;

/** Wall-clock seconds for the whole thing. The clip's own span is 23.6s; this
 *  runs it faster while keeping every proportion, so the two loops stay in the
 *  ratio they were measured in. One number changes the pace of all of it. */
const ORBIT_SECONDS = 12;

/** Six elements is the most the clip ever shows at once. */
const ORBIT_SLOTS = 6;

/* The viewBox is 240 units because the measurements were taken in a 240px
   frame — so every radius in the tables above is used AS IS, with no scale
   factor to get wrong, and can be checked straight against the clip. */
const ORBIT_VB = 240;
const ORBIT_RING_DASH = "6 4";
const ORBIT_SAT_DASH = "6 5";
const ORBIT_SAT_FILL = "eco-sat-fill";

/** Linear interpolation over a table of measured stops. */
function orbitAt(stops: Stop[], t: number): number {
  if (t <= stops[0][0]) return stops[0][1];
  for (let i = 0; i < stops.length - 1; i++) {
    const [t0, v0] = stops[i];
    const [t1, v1] = stops[i + 1];
    if (t >= t0 && t <= t1) {
      return t1 === t0 ? v1 : v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
    }
  }
  return stops[stops.length - 1][1];
}

function Orbit() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const coreRef = useRef<SVGCircleElement>(null);
  const satRefs = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let visible = false;
    const start = performance.now();

    /* The CSS pause rule cannot reach an rAF loop, so this gates itself on the
       same observer the others use. */
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.15 }
    );
    io.observe(wrap);

    const c = ORBIT_VB / 2;
    const span = ORBIT_T1 - ORBIT_T0;

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (!visible) return;

      /* Wall clock -> the clip's own clock, so every table above is read in
         the units it was measured in. */
      const cycle = ((now - start) / 1000 / ORBIT_SECONDS) % 1;
      const t = reduced ? 5 : ORBIT_T0 + cycle * span;

      const ringR = orbitAt(ORBIT_RING, t);
      const satR = orbitAt(ORBIT_SAT, t);
      const turn = orbitAt(ORBIT_TURN, t);

      const ring = ringRef.current;
      if (ring) ring.setAttribute("r", ringR.toFixed(2));

      /* The core is the satellites, at home. It is lit only while they are —
         measured: the centre pixel is dark for every frame they are out. */
      const core = coreRef.current;
      if (core) {
        const home = Math.max(0, 1 - satR / 6);
        core.setAttribute("opacity", home.toFixed(3));
        core.setAttribute("r", (ORBIT_DOT_BASE / 2).toFixed(2));
      }

      /* Loop one's merge, as its own term: alternate dots walk +60 degrees and
         fade out as they arrive, and the three survivors stay on the ORIGINAL
         odd slots afterwards rather than re-spreading.

         It has to stop being in force at ORBIT_HOME — the moment loop one's
         satellites reach the centre. Handing back to the evenly-spaced
         placement moves the survivors from 60/180/300 to 0/120/240, so the
         handover is only invisible where the radius is zero. It used to happen
         at 10.1, halfway through loop two's dots emerging, which is the other
         half of the five-dots-originating glitch. */
      const merging =
        t >= ORBIT_MERGE_FROM && t <= ORBIT_MERGE_TO
          ? (t - ORBIT_MERGE_FROM) / (ORBIT_MERGE_TO - ORBIT_MERGE_FROM)
          : t > ORBIT_MERGE_TO && t < ORBIT_HOME
            ? 1
            : 0;

      const count = orbitAt(ORBIT_COUNT_STOPS, t);
      const dia = ORBIT_DOT_BASE + ORBIT_DOT_SLOPE * satR;

      /* A SATELLITE IS NOT DRAWN UNTIL IT HAS CLEARED THE CORE IT CAME FROM.
         The old guard was `satR < 0.5`, which let all six appear at full size
         while still centred on the core: measured 405ms of loop one with six
         rings piled on one dot, reading as four or five shapes boiling out of
         the middle. It was invisible while they were 95% transparent and
         obvious the moment they became opaque white.
         Fading over the clearance distance also runs in reverse, so they are
         absorbed into the core on the way home instead of blinking out. */
      const clear = ORBIT_DOT_BASE / 2 + dia / 2;
      const emerge = Math.min(1, Math.max(0, (satR - clear * 0.45) / (clear * 0.55)));

      for (let i = 0; i < ORBIT_SLOTS; i++) {
        const el = satRefs.current[i];
        if (!el) continue;

        let angle: number;
        let opacity: number;

        if (merging > 0) {
          /* Still on the six-slot hexagon: the odd ones hold, the even ones
             travel onto them. */
          angle = i * 60 + (i % 2 === 0 ? 60 * merging : 0);
          opacity = i % 2 === 0 ? Math.max(0, 1 - merging * 1.6) : 1;
        } else {
          /* Evenly spaced for however many there currently are — and BLENDED
             BETWEEN THE TWO WHOLE ARRANGEMENTS while that number is changing.

             The obvious `i * 360 / count` is wrong even though it looks right.
             With a fractional count the arriving dot is placed at
             `i * 360 / count`, which for the third dot at count=2.05 is 351
             degrees — hard against its neighbour — and it then swings 111
             degrees round to 240 as the count fills in. It reads as a dot
             flying around the ring rather than appearing.

             Blending instead means the dots already there glide from the old
             spacing to the new one, and the newcomer fades in exactly where it
             is going to live. */
          const nLow = Math.max(1, Math.floor(count));
          const nHigh = Math.max(1, Math.ceil(count));
          const f = count - Math.floor(count);
          if (i < nLow) {
            const from = (i * 360) / nLow;
            const to = (i * 360) / nHigh;
            angle = from + (to - from) * f;
            opacity = 1;
          } else if (i < nHigh) {
            angle = (i * 360) / nHigh;
            opacity = f;
          } else {
            angle = 0;
            opacity = 0;
          }
        }

        opacity *= emerge;
        if (opacity <= 0.002) {
          el.setAttribute("opacity", "0");
          continue;
        }
        const a = ((angle + turn) * Math.PI) / 180 - Math.PI / 2;
        el.setAttribute("cx", (c + Math.cos(a) * satR).toFixed(2));
        el.setAttribute("cy", (c + Math.sin(a) * satR).toFixed(2));
        el.setAttribute("r", (dia / 2).toFixed(2));
        el.setAttribute("opacity", opacity.toFixed(3));
      }
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative shrink-0"
      style={{ width: VISUAL_SIZE, height: VISUAL_SIZE }}
      aria-hidden
    >
      <svg
        viewBox={`0 0 ${ORBIT_VB} ${ORBIT_VB}`}
        className="h-full w-full"
        style={{ overflow: "visible" }}
      >
        <defs>
          {/* Light pooling inside the outline. Kept well under the stroke so the
              dashes still read as dashes rather than filling in to a disc. */}
          <radialGradient id={ORBIT_SAT_FILL}>
            <stop offset="0%" stopColor="#EAF2FF" stopOpacity="0.20" />
            <stop offset="58%" stopColor="#BBD3FF" stopOpacity="0.11" />
            <stop offset="100%" stopColor="#8FB4FF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* THE RING. Dashed: coverage at its radius measures a steady 0.62 of
            the circle in the reference, which a solid stroke cannot be.
            `non-scaling-stroke` holds the width AND the dash rhythm in screen
            pixels while the radius changes underneath. */}
        <circle
          ref={ringRef}
          cx={ORBIT_VB / 2}
          cy={ORBIT_VB / 2}
          r={13}
          fill="none"
          stroke={STROKE}
          strokeWidth="1"
          strokeDasharray={ORBIT_RING_DASH}
          vectorEffect="non-scaling-stroke"
        />

        {Array.from({ length: ORBIT_SLOTS }, (_, i) => (
          <circle
            key={i}
            ref={(el) => {
              satRefs.current[i] = el;
            }}
            cx={ORBIT_VB / 2}
            cy={ORBIT_VB / 2}
            r={0}
            opacity={0}
            fill={`url(#${ORBIT_SAT_FILL})`}
            /* Fully opaque white, with the shine carried by two drop-shadows
               rather than a thicker stroke — a wider line would swallow the
               gaps in the dash and turn the outline back into a solid ring. */
            stroke="#FFFFFF"
            strokeWidth="1.15"
            strokeDasharray={ORBIT_SAT_DASH}
            vectorEffect="non-scaling-stroke"
            style={{
              filter:
                "drop-shadow(0 0 2.5px rgba(255,255,255,0.9)) drop-shadow(0 0 7px rgba(175,205,255,0.5))",
            }}
          />
        ))}

        <circle
          ref={coreRef}
          cx={ORBIT_VB / 2}
          cy={ORBIT_VB / 2}
          r={ORBIT_DOT_BASE / 2}
          fill="#FFFFFF"
          opacity={1}
        />
      </svg>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════
   2. MANDALA — three rings that breathe through each other
   ═════════════════════════════════════════════════════════ */
/**
 * Rebuilt from the reference GIF rather than by eye: the file was pulled down
 * and all 53 frames measured, so every number below comes from the source.
 *
 * THE RINGS SWAP — they do not bounce. This is the thing that is easy to get
 * wrong, because the radii alone cannot tell you which it is: both models
 * produce the identical sequence of radius values. The angular offsets settle
 * it. Each ring carries a fixed offset (they sit 40/3 deg apart, one third of
 * the 40 deg node pitch), and those offsets TRADE PLACES across a merge:
 *
 *     frame 44   measured        [24.27, 37.48, 11.14]
 *                if they bounced [37.49, 11.12, 24.35]
 *
 * — a cyclic rotation of the baseline, not a return to it. So every ring
 * travels outward, and the outermost comes back round as the new innermost.
 *
 * That makes the whole thing ONE closed radius path with three rings spaced a
 * third of a period apart, rather than three rings each with their own range.
 * Fitted against the measured frames, within 3.5% of the half-size:
 *
 *     r(p) = 0.5 + 0.25 * cos(2pi * (p - 0.56))     (as a fraction of half)
 *
 * The merges fall out of it for free: rings a third of a period apart cross
 * at exactly the 50/125/125 and 75/75/150 the GIF measures.
 *
 * ROTATION IS NOT SEPARATE. Each ring also advances 40 deg — exactly one node
 * pitch — per period, so after one period every ring has moved up a role AND
 * turned by one node, and the figure is pixel-identical. That is why the
 * source GIF can loop in a third of the true period.
 *
 * Node radius tracks its ring radius (measured 2.7 / 5.8 / 9.1px at radii
 * 56.7 / 100 / 143.3), so a node grows as it travels outward.
 */
const MANDALA_RINGS = 3;
const MANDALA_NODES = 9;
/**
 * Seconds for one full period — every ring back to where it began.
 *
 * The GIF measures 6.36s. Slowed here: the reference is a standalone loop you
 * look AT, this one sits beside body copy and has to be readable past. One
 * merge happens every PERIOD/3, so this is a merge every 3s.
 */
const MANDALA_PERIOD = 9;
/** Where in the period the rings are at their widest. */
const MANDALA_PEAK = 0.56;
/** Ring radius as a fraction of the half-size: mid, and swing either side. */
const MANDALA_MID = 0.5;
const MANDALA_SWING = 0.25;
/** Node radius as a fraction of its own ring radius. Below the reference's
 *  measured 0.06 — the dots read smaller and the glow below carries the
 *  weight the size used to. */
const MANDALA_NODE = 0.042;
/** Halo around each node, as a multiple of its own radius. */
const MANDALA_GLOW = 2.6;
const MANDALA_GLOW_COLOR = "rgba(186,214,255,0.95)";
/**
 * How much of the canvas the figure fills.
 *
 * The measured fractions above come straight from the GIF, where the rings
 * peak at 0.75 of the half-size — so with a node on top the drawing only ever
 * reached 79% of its box and sat in a pool of empty space. Scaling by one
 * factor keeps the reference's proportions exactly while taking it to 95%.
 */
const MANDALA_FIT =
  0.95 / ((MANDALA_MID + MANDALA_SWING) * (1 + MANDALA_NODE));

function Mandala() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = false;
    const start = performance.now();

    const size = () => {
      // Layout box, not getBoundingClientRect — the cell carries an entrance
      // scale, and the rect would bake it into the backing store.
      w = Math.max(1, wrap.offsetWidth);
      h = Math.max(1, wrap.offsetHeight);
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (!visible) return;
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const half = Math.min(w, h) / 2;
      // 0 at one end of the breathe, 1 at the other. Cosine, so it eases into
      // each merge instead of arriving at constant speed.
      /* Each ring is the SAME path, a third of a period apart. They are left
         in index order deliberately — see the edge note below for why sorting
         them by radius is exactly what must not happen. */
      const base = reduced ? 0.25 : t / MANDALA_PERIOD;
      const rings = Array.from({ length: MANDALA_RINGS }, (_, k) => {
        /* PHASE IS NOT WRAPPED, and that matters more than it looks.
           It used to be `(base + k/RINGS) % 1`. The radius did not care —
           cosine is periodic, so it came out the same either way — but the
           offset below is LINEAR in the phase, so every time the phase rolled
           over 1 the ring's nodes jumped back a full node pitch, 40 degrees,
           in a single frame. Once per period, per ring: a snap every three
           seconds.

           The dots got away with it, because rotating nine evenly spaced nodes
           by exactly one pitch maps the set onto itself and nothing appears to
           move. THE EDGES DID NOT. They are wired by node identity, so node i
           of one ring suddenly sat where node i-1 had been and every line
           touching that ring re-drew somewhere else. That was the abrupt
           re-wiring, and it is why it looked tied to the loop.

           Measured across a full cycle at 60fps, worst single-frame node
           movement: 18.31 units wrapped against 0.30 unwrapped, on a typical
           0.20 per frame. */
        const phase = base + k / MANDALA_RINGS;
        const frac =
          MANDALA_MID +
          MANDALA_SWING * Math.cos(2 * Math.PI * (phase - MANDALA_PEAK));
        const radius = frac * MANDALA_FIT * half;
        /* One node pitch per period. This is the entire rotation — there is no
           separate spin — and it is what makes the period seamless: a ring
           that has moved up a role has also turned by exactly one node. */
        const offset = (phase * (2 * Math.PI)) / MANDALA_NODES;
        return {
          radius,
          dot: radius * MANDALA_NODE,
          pts: Array.from({ length: MANDALA_NODES }, (_, i) => {
            const a = offset + (i / MANDALA_NODES) * Math.PI * 2;
            return { x: cx + Math.cos(a) * radius, y: cy + Math.sin(a) * radius };
          }),
        };
      });

      /* EDGES — wired by ring IDENTITY, never by current radius order.
         This is what stops them flickering. The rings genuinely change places,
         so "the ring outside this one" is a different ring before and after
         every merge; connecting on that basis makes the whole spoke set jump
         to different nodes the instant two rings cross. Joining every ring to
         every other one is immune to it — the pairs are the same pairs no
         matter who is currently where, so the lines only ever move as fast as
         the nodes do.

         Drawn before the nodes so the dots sit on top, and all in one path:
         one stroke of a hundred-odd hairlines is far cheaper than a hundred
         strokes, and it lets overlaps build brightness the way the reference
         does. */
      /* TWO PASSES, because the two kinds of edge no longer share a tone.
         The polygon each ring closes on itself is the shape you actually read
         — it is what draws the figure at the centre — so it is stroked white.
         The spokes fanning between rings are the web behind it and stay faint;
         at one tone the shape was lost in its own scaffolding.

         Each pass is still a SINGLE path: one stroke of fifty-odd hairlines is
         far cheaper than fifty strokes, and it keeps the overlap brightness
         that gives the figure its density. */
      ctx.lineWidth = 1;

      // Behind: the ring-to-ring spokes, two per node, which fan the star.
      ctx.strokeStyle = MANDALA_EDGE;
      ctx.beginPath();
      rings.forEach((ring, a) => {
        for (let b = a + 1; b < rings.length; b++) {
          const other = rings[b];
          ring.pts.forEach((p, i) => {
            for (const step of [0, 1]) {
              const q = other.pts[(i + step) % MANDALA_NODES];
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(q.x, q.y);
            }
          });
        }
      });
      ctx.stroke();

      /* In front: each ring's own polygon, plus a skip-one chord for density.
         BRIGHTNESS FALLS OFF WITH RADIUS — the innermost polygon is white, the
         outermost fades back into the web. Stroking only "the inner ring" as a
         hard choice is what NOT to do here: the rings genuinely swap places, and
         at the moment two cross they carry different node offsets, so handing
         the highlight over would snap the lit polygon round by 13 degrees. A
         continuous ramp has no handover to snap — a ring simply brightens as it
         travels inward, which is also what the reference does. */
      const rMin = (MANDALA_MID - MANDALA_SWING) * MANDALA_FIT * half;
      const rMax = (MANDALA_MID + MANDALA_SWING) * MANDALA_FIT * half;
      rings.forEach((ring) => {
        const u = Math.min(1, Math.max(0, (ring.radius - rMin) / (rMax - rMin)));
        ctx.strokeStyle = `rgba(255,255,255,${(
          MANDALA_EDGE_IN + (MANDALA_EDGE_OUT - MANDALA_EDGE_IN) * u
        ).toFixed(3)})`;
        ctx.beginPath();
        ring.pts.forEach((p, i) => {
          for (const step of [1, 2]) {
            const q = ring.pts[(i + step) % MANDALA_NODES];
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
          }
        });
        ctx.stroke();
      });

      /* Nodes, each carrying a halo. The shadow is set per RING rather than
         per node, because the blur scales with the ring's own dot size — an
         outer node is larger and glows wider, the same way its dot grows.

         Reset to 0 afterwards: shadowBlur is context state, and left on it
         would put a halo behind next frame's edges too, which turns the
         hairlines into a fog. */
      ctx.fillStyle = MANDALA_NODE_FILL;
      ctx.shadowColor = MANDALA_GLOW_COLOR;
      rings.forEach((ring) => {
        ctx.shadowBlur = ring.dot * MANDALA_GLOW;
        ring.pts.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, ring.dot, 0, Math.PI * 2);
          ctx.fill();
        });
      });
      ctx.shadowBlur = 0;
    };

    size();
    raf = requestAnimationFrame(draw);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.15 }
    );
    io.observe(wrap);
    const ro = new ResizeObserver(size);
    ro.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      /* Larger than the orbit's VISUAL_SIZE: this figure is a ring of rings
         rather than a single circle, so at 440px its detail closed up. Capped
         at 100% of the cell, and centred in it by the flex wrapper. */
      className="relative w-full"
      style={{ maxWidth: MANDALA_SIZE, aspectRatio: "1" }}
      aria-hidden
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}

/* ═════════════════════════════════════════════════════════
   3. SPIDER WEB
   ═════════════════════════════════════════════════════════ */
/**
 * The field is WIDER THAN IT IS TALL, matching the copy column beside it, so
 * the viewBox has to widen too. A square `0 0 100 100` viewBox in a landscape
 * box letterboxes: `preserveAspectRatio` defaults to "meet", which would leave
 * the dots huddled in a square in the middle with empty gutters either side.
 * Stretching instead (`none`) would squash the dots into ovals. Widening the
 * viewBox is the only option that keeps circles round AND fills the box.
 */
const WEB_VB_W = 168;
const WEB_VB_H = 100;

/* ── THE LATTICE ──
   A STRAIGHT SQUARE GRID, not a scatter. Everything below is measured off the
   reference clip (720x1280, 30fps): its dots sit on a lattice with a spacing
   of exactly 70px against a 720px frame — 0.097 of the width — which is the
   GRID_STEP here, and gives eleven columns across our wider box.

   The grid is centred rather than run to the edges, so the margin is even on
   all four sides instead of leaving a wide gutter on the short axis. */
const GRID_STEP = 16;
const GRID_COLS = 11;
const GRID_ROWS = 7;
const WEB_FIELD: [number, number][] = (() => {
  const x0 = (WEB_VB_W - (GRID_COLS - 1) * GRID_STEP) / 2;
  const y0 = (WEB_VB_H - (GRID_ROWS - 1) * GRID_STEP) / 2;
  const pts: [number, number][] = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      pts.push([x0 + c * GRID_STEP, y0 + r * GRID_STEP]);
    }
  }
  return pts;
})();

/** How many threads the spider holds at once — sixteen, as in the reference. */
const SPIDER_LEGS = 16;
/** Far enough to reach the ring of dots two steps out, which is where the
 *  reference's threads end. Below ~2.25 steps the outer legs find nothing. */
const SPIDER_REACH = GRID_STEP * 2.5;

/* ── THE POOL OF LIGHT ──
   Wherever the body is, the dots around it are BIGGER and BRIGHTER, tapering
   back down further out. Measured from the reference, dot diameter against
   distance from the hub in grid steps:

       0.5    1.0    1.5    2.0    2.5    3.0    3.5    4.5    5.0
      15px   14px   12.8   9.3    7.2    5.3    3.3    1.4    ~0

   which is a smoothstep from 0.107 of a step down to nothing at five steps —
   fitted and confirmed against the measurements at 0.2/0.4/0.6/0.7 of the
   reach. The floor is not quite zero here: the reference is a black frame
   where dots may vanish, whereas this sits in a section that should still
   read as a grid outside the pool. */
const POOL_REACH = GRID_STEP * 5;
const DOT_R = 0.28;
const DOT_R_NEAR = GRID_STEP * 0.09;
const DOT_O = 0.3;
const DOT_O_NEAR = 1;
/** The body, the largest dot in the field. Measured at 0.21 of a step across;
 *  a shade above DOT_R_NEAR so it still leads its own neighbours. */
const SPIDER_BODY_R = GRID_STEP * 0.115;
/* ── HOW THE BODY MOVES ──
   A spring rather than a per-frame fraction, stepped by real elapsed time so
   the crawl runs at one speed on any refresh rate. Tuned by simulation: it
   covers a jump in about half a second and overshoots by ~3.6% before
   settling — enough lag to read as something crawling after the pointer, and
   enough overshoot to look alive rather than dragged along on a string. */
const SPIDER_STIFFNESS = 36;
const SPIDER_DAMPING = 0.7;

/**
 * A spider crossing a grid of dots, spinning a thread to each of the nearest
 * sixteen. It follows the pointer, and wanders on its own when there is none,
 * so the visual is alive before it is touched.
 *
 * IT MOVES CONTINUOUSLY. The reference clip's hub is on an exact lattice
 * intersection in every single frame — sampled one by one it reads
 * grid(3.00,3.00), grid(4.00,4.00), grid(5.99,2.00), never in between — so an
 * earlier build snapped the body to the nearest node to reproduce that hop.
 * It was wrong here: a clip can hop because nothing is driving it, but under a
 * live pointer the same rule reads as the body teleporting to the cursor, and
 * the threads jump between dots instead of sweeping across them. The grid is
 * carried by the dots; the body is left free.
 *
 * THE LEGS ARE RE-CHOSEN EVERY FRAME. They are not fixed spokes: as the body
 * moves, whichever dots are now nearest take the threads and the previous ones
 * are released. That re-attachment is the whole effect, which is why the
 * threads fade in and out at the edge of their reach rather than blinking.
 *
 * Driven through refs on an rAF loop, not React state — the body moves every
 * frame and every dot is re-lit with it, which is far too much to re-render.
 */

function SpiderWeb() {
  const svgRef = useRef<SVGSVGElement>(null);
  const bodyRef = useRef<SVGCircleElement>(null);
  const legRefs = useRef<(SVGLineElement | null)[]>([]);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);
  const pointer = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let bx = WEB_VB_W / 2;
    let by = WEB_VB_H / 2;
    /* Velocity, so the body has weight: it accelerates toward the target and
       overshoots slightly rather than easing straight onto it. */
    let vx = 0;
    let vy = 0;
    let raf = 0;
    let last = performance.now();
    const start = last;

    /* The CSS pause rule cannot reach an rAF loop, so this one gates itself on
       the same observer: off screen, the frame is still requested but does no
       work. Crawling a spider nobody can see is pure battery. */
    let visible = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.15 }
    );
    io.observe(svg);

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const t = (now - start) / 1000;
      /* Seconds since the last frame, capped so a background tab that stalls
         for a second does not resume by flinging the body across the grid. */
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      /* Target: the pointer, or a slow wander when it is away. The two curves
         have different periods so the path never repeats tightly. */
      const p = pointer.current;
      const tx = p ? p.x : WEB_VB_W / 2 + Math.sin(t * 0.31) * (WEB_VB_W * 0.32);
      const ty = p ? p.y : WEB_VB_H / 2 + Math.sin(t * 0.23 + 1.1) * 26;

      if (reduced) {
        bx = tx;
        by = ty;
      } else {
        /* A CRITICALLY-DAMPED SPRING, stepped by real elapsed time.
           The old `b += (target - b) * k` was a fixed fraction PER FRAME, so
           the crawl ran at double speed on a 120Hz screen and stuttered
           whenever a frame was long. Working from `dt` makes the speed the
           same everywhere, and carrying velocity gives the body the weight
           that makes it read as crawling rather than sliding. */
        const k = SPIDER_STIFFNESS;
        const c = 2 * Math.sqrt(k) * SPIDER_DAMPING;
        vx += (-k * (bx - tx) - c * vx) * dt;
        vy += (-k * (by - ty) - c * vy) * dt;
        bx += vx * dt;
        by += vy * dt;
      }

      /* The body draws WHERE IT IS. An earlier build snapped it to the nearest
         lattice node, which is what the reference clip does — its hub is on an
         exact intersection in every frame. Under a live pointer that reads as
         teleporting, and the threads jump rather than sweep, so the snap is
         gone and the grid is left to the dots. */
      const sx = bx;
      const sy = by;

      const body = bodyRef.current;
      if (body) {
        body.setAttribute("cx", sx.toFixed(2));
        body.setAttribute("cy", sy.toFixed(2));
      }

      /* Re-light every dot from its distance to the body — bigger AND brighter
         near it, tapering back down further out. Smoothstep rather than a
         straight ramp: a linear taper leaves a visible edge where it lands on
         the resting size. */
      const distances = WEB_FIELD.map(([x, y]) => Math.hypot(x - sx, y - sy));
      for (let i = 0; i < WEB_FIELD.length; i++) {
        const dot = dotRefs.current[i];
        if (!dot) continue;
        const t = 1 - Math.min(1, distances[i] / POOL_REACH); // 1 at the body
        const pool = t * t * (3 - 2 * t);
        dot.setAttribute("r", (DOT_R + (DOT_R_NEAR - DOT_R) * pool).toFixed(2));
        dot.setAttribute(
          "fill-opacity",
          (DOT_O + (DOT_O_NEAR - DOT_O) * pool).toFixed(3)
        );
      }

      // Nearest dots win the threads, recomputed from scratch each frame.
      const near = WEB_FIELD.map(([x, y], i) => ({ x, y, d: distances[i] }))
        .sort((a, b) => a.d - b.d)
        .slice(0, SPIDER_LEGS);

      for (let i = 0; i < SPIDER_LEGS; i++) {
        const line = legRefs.current[i];
        if (!line) continue;
        const n = near[i];
        if (!n || n.d > SPIDER_REACH) {
          line.setAttribute("opacity", "0");
          continue;
        }
        line.setAttribute("x1", sx.toFixed(2));
        line.setAttribute("y1", sy.toFixed(2));
        line.setAttribute("x2", n.x.toFixed(2));
        line.setAttribute("y2", n.y.toFixed(2));
        /* Even across the fan, as in the reference, but fading to nothing over
           the last quarter of the reach. That taper is what makes a thread
           read as being let go and a new one spun, rather than lines blinking
           on and off at a hard boundary as the nearest set changes. */
        const u = n.d / SPIDER_REACH;
        const rim = Math.max(0, Math.min(1, (1 - u) / 0.25));
        line.setAttribute(
          "opacity",
          ((0.85 - 0.25 * u) * rim * rim * (3 - 2 * rim)).toFixed(3)
        );
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <div
      /* Full column width, matching the copy in the other half. */
      className="relative w-full"
      style={{ aspectRatio: String(WEB_VB_W / WEB_VB_H) }}
      aria-hidden
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WEB_VB_W} ${WEB_VB_H}`}
        className="h-full w-full"
        style={{ overflow: "visible" }}
        onPointerMove={(e) => {
          const b = svgRef.current?.getBoundingClientRect();
          if (!b) return;
          pointer.current = {
            x: ((e.clientX - b.left) / b.width) * WEB_VB_W,
            y: ((e.clientY - b.top) / b.height) * WEB_VB_H,
          };
        }}
        onPointerLeave={() => {
          pointer.current = null;
        }}
      >
        {/* The lattice. Positions are set once and never change — the loop
            re-lights each dot's size and opacity as the body passes.

            WHITE, with the opacity carrying the brightness, so a dot inside
            the pool is a clean bright white rather than a tinted grey. */}
        {WEB_FIELD.map(([x, y], i) => (
          <circle
            key={i}
            ref={(el) => {
              dotRefs.current[i] = el;
            }}
            cx={x}
            cy={y}
            r={DOT_R}
            fill="#FFFFFF"
            fillOpacity={DOT_O}
          />
        ))}

        {/* Threads. Positioned entirely by the loop. */}
        {Array.from({ length: SPIDER_LEGS }, (_, i) => (
          <line
            key={i}
            ref={(el) => {
              legRefs.current[i] = el;
            }}
            stroke={SPIDER_THREAD}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            opacity="0"
          />
        ))}

        {/* The body — a DOT, and the largest one on the grid, so it reads as
            the centre the threads are spun from. */}
        <circle
          ref={bodyRef}
          r={SPIDER_BODY_R}
          cx={WEB_VB_W / 2}
          cy={WEB_VB_H / 2}
          fill={SPIDER_BODY}
          style={{ filter: "drop-shadow(0 0 5px rgba(190,215,255,0.8))" }}
        />
      </svg>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════
   4. "TC" MONOGRAM — a letter cloud that turns, then settles
   ═════════════════════════════════════════════════════════ */
/**
 * WHY THIS ONE IS A CANVAS AND THE OTHER THREE ARE NOT.
 *
 * The brief is thousands of letters flying in and settling into the wordmark.
 * At that count the DOM stops being an option: ~2,000 absolutely-positioned
 * elements, each with its own transform, is thousands of layout boxes and
 * composited layers to update every frame. One canvas is a single element and
 * one draw call per particle, and it does not touch layout at all.
 *
 * The letters are pre-rendered ONCE into small sprite canvases, one per
 * distinct character, and then blitted with drawImage. Calling fillText per
 * particle per frame would re-shape and re-rasterise the glyph 2,000 times a
 * frame, which is the difference between this running at 60fps and not.
 *
 * TARGETS COME FROM THE SHAPE ITSELF. "TC" is drawn to an offscreen canvas and
 * its pixels sampled on a grid; every opaque pixel becomes a home for one
 * particle. So the wordmark is never hard-coded as coordinates — change the
 * text or the font and the target cloud follows.
 */
/**
 * THE POOL OF LETTERS the particles carry — a BAG, not a sequence.
 *
 * Only the distinct characters matter: the wordmark's own strokes spell
 * themselves from TC_LETTERS below, and the faint bands above and below draw
 * from this at random. The word is written out rather than listed as unique
 * letters so it stays obvious where the set comes from.
 */
const MONO_ALPHABET = "TITANCAPITAL";
/**
 * THE WORDMARK — every letter authored in place, not derived.
 *
 * IT USED TO BE A 0/1 MASK, with each cell's letter coming from its position
 * on the lattice (`(row + col) % 12`). That made every row and column of the
 * field read TITANCAPITAL, but it also meant the mark's own strokes took
 * whatever letters the lattice happened to hand them — the T's bar and the C's
 * arc spelled nothing. Reading along a stroke is the whole point of the mark,
 * and a positional rule cannot do it: a stroke turns a corner, and the rule
 * only knows about rows and columns.
 *
 * So the strokes are spelled out here, one character per cell, space for empty:
 *
 *   T   bar  TITANATIT across the top, stem CAPITAL + a closing T down the
 *            middle — that extra T is what lengthens the stem so the mark is
 *            not top-heavy
 *   C   arc  NATIT along the top, CAPITAL down the left, TITAN along the
 *            bottom on its own row
 *
 * THE TWO ARE THE SAME HEIGHT — nine rows each, top and bottom aligned. The C
 * gets there by giving its bottom bar a row of its own rather than hanging it
 * off the L, so its column still spells the whole of CAPITAL and the letter
 * stands as tall as the T beside it.
 *
 * Editing this array is how you change the mark: it re-centres itself and the
 * particle count follows.
 */
const TC_LETTERS = [
  "TITANATIT" + "  " + " NATIT",
  "    C    " + "  " + "C     ",
  "    A    " + "  " + "A     ",
  "    P    " + "  " + "P     ",
  "    I    " + "  " + "I     ",
  "    T    " + "  " + "T     ",
  "    A    " + "  " + "A     ",
  "    L    " + "  " + "L     ",
  "    T    " + "  " + " TITAN",
];
/** Columns in the field. Wider than the wordmark, so the bands run past it. */
const MONO_FIELD_COLS = 24;
/** Full-width rows of dimmer letters above and below the wordmark. */
const MONO_BANDS = 2;
/** Letter size as a share of the cell pitch. Below ~0.4 the grid reads empty. */
const MONO_GLYPH_RATIO = 0.52;
/** Opacity of a band letter against a wordmark letter. */
const MONO_DIM = 0.4;
/** Hard cap, so a very large viewport cannot melt a laptop. */
const MONO_MAX = 2600;
/** Seconds for ONE full revolution of the letter cloud, before it scrambles. */
const MONO_SPIN = 3.6;
/** Seconds for the scramble into the wordmark. */
const MONO_FLIGHT = 2.4;
/** Camera distance for the 3D projection. Smaller = more dramatic depth. */
const MONO_FOCAL = 620;
/** Pointer influence radius and peak push, in CSS px. */
const MONO_REACH = 120;
const MONO_PUSH = 34;

type Particle = {
  /** where it settles — sampled from the wordmark */
  hx: number;
  hy: number;
  /** its seat in the rotating cloud, as a real 3D point */
  ax: number;
  ay: number;
  az: number;
  /** sprite index, and its own stagger into the scramble */
  ch: number;
  delay: number;
  /** true for the band letters, which sit back from the wordmark */
  dim: boolean;
  /** idle drift, once home */
  px: number;
  py: number;
  ps: number;
};

/** Symmetric, for the scramble: it should leave the spin gently and arrive
 *  gently, where an ease-out would snap away from the cloud. */
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function Monogram() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /** Pointer in CSS px relative to the canvas; null when it is away. */
  const pointer = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let particles: Particle[] = [];
    let sprites: HTMLCanvasElement[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let startedAt: number | null = null;

    /* "TITANCAPITAL" repeats letters, so sprites are built for the DISTINCT
       characters and this maps each position in the string to its sprite —
       the sequence is preserved without rendering "T" three times. */
    const MONO_CHARS = [...new Set(MONO_ALPHABET.split(""))];

    /** One small canvas per distinct character, rendered once. */
    const buildSprites = (size: number) => {
      const chars = MONO_CHARS;
      return chars.map((ch) => {
        const c = document.createElement("canvas");
        const dpr = window.devicePixelRatio || 1;
        c.width = Math.ceil(size * dpr);
        c.height = Math.ceil(size * dpr);
        const cx = c.getContext("2d");
        if (cx) {
          cx.scale(dpr, dpr);
          cx.font = `600 ${size * 0.9}px Poppins, sans-serif`;
          cx.textAlign = "center";
          cx.textBaseline = "middle";
          cx.fillStyle = "rgba(214,232,255,0.92)";
          cx.fillText(ch, size / 2, size / 2);
        }
        return c;
      });
    };

    /** Sample the wordmark and hand every opaque pixel to a particle. */
    const build = () => {
      /* offsetWidth/Height, NOT getBoundingClientRect. The rect includes every
         ancestor transform, and this canvas sits inside a cell that animates
         `scale: 0.9 -> 1` on entrance and `1 -> 1.06` on hover. Sizing off the
         rect captures whatever scale happened to be mid-flight — measured 259px
         against a real 440px box — and the backing store is then stretched by
         CSS to fill it: a blurry wordmark, and particle coordinates that do not
         match the pixels they were sampled from. offsetWidth is the layout box
         and is immune to all of it. */
      w = Math.max(1, wrap.offsetWidth);
      h = Math.max(1, wrap.offsetHeight);
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      /* ONE GRID FOR EVERYTHING — and the glyph is AUTHORED on it, not
         sampled from a font.

         Sampling cannot produce this picture. The reference is a monoline
         letterform exactly one cell thick, but a filled typeface has strokes
         many cells wide at any size that fits: a coarse grid catches almost
         nothing (measured: 3 lit cells at a 26px pitch), and a grid fine
         enough to trace the shape turns back into a dense slab. Stroking the
         text does not help either — it outlines the letters, so "T" comes back
         as two parallel lines rather than a stem.

         So the cell pitch is derived from the BOX, and the wordmark and its
         bands are laid straight onto that grid. Everything lines up in rows
         and columns by construction. */
      const cols = MONO_FIELD_COLS;
      const rows = TC_LETTERS.length + MONO_BANDS * 2;
      // Whichever axis runs out first decides the pitch, so it always fits.
      const pitch = Math.min((w * 0.98) / cols, (h * 0.94) / rows);
      const originX = (w - cols * pitch) / 2 + pitch / 2;
      const originY = (h - rows * pitch) / 2 + pitch / 2;
      // The wordmark is narrower than the field, so centre it in the columns.
      const glyphCol = Math.round((cols - TC_LETTERS[0].length) / 2);

      const homes: { x: number; y: number; ch: number; dim?: boolean }[] = [];

      /* THE WORDMARK, inset by the top band. Each cell carries the letter
         written for it in TC_LETTERS, so a stroke spells what it is meant to
         spell wherever it turns. */
      TC_LETTERS.forEach((row, r) => {
        row.split("").forEach((ch, c) => {
          if (ch === " ") return;
          homes.push({
            x: originX + (glyphCol + c) * pitch,
            y: originY + (MONO_BANDS + r) * pitch,
            ch: MONO_CHARS.indexOf(ch),
          });
        });
      });

      /* THE BANDS. Full-width rows of dimmer letters above and below, on the
         same pitch and columns — what stops the wordmark reading as an object
         floating in empty space.

         THE BAND LETTERS ARE RANDOM, drawn one at a time from the same pool
         the wordmark uses. They used to walk the word in order, so every band
         row spelled TITANCAPITAL over and over from the left — a readable
         ticker of text running above and below the mark, competing with it.
         The mark is the thing that spells something here; the bands are
         texture, and texture should not read as words. */
      for (let b = 0; b < MONO_BANDS; b++) {
        for (const r of [b, MONO_BANDS + TC_LETTERS.length + b]) {
          for (let c = 0; c < cols; c++) {
            homes.push({
              x: originX + c * pitch,
              y: originY + r * pitch,
              ch: Math.floor(Math.random() * MONO_CHARS.length),
              dim: true,
            });
          }
        }
      }

      // Thin evenly rather than truncating, so the cap never lops off one side.
      const keep = Math.min(MONO_MAX, homes.length);
      const stride = homes.length / keep;

      const glyph = Math.max(9, pitch * MONO_GLYPH_RATIO);
      sprites = buildSprites(glyph);

      /* Each particle gets a seat in a 3D SHELL — a sphere, thickened a little
         so the cloud has body rather than reading as a hollow outline. Seats
         are spread with the golden-angle spiral, which distributes points over
         a sphere far more evenly than picking two random angles (that bunches
         them at the poles). */
      const radius = Math.min(w, h) * 0.62;
      particles = Array.from({ length: keep }, (_, i) => {
        const home = homes[Math.floor(i * stride)];
        const k = i + 0.5;
        const phi = Math.acos(1 - (2 * k) / keep);
        const theta = Math.PI * (1 + Math.sqrt(5)) * k;
        const r = radius * (0.78 + Math.random() * 0.34);
        return {
          hx: home.x,
          hy: home.y,
          ax: r * Math.sin(phi) * Math.cos(theta),
          ay: r * Math.sin(phi) * Math.sin(theta) * 0.72,
          az: r * Math.cos(phi),
          // Set by the cell it lands in — see `letterAt`.
          ch: home.ch,
          delay: Math.random() * 0.5,
          dim: !!home.dim,
          px: Math.random() * Math.PI * 2,
          py: Math.random() * Math.PI * 2,
          ps: 0.5 + Math.random() * 0.8,
        };
      });
    };

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (startedAt === null) return;
      const t = (now - startedAt) / 1000;
      ctx.clearRect(0, 0, w, h);

      const ptr = pointer.current;
      const glyph = sprites[0] ? sprites[0].width : 0;
      const dpr = window.devicePixelRatio || 1;
      const cx = w / 2;
      const cy = h / 2;

      /* PHASE 1 — ONE REVOLUTION. The whole cloud turns about its Y axis, and
         `Math.min` is what stops it dead at exactly 360°: past MONO_SPIN the
         angle is pinned at 2π rather than continuing, so the spin is one round
         and not an endless carousel. */
      const spun = reduced ? 1 : Math.min(1, t / MONO_SPIN);
      const theta = spun * Math.PI * 2;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);

      for (const p of particles) {
        // Rotate the seat about Y, then project it with perspective.
        const rx = p.ax * cosT + p.az * sinT;
        const rz = -p.ax * sinT + p.az * cosT;
        const persp = MONO_FOCAL / (MONO_FOCAL + rz);
        const cloudX = cx + rx * persp;
        const cloudY = cy + p.ay * persp;

        /* PHASE 2 — THE SCRAMBLE, which cannot begin before the revolution is
           finished; each particle then leaves on its own delay so the cloud
           unravels into the wordmark rather than snapping to it. */
        const flight = reduced
          ? 1
          : Math.min(1, Math.max(0, (t - MONO_SPIN - p.delay) / MONO_FLIGHT));
        const e = easeInOut(flight);

        let x = cloudX + (p.hx - cloudX) * e;
        let y = cloudY + (p.hy - cloudY) * e;

        // IDLE: a small wander once home, so the wordmark breathes.
        if (e >= 1 && !reduced) {
          x += Math.sin(t * p.ps + p.px) * 1.4;
          y += Math.cos(t * p.ps + p.py) * 1.4;
        }

        // POINTER: push away, falling off with the square of distance.
        if (ptr) {
          const dx = x - ptr.x;
          const dy = y - ptr.y;
          const dist = Math.hypot(dx, dy);
          if (dist < MONO_REACH && dist > 0.01) {
            const f = (1 - dist / MONO_REACH) ** 2 * MONO_PUSH;
            x += (dx / dist) * f;
            y += (dy / dist) * f;
          }
        }

        const sprite = sprites[p.ch];
        if (!sprite) continue;

        /* Depth reads through SIZE and BRIGHTNESS while the cloud turns — a
           letter at the back is smaller and dimmer — and both lerp back to
           flat as it lands, so the finished wordmark is evenly lit. */
        const depth = 1 + (persp - 1) * (1 - e);
        const size = (glyph / dpr) * depth;
        /* Band letters only fall back as they LAND. Through the revolution
           every letter is equal — the bands are a property of the finished
           picture, not of the cloud. */
        const settled = p.dim ? 1 - (1 - MONO_DIM) * e : 1;
        ctx.globalAlpha = (Math.min(1, 0.35 + 0.65 * depth) * (1 - e) + e) * settled;
        ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
    };

    build();
    raf = requestAnimationFrame(draw);

    // Hold the flight until the section is actually looked at.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((en) => en.isIntersecting) && startedAt === null) {
          startedAt = performance.now();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(wrap);

    const ro = new ResizeObserver(() => {
      const was = startedAt;
      build();
      // Keep the cloud settled if it already landed, rather than replaying.
      startedAt = was;
    });
    ro.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return (
    <motion.div
      ref={wrapRef}
      className="relative w-full"
      /* FULL COLUMN WIDTH — the same width as the copy in the other half, not
         the square VISUAL_SIZE the two circular diagrams use. This is a
         wordmark in a landscape field: it needs the room to spread, and the
         letters do their 3D revolution across this whole width before they
         scramble into the mark. */
      /* 1.5, so the grid is WIDTH-bound. The cell pitch is the smaller of
         (width / columns) and (height / rows); at 1.75 the box was short
         enough that rows won, which capped the pitch and left the wordmark
         small inside a wide frame. At 1.5 the two limits land within a pixel
         of each other, so the mark grows into the width it was given. */
      style={{ aspectRatio: "1.5" }}
      onPointerMove={(e) => {
        const el = wrapRef.current;
        if (!el) return;
        const b = el.getBoundingClientRect();
        /* Normalised through the rect, then scaled back up by the LAYOUT size:
           the particles live in unscaled canvas pixels, but the rect is the
           scaled on-screen box, so subtracting the offset alone would be off by
           the hover scale. */
        pointer.current = {
          x: ((e.clientX - b.left) / b.width) * el.offsetWidth,
          y: ((e.clientY - b.top) / b.height) * el.offsetHeight,
        };
      }}
      onPointerLeave={() => {
        pointer.current = null;
      }}
      whileHover={{ scale: 1.06 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </motion.div>
  );
}

/* ═════════════════════════════════════════════════════════
   THE GATE
   ═════════════════════════════════════════════════════════ */
/**
 * Holds a visual still until the reader reaches it.
 *
 * `once: false` on purpose — the wrapper keeps reporting, so a visual scrolled
 * away is paused again rather than left running off-screen. Combined with
 * `animation-play-state` (see the rule in VISUAL_KEYFRAMES) that means coming
 * back to a part resumes it mid-cycle instead of restarting it, which is what
 * a looping ambient graphic should do.
 *
 * The threshold is low: these are tall graphics, and waiting for 35% of a
 * 440px diagram means the top third has already been on screen for a while
 * doing nothing.
 */
function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, active };
}

export default function PartVisual({ kind }: { kind: VisualKind }) {
  const { ref, active } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      data-eco-visual={active ? "live" : "idle"}
      /* `w-full` is load-bearing. This wrapper is itself a flex ITEM, so
         without it the browser shrinks it to an intrinsic width — and the
         monogram inside sizes itself with `min(100%, …)`, which then has no
         real basis to resolve against and collapsed the whole visual to 300px
         inside a 720px column. */
      className="flex w-full items-center justify-center"
    >
      {kind === "mandala" ? (
        <Mandala />
      ) : kind === "web" ? (
        <SpiderWeb />
      ) : kind === "monogram" ? (
        <Monogram />
      ) : (
        <Orbit />
      )}
    </div>
  );
}
