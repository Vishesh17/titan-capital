"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

/** URL slug from brand name: lowercase, alphanumerics joined by hyphens. */
function companySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ═══════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════ */

const ITEMS_PER_PAGE = 300;

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
  fundType: string;
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
  fundType: string[];
}

interface APIResponse {
  companies: Company[];
  filters: Filters;
}

/* Filter config — order matches the design. */
const FILTER_CONFIG = [
  { key: "fundType" as const, label: "Fund Type" },
  { key: "investmentStage" as const, label: "Stage" },
  { key: "sector" as const, label: "Sector" },
  { key: "status" as const, label: "Status" },
];

type FilterKey = "fundType" | "investmentStage" | "sector" | "year" | "status";

/* ═══════════════════════════════════════════════════════
   Mobile Filter Panel — category tabs + checkboxes
   ═══════════════════════════════════════════════════════ */

function MobileFilterPanel({
  filterOptions,
  activeFilters,
  onToggle,
}: {
  filterOptions: Record<FilterKey, string[]>;
  activeFilters: Record<FilterKey, Set<string>>;
  onToggle: (key: FilterKey, val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterKey>("fundType");
  const panelRef = useRef<HTMLDivElement>(null);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const totalActive = Object.values(activeFilters).reduce(
    (sum, s) => sum + s.size,
    0
  );

  return (
    <div ref={panelRef} className="relative">
      {/* Filter icon button */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="relative flex shrink-0 items-center justify-center"
        style={{ width: 24, height: 24 }}
        aria-label="Filters"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M21.25 11.9999H8.895M4.534 11.9999H2.75M4.534 11.9999C4.534 11.4217 4.76368 10.8672 5.17251 10.4584C5.58134 10.0496 6.13583 9.81989 6.714 9.81989C7.29217 9.81989 7.84666 10.0496 8.25549 10.4584C8.66432 10.8672 8.894 11.4217 8.894 11.9999C8.894 12.5781 8.66432 13.1326 8.25549 13.5414C7.84666 13.9502 7.29217 14.1799 6.714 14.1799C6.13583 14.1799 5.58134 13.9502 5.17251 13.5414C4.76368 13.1326 4.534 12.5781 4.534 11.9999ZM21.25 18.6069H15.502M15.502 18.6069C15.502 19.1852 15.2718 19.7403 14.8628 20.1492C14.4539 20.5582 13.8993 20.7879 13.321 20.7879C12.7428 20.7879 12.1883 20.5572 11.7795 20.1484C11.3707 19.7396 11.141 19.1851 11.141 18.6069M15.502 18.6069H2.75M21.25 5.39289H18.145M13.784 5.39289H2.75M13.784 5.39289C13.784 4.81472 14.0137 4.26023 14.4225 3.8514C14.8313 3.44257 15.3858 3.21289 15.964 3.21289C16.2503 3.21289 16.5338 3.26928 16.7983 3.37883C17.0627 3.48839 17.3031 3.64897 17.5055 3.8514C17.7079 4.05383 17.8685 4.29415 17.9781 4.55864C18.0876 4.82313 18.144 5.10661 18.144 5.39289C18.144 5.67917 18.0876 5.96265 17.9781 6.22714C17.8685 6.49163 17.7079 6.73195 17.5055 6.93438C17.3031 7.13681 17.0627 7.29739 16.7983 7.40695C16.5338 7.5165 16.2503 7.57289 15.964 7.57289C15.3858 7.57289 14.8313 7.34321 14.4225 6.93438C14.0137 6.52555 13.784 5.97106 13.784 5.39289Z" stroke="black" strokeMiterlimit="10" strokeLinecap="round"/>
        </svg>
        {/* Active count badge */}
        {totalActive > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[14px] w-[14px] items-center justify-center rounded-full bg-[#001A4D] text-[8px] font-medium text-white">
            {totalActive}
          </span>
        )}
      </button>

      {/* Filter panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full z-50 mt-2 flex overflow-hidden rounded-[12px] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.12)]"
            style={{ width: 280, height: 260 }}
          >
            {/* Left — category tabs */}
            <div
              className="flex flex-col border-r border-[#F0F0F0]"
              style={{ width: "45%" }}
            >
              {FILTER_CONFIG.map(({ key, label }) => {
                const isActive = activeTab === key;
                const count = activeFilters[key].size;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveTab(key)}
                    className={`flex items-center justify-between px-3 py-[10px] text-left font-['Poppins',_sans-serif] text-[12px] transition-colors ${
                      isActive
                        ? "bg-[#EBF0FF] font-medium text-[#001A4D]"
                        : "text-[#344054] hover:bg-[#F9FAFB]"
                    }`}
                  >
                    <span className="truncate">{label}</span>
                    {count > 0 && (
                      <span className="ml-1 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#001A4D] px-1 text-[9px] font-medium text-white">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right — checkbox options */}
            <div
              className="flex-1 overflow-y-auto"
              style={{ maxHeight: 260 }}
            >
              {filterOptions[activeTab].length === 0 ? (
                <div className="px-3 py-4 font-['Poppins',_sans-serif] text-[11px] text-[#98A2B3]">
                  No options
                </div>
              ) : (
                filterOptions[activeTab].map((opt) => {
                  const checked = activeFilters[activeTab].has(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => onToggle(activeTab, opt)}
                      className="flex w-full items-center gap-2 px-3 py-[9px] text-left font-['Poppins',_sans-serif] text-[12px] text-[#344054] transition-colors hover:bg-[#F9FAFB]"
                    >
                      <span
                        className={`flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
                          checked
                            ? "border-[#001A4D] bg-[#001A4D]"
                            : "border-[#D0D5DD] bg-white"
                        }`}
                      >
                        {checked && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <span className="truncate">{opt}</span>
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
   Dropdown Component
   ═══════════════════════════════════════════════════════ */

function FilterDropdown({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: Set<string>;
  onToggle: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const hasSelection = selected.size > 0;

  return (
    <div ref={ref} className="relative">
      <motion.button
        type="button"
        onClick={() => setOpen((p) => !p)}
        whileHover={{ scale: 1.04, y: -1 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className={`
          flex items-center justify-between whitespace-nowrap transition-all duration-200
          ${
            hasSelection
              ? "border-[#001A4D] bg-[#001A4D] text-white shadow-[0_2px_8px_rgba(0,26,77,0.25)] hover:shadow-[0_4px_14px_rgba(0,26,77,0.35)]"
              : "border-[#9A9A9A] bg-white text-[#344054] hover:border-[#001A4D] hover:text-[#001A4D] hover:shadow-[0_2px_10px_rgba(0,26,77,0.10)]"
          }
        `}
        style={{
          width: "clamp(120px, min(10.3vw, 15vh), 149px)",
          height: "clamp(32px, min(2.6vw, 3.8vh), 38px)",
          borderRadius: "6px",
          borderWidth: "0.5px",
          borderStyle: "solid",
          paddingLeft: "clamp(12px, min(1.4vw, 2vh), 20px)",
          paddingRight: "clamp(6px, min(0.7vw, 1vh), 10px)",
          fontSize: "clamp(11px, min(1vw, 1.5vh), 14px)",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <span className="flex items-center gap-[4px] truncate">
          {label}
        </span>
        <motion.svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="shrink-0"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </motion.button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 top-full z-50 mt-[6px] overflow-hidden rounded-[10px] border border-[#E4E7EC] bg-white shadow-lg"
            style={{
              minWidth: "clamp(160px, 14vw, 220px)",
              maxHeight: "260px",
            }}
          >
            <div className="overflow-y-auto" style={{ maxHeight: "260px" }}>
              {options.length === 0 ? (
                <div
                  className="px-4 py-3 font-['Poppins',_sans-serif] text-[#98A2B3]"
                  style={{ fontSize: "clamp(11px, min(1vw, 1.5vh), 13px)" }}
                >
                  No options available
                </div>
              ) : (
                options.map((opt) => {
                  const isActive = selected.has(opt);
                  return (
                    <motion.button
                      key={opt}
                      type="button"
                      onClick={() => onToggle(opt)}
                      whileHover={{ x: 3, backgroundColor: isActive ? "rgba(240,244,255,1)" : "rgba(249,250,251,1)" }}
                      transition={{ duration: 0.15 }}
                      className={`
                        flex w-full items-center gap-[8px] text-left transition-colors duration-150
                        ${isActive ? "bg-[#F0F4FF] text-[#001A4D]" : "text-[#344054]"}
                      `}
                      style={{
                        padding:
                          "clamp(8px, min(0.8vw, 1.2vh), 12px) clamp(12px, min(1.2vw, 1.7vh), 16px)",
                        fontSize: "clamp(11px, min(1vw, 1.5vh), 14px)",
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      <span
                        className={`
                          flex shrink-0 items-center justify-center rounded-[4px] border transition-colors
                          ${isActive ? "border-[#001A4D] bg-[#001A4D]" : "border-[#D0D5DD] bg-white"}
                        `}
                        style={{
                          width: "clamp(14px, min(1.2vw, 1.8vh), 18px)",
                          height: "clamp(14px, min(1.2vw, 1.8vh), 18px)",
                        }}
                      >
                        {isActive && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path
                              d="M2 5L4 7L8 3"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      {opt}
                    </motion.button>
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
   Company Card
   ═══════════════════════════════════════════════════════ */

   function CompanyCard({ company }: { company: Company }) {
    const founderImage = company.founderImage;
    const cardRadius = "clamp(8px,0.83vw,12px)";

    return (
      <Link
        href={`/portfolio/${companySlug(company.brandName)}`}
        className="group relative block rounded-[clamp(8px,0.83vw,12px)] transition-shadow duration-300 hover:shadow-[0_2px_16px_rgba(0,0,0,0.08)] [perspective:1200px]"
        style={{ aspectRatio: "1 / 1" }}
      >
        {/* Flipper — rotates Y on hover only when a founder image exists */}
        <div
          className={`relative h-full w-full transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d] ${
            founderImage ? "group-hover:[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* ── FRONT FACE — logo + tag ── */}
          <div
            className="absolute inset-0 flex items-center justify-center overflow-hidden border border-[#F0F0F0] bg-white [backface-visibility:hidden]"
            style={{ borderRadius: cardRadius }}
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
                {company.tags === "Recent Investment" ? "Recent investment" : company.tags}
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

          {/* ── BACK FACE — founder portrait + white logo + arrow (only if founderImage exists) ── */}
          {founderImage && (
            <div
              className="absolute inset-0 overflow-hidden border border-[#F0F0F0] [backface-visibility:hidden] [transform:rotateY(180deg)]"
              style={{ borderRadius: cardRadius }}
            >
              <Image
                src={founderImage}
                alt={`${company.brandName} founder`}
                fill
                sizes="(max-width: 640px) 40vw, (max-width: 1024px) 25vw, 16vw"
                className="object-cover object-top"
              />
              {company.logo && (
                <Image
                  src={company.logo}
                  alt={`${company.brandName} logo`}
                  width={120}
                  height={120}
                  sizes="(max-width: 640px) 12vw, (max-width: 1024px) 8vw, 5vw"
                  className="absolute object-contain object-right-top"
                  style={{
                    top: "clamp(6px, min(0.7vw, 1vh), 12px)",
                    right: "clamp(6px, min(0.7vw, 1vh), 12px)",
                    width: "clamp(48px, min(4.8vw, 7vh), 76px)",
                    height: "auto",
                    maxHeight: "clamp(48px, min(4.8vw, 7vh), 76px)",
                    filter: "brightness(0) invert(1)",
                  }}
                />
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
   Skeleton Loader
   ═══════════════════════════════════════════════════════ */

function SkeletonGrid() {
  return (
    <div className="grid w-full grid-cols-2 gap-[clamp(10px,1.2vw,16px)] sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-[clamp(8px,0.83vw,12px)] border border-[#F0F0F0] bg-white/60"
          style={{ aspectRatio: "1 / 1" }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════ */

export default function PortfolioGrid() {
  const [data, setData] = useState<APIResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<FilterKey, Set<string>>>({
    fundType: new Set(),
    investmentStage: new Set(),
    sector: new Set(),
    year: new Set(),
    status: new Set(),
  });

  const searchInputRef = useRef<HTMLInputElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const res = await fetch("/api/portfolio");
        if (!res.ok) throw new Error("Failed to load portfolio data");
        const json: APIResponse = await res.json();
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilters]);

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

  const removeChip = useCallback((key: FilterKey, value: string) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      const set = new Set(prev[key]);
      set.delete(value);
      next[key] = set;
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSearchQuery("");
    setActiveFilters({
      fundType: new Set(),
      investmentStage: new Set(),
      sector: new Set(),
      year: new Set(),
      status: new Set(),
    });
  }, []);

  const filterOptions = useMemo((): Record<FilterKey, string[]> => {
    return {
      fundType: data?.filters.fundType ?? [],
      investmentStage: data?.filters.investmentStage ?? [],
      sector: data?.filters.sector ?? [],
      year: data?.filters.year ?? [],
      status: data?.filters.status ?? [],
    };
  }, [data]);

  const activeChips = useMemo(() => {
    const chips: { key: FilterKey; value: string }[] = [];
    for (const { key } of FILTER_CONFIG) {
      for (const value of activeFilters[key]) {
        chips.push({ key, value });
      }
    }
    return chips;
  }, [activeFilters]);

  /* ── FILTER AND SORT ALPHABETICALLY ── */
  const filteredCompanies = useMemo(() => {
    if (!data) return [];

    const filtered = data.companies.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        if (!c.brandName.toLowerCase().includes(q)) return false;
      }
      if (activeFilters.fundType.size > 0 && !activeFilters.fundType.has(c.fundType))
        return false;
      if (activeFilters.investmentStage.size > 0 && !activeFilters.investmentStage.has(c.investmentStage))
        return false;
      if (activeFilters.sector.size > 0 && !activeFilters.sector.has(c.sector))
        return false;
      if (activeFilters.year.size > 0 && !activeFilters.year.has(c.year))
        return false;
      if (activeFilters.status.size > 0 && !activeFilters.status.has(c.status))
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

  const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE);
  const paginatedCompanies = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCompanies.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCompanies, currentPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    if (sectionRef.current) {
      const top =
        sectionRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex w-full flex-col items-center overflow-hidden"
      style={{
        background: "#FBF7F0",
        paddingTop: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingBottom: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col">

        {/* ══════════════════════════════════════════
            MOBILE SEARCH + FILTER  (<lg)
            ══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-6 flex w-full flex-col items-center lg:hidden"
        >
          <div
            className="relative flex w-full items-center gap-[10px] rounded-[8px] bg-white"
            style={{ height: 44, padding: "10px" }}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="shrink-0 text-[#667085]">
              <path d="M17.5 17.5L13.875 13.875M15.833 9.167a6.667 6.667 0 11-13.333 0 6.667 6.667 0 0113.333 0z" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Company name"
              className="min-w-0 flex-1 bg-transparent font-['Poppins',_sans-serif] text-[13px] text-[#101828] outline-none placeholder:text-[#98A2B3]"
            />

            <MobileFilterPanel
              filterOptions={filterOptions}
              activeFilters={activeFilters}
              onToggle={toggleFilter}
            />
          </div>

          {/* Active filter chips (mobile) */}
          <AnimatePresence>
            {activeChips.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="mt-3 flex w-full flex-wrap gap-[6px] overflow-hidden"
              >
                {activeChips.map((chip) => (
                  <motion.button
                    key={`m-${chip.key}-${chip.value}`}
                    type="button"
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => removeChip(chip.key, chip.value)}
                    className="flex items-center gap-1 rounded-full bg-[#001A4D] px-[10px] py-[5px] font-['Poppins',_sans-serif] text-[10px] font-medium text-white"
                  >
                    {chip.value}
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                      <path d="M7.5 2.5L2.5 7.5M2.5 2.5L7.5 7.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </motion.button>
                ))}
                <button
                  type="button"
                  onClick={clearAll}
                  className="font-['Poppins',_sans-serif] text-[10px] text-[#667085]"
                >
                  Clear all
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ══════════════════════════════════════════
            DESKTOP SEARCH + FILTERS  (lg+)
            ══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-[clamp(28px,min(3.5vw,5vh),48px)] hidden w-full flex-col lg:flex"
          style={{
            maxWidth: "1393px",
            borderRadius: "26px",
            background: "#FFF",
            padding: "clamp(28px, min(2.78vw, 4.07vh), 40px) clamp(20px, min(3.13vw, 4.58vh), 45px) clamp(28px, min(2.78vw, 4.07vh), 40px) clamp(16px, min(1.6vw, 2.34vh), 23px)",
          }}
        >
          {/* ── Search bar ── */}
          <div
            className="flex w-full items-center bg-[#F4F4F4] transition-colors focus-within:ring-1 focus-within:ring-[#001A4D]"
            style={{
              height: "clamp(50px, min(4.9vw, 7.2vh), 71px)",
              borderRadius: "12px",
              paddingLeft: "clamp(16px, min(2vw, 3vh), 30px)",
              paddingRight: "clamp(12px, min(1.4vw, 2vh), 20px)",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className="shrink-0 text-[#667085]"
              style={{
                width: "clamp(16px, min(1.4vw, 2vh), 22px)",
                height: "clamp(16px, min(1.4vw, 2vh), 22px)",
              }}
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
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Company name"
              className="mx-[clamp(12px,1.5vw,20px)] flex-1 bg-transparent font-['Poppins',_sans-serif] text-[#101828] outline-none placeholder:text-[#98A2B3]"
              style={{ fontSize: "clamp(13px, min(1.1vw, 1.6vh), 16px)" }}
            />

            <motion.button
              type="button"
              onClick={() => {
                setSearchQuery("");
                searchInputRef.current?.focus();
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mr-[clamp(10px,1vw,16px)] font-['Poppins',_sans-serif] text-[#667085] transition-colors hover:text-[#001A4D]"
              style={{
                fontSize: "clamp(12px, min(1vw, 1.4vh), 14px)",
                fontWeight: 400,
              }}
            >
              Clear
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.05, boxShadow: "0 4px 16px rgba(0,26,77,0.3)" }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="shrink-0 rounded-[8px] bg-[#001A4D] text-white shadow-[0_2px_8px_rgba(0,26,77,0.15)] transition-colors hover:bg-[#002A7C]"
              style={{
                padding:
                  "clamp(6px, min(0.7vw, 1vh), 10px) clamp(16px, min(1.8vw, 2.5vh), 24px)",
                fontSize: "clamp(12px, min(1vw, 1.4vh), 14px)",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 500,
              }}
            >
              Search
            </motion.button>
          </div>

          {/* ── Filter dropdowns row ── */}
          <div
            className="flex w-full flex-wrap items-center"
            style={{
              marginTop: "clamp(16px, min(1.39vw, 2.03vh), 20px)",
              gap: "clamp(12px, min(1vw, 1.5vh), 16px)",
              paddingRight: "clamp(12px, min(1.4vw, 2vh), 20px)",
            }}
          >
            {FILTER_CONFIG.map(({ key, label }) => (
              <FilterDropdown
                key={key}
                label={label}
                options={filterOptions[key]}
                selected={activeFilters[key]}
                onToggle={(val) => toggleFilter(key, val)}
              />
            ))}

            <motion.button
              type="button"
              onClick={clearAll}
              whileHover={{ scale: 1.05, x: 2 }}
              whileTap={{ scale: 0.95 }}
              className="ml-auto font-['Poppins',_sans-serif] text-[#667085] transition-colors hover:text-[#001A4D]"
              style={{
                fontSize: "clamp(11px, min(1vw, 1.5vh), 14px)",
                fontWeight: 400,
              }}
            >
              Clear all
            </motion.button>
          </div>

          {/* ── Active filter chips ── */}
          <div className="w-full">
            <AnimatePresence>
              {activeChips.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="flex flex-wrap overflow-hidden"
                  style={{
                    marginTop: "clamp(12px, min(1.1vw, 1.6vh), 16px)",
                    gap: "clamp(6px, min(0.6vw, 0.9vh), 10px)",
                  }}
                >
                  {activeChips.map((chip) => (
                    <motion.button
                      key={`${chip.key}-${chip.value}`}
                      type="button"
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ scale: 1.06, boxShadow: "0 3px 12px rgba(0,26,77,0.3)" }}
                      whileTap={{ scale: 0.92 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => removeChip(chip.key, chip.value)}
                      className="flex items-center gap-[clamp(4px,0.4vw,8px)] rounded-full bg-[#001A4D] text-white shadow-[0_2px_6px_rgba(0,26,77,0.2)]"
                      style={{
                        padding:
                          "clamp(6px, min(0.6vw, 0.8vh), 9px) clamp(12px, min(1.2vw, 1.7vh), 18px)",
                        fontSize: "clamp(10px, min(0.9vw, 1.3vh), 14px)",
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 500,
                      }}
                    >
                      {chip.value}
                      <motion.svg
                        width="10" height="10" viewBox="0 0 10 10" fill="none"
                        whileHover={{ rotate: 90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <path
                          d="M7.5 2.5L2.5 7.5M2.5 2.5L7.5 7.5"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </motion.svg>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── CARD GRID ── */}
        {loading ? (
          <SkeletonGrid />
        ) : error ? (
          <div className="flex h-[200px] items-center justify-center text-[#667085]">
            <p className="font-['Poppins',_sans-serif]">{error}</p>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-[200px] flex-col items-center justify-center gap-[8px]"
          >
            <p
              className="font-['Poppins',_sans-serif] font-medium text-[#344054]"
              style={{ fontSize: "clamp(14px, min(1.3vw, 1.9vh), 18px)" }}
            >
              No companies match your filters
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="font-['Poppins',_sans-serif] text-[#001A4D] underline transition-opacity hover:opacity-70"
              style={{ fontSize: "clamp(12px, min(1vw, 1.5vh), 14px)" }}
            >
              Clear all filters
            </button>
          </motion.div>
        ) : (
          <>
            <div
              className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
              style={{ gap: "clamp(12px, min(1.4vw, 2vh), 20px)" }}
            >
              {paginatedCompanies.map((company, i) => (
                <CompanyCard key={`${company.brandName}-${i}`} company={company} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}