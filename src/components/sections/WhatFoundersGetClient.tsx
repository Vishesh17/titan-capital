"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  type Variants,
} from "framer-motion";

/* ─────────────────────────────────────────────────────────
   Types — shared with the server wrapper (WhatFoundersGet.tsx).
   ───────────────────────────────────────────────────────── */
export interface HowWeShowUpRow {
  title: string;
  shortHeading: string;
  shortDesc: string;
  longHeading: string;
  longDesc: string;
  valueTitle: string;
  valueBullets: string[];
}

export interface WhatFoundersGetData {
  heading?: string;
  rows?: HowWeShowUpRow[];
}

/* ─────────────────────────────────────────────────────────
   Sizing tokens — every value is derived from the 1728×1117
   MacBook 14" Figma reference via `min(Xvw, Yvh)` so the
   design looks identical (proportionally) at every laptop /
   desktop viewport in public/multiview.html:
       Xvw = px_at_ref / 1728 × 100
       Yvh = px_at_ref / 1117 × 100
   min(vw, vh) picks whichever axis is tighter so nothing
   overflows on unusually tall or unusually wide viewports.
   ───────────────────────────────────────────────────────── */
const SZ = {
  // typography
  heading: "min(4.51vw, 6.98vh)",       // 78 px @ ref
  rowTitle: "min(3.70vw, 5.73vh)",      // 64 px @ ref
  subHeading: "min(1.85vw, 2.86vh)",    // 32 px @ ref
  desc: "min(1.62vw, 2.51vh)",          // 28 px @ ref
  rotTitle: "min(3.48vw, 5.37vh)",      // 72 px @ ref (opened, rotated — big spine)
  backLink: "min(1.51vw, 2.33vh)",      // 26 px @ ref
  // Opened-card typography — pushed as large as still fits the shortest
  // laptop height (see BgTransition sizing notes). The closed rows keep
  // their own smaller subHeading/desc.
  oSubHeading: "min(2.20vw, 3.40vh)",   // 38 px @ ref
  oDesc: "min(1.91vw, 2.96vh)",         // 33 px @ ref
  oGap: "min(3.42vw, 5.28vh)",          // 59 px @ ref — opened-card block gap
  oPadY: "min(2.31vw, 3.58vh)",         // 40 px @ ref — opened-card top/bottom (modal, not a side gutter)
  // container widths (width-only — layout dims)
  /* Both dividers span the FULL row width now — so on the closed
     list they extend all the way past the arrow, and on the
     opened card they reach the right section padding. The old
     fixed vw values (78.24 / 68.17) were narrower than the
     section content area, leaving a visible gap on the right. */
  divider: "100%",
  openedDivider: "100%",
  descBox: "36.86vw",                   // 637 px @ ref
  rowTitleBox: "22.57vw",               // 390 px @ ref
  openedContentBox: "65.22vw",          // 1127 px @ ref
  // spacing
  // NOTE: horizontal/vertical section padding now come from the
  // sitewide CSS vars `--section-px-wide` and `--section-py` in
  // globals.css. No per-file paddingX/paddingY tokens — the section
  // wrapper and the FullPageCard both consume the vars directly so
  // every page section gutters the same amount at every viewport.
  headingToDivider: "min(3.47vw, 5.37vh)", // 60 px @ ref
  rowPaddingY: "min(2.31vw, 3.58vh)",   // 40 px @ ref  — closed-row body padding
  rowInnerGap: "min(1.62vw, 2.51vh)",   // 28 px @ ref  — small internal gap (around HR margins)
  openedGap: "min(3.47vw, 5.37vh)",     // 60 px @ ref  — main gap between opened-card blocks
                                        //                (heading / desc / HR / Strategic Value / bullets).
                                        // Larger than the closed-row gap because the opened card
                                        // takes over the viewport and needs to fill vertical space.
  // arrows — actual SVG dimensions
  closedArrowW: "min(3.24vw, 4.21vh)",  // 56 px wide
  closedArrowH: "min(2.72vw, 4.21vh)",  // 47 px tall
  openArrowW: "min(2.66vw, 4.92vh)",    // 46 px wide
  openArrowH: "min(3.20vw, 4.92vh)",    // 55 px tall (after rotation)
};

