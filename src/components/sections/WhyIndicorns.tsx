/**
 * WhyIndicorns — server wrapper.
 *
 * Fetches the singleton "whyIndicorns" document from Sanity and hands the
 * data to the client component. Falls back to hardcoded defaults inside the
 * client if the fetch fails or returns null.
 *
 * NOTE: page.tsx must import this file (the server wrapper), NOT
 * `./WhyIndicornsClient`. Importing the Client directly skips the Sanity
 * fetch and you'll always get the fallback content.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { whyIndicornsQuery } from "@/sanity/lib/queries";
import WhyIndicornsClient, {
  type WhyIndicornsData,
} from "./WhyIndicornsClient";

async function getWhyIndicorns(): Promise<WhyIndicornsData | null> {
  try {
    return await sanityFetch<WhyIndicornsData | null>({
      query: whyIndicornsQuery,
      revalidate: 60,
    });
  } catch (err) {
    console.error("[WhyIndicorns] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function WhyIndicorns() {
  const data = await getWhyIndicorns();
  return <WhyIndicornsClient data={data} />;
}
