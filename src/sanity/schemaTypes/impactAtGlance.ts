import { defineField, defineType } from "sanity";

/**
 * Home page — "Impact At A Glance" + "Their Stories, Our Credentials".
 *
 * Singleton (only one document should exist). Field shape mirrors what
 * ImpactAtGlanceClient.tsx renders:
 *   - Two headings for each section (plain Poppins text)
 *   - 6 impact stats (3×2 grid: rolling number + two-line label)
 *   - 4 founder-story cards (image + logo + pull quote)
 *   - 1 "See More" button label
 */
export const impactAtGlance = defineType({
  name: "impactAtGlance",
  title: "Home — Impact & Stories Section",
  type: "document",

  fields: [
    /* ─────────── Headings ─────────── */
    defineField({
      name: "impactHeadingFirst",
      title: "Impact heading — italic + highlighted word",
      description: 'e.g. "Impact"',
      type: "string",
    }),
    defineField({
      name: "impactHeadingSecond",
      title: "Impact heading — plain word(s)",
      description: 'e.g. "At A Glance"',
      type: "string",
    }),
    defineField({
      name: "storiesHeadingFirst",
      title: "Stories heading — line 1",
      description: 'e.g. "Their Stories,"',
      type: "string",
    }),
    defineField({
      name: "storiesHeadingSecond",
      title: "Stories heading — line 2",
      description: 'e.g. "Our Credentials"',
      type: "string",
    }),
    defineField({
      name: "ctaLabel",
      title: '"See More" button label',
      description: 'Text on the button below the story cards. e.g. "See More"',
      type: "string",
    }),

    /* ─────────── Impact stats (rotating carousel) ─────────── */
    defineField({
      name: "impactStats",
      title: "Impact stats — 3×2 grid",
      description: "6 entries fills the 3-column × 2-row grid.",
      type: "array",
      of: [
        {
          type: "object",
          name: "impactStat",
          fields: [
            defineField({
              name: "num",
              title: "Number (e.g. 300+, 7, 250M+)",
              description: "Animates as a rolling counter on scroll into view.",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "label",
              title: "Label — up to two lines",
              description:
                'Shown under the number. Press Enter for a line break, e.g. "Startup" ⏎ "Backed".',
              type: "text",
              rows: 2,
              validation: (r) => r.required(),
            }),
            defineField({
              name: "caption",
              title: "Caption (unused — not rendered by the current design)",
              type: "string",
            }),
          ],
          preview: { select: { title: "num", subtitle: "label" } },
        },
      ],
    }),

    /* ─────────── Founder stories (2×2 card grid) ─────────── */
    defineField({
      name: "founderStories",
      title: "Founder stories — 2×2 card grid",
      description:
        "4 entries fills the 2×2 grid. Fewer works too (cards cycle to fill).",
      type: "array",
      of: [
        {
          type: "object",
          name: "founderStory",
          fields: [
            defineField({
              name: "name",
              title: "Founder name",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "role",
              title: "Role / Title",
              description: 'e.g. "Co-Founder & CEO, Ofbusiness"',
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "image",
              title: "Card background photo",
              type: "image",
              options: { hotspot: true },
              validation: (r) => r.required(),
            }),
            defineField({
              name: "logo",
              title: "Company logo",
              description:
                "Shown bottom-left on the card. Rendered white at a uniform height, so a transparent PNG/SVG works best.",
              type: "image",
              options: { hotspot: true },
            }),
            defineField({
              name: "logoScale",
              title: "Logo size (1 = default)",
              description:
                "Fine-tune this logo's size so all four look balanced. 1 = base height; try 0.8–1.4 to even out a logo that reads too big or too small.",
              type: "number",
              initialValue: 1,
              validation: (r) => r.min(0.3).max(3),
            }),
            defineField({
              name: "text",
              title: "Pull quote",
              description: "Fades in on hover, above the founder attribution.",
              type: "text",
              rows: 3,
              validation: (r) => r.required(),
            }),
          ],
          preview: {
            select: { title: "name", subtitle: "role", media: "image" },
          },
        },
      ],
    }),
  ],

  preview: { prepare: () => ({ title: "Home — Impact & Stories Section" }) },
});
