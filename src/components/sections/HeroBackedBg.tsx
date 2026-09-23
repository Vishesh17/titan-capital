"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/* ─────────────────────────────────────────────────────────
   HeroBackedBg — the home page's first screen, and the handover out of it.

   THE FIRST SCREEN is the hero and Backed Before together, one block, one
   viewport, nothing animating between them.

   THE HANDOVER is OUR STORY'S, lifted from OurStoryHeroClient: the block pins
   and recedes very slightly while How We Show Up climbs over it like a
   curtain. It does not fade away and there is no background crossfade — the
   block stays visible the whole time, just dropped back into depth, and the
   incoming section is what takes the screen.

   WHY THE CURTAIN IS BETTER HERE than what it replaces. The previous version
   faded the block to nothing over a fixed dwell, which meant the fade finished
   long before the next section could arrive — the block is a whole viewport
   tall, so How We Show Up could not reach the top until all 100vh of it had
   scrolled past. Measured at 1440x900 that was 930px of scrolling with nothing
   on screen but background, and it needed a derived overlap to paper over. A
   curtain has no such hole by construction: the thing covering the block IS
   the thing arriving, so the screen is never empty.

   ── THE PIN ──
   Three boxes, each doing a separate job. This is Our Story's structure:

     outer   relative, 150vh   the SCROLL DISTANCE the block occupies in the
                               document. How We Show Up begins right after it,
                               so this is what decides when the curtain starts.
     inner   absolute, 300vh   the sticky element's CONTAINING BLOCK, running
                               deliberately past the outer box. Being absolute
                               it adds nothing to the flow, so it lengthens the
                               pin without lengthening the page.
     block   sticky,   100vh   what you actually see: hero above, logos below.

   THE INNER BOX IS THE WHOLE TRICK. A sticky element is released the moment
   its containing block runs out — so pinned directly inside the 150vh outer
   box, the block would come unstuck at 50vh, which is the exact moment the
   curtain starts to cover it, and it would slide up as the curtain rose.
   Given 300vh to stick within it stays perfectly still while the section below
   climbs over it.

   Nothing paints the curtain over the block: How We Show Up simply comes later
   in the DOM and is positioned, so at equal stacking it wins. No z-index.
   ───────────────────────────────────────────────────────── */

const NAVY = "#000c22";

/** The curtain only starts a third of the way through the pin — at 50vh,
 *  which is when How We Show Up first appears at the bottom of the screen —
 *  so nothing moves before there is something to move for. Our Story's own
 *  value. */
const CURTAIN_START = 1 / 3;

/** How far the block recedes while it is being covered. Our Story's numbers.
 *  Deliberately slight: this is depth, not an exit. */
const RECEDE_SCALE = 0.92;
const RECEDE_FADE = 0.72;

