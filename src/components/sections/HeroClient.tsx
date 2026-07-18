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
  easeInOut,
  type MotionValue,
} from "framer-motion";

/* ─────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────── */
export interface HeroFounder {
  name: string;
  role: string;
  image: string;
}

export interface HeroSlot {
  size: string;
  pool: HeroFounder[];
}

export interface HeroData {
  titleLine1?: string;
  titleLine2Before?: string;
  titleLine2Emphasis?: string;
  subtitle?: string;
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
  founderSlots?: HeroSlot[];
}

/* ─────────────────────────────────────────────────────────
   Fallback data
   ───────────────────────────────────────────────────────── */
const FALLBACK_FOUNDERS: HeroFounder[] = [
  { name: "Ghazal Alagh", role: "Co-Founder, Mamaearth", image: "/images/hero_founders_images/ghazal-alagh.png" },
  { name: "Abhiraj Singh Bhal", role: "Co-Founder, Urban Company", image: "/images/hero_founders_images/abhiraj_bahl.png" },
  { name: "Ashutosh Valani", role: "Co-Founder, RENÉE Cosmetics", image: "/images/hero_founders_images/ashutosh-valani.png" },
  { name: "Abhishek Bansal", role: "Co-Founder, Shadowfax", image: "/images/hero_founders_images/abhishek-bansal.png" },
  { name: "Ruchi Kalra", role: "Co-Founder, Ofbusiness", image: "/images/hero_founders_images/ruchi-kalra.png" },
  { name: "Varun Khaitan", role: "Co-Founder, Urban Company", image: "/images/hero_founders_images/varun-khaitan.png" },
  { name: "Ishendra Agarwal", role: "Co-Founder, GIVA", image: "/images/hero_founders_images/ishendra-agarwal.png" },
  { name: "Anand Agrawal", role: "Co-Founder, Credgenics", image: "/images/hero_founders_images/anand-agarwal.png" },
];

const FALLBACK_SUBTITLE =
  "We partner with entrepreneurs from day one. We invest conviction, not just capital, and stay by their side through every stage of their journey.";

function heroImageSrc(url: string, width: number): string {
  if (url.startsWith("https://cdn.sanity.io/")) {
    return `${url}?w=${width}&auto=format&q=85`;
  }
  return url;
}

/* Portrait photo slot (spans the ENDURING / IMPACT rows). Kept in one
   place so the heading placeholder and the fallback card target agree. */
const SLOT_W = "min(23.1vw, 35.8vh)";   // ~399 px @ ref — LANDSCAPE
/* Slot HEIGHT is no longer fixed — the slot stretches to the exact height
   of the ENDURING/IMPACT text column (items-stretch + em trims), so the
   photo always spans precisely from the top of ENDURING to the bottom of
   IMPACT at any viewport. The flight target uses the measured rect. */

/* ─────────────────────────────────────────────────────────
   Viewport-derived px dims for the stack / line stages. Mirrors
   the CSS min(vw,vh) tokens; FALLBACK for SSR + first render.
   ───────────────────────────────────────────────────────── */
function computeDims(w: number, h: number) {
  const isMobile = w < 768;
  const cardW = isMobile
    ? w * 0.38  // ~148px on 390px screen
    : Math.min(0.072 * w, 0.115 * h);
  const cardH = cardW; // SQUARE cards for the slideshow + shuffle
  return {
    cardW,
    cardH,
    deckPeek: cardH * 0.17,
    filmStep: cardH * (isMobile ? 1.08 : 1.14),
  };
}
const FALLBACK_DIMS = computeDims(1728, 1117);
type Dims = ReturnType<typeof computeDims>;

/* Where the hero card lands, measured from the real heading photo slot,
   relative to the SCREEN CENTRE (the card's x:0/y:0 origin). */
interface Slot {
  cx: number;
  cy: number;
  w: number;
  h: number;
}
const FALLBACK_SLOT: Slot = { cx: 0, cy: 0, w: 145, h: 207 };

/* feFuncA discrete grain table (50 ones + 50 zeros) from the Figma
   export — the coarse noise texture inside the blobs. */
const GRAIN =
  "1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ";

