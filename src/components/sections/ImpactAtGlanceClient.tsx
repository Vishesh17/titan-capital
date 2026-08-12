"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useTransform, type MotionValue, useSpring } from "framer-motion";
import GrainOverlay from "@/components/ui/GrainOverlay";
import StoryArrow from "@/components/icons/StoryArrow";
import {
  HERO_BODY_CLASS,
  HERO_BODY_STYLE,
  LABEL_STYLE,
  SECTION_HEADING_CLASS,
  SECTION_HEADING_STYLE,
} from "@/styles/heroTypography";

/* ─────────────────────────────────────────────────────────
   Types
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
  logoScale?: number;
  /**
   * Nudges the logo vertically, as a % of the logo box height. Positive = down.
   * Needed because each mark sits centred in a 400x400 canvas: `logoScale`
   * scales that transparent padding along with the artwork, so marks with more
   * of it float higher. This cancels the difference out.
   */
  logoOffsetY?: number;
  text: string;
  /** Up to 3 pills, cycled one at a time in the card's top-left corner. */
  tags?: string[];
}

/** How long each tag holds before the next one takes its place. */
const TAG_ROTATE_MS = 2200;

export interface ImpactAtGlanceData {
  impactHeadingFirst?: string;
  impactHeadingSecond?: string;
  storiesHeadingFirst?: string;
  storiesHeadingSecond?: string;
  ctaLabel?: string;
  impactStats?: ImpactStat[];
  founderStories?: FounderStory[];
}

const FALLBACK_IMPACT_DATA: ImpactStat[] = [
  { num: "300+", label: "Companies Backed" },
  { num: "4",    label: "IPOs 2023-2026" },
  { num: "7",    label: "Unicorns $1B+" },
  { num: "30+",  label: "Values > $100M" },
  { num: "250M+",   label: "Lives Impacted" },
];

/* Photos live under /images/FounderStories; logos are the portfolio-grid marks
   used as-is. They are 400x400 canvases with the wordmark centred inside, and
   CardLogo renders them at `height: H; width: auto` — so the element is H x H
   and `logoScale` sizes the wordmark within it. Do NOT trim these: a trimmed
   400x59 mark at height H becomes ~7H wide and overflows the card. */
const STORY_IMG = "/images/FounderStories";
const STORY_LOGO = "/images/portfolio_grid";

export const FALLBACK_SLIDES: FounderStory[] = [
  {
    name: "Abhiraj Singh Bhal",
    role: "Cofounder & CEO, Urban Company",
    image: `${STORY_IMG}/Urban Company.webp`,
    logo: `${STORY_LOGO}/Urban Company.png`,
    logoOffsetY: -20,
    logoScale: 1.52,
    text: `"Nobody wants a marketplace of plumbers. They want the plumber to show up and do the job well."`,
    tags: ["Home Services", "Series A · 2015", "Listed 2025"],
  },
  {
    name: "Varun Alagh",
    role: "Co-Founder, Mamaearth",
    image: `${STORY_IMG}/Mamaearth.webp`,
    logo: `${STORY_LOGO}/mamaearth_new.png`,
    logoOffsetY: 67,
    logoScale: 3.25,
    text: `"Every brand says it wants to be in every home in India. Very few are willing to rebuild their distribution to actually get there."`,
    tags: ["Consumer Brands", "Series B · 2017", "Listed 2023"],
  },
  {
    name: "Asish Mohapatra",
    role: "Co-Founder & CEO, Ofbusiness",
    image: `${STORY_IMG}/Ofbusiness.webp`,
    logo: `${STORY_LOGO}/Ofbusiness.png`,
    logoScale: 2,
    text: `"Whatever is unsexy, there's more profit. Everybody wants to be glamorous, so that's where the competition is."`,
    tags: ["B2B Commerce & Lending", "Seed · 2015", "Profitable at scale"],
  },
  {
    name: "Harshil Mathur",
    role: "CEO & Co-Founder, Razorpay",
    image: `${STORY_IMG}/Razorpay.webp`,
    logo: `${STORY_LOGO}/Razorpay-logo.png`,
    logoScale: 2,
    text: `"A payment gateway that takes three weeks to integrate isn't infrastructure. It's a project."`,
    tags: ["Payments Infrastructure", "Seed · 2015", "10M+ businesses"],
  },
  {
    name: "Vaibhav Khandelwal",
    role: "Co-founder & CTO, Shadowfax",
    image: `${STORY_IMG}/Shadowfax.webp`,
    logo: `${STORY_LOGO}/Shadowfax.png`,
    logoScale: 2,
    text: `"In India, logistics isn't about speed. It is about reaching the right place even when the address is wrong."`,
    tags: ["Last-Mile Logistics", "Seed · 2015", "Listed 2026"],
  },
  {
    name: "Rishabh Goel",
    role: "Co-founder & CEO, Credgenics",
    image: `${STORY_IMG}/Credgenics.webp`,
    logo: `${STORY_LOGO}/Credgenics.png`,
    logoOffsetY: 14,
    logoScale: 2.21,
    text: `"Lending is a collections industry. Money can be distributed easily; the core of the business is getting it back."`,
    tags: ["AI-first Collections Software", "Pre-seed · 2019", "Profitable, SE Asia"],
  },
];

