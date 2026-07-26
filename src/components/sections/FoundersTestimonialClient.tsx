"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useMotionValue, useAnimationFrame } from "framer-motion";

export interface TestimonialItem {
  name: string;
  role: string;
  image: string;
  text: string;
  companyLogo?: string;
  companyName?: string;
  longText?: boolean;
  imageScaleFactor?: number;
  imagePositionX?: number;
  imagePositionY?: number;
}

export interface FoundersTestimonialData {
  topHeadingFirst?: string;
  topHeadingSecond?: string;
  bottomHeadingFirst?: string;
  bottomHeadingSecond?: string;
  ctaLabel?: string;
  testimonials?: TestimonialItem[];
}

const FALLBACK_TESTIMONIALS: TestimonialItem[] = [
  {
    name: "Abhiraj Bahl",
    role: "Cofounder, Urban Company",
    companyName: "Urban Company",
    image: "/images/herosection/Abhiraj Singh Urban Company 1 (2).png",
    text: "\u201CKunal and Rohit were the first investors to believe in Urban Company, even before we launched the platform or decided on the name. Their unwavering support has been a constant throughout our journey, guiding us through ups and downs. As Founders, we deeply value their mentorship and friendship.\u201D",
    imageScaleFactor: 1.15,
    imagePositionX: -12,
    imagePositionY: 0,
  },
  {
    name: "Disha Singh",
    role: "Cofounder, Zouk",
    companyName: "Zouk",
    image: "/images/herosection/Rectangle 22.png",
    text: "\u201CTitan Capital has been an invaluable partner in our journey to build Zouk. Kunal and Rohit have consistently provided invaluable guidance on cultivating a long-lasting business with strong brand loyalty.\u201D",
    longText: true,
    imageScaleFactor: 1.2,
    imagePositionX: 10,
    imagePositionY: 35,
  },
  {
    name: "Rishabh Goel",
    role: "Cofounder, Credgenics",
    companyName: "Credgenics",
    image: "/images/herosection/Rishabh 2.png",
    text: "\u201CTitan Capital has been more than just an investor for Credgenics \u2014 they\u2019ve been our first partner in this journey. Our early conversations made it clear that they weren\u2019t your typical investors.\u201D",
    longText: true,
    imageScaleFactor: 1.3,
    imagePositionX: 10,
    imagePositionY: -20,
  },
  {
    name: "Raghu Ravinutala",
    role: "Cofounder, Yellow.ai",
    companyName: "Yellow.ai",
    image: "/images/herosection/Raghu-Ravinutala 1.png",
    text: "\u201CTitan Capital is truly \u2018founder only\u2019. From the first interaction, I was overwhelmed with their focus on making the founder successful beyond anything.\u201D",
    imageScaleFactor: 1.1,
    imagePositionX: -10,
    imagePositionY: -5,
  },
  {
    name: "Aarti Gill",
    role: "Cofounder, OZiva",
    companyName: "OZiva",
    image: "/images/herosection/Aarti Gill 2.png",
    text: "\u201CWhen I first met Kunal, I wasn\u2019t even considering raising equity capital \u2014 but that one conversation completely changed my perspective. Partnering with Titan Capital was one of the best decisions we made at OZiva.\u201D",
    imageScaleFactor: 1.3,
    imagePositionX: -30,
    imagePositionY: 5,
  },
  {
    name: "Anand Yadav",
    role: "Cofounder, Mekr",
    companyName: "Mekr",
    image: "/images/herosection/image 177.png",
    text: "\u201CTitan Capital was among the first to believe in what we were building at Mekr and backed us when it mattered most. Their founder-first mindset makes them the kind of partner every founder hopes to have.\u201D",
    imageScaleFactor: 1.2,
    imagePositionX: -20,
    imagePositionY: 40,
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

// FIXED: Adjust gap dynamically on mobile so 4 to 5 vertical lines appear across the screen
function computeLinePositions(): number[] {
  if (typeof window === "undefined") return [];
  const w = window.innerWidth;
  const isMobile = w < 768;
  const gap = isMobile ? 65 : 200; // Smaller gap on mobile yields 4-5 lines
  const count = Math.max(isMobile ? 5 : 2, Math.round(w / gap));
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
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
      initial="hidden"
      animate={active ? "visible" : "hidden"}
      variants={{
        hidden: { transition: { staggerChildren: 0.12, staggerDirection: -1 } },
        visible: { transition: { staggerChildren: 0.18 } },
      }}
    >
      {positions.map((x, i) => (
        <motion.div
          key={i}
          className="absolute top-0"
          style={{ left: `${x}px`, width: 1, height: "100%", background: "#D8D8D8", transformOrigin: "top" }}
          variants={{
            hidden: { scaleY: 0, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } },
            visible: { scaleY: 1, transition: { duration: 2.6, ease: [0.22, 1, 0.36, 1] } },
          }}
        />
      ))}
    </motion.div>
  );
}

