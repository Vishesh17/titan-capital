"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { HERO_BODY_STYLE, CAPTION_STYLE } from "@/styles/heroTypography";
import type { FounderStory } from "./ImpactAtGlanceClient";

/**
 * The card used by the /foundersstory grid.
 *
 * A SECOND card, deliberately — not an edit of ImpactAtGlanceClient's
 * StoryCard. That one is still what the home page's "Their Stories" section
 * renders, and it works differently: a rotating tag pill top-left, everything
 * else hidden until hover. Changing it in place would have silently rewritten
 * the home page too.
 *
 * This one shows everything at rest, as designed:
 *   - the company logo in the TOP-LEFT corner
 *   - the quote across the bottom, centred
 *
 * The grid, the gaps and the scroll-drawn dividers around it are untouched.
 */

function cdnImageSrc(url: string, width: number): string {
  return url.startsWith("https://cdn.sanity.io/")
    ? `${url}?w=${width}&auto=format&q=85`
    : url;
}

function deriveCompany(story: FounderStory): string {
  const role = story.role || "";
  if (role.includes(",")) return role.split(",").pop()!.trim();
  const m = role.match(/\bof\s+(.+)$/i);
  if (m) return m[1].trim();
  return story.name;
}

/**
 * THE LOGO CROP.
 *
 * Every mark is a 400x400 canvas, and measuring all six shows they share one
 * convention exactly:
 *
 *     ink spans the FULL canvas width           x: 0 -> 400, all six
 *     ink is a vertically CENTRED band          worst offset 0.0012 of canvas
 *     band height varies                        0.133 (mamaearth) -> 0.305 (Shadowfax)
 *
 * So sizing by `height` sizes the CANVAS, not the mark — which is why the
 * logos came out at wildly different visual sizes, each floating at its own
 * height. Sizing by WIDTH is correct instead: the designer already normalised
 * these to a common width, and matching that respects it.
 *
 * The wrapper then crops away the dead band. Its height is the TALLEST mark's
 * band, and the image is pulled up so the canvas's centre line meets the
 * wrapper's — which lands every mark on the same top-left origin regardless of
 * how tall its own band is.
 *
 * THIS DELIBERATELY DOES NOT KEY OFF THE FILENAME. The live data is Sanity, so
 * `story.logo` is a CDN URL like `production/<hash>-400x400.png` — a lookup
 * table of local filenames silently matches nothing and every logo falls
 * through to the fallback. The crop above needs no per-logo constants, so it
 * works the same for a CDN URL as for a local file.
 *
 * The home page's StoryCard still uses `logoScale` / `logoOffsetY` against a
 * bottom-left anchor; those are untouched and stay its business.
 */
/** Tallest measured band, as a fraction of the canvas. */
const LOGO_BAND = 0.305;
/** Pull needed to bring the canvas centre to the crop centre, as a % of the
 *  image's own height. The image is square, so this is a % of its width too. */
const LOGO_PULL = `-${(((1 - LOGO_BAND) / 2) * 100).toFixed(2)}%`;
/** Mark width. Every logo renders at exactly this. */
const LOGO_W = "clamp(104px, min(10.4vw, 16vh), 180px)";

function CardLogo({ story, company }: { story: FounderStory; company: string }) {
  if (!story.logo) {
    return (
      <span
        className="whitespace-nowrap font-['Poppins',_sans-serif] font-semibold uppercase text-white max-md:!text-[18px]"
        style={{ fontSize: "min(1.7vw, 2.6vh)", lineHeight: "150%" }}
      >
        {company}
      </span>
    );
  }

  return (
    <div
      className="overflow-hidden max-md:!w-[92px]"
      style={{ width: LOGO_W, height: `calc(${LOGO_W} * ${LOGO_BAND})` }}
    >
      <img
        src={cdnImageSrc(story.logo, 400)}
        alt={`${company} – Titan Capital portfolio company`}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          transform: `translateY(${LOGO_PULL})`,
          filter: "brightness(0) invert(1)",
        }}
      />
    </div>
  );
}

export default function FounderQuoteCard({ story }: { story: FounderStory }) {
  const company = deriveCompany(story);

  return (
    <motion.div
      className="group relative w-full cursor-pointer overflow-hidden"
      style={{ borderRadius: "2px", aspectRatio: "1 / 1" }}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.4 },
        },
      }}
    >
      <Image
        src={cdnImageSrc(story.image, 900)}
        alt={`Titan Capital - ${story.name}`}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="scale-100 object-cover object-top transition-transform duration-700 group-hover:scale-[1.05]"
      />

      {/* Scrim. Two jobs, so two stops: a light wash at the top to hold the
          logo, and a much heavier foot to carry four lines of quote. The
          middle is left clear so the portrait is not veiled across the face. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(12,16,28,0.42) 0%, rgba(12,16,28,0.10) 22%, rgba(12,16,28,0) 40%, rgba(12,16,28,0.55) 70%, rgba(12,16,28,0.88) 100%)",
        }}
      />

      {/* ── LOGO, top-left ── */}
      <div
        className="absolute z-10 max-md:!left-[16px] max-md:!top-[16px]"
        style={{ left: "min(1.85vw, 2.86vh)", top: "min(1.85vw, 2.86vh)" }}
      >
        <CardLogo story={story} company={company} />
      </div>

      {/* ── QUOTE, across the foot ── */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center max-md:!px-[16px] max-md:!pb-[18px]"
        style={{
          padding: "min(1.85vw, 2.86vh)",
          gap: "min(0.6vw, 0.95vh)",
        }}
      >
        <p
          /* Level 5, at 600. The quote is the card's whole message here, where
             on the home-page card it is a supporting line revealed on hover —
             so it takes body size rather than the label size used there.
             Centred, and balanced so the last line is not left a runt. */
          className="m-0 text-center font-['Poppins',_sans-serif] font-semibold text-white"
          style={{
            ...HERO_BODY_STYLE,
            lineHeight: 1.42,
            textWrap: "balance",
          }}
        >
          {story.text}
        </p>
        {/* Attribution — level 7, a clear step below the quote. */}
        <p
          className="m-0 text-center font-['Poppins',_sans-serif] font-medium text-white/70"
          style={{ ...CAPTION_STYLE, lineHeight: "150%" }}
        >
          {story.name}, {story.role}
        </p>
      </div>
    </motion.div>
  );
}
