"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { 
  motion, 
  useMotionValue, 
  useSpring, 
  useTransform 
} from "framer-motion";

/* ─────────────────────────────────────────────────────────
   Animation Variants
   ───────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const, delay },
  }),
};

/* ─────────────────────────────────────────────────────────
   Container Glow Background
   ───────────────────────────────────────────────────────── */
function ContainerGlow({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const normX = useMotionValue(0);
  const normY = useMotionValue(0);

  const cursorSpring = { damping: 25, stiffness: 250, mass: 0.3 };
  const smoothX = useSpring(mouseX, cursorSpring);
  const smoothY = useSpring(mouseY, cursorSpring);

  const ambientSpring = { damping: 30, stiffness: 70, mass: 1 };
  const smoothNormX = useSpring(normX, ambientSpring);
  const smoothNormY = useSpring(normY, ambientSpring);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      }
      normX.set((e.clientX / window.innerWidth) * 2 - 1);
      normY.set((e.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, normX, normY, containerRef]);

  const leftX = useTransform(smoothNormX, [-1, 1], ["-10%", "10%"]);
  const leftY = useTransform(smoothNormY, [-1, 1], ["-10%", "10%"]);

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          left: "-10%",
          top: "-10%",
          width: "120%",
          height: "120%",
          zIndex: 0,
          x: leftX,
          y: leftY,
          willChange: "transform",
        }}
      >
        <motion.div
          className="w-full h-full rounded-full blur-[40px]"
          style={{
            background:
              "radial-gradient(circle, #5054B5 0%, #054EB6 40%, #022250 80%, transparent 100%)",
            opacity: 0.6,
          }}
          animate={{
            x: ["0%", "35%", "-15%", "25%", "0%"],
            y: ["0%", "25%", "-10%", "35%", "0%"],
            scale: [1, 1.15, 0.85, 1.1, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Cursor tracking blob */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 rounded-full blur-[24px]"
        style={{
          width: "150px",
          height: "150px",
          zIndex: 5,
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: 0.4,
          background:
            "radial-gradient(circle, rgba(80,84,181,0.85) 0%, rgba(5,78,182,0.5) 40%, rgba(2,34,80,0.2) 70%, transparent 100%)",
          willChange: "transform",
        }}
      />
    </>
  );
}

/* ─────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────── */
export interface WhyTitanSeedCard {
  title: string;
  desc: string;
}

export interface WhyTitanSeedData {
  headingFirst?: string;
  headingSecond?: string;
  cards?: WhyTitanSeedCard[];
}

const FALLBACK_HEADING_FIRST = "Why";
const FALLBACK_HEADING_SECOND = "Titan Seed";

const FALLBACK_CARDS_DATA: WhyTitanSeedCard[] = [
  {
    title: "Day One Access",
    desc: "From the moment we invest, you're in 650+ founders, strategic partners, and the Titan entrepreneur network, all at your disposal.",
  },
  {
    title: "Founders Helping Founders",
    desc: "A strong founder community that shares what actually works; playbooks, templates, and hard-won lessons.",
  },
  {
    title: "Warm Introduction",
    desc: "Every introduction we make is personal. Our network picks up for you.",
  },
  {
    title: "Follow-On Opportunity",
    desc: "For companies that break out, we show up again, through our Winners Fund.",
  },
];

/* ─────────────────────────────────────────────────────────
   Main Component
   ───────────────────────────────────────────────────────── */
export default function WhyTitanSeedClient({
  data,
}: {
  data?: WhyTitanSeedData | null;
}) {
  const headingFirst = data?.headingFirst || FALLBACK_HEADING_FIRST;
  const headingSecond = data?.headingSecond || FALLBACK_HEADING_SECOND;
  const cardsData =
    data?.cards && data.cards.length > 0 ? data.cards : FALLBACK_CARDS_DATA;

  const rightColRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  return (
    <section
      className="relative flex w-full flex-col items-center bg-[#FBF7F0]"
      style={{
        paddingBottom: "clamp(60px, min(8vw, 12vh), 120px)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      {/* ── STICKY HEADING & SUBTITLE ── */}
      <motion.div
        className="w-full flex flex-col items-center text-center z-20 lg:sticky"
        style={{
          top: "var(--nav-height)",
          paddingTop: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
          paddingBottom: "clamp(48px, min(6vw, 8vh), 80px)",
          backgroundColor: "#FBF7F0",
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
      >
        <motion.h2
          className="m-0 max-w-[794px] font-['Poppins',_sans-serif] font-semibold text-black max-md:!text-[clamp(24px,7vw,28px)] max-md:!leading-[120%]"
          style={{ fontSize: "min(4.51vw, 6.98vh)", lineHeight: "150%" }}
          custom={0}
          variants={fadeUp}
        >
          {headingFirst} {headingSecond}
        </motion.h2>

        <motion.p
          className="mt-[clamp(28px,min(3vw,4.5vh),44px)] max-w-[800px] font-['Poppins',_sans-serif] font-normal text-[#323232] max-md:!text-[16px] max-md:!leading-[140%]"
          style={{ fontSize: "clamp(16px, 1.5vw, 22px)", lineHeight: "150%" }}
          custom={0.2}
          variants={fadeUp}
        >
          500+ founder community with shared playbooks, templates, learnings
        </motion.p>
      </motion.div>

      {/* ── TWO COLUMN LAYOUT ── */}
      <div className="flex w-full max-w-[1440px] flex-col lg:flex-row items-start justify-between gap-[clamp(40px,5vw,80px)] relative z-10">
        
        {/* ── LEFT: Sticky Image Container ── */}
        <div 
          className="w-full lg:w-[45%] shrink-0 lg:sticky self-start z-10"
          style={{ top: "calc(var(--nav-height) + clamp(150px, 20vw, 220px))" }}
        >
          <div 
            ref={imageContainerRef}
            className="w-full overflow-hidden bg-[#00112E] relative"
            style={{
              borderRadius: "2px",
              height: "clamp(220px, 28vw, 400px)",
              maxWidth: "540px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
            }}
          >
            {/* ── Container Ambient Background ── */}
            <ContainerGlow containerRef={imageContainerRef} />

            {/* Next.js Image Component */}
            <Image
              src="/images/titanseedfund/whytitanseed.png"
              alt="Why Titan Seed"
              fill
              className="object-cover z-10"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
          </div>
        </div>

        {/* ── RIGHT: Scrolling Reel ── */}
        <div 
          ref={rightColRef}
          className="w-full lg:w-[50%] relative flex flex-col pt-[16px] lg:pt-0"
        >
          {/* Animated Vertical Line */}
          <motion.div
            className="absolute left-0 top-0 bottom-0 w-[1px] bg-[#000]"
            style={{ transformOrigin: "top" }}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {/* List Items */}
          {cardsData.map((card, idx) => (
            <motion.div
              key={idx}
              className="relative w-full flex flex-col justify-center border-t border-[#000]"
              style={{
                paddingTop: "clamp(36px, 6vw, 72px)",
                paddingBottom: "clamp(36px, 6vw, 72px)",
                paddingLeft: "clamp(24px, 3vw, 40px)",
              }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-10%" }}
              custom={0.1}
              variants={fadeUp}
            >
              {/* Number */}
              <span 
                className="font-['Poppins',_sans-serif] font-medium text-[#000] mb-[12px]" 
                style={{ fontSize: "clamp(18px, 2vw, 24px)" }}
              >
                {String(idx + 1).padStart(2, '0')}
              </span>

              {/* Title */}
              <h3 
                className="m-0 font-['Poppins',_sans-serif] font-medium text-[#000] mb-[16px]" 
                style={{ fontSize: "clamp(24px, 3vw, 40px)", lineHeight: "120%" }}
              >
                {card.title}
              </h3>

              {/* Description */}
              <p 
                className="m-0 font-['Poppins',_sans-serif] font-normal text-[#323232]" 
                style={{ fontSize: "clamp(16px, 1.5vw, 20px)", lineHeight: "150%" }}
              >
                {card.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}