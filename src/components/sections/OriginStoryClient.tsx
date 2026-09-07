"use client";

import { useEffect, useRef } from "react";
import RichText, { type RichTextValue } from "@/components/ui/RichText";
import Image from "next/image";
import { motion, useScroll, useSpring } from "framer-motion";
import {
  BODY_BOLD_CLASS,
  SECTION_HEADING_CLASS,
  SECTION_HEADING_STYLE,
} from "@/styles/heroTypography";

/* ─────────────────────────────────────────────────────────
   Types — shared with the server wrapper (OriginStory.tsx).
   ───────────────────────────────────────────────────────── */
export interface OriginBullet {
  title: string;
  desc: string;
  /** Image URLs (already CDN-resolved by the GROQ query). 1 or more. */
  images: string[];
}

export interface OriginStoryData {
  headingFirst?: string;
  headingHighlight?: string;
  bullets?: OriginBullet[];
}

/* ─────────────────────────────────────────────────────────
   Fallbacks — rendered when Sanity returns null or empty.
   Replace the placeholder images with your real assets in Studio.
   ───────────────────────────────────────────────────────── */
const FALLBACK_HEADING_FIRST = "Origin Story";
const FALLBACK_HEADING_HIGHLIGHT = "Story";
const FALLBACK_BULLETS: OriginBullet[] = [
  {
    title:
      "In 2011, we started backing founders from our own pockets. Not as a fund. Not with a thesis.",
    desc:
      "Just as founders who'd been through the chaos of building a startup from zero, and believed deeply that India was at the beginning of something historic; with the goal that we must do everything in our abilities to support the next generation of founders in achieving their dreams, **Backed before anyone else did** isn't a tagline. It's the only kind of investing we know how to do.",
    images: ["/images/ourstory/1.webp"],
  },
  {
    title: "The word ‘startup’ hadn't yet entered national parlance.",
    desc:
      "The founders we backed early were building in categories that didn't have names yet. Fintech infrastructure. On-demand services. D2C. Hyperlocal logistics. We didn't invest because the markets were obvious. We invested because the founders were exceptional.",
    images: ["/images/ourstory/2.webp"],
  },
  {
    title:
      "Over 15 years, Titan Capital has backed 300+ companies and 500+ founders.",
    desc:
      "Fifteen years on, it's a fund. But the instinct hasn't changed — back the founder first, and the rest tends to follow. Some became Indicorns. Some became unicorns. Many are still building. All of them, the ones that made it and the ones that didn't, taught us something about what it takes.",
    images: ["/images/ourstory/3.webp"],
  },
  {
    title: "Today, Titan Capital is more than a venture capital fund.",
    desc:
      "We're a community, a resource library, an amalgamation of rich experiences, an expert network, and a support system that founders can draw on at every stage. The cheque is just the beginning. Everything that follows is the relationship.",
    images: ["/images/ourstory/4.webp"],
  },
];

/* ─────────────────────────────────────────────────────────
   Sanity CDN image transform helper.
   ───────────────────────────────────────────────────────── */
function cdnImageSrc(url: string, width: number): string {
  if (!url) return url;
  if (!url.startsWith("https://cdn.sanity.io/")) return url;
  return `${url}?w=${width}&auto=format&q=85`;
}

/* ─────────────────────────────────────────────────────────
   Bullet dot — 95×95 SVG with radial-gradient glow + solid
   dark-blue center. Pure SVG; identical across viewports.
   ───────────────────────────────────────────────────────── */
