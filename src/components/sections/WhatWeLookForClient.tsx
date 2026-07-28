"use client";

import { motion, Variants } from "framer-motion";

/* ─────────────────────────────────────────────────────────
   Types — shared with the server wrapper
   ───────────────────────────────────────────────────────── */
export interface WhatWeLookForItem {
  title: string;
  desc: string;
}

export interface WhatWeLookForData {
  headingFirst?: string;
  headingSecond?: string;
  items?: WhatWeLookForItem[];
}

const FALLBACK_HEADING_FIRST = "What We";
const FALLBACK_HEADING_SECOND = "Look For";

const FALLBACK_LOOK_FOR_DATA: WhatWeLookForItem[] = [
  {
    title: "A founder with genuine insight.",
    desc: "You understand your customer's problem better than anyone. Not just from research, but from experience, obsession, or lived reality.",
  },
  {
    title: "A differentiated approach.",
    desc: "Technology, distribution, or business model edge. Something that makes your company structurally hard to copy.",
  },
  {
    title: "Ambition to build a lasting, enduring business.",
    desc: "Building for 10 years, not for the next fundraise. Something that outlasts any one cycle.",
  },
  {
    title: "Integrity and coachability.",
    desc: "We'll push you, challenge you, and occasionally disagree with you. We need founders who can handle that, and push back when they're right.",
  },
];

