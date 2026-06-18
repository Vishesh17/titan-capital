/**
 * IndicornSpotlight — server wrapper.
 *
 * Fetches the singleton "indicornSpotlight" document from Sanity and hands
 * the data to the existing presentational component. Falls back to hardcoded
 * defaults inside the client if the fetch fails or returns null.
 *
 * Same pattern as Hero / ImpactAtGlance — interactive state (the rotating
 * logo carousel) lives in the client component; the data fetch happens here
 * on the server.
 *
 * NOTE: page.tsx must import `IndicornsSpotlight` from this file (the
 * server wrapper), NOT from `./IndicornSpotlightClient`. Importing the
 * Client component directly skips the Sanity fetch and you'll get fallback
 * content on every page load.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { indicornSpotlightQuery } from "@/sanity/lib/queries";
import IndicornSpotlightClient, {
  type IndicornSpotlightData,
} from "./IndicornSpotlightClient";

async function getIndicornSpotlight(): Promise<IndicornSpotlightData | null> {
  try {
    return await sanityFetch<IndicornSpotlightData | null>({
      query: indicornSpotlightQuery,
      revalidate: 60,
    });
  } catch (err) {
    console.error("[IndicornSpotlight] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function IndicornsSpotlight() {
  const data = await getIndicornSpotlight();
  return <IndicornSpotlightClient data={data} />;
}
