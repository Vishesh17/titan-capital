import Image from "next/image";
import type { CSSProperties } from "react";

/**
 * A photo in a fixed frame, with framing controls that actually work.
 *
 * WHY THIS EXISTS — the trap it replaces
 * ──────────────────────────────────────
 * The obvious way to frame a photo is `object-fit: cover` plus
 * `object-position: X% Y%`, and it is subtly broken for square source
 * images:
 *
 *   `object-position` can only move the image along an axis that has
 *   SLACK — i.e. an axis where the covered image is bigger than the box.
 *   A cover-fitted image overflows exactly ONE axis. On the other axis it
 *   fits precisely, so the percentage there is a no-op.
 *
 * Which axis is live depends on whether the box is taller or wider than the
 * source. If the box's aspect ratio changes with the viewport — which it
 * does the moment its width comes from a grid (vw) and its height from a
 * `min(vw, vh)` — then the LIVE AXIS FLIPS BETWEEN SCREENS. A vertical nudge
 * tuned on a 16:10 laptop silently does nothing on a 16:9 one, and vice
 * versa. Worse, when the box is near-square (the common case for a square
 * photo) the slack is a couple of pixels, so even the live axis barely
 * moves and the control feels broken everywhere.
 *
 * HOW THIS FIXES IT
 * ─────────────────
 * Framing is done with a transform instead:
 *
 *   - `scale` zooms. It is what normalises subjects photographed at
 *     different distances — no amount of panning can make a small head
 *     bigger, which is why offsets alone could never fix inconsistent
 *     source framing.
 *   - `offsetX` / `offsetY` pan, as a percentage of the FRAME, and they
 *     work on both axes on every screen because `scale` guarantees slack in
 *     both directions.
 *
 * `scale` therefore has a default above 1: at exactly 1 one axis has no
 * slack again and we are back to the original bug.
 *
 * Sign convention is unchanged from the `object-position` version it
 * replaces — negative reveals more of the LEFT / TOP — so values tuned
 * before keep pointing the same way. Their magnitudes do change, because a
 * percentage of the frame is not the same as a percentage of the overflow;
 * expect to re-tune once, on a control that now responds.
 *
 * NOTE — this only makes the frame consistent. If the frame's own aspect
 * ratio still changes between screens, the crop still changes shape. Give
 * the frame a fixed `aspect-ratio` (see OurTeamHeroClient's grid) so the
 * crop window is identical everywhere.
 */
const round = (n: number) => Math.round(n * 1000) / 1000;

export default function FramedPhoto({
  src,
  alt = "",
  offsetX,
  offsetY,
  scale,
  sizes,
  imgClassName = "",
  frameClassName = "",
  style,
}: {
  src: string;
  alt?: string;
  /** Pan, -50..50. Negative reveals more of the left. */
  offsetX?: number | null;
  /** Pan, -50..50. Negative reveals more of the top. */
  offsetY?: number | null;
  /** Zoom. 1 = none — but see the note above on why the default is >1. */
  scale?: number | null;
  sizes?: string;
  imgClassName?: string;
  frameClassName?: string;
  style?: CSSProperties;
}) {
  /* `??`, not default parameters. Sanity returns NULL for a field an editor
     never filled in, and a default parameter only fires on `undefined` — so
     a null scale sailed through and produced `scale(null)`, which is invalid
     and made the browser drop the whole transform silently. */
  const z = scale ?? 1.1;
  const ox = offsetX ?? 0;
  const oy = offsetY ?? 0;

  /* Offsets are a fraction of the SLACK the zoom creates, not a raw
     percentage of the frame. Two reasons:

       - it keeps the old `object-position` meaning, where ±50 was "as far as
         this can go". A raw -50% translate would have thrown the photo half
         a frame off-centre and left an empty edge;
       - it can never expose a gap. The pan is bounded by the overflow the
         zoom guarantees, so the frame is always covered.

     ±50 lands exactly on the edge of that slack, which works out to a pan of
     (z - 1) percent of the frame per unit of offset. At z = 1 there is no
     slack and no pan, which is correct rather than broken. */
  const pan = z - 1;

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-[#f0f0f0] ${frameClassName}`}
      style={style}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={`object-cover ${imgClassName}`}
        style={{
          /* translate BEFORE scale in the list means the translation is
             applied last and is NOT multiplied by the zoom. Percentages
             resolve against the frame, so a given offset moves the same
             fraction of the card on every screen — which is the whole point:
             the framing an editor sets is what every visitor sees. */
          // rounded: the raw product prints as 5.000000000000004% in the DOM
          transform: `translate(${round(-ox * pan)}%, ${round(-oy * pan)}%) scale(${z})`,
          transformOrigin: "center",
        }}
      />
    </div>
  );
}
