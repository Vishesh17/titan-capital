/**
 * LegalContent — server wrapper.
 *
 * Fetches BOTH legal documents and hands them to the client. Both, on both
 * routes, because the two pages are one tabbed component: switching tabs is a
 * `router.replace`, not a navigation, so the other tab's copy has to already
 * be in hand or it would flash empty.
 *
 * NOTE: pages must import this file, not `./LegalContentClient` — importing
 * the client directly skips the fetch and renders a page with no policy on it.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { legalPagesQuery } from "@/sanity/lib/queries";
import LegalContentClient, {
  type LegalPagesData,
} from "./LegalContentClient";

async function getLegalPages(): Promise<LegalPagesData | null> {
  try {
    return await sanityFetch<LegalPagesData | null>({
      query: legalPagesQuery,
      revalidate: 60,
      tags: ["privacyPolicy", "grievanceRedressal"],
    });
  } catch (err) {
    console.error("[LegalContent] Sanity fetch failed:", err);
    return null;
  }
}

export default async function LegalContent({
  initialTab,
}: {
  initialTab: "privacy" | "grievance";
}) {
  const data = await getLegalPages();
  return <LegalContentClient initialTab={initialTab} data={data} />;
}
