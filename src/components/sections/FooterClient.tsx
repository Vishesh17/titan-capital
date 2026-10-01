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

export interface FooterNavLink {
  label?: string;
  url?: string;
  /** Renders greyed out and unclickable — for a page that is not live yet. */
  disabled?: boolean;
}
export interface FooterNavColumn {
  title?: string;
  links?: FooterNavLink[];
}

/* THE MENU AS IT IS LIVE TODAY, and the fallback when Sanity has none.
   It used to be three structures that had to line up by hand: the labels in
   `navLinks`, their destinations in a `footerHrefs` lookup, and the greyed-out
   ones in a `DISABLED_FOOTER_LINKS` set — all keyed on the label string, so
   renaming a label in one place silently dropped its link or its state. One
   object per link cannot come apart that way.

   `Titan Ecosystem` points at /titanecosystem, NOT /beyondthecheque — that is
   a different page with its own hero, and the mistake went unnoticed for a
   while because the link was disabled at the time.

   The old "Home" column is gone; the wordmark above is the route home. */
const FALLBACK_NAV: FooterNavColumn[] = [
  {
    title: "About",
    links: [
      { label: "Our Story", url: "/ourstory", disabled: true },
      { label: "Meet The Team", url: "/ourteam" },
    ],
  },
  {
    title: "Portfolio",
    links: [
      { label: "Our Portfolio", url: "/portfolio" },
      { label: "Founders' Stories", url: "/foundersstory", disabled: true },
      { label: "Get Investment", url: "/getinvestment" },
    ],
  },
  {
    title: "Perspectives",
    links: [
      { label: "Titan Ecosystem", url: "/titanecosystem" },
      { label: "Indicorns", url: "/indicorns" },
      { label: "Blogs & News", url: "/blogs" },
    ],
  },
];

/* One column, rendered the same way in both layouts so the two can never
   describe different menus. Only the spacing differs, which is why it takes
   its gaps as props. */
