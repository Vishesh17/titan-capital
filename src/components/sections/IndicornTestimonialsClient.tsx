"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useLenis } from "lenis/react";
import {
  BODY_BOLD_CLASS,
  HERO_BODY_CLASS,
  HERO_BODY_STYLE,
  LABEL_STYLE,
  SECTION_HEADING_CLASS,
  SECTION_HEADING_STYLE,
} from "@/styles/heroTypography";

const EASE = [0.22, 1, 0.36, 1] as const;
const INTERVAL_MS = 5000; // auto-advance cadence
const SPIN_MS = 1.05; // seconds for one card→next rotation

export interface IndicornTestimonialItem {
  image: string;
  quote: string;
  name?: string;
  role?: string;
}

export interface IndicornTestimonialsData {
  headingTop?: string;
  headingBottom?: string;
  description?: string;
  testimonials?: IndicornTestimonialItem[];
}

const FALLBACK_HEADING_TOP = "What Founders Say";
const FALLBACK_HEADING_BOTTOM = "About The Indicorns";
const FALLBACK_DESCRIPTION =
  "We asked founders from the Indicorn community what the recognition means to them — and how it changed the way they think about building a company.";

const FALLBACK_TESTIMONIALS: IndicornTestimonialItem[] = [
  {
    image: "/images/indicorns/kapil_makhija.png",
    quote:
      '"The unicorn framing was never ours. Indicorn is. It asks the right question: have you built something real? Have you built something that lasts? That\'s what we were always trying to do."',
    name: "Kapil Makhija",
    role: "CEO, Unicommerce",
  },
  {
    image: "/images/indicorns/Varun_alagh.png",
    quote:
      '"Profitability was always our north star. We built Mamaearth for the long run, not for the next funding round. The Indicorn term finally gives that philosophy a name."',
    name: "Varun Alagh",
    role: "Co-founder & CEO, Mamaearth",
  },
  {
    image: "/images/indicorns/kunal_bahl.png",
    quote:
      '"The unicorn framing was never ours. Indicorn is. It asks the right question: have you built something real? Have you built something that lasts? That\'s what we were always trying to do."',
    name: "Kunal Bahl",
    role: "Co-founder, Titan Capital",
  },
];

/* ── 3D cylinder geometry ──
   Rectangular cards (wide, short) sit on a cylinder that spins around the Y
   axis. `pos` is the continuous front index (grows monotonically; wrapped
   circularly here so rotation is always forward). Side cards angle away, sink
   back in Z, shrink, and fade to barely-there. */
const ROT = 46; // deg each card rotates as it leaves centre
const SPREAD_VW = 31; // how far to the sides neighbours sit (vw)
const DEPTH = 210; // how far back neighbours are pushed (px)

function signedOffset(p: number, i: number, n: number): number {
  let d = ((((i - p) % n) + n) % n); // 0..n
  if (d > n / 2) d -= n; // -n/2..n/2
  return d;
}

function cardTransform(p: number, i: number, n: number): string {
  const d = signedOffset(p, i, n);
  const ad = Math.abs(d);
  const scale = Math.max(0.6, 1 - ad * 0.17);
  return `translate(-50%, -50%) translateX(${d * SPREAD_VW}vw) translateZ(${-ad * DEPTH}px) rotateY(${-d * ROT}deg) scale(${scale})`;
}

function cardOpacity(p: number, i: number, n: number): number {
  // Front card fully opaque; sides fall off fast so they read as faint.
  const ad = Math.abs(signedOffset(p, i, n));
  return Math.max(0, Math.min(1, 1 - ad * 0.82));
}

function cardZ(p: number, i: number, n: number): number {
  return Math.round(100 - Math.abs(signedOffset(p, i, n)) * 20);
}

