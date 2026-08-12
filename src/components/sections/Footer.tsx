"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BODY_BOLD_CLASS,
  HERO_BODY_STYLE,
  LABEL_STYLE,
  SUBHEADING_CLASS,
  SUBHEADING_MOBILE_STYLE,
  SUBHEADING_STYLE,
} from "@/styles/heroTypography";
import { motion } from "framer-motion"; // Keep for buttonContent spinner animation

/*
  RESPONSIVE STRATEGY — clamp(MIN, min(vw-fluid, vh-fluid), MAX)
  Design ref: 1440 × 982.
  All 23 multiview viewports (1097×617 → 2560×1600) scale smoothly.

  Mobile: same vertical flow as desktop, single-row nav with scaled-down fonts.
  Desktop (lg+): untouched — logo+address+socials left, nav right.
*/

/* Map specific footer link labels to custom routes */
const footerHrefs: Record<string, string> = {
  "Our Story": "/ourstory",
  "Meet The Team": "/ourTeam",
  "Our Portfolio": "/portfolio",
  "Founders' Stories": "/foundersstory",
  "Get Investment": "/getinvestment",
  "Titan Ecosystem": "/beyondTheCheque",
  "Indicorns": "/indicorns",
  "Blogs & News": "/blogs",
};

/* Fund Details sits last under About for SEBI compliance. The old "Home"
   column is gone — the wordmark itself is the route home. */
const navLinks = [
  { title: "About", links: ["Our Story", "Meet The Team"] },
  { title: "Portfolio", links: ["Our Portfolio", "Founders' Stories", "Get Investment"] },
  { title: "Perspective", links: ["Titan Ecosystem", "Indicorns", "Blogs & News"] },
];

/* ────────────────────────────────────────────────
   Email validation — same regex as the EmailInput in
   GetInvestmentForm so both behave identically.
   ──────────────────────────────────────────────── */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/* ────────────────────────────────────────────────
   CursorFillButton — same style as navbar's Get Investment
   Radial fill from cursor position on hover
   ──────────────────────────────────────────────── */
