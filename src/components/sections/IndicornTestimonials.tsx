"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

interface IndicornTestimonial {
  id: number;
  image: string;
  quote: string;
  name?: string;
  role?: string;
}

const testimonials: IndicornTestimonial[] = [
  {
    id: 0,
    image: "/images/indicorns/kapil_makhija.png", // Replace with actual image path
    quote:
      '"The unicorn framing was never ours. Indicorn is. It asks the right question: have you built something real? Have you built something that lasts? That\'s what we were always trying to do."',
    name: "Kalyan Krishnamurthy", 
    role: "CEO, Unicommerce",
  },
  {
    id: 1,
    image: "/images/indicorns/Varun_alagh.png", // Replace with actual image path
    quote:
      '"Profitability was always our north star. We built Mamaearth for the long run, not for the next funding round. The Indicorn term finally gives that philosophy a name."',
    name: "Varun Alagh",
    role: "Co-founder & CEO, Mamaearth",
  },
  {
    id: 2,
    image: "images/indicorns/kunal_bahl.png", // Replace with actual image path
    quote:
      '"The unicorn framing was never ours. Indicorn is. It asks the right question: have you built something real? Have you built something that lasts? That\'s what we were always trying to do."',
    name: "Kunal Bhal",
    role: "Co-founder, Titan Capital",
  },
];

export default function IndicornFoundersSay() {
  const [activeIndex, setActiveIndex] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive sizing for the animations
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-rotate which testimonial is expanded every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      className="relative w-full overflow-hidden bg-white z-20"
      style={{
        // Curved top + high z-index so this section slides UP and over the
        // pinned IndicornCompanies section — same as FoundersTestimonial
        // over IndicornSpotlight. Radius token matches that section exactly.
        borderTopLeftRadius: "min(4.44vw, 7.30vh)",
        borderTopRightRadius: "min(4.44vw, 7.30vh)",
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        marginTop: "-40px",
        paddingTop: "calc(var(--section-py) + 40px)",
        paddingBottom: "var(--section-py)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <div className="mx-auto max-w-[1440px] flex flex-col items-center">
        {/* Headings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center max-w-[800px] max-md:!mb-[clamp(32px,6dvh,48px)]"
          style={{ marginBottom: "min(3.47vw, 5.37vh)" }}
        >
          <h2
            className="m-0 font-['Poppins',_sans-serif] font-semibold text-black max-md:!text-[clamp(24px,7vw,28px)] max-md:!leading-[120%]"
            style={{ fontSize: "min(4.51vw, 6.98vh)", lineHeight: "120%", marginBottom: "clamp(12px,min(1.5vw,2vh),24px)" }}
          >
            What Founders Say <br className="hidden md:block" />
            About The Indicorns.
          </h2>
          <p
            className="m-0 font-['Poppins',_sans-serif] font-normal text-[#1a1a1a] max-md:!text-[16px]"
            style={{ fontSize: "min(1.39vw, 2.15vh)", lineHeight: "160%" }}
          >
            We asked founders from the Indicorn community what the recognition
            means to them — and how it changed the way they think about building
            a company.
          </p>
        </motion.div>

        {/* Flat vertical testimonial stack — three rows, NO 3D tilt. The
            active (middle) row expands: tall portrait photo + italic quote
            + name/role; inactive rows stay compact: short landscape photo
            + plain quote. Thin divider lines separate the rows. Matches
            the design screenshot exactly. */}
        <div className="w-full max-w-[1180px] flex flex-col">
          {testimonials.map((item, index) => {
            const isActive = activeIndex === index;
            const isLast = index === testimonials.length - 1;

            const imgWidth = isMobile ? 140 : 200;
            const imgHeight = isActive
              ? isMobile
                ? 220
                : 320
              : isMobile
                ? 110
                : 150;

            return (
              <div
                key={item.id}
                onClick={() => setActiveIndex(index)}
                className="group flex w-full cursor-pointer flex-row items-center gap-[clamp(20px,min(4vw,5vh),64px)] max-md:!gap-[16px]"
                style={{
                  paddingTop: "clamp(20px,min(2.5vw,3.5vh),40px)",
                  paddingBottom: "clamp(20px,min(2.5vw,3.5vh),40px)",
                  borderBottom: isLast ? "none" : "1px solid #e5e5e5",
                }}
              >
                {/* Morphing founder photo — width constant, height grows
                    when active (landscape → portrait). */}
                <motion.div
                  initial={false}
                  animate={{ width: imgWidth, height: imgHeight }}
                  transition={{ duration: 0.8, ease: EASE }}
                  className="shrink-0 overflow-hidden rounded-[2px] bg-[#f0f0f0]"
                >
                  <img
                    src={item.image}
                    alt={item.name || "Founder"}
                    className="h-full w-full object-cover object-top"
                  />
                </motion.div>

                {/* Text — centered in the remaining space */}
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                  {/* Grid-stacked normal/italic quote for a clean crossfade */}
                  <div className="grid w-full grid-cols-1 grid-rows-1 items-center justify-center">
                    {/* Plain quote (inactive) */}
                    <motion.p
                      initial={false}
                      animate={{ opacity: isActive ? 0 : 1 }}
                      transition={{ duration: 0.6, ease: EASE }}
                      className="col-start-1 row-start-1 m-0 mx-auto max-w-[720px] font-['Poppins',_sans-serif] font-normal leading-[1.6] text-[#1a1a1a] max-md:!text-[14px]"
                      style={{ fontSize: "min(1.25vw, 1.94vh)" }}
                    >
                      {item.quote}
                    </motion.p>

                    {/* Italic quote (active) */}
                    <motion.p
                      initial={false}
                      animate={{ opacity: isActive ? 1 : 0 }}
                      transition={{ duration: 0.6, ease: EASE }}
                      className="col-start-1 row-start-1 m-0 mx-auto max-w-[760px] font-['Poppins',_sans-serif] font-medium italic leading-[1.4] text-black max-md:!text-[16px]"
                      style={{ fontSize: "min(1.62vw, 2.51vh)" }}
                    >
                      {item.quote}
                    </motion.p>
                  </div>

                  {/* Name + role (only when active) */}
                  {item.name && (
                    <motion.div
                      initial={false}
                      animate={{
                        opacity: isActive ? 1 : 0,
                        height: isActive ? "auto" : 0,
                        marginTop: isActive ? (isMobile ? 16 : 24) : 0,
                      }}
                      transition={{ duration: 0.6, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p
                        className="m-0 font-['Poppins',_sans-serif] font-semibold text-black max-md:!text-[16px]"
                        style={{ fontSize: "min(1.39vw, 2.15vh)" }}
                      >
                        {item.name}
                      </p>
                      {item.role && (
                        <p
                          className="m-0 mt-[2px] font-['Poppins',_sans-serif] font-normal text-[#4a4a4a] max-md:!text-[13px]"
                          style={{ fontSize: "min(1.11vw, 1.72vh)" }}
                        >
                          {item.role}
                        </p>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}