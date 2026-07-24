"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

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
  /* Slower, more deliberate roll (was 2.8 / 1.5 with a 0.15 stagger). */
  const rollDuration = numberStr.length === 1 ? 3.8 : 2.6;
  const digitStagger = 0.22;

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
function ImpactStatCell({
  stat,
  lineScale,
}: {
  stat: ImpactStat;
  lineScale: MotionValue<number>;
}) {
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
      {/* Vertical line — SCROLL-LINKED scaleY: draws top→bottom as the
          section scrolls into view and RETRACTS in lockstep while it's
          still on screen when you scroll back up (not a one-shot toggle,
          so the disappear is always visible). */}
      <motion.div
        className="shrink-0 origin-top bg-black max-md:!h-[80px]"
        style={{
          width: "1px",
          height: "min(13.89vw, 21.49vh)" /* ~240 px @ ref (bigger) */,
          scaleY: lineScale,
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
      <img
        src={cdnImageSrc(story.logo, 400)}
        alt={company}
        className="object-contain"
        style={{
          height: "min(5.09vw, 7.88vh)", 
          width: "auto", 
          objectPosition: origin, 
          filter: "brightness(0) invert(1)",
          transform: `scale(${story.logoScale ?? 1})`,
          transformOrigin: origin,
          display: "block",
          margin: 0, // Bulletproof against global CSS margins sneaking in
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
          /* Updated to 1:1 for the perfect square grid */
          aspectRatio: "1 / 1",
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
          sizes="(max-width: 768px) 100vw, 33vw" // Adjusted for 3 cols
          className="object-cover object-top transition-transform duration-700 scale-[1.03] group-hover:scale-[1.08]"
        />
  
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(21, 21, 21, 0.00) 0%, rgba(21, 21, 21, 0.82) 82%)",
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
  
        {/* CLOSED state — logo pinned to the BOTTOM-LEFT corner. */}
        <motion.div
          className="pointer-events-none absolute z-10"
          style={{
            left: "min(1.85vw, 2.86vh)", 
            bottom: 0, 
            transform: "translateY(25px)", 
          }}
          initial={false}
          animate={{ opacity: hovered ? 0 : 1 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <CardLogo story={story} company={company} origin="left bottom" />
        </motion.div>
  
        {/* OPEN state — full content */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 z-10 flex flex-col items-start text-white"
          style={{ padding: "min(1.85vw, 2.86vh)" /* ~32 px @ ref */ }}
          initial={false}
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 14 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <CardLogo story={story} company={company} origin="left bottom" />
          
          <div style={{ paddingTop: 0, marginTop: "-28px" }}>
            <QuoteMarkIcon />
            <p
              className="m-0 font-['Poppins',_sans-serif] font-medium text-white max-md:!text-[14px]"
              style={{
                fontSize: "min(1.39vw, 2.15vh)",
                lineHeight: "150%",
                maxWidth: "min(33.22vw, 51.39vh)",
                marginTop: "min(0.70vw, 1.07vh)",
              }}
            >
              {story.text}
            </p>
            <p
              className="m-0 font-['Poppins',_sans-serif] font-medium text-white max-md:!text-[11px]"
              style={{
                fontSize: "min(0.81vw, 1.25vh)",
                lineHeight: "150%",
                marginTop: "min(0.93vw, 1.43vh)",
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
   SeeMoreButton — Size & Typography perfectly synced to 
   the NavCursorFillButton (Get Investment) component.
   ───────────────────────────────────────────────────────── */
   function SeeMoreButton({ label, onClick }: { label: string; onClick?: () => void }) {
    const [hovered, setHovered] = useState(false);
  
    return (
      <motion.button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        // We use CSS transitions for width/colors so it interacts flawlessly with max-md overrides
        className={`relative cursor-pointer overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] max-md:!h-[40px] ${
          hovered
            ? "bg-white border-[#575757] max-md:!w-[160px]"
            : "bg-transparent border-transparent max-md:!w-[40px]"
        }`}
        style={{
          // 1. Matches exact fluid dimensions of the Nav Button
          width: hovered ? "min(12.15vw, 18.8vh)" : "min(3.36vw, 5.19vh)",
          height: "min(3.36vw, 5.19vh)",
          borderRadius: 999,
          borderWidth: 1,
          borderStyle: "solid",
          boxSizing: "border-box",
        }}
        aria-label={label}
      >
        {/* Label — Font size and mobile fallbacks perfectly mapped to the Nav button */}
        <motion.span
          className="pointer-events-none absolute -translate-y-1/2 whitespace-nowrap font-['Poppins',_sans-serif] font-normal text-black max-md:!text-[13px]"
          style={{ 
            left: "min(1.5vw, 2.5vh)", // ~20px fluid offset so it doesn't crowd the left edge
            top: "50%", 
            fontSize: "min(1.16vw,1.79vh)", 
            lineHeight: "100%" 
          }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{
            duration: hovered ? 0.28 : 0.15,
            delay: hovered ? 0.15 : 0, // Slightly faster delay to match the tighter width
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {label}
        </motion.span>
  
        {/* Navy circle knob (arrow) — Scales cleanly inside the new fluid height */}
        <div
          className="absolute -translate-y-1/2 flex items-center justify-center rounded-full bg-[#001A4D]"
          style={{
            right: 4, // 4px padding from the right edge
            top: "50%",
            height: "calc(100% - 8px)", // 100% of parent height minus 8px total vertical padding
            aspectRatio: "1 / 1",       // Forces the width to exactly match the height (perfect circle)
          }}
        >
          <motion.svg
            className="w-[45%] h-[45%]" // Arrow icon auto-scales nicely with the knob
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
/* Column/row gap of the Their Stories 2×2 grid — one constant shared by
   the grid and the centre rules so they can never drift apart.
   Spec: if the site gutter is x (--section-px-wide), the gap between two
   pictures is 3x/4 — so the vertical rule, centred in the gap, sits at
   3x/8 from each picture. The tight gap + full-bleed grid (no max-width
   cap) makes the photos span the whole screen between the gutters. */
/* Column/row gap of the Their Stories grid. */
/* Column/row gap of the Their Stories grid. */
const STORY_GAP = "calc(var(--section-px-wide) * 0.4)";

/* Half of STORY_GAP so card-to-border == card-to-card distance. */
const BORDER_PADDING = "calc(var(--section-px-wide) * 0.2)";

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

import { useSpring } from "framer-motion";

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
  const gridRef = useRef<HTMLDivElement>(null);
  
  /* SCROLL-LINKED rules: 
     By setting a tight offset (start 0.85 to start 0.45), the scroll progress 
     hits 100% very quickly. We pass it through a spring so it glides to the 
     finish line, giving it that "automatic" feel. Reversing the scroll naturally 
     pulls the spring backwards in the exact same fluid motion. */
  const { scrollYProgress } = useScroll({
    target: gridRef,
    offset: ["start 0.85", "start 0.45"],
  });
  
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });
  
  const vRuleScale = useTransform(smoothProgress, [0, 1], [0, 1]);
  const hRuleScale = useTransform(smoothProgress, [0, 1], [0, 1]);

  return (
    <section
      className="relative w-full"
      style={{
        background: "#FFF",
        borderRadius: "min(4.44vw, 7.30vh)",
        marginBottom: "min(-6.66vw, -10.30vh)",
        overflow: "hidden",
        zIndex: 10,
        paddingTop: "min(5.79vw, 8.95vh)",
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
            transition: { staggerChildren: 0.18, delayChildren: 0.45 },
          },
        }}
      >
        {/* HEADING */}
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
          style={{ marginBottom: "min(3.47vw, 5.37vh)" }}
        >
          <h2
            className="m-0 text-center font-['Poppins',_sans-serif] font-semibold text-black max-md:!text-[32px] max-md:!leading-[120%]"
            style={{ fontSize: "min(4.51vw, 6.98vh)", lineHeight: "150%" }}
          >
            {storiesHeadingFirst}
          </h2>
          <h2
            className="m-0 text-center font-['Poppins',_sans-serif] font-semibold text-black max-md:!text-[32px] max-md:!leading-[120%]"
            style={{ fontSize: "min(4.51vw, 6.98vh)", lineHeight: "150%" }}
          >
            {storiesHeadingSecond}
          </h2>
        </motion.div>

        {/* 3×2 Grid container */}
        <div 
          ref={gridRef} 
          className="relative w-full"
          style={{ 
            padding: BORDER_PADDING,
            "--bp": BORDER_PADDING 
          } as React.CSSProperties}
        >
          <div
            className="grid w-full grid-cols-3 max-md:!grid-cols-1"
            style={{ gap: STORY_GAP }}
          >
            {padStories(slides, 6).map((story, i) => (
              <StoryCard key={`${story.name}-${i}`} story={story} />
            ))}
          </div>

          {/* ANIMATED BORDERS (Desktop Only)
              Row 1 (top): no top border, has bottom border (= middle horizontal)
              Row 2 (bottom): has top border (= middle horizontal), no bottom border
              Left border of col 0 and right border of col 2 are omitted.
              Inner vertical dividers span full height.
          */}

          {/* MIDDLE HORIZONTAL BORDER — between row 1 and row 2, per column */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`mid-rule-${i}`}
              aria-hidden
              className="pointer-events-none absolute max-md:!hidden z-20"
              style={{
                top: "50%",
                left: `calc(${i * 33.3333}% + var(--bp))`,
                width: "calc(33.3333% - 2 * var(--bp))",
                height: "1px",
                background: "#000",
                transformOrigin: "center",
                scaleX: hRuleScale,
              }}
            />
          ))}

          {/* INNER VERTICAL DIVIDER 1 (col 0 | col 1) — full height */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute max-md:!hidden z-20"
            style={{ top: "var(--bp)", left: "33.3333%", marginLeft: "-0.5px", width: "1px", height: "calc(100% - 2 * var(--bp))", background: "#000", transformOrigin: "center", scaleY: vRuleScale }}
          />

          {/* INNER VERTICAL DIVIDER 2 (col 1 | col 2) — full height */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute max-md:!hidden z-20"
            style={{ top: "var(--bp)", left: "66.6666%", marginLeft: "-0.5px", width: "1px", height: "calc(100% - 2 * var(--bp))", background: "#000", transformOrigin: "center", scaleY: vRuleScale }}
          />
        </div>

        {/* See More button */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
            },
          }}
          style={{ marginTop: "min(3.47vw, 5.37vh)" }}
        >
          <SeeMoreButton label={ctaLabel} />
        </motion.div>
      </motion.div>
    </section>
  );
}
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

  /* Scroll-linked draw for the vertical lines. We measure the sticky
     section's document-Y once, then map the GLOBAL page scroll to a 0→1
     scale as the section rises into view. Because it is scrubbed by scroll
     (not a one-shot in-view toggle), the lines RETRACT visibly while the
     section is still on screen as you scroll back up. Global scrollY +
     measured Y is monotonic (a target/offset useScroll on this sticky
     section would fight Lenis). */
  const { scrollY } = useScroll();
  const impactSectionRef = useRef<HTMLElement>(null);
  const [impactTop, setImpactTop] = useState(1600);
  const [vh, setVh] = useState(800);
  useEffect(() => {
    const measure = () => {
      setVh(window.innerHeight);
      if (impactSectionRef.current) {
        setImpactTop(
          impactSectionRef.current.getBoundingClientRect().top + window.scrollY,
        );
      }
    };
    measure();
    window.addEventListener("resize", measure);
    const t = setTimeout(measure, 600);
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(measure);
    }
    return () => {
      window.removeEventListener("resize", measure);
      clearTimeout(t);
    };
  }, []);
  /* Draw from when the section is ~0.9 vh below the top to when it reaches
     the top; clamped to [0,1] so it stays full during the pin. */
  const lineScale = useTransform(
    scrollY,
    [impactTop - 0.9 * vh, impactTop - 0.15 * vh],
    [0, 1],
    { clamp: true },
  );

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
        ref={impactSectionRef}
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
            className="m-0 text-center font-['Poppins',_sans-serif] font-semibold text-black max-md:!text-[32px] max-md:!leading-[120%]"
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
              <ImpactStatCell key={`${stat.num}-${i}`} stat={stat} lineScale={lineScale} />
            ))}
          </div>
        </motion.div>
      </section>

      {/* Dwell spacer — Impact is sticky and fills the viewport, so this
          extra scroll height keeps it PINNED (the scroll visibly "stops"
          on Impact for ~1 screen) before Their Stories scrolls up over it.
          It sits over the wrapper's own #FBF7F0, matching Impact's bg. */}
      <div aria-hidden className="h-[85vh] w-full" />

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

    </div>
  );
}
