"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import {
  HERO_HEADING_LIGHT_CLASS,
  HERO_HEADING_LIGHT_STYLE,
  HERO_BODY_STYLE,
} from "@/styles/heroTypography";

/**
 * /indicorns page hero — a folded "WHAT IS AN indicorns" card that
 * unfolds on click, imitating a letter that was folded three times.
 * Each of the three body panels lives above the visible face when the
 * card is shut; on open they pivot down about their top edge (rotateX
 * −90° → 0°) one after the other with a shared perspective on the
 * container, so the eye reads it as paper.
 *
 * COLOURS (sampled from the design):
 *   - Card body (folded + panel 1 + panel 3) → #FBF7F0  (site cream)
 *   - Panel 2 (middle fold)                  → #F3E6CF  (darker beige)
 *   - Bullet highlight chip                  → #D3E2FF  (light blue)
 */

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

// One fold beat. Whole letter (3 panels) opens/closes in ~3× this.
const FOLD_STAGGER = 0.3;
// Spring governs the rotation — organic "flop down and settle" like
// real paper released under its own weight. Near-critical damping so
// there's a whisper of settle but no clipping overshoot past flat.
const FOLD_SPRING = { type: "spring" as const, stiffness: 90, damping: 19, mass: 1 };
// Height reveal tween — matched to the spring's visual duration so
// the page flow opens at the same rate the leaf drops in.
const FOLD_HEIGHT_TWEEN = { duration: 0.7, ease: [0.33, 0, 0.2, 1] as const };

/**
 * FoldPanel — one leaf of the tri-folded letter.
 *
 * The unfold is driven by a SPRING on `rotateX` (folded −90° → flat 0°)
 * hinged at the panel's top edge, with a per-panel `perspective` on the
 * wrapper so every fold reads with the same 3D depth no matter where it
 * sits vertically. A `height` tween on the same wrapper opens the page
 * flow in lock-step, and a gradient "crease shadow" whose opacity is
 * derived from the LIVE rotation angle darkens the fold while it's still
 * bent and melts to nothing as it lies flat — the detail that makes it
 * read as paper rather than a dropping card.
 *
 * Open and close are perfect mirrors: opening runs top→bottom
 * (delays 0, s, 2s); closing runs bottom→top (delays 2s, s, 0) with the
 * SAME spring, so folding looks like unfolding played in reverse.
 */
