"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  BODY_BOLD_CLASS,
  SECTION_HEADING_CLASS,
  SECTION_HEADING_STYLE,
} from "@/styles/heroTypography";

/* ─────────────────────────────────────────────────────────
   Types — shared with the server wrapper (OriginStory.tsx).
   ───────────────────────────────────────────────────────── */
export interface OriginBullet {
  title: string;
  desc: string;
  /** Image URLs (already CDN-resolved by the GROQ query). 1 or more. */
  images: string[];
}

export interface OriginStoryData {
  headingFirst?: string;
  headingHighlight?: string;
  bullets?: OriginBullet[];
}

/* ─────────────────────────────────────────────────────────
   Fallbacks — rendered when Sanity returns null or empty.
   Replace the placeholder images with your real assets in Studio.
   ───────────────────────────────────────────────────────── */
const FALLBACK_HEADING_FIRST = "Origin Story";
const FALLBACK_HEADING_HIGHLIGHT = "Story";
const FALLBACK_BULLETS: OriginBullet[] = [
  {
    title:
      "In 2011, we started backing founders from our own pockets. Not as a fund. Not with a thesis.",
    desc:
      "Just as founders who'd been through the chaos of building a startup from zero, and believed deeply that India was at the beginning of something historic; with the goal that we must do everything in our abilities to support the next generation of founders in achieving their dreams, **Backed before anyone else did** isn't a tagline. It's the only kind of investing we know how to do.",
    images: ["/images/ourstory/1.webp"],
  },
  {
    title: "The word ‘startup’ hadn't yet entered national parlance.",
    desc:
      "The founders we backed early were building in categories that didn't have names yet. Fintech infrastructure. On-demand services. D2C. Hyperlocal logistics. We didn't invest because the markets were obvious. We invested because the founders were exceptional.",
    images: ["/images/ourstory/2.webp"],
  },
  {
    title:
      "Over 15 years, Titan Capital has backed 300+ companies and 500+ founders.",
    desc:
      "Fifteen years on, it's a fund. But the instinct hasn't changed — back the founder first, and the rest tends to follow. Some became Indicorns. Some became unicorns. Many are still building. All of them, the ones that made it and the ones that didn't, taught us something about what it takes.",
    images: ["/images/ourstory/3.webp"],
  },
  {
    title: "Today, Titan Capital is more than a venture capital fund.",
    desc:
      "We're a community, a resource library, an amalgamation of rich experiences, an expert network, and a support system that founders can draw on at every stage. The cheque is just the beginning. Everything that follows is the relationship.",
    images: ["/images/ourstory/4.webp"],
  },
];

/* ─────────────────────────────────────────────────────────
   Sanity CDN image transform helper.
   ───────────────────────────────────────────────────────── */
function cdnImageSrc(url: string, width: number): string {
  if (!url) return url;
  if (!url.startsWith("https://cdn.sanity.io/")) return url;
  return `${url}?w=${width}&auto=format&q=85`;
}

/* ─────────────────────────────────────────────────────────
   Render bold spans inside a description string. Editors mark
   bold with double asterisks: "We backed **Razorpay** early."
   Output: a mix of text and <strong> spans.
   ───────────────────────────────────────────────────────── */
