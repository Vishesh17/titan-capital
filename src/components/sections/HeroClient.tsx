"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { hasAppMounted } from "@/lib/appNavState";
import {
  motion,
  AnimatePresence,
  useTransform,
  useMotionValue,
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
  scaleFactor?: number;
  positionX?: number;
  positionY?: number;
  squareScaleFactor?: number;
  squarePositionX?: number;
  squarePositionY?: number;
}

export interface HeroData {
  titleLine1?: string;
  titleLine2Before?: string;
  titleLine2Emphasis?: string;
  subtitle?: string;
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
  founders?: HeroFounder[];
  /** Full list for the intro slideshow + rotating heading photo. */
  allFounders?: HeroFounder[];
}

/* ─────────────────────────────────────────────────────────
   Fallback data
   ───────────────────────────────────────────────────────── */
const FALLBACK_FOUNDERS: HeroFounder[] = [
  { name: "Abhiraj Singh Bhal",  role: "Co-Founder, Urban Company",     image: "/images/hero_founders_images/16.png", scaleFactor: 1.5, positionX: 0, positionY: 0, squareScaleFactor: 1, squarePositionX: -3, squarePositionY: 0 },
  { name: "Ashutosh Valani",     role: "Co-Founder, RENÉE Cosmetics",   image: "/images/hero_founders_images/12.png", scaleFactor: 1.5, positionX: 5, positionY: -5, squareScaleFactor: 1, squarePositionX: 0, squarePositionY: 0 },
  { name: "Abhishek Bansal",     role: "Co-Founder, Shadowfax",         image: "/images/hero_founders_images/1.png", scaleFactor: 1.5, positionX: 0, positionY: -10, squareScaleFactor: 1, squarePositionX: 0, squarePositionY: 0 },
  { name: "Titan Capital",       role: "",                              image: "/images/logos/titancapitallogo.svg",     isLogo: true, scaleFactor: 0.7, positionX: 0, positionY: 0, squareScaleFactor: 1, squarePositionX: 0, squarePositionY: 0 },
  { name: "Varun Khaitan",       role: "Co-Founder, Urban Company",     image: "/images/hero_founders_images/5.png", scaleFactor: 1.5, positionX: 0, positionY: -5, squareScaleFactor: 1, squarePositionX: 0, squarePositionY: 0 },
  { name: "Ishendra Agarwal",    role: "Co-Founder, GIVA",              image: "/images/hero_founders_images/7.png", scaleFactor: 1.5, positionX: 0, positionY: -10, squareScaleFactor: 1.2, squarePositionX: 0, squarePositionY: 0 },
  { name: "Anand Agrawal",       role: "Co-Founder, Credgenics",        image: "/images/hero_founders_images/6.png", scaleFactor: 1.5, positionX: 0, positionY: -10, squareScaleFactor: 1, squarePositionX: 0, squarePositionY: 0 },
  { name: "Ruchi Kalra",         role: "Co-Founder, Ofbusiness",        image: "/images/hero_founders_images/4.png", scaleFactor: 1.5, positionX: 0, positionY: -10, squareScaleFactor: 1, squarePositionX: 0, squarePositionY: 0 },
];

const FALLBACK_SUBTITLE =
  "We partner with entrepreneurs from day one. We invest conviction, not just capital, and stay by their side through every stage of their journey.";

/* Founder photos for the flicker SLIDESHOW + the rotating HEADING photo, so
   ALL founders get screen time. This is the ONE place that controls which
   faces appear there (independent of the curated film-strip `founders`).
   To add/remove a face: edit HERO_FOUNDER_IMAGE_NUMBERS to match the numbered
   files that actually exist in /public/images/hero_founders_images. (Only
   list numbers whose .png file exists — a missing number would 404 / show a
   stale cached image.) Sanity `allFounders`, once imported, overrides this. */
