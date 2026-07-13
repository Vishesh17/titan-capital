"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import TypewriterText from "@/components/ui/TypewriterText";

/* Site-wide easing — snappy start, smooth deceleration. */
const EASE = [0.22, 1, 0.36, 1] as const;

/*
  Sizing tokens derived from the 1728×1117 MacBook 14" Figma
  reference via `min(Xvw, Yvh)` — proportional at every laptop
  viewport, then clamped for mobile via extra max-md classes.

  Design frame:
    section: 1512 × 792.5 @ 1728×1117 ref
    heading  (Indicorns):                    Poppins 78/172%/400  #FBF7F0
    subhead  (Celebrating India's ...):      Poppins 36/172%/300  #FBF7F0
    bullets  (Profitable • 10 Cr+ • …):      Poppins 24/155%/500  #FFF
    button   (Meet the Indicorns):           287×59, white pill, 10 px pad
    quote / attribution keep sensible defaults (not spec-locked).
*/

/* ─────────────────────────────────────────────────────────
   Types shared with the server wrapper (IndicornSpotlight.tsx)
   ───────────────────────────────────────────────────────── */
export type IndicornLogoMode = "transparent" | "opaqueBg" | "white";

export interface IndicornLogo {
  src?: string;
  /** Legacy alias from the original hardcoded shape. Either `src` or `image` works. */
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
   Fallback defaults — page keeps rendering exactly per the
   new spec if Sanity returns null / missing fields.
   ───────────────────────────────────────────────────────── */
const FALLBACK_LOGOS: IndicornLogo[] = [
  { src: "/images/logos/ofbusiness_white.svg",          alt: "OfBusiness",  mode: "white",       scale: 1.0 },
  { src: "/images/logos/Razorpay.webp",                 alt: "Razorpay",    mode: "opaqueBg",    scale: 1.9 },
  { src: "/images/portfolio_grid/unicommerce-logo.png", alt: "Unicommerce", mode: "transparent", scale: 1.8 },
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

/* Append Sanity CDN transform params for served images. Local /images/...
   URLs pass through unchanged so the fallback path keeps working. */
function cdnImageSrc(url: string, width: number): string {
  if (url.startsWith("https://cdn.sanity.io/")) {
    return `${url}?w=${width}&auto=format&q=85`;
  }
  return url;
}

/** Logos from Sanity arrive as { image, ... }; fallback uses { src, ... }.
 *  Normalise both shapes here so the render loop is one path. */
function resolveLogoSrc(logo: IndicornLogo): string {
  return logo.src ?? logo.image ?? "";
}

/* ─────────────────────────────────────────────────────────
   GlowBlob — a soft aurora glow made from a CSS radial-gradient
   that fades to fully transparent at its rim, plus a blur for
   extra softness. Because the edge is transparent (not a solid
   ellipse clipped by an SVG filter region), there is NO hard
   line — it blends seamlessly into the navy background and into
   the other blob.

   It drifts around on an infinite loop (x / y / scale), giving
   the "smooth gradient moving here and there" feel. Colours are
   the Figma aurora stops (#033699 / #5054B5 / #AC71C6) over the
   #001A4D base. Everything is min(vw,vh) / % so it's responsive.
   ───────────────────────────────────────────────────────── */
function GlowBlob({ variant }: { variant: "left" | "right" }) {
  const left = variant === "left";
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute rounded-full"
      style={{
        width: "min(62vw, 95vh)",
        height: "min(62vw, 95vh)",
        left: left ? "-14%" : "auto",
        right: left ? "auto" : "-14%",
        top: left ? "2%" : "auto",
        bottom: left ? "auto" : "-8%",
        /* IDENTICAL gradient for both blobs — a soft blue-indigo
           aurora that fades to transparent, sitting nicely on the
           #001A4D navy. (The right one used to be purplish.) */
        background:
          "radial-gradient(circle at center, rgba(44,86,196,0.52) 0%, rgba(80,84,181,0.30) 42%, rgba(0,26,77,0) 70%)",
        filter: "blur(70px)",
        willChange: "transform, opacity",
      }}
      animate={{
        /* Organic float — larger, more evident travel on a quicker
           loop, with a scale + opacity "breathe" so the light clearly
           moves around. The two blobs use opposite directions and
           different periods so they never sync up. */
        x: left
          ? ["-14%", "20%", "-8%", "12%", "-14%"]
          : ["14%", "-20%", "8%", "-12%", "14%"],
        y: left
          ? ["-16%", "10%", "20%", "-8%", "-16%"]
          : ["16%", "-10%", "-20%", "8%", "16%"],
        scale: [1, 1.18, 0.92, 1.1, 1],
        opacity: [0.7, 1, 0.8, 0.95, 0.7],
      }}
      transition={{
        duration: left ? 18 : 22,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
      }}
    />
  );
}

/* ─── Cursor-origin fill button (white pill → navy fill, text turns white) ─── */
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
      className="relative mt-[min(2.31vw,3.58vh)] flex items-center justify-center overflow-hidden font-['Poppins',_sans-serif] font-medium transition-colors duration-300 max-md:!w-[220px] max-md:!h-[48px] max-md:!text-[14px] max-md:!mt-[24px]"
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
  /* Per-field fallback — partially-edited CMS doc still renders cleanly. */
  const rawHeading = data?.heading || FALLBACK_HEADING;
  /* Legacy CMS docs stored the whole "Indicorns: Celebrating India's
     Enduring Startups" string in the heading field. After the schema
     was split into heading + subheading, drop anything after the
     first colon so the "Celebrating…" tail doesn't appear twice. */
  const heading = rawHeading.includes(":")
    ? rawHeading.split(":")[0].trim()
    : rawHeading;
  const subheading = data?.subheading || FALLBACK_SUBHEADING;
  const bullets =
    data?.bullets && data.bullets.length > 0 ? data.bullets : FALLBACK_BULLETS;
  const ctaLabel = data?.ctaLabel || FALLBACK_CTA_LABEL;
  const rotatingLogosLabel = data?.rotatingLogosLabel || FALLBACK_ROTATING_LABEL;
  const indicornLogos =
    data?.rotatingLogos && data.rotatingLogos.length > 0
      ? data.rotatingLogos
      : FALLBACK_LOGOS;
  const quote = data?.quote || FALLBACK_QUOTE;
  const attribution = data?.attribution || FALLBACK_ATTRIBUTION;

