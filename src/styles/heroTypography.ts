import type { CSSProperties } from "react";

/**
 * Single source of truth for hero typography.
 *
 * Every hero section imports from here instead of hard-coding sizes, so the
 * scale can't drift again. Before this file the eight heroes carried five
 * different heading specs and four different description specs.
 *
 * Scope: hero sections only. The Titan Seed Fund and Winners Fund pages are
 * intentionally excluded and keep their own treatment.
 *
 * What lives here: the type *scale* — family, weight, size, line-height, case.
 * What does not: colour. Colour is contextual (white on the dark heroes,
 * #0E0E0E on the light ones) and stays with the section that owns it.
 *
 * Each token is split in two because these components set geometry through
 * inline `style` and everything else through Tailwind classes:
 *   *_CLASS  → className
 *   *_STYLE  → style
 */

/* ── Heading ───────────────────────────────────────────────────────────
   Two variants, chosen by hero background.

   DARK  — white type over navy/black. Heavy display weight, tight leading.
   LIGHT — dark type over cream/white. Steps down to bold at a smaller size
           with more open leading; black-900 at 9.88vw on cream reads as a
           slab and overpowers the page.

   The variants exist because the two backgrounds genuinely need different
   optical weight, not because of drift. Pick by background, never by page.
   ──────────────────────────────────────────────────────────────────────── */

export const HERO_HEADING_DARK_CLASS =
  "font-['Poppins',_sans-serif] font-black uppercase max-md:!text-[32px]";

export const HERO_HEADING_DARK_STYLE: CSSProperties = {
  fontSize: "min(9.88vw, 15.2vh)",
  lineHeight: "86%",
};

export const HERO_HEADING_LIGHT_CLASS =
  "font-['Poppins',_sans-serif] font-bold uppercase";

export const HERO_HEADING_LIGHT_STYLE: CSSProperties = {
  fontSize: "clamp(36px, min(6.6vw, 9vh), 112px)",
  lineHeight: "124%",
};

/* ── Description ───────────────────────────────────────────────────────
   One spec for every hero, dark and light alike — no variants.

   The `clamp` floor and ceiling matter: without them the size tracks the
   viewport without limit, which is what the homepage hero used to do.
   ──────────────────────────────────────────────────────────────────────── */

export const HERO_BODY_CLASS =
  "font-['Poppins',_sans-serif] font-normal leading-[1.6]";

export const HERO_BODY_STYLE: CSSProperties = {
  fontSize: "clamp(14px, min(1.6vw, 2.35vh), 20px)",
};
