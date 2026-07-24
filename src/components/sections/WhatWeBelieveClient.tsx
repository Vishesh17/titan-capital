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
    title: "Founder Centricity",
    description:
      "We back individuals ahead of market cycles. Exceptional founders possess the resilience to iterate and the vision to define new categories; our conviction is anchored in the person, remaining constant as the business model evolves.",
  },
  {
    title: "Conviction Consensus",
    description:
      "We forgo herd mentality. By identifying asymmetric potential before it is market-validated, we prioritize independent, contrarian analysis over industry consensus.",
  },
  {
    title: "Commitment Endurance",
    description:
      "Partnership transcends the initial capital injection. We remain deeply engaged through talent acquisition, iterative pivots, and subsequent funding, providing support in the decisive moments that define long-term success.",
  },
];

const IMAGE_SRC = "/images/what-we-believe/crowd.png";

/* ─────────────────────────────────────────────────────────
   Card design tokens
   ───────────────────────────────────────────────────────── */
const SZ = {
  headingFs: "min(4.51vw, 6.98vh)",
  titleFs: "min(2.77vw, 4.30vh)",
  titleW: "min(23.09vw, 35.72vh)",
  hrW: "min(22.91vw, 35.45vh)",
  descFs: "min(1.15vw, 1.79vh)",
  descW: "min(21.64vw, 33.48vh)",
  cardPadY: "min(3.47vw, 5.37vh)",
};

/* Smooth easing for all transforms */
const EASE = [0.22, 1, 0.36, 1] as const;
const SPRING_CONFIG = { stiffness: 100, damping: 30, mass: 0.7 };

/* ─────────────────────────────────────────────────────────
   Viewport-derived px dimensions
   ───────────────────────────────────────────────────────── */
function computeDims() {
  if (typeof window === "undefined") {
    const cardW = 428, cardH = 682, gap = 42;
    const photoW = 3 * cardW;
    return { winW: 1728, cardW, cardH, gap, photoW, sFull: 1728 / photoW };
  }
  const winW = window.innerWidth;
  const winH = window.innerHeight;
  const cardW = Math.min(0.24769 * winW, 0.38317 * winH);
  const cardH = Math.min(0.39468 * winW, 0.61055 * winH);
  const gap = winW * 0.02;
  const photoW = 3 * cardW;
  const sFull = winW / photoW;
  return { winW, cardW, cardH, gap, photoW, sFull };
}

