"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
  StoryCard,
  SeeMoreButton,
  padStories,
  type FounderStory,
} from "./ImpactAtGlanceClient";

/*
  FoundersStoryGrid
  ─────────────────
  Same 3-column hover-reveal StoryCard grid + scroll-linked animated
  dividers as ImpactAtGlance's "Their Stories" section — extended to
  4 rows (12 cards). Cards, hover behaviour and card animation are the
  exact same components; only the row count and divider layout differ.
*/

const ROWS = 4;
const CARD_COUNT = ROWS * 3; // 12

const STORY_GAP = "calc(var(--section-px-wide) * 0.4)";
const BORDER_PADDING = "calc(var(--section-px-wide) * 0.2)";

/* Slug for each card's detail page — derived from the company name
   (role after the comma, else the founder name). */
function storySlug(story: FounderStory): string {
  const role = story.role || "";
  const company = role.includes(",") ? role.split(",").pop()!.trim() : story.name;
  return company.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export interface FoundersStoryGridProps {
  headingFirst: string;
  headingSecond: string;
  ctaLabel: string;
  slides: FounderStory[];
}

export default function FoundersStoryGrid({
  headingFirst,
  headingSecond,
  ctaLabel,
  slides,
}: FoundersStoryGridProps) {
  /* Shared across all pills so their width is constant. */
  const allTags = slides.flatMap((s) => s.tags ?? []);

  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const lineProgress = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const smoothLineProgress = useSpring(lineProgress, { stiffness: 40, damping: 25 });
  const vRuleScale = smoothLineProgress;
  const hRuleScale = smoothLineProgress;

  // Row-boundary lines centered exactly in each row gap. With square
  // cards, row height = (innerH - (ROWS-1)*gap) / ROWS where innerH is
  // (100% - 2*bp). The k-th gap centre = bp + k*cardH + (k-0.5)*gap, so
  // padding above/below every line is exactly gap/2 (consistent).
  const hLineTops = [1, 2, 3].map(
    (k) =>
      `calc(var(--bp) + ${k} * ((100% - 2 * var(--bp) - ${ROWS - 1} * var(--gap)) / ${ROWS}) + ${k - 0.5} * var(--gap))`
  );
  // Column-boundary lines centered in each column gap (3 columns → 2 lines).
  const vLineLefts = [1, 2].map(
    (j) =>
      `calc(var(--bp) + ${j} * ((100% - 2 * var(--bp) - 2 * var(--gap)) / 3) + ${j - 0.5} * var(--gap))`
  );

  return (
    <section
      ref={sectionRef}
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
          className="flex flex-col items-center max-md:!mb-[clamp(32px,6dvh,48px)]"
          style={{ marginBottom: "min(3.47vw, 5.37vh)" }}
        >
          <h2
            className="m-0 text-center font-['Poppins',_sans-serif] font-semibold text-black max-md:!text-[clamp(24px,7vw,28px)] max-md:!leading-[120%]"
            style={{ fontSize: "min(4.51vw, 6.98vh)", lineHeight: "150%" }}
          >
            {headingFirst}
          </h2>
          <h2
            className="m-0 text-center font-['Poppins',_sans-serif] font-semibold text-black max-md:!text-[clamp(24px,7vw,28px)] max-md:!leading-[120%]"
            style={{ fontSize: "min(4.51vw, 6.98vh)", lineHeight: "150%" }}
          >
            {headingSecond}
          </h2>
        </motion.div>

        {/* ── GRID + DIVIDERS ── */}
        <div
          className="relative w-full"
          style={{ padding: BORDER_PADDING, "--bp": BORDER_PADDING, "--gap": STORY_GAP } as React.CSSProperties}
        >
          <div
            className="grid w-full grid-cols-3 max-md:!grid-cols-1 max-md:!gap-[24px]"
            style={{ gap: STORY_GAP }}
          >
            {padStories(slides, CARD_COUNT).map((story, i) => (
              <Link key={`${story.name}-${i}`} href={`/foundersstory/${storySlug(story)}`} className="block">
                <StoryCard story={story} sizerTags={allTags} />
              </Link>
            ))}
          </div>

          {/* Horizontal dividers between rows (split left/right for the
              symmetric draw-out reveal) */}
          {hLineTops.map((top, idx) => (
            <div key={`h-${idx}`}>
              <motion.div
                aria-hidden
                className="pointer-events-none absolute max-md:!hidden z-20"
                style={{
                  top,
                  left: "var(--bp)",
                  width: "calc(50% - var(--bp))",
                  height: 0,
                  borderTop: "1px solid #000",
                  transformOrigin: "left",
                  scaleX: hRuleScale,
                }}
              />
              <motion.div
                aria-hidden
                className="pointer-events-none absolute max-md:!hidden z-20"
                style={{
                  top,
                  right: "var(--bp)",
                  width: "calc(50% - var(--bp))",
                  height: 0,
                  borderTop: "1px solid #000",
                  transformOrigin: "right",
                  scaleX: hRuleScale,
                }}
              />
            </div>
          ))}

          {/* Vertical dividers between columns (full inner height) */}
          {vLineLefts.map((left, idx) => (
            <motion.div
              key={`v-${idx}`}
              aria-hidden
              className="pointer-events-none absolute max-md:!hidden z-20"
              style={{ top: "var(--bp)", left, width: 0, borderLeft: "1px solid #000", height: "calc(100% - 2 * var(--bp))", transformOrigin: "top", scaleY: vRuleScale }}
            />
          ))}
        </div>

        {/* ── SEE MORE ── */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
          }}
          style={{ marginTop: "min(3.47vw, 5.37vh)" }}
        >
          <SeeMoreButton label={ctaLabel} />
        </motion.div>
      </motion.div>
    </section>
  );
}
