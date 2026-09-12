"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLenis } from "lenis/react";
import { RevealLine } from "./BackedEarlyClient";
import RichText, { type RichTextValue } from "@/components/ui/RichText";
import {
  HERO_HEADING_DARK_CLASS,
  HERO_HEADING_DARK_STYLE,
  HERO_BODY_CLASS,
  HERO_BODY_STYLE,
} from "@/styles/heroTypography";

/* ─────────────────────────────────────────────────────────
   Types — shared with the server wrapper (OurStoryHero.tsx).
   ───────────────────────────────────────────────────────── */
export interface OurStoryHeroPhoto {
  url?: string;
  /** width / height, straight off the asset. 1 when Sanity can't report it. */
  aspect?: number;
}

export interface OurStoryHeroData {
  headingLineOne?: string;
  headingLineTwo?: string;
  description?: RichTextValue;
  photos?: OurStoryHeroPhoto[];
}

/**
 * THE DRIFTING PHOTO FIELD.
 *
 * Rebuilt from the reference implementation rather than by eye — its bundle
 * (`Particles-0BM77DBr.js`) was read and the constants below are its own, so
 * the motion matches rather than merely resembling it:
 *
 *   1. TILES DRIFT UPWARD, not sideways. `position` is a Y translation that
 *      grows negative, so the field rises from the bottom of the frame.
 *   2. THEY SIT AT REAL DEPTHS. Each tile takes a fixed `z` from Z_STEPS
 *      inside a `perspective: 800px` box, so the near ones are genuinely
 *      larger and the far ones genuinely smaller — parallax, not a fake.
 *   3. THE FAR ONES ARE PALER. A white sheet over each tile carries an
 *      opacity of `1 - tileOpacity`, and tileOpacity falls off with negative
 *      z. That is what makes depth read on a white ground.
 *   4. SCALE IS DRIVEN BY HEIGHT IN THE FRAME. A tile at the bottom is at
 *      SCALE_BOTTOM and shrinks to SCALE_TOP as it climbs, so it recedes as it
 *      rises — on top of whatever its z is already doing.
 *   5. IT WRAPS FOREVER. A tile that leaves the top has its `extra` shifted
 *      by a container height, which drops it back in at the bottom.
 *   6. SCROLLING PUSHES IT. Scroll velocity is added to the drift target and
 *      the sign of the scroll sets the drift direction, so the field speeds
 *      up, slows and reverses under the reader.
 *
 * Three deliberate departures from the reference:
 *
 *   - IT PICKS ITS POSITIONS DETERMINISTICALLY. The original calls
 *     Math.random() at module scope. Here that would run once on the server
 *     and again on the client, the two would disagree, and React would report
 *     a hydration mismatch — so a seeded PRNG stands in. It also means the
 *     field is laid out identically on every load.
 *   - SCROLL COMES FROM LENIS, which is what actually drives scrolling on
 *     this site; a native scroll listener would read a position Lenis is in
 *     the middle of animating.
 *   - IT IS SPARSER. The reference runs 44 tiles at 0.5-1.4 scale; this runs
 *     20 on a jittered grid at 1-1.65, because this hero has a heading to read
 *     through the field and the reference's does not.
 */

/** Straight from the reference bundle, except `speed` — see below. */
const CFG = {
  /* The reference's own value is 0.15. Eased down a little: this field sits
     behind a heading people are meant to read, where the reference's is the
     whole page. Every other constant is left at the reference's number. */
  speed: 0.115,
  ease: 0.1,
  scaleEase: 0.25,
  scrollMultiplier: 0.05,
};

/**
 * HOW A TILE'S SIZE CHANGES WITH ITS HEIGHT IN THE FRAME.
 *
 * BIG AT THE BOTTOM, SMALL AT THE TOP — the reference's direction, restored.
 * This file used to run it the other way (1x at the bottom growing to 1.65x at
 * the top), which is what made the field read as cluttered: tiles were at
 * their largest exactly where the heading is.
 *
 * Measured off the live reference, its tiles scale by position in the
 * container and nothing else — 0.50 near the top, 0.84 at 39% down, 1.14 at
 * 69%, 1.27 at 79% — a straight line, not a curve. So this is linear too.
 *
 * The consequence is the whole point: a tile RISING shrinks, and a tile
 * DESCENDING grows. Because scroll direction flips the drift (see the ticker),
 * scrolling down shrinks the field and scrolling back up grows it, with every
 * tile starting from the size its position dictates rather than being reset.
 *
 * The endpoints are ours, not the reference's 0.5-1.4: its smallest tiles are
 * half size, which is very sparse at our tile count.
 */
