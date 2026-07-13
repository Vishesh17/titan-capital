"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useTransform,
  useMotionValue,
  useMotionTemplate,
  animate,
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
const SLOT_W = "min(16.2vw, 25vh)";     // ~280 px @ ref — LANDSCAPE
const SLOT_H = "min(11.56vw, 17.87vh)"; // ~200 px @ ref (spans 2 rows)

/* ─────────────────────────────────────────────────────────
   Viewport-derived px dims for the stack / line stages. Mirrors
   the CSS min(vw,vh) tokens; FALLBACK for SSR + first render.
   ───────────────────────────────────────────────────────── */
function computeDims(w: number, h: number) {
  const isMobile = w < 768;
  const cardW = isMobile
    ? w * 0.38  // ~148px on 390px screen
    : Math.min(0.072 * w, 0.115 * h);
  const cardH = cardW * 1.3;
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
        style={{ left: "-16%", top: "-12%", width: "min(60vw, 95vh)", zIndex: 0 }}
        animate={{
          x: ["-10%", "38%", "12%", "30%", "-10%"],
          y: ["-12%", "20%", "40%", "8%", "-12%"],
          scale: [1, 1.15, 0.9, 1.08, 1],
          rotate: [0, 12, -8, 5, 0],
        }}
        transition={{ duration: 24, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
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
        style={{ right: "-14%", bottom: "-14%", width: "min(54vw, 82vh)", zIndex: 0 }}
        animate={{
          x: ["10%", "-36%", "-10%", "-28%", "10%"],
          y: ["12%", "-22%", "-40%", "-8%", "12%"],
          scale: [1, 1.16, 0.9, 1.08, 1],
          rotate: [0, -12, 8, -5, 0],
        }}
        transition={{ duration: 28, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
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

  /* The featured founder — the card that stays centred through the deck +
     filmstrip and finally lands in the heading slot. Chosen once on mount
     and used from the start so the deck/filmstrip can be built around it. */
  const [heroIndex] = useState<number>(() => Math.floor(Math.random() * founders.length));

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
    /* Flip through every founder photo once, then SETTLE on the hero photo
       so the centred deck card that follows shows the same face — a
       seamless handoff into the shuffle. */
    let count = 0;
    const id = setInterval(() => {
      count += 1;
      if (count >= founders.length - 1) {
        setSlideIndex(heroIndex);
        clearInterval(id);
        setTimeout(() => setStage("animate"), 400);
      } else {
        setSlideIndex(count);
      }
    }, 300);
    return () => clearInterval(id);
  }, [stage, ready, founders.length, heroIndex]);

  useEffect(() => {
    if (stage !== "animate") return;
    /* ONE smooth tween 0 → 1 drives the whole timeline. The short pauses
       (deck settle, filmstrip settle) are baked as flat segments in each
       card's keyframes, so progress can stay a single-target tween — the
       form that reliably honours `duration`. Mildly eased so phase pacing
       stays even and fluid rather than snapping. */
    const controls = animate(progress, 1, {
      duration: 6.4,
      ease: [0.3, 0, 0.25, 1],
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
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  }, []);

  /* Side labels — visible through the deck + filmstrip, fade as the hero
     card breaks away toward the heading slot. */
  const sideLabelsOpacity = useTransform(progress, [0.6, 0.72], [1, 0]);
  /* Bottom subtitle — visible through the deck; DISAPPEARS as the cards
     spread into the filmstrip; the heading brings its own copy back. */
  const subtitleBottomOpacity = useTransform(progress, [0.32, 0.44], [1, 0]);

  /* Heading block reveals as the hero card lands. */
  const headingOpacity = useTransform(progress, [0.72, 0.92], [0, 1]);
  const headingScale = useTransform(progress, [0.74, 0.98], [0.98, 1]);

  /* Typewriter: triggers once heading is visible */
  const [typewriterStarted, setTypewriterStarted] = useState(false);
  useEffect(() => {
    const unsub = progress.on("change", (v) => {
      if (v >= 0.85 && !typewriterStarted) setTypewriterStarted(true);
    });
    return unsub;
  }, [progress, typewriterStarted]);

  return (
    <section className="relative h-screen w-full">
      <div
        className="relative flex h-screen w-full items-center justify-center overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, #0a2a6e 0%, #001a4d 40%, #000d26 100%)",
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
                borderRadius: "min(0.93vw, 1.43vh)",
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
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <Image
                    src={heroImageSrc(founders[slideIndex].image, 400)}
                    alt={founders[slideIndex].name}
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
          style={{ opacity: headingOpacity, scale: headingScale }}
          className="absolute inset-0 z-20 flex items-center justify-center px-[var(--section-px-wide)] max-md:!items-start max-md:!pt-[12vh]"
        >
          <div className="relative flex flex-col items-center max-md:!items-start max-md:!px-[24px]">
            {/* DESKTOP heading layout */}
            <h1
              className="pointer-events-none m-0 hidden md:flex flex-col items-start text-left font-['Poppins',_sans-serif] font-bold uppercase leading-[106%] text-white"
              style={{ fontSize: "min(5.56vw, 8.59vh)" }}
            >
              <TypewriterLine text="Backing Founder" started={typewriterStarted} delay={0} />
              <span
                className="flex items-start"
                style={{ gap: "min(1.1vw, 1.7vh)", marginTop: "min(0.7vw, 1.08vh)" }}
              >
                <TypewriterLine text="For" started={typewriterStarted} delay={0.4} />
                <span
                  ref={slotRef}
                  aria-hidden
                  className="inline-block shrink-0"
                  style={{ width: SLOT_W, height: SLOT_H }}
                />
                <span className="flex flex-col items-start leading-[106%]">
                  <TypewriterLine text="Enduring" started={typewriterStarted} delay={0.6} />
                  <TypewriterLine text="Impact" started={typewriterStarted} delay={0.9} />
                </span>
              </span>
            </h1>

            {/* MOBILE heading layout */}
            <h1
              className="pointer-events-none m-0 flex md:hidden flex-col items-start text-left font-['Poppins',_sans-serif] font-bold uppercase text-white"
              style={{ fontSize: "38px", lineHeight: "110%" }}
            >
              <TypewriterLine text="Backing" started={typewriterStarted} delay={0} />
              <TypewriterLine text="Founder" started={typewriterStarted} delay={0.15} />
              <TypewriterLine text="For" started={typewriterStarted} delay={0.3} />
              <span
                aria-hidden
                className="inline-block shrink-0 my-[8px]"
                style={{ width: "55vw", height: "38vw", borderRadius: 12 }}
                ref={mobileSlotRef}
              />
              <TypewriterLine text="Enduring" started={typewriterStarted} delay={0.6} />
              <TypewriterLine text="Impact" started={typewriterStarted} delay={0.8} />
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

              <p
                className="pointer-events-none mt-[min(3.47vw,5.37vh)] text-center font-['Poppins',_sans-serif] font-normal leading-[145%] text-white/90 max-md:!text-[13px] max-md:!mt-[24px] max-md:!text-center"
                style={{ fontSize: "min(1.39vw, 2.15vh)", width: "min(52vw, 900px)" }}
              >
                {subtitle}
              </p>
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
   TypewriterLine — reveals text character by character.
   ───────────────────────────────────────────────────────── */
function TypewriterLine({ text, started, delay }: { text: string; started: boolean; delay: number }) {
  const chars = useMemo(() => text.split(""), [text]);
  return (
    <span className="inline-flex">
      {chars.map((ch, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={started ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.04, delay: delay + i * 0.045 }}
        >
          {ch === " " ? "\u00A0" : ch}
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
  heroIndex,
  progress,
  dims,
  slot,
}: {
  founder: HeroFounder;
  index: number;
  heroIndex: number;
  progress: MotionValue<number>;
  dims: Dims;
  slot: Slot;
}) {
  const isHero = index === heroIndex;

  /* Rank among the NON-hero cards (0-based), used to place them relative
     to the centred hero card in both the deck and the filmstrip. */
  const otherPos = index < heroIndex ? index : index - 1;

  /* DECK (cappen "frame 1"): hero on top at centre; every other card
     peeks out just BELOW it, each a little lower + smaller + further
     back — a downward-fanned deck. */
  const deckRank = isHero ? 0 : otherPos + 1;
  const deckY = deckRank * dims.deckPeek;
  const deckScale = isHero ? 1 : Math.max(0.72, 1 - deckRank * 0.05);

  /* FILMSTRIP (cappen "frame 2"): hero stays centred; the others open
     out symmetrically above & below it into an evenly-gapped column
     (+1, -1, +2, -2, …). */
  const filmSlot = isHero
    ? 0
    : (otherPos % 2 === 0 ? 1 : -1) * Math.ceil((otherPos + 1) / 2);
  const filmY = filmSlot * dims.filmStep;

  /* Shared timeline (progress 0 → 1). Flat segments = the small pauses.
       0.00→0.22  cards fan out from behind the hero into the deck
       0.22→0.30  deck settles (small pause)
       0.30→0.56  deck opens into the vertical filmstrip
       0.56→0.68  filmstrip settles (small pause)
       0.68→0.90  hero flies to the heading slot; others fade out         */
  const y = useTransform(
    progress,
    isHero ? [0, 0.68, 0.9] : [0, 0.22, 0.3, 0.56],
    isHero ? [0, 0, slot.cy] : [0, deckY, deckY, filmY],
  );
  const x = useTransform(progress, [0.68, 0.9], [0, isHero ? slot.cx : 0]);
  const scale = useTransform(
    progress,
    [0, 0.22, 0.3, 0.56],
    isHero ? [1, 1, 1, 1] : [1, deckScale, deckScale, 1],
  );

  /* Hero stays solid; the others fade in from behind it, hold, then fade
     out once the hero breaks away. */
  const opacity = useTransform(
    progress,
    isHero ? [0, 1] : [0, 0.1, 0.58, 0.72],
    isHero ? [1, 1] : [0, 1, 1, 0],
  );

  /* Hero morphs from the portrait card into the landscape heading slot
     (object-cover re-crops, so it never distorts). */
  const width = useTransform(
    progress,
    [0.68, 0.9],
    [dims.cardW, isHero ? slot.w : dims.cardW],
  );
  const height = useTransform(
    progress,
    [0.68, 0.9],
    [dims.cardH, isHero ? slot.h : dims.cardH],
  );

  /* Monochrome throughout; ONLY the hero colours up as it lands. */
  const grayscale = useTransform(progress, [0.72, 0.88], [0.9, isHero ? 0 : 0.9]);
  const filter = useMotionTemplate`grayscale(${grayscale})`;

  return (
    <motion.div
      className="absolute overflow-hidden bg-[#FBF7F0]"
      style={{
        width,
        height,
        x,
        y,
        scale,
        opacity,
        filter,
        borderRadius: "min(0.93vw, 1.43vh)",
        /* Hero above all; other cards stack behind it by deck rank. */
        zIndex: isHero ? 50 : 40 - deckRank,
        willChange: "transform, width, height, opacity, filter",
      }}
    >
      <Image
        src={heroImageSrc(founder.image, 400)}
        alt={founder.name}
        fill
        sizes="16vw"
        style={{ objectFit: "cover", objectPosition: "top" }}
      />
    </motion.div>
  );
}