/* Easing curve — matches the smooth, weighty feel of the
   madeinmay.studio/approach entrance animations. */
const EASE = [0.22, 1, 0.36, 1] as const;

/* ─────────────────────────────────────────────────────────
   Animation variants
   ───────────────────────────────────────────────────────── */
const sectionVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

/* ─────────────────────────────────────────────────────────
   In-view divider — the horizontal 1 px line commits to a
   full 0 → 100 % draw animation as soon as it enters the
   viewport (regardless of scroll speed), and reverses back
   to 0 % when it leaves the viewport on scroll-up. Not tied
   to scroll position — a discrete enter / leave trigger, so
   each line finishes its animation cleanly even if you fly
   past it, and cleanly retracts if you scroll back above it.
   ───────────────────────────────────────────────────────── */
function InViewDivider({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    // Element becomes "in view" only once its top has moved 15 %
    // above the bottom of the viewport — avoids a twitchy trigger
    // right at the fold. once: false so it reverses on scroll-up.
    margin: "0px 0px -15% 0px",
    once: false,
  });

  return (
    <motion.div
      ref={ref}
      className={`origin-left bg-black ${className ?? ""}`}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: isInView ? 1 : 0 }}
      transition={{ duration: 1.2, ease: EASE }}
      style={style}
    />
  );
}

/* ─────────────────────────────────────────────────────────
   Row-hover rotating arrow — the closed → arrow slowly and
   smoothly rotates to −35.229° (the ↗ orientation) whenever
   the parent row is hovered. Uses CSS group-hover + a long
   1 s cubic-bezier transition so the rotation reads as a
   deliberate, premium reveal rather than a snap.
   ───────────────────────────────────────────────────────── */
