"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from "framer-motion";

/* ─────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────── */
export interface Belief {
  title: string;
  description: string;
}

export interface WhatWeBelieveData {
  heading?: string;
  beliefs?: Belief[];
}

const HEADING = "What We Believe";
const BELIEFS: Belief[] = [
  {
    title: "Founder-Centricity",
    description:
      "We back individuals ahead of market cycles. Exceptional founders possess the resilience to iterate and the vision to define new categories; our conviction is anchored in the person, remaining constant as the business model evolves.",
  },
  {
    title: "Conviction Over Consensus",
    description:
      "We forgo herd mentality. By identifying asymmetric potential before it is market-validated, we prioritize independent, contrarian analysis over industry consensus.",
  },
  {
    title: "Commitment to Endurance",
    description:
      "Partnership transcends the initial capital injection. We remain deeply engaged through talent acquisition, iterative pivots, and subsequent funding, providing support in the decisive moments that define long-term success.",
  },
];

const IMAGE_SRC = "/images/what-we-believe/crowd.png";

/* ─────────────────────────────────────────────────────────
   Card design tokens — EXACT Figma spec @ 1728×1117 MacBook 14"
   reference, expressed as min(Xvw, Yvh) so they scale
   proportionally across every viewport in public/multiview.html:
     card    428 × 682, radius 12, gap 42
     title   40 / 500 / 150% / #000, width 368
     desc    28 / 400 / 140% / #323232, width 355
   ───────────────────────────────────────────────────────── */
const SZ = {
  headingFs: "min(3.70vw, 5.73vh)",     // 64 px @ ref
  titleFs: "min(2.31vw, 3.58vh)",       // 40 px
  titleW: "min(21.30vw, 32.95vh)",      // 368 px
  descFs: "min(1.62vw, 2.51vh)",        // 28 px
  descW: "min(20.54vw, 31.78vh)",       // 355 px
  titleToDesc: "min(1.16vw, 1.79vh)",   // 20 px
  cardPadX: "min(1.74vw, 2.69vh)",      // 30 px  (428 − 368 = 60 → 30 each side)
  cardPadY: "min(2.31vw, 3.58vh)",      // 40 px
};

/* Spring — a touch snappier than before so the whole thing
   feels faster while staying buttery-smooth. */
const SPRING = { stiffness: 100, damping: 30, mass: 0.7 };

/* ─────────────────────────────────────────────────────────
   Viewport-derived px dimensions. Card size mirrors the SZ
   min(vw,vh) formula so the rendered card and the scale math
   below stay in exact agreement (no full-bleed sliver).
   ───────────────────────────────────────────────────────── */
function computeDims() {
  if (typeof window === "undefined") {
    // SSR fallback ≈ reference viewport.
    const cardW = 428, cardH = 682, gap = 42;
    const groupW = 3 * cardW + 2 * gap;
    return { winW: 1728, cardW, cardH, gap, groupW, sFull: 1728 / groupW };
  }
  const winW = window.innerWidth;
  const winH = window.innerHeight;

  const cardW = Math.min(0.24769 * winW, 0.38317 * winH); // 428 @ ref
  const cardH = Math.min(0.39468 * winW, 0.61055 * winH); // 682 @ ref
  const gap = Math.min(0.02431 * winW, 0.0376 * winH);    // 42 @ ref
  const groupW = 3 * cardW + 2 * gap;

  /* Scale that makes the 3 touching cards span the FULL width —
     the "one photo" start state. */
  const sFull = winW / groupW;

  return { winW, cardW, cardH, gap, groupW, sFull };
}

/* ─────────────────────────────────────────────────────────
   Animation — TRANSFORM-ONLY so text never reflows and the
   card:text ratio is constant throughout:

   Phase 1 (0.00 → 0.45) SHRINK
     One seamless photo (3 touching slices) scales down from
     full width to 50%. No split, no flip — reads as a single
     image getting smaller.

   Phase 2 (0.45 → 0.70) SPLIT + FLIP + GROW  (all at the end)
     Side cards translate apart (opening the 42 px gaps),
     every card flips rotateY 0→180 to reveal its text face,
     and the group scales from 50% up to its final size.
     Because growth is a `scale` transform, the text scales as
     one unit — no re-wrapping, ratio preserved.

   Phase 3 (0.70 → 1.0) HOLD
     Cards rest, centered, aligned to the site gutter.
   ───────────────────────────────────────────────────────── */