export default function WhatWeLookForClient({
  data,
}: {
  data?: WhatWeLookForData | null;
}) {
  const headingFirst = data?.headingFirst || FALLBACK_HEADING_FIRST;
  const headingSecond = data?.headingSecond || FALLBACK_HEADING_SECOND;
  const lookForData =
    data?.items && data.items.length > 0 ? data.items : FALLBACK_LOOK_FOR_DATA;

  // ── ANIMATION VARIANTS ──

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const getItemVariants = (index: number): Variants => ({
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut", delay: 0.4 + index * 0.15 },
    },
  });

  const getBoxVariants = (index: number): Variants => ({
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut", delay: 0.4 + index * 0.15 },
    },
  });

  const getTickVariants = (index: number): Variants => ({
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 0.7,
        ease: "easeOut",
        delay: 0.9 + index * 0.15,
      },
    },
  });

  // Reusable item renderer
  const renderItem = (item: WhatWeLookForItem, index: number, keyPrefix: string) => (
    <motion.div
      key={`${keyPrefix}-${index}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      variants={getItemVariants(index)}
      className="flex w-full flex-row items-start gap-[clamp(16px,2vw,24px)] h-full"
    >
      {/* ── ICON ── */}
      <div className="shrink-0 pt-[2px]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 97 97"
          fill="none"
          className="w-[clamp(44px,5vw,56px)] h-[clamp(44px,5vw,56px)]"
        >
          <motion.path variants={getBoxVariants(index)} d="M30 16 H 22 A 6 6 0 0 0 16 22 V 30" stroke="#111" strokeWidth="4.5" strokeLinecap="round" />
          <motion.path variants={getBoxVariants(index)} d="M16 67 V 75 A 6 6 0 0 0 22 81 H 30" stroke="#111" strokeWidth="4" strokeLinecap="round" />
          <motion.path variants={getBoxVariants(index)} d="M67 81 H 75 A 6 6 0 0 0 81 75 V 67" stroke="#111" strokeWidth="4" strokeLinecap="round" />
          <motion.path variants={getBoxVariants(index)} d="M81 30 V 22 A 6 6 0 0 0 75 16 H 67" stroke="#111" strokeWidth="4" strokeLinecap="round" />
          <motion.path
            variants={getTickVariants(index)}
            d="M20.0801 58.2296C20.0801 58.2296 26.1038 58.2296 34.1355 72.285C34.1355 72.285 56.4595 35.4719 76.3018 28.1108"
            stroke="#111"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* ── TEXT CONTENT ── */}
      <div className="flex w-full flex-col items-start justify-start gap-[10px]">
        <h3 className="font-['Poppins',_sans-serif] text-left font-medium leading-[130%] text-[#0E0E0E] text-[clamp(20px,2vw,28px)]">
          {item.title}
        </h3>
        <p className="font-['Poppins',_sans-serif] font-normal leading-[160%] text-[#323232] text-[clamp(15px,1.2vw,18px)]">
          {item.desc}
        </p>
      </div>
    </motion.div>
  );

  return (
    <section
      className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-[white]"
      style={{
        paddingTop: "clamp(60px, min(8vw, 10vh), 120px)",
        paddingBottom: "clamp(60px, min(8vw, 10vh), 120px)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      {/* Container width aligned with WhyTitanSeed section (max-w-[1440px]) */}
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center">

        {/* ── HEADING ── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="max-md:!mb-[clamp(32px,6dvh,48px)] flex w-full flex-col items-center justify-center text-center"
          style={{ marginBottom: "min(3.47vw, 5.37vh)" }}
        >
          <motion.h2
            className="m-0 font-['Poppins',_sans-serif] font-semibold text-black max-md:!text-[clamp(24px,7vw,28px)] max-md:!leading-[120%]"
            style={{ fontSize: "min(4.51vw, 6.98vh)", lineHeight: "150%" }}
            variants={fadeUp}
          >
            {headingFirst} {headingSecond}
          </motion.h2>
        </motion.div>

        {/* ── CONTENT (GRID WITH INDEPENDENT LINES) ── */}
        <div className="relative w-full">
          {/* ── DESKTOP & TABLET: 2x2 Grid ── */}
          <div className="hidden md:grid grid-cols-2 grid-rows-2 relative w-full">
            
            {/* Center Animated Vertical Line (Draws Slower Top-to-Bottom) */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[black] -translate-x-1/2"
              style={{ transformOrigin: "top" }}
              variants={{
                hidden: { scaleY: 0 },
                visible: { scaleY: 1, transition: { duration: 2.2, ease: "easeInOut" } }
              }}
            />
            
            {/* Left Horizontal Line: Gap at center + Animates Right-to-Left */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="absolute top-1/2 left-0 w-[calc(50%-clamp(16px,2vw,32px))] h-[1px] bg-[black] -translate-y-1/2"
              style={{ transformOrigin: "right" }}
              variants={{
                hidden: { scaleX: 0 },
                visible: { scaleX: 1, transition: { duration: 2.2, ease: "easeInOut", delay: 0.3 } }
              }}
            />

            {/* Right Horizontal Line: Gap at center + Animates Left-to-Right */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="absolute top-1/2 right-0 w-[calc(50%-clamp(16px,2vw,32px))] h-[1px] bg-[black] -translate-y-1/2"
              style={{ transformOrigin: "left" }}
              variants={{
                hidden: { scaleX: 0 },
                visible: { scaleX: 1, transition: { duration: 2.2, ease: "easeInOut", delay: 0.3 } }
              }}
            />

            {/* Grid Items */}
            {lookForData.map((item, i) => (
              <div 
                key={i} 
                className={`
                  flex items-start
                  ${i === 0 ? "pr-[clamp(24px,4vw,60px)] pb-[clamp(32px,5vw,60px)]" : ""} 
                  ${i === 1 ? "pl-[clamp(24px,4vw,60px)] pb-[clamp(32px,5vw,60px)]" : ""}
                  ${i === 2 ? "pr-[clamp(24px,4vw,60px)] pt-[clamp(32px,5vw,60px)]" : ""}
                  ${i === 3 ? "pl-[clamp(24px,4vw,60px)] pt-[clamp(32px,5vw,60px)]" : ""}
                `}
              >
                {renderItem(item, i, "desk")}
              </div>
            ))}
          </div>

          {/* ── MOBILE: Stacked List with Horizontal Dividers ── */}
          <div className="flex w-full flex-col md:hidden">
            {lookForData.map((item, i) => (
              <div key={i} className="relative flex flex-col items-center">
                <div className="py-[32px] w-full">
                  {renderItem(item, i, "mob")}
                </div>
                
                {/* Horizontal Divider between mobile items */}
                {i !== lookForData.length - 1 && (
                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.8 }}
                    className="w-full h-[1px] bg-[#000]"
                    style={{ transformOrigin: "left" }}
                    variants={{
                      hidden: { scaleX: 0 },
                      visible: { scaleX: 1, transition: { duration: 1.5, ease: "easeInOut", delay: i * 0.2 } }
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}