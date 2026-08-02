"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion } from "framer-motion";
import { HeroGlow, CursorFillButton } from "./JoinPortfolio";

/*
  FoundersStoryCTA — closing CTA for the founder-story detail page.
  Same dark glow background as JoinPortfolio; different copy + two
  actions ("Read all stories" text link + "Pitch us" fill button).
*/
export default function FoundersStoryCTA({
  text,
  readAllHref = "/foundersstory",
  pitchHref = "/getinvestment",
}: {
  text: string;
  readAllHref?: string;
  pitchHref?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-[#00112E]"
      style={{
        paddingTop: "clamp(80px, min(12vw, 16vh), 160px)",
        paddingBottom: "clamp(80px, min(12vw, 16vh), 160px)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <HeroGlow sectionRef={sectionRef} />

      <motion.div
        className="relative z-10 flex w-full max-w-[820px] flex-col items-center text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <p
          className="m-0 font-['Poppins',_sans-serif] font-medium text-white max-md:!text-[18px]"
          style={{
            fontSize: "clamp(20px, min(2.2vw, 3.2vh), 30px)",
            lineHeight: "150%",
            marginBottom: "clamp(32px, 4vw, 48px)",
          }}
        >
          {text}
        </p>

        <div className="flex flex-row items-center justify-center gap-[clamp(20px,3vw,40px)] max-md:!flex-col">
          <Link
            href={readAllHref}
            className="font-['Poppins',_sans-serif] font-normal text-white/90 underline-offset-4 transition-opacity duration-300 hover:opacity-70 hover:underline max-md:!text-[15px]"
            style={{ fontSize: "clamp(15px, min(1.2vw, 1.8vh), 18px)" }}
          >
            Read all stories
          </Link>
          <CursorFillButton href={pitchHref} label="Pitch us" />
        </div>
      </motion.div>
    </section>
  );
}