function renderDesc(desc: string): React.ReactNode[] {
  const parts = desc.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className={BODY_BOLD_CLASS}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

/* ─────────────────────────────────────────────────────────
   Bullet dot — 95×95 SVG with radial-gradient glow + solid
   dark-blue center. Pure SVG; identical across viewports.
   ───────────────────────────────────────────────────────── */
function BulletDot({ uniqueId }: { uniqueId: string }) {
  // Use a per-instance gradient id so multiple dots on the same page
  // don't share the same SVG def (would render only the first one in
  // some browsers).
  const gradId = `bulletDotGlow-${uniqueId}`;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="95"
      height="95"
      viewBox="0 0 95 95"
      fill="none"
      aria-hidden
      style={{
        width: "clamp(56px, min(6.6vw, 9.7vh), 95px)",
        height: "clamp(56px, min(6.6vw, 9.7vh), 95px)",
        flexShrink: 0,
      }}
    >
      <circle cx="47.5" cy="47.5" r="47.5" fill={`url(#${gradId})`} />
      <circle cx="47.5" cy="47.5" r="11.5" fill="#001A4D" />
      <defs>
        <radialGradient
          id={gradId}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(47.5 47.5) rotate(90) scale(47.5 54.4825)"
        >
          <stop offset="0.0625" stopColor="#D3E2FF" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
   Image deck — 437×542 front card with two rotated shadow
   cards behind it. Auto-cycles through the images every 4s
   (front card flips to next; backs hold for visual depth).
   ───────────────────────────────────────────────────────── */
function ImageDeck({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 4000);
    return () => clearInterval(id);
  }, [images.length]);

  // Common card sizing — fluid clamp matching the 437×542 design.
  const cardStyle: React.CSSProperties = {
    width: "clamp(220px, min(30.3vw, 44.5vh), 437px)",
    aspectRatio: "437 / 542",
    borderRadius: "2px",
  };

  return (
    <div className="relative" style={cardStyle}>
      {/* Back shadow card — rotated counter-clockwise */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[#DDD]"
        style={{
          ...cardStyle,
          transform: "rotate(-5.26deg)",
          width: "100%",
          height: "100%",
        }}
      />
      {/* Mid shadow card — rotated clockwise */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[#DDD]"
        style={{
          ...cardStyle,
          transform: "rotate(6.005deg)",
          width: "100%",
          height: "100%",
        }}
      />
      {/* Front image — cross-fades on index change */}
      {images.map((src, i) => (
        <motion.div
          key={src + i}
          className="absolute inset-0 overflow-hidden bg-[#DDD]"
          style={{ ...cardStyle, width: "100%", height: "100%" }}
          animate={{
            opacity: i === index ? 1 : 0,
            scale: i === index ? 1 : 0.97,
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <Image
            src={cdnImageSrc(src, 900)}
            alt={alt}
            fill
            sizes="(max-width: 768px) 70vw, 437px"
            className="object-cover"
            // The source photos ship with their own rounded corners; a
            // slight zoom pushes those corners outside the frame so the
            // card reads with the container's sharp 2px radius instead.
            style={{ transform: "scale(1.06)" }}
          />
        </motion.div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Animated dashed connector. Path draws in on scroll via
   Framer Motion's pathLength tween. Hidden on mobile.
   ───────────────────────────────────────────────────────── */
function Connector({ index }: { index: number }) {
  // Pre-defined paths from the design spec.
  const paths = [
    {
      d: "M0.5 0.5C0.5 95 114.555 155.5 316 155.5C587 155.5 698.5 241.5 710.5 285",
      w: 711,
      h: 286,
    },
    {
      d: "M749.996 0.0786133C749.996 0.0786133 729.996 126.079 413.496 144.079C113.496 161.14 4.32943 308.079 0.496094 343.579",
      w: 751,
      h: 344,
    },
    {
      d: "M0.5 0.5C0.5 42 113.5 168 348.5 168C632.636 168 659.5 277.15 671.5 332.5",
      w: 672,
      h: 333,
    },
  ];
  const p = paths[index % paths.length];

  /*
    Scroll-driven mask reveal — top-to-bottom, one-way only.
      - useScroll tracks the connector's position in the viewport.
      - `maxProgress` mirrors scrollYProgress but only ever GROWS —
        scrolling back up doesn't un-draw the line.
      - The mask rect grows DOWNWARD (height increases from 0 → full).
        Top-to-bottom is universal: it matches the scroll direction
        no matter which way the curve sweeps horizontally, so every
        path reveals naturally from its top to its bottom.
      - stroke-dasharray is untouched, so dashes stay dashes.
  */
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.35"],
  });
  // Monotonic mirror of scrollYProgress: only advances, never rewinds.
  const maxProgress = useMotionValue(0);
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest > maxProgress.get()) maxProgress.set(latest);
  });
  const revealHeight = useTransform(maxProgress, [0, 1], [0, p.h]);
  const maskId = `origin-connector-mask-${index}`;

  return (
    <div
      ref={ref}
      aria-hidden
      className="hidden w-full md:flex md:justify-center"
      style={{ marginTop: "clamp(-40px, -3vw, -16px)" }}
    >
      <svg
        viewBox={`0 0 ${p.w} ${p.h}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: "min(80%, 800px)",
          height: "auto",
        }}
      >
        <defs>
          <mask id={maskId}>
            {/* black = hidden, white = visible. Rect grows downward with scroll. */}
            <motion.rect
              x={0}
              y={0}
              width={p.w}
              height={revealHeight}
              fill="white"
            />
          </mask>
        </defs>
        <path
          d={p.d}
          stroke="#000"
          strokeWidth="1"
          strokeDasharray="16 16"
          strokeLinecap="round"
          mask={`url(#${maskId})`}
        />
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Single bullet row — content (dot + title + desc) on one
   side and image deck on the other. Layout flips per row.
   On mobile, image stacks below content.
   ───────────────────────────────────────────────────────── */
function BulletRow({
  bullet,
  reversed,
  index,
}: {
  bullet: OriginBullet;
  reversed: boolean;
  index: number;
}) {
  return (
    <motion.div
      className={`mx-auto flex w-full max-w-[1330px] flex-col items-center gap-[clamp(24px,3vw,48px)] ${
        reversed ? "lg:flex-row-reverse" : "lg:flex-row"
      } lg:items-center lg:justify-between`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      {/* Content column — dot inline with title's first line, desc
          hanging beneath the title text (not under the dot).
          Per design spec:
            Title — Poppins 500, 36px max, 158% line-height, max-w 711px
            Desc  — Poppins 400 (700 for **bold**), 24px max, 150% LH, max-w 669px
          Sizes use the site's standard clamp(MIN, min(vw, vh), MAX)
          so the section shrinks gracefully on every viewport in
          multiview (1097×617 short laptops → 2560×1600 4K). */}
      <div
        className="flex w-full flex-row items-start lg:max-w-[760px]"
        style={{ gap: "clamp(10px, min(1.2vw, 1.8vh), 22px)" }}
      >
        {/* Dot centered on the title's FIRST line: the wrapper's height
            equals one title line-box (1.58 × the title font-size clamp), so
            the dot's core lines up with line 1 at every viewport. The dot
            (with its wide glow) overflows the wrapper equally top/bottom.
            marginLeft pulls the glow halo into the left gutter. */}
        <div
          className="flex shrink-0 items-center justify-center"
          style={{
            height: "calc(1.58 * clamp(20px, min(2.5vw, 3.67vh), 36px))",
            marginLeft: "clamp(-22px, -2vw, -10px)",
          }}
        >
          <BulletDot uniqueId={`b${index}`} />
        </div>
        <div
          className="flex flex-1 flex-col"
          style={{ gap: "clamp(12px, min(1.4vw, 2vh), 24px)" }}
        >
          <h3
            className="m-0 font-['Poppins',_sans-serif] font-medium text-black"
            style={{
              fontSize: "clamp(20px, min(2.5vw, 3.67vh), 36px)",
              lineHeight: "158%",
              maxWidth: "711px",
            }}
          >
            {bullet.title}
          </h3>
          <p
            className="m-0 font-['Poppins',_sans-serif] font-normal text-black/85"
            style={{
              fontSize: "clamp(14px, min(1.67vw, 2.44vh), 24px)",
              lineHeight: "150%",
              maxWidth: "669px",
            }}
          >
            {renderDesc(bullet.desc)}
          </p>
        </div>
      </div>

      {/* Image column */}
      <div className="flex w-full justify-center lg:w-auto lg:justify-end">
        <ImageDeck images={bullet.images} alt={bullet.title} />
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main component.
   ───────────────────────────────────────────────────────── */
export default function OriginStoryClient({
  data,
}: {
  data?: OriginStoryData | null;
}) {
  const headingFirst = data?.headingFirst || FALLBACK_HEADING_FIRST;
  const headingHighlight =
    data?.headingHighlight || FALLBACK_HEADING_HIGHLIGHT;
  const bullets =
    data?.bullets && data.bullets.length > 0 ? data.bullets : FALLBACK_BULLETS;

  return (
    <section
      className="relative flex w-full flex-col items-center overflow-hidden bg-[#FBF7F0]"
      style={{
        // Rounded top + bottom corners (same treatment as the "Their
        // Stories" section in ImpactAtGlance) — the white hero above and
        // white FifteenYears below show through the curved corners.
        borderRadius: "min(4.44vw, 7.30vh)",
        paddingTop: "clamp(48px, min(7vw, 10vh), 120px)",
        paddingBottom: "clamp(48px, min(7vw, 10vh), 120px)",
        paddingLeft: "var(--section-px-wide, 5%)",
        paddingRight: "var(--section-px-wide, 5%)",
      }}
    >
      {/* ── HEADING — both words on the same line, side-by-side ── */}
      <motion.div
        className="flex flex-row flex-wrap items-baseline justify-center text-center max-md:!mb-[clamp(32px,6dvh,48px)]"
        style={{ gap: "clamp(8px, min(1vw, 1.5vh), 18px)", marginBottom: "min(3.47vw, 5.37vh)" }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
      >
        <motion.h2
   className={`m-0 text-center text-black ${SECTION_HEADING_CLASS}`}
   style={{ ...SECTION_HEADING_STYLE, }}
   variants={{
   hidden: { opacity: 0, y: 40 },
   visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
   },
   }}
  >
          {headingFirst}
        </motion.h2>

        {/* <motion.div
          className="relative inline-flex items-center justify-center overflow-hidden bg-transparent px-[10px] py-[6px] md:px-[14px] md:py-[10px]"
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.6, ease: "easeOut", delay: 0.3 },
            },
          }}
        >
          <motion.span
            className="absolute inset-0 z-0 h-full w-full bg-[#D3E2FF]"
            style={{ transformOrigin: "left", borderRadius: "4px" }}
            variants={{
              hidden: { scaleX: 0 },
              visible: {
                scaleX: 1,
                transition: { duration: 0.6, ease: "easeInOut", delay: 0.8 },
              },
            }}
          />
          <span
            className={`relative z-10 text-[#001A4D] ${SECTION_HEADING_CLASS}`}
            style={SECTION_HEADING_STYLE}
          >
            {headingHighlight}
          </span>
        </motion.div> */}
      </motion.div>

      {/* ── BULLETS + CONNECTORS ── */}
      <div className="flex w-full flex-col">
        {bullets.map((bullet, i) => (
          <div key={i} className="w-full">
            <BulletRow bullet={bullet} reversed={i % 2 === 1} index={i} />
            {i < bullets.length - 1 && <Connector index={i} />}
          </div>
        ))}
      </div>
    </section>
  );
}