  const [logoIndex, setLogoIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setLogoIndex((prev) => (prev + 1) % indicornLogos.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [indicornLogos.length]);

  /* Both rules (vertical + horizontal) draw in when the section
     scrolls into view — matching the site-wide "lines animate on
     entrance" convention. */
  const sectionRef = useRef<HTMLElement>(null);
  const rulesInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section
      ref={sectionRef}
      className="relative flex w-full items-center overflow-hidden max-md:!py-[56px] max-md:!static"
      style={{
        /* Sticky reveal — Indicorns PINS to the top of the viewport
           while "What Our Founders Say" (next in the shared wrapper)
           scrolls up and covers it, mirroring Impact ↔ Their Stories.
           Low z-index so the next section (higher z) draws over it. */
        position: "sticky",
        top: 0,
        zIndex: 1,
        /* Solid navy per the Figma export (index.module.css):
           background-color: #001a4d. The depth/aurora comes purely
           from the GlowBackdrop SVG overlays, not a section gradient. */
        background: "#001A4D",
        /* Reduced height — the section now pins (sticky) and the next
           section scrolls over it, so it no longer needs the tall
           overlap padding it had when it was a normal-flow section.
           Shorter section + shorter divider = far less blank navy below
           the content. Top padding still clears the Stories card that
           overlaps its top by 115 px. */
        minHeight: "min(50.30vw, 75.62vh)" /* ~800 px @ ref */,
        paddingTop: "min(12.10vw, 18.53vh)" /* ~140 px @ ref */,
        paddingBottom: "min(12.63vw, 16.16vh)" /* ~80 px @ ref */,
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      {/* ══════════ GLOW LAYER ══════════
          Two soft radial-gradient blobs drift around behind the
          content. Their rims are transparent, so they blend into the
          navy and into each other with no hard edge — and the section's
          own overflow-hidden only ever clips already-faded pixels. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <GlowBlob variant="left" />
        <GlowBlob variant="right" />
      </div>

      {/* Grid: LEFT column | 1 px vertical divider | RIGHT column.
          On mobile, drops to a single column and hides the vertical rule. */}
      <div
        className="relative z-10 mx-auto grid w-full items-stretch max-md:!grid-cols-1 max-md:!gap-[40px]"
        style={{
          /* Fixed 1440 px cap — IDENTICAL to ImpactAtGlance's
             max-w-[1440px]. The old min(vw,vh) form shrank the content
             on short viewports (the vh term), making Indicorns' gutters
             bigger than every other section. A hard cap + the shared
             --section-px-wide padding makes the gutters match exactly. */
          maxWidth: "1440px",
          gridTemplateColumns: "1fr 1px 1fr",
          columnGap: "min(3.47vw, 5.37vh)" /* ~60 px @ ref */,
        }}
      >
        {/* ══════════ LEFT COLUMN ══════════ */}
        <div className="relative">
        <div className="relative z-10 flex h-full w-full flex-col items-start text-left max-md:!items-center max-md:!text-center">
          {/* Heading — Poppins 78 / 400 / 172% / #FBF7F0 */}
          <h2
            className="m-0 font-['Poppins',_sans-serif] font-normal max-md:!text-[36px] max-md:!leading-[1.15]"
            style={{
              color: "#FBF7F0",
              fontSize: "min(4.51vw, 6.98vh)" /* 78 px @ ref */,
              lineHeight: "172%",
            }}
          >
            <TypewriterText text={heading} />
          </h2>

          {/* Subheading — 1:1 with the CSS spec:
               color:       #FBF7F0
               font-family: Poppins
               font-size:   36 px @ ref (proportional via min)
               font-style:  normal
               font-weight: 300
               line-height: 172% */}
          <p
            className="m-0 max-md:!text-[16px] max-md:!leading-[1.4]"
            style={{
              color: "#FBF7F0",
              fontFamily: "'Poppins', sans-serif",
              fontSize: "min(2.08vw, 3.22vh)" /* 36 px @ 1728×1117 ref */,
              fontStyle: "normal",
              fontWeight: 300,
              lineHeight: "172%",
              marginTop: "min(0.29vw, 0.45vh)",
            }}
          >
            {subheading}
          </p>

          {/* ── HORIZONTAL DIVIDER — spans the left column, draws
                left→right when the section enters view. ── */}
          <motion.div
            className="w-full origin-left max-md:!hidden"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: rulesInView ? 1 : 0 }}
            transition={{ duration: 1.8, ease: EASE, delay: 0.2 }}
            style={{
              height: 1,
              background: "rgba(255,255,255,0.35)",
              marginTop: "min(2.31vw, 3.58vh)" /* ~40 px */,
              marginBottom: "min(2.31vw, 3.58vh)",
            }}
          />

          {/* Bullets — Poppins 24 / 500 / 155% / #FFF, • separator */}
          <div
            className="flex flex-wrap items-center font-['Poppins',_sans-serif] font-medium max-md:!text-[13px] max-md:!gap-[6px] max-md:!mt-[16px]"
            style={{
              color: "#FFF",
              fontSize: "min(1.39vw, 2.15vh)" /* 24 px @ ref */,
              lineHeight: "155%",
              gap: "min(1.16vw, 1.79vh)" /* ~20 px */,
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

          {/* CTA button — 287×59, white pill, cursor-origin fill. */}
          <CursorFillButtonIndicorn href="/indicorns" label={ctaLabel} />

          {/* Portfolio Indicorns row — label + rotating logo. */}
          <div
            className="flex items-center max-md:!gap-[12px]"
            style={{
              gap: "min(0.87vw, 1.34vh)" /* ~15 px */,
              marginTop: "min(1.16vw, 1.79vh)" /* ~20 px */,
            }}
          >
            <span
              className="font-['Poppins',_sans-serif] font-normal max-md:!text-[11px]"
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "min(0.81vw, 1.25vh)" /* ~14 px */,
              }}
            >
              {rotatingLogosLabel}
            </span>
            <div
              className="relative overflow-hidden max-md:!w-[100px] max-md:!h-[28px]"
              style={{
                width: "min(6.94vw, 10.74vh)" /* ~120 px @ ref */,
                height: "min(2.08vw, 3.22vh)" /* ~36 px @ ref */,
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

        {/* ══════════ VERTICAL DIVIDER (grid middle column) ══════════
            Fixed 786.5 px tall @ 1728×1117 ref (per spec), centered in
            the row. Draws top→bottom when the section enters view. */}
        <motion.div
          className="max-md:!hidden"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: rulesInView ? 1 : 0 }}
          transition={{ duration: 2.4, ease: EASE, delay: 0.2 }}
          style={{
            width: 1,
            background: "rgba(255,255,255,0.35)",
            justifySelf: "center",
            alignSelf: "center",
            transformOrigin: "top",
            height: "min(31.83vw, 49.24vh)" /* ~550 px @ ref — shorter */,
          }}
        />

        {/* ══════════ RIGHT COLUMN — quote + attribution ══════════ */}
        <div className="relative">
          <div className="relative z-10 flex h-full flex-col justify-start max-md:!text-center">
            <p
              className="m-0 font-['Poppins',_sans-serif] max-md:!text-[15px] max-md:!leading-[1.5]"
              style={{
                color: "#FFF",
                fontSize: "min(1.62vw, 2.51vh)" /* ~28 px */,
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
                fontSize: "min(1.39vw, 2.15vh)" /* ~24 px */,
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
