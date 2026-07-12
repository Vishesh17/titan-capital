"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────────────────
   Types — shared shape that the server wrapper / Sanity
   query will populate later. Component is fully driven by
   `categories` so swapping the data source is a one-line
   change.
   ───────────────────────────────────────────────────────── */
export interface BeyondCategory {
  /** Two-digit prefix shown before the title — "01", "02"… */
  number: string;
  /** Short label that appears on the tab AND as the heading inside
   *  the blue box. e.g. "Network", "Hiring". */
  title: string;
  /** One-line tagline at the top of the blue box. */
  subtitle: string;
  /** Body paragraphs inside the blue box. */
  paragraphs: string[];
  /** "What you get" bullet list under the blue box. */
  whatYouGet: string[];
}

export interface BeyondTheChequeData {
  categories?: BeyondCategory[];
}

/* ─────────────────────────────────────────────────────────
   Fallback content — used until Sanity is wired up. Edit
   here freely; once the schema lands these values become
   the "empty CMS" defaults.
   ───────────────────────────────────────────────────────── */
const FALLBACK_CATEGORIES: BeyondCategory[] = [
  {
    number: "01",
    title: "Network",
    subtitle: "The network is the moat.",
    paragraphs: [
      "The Titan network is 15 years of relationships, trust, and goodwill built with founders, CXOs, institutional investors, and domain experts across India and globally. When you join Titan, you join all of it.",
    ],
    whatYouGet: [
      "Warm introductions to potential customers, strategic partners, and later stage investors.",
      "500+ founder community: An active group with 500+ founders from across the Titan portfolio. The fastest way to find someone who's already solved your problem.",
      "Titan Expert Network (TEN): a curated group of seasoned operators who offer 1:1 expert sessions, from GTM strategy to technical architecture",
    ],
  },
  {
    number: "02",
    title: "Hiring",
    subtitle: "Talent is the difference between scale and stall.",
    paragraphs: [
      "We've helped Titan founders close hundreds of senior hires — from CTOs and VPs of Sales to first growth marketers. Hiring is hard; doing it with Titan's bench, networks, and recruiter ecosystem is a different game.",
    ],
    whatYouGet: [
      "Curated candidate referrals from the Titan operator network for senior roles.",
      "Intro to specialised recruiters for stage- and function-specific searches.",
      "Hiring playbooks, calibration calls, and interview design help.",
    ],
  },
  {
    number: "03",
    title: "Fundraising",
    subtitle: "Capital, on the terms that fit the company.",
    paragraphs: [
      "Most rounds aren't lost on the deck. They're lost on positioning, narrative, and investor fit. We've been on both sides of the table and help founders pick the right partner — not just the fastest cheque.",
    ],
    whatYouGet: [
      "Direct intros to Series A through growth-stage funds based on stage, sector, and chemistry.",
      "Pitch reviews, narrative work, and dry-run sessions before the real meetings.",
      "Term-sheet and SHA reviews so the optics don't bite you in round 4.",
    ],
  },
  {
    number: "04",
    title: "Industry Playbooks",
    subtitle: "Don't reinvent what we've seen work.",
    paragraphs: [
      "Across 300+ companies we've seen what compounds and what stalls. We package those patterns into playbooks — GTM motions, pricing structures, distribution levers — so founders can skip the year of trial and error.",
    ],
    whatYouGet: [
      "Sector-specific GTM and growth playbooks pulled from active portfolio companies.",
      "Benchmarks for pricing, retention, sales cycles, and unit economics.",
      "Tactical 1-pagers on common breakdowns at each stage.",
    ],
  },
  {
    number: "05",
    title: "Follow-On Capital",
    subtitle: "We back our own — through every round.",
    paragraphs: [
      "When a Titan-backed company is ready to raise more, we lead with conviction and follow with capital. Our follow-on rate is one of the highest in Indian early-stage venture.",
    ],
    whatYouGet: [
      "Pro-rata participation in subsequent rounds where the company merits it.",
      "Bridge support during off-cycle moments when timing matters more than valuation.",
      "Co-investor introductions when the round needs to be bigger than our cheque.",
    ],
  },
  {
    number: "06",
    title: "Firefighting",
    subtitle: "When it breaks, we pick up the phone.",
    paragraphs: [
      "Building is hard, and the worst weeks are why partners exist. We are reachable — and we have been through almost every scenario a founder is likely to hit.",
    ],
    whatYouGet: [
      "24/7 access to a partner during crisis moments — fundraising stalls, key hires departing, customer escalations.",
      "Help finding the right specialist: legal, PR, restructuring, exec coaching.",
      "Hard-call conversations: pivot vs persevere, fire vs coach, raise vs cut.",
    ],
  },
];

