"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

/* ─────────────────────────────────────────────────────────
   Types shared with the server wrapper (FoundersTestimonial.tsx)
   ───────────────────────────────────────────────────────── */
export interface TestimonialItem {
  name: string;
  role: string;
  image: string;
  text: string;
  /** Optional company logo path — replaces the text-only fallback in the card. */
  companyLogo?: string;
  /** Optional company display name; if missing, derived from role after the comma. */
  companyName?: string;
  longText?: boolean;
}

export interface FoundersTestimonialData {
  topHeadingFirst?: string;
  topHeadingSecond?: string;
  bottomHeadingFirst?: string;
  bottomHeadingSecond?: string;
  ctaLabel?: string;
  testimonials?: TestimonialItem[];
}

/* ─────────────────────────────────────────────────────────
   Fallback defaults — copy per the redesign spec.
   ───────────────────────────────────────────────────────── */
const FALLBACK_TESTIMONIALS: TestimonialItem[] = [
  {
    name: "Abhiraj Bahl",
    role: "Cofounder, Urban Company",
    companyName: "Urban Company",
    image: "/images/hero_founders_images/abhiraj_bahl.png",
    text: "“Kunal and Rohit were the first investors to believe in Urban Company, even before we launched the platform or decided on the name. Their unwavering support has been a constant throughout our journey, guiding us through ups and downs. As Founders, we deeply value their mentorship and friendship.”",
  },
  {
    name: "Disha Singh",
    role: "Cofounder, Zouk",
    companyName: "Zouk",
    image: "/images/Testimonials/disha-singh.avif",
    text: "“Titan Capital has been an invaluable partner in our journey to build Zouk. Kunal and Rohit have consistently provided invaluable guidance on cultivating a long-lasting business with strong brand loyalty.”",
    longText: true,
  },
  {
    name: "Rishabh Goel",
    role: "Cofounder, Credgenics",
    companyName: "Credgenics",
    image: "/images/Testimonials/Rishabh.jpeg",
    text: "“Titan Capital has been more than just an investor for Credgenics — they’ve been our first partner in this journey. Our early conversations made it clear that they weren’t your typical investors.”",
    longText: true,
  },
  {
    name: "Raghu Ravinutala",
    role: "Cofounder, Yellow.ai",
    companyName: "Yellow.ai",
    image: "/images/Testimonials/Raghu-Ravinutala.webp",
    text: "“Titan Capital is truly ‘founder only’. From the first interaction, I was overwhelmed with their focus on making the founder successful beyond anything.”",
  },
  {
    name: "Aarti Gill",
    role: "Cofounder, OZiva",
    companyName: "OZiva",
    image: "/images/Testimonials/Aarti Gill.png",
    text: "“When I first met Kunal, I wasn’t even considering raising equity capital — but that one conversation completely changed my perspective. Partnering with Titan Capital was one of the best decisions we made at OZiva.”",
  },
  {
    name: "Anand Yadav",
    role: "Cofounder, Mekr",
    companyName: "Mekr",
    image: "/images/Testimonials/Anand_yadav.png",
    text: "“Titan Capital was among the first to believe in what we were building at Mekr and backed us when it mattered most. Their founder-first mindset makes them the kind of partner every founder hopes to have.”",
  },
];

const FALLBACK_TOP_FIRST = "What Our Founders Say";
const FALLBACK_TOP_SECOND = "";
const FALLBACK_BOTTOM_FIRST = "You Build the Vision.";
const FALLBACK_BOTTOM_SECOND = "We Help You Scale It.";
const FALLBACK_CTA = "Get Investment";

/* Append Sanity CDN transform params for served images. Local /images/...
   URLs pass through unchanged so the fallback path keeps working. */
function cdnImageSrc(url: string, width: number): string {
  if (url.startsWith("https://cdn.sanity.io/")) {
    return `${url}?w=${width}&auto=format&q=85`;
  }
  return url;
}

/* Derive the company name for the card header if the CMS didn't
   provide one. Roles like "Cofounder, Urban Company" → "Urban Company". */
function deriveCompanyName(item: TestimonialItem): string {
  if (item.companyName) return item.companyName;
  const parts = item.role.split(",");
  return parts.length > 1 ? parts.slice(1).join(",").trim() : item.role;
}

