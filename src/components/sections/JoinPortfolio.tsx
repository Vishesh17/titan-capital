"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/*
  JoinPortfolioCTA — "Want to join our portfolio?"
*/

/* ── Logo type ── */
type Logo = { src: string; alt: string; scaleClass: string };

/* ═══════════════════════════════════════════════════════
   DESKTOP — 3 columns × 6 logos each
   ═══════════════════════════════════════════════════════ */
const DESKTOP_COLUMNS: Logo[][] = [
  [
    { src: "/images/logos/ola.svg", alt: "OLA", scaleClass: "scale-[0.8]" },
    { src: "/images/logos/mamaearthpng-logo.webp", alt: "Mamaearth", scaleClass: "scale-[1.3]" },
    { src: "/images/logos/Bewakoof.svg", alt: "Bewakoof", scaleClass: "" },
    { src: "/images/logos/Credgenics.svg", alt: "Credgenics", scaleClass: "scale-[1]" },
    { src: "/images/logos/zouk_new_logo.webp", alt: "Zouk", scaleClass: "" },
    { src: "/images/logos/GIVA.webp", alt: "GIVA", scaleClass: "scale-[0.8]" },
  ],
  [
    { src: "/images/logos/Razorpay-logo.webp", alt: "Razorpay", scaleClass: "scale-[1.3]" },
    { src: "/images/logos/Shadowfax.svg", alt: "Shadowfax", scaleClass: "scale-[1.2]" },
    { src: "/images/logos/bira-91-logo.webp", alt: "Bira 91", scaleClass: "" },
    { src: "/images/logos/Headout.svg", alt: "Headout", scaleClass: "" },
    { src: "/images/logos/MoEngage.svg", alt: "MoEngage", scaleClass: "" },
    { src: "/images/logos/anveshan.webp", alt: "Anveshan", scaleClass: "" },
  ],
  [
    { src: "/images/logos/Urban Company.webp", alt: "Urban Company", scaleClass: "" },
    { src: "/images/logos/snapdeal-company-1-logo.webp", alt: "Snapdeal", scaleClass: "scale-[1.3]" },
    { src: "/images/logos/Park+.webp", alt: "Park+", scaleClass: "scale-[0.7]" },
    { src: "/images/logos/mitigata-logo.webp", alt: "Mitigata", scaleClass: "" },
    { src: "/images/logos/mekr-logo.webp", alt: "MEKR", scaleClass: "" },
    { src: "/images/logos/bobabhai-logo.webp", alt: "Boba Bhai", scaleClass: "" },
  ],
];

/* ═══════════════════════════════════════════════════════
   MOBILE — 5 columns × 6 logos each (slot machine, not static grid)
   ═══════════════════════════════════════════════════════ */
