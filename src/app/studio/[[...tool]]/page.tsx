/**
 * Sanity Studio mount point — visit /studio in the browser to edit content.
 *
 * Page stays a Server Component so we can export metadata/viewport/dynamic.
 * The actual <NextStudio> render lives in `./Studio.tsx`, which is marked
 * "use client" — required because Sanity Studio uses React Context, which
 * Next.js 16 forbids inside Server Components.
 */
import Studio from "./Studio";

export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  return <Studio />;
}
