"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { markAppMounted } from "@/lib/appNavState";

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
/**
 * Next.js only restores scroll on browser back/forward, so a <Link> that lands
 * on a new route keeps the previous offset. Reset to the top on every route
 * change — unless the URL carries a hash, in which case the destination page
 * owns the scroll (it may need to wait for async content before measuring).
 */
function ScrollToTopOnNav({ children }: { children: ReactNode }) {
  const lenis = useLenis();
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (pathname === prevPathname.current) return;
    prevPathname.current = pathname;
    if (window.location.hash) return;
    lenis?.scrollTo(0, { immediate: true });
  }, [pathname, lenis]);

  return <>{children}</>;
}

export default function LenisProvider({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    markAppMounted();
  }, []);

  return (
    <ReactLenis
      root
      options={{
        duration: 1.2,
        smoothWheel: true,
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
      }}
    >
      <ScrollToTopOnNav>{children}</ScrollToTopOnNav>
    </ReactLenis>
  );
}
