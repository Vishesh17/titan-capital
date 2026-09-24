/**
 * FeaturedStories — server wrapper.
 *
 * THE BAND HAD NO DATA AT ALL. `/foundersstory` rendered `<FeaturedStories />`
 * with no props, so the component fell back to a hard-coded story whose `href`
 * was "#" — there was nothing to choose in the CMS and the "Read Full Story"
 * button went nowhere. This supplies both.
 *
 * WHICH STORY LEADS is the one ticked "Featured story" in the Founders Story —
 * Featured & Grid document. If none is ticked the first entry is used, so the
 * band is never empty; if several are, the first wins.
 *
 * The link is built by the SAME `storySlug` the grid cards use, so the band and
 * the card for one story can never point at different pages.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { foundersStoryListingQuery } from "@/sanity/lib/queries";
import FeaturedStories from "./FeaturedStories";
import { storySlug, type FoundersStoryGridData } from "@/lib/founderStory";

async function getData(): Promise<FoundersStoryGridData | null> {
  try {
    return await sanityFetch<FoundersStoryGridData | null>({
      query: foundersStoryListingQuery,
      revalidate: 60,
    });
  } catch (err) {
    console.error("[FeaturedStory] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function FeaturedStory() {
  const data = await getData();
  const stories = data?.stories ?? [];
  const lead = stories.find((s) => s.featured) ?? stories[0];

  /* No stories yet — hand the component nothing and it keeps its own
     placeholder, exactly as before. */
  if (!lead) return <FeaturedStories />;

  return (
    <FeaturedStories
      data={{
        heading: data?.heading,
        browseLabel: data?.browseLabel,
        browseHref: data?.browseHref || "/foundersstory",
        story: {
          image: lead.image,
          tags: lead.tags,
          name: lead.name,
          role: lead.role,
          /* The band's own quote when the story sets one; its card quote
             otherwise — see `featuredText` in the listing query. */
          quote: lead.featuredText || lead.text,
          href: `/foundersstory/${storySlug(lead)}`,
        },
      }}
    />
  );
}
