"use client";

import { useState, useEffect } from "react";
import FramedPhoto from "@/components/ui/FramedPhoto";
import { motion } from "framer-motion";
import {
  HERO_BODY_CLASS,
  HERO_BODY_STYLE,
  HERO_HEADING_LIGHT_CLASS,
  HERO_HEADING_LIGHT_MOBILE_STYLE,
  HERO_HEADING_LIGHT_STYLE,
} from "@/styles/heroTypography";

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
/** One photo in the flip-card grid, with its per-image framing. */
export interface TeamHeroMember {
  url?: string;
  /** Framing nudges, % of the frame. Negative = reveal more left / top. */
  offsetX?: number;
  offsetY?: number;
  /** Zoom. The control for subjects shot at different distances — panning
   *  can never make a small head bigger. See FramedPhoto. */
  scale?: number;
}

export interface OurTeamHeroData {
  titleLine1?: string;
  titleLine2?: string;
  titleLine3?: string;
  description?: string;
  members?: TeamHeroMember[];
}

/* ─────────────────────────────────────────────────────────
   Fallbacks & Structural Grid Mapping
   ───────────────────────────────────────────────────────── */
const FALLBACK_TITLE_1 = "Builders";
const FALLBACK_TITLE_2 = "Backing";
const FALLBACK_TITLE_3 = "Builders";
const FALLBACK_DESC =
  "We've built companies ourselves. We know the weight of the journey. Now we back the founders building out their dreams.";

// 15 slots. Desktop (lg+) is a 7-column grid, left-aligned:
//
//   Desktop lg+ (7-col)
//     row1:  c0 c1 c2 c3 c4 c5 c6           ← 7 cards, full width
//     row2:  [ heading ]  c7  c8  c9  c10    ← heading cols 1-3, cards cols 4-7
//     row3:  [ heading ]  c11 c12 c13 c14    ← heading cols 1-3, cards cols 4-7
//
// gridClass is consumed ONLY by the desktop block, so it carries lg
// positions only. The mobile (< lg) block lays out its own 4,2,2,2
// grid from MOBILE_POSITIONS and never reads gridClass. Front/back is
// alternated so each global flip swaps every cell.
const GRID_STRUCTURE = [
  // Row 1 — 7 cards spanning cols 1-7
  { frontIsBox: true,  gridClass: "lg:col-start-1 lg:row-start-1" },
  { frontIsBox: false, gridClass: "lg:col-start-2 lg:row-start-1" },
  { frontIsBox: true,  gridClass: "lg:col-start-3 lg:row-start-1" },
  { frontIsBox: false, gridClass: "lg:col-start-4 lg:row-start-1" },
  { frontIsBox: true,  gridClass: "lg:col-start-5 lg:row-start-1" },
  { frontIsBox: false, gridClass: "lg:col-start-6 lg:row-start-1" },
  { frontIsBox: true,  gridClass: "lg:col-start-7 lg:row-start-1" },

  // Row 2 — heading owns cols 1-3, 4 cards fill cols 4-7.
  // frontIsBox follows a (row+col) chess-board so box/photo alternate
  // both across each row AND down each column (col4: photo→box→photo…).
  { frontIsBox: true,  gridClass: "lg:col-start-4 lg:row-start-2" },
  { frontIsBox: false, gridClass: "lg:col-start-5 lg:row-start-2" },
  { frontIsBox: true,  gridClass: "lg:col-start-6 lg:row-start-2" },
  { frontIsBox: false, gridClass: "lg:col-start-7 lg:row-start-2" },

  // Row 3 — heading owns cols 1-3, 4 cards fill cols 4-7
  { frontIsBox: false, gridClass: "lg:col-start-4 lg:row-start-3" },
  { frontIsBox: true,  gridClass: "lg:col-start-5 lg:row-start-3" },
  { frontIsBox: false, gridClass: "lg:col-start-6 lg:row-start-3" },
  { frontIsBox: true,  gridClass: "lg:col-start-7 lg:row-start-3" },
];

const FALLBACK_IMAGES = Array.from(
  { length: 15 },
  (_, i) => `/images/team${i + 1}.jpg`
);

