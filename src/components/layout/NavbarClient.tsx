"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  cubicBezier,
} from "framer-motion";
import { useLenis } from "lenis/react";
import { CTA_BUTTON_STYLE, CTA_BUTTON_MOBILE_CLASS } from "@/styles/ctaButton";
import { GLASS_NAVY_BAR, GLASS_NAVY_PANEL } from "@/styles/glass";

/** Site-wide easing — slow settle, never snappy. */
const EASE = cubicBezier(0.22, 1, 0.36, 1);

/* Routes whose hero renders on a LIGHT background — the navbar
   flips to dark-on-light while the user is above the scroll
   threshold. Once scrolled past 60px it snaps back to the
   default navy pill for consistency with every other section. */
const INVERTED_HERO_ROUTES = new Set([
  "/ourteam",
  "/indicorns",
  "/ourstory",
  "/founders",
  "/titanecosystem",
]);

/* Listings whose OWN hero is dark but whose detail pages render on white.
   The parent must not invert — /blogs and /foundersstory both open on a navy
   hero — but every page beneath them must, or the nav is white-on-white and
   simply is not there until you scroll past the threshold.

   Kept apart from the set above precisely because the rule is different:
   that one matches the route AND its children, this one matches ONLY the
   children. Adding these to it would flip the listings' dark heroes too. */
const INVERTED_DETAIL_PARENTS = new Set([
  "/portfolio",
  "/foundersstory",
  "/blogs",
]);

/* ─── Cursor-origin fill button (shared) ─── */
function NavCursorFillButton({
  href,
  label,
  inverted,
  fullWidth = false,
}: {
  href: string;
  label: string;
  inverted: boolean;
  /** Stretch to the container instead of the bar's fixed pill width — for the
   *  copy of this button pinned to the floor of the slide-out menu, where a
   *  `min(12.15vw, 18.8vh)` pill would sit marooned in a 480px panel. Only the
   *  WIDTH changes: height, radius, label size, outline and the cursor-fill
   *  are the bar's, so the two are recognisably one control. */
  fullWidth?: boolean;
}) {
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

  const baseColor = inverted ? "#0E0E0E" : "white";
  const hoverColor = inverted ? "white" : "#001A4D";
  const borderColor = inverted ? "#0E0E0E" : "#CDCDCD";
  const fillColor = inverted ? "#001A4D" : "white";

  return (
    <Link
      href={href}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative flex shrink-0 items-center justify-center whitespace-nowrap font-['Poppins',_sans-serif] font-normal transition-colors duration-300 ${
        /* The mobile class carries `!w-[...]`, which would beat the inline
           width below — so the full-width form takes only the height half. */
        fullWidth
          ? "max-md:!h-[clamp(46px,7dvh,54px)]"
          : CTA_BUTTON_MOBILE_CLASS
      }`}
      style={{
        ...CTA_BUTTON_STYLE,
        ...(fullWidth
          ? { width: "100%", height: "clamp(48px, min(3.6vw, 5.6vh), 58px)" }
          : null),
        border: `1px solid ${borderColor}`,
        color: hovered ? hoverColor : baseColor,
      }}
    >
      <span
        className="absolute inset-0 transition-transform duration-400 ease-out"
        style={{
          background: fillColor,
          transformOrigin: origin,
          transform: hovered ? "scale(1)" : "scale(0)",
          borderRadius: "inherit",
        }}
      />
      <span className="relative z-10">{label}</span>
    </Link>
  );
}

/**
 * The glossy hover treatment for menu rows. Same visual language at both
 * levels, but deliberately NOT identical — a category and its sub-item sit
 * directly adjacent, so matching them exactly makes the pair read as one merged
 * block. The hierarchy is carried by the accent:
 *
 *   category — a full-height 3px bar owning the panel edge, bright, with a
 *              blue bloom, plus a hairline along the top edge
 *   sub-item — a short centred 2px tick, indented one level in to where the
 *              category's text starts, dimmer and with no top hairline
 *
 * The wash follows the same split: strong and far-reaching for a category,
 * faint and short for a sub-item. `active` pins the state on.
 */
function RowSheen({ active = false, sub = false }: { active?: boolean; sub?: boolean }) {
  const fade = active ? "opacity-100" : "opacity-0 group-hover:opacity-100";
  const wipe = active ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100";

  if (sub) {
    return (
      <>
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_26%,rgba(255,255,255,0)_58%)] transition-opacity duration-500 ease-out ${fade}`}
        />
        <span
          aria-hidden
          className={`pointer-events-none absolute left-[21px] top-1/2 h-[44%] w-[2px] -translate-y-1/2 rounded-full bg-[#4D8AFF]/60 transition-transform duration-500 ease-out max-md:!left-[clamp(16px,4vw,24px)] lg:left-[33px] ${wipe}`}
        />
      </>
    );
  }

  return (
    <>
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.13)_0%,rgba(255,255,255,0.045)_30%,rgba(255,255,255,0)_72%)] transition-opacity duration-500 ease-out ${fade}`}
      />
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-white/30 via-white/10 to-transparent transition-opacity duration-500 ease-out ${fade}`}
      />
      <span
        aria-hidden
        className={`pointer-events-none absolute left-0 top-0 h-full w-[3px] origin-top bg-gradient-to-b from-[#8FBBFF] via-[#4D8AFF] to-[#4D8AFF]/0 shadow-[0_0_14px_rgba(77,138,255,0.65)] transition-transform duration-500 ease-out ${wipe}`}
      />
    </>
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

