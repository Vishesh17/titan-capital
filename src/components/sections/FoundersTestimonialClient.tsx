"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { animate, motion, useInView, useMotionValue, useAnimationFrame, cubicBezier } from "framer-motion";
import { CTA_BUTTON_STYLE, CTA_BUTTON_MOBILE_CLASS } from "@/styles/ctaButton";
import {
  Noto_Sans_Devanagari,
  Noto_Sans_Kannada,
  Noto_Sans_Tamil,
  Noto_Sans_Telugu,
  Noto_Sans_Gujarati,
  Noto_Sans_Gurmukhi,
  Noto_Sans_Bengali,
} from "next/font/google";
import {
  HERO_BODY_CLASS,
  HERO_BODY_STYLE,
  LABEL_STYLE,
  SECTION_HEADING_CLASS,
  SECTION_HEADING_STYLE,
} from "@/styles/heroTypography";

/* Poppins is loaded with `subsets: ["latin"]` and carries no Indic glyphs, so
   every non-Latin spelling below would render as tofu without these. Weight
   600 only, to match the heading's font-semibold, and each is restricted to
   its own subset to keep the payload as small as next/font allows.
   next/font statically analyses these calls, so the options must be inline
   object literals — a shared spread object fails the build. */
const devanagari = Noto_Sans_Devanagari({ subsets: ["devanagari"], weight: "600", display: "swap" });
const kannada    = Noto_Sans_Kannada({ subsets: ["kannada"], weight: "600", display: "swap" });
const tamil      = Noto_Sans_Tamil({ subsets: ["tamil"], weight: "600", display: "swap" });
const telugu     = Noto_Sans_Telugu({ subsets: ["telugu"], weight: "600", display: "swap" });
const gujarati   = Noto_Sans_Gujarati({ subsets: ["gujarati"], weight: "600", display: "swap" });
const gurmukhi   = Noto_Sans_Gurmukhi({ subsets: ["gurmukhi"], weight: "600", display: "swap" });
const bengali    = Noto_Sans_Bengali({ subsets: ["bengali"], weight: "600", display: "swap" });

/* "Vision" transliterated — the English word spelled in each script, not
   translated. Hindi and Marathi share Devanagari but differ in spelling:
   Marathi writes the English /v/ as व्ह. Bengali has no /v/, so it uses ভ. */
interface VisionWord { lang: string; bcp47: string; text: string; className: string }
const VISION_WORDS: VisionWord[] = [
  { lang: "English",  bcp47: "en",    text: "Vision.",  className: "" },
  { lang: "Hindi",    bcp47: "hi",    text: "विज़न.",    className: devanagari.className },
  { lang: "Marathi",  bcp47: "mr",    text: "व्हिजन.",   className: devanagari.className },
  { lang: "Kannada",  bcp47: "kn",    text: "ವಿಷನ್.",    className: kannada.className },
  { lang: "Tamil",    bcp47: "ta",    text: "விஷன்.",    className: tamil.className },
  { lang: "Telugu",   bcp47: "te",    text: "విజన్.",    className: telugu.className },
  { lang: "Gujarati", bcp47: "gu",    text: "વિઝન.",     className: gujarati.className },
  { lang: "Punjabi",  bcp47: "pa",    text: "ਵਿਜ਼ਨ.",     className: gurmukhi.className },
  { lang: "Bengali",  bcp47: "bn",    text: "ভিশন.",     className: bengali.className },
];

/* Type by GRAPHEME, never by code unit. "विज़न" is व + ि + ज + ़ + न — slicing
   by index would flash a bare ज before its nukta lands, and Tamil ன் would
   split from its virama. Intl.Segmenter groups user-perceived characters;
   the regex fallback attaches combining marks (\p{M}) to their base. */
function toGraphemes(text: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(seg.segment(text), (s) => s.segment);
  }
  return text.match(/\P{M}\p{M}*/gu) ?? Array.from(text);
}

export interface TestimonialItem {
  name: string;
  role: string;
  image: string;
  text: string;
  companyLogo?: string;
  companyName?: string;
  longText?: boolean;
  imageScaleFactor?: number;
  imagePositionX?: number;
  imagePositionY?: number;
}

