"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Fund data ── */
interface FundInfo {
  aifName: string;
  sebiNumber: string;
  category: string;
  fundManager: string;
  officeAddress: string;
  bottomLabels: { heading: string; value: string }[];
}

const fundsData: { id: string; title: string; info: FundInfo }[] = [
  {
    id: "fund-1",
    title: "Fund I Details",
    info: {
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
  },
  {
    id: "fund-2",
    title: "Fund II Details",
    info: {
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
  },
];

const disclaimerText =
  "Titan Capital Winners Fund I is a  SEBI-registered Category II Alternative Investment Fund. SEBI Registration Number:  IN/AIF2/23-24/1358. This page is for informational purposes only and does not constitute an  offer to sell or a solicitation to buy any securities. Investments are subject to market risks. Read  all scheme-related documents carefully before investing.";

/* ── Inner card for fund details ── */
function FundCard({ info }: { info: FundInfo }) {
  return (
    <div
      className="flex w-full flex-col bg-white"
      style={{
        borderRadius: "clamp(6px, 0.8vw, 10px)",
        boxShadow: "12px 12px 24px -8px rgba(207, 207, 207, 0.25)",
        padding: "clamp(16px, min(2vw, 3vh), 32px)",
      }}
    >
      {/* Row 1: AIF Name + SEBI Number */}
      <div className="flex w-full flex-col gap-[clamp(16px,2vw,28px)] md:flex-row md:justify-between">
        {/* AIF Name */}
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

        {/* SEBI Registration Number */}
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
        {/* Dashed line */}
        <div
          className="w-full"
          style={{
            borderTop: "1.5px dashed #BFBFBF",
          }}
        />

        {/* Labels row */}
        <div
          className="flex w-full flex-wrap items-start justify-center gap-x-[clamp(24px,3vw,48px)] gap-y-[clamp(10px,1.2vw,16px)]"
        >
          {info.bottomLabels.map(({ heading, value }) => (
            <div
              key={heading}
              className="flex flex-row items-baseline gap-[clamp(3px,0.4vw,5px)]"
            >
              <span
                className="font-['Poppins',_sans-serif] font-light text-black"
                style={{
                  fontSize: "clamp(12px, min(1.11vw, 1.63vh), 16px)",
                  lineHeight: "150%",
                }}
              >
                {heading}
              </span>
              <span
                className="font-['Poppins',_sans-serif] font-light text-black"
                style={{
                  fontSize: "clamp(12px, min(1.11vw, 1.63vh), 16px)",
                  lineHeight: "150%",
                }}
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
  fund: (typeof fundsData)[number];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="w-full overflow-hidden"
      style={{
        borderRadius: "clamp(8px, 1vw, 12px)",
        backgroundColor: "#FBF7F0",
      }}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between border-none bg-transparent text-left"
        style={{
          padding: "clamp(14px, min(1.6vw, 2.3vh), 22px) clamp(16px, min(2vw, 3vh), 28px)",
        }}
      >
        <span
          className="font-['Poppins',_sans-serif] font-medium text-[#001A4D]"
          style={{ fontSize: "clamp(14px, min(1.39vw, 2.04vh), 20px)" }}
        >
          {fund.title}
        </span>

        <motion.span
          className="flex items-center justify-center text-[#001A4D] select-none"
          style={{ fontSize: "clamp(18px, min(1.8vw, 2.6vh), 26px)" }}
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          +
        </motion.span>
      </button>

      {/* Expandable content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div
              style={{
                padding:
                  "clamp(4px, 0.6vw, 10px) clamp(16px, min(2vw, 3vh), 28px) clamp(16px, min(2vw, 3vh), 28px)",
              }}
            >
              <FundCard info={fund.info} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FundDetails() {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section
      className="relative flex w-full items-start overflow-hidden bg-white"
      style={{
        paddingTop: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingBottom: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col">

        {/* ── HEADING ── */}
        <motion.div
          className="mb-[clamp(28px,min(4vw,6vh),56px)] flex flex-row flex-wrap items-center gap-x-3 max-md:gap-x-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.h2
            className="m-0 font-['Libre_Baskerville',_serif] text-[length:var(--heading-xl)] max-md:!text-[28px] font-semibold not-italic leading-none text-[#001A4D]"
            variants={{
              hidden: { opacity: 0, x: -40 },
              visible: {
                opacity: 1,
                x: 0,
                transition: { duration: 0.9, ease: "easeOut" },
              },
            }}
          >
            Fund
          </motion.h2>

          <motion.span
            className="relative inline-flex items-center justify-center overflow-hidden bg-transparent px-[4px] py-[8px] md:px-[6px] md:py-[10px]"
            variants={{
              hidden: { opacity: 0, x: -80 },
              visible: {
                opacity: 1,
                x: 0,
                transition: { duration: 0.6, ease: "easeOut", delay: 0.3 },
              },
            }}
          >
            <motion.span
              className="absolute inset-0 z-0 h-full w-full bg-[#D3E2FF]"
              style={{ transformOrigin: "left" }}
              variants={{
                hidden: { scaleX: 0 },
                visible: {
                  scaleX: 1,
                  transition: { duration: 0.6, ease: "easeInOut", delay: 0.7 },
                },
              }}
            />
            <span className="relative z-10 font-['Libre_Baskerville',_serif] text-[length:var(--heading-xl)] max-md:!text-[28px] font-semibold italic leading-none text-[#001A4D]">
              Details
            </span>
          </motion.span>
        </motion.div>

        {/* ── FUND ACCORDIONS ── */}
        <motion.div
          className="flex w-full flex-col gap-[clamp(12px,1.5vw,20px)]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.15, delayChildren: 0.3 },
            },
          }}
        >
          {fundsData.map((fund) => (
            <motion.div
              key={fund.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: "easeOut" },
                },
              }}
            >
              <FundAccordionItem
                fund={fund}
                isOpen={openIds.has(fund.id)}
                onToggle={() => toggle(fund.id)}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* ── MANDATORY DISCLAIMER ──
        <motion.div
          className="mt-[clamp(24px,3vw,48px)] w-full"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
        >
          <button
            onClick={() => setDisclaimerOpen((p) => !p)}
            className="flex w-full cursor-pointer items-center gap-[clamp(10px,1vw,16px)] border-none bg-transparent py-[clamp(12px,1.5vw,20px)] text-left"
            style={{ borderTop: "1px solid #E0E0E0" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#001A4D"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
              style={{
                width: "clamp(18px, min(1.8vw, 2.6vh), 26px)",
                height: "clamp(18px, min(1.8vw, 2.6vh), 26px)",
              }}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>

            <span
              className="font-['Poppins',_sans-serif] font-semibold text-[#001A4D]"
              style={{ fontSize: "clamp(14px, min(1.4vw, 2vh), 20px)" }}
            >
              Mandatory disclaimer
            </span>

            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#001A4D"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-auto shrink-0"
              style={{
                width: "clamp(16px, min(1.5vw, 2.2vh), 22px)",
                height: "clamp(16px, min(1.5vw, 2.2vh), 22px)",
              }}
              animate={{ rotate: disclaimerOpen ? 180 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <polyline points="6 9 12 15 18 9" />
            </motion.svg>
          </button>


          <AnimatePresence initial={false}>
            {disclaimerOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <p
                  className="font-['Poppins',_sans-serif] font-light text-[#323232]"
                  style={{
                    fontSize: "clamp(13px, min(1.39vw, 2.04vh), 20px)",
                    lineHeight: "150%",
                    paddingTop: "clamp(8px, 1vw, 16px)",
                    paddingBottom: "clamp(12px, 1.5vw, 24px)",
                  }}
                >
                  {disclaimerText}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div> */}

      </div>
    </section>
  );
}