function HoverArrow() {
  return (
    <div
      className="inline-flex items-center justify-center transition-transform ease-[cubic-bezier(0.22,1,0.36,1)] duration-1000 group-hover:rotate-[-35.229deg]"
      style={{ width: SZ.closedArrowW, height: SZ.closedArrowH }}
    >
      <ClosedArrow style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Fallback content — CMS overrides at runtime; this just
   ensures the design renders when the doc is empty. Text
   for "The Ecosystem" mirrors the Figma exactly; the other
   5 rows are lightly-filled placeholders in the same tone
   that editors can rewrite in Studio.
   ───────────────────────────────────────────────────────── */
const FALLBACK_HEADING = "How We Show Up";

const FALLBACK_ROWS: HowWeShowUpRow[] = [
  {
    title: "The Ecosystem",
    shortHeading: "Global Founder Network",
    shortDesc:
      "Direct access to 650+ founders, global corporate partners, and domain experts to unlock immediate strategic value.",
    longHeading: "The Network is the Moat.",
    longDesc:
      "The Titan network represents 15 years of cultivated relationships, trust, and institutional knowledge across global markets. Integration into the Titan portfolio provides access to this collective intelligence.",
    valueTitle: "Strategic Value",
    valueBullets: [
      "Warm introductions to potential customers, strategic partners, and later stage investors.",
      "Titan Expert Network (TEN): a curated group of seasoned operators who offer 1:1 expert sessions, from GTM strategy to technical architecture",
      "500+ founder community: An active group with 500+ founders from across the Titan portfolio. The fastest way to find someone who's already solved your problem.",
    ],
  },
  {
    title: "The Founder's Playbook",
    shortHeading: "Operational Rigor at Scale",
    shortDesc:
      "Utilization of institutional-grade GTM, financial, and equity frameworks built by operators who have scaled to IPO.",
    longHeading: "Institutional-Grade Frameworks, Founder-Speed Execution.",
    longDesc:
      "Fifteen years of scaling companies have crystallised into playbooks covering every stage — GTM motions, pricing, hiring architecture, board governance. Portfolio companies operate with these battle-tested frameworks from day one.",
    valueTitle: "What You Get",
    valueBullets: [
      "GTM playbooks broken down by stage, sector, and motion (PLG, sales-led, hybrid).",
      "Financial models, board decks, and equity plan templates used by companies through IPO.",
      "Direct access to operators who authored the frameworks — for 1:1 tactical sessions.",
    ],
  },
  {
    title: "Capital Strategy",
    shortHeading: "Sophisticated Fundraising Navigation",
    shortDesc:
      "End-to-end support for successive funding rounds, including investor targeting and strategic term sheet guidance.",
    longHeading: "The Right Capital, on the Right Terms.",
    longDesc:
      "Every subsequent round is a negotiation with long-term consequences. We prepare, position, and connect founders with the investor best-suited to the next chapter — and structure terms that protect the company's optionality.",
    valueTitle: "What You Get",
    valueBullets: [
      "Warm introductions to Series A through growth-stage funds based on stage, sector, and thesis fit.",
      "Pitch reviews, narrative work, and dry-run sessions before the real meetings.",
      "Term sheet and SHA reviews so short-term optics don't create long-term problems.",
    ],
  },
  {
    title: "Talent & Hiring",
    shortHeading: "High-Signal Talent Acquisition",
    shortDesc:
      "Warm, direct introductions to 20,000+ vetted industry professionals, bypassing traditional recruitment channels.",
    longHeading: "The Hires That Move the Needle.",
    longDesc:
      "Talent is the difference between scale and stall. Portfolio companies close senior hires — CTOs, VPs of Sales, first growth marketers — through a network built over fifteen years of operator relationships.",
    valueTitle: "What You Get",
    valueBullets: [
      "Curated candidate referrals from 20,000+ vetted senior operators.",
      "Introductions to specialist recruiters for stage- and function-specific searches.",
      "Hiring playbooks, calibration calls, and interview design help from operators who have hired at scale.",
    ],
  },
  {
    title: "Firefighting",
    shortHeading: "Boardroom-Tested Crisis Leadership",
    shortDesc:
      "Objective, boardroom-tested counsel for moments of adversity, from regulatory challenges to co-founder transitions.",
    longHeading: "When It Breaks, We Pick Up the Phone.",
    longDesc:
      "The worst weeks are why partners exist. We've navigated regulatory shocks, co-founder disputes, down rounds, and public crises across three cycles — and we're reachable when it matters.",
    valueTitle: "What You Get",
    valueBullets: [
      "24/7 partner access during crisis moments — fundraising stalls, key departures, customer escalations.",
      "Introductions to the right specialists: legal, PR, restructuring, executive coaching.",
      "Hard-call conversations: pivot vs persevere, fire vs coach, raise vs cut.",
    ],
  },
  {
    title: "Follow-On-Capital",
    shortHeading: "Growth Capital Lifecycle",
    shortDesc:
      "High-conviction capital deployment through a dedicated Winners Fund across the breakout company's growth lifecycle.",
    longHeading: "We Back Our Own — Through Every Round.",
    longDesc:
      "When a Titan-backed company is ready to raise more, we lead with conviction and follow with capital. Our follow-on rate is among the highest in Indian early-stage venture — a signal to future investors, and a promise to founders.",
    valueTitle: "What You Get",
    valueBullets: [
      "Pro-rata participation in subsequent rounds where the company merits it.",
      "Bridge support during off-cycle moments when timing matters more than valuation.",
      "Co-investor introductions when the round needs to be bigger than our cheque.",
    ],
  },
];

/* ─────────────────────────────────────────────────────────
   Arrow SVG — copied verbatim from the Figma export. Points
   right (→) on default rows; HoverArrow rotates it to the ↗
   orientation on row hover.
   ───────────────────────────────────────────────────────── */
function ClosedArrow({ style }: { style?: React.CSSProperties }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 56 47"
      fill="none"
      style={style}
    >
      <path
        d="M33.1363 45.589L55.3594 23.2503L33.1363 0.911532C32.9356 0.647969 32.6806 0.430604 32.3885 0.274155C32.0965 0.117707 31.7743 0.0258257 31.4437 0.00473192C31.1131 -0.0163619 30.7818 0.0338253 30.4723 0.151894C30.1628 0.269963 29.8822 0.453157 29.6496 0.689076C29.4171 0.924995 29.2379 1.20813 29.1243 1.51931C29.0106 1.8305 28.9652 2.16246 28.991 2.49273C29.0168 2.82301 29.1133 3.14388 29.2739 3.43363C29.4345 3.72338 29.6555 3.97524 29.9219 4.17216L46.5488 20.9378L2.31063 20.9378C1.69732 20.9378 1.10913 21.1814 0.675453 21.6151C0.241776 22.0488 -0.00186539 22.637 -0.00186539 23.2503C-0.00186539 23.8636 0.241776 24.4518 0.675453 24.8855C1.10913 25.3191 1.69732 25.5628 2.31063 25.5628L46.5488 25.5628L29.9219 42.3284C29.4895 42.7638 29.2478 43.3532 29.25 43.9669C29.2521 44.5805 29.498 45.1682 29.9334 45.6006C30.3689 46.033 30.9583 46.2747 31.5719 46.2725C32.1856 46.2703 32.7732 46.0245 33.2056 45.589H33.1363Z"
        fill="#000"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
   Mobile closed row — stacked: title + arrow, short heading,
   short description. Separated by dividers.
   ───────────────────────────────────────────────────────── */
function MobileClosedRow({ row }: { row: HowWeShowUpRow }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.45, ease: EASE } }}
      exit={{ opacity: 0, transition: { duration: 0.25, ease: EASE } }}
      className="flex w-full flex-col"
      style={{ paddingTop: "16px", paddingBottom: "16px" }}
    >
      {/* Title + arrow row */}
      <div className="flex w-full items-start justify-between" style={{ gap: "12px" }}>
        <h3
          className="m-0 font-['Poppins',_sans-serif] font-normal capitalize text-black"
          style={{ fontSize: "clamp(22px, 6vw, 32px)", lineHeight: "115%" }}
        >
          {row.title}
        </h3>
        <div className="shrink-0 pt-1">
          <ClosedArrow style={{ width: "24px", height: "20px" }} />
        </div>
      </div>

      {/* Short heading */}
      <h4
        className="m-0 mt-2 font-['Poppins',_sans-serif] font-semibold text-black"
        style={{ fontSize: "clamp(13px, 3.5vw, 16px)", lineHeight: "140%" }}
      >
        {row.shortHeading}
      </h4>

      {/* Short description */}
      <p
        className="m-0 mt-1 font-['Poppins',_sans-serif] font-normal text-[#323232]"
        style={{ fontSize: "clamp(12px, 3.2vw, 14px)", lineHeight: "150%" }}
      >
        {row.shortDesc}
      </p>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   Closed-state row body — 3-column layout: [title | short
   heading + short desc | arrow]. Clicking anywhere expands.
   ───────────────────────────────────────────────────────── */
function ClosedRow({ row }: { row: HowWeShowUpRow }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.45, ease: EASE } }}
      exit={{ opacity: 0, transition: { duration: 0.25, ease: EASE } }}
      className="grid w-full items-start"
      style={{
        gridTemplateColumns: `${SZ.rowTitleBox} 1fr auto`,
        columnGap: SZ.openedGap,
        paddingTop: SZ.rowPaddingY,
        paddingBottom: SZ.rowPaddingY,
        transform: "scale(0.9)",
        transformOrigin: "left center",
      }}
    >
      {/* Row title */}
      <h3
        className="m-0 font-['Poppins',_sans-serif] font-normal capitalize text-black"
        style={{
          fontSize: SZ.rowTitle,
          lineHeight: "120%",
        }}
      >
        {row.title}
      </h3>

      {/* Short heading + short description */}
      <div
        className="flex flex-col"
        style={{
          gap: SZ.rowInnerGap,
          maxWidth: SZ.descBox,
        }}
      >
        <h4
          className="m-0 font-['Poppins',_sans-serif] font-medium text-black"
          style={{
            fontSize: SZ.subHeading,
            lineHeight: "150%",
          }}
        >
          {row.shortHeading}
        </h4>
        <p
          className="m-0 font-['Poppins',_sans-serif] font-normal text-[#0E0E0E]"
          style={{
            fontSize: SZ.desc,
            lineHeight: "150%",
          }}
        >
          {row.shortDesc}
        </p>
      </div>

      {/* Arrow — hover on the arrow itself smoothly morphs it
          from → to ↗ via HoverArrow (rotates + crossfades). */}
      <div className="flex items-center justify-end self-center">
        <HoverArrow />
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   Opened-state row body — matches the Figma reference:
   [Back + rotated title | vertical rule | long heading +
   long desc + horizontal divider + value title + bullets].
   The rotated title reads top-to-bottom (tilt head right)
   via writing-mode: vertical-rl alone. Clicking the row
   OR the Back button collapses the row.
   ───────────────────────────────────────────────────────── */