function FooterNavColumns({
  columns,
  columnGap,
  linkGap,
  nowrapHeading = false,
  hoverScale = true,
}: {
  columns: FooterNavColumn[];
  columnGap: string;
  linkGap: string;
  nowrapHeading?: boolean;
  hoverScale?: boolean;
}) {
  return (
    <>
      {columns.map((section, idx) => (
        <div
          key={section.title ?? idx}
          className="flex flex-col items-start"
          style={{ gap: columnGap }}
        >
          <h3
            className={`${nowrapHeading ? "whitespace-nowrap " : ""}text-[#001A4D] ${BODY_BOLD_CLASS}`}
            style={HERO_BODY_STYLE}
          >
            {section.title}
          </h3>
          {!!section.links?.length && (
            <ul className="flex flex-col" style={{ gap: linkGap }}>
              {section.links.map((link, linkIdx) => (
                <li key={link.label ?? linkIdx}>
                  {link.disabled ? (
                    <span
                      className="inline-block font-poppins font-normal leading-[1.5] text-[#0E0E0E] opacity-40 cursor-not-allowed select-none"
                      style={LABEL_STYLE}
                    >
                      {link.label}
                    </span>
                  ) : (
                    <Link
                      href={link.url || "#"}
                      className={`inline-block font-poppins font-normal leading-[1.5] text-[#0E0E0E] transition-all duration-300 hover:text-[#001A4D]${hoverScale ? " hover:scale-105" : ""}`}
                      style={LABEL_STYLE}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </>
  );
}

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
/* ────────────────────────────────────────────────
   CursorFillButton — same style as navbar's Get Investment
   Radial fill from cursor position on hover
   ──────────────────────────────────────────────── */
/* ────────────────────────────────────────────────
   CursorFillButton — same style as navbar's Get Investment
   Radial fill from cursor position on hover
   ──────────────────────────────────────────────── */
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
                // REVERTED: Back to exact original mobile values
                width: "clamp(68px, 18vw, 85px)",
                height: "clamp(24px, 6.5vw, 32px)",
                borderRadius: "53px",
                border: "1px solid transparent",
                background: hovered ? "white" : "#001A4D",
                color: hovered ? "#001A4D" : "white",
                ...LABEL_STYLE,
              }
            : {
                // DESKTOP: Increased width (was 160px -> 245px) and added explicit padding
                width: "clamp(200px, min(22vw, 32vh), 310px)",
                padding: "0 24px",
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
   function NewsletterForm({
    variant = "desktop",
    title,
    placeholder,
    buttonLabel,
  }: {
    variant?: "desktop" | "mobile";
    /* Resolved by the caller, so the fallbacks live in one place at the top of
       the component rather than scattered through the two layouts. */
    title: string;
    placeholder: string;
    buttonLabel: string;
  }) {
    const [email, setEmail] = useState("");
    const [touched, setTouched] = useState(false);
    const [focused, setFocused] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState("");
  
    /* Live validation status */
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
      <span className="relative z-10">{buttonLabel}</span>
    );
  
    /* ─────────── MOBILE LAYOUT ─────────── */
    if (variant === "mobile") {
      // REVERTED: Mobile form remains entirely untouched
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
            {title}
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
              placeholder={placeholder}
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
        <p
          className="m-0 self-stretch font-poppins font-normal text-[#0E0E0E]"
          style={{
            gridRow: "1 / span 1",
            gridColumn: "1 / span 2",
            fontSize: "clamp(15px, min(1.67vw, 2.44vh), 24px)",
            lineHeight: "150%",
          }}
        >
          {title}
        </p>
  
        {/* DESKTOP EMAIL INPUT WRAPPER */}
        <div
          className="flex flex-col"
          style={{
            gridRow: "2 / span 1",
            gridColumn: "1 / span 1",
            justifySelf: "start",
            alignSelf: "center",
            gap: "4px",
            // DESKTOP: Reduced the width clamp (was 220px -> 423px) so the email box is narrower
            width: "clamp(180px, min(24vw, 35vh), 330px)",
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
            placeholder={placeholder}
            aria-label="Email address"
            disabled={submitting}
            className={`w-full bg-white outline-none placeholder:text-[#323232] ${ringClass}`}
            style={{
              height: "clamp(40px, min(3.68vw, 5.4vh), 53px)",
              padding: "0 clamp(16px, min(2vw, 3vh), 24px)",
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

/* ── SOCIAL ICONS ──
   One component, used by both layouts. It was the same markup twice, and the
   two had already drifted: only YouTube carries a slightly larger size — its
   glyph sits smaller inside the same box, so it needs the extra pixel or two
   to read as the same weight. That correction existed in both copies and had
   to be kept in step by hand.

   ALL FOUR DESTINATIONS COME FROM SANITY, but they fail differently. The
   three originals fall back to the URL this file has always carried, so an
   empty or unreachable Studio still shows them — the same rule every other
   string in this footer follows. Instagram has no built-in URL to fall back
   to, so it renders nothing at all when empty, rather than a dead link. */
const SOCIAL_LINK_CLASS =
  "inline-block transition-transform duration-300 hover:scale-110 hover:opacity-70";

function SocialLinks({
  gap,
  size,
  youtubeSize,
  linkedinUrl,
  twitterUrl,
  youtubeUrl,
  instagramUrl,
}: {
  gap: string;
  /** LinkedIn, X and Instagram — the three glyphs that fill their box. */
  size: string;
  /** YouTube only. See the note above. */
  youtubeSize: string;
  /* All already resolved by the caller: the three originals carry their
     built-in URL when the Studio has none, Instagram carries nothing. */
  linkedinUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
  instagramUrl?: string;
}) {
  const box = { width: size, height: size };
  return (
    <div className="flex items-center" style={{ gap }}>
      <Link
        href={linkedinUrl}
        aria-label="Titan Capital on LinkedIn"
        className={SOCIAL_LINK_CLASS}
      >
        <svg style={box} viewBox="0 0 24 24" fill="#0E0E0E" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.447 20.452H16.89V14.881C16.89 13.554 16.865 11.848 15.088 11.848C13.285 11.848 13.009 13.255 13.009 14.786V20.452H9.453V8.997H12.87V10.56H12.918C13.395 9.654 14.563 8.685 16.291 8.685C19.897 8.685 20.447 11.056 20.447 14.169V20.452ZM5.337 7.433C4.196 7.433 3.272 6.505 3.272 5.369C3.272 4.233 4.196 3.305 5.337 3.305C6.476 3.305 7.4 4.233 7.4 5.369C7.4 6.505 6.476 7.433 5.337 7.433ZM7.118 20.452H3.555V8.997H7.118V20.452ZM22.225 0H1.771C0.792 0 0 0.774 0 1.729V22.271C0 23.227 0.792 24 1.771 24H22.222C23.2 24 23.996 23.227 23.996 22.271V1.729C23.996 0.774 23.2 0 22.225 0Z" />
        </svg>
      </Link>

      <Link
        href={twitterUrl}
        aria-label="Titan Capital on X"
        className={SOCIAL_LINK_CLASS}
      >
        <svg style={box} viewBox="0 0 24 24" fill="#0E0E0E" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.901 1.153H22.581L14.541 10.339L24 22.846H16.596L10.794 15.263L4.148 22.846H0.466L9.043 13.037L0 1.153H7.593L12.836 8.082L18.901 1.153ZM17.611 20.644H19.65L6.486 3.24H4.309L17.611 20.644Z" />
        </svg>
      </Link>

      <Link
        href={youtubeUrl}
        aria-label="Titan Capital on YouTube"
        className={SOCIAL_LINK_CLASS}
      >
        <svg
          style={{ width: youtubeSize, height: youtubeSize }}
          viewBox="0 0 24 24"
          fill="#0E0E0E"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      </Link>

      {/* Only when the Studio has a URL for it — see the note above. */}
      {instagramUrl?.trim() && (
        <Link
          href={instagramUrl.trim()}
          aria-label="Titan Capital on Instagram"
          className={SOCIAL_LINK_CLASS}
        >
          {/* The official glyph: a rounded-square camera body, the lens ring,
              and the small flash dot. Drawn with the same single `fill` as its
              neighbours so it inherits the footer's ink rather than needing a
              colour of its own. */}
          <svg style={box} viewBox="0 0 24 24" fill="#0E0E0E" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.053 1.805.249 2.227.415.56.217.96.477 1.38.896.42.42.68.82.896 1.38.166.422.362 1.057.415 2.227.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.053 1.17-.249 1.805-.415 2.227-.217.56-.477.96-.896 1.38-.42.42-.82.68-1.38.896-.422.166-1.057.362-2.227.415-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.053-1.805-.249-2.227-.415-.56-.217-.96-.477-1.38-.896-.42-.42-.68-.82-.896-1.38-.166-.422-.362-1.057-.415-2.227-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.053-1.17.249-1.805.415-2.227.217-.56.477-.96.896-1.38.42-.42.82-.68 1.38-.896.422-.166 1.057-.362 2.227-.415 1.266-.058 1.646-.07 4.85-.07zM12 0C8.741 0 8.332.014 7.052.072 5.775.13 4.902.333 4.14.63a5.88 5.88 0 0 0-2.126 1.384A5.88 5.88 0 0 0 .63 4.14C.333 4.902.131 5.775.072 7.052.014 8.332 0 8.741 0 12s.014 3.668.072 4.948c.059 1.277.261 2.15.558 2.912a5.88 5.88 0 0 0 1.384 2.126A5.88 5.88 0 0 0 4.14 23.37c.762.297 1.635.499 2.912.558C8.332 23.986 8.741 24 12 24s3.668-.014 4.948-.072c1.277-.059 2.15-.261 2.912-.558a5.88 5.88 0 0 0 2.126-1.384 5.88 5.88 0 0 0 1.384-2.126c.297-.762.499-1.635.558-2.912C23.986 15.668 24 15.259 24 12s-.014-3.668-.072-4.948c-.059-1.277-.261-2.15-.558-2.912a5.88 5.88 0 0 0-1.384-2.126A5.88 5.88 0 0 0 19.86.63c-.762-.297-1.635-.5-2.912-.558C15.668.014 15.259 0 12 0z" />
            <path d="M12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
            <circle cx="18.406" cy="5.594" r="1.44" />
          </svg>
        </Link>
      )}
    </div>
  );
}

/* Every string the Studio owns, with its fallback.
   THE FALLBACKS ARE THE EXACT TEXT THIS FILE USED TO HARD-CODE, so an empty
   or unreachable Sanity renders the footer that is on titancapital.vc today,
   character for character. */
export interface FooterData {
  address?: string;
  email?: string;
  copyright?: string;
  privacyPolicyLabel?: string;
  grievanceLabel?: string;
  newsletterTitle?: string;
  newsletterPlaceholder?: string;
  newsletterButtonLabel?: string;
  navColumns?: FooterNavColumn[];
  linkedinUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  instagramUrl?: string;
}

export default function FooterClient({ data }: { data?: FooterData | null }) {
  const address = data?.address || "M3M Urbana, Sector 67, Gurugram, India";
  const email = data?.email || "info@titancapital.vc";
  const copyright =
    data?.copyright || "\u00A9 2026 Titan Capital. All rights reserved.";
  const privacyPolicyLabel = data?.privacyPolicyLabel || "Privacy Policy";
  const grievanceLabel = data?.grievanceLabel || "Grievance Redressal";
  const newsletterTitle =
    data?.newsletterTitle ||
    "Stay close to what founders are building, and where the market is going next.";
  const newsletterPlaceholder = data?.newsletterPlaceholder || "Email Id";
  const newsletterButtonLabel =
    data?.newsletterButtonLabel || "Subscribe to Newsletter";
  /* `.length`, not `??` — an editor who opens the array and adds nothing
     leaves an empty one behind, and an empty menu is never what they meant. */
  const navColumns = data?.navColumns?.length ? data.navColumns : FALLBACK_NAV;
  const linkedinUrl =
    data?.linkedinUrl || "https://www.linkedin.com/company/titan-capital-vc/";
  const twitterUrl = data?.twitterUrl || "https://twitter.com/TitanCapitalVC";
  const youtubeUrl = data?.youtubeUrl || "https://www.youtube.com/@TitanCapitalVC";
  /* No fallback on purpose: an absent Instagram means no icon, not a guess. */
  const instagramUrl = data?.instagramUrl;

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
                alt="Titan Capital logo"
                fill
                className="object-contain"
              />
            </Link>

            <p className="font-poppins font-normal text-[#0E0E0E]" style={LABEL_STYLE}>
              {address}
            </p>

            {/* Social Icons */}
            <SocialLinks
              gap="clamp(8px, min(1.11vw, 1.63vh), 16px)"
              size="clamp(16px, min(1.67vw, 2.44vh), 24px)"
              youtubeSize="clamp(17px, min(1.81vw, 2.65vh), 26px)"
              linkedinUrl={linkedinUrl}
              twitterUrl={twitterUrl}
              youtubeUrl={youtubeUrl}
              instagramUrl={instagramUrl}
            />

            {/* Email — sits right under the social icons */}
            <a
              href={`mailto:${email}`}
              className={`font-medium inline-block break-words text-[#111] transition-transform duration-300 hover:scale-105 hover:opacity-70 ${SUBHEADING_CLASS}`}
              style={{
                ...SUBHEADING_STYLE,
                marginTop: "clamp(8px, min(1.25vw, 1.83vh), 18px)",
              }}
            >
              {email}
            </a>
          </div>

          {/* Right column: Nav at the top, Newsletter form at the bottom */}
          <div className="flex flex-col items-end justify-between" style={{ gap: "clamp(24px, min(3vw, 4.4vh), 48px)" }}>
            <div
              className="flex flex-row justify-between"
              style={{ 
                // MATCHES THE NEWSLETTER FORM EXACTLY
                width: "clamp(360px, min(50.63vw, 74.18vh), 729px)", 
              }}
            >
              <FooterNavColumns
                columns={navColumns}
                columnGap="clamp(8px, min(1.11vw, 1.63vh), 16px)"
                linkGap="clamp(6px, min(0.83vw, 1.22vh), 12px)"
              />
            </div>

            <NewsletterForm title={newsletterTitle} placeholder={newsletterPlaceholder} buttonLabel={newsletterButtonLabel} />
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
              alt="Titan Capital logo"
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
            {/* Same component as desktop — only the spacing differs, and the
                mobile links have no hover-scale because the row is tight. */}
            <FooterNavColumns
              columns={navColumns}
              columnGap="clamp(2px, 0.6vw, 6px)"
              linkGap="clamp(1px, 0.4vw, 4px)"
              nowrapHeading
              hoverScale={false}
            />
          </div>

          {/* Bottom row — Address/Socials on the left, Newsletter form on the right */}
          <div
            className="flex w-full flex-row items-start"
            style={{
              gap: "clamp(12px, 3vw, 24px)",
              marginBottom: "clamp(12px, 2.5vw, 24px)",
            }}
          >
            {/* LEFT column — address → socials */}
            <div
              className="flex shrink-0 flex-col"
              style={{ gap: "clamp(8px, 1.8vw, 14px)", maxWidth: "40%" }}
            >
              <p
                className="m-0 font-poppins font-normal text-[#0E0E0E]"
                style={{ ...LABEL_STYLE, lineHeight: "140%" }}
              >
                {address}
              </p>

              <SocialLinks
                gap="clamp(6px, 1.4vw, 10px)"
                size="clamp(12px, 2vw, 17px)"
                youtubeSize="clamp(13px, 2.2vw, 19px)"
                linkedinUrl={linkedinUrl}
                twitterUrl={twitterUrl}
                youtubeUrl={youtubeUrl}
                instagramUrl={instagramUrl}
              />
            </div>

            {/* RIGHT column — Newsletter form */}
            <div className="flex-1 min-w-0">
              <NewsletterForm variant="mobile" title={newsletterTitle} placeholder={newsletterPlaceholder} buttonLabel={newsletterButtonLabel} />
            </div>
          </div>

          {/* Email — below the newsletter box, aligned left */}
          <a
            href={`mailto:${email}`}
            className="inline-block whitespace-nowrap font-['Poppins',_sans-serif] font-semibold text-[#111] transition-transform duration-300 hover:opacity-70"
            style={{ ...SUBHEADING_MOBILE_STYLE, marginBottom: "clamp(24px, 5vw, 48px)" }}
          >
            {email}
          </a>
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
            {copyright}
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
              {privacyPolicyLabel}
            </Link>
            {/* <Link
              href="/grievance-redressal"
              className="inline-block font-poppins font-normal leading-[1.5] text-[#0E0E0E] underline decoration-solid transition-transform duration-300 hover:scale-105 hover:opacity-70"
              style={LABEL_STYLE}
            >
              {grievanceLabel}
            </Link> */}
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
