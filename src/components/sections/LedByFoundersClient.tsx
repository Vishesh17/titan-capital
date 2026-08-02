"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

/* ─────────────────────────────────────────────────────────
   Shared motion variants
   ───────────────────────────────────────────────────────── */
const fadeUp = (delay = 0): Variants => ({
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut", delay },
  },
});

/* ─────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────── */
export interface FounderProfile {
  name: string;
  role: string;
  linkedin?: string;
  image?: string;
  bio: string;
  imagePosition?: "left" | "right";
}

export interface LedByFoundersData {
  headingTopHighlight?: string;
  headingBottom?: string;
  founders?: FounderProfile[];
}

const FALLBACK_HEADING_TOP = "Led By Founders";
const FALLBACK_HEADING_BOTTOM = "Who've Walked The Path.";

const FALLBACK_FOUNDERS: FounderProfile[] = [
  {
    name: "Kunal Bahl",
    role: "Co-Founder, Titan Capital",
    linkedin: "https://www.linkedin.com/in/kunalbahl/",
    image: "/images/kunal-bahl.jpg",
    bio: "Co-founder of Snapdeal, one of India's most iconic e-commerce companies. Kunal brings rare operator insight to every investment, having navigated hyper-growth, deep turbulence, and an enduring rebuild. That experience shapes every conversation he has with founders today. He doesn't advise from theory. He advises from scars.",
    imagePosition: "left",
  },
  {
    name: "Rohit Bansal",
    role: "Co-Founder, Titan Capital",
    linkedin: "https://www.linkedin.com/in/rohitbansal/",
    image: "/images/rohit-bansal.jpg",
    bio: "Co-founder of Snapdeal and a deeply technical operator. Rohit brings product depth and business architecture thinking to every portfolio company he touches. His pattern recognition across consumer internet, fintech, and SaaS comes from building, not just investing.",
    imagePosition: "right",
  },
];

function cdnImageSrc(url: string, width: number): string {
  if (!url) return url;
  if (!url.startsWith("https://cdn.sanity.io/")) return url;
  return `${url}?w=${width}&auto=format&q=85`;
}

/* ═══════════════════════════════════════════════════════
   ICON
   ═══════════════════════════════════════════════════════ */
const LinkedInIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    fill="none"
    className="transition-transform duration-200 hover:scale-110 hover:opacity-80"
    style={{
      width: "clamp(24px, min(2.5vw, 3.5vh), 32px)",
      height: "clamp(24px, min(2.5vw, 3.5vh), 32px)",
      aspectRatio: "1 / 1",
    }}
  >
    <path
      d="M40.9411 3.99979H7.06109C6.68025 3.9945 6.3021 4.06429 5.94823 4.20516C5.59435 4.34603 5.2717 4.55523 4.99869 4.82082C4.72568 5.0864 4.50766 5.40316 4.35708 5.75301C4.2065 6.10286 4.12631 6.47895 4.12109 6.85979V41.1398C4.12631 41.5206 4.2065 41.8967 4.35708 42.2466C4.50766 42.5964 4.72568 42.9132 4.99869 43.1788C5.2717 43.4443 5.59435 43.6535 5.94823 43.7944C6.3021 43.9353 6.68025 44.0051 7.06109 43.9998H40.9411C41.3219 44.0051 41.7001 43.9353 42.054 43.7944C42.4078 43.6535 42.7305 43.4443 43.0035 43.1788C43.2765 42.9132 43.4945 42.5964 43.6451 42.2466C43.7957 41.8967 43.8759 41.5206 43.8811 41.1398V6.85979C43.8759 6.47895 43.7957 6.10286 43.6451 5.75301C43.4945 5.40316 43.2765 5.0864 43.0035 4.82082C42.7305 4.55523 42.4078 4.34603 42.054 4.20516C41.7001 4.06429 41.3219 3.9945 40.9411 3.99979ZM16.1811 37.4798H10.1811V19.4798H16.1811V37.4798ZM13.1811 16.9598C12.3536 16.9598 11.56 16.6311 10.9749 16.046C10.3898 15.4609 10.0611 14.6673 10.0611 13.8398C10.0611 13.0123 10.3898 12.2187 10.9749 11.6336C11.56 11.0485 12.3536 10.7198 13.1811 10.7198C13.6205 10.67 14.0654 10.7135 14.4868 10.8476C14.9082 10.9816 15.2966 11.2032 15.6264 11.4977C15.9562 11.7923 16.2201 12.1531 16.4008 12.5568C16.5815 12.9604 16.6749 13.3976 16.6749 13.8398C16.6749 14.282 16.5815 14.7192 16.4008 15.1228C16.2201 15.5264 15.9562 15.8873 15.6264 16.1819C15.2966 16.4764 14.9082 16.698 14.4868 16.832C14.0654 16.9661 13.6205 17.0096 13.1811 16.9598ZM37.8211 37.4798H31.8211V27.8198C31.8211 25.3998 30.9611 23.8198 28.7811 23.8198C28.1064 23.8247 27.4495 24.0364 26.8988 24.4261C26.3481 24.8159 25.9301 25.3651 25.7011 25.9998C25.5446 26.4699 25.4768 26.9649 25.5011 27.4598V37.4598H19.5011V19.4598H25.5011V21.9998C26.0462 21.054 26.8389 20.2748 27.794 19.7462C28.749 19.2176 29.8302 18.9595 30.9211 18.9998C34.9211 18.9998 37.8211 21.5798 37.8211 27.1198V37.4798Z"
      fill="#003CB3"
    />
  </svg>
);

