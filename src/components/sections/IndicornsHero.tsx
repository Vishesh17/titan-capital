/**
 * IndicornsHero — server wrapper.
 *
 * Fetches the singleton "indicornsHero" document from Sanity and hands the
 * data to the client component. Falls back to hardcoded defaults inside the
 * client if the fetch fails or returns null.
 *
 * NOTE: page.tsx must import this file (the server wrapper), NOT
 * `./IndicornsHeroClient`. Importing the Client directly skips the Sanity
 * fetch and you'll always get the fallback content.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { indicornsHeroQuery } from "@/sanity/lib/queries";
import IndicornsHeroClient, {
  type IndicornsHeroData,
} from "./IndicornsHeroClient";

async function getIndicornsHero(): Promise<IndicornsHeroData | null> {
  try {
    return await sanityFetch<IndicornsHeroData | null>({
      query: indicornsHeroQuery,
      revalidate: 60,
    });
  } catch (err) {
    console.error("[IndicornsHero] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function IndicornsHero() {
  const data = await getIndicornsHero();
  return <IndicornsHeroClient data={data} />;
}
