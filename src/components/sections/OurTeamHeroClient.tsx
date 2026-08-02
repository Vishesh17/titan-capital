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

// MOBILE-ONLY 4-column diamond (matches the mobile design screenshot):
//   Row 1 : 4 cards (c1 c2 c3 c4)
//   Rows 2-4 : heading block owns cols 1-2, 2 cards each on the right (c3 c4)
// → 4, 2, 2, 2. Literal class strings so Tailwind's JIT generates them.
const MOBILE_POSITIONS = [
  "col-start-1 row-start-1", // 0
  "col-start-2 row-start-1", // 1
  "col-start-3 row-start-1", // 2
  "col-start-4 row-start-1", // 3
  "col-start-3 row-start-2", // 4
  "col-start-4 row-start-2", // 5
  "col-start-3 row-start-3", // 6
  "col-start-4 row-start-3", // 7
  "col-start-3 row-start-4", // 8
  "col-start-4 row-start-4", // 9
];

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

  const headingLines = [titleLine1, titleLine2, titleLine3];

  return (
    <section
      // Full-viewport min-height on desktop ONLY (lg+). On mobile the
      // section sizes to its content so the next section flows up right
      // after the hero grid instead of leaving empty space below.
      className="relative flex w-full flex-col bg-white lg:min-h-[calc(100svh_-_var(--nav-height))]"
      style={{
        // marginTop pushes the section below the fixed navbar; the
        // padding tokens are the site-wide section rhythm (same
        // var(--section-py) / var(--section-px-wide) as every other
        // section, so top→heading and content→bottom match the rest).
        marginTop: "var(--nav-height)",
        paddingTop: "var(--section-py)",
        paddingBottom: "var(--section-py)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col">
        {/* ══════════ MOBILE (< lg) — 4-col diamond (4,2,2,2) ══════════
            Row 1: 4 cards across. Rows 2-4: heading + description own
            cols 1-2 while 2 cards sit in cols 3-4 each row. Mirrors the
            mobile design; desktop layout below is untouched. */}
        <div
          className="grid w-full grid-cols-4 lg:hidden"
          style={{
            columnGap: "clamp(10px, 2.6vw, 16px)",
            rowGap: "clamp(10px, 2.6vw, 16px)",
          }}
        >
          {/* Row 1 — cards 0-3 */}
          {teamItems.slice(0, 4).map((item, i) => (
            <FlipCard
              key={`m-${item.id}`}
              isFlipped={isFlipped}
              frontIsBox={item.frontIsBox}
              imgSrc={item.imgSrc}
              gridClass={MOBILE_POSITIONS[i]}
            />
          ))}

          {/* ── TEXT BLOCK — cols 1-2, rows 2-4 ── */}
          <motion.div
            className="col-start-1 col-span-2 row-start-2 row-span-3 flex flex-col justify-center items-start pr-[8px]"
            initial="hidden"
            animate="visible"
          >
            {headingLines.map((line, i) => (
              <motion.h1
                key={i}
                className="m-0 font-['Poppins',_sans-serif] font-bold uppercase text-[#0E0E0E]"
                style={{ fontSize: "clamp(30px, 9vw, 46px)", lineHeight: "128%" }}
                variants={fadeUp(i * 0.15)}
              >
                {line}
              </motion.h1>
            ))}
            <motion.p
              className="m-0 font-['Poppins',_sans-serif] font-normal text-[#000]"
              style={{
                marginTop: "clamp(10px, 2.5vw, 16px)",
                fontSize: "clamp(13px, 3.6vw, 15px)",
                lineHeight: "150%",
              }}
              variants={fadeUp(0.45)}
            >
              {description}
            </motion.p>
          </motion.div>

          {/* Right cards — rows 2-4, cols 3-4 (cards 4-9) */}
          {teamItems.slice(4, 10).map((item, k) => (
            <FlipCard
              key={`m-${item.id}`}
              isFlipped={isFlipped}
              frontIsBox={item.frontIsBox}
              imgSrc={item.imgSrc}
              gridClass={MOBILE_POSITIONS[4 + k]}
            />
          ))}
        </div>

        {/* ══════════ DESKTOP (lg+) — 6-col diamond ══════════ */}
        <div
          className="hidden lg:grid w-full lg:grid-cols-6 lg:pl-[clamp(20px,min(3vw,4vh),80px)]"
          style={{
            columnGap: "clamp(14px, min(1.8vw, 2.2vh), 32px)",
            rowGap: "clamp(18px, min(2.2vw, 2.8vh), 40px)",
          }}
        >
          {/* Row 1 (items 0-5) — 6 cards spanning full width on lg */}
          {teamItems.slice(0, 6).map((item) => (
            <FlipCard key={item.id} {...item} isFlipped={isFlipped} />
          ))}

          {/* ── TEXT BLOCK — cols 1-2 rows 2-3 ── */}
          <motion.div
            className="pointer-events-none relative z-10 flex flex-col items-start lg:col-span-2 lg:col-start-1 lg:row-span-2 lg:row-start-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
          >
            {headingLines.map((line, i) => (
              <motion.h1
                key={i}
                className="pointer-events-auto m-0 font-['Poppins',_sans-serif] font-bold uppercase text-[#0E0E0E]"
                style={{
                  fontSize: "clamp(40px, min(5.55vw, 8.6vh), 96px)",
                  lineHeight: "140%",
                }}
                variants={fadeUp(i * 0.15)}
              >
                {line}
              </motion.h1>
            ))}
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
