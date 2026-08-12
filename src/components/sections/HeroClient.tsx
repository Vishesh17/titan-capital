"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { hasAppMounted } from "@/lib/appNavState";
import GrainOverlay from "@/components/ui/GrainOverlay";
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
import {
  HERO_BODY_CLASS,
  HERO_BODY_STYLE,
  HERO_HEADING_DARK_CLASS,
  HERO_HEADING_DARK_STYLE,
  LABEL_STYLE,
} from "@/styles/heroTypography";

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

/* Per-slot `sizes` hints. One shared string used to serve three very different
   boxes, so the browser picked an oversized candidate for the tiny deck cards
   and wasted bandwidth that the flicker needed. */
const SLIDESHOW_SIZES = "(max-width: 768px) 20vw, 8vw";
const HEADING_SIZES = "(max-width: 768px) 50vw, 24vw";

/** Matches the `max-md:` breakpoint the hero's two layouts switch on. */
const MOBILE_QUERY = "(max-width: 767px)";

/** The last word of the hero headline, on both breakpoints. */
const FINAL_WORD = "Future";

/**
 * Start delay (seconds) of the final heading word, per breakpoint. The two
 * layouts run different sequences:
 *   desktop — Backing 0 · Founders Building 0.5 · The 1.25 · Future 2.7
 *   mobile  — Backing 0 · Founders 0.3 · Building 0.6 · The 0.9 · Future 1.2
 * These feed the RevealLine `delay` props directly, so the sequence and the
 * timings below can't drift apart.
 */
const FINAL_WORD_DELAY = { desktop: 2.7, mobile: 1.2 } as const;

/**
 * Entrance for the hero's tail — description and CTAs rise together from below
 * once the headline has landed. Shared so the two stay locked in step.
 */