function FlipCard({ item }: { item: TestimonialItem }) {
  const companyName = deriveCompanyName(item);
  const [isFlipped, setIsFlipped] = useState(false);

  const logoContent = item.companyLogo ? (
    <div
      className="relative"
      style={{
        width: "min(19.5vw, 26.64vh)", height: "min(8.41vw, 13.48vh)", filter: "grayscale(1)",
      }}
    >
      <Image src={cdnImageSrc(item.companyLogo, 240)} alt={companyName} fill sizes="120px" style={{ objectFit: "contain", objectPosition: "center" }} className="max-md:!scale-[1.8]" />
    </div>
  ) : null;

  return (
    <div className="flex flex-col items-center">
      <div
        className="group relative shrink-0 max-md:!w-[clamp(240px,70vw,280px)] max-md:!aspect-[4/5] cursor-pointer"
        style={{
          width: "calc((100vw - 2 * var(--section-px-wide) - 3 * min(1.85vw, 2.86vh)) / 3.5)",
          aspectRatio: "4 / 5",
          perspective: "1000px",
        }}
        onClick={() => setIsFlipped(!isFlipped)}
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
      >
        <div
          className="relative h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ 
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
          }}
        >
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", borderRadius: "2px",
              background: "linear-gradient(180deg, #FBF7F0 0%, #F3E6CF 100%)",
            }}
          >
            <div className="flex items-center justify-center" style={{ height: "26%" }}>
              {logoContent}
            </div>
            <div className="relative" style={{ height: "74%", overflow: "hidden" }}>
              <div
                className="absolute inset-0"
                style={{
                  transform: `translate(${item.imagePositionX ?? 0}px, ${item.imagePositionY ?? 0}px) scale(${item.imageScaleFactor ?? 1})`,
                  transformOrigin: "center center",
                }}
              >
                {/* @ts-ignore */}
                <img src={cdnImageSrc(item.image || "", 800)} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "scale-down", filter: "grayscale(1)" }} />
              </div>
            </div>
          </div>

          <div
            className="absolute inset-0 flex flex-col overflow-hidden"
            style={{
              backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)",
              borderRadius: "2px", background: "linear-gradient(180deg, #EFF4FF 0%, #D3E2FF 100%)",
            }}
          >
            <div className="flex shrink-0 items-center justify-center" style={{ height: "26%" }}>
              {logoContent}
            </div>
            <div
              className="flex items-start max-md:!p-[16px]"
              style={{
                height: "74%", paddingTop: "min(0.6vw, 0.93vh)", paddingBottom: "min(1.85vw, 2.86vh)",
                paddingLeft: "min(1.85vw, 2.86vh)", paddingRight: "min(1.85vw, 2.86vh)",
              }}
            >
              <p
                className="m-0 font-['Poppins',_sans-serif] font-normal text-black max-md:!text-[13px] max-md:!leading-[1.6]"
                style={{ fontSize: "min(1.20vw, 1.80vh)", lineHeight: "150%" }}
              >
                {item.text}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-[min(1.16vw,1.79vh)] flex flex-col items-center text-center max-md:!mt-[16px]">
        <p
          className="m-0 font-['Poppins',_sans-serif] font-semibold text-black max-md:!text-[16px]"
          style={{ fontSize: "min(1.62vw, 2.51vh)", lineHeight: "130%" }}
        >
          {item.name}
        </p>
        <p
          className="m-0 mt-[min(0.29vw,0.45vh)] font-['Poppins',_sans-serif] font-normal text-black max-md:!text-[12px]"
          style={{ fontSize: "min(0.93vw, 1.43vh)", lineHeight: "150%" }}
        >
          {item.role}
        </p>
      </div>
    </div>
  );
}

