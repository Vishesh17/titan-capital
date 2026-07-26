"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";

/* ── Types ── */
interface PortfolioCompany {
  name: string;
  logo: string;
  category: string;
  logoW: string;
  logoH: string;
}

export interface PortfolioWinnerFundData {
  headingFirst?: string;
  headingSecond?: string;
  companies?: PortfolioCompany[];
}

/* ── Fallbacks ── */
const FALLBACK_HEADING_FIRST = "Portfolio Company";
const FALLBACK_HEADING_SECOND = "Winner Fund";
const FALLBACK_COMPANIES: PortfolioCompany[] = [
  { name: "Anveshan", logo: "/images/logos_backup/anveshan.webp", category: "A traceable, traditional and completely natural food products", logoW: "65%", logoH: "18%" },
  { name: "BECO", logo: "/images/logos_backup/BECO.webp", category: "Eco-friendly D2C brand offering sustainable alternatives to everyday essentials at an affordable price", logoW: "48%", logoH: "80%" },
  { name: "Boba Bhai", logo: "/images/logos_backup/bobabhai-logo.webp", category: "A QSR brand for Bubble tea and Korean Burgers", logoW: "52%", logoH: "18%" },
  { name: "Giva", logo: "/images/logos_backup/GIVA.webp", category: "An enabling e-commerce businesses with higher conversions and RTO reduction", logoW: "33%", logoH: "33%" },
  { name: "HomeRun", logo: "/images/logos_backup/homerun.png", category: "It is a provider of a goal-based savings platform", logoW: "70%", logoH: "40%" },
  { name: "MEKR", logo: "/images/logos_backup/mekr-logo.webp", category: "One stop solution for complete electronic product manufacturing at competitive prices and lead time", logoW: "45%", logoH: "30%" },
  { name: "Mitigata", logo: "/images/logos_backup/mitigata-logo.webp", category: "It is a smart cyber insurance partner", logoW: "54%", logoH: "21%" },
  { name: "Simplismart", logo: "/images/logos_backup/Simplismart.webp", category: "Build, deploy and observe deep learning models with minimal code", logoW: "68%", logoH: "28%" },
  { name: "Supertails", logo: "/images/logos_backup/supertails black.png", category: "Digital pet care platform offering products and expert-led healthcare", logoW: "60%", logoH: "26%" },
  { name: "Zouk", logo: "/images/logos_backup/zouk_new_logo.webp", category: "100% Vegan Indian bags and accessories brand", logoW: "40%", logoH: "15%" },
];

const FLIPPED_VARIANTS: Record<string, string> = {
  "homerun": "/images/portfolio_grid_flipped/homerun.png",
};

function flippedVariantFor(name: string): string | undefined {
  return FLIPPED_VARIANTS[name.toLowerCase().replace(/\s+/g, "")];
}

