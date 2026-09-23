"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useAnimationFrame, useInView, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { companySlug } from "./BackedEarlyClient";

/* ─────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────── */
export interface BackedBeforeLogo {
  name: string;
  image?: string;
  logos_backuprc?: string;
  scaleClass?: string;
}

export interface BackedBeforeData {
  heading1?: string;
  heading2?: string;
  marquet1?: BackedBeforeLogo[];
  marquet2?: BackedBeforeLogo[];
}

/* ─────────────────────────────────────────────────────────
   Fallback defaults
   ───────────────────────────────────────────────────────── */
const FALLBACK_HEADING_1 = "Backed Before";
const FALLBACK_HEADING_2 = "Anyone Else Did";

const FALLBACK_ROW1: BackedBeforeLogo[] = [
  { name: "Ola",           logos_backuprc: "/images/logos_backup/ola.svg",                  scaleClass: "" },
  { name: "Urban Company", logos_backuprc: "/images/logos_backup/Urban Company.webp",       scaleClass: "" },
  { name: "Mamaearth",     logos_backuprc: "/images/logos_backup/mamaearthpng.webp",        scaleClass: "" },
  { name: "Shadowfax",     logos_backuprc: "/images/logos_backup/Shadowfax.svg",            scaleClass: "" },
  { name: "Razorpay",      logos_backuprc: "/images/logos_backup/Razorpay.webp",            scaleClass: "" },
  { name: "Ofbusiness",    logos_backuprc: "/images/logos_backup/Ofbusiness.png",           scaleClass: "" },
  { name: "Cart.com",      logos_backuprc: "/images/logos_backup/Cart.com.webp",            scaleClass: "" },
  { name: "Unicommerce",   logos_backuprc: "/images/logos_backup/unicommerce-logo.svg",     scaleClass: "0.7" },
  { name: "Snapdeal",      logos_backuprc: "/images/logos_backup/snapdeal-company-1.webp",  scaleClass: "" },
  { name: "Credgenics",    logos_backuprc: "/images/logos_backup/Credgenics.svg",           scaleClass: "" },
];

const FALLBACK_ROW2: BackedBeforeLogo[] = [
  { name: "Giva",       logos_backuprc: "/images/logos_backup/GIVA.webp",              scaleClass: "" },
  { name: "Boba Bhai",  logos_backuprc: "/images/logos_backup/bobabhai.webp",          scaleClass: "" },
  { name: "Invideo",    logos_backuprc: "/images/logos_backup/invideo.svg",            scaleClass: "" },
  { name: "Park+",      logos_backuprc: "/images/portfolio_grid/PARK+logo.png",        scaleClass: "" },
  { name: "Renee",      logos_backuprc: "/images/logos_backup/RENEE.svg",              scaleClass: "" },
  { name: "Supertails", logos_backuprc: "/images/portfolio_grid/supertails_black.png", scaleClass: "" },
  { name: "Zingbus",    logos_backuprc: "/images/logos_backup/zingbus.webp",           scaleClass: "" },
  { name: "Anveshan",   logos_backuprc: "/images/logos_backup/anveshan.webp",          scaleClass: "" },
  { name: "Kutumb",     logos_backuprc: "/images/logos_backup/Kutumb.webp",            scaleClass: "" },
  { name: "Magma",      logos_backuprc: "/images/logos_backup/magma factory.webp",     scaleClass: "" },
  { name: "Mekr",       logos_backuprc: "/images/logos_backup/mekr.webp",              scaleClass: "" },
  { name: "Slovic",     logos_backuprc: "/images/logos_backup/slovic.avif",            scaleClass: "" },
  { name: "Zouk",       logos_backuprc: "/images/logos_backup/zouk_new_logo.webp",     scaleClass: "" },
];

function cdnImageSrc(url: string, width: number): string {
  if (url.startsWith("https://cdn.sanity.io/")) {
    return `${url}?w=${width}&auto=format&q=85`;
  }
  return url;
}

function resolveLogoSrc(logo: BackedBeforeLogo): string {
  return logo.image ?? logo.logos_backuprc ?? "";
}

function clampLogoScale(scaleClass?: string): number {
  const m = scaleClass?.match(/scale-\[([\d.]+)\]/);
  const s = m ? parseFloat(m[1]) : 1.3; 
  return Math.min(Number.isFinite(s) ? s : 1.3, 2.0);
}

// ---------------------------------------------------------
// AUTO-SCROLLING LOGO MARQUEE
// Not draggable — each tile is a link to its portfolio page, the
// same as the cards in BackedEarly.
// ---------------------------------------------------------
/** Next's Link with framer-motion's props, so the tile keeps its hover/tap
 *  spring while still client-side routing. */
const MotionLink = motion.create(Link);

const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

