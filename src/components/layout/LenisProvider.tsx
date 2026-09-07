"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { markAppMounted } from "@/lib/appNavState";

/**
 * A NEW page starts at the top; going BACK returns to where you were.
 *
 * It used to decide that from a list of paths — `["/ourteam/", "/founders/"]`,
 * the pages whose Back button was known to need it. That list is the wrong
 * shape for the question. It could not tell a back navigation from a forward
 * one, only where the reader happened to be standing, so:
 *
 *   - /portfolio/[slug] and /blogs/[slug] were missing from it, and their Back
 *     buttons were undone a frame later by the scrollTo(0) below — the reader
 *     landed at the top of the grid however far down they had been;
 *   - and a FORWARD link out of /ourteam or /founders wrongly kept its scroll,
 *     opening the next page part-way down.
 *
 * `popstate` answers the actual question. It fires only for a genuine history
 * traversal — the browser's own Back/Forward and `router.back()` alike — and
 * never for a forward push. It also lands BEFORE React re-renders with the new
 * pathname, so the flag it sets is always there to be read by the effect below.
 *
 * Nothing here restores the position itself: Next records the offset on the
 * history entry and puts it back. All this has to do is not fight it.
 */
function ScrollToTopOnNav({ children }: { children: ReactNode }) {
  const lenis = useLenis();
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  /* WHEN the last history traversal happened, not WHETHER one did.
   *
   * A boolean here is unsafe, and the failure is the bad kind — silent, and it
   * breaks the ordinary case. `popstate` also fires for traversals that do NOT
   * change the route: a hash link, a same-path entry. The effect below is keyed
   * on `pathname`, so it never runs for those, never clears the flag, and the
   * flag is then still set when the reader NEXT CLICKS A LINK — which would
   * open that page at the previous page's scroll offset instead of the top.
   *
   * A timestamp cannot get stuck. It is read once, by the route change the
   * traversal causes, and any traversal that changes nothing simply goes stale
   * on its own. */
  const poppedAt = useRef(-Infinity);

  useEffect(() => {
    const onPop = () => {
      poppedAt.current = performance.now();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (pathname === prevPathname.current) return;
    prevPathname.current = pathname;
    /* Generous enough to cover the router's own re-render after a Back, short
       enough that it has long expired by the time anyone reads the page and
       clicks something. */
    const fromTraversal = performance.now() - poppedAt.current < 1000;
    poppedAt.current = -Infinity; // consumed either way
    if (fromTraversal) return; // Next restores the offset; don't fight it
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
        duration: 1.5, // Increased from 1.2s for a more luxurious glide
        smoothWheel: true,
        wheelMultiplier: 0.9, // Adds a slight "weight" to the physical scroll wheel
        // Quartic easing (power of 4): softer start, longer buttery tail than cubic
        easing: (t: number) => 1 - Math.pow(1 - t, 4), 
      }}
    >
      <ScrollToTopOnNav>{children}</ScrollToTopOnNav>
    </ReactLenis>
  );
}