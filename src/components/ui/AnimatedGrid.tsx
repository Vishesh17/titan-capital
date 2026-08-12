"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * The faint vertical line field that sits over the navy hero glow.
 *
 * Lifted out of GetInvestmentHero so the Join Portfolio CTA runs the same one
 * rather than a copy that drifts. Drawing is unchanged from the original:
 *
 *   - vertical lines only, spaced at 1/8th of the canvas width, white at 6%;
 *   - two radial pulses travelling outward from the centre, which brighten
 *     each line as they cross it — that's the ambient "breathing";
 *   - within 180px of the cursor the lines bend on a travelling sine and
 *     brighten further, so the sheet reads as tilting in 3D.
 *
 * Mouse tracking binds to the canvas's PARENT, so whatever element this is
 * dropped into becomes the hover area. It renders at `zIndex: 1` — above the
 * ambient glow blobs (0), below the cursor blob (5) and the content (10).
 */
export default function AnimatedGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  const onMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
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

    let animationId = 0;
    const startTime = performance.now();

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Fixed at mount, as in the original — the spacing stays put on resize
    // rather than the column count staying at 8. The floor of 1 matters: a
    // canvas measured at 0 width would make this 0, and `x += 0` never
    // terminates the draw loop.
    const GRID_SIZE = Math.max(
      1,
      Math.round(canvas.getBoundingClientRect().width / 8)
    );
    const BASE_ALPHA = 0.06;
    const CURSOR_RADIUS = 180;
    const WAVE_AMP = 6;
    const WAVE_BOOST = 0.1;

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
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
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

      animationId = requestAnimationFrame(draw);
    };

    let running = false;
    const start = () => {
      if (!running) {
        running = true;
        animationId = requestAnimationFrame(draw);
      }
    };
    const stop = () => {
      if (running) {
        running = false;
        cancelAnimationFrame(animationId);
      }
    };

    resize();
    window.addEventListener("resize", resize);

    // The original ran its rAF from mount for the life of the page, which was
    // affordable for a hero that sits at the top. This component now also runs
    // in a footer CTA on several pages, so the loop is gated on visibility.
    // Identical output whenever the canvas is on screen.
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { rootMargin: "200px" }
    );
    io.observe(canvas);

    return () => {
      window.removeEventListener("resize", resize);
      io.disconnect();
      stop();
      if (section) {
        section.removeEventListener("mousemove", onMouseMove);
        section.removeEventListener("mouseleave", onMouseLeave);
      }
    };
  }, [onMouseMove, onMouseLeave]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ zIndex: 1 }}
    />
  );
}
