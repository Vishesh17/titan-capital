"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  HERO_BODY_CLASS,
  HERO_BODY_STYLE,
  SECTION_HEADING_CLASS,
  SECTION_HEADING_STYLE,
} from "@/styles/heroTypography";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ─────────────────────────────────────────────────────────
   Animated background glow — same moving left/right blobs plus
   cursor-follow blob as IndicornSpotlight's HeroGlow.
   ───────────────────────────────────────────────────────── */
function HeroGlow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const normX = useMotionValue(0);
  const normY = useMotionValue(0);

  const cursorSpring = { damping: 25, stiffness: 250, mass: 0.3 };
  const smoothX = useSpring(mouseX, cursorSpring);
  const smoothY = useSpring(mouseY, cursorSpring);

  const ambientSpring = { damping: 30, stiffness: 70, mass: 1 };
  const smoothNormX = useSpring(normX, ambientSpring);
  const smoothNormY = useSpring(normY, ambientSpring);

  useEffect(() => {
    if (typeof window !== "undefined" && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(rect.width / 2);
      mouseY.set(rect.height / 2);
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      }
      normX.set((e.clientX / window.innerWidth) * 2 - 1);
      normY.set((e.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, normX, normY]);

  const leftX = useTransform(smoothNormX, [-1, 1], ["-8%", "8%"]);
  const leftY = useTransform(smoothNormY, [-1, 1], ["-8%", "8%"]);
  const rightX = useTransform(smoothNormX, [-1, 1], ["8%", "-8%"]);
  const rightY = useTransform(smoothNormY, [-1, 1], ["8%", "-8%"]);

  return (
    /* Desktop only. The blobs are sized in `vw` and anchored to the section's
       corners, which fills a 100vh panel nicely — but on a phone the section
       runs much taller than the viewport, so the same blobs shrink to stray
       blue patches floating mid-section. The cursor-follow blob is worse
       still: with no pointer it parks wherever it was initialised. */
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-0 max-md:hidden"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          left: "-25%", top: "-25%", width: "min(75vw, 100vh)", height: "min(75vw, 100vh)",
          zIndex: 0, x: leftX, y: leftY, willChange: "transform",
        }}
      >
        <motion.div
          className="w-full h-full rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, #5054B5 0%, #054EB6 40%, #022250 80%, transparent 100%)", opacity: 0.6 }}
          animate={{ x: ["0%", "35%", "-15%", "25%", "0%"], y: ["0%", "25%", "-10%", "35%", "0%"], scale: [1, 1.15, 0.85, 1.1, 1] }}
          transition={{ duration: 18, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
        />
      </motion.div>

      <motion.div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          right: "-25%", bottom: "-25%", width: "min(70vw, 90vh)", height: "min(70vw, 90vh)",
          zIndex: 0, x: rightX, y: rightY, willChange: "transform",
        }}
      >
        <motion.div
          className="w-full h-full rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, #AC71C6 0%, #033699 50%, #001A4D 80%, transparent 100%)", opacity: 0.5 }}
          animate={{ x: ["0%", "-35%", "15%", "-25%", "0%"], y: ["0%", "-25%", "10%", "-35%", "0%"], scale: [1, 1.15, 0.85, 1.1, 1] }}
          transition={{ duration: 21, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
        />
      </motion.div>

      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 rounded-full blur-[60px]"
        style={{
          width: "25vw", height: "25vw", zIndex: 5, x: smoothX, y: smoothY,
          translateX: "-50%", translateY: "-50%", opacity: 0.65,
          background: "radial-gradient(circle, rgba(150,158,240,0.95) 0%, rgba(70,120,225,0.6) 40%, rgba(5,78,182,0.25) 70%, transparent 100%)",
          willChange: "transform",
        }}
      />
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

// Types can match your wrapper definition
export interface PortfolioCompany {
  name: string;
  logoUrl: string;
  description: string;
  /** Per-logo size multiplier — some logos have more built-in padding and
      read smaller at the same box height. Defaults to 1. */
  scale?: number;
}

export interface IndicornCompaniesData {
  heading?: string;
  companies?: PortfolioCompany[];
}

const FALLBACK_HEADING = "Indicorns We Backed";

const fallbackData: PortfolioCompany[] = [
  {
    name: "Unicommerce",
    logoUrl: "/images/portfolio_grid/unicommerce-logo.png", // Replace with your logo path
    description:
      "India's leading e-commerce SaaS platform, enabling thousands of brands to manage multi-channel operations.",
    scale: 0.8,
  },
  {
    name: "Razorpay",
    logoUrl: "/images/portfolio_grid/Razorpay-logo.png", // Replace with your logo path
    description:
      "India's leading payments platform, powering online transactions for over 10 million businesses.",
    scale: 1.5,
  },
  {
    name: "OfBusiness",
    logoUrl: "/images/portfolio_grid/Ofbusiness.png", // Replace with your logo path
    description:
      "India's largest B2B raw materials platform, combining procurement and financing for manufacturing SMEs.",
    scale: 1.5,
  },
  {
    name: "Credgenics",
    logoUrl: "/images/portfolio_grid/credgenics.png", // Replace with your logo path
    description:
      "India's leading AI-powered debt collections platform, helping banks and lenders improve recovery efficiency.",
    scale: 1.5,
  },
];

export default function IndicornCompaniesClient({
  data,
}: {
  data?: IndicornCompaniesData | null;
}) {
  const heading = data?.heading || FALLBACK_HEADING;
  const companies = data?.companies?.length ? data.companies : fallbackData;

  /* Columns follow the company count, targeting TWO ROWS — so the layout
     re-flows on its own as companies are added, with no code change:
       3 or fewer → one row      4 → 2x2      5, 6 → 3x2      8 → 4x2
     Below `lg` this is overridden back to 1/2 columns by the classes. */
  const cols = companies.length <= 3 ? companies.length : Math.ceil(companies.length / 2);

  return (
    <section
      className="relative flex w-full items-start overflow-hidden bg-[#040e24] font-['Poppins',_sans-serif] max-md:!min-h-[100vh] max-md:!static"
      style={{
        // Sticky-reveal: this section pins to the top of the viewport
        // while the testimonial section below scrolls up and covers it —
        // identical choreography to IndicornSpotlight → FoundersTestimonial
        // on the home page.
        // MOBILE: position: static override via max-md:!static class
        position: "sticky",
        top: 0,
        zIndex: 1,
        /* Full screen. Also what the sticky reveal wants: the testimonial
           below scrolls up over this panel, and its rounded top corners only
           read as a curve while there is dark section behind them. */
        minHeight: "100vh",
        /* Only the navbar height plus a small cushion — NOT a full
           --section-py on top of it. This section is pinned at top:0 under the
           fixed navbar, so it has to clear the nav (a sibling like
           WhyIndicorns doesn't and uses --section-py alone). Keeping it to the
           minimum frees the height for the card gaps below. */
        paddingTop: "calc(var(--nav-height) + clamp(14px, 2vh, 32px))",
        paddingBottom: "var(--section-py)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      {/* Animated background glow (moving blobs + cursor-follow blob) */}
      <HeroGlow />

      <motion.div
        className="relative z-10 mx-auto max-w-[1050px] flex w-full flex-col"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        {/* Heading */}
        <motion.h2
     variants={itemVariants}
     className={`m-0 text-center font-semibold text-white max-md:!mb-[clamp(32px,6dvh,48px)] ${SECTION_HEADING_CLASS}`}
     style={{
      ...SECTION_HEADING_STYLE,
      marginBottom: "clamp(26px, min(3.6vw, 5.1vh), 96px)",
     }}
    >
          {heading}
        </motion.h2>

        {/* Cards Grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))] gap-[clamp(30px,min(4.2vw,5.8vh),92px)]"
          /* `gridAutoRows: 1fr` makes EVERY row the same height, so a card
             with a long description can't make its row taller than the other.
             Within a row, items already stretch. Together that means all
             cards are identical in size regardless of content length. */
          style={{ "--cols": cols, gridAutoRows: "1fr" } as React.CSSProperties}
        >
          {companies.map((company, index) => (
            <motion.div
              key={company.name + index}
              variants={itemVariants}
              className="relative bg-[#FBF7F0] rounded-[2px] flex flex-col shadow-xl"
              /* Tighter inset than before: the description gets more usable
                 width inside the same column, so it wraps to fewer lines and
                 the card ends up shorter. The smaller top inset also lifts
                 the logo. */
              style={{
                padding: "clamp(18px,min(2.4vw,3.5vh),56px)",
                paddingTop: "clamp(18px,min(2.3vw,3.3vh),56px)",
              }}
            >
              {/* Paperclip Image */}
              <div className="absolute -top-[24px] -left-[16px] w-[clamp(56px,6vw,80px)] h-[clamp(56px,6vw,80px)] z-10 pointer-events-none drop-shadow-md">
                <img
                  src="/images/indicorns/clip.png"
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Logo (No white background box) — center-aligned so logos of
                  different optical sizes (via per-logo scale) line up on a
                  common centre line. */}
              <div
                className="w-full flex items-center justify-start"
                style={{
                  height: "clamp(54px,min(6vw,8.4vh),116px)",
                  marginBottom: "clamp(6px,min(0.8vw,1.15vh),12px)",
                }}
              >
                <img
                  src={company.logoUrl}
                  alt={`${company.name} logo`}
                  className="max-h-full max-w-[clamp(120px,14vw,220px)] object-contain mix-blend-multiply"
                  style={{
                    transform: `scale(${company.scale ?? 1})`,
                    transformOrigin: "left center",
                  }}
                />
              </div>

              {/* Description */}
              <p className={`font-normal m-0 text-[#1a1a1a] ${HERO_BODY_CLASS}`} style={HERO_BODY_STYLE}>
                {company.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}