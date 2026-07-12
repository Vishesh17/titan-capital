"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

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
   GlowBackdrop — the Figma "aurora" gradient (blurred ellipse
   with grain noise) rendered inline as an SVG so we get the
   exact filter chain from design. One instance per column;
   `mirror` flips it horizontally so the right column's glow
   points inward toward the divider. Filter + gradient IDs are
   suffixed by `instanceId` because SVG filter IDs are global —
   two copies with the same ID would collide silently.
   ───────────────────────────────────────────────────────── */
function GlowBackdrop({
  instanceId,
  mirror = false,
}: {
  instanceId: string;
  mirror?: boolean;
}) {
  const fId = `glowfilter-${instanceId}`;
  const gId = `glowgrad-${instanceId}`;
  /* feFuncA discrete table from the Figma export — 50 ones then 50
     zeros creates the coarse grain pattern. Extracted to a constant
     so the JSX below is readable. */
  const grainTable =
    "1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 864 793"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{
        transform: mirror ? "scaleX(-1)" : undefined,
        zIndex: 0,
      }}
    >
      <g filter={`url(#${fId})`}>
        <ellipse
          cx="316.37"
          cy="325.422"
          rx="316.37"
          ry="325.422"
          transform="matrix(-0.412381 0.911012 -0.918704 -0.394948 700.055 359.009)"
          fill={`url(#${gId})`}
        />
      </g>
      <defs>
        <filter
          id={fId}
          x="-255.652"
          y="3.04749"
          width="1052.55"
          height="1031.31"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur stdDeviation="100" result="effect1_foregroundBlur" />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="2 2"
            stitchTiles="stitch"
            numOctaves={3}
            result="noise"
            seed={5393}
          />
          <feColorMatrix in="noise" type="luminanceToAlpha" result="alphaNoise" />
          <feComponentTransfer in="alphaNoise" result="coloredNoise1">
            <feFuncA type="discrete" tableValues={grainTable} />
          </feComponentTransfer>
          <feComposite
            operator="in"
            in2="effect1_foregroundBlur"
            in="coloredNoise1"
            result="noise1Clipped"
          />
          <feFlood floodColor="rgba(0, 0, 0, 0.25)" result="color1Flood" />
          <feComposite
            operator="in"
            in2="noise1Clipped"
            in="color1Flood"
            result="color1"
          />
          <feMerge result="effect2_noise">
            <feMergeNode in="effect1_foregroundBlur" />
            <feMergeNode in="color1" />
          </feMerge>
        </filter>
        <linearGradient
          id={gId}
          x1="316.37"
          y1="0"
          x2="807.864"
          y2="290.061"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.0199933" stopColor="#022250" />
          <stop offset="0.482966" stopColor="#054EB6" />
          <stop offset="0.653846" stopColor="#5054B5" />
        </linearGradient>
      </defs>
    </svg>
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

  return (
    <section
      className="relative w-full overflow-hidden max-md:!py-[56px]"
      style={{
        /* Solid navy per spec, with a subtle top-left radial glow
           preserved from the old build for depth (matches design ref). */
        background:
          "radial-gradient(197.93% 77.97% at 24.55% 26.31%, #003CB3 0%, #001A4D 100%)",
        /* Section frame ~792.5 px @ ref → proportional min-height. */
        minHeight: "min(45.86vw, 70.95vh)",
        paddingTop: "min(5.79vw, 8.95vh)" /* ~100 px */,
        paddingBottom: "min(5.79vw, 8.95vh)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      {/* Grid: LEFT column | 1 px vertical divider | RIGHT column.
          On mobile, drops to a single column and hides the vertical rule. */}
      <div
        className="relative mx-auto grid w-full items-stretch max-md:!grid-cols-1 max-md:!gap-[40px]"
        style={{
          maxWidth: "min(83.33vw, 128.91vh)" /* ~1440 px @ ref */,
          gridTemplateColumns: "1fr 1px 1fr",
          columnGap: "min(3.47vw, 5.37vh)" /* ~60 px @ ref */,
        }}
      >
        {/* ══════════ LEFT COLUMN ══════════ */}
        <div className="relative overflow-hidden">
          <GlowBackdrop instanceId="left" />
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
            {heading}
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

          {/* ── HORIZONTAL DIVIDER — spans the left column ── */}
          <div
            className="w-full max-md:!hidden"
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

          {/* CTA button — 287×59, white pill, 10 px pad/gap. */}
          <button
            className="mt-[min(2.31vw,3.58vh)] cursor-pointer border-none font-['Poppins',_sans-serif] font-medium transition-all duration-200 hover:brightness-95 max-md:!w-[220px] max-md:!h-[48px] max-md:!text-[14px] max-md:!mt-[24px]"
            style={{
              width: "min(16.61vw, 25.69vh)" /* 287 px @ ref */,
              height: "min(3.41vw, 5.28vh)" /* 59 px @ ref */,
              padding: "min(0.58vw, 0.90vh)" /* 10 px @ ref */,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "min(0.58vw, 0.90vh)" /* 10 px @ ref */,
              background: "#FFF",
              color: "#001A4D",
              borderRadius: "min(1.70vw, 2.64vh)" /* half of height → pill */,
              fontSize: "min(1.16vw, 1.79vh)" /* ~20 px @ ref */,
            }}
          >
            {ctaLabel}
          </button>

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

        {/* ══════════ VERTICAL DIVIDER (grid middle column) ══════════ */}
        <div
          className="max-md:!hidden"
          style={{
            width: 1,
            background: "rgba(255,255,255,0.35)",
            justifySelf: "center",
            height: "100%",
          }}
        />

        {/* ══════════ RIGHT COLUMN — quote + attribution ══════════ */}
        <div className="relative overflow-hidden">
          <GlowBackdrop instanceId="right" mirror />
          <div className="relative z-10 flex h-full flex-col justify-center max-md:!text-center">
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
