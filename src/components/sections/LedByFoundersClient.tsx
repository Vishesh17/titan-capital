"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

import InstagramIcon from "@/components/icons/InstagramIcon";
import StoryArrow from "@/components/icons/StoryArrow";
import XIcon from "@/components/icons/XIcon";
import { founderSlug } from "@/lib/founderSlug";
import {
  HERO_BODY_CLASS,
  HERO_BODY_STYLE,
  SECTION_HEADING_CLASS,
  SECTION_HEADING_STYLE,
  SUBHEADING_CLASS,
  SUBHEADING_STYLE,
} from "@/styles/heroTypography";

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
  /** Powers /founders/<slug>. Falls back to a slug derived from the name. */
  slug?: string;
  role: string;
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  /** Section photo — keeps its background. */
  image?: string;
  /** Detail-page photo — background removed, clipped into the blob. */
  imageNoBg?: string;
  /** Short bio, shown in the Led By Founders section. */
  bio: string;
  /** Full story, shown on /founders/<slug>. */
  longBio?: string;
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
    slug: "kunal-bahl",
    role: "Co-Founder, Titan Capital",
    linkedin: "https://www.linkedin.com/in/kunalbahl/",
    image: "/images/kunal-bahl.jpg",
    bio: "Co-founder of Snapdeal, one of India's most iconic e-commerce companies. Kunal brings rare operator insight to every investment, having navigated hyper-growth, deep turbulence, and an enduring rebuild. That experience shapes every conversation he has with founders today. He doesn't advise from theory. He advises from scars.",
    imagePosition: "left",
  },
  {
    name: "Rohit Bansal",
    slug: "rohit-bansal",
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

const ICON_BOX = {
  width: "clamp(24px, min(2.5vw, 3.5vh), 32px)",
  height: "clamp(24px, min(2.5vw, 3.5vh), 32px)",
  aspectRatio: "1 / 1",
} as const;

/** One social link, sized to match the LinkedIn mark above. */
function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-block transition-transform duration-200 hover:scale-110 hover:opacity-80"
      style={ICON_BOX}
    >
      {children}
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════
   ONE FOUNDER PROFILE
   ═══════════════════════════════════════════════════════ */
   function FounderRow({ founder }: { founder: FounderProfile }) {
    const isImageLeft = (founder.imagePosition ?? "left") === "left";
    const PHOTO_WIDTH = "clamp(240px, min(26.6vw, 38vh), 380px)";
    const PHOTO_HEIGHT = "clamp(320px, min(35.5vw, 50vh), 500px)";
    const profileUrl = `/founders/${founder.slug || founderSlug(founder.name)}`;
  
    return (
      <div
        className={`flex w-full flex-col items-center justify-between lg:items-center ${
          isImageLeft ? "lg:flex-row" : "lg:flex-row-reverse"
        }`}
        style={{
          gap: "clamp(24px, min(4vw, 5vh), 56px)",
          ["--photo-h" as string]: PHOTO_HEIGHT,
        }}
      >
        {/* ── PORTRAIT ── */}
        <Link
          href={profileUrl}
          aria-label={`Read more about ${founder.name}`}
          className="group relative block shrink-0 overflow-hidden bg-gray-200"
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
              className="object-cover object-center scale-105 transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.13]"
            />
          )}
  
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100"
            style={{
              background:
                "linear-gradient(180deg, rgba(14,14,14,0.58) 0%, rgba(14,14,14,0.16) 34%, rgba(14,14,14,0) 58%, rgba(14,14,14,0.20) 100%)",
            }}
          />
  
          <div
            className="pointer-events-none absolute z-10 translate-x-[-6px] translate-y-[6px] opacity-0 transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
            style={{ top: "min(1.85vw, 2.86vh)", right: "min(1.85vw, 2.86vh)" }}
          >
            <StoryArrow color="white" />
          </div>
        </Link>
  
        {/* ── VERTICAL LINE ── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.5 }}
          className="hidden lg:block w-[1px] bg-black shrink-0"
          style={{ height: "var(--photo-h)", transformOrigin: "top" }}
          variants={{
            hidden: { scaleY: 0, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } },
            visible: { scaleY: 1, transition: { duration: 2.6, ease: [0.22, 1, 0.36, 1] } },
          }}
        />
  
        {/* ── CONTENT ── */}
        <div className="flex w-full flex-1 flex-col items-center text-center lg:min-h-[var(--photo-h)] lg:items-start lg:text-left lg:px-4">
          
          <h3
            className={`m-0 text-[#0E0E0E] ${SUBHEADING_CLASS}`}
            style={{ ...SUBHEADING_STYLE, marginBottom: "clamp(4px, min(0.55vw, 0.81vh), 8px)" }}
          >
            {founder.name}
          </h3>
  
          <p className={`m-0 text-[#323232] ${HERO_BODY_CLASS}`} style={HERO_BODY_STYLE}>
            {founder.role}
          </p>
  
          {/* Socials */}
          {(founder.linkedin || founder.instagram || founder.twitter) && (
            <div
              className="flex items-center justify-center lg:justify-start"
              style={{
                gap: "clamp(8px, min(1vw, 1.5vh), 14px)",
                marginTop: "clamp(8px, min(1.2vw, 1.8vh), 16px)",
              }}
            >
              {founder.linkedin && (
                <Link href={founder.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${founder.name} on LinkedIn`}>
                  <LinkedInIcon />
                </Link>
              )}
              {founder.instagram && (
                <SocialLink href={founder.instagram} label={`${founder.name} on Instagram`}>
                  <InstagramIcon className="h-full w-full" />
                </SocialLink>
              )}
              {founder.twitter && (
                <SocialLink href={founder.twitter} label={`${founder.name} on X`}>
                  <XIcon className="h-full w-full" />
                </SocialLink>
              )}
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
              visible: { scaleX: 1, transition: { duration: 2.6, ease: [0.22, 1, 0.36, 1] } },
            }}
          />
  
          {/* Bio */}
          <p
            className={`m-0 whitespace-pre-line text-[#323232] ${HERO_BODY_CLASS}`}
            style={{ ...HERO_BODY_STYLE, width: "100%", maxWidth: "100%" }}
          >
            {founder.bio}
          </p>
  
          {/* ── EDITORIAL LINK SIGNPOST ── */}
          <Link
            href={profileUrl}
            className="group/link mt-6 inline-flex items-center gap-3 text-sm font-semibold tracking-wide text-black uppercase focus:outline-none lg:mt-8"
          >
            <span className="relative">
              Read full story
              <span className="absolute -bottom-1 left-0 h-[1px] w-full origin-left scale-x-0 bg-black transition-transform duration-300 ease-out group-hover/link:scale-x-100" />
            </span>
            <span className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/link:translate-x-1">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 7H13M13 7L7 1M13 7L7 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </Link>
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
   className={`m-0 text-black ${SECTION_HEADING_CLASS}`}
   // Line height matched to WhatWeLookFor section (150%)
   style={{ ...SECTION_HEADING_STYLE, }}
   variants={fadeUp(0)}
   >
            {headingTop}
          </motion.h2>

          {/* <motion.h2
            className={`m-0 text-black ${SECTION_HEADING_CLASS}`}
            style={{
              ...SECTION_HEADING_STYLE,
            }}
            variants={fadeUp(0.15)}
          >
            {headingBottom}
          </motion.h2> */}
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