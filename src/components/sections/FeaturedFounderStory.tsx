"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { SECTION_HEADING_CLASS, SECTION_HEADING_STYLE } from "@/styles/heroTypography";

/*
  Z-ORDER:
    z-[5]   Photo + Logo — BEHIND TV (cutout images, never cropped)
    z-[10]  TV SVG — frame/bezel/dials overlap the photo bleed
    z-[15]  Name + Role — ABOVE TV (always legible)

  RESPONSIVE: all sizes use clamp(MIN, min(vw-fluid, vh-fluid), MAX)
  so they scale with whichever axis is tighter.
  Design ref: 1440 × 982.
*/

const slides = [
  {
    name: "Ashish Mahopatra",
    role: "Co-Founder and CEO, OfBusiness",
    image: "/images/misc/5.webp",
    logo: "/images/logos/Ofbusiness.webp",
    text: `"I like businesses that are under the radar. I make products that are far away from the limelight, because that is where a business is to be made."`,
  },
  {
    name: "Abhishek Bansal",
    role: "Co-Founder and CEO, Shadowfax",
    image: "/images/misc/6.webp",
    logo: "/images/logos/Shadowfax.svg",
    text: `"In India, logistics isn't just about speed. It's about reaching the right place even when the address is wrong."`,
  },
  {
    name: "Harshil\nMathur",
    role: "Co-founder and CEO of Razorpay",
    image: "/images/misc/3.webp",
    logo: "/images/logos/Razorpay.webp",
    text: `"We believed in Harshil's mission to simplify payments for every business in India."`,
  },
];