function OpenedRow({
  row,
  onBack,
}: {
  row: HowWeShowUpRow;
  onBack: () => void;
}) {
  /* Layered stagger reveal — each element has an explicit `delay`
     so the sequence reads intentionally rather than everything
     landing at once:
       0.15  vertical rule starts drawing top→bottom (1.2 s)
       0.30  Back fades in
       0.40  rotated title writes in from the right
       0.55  right heading (longHeading) fades up
       0.70  right description fades up
       0.85  horizontal divider draws left→right
       1.00  Strategic Value heading fades up
       1.15  bullets stagger in one after another (+0.10s each)
     Total sequence lands by ~1.65 s. */
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: { duration: 0.35, ease: EASE },
      }}
      exit={{ opacity: 0, transition: { duration: 0.3, ease: EASE } }}
      className="grid w-full"
      style={{
        /* Left column shrinks to hug the rotated heading (`auto`) instead
           of a fixed 22.57vw box — otherwise ~260 px of slack piled up on
           the far left. Now the heading sits right at the left gutter and
           the whole block is symmetric: gutter → heading … content →
           gutter, equal margins on both sides. */
        gridTemplateColumns: "auto 1fr",
        /* No top/bottom padding here — the FullPageCard
           container already supplies var(--section-py) and
           its `items-center` flex centers this vertically. */
      }}
    >
     {/* LEFT column — three positioned pieces:
           1. Back button — top-left in normal flow.
           2. Rotated title — absolutely positioned near the
              vertical rule (NOT the far-left edge of the
              column) so it reads as a spine label right next
              to the divider. Vertically centered.
           3. Vertical rule — right edge, animates scaleY
              top→bottom on mount per the site rule that all
              lines animate when their section opens. */}
      {/* ▼ CHANGED: Now uses a grid to pin the Back button to the top and center the title below it */}
      <div
        className="relative grid grid-rows-[auto_1fr]"
        style={{
          paddingRight: SZ.oGap,
        }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onBack();
          }}
          className="cursor-pointer border-0 bg-transparent p-0 font-['Poppins',_sans-serif] font-normal text-black underline underline-offset-4 transition-opacity hover:opacity-60"
          style={{
            fontSize: SZ.backLink,
            lineHeight: "150%",
            textAlign: "center", // Ensures it stays centered in its grid cell
          }}
        >
          Back
        </button>

        {/* Wrapper to center the vertical text in the remaining space */}
        <div className="flex items-center justify-center">
          <span
            className="whitespace-nowrap text-center font-['Poppins',_sans-serif] font-normal capitalize text-black"
            style={{
              fontSize: SZ.rotTitle,
              lineHeight: "120%",
              writingMode: "vertical-rl",
              rotate: "180deg",
            }}
          >
            {row.title}
          </span>
        </div>

        {/* Full-height vertical rule on the right edge of the
            left column. Animates scaleY 0 → 1 (transformOrigin
            top) on mount so it visually DRAWS from top to bottom
            as the card opens — matches the site-wide rule that
            all vertical / horizontal lines animate on entrance. */}
        <motion.div
          aria-hidden
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.2, ease: EASE, delay: 0.2 }}
          className="absolute right-0 top-0 h-full bg-black"
          style={{ width: "1px", transformOrigin: "top" }}
        />
      </div>

      {/* RIGHT column — main content. Extra left padding so it
          isn't flush against the vertical rule. */}
      <div style={{ paddingLeft: SZ.oGap }}>

      {/* Right column — each block has an explicit `delay` so
          the layered stagger sequence lands in a predictable
          order (see comment on the outer motion.div).

          Width: takes the FULL remaining space in the grid row
          (no `maxWidth` cap). Per Figma, content should stretch
          all the way to the right section padding — no blank
          gutter on the right. */}
      <div
        className="flex w-full flex-col"
        style={{ gap: SZ.oGap }}
      >
        <h4
          className="m-0 font-['Poppins',_sans-serif] font-medium text-[#0E0E0E]"
          style={{
            fontSize: SZ.oSubHeading,
            lineHeight: "150%",
          }}
        >
          {row.longHeading}
        </h4>

        <p
          className="m-0 font-['Poppins',_sans-serif] font-normal text-[#323232]"
          style={{
            fontSize: SZ.oDesc,
            lineHeight: "150%",
          }}
        >
          {row.longDesc}
        </p>

        {/* Divider under the description — draws left→right per
            the site rule that every line animates on reveal.
            Spans the FULL right-column width so it reaches all
            the way to the section padding (Figma reference). */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.85 }}
          className="origin-left bg-black"
          style={{
            width: "100%",
            height: "1px",
            marginTop: SZ.rowInnerGap,
            marginBottom: SZ.rowInnerGap,
          }}
        />

        <h5
          className="m-0 text-left font-['Poppins',_sans-serif] font-medium text-black"
          style={{
            fontSize: SZ.oSubHeading,
            lineHeight: "110%",
          }}
        >
          {row.valueTitle}
        </h5>

        <ul
          className="m-0 flex list-none flex-col p-0"
          style={{ gap: SZ.rowInnerGap }}
        >
          {row.valueBullets.map((bullet, i) => (
            <li
              key={i}
              className="relative font-['Poppins',_sans-serif] font-normal text-[#323232]"
              style={{
                fontSize: SZ.oDesc,
                lineHeight: "150%",
                paddingLeft: SZ.rowInnerGap,
              }}
            >
              <span
                className="absolute left-0 top-0"
                style={{ fontSize: SZ.oDesc, lineHeight: "150%" }}
              >
                •
              </span>
              {bullet}
            </li>
          ))}
        </ul>
      </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   Mobile row wrapper — divider on top + mobile closed body.
   ───────────────────────────────────────────────────────── */