export default function HeroBackedBg({
  hero,
  howWeShow,
}: {
  /** The hero section — which now contains Backed Before as its own last
   *  child, so the two share one background. This component no longer places
   *  the marquees; it only pins and recedes whatever the first screen is. */
  hero: ReactNode;
  howWeShow: ReactNode;
}) {
  const pinRef = useRef<HTMLDivElement>(null);

  /* `["start start", "end start"]` puts progress at 0 where the outer box's
     top meets the viewport top and 1 where its bottom does — the outer box is
     150vh, so that is exactly the pinned run. */
  const { scrollYProgress: pinProgress } = useScroll({
    target: pinRef,
    offset: ["start start", "end start"],
  });

  const blockScale = useTransform(pinProgress, [CURTAIN_START, 1], [1, RECEDE_SCALE]);
  const blockFade = useTransform(pinProgress, [CURTAIN_START, 1], [1, RECEDE_FADE]);

  return (
    <div className="relative">
      <div
        ref={pinRef}
        className="relative w-full h-[150vh] max-md:!h-[150dvh]"
        /* Navy sits on the PIN, not on the block, so the sliver the block
           uncovers at its edges as it recedes is the hero's own colour rather
           than the page's white. */
        style={{ background: NAVY }}
      >
        <div className="absolute inset-x-0 top-0 h-[300vh] max-md:!h-[300dvh]">
          {/* ── THE FIRST SCREEN ──
              Exactly one viewport, and the hero section fills it. The split
              between the headline and the marquees is the hero's own business
              now — see the flex column in HeroClient — which is precisely why
              there is no seam in the background between them. */}
          <motion.div
            className="sticky top-0 h-screen w-full overflow-hidden max-md:!h-[100dvh]"
            style={{ scale: blockScale, opacity: blockFade }}
          >
            {hero}
          </motion.div>
        </div>
      </div>

      {/* The curtain. Later in the DOM and positioned, so it climbs over the
          pinned block on its own. It paints its own beige. */}
      <div className="relative">{howWeShow}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   WHAT THIS REPLACED, kept whole so either can be put back in one paste.

   ── VERSION 2: the dwell-and-fade handover, Backed Before -> How We Show Up.
   The block pinned in a 100vh + 70vh track and faded out entirely, with the
   background crossfading navy -> beige underneath it and How We Show Up pulled
   up by a derived overlap so the fade did not finish over an empty screen.

   const NAVY = "#000c22";
   const BEIGE = "#FBF7F0";
   const DWELL_VH = 70;
   const FADE_FROM = 0.25;
   const FADE_TO = 0.95;
   const EXIT_SCALE = 0.96;
   const OVERLAP_VH = DWELL_VH * (1 - FADE_FROM);

   // ...inside the component:
   //   const { scrollY } = useScroll();
   //   const [vh, setVh] = useState(800);
   //   useEffect(() => {
   //     const measure = () => setVh(window.innerHeight);
   //     measure();
   //     window.addEventListener("resize", measure);
   //     return () => window.removeEventListener("resize", measure);
   //   }, []);
   //   const EASE = cubicBezier(0.4, 0, 0.2, 1);
   //   const dwell = (DWELL_VH / 100) * vh;
   //   const blockOpacity = useTransform(scrollY, [FADE_FROM*dwell, FADE_TO*dwell], [1, 0], { ease: EASE });
   //   const blockScale   = useTransform(scrollY, [0, dwell], [1, EXIT_SCALE], { ease: EASE });
   //   const beigeOpacity = useTransform(scrollY, [FADE_FROM*dwell, FADE_TO*dwell], [0, 1], { ease: EASE });
   //
   //   JSX:
   //     <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
   //       <div className="absolute inset-0" style={{ background: NAVY }} />
   //       <motion.div className="absolute inset-0" style={{ background: BEIGE, opacity: beigeOpacity }} />
   //     </div>
   //     <div className="relative z-[1]">
   //       <div className="relative z-0" style={{ height: `${100 + DWELL_VH}vh` }}>
   //         <div className="sticky top-0 h-screen overflow-hidden max-md:h-[100dvh]">
   //           <motion.div style={{ opacity: blockOpacity, scale: blockScale }} className="flex h-full w-full flex-col">
   //             <div className="min-h-0 flex-1">{hero}</div>
   //             <div className="shrink-0">{backed}</div>
   //           </motion.div>
   //         </div>
   //       </div>
   //       <div className="relative z-10" style={{ marginTop: `-${OVERLAP_VH}vh` }}>{howWeShow}</div>
   //     </div>

   ── VERSION 1: the original, with the animation on the HERO -> BACKED BEFORE
   seam. The hero pinned alone in a 110vh track fading and scaling away, the
   background crossfading navy -> white, then Backed Before and How We Show Up
   rising together as a second sticky group with a beige crossfade at their own
   seam. Two elements were measured with a ResizeObserver to locate the seams.

   const HERO_TRACK_VH = 110;
   const BACKED_DWELL_VH = 80;
   const WHITE = "#ffffff";

   //   const groupRef = useRef<HTMLDivElement>(null);
   //   const seamRef = useRef<HTMLDivElement>(null);
   //   const [groupY, setGroupY] = useState((HERO_TRACK_VH / 100) * 800);
   //   const [seamY, setSeamY] = useState((HERO_TRACK_VH / 100) * 800 + 300);
   //   useEffect(() => {
   //     const measure = () => {
   //       setVh(window.innerHeight);
   //       if (groupRef.current) setGroupY(groupRef.current.getBoundingClientRect().top + window.scrollY);
   //       if (seamRef.current)  setSeamY(seamRef.current.getBoundingClientRect().top + window.scrollY);
   //     };
   //     measure();
   //     window.addEventListener("resize", measure);
   //     let observer: ResizeObserver | null = null;
   //     if (typeof document !== "undefined") {
   //       observer = new ResizeObserver(() => { measure(); });
   //       observer.observe(document.body);
   //       if (document.fonts?.ready) { document.fonts.ready.then(measure); }
   //     }
   //     return () => {
   //       window.removeEventListener("resize", measure);
   //       if (observer) observer.disconnect();
   //     };
   //   }, []);
   //   const heroOpacity    = useTransform(scrollY, [0, 0.6*vh], [1, 0], { ease: EASE });
   //   const heroScale      = useTransform(scrollY, [0, 0.5*vh], [1, 0.96], { ease: EASE });
   //   const whiteOpacity   = useTransform(scrollY, [0.2*vh, 0.8*vh], [0, 1], { ease: EASE });
   //   const contentOpacity = useTransform(scrollY, [groupY - 0.8*vh, groupY - 0.2*vh], [0, 1], { ease: EASE });
   //   const beigeOpacity   = useTransform(scrollY, [seamY - 0.5*vh, seamY + 0.1*vh], [0, 1], { ease: EASE });
   //
   //   JSX:
   //     <div style={{ height: `${HERO_TRACK_VH}vh` }}>
   //       <div className="sticky top-0 h-screen overflow-hidden">
   //         <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="h-full w-full">{hero}</motion.div>
   //       </div>
   //     </div>
   //     <motion.div ref={groupRef} style={{ opacity: contentOpacity }}>
   //       <div style={{ minHeight: `${100 + BACKED_DWELL_VH}vh` }}>
   //         <div className="sticky top-[120px] md:top-[200px]">
   //           {backed}
   //           <div ref={seamRef} aria-hidden />
   //           <div className="relative">
   //             <motion.div className="pointer-events-none absolute inset-0" aria-hidden
   //               style={{ background: BEIGE, opacity: beigeOpacity }} />
   //             <div className="relative">{howWeShow}</div>
   //           </div>
   //         </div>
   //       </div>
   //     </motion.div>
   ───────────────────────────────────────────────────────── */