/**
 * MIRRORS THE `navbar` SINGLETON IN SANITY, section for section.
 *
 * This is only ever rendered when the Sanity fetch returns nothing — a cold
 * cache, a network blip, a bad deploy — so the one job it has is to look like
 * the real menu rather than an older one. It had drifted badly: six sections
 * (FOR FOUNDERS, ABOUT US, COMMUNITY…) against Sanity's five, with pages the
 * menu no longer offers and none of the ones it does. A visitor who hit the
 * fallback got a different site map from everyone else.
 *
 * KEEP IT IN STEP whenever the menu is restructured in the Studio. Copied from
 * the live document on 10 Sep 2026:
 *
 *   HOME            -> /
 *   MEET THE TEAM   -> /ourteam
 *   PORTFOLIO         Our Portfolio      -> /portfolio
 *                     Founders' Stories  -> /foundersstory
 *   PERSPECTIVES      Titan Ecosystem    -> /titanecosystem
 *                     Indicorns          -> /indicorns
 *                     Blogs & News       -> /blogs
 *   GET INVESTMENT  -> /getinvestment
 */
const FALLBACK_SECTIONS: NavbarSection[] = [
  {
    id: "home",
    title: "HOME",
    directUrl: "/",
  },
  {
    id: "our-team",
    title: "MEET THE TEAM",
    directUrl: "/ourteam",
  },
  {
    id: "portfolio",
    title: "PORTFOLIO",
    subItems: [
      { label: "Our Portfolio", url: "/portfolio" },
      { label: "Founders' Stories", url: "/foundersstory" },
    ],
  },
  {
    id: "perspective",
    title: "PERSPECTIVES",
    subItems: [
      { label: "Titan Ecosystem", url: "/titanecosystem" },
      { label: "Indicorns", url: "/indicorns" },
      { label: "Blogs & News", url: "/blogs" },
    ],
  },
  {
    id: "get-investment",
    title: "GET INVESTMENT",
    directUrl: "/getinvestment",
  },
];

const FALLBACK_CTA_LABEL = "Get Investment";
const FALLBACK_CTA_URL = "/getinvestment";

