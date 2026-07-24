"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from "framer-motion";

/* ─────────────────────────────────────────────────────────
   Types & Fallback Data
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

// Optimized spring for butter-smooth fluidity
const SPRING = { stiffness: 60, damping: 20, mass: 0.5 };

/* ─────────────────────────────────────────────────────────
   Dimension Calculations
   ───────────────────────────────────────────────────────── */
const FALLBACK_DIMS = { winW: 1512, winH: 982, cardW: 452, cardH: 513, gap: 32, photoW: 1356 };
const FALLBACK_MOBILE_DIMS = { winW: 390, winH: 844, cardW: 340, cardH: 220, gap: 16, photoH: 660 };

function computeDims() {
  if (typeof window === "undefined") return FALLBACK_DIMS;

  const winW = window.innerWidth;
  const winH = window.innerHeight;

  const targetW = 452;
  const targetH = 513;

  const scale = Math.min(winW / 1512, winH / 982, 1.2);
  const cardW = Math.max(280, Math.round(targetW * Math.min(scale, 1)));
  const cardH = Math.max(380, Math.round(targetH * Math.min(scale, 1)));

  const gap = Math.round(winW * 0.02);
  const photoW = 3 * cardW;

  return { winW, winH, cardW, cardH, gap, photoW };
}

function computeMobileDims() {
  if (typeof window === "undefined") return FALLBACK_MOBILE_DIMS;

  const winW = window.innerWidth;
  const winH = window.innerHeight;

  const cardW = Math.min(winW * 0.88, 360);
  const cardH = Math.min(winH * 0.26, 240);
  const gap = 16;
  const photoH = 3 * cardH;

  return { winW, winH, cardW, cardH, gap, photoH };
}

