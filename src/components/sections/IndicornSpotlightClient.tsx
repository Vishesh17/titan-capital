"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  motion, 
  useInView,
  useMotionValue,
  useSpring,
  useTransform
} from "framer-motion";

/* Site-wide easing — snappy start, smooth deceleration. */
const EASE = [0.22, 1, 0.36, 1] as const;

/* ─────────────────────────────────────────────────────────
   Hero Glows (Exact match from Hero + Section-Relative Tracking)
   ───────────────────────────────────────────────────────── */
function HeroGlow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const normX = useMotionValue(0);
  const normY = useMotionValue(0);

  const cursorSpring = { damping: 25, stiffness: 60, mass: 0.4 };
  const smoothX = useSpring(mouseX, cursorSpring);
  const smoothY = useSpring(mouseY, cursorSpring);

  const ambientSpring = { damping: 30, stiffness: 70, mass: 1 };
  const smoothNormX = useSpring(normX, ambientSpring);
  const smoothNormY = useSpring(normY, ambientSpring);

  useEffect(() => {
    if (typeof window !== "undefined" && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(rect.width / 2);
      mouseY.set(rect.height / 2);
    }

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate mouse position strictly inside this specific section
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      }
      normX.set((e.clientX / window.innerWidth) * 2 - 1);
      normY.set((e.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, normX, normY]);

  // Expanded the mouse parallax range slightly for more responsiveness
  const leftX = useTransform(smoothNormX, [-1, 1], ["-8%", "8%"]);
  const leftY = useTransform(smoothNormY, [-1, 1], ["-8%", "8%"]);
  const rightX = useTransform(smoothNormX, [-1, 1], ["8%", "-8%"]);
  const rightY = useTransform(smoothNormY, [-1, 1], ["8%", "-8%"]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-0">
      {/* 1. LEFT BLOB */}
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
          willChange: "transform" 
        }}
      >
        <motion.div
          className="w-full h-full rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, #5054B5 0%, #054EB6 40%, #022250 80%, transparent 100%)", opacity: 0.6 }}
          animate={{ 
            x: ["0%", "35%", "-15%", "25%", "0%"], 
            y: ["0%", "25%", "-10%", "35%", "0%"], 
            scale: [1, 1.15, 0.85, 1.1, 1] 
          }}
          transition={{ duration: 18, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
        />
      </motion.div>

      {/* 2. RIGHT BLOB */}
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
          willChange: "transform" 
        }}
      >
        <motion.div
          className="w-full h-full rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, #AC71C6 0%, #033699 50%, #001A4D 80%, transparent 100%)", opacity: 0.5 }}
          animate={{ 
            x: ["0%", "-35%", "15%", "-25%", "0%"], 
            y: ["0%", "-25%", "10%", "-35%", "0%"], 
            scale: [1, 1.15, 0.85, 1.1, 1] 
          }}
          transition={{ duration: 21, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
        />
      </motion.div>

      {/* 3. 3D CURSOR BLOB (Smaller + Matches Left Blob Colors) */}
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
          background: "radial-gradient(circle, rgba(80,84,181,0.85) 0%, rgba(5,78,182,0.5) 40%, rgba(2,34,80,0.2) 70%, transparent 100%)",
          willChange: "transform", 
          z: 0 
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Types shared with the server wrapper
   ───────────────────────────────────────────────────────── */
export type IndicornLogoMode = "transparent" | "opaqueBg" | "white";

export interface IndicornLogo {
  src?: string;
  image?: string;
  alt: string;
  mode: IndicornLogoMode;
  scale: number;
}

export interface IndicornSpotlightData {
  heading?: string;
  subheading?: string;
  bullets?: string[];
  ctaLabel?: string;
  rotatingLogosLabel?: string;
  rotatingLogos?: IndicornLogo[];
  quote?: string;
  attribution?: string;
}

/* ─────────────────────────────────────────────────────────
   Fallback defaults
   ───────────────────────────────────────────────────────── */
const FALLBACK_LOGOS: IndicornLogo[] = [
  { src: "/images/logos/ofbusiness_white.svg",          alt: "OfBusiness",  mode: "white",       scale: 1.0 },
  { src: "/images/logos/Razorpay.webp",                 alt: "Razorpay",    mode: "opaqueBg",    scale: 1.9 },
  { src: "/images/portfolio_grid/unicommerce-logo.png", alt: "Unicommerce", mode: "transparent", scale: 1.0 },
  { src: "/images/logos/Credgenics.svg",                alt: "Credgenics",  mode: "transparent", scale: 1.0 },
];

const FALLBACK_HEADING = "Indicorns";
const FALLBACK_SUBHEADING = "Celebrating India's Most Resilient Startups";
const FALLBACK_BULLETS = ["Profitable", "10 Cr+ Revenue", "Founded<15years"];
const FALLBACK_CTA_LABEL = "Meet the Indicorns";
const FALLBACK_ROTATING_LABEL = "Portfolio Indicorns";
const FALLBACK_QUOTE =
  '"For too long, success in the startup ecosystem has been measured solely by valuation. With Indicorns, we recognize a different standard of excellence, one built on profitability, disciplined growth, and tangible market impact."';
const FALLBACK_ATTRIBUTION = "-Titan Capital";

function cdnImageSrc(url: string, width: number): string {
  if (url.startsWith("https://cdn.sanity.io/")) {
    return `${url}?w=${width}&auto=format&q=85`;
  }
  return url;
}

function resolveLogoSrc(logo: IndicornLogo): string {
  return logo.src ?? logo.image ?? "";
}

/* ─── Cursor-origin fill button ─── */
function CursorFillButtonIndicorn({ href, label }: { href: string; label: string }) {
  const [origin, setOrigin] = useState("50% 50%");
  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - rect.left) / rect.width) * 100}% ${((e.clientY - rect.top) / rect.height) * 100}%`);
    setHovered(true);
  };
  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - rect.left) / rect.width) * 100}% ${((e.clientY - rect.top) / rect.height) * 100}%`);
    setHovered(false);
  };

  return (
    <Link
      href={href}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative mt-[min(2.31vw,3.58vh)] flex items-center justify-center overflow-hidden font-['Poppins',_sans-serif] font-medium transition-colors duration-300 max-md:!w-[240px] max-md:!h-[50px] max-md:!text-[15px] max-md:!mt-[24px] max-md:!rounded-[25px] max-md:!border max-md:!border-white/30"
      style={{
        width: "min(16.61vw, 25.69vh)",
        height: "min(3.41vw, 5.28vh)",
        borderRadius: "min(1.70vw, 2.64vh)",
        background: hovered ? "#001A4D" : "#FFF",
        color: hovered ? "#FFF" : "#001A4D",
        fontSize: "min(1.16vw, 1.79vh)",
      }}
    >
      <span
        className="absolute inset-0 transition-transform duration-400 ease-out"
        style={{
          background: `radial-gradient(circle at ${origin}, rgba(44,86,196,0.7) 0%, #001A4D 70%)`,
          transformOrigin: origin,
          transform: hovered ? "scale(1)" : "scale(0)",
          borderRadius: "inherit",
        }}
      />
      <span className="relative z-10">{label}</span>
    </Link>
  );
}

