"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

/* ─────────────────────────────────────────────────────────
   Shared motion variants — same scaleX-highlight + fadeUp
   pattern used by OurTeamClient + LedByFoundersClient.
   ───────────────────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const, delay },
  },
});

const highlightScaleX = (delay = 0.5) => ({
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.6, ease: "easeInOut" as const, delay },
  },
});

/* ─────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────── */
export interface OurTeamHeroData {
  titleLine1?: string;
  titleLine2?: string;
  titleLine3?: string;
  description?: string;
  members?: string[];
}

/* ─────────────────────────────────────────────────────────
   Fallbacks & Structural Grid Mapping
   ───────────────────────────────────────────────────────── */
const FALLBACK_TITLE_1 = "Builders";
const FALLBACK_TITLE_2 = "Backing";
const FALLBACK_TITLE_3 = "Builders";
const FALLBACK_DESC =
  "We've built companies ourselves. We know the weight of the journey. Now we back the founders building out their dreams.";

// Exactly 12 slots with two responsive layouts:
//
//   Mobile (4-col grid)                 Desktop lg+ (5-col diamond)
//     row1: c0  c1  c2  c3               row1: c0 c1 c2 c3 c4
//     row2: [text] c4  c5                row2:    c5 c6 c7 c8
//     row3: [text] c6  c7                row3:       c9 c10 c11
//     row4: [text] c8  c9
//     row5: c10 c11 —   —
//
// The gridClass for each card carries both the mobile position and the
// lg position; the text block spans cols 1-2 rows 2-4 on mobile and
// cols 1-2 rows 2-3 on lg. Front/back is alternated so each global
// flip swaps every cell.
const GRID_STRUCTURE = [
  // Card 0 — mobile r1c1 / lg r1c1
  { frontIsBox: true,  gridClass: "col-start-1 row-start-1 lg:col-start-1 lg:row-start-1" },
  // Card 1 — mobile r1c2 / lg r1c2
  { frontIsBox: false, gridClass: "col-start-2 row-start-1 lg:col-start-2 lg:row-start-1" },
  // Card 2 — mobile r1c3 / lg r1c3
  { frontIsBox: true,  gridClass: "col-start-3 row-start-1 lg:col-start-3 lg:row-start-1" },
  // Card 3 — mobile r1c4 / lg r1c4
  { frontIsBox: false, gridClass: "col-start-4 row-start-1 lg:col-start-4 lg:row-start-1" },
  // Card 4 — mobile r2c3 / lg r1c5
  { frontIsBox: true,  gridClass: "col-start-3 row-start-2 lg:col-start-5 lg:row-start-1" },

  // Card 5 — mobile r2c4 / lg r2c2
  { frontIsBox: true,  gridClass: "col-start-4 row-start-2 lg:col-start-2 lg:row-start-2" },
  // Card 6 — mobile r3c3 / lg r2c3
  { frontIsBox: false, gridClass: "col-start-3 row-start-3 lg:col-start-3 lg:row-start-2" },
  // Card 7 — mobile r3c4 / lg r2c4
  { frontIsBox: true,  gridClass: "col-start-4 row-start-3 lg:col-start-4 lg:row-start-2" },
  // Card 8 — mobile r4c3 / lg r2c5
  { frontIsBox: false, gridClass: "col-start-3 row-start-4 lg:col-start-5 lg:row-start-2" },

  // Card 9 — mobile r4c4 / lg r3c3
  { frontIsBox: true,  gridClass: "col-start-4 row-start-4 lg:col-start-3 lg:row-start-3" },
  // Card 10 — mobile r5c1 / lg r3c4
  { frontIsBox: false, gridClass: "col-start-1 row-start-5 lg:col-start-4 lg:row-start-3" },
  // Card 11 — mobile r5c2 / lg r3c5
  { frontIsBox: true,  gridClass: "col-start-2 row-start-5 lg:col-start-5 lg:row-start-3" },
];

const FALLBACK_IMAGES = Array.from(
  { length: 12 },
  (_, i) => `/images/team${i + 1}.jpg`
);

/* ─────────────────────────────────────────────────────────
   Sub-Components
   ───────────────────────────────────────────────────────── */
