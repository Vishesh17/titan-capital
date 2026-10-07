"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import RichText, { hasRichText, type RichTextValue } from "@/components/ui/RichText";
import { motion } from "framer-motion";
import {
  HERO_HEADING_DARK_CLASS,
  HERO_HEADING_DARK_STYLE,
  HERO_BODY_CLASS,
  HERO_BODY_STYLE,
} from "@/styles/heroTypography";

/**
 * /titanecosystem page hero.
 *
 * Heading, a stack of overlapping founder avatars with a count beside them,
 * and a description. Black type on white.
 *
 * HEADING LEVEL 1 (HERO_HEADING_DARK_*), in black rather than the white this
 * level usually carries — the level is the type scale, the colour is the
 * section's own.
 *
 * IT IS ALWAYS TWO LINES, and that takes measuring rather than trusting.
 * Level 1 is 170px at 1728x1117, where "Cheque Comes With" wants 1856px of
 * one-line width against a 1440px column — so it wrapped, and the heading set
 * in three lines with the phrase "Titan Cheque" split across two of them.
 * `text-balance` cannot help: the line does not fit at any balance point.
 *
 * So the size is FITTED. Each line is measured at level 1 against the column
 * it has to live in, and the heading is scaled down by exactly the shortfall —
 * no further. Level 1 wherever level 1 fits, the largest size that holds two
 * lines everywhere else, whatever the editor types into Sanity.
 *
 * The description is LEVEL 5 (HERO_BODY_*), the standard description size.
 */

/* ─────────────────────────────────────────────────────────
   Sanity contract. Every field is optional — whatever the CMS
   doesn't supply falls back to the constants below, so the
   section never renders empty.
   ───────────────────────────────────────────────────────── */
export interface TitanEcosystemHeroData {
  headingLineOne?: string;
  headingLineTwo?: string;
  founderCountLabel?: string;
  founderAvatars?: string[];
  description?: string;
}

const FALLBACK_HEADING_LINE_ONE = "More Than Capital,";
const FALLBACK_HEADING_LINE_TWO = "A Community";
const FALLBACK_FOUNDER_COUNT = "500+ founders";
/* NO FALLBACK DESCRIPTION — see the note in BlogsHeroClient. Empty in the
   Studio renders nothing, rather than substituting a sentence the editor never
   wrote and cannot see in the CMS. */

/**
 * How many circles to draw when the CMS has no photos yet. They render as the
 * flat #D9D9D9 the design specifies as the image's backing colour, so an empty
 * state still reads as the stack rather than as a gap.
 */
const PLACEHOLDER_AVATARS = 5;

/**
 * Avatar geometry. The design gives a flat 65px square; the site's rule is
 * that fixed pixel sizes become `min(vw, vh)` against the 1728x1117 reference
 * so they shrink on small and SHORT screens alike. 65px is 3.76vw / 5.82vh
 * there, so this resolves to exactly 65px at the reference and is capped so it
 * can never grow past the spec on a large monitor.
 */
const AVATAR_SIZE = "clamp(38px, min(3.76vw, 5.82vh), 65px)";
/** Overlap. Negative margin on every circle but the first. */
const AVATAR_OVERLAP = "calc(-0.34 * clamp(38px, min(3.76vw, 5.82vh), 65px))";

/* House motion: cubic-bezier(0.22, 1, 0.36, 1), unhurried, layered. */
const EASE = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.08 } },
};
const rise = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
};