function computeMobileDims() {
  if (typeof window === "undefined") {
    const cardW = 340, cardH = 160, gap = 16;
    const photoH = 3 * cardH;
    return { winW: 390, winH: 844, cardW, cardH, gap, photoH, sFull: 844 / photoH };
  }
  const winW = window.innerWidth;
  const winH = window.innerHeight;
  const cardW = winW * 0.87;
  const cardH = winH * 0.19;
  const gap = 14;
  const photoH = 3 * cardH;
  const sFull = winH / photoH;
  return { winW, winH, cardW, cardH, gap, photoH, sFull };
}

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
  
  // Smooth the scroll progress to reduce jitter
  const p = useSpring(scrollYProgress, SPRING_CONFIG);

  const [dims, setDims] = useState(() => computeDims());
  const [mobileDims, setMobileDims] = useState(() => computeMobileDims());

  useEffect(() => {
    const onResize = () => {
      setDims(computeDims());
      setMobileDims(computeMobileDims());
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* Desktop transforms - phased to avoid overlap glitches */
  const sHalf = dims.sFull * 0.5;
  const groupScale = useTransform(p, [0, 0.4, 0.65], [dims.sFull, sHalf, 1], { ease: EASE });
  const splitX = useTransform(p, [0.5, 0.7], [0, dims.gap], { ease: EASE });
  const flip = useTransform(p, [0.5, 0.75], [0, 180], { ease: EASE });
  const radius = useTransform(p, [0.5, 0.65], [0, 12], { ease: EASE });
  const headingOpacity = useTransform(p, [0.35, 0.45], [1, 0], { ease: EASE });
  const headingScale = 1 / dims.sFull;

  /* Mobile transforms */
  const mSHalf = mobileDims.sFull * 0.5;
  const mGroupScale = useTransform(p, [0, 0.4, 0.65], [mobileDims.sFull, mSHalf, 1], { ease: EASE });
  const mSplitY = useTransform(p, [0.5, 0.7], [0, mobileDims.gap], { ease: EASE });
  const mFlip = useTransform(p, [0.5, 0.75], [0, 180], { ease: EASE });
  const mRadius = useTransform(p, [0.5, 0.65], [0, 12], { ease: EASE });
  const mHeadingOpacity = useTransform(p, [0.35, 0.45], [1, 0], { ease: EASE });
  const mHeadingScale = 1 / mobileDims.sFull;

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#FBF7F0] max-md:!h-[200vh]"
      style={{ height: "300vh" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="flex h-full w-full items-center justify-center">

          {/* ═══ DESKTOP VERSION ═══ */}
          <motion.div
            className="hidden md:block"
            style={{
              scale: groupScale,
              position: "relative",
              width: dims.photoW,
              height: dims.cardH,
            }}
          >
            {/* Perspective wrapper on the container, not the cards */}
            <div
              className="flex h-full w-full items-center justify-center"
              style={{ perspective: 2000, perspectiveOrigin: "center" }}
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
              className="m-0 text-center font-['Poppins',_sans-serif] font-semibold text-black"
            >
              {heading}
            </motion.h2>
          </motion.div>

          {/* ═══ MOBILE VERSION ═══ */}
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
              style={{ perspective: 2000, perspectiveOrigin: "center" }}
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
              className="m-0 text-center font-['Poppins',_sans-serif] font-semibold text-black"
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
   CardSlice — DESKTOP
   Clean flip animation with proper 3D context
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
  const x = useTransform(splitX, (v) => v * direction);

  return (
    <motion.div
      style={{
        width: cardW,
        height: cardH,
        x,
        rotateY: flip,
        transformStyle: "preserve-3d",
        position: "relative",
        flexShrink: 0,
      }}
    >
      {/* FRONT - Image */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backfaceVisibility: "hidden",
          borderRadius: radius.get(),
          overflow: "hidden",
          backgroundImage: `url(${IMAGE_SRC})`,
          backgroundSize: "300% auto",
          backgroundPosition: `${index * 50}% center`,
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* BACK - Content */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          backfaceVisibility: "hidden",
          rotateY: 180,
          borderRadius: radius,
          overflow: "hidden",
          background: "#FFF",
        }}
      >
        <CardBackContent belief={belief} radius={radius} />
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   MobileCardSlice — MOBILE
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
        position: "relative",
        flexShrink: 0,
      }}
    >
      {/* FRONT - Image */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backfaceVisibility: "hidden",
          borderRadius: radius.get(),
          overflow: "hidden",
          backgroundImage: `url(${IMAGE_SRC})`,
          backgroundSize: "auto 300%",
          backgroundPosition: `center ${index * 50}%`,
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* BACK - Content */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          backfaceVisibility: "hidden",
          rotateX: 180,
          borderRadius: radius,
          overflow: "hidden",
          background: "#FFF",
        }}
      >
        <MobileCardBackContent belief={belief} />
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   Card Back Content Components
   Separated for cleaner rendering
   ───────────────────────────────────────────────────────── */
function CardBackContent({ 
  belief, 
  radius 
}: { 
  belief: Belief;
  radius: MotionValue<number>;
}) {
  const p = useSpring(
    useTransform(radius, (r) => (r > 6 ? 1 : 0)),
    { stiffness: 200, damping: 20 }
  );
  const hrScale = useTransform(p, [0, 1], [0, 1]);

  return (
    <>
      {/* Title Area */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "50%",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingTop: SZ.cardPadY,
          paddingLeft: "20px",
          paddingRight: "20px",
        }}
      >
        <h3
          style={{
            fontSize: SZ.titleFs,
            fontWeight: 500,
            lineHeight: "110%",
            width: SZ.titleW,
            margin: 0,
            textAlign: "center",
          }}
          className="font-['Poppins',_sans-serif] capitalize text-black"
        >
          {belief.title}
        </h3>
      </div>

      {/* HR Divider */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          height: 1,
          display: "flex",
          justifyContent: "center",
          marginTop: "-0.5px",
        }}
      >
        <motion.div
          style={{
            width: SZ.hrW,
            height: 1,
            backgroundColor: "#000",
            scaleX: hrScale,
            transformOrigin: "center",
          }}
        />
      </div>

      {/* Description Area */}
      <div
        style={{
          position: "absolute",
          top: "60%",
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "0 20px",
        }}
      >
        <p
          style={{
            fontSize: SZ.descFs,
            fontWeight: 400,
            lineHeight: "140%",
            width: SZ.descW,
            margin: 0,
            textAlign: "center",
          }}
          className="font-['Poppins',_sans-serif] text-[#323232]"
        >
          {belief.description}
        </p>
      </div>
    </>
  );
}

function MobileCardBackContent({ belief }: { belief: Belief }) {
  return (
    <>
      {/* Title Area */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "50%",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingTop: "24px",
          paddingLeft: "16px",
          paddingRight: "16px",
        }}
      >
        <h3
          style={{
            fontSize: "18px",
            fontWeight: 500,
            lineHeight: "110%",
            margin: 0,
            textAlign: "center",
            width: "95%",
          }}
          className="font-['Poppins',_sans-serif] text-black"
        >
          {belief.title}
        </h3>
      </div>

      {/* HR Divider */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          height: 1,
          display: "flex",
          justifyContent: "center",
          marginTop: "-0.5px",
        }}
      >
        <div
          style={{
            width: "92%",
            height: 1,
            backgroundColor: "#000",
          }}
        />
      </div>

      {/* Description Area */}
      <div
        style={{
          position: "absolute",
          top: "60%",
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "0 16px",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            fontWeight: 400,
            lineHeight: "140%",
            margin: 0,
            textAlign: "center",
            width: "90%",
          }}
          className="font-['Poppins',_sans-serif] text-[#323232]"
        >
          {belief.description}
        </p>
      </div>
    </>
  );
}