const FALLBACK_IMPACT_HEADING_FIRST = "Impact";
const FALLBACK_IMPACT_HEADING_SECOND = "At A Glance";
const FALLBACK_STORIES_HEADING_FIRST = "Their Stories,";
const FALLBACK_STORIES_HEADING_SECOND = "Our Credentials";
const FALLBACK_CTA_LABEL = "See More";

const STORY_GAP = "calc(var(--section-px-wide) * 0.4)";
const BORDER_PADDING = "calc(var(--section-px-wide) * 0.2)";

const IMPACT_CELL_PADDING = "calc(var(--section-px-wide) * 0.01)";
const IMPACT_COL_GAP = "calc(var(--section-px-wide) * 0.5)";
const IMPACT_ROW_GAP = "calc(var(--section-px-wide) * 1.2)";

function cdnImageSrc(url: string, width: number): string {
  if (url.startsWith("https://cdn.sanity.io/")) {
    return `${url}?w=${width}&auto=format&q=85`;
  }
  return url;
}

const parseStat = (val: string) => {
  const match = val.match(/^([^0-9]*)([0-9]+)([^0-9]*)$/);
  if (match) {
    return { prefix: match[1], numberStr: match[2], suffix: match[3] };
  }
  return { prefix: "", numberStr: val, suffix: "" };
};

