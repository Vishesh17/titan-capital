import type { CSSProperties } from "react";

/**
 * Framing for a team member's portrait inside the blob cutout.
 *
 * Lives here rather than in OurTeamClient because that file is `"use client"`,
 * and the /ourTeam/[slug] page is a server component — a server component can
 * render a client component but cannot call a function exported from one. This
 * module has no "use client" pragma and no React runtime, so both sides can
 * import it.
 *
 * Scale is anchored bottom-centre, keeping the subject planted on the blob's
 * base rather than drifting as it grows. The offsets sit first in the transform
 * list — which CSS applies right-to-left, so they run AFTER the scale, in
 * unscaled units. That keeps zoom and position independent: retune one and the
 * other stays put.
 */
export interface BlobPhotoFraming {
  imageScale?: number;
  imageOffsetX?: number;
  imageOffsetY?: number;
}

export function blobPhotoStyle(member: BlobPhotoFraming): CSSProperties {
  return {
    transform: `translate(${member.imageOffsetX ?? 0}%, ${member.imageOffsetY ?? 0}%) scale(${member.imageScale ?? 1})`,
    transformOrigin: "bottom center",
  };
}

/**
 * Aspect ratio of the blob frame, shared by the team grid and the member
 * detail page.
 *
 * It MUST be identical in both. The photo is positioned as a percentage of
 * this box (bottom-left, 75% x 85%), so a different ratio silently reframes
 * every portrait — a face tuned in the grid would sit wrong on the detail
 * page. Taken from blob-blue.png's intrinsic 440x436.
 */
export const BLOB_ASPECT = "440 / 436";
