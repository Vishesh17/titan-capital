"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, type Variants } from "framer-motion";
import { HeroGlow, AnimatedGrid, RevealLine } from "./BackedEarlyClient";
import {
  HERO_HEADING_DARK_CLASS,
  HERO_HEADING_DARK_STYLE,
} from "@/styles/heroTypography";

/*
  FoundersStoryHero
  ─────────────────
  Same dark animated background as BackedEarly (HeroGlow + AnimatedGrid on
  #00112E). Centered per-character reveal heading "A CENTRAL HUB FOR
  FOUNDERS", with a full-bleed row of 4 founder photos anchored at the
  bottom of the hero.
*/

export interface FoundersStoryHeroData {
  headingLineOne?: string;
  headingLineTwo?: string;
  founderImages?: string[];
}

const FALLBACK_LINE_ONE = "A Central Hub";
const FALLBACK_LINE_TWO = "For Founders";
const FALLBACK_FOUNDERS = [
  "/images/FoundersStory/founder1.webp",
  "/images/FoundersStory/founder2.webp",
  "/images/FoundersStory/founder3.webp",
  "/images/FoundersStory/founder4.webp",
];

/* ── The marquee ──
   ONE TILE WIDTH ON EVERY SCREEN: a quarter of the viewport, so four sit
   across the strip at any size and it reads the way the design does. The row
   used to drop to two-up below `md`; it no longer does. */
const MARQUEE_TILE = "25vw";
/* Pixels per second, NOT a duration. A fixed duration would crawl on a phone
   and race on a wide monitor, because the same distance is a different share
   of the screen. Holding the speed keeps it reading the same everywhere, and
   unchanged when photos are added in Sanity. */
const MARQUEE_SPEED = 110;
/* How quickly a flick bleeds back into the cruising speed, in seconds. Long
   enough that a throw coasts rather than snapping back. */
const MARQUEE_SETTLE = 0.85;
/* A throw cannot exceed this, or one hard flick blurs the strip. */
const MARQUEE_MAX_FLING = 2600;
/* The gap belongs to each tile, not to the track, and that is what makes the
   loop seamless: every tile occupies exactly `tile + gap`, so a whole set is
   an exact multiple of that and the shift lands flush. A `gap` on the flex
   track would leave the join between two sets one gap wider than every other
   join — a stutter once per cycle. */
const MARQUEE_GAP = "clamp(8px, 1vw, 16px)";

/* ── The mobile grid ──
   The phone gets BackedEarly's treatment: a 2x2 block of photos that flips
   itself over on a timer, card by card. Four at a time because that is what
   the block holds — a fifth would open a third row with a hole beside it. */
const MOBILE_PAGE_SIZE = 4;
/* Long enough that the set has settled and can be looked at: one changeover
   runs ~1.9s (a staggered flip out, then a staggered flip in), leaving ~2s of
   stillness. Same 4s BackedEarly holds its grid for. */
const MOBILE_FLIP_INTERVAL = 4000;
/* The first set flips in rather than fading, so this is the hero's entrance
   for it — held back to where the photos used to arrive, after the heading's
   per-character reveal has finished. */
const MOBILE_ENTRANCE_DELAY = 1.2;

const MARQUEE_CSS = `
.fs-marquee-viewport { cursor: grab; touch-action: pan-y; }
.fs-marquee-viewport[data-dragging="true"] { cursor: grabbing; }
.fs-marquee-viewport img { -webkit-user-drag: none; user-select: none; }
`;

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

