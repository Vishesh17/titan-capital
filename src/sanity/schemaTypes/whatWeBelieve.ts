import { defineField, defineType } from "sanity";

/**
 * Home — "What We Believe" section.
 *
 * Singleton document. Mirrors WhatWeBelieveClient.tsx:
 *   - Two-part heading ("What" + italic-highlighted "We Believe")
 *   - 3 belief cards (title + description) rendered on the bordered card art
 *
 * The bordered card background art (`borderedcard.png`) stays in the code —
 * it's brand decoration, not editorial content.
 */
export const whatWeBelieve = defineType({
  name: "whatWeBelieve",
  title: "Home — What We Believe Section",
  type: "document",

  fields: [
    defineField({
      name: "headingFirst",
      title: "Heading — line 1 (plain)",
      description: 'e.g. "What"',
      type: "string",
    }),
    defineField({
      name: "headingSecond",
      title: "Heading — line 2 (italic + highlighted)",
      description: 'e.g. "We Believe"',
      type: "string",
    }),
    defineField({
      name: "beliefs",
      title: "Belief cards",
      description: "Exactly 3 cards is the design — the centre one slides up while side ones fan in. Adding more will overflow the row.",
      type: "array",
      of: [
        {
          type: "object",
          name: "beliefItem",
          fields: [
            defineField({
              name: "title",
              title: "Card title",
              description: 'e.g. "Founder-First, Always"',
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "description",
              title: "Card description",
              type: "text",
              rows: 4,
              validation: (r) => r.required(),
            }),
          ],
          preview: { select: { title: "title", subtitle: "description" } },
        },
      ],
      validation: (r) =>
        r.length(3).warning('Design fits 3 cards — other counts won\'t render correctly.'),
    }),
  ],

  preview: { prepare: () => ({ title: "Home — What We Believe Section" }) },
});
