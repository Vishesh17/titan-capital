"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useLenis } from "lenis/react";
import {
  motion,
  animate,
  useMotionValue,
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
 * /indicorns page hero — a "WHAT ARE indicorns" card that unfolds like a letter
 * folded three times. Each of the three body panels lives above the visible
 * face when the card is shut; as it opens they pivot down about their top edge
 * (rotateX −90° → 0°) one after the other with a shared perspective on the
 * container, so the eye reads it as paper.
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

/**
 * Intrinsic aspect of the wordmark artwork (Indi.png is 1712 x 404).
 *
 * The box used to be a round `3.5 / 1`, which does NOT match the file. Inside
 * an `object-contain` box a mismatch letterboxes: at a 144px box the artwork
 * painted only 118px, leaving 13px of empty space above and below it, and
 * making the row 9.7px taller than the heading it sits beside. That is 36px of
 * height that looks exactly like padding but cannot be tuned as padding.
 *
 * Matching the real ratio removes it with no change to the rendered logo — the
 * artwork is centred in the box either way, so heading and wordmark keep the
 * same optical relationship; only the empty margin around the artwork goes.
 *
 * If an editor uploads a wordmark with a different ratio it simply letterboxes
 * again, exactly as before — never cropped or distorted.
 */
const WORDMARK_ASPECT = "1712 / 404";

/**
 * Padding inside each unfolded leaf, split into two axes.
 *
 * VERTICAL sets the gap between a fold's text and the crease above it — and
 * the first leaf's top padding is half of the space under the closed card's
 * heading, so it is tuned together with the card face's padding.
 *
 * HORIZONTAL is the reading measure and is deliberately much larger; it is
 * left alone when the vertical rhythm is tightened, because shortening the
 * line length is what makes this copy readable at 1200px.
 *
 * Two constants rather than one shorthand string. The shorthand was being
 * torn apart with `PANEL_PADDING.split(" ")[1]` to recover the horizontal
 * half, which yields the fragment `"min(4vw,"` — so the `calc()` built from
 * it was invalid, silently dropped, and the per-panel trapezoid clearance it
 * was meant to add never applied to anything. Longhands also matter for
 * framer-motion, which expands a `padding` shorthand itself and can drop
 * values it cannot parse.
 */
const PANEL_PAD_Y = "clamp(11px, min(1.25vw, 1.9vh), 22px)";
const PANEL_PAD_X = "clamp(24px, min(6vw, 8vh), 96px)";

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
 * CHOREOGRAPHY
 *
 * `openness` (0 folded → 1 open) is NOT a function of scroll position. It is a
 * plain animated value, and the scroll wheel is treated as a discrete GESTURE
 * that triggers it. The sequence, on desktop:
 *
 *   land on the page      card folded
 *   scroll down once      that gesture is swallowed; the card unfolds and the
 *                         page is held for LOCK_SECONDS so you cannot scroll
 *                         straight past a card that is still opening
 *   scroll down again     nothing is intercepted — you simply carry on to the
 *                         next section. The card does NOT fold itself
 *   back at the top       if the card is shut (the arrow closed it), the next
 *                         downward scroll opens it again — the gesture re-arms
 *                         purely from "shut AND at the top", so it never gets
 *                         permanently used up
 *
 * WHY A GESTURE AND NOT SCROLL POSITION. A scrubbed version needs a tall
 * runway plus a sticky pin, and then coming back up the runway replays the
 * fold in reverse; suppressing that replay leaves a screenful of empty pinned
 * scrolling.
 *
 * WHY THE PAGE DOESN'T JUMP. The section stays in normal flow and really does
 * grow when it opens — but that is gated to scrollY 0, so the size change
 * happens strictly BELOW the top edge of the viewport. Nothing on screen
 * moves; the sections underneath are simply pushed further down. And because
 * the card never folds on its own, the section can no longer collapse out from
 * under a reader who is already partway down the page.
 *
 * LOCK_SECONDS is deliberately shorter than OPEN_SECONDS. Every scroll input
 * that arrives while the page is held is swallowed outright, so a lock lasting
 * the whole unfold makes the page feel like it is ignoring you. Releasing
 * early lets the last leaves settle while you are already moving on.
 *
 * The open card needs no help filling the screen: it measures 965px of a
 * 1117px viewport, and 615px of 617px on a short laptop.
 *
 * MOBILE opts out entirely: no gesture capture and no fixed height. The open
 * card is 797px against an 812px viewport on a tall phone and overflows a
 * short one outright, so a "you cannot scroll past" rule there would trap the
 * reader. On mobile the arrow button is the only control and the page scrolls
 * normally at all times.
 */
const FOLD_SPAN = 0.62;
const FOLD_STEP = (1 - FOLD_SPAN) / 2;
const FOLD_EASE = cubicBezier(0.22, 1, 0.36, 1);

/* Seconds, and now honest ones: the driver is linear (see the `animate` call),
   so these are the times you actually see rather than a nominal length mostly
   spent in an invisible tail. The three leaves stagger across the window, so
   the last one lands at ~78% of OPEN_SECONDS — 1.4s of visible unfolding.

   LOCK is how long the page is held, and is deliberately shorter than the
   unfold: scroll input that arrives while the page is stopped is swallowed
   outright, so locking for the whole animation makes the page feel like it is
   ignoring you. It releases just before the last leaf settles. */
const OPEN_SECONDS = 1.8;
const CLOSE_SECONDS = 1.2;
const LOCK_SECONDS = 1.1;

/** Below this the gesture capture is off entirely — see MOBILE above. */
const CAPTURE_MIN_WIDTH = "(min-width: 768px)";

/** Treat the hero as "at the top" within this many px of scroll. */
const TOP_EPSILON = 4;

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

  /* The trapezoidal panels used to ask for extra horizontal padding here, to
     keep text clear of the sloped side edges. It never took effect (see the
     note on PANEL_PAD_X) and it is not needed: the widest taper insets a
     panel's TOP edge by 1.4-1.5% of its own width — about 18px at the 1200px
     cap, 5px on a phone — against a horizontal padding that is never below
     24px. Text has always cleared the slope on its own. */

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
          paddingTop: PANEL_PAD_Y,
          paddingBottom: PANEL_PAD_Y,
          paddingLeft: PANEL_PAD_X,
          paddingRight: PANEL_PAD_X,
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

  const [isOpen, setIsOpen] = useState(false);

  /* `openness` is animated, never scrubbed — see CHOREOGRAPHY. */
  const openness = useMotionValue(0);
  useEffect(() => {
    /* LINEAR ON PURPOSE — do not "restore" the house easing here.
       FOLD_EASE is already applied per leaf inside FoldPanel. Easing this
       driver too composes the curve with itself, and cubic-bezier(.22,1,.36,1)
       is ~55% done in its first 10% of time, so squaring it collapses the
       whole animation into a blink: at a nominal 2.2s the card was fully open
       after 0.58s, with 1.6s of invisible tail left over. Linear here means
       the duration below is the duration you actually see, and the three
       leaves stagger evenly across it. */
    const controls = animate(openness, isOpen ? 1 : 0, {
      duration: isOpen ? OPEN_SECONDS : CLOSE_SECONDS,
      ease: "linear",
    });
    return () => controls.stop();
  }, [isOpen, openness]);

  /* The wheel handler needs today's value synchronously on every event, and
     re-rendering for each one would be wasteful and a frame behind — so the
     open flag is mirrored into a ref. */
  const openRef = useRef(false);
  useEffect(() => {
    openRef.current = isOpen;
  }, [isOpen]);

  /** True while the page is being held for an unfold. */
  const busy = useRef(false);
  const timer = useRef<number | null>(null);

  /**
   * The page is scrolled by Lenis, not by the browser, so `preventDefault` on
   * wheel achieves nothing here — Lenis has already called it and is moving
   * the page from its own loop. `lenis.stop()` is the real brake. Keyboard is
   * the exception: Lenis leaves arrow/page keys to the browser, so those still
   * have to be cancelled by hand.
   */
  const lenis = useLenis();

  /** The arrow button. Taking manual control retires the scroll gesture for
   *  good, so a later scroll can't fight whatever the reader just chose. */
  const toggle = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    busy.current = false;
    lenis?.start();
    /* Unfolding grows the section. That is invisible at the top of the page,
       but if the reader has come back UP to the hero and is sitting a little
       way down it, the growth would shove what they are looking at downwards.
       Returning to the top first keeps the card the fixed point. */
    if (!isOpen && window.scrollY > TOP_EPSILON) lenis?.scrollTo(0);
    setIsOpen((o) => !o);
  }, [isOpen, lenis]);

  useEffect(() => {
    if (!lenis) return;
    if (!window.matchMedia(CAPTURE_MIN_WIDTH).matches) return;

    /* The only condition. No latch and no spent flag: the gesture is armed
       exactly when the card is shut and you are at the top, so it works the
       first time and every time you come back up to a shut card. */
    const armed = () =>
      !busy.current && !openRef.current && window.scrollY <= TOP_EPSILON;

    const openAndHold = () => {
      setIsOpen(true);
      busy.current = true;
      lenis.stop();
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        busy.current = false;
        timer.current = null;
        lenis.start();
      }, LOCK_SECONDS * 1000);
    };

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 0 && armed()) openAndHold();
    };

    const DOWN_KEYS = ["ArrowDown", "PageDown", "End", " ", "Spacebar"];
    const onKeyDown = (e: KeyboardEvent) => {
      if (!DOWN_KEYS.includes(e.key) || e.shiftKey) return;
      const t = e.target as HTMLElement | null;
      // Never swallow a key aimed at a control or a text field.
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(t.tagName)))
        return;
      // Lenis leaves these keys to the browser, so blocking them is on us.
      if (busy.current) {
        e.preventDefault();
        return;
      }
      if (armed()) {
        e.preventDefault();
        openAndHold();
      }
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      if (timer.current) window.clearTimeout(timer.current);
      // Never leave the page frozen behind an unmounted component.
      busy.current = false;
      lenis.start();
    };
  }, [lenis]);

  const chevronRotate = useTransform(openness, [0, 1], [0, 180]);

  // The peek strips hint "there's more folded behind this" — no job once the
  // letter is open, so they fade early.
  const peekOpacity = useTransform(openness, [0, 0.22], [1, 0]);

  return (
    <section
      /* CONSTANT HEIGHT ON DESKTOP — the whole reason the page never jumps.
         `100vh − nav` whether the card is shut or open, with the card centred,
         so unfolding grows it about its own middle and the document height
         does not move. Mobile stays auto-height: the open card can exceed the
         viewport there, and a fixed height would clip it. */
      className="relative w-full bg-white"
      /* NORMAL FLOW, sized to its content — no pin, no reserved screen. While
         the card is shut the section is only as tall as the shut card, so the
         next section shows right beneath it, and unfolding grows it in place.
         The open card needs no forcing to fill the screen: it already comes to
         965px of a 1117px viewport, and 615px of 617px on a short laptop.

         Growing and shrinking here is safe because the whole open/fold cycle
         is gated to scrollY 0 (see CHOREOGRAPHY). Everything that changes size
         is BELOW the viewport's top edge, so the page never appears to move —
         which is what keeps the fold from throwing you into the next section. */
      style={{
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
                /* Deliberately tighter than a normal section: the folded card
                   is the whole first screen, and at the old 64px ceiling it
                   stood 425px tall to hold one line of type.

                   This is also the lever on the gap BELOW the heading once the
                   card opens: that gap is this bottom padding plus the first
                   fold panel's own top padding, so trimming here narrows the
                   opened state too.

                   The HORIZONTAL value is the smaller of the two on purpose.
                   Nothing but the heading row lives in this box — the three
                   fold panels carry their own, much wider, PANEL_PADDING — so
                   side padding here buys no readability, it only narrows the
                   line and forces the wrap described below. */
                padding:
                  "clamp(14px, min(1.5vw, 2.2vh), 24px) clamp(16px, min(2vw, 3vh), 32px)",
                borderRadius: "2px",
                boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
              }}
            >
              {/* Heading + wordmark. `flex-wrap` is for MOBILE, where the
                  wordmark has to drop below the text. On desktop the two must
                  stay on one line — see the width budget on the wordmark. */}
              <div className="flex flex-wrap items-center justify-center gap-[clamp(8px,min(0.9vw,1.2vh),14px)]">
                <h1
                  className={`m-0 text-[#0E0E0E] ${HERO_HEADING_LIGHT_CLASS}`}
                  style={HEADING_STYLE}
                >
                  {headingPrefix}
                </h1>

                {/* "indicorns" wordmark — coloured Hindi-styled graphic.
                    Slightly larger, and nudged up a touch relative to the
                    "What is an" text via a small negative translateY.

                    HEIGHT is the height of the BOX, and with WORDMARK_ASPECT
                    the box is now the artwork — so every term is the old one
                    scaled by 118/144, the fraction the artwork actually filled
                    before. The rendered logo is therefore unchanged at every
                    viewport; only the empty margin around it is gone.

                    WIDTH BUDGET — why the ceiling is 118px and not higher.
                    This box is `shrink-0` with a fixed aspect, so it cannot
                    give way: if heading + gap + wordmark exceeds the card's
                    inner width, the row wraps and the card grows by a whole
                    extra line. The worst case is the widest heading, which is
                    its 112px clamp ceiling — "WHAT ARE" measures 588px there.
                    Against the 1136px inner width (1200px cap − 2 × 32px):

                        588 heading + 14 gap + 500 wordmark = 1102px   ✓ 34px spare

                    Originally this was 150px / 3.5:1 — a 525px wordmark and a
                    1137px row against the 1072px available then, so every
                    viewport tall enough to reach the heading ceiling wrapped
                    and cost the card an extra 172px of height. */}
                <div
                  className="relative shrink-0"
                  style={{
                    height: "clamp(66px, min(12.29vw, 14.75vh), 118px)",
                    aspectRatio: WORDMARK_ASPECT,
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

              {/* ── ARROW ──
                  Centred under the heading, and the ONLY control once the
                  scroll gesture has retired itself. The chevron rotates off
                  the live `openness`, so it tracks the paper rather than the
                  click — press it mid-fold and it turns around from wherever
                  the animation had got to. */}
              <motion.button
                type="button"
                onClick={toggle}
                aria-expanded={isOpen}
                aria-controls="indicorns-unfold"
                aria-label={isOpen ? "Fold the card" : "Unfold the card"}
                className="group/arrow flex cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-[#0E0E0E]/40 transition-colors duration-300 hover:text-[#0E0E0E]/75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0E0E0E]/40"
                /* Both numbers feed the closed card's height, so both are kept
                   tight: the gap above, and the box itself, which was a 40px
                   square around a 20px chevron — 20px of it pure air. */
                style={{
                  marginTop: "clamp(0px, min(0.3vw, 0.4vh), 5px)",
                  width: "clamp(22px, min(1.7vw, 2.4vh), 28px)",
                  height: "clamp(22px, min(1.7vw, 2.4vh), 28px)",
                }}
              >
                <motion.span
                  aria-hidden
                  className="block"
                  style={{ rotate: chevronRotate }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="block h-full w-full"
                  >
                    <path
                      d="M5 8l5 5 5-5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.span>
              </motion.button>
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
