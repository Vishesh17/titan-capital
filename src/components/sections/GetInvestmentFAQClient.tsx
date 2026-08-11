"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HERO_BODY_CLASS,
  HERO_BODY_STYLE,
  SECTION_HEADING_CLASS,
  SECTION_HEADING_STYLE,
} from "@/styles/heroTypography";

/* ═══════════════════════════════════════════════════════
   FAQ data
   ═══════════════════════════════════════════════════════ */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const, delay },
  }),
};

export interface GetInvestmentFAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface GetInvestmentFAQData {
  headingFirst?: string;
  headingSecond?: string;
  items?: GetInvestmentFAQItem[];
}

const FALLBACK_HEADING_FIRST = "You&apos;ve Got Questions";
const FALLBACK_HEADING_SECOND = "We&apos;ve Got Answers";

const FALLBACK_FAQ: GetInvestmentFAQItem[] = [
  {
    id: "faq-1",
    question: "Do I need a deck to apply?",
    answer:
      "No. A short email or 6-field form is enough to get started. If there's mutual interest, we'll ask for more at the right time.",
  },
  {
    id: "faq-2",
    question: "What stage do you invest at?",
    answer:
      "Pre-seed and seed. We prefer to be your first institutional investor, and for breakout companies, we follow on in later rounds through the Winners Fund.",
  },
  {
    id: "faq-3",
    question: "How long does the process take?",
    answer:
      "We move fast. Most founders hear back from us within days, not weeks.",
  },
  {
    id: "faq-5",
    question: "What happens after you invest?",
    answer:
      "You get full access to the Titan network, ecosystem, and team. The first year as a Titan portfolio company is the most important, we work closely with you on hiring, GTM strategy, and setting up your next fundraise.",
  },
];

/* ═══════════════════════════════════════════════════════
   Single FAQ accordion item
   ═══════════════════════════════════════════════════════ */

function FAQItem({
  faq,
  isOpen,
  onToggle,
}: {
  faq: GetInvestmentFAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="w-full bg-white flex flex-col justify-center items-start overflow-hidden"
      style={{
        borderRadius: "clamp(8px, 1vw, 12px)",
        // Reduced padding and removed minHeight entirely for a much more compact card
        padding: "clamp(20px, 2.5vw, 28px)",
        alignSelf: "stretch",
      }}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between border-none bg-transparent text-left p-0 m-0"
      >
        <span className={`text-[#000] ${HERO_BODY_CLASS}`} style={HERO_BODY_STYLE}>
          {faq.question}
        </span>

        <span
          className="ml-4 flex shrink-0 items-center justify-center select-none"
          // Slightly decreased icon size to match smaller text
          style={{
            width: "clamp(28px, 2vw, 32px)",
            height: "clamp(28px, 2vw, 32px)",
            aspectRatio: "1/1",
          }}
        >
          {isOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="100%"
              height="100%"
              viewBox="0 0 36 36"
              fill="none"
            >
              <path
                d="M4 17.5H17.5H31"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="100%"
              height="100%"
              viewBox="0 0 36 36"
              fill="none"
            >
              <path
                d="M4 17.5H17.5M17.5 17.5H31M17.5 17.5V4M17.5 17.5V31"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </button>

      {/* Expandable answer */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden w-full"
          >
            {/* Reduced top margin to keep it compact */}
            <div style={{ marginTop: "16px" }}>
              <p
                className="font-['Poppins',_sans-serif] font-normal text-[#323232] m-0 p-0"
                // Decreased answer font size
                style={{
                  fontSize: "clamp(15px, 1.5vw, 18px)",
                  lineHeight: "150%",
                }}
              >
                {faq.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Main FAQ section
   ═══════════════════════════════════════════════════════ */

export default function GetInvestmentFAQClient({
  data,
}: {
  data?: GetInvestmentFAQData | null;
}) {
  const headingFirst = data?.headingFirst || FALLBACK_HEADING_FIRST;
  const headingSecond = data?.headingSecond || FALLBACK_HEADING_SECOND;
  const faqs =
    data?.items && data.items.length > 0 ? data.items : FALLBACK_FAQ;
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      className="relative flex w-full items-start overflow-hidden bg-[#FBF7F0]"
      style={{
        paddingTop: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingBottom: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center">
        {/* ── HEADING ── */}
        <motion.div
          className="max-md:!mb-[clamp(32px,6dvh,48px)] flex flex-col items-center text-center"
          style={{ marginBottom: "min(3.47vw, 5.37vh)" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.h2
   className={`m-0 max-w-[794px] text-black ${SECTION_HEADING_CLASS}`}
   style={{ ...SECTION_HEADING_STYLE, }}
   custom={0}
   variants={fadeUp}
   dangerouslySetInnerHTML={{ __html: headingFirst }}
   />

          <motion.h2
            className={`m-0 max-w-[794px] text-black ${SECTION_HEADING_CLASS}`}
            style={{ ...SECTION_HEADING_STYLE, }}
            custom={0}
            variants={fadeUp}
            dangerouslySetInnerHTML={{ __html: headingSecond }}
          />
        </motion.div>

        {/* ── FAQ ACCORDIONS ── */}
        <motion.div
          className="flex w-full flex-col gap-[clamp(12px,1.5vw,20px)]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.1, delayChildren: 0.3 },
            },
          }}
        >
          {faqs.map((faq) => (
            <motion.div
              key={faq.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: "easeOut" as const },
                },
              }}
            >
              <FAQItem
                faq={faq}
                isOpen={openId === faq.id}
                onToggle={() => toggle(faq.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}