/* ── Quote mark ── */
function QuoteMark() {
  return (
    <svg
      viewBox="0 0 42 33"
      fill="none"
      aria-hidden
      className="max-md:!w-[18px]"
      style={{ width: "clamp(24px, 2.2vw, 38px)", height: "auto" }}
    >
      <path
        d="M24.5946 22.5385C24.5946 15.948 26.7387 9.90141 31.027 4.3987C33.7387 1.07148 35.9144 -0.368185 37.5541 0.0797102C39.0676 0.655575 39.8243 1.51937 39.8243 2.6711C39.8243 3.75885 39.3198 4.91058 38.3108 6.12629C37.3649 7.34201 36.6081 8.33378 36.0405 9.1016C35.473 9.86942 35 10.7012 34.6216 11.597C33.7387 13.3886 33.2973 15.5641 33.2973 18.1235C34.8108 17.6756 36.3243 17.8675 37.8378 18.6994C40.6126 20.299 42 22.3465 42 24.8419C42 27.2733 41.2432 29.2569 39.7297 30.7925C38.2793 32.2642 36.2613 33 33.6757 33C31.0901 33 28.9144 32.0082 27.1486 30.0247C25.4459 27.9772 24.5946 25.4818 24.5946 22.5385ZM0 22.5385C0 15.6921 2.11261 9.64547 6.33784 4.3987C9.55405 0.495613 12.2342 -0.68811 14.3784 0.84753C14.8198 1.16746 15.0405 1.67934 15.0405 2.38317C15.0405 3.66287 14.5676 4.91058 13.6216 6.12629C12.7387 7.34201 12.0135 8.33378 11.4459 9.1016C10.8784 9.86942 10.4054 10.7012 10.027 11.597C9.14414 13.3886 8.7027 15.5641 8.7027 18.1235C10.2162 17.6756 11.6982 17.8675 13.1486 18.6994C15.8604 20.299 17.2162 22.3465 17.2162 24.8419C17.2162 27.2733 16.491 29.2569 15.0405 30.7925C13.5901 32.2642 11.5721 33 8.98649 33C6.4009 33 4.25676 32.0082 2.55405 30.0247C0.851351 27.9772 0 25.4818 0 22.5385Z"
        fill="#001A4D"
      />
    </svg>
  );
}