const SCALE_BOTTOM = 2;
const SCALE_TOP = 1;

/**
 * SCALE IS MEASURED ACROSS THE SCREEN, NOT ACROSS THE FIELD — and that is why
 * 1x → 2x did not read as 1x → 2x.
 *
 * The field container is deliberately taller than the hero and pulled upward
 * (`top: -25%`, `height: 150%`) so tiles enter and leave out of sight. The
 * scale used to be measured against that WHOLE container, so its endpoints
 * landed 25% of a screen above the top edge and 25% below the bottom — both
 * off screen. What a reader actually saw was the middle two thirds of the
 * ramp: with 1 and 2 configured, tiles ran about 1.17x at the top of the window
 * to 1.83x at the bottom. Just over half the intended difference, spent where
 * nobody could see the ends of it.
 *
 * These two numbers convert container position into SCREEN position, so a tile
 * is at SCALE_TOP exactly as it reaches the top of the window and SCALE_BOTTOM
 * at the bottom — the configured range, used in full, in view. Derived from the
 * container's own offset and height rather than typed, so changing either one
 * keeps the mapping correct.
 */
const FIELD_OFFSET = 0.25; // container starts this far above the hero
const FIELD_HEIGHT = 1.5; // ...and is this many hero-heights tall
const VIS_START = FIELD_OFFSET / FIELD_HEIGHT; // 0.1667 — top of the window
const VIS_SPAN = 1 / FIELD_HEIGHT; // 0.6667 — how much of the field is on screen
/** The depth ladder, in px of z. Cycled, so the field is layered evenly. */
const Z_STEPS = [-200, -150, -100, -50, 0, 50, 100, 150, 200];
/** Parallax multipliers, cycled — tiles at the same depth still drift apart. */
const SPEEDS = [0.8, 0.9, 1, 1.1, 1.2];

/**
 * HOW MANY TILES, AND WHERE THEY START.
 *
 * A JITTERED GRID, not free random placement. Picking both coordinates at
 * random is what produced the crowded patches: random points clump, so some
 * regions carried several overlapping tiles while others sat empty, and the
 * eye reads the clumps as clutter however few tiles there are in total.
 *
 * One tile per cell, jittered inside the middle 60% of its cell, gives a field
 * with no two tiles closer than roughly a cell apart while still looking
 * scattered rather than ruled. The grid dissolves within seconds anyway — each
 * tile carries its own speed from SPEEDS, so the rows shear apart as they
 * drift.
 */
const GRID_COLS = 4;
const GRID_ROWS = 5;
const COUNT = GRID_COLS * GRID_ROWS; // 20
const PERSPECTIVE = 800;

/**
 * THE FIELD RUNS OFF BOTH EDGES, as the reference's does — photographs half cut
 * by the left and right of the window rather than a band of tiles politely
 * inset from them.
 *
 * The grid used to span `0 → 95%`, and 95 rather than 100 specifically so the
 * rightmost tile could not overflow. With the jitter that put every tile
 * between about 5% and 90%: a clear margin down both sides, which is exactly
 * the look being corrected.
 *
 * `left` is the tile's LEFT edge, so bleeding off each side needs different
 * numbers at each end: negative x hangs a tile off the left, while hanging one
 * off the right needs x past `100% - tile width` (a tile is ~7% of a 1440px
 * frame). Spanning -10% to +104% puts the jittered tiles between roughly -4%
 * and 98% — straddling both edges.
 */
const X_START = -10;
const X_SPAN = 114;

/** Deterministic stand-in for the reference's Math.random. */
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * SOME TILES ARE BIGGER. `BOOST` is a plain multiplier on the tile's width —
 * and because the tile carries `aspectRatio`, the height follows on its own,
 * so the picture is zoomed and never reshaped or cropped.
 *
 * It is a WIDTH, not a transform `scale`. The drift measures each tile's real
 * height to know when it has left the frame and must wrap; a scale applied in
 * the transform is invisible to that measurement (the ticker clears transforms
 * before measuring), so a scaled-up tile would wrap on its unscaled height and
 * pop out early. As a width it is genuine layout, and the ResizeObserver picks
 * it up like any other size.
 *
 * SEPARATE PRNG, seeded differently. Drawing these from the layout's own
 * generator would consume its sequence and shuffle every x/y after the first
 * boost — rearranging the whole field just to change some sizes.
 */
