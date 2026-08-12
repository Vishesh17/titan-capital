"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useInView,
  type TargetAndTransition,
} from "framer-motion";
import {
  HERO_HEADING_DARK_CLASS,
  HERO_HEADING_DARK_STYLE,
  HERO_BODY_CLASS,
  HERO_BODY_STYLE,
} from "@/styles/heroTypography";
import AnimatedGrid from "@/components/ui/AnimatedGrid";

/* ─────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────── */
export interface GetInvestmentHeroData {
  headingFirst?: string;
  headingSecond?: string;
  subtitle?: string;
}

const FALLBACK_HEADING_FIRST = "We Invest Early";

const FALLBACK_SUBTITLE =
  "If you're building a company you'd give the next decade of your life to, we want to hear about it.";

/* ─────────────────────────────────────────────────────────
   Hero Glow Background
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
   RevealLine — per-character 3D flip animation
   ───────────────────────────────────────────────────────── */
const CHAR_STAGGER = 0.035;
function RevealLine({
  children,
  show,
  delay = 0,
}: {
  children: string;
  show: boolean;
  delay?: number;
}) {
  const chars = children.split("");

  return (
    <span
      className="inline-flex whitespace-nowrap"
      aria-label={children}
      style={{ perspective: "500px", transformStyle: "preserve-3d" }}
    >
      {chars.map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-flex"
          style={{
            transformOrigin: "center center",
            backfaceVisibility: "hidden",
            transformStyle: "preserve-3d",
            willChange: "transform",
            transform:
              "translateZ(-0.85em) rotateX(var(--rotateX)) scaleY(var(--scaleY)) translateZ(0.85em)",
          }}
          initial={{
            "--rotateX": "-90deg",
            "--scaleY": 1.5,
            opacity: 0,
          } as TargetAndTransition}
          animate={{
            "--rotateX": show ? "0deg" : "-90deg",
            "--scaleY": show ? 1 : 1.5,
            opacity: show ? 1 : 0,
          } as TargetAndTransition}
          transition={{
            duration: 1.1,
            ease: [0.76, 0, 0.24, 1],
            delay: delay + i * CHAR_STAGGER,
          }}
        >
          <span style={{width: ch === " " ? "0.3em" : "auto"}}>{ch === " " ? " " : ch}</span>
        </motion.span>
      ))}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────
   Main Component
   ───────────────────────────────────────────────────────── */
export default function GetInvestmentHeroClient({
  data,
}: {
  data?: GetInvestmentHeroData | null;
}) {
  const headingFirst = data?.headingFirst || FALLBACK_HEADING_FIRST;
  const subtitle = data?.subtitle || FALLBACK_SUBTITLE;

  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.3 });
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (inView) setShow(true);
  }, [inView]);

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden max-md:overflow-x-hidden max-md:w-[100vw] max-md:ml-[calc(50%-50vw)] bg-[#00112E]" style={{ height: "70svh" }}>
      <div
        className="relative flex h-full w-full items-center justify-center overflow-hidden"
        style={{
          paddingLeft: "var(--section-px-wide)",
          paddingRight: "var(--section-px-wide)",
        }}
      >
        <HeroGlow />
        <AnimatedGrid />

        <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-center justify-center text-center">
          <h1
            className={`m-0 flex flex-col items-center justify-center text-white ${HERO_HEADING_DARK_CLASS}`}
            style={HERO_HEADING_DARK_STYLE}
          >
            <RevealLine show={show} delay={0}>{headingFirst}</RevealLine>
          </h1>

          <motion.p
            className={`mt-[clamp(16px,min(2.5vw,4vh),36px)] max-w-[800px] text-center text-white/90 ${HERO_BODY_CLASS}`}
            style={HERO_BODY_STYLE}
            initial={{ opacity: 0, y: 20 }}
            animate={show ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.8 }}
          >
            {subtitle}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
