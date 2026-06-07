"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

/*
  RESPONSIVE STRATEGY — pure fluid CSS, height- AND width-aware.

  Every size is written as clamp(MIN, min(vw-fluid, vh-fluid), MAX):
    - MAX  = the design value (Figma spec). Caps growth on huge monitors.
    - vw-fluid = design_value / 1440 * 100 — scales with viewport width.
    - vh-fluid = design_value / 982  * 100 — scales with viewport height.
    - min(vw, vh) makes the value shrink based on WHICHEVER axis is tighter.
       This is why the hero now fits on wide-but-short screens like Windows
       1920×1080 @ 125% / 150% (effective 1536×864 / 1280×720), where height
       is the binding constraint.
    - MIN = legibility floor; the value never goes below this.
*/

const founderSlots = [
  { size: "large", pool: [{ name: "Abhiraj Singh Bhal", role: "Co-Founder, Urban Company", image: "/images/hero_founders_images/abhiraj_bahl.png" }, { name: "Ashutosh Valani", role: "Co-Founder, RENÉE Cosmetics", image: "/images/hero_founders_images/ashutosh-valani.png" }] },
  { size: "small", pool: [{ name: "Abhishek Bansal", role: "Co-Founder and CEO, Shadowfax", image: "/images/hero_founders_images/abhishek-bansal.png" }, { name: "Ishendra Agarwal", role: "Co-Founder, GIVA", image: "/images/hero_founders_images/ishendra-agarwal.png" }] },
  { size: "small", pool: [{ name: "Ruchi Kalra", role: "Co-Founder & CFO, Ofbusiness", image: "/images/hero_founders_images/ruchi-kalra.png" }, { name: "Anand Agrawal", role: "Co-Founder & CPTO, Credgenics", image: "/images/hero_founders_images/anand-agarwal.png" }] },
  { size: "small", pool: [{ name: "Varun Khaitan", role: "Co-Founder, Urban Company", image: "/images/hero_founders_images/varun-khaitan.png" }, { name: "Bhavish Aggarwal", role: "CEO of Ola Cabs", image: "/images/hero_founders_images/bhavish-aggarwal.png" }] },
  { size: "large", pool: [{ name: "Ghazal Alagh", role: "Co-Founder, Mamaearth", image: "/images/hero_founders_images/ghazal-alagh.png" }, { name: "Shashank Kumar", role: "Co-Founder, Razorpay", image: "/images/hero_founders_images/shashank-kumar.png" }] },
];

/*
  cs(n) → calc(var(--lw) * n/278)
  Expresses any card sub-dimension as a fraction of the large-card width
  (--lw), so the entire card cluster scales from ONE base. Design ref: the
  large card is 278px wide, so 278 → 1.0, 240 → 0.863, 14 → 0.050, etc.
*/
const cs = (n: number) => `calc(var(--lw) * ${(n / 278).toFixed(5)})`;

