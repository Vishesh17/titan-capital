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
const FALLBACK_HEADING_FIRST = "Winners Fund";
const FALLBACK_HEADING_SECOND = "Portfolio Companies";
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

/**
 * Brands whose logo doesn't survive a plain `brightness(0) invert(1)`
 * filter (monogram-style: filled tile + glyph on top — invert turns
 * everything white including the glyph). For these we ship a
 * pre-rendered "flipped variant" PNG with the white silhouette +
 * transparent glyph baked in, and cross-fade to it on hover instead
 * of applying the CSS filter.
 *
 * Key = company.name normalized (lowercase, no whitespace).
 */
const FLIPPED_VARIANTS: Record<string, string> = {
  "homerun": "/images/portfolio_grid_flipped/homerun.png",
};

function flippedVariantFor(name: string): string | undefined {
  return FLIPPED_VARIANTS[name.toLowerCase().replace(/\s+/g, "")];
}

/* ── Card component ──
   Default: white card, colored logo centred, nothing else.
   Hover  : navy bg, logo glides to top-left corner (slightly bigger
            than before), description + READ link fade in below.
   Position is animated with CSS `transition-all` on absolute top/left/
   transform so every property tweens smoothly — no discrete snap. */
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
        aspectRatio: "1 / 1",
        backgroundColor: isActive ? "#001A4D" : "#FFFFFF",
        transition: "background-color 0.55s ease-in-out",
      }}
    >
      {/* ── LOGO wrapper — shrinks vertically on hover to make room
             for the description. 54% keeps the logo 1.2× larger than
             the original 45%. ── */}
      <motion.div
        className="relative w-full shrink-0 overflow-hidden"
        animate={{ height: isActive ? "54%" : "100%" }}
        transition={{ duration: 0.55, ease: "easeInOut" }}
      >
        {/* Logo box — absolutely positioned, Framer Motion animates
            BOTH wrapper height AND box position so they stay in sync.
            Every animated property is a percentage so tweening is
            smooth with zero snapping. */}
        <motion.div
          className="absolute"
          initial={false}
          animate={{
            top: isActive ? "6%" : "50%",
            left: isActive ? "5%" : "50%",
            x: isActive ? "0%" : "-50%",
            y: isActive ? "0%" : "-50%",
          }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
          style={{ width: company.logoW, height: company.logoH }}
        >
          {flippedSrc ? (
            /* Brands with a pre-baked flipped variant — cross-fade. */
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
            /* Standard logos — CSS invert filter. */
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

      {/* ── DESCRIPTION + READ — only on hover ── */}
      <motion.div
        className="flex w-full flex-1 flex-col justify-between text-white"
        style={{ padding: "clamp(12px, 1.8vw, 22px)" }}
        animate={{ opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.45, ease: "easeInOut", delay: isActive ? 0.2 : 0 }}
      >
        <p
          className="m-0 font-['Poppins',_sans-serif] font-normal leading-[1.45]"
          style={{ fontSize: "clamp(11px, min(1vw, 1.5vh), 14px)" }}
        >
          {company.category}
        </p>
        <div className="mt-auto flex items-center gap-[6px] pt-2">
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
          <motion.div
            className="relative inline-flex items-center justify-center overflow-hidden bg-transparent px-[6px] py-[8px] md:px-[8px] md:py-[10px]"
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
            }}
          >
            <motion.span
              className="absolute inset-0 z-0 h-full w-full bg-[#D3E2FF]"
              style={{ transformOrigin: "left" }}
              variants={{
                hidden: { scaleX: 0 },
                visible: { scaleX: 1, transition: { duration: 0.6, ease: "easeInOut", delay: 0.5 } },
              }}
            />
            <span
              className="relative z-10 font-['Libre_Baskerville',_serif] font-semibold italic leading-[110%] text-[#001A4D] max-md:!text-[28px]"
              style={{ fontSize: "var(--heading-xl)" }}
            >
              {headingFirst}
            </span>
          </motion.div>

          <motion.h2
            className="mt-[clamp(4px,0.5vw,8px)] m-0 font-['Libre_Baskerville',_serif] font-semibold leading-[110%] text-[#001A4D] max-md:!text-[28px]"
            style={{ fontSize: "var(--heading-xl)" }}
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay: 0.2 } },
            }}
          >
            {headingSecond}
          </motion.h2>
        </motion.div>

        {/* ── CARD GRID ── */}
        <motion.div
          className="grid w-full grid-cols-2 gap-[clamp(12px,1.5vw,20px)] md:grid-cols-3 lg:grid-cols-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {companies.map((company, i) => (
            <PortfolioCard key={company.name} company={company} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