// MOBILE-ONLY 4-column diamond (matches the mobile design screenshot):
//   Row 1 : 4 cards (c1 c2 c3 c4)
//   Rows 2-4 : heading block owns cols 1-2, 2 cards each on the right (c3 c4)
// → 4, 2, 2, 2. Literal class strings so Tailwind's JIT generates them.
/*  frontIsBox alternates on (row + col), so no two touching cells show the
    same face — across each row AND down each column. It cannot be inherited
    from GRID_STRUCTURE: that pattern is a chessboard for the DESKTOP 7-col
    grid, and these ten cards sit at completely different coordinates here.

        col:      1      2      3      4
        row 1:  [box]  photo  [box]  photo
        row 2:                photo  [box]
        row 3:                [box]  photo
        row 4:                photo  [box]

    `member` is the index into Sanity's members array. The five cards showing
    a photo at rest take members 1, 3, 5, 7, 9 (1-based); the five that reveal
    theirs on the flip take 11, 13, 15, 2, 4 — so the first pass is the
    odd-numbered people and the flip brings in the rest.                    */
const MOBILE_CARDS = [
  { pos: "col-start-1 row-start-1", frontIsBox: true,  member: 2 }, // 11th, on flip
  { pos: "col-start-2 row-start-1", frontIsBox: false, member: 1 },  //  1st, at rest
  { pos: "col-start-3 row-start-1", frontIsBox: true,  member: 0 }, // 13th, on flip
  { pos: "col-start-4 row-start-1", frontIsBox: false, member: 5 },  //  3rd, at rest
  { pos: "col-start-3 row-start-2", frontIsBox: false, member: 10 },  //  5th, at rest
  { pos: "col-start-4 row-start-2", frontIsBox: true,  member: 4 }, // 15th, on flip
  { pos: "col-start-3 row-start-3", frontIsBox: true,  member: 7 },  //  2nd, on flip
  { pos: "col-start-4 row-start-3", frontIsBox: false, member: 8 },  //  7th, at rest
  { pos: "col-start-3 row-start-4", frontIsBox: false, member: 6 },  //  9th, at rest
  { pos: "col-start-4 row-start-4", frontIsBox: true,  member: 9 },  //  4th, on flip
];

/* ─────────────────────────────────────────────────────────
   Sub-Components
   ───────────────────────────────────────────────────────── */
/**
 * Framing is delegated to FramedPhoto, which pans with a transform rather
 * than `object-position`. See that file for why: with square sources,
 * `object-position` only moves along whichever axis the cover-fit happens to
 * overflow, and for these cards that axis flips between laptop sizes.
 */
const Photo = ({
  src,
  offsetX = 0,
  offsetY = 0,
  scale,
}: {
  src: string;
  offsetX?: number;
  offsetY?: number;
  scale?: number;
}) => (
  <FramedPhoto
    src={src}
    alt="Team Member"
    offsetX={offsetX}
    offsetY={offsetY}
    scale={scale}
    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
    imgClassName="grayscale"
  />
);

const BlueBox = () => <div className="h-[76%] w-[76.5%] bg-[#D3E2FF]" />;

