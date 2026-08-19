"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  cubicBezier,
  type MotionValue,
} from "framer-motion";
import {
  HERO_HEADING_LIGHT_CLASS,
  HERO_HEADING_LIGHT_STYLE,
  HERO_BODY_STYLE,
} from "@/styles/heroTypography";

/**
 * /indicorns page hero — a folded "WHAT ARE indicorns" card that unfolds AS
 * YOU SCROLL, imitating a letter that was folded three times. Each of the
 * three body panels lives above the visible face when the card is shut; as
 * the page scrolls they pivot down about their top edge (rotateX −90° → 0°)
 * one after the other with a shared perspective on the container, so the eye
 * reads it as paper.
 *
 * The card sits in normal flow at its natural size — nothing is scaled and no
 * space is reserved — so while it is folded the next section shows directly
 * beneath it. See SCROLL CHOREOGRAPHY below.
 *
 * COLOURS (sampled from the design):
 *   - Card body (folded + panel 1 + panel 3) → #FBF7F0  (site cream)
 *   - Panel 2 (middle fold)                  → #F3E6CF  (darker beige)
 *   - Bullet highlight chip                  → #D3E2FF  (light blue)
 */

/* ─────────────────────────────────────────────────────────
   Sanity contract. Every field is optional — whatever the CMS
   doesn't supply falls back to the constants below, so the
   section never renders empty.
   ───────────────────────────────────────────────────────── */
export interface IndicornCriterion {
  before?: string;
  highlight?: string;
  after?: string;
}

export interface IndicornsHeroData {
  headingPrefix?: string;
  wordmark?: string;
  panelOne?: string;
  panelTwo?: string;
  panelThreeIntro?: string;
  criteria?: IndicornCriterion[];
}

const FALLBACK_HEADING_PREFIX = "What Are";
const FALLBACK_WORDMARK = "/images/indicorns/Indi.png";
const FALLBACK_PANEL_ONE =
  "For too long, India's startup ecosystem has measured success by a single metric borrowed from Silicon Valley: the unicorn — a company worth $1 billion or more. But a billion-dollar valuation is a number defined by someone else, in a currency that's not ours, against a benchmark that has no grounding in the reality of Indian business";
const FALLBACK_PANEL_TWO =
  "We asked a different question: what does real, enduring success look like in India?";
const FALLBACK_PANEL_THREE_INTRO =
  "The answer became Indicorn — a company that is";
const FALLBACK_CRITERIA: IndicornCriterion[] = [
  { before: "Founded in", highlight: "India within the last 15 years", after: "" },
  { before: "Has crossed", highlight: "₹100 crore in annual revenue", after: "" },
  {
    before: "Has",
    highlight: "achieved profitability",
    after: "— building a business that sustains itself",
  },
];

const CARD_BG_LIGHT = "#FBF7F0";
const CARD_BG_MID = "#F3E6CF";
const HIGHLIGHT_BG = "#D3E2FF";

const HEADING_STYLE: React.CSSProperties = HERO_HEADING_LIGHT_STYLE;

const PANEL_PADDING =
  "clamp(28px, min(4vw, 5.5vh), 64px) clamp(24px, min(6vw, 8vh), 96px)";

/** Hero body copy — the description and the bullets beneath it. */
const BODY_TEXT_STYLE: React.CSSProperties = {
  ...HERO_BODY_STYLE,
  lineHeight: "1.6",
};

/** Small helper — inline blue chip behind a phrase in the bullets. */
function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        background: HIGHLIGHT_BG,
        padding: "0 6px",
        borderRadius: "2px",
      }}
    >
      {children}
    </span>
  );
}

/**
 * Static trapezoid shapes for the three unfolded panels — each one
 * gets progressively wider at the bottom than the previous panel's
 * bottom, so together they read as a letter that was folded three
 * times and is now spread flat toward the viewer. Panel 0 stays a
 * clean rectangle; panels 1 and 2 use a wider element plus a
 * clip-path polygon whose top-edge x-coords line up exactly with the
 * previous panel's bottom edge — no visible seams.
 *
 * Widening math (W = folded card face width):
 *   Panel 0 (top)    : own width 100% W, no clip → straight rectangle
 *   Panel 1 (middle) : own width 108% W, left −4%, clip trims top to
 *                      span 0–100% W → bottom spans −4% to 104% W
 *   Panel 2 (bottom) : own width 116% W, left −8%, clip trims top to
 *                      span −4% to 104% W → bottom spans −8% to 108% W
 */