export default function TitanEcosystemHeroClient({
  data,
}: {
  data?: TitanEcosystemHeroData | null;
}) {
  const headingLineOne = data?.headingLineOne || FALLBACK_HEADING_LINE_ONE;
  const headingLineTwo = data?.headingLineTwo || FALLBACK_HEADING_LINE_TWO;
  const founderCountLabel = data?.founderCountLabel || FALLBACK_FOUNDER_COUNT;
  const hasDescription = hasRichText(data?.description);

  /* `null` means "draw the grey placeholder circle". Filtering out empty
     entries first stops a half-filled CMS array rendering a broken image. */
  const avatars: (string | null)[] =
    data?.founderAvatars && data.founderAvatars.filter(Boolean).length > 0
      ? data.founderAvatars.filter(Boolean)
      : Array.from({ length: PLACEHOLDER_AVATARS }, () => null);

  /* ── FIT THE HEADING TO ITS COLUMN ──
     `fit` is how much level 1 has to shrink for the longest line to stay on
     one line: 1 when it already fits, less when it does not.

     Measured on a DETACHED PROBE rather than on the heading itself. Measuring
     the live element would mean resetting its size, reading it, then setting a
     new size — and the ResizeObserver watching it would see that change and
     run again, forever. The probe is a copy at the unfitted size, so reading it
     disturbs nothing. */
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [fit, setFit] = useState(1);

  const measure = useCallback(() => {
    const el = headingRef.current;
    if (!el) return;
    /* Below `md` the class carries an !important font size that beats the
       inline style, and the lines are allowed to wrap — nothing to fit. */
    if (window.matchMedia("(max-width: 767px)").matches) {
      setFit(1);
      return;
    }
    const avail = el.clientWidth;
    if (!avail) return;

    const probe = document.createElement("span");
    const cs = getComputedStyle(el);
    Object.assign(probe.style, {
      position: "absolute",
      visibility: "hidden",
      whiteSpace: "nowrap",
      pointerEvents: "none",
      fontFamily: cs.fontFamily,
      fontWeight: cs.fontWeight,
      letterSpacing: cs.letterSpacing,
      textTransform: cs.textTransform,
      // The UNFITTED size, so the ratio below is measured against level 1.
      fontSize: HERO_HEADING_DARK_STYLE.fontSize as string,
    });
    // Inside the heading's parent, so `vw`/`vh` in that size resolve the same.
    el.parentElement?.appendChild(probe);
    let widest = 0;
    for (const line of [headingLineOne, headingLineTwo]) {
      probe.textContent = line;
      widest = Math.max(widest, probe.getBoundingClientRect().width);
    }
    probe.remove();

    setFit(widest > 0 ? Math.min(1, avail / widest) : 1);
  }, [headingLineOne, headingLineTwo]);

  useLayoutEffect(measure, [measure]);

  useEffect(() => {
    /* The heading's own width is set by the column, not by its font size, so
       watching it here cannot feed back into the size we set. */
    const el = headingRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    /* Fonts land after first paint and are wider than the fallback — without
       this the fit is computed against the wrong metrics and stays there. */
    document.fonts?.ready.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, [measure]);

  const fittedFontSize =
    fit < 1
      ? { fontSize: `calc(${HERO_HEADING_DARK_STYLE.fontSize} * ${fit.toFixed(4)})` }
      : {};

  return (
    <section
      className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-white"
      style={{
        /* The white background starts at the very top so it fills behind the
           transparent navbar; content clears the nav with paddingTop. */
        minHeight: "78svh",
        paddingTop: "calc(var(--nav-height) + var(--section-py))",
        paddingBottom: "var(--section-py)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <motion.div
        className="mx-auto flex w-full max-w-[1440px] flex-col items-center text-center"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {/* ── HEADING ──
            Two fields rather than one string with a line break, so the two
            lines can never collapse onto one at an awkward width.

            EACH LINE IS ITS OWN BLOCK, not two runs either side of a <br>.
            The <br> form made the heading's text "What A TitanCheque Comes
            With" — no space where the break was — which is what a screen
            reader announced and what came out on copy. Separate blocks carry
            the break in the structure instead of relying on a character. */}
        {/* `w-full` is not decoration. The parent centres its children on the
            cross axis, so a heading holding `nowrap` lines would be sized by
            its own content — it grew to 1856px, past the 1440px column, and
            the section's `overflow-hidden` quietly clipped both ends. Pinned
            to the column, its width is the space the text has to fit INTO,
            which is exactly what the fit above measures against. */}
        <motion.h1
          ref={headingRef}
          variants={rise}
          className={`m-0 w-full text-[#0E0E0E] ${HERO_HEADING_DARK_CLASS}`}
          style={{ ...HERO_HEADING_DARK_STYLE, ...fittedFontSize }}
        >
          <span data-hero-line className="block md:whitespace-nowrap">
            {headingLineOne}
          </span>
          {/* A real space between the two lines. Adjacent block boxes render
              the same either way, but without it the heading's text value is
              "What A TitanCheque Comes With" — which is what gets announced
              and what gets copied. Whitespace between blocks is dropped in
              layout, so this costs nothing visually. */}
          {" "}
          <span data-hero-line className="block md:whitespace-nowrap">
            {headingLineTwo}
          </span>
        </motion.h1>

        {/* ── FOUNDER COUNT ──
            The avatars are decorative and carry no names, so the stack is
            hidden from assistive tech and the count alone conveys it. */}
        <motion.div
          variants={rise}
          className="flex items-center justify-center"
          style={{
            marginTop: "clamp(16px, min(1.9vw, 2.9vh), 33px)",
            gap: "clamp(10px, min(1.1vw, 1.7vh), 19px)",
          }}
        >
          <div aria-hidden className="flex items-center">
            {avatars.map((src, i) => (
              <div
                key={i}
                className="shrink-0 rounded-full bg-[#D9D9D9] bg-cover bg-center bg-no-repeat"
                style={{
                  width: AVATAR_SIZE,
                  height: AVATAR_SIZE,
                  backgroundImage: src ? `url(${src})` : undefined,
                  marginLeft: i === 0 ? 0 : AVATAR_OVERLAP,
                  /* Each circle sits above the one to its right, so the stack
                     reads left-to-right the way the design shows it. */
                  zIndex: avatars.length - i,
                  /* A white ring keeps the overlapping edges legible against
                     one another; without it the faces merge into a blob. */
                  boxShadow: "0 0 0 2px #FFFFFF",
                }}
              />
            ))}
          </div>

          <span
            className={`font-medium text-[#0E0E0E] ${HERO_BODY_CLASS}`}
            style={HERO_BODY_STYLE}
          >
            {founderCountLabel}
          </span>
        </motion.div>

        {/* ── DESCRIPTION ── */}
        {/* Omitted entirely when empty, not rendered empty — the marginTop
            below belongs to this block, so an empty one would leave a gap
            under the heading with nothing in it. */}
        {hasDescription && (
          <motion.div
            variants={rise}
            className={`m-0 font-normal text-[#0E0E0E] ${HERO_BODY_CLASS}`}
            style={{
              ...HERO_BODY_STYLE,
              marginTop: "clamp(18px, min(2.2vw, 3.4vh), 38px)",
              /* Caps the measure so the copy stays readable on wide monitors
                 instead of running the full 1440px container. */
              maxWidth: "min(1040px, 100%)",
            }}
          >
            <RichText value={data?.description} />
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