/* ═══════════════════════════════════════════════════════
   ONE FOUNDER PROFILE
   ═══════════════════════════════════════════════════════ */
function FounderRow({ founder }: { founder: FounderProfile }) {
  const isImageLeft = (founder.imagePosition ?? "left") === "left";

  // Centralized dimensions to keep the photo and the vertical line perfectly synced
  const PHOTO_WIDTH = "clamp(240px, min(26.6vw, 38vh), 380px)";
  const PHOTO_HEIGHT = "clamp(320px, min(35.5vw, 50vh), 500px)";

  return (
    <div
      className={`flex w-full flex-col items-center justify-between lg:items-center ${
        isImageLeft ? "lg:flex-row" : "lg:flex-row-reverse"
      }`}
      style={{
        gap: "clamp(24px, min(4vw, 5vh), 56px)", 
      }}
    >
      {/* ── PORTRAIT ── */}
      <div
        className="relative shrink-0 overflow-hidden bg-gray-200"
        style={{
          width: PHOTO_WIDTH,
          height: PHOTO_HEIGHT,
          borderRadius: "2px", 
        }}
      >
        {founder.image && (
          <Image
            src={cdnImageSrc(founder.image, 900)}
            alt={founder.name}
            fill
            sizes="(max-width: 1024px) 90vw, 32vw"
            // scale-105 zooms in slightly to push any baked-in borders outside the container frame
            className="object-cover object-center scale-105"
          />
        )}
      </div>

      {/* ── VERTICAL LINE ── */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.5 }} 
        className="hidden lg:block w-[1px] bg-black shrink-0"
        style={{ 
          height: PHOTO_HEIGHT,
          transformOrigin: "top" 
        }}
        variants={{
          hidden: { scaleY: 0, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } },
          visible: {
            scaleY: 1,
            transition: { duration: 2.6, ease: [0.22, 1, 0.36, 1] },
          },
        }}
      />

      {/* ── CONTENT ── (mobile: centered; desktop: left-aligned, unchanged) */}
      <div className="flex w-full flex-1 flex-col items-center text-center lg:items-start lg:text-left lg:px-4">
        {/* Highlighted name */}
        <h3
          className="m-0 font-['Poppins',_sans-serif] font-semibold text-[#0E0E0E]"
          style={{
            fontSize: "clamp(28px, min(3.33vw, 4.88vh), 42px)",
            lineHeight: "130%",
            marginBottom: "clamp(4px, min(0.55vw, 0.81vh), 8px)",
          }}
        >
          {founder.name}
        </h3>

        {/* Role */}
        <p
          className="m-0 font-['Poppins',_sans-serif] font-normal text-[#323232]"
          style={{
            fontSize: "clamp(16px, min(1.6vw, 2.4vh), 20px)",
            lineHeight: "158%",
          }}
        >
          {founder.role}
        </p>

        {/* LinkedIn */}
        {founder.linkedin && (
          <div style={{ marginTop: "clamp(8px, min(1.2vw, 1.8vh), 16px)" }}>
            <Link
              href={founder.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${founder.name} on LinkedIn`}
            >
              <LinkedInIcon />
            </Link>
          </div>
        )}

        {/* ── HORIZONTAL LINE ── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.8 }}
          className="w-full h-[1px] bg-black max-md:!origin-center"
          style={{
            transformOrigin: isImageLeft ? "left" : "right",
            marginTop: "clamp(16px, min(2vw, 3vh), 32px)",
            marginBottom: "clamp(16px, min(2vw, 3vh), 32px)",
          }}
          variants={{
            hidden: { scaleX: 0, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } },
            visible: {
              scaleX: 1,
              transition: { duration: 2.6, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        />

        {/* Bio */}
        <p
          className="m-0 whitespace-pre-line font-['Poppins',_sans-serif] font-normal text-[#323232]"
          style={{
            fontSize: "clamp(14px, min(1.38vw, 2.03vh), 18px)",
            lineHeight: "160%",
            maxWidth: "600px",
          }}
        >
          {founder.bio}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN CLIENT COMPONENT
   ═══════════════════════════════════════════════════════ */
export default function LedByFoundersClient({
  data,
}: {
  data?: LedByFoundersData | null;
}) {
  const headingTop = data?.headingTopHighlight || FALLBACK_HEADING_TOP;
  const headingBottom = data?.headingBottom || FALLBACK_HEADING_BOTTOM;
  const founders =
    data?.founders && data.founders.length > 0
      ? data.founders
      : FALLBACK_FOUNDERS;

  return (
    <section
      className="relative flex w-full flex-col bg-[#FBF7F0]"
      style={{
        // Lower z-index so the OurTeam section (z-20) slides up and over
        // this one via its negative top margin + curved top.
        zIndex: 1,
        paddingTop: "clamp(60px, min(8vw, 10vh), 120px)",
        paddingBottom: "clamp(60px, min(8vw, 10vh), 120px)",
        paddingLeft: "var(--section-px-wide, 5%)",
        paddingRight: "var(--section-px-wide, 5%)",
      }}
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center">
        {/* ── HEADING ── */}
        <motion.div
          className="max-md:!mb-[clamp(32px,6dvh,48px)] flex w-full flex-col items-center justify-center text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.5 }}
          // Matches the gap used in WhatWeLookForClient precisely
          style={{ marginBottom: "min(3.47vw, 5.37vh)" }}
        >
          <motion.h2
            className="m-0 font-['Poppins',_sans-serif] font-semibold text-black max-md:!text-[clamp(24px,7vw,28px)] max-md:!leading-[120%]"
            // Line height matched to WhatWeLookFor section (150%)
            style={{ fontSize: "min(4.51vw, 6.98vh)", lineHeight: "150%" }}
            variants={fadeUp(0)}
          >
            {headingTop}
          </motion.h2>

          <motion.h2
            className="m-0 font-['Poppins',_sans-serif] font-semibold text-black max-md:!text-[clamp(24px,7vw,28px)] max-md:!leading-[120%]"
            style={{
              fontSize: "min(4.51vw, 6.98vh)",
              lineHeight: "150%",
            }}
            variants={fadeUp(0.15)}
          >
            {headingBottom}
          </motion.h2>
        </motion.div>

        {/* ── FOUNDERS LIST ── */}
        <div
          className="flex w-full flex-col"
          style={{
            // Removed marginTop so the exact padding gap from the heading above dictates spacing
            gap: "clamp(64px, min(8vw, 12vh), 120px)",
          }}
        >
          {founders.map((founder) => (
            <FounderRow key={founder.name} founder={founder} />
          ))}
        </div>
      </div>
    </section>
  );
}