"use client";

import { useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { useLenis } from "lenis/react";
import {
  SECTION_HEADING_CLASS,
  SECTION_HEADING_STYLE,
  SUBHEADING_CLASS,
  SUBHEADING_STYLE,
} from "@/styles/heroTypography";

/* ─────────────────────────────────────────────────────────
   Types — shared with server wrapper (FifteenYears.tsx).
   ───────────────────────────────────────────────────────── */
export interface YearEntry {
  year: number;
  subtitle: string;
  description: string;
}

export interface FifteenYearsData {
  headingFirst?: string;
  headingHighlight?: string;
  years?: YearEntry[];
}

/* ─────────────────────────────────────────────────────────
   Fallbacks — used when Sanity is unreachable. Covers
   2011 → 2026 with placeholder copy so the page never blanks.
   ───────────────────────────────────────────────────────── */
const FALLBACK_HEADING_FIRST = "15 Years of Showing Up";
const FALLBACK_HEADING_HIGHLIGHT = "Showing Up";
const FALLBACK_YEARS: YearEntry[] = Array.from({ length: 16 }, (_, i) => {
  const year = 2011 + i;
  return {
    year,
    subtitle:
      year === 2011
        ? "Where it all began — backing founders from our own pockets."
        : `Year ${year} milestone headline goes here.`,
    description:
      year === 2011
        ? "First seed investments, backing founders from personal conviction, out of our own pockets. Ola Cabs was Titan Capital's first investment, when it was doing 5 rides a day."
        : "Placeholder copy for this year. Edit in Sanity Studio under “Fifteen Years of Showing Up” to replace with the real story.",
  };
});

/* Scroll distance (in viewport-heights) allotted to EACH year while the
   timeline is pinned. Bigger = more scroll needed to advance one year. */
const STEP_VH = 40;

/* ─────────────────────────────────────────────────────────
   Single digit wheel — vertical column of 0-9 that slides
   to show the requested digit. Box is white with the inset
   shadow from the spec (no border). The digit fills the box
   at Libre Baskerville 700, 96px nominal.
   Design spec: 105×121 box, font 96px / line-height 120%.
   ───────────────────────────────────────────────────────── */
function DigitWheel({ digit }: { digit: number }) {
  // Box aspect = 105/121 ≈ 0.87. Clamp scales down on small viewports.
  const widthClamp = "clamp(54px, min(7.3vw, 10.7vh), 105px)";
  const heightClamp = "clamp(62px, min(8.4vw, 12.3vh), 121px)";

  return (
    <div
      className="relative overflow-hidden bg-white"
      style={{
        width: widthClamp,
        height: heightClamp,
        borderRadius: "2px",
        // Inset shadow from the spec → odometer-window feel.
        boxShadow: "inset 0 4px 10.9px 0 rgba(0, 0, 0, 0.25)",
      }}
    >
      <motion.div
        className="absolute left-0 top-0 flex w-full flex-col items-center"
        // CSS transform percentages are relative to the element's OWN
        // size, not the parent. The inner column is 1000% tall, so
        // translateY(-10%) of the column = exactly one box height
        // (= -(1/10)·column = 1 parent height). To show digit N we
        // shift by -N * 10%, NOT -N * 100% (that would overshoot 10×
        // and put the column completely off-screen → empty boxes).
        initial={false}
        animate={{ y: `${-digit * 10}%` }}
        transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
        style={{ height: "1000%" }}
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex w-full items-center justify-center font-['Poppins',_serif] font-medium text-black"
            style={{
              height: "10%",
              fontSize: "clamp(40px, min(6.67vw, 9.78vh), 96px)",
              lineHeight: "120%",
            }}
          >
            {i}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Year display — "20" static (with letter-spacing) + two
   digit wheels for the tens & ones. Per spec: Libre Baskerville
   700 at 96px with letter-spacing 28.8px (= 0.3em).
   ───────────────────────────────────────────────────────── */
function YearDisplay({ year }: { year: number }) {
  const lastTwo = Math.max(0, Math.min(99, year - 2000));
  const tens = Math.floor(lastTwo / 10);
  const ones = lastTwo % 10;

  return (
    <div
      className="flex items-center"
      // Tight gap between "20" and the wheels, and between the wheels.
      style={{ gap: "clamp(2px, min(0.4vw, 0.6vh), 8px)" }}
    >
      <span
        className="font-['Poppins',_serif] font-medium text-black"
        style={{
          fontSize: "clamp(40px, min(6.67vw, 9.78vh), 96px)",
          lineHeight: "120%",
          // Wider letter-spacing so the static "2 0" breathes and reads
          // in step with the gaps between the digit wheels.
          letterSpacing: "0.18em",
        }}
      >
        20
      </span>
      <DigitWheel digit={tens} />
      <DigitWheel digit={ones} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Tally column — exactly 7 horizontal marks per spec, stacked
   above OR below the odometer. Each line uses the exact SVG
   from the design spec (71×5 viewBox, 4px stroke, round cap).
   Opacity fades linearly: the mark closest to the odometer is
   fully opaque; the mark farthest is at ~0.18.
     - top column   → opacity ramps DOWN going up (closest mark is at the bottom)
     - bottom column → opacity ramps DOWN going down (closest mark is at the top)
   These are decorative — they don't animate when the year changes.
   ───────────────────────────────────────────────────────── */
function TallyColumn({
  side,
  activeIndex,
}: {
  side: "top" | "bottom";
  activeIndex: number;
}) {
  /*
    Bike-tire / coin-machine model.

    The tally column is ONE physical strip with many tick marks
    (one per year of the timeline plus a small buffer). The strip
    sits inside a fixed-height clipping window that shows ~7 ticks.
    When the year changes, the whole strip translates by exactly
    one tick-slot per year — in the SAME direction as the odometer
    digit wheel — so the entire apparatus feels like one rotating
    component.

    Edges are softened with a CSS mask gradient so ticks fade in
    as they enter the window and out as they leave — no JS opacity
    bookkeeping needed.

    Direction:
      - top column    → strip translates UPWARD on year advance
                        (marks scroll up out the top, new ones
                        emerge near the odometer at the bottom)
      - bottom column → strip translates DOWNWARD on year advance
                        (marks scroll down out the bottom, new
                        ones emerge near the odometer at the top)
  */

  const VISIBLE = 7;
  // Render enough ticks to cover the entire year range (max 16)
  // plus the visible window so the strip never runs out.
  const TOTAL = 16 + VISIBLE;
  const slotPct = 100 / TOTAL; // one tick slot as % of strip height
  // BOTH columns scroll in the SAME direction (upward) as the year
  // advances — synced with the digit wheel's translation. This keeps
  // both strips visible across all years (no end-of-strip emptying).
  const shiftY = -activeIndex * slotPct;

  // Mask fades the FAR edge (away from the odometer). Pulled back to
  // a 70% solid / 30% fade ratio so the column looks consistently
  // filled rather than appearing to shrink at the far edge.
  const maskGradient =
    side === "top"
      ? "linear-gradient(to top, black 70%, transparent 100%)"
      : "linear-gradient(to bottom, black 70%, transparent 100%)";

  return (
    <div
      aria-hidden
      style={{
        width: "clamp(38px, min(4.93vw, 7.23vh), 71px)",
        height: "clamp(98px, min(14vw, 20.5vh), 200px)",
        overflow: "hidden",
        position: "relative",
        WebkitMaskImage: maskGradient,
        maskImage: maskGradient,
      }}
    >
      <motion.div
        className="absolute inset-x-0 top-0 flex flex-col items-stretch"
        // Strip height = (TOTAL / VISIBLE) × window height. This
        // makes each slot inside (1/TOTAL of strip) exactly equal to
        // 1/VISIBLE of the window — i.e. one "tick row". A shift of
        // -100/TOTAL% therefore moves the strip by EXACTLY one tick
        // row regardless of viewport, fixing the drift that made the
        // bottom of the top column pull away from the odometer at
        // high activeIndex.
        style={{ height: `${(TOTAL / VISIBLE) * 100}%` }}
        animate={{ y: `${shiftY}%` }}
        // Matches the digit wheel's duration & easing so the whole
        // odometer feels like one synchronised mechanism.
        transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
      >
        {Array.from({ length: TOTAL }).map((_, i) => (
          <div
            key={i}
            className="flex w-full items-center justify-center"
            style={{ height: `${100 / TOTAL}%` }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 71 5"
              fill="none"
              style={{ width: "100%", height: "auto" }}
            >
              <path
                d="M68.9961 2L1.99853 2.5715"
                stroke="black"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Year selector chip — clickable. Active state is the navy
   gradient pill from the design spec. Hover lifts + shines.
   ───────────────────────────────────────────────────────── */
function YearChip({
  year,
  active,
  onClick,
}: {
  year: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseMove={(e) => {
        if (!active) return;
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
      }}
      whileHover={{ y: active ? -1 : -1, scale: active ? 1.02 : 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative shrink-0 cursor-pointer overflow-hidden font-['Poppins',_sans-serif] font-normal transition-colors"
      style={{
        fontSize: "clamp(13px, min(1.25vw, 1.85vh), 18px)",
        lineHeight: "1.3",
        color: active ? "#FFFFFF" : "#0E0E0E",
        background: active
          ? "linear-gradient(123deg, #001A4D 30.37%, #003CB3 99.98%)"
          : "transparent",
        borderRadius: active ? "999px" : "0",
        // Tighter padding so the active pill isn't visually oversized
        // and doesn't tower over the inactive chips.
        padding: active ? "4px 12px" : "4px 6px",
        minWidth: active ? "64px" : undefined,
      }}
      aria-pressed={active}
      aria-label={`Show story for year ${year}`}
    >
      {/* Cursor spotlight (only when active) */}
      {active && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(circle 80px at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.18) 0%, transparent 100%)",
          }}
        />
      )}
      <span className="relative z-10">{year}</span>
    </motion.button>
  );
}

/* ─────────────────────────────────────────────────────────
   Main component.
   ───────────────────────────────────────────────────────── */
export default function FifteenYearsClient({
  data,
}: {
  data?: FifteenYearsData | null;
}) {
  const headingFirst = data?.headingFirst || FALLBACK_HEADING_FIRST;
  const headingHighlight =
    data?.headingHighlight || FALLBACK_HEADING_HIGHLIGHT;

  // Ensure ascending order + cap to 16 entries (2011-2026).
  const years = useMemo(() => {
    const source =
      data?.years && data.years.length > 0 ? data.years : FALLBACK_YEARS;
    return [...source].sort((a, b) => a.year - b.year);
  }, [data?.years]);

  const N = years.length;

  const sectionRef = useRef<HTMLElement>(null);
  const lenis = useLenis();

  // Scroll-driven timeline: the section is TALL and its content is pinned
  // (sticky). Scroll progress through the section (0 → 1) maps to the year
  // index — so one year advances per scroll, and the page can't reach the
  // footer until the last year has been shown.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const [activeIndex, setActiveIndex] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (N <= 1) return;
    const idx = Math.min(N - 1, Math.max(0, Math.round(p * (N - 1))));
    setActiveIndex((prev) => (prev === idx ? prev : idx));
  });

  // Year chips SEEK to the scroll position for that year (Lenis-aware); the
  // scroll listener above then updates the index — so the buttons work even
  // without scrolling and stay in sync with the scroll.
  const scrollToIndex = (i: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const scrollable = Math.max(0, el.offsetHeight - window.innerHeight);
    const target = top + (N > 1 ? (i / (N - 1)) * scrollable : 0);
    if (lenis) lenis.scrollTo(target, { duration: 1.0 });
    else window.scrollTo({ top: target, behavior: "smooth" });
  };

  const current = years[activeIndex] ?? years[0];
  const sectionHeightVh = 100 + Math.max(0, N - 1) * STEP_VH;

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-white"
      style={{ height: `${sectionHeightVh}vh` }}
    >
      <div
        className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden"
        style={{
          paddingTop: "calc(var(--nav-height, 64px) + clamp(16px, min(2vw, 3vh), 40px))",
          paddingBottom: "clamp(28px, min(4vw, 6vh), 64px)",
          paddingLeft: "var(--section-px-wide, 5%)",
          paddingRight: "var(--section-px-wide, 5%)",
        }}
      >
        <div className="mx-auto flex w-full max-w-[1330px] flex-col items-center">
        {/* ── HEADING — same WinnersHero pattern (split, scaleX cream pill) ── */}
        <motion.div
          className="flex flex-col items-center text-center max-md:!mb-[clamp(32px,6dvh,48px)]"
          style={{
            gap: "clamp(4px, min(0.4vw, 0.6vh), 8px)",
            marginBottom: "min(3.47vw, 5.37vh)",
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.h2
   className={`m-0 text-center text-black ${SECTION_HEADING_CLASS}`}
   style={{ ...SECTION_HEADING_STYLE, }}
   variants={{
    hidden: { opacity: 0, y: 40 },
    visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
    },
   }}
   >
            {headingFirst}
          </motion.h2>

          {/* <motion.div
            className="relative inline-flex items-center justify-center overflow-hidden bg-transparent px-[10px] py-[6px] md:px-[14px] md:py-[10px]"
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: "easeOut", delay: 0.3 },
              },
            }}
          >
            <motion.span
              className="absolute inset-0 z-0 h-full w-full bg-[#D3E2FF]"
              style={{ transformOrigin: "left", borderRadius: "4px" }}
              variants={{
                hidden: { scaleX: 0 },
                visible: {
                  scaleX: 1,
                  transition: { duration: 0.6, ease: "easeInOut", delay: 0.8 },
                },
              }}
            />
            <span
              className={`relative z-10 text-[#001A4D] ${SECTION_HEADING_CLASS}`}
              style={SECTION_HEADING_STYLE}
            >
              {headingHighlight}
            </span>
          </motion.div> */}
        </motion.div>

        {/* ── TWO-COLUMN BODY ──
              LEFT: tally + odometer + tally
              RIGHT: subtitle + description (cross-fades on year change)
              Stacks vertically on small viewports. */}
        <div
          className="flex w-full flex-col items-center gap-[clamp(28px,4vw,64px)] lg:flex-row lg:items-center lg:justify-between"
        >
          {/* LEFT — odometer flanked by tally marks */}
          <div className="flex shrink-0 flex-col items-center">
            <TallyColumn side="top" activeIndex={activeIndex} />
            <div
              style={{
                marginTop: "clamp(8px, 1vw, 18px)",
                marginBottom: "clamp(8px, 1vw, 18px)",
              }}
            >
              <YearDisplay year={current.year} />
            </div>
            <TallyColumn side="bottom" activeIndex={activeIndex} />
          </div>

          {/* RIGHT — copy block that cross-fades on year change.
                The outer container has a fixed min-height so swapping
                between long and short years doesn't make the whole
                section grow/shrink (which would shove the year chips
                up and down jarringly). The min-height is generous
                enough for ~10 lines of description at desktop. */}
          <div
            className="relative flex w-full flex-1 flex-col lg:max-w-[760px]"
            style={{ minHeight: "clamp(150px, min(19vw, 27vh), 260px)" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={current.year}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute inset-0 flex flex-col"
                style={{ gap: "clamp(14px, min(1.8vw, 2.6vh), 32px)" }}
              >
                <h3
                  className={`font-medium m-0 text-black ${SUBHEADING_CLASS}`}
                  style={{ ...SUBHEADING_STYLE, maxWidth: "711px" }}
                >
                  {current.subtitle}
                </h3>
                <p
                  className="m-0 font-['Poppins',_sans-serif] font-normal text-black/80"
                  style={{
                    fontSize: "clamp(12px, min(2.0vw, 3vh), 28px)",
                    lineHeight: "163%",
                    maxWidth: "724px",
                  }}
                >
                  {current.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── YEAR SELECTOR — horizontal scrollable strip ──
              Wrapped so the inner scroller can clip on x while the
              outer block has vertical padding — that way the active
              pill's lift/scale never gets sliced by the row's clip
              box or by the section boundary above. */}
        <div
          className="mt-[clamp(28px,min(3.5vw,5vh),56px)] w-full"
          style={{ paddingTop: "12px", paddingBottom: "12px" }}
        >
          <div
            className="flex w-full items-center justify-center overflow-x-auto overflow-y-visible"
            style={{
              gap: "clamp(8px, min(1.5vw, 2vh), 28px)",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {years.map((y, i) => (
              <YearChip
                key={y.year}
                year={y.year}
                active={i === activeIndex}
                onClick={() => scrollToIndex(i)}
              />
            ))}
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