function LogoMarquee({
  items,
  direction = -1,
  speed = 50,
}: {
  items: BackedBeforeLogo[];
  direction?: number;
  speed?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const rawX = useMotionValue(0);
  const isHovered = useRef(false);
  const inView = useInView(containerRef);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    const measure = () => {
      if (containerRef.current) {
        setContentWidth(containerRef.current.scrollWidth / 3);
      }
    };

    measure();

    const observer = new ResizeObserver(() => {
      measure();
    });
    observer.observe(containerRef.current);

    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [items]);
  useAnimationFrame((t, delta) => {
    if (!inView || contentWidth === 0 || isHovered.current) return;

    const moveBy = direction * speed * (delta / 1000);
    rawX.set(rawX.get() + moveBy);
  });

  const smoothX = useTransform(rawX, (v) => {
    if (contentWidth === 0) return 0;
    return wrap(-contentWidth, 0, v);
  });

  return (
    <motion.div
      ref={containerRef}
      // FIXED: Mobile gap strictly set to 1.5vw to ensure mathematical perfection for 5 boxes
      className="flex w-max max-md:gap-[1.5vw] md:gap-[20px] items-center"
      style={{ x: smoothX , willChange: "transform" }}
      onMouseEnter={() => { isHovered.current = true; }}
      onMouseLeave={() => { isHovered.current = false; }}
    >
      {items.map((company, i) => {
        const src = resolveLogoSrc(company);
        if (!src) return null;
        return (
          <MotionLink
            key={`marquee-item-${company.name}-${i}`}
            href={`/portfolio/${companySlug(company.name)}`}
            aria-label={`${company.name} portfolio page`}
            draggable={false}
            /* Mobile width stays bound to 18vw so five boxes fit within 100vw.
               DESKTOP IS NO LONGER A FLAT 80x160. This section now shares the
               first screen with the hero, so every pixel it takes is a pixel
               the headline does not get — and a fixed height takes the same
               280px out of a 1117px monitor and a 720px laptop alike, which is
               39% of the short one. Measured at 1280x720 that left the
               headline 5px behind the navbar. min(vw, vh) with a clamp is what
               the rest of the site sizes with: it gives back ~19px a row on
               short screens and is within 3px of the old size on tall ones.
               The 2:1 ratio between the two is preserved exactly. */
            className="relative flex shrink-0 cursor-pointer items-center justify-center overflow-hidden max-md:w-[18vw] max-md:h-[10vw] md:h-[clamp(56px,min(5.5vw,8.5vh),80px)] md:w-[clamp(112px,min(11vw,17vh),160px)] select-none"
            style={{ borderRadius: "2px", background: "#FCFCFC" }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 1.12 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
          >
            <div
              // FIXED: Reduced internal padding strictly for mobile to make logos appear tighter to the box edge
              className="relative h-full w-full max-md:p-[3px] md:p-[6px]"
              style={{ transform: `scale(${clampLogoScale(company.scaleClass)})` }}
            >
              <Image
                src={cdnImageSrc(src, 320)}
                alt={`${company.name} – Titan Capital portfolio company`}
                fill
                style={{ objectFit: "contain" }} 
                sizes="(max-width: 768px) 18vw, 160px"
                priority={i < 10}
                draggable={false}
              />
            </div>
          </MotionLink>
        );
      })}
    </motion.div>
  );
}

// ---------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------
export default function BackedBeforeClient({
  data,
}: {
  data?: BackedBeforeData | null;
}) {
  const heading1 = data?.heading1 || FALLBACK_HEADING_1;
  const heading2 = data?.heading2 || FALLBACK_HEADING_2;
  const row1 =
    data?.marquet1 && data.marquet1.length > 0
      ? data.marquet1
      : FALLBACK_ROW1;
  const row2 =
    data?.marquet2 && data.marquet2.length > 0
      ? data.marquet2
      : FALLBACK_ROW2;

  const loopPoolRow1 = [...row1, ...row1, ...row1];
  const loopPoolRow2 = [...row2, ...row2, ...row2];

  return (
    <section
      /* The `max-md:!-mt-[60px]` that used to be here is gone. It existed to
         claw this section back up under the old layout, where it followed a
         110vh hero track and started too far down the page. It is now a flex
         child of the first screen, which places it exactly, and the negative
         margin was pulling it 60px back OVER the hero — hero 722 + rows 150
         against an 812 viewport, fitting only because of the overlap. It
         looked fine only because the bottom of the hero happens to be empty
         navy on a phone. Removed so the two boxes add up honestly. */
      /* NO BACKGROUND OF ITS OWN. The white experiment is over: this section
         now renders INSIDE the hero section, so the navy and the glow behind
         it are the hero's and run straight through — which is the only way
         the two genuinely match rather than being set to the same colour in
         two places and drifting apart later. */
      className="flex flex-col items-center gap-[15px] md:gap-[22px] self-stretch overflow-hidden w-full"
      style={{
        paddingTop: "clamp(10px, min(2.0vw, 3.09vh), 25px)",
        paddingBottom: "clamp(10px, min(2.00vw, 3.09vh), 25px)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >

      <div
        className="flex w-full overflow-hidden relative py-2 md:py-[min(0.8vw,1.2vh)] mt-2"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)"
        }}
      >
        <LogoMarquee items={loopPoolRow1} direction={1} speed={100} />
      </div>

      <div
        className="flex w-full overflow-hidden relative py-2 md:py-[min(0.8vw,1.2vh)] mt-0 md:-mt-2"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)"
        }}
      >
        <LogoMarquee items={loopPoolRow2} direction={-1} speed={85} />
      </div>
    </section>
  );
}