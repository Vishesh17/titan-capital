"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";

/**
 * Site-wide smooth scroll via Lenis. Mounted once at the root so every
 * page inherits the same weighted feel — no per-page setup needed.
 *
 * `root` prop tells Lenis to hijack the document's own scroll instead of
 * creating its own scroll container. This preserves native `position:
 * sticky` inside sections and doesn't require any layout changes.
 *
 * `duration` = length of the ease when a wheel tick fires. 1.2s is the
 * madeinmay.studio-ish weight the design leans on — not too glassy, not
 * jittery either. Bump higher for more inertia, lower for tighter feel.
 */
export default function LenisProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ReactLenis
      root
      options={{
        duration: 1.2,
        smoothWheel: true,
        /* Cubic-bezier equivalent to the site's global EASE
           [0.22, 1, 0.36, 1] — snappy start, smooth deceleration. */
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
      }}
    >
      {children}
    </ReactLenis>
  );
}
