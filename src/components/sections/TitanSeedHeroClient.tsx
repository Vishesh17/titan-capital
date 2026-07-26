"use client";

import { useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

/* ─────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────── */
export interface TitanSeedHeroData {
  headingFirst?: string;
  headingSecond?: string;
  subtitle?: string;
}

const FALLBACK_HEADING_FIRST = "We Are Your";
const FALLBACK_HEADING_SECOND = "First Believer";
const FALLBACK_SUBTITLE =
  "We partner with entrepreneurs from day one. We invest conviction, not just capital, and stay by their side through every stage of their journey.";

/* ─────────────────────────────────────────────────────────
   Hero Glow Background (Adapted from Source 1)
   ───────────────────────────────────────────────────────── */
function HeroGlow() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const normX = useMotionValue(0);
  const normY = useMotionValue(0);

  const cursorSpring = { damping: 25, stiffness: 250, mass: 0.3 };
  const smoothX = useSpring(mouseX, cursorSpring);
  const smoothY = useSpring(mouseY, cursorSpring);

  const ambientSpring = { damping: 30, stiffness: 70, mass: 1 };
  const smoothNormX = useSpring(normX, ambientSpring);
  const smoothNormY = useSpring(normY, ambientSpring);

  useEffect(() => {
    if (typeof window !== "undefined") {
      mouseX.set(window.innerWidth / 2);
      mouseY.set(window.innerHeight / 2);
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.pageX);
      mouseY.set(e.pageY);
      normX.set((e.clientX / window.innerWidth) * 2 - 1);
      normY.set((e.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, normX, normY]);

  const leftX = useTransform(smoothNormX, [-1, 1], ["-8%", "8%"]);
  const leftY = useTransform(smoothNormY, [-1, 1], ["-8%", "8%"]);
  const rightX = useTransform(smoothNormX, [-1, 1], ["8%", "-8%"]);
  const rightY = useTransform(smoothNormY, [-1, 1], ["8%", "-8%"]);

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          left: "-25%",
          top: "-25%",
          width: "min(75vw, 100vh)",
          height: "min(75vw, 100vh)",
          zIndex: 0,
          x: leftX,
          y: leftY,
          willChange: "transform",
        }}
      >
        <motion.div
          className="w-full h-full rounded-full blur-[120px]"
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

      <motion.div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          right: "-25%",
          bottom: "-25%",
          width: "min(70vw, 90vh)",
          height: "min(70vw, 90vh)",
          zIndex: 0,
          x: rightX,
          y: rightY,
          willChange: "transform",
        }}
      >
        <motion.div
          className="w-full h-full rounded-full blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, #AC71C6 0%, #033699 50%, #001A4D 80%, transparent 100%)",
            opacity: 0.5,
          }}
          animate={{
            x: ["0%", "-35%", "15%", "-25%", "0%"],
            y: ["0%", "-25%", "10%", "-35%", "0%"],
            scale: [1, 1.15, 0.85, 1.1, 1],
          }}
          transition={{
            duration: 21,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        />
      </motion.div>

      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 rounded-full blur-[60px]"
        style={{
          width: "25vw",
          height: "25vw",
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
   Static Grid Lines
   ───────────────────────────────────────────────────────── */
function StaticGridLines() {
  // Creating an array to map out multiple background lines evenly
  const lines = Array.from({ length: 7 });

  return (
    <div className="pointer-events-none absolute inset-0 z-[1] flex w-full justify-evenly overflow-hidden opacity-60 mix-blend-screen">
      {lines.map((_, i) => (
        <div key={i} className="relative h-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="2"
            height="662"
            viewBox="0 0 2 662"
            fill="none"
            style={{
              height: "100%",
              width: "2px",
              transform: "rotate(0.086deg)",
              strokeWidth: "1px",
              stroke: "rgba(131, 131, 131, 0.23)",
            }}
          >
            <path
              d="M1.49463 0.00130463L0.994631 -3.63099e-07L5.74226e-05 662L0.500056 662.001L1.00005 662.003L1.99463 0.00260962L1.49463 0.00130463Z"
              fill="#838383"
              fillOpacity="0.23"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main Component
   ───────────────────────────────────────────────────────── */
export default function TitanSeedHeroClient({
  data,
}: {
  data?: TitanSeedHeroData | null;
}) {
  const headingFirst = data?.headingFirst || FALLBACK_HEADING_FIRST;
  const headingSecond = data?.headingSecond || FALLBACK_HEADING_SECOND;
  const subtitle = data?.subtitle || FALLBACK_SUBTITLE;

  return (
    <section className="relative h-screen w-full overflow-hidden max-md:overflow-x-hidden max-md:w-[100vw] max-md:ml-[calc(50%-50vw)] bg-[#00112E]">
      <div
        className="relative flex h-screen w-full items-center justify-center overflow-hidden"
        style={{
          paddingLeft: "var(--section-px-wide)",
          paddingRight: "var(--section-px-wide)",
        }}
      >
        {/* ── BACKGROUND GLOWS & LINES ── */}
        <HeroGlow />
        <StaticGridLines />

        {/* ── CONTENT ── */}
        <motion.div
          className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-center justify-center text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          {/* ── HEADING ── */}
          <motion.h1
            className="m-0 flex flex-col items-center justify-center font-['Poppins',_sans-serif] font-black uppercase text-white max-md:!text-[32px]"
            style={{
              fontSize: "clamp(40px, 6vw, 96px)",
              lineHeight: "105%",
              letterSpacing: "-0.02em",
            }}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.8, ease: "easeOut" },
              },
            }}
          >
            <span>{headingFirst}</span>
            <span>{headingSecond}</span>
          </motion.h1>

          {/* ── SUBTITLE ── */}
          <motion.p
            className="mt-[clamp(16px,min(2.5vw,4vh),36px)] max-w-[800px] font-['Poppins',_sans-serif] font-normal leading-[1.6] text-white/90 text-center"
            style={{ fontSize: "clamp(14px, min(1.6vw, 2.35vh), 20px)" }}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.8, ease: "easeOut", delay: 0.2 },
              },
            }}
          >
            {subtitle}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}