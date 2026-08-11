"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  HERO_BODY_CLASS,
  HERO_BODY_STYLE,
  SECTION_HEADING_CLASS,
  SECTION_HEADING_STYLE,
} from "@/styles/heroTypography";

/* ─────────────────────────────────────────────────────────
   Hero Glow Background (With Local Cursor Tracking)
   ───────────────────────────────────────────────────────── */
export function HeroGlow({ sectionRef }: { sectionRef: React.RefObject<HTMLElement | null> }) {
  // Initial values far off-screen so the blob doesn't jump on load
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
      if (sectionRef.current) {
        // Calculate the mouse position strictly relative to THIS section
        // so the blob doesn't get pushed out of bounds by page scrolling.
        const rect = sectionRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      }
      normX.set((e.clientX / window.innerWidth) * 2 - 1);
      normY.set((e.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, normX, normY, sectionRef]);

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

      {/* ── This is the Cursor Blob flashlight effect ── */}
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
          opacity: 0.65,
          background:
            "radial-gradient(circle, rgba(150,158,240,0.95) 0%, rgba(70,120,225,0.6) 40%, rgba(5,78,182,0.25) 70%, transparent 100%)",
          willChange: "transform",
        }}
      />
    </>
  );
}

/* ─────────────────────────────────────────────────────────
   Cursor-origin fill button
   ───────────────────────────────────────────────────────── */
export function CursorFillButton({ href, label }: { href: string; label: string }) {
  const [origin, setOrigin] = useState("50% 50%");
  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
    setHovered(true);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
    setHovered(false);
  };

  return (
    <Link
      href={href}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative flex items-center justify-center overflow-hidden whitespace-nowrap font-['Poppins',_sans-serif] text-[min(1.16vw,1.79vh)] font-normal transition-colors duration-300 max-md:!w-[clamp(150px,45vw,200px)] max-md:!h-[clamp(44px,7dvh,52px)] max-md:!text-[clamp(14px,3.5vw,16px)]"
      style={{
        width: "clamp(160px, min(14vw, 20vh), 220px)",
        height: "clamp(48px, min(4.5vw, 6vh), 60px)",
        borderRadius: "53px",
        border: "1px solid #FFFFFF",
        color: hovered ? "#001A4D" : "white",
        fontSize: "clamp(15px, min(1.2vw, 1.8vh), 18px)",
      }}
    >
      <span
        className="absolute inset-0 bg-white transition-transform duration-400 ease-out"
        style={{
          transformOrigin: origin,
          transform: hovered ? "scale(1)" : "scale(0)",
          borderRadius: "inherit",
        }}
      />
      <span className="relative z-10">{label}</span>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────
   Main Component
   ───────────────────────────────────────────────────────── */
export default function JoinPortfolioCTA() {
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
      {/* ── BACKGROUND GLOWS ── */}
      <HeroGlow sectionRef={sectionRef} />

      <motion.div
        className="relative z-10 flex w-full max-w-[800px] flex-col items-center text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* ── HEADING ── */}
        <h2
   className={`m-0 text-white ${SECTION_HEADING_CLASS}`}
   style={{
   ...SECTION_HEADING_STYLE,
   marginBottom: "clamp(16px, 2vw, 24px)",
   }}
  >
          Want To Join <br className="hidden md:block" />
          Our Portfolio?
        </h2>

        {/* ── SUBTITLE ── */}
        <p
          className={`text-white/90 ${HERO_BODY_CLASS}`}
          style={{ ...HERO_BODY_STYLE, marginBottom: "clamp(32px, 4vw, 48px)" }}
        >
          It is never to late to be part of the <br className="hidden md:block" />
          Titan Capital
        </p>

        {/* ── BUTTON ── */}
        <CursorFillButton href="/getinvestment" label="Get Investment" />
      </motion.div>
    </section>
  );
}