"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, Variants } from "framer-motion";

const cardsData = [
  {
    title: "Day One Access",
    desc: "From the moment we invest, you're in. 650+ founders, strategic partners, and the Titan Entrepreneur Network, all at your disposal.",
  },
  {
    title: "Founders Helping Founders",
    desc: "A 650+ strong founder community that shares what actually works; playbooks, templates, and hard-won lessons.",
  },
  {
    title: "Warm Introduction",
    desc: "Every introduction we make is personal. Our network picks up for you.",
  },
  {
    title: "Follow-On Oppurtunity",
    desc: "For companies that break out, we show up again, through our Winners Fund.",
  },
];

export default function WhyTitanSeed() {
  const [isSpread, setIsSpread] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  
  // High threshold threshold (0.8) used strictly to trigger the heavy card spreading layout shift
  const isSectionFullyVisible = useInView(sectionRef, { once: true, amount: 0.8 });

  useEffect(() => {
    if (isSectionFullyVisible) {
      const timer = setTimeout(() => setIsSpread(true), 300);
      return () => clearTimeout(timer);
    }
  }, [isSectionFullyVisible]);

  const smoothSpring = {
    type: "spring" as const,
    stiffness: 80,
    damping: 14,
    mass: 1,
  };

  const cardVariants: Variants = {
    clustered: (i: number) => {
      const positions = [
        { x: "-25%", y: "125%", rotate: -12, zIndex: 1 },
        { x: "25%",  y: "125%", rotate: 12,  zIndex: 2 },
        { x: "-20%", y: "130%",  rotate: 6,   zIndex: 3 },
        { x: "30%",  y: "130%",  rotate: -7,  zIndex: 4 },
      ];
      return {
        x: positions[i].x,
        y: positions[i].y,
        rotate: positions[i].rotate,
        zIndex: positions[i].zIndex,
        transition: smoothSpring,
      };
    },
    spread: (i: number) => {
      const positions = [
        { x: "-75%", y: "38%" },
        { x: "45%",  y: "38%" },
        { x: "-85%", y: "148%" },
        { x: "35%",  y: "158%" },
      ];
      return {
        x: positions[i].x,
        y: positions[i].y,
        rotate: 0,
        zIndex: 5,
        transition: smoothSpring,
      };
    },
  };

  return (
    <section
      ref={sectionRef}
      className="relative flex w-full flex-col items-center justify-start lg:flex-row lg:items-start lg:justify-center lg:gap-[clamp(20px,3vw,60px)] overflow-hidden bg-white"
      style={{
        minHeight: "calc(100svh - var(--nav-height))",
        paddingTop: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingBottom: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      {/* ── HEADING ── */}
      <div className="mx-auto mb-[20px] md:mb-[clamp(60px,10vh,120px)] lg:mb-0 lg:shrink-0 lg:w-auto flex w-full max-w-[1440px] shrink-0 flex-col">
        <motion.div
          className="flex w-full flex-row items-center max-lg:justify-center lg:flex-col lg:items-start"
          initial="hidden"
          // NEW: Changes to native inline viewport with a minimal threshold (0.05).
          // This fires the animation the absolute second this element slips up underneath the hero section.
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }} 
        >
          <motion.h2
            className="m-0 mr-2 mb-2 whitespace-nowrap font-['Libre_Baskerville',_serif] text-[clamp(28px,4vw,var(--heading-xl))] font-semibold not-italic leading-[110%] text-[#001A4D] md:mr-3"
            variants={{
              hidden: { opacity: 0, x: -40 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: "easeOut" } }
            }}
          >
            Why
          </motion.h2>

          <motion.div
            className="relative inline-flex items-center justify-center overflow-hidden bg-transparent px-[4px] py-[8px] md:px-[6px] md:py-[10px]"
            variants={{
              hidden: { opacity: 0, x: -40 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: "easeOut", delay: 0.2 } }
            }}
          >
            <motion.span
              className="absolute inset-0 z-0 h-full w-full bg-[#D3E2FF]"
              style={{ transformOrigin: "left" }}
              variants={{
                hidden: { scaleX: 0 },
                visible: { scaleX: 1, transition: { duration: 0.6, ease: "easeInOut", delay: 0.7 } }
              }}
            />
            <span className="relative z-10 whitespace-nowrap font-['Libre_Baskerville',_serif] text-[clamp(28px,4vw,var(--heading-xl))] font-semibold italic leading-none text-[#001A4D]">
              Titan Seed
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* ── DESKTOP: CARDS ── */}
      <div className="relative hidden w-full max-w-[1100px] flex-1 items-center justify-center lg:flex">
        {cardsData.map((card, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={cardVariants}
            initial="clustered"
            animate={isSpread ? "spread" : "clustered"}
            whileHover={{ scale: 1.05, zIndex: 10, transition: { type: "spring", stiffness: 300, damping: 20 } }}
            className="absolute flex cursor-pointer flex-col items-center justify-center bg-white"
            style={{
              width: "clamp(190px, 20vw, 290px)",
              height: "clamp(160px, 18vw, 230px)",
              padding: "clamp(6px, 1vw, 12px)",
              borderRadius: "clamp(14px, 2vw, 28px)",
              boxShadow: "10px 12px 20px 0px rgba(233,233,233,0.8)",
              left: "50%",
              top: "50%",
              marginLeft: "calc(clamp(190px, 20vw, 290px) / -2)",
              marginTop: "calc(clamp(160px, 18vw, 230px) / -2)",
            }}
          >
            <div
              className="relative flex h-full w-full flex-col items-center overflow-hidden bg-[#D3E2FF]"
              style={{ borderRadius: "clamp(10px, 1.5vw, 20px)" }}
            >
              <div className="absolute top-[clamp(6px,1vw,10px)] flex w-full justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" style={{ width: "clamp(14px, 1.5vw, 18px)", height: "clamp(14px, 1.5vw, 18px)" }} viewBox="0 0 36 35" fill="none">
                  <g filter="url(#filter0_d_2413_230)">
                    <circle cx="13.0808" cy="13.0812" r="13.0782" transform="rotate(-22.4299 13.0808 13.0812)" fill="white"/>
                  </g>
                  <defs>
                    <filter id="filter0_d_2413_230" x="0" y="0" width="35.1621" height="34.1631" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                      <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                      <feOffset dx="5" dy="4"/>
                      <feGaussianBlur stdDeviation="2"/>
                      <feComposite in2="hardAlpha" operator="out"/>
                      <feColorMatrix type="matrix" values="0 0 0 0 0.660958 0 0 0 0 0.775439 0 0 0 0 1 0 0 0 1 0"/>
                      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2413_230"/>
                      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2413_230" result="shape"/>
                    </filter>
                  </defs>
                </svg>
              </div>
              <div
                className="flex w-full items-center justify-center bg-[#001A4D] px-2 py-2"
                style={{ marginTop: "clamp(20px, 3vw, 32px)", minHeight: "clamp(30px, 4vw, 40px)" }}
              >
                <h3
                  className="text-center font-['Libre_Baskerville',_serif] font-semibold leading-[105%] text-white"
                  style={{ fontSize: "clamp(11px, 1vw, 14px)" }}
                >
                  {card.title}
                </h3>
              </div>
              <div className="flex flex-1 items-center justify-center px-3 py-2" style={{ padding: "clamp(12px, 2.5vw, 24px)" }}>
                <p
                  className="text-center font-['Poppins',_sans-serif] font-normal leading-[135%] text-black"
                  style={{ fontSize: "clamp(10px, 0.9vw, 12px)" }}
                >
                  {card.desc}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── TABLET / MOBILE: RESPONSIVE GRID ── */}
      <motion.div
        className="mt-[10px] md:mt-[20px] grid w-full max-w-[800px] grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[32px] lg:hidden"
        initial="hidden"
        // Controlled globally by the high threshold hook so cards still fade up gracefully only when fully scrolled into
        animate={isSectionFullyVisible ? "visible" : "hidden"} 
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
        }}
      >
        {cardsData.map((card, i) => (
          <motion.div
            key={i}
            variants={{
              hidden: { opacity: 0, y: 30, scale: 0.96 },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { duration: 0.5, ease: "easeOut" },
              },
            }}
            className="mx-auto flex w-full max-w-[320px] flex-col items-center justify-center rounded-[24px] bg-white p-[10px]"
            style={{ boxShadow: "10px 12px 20px 0px rgba(233,233,233,0.8)", height: "230px" }}
          >
            <div className="relative flex h-full w-full flex-col items-center overflow-hidden rounded-[18px] bg-[#D3E2FF]">
              {/* Pin */}
              <div className="flex w-full justify-center pt-[12px]">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 36 35" fill="none">
                  <g filter="url(#filter0_m)">
                    <circle cx="13.0808" cy="13.0812" r="13.0782" transform="rotate(-22.4299 13.0808 13.0812)" fill="white"/>
                  </g>
                  <defs>
                    <filter id="filter0_m" x="0" y="0" width="35.1621" height="34.1631" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                      <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                      <feOffset dx="5" dy="4"/>
                      <feGaussianBlur stdDeviation="2"/>
                      <feComposite in2="hardAlpha" operator="out"/>
                      <feColorMatrix type="matrix" values="0 0 0 0 0.660958 0 0 0 0 0.775439 0 0 0 0 1 0 0 0 1 0"/>
                      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
                      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
                    </filter>
                  </defs>
                </svg>
              </div>
              {/* Title banner */}
              <div className="mt-[10px] flex w-full min-h-[44px] items-center justify-center bg-[#001A4D] px-4 py-[8px]">
                <h3 className="text-center font-['Libre_Baskerville',_serif] text-[15px] font-semibold leading-[115%] text-white">
                  {card.title}
                </h3>
              </div>
              {/* Description */}
              <div className="flex flex-1 items-center justify-center px-[20px] pb-[12px]">
                <p className="text-center font-['Poppins',_sans-serif] text-[13px] font-normal leading-[140%] text-black">
                  {card.desc}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}