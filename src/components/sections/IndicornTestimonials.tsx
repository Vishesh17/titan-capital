/**
 * IndicornTestimonials — server wrapper.
 *
 * Fetches the singleton "indicornTestimonials" document from Sanity and hands
 * the data to the client component. Falls back to hardcoded defaults inside
 * the client if the fetch fails or returns null.
 *
 * NOTE: page.tsx must import this file (the server wrapper), NOT
 * `./IndicornTestimonialsClient`. Importing the Client directly skips the
 * Sanity fetch and you'll always get the fallback content.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { indicornTestimonialsQuery } from "@/sanity/lib/queries";
import IndicornTestimonialsClient, {
  type IndicornTestimonialsData,
} from "./IndicornTestimonialsClient";

async function getIndicornTestimonials(): Promise<IndicornTestimonialsData | null> {
  try {
    return await sanityFetch<IndicornTestimonialsData | null>({
      query: indicornTestimonialsQuery,
      revalidate: 60,
    });
  } catch (err) {
    console.error("[IndicornTestimonials] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function IndicornTestimonials() {
  const data = await getIndicornTestimonials();
  return <IndicornTestimonialsClient data={data} />;
}
