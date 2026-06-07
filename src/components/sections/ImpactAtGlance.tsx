"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

const impactData = [
  { num: "300+", label: "Startups Backed", caption: "Across seed, pre-Series A and growth stages since 2011" },
  { num: "650+", label: "Founders Backed", caption: "Operators, builders, and category creators" },
  { num: "₹450B+", label: "Capital Raised by Portfolio", caption: "From 100+ institutional investors globally" },
  { num: "6", label: "Indicorns", caption: "Direct employment across the portfolio ecosystem" },
  { num: "250M+", label: "Lives Impacted", caption: "Customers served by portfolio companies" },
  { num: "4", label: "IPO's", caption: "Direct employment across the portfolio ecosystem" },
];

const CarouselItem = ({ 
  data, 
  index, 
  progress 
}: { 
  data: typeof impactData[0], 
  index: number, 
  progress: MotionValue<number> 
}) => {
  
  const getDiff = (p: number) => {
    const totalItems = impactData.length;
    const center = p * totalItems;
    let diff = ((index - center) % totalItems + totalItems) % totalItems;
    if (diff > 3) diff -= totalItems;
    return diff;
  };

  // Flatter angular spacing (was 0.6) so the ±2 neighbours stay on-screen,
  // letting all 5 nearby stats show at once; wider radius fans them out more.
  const spread = 0.42;
  const radius = 920;

  const x = useTransform(progress, (p) => {
    const diff = getDiff(p);
    return `${Math.sin(diff * spread) * radius}px`;
  });

  // UPWARD arch — the side stats rise above the centre one.
  const y = useTransform(progress, (p) => {
    const diff = getDiff(p);
    return `${-(diff * diff) * 26}px`;
  });

  // Steep size falloff so the middle stat is clearly the hero and the
  // flanking ones read as smaller supporting elements.
  const scale = useTransform(progress, (p) => {
    const diff = getDiff(p);
    return Math.max(0.32, Math.cos(diff * 0.62));
  });

  // Keep up to 5 visible (|diff| ≤ 2.5) but never fully transparent on the sides.
  const opacity = useTransform(progress, (p) => {
    const diff = Math.abs(getDiff(p));
    if (diff >= 2.6) return 0;
    return Math.max(0.4, Math.cos(diff * 0.55));
  });

  const captionOpacity = useTransform(progress, (p) => {
    const diff = Math.abs(getDiff(p));
    return diff < 0.3 ? Math.max(0, Math.cos(diff * Math.PI * 1.6)) : 0;
  });

  const zIndex = useTransform(progress, (p) => Math.round(10 - Math.abs(getDiff(p))));

  return (
    <motion.div
      style={{ x, y, scale, opacity, zIndex }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center w-[90%] max-w-[700px]"
    >
      <h2
        className="text-[clamp(28px,3.4vw,44px)] font-bold text-[#001A4D] font-['Libre_Baskerville',_serif] not-italic leading-[119%] mb-1 md:mb-2 shrink-0 flex items-center justify-center"
        style={{ transform: "rotate(-0.157deg)" }}
      >
        {data.num}
      </h2>

      <h3 className="text-[clamp(14px,1.75vw,22px)] font-semibold text-[#001A4D] font-['Libre_Baskerville',_serif] not-italic leading-[119%] max-w-[180px] md:max-w-[340px] mx-auto">
        {data.label}
      </h3>
      
      <motion.h4 
        style={{ opacity: captionOpacity }}
        className="mt-4 md:mt-6 text-[#323232] font-['Poppins',_sans-serif] text-[clamp(14px,1.2vw,16px)] font-normal leading-relaxed w-[80%] max-w-xl mx-auto"
      >
        {data.caption}
      </motion.h4>
    </motion.div>
  );
};
export default function ImpactAtGlance() {
  const trackRef = useRef<HTMLDivElement>(null);

  // Drive the carousel off a TALL scroll track whose inner content is `sticky`.
  // While the user scrolls through the track, the content stays pinned (the
  // screen looks "locked") and the whole stat animation scrubs to completion;
  // once the track is fully scrolled, the pin releases and the page moves on.
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const blobScale = useTransform(scrollYProgress, (p) => {
    const totalItems = impactData.length;
    const currentPosition = p * totalItems;
    const distanceFromNearestCenter = Math.abs(currentPosition - Math.round(currentPosition));
    
    const bloomFactor = Math.max(0, Math.cos(distanceFromNearestCenter * Math.PI));
    return bloomFactor;
  });

  const blobOpacity = useTransform(blobScale, [0, 1], [0.1, 1]);

  return (
    <div ref={trackRef} className="relative w-full bg-white" style={{ height: "300vh" }}>
      {/* Pinned viewport — stays locked on screen while the track scrolls,
          scrubbing the stat animation to completion before releasing. */}
      <div className="sticky top-0 flex h-[100svh] w-full items-center justify-center overflow-hidden bg-white">
        <section
          // Design: 651px tall, column, centered, with an enlarged gap between
          // the heading and the carousel. Capped to the viewport so it never
          // overflows on short screens.
          className="relative flex w-full flex-col items-center"
          style={{
            height:        "min(470px, 100svh)",
            gap:           "clamp(28px, min(4vw, 5.5vh), 56px)",
            // REDUCED TOP PADDING HERE: Keeps fluid responsiveness but makes it much tighter
            paddingTop:    "clamp(8px, min(1vw, 1.5vh), 16px)",
            paddingBottom: "clamp(20px, min(2.6vw, 3.8vh), 36px)",
          }}
        >
          {/* =========================================
                HEADING SEQUENCE
                ========================================= */}
          {/* Reduced z-index to 10 so it correctly slides underneath your Navigation Bar */}
          <div className="relative flex flex-col items-center justify-center w-full px-4 z-10 shrink-0">
            <motion.div 
              className="flex flex-col md:flex-row items-center justify-center text-center gap-2 md:gap-0 w-full max-w-[1280px] mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
            >
              {/* "Impact" */}
              <motion.span 
                className="relative overflow-hidden inline-block md:mr-4 p-[6px_16px] text-[length:var(--heading-xl)] text-[var(--Primary-Color,#001A4D)] font-['Libre_Baskerville',_serif] font-bold italic bg-transparent"
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                }}
              >
                <motion.span
                  className="absolute inset-0 bg-[#D3E2FF] z-0" 
                  style={{ transformOrigin: "left" }} 
                  variants={{
                    hidden: { scaleX: 0 },
                    visible: { scaleX: 1, transition: { duration: 0.5, ease: "easeInOut", delay: 0.5 } }
                  }}
                />
                <span className="relative z-10 leading-[120%]">Impact</span>
              </motion.span>
              
              {/* "at glance" */}
              <motion.span 
                className="px-4 text-[length:var(--heading-xl)] text-[var(--Primary-Color,#001A4D)] font-['Libre_Baskerville',_serif] font-bold not-italic leading-[120%]"
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay: 0.9 } }
                }}
              >
                at glance
              </motion.span>
            </motion.div>
          </div>

          {/* =========================================
                SPHERICAL CAROUSEL
                ========================================= */}
          <div className="relative w-full flex-1 flex items-center justify-center">
            
            {/* BLOOMING GRADIENT BLOB */}
            <motion.div
              style={{ scale: blobScale, opacity: blobOpacity }}
              className="absolute left-1/2 top-[36%] -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] md:w-[360px] md:h-[360px] bg-[#D3E2FF] blur-[60px] md:blur-[80px] rounded-full pointer-events-none z-0 transition-shadow duration-150 ease-out"
            />

            {/* INFINITE CAROUSEL ITEMS */}
            {impactData.map((item, i) => (
              <CarouselItem 
                key={i} 
                data={item} 
                index={i} 
                progress={scrollYProgress} 
              />
            ))}

          </div>
        </section>
      </div>
    </div>
  );
}