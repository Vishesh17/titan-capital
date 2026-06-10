"use client";

import Image from "next/image";
import Link from "next/link";

/*
  RESPONSIVE STRATEGY — clamp(MIN, min(vw-fluid, vh-fluid), MAX)
  Design ref: 1440 × 982.
  All 23 multiview viewports (1097×617 → 2560×1600) scale smoothly.

  Mobile: same vertical flow as desktop, single-row nav with scaled-down fonts.
  Desktop (lg+): untouched — logo+address+socials left, nav right.
*/

/* Map specific footer link labels to custom routes */
const footerHrefs: Record<string, string> = {
  "Titan Winner Fund": "/winnerFund",
  "Our Portfolio": "/portfolio",
  "Titan Seed Fund": "/titanseedfund",
  "Home Page": "/",
};

const navLinks = [
  { title: "Home", links: ["Home Page"] },
  { title: "About", links: ["Our Story", "Teams", "Indicorns"] },
  { title: "For Founder", links: ["Get Investment", "Beyond Cheque", "Titan Seed Fund", "Titan Winner Fund"] },
  { title: "Portfolio", links: ["Our Portfolio"] },
  { title: "Community", links: ["Founder Story", "Titan Ecosystem"] },
  { title: "Perspective", links: ["Blogs","News","Events"] },
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

        {/* ============================================================
            DESKTOP (lg+): Original side-by-side layout — UNTOUCHED
            ============================================================ */}
        <div className="hidden lg:flex w-full flex-row justify-between gap-0">

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
                <svg style={{ width: "clamp(17px, min(1.81vw, 2.65vh), 26px)", height: "clamp(17px, min(1.81vw, 2.65vh), 26px)" }} viewBox="0 0 24 24" fill="#0E0E0E" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right: Navigation Links */}
          <div
            className="flex"
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
                          href={footerHrefs[link] ?? "#"}
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

        {/* ============================================================
            MOBILE (< lg): Vertical stack — Logo → Nav row → Address
            ============================================================ */}
        <div className="flex w-full flex-col lg:hidden">

          {/* Logo */}
          <div
            className="relative"
            style={{
              width:  "clamp(100px, 22vw, 180px)",
              height: "clamp(32px, 7vw, 58px)",
              marginBottom: "clamp(24px, 5vw, 48px)",
            }}
          >
            <Image
              src="/images/logos/titancapitallogo.svg"
              alt="Titan Capital"
              fill
              className="object-contain object-left"
            />
          </div>

          {/* Nav — forced single horizontal row */}
          <div
            className="flex w-full flex-row justify-between"
            style={{
              gap: "clamp(6px, 2vw, 24px)",
              marginBottom: "clamp(28px, 6vw, 56px)",
            }}
          >
            {navLinks.map((section, idx) => (
              <div
                key={idx}
                className="flex flex-col items-start"
                style={{ gap: "clamp(2px, 0.6vw, 6px)" }}
              >
                <h3
                  className="font-poppins font-medium text-[#001A4D] whitespace-nowrap"
                  style={{ fontSize: "clamp(8px, 1.8vw, 18px)" }}
                >
                  {section.title}
                </h3>
                {section.links.length > 0 && (
                  <ul
                    className="flex flex-col"
                    style={{ gap: "clamp(1px, 0.4vw, 4px)" }}
                  >
                    {section.links.map((link, linkIdx) => (
                      <li key={linkIdx}>
                        <Link
                          href={footerHrefs[link] ?? "#"}
                          className="inline-block font-poppins font-normal leading-[1.5] text-[#0E0E0E] transition-all duration-300 hover:text-[#001A4D]"
                          style={{ fontSize: "clamp(7px, 1.5vw, 15px)" }}
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

          {/* Address + Socials */}
          <div
            className="flex flex-col"
            style={{
              gap: "clamp(8px, 1.8vw, 16px)",
              marginBottom: "clamp(24px, 5vw, 48px)",
            }}
          >
            <p
              className="font-poppins font-normal text-[#0E0E0E]"
              style={{ fontSize: "clamp(9px, 1.5vw, 14px)" }}
            >
              M3M Urbana, Sector 67, Gurugram, India
            </p>
            <div
              className="flex items-center"
              style={{ gap: "clamp(8px, 1.8vw, 16px)" }}
            >
              <Link href="#" className="inline-block transition-transform duration-300 hover:scale-110 hover:opacity-70">
                <svg style={{ width: "clamp(16px, 2.8vw, 24px)", height: "clamp(16px, 2.8vw, 24px)" }} viewBox="0 0 24 24" fill="#0E0E0E" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.447 20.452H16.89V14.881C16.89 13.554 16.865 11.848 15.088 11.848C13.285 11.848 13.009 13.255 13.009 14.786V20.452H9.453V8.997H12.87V10.56H12.918C13.395 9.654 14.563 8.685 16.291 8.685C19.897 8.685 20.447 11.056 20.447 14.169V20.452ZM5.337 7.433C4.196 7.433 3.272 6.505 3.272 5.369C3.272 4.233 4.196 3.305 5.337 3.305C6.476 3.305 7.4 4.233 7.4 5.369C7.4 6.505 6.476 7.433 5.337 7.433ZM7.118 20.452H3.555V8.997H7.118V20.452ZM22.225 0H1.771C0.792 0 0 0.774 0 1.729V22.271C0 23.227 0.792 24 1.771 24H22.222C23.2 24 23.996 23.227 23.996 22.271V1.729C23.996 0.774 23.2 0 22.225 0Z" />
                </svg>
              </Link>
              <Link href="#" className="inline-block transition-transform duration-300 hover:scale-110 hover:opacity-70">
                <svg style={{ width: "clamp(16px, 2.8vw, 24px)", height: "clamp(16px, 2.8vw, 24px)" }} viewBox="0 0 24 24" fill="#0E0E0E" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.901 1.153H22.581L14.541 10.339L24 22.846H16.596L10.794 15.263L4.148 22.846H0.466L9.043 13.037L0 1.153H7.593L12.836 8.082L18.901 1.153ZM17.611 20.644H19.65L6.486 3.24H4.309L17.611 20.644Z" />
                </svg>
              </Link>
              <Link href="#" className="inline-block transition-transform duration-300 hover:scale-110 hover:opacity-70">
                <svg style={{ width: "clamp(17px, 3vw, 26px)", height: "clamp(17px, 3vw, 26px)" }} viewBox="0 0 24 24" fill="#0E0E0E" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Spacer (desktop only — mobile spacing handled above) ── */}
        <div className="hidden lg:block" style={{ height: "clamp(24px, min(4.17vw, 6.11vh), 60px)" }} />

        {/* ── SEBI Text & Email — always side by side ── */}
        <div
          className="flex w-full flex-row items-end justify-between"
          style={{ paddingBottom: "clamp(12px, min(1.67vw, 2.44vh), 24px)" }}
        >
          {/* <p
            className="font-poppins font-normal leading-[1.5] text-[#0E0E0E]"
            style={{
              maxWidth: "clamp(140px, 25vw, 360px)",
              fontSize: "clamp(8px, min(0.97vw, 1.43vh), 14px)",
            }}
          >
            SEBI registration disclaimer for Winners Fund this is mandatory.
          </p> */}
          <p
            className="font-poppins font-normal leading-[1.5] text-[#001A4D]"
            style={{ fontSize: "clamp(9px, min(1.67vw, 2.44vh), 24px)" }}
          >
            © 2026 Titan Capital. All rights reserved.
          </p>
          <a
            href="mailto:startups@titancapital.vc"
            className="inline-block break-words font-poppins font-semibold text-[#111] transition-transform duration-300 hover:scale-105 hover:opacity-70"
            style={{ fontSize: "clamp(14px, min(3.19vw, 4.68vh), 46px)" }}
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

        {/* ── Copyright & Links — always side by side ── */}
        <div
          className="flex w-full flex-row items-center justify-between"
          style={{ marginBottom: "clamp(60px, min(10.42vw, 15.27vh), 150px)" }}
        >
          
          <div
            className="flex flex-wrap justify-end"
            style={{ gap: "clamp(10px, min(2.78vw, 4.07vh), 40px)" }}
          >
            {/* <Link
              href="#"
              className="inline-block font-poppins font-normal leading-[1.5] text-[#0E0E0E] underline decoration-solid transition-transform duration-300 hover:scale-105 hover:opacity-70"
              style={{ fontSize: "clamp(8px, min(1.11vw, 1.63vh), 16px)" }}
            >
              Privacy Policy
            </Link> */}
            {/* <Link
              href="#"
              className="inline-block font-poppins font-normal leading-[1.5] text-[#0E0E0E] underline decoration-solid transition-transform duration-300 hover:scale-105 hover:opacity-70"
              style={{ fontSize: "clamp(8px, min(1.11vw, 1.63vh), 16px)" }}
            >
              Terms and Conditions
            </Link> */}
          </div>
        </div>
      </div>

     {/* ── GIANT WATERMARK ── */}
     <div
        className="pointer-events-none absolute flex w-full justify-center overflow-hidden"
        style={{
          bottom: "clamp(-15px, min(-3.82vw, -5.6vh), -45px)",
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
