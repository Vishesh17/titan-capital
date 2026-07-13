import { defineField, defineType } from "sanity";

/**
 * Home — "What Our Founders Say" section.
 * Singleton document. Mirrors what FoundersTestimonialClient.tsx renders:
 *   - Top heading ("What Our" + italic-highlighted "Founders Say")
 *   - Horizontal-scrolling testimonial cards (flippable on hover)
 *   - Bottom heading ("We're Listening." + "Tell Us What You're Building.")
 *   - Get Investment CTA
 */
export const foundersTestimonial = defineType({
  name: "foundersTestimonial",
  title: "Home — Founders Testimonial Section",
  type: "document",

  fields: [
    /* ─────────── Top heading ─────────── */
    defineField({
      name: "topHeadingFirst",
      title: "Top heading — line 1 (plain)",
      description: 'e.g. "What Our"',
      type: "string",
    }),
    defineField({
      name: "topHeadingSecond",
      title: "Top heading — line 2 (italic + highlighted)",
      description: 'e.g. "Founders Say"',
      type: "string",
    }),

    /* ─────────── Testimonial cards ─────────── */
    defineField({
      name: "testimonials",
      title: "Testimonials",
      description: "Each card flips on hover to show the quote.",
      type: "array",
      of: [
        {
          type: "object",
          name: "testimonialItem",
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
              description: 'e.g. "Cofounder, Urban Company"',
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
            defineField({
              name: "companyLogo",
              title: "Company logo",
              description: "Logo displayed at the top of the card. Will be rendered monochrome.",
              type: "image",
            }),
            defineField({
              name: "text",
              title: "Quote / Testimonial text",
              type: "text",
              rows: 6,
              validation: (r) => r.required(),
            }),
            defineField({
              name: "longText",
              title: "Quote is unusually long?",
              description: "Toggle ON when the quote is long — slightly shrinks text on mobile so it still fits the back of the card.",
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

    /* ─────────── Bottom CTA section ─────────── */
    defineField({
      name: "bottomHeadingFirst",
      title: "Bottom heading — line 1 (italic + highlighted)",
      description: 'e.g. "We\'re Listening."',
      type: "string",
    }),
    defineField({
      name: "bottomHeadingSecond",
      title: "Bottom heading — line 2 (plain)",
      description: 'e.g. "Tell Us What You\'re Building."',
      type: "string",
    }),
    defineField({
      name: "ctaLabel",
      title: "CTA button label",
      description: 'e.g. "Get Investment"',
      type: "string",
    }),
  ],

  preview: { prepare: () => ({ title: "Home — Founders Testimonial Section" }) },
});
