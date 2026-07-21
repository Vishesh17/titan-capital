"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/* ─────────────────────────────────────────────────────────
   HeroBackedBg — cappen.com-style staged background transition
   across Hero → Backed Before → How We Show Up.

   Timing (all off the raw window scroll, in viewport-height units):

     1. The hero fades OUT (briefly pinned) while the background eases
        navy → WHITE. Backed Before + How We Show Up rise and fade in
        together, timed so that by the moment WHITE is fully in they
        already cover ~70% of the screen height (they don't lag behind
        an empty white screen).
     2. AFTER everything has arrived, How We Show Up eases white →
        BEIGE (a beige layer scoped to How We Show Up only), while
        Backed Before stays on WHITE.

   The navy→white surface is two stacked full-zone layers (navy base +
   white) crossfaded by opacity; the beige is a separate layer behind
   How We Show Up alone. Driving everything off raw scroll (mapped to
   vh fractions + measured element Ys) is guaranteed monotonic — a
   target+offset useScroll on a sticky child fought Lenis and glitched.
   ───────────────────────────────────────────────────────── */

const NAVY = "#000c22"; // matches the hero's original background
const WHITE = "#ffffff";
const BEIGE = "#FBF7F0"; // matches How We Show Up's own background

/* Hero pin-track height. The extra over 100vh (here 20vh) is the pinned
   dwell over which the hero fades out; kept short so the content group
   rises into view promptly (see the 70%-by-white-in requirement). */
const HERO_TRACK_VH = 120;

export default function HeroBackedBg({
  hero,
  backed,
  howWeShow,
}: {
  hero: ReactNode;
  backed: ReactNode;
  howWeShow: ReactNode;
}) {
  const { scrollY } = useScroll();
  const [vh, setVh] = useState(800);

  /* Measured doc-Y of the content group top (Backed Before) and the
     Backed Before ↔ How We Show Up seam. */
  const groupRef = useRef<HTMLDivElement>(null);
  const seamRef = useRef<HTMLDivElement>(null);
  const [groupY, setGroupY] = useState((HERO_TRACK_VH / 100) * 800);
  const [seamY, setSeamY] = useState((HERO_TRACK_VH / 100) * 800 + 300);
  useEffect(() => {
    const measure = () => {
      setVh(window.innerHeight);
      if (groupRef.current) {
        setGroupY(groupRef.current.getBoundingClientRect().top + window.scrollY);
      }
      if (seamRef.current) {
        setSeamY(seamRef.current.getBoundingClientRect().top + window.scrollY);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    const t = setTimeout(measure, 600);
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(measure);
    }
    return () => {
      window.removeEventListener("resize", measure);
      clearTimeout(t);
    };
  }, []);

  /* Hero fades out (pinned) → navy→white. White finishes at 0.9 vh; the
     content group top is at HERO_TRACK_VH (120vh), so at scroll 0.9 vh it
     sits at viewport y = 120vh − 90vh = 0.3 vh from the top → it already
     covers the lower 70% of the screen. */
  const heroOpacity = useTransform(scrollY, [0.02 * vh, 0.18 * vh], [1, 0]);
  const whiteOpacity = useTransform(scrollY, [0.35 * vh, 0.9 * vh], [0, 1]);

  /* Backed Before + How We Show Up fade in together as the group rises —
     fully opaque well before white finishes, so they're solid at 70%. */
  const contentOpacity = useTransform(
    scrollY,
    [groupY - 1.0 * vh, groupY - 0.55 * vh],
    [0, 1],
  );

  /* AFTER arrival: white → beige, scoped to How We Show Up only (Backed
     Before, above the seam, keeps the white backdrop). */
  const beigeOpacity = useTransform(
    scrollY,
    [seamY - 0.6 * vh, seamY + 0.05 * vh],
    [0, 1],
  );

  return (
    <div className="relative">
      {/* ── navy base + white (full-zone) ── */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="absolute inset-0" style={{ background: NAVY }} />
        <motion.div
          className="absolute inset-0"
          style={{ background: WHITE, opacity: whiteOpacity }}
        />
      </div>

      {/* ── Content (transparent) on top ── */}
      <div className="relative z-[1]">
        {/* Hero pin — content fades out while briefly pinned. */}
        <div style={{ height: `${HERO_TRACK_VH}vh` }}>
          <div className="sticky top-0 h-screen overflow-hidden">
            <motion.div
              style={{ opacity: heroOpacity }}
              className="h-full w-full"
            >
              {hero}
            </motion.div>
          </div>
        </div>

        {/* Backed Before + How We Show Up — one group, fade in together. */}
        <motion.div ref={groupRef} style={{ opacity: contentOpacity }}>
          {backed}
          <div ref={seamRef} aria-hidden />
          {/* How We Show Up carries its OWN beige layer, so only it turns
              beige — Backed Before stays white. */}
          <div className="relative">
            <motion.div
              className="pointer-events-none absolute inset-0"
              aria-hidden
              style={{ background: BEIGE, opacity: beigeOpacity }}
            />
            <div className="relative">{howWeShow}</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
