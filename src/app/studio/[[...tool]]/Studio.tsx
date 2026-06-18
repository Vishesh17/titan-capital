"use client";

/**
 * Client wrapper around NextStudio.
 *
 * Sanity Studio relies heavily on React Context, which Next.js 16 only
 * allows inside Client Components. Keeping the "use client" directive on
 * a thin wrapper (instead of page.tsx itself) lets page.tsx stay a Server
 * Component — which is required so we can still export `metadata`,
 * `viewport`, and `dynamic` from it.
 */
import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

export default function Studio() {
  return <NextStudio config={config} />;
}
