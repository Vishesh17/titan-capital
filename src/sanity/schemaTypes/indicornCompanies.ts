import { defineField, defineType } from "sanity";

/**
 * /indicorns — "Indicorns We Backed" section. Singleton.
 *
 * The grid re-flows off the number of companies with no code change:
 * 3 or fewer sit in one row, 4 become 2x2, 5-6 become 3x2, and so on —
 * always aiming for two rows.
 */
export const indicornCompanies = defineType({
  name: "indicornCompanies",
  title: "Indicorns — Companies We Backed",
  type: "document",

  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      description: 'e.g. "Indicorns We Backed"',
      type: "string",
    }),

    defineField({
      name: "companies",
      title: "Companies",
      description:
        "Card layout follows the count automatically: 4 → 2x2, 6 → 3x2. Keep descriptions to a similar length so the cards stay balanced.",
      type: "array",
      of: [
        {
          type: "object",
          name: "indicornCompany",
          fields: [
            defineField({
              name: "name",
              title: "Company name",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "logo",
              title: "Logo",
              description:
                "Rendered on the cream card with multiply blending, so a white or transparent background both work.",
              type: "image",
              options: { hotspot: true },
              validation: (r) => r.required(),
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "text",
              rows: 3,
              validation: (r) => r.required(),
            }),
            defineField({
              name: "logoScale",
              title: "Logo size multiplier",
              description:
                "Optical correction only. Some logos carry a lot of built-in padding and read small at the same box height — nudge this up for those. Defaults to 1.",
              type: "number",
              initialValue: 1,
              validation: (r) => r.min(0.2).max(4),
            }),
          ],
          preview: {
            select: { title: "name", subtitle: "description", media: "logo" },
          },
        },
      ],
    }),
  ],

  preview: { prepare: () => ({ title: "Indicorns — Companies We Backed" }) },
});