export default function FeaturedFounderStory() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [current]);

  const slide = slides[current];

  const tvGlitch: Variants = {
    initial: { opacity: 0, filter: "brightness(0%) grayscale(100%)", scaleY: 0.01 },
    animate: { opacity: 1, filter: "brightness(100%) grayscale(0%)", scaleY: 1, transition: { duration: 0.35, ease: "easeOut" } },
    exit:    { opacity: 0, filter: "brightness(0%) grayscale(100%)", scaleY: 0.01, transition: { duration: 0.15, ease: "easeIn" } },
  };

  const h1v: Variants = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };
  const hlv: Variants = { hidden: { scaleX: 0 }, visible: { scaleX: 1, transition: { duration: 0.5, ease: "easeInOut", delay: 0.6 } } };
  const h2v: Variants = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay: 1.1 } } };

  return (
    <section
      // MAGIC FIX 1: 'relative z-30' ensures this section slides cleanly OVER the previous section's overflow.
      className="relative z-30 flex w-full flex-col items-center justify-start bg-white"
      style={{
        gap:           "clamp(10px, min(1.66vw, 2.44vh), 24px)",
        // MAGIC FIX 2: Increased padding to match the exact mathematical rhythm of your other sections.
        paddingTop:    "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingBottom: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingLeft:   "var(--section-px-wide)",
        paddingRight:  "var(--section-px-wide)",
      }}
    >

      {/* ── 1. Heading ── */}
      <motion.div
        className="mx-auto flex w-full max-w-[828px] flex-col items-center justify-center text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.h2
          className={`m-0 text-center text-[#001A4D] ${SECTION_HEADING_CLASS}`}
          style={SECTION_HEADING_STYLE}
          variants={h1v}
        >
          <span className="relative inline-block overflow-hidden px-2.5" style={{ background: "transparent" }}>
            <motion.span className="absolute inset-0 z-0 bg-[#D3E2FF]" style={{ transformOrigin: "left" }} variants={hlv} />
            <span className="relative z-10">Their stories,</span>
          </span>
        </motion.h2>

        <motion.h2
          className={`m-0 mt-1 text-center text-[#001A4D] ${SECTION_HEADING_CLASS}`}
          style={SECTION_HEADING_STYLE}
          variants={h2v}
        >
          our credentials
        </motion.h2>
      </motion.div>

      {/* ── 2. TWO-COLUMN ROW: TV (left) · quote + button (right) ── */}
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center justify-center gap-[clamp(28px,min(4.8vw,7vh),68px)] lg:flex-row lg:items-center lg:justify-center mt-[clamp(24px,min(3.5vw,5vh),48px)]">

        {/* ── 2a. TV wrapper ── */}
        <div
          className="relative w-full shrink-0 overflow-hidden"
          style={{ maxWidth: "clamp(280px, min(45.13vw, 66.19vh), 650px)" }}
        >
          {/* ── LAYER 1: Photo + Logo — z-[5], BEHIND TV ── */}
          <div className="absolute left-[8%] top-[13%] z-[5] h-[72%] w-[58%]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`photo-${current}`}
                variants={tvGlitch}
                initial="initial"
                animate="animate"
                exit="exit"
                className="relative h-full w-full"
              >
                <div
                  className="absolute"
                  style={{ top: "0%", bottom: "0%", right: "-50%", width: "140%" }}
                >
                  <Image
                    src={slide.image}
                    alt={slide.name.replace("\n", " ")}
                    fill
                    sizes="(max-width: 1440px) 30vw, 400px"
                    style={{ objectFit: "cover", objectPosition: "bottom right" }}
                  />
                </div>
                <div
                  className="absolute"
                  style={{ bottom: "20%", left: "12%" }}
                >
                  <Image
                    src={slide.logo}
                    alt="Company logo"
                    width={148}
                    height={52}
                    style={{
                      objectFit:      "contain",
                      objectPosition: "left",
                      width:          "clamp(50px, min(8.61vw, 12.63vh), 124px)",
                      height:         "clamp(18px, min(3.02vw,  4.43vh),  44px)",
                      aspectRatio:    "37/13",
                    }}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── LAYER 2: TV SVG — z-[10] ── */}
          <Image
            src="/images/misc/television.svg"
            alt="Television frame"
            width={800}
            height={500}
            className="pointer-events-none relative z-[10] block h-auto w-full"
            sizes="(max-width: 1440px) min(45vw, 66vh), 650px"
            priority
          />

          {/* ── LAYER 3: Name + Role — z-[15], ABOVE TV ── */}
          <div className="absolute left-[8%] top-[13%] z-[15] flex h-[72%] w-[58%] items-start overflow-hidden pointer-events-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${current}`}
                variants={tvGlitch}
                initial="initial"
                animate="animate"
                exit="exit"
                className="relative h-full w-full"
              >
                <h3
                  className="absolute m-0 font-['Libre_Baskerville',_serif] text-black"
                  style={{
                    top:             "29%",
                    left:            "12%",
                    width:           "50%",
                    fontSize:        "clamp(11px, min(1.38vw, 2.04vh), 20px)",
                    fontWeight:      700,
                    lineHeight:      "100%",
                    whiteSpace:      "pre-wrap",
                    display:         "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow:        "hidden",
                  }}
                >
                  {slide.name}
                </h3>
                <p
                  className="absolute m-0 font-['Poppins',_sans-serif] text-black"
                  style={{
                    top:             "44%",
                    left:            "12%",
                    width:           "45%",
                    fontSize:        "clamp(9px, min(0.83vw, 1.22vh), 12px)",
                    fontWeight:      300,
                    lineHeight:      "119%",
                    display:         "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow:        "hidden",
                  }}
                >
                  {slide.role}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── 2b. RIGHT COLUMN: quote + button ── */}
        <div
          className="flex w-full flex-col items-center text-center"
          style={{
            maxWidth: "clamp(280px, min(33vw, 48.4vh), 475px)",
            gap:      "clamp(20px, min(2.6vw, 3.81vh), 36px)",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={current}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="m-0 w-full text-center font-['Poppins',sans-serif] font-normal leading-[1.5] text-black"
              style={{ fontSize: "clamp(14px, min(1.6vw, 2.35vh), 20px)" }}
            >
              {slide.text}
            </motion.p>
          </AnimatePresence>

          <button
            className="group relative flex shrink-0 cursor-pointer items-center justify-center gap-[10px] overflow-hidden rounded-[9px] border-none bg-[#001A4D] font-['Libre_Baskerville',_serif] font-semibold text-white transition-all duration-300 ease-in-out"
            style={{
              height:   "clamp(38px, min(3.75vw, 5.5vh),  54px)",
              width:    "clamp(130px, min(12.6vw, 18.5vh), 181px)",
              fontSize: "clamp(11px, min(1.04vw, 1.53vh),  15px)",
              padding:  "clamp(6px, 0.69vw, 10px)",
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
                background: 'radial-gradient(circle 80px at var(--mouse-x, 50%) var(--mouse-y, 50%), #003CB3 0%, transparent 100%)' 
              }} 
            />
            <span className="relative z-10 text-center">Read Full Story</span>
          </button>
        </div>

      </div>

      {/* ── 5. Pagination dots ── */}
      <div className="flex items-center gap-3 mt-[clamp(24px,min(3.5vw,5vh),48px)]">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`cursor-pointer border-none p-0 transition-all duration-300 ease-in-out ${
              current === i
                ? "h-[12px] w-8 rounded-[10px] bg-[#001A4D]"
                : "h-[12px] w-[12px] rounded-full bg-[#D3E2FF]"
            }`}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

    </section>
  );
}