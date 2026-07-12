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
const FALLBACK_CTA_LABEL = "Read Full Story";

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
      className="flex flex-row items-start"
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
      {/* Vertical line — 1 px × 208 px @ ref */}
      <div
        className="shrink-0 bg-black"
        style={{
          width: "1px",
          height: "min(12.04vw, 18.62vh)",
        }}
      />

      {/* Number + description stack */}
      <div className="flex flex-col">
        <span
          className="font-['Poppins',_sans-serif] font-normal capitalize text-black"
          style={{
            fontSize: "min(5.56vw, 8.59vh)" /* 96 px @ ref */,
            lineHeight: "150%",
          }}
        >
          <RollingNumber value={stat.num} />
        </span>
        <span
          className="whitespace-pre-line font-['Poppins',_sans-serif] font-normal capitalize text-black"
          style={{
            fontSize: "min(2.31vw, 3.58vh)" /* 40 px @ ref */,
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

/* ─────────────────────────────────────────────────────────
   StoryCard — one card in the 2×2 grid of founder stories.
   Default state shows the founder image with a dark bottom
   gradient (hard-light blend) so the logo reads. On hover
   an up-right arrow fades in at the top-right corner and
   the pull-quote + attribution fade up below the logo.
   ───────────────────────────────────────────────────────── */
function StoryCard({ story }: { story: FounderStory }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative aspect-square w-full cursor-pointer overflow-hidden"
      style={{
        borderRadius: "12px",
        maxWidth: "min(35.47vw, 54.88vh)" /* 613 px @ ref */,
      }}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
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

      {/* Gradient overlay — transparent top → dark bottom
          with hard-light blend for legibility of the logo. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(217, 217, 217, 0.00) 0%, #393939 86.54%)",
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
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          style={{
            width: "min(1.62vw, 2.51vh)",
            height: "min(1.62vw, 2.51vh)",
          }}
        >
          <path
            d="M7 17L17 7M17 7H7M17 7V17"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      {/* Content overlay pinned to the bottom-left */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 flex flex-col text-white"
        style={{
          padding: "min(1.85vw, 2.86vh)" /* ~32 px @ ref */,
        }}
      >
        {/* Logo — always visible */}
        {story.logo ? (
          <div className="relative self-start">
            <Image
              src={cdnImageSrc(story.logo, 300)}
              alt=""
              width={200}
              height={40}
              className="object-contain"
              style={{
                height: "min(2.31vw, 3.58vh)" /* ~40 px @ ref */,
                width: "auto",
                maxWidth: "min(13.89vw, 21.49vh)" /* ~240 px @ ref */,
                filter: "brightness(0) invert(1)" /* force logo white */,
              }}
            />
          </div>
        ) : (
          <span
            className="self-start whitespace-nowrap font-['Poppins',_sans-serif] font-bold uppercase tracking-wide text-white"
            style={{
              fontSize: "min(1.62vw, 2.51vh)" /* ~28 px @ ref */,
            }}
          >
            {story.role.split(",").pop()?.trim() || story.name}
          </span>
        )}

        {/* Quote block — fades up on hover */}
        <motion.div
          className="overflow-hidden"
          initial={false}
          animate={{
            opacity: hovered ? 1 : 0,
            height: hovered ? "auto" : 0,
          }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            style={{
              paddingTop: "min(0.93vw, 1.43vh)" /* ~16 px @ ref */,
            }}
          >
            <span
              className="block font-['Poppins',_sans-serif] leading-none text-white"
              style={{ fontSize: "min(2.08vw, 3.22vh)" }}
            >
              &ldquo;
            </span>
            <p
              className="m-0 font-['Poppins',_sans-serif] font-normal text-white"
              style={{
                fontSize: "min(0.93vw, 1.43vh)" /* ~16 px @ ref */,
                lineHeight: "140%",
                marginTop: "min(0.46vw, 0.72vh)",
              }}
            >
              {story.text}
            </p>
            <p
              className="m-0 font-['Poppins',_sans-serif] font-normal text-white/85"
              style={{
                fontSize: "min(0.75vw, 1.16vh)" /* ~13 px @ ref */,
                lineHeight: "140%",
                marginTop: "min(0.46vw, 0.72vh)",
              }}
            >
              — {story.name}, {story.role}
            </p>
          </div>
        </motion.div>
      </div>
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
function SeeMoreButton({ onClick }: { onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex cursor-pointer items-center overflow-hidden"
      animate={{
        width: hovered ? 243 : 64,
        height: hovered ? 83 : 64,
        backgroundColor: hovered ? "#FFF" : "transparent",
        paddingLeft: hovered ? 33 : 0,
        paddingRight: hovered ? 10 : 0,
        justifyContent: hovered ? "space-between" : "center",
      }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{
        borderRadius: "51px",
        border: hovered ? "1px solid #575757" : "1px solid transparent",
      }}
      aria-label="See More"
    >
      <AnimatePresence>
        {hovered && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="whitespace-nowrap font-['Poppins',_sans-serif] font-normal text-black"
            style={{ fontSize: "24px", lineHeight: "100%" }}
          >
            See More
          </motion.span>
        )}
      </AnimatePresence>

      <div
        className="flex flex-shrink-0 items-center justify-center rounded-full"
        style={{
          width: 64,
          height: 64,
          background: "#001A4D",
          border: "1px solid #575757",
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M7 17L17 7M17 7H7M17 7V17"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
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
  slides,
}: {
  storiesHeadingFirst: string;
  storiesHeadingSecond: string;
  slides: FounderStory[];
}) {
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
            transition: { staggerChildren: 0.15, delayChildren: 0.1 },
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
            className="m-0 text-center font-['Poppins',_sans-serif] font-normal text-black"
            style={{
              fontSize: "min(4.51vw, 6.98vh)" /* 78 px @ ref */,
              lineHeight: "150%",
            }}
          >
            {storiesHeadingFirst}
          </h2>
          <h2
            className="m-0 text-center font-['Poppins',_sans-serif] font-normal text-black"
            style={{
              fontSize: "min(4.51vw, 6.98vh)" /* 78 px @ ref */,
              lineHeight: "150%",
            }}
          >
            {storiesHeadingSecond}
          </h2>
        </motion.div>

        {/* 2×2 grid of story cards (613 × 613 @ ref, aspect-square) */}
        <div
          className="grid w-full grid-cols-2 justify-items-center"
          style={{
            gap: "min(1.85vw, 2.86vh)" /* ~32 px @ ref */,
            maxWidth: "min(72.80vw, 112.62vh)" /* ~1258 px @ ref */,
          }}
        >
          {padStories(slides, 4).map((story, i) => (
            <StoryCard key={`${story.name}-${i}`} story={story} />
          ))}
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
          <SeeMoreButton />
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
    <div className="relative w-full bg-white">

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
        className="relative w-full bg-[#FBF7F0]"
        style={{
          position: "sticky",
          top: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "min(4.63vw, 7.16vh)" /* ~80 px @ ref */,
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
            className="m-0 text-center font-['Poppins',_sans-serif] font-normal capitalize text-black"
            style={{
              fontSize: "min(4.51vw, 6.98vh)" /* 78 px @ ref */,
              lineHeight: "150%",
              marginBottom: "min(4.05vw, 6.27vh)" /* ~70 px @ ref */,
            }}
          >
            {impactHeadingFirst} {impactHeadingSecond}
          </motion.h2>

          {/* 3 columns × 2 rows grid of 6 stats */}
          <div
            className="grid w-full"
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