export interface FoundersTestimonialData {
  topHeadingFirst?: string;
  topHeadingSecond?: string;
  bottomHeadingFirst?: string;
  bottomHeadingSecond?: string;
  ctaLabel?: string;
  testimonials?: TestimonialItem[];
}

const FALLBACK_TESTIMONIALS: TestimonialItem[] = [
  {
    name: "Abhiraj Bahl",
    role: "Cofounder, Urban Company",
    companyName: "Urban Company",
    image: "/images/herosection/Abhiraj Singh Urban Company 1 (2).png",
    text: "\u201CKunal and Rohit were the first investors to believe in Urban Company, even before we launched the platform or decided on the name. Their unwavering support has been a constant throughout our journey, guiding us through ups and downs. As Founders, we deeply value their mentorship and friendship.\u201D",
    imageScaleFactor: 1.15,
    imagePositionX: -12,
    imagePositionY: 0,
  },
  {
    name: "Disha Singh",
    role: "Cofounder, Zouk",
    companyName: "Zouk",
    image: "/images/herosection/Rectangle 22.png",
    text: "\u201CTitan Capital has been an invaluable partner in our journey to build Zouk. Kunal and Rohit have consistently provided invaluable guidance on cultivating a long-lasting business with strong brand loyalty.\u201D",
    longText: true,
    imageScaleFactor: 1.2,
    imagePositionX: 10,
    imagePositionY: 35,
  },
  {
    name: "Rishabh Goel",
    role: "Cofounder, Credgenics",
    companyName: "Credgenics",
    image: "/images/herosection/Rishabh 2.png",
    text: "\u201CTitan Capital has been more than just an investor for Credgenics \u2014 they\u2019ve been our first partner in this journey. Our early conversations made it clear that they weren\u2019t your typical investors.\u201D",
    longText: true,
    imageScaleFactor: 1.3,
    imagePositionX: 10,
    imagePositionY: -20,
  },
  {
    name: "Raghu Ravinutala",
    role: "Cofounder, Yellow.ai",
    companyName: "Yellow.ai",
    image: "/images/herosection/Raghu-Ravinutala 1.png",
    text: "\u201CTitan Capital is truly \u2018founder only\u2019. From the first interaction, I was overwhelmed with their focus on making the founder successful beyond anything.\u201D",
    imageScaleFactor: 1.1,
    imagePositionX: -10,
    imagePositionY: -5,
  },
  {
    name: "Aarti Gill",
    role: "Cofounder, OZiva",
    companyName: "OZiva",
    image: "/images/herosection/Aarti Gill 2.png",
    text: "\u201CWhen I first met Kunal, I wasn\u2019t even considering raising equity capital \u2014 but that one conversation completely changed my perspective. Partnering with Titan Capital was one of the best decisions we made at OZiva.\u201D",
    imageScaleFactor: 1.3,
    imagePositionX: -30,
    imagePositionY: 5,
  },
  {
    name: "Anand Yadav",
    role: "Cofounder, Mekr",
    companyName: "Mekr",
    image: "/images/herosection/image 177.png",
    text: "\u201CTitan Capital was among the first to believe in what we were building at Mekr and backed us when it mattered most. Their founder-first mindset makes them the kind of partner every founder hopes to have.\u201D",
    imageScaleFactor: 1.2,
    imagePositionX: -20,
    imagePositionY: 40,
  },
];

const FALLBACK_TOP_FIRST = "What Our Founders Say";
const FALLBACK_TOP_SECOND = "";
const FALLBACK_BOTTOM_FIRST = "You Build The Vision.";
const FALLBACK_BOTTOM_SECOND = "We Help You Scale It.";
const FALLBACK_CTA = "Get Investment";

function cdnImageSrc(url: string, width: number): string {
  if (url.startsWith("https://cdn.sanity.io/")) {
    return `${url}?w=${width}&auto=format&q=85`;
  }
  return url;
}

function deriveCompanyName(item: TestimonialItem): string {
  if (item.companyName) return item.companyName;
  const parts = item.role.split(",");
  return parts.length > 1 ? parts.slice(1).join(",").trim() : item.role;
}

