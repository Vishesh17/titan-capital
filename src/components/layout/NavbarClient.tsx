"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

/* ─── Cursor-origin fill button (shared) ─── */
function NavCursorFillButton({ href, label }: { href: string; label: string }) {
  const [origin, setOrigin] = useState("50% 50%");
  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
    setHovered(true);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
    setHovered(false);
  };

  return (
    <Link
      href={href}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative flex shrink-0 items-center justify-center overflow-hidden font-['Poppins',_sans-serif] font-medium transition-colors duration-300"
      style={{
        width: "197px",
        height: "49px",
        borderRadius: "51px",
        border: "1px solid #CDCDCD",
        fontSize: "16px",
        lineHeight: "140%",
        color: hovered ? "#001A4D" : "white",
      }}
    >
      <span
        className="absolute inset-0 bg-white transition-transform duration-400 ease-out"
        style={{
          transformOrigin: origin,
          transform: hovered ? "scale(1)" : "scale(0)",
          borderRadius: "inherit",
        }}
      />
      <span className="relative z-10">{label}</span>
    </Link>
  );
}

export type NavbarSubItem = {
  label: string;
  url: string;
};

export type NavbarSection = {
  id: string;
  title: string;
  directUrl?: string;
  subItems?: NavbarSubItem[];
};

export type NavbarData = {
  sections?: NavbarSection[];
  ctaLabel?: string;
  ctaUrl?: string;
};

const FALLBACK_SECTIONS: NavbarSection[] = [
  {
    id: "for-founders",
    title: "FOR FOUNDERS",
    subItems: [
      { label: "Get Investment", url: "/getinvestment" },
      { label: "Titan Seed Fund", url: "/titanSeedFund" },
      { label: "Titan Winners Fund", url: "/winnersFund" },
    ],
  },
  {
    id: "portfolio",
    title: "PORTFOLIO",
    directUrl: "/portfolio",
    subItems: [],
  },
  {
    id: "about",
    title: "ABOUT US ",
    subItems: [
      { label: "Our Story", url: "/ourstory" },
      { label: "Our Team", url: "/ourTeam" },
      { label: "Beyond The Cheque", url: "/beyondTheCheque" },
    ],
  },
];

const FALLBACK_CTA_LABEL = "Get Investment";
const FALLBACK_CTA_URL = "/getinvestment";

