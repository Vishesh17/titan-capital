import type { CSSProperties } from "react";

/**
 * GrainOverlay — a visible, tone-uniform film grain that works on ANY colour,
 * including the near-white beige (#FBF7F0) where blend modes normally fail.
 *
 * WHY IT LOOKED INVISIBLE BEFORE:
 *   1. `mix-blend-mode: overlay` on a ~97%-white beige has almost no tonal room
 *      — the grain got crushed to a ~3% delta.
 *   2. A raw feTurbulence tile averages ~73% luminance, so it reads as a flat
 *      light veil, not speckle.
 *
 * THE FIX (matches a real photographic film grain):
 *   - Generate feTurbulence noise, desaturate it, then CENTRE it to ~50% grey
 *     and boost its contrast with feComponentTransfer. Now it has punchy
 *     light-AND-dark speckle around mid-grey.
 *   - Composite it with `mix-blend-mode: NORMAL` at a low opacity. Normal blend
 *     adds the same ±speckle to every underlying tone, so the grain is visible
 *     on light beige, dark navy, and photos alike. (It nudges the base very
 *     slightly toward mid-grey — exactly what real grain does.)
 *
 * Layering:
 *   - Over an IMAGE card → drop it after the image; default zIndex (5) sits it
 *     on top of the photo.
 *   - Over a SECTION background → pass a low `zIndex` (e.g. 1) and make sure the
 *     section's content wrapper is `relative z-10`, so the grain textures the
 *     background but stays BEHIND the text.
 *
 * NEVER PUT THIS INSIDE A SCROLLING BOX. It is `absolute inset-0`, which sizes
 * to its containing block's PADDING BOX — one viewport of the scroller, not the
 * full scroll height — and then scrolls away with the content. Scroll to the
 * end of such a box and the last stretch has no grain on it, which against a
 * grained surface reads as a patch of a different colour even though the
 * background value is identical.
 *
 * It cost a real bug once: the WhatFoundersGet full-page card was the mobile
 * scroller AND carried the grain, so a long card ended in a 109px band of bare
 * #FBF7F0 (measured at 390x660). The fix was to move the scrolling onto an
 * inner element so this layer sits on a box that never scrolls — see the note
 * at its call site in WhatFoundersGetClient.
 *
 * So: put it on the STATIC box and let a child scroll, never the reverse. Every
 * other caller is a page section, which grows with its content and has no
 * scroller of its own, so `inset-0` covers it in full.
 *
 * TUNING:
 *   - `opacity`       → strength. 0.15 subtle, 0.22 clearly visible, 0.3 heavy.
 *   - `baseFrequency` → grain size. Higher = finer (0.7–0.9), lower = chunkier.
 *   - `scale`         → tile px size; smaller = denser.
 *   - `blend`         → keep "normal" for the tone-uniform look; "overlay" only
 *                       for mid-tone-only surfaces.
 */

function noiseDataUri(baseFrequency: number, numOctaves: number): string {
  // Raw fractalNoise averages ~0.73 luminance, so centre it back to ~0.5 and
  // stretch contrast: value = 1.5 * v - 0.6  →  mean ≈ 0.5, wide light/dark span.
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>` +
    `<filter id='n'>` +
    `<feTurbulence type='fractalNoise' baseFrequency='${baseFrequency}' numOctaves='${numOctaves}' stitchTiles='stitch'/>` +
    `<feColorMatrix type='saturate' values='0'/>` +
    `<feComponentTransfer>` +
    `<feFuncR type='linear' slope='1.5' intercept='-0.6'/>` +
    `<feFuncG type='linear' slope='1.5' intercept='-0.6'/>` +
    `<feFuncB type='linear' slope='1.5' intercept='-0.6'/>` +
    `</feComponentTransfer>` +
    `</filter>` +
    `<rect width='100%' height='100%' filter='url(#n)'/>` +
    `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export default function GrainOverlay({
  opacity = 0.22,
  blend = "normal",
  zIndex = 5,
  scale = 200,
  baseFrequency = 0.75,
  numOctaves = 2,
  className = "",
  style,
}: {
  opacity?: number;
  blend?: CSSProperties["mixBlendMode"];
  zIndex?: number;
  scale?: number;
  baseFrequency?: number;
  numOctaves?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        backgroundImage: noiseDataUri(baseFrequency, numOctaves),
        backgroundSize: `${scale}px ${scale}px`,
        backgroundRepeat: "repeat",
        mixBlendMode: blend,
        opacity,
        zIndex,
        ...style,
      }}
    />
  );
}