// FIXED: Adjust gap dynamically on mobile so 4 to 5 vertical lines appear across the screen
function computeLinePositions(): number[] {
  if (typeof window === "undefined") return [];
  const w = window.innerWidth;
  const isMobile = w < 768;
  const gap = isMobile ? 65 : 200; // Smaller gap on mobile yields 4-5 lines
  const count = Math.max(isMobile ? 5 : 2, Math.round(w / gap));
  const spread = (count - 1) * gap;
  const startX = (w - spread) / 2;
  return Array.from({ length: count }, (_, i) => startX + i * gap);
}

/* Cursor-follow wave, matching the Titan Seed hero grid. Lines near the
   pointer bend on a travelling sine and deepen in tone, which reads as the
   sheet of lines tilting in 3D. Tuned for dark-on-light instead of
   light-on-dark — the beige background is untouched. */
const LINE_BASE_RGB = [216, 216, 216] as const; // #D8D8D8 — resting colour
const LINE_NEAR_RGB = [150, 150, 150] as const; // deepened under the cursor
const CURSOR_RADIUS = 180;
const WAVE_AMP = 6;
const REVEAL_EASE = cubicBezier(0.22, 1, 0.36, 1);

function VerticalLines({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const positionsRef = useRef<number[]>([]);

  // Per-line reveal state (0→1), driven with the same stagger/duration/easing
  // the old scaleY variants used so the entrance is unchanged.
  const revealRef = useRef<number[]>([]);
  const fromRef = useRef<number[]>([]);
  const targetRef = useRef(0);
  const transitionStartRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const syncPositions = () => {
      const next = computeLinePositions();
      positionsRef.current = next;
      if (revealRef.current.length !== next.length) {
        revealRef.current = next.map((_, i) => revealRef.current[i] ?? 0);
        fromRef.current = next.map((_, i) => fromRef.current[i] ?? 0);
      }
    };

    let cssW = 0;
    let cssH = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      cssW = rect.width;
      cssH = rect.height;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      syncPositions();
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onMouseLeave = () => { mouseRef.current = { x: -9999, y: -9999 }; };

    const section = canvas.parentElement;
    section?.addEventListener("mousemove", onMouseMove);
    section?.addEventListener("mouseleave", onMouseLeave);

    const startTime = performance.now();
    let animationId = 0;

    const draw = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const xs = positionsRef.current;
      const w = cssW;
      const h = cssH;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;

      // Advance the staggered reveal.
      const target = targetRef.current;
      const durationMs = target === 1 ? 2600 : 1200;
      const staggerMs = target === 1 ? 180 : 120;
      const sinceStart = now - transitionStartRef.current;

      for (let i = 0; i < xs.length; i++) {
        // Reverse the stagger order when hiding, as staggerDirection: -1 did.
        const order = target === 1 ? i : xs.length - 1 - i;
        const t = Math.min(1, Math.max(0, (sinceStart - order * staggerMs) / durationMs));
        const from = fromRef.current[i] ?? 0;
        revealRef.current[i] = from + (target - from) * REVEAL_EASE(t);
      }

      for (let i = 0; i < xs.length; i++) {
        const x = xs[i];
        const reveal = revealRef.current[i] ?? 0;
        if (reveal <= 0.001) continue;
        const lineBottom = h * reveal; // grows from the top, like transformOrigin: top

        // Batch consecutive segments that share a colour into one path so the
        // whole line costs a handful of stroke() calls, not one per 4px.
        let runKey = -1;
        let started = false;

        for (let y = 0; y <= lineBottom; y += 4) {
          const dist = Math.hypot(x - mx, y - my);
          let offset = 0;
          let smooth = 0;
          if (dist < CURSOR_RADIUS) {
            const proximity = 1 - dist / CURSOR_RADIUS;
            smooth = proximity * proximity;
            offset = Math.sin(elapsed * 3 + dist * 0.04) * WAVE_AMP * smooth;
          }
          const q = Math.round(smooth * 24); // quantise → few colour changes
          const dx = x + offset;

          if (!started) {
            ctx.beginPath();
            ctx.moveTo(dx, y);
            runKey = q;
            started = true;
          } else if (q !== runKey) {
            ctx.lineTo(dx, y);
            ctx.strokeStyle = lineColour(runKey / 24);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(dx, y);
            runKey = q;
          } else {
            ctx.lineTo(dx, y);
          }
        }
        if (started) {
          ctx.strokeStyle = lineColour(runKey / 24);
          ctx.stroke();
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    let running = false;
    const start = () => { if (!running) { running = true; animationId = requestAnimationFrame(draw); } };
    const stop = () => { if (running) { running = false; cancelAnimationFrame(animationId); } };

    resize();
    window.addEventListener("resize", resize);

    // The section's height changes after mount as fonts/images settle, which
    // would leave the backing store stale and stretch the lines vertically.
    // Window resize alone doesn't catch that.
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { rootMargin: "200px" }
    );
    io.observe(canvas);

    return () => {
      window.removeEventListener("resize", resize);
      ro.disconnect();
      io.disconnect();
      stop();
      section?.removeEventListener("mousemove", onMouseMove);
      section?.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  // Kick off a new reveal transition whenever `active` flips.
  useEffect(() => {
    fromRef.current = revealRef.current.slice();
    targetRef.current = active ? 1 : 0;
    transitionStartRef.current = performance.now();
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden"
    />
  );
}

function lineColour(s: number): string {
  const r = Math.round(LINE_BASE_RGB[0] + (LINE_NEAR_RGB[0] - LINE_BASE_RGB[0]) * s);
  const g = Math.round(LINE_BASE_RGB[1] + (LINE_NEAR_RGB[1] - LINE_BASE_RGB[1]) * s);
  const b = Math.round(LINE_BASE_RGB[2] + (LINE_NEAR_RGB[2] - LINE_BASE_RGB[2]) * s);
  return `rgb(${r}, ${g}, ${b})`;
}

function FlipCard({ item }: { item: TestimonialItem }) {
  const companyName = deriveCompanyName(item);
  const [isFlipped, setIsFlipped] = useState(false);

  const logoContent = item.companyLogo ? (
    <div
      className="relative max-md:!w-[140px] max-md:!h-[60px]"
      style={{
        width: "min(19.5vw, 26.64vh)", height: "min(8.41vw, 13.48vh)", filter: "grayscale(1)",
      }}
    >
      <Image src={cdnImageSrc(item.companyLogo, 240)} alt={companyName} fill sizes="120px" style={{ objectFit: "contain", objectPosition: "center" }} className="max-md:!scale-[1.8]" />
    </div>
  ) : null;

  return (
    <div className="flex flex-col items-center">
      <div
        className="group relative shrink-0 max-md:!w-[clamp(240px,70vw,280px)] max-md:!aspect-[4/5] cursor-pointer"
        style={{
          width: "var(--tm-card)",
          aspectRatio: "4 / 5",
          perspective: "1000px",
        }}
        onClick={() => setIsFlipped(!isFlipped)}
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
      >
        <div
          className="relative h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ 
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
          }}
        >
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", borderRadius: "2px",
              background: "linear-gradient(180deg, #FBF7F0 0%, #F3E6CF 100%)",
            }}
          >
            <div className="flex items-center justify-center" style={{ height: "26%" }}>
              {logoContent}
            </div>
            <div className="relative" style={{ height: "74%", overflow: "hidden" }}>
              <div
                className="absolute inset-0"
                style={{
                  transform: `translate(${item.imagePositionX ?? 0}px, ${item.imagePositionY ?? 0}px) scale(${item.imageScaleFactor ?? 1})`,
                  transformOrigin: "center center",
                }}
              >
                {/* @ts-ignore */}
                <img src={cdnImageSrc(item.image || "", 800)} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "scale-down", filter: "grayscale(1)" }} />
              </div>
            </div>
          </div>

          <div
            className="absolute inset-0 flex flex-col overflow-hidden"
            style={{
              backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)",
              borderRadius: "2px", background: "linear-gradient(180deg, #EFF4FF 0%, #D3E2FF 100%)",
            }}
          >
            <div className="flex shrink-0 items-center justify-center" style={{ height: "26%" }}>
              {logoContent}
            </div>
            <div
              className="flex items-start max-md:!p-[16px]"
              style={{
                height: "74%", paddingTop: "min(0.6vw, 0.93vh)", paddingBottom: "min(1.85vw, 2.86vh)",
                paddingLeft: "min(1.85vw, 2.86vh)", paddingRight: "min(1.85vw, 2.86vh)",
              }}
            >
              {/* Level 6 + 1px. Derived from LABEL_STYLE rather than hardcoded,
                  so it still tracks the token if that ever changes — and the
                  +1 lands on both breakpoints because the whole clamp shifts
                  (12→13 floor, 17→18 ceiling, fluid middle in between).
                  LABEL_STYLE itself is shared by 11 files, so it is not
                  touched. */}
              <p
                className="m-0 font-['Poppins',_sans-serif] font-normal text-black max-md:!leading-[1.5]"
                style={{
                  ...LABEL_STYLE,
                  fontSize: `calc(${LABEL_STYLE.fontSize} + 1px)`,
                  lineHeight: "150%",
                }}
              >
                {item.text}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-[min(1.16vw,1.79vh)] flex flex-col items-center text-center max-md:!mt-[16px]">
        {/* Level 5 at weight 600 — the same "bold body" the rest of the site
            uses for names (BODY_BOLD_CLASS). Stated here rather than taken
            from a token, since levels 4-7 carry size only. */}
        <p className={`m-0 font-semibold text-black ${HERO_BODY_CLASS}`} style={HERO_BODY_STYLE}>
          {item.name}
        </p>
        <p
          className="m-0 mt-[min(0.29vw,0.45vh)] font-['Poppins',_sans-serif] font-normal text-black"
          style={{ ...LABEL_STYLE, lineHeight: "150%" }}
        >
          {item.role}
        </p>
      </div>
    </div>
  );
}

