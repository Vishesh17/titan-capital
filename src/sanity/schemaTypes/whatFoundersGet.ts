import { defineField, defineType } from "sanity";

/**
 * Home — "How We Show Up" section (component file: WhatFoundersGet.tsx).
 *
 * Singleton document. Editors control the heading and the 6 feature
 * card texts (title + description). The desktop/mobile coordinate
 * layouts (top/left/width for each card and the surrounding arrows
 * /hub image) stay hardcoded in the client because they're hand-tuned
 * design, not editorial content.
 *
 * The `id` field maps each entry to its position in the hardcoded
 * layout arrays — so editors can reorder cards in the Studio without
 * breaking the visual flowchart.
 */
export const whatFoundersGet = defineType({
  name: "whatFoundersGet",
  title: "Home — How We Show Up Section",
  type: "document",

  fields: [
    defineField({
      name: "headingFirst",
      title: "Heading — line 1 (plain)",
      description: 'e.g. "How We"',
      type: "string",
    }),
    defineField({
      name: "headingSecond",
      title: "Heading — line 2 (italic + highlighted)",
      description: 'e.g. "Show Up"',
      type: "string",
    }),
    defineField({
      name: "features",
      title: "Feature cards",
      description:
        "6 entries are wired into the hand-positioned flowchart layout. The `id` is what links the editorial text to its position on screen — don't change it.",
      type: "array",
      of: [
        {
          type: "object",
          name: "featureItem",
          fields: [
            defineField({
              name: "id",
              title: "Slot ID (do not change)",
              description: "Internal key that maps the card to its position on the flowchart.",
              type: "string",
              options: {
                list: [
                  { title: "Hiring (top-left)", value: "hiring" },
                  { title: "Network (top-right)", value: "network" },
                  { title: "Follow-on Capital (mid-left)", value: "capital" },
                  { title: "Fundraising (mid-right)", value: "fundraising" },
                  { title: "Firefighting (bottom-mid)", value: "firefighting" },
                  { title: "Industry Playbook (bottom-right)", value: "playbook" },
                ],
                layout: "radio",
              },
              validation: (r) => r.required(),
            }),
            defineField({
              name: "title",
              title: "Card title",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "desc",
              title: "Card description",
              type: "text",
              rows: 4,
              validation: (r) => r.required(),
            }),
          ],
          preview: { select: { title: "title", subtitle: "id" } },
        },
      ],
      validation: (r) => r.length(6).warning("The flowchart has 6 hand-placed positions — other counts won't render correctly."),
    }),
  ],

  preview: { prepare: () => ({ title: "Home — How We Show Up Section" }) },
});
