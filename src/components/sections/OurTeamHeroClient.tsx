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
  // Row 1 (lg): 6 cards spanning cols 1-6, full width
  { frontIsBox: true,  gridClass: "col-start-1 row-start-1 lg:col-start-1 lg:row-start-1" },
  { frontIsBox: false, gridClass: "col-start-2 row-start-1 lg:col-start-2 lg:row-start-1" },
  { frontIsBox: true,  gridClass: "col-start-3 row-start-1 lg:col-start-3 lg:row-start-1" },
  { frontIsBox: false, gridClass: "col-start-4 row-start-1 lg:col-start-4 lg:row-start-1" },
  { frontIsBox: true,  gridClass: "col-start-3 row-start-2 lg:col-start-5 lg:row-start-1" },
  { frontIsBox: false, gridClass: "col-start-4 row-start-2 lg:col-start-6 lg:row-start-1" },

  // Row 2 (lg): heading owns cols 1-2, 4 cards fill cols 3-6
  { frontIsBox: false, gridClass: "col-start-3 row-start-3 lg:col-start-3 lg:row-start-2" },
  { frontIsBox: true,  gridClass: "col-start-4 row-start-3 lg:col-start-4 lg:row-start-2" },
  { frontIsBox: false, gridClass: "col-start-3 row-start-4 lg:col-start-5 lg:row-start-2" },
  { frontIsBox: true,  gridClass: "col-start-4 row-start-4 lg:col-start-6 lg:row-start-2" },

  // Row 3 (lg): heading owns cols 1-2, 3 cards in cols 4-6 (col 3 empty)
  { frontIsBox: true,  gridClass: "col-start-1 row-start-5 lg:col-start-4 lg:row-start-3" },
  { frontIsBox: false, gridClass: "col-start-2 row-start-5 lg:col-start-5 lg:row-start-3" },
  { frontIsBox: true,  gridClass: "col-start-3 row-start-5 lg:col-start-6 lg:row-start-3" },
];

const FALLBACK_IMAGES = Array.from(
  { length: 13 },
  (_, i) => `/images/team${i + 1}.jpg`
);

/* ─────────────────────────────────────────────────────────
   Sub-Components
   ───────────────────────────────────────────────────────── */
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

const BlueBox = () => <div className="h-[76%] w-[76.5%] bg-[#D3E2FF]" />;

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
      className={`relative w-full aspect-[100/103] [perspective:1200px] ${gridClass}`}
    >
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
        marginTop: "var(--nav-height) -20px",
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
        {/* 4-col grid on mobile, 6-col grid on lg. Row 1 spans all 6
            cols. The text block occupies cols 1-2 of rows 2-3. Cards
            6-9 fill cols 3-6 of row 2. Cards 10-11 sit at cols 5-6 of
            row 3 (right edge), matching the design. Cards fill their
            columns via w-full + aspect-[3/4] so size follows viewport
            width naturally. */}
        <div
          className="grid w-full grid-cols-4 lg:grid-cols-6 lg:pl-[clamp(20px,min(3vw,4vh),80px)]"
          style={{
            columnGap: "clamp(14px, min(1.8vw, 2.2vh), 32px)",
            rowGap: "clamp(18px, min(2.2vw, 2.8vh), 40px)",
          }}
        >
          {/* Row 1 (items 0-5) — 6 cards spanning full width on lg */}
          {teamItems.slice(0, 6).map((item) => (
            <FlipCard key={item.id} {...item} isFlipped={isFlipped} />
          ))}

          {/* ── TEXT BLOCK ──
              Mobile: cols 1-2 rows 2-4.
              Desktop lg+: cols 1-2 rows 2-3. */}
          <motion.div
            className="pointer-events-none relative z-10 col-start-1 col-span-2 row-start-2 row-span-3 flex flex-col items-start lg:col-span-2 lg:col-start-1 lg:row-span-2 lg:row-start-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
          >
            <motion.h1
              className="pointer-events-auto m-0 font-['Poppins',_sans-serif] font-bold uppercase text-[#0E0E0E]"
              style={{
                fontSize: "clamp(40px, min(5.55vw, 8.6vh), 96px)",
                lineHeight: "140%",
              }}
              variants={fadeUp(0)}
            >
              {titleLine1}
            </motion.h1>

            <motion.h1
              className="pointer-events-auto m-0 font-['Poppins',_sans-serif] font-bold uppercase text-[#0E0E0E]"
              style={{
                fontSize: "clamp(40px, min(5.55vw, 8.6vh), 96px)",
                lineHeight: "140%",
              }}
              variants={fadeUp(0.15)}
            >
              {titleLine2}
            </motion.h1>

            <motion.h1
              className="pointer-events-auto m-0 font-['Poppins',_sans-serif] font-bold uppercase text-[#0E0E0E]"
              style={{
                fontSize: "clamp(40px, min(5.55vw, 8.6vh), 96px)",
                lineHeight: "140%",
              }}
              variants={fadeUp(0.3)}
            >
              {titleLine3}
            </motion.h1>

            <motion.p
              className="pointer-events-auto m-0 font-['Poppins',_sans-serif] font-normal text-[#000]"
              style={{
                marginTop: "clamp(12px, min(1.4vw, 2vh), 24px)",
                maxWidth: "100%",
                fontSize: "clamp(13px, min(1.5vw, 1.8vh), 20px)",
                lineHeight: "150%",
              }}
              variants={fadeUp(0.45)}
            >
              {description}
            </motion.p>
          </motion.div>

          {/* Rows 2-3 cards (items 6-11) */}
          {teamItems.slice(6).map((item) => (
            <FlipCard key={item.id} {...item} isFlipped={isFlipped} />
          ))}
        </div>
      </div>
    </section>
  );
}
