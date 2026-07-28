"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Types ── */
interface BottomLabel {
  heading: string;
  value: string;
}

interface FundInfo {
  title: string;
  aifName: string;
  sebiNumber: string;
  category: string;
  fundManager: string;
  officeAddress: string;
  bottomLabels: BottomLabel[];
}

export interface FundDetailsData {
  headingFirst?: string;
  headingSecond?: string;
  funds?: FundInfo[];
}

/* ── Fallbacks ── */
const FALLBACK_HEADING_FIRST = "Fund";
const FALLBACK_HEADING_SECOND = "Details";
const FALLBACK_FUNDS: FundInfo[] = [
  {
    title: "Fund I Details",
    aifName: "Titan Capital Winners Fund I",
    sebiNumber: "IN/AIF2/23-24/1358",
    category: "Category II AIF",
    fundManager: "Titan Winners Fund Management LLP",
    officeAddress:
      "M3M Urbana Business Park, Sector 67, Golf Course Extension Road, Gurugram  122102",
    bottomLabels: [
      { heading: "Trustee:", value: "Catalyst Trusteeship Limited" },
      { heading: "Sponsors:", value: "TC Sponsor & Services LLP" },
    ],
  },
  {
    title: "Fund II Details",
    aifName: "Titan Capital Winners Fund II",
    sebiNumber: "IN/AIF2/26-27/2125",
    category: "Category II AIF",
    fundManager: "Titan Winners Fund Management LLP",
    officeAddress:
      "M3M Urbana Business Park, Sector 67, Golf Course Extension Road, Gurugram  122102",
    bottomLabels: [
      { heading: "Trustee:", value: "Catalyst Trusteeship Limited" },
      { heading: "Sponsors:", value: "TC Sponsor & Services LLP" },
    ],
  },
];

