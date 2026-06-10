"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

/* Map specific sub-items to custom routes */
const subItemHrefs: Record<string, string> = {
  "Titan Winner Fund": "/winnerFund",
  "Titan Seed Funding": "/titanseedfund",
  "Portfolio": "/portfolio",
};

// Pre-configured mock data matching the screenshot categories
const menuData = [
  {
    id: "about",
    title: "ABOUT",
    subItems: ["Our Story", "Team", "Indicorns"],
  },
  {
    id: "for-founders",
    title: "FOR FOUNDERS",
    subItems: ["Get investment", "Beyond The Cheque", "Titan Seed Funding", "Titan Winner Fund"],
  },
  {
    id: "portfolio",
    title: "PORTFOLIO",
    subItems: [], // REMOVED SUBCATEGORIES
  },
  {
    id: "community",
    title: "COMMUNITY",
    subItems: ["Founder Stories", "Titan Ecosystem"],
  },
  {
    id: "perspective",
    title: "PERSPECTIVE",
    subItems: ["Blogs", "News", "Events"],
  },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);

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
      <nav className="fixed left-0 top-0 z-[40] flex h-[clamp(65px,min(5.5vw,7vh),80px)] w-full items-center justify-between bg-[linear-gradient(90deg,#001A4D_0%,#001A4D_58.17%,#003C82_74.52%,#06C_89.42%,#001A4D_100%)] px-4 lg:px-[clamp(32px,4.3vw,62px)]">
        
        {/* FLUID TOGGLE: Stays between 36px and 41px */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className="group relative flex h-[clamp(36px,2.84vw,41px)] w-[clamp(36px,2.84vw,41px)] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#EFEFEF] p-[clamp(8px,0.9vw,10px)] transition-all lg:bg-white"
          aria-label="Open Menu"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
            e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
          }}
        >
          <div 
            className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100" 
            style={{ 
              background: 'radial-gradient(circle 40px at var(--mouse-x, 50%) var(--mouse-y, 50%), #D6E4FF 0%, transparent 100%)' 
            }} 
          />
          
          {/* MOBILE SVG: 3-line hamburger (Hidden on Desktop) */}
          <svg className="relative z-10 block h-full w-full p-[2px] lg:hidden" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2.5" strokeLinecap="round">
            <line x1="2" y1="6" x2="22" y2="6" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <line x1="2" y1="18" x2="22" y2="18" />
          </svg>

          {/* DESKTOP SVG: Original 3-dots (Hidden on Mobile) */}
          <svg className="relative z-10 hidden h-full w-full lg:block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
            <path d="M17.7678 17.7678C18.2366 17.2989 18.5 16.663 18.5 16C18.5 15.337 18.2366 14.7011 17.7678 14.2322C17.2989 13.7634 16.663 13.5 16 13.5C15.337 13.5 14.7011 13.7634 14.2322 14.2322C13.7634 14.7011 13.5 15.337 13.5 16C13.5 16.663 13.7634 17.2989 14.2322 17.7678C14.7011 18.2366 15.337 18.5 16 18.5C16.663 18.5 17.2989 18.2366 17.7678 17.7678Z" fill="#001A4D" />
            <path d="M17.7678 29.2678C17.2989 29.7366 16.663 30 16 30C15.337 30 14.7011 29.7366 14.2322 29.2678C13.7634 28.7989 13.5 28.163 13.5 27.5C13.5 26.837 13.7634 26.2011 14.2322 25.7322C14.7011 25.2634 15.337 25 16 25C16.663 25 17.2989 25.2634 17.7678 25.7322C18.2366 26.2011 18.5 26.837 18.5 27.5C18.5 28.163 18.2366 28.7989 17.7678 29.2678Z" fill="#001A4D" />
            <path d="M17.7678 6.26777C18.2366 5.79893 18.5 5.16304 18.5 4.5C18.5 3.83696 18.2366 3.20107 17.7678 2.73223C17.2989 2.26339 16.663 2 16 2C15.337 2 14.7011 2.26339 14.2322 2.73223C13.7634 3.20107 13.5 3.83696 13.5 4.5C13.5 5.16304 13.7634 5.79893 14.2322 6.26777C14.7011 6.73661 15.337 7 16 7C16.663 7 17.2989 6.73661 17.7678 6.26777Z" fill="#001A4D" />
          </svg>
        </button>

        {/* LOGO: Absolutely centered */}
        <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 shrink-0">
          {/* FLUID LOGO: Stays between 100px and 127px */}
          <Image
            src="/images/logos/titancapitallogo.svg"
            alt="Titan Capital"
            width={127}
            height={42}
            priority
            className="h-[clamp(33px,2.91vw,42px)] w-[clamp(100px,8.81vw,127px)] object-cover brightness-0 invert"
          />
        </Link>

        {/* CTA BUTTON: Explicitly smaller sizes for Mobile, Desktop uses lg: clamps to remain fully intact */}
        <Link
          href="/get-investment"
          className="group relative flex shrink-0 items-center justify-center overflow-hidden rounded-[9px] bg-white font-['Libre_Baskerville',_serif] font-semibold leading-[107%] text-[#001A4D] 
            h-[36px] w-[110px] px-2 text-[11px] 
            lg:h-[clamp(40px,3.26vw,47px)] lg:w-[clamp(145px,12.98vw,187px)] lg:p-[clamp(8px,0.69vw,10px)] lg:text-[clamp(13px,1.11vw,16px)]"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
            e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
          }}
        >
          <div 
            className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100" 
            style={{ 
              background: 'radial-gradient(circle 70px at var(--mouse-x, 50%) var(--mouse-y, 50%), #D6E4FF 0%, transparent 100%)' 
            }} 
          />
          <span className="relative z-10 whitespace-nowrap">Get Investment</span>
        </Link>
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
                {menuData.map((item) => (
                  item.subItems.length > 0 ? (
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
                      href={`/${item.id}`}
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
                  {menuData
                    .find((m) => m.id === activeSubMenu)
                    ?.subItems.map((subItem, idx) => (
                      <Link
                        key={idx}
                        href={subItemHrefs[subItem] ?? `/${subItem.toLowerCase().replace(/\s+/g, "-")}`}
                        onClick={() => setIsMenuOpen(false)}
                        className="group flex items-center rounded-[10px] px-[12px] py-[12px] font-['Poppins',_sans-serif] text-[18px] font-normal leading-[150%] text-[#0E0E0E]/75 transition-all duration-300 ease-out hover:bg-[#001A4D]/[0.06] hover:text-[#001A4D] hover:translate-x-[4px] lg:text-[20px]"
                      >
                        {/* <span className="mr-[10px] h-[2px] w-0 rounded-full bg-[#001A4D] transition-all duration-300 ease-out group-hover:w-[16px]" /> */}
                        {subItem}
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