/* Circular nav arrow. Deliberately the same geometry as the navy circle
   inside ImpactAtGlance's SeeMoreButton — min(3.36vw, 5.19vh) square, white
   glyph at 45% — so the two controls read as one family. Desktop only: the
   mobile marquee stays drag/swipe. */
function MarqueeArrow({ dir, onClick }: { dir: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "left" ? "Previous testimonials" : "Next testimonials"}
      className="hidden md:flex shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-[#001A4D] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-110"
      style={{ width: "var(--tm-arrow)", height: "var(--tm-arrow)" }}
    >
      <svg className="h-[45%] w-[45%]" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d={dir === "left" ? "M15 5L8 12L15 19" : "M9 5L16 12L9 19"}
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function Marquee({ testimonials }: { testimonials: TestimonialItem[] }) {
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const speed = 1.2; 

  useEffect(() => {
    if (containerRef.current) {
      setContentWidth(containerRef.current.scrollWidth / 3);
    }
  }, [testimonials.length]);

  /* One card + one gap, measured from the DOM rather than recomputed from the
     width formula — that way it stays correct whatever the card ends up being. */
  const nudge = (dir: 1 | -1) => {
    const track = containerRef.current;
    if (!track || !contentWidth) return;
    const first = track.children[0] as HTMLElement | undefined;
    if (!first) return;
    const step =
      first.getBoundingClientRect().width +
      parseFloat(getComputedStyle(track).columnGap || "0");

    animate(x, x.get() - dir * step, {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      onComplete: () => {
        // Fold back into one content-width window so the loop stays seamless.
        let v = x.get() % contentWidth;
        if (v > 0) v -= contentWidth;
        x.set(v);
      },
    });
  };

  useAnimationFrame(() => {
    if (isDragging || isHovered) return;
    const current = x.get();
    const next = current - speed;
    if (contentWidth > 0) {
      if (next <= -contentWidth) {
        x.set(next + contentWidth);
      } else if (next > 0) {
        x.set(next - contentWidth);
      } else {
        x.set(next);
      }
    }
  });

  return (
    <div
      className="flex items-center"
      style={{
        marginLeft: "var(--section-px-wide)",
        marginRight: "var(--section-px-wide)",
        gap: "var(--tm-gap)",
        /* The arrows take the space the 0.25-card slivers used to occupy, so
           the gutters are untouched and exactly 3 whole cards sit between
           them:  arrow | gap | [card gap card gap card] | gap | arrow  */
        "--tm-gap": "min(1.85vw, 2.86vh)",
        "--tm-arrow": "min(3.36vw, 5.19vh)",
        "--tm-card":
          "calc((100vw - 2 * var(--section-px-wide) - 2 * var(--tm-arrow) - 4 * var(--tm-gap)) / 3)",
      } as React.CSSProperties}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <MarqueeArrow dir="left" onClick={() => nudge(-1)} />
      <div className="min-w-0 flex-1 overflow-hidden">
      <motion.div
        ref={containerRef}
        className="flex cursor-grab active:cursor-grabbing max-md:!gap-[24px]"
        style={{ x, gap: "var(--tm-gap)" }}
        drag="x"
        dragConstraints={{ left: -Infinity, right: Infinity }}
        dragElastic={0}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => {
          setIsDragging(false);
          if (contentWidth > 0) {
            const current = x.get();
            let newPos = current % contentWidth;
            if (newPos > 0) newPos -= contentWidth;
            x.set(newPos);
          }
        }}
      >
        {[...testimonials, ...testimonials, ...testimonials].map((item, i) => (
          <FlipCard key={`${item.name}-${i}`} item={item} />
        ))}
      </motion.div>
      </div>
      <MarqueeArrow dir="right" onClick={() => nudge(1)} />
    </div>
  );
}

