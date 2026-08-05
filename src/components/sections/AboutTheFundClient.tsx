"use client";

import { useRef, useEffect } from "react";
import { 
  motion, 
  useMotionValue, 
  useSpring, 
  useTransform 
} from "framer-motion";

/* ─────────────────────────────────────────────────────────
   Container Glow Background (From WhyTitanSeed)
   ───────────────────────────────────────────────────────── */
function ContainerGlow({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const normX = useMotionValue(0);
  const normY = useMotionValue(0);

  const cursorSpring = { damping: 25, stiffness: 250, mass: 0.3 };
  const smoothX = useSpring(mouseX, cursorSpring);
  const smoothY = useSpring(mouseY, cursorSpring);

  const ambientSpring = { damping: 30, stiffness: 70, mass: 1 };
  const smoothNormX = useSpring(normX, ambientSpring);
  const smoothNormY = useSpring(normY, ambientSpring);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      }
      normX.set((e.clientX / window.innerWidth) * 2 - 1);
      normY.set((e.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, normX, normY, containerRef]);

  const leftX = useTransform(smoothNormX, [-1, 1], ["-10%", "10%"]);
  const leftY = useTransform(smoothNormY, [-1, 1], ["-10%", "10%"]);

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          left: "-10%",
          top: "-10%",
          width: "120%",
          height: "120%",
          zIndex: 0,
          x: leftX,
          y: leftY,
          willChange: "transform",
        }}
      >
        <motion.div
          className="w-full h-full rounded-full blur-[40px]"
          style={{
            background:
              "radial-gradient(circle, #5054B5 0%, #054EB6 40%, #022250 80%, transparent 100%)",
            opacity: 0.6,
          }}
          animate={{
            x: ["0%", "35%", "-15%", "25%", "0%"],
            y: ["0%", "25%", "-10%", "35%", "0%"],
            scale: [1, 1.15, 0.85, 1.1, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Cursor tracking blob */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 rounded-full blur-[24px]"
        style={{
          width: "150px",
          height: "150px",
          zIndex: 5,
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: 0.65,
          background:
            "radial-gradient(circle, rgba(150,158,240,0.95) 0%, rgba(70,120,225,0.6) 40%, rgba(5,78,182,0.25) 70%, transparent 100%)",
          willChange: "transform",
        }}
      />
    </>
  );
}

/* ─────────────────────────────────────────────────────────
   Types & Fallbacks
   ───────────────────────────────────────────────────────── */
export interface AboutTheFundData {
  headingFirst?: string;
  headingSecond?: string;
  paragraphs?: string[];
}

const FALLBACK_HEADING_FIRST = "About The";
const FALLBACK_HEADING_SECOND = "Fund";
const FALLBACK_PARAGRAPHS = [
  "We invest in Titan portfolio companies that have demonstrated strong momentum and growth. Having partnered with founders since day one, we continue to support them with capital, strategic guidance, experience, and access to our network. This long-term relationship helps us better understand their needs and provide the right support to accelerate their journey toward lasting success.",
];

/* ─────────────────────────────────────────────────────────
   Main Component
   ───────────────────────────────────────────────────────── */
export default function AboutTheFundClient({
  data,
}: {
  data?: AboutTheFundData | null;
}) {
  const headingFirst = data?.headingFirst || FALLBACK_HEADING_FIRST;
  const headingSecond = data?.headingSecond || FALLBACK_HEADING_SECOND;
  const paragraphs = data?.paragraphs?.length ? data.paragraphs : FALLBACK_PARAGRAPHS;

  const imageContainerRef = useRef<HTMLDivElement>(null);

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" as const, delay },
    }),
  };

  return (
    <section
      className="relative flex w-full flex-col items-center bg-[#FBF7F0] overflow-hidden"
      style={{
        paddingTop: "clamp(60px, min(8vw, 10vh), 120px)",
        paddingBottom: "clamp(60px, min(8vw, 10vh), 120px)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center">
        
        {/* ── CENTERED HEADING ── */}
        <motion.div
          className="mb-[clamp(40px,6vw,80px)] flex w-full flex-col items-center text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.h2
            className="m-0 font-['Poppins',_sans-serif] text-[clamp(32px,4vw,56px)] font-normal capitalize leading-[120%] text-[#000]"
            custom={0}
            variants={fadeUp}
          >
            {headingFirst} {headingSecond}
          </motion.h2>
        </motion.div>

        {/* ── TWO COLUMN CONTENT ── */}
        <div className="flex w-full flex-col lg:flex-row items-center justify-between gap-[clamp(40px,6vw,80px)] relative">
          
          {/* ── LEFT: Paragraph Content ── */}
          <motion.div
            className="w-full lg:w-[50%] flex flex-col gap-[20px]"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {paragraphs.map((text, i) => (
              <motion.p
                key={i}
                className="m-0 font-['Poppins',_sans-serif] font-normal text-[#323232] text-[clamp(16px,1.5vw,22px)] leading-[160%]"
                custom={0.2 + i * 0.1}
                variants={fadeUp}
              >
                {text}
              </motion.p>
            ))}
          </motion.div>

          {/* ── RIGHT: Glowing Image Container Placeholder ── */}
          <motion.div
            className="w-full lg:w-[45%] flex justify-center lg:justify-end"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            custom={0.3}
            variants={fadeUp}
          >
            <div
              ref={imageContainerRef}
              className="w-full overflow-hidden bg-[#00112E] relative"
              style={{
                borderRadius: "2px",
                height: "clamp(260px, 32vw, 480px)",
                maxWidth: "560px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
              }}
            >
              {/* Glowing Background */}
              <ContainerGlow containerRef={imageContainerRef} />

              {/* Placeholder text for image */}
              <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none text-white/30 font-['Poppins',_sans-serif] text-sm">
                Image Container
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}