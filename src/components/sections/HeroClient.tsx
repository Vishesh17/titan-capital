"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useTransform,
  useMotionValue,
  useMotionTemplate,
  animate,
  useSpring,
  useInView,
  cubicBezier,
  type MotionValue,
  type TargetAndTransition,
} from "framer-motion";

/* ─────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────── */
export interface HeroFounder {
  name: string;
  role: string;
  image: string;
  isLogo?: boolean;
  /** Scale factor for image sizing (e.g., 1.2 = 20% larger, 0.8 = 20% smaller) */
  scaleFactor?: number;
  /** Horizontal position offset in pixels (positive = right, negative = left) */
  positionX?: number;
  /** Vertical position offset in pixels (positive = down, negative = up) */
  positionY?: number;
}

export interface HeroData {
  titleLine1?: string;
  titleLine2Before?: string;
  titleLine2Emphasis?: string;
  subtitle?: string;
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
  founders?: HeroFounder[];
}

/* ─────────────────────────────────────────────────────────
   Fallback data
   ───────────────────────────────────────────────────────── */
const FALLBACK_FOUNDERS: HeroFounder[] = [
  { name: "Abhiraj Singh Bhal",  role: "Co-Founder, Urban Company",     image: "/images/herosection/3. Varun Khaitan  1.png", scaleFactor: 1, positionX: 0, positionY: 10 },
  { name: "Ashutosh Valani",     role: "Co-Founder, RENÉE Cosmetics",   image: "/images/herosection/4. Ghazal 1.png", scaleFactor: 1.3, positionX: 0, positionY: 5 },
  { name: "Abhishek Bansal",     role: "Co-Founder, Shadowfax",         image: "/images/herosection/6. Ashtosh Valani 1.png", scaleFactor: 1, positionX: 0, positionY: 2 },
  { name: "Titan Capital",       role: "",                              image: "/images/hero_founders_images/titan-capital.png",     isLogo: true, scaleFactor: 1, positionX: 0, positionY: 0 },
  { name: "Varun Khaitan",       role: "Co-Founder, Urban Company",     image: "/images/herosection/Asish Mohapatra 1.png", scaleFactor: 0.9, positionX: -13, positionY: 20 },
  { name: "Ishendra Agarwal",    role: "Co-Founder, GIVA",              image: "/images/herosection/image 177.png", scaleFactor: 1.3, positionX: -8, positionY: 40 },
  { name: "Anand Agrawal",       role: "Co-Founder, Credgenics",        image: "/images/herosection/Rishabh 2.png", scaleFactor: 1, positionX: 10, positionY: 0 },
  { name: "Ruchi Kalra",         role: "Co-Founder, Ofbusiness",        image: "/images/herosection/Aarti Gill 2.png", scaleFactor: 1.2, positionX: -20, positionY: 14 },
];

const FALLBACK_SUBTITLE =
  "We partner with entrepreneurs from day one. We invest conviction, not just capital, and stay by their side through every stage of their journey.";

function heroImageSrc(url: string, width: number): string {
  if (url.startsWith("https://cdn.sanity.io/")) {
    return `${url}?w=${width}&auto=format&q=85`;
  }
  return url;
}

/* ─────────────────────────────────────────────────────────
   Shared Styles & Dimensions
   ───────────────────────────────────────────────────────── */
const CARD_BG = "white";
const IMG_STYLE: React.CSSProperties = {
  objectFit: "cover",
  objectPosition: "top center",
};

/* Portrait photo slot spans the ENDURING / IMPACT rows */
const SLOT_W = "min(23.1vw, 35.8vh)";

/* Viewport-derived px dims for the stack / line stages */
function computeDims(w: number, h: number) {
  const isMobile = w < 768;
  const cardW = isMobile
    ? w * 0.20
    : Math.min(0.072 * w, 0.115 * h);
  const cardH = cardW; 
  return {
    cardW,
    cardH,
    deckPeek: cardH * (isMobile ? 0.25 : 0.17), 
    filmStep: cardH * (isMobile ? 1.25 : 1.14),
  };
}
const FALLBACK_DIMS = computeDims(1728, 1117);
type Dims = ReturnType<typeof computeDims>;

interface Slot {
  cx: number;
  cy: number;
  w: number;
  h: number;
}
const FALLBACK_SLOT: Slot = { cx: 0, cy: 0, w: 145, h: 207 };

