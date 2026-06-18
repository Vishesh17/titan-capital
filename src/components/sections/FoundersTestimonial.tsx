/**
 * FoundersTestimonial — server wrapper.
 *
 * Fetches the singleton "foundersTestimonial" document from Sanity and hands
 * the data to the existing presentational component. Falls back to hardcoded
 * defaults inside the client if the fetch fails or returns null.
 *
 * NOTE: page.tsx must import this file (the server wrapper), NOT
 * `./FoundersTestimonialClient`. Importing the Client directly skips the
 * Sanity fetch and you'll always get the fallback content.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { foundersTestimonialQuery } from "@/sanity/lib/queries";
import FoundersTestimonialClient, {
  type FoundersTestimonialData,
} from "./FoundersTestimonialClient";

async function getFoundersTestimonial(): Promise<FoundersTestimonialData | null> {
  try {
    return await sanityFetch<FoundersTestimonialData | null>({
      query: foundersTestimonialQuery,
      revalidate: 60,
    });
  } catch (err) {
    console.error("[FoundersTestimonial] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function FounderTestimonial() {
  const data = await getFoundersTestimonial();
  return <FoundersTestimonialClient data={data} />;
}