/* ─────────────────────────────────────────────────────────
   Strip sizing per design spec.
     Closed: 185 × 386  →  ratio 185/386 ≈ 0.479
     Open:   226 × 386  →  ratio 226/386 ≈ 0.585
   Widths are DERIVED from the height so the aspect ratio is
   exactly preserved at every viewport — the SVG folder-tab
   uses preserveAspectRatio="none" and would otherwise stretch
   if the two clamps hit their mins/vw/vh crossovers separately.
   ───────────────────────────────────────────────────────── */
const STRIP_HEIGHT = "clamp(220px, min(26.8vw, 39.3vh), 386px)";
const STRIP_CLOSED_WIDTH = `calc(${STRIP_HEIGHT} * 185 / 386)`;
const STRIP_OPEN_WIDTH = `calc(${STRIP_HEIGHT} * 226 / 386)`;

/* ─────────────────────────────────────────────────────────
   Strip — closed rectangle with dashed L+R borders, OR open
   curved folder-tab SVG.

   Layout stays fixed: every button is the CLOSED width in
   flow, so clicking never shifts neighbours sideways. The
   open (226-wide) folder-tab SVG renders as an ABSOLUTE
   overlay centered on the button, extending ± ½ × (226−185)
   into the two neighbours' visual space — the paper-cream
   colour matches so the overlap reads as a single sheet.

   Animation is a "page-open" reveal: the overlay fades in
   while scaling from 94 % height at its bottom edge, so the
   tab looks like it's unfolding upward from the base of the
   paper. No horizontal expansion, no reflow.
   ───────────────────────────────────────────────────────── */