export default function NavbarClient({ data }: { data?: NavbarData }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  /* Transparent over the hero; picks up a solid navy bar once the user
     scrolls past it, so the white logo/links stay readable over the
     light sections below. */
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const sections = data?.sections?.length ? data.sections : FALLBACK_SECTIONS;
  const ctaLabel = data?.ctaLabel || FALLBACK_CTA_LABEL;
  const ctaUrl = data?.ctaUrl || FALLBACK_CTA_URL;

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
      const timer = setTimeout(() => setActiveSubMenu(null), 500);
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  return (
    <>
     {/* =========================================
          MAIN TOP NAVBAR (Closed State)
          ========================================= */}
      {/* FLUID BUT TIGHT: Height stays between 65px and 80px */}
      <nav className={`fixed left-0 top-0 z-[40] flex h-[clamp(65px,min(5.5vw,7vh),80px)] w-full items-center justify-between px-4 transition-colors duration-300 ease-out max-md:!h-[56px] max-md:!px-[16px] lg:px-[clamp(32px,4.3vw,62px)] ${
        scrolled ? "bg-[#001A4D]/95 shadow-lg backdrop-blur-md" : "bg-transparent"
      }`}>

        {/* HAMBURGER — white 3-line SVG */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className="flex shrink-0 cursor-pointer items-center justify-center p-[6px] transition-opacity hover:opacity-70"
          aria-label="Open Menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="17" viewBox="0 0 26 17" fill="none">
            <path d="M0 1.5V0H25.5V1.5H0ZM25.5 7.5V9H0V7.5H25.5ZM0 15H25.5V16.5H0V15Z" fill="white"/>
          </svg>
        </button>

        {/* LOGO: Absolutely centered on desktop, right-aligned on mobile */}
        <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 shrink-0 max-md:!static max-md:!translate-x-0 max-md:!translate-y-0 max-md:!ml-auto">
          <Image
            src="/images/logos/titancapitallogo.svg"
            alt="Titan Capital"
            width={98}
            height={32}
            priority
            className="h-[32px] w-[98px] object-contain brightness-0 invert max-md:!h-[26px] max-md:!w-[80px]"
          />
        </Link>

        {/* CTA BUTTON: Pill with cursor-origin fill — hidden on mobile */}
        <div className="hidden md:block">
          <NavCursorFillButton href={ctaUrl} label={ctaLabel} />
        </div>
      </nav>

     {/* =========================================
          FULL-SCREEN MENU OVERLAY (Open State)
          ========================================= */}
      <div
        className={`fixed inset-0 z-[50] flex ${
          isMenuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer transition-opacity duration-500 ease-in-out ${
            isMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMenuOpen(false)}
          aria-label="Close menu by clicking outside"
        />

        <div
          className={`relative z-10 flex h-full w-full max-w-full flex-col shadow-2xl transition-transform duration-500 ease-in-out lg:w-auto ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >

          {/* Inner top navbar - Responsive Logo Alignment */}
          <div className="relative flex min-h-[70px] w-full shrink-0 items-center justify-between bg-[#001A4D] px-[24px] lg:h-[var(--nav-height)] lg:px-[62px]">
            <button
              onClick={() => setIsMenuOpen(false)}
              className="relative z-10 cursor-pointer transition-opacity hover:opacity-70"
              aria-label="Close Menu"
            >
              <svg className="h-[28px] w-[28px]" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M14 16l-4-4 4-4" fill="white" />
              </svg>
            </button>

            {/* Mobile: Always Centered Logo inside open menu */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:hidden">
               <Image
                  src="/images/logos/titancapitallogo.svg"
                  alt="Titan Capital"
                  width={100}
                  height={32}
                  className="h-[32px] w-[100px] object-cover brightness-0 invert"
                />
            </div>

            {/* Desktop: Original Right-Aligned Logo when SubMenu is Active */}
            <div className="hidden lg:block">
              {activeSubMenu && (
                <Image
                  src="/images/logos/titancapitallogo.svg"
                  alt="Titan Capital"
                  width={127}
                  height={42}
                  className="h-[42px] w-[127px] object-cover brightness-0 invert"
                />
              )}
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden bg-transparent">

            {/* LEFT PANEL — Responsive Width & Visibility Logic */}
            <div className={`h-full shrink-0 flex-col overflow-y-auto bg-[#001A4D] pb-[98px] pt-[20px] w-full lg:w-[480px] ${
                activeSubMenu ? "hidden lg:flex" : "flex"
              }`}
            >
              <div className="mb-[20px]">
                <Link
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="group flex w-full items-center border-l-[3px] border-transparent px-[21px] py-[8px] transition-all duration-300 ease-out hover:border-l-[#4D8AFF] hover:bg-[#002868]/30 lg:px-[33px]"
                >
                  <span className="font-['Libre_Baskerville',_serif] text-[14px] font-medium tracking-wide text-white/80 transition-all duration-300 group-hover:text-white">
                    HOME
                  </span>
                </Link>
              </div>

              <div className="flex w-full flex-col">
                {sections.map((item) => (
                  (item.subItems?.length ?? 0) > 0 ? (
                    <button
                      key={item.id}
                      onClick={() => setActiveSubMenu(item.id === activeSubMenu ? null : item.id)}
                      className={`group flex w-full cursor-pointer items-center justify-between border-l-[3px] px-[21px] py-[16px] transition-all duration-300 ease-out lg:px-[33px] ${
                        activeSubMenu === item.id
                          ? "border-l-[#4D8AFF] bg-[#002868]"
                          : "border-l-transparent hover:border-l-[#4D8AFF]/70 hover:bg-[#002868]/30"
                      }`}
                    >
                      <span className={`font-['Libre_Baskerville',_serif] text-[22px] font-medium leading-[150%] transition-all duration-300 lg:text-[28px] ${
                        activeSubMenu === item.id ? "text-white" : "text-white/85 group-hover:text-white"
                      }`}>
                        {item.title}
                      </span>

                      <svg
                        className={`transition-transform duration-300 ease-out ${
                          activeSubMenu === item.id ? "translate-x-[2px]" : "group-hover:translate-x-[3px]"
                        }`}
                        width="12" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  ) : (
                    <Link
                      key={item.id}
                      href={item.directUrl || `/${item.id}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="group flex w-full cursor-pointer items-center justify-between border-l-[3px] border-transparent px-[21px] py-[16px] transition-all duration-300 ease-out hover:border-l-[#4D8AFF]/70 hover:bg-[#002868]/30 lg:px-[33px]"
                    >
                      <span className="font-['Libre_Baskerville',_serif] text-[22px] font-medium leading-[150%] text-white/85 transition-all duration-300 group-hover:text-white lg:text-[28px]">
                        {item.title}
                      </span>
                    </Link>
                  )
                ))}
              </div>
            </div>

            {/* RIGHT PANEL — Responsive Width & Visibility Logic */}
            <div
              className={`h-full shrink-0 overflow-hidden bg-[#FBF7F0] transition-[width] duration-500 ease-in-out ${
                activeSubMenu ? "w-full lg:w-[400px]" : "w-0"
              }`}
              aria-hidden={!activeSubMenu}
            >
              <div className="flex h-full w-[100vw] flex-col overflow-y-auto lg:w-[400px]">
                <div className="flex flex-col items-stretch gap-[4px] px-[16px] pb-[40px] pt-[40px] lg:px-[28px] lg:pt-[60px]">
                  {sections
                    .find((m) => m.id === activeSubMenu)
                    ?.subItems?.map((subItem, idx) => (
                      <Link
                        key={idx}
                        href={subItem.url || `/${subItem.label.toLowerCase().replace(/\s+/g, "-")}`}
                        onClick={() => setIsMenuOpen(false)}
                        className="group flex items-center rounded-[10px] px-[12px] py-[12px] font-['Poppins',_sans-serif] text-[18px] font-normal leading-[150%] text-[#0E0E0E]/75 transition-all duration-300 ease-out hover:bg-[#001A4D]/[0.06] hover:text-[#001A4D] hover:translate-x-[4px] lg:text-[20px]"
                      >
                        {/* <span className="mr-[10px] h-[2px] w-0 rounded-full bg-[#001A4D] transition-all duration-300 ease-out group-hover:w-[16px]" /> */}
                        {subItem.label}
                      </Link>
                    ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
