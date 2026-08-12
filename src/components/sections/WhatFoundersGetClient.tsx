"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  motion,
  AnimatePresence,
  useInView,
  type Variants,
} from "framer-motion";
import GrainOverlay from "@/components/ui/GrainOverlay";
import {
  BODY_BOLD_CLASS,
  HERO_BODY_CLASS,
  HERO_BODY_STYLE,
  SECTION_HEADING_CLASS,
  SECTION_HEADING_STYLE,
  SUBHEADING_CLASS,
  SUBHEADING_STYLE,
} from "@/styles/heroTypography";

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

const SZ = {
  // typography
  subHeading: "min(1.52vw, 2.36vh)",
  desc: "min(1.39vw, 2.15vh)",

  oGap: "min(3.42vw, 5.28vh)",
  oPadY: "min(2.31vw, 3.58vh)",

  divider: "100%",
  openedDivider: "100%",
  descBox: "55vw",
  /* Column 1 of a closed row. Tracks the TITLE's own font — which is
     level 4, min(2.78vw, 4.30vh) — rather than being a flat vw. A flat
     23vw meant the longest title ("Founder's Playbook", 301px) overflowed
     its 294px column and ate into the gap, leaving only 19px before the
     sub-heading; the overflow got worse as the viewport grew, because the
     font follows vh while the column followed vw alone.
     Poppins-medium runs ~9.7x the font-size for that string, so 9.7 x
     min(2.78vw, 4.30vh) ~= min(27vw, 41.8vh); rounded up for headroom. */
  rowTitleBox: "min(28vw, 43vh)",
  openedContentBox: "65.22vw",

  headingToDivider: "min(3.47vw, 5.37vh)",
  rowPaddingY: "min(1.04vw, 1.61vh)",
  rowInnerGap: "min(0.93vw, 1.43vh)",
  /* Gap between the closed row's columns. Widened from
     min(2.31vw, 3.58vh) — the sub-heading sat ~19px from the longest
     title. Applies twice: title|content and content|arrow. */
  rowColGap: "min(3.5vw, 5.4vh)",

  // arrows — actual SVG dimensions
  closedArrowW: "min(2.31vw, 3.58vh)",
  closedArrowH: "min(1.97vw, 3.04vh)",
  openArrowW: "min(2.66vw, 4.92vh)",
  openArrowH: "min(3.20vw, 4.92vh)",
};

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

function InViewDivider({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    margin: "0px 0px -15% 0px",
    once: false,
  });

  return (
    <motion.div
      ref={ref}
      className={`origin-left border-t border-black shrink-0 ${className ?? ""}`}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: isInView ? 1 : 0 }}
      transition={{ duration: 1.2, ease: EASE }}
      style={{ height: 0, ...style }}
    />
  );
}

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

const FALLBACK_HEADING = "How We Show Up";

