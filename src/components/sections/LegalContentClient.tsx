"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";

type TabKey = "privacy" | "grievance";

/* ════════════════════════════════════════════
   What Sanity sends — see legalPagesQuery.
   ════════════════════════════════════════════ */
export interface LegalFundCard {
  title?: string;
  fundName?: string;
  effectiveDate?: string;
  registrationNumber?: string;
  registeredOffice?: string;
  investmentManager?: string;
  trustee?: string;
  sponsor?: string;
}

export interface LegalPageDoc {
  heading?: string;
  tabLabel?: string;
  body?: PortableTextBlock[];
  funds?: LegalFundCard[];
}

export interface LegalPagesData {
  privacy?: LegalPageDoc | null;
  grievance?: LegalPageDoc | null;
}

const TABS: {
  key: TabKey;
  label: string;
  path: string;
  /** Heading split — first word in upright serif, second word italic + highlighted, matching the rest of the site. */
  headingParts: [string, string];
}[] = [
  {
    key: "privacy",
    label: "Privacy Policy",
    path: "/privacy-policy",
    headingParts: ["Privacy", "Policy"],
  },
  {
    key: "grievance",
    label: "Grievance Redressal",
    path: "/grievance-redressal",
    headingParts: ["Grievance", "Redressal"],
  },
];

/* ════════════════════════════════════════════
   Shared text styles — match the rest of the site
   ════════════════════════════════════════════ */

const proseParagraph =
  "font-['Poppins',_sans-serif] font-light text-[#0E0E0E] leading-[1.7]";
const proseParagraphStyle: React.CSSProperties = {
  fontSize: "clamp(13px, min(1.11vw, 1.63vh), 16px)",
};

const subHeading =
  "font-['Poppins',_serif] font-semibold text-[#001A4D] leading-tight";
const subHeadingStyle: React.CSSProperties = {
  fontSize: "clamp(18px, min(1.67vw, 2.44vh), 24px)",
};

/* ════════════════════════════════════════════
   THE PAGE BODY, from Sanity.

   The copy used to be ~370 lines of JSX in this file, which meant a lawyer's
   comma was a code change and a deploy. It is Portable Text now, and this map
   is the whole of what the editor's choices mean on the page — the classes are
   the ones the hardcoded markup already used, so the rendering is unchanged.
   ════════════════════════════════════════════ */

const legalComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className={proseParagraph} style={proseParagraphStyle}>
        {children}
      </p>
    ),
    /* "Sub-heading" in the Studio. */
    h2: ({ children }) => (
      <h2
        className={subHeading}
        style={{ ...subHeadingStyle, marginTop: "clamp(6px, 0.6vw, 10px)" }}
      >
        {children}
      </h2>
    ),
    /* "Eyebrow" — the small grey spaced line above a section. */
    h4: ({ children }) => (
      <p
        className="font-['Poppins',_sans-serif] font-normal text-[#575757]"
        style={{
          fontSize: "clamp(12px, min(1.04vw, 1.53vh), 14px)",
          letterSpacing: "0.04em",
        }}
      >
        {children}
      </p>
    ),
    /* "Lead-in" — the medium-weight line that introduces a list. */
    h5: ({ children }) => (
      <p
        className="font-['Poppins',_sans-serif] font-medium text-[#0E0E0E]"
        style={{ fontSize: "clamp(13px, min(1.11vw, 1.63vh), 16px)" }}
      >
        {children}
      </p>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="ml-[clamp(18px,1.4vw,24px)] flex list-disc flex-col gap-[clamp(8px,0.8vw,12px)]">
        {children}
      </ul>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li className={proseParagraph} style={proseParagraphStyle}>
        {children}
      </li>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    underline: ({ children }) => <span className="underline">{children}</span>,
    link: ({ children, value }) => {
      const href: string = value?.href ?? "#";
      /* Only http(s) links leave the site, so only those get a new tab.
         mailto: and tel: must open in place or the browser leaves a blank
         window behind. */
      const external = /^https?:/i.test(href);
      return (
        <a
          href={href}
          {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
          className="text-[#001A4D] underline decoration-solid hover:opacity-70"
        >
          {children}
        </a>
      );
    },
  },
};

function LegalBody({ value }: { value?: PortableTextBlock[] }) {
  if (!value?.length) return null;
  return <PortableText value={value} components={legalComponents} />;
}

/* ════════════════════════════════════════════
   Fund detail cards — structured, not prose
   ════════════════════════════════════════════ */

