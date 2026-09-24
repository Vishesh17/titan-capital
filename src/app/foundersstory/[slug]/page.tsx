import Link from "next/link";

import Footer from "@/components/sections/Footer";
import FoundersStoryCTA from "@/components/sections/FoundersStoryCTA";
import {
  FounderStoryHeader,
  type FounderStoryPageData,
} from "@/components/sections/FounderStorySections";
import StoryBlocks from "@/components/sections/FounderStoryBlocks";
import FounderQuoteCard from "@/components/sections/FounderQuoteCard";
import {
  FALLBACK_SLIDES,
  type FounderStory,
  type ImpactAtGlanceData,
} from "@/components/sections/ImpactAtGlanceClient";
import { sanityFetch } from "@/sanity/lib/client";
import {
  founderStoryPageBySlugQuery,
  founderStoryPageSlugsQuery,
  foundersStoryListingQuery,
} from "@/sanity/lib/queries";
import { buildMetadata } from "@/sanity/lib/seo";
import { storySlug, type FounderStoryCard } from "@/lib/founderStory";

/**
 * /foundersstory/[slug] — one page per company, entirely Sanity-driven.
 *
 * A FIXED HEADER and then a composed body. Tags, headline, founders and hero
 * image always open the story; everything after them is an ordered list of
 * blocks the editor arranged, rendered in that order by FounderStoryBlocks.
 *
 * If the slug matches no document the page 404s rather than silently serving
 * another company's story, which is what the previous hardcoded version did.
 */

export const revalidate = 60;

async function getStory(slug: string): Promise<FounderStoryPageData | null> {
  try {
    return await sanityFetch<FounderStoryPageData | null>({
      query: founderStoryPageBySlugQuery,
      params: { slug },
      revalidate: 60,
    });
  } catch (err) {
    console.error(`[founderStory] fetch failed for "${slug}":`, err);
    return null;
  }
}

/**
 * The cards in the Explore band.
 *
 * `picks` are the slugs the editor chose on the band itself (see the "Which
 * three stories to show" field on the Explore block). They are honoured IN THE
 * ORDER GIVEN, so the band reads the way it was arranged rather than the way
 * the listing happens to be sorted.
 *
 * With nothing picked it behaves exactly as it always did — the three most
 * recent stories, minus the one being read — so existing stories keep working
 * untouched.
 */
async function getExploreStories(
  exclude?: string,
  picks?: string[]
): Promise<FounderStoryCard[]> {
  let slides: FounderStoryCard[] = FALLBACK_SLIDES;
  try {
    /* The SAME entries the listing renders, not the home page's separate
       story list — so "Explore" shows real stories that actually have pages. */
    const data = await sanityFetch<{ stories?: FounderStoryCard[] } | null>({
      query: foundersStoryListingQuery,
      revalidate: 60,
    });
    if (data?.stories?.length) slides = data.stories;
  } catch (err) {
    console.error("[founderStory] explore fetch failed, using fallback:", err);
  }
  /* Hand-picked wins. Matched on the entry's own slug, and any pick that no
     longer resolves is skipped rather than leaving a hole — a story can be
     renamed or unpublished long after another one points at it. */
  const chosen = (picks ?? [])
    .map((p) => p.trim().replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .map((p) => slides.find((s) => storySlug(s) === p || s.slug === p))
    .filter((s): s is FounderStoryCard => Boolean(s));
  if (chosen.length) return chosen.slice(0, 3);

  // Otherwise: the most recent three, never including the one being read.
  const key = (exclude || "").toLowerCase();
  const rest = key
    ? slides.filter((s) => !`${s.role} ${s.name}`.toLowerCase().includes(key))
    : slides;
  return (rest.length >= 3 ? rest : slides).slice(0, 3);
}

export async function generateStaticParams() {
  try {
    const slugs = await sanityFetch<string[] | null>({
      query: founderStoryPageSlugsQuery,
      revalidate: 60,
    });
    return (slugs ?? []).map((slug) => ({ slug }));
  } catch {
    /* An empty list is safe: routes still render on demand. */
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const base = await buildMetadata("foundersstory");
  const story = await getStory(slug);
  if (!story) return base;
  return {
    ...base,
    title: story.headline || `The Story Of ${story.company}`,
    description: story.headline || base.description,
  };
}

export default async function FoundersStoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await getStory(slug);

  if (!story) {
    return (
      <main className="flex min-h-screen w-full flex-col bg-white">
        <section
          className="flex w-full flex-1 flex-col items-center justify-center text-center"
          style={{
            paddingTop: "calc(var(--nav-height) + var(--section-py))",
            paddingBottom: "var(--section-py)",
            paddingLeft: "var(--section-px-wide)",
            paddingRight: "var(--section-px-wide)",
            minHeight: "60svh",
          }}
        >
          <h1
            className="m-0 font-['Poppins',_sans-serif] font-semibold text-[#0E0E0E]"
            style={{ fontSize: "clamp(24px, 3vw, 40px)", lineHeight: "140%" }}
          >
            This story isn&apos;t published yet.
          </h1>
          <Link
            href="/foundersstory"
            className="mt-[24px] font-['Poppins',_sans-serif] font-medium text-[#001A4D] underline underline-offset-4"
          >
            Back to founder stories
          </Link>
        </section>
        <Footer />
      </main>
    );
  }

  /* The band carries its own selection, so read it off the block the editor
     placed rather than adding a second field somewhere else in the document. */
  const exploreBlock = (story.blocks ?? []).find(
    (b: { _type?: string }) => b._type === "storyExplore"
  ) as { storySlugs?: string[] } | undefined;
  const exploreStories = await getExploreStories(
    story.company,
    exploreBlock?.storySlugs
  );

  return (
    <main className="flex min-h-screen w-full flex-col bg-white">
      <FounderStoryHeader data={story} />
      {/* Everything below the header is whatever the editor composed, in the
          order they put it in. */}
      <StoryBlocks
        blocks={story.blocks}
        cards={exploreStories.slice(0, 3).map((s, i) => (
          <FounderQuoteCard
            key={`${s.name}-${i}`}
            story={s}
            href={`/foundersstory/${storySlug(s)}`}
          />
        ))}
      />

      <FoundersStoryCTA
        text="Every company above started with a single conversation. An idea, a problem, and a founder who was obsessed enough to not let it go. If you're building something real, we want to hear about it"
      />
      <Footer />
    </main>
  );
}
