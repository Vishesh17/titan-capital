import { defineField, defineType } from "sanity";

/**
 * Home page — Hero section. Singleton: only ONE Hero document should ever exist.
 * (We don't enforce this in code yet — just create one and edit it.)
 *
 * Field shape mirrors what Hero.tsx currently renders:
 *   - Two-line headline with one italic emphasis word in line 2
 *   - Subtitle paragraph
 *   - 5 founder slots, each rotating between 2 founders
 */
export const hero = defineType({
  name: "hero",
  title: "Home — Hero Section",
  type: "document",

  fields: [
    /* ─────────── Headline ─────────── */
    defineField({
      name: "titleLine1",
      title: "Title — line 1",
      description: 'e.g. "300+ Bets."',
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "titleLine2Before",
      title: "Title — line 2 (plain part)",
      description: 'Words before the italic emphasis. e.g. "All On"',
      type: "string",
    }),
    defineField({
      name: "titleLine2Emphasis",
      title: "Title — line 2 (italic + navy part)",
      description: 'The emphasised word at the end of line 2. e.g. "Founders"',
      type: "string",
    }),

    /* ─────────── Subhead ─────────── */
    defineField({
      name: "subtitle",
      title: "Subtitle paragraph",
      type: "text",
      rows: 3,
    }),

    /* ─────────── CTAs ─────────── */
    defineField({
      name: "primaryCtaLabel",
      title: "Primary button label",
      description: 'Defaults to "Get Investment"',
      type: "string",
    }),
    defineField({
      name: "secondaryCtaLabel",
      title: "Secondary button label",
      description: 'Defaults to "View Portfolio"',
      type: "string",
    }),

    /* ─────────── Founder cards ─────────── */
    defineField({
      name: "founderSlots",
      title: "Founder card slots",
      description:
        "Each slot is one card on screen. Cards rotate through the founders in their pool every few seconds. The design uses 5 slots: large, small, small, small, large.",
      type: "array",
      validation: (r) => r.length(5).error("Use exactly 5 slots (large, small, small, small, large)"),
      of: [
        {
          type: "object",
          name: "founderSlot",
          fields: [
            defineField({
              name: "size",
              title: "Card size",
              type: "string",
              options: {
                list: [
                  { title: "Large", value: "large" },
                  { title: "Small", value: "small" },
                ],
                layout: "radio",
              },
              validation: (r) => r.required(),
            }),
            defineField({
              name: "pool",
              title: "Founders in this slot (will rotate)",
              type: "array",
              validation: (r) => r.min(1).max(4),
              of: [
                {
                  type: "object",
                  name: "heroFounder",
                  fields: [
                    defineField({
                      name: "name",
                      title: "Name",
                      type: "string",
                      validation: (r) => r.required(),
                    }),
                    defineField({
                      name: "role",
                      title: "Role / Title",
                      description: 'e.g. "Co-Founder, Urban Company"',
                      type: "string",
                      validation: (r) => r.required(),
                    }),
                    defineField({
                      name: "image",
                      title: "Portrait photo",
                      type: "image",
                      options: { hotspot: true },
                      validation: (r) => r.required(),
                    }),
                  ],
                  preview: {
                    select: { title: "name", subtitle: "role", media: "image" },
                  },
                },
              ],
            }),
          ],
          preview: {
            select: {
              size: "size",
              firstName: "pool.0.name",
              media: "pool.0.image",
            },
            prepare({ size, firstName, media }) {
              return {
                title: firstName ?? "(empty slot)",
                subtitle: size ? `Size: ${size}` : undefined,
                media,
              };
            },
          },
        },
      ],
    }),
  ],

  preview: {
    prepare: () => ({ title: "Home — Hero Section" }),
  },
});
