"use client";

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
   Marquee card slots — gray placeholders for now (images drop
   in later). Positions/sizes recreate the scattered look of the
   design: a mix of portrait + square cards at varied heights.
   `top` uses vh so the vertical scatter tracks the hero height.
   The whole row drifts right → left on a seamless loop.
   ───────────────────────────────────────────────────────── */
const CARDS = [
  { w: "clamp(90px, 11vw, 150px)",   h: "clamp(105px, 13vw, 175px)", top: "6vh" },
  { w: "clamp(100px, 12vw, 165px)",  h: "clamp(95px, 10.5vw, 150px)", top: "22vh" },
  { w: "clamp(80px, 9vw, 130px)",    h: "clamp(105px, 13vw, 170px)", top: "9vh" },
  { w: "clamp(95px, 11.5vw, 150px)", h: "clamp(95px, 11vw, 150px)",  top: "48vh" },
  { w: "clamp(78px, 9vw, 120px)",    h: "clamp(78px, 9vw, 120px)",   top: "58vh" },
  { w: "clamp(95px, 11.5vw, 150px)", h: "clamp(100px, 12vw, 165px)", top: "40vh" },
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

  return (
    <section
      className="relative flex w-full items-center justify-center overflow-hidden bg-white"
      style={{
        marginTop: "var(--nav-height)",
        minHeight: "calc(100svh - var(--nav-height))",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <style>{MARQUEE_CSS}</style>

      {/* ── DRIFTING PLACEHOLDER CARDS (behind heading) ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <div
          className="flex h-full w-max items-start"
          style={{
            gap: "clamp(48px, 7vw, 130px)",
            willChange: "transform",
            animation: "ourstory-marquee 40s linear infinite",
          }}
        >
          {[...CARDS, ...CARDS].map((c, i) => (
            <div
              key={i}
              className="shrink-0 rounded-[2px] bg-[#D9D9D9]"
              style={{ width: c.w, height: c.h, marginTop: c.top }}
            />
          ))}
        </div>
      </div>

      {/* ── HEADING (centered, above the cards) ── */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <h1
          className="m-0 font-['Poppins',_sans-serif] font-bold uppercase text-[#0E0E0E]"
          style={{
            fontSize: "clamp(40px, min(5.55vw, 8.6vh), 96px)",
            lineHeight: "140%",
            opacity: 0,
            animation: "ourstory-rise 0.8s cubic-bezier(0.22,1,0.36,1) 0.1s forwards",
          }}
        >
          {line1}
        </h1>

        <h1
          className="m-0 font-['Poppins',_sans-serif] font-bold uppercase text-[#0E0E0E]"
          style={{
            fontSize: "clamp(40px, min(5.55vw, 8.6vh), 96px)",
            lineHeight: "140%",
            opacity: 0,
            animation: "ourstory-rise 0.8s cubic-bezier(0.22,1,0.36,1) 0.28s forwards",
          }}
        >
          {line2}
        </h1>
      </div>
    </section>
  );
}
