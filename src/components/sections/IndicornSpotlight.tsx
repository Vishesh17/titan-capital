"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

/*
  RESPONSIVE STRATEGY — clamp(MIN, min(vw-fluid, vh-fluid), MAX)
  Design ref: 1440 × 982.
*/

const indicornLogos: { src: string; alt: string; mode: "transparent" | "opaqueBg" | "white"; scale: number }[] = [
  { src: "/images/logos/Razorpay.webp",       alt: "Razorpay",   mode: "opaqueBg",    scale: 1.9 },
  { src: "/images/portfolio_grid/unicommerce-logo.png",       alt: "Unicommerce",  mode: "transparent", scale: 1.8 },
  { src: "/images/logos/ofbusiness_white.svg", alt: "OfBusiness", mode: "white",       scale: 1.0 },
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
      className="relative flex w-full items-center overflow-hidden max-md:!pt-[60px] max-md:!pb-[60px]"
      style={{
        background:    "radial-gradient(197.93% 77.97% at 24.55% 26.31%, #003CB3 0%, #001A4D 100%)",
        minHeight:     "clamp(250px, min(27.85vw, 40.84vh), 401px)",
        paddingTop:    "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingBottom: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingLeft:   "var(--section-px-wide)",
        paddingRight:  "var(--section-px-wide)",
      }}
    >
      <div
        className="relative mx-auto grid w-full max-w-[1280px] grid-cols-1 md:grid-cols-2 items-center max-md:!gap-[40px]"
        style={{ gap: "clamp(24px, min(3.33vw, 4.89vh), 48px)" }}
      >

        {/* ── LEFT SIDE CONTENT ── */}
        <div
          className="flex flex-col items-center text-center md:items-start md:text-left max-md:!max-w-full max-md:!gap-[24px]"
          style={{
            maxWidth: "clamp(380px, min(48.26vw, 70.77vh), 695px)",
            gap:      "clamp(12px, min(1.67vw, 2.44vh), 24px)",
          }}
        >
          {/* Main Heading */}
          <h2
            className="m-0 font-['Libre_Baskerville',_serif] font-medium text-[#FBF7F0] max-md:!text-[28px] max-md:!leading-[1.15]"
            style={{
              fontSize:   "clamp(18px, min(2.5vw, 3.67vh), 36px)",
              lineHeight: "140%",
            }}
          >
            Indicorns: Celebrating<br className="block md:hidden" /> India&apos;s Enduring<br className="block md:hidden" /> Startups
          </h2>

          {/* Subheading bullets */}
          <p
            // FIXED: Added max-md:!text-[11.5px], max-md:!flex-nowrap, and max-md:whitespace-nowrap to lock it to one line
            className="m-0 flex flex-wrap items-center justify-center md:justify-start font-['Libre_Baskerville',_serif] font-semibold text-[#D3E2FF] max-md:!text-[11.5px] max-md:!flex-nowrap max-md:whitespace-nowrap max-md:!gap-[6px]"
            style={{
              fontSize:   "clamp(11px, min(1.39vw, 2.04vh), 20px)",
              lineHeight: "155%",
              gap:        "clamp(4px, min(0.56vw, 0.81vh), 8px)",
            }}
          >
            <span>Profitable</span>
            <span
              // FIXED: Added max-md:!text-[14px] to shrink the bullet points on mobile so they don't break the line
              className="inline-flex select-none items-center justify-center text-[#D3E2FF] max-md:!text-[14px]"
              style={{ fontSize: "clamp(16px, min(2.36vw, 3.46vh), 34px)" }}
            >
              &bull;
            </span>
            <span>₹100 Cr+ revenue</span>
            <span
              className="inline-flex select-none items-center justify-center text-[#D3E2FF] max-md:!text-[14px]"
              style={{ fontSize: "clamp(16px, min(2.36vw, 3.46vh), 34px)" }}
            >
              &bull;
            </span>
            <span>Founded &lt; 15 years</span>
          </p>

          {/* CTA Button */}
          <button
            className="group relative flex shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-[9px] border-none bg-white font-['Libre_Baskerville',_serif] font-semibold text-[#001A4D] shadow-md transition-all duration-300 max-md:!w-[240px] max-md:!h-[46px] max-md:!text-[14px]"
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
            className="flex items-center justify-center md:justify-start w-full max-md:!gap-[12px]"
            style={{
              gap:       "clamp(8px, min(1.11vw, 1.63vh), 16px)",
              marginTop: "clamp(4px, min(0.69vw, 1.02vh), 10px)",
            }}
          >
            <span
              className="font-sans font-medium uppercase tracking-wide text-white/60 max-md:!text-[12px]"
              style={{ fontSize: "clamp(9px, min(0.9vw, 1.32vh), 13px)" }}
            >
              Portfolio Indicorns
            </span>
            <div
              className="relative overflow-hidden max-md:!w-[100px] max-md:!h-[30px]"
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

       {/* ── RIGHT SIDE QUOTE ── */}
       <div
          // ADDED md:-mr-[20px] (optional): Use this to physically pull the box to the right if the parent container is constraining it. Adjust the 20px as needed.
          className="flex flex-col items-center text-center md:items-start md:text-left max-md:!max-w-full max-md:!px-4 max-md:!gap-[16px] md:-mr-[20px]"
          style={{
            // INCREASED DESKTOP MAX-WIDTH: Allows the text to flow further right before wrapping (changed max from 475px to 600px)
            maxWidth:    "clamp(260px, min(48vw, 62vh), 630px)",
            gap:         "clamp(6px, min(0.83vw, 1.22vh), 12px)",
          }}
        >
          <p
            className="m-0 font-['Poppins',_sans-serif] italic text-white max-md:!text-[15px] max-md:!leading-[1.5]"
            style={{
              fontSize:   "clamp(16px, min(1.94vw, 2.85vh), 28px)",
              fontWeight: 300,
              lineHeight: "126%",
            }}
          >
            &ldquo;For too long, success in the startup world has been equated solely with sky-high valuations. With Indicorns, we&apos;re celebrating a different kind of success — one rooted in fundamentals like profitability, sustainable growth, and real impact.&rdquo;
          </p>
          <p
            className="m-0 font-['Poppins',_sans-serif] font-normal tracking-wide text-white/80 max-md:!text-[14px]"
            style={{ 
              fontSize: "clamp(12px, min(1.38vw, 2.03vh), 20px)" 
            }}
          >
            - Titan Capital
          </p>
        </div>

      </div>
    </section>
  );
}