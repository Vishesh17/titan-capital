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
  headingFs: "min(4.51vw, 6.98vh)",     // 78 px @ ref — matches Impact At
                                        // Glance / How We Show Up / Stories.
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
   Viewport-derived px dimensions — DESKTOP (landscape photo,
   3 vertical slices side by side).
   ───────────────────────────────────────────────────────── */
const FALLBACK_DIMS = (() => {
  const cardW = 428, cardH = 682, gap = 42;
  const photoW = 3 * cardW;
  return { winW: 1728, cardW, cardH, gap, photoW, sFull: 1728 / photoW };
})();

function computeDims() {
  if (typeof window === "undefined") return FALLBACK_DIMS;
  const winW = window.innerWidth;
  const winH = window.innerHeight;

  const cardW = Math.min(0.24769 * winW, 0.38317 * winH);
  const cardH = Math.min(0.39468 * winW, 0.61055 * winH);
  const gap = Math.min(0.02431 * winW, 0.0376 * winH);

  const photoW = 3 * cardW;
  const sFull = winW / photoW;

  return { winW, cardW, cardH, gap, photoW, sFull };
}

/* Mobile dims — portrait photo, 3 horizontal slices stacked. */
const FALLBACK_MOBILE_DIMS = (() => {
  const cardW = 340, cardH = 160, gap = 16;
  const photoH = 3 * cardH;
  return { winW: 390, winH: 844, cardW, cardH, gap, photoH, sFull: 844 / photoH };
})();