function FundDetailsBlock({ fund }: { fund: LegalFundCard }) {
  /* Row order is fixed here rather than in Sanity: it is the order SEBI
     details are conventionally presented in, not an editorial choice. An
     empty Effective Date shows an em dash, as it always has. */
  const rows: { label: string; value: string }[] = [
    { label: "Fund Name", value: fund.fundName || "" },
    { label: "Effective Date", value: fund.effectiveDate || "\u2014" },
    { label: "Registration Number", value: fund.registrationNumber || "" },
    { label: "Registered office of the Fund", value: fund.registeredOffice || "" },
    { label: "Investment Manager", value: fund.investmentManager || "" },
    { label: "Trustee", value: fund.trustee || "" },
    { label: "Sponsor to the Fund", value: fund.sponsor || "" },
  ];

  return (
    <div
      className="flex w-full flex-col bg-white"
      style={{
        borderRadius: "clamp(8px, 0.8vw, 12px)",
        boxShadow: "12px 12px 24px -8px rgba(207, 207, 207, 0.25)",
        padding: "clamp(18px, min(2vw, 3vh), 32px)",
      }}
    >
      <h3
        className="font-['Poppins',_serif] font-semibold text-[#001A4D]"
        style={{
          fontSize: "clamp(18px, min(1.67vw, 2.44vh), 22px)",
          marginBottom: "clamp(14px, min(1.6vw, 2.3vh), 22px)",
        }}
      >
        {fund.title}
      </h3>
      <div className="flex w-full flex-col gap-[clamp(12px,1.2vw,18px)]">
        {rows.map(({ label, value }) => (
          <div
            key={label}
            className="flex w-full flex-col gap-[clamp(2px,0.3vw,4px)] md:flex-row md:items-baseline md:gap-[clamp(12px,1.2vw,20px)]"
          >
            <span
              className="font-['Poppins',_sans-serif] font-normal text-[#575757] md:w-[260px] md:shrink-0"
              style={{ fontSize: "clamp(12px, min(1.04vw, 1.53vh), 14px)" }}
            >
              {label}
            </span>
            <span
              className="font-['Poppins',_sans-serif] font-normal text-black"
              style={{ fontSize: "clamp(13px, min(1.11vw, 1.63vh), 16px)" }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   Main component
   ════════════════════════════════════════════ */

export default function LegalContentClient({
  initialTab,
  data,
}: {
  initialTab: TabKey;
  /** Both documents — the tabs switch without a page load, so both are needed
   *  on both routes. */
  data?: LegalPagesData | null;
}) {
  const [active, setActive] = useState<TabKey>(initialTab);
  const router = useRouter();

  const docs: Record<TabKey, LegalPageDoc | null | undefined> = {
    privacy: data?.privacy,
    grievance: data?.grievance,
  };
  const activeDoc = docs[active];

  const handleTabClick = (tab: TabKey) => {
    if (tab === active) return;
    setActive(tab);
    const target = TABS.find((t) => t.key === tab);
    if (target) router.replace(target.path, { scroll: false });
  };

  const activeTab = TABS.find((t) => t.key === active);
  /* Sanity first, the built-in wording only if the document is missing —
     the heading is one field now rather than the two words TABS carried,
     which were only ever joined back together with a space. */
  const heading =
    activeDoc?.heading || (activeTab?.headingParts ?? []).filter(Boolean).join(" ");

  return (
    <section
      className="relative flex w-full flex-col items-center bg-white"
      style={{
        paddingTop: "clamp(80px, min(8vw, 11vh), 140px)",
        paddingBottom: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
      }}
    >
      <div
        className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col"
        style={{
          paddingLeft: "var(--section-px-wide, 5%)",
          paddingRight: "var(--section-px-wide, 5%)",
        }}
      >
        {/* ── HEADING — same Libre Baskerville size as other site headings ── */}
        <motion.h1
          key={active}
          className="m-0 font-['Poppins',_serif] text-[length:var(--heading-xl)] max-md:!text-[28px] font-semibold not-italic leading-none text-[#001A4D]"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          {heading}
        </motion.h1>

        {/* ── TABS ── */}
        <div
          role="tablist"
          aria-label="Legal sections"
          className="relative mt-[clamp(20px,2vw,32px)] flex w-full flex-row gap-[clamp(8px,1vw,16px)] border-b border-[#E0E0E0]"
        >
          {TABS.map((tab) => {
            const isActive = tab.key === active;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                type="button"
                onClick={() => handleTabClick(tab.key)}
                className={`relative cursor-pointer border-0 bg-transparent font-['Poppins',_sans-serif] transition-colors duration-200 ${
                  isActive ? "text-[#001A4D]" : "text-[#667085] hover:text-[#001A4D]"
                }`}
                style={{
                  fontSize: "clamp(13px, min(1.18vw, 1.74vh), 17px)",
                  fontWeight: isActive ? 600 : 400,
                  padding:
                    "clamp(10px, min(1vw, 1.5vh), 16px) clamp(10px, min(1.2vw, 1.8vh), 20px)",
                }}
              >
                {docs[tab.key]?.tabLabel || tab.label}
                {isActive && (
                  <motion.span
                    layoutId="legal-tab-underline"
                    className="absolute left-0 right-0 bottom-[-1px] h-[2px] bg-[#001A4D]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ── CONTENT ── */}
        <div className="mt-[clamp(24px,2.4vw,40px)] w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <article
                className="flex flex-col"
                style={{
                  gap:
                    active === "privacy"
                      ? "clamp(14px,1.4vw,22px)"
                      : "clamp(20px,1.8vw,32px)",
                }}
              >
                <LegalBody value={activeDoc?.body} />
                {activeDoc?.funds?.map((fund, i) => (
                  <FundDetailsBlock key={fund.registrationNumber ?? i} fund={fund} />
                ))}
              </article>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
