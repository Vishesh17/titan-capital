import { defineField, defineType } from "sanity";

/**
 * Portfolio Company document. Field shape mirrors the `CompanyDetail`
 * interface in src/app/portfolio/[slug]/page.tsx — keep them in sync.
 */
export const company = defineType({
  name: "company",
  title: "Portfolio Company",
  type: "document",

  fields: [
    /* ─────────────── Header ─────────────── */
    defineField({
      name: "brandName",
      title: "Brand name",
      type: "string",
      validation: (r) => r.required().error("Brand name is required"),
    }),
    defineField({
      name: "slug",
      title: "Slug (URL — /portfolio/<slug>)",
      type: "slug",
      options: { source: "brandName", maxLength: 96 },
      validation: (r) => r.required().error("Slug is required"),
    }),
    defineField({
      name: "logo",
      title: "Brand logo (transparent PNG preferred)",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "oneLiner",
      title: "One-liner (shown in navy banner under the logo)",
      type: "string",
      validation: (r) => r.max(140),
    }),

    /* ─────────────── About ─────────────── */
    defineField({
      name: "about",
      title: "About — long-form description",
      type: "text",
      rows: 6,
    }),
    defineField({
      name: "links",
      title: "Link pills (Website / LinkedIn / Instagram / YouTube / Twitter)",
      type: "array",
      of: [
        {
          type: "object",
          name: "linkPill",
          fields: [
            defineField({
              name: "label",
              title: "Label inside the pill",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "url",
              title: "Destination URL",
              type: "url",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "type",
              title: "Icon type",
              type: "string",
              options: {
                list: [
                  { title: "Website", value: "website" },
                  { title: "LinkedIn", value: "linkedin" },
                  { title: "Instagram", value: "instagram" },
                  { title: "YouTube", value: "youtube" },
                  { title: "Twitter / X", value: "twitter" },
                ],
                layout: "radio",
              },
              validation: (r) => r.required(),
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "type" },
          },
        },
      ],
    }),

    /* ─────────────── Right-hand info box ─────────────── */
    defineField({
      name: "areaOfFocus",
      title: "Area of Focus (e.g. Consumer Brand)",
      type: "string",
    }),
    defineField({
      name: "investedIn",
      title: "Invested In (year, e.g. 2019)",
      type: "string",
    }),
    defineField({
      name: "milestones",
      title: "Milestones (one per line, e.g. \"Founded 2011\")",
      type: "array",
      of: [{ type: "string" }],
    }),

    /* ─────────────── Gallery ─────────────── */
    defineField({
      name: "gallery",
      title: "Brand gallery images (6–7 recommended)",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      options: { layout: "grid" },
    }),

    /* ─────────────── Founding Team ─────────────── */
    defineField({
      name: "founders",
      title: "Founding team",
      type: "array",
      of: [
        {
          type: "object",
          name: "founder",
          fields: [
            defineField({
              name: "name",
              title: "Name",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "linkedin",
              title: "LinkedIn URL",
              type: "url",
            }),
            defineField({
              name: "avatar",
              title: "Avatar photo (optional)",
              type: "image",
              options: { hotspot: true },
            }),
          ],
          preview: {
            select: { title: "name", media: "avatar" },
          },
        },
      ],
    }),

    /* ─────────────── News / Blogs ─────────────── */
    defineField({
      name: "newsBlogs",
      title: "News / Blogs cards",
      type: "array",
      of: [
        {
          type: "object",
          name: "newsItem",
          fields: [
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "url", title: "Link", type: "url" }),
            defineField({
              name: "source",
              title: "Source (e.g. TechCrunch)",
              type: "string",
            }),
            defineField({
              name: "image",
              title: "Thumbnail",
              type: "image",
              options: { hotspot: true },
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "source", media: "image" },
          },
        },
      ],
    }),
  ],

  preview: {
    select: { title: "brandName", subtitle: "oneLiner", media: "logo" },
  },
});