export default function WhatWeBelieveClient({
  data,
}: {
  data?: WhatWeBelieveData | null;
}) {
  const heading = data?.heading || HEADING;
  const beliefs = data?.beliefs && data.beliefs.length === 3 ? data.beliefs : BELIEFS;

  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, SPRING);

  const [dims, setDims] = useState(FALLBACK_DIMS);
  const [mobileDims, setMobileDims] = useState(FALLBACK_MOBILE_DIMS);

  const handleResize = useCallback(() => {
    setDims(computeDims());
    setMobileDims(computeMobileDims());
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  /* ─────────────────────────────────────────────────────────
     ANIMATION TIMING & TRANSFORMS
     ───────────────────────────────────────────────────────── */
  const SHRINK_END = 0.4;
  const SPLIT_END = 0.85;

  /* ═══ DESKTOP ═══ */
  const desktopWidth = useTransform(p, [0, SHRINK_END], [dims.winW, dims.photoW]);
  const desktopHeight = useTransform(p, [0, SHRINK_END], [dims.winH, dims.cardH]);

  const headingScale = useTransform(p, [0, SHRINK_END], [1, dims.photoW / dims.winW]);
  const headingOpacity = useTransform(p, [0.15, 0.35], [1, 0]);
  const lineOpacity = useTransform(p, [SHRINK_END, 0.5], [0, 1]);
  const splitX = useTransform(p, [SHRINK_END, SPLIT_END], [0, dims.gap]);
  const flip = useTransform(p, [SHRINK_END, SPLIT_END], [0, 180]);
  const radius = useTransform(p, [0.3, SHRINK_END], [0, 2]);

  /* ═══ MOBILE ═══ */
  const mobileWidth = useTransform(p, [0, SHRINK_END], [mobileDims.winW, mobileDims.cardW]);
  const mobileHeight = useTransform(p, [0, SHRINK_END], [mobileDims.winH, mobileDims.photoH]);

  const mHeadingScale = useTransform(p, [0, SHRINK_END], [1, mobileDims.cardW / mobileDims.winW]);
  const mHeadingOpacity = useTransform(p, [0.15, 0.35], [1, 0]);
  const mSplitY = useTransform(p, [SHRINK_END, SPLIT_END], [0, mobileDims.gap]);
  const mFlip = useTransform(p, [SHRINK_END, SPLIT_END], [0, 180]);
  const mRadius = useTransform(p, [0.3, SHRINK_END], [0, 2]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#FBF7F0]"
      style={{ height: "175vh" }}
    >
      <div className="sticky top-0 z-10 h-screen w-full overflow-hidden flex items-center justify-center">
        
        {/* ═══ DESKTOP DISPLAY ═══ */}
        <motion.div
          className="hidden md:block relative"
          style={{
            width: desktopWidth,
            height: desktopHeight,
            willChange: "width, height",
          }}
        >
          {/* Slices Container */}
          <div
            className="flex h-full w-full items-center justify-center relative"
            style={{ perspective: 2000 }}
          >
            {beliefs.map((belief, i) => {
              const direction = i === 0 ? -1 : i === 2 ? 1 : 0;
              return (
                <DesktopCardSlice
                  key={belief.title}
                  belief={belief}
                  index={i}
                  direction={direction}
                  splitX={splitX}
                  flip={flip}
                  radius={radius}
                  lineOpacity={lineOpacity}
                  progress={p}
                />
              );
            })}

            {/* Perfect 1:1 Scaled Heading Overlay */}
            <motion.div
              style={{
                opacity: headingOpacity,
                position: "absolute",
                top: 0, 
                left: 0, 
                right: 0,
                display: "flex",
                justifyContent: "center",
                zIndex: 30, 
                pointerEvents: "none",
                willChange: "opacity", 
              }}
            >
              <motion.h2
                style={{ 
                  scale: headingScale, 
                  transformOrigin: "center top",
                  marginTop: "120px",
                  fontSize: "min(4.51vw, 6.98vh)",
                  lineHeight: "150%",
                  textShadow: "0px 4px 20px rgba(0,0,0,0.1)", 
                  willChange: "transform",
                }}
                className="m-0 text-center font-['Poppins',_sans-serif] font-semibold text-black whitespace-nowrap"
              >
                {heading}
              </motion.h2>
            </motion.div>
          </div>
        </motion.div>

        {/* ═══ MOBILE DISPLAY ═══ */}
        <motion.div
          className="block md:hidden relative"
          style={{
            width: mobileWidth,
            height: mobileHeight,
            willChange: "width, height",
          }}
        >
          <div
            className="flex h-full w-full flex-col items-center justify-center relative"
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
                  splitY={mSplitY}
                  flip={mFlip}
                  radius={mRadius}
                  lineOpacity={lineOpacity}
                  progress={p}
                />
              );
            })}

            {/* Locked-in Mobile Heading */}
            <motion.div
              style={{
                opacity: mHeadingOpacity,
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
                zIndex: 30,
                pointerEvents: "none",
                willChange: "opacity",
              }}
            >
              <motion.h2
                style={{ 
                  scale: mHeadingScale, 
                  transformOrigin: "center top",
                  marginTop: "80px", 
                  textShadow: "0px 4px 16px rgba(0,0,0,0.1)",
                  willChange: "transform",
                }}
                className="m-0 text-center font-['Poppins',_sans-serif] text-[36px] font-semibold text-black leading-[120%]"
              >
                {heading}
              </motion.h2>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   Desktop Card Slice
   ───────────────────────────────────────────────────────── */
