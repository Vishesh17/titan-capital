"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";

/* ─────────────────────────────────────────────────────────
   Types shared with the server wrapper (ImpactAtGlance.tsx)
   ───────────────────────────────────────────────────────── */
export interface ImpactStat {
  num: string;
  label: string;
  caption?: string;
}

export interface FounderStory {
  name: string;
  role: string;
  image: string;
  logo: string;
  /** Per-logo size multiplier (1 = base 59 px height). Lets editors
   *  even out logos that look too big/small at a uniform height. */
  logoScale?: number;
  text: string;
}

export interface ImpactAtGlanceData {
  impactHeadingFirst?: string;
  impactHeadingSecond?: string;
  storiesHeadingFirst?: string;
  storiesHeadingSecond?: string;
  ctaLabel?: string;
  impactStats?: ImpactStat[];
  founderStories?: FounderStory[];
}

/* ─────────────────────────────────────────────────────────
   Fallback defaults — keeps the page rendering exactly as
   today if Sanity returns null or a field is missing.
   ───────────────────────────────────────────────────────── */
const FALLBACK_IMPACT_DATA: ImpactStat[] = [
  { num: "300+", label: "Startup\nBacked" },
  { num: "7",    label: "Unicorns\n$1B+" },
  { num: "4",    label: "IPOs\n2023-2026" },
  { num: "15",   label: "Years\nInvesting" },
  { num: "40+",  label: "Values\n> $100M" },
  { num: "250M+", label: "Lives\nImpacted" },
];

const FALLBACK_SLIDES: FounderStory[] = [
  {
    name: "Ashish Mohapatra",
    role: "Co-Founder & CEO, Ofbusiness",
    image: "/images/misc/5.webp",
    logo: "/images/logos/Ofbusiness.png",
    text: `"Building anything meaningful demands everything you have. It's never easy, but it's always worth it."`,
  },
  {
    name: "Abhishek Bansal",
    role: "Co-Founder and CEO, Shadowfax",
    image: "/images/misc/6.webp",
    logo: "/images/logos/Shadowfax.svg",
    text: `"In India, logistics isn't just about speed. It's about reaching the right place even when the address is wrong."`,
  },
  {
    name: "Harshil Mathur",
    role: "Co-founder and CEO of Razorpay",
    image: "/images/misc/3.webp",
    logo: "/images/logos/Razorpay-logo.webp",
    text: `"The vision was never just to be a payment gateway. It was to be the financial nervous system for a business."`,
  },
];

const FALLBACK_IMPACT_HEADING_FIRST = "Impact";
const FALLBACK_IMPACT_HEADING_SECOND = "At A Glance";
const FALLBACK_STORIES_HEADING_FIRST = "Their Stories,";
const FALLBACK_STORIES_HEADING_SECOND = "Our Credentials";
const FALLBACK_CTA_LABEL = "See More";

/* Append Sanity CDN transform params for served images. Local /images/...
   URLs pass through unchanged so the fallback path is unaffected. */
function cdnImageSrc(url: string, width: number): string {
  if (url.startsWith("https://cdn.sanity.io/")) {
    return `${url}?w=${width}&auto=format&q=85`;
  }
  return url;
}

/* ─────────────────────────────────────────────────────────
   RollingNumber — slot-machine style rolling counter,
   ported from PortfolioStats.tsx. Splits a stat like
   "300+" / "$4B+" into prefix + rolling digits + suffix,
   then animates each digit column from 0 up to its target
   value via a translate-Y on a column of 20 numerals.
   Inherits `hidden` / `visible` variants from its parent
   motion tree, so it fires when the containing stat item
   scrolls into view.
   ───────────────────────────────────────────────────────── */
const parseStat = (val: string) => {
  const match = val.match(/^([^0-9]*)([0-9]+)([^0-9]*)$/);
  if (match) {
    return { prefix: match[1], numberStr: match[2], suffix: match[3] };
  }
  return { prefix: "", numberStr: val, suffix: "" };
};