/* Clamp scale factor to safe bounds (prevent overflow/underflow) */
function clampScale(scale?: number): number {
  const s = scale ?? 1;
  return Math.max(0.5, Math.min(s, 2.0));
}

const GRAIN =
  "1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ";
/* ─────────────────────────────────────────────────────────
   Hero Glows (Optimized CSS Version - Increased Movement)
   ───────────────────────────────────────────────────────── */
   function HeroGlow() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const normX = useMotionValue(0);
    const normY = useMotionValue(0);
  
    const cursorSpring = { damping: 25, stiffness: 60, mass: 0.4 };
    const smoothX = useSpring(mouseX, cursorSpring);
    const smoothY = useSpring(mouseY, cursorSpring);
  
    const ambientSpring = { damping: 30, stiffness: 70, mass: 1 };
    const smoothNormX = useSpring(normX, ambientSpring);
    const smoothNormY = useSpring(normY, ambientSpring);
  
    useEffect(() => {
      if (typeof window !== "undefined") {
        mouseX.set(window.innerWidth / 2);
        mouseY.set(window.innerHeight / 2);
      }
  
      const handleMouseMove = (e: MouseEvent) => {
        mouseX.set(e.pageX);
        mouseY.set(e.pageY);
        normX.set((e.clientX / window.innerWidth) * 2 - 1);
        normY.set((e.clientY / window.innerHeight) * 2 - 1);
      };
  
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY, normX, normY]);
  
    // Expanded the mouse parallax range slightly for more responsiveness
    const leftX = useTransform(smoothNormX, [-1, 1], ["-8%", "8%"]);
    const leftY = useTransform(smoothNormY, [-1, 1], ["-8%", "8%"]);
    const rightX = useTransform(smoothNormX, [-1, 1], ["8%", "-8%"]);
    const rightY = useTransform(smoothNormY, [-1, 1], ["8%", "-8%"]);
  
    return (
      <>
        {/* 1. LEFT BLOB */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute"
          style={{ 
            left: "-25%", 
            top: "-25%", 
            width: "min(75vw, 100vh)", 
            height: "min(75vw, 100vh)", 
            zIndex: 0, 
            x: leftX, 
            y: leftY, 
            willChange: "transform" 
          }}
        >
          <motion.div
            className="w-full h-full rounded-full blur-[120px]"
            style={{ background: "radial-gradient(circle, #5054B5 0%, #054EB6 40%, #022250 80%, transparent 100%)", opacity: 0.6 }}
            // Expanded wandering sequence
            animate={{ 
              x: ["0%", "35%", "-15%", "25%", "0%"], 
              y: ["0%", "25%", "-10%", "35%", "0%"], 
              scale: [1, 1.15, 0.85, 1.1, 1] 
            }}
            transition={{ duration: 18, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
          />
        </motion.div>
  
        {/* 2. RIGHT BLOB */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute"
          style={{ 
            right: "-25%", 
            bottom: "-25%", 
            width: "min(70vw, 90vh)", 
            height: "min(70vw, 90vh)", 
            zIndex: 0, 
            x: rightX, 
            y: rightY, 
            willChange: "transform" 
          }}
        >
          <motion.div
            className="w-full h-full rounded-full blur-[120px]"
            style={{ background: "radial-gradient(circle, #AC71C6 0%, #033699 50%, #001A4D 80%, transparent 100%)", opacity: 0.5 }}
            // Expanded wandering sequence
            animate={{ 
              x: ["0%", "-35%", "15%", "-25%", "0%"], 
              y: ["0%", "-25%", "10%", "-35%", "0%"], 
              scale: [1, 1.15, 0.85, 1.1, 1] 
            }}
            transition={{ duration: 21, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
          />
        </motion.div>
  
        {/* 3. 3D CURSOR BLOB (Smaller + Matches Left Blob Colors) */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 rounded-full blur-[60px]"
          style={{
            width: "25vw", // Reduced from 40vw to make it smaller
            height: "25vw", // Reduced from 40vw to make it smaller
            zIndex: 5, 
            x: smoothX, 
            y: smoothY,
            translateX: "-50%", 
            translateY: "-50%", 
            opacity: 0.4, 
            /* Matches the Left Blob's Indigo/Blue colors */
            background: "radial-gradient(circle, rgba(80,84,181,0.85) 0%, rgba(5,78,182,0.5) 40%, rgba(2,34,80,0.2) 70%, transparent 100%)",
            willChange: "transform", 
            z: 0 
          }}
        />
      </>
    );
  }

/* ─────────────────────────────────────────────────────────
   Main Hero Component
   ───────────────────────────────────────────────────────── */
export default function HeroClient({ data }: { data?: HeroData | null }) {
  const subtitle = data?.subtitle || FALLBACK_SUBTITLE;
  const founders: HeroFounder[] = (() => {
    if (data?.founders && data.founders.length > 0) {
      return data.founders.slice(0, 9);
    }
    return FALLBACK_FOUNDERS;
  })();

  // CHANGED: We now actively seek the Titan Capital Logo to make it the flying anchor card
  const heroIndex = (() => {
    const idx = founders.findIndex(f => f.isLogo || f.name.includes("Titan"));
    return idx !== -1 ? idx : Math.ceil((founders.length - 1) / 2);
  })();

  const [ready, setReady] = useState(false);
  const progress = useMotionValue(0);
  const [stage, setStage] = useState<"slideshow" | "animate">("slideshow");

  const [slideIndex, setSlideIndex] = useState(heroIndex);

  useEffect(() => {
    if (stage !== "slideshow" || !ready) return;
    let count = 0;
    const totalTicks = founders.length * 2;
    const id = setInterval(() => {
      count += 1;
      if (count >= totalTicks) {
        // End on the hero card so slideshow matches the flying hero card
        setSlideIndex(heroIndex);
        clearInterval(id);
        setTimeout(() => setStage("animate"), 300);
      } else {
        setSlideIndex(heroIndex + count);
      }
    }, 200);
    return () => clearInterval(id);
  }, [stage, ready, founders.length, heroIndex]);

  useEffect(() => {
    if (stage !== "animate") return;
    const controls = animate(progress, 1, {
      duration: 5.5,
      ease: "linear",
    });
    return () => controls.stop();
  }, [stage, progress]);

  const [dims, setDims] = useState<Dims>(FALLBACK_DIMS);
  const [slot, setSlot] = useState<Slot>(FALLBACK_SLOT);
  const slotRef = useRef<HTMLSpanElement>(null);
  const mobileSlotRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const measure = () => {
      setDims(computeDims(window.innerWidth, window.innerHeight));
      const isMobile = window.innerWidth < 768;
      const el = isMobile ? mobileSlotRef.current : slotRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setSlot({
        cx: r.left + r.width / 2 - window.innerWidth / 2,
        cy: r.top + r.height / 2 - window.innerHeight / 2,
        w: r.width,
        h: r.height,
      });
      setReady(true);
    };
    measure();
    const t = setTimeout(measure, 300);
    let cancelled = false;
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) measure();
      });
    }
    window.addEventListener("resize", measure);
    return () => {
      cancelled = true;
      clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const subtitleBottomOpacity = useTransform(
    progress,
    [0.25, 0.32, 0.94, 0.98],
    [1, 0, 0, 1]
  );

  const headingOpacity = useTransform(progress, [0.90, 0.96], [0, 1]);

  const [headingReady, setHeadingReady] = useState(false);
  const [headingTick, setHeadingTick] = useState(0);
  const headingFounder = founders[(heroIndex + headingTick) % founders.length];

  useEffect(() => {
    const unsub = progress.on("change", (v) => {
      if (v >= 0.95 && !headingReady) setHeadingReady(true);
      const hideNav = v >= 0.35 && v < 0.90;
      document.body.classList.toggle("hero-hide-nav", hideNav);
    });
    return () => {
      unsub();
      document.body.classList.remove("hero-hide-nav");
    };
  }, [progress, headingReady]);

  const sectionRef = useRef<HTMLElement>(null);
  const heroInView = useInView(sectionRef);

  // CHANGED: Timer logic to stay 4 seconds on the first image, then 2.6s for all others
  useEffect(() => {
    if (!headingReady || !heroInView) return;
    
    const delay = headingTick === 0 ? 4000 : 2600;
    
    const timer = setTimeout(() => {
      setHeadingTick((t) => t + 1);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [headingReady, heroInView, headingTick]);

  return (
    <section ref={sectionRef} className="relative h-screen w-full">
      <div
        className="relative flex h-screen w-full items-center justify-center overflow-hidden"
        style={{ background: "transparent" }}
      >
        <HeroGlow  />

        {/* Removed Side Labels FOUNDER-FIRST and ENDURING-VALUE entirely */}

        <motion.p
          style={{ opacity: subtitleBottomOpacity, maxWidth: "min(52vw, 900px)" }}
          className="pointer-events-none absolute bottom-[8vh] left-1/2 z-10 -translate-x-1/2 text-center font-['Poppins',_sans-serif] text-[min(1.62vw,2.51vh)] font-normal leading-[145%] text-white/90 max-md:!bottom-[4vh] max-md:!text-[13px] max-md:!max-w-[85vw]"
        >
          {subtitle}
        </motion.p>

        <AnimatePresence>
          {ready && stage === "slideshow" && (
            <motion.div
              key="slideshow"
              className="absolute z-40 overflow-hidden bg-white"
              style={{
                width: dims.cardW,
                height: dims.cardH,
                left: "50%",
                top: "50%",
                marginLeft: dims.cardW / -2,
                marginTop: dims.cardH / -2,
                borderRadius: "2px",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <AnimatePresence>
                <motion.div
                  key={slideIndex}
                  className="absolute inset-0"
                  style={{ zIndex: slideIndex, background: CARD_BG }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  // CHANGED: Snappy crossfade logic to fix glitching
                  exit={{ opacity: 0, transition: { duration: 0 } }} 
                  transition={{ duration: 0.1, ease: "easeOut" }}
                >
                  <Image
                    src={heroImageSrc(founders[slideIndex % founders.length].image, 600)}
                    alt={founders[slideIndex % founders.length].name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    priority
                    style={{
                      ...IMG_STYLE,
                      objectFit: founders[slideIndex % founders.length].isLogo ? "contain" : "cover",
                      filter: founders[slideIndex % founders.length].isLogo ? "none" : "grayscale(0.9)",
                    }}
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {stage === "animate" && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center max-md:!z-30"
            style={{ left: "50%", transform: "translateX(-50%)" }}
          >
            {founders.map((founder, i) => (
              <FounderCard
                key={founder.name}
                founder={founder}
                index={i}
                total={founders.length}
                heroIndex={heroIndex}
                progress={progress}
                dims={dims}
                slot={slot}
              />
            ))}
          </div>
        )}

        <motion.div
          style={{ opacity: headingOpacity }}
          className="absolute inset-0 z-20 flex items-center justify-center px-[var(--section-px-wide)] max-md:!items-start max-md:!pt-[12vh]"
        >
          <div className="relative flex flex-col items-center max-md:!items-start max-md:!px-[24px]">
            <h1
              className="pointer-events-none m-0 hidden md:flex flex-col items-start text-left font-['Poppins',_sans-serif] font-black uppercase leading-[86%] text-white"
              style={{ fontSize: "min(10.4vw, 16.0vh)" }}
            >
              <RevealLine show={headingReady} delay={0}>Backing Founder</RevealLine>
              <span
                className="flex items-stretch"
                style={{ gap: "min(0.8vw, 1.4vh)", marginTop: "min(0.2vw, 0.4vh)" }}
              >
                <RevealLine show={headingReady} delay={0.5}>For</RevealLine>
                <span
                  ref={slotRef}
                  className="relative inline-block shrink-0 overflow-hidden"
                  style={{
                    width: SLOT_W,
                    borderRadius: "2px",
                    alignSelf: "stretch",
                    marginTop: "0.06em",
                    marginBottom: "0.06em",
                  }}
                >
                  <HeadingPhoto founder={headingFounder} tick={headingTick} show={headingReady} />
                </span>
                <span className="flex flex-col items-start leading-[86%]">
                  <RevealLine show={headingReady} delay={0.7}>Enduring</RevealLine>
                  <RevealLine show={headingReady} delay={1.0}>Impact</RevealLine>
                </span>
              </span>
            </h1>

            <h1
              className="pointer-events-none m-0 flex md:hidden flex-col items-start text-left font-['Poppins',_sans-serif] font-black uppercase text-white"
              style={{ fontSize: "52px", lineHeight: "92%" }}
            >
              <RevealLine show={headingReady} delay={0}>Backing</RevealLine>
              <RevealLine show={headingReady} delay={0.3}>Founder</RevealLine>
              <RevealLine show={headingReady} delay={0.6}>For</RevealLine>
              <span
                className="relative inline-block shrink-0 overflow-hidden my-[4px]"
                style={{ width: "55vw", height: "32vw", borderRadius: 2 }}
                ref={mobileSlotRef}
              >
                <HeadingPhoto founder={headingFounder} tick={headingTick} show={headingReady} />
              </span>
              <RevealLine show={headingReady} delay={0.9}>Enduring</RevealLine>
              <RevealLine show={headingReady} delay={1.2}>Impact</RevealLine>
            </h1>

            <div className="absolute left-1/2 top-full flex -translate-x-1/2 flex-col items-center mt-[min(4.63vw,7.16vh)] max-md:!static max-md:!translate-x-0 max-md:!mt-[32px] max-md:!items-start">
              <div
                className="pointer-events-auto flex items-center justify-center max-md:!gap-[16px]"
                style={{ gap: "min(2.31vw, 3.58vh)" }}
              >
                <Link
                  href="/portfolio"
                  className="group relative whitespace-nowrap font-['Poppins',_sans-serif] text-[min(1.16vw,1.79vh)] font-normal text-white max-md:!text-[14px]"
                  style={{ lineHeight: "140%" }}
                >
                  View Portfolio
                  <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-white transition-all duration-300 ease-out group-hover:w-full" />
                </Link>
                <CursorFillButton href="/getinvestment" label="Get Investment" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   CursorFillButton
   ───────────────────────────────────────────────────────── */
function CursorFillButton({ href, label }: { href: string; label: string }) {
  const [origin, setOrigin] = useState("50% 50%");
  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
    setHovered(true);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
    setHovered(false);
  };

  return (
    <Link
      href={href}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative flex items-center justify-center overflow-hidden whitespace-nowrap font-['Poppins',_sans-serif] text-[min(1.16vw,1.79vh)] font-normal transition-colors duration-300 max-md:!w-[160px] max-md:!h-[40px] max-md:!text-[13px]"
      style={{
        width: "min(12.15vw, 18.8vh)",
        height: "min(3.36vw, 5.19vh)",
        borderRadius: "53px",
        border: "1px solid #CDCDCD",
        color: hovered ? "#001A4D" : "white",
      }}
    >
      <span
        className="absolute inset-0 bg-white transition-transform duration-400 ease-out"
        style={{
          transformOrigin: origin,
          transform: hovered ? "scale(1)" : "scale(0)",
          borderRadius: "inherit",
        }}
      />
      <span className="relative z-10">{label}</span>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────
   HeadingPhoto (Color Bloom Box)
   ───────────────────────────────────────────────────────── */
function HeadingPhoto({
  founder,
  tick,
  show,
}: {
  founder: HeroFounder;
  tick: number;
  show: boolean;
}) {
  const scale = clampScale(founder.scaleFactor);
  const imageOffsetX = founder.positionX ?? 0;
  const imageOffsetY = founder.positionY ?? 0;
  
  return (
    <AnimatePresence>
      <motion.div
        key={tick}
        className="absolute inset-0 flex items-center justify-center"
        style={{ zIndex: tick, background: CARD_BG }}
        initial={{ opacity: 0 }}
        animate={{ opacity: show ? 1 : 0 }}
        exit={{ opacity: 1 }}
        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: `scale(${scale}) translate(${imageOffsetX}px, ${imageOffsetY}px)`,
            transformOrigin: "center center",
          }}
        >
          <Image
            src={heroImageSrc(founder.image, 600)}
            alt={founder.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            priority
            style={{
              ...IMG_STYLE,
              objectFit: founder.isLogo ? "contain" : "scale-down",
              objectPosition: "center center",
            }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────
   RevealLine (Exact Cappen 3D GSAP Physics)
   ───────────────────────────────────────────────────────── */
const CHAR_STAGGER = 0.035;
function RevealLine({
  children,
  show,
  delay = 0,
}: {
  children: string;
  show: boolean;
  delay?: number;
}) {
  const chars = children.split("");

  return (
    <span
      className="inline-flex whitespace-nowrap"
      aria-label={children}
      style={{
        perspective: "500px", 
        transformStyle: "preserve-3d",
      }}
    >
      {chars.map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-flex"
          style={{
            transformOrigin: "center center",
            backfaceVisibility: "hidden", 
            transformStyle: "preserve-3d",
            willChange: "transform",
            transform: "translateZ(-0.85em) rotateX(var(--rotateX)) scaleY(var(--scaleY)) translateZ(0.85em)",
          }}
          initial={{
            "--rotateX": "-90deg",
            "--scaleY": 1.5,
            opacity: 0,
          } as TargetAndTransition}
          animate={{
            "--rotateX": show ? "0deg" : "-90deg",
            "--scaleY": show ? 1 : 1.5,
            opacity: show ? 1 : 0,
          } as TargetAndTransition}
          transition={{
            duration: 1.1,
            ease: [0.76, 0, 0.24, 1],
            delay: delay + i * CHAR_STAGGER,
          }}
        >
          <span>{ch === " " ? "\u00A0" : ch}</span>
        </motion.span>
      ))}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────
   FounderCard (With Cappen Shuffle Math)
   ───────────────────────────────────────────────────────── */
const DECK_ENLARGE = 1.38;

function FounderCard({
  founder,
  index,
  total,
  heroIndex,
  progress,
  dims,
  slot,
}: {
  founder: HeroFounder;
  index: number;
  total: number;
  heroIndex: number;
  progress: MotionValue<number>;
  dims: Dims;
  slot: Slot;
}) {
  const isHero = index === heroIndex;

  /* EXACT CAPPEN PHYSICS */
  const cappenEase = cubicBezier(0.76, 0, 0.24, 1);
  const linear = (t: number) => t;

  const deckY = index * dims.deckPeek * DECK_ENLARGE;
  const deckScale = Math.max(0.58, 1 - index * 0.06) * DECK_ENLARGE;
  const stripY = ((total - 1) / 2 - index) * dims.filmStep;

  //* CAPPEN STAGGER TIMING */
  const stagger = index * 0.015;
  const invertedStagger = ((total - 1) - index) * 0.015;

  const dealStart = 0.05 + stagger;
  const dealEnd = 0.20 + stagger;
  const openStart = 0.40 + invertedStagger; 
  const openEnd = 0.65 + invertedStagger;

  /* The hero flies forward strictly in this window */
  const flightStart = 0.82;
  const flightEnd = 0.96;

  const y = useTransform(
    progress,
    isHero
      ? [dealStart, dealEnd, openStart, openEnd, flightStart, flightEnd]
      : [dealStart, dealEnd, openStart, openEnd],
    isHero
      ? [0, deckY, deckY, stripY, stripY, slot.cy]
      : [0, deckY, deckY, stripY],
    isHero
      ? { ease: [cappenEase, linear, cappenEase, linear, cappenEase] }
      : { ease: [cappenEase, linear, cappenEase] }
  );

  const scale = useTransform(
    progress,
    isHero
      ? [dealStart, dealEnd, openStart, openEnd, flightStart, flightEnd]
      : [dealStart, dealEnd, openStart, openEnd],
    isHero
      ? [1, deckScale, deckScale, 1, 1, 1]
      : [1, deckScale, deckScale, 1],
    isHero
      ? { ease: [cappenEase, linear, cappenEase, linear, cappenEase] }
      : { ease: [cappenEase, linear, cappenEase] }
  );

  // Use width/height ONLY for hero flight, keeping scale at 1 to avoid conflict
  const heroWidth = useTransform(
    progress, 
    [flightStart, flightEnd], 
    [dims.cardW, slot.w], 
    { ease: cappenEase }
  );
  const heroHeight = useTransform(
    progress, 
    [flightStart, flightEnd], 
    [dims.cardH, slot.h], 
    { ease: cappenEase }
  );
  const x = useTransform(progress, [flightStart, flightEnd], [0, isHero ? slot.cx : 0], { ease: cappenEase });

  const zIndex = useTransform(progress, (v) =>
    isHero && v >= flightStart - 0.01 ? 60 : 40 - index
  );

  const opacity = useTransform(
    progress,
    isHero ? [0.97, 1] : [0.92, 0.96],
    [1, 0]
  );

  const grayscaleMV = useTransform(progress, [flightStart, flightEnd], [0.9, 0]);
  const heroFilter = useMotionTemplate`grayscale(${grayscaleMV})`;

  const imageScale = clampScale(founder.scaleFactor);
  const imageOffsetX = founder.positionX ?? 0;
  const imageOffsetY = founder.positionY ?? 0;

  return (
    <motion.div
      className="absolute bg-white"
      style={{
        width: isHero ? heroWidth : dims.cardW,
        height: isHero ? heroHeight : dims.cardH,
        x,
        y,
        scale,
        opacity,
        zIndex,
        borderRadius: "2px",
        filter: founder.isLogo ? "none" : isHero ? heroFilter : "grayscale(0.9)",
        willChange: isHero
          ? "transform, opacity, width, height, filter"
          : "transform, opacity",
      }}
    >
      <Image
        src={heroImageSrc(founder.image, 600)}
        alt={founder.name}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        style={{
          ...IMG_STYLE,
          objectFit: founder.isLogo ? "contain" : "cover",
        }}
      />
    </motion.div>
  );
}