function Strip({
  label,
  isOpen,
  isFirst,
  isLast,
  onClick,
}: {
  label: string;
  isOpen: boolean;
  isFirst: boolean;
  isLast: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        // Fixed width in layout — no `layout` animation, no
        // horizontal displacement of neighbours.
        width: STRIP_CLOSED_WIDTH,
        height: STRIP_HEIGHT,
        background: "transparent",
        border: "none",
        padding: 0,
        position: "relative",
        cursor: "pointer",
        flexShrink: 0,
        // Active strip floats on top so its wider overlay sits
        // above adjacent closed strips.
        zIndex: isOpen ? 2 : 1,
      }}
      aria-pressed={isOpen}
      aria-label={`${isOpen ? "Active section: " : "Open "}${label}`}
    >
      {/* ── CLOSED LAYER — flat rectangle, dashed L+R borders
            per spec. First/last strip skip the outer border to
            avoid stray dashes against the paper edges. ── */}
      <motion.div
        animate={{ opacity: isOpen ? 0 : 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="absolute inset-0"
        style={{
          background: "#FBF7F0",
          borderLeft: isFirst ? "none" : "0.5px dashed #545454",
          borderRight: isLast ? "none" : "0.5px dashed #545454",
        }}
      />

      {/* ── OPEN LAYER — folder-tab SVG. Positioned via an
            outer wrapper that centers a 226-wide overlay on
            top of the 185-wide button (translateX(-50%) after
            left: 50%). An inner motion.div handles the reveal
            animation — opacity + scaleY from center-bottom so
            the tab "unfolds" upward from the paper edge. ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          width: STRIP_OPEN_WIDTH,
          height: "100%",
          transform: "translateX(-50%)",
          pointerEvents: "none",
        }}
      >
        <motion.div
          initial={false}
          animate={{
            opacity: isOpen ? 1 : 0,
            scaleY: isOpen ? 1 : 0.94,
          }}
          transition={{
            opacity: { duration: 0.35, ease: "easeOut" },
            scaleY: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
          }}
          style={{
            width: "100%",
            height: "100%",
            transformOrigin: "center bottom",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 226 386"
            preserveAspectRatio="none"
            fill="none"
            className="absolute inset-0 h-full w-full"
            style={{
              filter: "drop-shadow(0 6px 12px rgba(103, 103, 103, 0.15))",
            }}
          >
            <path
              d="M0 380.5C34.0536 168 34.0536 40.5 34.0536 27.5V0H225.241C232.923 134.014 179.783 386 179.783 386L0 380.5Z"
              fill="#FBF7F0"
            />
          </svg>
        </motion.div>
      </div>

      {/* ── LABEL — vertical text, always rendered so it never
            flickers during the open/closed cross-fade. ── */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span
          className="relative font-['Libre_Baskerville',_serif] font-semibold text-black"
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            fontSize: "clamp(14px, min(2.22vw, 3.26vh), 32px)",
            lineHeight: "120%",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
      </div>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────
   PaperCard — single cream paper that contains BOTH the
   category content AND the strip labels at the bottom. Using
   CSS (rounded rect + box-shadow) instead of an SVG mask so
   the paper grows naturally with content and the strips area
   shares the same background seamlessly.
   ───────────────────────────────────────────────────────── */
function PaperCard({
  active,
  categories,
  activeIndex,
  onSelect,
}: {
  active: BeyondCategory;
  categories: BeyondCategory[];
  activeIndex: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div
      className="relative mx-auto flex w-full flex-col"
      style={{
        maxWidth: "1115px",
        background: "#FBF7F0",
        borderRadius: "10px",
        boxShadow: "10px 11px 27.6px rgba(103, 103, 103, 0.25)",
      }}
    >
      {/* ── CONTENT AREA — blue box + "what you get" ── */}
      <div
        className="relative"
        style={{
          padding:
            "clamp(20px, min(2.8vw, 4vh), 44px) clamp(16px, min(2.6vw, 3.8vh), 42px)",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active.number}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex w-full flex-col"
            style={{ gap: "clamp(16px, min(2vw, 3vh), 32px)" }}
          >
            {/* ── BLUE BOX ── */}
            <div
              className="flex flex-col"
              style={{
                background: "#D3E2FF",
                borderRadius: "12px",
                padding:
                  "clamp(14px, min(1.8vw, 2.7vh), 28px) clamp(20px, min(2.64vw, 3.87vh), 38px)",
                gap: "clamp(8px, min(1.5vw, 2.24vh), 22px)",
              }}
            >
              <h3
                className="m-0 font-['Poppins',_sans-serif] font-medium text-black"
                style={{
                  fontSize: "clamp(20px, min(2.5vw, 3.67vh), 36px)",
                  lineHeight: "150%",
                }}
              >
                {active.number}. {active.title}
              </h3>
              <p
                className="m-0 font-['Poppins',_sans-serif] font-normal text-black"
                style={{
                  fontSize: "clamp(15px, min(1.67vw, 2.44vh), 24px)",
                  lineHeight: "150%",
                }}
              >
                {active.subtitle}
              </p>
              {active.paragraphs.map((para, i) => (
                <p
                  key={i}
                  className="m-0 self-stretch font-['Poppins',_sans-serif] font-normal text-black"
                  style={{
                    fontSize: "clamp(15px, min(1.67vw, 2.44vh), 24px)",
                    lineHeight: "150%",
                  }}
                >
                  {para}
                </p>
              ))}
            </div>

            {/* ── WHAT YOU GET ── heading on its OWN line (above
                  the bullets, matching the design); bullets below
                  in a 2-column grid on desktop, single column on
                  mobile. ── */}
            <div
              className="flex w-full flex-col"
              style={{ gap: "clamp(14px, min(1.6vw, 2.4vh), 24px)" }}
            >
              <h4
                className="m-0 font-['Poppins',_sans-serif] font-medium text-black"
                style={{
                  fontSize: "clamp(18px, min(2.22vw, 3.26vh), 32px)",
                  lineHeight: "110%",
                }}
              >
                What you get
              </h4>
              <ul
                className="m-0 grid w-full list-disc list-outside grid-cols-1 gap-x-[clamp(20px,2.4vw,40px)] gap-y-[clamp(10px,1.4vw,18px)] pl-[clamp(18px,1.6vw,24px)] lg:grid-cols-2"
              >
                {active.whatYouGet.map((bullet, i) => (
                  <li
                    key={i}
                    className="font-['Poppins',_sans-serif] font-normal text-black"
                    style={{
                      fontSize: "clamp(13px, min(1.4vw, 2vh), 20px)",
                      lineHeight: "150%",
                      maxWidth: "502px",
                    }}
                  >
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── STRIPS ROW — sits INSIDE the paper. Each Strip
            carries its own STRIP_HEIGHT clamp (closed 184×386,
            open 226×386 per spec, fluidly scaled), so the row
            is sized by its children — don't impose a fixed
            height here that would squash them. ── */}
      <div
        className="flex w-full justify-center items-end overflow-visible"
        style={{ borderTop: "0.5px solid rgba(0,0,0,0.05)" }}
      >
        {categories.map((cat, i) => (
          <Strip
            key={cat.title}
            label={cat.title}
            isOpen={i === activeIndex}
            isFirst={i === 0}
            isLast={i === categories.length - 1}
            onClick={() => onSelect(i)}
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main component.
   ───────────────────────────────────────────────────────── */
export default function BeyondTheChequeClient({
  data,
}: {
  data?: BeyondTheChequeData | null;
}) {
  const categories =
    data?.categories && data.categories.length > 0
      ? data.categories
      : FALLBACK_CATEGORIES;

  const [activeIndex, setActiveIndex] = useState(0);
  const active = categories[activeIndex];

  return (
    <section
      className="relative flex w-full flex-col items-center bg-white"
      style={{
        paddingTop: "clamp(48px, min(7vw, 10vh), 120px)",
        paddingBottom: "clamp(48px, min(7vw, 10vh), 120px)",
        paddingLeft: "var(--section-px-wide, 5%)",
        paddingRight: "var(--section-px-wide, 5%)",
      }}
    >
      <div className="mx-auto flex w-full max-w-[1330px] flex-col items-center">
        <PaperCard
          active={active}
          categories={categories}
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
        />
      </div>
    </section>
  );
}
