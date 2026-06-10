"use client";

import Image from "next/image";
import { useEffect, useRef, useCallback, useState } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";

/*
  "Backed Early. Built to last"
  Desktop: Continuous smooth marquee with ultra-minimal background fade overlays.
  Mobile: 2x2 grid with independent, sequential 3D card-flip rotations.
*/

const MARQUEE_CSS = `
@keyframes continuous-marquee {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
`;

/* ═══════════════════════════════════════════════════════
   AnimatedGrid — canvas grid with cursor-follow wave distortion
   ═══════════════════════════════════════════════════════ */
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

    const isMobile = canvas.getBoundingClientRect().width < 768;
    const GRID_SIZE = isMobile ? 60 : 90;
    const BASE_ALPHA = isMobile ? 0.03 : 0.06;
    const CURSOR_RADIUS = 180;
    const WAVE_AMP = isMobile ? 4 : 6;
    const WAVE_BOOST = isMobile ? 0.05 : 0.10;

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
          if (!started) { ctx.moveTo(dx, y); started = true; }
          else { ctx.lineTo(dx, y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(dx, y); }
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
          if (!started) { ctx.moveTo(x, dy); started = true; }
          else { ctx.lineTo(x, dy); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, dy); }
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

/* ═══════════════════════════════════════════════════════
   Company data — all 12 portfolio companies
   ═══════════════════════════════════════════════════════ */
const LOGO_W = 150;
const LOGO_H = 40;

const companies = [
  { name: "Shadowfax",     bgImage: "/images/portfolio/shadowfax_bg.webp",     logo: "/images/logos/Shadowfax.svg",                logoScale: 1.2 },
  { name: "Credgenics",    bgImage: "/images/portfolio/credgenics_bg.webp",    logo: "/images/logos/Credgenics.svg",               logoScale: 0.9 },
  { name: "OLA",           bgImage: "/images/portfolio/ola_bg.webp",           logo: "/images/logos/ola.svg",                      logoScale: 0.7 },
  { name: "Zouk",          bgImage: "/images/portfolio/zouk_bg.webp",          logo: "/images/logos/zouk_new_logo.webp",           logoScale: 0.8 },
  { name: "Cart.com",      bgImage: "/images/portfolio/Cart.com_bg.webp",      logo: "/images/logos/cartdotcom.svg",               logoScale: 1.0, noInvert: true },
  { name: "Unicommerce",   bgImage: "/images/portfolio/Unicommerce_bg.webp",   logo: "/images/logos/unicommerce-logo.svg",         logoScale: 1.0 },
  { name: "Khatabook",     bgImage: "/images/portfolio/khatabook_bg.webp",     logo: "/images/logos/khatabook.png",                logoScale: 1.2, logoClass: "translate-y-[5px]" }, 
  { name: "Mamaearth",     bgImage: "/images/portfolio/mamaearth_bg.webp",     logo: "/images/logos/mamaearthpng-logo.webp",       logoScale: 1.0 },
  { name: "Ofbusiness",    bgImage: "/images/portfolio/ofbusiness_bg.webp",    logo: "/images/logos/ofbusiness_white.svg",         logoScale: 1.0 },
  { name: "Razorpay",      bgImage: "/images/portfolio/razorpay_bg.webp",      logo: "/images/logos/Razorpay-logo.webp",           logoScale: 1.0 },
  { name: "Snapdeal",      bgImage: "/images/portfolio/snapdeal_bg.webp",      logo: "/images/logos/snapdeal-company-1-logo.webp", logoScale: 1.0 },
  { name: "Urban Company", bgImage: "/images/portfolio/urbanccompany_bg.webp", logo: "/images/logos/uc_white.png",                 logoScale: 1.0 },
];

/* ═══════════════════════════════════════════════════════
   CompanyCard
   ═══════════════════════════════════════════════════════ */
