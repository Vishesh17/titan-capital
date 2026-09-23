"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import RichText, { type RichTextValue } from "@/components/ui/RichText";
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
  "We partner with entrepreneurs from day one. We bring conviction, not just capital, and stay by their side through every stage of their journey.";

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

/* Photos we don't have a name for get a "Founder 12" placeholder, which is
   useless in an alt — those fall back to the plain brand line instead. */
function founderAlt(name: string): string {
  const n = name.trim();
  if (!n || /^Founder \d+$/.test(n)) return "Titan Capital founder";
  if (n === "Titan Capital") return "Titan Capital logo"; // the logo card in the marquee
  return `Titan Capital - ${n}`;
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
const SLIDESHOW_SIZES = "(max-width: 768px) 20vw, 8vw";
const HEADING_SIZES = "(max-width: 768px) 50vw, 24vw";
const MOBILE_QUERY = "(max-width: 767px)";
const FINAL_WORD = "Future";
const FINAL_WORD_DELAY = { desktop: 2.2, mobile: 1.2 } as const;
const TAIL_RISE_PX = 48;
const TAIL_TRANSITION = {
  duration: 1.1,
  ease: cubicBezier(0.22, 1, 0.36, 1),
};

function computeDims(w: number, h: number) {
  const isMobile = w < 768;
  const cardW = Math.round(isMobile ? w * 0.20 : Math.min(0.072 * w, 0.115 * h));
  const cardH = cardW;
  return {
    isMobile,
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
          // PERFORMANCE FIX: Added translateZ(0) to force GPU hardware acceleration on heavy blurred nodes
          style={{ background: "radial-gradient(circle, #5054B5 0%, #054EB6 40%, #022250 80%, transparent 100%)", opacity: 0.6, transform: "translateZ(0)", WebkitTransform: "translateZ(0)" }}
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
          // PERFORMANCE FIX: Added translateZ(0)
          style={{ background: "radial-gradient(circle, #AC71C6 0%, #033699 50%, #001A4D 80%, transparent 100%)", opacity: 0.5, transform: "translateZ(0)", WebkitTransform: "translateZ(0)" }}
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
export default function HeroClient({
  data,
  backedBefore,
}: {
  data?: HeroData | null;
  /** The Backed Before section, handed in from the server wrapper so this
   *  client component can render it inside its own section — see the note
   *  where it is placed. A ReactNode rather than an import because
   *  BackedBefore is a server component that does its own Sanity fetch. */
  backedBefore?: ReactNode;
}) {
  const subtitle = data?.subtitle || FALLBACK_SUBTITLE;
  const founders: HeroFounder[] = (() => {
    if (data?.founders && data.founders.length > 0) {
      return data.founders.slice(0, 9);
    }
    return FALLBACK_FOUNDERS;
  })();

  const allFounders: HeroFounder[] =
    data?.allFounders && data.allFounders.length > 0
      ? data.allFounders
      : ALL_FOUNDERS;

  const heroIndex = (() => {
    const idx = founders.findIndex(f => f.isLogo || f.name.includes("Titan"));
    return idx !== -1 ? idx : Math.ceil((founders.length - 1) / 2);
  })();

  const [skipIntro] = useState(() => hasAppMounted());
  const [ready, setReady] = useState(false);
  
  const progress = useMotionValue(skipIntro ? 1 : 0);
  const [stage, setStage] = useState<"slideshow" | "animate">(
    skipIntro ? "animate" : "slideshow"
  );

  const slideshowFounders = allFounders;
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (stage !== "slideshow" || !ready) return;
    let count = 0;
    const totalTicks = slideshowFounders.length;
    let id: ReturnType<typeof setInterval> | undefined;
    
    const startTimer = setTimeout(() => {
      id = setInterval(() => {
        count += 1;
        if (count >= totalTicks) {
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

      /* READY IS NO LONGER GATED ON THE SLOT.
         It used to be set at the very bottom, below the `if (!el)` return —
         so it only ever fired because the heading photo existed to be
         measured. With that rectangle commented out of both headings the refs
         are always empty, the early return always taken, `ready` never true,
         and the hero sits blank forever: no intro, no heading, no CTA.
         Hoisted above the measurement, which is the only thing that actually
         needed an element. */
      setReady(true);

      const isMobile = winW < 768;
      const el = isMobile ? mobileSlotRef.current : slotRef.current;
      const sectionEl = sectionRef.current;

      // Dormant while the rectangle is out; restores itself with it.
      if (!el || !sectionEl) return;

      const sRect = el.getBoundingClientRect();
      const cRect = sectionEl.getBoundingClientRect();

      setSlot({
        cx: (sRect.left + sRect.width / 2) - (cRect.left + cRect.width / 2),
        cy: (sRect.top + sRect.height / 2) - (cRect.top + cRect.height / 2),
        w: sRect.width,
        h: sRect.height,
      });
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
  const sideLabelsOpacityDesktop = useTransform(progress, [0.44, 0.52], [1, 0]);
  const sideLabelsOpacityMobile = useTransform(progress, [0.15, 0.28], [1, 0]);
  const sideLabelsOpacity = dims.isMobile
    ? sideLabelsOpacityMobile
    : sideLabelsOpacityDesktop;

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

  const [headingReady, setHeadingReady] = useState(skipIntro);
  const [uiReady, setUiReady] = useState(skipIntro);
  const [subtitleReady, setSubtitleReady] = useState(skipIntro);
  /* Held at 0 while the heading rectangle is commented out — the timer that
     advanced it is disabled below, and only that photo ever read it. */
  const [headingTick, setHeadingTick] = useState(0);

  useEffect(() => {
    if (ready && !skipIntro) document.body.classList.add("hero-hide-nav");
  }, [ready, skipIntro]);

  useEffect(() => {
    if (!headingReady) return;
    document.body.classList.remove("hero-hide-nav");
    if (skipIntro) return;

    const isMobile = window.matchMedia(MOBILE_QUERY).matches;
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

  /* THE HEADING-PHOTO TIMER — REMOVED with the rectangle it advanced.
     Nothing reads `headingTick` any more, so left in it would re-render the
     whole hero every 1.5s forever just to increment a number no one looks at.
     Uncomment together with the two <span> blocks in the headings below. */
  // useEffect(() => {
  //   if (!headingReady || !heroInView) return;
  //   const delay = headingTick === 0 ? 3700 : 1500;
  //   const timer = setTimeout(() => {
  //     setHeadingTick((t) => t + 1);
  //   }, delay);
  //   return () => clearTimeout(timer);
  // }, [headingReady, heroInView, headingTick]);

  return (
    /* BACKED BEFORE LIVES IN HERE NOW, as the last child of this section
       rather than as a sibling laid out by HeroBackedBg. That is the whole
       reason the two finally share one background: there is no seam between
       them to paint differently, because there is no longer a boundary — the
       navy and the glow below belong to this section and run behind both.

       `h-full`, not `h-screen`: HeroBackedBg hands this section the whole
       first screen and it fills it, then splits it between the hero body
       (flex-1) and the marquees (shrink-0). */
    <section ref={sectionRef} className="relative flex h-full w-full flex-col overflow-hidden max-md:overflow-x-hidden max-md:w-[100vw] max-md:ml-[calc(50%-50vw)] max-md:bg-[#00112E]">
      {/* THE GLOW IS AT SECTION LEVEL, not inside the hero body. Left where it
          was it would have stopped dead at the marquees' top edge, drawing
          exactly the boundary this change exists to remove. Out here it washes
          continuously behind the headline and the logos alike. */}
      <HeroGlow />

      <div
        className="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden"
        style={{ background: "transparent" }}
      >

        <div className="pointer-events-none absolute left-[var(--section-px-wide)] top-1/2 z-10 -translate-y-1/2 max-md:!left-1/2 max-md:!top-[6dvh] max-md:!-translate-x-1/2 max-md:!translate-y-0">
          <motion.span
            style={{ opacity: labelOpacity, y: labelY }}
            className="block font-['Poppins',_sans-serif] text-[min(1.4vw,2.15vh)] font-medium tracking-[0.2em] text-white/70 max-md:!text-[18px]"
          >
            FOUNDER-FIRST
          </motion.span>
        </div>
        <div className="pointer-events-none absolute right-[var(--section-px-wide)] top-1/2 z-10 -translate-y-1/2 max-md:!right-auto max-md:!left-1/2 max-md:!top-auto max-md:!bottom-[7dvh] max-md:!-translate-x-1/2 max-md:!translate-y-0">
          <motion.span
            style={{ opacity: labelOpacity, y: labelY }}
            className="block font-['Poppins',_sans-serif] text-[min(1.4vw,2.15vh)] font-medium tracking-[0.2em] text-white/70 max-md:!text-[18px]"
          >
            OPERATOR-LED
          </motion.span>
        </div>

        {/* THE DESKTOP SUBTITLE USED TO LIVE HERE, pinned to the hero's floor
            at `bottom-[8vh]` and independent of everything above it. That
            worked while the hero owned a whole viewport and there were ~300px
            of empty navy between the buttons and the bottom of the screen.
            Now that the hero is only the part of the screen Backed Before
            does not need, the two ran into each other: measured at 1440x900
            the buttons sat at 569-593 and this block at 525-589, a 20px
            overlap. Moving it into the flow under the buttons — where the
            mobile layout has always had it — makes the stack size itself, so
            it cannot collide at any viewport rather than being tuned not to
            at one. See the block below the headings. */}
        {/* <div className="pointer-events-none absolute bottom-[8vh] left-1/2 z-10 -translate-x-1/2 max-md:!hidden">
          <motion.div
            style={{ maxWidth: "min(60vw, 1000px)", ...HERO_BODY_STYLE }}
            className={`font-normal m-0 text-center text-white/90 ${HERO_BODY_CLASS}`}
            initial={false}
            animate={{
              opacity: subtitleReady ? 1 : 0,
              y: subtitleReady ? 0 : TAIL_RISE_PX,
            }}
            transition={TAIL_TRANSITION}
          >
            <RichText value={subtitle} />
          </motion.div>
        </div> */}

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
              <div className="absolute inset-0" style={{ background: CARD_BG }}>
                {slideshowFounders.map((sf, i) => (
                  <div
                    key={sf.image}
                    className="absolute"
                    style={{
                      inset: "-1px",
                      opacity: i === slideIndex ? 1 : 0,
                      transform: `scale(${clampScale(sf.squareScaleFactor)}) translate(${sf.squarePositionX ?? 0}px, ${sf.squarePositionY ?? 0}px)`,
                      transformOrigin: "center center",
                      // FLICKER FIX: Reduced transition length from 1s to 0.2s so the browser doesn't try to crossfade 5 images simultaneously
                      transition: "opacity 0.2s ease-in-out",
                      willChange: "opacity",
                    }}
                  >
                    <Image
                      src={heroImageSrc(sf.image, 600)}
                      alt={founderAlt(sf.name)}
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

        {/* FLICKER FIX: Keep mounted in DOM to prevent flash, but keep completely invisible 
            until the slideshow is finished so it doesn't ruin the entrance animation. */}
        <div 
          className="absolute inset-0 z-10 pointer-events-none max-md:!z-30"
          style={{ 
            opacity: stage === "animate" ? 1 : 0,
            visibility: stage === "animate" ? "visible" : "hidden"
          }}
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
            />
          ))}
        </div>
        <motion.div
          style={{ opacity: headingOpacity }}
          /* `md:pt-[var(--nav-height)]` — the navbar is fixed and paints over
             the top of the hero, so centring against the full box centres
             against a strip the reader cannot see. It did not matter while
             the hero was a whole viewport and the stack had ~300px of slack;
             in a 620px hero the headline came out at y=54 under a 65px navbar
             and was clipped by it. Padding the top by the nav's own height
             centres the stack in the part of the hero that is actually
             visible, and it follows the navbar if that ever resizes.
             Mobile already did this, via the pt below. */
          className="absolute inset-0 z-20 flex items-center justify-center px-[var(--section-px-wide)] md:pt-[var(--nav-height,65px)] max-md:!px-[24px] max-md:!items-start max-md:!pt-[clamp(85px,12dvh,120px)]"
        >
          {/* No upward nudge any more. `md:-translate-y-[8vh]` was here to
              compensate for the buttons and subtitle hanging out of the
              layout — the stack looked bottom-heavy because centring only
              ever saw the headline. Now that all three are in the flow there
              is nothing to compensate for, and a translate would just push a
              correctly centred block off centre. */}
          <div className="relative flex flex-col items-center">
            
            <h1
              className={`pointer-events-none m-0 hidden md:flex flex-col items-start text-left text-white ${HERO_HEADING_DARK_CLASS}`}
              style={{ ...HERO_HEADING_DARK_STYLE, gap: "min(0.2vw, 0.4vh)" }}
            >
              <RevealLine show={headingReady} delay={0}>Backing</RevealLine>
              <RevealLine show={headingReady} delay={0.5}>Founders Building</RevealLine>
              <span
                className="flex items-start justify-start self-end"
                /* 0.18em, not the old min(0.8vw, 1.4vh). That value was the
                   breathing room either side of the heading rectangle; with
                   the rectangle gone it is all that separates THE from
                   FUTURE, and at 81px it measured 11px against a real Poppins
                   space of 14px — visibly tight. An em tracks the font, so the
                   word space holds at every viewport instead of drifting
                   against a vw the type no longer follows. */
                style={{ gap: "0.18em", marginRight: "min(6vw, 9vh)" }}
              >
                <RevealLine show={headingReady} delay={1.25}>The</RevealLine>
                {/* THE THIRD-LINE RECTANGLE — REMOVED.
                    The rotating founder photo that sat between "THE" and
                    "FUTURE". It was also what made this line 205px tall
                    against the other two at 118px, so taking it out is most
                    of why the hero now fits alongside Backed Before.
                    Uncomment, plus the mobile twin and the headingTick timer
                    further up, to put it back. */}
                {/* <span
                  ref={slotRef}
                  className="relative inline-block shrink-0 overflow-hidden"
                  style={{
                    width: SLOT_W,
                    height: "1.5em",
                    borderRadius: "2px",
                  }}
                >
                  <HeadingPhoto founders={allFounders} activeIndex={headingTick} show={headingReady} enterDelay={2.1} />
                </span> */}
                <RevealLine show={headingReady} delay={FINAL_WORD_DELAY.desktop}>{FINAL_WORD}</RevealLine>
              </span>
            </h1>

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

              {/* The mobile twin of the third-line rectangle — REMOVED with it.
                  Kept in step with desktop on purpose: leaving the photo on
                  phones only would make the two headings different objects,
                  and it is ~134px of the height the hero has to give back for
                  Backed Before to land on the same screen. */}
              {/* <span
                className="relative inline-block shrink-0 overflow-hidden mt-[clamp(12px,2.5dvh,20px)]"
                style={{ width: "min(50vw, 210px)", height: "min(31.95vw, 134px)", borderRadius: "2px" }}
                ref={mobileSlotRef}
              >
                <HeadingPhoto founders={allFounders} activeIndex={headingTick} show={headingReady} enterDelay={1.5} mobile />
              </span> */}
            </h1>

           {/* IN THE FLOW ON DESKTOP TOO, not `absolute top-full`.
               Mobile was already `static` here; desktop hung this block out
               of the layout so the headline alone decided where the centred
               stack sat, and a -8vh nudge on the parent bought back room for
               it by eye. With a shorter hero that stops working — an absolute
               child contributes no height, so nothing downstream knows the
               buttons and subtitle are there, and they simply run past the
               hero's floor into Backed Before. Flowed, the stack measures
               itself and `items-center` on the parent centres all of it. */}
           <div className="mt-[min(2.6vw,4vh)] w-full max-md:!mt-[clamp(24px,4dvh,40px)]">
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
              {/* THE SUBTITLE, now on both breakpoints — this was the mobile
                  one; the desktop copy that used to be pinned to the hero's
                  floor is commented out above. The widths differ because the
                  jobs differ: a phone wants nearly the full width, a desktop
                  wants a measure short enough to read, which is the
                  min(60vw, 1000px) the old block carried. */}
              <motion.div
                className={`font-normal mt-[min(1.6vw,2.4vh)] max-w-[min(60vw,1000px)] text-center text-white/90 max-md:!mt-[clamp(24px,4dvh,40px)] max-md:!w-[85vw] max-md:!max-w-none ${HERO_BODY_CLASS}`}
                style={HERO_BODY_STYLE}
                initial={false}
                animate={{ opacity: subtitleReady ? 1 : 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <RichText value={subtitle} />
              </motion.div>
            </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── BACKED BEFORE ──
          IT HAS NO HEIGHT UNTIL THE INTRO IS OVER, which is what gives the
          opening animation the whole page to play in. During the slideshow
          and the card sequence this collapses to 0 and `flex-1` above takes
          the entire viewport, exactly as the hero did before the marquees
          moved in; when the tail lands the height opens to `auto` and the
          hero body gives up the space smoothly rather than the logos
          appearing on top of a layout that never moved.

          `uiReady` is the gate because it is the LAST thing the intro sets —
          the buttons and subtitle land on the same timer — so this cannot
          arrive while anything above is still animating.

          `initial={false}` matters on a soft navigation back to the home
          page: `skipIntro` starts every one of those flags true, and without
          it framer would still play the 0 -> auto open on arrival. */}
      {backedBefore && (
        <motion.div
          className="w-full shrink-0 overflow-hidden"
          initial={false}
          animate={{ height: uiReady ? "auto" : 0, opacity: uiReady ? 1 : 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {backedBefore}
        </motion.div>
      )}
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
              alt={founderAlt(f.name)}
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
      <GrainOverlay opacity={0.18} />
    </motion.div>
  );
}

const CHAR_STAGGER = 0.025;
const REVEAL_DURATION = 0.7;

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
          alt={founderAlt(founder.name)}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          // PERFORMANCE FIX: Moved filter down to the static Image component to stop GPU layer composite thrashing 
          style={{
            objectFit: founder.isLogo ? "contain" : "cover",
            objectPosition: "center center",
            filter: founder.isLogo ? "none" : "grayscale(0.9)",
          }}
        />
      </div>
    </motion.div>
  );
}