function CursorFillButton({
  type = "button",
  disabled,
  label,
  variant = "desktop",
  onClick,
}: {
  type?: "button" | "submit";
  disabled?: boolean;
  label: React.ReactNode;
  variant?: "desktop" | "mobile";
  onClick?: () => void;
}) {
  const [origin, setOrigin] = useState("50% 50%");
  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
    setHovered(true);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
    setHovered(false);
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative flex items-center justify-center whitespace-nowrap font-['Poppins',_sans-serif] font-normal transition-colors duration-300 disabled:opacity-60 ${variant === "mobile" ? "shrink-0" : ""}`}
      style={
        variant === "mobile"
          ? {
              width: "clamp(68px, 18vw, 85px)",
              height: "clamp(24px, 6.5vw, 32px)",
              borderRadius: "53px",
              border: "1px solid transparent",
              background: hovered ? "white" : "#001A4D",
              color: hovered ? "#001A4D" : "white",
              ...LABEL_STYLE,
            }
          : {
              width: "clamp(160px, min(17.01vw, 24.95vh), 245px)",
              height: "clamp(40px, min(3.68vw, 5.4vh), 53px)",
              borderRadius: "53px",
              border: "1px solid #CDCDCD",
              background: hovered ? "white" : "#001A4D",
              color: hovered ? "#001A4D" : "white",
              ...LABEL_STYLE,
            }
      }
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
    </button>
  );
}

/* Newsletter subscribe form — handles validation, submit/loading/success
   and error states. POSTs to /api/newsletter, which forwards to the same
   Google Apps Script webhook with `type: "newsletter"` so the Apps Script
   can route the row to Sheet 2.

   `variant` switches between the desktop grid layout (Figma spec — 729×216
   pill on the right of the footer) and the mobile column layout (sits
   beside the M3M address paragraph). */
function NewsletterForm({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [focused, setFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  /* Live validation status — mirrors EmailInput in GetInvestmentForm. */
  const liveStatus: "neutral" | "invalid" | "valid" =
    email.length === 0
      ? "neutral"
      : isValidEmail(email)
        ? "valid"
        : touched
          ? "invalid"
          : "neutral";

  const ringClass =
    liveStatus === "invalid"
      ? "ring-2 ring-[#C53030]/40"
      : liveStatus === "valid" && focused
        ? "ring-2 ring-[#16a34a]/40"
        : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!touched) setTouched(true);
    if (!isValidEmail(email)) {
      setSubmitError("Please enter a valid email address");
      return;
    }
    setSubmitError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setSubmitted(true);
        setEmail("");
      } else {
        setSubmitError(json.message || "Something went wrong. Please try again.");
      }
    } catch {
      setSubmitError("Network error. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  /* Button content states */
  const buttonContent = submitting ? (
    <span className="relative z-10 flex items-center justify-center gap-2">
      <motion.span
        className="inline-block h-[10px] w-[10px] rounded-full border-2 border-white/30 border-t-white max-md:!h-[8px] max-md:!w-[8px]"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      />
      Subscribing…
    </span>
  ) : submitted ? (
    <span className="relative z-10">Subscribed ✓</span>
  ) : (
    <span className="relative z-10">Subscribe to Newsletter</span>
  );

  /* ─────────── MOBILE LAYOUT ─────────── */
  if (variant === "mobile") {
    return (
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col items-start"
        style={{
          maxWidth: "241px",
          gap: "clamp(6px, 1.6vw, 10px)",
          padding: "8px",
          borderRadius: "2px",
          background: "#FBF7F0",
        }}
      >
        <p
          className="m-0 font-poppins font-normal text-[#0E0E0E]"
          style={{ fontSize: "clamp(8px, 1.8vw, 11px)", lineHeight: "140%" }}
        >
          Stay close to what founders are building and where markets are moving, with Titan Capital.
        </p>
        <div className="flex w-full flex-row items-center" style={{ gap: "4px" }}>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (!touched) setTouched(true);
              if (submitted) setSubmitted(false);
              if (submitError) setSubmitError("");
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              if (!touched) setTouched(true);
            }}
            placeholder="Email Id"
            aria-label="Email address"
            disabled={submitting}
            className={`min-w-0 flex-1 bg-white outline-none placeholder:text-[#323232] ${ringClass}`}
            style={{
              padding: "5px 8px",
              height: "clamp(24px, 6.5vw, 32px)",
              borderRadius: "4px",
              fontFamily: "Poppins",
              ...LABEL_STYLE,
              color: "#323232",
              lineHeight: "150%",
              transition: "box-shadow 0.2s",
            }}
          />
          <CursorFillButton
            type="submit"
            disabled={submitting}
            onClick={() => {}}
            label={submitting ? (
              <motion.span
                className="inline-block h-[8px] w-[8px] rounded-full border-2 border-white/30 border-t-white"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              />
            ) : submitted ? "Done" : "Subscribe"}
            variant="mobile"
          />
        </div>
        {(submitError || liveStatus === "invalid") && (
          <p
            className="font-poppins text-[#C53030]"
            style={{ fontSize: "clamp(7px, 1.6vw, 10px)" }}
          >
            {submitError || "Please enter a valid email address"}
          </p>
        )}
        {submitted && !submitError && (
          <p
            className="font-poppins text-[#16a34a]"
            style={{ fontSize: "clamp(7px, 1.6vw, 10px)" }}
          >
            Thanks for subscribing!
          </p>
        )}
      </form>
    );
  }

  /* ─────────── DESKTOP LAYOUT ─────────── */
  return (
    <form
      onSubmit={handleSubmit}
      className="relative grid"
      style={{
        // Designed at 729×216 on a 1440 viewport; scales with the rest of the site.
        width: "clamp(360px, min(50.63vw, 74.18vh), 729px)",
        minHeight: "clamp(170px, min(15vw, 22vh), 216px)",
        padding:
          "clamp(14px, min(1.25vw, 1.83vh), 18px) clamp(16px, min(1.6vw, 2.34vh), 23px)",
        rowGap: "clamp(20px, min(1.94vw, 2.85vh), 28px)",
        columnGap: "clamp(10px, min(1.11vw, 1.63vh), 16px)",
        gridTemplateRows: "repeat(2, minmax(0, 1fr))",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        borderRadius: "2px",
        background: "#FBF7F0",
      }}
    >
      {/* Heading — spans both columns on row 1 */}
      <p
        className="m-0 self-stretch font-poppins font-normal text-[#0E0E0E]"
        style={{
          gridRow: "1 / span 1",
          gridColumn: "1 / span 2",
          fontSize: "clamp(15px, min(1.67vw, 2.44vh), 24px)",
          lineHeight: "150%",
        }}
      >
        Stay close to what founders are building and where markets are moving, with Titan Capital.
      </p>

      {/* Email input — row 2, col 1. Wrapper holds the error/success message
          right under the input without disturbing the grid. Centered vertically
          to share a baseline with the button. */}
      <div
        className="flex flex-col"
        style={{
          gridRow: "2 / span 1",
          gridColumn: "1 / span 1",
          justifySelf: "start",
          alignSelf: "center",
          gap: "4px",
          width: "clamp(220px, min(29.38vw, 43.07vh), 423px)",
        }}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (!touched) setTouched(true);
            if (submitted) setSubmitted(false);
            if (submitError) setSubmitError("");
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            if (!touched) setTouched(true);
          }}
          placeholder="Email Id"
          aria-label="Email address"
          disabled={submitting}
          className={`w-full bg-white outline-none placeholder:text-[#323232] ${ringClass}`}
          style={{
            // Same height as the Subscribe button so the row reads as one.
            height: "clamp(40px, min(3.68vw, 5.4vh), 53px)",
            padding:
              "0 clamp(20px, min(2.64vw, 3.87vh), 38px)",
            borderRadius: "8px",
            fontFamily: "Poppins",
            ...LABEL_STYLE,
            color: "#323232",
            lineHeight: "150%",
            transition: "box-shadow 0.2s",
          }}
        />
        {(submitError || liveStatus === "invalid") && (
          <p
            className="font-poppins text-[#C53030]"
            style={{ fontSize: "clamp(11px, min(0.9vw, 1.3vh), 13px)" }}
          >
            {submitError || "Please enter a valid email address"}
          </p>
        )}
        {submitted && !submitError && (
          <p
            className="font-poppins text-[#16a34a]"
            style={{ fontSize: "clamp(11px, min(0.9vw, 1.3vh), 13px)" }}
          >
            Thanks for subscribing!
          </p>
        )}
      </div>

      {/* Subscribe button — same style as navbar Get Investment button */}
      <div
        style={{
          gridRow: "2 / span 1",
          gridColumn: "2 / span 1",
          justifySelf: "end",
          alignSelf: "center",
        }}
      >
        <CursorFillButton
          type="submit"
          disabled={submitting}
          label={buttonContent}
          variant="desktop"
        />
      </div>
    </form>
  );
}

