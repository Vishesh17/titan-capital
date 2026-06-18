/**
 * BackedBefore — server wrapper.
 *
 * Fetches the singleton "backedBefore" document from Sanity and hands the
 * data to the existing presentational component. Falls back to hardcoded
 * defaults inside the client if the fetch fails or returns null.
 *
 * NOTE: page.tsx must import `BackedBefore` from this file (the server
 * wrapper), NOT from `./BackedBeforeClient`. Importing the Client component
 * directly skips the Sanity fetch and you'll get fallback content on every
 * page load.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { backedBeforeQuery } from "@/sanity/lib/queries";
import BackedBeforeClient, {
  type BackedBeforeData,
} from "./BackedBeforeClient";

async function getBackedBefore(): Promise<BackedBeforeData | null> {
  try {
    return await sanityFetch<BackedBeforeData | null>({
      query: backedBeforeQuery,
      revalidate: 60,
    });
  } catch (err) {
    console.error("[BackedBefore] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function BackedBefore() {
  const data = await getBackedBefore();
  return <BackedBeforeClient data={data} />;
}
