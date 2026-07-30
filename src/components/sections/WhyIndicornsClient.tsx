"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
          className="m-0 text-center font-semibold text-black max-md:!text-[clamp(24px,7vw,28px)] max-md:!leading-[120%] max-md:!mb-[clamp(32px,6dvh,48px)]"
          style={{
            fontSize: "min(4.51vw, 6.98vh)",
            lineHeight: "150%",
            marginBottom: "min(5.79vw, 8.95vh)",
          }}
        >
          Why We Created
          <br />
          The Indicorns?
        </motion.h2>

        {/* Top Story Section */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-2 items-center gap-[clamp(32px,min(4vw,6vh),64px)] mb-[clamp(48px,min(7vw,10vh),120px)]"
        >
          {/* Image */}
          <div className="w-full overflow-hidden rounded-[2px] shadow-sm">
            <img
              src="/images/indicorns/skyscrappers.png"
              alt="Skyscrapers looking up"
              className="w-full h-full object-cover max-h-[clamp(280px,40vw,480px)]"
            />
          </div>

          {/* Story Text */}
          <div className="flex flex-col justify-center">
            <h3
              className="m-0 font-semibold text-black max-md:!text-[24px]"
              style={{
                fontSize: "min(2.31vw, 3.58vh)",
                lineHeight: "130%",
                marginBottom: "clamp(16px,min(1.85vw,2.86vh),28px)",
              }}
            >
              September 2024
            </h3>
            <p
              className="m-0 font-normal text-[#1a1a1a] max-md:!text-[16px]"
              style={{ fontSize: "min(1.25vw, 1.94vh)", lineHeight: "160%" }}
            >
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

        {/* Timeline Section */}
        <div className="relative w-full">
          {/* Background Timeline Line (Desktop) */}
          <div className="hidden md:block absolute top-[44px] left-[16.66%] right-[16.66%] h-[1px] bg-[#d3cec4] z-0" />
          
          {/* Animated Active Timeline Line (Desktop) */}
          <motion.div 
            className="hidden md:block absolute top-[43px] left-[16.66%] h-[3px] z-0 origin-left"
            initial={{ scaleX: 0 }}
            animate={{ 
              scaleX: activeIndex === 0 ? 0 : activeIndex === 1 ? 0.5 : 1 
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{ 
              width: "66.66%",
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
                  className={`p-8 flex flex-col relative z-10 cursor-pointer overflow-hidden transition-all duration-500 ease-out ${
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
                    className="m-0 font-medium text-[#333] mb-3 relative z-20 max-md:!text-[13px]"
                    style={{ fontSize: "min(0.97vw, 1.51vh)" }}
                  >
                    {item.date}
                  </p>
                  <h4
                    className="m-0 font-semibold text-black leading-[1.3] mb-4 whitespace-pre-line relative z-20 max-md:!text-[20px]"
                    style={{ fontSize: "min(1.39vw, 2.15vh)" }}
                  >
                    {item.title}
                  </h4>
                  <p
                    className={`m-0 text-[#4a4a4a] leading-[1.6] relative z-20 max-md:!text-[15px] ${
                      item.stats ? "mb-6" : ""
                    }`}
                    style={{ fontSize: "min(1.04vw, 1.61vh)" }}
                  >
                    {item.desc}
                  </p>

                  {item.stats && (
                    <div className="mt-auto relative z-20">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className="font-normal leading-none text-black max-md:!text-[42px]"
                          style={{ fontSize: "min(2.92vw, 4.51vh)" }}
                        >
                          {item.stats.number}
                        </span>
                        <span
                          className="leading-tight text-[#4a4a4a] whitespace-pre-line max-md:!text-[14px]"
                          style={{ fontSize: "min(0.97vw, 1.51vh)" }}
                        >
                          {item.stats.label}
                        </span>
                      </div>
                      <p
                        className="m-0 text-[#6b6b6b] leading-[1.4] whitespace-pre-line max-md:!text-[11px]"
                        style={{ fontSize: "min(0.76vw, 1.18vh)" }}
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