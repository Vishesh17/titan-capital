"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

/* ── Pill data: label, position (%), and optional rotation ──
   Positioned in a tight pyramid pile — pills overlap & touch each other.
   Vertical gaps are intentionally small (~8-9%) so pills overlap. */
const pills: { label: string; x: number; y: number; rotate?: number }[] = [
  // Row 1 — top
  { label: "Vision",       x: 35, y: 0,   rotate: 1 },
  // Row 2
  { label: "Founders",     x: 20, y: 8,   rotate: -4 },
  { label: "Scale",        x: 56, y: 7,   rotate: 8 },
  // Row 3
  { label: "Mentorship",   x: 8,  y: 17,  rotate: -6 },
  { label: "Growth",       x: 46, y: 16,  rotate: 5 },
  // Row 4 — center (wide pill flanked by dots)
  { label: "Network",      x: 26, y: 27,  rotate: 0 },
  // Row 5
  { label: "Partnership",  x: 12, y: 38,  rotate: -3 },
  { label: "Momentum",     x: 48, y: 37,  rotate: 4 },
  // Row 6 — widest spread
  { label: "Innovation",   x: 0,  y: 49,  rotate: -8 },
  { label: "Leadership",   x: 28, y: 48,  rotate: 2 },
  { label: "Execution",    x: 56, y: 47,  rotate: 7 },
  // Row 7 — bottom
  { label: "Success",      x: 28, y: 59,  rotate: -1 },
];

/* ── Decorative dots — sit in gaps between pills ── */
const dots: { x: number; y: number }[] = [
  { x: 6,  y: 28 },   // left of Network row
  { x: 66, y: 27 },   // right of Network row
  { x: 36, y: 70 },   // bottom center — base of pile
];

export default function AboutTheFund() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="relative flex w-full items-center overflow-hidden bg-[#FBF7F0]"
      style={{
        paddingTop: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingBottom: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <div
        ref={sectionRef}
        className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-[clamp(32px,5vw,48px)] md:flex-row md:items-center md:gap-[clamp(24px,3vw,48px)]"
      >
        {/* ── LEFT: Heading + Description ── */}
        <div className="flex w-full flex-col items-center text-center md:w-[45%] md:items-start md:text-left">
          {/* Heading */}
          <div className="flex flex-row flex-wrap items-center gap-x-3 max-md:justify-center max-md:gap-x-2">
            <motion.h2
              className="m-0 font-['Libre_Baskerville',_serif] text-[length:var(--heading-xl)] max-md:!text-[28px] font-semibold not-italic leading-none text-[#001A4D]"
              initial={{ opacity: 0, x: -40 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            >
              About the
            </motion.h2>

            <motion.span
              className="relative inline-flex items-center justify-center overflow-hidden bg-transparent px-[4px] py-[8px] md:px-[6px] md:py-[10px]"
              initial={{ opacity: 0, x: -80 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -80 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
            >
              <motion.span
                className="absolute inset-0 z-0 h-full w-full bg-[#D3E2FF]"
                style={{ transformOrigin: "left" }}
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut", delay: 0.7 }}
              />
              <span className="relative z-10 font-['Libre_Baskerville',_serif] text-[length:var(--heading-xl)] max-md:!text-[28px] font-semibold italic leading-none text-[#001A4D]">
                fund
              </span>
            </motion.span>
          </div>

          {/* Description */}
          <motion.div
            className="m-0 mt-[clamp(20px,min(2.5vw,3.5vh),40px)] flex flex-col gap-[clamp(12px,1.5vw,20px)] font-['Poppins',_sans-serif] font-normal text-[#323232] max-md:!text-[15px] max-md:!leading-[1.6]"
            style={{
              fontSize: "clamp(15px, min(1.67vw, 2.44vh), 24px)",
              lineHeight: "167%",
              maxWidth: "clamp(320px, 42vw, 620px)",
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
          >
            <p className="m-0">
              We&apos;ve been with these founders since the beginning, through the early decisions, the difficult pivots, and the milestones that quietly signalled something bigger was being built.
            </p>

            <p className="m-0">
              The Winners Fund is our commitment to seeing it through. When a portfolio company demonstrates exceptional momentum and a credible path to category leadership, we return with greater capital and deeper conviction. Not as a new investor discovering an opportunity, but as a long-standing partner who understands the business, the team, and the vision from the inside.
            </p>

            <p className="m-0">
              Continuity of belief is a form of value in itself, and that is what the Winners Fund represents.
            </p>
          </motion.div>
        </div>

        {/* ── RIGHT: Falling pill cloud ── */}
        <div
          className="relative w-full overflow-visible md:w-[55%]"
          style={{ aspectRatio: "1.2 / 1" }}
        >
          {/* Pills */}
          {pills.map((pill, i) => {
            const delay = 0.3 + i * 0.07;
            const rotate = pill.rotate ?? 0;
            return (
              <motion.div
                key={pill.label}
                className="absolute flex items-center justify-center whitespace-nowrap rounded-[62px] border-[0.3px] border-[#001A4D] bg-[#D3E2FF] font-['Poppins',_sans-serif] font-medium text-[#001A4D]"
                style={{
                  left: `${pill.x}%`,
                  top: `${pill.y}%`,
                  padding:
                    "clamp(10px, min(1.2vw, 1.7vh), 18px) clamp(24px, min(3vw, 4vh), 44px)",
                  fontSize: "clamp(14px, min(1.4vw, 2vh), 22px)",
                }}
                initial={{
                  y: -250 - i * 30,
                  opacity: 0,
                  rotate: rotate + (i % 2 === 0 ? 20 : -20),
                  scale: 0.7,
                }}
                animate={
                  isInView
                    ? { y: 0, opacity: 1, rotate, scale: 1 }
                    : {
                        y: -250 - i * 30,
                        opacity: 0,
                        rotate: rotate + (i % 2 === 0 ? 20 : -20),
                        scale: 0.7,
                      }
                }
                transition={{
                  type: "spring",
                  stiffness: 140,
                  damping: 9,
                  mass: 0.8 + i * 0.06,
                  delay,
                }}
              >
                {pill.label}
              </motion.div>
            );
          })}

          {/* Dots — appear after all pills have landed */}
          {dots.map((dot, i) => {
            const delay =
              0.3 + pills.length * 0.07 + 0.1 + i * 0.08;
            return (
              <motion.div
                key={`dot-${i}`}
                className="absolute rounded-full bg-[#001A4D]"
                style={{
                  left: `${dot.x}%`,
                  top: `${dot.y}%`,
                  width: "clamp(28px, min(2.9vw, 4.2vh), 42px)",
                  height: "clamp(28px, min(2.9vw, 4.2vh), 42px)",
                }}
                initial={{ y: -200, opacity: 0, scale: 0 }}
                animate={
                  isInView
                    ? { y: 0, opacity: 1, scale: 1 }
                    : { y: -200, opacity: 0, scale: 0 }
                }
                transition={{
                  type: "spring",
                  stiffness: 180,
                  damping: 14,
                  delay,
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