export default function IndicornSpotlightClient({
  data,
}: {
  data?: IndicornSpotlightData | null;
}) {
  const rawHeading = data?.heading || FALLBACK_HEADING;
  const heading = rawHeading.includes(":")
    ? rawHeading.split(":")[0].trim()
    : rawHeading;
  const subheading = data?.subheading || FALLBACK_SUBHEADING;
  const bullets = data?.bullets && data.bullets.length > 0 ? data.bullets : FALLBACK_BULLETS;
  const ctaLabel = data?.ctaLabel || FALLBACK_CTA_LABEL;
  const rotatingLogosLabel = data?.rotatingLogosLabel || FALLBACK_ROTATING_LABEL;
  const indicornLogos = data?.rotatingLogos && data.rotatingLogos.length > 0 ? data.rotatingLogos : FALLBACK_LOGOS;
  const quote = data?.quote || FALLBACK_QUOTE;
  const attribution = data?.attribution || FALLBACK_ATTRIBUTION;

  const [logoIndex, setLogoIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setLogoIndex((prev) => (prev + 1) % indicornLogos.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [indicornLogos.length]);

  const sectionRef = useRef<HTMLElement>(null);
  const rulesInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section
      ref={sectionRef}
      className="relative flex w-full items-center overflow-hidden max-md:!min-h-[100vh] max-md:!py-[80px] max-md:!pt-[120px]"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1,
        background: "#000c22",
        minHeight: "100vh",
        paddingTop: "min(12.10vw, 18.53vh)",
        paddingBottom: "min(12.63vw, 16.16vh)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      {/* ══════════ GLOW LAYER ══════════ */}
      <HeroGlow />

      <div
        className="relative z-10 mx-auto grid w-full items-start max-md:!grid-cols-1 max-md:!gap-[40px]"
        style={{
          maxWidth: "1440px",
          gridTemplateColumns: "1fr 1px 1fr",
          columnGap: "min(3.47vw, 5.37vh)",
        }}
      >
        {/* ══════════ LEFT COLUMN ══════════ */}
        <div className="relative">
          <div className="relative z-10 flex w-full flex-col items-start text-left max-md:!items-center max-md:!text-center">
            <h2
              className="m-0 font-['Poppins',_sans-serif] font-semibold max-md:!text-[32px] max-md:!leading-[120%]"
              style={{
                color: "#FBF7F0",
                fontSize: "min(4.51vw, 6.98vh)",
                lineHeight: "110%", 
              }}
            >
              {heading}
            </h2>

            <p
              className="m-0 max-md:!text-[16px] max-md:!leading-[1.4]"
              style={{
                color: "#FBF7F0",
                fontFamily: "'Poppins', sans-serif",
                fontSize: "min(2.08vw, 3.22vh)",
                fontStyle: "normal",
                fontWeight: 300,
                lineHeight: "172%",
                marginTop: "min(0.29vw, 0.45vh)",
              }}
            >
              {subheading}
            </p>

            <motion.div
              className="w-full origin-left max-md:!hidden"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: rulesInView ? 1 : 0 }}
              transition={{ duration: 1.8, ease: EASE, delay: 0.2 }}
              style={{
                height: 1,
                background: "rgba(255,255,255,0.35)",
                marginTop: "min(2.31vw, 3.58vh)",
                marginBottom: "min(2.31vw, 3.58vh)",
              }}
            />

            {/* Bullets */}
            <div
              className="flex flex-wrap items-center font-['Poppins',_sans-serif] font-medium max-md:!text-[13px] max-md:!gap-[6px] max-md:!mt-[16px]"
              style={{
                color: "#FFF",
                fontSize: "min(1.39vw, 2.15vh)",
                lineHeight: "155%",
                gap: "min(1.16vw, 1.79vh)",
              }}
            >
              {bullets.map((b, i) => (
                <span key={`bullet-${i}`} className="inline-flex items-center" style={{ gap: "min(1.16vw, 1.79vh)" }}>
                  <span>{b}</span>
                  {i < bullets.length - 1 && (
                    <span
                      className="inline-flex select-none items-center justify-center"
                      style={{ opacity: 0.9 }}
                    >
                      &bull;
                    </span>
                  )}
                </span>
              ))}
            </div>

            <motion.div
              className="hidden max-md:!block w-full origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: rulesInView ? 1 : 0 }}
              transition={{ duration: 1.8, ease: EASE, delay: 0.3 }}
              style={{
                height: 1,
                background: "rgba(255,255,255,0.35)",
                marginTop: 24,
                marginBottom: 8,
              }}
            />

            <CursorFillButtonIndicorn href="/indicorns" label={ctaLabel} />

            <div
              className="flex items-center max-md:!gap-[12px] max-md:!justify-center max-md:!mt-[24px]"
              style={{
                gap: "min(2.87vw, 3.34vh)",
                marginTop: "min(2.31vw, 3.58vh)", 
              }}
            >
              <span
                className="font-['Poppins',_sans-serif] font-normal max-md:!text-[11px]"
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "min(1.39vw, 2.15vh)",
                }}
              >
                {rotatingLogosLabel}
              </span>
              <div
                className="relative overflow-hidden max-md:!w-[100px] max-md:!h-[28px]"
                style={{
                  width: "min(6.94vw, 10.74vh)",
                  height: "min(2.08vw, 3.22vh)",
                }}
              >
                {indicornLogos.map((logo, i) => {
                  const filterStyle =
                    logo.mode === "white"       ? "none" :
                    logo.mode === "transparent" ? "brightness(0) invert(1)" :
                    /* opaqueBg */                "invert(1) grayscale(1) brightness(10)";
                  const blendMode = logo.mode === "opaqueBg" ? ("screen" as const) : ("normal" as const);
                  const resolved = resolveLogoSrc(logo);
                  if (!resolved) return null;

                  return (
                    <div
                      key={`${logo.alt}-${i}`}
                      className="absolute inset-0 transition-all duration-500 ease-in-out"
                      style={{
                        opacity: i === logoIndex ? 1 : 0,
                        transform: i === logoIndex ? "translateY(0)" : "translateY(8px)",
                        mixBlendMode: blendMode,
                      }}
                    >
                      <Image
                        src={cdnImageSrc(resolved, 240)}
                        alt={logo.alt}
                        fill
                        sizes="120px"
                        style={{
                          objectFit: "contain",
                          objectPosition: "left",
                          filter: filterStyle,
                          transform: `scale(${logo.scale})`,
                          transformOrigin: "left center",
                        }}
                      />
                    </div>
                  );
                })}
            </div>
            </div>
          </div>
        </div>

        {/* ══════════ VERTICAL DIVIDER ══════════ */}
        <motion.div
          className="max-md:!hidden"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: rulesInView ? 1 : 0 }}
          transition={{ duration: 2.4, ease: EASE, delay: 0.2 }}
          style={{
            width: 1,
            background: "rgba(255,255,255,0.35)",
            justifySelf: "center",
            transformOrigin: "top",
            height: "min(31.83vw, 49.24vh)",
          }}
        />

        {/* ══════════ RIGHT COLUMN ══════════ */}
        <div className="relative">
          <motion.div
            className="hidden max-md:!block w-full origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: rulesInView ? 1 : 0 }}
            transition={{ duration: 1.8, ease: EASE, delay: 0.4 }}
            style={{
              height: 1,
              background: "rgba(255,255,255,0.35)",
              marginBottom: 32,
            }}
          />
          <div 
            className="relative z-10 flex flex-col justify-start max-md:!text-center"
            style={{ paddingTop: "min(0.25vw, 0.4vh)" }} 
          >
            <p
              className="m-0 font-['Poppins',_sans-serif] max-md:!text-[15px] max-md:!leading-[1.5]"
              style={{
                color: "#FFF",
                fontSize: "min(1.62vw, 2.51vh)",
                fontWeight: 300,
                lineHeight: "150%",
              }}
            >
              {quote}
            </p>
            <p
              className="m-0 mt-[min(1.62vw,2.51vh)] font-['Poppins',_sans-serif] max-md:!text-[14px] max-md:!mt-[16px]"
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: "min(1.39vw, 2.15vh)",
                fontWeight: 400,
              }}
            >
              {attribution}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}