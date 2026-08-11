import { defineField, defineType } from "sanity";

/**
 * Our Team — "Led By Founders Who've Walked The Path." section.
 *
 * Singleton document. Lists each founder with a portrait, role, LinkedIn,
 * bio, and an explicit image position so editors can alternate the layout
 * (image left / image right) without touching code.
 */
export const ledByFounders = defineType({
  name: "ledByFounders",
  title: "Our Team — Led By Founders",
  type: "document",

  fields: [
    /* ─────────── Headings ─────────── */
    defineField({
      name: "headingTopHighlight",
      title: "Heading — top line (highlighted + italic)",
      description: 'e.g. "Led By Founders"',
      type: "string",
    }),
    defineField({
      name: "headingBottom",
      title: "Heading — bottom line (plain)",
      description: 'e.g. "Who\'ve Walked The Path."',
      type: "string",
    }),

    /* ─────────── Founder cards ─────────── */
    defineField({
      name: "founders",
      title: "Founders",
      description:
        "Each card alternates image-left / image-right based on the editor's choice below.",
      type: "array",
      of: [
        {
          type: "object",
          name: "founderProfile",
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
              description: 'e.g. "Co-Founder, Titan Capital"',
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "slug",
              title: "Slug (detail-page URL)",
              description:
                'Powers /founders/<slug>. Click Generate to derive it from the name.',
              type: "slug",
              options: { source: "name", maxLength: 96 },
              validation: (r) => r.required(),
            }),
            defineField({
              name: "instagram",
              title: "Instagram URL",
              description:
                "Detail page only. These two use Instagram rather than email.",
              type: "url",
            }),
            defineField({
              name: "twitter",
              title: "X / Twitter URL",
              description: "Detail page only.",
              type: "url",
            }),
            defineField({
              name: "imageNoBg",
              title: "Photo — cut out (detail page)",
              description:
                'Background removed — must be a transparent PNG, since it gets clipped into the blob shape on /founders/<slug>. Separate from "Photo — with background", which stays on the Led By Founders section.',
              type: "image",
              options: { hotspot: true },
            }),
            defineField({
              name: "longBio",
              title: "Long bio (detail page)",
              description:
                "The full story, shown on /founders/<slug>. The short bio above is what appears in the Led By Founders section.",
              type: "text",
              rows: 12,
            }),
            defineField({
              name: "linkedin",
              title: "LinkedIn URL",
              type: "url",
            }),
            defineField({
              name: "image",
              title: "Photo — with background (Led By Founders section)",
              description:
                'The rectangular portrait beside the bio on /ourTeam. Keeps its background. Separate from "Photo — cut out", which is used on the detail page.',
              type: "image",
              options: { hotspot: true },
            }),
            defineField({
              name: "bio",
              title: "Bio",
              type: "text",
              rows: 6,
              validation: (r) => r.required(),
            }),
            defineField({
              name: "imagePosition",
              title: "Image position",
              type: "string",
              options: {
                list: [
                  { title: "Left", value: "left" },
                  { title: "Right", value: "right" },
                ],
                layout: "radio",
              },
              initialValue: "left",
            }),
          ],
          preview: {
            select: { title: "name", subtitle: "role", media: "image" },
          },
        },
      ],
    }),
  ],

  preview: { prepare: () => ({ title: "Our Team — Led By Founders" }) },
});
