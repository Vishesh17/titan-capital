"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
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
  
  // FIXED: Account for the 64px navbar offset so the top of the image aligns perfectly without gaps
  const availH = winH - 64;

  const cardW = Math.min(winW * 0.88, 380);
  const cardH = Math.min(availH * 0.25, 220);
  const gap = 16;
  const photoH = 3 * cardH;

  return { winW, winH: availH, cardW, cardH, gap, photoH };
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
  const SHRINK_END = 0.25;
  const SPLIT_END = 0.50;

  /* ═══ DESKTOP ═══ */
  const desktopWidth = useTransform(p, [0, SHRINK_END], [dims.winW, dims.photoW]);
  const desktopHeight = useTransform(p, [0, SHRINK_END], [dims.winH, dims.cardH]);

  const headingScale = useTransform(p, [0, SHRINK_END], [1, dims.photoW / dims.winW]);
  const headingOpacity = useTransform(p, [0.08, 0.20], [1, 0]);
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
      // FIXED: Added negative margin and compensating padding to seamlessly eat the gap from the previous section
      className="relative w-full bg-[#FBF7F0] max-md:-mt-[60px] max-md:pt-[60px]"
      style={{ height: "250vh" }}
    >
      <div className="sticky z-10 h-screen w-full overflow-hidden flex items-center justify-center" style={{ top: "64px", height: "calc(100vh - 64px)" }}>
        
        {/* ═══ DESKTOP DISPLAY ═══ */}
        <motion.div
          className="hidden md:block relative"
          style={{
            width: desktopWidth,
            height: desktopHeight,
            willChange: "width, height",
          }}
        >
          {/* Slices Container - centered in viewport below navbar */}
          <DesktopCardsContainer
            beliefs={beliefs}
            splitX={splitX}
            flip={flip}
            radius={radius}
            lineOpacity={lineOpacity}
            progress={p}
            headingOpacity={headingOpacity}
            headingScale={headingScale}
            heading={heading}
          />
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
          <MobileCardsContainer
            beliefs={beliefs}
            splitY={mSplitY}
            flip={mFlip}
            radius={mRadius}
            lineOpacity={lineOpacity}
            progress={p}
            mHeadingOpacity={mHeadingOpacity}
            mHeadingScale={mHeadingScale}
            heading={heading}
          />
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   Desktop Cards Container - handles mouse position globally
   ───────────────────────────────────────────────────────── */
function DesktopCardsContainer({
  beliefs,
  splitX,
  flip,
  radius,
  lineOpacity,
  progress,
  headingOpacity,
  headingScale,
  heading,
}: {
  beliefs: Belief[];
  splitX: MotionValue<number>;
  flip: MotionValue<number>;
  radius: MotionValue<number>;
  lineOpacity: MotionValue<number>;
  progress: MotionValue<number>;
  headingOpacity: MotionValue<number>;
  headingScale: MotionValue<number>;
  heading: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const my = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    mouseX.set(mx);
    mouseY.set(my);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full items-center justify-center relative"
      style={{ perspective: 2000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
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
            progress={progress}
            mouseX={mouseX}
            mouseY={mouseY}
          />
        );
      })}

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
            marginTop: "72px",
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
  );
}

/* ─────────────────────────────────────────────────────────
   Mobile Cards Container - handles mouse position globally
   ───────────────────────────────────────────────────────── */