const MOBILE_COLUMNS: Logo[][] = [
  [
    { src: "/images/logos/ola.svg", alt: "OLA", scaleClass: "scale-[0.7]" },
    { src: "/images/logos/mamaearthpng-logo.webp", alt: "Mamaearth", scaleClass: "scale-[1]" },
    { src: "/images/logos/Bewakoof.svg", alt: "Bewakoof", scaleClass: "" },
    { src: "/images/logos/Credgenics.svg", alt: "Credgenics", scaleClass: "scale-[1.3]" },
    { src: "/images/logos/zouk_new_logo.webp", alt: "Zouk", scaleClass: "scale-[0.8]" },
    { src: "/images/logos/GIVA.webp", alt: "GIVA", scaleClass: "scale-[0.8]" },
  ],
  [
    { src: "/images/logos/Razorpay-logo.webp", alt: "Razorpay", scaleClass: "scale-[1]" },
    { src: "/images/logos/Shadowfax.svg", alt: "Shadowfax", scaleClass: "scale-[1.2]" },
    { src: "/images/logos/bira-91-logo.webp", alt: "Bira 91", scaleClass: "" },
    { src: "/images/logos/Headout.svg", alt: "Headout", scaleClass: "" },
    { src: "/images/logos/MoEngage.svg", alt: "MoEngage", scaleClass: "" },
    { src: "/images/logos/anveshan.webp", alt: "Anveshan", scaleClass: "" },
  ],
  [
    { src: "/images/logos/Urban Company.webp", alt: "Urban Company", scaleClass: "" },
    { src: "/images/logos/snapdeal-company-1-logo.webp", alt: "Snapdeal", scaleClass: "scale-[1.3]" },
    { src: "/images/logos/Park+.webp", alt: "Park+", scaleClass: "scale-[0.7]" },
    { src: "/images/logos/mitigata-logo.webp", alt: "Mitigata", scaleClass: "" },
    { src: "/images/logos/mekr-logo.webp", alt: "MEKR", scaleClass: "" },
    { src: "/images/logos/bobabhai-logo.webp", alt: "Boba Bhai", scaleClass: "" },
  ],
  [
    { src: "/images/logos/Supertails.webp", alt: "Supertails", scaleClass: "" },
    { src: "/images/logos/BECO.webp", alt: "BECO", scaleClass: "" },
    { src: "/images/logos/Simplismart.webp", alt: "Simplismart", scaleClass: "" },
    { src: "/images/logos/invideo.svg", alt: "InVideo", scaleClass: "scale-[0.8]" },
    { src: "/images/logos/RENEE.svg", alt: "Renee", scaleClass: "scale-[0.7]" },
    { src: "/images/logos/Ofbusiness.webp", alt: "Ofbusiness", scaleClass: "" },
  ],
  [
    { src: "/images/logos/homerun1.webp", alt: "Homerun", scaleClass: "" },
    { src: "/images/logos/Cart.com.webp", alt: "Cart.com", scaleClass: "" },
    { src: "/images/logos/unicommerce-logo.svg", alt: "Unicommerce", scaleClass: "" },
    { src: "/images/logos/ola.svg", alt: "OLA", scaleClass: "scale-[0.7]" },
    { src: "/images/logos/Razorpay-logo.webp", alt: "Razorpay", scaleClass: "scale-[1]" },
    { src: "/images/logos/Shadowfax.svg", alt: "Shadowfax", scaleClass: "scale-[1.2]" },
  ],
];

/* ── Keyframes ── */
const SLOT_CSS = `
@keyframes slot-down {
  0%   { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}
@keyframes slot-up {
  0%   { transform: translateY(-50%); }
  100% { transform: translateY(0); }
}
`;

/* ═══════════════════════════════════════════════════════
   SlotColumn
   ═══════════════════════════════════════════════════════ */
