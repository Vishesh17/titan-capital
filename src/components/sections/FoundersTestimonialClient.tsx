"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useMotionValue, useAnimationFrame } from "framer-motion";
import TypewriterText from "@/components/ui/TypewriterText";

/* ─────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────── */
export interface TestimonialItem {
  name: string;
  role: string;
  image: string;
  text: string;
  companyLogo?: string;
  companyName?: string;
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
   Fallback defaults
   ───────────────────────────────────────────────────────── */
const FALLBACK_TESTIMONIALS: TestimonialItem[] = [
  {
    name: "Abhiraj Bahl",
    role: "Cofounder, Urban Company",
    companyName: "Urban Company",
    image: "/images/hero_founders_images/abhiraj_bahl.png",
    text: "\u201CKunal and Rohit were the first investors to believe in Urban Company, even before we launched the platform or decided on the name. Their unwavering support has been a constant throughout our journey, guiding us through ups and downs. As Founders, we deeply value their mentorship and friendship.\u201D",
  },
  {
    name: "Disha Singh",
    role: "Cofounder, Zouk",
    companyName: "Zouk",
    image: "/images/Testimonials/disha-singh.avif",
    text: "\u201CTitan Capital has been an invaluable partner in our journey to build Zouk. Kunal and Rohit have consistently provided invaluable guidance on cultivating a long-lasting business with strong brand loyalty.\u201D",
    longText: true,
  },
  {
    name: "Rishabh Goel",
    role: "Cofounder, Credgenics",
    companyName: "Credgenics",
    image: "/images/Testimonials/Rishabh.jpeg",
    text: "\u201CTitan Capital has been more than just an investor for Credgenics \u2014 they\u2019ve been our first partner in this journey. Our early conversations made it clear that they weren\u2019t your typical investors.\u201D",
    longText: true,
  },
  {
    name: "Raghu Ravinutala",
    role: "Cofounder, Yellow.ai",
    companyName: "Yellow.ai",
    image: "/images/Testimonials/Raghu-Ravinutala.webp",
    text: "\u201CTitan Capital is truly \u2018founder only\u2019. From the first interaction, I was overwhelmed with their focus on making the founder successful beyond anything.\u201D",
  },
  {
    name: "Aarti Gill",
    role: "Cofounder, OZiva",
    companyName: "OZiva",
    image: "/images/Testimonials/Aarti Gill.png",
    text: "\u201CWhen I first met Kunal, I wasn\u2019t even considering raising equity capital \u2014 but that one conversation completely changed my perspective. Partnering with Titan Capital was one of the best decisions we made at OZiva.\u201D",
  },
  {
    name: "Anand Yadav",
    role: "Cofounder, Mekr",
    companyName: "Mekr",
    image: "/images/Testimonials/Anand_yadav.png",
    text: "\u201CTitan Capital was among the first to believe in what we were building at Mekr and backed us when it mattered most. Their founder-first mindset makes them the kind of partner every founder hopes to have.\u201D",
  },
];

const FALLBACK_TOP_FIRST = "What Our Founders Say";
const FALLBACK_TOP_SECOND = "";
const FALLBACK_BOTTOM_FIRST = "You Build the Vision.";
const FALLBACK_BOTTOM_SECOND = "We Help You Scale It.";
const FALLBACK_CTA = "Get Investment";

function cdnImageSrc(url: string, width: number): string {
  if (url.startsWith("https://cdn.sanity.io/")) {
    return `${url}?w=${width}&auto=format&q=85`;
  }
  return url;
}

function deriveCompanyName(item: TestimonialItem): string {
  if (item.companyName) return item.companyName;
  const parts = item.role.split(",");
  return parts.length > 1 ? parts.slice(1).join(",").trim() : item.role;
}

/* ─────────────────────────────────────────────────────────
   VerticalLines
   ───────────────────────────────────────────────────────── */
function computeLinePositions(): number[] {
  const w = window.innerWidth;
  const gap = 200;
  const count = Math.max(2, Math.round(w / gap));
  const spread = (count - 1) * gap;
  const startX = (w - spread) / 2;
  return Array.from({ length: count }, (_, i) => startX + i * gap);
}

function VerticalLines({ active }: { active: boolean }) {
  const [positions, setPositions] = useState<number[]>([]);

  useEffect(() => {
    setPositions(computeLinePositions());
    const onResize = () => setPositions(computeLinePositions());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
      initial="hidden"
      animate={active ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.18 } },
      }}
    >
      {positions.map((x, i) => (
        <motion.div
          key={i}
          className="absolute top-0"
          style={{
            left: `${x}px`,
            width: 1,
            height: "100%",
            background: "#D8D8D8",
            transformOrigin: "top",
          }}
          variants={{
            hidden: { scaleY: 0 },
            visible: {
              scaleY: 1,
              transition: { duration: 2.6, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        />
      ))}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   FlipCard — shows photo by default, flips to text on hover.
   ───────────────────────────────────────────────────────── */
function FlipCard({ item }: { item: TestimonialItem }) {
  const companyName = deriveCompanyName(item);

  const logoContent = item.companyLogo ? (
    <div
      className="relative"
      style={{
        width: "min(10vw, 15.49vh)",
        height: "min(3.47vw, 5.37vh)",
        filter: "grayscale(1)",
      }}
    >
      <Image
        src={cdnImageSrc(item.companyLogo, 240)}
        alt={companyName}
        fill
        sizes="120px"
        style={{ objectFit: "contain", objectPosition: "left" }}
      />
    </div>
  ) : null;

  return (
    <div className="flex flex-col items-center">
      <div
        className="group relative shrink-0"
        style={{
          width: "min(23.67vw, 36.62vh)",
          height: "min(28.36vw, 43.87vh)",
          perspective: "1000px",
        }}
      >
        <div
          className="relative h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:[transform:rotateY(180deg)]"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* FRONT — photo */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              borderRadius: "min(0.93vw, 1.43vh)",
              background: "#FBF7F0",
            }}
          >
            {/* Logo strip */}
            <div
              className="absolute z-10 flex items-center"
              style={{
                top: "min(1.16vw, 1.79vh)",
                left: "min(1.16vw, 1.79vh)",
              }}
            >
              {logoContent}
            </div>
            <Image
              src={cdnImageSrc(item.image || "", 800)}
              alt={item.name}
              fill
              sizes="(max-width: 1440px) 24vw, 410px"
              style={{
                objectFit: "cover",
                objectPosition: "center 20%",
                filter: "grayscale(1)",
              }}
            />
          </div>

          {/* BACK — text */}
          <div
            className="absolute inset-0 flex flex-col overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              borderRadius: "min(0.93vw, 1.43vh)",
              background: "#DBE1F5",
            }}
          >
            {/* Logo strip */}
            <div
              className="absolute z-10 flex items-center"
              style={{
                top: "min(1.16vw, 1.79vh)",
                left: "min(1.16vw, 1.79vh)",
              }}
            >
              {logoContent}
            </div>
            <div
              className="flex flex-1 items-center"
              style={{
                paddingTop: "min(6.36vw, 9.85vh)",
                paddingBottom: "min(1.85vw, 2.86vh)",
                paddingLeft: "min(1.85vw, 2.86vh)",
                paddingRight: "min(1.85vw, 2.86vh)",
              }}
            >
              <p
                className="m-0 font-['Poppins',_sans-serif] font-normal text-black"
                style={{
                  fontSize: "min(1.04vw, 1.61vh)",
                  lineHeight: "150%",
                }}
              >
                {item.text}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Name + role below card */}
      <div className="mt-[min(1.16vw,1.79vh)] flex flex-col items-center text-center">
        <p
          className="m-0 font-['Poppins',_sans-serif] font-semibold text-black"
          style={{ fontSize: "min(1.62vw, 2.51vh)", lineHeight: "130%" }}
        >
          {item.name}
        </p>
        <p
          className="m-0 mt-[min(0.29vw,0.45vh)] font-['Poppins',_sans-serif] font-normal text-black"
          style={{ fontSize: "min(0.93vw, 1.43vh)", lineHeight: "150%" }}
        >
          {item.role}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Marquee — infinite scroll, draggable, pauses on hover.
   ───────────────────────────────────────────────────────── */
function Marquee({ testimonials }: { testimonials: TestimonialItem[] }) {
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const speed = 1.2; // px per frame

  useEffect(() => {
    if (containerRef.current) {
      // Width of one set of cards
      setContentWidth(containerRef.current.scrollWidth / 3);
    }
  }, [testimonials.length]);

  // Auto-scroll animation frame
  useAnimationFrame(() => {
    if (isDragging || isHovered) return;
    const current = x.get();
    const next = current - speed;
    // Loop: when we've scrolled one full set, reset
    if (contentWidth > 0 && Math.abs(next) >= contentWidth) {
      x.set(next + contentWidth);
    } else {
      x.set(next);
    }
  });

  return (
    <div
      className="w-full overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        ref={containerRef}
        className="flex cursor-grab active:cursor-grabbing"
        style={{
          x,
          gap: "min(1.85vw, 2.86vh)",
        }}
        drag="x"
        dragConstraints={{ left: -(contentWidth || 0), right: 0 }}
        dragElastic={0.1}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => {
          setIsDragging(false);
          // Wrap position after drag
          if (contentWidth > 0) {
            const current = x.get();
            if (Math.abs(current) >= contentWidth) {
              x.set(current % contentWidth);
            }
            if (current > 0) {
              x.set(current - contentWidth);
            }
          }
        }}
      >
        {/* Render 3 copies for seamless loop */}
        {[...testimonials, ...testimonials, ...testimonials].map((item, i) => (
          <FlipCard key={`${item.name}-${i}`} item={item} />
        ))}
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main component
   ───────────────────────────────────────────────────────── */
export default function FoundersTestimonialClient({
  data,
}: {
  data?: FoundersTestimonialData | null;
}) {
  const topHeading =
    (data?.topHeadingFirst || FALLBACK_TOP_FIRST) +
    (data?.topHeadingSecond ? ` ${data.topHeadingSecond}` : "");
  const bottomHeadingSecond =
    data?.bottomHeadingSecond || FALLBACK_BOTTOM_SECOND;
  const ctaLabel = data?.ctaLabel || FALLBACK_CTA;
  const testimonials =
    data?.testimonials && data.testimonials.length > 0
      ? data.testimonials
      : FALLBACK_TESTIMONIALS;

  const bottomRef = useRef<HTMLDivElement>(null);
  const bottomInView = useInView(bottomRef, { once: true, amount: 0.15 });

  return (
    <section
      className="relative w-full"
      style={{
        background: "#FBF7F0",
        borderTopLeftRadius: "min(6.66vw, 10.30vh)",
        borderTopRightRadius: "min(6.66vw, 10.30vh)",
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        zIndex: 20,
      }}
    >
      <VerticalLines active={bottomInView} />

      {/* ══════════ WHITE PILL — heading + marquee ══════════ */}
      <div
        className="relative z-10 mx-auto flex w-full flex-col"
        style={{
          background: "#FFF",
          borderRadius: "min(6.66vw, 10.30vh)",
          marginTop: "min(-6.66vw, -10.30vh)",
          paddingTop: "min(5.79vw, 8.95vh)",
          paddingBottom: "min(3.47vw, 5.37vh)",
        }}
      >
        {/* Heading */}
        <motion.h2
          className="m-0 text-center font-['Poppins',_sans-serif] font-normal text-black max-md:!text-[36px] max-md:!px-[24px]"
          style={{
            fontSize: "min(4.51vw, 6.98vh)",
            lineHeight: "120%",
            paddingLeft: "var(--section-px-wide)",
            paddingRight: "var(--section-px-wide)",
            marginBottom: "min(3.47vw, 5.37vh)",
          }}
          initial={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
        >
          <TypewriterText text={topHeading} />
        </motion.h2>

        {/* Draggable marquee */}
        <Marquee testimonials={testimonials} />
      </div>

      {/* ══════════ CREAM BOTTOM — "You Build the Vision" + CTA ══════════ */}
      <div
        ref={bottomRef}
        className="relative z-10 flex w-full flex-col items-center justify-center"
        style={{
          gap: "min(2.31vw, 3.58vh)",
          paddingLeft: "var(--section-px-wide)",
          paddingRight: "var(--section-px-wide)",
          paddingTop: "min(5.79vw, 8.95vh)",
          paddingBottom: "min(5.79vw, 8.95vh)",
        }}
      >
        <motion.div
          className="flex flex-col items-center justify-center text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2
            className="m-0 text-center font-['Poppins',_sans-serif] font-normal text-black max-md:!text-[28px]"
            style={{
              fontSize: "min(3.24vw, 5.01vh)",
              lineHeight: "130%",
            }}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
              },
            }}
          >
            <TypewriterText text="You Build the" />{" "}
            <span
              className="relative inline-block px-[8px] max-md:!px-[4px]"
              style={{ background: "#D3E2FF" }}
            >
              <TypewriterText text="Vision." delay={0.5} />
            </span>
          </motion.h2>
          <motion.h2
            className="m-0 mt-[min(0.58vw,0.90vh)] text-center font-['Poppins',_sans-serif] font-normal text-black max-md:!text-[28px]"
            style={{
              fontSize: "min(3.24vw, 5.01vh)",
              lineHeight: "130%",
            }}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.15,
                },
              },
            }}
          >
            <TypewriterText text={bottomHeadingSecond} delay={0.7} />
          </motion.h2>
        </motion.div>

        <CursorFillButtonTestimonial href="/getinvestment" label={ctaLabel} />
      </div>
    </section>
  );
}

/* ─── Cursor-origin fill button (navy pill → white fill, text turns navy) ─── */
function CursorFillButtonTestimonial({ href, label }: { href: string; label: string }) {
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
      className="relative flex shrink-0 items-center justify-center overflow-hidden font-['Poppins',_sans-serif] font-medium leading-[107%] transition-colors duration-300"
      style={{
        background: hovered ? "#FFF" : "#001A4D",
        height: "min(3.41vw, 5.28vh)",
        padding: "0 min(2.31vw, 3.58vh)",
        fontSize: "min(1.16vw, 1.79vh)",
        borderRadius: "min(1.70vw, 2.64vh)",
        color: hovered ? "#001A4D" : "#FFF",
      }}
    >
      <span
        className="absolute inset-0 transition-transform duration-400 ease-out"
        style={{
          background: "#FFF",
          transformOrigin: origin,
          transform: hovered ? "scale(1)" : "scale(0)",
          borderRadius: "inherit",
        }}
      />
      <span className="relative z-10">{label}</span>
    </Link>
  );
}
