"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { StoryBlock } from "./FounderStoryBlocks";
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
 * THE FIXED HEADER of /foundersstory/[slug] — tags, headline, founders line
 * and hero image, in that order, on every story.
 *
 * Everything BELOW it is composed by the editor and rendered by
 * FounderStoryBlocks: the fact bar, the copy, the cream slabs, the figures and
 * the explore band are all blocks in one ordered list they can rearrange. Only
 * these four are fixed, because they are the story's identity rather than its
 * content — if they could be dragged, one story would open on a quote and the
 * next on a photo.
 *
 * TYPE SCALE, by level:
 *   headline            LEVEL 3
 *   founders line       LEVEL 5
 *   tags                LEVEL 6
 */

const NAVY = "#001A4D";
const CREAM = "#FBF7F0";
/** Shared reading column. Wider than the old 1040 so the level-3 headline
 *  sets in three lines rather than five. */
const COLUMN = "1200px";

const RISE = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/* ═══════════════════════════════════════════════════════════
   Shared type — mirrors one `founderStoryEntry` inside the single
   "Founders Story Page" document.
   ═══════════════════════════════════════════════════════════ */
export interface FounderStoryPageData {
  company?: string;
  slug?: string;
  tags?: string[];
  headline?: string;
  founders?: string;
  heroImage?: string;
  /** Everything below the header, in the order the editor arranged it. */
  blocks?: StoryBlock[];
}

/* ═══════════════════════════════════════════════════════════
   1. HEADER — tags, headline, founders, photo, fact bar
   ═══════════════════════════════════════════════════════════ */
export function FounderStoryHeader({ data }: { data: FounderStoryPageData }) {
  const { tags, headline, founders, company, heroImage } = data;

  // Nothing worth a section without at least a headline or a photo.
  if (!headline && !heroImage) return null;

  return (
    <section
      className="relative w-full bg-white"
      style={{
        paddingTop: "calc(var(--nav-height) + clamp(24px, min(3vw, 4.4vh), 56px))",
        paddingBottom: "var(--section-py)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <motion.div
        className="mx-auto flex w-full flex-col"
        style={{ maxWidth: COLUMN }}
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
      >
        {!!tags?.length && (
          <motion.div variants={RISE} className="flex flex-wrap" style={{ gap: "clamp(8px, 0.9vw, 14px)" }}>
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center whitespace-nowrap rounded-full font-['Poppins',_sans-serif] font-normal text-[#3d3d3d]"
                style={{ padding: "8px 20px", ...LABEL_STYLE, background: CREAM }}
              >
                {t}
              </span>
            ))}
          </motion.div>
        )}

        {headline && (
          <motion.h1
            variants={RISE}
            className={`m-0 text-[#0E0E0E] ${SECTION_HEADING_CLASS}`}
            style={{ ...SECTION_HEADING_STYLE, marginTop: "clamp(16px, min(1.8vw, 2.6vh), 30px)" }}
          >
            {headline}
          </motion.h1>
        )}

        {founders && (
          <motion.p
            variants={RISE}
            className={`m-0 font-normal text-[#3d3d3d] ${HERO_BODY_CLASS}`}
            style={{ ...HERO_BODY_STYLE, marginTop: "clamp(10px, min(1.1vw, 1.7vh), 18px)" }}
          >
            {founders}
            {company ? ` — ${company}` : ""}
          </motion.p>
        )}

        {heroImage && (
          <motion.div
            variants={RISE}
            className="relative w-full overflow-hidden bg-[#f0f0f0]"
            style={{
              marginTop: "clamp(24px, min(2.8vw, 4vh), 52px)",
              aspectRatio: "2 / 1",
              borderRadius: "2px",
            }}
          >
            <Image
              src={heroImage}
              alt={`Titan Capital - ${founders || company || "Founders"}`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1200px"
              className="object-cover object-center"
            />
          </motion.div>
        )}

      </motion.div>
    </section>
  );
}
