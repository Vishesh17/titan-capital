import { defineField, defineType } from "sanity";

/**
 * /indicorns — page hero. Singleton.
 *
 * The folded "letter" card that unfolds as the page scrolls. The three body
 * panels map 1:1 to the three folds, top to bottom, so reordering them here
 * reorders the fold sequence on the page.
 */
export const indicornsHero = defineType({
  name: "indicornsHero",
  title: "Indicorns — Hero (folded card)",
  type: "document",

  fields: [
    /* ─────────── Card face ─────────── */
    defineField({
      name: "headingPrefix",
      title: "Heading — text before the wordmark",
      description: 'e.g. "What Are". The indicorns wordmark image sits after it.',
      type: "string",
    }),
    defineField({
      name: "wordmark",
      title: "Wordmark image (\"indicorns\")",
      description:
        "The coloured Hindi-styled graphic beside the heading. Transparent PNG.",
      type: "image",
      options: { hotspot: true },
    }),

    /* ─────────── Fold 1 ─────────── */
    defineField({
      name: "panelOne",
      title: "Fold 1 — opening paragraph",
      type: "text",
      rows: 5,
    }),

    /* ─────────── Fold 2 ─────────── */
    defineField({
      name: "panelTwo",
      title: "Fold 2 — the question",
      description: "The short, darker middle panel.",
      type: "text",
      rows: 3,
    }),

    /* ─────────── Fold 3 ─────────── */
    defineField({
      name: "panelThreeIntro",
      title: "Fold 3 — line above the criteria",
      description: 'e.g. "The answer became Indicorn — a company that is"',
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "criteria",
      title: "Fold 3 — criteria bullets",
      description:
        "Each bullet is split into three parts so the middle one can carry the blue highlight chip. Leave a part empty if a bullet doesn't need it.",
      type: "array",
      of: [
        {
          type: "object",
          name: "indicornCriterion",
          fields: [
            defineField({
              name: "before",
              title: "Text before the highlight",
              description: 'e.g. "Founded in"',
              type: "string",
            }),
            defineField({
              name: "highlight",
              title: "Highlighted text (blue chip)",
              description: 'e.g. "India within the last 15 years"',
              type: "string",
            }),
            defineField({
              name: "after",
              title: "Text after the highlight",
              description: 'e.g. "— building a business that sustains itself"',
              type: "string",
            }),
          ],
          preview: {
            select: { title: "highlight", subtitle: "before" },
          },
        },
      ],
    }),
  ],

  preview: { prepare: () => ({ title: "Indicorns — Hero (folded card)" }) },
});