/* ── Inner card for fund details ── */
function FundCard({ info }: { info: FundInfo }) {
  return (
    <div
      className="flex w-full flex-col bg-[white]"
      style={{
        borderRadius: "clamp(6px, 0.8vw, 10px)",
        boxShadow: "12px 12px 24px -8px rgba(207, 207, 207, 0.25)",
        padding: "clamp(16px, min(2vw, 3vh), 32px)",
      }}
    >
      {/* Row 1: AIF Name + SEBI Number */}
      <div className="flex w-full flex-col gap-[clamp(16px,2vw,28px)] md:flex-row md:justify-between">
        <div className="flex flex-col gap-[clamp(4px,0.5vw,8px)]">
          <span
            className="font-['Poppins',_sans-serif] font-normal text-[#575757]"
            style={{ fontSize: "clamp(12px, min(1.25vw, 1.83vh), 18px)", lineHeight: "150%" }}
          >
            AIF Name
          </span>
          <span
            className="font-['Poppins',_sans-serif] font-normal text-black"
            style={{ fontSize: "clamp(15px, min(1.67vw, 2.44vh), 24px)", lineHeight: "150%" }}
          >
            {info.aifName}
          </span>
        </div>
        <div className="flex flex-col gap-[clamp(4px,0.5vw,8px)]">
          <span
            className="font-['Poppins',_sans-serif] font-normal text-[#575757]"
            style={{ fontSize: "clamp(12px, min(1.25vw, 1.83vh), 18px)", lineHeight: "150%" }}
          >
            SEBI Registration Number
          </span>
          <span
            className="font-['Poppins',_sans-serif] font-normal text-black"
            style={{ fontSize: "clamp(15px, min(1.67vw, 2.44vh), 24px)", lineHeight: "150%" }}
          >
            {info.sebiNumber}
          </span>
        </div>
      </div>

      {/* Row 2: Category */}
      <div
        className="flex flex-col gap-[clamp(4px,0.5vw,8px)]"
        style={{ marginTop: "clamp(14px, min(1.8vw, 2.6vh), 24px)" }}
      >
        <span
          className="font-['Poppins',_sans-serif] font-normal text-[#575757]"
          style={{ fontSize: "clamp(12px, min(1.25vw, 1.83vh), 18px)", lineHeight: "150%" }}
        >
          Category
        </span>
        <span
          className="font-['Poppins',_sans-serif] font-normal text-black"
          style={{ fontSize: "clamp(15px, min(1.67vw, 2.44vh), 24px)", lineHeight: "150%" }}
        >
          {info.category}
        </span>
      </div>

      {/* Row 3: Fund Manager */}
      <div
        className="flex flex-col gap-[clamp(4px,0.5vw,8px)]"
        style={{ marginTop: "clamp(14px, min(1.8vw, 2.6vh), 24px)" }}
      >
        <span
          className="font-['Poppins',_sans-serif] font-normal text-[#575757]"
          style={{ fontSize: "clamp(12px, min(1.25vw, 1.83vh), 18px)", lineHeight: "150%" }}
        >
          Fund Manager
        </span>
        <span
          className="font-['Poppins',_sans-serif] font-normal text-black"
          style={{ fontSize: "clamp(15px, min(1.67vw, 2.44vh), 24px)", lineHeight: "150%" }}
        >
          {info.fundManager}
        </span>
      </div>

      {/* Row 4: Office Address */}
      <div
        className="flex flex-col gap-[clamp(4px,0.5vw,8px)]"
        style={{ marginTop: "clamp(14px, min(1.8vw, 2.6vh), 24px)" }}
      >
        <span
          className="font-['Poppins',_sans-serif] font-normal text-[#575757]"
          style={{ fontSize: "clamp(12px, min(1.25vw, 1.83vh), 18px)", lineHeight: "150%" }}
        >
          Office Address
        </span>
        <span
          className="font-['Poppins',_sans-serif] font-normal text-black"
          style={{
            fontSize: "clamp(15px, min(1.67vw, 2.44vh), 24px)",
            lineHeight: "150%",
            maxWidth: "clamp(400px, 60vw, 860px)",
          }}
        >
          {info.officeAddress}
        </span>
      </div>

      {/* Dashed divider + bottom labels */}
      <div
        className="flex flex-col items-center gap-[clamp(12px,1.5vw,20px)]"
        style={{ marginTop: "clamp(20px, min(2.5vw, 3.5vh), 32px)" }}
      >
        <div className="w-full" style={{ borderTop: "1.5px dashed #BFBFBF" }} />
        <div className="flex w-full flex-wrap items-start justify-center gap-x-[clamp(24px,3vw,48px)] gap-y-[clamp(10px,1.2vw,16px)]">
          {info.bottomLabels.map(({ heading, value }) => (
            <div key={heading} className="flex flex-row items-baseline gap-[clamp(3px,0.4vw,5px)]">
              <span
                className="font-['Poppins',_sans-serif] font-light text-black"
                style={{ fontSize: "clamp(12px, min(1.11vw, 1.63vh), 16px)", lineHeight: "150%" }}
              >
                {heading}
              </span>
              <span
                className="font-['Poppins',_sans-serif] font-light text-black"
                style={{ fontSize: "clamp(12px, min(1.11vw, 1.63vh), 16px)", lineHeight: "150%" }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Fund accordion item ── */
function FundAccordionItem({
  fund,
  isOpen,
  onToggle,
}: {
  fund: FundInfo;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="w-full overflow-hidden"
      style={{ borderRadius: "clamp(8px, 1vw, 12px)", backgroundColor: "#FBF7F0" }}
    >
      <button
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between border-none bg-transparent text-left"
        style={{ padding: "clamp(16px, min(2vw, 2.5vh), 24px) clamp(20px, min(2.5vw, 3.5vh), 32px)" }}
      >
        <span
          className="font-['Poppins',_sans-serif] font-normal text-[#000]"
          style={{ fontSize: "clamp(18px, 2vw, 24px)", lineHeight: "140%" }}
        >
          {fund.title}
        </span>
        <motion.span
          className="ml-4 flex shrink-0 items-center justify-center select-none text-[#000]"
          style={{ width: "clamp(24px, 2vw, 32px)", height: "clamp(24px, 2vw, 32px)" }}
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 36 36" fill="none">
              <path d="M4 17.5H31" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 36 36" fill="none">
              <path d="M4 17.5H31M17.5 4V31" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div
              style={{
                padding: "clamp(4px, 0.6vw, 10px) clamp(20px, min(2.5vw, 3.5vh), 32px) clamp(20px, min(2.5vw, 3.5vh), 32px)",
              }}
            >
              <FundCard info={fund} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FundDetailsClient({
  data,
}: {
  data?: FundDetailsData | null;
}) {
  const headingFirst = data?.headingFirst || FALLBACK_HEADING_FIRST;
  const headingSecond = data?.headingSecond || FALLBACK_HEADING_SECOND;
  const funds = data?.funds?.length ? data.funds : FALLBACK_FUNDS;

  const [isExpanded, setIsExpanded] = useState(false);
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());

  const toggleAccordion = (idx: number) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <section
      className="relative flex w-full flex-col items-center overflow-hidden bg-[#FBF7F0]"
      style={{
        // Reduced overall padding to make the section smaller
        paddingTop: "clamp(20px, 3vw, 40px)",
        paddingBottom: "clamp(20px, 3vw, 40px)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col">
        
        {/* ── HEADING AND TOGGLE ROW ── */}
        <div className="flex w-full items-center justify-between py-[clamp(12px,1.5vw,24px)]">
          {/* ── HEADING (LEFT ALIGNED) ── */}
          <motion.div
            className="flex flex-col items-start text-left"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2
              className="m-0 font-['Poppins',_sans-serif] font-semibold text-black max-md:!text-[clamp(24px,7vw,28px)] max-md:!leading-[120%]"
              // Reduced line-height from 150% to 110% to eliminate fake whitespace
              style={{ fontSize: "min(4.51vw, 6.98vh)", lineHeight: "110%" }}
            >
              {headingFirst} {headingSecond}
            </h2>
          </motion.div>

          {/* ── TOGGLE BUTTON WITH SVG ARROW (RIGHT ALIGNED) ── */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="shrink-0 border-none bg-transparent cursor-pointer p-0 focus:outline-none ml-4"
            aria-label={isExpanded ? "Collapse Fund Details" : "Expand Fund Details"}
          >
            <motion.div
              className="relative flex items-center justify-center rounded-full"
              style={{
                // Shrunk max size of the button
                width: "clamp(40px, 5vw, 56px)",
                height: "clamp(40px, 5vw, 56px)",
                backgroundColor: "white",
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-[clamp(18px,2vw,24px)] h-[clamp(18px,2vw,24px)]"
                viewBox="0 0 24 24"
                fill="none"
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <path
                  d="M6 9L12 15L18 9"
                  stroke="black"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
            </motion.div>
          </button>
        </div>

        {/* ── EXPANDABLE CONTENT SECTION ── */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              // Removed mb-[...] class from here to prevent snapping/glitching during exit animation
              className="w-full overflow-hidden"
            >
              <div 
                // Moved bottom spacing to pb-[...] here so it's handled inside the animated container
                className="flex w-full flex-col gap-[clamp(12px,1.5vw,20px)] pt-[8px] pb-[clamp(16px,2vw,32px)]"
              >
                {funds.map((fund, idx) => (
                  <FundAccordionItem
                    key={idx}
                    fund={fund}
                    isOpen={openIds.has(idx)}
                    onToggle={() => toggleAccordion(idx)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}