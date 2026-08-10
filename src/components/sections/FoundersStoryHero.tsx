"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { HeroGlow, AnimatedGrid, RevealLine } from "./BackedEarlyClient";
import {
  HERO_HEADING_DARK_CLASS,
  HERO_HEADING_DARK_STYLE,
} from "@/styles/heroTypography";

/*
  FoundersStoryHero
  ─────────────────
  Same dark animated background as BackedEarly (HeroGlow + AnimatedGrid on
  #00112E). Centered per-character reveal heading "A CENTRAL HUB FOR
  FOUNDERS", with a full-bleed row of 4 founder photos anchored at the
  bottom of the hero.
*/

const FOUNDERS = [
  "/images/FoundersStory/founder1.webp",
  "/images/FoundersStory/founder2.webp",
  "/images/FoundersStory/founder3.webp",
  "/images/FoundersStory/founder4.webp",
];

export default function FoundersStoryHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.3 });
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (inView) setShow(true);
  }, [inView]);

  return (
    <section
      ref={sectionRef}
      className="relative flex w-full flex-col overflow-hidden bg-[#00112E] min-h-[100svh]"
      style={{
        paddingTop: "calc(var(--nav-height) + clamp(20px, min(4vw, 6vh), 60px))",
        paddingBottom: 0,
      }}
    >
      <HeroGlow />
      <AnimatedGrid />

      <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-between">
        {/* ── HEADING ── */}
        <div className="flex w-full flex-1 flex-col items-center justify-center px-[var(--section-px-wide)]">
          <h1
            className={`m-0 flex w-full flex-col items-center justify-center text-center text-white ${HERO_HEADING_DARK_CLASS}`}
            style={HERO_HEADING_DARK_STYLE}
          >
            <RevealLine show={show} delay={0}>A Central Hub</RevealLine>
            <RevealLine show={show} delay={0.5}>For Founders</RevealLine>
          </h1>
        </div>

        {/* ── FULL-BLEED ROW OF 4 FOUNDER PHOTOS ── */}
        <motion.div
          className="grid w-full shrink-0 grid-cols-4 max-md:!grid-cols-2"
          style={{ gap: "clamp(8px, 1vw, 16px)" }}
          initial={{ opacity: 0, y: 30 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut", delay: 1.2 }}
        >
          {FOUNDERS.map((src, i) => (
            <div
              key={i}
              className="relative w-full overflow-hidden bg-[#0e1120]"
              style={{ aspectRatio: "1433 / 1167" }}
            >
              <Image
                src={src}
                alt={`Founder ${i + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover object-center"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