export default function WhatWeBelieveClient({
  data,
}: {
  data?: WhatWeBelieveData | null;
}) {
  const heading = data?.heading || HEADING;
  const beliefs =
    data?.beliefs && data.beliefs.length === 3 ? data.beliefs : BELIEFS;

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, SPRING);

  const [dims, setDims] = useState(computeDims);
  useEffect(() => {
    const onResize = () => setDims(computeDims());
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const sHalf = dims.sFull * 0.5;

  /* Group scale: full-photo → 50% (shrink) → 1 (grow to final). */
  const groupScale = useTransform(
    p,
    [0, 0.45, 0.7],
    [dims.sFull, sHalf, 1],
  );
  /* Split: side cards slide out by one gap (only at the end). */
  const splitX = useTransform(p, [0.45, 0.7], [0, dims.gap]);
  /* Flip: reveal text face (only at the end). */
  const flip = useTransform(p, [0.45, 0.7], [0, 180]);
  /* Corner radius appears as the slices separate. */
  const radius = useTransform(p, [0.45, 0.58], [0, 12]);
  /* Heading rides ON the photo (scales with the group) and only
     disappears right as the flip kicks off (~0.45). It does NOT
     fade independently during the shrink. */
  const headingOpacity = useTransform(p, [0.43, 0.5], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#FBF7F0]"
      style={{ height: "300vh" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Centering layer holds the scaled group in the middle
            of the viewport. */}
        <div className="flex h-full w-full items-center justify-center">
          {/* GROUP — cards + heading scale together as ONE unit, so
              the heading shrinks WITH the photo (it doesn't fade on
              its own). The group is exactly the photo size (cardH
              tall) and `relative` so the heading can overlay ON it. */}
          <motion.div
            style={{
              scale: groupScale,
              position: "relative",
              width: dims.groupW,
              height: dims.cardH,
            }}
          >
            {/* CARDS ROW — perspective lives here so the cards'
                rotateY reads as a real 3-D flip. Zero-gap flex row so
                at full scale they tile into one continuous photo;
                splitX opens the gaps later. */}
            <div
              className="flex h-full w-full items-center justify-center"
              style={{ perspective: 2000 }}
            >
              {beliefs.map((belief, i) => {
                const direction = i === 0 ? -1 : i === 2 ? 1 : 0;
                return (
                  <CardSlice
                    key={belief.title}
                    belief={belief}
                    index={i}
                    direction={direction}
                    cardW={dims.cardW}
                    cardH={dims.cardH}
                    splitX={splitX}
                    flip={flip}
                    radius={radius}
                  />
                );
              })}
            </div>

            {/* HEADING — overlaid OVER the top of the photo (as
                before), scales with the group, disappears on flip. */}
            <motion.h2
              style={{
                opacity: headingOpacity,
                fontSize: SZ.headingFs,
                lineHeight: "120%",
                position: "absolute",
                top: "min(2.78vw, 4.30vh)" /* ~48 px from photo top */,
                left: 0,
                right: 0,
                zIndex: 20,
              }}
              className="m-0 text-center font-['Poppins',_sans-serif] font-normal capitalize text-black"
            >
              {heading}
            </motion.h2>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   CardSlice — fixed-size card (no width/height animation).
   Front = one third of the crowd photo (the three touching
   slices reconstruct a single image); back = white belief card.
   ───────────────────────────────────────────────────────── */
function CardSlice({
  belief,
  index,
  direction,
  cardW,
  cardH,
  splitX,
  flip,
  radius,
}: {
  belief: Belief;
  index: number;
  direction: number;
  cardW: number;
  cardH: number;
  splitX: MotionValue<number>;
  flip: MotionValue<number>;
  radius: MotionValue<number>;
}) {
  /* Side cards translate outward; centre card stays put. */
  const x = useTransform(splitX, (v) => v * direction);

  return (
    <motion.div
      style={{
        width: cardW,
        height: cardH,
        x,
        rotateY: flip,
        transformStyle: "preserve-3d",
        WebkitTransformStyle: "preserve-3d",
        position: "relative",
        flexShrink: 0,
        willChange: "transform",
      }}
    >
      {/* FRONT FACE — image slice. The ±0.5 px horizontal bleed
          overlaps neighbours so there are NO hairline white seams
          between the touching slices while it reads as one photo. */}
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: -0.5,
          right: -0.5,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          borderRadius: radius,
          overflow: "hidden",
          backgroundImage: `url(${IMAGE_SRC})`,
          backgroundSize: "300% 100%",
          backgroundPosition: `${index * 50}% center`,
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* BACK FACE — white belief card, title at TOP. */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          rotateY: 180,
          borderRadius: radius,
          overflow: "hidden",
          background: "#FFF",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          paddingTop: SZ.cardPadY,
          paddingBottom: SZ.cardPadY,
          paddingLeft: SZ.cardPadX,
          paddingRight: SZ.cardPadX,
        }}
      >
        <h3
          style={{
            fontSize: SZ.titleFs,
            fontWeight: 500,
            lineHeight: "150%",
            maxWidth: SZ.titleW,
            margin: 0,
            marginBottom: SZ.titleToDesc,
          }}
          className="font-['Poppins',_sans-serif] capitalize text-black"
        >
          {belief.title}
        </h3>
        <p
          style={{
            fontSize: SZ.descFs,
            fontWeight: 400,
            lineHeight: "140%",
            maxWidth: SZ.descW,
            margin: 0,
          }}
          className="font-['Poppins',_sans-serif] text-[#323232]"
        >
          {belief.description}
        </p>
      </motion.div>
    </motion.div>
  );
}
