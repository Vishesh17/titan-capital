import { defineField, defineType } from "sanity";

/**
 * Portfolio page — "Backed Early. Built To Last" hero.
 *
 * Singleton. Drives the two heading lines and the marquee of portfolio cards
 * (desktop: continuous marquee, mobile: 2x2 flip grid).
 */
export const backedEarly = defineType({
  name: "backedEarly",
  title: "Portfolio — Backed Early Hero",
  type: "document",

  fields: [
    defineField({
      name: "headingFirst",
      title: "Heading — line 1",
      description: 'e.g. "Backed Early"',
      type: "string",
    }),
    defineField({
      name: "headingSecond",
      title: "Heading — line 2",
      description: 'e.g. "Built To Last"',
      type: "string",
    }),

    defineField({
      name: "companies",
      title: "Marquee companies",
      description:
        "Each card shows the background photo with the company logo over it. Order here is the order they appear.",
      type: "array",
      of: [
        {
          type: "object",
          name: "backedEarlyCompany",
          fields: [
            defineField({
              name: "name",
              title: "Company name",
              description: "Also used as the image alt text.",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "bgImage",
              title: "Card background photo",
              type: "image",
              options: { hotspot: true },
              validation: (r) => r.required(),
            }),
            defineField({
              name: "logo",
              title: "Company logo",
              description:
                "Rendered white over the photo, so a tightly-cropped transparent PNG/SVG/WebP works best — avoid logos padded inside a large square canvas, they render small.",
              type: "image",
              options: { hotspot: true },
              validation: (r) => r.required(),
            }),
            defineField({
              name: "logoScale",
              title: "Logo size (1 = default)",
              description:
                "Fine-tune so the logos look optically balanced. Typically 0.7–1.2.",
              type: "number",
              initialValue: 1,
              validation: (r) => r.min(0.3).max(3),
            }),
            defineField({
              name: "noInvert",
              title: "Keep original logo colours",
              description:
                "Logos are forced to white by default. Tick this for a mark that already ships white, or one that must keep its colour.",
              type: "boolean",
              initialValue: false,
            }),
            defineField({
              name: "logoClass",
              title: "Extra CSS classes (advanced)",
              description:
                'Optional Tailwind utilities for one-off nudges, e.g. "translate-y-[5px]". Leave empty unless a logo sits visibly off.',
              type: "string",
            }),
          ],
          preview: { select: { title: "name", media: "logo" } },
        },
      ],
    }),
  ],

  preview: { prepare: () => ({ title: "Portfolio — Backed Early Hero" }) },
});