const FALLBACK_ROWS: HowWeShowUpRow[] = [
  {
    title: "The Ecosystem",
    shortHeading: "Global Founder Network",
    shortDesc:
      "Access to a 15-year network; 650+ founders, corporate partners, domain experts",
    longHeading: "The Network is the Moat",
    longDesc:
      "The Titan network represents 15 years of cultivated relationships, trust, and institutional knowledge across different sectors. Being part of the Titan portfolio gives you access to that collective intelligence.",
    valueTitle: "Strategic Value",
    valueBullets: [
      "Targeted Access: Warm introductions to enterprise customers, global corporate partners, and institutional investors.",
      "Titan Expert Network (TEN): A curated cohort of seasoned operators offering 1:1 sessions on GTM strategy and technical architecture.",
      "Founder Community: A peer group of 650+ founders, often the fastest path to solving a hard operational problem.",
    ],
  },
  {
    title: "Founder's Playbook",
    shortHeading: "Operational Rigor at Scale",
    shortDesc:
      "Frameworks drawn from operators who have scaled companies to IPO",
    longHeading: "Institutional-Grade Frameworks, Founder-Speed Execution",
    longDesc:
      "We draw on the collective experience of our team and 650+ portfolio founders to shorten the learning curve, sharing the frameworks that have already taken companies from inception to public markets.",
    valueTitle: "Strategic Value",
    valueBullets: [
      "GTM Strategy: Proven approaches for category entry, pricing, and distribution.",
      "Brand & Positioning: Frameworks for building brand equity that compounds into market share.",
      "Operational Pivots: How to navigate the hard calls, from redirecting strategy to reallocating resources.",
    ],
  },
  {
    title: "Capital Strategy",
    shortHeading: "Fundraising Navigation",
    shortDesc:
      "End-to-end fundraising support from targeting to close",
    longHeading: "Support Across Every Round",
    longDesc:
      "Raising capital requires more than access; it takes the right positioning. Our team helps you walk into every institutional conversation prepared.",
    valueTitle: "Strategic Value",
    valueBullets: [
      "Precision Introductions: Targeted introductions to growth-stage funds calibrated to your sector, stage, and performance metrics.",
      "Pitch Rigor: Deep-dive sessions to stress-test assumptions and sharpen the narrative before it's in front of an investor.",
      "Momentum: Inputs on keeping your data room and metrics investor-ready, so nothing slows the round down.",
    ],
  },
  {
    title: "Talent & Hiring",
    shortHeading: "High-Signal Talent Acquisition",
    shortDesc:
      "Warm introductions to 20,000+ vetted professionals, skipping the traditional funnel",
    longHeading: "Talent Is the Lever",
    longDesc:
      "Exceptional talent is one of the hardest things to find at speed. We treat hiring as seriously as everything else we do for a portfolio company.",
    valueTitle: "Strategic Value",
    valueBullets: [
      "Titan Job Network: Direct access to a 20,000+ member community of vetted professionals.",
      "Senior Leadership Intros: Warm introductions to pre-vetted CXO and VP-level talent.",
      "Advisory Bench: Connections to board-level advisors with specific, relevant operating experience.",
    ],
  },
  {
    title: "Firefighting",
    shortHeading: "Crisis Counsel",
    shortDesc:
      "Objective counsel for the hardest moments",
    longHeading: "Present in the Hard Moments",
    longDesc:
      "Real partnership shows up most in the tough moments. We have been through enough of them to offer steady, objective counsel when the stakes are the highest.",
    valueTitle: "Strategic Value",
    valueBullets: [
      "Second Opinion: An outside perspective before sensitive board updates or high-stakes announcements.",
      "Hard Call Resolution: Guidance on co-founder disputes, restructuring and other issues that require direct and experienced resolution.",
      "Responsive Partnership: Direct access to leadership when it matters most, outside of formal board cycles.",
    ],
  },
  {
    title: "Follow-On-Capital",
    shortHeading: "Capital That Stays",
    shortDesc:
      "High-conviction capital, doubled down on our best companies",
    longHeading: "Conviction Is Compounded",
    longDesc:
      "When a Titan-backed company breaks out, we back it further, from seed through early-growth, with the same conviction that got us in.",
    valueTitle: "Strategic Value",
    valueBullets: [
      "Growth Commitment: Meaningful capital deployed at the moment the company is scaling fastest.",
      "Efficiency: Streamlined processes that leverage existing diligence and relationship, so rounds move faster.",
      "Market Signal: A high-confidence endorsement to the market that initial investors continue to believe in the trajectory.",
    ],
  },
];

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

function MobileClosedRow({ row }: { row: HowWeShowUpRow }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.45, ease: EASE } }}
      exit={{ opacity: 0, transition: { duration: 0.25, ease: EASE } }}
      className="flex w-full flex-col text-left"
    >
      <div className="flex w-full items-start justify-between gap-[16px]">
        <h3 className={`m-0 text-black ${SUBHEADING_CLASS}`}>{row.title}</h3>
        <div className="shrink-0 mt-[4px]">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 18L18 6M8 6h10v10"/>
          </svg>
        </div>
      </div>

      <h4 className={`m-0 mt-[20px] text-black ${BODY_BOLD_CLASS}`} style={HERO_BODY_STYLE}>
        {row.shortHeading}
      </h4>

      <p className={`m-0 mt-[8px] text-[#1a1a1a] ${HERO_BODY_CLASS}`} style={HERO_BODY_STYLE}>
        {row.shortDesc}
      </p>
    </motion.div>
  );
}