export default function Hero() {
  const [currentIndices, setCurrentIndices] = useState([0, 0, 0, 0, 0]);

  useEffect(() => {
    const triggerStaggeredFlip = async () => {
      for (let i = 0; i < 5; i++) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setCurrentIndices((prev) => { const next = [...prev]; next[i] = (next[i] + 1) % founderSlots[i].pool.length; return next; });
      }
    };
    const interval = setInterval(triggerStaggeredFlip, 6500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="hero-section relative flex w-full flex-col items-center justify-center overflow-hidden bg-[#FBF7F0]"
      style={{
        marginTop: "var(--nav-height)",
        minHeight: "calc(100svh - var(--nav-height))",
        paddingTop: "clamp(16px, 3.5vh, 44px)",
        paddingBottom: "clamp(16px, 3vh, 40px)",
        paddingLeft: "var(--section-px)",
        paddingRight: "var(--section-px)",
      }}
    >
      <div className="relative flex w-full max-w-[1440px] flex-col items-center">

        {/* HEADING — both lines sized to match every other section's heading.
            L1 (normal) = --heading-xl × 56/64, L2 (italic emphasis) = --heading-xl (64 cap),
            so "Founders" is the SAME size as the italic headings in WhatWeBelieve /
            BackedBefore / FoundersTestimonial. */}
        <h1
          className="relative z-10 mx-auto w-full text-center font-['Libre_Baskerville',_serif] font-normal leading-[110%] text-black"
          style={{
            maxWidth: "640px",
            fontSize: "calc(var(--heading-xl) * 0.875)", // 56/64
          }}
        >
          300+ bets. All on
          <span
            className="block font-semibold italic leading-[120%] text-[#001A4D]"
            style={{ fontSize: "var(--heading-xl)" }}
          >
            Founders
          </span>
        </h1>

        {/* SUBHEAD — bigger (caps at 20px / Figma), wider box (726px Figma) */}
        <p
          className="hero-sub relative z-10 mx-auto w-full text-center font-['Poppins',_sans-serif] font-normal leading-[150%] text-[#323232]"
          style={{
            maxWidth: "726px",
            fontSize: "clamp(14px, min(1.6vw, 2.35vh), 20px)",
            marginTop: "clamp(8px, min(0.9vw, 1.32vh), 13px)",
            marginBottom: "clamp(16px, min(2.7vw, 3.97vh), 39px)",
          }}
        >
          We partner with founders from day one. We invest conviction, not
          just capital, and stay by their side through every stage of the
          journey.
        </p>

       {/* BUTTONS */}
       <div
          className="relative z-20 flex flex-row items-center justify-center"
          style={{
            gap: "clamp(12px, min(1.66vw, 2.44vh), 24px)",
            marginBottom: "clamp(16px, min(2.9vw, 4.28vh), 42px)",
          }}
        >
          {/* SECONDARY BUTTON */}
          <Link
            href="/portfolio"
            className="flex shrink-0 items-center justify-center p-[10px] font-['Libre_Baskerville',_serif] font-semibold leading-[107%] text-[#001A4D] transition-opacity hover:opacity-60 h-[clamp(40px,min(3.75vw,5.5vh),54px)] w-[clamp(140px,min(12.85vw,18.84vh),185px)] text-[clamp(13px,min(1.11vw,1.63vh),16px)]"
          >
            View Portfolio
          </Link>

          {/* PRIMARY BUTTON WITH CURSOR SPOTLIGHT */}
          <Link
            href="/get-investment"
            className="group relative m-0 flex shrink-0 items-center justify-center gap-[10px] overflow-hidden rounded-[clamp(7px,0.625vw,9px)] bg-[#001A4D] p-[10px] font-['Libre_Baskerville',_serif] font-semibold leading-[107%] text-[#F5F0E8] transition-all h-[clamp(40px,min(3.75vw,5.5vh),54px)] w-[clamp(140px,min(12.85vw,18.84vh),185px)] text-[clamp(13px,min(1.11vw,1.63vh),16px)]"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
              e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
            }}
          >
            {/* The Spotlight Gradient Layer */}
            <div 
              className="absolute inset-0 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100 z-0" 
              style={{ 
                background: 'radial-gradient(circle 80px at var(--mouse-x, 50%) var(--mouse-y, 50%), #003CB3 0%, transparent 100%)' 
              }} 
            />
            
            <span className="relative z-10">Get Investment</span>
          </Link>
        </div>

        {/* CARDS ROW — overlap less on short screens (max picks the less-negative value)

           SINGLE-BASE SCALING (fixes the card-inconsistency bug):
           --lw = the LARGE card width. Every card dimension (small width,
           padding, gap, fonts, radii) is derived from --lw via cs(), so the
           large:small ratio is ALWAYS 278:240 and the text always scales WITH
           the card — no clamp-segment drift, identical at every zoom level.
           At MacBook 14" --lw caps at 278px → pixel-identical to the approved
           design. */}
        <div
          className="hero-cards-overlap relative z-0 w-full"
          style={{
            marginTop: "clamp(-72px, max(-6.67vw, -9.78vh), -24px)",
            // single source of truth for the whole card cluster.
            // Goal: ~1.1× the original design size (large card 278→306) so the
            // cluster is wider and the left/right whitespace shrinks — WITHOUT
            // ever overflowing the viewport (hero must stay fully visible).
            //   • cap 306  = 1.1 × 278   → full 1.1× on large screens
            //   • 31.14vh  = 1.1 × 28.31 → full 1.1× height on most laptops
            //   • 19.86vw  = WIDTH SAFETY. The 5-card cluster ≈ --lw × 4.83, so
            //     19.86vw keeps it ≤ ~96vw — the squarest screens (≈3:2) settle
            //     a touch under 1.1× rather than spilling past the edges. min()
            //     picks whichever binds first; 1.1× fits everywhere.
            ["--lw" as string]: "clamp(165px, min(19.86vw, 31.14vh), 306px)",
          }}
        >
          <div
            className="mx-auto flex w-full items-end justify-center"
            style={{ gap: cs(17) }}
          >
            {founderSlots.map((slot, i) => {
              const currentFounder = slot.pool[currentIndices[i]];
              const isLarge = slot.size === "large";

              return (
                <div key={i} className="shrink-0" style={{ perspective: "1200px" }}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentIndices[i]}
                      initial={{ rotateY: -90, opacity: 0, scale: 0.95 }}
                      animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                      exit={{ rotateY: 90, opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className={`flex flex-col items-start bg-white shadow-[0_4px_14.8px_0_rgba(101,101,101,0.25)] ${
                        isLarge ? "aspect-[278/386]" : "aspect-[240/294]"
                      }`}
                      style={{
                        transformStyle: "preserve-3d",
                        width:        isLarge ? cs(278) : cs(240),
                        gap:          isLarge ? cs(10)  : cs(4),
                        borderRadius: cs(12),
                        padding:      isLarge
                          ? `${cs(14)}`
                          : `${cs(14)} ${cs(18)}`,
                      }}
                    >
                      <div
                        className={`relative shrink-0 w-full overflow-hidden ${
                          isLarge ? "aspect-[251/291]" : "aspect-[211/223]"
                        }`}
                        style={{ borderRadius: cs(5) }}
                      >
                        <Image
                          src={currentFounder.image}
                          alt={currentFounder.name}
                          fill
                          style={{ objectFit: "cover" }}
                          sizes={isLarge ? "(max-width: 1440px) 19.3vw, 278px" : "(max-width: 1440px) 16.67vw, 240px"}
                        />
                      </div>

                      <div className="flex w-full flex-col" style={{ paddingTop: cs(5) }}>
                        <p
                          className="w-full font-['Libre_Baskerville',_serif] font-bold leading-[119%] text-black"
                          style={{ fontSize: isLarge ? cs(20) : cs(16) }}
                        >
                          {currentFounder.name}
                        </p>
                        <p
                          className="w-full font-['Poppins',_sans-serif] font-light leading-[119%] text-black"
                          style={{ fontSize: cs(12), marginTop: cs(4) }}
                        >
                          {currentFounder.role}
                        </p>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