function MobileCardsContainer({
  beliefs,
  splitY,
  flip,
  radius,
  lineOpacity,
  progress,
  mHeadingOpacity,
  mHeadingScale,
  heading,
}: {
  beliefs: Belief[];
  splitY: MotionValue<number>;
  flip: MotionValue<number>;
  radius: MotionValue<number>;
  lineOpacity: MotionValue<number>;
  progress: MotionValue<number>;
  mHeadingOpacity: MotionValue<number>;
  mHeadingScale: MotionValue<number>;
  heading: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const my = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    mouseX.set(mx);
    mouseY.set(my);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full flex-col items-center justify-center relative"
      style={{ perspective: 2000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {beliefs.map((belief, i) => {
        const direction = i === 0 ? -1 : i === 2 ? 1 : 0;
        return (
          <MobileCardSlice
            key={belief.title}
            belief={belief}
            index={i}
            direction={direction}
            splitY={splitY}
            flip={flip}
            radius={radius}
            lineOpacity={lineOpacity}
            progress={progress}
            mouseX={mouseX}
            mouseY={mouseY}
          />
        );
      })}

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
            // FIXED: Matched exact heading placement from screenshot
            marginTop: "clamp(24px, 5dvh, 40px)",
            textShadow: "0px 4px 16px rgba(0,0,0,0.05)",
            willChange: "transform",
          }}
          // FIXED: Adjusted font size and weight to perfectly match the screenshot design
          className="m-0 text-center font-['Poppins',_sans-serif] text-[clamp(28px,8vw,36px)] font-medium text-black leading-[120%]"
        >
          {heading}
        </motion.h2>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Card Blobs Texture (Mouse-following fluid blobs)
   ───────────────────────────────────────────────────────── */
function CardBlobs({ mouseX, mouseY }: { mouseX: MotionValue<number>; mouseY: MotionValue<number> }) {
  const springConfig = { stiffness: 80, damping: 25, mass: 0.8 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute rounded-full blur-[60px]"
        style={{
          width: "50%",
          height: "60%",
          background: "radial-gradient(circle, #5054B5 0%, #054EB6 30%, transparent 70%)",
          opacity: 0.6,
          left: useTransform(smoothMouseX, (v) => `${50 + v * 25}%`),
          top: useTransform(smoothMouseY, (v) => `${50 + v * 25}%`),
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
      <motion.div
        className="absolute rounded-full blur-[50px]"
        style={{
          width: "40%",
          height: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.1) 30%, transparent 70%)",
          opacity: 0.7,
          left: useTransform(smoothMouseX, (v) => `${50 - v * 20}%`),
          top: useTransform(smoothMouseY, (v) => `${50 - v * 20}%`),
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
      <motion.div
        className="absolute rounded-full blur-[45px]"
        style={{
          width: "35%",
          height: "40%",
          background: "radial-gradient(circle, rgba(80,84,181,0.4) 0%, transparent 70%)",
          opacity: 0.5,
          left: useTransform(smoothMouseX, (v) => `${50 + v * 15}%`),
          top: useTransform(smoothMouseY, (v) => `${50 - v * 15}%`),
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
    </div>
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
  mouseX,
  mouseY,
}: {
  belief: Belief;
  index: number;
  direction: number;
  splitX: MotionValue<number>;
  flip: MotionValue<number>;
  radius: MotionValue<number>;
  lineOpacity: MotionValue<number>;
  progress: MotionValue<number>;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
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

      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          rotateY: 180,
          borderRadius: "2px",
          overflow: "hidden",
          backgroundColor: "#001A4D",
          boxShadow: "0px 10px 30px rgba(0,0,0,0.2)",
        }}
        className="relative"
      >
        <CardBlobs mouseX={mouseX} mouseY={mouseY} />

        <div className="relative z-10 flex flex-col h-full" style={{ paddingTop: "min(3.47vw, 5.37vh)", paddingBottom: "min(2.78vw, 4.31vh)", paddingLeft: "min(2.08vw, 3.22vh)", paddingRight: "min(2.08vw, 3.22vh)" }}>
          <div className="flex justify-center">
            <h3
              className="font-['Poppins',_sans-serif] font-semibold text-white capitalize text-center max-md:!text-[20px]"
              style={{ fontSize: "min(3.01vw, 4.66vh)", lineHeight: "120%" }}
            >
              {belief.title}
            </h3>
          </div>

          <div className="flex flex-col mt-auto" style={{ marginBottom: "min(1.85vw, 2.86vh)" }}>
            <div className="w-full">
              <motion.div
                style={{ scaleX: hrScale, transformOrigin: "center" }}
                className="w-full h-[1px] bg-white/80"
              />
            </div>
          </div>

          <div className="flex justify-center" style={{ minHeight: "min(12.67vw, 19.61vh)" }}>
            <p
              className="font-['Poppins',_sans-serif] font-normal text-white/90 text-center max-md:!text-[13px]"
              style={{ fontSize: "min(1.16vw, 1.79vh)", lineHeight: "155%" }}
            >
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
  mouseX,
  mouseY,
}: {
  belief: Belief;
  index: number;
  direction: number;
  splitY: MotionValue<number>;
  flip: MotionValue<number>;
  radius: MotionValue<number>;
  lineOpacity: MotionValue<number>;
  progress: MotionValue<number>;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
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
          // FIXED: Changed from 100% 300% to auto 300%. This accurately crops the panoramic 
          // desktop image into a perfectly proportioned portrait center-crop for mobile.
          backgroundSize: "auto 300%",
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
          backgroundColor: "#001A4D", 
          boxShadow: "0px 4px 16px rgba(0,0,0,0.15)",
        }}
        className="relative"
      >
        <CardBlobs mouseX={mouseX} mouseY={mouseY} />

        <div className="relative z-10 flex flex-col h-full" style={{ paddingTop: "min(3.47vw, 5.37vh)", paddingBottom: "min(2.78vw, 4.31vh)", paddingLeft: "min(2.08vw, 3.22vh)", paddingRight: "min(2.08vw, 3.22vh)" }}>
          <div className="flex justify-center">
            <h3
              className="font-['Poppins',_sans-serif] font-semibold text-white capitalize text-center max-md:!text-[clamp(18px,5vw,22px)]"
              style={{ fontSize: "min(3.01vw, 4.66vh)", lineHeight: "120%" }}
            >
              {belief.title}
            </h3>
          </div>

          <div className="flex flex-col mt-auto" style={{ marginBottom: "min(1.85vw, 2.86vh)" }}>
            <div className="w-full">
              <motion.div
                style={{ scaleX: hrScale, transformOrigin: "center" }}
                className="w-full h-[1px] bg-white/80"
              />
            </div>
          </div>

          <div className="flex justify-center" style={{ minHeight: "min(12.67vw, 19.61vh)" }}>
            <p
              className="font-['Poppins',_sans-serif] font-normal text-white/90 text-center max-md:!text-[clamp(12px,3.5vw,14px)]"
              style={{ fontSize: "min(1.16vw, 1.79vh)", lineHeight: "155%" }}
            >
              {belief.description}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}