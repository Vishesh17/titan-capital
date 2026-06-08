"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function TitanSeedHero() {
  return (
    <section
      className="relative flex w-full items-center justify-center overflow-hidden bg-[#FBF7F0]"
      style={{
        marginTop: "var(--nav-height)",
        minHeight: "calc(100svh - var(--nav-height))",
        paddingTop: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingBottom: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >

      {/* ── INNER WRAPPER ── */}
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-between gap-[clamp(24px,5vw,60px)] lg:flex-row">

        {/* ── LEFT: TEXT CONTENT ── */}
        <div className="flex w-full flex-col items-center max-lg:text-center lg:items-start lg:w-[55%]">

          <motion.div
            className="flex flex-col items-center lg:items-start"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
          >
            <motion.h1
              className="m-0 font-['Libre_Baskerville',_serif] font-semibold leading-[110%] text-[#001A4D]"
              style={{ fontSize: "var(--heading-xl)" }}
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
              }}
            >
              We Are Your
            </motion.h1>

            <motion.span
              className="relative mt-[clamp(4px,0.5vw,8px)] inline-flex items-center justify-center overflow-hidden px-[4px] py-[8px] md:px-[6px] md:py-[10px] bg-transparent"
              variants={{
                hidden: { opacity: 0, x: -80 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut", delay: 0.3 } }
              }}
            >
              <motion.span
                className="absolute inset-0 z-0 bg-[#D3E2FF] h-full w-full"
                style={{ transformOrigin: "left" }}
                variants={{
                  hidden: { scaleX: 0 },
                  visible: { scaleX: 1, transition: { duration: 0.6, ease: "easeInOut", delay: 0.9 } }
                }}
              />
              <span
                className="relative z-10 font-['Libre_Baskerville',_serif] font-semibold italic leading-none text-[#001A4D]"
                style={{ fontSize: "var(--heading-xl)" }}
              >
                first believer
              </span>
            </motion.span>
          </motion.div>

          <p
            className="mt-[clamp(24px,min(3vw,5vh),48px)] max-w-[500px] font-['Poppins',_sans-serif] font-normal leading-[1.6] text-[#323232] max-lg:text-center"
            style={{ fontSize: "clamp(14px, min(1.6vw, 2.35vh), 20px)" }}
          >
            Titan Seed backs the boldest founders who have absolute clarity of&nbsp; thought.
          </p>

          {/* ── BUTTONS ── */}
          <div
            className="mt-[clamp(24px,min(3vw,5vh),48px)] flex flex-row items-center max-lg:justify-center"
            style={{ gap: "clamp(12px, min(1.66vw, 2.44vh), 24px)" }}
          >
            <Link
              href="/portfolio"
              className="flex shrink-0 items-center justify-center p-[10px] font-['Libre_Baskerville',_serif] font-semibold leading-[107%] text-[#001A4D] transition-opacity hover:opacity-60 h-[clamp(40px,min(3.75vw,5.5vh),54px)] w-[clamp(140px,min(12.85vw,18.84vh),185px)] text-[clamp(13px,min(1.11vw,1.63vh),16px)]"
            >
              View Portfolio
            </Link>

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
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100 z-0"
                style={{
                  background: 'radial-gradient(circle 80px at var(--mouse-x, 50%) var(--mouse-y, 50%), #003CB3 0%, transparent 100%)'
                }}
              />
              <span className="relative z-10">Get Investment</span>
            </Link>
          </div>

        </div>

        {/* ── RIGHT: IMAGE CONTENT ── */}
        <div className="relative flex w-full justify-center lg:w-[45%] lg:justify-end">
          <div className="relative aspect-[4/3] w-full max-w-[clamp(280px,40vw,650px)] lg:aspect-square">
            <Image
              src="/images/titanseedfund/pawn.webp"
              alt="Titan Seed First Believer"
              fill
              priority
              className="object-contain object-center lg:object-right"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
