"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

/*
  RESPONSIVE STRATEGY — clamp(MIN, min(vw-fluid, vh-fluid), MAX)
  Design ref: 1440 × 982.

  FIGMA SPECS:
    Section gradient: radial-gradient(197.93% 77.97% at 24.55% 26.31%, #003CB3, #001A4D)
    Left block:  left 63px, top 50px, max-width 695px
    Right quote:  right 112px, top 81px, width 475px
                  Poppins / 20px / italic / 300 / lh 126% / #FFF
    Citation:     Poppins / 16px / normal / 400 / #FFF80
*/

/*
  Logo rendering on dark background:
    - "transparent" logos (SVGs, PNGs/webp with alpha): brightness(0) invert(1) → white silhouette
    - "opaqueBg" logos (webp with white background, no alpha): invert(1) brightness(5) + mix-blend-mode:screen
      → white bg inverts to black, dark text inverts to light, brightness cranks to pure white,
        screen blend makes black transparent on the dark section background.
    - "white" logos: already white, no filter needed.
*/
const indicornLogos: { src: string; alt: string; mode: "transparent" | "opaqueBg" | "white"; scale: number }[] = [
  { src: "/images/logos/Razorpay.webp",       alt: "Razorpay",   mode: "opaqueBg",    scale: 1.6 },
  { src: "/images/logos/Shadowfax.svg",       alt: "Shadowfax",  mode: "transparent", scale: 1.0 },
  { src: "/images/logos/ofbusiness_white.svg", alt: "OfBusiness", mode: "white",       scale: 1.0 },
  { src: "/images/logos/mamaearthpng.webp",   alt: "Mamaearth",  mode: "opaqueBg",    scale: 1.6 },
  { src: "/images/logos/GIVA.webp",           alt: "GIVA",       mode: "transparent", scale: 0.7 },
  { src: "/images/logos/Credgenics.svg",      alt: "Credgenics", mode: "transparent", scale: 1.0 },
];

