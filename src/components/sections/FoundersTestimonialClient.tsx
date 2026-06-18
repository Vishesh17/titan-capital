"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

/* ─────────────────────────────────────────────────────────
   Types shared with the server wrapper (FoundersTestimonial.tsx)
   ───────────────────────────────────────────────────────── */
export interface TestimonialItem {
  name: string;
  role: string;
  image: string;
  text: string;
  longText?: boolean;
}

export interface FoundersTestimonialData {
  topHeadingFirst?: string;
  topHeadingSecond?: string;
  bottomHeadingFirst?: string;
  bottomHeadingSecond?: string;
  ctaLabel?: string;
  testimonials?: TestimonialItem[];
}

/* ─────────────────────────────────────────────────────────
   Fallback defaults — keep the page rendering exactly as today
   if Sanity returns null or fields are missing.
   ───────────────────────────────────────────────────────── */
const FALLBACK_TESTIMONIALS: TestimonialItem[] = [
  {
    name: "Abhiraj Bahl",
    role: "Cofounder, Urban Company",
    image: "/images/hero_founders_images/abhiraj_bahl.png",
    text: "”Kunal and Rohit were the first investors to believe in Urban Company, even before we launched the platform or decided on the name. Their unwavering support has been a constant throughout our journey, guiding us through ups and downs. As Founders, we deeply value their mentorship and friendship. An early-stage company couldn’t ask for better partners than Titan Capital.”",
  },
  {
    name: "Disha Singh",
    role: "Cofounder, Zouk",
    image: "/images/Testimonials/disha-singh.avif",
    text: "”Titan Capital has been an invaluable partner in our journey to build Zouk. Kunal and Rohit have consistently provided invaluable guidance on cultivating a long-lasting business with strong brand loyalty. Their counsel has been instrumental in guiding our focus on critical areas such as efficient working capital management, deep category penetration, and developing a sustainable competitive advantage.”",
    longText: true,
  },
  {
    name: "Rishabh Goel",
    role: "Cofounder, Credgenics",
    image: "/images/Testimonials/Rishabh.jpeg",
    text: "“Titan Capital has been more than just an investor for Credgenics - they’ve been our first partner in this journey. Our early conversations made it clear that they weren’t your typical investors. Despite us venturing into a relatively complex and niche segment of debt collections, they backed us with insights and shared perspectives that reshaped how we approached the key challenges.”",
    longText: true,
  },
  {
    name: "Raghu Ravinutala",
    role: "Cofounder, Yellow.ai",
    image: "/images/Testimonials/Raghu-Ravinutala.webp",
    text: "“Titan Capital is truly ‘founder only’. From the first interaction, I was very overwhelmed with their focus on making the founder successful beyond anything. They were always there as a great sounding board whenever we had to make critical decisions. I always felt Titan Capital had our back whatever is the situation and that’s a great support an early-stage founder can have.”",
  },
  {
    name: "Aarti Gill",
    role: "Cofounder, OZiva",
    image: "/images/Testimonials/Aarti Gill.png",
    text: "“When I first met Kunal, I wasn’t even considering raising equity capital - but that one conversation completely changed my perspective. Partnering with Titan Capital was one of the best decisions we made at OZiva. With Kunal’s guidance, I learned not just business strategies like fundraising, negotiation, and stakeholder management, but also invaluable life lessons.”",
  },
  {
    name: "Anand Yadav",
    role: "Cofounder, Mekr",
    image: "/images/Testimonials/Anand_yadav.png",
    text: "“Titan Capital was among the first to believe in what we were building at Mekr and backed us when it mattered most. Since then, they have gone beyond capital - offering strategic guidance, opening doors through their network, and supporting us through every stage of our journey. Their founder-first mindset makes them the kind of partner every founder hopes to have by their side.”",
  },
];

const FALLBACK_TOP_FIRST = "What Our";
const FALLBACK_TOP_SECOND = "Founders Say";
const FALLBACK_BOTTOM_FIRST = "We're Listening.";
const FALLBACK_BOTTOM_SECOND = "Tell Us What You're Building.";
const FALLBACK_CTA = "Get Investment";

/* Append Sanity CDN transform params for served images. Local /images/...
   URLs pass through unchanged so the fallback path keeps working. */
function cdnImageSrc(url: string, width: number): string {
  if (url.startsWith("https://cdn.sanity.io/")) {
    return `${url}?w=${width}&auto=format&q=85`;
  }
  return url;
}

