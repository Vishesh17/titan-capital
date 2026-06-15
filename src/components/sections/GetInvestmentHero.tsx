"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";

/*
  ANIMATED GRID BACKGROUND
  Draws a grid on canvas. Grid lines near the cursor get a wavy
  sine-wave distortion + brightness boost. Rest of the grid stays
  static with a subtle radial wave ripple from center.
  (Same implementation as WinnersHero / TitanSeedHero)
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
    const WAVE_BOOST = 0.10;

    const draw = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const cx = w / 2;
      const cy = h / 2;
      const maxDist = Math.sqrt(cx * cx + cy * cy);

      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;

      const waves = [
        { speed: 110, width: 200 },
        { speed: 75, width: 280 },
      ];

      const getRadialBoost = (px: number, py: number) => {
        const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
        let boost = 0;
        for (const wave of waves) {
          const wavePos = (elapsed * wave.speed) % (maxDist + wave.width);
          const delta = Math.abs(dist - wavePos);
          if (delta < wave.width) {
            boost += (1 - delta / wave.width) * WAVE_BOOST;
          }
        }
        return Math.min(boost, WAVE_BOOST * 1.5);
      };

      const getWave = (px: number, py: number) => {
        const radialBoost = getRadialBoost(px, py);
        const dist = Math.sqrt((px - mx) ** 2 + (py - my) ** 2);
        if (dist > CURSOR_RADIUS) {
          return { offset: 0, alpha: BASE_ALPHA + radialBoost };
        }

        const proximity = 1 - dist / CURSOR_RADIUS;
        const smooth = proximity * proximity;
        const offset = Math.sin(elapsed * 3 + dist * 0.04) * WAVE_AMP * smooth;
        const alpha = BASE_ALPHA + radialBoost + smooth * 0.14;

        return { offset, alpha };
      };

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

export default function GetInvestmentHero() {
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

        {/* ── HEADING: "We" + "Invest early" ── */}
        <motion.h1
          className="m-0 flex flex-row flex-wrap items-center justify-center gap-x-3 max-md:gap-x-2 font-['Libre_Baskerville',_serif] font-semibold leading-[110%] text-[#001A4D] max-md:!text-[28px]"
          style={{ fontSize: "var(--heading-xl)" }}
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
          }}
        >
          <span>We</span>
          <motion.span
            className="relative inline-flex items-center justify-center overflow-hidden px-[4px] py-[6px] md:px-[6px] md:py-[8px] bg-transparent"
            variants={{
              hidden: { opacity: 0, x: -40 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut", delay: 0.3 } }
            }}
          >
            <motion.span
              className="absolute inset-0 z-0 bg-[#D3E2FF] h-full w-full"
              style={{ transformOrigin: "left" }}
              variants={{
                hidden: { scaleX: 0 },
                visible: { scaleX: 1, transition: { duration: 0.6, ease: "easeInOut", delay: 0.8 } }
              }}
            />
            <span className="relative z-10 italic">
              Invest Early
            </span>
          </motion.span>
        </motion.h1>

        {/* ── SUBTITLE ── */}
        <motion.p
          className="mt-[clamp(16px,min(2.5vw,4vh),36px)] max-w-[600px] font-['Poppins',_sans-serif] font-normal leading-[1.6] text-[#323232] text-center"
          style={{ fontSize: "clamp(14px, min(1.6vw, 2.35vh), 20px)" }}
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay: 0.6 } }
          }}
        >
          If you're building something that matters, a company you believe in enough to give the next decade of your life to, we would want to hear about it.
        </motion.p>

      </motion.div>
    </section>
  );
}
