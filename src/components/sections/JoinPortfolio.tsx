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
  SECTION_HEADING_CLASS,
  SECTION_HEADING_STYLE,
} from "@/styles/heroTypography";
import { CTA_BUTTON_STYLE, CTA_BUTTON_MOBILE_CLASS } from "@/styles/ctaButton";
import AnimatedGrid from "@/components/ui/AnimatedGrid";

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
      /* Identical to the navbar's non-inverted pill: same geometry token, same
         mobile overrides, same #CDCDCD hairline. It used to carry its own
         larger width/height and a pure-white border, which is why it read as a
         different control from every other Get Investment button. */
      className={`relative flex shrink-0 items-center justify-center whitespace-nowrap font-['Poppins',_sans-serif] font-normal transition-colors duration-300 ${CTA_BUTTON_MOBILE_CLASS}`}
      style={{
        ...CTA_BUTTON_STYLE,
        border: "1px solid #CDCDCD",
        color: hovered ? "#001A4D" : "white",
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
      {/* ── BACKGROUND GLOWS + LINE GRID ──
          Same pairing as the Get Investment hero: the glow blobs sit at z-0,
          the grid at z-1, the cursor blob at z-5, content at z-10. The grid
          binds its mouse tracking to its parent, so the whole section is the
          hover area. */}
      <HeroGlow sectionRef={sectionRef} />
      <AnimatedGrid />

      <motion.div
        /* Was max-w-[800px], which only ever constrained the description. The
           heading now runs on one line and needs ~64% of the viewport width,
           so the cap moves to the site-standard 1440px. */
        className="relative z-10 flex w-full max-w-[1440px] flex-col items-center text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* ── HEADING ──
            Same scale as "You Build the Vision" in FoundersTestimonial: both
            take SECTION_HEADING_CLASS + SECTION_HEADING_STYLE untouched, so
            weight, size and line-height match on both breakpoints. Only the
            colour differs, because this one sits on navy. */}
        <h2
          /* One line on desktop. Not forced on mobile: at the ≤767px clamp the
             full string is about as wide as a 390px screen, so nowrap there
             would push it out of the gutters — it wraps instead. */
          className={`m-0 whitespace-nowrap text-white max-md:!whitespace-normal ${SECTION_HEADING_CLASS}`}
          style={{
            ...SECTION_HEADING_STYLE,
            // Takes over the gap the description used to hold, so the heading
            // still stands clear of the button now that it's gone.
            marginBottom: "clamp(32px, 4vw, 48px)",
          }}
        >
          Want To Join <br className="md:hidden" />
          Our Portfolio?
        </h2>

        {/* ── BUTTON ── */}
        <CursorFillButton href="/getinvestment" label="Write To Us" />
      </motion.div>
    </section>
  );
}