function TestimonialCard({ item }: { item: TestimonialItem }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="relative shrink-0 max-md:!w-[calc(50vw-24px)] max-md:!h-[240px] max-md:!snap-start"
      style={{
        width:  "clamp(200px, min(21.62vw, 31.72vh), 311.424px)",
        height: "clamp(238px, min(25.74vw, 37.75vh), 370.703px)",
        perspective: "1000px",
      }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="relative h-full w-full cursor-pointer"
        style={{
          transformStyle: "preserve-3d",
          WebkitTransformStyle: "preserve-3d",
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* ── FRONT: Photo + gradient + name ── */}
        <div
          className="absolute inset-0 flex h-full w-full flex-col justify-end overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "translateZ(0)",
            borderRadius: "clamp(8px, min(0.83vw, 1.22vh), 12px)",
          }}
        >
          <Image
            src={cdnImageSrc(item.image || "", 640)}
            alt={item.name}
            fill
            sizes="(max-width: 1440px) 22vw, 311px"
            className="object-cover"
          />
          <div
            className="absolute inset-0 z-[5]"
            style={{
              background: "linear-gradient(180deg, rgba(217, 217, 217, 0.00) 0.05%, #000 99.95%)",
              backgroundBlendMode: "multiply",
            }}
          />
          <div
            className="relative z-10 flex flex-col drop-shadow-md max-md:!p-[10px]"
            style={{ padding: "clamp(12px, min(1.66vw, 2.44vh), 24px)" }}
          >
            <p
              className="m-0 font-['Libre_Baskerville',_serif] font-bold text-white max-md:!text-[13px] max-md:!leading-[1.2]"
              style={{ fontSize: "clamp(14px, min(1.38vw, 2.04vh), 20px)" }}
            >
              {item.name}
            </p>
            <p
              className="m-0 mt-1 font-['Poppins',_sans-serif] font-light text-white max-md:!text-[7px]"
              style={{ fontSize: "clamp(10px, min(0.89vw, 1.22vh), 13px)" }}
            >
              {item.role}
            </p>
          </div>
        </div>

        {/* ── BACK: Quote text ── */}
        <div
          className="absolute inset-0 flex h-full w-full flex-col justify-between overflow-hidden bg-[#C8DBFF] shadow-lg max-md:!p-[10px] max-md:overflow-y-auto max-md:[&::-webkit-scrollbar]:hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg) translateZ(1px)",
            borderRadius: "clamp(8px, min(0.83vw, 1.22vh), 12px)",
            padding: "clamp(12px, min(1.66vw, 2.44vh), 24px)",
          }}
        >
          <p
            className={`m-0 font-['Inter',_sans-serif] font-medium leading-[1.6] text-[#001A4D] max-md:!leading-[1.4] ${item.longText ? "max-md:!text-[9px]" : "max-md:!text-[9px]"}`}
            style={{ fontSize: item.longText ? "clamp(9px, min(0.89vw, 1.35vh), 12px)" : "clamp(9px, min(0.92vw, 1.4vh), 12px)" }}
          >
            {item.text}
          </p>
          <div className="flex flex-col pt-3">
            <p
              className="m-0 font-['Libre_Baskerville',_serif] font-bold text-[#001A4D] max-md:!text-[11px]"
              style={{ fontSize: "clamp(12px, min(1.25vw, 1.83vh), 18px)" }}
            >
              {item.name}
            </p>
            <p
              className="m-0 mt-1 font-['Poppins',_sans-serif] font-medium text-[#001A4D] max-md:!text-[9px]"
              style={{ fontSize: "clamp(9px, min(0.83vw, 1.22vh), 12px)" }}
            >
              {item.role}
            </p>
          </div>
        </div>

      </motion.div>
    </div>
  );
}