/* ── Card component ── */
function PortfolioCard({ company, index }: { company: PortfolioCompany; index: number }) {
  const [isActive, setIsActive] = useState(false);
  const flippedSrc = flippedVariantFor(company.name);

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut", delay: 0.15 + index * 0.08 },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      onTouchStart={() => setIsActive(true)}
      onTouchEnd={() => setIsActive(false)}
      onTouchCancel={() => setIsActive(false)}
      className="group relative flex cursor-pointer flex-col overflow-hidden"
      style={{
        boxShadow: "0 2px 12px 0 rgba(0,0,0,0.04)",
        width: "100%",
        aspectRatio: "1.3 / 1",
        borderRadius: "2px",
        backgroundColor: isActive ? "#001A4D" : "#FFFFFF",
        transition: "background-color 0.55s ease-in-out",
      }}
    >
      <motion.div
        className="relative w-full shrink-0 overflow-hidden"
        animate={{ height: isActive ? "54%" : "100%" }}
        transition={{ duration: 0.55, ease: "easeInOut" }}
      >
        <motion.div
          className="absolute"
          initial={false}
          animate={{
            top: isActive ? "4%" : "50%",
            left: isActive ? "4%" : "50%",
            x: isActive ? "0%" : "-50%",
            y: isActive ? "0%" : "-50%",
          }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
          style={{ width: company.logoW, height: company.logoH }}
        >
          {flippedSrc ? (
            <>
              <Image
                src={company.logo}
                alt={company.name}
                fill
                sizes="(max-width: 768px) 40vw, 20vw"
                className={`object-contain transition-opacity duration-[550ms] ease-in-out ${
                  isActive ? "opacity-0" : "opacity-100"
                }`}
              />
              <Image
                src={flippedSrc}
                alt={company.name}
                fill
                sizes="(max-width: 768px) 40vw, 20vw"
                className={`absolute inset-0 object-contain transition-opacity duration-[550ms] ease-in-out ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
                style={{ objectPosition: "left top" }}
              />
            </>
          ) : (
            <div
              className={`relative h-full w-full transition-[filter] duration-[550ms] ease-in-out ${
                isActive ? "[filter:brightness(0)_invert(1)]" : ""
              }`}
            >
              <Image
                src={company.logo}
                alt={company.name}
                fill
                sizes="(max-width: 768px) 40vw, 20vw"
                className="object-contain"
                style={{
                  objectPosition: isActive ? "left top" : "center",
                  transition: "object-position 0.55s ease-in-out",
                }}
              />
            </div>
          )}
        </motion.div>
      </motion.div>

      <motion.div
        className="flex min-h-0 w-full flex-1 flex-col justify-between overflow-hidden text-white"
        style={{ padding: "clamp(12px, 0.5vw, 22px)" }}
        animate={{ opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <p
          className="m-0 min-h-0 font-['Poppins',_sans-serif] font-normal leading-[1.3]"
          style={{
            fontSize: "clamp(11px, min(1vw, 1.5vh), 14px)",
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical" as const,
            overflow: "hidden",
          }}
        >
          {company.category}
        </p>
        <div className="mt-auto flex items-center gap-[6px] pt-1">
          <span
            className="font-['Poppins',_sans-serif] font-medium uppercase tracking-wide"
            style={{ fontSize: "clamp(9px, min(0.85vw, 1.25vh), 12px)" }}
          >
            Read
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function PortfolioWinnerFundClient({
  data,
}: {
  data?: PortfolioWinnerFundData | null;
}) {
  const headingFirst = data?.headingFirst || FALLBACK_HEADING_FIRST;
  const headingSecond = data?.headingSecond || FALLBACK_HEADING_SECOND;
  const companies = data?.companies?.length ? data.companies : FALLBACK_COMPANIES;

  const rowsCount = Math.ceil(companies.length / 4);

  return (
    <section
      className="relative flex w-full flex-col items-center overflow-hidden bg-white"
      style={{
        paddingTop: "clamp(60px, min(8vw, 10vh), 120px)",
        paddingBottom: "clamp(60px, min(8vw, 10vh), 120px)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center">
        
        {/* ── HEADING ── */}
        <motion.div
          className="mb-[clamp(40px,6vw,80px)] flex flex-col items-center text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.h2
            className="m-0 font-['Poppins',_sans-serif] text-[clamp(32px,4vw,56px)] font-normal capitalize leading-[120%] text-[#000]"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
            }}
          >
            {headingFirst} <br /> {headingSecond}
          </motion.h2>
        </motion.div>

        {/* ── CARD GRID (4, 4, 2 Layout) ── */}
        <motion.div
          className="relative w-full"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* DESKTOP 4-COLUMN GRID */}
          <div className="hidden md:grid grid-cols-4 relative w-full">
            
            {/* Vertical Divider 1 */}
            <motion.div
              className="absolute left-[25%] top-0 bottom-0 w-[1px] bg-[#000]/15"
              style={{ transformOrigin: "top" }}
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />

            {/* Vertical Divider 2 */}
            <motion.div
              className="absolute left-[50%] top-0 bottom-0 w-[1px] bg-[#000]/15"
              style={{ transformOrigin: "top" }}
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />

            {/* Vertical Divider 3 */}
            <motion.div
              className="absolute left-[75%] top-0 bottom-0 w-[1px] bg-[#000]/15"
              style={{ transformOrigin: "top" }}
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />

            {/* Grid Items with Separate Animating Horizontal Lines */}
            {companies.map((company, i) => {
              const rowIndex = Math.floor(i / 4);
              const isLastRow = rowIndex === rowsCount - 1;

              return (
                <div
                  key={company.name}
                  className="relative flex items-center justify-center p-[clamp(12px,1.5vw,20px)]"
                >
                  <PortfolioCard company={company} index={i} />

                  {/* Separate Horizontal Line per Cell (Doesn't touch vertical lines) */}
                  {!isLastRow && (
                    <motion.div
                      className="absolute bottom-0 left-[clamp(12px,1.5vw,20px)] right-[clamp(12px,1.5vw,20px)] h-[1px] bg-[#000]/15"
                      style={{ transformOrigin: "left" }}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 1.2,
                        ease: "easeInOut",
                        delay: rowIndex * 0.05 + (i % 4) * 0.1,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* MOBILE 2-COLUMN GRID */}
          <div className="grid grid-cols-2 gap-3 md:hidden">
            {companies.map((company, i) => (
              <PortfolioCard key={`mob-${company.name}`} company={company} index={i} />
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}