export default function IndicornsSpotlight() {
  const [logoIndex, setLogoIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setLogoIndex((prev) => (prev + 1) % indicornLogos.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const currentLogo = indicornLogos[logoIndex];

  return (
    <section
      className="relative flex w-full items-center overflow-hidden"
      style={{
        background:    "radial-gradient(197.93% 77.97% at 24.55% 26.31%, #003CB3 0%, #001A4D 100%)",
        minHeight:     "clamp(250px, min(27.85vw, 40.84vh), 401px)",
        paddingTop:    "clamp(24px, min(3.47vw, 5.09vh), 50px)",
        paddingBottom: "clamp(24px, min(3.47vw, 5.09vh), 50px)",
        paddingLeft:   "var(--section-px-wide)",
        paddingRight:  "var(--section-px-wide)",
      }}
    >
      {/* Centered bounding wrapper — capped at the shared 1280 content column
          (same as WhatFoundersGet) so the left text aligns to the exact same
          gutter as every other section. items-start aligns both columns to top. */}
      <div
        className="relative mx-auto flex w-full max-w-[1280px] items-start"
        style={{ gap: "clamp(24px, min(3.33vw, 4.89vh), 48px)" }}
      >

        {/* ── LEFT SIDE CONTENT ── */}
        <div
          className="flex shrink-0 flex-col items-start"
          style={{
            maxWidth: "clamp(380px, min(48.26vw, 70.77vh), 695px)",
            gap:      "clamp(12px, min(1.67vw, 2.44vh), 24px)",
          }}
        >
          {/* Main Heading */}
          <h2
            className="m-0 font-['Libre_Baskerville',_serif] font-medium text-[#FBF7F0]"
            style={{
              fontSize:   "clamp(18px, min(2.5vw, 3.67vh), 36px)",
              lineHeight: "140%",
            }}
          >
            Indicorns: Celebrating India&apos;s Enduring Startups
          </h2>

          {/* Subheading bullets */}
          <p
            className="m-0 flex flex-wrap items-center font-['Libre_Baskerville',_serif] font-semibold text-[#D3E2FF]"
            style={{
              fontSize:   "clamp(11px, min(1.39vw, 2.04vh), 20px)",
              lineHeight: "155%",
              gap:        "clamp(4px, min(0.56vw, 0.81vh), 8px)",
            }}
          >
            <span>Profitable</span>
            <span
              className="inline-flex select-none items-center justify-center text-[#D3E2FF]"
              style={{ fontSize: "clamp(16px, min(2.36vw, 3.46vh), 34px)" }}
            >
              &bull;
            </span>
            <span>₹100 Cr+ revenue</span>
            <span
              className="inline-flex select-none items-center justify-center text-[#D3E2FF]"
              style={{ fontSize: "clamp(16px, min(2.36vw, 3.46vh), 34px)" }}
            >
              &bull;
            </span>
            <span>Founded &lt; 15 years</span>
          </p>

          {/* CTA Button */}
          <button
            className="group relative flex shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-[9px] border-none bg-white font-['Libre_Baskerville',_serif] font-semibold text-[#001A4D] shadow-md transition-all duration-300"
            style={{
              height:    "clamp(32px, min(3.26vw, 4.79vh), 47px)",
              width:     "clamp(130px, min(13.82vw, 20.26vh), 199px)",
              fontSize:  "clamp(11px, min(1.11vw, 1.63vh), 16px)",
              padding:   "clamp(6px, 0.69vw, 10px)",
              marginTop: "clamp(4px, min(0.69vw, 1.02vh), 10px)",
            }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
              e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
            }}
          >
            {/* The Dynamic Spotlight Layer (Soft blue glow for white button) */}
            <div 
              className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100" 
              style={{ 
                background: 'radial-gradient(circle 70px at var(--mouse-x, 50%) var(--mouse-y, 50%), #D6E4FF 0%, transparent 100%)' 
              }} 
            />
            
            <span className="relative z-10 text-center">Meet the Indicorns</span>
          </button>

          {/* Portfolio Indicorns Row — animated logo */}
          <div
            className="flex items-center"
            style={{
              gap:       "clamp(8px, min(1.11vw, 1.63vh), 16px)",
              marginTop: "clamp(4px, min(0.69vw, 1.02vh), 10px)",
            }}
          >
            <span
              className="font-sans font-medium uppercase tracking-wide text-white/60"
              style={{ fontSize: "clamp(9px, min(0.9vw, 1.32vh), 13px)" }}
            >
              Portfolio Indicorns
            </span>
            <div
              className="relative overflow-hidden"
              style={{
                width:  "clamp(70px, min(7.99vw, 11.71vh), 115px)",
                height: "clamp(22px, min(2.43vw, 3.56vh), 35px)",
              }}
            >
              {indicornLogos.map((logo, i) => {
                const filterStyle =
                  logo.mode === "white"       ? "none" :
                  logo.mode === "transparent" ? "brightness(0) invert(1)" :
                  /* opaqueBg */                "invert(1) grayscale(1) brightness(10)";
                const blendMode = logo.mode === "opaqueBg" ? "screen" as const : "normal" as const;

                return (
                  <div
                    key={logo.alt}
                    className="absolute inset-0 transition-all duration-500 ease-in-out"
                    style={{
                      opacity:   i === logoIndex ? 1 : 0,
                      transform: i === logoIndex ? "translateY(0)" : "translateY(8px)",
                      mixBlendMode: blendMode,
                    }}
                  >
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      fill
                      sizes="115px"
                      style={{
                        objectFit:      "contain",
                        objectPosition: "left",
                        filter:         filterStyle,
                        transform:      `scale(${logo.scale})`,
                        transformOrigin: "left center",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDE QUOTE ──
            Figma: right 112px from section edge, top 81px, width 475px.
            Using marginLeft:auto + fluid marginRight to maintain ratio.
            112/1440 = 7.78vw, 112/982 = 11.41vh
        */}
        <div
          className="flex flex-col items-start"
          style={{
            width:       "clamp(260px, min(32.99vw, 48.37vh), 475px)",
            flexShrink:  0,
            marginLeft:  "auto",
            marginRight: "clamp(30px, min(7.78vw, 11.41vh), 112px)",
            gap:         "clamp(6px, min(0.83vw, 1.22vh), 12px)",
          }}
        >
          <p
            className="m-0 font-['Poppins',_sans-serif] italic text-white"
            style={{
              fontSize:   "clamp(11px, min(1.39vw, 2.04vh), 20px)",
              fontWeight: 300,
              lineHeight: "126%",
            }}
          >
            &ldquo;For too long, success in the startup world has been equated solely with sky-high valuations. With Indicorns, we&apos;re celebrating a different kind of success — one rooted in fundamentals like profitability, sustainable growth, and real impact.&rdquo;
          </p>
          <p
            className="m-0 font-['Poppins',_sans-serif] font-normal tracking-wide text-white/80"
            style={{ fontSize: "clamp(10px, min(1.11vw, 1.63vh), 16px)" }}
          >
            - Kunal Bahl
          </p>
        </div>

      </div>
    </section>
  );
}