function RollingNumber({ value }: { value: string }) {
  const { prefix, numberStr, suffix } = parseStat(value);
  const rollDuration = numberStr.length === 1 ? 2.8 : 1.5;
  const digitStagger = 0.15;

  const digitVariants = {
    hidden: { y: "0%" },
    visible: (custom: { num: number; index: number }) => ({
      y: `-${(10 + custom.num) * 5}%`,
      transition: {
        duration: rollDuration,
        delay: custom.index * digitStagger,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    }),
  };

  return (
    <span className="inline-flex flex-row items-center leading-none">
      {prefix && <span>{prefix}</span>}
      <span className="inline-flex flex-row">
        {numberStr.split("").map((digit, i) => {
          const num = parseInt(digit, 10);
          const column = Array.from({ length: 20 }, (_, idx) => idx % 10);
          return (
            <span
              key={i}
              className="relative inline-flex flex-col overflow-hidden"
              style={{ height: "1.2em" }}
            >
              <motion.span
                variants={digitVariants}
                custom={{ num, index: i }}
                className="flex flex-col"
              >
                {column.map((n, idx) => (
                  <span
                    key={idx}
                    className="flex items-center justify-center leading-none"
                    style={{ height: "1.2em" }}
                  >
                    {n}
                  </span>
                ))}
              </motion.span>
            </span>
          );
        })}
      </span>
      {suffix && <span>{suffix}</span>}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────
   ImpactStatCell — one cell of the 3×2 impact grid:
   [1 px × 208 px vertical line] + [rolling number (96 px)]
   + [description (40 px, capitalize, preserves newlines)].
   ───────────────────────────────────────────────────────── */
function ImpactStatCell({ stat }: { stat: ImpactStat }) {
  return (
    <motion.div
      className="flex flex-row items-start max-md:!gap-[10px]"
      style={{ gap: "min(1.85vw, 2.86vh)" /* ~32 px @ ref */ }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {/* Vertical line — draws top→bottom (scaleY) when the section
          scrolls into view, inheriting the cell's visible variant. */}
      <motion.div
        className="shrink-0 origin-top bg-black max-md:!h-[80px]"
        style={{
          width: "1px",
          height: "min(13.89vw, 21.49vh)" /* ~240 px @ ref (bigger) */,
        }}
        variants={{
          hidden: { scaleY: 0 },
          visible: {
            scaleY: 1,
            transition: { duration: 1.0, ease: [0.22, 1, 0.36, 1] },
          },
        }}
      />

      {/* Number + description stack */}
      <div className="flex flex-col">
        <span
          className="font-['Poppins',_sans-serif] font-normal capitalize text-black max-md:!text-[36px]"
          style={{
            fontSize: "min(6.48vw, 10.03vh)" /* 112 px @ ref (bigger) */,
            lineHeight: "150%",
          }}
        >
          <RollingNumber value={stat.num} />
        </span>
        <span
          className="whitespace-pre-line font-['Poppins',_sans-serif] font-normal capitalize text-black max-md:!text-[14px]"
          style={{
            fontSize: "min(2.55vw, 3.94vh)" /* 44 px @ ref (bigger) */,
            lineHeight: "98%",
            marginTop: "min(1.16vw, 1.79vh)" /* ~20 px @ ref */,
          }}
        >
          {stat.label}
        </span>
      </div>
    </motion.div>
  );
}

/* Derive the company name shown as the card's "logo" (uppercase
   text, per the Figma). Roles look like "Co-Founder & CEO, Ofbusiness"
   (comma) or "Co-founder and CEO of Razorpay" (…of X) — handle both,
   fall back to the founder's name. */
function deriveCompany(story: FounderStory): string {
  const role = story.role || "";
  if (role.includes(",")) return role.split(",").pop()!.trim();
  const m = role.match(/\bof\s+(.+)$/i);
  if (m) return m[1].trim();
  return story.name;
}

/* Opening quotation-mark glyph (42 × 33 @ ref), white — shown above
   the pull-quote in the opened card. Verbatim from the Figma export. */
function QuoteMarkIcon() {
  return (
    <svg
      viewBox="0 0 42 33"
      fill="none"
      aria-hidden
      style={{ width: "min(2.43vw, 3.76vh)", height: "min(1.91vw, 2.95vh)" }}
    >
      <path
        d="M24.5946 22.5385C24.5946 15.948 26.7387 9.90141 31.027 4.3987C33.7387 1.07148 35.9144 -0.368185 37.5541 0.0797102C39.0676 0.655575 39.8243 1.51937 39.8243 2.6711C39.8243 3.75885 39.3198 4.91058 38.3108 6.12629C37.3649 7.34201 36.6081 8.33378 36.0405 9.1016C35.473 9.86942 35 10.7012 34.6216 11.597C33.7387 13.3886 33.2973 15.5641 33.2973 18.1235C34.8108 17.6756 36.3243 17.8675 37.8378 18.6994C40.6126 20.299 42 22.3465 42 24.8419C42 27.2733 41.2432 29.2569 39.7297 30.7925C38.2793 32.2642 36.2613 33 33.6757 33C31.0901 33 28.9144 32.0082 27.1486 30.0247C25.4459 27.9772 24.5946 25.4818 24.5946 22.5385ZM0 22.5385C0 15.6921 2.11261 9.64547 6.33784 4.3987C9.55405 0.495613 12.2342 -0.68811 14.3784 0.84753C14.8198 1.16746 15.0405 1.67934 15.0405 2.38317C15.0405 3.66287 14.5676 4.91058 13.6216 6.12629C12.7387 7.34201 12.0135 8.33378 11.4459 9.1016C10.8784 9.86942 10.4054 10.7012 10.027 11.597C9.14414 13.3886 8.7027 15.5641 8.7027 18.1235C10.2162 17.6756 11.6982 17.8675 13.1486 18.6994C15.8604 20.299 17.2162 22.3465 17.2162 24.8419C17.2162 27.2733 16.491 29.2569 15.0405 30.7925C13.5901 32.2642 11.5721 33 8.98649 33C6.4009 33 4.25676 32.0082 2.55405 30.0247C0.851351 27.9772 0 25.4818 0 22.5385Z"
        fill="white"
      />
    </svg>
  );
}

/* Up-right "open" arrow (37 × 37 @ ref) shown top-right on hover.
   Verbatim from the Figma export. */
function StoryArrow() {
  return (
    <svg
      viewBox="0 0 37 37"
      fill="none"
      aria-hidden
      style={{ width: "min(2.14vw, 3.31vh)", height: "min(2.14vw, 3.31vh)" }}
    >
      <path
        d="M0.585786 33.5858C-0.195262 34.3668 -0.195262 35.6332 0.585786 36.4142C1.36683 37.1953 2.63317 37.1953 3.41421 36.4142L2 35L0.585786 33.5858ZM37 2C37 0.89543 36.1046 0 35 0H17C15.8954 0 15 0.89543 15 2C15 3.10457 15.8954 4 17 4H33V20C33 21.1046 33.8954 22 35 22C36.1046 22 37 21.1046 37 20V2ZM2 35L3.41421 36.4142L36.4142 3.41421L35 2L33.5858 0.585786L0.585786 33.5858L2 35Z"
        fill="black"
      />
    </svg>
  );
}

/* Card logo — the Sanity-uploaded company logo (square 400×400),
   rendered white at a uniform height so all four line up, with an
   optional per-logo scale from the CMS. `origin` sets the scale/anchor
   corner. Falls back to the uppercase company name if a story has no
   logo set. Shared between the closed (bottom-right) and open
   (bottom-left) states so there's a single source of truth. */
function CardLogo({
  story,
  company,
  origin,
}: {
  story: FounderStory;
  company: string;
  origin: "left bottom" | "right bottom";
}) {
  if (!story.logo) {
    return (
      <span
        className="whitespace-nowrap font-['Poppins',_sans-serif] font-semibold uppercase text-white max-md:!text-[18px]"
        style={{ fontSize: "min(1.85vw, 2.86vh)", lineHeight: "155%" }}
      >
        {company}
      </span>
    );
  }
  return (
    <Image
      src={cdnImageSrc(story.logo, 400)}
      alt={company}
      width={400}
      height={400}
      className="object-contain"
      style={{
        height: "min(5.09vw, 7.88vh)" /* ~88 px @ ref — uniform, bigger */,
        width: "auto",
        filter: "brightness(0) invert(1)" /* force logo white */,
        transform: `scale(${story.logoScale ?? 1})`,
        transformOrigin: origin,
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────
   StoryCard — one card in the 2×2 grid of founder stories.
   Default: founder image + dark hard-light gradient + the company
   logo pinned BOTTOM-RIGHT. On hover the up-right arrow fades in
   top-right and the full content (logo + quote-mark + pull-quote +
   attribution) fades up from the bottom-left. All type sizes are
   the exact Figma spec as min(vw,vh) off the 1728×1117 reference.
   ───────────────────────────────────────────────────────── */
function StoryCard({ story }: { story: FounderStory }) {
  const [hovered, setHovered] = useState(false);
  const company = deriveCompany(story);

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative w-full cursor-pointer overflow-hidden"
      style={{
        borderRadius: "2px",
        /* 656.5 × 579 (Figma) — width fills the column; the near-square
           ratio fits the 1:1 founder photos without over-cropping. */
        aspectRatio: "656.5 / 579",
      }}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.4 },
        },
      }}
    >
      {/* Background image */}
      <Image
        src={cdnImageSrc(story.image, 900)}
        alt={story.name}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Gradient overlay — transparent top → #151515 bottom with
          hard-light blend (Figma: rgba(217,217,217,0) → #151515 @77.16%). */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(217, 217, 217, 0.00) 0%, #151515 77.16%)",
          mixBlendMode: "hard-light",
        }}
        aria-hidden
      />

      {/* Up-right arrow, fades in on hover */}
      <motion.div
        className="absolute z-10"
        style={{
          top: "min(1.85vw, 2.86vh)" /* ~32 px @ ref */,
          right: "min(1.85vw, 2.86vh)",
        }}
        initial={false}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <StoryArrow />
      </motion.div>

      {/* CLOSED state — logo pinned to the BOTTOM-LEFT corner.
          Fades out on hover as the full content takes over. */}
      <motion.div
        className="pointer-events-none absolute z-10"
        style={{
          bottom: "min(1.85vw, 2.86vh)" /* ~32 px @ ref */,
          left: "min(1.85vw, 2.86vh)",
        }}
        initial={false}
        animate={{ opacity: hovered ? 0 : 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <CardLogo story={story} company={company} origin="left bottom" />
      </motion.div>

      {/* OPEN state — full content (logo + quote-mark + pull-quote +
          attribution) at the bottom-left, fades up on hover. */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-10 flex flex-col items-start text-white"
        style={{ padding: "min(1.85vw, 2.86vh)" /* ~32 px @ ref */ }}
        initial={false}
        animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 14 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <CardLogo story={story} company={company} origin="left bottom" />
        <div style={{ paddingTop: "min(0.93vw, 1.43vh)" /* ~16 px */ }}>
          <QuoteMarkIcon />
          {/* Description (Poppins 24 / 500 / 150% / #FFF, width 574) */}
          <p
            className="m-0 font-['Poppins',_sans-serif] font-medium text-white max-md:!text-[14px]"
            style={{
              fontSize: "min(1.39vw, 2.15vh)" /* 24 px @ ref */,
              lineHeight: "150%",
              maxWidth: "min(33.22vw, 51.39vh)" /* 574 px @ ref */,
              marginTop: "min(0.70vw, 1.07vh)" /* ~12 px */,
            }}
          >
            {story.text}
          </p>
          {/* Founder attribution (Poppins 14 / 500 / 150% / #FFF) */}
          <p
            className="m-0 font-['Poppins',_sans-serif] font-medium text-white max-md:!text-[11px]"
            style={{
              fontSize: "min(0.81vw, 1.25vh)" /* 14 px @ ref */,
              lineHeight: "150%",
              marginTop: "min(0.93vw, 1.43vh)" /* ~16 px */,
            }}
          >
            — {story.name}, {story.role}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   SeeMoreButton — starts as a 64 px dark-navy circle with a
   diagonal arrow. On hover the circle stays but the button
   expands leftward into a 243 × 83 white pill, revealing the
   "See More" label. Width + colours + label opacity animate
   together for a smooth reveal.
   ───────────────────────────────────────────────────────── */
function SeeMoreButton({ label, onClick }: { label: string; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative cursor-pointer overflow-hidden"
      /* Only WIDTH + colours animate (numbers/colours → smoothly
         interpolatable). BOTH the label and the knob are ABSOLUTELY
         positioned — the knob pinned to the right edge, so as the pill
         widens the arrow rides to the right; the label fades in on the
         left. No flex/justify to snap or reflow → smooth both ways. */
      animate={{
        width: hovered ? 243 : 64,
        backgroundColor: hovered ? "#FFFFFF" : "rgba(255,255,255,0)",
        borderColor: hovered ? "#575757" : "rgba(87,87,87,0)",
      }}
      transition={{
        width: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        backgroundColor: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
        borderColor: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
      }}
      style={{
        height: 64 /* CONSTANT — no vertical layout shift */,
        borderRadius: 999,
        borderWidth: 1,
        borderStyle: "solid",
        boxSizing: "border-box",
      }}
      aria-label={label}
    >
      {/* Label — absolute on the left. Fades in AFTER the pill opens
          (delay on the way in), fades out immediately on the way out. */}
      <motion.span
        className="pointer-events-none absolute -translate-y-1/2 whitespace-nowrap font-['Poppins',_sans-serif] font-normal text-black"
        style={{ left: 28, top: "50%", fontSize: "22px", lineHeight: "100%" }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{
          duration: hovered ? 0.28 : 0.15,
          delay: hovered ? 0.24 : 0,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {label}
      </motion.span>

      {/* Navy circle knob (arrow) — absolute, pinned to the RIGHT edge,
          vertically centred. Rides right as the pill widens. The diagonal
          ↗ glyph starts rotated to point RIGHT (→) and smoothly rotates to
          its natural ↗ orientation on hover as the pill opens. */}
      <div
        className="absolute -translate-y-1/2 flex items-center justify-center rounded-full"
        style={{
          right: 6,
          top: "50%",
          width: 52,
          height: 52,
          background: "#001A4D",
        }}
      >
        <motion.svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          animate={{ rotate: hovered ? 0 : 45 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <path
            d="M7 17L17 7M17 7H7M17 7V17"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </div>
    </motion.button>
  );
}

/* Pad the stories array up to N slots by cycling the input.
   Design needs exactly 4 cards; if the CMS has fewer, we
   loop back to the first story to fill the last slot(s). */
function padStories(stories: FounderStory[], count: number): FounderStory[] {
  if (stories.length >= count) return stories.slice(0, count);
  const result: FounderStory[] = [];
  for (let i = 0; i < count; i++) {
    result.push(stories[i % stories.length]);
  }
  return result;
}

/* ─────────────────────────────────────────────────────────
   StoriesSection — full-width, opaque-white card that flows
   naturally after Impact. Because Impact is sticky, Impact
   stays pinned while this section scrolls UP into view over
   it (covering it from bottom to top). Scroll up reverses.
   Only the top corners are rounded (115 px) so the reveal
   looks like a sheet sliding over the section behind it.
   No scroll-linked JS — the sticky parent does the work.
   ───────────────────────────────────────────────────────── */
function StoriesSection({
  storiesHeadingFirst,
  storiesHeadingSecond,
  ctaLabel,
  slides,
}: {
  storiesHeadingFirst: string;
  storiesHeadingSecond: string;
  ctaLabel: string;
  slides: FounderStory[];
}) {
  /* SCROLL-LINKED rules — the centre vertical + horizontal lines draw in
     lockstep with the user's scroll through the grid (and retract when
     scrolling back up), instead of a one-shot in-view trigger. */
  const gridRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: gridRef,
    /* 0 when the grid's top reaches 85% of the viewport (just entering);
       1 only when its bottom reaches 60% — so the lines keep drawing across
       the ENTIRE scroll through both card rows, in lockstep with the user. */
    offset: ["start 0.85", "end 0.6"],
  });
  /* The vertical rule draws across the FULL scroll range (never finishes
     early); horizontals join from ~a quarter in. Both scrub forward AND
     backward with the scroll. */
  const vRuleScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const hRuleScale = useTransform(scrollYProgress, [0.25, 1], [0, 1]);

  return (
    <section
      className="relative w-full"
      style={{
        background: "#FFF",
        /* All four corners rounded — Stories is a floating card. The
           rounded TOP reveals the cream Impact section behind (Impact
           is sticky, sits under Stories via z-index). The rounded
           BOTTOM reveals the navy Indicorns section behind — but only
           because we pull Indicorns up under Stories via the negative
           marginBottom below. Without that overlap, the bottom
           corners would just show the wrapper's own bg-white and the
           radius would be invisible. */
        borderRadius: "min(6.66vw, 10.30vh)" /* 115 px @ ref, all corners */,
        /* Overlap the next section (Indicorns) by exactly the corner
           radius, so the bottom-corner cutouts sit ON TOP of navy. */
        marginBottom: "min(-6.66vw, -10.30vh)" /* -115 px @ ref */,
        overflow: "hidden",
        zIndex: 10,
        paddingTop: "min(5.79vw, 8.95vh)" /* ~100 px @ ref */,
        paddingBottom: "min(5.79vw, 8.95vh)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <motion.div
        className="mx-auto flex w-full flex-col items-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={{
          hidden: {},
          visible: {
            /* Their Stories reveal is deliberately delayed so it lands
               after the section settles (per request). */
            transition: { staggerChildren: 0.18, delayChildren: 0.45 },
          },
        }}
      >
        {/* HEADING — Their Stories / Our Credentials (78 px Poppins 400) */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
            },
          }}
          className="flex flex-col items-center"
          style={{ marginBottom: "min(3.47vw, 5.37vh)" /* ~60 px */ }}
        >
          <h2
            className="m-0 text-center font-['Poppins',_sans-serif] font-normal text-black max-md:!text-[32px] max-md:!leading-[120%]"
            style={{
              fontSize: "min(4.51vw, 6.98vh)" /* 78 px @ ref */,
              lineHeight: "150%",
            }}
          >
            {storiesHeadingFirst}
          </h2>
          <h2
            className="m-0 text-center font-['Poppins',_sans-serif] font-normal text-black max-md:!text-[32px] max-md:!leading-[120%]"
            style={{
              fontSize: "min(4.51vw, 6.98vh)" /* 78 px @ ref */,
              lineHeight: "150%",
            }}
          >
            {storiesHeadingSecond}
          </h2>
        </motion.div>

        {/* 2×2 grid on desktop, 1×4 on mobile */}
        <div ref={gridRef} className="relative w-full max-w-[1440px]">
          <div
            className="grid w-full grid-cols-2 max-md:!grid-cols-1"
            style={{ gap: "min(14.47vw, 22.38vh)" /* 250 px @ ref */ }}
          >
            {padStories(slides, 4).map((story, i) => (
              <StoryCard key={`${story.name}-${i}`} story={story} />
            ))}
          </div>

          {/* VERTICAL rule — down the centre column gap. SCROLL-LINKED:
              draws top→bottom as you scroll into the grid, and retracts
              when you scroll back up (scaleY scrubbed by scroll). */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute max-md:!hidden"
            style={{
              left: "50%",
              marginLeft: "-0.5px",
              top: 0,
              bottom: 0,
              width: 1,
              background: "#D8D8D8",
              transformOrigin: "top",
              scaleY: vRuleScale,
            }}
          />

          {/* HORIZONTAL rules — two segments across the centre row gap.
              SCROLL-LINKED: draw outward from the centre slightly after
              the vertical rule, scrubbed by the same scroll progress. */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute max-md:!hidden"
            style={{
              left: 0,
              top: "50%",
              marginTop: "-0.5px",
              width: "calc((100% - min(14.47vw, 22.38vh)) / 2)" /* adjusted */,
              height: 1,
              background: "#D8D8D8",
              transformOrigin: "right",
              scaleX: hRuleScale,
            }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute max-md:!hidden"
            style={{
              right: 0,
              top: "50%",
              marginTop: "-0.5px",
              width: "calc((100% - min(14.47vw, 22.38vh)) / 2)" /* adjusted */,
              height: 1,
              background: "#D8D8D8",
              transformOrigin: "left",
              scaleX: hRuleScale,
            }}
          />
        </div>

        {/* See More button — circle → pill on hover */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
            },
          }}
          style={{ marginTop: "min(3.47vw, 5.37vh)" /* ~60 px */ }}
        >
          <SeeMoreButton label={ctaLabel} />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ── MAIN COMPONENT ── */
export default function ImpactAtGlanceClient({ data }: { data?: ImpactAtGlanceData | null }) {
  /* Per-field fallback so a partially-filled Sanity document still renders. */
  const impactHeadingFirst = data?.impactHeadingFirst || FALLBACK_IMPACT_HEADING_FIRST;
  const impactHeadingSecond = data?.impactHeadingSecond || FALLBACK_IMPACT_HEADING_SECOND;
  const storiesHeadingFirst = data?.storiesHeadingFirst || FALLBACK_STORIES_HEADING_FIRST;
  const storiesHeadingSecond = data?.storiesHeadingSecond || FALLBACK_STORIES_HEADING_SECOND;
  const ctaLabel = data?.ctaLabel || FALLBACK_CTA_LABEL;
  const impactData =
    data?.impactStats && data.impactStats.length > 0 ? data.impactStats : FALLBACK_IMPACT_DATA;
  const slides =
    data?.founderStories && data.founderStories.length > 0
      ? data.founderStories
      : FALLBACK_SLIDES;

  const [centerIndex, setCenterIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHoveringCenter, setIsHoveringCenter] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  /* Auto-advance impact carousel every 2.5s — pauses when user
     is interacting (hovering the centre item or after a click). */
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCenterIndex((prev) => (prev + 1) % impactData.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [isPaused, impactData.length]);

  /* Auto-advance stories every 5s */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentSlide];

  /* Compute shortest-path diff from center for wrapping carousel */
  const getDiff = useCallback(
    (index: number) => {
      const total = impactData.length;
      let diff = index - centerIndex;
      if (diff > total / 2) diff -= total;
      if (diff < -total / 2) diff += total;
      return diff;
    },
    [centerIndex, impactData.length]
  );

  /* CLICK / TAP a side item → that item slides to the centre.
     Works the same on mobile and desktop. Pauses auto-scroll so
     the user has time to actually read what they just selected.
     IMPORTANT: clicking does NOT light up the glow — the glow is
     reserved exclusively for hovering the centre item. */
  const handleSideClick = useCallback(
    (index: number) => {
      setCenterIndex(index);
      setIsPaused(true);
    },
    []
  );

  /* CLICK / TAP center item → just pause auto-scroll. No glow toggle. */
  const handleCenterClick = useCallback(() => {
    setIsPaused(true);
  }, []);

  const carouselRef = useRef<HTMLDivElement>(null);

  /* Track the mouse position inside the carousel area and check
     whether it overlaps the centre item's bounding box. This avoids
     relying on mouseEnter/mouseLeave on individual items — those
     events misfire during the 0.6s slide animation. */
  const handleCarouselMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!carouselRef.current) return;
      const items = carouselRef.current.querySelectorAll<HTMLElement>("[data-carousel-item]");
      let overCenter = false;
      items.forEach((el) => {
        if (el.dataset.carouselCenter !== "true") return;
        const rect = el.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          overCenter = true;
        }
      });
      if (overCenter && !isHoveringCenter) {
        setIsHoveringCenter(true);
        setIsPaused(true);
      } else if (!overCenter && isHoveringCenter) {
        setIsHoveringCenter(false);
      }
    },
    [isHoveringCenter]
  );

  /* Mouse leaves the whole carousel → resume auto-scroll */
  const handleCarouselLeave = useCallback(() => {
    setIsPaused(false);
    setIsHoveringCenter(false);
  }, []);

  const tvGlitch: Variants = {
    initial: { opacity: 0, filter: "brightness(0%) grayscale(100%)", scaleY: 0.01 },
    animate: { opacity: 1, filter: "brightness(100%) grayscale(0%)", scaleY: 1, transition: { duration: 0.35, ease: "easeOut" } },
    exit:    { opacity: 0, filter: "brightness(0%) grayscale(100%)", scaleY: 0.01, transition: { duration: 0.15, ease: "easeIn" } },
  };

  const handleNext = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const handlePrev = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative w-full bg-[#FBF7F0]">

      {/* =========================================================
            STAGE 1: IMPACT AT GLANCE — 3×2 GRID OF STATS
            Each cell has a 1 px × 208 px vertical line + a
            rolling-number counter + a two-line description.
            All sizing derived from the 1728×1117 Figma ref
            via `min(vw, vh)` — proportionally identical at
            every laptop / desktop viewport.
            ========================================================= */}
      {/* Impact = position: sticky; top: 0 — the browser pins it
          to the viewport while the user scrolls the parent <div>.
          Stories (next in DOM flow, z-index: 10, opaque bg) then
          naturally scrolls UP over Impact, covering it from below.
          Scroll up = Stories moves back down and Impact re-appears.
          No scroll-linked JS needed; sticky positioning IS the
          animation and it reverses for free. */}
      <section
        className="relative w-full bg-[#FBF7F0] max-md:!h-[100vh] max-md:!py-[40px]"
        style={{
          position: "sticky",
          top: 0,
          /* Exactly one viewport tall on EVERY screen — the stats grid is
             flex-centred inside, and Their Stories only scrolls into view
             after this full screen. */
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "min(6.66vw, 10.30vh)",
          paddingTop: "min(4.63vw, 7.16vh)",
          paddingBottom: "min(4.63vw, 7.16vh)",
          paddingLeft: "var(--section-px-wide)",
          paddingRight: "var(--section-px-wide)",
          zIndex: 1,
        }}
      >
        <motion.div
          className="mx-auto flex w-full max-w-[1440px] flex-col items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.12, delayChildren: 0.15 },
            },
          }}
        >
          {/* Heading — 78 px Poppins 400, capitalize */}
          <motion.h2
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                },
              },
            }}
            className="m-0 text-center font-['Poppins',_sans-serif] font-normal text-black max-md:!text-[32px] max-md:!leading-[120%]"
            style={{
              fontSize: "min(4.51vw, 6.98vh)" /* 78 px @ ref */,
              lineHeight: "150%",
              marginBottom: "min(4.05vw, 6.27vh)" /* ~70 px @ ref */,
            }}
          >
            {`${impactHeadingFirst} ${impactHeadingSecond}`}
          </motion.h2>

          {/* 3 columns × 2 rows on desktop, 2 columns × 3 rows on mobile */}
          <div
            className="grid w-full max-md:!grid-cols-2"
            style={{
              gridTemplateColumns: "repeat(3, 1fr)",
              columnGap: "min(2.31vw, 3.58vh)" /* ~40 px @ ref */,
              rowGap: "min(3.47vw, 5.37vh)" /* ~60 px @ ref */,
            }}
          >
            {impactData.map((stat, i) => (
              <ImpactStatCell key={`${stat.num}-${i}`} stat={stat} />
            ))}
          </div>
        </motion.div>
      </section>

      {/* --DEAD-CODE-START-- old Stage 1 carousel — hidden so
          it doesn't render but kept referenced state handlers
          alive. Everything between here and --DEAD-CODE-END--
          is display:none. */}
      <div className="hidden" aria-hidden="true">
        <div
          className="relative"
          onMouseLeave={handleCarouselLeave}
        >
        {/* HEADING */}
        <div className="relative flex flex-col items-center justify-center w-full px-4 z-10 shrink-0">
          <motion.div
            className="flex flex-row items-center justify-center text-center w-full max-w-[1280px] mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.h2
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
              }}
              className="m-0 flex flex-row items-center justify-center"
            >
              <span className="relative inline-flex items-center justify-center overflow-hidden px-[8px] py-[4px] md:px-[20px] md:py-[10px] text-[clamp(28px,7vw,var(--heading-xl))] text-[#001A4D] font-['Libre_Baskerville',_serif] font-bold italic bg-transparent">
                <motion.span
                  variants={{
                    hidden: { scaleX: 0 },
                    visible: { scaleX: 1, transition: { duration: 0.5, ease: "easeInOut", delay: 0.4 } }
                  }}
                  style={{ transformOrigin: "left" }}
                  className="absolute inset-0 bg-[#D3E2FF] z-0"
                />
                <span className="relative z-10 leading-none">{impactHeadingFirst}</span>
              </span>
              <span className="text-[clamp(28px,7vw,var(--heading-xl))] text-[#001A4D] font-['Libre_Baskerville',_serif] font-bold not-italic leading-none ml-2 md:ml-3">
                {impactHeadingSecond}
              </span>
            </motion.h2>
          </motion.div>
        </div>

        {/* CAROUSEL AREA */}
        <div
          ref={carouselRef}
          className="relative w-full flex-1 flex items-center justify-center"
          onMouseMove={handleCarouselMouseMove}
        >

          {/* GRADIENT GLOW — small soft halo behind the centred stat on hover */}
          <div
            className="absolute left-1/2 top-[45%] max-md:!top-[50%] w-[110px] h-[110px] md:w-[140px] md:h-[140px] bg-[#D3E2FF] blur-[30px] md:blur-[44px] rounded-full pointer-events-none z-0"
            style={{
              transform: `translate(-50%, -50%) scale(${isHoveringCenter ? 1 : 0.5})`,
              opacity: isHoveringCenter ? 1 : 0,
              transition:
                "transform 0.9s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />

          {/* CAROUSEL ITEMS */}
          {impactData.map((item, i) => {
            const diff = getDiff(i);
            const absDiff = Math.abs(diff);
            const sinVal = Math.sin(diff * 0.65);
            const diffSq = diff * diff;
            const scale = Math.max(0.4, Math.cos(diff * 0.8));
            const opacity = absDiff >= 1.5 ? 0 : Math.cos(absDiff * (Math.PI / 3));
            const zIndex = Math.round(10 - absDiff);
            const isCenter = absDiff < 0.5;
            const isSide = !isCenter && absDiff < 1.5;

            return (
              <div
                key={i}
                data-carousel-item
                data-carousel-center={isCenter ? "true" : "false"}
                className="absolute left-1/2 top-1/2 flex flex-col items-center justify-start text-center w-[90%] max-w-[700px] max-md:[--base-y:-10px] max-md:[--y-spread:65px] md:[--base-y:50px] md:[--y-spread:clamp(25px,10vw,75px)]"
                style={{
                  transform: `translate(-50%, -50%) translate(calc(${sinVal.toFixed(5)} * clamp(150px, 45vw, 650px)), calc(var(--base-y) - ${diffSq.toFixed(5)} * var(--y-spread))) scale(${scale.toFixed(5)})`,
                  opacity,
                  zIndex,
                  transition: "transform 0.6s ease-in-out, opacity 0.6s ease-in-out",
                  cursor: isSide ? "pointer" : "default",
                }}
                onClick={() => {
                  if (isSide) handleSideClick(i);
                  if (isCenter) handleCenterClick();
                }}
              >
                <h2
                  className={`font-bold text-[#001A4D] font-['Libre_Baskerville',_serif] leading-[119%] mb-1 md:mb-2 flex items-center justify-center ${
                    item.num === "₹45,000 Cr+"
                      ? "max-md:text-[clamp(22px,6vw,28px)] md:text-[clamp(32px,8vw,44px)]"
                      : "text-[clamp(32px,8vw,44px)]"
                  }`}
                >
                  {item.num}
                </h2>
                <h3 className="text-[clamp(14px,3.5vw,22px)] font-semibold text-[#001A4D] font-['Libre_Baskerville',_serif] leading-[119%] max-w-[180px] md:max-w-[340px] mx-auto">
                  {item.label}
                </h3>
                {/* <h4
                  className="mt-4 md:mt-6 text-[#323232] font-['Poppins',_sans-serif] font-normal leading-[1.5] w-[85%] max-w-2xl mx-auto"
                  style={{
                    opacity: captionOpacity,
                    fontSize: "clamp(14px, min(1.6vw, 2.35vh), 20px)",
                    transition: "opacity 0.6s ease-in-out",
                  }}
                >
                  {item.caption}
                </h4> */}
              </div>
            );
          })}
        </div>
      </div>
      </div>
      {/* --DEAD-CODE-END-- */}

      {/* =========================================================
            STAGE 2 (NEW): Their Stories, Our Credentials
            FULL-WIDTH white section with a 115 px top-radius
            that visually sits on top of the Impact section.
            As the user scrolls, a useScroll-driven `y` slides
            it up further so the overlap grows continuously —
            you see the section "rise" over Impact. Scrolling
            up reverses the same translate, revealing Impact.
            ========================================================= */}
      <StoriesSection
        storiesHeadingFirst={storiesHeadingFirst}
        storiesHeadingSecond={storiesHeadingSecond}
        ctaLabel={ctaLabel}
        slides={slides}
      />

      {/* --DEAD-CODE-START-- old Stage 2 TV carousel — hidden
          but kept so referenced state handlers stay alive. */}
      <div className="hidden" aria-hidden="true">
      {/* =========================================================
            STAGE 2 (OLD): FEATURED FOUNDER CREDENTIAL SHOWCASE
            ========================================================= */}
      <div
        className="w-full bg-white flex flex-col items-center justify-start max-md:!pt-[24px] max-md:!pb-[40px]"
        style={{
          paddingTop:    "clamp(40px, min(6.94vw, 10.18vh), 100px)",
          paddingBottom: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
          paddingLeft:   "var(--section-px-wide)",
          paddingRight:  "var(--section-px-wide)",
        }}
      >

        <motion.div
          className="mx-auto flex w-full max-w-[828px] flex-col items-center justify-center text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          <motion.h2
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
            }}
            className="m-0 flex items-center justify-center text-center font-['Libre_Baskerville',_serif] font-bold italic text-[#001A4D] text-[clamp(28px,7vw,var(--heading-xl))]"
          >
            <span className="relative inline-flex items-center justify-center overflow-hidden px-[8px] py-[4px] md:px-[20px] md:py-[10px]">
              <motion.span
                variants={{
                  hidden: { scaleX: 0 },
                  visible: { scaleX: 1, transition: { duration: 0.5, ease: "easeInOut", delay: 0.4 } }
                }}
                style={{ transformOrigin: "left" }}
                className="absolute inset-0 z-0 bg-[#D3E2FF]"
              />
              <span className="relative z-10 leading-none">{storiesHeadingFirst}</span>
            </span>
          </motion.h2>

          <motion.h2
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay: 0.5 } }
            }}
            className="m-0 mt-2 md:mt-3 text-center font-['Libre_Baskerville',_serif] font-semibold leading-[1.2] text-[#001A4D] text-[clamp(28px,7vw,var(--heading-xl))]"
          >
            {storiesHeadingSecond}
          </motion.h2>
        </motion.div>

        {/* RELATIVE WRAPPER */}
        <div className="relative mx-auto flex w-full max-w-[1280px] items-center justify-center mt-[clamp(24px,min(3.5vw,5vh),48px)] max-md:!mt-[12px]">

          {/* DESKTOP ONLY: LEFT ARROW */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-[35%] z-20 group flex shrink-0 -translate-y-1/2 cursor-pointer items-center justify-center overflow-hidden rounded-full border-none bg-[#D3E2FF] transition max-md:hidden"
            style={{
              width:  "clamp(48px, min(5.35vw, 7.84vh), 77px)",
              height: "clamp(48px, min(5.35vw, 7.84vh), 77px)",
            }}
            aria-label="Previous slide"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
              e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100"
              style={{ background: 'radial-gradient(circle 40px at var(--mouse-x, 50%) var(--mouse-y, 50%), #FFFFFF 0%, transparent 100%)' }}
            />
            <svg className="relative z-10" xmlns="http://www.w3.org/2000/svg" style={{ width: "60%", height: "60%" }} viewBox="0 0 59 59" fill="none">
              <path d="M27.1151 20.9695C27.2962 20.8007 27.4415 20.5972 27.5423 20.371C27.6431 20.1448 27.6973 19.9007 27.7016 19.6531C27.706 19.4056 27.6605 19.1597 27.5677 18.9301C27.475 18.7005 27.337 18.492 27.1619 18.3169C26.9868 18.1418 26.7783 18.0038 26.5487 17.911C26.3191 17.8183 26.0732 17.7728 25.8256 17.7771C25.5781 17.7815 25.3339 17.8357 25.1078 17.9365C24.8816 18.0372 24.6781 18.1825 24.5093 18.3637L14.6759 28.197C14.3307 28.5427 14.1367 29.0113 14.1367 29.4999C14.1367 29.9885 14.3307 30.4571 14.6759 30.8028L24.5093 40.6362C24.6781 40.8173 24.8816 40.9626 25.1078 41.0634C25.3339 41.1642 25.5781 41.2183 25.8256 41.2227C26.0732 41.2271 26.3191 41.1815 26.5487 41.0888C26.7783 40.9961 26.9868 40.8581 27.1619 40.683C27.337 40.5079 27.475 40.2994 27.5677 40.0698C27.6605 39.8402 27.706 39.5943 27.7016 39.3467C27.6973 39.0992 27.6431 38.855 27.5423 38.6289C27.4415 38.4027 27.2962 38.1991 27.1151 38.0303L20.4284 31.3437H44.2497C44.7387 31.3437 45.2076 31.1494 45.5534 30.8037C45.8992 30.4579 46.0934 29.9889 46.0934 29.4999C46.0934 29.0109 45.8992 28.542 45.5534 28.1962C45.2076 27.8504 44.7387 27.6562 44.2497 27.6562H20.4284L27.1151 20.9695Z" fill="black"/>
            </svg>
          </button>

          {/* HORIZONTAL BOX */}
          <div className="w-full flex flex-col items-center justify-center gap-[clamp(28px,min(4.8vw,7vh),68px)] lg:flex-row lg:items-center lg:justify-center max-md:!gap-[20px] md:px-[90px]">

            {/* SWIPE ZONE */}
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(e, info) => {
                const threshold = 40;
                if (info.offset.x < -threshold) handleNext();
                if (info.offset.x > threshold) handlePrev();
              }}
              className="relative w-full shrink-0 overflow-hidden cursor-grab active:cursor-grabbing"
              style={{ maxWidth: "clamp(340px, min(55vw, 75vh), 850px)" }}
            >
              <div className="absolute left-[8%] top-[13%] z-[5] h-[72%] w-[58%] pointer-events-none">
                <AnimatePresence mode="wait">
                  <motion.div key={`photo-${currentSlide}`} variants={tvGlitch} initial="initial" animate="animate" exit="exit" className="relative h-full w-full">
                    <div className="absolute" style={{ top: "0%", bottom: "8%", right: "-50%", width: "140%" }}>
                      <Image src={cdnImageSrc(slide.image, 800)} alt={slide.name} fill sizes="(max-width: 1440px) 45vw, 600px" style={{ objectFit: "cover", objectPosition: "bottom right" }} />
                    </div>
                    <div className="absolute" style={{ bottom: "15%", left: "10%", width: "clamp(60px, 15vw, 120px)" }}>
                      <Image src={cdnImageSrc(slide.logo, 240)} alt="Logo" width={120} height={40} style={{ width: "100%", height: "auto", objectFit: "contain", objectPosition: "left" }} />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <Image src="/images/misc/television.svg" alt="TV Frame" width={800} height={500} className="pointer-events-none relative z-[10] block h-auto w-full" priority />

              <div className="absolute left-[8%] top-[13%] z-[15] flex h-[72%] w-[58%] items-start overflow-hidden pointer-events-none">
                <AnimatePresence mode="wait">
                  <motion.div key={`text-${currentSlide}`} variants={tvGlitch} initial="initial" animate="animate" exit="exit" className="relative h-full w-full">
                    <h3 className="absolute m-0 font-['Libre_Baskerville',_serif] text-black font-bold" style={{ top: "15%", left: "10%", width: "45%", fontSize: "clamp(12px, 3.5vw, 22px)", lineHeight: "110%" }}>
                      {slide.name}
                    </h3>
                    <p className="absolute m-0 font-['Poppins',_sans-serif] text-black font-light max-md:!top-[42%]" style={{ top: "33%", left: "10%", width: "45%", fontSize: "clamp(8px, 2.2vw, 16px)", lineHeight: "119%" }}>
                      {slide.role}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            <div className="flex w-full flex-col items-center text-center" style={{ maxWidth: "clamp(280px, min(33vw, 48.4vh), 475px)", gap: "clamp(20px, min(2.6vw, 3.81vh), 36px)" }}>
              {/* FIXED CONTAINER HEIGHT to prevent the button from jumping */}
              <div className="w-full flex items-center justify-center h-[140px] max-md:h-[160px]">
                <AnimatePresence mode="wait">
                  <motion.p key={currentSlide} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="m-0 w-full text-center font-['Poppins',sans-serif] font-normal leading-[1.5] text-[#323232]" style={{ fontSize: "clamp(14px, min(1.6vw, 2.35vh), 20px)" }}>
                    {slide.text}
                  </motion.p>
                </AnimatePresence>
              </div>

              <button
                className="group relative flex shrink-0 cursor-pointer items-center justify-center gap-[10px] overflow-hidden rounded-[9px] border-none bg-[#001A4D] font-['Libre_Baskerville',_serif] font-semibold text-white transition-all duration-300 ease-in-out h-[clamp(38px,3.75vw,54px)] w-[clamp(130px,12.6vw,181px)] text-[clamp(11px,1vw,15px)] p-[10px]"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                  e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
                }}
              >
                <div className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100" style={{ background: 'radial-gradient(circle 80px at var(--mouse-x, 50%) var(--mouse-y, 50%), #003CB3 0%, transparent 100%)' }} />
                <span className="relative z-10 text-center">{ctaLabel}</span>
              </button>
            </div>
          </div>

          {/* DESKTOP ONLY: RIGHT ARROW */}
          <button
            onClick={handleNext}
            className="absolute right-0 top-[35%] z-20 group flex shrink-0 -translate-y-1/2 cursor-pointer items-center justify-center overflow-hidden rounded-full border-none bg-[#D3E2FF] transition max-md:hidden"
            style={{
              width:  "clamp(48px, min(5.35vw, 7.84vh), 77px)",
              height: "clamp(48px, min(5.35vw, 7.84vh), 77px)",
            }}
            aria-label="Next slide"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
              e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100"
              style={{ background: 'radial-gradient(circle 40px at var(--mouse-x, 50%) var(--mouse-y, 50%), #FFFFFF 0%, transparent 100%)' }}
            />
            <svg className="relative z-10" xmlns="http://www.w3.org/2000/svg" style={{ width: "60%", height: "60%", transform: "rotate(180deg)" }} viewBox="0 0 59 59" fill="none">
              <path d="M27.1151 20.9695C27.2962 20.8007 27.4415 20.5972 27.5423 20.371C27.6431 20.1448 27.6973 19.9007 27.7016 19.6531C27.706 19.4056 27.6605 19.1597 27.5677 18.9301C27.475 18.7005 27.337 18.492 27.1619 18.3169C26.9868 18.1418 26.7783 18.0038 26.5487 17.911C26.3191 17.8183 26.0732 17.7728 25.8256 17.7771C25.5781 17.7815 25.3339 17.8357 25.1078 17.9365C24.8816 18.0372 24.6781 18.1825 24.5093 18.3637L14.6759 28.197C14.3307 28.5427 14.1367 29.0113 14.1367 29.4999C14.1367 29.9885 14.3307 30.4571 14.6759 30.8028L24.5093 40.6362C24.6781 40.8173 24.8816 40.9626 25.1078 41.0634C25.3339 41.1642 25.5781 41.2183 25.8256 41.2227C26.0732 41.2271 26.3191 41.1815 26.5487 41.0888C26.7783 40.9961 26.9868 40.8581 27.1619 40.683C27.337 40.5079 27.475 40.2994 27.5677 40.0698C27.6605 39.8402 27.706 39.5943 27.7016 39.3467C27.6973 39.0992 27.6431 38.855 27.5423 38.6289C27.4415 38.4027 27.2962 38.1991 27.1151 38.0303L20.4284 31.3437H44.2497C44.7387 31.3437 45.2076 31.1494 45.5534 30.8037C45.8992 30.4579 46.0934 29.9889 46.0934 29.4999C46.0934 29.0109 45.8992 28.542 45.5534 28.1962C45.2076 27.8504 44.7387 27.6562 44.2497 27.6562H20.4284L27.1151 20.9695Z" fill="black"/>
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-3 mt-[clamp(24px,min(3.5vw,5vh),48px)] max-md:!mt-[16px]">
          {slides.map((_, i) => (
            <button key={i} className={`cursor-pointer border-none p-0 transition-all duration-300 ease-in-out ${currentSlide === i ? "h-[12px] w-8 rounded-[10px] bg-[#001A4D]" : "h-[12px] w-[12px] rounded-full bg-[#D3E2FF]"}`} onClick={() => setCurrentSlide(i)} />
          ))}
        </div>
      </div>
      </div>
      {/* --DEAD-CODE-END-- old Stage 2 */}
    </div>
  );
}
