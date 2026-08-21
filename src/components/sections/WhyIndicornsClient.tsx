"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BODY_BOLD_CLASS,
  HERO_BODY_CLASS,
  HERO_BODY_STYLE,
  LABEL_STYLE,
  SECTION_HEADING_CLASS,
  SECTION_HEADING_STYLE,
  SUBHEADING_CLASS,
  SUBHEADING_STYLE,
} from "@/styles/heroTypography";

const EASE = [0.22, 1, 0.36, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

/* ─────────────────────────────────────────────────────────
   Sanity contract. Every field is optional — anything the CMS
   doesn't supply falls back to the constants below.
   ───────────────────────────────────────────────────────── */
export interface WhyIndicornsTimelineEntry {
  date: string;
  title: string;
  desc?: string;
  statNumber?: string;
  statLabel?: string;
  statSub?: string;
}

export interface WhyIndicornsData {
  headingTop?: string;
  headingBottom?: string;
  storyLabel?: string;
  storyImage?: string;
  storyParagraphs?: string[];
  storyParagraphsMobile?: string[];
  timeline?: WhyIndicornsTimelineEntry[];
}

const FALLBACK_HEADING_TOP = "Why We Created";
const FALLBACK_HEADING_BOTTOM = "The Indicorns?";
const FALLBACK_STORY_LABEL = "September 2024";
const FALLBACK_STORY_IMAGE = "/images/indicorns/techsparks-stage.jpeg";
const FALLBACK_STORY_PARAGRAPHS = [
  "On the main stage of YourStory's TechSparks India's largest startup summit - Kunal Bahl introduced one word to the ecosystem: Indicorn.",
  "It wasn't just a new word. It was a challenge to change how India defines, celebrates, and aspires toward success measured in revenue and profit, not a valuation set in someone else's currency.",
];
/* Mobile copy is deliberately worded differently from desktop — kept as its
   own field rather than silently unified. */
const FALLBACK_STORY_PARAGRAPHS_MOBILE = [
  "On the main stage at TechSparks, India's largest startup summit, Kunal Bahl introduced a word the ecosystem didn't have: Indicorn.",
  "The businesses it described had been building quietly for years: profitable, growing, and largely unfunded. They had every marker of success except one: recognition. A month later, Titan Capital published the first list.",
];

/* Mirrors the live CMS entries. Each card carries ONE description: the
   `statSub` field is deliberately unused here, because a caption under the
   number plus a description said the same thing twice on screen. It stays in
   the schema and still renders if an editor fills it in. */
const FALLBACK_TIMELINE: WhyIndicornsTimelineEntry[] = [
  {
    date: "September 2024",
    title: "The term is coined",
    desc: '"Indicorn" is unveiled on the TechSparks main stage naming a kind of company that always existed but was never celebrated.',
    statNumber: "1",
    statLabel: "New Term",
  },
  {
    date: "October 2024",
    title: "The First List",
    desc: "Titan Capital publishes the inaugural index, screened with Tracxn across 3M+ companies and 2,700 sectors.",
    statNumber: "186",
    statLabel: "Companies\nRecognized",
  },
  {
    date: "2025",
    title: "The Moment Grows.",
    desc: "₹151K Cr in combined revenue and ₹7K Cr in profit in FY24, proof that profitable businesses are scaling right across India.",
    statNumber: "202",
    statLabel: "Indicorns\nIdentified",
  },
  {
    date: "2026",
    title: "The next list\nComing soon",
    desc: "The third edition is in preparation. If your company meets the criteria, tell us.",
  },
];

/** How many timeline cards are visible at once on desktop. */
const VISIBLE = 3;

/**
 * Card content order is: date · title · stat · description, with the
 * description last.
 *
 * The date line and the description share ONE size, held here so they cannot
 * drift apart. The description used to be a full body-copy size (up to 20px)
 * against a date line of `min(1.16vw, 1.8vh)` — the two happen to coincide at
 * 1728x1117, which is why the gap only shows up elsewhere: at 1280x720 the
 * description rendered 17.6px against the date's 13.0px.
 *
 * Size only. The description keeps its own, lighter colour.
 */
const CARD_META_FONT_SIZE = "min(1.16vw, 1.8vh)";
/** Mobile counterpart — the mobile date line is a flat 13px. */
const CARD_META_FONT_SIZE_MOBILE = "13px";


export default function WhyIndicorns({
  data,
}: {
  data?: WhyIndicornsData | null;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const headingTop = data?.headingTop || FALLBACK_HEADING_TOP;
  const headingBottom = data?.headingBottom || FALLBACK_HEADING_BOTTOM;
  const storyLabel = data?.storyLabel || FALLBACK_STORY_LABEL;
  const storyImage = data?.storyImage || FALLBACK_STORY_IMAGE;
  const storyParagraphs =
    data?.storyParagraphs && data.storyParagraphs.length > 0
      ? data.storyParagraphs
      : FALLBACK_STORY_PARAGRAPHS;
  /* Mobile falls back to its own copy first, then to the desktop copy — so an
     editor who fills in only the desktop paragraphs still gets something
     sensible on a phone. */
  const storyParagraphsMobile =
    data?.storyParagraphsMobile && data.storyParagraphsMobile.length > 0
      ? data.storyParagraphsMobile
      : data?.storyParagraphs && data.storyParagraphs.length > 0
        ? data.storyParagraphs
        : FALLBACK_STORY_PARAGRAPHS_MOBILE;
  const timelineData =
    data?.timeline && data.timeline.length > 0 ? data.timeline : FALLBACK_TIMELINE;

  const count = timelineData.length;

  /* The window always ENDS on the active card once we're past the first
     screenful, so advancing to card 4 shows 2-3-4, card 5 shows 3-4-5, and so
     on — the active card stays pinned to the right edge and the older ones
     slide out to the left. Clamped so we never scroll past the last full
     window, which would leave dead space on the right. */
  const maxStart = Math.max(0, count - VISIBLE);
  const start = Math.min(Math.max(0, activeIndex - (VISIBLE - 1)), maxStart);

  // ── Mobile timeline carousel (swipe + dots) ──
  const scrollRef = useRef<HTMLDivElement>(null);
  /* Set while WE are scrolling the rail, so the scroll handler doesn't read
     the intermediate positions of our own smooth-scroll and fight the timer
     for control of `activeIndex`. */
  const autoScrolling = useRef(false);

  /* Card offsets come from the DOM, never from `scrollWidth / count`. That
     division is wrong: scrollWidth includes the container's left+right padding
     as well as the inter-card gaps, so it yields 273px where the real card
     pitch is 265px — the error compounds and every card after the first lands
     misaligned. `offsetLeft` is measured against this scroller (it is
     `position: relative`), which is exactly the coordinate `scrollLeft` uses. */
  const cardEls = () => {
    const el = scrollRef.current;
    return el
      ? (Array.from(
          el.querySelectorAll("[data-tl-card]")
        ) as HTMLElement[])
      : [];
  };

  const handleCarouselScroll = () => {
    const el = scrollRef.current;
    if (!el || autoScrolling.current) return;
    const cards = cardEls();
    if (!cards.length) return;
    // Nearest card to the current scroll position.
    let nearest = 0;
    let best = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft - el.scrollLeft);
      if (d < best) {
        best = d;
        nearest = i;
      }
    });
    // Swiping takes over the timer, exactly like clicking a card on desktop.
    setActiveIndex((prev) => (prev === nearest ? prev : nearest));
  };

  /** Card's offset, clamped to what the rail can actually reach. The last
      card sits past max-scroll, so an unclamped target never "arrives". */
  const scrollTargetFor = (card: HTMLElement, el: HTMLElement) =>
    Math.min(card.offsetLeft, el.scrollWidth - el.clientWidth);

  const scrollToCard = (i: number) => {
    const el = scrollRef.current;
    const card = cardEls()[i];
    if (!el || !card) return;
    autoScrolling.current = true;
    el.scrollTo({ left: scrollTargetFor(card, el), behavior: "smooth" });
    window.setTimeout(() => {
      autoScrolling.current = false;
    }, 600);
  };

  /* Auto-play: next card every 3s, and the last card wraps straight back to
     the first — which also slides the rail back to the start of the timeline.
     Deliberately NOT paused on hover: the pause made the progress bar finish
     on the last card and then sit there doing nothing whenever the pointer
     happened to rest over the section. */
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev === count - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(timer);
  }, [activeIndex, count]);

  /* Drive the mobile rail from the same activeIndex the desktop uses, so the
     card on screen, the bullet glow, the progress bar and the travelling line
     all belong to the same entry. */
  useEffect(() => {
    const el = scrollRef.current;
    const card = cardEls()[activeIndex];
    if (!el || !card) return;
    const target = scrollTargetFor(card, el);
    if (Math.abs(el.scrollLeft - target) > 4) {
      autoScrolling.current = true;
      el.scrollTo({ left: target, behavior: "smooth" });
      const id = window.setTimeout(() => {
        autoScrolling.current = false;
      }, 600);
      return () => window.clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, count]);

  return (
    <section
      className="relative w-full overflow-hidden bg-[#FBF7F0] font-['Poppins',_sans-serif]"
      style={{
        paddingTop: "var(--section-py)",
        paddingBottom: "var(--section-py)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <motion.div
        className="mx-auto max-w-[1440px] flex w-full flex-col"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {/* Heading */}
        <motion.h2
     variants={itemVariants}
     className={`m-0 text-center font-semibold text-black max-md:!mb-[clamp(32px,6dvh,48px)] ${SECTION_HEADING_CLASS}`}
     style={{
      ...SECTION_HEADING_STYLE,
      // Heading → story block. Was min(5.79vw, 8.95vh) — 64px at 1280x720.
      marginBottom: "min(3.5vw, 5.4vh)",
     }}
    >
          {headingTop}
          <br />
          {headingBottom}
        </motion.h2>

        {/* ══════════ MOBILE (< md) ══════════
            Order per design: heading → swipeable timeline cards + dots →
            story text → image. Desktop story/timeline are hidden below md.
            Same layout as before; what's new is that the bullet and the 3s
            progress bar now animate here exactly as they do on desktop, both
            driven by the shared `activeIndex`. */}
        <div className="md:hidden">
          {/* Swipeable timeline cards */}
          <div
            ref={scrollRef}
            onScroll={handleCarouselScroll}
            /* `relative` so the two timeline rules below can be absolutely
               positioned against this box — and, because it is the scroll
               container, they scroll along with the cards. */
            className="relative flex snap-x snap-mandatory gap-[16px] overflow-x-auto -mx-[var(--section-px-wide)] px-[var(--section-px-wide)] pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={
              {
                /* Card width as an explicit length rather than `76%`. An
                   absolutely-positioned child resolves percentages against the
                   PADDING box while a flex item resolves them against the
                   CONTENT box — two different bases, which would put the line
                   and the bullets on different grids. This makes both measure
                   the same thing. */
                "--m-card": "calc((100vw - 2 * var(--section-px-wide)) * 0.76)",
                "--m-pitch": "calc(var(--m-card) + 16px)",
                /* Bullet centre inside a card: 1px border + 28px padding + 9px
                   (half the 18px bullet). The first card starts one section
                   gutter in from the padding-box edge. */
                "--m-bullet-x": "calc(var(--section-px-wide) + 38px)",
              } as React.CSSProperties
            }
          >
            {/* Background rule — bullet-1 → bullet-N, sitting behind the cards
                and showing through the gaps between them, exactly as on
                desktop. */}
            <div
              aria-hidden
              className="absolute z-0 h-[1px] bg-[#d3cec4]"
              style={{
                top: "37.5px",
                left: "var(--m-bullet-x)",
                width: `calc(${count - 1} * var(--m-pitch))`,
              }}
            />

            {/* Travelling rule — grows from bullet to bullet as the timer
                advances. Same gradient, same easing, same scaleX ratio the
                desktop rail uses. */}
            <motion.div
              aria-hidden
              className="absolute z-0 h-[2px] origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: count > 1 ? activeIndex / (count - 1) : 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{
                top: "37px",
                left: "var(--m-bullet-x)",
                width: `calc(${count - 1} * var(--m-pitch))`,
                background: "linear-gradient(90deg, #0f2143 0%, #4060a8 100%)",
              }}
            />

            {timelineData.map((item, index) => {
              const isActive = activeIndex === index;

              return (
                <div
                  key={index}
                  data-tl-card
                  onClick={() => setActiveIndex(index)}
                  className="relative z-10 flex shrink-0 snap-start flex-col overflow-hidden rounded-[2px] border border-[#ECECEC] bg-white p-[28px] shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
                  style={{ width: "var(--m-card)" }}
                >
                  {/* 3s progress bar — same one the desktop card carries. */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        key={`m-progress-${index}`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 3, ease: "linear" }}
                        className="absolute bottom-0 left-0 h-[4px] w-full origin-left bg-gradient-to-r from-[#0f2143] to-[#4060a8]"
                      />
                    )}
                  </AnimatePresence>

                  {/* Bullet — scales up and gains the glow ring when active. */}
                  <motion.div
                    animate={{
                      scale: isActive ? 1.2 : 1,
                      boxShadow: isActive
                        ? "0 0 0 4px rgba(15, 33, 67, 0.15), 0 0 12px rgba(15, 33, 67, 0.2)"
                        : "0 0 0 4px rgba(15, 33, 67, 0.10)",
                      backgroundColor: "#0f2143",
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="mb-[18px] h-[18px] w-[18px] shrink-0 origin-center rounded-full"
                  />
                  <p className="m-0 mb-[8px] text-[13px] font-medium text-[#333]">
                    {item.date}
                  </p>
                  <h4 className={`m-0 mb-[12px] whitespace-pre-line text-black ${BODY_BOLD_CLASS}`} style={HERO_BODY_STYLE}>
                    {item.title}
                  </h4>
                  {/* Same order as desktop: stat, then description last. This
                      rail is plain flex, not subgrid, so no placeholder row is
                      needed for the cards that carry no stat. */}
                  {item.statNumber && (
                    <div className="mb-[10px]">
                      {/* Bottom margin only when a caption follows — see the
                          desktop card for why. */}
                      <div className={`flex items-center gap-[12px] ${item.statSub ? "mb-[8px]" : ""}`}>
                        <span className={`font-medium text-black ${SUBHEADING_CLASS}`}>
                          {item.statNumber}
                        </span>
                        <span className="whitespace-pre-line leading-tight text-[#4a4a4a]" style={LABEL_STYLE}>
                          {item.statLabel}
                        </span>
                      </div>
                      {item.statSub && (
                        <p className="m-0 whitespace-pre-line leading-[1.4] text-[#6b6b6b]" style={LABEL_STYLE}>
                          {item.statSub}
                        </p>
                      )}
                    </div>
                  )}
                  {/* HERO_BODY_CLASS is deliberately not used: it carries a
                      `max-md:!text-[16.33px]`, and !important beats an inline
                      style, so the size below would be ignored on mobile. */}
                  <p
                    className="m-0 font-normal leading-[1.6] text-[#4a4a4a]"
                    style={{ fontSize: CARD_META_FONT_SIZE_MOBILE }}
                  >
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Pagination dots */}
          <div className="mt-[20px] flex justify-center gap-[8px]">
            {timelineData.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to card ${i + 1}`}
                onClick={() => {
                  setActiveIndex(i);
                  scrollToCard(i);
                }}
                className={`h-[7px] w-[7px] rounded-full transition-colors duration-300 ${
                  activeIndex === i ? "bg-[#0f2143]" : "bg-[#0f2143]/25"
                }`}
              />
            ))}
          </div>

          {/* Story — text then image */}
          <div className="mt-[clamp(40px,10vw,64px)] flex flex-col">
            <h3 className={`font-medium m-0 mb-[clamp(16px,4vw,24px)] text-black ${SUBHEADING_CLASS}`}>
              {storyLabel}
            </h3>
            {storyParagraphsMobile.map((para, i) => (
              <p
                key={`m-para-${i}`}
                className={`font-normal m-0 text-[#1a1a1a] ${HERO_BODY_CLASS}`}
                style={{ ...HERO_BODY_STYLE, marginTop: i === 0 ? 0 : "1.4em" }}
              >
                {para}
              </p>
            ))}
            <img
              src={storyImage}
              alt="Kunal Bahl introducing the term Indicorn at TechSparks"
              className="mt-[clamp(24px,6vw,40px)] w-full rounded-[2px] object-cover"
            />
          </div>
        </div>

        {/* Top Story Section (desktop / tablet only) */}
        <motion.div
          variants={itemVariants}
          /* Uneven split (image 0.8fr / text 1.2fr) rather than 50/50: the
             text column, not the image, is what sets this row's height, so
             giving the copy more width costs the image nothing and removes
             a wrapped line or two — the cheapest height saving available. */
          /* The trailing `mb-` is the story → timeline gap. Was
             clamp(48px,min(7vw,10vh),120px), i.e. 72px at 1280x720. */
          className="max-md:hidden grid grid-cols-1 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] items-center gap-[clamp(48px,min(6vw,8vh),96px)] mb-[clamp(32px,min(4.2vw,6vh),72px)]"
        >
          {/* Image — LANDSCAPE (16:10) to suit the stage photo; a square crop
              would cut the speakers off at both edges. Both a width cap and a
              vh-driven height cap apply, and aspect-ratio resolves whichever
              binds first — so on a short laptop the image shrinks by height
              instead of forcing the section to scroll. Aligned RIGHT within
              its column so it sits closer to the text. */}
          <div className="w-full flex justify-end">
            <img
              src={storyImage}
              alt="Kunal Bahl introducing the term Indicorn at TechSparks"
              className="w-full object-cover rounded-[2px] shadow-sm"
              style={{
                aspectRatio: "779 / 382",
                maxWidth: "clamp(320px, 34vw, 520px)",
              }}
            />
          </div>

          {/* Story Text */}
          <div className="flex flex-col justify-center">
            <h3
              className={`font-medium m-0 text-black ${SUBHEADING_CLASS}`}
              style={{
                ...SUBHEADING_STYLE,
                marginBottom: "clamp(16px,min(1.85vw,2.86vh),28px)",
              }}
            >
              {storyLabel}
            </h3>
            {/* Separate paragraphs with a measured gap rather than <br /><br />,
                which spent a whole blank line-height (~26px at 720) on the
                break. */}
            {storyParagraphs.map((para, i) => (
              <p
                key={`para-${i}`}
                className={`font-normal m-0 text-[#1a1a1a] ${HERO_BODY_CLASS}`}
                style={{
                  ...HERO_BODY_STYLE,
                  marginTop: i === 0 ? 0 : "clamp(14px, 2vh, 26px)",
                }}
              >
                {para}
              </p>
            ))}
          </div>
        </motion.div>

        {/* Timeline Section (desktop / tablet only) */}
        {/* `--tl-pad` is the card's inner padding. The timeline rules are
            positioned off it (1px border + pad + 10px bullet radius), so the
            line stays pinned to the bullet centres at every viewport instead
            of drifting when the padding shrinks on short screens. */}
        <div
          className="max-md:hidden relative w-full"
          style={
            {
              "--tl-pad": "clamp(20px, min(2.4vw, 3.4vh), 32px)",
              "--tl-bullet": "20px",
              /* 16px == the old `md:gap-4`, and --tl-card reproduces
                 `md:grid-cols-3` exactly — so with 3 cards the carousel is
                 pixel-identical to the grid it replaces. `100%` inside these
                 resolves against the TRACK, which is itself 100% of the
                 viewport, so both the card basis and the slide distance
                 measure against the same width. */
              "--tl-gap": "16px",
              "--tl-card": "calc((100% - 2 * var(--tl-gap)) / 3)",
              "--tl-pitch": "calc(var(--tl-card) + var(--tl-gap))",
            } as React.CSSProperties
          }
        >
          {/* ── CAROUSEL VIEWPORT ──
              Clips the track to exactly three cards. The track itself is
              100% of this width, so a card basis of (100% - 2*gap)/3 and a
              slide of one --tl-pitch both measure against the same box. */}
          <div className="overflow-hidden">
          <div
            className="relative grid w-full transition-transform duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              /* One shared row grid for every card: bullet · date · title ·
                 desc · stats. The cards opt into it with `subgrid`, so the
                 date line, the title, the big number and the description all
                 sit on the SAME baseline across cards — even when one title
                 wraps to two lines or one caption wraps and another doesn't.

                 Row order follows the content: bullet · date · title · stat ·
                 description. The `1fr` therefore moved to the LAST row: it
                 used to sit on the description so that the stats below it were
                 pushed to a common bottom edge, but the description is now the
                 final row, so the slack belongs after it. */
              gridAutoFlow: "column",
              gridAutoColumns: "var(--tl-card)",
              gridTemplateRows: "auto auto auto auto 1fr",
              columnGap: "var(--tl-gap)",
              /* Slide by whole card pitches. CSS interpolates between two
                 calc() values, so this needs no measurement and stays exact
                 at every viewport width. */
              transform: `translateX(calc(-1 * ${start} * var(--tl-pitch)))`,
            }}
          >

          {/* Background Timeline Line — spans bullet-1 → bullet-N. Inside the
              track, so it slides WITH the cards and stays welded to the
              bullet centres. */}
          <div
            className="hidden md:block absolute h-[1px] bg-[#d3cec4] z-0"
            style={{
              top: "calc(var(--tl-pad) + var(--tl-bullet) / 2 + 0.5px)",
              left: "calc(var(--tl-pad) + var(--tl-bullet) / 2 + 1px)",
              width: `calc(${count - 1} * var(--tl-pitch))`,
            }}
          />

          {/* Animated Active Timeline Line (Desktop) — same start/width, grows
              from the first bullet (origin-left). */}
          <motion.div
            className="hidden md:block absolute h-[2px] z-0 origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: count > 1 ? activeIndex / (count - 1) : 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{
              top: "calc(var(--tl-pad) + var(--tl-bullet) / 2 - 0.5px)",
              left: "calc(var(--tl-pad) + var(--tl-bullet) / 2 + 1px)",
              width: `calc(${count - 1} * var(--tl-pitch))`,
              background: "linear-gradient(90deg, #0f2143 0%, #4060a8 100%)"
            }}
          />

          <div className="contents">
            {timelineData.map((item, index) => {
              const isActive = activeIndex === index;

              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  onClick={() => setActiveIndex(index)}
                  /* Longhands, not the `padding` shorthand: framer-motion
                     expands the shorthand into longhands itself and drops the
                     var() it can't parse, leaving padding-top/left/right
                     empty. */
                  style={{
                    paddingTop: "var(--tl-pad)",
                    paddingLeft: "var(--tl-pad)",
                    paddingRight: "var(--tl-pad)",
                    /* A little more than the other sides, to clear the 4px
                       progress bar pinned to the card's bottom edge. The old
                       allowance was clamp(12px, 1.8vh, 28px) — sized back when
                       the stats block was the last thing in the card and
                       needed breathing room beneath it. The description ends
                       the card now, so it only has to clear the bar. */
                    paddingBottom: "calc(var(--tl-pad) + clamp(2px, 0.4vh, 8px))",
                    /* Inherit the track's row sizes rather than sizing its own
                       rows — this is what makes every card's parts line up. */
                    gridTemplateRows: "subgrid",
                    gridRow: "1 / -1",
                  }}
                  className={`grid relative z-10 cursor-pointer overflow-hidden transition-all duration-500 ease-out ${
                    isActive
                      ? "bg-white rounded-[2px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#f0ebe1]"
                      : "bg-transparent border border-transparent hover:bg-white/40 rounded-[2px]"
                  }`}
                >
                  {/* Animated Loading Progress Bar (Bottom of Card) */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        key={`progress-${index}`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 3, ease: "linear" }}
                        className="absolute bottom-0 left-0 h-[4px] w-full origin-left bg-gradient-to-r from-[#0f2143] to-[#4060a8]"
                      />
                    )}
                  </AnimatePresence>

                  {/* Animated Bullet Point */}
                  <motion.div
                    animate={{
                      scale: isActive ? 1.2 : 1,
                      boxShadow: isActive
                        ? "0 0 0 4px rgba(15, 33, 67, 0.15), 0 0 12px rgba(15, 33, 67, 0.2)" // Dark blue gradient glow
                        : "0 0 0 0px rgba(15, 33, 67, 0)",
                      backgroundColor: "#0f2143", // Solid dark blue base
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="rounded-full origin-center relative z-20 shrink-0"
                    style={{
                      width: "var(--tl-bullet)",
                      height: "var(--tl-bullet)",
                      marginBottom: "clamp(16px, min(1.8vw, 2.6vh), 24px)",
                    }}
                  />

                  <p
                    className="m-0 font-medium text-[#333] relative z-20 max-md:!text-[15px]"
                    style={{
                      fontSize: "min(1.16vw, 1.8vh)",
                      marginBottom: "clamp(8px, 1.3vh, 12px)",
                    }}
                  >
                    {item.date}
                  </p>
                  <h4
                    className={`m-0 whitespace-pre-line relative z-20 text-black ${BODY_BOLD_CLASS}`}
                    style={{
                      ...HERO_BODY_STYLE,
                      /* Small, because the shared title row is already as tall
                         as the TALLEST title across the cards — two lines,
                         thanks to "The term is coined / 'Indicorn'." So a
                         one-line title like "The First List" already carries a
                         blank line beneath it before this margin is added, and
                         the stat drifted a long way from its heading. */
                      marginBottom: "clamp(4px, 0.8vh, 8px)",
                    }}
                  >
                    {item.title}
                  </h4>

                  {/* Stat sits ABOVE the description, which is the last line. */}
                  {item.statNumber && (
                    <div
                      className="relative z-20"
                      style={{ marginBottom: "clamp(8px, 1.3vh, 12px)" }}
                    >
                      <div
                        className="flex items-center gap-3"
                        /* Only when a caption follows. This margin separates
                           the number from `statSub`; with no caption it was
                           dead space padding the bottom of the stat block. */
                        style={{
                          marginBottom: item.statSub ? "clamp(6px, 1vh, 8px)" : 0,
                        }}
                      >
                        <span
                          className={`font-medium text-black ${SUBHEADING_CLASS}`}
                          style={SUBHEADING_STYLE}
                        >
                          {item.statNumber}
                        </span>
                        <span
                          className="leading-tight text-[#4a4a4a] whitespace-pre-line"
                          style={LABEL_STYLE}
                        >
                          {item.statLabel}
                        </span>
                      </div>
                      {item.statSub && (
                        <p
                          className="m-0 text-[#6b6b6b] leading-[1.4] whitespace-pre-line"
                          style={LABEL_STYLE}
                        >
                          {item.statSub}
                        </p>
                      )}
                    </div>
                  )}

                  <p
                    className="font-normal m-0 relative z-20 leading-[1.6] text-[#4a4a4a]"
                    style={{
                      fontSize: CARD_META_FONT_SIZE,
                      /* A card with no stat starts its text on the STAT row
                         rather than the description row, so it lines up with
                         the big numbers beside it instead of hanging a whole
                         empty stat block below its title. Spanning `4 / -1`
                         rather than just sitting in row 4 matters: row 5 is
                         the `1fr`, so a long description overflows into the
                         slack instead of inflating the stat row and shoving
                         every other card's description down. */
                      ...(item.statNumber ? null : { gridRow: "4 / -1" }),
                    }}
                  >
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
          </div>
          </div>

          {/* No separate control bar: navigation is integrated into the cards
              themselves. Clicking any visible card makes it active, and since
              the window ends on the active card, clicking the LEFT-most one
              walks the rail backwards a card at a time — that is the way back
              to the first. Autoplay also wraps: when the last card's timer
              finishes it returns to card 1 and the rail snaps back to the
              start of the timeline. */}
        </div>
      </motion.div>
    </section>
  );
}