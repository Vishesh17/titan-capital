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

/* The card that "stays" and becomes the heading photo — randomized on mount. */
const DEFAULT_HERO_INDEX = 0;

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
  return {
    cardSide: Math.min(0.078 * w, 0.121 * h), // ~135 px @ ref — bigger
    lineGap: Math.min(0.079 * w, 0.122 * h),  // ~137 px @ ref (line still fits 8)
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
   Hero — self-playing intro (~5.5 s): ONE image → stack →
   vertical line → one card stays and grows into the heading
   photo (in the FOR ▢ ENDURING/IMPACT slot), colouring up.
   ───────────────────────────────────────────────────────── */
export default function HeroClient({ data }: { data?: HeroData | null }) {
  const subtitle = data?.subtitle || FALLBACK_SUBTITLE;
  const founders: HeroFounder[] = (() => {
    if (data?.founderSlots && data.founderSlots.length > 0) {
      return data.founderSlots.flatMap((s) => s.pool).slice(0, 8);
    }
    return FALLBACK_FOUNDERS;
  })();

  const [heroIndex, setHeroIndex] = useState<number | null>(null);
  useEffect(() => {
    setHeroIndex(Math.floor(Math.random() * founders.length));
  }, [founders.length]);

  const progress = useMotionValue(0);

  /* Intro has two stages:
       1. "slideshow" — a single centred card flips through EVERY founder
          photo (like a slideshow) once.
       2. "animate"   — the shuffle-stack → vertical-line → one-stays
          timeline plays (driven by `progress`).
     Slower + smoother than before, per the brief. */
  const [stage, setStage] = useState<"slideshow" | "animate">("slideshow");
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (stage !== "slideshow" || heroIndex === null) return;
    let count = 0;
    let handoff: ReturnType<typeof setTimeout> | undefined;
    const id = setInterval(() => {
      count += 1;
      if (count >= founders.length) {
        /* Land on the HERO photo, hold a beat, THEN hand off to the
           shuffle — the stack's top card is the same hero photo, so the
           slideshow → shuffle transition is seamless (no image jump). */
        setSlideIndex(heroIndex);
        clearInterval(id);
        handoff = setTimeout(() => setStage("animate"), 300);
      } else {
        setSlideIndex(count);
      }
    }, 260); // fast flip
    return () => {
      clearInterval(id);
      if (handoff) clearTimeout(handoff);
    };
  }, [stage, founders.length, heroIndex]);

  useEffect(() => {
    if (stage !== "animate") return;
    /* Spring drive — gives the whole timeline natural momentum + settle
       (physics feel) and reaches the end snappily. useTransform clamps,
       so any spring overshoot past 1 never overshoots the visuals. */
    const controls = animate(progress, 1, {
      duration: 7.5, // slower, more cinematic
      ease: [0.33, 0, 0.2, 1],
    });
    return () => controls.stop();
  }, [stage, progress]);

  const [dims, setDims] = useState<Dims>(FALLBACK_DIMS);
  const [slot, setSlot] = useState<Slot>(FALLBACK_SLOT);
  const slotRef = useRef<HTMLSpanElement>(null);

  /* Measure the heading photo slot (relative to screen centre) so the
     hero card can land exactly on it, whatever the heading layout. The
     slot is always in the DOM (only its opacity animates), so it can be
     measured immediately + on resize + after fonts settle. */
  useEffect(() => {
    const measure = () => {
      setDims(computeDims(window.innerWidth, window.innerHeight));
      const el = slotRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setSlot({
        cx: r.left + r.width / 2 - window.innerWidth / 2,
        cy: r.top + r.height / 2 - window.innerHeight / 2,
        w: r.width,
        h: r.height,
      });
    };
    measure();
    const t = setTimeout(measure, 300); // after web-font layout settles
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  }, []);

  /* Side labels + bottom subtitle — visible through the card stages,
     fade out for the heading reveal. */
  /* Visible from the very start (progress is 0 during the slideshow, and
     this clamps to 1 there) through the stack + line, fading only for
     the heading reveal. */
  const sideLabelsOpacity = useTransform(progress, [0.58, 0.7], [1, 0]);
  /* Visible from the start (slideshow + stack); DISAPPEARS as the cards
     open into the vertical line (~0.34); the heading brings its own copy
     back at the end. */
  const subtitleBottomOpacity = useTransform(progress, [0.32, 0.42], [1, 0]);

  /* Heading block */
  const headingOpacity = useTransform(progress, [0.7, 0.94], [0, 1]);
  const headingScale = useTransform(progress, [0.72, 0.98], [0.98, 1]);

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
          className="pointer-events-none absolute left-[var(--section-px-wide)] top-1/2 z-10 -translate-y-1/2 font-['Poppins',_sans-serif] text-[min(1.04vw,1.61vh)] font-medium tracking-[0.2em] text-white/70"
        >
          FOUNDER-FIRST
        </motion.span>
        <motion.span
          style={{ opacity: sideLabelsOpacity }}
          className="pointer-events-none absolute right-[var(--section-px-wide)] top-1/2 z-10 -translate-y-1/2 font-['Poppins',_sans-serif] text-[min(1.04vw,1.61vh)] font-medium tracking-[0.2em] text-white/70"
        >
          ENDURING-VALUE
        </motion.span>

        {/* Bottom subtitle (during the card stages) */}
        <motion.p
          style={{ opacity: subtitleBottomOpacity, maxWidth: "min(52vw, 900px)" }}
          className="pointer-events-none absolute bottom-[8vh] left-1/2 z-10 -translate-x-1/2 text-center font-['Poppins',_sans-serif] text-[min(1.39vw,2.15vh)] font-normal leading-[145%] text-white/90"
        >
          {subtitle}
        </motion.p>

        {/* ═══ SLIDESHOW (stage 1) — one centred card cycling every
            founder photo, then fades into the shuffle stack. ═══ */}
        <AnimatePresence>
          {stage === "slideshow" && heroIndex !== null && (
            <motion.div
              key="slideshow"
              className="absolute z-40 overflow-hidden bg-[#FBF7F0]"
              style={{
                width: dims.cardSide,
                height: dims.cardSide,
                left: "50%",
                top: "50%",
                marginLeft: dims.cardSide / -2,
                marginTop: dims.cardSide / -2,
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

        {/* ═══ CARDS (stage 2) — shuffle → line → one stays ═══ */}
        {heroIndex !== null && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            {founders.map((founder, i) => (
              <FounderCard
                key={founder.name}
                founder={founder}
                index={i}
                total={founders.length}
                isHero={i === heroIndex}
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
          className="absolute inset-0 z-20 flex items-center justify-center px-[var(--section-px-wide)]"
        >
          <div className="relative flex flex-col items-center">
            {/* BACKING FOUNDER                                         */}
            {/* FOR  [portrait photo]  ENDURING                         */}
            {/*                        IMPACT                           */}
            <h1
              className="pointer-events-none m-0 flex flex-col items-start text-left font-['Poppins',_sans-serif] font-bold uppercase leading-[106%] text-white"
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

            {/* Buttons + description — hung below the h1. */}
            <div className="absolute left-1/2 top-full flex -translate-x-1/2 flex-col items-center mt-[min(4.63vw,7.16vh)]">
              <div
                className="pointer-events-auto flex items-center justify-center"
                style={{ gap: "min(2.31vw, 3.58vh)" }}
              >
                <Link
                  href="/portfolio"
                  className="group relative whitespace-nowrap font-['Poppins',_sans-serif] text-[min(1.16vw,1.79vh)] font-normal text-white"
                  style={{ lineHeight: "140%" }}
                >
                  View Portfolio
                  <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-white transition-all duration-300 ease-out group-hover:w-full" />
                </Link>
                <CursorFillButton href="/getinvestment" label="Get Investment" />
              </div>

              <p
                className="pointer-events-none mt-[min(3.47vw,5.37vh)] text-center font-['Poppins',_sans-serif] font-normal leading-[145%] text-white/90"
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
      className="relative flex items-center justify-center overflow-hidden whitespace-nowrap font-['Poppins',_sans-serif] text-[min(1.16vw,1.79vh)] font-normal transition-colors duration-300"
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
  total,
  isHero,
  progress,
  dims,
  slot,
}: {
  founder: HeroFounder;
  index: number;
  total: number;
  isHero: boolean;
  progress: MotionValue<number>;
  dims: Dims;
  slot: Slot;
}) {
  const centerIdx = (total - 1) / 2;
  const offset = index - centerIdx;
  /* Receding cascade: the top card (index 0) is biggest and in front;
     each card below peeks out under the one above and is progressively
     smaller — a stack of photos seen in perspective. */
  const cascadeGap = dims.cardSide * 0.42;
  const yStackCascade = offset * cascadeGap; // centred, index 0 at top
  const yLine = offset * dims.lineGap;       // even vertical line
  const scaleStack = Math.max(0.42, 1 - index * 0.09); // top biggest → smaller

  /* y: ONE image (held) → cascade stack → vertical line → hero lands on
     the heading slot / others collapse to centre. */
  const y = useTransform(
    progress,
    [0, 0.12, 0.35, 0.6, 0.86],
    [0, 0, yStackCascade, yLine, isHero ? slot.cy : 0],
  );
  /* x: only the hero shifts, from centre to the heading slot. */
  const x = useTransform(progress, [0.6, 0.86], [0, isHero ? slot.cx : 0]);

  /* scale: uniform(1, one image) → per-card cascade sizes → uniform(1)
     for the line and everything after. */
  const scale = useTransform(progress, [0, 0.12, 0.35, 0.6], [1, 1, scaleStack, 1]);

  /* Cards are invisible during the slideshow (progress=0), appear as
     the animate stage begins, then non-hero cards fade out at the end. */
  const opacity = useTransform(
    progress,
    isHero ? [0, 0.01, 0.6, 0.78] : [0, 0.01, 0.6, 0.78],
    isHero ? [0, 1, 1, 1] : [0, 1, 1, 0],
  );

  /* The hero morphs from the square card into the landscape heading slot
     (width & height independently; the photo re-crops via object-cover,
     so it never distorts). Others keep the square size. */
  const width = useTransform(
    progress,
    [0.6, 0.86],
    [dims.cardSide, isHero ? slot.w : dims.cardSide],
  );
  const height = useTransform(
    progress,
    [0.6, 0.86],
    [dims.cardSide, isHero ? slot.h : dims.cardSide],
  );

  /* Monochrome throughout; ONLY the hero colours up as it lands. */
  const grayscale = useTransform(progress, [0.62, 0.82], [0.9, isHero ? 0 : 0.9]);
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
        zIndex: isHero ? 30 : total - index,
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