function ClosedRow({ row }: { row: HowWeShowUpRow }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.45, ease: EASE } }}
      exit={{ opacity: 0, transition: { duration: 0.25, ease: EASE } }}
      className="grid w-full items-center"
      style={{
        gridTemplateColumns: `${SZ.rowTitleBox} 1fr auto`,
        columnGap: SZ.rowColGap,
        paddingTop: SZ.rowPaddingY,
        paddingBottom: SZ.rowPaddingY,
        minHeight: "min(8vw, 12.4vh)",
      }}
    >
      {/* Same text as the opened card's vertical heading, so same level. */}
      <h3
        className={`m-0 whitespace-nowrap text-black ${SUBHEADING_CLASS}`}
        style={SUBHEADING_STYLE}
      >
        {row.title}
      </h3>

      <div
        className="flex flex-col"
        style={{
          gap: SZ.rowInnerGap,
        }}
      >
        <h4 className={`m-0 text-black ${BODY_BOLD_CLASS}`} style={HERO_BODY_STYLE}>
          {row.shortHeading}
        </h4>
        <p className={`m-0 text-[#0E0E0E] ${HERO_BODY_CLASS}`} style={HERO_BODY_STYLE}>
          {row.shortDesc}
        </p>
      </div>

      <div className="flex items-center justify-end self-center">
        <HoverArrow />
      </div>
    </motion.div>
  );
}

