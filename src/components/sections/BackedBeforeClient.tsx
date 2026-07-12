"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useAnimationFrame, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";

/* ─────────────────────────────────────────────────────────
   Types — shared shape for both marquee rows.
   `image` is the field that comes back from Sanity (asset->url string).
   `logos_backuprc` is the legacy field name used by the hardcoded fallback.
   Either populates `resolveLogoSrc` so the render loop is one path.
   ───────────────────────────────────────────────────────── */
export interface BackedBeforeLogo {
  name: string;
  /** Resolved URL when data comes from Sanity */
  image?: string;
  /** Local-path field used by the hardcoded fallback */
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
   Fallback defaults — keeps the page rendering exactly as today
   if Sanity returns null or fields are missing.
   ───────────────────────────────────────────────────────── */
const FALLBACK_HEADING_1 = "Backed Before";
const FALLBACK_HEADING_2 = "Anyone Else Did";

const FALLBACK_ROW1: BackedBeforeLogo[] = [
  { name: "Ola",           logos_backuprc: "/images/logos_backup/ola.svg",                  scaleClass: "scale-[0.7]" },
  { name: "Urban Company", logos_backuprc: "/images/logos_backup/Urban Company.webp",       scaleClass: "" },
  { name: "Mamaearth",     logos_backuprc: "/images/logos_backup/mamaearthpng.webp",        scaleClass: "scale-[1.3]" },
  { name: "Shadowfax",     logos_backuprc: "/images/logos_backup/Shadowfax.svg",            scaleClass: "scale-[1.2]" },
  { name: "Razorpay",      logos_backuprc: "/images/logos_backup/Razorpay.webp",            scaleClass: "scale-[1.3]" },
  { name: "Ofbusiness",    logos_backuprc: "/images/logos_backup/Ofbusiness.png",           scaleClass: "scale-[1.6]" },
  { name: "Cart.com",      logos_backuprc: "/images/logos_backup/Cart.com.webp",            scaleClass: "scale-[1.3]" },
  { name: "Unicommerce",   logos_backuprc: "/images/logos_backup/unicommerce-logo.svg",     scaleClass: "" },
  { name: "Snapdeal",      logos_backuprc: "/images/logos_backup/snapdeal-company-1.webp",  scaleClass: "scale-[1.3]" },
  { name: "Credgenics",    logos_backuprc: "/images/logos_backup/Credgenics.svg",           scaleClass: "scale-[1.3]" },
];

const FALLBACK_ROW2: BackedBeforeLogo[] = [
  { name: "Giva",       logos_backuprc: "/images/logos_backup/GIVA.webp",              scaleClass: "scale-[0.8]" },
  { name: "Boba Bhai",  logos_backuprc: "/images/logos_backup/bobabhai.webp",          scaleClass: "" },
  { name: "Invideo",    logos_backuprc: "/images/logos_backup/invideo.svg",            scaleClass: "scale-[0.8]" },
  { name: "Park+",      logos_backuprc: "/images/portfolio_grid/PARK+logo.png",        scaleClass: "scale-[1.8]" },
  { name: "Renee",      logos_backuprc: "/images/logos_backup/RENEE.svg",              scaleClass: "scale-[0.7]" },
  { name: "Supertails", logos_backuprc: "/images/portfolio_grid/supertails_black.png", scaleClass: "scale-[3.2]" },
  { name: "Zingbus",    logos_backuprc: "/images/logos_backup/zingbus.webp",           scaleClass: "" },
  { name: "Anveshan",   logos_backuprc: "/images/logos_backup/anveshan.webp",          scaleClass: "" },
  { name: "Kutumb",     logos_backuprc: "/images/logos_backup/Kutumb.webp",            scaleClass: "scale-[1.3]" },
  { name: "Magma",      logos_backuprc: "/images/logos_backup/magma factory.webp",     scaleClass: "scale-[2.4]" },
  { name: "Mekr",       logos_backuprc: "/images/logos_backup/mekr.webp",              scaleClass: "" },
  { name: "Slovic",     logos_backuprc: "/images/logos_backup/slovic.avif",            scaleClass: "scale-[1.3]" },
  { name: "Zouk",       logos_backuprc: "/images/logos_backup/zouk_new_logo.webp",     scaleClass: "scale-[0.8]" },
];

/* Append Sanity CDN transform params for served images. Local /images/...
   URLs pass through unchanged so the fallback path keeps working. */
function cdnImageSrc(url: string, width: number): string {
  if (url.startsWith("https://cdn.sanity.io/")) {
    return `${url}?w=${width}&auto=format&q=85`;
  }
  return url;
}

/** Logos from Sanity arrive as { image, ... }; fallback uses { logos_backuprc, ... }.
 *  Normalise both shapes here so the render loop is one path. */
function resolveLogoSrc(logo: BackedBeforeLogo): string {
  return logo.image ?? logo.logos_backuprc ?? "";
}

// ---------------------------------------------------------
// HELPER LOGIC FOR DRAGGABLE MARQUEE
// ---------------------------------------------------------
const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

function DraggableMarquee({
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
  const isDragging = useRef(false);
  const isHovered = useRef(false);

  // Measure the width of exactly 1/3 of the container to know exactly when to wrap seamlessly
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setContentWidth(containerRef.current.scrollWidth / 3);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [items]);

  useAnimationFrame((t, delta) => {
    if (contentWidth === 0 || isDragging.current || isHovered.current) return;

    // Add movement per frame
    const moveBy = direction * speed * (delta / 1000);
    rawX.set(rawX.get() + moveBy);
  });

  // Smoothly wrap the X coordinate between bounds so it repeats infinitely
  const smoothX = useTransform(rawX, (v) => {
    if (contentWidth === 0) return 0;
    return wrap(-contentWidth, 0, v);
  });

  return (
    <motion.div
      ref={containerRef}
      // Replaced standard drag with manual pan gesture, touch-pan-y ensures vertical scrolling isn't blocked on mobile
      className="flex w-max gap-[36px] md:gap-[54px] items-center cursor-grab active:cursor-grabbing touch-pan-y"
      style={{ x: smoothX }}
      onMouseEnter={() => { isHovered.current = true; }}
      onMouseLeave={() => { isHovered.current = false; }}
      onPanStart={() => { isDragging.current = true; }}
      onPan={(e, info) => {
        rawX.set(rawX.get() + info.delta.x);
      }}
      onPanEnd={() => { isDragging.current = false; }}
    >
      {items.map((company, i) => {
        const src = resolveLogoSrc(company);
        if (!src) return null;
        return (
          <motion.div
            key={`marquee-item-${company.name}-${i}`}
            className="relative flex shrink-0 items-center justify-center h-[36px] w-[108px] md:h-[53px] md:w-[164px] select-none"
            whileHover={{ scale: 1.15, filter: "brightness(1.08)" }}
            whileTap={{ scale: 1.25 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
          >
            <div className={`relative w-full h-full ${company.scaleClass ?? ""}`}>
              <Image
                src={cdnImageSrc(src, 320)}
                alt={company.name}
                fill
                style={{ objectFit: "contain" }}
                sizes="(max-width: 768px) 108px, 164px"
                priority={i < 10}
                draggable={false}
              />
            </div>
          </motion.div>
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
  /* Per-field fallback — partially-edited CMS doc still renders cleanly. */
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

  // Triple the array so the marquee can loop seamlessly without a visible jump.
  const loopPoolRow1 = [...row1, ...row1, ...row1];
  const loopPoolRow2 = [...row2, ...row2, ...row2];

  return (
    <section
      className="flex flex-col items-center gap-[30px] md:gap-[45px] self-stretch overflow-hidden w-full bg-white"
      style={{
        paddingTop: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingBottom: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >

      {/* ANIMATED SCROLL HEADING SEQUENCE */}
      {/* <div className="flex flex-col items-center w-full max-w-[1009px] px-4 mb-4 md:mb-8 mx-auto">
        <motion.h2
          className="text-[var(--Primary-Color,#001A4D)] text-center font-['Libre_Baskerville',_serif] text-[clamp(28px,5vw,var(--heading-xl))] italic font-semibold leading-[100%] md:leading-[120%]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.8 }}
        >
          <motion.div
            className="relative z-10 flex w-full max-w-[fit-content] p-[10px] justify-center items-center gap-[10px] mx-auto bg-transparent"
            variants={{
              hidden: { opacity: 0, x: -80 },
              visible: {
                opacity: 1,
                x: 0,
                transition: { duration: 0.9, ease: "easeOut" }
              }
            }}
          >
            <motion.div
              className="absolute inset-0 bg-[#d3e2ff] z-0"
              style={{ transformOrigin: "left" }}
              variants={{
                hidden: { scaleX: 0 },
                visible: {
                  scaleX: 1,
                  transition: { duration: 0.9, ease: "easeInOut", delay: 0.35 }
                }
              }}
            />
            <span className="relative z-20 whitespace-nowrap">{heading1}</span>
          </motion.div>
        </motion.h2>

        <motion.h2
          className="self-stretch text-[var(--Primary-Color,#001A4D)] text-center font-['Libre_Baskerville',_serif] text-[clamp(28px,5vw,var(--heading-xl))] not-italic font-semibold leading-[100%] md:leading-[120%] mt-2 md:mt-0"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.7 }}
        >
          {heading2}
        </motion.h2>
      </div> */}

      {/* TRACK ONE: Left to Right */}
      <div
        className="flex w-full overflow-hidden relative py-4 md:py-6 mt-6"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)"
        }}
      >
        {/* direction 1 = left-to-right */}
        <DraggableMarquee items={loopPoolRow1} direction={1} speed={60} />
      </div>

      {/* TRACK TWO: Right to Left */}
      <div
        className="flex w-full overflow-hidden relative py-4 md:py-6 mt-0 md:-mt-4"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)"
        }}
      >
        {/* direction -1 = right-to-left */}
        <DraggableMarquee items={loopPoolRow2} direction={-1} speed={50} />
      </div>
    </section>
  );
}