export default function FoundersTestimonialClient({
  data,
}: {
  data?: FoundersTestimonialData | null;
}) {
  const topHeading = (data?.topHeadingFirst || FALLBACK_TOP_FIRST) + (data?.topHeadingSecond ? ` ${data.topHeadingSecond}` : "");
  const bottomHeadingSecond = data?.bottomHeadingSecond || FALLBACK_BOTTOM_SECOND;
  const ctaLabel = data?.ctaLabel || FALLBACK_CTA;
  const testimonials = data?.testimonials && data.testimonials.length > 0 ? data.testimonials : FALLBACK_TESTIMONIALS;

  const bottomRef = useRef<HTMLDivElement>(null);
  const bottomInView = useInView(bottomRef, { once: true, amount: 1 });

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background: "#FBF7F0",
        borderTopLeftRadius: "min(4.44vw, 7.30vh)",
        borderTopRightRadius: "min(4.44vw, 7.30vh)",
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        zIndex: 20,
      }}
    >
      <VerticalLines active={bottomInView} />

      {/* ══════════ WHITE PILL — heading + marquee ══════════ */}
      <div
        className="relative z-10 mx-auto flex w-full flex-col max-md:!mt-0 max-md:!pt-[40px]"
        style={{
          background: "#FFF", borderRadius: "min(6.66vw, 10.30vh)",
          marginTop: "min(-6.66vw, -10.30vh)", paddingTop: "min(5.79vw, 8.95vh)", paddingBottom: "min(3.47vw, 5.37vh)",
        }}
      >
        <motion.h2
     className={`m-20 flex-col text-center text-black max-md:!mx-0 max-md:!mt-0 max-md:!mb-[40px] max-md:!px-[16px] ${SECTION_HEADING_CLASS}`}
     style={{
      ...SECTION_HEADING_STYLE,
      paddingLeft: "var(--section-px-wide)", paddingRight: "var(--section-px-wide)", marginBottom: "min(3.47vw, 5.37vh)",
     }}
     initial={{ opacity: 1 }}
     viewport={{ once: true, amount: 0.4 }}
    >
          {topHeading}
        </motion.h2>

        <Marquee testimonials={testimonials} />
      </div>

      {/* ══════════ CREAM BOTTOM — "You Build the Vision" + CTA ══════════ */}
      {/* FIXED: Increased vertical padding and minimum height to expand the mobile layout drastically */}
      <div
        ref={bottomRef}
        className="relative z-10 flex w-full flex-col items-center justify-center max-md:!gap-[28px] max-md:!py-[56px] max-md:!min-h-0"
        style={{
          gap: "min(3.24vw, 5.01vh)", paddingLeft: "var(--section-px-wide)", paddingRight: "var(--section-px-wide)",
          paddingTop: "min(8.68vw, 13.43vh)", paddingBottom: "min(8.68vw, 13.43vh)",
        }}
      >
        <motion.div className="flex flex-col items-center justify-center text-center max-md:!w-full" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
          {/* FIXED: Removed whitespace-nowrap and max-width added on mobile so it breaks into 3-4 clean lines */}
          <motion.h2
            /* Cap in `em`, not px. At a fixed 280px the container stopped
               growing once the font hit its 28px mobile ceiling (~412px wide
               phones), and "Vision." — the widest of the nine words at 83px
               against 59-80px for the others — was the only one that no longer
               fitted, so English alone dropped to a second line. In em the
               container tracks the font, so every language breaks the same. */
            className={`m-0 text-center text-black max-md:!max-w-[10.8em] ${SECTION_HEADING_CLASS}`}
            style={{ ...SECTION_HEADING_STYLE, }}
            variants={{ hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } }}
          >
            You Build the{" "}
            {/* Mobile puts the word on its own line rather than trying to fit
                "You Build the <word>" on one. The nine words differ in width
                by ~2x across their scripts, so any single-line cap fits some
                and breaks others — Tamil was the last to overflow. Breaking
                deliberately is the same for every language. */}
            <br className="md:hidden" />
            <span
              className="relative inline-block px-[8px] max-md:!px-[4px] max-md:!h-[1.3em] max-md:!leading-[1.3em] max-md:!align-top"
            >
              <motion.span
                aria-hidden="true"
                className="absolute inset-0"
                style={{ background: "#D3E2FF", transformOrigin: "left" }}
                variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.8 } } }}
              />
              <TypingText delay={1.4} inView={bottomInView} />
            </span>
          </motion.h2>
          <motion.h2
            className={`m-0 mt-[min(0.58vw,0.90vh)] text-center text-black max-md:!max-w-[340px] max-md:!mt-[8px] ${SECTION_HEADING_CLASS}`}
            style={{ ...SECTION_HEADING_STYLE, }}
            variants={{ hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 } } }}
          >
            {bottomHeadingSecond}
          </motion.h2>
        </motion.div>

        <CursorFillButtonTestimonial href="/getInvestment" label={ctaLabel} />
      </div>
    </section>
  );
}