const BOOST = 1.25;
const BOOST_SHARE = 0.35;

/**
 * A LITTLE MORE DENSITY, AND ONLY IN THE MIDDLE.
 *
 * Two extra tiles, 20 → 22, which is the 10% asked for. They are not scattered
 * as two more loose photographs: each is placed right beside an existing tile,
 * so it reads as a PAIR — the doubling-up the reference does, where two
 * pictures sit almost touching and the eye takes them as one cluster.
 *
 * ONLY TILES WELL INSIDE THE FRAME ARE ELIGIBLE. A companion is offset to the
 * right of its partner, so pairing an edge tile would push its twin off the
 * screen and cost a photograph rather than adding one. The left and right
 * margins keep their single photographs, which is what was asked for.
 *
 * A companion SHARES ITS PARTNER'S SPEED, so the two drift together and stay a
 * pair for the life of the page. It takes a different depth, so the pair reads
 * as one in front of the other rather than as a flat double.
 */
const PAIR_COUNT = 2;
const PAIR_DX = 6; // % across — close enough to touch at tile size
const PAIR_DY = 4; // % down — offset so they are not a ruled row
const PAIR_INNER = [14, 70]; // only partner tiles sitting this far inside

const PARTICLES = (() => {
  const rand = mulberry32(0x5eed);
  const boostRand = mulberry32(0xb005);
  const base = Array.from({ length: COUNT }, (_, i) => {
    const z = Z_STEPS[i % Z_STEPS.length];
    /* The reference's own falloff: past -100 it clamps, so the furthest tiles
       never fade below half. */
    const opacity = z < 0 ? Math.max(0.5, 1 + z / 250) : 1;
    /* The cell this tile owns, and a jittered spot inside it. Cells are walked
       column-first so consecutive tiles — which take consecutive z depths and
       speeds — land in different columns rather than stacking down one. */
    const col = i % GRID_COLS;
    const row = Math.floor(i / GRID_COLS);
    const cellW = X_SPAN / GRID_COLS;
    const cellH = 100 / GRID_ROWS;
    return {
      x: Math.round(X_START + (col + 0.2 + rand() * 0.6) * cellW),
      y: Math.round((row + 0.2 + rand() * 0.6) * cellH),
      speed: SPEEDS[i % SPEEDS.length],
      z,
      opacity,
      boost: boostRand() < BOOST_SHARE ? BOOST : 1,
    };
  });

  /* Its own PRNG, seeded apart, so choosing partners cannot disturb the
     sequence that placed the 20 above — the same reason BOOST has one. */
  const pairRand = mulberry32(0xfa17);
  const eligible = base.filter(
    (p) => p.x >= PAIR_INNER[0] && p.x <= PAIR_INNER[1]
  );
  const companions = Array.from({ length: PAIR_COUNT }, (_, k) => {
    const partner = eligible[Math.floor(pairRand() * eligible.length)];
    /* One step deeper than its partner, so the pair layers instead of sitting
       flat, and the veil follows from that depth like every other tile. */
    const z = Z_STEPS[(Z_STEPS.indexOf(partner.z) + 3 + k) % Z_STEPS.length];
    return {
      ...partner,
      x: partner.x + PAIR_DX,
      y: partner.y + PAIR_DY,
      z,
      opacity: z < 0 ? Math.max(0.5, 1 + z / 250) : 1,
      boost: 1,
    };
  });

  return [...base, ...companions];
})();

/** Copy used until the Sanity singleton is filled in. */
const FALLBACK_LINE_ONE = "Being Founder";
const FALLBACK_LINE_TWO = "Takes Guts";
const FALLBACK_DESCRIPTION =
  "Built by founders, for founders — the story behind every conviction, every cheque, and every late-night call.";

/** The built-in field, used until Sanity has photos of its own. These are
 *  square crops, hence aspect 1 — anything uploaded is shown at its own. */
const FALLBACK_PHOTOS: OurStoryHeroPhoto[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16,
].map((n) => ({ url: `/images/hero_founders_images/${n}.png`, aspect: 1 }));