function FlipCard({
  isFlipped,
  frontIsBox,
  imgSrc,
  gridClass,
  offsetX,
  offsetY,
  scale,
}: {
  isFlipped: boolean;
  frontIsBox: boolean;
  imgSrc: string;
  gridClass: string;
  offsetX?: number;
  offsetY?: number;
  scale?: number;
}) {
  const photo = (
    <Photo src={imgSrc} offsetX={offsetX} offsetY={offsetY} scale={scale} />
  );
  return (
    <div
      // 100/103 on BOTH breakpoints. Desktop used to drop the fixed aspect
      // and size height with min(vw, vh) while width came from the grid —
      // which made the card's shape depend on the viewport, swinging from
      // 0.58 to 1.29 across common laptops. That is what changed how much
      // of each face was cropped from machine to machine, and what made the
      // Sanity nudges live on different axes per screen. Width now drives
      // height, so the crop window is the same shape everywhere; the grid
      // as a whole shrinks on short screens instead (see --card-w below).
      className={`relative w-full aspect-[100/103] [perspective:1200px] ${gridClass}`}
    >
      <div
        className={`relative h-full w-full transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d] ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        <div className="absolute inset-0 flex items-center justify-center bg-white [backface-visibility:hidden]">
          {frontIsBox ? <BlueBox /> : photo}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-white [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {frontIsBox ? photo : <BlueBox />}
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
    const members = data?.members ?? [];
    // Cards beyond the number of CMS members cycle back through the
    // existing member photos (rather than 404ing on missing fallback
    // files). Add more members in Sanity for unique faces on all 15.
    const member = members.length
      ? members[index] || members[index % members.length]
      : undefined;
    return {
      ...struct,
      id: index,
      imgSrc: member?.url || FALLBACK_IMAGES[index],
      offsetX: member?.offsetX ?? 0,
      offsetY: member?.offsetY ?? 0,
      scale: member?.scale,
    };
  });

  /* Mobile resolves its own cards: different positions, its own chessboard,
     and an explicit pick from Sanity — so it cannot reuse teamItems, which is
     indexed by the desktop grid's slot order. */
  const mobileItems = MOBILE_CARDS.map((card, i) => {
    const members = data?.members ?? [];
    const member = members.length
      ? members[card.member] ?? members[card.member % members.length]
      : undefined;
    return {
      ...card,
      id: i,
      imgSrc: member?.url || FALLBACK_IMAGES[card.member],
      offsetX: member?.offsetX ?? 0,
      offsetY: member?.offsetY ?? 0,
      scale: member?.scale,
    };
  });

  useEffect(() => {
    const interval = setInterval(() => setIsFlipped((prev) => !prev), 5000);
    return () => clearInterval(interval);
  }, []);

  const headingLines = [titleLine1, titleLine2, titleLine3];

  return (
    <section
      // The white section starts at the very top (no nav-height margin) so
      // its background fills BEHIND the transparent navbar — the nav strip
      // matches the hero until it turns blue on scroll. Content clears the
      // nav via paddingTop instead of a margin.
      // Desktop (lg+): 78svh tall from the top; mobile sizes to content.
      // min-h, not h. A fixed 80svh forced the cards to shrink away from the
      // right gutter on short laptops to avoid overflowing it. As a minimum
      // it still fills tall screens, while letting the grid keep its full
      // width — which tops out at 94% of the viewport on the shortest laptop,
      // so the hero is still one screen.
      className="relative flex w-full flex-col bg-white lg:!min-h-[80svh] lg:!pt-[calc(var(--nav-height)_+_min(1.6vw,2.3vh))] lg:!pb-[var(--bottom-pad)]"
      style={{
        /* --row-gap lives on the SECTION, not on the grid, so the bottom
           padding below can be expressed in terms of it and the two stay
           locked together. */
        "--row-gap": "clamp(16px, min(2.0vw, 2.8vh), 36px)",

        /* The space below the last row is matched to the space between row 1
           and the heading — which is NOT --row-gap. The heading block is
           centred inside its two-row slot, so its first line starts well
           below the row boundary: measured, that gap is ~2.8x the row gap
           (58px against 20px at 1280x720). Using --row-gap alone here looked
           visibly tighter at the bottom than the gap it was meant to match. */
        "--bottom-pad": "calc(var(--row-gap) * 2.8)",
        paddingTop: "calc(var(--nav-height) + var(--section-py))",
        paddingBottom: "var(--section-py)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      } as React.CSSProperties}
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
            /* Equal rows. Left to `auto`, row 1 collapsed to exactly the card
               height while rows 2-4 were stretched by the heading+description
               block spanning them — so the gap after row 1 was 10px and the
               others 62px. With 1fr every row takes the same height, which is
               what makes the three gaps identical. */
            gridTemplateRows: "repeat(4, 1fr)",
          }}
        >
          {/* Row 1 — cards 0-3 */}
          {mobileItems.slice(0, 4).map((item) => (
            <FlipCard
              key={`m-${item.id}`}
              isFlipped={isFlipped}
              frontIsBox={item.frontIsBox}
              imgSrc={item.imgSrc}
              offsetX={item.offsetX}
              offsetY={item.offsetY}
              gridClass={item.pos}
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
                // Inline, not the `max-md:` half of HERO_HEADING_LIGHT_CLASS:
                // this block is `lg:hidden`, so it is still on screen from
                // 768-1023px where that variant no longer applies.
                // Same tightening as the desktop block above, a little looser
                // because these lines sit in a narrower column.
                style={{ ...HERO_HEADING_LIGHT_MOBILE_STYLE, lineHeight: "110%" }}
                variants={fadeUp(i * 0.15)}
              >
                {line}
              </motion.h1>
            ))}
            <motion.p
              className={`font-normal m-0 text-[#000] ${HERO_BODY_CLASS}`}
              style={{ ...HERO_BODY_STYLE, marginTop: "clamp(10px, 2.5vw, 16px)" }}
              variants={fadeUp(0.45)}
            >
              {description}
            </motion.p>
          </motion.div>

          {/* Right cards — rows 2-4, cols 3-4 (cards 4-9) */}
          {mobileItems.slice(4, 10).map((item) => (
            <FlipCard
              key={`m-${item.id}`}
              isFlipped={isFlipped}
              frontIsBox={item.frontIsBox}
              imgSrc={item.imgSrc}
              offsetX={item.offsetX}
              offsetY={item.offsetY}
              gridClass={item.pos}
            />
          ))}
        </div>

        {/* ══════════ DESKTOP (lg+) — 7-col grid (7,4,4) ══════════
            Card height + gaps are CSS vars so the absolute heading overlay
            (below) can align to cols 1-3 / rows 2-3 WITHOUT being a grid
            item — that keeps all three card rows a constant height even if
            the heading + description are taller than two rows. */}
        <div
          className="relative hidden lg:grid lg:justify-start"
          style={{
            "--col-gap": "clamp(14px, min(1.8vw, 2.2vh), 32px)",
            /* --row-gap is inherited from the section — see the note there. */

            /* Card width is simply the 7 columns filling the container, so
               the grid is always flush to BOTH gutters — the same
               --section-px-wide every other section uses.
               Height follows from the fixed aspect, which is what keeps the
               crop window identical on every screen. (The old code squashed
               HEIGHT with min(12vw,17vh) while width came from the grid,
               which is what made the aspect viewport-dependent.)
               No height cap: at this width three rows come to at most 94% of
               the shortest laptop viewport, so the hero still reads as one
               screen without the cards having to shrink away from the right
               gutter. The section's min-height keeps it filling tall screens. */
            "--card-w":
              "calc((min(1440px, 100vw - 2 * var(--section-px-wide)) - 6 * var(--col-gap)) / 7)",

            gridTemplateColumns: "repeat(7, var(--card-w))",
            columnGap: "var(--col-gap)",
            rowGap: "var(--row-gap)",
          } as React.CSSProperties}
        >
          {/* Row 1 (items 0-6) — 7 cards spanning full width on lg */}
          {teamItems.slice(0, 7).map((item) => (
            <FlipCard key={item.id} {...item} isFlipped={isFlipped} />
          ))}

          {/* ── TEXT BLOCK — absolute overlay over cols 1-3 / rows 2-3.
               Positioned off the shared CSS vars so it does NOT stretch the
               grid rows (constant row spacing). Left edge aligns with the
               row-1 cards. ── */}
          <motion.div
            className="pointer-events-none absolute left-0 z-10 flex flex-col items-start justify-center"
            style={{
              // Card height is now derived from width by the fixed aspect,
              // so these track --card-w rather than a separate --card-h.
              top: "calc(var(--card-w) * 103 / 100 + var(--row-gap))",
              height: "calc(2 * (var(--card-w) * 103 / 100) + var(--row-gap))",
              width: "calc(3 * var(--card-w) + 2 * var(--col-gap))",
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
          >
            {headingLines.map((line, i) => (
              <motion.h1
                key={i}
                className={`pointer-events-auto m-0 text-[#0E0E0E] ${HERO_HEADING_LIGHT_CLASS}`}
                /* Tighter leading than the shared level-2 token's 124%.
                   Overridden here rather than in heroTypography because the
                   token is three stacked one-word lines ONLY in this hero —
                   everywhere else it sets running heads that wrap, where 124%
                   is right. Size and weight still come from the token. */
                style={{ ...HERO_HEADING_LIGHT_STYLE, lineHeight: "104%" }}
                variants={fadeUp(i * 0.15)}
              >
                {line}
              </motion.h1>
            ))}
            <motion.p
              className={`font-normal pointer-events-auto m-0 text-[#000] ${HERO_BODY_CLASS}`}
              style={{
                ...HERO_BODY_STYLE,
                marginTop: "clamp(12px, min(1.4vw, 2vh), 24px)",
                maxWidth: "100%",
              }}
              variants={fadeUp(0.45)}
            >
              {description}
            </motion.p>
          </motion.div>

          {/* Rows 2-3 cards (items 7-14) — 4 + 4 in cols 4-7 */}
          {teamItems.slice(7).map((item) => (
            <FlipCard key={item.id} {...item} isFlipped={isFlipped} />
          ))}
        </div>
      </div>
    </section>
  );
}