/* Both hero glows — the EXACT Figma SVG ellipses (blur + fractal-noise
   grain), each wrapped in a drifting motion.div so they slowly wander,
   like the Indicorn section. */
function HeroGlow() {
  return (
    <>
      {/* LEFT blob — #022250 → #054EB6 → #5054B5 */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute"
        style={{ left: "-16%", top: "-12%", width: "min(72vw, 112vh)", zIndex: 0 }}
        animate={{
          x: ["-20%", "80%", "20%", "60%", "-20%"],
          y: ["-20%", "40%", "60%", "10%", "-20%"],
          scale: [1, 1.2, 0.88, 1.12, 1],
          rotate: [0, 16, -10, 7, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
      >
        <svg viewBox="0 0 836 1113" fill="none" className="h-auto w-full" style={{ overflow: "visible" }}>
          <g filter="url(#hero_glow_l_f)">
            <ellipse
              cx="350.252"
              cy="360.273"
              rx="350.252"
              ry="360.273"
              transform="matrix(-0.412381 0.911012 -0.918704 -0.394948 683.844 325.254)"
              fill="url(#hero_glow_l_g)"
            />
          </g>
          <defs>
            <filter id="hero_glow_l_f" x="-352.797" y="-47.4102" width="1122.44" height="1098.92" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="100" result="effect1_foregroundBlur" />
              <feTurbulence type="fractalNoise" baseFrequency="2 2" stitchTiles="stitch" numOctaves={3} result="noise" seed={5393} />
              <feColorMatrix in="noise" type="luminanceToAlpha" result="alphaNoise" />
              <feComponentTransfer in="alphaNoise" result="coloredNoise1">
                <feFuncA type="discrete" tableValues={GRAIN} />
              </feComponentTransfer>
              <feComposite operator="in" in2="effect1_foregroundBlur" in="coloredNoise1" result="noise1Clipped" />
              <feFlood floodColor="rgba(0, 0, 0, 0.25)" result="color1Flood" />
              <feComposite operator="in" in2="noise1Clipped" in="color1Flood" result="color1" />
              <feMerge result="effect2_noise">
                <feMergeNode in="effect1_foregroundBlur" />
                <feMergeNode in="color1" />
              </feMerge>
            </filter>
            <linearGradient id="hero_glow_l_g" x1="350.252" y1="0" x2="894.384" y2="321.126" gradientUnits="userSpaceOnUse">
              <stop offset="0.0199933" stopColor="#022250" />
              <stop offset="0.482966" stopColor="#054EB6" />
              <stop offset="0.653846" stopColor="#5054B5" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* RIGHT blob — #001A4D → #033699 → #AC71C6 */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute"
        style={{ right: "-14%", bottom: "-14%", width: "min(66vw, 100vh)", zIndex: 0 }}
        animate={{
          x: ["20%", "-70%", "-15%", "-50%", "20%"],
          y: ["20%", "-42%", "-58%", "-12%", "20%"],
          scale: [1, 1.2, 0.88, 1.12, 1],
          rotate: [0, -16, 10, -7, 0],
        }}
        transition={{ duration: 21, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
      >
        <svg viewBox="0 0 825 906" fill="none" className="h-auto w-full" style={{ overflow: "visible" }}>
          <g filter="url(#hero_glow_r_f)">
            <ellipse cx="528.5" cy="390" rx="328.5" ry="316" fill="url(#hero_glow_r_g)" />
          </g>
          <defs>
            <filter id="hero_glow_r_f" x="0" y="-126" width="1057" height="1032" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="100" result="effect1_foregroundBlur" />
              <feTurbulence type="fractalNoise" baseFrequency="2 2" stitchTiles="stitch" numOctaves={3} result="noise" seed={5393} />
              <feColorMatrix in="noise" type="luminanceToAlpha" result="alphaNoise" />
              <feComponentTransfer in="alphaNoise" result="coloredNoise1">
                <feFuncA type="discrete" tableValues={GRAIN} />
              </feComponentTransfer>
              <feComposite operator="in" in2="effect1_foregroundBlur" in="coloredNoise1" result="noise1Clipped" />
              <feFlood floodColor="rgba(0, 0, 0, 0.25)" result="color1Flood" />
              <feComposite operator="in" in2="noise1Clipped" in="color1Flood" result="color1" />
              <feMerge result="effect2_noise">
                <feMergeNode in="effect1_foregroundBlur" />
                <feMergeNode in="color1" />
              </feMerge>
            </filter>
            <linearGradient id="hero_glow_r_g" x1="528.5" y1="74" x2="159.589" y2="703.982" gradientUnits="userSpaceOnUse">
              <stop offset="0.217633" stopColor="#001A4D" />
              <stop offset="0.553059" stopColor="#033699" />
              <stop offset="0.894231" stopColor="#AC71C6" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────
   Hero — self-playing intro (cappen-style): slideshow → the
   others fan into a downward deck behind the centred hero →
   they open into a vertical filmstrip → the hero flies into the
   heading slot (FOR ▢ ENDURING/IMPACT) and colours up.
   ───────────────────────────────────────────────────────── */
export default function HeroClient({ data }: { data?: HeroData | null }) {
  const subtitle = data?.subtitle || FALLBACK_SUBTITLE;
  const founders: HeroFounder[] = (() => {
    if (data?.founderSlots && data.founderSlots.length > 0) {
      return data.founderSlots.flatMap((s) => s.pool).slice(0, 8);
    }
    return FALLBACK_FOUNDERS;
  })();

  /* The featured founder — the card whose INVERTED strip slot lands
     nearest the screen centre, so its "come forward" move to the heading
     slot is the shortest, calmest path. (The fan inverts order: card k
     ends at strip slot N−1−k.) */
  const heroIndex = Math.ceil((founders.length - 1) / 2);

  /* Gate the whole card cluster until dims are measured, so the first
     frame never paints at the SSR fallback size and then resize-jumps
     ("a bigger card once at the start"). */
  const [ready, setReady] = useState(false);

  const progress = useMotionValue(0);

  /* Intro has two stages:
       1. "slideshow" — a single centred card flips through EVERY founder
          photo once, settling on the hero.
       2. "animate"   — the deck → filmstrip → hero-lands timeline plays
          (driven by `progress`). */
  const [stage, setStage] = useState<"slideshow" | "animate">("slideshow");
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (stage !== "slideshow" || !ready) return;
    /* Flip through EVERY founder photo TWICE (fast), then SETTLE on
       founders[0] — the FRONT/TOP card of the deck that follows — so the
       handoff into the shuffle is pixel-seamless (same photo, same spot). */
    let count = 0;
    const totalTicks = founders.length * 2; // each image twice
    const id = setInterval(() => {
      count += 1;
      if (count >= totalTicks) {
        /* totalTicks % length === 0 → settles on founders[0], and the
           key stays monotonic so no crossfade collides. */
        setSlideIndex(totalTicks);
        clearInterval(id);
        setTimeout(() => setStage("animate"), 300);
      } else {
        setSlideIndex(count);
      }
    }, 200);
    return () => clearInterval(id);
  }, [stage, ready, founders.length]);

  useEffect(() => {
    if (stage !== "animate") return;
    /* ONE smooth tween 0 → 1 drives the whole timeline. The short pauses
       (deck settle, filmstrip settle) are baked as flat segments in each
       card's keyframes, so progress can stay a single-target tween — the
       form that reliably honours `duration`. Mildly eased so phase pacing
       stays even and fluid rather than snapping. */
    const controls = animate(progress, 1, {
      /* ~7 s total — cappen's intro pace: quick deal, brisk strip,
         unhurried landing. Gentle ease-in-out so the cards glide (no
         push at the start, soft settle at the end); each phase's own
         keyframe ranges shape the local feel. */
      duration: 7,
      ease: [0.33, 0, 0.18, 1],
    });
    return () => controls.stop();
  }, [stage, progress]);

  const [dims, setDims] = useState<Dims>(FALLBACK_DIMS);
  const [slot, setSlot] = useState<Slot>(FALLBACK_SLOT);
  const slotRef = useRef<HTMLSpanElement>(null);
  const mobileSlotRef = useRef<HTMLSpanElement>(null);

  /* Measure the heading photo slot (relative to screen centre) so the
     hero card can land exactly on it, whatever the heading layout. */
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
    /* Re-measure once webfonts finish loading — Poppins changes the
       heading's metrics, which moves the slot. A stale measure made the
       hero card land at the wrong spot (the "glitch" on arrival). */
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

  /* Side labels — visible through the deck + filmstrip, fade as the hero
     card breaks away toward the heading slot. */
  const sideLabelsOpacity = useTransform(progress, [0.6, 0.72], [1, 0]);
  /* Bottom subtitle — ONE fixed element at bottom-8vh the whole time, so
     its START and END positions are identical. Visible at the start,
     fades out as the cards spread, then fades back in with the heading —
     it never moves, only its opacity changes. */
  const subtitleBottomOpacity = useTransform(
    progress,
    [0.32, 0.44, 0.74, 0.86],
    [1, 0, 0, 1],
  );

  /* Heading block becomes visible early (photo slot + buttons); the text
     lines then rise on their own per-character reveal (RevealLine).
     NO scale animation here — the hero card flies to the slot's MEASURED
     position, and scaling the container would move that target under the
     card mid-flight (that was the landing glitch). */
  const headingOpacity = useTransform(progress, [0.74, 0.84], [0, 1]);

  /* Once the hero card has landed, the heading photo keeps cycling
     through every founder (a slow slideshow inside the FOR ▢ ENDURING
     slot). `headingReady` flips on near the end of the intro; `headingIdx`
     then advances every 2.6 s. Starts on the landed hero so the first
     frame matches the card underneath. */
  const [headingReady, setHeadingReady] = useState(false);
  /* Monotonic tick so each cycled photo gets a strictly-increasing key +
     zIndex — the incoming one always crossfades in ON TOP of the still-
     opaque previous one (no dark dip). Founder = heroIndex + tick. */
  const [headingTick, setHeadingTick] = useState(0);
  const headingFounder = founders[(heroIndex + headingTick) % founders.length];
  useEffect(() => {
    const unsub = progress.on("change", (v) => {
      /* Fires only once the hero card has ARRIVED at the rectangle (flight
         ends at 0.94) — the coloured portrait then blooms in over the
         parked card while it fades underneath (0.945→0.995). One object,
         one place — no double-image while the card is still flying. */
      if (v >= 0.94 && !headingReady) setHeadingReady(true);
      /* Hide the navbar while the vertical film-strip of photos is on
         screen: from when the fan starts opening into the strip (~0.38)
         until the hero has flown up and parked (~0.9). */
      const hideNav = v >= 0.38 && v < 0.9;
      document.body.classList.toggle("hero-hide-nav", hideNav);
    });
    return () => {
      unsub();
      document.body.classList.remove("hero-hide-nav");
    };
  }, [progress, headingReady]);
  useEffect(() => {
    if (!headingReady) return;
    const id = setInterval(() => {
      setHeadingTick((t) => t + 1);
    }, 2600);
    return () => clearInterval(id);
  }, [headingReady]);

  return (
    <section className="relative h-screen w-full">
      <div
        className="relative flex h-screen w-full items-center justify-center overflow-hidden"
        style={{
          /* Flat dark navy — NO centre gradient. The only light comes from
             the two drifting glow blobs (HeroGlow). */
          background: "#000c22",
        }}
      >
        {/* Drifting aurora glows (behind everything) */}
        <HeroGlow />

        {/* Side labels: FOUNDER-FIRST / ENDURING-VALUE */}
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
          ENDURING-VALUE
        </motion.span>

        {/* Bottom subtitle (during the card stages) */}
        <motion.p
          style={{ opacity: subtitleBottomOpacity, maxWidth: "min(52vw, 900px)" }}
          className="pointer-events-none absolute bottom-[8vh] left-1/2 z-10 -translate-x-1/2 text-center font-['Poppins',_sans-serif] text-[min(1.39vw,2.15vh)] font-normal leading-[145%] text-white/90 max-md:!bottom-[4vh] max-md:!text-[13px] max-md:!max-w-[85vw]"
        >
          {subtitle}
        </motion.p>

        {/* ═══ SLIDESHOW (stage 1) — one centred card cycling every
            founder photo, then fades into the deck of cards. ═══ */}
        <AnimatePresence>
          {ready && stage === "slideshow" && (
            <motion.div
              key="slideshow"
              className="absolute z-40 overflow-hidden bg-[#FBF7F0]"
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
              exit={{ opacity: 0, transition: { duration: 0.35 } }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* No `mode="wait"` and the OUTGOING photo stays fully
                  opaque (exit opacity 1) beneath the incoming one, which
                  fades in on top (higher z). So there's always a solid
                  photo covering the cream card — no white flash. */}
              <AnimatePresence>
                <motion.div
                  key={slideIndex}
                  className="absolute inset-0"
                  style={{ zIndex: slideIndex }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 1, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                >
                  <Image
                    src={heroImageSrc(
                      founders[slideIndex % founders.length].image,
                      400,
                    )}
                    alt={founders[slideIndex % founders.length].name}
                    fill
                    sizes="16vw"
                    priority
                    style={{ objectFit: "cover", objectPosition: "top", filter: "grayscale(0.9)" }}
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ CARDS (stage 2) — shuffle → line → one stays ═══
            Only mounted once the slideshow hands off. Before that they
            would paint at progress 0 (a full-size card stacked at centre)
            on the very first frame — a jarring "big picture" flash. */}
        {stage === "animate" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center max-md:!z-30">
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

        {/* ═══ HEADING (reveals around the hero card) ═══ */}
        <motion.div
          style={{ opacity: headingOpacity }}
          className="absolute inset-0 z-20 flex items-center justify-center px-[var(--section-px-wide)] max-md:!items-start max-md:!pt-[12vh]"
        >
          <div className="relative flex flex-col items-center max-md:!items-start max-md:!px-[24px]">
            {/* DESKTOP heading layout */}
            <h1
              className="pointer-events-none m-0 hidden md:flex flex-col items-start text-left font-['Poppins',_sans-serif] font-black uppercase leading-[86%] text-white"
              style={{ fontSize: "min(10.4vw, 16.0vh)" }}
            >
              <RevealLine show={headingReady} delay={0}>Backing Founder</RevealLine>
              {/* Row 2–3: items-stretch makes the photo slot span EXACTLY
                  the height of the ENDURING/IMPACT column. We reduced the 
                  line-height to 86%, so the total height of this row shrinks,
                  and the image slot automatically shrinks to match. */}
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
                    // Margins tweaked slightly to match the tighter line-height
                    marginTop: "0.06em",
                    marginBottom: "0.06em",
                  }}
                >
                  <HeadingPhoto founder={headingFounder} tick={headingTick} show={headingReady} />
                </span>
                {/* Changed leading from 100% to 86% to squish the lines closer */}
                <span className="flex flex-col items-start leading-[86%]">
                  <RevealLine show={headingReady} delay={0.7}>Enduring</RevealLine>
                  <RevealLine show={headingReady} delay={1.0}>Impact</RevealLine>
                </span>
              </span>
            </h1>

            {/* MOBILE heading layout */}
            <h1
              className="pointer-events-none m-0 flex md:hidden flex-col items-start text-left font-['Poppins',_sans-serif] font-black uppercase text-white"
              style={{ fontSize: "52px", lineHeight: "92%" }} // Reduced from 106% to 92%
            >
              <RevealLine show={headingReady} delay={0}>Backing</RevealLine>
              <RevealLine show={headingReady} delay={0.3}>Founder</RevealLine>
              <RevealLine show={headingReady} delay={0.6}>For</RevealLine>
              <span
                className="relative inline-block shrink-0 overflow-hidden my-[4px]" // Reduced top/bottom margin 
                style={{ width: "55vw", height: "32vw", borderRadius: 2 }} // Reduced height to match tighter spacing
                ref={mobileSlotRef}
              >
                <HeadingPhoto founder={headingFounder} tick={headingTick} show={headingReady} />
              </span>
              <RevealLine show={headingReady} delay={0.9}>Enduring</RevealLine>
              <RevealLine show={headingReady} delay={1.2}>Impact</RevealLine>
            </h1>

            {/* Buttons + description — hung below the h1. */}
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
   CursorFillButton — pill button that fills white from the
   cursor position on hover; text turns blue.
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
   HeadingPhoto — the cycling founder photo in the FOR ▢ ENDURING
   slot once the intro has landed. Crossfades between founders as
   `founder` changes (keyed AnimatePresence).
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
  return (
    <AnimatePresence>
      {/* ALWAYS mounted (opacity-gated by `show`, not conditional render)
          so the first photo is fetched with priority DURING the intro —
          mounting it only at the crossfade made the image download right
          then, flashing a blank box over the arriving card (the glitch).
          No background either: until the photo paints, the card behind
          stays visible instead of a cream flash. */}
      <motion.div
        key={tick}
        className="absolute inset-0"
        /* No-dip crossfade: the incoming photo fades in ON TOP (higher
           zIndex via the monotonic tick) while the outgoing one stays
           fully opaque underneath (exit opacity 1). */
        style={{ zIndex: tick }}
        initial={{ opacity: 0 }}
        animate={{ opacity: show ? 1 : 0 }}
        exit={{ opacity: 1 }}
        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image
          src={heroImageSrc(founder.image, 600)}
          alt={founder.name}
          fill
          sizes="24vw"
          priority
          style={{ objectFit: "cover", objectPosition: "top" }}
        />
      </motion.div>
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────
   RevealLine — cappen.com-style PER-CHARACTER reveal. Cappen
   splits its heading into individual chars (span.char) that
   rise up + fade in with a fast left-to-right stagger (no clip
   mask). We mirror that: each letter animates y+opacity, offset
   by `charStagger`, with `delay` continuing the wave line-to-line.
   ───────────────────────────────────────────────────────── */
const CHAR_STAGGER = 0.07;
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
    <span className="inline-block whitespace-nowrap" aria-label={children}>
      {chars.map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block"
          initial={{ y: "0.5em", opacity: 0 }}
          animate={show ? { y: 0, opacity: 1 } : { y: "0.5em", opacity: 0 }}
          transition={{
            duration: 1.3,
            ease: [0.16, 1, 0.3, 1],
            delay: delay + i * CHAR_STAGGER,
          }}
          style={{ willChange: "transform, opacity" }}
        >
          {/* Use a non-breaking space so the inline-block doesn't collapse to 0px width */}
          {ch === " " ? "\u00A0\u00A0" : ch}
        </motion.span>
      ))}
    </span>
  );
}
/* ─────────────────────────────────────────────────────────
   FounderCard — one card, driven by the shared `progress`.
   Absolutely positioned, so size/position changes never reflow.
   ───────────────────────────────────────────────────────── */
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

  /* ═══ cappen.com choreography ═══
     1. DECK (3-D): the stack reads in depth — card 0 is CLOSEST to the
        viewer (biggest, in front); each card behind peeks a little lower
        and sits visibly deeper (smaller).
     2. OPEN (the fan): the stack opens by INVERTING its order — the
        closest card sweeps DOWN to the bottom strip slot, card 1 to the
        slot above it, … the deepest card rises to the TOP. Cards pass
        each other by design; because the closer card always renders in
        front (z by depth), the crossing reads as a 3-D fan, not a glitch.
     3. FORWARD: one card then comes toward the viewer — scaling up out
        of the strip into the heading rectangle — and its black & white
        photo dissolves into the coloured heading portrait. */

  /* — deck geometry (depth via scale recession + downward peek) — */
  const deckY = index * dims.deckPeek;
  const deckScale = Math.max(0.58, 1 - index * 0.06);

  /* — strip geometry (inverted order, centred on screen) —
     card k lands in strip slot (N−1−k):  y = ((N−1)/2 − k) · step      */
  const stripY = ((total - 1) / 2 - index) * dims.filmStep;

  /* — per-card timing —
     deal: the stack builds card-by-card behind the slideshow card.
     open: the closest card leads the fan; each deeper card follows a
           heartbeat later, so the whole spread reads as one gesture.   */
  const dealStart = 0.02 + index * 0.02;
  const dealEnd = 0.18 + index * 0.02;
  const openStart = 0.4 + index * 0.015;
  const openEnd = 0.66 + index * 0.015;

  /* — hero flight morphing —
     Instead of changing scale, we dynamically animate the width/height 
     of the Hero card to the slot's exact dimensions. */
  const heroWidth = useTransform(progress, [0.8, 0.94], [dims.cardW, slot.w], { ease: easeInOut });
  const heroHeight = useTransform(progress, [0.8, 0.94], [dims.cardH, slot.h], { ease: easeInOut });

  const linear = (t: number) => t;

  /* Timeline (progress 0 → 1):
       0.02–0.32  deal — stack forms in depth
       0.40–0.77  open — inverted 3-D fan into the vertical strip
       0.80–0.94  hero comes forward into the heading rectangle
       0.94–1.00  dissolve: grey card → coloured heading portrait        */
  const y = useTransform(
    progress,
    isHero
      ? [dealStart, dealEnd, openStart, openEnd, 0.8, 0.94]
      : [dealStart, dealEnd, openStart, openEnd],
    isHero
      ? [0, deckY, deckY, stripY, stripY, slot.cy]
      : [0, deckY, deckY, stripY],
    isHero
      ? { ease: [easeInOut, linear, easeInOut, linear, easeInOut] }
      : { ease: [easeInOut, linear, easeInOut] },
  );

  const x = useTransform(progress, [0.8, 0.94], [0, isHero ? slot.cx : 0], {
    ease: easeInOut,
  });

  const scale = useTransform(
    progress,
    isHero
      ? [dealStart, dealEnd, openStart, openEnd, 0.8, 0.94]
      : [dealStart, dealEnd, openStart, openEnd],
    isHero
      /* Keep scale at 1 for the final landing phase, size is handled by width/height now */
      ? [1, deckScale, deckScale, 1, 1, 1]
      : [1, deckScale, deckScale, 1],
    isHero
      ? { ease: [easeInOut, linear, easeInOut, linear, easeInOut] }
      : { ease: [easeInOut, linear, easeInOut] },
  );

  /* Depth-true stacking: closer cards always render in front. The hero
     jumps to the front only when it starts coming forward. */
  const zIndex = useTransform(progress, (v) =>
    isHero && v >= 0.79 ? 60 : 40 - index,
  );

  /* Everyone stays solid through the fan; the strip clears while the
     hero comes forward, and the hero itself fades only AFTER it has
     parked in the rectangle — crossfading into the coloured portrait
     over a longer window so the swap reads as a gradual dissolve. */
  const opacity = useTransform(
    progress,
    isHero ? [0.9, 1] : [0.8, 0.9],
    [1, 0],
  );

  /* Grey → COLOUR bloom: once the hero parks, its own greyscale eases
     from 0.9 → 0 across the last stretch, so the colour comes in as a
     smooth gradient (not an immediate swap). Only the hero card animates
     its filter, and only once, so the repaint cost is negligible. */
  const grayscaleMV = useTransform(progress, [0.86, 1], [0.9, 0]);
  const heroFilter = useMotionTemplate`grayscale(${grayscaleMV})`;

  return (
    <motion.div
      className="absolute overflow-hidden bg-[#FBF7F0]"
      style={{
        /* If it's the hero, use the animated dimensions.
           Otherwise, strictly map to the responsive dims just like before! */
        width: isHero ? heroWidth : dims.cardW,
        height: isHero ? heroHeight : dims.cardH,
        x,
        y,
        scale,
        opacity,
        zIndex,
        borderRadius: "2px, 2px",
        /* Hero desaturates gradually (colour bloom); the rest stay grey. */
        filter: isHero ? heroFilter : "grayscale(0.9)",
        willChange: isHero
          ? "transform, opacity, width, height, filter"
          : "transform, opacity",
      }}
    >
      <Image
        src={heroImageSrc(founder.image, 400)}
        alt={founder.name}
        fill
        sizes="14vw"
        style={{ objectFit: "cover", objectPosition: "top" }}
      />
    </motion.div>
  );
}