function SlotColumn({
  logos,
  reverse,
  cellSize,
  verticalGap,
  duration,
}: {
  logos: Logo[];
  reverse: boolean;
  cellSize: string;
  verticalGap: string;
  duration: number;
}) {
  const renderSet = (keyPrefix: string) =>
    logos.map((logo, i) => (
      <div
        key={`${keyPrefix}-${i}`}
        className="flex shrink-0 items-center justify-center"
        style={{ width: cellSize, height: cellSize }}
      >
        <div
          className={`relative ${logo.scaleClass}`}
          style={{ width: "80%", height: "47%" }}
        >
          <Image
            src={logo.src}
            alt={logo.alt}
            fill
            sizes="120px"
            className="object-contain"
          />
        </div>
      </div>
    ));

  return (
    <div className="overflow-hidden" style={{ height: "100%" }}>
      <div
        className="flex flex-col items-center"
        style={{
          gap: verticalGap,
          animation: `${reverse ? "slot-up" : "slot-down"} ${duration}s linear infinite`,
        }}
      >
        {renderSet("a")}
        {renderSet("b")}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SlotMachineBox
   ═══════════════════════════════════════════════════════ */
function SlotMachineBox({
  columns,
  cellSize,
  height,
  brandSize,
}: {
  columns: Logo[][];
  cellSize: string;
  height: string;
  brandSize: string;
}) {
  return (
    <div
      className="relative flex w-full max-w-[497px] items-center justify-center overflow-hidden rounded-[clamp(8px,0.8vw,12px)]"
      style={{ height, backgroundColor: "#FFF" }}
    >
      {/* UPDATED: justify-between spreads the columns out, and the small padding keeps them off the exact edge */}
      <div
        className="absolute inset-0 z-0 flex flex-row items-center justify-between"
        style={{
          paddingLeft: "clamp(12px, 4%, 32px)", 
          paddingRight: "clamp(12px, 4%, 32px)",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
        }}
      >
        {columns.map((col, colIdx) => (
          <div key={colIdx} className="h-full">
            <SlotColumn
              logos={col}
              reverse={colIdx % 2 === 1}
              cellSize={cellSize}
              verticalGap="clamp(12px, 1.5vw, 24px)" // Vertical spacing between logos in the same strip
              duration={colIdx % 2 === 1 ? 32 : 36}
            />
          </div>
        ))}
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background: `radial-gradient(circle at 50% 50%,
            #D3E2FF 0%,
            #D3E2FF 20%,      /* Solid blue core */
            #FFFFFF 25%,      /* White halo ring */
            rgba(255,255,255,0.9) 32%,
            rgba(255,255,255,0.7) 40%,
            rgba(255,255,255,0.4) 48%,
            rgba(255,255,255,0.1) 58%,
            rgba(255,255,255,0) 65% /* Fully transparent edges */
          )`,
        }}
      />

      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
        <span
          className="font-['Libre_Baskerville',_serif] font-semibold text-[#001A4D]"
          style={{ fontSize: brandSize }}
        >
          Titan Capital
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Spotlight hover button
   ═══════════════════════════════════════════════════════ */
function SpotlightButton({ wide = false }: { wide?: boolean }) {
  return (
    <button
      className="group relative flex shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-[9px] border-none bg-[#001A4D] font-['Libre_Baskerville',_serif] font-semibold text-white transition-all duration-300 ease-in-out"
      style={{
        height: wide
          ? "clamp(44px, min(7vw, 5vh), 56px)"
          : "clamp(44px, min(3.75vw, 5.5vh), 54px)",
        width: wide
          ? "clamp(200px, 45vw, 320px)"
          : "clamp(160px, min(13.9vw, 20.4vh), 200px)",
        fontSize: wide
          ? "clamp(13px, min(3vw, 2vh), 18px)"
          : "clamp(12px, min(1.11vw, 1.63vh), 16px)",
        padding: "10px",
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty(
          "--mouse-x",
          `${e.clientX - rect.left}px`
        );
        e.currentTarget.style.setProperty(
          "--mouse-y",
          `${e.clientY - rect.top}px`
        );
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle 80px at var(--mouse-x, 50%) var(--mouse-y, 50%), #003CB3 0%, transparent 100%)",
        }}
      />
      <span className="relative z-10 text-center">Get Investment</span>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════ */
export default function JoinPortfolioCTA() {
  return (
    <section
      className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-white"
      style={{
        paddingTop: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingBottom: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <style>{SLOT_CSS}</style>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-[1440px] overflow-hidden"
        style={{
          borderRadius: "clamp(10px, min(1.1vw, 1.6vh), 16px)",
          background:
            "linear-gradient(89deg, #F9F4EC 12.62%, #FBF7F0 79.35%)",
        }}
      >
        {/* ╔══════════════════════════════════════════════╗
            ║  DESKTOP  (lg+)                             ║
            ╚══════════════════════════════════════════════╝ */}
        {/* UPDATED: Outer layout is balanced again */}
        <div className="hidden w-full lg:flex lg:justify-between lg:min-h-[clamp(400px,min(38.3vw,56.2vh),552px)]">
          
          {/* ── Left: text ── */}
          <div
            className="flex flex-1 flex-col justify-center"
            style={{
              paddingLeft: "clamp(40px, min(5.56vw, 8.15vh), 80px)",
              paddingRight: "clamp(20px, min(2.78vw, 4.07vh), 40px)",
            }}
          >
            <h2
              className="font-['Libre_Baskerville',_serif] font-semibold text-[#000]"
              style={{
                fontSize: "clamp(36px, min(4.44vw, 6.52vh), 64px)",
                lineHeight: "131%",
                marginBottom: "clamp(12px, min(1.39vw, 2.04vh), 20px)",
              }}
            >
              Want to join
              <br />
              our portfolio?
            </h2>
            <p
              className="font-['Poppins',_sans-serif] font-normal text-[#323232]"
              style={{
                fontSize: "clamp(16px, min(1.67vw, 2.44vh), 24px)",
                lineHeight: "150%",
                maxWidth: "450px",
                marginBottom: "clamp(24px, min(2.78vw, 4.07vh), 40px)",
              }}
            >
              It is never to late to be part of the
              <br />
              Titan Capital
            </p>
            <SpotlightButton />
          </div>

          {/* ── Right: slot machine ── */}
          <div
            className="relative flex flex-1 items-center justify-center"
            style={{
              paddingTop: "clamp(24px, min(2.78vw, 4.07vh), 40px)",
              paddingBottom: "clamp(24px, min(2.78vw, 4.07vh), 40px)",
              paddingLeft: "clamp(20px, min(2.78vw, 4.07vh), 40px)",
              paddingRight: "clamp(40px, min(5.56vw, 8.15vh), 80px)",
            }}
          >
            <SlotMachineBox
              columns={DESKTOP_COLUMNS}
              cellSize="clamp(60px, min(7.6vw, 11.2vh), 110px)"
              height="clamp(320px, min(38vw, 55vh), 559px)" 
              brandSize="clamp(16px, min(1.53vw, 2.24vh), 24px)" 
            />
          </div>
        </div>

        {/* ╔══════════════════════════════════════════════╗
            ║  MOBILE  (<lg)                              ║
            ╚══════════════════════════════════════════════╝ */}
        <div className="flex flex-col items-center lg:hidden">
          <div
            className="flex w-full flex-col items-center text-center"
            style={{
              paddingTop: "clamp(40px, min(8vw, 11.7vh), 70px)",
              paddingBottom: "clamp(28px, min(5vw, 7.3vh), 48px)",
              paddingLeft: "clamp(20px, 5vw, 40px)",
              paddingRight: "clamp(20px, 5vw, 40px)",
            }}
          >
            <h2
              className="font-['Libre_Baskerville',_serif] font-semibold text-[#000]"
              style={{
                maxWidth: "283px",
                fontSize: "20px",
                lineHeight: "131%",
                marginBottom: "clamp(10px, min(2vw, 1.4vh), 16px)",
              }}
            >
              Want to join our portfolio?
            </h2>
            <p
              className="font-['Poppins',_sans-serif] font-normal text-[#323232] text-center"
              style={{
                maxWidth: "283px",
                fontSize: "16px",
                lineHeight: "150%",
                marginBottom: "clamp(20px, min(4vw, 2.8vh), 32px)",
              }}
            >
              It is never to late to be part of the Titan Capital
            </p>
            <SpotlightButton wide />
          </div>

          <div
            className="flex w-full justify-center"
            style={{
              paddingLeft: "clamp(12px, 3vw, 24px)",
              paddingRight: "clamp(12px, 3vw, 24px)",
              paddingBottom: "clamp(16px, 3vw, 28px)",
            }}
          >
            <SlotMachineBox
              columns={MOBILE_COLUMNS}
              cellSize="clamp(44px, 13vw, 80px)"
              height="clamp(220px, 55vw, 380px)"
              brandSize="clamp(11px, 3.2vw, 16px)"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}