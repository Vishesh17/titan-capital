import { sanityFetch } from "@/sanity/lib/client";
import { backedEarlyQuery } from "@/sanity/lib/queries";
import BackedEarlyClient, {
  type BackedEarlyData,
} from "./BackedEarlyClient";

/**
 * Portfolio page — "Backed Early. Built To Last" hero.
 *
 * Server wrapper: fetches the singleton and hands it to the client component,
 * which falls back to its hardcoded list when Sanity is empty.
 */
export default async function BackedEarly() {
  let data: BackedEarlyData | null = null;
  try {
    data = await sanityFetch<BackedEarlyData | null>({
      query: backedEarlyQuery,
      tags: ["backedEarly"],
    });
  } catch (err) {
    console.error("[BackedEarly] Sanity fetch failed:", err);
  }

  return <BackedEarlyClient data={data} />;
}
