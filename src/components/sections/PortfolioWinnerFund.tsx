"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";

/*
  Per-logo bounding box (logoW × logoH as % of card).
  Tuned by eye so every logo occupies the same visual weight:
  – Wide thin wordmarks get more width, less height
  – Square icons with solid backgrounds get constrained smaller
  – Logos with built-in filled backgrounds appear "heavier" per pixel, so they display smaller
*/
const portfolioCompanies = [
  {
    name: "Boba Bhai",
    logo: "/images/logos/bobabhai-logo.webp",
    category: "QSR & cloud kitchens",
    logoW: "52%", logoH: "18%",   // 4.3:1  wide pill with purple bg — heavy, constrain
  },
  {
    name: "Zouk",
    logo: "/images/logos/zouk_new_logo.webp",
    category: "Vegan leather goods",
    logoW: "40%", logoH: "15%",   // 3:1    clean serif wordmark
  },
  {
    name: "BECO",
    logo: "/images/logos/BECO.webp",
    category: "Sustainable home products",
    logoW: "48%", logoH: "80%",   // 2.7:1  bold blocky letters
  },
  {
    name: "Simplismart",
    logo: "/images/logos/Simplismart.webp",
    category: "AI infrastructure",
    logoW: "68%", logoH: "28%",   // 6.7:1  extremely wide+thin, needs max width
  },
  {
    name: "Supertails",
    logo: "/images/logos/supertails black.png",
    category: "Pet products marketplace",
    logoW: "60%", logoH: "26%",   // 3.7:1  dog icon + text
  },
  {
    name: "HomeRun",
    logo: "/images/logos/homerun.png",
    category: "B2B quick commerce",
    logoW: "70%", logoH: "40%",   // 1.9:1  icon with solid yellow bg — heavy
  },
  {
    name: "Anveshan",
    logo: "/images/logos/anveshan.webp",
    category: "Pure & natural foods",
    logoW: "65%", logoH: "18%",   // 4.9:1  wide serif wordmark, thin
  },
  {
    name: "Mitigata",
    logo: "/images/logos/mitigata-logo.webp",
    category: "Full-stack cyber security",
    logoW: "54%", logoH: "21%",   // 2.65:1 text + tagline, two lines
  },
  {
    name: "Park+",
    logo: "/images/logos/Park+.webp",
    category: "Automobile platform",
    logoW: "33%", logoH: "33%",   // 1:1    square icon with solid purple bg — heaviest
  },
  {
    name: "MEKR",
    logo: "/images/logos/mekr-logo.webp",
    category: "Appliance Manufacturing",
    logoW: "45%", logoH: "30%",   // 2.26:1 icon+text with dark bg
  },
];

/* ── Card — white background always, logo turns colored on hover ── */
function PortfolioCard({
  company,
  index,
}: {
  company: (typeof portfolioCompanies)[number];
  index: number;
}) {
  const [isActive, setIsActive] = useState(false);

  const handleMouseEnter = () => setIsActive(true);
  const handleMouseLeave = () => setIsActive(false);
  const handleTouchStart = () => setIsActive(true);
  const handleTouchEnd = () => setIsActive(false);

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: 0.15 + index * 0.08,
      },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className="group relative flex cursor-pointer flex-col items-center overflow-hidden bg-white"
      style={{
        boxShadow: "0 2px 12px 0 rgba(0,0,0,0.04)",
        width: "100%",
        aspectRatio: "1 / 1",
      }}
    >
      {/* Category label */}
      <p
        className="relative z-10 w-full text-center font-['Poppins',_sans-serif] font-normal text-[#323232] transition-colors duration-300"
        style={{
          paddingTop: "clamp(16px, min(2.5vw, 3.5vh), 32px)",
          fontSize: "clamp(11px, min(1.1vw, 1.6vh), 16px)",
        }}
      >
        {company.category}
      </p>

      {/* Logo — grayscale by default, full colour on hover.
           Per-logo bounding box (logoW × logoH) tuned so every logo
           looks the same visual size regardless of aspect ratio. */}
      <div className="relative z-10 flex flex-1 w-full items-center justify-center">
        <div
          className={`relative transition-[filter] duration-500 ease-out ${isActive ? "grayscale-0" : "grayscale"}`}
          style={{
            width: company.logoW,
            height: company.logoH,
          }}
        >
          <Image
            src={company.logo}
            alt={company.name}
            fill
            sizes="(max-width: 768px) 40vw, 20vw"
            className="object-contain"
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function PortfolioWinnerFund() {
  return (
    <section
      className="relative flex w-full flex-col items-center overflow-hidden bg-[#FBF7F0]"
      style={{
        paddingTop: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingBottom: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center">

        {/* ── HEADING ── */}
        <motion.div
          className="mb-[clamp(28px,min(4vw,6vh),56px)] flex flex-col items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          {/* "Portfolio Company" — highlighted */}
          <motion.div
            className="relative inline-flex items-center justify-center overflow-hidden bg-transparent px-[6px] py-[8px] md:px-[8px] md:py-[10px]"
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: "easeOut" },
              },
            }}
          >
            <motion.span
              className="absolute inset-0 z-0 h-full w-full bg-[#D3E2FF]"
              style={{ transformOrigin: "left" }}
              variants={{
                hidden: { scaleX: 0 },
                visible: {
                  scaleX: 1,
                  transition: { duration: 0.6, ease: "easeInOut", delay: 0.5 },
                },
              }}
            />
            <span
              className="relative z-10 font-['Libre_Baskerville',_serif] font-semibold italic leading-[110%] text-[#001A4D] max-md:!text-[28px]"
              style={{ fontSize: "var(--heading-xl)" }}
            >
              Portfolio Company
            </span>
          </motion.div>

          {/* "Winner Fund" */}
          <motion.h2
            className="mt-[clamp(4px,0.5vw,8px)] m-0 font-['Libre_Baskerville',_serif] font-semibold leading-[110%] text-[#001A4D] max-md:!text-[28px]"
            style={{ fontSize: "var(--heading-xl)" }}
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: "easeOut", delay: 0.2 },
              },
            }}
          >
            Winner Fund
          </motion.h2>
        </motion.div>

        {/* ── CARD GRID ── */}
        <motion.div
          className="grid w-full grid-cols-2 gap-[clamp(12px,1.5vw,20px)] md:grid-cols-3 lg:grid-cols-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {portfolioCompanies.map((company, i) => (
            <PortfolioCard key={company.name} company={company} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}