function FoldPanel({
  isOpen,
  order,
  bg,
  children,
}: {
  isOpen: boolean;
  /** 0-indexed fold order from the top. */
  order: number;
  bg: string;
  children: React.ReactNode;
}) {
  const shape = PANEL_SHAPES[order];

  // Symmetric, mirrored stagger.
  const openDelay = order * FOLD_STAGGER;
  const closeDelay = (2 - order) * FOLD_STAGGER;

  // Live fold angle → crease-shadow opacity. Deep shadow while bent,
  // gone once flat.
  const rotateX = useMotionValue(isOpen ? 0 : -90);
  const creaseOpacity = useTransform(rotateX, [-90, -30, 0], [0.55, 0.22, 0]);

  useEffect(() => {
    const controls = animate(rotateX, isOpen ? 0 : -90, {
      ...FOLD_SPRING,
      delay: isOpen ? openDelay : closeDelay,
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Trapezoidal panels get a little extra horizontal padding so text
  // stays clear of the sloped side edges.
  const sidePad = order === 0 ? "0" : order === 1 ? "1.5%" : "3%";

  return (
    <motion.div
      style={{
        overflow: "hidden",
        willChange: "height",
        width: shape.width,
        marginLeft: shape.marginLeft,
        clipPath: shape.clipPath,
        WebkitClipPath: shape.clipPath,
        // Per-panel perspective → consistent fold depth everywhere.
        perspective: "1400px",
        perspectiveOrigin: "top center",
      }}
      initial={false}
      animate={isOpen ? { height: "auto" } : { height: 0 }}
      transition={{
        ...FOLD_HEIGHT_TWEEN,
        delay: isOpen ? openDelay : closeDelay,
      }}
    >
      {/* The rotating leaf — hinged at its TOP edge (the crease). */}
      <motion.div
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

export default function IndicornsHeroClient() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section
      className="relative w-full bg-white"
      style={{
        // The section sizes to its content: compact when the card is
        // folded (just the header face), then grows as the fold panels
        // animate their height open. No forced min-height so the closed
        // state stays tight to the card.
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
          animate={{ opacity: isOpen ? 0 : 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          style={{ width: "calc(100% - clamp(16px, 3vw, 40px))" }}
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

        {/* ── FOLDED CARD (visible face + click target) ── */}
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          aria-controls="indicorns-unfold"
          className="group relative flex w-full cursor-pointer items-center justify-center overflow-hidden text-center"
          style={{
            background: CARD_BG_LIGHT,
            border: "none",
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
              What is an
            </h1>

            {/* "indicorns" wordmark — coloured Hindi-styled graphic.
                Slightly larger, and nudged up a touch relative to the
                "What is an" text via a small negative translateY. */}
            <div
              className="relative shrink-0"
              style={{
                height: "clamp(48px, min(9vw, 11.5vh), 128px)",
                aspectRatio: "3.5 / 1",
                transform: "translateY(clamp(-16px, -1.2vw, -8px))",
              }}
            >
              <Image
                src="/images/indicorns/Indi.png"
                alt="indicorns"
                fill
                sizes="(max-width: 768px) 60vw, 380px"
                priority
                className="object-contain"
              />
            </div>
          </div>

          {/* Chevron in the corner — rotates when open */}
          <motion.span
            aria-hidden
            className="absolute right-[clamp(16px,min(2vw,3vh),32px)] top-1/2 -translate-y-1/2 text-[#0E0E0E]/40 transition-colors group-hover:text-[#0E0E0E]"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
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
        </button>

        {/* ── UNFOLDING PANELS ──
            Three FoldPanel leaves pivot down from a common top-edge
            hinge below the visible card face. Staggered delays make
            each fold appear to open in sequence, like a letter being
            unfolded down the middle three times. */}
        <div id="indicorns-unfold" style={{ position: "relative" }}>
          <FoldPanel isOpen={isOpen} order={0} bg={CARD_BG_LIGHT}>
            <p
              className="m-0 text-center font-['Poppins',_sans-serif] font-normal text-[#0E0E0E]"
              style={BODY_TEXT_STYLE}
            >
              For too long, India&apos;s startup ecosystem has measured
              success by a single metric borrowed from Silicon Valley: the
              unicorn — a company worth $1 billion or more. But a
              billion-dollar valuation is a number defined by someone else,
              in a currency that&apos;s not ours, against a benchmark that
              has no grounding in the reality of Indian business
            </p>
          </FoldPanel>

          <FoldPanel isOpen={isOpen} order={1} bg={CARD_BG_MID}>
            <p
              className="m-0 text-center font-['Poppins',_sans-serif] font-normal text-[#0E0E0E]"
              style={BODY_TEXT_STYLE}
            >
              We asked a different question: what does real, enduring
              success look like in India?
            </p>
          </FoldPanel>

          <FoldPanel isOpen={isOpen} order={2} bg={CARD_BG_LIGHT}>
            <p
              className="m-0 font-['Poppins',_sans-serif] font-normal text-[#0E0E0E]"
              style={BODY_TEXT_STYLE}
            >
              The answer became Indicorn — a company that is
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
              <li>
                Founded in{" "}
                <Highlight>India within the last 15 years</Highlight>
              </li>
              <li>
                Has crossed{" "}
                <Highlight>₹100 crore in annual revenue</Highlight>
              </li>
              <li>
                Has <Highlight>achieved profitability</Highlight> — building
                a business that sustains itself
              </li>
            </ul>
          </FoldPanel>
        </div>
      </div>
    </section>
  );
}
