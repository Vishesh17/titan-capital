/**
 * FoundersStory — server wrapper for the grid on /foundersstory.
 *
 * ONE SOURCE. The cards come from `foundersStoryPage.stories[]` — the same
 * entries that own the article pages — so a card links to its own story by its
 * own slug and cannot point at a page that does not exist. This used to read
 * the home page's `impactAtGlance` singleton, and then a separate
 * `foundersStoryGrid` document; both are gone.
 *
 * The fallback is still the home page's FALLBACK_SLIDES: those are hard-coded
 * demo cards, not content, so sharing them costs nothing and keeps the grid
 * from rendering empty before the new document is filled in.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { foundersStoryListingQuery } from "@/sanity/lib/queries";
import { FALLBACK_SLIDES } from "./ImpactAtGlanceClient";
import FoundersStoryGrid from "./FoundersStoryGrid";
import type { FoundersStoryGridData } from "@/lib/founderStory";

async function getData(): Promise<FoundersStoryGridData | null> {
  try {
    return await sanityFetch<FoundersStoryGridData | null>({
      query: foundersStoryListingQuery,
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
    data?.stories && data.stories.length > 0 ? data.stories : FALLBACK_SLIDES;

  // No ctaLabel: the grid's control is now the shared "Load More" button, so
  // the Sanity field is no longer read here.
  return (
    <FoundersStoryGrid
      heading={data?.gridHeading || "Founder Stories"}
      slides={slides}
    />
  );
}