function MobileRow({
  row,
  onOpen,
}: {
  row: HowWeShowUpRow;
  onOpen: () => void;
}) {
  return (
    <div className="w-full">
      <div className="h-[1px] w-full bg-black" />
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen();
          }
        }}
        className="w-full cursor-pointer"
      >
        <MobileClosedRow row={row} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Row wrapper — divider on top + closed body. Click opens
   the FullPageCard overlay; this row itself doesn't morph.
   ───────────────────────────────────────────────────────── */
function Row({
  row,
  onOpen,
}: {
  row: HowWeShowUpRow;
  onOpen: () => void;
}) {
  return (
    <div className="group relative w-full">
      <InViewDivider style={{ width: SZ.divider, height: "1px" }} />
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen();
          }
        }}
        className="w-full cursor-pointer"
      >
        <ClosedRow row={row} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   FullPageCard — the opened state.

   Renders as a `position: fixed; inset: 0` overlay so it
   covers the entire viewport (not just the section it lives
   in). Body scroll is LOCKED while it's mounted — per the
   design: "after the card is open, the page is just the
   card's content, and it is not scrollable".

   Enter animation: opacity + slide-up + slight scale, so it
   reads as the row expanding upward into full view.
   Exit: reverse. Escape key also closes.
   ───────────────────────────────────────────────────────── */
