"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  SECTION_HEADING_CLASS,
  SECTION_HEADING_STYLE,
  SUBHEADING_CLASS,
  SUBHEADING_STYLE,
  HERO_BODY_CLASS,
  HERO_BODY_STYLE,
  LABEL_STYLE,
} from "@/styles/heroTypography";

/**
 * /foundersstory — "Featured Stories", directly under the hero.
 *
 * A section heading with a quiet "browse all" beside it, then one white card:
 * founder portrait on the left, and on the right the tags, the names, the role
 * and a pull-quote.
 *
 * TYPE SCALE, by level rather than by eye:
 *   heading    LEVEL 3  the standard non-hero section heading
 *   names      LEVEL 4  the tier below it — these are names, like the OurTeam
 *                       group titles the level was drawn from
 *   quote      LEVEL 5  body copy
 *   role/tags  LEVEL 6  labels, which is exactly what a role line is
 *   browse all LEVEL 6  a label, deliberately NOT level 5 — it must sit
 *                       under the heading it shares a row with
 *
 * Nothing here hard-codes a font size.
 */

const NAVY = "#001A4D";

export interface FeaturedStory {
  image?: string;
  tags?: string[];
  name?: string;
  role?: string;
  quote?: string;
  href?: string;
}

export interface FeaturedStoriesData {
  heading?: string;
  browseLabel?: string;
  browseHref?: string;
  story?: FeaturedStory;
}

const FALLBACK_HEADING = "Featured Stories";
const FALLBACK_BROWSE = "Browse all stories";
const FALLBACK_STORY: FeaturedStory = {
  image: "/images/FoundersStory/mamaearth-founders.webp",
  tags: ["D2C", "Consumer Brand", "IPO 2023"],
  name: "Ghazal & Varun Alagh",
  role: "Co-Founders, Mamaearth",
  quote:
    "“We Left Our Careers, Put Everything Into A Baby-Care Brand Nobody Asked For, And Built It Into India's First D2C Company To List.”",
  href: "#",
};

/** Cursor-fill pill, matching the one on the blogs cards. */
function NavyPill({ label, href }: { label: string; href: string }) {
  const [origin, setOrigin] = useState("50% 50%");
  const [hovered, setHovered] = useState(false);

  const track = (e: React.MouseEvent<HTMLElement>, next: boolean) => {
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin(
      `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`
    );
    setHovered(next);
  };

  return (
    <Link
      href={href}
      onMouseEnter={(e) => track(e, true)}
      onMouseLeave={(e) => track(e, false)}
      className="relative inline-flex items-center justify-center overflow-hidden whitespace-nowrap rounded-full font-['Poppins',_sans-serif] font-medium transition-colors duration-300"
      style={{
        padding: "10px 26px",
        ...LABEL_STYLE,
        background: NAVY,
        border: `1px solid ${NAVY}`,
        color: hovered ? NAVY : "#fff",
      }}
    >
      <span
        className="absolute inset-0 bg-white transition-transform duration-[400ms] ease-out"
        style={{
          transformOrigin: origin,
          transform: hovered ? "scale(1)" : "scale(0)",
          borderRadius: "inherit",
        }}
      />
      <span className="relative z-10">{label}</span>
    </Link>
  );
}

