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
   Drifting placeholder field.

   A 3-row grid of uniform cells drifts right → left. Every cell
   holds a gray rectangle that is BIG or SMALL, alternating like a
   chess board — `(row + col) % 2`. Because every cell is the same
   size, columns line up across the rows and the row-to-row spacing
   is a single constant gap. All sizes use clamp + min(vw, vh) so
   the whole field compresses responsively on short/narrow screens.
   Images can drop into the rectangles later.
   ───────────────────────────────────────────────────────── */
const ROWS = 3;
const COLS = 14; // unique columns (even → checkerboard stays seamless when doubled)

const CELL_W = "clamp(84px, min(11vw, 15.5vh), 172px)";
const CELL_H = "clamp(94px, min(12.5vw, 17vh), 196px)";
const COL_GAP = "clamp(26px, min(3.6vw, 5vh), 84px)";
const ROW_GAP = "clamp(14px, min(1.8vw, 2.5vh), 34px)";
const SMALL_SCALE = "58%"; // small rectangles fill 58% of their cell

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

  const columns = Array.from({ length: COLS });
  const rows = Array.from({ length: ROWS });

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

      {/* ── DRIFTING CHECKERBOARD FIELD (behind heading) ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 flex items-center overflow-hidden"
      >
        <div
          className="flex w-max"
          style={{
            gap: COL_GAP,
            willChange: "transform",
            animation: "ourstory-marquee 55s linear infinite",
          }}
        >
          {[...columns, ...columns].map((_, ci) => (
            <div key={ci} className="flex shrink-0 flex-col" style={{ gap: ROW_GAP }}>
              {rows.map((__, ri) => {
                const big = (ci + ri) % 2 === 0;
                return (
                  <div
                    key={ri}
                    className="flex shrink-0 items-center justify-center"
                    style={{ width: CELL_W, height: CELL_H }}
                  >
                    <div
                      className="rounded-[2px] bg-[#D9D9D9]"
                      style={{
                        width: big ? "100%" : SMALL_SCALE,
                        height: big ? "100%" : SMALL_SCALE,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── HEADING + DESCRIPTION (centered, above the field) ── */}
      <div className="relative z-10 flex max-w-[760px] flex-col items-center text-center">
        <h1
          className="m-0 font-['Poppins',_sans-serif] font-bold uppercase text-[#0E0E0E]"
          style={{
            fontSize: "clamp(44px, min(6.3vw, 9.7vh), 112px)",
            lineHeight: "132%",
            opacity: 0,
            animation: "ourstory-rise 0.8s cubic-bezier(0.22,1,0.36,1) 0.1s forwards",
          }}
        >
          {line1}
        </h1>

        <h1
          className="m-0 font-['Poppins',_sans-serif] font-bold uppercase text-[#0E0E0E]"
          style={{
            fontSize: "clamp(44px, min(6.3vw, 9.7vh), 112px)",
            lineHeight: "132%",
            opacity: 0,
            animation: "ourstory-rise 0.8s cubic-bezier(0.22,1,0.36,1) 0.28s forwards",
          }}
        >
          {line2}
        </h1>

        <p
          className="m-0 font-['Poppins',_sans-serif] font-normal leading-[1.6] text-[#1a1a1a] max-md:!text-[14px]"
          style={{
            marginTop: "clamp(16px, min(2.5vw, 4vh), 36px)",
            fontSize: "clamp(14px, min(1.6vw, 2.35vh), 20px)",
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
