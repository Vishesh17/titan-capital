"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { useLenis } from "lenis/react";

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
      className="relative flex shrink-0 items-center justify-center overflow-hidden whitespace-nowrap font-['Poppins',_sans-serif] text-[min(1.16vw,1.79vh)] font-normal transition-colors duration-300 max-md:!w-[clamp(130px,35vw,160px)] max-md:!h-[clamp(38px,6dvh,44px)] max-md:!text-[clamp(12px,3.5vw,14px)]"
      style={{
        width: "min(12.15vw, 18.8vh)",
        height: "min(3.36vw, 5.19vh)",
        borderRadius: "53px",
        border: "1px solid #CDCDCD",
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
  const [scrolled, setScrolled] = useState(false);

  const lenis = useLenis(); 
  const { scrollY } = useScroll(); 

  // Restored the missing variables here!
  const sections = data?.sections?.length ? data.sections : FALLBACK_SECTIONS;
  const ctaLabel = data?.ctaLabel || FALLBACK_CTA_LABEL;
  const ctaUrl = data?.ctaUrl || FALLBACK_CTA_URL;

  useMotionValueEvent(scrollY, "change", (latest) => {
    const isScrolled = latest > 60;
    if (isScrolled !== scrolled) {
      setScrolled(isScrolled);
    }
  });

  useEffect(() => {
    if (isMenuOpen) {
      lenis?.stop(); 
      document.body.style.overflow = "hidden";
    } else {
      lenis?.start(); 
      document.body.style.overflow = ""; 
      const timer = setTimeout(() => setActiveSubMenu(null), 500);
      return () => clearTimeout(timer);
    }

    return () => {
      lenis?.start();
      document.body.style.overflow = "";
    };
  }, [isMenuOpen, lenis]);

  return (
    <>
      <nav className={`site-navbar fixed left-0 top-0 z-[40] flex h-[clamp(65px,min(5.5vw,7vh),80px)] w-full items-center justify-between px-4 transition-[background-color,color,transform,opacity] duration-500 ease-out max-md:!h-[clamp(56px,8dvh,64px)] max-md:!px-[clamp(16px,4vw,24px)] lg:px-[clamp(32px,4.3vw,62px)] ${
        scrolled ? "bg-[#001A4D]/95 shadow-lg backdrop-blur-md" : "bg-transparent"
      }`}>

        <button
          onClick={() => setIsMenuOpen(true)}
          className="flex shrink-0 cursor-pointer items-center justify-center p-[6px] transition-opacity hover:opacity-70"
          aria-label="Open Menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="17" viewBox="0 0 26 17" fill="none">
            <path d="M0 1.5V0H25.5V1.5H0ZM25.5 7.5V9H0V7.5H25.5ZM0 15H25.5V16.5H0V15Z" fill="white"/>
          </svg>
        </button>

        <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 shrink-0 max-md:!static max-md:!translate-x-0 max-md:!translate-y-0 max-md:!ml-auto">
          <Image
            src="/images/logos/titancapitallogo.svg"
            alt="Titan Capital"
            width={98}
            height={32}
            priority
            className="h-[32px] w-[98px] object-contain brightness-0 invert max-md:!h-[clamp(24px,4dvh,30px)] max-md:!w-[clamp(74px,12vw,92px)]"
          />
        </Link>

        <div className="hidden md:block">
          <NavCursorFillButton href={ctaUrl} label={ctaLabel} />
        </div>
      </nav>

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
          <div className="relative flex min-h-[70px] max-md:!min-h-[clamp(60px,10dvh,70px)] w-full shrink-0 items-center justify-between bg-[#001A4D] px-[24px] max-md:!px-[clamp(16px,4vw,24px)] lg:h-[var(--nav-height)] lg:px-[62px]">
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

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:hidden">
               <Image
                  src="/images/logos/titancapitallogo.svg"
                  alt="Titan Capital"
                  width={100}
                  height={32}
                  className="h-[32px] w-[100px] object-cover brightness-0 invert max-md:!h-[clamp(24px,4dvh,30px)] max-md:!w-[clamp(74px,12vw,92px)]"
                />
            </div>

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

            <div className={`h-full shrink-0 flex-col overflow-y-auto bg-[#001A4D] pb-[98px] pt-[20px] max-md:!pb-[clamp(60px,10dvh,98px)] max-md:!pt-[clamp(16px,3dvh,24px)] w-full lg:w-[480px] ${
                activeSubMenu ? "hidden lg:flex" : "flex"
              }`}
            >
              <div className="mb-[20px]">
                <Link
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="group flex w-full items-center border-l-[3px] border-transparent px-[21px] py-[8px] max-md:!px-[clamp(16px,4vw,24px)] max-md:!py-[clamp(8px,2dvh,12px)] transition-all duration-300 ease-out hover:border-l-[#4D8AFF] hover:bg-[#002868]/30 lg:px-[33px]"
                >
                  <span className="font-['Poppins',_sans-serif] text-[14px] max-md:!text-[clamp(13px,3.5vw,15px)] font-medium tracking-wide text-white/80 transition-all duration-300 group-hover:text-white">
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
                      className={`group flex w-full cursor-pointer items-center justify-between border-l-[3px] px-[21px] py-[16px] max-md:!px-[clamp(16px,4vw,24px)] max-md:!py-[clamp(12px,3dvh,20px)] transition-all duration-300 ease-out lg:px-[33px] ${
                        activeSubMenu === item.id
                          ? "border-l-[#4D8AFF] bg-[#002868]"
                          : "border-l-transparent hover:border-l-[#4D8AFF]/70 hover:bg-[#002868]/30"
                      }`}
                    >
                      <span className={`font-['Poppins',_sans-serif] text-[22px] max-md:!text-[clamp(18px,6vw,24px)] font-medium leading-[150%] transition-all duration-300 lg:text-[28px] ${
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
                      className="group flex w-full cursor-pointer items-center justify-between border-l-[3px] border-transparent px-[21px] py-[16px] max-md:!px-[clamp(16px,4vw,24px)] max-md:!py-[clamp(12px,3dvh,20px)] transition-all duration-300 ease-out hover:border-l-[#4D8AFF]/70 hover:bg-[#002868]/30 lg:px-[33px]"
                    >
                      <span className="font-['Poppins',_sans-serif] text-[22px] max-md:!text-[clamp(18px,6vw,24px)] font-medium leading-[150%] text-white/85 transition-all duration-300 group-hover:text-white lg:text-[28px]">
                        {item.title}
                      </span>
                    </Link>
                  )
                ))}
              </div>
            </div>

            <div
              className={`h-full shrink-0 overflow-hidden bg-[#FBF7F0] transition-[width] duration-500 ease-in-out ${
                activeSubMenu ? "w-full lg:w-[400px]" : "w-0"
              }`}
              aria-hidden={!activeSubMenu}
            >
              <div className="flex h-full w-full flex-col overflow-y-auto lg:w-[400px]">
                <div className="flex flex-col items-stretch gap-[4px] px-[16px] pb-[40px] pt-[40px] max-md:!px-[clamp(16px,4vw,24px)] max-md:!pt-[clamp(24px,5dvh,40px)] lg:px-[28px] lg:pt-[60px]">
                  {sections
                    .find((m) => m.id === activeSubMenu)
                    ?.subItems?.map((subItem, idx) => (
                      <Link
                        key={idx}
                        href={subItem.url || `/${subItem.label.toLowerCase().replace(/\s+/g, "-")}`}
                        onClick={() => setIsMenuOpen(false)}
                        className="group flex items-center rounded-[10px] px-[12px] py-[12px] max-md:!px-[clamp(12px,3vw,16px)] max-md:!py-[clamp(10px,2.5dvh,14px)] font-['Poppins',_sans-serif] text-[18px] max-md:!text-[clamp(16px,5vw,20px)] font-normal leading-[150%] text-[#0E0E0E]/75 transition-all duration-300 ease-out hover:bg-[#001A4D]/[0.06] hover:text-[#001A4D] hover:translate-x-[4px] lg:text-[20px]"
                      >
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