function BulletDot({ uniqueId }: { uniqueId: string }) {
  // Use a per-instance gradient id so multiple dots on the same page
  // don't share the same SVG def (would render only the first one in
  // some browsers).
  const gradId = `bulletDotGlow-${uniqueId}`;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="95"
      height="95"
      viewBox="0 0 95 95"
      fill="none"
      aria-hidden
      style={{
        width: "clamp(56px, min(6.6vw, 9.7vh), 95px)",
        height: "clamp(56px, min(6.6vw, 9.7vh), 95px)",
        flexShrink: 0,
      }}
    >
      <circle cx="47.5" cy="47.5" r="47.5" fill={`url(#${gradId})`} />
      <circle cx="47.5" cy="47.5" r="11.5" fill="#001A4D" />
      <defs>
        <radialGradient
          id={gradId}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(47.5 47.5) rotate(90) scale(47.5 54.4825)"
        >
          <stop offset="0.0625" stopColor="#D3E2FF" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
   THE CARD DECK.

   The swipe is Swiper's `effect-cards`, and the arithmetic below is that
   module's own — its source was read rather than the motion eyeballed, so the
   numbers are its numbers:

     perSlideRotate 2      each card back in the stack sits 2deg further round
     perSlideOffset 8      and 8% further right, less 0.75% per step
     tZ = -100 * |p|       so the stack genuinely recedes in 3D
     shadow rgba(0,0,0,.15) fading in over the second half of a card's exit

   THE ARC — the part that makes it read as a swipe rather than a crossfade —
   is the branch Swiper runs while a card is under the finger:

     sub     = (1 - |(|p| - 0.5)/0.5|) ^ 0.5    peaks at the halfway point
     rotate += -28 * p * sub                    it kicks over
     scale  += -0.5 * sub                       and shrinks
     tXAdd  += 96 * sub                         as it flies out sideways
     tY      = -25 * sub * |p| %                lifting as it goes

   ONE THING IS DELIBERATELY NOT LIKE SWIPER, and it matters. Swiper only runs
   that branch on a real drag; on autoplay it hands two end-state transforms to
   CSS and lets it interpolate, which skips the arc entirely and looks like a
   card sliding 7% left. So progress here is driven continuously through the
   formula on every frame, which is what makes an untouched deck perform the
   same arc the reference does.
   ───────────────────────────────────────────────────────── */
const CARDS = { perSlideRotate: 2, perSlideOffset: 8 };
/** How long one card takes to leave. The reference measures 0.20-0.23s per
 *  transition, but that is a tutorial being clicked through at speed; this is
 *  a photo beside body copy, so it takes the house timing instead. */
const SWIPE_MS = 600;
/** Time a card holds the front before the next one takes it. */
const HOLD_MS = 4000;
/** Swiper's own clamp — nothing beyond four cards deep is computed. */
const MAX_DEPTH = 4;

/** Swiper's `effect-cards` transform for one card at progress `p`. */
function cardState(p: number, count: number) {
  const clamped = Math.min(Math.max(p, -MAX_DEPTH), MAX_DEPTH);
  const ap = Math.abs(clamped);

  const tZ = -100 * ap;
  let rotate = -CARDS.perSlideRotate * clamped;
  let scale = 1;
  let tXAdd = CARDS.perSlideOffset - ap * 0.75;
  let tY = 0;

  // The swipe arc, over the card's own crossing.
  if (ap > 0 && ap < 1) {
    const sub = Math.pow(1 - Math.abs((ap - 0.5) / 0.5), 0.5);
    rotate += -28 * clamped * sub;
    scale += -0.5 * sub;
    tXAdd += 96 * sub;
    tY = -25 * sub * ap;
  }

  const tX = clamped < 0 ? tXAdd * ap : clamped > 0 ? -tXAdd * ap : 0;
  const s = clamped < 0 ? 1 + (1 - scale) * clamped : 1 - (1 - scale) * clamped;

  return {
    transform: `translate3d(${tX}%, ${tY}%, ${tZ}px) rotateZ(${rotate}deg) scale(${s})`,
    shadow: Math.min(Math.max((ap - 0.5) / 0.5, 0), 1),
    zIndex: -Math.abs(Math.round(clamped)) + count,
  };
}

/**
 * HOW MANY CARDS THE STACK HOLDS, which is not the same as how many pictures
 * there are.
 *
 * A card that has been swiped does not vanish — the reference keeps it, at
 * progress +1, +2, and so on, and a still frame of it shows edges fanned out
 * on BOTH sides of the front card. So a card has to travel all the way to the
 * clamp at |p| = 4 before it can be recycled to the back, because that is the
 * only place it is buried deeply enough for the jump not to show.
 *
 * With three pictures there is nowhere to hide that jump: the recycle point
 * would be the deepest RESTING position, in plain view. So the stack is padded
 * out to seven slots and the pictures repeat around it. Only edge slivers of
 * the buried cards are ever visible, which is exactly what the reference shows
 * — you cannot identify a buried card there either.
 */
const DECK_SLOTS = 7;

function ImageDeck({ images, alt }: { images: string[]; alt: string }) {
  const count = images.length;
  const slots = count < 2 ? count : Math.max(count, DECK_SLOTS);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shadeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (count < 2) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let raf = 0;
    let from = 0;
    let start = performance.now() + HOLD_MS;

    /* The house curve. Swiper leaves this to the browser's default `ease`;
       the arc is the mechanism, the curve is the site's. */
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    const paint = (pos: number) => {
      for (let i = 0; i < slots; i += 1) {
        const el = cardRefs.current[i];
        if (!el) continue;
        /* CENTRED wrap, so the recycle lands at the far end of the fan rather
           than in the middle of the resting stack. A card runs 0 -> +3.5,
           where it is buried at the clamp, and reappears at -3.5. */
        const w = (((pos - i) % slots) + slots) % slots;
        const p = w <= slots / 2 ? w : w - slots;
        const st = cardState(p, slots);
        el.style.transform = st.transform;
        el.style.zIndex = `${st.zIndex}`;
        const shade = shadeRefs.current[i];
        if (shade) shade.style.opacity = `${st.shadow}`;
      }
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const elapsed = now - start;
      if (elapsed < 0) {
        paint(from);
        return;
      }
      const t = Math.min(1, elapsed / SWIPE_MS);
      paint(from + ease(t));
      if (t === 1) {
        from += 1;
        start = now + HOLD_MS;
      }
    };

    paint(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [count, slots]);

  // Common card sizing — fluid clamp matching the 437×542 design.
  const cardStyle: React.CSSProperties = {
    width: "clamp(220px, min(30.3vw, 44.5vh), 437px)",
    aspectRatio: "437 / 542",
    borderRadius: "2px",
  };

  const photo = (src: string) => (
    <Image
      src={cdnImageSrc(src, 900)}
      alt={alt}
      fill
      sizes="(max-width: 768px) 70vw, 437px"
      className="object-cover"
      // The source photos ship with their own rounded corners; a slight zoom
      // pushes those corners outside the frame so the card reads with the
      // container's sharp 2px radius instead.
      style={{ transform: "scale(1.06)" }}
    />
  );

  /* ONE PICTURE, NO DECK. With nothing to swipe to, the stack would be a
     single card sitting still — so the original two tilted backing cards stay,
     which is what gives a lone photo its depth. */
  if (count < 2) {
    return (
      <div className="relative" style={cardStyle}>
        <div
          aria-hidden
          className="absolute inset-0 h-full w-full bg-[#DDD]"
          style={{ borderRadius: "2px", transform: "rotate(-5.26deg)" }}
        />
        <div
          aria-hidden
          className="absolute inset-0 h-full w-full bg-[#DDD]"
          style={{ borderRadius: "2px", transform: "rotate(6.005deg)" }}
        />
        <div
          className="absolute inset-0 h-full w-full overflow-hidden bg-[#DDD]"
          style={{ borderRadius: "2px" }}
        >
          {images[0] && photo(images[0])}
        </div>
      </div>
    );
  }

  return (
    /* `perspective` is what makes the tZ above depth rather than decoration —
       Swiper sets it on the container for exactly this reason. */
    <div className="relative" style={{ ...cardStyle, perspective: "1200px" }}>
      {Array.from({ length: slots }, (_, i) => i).map((i) => (
        <div
          key={i}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
          className="absolute inset-0 h-full w-full overflow-hidden bg-[#DDD]"
          style={{
            borderRadius: "2px",
            transformOrigin: "center center",
            willChange: "transform",
            // First paint, before the loop takes over: the resting stack.
            ...(() => {
              const w = ((i % slots) + slots) % slots;
              const st = cardState(w <= slots / 2 ? -w : slots - w, slots);
              return { transform: st.transform, zIndex: st.zIndex };
            })(),
          }}
        >
          {/* The pictures repeat around the padded stack — see DECK_SLOTS. */}
          {photo(images[i % count])}
          {/* Swiper's own slide shadow — a flat 15% black that fades in over
              the second half of a card's exit and keeps the buried cards from
              reading as bright as the front one. */}
          <div
            aria-hidden
            ref={(el) => {
              shadeRefs.current[i] = el;
            }}
            className="pointer-events-none absolute inset-0"
            style={{
              background: "rgba(0,0,0,0.15)",
              opacity: i === 0 ? 0 : 1,
            }}
          />
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Animated dashed connector. Path draws in on scroll via
   Framer Motion's pathLength tween. Hidden on mobile.
   ───────────────────────────────────────────────────────── */
function Connector({ index }: { index: number }) {
  // Pre-defined paths from the design spec.
  const paths = [
    {
      d: "M0.5 0.5C0.5 95 114.555 155.5 316 155.5C587 155.5 698.5 241.5 710.5 285",
      w: 711,
      h: 286,
    },
    {
      d: "M749.996 0.0786133C749.996 0.0786133 729.996 126.079 413.496 144.079C113.496 161.14 4.32943 308.079 0.496094 343.579",
      w: 751,
      h: 344,
    },
    {
      d: "M0.5 0.5C0.5 42 113.5 168 348.5 168C632.636 168 659.5 277.15 671.5 332.5",
      w: 672,
      h: 333,
    },
  ];
  const p = paths[index % paths.length];

  /*
    Scroll-driven draw — ALONG THE CURVE, and reversible.

    IT USED TO BE A RECT. The mask was a rectangle whose height grew downward,
    so the line was revealed by Y COORDINATE rather than by distance travelled
    along it. These curves are close to horizontal through their middles, and
    that is where it showed: measured over the real path geometry, a single
    percent of scroll uncovered 13.5% of path 1 and 13% of path 3 in one frame
    — a ~3px change in the rect's height flicking ~110px of line into being at
    once, while the steep top and bottom crawled. It read as the line arriving
    in slabs instead of drawing itself.

    Animating `pathLength` on a stroked path in the mask instead means the
    reveal advances at a constant rate along the curve: 1% of scroll draws 1%
    of line, wherever on the curve that happens to be.

    THE DASHES SURVIVE because the thing being animated is not the thing being
    seen. `pathLength` works by driving stroke-dasharray, so it cannot share an
    element with a dash pattern of its own — here the mask holds a solid stroke
    that grows, and the visible dashed path shows through it untouched.
  */
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.35"],
  });
  /* Bound straight to scroll — no monotonic clamp — so scrolling back up
     un-draws the line exactly the way it drew, retreating to its start.
     The spring is what keeps that from feeling like a scrubbed timeline:
     the tip trails the scroll slightly and settles, in the house manner. */
  const drawn = useSpring(scrollYProgress, {
    stiffness: 55,
    damping: 26,
    restDelta: 0.0005,
  });
  const maskId = `origin-connector-mask-${index}`;

  return (
    <div
      ref={ref}
      aria-hidden
      className="hidden w-full md:flex md:justify-center"
      style={{ marginTop: "clamp(-40px, -3vw, -16px)" }}
    >
      <svg
        viewBox={`0 0 ${p.w} ${p.h}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: "min(80%, 800px)",
          height: "auto",
        }}
      >
        <defs>
          <mask id={maskId}>
            {/* black = hidden, white = visible. The stroke grows from the
                path's start to its end, so it uncovers the dashed line at a
                steady rate along the curve. Width 6 against the 1px line it
                reveals: enough to clear the dashes' round caps without being
                so wide that a neighbouring stretch of the same curve gets
                uncovered early. */}
            <motion.path
              d={p.d}
              fill="none"
              stroke="white"
              strokeWidth={6}
              strokeLinecap="round"
              style={{ pathLength: drawn }}
            />
          </mask>
        </defs>
        <path
          d={p.d}
          stroke="#000"
          strokeWidth="1"
          strokeDasharray="16 16"
          strokeLinecap="round"
          mask={`url(#${maskId})`}
        />
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Single bullet row — content (dot + title + desc) on one
   side and image deck on the other. Layout flips per row.
   On mobile, image stacks below content.
   ───────────────────────────────────────────────────────── */
function BulletRow({
  bullet,
  reversed,
  index,
}: {
  bullet: OriginBullet;
  reversed: boolean;
  index: number;
}) {
  return (
    <motion.div
      className={`mx-auto flex w-full max-w-[1330px] flex-col items-center gap-[clamp(24px,3vw,48px)] ${
        reversed ? "lg:flex-row-reverse" : "lg:flex-row"
      } lg:items-center lg:justify-between`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      {/* Content column — dot inline with title's first line, desc
          hanging beneath the title text (not under the dot).
          Per design spec:
            Title — Poppins 500, 36px max, 158% line-height, max-w 711px
            Desc  — Poppins 400 (700 for **bold**), 24px max, 150% LH, max-w 669px
          Sizes use the site's standard clamp(MIN, min(vw, vh), MAX)
          so the section shrinks gracefully on every viewport in
          multiview (1097×617 short laptops → 2560×1600 4K). */}
      <div
        className="flex w-full flex-row items-start lg:max-w-[760px]"
        style={{ gap: "clamp(10px, min(1.2vw, 1.8vh), 22px)" }}
      >
        {/* Dot centered on the title's FIRST line: the wrapper's height
            equals one title line-box (1.58 × the title font-size clamp), so
            the dot's core lines up with line 1 at every viewport. The dot
            (with its wide glow) overflows the wrapper equally top/bottom.
            marginLeft pulls the glow halo into the left gutter. */}
        <div
          className="flex shrink-0 items-center justify-center"
          style={{
            height: "calc(1.58 * clamp(20px, min(2.5vw, 3.67vh), 36px))",
            marginLeft: "clamp(-22px, -2vw, -10px)",
          }}
        >
          <BulletDot uniqueId={`b${index}`} />
        </div>
        <div
          className="flex flex-1 flex-col"
          style={{ gap: "clamp(12px, min(1.4vw, 2vh), 24px)" }}
        >
          <h3
            className="m-0 font-['Poppins',_sans-serif] font-medium text-black"
            style={{
              fontSize: "clamp(20px, min(2.5vw, 3.67vh), 36px)",
              lineHeight: "158%",
              maxWidth: "711px",
            }}
          >
            {bullet.title}
          </h3>
          <div
            className="m-0 font-['Poppins',_sans-serif] font-normal text-black/85"
            style={{
              fontSize: "clamp(14px, min(1.67vw, 2.44vh), 24px)",
              lineHeight: "150%",
              maxWidth: "669px",
            }}
          >
            <RichText value={bullet.desc} />
          </div>
        </div>
      </div>

      {/* Image column */}
      <div className="flex w-full justify-center lg:w-auto lg:justify-end">
        <ImageDeck images={bullet.images} alt={bullet.title} />
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main component.
   ───────────────────────────────────────────────────────── */
export default function OriginStoryClient({
  data,
}: {
  data?: OriginStoryData | null;
}) {
  const headingFirst = data?.headingFirst || FALLBACK_HEADING_FIRST;
  const headingHighlight =
    data?.headingHighlight || FALLBACK_HEADING_HIGHLIGHT;
  const bullets =
    data?.bullets && data.bullets.length > 0 ? data.bullets : FALLBACK_BULLETS;

  return (
    <section
      className="relative flex w-full flex-col items-center overflow-hidden bg-[#FBF7F0]"
      style={{
        // Rounded top + bottom corners (same treatment as the "Their
        // Stories" section in ImpactAtGlance) — the white hero above and
        // white FifteenYears below show through the curved corners.
        borderRadius: "min(4.44vw, 7.30vh)",
        paddingTop: "clamp(48px, min(7vw, 10vh), 120px)",
        paddingBottom: "clamp(48px, min(7vw, 10vh), 120px)",
        paddingLeft: "var(--section-px-wide, 5%)",
        paddingRight: "var(--section-px-wide, 5%)",
      }}
    >
      {/* ── HEADING — both words on the same line, side-by-side ── */}
      <motion.div
        className="flex flex-row flex-wrap items-baseline justify-center text-center max-md:!mb-[clamp(32px,6dvh,48px)]"
        style={{ gap: "clamp(8px, min(1vw, 1.5vh), 18px)", marginBottom: "min(3.47vw, 5.37vh)" }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
      >
        <motion.h2
   className={`m-0 text-center text-black ${SECTION_HEADING_CLASS}`}
   style={{ ...SECTION_HEADING_STYLE, }}
   variants={{
   hidden: { opacity: 0, y: 40 },
   visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
   },
   }}
  >
          {headingFirst}
        </motion.h2>

        {/* <motion.div
          className="relative inline-flex items-center justify-center overflow-hidden bg-transparent px-[10px] py-[6px] md:px-[14px] md:py-[10px]"
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.6, ease: "easeOut", delay: 0.3 },
            },
          }}
        >
          <motion.span
            className="absolute inset-0 z-0 h-full w-full bg-[#D3E2FF]"
            style={{ transformOrigin: "left", borderRadius: "4px" }}
            variants={{
              hidden: { scaleX: 0 },
              visible: {
                scaleX: 1,
                transition: { duration: 0.6, ease: "easeInOut", delay: 0.8 },
              },
            }}
          />
          <span
            className={`relative z-10 text-[#001A4D] ${SECTION_HEADING_CLASS}`}
            style={SECTION_HEADING_STYLE}
          >
            {headingHighlight}
          </span>
        </motion.div> */}
      </motion.div>

      {/* ── BULLETS + CONNECTORS ──
          THE GAP IS MOBILE-ONLY, and it is here because the connector is what
          separates the rows on desktop — a ~300px dashed SVG between each pair.
          It is `hidden md:flex`, so below md the rows had nothing between them
          at all: measured at 390px wide, the gap between every pair of rows was
          exactly 0px and a photograph sat flush against the next headline.
          `max-md:` so the desktop spacing, which the connector already handles,
          is untouched. */}
      <div className="flex w-full flex-col max-md:gap-[clamp(52px,13vw,76px)]">
        {bullets.map((bullet, i) => (
          <div key={i} className="w-full">
            <BulletRow bullet={bullet} reversed={i % 2 === 1} index={i} />
            {i < bullets.length - 1 && <Connector index={i} />}
          </div>
        ))}
      </div>
    </section>
  );
}
