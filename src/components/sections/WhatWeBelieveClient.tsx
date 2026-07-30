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
    title: "Founder-Centricity",
    description:
      "Our conviction is anchored in the individual, not the market cycle. Great founders have the resilience to iterate and define new categories.",
  },
  {
    title: "Conviction Consensus",
    description:
      "We don’t wait for consensus. The best opportunities often look wrong before they're proven right. We back our own read, even when it's early.",
  },
  {
    title: "Commitment Endurance",
    description:
      "Our involvement doesn't end at the cheque. We stay close through all the pivots providing support in the decisive moments that define long-term success.",
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
  const targetH = 580;

  const scale = Math.min(winW / 1512, winH / 982, 1.2);
  const cardW = Math.max(280, Math.round(targetW * Math.min(scale, 1)));
  const cardH = Math.max(420, Math.round(targetH * Math.min(scale, 1)));

  const gap = Math.round(winW * 0.02);
  const photoW = 3 * cardW;

  return { winW, winH, cardW, cardH, gap, photoW };
}

function computeMobileDims() {
  if (typeof window === "undefined") return FALLBACK_MOBILE_DIMS;

  const winW = window.innerWidth;
  const winH = window.innerHeight;
  
  // Account for the 64px navbar offset so the top of the image aligns perfectly without gaps
  const availH = winH - 64;

  const cardW = Math.min(winW * 0.88, 380);
  // FIXED: Increased height multiplier and maximum height just for mobile cards
  const cardH = Math.min(availH * 0.28, 250);
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
      className="relative w-full bg-[#FBF7F0] max-md:-mt-[60px] max-md:pt-[60px] max-md:!h-[180vh]"
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
  return (
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
            progress={progress}
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
          className="m-0 text-center font-['Poppins',_sans-serif] font-semibold text-black whitespace-nowrap max-md:!text-[clamp(24px,7vw,28px)] max-md:!leading-[120%]"
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
            marginTop: "clamp(24px, 5dvh, 40px)",
            textShadow: "0px 4px 16px rgba(0,0,0,0.05)",
            willChange: "transform",
          }}
          className="m-0 text-center font-['Poppins',_sans-serif] text-[clamp(24px,7vw,28px)] font-semibold text-black leading-[120%]"
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
function CardBlobs({ mouseX, mouseY, isHovered }: { mouseX: MotionValue<number>; mouseY: MotionValue<number>; isHovered: boolean }) {
  // Use the exact spring config from Hero for the cursor
  const cursorSpring = { damping: 25, stiffness: 250, mass: 0.3 };
  const smoothMouseX = useSpring(mouseX, cursorSpring);
  const smoothMouseY = useSpring(mouseY, cursorSpring);

  // Parallax ambient spring for the background blobs
  const ambientSpring = { damping: 30, stiffness: 70, mass: 1 };
  const smoothNormX = useSpring(mouseX, ambientSpring);
  const smoothNormY = useSpring(mouseY, ambientSpring);

  // Ambient blobs shift slightly opposite to mouse direction
  const leftX = useTransform(smoothNormX, [-1, 1], ["-8%", "8%"]);
  const leftY = useTransform(smoothNormY, [-1, 1], ["-8%", "8%"]);
  const rightX = useTransform(smoothNormX, [-1, 1], ["8%", "-8%"]);
  const rightY = useTransform(smoothNormY, [-1, 1], ["8%", "-8%"]);

  // Map -1 to 1 range perfectly onto 0% to 100% of the card bounds
  const cursorLeft = useTransform(smoothMouseX, (v) => `${50 + v * 50}%`);
  const cursorTop = useTransform(smoothMouseY, (v) => `${50 + v * 50}%`);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">

      {/* 1. Ambient Blob (reduced size + opacity so the hover blob reads clearly) */}
      <motion.div
        className="absolute"
        style={{
          left: "-20%",
          top: "-20%",
          width: "55%",
          height: "55%",
          x: leftX,
          y: leftY,
          willChange: "transform",
        }}
      >
        <motion.div
          className="w-full h-full rounded-full blur-[40px] max-md:blur-[25px]"
          style={{ background: "radial-gradient(circle, #5054B5 0%, #054EB6 40%, #022250 80%, transparent 100%)", opacity: 0.35 }}
          animate={{
            x: ["0%", "35%", "-15%", "25%", "0%"],
            y: ["0%", "25%", "-10%", "35%", "0%"],
            scale: [1, 1.15, 0.85, 1.1, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
        />
      </motion.div>

      {/* 2. Ambient Blob (reduced size + opacity) */}
      <motion.div
        className="absolute"
        style={{
          right: "-20%",
          bottom: "-20%",
          width: "50%",
          height: "50%",
          x: rightX,
          y: rightY,
          willChange: "transform",
        }}
      >
        <motion.div
          className="w-full h-full rounded-full blur-[40px] max-md:blur-[25px]"
          style={{ background: "radial-gradient(circle, #AC71C6 0%, #033699 50%, #001A4D 80%, transparent 100%)", opacity: 0.3 }}
          animate={{
            x: ["0%", "-35%", "15%", "-25%", "0%"],
            y: ["0%", "-25%", "10%", "-35%", "0%"],
            scale: [1, 1.15, 0.85, 1.1, 1],
          }}
          transition={{ duration: 21, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
        />
      </motion.div>

      {/* 3. Mouse Hover Blob — only visible on the card being hovered, larger + brighter */}
      <motion.div
        className="absolute rounded-full aspect-square blur-[30px] max-md:blur-[20px]"
        style={{
          width: "40%",
          background: "radial-gradient(circle, rgba(80,84,181,0.95) 0%, rgba(5,78,182,0.6) 40%, rgba(2,34,80,0.25) 70%, transparent 100%)",
          left: cursorLeft,
          top: cursorTop,
          translateX: "-50%",
          translateY: "-50%",
          willChange: "transform, opacity",
        }}
        animate={{ opacity: isHovered ? 0.75 : 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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

  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const my = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    mouseX.set(mx);
    mouseY.set(my);
  }, [mouseX, mouseY]);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  // NEW: Triggers immediately as the flip completes, detached from exact scroll bounds
  const [isFlipped, setIsFlipped] = useState(false);
  useEffect(() => {
    const unsubscribe = progress.on("change", (latest) => {
      // The flip completes completely at 0.50. We trigger it natively right as it resolves.
      if (latest >= 0.45) setIsFlipped(true);
      else setIsFlipped(false);
    });
    return () => unsubscribe();
  }, [progress]);

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
        {/* FIXED: Uses borderRight instead of width: 1px to prevent GPU fractional bleed */}
        {index < 2 && (
          <motion.div 
            style={{ opacity: lineOpacity, borderRight: "1px solid rgba(0,0,0,0.4)" }}
            className="absolute right-0 top-0 bottom-0 w-0 z-20 pointer-events-none" 
          />
        )}
      </motion.div>

      <motion.div
        ref={cardRef}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
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
        <CardBlobs mouseX={mouseX} mouseY={mouseY} isHovered={isHovered} />

        <div className="relative z-10 flex flex-col h-full" style={{ paddingTop: "min(3.47vw, 5.37vh)", paddingBottom: "min(2.78vw, 4.31vh)", paddingLeft: "min(2.08vw, 3.22vh)", paddingRight: "min(2.08vw, 3.22vh)", gap: "min(1.85vw, 2.86vh)" }}>
          <div className="flex justify-center">
            <h3
              className="font-['Poppins',_sans-serif] font-semibold text-white capitalize text-center max-md:!text-[20px]"
              style={{ fontSize: "min(3.01vw, 4.66vh)", lineHeight: "120%" }}
            >
              {belief.title}
            </h3>
          </div>

          <div className="w-full">
            <motion.div
              initial={false}
              animate={{ scaleX: isFlipped ? 1 : 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: isFlipped ? 0.15 : 0 }}
              style={{ transformOrigin: "center", borderTop: "1px solid rgba(255,255,255,0.8)" }}
              className="w-full h-0"
            />
          </div>

          <div className="flex justify-center">
            <p
              className="font-['Poppins',_sans-serif] font-normal text-white/90 text-center max-md:!text-[13px]"
              style={{ fontSize: "min(1.5vw, 2.3vh)", lineHeight: "160%" }}
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
  
  const [isFlipped, setIsFlipped] = useState(false);
  useEffect(() => {
    const unsubscribe = progress.on("change", (latest) => {
      if (latest >= 0.45) setIsFlipped(true);
      else setIsFlipped(false);
    });
    return () => unsubscribe();
  }, [progress]);

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
          backgroundSize: "auto 300%",
          backgroundPosition: `center ${index * 50}%`,
          backgroundRepeat: "no-repeat",
        }}
      >
        {index < 2 && (
          <motion.div 
            style={{ opacity: lineOpacity, borderBottom: "1px solid rgba(0,0,0,0.4)" }}
            className="absolute left-0 right-0 bottom-0 h-0 z-20 pointer-events-none" 
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
        <CardBlobs mouseX={mouseX} mouseY={mouseY} isHovered={false} />

        {/* FIXED: Overrode inner mobile padding via max-md:!p-[20px_16px] for consistent framing */}
        <div
          className="relative z-10 flex flex-col h-full max-md:!p-[20px_16px] max-md:!gap-[12px]"
          style={{ paddingTop: "min(3.47vw, 5.37vh)", paddingBottom: "min(2.78vw, 4.31vh)", paddingLeft: "min(2.08vw, 3.22vh)", paddingRight: "min(2.08vw, 3.22vh)", gap: "min(1.85vw, 2.86vh)" }}
        >
          <div className="flex justify-center">
            <h3
              className="font-['Poppins',_sans-serif] font-semibold text-white capitalize text-center max-md:!text-[clamp(16px,4.5vw,20px)]"
              style={{ fontSize: "min(3.01vw, 4.66vh)", lineHeight: "120%" }}
            >
              {belief.title}
            </h3>
          </div>

          <div className="w-full">
            <motion.div
              initial={false}
              animate={{ scaleX: isFlipped ? 1 : 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: isFlipped ? 0.15 : 0 }}
              style={{ transformOrigin: "center", borderTop: "1px solid rgba(255,255,255,0.8)" }}
              className="w-full h-0"
            />
          </div>

          <div className="flex justify-center">
            <p
              className="font-['Poppins',_sans-serif] font-normal text-white/90 text-center max-md:!text-[clamp(10px,2.8vw,12px)] max-md:!leading-[140%]"
              style={{ fontSize: "min(1.39vw, 2.15vh)", lineHeight: "155%" }}
            >
              {belief.description}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}