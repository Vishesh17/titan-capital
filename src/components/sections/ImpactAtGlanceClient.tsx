"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, type MotionValue, useSpring } from "framer-motion";

/* ─────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────── */
export interface ImpactStat {
  num: string;
  label: string;
  caption?: string;
}

export interface FounderStory {
  name: string;
  role: string;
  image: string;
  logo: string;
  logoScale?: number;
  text: string;
}

export interface ImpactAtGlanceData {
  impactHeadingFirst?: string;
  impactHeadingSecond?: string;
  storiesHeadingFirst?: string;
  storiesHeadingSecond?: string;
  ctaLabel?: string;
  impactStats?: ImpactStat[];
  founderStories?: FounderStory[];
}

const FALLBACK_IMPACT_DATA: ImpactStat[] = [
  { num: "300+", label: "Startup Backed" },
  { num: "7",    label: "Unicorns $1B+" },
  { num: "4",    label: "IPOs 2023-2026" },
  { num: "15",   label: "Years Investing" },
  { num: "40+",  label: "Values > $100M" },
  { num: "250M+", label: "Lives Impacted" },
];

const FALLBACK_SLIDES: FounderStory[] = [
  {
    name: "Ashish Mohapatra",
    role: "Co-Founder & CEO, Ofbusiness",
    image: "/images/misc/5.webp",
    logo: "/images/logos/Ofbusiness.png",
    text: `"Building anything meaningful demands everything you have. It's never easy, but it's always worth it."`,
  },
  {
    name: "Abhishek Bansal",
    role: "Co-Founder and CEO, Shadowfax",
    image: "/images/misc/6.webp",
    logo: "/images/logos/Shadowfax.svg",
    text: `"In India, logistics isn't just about speed. It's about reaching the right place even when the address is wrong."`,
  },
  {
    name: "Harshil Mathur",
    role: "Co-founder and CEO of Razorpay",
    image: "/images/misc/3.webp",
    logo: "/images/logos/Razorpay-logo.webp",
    text: `"The vision was never just to be a payment gateway. It was to be the financial nervous system for a business."`,
  },
];

const FALLBACK_IMPACT_HEADING_FIRST = "Impact";
const FALLBACK_IMPACT_HEADING_SECOND = "At A Glance";
const FALLBACK_STORIES_HEADING_FIRST = "Their Stories,";
const FALLBACK_STORIES_HEADING_SECOND = "Our Credentials";
const FALLBACK_CTA_LABEL = "See More";

const STORY_GAP = "calc(var(--section-px-wide) * 0.4)";
const BORDER_PADDING = "calc(var(--section-px-wide) * 0.2)";

const IMPACT_CELL_PADDING = "calc(var(--section-px-wide) * 0.01)";
const IMPACT_COL_GAP = "calc(var(--section-px-wide) * 1.4)";
const IMPACT_ROW_GAP = "calc(var(--section-px-wide) * 1.2)";

function cdnImageSrc(url: string, width: number): string {
  if (url.startsWith("https://cdn.sanity.io/")) {
    return `${url}?w=${width}&auto=format&q=85`;
  }
  return url;
}

const parseStat = (val: string) => {
  const match = val.match(/^([^0-9]*)([0-9]+)([^0-9]*)$/);
  if (match) {
    return { prefix: match[1], numberStr: match[2], suffix: match[3] };
  }
  return { prefix: "", numberStr: val, suffix: "" };
};

