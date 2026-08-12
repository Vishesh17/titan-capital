"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { markAppMounted } from "@/lib/appNavState";

const RESTORE_SCROLL_FROM = ["/ourTeam/", "/founders/"];

function ScrollToTopOnNav({ children }: { children: ReactNode }) {
  const lenis = useLenis();
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (pathname === prevPathname.current) return;
    const from = prevPathname.current;
    prevPathname.current = pathname;
    if (window.location.hash) return;
    if (RESTORE_SCROLL_FROM.some((p) => from.startsWith(p))) return;
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