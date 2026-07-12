import { defineField, defineType } from "sanity";

/**
 * Home — "What We Believe" section.
 *
 * Singleton document. Mirrors WhatWeBelieveClient.tsx:
 *   • `heading`   — single plain heading, e.g. "What We Believe"
 *   • `beliefs[]` — exactly 3 cards, each with title + description
 *
 * The crowd background image (`/images/what-we-believe/crowd.png`) and
 * the scroll-driven image → cards animation stay in the component —
 * they're design, not editorial content.
 */
export const whatWeBelieve = defineType({
  name: "whatWeBelieve",
  title: "Home — What We Believe Section",
  type: "document",

  fields: [
    defineField({
      name: "heading",
      title: "Section heading",
      description: 'e.g. "What We Believe"',
      type: "string",
    }),
    defineField({
      name: "beliefs",
      title: "Belief cards",
      description:
        "Exactly 3 cards — the scroll animation splits the crowd image into 3 slices that become these cards. Other counts won't render correctly.",
      type: "array",
      of: [
        {
          type: "object",
          name: "beliefItem",
          fields: [
            defineField({
              name: "title",
              title: "Card title",
              description: 'e.g. "Founder-Centricity"',
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "description",
              title: "Card description",
              type: "text",
              rows: 5,
              validation: (r) => r.required(),
            }),
          ],
          preview: { select: { title: "title", subtitle: "description" } },
        },
      ],
      validation: (r) =>
        r
          .length(3)
          .warning(
            "Design fits exactly 3 cards — the animation splits the image into 3 slices.",
          ),
    }),
  ],

  preview: { prepare: () => ({ title: "Home — What We Believe Section" }) },
});