function OpenedRow({
  row,
  onBack,
}: {
  row: HowWeShowUpRow;
  onBack: () => void;
}) {
  return (
    <>
      {/* ─── DESKTOP LAYOUT ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: { duration: 0.35, ease: EASE },
        }}
        exit={{ opacity: 0, transition: { duration: 0.3, ease: EASE } }}
        className="hidden md:grid w-full"
        style={{
          gridTemplateColumns: "auto 1fr",
        }}
      >
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
            className={`cursor-pointer border-0 bg-transparent p-0 text-black underline underline-offset-4 transition-opacity hover:opacity-60 ${HERO_BODY_CLASS}`}
            style={{ ...HERO_BODY_STYLE, textAlign: "center" }}
          >
            Back
          </button>

          <div className="flex items-center justify-center">
            {/* The level-4 reference. Every other subheading on the site is
                sized from this one, so it must stay on the token. */}
            <span
              className={`whitespace-nowrap text-center text-black ${SUBHEADING_CLASS}`}
              style={{
                ...SUBHEADING_STYLE,
                writingMode: "vertical-rl",
                rotate: "180deg",
              }}
            >
              {row.title}
            </span>
          </div>

          <motion.div
            aria-hidden
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0, transition: { duration: 0.3, ease: EASE } }}
            transition={{ duration: 1.0, ease: EASE, delay: 0.2 }}
            className="absolute right-0 top-0 h-full border-r border-black shrink-0"
            style={{ width: 0, transformOrigin: "top" }}
          />
        </div>

        <div style={{ paddingLeft: SZ.oGap }}>
          <div
            className="flex w-full flex-col"
            style={{ gap: SZ.oGap }}
          >
            <h4 className={`m-0 text-[#0E0E0E] ${BODY_BOLD_CLASS}`} style={HERO_BODY_STYLE}>
              {row.longHeading}
            </h4>

            <p className={`m-0 text-[#323232] ${HERO_BODY_CLASS}`} style={HERO_BODY_STYLE}>
              {row.longDesc}
            </p>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0, transition: { duration: 0.3, ease: EASE } }}
              transition={{ duration: 1.0, ease: EASE, delay: 0.2 }}
              className="origin-left border-t border-black shrink-0"
              style={{
                width: "100%",
                height: 0,
                marginTop: SZ.rowInnerGap,
                marginBottom: SZ.rowInnerGap,
              }}
            />

            <h5 className={`m-0 text-left text-black ${BODY_BOLD_CLASS}`} style={HERO_BODY_STYLE}>
              {row.valueTitle}
            </h5>

            <ul
              className="m-0 flex list-none flex-col p-0"
              style={{ gap: SZ.rowInnerGap }}
            >
              {row.valueBullets.map((bullet, i) => (
                <li
                  key={i}
                  className={`relative text-[#323232] ${HERO_BODY_CLASS}`}
                  style={{ ...HERO_BODY_STYLE, paddingLeft: SZ.rowInnerGap }}
                >
                  <span className="absolute left-0 top-0" style={HERO_BODY_STYLE}>
                    •
                  </span>
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* ─── MOBILE LAYOUT ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: { duration: 0.35, ease: EASE },
        }}
        exit={{ opacity: 0, transition: { duration: 0.3, ease: EASE } }}
        className="flex md:hidden w-full flex-col text-left"
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onBack();
          }}
          className={`self-start cursor-pointer border-0 bg-transparent p-0 tracking-[0.1em] text-black uppercase underline underline-offset-4 transition-opacity hover:opacity-60 ${HERO_BODY_CLASS}`}
          style={HERO_BODY_STYLE}
        >
          Back
        </button>

        <h2 className={`m-0 mt-[20px] mb-[16px] text-black ${SUBHEADING_CLASS}`}>
          {row.title}
        </h2>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          exit={{ scaleX: 0, transition: { duration: 0.3, ease: EASE } }}
          transition={{ duration: 1.0, ease: EASE, delay: 0.2 }}
          className="origin-left border-t border-black shrink-0 w-full h-0"
        />

        <div className="flex flex-col py-[16px]">
          <h4
            className={`m-0 text-black ${BODY_BOLD_CLASS}`}
            style={{ ...HERO_BODY_STYLE, letterSpacing: "0.5px" }}
          >
            {row.longHeading}
          </h4>

          <p className={`m-0 mt-[12px] text-[#1a1a1a] ${HERO_BODY_CLASS}`} style={HERO_BODY_STYLE}>
            {row.longDesc}
          </p>
        </div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          exit={{ scaleX: 0, transition: { duration: 0.3, ease: EASE } }}
          transition={{ duration: 1.0, ease: EASE, delay: 0.3 }}
          className="origin-left border-t border-black shrink-0 w-full h-0 mt-[4px] mb-[20px]"
        />

        <ul className="m-0 flex list-none flex-col p-0 gap-[16px]">
          {row.valueBullets.map((bullet, i) => (
            <li
              key={i}
              className={`relative text-[#1a1a1a] ${HERO_BODY_CLASS}`}
              style={{ ...HERO_BODY_STYLE, paddingLeft: "24px" }}
            >
              <span className="absolute left-0 top-[2px] text-[20px] leading-[1]">
                •
              </span>
              {bullet}
            </li>
          ))}
        </ul>
      </motion.div>
    </>
  );
}

function MobileRow({
  row,
  onOpen,
  showDivider = true,
}: {
  row: HowWeShowUpRow;
  onOpen: () => void;
  showDivider?: boolean;
}) {
  return (
    <div className="w-full">
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
        className="w-full cursor-pointer py-[24px]"
      >
        <MobileClosedRow row={row} />
      </div>
      {showDivider && <InViewDivider style={{ width: "100%" }} />}
    </div>
  );
}

