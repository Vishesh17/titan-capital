import { defineField, defineType } from "sanity";

/**
 * Global Navbar — singleton appearing on every page.
 *
 * Editor controls:
 *   - Section titles (e.g. "FOR FOUNDERS", "PORTFOLIO")
 *   - Sub-item label + destination URL per row
 *   - For sections with no sub-items, a directUrl that the title links to
 *   - CTA button label + destination URL
 *
 * URLs are explicit per-item so editors can rename sections without
 * breaking the link map.
 */
export const navbar = defineType({
  name: "navbar",
  title: "Global — Navbar",
  type: "document",

  fields: [
    defineField({
      name: "sections",
      title: "Menu sections",
      description:
        "Each top-level item in the slide-out menu. A section with at least one sub-item shows an expandable sub-panel. A section with no sub-items links directly to its `directUrl`.",
      type: "array",
      of: [
        {
          type: "object",
          name: "navbarSection",
          fields: [
            defineField({
              name: "id",
              title: "Internal ID",
              description:
                'Unique key, lowercase no-spaces. Used only for keying the React render — not visible to users. e.g. "for-founders"',
              type: "string",
              validation: (r) =>
                r.required().regex(/^[a-z0-9-]+$/, {
                  name: "lowercase-kebab",
                  invert: false,
                }),
            }),
            defineField({
              name: "title",
              title: "Title (uppercase)",
              description: 'e.g. "FOR FOUNDERS"',
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "directUrl",
              title: "Direct URL (only when there are no sub-items)",
              description:
                'When this section has 0 sub-items, the title links here directly. e.g. "/portfolio". Ignored if sub-items exist.',
              type: "string",
            }),
            defineField({
              name: "subItems",
              title: "Sub-items",
              description: "Rows shown when this section is expanded.",
              type: "array",
              of: [
                {
                  type: "object",
                  name: "navbarSubItem",
                  fields: [
                    defineField({
                      name: "label",
                      title: "Label",
                      type: "string",
                      validation: (r) => r.required(),
                    }),
                    defineField({
                      name: "url",
                      title: "URL",
                      description: 'Relative path (e.g. "/getInvestment") or full https URL.',
                      type: "string",
                      validation: (r) => r.required(),
                    }),
                  ],
                  preview: { select: { title: "label", subtitle: "url" } },
                },
              ],
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "id" },
          },
        },
      ],
    }),
    defineField({
      name: "ctaLabel",
      title: "CTA button label",
      description: 'Top-right button, e.g. "Get Investment"',
      type: "string",
    }),
    defineField({
      name: "ctaUrl",
      title: "CTA button URL",
      description: 'e.g. "/getInvestment"',
      type: "string",
    }),
  ],

  preview: { prepare: () => ({ title: "Global — Navbar" }) },
});
