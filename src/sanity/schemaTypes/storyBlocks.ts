import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * THE BLOCKS A FOUNDER STORY IS BUILT FROM.
 *
 * Everything below the header is ONE ORDERED LIST. An editor adds whichever
 * blocks the story needs and drags them into whatever order it wants — a fact
 * bar half way down, two quotes in a row, figures before the copy rather than
 * after. The page renders the list in order and asks no questions.
 *
 * WHAT IS NOT IN HERE, deliberately: the tags, the headline, the founders line
 * and the hero image. Those four are the story's identity rather than its
 * content — every story opens the same way, and letting them be dragged around
 * would let one story open on a quote and another on a photo. They stay as
 * fixed fields above the list.
 */

/* ─────────────────────────────────────────────────────────
   Colours an editor may set on text.

   A FIXED LIST rather than a free colour picker. A hex field would let anyone
   put pale grey on white, and there is no way to catch that in review. These
   are the site's own colours and all of them are legible on the page's white
   and cream grounds.
   ───────────────────────────────────────────────────────── */
export const STORY_TEXT_COLORS = [
  { title: "Default (near-black)", value: "#1a1a1a" },
  { title: "Navy", value: "#001A4D" },
  { title: "Blue", value: "#003CB3" },
  { title: "Muted grey", value: "#6b6b6b" },
] as const;

/* ─────────────────────────────────────────────────────────
   1. CONTENT — rich text.

   The word-processor block: pick a level per paragraph, mark bold or italic,
   set a colour, add a link or a list. `type: "block"` is Sanity's Portable
   Text, so this is a real editor rather than a pile of separate fields.
   ───────────────────────────────────────────────────────── */
