"use client";

import { motion } from "framer-motion";

/*
  Portfolio stats bar — 4 metrics in a single row.
  Design ref @ 1440: height 206px, gap 119px between items.
  Each stat: 64px Libre Baskerville, #001A4D.
*/

const stats = [
  { value: "300+", label: "Companies Backed" },
  { value: "7", label: "Unicorns" },
  { value: "4", label: "IPOs" },
  { value: "$4B+", label: "Capital Raised By Portfolio" },
];

/* Helper function to split strings like "$4B+" into:
  prefix: "$", numberStr: "4", suffix: "B+"
*/
const parseStat = (val: string) => {
  const match = val.match(/^([^0-9]*)([0-9]+)([^0-9]*)$/);
  if (match) {
    return { prefix: match[1], numberStr: match[2], suffix: match[3] };
  }
  return { prefix: "", numberStr: val, suffix: "" };
};

/* ── SUITCASE LOCK COMPONENT ── */
function RollingNumber({ value }: { value: string }) {
  const { prefix, numberStr, suffix } = parseStat(value);
  
  // Custom logic: Single digits (7, 4) roll MUCH slower than multi-digits (300)
  const rollDuration = numberStr.length === 1 ? 2.8 : 1.5; 
  const digitStagger = 0.15;

  // Variants that inherit the parent's "hidden" and "visible" states
  const digitVariants = {
    hidden: { y: "0%" },
    visible: (custom: { num: number; index: number }) => ({
      y: `-${(10 + custom.num) * 5}%`, // 5% per number (20 numbers total in the column)
      transition: {
        duration: rollDuration,
        delay: custom.index * digitStagger, // Stagger if there are multiple digits (e.g., 3, 0, 0)
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number], // Snappy start, very smooth deceleration
      },
    }),
  };

  return (
    <div className="flex flex-row items-center justify-center leading-none">
      {/* PREFIX (e.g., "$") — matched to the 1.2em digit window so it
          sits on the same line as the rolling digits. */}
      {prefix && (
        <span className="inline-flex items-center leading-none" style={{ height: "1.2em" }}>
          {prefix}
        </span>
      )}

      {/* ROLLING DIGITS */}
      <div className="flex flex-row">
        {numberStr.split("").map((digit, i) => {
          const num = parseInt(digit, 10);
          // Create a column of 20 numbers (two sets of 0-9) to guarantee a full spin
          const column = Array.from({ length: 20 }, (_, idx) => idx % 10);

          return (
            <span
              key={i}
              className="relative inline-flex flex-col overflow-hidden"
              // 1.2em height tightly clips the number to create the lock window
              style={{ height: "1.2em" }}
            >
              <motion.div
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
              </motion.div>
            </span>
          );
        })}
      </div>

      {/* SUFFIX (e.g., "B+", "+") — matched to the 1.2em digit window. */}
      {suffix && (
        <span className="inline-flex items-center leading-none" style={{ height: "1.2em" }}>
          {suffix}
        </span>
      )}
    </div>
  );
}

export default function PortfolioStats() {
  return (
    <section
      className="relative flex w-full items-center justify-center overflow-hidden bg-white"
      style={{
        paddingTop: "clamp(32px, min(4.5vw, 6.6vh), 64px)",
        paddingBottom: "clamp(32px, min(4.5vw, 6.6vh), 64px)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <motion.div
        className="flex w-full flex-row items-start justify-center"
        style={{ gap: "clamp(10px, min(5.26vw, 7.12vh), 50px)" }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={{
          hidden: {},
          visible: { 
            // 0.5 second gap guarantees the first stat finishes appearing before the next starts
            transition: { staggerChildren: 0.5, delayChildren: 0.1 } 
          },
        }}
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            className="flex min-w-0 flex-1 flex-col items-center"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.5, ease: "easeOut" },
              },
            }}
          >
            <div
              className="font-['Poppins',_serif] font-medium text-[#001A4D]"
              style={{
                // ~20% larger than before.
                fontSize: "clamp(34px, min(5.33vw, 7.82vh), 77px)",
                textAlign: "center",
              }}
            >
              <RollingNumber value={stat.value} />
            </div>
            <span
              className="font-['Poppins',_sans-serif] font-normal text-[#001A4D] mt-1"
              style={{
                // ~40% larger than before.
                fontSize: "clamp(10px, min(1.55vw, 2.28vh), 22px)",
                lineHeight: "140%",
                textAlign: "center",
              }}
            >
              {stat.label}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}