const HERO_FOUNDER_IMAGE_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16];
const FALLBACK_BY_IMAGE = new Map(FALLBACK_FOUNDERS.map((f) => [f.image, f]));
const ALL_FOUNDERS: HeroFounder[] = HERO_FOUNDER_IMAGE_NUMBERS.map((n) => {
  const image = `/images/hero_founders_images/${n}.png`;
  return (
    FALLBACK_BY_IMAGE.get(image) ?? {
      name: `Founder ${n}`,
      role: "",
      image,
      scaleFactor: 1.5,
      positionX: 0,
      positionY: -8,
      squareScaleFactor: 1,
      squarePositionX: 0,
      squarePositionY: 0,
    }
  );
});

function heroImageSrc(url: string, width: number): string {
  if (url.startsWith("https://cdn.sanity.io/")) {
    return `${url}?w=${width}&auto=format&q=85`;
  }
  return url;
}

/* ─────────────────────────────────────────────────────────
   Shared Styles & Dimensions
   ───────────────────────────────────────────────────────── */
const CARD_BG = "#FBF7F0";
const IMG_STYLE: React.CSSProperties = {
  objectFit: "cover",
  objectPosition: "top center",
};

const SLOT_W = "min(23.1vw, 35.8vh)";

function computeDims(w: number, h: number) {
  const isMobile = w < 768;
  const cardW = isMobile ? w * 0.20 : Math.min(0.072 * w, 0.115 * h);
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

function clampScale(scale?: number): number {
  const s = scale ?? 1;
  return Math.max(0.5, Math.min(s, 2.0));
}

/* ─────────────────────────────────────────────────────────
   Hero Glows
   ───────────────────────────────────────────────────────── */
function HeroGlow() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const normX = useMotionValue(0);
  const normY = useMotionValue(0);

  const cursorSpring = { damping: 25, stiffness: 250, mass: 0.3 };
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

  const leftX = useTransform(smoothNormX, [-1, 1], ["-8%", "8%"]);
  const leftY = useTransform(smoothNormY, [-1, 1], ["-8%", "8%"]);
  const rightX = useTransform(smoothNormX, [-1, 1], ["8%", "-8%"]);
  const rightY = useTransform(smoothNormY, [-1, 1], ["8%", "-8%"]);

  return (
    <>
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
          animate={{ 
            x: ["0%", "35%", "-15%", "25%", "0%"], 
            y: ["0%", "25%", "-10%", "35%", "0%"], 
            scale: [1, 1.15, 0.85, 1.1, 1] 
          }}
          transition={{ duration: 18, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
        />
      </motion.div>

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
          animate={{ 
            x: ["0%", "-35%", "15%", "-25%", "0%"], 
            y: ["0%", "-25%", "10%", "-35%", "0%"], 
            scale: [1, 1.15, 0.85, 1.1, 1] 
          }}
          transition={{ duration: 21, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
        />
      </motion.div>

      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 rounded-full blur-[60px]"
        style={{
          width: "25vw", 
          height: "25vw", 
          zIndex: 5, 
          x: smoothX, 
          y: smoothY,
          translateX: "-50%", 
          translateY: "-50%", 
          opacity: 0.4, 
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

  // Full founder set for the intro slideshow + rotating heading photo.
  // Comes from Sanity (`allFounders`); falls back to the local folder list.
  const allFounders: HeroFounder[] =
    data?.allFounders && data.allFounders.length > 0
      ? data.allFounders
      : ALL_FOUNDERS;

  const heroIndex = (() => {
    const idx = founders.findIndex(f => f.isLogo || f.name.includes("Titan"));
    return idx !== -1 ? idx : Math.ceil((founders.length - 1) / 2);
  })();

  // Skip the long intro (photo slideshow + card deal/open choreography) when
  // the homepage is reached via CLIENT-SIDE navigation (back button, footer,
  // navbar). On a hard/fresh load hasAppMounted() is false → full intro; on a
  // soft nav it's already true → jump straight to the heading reveal.
  // Read once at first render (useState initializer runs during render).
  const [skipIntro] = useState(() => hasAppMounted());

  const [ready, setReady] = useState(false);
  // On a soft-nav skip, start progress already at the end so the heading
  // wrapper is visible immediately (headingOpacity maps progress→1) and the
  // card choreography is bypassed.
  const progress = useMotionValue(skipIntro ? 1 : 0);
  const [stage, setStage] = useState<"slideshow" | "animate">(
    skipIntro ? "animate" : "slideshow"
  );

  // Slideshow flickers through EVERY founder photo (not just the film-strip set).
  const slideshowFounders = allFounders;
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (stage !== "slideshow" || !ready) return;
    let count = 0;
    // One pass through all founders before handing off to the deck animation.
    const totalTicks = slideshowFounders.length;
    const id = setInterval(() => {
      count += 1;
      if (count >= totalTicks) {
        setSlideIndex(0);
        clearInterval(id);
        setTimeout(() => setStage("animate"), 500);
      } else {
        setSlideIndex(count % slideshowFounders.length);
      }
    }, 200);
    return () => clearInterval(id);
  }, [stage, ready, slideshowFounders.length]);

  useEffect(() => {
    if (stage !== "animate") return;
    // Soft nav: snap straight to the end so the card choreography is skipped;
    // setting progress past 0.56 fires the change handler → headingReady →
    // the heading RevealLine plays on its own (the "final part" only).
    if (skipIntro) {
      progress.set(1);
      return;
    }
    const controls = animate(progress, 1, {
      duration: 4.5,
      ease: "linear",
    });
    return () => controls.stop();
  }, [stage, progress, skipIntro]);

  const [dims, setDims] = useState<Dims>(FALLBACK_DIMS);
  const [slot, setSlot] = useState<Slot>(FALLBACK_SLOT);
  
  const sectionRef = useRef<HTMLElement>(null);
  const slotRef = useRef<HTMLSpanElement>(null);
  const mobileSlotRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const measure = () => {
      if (typeof window === "undefined") return;
      
      const winW = document.documentElement.clientWidth; 
      const winH = window.innerHeight;
      
      setDims(computeDims(winW, winH));

      const isMobile = winW < 768;
      const el = isMobile ? mobileSlotRef.current : slotRef.current;
      const sectionEl = sectionRef.current;
      
      if (!el || !sectionEl) return;

      const sRect = el.getBoundingClientRect();
      const cRect = sectionEl.getBoundingClientRect();

      setSlot({
        cx: (sRect.left + sRect.width / 2) - (cRect.left + cRect.width / 2),
        cy: (sRect.top + sRect.height / 2) - (cRect.top + cRect.height / 2),
        w: sRect.width,
        h: sRect.height,
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

  const headingOpacity = useTransform(progress, [0.50, 0.58], [0, 1]);
  const sideLabelsOpacity = useTransform(progress, [0.44, 0.52], [1, 0]);

  // On a soft-nav skip, reveal the heading immediately (don't wait on the
  // progress change-listener, which registers in a later effect than the one
  // that snaps progress to 1 — so the set(1) event would be missed).
  const [headingReady, setHeadingReady] = useState(skipIntro);
  const [uiReady, setUiReady] = useState(false);
  const [subtitleReady, setSubtitleReady] = useState(skipIntro);
  const [headingTick, setHeadingTick] = useState(0);

  // Heading's rotating photo slot also cycles through EVERY founder (logo first
  // if present, then all the faces), so the heading showcases them all too.
  const logoFounder = founders.find(f => f.isLogo);
  const headingFounder = logoFounder
    ? (headingTick === 0 ? logoFounder : allFounders[(headingTick - 1) % allFounders.length])
    : allFounders[headingTick % allFounders.length];

  useEffect(() => {
    // Only hide the navbar while the full intro plays — on a soft-nav skip
    // there's no intro to hide behind, so keep the nav visible.
    if (ready && !skipIntro) document.body.classList.add("hero-hide-nav");
  }, [ready, skipIntro]);

  useEffect(() => {
    if (!headingReady) return;
    setUiReady(true);
    document.body.classList.remove("hero-hide-nav");
    const t = setTimeout(() => setSubtitleReady(true), 2700);
    return () => clearTimeout(t);
  }, [headingReady]);

  useEffect(() => {
    const unsub = progress.on("change", (v) => {
      if (v >= 0.56 && !headingReady) setHeadingReady(true);
    });
    return () => {
      unsub();
      document.body.classList.remove("hero-hide-nav");
    };
  }, [progress, headingReady]);

  const heroInView = useInView(sectionRef);

  useEffect(() => {
    if (!headingReady || !heroInView) return;
    const delay = headingTick === 0 ? 4500 : 1500;
    const timer = setTimeout(() => {
      setHeadingTick((t) => t + 1);
    }, delay);
    return () => clearTimeout(timer);
  }, [headingReady, heroInView, headingTick]);

  return (
    <section ref={sectionRef} className="relative h-screen w-full overflow-hidden max-md:overflow-x-hidden max-md:w-[100vw] max-md:ml-[calc(50%-50vw)] max-md:bg-[#00112E]">
      <div
        className="relative flex h-screen w-full items-center justify-center overflow-hidden"
        style={{ background: "transparent" }}
      >
        <HeroGlow />

        <motion.span
          style={{ opacity: sideLabelsOpacity }}
          className="pointer-events-none absolute left-[var(--section-px-wide)] top-1/2 z-10 -translate-y-1/2 font-['Poppins',_sans-serif] text-[min(1.04vw,1.61vh)] font-medium tracking-[0.2em] text-white/70 max-md:!left-1/2 max-md:!top-[5vh] max-md:!-translate-x-1/2 max-md:!translate-y-0 max-md:!text-[14px]"
        >
          FOUNDER-FIRST
        </motion.span>
        <motion.span
          style={{ opacity: sideLabelsOpacity }}
          className="pointer-events-none absolute right-[var(--section-px-wide)] top-1/2 z-10 -translate-y-1/2 font-['Poppins',_sans-serif] text-[min(1.04vw,1.61vh)] font-medium tracking-[0.2em] text-white/70 max-md:!right-auto max-md:!left-1/2 max-md:!top-auto max-md:!bottom-[18vh] max-md:!-translate-x-1/2 max-md:!translate-y-0 max-md:!text-[14px]"
        >
          OPERATOR-LED
        </motion.span>

        <motion.p
          style={{ maxWidth: "min(52vw, 900px)" }}
          className="pointer-events-none absolute bottom-[8vh] left-1/2 z-10 -translate-x-1/2 text-center font-['Poppins',_sans-serif] text-[min(1.62vw,2.51vh)] font-normal leading-[145%] text-white/90 max-md:!bottom-[clamp(48px,12dvh,80px)] max-md:!text-[clamp(11px,3vw,14px)] max-md:!w-[75vw] max-md:!max-w-[75vw]"
          initial={{ opacity: 1 }}
          animate={{ opacity: subtitleReady ? 1 : stage === "animate" ? 0 : 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
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
                  exit={{ opacity: 0, transition: { duration: 0 } }} 
                  transition={{ duration: 0.1, ease: "easeOut" }}
                >
                  {(() => {
                    const sf = slideshowFounders[slideIndex % slideshowFounders.length];
                    return (
                      <div
                        className="absolute inset-0"
                        style={{
                          transform: `scale(${clampScale(sf.squareScaleFactor)}) translate(${sf.squarePositionX ?? 0}px, ${sf.squarePositionY ?? 0}px)`,
                          transformOrigin: "center center",
                        }}
                      >
                        <Image
                          src={heroImageSrc(sf.image, 600)}
                          alt={sf.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          priority
                          style={{ objectFit: "cover", objectPosition: "center center", filter: "grayscale(0.9)" }}
                        />
                      </div>
                    );
                  })()}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {stage === "animate" && (
          <div className="absolute inset-0 z-10 pointer-events-none max-md:!z-30">
            {founders.map((founder, i) => (
              <FounderCard
                key={founder.name}
                founder={founder}
                index={i}
                total={founders.length}
                heroIndex={heroIndex}
                progress={progress}
                dims={dims}
              />
            ))}
          </div>
        )}

        <motion.div
          style={{ opacity: headingOpacity }}
          className="absolute inset-0 z-20 flex items-center justify-center px-[var(--section-px-wide)] max-md:!px-[24px] max-md:!items-start max-md:!pt-[clamp(80px,12dvh,120px)]"
        >
          <div className="relative flex flex-col items-center">
            
            <h1
              className="pointer-events-none m-0 hidden md:flex flex-col items-start text-left font-['Poppins',_sans-serif] font-black uppercase leading-[86%] text-white"
              style={{ fontSize: "min(9.88vw, 15.2vh)" }}
            >
              <RevealLine show={headingReady} delay={0}>Backing Founders</RevealLine>
              <span
                className="flex items-stretch"
                style={{ gap: "min(0.8vw, 1.4vh)", marginTop: "min(0.2vw, 0.4vh)" }}
              >
                <RevealLine show={headingReady} delay={0.5}>Building</RevealLine>
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
                  <RevealLine show={headingReady} delay={1.7}>The</RevealLine>
                  <RevealLine show={headingReady} delay={2.0}>Future</RevealLine>
                </span>
              </span>
            </h1>

            <h1
              className="pointer-events-none m-0 flex md:hidden flex-col items-start text-left font-['Poppins',_sans-serif] font-black uppercase text-white"
              style={{ fontSize: "clamp(36px, 12vw, 50px)", lineHeight: "96%" }}
            >
              <RevealLine show={headingReady} delay={0}>Backing</RevealLine>
              <RevealLine show={headingReady} delay={0.3}>Founders</RevealLine>
              <RevealLine show={headingReady} delay={0.6}>Building</RevealLine>

              <span
                className="relative inline-block shrink-0 overflow-hidden my-[clamp(4px,1dvh,8px)]"
                style={{ width: "min(70vw, 300px)", height: "min(54vw, 231px)", borderRadius: "4px" }}
                ref={mobileSlotRef}
              >
                <HeadingPhoto founder={headingFounder} tick={headingTick} show={headingReady} />
              </span>

              <RevealLine show={headingReady} delay={1.7}>The</RevealLine>
              <RevealLine show={headingReady} delay={2.0}>Future</RevealLine>
            </h1>

            <motion.div
              className="absolute left-1/2 top-full flex -translate-x-1/2 flex-col items-center mt-[min(4.63vw,7.16vh)] max-md:!static max-md:!translate-x-0 max-md:!mt-[clamp(8px,2dvh,16px)] max-md:!items-center max-md:!w-full"
              initial={{ opacity: 0, y: 12 }}
              animate={uiReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className="pointer-events-auto flex items-center justify-center gap-[min(2.31vw,3.58vh)] max-md:!gap-[clamp(12px,4vw,24px)]"
              >
                <Link
                  href="/portfolio"
                  className="group relative whitespace-nowrap font-['Poppins',_sans-serif] text-[min(1.16vw,1.79vh)] font-normal text-white max-md:!text-[clamp(12px,3.5vw,15px)]"
                  style={{ lineHeight: "140%" }}
                >
                  View Portfolio
                  <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-white transition-all duration-300 ease-out group-hover:w-full" />
                </Link>
                <CursorFillButton href="/getinvestment" label="Get Investment" />
              </div>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}

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
      className="relative flex items-center justify-center overflow-hidden whitespace-nowrap font-['Poppins',_sans-serif] text-[min(1.16vw,1.79vh)] font-normal transition-colors duration-300 max-md:!w-[clamp(130px,35vw,150px)] max-md:!h-[clamp(38px,6dvh,44px)] max-md:!text-[clamp(12px,3.5vw,15px)]"
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
  
  const isFirst = tick === 0;

  return (
    <AnimatePresence>
      <motion.div
        key={tick}
        className="absolute inset-0 flex items-center justify-center"
        style={{ zIndex: tick, background: CARD_BG }}
        initial={isFirst ? { opacity: 0, x: "-100%" } : { opacity: 0 }}
        animate={show ? (isFirst ? { opacity: 1, x: "0%" } : { opacity: 1 }) : { opacity: 0 }}
        exit={{ opacity: 1 }}
        transition={isFirst
          ? { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 1.25 }
          : { duration: 1.0, ease: [0.22, 1, 0.36, 1] }
        }
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
              // Punch up the photo so the halftone dither reads (skip logo).
              filter: founder.isLogo ? "none" : "contrast(1.14) saturate(1.12)",
            }}
          />
        </div>
        {/* Grainy / halftone print effect (skip the clean logo card) */}
        {!founder.isLogo && (
          <>
            {/* Halftone dot grid */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at center, rgba(0,0,0,0.9) 0.75px, transparent 1.15px)",
                backgroundSize: "3px 3px",
                mixBlendMode: "overlay",
                opacity: 0.6,
              }}
            />
            {/* Fine film grain */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                mixBlendMode: "overlay",
                opacity: 0.28,
              }}
            />
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

const CHAR_STAGGER = 0.025;
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
            duration: 0.7,
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

const DECK_ENLARGE = 1.38;

function FounderCard({
  founder,
  index,
  total,
  heroIndex,
  progress,
  dims,
}: {
  founder: HeroFounder;
  index: number;
  total: number;
  heroIndex: number;
  progress: MotionValue<number>;
  dims: Dims;
}) {
  const cappenEase = cubicBezier(0.76, 0, 0.24, 1);
  const linear = (t: number) => t;

  const deckY = index * dims.deckPeek * DECK_ENLARGE;
  const deckScale = Math.max(0.58, 1 - index * 0.06) * DECK_ENLARGE;
  const stripY = ((total - 1) / 2 - index) * dims.filmStep;

  const stagger = index * 0.015;
  const invertedStagger = ((total - 1) - index) * 0.015;

  const dealStart = 0.03 + stagger;
  const dealEnd = 0.15 + stagger;
  const openStart = 0.22 + invertedStagger;
  const openEnd = 0.48 + invertedStagger;

  const yOffset = useTransform(
    progress,
    [dealStart, dealEnd, openStart, openEnd],
    [0, deckY, deckY, stripY],
    { ease: [cappenEase, linear, cappenEase] }
  );

  const translateX = useTransform(() => `calc(-50%)`);
  const translateY = useTransform(yOffset, (val) => `calc(-50% + ${val}px)`);

  const scale = useTransform(
    progress,
    [dealStart, dealEnd, openStart, openEnd],
    [1, deckScale, deckScale, 1],
    { ease: [cappenEase, linear, cappenEase] }
  );

  const zIndex = useTransform(() => 40 - index);

  const opacity = useTransform(
    progress,
    [0.50, 0.62],
    [1, 0]
  );

  return (
    <motion.div
      className="absolute bg-white pointer-events-auto overflow-hidden"
      style={{
        left: "50%",
        top: "50%",
        x: translateX,
        y: translateY,
        width: dims.cardW,
        height: dims.cardH,
        scale,
        opacity,
        zIndex,
        borderRadius: "2px",
        filter: founder.isLogo ? "none" : "grayscale(0.9)",
        willChange: "transform, opacity",
      }}
    >
        <div
        className="absolute inset-0"
        style={{
          transform: `scale(${clampScale(founder.squareScaleFactor)}) translate(${founder.squarePositionX ?? 0}px, ${founder.squarePositionY ?? 0}px)`,
          transformOrigin: "center center",
        }}
      >
        <Image
          src={heroImageSrc(founder.image, 600)}
          alt={founder.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          style={{
            objectFit: founder.isLogo ? "contain" : "cover",
            objectPosition: "center center",
          }}
        />
      </div>
    </motion.div>
  );
}