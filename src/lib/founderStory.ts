import type { FounderStory } from "@/components/sections/ImpactAtGlanceClient";

/**
 * Shared shape and slug rule for the founders-story cards.
 *
 * THIS IS A PLAIN MODULE, NOT A CLIENT ONE, and that is the point. `storySlug`
 * used to live in FoundersStoryGrid, which is `"use client"` — importing it
 * into a server component hands back a client REFERENCE rather than the
 * function, so calling it there throws and the page 500s. The featured band is
 * a server component and needs the same rule as the grid, so the rule lives
 * somewhere both can genuinely call it.
 */
export interface FounderStoryCard extends FounderStory {
  /** Which internal page this card opens. Optional — see storySlug. */
  storySlug?: string;
  /** Marks the story that fills the band at the top of /foundersstory. */
  featured?: boolean;
  /** The band's own pull quote — the story's featuredQuote, falling back to
   *  its card quote. Only the band reads this; the grid keeps using `text`. */
  featuredText?: string;
  /** The entry's slug, as the listing query projects it. */
  slug?: string;
}

export interface FoundersStoryGridData {
  heading?: string;
  browseLabel?: string;
  browseHref?: string;
  gridHeading?: string;
  ctaLabel?: string;
  stories?: FounderStoryCard[];
}

/**
 * Where a card links.
 *
 * IT IS THE ENTRY'S OWN SLUG. Cards and articles are one document now, so a
 * card cannot point anywhere but at its own story — the old guess (slugify the
 * company out of the role) could land on a page that did not exist, and it is
 * gone. The derivation survives only as a fallback for the hard-coded demo
 * slides, which have no slug of their own.
 */
export function storySlug(story: FounderStoryCard): string {
  if (story.storySlug?.trim()) {
    return story.storySlug.trim().replace(/^\/+|\/+$/g, "");
  }
  const role = story.role || "";
  const company = role.includes(",") ? role.split(",").pop()!.trim() : story.name;
  return company.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
