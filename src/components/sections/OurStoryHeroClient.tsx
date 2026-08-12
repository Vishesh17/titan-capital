"use client";

import {
  HERO_HEADING_LIGHT_CLASS,
  HERO_HEADING_LIGHT_STYLE,
  HERO_BODY_CLASS,
  HERO_BODY_STYLE,
} from "@/styles/heroTypography";

/* ─────────────────────────────────────────────────────────
   Types — shared with the server wrapper (OurStoryHero.tsx).
   ───────────────────────────────────────────────────────── */
export interface OurStoryHeroData {
  headingFirst?: string;
  headingHighlight?: string;
  quote?: string;
  image?: string;
}

/* ─────────────────────────────────────────────────────────
   Drifting placeholder field.

   Randomly-sized gray rectangles scattered at random heights,
   drifting right → left on a seamless loop. Sizes/offsets are a
   fixed hand-tuned set (deterministic → no hydration mismatch)
   but read as random. Every value uses clamp + min(vw, vh) so the
   whole field compresses responsively on short/narrow screens.
   `top` is the vertical scatter (vh) and `ml` is the horizontal
   gap before each rectangle (varied → uneven spacing). Images can
   drop into the rectangles later.
   ───────────────────────────────────────────────────────── */
const CARDS = [
  { w: "clamp(84px, 9.5vw, 150px)",  h: "clamp(104px, min(12.5vw, 16.5vh), 185px)", top: "6vh",  ml: "clamp(26px, 3.4vw, 62px)" },
  { w: "clamp(62px, 6.8vw, 104px)",  h: "clamp(68px, min(7.8vw, 10.5vh), 116px)",   top: "40vh", ml: "clamp(46px, 5.6vw, 108px)" },
  { w: "clamp(96px, 11vw, 168px)",   h: "clamp(84px, min(10vw, 13vh), 150px)",      top: "20vh", ml: "clamp(22px, 2.8vw, 48px)" },
  { w: "clamp(72px, 8vw, 124px)",    h: "clamp(96px, min(11.5vw, 15vh), 168px)",    top: "1vh",  ml: "clamp(52px, 6.2vw, 124px)" },
  { w: "clamp(88px, 10vw, 150px)",   h: "clamp(76px, min(8.8vw, 11.5vh), 128px)",   top: "52vh", ml: "clamp(28px, 3.4vw, 64px)" },
  { w: "clamp(58px, 6.2vw, 96px)",   h: "clamp(62px, min(7.2vw, 9.5vh), 104px)",    top: "28vh", ml: "clamp(54px, 6.6vw, 132px)" },
  { w: "clamp(92px, 10.5vw, 160px)", h: "clamp(100px, min(12vw, 15.5vh), 180px)",   top: "13vh", ml: "clamp(24px, 3vw, 52px)" },
  { w: "clamp(68px, 7.4vw, 114px)",  h: "clamp(72px, min(8.2vw, 10.8vh), 122px)",   top: "45vh", ml: "clamp(48px, 5.8vw, 112px)" },
  { w: "clamp(80px, 9vw, 140px)",    h: "clamp(88px, min(10.5vw, 13.5vh), 156px)",  top: "32vh", ml: "clamp(32px, 3.8vw, 74px)" },
  { w: "clamp(74px, 8.2vw, 128px)",  h: "clamp(80px, min(9.4vw, 12.2vh), 140px)",   top: "8vh",  ml: "clamp(44px, 5.2vw, 100px)" },
];

const MARQUEE_CSS = `
@keyframes ourstory-marquee {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
@keyframes ourstory-rise {
  0%   { opacity: 0; transform: translateY(40px); }
  100% { opacity: 1; transform: translateY(0); }
}
`;

export default function OurStoryHeroClient({
  data,
}: {
  data?: OurStoryHeroData | null;
}) {
  // Heading is fixed for the new marquee hero design. `data` is retained
  // for future Sanity wiring (images / quote) but is not used for layout.
  void data;

  const line1 = "Being Founder";
  const line2 = "Takes Guts";
  // TODO: replace with the real hero subtitle (placeholder copy for now).
  const description =
    "Built by founders, for founders — the story behind every conviction, every cheque, and every late-night call.";

  return (
    <section
      className="relative flex w-full items-center justify-center overflow-hidden bg-white"
      style={{
        // White section starts at the very top so its background fills
        // behind the transparent navbar (nav strip matches the hero until
        // it turns blue on scroll). Content clears the nav via paddingTop.
        height: "78svh",
        paddingTop: "var(--nav-height)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <style>{MARQUEE_CSS}</style>

      {/* ── DRIFTING SCATTERED FIELD (behind heading, below the nav) ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 overflow-hidden"
        style={{ top: "var(--nav-height)" }}
      >
        <div
          className="flex h-full w-max items-start"
          style={{
            willChange: "transform",
            animation: "ourstory-marquee 60s linear infinite",
          }}
        >
          {[...CARDS, ...CARDS].map((c, i) => (
            <div
              key={i}
              className="shrink-0 rounded-[2px] bg-[#D9D9D9]"
              style={{ width: c.w, height: c.h, marginTop: c.top, marginLeft: c.ml }}
            />
          ))}
        </div>
      </div>

      {/* ── HEADING + DESCRIPTION (centered, above the field) ── */}
      <div className="relative z-10 flex max-w-[760px] flex-col items-center text-center">
        <h1
          className={`m-0 text-[#0E0E0E] ${HERO_HEADING_LIGHT_CLASS}`}
          style={{
            ...HERO_HEADING_LIGHT_STYLE,
            opacity: 0,
            animation: "ourstory-rise 0.8s cubic-bezier(0.22,1,0.36,1) 0.1s forwards",
          }}
        >
          {line1}
        </h1>

        <h1
          className={`m-0 text-[#0E0E0E] ${HERO_HEADING_LIGHT_CLASS}`}
          style={{
            ...HERO_HEADING_LIGHT_STYLE,
            opacity: 0,
            animation: "ourstory-rise 0.8s cubic-bezier(0.22,1,0.36,1) 0.28s forwards",
          }}
        >
          {line2}
        </h1>

        <p
          className={`font-normal m-0 text-[#1a1a1a] ${HERO_BODY_CLASS}`}
          style={{
            ...HERO_BODY_STYLE,
            marginTop: "clamp(16px, min(2.5vw, 4vh), 36px)",
            opacity: 0,
            animation: "ourstory-rise 0.8s cubic-bezier(0.22,1,0.36,1) 0.46s forwards",
          }}
        >
          {description}
        </p>
      </div>
    </section>
  );
}
