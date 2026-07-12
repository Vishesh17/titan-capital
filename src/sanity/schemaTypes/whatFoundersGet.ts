import { defineField, defineType } from "sanity";

/**
 * Home — "How We Show Up" section (component file: WhatFoundersGet.tsx).
 *
 * Singleton document. Editors control the section heading and the 6
 * accordion rows. Each row has:
 *   • title           — left column label (e.g. "The Ecosystem")
 *   • shortHeading    — right column label shown while closed
 *                       (e.g. "Global Founder Network")
 *   • shortDesc       — description shown while closed
 *   • longHeading     — headline shown when the row is expanded
 *                       (e.g. "The Network is the Moat.")
 *   • longDesc        — long-form description shown when expanded
 *   • valueTitle      — sub-heading above the bullets in the expanded
 *                       state (e.g. "Strategic Value")
 *   • valueBullets    — bulleted list under the value title
 */
export const whatFoundersGet = defineType({
  name: "whatFoundersGet",
  title: "Home — How We Show Up Section",
  type: "document",

  fields: [
    defineField({
      name: "heading",
      title: "Section heading",
      description: 'e.g. "How We Show Up"',
      type: "string",
    }),

    defineField({
      name: "rows",
      title: "Accordion rows",
      description:
        "6 rows recommended. Each row expands inline on click and collapses others.",
      type: "array",
      of: [
        {
          type: "object",
          name: "howWeShowUpRow",
          fields: [
            defineField({
              name: "title",
              title: "Row title (left column)",
              description: 'e.g. "The Ecosystem"',
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "shortHeading",
              title: "Short heading (closed state)",
              description: 'e.g. "Global Founder Network"',
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "shortDesc",
              title: "Short description (closed state)",
              type: "text",
              rows: 3,
              validation: (r) => r.required(),
            }),
            defineField({
              name: "longHeading",
              title: "Long heading (opened state)",
              description: 'e.g. "The Network is the Moat."',
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "longDesc",
              title: "Long description (opened state)",
              type: "text",
              rows: 5,
              validation: (r) => r.required(),
            }),
            defineField({
              name: "valueTitle",
              title: "Value section title",
              description: 'e.g. "Strategic Value"',
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "valueBullets",
              title: "Value bullets",
              description: "Bulleted list shown under the value title.",
              type: "array",
              of: [{ type: "text", rows: 2 }],
              validation: (r) => r.min(1),
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "shortHeading" },
          },
        },
      ],
    }),
  ],

  preview: { prepare: () => ({ title: "Home — How We Show Up Section" }) },
});
