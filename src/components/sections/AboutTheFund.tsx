"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function AboutTheFund() {
  return (
    <section
      className="relative flex w-full items-center overflow-hidden bg-white"
      style={{
        paddingTop: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingBottom: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <div
        // FIXED: Gap reduced even further to pull the columns tightly together
        className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-[clamp(24px,4vw,32px)] md:flex-row md:items-center md:gap-[clamp(12px,1.5vw,24px)]"
      >

        {/* ── LEFT: Heading + Description ── */}
        <motion.div
          className="flex w-full flex-col items-center text-center md:w-1/2 md:items-start md:text-left"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Heading */}
          <div className="flex flex-row flex-wrap items-center gap-x-3 max-md:justify-center max-md:gap-x-2">
            <motion.h2
              className="m-0 font-['Libre_Baskerville',_serif] text-[length:var(--heading-xl)] max-md:!text-[28px] font-semibold not-italic leading-none text-[#001A4D]"
              variants={{
                hidden: { opacity: 0, x: -40 },
                visible: {
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.9, ease: "easeOut" },
                },
              }}
            >
              About the
            </motion.h2>

            <motion.span
              className="relative inline-flex items-center justify-center overflow-hidden bg-transparent px-[4px] py-[8px] md:px-[6px] md:py-[10px]"
              variants={{
                hidden: { opacity: 0, x: -80 },
                visible: {
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.6, ease: "easeOut", delay: 0.3 },
                },
              }}
            >
              <motion.span
                className="absolute inset-0 z-0 h-full w-full bg-[#D3E2FF]"
                style={{ transformOrigin: "left" }}
                variants={{
                  hidden: { scaleX: 0 },
                  visible: {
                    scaleX: 1,
                    transition: { duration: 0.6, ease: "easeInOut", delay: 0.7 },
                  },
                }}
              />
              <span className="relative z-10 font-['Libre_Baskerville',_serif] text-[length:var(--heading-xl)] max-md:!text-[28px] font-semibold italic leading-none text-[#001A4D]">
                fund
              </span>
            </motion.span>
          </div>

          {/* Description */}
          <motion.div
            className="mt-[clamp(20px,min(2.5vw,3.5vh),40px)] flex flex-col gap-[clamp(16px,1.5vw,24px)] font-['Poppins',_sans-serif] font-normal text-[#323232] max-md:!text-[15px] max-md:!leading-[1.6]"
            style={{
              fontSize: "clamp(15px, min(1.67vw, 2.44vh), 24px)",
              lineHeight: "167%",
              // FIXED: Increased max-width from 610px to 680px so the text reaches further right toward the image
              maxWidth: "clamp(320px, 45vw, 680px)",
            }}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: "easeOut", delay: 0.5 },
              },
            }}
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
        </motion.div>

        {/* ── RIGHT: Image ── */}
        <motion.div
          className="relative w-full md:w-1/2"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        >
          <div
            className="relative mx-auto w-full"
            style={{
              aspectRatio: "700 / 520",
              maxWidth: "clamp(320px, min(48.61vw, 71.28vh), 700px)",
            }}
          >
            <Image
              src="/images/titanwinnderfund/AboutTheFund.webp"
              alt="About the fund — founders building together"
              fill
              sizes="(max-width: 768px) 90vw, 50vw"
              className="object-contain"
              priority
            />
          </div>
        </motion.div>

      </div>
    </section>
  );
}