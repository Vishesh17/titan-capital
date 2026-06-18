/**
 * ImpactAtGlance — server wrapper.
 *
 * Fetches the singleton "impactAtGlance" document from Sanity and hands
 * the data to the existing presentational component (ImpactAtGlanceClient).
 * Falls back to hardcoded defaults inside the client if the fetch fails
 * or returns null, so the page never goes blank.
 *
 * Same pattern as Hero — keeps interactive state (rotation, drag, hover)
 * in the client component while the data fetch happens on the server.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { impactAtGlanceQuery } from "@/sanity/lib/queries";
import ImpactAtGlanceClient, {
  type ImpactAtGlanceData,
} from "./ImpactAtGlanceClient";

async function getImpactAtGlance(): Promise<ImpactAtGlanceData | null> {
  try {
    return await sanityFetch<ImpactAtGlanceData | null>({
      query: impactAtGlanceQuery,
      revalidate: 60,
    });
  } catch (err) {
    console.error("[ImpactAtGlance] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function ImpactAtGlance() {
  const data = await getImpactAtGlance();
  return <ImpactAtGlanceClient data={data} />;
}
