"use client";

import { useState } from "react";
import { storySlug, type FounderStoryCard } from "@/lib/founderStory";
import Link from "next/link";
import { motion } from "framer-motion";
import { SeeMoreButton } from "./ImpactAtGlanceClient";
import FounderQuoteCard from "./FounderQuoteCard";
import { SECTION_HEADING_CLASS, SECTION_HEADING_STYLE } from "@/styles/heroTypography";

/*
  FoundersStoryGrid
  ─────────────────
  A 3-column grid of founder stories, two rows at a time, with the same Load
  More control and the same self-drawing dividers as the blogs listing.

  IT NO LONGER PADS. It used to render a fixed 12 cards through `padStories`,
  which repeats the list to fill the count — with six stories in Sanity that
  meant every story appeared twice. The grid now shows exactly what exists.

  The CARD is not the same as ImpactAtGlance's. This page uses
  FounderQuoteCard — logo in the top-left corner and the quote across the foot,
  both visible at rest — where the home page keeps its hover-reveal StoryCard.
  They are separate components on purpose: editing the shared one would have
  rewritten the home page's section too.
*/

/** Two rows of three. One more helping of the same size per Load More. */
const PAGE_SIZE = 6;

const STORY_GAP = "calc(var(--section-px-wide) * 0.4)";
const BORDER_PADDING = "calc(var(--section-px-wide) * 0.2)";

export interface FoundersStoryGridProps {
  heading: string;
  slides: FounderStoryCard[];
}