function FullPageCard({
  row,
  onBack,
}: {
  row: HowWeShowUpRow;
  onBack: () => void;
}) {
  /* Lock body scroll while the overlay is up. Restore the
     previous value on unmount so we don't clobber other code
     that might have set overflow. */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /* Escape key closes — standard modal behavior. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBack]);

  return (
    <motion.div
      key="fullpage"
      /* Expands into view (madeinmay.studio/approach feel): the card
         grows up from a slightly smaller, lower, translucent state so it
         reads as the row opening OUT — not a modal popping in. The layered
         stagger inside OpenedRow (vertical rule → Back → title → heading →
         desc → divider → Strategic Value → bullets) carries the reveal. */
      initial={{ opacity: 0, scale: 0.94, y: 24 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: 0.55, ease: EASE },
      }}
      exit={{
        opacity: 0,
        scale: 0.97,
        y: 12,
        transition: { duration: 0.3, ease: EASE },
      }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        transformOrigin: "center",
        background: "#FBF7F0",
        backdropFilter: "blur(32px) saturate(1.4)",
        WebkitBackdropFilter: "blur(32px) saturate(1.4)",
        boxShadow: "0 8px 40px rgba(0, 0, 0, 0.08)",

        /* Left/right gutters stay on the sitewide token so the card
           lines up with every other section. Top/bottom is trimmed
           (this is a full-screen modal, not an in-flow section) so the
           larger content fills the height instead of floating. */
        paddingTop: SZ.oPadY,
        paddingBottom: SZ.oPadY,
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full">
        <OpenedRow row={row} onBack={onBack} />
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main component.
   ───────────────────────────────────────────────────────── */
export default function WhatFoundersGetClient({
  data,
}: {
  data?: WhatFoundersGetData | null;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const heading = data?.heading || FALLBACK_HEADING;
  const rows = data?.rows?.length ? data.rows : FALLBACK_ROWS;

  return (
    <section
      className="relative w-full overflow-hidden bg-[#FBF7F0]"
      style={{
        /* Sitewide consistent padding — same tokens every section
           uses. No per-section clamp values. */
        paddingTop: "var(--section-py)",
        paddingBottom: "var(--section-py)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <motion.div
        className="mx-auto flex w-full flex-col items-center"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        {/* Section heading — static (no type-on animation) */}
        <h2
          className="m-0 text-center font-['Poppins',_sans-serif] font-normal text-black max-md:!text-[32px] max-md:!leading-[120%]"
          style={{
            fontSize: SZ.heading,
            lineHeight: "120%",
          }}
        >
          {heading}
        </h2>

        {/* Space between heading and the first divider */}
        <div style={{ height: SZ.headingToDivider }} />

        {/* Rows — Desktop (hidden on mobile) */}
        <div className="hidden md:flex w-full flex-col items-center">
          {rows.map((row, i) => (
            <Row
              key={row.title}
              row={row}
              onOpen={() => setOpenIndex(i)}
            />
          ))}
          <InViewDivider style={{ width: SZ.divider, height: "1px" }} />
        </div>

        {/* Rows — Mobile (hidden on desktop) */}
        <div className="flex md:hidden w-full flex-col">
          {rows.map((row, i) => (
            <MobileRow
              key={row.title}
              row={row}
              onOpen={() => setOpenIndex(i)}
            />
          ))}
          <div className="h-[1px] w-full bg-black" />
        </div>
      </motion.div>

      {/* ── FULL-PAGE OPENED CARD ── overlay that takes over
          the viewport. Rendered OUTSIDE the section's inner
          motion.div so its `position: fixed` isn't affected by
          any transform/filter on ancestors (fixed positioning
          gets clipped inside transformed parents). */}
      <AnimatePresence>
        {openIndex !== null && (
          <FullPageCard
            key="fullpage-card"
            row={rows[openIndex]}
            onBack={() => setOpenIndex(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
