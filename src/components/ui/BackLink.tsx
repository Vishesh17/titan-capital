"use client";

import { useRouter } from "next/navigation";

/**
 * A "Back" control that returns the user to exactly where they were.
 *
 * Uses browser history rather than a plain <Link>: a Link is a forward
 * navigation, so the browser has no scroll position to restore and you land at
 * the top of the list. history.back() replays the previous entry, and Next
 * restores its scroll offset.
 *
 * Falls back to `fallbackHref` when there's no history to go back to — someone
 * who opened the detail page directly, from a shared link or a search result.
 */
export default function BackLink({
  fallbackHref,
  className,
  style,
  ariaLabel,
  children,
}: {
  fallbackHref: string;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={className}
      style={style}
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
        } else {
          router.push(fallbackHref);
        }
      }}
    >
      {children}
    </button>
  );
}
