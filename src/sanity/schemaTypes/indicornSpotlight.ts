import { defineField, defineType } from "sanity";

/**
 * Home page — "Indicorn Spotlight" section.
 *
 * Singleton. Mirrors what IndicornSpotlightClient.tsx renders:
 *   - Heading + 3 bullet points + CTA + rotating portfolio logos (left)
 *   - Long pull quote + attribution (right)
 */
export const indicornSpotlight = defineType({
  name: "indicornSpotlight",
  title: "Home — Indicorn Spotlight Section",
  type: "document",

  fields: [
    /* ─────────── LEFT side ─────────── */
    defineField({
      name: "heading",
      title: "Main heading",
      description: 'Big Poppins title. e.g. "Indicorns"',
      type: "string",
    }),
    defineField({
      name: "subheading",
      title: "Subheading",
      description: 'Line under the main heading. e.g. "Celebrating India\'s Most Resilient Startups"',
      type: "string",
    }),
    defineField({
      name: "bullets",
      title: "Subheading bullets",
      description: "Each item shows as one bullet (separated by • on screen).",
      type: "array",
      of: [{ type: "string" }],
      validation: (r) => r.max(5).warning("Design fits 3 best — 4+ may wrap awkwardly on mobile."),
    }),
    defineField({
      name: "ctaLabel",
      title: "CTA button label",
      description: 'e.g. "Meet the Indicorns"',
      type: "string",
    }),
    defineField({
      name: "rotatingLogosLabel",
      title: "Rotating logos label",
      description: 'Small label next to the rotating logos. e.g. "Portfolio Indicorns"',
      type: "string",
    }),
    defineField({
      name: "rotatingLogos",
      title: "Rotating portfolio logos",
      description: "Each logo shows for ~2.5s before rotating to the next.",
      type: "array",
      of: [
        {
          type: "object",
          name: "indicornLogo",
          fields: [
            defineField({
              name: "image",
              title: "Logo image",
              type: "image",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "alt",
              title: "Brand name (alt text)",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "mode",
              title: "Render mode (controls how the logo is colorised on the navy bg)",
              type: "string",
              options: {
                list: [
                  { title: "Transparent — black logo on transparent bg (will be inverted to white)", value: "transparent" },
                  { title: "Opaque background — logo on solid bg (screen blend to remove bg)", value: "opaqueBg" },
                  { title: "Already white — render as-is, no filter", value: "white" },
                ],
                layout: "radio",
              },
              validation: (r) => r.required(),
            }),
            defineField({
              name: "scale",
              title: "Scale (1.0 = no zoom)",
              description: "Some logos look small at native size — bump 1.5–2.0 to fit the slot.",
              type: "number",
              initialValue: 1.0,
              validation: (r) => r.min(0.1).max(5),
            }),
          ],
          preview: {
            select: { title: "alt", subtitle: "mode", media: "image" },
          },
        },
      ],
    }),

    /* ─────────── RIGHT side ─────────── */
    defineField({
      name: "quote",
      title: "Pull quote",
      description: "The italic quote on the right side of the section.",
      type: "text",
      rows: 5,
    }),
    defineField({
      name: "attribution",
      title: "Attribution",
      description: 'e.g. "- Titan Capital"',
      type: "string",
    }),
  ],

  preview: { prepare: () => ({ title: "Home — Indicorn Spotlight Section" }) },
});
