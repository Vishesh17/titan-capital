import type { CSSProperties } from "react";

/**
 * Single source of truth for the site's heading scale.
 *
 * Three levels, largest first. Every heading on the site is one of these —
 * nothing hard-codes a size, so the scale can't drift again.
 *
 *   LEVEL 1  HERO_HEADING_DARK   blue/navy hero headings      170px / 47px
 *   LEVEL 2  HERO_HEADING_LIGHT  white/cream hero headings    100px / 35px
 *   LEVEL 3  SECTION_HEADING     every non-hero section        78px / 27px
 *
 * (Rendered sizes are desktop at the 1728x1117 reference / mobile at 390px.)
 *
 * Scope: all pages EXCEPT /titanSeedFund, /winnersFund and /beyondTheCheque,
 * which keep their own treatment.
 *
 * What lives here: the type *scale* — family, weight, size, line-height, case.
 * What does not: colour and alignment. Both are contextual (white on the dark
 * heroes, #0E0E0E on the light ones; centred in some sections, left in others)
 * and stay with the section that owns them.
 *
 * Each level is split in two because these components set geometry through
 * inline `style` and everything else through Tailwind classes:
 *   *_CLASS  → className   (family, weight, case, and the mobile override)
 *   *_STYLE  → style       (desktop size + line-height)
 *
 * The mobile size lives in *_CLASS as a `max-md:!` variant rather than in
 * *_STYLE, because an inline style would beat any class and there is no media
 * query available inside a style object.
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

/* LEVEL 1 — the largest type on the site. */
export const HERO_HEADING_DARK_CLASS =
  "font-['Poppins',_sans-serif] font-black uppercase " +
  "max-md:!text-[clamp(36px,12vw,50px)] max-md:!leading-[96%]";

export const HERO_HEADING_DARK_STYLE: CSSProperties = {
  fontSize: "min(9.88vw, 15.2vh)",
  lineHeight: "86%",
};

/* LEVEL 2 — steps down from level 1 on both breakpoints. */
export const HERO_HEADING_LIGHT_CLASS =
  "font-['Poppins',_sans-serif] font-bold uppercase " +
  "max-md:!text-[clamp(30px,9vw,46px)] max-md:!leading-[128%]";

export const HERO_HEADING_LIGHT_STYLE: CSSProperties = {
  fontSize: "clamp(36px, min(6.6vw, 9vh), 112px)",
  lineHeight: "124%",
};

/* ── Mobile sizes, as style objects ────────────────────────────────────
   These MIRROR the `max-md:` values in the two _CLASS strings above and
   must be changed together. They can't be derived from each other:
   Tailwind needs a literal string at build time, so the class variant
   can't read a constant.

   Use these only where a hero's mobile layout switches at a breakpoint
   other than `md` — OurTeamHero swaps its grid at `lg` (1024px), so the
   `max-md:` variant would leave 768-1023px with no size at all.
   ──────────────────────────────────────────────────────────────────────── */

export const HERO_HEADING_DARK_MOBILE_STYLE: CSSProperties = {
  fontSize: "clamp(36px, 12vw, 50px)",
  lineHeight: "96%",
};

export const HERO_HEADING_LIGHT_MOBILE_STYLE: CSSProperties = {
  fontSize: "clamp(30px, 9vw, 46px)",
  lineHeight: "128%",
};

/* ── Description ───────────────────────────────────────────────────────
   One spec for every hero, dark and light alike — no variants.

   The `clamp` floor and ceiling matter: without them the size tracks the
   viewport without limit, which is what the homepage hero used to do.
   ──────────────────────────────────────────────────────────────────────── */

/* NO font-weight. Levels 4-7 carry size only; each section picks its own
   weight at the call site. Levels 1-3 keep their weights, because those are
   the fixed display sizes and must not drift. */
/* The mobile override is +15% on the 14.2px this clamp resolves to on a
   phone (the fluid term is tiny there, so the floor always wins). It has to
   be a `max-md:!` class rather than a value in HERO_BODY_STYLE: that style
   object is applied inline at every call site, and only an !important class
   beats an inline style. 16.33px still sits below level 4's 21px and above
   level 6's 12px, so the order holds. */
export const HERO_BODY_CLASS =
  "font-['Poppins',_sans-serif] leading-[1.6] max-md:!text-[16.33px]";

export const HERO_BODY_STYLE: CSSProperties = {
  // Every term scaled +10% together — floor, both fluid terms, and ceiling.
  // Bumping only the fluid part would leave the clamp ends behind, so the
  // increase would silently vanish on small and large screens where the
  // clamp, not the viewport, is deciding the size.
  //   14 -> 15.4   1.6vw -> 1.76vw   2.35vh -> 2.59vh   20 -> 22
  fontSize: "clamp(14.2px, min(1.60vw, 2.44vh), 20px)",
};

/* ── LEVEL 5 — descriptions ────────────────────────────────────────────
   HERO_BODY above is level 5. It started as the hero-description spec and
   is now every description on the site: card copy, stat labels, FAQ
   questions, footer nav, founder names. The name is kept because eleven
   files already import it.

   Renders 20px on desktop and 14px on mobile — the clamp handles both
   ends, so there is no `max-md:` variant to keep in sync.

   BODY_BOLD is the same size at weight 600, for the entries called out as
   bold: the How We Show Up sub-sub headings, the portfolio filter labels,
   the footer's About/Portfolio/Perspective, team names, and the emphasised
   spans in Origin Story. 600 rather than 500 so it reads as heavier than
   body copy without colliding with level 4, which is 500.
   ──────────────────────────────────────────────────────────────────────── */