/** 104px at the 1728 reference, down to 50px on a phone — the reference's own
 *  `w-[50px] md:w-[104px]`, expressed so it also responds to short screens.
 *
 *  THIS IS THE TILE'S WIDTH ONLY. Height comes from each photo's own aspect
 *  ratio, so a portrait shot is tall and a panorama is wide — nothing is
 *  cropped to a square. A tile's height is measured at runtime by the ticker
 *  (`getBoundingClientRect`), so mixed shapes wrap correctly without the
 *  drift maths needing to know anything about them. */
const TILE = "clamp(50px, min(6vw, 9vh), 104px)";
/** Guard rails so one extreme upload can't become a hairline or a skyscraper
 *  in the field. A 1:3 portrait and a 3:1 panorama both still read as photos. */
const ASPECT_MIN = 0.34;
const ASPECT_MAX = 3;

const lerp = (a: number, b: number, t: number) => (1 - t) * a + t * b;

/**
 * WHY THE TILES USED TO SIT GREY FOR SO LONG.
 *
 * They were a bare `<img src={photo.url}>`, which meant two things at once:
 * the Sanity URL was the UNTRANSFORMED original — `asset->url` with no `?w=`
 * — and a plain `<img>` is invisible to Next's image optimiser, so the local
 * fallbacks were not resized either. Thirty-two tiles were each pulling a
 * full-resolution photograph to fill a box 104px wide. The fallback set alone
 * is 4.1MB across fifteen PNGs, one of them a megabyte on its own.
 *
 * So every tile showed its `#D9D9D9` placeholder until a photo hundreds of
 * times larger than the space it occupies had arrived.
 *
 * `next/image` handles the local files, and this handles the Sanity ones —
 * the same pairing every other section here uses (see ImageDeck, FlipCard).
 * Handing the optimiser an already-small source also spares it fetching and
 * re-encoding a full-size original on a cold cache.
 */
function cdnImageSrc(url: string, width: number): string {
  if (!url) return url;
  if (!url.startsWith("https://cdn.sanity.io/")) return url;
  return `${url}?w=${width}&auto=format&q=85`;
}

/** The widest a tile is ever drawn: TILE's 104px ceiling times BOOST. Doubled
 *  for retina, then rounded up to the next size Next actually generates. */
const TILE_SOURCE_W = 320;

/**
 * WHICH PHOTO GOES ON WHICH TILE.
 *
 * There are 32 tiles and usually far fewer photographs, so pictures repeat —
 * that is unavoidable. What is avoidable is two copies of the same face
 * sitting side by side, which is what `photos[i % photos.length]` produced:
 * that walks the list in order with no idea where the tiles are, so whether a
 * repeat lands next to itself is pure luck of the seeded layout.
 *
 * This places them deliberately instead. Walking the tiles, each one takes the
 * photo that is (a) least used so far, so the set stays evenly spread, and
 * (b) among those, the one sitting FURTHEST HORIZONTALLY FROM ITS NEAREST
 * EXISTING COPY.
 *
 * "Nearest existing copy" — every placement, not just the most recent one —
 * is the part that actually works. Scoring against only the last placement
 * barely helped (minimum gap 1% -> 5% across 15 photos, 6 close pairs down to
 * 2), because a photo already on the field several times was being judged on
 * one of them and dropped straight next to another. Measuring against all of
 * them takes the same 15 photos to a 15% minimum gap and NO pair closer than
 * 12% of the field's width.
 *
 * Distance is capped at SPREAD_ENOUGH so the tie-break stops chasing ever
 * larger gaps once a pair is comfortably apart — past that the choice is made
 * on usage, which keeps the distribution even. 45 measures better than an
 * uncapped span at middling photo counts.
 *
 * WITH VERY FEW PHOTOS THE GEOMETRY WINS. Three photos over 32 tiles is
 * eleven copies each across the field; they cannot all be far apart, and no
 * assignment fixes that. More photos in Sanity is the only real answer, and
 * the fallback set of 15 is already comfortably past it.
 */
const SPREAD_ENOUGH = 45;

