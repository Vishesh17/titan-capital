"use client";

import Image from "next/image";
import Link from "next/link";

/*
  RESPONSIVE STRATEGY — clamp(MIN, min(vw-fluid, vh-fluid), MAX)
  Design ref: 1440 × 982.
  All 23 multiview viewports (1097×617 → 2560×1600) scale smoothly.
*/

const navLinks = [
  { title: "Home", links: [] },
  { title: "About", links: ["Our Story", "Teams", "Indicorns"] },
  { title: "For Founder", links: ["Get Investment", "Beyond Cheque", "Titan Seed Fund", "Titan Winner Fund"] },
  { title: "Portfolio", links: ["Our Portfolio"] },
  { title: "Community", links: ["Founder Story", "Titan Ecosystem"] },
  { title: "Perspective", links: ["Blogs/News/Events"] },
];

export default function Footer() {
  return (
    <footer
      className="relative flex w-full flex-col items-center overflow-hidden bg-white shadow-[0_-3px_27.6px_0_rgba(178,178,178,0.25)]"
      style={{ paddingTop: "clamp(40px, min(6.94vw, 10.18vh), 100px)", paddingBottom: "clamp(40px, min(6.94vw, 10.18vh), 100px)" }}
    >

      {/* Inner Content Wrapper */}
      <div
        className="relative z-10 flex w-full max-w-[1440px] flex-col"
        style={{
          paddingLeft:  "var(--section-px-wide, 5%)",
          paddingRight: "var(--section-px-wide, 5%)",
        }}
      >

        {/* ── TOP SECTION: Logo & Navigation Grid ── */}
        <div className="flex w-full flex-col justify-between gap-12 lg:flex-row lg:gap-0">

          {/* Left: Logo, Address, Socials */}
          <div
            className="flex flex-col"
            style={{ gap: "clamp(12px, min(1.67vw, 2.44vh), 24px)" }}
          >
            <div
              className="relative"
              style={{
                width:  "clamp(140px, min(15.21vw, 22.3vh), 219px)",
                height: "clamp(45px, min(4.93vw, 7.23vh), 71px)",
              }}
            >
              <Image
                src="/images/logos/titancapitallogo.svg"
                alt="Titan Capital"
                fill
                className="object-contain"
              />
            </div>

            <p
              className="font-poppins font-normal text-[#0E0E0E]"
              style={{ fontSize: "clamp(10px, min(0.97vw, 1.43vh), 14px)" }}
            >
              M3M Urbana, Sector 67, Gurugram, India
            </p>

            {/* Social Icons */}
            <div
              className="flex items-center"
              style={{ gap: "clamp(8px, min(1.11vw, 1.63vh), 16px)" }}
            >
              <Link href="#" className="inline-block transition-transform duration-300 hover:scale-110 hover:opacity-70">
                <svg style={{ width: "clamp(16px, min(1.67vw, 2.44vh), 24px)", height: "clamp(16px, min(1.67vw, 2.44vh), 24px)" }} viewBox="0 0 24 24" fill="#0E0E0E" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.447 20.452H16.89V14.881C16.89 13.554 16.865 11.848 15.088 11.848C13.285 11.848 13.009 13.255 13.009 14.786V20.452H9.453V8.997H12.87V10.56H12.918C13.395 9.654 14.563 8.685 16.291 8.685C19.897 8.685 20.447 11.056 20.447 14.169V20.452ZM5.337 7.433C4.196 7.433 3.272 6.505 3.272 5.369C3.272 4.233 4.196 3.305 5.337 3.305C6.476 3.305 7.4 4.233 7.4 5.369C7.4 6.505 6.476 7.433 5.337 7.433ZM7.118 20.452H3.555V8.997H7.118V20.452ZM22.225 0H1.771C0.792 0 0 0.774 0 1.729V22.271C0 23.227 0.792 24 1.771 24H22.222C23.2 24 23.996 23.227 23.996 22.271V1.729C23.996 0.774 23.2 0 22.225 0Z" />
                </svg>
              </Link>
              <Link href="#" className="inline-block transition-transform duration-300 hover:scale-110 hover:opacity-70">
                <svg style={{ width: "clamp(16px, min(1.67vw, 2.44vh), 24px)", height: "clamp(16px, min(1.67vw, 2.44vh), 24px)" }} viewBox="0 0 24 24" fill="#0E0E0E" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.901 1.153H22.581L14.541 10.339L24 22.846H16.596L10.794 15.263L4.148 22.846H0.466L9.043 13.037L0 1.153H7.593L12.836 8.082L18.901 1.153ZM17.611 20.644H19.65L6.486 3.24H4.309L17.611 20.644Z" />
                </svg>
              </Link>
              <Link href="#" className="inline-block transition-transform duration-300 hover:scale-110 hover:opacity-70">
                <svg style={{ width: "clamp(17px, min(1.81vw, 2.65vh), 26px)", height: "clamp(17px, min(1.81vw, 2.65vh), 26px)" }} viewBox="0 0 24 24" fill="none" stroke="#0E0E0E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </Link>
            </div>
          </div>

          {/* Right: Navigation Links */}
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:flex"
            style={{ gap: "clamp(20px, min(4.17vw, 6.11vh), 60px)" }}
          >
            {navLinks.map((section, idx) => (
              <div
                key={idx}
                className="flex flex-col items-start"
                style={{ gap: "clamp(8px, min(1.11vw, 1.63vh), 16px)" }}
              >
                <h3
                  className="font-poppins font-medium text-[#001A4D]"
                  style={{ fontSize: "clamp(13px, min(1.67vw, 2.44vh), 24px)" }}
                >
                  {section.title}
                </h3>
                {section.links.length > 0 && (
                  <ul
                    className="flex flex-col"
                    style={{ gap: "clamp(6px, min(0.83vw, 1.22vh), 12px)" }}
                  >
                    {section.links.map((link, linkIdx) => (
                      <li key={linkIdx}>
                        <Link
                          href="#"
                          className="inline-block font-poppins font-normal leading-[1.5] text-[#0E0E0E] transition-all duration-300 hover:scale-105 hover:text-[#001A4D]"
                          style={{ fontSize: "clamp(10px, min(1.18vw, 1.73vh), 17px)" }}
                        >
                          {link}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Spacer */}
        <div style={{ height: "clamp(24px, min(4.17vw, 6.11vh), 60px)" }} />

        {/* ── MIDDLE SECTION: SEBI Text & Email ── */}
        <div
          className="flex w-full flex-col items-start justify-between gap-6 lg:flex-row lg:items-end lg:gap-0"
          style={{ paddingBottom: "clamp(12px, min(1.67vw, 2.44vh), 24px)" }}
        >
          <p
            className="font-poppins font-normal leading-[1.5] text-[#0E0E0E]"
            style={{
              maxWidth: "clamp(200px, min(25vw, 36.66vh), 360px)",
              fontSize: "clamp(10px, min(0.97vw, 1.43vh), 14px)",
            }}
          >
            SEBI registration disclaimer for Winners Fund this is mandatory.
          </p>
          <a
            href="mailto:startups@titancapital.vc"
            className="inline-block break-words font-poppins font-semibold text-[#111] transition-transform duration-300 hover:scale-105 hover:opacity-70"
            style={{ fontSize: "clamp(18px, min(3.19vw, 4.68vh), 46px)" }}
          >
            startups@titancapital.vc
          </a>
        </div>

        {/* ── DIVIDER ── */}
        <div
          className="w-full bg-black opacity-50"
          style={{
            height:       "1px",
            marginBottom: "clamp(12px, min(1.67vw, 2.44vh), 24px)",
          }}
        />

        {/* ── BOTTOM SECTION: Copyright & Links ── */}
        <div
          className="flex w-full flex-col-reverse items-center justify-between gap-6 text-center lg:flex-row lg:gap-0 lg:text-left"
          style={{ marginBottom: "clamp(60px, min(10.42vw, 15.27vh), 150px)" }}
        >
          <p
            className="font-poppins font-normal leading-[1.5] text-[#001A4D]"
            style={{ fontSize: "clamp(14px, min(1.67vw, 2.44vh), 24px)" }}
          >
            © 2026 Titan Capital. All rights reserved.
          </p>
          <div
            className="flex flex-wrap justify-center"
            style={{ gap: "clamp(16px, min(2.78vw, 4.07vh), 40px)" }}
          >
            <Link
              href="#"
              className="inline-block font-poppins font-normal leading-[1.5] text-[#0E0E0E] underline decoration-solid transition-transform duration-300 hover:scale-105 hover:opacity-70"
              style={{ fontSize: "clamp(11px, min(1.11vw, 1.63vh), 16px)" }}
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="inline-block font-poppins font-normal leading-[1.5] text-[#0E0E0E] underline decoration-solid transition-transform duration-300 hover:scale-105 hover:opacity-70"
              style={{ fontSize: "clamp(11px, min(1.11vw, 1.63vh), 16px)" }}
            >
              Terms and Conditions
            </Link>
          </div>
        </div>
      </div>

     {/* ── GIANT WATERMARK ── */}
     <div
        className="pointer-events-none absolute flex w-full justify-center overflow-hidden"
        style={{ 
          bottom: "clamp(-15px, min(-3.82vw, -5.6vh), -45px)",
          // Apply the exact same padding as your inner content wrapper
          paddingLeft: "var(--section-px-wide, 5%)",
          paddingRight: "var(--section-px-wide, 5%)",
        }}
      >
        <svg 
          className="w-full max-w-[1440px]" 
          viewBox="0 0 1000 150" 
          preserveAspectRatio="xMidYMax meet"
        >
          <defs>
            <linearGradient id="titanGradient" x1="0" y1="1" x2="0" y2="0">
              <stop offset="26.78%" stopColor="#DBDBDB" />
              <stop offset="70.55%" stopColor="#EBEBEB" />
            </linearGradient>
          </defs>
          <text
            x="0"
            y="130"
            textLength="1000"
            lengthAdjust="spacing"
            fill="url(#titanGradient)"
            className="font-poppins font-bold"
            style={{ fontSize: "140px" }}
          >
            TITAN CAPITAL
          </text>
        </svg>
      </div>

    </footer>
  );
}