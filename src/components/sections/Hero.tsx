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
  const [currentIndices, setCurrentIndices] = useState(() => founderSlots.map(() => 0));

  useEffect(() => {
    const triggerStaggeredFlip = async () => {
      for (let i = 0; i < founderSlots.length; i++) {
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
        paddingTop: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingBottom: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <div className="relative flex w-full max-w-[1440px] flex-col items-center">

        {/* HEADING — both lines sized to match every other section's heading.
            L1 (normal) = --heading-xl × 56/64, L2 (italic emphasis) = --heading-xl (64 cap),
            so "Founders" is the SAME size as the italic headings in WhatWeBelieve /
            BackedBefore / FoundersTestimonial. */}
        <h1
          className="relative z-10 mx-auto w-full text-center font-['Libre_Baskerville',_serif] font-normal leading-[110%] text-black text-[clamp(32px,11vw,64px)] lg:text-[length:calc(var(--heading-xl)_*_1.05)]"
          style={{ maxWidth: "720px" }}
        >
          <span className="block whitespace-nowrap">300+ bets.</span>
          <span className="block whitespace-nowrap">
            All on{" "}
            <span className="font-semibold italic text-[#001A4D]">
              Founders
            </span>
          </span>
        </h1>

        {/* SUBHEAD — bigger (caps at 20px / Figma), wider box (726px Figma) */}
        <p
          className="hero-sub relative z-10 mx-auto hidden w-full text-center font-['Poppins',_sans-serif] font-normal leading-[150%] text-[#323232] lg:block"
          style={{
            maxWidth: "726px",
            fontSize: "clamp(14px, min(1.6vw, 2.35vh), 20px)",
            marginTop: "clamp(8px, min(0.9vw, 1.32vh), 13px)",
            marginBottom: "clamp(16px, min(2.7vw, 3.97vh), 39px)",
          }}
        >
          The Titan Capital Winners Fund backs the companies in our portfolio that have already proven themselves, and are ready to own their category.
        </p>

       {/* BUTTONS — extra top gap on mobile (subtext is hidden there) */}
       <div
          className="relative z-20 mt-[clamp(36px,12vw,64px)] flex flex-row items-center justify-center lg:mt-0"
          style={{
            gap: "clamp(16px, min(2.2vw, 3.2vh), 32px)", // Increased gap to match larger buttons
            marginBottom: "clamp(16px, min(2.9vw, 4.28vh), 42px)",
          }}
        >
          {/* SECONDARY BUTTON - INCREASED SIZE */}
          <Link
            href="/portfolio"
            className="flex shrink-0 items-center justify-center p-[10px] font-['Libre_Baskerville',_serif] font-semibold leading-[107%] text-[#001A4D] transition-opacity hover:opacity-60"
            style={{
              height: "clamp(48px, min(5vw, 7vh), 64px)", // Increased from 40-54px to 48-64px
              width: "clamp(170px, min(16vw, 23vh), 220px)", // Increased from 140-185px to 170-220px
              fontSize: "clamp(15px, min(1.4vw, 2vh), 20px)" // Increased font size from 13-16px to 15-20px
            }}
          >
            View Portfolio
          </Link>

          {/* PRIMARY BUTTON WITH CURSOR SPOTLIGHT - INCREASED SIZE */}
          <Link
            href="/get-investment"
            className="group relative m-0 flex shrink-0 items-center justify-center gap-[10px] overflow-hidden rounded-[clamp(7px,0.625vw,9px)] bg-[#001A4D] p-[10px] font-['Libre_Baskerville',_serif] font-semibold leading-[107%] text-[#F5F0E8] transition-all"
            style={{
              height: "clamp(48px, min(5vw, 7vh), 64px)", // Increased from 40-54px to 48-64px
              width: "clamp(170px, min(16vw, 23vh), 220px)", // Increased from 140-185px to 170-220px
              fontSize: "clamp(15px, min(1.4vw, 2vh), 20px)" // Increased font size from 13-16px to 15-20px
            }}
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
          className="hero-cards-overlap relative z-0 hidden w-full lg:block"
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
            {founderSlots.slice(0, 5).map((slot, i) => {
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

        {/* ── MOBILE CARDS — Pure Flex Wrap for 3 up, 2 down ── */}
        <div
          className="flex w-full flex-wrap justify-center lg:hidden"
          style={{
            "--m-gap": "clamp(8px, 2.8vw, 16px)",
            gap: "var(--m-gap)",
            marginTop: "clamp(4px, 2vw, 16px)",
          } as React.CSSProperties}
        >
          {founderSlots.map((slot, i) => {
            const f = slot.pool[currentIndices[i]];
            return (
              <div
                key={i}
                className="relative shrink-0 aspect-[3/4]"
                style={{
                  width: "calc((100% - 2 * var(--m-gap)) / 3)",
                  perspective: "1000px"
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndices[i]}
                    initial={{ rotateY: -90, opacity: 0, scale: 0.95 }}
                    animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                    exit={{ rotateY: 90, opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    style={{ transformStyle: "preserve-3d" }}
                    className="absolute inset-0 flex flex-col items-start overflow-hidden rounded-[12px] bg-white p-[clamp(6px,2vw,10px)] shadow-[0_4px_14.8px_0_rgba(101,101,101,0.25)]"
                  >
                    <div className="relative w-full aspect-[1/1] shrink-0 overflow-hidden rounded-[6px]">
                      <Image
                        src={f.image}
                        alt={f.name}
                        fill
                        style={{ objectFit: "cover", objectPosition: "top" }}
                        sizes="33vw"
                      />
                    </div>
                    <div className="w-full pt-[clamp(4px,1.5vw,8px)]">
                      <p className="w-full font-['Libre_Baskerville',_serif] font-bold leading-[119%] text-black text-[clamp(6px,2.2vw,11px)] line-clamp-1">
                        {f.name}
                      </p>
                      <p className="mt-[2px] w-full font-['Poppins',_sans-serif] font-light leading-[120%] text-black text-[clamp(5px,1.8vw,9px)] line-clamp-2">
                        {f.role}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}