export default function FeaturedStories({
  data,
}: {
  data?: FeaturedStoriesData | null;
}) {
  const heading = data?.heading || FALLBACK_HEADING;
  const browseLabel = data?.browseLabel || FALLBACK_BROWSE;
  const browseHref = data?.browseHref || "#";
  const story = data?.story || FALLBACK_STORY;

  return (
    <section
      className="relative w-full bg-[#FBF7F0]"
      style={{
        paddingTop: "var(--section-py)",
        paddingBottom: "var(--section-py)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col">
        {/* ── HEADING ROW ──
            `items-baseline` rather than `items-center`: the two sit on one
            line at wildly different sizes, and centring them would leave the
            small link floating against the middle of the heading's cap height
            instead of resting on its baseline. */}
        <motion.div
          className="flex w-full flex-wrap items-baseline justify-between"
          style={{ gap: "clamp(8px, 1.2vw, 20px)" }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2
            className={`m-0 text-[#0E0E0E] ${SECTION_HEADING_CLASS}`}
            style={SECTION_HEADING_STYLE}
          >
            {heading}
          </h2>
          <Link
            href={browseHref}
            className="font-['Poppins',_sans-serif] font-normal text-[#3d3d3d] underline-offset-4 transition-colors duration-300 hover:text-[#0E0E0E] hover:underline"
            style={LABEL_STYLE}
          >
            {browseLabel}
          </Link>
        </motion.div>

        {/* ── THE CARD ── */}
        <motion.div
          /* THE PICTURE IS 60% OF THE SIZE IT WAS, so the heading and the card
             sit in one screen together.

             Only the COLUMN WIDTH changes. The picture is `aspect-square`, so
             its height follows its width on its own — shrink one and the other
             shrinks with it, and the crop is untouched.

             Where 27.57% comes from: the split was `0.85fr / 1fr`, which gave
             the picture 0.85/1.85 = 45.95% of the card. Six tenths of that is
             27.57%. Written as a percentage rather than a recalculated `fr`
             because an `fr` has to be solved for (0.3806fr) and reads like a
             magic number; a percentage says outright what share of the card
             the picture takes. There is no column gap on this grid, so the two
             tracks are exactly 27.57% and the remainder. */
          className="grid w-full grid-cols-1 overflow-hidden bg-white md:grid-cols-[27.57%_minmax(0,1fr)]"
          style={{ marginTop: "clamp(24px, min(3vw, 4.4vh), 52px)" }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          {/* Portrait — SQUARE, the same 1/1 the story cards in the grid below
              carry, so the featured story reads as the same object at a larger
              size rather than a differently-shaped one.

              It was `4/3` on mobile and, on desktop, `h-full` with a
              min-height: no ratio at all up there, just a column stretched to
              whatever height the quote happened to need. That is why it drew a
              different rectangle on every story.

              `self-start` is what makes the ratio bind. A grid item stretches
              by default, which hands it a definite height from the row — and a
              definite height beats `aspect-ratio` outright, so the square would
              simply be ignored. Starting it instead lets its height come from
              its own width. The copy column still stretches and still centres
              itself against the row, so the two stay balanced. */}
          <div className="group relative w-full self-start overflow-hidden bg-[#EFEAE1] aspect-square">
            <Image
              src={story.image || FALLBACK_STORY.image!}
              alt={story.name || "Featured founder"}
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          <div
            className="flex flex-col justify-center"
            style={{
              padding: "clamp(22px, min(2.8vw, 4vh), 48px)",
              gap: "clamp(10px, 1.1vw, 18px)",
            }}
          >
            {!!story.tags?.length && (
              <div className="flex flex-wrap" style={{ gap: "clamp(6px, 0.7vw, 10px)" }}>
                {story.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center whitespace-nowrap rounded-full font-['Poppins',_sans-serif] font-normal text-[#1E2A5A]"
                    style={{
                      padding: "6px 16px",
                      ...LABEL_STYLE,
                      background: "#DEE6FB",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            <h3
              className={`m-0 font-semibold text-[#0E0E0E] ${SUBHEADING_CLASS}`}
              style={SUBHEADING_STYLE}
            >
              {story.name}
            </h3>

            <p
              className="m-0 font-['Poppins',_sans-serif] font-normal text-[#4a4a4a]"
              style={{ ...LABEL_STYLE, marginTop: "calc(-1 * clamp(6px, 0.7vw, 10px))" }}
            >
              {story.role}
            </p>

            <p
              className={`m-0 font-normal text-[#1a1a1a] ${HERO_BODY_CLASS}`}
              style={{ ...HERO_BODY_STYLE, marginTop: "clamp(4px, 0.6vw, 10px)" }}
            >
              {story.quote}
            </p>

            <div style={{ marginTop: "clamp(8px, 1vw, 16px)" }}>
              <NavyPill label="Read Full Story" href={story.href || "#"} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