function Marquee({ testimonials }: { testimonials: TestimonialItem[] }) {
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const speed = 1.2; 

  useEffect(() => {
    if (containerRef.current) {
      setContentWidth(containerRef.current.scrollWidth / 3);
    }
  }, [testimonials.length]);

  useAnimationFrame(() => {
    if (isDragging || isHovered) return;
    const current = x.get();
    const next = current - speed;
    if (contentWidth > 0) {
      if (next <= -contentWidth) {
        x.set(next + contentWidth);
      } else if (next > 0) {
        x.set(next - contentWidth);
      } else {
        x.set(next);
      }
    }
  });

  return (
    <div
      className="overflow-hidden"
      style={{ marginLeft: "var(--section-px-wide)", marginRight: "var(--section-px-wide)" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        ref={containerRef}
        className="flex cursor-grab active:cursor-grabbing max-md:!gap-[24px]"
        style={{ x, gap: "min(1.85vw, 2.86vh)" }}
        drag="x"
        dragConstraints={{ left: -Infinity, right: Infinity }}
        dragElastic={0}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => {
          setIsDragging(false);
          if (contentWidth > 0) {
            const current = x.get();
            let newPos = current % contentWidth;
            if (newPos > 0) newPos -= contentWidth;
            x.set(newPos);
          }
        }}
      >
        {[...testimonials, ...testimonials, ...testimonials].map((item, i) => (
          <FlipCard key={`${item.name}-${i}`} item={item} />
        ))}
      </motion.div>
    </div>
  );
}

export default function FoundersTestimonialClient({
  data,
}: {
  data?: FoundersTestimonialData | null;
}) {
  const topHeading = (data?.topHeadingFirst || FALLBACK_TOP_FIRST) + (data?.topHeadingSecond ? ` ${data.topHeadingSecond}` : "");
  const bottomHeadingSecond = data?.bottomHeadingSecond || FALLBACK_BOTTOM_SECOND;
  const ctaLabel = data?.ctaLabel || FALLBACK_CTA;
  const testimonials = data?.testimonials && data.testimonials.length > 0 ? data.testimonials : FALLBACK_TESTIMONIALS;

  const bottomRef = useRef<HTMLDivElement>(null);
  const bottomInView = useInView(bottomRef, { once: false, amount: 0.15 });

  return (
    <section
      className="relative w-full overflow-hidden"
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
        className="relative z-10 mx-auto flex w-full flex-col max-md:!mt-0 max-md:!pt-[40px]"
        style={{
          background: "#FFF", borderRadius: "min(6.66vw, 10.30vh)",
          marginTop: "min(-6.66vw, -10.30vh)", paddingTop: "min(5.79vw, 8.95vh)", paddingBottom: "min(3.47vw, 5.37vh)",
        }}
      >
        <motion.h2
          className="m-20 flex-col text-center font-['Poppins',_sans-serif] font-semibold text-black max-md:!text-[clamp(24px,7vw,28px)] max-md:!mx-0 max-md:!mt-0 max-md:!mb-[40px] max-md:!leading-[120%] max-md:!px-[16px]"
          style={{
            fontSize: "min(4.51vw, 6.98vh)", lineHeight: "120%",
            paddingLeft: "var(--section-px-wide)", paddingRight: "var(--section-px-wide)", marginBottom: "min(3.47vw, 5.37vh)",
          }}
          initial={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
        >
          {topHeading}
        </motion.h2>

        <Marquee testimonials={testimonials} />
      </div>

      {/* ══════════ CREAM BOTTOM — "You Build the Vision" + CTA ══════════ */}
      {/* FIXED: Increased vertical padding and minimum height to expand the mobile layout drastically */}
      <div
        ref={bottomRef}
        className="relative z-10 flex w-full flex-col items-center justify-center max-md:!gap-[56px] max-md:!py-[120px] max-md:!min-h-[70vh]"
        style={{
          gap: "min(3.24vw, 5.01vh)", paddingLeft: "var(--section-px-wide)", paddingRight: "var(--section-px-wide)",
          paddingTop: "min(8.68vw, 13.43vh)", paddingBottom: "min(8.68vw, 13.43vh)",
        }}
      >
        <motion.div className="flex flex-col items-center justify-center text-center max-md:!w-full" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
          {/* FIXED: Removed whitespace-nowrap and max-width added on mobile so it breaks into 3-4 clean lines */}
          <motion.h2
            className="m-0 text-center font-['Poppins',_sans-serif] font-semibold text-black max-md:!text-[50px] max-md:!leading-[125%] max-md:!max-w-[280px]"
            style={{ fontSize: "min(4.51vw, 6.98vh)", lineHeight: "130%" }}
            variants={{ hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } }}
          >
            You Build the{" "}
            <span className="relative inline-block px-[8px] max-md:!px-[4px]">
              <motion.span
                aria-hidden="true"
                className="absolute inset-0"
                style={{ background: "#D3E2FF", transformOrigin: "left" }}
                variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.8 } } }}
              />
              <TypingText text="Vision." delay={1.4} />
            </span>
          </motion.h2>
          <motion.h2
            className="m-0 mt-[min(0.58vw,0.90vh)] text-center font-['Poppins',_sans-serif] font-semibold text-black max-md:!text-[50px] max-md:!leading-[125%] max-md:!max-w-[340px] max-md:!mt-[8px]"
            style={{ fontSize: "min(4.51vw, 6.98vh)", lineHeight: "130%" }}
            variants={{ hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 } } }}
          >
            {bottomHeadingSecond}
          </motion.h2>
        </motion.div>

        <CursorFillButtonTestimonial href="/getinvestment" label={ctaLabel} />
      </div>
    </section>
  );
}