function Row({
  row,
  onOpen,
  showDivider = true,
}: {
  row: HowWeShowUpRow;
  onOpen: () => void;
  showDivider?: boolean;
}) {
  return (
    <div className="group relative w-full">
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
      {showDivider && <InViewDivider style={{ width: SZ.divider }} />}
    </div>
  );
}
function FullPageCard({
  row,
  onBack,
}: {
  row: HowWeShowUpRow;
  onBack: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBack]);

  const modalContent = (
    <motion.div
      key="fullpage"
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
      className="fixed bottom-0 left-0 right-0 flex items-center justify-center max-md:!block max-md:w-screen max-md:overflow-y-auto max-md:overscroll-none max-md:!pt-[32px] max-md:!px-[24px] max-md:!pb-[40px] max-md:!bg-[#FBF7F0] max-md:!backdrop-filter-none"
      style={{
        top: "var(--nav-height, 64px)", 
        zIndex: 999999,
        transformOrigin: "center",
        background: "#FBF7F0",
        backdropFilter: "blur(32px) saturate(1.4)",
        WebkitBackdropFilter: "blur(32px) saturate(1.4)",
        boxShadow: "0 8px 40px rgba(0, 0, 0, 0.08)",
        padding: "var(--section-px-wide)",
      }}
      role="dialog"
      aria-modal="true"
    >
      <GrainOverlay opacity={0.22} zIndex={1} />
      <div className="relative z-10 w-full max-w-7xl mx-auto max-h-full overflow-y-auto scrollbar-hide">
        <OpenedRow row={row} onBack={onBack} />
      </div>
    </motion.div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}

export default function WhatFoundersGetClient({
  data,
}: {
  data?: WhatFoundersGetData | null;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  // 1. Create a persistent reference to our timer so we can cancel it if timelines cross
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const heading = data?.heading || FALLBACK_HEADING;
  const rows = data?.rows?.length ? data.rows : FALLBACK_ROWS;

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (openIndex === null) {
      // CLOSING: Wait exactly 300ms (matching the Framer Motion exit duration) before unlocking
      timerRef.current = setTimeout(() => {
        document.body.style.removeProperty("overflow");
        document.body.style.removeProperty("padding-right");
        document.body.style.removeProperty("background-color");
      }, 300);
    } else {
      // OPENING: Instantly clear any pending unlock timers so we don't accidentally unlock while open
      if (timerRef.current) clearTimeout(timerRef.current);

      // Calculate the exact scrollbar width to prevent the horizontal layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Apply locks *only* to the body. Avoid documentElement (html) to prevent Safari repaints.
      document.body.style.setProperty("overflow", "hidden", "important");
      document.body.style.setProperty("padding-right", `${scrollbarWidth}px`, "important");
      document.body.style.setProperty("background-color", "#FBF7F0", "important");
    }

    // Cleanup: clear the timer if the entire component unmounts
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [openIndex]);

  return (
    <section
      className="relative w-full overflow-hidden bg-[#FBF7F0]"
      style={{
        paddingTop: "var(--section-py)",
        paddingBottom: "var(--section-py)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <GrainOverlay opacity={0.22} zIndex={1} />
      <motion.div
        className="relative z-10 mx-auto flex w-full flex-col items-center"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.15 }}
      >
        <h2
          className={`m-0 text-center text-black ${SECTION_HEADING_CLASS}`}
          style={SECTION_HEADING_STYLE}
        >
          {heading}
        </h2>

        <div className="max-md:hidden" style={{ height: SZ.headingToDivider }} />

        <div className="hidden max-md:block w-full h-0 border-t border-black shrink-0 mt-[32px]" />

        <div className="hidden md:flex w-full flex-col items-center">
          {rows.map((row, i) => (
            <Row
              key={row.title}
              row={row}
              onOpen={() => setOpenIndex(i)}
              showDivider={i !== rows.length - 1} 
            />
          ))}
        </div>

        <div className="flex md:hidden w-full flex-col">
          {rows.map((row, i) => (
            <MobileRow
              key={row.title}
              row={row}
              onOpen={() => setOpenIndex(i)}
              showDivider={i !== rows.length - 1} 
            />
          ))}
        </div>
      </motion.div>

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