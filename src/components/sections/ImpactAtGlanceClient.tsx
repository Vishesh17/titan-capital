"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

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
        /* 16:9 landscape — the story photos are 1878×1056 (exactly 16:9),
           so this ratio shows the FULL photo with zero cover-cropping and
           keeps the cards visibly shorter than the old near-square boxes. */
        aspectRatio: "16 / 9",
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
        className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
      />

      {/* Gradient overlay — transparent top → dark bottom, so the logo /
          quote stay legible. Plain `normal` blend (NOT mix-blend-mode):
          a blend mode forces the card to re-composite against everything
          behind it on every scroll frame, and these 4 cards sit over the
          STICKY Impact section whose backdrop is always moving — that was
          a real scroll-jank source. This straight alpha gradient looks the
          same but composites as a cheap cached layer. */}
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

/* Column/row gap of the Their Stories 2×2 grid — one constant shared by
   the grid and the centre rules so they can never drift apart.
   Spec: if the site gutter is x (--section-px-wide), the gap between two
   pictures is 3x/4 — so the vertical rule, centred in the gap, sits at
   3x/8 from each picture. The tight gap + full-bleed grid (no max-width
   cap) makes the photos span the whole screen between the gutters. */
const STORY_GAP = "calc(var(--section-px-wide) * 0.75)";

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
        {/* No max-width cap — the grid spans the full width between the
            site gutters so the photos cover the screen. */}
        <div ref={gridRef} className="relative w-full">
          <div
            className="grid w-full grid-cols-2 max-md:!grid-cols-1"
            style={{ gap: STORY_GAP }}
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
              width: `calc((100% - ${STORY_GAP}) / 2)`,
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
              width: `calc((100% - ${STORY_GAP}) / 2)`,
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