const Dot = ({ className }: { className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="10"
    height="10"
    viewBox="0 0 10 10"
    fill="none"
    className={`absolute z-20 ${className}`}
  >
    <circle cx="5" cy="5" r="5" fill="#323232" />
  </svg>
);

const Photo = ({ src }: { src: string }) => (
  <div className="relative h-full w-full bg-[#f0f0f0]">
    <Image
      src={src}
      alt="Team Member"
      fill
      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
      className="object-cover object-center"
      onError={(e) => (e.currentTarget.style.display = "none")}
    />
  </div>
);

const BlueBox = () => <div className="h-[82%] w-[76.5%] bg-[#D3E2FF]" />;

function FlipCard({
  isFlipped,
  frontIsBox,
  imgSrc,
  gridClass,
}: {
  isFlipped: boolean;
  frontIsBox: boolean;
  imgSrc: string;
  gridClass: string;
}) {
  return (
    <div
      // Mobile: aspect-ratio 205/229 (portrait) so 4-col cards read as
      // proper rectangles at their small size, not tall thin slivers.
      // Desktop: aspect-auto + height = viewport-derived slice so the
      // 5-col diamond auto-adapts (portrait/square/landscape per screen).
      className={`relative w-full aspect-[205/229] lg:aspect-auto lg:h-[var(--card-h)] [perspective:1200px] ${gridClass}`}
    >
      <Dot className="-left-[5px] -top-[5px]" />
      <Dot className="-right-[5px] -top-[5px]" />
      <Dot className="-bottom-[5px] -left-[5px]" />
      <Dot className="-bottom-[5px] -right-[5px]" />

      <div
        className={`relative h-full w-full transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d] ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        <div className="absolute inset-0 flex items-center justify-center bg-white [backface-visibility:hidden]">
          {frontIsBox ? <BlueBox /> : <Photo src={imgSrc} />}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-white [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {frontIsBox ? <Photo src={imgSrc} /> : <BlueBox />}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main Client Component

   Layout strategy
   ───────────────
   Section margin/padding matches the standard rhythm used by
   Footer and the other sections — `clamp(40px, min(6.94vw,
   10.18vh), 100px)` for both top + bottom, `var(--section-
   px-wide)` for the sides, max-w-[1440px] inner wrapper.

   To make the whole hero fit in a single viewport across the
   /multiview grid (1097×617 short laptops → 2560×1600
   desktops) we ONLY shrink the cards: the per-column width
   uses `min(vw, vh)` so the grid collapses on short laptops
   while the section padding stays exactly the same as Footer.
   Headings carry a vh component so they back off just enough
   on short screens to keep the text block inside its 2-row
   slot of the grid.
   ───────────────────────────────────────────────────────── */
export default function OurTeamHeroClient({
  data,
}: {
  data?: OurTeamHeroData | null;
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  const titleLine1 = data?.titleLine1 || FALLBACK_TITLE_1;
  const titleLine2 = data?.titleLine2 || FALLBACK_TITLE_2;
  const titleLine3 = data?.titleLine3 || FALLBACK_TITLE_3;
  const description = data?.description || FALLBACK_DESC;

  const teamItems = GRID_STRUCTURE.map((struct, index) => {
    const cmsImage = data?.members?.[index];
    return {
      ...struct,
      id: index,
      imgSrc: cmsImage || FALLBACK_IMAGES[index],
    };
  });

  useEffect(() => {
    const interval = setInterval(() => setIsFlipped((prev) => !prev), 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="relative flex w-full flex-col bg-white"
      style={{
        // Matches HeroClient.tsx (Hero.tsx server wrapper delegates
        // to it). marginTop pushes the section below the fixed navbar,
        // minHeight makes it fill the remaining viewport, then the
        // padding tokens are the site-wide section rhythm.
        marginTop: "var(--nav-height)",
        minHeight: "calc(100svh - var(--nav-height))",
        paddingTop: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingBottom: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingLeft: "var(--section-px-wide, 5%)",
        paddingRight: "var(--section-px-wide, 5%)",
      }}
    >
      {/* Same wrapper as every other section: max-w-[1440px] inner
          container centered by mx-auto, with the section's own padding
          driven by var(--section-px-wide). This means the hero's left
          and right gutters match Footer / Hero / LedByFounders exactly
          — no custom width clamp making it narrower. The grid fits in
          one viewport because each FlipCard carries its own max-height,
          not because the container is narrowed. */}
      <div className="mx-auto flex w-full max-w-[1440px] flex-col">
        <div
          // Grid fills the max-w-[1440px] outer wrapper — no inner
          // max-w cap — so the section's left / right extents line
          // up with Footer, LedByFounders, and OurTeamClient. Cards
          // are portrait rectangles via aspect-ratio 205/229; on
          // shorter viewports the section will overflow slightly
          // (a small scroll) rather than contract the grid inward.
          // Mobile: 4-col grid so the top row shows all 4 cards side
          // by side (per the mobile design). Desktop lg+: 5-col diamond.
          className="grid w-full grid-cols-4 lg:grid-cols-5"
          style={{
            columnGap: "clamp(14px, min(2vw, 2.5vh), 32px)",
            rowGap: "clamp(18px, min(2.4vw, 3vh), 40px)",
            // CSS var consumed by each FlipCard at lg+ (aspect-ratio
            // drives card height on mobile).
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ["--card-h" as any]:
              "clamp(80px, calc((100svh - 300px) / 3), 400px)",
          }}
        >
          {/* Row 1 (items 0-4) */}
          {teamItems.slice(0, 5).map((item) => (
            <FlipCard key={item.id} {...item} isFlipped={isFlipped} />
          ))}

          {/* ── TEXT BLOCK ──
              Mobile: spans cols 1-2 and rows 2-4 (occupying the left
              half of the 4-col grid while cards 4-9 sit in cols 3-4).
              Desktop lg+: spans cols 1-2 rows 2-3 with pt-[calc()]
              pushing the first heading line to the midpoint of row 2. */}
          <motion.div
            className="pointer-events-none relative z-10 col-start-1 col-span-2 row-start-2 row-span-3 flex flex-col items-start lg:col-span-2 lg:col-start-1 lg:row-span-2 lg:row-start-2 lg:pt-[calc((100svh-300px)/6)]"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
          >
            <motion.h1
              className="pointer-events-auto m-0 font-['Libre_Baskerville',_serif] font-semibold text-[#0E0E0E]"
              style={{
                fontSize: "clamp(28px, min(4.4vw, 5.4vh), 56px)",
                lineHeight: "118%",
              }}
              variants={fadeUp(0)}
            >
              {titleLine1}
            </motion.h1>

            <motion.div
              // inline-flex + padding sizes the cream highlight to fit
              // "Backing" — no clipping at any viewport.
              className="pointer-events-auto relative my-1 inline-flex items-center justify-center overflow-hidden"
              style={{
                paddingLeft: "clamp(8px, 1vw, 14px)",
                paddingRight: "clamp(8px, 1vw, 14px)",
                paddingTop: "2px",
                paddingBottom: "2px",
              }}
              variants={fadeUp(0.15)}
            >
              <motion.span
                className="absolute inset-0 z-0 h-full w-full bg-[#FBF7F0]"
                style={{ transformOrigin: "left" }}
                variants={highlightScaleX(0.55)}
              />
              <h1
                className="relative z-10 m-0 font-['Libre_Baskerville',_serif] font-semibold italic text-[#0E0E0E]"
                style={{
                  fontSize: "clamp(28px, min(4.4vw, 5.4vh), 56px)",
                  lineHeight: "118%",
                }}
              >
                {titleLine2}
              </h1>
            </motion.div>

            <motion.h1
              className="pointer-events-auto m-0 font-['Libre_Baskerville',_serif] font-semibold text-[#0E0E0E]"
              style={{
                fontSize: "clamp(28px, min(4.4vw, 5.4vh), 56px)",
                lineHeight: "118%",
              }}
              variants={fadeUp(0.3)}
            >
              {titleLine3}
            </motion.h1>

            <motion.p
              className="pointer-events-auto m-0 font-['Poppins',_sans-serif] font-normal text-[#000]"
              style={{
                marginTop: "clamp(8px, min(1vw, 1.4vh), 16px)",
                maxWidth: "clamp(220px, min(28vw, 100%), 420px)",
                fontSize: "clamp(13px, min(1.5vw, 1.8vh), 20px)",
                lineHeight: "150%",
              }}
              variants={fadeUp(0.45)}
            >
              {description}
            </motion.p>
          </motion.div>

          {/* Rows 2-3 cards (items 5-11) */}
          {teamItems.slice(5).map((item) => (
            <FlipCard key={item.id} {...item} isFlipped={isFlipped} />
          ))}
        </div>
      </div>
    </section>
  );
}
