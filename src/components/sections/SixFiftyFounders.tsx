"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  SECTION_HEADING_CLASS,
  SECTION_HEADING_STYLE,
} from "@/styles/heroTypography";

/**
 * /foundersstory — the closing band. "650+ Founders. One Extended Team" over a
 * wall of founder portraits.
 *
 * TYPE. The heading is LEVEL 3, the standard non-hero section heading, even
 * though it sits on navy like a hero would. Level 1 and 2 are hero sizes and
 * this is not the page's hero — using one here would make the closing band
 * shout louder than "A Central Hub For Founders" at the top.
 *
 * THE WALL IS THREE MARQUEES, not a static grid: row one travels left to
 * right, row two right to left, row three left to right again. The counter-
 * motion is what makes it read as a crowd rather than a sheet sliding past.
 *
 * The loop is BackedBefore's, deliberately — same `wrap`, same tripled pool,
 * same per-frame advance — so the two never drift apart in feel. See the note
 * on FaceMarquee for why the pool is tripled and measured rather than animated
 * with a CSS keyframe.
 */

/** Portraits per copy of a row. Enough that one copy is wider than any
 *  viewport, which is the condition for the loop to be seamless — see
 *  FaceMarquee. */
const PER_ROW = 16;
const ROWS = 3;

/** Cycled to fill the wall until real portraits are wired up. */
const FALLBACK_FACES = [
  "/images/FoundersStory/founder1.webp",
  "/images/FoundersStory/founder2.webp",
  "/images/FoundersStory/founder3.webp",
  "/images/FoundersStory/founder4.webp",
];

export interface SixFiftyFoundersData {
  heading?: string;
  faces?: string[];
}

/* ONE FIELD. It was two, joined by a hard <br> — and they rendered with no
   space between them, so the page read "650+ Founders.One Extended Team".
   `whitespace-pre-line` on the heading means the editor's own line breaks are
   what show. */
const FALLBACK_HEADING = "650+ Founders.\nOne Extended Team";

/** Square tiles, sized so ~12 fill a desktop row — the density the original
 *  12-column wall had. */
const TILE = "clamp(58px, min(7.4vw, 11vh), 104px)";
const GAP = "clamp(6px, 0.8vw, 14px)";

/** Row speeds in px/sec. Slightly different per row so the three never lock
 *  into step and read as one moving block. */
const ROW_SPEED = [46, 38, 52];
/** +1 travels left to right, -1 right to left. */
const ROW_DIRECTION = [1, -1, 1];

const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

/**
 * ONE ROW.
 *
 * The pool handed in is THREE copies of the row, and the loop advances a plain
 * x offset that is wrapped into `[-oneCopy, 0]` every frame. Because copy two
 * is always sitting exactly where copy one was, the wrap is invisible and the
 * strip never runs dry — that is the whole trick, and it is why the width of
 * one copy is measured (`scrollWidth / 3`) rather than assumed.
 *
 * Driven per frame rather than by a CSS keyframe so the row can be paused when
 * it scrolls out of view, and so the wrap point is exact at any tile size.
 */
function FaceMarquee({
  faces,
  direction,
  speed,
}: {
  faces: string[];
  direction: number;
  speed: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const rawX = useMotionValue(0);
  const inView = useInView(containerRef);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setContentWidth(el.scrollWidth / 3);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [faces]);

  useAnimationFrame((_, delta) => {
    if (!inView || contentWidth === 0) return;
    /* Capped: a backgrounded tab resumes with one huge delta, which would
       throw the row a whole screen sideways in a single frame. */
    const dt = Math.min(delta, 50) / 1000;
    rawX.set(rawX.get() + direction * speed * dt);
  });

  const x = useTransform(rawX, (v) =>
    contentWidth === 0 ? 0 : wrap(-contentWidth, 0, v)
  );

  return (
    <motion.div
      ref={containerRef}
      className="flex w-max items-center"
      style={{ gap: GAP, x, willChange: "transform" }}
    >
      {faces.map((src, i) => (
        <div
          key={i}
          className="relative shrink-0 overflow-hidden bg-white"
          style={{ width: TILE, aspectRatio: "1", borderRadius: "2px" }}
        >
          <Image
            src={src}
            alt=""
            aria-hidden
            fill
            sizes="(max-width: 768px) 22vw, 104px"
            className="object-cover object-center"
            draggable={false}
          />
        </div>
      ))}
    </motion.div>
  );
}

export default function SixFiftyFounders({
  data,
}: {
  data?: SixFiftyFoundersData | null;
}) {
  const heading = data?.heading || FALLBACK_HEADING;
  /* An image added in the Studio but never given a file comes back as a null
     url, which would render as a blank white tile. */
  const picked = data?.faces?.filter((f): f is string => !!f) ?? [];
  const faces = picked.length ? picked : FALLBACK_FACES;

  /* THE WALL IS ONE CONTINUOUS DEAL. Tile 0 is the first portrait, tile 1 the
     second, and so on straight through the three rows — so every portrait is
     on screen before any of them comes round again. Once the list runs out it
     loops: with 15 portraits the 16th tile is the first one again.

     The stride is PER_ROW, NOT some smaller number. Stepping each row by less
     than its own length makes the rows OVERLAPPING WINDOWS onto the same
     stretch of the list rather than consecutive slices of it: at a stride of 5
     adjacent rows shared 11 of their 16 faces, six portraits appeared in all
     three rows at once, and everything past index 25 never rendered at all.

     Then tripled, which is what the marquee loop wraps against. */
  const rows = Array.from({ length: ROWS }, (_, r) => {
    const one = Array.from(
      { length: PER_ROW },
      (_, i) => faces[(r * PER_ROW + i) % faces.length]
    );
    return [...one, ...one, ...one];
  });

  return (
    <section
      className="relative w-full overflow-hidden bg-[#00112E]"
      style={{
        paddingTop: "var(--section-py)",
        paddingBottom: "var(--section-py)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      {/* Ambient glow, sized in % of the section so it cannot spill sideways
          and leave stray blobs on a tall mobile layout. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at 12% 40%, rgba(37,84,196,0.42) 0%, transparent 55%), radial-gradient(ellipse at 88% 70%, rgba(37,84,196,0.32) 0%, transparent 55%)",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-center">
        <motion.h2
          className={`m-0 whitespace-pre-line text-center font-semibold text-white ${SECTION_HEADING_CLASS}`}
          style={{
            ...SECTION_HEADING_STYLE,
            marginBottom: "clamp(28px, min(3.4vw, 5vh), 60px)",
          }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {heading}
        </motion.h2>
      </div>

      {/* THE WALL — full bleed, so the rows run off both edges of the screen
          rather than stopping at the content column. It sits OUTSIDE the
          max-width wrapper above for that reason.

          The mask fades each row out at the edges, so tiles arrive and leave
          rather than popping at a hard boundary — the same treatment
          BackedBefore's rows carry. */}
      <motion.div
        className="relative z-10 flex w-screen flex-col"
        style={{
          gap: GAP,
          marginLeft: "calc(50% - 50vw)",
          maskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      >
        {rows.map((row, r) => (
          <div key={r} className="flex w-full overflow-hidden">
            <FaceMarquee
              faces={row}
              direction={ROW_DIRECTION[r]}
              speed={ROW_SPEED[r]}
            />
          </div>
        ))}
      </motion.div>
    </section>
  );
}
