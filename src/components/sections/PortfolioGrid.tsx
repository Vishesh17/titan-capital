"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useLenis } from "lenis/react";
import {
  BODY_BOLD_CLASS,
  HERO_BODY_STYLE,
  LABEL_STYLE,
} from "@/styles/heroTypography";

/** URL slug from brand name: lowercase, alphanumerics joined by hyphens. */
function companySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ═══════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════ */

interface Company {
  brandName: string;
  year: string;
  sector: string;
  status: string;
  tags: string;
  investmentStage: string;
  logo: string;
  founderImage: string;
  isRecent: boolean;
}

interface Filters {
  sector: string[];
  year: string[];
  status: string[];
  tags: string[];
  investmentStage: string[];
}

interface APIResponse {
  companies: Company[];
  filters: Filters;
}

/** Anchor the "Back" link on /portfolio/[slug] targets. */
export const PORTFOLIO_GRID_ANCHOR = "portfolio-grid";

/**
 * Cached for the lifetime of the tab. Returning from a company detail page
 * would otherwise re-run the fetch and flash the skeleton — which also breaks
 * the anchor scroll below, since the skeleton and the real grid have
 * different heights.
 */
let cachedResponse: APIResponse | null = null;

const FILTER_CONFIG = [
  { key: "sector" as const, label: "Sector" },
  { key: "investmentStage" as const, label: "Stage" },
  { key: "status" as const, label: "Status" },
];

type FilterKey = "investmentStage" | "sector" | "year" | "status";

/* ═══════════════════════════════════════════════════════
   Sidebar Filter Section
   ═══════════════════════════════════════════════════════ */

