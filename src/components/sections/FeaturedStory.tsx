/**
 * FeaturedStories — server wrapper.
 *
 * THE BAND HAD NO DATA AT ALL. `/foundersstory` rendered `<FeaturedStories />`
 * with no props, so the component fell back to a hard-coded story whose `href`
 * was "#" — there was nothing to choose in the CMS and the "Read Full Story"
 * button went nowhere. This supplies both.
 *
 * WHICH STORY LEADS is the one ticked "Featured story" in the Founders Story —
 * Featured & Grid document. If several are ticked the first wins.
 *
 * NOTHING TICKED MEANS NO BAND. Untick every story and this section disappears
 * from the page entirely — the heading, the browse link and the card all go.
 * It used to fall back to the first entry instead, which made the tick look
 * decorative: the band was there either way and the toggle only chose which
 * story sat in it, so there was no way to turn the band off from the Studio.
 * Now the toggle is the on/off switch, and an empty `stories[]` reads the same
 * way for the same reason — no featured story, no band.
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
    /* No fallback left to use — returning null here means the band is simply
       absent, same as when no story is ticked. Worth saying plainly in the log,
       because "the band vanished" and "Sanity was unreachable" now look
       identical on the page. */
    console.error("[FeaturedStory] Sanity fetch failed, band omitted:", err);
    return null;
  }
}

export default async function FeaturedStory() {
  const data = await getData();
  const stories = data?.stories ?? [];
  const lead = stories.find((s) => s.featured);

  /* No story ticked — render nothing. `/foundersstory` is a plain flex column,
     so the hero simply meets the grid with no gap left behind.

     NOTE this also covers a failed Sanity fetch, which is the one case where
     the old placeholder could still appear. That is the right trade: the
     placeholder was a hard-coded Mamaearth card, and showing a story the
     Studio does not list is worse than showing no band. */
  if (!lead) return null;

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