export default function NavbarClient({ data }: { data?: NavbarData }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const pathname = usePathname();
  // Match the route itself AND any sub-page (e.g. /ourteam/<slug> team detail
  // pages, which also render on a light background). Without the prefix check
  // the nav stays white-on-white and disappears on those detail pages.
  const isInvertedRoute =
    [...INVERTED_HERO_ROUTES].some(
      (r) => pathname === r || pathname.startsWith(`${r}/`)
    ) ||
    [...INVERTED_DETAIL_PARENTS].some((r) => pathname.startsWith(`${r}/`));
  const inverted = isInvertedRoute && !scrolled;

  const lenis = useLenis();
  const { scrollY } = useScroll();

  // Restored the missing variables here!
  // DISABLED_ITEMS: Override URLs for items that should be disabled during demo
  /* PERSPECTIVES IS LIVE. Titan Ecosystem, Indicorns and Blogs & News have all
     been taken off both lists — Sanity already pointed them at real routes
     (/titanecosystem, /indicorns, /blogs); it was only this override rewriting
     them to "#disabled" on the way through.

     Note the two lists catch different things, which is why enabling one item
     sometimes meant editing both: Blogs & News was blocked by its URL (/blogs)
     rather than its label, because Sanity labels it "Blogs & News" while the
     list said "Blogs". Titan Ecosystem and Indicorns were blocked by label.

     FOUNDERS' STORIES IS LIVE NOW, and it is a good example of the same trap:
     Sanity labels it "Founders' Stories" while DISABLED_LABELS said "Founders
     Story" — different apostrophe, different plural — so the label never
     matched. It was the URL that caught it. Both entries are gone.

     What is left is genuinely not ready: the two fund pages and Our Story.
     /beyondthecheque stays too — it is its own page, not the Titan Ecosystem
     one. None of these four is in the Sanity menu today, so this override is
     now a guard against one being re-added before its page is finished rather
     than something that fires on every render. */
  const DISABLED_URLS = [
    "/titanseedfund",
    "/winnersfund",
    "/ourstory",
    "/beyondthecheque",
  ];

  const DISABLED_LABELS = [
    "Titan Seed Fund",
    "Titan Winners Fund",
    "Our Story",
  ];

  const overrideDisabledUrls = (sections: NavbarSection[]): NavbarSection[] => {
    return sections.map(section => ({
      ...section,
      subItems: section.subItems?.map(sub => ({
        ...sub,
        url: DISABLED_URLS.includes(sub.url) || DISABLED_LABELS.includes(sub.label) ? "#disabled" : sub.url,
      })),
    }));
  };
  
  const sections = overrideDisabledUrls(data?.sections?.length ? data.sections : FALLBACK_SECTIONS);
  const ctaLabel = data?.ctaLabel || FALLBACK_CTA_LABEL;
  const ctaUrl = data?.ctaUrl || FALLBACK_CTA_URL;

  /* THE CTA LEAVES THE LIST AND BECOMES A BUTTON.
     Sanity fills "Get Investment" into BOTH `sections` and the `ctaLabel` /
     `ctaUrl` pair, so it was appearing twice over — once as a plain row that
     read like any other destination, and once as the pill in the top bar.
     Dropping it from the list here means the menu is destinations only, and
     the action is the button pinned below them.

     Matched on where it POINTS rather than on an id or a last-index check, so
     it survives an editor renaming the section, retitling the button, or
     dragging the menu into a different order. */
  const menuSections = sections.filter(
    (s) => !(s.directUrl && s.directUrl === ctaUrl)
  );

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
      <nav className="site-navbar fixed left-0 top-0 z-[40] flex h-[clamp(65px,min(5.5vw,7vh),80px)] w-full items-center justify-between px-4 transition-[color,transform,opacity] duration-500 ease-out max-md:!h-[clamp(56px,8dvh,64px)] max-md:!px-[clamp(16px,4vw,24px)] lg:px-[clamp(32px,4.3vw,62px)]">
        {/* The glass lives on its own layer and fades in on scroll, rather
            than being swapped onto the <nav> itself.
            This matters: a layered gradient is NOT an animatable value, so
            switching the nav's own `background` between transparent and the
            glass made it appear all at once. Opacity does interpolate, so the
            slow fade over the light heroes is preserved. It also means the
            blur only exists once the layer is visible — an opacity-0 element
            renders no backdrop-filter — so nothing is blurred over the hero. */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 -z-10 transition-opacity duration-500 ease-out ${
            scrolled ? "opacity-100" : "opacity-0"
          }`}
          style={GLASS_NAVY_BAR}
        />

        <button
          onClick={() => setIsMenuOpen(true)}
          className="flex shrink-0 cursor-pointer items-center justify-center p-[6px] transition-opacity hover:opacity-70"
          aria-label="Open Menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="17" viewBox="0 0 26 17" fill="none">
            <path d="M0 1.5V0H25.5V1.5H0ZM25.5 7.5V9H0V7.5H25.5ZM0 15H25.5V16.5H0V15Z" fill={inverted ? "#0E0E0E" : "white"} />
          </svg>
        </button>

        <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 shrink-0 max-md:!static max-md:!translate-x-0 max-md:!translate-y-0 max-md:!ml-auto">
          <Image
            src="/images/logos/titancapitallogo.svg"
            alt="Titan Capital"
            width={98}
            height={32}
            priority
            className={`h-[32px] w-[98px] object-contain max-md:!h-[clamp(24px,4dvh,30px)] max-md:!w-[clamp(74px,12vw,92px)] ${inverted ? "" : "brightness-0 invert"}`}
          />
        </Link>

        <div className="hidden md:block">
          <NavCursorFillButton href={ctaUrl} label={ctaLabel} inverted={inverted} />
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
          className={`relative z-10 flex h-full w-full max-w-full flex-col overflow-hidden transition-transform duration-500 ease-in-out lg:w-[480px] ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={GLASS_NAVY_PANEL}
        >
          {/* Specular hairline down the trailing edge. Tinted blue, not white
              — a white stroke here sat on top of the glass and read as a
              border; a blue one reads as the edge catching light. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-0 w-px"
            style={{
              background:
                "linear-gradient(180deg, rgba(185,215,255,0.26) 0%, rgba(120,165,235,0.09) 45%, rgba(120,165,235,0) 100%)",
            }}
          />

          <div className="relative z-10 flex min-h-[70px] max-md:!min-h-[clamp(60px,10dvh,70px)] w-full shrink-0 items-center justify-between border-b border-white/[0.12] px-[24px] max-md:!px-[clamp(16px,4vw,24px)] lg:h-[var(--nav-height)] lg:px-[62px]">
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
                  className="h-[32px] w-[100px] object-contain brightness-0 invert max-md:!h-[clamp(24px,4dvh,30px)] max-md:!w-[clamp(74px,12vw,92px)]"
                />
            </div>

            {/* Always present now — the menu carries the brand itself, rather
                than only appearing once a sub-panel was opened. */}
            <div className="hidden lg:block">
              <Image
                src="/images/logos/titancapitallogo.svg"
                alt="Titan Capital"
                width={127}
                height={42}
                className="h-[38px] w-[115px] object-contain brightness-0 invert"
              />
            </div>
          </div>

          <div className="relative z-10 flex flex-1 overflow-hidden">
            <div className="flex h-full w-full shrink-0 flex-col overflow-y-auto pb-[98px] pt-[20px] max-md:!pb-[clamp(60px,10dvh,98px)] max-md:!pt-[clamp(16px,3dvh,24px)]">
              <div className="flex w-full flex-col">
                {menuSections.map((item, idx) => {
                  const hasSub = (item.subItems?.length ?? 0) > 0;
                  const isOpen = activeSubMenu === item.id;

                  return (
                    <div key={item.id} className="flex w-full flex-col">
                      {hasSub ? (
                        <button
                          onClick={() => setActiveSubMenu(isOpen ? null : item.id)}
                          aria-expanded={isOpen}
                          className="group relative flex w-full cursor-pointer items-center justify-between overflow-hidden px-[21px] py-[16px] max-md:!px-[clamp(16px,4vw,24px)] max-md:!py-[clamp(12px,3dvh,20px)] lg:px-[33px]"
                        >
                          <RowSheen active={isOpen} />

                          <span
                            className={`relative z-10 font-['Poppins',_sans-serif] text-[15px] max-md:!text-[clamp(13px,4.2vw,17px)] font-medium leading-[150%] transition-all duration-500 ease-out group-hover:translate-x-[3px] lg:text-[20px] ${
                              isOpen ? "text-white" : "text-white/85 group-hover:text-white"
                            }`}
                          >
                            {item.title}
                          </span>

                          {/* Points right when collapsed, down when open. */}
                          <motion.svg
                            animate={{ rotate: isOpen ? 90 : 0 }}
                            transition={{ duration: 0.45, ease: EASE }}
                            width="12"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`relative z-10 transition-opacity duration-500 ease-out ${
                              isOpen ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                            }`}
                          >
                            <path d="M9 18l6-6-6-6" />
                          </motion.svg>
                        </button>
                      ) : (
                        <Link
                          href={item.directUrl || `/${item.id}`}
                          onClick={() => setIsMenuOpen(false)}
                          className="group relative flex w-full cursor-pointer items-center justify-between overflow-hidden px-[21px] py-[16px] max-md:!px-[clamp(16px,4vw,24px)] max-md:!py-[clamp(12px,3dvh,20px)] lg:px-[33px]"
                        >
                          <RowSheen />

                          <span className="relative z-10 font-['Poppins',_sans-serif] text-[15px] max-md:!text-[clamp(13px,4.2vw,17px)] font-medium leading-[150%] text-white/85 transition-all duration-500 ease-out group-hover:translate-x-[3px] group-hover:text-white lg:text-[20px]">
                            {item.title}
                          </span>
                        </Link>
                      )}

                      {/* Sub-items drop down in place — the old second panel is gone. */}
                      {hasSub && (
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.6, ease: EASE }}
                              className="overflow-hidden"
                            >
                              {/* Rows run full-bleed (indent lives in their own
                                  padding) so each accent bar lands on the same
                                  x as the category bars above. */}
                              <div className="flex flex-col pb-[10px] pt-[2px]">
                                {item.subItems?.map((subItem, subIdx) => {
                                  const isDisabled = subItem.url === "#disabled";
                                  const linkHref = isDisabled ? "#" : (subItem.url || `/${subItem.label.toLowerCase().replace(/\s+/g, "-")}`);
                                  
                                  if (isDisabled) {
                                    return (
                                      <span
                                        key={subIdx}
                                        className="group relative flex w-full items-center overflow-hidden py-[10px] pl-[42px] pr-[21px] max-md:!py-[clamp(10px,2.5dvh,14px)] max-md:!pl-[clamp(34px,9vw,46px)] max-md:!pr-[clamp(16px,4vw,24px)] lg:pl-[54px] lg:pr-[33px] opacity-50 cursor-not-allowed"
                                      >
                                        <span className="relative z-10 font-['Poppins',_sans-serif] text-[18px] max-md:!text-[clamp(16px,5vw,20px)] font-normal leading-[150%] text-white/40 lg:text-[20px]">
                                          {subItem.label}
                                        </span>
                                      </span>
                                    );
                                  }
                                  
                                  return (
                                    <Link
                                      key={subIdx}
                                      href={linkHref}
                                      onClick={() => setIsMenuOpen(false)}
                                      className="group relative flex w-full items-center overflow-hidden py-[10px] pl-[42px] pr-[21px] max-md:!py-[clamp(10px,2.5dvh,14px)] max-md:!pl-[clamp(34px,9vw,46px)] max-md:!pr-[clamp(16px,4vw,24px)] lg:pl-[54px] lg:pr-[33px]"
                                    >
                                      <RowSheen sub />

                                      <span className="relative z-10 font-['Poppins',_sans-serif] text-[18px] max-md:!text-[clamp(16px,5vw,20px)] font-normal leading-[150%] text-white/60 transition-all duration-500 ease-out group-hover:translate-x-[3px] group-hover:text-white/90 lg:text-[20px]">
                                        {subItem.label}
                                      </span>
                                    </Link>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}

                      {idx < menuSections.length - 1 && (
                        <motion.div
                          className="mx-[21px] h-px origin-left bg-white/[0.10] max-md:!mx-[clamp(16px,4vw,24px)] lg:mx-[33px]"
                          initial={false}
                          animate={{ scaleX: isMenuOpen ? 1 : 0 }}
                          transition={{
                            duration: 0.9,
                            ease: EASE,
                            delay: isMenuOpen ? 0.15 + idx * 0.07 : 0,
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── THE CALL TO ACTION, ON THE PANEL'S FLOOR ──
              OUTSIDE the scrolling area, so it is a fixed part of the panel
              rather than the last thing in a list: it stays put however far
              the menu is scrolled, and it is the last thing the eye lands on.

              THE SKIN IS THE SITE'S OWN CTA, not a new one — the same control
              as the pill in the top bar, so it carries the outline, the
              cursor-fill on hover and the navy-on-white flip already used
              everywhere else. On this dark glass it reads as a button rather
              than a tinted row, which the previous treatment did not.

              `inverted={false}` is correct despite the name: that is the
              light-on-dark skin (white label, white fill on hover), and this
              panel is always dark whatever the page behind it is doing.

              The wrapper closes the menu — the click bubbles up from the link,
              so the CTA needs no click handler of its own. */}
          <div
            onClick={() => setIsMenuOpen(false)}
            className="relative z-10 shrink-0 border-t border-white/[0.10] px-[21px] pb-[24px] pt-[20px] max-md:!px-[clamp(16px,4vw,24px)] max-md:!pb-[clamp(20px,4dvh,28px)] lg:px-[33px]"
          >
            <NavCursorFillButton
              href={ctaUrl}
              label={ctaLabel}
              inverted={false}
              fullWidth
            />
          </div>
        </div>
      </div>
    </>
  );
}