function RollingNumber({ value }: { value: string }) {
  const { prefix, numberStr, suffix } = parseStat(value);
  const rollDuration = numberStr.length === 1 ? 3.8 : 2.6;
  const digitStagger = 0.22;

  const digitVariants = {
    hidden: { y: "0%" },
    visible: (custom: { num: number; index: number }) => ({
      y: `-${(10 + custom.num) * 5}%`,
      transition: {
        duration: rollDuration,
        delay: custom.index * digitStagger,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    }),
  };

  return (
    <span className="inline-flex flex-row items-center leading-none tabular-nums justify-start">
      {prefix && <span>{prefix}</span>}
      <span className="inline-flex flex-row">
        {numberStr.split("").map((digit, i) => {
          const num = parseInt(digit, 10);
          const column = Array.from({ length: 20 }, (_, idx) => idx % 10);
          return (
            <span
              key={i}
              className="relative inline-flex flex-col overflow-hidden items-center"
              style={{ height: "1.2em", width: "0.62em" }}
            >
              <motion.span
                variants={digitVariants}
                custom={{ num, index: i }}
                className="flex flex-col"
              >
                {column.map((n, idx) => (
                  <span
                    key={idx}
                    className="flex items-center justify-center leading-none"
                    style={{ height: "1.2em" }}
                  >
                    {n}
                  </span>
                ))}
              </motion.span>
            </span>
          );
        })}
      </span>
      {suffix && <span>{suffix}</span>}
    </span>
  );
}

function ImpactStatCell({
  stat,
  lineScale,
}: {
  stat: ImpactStat;
  lineScale: MotionValue<number>;
}) {
  return (
    <motion.div
      className="flex flex-row items-stretch justify-start max-md:!gap-[12px] max-md:!pl-0 max-md:w-full"
      style={{ gap: "min(1.85vw, 2.86vh)", paddingLeft: IMPACT_CELL_PADDING }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      <motion.div
        className="shrink-0 bg-black max-md:!h-full max-md:!min-h-[80px]"
        style={{
          width: "1px",
          height: "min(13.89vw, 21.49vh)",
          scaleY: lineScale,
          transformOrigin: "top",
        }}
      />
      <div className="flex flex-col items-start text-left justify-center">
        <span
          className="font-['Poppins',_sans-serif] font-normal capitalize text-black max-md:!text-[36px] max-md:!leading-[105%]"
          style={{ fontSize: "min(6.48vw, 10.03vh)", lineHeight: "150%" }}
        >
          <RollingNumber value={stat.num} />
        </span>
        <span
          className="whitespace-nowrap font-['Poppins',_sans-serif] font-normal capitalize text-black max-md:!text-[14px] max-md:!leading-[125%] max-md:!mt-[6px]"
          style={{
            fontSize: "min(2.55vw, 3.94vh)",
            lineHeight: "120%",
            marginTop: "min(1.16vw, 1.79vh)",
          }}
        >
          {stat.label.replace(/\n/g, ' ')} 
        </span>
      </div>
    </motion.div>
  );
}

function deriveCompany(story: FounderStory): string {
  const role = story.role || "";
  if (role.includes(",")) return role.split(",").pop()!.trim();
  const m = role.match(/\bof\s+(.+)$/i);
  if (m) return m[1].trim();
  return story.name;
}

function QuoteMarkIcon() {
  return (
    <svg viewBox="0 0 42 33" fill="none" aria-hidden style={{ width: "min(2.43vw, 3.76vh)", height: "min(1.91vw, 2.95vh)" }}>
      <path d="M24.5946 22.5385C24.5946 15.948 26.7387 9.90141 31.027 4.3987C33.7387 1.07148 35.9144 -0.368185 37.5541 0.0797102C39.0676 0.655575 39.8243 1.51937 39.8243 2.6711C39.8243 3.75885 39.3198 4.91058 38.3108 6.12629C37.3649 7.34201 36.6081 8.33378 36.0405 9.1016C35.473 9.86942 35 10.7012 34.6216 11.597C33.7387 13.3886 33.2973 15.5641 33.2973 18.1235C34.8108 17.6756 36.3243 17.8675 37.8378 18.6994C40.6126 20.299 42 22.3465 42 24.8419C42 27.2733 41.2432 29.2569 39.7297 30.7925C38.2793 32.2642 36.2613 33 33.6757 33C31.0901 33 28.9144 32.0082 27.1486 30.0247C25.4459 27.9772 24.5946 25.4818 24.5946 22.5385ZM0 22.5385C0 15.6921 2.11261 9.64547 6.33784 4.3987C9.55405 0.495613 12.2342 -0.68811 14.3784 0.84753C14.8198 1.16746 15.0405 1.67934 15.0405 2.38317C15.0405 3.66287 14.5676 4.91058 13.6216 6.12629C12.7387 7.34201 12.0135 8.33378 11.4459 9.1016C10.8784 9.86942 10.4054 10.7012 10.027 11.597C9.14414 13.3886 8.7027 15.5641 8.7027 18.1235C10.2162 17.6756 11.6982 17.8675 13.1486 18.6994C15.8604 20.299 17.2162 22.3465 17.2162 24.8419C17.2162 27.2733 16.491 29.2569 15.0405 30.7925C13.5901 32.2642 11.5721 33 8.98649 33C6.4009 33 4.25676 32.0082 2.55405 30.0247C0.851351 27.9772 0 25.4818 0 22.5385Z" fill="white" />
    </svg>
  );
}

function StoryArrow() {
  return (
    <svg viewBox="0 0 37 37" fill="none" aria-hidden style={{ width: "min(2.14vw, 3.31vh)", height: "min(2.14vw, 3.31vh)" }}>
      <path d="M0.585786 33.5858C-0.195262 34.3668 -0.195262 35.6332 0.585786 36.4142C1.36683 37.1953 2.63317 37.1953 3.41421 36.4142L2 35L0.585786 33.5858ZM37 2C37 0.89543 36.1046 0 35 0H17C15.8954 0 15 0.89543 15 2C15 3.10457 15.8954 4 17 4H33V20C33 21.1046 33.8954 22 35 22C36.1046 22 37 21.1046 37 20V2ZM2 35L3.41421 36.4142L36.4142 3.41421L35 2L33.5858 0.585786L0.585786 33.5858L2 35Z" fill="black" />
    </svg>
  );
}

function CardLogo({ story, company, origin }: { story: FounderStory; company: string; origin: "left bottom" | "right bottom"; }) {
  if (!story.logo) {
    return (
      <span className="whitespace-nowrap font-['Poppins',_sans-serif] font-semibold uppercase text-white max-md:!text-[18px]" style={{ fontSize: "min(1.85vw, 2.86vh)", lineHeight: "155%" }}>
        {company}
      </span>
    );
  }
  return (
    <img
      src={cdnImageSrc(story.logo, 400)}
      alt={company}
      className="object-contain"
      style={{
        height: "min(5.09vw, 7.88vh)", 
        width: "auto", 
        objectPosition: origin, 
        filter: "brightness(0) invert(1)",
        transform: `scale(${story.logoScale ?? 1})`,
        transformOrigin: origin,
        display: "block",
        margin: 0,
      }}
    />
  );
}

function StoryCard({ story }: { story: FounderStory }) {
  const [hovered, setHovered] = useState(false);
  const company = deriveCompany(story);

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative w-full cursor-pointer overflow-hidden"
      style={{ borderRadius: "2px", aspectRatio: "1 / 1" }}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.4 } },
      }}
    >
      <Image
        src={cdnImageSrc(story.image, 900)}
        alt={story.name}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover object-top transition-transform duration-700 scale-[1.03] group-hover:scale-[1.08]"
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(21, 21, 21, 0.00) 0%, rgba(21, 21, 21, 0.82) 82%)" }} aria-hidden />

      <motion.div
        className="absolute z-10"
        style={{ top: "min(1.85vw, 2.86vh)", right: "min(1.85vw, 2.86vh)" }}
        initial={false}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <StoryArrow />
      </motion.div>

      <motion.div
        className="pointer-events-none absolute z-10"
        style={{ left: "min(1.85vw, 2.86vh)", bottom: 0, transform: "translateY(25px)" }}
        initial={false}
        animate={{ opacity: hovered ? 0 : 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <CardLogo story={story} company={company} origin="left bottom" />
      </motion.div>

      <motion.div
        className="absolute bottom-0 left-0 right-0 z-10 flex flex-col items-start text-white"
        style={{ padding: "min(1.85vw, 2.86vh)" }}
        initial={false}
        animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 14 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <CardLogo story={story} company={company} origin="left bottom" />
        
        <div style={{ paddingTop: 0, marginTop: "-28px" }}>
          <QuoteMarkIcon />
          <p
            className="m-0 font-['Poppins',_sans-serif] font-medium text-white max-md:!text-[14px]"
            style={{ fontSize: "min(1.39vw, 2.15vh)", lineHeight: "150%", maxWidth: "min(33.22vw, 51.39vh)", marginTop: "min(0.70vw, 1.07vh)" }}
          >
            {story.text}
          </p>
          <p
            className="m-0 font-['Poppins',_sans-serif] font-medium text-white max-md:!text-[11px]"
            style={{ fontSize: "min(0.81vw, 1.25vh)", lineHeight: "150%", marginTop: "min(0.93vw, 1.43vh)" }}
          >
            — {story.name}, {story.role}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SeeMoreButton({ label, onClick }: { label: string; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative cursor-pointer overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] max-md:!h-[40px] ${
        hovered ? "bg-white border-[#575757] max-md:!w-[160px]" : "bg-transparent border-transparent max-md:!w-[40px]"
      }`}
      style={{
        width: hovered ? "min(12.15vw, 18.8vh)" : "min(3.36vw, 5.19vh)",
        height: "min(3.36vw, 5.19vh)",
        borderRadius: 999,
        borderWidth: 1,
        borderStyle: "solid",
        boxSizing: "border-box",
      }}
      aria-label={label}
    >
      <motion.span
        className="pointer-events-none absolute -translate-y-1/2 whitespace-nowrap font-['Poppins',_sans-serif] font-normal text-black max-md:!text-[13px]"
        style={{ left: "min(1.5vw, 2.5vh)", top: "50%", fontSize: "min(1.16vw,1.79vh)", lineHeight: "100%" }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: hovered ? 0.28 : 0.15, delay: hovered ? 0.15 : 0, ease: [0.22, 1, 0.36, 1] }}
      >
        {label}
      </motion.span>
      <div
        className="absolute -translate-y-1/2 flex items-center justify-center rounded-full bg-[#001A4D]"
        style={{ right: 4, top: "50%", height: "calc(100% - 8px)", aspectRatio: "1 / 1" }}
      >
        <motion.svg className="w-[45%] h-[45%]" viewBox="0 0 24 24" fill="none" animate={{ rotate: hovered ? 0 : 45 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          <path d="M7 17L17 7M17 7H7M17 7V17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </div>
    </motion.button>
  );
}

function padStories(stories: FounderStory[], count: number): FounderStory[] {
  if (stories.length >= count) return stories.slice(0, count);
  const result: FounderStory[] = [];
  for (let i = 0; i < count; i++) {
    result.push(stories[i % stories.length]);
  }
  return result;
}

function StoriesSection({
  storiesHeadingFirst,
  storiesHeadingSecond,
  ctaLabel,
  slides,
}: {
  storiesHeadingFirst: string;
  storiesHeadingSecond: string;
  ctaLabel: string;
  slides: FounderStory[];
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const lineProgress = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const smoothLineProgress = useSpring(lineProgress, { stiffness: 40, damping: 25 });
  const vRuleScale = smoothLineProgress;
  const hRuleScale = smoothLineProgress;

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{
        background: "#FFF",
        borderRadius: "min(4.44vw, 7.30vh)",
        marginBottom: "min(-6.66vw, -10.30vh)",
        overflow: "hidden",
        zIndex: 10,
        paddingTop: "min(5.79vw, 8.95vh)",
        paddingBottom: "min(5.79vw, 8.95vh)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <motion.div
        className="mx-auto flex w-full flex-col items-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.18, delayChildren: 0.45 } },
        }}
      >
        {/* STORIES HEADING MARGIN FIXED: Same clamp(32px,6dvh,48px) spacing below heading */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
          }}
          className="flex flex-col items-center max-md:!mb-[clamp(32px,6dvh,48px)]"
          style={{ marginBottom: "min(3.47vw, 5.37vh)" }}
        >
          <h2
            className="m-0 text-center font-['Poppins',_sans-serif] font-semibold text-black max-md:!text-[clamp(24px,7vw,28px)] max-md:!leading-[120%]"
            style={{ fontSize: "min(4.51vw, 6.98vh)", lineHeight: "150%" }}
          >
            {storiesHeadingFirst}
          </h2>
          <h2
            className="m-0 text-center font-['Poppins',_sans-serif] font-semibold text-black max-md:!text-[clamp(24px,7vw,28px)] max-md:!leading-[120%]"
            style={{ fontSize: "min(4.51vw, 6.98vh)", lineHeight: "150%" }}
          >
            {storiesHeadingSecond}
          </h2>
        </motion.div>

        <div 
          className="relative w-full"
          style={{ padding: BORDER_PADDING, "--bp": BORDER_PADDING } as React.CSSProperties}
        >
          <div className="grid w-full grid-cols-3 max-md:!grid-cols-1 max-md:!gap-[24px]" style={{ gap: STORY_GAP }}>
            {padStories(slides, 6).map((story, i) => (
              <StoryCard key={`${story.name}-${i}`} story={story} />
            ))}
          </div>

          <motion.div
            aria-hidden
            className="pointer-events-none absolute max-md:!hidden z-20"
            style={{
              top: "50%",
              left: "var(--bp)",
              width: "calc(50% - var(--bp))",
              height: 0,
              borderTop: "1px solid #000",
              transformOrigin: "left",
              scaleX: hRuleScale,
            }}
          />
        

          <motion.div
            aria-hidden
            className="pointer-events-none absolute max-md:!hidden z-20"
            style={{
              top: "50%",
              right: "var(--bp)",
              width: "calc(50% - var(--bp))",
              height: 0,
              borderTop: "1px solid #000",
              transformOrigin: "right",
              scaleX: hRuleScale,
            }}
          />

          <motion.div
            aria-hidden
            className="pointer-events-none absolute max-md:!hidden z-20"
            style={{ top: "var(--bp)", left: "33.3333%", width: 0, borderLeft: "1px solid #000", height: "calc(100% - 2 * var(--bp))", transformOrigin: "top", scaleY: vRuleScale }}
          />

          <motion.div
            aria-hidden
            className="pointer-events-none absolute max-md:!hidden z-20"
            style={{ top: "var(--bp)", left: "66.6666%", width: 0, borderLeft: "1px solid #000", height: "calc(100% - 2 * var(--bp))", transformOrigin: "top", scaleY: vRuleScale }}
          />
        </div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
          }}
          style={{ marginTop: "min(3.47vw, 5.37vh)" }}
        >
          <SeeMoreButton label={ctaLabel} />
        </motion.div>
      </motion.div>
    </section>
  );
}

export default function ImpactAtGlanceClient({ data }: { data?: ImpactAtGlanceData | null }) {
  const impactHeadingFirst = data?.impactHeadingFirst || FALLBACK_IMPACT_HEADING_FIRST;
  const impactHeadingSecond = data?.impactHeadingSecond || FALLBACK_IMPACT_HEADING_SECOND;
  const storiesHeadingFirst = data?.storiesHeadingFirst || FALLBACK_STORIES_HEADING_FIRST;
  const storiesHeadingSecond = data?.storiesHeadingSecond || FALLBACK_STORIES_HEADING_SECOND;
  const ctaLabel = data?.ctaLabel || FALLBACK_CTA_LABEL;
  const impactData = data?.impactStats && data.impactStats.length > 0 ? data.impactStats : FALLBACK_IMPACT_DATA;
  const slides = data?.founderStories && data.founderStories.length > 0 ? data.founderStories : FALLBACK_SLIDES;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: impactProgress } = useScroll({
    target: wrapperRef,
    offset: ["start 0.8", "start 0.2"],
  });
  
  const lineScale = useSpring(impactProgress, { stiffness: 60, damping: 20 });

  return (
    <div ref={wrapperRef} className="relative w-full bg-[#FBF7F0]">
      <section
        className="relative w-full bg-[#FBF7F0] max-md:!h-auto max-md:!min-h-[100dvh] max-md:!pt-[50px] max-md:!pb-[50px] max-md:!px-0"
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "min(6.66vw, 10.30vh)",
          paddingTop: "min(4.63vw, 7.16vh)",
          paddingBottom: "min(4.63vw, 7.16vh)",
          paddingLeft: "var(--section-px-wide)",
          paddingRight: "var(--section-px-wide)",
          zIndex: 1,
        }}
      >
        <motion.div
          className="mx-auto flex w-full flex-col items-center justify-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
          }}
        >
          {/* IMPACT HEADING MARGIN FIXED: Same clamp(32px,6dvh,48px) spacing below heading */}
          <motion.h2
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
            }}
            className="m-0 text-center font-['Poppins',_sans-serif] font-semibold text-black max-md:!text-[clamp(24px,7vw,28px)] max-md:!leading-[120%] max-md:!mb-[clamp(32px,6dvh,48px)] max-md:whitespace-nowrap"
            style={{
              fontSize: "min(4.51vw, 6.98vh)",
              lineHeight: "150%",
              marginBottom: "min(5.5vw, 10.5vh)",
            }}
          >
            {`${impactHeadingFirst} ${impactHeadingSecond}`}
          </motion.h2>

          <div
            className="grid max-md:!grid-cols-2 max-md:!gap-x-[24px] max-md:!gap-y-[70px] max-md:!w-full max-md:!pl-[24px] max-md:!pr-[16px] max-md:!justify-items-start"
            style={{
              gridTemplateColumns: "repeat(3, 1fr)",
              maxWidth: "85%",
              paddingLeft: IMPACT_CELL_PADDING,
              paddingRight: IMPACT_CELL_PADDING,
              columnGap: IMPACT_COL_GAP,
              rowGap: IMPACT_ROW_GAP,
            }}
          >
            {impactData.map((stat, i) => (
              <ImpactStatCell key={`${stat.num}-${i}`} stat={stat} lineScale={lineScale} />
            ))}
          </div>
        </motion.div>
      </section>

      <div aria-hidden className="h-[50vh] w-full max-md:hidden" />

      <StoriesSection
        storiesHeadingFirst={storiesHeadingFirst}
        storiesHeadingSecond={storiesHeadingSecond}
        ctaLabel={ctaLabel}
        slides={slides}
      />
    </div>
  );
}