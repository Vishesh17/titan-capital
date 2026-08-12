"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, Variants } from "framer-motion";
import {
  HERO_BODY_CLASS,
  HERO_BODY_STYLE,
} from "@/styles/heroTypography";

/* ─────────────────────────────────────────────────────────
   Types — shared with the server wrapper (TitanSeedHero.tsx).
   ───────────────────────────────────────────────────────── */
export interface BeyondTheChequeHeroData {
  headingFirst?: string;
  headingSecond?: string;
  subtitle?: string;
}

const FALLBACK_HEADING_FIRST = "Capital Is The Stakes";
const FALLBACK_HEADING_SECOND = "Here’s Everything Else.";
const FALLBACK_SUBTITLE =
  "We’ve been asked by founders what makes Titan different. Here’s our  honest answer.";

/* ═══════════════════════════════════════════════════════
   Heading entrance animation variants
   ═══════════════════════════════════════════════════════ */
   const headingVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };
  
  const subtitleVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut", delay: 0.2 },
    },
  };
  


/*
  ANIMATED GRID BACKGROUND
  Draws a grid on canvas. Grid lines near the cursor get a wavy
  sine-wave distortion + brightness boost — effect is localised
  to the cursor area only. Rest of the grid stays static.
*/
function AnimatedGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  const onMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const onMouseLeave = useCallback(() => {
    mouseRef.current = { x: -9999, y: -9999 };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Attach mouse listeners to the PARENT section (canvas is pointer-events-none)
    const section = canvas.parentElement;
    if (section) {
      section.addEventListener("mousemove", onMouseMove);
      section.addEventListener("mouseleave", onMouseLeave);
    }

    let animationId: number;
    const startTime = performance.now();

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const GRID_SIZE = 90;
    const BASE_ALPHA = 0.06;
    const CURSOR_RADIUS = 180;
    const WAVE_AMP = 6;

    const draw = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;

      // Helper: wave offset + alpha boost based on distance to cursor
      const getWave = (px: number, py: number) => {
        const dist = Math.sqrt((px - mx) ** 2 + (py - my) ** 2);
        if (dist > CURSOR_RADIUS) return { offset: 0, alpha: BASE_ALPHA };

        const proximity = 1 - dist / CURSOR_RADIUS;
        const smooth = proximity * proximity;
        const offset = Math.sin(elapsed * 3 + dist * 0.04) * WAVE_AMP * smooth;
        const alpha = BASE_ALPHA + smooth * 0.14;

        return { offset, alpha };
      };

      // ── VERTICAL LINES (displaced horizontally by wave near cursor) ──
      for (let x = 0; x <= w; x += GRID_SIZE) {
        ctx.beginPath();
        let started = false;
        for (let y = 0; y <= h; y += 4) {
          const { offset, alpha } = getWave(x, y);
          ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
          const dx = x + offset;
          if (!started) {
            ctx.moveTo(dx, y);
            started = true;
          } else {
            ctx.lineTo(dx, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(dx, y);
          }
        }
        ctx.stroke();
      }

      // ── HORIZONTAL LINES (displaced vertically by wave near cursor) ──
      for (let y = 0; y <= h; y += GRID_SIZE) {
        ctx.beginPath();
        let started = false;
        for (let x = 0; x <= w; x += 4) {
          const { offset, alpha } = getWave(x, y);
          ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
          const dy = y + offset;
          if (!started) {
            ctx.moveTo(x, dy);
            started = true;
          } else {
            ctx.lineTo(x, dy);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, dy);
          }
        }
        ctx.stroke();
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    animationId = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
      if (section) {
        section.removeEventListener("mousemove", onMouseMove);
        section.removeEventListener("mouseleave", onMouseLeave);
      }
    };
  }, [onMouseMove, onMouseLeave]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ zIndex: 0 }}
    />
  );
}

export default function BeyondTheChequeHeroClient({
  data,
}: {
  data?: BeyondTheChequeHeroData | null;
}) {
  const headingFirst = data?.headingFirst || FALLBACK_HEADING_FIRST;
  const headingSecond = data?.headingSecond || FALLBACK_HEADING_SECOND;
  const subtitle = data?.subtitle || FALLBACK_SUBTITLE;

  return (
    <section
      className="relative flex w-full items-center justify-center overflow-hidden bg-[#FBF7F0] max-md:h-[50svh]"
      style={{
        marginTop: "var(--nav-height)",
        height: "clamp(320px, 52vh, 520px)",
        paddingTop: "clamp(20px, min(3vw, 4vh), 60px)",
        paddingBottom: "clamp(20px, min(3vw, 4vh), 60px)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >

      {/* ── ANIMATED GRID BACKGROUND ── */}
      <AnimatedGrid />

      {/* ── CONTENT ── */}
      <motion.div
        className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-center justify-center text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
      >

        {/* ── HEADING ── */}
        

          <motion.div
            className="relative mt-[clamp(4px,0.5vw,8px)] inline-flex items-center justify-center overflow-hidden bg-transparent px-[4px] py-[8px] md:px-[6px] md:py-[10px]"
            variants={subtitleVariants}
          >
            <motion.span
              className="absolute inset-0 z-0 h-full w-full bg-[#D3E2FF]"
              style={{ transformOrigin: "left" }}
              variants={{
                hidden: { scaleX: 0 },
                visible: {
                  scaleX: 1,
                  transition: { duration: 0.6, ease: "easeInOut", delay: 0.6 },
                },
              }}
            />
            <span
              className="relative z-10 font-['Libre_Baskerville',_serif] text-[length:var(--heading-xl)] max-md:!text-[28px] font-semibold italic leading-[115%] text-[#001A4D]"
            >
              {headingFirst}
            </span>
          </motion.div>
          <motion.div
          className="mb-[clamp(14px,min(2vw,3vh),28px)] flex flex-col items-center"
          style={{ paddingLeft: "var(--section-px-wide)", paddingRight: "var(--section-px-wide)" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.h2
            className="m-0 font-['Libre_Baskerville',_serif] text-[length:var(--heading-xl)] max-md:!text-[28px] font-semibold not-italic leading-[115%] text-[#001A4D]"
            variants={headingVariants}
          >
            {headingSecond}
          </motion.h2>
        </motion.div>

        {/* ── SUBTITLE ── */}
        <motion.p
          className={`font-normal mt-[clamp(16px,min(2.5vw,4vh),36px)] max-w-[600px] text-center text-[#323232] ${HERO_BODY_CLASS}`}
          style={HERO_BODY_STYLE}
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay: 0.6 } }
          }}
        >
          {subtitle}
        </motion.p>

      </motion.div>
    </section>
  );
}
