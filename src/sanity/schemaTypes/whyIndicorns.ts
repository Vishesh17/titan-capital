import { defineField, defineType } from "sanity";

/**
 * /indicorns — "Why We Created The Indicorns?" section. Singleton.
 *
 * Two blocks: the September 2024 story (photo + copy) and the timeline
 * carousel beneath it. The timeline shows three cards at a time on desktop
 * and slides as it advances, so adding entries needs no code change.
 */
export const whyIndicorns = defineType({
  name: "whyIndicorns",
  title: "Indicorns — Why We Created",
  type: "document",

  fields: [
    /* ─────────── Headings ─────────── */
    defineField({
      name: "headingTop",
      title: "Heading — first line",
      description: 'e.g. "Why We Created"',
      type: "string",
    }),
    defineField({
      name: "headingBottom",
      title: "Heading — second line",
      description: 'e.g. "The Indicorns?"',
      type: "string",
    }),

    /* ─────────── Story block ─────────── */
    defineField({
      name: "storyLabel",
      title: "Story — date label",
      description: 'e.g. "September 2024"',
      type: "string",
    }),
    defineField({
      name: "storyImage",
      title: "Story — photo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "storyParagraphs",
      title: "Story — paragraphs (DESKTOP)",
      description:
        "One entry per paragraph. Shown from the md breakpoint upwards.",
      type: "array",
      of: [{ type: "text", rows: 4 }],
    }),
    defineField({
      name: "storyParagraphsMobile",
      title: "Story — paragraphs (MOBILE)",
      description:
        "Deliberately separate from the desktop copy, which is currently worded differently. Leave empty to reuse the desktop paragraphs.",
      type: "array",
      of: [{ type: "text", rows: 4 }],
    }),

    /* ─────────── Timeline ─────────── */
    defineField({
      name: "timeline",
      title: "Timeline entries",
      description:
        "Three show at once on desktop; the rail slides as it auto-advances, and wraps back to the first. Add as many as you like.",
      type: "array",
      of: [
        {
          type: "object",
          name: "indicornTimelineEntry",
          fields: [
            defineField({
              name: "date",
              title: "Date label",
              description: 'e.g. "October 2024" or "2026"',
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "title",
              title: "Title",
              description:
                "Press Enter for a second line — line breaks are preserved.",
              type: "text",
              rows: 2,
              validation: (r) => r.required(),
            }),
            defineField({
              name: "desc",
              title: "Description",
              type: "text",
              rows: 4,
            }),
            defineField({
              name: "statNumber",
              title: "Stat — big number",
              description:
                'e.g. "186". Leave the three stat fields empty for an entry with no stat block.',
              type: "string",
            }),
            defineField({
              name: "statLabel",
              title: "Stat — label beside the number",
              description:
                'e.g. "Companies\nRecognized". Line breaks are preserved.',
              type: "text",
              rows: 2,
            }),
            defineField({
              name: "statSub",
              title: "Stat — caption underneath",
              description: "Line breaks are preserved.",
              type: "text",
              rows: 2,
            }),
          ],
          preview: {
            select: { title: "date", subtitle: "title" },
          },
        },
      ],
    }),
  ],

  preview: { prepare: () => ({ title: "Indicorns — Why We Created" }) },
});
