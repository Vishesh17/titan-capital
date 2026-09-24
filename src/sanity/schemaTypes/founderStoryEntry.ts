import { defineField, defineType } from "sanity";
import { STORY_BLOCK_TYPES } from "./storyBlocks";

/**
 * One founder story — an OBJECT, not a document.
 *
 * Stories live inside the single "Founders Story Page" document (see
 * foundersStoryPage.ts), the same way team members live inside "Our Team
 * Page". /foundersstory/[slug] finds its story by looking up the slug in that
 * array, so adding a story is one entry in one place rather than a new
 * document to create and remember to publish.
 *
 * THE HEADER IS FIXED, THE REST IS A LIST. Tags, headline, founders and hero
 * image are the story's identity — every story opens the same way, so letting
 * them be dragged around would let one open on a quote and another on a photo.
 * Everything after them lives in `blocks`, an ordered list the editor composes
 * and reorders freely. See storyBlocks.ts for what can go in it.
 */
export const founderStoryEntry = defineType({
  /* NOT "founderStory": the Impact At A Glance singleton already has an inline
     array member by that name, and two schema types sharing one name means
     Sanity can hand this schema's fields to that section's data. */
  name: "founderStoryEntry",
  title: "Founder Story",
  type: "object",

  groups: [
    { name: "header", title: "1 · Header" },
    { name: "story", title: "2 · Story" },
    { name: "card", title: "3 · Listing card" },
  ],

  fields: [
    /* ─────────── 1. HEADER ─────────── */
    defineField({
      name: "company",
      title: "Company",
      type: "string",
      validation: (r) => r.required(),
      group: "header",
    }),
    defineField({
      name: "slug",
      title: "Slug (URL — /foundersstory/<slug>)",
      description:
        'Just the last part of the address, no slashes: "mamaearth" for /foundersstory/mamaearth.',
      type: "slug",
      options: {
        source: "company",
        maxLength: 96,
        slugify: (input: string) =>
          input
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 96),
      },
      validation: (r) =>
        r
          .required()
          .error("Slug is required for the story URL")
          /* A slug typed with a slash builds "/foundersstory//mamaearth",
             which is not a route — the page 404s. */
          .custom((v) =>
            v?.current && /[/\s]/.test(v.current)
              ? 'Remove the slash — write "mamaearth", not "/mamaearth".'
              : true
          ),
      group: "header",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      description: 'The pills above the headline, e.g. "D2C", "IPO 2023".',
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      group: "header",
    }),
    defineField({
      name: "headline",
      title: "Headline",
      description: "The big title. This is the story, not the company name.",
      type: "text",
      rows: 3,
      group: "header",
    }),
    defineField({
      name: "founders",
      title: "Founders",
      description:
        'e.g. "Ghazal & Varun Alagh". The company is appended after a dash automatically.',
      type: "string",
      group: "header",
    }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image",
      options: { hotspot: true },
      group: "header",
    }),
    /* ─────────── 3. THE LISTING CARD ───────────
       How this story appears on /foundersstory — in the grid, and in the
       Featured band when it is the one ticked below. ONE ENTRY NOW OWNS BOTH:
       the card and the article used to live in two different documents joined
       only by a slug that was guessed from the company name, so a card could
       quietly point at a story that did not exist. */
    defineField({
      name: "featured",
      title: "Featured story",
      description:
        "Puts this story in the band at the top of /foundersstory. If several are ticked the first wins; if none is, the first story is used.",
      type: "boolean",
      initialValue: false,
      group: "card",
    }),
    /* Appears the moment "Featured story" is ticked, and only then — the band
       is a much larger object than a grid card, so the line that works at card
       size is usually not the line that works across half a screen. Left blank
       it falls back to the Card quote, which is what the band used before this
       field existed, so nothing changes for a story that does not set it. */
    defineField({
      name: "featuredQuote",
      title: "Featured band quote",
      description:
        "The pull quote for the big band at the top of /foundersstory. Leave blank to reuse the Card quote below.",
      type: "text",
      rows: 3,
      group: "card",
      hidden: ({ parent }) => !parent?.featured,
    }),
    defineField({
      name: "cardImage",
      title: "Card photo",
      description:
        "The photo on the grid card AND in the Featured band — one image, so the two can never disagree. Leave empty to use the Hero image above.",
      type: "image",
      options: { hotspot: true },
      group: "card",
    }),
    defineField({
      name: "cardQuote",
      title: "Card quote",
      description: "The pull quote shown on the card and in the Featured band.",
      type: "text",
      rows: 3,
      group: "card",
    }),
    defineField({
      name: "founderRole",
      title: "Founder role",
      description: 'Shown under the name, e.g. "Co-Founders, Mamaearth".',
      type: "string",
      group: "card",
    }),
    defineField({
      name: "logo",
      title: "Company logo",
      type: "image",
      options: { hotspot: true },
      group: "card",
    }),
    defineField({
      name: "logoScale",
      title: "Logo scale",
      description: "1 is unscaled. The marks sit on a square canvas, so this sizes the wordmark inside it.",
      type: "number",
      group: "card",
    }),
    defineField({
      name: "logoOffsetY",
      title: "Logo nudge (vertical %)",
      description: "Positive moves it down. Cancels out the differing transparent padding around each mark.",
      type: "number",
      group: "card",
    }),

    /* ─────────── 2. THE STORY ─────────── */
    defineField({
      name: "blocks",
      title: "Story",
      description:
        "Everything below the header, in order. Add whichever blocks the story needs and drag them into the order you want — a fact bar part way down, two quotes in a row, figures before the copy rather than after.",
      type: "array",
      group: "story",
      of: STORY_BLOCK_TYPES,
    }),
  ],

  preview: {
    select: { title: "company", subtitle: "headline", media: "heroImage" },
  },
});