function RollingNumber({ value }: { value: string }) {
  const { prefix, numberStr, suffix } = parseStat(value);
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
    <span className="inline-flex flex-row items-center leading-none tabular-nums justify-start">
      {prefix && <span>{prefix}</span>}
      <span className="inline-flex flex-row">
        {numberStr.split("").map((digit, i) => {
          const num = parseInt(digit, 10);
          const column = Array.from({ length: 20 }, (_, idx) => idx % 10);
          return (
            <span
              key={i}
              className="relative inline-flex flex-col overflow-hidden items-center"
              style={{ height: "1.2em", width: "0.62em" }}
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

function ImpactStatCell({
  stat,
  lineScale,
}: {
  stat: ImpactStat;
  lineScale: MotionValue<number>;
}) {
  return (
    <motion.div
      className="flex flex-row items-stretch justify-start max-md:!gap-[12px] max-md:!pl-0 max-md:w-full"
      style={{ gap: "min(1.04vw, 1.61vh)", paddingLeft: IMPACT_CELL_PADDING }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      <motion.div
        className="shrink-0 self-stretch bg-black max-md:!h-full max-md:!min-h-[80px]"
        style={{
          width: "1px",
          scaleY: lineScale,
          transformOrigin: "top",
        }}
      />
      <div className="flex flex-col items-start text-left justify-center">
        <span
          className="font-['Poppins',_sans-serif] font-normal capitalize text-black max-md:!text-[36px] max-md:!leading-[105%]"
          style={{ fontSize: "min(6vw, 9.3vh)", lineHeight: "150%" }}
        >
          <RollingNumber value={stat.num} />
        </span>
        <span
          className={`whitespace-nowrap capitalize text-black max-md:!mt-[6px] ${HERO_BODY_CLASS}`}
          style={{
            ...HERO_BODY_STYLE,
            marginTop: "min(0.58vw, 0.90vh)",
          }}
        >
          {stat.label.replace(/\n/g, ' ')}
        </span>
      </div>
    </motion.div>
  );
}

/**
 * The card's top-left pill, cycling through the story's tags one at a time.
 *
 * The pill hugs its text rather than using a fixed width — the tags range from
 * "Home Services" to "AI-first Collections Software", which a fixed 120px pill
 * would clip. `layout` animates the width change so the swap doesn't jump.
 */
function RotatingTag({ tags, sizerTags }: { tags: string[]; sizerTags: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (tags.length < 2) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % tags.length),
      TAG_ROTATE_MS
    );
    return () => clearInterval(id);
  }, [tags.length]);

  if (tags.length === 0) return null;
  const safeIndex = index % tags.length;

  return (
    <div
      className="absolute left-0 z-20 flex items-center overflow-hidden"
      style={{
        top: "clamp(10px, min(1.2vw, 1.8vh), 18px)",
        height: "clamp(28px, min(2.6vw, 3.8vh), 38px)",
        paddingLeft: "clamp(10px, min(1vw, 1.5vh), 14px)",
        paddingRight: "clamp(14px, min(1.4vw, 2vh), 20px)",
        borderRadius: "0 70px 70px 0",
        /* White glass, modelled on macOS's light vibrancy material (the menu
           and popover background). Two things separate that material from a
           plain translucent white:

             - it SAMPLES the backdrop rather than covering it. blur carries
               the colour behind through, saturate pushes it well past life,
               and brightness lifts the whole thing toward white. That is what
               makes a macOS menu take on a tint from the wallpaper underneath
               instead of looking like flat grey;
             - its gloss is a hard-terminated highlight, not a soft fade. A
               soft fade reads as matte shading; the abrupt cut at ~50% reads
               as light glancing off a curved surface.

           Layers, topmost first:
             1. the specular sweep, cut off hard at 51%;
             2. a left-to-right sheen, same idea as the navbar's panel so this
                still belongs to the same family;
             3. the material itself — near-white, faintly cool, and a little
                deeper at the bottom so the pill has a lit top and a settled
                base rather than one even tone. */
        background: [
          "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.52) 40%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0) 51%)",
          "linear-gradient(90deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.13) 32%, rgba(255,255,255,0) 74%)",
          "linear-gradient(180deg, rgba(251,251,253,0.82) 0%, rgba(231,233,240,0.76) 100%)",
        ].join(", "),
        backdropFilter: "blur(40px) saturate(1.9) brightness(1.18)",
        WebkitBackdropFilter: "blur(40px) saturate(1.9) brightness(1.18)",
        /* The rim is what stops a light material reading as a flat sticker: a
           near-opaque white hairline along the lit top edge, and a faint dark
           line along the bottom so the surface has a measurable thickness.
           No full ring — the pill sits flush at left:0, where a vertical inset
           line would read as a seam against the card edge. */
        boxShadow:
          "inset 0 1px 0 0 rgba(255,255,255,0.92), inset -1px 0 0 0 rgba(255,255,255,0.45), inset 0 -1px 0 0 rgba(15,23,42,0.07), 0 5px 18px 0 rgba(0,0,0,0.22)",
        ...LABEL_STYLE,
        /* Dark type — the pill is now light, so the previous white label would
           be invisible on it. #0E0E0E is the same near-black the rest of the
           site uses for copy on light backgrounds. */
        color: "#0E0E0E",
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 600,
        letterSpacing: "0.01em",
        lineHeight: "150%",
        whiteSpace: "nowrap",
      }}
    >
      <span className="sr-only">{tags.join(". ")}</span>

      {/* Invisible sizer. Every label across every card is stacked in a single
          grid cell, so the pill is always as wide as the longest one site-wide
          and its width never shifts as the label rotates. Measuring in CSS
          rather than JS keeps it exact across fonts and breakpoints. */}
      <span aria-hidden className="invisible grid">
        {sizerTags.map((t, i) => (
          <span key={i} className="col-start-1 row-start-1 whitespace-nowrap">
            {t}
          </span>
        ))}
      </span>

      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={safeIndex}
          aria-hidden="true"
          className="absolute inset-y-0 flex items-center whitespace-nowrap"
          style={{ left: "clamp(10px, min(1vw, 1.5vh), 14px)" }}
          initial={{ opacity: 0, y: 9 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -9 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {tags[safeIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function deriveCompany(story: FounderStory): string {
  const role = story.role || "";
  if (role.includes(",")) return role.split(",").pop()!.trim();
  const m = role.match(/\bof\s+(.+)$/i);
  if (m) return m[1].trim();
  return story.name;
}

function QuoteMarkIcon() {
  return (
    <svg viewBox="0 0 42 33" fill="none" aria-hidden className="max-md:!w-[20px] max-md:!h-[16px]" style={{ width: "min(2.43vw, 3.76vh)", height: "min(1.91vw, 2.95vh)" }}>
      <path d="M24.5946 22.5385C24.5946 15.948 26.7387 9.90141 31.027 4.3987C33.7387 1.07148 35.9144 -0.368185 37.5541 0.0797102C39.0676 0.655575 39.8243 1.51937 39.8243 2.6711C39.8243 3.75885 39.3198 4.91058 38.3108 6.12629C37.3649 7.34201 36.6081 8.33378 36.0405 9.1016C35.473 9.86942 35 10.7012 34.6216 11.597C33.7387 13.3886 33.2973 15.5641 33.2973 18.1235C34.8108 17.6756 36.3243 17.8675 37.8378 18.6994C40.6126 20.299 42 22.3465 42 24.8419C42 27.2733 41.2432 29.2569 39.7297 30.7925C38.2793 32.2642 36.2613 33 33.6757 33C31.0901 33 28.9144 32.0082 27.1486 30.0247C25.4459 27.9772 24.5946 25.4818 24.5946 22.5385ZM0 22.5385C0 15.6921 2.11261 9.64547 6.33784 4.3987C9.55405 0.495613 12.2342 -0.68811 14.3784 0.84753C14.8198 1.16746 15.0405 1.67934 15.0405 2.38317C15.0405 3.66287 14.5676 4.91058 13.6216 6.12629C12.7387 7.34201 12.0135 8.33378 11.4459 9.1016C10.8784 9.86942 10.4054 10.7012 10.027 11.597C9.14414 13.3886 8.7027 15.5641 8.7027 18.1235C10.2162 17.6756 11.6982 17.8675 13.1486 18.6994C15.8604 20.299 17.2162 22.3465 17.2162 24.8419C17.2162 27.2733 16.491 29.2569 15.0405 30.7925C13.5901 32.2642 11.5721 33 8.98649 33C6.4009 33 4.25676 32.0082 2.55405 30.0247C0.851351 27.9772 0 25.4818 0 22.5385Z" fill="white" />
    </svg>
  );
}

function CardLogo({ story, company, origin }: { story: FounderStory; company: string; origin: "left bottom" | "right bottom"; }) {
  if (!story.logo) {
    return (
      <span className="whitespace-nowrap font-['Poppins',_sans-serif] font-semibold uppercase text-white max-md:!text-[20px]" style={{ fontSize: "min(1.85vw, 2.86vh)", lineHeight: "155%" }}>
        {company}
      </span>
    );
  }
  return (
    <img
      src={cdnImageSrc(story.logo, 400)}
      alt={company}
      className="object-contain max-md:!h-[36px]"
      style={{
        height: "min(5.09vw, 7.88vh)",
        width: "auto",
        objectPosition: origin,
        filter: "brightness(0) invert(1)",
        transform: `translateY(${story.logoOffsetY ?? 0}%) scale(${story.logoScale ?? 1})`,
        transformOrigin: origin,
        display: "block",
        margin: 0,
      }}
    />
  );
}

export function StoryCard({ story, sizerTags = [] }: { story: FounderStory; sizerTags?: string[] }) {
  const [hovered, setHovered] = useState(false);
  const company = deriveCompany(story);

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative w-full cursor-pointer overflow-hidden"
      style={{ borderRadius: "2px", aspectRatio: "1 / 1" }}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.4 } },
      }}
    >
      <Image
        src={cdnImageSrc(story.image, 900)}
        alt={story.name}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        /* scale-100 at rest, not 1.03 — the resting zoom cropped ~3% off each
           edge, so a square photo no longer filled the square frame edge to
           edge. The zoom now only happens on hover. */
        className="object-cover object-top transition-transform duration-700 scale-100 group-hover:scale-[1.05]"
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(21, 21, 21, 0.00) 0%, rgba(21, 21, 21, 0.82) 82%)" }} aria-hidden />

      <RotatingTag
        tags={story.tags?.length ? story.tags : ["Portfolio"]}
        sizerTags={sizerTags.length ? sizerTags : story.tags ?? ["Portfolio"]}
      />

      <motion.div
        className="absolute z-10"
        style={{ top: "min(1.85vw, 2.86vh)", right: "min(1.85vw, 2.86vh)" }}
        initial={false}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <StoryArrow />
      </motion.div>

      <motion.div
        className="pointer-events-none absolute z-10 max-md:!left-[16px] max-md:!bottom-[-4px] max-md:![transform:none]"
        style={{ left: "min(1.85vw, 2.86vh)", bottom: 0, transform: "translateY(25px)" }}
        initial={false}
        animate={{ opacity: hovered ? 0 : 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <CardLogo story={story} company={company} origin="left bottom" />
      </motion.div>

      <motion.div
        className="absolute bottom-0 left-0 right-0 z-10 flex flex-col items-start text-white"
        style={{ padding: "min(1.85vw, 2.86vh)" }}
        initial={false}
        animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 14 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <CardLogo story={story} company={company} origin="left bottom" />
        
        <div className="max-md:!mt-[4px]" style={{ paddingTop: 0, marginTop: "-28px" }}>
          <QuoteMarkIcon />
          <p
            className={`m-0 text-white ${HERO_BODY_CLASS}`}
            style={{ ...HERO_BODY_STYLE, maxWidth: "min(33.22vw, 51.39vh)", marginTop: "min(0.70vw, 1.07vh)" }}
          >
            {story.text}
          </p>
          <p
            className="m-0 font-['Poppins',_sans-serif] font-medium text-white"
            style={{ ...LABEL_STYLE, lineHeight: "150%", marginTop: "min(0.93vw, 1.43vh)" }}
          >
            — {story.name}, {story.role}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function SeeMoreButton({ label, onClick }: { label: string; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative cursor-pointer overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] max-md:!h-[40px] ${
        hovered ? "bg-white border-[#575757] max-md:!w-[160px]" : "bg-transparent border-transparent max-md:!w-[40px]"
      }`}
      style={{
        width: hovered ? "min(12.15vw, 18.8vh)" : "min(3.36vw, 5.19vh)",
        height: "min(3.36vw, 5.19vh)",
        borderRadius: 999,
        borderWidth: 1,
        borderStyle: "solid",
        boxSizing: "border-box",
      }}
      aria-label={label}
    >
      <motion.span
        className="pointer-events-none absolute -translate-y-1/2 whitespace-nowrap font-['Poppins',_sans-serif] font-normal text-black"
        style={{ left: "min(1.5vw, 2.5vh)", top: "50%", ...LABEL_STYLE, lineHeight: "100%" }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: hovered ? 0.28 : 0.15, delay: hovered ? 0.15 : 0, ease: [0.22, 1, 0.36, 1] }}
      >
        {label}
      </motion.span>
      <div
        className="absolute -translate-y-1/2 flex items-center justify-center rounded-full bg-[#001A4D]"
        style={{ right: 4, top: "50%", height: "calc(100% - 8px)", aspectRatio: "1 / 1" }}
      >
        <motion.svg className="w-[45%] h-[45%]" viewBox="0 0 24 24" fill="none" animate={{ rotate: hovered ? 0 : 45 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          <path d="M7 17L17 7M17 7H7M17 7V17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </div>
    </motion.button>
  );
}

export function padStories(stories: FounderStory[], count: number): FounderStory[] {
  if (stories.length >= count) return stories.slice(0, count);
  const result: FounderStory[] = [];
  for (let i = 0; i < count; i++) {
    result.push(stories[i % stories.length]);
  }
  return result;
}

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
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  /* Every label across every card — the pills all size to the longest of
     these, so they stay a constant, identical width. */
  const allTags = padStories(slides, 6).flatMap((s) => s.tags ?? []);

  const lineProgress = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const smoothLineProgress = useSpring(lineProgress, { stiffness: 40, damping: 25 });
  const vRuleScale = smoothLineProgress;
  const hRuleScale = smoothLineProgress;

  return (
    <section
      ref={sectionRef}
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
          visible: { transition: { staggerChildren: 0.18, delayChildren: 0.45 } },
        }}
      >
        {/* STORIES HEADING MARGIN FIXED: Same clamp(32px,6dvh,48px) spacing below heading */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
          }}
          className="flex flex-col items-center max-md:!mb-[clamp(32px,6dvh,48px)]"
          style={{ marginBottom: "min(3.47vw, 5.37vh)" }}
        >
          <h2
   className={`m-0 text-center text-black ${SECTION_HEADING_CLASS}`}
   style={{ ...SECTION_HEADING_STYLE, }}
   >
            {storiesHeadingFirst}
          </h2>
          <h2
            className={`m-0 text-center text-black ${SECTION_HEADING_CLASS}`}
            style={{ ...SECTION_HEADING_STYLE, }}
          >
            {storiesHeadingSecond}
          </h2>
        </motion.div>

        <div 
          className="relative w-full"
          style={{ padding: BORDER_PADDING, "--bp": BORDER_PADDING } as React.CSSProperties}
        >
          <div className="grid w-full grid-cols-3 max-md:!grid-cols-1 max-md:!gap-[24px]" style={{ gap: STORY_GAP }}>
            {padStories(slides, 6).map((story, i) => (
              <StoryCard key={`${story.name}-${i}`} story={story} sizerTags={allTags} />
            ))}
          </div>

          <motion.div
            aria-hidden
            className="pointer-events-none absolute max-md:!hidden z-20"
            style={{
              top: "50%",
              left: "var(--bp)",
              width: "calc(50% - var(--bp))",
              height: 0,
              borderTop: "1px solid #000",
              transformOrigin: "left",
              scaleX: hRuleScale,
            }}
          />
        

          <motion.div
            aria-hidden
            className="pointer-events-none absolute max-md:!hidden z-20"
            style={{
              top: "50%",
              right: "var(--bp)",
              width: "calc(50% - var(--bp))",
              height: 0,
              borderTop: "1px solid #000",
              transformOrigin: "right",
              scaleX: hRuleScale,
            }}
          />

          <motion.div
            aria-hidden
            className="pointer-events-none absolute max-md:!hidden z-20"
            style={{ top: "var(--bp)", left: "33.3333%", width: 0, borderLeft: "1px solid #000", height: "calc(100% - 2 * var(--bp))", transformOrigin: "top", scaleY: vRuleScale }}
          />

          <motion.div
            aria-hidden
            className="pointer-events-none absolute max-md:!hidden z-20"
            style={{ top: "var(--bp)", left: "66.6666%", width: 0, borderLeft: "1px solid #000", height: "calc(100% - 2 * var(--bp))", transformOrigin: "top", scaleY: vRuleScale }}
          />
        </div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
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
  const impactHeadingFirst = data?.impactHeadingFirst || FALLBACK_IMPACT_HEADING_FIRST;
  const impactHeadingSecond = data?.impactHeadingSecond || FALLBACK_IMPACT_HEADING_SECOND;
  const storiesHeadingFirst = data?.storiesHeadingFirst || FALLBACK_STORIES_HEADING_FIRST;
  const storiesHeadingSecond = data?.storiesHeadingSecond || FALLBACK_STORIES_HEADING_SECOND;
  const ctaLabel = data?.ctaLabel || FALLBACK_CTA_LABEL;
  const impactData = data?.impactStats && data.impactStats.length > 0 ? data.impactStats : FALLBACK_IMPACT_DATA;
  const slides = data?.founderStories && data.founderStories.length > 0 ? data.founderStories : FALLBACK_SLIDES;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: impactProgress } = useScroll({
    target: wrapperRef,
    offset: ["start end", "start 30%"],
  });

  const lineScale = useSpring(impactProgress, { stiffness: 80, damping: 25 });

  return (
    <div ref={wrapperRef} className="relative w-full bg-[#FBF7F0]">
      {/* Square grain on the beige wrapper so the rounded impact card's corner
          triangles (which reveal this wrapper) are textured too. Sits behind
          the sticky card (z-1) and the opaque white StoriesSection (z-10). */}
      <GrainOverlay opacity={0.22} zIndex={0} />
      <section
        className="relative w-full bg-[#FBF7F0] max-md:!h-auto max-md:!min-h-[100dvh] max-md:!pt-[50px] max-md:!pb-[50px] max-md:!px-0"
        style={{
          position: "sticky",
          top: 0,
          height: "50vh",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          borderRadius: "min(6.66vw, 10.30vh)",
          paddingTop: "calc(var(--nav-height) + min(1vw, 1.5vh))",
          paddingBottom: "min(2vw, 3vh)",
          paddingLeft: "var(--section-px-wide)",
          paddingRight: "var(--section-px-wide)",
          zIndex: 1,
        }}
      >
        <GrainOverlay
          opacity={0.22}
          zIndex={0}
          style={{ borderRadius: "min(6.66vw, 10.30vh)" }}
        />
        <motion.div
          className="relative z-10 mx-auto flex w-full flex-col items-center justify-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
          }}
        >
          <motion.h2
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
   }}
   className={`m-0 text-center text-black max-md:!mb-[clamp(32px,6dvh,48px)] max-md:whitespace-nowrap ${SECTION_HEADING_CLASS}`}
   style={{
    ...SECTION_HEADING_STYLE,
    marginBottom: "min(3.47vw, 5.37vh)",
   }}
   >
            {`${impactHeadingFirst} ${impactHeadingSecond}`}
          </motion.h2>

          <div
            className="grid w-full max-md:!grid-cols-2 max-md:!gap-x-[24px] max-md:!gap-y-[70px] max-md:!pl-[24px] max-md:!pr-[16px] max-md:!justify-items-start"
            style={{
              gridTemplateColumns: "repeat(5, 1fr)",
              paddingLeft: IMPACT_CELL_PADDING,
              paddingRight: IMPACT_CELL_PADDING,
              columnGap: IMPACT_COL_GAP,
              rowGap: IMPACT_ROW_GAP,
            }}
          >
            {impactData.map((stat, i) => (
              <ImpactStatCell key={`${stat.num}-${i}`} stat={stat} lineScale={lineScale} />
            ))}
          </div>
        </motion.div>
      </section>

      <StoriesSection
        storiesHeadingFirst={storiesHeadingFirst}
        storiesHeadingSecond={storiesHeadingSecond}
        ctaLabel={ctaLabel}
        slides={slides}
      />
    </div>
  );
}