function assignPhotos(
  particles: { x: number }[],
  photoCount: number
): number[] {
  if (photoCount <= 0) return particles.map(() => 0);
  const uses = new Array(photoCount).fill(0);
  const placedX: number[][] = Array.from({ length: photoCount }, () => []);

  return particles.map((p) => {
    let best = 0;
    let bestScore = -Infinity;
    for (let j = 0; j < photoCount; j++) {
      let gap = SPREAD_ENOUGH; // unused photo — as good as far away
      for (const x of placedX[j]) gap = Math.min(gap, Math.abs(p.x - x));
      // Usage dominates; horizontal clearance breaks the tie.
      const score = -uses[j] * 1000 + gap;
      if (score > bestScore) {
        bestScore = score;
        best = j;
      }
    }
    uses[best] += 1;
    placedX[best].push(p.x);
    return best;
  });
}

const HERO_CSS = `
@keyframes ourstory-rise {
  0%   { opacity: 0; transform: translateY(40px); }
  100% { opacity: 1; transform: translateY(0); }
}
`;

/**
 * Gap between words on a heading line.
 *
 * IT HAS TO STAND IN FOR A REAL SPACE, in `em` so it tracks the font size.
 * Splitting the heading into one RevealLine per word throws the actual space
 * characters away — inside a RevealLine a space is rendered as a glyph
 * (`" "`), but between two of them there is nothing at all, and the gap is
 * the only thing holding the words apart.
 *
 * HeroClient's `min(0.8vw, 1.4vh)` is the wrong value to borrow here: there it
 * separates three whole elements on one line, while its own words live inside a
 * single RevealLine and keep their real spaces. Measured against this font, it
 * came to 0.093em against a real space of 0.17em — a bit over half — so the
 * words read as run together. 0.2em sits just wider than a true space, which
 * suits a display heading.
 */
const WORD_GAP = "0.2em";