export const BODY_BOLD_CLASS =
  "font-['Poppins',_sans-serif] font-semibold leading-[1.6]";

/* ── LEVEL 6 — labels ──────────────────────────────────────────────────
   The smallest tier: button labels, form fields and their labels, filter
   values, bullet lists, captions, founder roles, footer legal links.

   SIZE ONLY. Unlike levels 1-5 this ships no class — no family, weight,
   line-height or colour — because these elements are visually varied by
   design and only their size needed unifying. Apply it by replacing the
   element's `fontSize` and nothing else.

   Taken from the Indicorn Spotlight bullets, `min(1.39vw, 2.15vh)`, with
   bounds added. The bounds are not optional: the reference has no ceiling,
   so past ~1512px it overtakes level 5 (24.0px vs 22.0px at 1728x1117) and
   the two levels invert. 18px holds it just under level 5's 22px ceiling
   at every viewport; 13px keeps it legible on the 932x187 strip, where the
   raw value collapses to 4px.
   ──────────────────────────────────────────────────────────────────────── */

export const LABEL_STYLE: CSSProperties = {
  fontSize: "clamp(12px, min(1.26vw, 2.0vh), 17px)",
};

/* ── LEVEL 3 — section headings ────────────────────────────────────────
   The main heading of every non-hero section: "What We Believe", "How We
   Show Up", "Their Stories, Our Credentials", and so on.

   Not uppercase, unlike the two hero levels — these read as sentences
   ("What We Believe"), and forcing caps at this size turns them into a
   second banner competing with the hero.

   Line-height is 130% on desktop and 120% on mobile. Tighter on small
   screens because these headings wrap to two or three lines there, where
   desktop mostly fits them on one.
   ──────────────────────────────────────────────────────────────────────── */

export const SECTION_HEADING_CLASS =
  "font-['Poppins',_sans-serif] font-semibold " +
  "max-md:!text-[clamp(24px,7vw,28px)] max-md:!leading-[120%]";

export const SECTION_HEADING_STYLE: CSSProperties = {
  fontSize: "min(4.51vw, 6.98vh)",
  lineHeight: "130%",
};

/* ── LEVEL 4 — subheadings ─────────────────────────────────────────────
   The tier below a section heading: the row titles in How We Show Up,
   the What We Believe card titles, founder names, the OurTeam group
   titles, the footer email.

   Taken from How We Show Up's opened card, which is the reference on
   both breakpoints — the vertical title on desktop (48px) and the same
   `row.title` rendered as an h2 in the mobile modal (32px).

   Weight is 500, a deliberate step up from the reference's 400: most of
   these are names and labels that lose too much presence at 400.

   No `capitalize`. The reference carries it, but it is a no-op there
   ("The Ecosystem" is already title case) and applying it site-wide
   would rewrite real copy — "info@titancapital.vc" renders as
   "Info@titancapital.vc", and sentence-case subtitles become Title Case.
   ──────────────────────────────────────────────────────────────────────── */

/* NO font-weight — see the note on HERO_BODY_CLASS. Sections set their own.
 *
 * The mobile size was a flat 32px, which put level 4 ABOVE level 3 on small
 * screens (32px against level 3's 27px) — the scale inverted at the exact
 * place it is supposed to step down. It is now 20-24px, which sits between
 * level 3 (24-28px) and level 5 (14-20px) so the order holds on mobile the
 * same way it does on desktop. */
export const SUBHEADING_CLASS =
  "font-['Poppins',_sans-serif] " +
  "max-md:!text-[clamp(20px,5.6vw,24px)] max-md:!leading-[120%]";

export const SUBHEADING_STYLE: CSSProperties = {
  fontSize: "min(2.78vw, 4.30vh)",
  lineHeight: "120%",
};

/** Mirrors the `max-md:` half of SUBHEADING_CLASS — see the note above
 *  HERO_HEADING_DARK_MOBILE_STYLE for why both forms have to exist. Used
 *  by the footer, whose layout switches at `lg`, not `md`. */
export const SUBHEADING_MOBILE_STYLE: CSSProperties = {
  fontSize: "clamp(20px, 5.6vw, 24px)",
  lineHeight: "120%",
};

/* ── LEVEL 7 — the smallest tier ───────────────────────────────────────
   Below level 6: legal lines, image credits, footnotes, micro-labels.

   SIZE ONLY, exactly like level 6 — no family, weight, line-height or
   colour, because these too are visually varied by design.

   Bounds are not optional, for the same reason level 6's are not: the
   fluid term alone would overtake level 6 on large screens and collapse to
   a few pixels on the 932x187 strip. 14px keeps it under level 6's 17px
   ceiling at every viewport; 10px keeps it legible at the floor, where
   level 6 sits at 12px. */
export const CAPTION_STYLE: CSSProperties = {
  fontSize: "clamp(10px, min(1.05vw, 1.65vh), 14px)",
};