function SidebarFilterSection({
  label,
  options,
  selected,
  onToggle,
  defaultOpen = false,
}: {
  label: string;
  options: string[];
  selected: Set<string>;
  onToggle: (val: string) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="w-full border-b border-[#000]/10 pb-5 pt-3 max-lg:!relative max-lg:!w-auto max-lg:!flex-1 max-lg:!border-b-0 max-lg:!pb-0 max-lg:!pt-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full cursor-pointer items-center justify-between border-none bg-transparent py-1 text-left max-lg:!gap-1.5 max-lg:!rounded-full max-lg:!border max-lg:!border-solid max-lg:!border-[#000]/15 max-lg:!bg-white max-lg:!px-3 max-lg:!py-2"
      >
        <span className={`text-[#000] ${BODY_BOLD_CLASS}`} style={HERO_BODY_STYLE}>
          {label}
        </span>
        <motion.span
          className="flex items-center justify-center text-[#000]"
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M4.5 3L7.5 6L4.5 9"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden pt-3 max-lg:!absolute max-lg:!left-0 max-lg:!top-[calc(100%+8px)] max-lg:!z-30 max-lg:!min-w-[160px] max-lg:!rounded-2xl max-lg:!border max-lg:!border-[#000]/10 max-lg:!bg-white max-lg:!p-3 max-lg:!shadow-lg"
          >
            <div className="flex flex-col gap-3 pl-1">
              {options.length === 0 ? (
                <span className="font-['Poppins',_sans-serif] text-[13px] text-[#888]">
                  No options
                </span>
              ) : (
                options.map((opt) => {
                  const checked = selected.has(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => onToggle(opt)}
                      className="flex cursor-pointer items-center gap-3 border-none bg-transparent text-left"
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                          checked
                            ? "border-[#001A4D] bg-[#001A4D]"
                            : "border-[#C0C0C0] bg-[#D9D9D9]/40"
                        }`}
                      >
                        {checked && (
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </span>
                      <span
                        className={`font-['Poppins',_sans-serif] ${
                          checked ? "font-medium text-[#000]" : "font-normal text-[#444]"
                        }`}
                        style={LABEL_STYLE}
                      >
                        {opt}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Company Card (Strict 2px Border Radius)
   ═══════════════════════════════════════════════════════ */

const FLIPPED_VARIANTS: Record<string, string> = {
  homerun: "/images/portfolio_grid_flipped/homerun.png",
  smylo: "/images/portfolio_grid_flipped/smylo.png",
  nathabit: "/images/portfolio_grid_flipped/nat_habit.png",
  nathabbit: "/images/portfolio_grid_flipped/nat_habit.png",
  indiansnackhouse: "/images/portfolio_grid_flipped/indian_snack_house.png",
};

function flippedVariantFor(brandName: string): string | undefined {
  const key = brandName.toLowerCase().replace(/\s+/g, "");
  return FLIPPED_VARIANTS[key];
}

function CompanyCard({ company }: { company: Company }) {
  const founderImage = company.founderImage;
  const flippedLogoSrc = flippedVariantFor(company.brandName);

  return (
    <Link
      href={`/portfolio/${companySlug(company.brandName)}`}
      className="group relative block w-full transition-shadow duration-300 [perspective:1200px]"
      style={{ aspectRatio: "1 / 1", borderRadius: "2px" }}
    >
      <div
        className={`relative h-full w-full transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d] ${
          founderImage ? "group-hover:[transform:rotateY(180deg)]" : ""
        }`}
        style={{ borderRadius: "2px" }}
      >
        {/* FRONT FACE */}
        <div
          className="absolute inset-0 flex items-center justify-center overflow-hidden bg-white [backface-visibility:hidden]"
          style={{ borderRadius: "2px" }}
        >
          {company.tags && company.tags !== "Active" && (
            <div
              className="absolute left-0 z-20 flex items-center text-white"
              style={{
                top: "clamp(10px, min(1.2vw, 1.8vh), 18px)",
                width: "clamp(100px, min(9.65vw, 14.2vh), 139px)",
                height: "clamp(24px, min(2.29vw, 3.36vh), 33px)",
                padding: "clamp(6px, min(0.7vw, 1vh), 10px)",
                gap: "10px",
                borderRadius: "0 70px 70px 0",
                background:
                  "linear-gradient(92deg, #001A4D 4.1%, #002A7C 42.17%, #001A4D 86.92%)",
                boxShadow: "0 4px 18.6px 0 #A8C6FF",
                fontSize: "clamp(8px, min(0.83vw, 1.22vh), 12px)",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 500,
                lineHeight: "150%",
                whiteSpace: "nowrap",
              }}
            >
              {company.tags === "Recent Investment"
                ? "Recent investment"
                : company.tags}
            </div>
          )}

          {company.logo ? (
            <Image
              src={company.logo}
              alt={company.brandName}
              width={400}
              height={400}
              sizes="(max-width: 640px) 40vw, (max-width: 1024px) 25vw, 16vw"
              className="object-contain"
              style={{ width: "50%", height: "auto", maxHeight: "50%" }}
            />
          ) : (
            <span
              className="font-['Poppins',_sans-serif] font-semibold text-[#001A4D] px-4 text-center"
              style={{ fontSize: "clamp(14px, min(1.4vw, 2vh), 20px)" }}
            >
              {company.brandName}
            </span>
          )}
        </div>

        {/* BACK FACE */}
        {founderImage && (
          <div
            className="absolute inset-0 overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)]"
            style={{ borderRadius: "2px" }}
          >
            <Image
              src={founderImage}
              alt={`${company.brandName} founder`}
              fill
              sizes="(max-width: 640px) 40vw, (max-width: 1024px) 25vw, 16vw"
              className="object-cover object-top"
            />
            {company.logo && (
              <div
                className="absolute flex items-center justify-start"
                style={{
                  top: "clamp(8px, min(0.9vw, 1.3vh), 14px)",
                  left: "clamp(8px, min(0.9vw, 1.3vh), 14px)",
                  width: "clamp(48px, min(4.8vw, 7vh), 76px)",
                  height: "clamp(48px, min(4.8vw, 7vh), 76px)",
                }}
              >
                <Image
                  src={flippedLogoSrc ?? company.logo}
                  alt={`${company.brandName} logo`}
                  width={120}
                  height={120}
                  sizes="(max-width: 640px) 12vw, (max-width: 1024px) 8vw, 5vw"
                  className="object-contain object-left-top"
                  style={{
                    width: "100%",
                    height: "100%",
                    ...(flippedLogoSrc
                      ? {}
                      : { filter: "brightness(0) invert(1)" }),
                  }}
                />
              </div>
            )}
            <div
              className="absolute flex items-center justify-center rounded-full bg-white text-[#001A4D] transition-transform duration-300 group-hover:translate-x-[2px] group-hover:-translate-y-[2px]"
              style={{
                right: "clamp(8px, min(0.9vw, 1.3vh), 14px)",
                bottom: "clamp(8px, min(0.9vw, 1.3vh), 14px)",
                width: "clamp(26px, min(2.4vw, 3.5vh), 36px)",
                height: "clamp(26px, min(2.4vw, 3.5vh), 36px)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M3 11L11 3M11 3H4.5M11 3V9.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════
   Skeleton Grid
   ═══════════════════════════════════════════════════════ */

function SkeletonGrid() {
  return (
    <div className="grid w-full grid-cols-3 gap-6 p-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-white/60"
          style={{ aspectRatio: "1 / 1", borderRadius: "2px" }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════ */

export default function PortfolioGrid() {
  const [data, setData] = useState<APIResponse | null>(cachedResponse);
  const [loading, setLoading] = useState(!cachedResponse);
  const [error, setError] = useState<string | null>(null);
  const lenis = useLenis();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<FilterKey, Set<string>>>({
    investmentStage: new Set(),
    sector: new Set(),
    year: new Set(),
    status: new Set(),
  });

  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (cachedResponse) return;
    let cancelled = false;
    async function fetchData() {
      try {
        const res = await fetch("/api/portfolio");
        if (!res.ok) throw new Error("Failed to load portfolio data");
        const json: APIResponse = await res.json();
        cachedResponse = json;
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setLoading(false);
        }
      }
    }
    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  /* Land on the grid when arriving via /portfolio#portfolio-grid (the "Back"
     link on a company detail page). Waits for the grid to render so we measure
     its real offset, not the skeleton's. */
  const didAnchorScroll = useRef(false);
  useEffect(() => {
    if (loading || didAnchorScroll.current) return;
    if (window.location.hash !== `#${PORTFOLIO_GRID_ANCHOR}`) return;
    const el = sectionRef.current;
    if (!el) return;
    didAnchorScroll.current = true;
    requestAnimationFrame(() => {
      if (lenis) lenis.scrollTo(el, { immediate: true });
      else el.scrollIntoView();
    });
  }, [loading, lenis]);

  const toggleFilter = useCallback((key: FilterKey, value: string) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      const set = new Set(prev[key]);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      next[key] = set;
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSearchQuery("");
    setActiveFilters({
      investmentStage: new Set(),
      sector: new Set(),
      year: new Set(),
      status: new Set(),
    });
  }, []);

  const STAGE_ORDER = ["Pre-Seed", "Seed", "Pre-Series A", "Series A"];
  const filterOptions = useMemo((): Record<FilterKey, string[]> => {
    const stages = data?.filters.investmentStage ?? [];
    const sorted = [...stages].sort((a, b) => {
      const ai = STAGE_ORDER.indexOf(a);
      const bi = STAGE_ORDER.indexOf(b);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
    return {
      investmentStage: sorted,
      sector: data?.filters.sector ?? [],
      year: data?.filters.year ?? [],
      status: data?.filters.status ?? [],
    };
  }, [data]);

  const filteredCompanies = useMemo(() => {
    if (!data) return [];

    const filtered = data.companies.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        if (!c.brandName.toLowerCase().includes(q)) return false;
      }
      if (
        activeFilters.investmentStage.size > 0 &&
        !activeFilters.investmentStage.has(c.investmentStage)
      )
        return false;
      if (
        activeFilters.sector.size > 0 &&
        !activeFilters.sector.has(c.sector)
      )
        return false;
      if (
        activeFilters.status.size > 0 &&
        !activeFilters.status.has(c.status)
      )
        return false;

      return true;
    });

    return filtered.sort((a, b) =>
      a.brandName.localeCompare(b.brandName, undefined, {
        sensitivity: "base",
        numeric: true,
      })
    );
  }, [data, searchQuery, activeFilters]);

  const rowsCount = Math.ceil(filteredCompanies.length / 3);

  return (
    <section
      ref={sectionRef}
      id="portfolio-grid"
      // REMOVED overflow-hidden, ADDED overflow-x-clip if needed for animations
      className="relative flex w-full flex-col items-center overflow-x-clip bg-[#FBF7F0]"
      style={{
        paddingTop: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingBottom: "clamp(60px, min(8vw, 12vh), 120px)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col lg:flex-row items-start relative">
        
        {/* ── LEFT SIDEBAR FILTERS ── */}
        {/* data-lenis-prevent: Lenis runs in `root` mode and would otherwise
            swallow wheel events here and scroll the page instead of this list. */}
        <div
          data-lenis-prevent
          className="w-full lg:w-[280px] shrink-0 flex flex-col items-start max-lg:!gap-4 lg:sticky lg:top-[calc(var(--nav-height,80px)+20px)] lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent [&:hover::-webkit-scrollbar-thumb]:bg-black/25 [scrollbar-width:thin] [scrollbar-color:transparent_transparent] [&:hover]:[scrollbar-color:rgba(0,0,0,0.25)_transparent]"
          style={{ paddingRight: "clamp(12px, 1.5vw, 20px)" }}
        >
          <div className="flex w-full items-center justify-between pb-4 border-b border-[#000]/10">
            <span className={`text-[#000] ${BODY_BOLD_CLASS}`} style={HERO_BODY_STYLE}>
              Filters
            </span>
            <button
              type="button"
              onClick={clearAll}
              className="font-['Poppins',_sans-serif] text-[13px] text-[#666] hover:text-[#000] cursor-pointer"
            >
              Clear all
            </button>
          </div>

          <div className="w-full flex flex-col max-lg:!flex-row max-lg:!gap-2">
            {FILTER_CONFIG.map(({ key, label }, idx) => (
              <SidebarFilterSection
                key={key}
                label={label}
                options={filterOptions[key]}
                selected={activeFilters[key]}
                onToggle={(val) => toggleFilter(key, val)}
                defaultOpen={idx === 0}
              />
            ))}
          </div>
        </div>

        {/* ── RIGHT MAIN GRID AREA ── */}
        <div 
          className="flex-1 w-full flex flex-col"
          style={{ paddingLeft: "clamp(12px, 1.5vw, 20px)" }}
        >
          
          {/* SEARCH BAR */}
          {/* CHANGED: Removed max-w and justify-end. Added pl-[6px] to nudge it slightly away from the line */}
          <div className="w-full flex mb-[clamp(24px,3vw,40px)] max-lg:!mt-4 sticky top-[calc(var(--nav-height,80px)+20px)] z-20 pl-[6px]">
            
            <div className="relative flex items-center w-full bg-white rounded-full p-1.5 pl-6 shadow-md border border-[#000]/5">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="shrink-0 text-[#666] mr-3"
              >
                <path
                  d="M17.5 17.5L13.875 13.875M15.833 9.167a6.667 6.667 0 11-13.333 0 6.667 6.667 0 0113.333 0z"
                  stroke="currentColor"
                  strokeWidth="1.67"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Company name"
                className="w-full bg-transparent font-['Poppins',_sans-serif] text-[15px] text-[#000] outline-none placeholder:text-[#888]"
              />
              <button
                type="button"
                className="shrink-0 rounded-full bg-[#001A4D] px-8 py-3 font-['Poppins',_sans-serif] text-[14px] font-medium text-white transition-colors hover:bg-[#002A7C]"
              >
                Search
              </button>
            </div>
          </div>

          {/* GRID CONTENT */}
          {loading ? (
            <SkeletonGrid />
          ) : error ? (
            <div className="flex h-[200px] items-center justify-center text-[#667085]">
              <p className="font-['Poppins',_sans-serif]">{error}</p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="flex h-[200px] flex-col items-center justify-center gap-2">
              <p className="font-['Poppins',_sans-serif] font-medium text-[#344054] text-[16px]">
                No companies match your filters
              </p>
              <button
                type="button"
                onClick={clearAll}
                className="font-['Poppins',_sans-serif] text-[#001A4D] underline cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="relative w-full">
              
              {/* DESKTOP 3-COLUMN GRID */}
              <div className="hidden md:grid grid-cols-3 relative">
                
                {/* ── MAIN SEPARATOR LINE (Starts at grid level, always shows for col 1) ── */}
                <motion.div
                  className="hidden lg:block absolute left-0 top-0 bottom-0 w-[1px] bg-[#000]/15"
                  style={{ transformOrigin: "top" }}
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />

                {/* Vertical Grid Divider 1: Only show if there is an item in column 2 */}
                {filteredCompanies.length > 1 && (
                  <motion.div
                    className="absolute left-[33.333%] top-0 bottom-0 w-[1px] bg-[#000]/15"
                    style={{ transformOrigin: "top" }}
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                )}

                {/* Vertical Grid Divider 2: Only show if there is an item in column 3 */}
                {filteredCompanies.length > 2 && (
                  <motion.div
                    className="absolute left-[66.666%] top-0 bottom-0 w-[1px] bg-[#000]/15"
                    style={{ transformOrigin: "top" }}
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                )}

                {/* Grid Cells with Independent Animating Horizontal Dividers */}
                {filteredCompanies.map((company, i) => {
                  const rowIndex = Math.floor(i / 3);
                  const isLastRow = rowIndex === rowsCount - 1;

                  return (
                    <div
                      key={`${company.brandName}-${i}`}
                      className="relative flex items-center justify-center p-[clamp(12px,1.5vw,20px)]"
                    >
                      <CompanyCard company={company} />

                      {/* Separate Horizontal Line for each column cell */}
                      {!isLastRow && (
                        <motion.div
                          className="absolute bottom-0 left-[clamp(12px,1.5vw,20px)] right-[clamp(12px,1.5vw,20px)] h-[1px] bg-[#000]/15"
                          style={{ transformOrigin: "left" }}
                          initial={{ scaleX: 0 }}
                          whileInView={{ scaleX: 1 }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 1.2,
                            ease: "easeInOut",
                            delay: rowIndex * 0.05 + (i % 3) * 0.1,
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              {/* MOBILE 2-COLUMN GRID */}
              <div className="grid grid-cols-2 gap-3 md:hidden">
                {filteredCompanies.map((company, i) => (
                  <CompanyCard key={`mob-${company.brandName}-${i}`} company={company} />
                ))}
              </div>

            </div>
          )}

        </div>

      </div>
    </section>
  );
}