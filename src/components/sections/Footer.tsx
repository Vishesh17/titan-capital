/**
 * Footer — server wrapper.
 *
 * THE FOOTER WAS NEVER CONNECTED TO SANITY. The `footer` schema, the
 * `footer-singleton` document and `footerQuery` all existed, but nothing ever
 * imported the query: every page imported the client component directly, and
 * every string in it was typed into the JSX. Editing the document in the
 * Studio changed the document and nothing else.
 *
 * It went unnoticed because the hard-coded text and the Sanity text happened
 * to be the same, so the footer looked correct however you checked the page —
 * you could grep the rendered HTML for the address and find it.
 *
 * This is the split the rest of the codebase already uses — Hero/HeroClient,
 * BackedBefore/BackedBeforeClient. Pages keep importing `Footer` and need no
 * change of their own; the fetch happens here and the values are handed down.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { footerQuery } from "@/sanity/lib/queries";
import FooterClient, { type FooterData } from "./FooterClient";

async function getFooter(): Promise<FooterData | null> {
  try {
    return await sanityFetch<FooterData | null>({
      query: footerQuery,
      revalidate: 60,
      tags: ["footer"],
    });
  } catch (err) {
    /* Every field in FooterClient falls back to the text the footer shipped
       with, so a failed fetch renders it unchanged rather than empty. */
    console.error("[Footer] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function Footer() {
  return <FooterClient data={await getFooter()} />;
}
