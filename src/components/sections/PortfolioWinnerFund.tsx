"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";

const portfolioCompanies = [
  {
    name: "Boba Bhai",
    logo: "/images/logos/bobabhai-logo.webp",
    category: "QSR & cloud kitchens",
    logoScale: 0.7,
  },
  {
    name: "Zouk",
    logo: "/images/logos/zouk_new_logo.webp",
    category: "Vegan leather goods",
    logoScale: 0.8,
  },
  {
    name: "BECO",
    logo: "/images/logos/BECO.webp",
    category: "Sustainable home products",
    logoScale: 1,
  },
  {
    name: "Simplismart",
    logo: "/images/logos/Simplismart.webp",
    category: "AI infrastructure",
    logoScale: 1,
  },
  {
    name: "Supertails",
    logo: "/images/logos/Supertails.png",
    category: "Pet products marketplace",
    logoScale: 1,
  },
  {
    name: "HomeRun",
    logo: "/images/logos/homerun1.webp",
    category: "B2B quick commerce",
    logoScale: 1,
  }, 
  {
    name: "Anveshan",
    logo: "/images/logos/anveshan.webp",
    category: "Pure & natural foods",
    logoScale: 0.8,
  },
  {
    name: "Mitigata",
    logo: "/images/logos/mitigata-logo.webp",
    category: "Full-stack cyber security",
    logoScale: 1,
  },
  {
    name: "Park+",
    logo: "/images/logos/Park+.webp",
    category: "Automobile platform",
    logoScale: 1,
  },
  {
    name: "MEKR",
    logo: "/images/logos/mekr-logo.webp",
    category: "Appliance Manufacturing ·",
    logoScale: 1,
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

      {/* Logo — grayscale by default, full colour on hover */}
      <div className="relative z-10 flex flex-1 w-full items-center justify-center px-[15%]">
        <div
          className={`relative w-full transition-[filter] duration-500 ease-out ${isActive ? "grayscale-0" : "grayscale"}`}
          style={{
            height: "clamp(36px, min(4.5vw, 6.5vh), 64px)",
            transform: `scale(${company.logoScale})`,
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