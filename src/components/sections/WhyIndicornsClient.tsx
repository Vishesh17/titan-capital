"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BODY_BOLD_CLASS,
  HERO_BODY_CLASS,
  HERO_BODY_STYLE,
  LABEL_STYLE,
  SECTION_HEADING_CLASS,
  SECTION_HEADING_STYLE,
  SUBHEADING_CLASS,
  SUBHEADING_STYLE,
} from "@/styles/heroTypography";

const EASE = [0.22, 1, 0.36, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

const timelineData = [
  {
    date: "September 2024",
    title: "The term is coined\n'Indicorn'.",
    desc: '"Indicorn" is unveiled on the TechSparks main stage naming a kind of company that always existed but was never celebrated.',
    stats: null,
  },
  {
    date: "October 2024",
    title: "The First List",
    desc: "Titan Capital publishes the inaugural index, built to make the criteria clear and the data irrefutable.",
    stats: {
      number: "186",
      label: "Companies\nRecognized",
      sub: "Powered by Tracxn - 3M+ Companies, 2,700\nsector",
    },
  },
  {
    date: "2025",
    title: "The Moment Grows.",
    desc: "A year on, the index expands-proof that profitable, enduring businesses are scaling right across India.",
    stats: {
      number: "202",
      label: "Indicorns\nIdentified",
      sub: "₹1,51,137 Cr in revenue, ₹7,393 Cr in profits",
    },
  },
];

export default function WhyIndicorns() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-play effect: switch to the next card every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev === timelineData.length - 1 ? 0 : prev + 1));
    }, 3000);

    // Cleanup the interval on unmount or when activeIndex changes (manual click)
    return () => clearInterval(timer);
  }, [activeIndex]);

  // ── Mobile timeline carousel (swipe + dots) ──
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mobileIndex, setMobileIndex] = useState(0);

  const handleCarouselScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const step = el.scrollWidth / timelineData.length;
    const i = Math.round(el.scrollLeft / step);
    setMobileIndex(Math.max(0, Math.min(timelineData.length - 1, i)));
  };

  const scrollToCard = (i: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const step = el.scrollWidth / timelineData.length;
    el.scrollTo({ left: i * step, behavior: "smooth" });
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-[#FBF7F0] font-['Poppins',_sans-serif]"
      style={{
        paddingTop: "var(--section-py)",
        paddingBottom: "var(--section-py)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <motion.div
        className="mx-auto max-w-[1440px] flex w-full flex-col"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {/* Heading */}
        <motion.h2
     variants={itemVariants}
     className={`m-0 text-center font-semibold text-black max-md:!mb-[clamp(32px,6dvh,48px)] ${SECTION_HEADING_CLASS}`}
     style={{
      ...SECTION_HEADING_STYLE,
      marginBottom: "min(5.79vw, 8.95vh)",
     }}
    >
          Why We Created
          <br />
          The Indicorns?
        </motion.h2>

        {/* ══════════ MOBILE (< md) ══════════
            Order per design: heading → swipeable timeline cards + dots →
            story text → image. Desktop story/timeline are hidden below md. */}
        <div className="md:hidden">
          {/* Swipeable timeline cards */}
          <div
            ref={scrollRef}
            onScroll={handleCarouselScroll}
            className="flex snap-x snap-mandatory gap-[16px] overflow-x-auto -mx-[var(--section-px-wide)] px-[var(--section-px-wide)] pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {timelineData.map((item, index) => (
              <div
                key={index}
                className="flex shrink-0 snap-start flex-col rounded-[20px] border border-[#ECECEC] bg-white p-[28px] shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
                style={{ width: "76%" }}
              >
                <div
                  className="mb-[18px] h-[18px] w-[18px] rounded-full bg-[#0f2143]"
                  style={{ boxShadow: "0 0 0 4px rgba(15,33,67,0.10)" }}
                />
                <p className="m-0 mb-[8px] text-[13px] font-medium text-[#333]">
                  {item.date}
                </p>
                <h4 className={`m-0 mb-[12px] whitespace-pre-line text-black ${BODY_BOLD_CLASS}`} style={HERO_BODY_STYLE}>
                  {item.title}
                </h4>
                <p className={`font-normal m-0 text-[#4a4a4a] ${HERO_BODY_CLASS}`} style={HERO_BODY_STYLE}>
                  {item.desc}
                </p>
                {item.stats && (
                  <div className="mt-[20px]">
                    <div className="mb-[8px] flex items-center gap-[12px]">
                      <span className={`font-medium text-black ${SUBHEADING_CLASS}`}>
                        {item.stats.number}
                      </span>
                      <span className="whitespace-pre-line leading-tight text-[#4a4a4a]" style={LABEL_STYLE}>
                        {item.stats.label}
                      </span>
                    </div>
                    <p className="m-0 whitespace-pre-line leading-[1.4] text-[#6b6b6b]" style={LABEL_STYLE}>
                      {item.stats.sub}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination dots */}
          <div className="mt-[20px] flex justify-center gap-[8px]">
            {timelineData.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to card ${i + 1}`}
                onClick={() => scrollToCard(i)}
                className={`h-[7px] w-[7px] rounded-full transition-colors duration-300 ${
                  mobileIndex === i ? "bg-[#0f2143]" : "bg-[#0f2143]/25"
                }`}
              />
            ))}
          </div>

          {/* Story — text then image */}
          <div className="mt-[clamp(40px,10vw,64px)] flex flex-col">
            <h3 className={`font-medium m-0 mb-[clamp(16px,4vw,24px)] text-black ${SUBHEADING_CLASS}`}>
              September 2024
            </h3>
            <p className={`font-normal m-0 text-[#1a1a1a] ${HERO_BODY_CLASS}`} style={HERO_BODY_STYLE}>
              On the main stage of YourStory&apos;s TechSparks India&apos;s
              largest startup summit - Kunal Bahl introduced one word to the
              ecosystem: Indicorn.
              <br />
              <br />
              It wasn&apos;t just a new word. It was a challenge to change how
              India defines, celebrates, and aspires toward success measured in
              revenue and profit, not a valuation set in someone else&apos;s
              currency.
            </p>
            <img
              src="/images/indicorns/skyscrappers.png"
              alt="Skyscrapers looking up"
              className="mt-[clamp(24px,6vw,40px)] w-full rounded-[2px] object-cover"
            />
          </div>
        </div>

        {/* Top Story Section (desktop / tablet only) */}
        <motion.div
          variants={itemVariants}
          className="max-md:hidden grid grid-cols-1 lg:grid-cols-2 items-center gap-[clamp(48px,min(6vw,8vh),96px)] mb-[clamp(48px,min(7vw,10vh),120px)]"
        >
          {/* Image — fixed SQUARE (1:1), sized down via a capped width. Aligned
              to the RIGHT of its column so it sits closer to the text. */}
          <div className="w-full flex justify-end">
            <img
              src="/images/indicorns/skyscrappers.png"
              alt="Skyscrapers looking up"
              className="aspect-square w-full max-w-[clamp(320px,36vw,520px)] object-cover rounded-[2px] shadow-sm"
            />
          </div>

          {/* Story Text */}
          <div className="flex flex-col justify-center">
            <h3
              className={`font-medium m-0 text-black ${SUBHEADING_CLASS}`}
              style={{
                ...SUBHEADING_STYLE,
                marginBottom: "clamp(16px,min(1.85vw,2.86vh),28px)",
              }}
            >
              September 2024
            </h3>
            <p className={`font-normal m-0 text-[#1a1a1a] ${HERO_BODY_CLASS}`} style={HERO_BODY_STYLE}>
              On the main stage of YourStory's TechSparks India's largest
              startup summit - Kunal Bahl introduced one word to the ecosystem:
              Indicorn.
              <br />
              <br />
              It wasn't just a new word. It was a challenge to change how India
              defines, celebrates, and aspires toward success measured in
              revenue and profit, not a valuation set in someone else's
              currency.
            </p>
          </div>
        </motion.div>

        {/* Timeline Section (desktop / tablet only) */}
        <div className="max-md:hidden relative w-full">
          {/* Background Timeline Line (Desktop) — spans bullet-1 → bullet-3.
              Each bullet sits 43px from its card's left (1px border + 32px p-8
              + 10px radius); the span between the outer bullets is two column
              pitches = (200% - 2*gap)/3 + gap  with gap = 16px (md:gap-4). */}
          <div
            className="hidden md:block absolute top-[44px] h-[1px] bg-[#d3cec4] z-0"
            style={{ left: "43px", width: "calc((200% - 64px) / 3 + 32px)" }}
          />

          {/* Animated Active Timeline Line (Desktop) — same start/width, grows
              from the first bullet (origin-left). */}
          <motion.div
            className="hidden md:block absolute top-[43px] h-[3px] z-0 origin-left"
            initial={{ scaleX: 0 }}
            animate={{
              scaleX: activeIndex === 0 ? 0 : activeIndex === 1 ? 0.5 : 1
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{
              left: "43px",
              width: "calc((200% - 64px) / 3 + 32px)",
              background: "linear-gradient(90deg, #0f2143 0%, #4060a8 100%)"
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 relative z-10">
            {timelineData.map((item, index) => {
              const isActive = activeIndex === index;

              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  onClick={() => setActiveIndex(index)}
                  className={`p-8 pb-[clamp(40px,min(4.5vw,6vh),64px)] flex flex-col relative z-10 cursor-pointer overflow-hidden transition-all duration-500 ease-out ${
                    isActive
                      ? "bg-white rounded-[8px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#f0ebe1]"
                      : "bg-transparent border border-transparent hover:bg-white/40 rounded-[8px]"
                  }`}
                >
                  {/* Animated Loading Progress Bar (Bottom of Card) */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        key={`progress-${index}`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 3, ease: "linear" }}
                        className="absolute bottom-0 left-0 h-[4px] w-full origin-left bg-gradient-to-r from-[#0f2143] to-[#4060a8]"
                      />
                    )}
                  </AnimatePresence>

                  {/* Animated Bullet Point */}
                  <motion.div
                    animate={{
                      scale: isActive ? 1.2 : 1,
                      boxShadow: isActive
                        ? "0 0 0 6px rgba(15, 33, 67, 0.15), 0 0 16px rgba(15, 33, 67, 0.2)" // Dark blue gradient glow
                        : "0 0 0 0px rgba(15, 33, 67, 0)",
                      backgroundColor: "#0f2143", // Solid dark blue base
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="w-[20px] h-[20px] rounded-full mb-6 origin-center relative z-20"
                  />
                  
                  <p
                    className="m-0 font-medium text-[#333] mb-3 relative z-20 max-md:!text-[15px]"
                    style={{ fontSize: "min(1.16vw, 1.8vh)" }}
                  >
                    {item.date}
                  </p>
                  <h4
                    className={`m-0 mb-4 whitespace-pre-line relative z-20 text-black ${BODY_BOLD_CLASS}`}
                    style={HERO_BODY_STYLE}
                  >
                    {item.title}
                  </h4>
                  <p
                    className={`font-normal m-0 relative z-20 text-[#4a4a4a] ${item.stats ? "mb-6" : ""} ${HERO_BODY_CLASS}`}
                    style={HERO_BODY_STYLE}
                  >
                    {item.desc}
                  </p>

                  {item.stats && (
                    <div className="mt-auto relative z-20">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`font-medium text-black ${SUBHEADING_CLASS}`}
                          style={SUBHEADING_STYLE}
                        >
                          {item.stats.number}
                        </span>
                        <span
                          className="leading-tight text-[#4a4a4a] whitespace-pre-line"
                          style={LABEL_STYLE}
                        >
                          {item.stats.label}
                        </span>
                      </div>
                      <p
                        className="m-0 text-[#6b6b6b] leading-[1.4] whitespace-pre-line"
                        style={LABEL_STYLE}
                      >
                        {item.stats.sub}
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
}