export default function FoundersStoryGrid({
  heading,
  slides,
}: FoundersStoryGridProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visible = slides.slice(0, visibleCount);
  /* No button at all when everything already fits — with six stories in Sanity
     there is nothing more to load, so nothing to press. */
  const hasMore = slides.length > visible.length;

  const rows = Math.max(1, Math.ceil(visible.length / 3));

  /* One row's height in the grid's own terms. It resolves to the same pixel
     value whatever `rows` is — rows are equal-height — so the bands already on
     screen do not move when Load More adds more. */
  const rowTrack = `((100% - 2 * var(--bp) - ${rows - 1} * var(--gap)) / ${rows})`;

  const vLineLefts = [1, 2].map(
    (j) =>
      `calc(var(--bp) + ${j} * ((100% - 2 * var(--bp) - 2 * var(--gap)) / 3) + ${j - 0.5} * var(--gap))`
  );

  /* THE TRIGGER HAS TO HAVE AREA, so each row's rules live inside a band that
     covers the row and the BAND is what is watched. A rule is `width: 0` with a
     left border, or `height: 0` with a top border, and starts at scale 0 — a
     box of zero area, which an IntersectionObserver cannot reason about.

     Each band owns its column segments and the divider ABOVE it. Above, so
     that no rule is ever added to a band whose `once` trigger has already
     fired: the band that is last has no divider, and were the divider owned
     downward, adding rows would mount one into an already-finished band where
     nothing would ever animate it. */
  const bands = Array.from({ length: rows }, (_, r) => ({
    top: `calc(var(--bp) + ${r} * (${rowTrack} + var(--gap)))`,
    height: `calc(${rowTrack} + var(--gap))`,
    dividerAbove: r > 0,
  }));

  const RULE_TWEEN = { duration: 1.1, ease: [0.22, 1, 0.36, 1] as const };
  /* Named so the section's own "hidden"/"visible" cannot reach them. This grid
     sits inside a motion parent that propagates those labels to its whole
     subtree; matching names would let the parent drive the rules instead of
     their own band. */
  const V_RULE = {
    ruleOff: { scaleY: 0 },
    ruleOn: { scaleY: 1, transition: RULE_TWEEN },
  };
  const H_RULE = {
    ruleOff: { scaleX: 0 },
    ruleOn: { scaleX: 1, transition: { ...RULE_TWEEN, delay: 0.12 } },
  };

  return (
    <section
      className="relative w-full"
      style={{
        background: "#FFF",
        overflow: "hidden",
        zIndex: 10,
        paddingTop: "min(5.79vw, 8.95vh)",
        paddingBottom: "min(5.79vw, 8.95vh)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <motion.div
        className="mx-auto flex w-full flex-col items-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.05 }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.18, delayChildren: 0.45 } },
        }}
      >
        {/* ── HEADING ── */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
          }}
          /* LEFT-ALIGNED, matching the Featured Stories band above it. It was
             centred, which read as a different section rather than the next
             one down the same page. */
          className="flex w-full flex-col items-start max-md:!mb-[clamp(32px,6dvh,48px)]"
          style={{ marginBottom: "min(3.47vw, 5.37vh)" }}
        >
          {/* ONE HEADING, and the line breaks are the editor's. It used to be
              two fields with the second welded onto its own line, so the
              heading was always two lines whatever was typed. `whitespace-pre-line`
              means one line stays one line and pressing Enter gives another. */}
          <h2
            className={`m-0 whitespace-pre-line text-left text-black ${SECTION_HEADING_CLASS}`}
            style={SECTION_HEADING_STYLE}
          >
            {heading}
          </h2>
        </motion.div>

        {/* ── GRID + DIVIDERS ──
            `overflow-hidden` trims the last band, which runs one gap past the
            final row so that consecutive bands touch and their column segments
            read as one continuous line. */}
        <div
          className="relative w-full overflow-hidden"
          style={{ padding: BORDER_PADDING, "--bp": BORDER_PADDING, "--gap": STORY_GAP } as React.CSSProperties}
        >
          <div
            className="grid w-full grid-cols-3 max-md:!grid-cols-1 max-md:!gap-[24px]"
            style={{ gap: STORY_GAP }}
          >
            {visible.map((story, i) => (
              <Link key={`${story.name}-${i}`} href={`/foundersstory/${storySlug(story)}`} className="block">
                <FounderQuoteCard story={story} />
              </Link>
            ))}
          </div>

          {/* One band per row. Percentages inside a band resolve against the
              BAND, which is why the divider sits at a negative half-gap rather
              than repeating the row arithmetic. */}
          {bands.map((band, r) => (
            <motion.div
              key={`band-${r}`}
              aria-hidden
              className="pointer-events-none absolute left-0 right-0 max-md:!hidden z-20"
              style={{ top: band.top, height: band.height }}
              initial="ruleOff"
              whileInView="ruleOn"
              viewport={{ once: true, amount: 0.12 }}
            >
              {vLineLefts.map((left, idx) => (
                <motion.div
                  key={`v-${idx}`}
                  className="absolute"
                  style={{ top: 0, left, width: 0, height: "100%", borderLeft: "1px solid #000", transformOrigin: "top" }}
                  variants={V_RULE}
                />
              ))}
              {band.dividerAbove && (
                <>
                  <motion.div
                    className="absolute"
                    style={{ top: "calc(-1 * var(--gap) / 2)", left: "var(--bp)", width: "calc(50% - var(--bp))", height: 0, borderTop: "1px solid #000", transformOrigin: "left" }}
                    variants={H_RULE}
                  />
                  <motion.div
                    className="absolute"
                    style={{ top: "calc(-1 * var(--gap) / 2)", right: "var(--bp)", width: "calc(50% - var(--bp))", height: 0, borderTop: "1px solid #000", transformOrigin: "right" }}
                    variants={H_RULE}
                  />
                </>
              )}
            </motion.div>
          ))}
        </div>

        {/* ── LOAD MORE ──
            The same control the blogs grid uses, down to the component: the
            pill, the label fade and the timing are shared code, and only the
            mark in the circle differs from the arrow form. */}
        {hasMore && (
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
            }}
            style={{ marginTop: "min(3.47vw, 5.37vh)" }}
          >
            <SeeMoreButton
              label="Load More"
              icon="plus"
              onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
            />
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