function TypingText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayedText, setDisplayedText] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let index = 0;
    let timeoutId: NodeJS.Timeout;
    
    const typeNext = () => {
      if (index <= text.length) {
        setDisplayedText(text.slice(0, index));
        index++;
        timeoutId = setTimeout(typeNext, 150); 
      } else {
        timeoutId = setTimeout(() => {
          index = 0;
          setDisplayedText("");
          timeoutId = setTimeout(typeNext, 150);
        }, 2000);
      }
    };
    
    timeoutId = setTimeout(typeNext, 150);
    return () => clearTimeout(timeoutId);
  }, [started, text]);

  return (
    <span className="relative inline-block">
      <span className="relative">{displayedText}</span>
    </span>
  );
}

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
      className="relative flex shrink-0 items-center justify-center overflow-hidden font-['Poppins',_sans-serif] font-medium leading-[107%] transition-colors duration-300 max-md:!w-[clamp(160px,45vw,220px)] max-md:!h-[clamp(44px,6dvh,50px)] max-md:!text-[clamp(14px,3.5vw,16px)] max-md:!rounded-[25px] max-md:!px-0"
      style={{
        background: hovered ? "#FFF" : "#001A4D",
        height: "min(4.4vw, 6.8vh)", padding: "0 min(3.24vw, 5.01vh)", fontSize: "min(1.5vw, 2.32vh)",
        borderRadius: "min(2.2vw, 3.4vh)", color: hovered ? "#001A4D" : "#FFF",
      }}
    >
      <span
        className="absolute inset-0 transition-transform duration-400 ease-out"
        style={{
          background: "#FFF", transformOrigin: origin, transform: hovered ? "scale(1)" : "scale(0)", borderRadius: "inherit",
        }}
      />
      <span className="relative z-10">{label}</span>
    </Link>
  );
}