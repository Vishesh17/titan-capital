"use client";

import Image from "next/image";
import { useEffect, useRef, useCallback, useState } from "react";
import {
  motion,
  Variants,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useInView,
  type TargetAndTransition,
} from "framer-motion";

/*
  "Backed Early. Built to last"
  Desktop: Continuous smooth marquee with ultra-minimal background fade overlays.
  Mobile: 2x2 grid with independent, sequential 3D card-flip rotations.
*/

export const MARQUEE_CSS = `
@keyframes continuous-marquee {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
`;

/* ─────────────────────────────────────────────────────────
   Hero Glow Background
   ───────────────────────────────────────────────────────── */
export function HeroGlow() {
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
   Animated Grid — canvas with cursor-follow wave distortion
   ───────────────────────────────────────────────────────── */
export function AnimatedGrid() {
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

    let animationId: number;
    const startTime = performance.now();

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const GRID_SIZE = Math.round(canvas.getBoundingClientRect().width / 8);
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
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          const dx = x + offset;
          if (!started) { ctx.moveTo(dx, y); started = true; }
          else { ctx.lineTo(dx, y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(dx, y); }
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
      style={{ zIndex: 1 }}
    />
  );
}

/* ═══════════════════════════════════════════════════════
   Company data — all 12 portfolio companies
   ═══════════════════════════════════════════════════════ */
const LOGO_W = 150;
const LOGO_H = 40;

const companies = [
  { name: "Shadowfax",     bgImage: "/images/portfolio/shadowfax.webp",     logo: "/images/logos_backup/Shadowfax.svg",                logoScale: 1.2 },
  { name: "Credgenics",    bgImage: "/images/portfolio/credgenics.webp",    logo: "/images/logos_backup/Credgenics.svg",               logoScale: 0.9 },
  { name: "OLA",           bgImage: "/images/portfolio/ola_bg.webp",           logo: "/images/logos_backup/ola.svg",                      logoScale: 0.7 },
  { name: "Zouk",          bgImage: "/images/portfolio/zouk.webp",          logo: "/images/logos_backup/zouk_new_logo.webp",           logoScale: 0.8 },
  { name: "Unicommerce",   bgImage: "/images/portfolio/unicommerce.webp",   logo: "/images/logos_backup/unicommerce-logo.svg",         logoScale: 1.0 },
  { name: "Khatabook",     bgImage: "/images/portfolio/khatabook.webp",     logo: "/images/logos_backup/khatabook.png",                logoScale: 1.2, logoClass: "translate-y-[5px]" },
  { name: "Mamaearth",     bgImage: "/images/portfolio/mamaearth.webp",     logo: "/images/logos_backup/mamaearthpng-logo.webp",       logoScale: 1.0 },
  { name: "Ofbusiness",    bgImage: "/images/portfolio/ofbusiness.webp",    logo: "/images/logos_backup/ofbusiness_white.svg",         logoScale: 1.0 },
  { name: "Cart.com",      bgImage: "/images/portfolio/cartdotcom.webp",    logo: "/images/logos_backup/cartdotcom.svg",               logoScale: 1.0, noInvert: true },
  { name: "Razorpay",      bgImage: "/images/portfolio/razorpay.webp",      logo: "/images/logos_backup/Razorpay-logo.webp",           logoScale: 1.0 },
  { name: "Snapdeal",      bgImage: "/images/portfolio/snapdeal.webp",      logo: "/images/logos_backup/snapdeal-company-1-logo.webp", logoScale: 1.0 },
  { name: "Urban Company", bgImage: "/images/portfolio/urbancompany.webp",  logo: "/images/logos_backup/uc_white.png",                 logoScale: 1.0 },
];

/* ═══════════════════════════════════════════════════════
   CompanyCard
   ═══════════════════════════════════════════════════════ */
function CompanyCard({ company, mode = "marquee" }: { company: (typeof companies)[number], mode?: "marquee" | "grid" }) {
  const scale = company.logoScale ?? 1;
  const w = LOGO_W * scale;
  const h = LOGO_H * scale;

  // Cards reduced in size while keeping aspect ratio 1:1
  const modeStyles = mode === "marquee" ? {
    width: "clamp(130px, 16vw, 240px)",
    height: "clamp(130px, 16vw, 240px)",
    borderRadius: "clamp(2px, 0.83vw, 2px)",
    boxShadow: "0 0 14px 8px rgba(0, 0, 0, 0.4)",
  } : {
    width: "100%",
    aspectRatio: "1/1",
    borderRadius: "8px",
    boxShadow: "0 4px 10px 4px rgba(0, 0, 0, 0.3)",
  };

  const isMarquee = mode === "marquee";

  return (
    <div
      className={`group/card relative shrink-0 overflow-hidden bg-[#0e1120] ${
        isMarquee
          ? "pointer-events-none"                                       
          : "cursor-pointer transition-all duration-300 ease-out hover:scale-105 hover:shadow-[0_0_20px_10px_rgba(0,0,0,0.5)]"
      }`}
      style={modeStyles}
    >
      {/* Background image */}
      <Image
        src={company.bgImage}
        alt={company.name}
        fill
        sizes={isMarquee ? "(max-width: 768px) 45vw, 22vw" : "50vw"}
        className={`object-cover ${isMarquee ? "" : "transition-transform duration-500 ease-out group-hover/card:scale-105"}`}
        style={{ objectPosition: "center" }}
      />

      {/* Full-card gradient (same ramp as the "Their Stories" cards in
          ImpactAtGlance) so the logo reads cleanly over the photo instead
          of blending into it. */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(21, 21, 21, 0.00) 0%, rgba(21, 21, 21, 0.82) 82%)",
        }}
      />

      {/* Logo container */}
      <div
        className={`absolute bottom-0 left-0 z-[2] flex items-end ${
          isMarquee ? "" : "transition-transform duration-300 ease-out group-hover/card:translate-y-[-4px]"
        }`}
        style={{ padding: isMarquee ? "clamp(14px, min(1.8vw, 2.6vh), 24px)" : "12px" }}
      >
        <div
          className="relative"
          style={{
            width: `clamp(${w * 0.45}px, ${(w / 1440) * 100}vw, ${w}px)`,
            height: `clamp(${h * 0.45}px, ${(h / 1440) * 100}vw, ${h}px)`,
          }}
        >
          <Image
            src={company.logo}
            alt={`${company.name} logo`}
            fill
            sizes="180px"
            className={`object-contain object-left object-bottom ${company.logoClass || ""} ${company.noInvert ? "" : "brightness-0 invert"}`}
          />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   CardMarquee (Desktop Only)
   ═══════════════════════════════════════════════════════ */
function CardMarquee() {
  const doubled = [...companies, ...companies];    
  const trackRef = useRef<HTMLDivElement>(null);    
  const [isDragging, setIsDragging] = useState(false); 

  const s = useRef({
    x: 0,              
    halfWidth: 0,      
    lastTime: 0,       
    hovered: false,     
    dragging: false,    
    dragStartX: 0,      
    dragStartScrollX: 0,
    velocity: 0,        
    lastPointerX: 0,    
    lastPointerTime: 0, 
  });

  const SPEED = 1 / 55000;
  const FRICTION = 0.92;
  const MIN_VEL  = 0.3;
  const MAX_DT = 33;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => { s.current.halfWidth = track.scrollWidth / 2; };
    requestAnimationFrame(measure);
    window.addEventListener("resize", measure);

    let rafId: number;

    const tick = (now: number) => {
      const st = s.current;

      if (!st.lastTime) { st.lastTime = now; rafId = requestAnimationFrame(tick); return; }

      const dt = Math.min(now - st.lastTime, MAX_DT);
      st.lastTime = now;

      if (st.halfWidth > 0 && !st.dragging) {
        if (Math.abs(st.velocity) > MIN_VEL) {
          st.x += st.velocity;
          st.velocity *= FRICTION;
          if (Math.abs(st.velocity) <= MIN_VEL) st.velocity = 0;
        }
        else if (!st.hovered) {
          st.x -= st.halfWidth * SPEED * dt;
        }
      }

      if (st.halfWidth > 0) {
        if (st.x < -st.halfWidth) st.x += st.halfWidth;
        if (st.x > 0)            st.x -= st.halfWidth;
      }

      track.style.transform = `translate3d(${st.x}px,0,0)`;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(rafId); window.removeEventListener("resize", measure); };
  }, []);

  const onMouseEnter = useCallback(() => { s.current.hovered = true; }, []);
  const onMouseLeave = useCallback(() => {
    s.current.hovered = false;
    if (s.current.dragging) { s.current.dragging = false; s.current.velocity = 0; setIsDragging(false); }
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const st = s.current;
    st.dragging = true;
    st.velocity = 0;                          
    st.dragStartX = e.clientX;
    st.dragStartScrollX = st.x;
    st.lastPointerX = e.clientX;
    st.lastPointerTime = performance.now();
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const st = s.current;
    if (!st.dragging) return;

    st.x = st.dragStartScrollX + (e.clientX - st.dragStartX);

    const now = performance.now();
    const dtMs = now - st.lastPointerTime;
    if (dtMs > 4) {                           
      st.velocity = (e.clientX - st.lastPointerX) * (16 / dtMs);
      st.lastPointerX = e.clientX;
      st.lastPointerTime = now;
    }
  }, []);

  const onPointerUp = useCallback(() => {
    s.current.dragging = false;
    setIsDragging(false);
  }, []);

  return (
    <div
      className={`relative w-full overflow-hidden hidden md:block select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* Dark theme left/right fade overlays */}
      <div className="absolute left-0 top-0 z-10 h-full w-[4%] bg-gradient-to-r from-[#00112E]/90 via-[#00112E]/40 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 z-10 h-full w-[4%] bg-gradient-to-l from-[#00112E]/90 via-[#00112E]/40 to-transparent pointer-events-none" />

      {/* The sliding track */}
      <div
        ref={trackRef}
        className="flex w-max items-center gap-[clamp(12px,1.5vw,20px)]"
        style={{ paddingRight: "clamp(12px,1.5vw,20px)", willChange: "transform" }}
      >
        {doubled.map((company, i) => (
          <CompanyCard key={`${company.name}-${i}`} company={company} mode="marquee" />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Mobile Fading Grid (Mobile Only — 3D Flip)
   ═══════════════════════════════════════════════════════ */
function MobileFadingGrid() {
  const [page, setPage] = useState(0);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(companies.length / itemsPerPage);

  useEffect(() => {
    const timer = setInterval(() => {
      setPage((prev) => (prev + 1) % totalPages);
    }, 4000); 
    return () => clearInterval(timer);
  }, [totalPages]);

  const currentSet = companies.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  const flipVariants: Variants = {
    initial: { rotateY: -90, opacity: 0 },
    animate: (custom: any) => ({
      rotateY: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeInOut", delay: custom * 0.25 }
    }),
    exit: (custom: any) => ({
      rotateY: 90,
      opacity: 0,
      transition: { duration: 0.4, ease: "easeInOut", delay: custom * 0.08 }
    })
  };

  return (
    <div 
      className="w-full px-[var(--section-px-wide)] md:hidden z-10"
      style={{ perspective: "1200px" }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          className="grid w-full grid-cols-2 grid-rows-2 gap-[12px]"
          style={{ transformStyle: "preserve-3d" }}
        >
          {currentSet.map((company, i) => (
            <div key={`${company.name}-${i}`} style={{ perspective: "1000px" }}>
              <motion.div
                variants={flipVariants}
                custom={i} 
                initial="initial"
                animate="animate"
                exit="exit"
                style={{ transformStyle: "preserve-3d" }}
                className="w-full h-full"
              >
                <CompanyCard company={company} mode="grid" />
              </motion.div>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   RevealLine — per-character 3D flip animation
   ═══════════════════════════════════════════════════════ */
const CHAR_STAGGER = 0.035;
export function RevealLine({
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

/* ═══════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════ */
export default function BackedEarly() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.3 });
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (inView) setShow(true);
  }, [inView]);

  return (
    <section
      ref={sectionRef}
      className="relative flex w-full flex-col overflow-hidden max-md:overflow-x-hidden max-md:w-[100vw] max-md:ml-[calc(50%-50vw)] bg-[#00112E] min-h-[100svh]"
      style={{
        paddingTop: "calc(var(--nav-height) + clamp(20px, min(4vw, 6vh), 60px))",
        paddingBottom: "clamp(20px, min(4vw, 6vh), 60px)",
      }}
    >
      <style>{MARQUEE_CSS}</style>

      <HeroGlow />
      <AnimatedGrid />

      <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-between">

        <div className="flex w-full flex-1 flex-col items-center justify-center mb-[clamp(32px,min(4vw,6vh),60px)]">
          <div className="flex w-full flex-col items-center">
            <h2
              className="m-0 flex w-full flex-col items-center justify-center font-['Poppins',_sans-serif] font-black uppercase text-white max-md:!text-[32px] text-center"
              style={{
                fontSize: "min(9.88vw, 15.2vh)",
                lineHeight: "86%",
              }}
            >
              <RevealLine show={show} delay={0}>Backed Early</RevealLine>
              <RevealLine show={show} delay={0.5}>Built To Last</RevealLine>
            </h2>

            {/* <motion.p
              className="mt-[clamp(16px,min(2.5vw,4vh),36px)] max-w-[800px] font-['Poppins',_sans-serif] font-normal leading-[1.6] text-white/90 text-center"
              style={{
                fontSize: "clamp(14px, min(1.6vw, 2.35vh), 20px)",
                paddingLeft: "var(--section-px-wide)",
                paddingRight: "var(--section-px-wide)",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={show ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: "easeOut", delay: 1.2 }}
            >
              We partner with entrepreneurs from day one. We invest conviction, not just capital, and stay by their side through every stage of their journey.
            </motion.p> */}
          </div>
        </div>

        <div className="w-full shrink-0">
          <CardMarquee />
          <MobileFadingGrid />
        </div>

      </div>
    </section>
  );
}