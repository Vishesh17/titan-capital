/**
 * IndicornCompanies — server wrapper.
 *
 * Fetches the singleton "indicornCompanies" document from Sanity and hands
 * the data to the client component. Falls back to hardcoded defaults inside
 * the client if the fetch fails or returns null.
 *
 * NOTE: page.tsx must import this file (the server wrapper), NOT
 * `./IndicornCompaniesClient`. Importing the Client directly skips the
 * Sanity fetch and you'll always get the fallback content.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { indicornCompaniesQuery } from "@/sanity/lib/queries";
import IndicornCompaniesClient, {
  type IndicornCompaniesData,
} from "./IndicornCompaniesClient";

async function getIndicornCompanies(): Promise<IndicornCompaniesData | null> {
  try {
    return await sanityFetch<IndicornCompaniesData | null>({
      query: indicornCompaniesQuery,
      revalidate: 60,
    });
  } catch (err) {
    console.error("[IndicornCompanies] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function IndicornCompanies() {
  const data = await getIndicornCompanies();
  return <IndicornCompaniesClient data={data} />;
}
