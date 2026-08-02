/**
 * FoundersStory — server wrapper.
 *
 * Reuses the same "impactAtGlance" Sanity singleton as Impact At A Glance
 * (founder stories + stories heading + CTA label), then renders the 4-row
 * FoundersStoryGrid. Falls back to the shared FALLBACK_SLIDES if the fetch
 * returns nothing, so the grid is never empty.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { impactAtGlanceQuery } from "@/sanity/lib/queries";
import {
  FALLBACK_SLIDES,
  type ImpactAtGlanceData,
} from "./ImpactAtGlanceClient";
import FoundersStoryGrid from "./FoundersStoryGrid";

async function getData(): Promise<ImpactAtGlanceData | null> {
  try {
    return await sanityFetch<ImpactAtGlanceData | null>({
      query: impactAtGlanceQuery,
      revalidate: 60,
    });
  } catch (err) {
    console.error("[FoundersStory] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function FoundersStory() {
  const data = await getData();

  const slides =
    data?.founderStories && data.founderStories.length > 0
      ? data.founderStories
      : FALLBACK_SLIDES;

  return (
    <FoundersStoryGrid
      headingFirst={data?.storiesHeadingFirst || "Their Stories,"}
      headingSecond={data?.storiesHeadingSecond || "Our Credentials"}
      ctaLabel={data?.ctaLabel || "See More"}
      slides={slides}
    />
  );
}