function TypingText({ delay = 0, inView = true }: { delay?: number; inView?: boolean }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [started, setStarted] = useState(false);

  // Start animation only when inView becomes true
  useEffect(() => {
    if (!inView) return;
    const startTimer = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(startTimer);
  }, [delay, inView]);

  useEffect(() => {
    if (!started) return;
    const graphemes = toGraphemes(VISION_WORDS[wordIndex].text);
    let index = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    const typeNext = () => {
      if (index <= graphemes.length) {
        setDisplayedText(graphemes.slice(0, index).join(""));
        index++;
        timeoutId = setTimeout(typeNext, 150);
      } else {
        // Hold the finished word, then hand over to the next script.
        timeoutId = setTimeout(() => {
          setDisplayedText("");
          setWordIndex((w) => (w + 1) % VISION_WORDS.length);
        }, 2000);
      }
    };

    timeoutId = setTimeout(typeNext, 150);
    return () => clearTimeout(timeoutId);
  }, [started, wordIndex]);

  const word = VISION_WORDS[wordIndex];

  // Show "Vision." in English by default until animation starts
  const textToShow = started ? displayedText : "Vision.";
  const isActiveWordEnglish = wordIndex === 0 || !started;

  return (
    <span className="relative inline-block">
      {/* The animated text is mid-word most of the time, so keep it out of the
          accessibility tree and expose the settled word instead. */}
      <span className="sr-only">Vision.</span>
      <span
        aria-hidden="true"
        className={`relative whitespace-nowrap ${isActiveWordEnglish ? "" : word.className}`}
        lang={isActiveWordEnglish ? "en" : word.bcp47}
      >
        {textToShow}
      </span>
    </span>
  );
}

function CursorFillButtonTestimonial({ href, label }: { href: string; label: string }) {
  const [origin, setOrigin] = useState("50% 50%");
  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - rect.left) / rect.width) * 100}% ${((e.clientY - rect.top) / rect.height) * 100}%`);
    setHovered(true);
  };
  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - rect.left) / rect.width) * 100}% ${((e.clientY - rect.top) / rect.height) * 100}%`);
    setHovered(false);
  };

  return (
    <Link
      href={href}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative flex shrink-0 items-center justify-center whitespace-nowrap font-['Poppins',_sans-serif] font-normal transition-colors duration-300 ${CTA_BUTTON_MOBILE_CLASS}`}
      style={{
        ...CTA_BUTTON_STYLE,
        background: hovered ? "#FFF" : "#001A4D",
        color: hovered ? "#001A4D" : "#FFF",
      }}
    >
      <span
        className="absolute inset-0 transition-transform duration-400 ease-out"
        style={{
          background: "#FFF", transformOrigin: origin, transform: hovered ? "scale(1)" : "scale(0)", borderRadius: "inherit",
        }}
      />
      <span className="relative z-10">{label}</span>
    </Link>
  );
}