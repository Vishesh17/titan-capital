"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/* ─────────────────────────────────────────────────────────
   HeroGlow — the hero section's aurora glow, made reusable.

   Two large ambient blobs (SVG ellipses behind a 100 px gaussian
   blur + fractal-noise grain) that slowly wander AND parallax with
   the cursor, plus a third blob that tracks the cursor directly
   (screen blend). Identical look + motion to the hero; drop it in
   any dark section.

   • `idPrefix` keeps the SVG filter/gradient ids unique so two
     instances on the same page don't collide.
   • Cursor coordinates are measured relative to THIS component's
     own box, so the cursor blob works wherever the section sits
     on the page (not just at the document top).
   ───────────────────────────────────────────────────────── */

/* feFuncA discrete grain table (50 ones + 50 zeros) — the coarse
   noise texture inside the blobs (from the Figma export). */
const GRAIN =
  "1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ";

export default function HeroGlow({
  idPrefix = "glow",
  scale = 1,
}: {
  idPrefix?: string;
  /* Multiplies the three blob widths. The default (1) is the full-viewport
     hero sizing. Shorter/smaller sections (e.g. Indicorns) pass a smaller
     value so the blobs are scaled to THAT section rather than overflowing it. */
  scale?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const normX = useMotionValue(0);
  const normY = useMotionValue(0);

  /* Softer, heavier spring so the cursor blob trails gently instead of
     snapping to the pointer — reads as a calm, natural drift, not a
     "violent" flick. */
  const cursorSpring = { damping: 42, stiffness: 32, mass: 1.3 };
  const smoothX = useSpring(mouseX, cursorSpring);
  const smoothY = useSpring(mouseY, cursorSpring);

  const ambientSpring = { damping: 30, stiffness: 70, mass: 1 };
  const smoothNormX = useSpring(normX, ambientSpring);
  const smoothNormY = useSpring(normY, ambientSpring);

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      mouseX.set(r.width / 2);
      mouseY.set(r.height / 2);
    }
    const handleMouseMove = (e: MouseEvent) => {
      const node = containerRef.current;
      if (!node) return;
      const r = node.getBoundingClientRect();
      /* Coordinates relative to THIS glow's box, so the cursor blob is
         anchored to the section wherever it sits on the page. */
      mouseX.set(e.clientX - r.left);
      mouseY.set(e.clientY - r.top);
      normX.set(((e.clientX - r.left) / r.width) * 2 - 1);
      normY.set(((e.clientY - r.top) / r.height) * 2 - 1);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, normX, normY]);

  // Interactive parallax sweep for the two ambient blobs.
  const leftX = useTransform(smoothNormX, [-1, 1], ["-15%", "15%"]);
  const leftY = useTransform(smoothNormY, [-1, 1], ["-15%", "15%"]);
  const rightX = useTransform(smoothNormX, [-1, 1], ["15%", "-15%"]);
  const rightY = useTransform(smoothNormY, [-1, 1], ["15%", "-15%"]);

  const lF = `${idPrefix}_glow_l_f`;
  const lG = `${idPrefix}_glow_l_g`;
  const rF = `${idPrefix}_glow_r_f`;
  const rG = `${idPrefix}_glow_r_g`;
  const cF = `${idPrefix}_glow_c_f`;
  const cG = `${idPrefix}_glow_c_g`;

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* 1. LEFT BLOB — parallax + ambient wander */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute"
        style={{ left: "-16%", top: "-12%", width: `calc(min(72vw, 112vh) * ${scale})`, zIndex: 0, x: leftX, y: leftY, willChange: "transform" }}
      >
        <motion.div
          animate={{
            x: ["-20%", "80%", "20%", "60%", "-20%"],
            y: ["-20%", "40%", "60%", "10%", "-20%"],
            scale: [1, 1.2, 0.88, 1.12, 1],
            rotate: [0, 16, -10, 7, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
        >
          <svg viewBox="0 0 836 1113" fill="none" className="h-auto w-full" style={{ overflow: "visible" }}>
            <g filter={`url(#${lF})`}>
              <ellipse cx="350.252" cy="360.273" rx="350.252" ry="360.273" transform="matrix(-0.412381 0.911012 -0.918704 -0.394948 683.844 325.254)" fill={`url(#${lG})`} />
            </g>
            <defs>
              <filter id={lF} x="-352.797" y="-47.4102" width="1122.44" height="1098.92" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feGaussianBlur stdDeviation="100" result="effect1_foregroundBlur" />
                <feTurbulence type="fractalNoise" baseFrequency="2 2" stitchTiles="stitch" numOctaves={3} result="noise" seed={5393} />
                <feColorMatrix in="noise" type="luminanceToAlpha" result="alphaNoise" />
                <feComponentTransfer in="alphaNoise" result="coloredNoise1">
                  <feFuncA type="discrete" tableValues={GRAIN} />
                </feComponentTransfer>
                <feComposite operator="in" in2="effect1_foregroundBlur" in="coloredNoise1" result="noise1Clipped" />
                <feFlood floodColor="rgba(0, 0, 0, 0.25)" result="color1Flood" />
                <feComposite operator="in" in2="noise1Clipped" in="color1Flood" result="color1" />
                <feMerge result="effect2_noise">
                  <feMergeNode in="effect1_foregroundBlur" />
                  <feMergeNode in="color1" />
                </feMerge>
              </filter>
              <linearGradient id={lG} x1="350.252" y1="0" x2="894.384" y2="321.126" gradientUnits="userSpaceOnUse">
                <stop offset="0.0199933" stopColor="#022250" />
                <stop offset="0.482966" stopColor="#054EB6" />
                <stop offset="0.653846" stopColor="#5054B5" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      </motion.div>

      {/* 2. RIGHT BLOB — parallax + ambient wander */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute"
        style={{ right: "-14%", bottom: "-14%", width: `calc(min(66vw, 100vh) * ${scale})`, zIndex: 0, x: rightX, y: rightY, willChange: "transform" }}
      >
        <motion.div
          animate={{
            x: ["20%", "-70%", "-15%", "-50%", "20%"],
            y: ["20%", "-42%", "-58%", "-12%", "20%"],
            scale: [1, 1.2, 0.88, 1.12, 1],
            rotate: [0, -16, 10, -7, 0],
          }}
          transition={{ duration: 21, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
        >
          <svg viewBox="0 0 825 906" fill="none" className="h-auto w-full" style={{ overflow: "visible" }}>
            <g filter={`url(#${rF})`}>
              <ellipse cx="528.5" cy="390" rx="328.5" ry="316" fill={`url(#${rG})`} />
            </g>
            <defs>
              <filter id={rF} x="0" y="-126" width="1057" height="1032" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feGaussianBlur stdDeviation="100" result="effect1_foregroundBlur" />
                <feTurbulence type="fractalNoise" baseFrequency="2 2" stitchTiles="stitch" numOctaves={3} result="noise" seed={5393} />
                <feColorMatrix in="noise" type="luminanceToAlpha" result="alphaNoise" />
                <feComponentTransfer in="alphaNoise" result="coloredNoise1">
                  <feFuncA type="discrete" tableValues={GRAIN} />
                </feComponentTransfer>
                <feComposite operator="in" in2="effect1_foregroundBlur" in="coloredNoise1" result="noise1Clipped" />
                <feFlood floodColor="rgba(0, 0, 0, 0.25)" result="color1Flood" />
                <feComposite operator="in" in2="noise1Clipped" in="color1Flood" result="color1" />
                <feMerge result="effect2_noise">
                  <feMergeNode in="effect1_foregroundBlur" />
                  <feMergeNode in="color1" />
                </feMerge>
              </filter>
              <linearGradient id={rG} x1="528.5" y1="74" x2="159.589" y2="703.982" gradientUnits="userSpaceOnUse">
                <stop offset="0.217633" stopColor="#001A4D" />
                <stop offset="0.553059" stopColor="#033699" />
                <stop offset="0.894231" stopColor="#AC71C6" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      </motion.div>

      {/* 3. CURSOR BLOB — follows the pointer (screen blend) */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-0 left-0"
        style={{
          width: `calc(min(50vw, 62vh) * ${scale})`,
          zIndex: 5,
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: 0.8,
          mixBlendMode: "screen",
          willChange: "transform",
        }}
      >
        <svg viewBox="0 0 800 800" fill="none" className="h-auto w-full" style={{ overflow: "visible" }}>
          <g filter={`url(#${cF})`}>
            <circle cx="400" cy="400" r="300" fill={`url(#${cG})`} />
          </g>
          <defs>
            <filter id={cF} x="-250" y="-250" width="1300" height="1300" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="115" result="effect1_foregroundBlur" />
              <feTurbulence type="fractalNoise" baseFrequency="2 2" stitchTiles="stitch" numOctaves={3} result="noise" seed={5393} />
              <feColorMatrix in="noise" type="luminanceToAlpha" result="alphaNoise" />
              <feComponentTransfer in="alphaNoise" result="coloredNoise1">
                <feFuncA type="discrete" tableValues={GRAIN} />
              </feComponentTransfer>
              <feComposite operator="in" in2="effect1_foregroundBlur" in="coloredNoise1" result="noise1Clipped" />
              <feFlood floodColor="rgba(0, 0, 0, 0.25)" result="color1Flood" />
              <feComposite operator="in" in2="noise1Clipped" in="color1Flood" result="color1" />
              <feMerge result="effect2_noise">
                <feMergeNode in="effect1_foregroundBlur" />
                <feMergeNode in="color1" />
              </feMerge>
            </filter>
            <radialGradient id={cG} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="30%" stopColor="#054EB6" stopOpacity="0.6" />
              <stop offset="70%" stopColor="#5054B5" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#AC71C6" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </motion.div>
    </div>
  );
}