function DesktopCardSlice({
  belief,
  index,
  direction,
  splitX,
  flip,
  radius,
  lineOpacity,
  progress,
}: {
  belief: Belief;
  index: number;
  direction: number;
  splitX: MotionValue<number>;
  flip: MotionValue<number>;
  radius: MotionValue<number>;
  lineOpacity: MotionValue<number>;
  progress: MotionValue<number>;
}) {
  const x = useTransform(splitX, (v) => v * direction);
  const hrScale = useTransform(progress, [0.75, 0.95], [0, 1]);

  return (
    <motion.div
      className="h-full relative flex-1"
      style={{
        x,
        rotateY: flip,
        transformStyle: "preserve-3d",
        WebkitTransformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      {/* Front Side Image */}
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: index === 0 ? 0 : "-1px",
          right: index === 2 ? 0 : "-1px",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          borderRadius: radius,
          overflow: "hidden",
          backgroundImage: `url(${IMAGE_SRC})`,
          backgroundSize: "300% auto", 
          backgroundPosition: `${index * 50}% top`,
          backgroundRepeat: "no-repeat",
        }}
      >
        {index < 2 && (
          <motion.div 
            style={{ opacity: lineOpacity }}
            className="absolute right-0 top-0 bottom-0 w-[1px] bg-black/40 z-20 pointer-events-none" 
          />
        )}
      </motion.div>

      {/* Back Side Content Card */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          rotateY: 180,
          borderRadius: "2px",
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
          boxShadow: "0px 10px 30px rgba(0,0,0,0.04)",
        }}
        className="flex flex-col items-center h-full pt-12 pb-10 px-6"
      >
        <div className="flex items-start justify-center w-[90%]">
          <h3 className="font-['Poppins',_sans-serif] text-[clamp(1.75rem,2.5vw,2.5rem)] font-semibold text-black leading-snug capitalize text-center">
            {belief.title}
          </h3>
        </div>

        {/* 🛑 Pushes hr and desc completely to the end & guarantees alignment */}
        <div className="w-[90%] flex flex-col mt-auto">
          <div className="w-full mb-6">
            <motion.div
              style={{ scaleX: hrScale, transformOrigin: "center" }}
              className="w-full h-[1px] bg-black/80"
            />
          </div>

          <div className="w-full min-h-[9rem] flex items-start justify-center">
            <p className="w-full font-['Poppins',_sans-serif] text-[clamp(0.85rem,1vw,1rem)] font-normal text-[#323232] leading-relaxed text-center">
              {belief.description}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   Mobile Card Slice
   ───────────────────────────────────────────────────────── */
function MobileCardSlice({
  belief,
  index,
  direction,
  splitY,
  flip,
  radius,
  lineOpacity,
  progress,
}: {
  belief: Belief;
  index: number;
  direction: number;
  splitY: MotionValue<number>;
  flip: MotionValue<number>;
  radius: MotionValue<number>;
  lineOpacity: MotionValue<number>;
  progress: MotionValue<number>;
}) {
  const y = useTransform(splitY, (v) => v * direction);
  const hrScale = useTransform(progress, [0.75, 0.95], [0, 1]);

  return (
    <motion.div
      className="w-full relative flex-1"
      style={{
        y,
        rotateX: flip,
        transformStyle: "preserve-3d",
        WebkitTransformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: index === 0 ? 0 : "-1px",
          bottom: index === 2 ? 0 : "-1px",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          borderRadius: radius,
          overflow: "hidden",
          backgroundImage: `url(${IMAGE_SRC})`,
          backgroundSize: "100% 300%",
          backgroundPosition: `center ${index * 50}%`,
          backgroundRepeat: "no-repeat",
        }}
      >
        {index < 2 && (
          <motion.div 
            style={{ opacity: lineOpacity }}
            className="absolute left-0 right-0 bottom-0 h-[1px] bg-black/40 z-20 pointer-events-none" 
          />
        )}
      </motion.div>

      {/* Back Side Content Card */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          rotateX: 180,
          borderRadius: "2px",
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
          boxShadow: "0px 4px 16px rgba(0,0,0,0.06)",
        }}
        className="flex flex-col items-center h-full pt-6 pb-4 px-4"
      >
        <div className="flex items-start justify-center w-[95%]">
          <h3 className="font-['Poppins',_sans-serif] text-[22px] font-semibold text-black leading-tight capitalize text-center">
            {belief.title}
          </h3>
        </div>

        {/* 🛑 Pushes hr and desc completely to the end & guarantees alignment */}
        <div className="w-[95%] flex flex-col mt-auto">
          <div className="w-full mb-3">
            <motion.div
              style={{ scaleX: hrScale, transformOrigin: "center" }}
              className="w-full h-[1px] bg-black/80"
            />
          </div>

          <div className="w-full min-h-[6.5rem] flex items-start justify-center">
            <p className="w-full font-['Poppins',_sans-serif] text-[13px] font-normal text-[#323232] leading-snug text-center">
              {belief.description}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}