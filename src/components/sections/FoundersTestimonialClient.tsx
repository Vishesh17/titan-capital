"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useMotionValue, useAnimationFrame } from "framer-motion";

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
    image: "/images/Testimonials/abhiraj-singh-uc.png",
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
        /* Reverse the stagger on the way out so the lines retract in the
           opposite order to how they drew in. */
        hidden: { transition: { staggerChildren: 0.12, staggerDirection: -1 } },
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
            hidden: {
              scaleY: 0,
              transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
            },
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
        /* 30% larger than before (was 15vw / 6.47vw). */
        width: "min(19.5vw, 26.64vh)",
        height: "min(8.41vw, 13.48vh)",
        filter: "grayscale(1)",
      }}
    >
      <Image
        src={cdnImageSrc(item.companyLogo, 240)}
        alt={companyName}
        fill
        sizes="120px"
        style={{ objectFit: "contain", objectPosition: "center" }}
      />
    </div>
  ) : null;

  return (
    <div className="flex flex-col items-center">
      <div
        className="group relative shrink-0 max-md:!w-[42vw] max-md:!h-[52vw] max-md:!aspect-auto"
        style={{
          /* 3.5 cards per screen: card width = (content area minus the
             3 in-between gaps of 3.5 cards) / 3.5. The half card peeks
             from the right edge to hint at the marquee continuing.
             Aspect ratio is unchanged so photos still fill edge-to-edge. */
          width:
            "calc((100vw - 2 * var(--section-px-wide) - 3 * min(1.85vw, 2.86vh)) / 3.5)",
          /* 4:5 → after the top 20% logo band, the bottom 80% photo block
             is a PERFECT SQUARE (= card width). So the 400×400 square
             portfolio photos (uploaded via Sanity) fill it edge-to-edge
             with zero crop and zero letterbox — scaled exactly as they are. */
          aspectRatio: "4 / 5",
          perspective: "1000px",
        }}
      >
        <div
          className="relative h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:[transform:rotateY(180deg)]"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* FRONT — logo band (top 20%) + cutout photo (bottom 80%) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              borderRadius: "12px",
              background: "linear-gradient(180deg, #FBF7F0 0%, #F3E6CF 100%)",
            }}
          >
            {/* Logo band — top 26% of the card (roomier so the larger
                logo never clips), logo centred. */}
            <div
              className="flex items-center justify-center"
              style={{ height: "26%" }}
            >
              {logoContent}
            </div>
            {/* Photo — the bottom 74% of the card, 100% width (no padding).
                Uniform block for every card; `cover` + TOP anchor keeps every
                founder photo the same displayed size AND pins them all to the
                same start (top) and end (block bottom) line, so faces are never
                cropped out of frame regardless of the source photo's aspect
                ratio (e.g. Zouk's taller portrait no longer runs off the top). */}
            <div className="relative" style={{ height: "74%" }}>
              <Image
                src={cdnImageSrc(item.image || "", 800)}
                alt={item.name}
                fill
                sizes="(max-width: 1440px) 33vw, 500px"
                style={{
                  objectFit: "cover",
                  objectPosition: "top center",
                  filter: "grayscale(1)",
                }}
              />
            </div>
          </div>

          {/* BACK — logo band (top 20%) + testimonial text (80%) */}
          <div
            className="absolute inset-0 flex flex-col overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              borderRadius: "12px",
              background: "linear-gradient(180deg, #EFF4FF 0%, #D3E2FF 100%)",
            }}
          >
            {/* Logo band — same 26% as the front so the flip lines up */}
            <div
              className="flex shrink-0 items-center justify-center"
              style={{ height: "26%" }}
            >
              {logoContent}
            </div>
            <div
              className="flex items-start"
              style={{
                height: "74%",
                paddingTop: "min(0.6vw, 0.93vh)",
                paddingBottom: "min(1.85vw, 2.86vh)",
                paddingLeft: "min(1.85vw, 2.86vh)",
                paddingRight: "min(1.85vw, 2.86vh)",
              }}
            >
              <p
                className="m-0 font-['Poppins',_sans-serif] font-normal text-black"
                style={{
                  fontSize: "min(1.32vw, 2.01vh)",
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
      <div className="mt-[min(1.16vw,1.79vh)] flex flex-col items-center text-center max-md:!mt-[8px]">
        <p
          className="m-0 font-['Poppins',_sans-serif] font-semibold text-black max-md:!text-[14px]"
          style={{ fontSize: "min(1.62vw, 2.51vh)", lineHeight: "130%" }}
        >
          {item.name}
        </p>
        <p
          className="m-0 mt-[min(0.29vw,0.45vh)] font-['Poppins',_sans-serif] font-normal text-black max-md:!text-[11px]"
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
      className="overflow-hidden"
      style={{
        /* The visible marquee window = the site's content area (same
           gutters as every other section), so exactly 3 cards show. */
        marginLeft: "var(--section-px-wide)",
        marginRight: "var(--section-px-wide)",
      }}
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
  /* once:false so the lines retract when scrolled back up and redraw on
     the way down again. */
  const bottomInView = useInView(bottomRef, { once: false, amount: 0.15 });

  return (
    <section
      className="relative w-full"
      style={{
        background: "#FBF7F0",
        borderTopLeftRadius: "min(4.44vw, 7.30vh)",
        borderTopRightRadius: "min(4.44vw, 7.30vh)",
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
          className="m-0 text-center font-['Poppins',_sans-serif] font-semibold text-black max-md:!text-[32px] max-md:!leading-[120%] max-md:!px-[24px]"
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
          {topHeading}
        </motion.h2>

        {/* Draggable marquee */}
        <Marquee testimonials={testimonials} />
      </div>

      {/* ══════════ CREAM BOTTOM — "You Build the Vision" + CTA ══════════ */}
      <div
        ref={bottomRef}
        className="relative z-10 flex w-full flex-col items-center justify-center"
        style={{
          gap: "min(3.24vw, 5.01vh)",
          paddingLeft: "var(--section-px-wide)",
          paddingRight: "var(--section-px-wide)",
          paddingTop: "min(8.68vw, 13.43vh)" /* ~150 px @ ref — bigger block */,
          paddingBottom: "min(8.68vw, 13.43vh)",
        }}
      >
        <motion.div
          className="flex flex-col items-center justify-center text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2
            className="m-0 text-center font-['Poppins',_sans-serif] font-semibold text-black max-md:!text-[32px]"
            style={{
              fontSize: "min(4.51vw, 6.98vh)" /* 78 px @ ref — bigger */,
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
            You Build the{" "}
            <span className="relative inline-block px-[8px] max-md:!px-[4px]">
              <motion.span
                aria-hidden="true"
                className="absolute inset-0"
                style={{ background: "#D3E2FF", transformOrigin: "left" }}
                variants={{
                  hidden: { scaleX: 0 },
                  visible: {
                    scaleX: 1,
                    transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.75 },
                  },
                }}
              />
              <span className="relative">Vision.</span>
            </span>
          </motion.h2>
          <motion.h2
            className="m-0 mt-[min(0.58vw,0.90vh)] text-center font-['Poppins',_sans-serif] font-semibold text-black max-md:!text-[32px]"
            style={{
              fontSize: "min(4.51vw, 6.98vh)" /* 78 px @ ref — bigger */,
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
            {bottomHeadingSecond}
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
        height: "min(4.4vw, 6.8vh)" /* ~76 px @ ref — bigger */,
        padding: "0 min(3.24vw, 5.01vh)",
        fontSize: "min(1.5vw, 2.32vh)" /* ~26 px @ ref */,
        borderRadius: "min(2.2vw, 3.4vh)",
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
