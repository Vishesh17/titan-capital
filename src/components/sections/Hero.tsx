/**
 * Hero — server wrapper.
 *
 * Why split into Hero.tsx (server) + HeroClient.tsx (client)?
 *   - Sanity fetches must happen on the server (they need the read token,
 *     and we want the data baked into the initial HTML for SEO/fast paint).
 *   - HeroClient owns useState/useEffect for the rotating founder cards,
 *     so it stays a Client Component.
 *
 * This file fetches the singleton Hero document from Sanity and passes it
 * to the existing presentational component. If the fetch fails or returns
 * null (e.g. Studio is empty), HeroClient uses its own hardcoded fallbacks
 * so the page never goes blank.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { heroQuery } from "@/sanity/lib/queries";
import HeroClient, { type HeroData } from "./HeroClient";
import BackedBefore from "./BackedBefore";

async function getHero(): Promise<HeroData | null> {
  try {
    return await sanityFetch<HeroData | null>({
      query: heroQuery,
      // ISR cache — edits in Studio go live within `revalidate` seconds.
      revalidate: 60,
    });
  } catch (err) {
    // Network blip, missing token, etc. Log and fall through to the
    // hardcoded defaults inside HeroClient.
    console.error("[Hero] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function Hero() {
  const data = await getHero();
  /* BACKED BEFORE IS RENDERED INSIDE THE HERO, not beside it on the page, so
     the two share one background with no seam between them. It is passed as a
     prop rather than imported by HeroClient because it is a server component
     with a Sanity fetch of its own, and a client component cannot import one
     — handing it down as a ReactNode keeps its fetch on the server. */
  return <HeroClient data={data} backedBefore={<BackedBefore />} />;
}