type PanelSpec = {
  width: string;
  marginLeft: string;
  clipPath?: string;
};
const PANEL_SHAPES: PanelSpec[] = [
  // Top — flush rectangle
  { width: "100%", marginLeft: "0" },
  // Middle — subtle trapezoid: top edge 1.5-98.5% of 103% span
  // (each side widens by 1.5% at the bottom vs the top)
  {
    width: "103%",
    marginLeft: "-1.5%",
    clipPath: "polygon(1.5% 0%, 98.5% 0%, 100% 100%, 0% 100%)",
  },
  // Bottom — same taper, continuing from panel 1's bottom edge
  {
    width: "106%",
    marginLeft: "-3%",
    clipPath: "polygon(1.4% 0%, 98.6% 0%, 100% 100%, 0% 100%)",
  },
];

/**
 * SCROLL CHOREOGRAPHY
 *
 * The section sits in NORMAL FLOW — no sticky pin, no tall runway — so while
 * the card is folded it occupies only its own compact height and the next
 * section is visible right beneath it.
 *
 * `openness` is therefore a function of raw window scroll, with the
 * thresholds expressed as fractions of the viewport height so the pacing
 * feels the same on a 617px laptop and a 1117px one:
 *
 *   0.00 ─▶ 0.04 vh   folded — only while you are at the very top
 *   0.04 ─▶ 0.58 vh   unfolds, leaf by leaf
 *   0.58 vh and past   STAYS OPEN
 *
 * There is no closing phase: once opened the letter stays open for the rest
 * of the page. It only re-folds by scrolling back to the top, which is the
 * same range played in reverse.
 *
 * Driving off scrollY (rather than the section's own geometry) matters: the
 * card grows as it opens, and any progress derived from its height would feed
 * back into itself and jitter. The card's TOP never moves, so scrollY is a
 * stable input.
 *
 * Each leaf consumes a WINDOW of the 0→1 range rather than firing on a timer,
 * so the stagger is a property of scroll position, not elapsed time. Because
 * the windows are just ranges, scrolling back up plays the fold in reverse
 * for free — bottom leaf closes first, exactly mirroring the open.
 */
const FOLD_SPAN = 0.62;
const FOLD_STEP = (1 - FOLD_SPAN) / 2;
const FOLD_EASE = cubicBezier(0.22, 1, 0.36, 1);

/** Scroll thresholds, as multiples of the viewport height. */
const OPEN_START = 0.04;
/* Spread over more than half a viewport of scrolling — the wider this range,
   the slower the paper opens for the same wheel movement. */
const OPEN_END = 0.58;

/**
 * FoldPanel — one leaf of the tri-folded letter.
 *
 * `rotateX` (folded −90° → flat 0°) is hinged at the panel's top edge, with a
 * per-panel `perspective` on the wrapper so every fold reads with the same 3D
 * depth no matter where it sits vertically. The wrapper's `height` is driven
 * from the same progress so the layout opens in lock-step, and a gradient
 * "crease shadow" whose opacity derives from the LIVE rotation angle darkens
 * the fold while it's still bent and melts to nothing as it lies flat — the
 * detail that makes it read as paper rather than a dropping card.
 *
 * Every value is a pure function of scroll position, so open and close are
 * perfect mirrors with no extra code.
 */
function FoldPanel({
  openness,
  order,
  bg,
  children,
}: {
  /** 0 = fully folded, 1 = fully open. Driven by scroll position. */
  openness: MotionValue<number>;
  /** 0-indexed fold order from the top. */
  order: number;
  bg: string;
  children: React.ReactNode;
}) {
  const shape = PANEL_SHAPES[order];

  /* The wrapper's height is animated, so it cannot be `auto` — measure the
     leaf's natural height and scale the wrapper from it. A ResizeObserver
     keeps that honest when the viewport (and so the text wrapping) changes. */
  const leafRef = useRef<HTMLDivElement>(null);
  const [leafH, setLeafH] = useState(0);

  useEffect(() => {
    const el = leafRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setLeafH(el.offsetHeight));
    ro.observe(el);
    setLeafH(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  // This leaf's slice of the shared 0→1 range.
  const start = order * FOLD_STEP;
  const local = useTransform(openness, (v) =>
    FOLD_EASE(Math.min(1, Math.max(0, (v - start) / FOLD_SPAN)))
  );

  const rotateX = useTransform(local, [0, 1], [-90, 0]);
  const height = useTransform(local, (t) => leafH * t);
  // Live fold angle → crease-shadow opacity. Deep shadow while bent, gone
  // once flat.
  const creaseOpacity = useTransform(rotateX, [-90, -30, 0], [0.55, 0.22, 0]);

  // Trapezoidal panels get a little extra horizontal padding so text
  // stays clear of the sloped side edges.
  const sidePad = order === 0 ? "0" : order === 1 ? "1.5%" : "3%";

  return (
    <motion.div
      style={{
        overflow: "hidden",
        willChange: "height",
        height,
        width: shape.width,
        marginLeft: shape.marginLeft,
        clipPath: shape.clipPath,
        WebkitClipPath: shape.clipPath,
        // Per-panel perspective → consistent fold depth everywhere.
        perspective: "1400px",
        perspectiveOrigin: "top center",
      }}
    >
      {/* The rotating leaf — hinged at its TOP edge (the crease). */}
      <motion.div
        ref={leafRef}
        style={{
          position: "relative",
          background: bg,
          rotateX,
          transformOrigin: "top center",
          transformStyle: "preserve-3d",
          WebkitBackfaceVisibility: "hidden",
          backfaceVisibility: "hidden",
          willChange: "transform",
          padding: PANEL_PADDING,
          paddingLeft: `calc(${PANEL_PADDING.split(" ")[1]} + ${sidePad})`,
          paddingRight: `calc(${PANEL_PADDING.split(" ")[1]} + ${sidePad})`,
        }}
      >
        {children}

        {/* Crease shadow — darkest at the top fold line, fading down.
            Opacity is tied to the live fold angle. */}
        <motion.div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.12) 25%, transparent 55%)",
            opacity: creaseOpacity,
          }}
        />
      </motion.div>
    </motion.div>
  );
}

