/**
 * GetInvestmentFAQ — server wrapper.
 *
 * Fetches the singleton "getInvestmentFAQ" document from Sanity and hands
 * the data to the client component. Falls back to hardcoded defaults inside
 * the client if the fetch fails or returns null.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { getInvestmentFAQQuery } from "@/sanity/lib/queries";
import GetInvestmentFAQClient, {
  type GetInvestmentFAQData,
} from "./GetInvestmentFAQClient";

async function getGetInvestmentFAQ(): Promise<GetInvestmentFAQData | null> {
  try {
    return await sanityFetch<GetInvestmentFAQData | null>({
      query: getInvestmentFAQQuery,
      revalidate: 60,
    });
  } catch (err) {
    console.error("[GetInvestmentFAQ] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function GetInvestmentFAQ() {
  const data = await getGetInvestmentFAQ();
  return <GetInvestmentFAQClient data={data} />;
}