function PhotoGalaxy({ photos }: { photos: OurStoryHeroPhoto[] }) {
  /* Depends only on how many photos there are — the tile layout is a module
     constant — so this is computed once per photo count, not per frame. */
  const assignment = useMemo(
    () => assignPhotos(PARTICLES, photos.length),
    [photos.length]
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);
  /* The white veils, driven per frame alongside the tiles — see the note where
     they are rendered. */
  const veilRefs = useRef<(HTMLDivElement | null)[]>([]);
  /* Scroll velocity is written by Lenis and read by the ticker. A ref rather
     than state: this changes many times a second and must not re-render. */
  const impulse = useRef({ target: 0, sign: 1 });

  useLenis(({ velocity }: { velocity: number }) => {
    impulse.current.target += velocity * CFG.scrollMultiplier;
    if (velocity !== 0) impulse.current.sign = Math.sign(velocity);
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    type Tile = {
      extra: number;
      height: number;
      top: number;
      position: number;
      currentScale: number;
    };
    const tiles: Tile[] = PARTICLES.map(() => ({
      extra: 0,
      height: 0,
      top: 0,
      position: 0,
      currentScale: 1,
    }));

    let current = 0;
    let last = 0;
    let containerHeight = 0;
    let containerOffsetHeight = 0;
    let raf = 0;
    let prev = performance.now();

    /* Measured with every transform cleared, so `top` is the tile's resting
       place in the container rather than wherever the drift had left it. */
    const measure = () => {
      const rect = container.getBoundingClientRect();
      tileRefs.current.forEach((el, n) => {
        if (!el) return;
        el.style.transform = "translate3d(0, 0px, 0)";
        const r = el.getBoundingClientRect();
        tiles[n].extra = 0;
        tiles[n].height = r.height;
        tiles[n].top = r.top - rect.top;
        tiles[n].position = 0;
        tiles[n].currentScale = 1;
      });
      containerHeight = container.clientHeight;
      containerOffsetHeight = containerHeight * 0.1;
      current = 0;
      last = 0;
      impulse.current.target = 0;
    };

    /* Off screen the frame is still requested but does no work — drifting a
       field nobody can see is pure battery. */
    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(container);

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      /* Milliseconds, and capped: a backgrounded tab resumes with a huge gap
         and would fling the whole field off screen in one frame. */
      const dt = Math.min(50, now - prev);
      prev = now;
      if (!visible || reduced) return;

      impulse.current.target += CFG.speed * dt * impulse.current.sign;
      current = lerp(current, impulse.current.target, CFG.ease);
      const direction = current < last ? "down" : "up";

      tileRefs.current.forEach((el, n) => {
        if (!el) return;
        const t = tiles[n];
        const p = PARTICLES[n];

        t.position = -current * p.speed - t.extra;

        /* WRAPPING. `extra` is a running offset that teleports a tile from one
           end of the container to the other. Note the reference does NOT
           recompute `position` after changing it — the shift lands on the next
           frame — and that is reproduced here rather than tidied, because
           recomputing shows the jump a frame early. */
        const bottom = t.position + t.top + t.height;
        if (direction === "up" && bottom < -containerOffsetHeight) {
          t.extra = t.extra - containerHeight - containerOffsetHeight;
        }
        /* THE SAME DISTANCE BACK. This used to shift by `containerHeight`
           alone while the upward wrap above shifted by
           `containerHeight + containerOffsetHeight` — so a tile that wrapped
           one way and then the other did not return to where it started, and
           the field's whole layout drifted with the reader's scroll history.
           Since size is a function of position, that is felt as the sizes
           differing between scrolling up and scrolling down. Equal shifts make
           the loop reversible. */
        if (direction === "down" && bottom > containerHeight + containerOffsetHeight) {
          t.extra = t.extra + containerHeight + containerOffsetHeight;
        }

        /* SIZE FROM HEIGHT IN THE FRAME, and nothing else — no notion of a
           journey, a start or an end. That is what makes the direction change
           work: `rise` is 0 at the bottom of the container and 1 at the top,
           so a tile drifting up shrinks and a tile drifting down grows, and
           reversing the scroll simply reverses which way each tile is already
           heading. Nothing is reset, so a tile that was large low in the frame
           stays large and begins shrinking from there.

           Linear, matching the reference — measured off it, its scale is a
           straight line against position. */
        const top = t.position + t.top;
        /* Container position → SCREEN position, so the ramp's ends land on the
           top and bottom of the window rather than off it. See VIS_START. */
        const l = Math.max(
          0,
          Math.min(1, (top / containerHeight - VIS_START) / VIS_SPAN)
        );
        const rise = 1 - l;
        const want = SCALE_BOTTOM + rise * (SCALE_TOP - SCALE_BOTTOM);
        t.currentScale = lerp(t.currentScale, want, CFG.scaleEase);

        el.style.transform = `translate3d(0, ${t.position}px, ${p.z}px) scale(${t.currentScale})`;

        /* The veil clears as the tile climbs: one that enters pale at the
           bottom is fully opaque by the time it reaches the top. Driven by the
           same `rise`, so it tracks position rather than a journey and reverses
           with the scroll like everything else. A tile with no paleness to
           start with (z >= 0) has a base of 0 and is unaffected. */
        const veil = veilRefs.current[n];
        if (veil) {
          veil.style.opacity = ((1 - p.opacity) * (1 - rise)).toFixed(3);
        }
      });

      last = current;
    };

    measure();
    raf = requestAnimationFrame(tick);
    const ro = new ResizeObserver(measure);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      /* Taller than the hero and pulled up, exactly as the reference does, so
         tiles enter and leave well outside the visible frame. */
      className="pointer-events-none absolute left-0 z-0 w-full"
      style={{ top: "-25%", height: "150%", perspective: `${PERSPECTIVE}px` }}
    >
      {PARTICLES.map((p, i) => {
        const photo = photos[assignment[i]];
        /* The tile is cut to the picture. `object-contain` rather than `cover`
           so nothing is trimmed even if the reported aspect and the file ever
           disagree — with the box already at the right shape there are no bars
           to show. */
        const aspect = Math.min(
          ASPECT_MAX,
          Math.max(ASPECT_MIN, Number(photo?.aspect) || 1)
        );
        return (
        <div
          key={i}
          ref={(el) => {
            tileRefs.current[i] = el;
          }}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.boost === 1 ? TILE : `calc(${TILE} * ${p.boost})`,
            aspectRatio: `${aspect}`,
            willChange: "transform",
          }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-[2px] bg-[#D9D9D9]">
            {photo?.url && (
              <Image
                src={cdnImageSrc(photo.url, TILE_SOURCE_W)}
                alt=""
                fill
                /* The tile's real drawn width, so the optimiser picks the
                   smallest size that still covers it on a retina screen
                   instead of the widest one it has. */
                sizes="130px"
                draggable={false}
                /* EAGER, but not `priority`. The field is the top of the page,
                   so lazy-loading only buys an IntersectionObserver round trip
                   before fetching something that is already on screen — but
                   32 preload hints would fight the heading and the fonts for
                   the connection. Eager without the hint is the middle. */
                loading="eager"
                className="select-none object-contain object-center"
              />
            )}
          </div>
          {/* THE PALING SHEET — a white veil over the photograph, and it now
              CLEARS AS THE TILE TRAVELS.

              It used to be static: a function of the tile's `z`, which never
              changes, so a deep tile stayed washed out for its whole life and
              simply looked like a faded photo. It is driven per frame by the
              ticker instead, from the same rise that scales the tile —
              so the ones that enter faintest are the ones that gain the most,
              and every tile is fully opaque by the time it leaves the top.

              The inline value is the tile's starting paleness, so the first
              painted frame is right before the ticker has run. */}
          <div
            ref={(el) => {
              veilRefs.current[i] = el;
            }}
            className="pointer-events-none absolute inset-0 bg-white"
            style={{ opacity: 1 - p.opacity }}
          />
        </div>
        );
      })}
    </div>
  );
}

