"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform, cubicBezier } from "framer-motion";

/* ─────────────────────────────────────────────────────────
   HeroBackedBg — Fluent scroll with pause on Backed Before
   
   1. Hero smoothly fades on scroll (no pause in hero)
   2. Backed Before + How We Show Up rise up
   3. PAUSE: content stays visible for 1-2 scrolls
   4. Then scroll continues normally
   ───────────────────────────────────────────────────────── */

const NAVY = "#000c22";
const WHITE = "#ffffff";
const BEIGE = "#FBF7F0";

/* Scroll track for hero: just enough for smooth fade, no pause */
const HERO_TRACK_VH = 100;

/* Extra scroll height AFTER Backed Before appears - this creates the pause */
const CONTENT_DWELL_VH = 150;

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

  /* SMOOTH EASE for all transitions */
  const SMOOTH_EASE = cubicBezier(0.4, 0, 0.2, 1);
  
  /* Hero fades smoothly on scroll - no pause, just fluid transition */
  const heroOpacity = useTransform(
    scrollY,
    [0, 0.6 * vh],
    [1, 0],
    { ease: SMOOTH_EASE }
  );
  
  const heroScale = useTransform(
    scrollY,
    [0, 0.5 * vh],
    [1, 0.96],
    { ease: SMOOTH_EASE }
  );

  /* Background: navy → white synced with hero fade */
  const whiteOpacity = useTransform(
    scrollY,
    [0.2 * vh, 0.8 * vh],
    [0, 1],
    { ease: SMOOTH_EASE }
  );

  /* Content fades in smoothly as hero fades out */
  const contentOpacity = useTransform(
    scrollY,
    [groupY - 0.8 * vh, groupY - 0.2 * vh],
    [0, 1],
    { ease: SMOOTH_EASE }
  );

  /* Beige transition for How We Show Up section */
  const beigeOpacity = useTransform(
    scrollY,
    [seamY - 0.5 * vh, seamY + 0.1 * vh],
    [0, 1],
    { ease: SMOOTH_EASE }
  );

  return (
    <div className="relative">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="absolute inset-0" style={{ background: NAVY }} />
        <motion.div
          className="absolute inset-0"
          style={{ background: WHITE, opacity: whiteOpacity }}
        />
      </div>

      {/* Content */}
      <div className="relative z-[1]">
        {/* Hero section - pinned, smooth fade, no pause */}
        <div style={{ height: `${HERO_TRACK_VH}vh` }}>
          <div className="sticky top-0 h-screen overflow-hidden">
            <motion.div
              style={{ opacity: heroOpacity, scale: heroScale }}
              className="h-full w-full"
            >
              {hero}
            </motion.div>
          </div>
        </div>

        {/* Backed Before + How We Show Up with dwell/pause after they appear */}
        <motion.div ref={groupRef} style={{ opacity: contentOpacity }}>
          {backed}
          <div ref={seamRef} aria-hidden />
          <div className="relative">
            <motion.div
              className="pointer-events-none absolute inset-0"
              aria-hidden
              style={{ background: BEIGE, opacity: beigeOpacity }}
            />
            <div className="relative">{howWeShow}</div>
          </div>
          {/* DWELL SPACER: creates 1-2 scroll pause after content appears */}
          <div aria-hidden style={{ height: `${CONTENT_DWELL_VH}vh` }} />
        </motion.div>
      </div>
    </div>
  );
}