export default function FoundersTestimonialClient({
  data,
}: {
  data?: FoundersTestimonialData | null;
}) {
  const topHeadingFirst = data?.topHeadingFirst || FALLBACK_TOP_FIRST;
  const topHeadingSecond = data?.topHeadingSecond || FALLBACK_TOP_SECOND;
  const bottomHeadingFirst = data?.bottomHeadingFirst || FALLBACK_BOTTOM_FIRST;
  const bottomHeadingSecond = data?.bottomHeadingSecond || FALLBACK_BOTTOM_SECOND;
  const ctaLabel = data?.ctaLabel || FALLBACK_CTA;
  const testimonials =
    data?.testimonials && data.testimonials.length > 0
      ? data.testimonials
      : FALLBACK_TESTIMONIALS;

  const [translateX, setTranslateX] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const getCardStep = (): number => {
    if (!trackRef.current) return 300;
    const cards = trackRef.current.children;
    if (cards.length < 2) return 300;
    const r0 = (cards[0] as HTMLElement).getBoundingClientRect();
    const r1 = (cards[1] as HTMLElement).getBoundingClientRect();
    return r1.left - r0.left;
  };

  const getMaxScroll = (): number => {
    if (!trackRef.current || !containerRef.current) return 0;
    return Math.max(0, trackRef.current.scrollWidth - containerRef.current.clientWidth);
  };

  useEffect(() => {
    const onResize = () => {
      setTranslateX((prev) => {
        const max = getMaxScroll();
        return Math.min(prev, max);
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const nextSlide = () => {
    const step = getCardStep();
    const max = getMaxScroll();
    setTranslateX((prev) => Math.min(prev + step, max));
  };

  const prevSlide = () => {
    const step = getCardStep();
    setTranslateX((prev) => Math.max(prev - step, 0));
  };

  const isAtStart = translateX <= 0;
  const maxScroll = getMaxScroll();
  const isAtEnd = maxScroll > 0 && translateX >= maxScroll;

  const t1: Variants = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };
  const t2: Variants = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay: 0.6 } } };
  const hl: Variants = { hidden: { scaleX: 0 }, visible: { scaleX: 1, transition: { duration: 0.5, ease: "easeInOut", delay: 1.1 } } };

  return (
    <section
      ref={sectionRef}
      className="flex flex-col overflow-hidden bg-white"
      style={{ paddingTop: "clamp(40px, min(6.94vw, 10.18vh), 100px)" }}
    >

      {/* ── Header row: title + arrows ── */}
      <div
        className="mx-auto flex w-full max-w-[1440px] flex-col items-start justify-between gap-6 md:flex-row md:items-end max-md:!gap-4"
        style={{
          paddingLeft:   "var(--section-px-wide)",
          paddingRight:  "var(--section-px-wide)",
          marginBottom:  "clamp(24px, min(4.44vw, 6.52vh), 64px)",
        }}
      >
        <motion.div
          className="flex flex-col items-start max-md:!w-full max-md:!gap-2"
          style={{
            width: "clamp(250px, min(29.79vw, 43.69vh), 429px)",
            gap:   "clamp(2px, min(0.27vw, 0.41vh), 4px)",
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2
            className="m-0 font-['Libre_Baskerville',_serif] text-[#001A4D] max-md:!text-[28px]"
            style={{
              fontSize:   "var(--heading-xl)",
              fontWeight: 600,
              fontStyle:  "normal",
              lineHeight: "120%",
            }}
            variants={t1}
          >
            {topHeadingFirst}
          </motion.h2>

          <motion.h2
            className="m-0 font-['Libre_Baskerville',_serif] text-[#001A4D] max-md:!text-[28px]"
            style={{
              fontSize:   "var(--heading-xl)",
              fontWeight: 700,
              fontStyle:  "italic",
              lineHeight: "120%",
            }}
            variants={t2}
          >
            <span className="relative inline-block overflow-hidden px-2 max-md:!px-[4px]" style={{ background: "transparent" }}>
              <motion.span
                className="absolute inset-0 z-0 bg-[#D3E2FF]"
                style={{ transformOrigin: "left" }}
                variants={hl}
              />
              <span className="relative z-10">{topHeadingSecond}</span>
            </span>
          </motion.h2>
        </motion.div>

        <div className="flex items-center max-md:!hidden" style={{ gap: "clamp(12px, min(1.11vw, 1.63vh), 16px)", marginBottom: "clamp(8px, min(0.97vw, 1.43vh), 14px)" }}>
          <button
            onClick={prevSlide}
            disabled={isAtStart}
            className={`group relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border-none transition ${
              isAtStart ? "bg-[#E5EEFF] opacity-50 cursor-not-allowed" : "bg-[#D3E2FF] cursor-pointer"
            }`}
            style={{
              width:  "clamp(48px, min(5.35vw, 7.84vh), 77px)",
              height: "clamp(48px, min(5.35vw, 7.84vh), 77px)",
            }}
            aria-label="Previous slide"
            onMouseMove={(e) => {
              if (isAtStart) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
              e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100"
              style={{
                background: 'radial-gradient(circle 40px at var(--mouse-x, 50%) var(--mouse-y, 50%), #FFFFFF 0%, transparent 100%)'
              }}
            />
            <svg className="relative z-10" xmlns="http://www.w3.org/2000/svg" style={{ width: "60%", height: "60%" }} viewBox="0 0 59 59" fill="none">
              <path d="M27.1151 20.9695C27.2962 20.8007 27.4415 20.5972 27.5423 20.371C27.6431 20.1448 27.6973 19.9007 27.7016 19.6531C27.706 19.4056 27.6605 19.1597 27.5677 18.9301C27.475 18.7005 27.337 18.492 27.1619 18.3169C26.9868 18.1418 26.7783 18.0038 26.5487 17.911C26.3191 17.8183 26.0732 17.7728 25.8256 17.7771C25.5781 17.7815 25.3339 17.8357 25.1078 17.9365C24.8816 18.0372 24.6781 18.1825 24.5093 18.3637L14.6759 28.197C14.3307 28.5427 14.1367 29.0113 14.1367 29.4999C14.1367 29.9885 14.3307 30.4571 14.6759 30.8028L24.5093 40.6362C24.6781 40.8173 24.8816 40.9626 25.1078 41.0634C25.3339 41.1642 25.5781 41.2183 25.8256 41.2227C26.0732 41.2271 26.3191 41.1815 26.5487 41.0888C26.7783 40.9961 26.9868 40.8581 27.1619 40.683C27.337 40.5079 27.475 40.2994 27.5677 40.0698C27.6605 39.8402 27.706 39.5943 27.7016 39.3467C27.6973 39.0992 27.6431 38.855 27.5423 38.6289C27.4415 38.4027 27.2962 38.1991 27.1151 38.0303L20.4284 31.3437H44.2497C44.7387 31.3437 45.2076 31.1494 45.5534 30.8037C45.8992 30.4579 46.0934 29.9889 46.0934 29.4999C46.0934 29.0109 45.8992 28.542 45.5534 28.1962C45.2076 27.8504 44.7387 27.6562 44.2497 27.6562H20.4284L27.1151 20.9695Z" fill="black"/>
            </svg>
          </button>

          <button
            onClick={nextSlide}
            disabled={isAtEnd}
            className={`group relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border-none transition ${
              isAtEnd ? "bg-[#E5EEFF] opacity-50 cursor-not-allowed" : "bg-[#D3E2FF] cursor-pointer"
            }`}
            style={{
              width:  "clamp(48px, min(5.35vw, 7.84vh), 77px)",
              height: "clamp(48px, min(5.35vw, 7.84vh), 77px)",
            }}
            aria-label="Next slide"
            onMouseMove={(e) => {
              if (isAtEnd) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
              e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100"
              style={{
                background: 'radial-gradient(circle 40px at var(--mouse-x, 50%) var(--mouse-y, 50%), #FFFFFF 0%, transparent 100%)'
              }}
            />
            <svg className="relative z-10" xmlns="http://www.w3.org/2000/svg" style={{ width: "60%", height: "60%", transform: "rotate(180deg)" }} viewBox="0 0 59 59" fill="none">
              <path d="M27.1151 20.9695C27.2962 20.8007 27.4415 20.5972 27.5423 20.371C27.6431 20.1448 27.6973 19.9007 27.7016 19.6531C27.706 19.4056 27.6605 19.1597 27.5677 18.9301C27.475 18.7005 27.337 18.492 27.1619 18.3169C26.9868 18.1418 26.7783 18.0038 26.5487 17.911C26.3191 17.8183 26.0732 17.7728 25.8256 17.7771C25.5781 17.7815 25.3339 17.8357 25.1078 17.9365C24.8816 18.0372 24.6781 18.1825 24.5093 18.3637L14.6759 28.197C14.3307 28.5427 14.1367 29.0113 14.1367 29.4999C14.1367 29.9885 14.3307 30.4571 14.6759 30.8028L24.5093 40.6362C24.6781 40.8173 24.8816 40.9626 25.1078 41.0634C25.3339 41.1642 25.5781 41.2183 25.8256 41.2227C26.0732 41.2271 26.3191 41.1815 26.5487 41.0888C26.7783 40.9961 26.9868 40.8581 27.1619 40.683C27.337 40.5079 27.475 40.2994 27.5677 40.0698C27.6605 39.8402 27.706 39.5943 27.7016 39.3467C27.6973 39.0992 27.6431 38.855 27.5423 38.6289C27.4415 38.4027 27.2962 38.1991 27.1151 38.0303L20.4284 31.3437H44.2497C44.7387 31.3437 45.2076 31.1494 45.5534 30.8037C45.8992 30.4579 46.0934 29.9889 46.0934 29.4999C46.0934 29.0109 45.8992 28.542 45.5534 28.1962C45.2076 27.8504 44.7387 27.6562 44.2497 27.6562H20.4284L27.1151 20.9695Z" fill="black"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Carousel track ── */}
      <div
        ref={containerRef}
        className="mx-auto w-full max-w-[1440px] overflow-visible px-[var(--section-px-wide)] max-md:!px-0"
        style={{
          paddingBottom: "clamp(24px, min(2.77vw, 4.07vh), 40px)",
        }}
      >
        <motion.div
          ref={trackRef}
          className="flex w-max max-md:!grid max-md:!grid-rows-1 max-md:!grid-flow-col max-md:!w-full max-md:!overflow-x-auto max-md:!snap-x max-md:!snap-mandatory max-md:!transform-none max-md:!px-[var(--section-px-wide)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          style={{ gap: "clamp(16px, min(1.66vw, 2.44vh), 24px)" }}
          animate={{ x: -translateX }}
          transition={{ type: "spring", stiffness: 180, damping: 28 }}
        >
          {testimonials.map((item, i) => (
            <TestimonialCard key={`${item.name}-${i}`} item={item} />
          ))}
          <div className="shrink-0 max-md:!hidden" style={{ width: "clamp(20px, min(2.77vw, 4.07vh), 40px)" }} aria-hidden />
        </motion.div>
      </div>

      {/* ── "We're listening" section ── */}
      <div
        className="flex w-full flex-col items-center justify-center"
        style={{
          marginTop:       "clamp(24px, min(3.33vw, 4.89vh), 48px)",
          gap:             "clamp(20px, min(2.77vw, 4.07vh), 40px)",
          borderRadius:    "0",
          background:      "#FBF7F0",
          backgroundImage: [
            "linear-gradient(to right, rgba(0,0,0,0.045) 1px, transparent 1px)",
            "linear-gradient(to bottom, rgba(0,0,0,0.045) 1px, transparent 1px)",
            "linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px)",
            "linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)",
          ].join(", "),
          backgroundSize:     "40px 40px",
          backgroundPosition: "0 0, 0 0, 1px 1px, 1px 1px",
          paddingLeft:     "var(--section-px-wide)",
          paddingRight:    "var(--section-px-wide)",
          paddingTop:      "clamp(40px, min(6.66vw, 9.77vh), 96px)",
          paddingBottom:   "clamp(40px, min(6.66vw, 9.77vh), 96px)",
        }}
      >
        <motion.div
          className="flex flex-col items-center justify-center text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2
            className="m-0 text-center font-['Libre_Baskerville',_serif] font-bold italic leading-[1.19] text-[#001A4D] max-md:!text-[28px]"
            style={{ fontSize: "var(--heading-xl)" }}
            variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}
          >
            <span className="relative inline-block overflow-hidden px-2" style={{ background: "transparent" }}>
              <motion.span
                className="absolute inset-0 z-0 bg-[#D3E2FF]"
                style={{ transformOrigin: "left" }}
                variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1, transition: { duration: 0.5, ease: "easeInOut", delay: 0.6 } } }}
              />
              <span className="relative z-10">{bottomHeadingFirst}</span>
            </span>
          </motion.h2>

          <motion.h2
            className="m-0 mt-2 w-full text-center font-['Libre_Baskerville',_serif] font-bold leading-[1.19] text-[#001A4D] max-md:!text-[28px] max-md:!mt-1"
            style={{
              fontSize: "var(--heading-xl)",
              maxWidth: "clamp(350px, min(48.54vw, 71.18vh), 699px)",
            }}
            variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay: 1.1 } } }}
          >
            {bottomHeadingSecond}
          </motion.h2>
        </motion.div>

        <Link
          href="/getinvestment"
          className="group relative m-0 flex shrink-0 items-center justify-center gap-[10px] overflow-hidden bg-[#001A4D] font-['Libre_Baskerville',_serif] font-semibold leading-[107%] text-[#F5F0E8] transition-all"
          style={{
            height:       "clamp(56px, min(5vw, 7vh), 75px)",
            width:        "clamp(224px, min(21.5vw, 31.5vh), 310px)",
            fontSize:     "clamp(16px, min(1.5vw, 2.2vh), 22px)",
            borderRadius: "clamp(9px, min(0.8vw, 1.2vh), 12px)",
            padding:      "clamp(8px, 1vw, 14px)",
          }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
            e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100"
            style={{
              background: 'radial-gradient(circle 80px at var(--mouse-x, 50%) var(--mouse-y, 50%), #003CB3 0%, transparent 100%)'
            }}
          />
          <span className="relative z-10">{ctaLabel}</span>
        </Link>
      </div>
    </section>
  );
}
