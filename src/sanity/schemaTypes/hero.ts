import { defineField, defineType } from "sanity";

/**
 * Home page — Hero section. Singleton: only ONE Hero document should ever exist.
 *
 * Field shape mirrors what HeroClient.tsx renders:
 *   - Two-line headline with one italic emphasis word in line 2
 *   - Subtitle paragraph
 *   - Flat array of founder cards. Position 4 (0-indexed) is the visual
 *     anchor of the fanned deck and the first frame of the slideshow —
 *     put the Titan Capital logo entry there and toggle "Render as logo".
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
      name: "founders",
      title: "Founder cards",
      description:
        "One entry per card. The card at position 5 (index 4) is the visual anchor of the fanned deck and the first frame of the slideshow — place the Titan Capital logo there and turn on 'Render as logo'. Use exactly 9 entries.",
      type: "array",
      validation: (r) =>
        r
          .min(8)
          .max(9)
          .error("Use 8 or 9 entries — 9 works best (logo at position 5)."),
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
              description:
                'e.g. "Co-Founder, Urban Company". Leave blank for the logo card.',
              type: "string",
            }),
            defineField({
              name: "image",
              title: "Portrait photo (or logo image)",
              type: "image",
              options: { hotspot: true },
              validation: (r) => r.required(),
            }),
            defineField({
              name: "isLogo",
              title: "Render as logo (contain, no grayscale)",
              description:
                "Turn ON for the Titan Capital anchor card so its logo isn't cropped or greyed.",
              type: "boolean",
              initialValue: false,
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
    prepare: () => ({ title: "Home — Hero Section" }),
  },
});