/* ── One rectangular card on the cylinder ── */
function CylinderCard({
  item,
  index,
  count,
  pos,
  onSelect,
}: {
  item: IndicornTestimonialItem;
  index: number;
  count: number;
  pos: MotionValue<number>;
  onSelect: (index: number) => void;
}) {
  const transform = useTransform(pos, (p) => cardTransform(p, index, count));
  const opacity = useTransform(pos, (p) => cardOpacity(p, index, count));
  const zIndex = useTransform(pos, (p) => cardZ(p, index, count));
  /* Only the side cards are click targets — clicking the front one would be a
     no-op, and a pointer cursor there would imply something happens. */
  const cursor = useTransform(pos, (p) =>
    Math.abs(signedOffset(p, index, count)) < 0.5 ? "default" : "pointer"
  );

  return (
    <motion.div
      onClick={() => onSelect(index)}
      /* Same photo-left / quote-right orientation at every size. On a phone
         the card is wide and SHORT — 200px inside the 240px stage — because a
         taller card overflows the stage and hides the pagination dots that
         sit below it. The `!` overrides beat the inline sizes. */
      className="pointer-events-auto absolute left-1/2 top-1/2 flex overflow-hidden rounded-[2px] bg-[#FBF7F0] shadow-[0_24px_60px_rgba(0,0,0,0.14)] max-md:!w-[min(88vw,340px)] max-md:!h-[200px]"
      style={{
        cursor,
        // Rectangular: wide + short.
        width: "clamp(320px, 50vw, 720px)",
        height: "clamp(220px, 25vw, 360px)",
        transform,
        opacity,
        zIndex,
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
        willChange: "transform, opacity",
      }}
    >
      {/* Founder photo (left) */}
      {/* Photo keeps the left column, and takes a WIDER share on mobile so the
          founder is actually readable at phone size. */}
      <div
        className="relative h-full shrink-0 max-md:!w-[42%]"
        style={{ width: "40%" }}
      >
        <img
          src={item.image}
          alt={item.name || "Founder"}
          className="h-full w-full object-cover object-top"
        />
      </div>

      {/* Quote + attribution (right) */}
      <div
        className="flex min-w-0 flex-1 flex-col justify-center max-md:!px-[16px] max-md:!py-[14px]"
        style={{ padding: "clamp(18px, min(2.1vw, 3vh), 40px)" }}
      >
        <QuoteMark />
        <p
          className="m-0 font-['Poppins',_sans-serif] font-medium text-[#1a1a1a] max-md:!text-[11px] max-md:!leading-[150%] max-md:!mt-[6px]"
          style={{
            ...LABEL_STYLE,
            lineHeight: "158%",
            marginTop: "clamp(8px, 1vw, 14px)",
          }}
        >
          {item.quote}
        </p>
        {item.name && (
          <div className="max-md:!mt-[10px]" style={{ marginTop: "clamp(14px, min(1.6vw, 2.4vh), 30px)" }}>
            <p className={`m-0 text-black max-md:!text-[13px] ${BODY_BOLD_CLASS}`} style={HERO_BODY_STYLE}>
              {item.name}
            </p>
            {item.role && (
              <p
                className="m-0 mt-[2px] font-['Poppins',_sans-serif] font-normal italic text-[#7a7a7a] max-md:!text-[10.5px]"
                style={LABEL_STYLE}
              >
                {item.role}
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function IndicornTestimonialsClient({
  data,
}: {
  data?: IndicornTestimonialsData | null;
}) {
  const headingTop = data?.headingTop || FALLBACK_HEADING_TOP;
  const headingBottom = data?.headingBottom || FALLBACK_HEADING_BOTTOM;
  const description = data?.description || FALLBACK_DESCRIPTION;
  const testimonials =
    data?.testimonials && data.testimonials.length > 0
      ? data.testimonials
      : FALLBACK_TESTIMONIALS;

  const N = testimonials.length;
  const carouselRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  const pos = useMotionValue(0);
  const target = useRef(0);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);

  // Active-dot bookkeeping (cheap; only flips on integer changes).
  useMotionValueEvent(pos, "change", (p) => {
    const a = ((Math.round(p) % N) + N) % N;
    setActive((prev) => (prev === a ? prev : a));
  });

  // Is the carousel roughly centred in the viewport?
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      // A band across the middle of the viewport → fires when centred.
      { root: null, rootMargin: "-38% 0px -38% 0px", threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Bumped on every manual selection so the auto-advance interval restarts —
     otherwise a click could be followed a moment later by an unwanted spin. */
  const [spinNonce, setSpinNonce] = useState(0);

  /* Click a side card to bring it to the front. `target` is a continuous,
     unwrapped position, so we pick the representative of `index` NEAREST the
     current target — that makes the cylinder always take the short way round
     (a click on the left card spins left, not three-quarters of the way
     right). */
  const goTo = (index: number) => {
    const p = target.current;
    let d = (((index - p) % N) + N) % N;
    if (d > N / 2) d -= N;
    if (Math.abs(d) < 0.001) return; // already at the front
    target.current = p + d;
    animate(pos, target.current, { duration: SPIN_MS, ease: EASE });
    setSpinNonce((n) => n + 1);
  };

  // Auto-advance every 5s while the carousel is in view — smooth spin to next.
  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => {
      target.current += 1;
      animate(pos, target.current, { duration: SPIN_MS, ease: EASE });
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [inView, pos, spinNonce]);

  // ── Gentle speed-bump ──
  // The first time the carousel centres in the viewport, briefly hold the page
  // so it doesn't rocket straight past to the footer. After a short arm delay
  // (to ignore the momentum that brought us here) the NEXT scroll releases it —
  // "stop for one scroll". A safety timeout guarantees it can never get stuck.
  const bumpedRef = useRef(false);
  useEffect(() => {
    if (!inView || bumpedRef.current) return;

    lenis?.stop();

    let armed = false;
    let armTimer: ReturnType<typeof setTimeout>;
    let safety: ReturnType<typeof setTimeout>;

    const block = (e: Event) => e.preventDefault();
    const blockKeys = (e: KeyboardEvent) => {
      if ([" ", "PageUp", "PageDown", "End", "Home", "ArrowUp", "ArrowDown"].includes(e.key))
        e.preventDefault();
    };
    const release = () => {
      if (bumpedRef.current) return;
      bumpedRef.current = true;
      lenis?.start();
      window.removeEventListener("wheel", block);
      window.removeEventListener("touchmove", block);
      window.removeEventListener("keydown", blockKeys);
      window.removeEventListener("wheel", onIntent);
      window.removeEventListener("touchstart", onIntent);
      window.removeEventListener("keydown", onIntent);
      clearTimeout(armTimer);
      clearTimeout(safety);
    };
    const onIntent = () => {
      if (armed) release();
    };

    window.addEventListener("wheel", block, { passive: false });
    window.addEventListener("touchmove", block, { passive: false });
    window.addEventListener("keydown", blockKeys);

    armTimer = setTimeout(() => {
      armed = true;
      window.addEventListener("wheel", onIntent, { passive: true });
      window.addEventListener("touchstart", onIntent, { passive: true });
      window.addEventListener("keydown", onIntent);
    }, 450);
    safety = setTimeout(release, 2500);

    return () => {
      bumpedRef.current = true;
      lenis?.start();
      window.removeEventListener("wheel", block);
      window.removeEventListener("touchmove", block);
      window.removeEventListener("keydown", blockKeys);
      window.removeEventListener("wheel", onIntent);
      window.removeEventListener("touchstart", onIntent);
      window.removeEventListener("keydown", onIntent);
      clearTimeout(armTimer);
      clearTimeout(safety);
    };
  }, [inView, lenis]);

  return (
    <section
      className="relative w-full overflow-hidden bg-white z-20 px-[var(--section-px-wide)] pb-[var(--section-py)] pt-[calc(var(--section-py)+40px)] max-md:!mt-0 max-md:!pt-[48px] max-md:!pb-[48px]"
      style={{
        borderTopLeftRadius: "min(4.44vw, 7.30vh)",
        borderTopRightRadius: "min(4.44vw, 7.30vh)",
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        marginTop: "-40px",
      }}
    >
      <div className="mx-auto flex max-w-[1440px] flex-col items-center">
        {/* Headings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="max-w-[800px] text-center max-md:!mb-[clamp(32px,6dvh,48px)]"
          style={{ marginBottom: "min(3.47vw, 5.37vh)" }}
        >
          <h2
   className={`m-0 text-black ${SECTION_HEADING_CLASS}`}
   style={{ ...SECTION_HEADING_STYLE, marginBottom: "clamp(12px,min(1.5vw,2vh),24px)" }}
   >
            {headingTop} <br className="hidden md:block" />
            {headingBottom}
          </h2>
          <p className={`font-normal m-0 text-[#1a1a1a] ${HERO_BODY_CLASS}`} style={HERO_BODY_STYLE}>
            {description}
          </p>
        </motion.div>

        {/* ── 3D CYLINDER CAROUSEL ── */}
        <div
          ref={carouselRef}
          className="relative w-full"
          style={{
            perspective: "1800px",
            height: "clamp(240px, 27vw, 400px)",
          }}
        >
          {/* pointer-events-none is load-bearing: this wrapper is a preserve-3d
              plane at z=0 spanning the whole stage, while the side cards sit at
              translateZ(-210px) — i.e. BEHIND it. Without this the wrapper wins
              every hit-test and the side cards can never be clicked. Each card
              re-enables pointer events on itself. */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ transformStyle: "preserve-3d" }}
          >
            {testimonials.map((item, i) => (
              <CylinderCard key={`${item.name ?? "t"}-${i}`} item={item} index={i} count={N} pos={pos} onSelect={goTo} />
            ))}
          </div>
        </div>

        {/* ── Pagination dots ── */}
        <div
          className="flex items-center justify-center"
          style={{ gap: "10px", marginTop: "clamp(24px, min(2.6vw, 3.8vh), 44px)" }}
        >
          {testimonials.map((_, i) => (
            <span
              key={`dot-${i}`}
              aria-hidden
              className="rounded-full transition-all duration-300"
              style={{
                height: "8px",
                width: i === active ? "26px" : "8px",
                background: i === active ? "#001A4D" : "rgba(0,26,77,0.25)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