export default function IndicornsHeroClient({
  data,
}: {
  data?: IndicornsHeroData | null;
}) {
  const headingPrefix = data?.headingPrefix || FALLBACK_HEADING_PREFIX;
  const wordmark = data?.wordmark || FALLBACK_WORDMARK;
  const panelOne = data?.panelOne || FALLBACK_PANEL_ONE;
  const panelTwo = data?.panelTwo || FALLBACK_PANEL_TWO;
  const panelThreeIntro = data?.panelThreeIntro || FALLBACK_PANEL_THREE_INTRO;
  const criteria =
    data?.criteria && data.criteria.length > 0 ? data.criteria : FALLBACK_CRITERIA;

  /* Viewport height drives the scroll thresholds, so the fold is paced the
     same on a short laptop as on a tall one. Read into state (not `vh` units)
     because the thresholds are compared against scrollY in pixels. */
  const [vh, setVh] = useState(0);
  useEffect(() => {
    const read = () => setVh(window.innerHeight);
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  const { scrollY } = useScroll();

  const rawOpenness = useTransform(scrollY, (y) => {
    if (!vh) return 0;
    const openStart = vh * OPEN_START;
    const openEnd = vh * OPEN_END;

    if (y <= openStart) return 0;
    if (y < openEnd) return FOLD_EASE((y - openStart) / (openEnd - openStart));
    // Past the opening range it stays open — no close phase.
    return 1;
  });

  /* Spring-smoothed before it drives anything. Raw scroll is stepped —
     especially on a mouse wheel — and binding the fold straight to it looks
     mechanical. The spring keeps the paper moving for a beat after the wheel
     stops, which is what separates "tied to a scrollbar" from "premium". */
  const openness = useSpring(rawOpenness, {
    // Softer and heavier than before, so each leaf settles more slowly.
    stiffness: 80,
    damping: 22,
    mass: 0.5,
  });

  // The peek strips hint "there's more folded behind this" — no job once the
  // letter is open, so they fade early.
  const peekOpacity = useTransform(openness, [0, 0.22], [1, 0]);

  return (
    <section
      className="relative w-full bg-white"
      style={{
        // Sizes to its content: compact while the card is folded — so the next
        // section shows right beneath it — then grows as the leaves unfold.
        marginTop: "var(--nav-height)",
        paddingTop: "var(--section-py)",
        paddingBottom: "var(--section-py)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
          <div
            className="mx-auto flex w-full max-w-[1200px] flex-col items-stretch"
            style={{
              // Perspective governs the 3D "depth" of the fold. Higher
              // values = subtler fold; lower = more dramatic.
              perspective: "2200px",
              perspectiveOrigin: "top center",
            }}
          >
            {/* ── "PEEK" STRIPS ──
                Two thin bars, slightly indented and progressively deeper
                in tone, sit above the folded card face to hint that the
                paper has more folded panels stacked behind it. Fades out
                once the card is fully open. */}
            <motion.div
              aria-hidden
              className="mx-auto"
              style={{
                opacity: peekOpacity,
                width: "calc(100% - clamp(16px, 3vw, 40px))",
              }}
            >
              <div
                style={{
                  height: "clamp(4px, 0.7vw, 8px)",
                  background: "#E8DFC6",
                  borderRadius: "2px 2px 0 0",
                  width: "calc(100% - clamp(16px, 3vw, 40px))",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              />
              <div
                style={{
                  height: "clamp(4px, 0.7vw, 8px)",
                  background: "#F0E7CE",
                  borderRadius: "2px 2px 0 0",
                  width: "calc(100% - clamp(6px, 1.2vw, 16px))",
                  marginLeft: "auto",
                  marginRight: "auto",
                  marginTop: "2px",
                }}
              />
            </motion.div>

            {/* ── CARD FACE ──
                No longer a button: the fold is driven by scroll position, so
                there is nothing to click. The copy stays in the DOM at every
                fold state, so it remains available to assistive tech. */}
            <div
              className="group relative flex w-full flex-col items-center justify-center overflow-hidden text-center"
              style={{
                background: CARD_BG_LIGHT,
                padding:
                  "clamp(32px, min(4vw, 6vh), 64px) clamp(24px, min(4vw, 6vh), 64px)",
                borderRadius: "2px",
                boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
              }}
            >
              <div className="flex flex-wrap items-center justify-center gap-[clamp(12px,min(1.5vw,2vh),24px)]">
                <h1
                  className={`m-0 text-[#0E0E0E] ${HERO_HEADING_LIGHT_CLASS}`}
                  style={HEADING_STYLE}
                >
                  {headingPrefix}
                </h1>

                {/* "indicorns" wordmark — coloured Hindi-styled graphic.
                    Slightly larger, and nudged up a touch relative to the
                    "What is an" text via a small negative translateY. */}
                <div
                  className="relative shrink-0"
                  style={{
                    height: "clamp(80px, min(15vw, 18vh), 150px)",
                    aspectRatio: "3.5 / 1",
                    transform: "translateY(clamp(-36px, -1.5vw, -14px))",
                  }}
                >
                  <Image
                    src={wordmark}
                    alt="indicorns"
                    fill
                    sizes="(max-width: 768px) 80vw, 480px"
                    priority
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Chevron — commented out while the scroll-driven fold is being
                  tested. To restore, un-comment and drive `rotate` off
                  `openness` (0 → 180deg) instead of a click. */}
              {/*
              <motion.span
                aria-hidden
                className="text-[#0E0E0E]/40"
                style={{
                  marginTop: "clamp(12px, min(1.6vw, 2.2vh), 24px)",
                  rotate: useTransform(openness, [0, 1], [0, 180]),
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M5 8l5 5 5-5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.span>
              */}
            </div>

            {/* ── UNFOLDING PANELS ──
                Three FoldPanel leaves pivot down from a common top-edge
                hinge below the visible card face. Staggered scroll windows
                make each fold open in sequence, like a letter being
                unfolded down the middle three times. */}
            <div id="indicorns-unfold" style={{ position: "relative" }}>
              <FoldPanel openness={openness} order={0} bg={CARD_BG_LIGHT}>
                <p
                  className="m-0 text-center font-['Poppins',_sans-serif] font-normal text-[#0E0E0E]"
                  style={BODY_TEXT_STYLE}
                >
                  {panelOne}
                </p>
              </FoldPanel>

              <FoldPanel openness={openness} order={1} bg={CARD_BG_MID}>
                <p
                  className="m-0 text-center font-['Poppins',_sans-serif] font-normal text-[#0E0E0E]"
                  style={BODY_TEXT_STYLE}
                >
                  {panelTwo}
                </p>
              </FoldPanel>

              <FoldPanel openness={openness} order={2} bg={CARD_BG_LIGHT}>
                <p
                  className="m-0 font-['Poppins',_sans-serif] font-normal text-[#0E0E0E]"
                  style={BODY_TEXT_STYLE}
                >
                  {panelThreeIntro}
                </p>

                <ul
                  className="m-0 list-disc font-['Poppins',_sans-serif] font-normal text-[#0E0E0E]"
                  style={{
                    marginTop: "clamp(16px, min(2vw, 2.6vh), 32px)",
                    paddingLeft: "clamp(20px, min(2vw, 2.6vh), 32px)",
                    ...BODY_TEXT_STYLE,
                    display: "flex",
                    flexDirection: "column",
                    gap: "clamp(10px, min(1.4vw, 1.8vh), 20px)",
                  }}
                >
                  {criteria.map((c, i) => (
                    <li key={`criterion-${i}`}>
                      {c.before ? `${c.before} ` : ""}
                      {c.highlight && <Highlight>{c.highlight}</Highlight>}
                      {c.after ? ` ${c.after}` : ""}
                    </li>
                  ))}
                </ul>
              </FoldPanel>
            </div>
          </div>
    </section>
  );
}