export default function Footer() {
  return (
    <footer
      className="relative flex w-full flex-col items-center overflow-hidden bg-white shadow-[0_-3px_27.6px_0_rgba(178,178,178,0.25)]"
      style={{
        paddingTop: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingBottom: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >

      {/* Inner Content Wrapper */}
      <div className="relative z-10 flex w-full flex-col">

        {/* ============================================================
            DESKTOP (lg+): Original side-by-side layout — UNTOUCHED
            ============================================================ */}
        <div className="hidden lg:flex w-full flex-row justify-between gap-0">

          {/* Left: Logo, Address, Socials */}
          <div
            className="flex flex-col"
            style={{ gap: "clamp(12px, min(1.67vw, 2.44vh), 24px)" }}
          >
            <Link
              href="/"
              aria-label="Titan Capital — home"
              className="relative block transition-opacity duration-300 hover:opacity-80"
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
            </Link>

            <p className="font-poppins font-normal text-[#0E0E0E]" style={LABEL_STYLE}>
              M3M Urbana, Sector 67, Gurugram, India
            </p>

            {/* Social Icons */}
            <div
              className="flex items-center"
              style={{ gap: "clamp(8px, min(1.11vw, 1.63vh), 16px)" }}
            >
              <Link href="https://www.linkedin.com/company/titan-capital-vc/" className="inline-block transition-transform duration-300 hover:scale-110 hover:opacity-70">
                <svg style={{ width: "clamp(16px, min(1.67vw, 2.44vh), 24px)", height: "clamp(16px, min(1.67vw, 2.44vh), 24px)" }} viewBox="0 0 24 24" fill="#0E0E0E" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.447 20.452H16.89V14.881C16.89 13.554 16.865 11.848 15.088 11.848C13.285 11.848 13.009 13.255 13.009 14.786V20.452H9.453V8.997H12.87V10.56H12.918C13.395 9.654 14.563 8.685 16.291 8.685C19.897 8.685 20.447 11.056 20.447 14.169V20.452ZM5.337 7.433C4.196 7.433 3.272 6.505 3.272 5.369C3.272 4.233 4.196 3.305 5.337 3.305C6.476 3.305 7.4 4.233 7.4 5.369C7.4 6.505 6.476 7.433 5.337 7.433ZM7.118 20.452H3.555V8.997H7.118V20.452ZM22.225 0H1.771C0.792 0 0 0.774 0 1.729V22.271C0 23.227 0.792 24 1.771 24H22.222C23.2 24 23.996 23.227 23.996 22.271V1.729C23.996 0.774 23.2 0 22.225 0Z" />
                </svg>
              </Link>
              <Link href="https://twitter.com/TitanCapitalVC" className="inline-block transition-transform duration-300 hover:scale-110 hover:opacity-70">
                <svg style={{ width: "clamp(16px, min(1.67vw, 2.44vh), 24px)", height: "clamp(16px, min(1.67vw, 2.44vh), 24px)" }} viewBox="0 0 24 24" fill="#0E0E0E" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.901 1.153H22.581L14.541 10.339L24 22.846H16.596L10.794 15.263L4.148 22.846H0.466L9.043 13.037L0 1.153H7.593L12.836 8.082L18.901 1.153ZM17.611 20.644H19.65L6.486 3.24H4.309L17.611 20.644Z" />
                </svg>
              </Link>
              <Link href="https://www.youtube.com/@TitanCapitalVC" className="inline-block transition-transform duration-300 hover:scale-110 hover:opacity-70">
                <svg style={{ width: "clamp(17px, min(1.81vw, 2.65vh), 26px)", height: "clamp(17px, min(1.81vw, 2.65vh), 26px)" }} viewBox="0 0 24 24" fill="#0E0E0E" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </Link>
            </div>

            {/* Email — sits right under the social icons */}
            <a
              href="mailto:info@titancapital.vc"
              className={`inline-block break-words text-[#111] transition-transform duration-300 hover:scale-105 hover:opacity-70 ${SUBHEADING_CLASS}`}
              style={{
                ...SUBHEADING_STYLE,
                marginTop: "clamp(8px, min(1.25vw, 1.83vh), 18px)",
              }}
            >
              info@titancapital.vc
            </a>
          </div>

          {/* Right column: Nav at the top, Newsletter form at the bottom */}
          <div className="flex flex-col items-end justify-between" style={{ gap: "clamp(24px, min(3vw, 4.4vh), 48px)" }}>
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
                  <h3 className={`text-[#001A4D] ${BODY_BOLD_CLASS}`} style={HERO_BODY_STYLE}>
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
                            style={LABEL_STYLE}
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

            <NewsletterForm />
          </div>
        </div>

        {/* ============================================================
            MOBILE (< lg): Vertical stack — Logo → Nav row → Address
            ============================================================ */}
        <div className="flex w-full flex-col lg:hidden">

          {/* Logo */}
          <Link
            href="/"
            aria-label="Titan Capital — home"
            className="relative block transition-opacity duration-300 hover:opacity-80"
            style={{
              width: "clamp(80px, 18vw, 140px)",
              height: "clamp(26px, 5.5vw, 44px)",
              marginBottom: "clamp(18px, 4vw, 36px)",
            }}
          >
            <Image
              src="/images/logos/titancapitallogo.svg"
              alt="Titan Capital"
              fill
              className="object-contain object-left"
            />
          </Link>

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
                  className={`whitespace-nowrap text-[#001A4D] ${BODY_BOLD_CLASS}`}
                  style={HERO_BODY_STYLE}
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
                          style={LABEL_STYLE}
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

          {/* Bottom row — Address/Socials/Email stacked on the left,
              Newsletter form on the right. Matches the mobile Figma layout. */}
          <div
            className="flex w-full flex-row items-start"
            style={{
              gap: "clamp(12px, 3vw, 24px)",
              marginBottom: "clamp(24px, 5vw, 48px)",
            }}
          >
            {/* LEFT column — address → socials → email */}
            <div
              className="flex shrink-0 flex-col"
              style={{ gap: "clamp(8px, 1.8vw, 14px)", maxWidth: "40%" }}
            >
              <p
                className="m-0 font-poppins font-normal text-[#0E0E0E]"
                style={{ ...LABEL_STYLE, lineHeight: "140%" }}
              >
                M3M Urbana, Sector 67, Gurugram, India
              </p>

              <div
                className="flex items-center"
                style={{ gap: "clamp(6px, 1.4vw, 10px)" }}
              >
                <Link href="https://www.linkedin.com/company/titan-capital-vc/" className="inline-block transition-transform duration-300 hover:scale-110 hover:opacity-70">
                  <svg style={{ width: "clamp(12px, 2vw, 17px)", height: "clamp(12px, 2vw, 17px)" }} viewBox="0 0 24 24" fill="#0E0E0E" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.447 20.452H16.89V14.881C16.89 13.554 16.865 11.848 15.088 11.848C13.285 11.848 13.009 13.255 13.009 14.786V20.452H9.453V8.997H12.87V10.56H12.918C13.395 9.654 14.563 8.685 16.291 8.685C19.897 8.685 20.447 11.056 20.447 14.169V20.452ZM5.337 7.433C4.196 7.433 3.272 6.505 3.272 5.369C3.272 4.233 4.196 3.305 5.337 3.305C6.476 3.305 7.4 4.233 7.4 5.369C7.4 6.505 6.476 7.433 5.337 7.433ZM7.118 20.452H3.555V8.997H7.118V20.452ZM22.225 0H1.771C0.792 0 0 0.774 0 1.729V22.271C0 23.227 0.792 24 1.771 24H22.222C23.2 24 23.996 23.227 23.996 22.271V1.729C23.996 0.774 23.2 0 22.225 0Z" />
                  </svg>
                </Link>
                <Link href="https://twitter.com/TitanCapitalVC" className="inline-block transition-transform duration-300 hover:scale-110 hover:opacity-70">
                  <svg style={{ width: "clamp(12px, 2vw, 17px)", height: "clamp(12px, 2vw, 17px)" }} viewBox="0 0 24 24" fill="#0E0E0E" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.901 1.153H22.581L14.541 10.339L24 22.846H16.596L10.794 15.263L4.148 22.846H0.466L9.043 13.037L0 1.153H7.593L12.836 8.082L18.901 1.153ZM17.611 20.644H19.65L6.486 3.24H4.309L17.611 20.644Z" />
                  </svg>
                </Link>
                <Link href="https://www.youtube.com/@TitanCapitalVC" className="inline-block transition-transform duration-300 hover:scale-110 hover:opacity-70">
                  <svg style={{ width: "clamp(13px, 2.2vw, 19px)", height: "clamp(13px, 2.2vw, 19px)" }} viewBox="0 0 24 24" fill="#0E0E0E" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </Link>
              </div>

              <a
                href="mailto:info@titancapital.vc"
                className="inline-block break-words font-['Poppins',_sans-serif] font-medium text-[#111] transition-transform duration-300 hover:opacity-70"
                // Inline, not the `max-md:` half of SUBHEADING_CLASS: this
                // block is `lg:hidden`, so it is still on screen from
                // 768-1023px where that variant no longer applies.
                style={SUBHEADING_MOBILE_STYLE}
              >
                info@titancapital.vc
              </a>
            </div>

            {/* RIGHT column — Newsletter form */}
            <div className="flex-1 min-w-0">
              <NewsletterForm variant="mobile" />
            </div>
          </div>
        </div>

        {/* ── Spacer (desktop only — mobile spacing handled above) ── */}
        <div className="hidden lg:block" style={{ height: "clamp(24px, min(4.17vw, 6.11vh), 60px)" }} />

        {/* ── DIVIDER ── */}
        <div
          className="w-full bg-black opacity-50"
          style={{
            height: "1px",
            marginTop: "clamp(20px, min(2.5vw, 3.66vh), 36px)",
            marginBottom: "clamp(12px, min(1.67vw, 2.44vh), 24px)",
          }}
        />

        {/* ── Copyright & Legal Links — side by side ── */}
        <div
          className="flex w-full flex-row items-center justify-between"
          style={{ marginBottom: "clamp(60px, min(10.42vw, 15.27vh), 150px)" }}
        >
          <p
            className="font-poppins font-normal leading-[1.5] text-[#001A4D]"
            style={LABEL_STYLE}
          >
            © 2026 Titan Capital. All rights reserved.
          </p>

          <div
            className="flex flex-wrap justify-end"
            style={{ gap: "clamp(10px, min(2.78vw, 4.07vh), 40px)" }}
          >
            <Link
              href="/privacy-policy"
              className="inline-block font-poppins font-normal leading-[1.5] text-[#0E0E0E] underline decoration-solid transition-transform duration-300 hover:scale-105 hover:opacity-70"
              style={LABEL_STYLE}
            >
              Privacy Policy
            </Link>
            <Link
              href="/grievance-redressal"
              className="inline-block font-poppins font-normal leading-[1.5] text-[#0E0E0E] underline decoration-solid transition-transform duration-300 hover:scale-105 hover:opacity-70"
              style={LABEL_STYLE}
            >
              Grievance Redressal
            </Link>
          </div>
        </div>
      </div>

     {/* ── GIANT WATERMARK ── */}
     {/* Same box as the content wrapper above — capped at 1440, centred, then
         padded. It used to be padded at full viewport width and capped after,
         which put the wordmark on a different left edge from the content on
         any screen wider than 1440. */}
     <div
        className="pointer-events-none absolute left-0 right-0 flex justify-center overflow-hidden"
        style={{
          bottom: "clamp(-15px, min(-3.82vw, -5.6vh), -45px)",
          paddingLeft: "var(--section-px-wide)",
          paddingRight: "var(--section-px-wide)",
        }}
      >
        <svg
          className="w-full"
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