const TAIL_RISE_PX = 48;
const TAIL_TRANSITION = {
  duration: 1.1,
  ease: cubicBezier(0.22, 1, 0.36, 1),
};

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
          opacity: 0.65,
          background: "radial-gradient(circle, rgba(150,158,240,0.95) 0%, rgba(70,120,225,0.6) 40%, rgba(5,78,182,0.25) 70%, transparent 100%)",
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
    let id: ReturnType<typeof setInterval> | undefined;
    // Hold ~0.85s first so the entrance (card + side labels rising from the
    // bottom) plays BEFORE the photo flicker begins.
    const startTimer = setTimeout(() => {
      id = setInterval(() => {
        count += 1;
        if (count >= totalTicks) {
          // Stop after ONE pass — hold on the last founder (no reset to 0,
          // which looked like a second cycle starting) and hand off.
          if (id) clearInterval(id);
          setTimeout(() => setStage("animate"), 300);
        } else {
          setSlideIndex(count % slideshowFounders.length);
        }
      }, 200);
    }, 1050);
    return () => {
      clearTimeout(startTimer);
      if (id) clearInterval(id);
    };
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

  // ── Cappen-style entrance ──
  // The first slideshow card + the FOUNDER-FIRST / OPERATOR-LED side labels
  // RISE UP from the bottom (fade + translateY) the first time the hero
  // appears, just before the photo slideshow begins. `labelEntrance` drives
  // that reveal (0 → 1); the visible label opacity multiplies it by the
  // existing scroll-driven fade-out so both behaviours compose cleanly.
  const labelEntrance = useMotionValue(skipIntro ? 1 : 0);
  const labelY = useTransform(labelEntrance, [0, 1], ["75vh", "0vh"]);
  const labelOpacity = useTransform(
    [labelEntrance, sideLabelsOpacity],
    ([enter, fade]: number[]) => enter * fade
  );

  useEffect(() => {
    if (!ready || skipIntro) return;
    const controls = animate(labelEntrance, 1, {
      duration: 1.3,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.15,
    });
    return () => controls.stop();
  }, [ready, skipIntro, labelEntrance]);

  // On a soft-nav skip, reveal the heading immediately (don't wait on the
  // progress change-listener, which registers in a later effect than the one
  // that snaps progress to 1 — so the set(1) event would be missed).
  const [headingReady, setHeadingReady] = useState(skipIntro);
  const [uiReady, setUiReady] = useState(skipIntro);
  const [subtitleReady, setSubtitleReady] = useState(skipIntro);
  const [headingTick, setHeadingTick] = useState(0);


  useEffect(() => {
    // Only hide the navbar while the full intro plays — on a soft-nav skip
    // there's no intro to hide behind, so keep the nav visible.
    if (ready && !skipIntro) document.body.classList.add("hero-hide-nav");
  }, [ready, skipIntro]);

  useEffect(() => {
    if (!headingReady) return;

    // The navbar comes back as soon as the heading starts — it's chrome, and
    // holding it until the end of the sequence just looks broken.
    document.body.classList.remove("hero-hide-nav");

    // Soft-nav skip: the intro never played, so there's nothing to wait behind.
    if (skipIntro) return;

    const isMobile = window.matchMedia(MOBILE_QUERY).matches;

    // Description and CTAs enter together, only once "Future" has fully landed.
    const t = setTimeout(() => {
      setUiReady(true);
      setSubtitleReady(true);
    }, heroTailDelayMs(isMobile));
    return () => clearTimeout(t);
  }, [headingReady, skipIntro]);

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
    // Tick 0 holds until the entrance choreography ("Future" lands ~3.6 s) is
    // done, so the first face isn't swapped out mid-reveal.
    const delay = headingTick === 0 ? 3700 : 1500;
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

        <div className="pointer-events-none absolute left-[var(--section-px-wide)] top-1/2 z-10 -translate-y-1/2 max-md:!left-1/2 max-md:!top-[5vh] max-md:!-translate-x-1/2 max-md:!translate-y-0">
          <motion.span
            style={{ opacity: labelOpacity, y: labelY }}
            className="block font-['Poppins',_sans-serif] text-[min(1.4vw,2.15vh)] font-medium tracking-[0.2em] text-white/70 max-md:!text-[18px]"
          >
            FOUNDER-FIRST
          </motion.span>
        </div>
        <div className="pointer-events-none absolute right-[var(--section-px-wide)] top-1/2 z-10 -translate-y-1/2 max-md:!right-auto max-md:!left-1/2 max-md:!top-auto max-md:!bottom-[5vh] max-md:!-translate-x-1/2 max-md:!translate-y-0">
          <motion.span
            style={{ opacity: labelOpacity, y: labelY }}
            className="block font-['Poppins',_sans-serif] text-[min(1.4vw,2.15vh)] font-medium tracking-[0.2em] text-white/70 max-md:!text-[18px]"
          >
            OPERATOR-LED
          </motion.span>
        </div>

        {/* Positioning stays on this plain wrapper. Framer writes an inline
            `transform` for `y`, which would otherwise clobber the Tailwind
            `-translate-x-1/2` that centres this and knock it off-axis. */}
        <div className="pointer-events-none absolute bottom-[8vh] left-1/2 z-10 -translate-x-1/2 max-md:!hidden">
          <motion.p
            style={{ maxWidth: "min(60vw, 1000px)", ...HERO_BODY_STYLE }}
            className={`m-0 text-center text-white/90 ${HERO_BODY_CLASS}`}
            initial={false}
            animate={{
              opacity: subtitleReady ? 1 : 0,
              y: subtitleReady ? 0 : TAIL_RISE_PX,
            }}
            transition={TAIL_TRANSITION}
          >
            {subtitle}
          </motion.p>
        </div>

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
              initial={{ opacity: 0, y: "80vh" }}
              animate={{ opacity: 1, y: "0vh" }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Every founder is mounted ONCE and stays mounted; the flicker is
                  a pure opacity swap. Mounting/unmounting per tick used to start
                  the image download only at the moment it had to be on screen —
                  at 200 ms/tick a cold image never arrived in time and the card
                  flashed empty. Keeping them mounted also lets the browser fetch
                  the whole set during the 1.05 s pre-roll. */}
              <div className="absolute inset-0" style={{ background: CARD_BG }}>
                {slideshowFounders.map((sf, i) => (
                  <div
                    key={sf.image}
                    className="absolute inset-0"
                    style={{
                      opacity: i === slideIndex ? 1 : 0,
                      transform: `scale(${clampScale(sf.squareScaleFactor)}) translate(${sf.squarePositionX ?? 0}px, ${sf.squarePositionY ?? 0}px)`,
                      transformOrigin: "center center",
                      willChange: "opacity",
                    }}
                  >
                    <Image
                      src={heroImageSrc(sf.image, 600)}
                      alt={sf.name}
                      fill
                      sizes={SLIDESHOW_SIZES}
                      priority
                      style={{ objectFit: "cover", objectPosition: "center center", filter: "grayscale(0.9)" }}
                    />
                  </div>
                ))}
              </div>
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
          className="absolute inset-0 z-20 flex items-center justify-center px-[var(--section-px-wide)] max-md:!px-[24px] max-md:!items-start max-md:!pt-[clamp(100px,16dvh,150px)]"
        >
          <div className="relative flex flex-col items-center md:-translate-y-[8vh]">
            
            <h1
              className={`pointer-events-none m-0 hidden md:flex flex-col items-start text-left text-white ${HERO_HEADING_DARK_CLASS}`}
              style={{ ...HERO_HEADING_DARK_STYLE, gap: "min(0.2vw, 0.4vh)" }}
            >
              <RevealLine show={headingReady} delay={0}>Backing</RevealLine>
              <RevealLine show={headingReady} delay={0.5}>Founders Building</RevealLine>
              <span
                className="flex items-start justify-start self-end"
                style={{ gap: "min(0.8vw, 1.4vh)", marginRight: "min(6vw, 9vh)" }}
              >
                <RevealLine show={headingReady} delay={1.25}>The</RevealLine>
                <span
                  ref={slotRef}
                  className="relative inline-block shrink-0 overflow-hidden"
                  style={{
                    width: SLOT_W,
                    height: "1.5em",
                    borderRadius: "2px",
                  }}
                >
                  <HeadingPhoto founders={allFounders} activeIndex={headingTick} show={headingReady} enterDelay={2.1} />
                </span>
                <RevealLine show={headingReady} delay={FINAL_WORD_DELAY.desktop}>{FINAL_WORD}</RevealLine>
              </span>
            </h1>

            {/* Mobile-only twin of the heading above — the words break
                differently here and the photo slot moves below the text, so it
                has to be its own element. Size comes from the same level-1
                token; only the `max-md:` half of it ever applies, since this is
                `md:hidden`. */}
            <h1
              className={`pointer-events-none m-0 flex md:hidden flex-col items-center text-center text-white ${HERO_HEADING_DARK_CLASS}`}
            >
              <RevealLine show={headingReady} delay={0}>Backing</RevealLine>
              <RevealLine show={headingReady} delay={0.3}>Founders</RevealLine>
              <RevealLine show={headingReady} delay={0.6}>Building</RevealLine>
              <span className="inline-flex gap-[0.3em]">
                <RevealLine show={headingReady} delay={0.9}>The</RevealLine>
                <RevealLine show={headingReady} delay={FINAL_WORD_DELAY.mobile}>{FINAL_WORD}</RevealLine>
              </span>

              <span
                className="relative inline-block shrink-0 overflow-hidden mt-[clamp(12px,2.5dvh,20px)]"
                style={{ width: "min(50vw, 210px)", height: "min(31.95vw, 134px)", borderRadius: "2px" }}
                ref={mobileSlotRef}
              >
                <HeadingPhoto founders={allFounders} activeIndex={headingTick} show={headingReady} enterDelay={1.5} mobile />
              </span>
            </h1>

            {/* Same split as the description above: this wrapper owns the
                positioning (including `-translate-x-1/2`), the motion child
                owns the transform. */}
            <div className="absolute left-1/2 top-full -translate-x-1/2 mt-[min(4.63vw,7.16vh)] max-md:!static max-md:!translate-x-0 max-md:!mt-[clamp(32px,6dvh,52px)] max-md:!w-full">
            <motion.div
              className="flex flex-col items-center"
              initial={false}
              animate={{
                opacity: uiReady ? 1 : 0,
                y: uiReady ? 0 : TAIL_RISE_PX,
              }}
              transition={TAIL_TRANSITION}
            >
              <div
                className="pointer-events-auto flex items-center justify-center gap-[min(2.31vw,3.58vh)] max-md:!gap-[clamp(12px,4vw,24px)]"
              >
                <Link
                  href="/portfolio"
                  className="group relative whitespace-nowrap font-['Poppins',_sans-serif] font-normal text-white"
                  style={{ ...LABEL_STYLE, lineHeight: "140%" }}
                >
                  View Portfolio
                  <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-white transition-all duration-300 ease-out group-hover:w-full" />
                </Link>
                <CursorFillButton href="/getinvestment" label="Get Investment" />
              </div>
              <motion.p
                className={`hidden max-md:!block mt-[clamp(32px,6dvh,52px)] w-[75vw] text-center text-white/90 ${HERO_BODY_CLASS}`}
                style={HERO_BODY_STYLE}
                initial={false}
                animate={{ opacity: subtitleReady ? 1 : 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                {subtitle}
              </motion.p>
            </motion.div>
            </div>

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
      className="relative flex items-center justify-center whitespace-nowrap font-['Poppins',_sans-serif] font-normal transition-colors duration-300 max-md:!w-[clamp(130px,35vw,150px)] max-md:!h-[clamp(38px,6dvh,44px)]"
      style={{
        ...LABEL_STYLE,
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

/**
 * Rotating photo inside the heading slot.
 *
 * Every founder is mounted once and never unmounted; only `opacity` changes.
 * The previous version keyed a `motion.div` on `tick` inside `AnimatePresence`
 * with `exit={{ opacity: 1 }}` — a no-op exit target that framer never resolves
 * as "finished", so exiting nodes piled up (13 stacked `<img>`s measured) and
 * each new tick started its image download only at the instant it had to be
 * visible. Both effects showed up as flashes of empty card.
 *
 * The container does the one-time slide-up; the crossfade is composited.
 */
function HeadingPhoto({
  founders,
  activeIndex,
  show,
  enterDelay = 1.25,
  mobile = false,
}: {
  founders: HeroFounder[];
  activeIndex: number;
  show: boolean;
  /** Delay (s) before the slot slides up into place. */
  enterDelay?: number;
  mobile?: boolean;
}) {
  const active = ((activeIndex % founders.length) + founders.length) % founders.length;

  return (
    <motion.div
      className="absolute inset-0"
      style={{ background: CARD_BG }}
      initial={{ y: "100%" }}
      animate={{ y: show ? "0%" : "100%" }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: enterDelay }}
    >
      {founders.map((f, i) => (
        <div
          key={f.image}
          className="absolute inset-0"
          style={{
            opacity: i === active ? 1 : 0,
            transition: "opacity 1s cubic-bezier(0.22, 1, 0.36, 1)",
            willChange: "opacity",
          }}
        >
          <div
            className="absolute inset-0"
            style={mobile ? undefined : {
              transform: `scale(${clampScale(f.scaleFactor)}) translate(${f.positionX ?? 0}px, ${f.positionY ?? 0}px)`,
              transformOrigin: "center center",
            }}
          >
            <Image
              src={heroImageSrc(f.image, 600)}
              alt={f.name}
              fill
              sizes={HEADING_SIZES}
              priority
              style={mobile
                ? { objectFit: f.isLogo ? "contain" : "cover", objectPosition: f.isLogo ? "center center" : "top center" }
                : { ...IMG_STYLE, objectFit: f.isLogo ? "contain" : "scale-down", objectPosition: "center center" }
              }
            />
          </div>
        </div>
      ))}
      {/* Rendered once for the whole stack — re-mounting the SVG turbulence
          filter on every tick forced a filter re-rasterise mid-crossfade. */}
      <GrainOverlay opacity={0.18} />
    </motion.div>
  );
}

const CHAR_STAGGER = 0.025;
/** Per-character flip duration inside RevealLine. */
const REVEAL_DURATION = 0.7;

/**
 * When the hero's final word has *finished* revealing, in ms after
 * `headingReady` — the moment the description and CTAs are allowed in.
 *
 * RevealLine animates each character on its own timeline, so the word is only
 * done once its LAST character lands:
 *
 *     start + (chars - 1) * CHAR_STAGGER + REVEAL_DURATION
 *
 * Deriving it here rather than hard-coding a number is the whole point: tweak
 * the stagger, the duration, or the word itself and this stays correct.
 */
function heroTailDelayMs(isMobile: boolean): number {
  const start = isMobile ? FINAL_WORD_DELAY.mobile : FINAL_WORD_DELAY.desktop;
  const finish =
    start + (FINAL_WORD.length - 1) * CHAR_STAGGER + REVEAL_DURATION;
  return Math.round(finish * 1000);
}
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
            duration: REVEAL_DURATION,
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