export default function FoundersStoryHero({
  data,
}: {
  data?: FoundersStoryHeroData | null;
}) {
  const lineOne = data?.headingLineOne || FALLBACK_LINE_ONE;
  const lineTwo = data?.headingLineTwo ?? FALLBACK_LINE_TWO;
  /* The row is a four-up grid, so an empty array would leave a bare strip of
     navy where the photos belong — fall back rather than render nothing. */
  const founders = data?.founderImages?.length
    ? data.founderImages
    : FALLBACK_FOUNDERS;

  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.3 });
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (inView) setShow(true);
  }, [inView]);

  /* ── WHICH FOUR PHOTOS THE MOBILE GRID IS SHOWING ──
     A SLIDING WINDOW, NOT A SLICE. BackedEarly can cut its list into pages
     because it trims the list to an exact multiple of the page size first;
     here the count is whatever the editor added — five today — and a plain
     slice would leave the last page holding one photo and three navy holes.

     So the window wraps: page n starts at (n x 4) mod count and takes four,
     running off the end and back round to the front. Every page is full at
     any count, and because the start moves by four each time, all four tiles
     change on every flip rather than shuffling in place.

     `step` is monotonic rather than modulo so the first set can be told apart
     from the same set coming round again — only the first one waits for the
     heading. It advances once per interval; the arithmetic below is modulo,
     so the number itself never needs bounding. */
  const [step, setStep] = useState(0);
  const total = founders.length;
  /* How many steps before the window is back where it started: 5 photos gives
     5 distinct sets, 8 gives 2, and exactly 4 gives 1 — at which point every
     "page" is the same four photographs and flipping between them would just
     be a tic. Below that the window would repeat a photo inside one page, so
     those counts hold still too. */
  const flipCycle =
    total > MOBILE_PAGE_SIZE ? total / gcd(total, MOBILE_PAGE_SIZE) : 1;

  useEffect(() => {
    if (!show || flipCycle < 2) return;
    const timer = setInterval(
      () => setStep((s) => s + 1),
      MOBILE_FLIP_INTERVAL
    );
    return () => clearInterval(timer);
  }, [show, flipCycle]);

  const mobileSet =
    total <= MOBILE_PAGE_SIZE
      ? founders.map((src, i) => ({ src, index: i }))
      : Array.from({ length: MOBILE_PAGE_SIZE }, (_, k) => {
          const index = (step * MOBILE_PAGE_SIZE + k) % total;
          return { src: founders[index], index };
        });

  /* Recreated each render so it can close over the entrance delay — the flip
     is the mobile grid's arrival, so the very first set holds until the
     heading has finished and every set after it starts immediately. */
  const flipVariants: Variants = {
    initial: { rotateY: -90, opacity: 0 },
    animate: (i: number) => ({
      rotateY: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeInOut",
        delay: (step === 0 ? MOBILE_ENTRANCE_DELAY : 0) + i * 0.25,
      },
    }),
    exit: (i: number) => ({
      rotateY: 90,
      opacity: 0,
      transition: { duration: 0.4, ease: "easeInOut", delay: i * 0.08 },
    }),
  };

  /* ── HOW MANY COPIES OF THE PHOTO SET THE TRACK NEEDS ──
     The strip only ever travels one set's width before wrapping, so at the
     furthest point the visible window reaches `setWidth + viewportWidth` into
     the track. Everything up to there has to be photographs:

         copies x setWidth  >=  setWidth + viewportWidth

     `ceil(viewport / setWidth) + 1` is the smallest count that satisfies it.
     Four photos at 25vw come to 100vw, so two copies do it today — but the
     editor decides how many photos there are, and at two photos a hard-coded
     pair would run the strip dry every cycle. Measured, it just adds copies. */
  const viewportRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState(2);
  const [setWidth, setSetWidth] = useState(0);

  useEffect(() => {
    const viewport = viewportRef.current;
    const set = setRef.current;
    if (!viewport || !set) return;

    const measure = () => {
      /* A set's width is fixed by its own tiles, so reading it here can never
         be changed by the copy count set below — no feedback loop. */
      const w = set.getBoundingClientRect().width;
      if (!w) return;
      setSetWidth(w);
      setCopies(Math.max(2, Math.ceil(viewport.clientWidth / w) + 1));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(viewport);
    ro.observe(set);
    return () => ro.disconnect();
  }, [founders.length]);

  /* ── THE LOOP, AND THE DRAG ──
     Driven per frame rather than by a CSS keyframe. A keyframe cannot be
     nudged: to drag the strip you have to be able to move it yourself, and a
     running animation would keep overwriting whatever you set.

     THE LOOP IS THE MODULO. `offset` is kept inside [0, setWidth) every frame,
     so the strip never runs off its own end — it is not a long track that
     restarts, it is one set's worth of travel repeating forever. Dragging
     wraps through the same modulo, so you can throw it as far as you like in
     either direction and it stays continuous. */
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const velocityRef = useRef(MARQUEE_SPEED);
  const draggingRef = useRef(false);
  const setWidthRef = useRef(0);
  setWidthRef.current = setWidth;

  useEffect(() => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let prev = performance.now();
    let onScreen = true;

    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }, { threshold: 0 });
    io.observe(viewport);

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      /* Capped: a backgrounded tab resumes with one huge gap, which would
         teleport the strip a whole screen sideways in a single frame. */
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      const setW = setWidthRef.current;
      if (!setW || !onScreen) return;

      if (!draggingRef.current) {
        // Ease whatever speed the strip is carrying back to its cruise, so a
        // flick coasts down instead of stopping dead.
        const target = reduced ? 0 : MARQUEE_SPEED;
        velocityRef.current +=
          (target - velocityRef.current) * (1 - Math.exp(-dt / MARQUEE_SETTLE));
        offsetRef.current += velocityRef.current * dt;
      }

      offsetRef.current = ((offsetRef.current % setW) + setW) % setW;
      track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  /* Pointer events rather than mouse/touch pairs: one path covers mouse, pen
     and finger, and pointer capture keeps the drag alive when the cursor
     leaves the strip mid-throw. */
  const dragRef = useRef({ x: 0, t: 0 });

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    velocityRef.current = 0;
    dragRef.current = { x: e.clientX, t: performance.now() };
    /* Capture is a nicety, not a requirement — the drag works from the events
       alone. Some pointer ids cannot be captured and throw, and losing the
       strip to an exception would be a worse trade than losing the capture. */
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    e.currentTarget.dataset.dragging = "true";
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const now = performance.now();
    const dx = e.clientX - dragRef.current.x;
    const dt = (now - dragRef.current.t) / 1000;
    // Drag right, content goes right — so the offset moves against the finger.
    offsetRef.current -= dx;
    if (dt > 0) {
      velocityRef.current = Math.max(
        -MARQUEE_MAX_FLING,
        Math.min(MARQUEE_MAX_FLING, -dx / dt)
      );
    }
    dragRef.current = { x: e.clientX, t: now };
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    /* The release keeps whatever velocity the last move measured, and the
       ticker eases it back to cruise — that is the throw. A pointer that has
       been still for a moment before release has a velocity near zero, so
       letting go without moving does not fling anything. */
    e.currentTarget.dataset.dragging = "false";
  };

  return (
    <section
      ref={sectionRef}
      /* Mobile matches BackedEarly: the strip becomes a grid inside the page
         gutter, so the section needs a floor under it rather than running the
         photos flush to the bottom edge the way the marquee does. */
      className="relative flex w-full flex-col overflow-hidden max-md:overflow-x-hidden max-md:w-[100vw] max-md:ml-[calc(50%-50vw)] max-md:!pb-[clamp(20px,min(4vw,6vh),60px)] bg-[#00112E] min-h-[100svh]"
      style={{
        paddingTop: "calc(var(--nav-height) + clamp(20px, min(4vw, 6vh), 60px))",
        paddingBottom: 0,
      }}
    >
      <HeroGlow />
      <AnimatedGrid />

      <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-between">
        {/* ── HEADING ── */}
        <div className="flex w-full flex-1 flex-col items-center justify-center px-[var(--section-px-wide)] max-md:!flex-none max-md:!justify-start max-md:!mt-[clamp(44px,16vw,80px)] max-md:!mb-[clamp(16px,4vw,28px)]">
          <h1
            className={`m-0 flex w-full flex-col items-center justify-center text-center text-white ${HERO_HEADING_DARK_CLASS}`}
            /* The two lines are flex items, so level 1's 86% line-height is the
               only thing between them and the boxes touch at 0px — the same
               reason BackedEarly's heading carries this. */
            style={{ ...HERO_HEADING_DARK_STYLE, rowGap: "0.12em" }}
          >
            <RevealLine show={show} delay={0}>{lineOne}</RevealLine>
            {lineTwo && (
              <RevealLine show={show} delay={0.5}>{lineTwo}</RevealLine>
            )}
          </h1>
        </div>

        {/* ── FULL-BLEED MARQUEE OF FOUNDER PHOTOS — DESKTOP ──
            Four across, travelling left, looping seamlessly.

            IT IS DESKTOP ONLY, exactly as BackedEarly's is. Four tiles across a
            phone puts each one at ~94px, which is too small for a face; below
            `md` the two-up grid underneath takes over. The measuring effect
            keeps running while this is display:none — it reads a width of 0,
            bails, and picks the real numbers up from the ResizeObserver the
            moment the breakpoint puts it back on screen. */}
        <motion.div
          ref={viewportRef}
          className="fs-marquee-viewport hidden w-full shrink-0 overflow-hidden md:block"
          initial={{ opacity: 0, y: 30 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut", delay: 1.2 }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <style>{MARQUEE_CSS}</style>
          <div ref={trackRef} className="fs-marquee-track flex w-max">
            {Array.from({ length: copies }, (_, copy) => (
              <div
                key={copy}
                ref={copy === 0 ? setRef : undefined}
                className="flex shrink-0"
                /* Only the first set is announced; the rest are the same
                   photographs again and would only repeat themselves. */
                aria-hidden={copy > 0 || undefined}
              >
                {founders.map((src, i) => (
                  <div
                    key={`${copy}-${i}`}
                    className="relative shrink-0 overflow-hidden bg-[#0e1120]"
                    style={{
                      width: MARQUEE_TILE,
                      marginRight: MARQUEE_GAP,
                      aspectRatio: "1433 / 1167",
                    }}
                  >
                    <Image
                      src={src}
                      alt={copy === 0 ? `Founder ${i + 1}` : ""}
                      fill
                      sizes="25vw"
                      className="object-cover object-center"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── 2 x 2 FLIPPING GRID — MOBILE ──
            BackedEarly's mobile treatment, card-flip and all: the photos sit
            in the page gutter as a grid rather than a strip, so each one is
            about half the screen instead of a quarter, and the block turns
            itself over on a timer to work through the whole set. Same 12px
            gap, same rotateY choreography, same 3D framing — the outer
            perspective for the block and a per-cell one so each card turns
            about its own centre rather than the grid's.

            Every photo the editor added is reachable here, which the old fixed
            slice of four could not do. The desktop marquee above still carries
            them all in one pass. */}
        <div
          className="w-full shrink-0 px-[var(--section-px-wide)] md:hidden"
          style={{ perspective: "1200px" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              className="grid w-full grid-cols-2 grid-rows-2 gap-[12px]"
              style={{ transformStyle: "preserve-3d" }}
            >
              {mobileSet.map(({ src, index }, i) => (
                <div key={`m-${i}`} style={{ perspective: "1000px" }}>
                  <motion.div
                    variants={flipVariants}
                    custom={i}
                    initial="initial"
                    /* Held at the initial rotation until the section is on
                       screen, so a hero scrolled past on load does not spend
                       its entrance flip out of sight. The cells still occupy
                       their grid tracks the whole time — a rotation costs no
                       layout — so nothing below them moves. */
                    animate={show ? "animate" : "initial"}
                    exit="exit"
                    style={{ transformStyle: "preserve-3d" }}
                    className="h-full w-full"
                  >
                    <div
                      className="relative w-full overflow-hidden bg-[#0e1120]"
                      style={{ aspectRatio: "1433 / 1167" }}
                    >
                      <Image
                        src={src}
                        alt={`Founder ${index + 1}`}
                        fill
                        sizes="50vw"
                        className="object-cover object-center"
                      />
                    </div>
                  </motion.div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