function CompanyCard({ company, mode = "marquee" }: { company: (typeof companies)[number], mode?: "marquee" | "grid" }) {
  const scale = company.logoScale ?? 1;
  const w = LOGO_W * scale;
  const h = LOGO_H * scale;

  const modeStyles = mode === "marquee" ? {
    width: "clamp(180px, 22vw, 320px)",
    height: "clamp(180px, 22vw, 320px)",
    borderRadius: "clamp(8px, 0.83vw, 12px)",
    boxShadow: "0 0 14px 8px rgba(166, 166, 166, 0.25)",
  } : {
    width: "100%",
    aspectRatio: "1/1",
    borderRadius: "8px",
    boxShadow: "0 4px 10px 4px rgba(166, 166, 166, 0.15)",
  };

  return (
    <div
      // FIXED: Added group/card to isolate hover scopes and hover:scale-105 to zoom ONLY this specific box
      className="group/card relative shrink-0 cursor-pointer overflow-hidden transition-all duration-300 ease-out hover:scale-105 hover:shadow-[0_0_20px_10px_rgba(166,166,166,0.3)]"
      style={modeStyles}
    >
      {/* Background image */}
      <Image
        src={company.bgImage}
        alt={company.name}
        fill
        sizes={mode === "marquee" ? "(max-width: 768px) 45vw, 22vw" : "50vw"}
        // FIXED: Changed from generic row group-hover to card-specific group-hover/card
        className="object-cover transition-transform duration-500 ease-out group-hover/card:scale-105"
      />

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1]"
        style={{
          height: "45%",
          background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)",
        }}
      />

      {/* Logo container */}
      {/* FIXED: Swapped to group-hover/card:translate-y-[-4px] to ensure only the active card's logo slides up */}
      <div
        className="absolute bottom-0 left-0 z-[2] flex items-end transition-transform duration-300 ease-out group-hover/card:translate-y-[-4px]"
        style={{ padding: mode === "marquee" ? "clamp(14px, min(1.8vw, 2.6vh), 24px)" : "12px" }}
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

  return (
    // Outer container row retains 'group' which correctly flags the track animation to stop moving entirely
    <div className="group relative w-full overflow-hidden hidden md:block">
      <div className="absolute left-0 top-0 z-10 h-full w-[4%] bg-gradient-to-r from-[#FBF7F0]/60 via-[#FBF7F0]/20 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 z-10 h-full w-[4%] bg-gradient-to-l from-[#FBF7F0]/60 via-[#FBF7F0]/20 to-transparent pointer-events-none" />

      <div
        className="flex w-max items-center gap-[clamp(12px,1.5vw,20px)] animate-[continuous-marquee_30s_linear_infinite] group-hover:[animation-play-state:paused]"
        style={{ paddingRight: "clamp(12px,1.5vw,20px)" }}
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
      className="w-full px-[var(--section-px-wide)] md:hidden"
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

/* ═══════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════ */
export default function BackedEarly() {
  return (
    <section
      className="relative flex w-full items-center justify-center overflow-hidden bg-[#FBF7F0] min-h-[calc(100svh-var(--nav-height)-110px)] lg:min-h-[calc(100svh-var(--nav-height))]"
      style={{
        marginTop: "var(--nav-height)",
        paddingTop: "clamp(28px, min(6.94vw, 10.18vh), 100px)",
        paddingBottom: "clamp(20px, min(6.94vw, 10.18vh), 100px)",
      }}
    >
      <style>{MARQUEE_CSS}</style>
      <AnimatedGrid />

      <div className="relative z-10 flex w-full flex-col items-center">

        {/* ── HEADING ── */}
        <motion.div
          className="mb-[clamp(28px,min(4vw,6vh),56px)] flex flex-col items-center"
          style={{ paddingLeft: "var(--section-px-wide)", paddingRight: "var(--section-px-wide)" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.h2
            className="m-0 font-['Libre_Baskerville',_serif] text-[length:var(--heading-xl)] max-md:!text-[28px] font-semibold not-italic leading-[115%] text-[#001A4D]"
            variants={headingVariants}
          >
            Backed Early.
          </motion.h2>

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
              Built to last
            </span>
          </motion.div>
        </motion.div>

        {/* ── CONTINUOUS MARQUEE (DESKTOP) ── */}
        <CardMarquee />

        {/* ── 2x2 FADING CROSSFADE GRID (MOBILE) ── */}
        <MobileFadingGrid />

      </div>
    </section>
  );
}