import { defineField, defineType } from "sanity";

/**
 * Home page — "Impact At A Glance" + "Their Stories, Our Credentials".
 *
 * Singleton (only one document should exist). Field shape mirrors what
 * ImpactAtGlanceClient.tsx renders:
 *   - Two headings (each: italic+highlighted word + plain word)
 *   - 5 rotating stat cards
 *   - 3 founder-story slides (image + logo + pull quote)
 *   - 1 CTA button label
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
      title: "Stories heading — italic + highlighted word",
      description: 'e.g. "Their Stories,"',
      type: "string",
    }),
    defineField({
      name: "storiesHeadingSecond",
      title: "Stories heading — semibold tail",
      description: 'e.g. "Our Credentials"',
      type: "string",
    }),
    defineField({
      name: "ctaLabel",
      title: "Story card CTA button label",
      description: 'e.g. "Read Full Story"',
      type: "string",
    }),

    /* ─────────── Impact stats (rotating carousel) ─────────── */
    defineField({
      name: "impactStats",
      title: "Impact stats — rotating carousel",
      description: "5 entries is the design ideal; 3–7 works too.",
      type: "array",
      of: [
        {
          type: "object",
          name: "impactStat",
          fields: [
            defineField({
              name: "num",
              title: "Number (e.g. 300+, 650+, ₹45,000 Cr+)",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "label",
              title: "Label (e.g. Startups Backed)",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "caption",
              title: "Caption (optional — currently hidden, kept for future)",
              type: "string",
            }),
          ],
          preview: { select: { title: "num", subtitle: "label" } },
        },
      ],
    }),

    /* ─────────── Founder stories (TV-screen carousel) ─────────── */
    defineField({
      name: "founderStories",
      title: "Founder stories — TV-screen carousel",
      description: "3 entries fits the design best; more is fine but won't change layout.",
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
              title: "Portrait (shown inside the TV frame)",
              type: "image",
              options: { hotspot: true },
              validation: (r) => r.required(),
            }),
            defineField({
              name: "logo",
              title: "Company logo (overlaid on portrait)",
              type: "image",
              options: { hotspot: true },
            }),
            defineField({
              name: "text",
              title: "Pull quote",
              description: "The italic quote shown on the right of the TV.",
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