/* ─────────────────────────────────────────────────────────
   VerticalLines — the animated backdrop for the cream area.

   Positions:
     Computed on mount and on resize so lines are always
     SYMMETRICALLY CENTERED across the viewport. Count =
     round(width / 200); startX = (width - (count-1)*200) / 2.
     A 1440 px screen → 7 lines with equal 120 px margin on
     each side. A repeating CSS gradient can't do this
     (it pins the first line at a fixed offset regardless of
     viewport, which is what caused the "extra line on the
     left" — asymmetric margins).

   Animation:
     Each line is its own motion.div. On scroll into view
     (whileInView, once: true), scaleY animates 0 → 1 with
     transformOrigin: top, so the line VISIBLY DRAWS from
     top to bottom. A small per-line stagger (0.08 s) sweeps
     the draw left-to-right for a hand-drawn feel.

   Color / weight: exact #D8D8D8, 1 px, per spec.
   ───────────────────────────────────────────────────────── */
function computeLinePositions(): number[] {
  const w = window.innerWidth;
  const gap = 200;
  const count = Math.max(2, Math.round(w / gap));
  const spread = (count - 1) * gap;
  const startX = (w - spread) / 2;
  return Array.from({ length: count }, (_, i) => startX + i * gap);
}

function VerticalLines({ active }: { active: boolean }) {
  /* SSR-safe initial state — on the server there is no window, so
     we start with [] and let the client fill it in on mount. */
  const [positions, setPositions] = useState<number[]>([]);

  useEffect(() => {
    setPositions(computeLinePositions());
    const onResize = () => setPositions(computeLinePositions());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* Animation is driven by the `active` prop rather than an
     intersection observer on the lines themselves. The parent
     component watches a ref on the "You Build the Vision"
     cream area with useInView — so `active` flips true ONLY
     when the user has actually scrolled into that area, not
     when the (larger) parent section's white-pill top edge
     first crosses the viewport. Variants + staggerChildren
     sweep the lines left-to-right, each drawing top→bottom. */
  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
      initial="hidden"
      animate={active ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.18 } },
      }}
    >
      {positions.map((x, i) => (
        <motion.div
          key={i}
          className="absolute top-0"
          style={{
            left: `${x}px`,
            width: 1,
            height: "100%",
            background: "#D8D8D8",
            transformOrigin: "top",
          }}
          variants={{
            hidden: { scaleY: 0 },
            visible: {
              scaleY: 1,
              transition: { duration: 2.6, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        />
      ))}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   TestimonialCard — one of two visual states:
     - active (center): light blue-purple bg, quote text
     - inactive (sides): cream bg, portrait photo
   Logo strip pinned to the top-left of the card in both states.
   Name + role render BELOW the card (in the parent), not inside.
   ───────────────────────────────────────────────────────── */
function TestimonialCard({
  item,
  active,
}: {
  item: TestimonialItem;
  active: boolean;
}) {
  const companyName = deriveCompanyName(item);
  return (
    <motion.div
      layout
      className="relative shrink-0 overflow-hidden"
      style={{
        width: "min(23.67vw, 36.62vh)" /* ~409 px @ 1728×1117 ref */,
        height: "min(28.36vw, 43.87vh)" /* ~490 px @ ref */,
        borderRadius: "min(0.93vw, 1.43vh)" /* ~16 px */,
        background: active ? "#DBE1F5" : "#FBF7F0",
        transition: "background 400ms ease",
      }}
      animate={{
        scale: active ? 1 : 0.98,
      }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* ── Logo strip (top-left) ── */}
      <div
        className="absolute z-10 flex items-center"
        style={{
          top: "min(1.16vw, 1.79vh)" /* ~20 px */,
          left: "min(1.16vw, 1.79vh)",
          gap: "min(0.46vw, 0.72vh)" /* ~8 px */,
        }}
      >
        {item.companyLogo ? (
          <div
            className="relative"
            style={{
              width: "min(6.94vw, 10.74vh)" /* ~120 px */,
              height: "min(2.31vw, 3.58vh)" /* ~40 px */,
            }}
          >
            <Image
              src={cdnImageSrc(item.companyLogo, 240)}
              alt={companyName}
              fill
              sizes="120px"
              style={{ objectFit: "contain", objectPosition: "left" }}
            />
          </div>
        ) : (
          <>
            {/* Fallback logo tile — black square with company initials */}
            <div
              className="flex items-center justify-center rounded-[6px] bg-black text-white"
              style={{
                width: "min(2.08vw, 3.22vh)" /* ~36 px */,
                height: "min(2.08vw, 3.22vh)",
                fontFamily: "'Poppins', sans-serif",
                fontSize: "min(0.81vw, 1.25vh)" /* ~14 px */,
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {companyName
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")}
            </div>
            <span
              className="font-['Poppins',_sans-serif] font-medium leading-[1.15] text-black"
              style={{
                fontSize: "min(0.87vw, 1.34vh)" /* ~15 px */,
              }}
            >
              {companyName.split(" ").map((w, i, arr) => (
                <span key={i}>
                  {w}
                  {i < arr.length - 1 ? <br /> : null}
                </span>
              ))}
            </span>
          </>
        )}
      </div>

      {/* ── Content area ── */}
      {active ? (
        /* ACTIVE — quote text, top-padded to sit under the logo */
        <div
          className="absolute inset-0 flex items-center"
          style={{
            paddingTop: "min(6.36vw, 9.85vh)" /* ~110 px — clear the logo */,
            paddingBottom: "min(1.85vw, 2.86vh)",
            paddingLeft: "min(1.85vw, 2.86vh)" /* ~32 px */,
            paddingRight: "min(1.85vw, 2.86vh)",
          }}
        >
          <p
            className="m-0 font-['Poppins',_sans-serif] font-normal text-black"
            style={{
              fontSize: "min(1.04vw, 1.61vh)" /* ~18 px */,
              lineHeight: "150%",
            }}
          >
            {item.text}
          </p>
        </div>
      ) : (
        /* INACTIVE — portrait photo filling the card below the logo */
        <div className="absolute inset-0">
          <Image
            src={cdnImageSrc(item.image || "", 800)}
            alt={item.name}
            fill
            sizes="(max-width: 1440px) 24vw, 410px"
            style={{
              objectFit: "cover",
              objectPosition: "center 20%",
              filter: "grayscale(1)",
            }}
          />
        </div>
      )}
    </motion.div>
  );
}

export default function FoundersTestimonialClient({
  data,
}: {
  data?: FoundersTestimonialData | null;
}) {
  const topHeading =
    (data?.topHeadingFirst || FALLBACK_TOP_FIRST) +
    (data?.topHeadingSecond ? ` ${data.topHeadingSecond}` : "");
  const bottomHeadingSecond =
    data?.bottomHeadingSecond || FALLBACK_BOTTOM_SECOND;
  const ctaLabel = data?.ctaLabel || FALLBACK_CTA;
  const testimonials =
    data?.testimonials && data.testimonials.length > 0
      ? data.testimonials
      : FALLBACK_TESTIMONIALS;

  /* Trigger the vertical-lines draw only when the user has
     scrolled into the "You Build the Vision" cream area — NOT
     when the parent section's white-pill top first enters the
     viewport. `amount: 0.15` = fires when 15% of that container
     is on screen, i.e. when the user is clearly looking at it. */
  const bottomRef = useRef<HTMLDivElement>(null);
  const bottomInView = useInView(bottomRef, { once: true, amount: 0.15 });

  /* Which testimonial is currently "active" (center). Auto-cycles
     every 5s; index modulo keeps things circular. */
  const [activeIdx, setActiveIdx] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((i) => (i + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  /* Build the visible 4-card window (prev / active / next / next+1). */
  const visible = [
    testimonials[(activeIdx - 1 + testimonials.length) % testimonials.length],
    testimonials[activeIdx],
    testimonials[(activeIdx + 1) % testimonials.length],
    testimonials[(activeIdx + 2) % testimonials.length],
  ];

  return (
    /* Outer = cream section with vertical-line backdrop. The
       vertical lines animate top→bottom on scroll into view.
       The white "pill" (heading + carousel) sits inside with
       its own rounded top AND bottom corners; the top corners
       poke into the navy Indicorns section above via the pill's
       own negative marginTop, and the bottom corners sit ON the
       cream area of THIS section — so both curves are visible. */
    <section
      className="relative w-full"
      style={{
        background: "#FBF7F0",
        /* NOTE: no overflow-hidden here — the white pill inside has
           marginTop: -115px so its rounded TOP corners intentionally
           sit above the section (over the navy Indicorns behind).
           overflow-hidden would clip that top overflow and the top
           radius would disappear visually. */
      }}
    >
      {/* Animated vertical guide lines — centered symmetrically,
          200 px apart, drawn top→bottom via per-line scaleY.
          `active` is fed by a useInView watching the "You Build
          the Vision" ref below, so the draw fires only when the
          user actually scrolls into that area — not when the
          white-pill / founders-testimonial part first appears. */}
      <VerticalLines active={bottomInView} />

      {/* ══════════ WHITE PILL — heading + carousel ══════════ */}
      <div
        className="relative z-10 mx-auto flex w-full flex-col"
        style={{
          background: "#FFF",
          /* Rounded on ALL four corners so the section reads as a
             floating white card. Same 115 px radius token used by
             Stories/Impact elsewhere on the page. */
          borderRadius: "min(6.66vw, 10.30vh)" /* 115 px @ ref */,
          /* Pull the pill up so its rounded top corners sit ON the
             navy Indicorns section, revealing navy behind them. */
          marginTop: "min(-6.66vw, -10.30vh)" /* -115 px */,
          paddingTop: "min(5.79vw, 8.95vh)" /* ~100 px */,
          paddingBottom: "min(3.47vw, 5.37vh)" /* ~60 px */,
        }}
      >
        {/* ── HEADING — centered, single line ── */}
        <motion.h2
          className="m-0 text-center font-['Poppins',_sans-serif] font-normal text-black max-md:!text-[36px] max-md:!px-[24px]"
          style={{
            fontSize: "min(4.51vw, 6.98vh)" /* 78 px @ ref */,
            lineHeight: "120%",
            paddingLeft: "var(--section-px-wide)",
            paddingRight: "var(--section-px-wide)",
            marginBottom: "min(3.47vw, 5.37vh)" /* ~60 px */,
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {topHeading}
        </motion.h2>

        {/* ── CAROUSEL — 4-card window, center is active ── */}
        <div
          className="mx-auto flex w-full items-start justify-center max-md:!overflow-x-auto max-md:!snap-x max-md:!snap-mandatory max-md:!px-[24px] [&::-webkit-scrollbar]:hidden"
          style={{
            gap: "min(1.85vw, 2.86vh)" /* ~32 px */,
          }}
        >
          {visible.map((item, i) => (
            <div
              key={`${item.name}-${activeIdx}-${i}`}
              className="flex flex-col items-center max-md:!snap-start"
            >
              <TestimonialCard item={item} active={i === 1} />
              {/* Name + role below the card */}
              <div className="mt-[min(1.16vw,1.79vh)] flex flex-col items-center text-center max-md:!mt-[16px]">
                <p
                  className="m-0 font-['Poppins',_sans-serif] font-semibold text-black max-md:!text-[18px]"
                  style={{
                    fontSize: "min(1.62vw, 2.51vh)" /* ~28 px */,
                    lineHeight: "130%",
                  }}
                >
                  {item.name}
                </p>
                <p
                  className="m-0 mt-[min(0.29vw,0.45vh)] font-['Poppins',_sans-serif] font-normal text-black max-md:!text-[13px]"
                  style={{
                    fontSize: "min(0.93vw, 1.43vh)" /* ~16 px */,
                    lineHeight: "150%",
                  }}
                >
                  {item.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════ CREAM BOTTOM — "You Build the Vision" + CTA ══════════
           No local background here — the cream comes from the section
           parent, so the vertical lines behind the parent show through.
           `bottomRef` is the trigger for the vertical-line animation
           (useInView above) — the draw kicks off only once this area
           enters the viewport, not the section as a whole. */}
      <div
        ref={bottomRef}
        className="relative z-10 flex w-full flex-col items-center justify-center"
        style={{
          gap: "min(2.31vw, 3.58vh)" /* ~40 px */,
          paddingLeft: "var(--section-px-wide)",
          paddingRight: "var(--section-px-wide)",
          paddingTop: "min(5.79vw, 8.95vh)" /* ~100 px */,
          paddingBottom: "min(5.79vw, 8.95vh)",
        }}
      >
        <motion.div
          className="flex flex-col items-center justify-center text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2
            className="m-0 text-center font-['Poppins',_sans-serif] font-normal text-black max-md:!text-[28px]"
            style={{
              fontSize: "min(3.24vw, 5.01vh)" /* ~56 px */,
              lineHeight: "130%",
            }}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
              },
            }}
          >
            You Build the{" "}
            <span
              className="relative inline-block px-[8px] max-md:!px-[4px]"
              style={{ background: "#D3E2FF" }}
            >
              Vision.
            </span>
          </motion.h2>
          <motion.h2
            className="m-0 mt-[min(0.58vw,0.90vh)] text-center font-['Poppins',_sans-serif] font-normal text-black max-md:!text-[28px]"
            style={{
              fontSize: "min(3.24vw, 5.01vh)" /* ~56 px */,
              lineHeight: "130%",
            }}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.15,
                },
              },
            }}
          >
            {bottomHeadingSecond}
          </motion.h2>
        </motion.div>

        {/* CTA — dark navy pill button */}
        <Link
          href="/getinvestment"
          className="group relative m-0 flex shrink-0 cursor-pointer items-center justify-center overflow-hidden font-['Poppins',_sans-serif] font-medium leading-[107%] text-white transition-all"
          style={{
            background: "#001A4D",
            height: "min(3.41vw, 5.28vh)" /* 59 px */,
            padding: "0 min(2.31vw, 3.58vh)" /* ~40 px horizontal */,
            fontSize: "min(1.16vw, 1.79vh)" /* ~20 px */,
            borderRadius: "min(1.70vw, 2.64vh)" /* pill — half the height */,
          }}
        >
          <span className="relative z-10">{ctaLabel}</span>
        </Link>
      </div>
    </section>
  );
}
