"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, Variants } from "framer-motion";

const cardsData = [
  {
    title: "Day One Access",
    desc: "500+ founder community with shared playbooks, templates, learnings",
  },
  {
    title: "Founders Helping Founders",
    desc: "500+ founder community with shared playbooks, templates, learnings",
  },
  {
    title: "Warm Introduction",
    desc: "Personal intros, not cold emails. Our network picks up the phone for you",
  },
  {
    title: "Follow-On-Commitment",
    desc: "Follow-on through Winners Fund for breakout companies",
  },
];

export default function WhyTitanSeed() {
  const [isSpread, setIsSpread] = useState(false);
  const cardsRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardsRef, { once: true, amount: 0.3 });

  // Trigger spread animation when section scrolls into view
  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => setIsSpread(true), 300);
      return () => clearTimeout(timer);
    }
  }, [inView]);

  const smoothSpring = {
    type: "spring" as const,
    stiffness: 80,
    damping: 14,
    mass: 1,
  };

  // Clustered: cards overlap in center. Spread: fan out to 4 quadrants.
  const cardVariants: Variants = {
    clustered: (i: number) => {
      const positions = [
        { x: "-35%", y: "-35%", rotate: -12, zIndex: 1 },
        { x: "55%",  y: "-35%", rotate: 12,  zIndex: 2 },
        { x: "-30%", y: "40%",  rotate: 6,   zIndex: 3 },
        { x: "60%",  y: "35%",  rotate: -7,  zIndex: 4 },
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
        { x: "-62%", y: "-72%" },
        { x: "62%",  y: "-48%" },
        { x: "-85%", y: "48%" },
        { x: "40%",  y: "60%" },
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
      className="relative flex w-full flex-col items-center justify-center overflow-hidden"
      style={{
        minHeight: "calc(100svh - var(--nav-height))",
        paddingTop: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingBottom: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >

      {/* ── HEADING ── */}
      <div className="mx-auto flex w-full max-w-[1440px] flex-col">
        <motion.div
          className="mb-[clamp(5px,1vw,15px)] flex w-full flex-row items-center max-lg:justify-center lg:justify-start"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.h2
            className="m-0 mr-2 whitespace-nowrap font-['Libre_Baskerville',_serif] text-[length:var(--heading-xl)] font-semibold not-italic leading-none text-[#001A4D] max-md:!text-[28px] md:mr-3"
            variants={{
              hidden: { opacity: 0, x: -40 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: "easeOut" } }
            }}
          >
            Why
          </motion.h2>

          <motion.div
            className="relative inline-flex items-center justify-center overflow-hidden bg-transparent px-[4px] py-[8px] max-md:!text-[28px] md:px-[6px] md:py-[10px]"
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
            <span className="relative z-10 whitespace-nowrap font-['Libre_Baskerville',_serif] text-[length:var(--heading-xl)] font-semibold italic leading-none text-[#001A4D] max-md:!text-[28px]">
              Titan Seed
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* ── DESKTOP: CARDS ── */}
      <div
        ref={cardsRef}
        className="relative hidden w-full max-w-[1280px] flex-1 items-center justify-center lg:flex"
        style={{ minHeight: "clamp(400px, calc(100svh - var(--nav-height) - 280px), 650px)" }}
      >
        {cardsData.map((card, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={cardVariants}
            initial="clustered"
            animate={isSpread ? "spread" : "clustered"}
            whileHover={{ scale: 1.08, zIndex: 10, transition: { type: "spring", stiffness: 300, damping: 20 } }}
            className="absolute flex cursor-pointer flex-col items-center justify-center bg-white"
            style={{
              width: "clamp(180px, min(22vw, 32vh), 300px)",
              height: "clamp(170px, min(20vw, 30vh), 260px)",
              padding: "clamp(8px, min(1.1vw, 1.6vh), 14px)",
              borderRadius: "clamp(16px, min(2.8vw, 4vh), 40px)",
              boxShadow: "10px 12px 20px 0px rgba(233,233,233,0.8)",
              left: "50%",
              top: "50%",
              marginLeft: "calc(clamp(180px, min(22vw, 32vh), 300px) / -2)",
              marginTop: "calc(clamp(170px, min(20vw, 30vh), 260px) / -2)",
            }}
          >
            <div
              className="relative flex h-full w-full flex-col items-center overflow-hidden bg-[#D3E2FF]"
              style={{ borderRadius: "clamp(12px, min(2.2vw, 3.2vh), 28px)" }}
            >
              <div className="absolute top-[clamp(6px,1vw,12px)] flex w-full justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" style={{ width: "clamp(14px, min(1.5vw, 2.2vh), 22px)", height: "clamp(14px, min(1.5vw, 2.2vh), 22px)" }} viewBox="0 0 36 35" fill="none">
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
                className="flex w-full items-center justify-center bg-[#001A4D] px-3 py-2"
                style={{ marginTop: "clamp(26px, min(3.5vw, 5vh), 42px)", minHeight: "clamp(28px, min(3.5vw, 5vh), 42px)" }}
              >
                <h3
                  className="text-center font-['Libre_Baskerville',_serif] font-semibold leading-[105%] text-white"
                  style={{ fontSize: "clamp(11px, min(1.2vw, 1.8vh), 16px)" }}
                >
                  {card.title}
                </h3>
              </div>
              <div className="flex flex-1 items-center justify-center" style={{ padding: "clamp(8px, min(1.4vw, 2vh), 20px)" }}>
                <p
                  className="text-center font-['Poppins',_sans-serif] font-normal leading-[125%] text-black"
                  style={{ fontSize: "clamp(10px, min(1vw, 1.5vh), 14px)" }}
                >
                  {card.desc}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── MOBILE: VERTICAL CARD STACK ── */}
      <motion.div
        className="flex w-full flex-col items-center gap-[24px] px-6 pt-6 lg:hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.2, delayChildren: 0.3 } },
        }}
      >
        {cardsData.map((card, i) => (
          <motion.div
            key={i}
            variants={{
              hidden: { opacity: 0, y: 40, scale: 0.95 },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { duration: 0.5, ease: "easeOut" },
              },
            }}
            className="flex w-full max-w-[280px] flex-col items-center justify-center rounded-[20px] bg-white p-[10px]"
            style={{ boxShadow: "10px 12px 20px 0px rgba(233,233,233,0.8)", height: "220px" }}
          >
            <div className="relative flex h-full w-full flex-col items-center overflow-hidden rounded-[14px] bg-[#D3E2FF]">
              {/* Pin */}
              <div className="flex w-full justify-center pt-[10px]">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 36 35" fill="none">
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
              <div className="mt-[8px] flex w-full items-center justify-center bg-[#001A4D] px-4 py-[10px]">
                <h3 className="text-center font-['Libre_Baskerville',_serif] text-[14px] font-semibold leading-[105%] text-white">
                  {card.title}
                </h3>
              </div>
              {/* Description */}
              <div className="flex items-center justify-center px-[20px] pb-[18px] pt-[12px]">
                <p className="text-center font-['Poppins',_sans-serif] text-[12px] font-normal leading-[140%] text-black">
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