export default function OurStoryHeroClient({
  data,
}: {
  data?: OurStoryHeroData | null;
}) {
  /* The drifting field comes from Sanity when it has been filled in, and from
     the built-in set otherwise, so the hero is never empty mid-migration. */
  const photos = data?.photos?.length
    ? data.photos.filter((p) => p?.url)
    : FALLBACK_PHOTOS;

  /* Sanity first, the constants below only as a fallback — so the hero still
     reads properly before the singleton is created, and follows the CMS the
     moment it is. */
  const line1 = data?.headingLineOne || FALLBACK_LINE_ONE;
  const line2 = data?.headingLineTwo ?? FALLBACK_LINE_TWO;
  const description = data?.description || FALLBACK_DESCRIPTION;

  /* The per-character reveal runs once the component is on the client. This
     hero sits at the very top of the page, so mount is the right trigger —
     there is no scrolling to it. */
  const [show, setShow] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, []);

  /* ── THE HERO FALLS AWAY AS IT IS COVERED ──
     Without this the hero simply sits there and the section below slides over
     it, which reads as a card being laid on top. Receding slightly while it is
     covered reads instead as the hero dropping back into depth and the next
     section arriving in front of it.

     THE REFERENCE DOES NOT DO THIS — measured, its hero carries no transform
     at all. It earns the same impression from its layer stack, where every
     panel pins in turn. This is the equivalent for a page whose next section
     is one long scrolling block.

     `["start start", "end start"]` makes progress 0 where the wrapper's top
     meets the viewport top and 1 where its bottom does — the wrapper is 150vh,
     so that is exactly the pinned run. The curtain itself only starts a third
     of the way through (at 50vh, when the section below first appears at the
     bottom of the screen), so nothing moves before then. */
  const pinRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: pinProgress } = useScroll({
    target: pinRef,
    offset: ["start start", "end start"],
  });
  const CURTAIN_START = 1 / 3;
  const heroScale = useTransform(pinProgress, [CURTAIN_START, 1], [1, 0.92]);
  const heroFade = useTransform(pinProgress, [CURTAIN_START, 1], [1, 0.72]);


  return (
    /* ══════════ THE PIN ══════════
       Three boxes, and each one is doing a separate job. This is the reference
       page's own structure, read off it rather than guessed:

         outer   relative, 150vh   the SCROLL DISTANCE the hero occupies in the
                                   document. The next section begins right after
                                   it, so this is what decides when the curtain
                                   starts to rise.
         inner   absolute, 300vh   the sticky element's CONTAINING BLOCK, and it
                                   deliberately runs past the outer box. Being
                                   absolute it adds nothing to the flow, so it
                                   lengthens the pin without lengthening the
                                   page.
         hero    sticky,   100vh   what you actually see.

       THE INNER BOX IS THE WHOLE TRICK. A sticky element is released once its
       containing block runs out — so pinned directly inside the 150vh outer
       box, the heading would come unstuck at 50vh, which is the exact moment
       the next section starts covering it, and it would slide up as the
       curtain rose. Given 300vh to stick within, it stays perfectly still
       while the section below climbs over it, which is the detail in question.

       Nothing paints it over: the next section simply comes later in the DOM
       and is positioned, so at equal stacking it wins. No z-index needed. */
    <div ref={pinRef} className="relative w-full shrink-0 h-[150vh] max-md:!h-[150dvh]">
      <div className="absolute inset-x-0 top-0 h-[300vh] max-md:!h-[300dvh]">
    <motion.section
      /* FULL SCREEN, the same way HeroClient is: `h-screen` with a `100dvh`
         override under `md`, because mobile browser chrome makes `vh` taller
         than the visible area and the hero would be cut off by the URL bar. */
      className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden bg-white max-md:!h-[100dvh]"
      style={{
        // White section starts at the very top so its background fills
        // behind the transparent navbar (nav strip matches the hero until
        // it turns blue on scroll). Content clears the nav via paddingTop.
        paddingTop: "var(--nav-height)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
        /* Scaling the SECTION, background and all. It is white on a white
           page, so the ground it uncovers at the edges is invisible — only
           the photographs and the heading are seen to fall back. */
        scale: heroScale,
        opacity: heroFade,
      }}
    >
      <style>{HERO_CSS}</style>

      <PhotoGalaxy photos={photos.length ? photos : FALLBACK_PHOTOS} />

      {/* ── HEADING + DESCRIPTION (centered, above the field) ──
          THE COLUMN IS FULL WIDTH, the description narrow inside it. At level 2
          the whole block fitted in 760px; at level 1 "BEING FOUNDER" alone
          needs about 1370px, so that cap broke each line into two and the
          heading set in four lines instead of two. Width belongs to the
          heading, measure belongs to the description — so the cap moved down
          onto the paragraph, which is the only part that wants it. */}
      <div className="relative z-10 flex w-full flex-col items-center text-center">
        {/* ── HEADING ──
            HeroClient's treatment, at HeroClient's size: level 1 exactly as the
            shared token defines it, black here rather than white because the
            level is the type scale and the colour belongs to the section.
            NOTHING RESIZES IT — no fitted or derived size of its own.

            THE REVEAL UNIT IS A WORD, not a whole line, and that is what lets
            it wrap. RevealLine sets `whitespace-nowrap` on whatever it is given
            (it must, or characters reflow mid-animation), so handing it a full
            line made that line unbreakable — at level 1 a long one ran off both
            edges and the section's `overflow-hidden` hid the ends. Per word,
            each word stays intact while the line breaks between words, so a
            heading that will not fit in two lines simply sets in three.

            ROW GAP is the line spacing: level 1's 86% line-height is tighter
            than the glyphs, so stacked lines touch at 0px. `0.12em` opens them
            and tracks the font size — the same fix BackedEarly's and
            FoundersStory's headings carry. WORD_GAP is HeroClient's own
            word spacing. */}
        <h1
          className={`m-0 flex w-full flex-col items-center text-center text-[#0E0E0E] ${HERO_HEADING_DARK_CLASS}`}
          style={{ ...HERO_HEADING_DARK_STYLE, rowGap: "0.12em" }}
        >
          {[line1, line2].filter(Boolean).map((line, li) => {
            /* Words keep revealing in reading order across both lines, so the
               cascade does not restart half way down the heading. */
            const before = li === 0 ? 0 : (line1 ?? "").trim().split(/\s+/).length;
            return (
              <span
                key={li}
                className="flex flex-wrap items-baseline justify-center"
                style={{ columnGap: WORD_GAP, rowGap: "0.12em" }}
              >
                {(line as string)
                  .trim()
                  .split(/\s+/)
                  .map((word, wi) => (
                    <RevealLine
                      key={`${li}-${wi}`}
                      show={show}
                      delay={(before + wi) * 0.09}
                    >
                      {word}
                    </RevealLine>
                  ))}
              </span>
            );
          })}
        </h1>

        {/* The wrapper carries the entrance and the measure; RichText renders
            the paragraph itself, so the same class and style land on it
            whether the field is still a plain string or has been converted to
            rich text. */}
        <div
          className="max-w-[760px]"
          style={{
            marginTop: "clamp(16px, min(2.5vw, 4vh), 36px)",
            opacity: 0,
            animation: "ourstory-rise 0.8s cubic-bezier(0.22,1,0.36,1) 0.46s forwards",
          }}
        >
          <RichText
            value={description}
            className={`font-normal text-[#1a1a1a] ${HERO_BODY_CLASS}`}
            style={HERO_BODY_STYLE}
          />
        </div>
      </div>
    </motion.section>
      </div>
    </div>
  );
}