function computeMobileDims() {
  if (typeof window === "undefined") return FALLBACK_MOBILE_DIMS;
  const winW = window.innerWidth;
  const winH = window.innerHeight;

  const cardW = winW * 0.87; // ~87vw
  const cardH = winH * 0.19; // ~19vh per row
  const gap = 14;
  const photoH = 3 * cardH;
  const sFull = winH / photoH;

  return { winW, winH, cardW, cardH, gap, photoH, sFull };
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

  const [dims, setDims] = useState(FALLBACK_DIMS);
  const [mobileDims, setMobileDims] = useState(FALLBACK_MOBILE_DIMS);

  useEffect(() => {
    const onResize = () => {
      setDims(computeDims());
      setMobileDims(computeMobileDims());
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* Desktop transforms */
  const sHalf = dims.sFull * 0.5;
  const groupScale = useTransform(p, [0, 0.45, 0.7], [dims.sFull, sHalf, 1]);
  const splitX = useTransform(p, [0.45, 0.7], [0, dims.gap]);
  const flip = useTransform(p, [0.45, 0.7], [0, 180]);
  const radius = useTransform(p, [0.45, 0.58], [0, 12]);
  const headingOpacity = useTransform(p, [0.43, 0.5], [1, 0]);
  const headingScale = 1 / dims.sFull;

  /* Mobile transforms — same phases, vertical split + rotateX */
  const mSHalf = mobileDims.sFull * 0.5;
  const mGroupScale = useTransform(p, [0, 0.45, 0.7], [mobileDims.sFull, mSHalf, 1]);
  const mSplitY = useTransform(p, [0.45, 0.7], [0, mobileDims.gap]);
  const mFlip = useTransform(p, [0.45, 0.7], [0, 180]);
  const mRadius = useTransform(p, [0.45, 0.58], [0, 12]);
  const mHeadingOpacity = useTransform(p, [0.43, 0.5], [1, 0]);
  const mHeadingScale = 1 / mobileDims.sFull;

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#FBF7F0] max-md:!h-[200vh]"
      style={{ height: "300vh" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="flex h-full w-full items-center justify-center">

          {/* ═══ DESKTOP VERSION (hidden on mobile) ═══ */}
          <motion.div
            className="hidden md:block"
            style={{
              scale: groupScale,
              position: "relative",
              width: dims.photoW,
              height: dims.cardH,
            }}
          >
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

            <motion.h2
              style={{
                opacity: headingOpacity,
                scale: headingScale,
                transformOrigin: "center top",
                fontSize: SZ.headingFs,
                lineHeight: "120%",
                position: "absolute",
                top: "min(2.78vw, 4.30vh)",
                left: 0,
                right: 0,
                zIndex: 20,
              }}
              className="m-0 text-center font-['Poppins',_sans-serif] font-normal text-black"
            >
              {heading}
            </motion.h2>
          </motion.div>

          {/* ═══ MOBILE VERSION (hidden on desktop) ═══ */}
          <motion.div
            className="block md:hidden"
            style={{
              scale: mGroupScale,
              position: "relative",
              width: mobileDims.cardW,
              height: mobileDims.photoH,
            }}
          >
            <div
              className="flex h-full w-full flex-col items-center justify-center"
              style={{ perspective: 2000 }}
            >
              {beliefs.map((belief, i) => {
                const direction = i === 0 ? -1 : i === 2 ? 1 : 0;
                return (
                  <MobileCardSlice
                    key={belief.title}
                    belief={belief}
                    index={i}
                    direction={direction}
                    cardW={mobileDims.cardW}
                    cardH={mobileDims.cardH}
                    splitY={mSplitY}
                    flip={mFlip}
                    radius={mRadius}
                  />
                );
              })}
            </div>

            <motion.h2
              style={{
                opacity: mHeadingOpacity,
                scale: mHeadingScale,
                transformOrigin: "center top",
                fontSize: "32px",
                lineHeight: "120%",
                position: "absolute",
                top: "20px",
                left: 0,
                right: 0,
                zIndex: 20,
              }}
              className="m-0 text-center font-['Poppins',_sans-serif] font-normal text-black"
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
   CardSlice — DESKTOP: fixed-size card (no width/height animation).
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
          /* `300% auto` keeps the image's NATURAL aspect (1.631) — the
             three slices reconstruct one undistorted photo, cover-
             cropped vertically (never stretched like `300% 100%` did).
             The card's 1.883 aspect is always wider than the image, so
             this always fills — no letterboxing. */
          backgroundSize: "300% auto",
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

/* ─────────────────────────────────────────────────────────
   MobileCardSlice — MOBILE: portrait photo split into 3
   horizontal rows. Front = one third of the photo (stacked
   vertically); back = white belief card. Flips on X-axis.
   ───────────────────────────────────────────────────────── */
function MobileCardSlice({
  belief,
  index,
  direction,
  cardW,
  cardH,
  splitY,
  flip,
  radius,
}: {
  belief: Belief;
  index: number;
  direction: number;
  cardW: number;
  cardH: number;
  splitY: MotionValue<number>;
  flip: MotionValue<number>;
  radius: MotionValue<number>;
}) {
  const y = useTransform(splitY, (v) => v * direction);

  return (
    <motion.div
      style={{
        width: cardW,
        height: cardH,
        y,
        rotateX: flip,
        transformStyle: "preserve-3d",
        WebkitTransformStyle: "preserve-3d",
        position: "relative",
        flexShrink: 0,
        willChange: "transform",
      }}
    >
      {/* FRONT FACE — image slice (horizontal strip of portrait photo) */}
      <motion.div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: -0.5,
          bottom: -0.5,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          borderRadius: radius,
          overflow: "hidden",
          backgroundImage: `url(${IMAGE_SRC})`,
          backgroundSize: "auto 300%",
          backgroundPosition: `center ${index * 50}%`,
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* BACK FACE — white belief card */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          rotateX: 180,
          borderRadius: radius,
          overflow: "hidden",
          background: "#FFF",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "16px 20px",
        }}
      >
        <h3
          style={{
            fontSize: "18px",
            fontWeight: 500,
            lineHeight: "140%",
            margin: 0,
            marginBottom: 6,
          }}
          className="font-['Poppins',_sans-serif] text-black"
        >
          {belief.title}
        </h3>
        <p
          style={{
            fontSize: "12px",
            fontWeight: 400,
            lineHeight: "150%",
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