export const storyContent = defineType({
  name: "storyContent",
  title: "Content area",
  type: "object",
  fields: [
    defineField({
      name: "body",
      title: "Text",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          /* The levels, named for what they DO on the page rather than by tag,
             because "h3" means nothing to whoever is writing the story. */
          styles: [
            { title: "Body", value: "normal" },
            { title: "Heading — large", value: "h2" },
            { title: "Heading — medium", value: "h3" },
            { title: "Eyebrow (small, grey)", value: "h4" },
            { title: "Small print", value: "blockquote" },
          ],
          lists: [
            { title: "Bulleted", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
            annotations: [
              {
                name: "textColor",
                title: "Colour",
                type: "object",
                fields: [
                  defineField({
                    name: "value",
                    title: "Colour",
                    type: "string",
                    options: {
                      list: STORY_TEXT_COLORS.map((c) => ({ ...c })),
                      layout: "radio",
                    },
                    initialValue: STORY_TEXT_COLORS[0].value,
                  }),
                ],
              },
              {
                name: "link",
                title: "Link",
                type: "object",
                fields: [
                  defineField({
                    name: "href",
                    title: "URL",
                    type: "url",
                    validation: (r) =>
                      r.uri({ allowRelative: true, scheme: ["http", "https", "mailto", "tel"] }),
                  }),
                ],
              },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: "dropCap",
      title: "Open with a drop cap",
      description:
        "Sets the first letter large, on the first line. Usually only on the passage that opens the story.",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: { body: "body" },
    prepare: ({ body }) => {
      /* Portable Text is an array of blocks of spans; pull the first line of
         actual words out so the list item is readable at a glance. */
      const first = Array.isArray(body)
        ? body.find((b: { _type?: string }) => b?._type === "block")
        : null;
      const text =
        first && Array.isArray((first as { children?: unknown[] }).children)
          ? (first as { children: { text?: string }[] }).children
              .map((c) => c.text ?? "")
              .join("")
          : "";
      return {
        title: text.slice(0, 60) || "Content area",
        subtitle: "Content area",
      };
    },
  },
});

/* ─────────────────────────────────────────────────────────
   2. QUOTE — the cream slab WITH the quote mark and an attribution.
   ───────────────────────────────────────────────────────── */
export const storyQuote = defineType({
  name: "storyQuote",
  title: "Quote (cream block)",
  type: "object",
  fields: [
    defineField({
      name: "text",
      title: "Quote",
      type: "text",
      rows: 3,
      validation: (r) => r.required(),
    }),
    defineField({ name: "attribution", title: "Attribution", type: "string" }),
  ],
  preview: {
    select: { title: "text", subtitle: "attribution" },
    prepare: ({ title, subtitle }) => ({
      title: title || "Quote",
      subtitle: subtitle ? `Quote — ${subtitle}` : "Quote",
    }),
  },
});

/* ─────────────────────────────────────────────────────────
   3. NOTE — the same cream slab WITHOUT the quote mark.

   A separate block rather than a checkbox on the quote, because the two are
   different things: one is someone speaking, the other is the story raising
   its voice. Keeping them apart means the list reads honestly.
   ───────────────────────────────────────────────────────── */
export const storyNote = defineType({
  name: "storyNote",
  title: "Statement (cream block, no quote mark)",
  type: "object",
  fields: [
    defineField({
      name: "text",
      title: "Text",
      type: "text",
      rows: 4,
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { title: "text" },
    prepare: ({ title }) => ({ title: title || "Statement", subtitle: "Statement" }),
  },
});

/* ─────────────────────────────────────────────────────────
   4. FACT BAR — Company / Location / Sector / Year + Visit Site.
   ───────────────────────────────────────────────────────── */
export const storyFactBar = defineType({
  name: "storyFactBar",
  title: "Fact bar (with Visit Site)",
  type: "object",
  fields: [
    defineField({
      name: "facts",
      title: "Facts",
      description: "Each one is a label with a value under it. Add as many as fit.",
      type: "array",
      of: [
        {
          type: "object",
          name: "storyFact",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              description: 'e.g. "Company", "Location", "Sector", "Year".',
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "value",
              title: "Value",
              type: "string",
              validation: (r) => r.required(),
            }),
          ],
          preview: { select: { title: "label", subtitle: "value" } },
        },
      ],
    }),
    defineField({
      name: "ctaLabel",
      title: "Button label",
      type: "string",
      initialValue: "Visit Site",
    }),
    defineField({
      name: "ctaUrl",
      title: "Button link",
      description: "No link, no button — the facts still show.",
      type: "url",
    }),
  ],
  preview: {
    select: { facts: "facts", url: "ctaUrl" },
    prepare: ({ facts, url }) => ({
      title: "Fact bar",
      subtitle:
        `${(facts as unknown[] | undefined)?.length ?? 0} facts` +
        (url ? " · Visit Site" : ""),
    }),
  },
});

/* ─────────────────────────────────────────────────────────
   5. FIGURES — the cream strip of rolling numbers.
   ───────────────────────────────────────────────────────── */
export const storyFigures = defineType({
  name: "storyFigures",
  title: "Figures strip",
  type: "object",
  fields: [
    defineField({
      name: "stats",
      title: "Figures",
      type: "array",
      of: [
        {
          type: "object",
          name: "storyFigure",
          fields: [
            defineField({
              name: "num",
              title: "Figure",
              description: 'e.g. "300+", "$4B+", "101X".',
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({ name: "label", title: "Label", type: "string" }),
          ],
          preview: { select: { title: "num", subtitle: "label" } },
        },
      ],
      validation: (r) => r.min(1),
    }),
    defineField({
      name: "footnote",
      title: "Footnote",
      description: "Optional line under the figures — e.g. where they come from.",
      type: "text",
      rows: 2,
    }),
  ],
  preview: {
    select: { stats: "stats" },
    prepare: ({ stats }) => ({
      title: "Figures strip",
      subtitle: `${(stats as unknown[] | undefined)?.length ?? 0} figures`,
    }),
  },
});

/* ─────────────────────────────────────────────────────────
   6. PICTURE — a full-width image between blocks.
   ───────────────────────────────────────────────────────── */
export const storyPicture = defineType({
  name: "storyPicture",
  title: "Picture",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
    }),
  ],
  preview: {
    select: { media: "image", subtitle: "caption" },
    prepare: ({ media, subtitle }) => ({
      title: "Picture",
      subtitle: (subtitle as string) || "",
      media,
    }),
  },
});

/* ─────────────────────────────────────────────────────────
   7. EXPLORE — the cream band of other stories at the end.

   The CARDS are not editable here: they come from the other stories in the
   list, minus this one. Only the heading and the browse link are.
   ───────────────────────────────────────────────────────── */
export const storyExplore = defineType({
  name: "storyExplore",
  title: "Explore band",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      description: 'e.g. "Explore Stories".',
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "browseLabel", title: "Browse link label", type: "string" }),
    defineField({ name: "browseHref", title: "Browse link URL", type: "string" }),
    defineField({
      name: "storySlugs",
      title: "Which three stories to show",
      description:
        'The URL slug of each story you want in this band, in the order you want them — e.g. "mamaearth". You can see a story\'s slug in its own Slug field. Leave this empty and the band falls back to showing the three most recent stories, which is what it did before.',
      type: "array",
      of: [{ type: "string" }],
      validation: (r) => r.max(3),
    }),
  ],
  preview: {
    select: { title: "heading" },
    prepare: ({ title }) => ({ title: title || "Explore band", subtitle: "Explore band" }),
  },
});

/** Every block type, in the order the "Add item" menu offers them. */
export const STORY_BLOCK_TYPES = [
  { type: "storyContent" },
  { type: "storyQuote" },
  { type: "storyNote" },
  { type: "storyPicture" },
  { type: "storyFactBar" },
  { type: "storyFigures" },
  { type: "storyExplore" },
];
