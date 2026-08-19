import { defineField, defineType } from "sanity";

/**
 * /indicorns — "What Founders Say" section. Singleton.
 *
 * Cards sit on a 3D cylinder that auto-spins; clicking a side card brings it
 * to the front. Any number of testimonials works, though beyond about five
 * the far cards are almost invisible at the back of the cylinder.
 */
export const indicornTestimonials = defineType({
  name: "indicornTestimonials",
  title: "Indicorns — Founder Testimonials",
  type: "document",

  fields: [
    defineField({
      name: "headingTop",
      title: "Heading — first line",
      description: 'e.g. "What Founders Say"',
      type: "string",
    }),
    defineField({
      name: "headingBottom",
      title: "Heading — second line",
      description: 'e.g. "About The Indicorns"',
      type: "string",
    }),
    defineField({
      name: "description",
      title: "Intro paragraph",
      type: "text",
      rows: 3,
    }),

    defineField({
      name: "testimonials",
      title: "Testimonials",
      type: "array",
      of: [
        {
          type: "object",
          name: "indicornTestimonial",
          fields: [
            defineField({
              name: "image",
              title: "Founder photo",
              description:
                "Fills the left 40% of the card, cropped from the top — so head-and-shoulders portraits work best.",
              type: "image",
              options: { hotspot: true },
              validation: (r) => r.required(),
            }),
            defineField({
              name: "quote",
              title: "Quote",
              description: "Include the surrounding quotation marks.",
              type: "text",
              rows: 5,
              validation: (r) => r.required(),
            }),
            defineField({
              name: "name",
              title: "Founder name",
              type: "string",
            }),
            defineField({
              name: "role",
              title: "Role / Company",
              description: 'e.g. "Co-founder & CEO, Mamaearth"',
              type: "string",
            }),
          ],
          preview: {
            select: { title: "name", subtitle: "role", media: "image" },
          },
        },
      ],
    }),
  ],

  preview: { prepare: () => ({ title: "Indicorns — Founder Testimonials" }) },
});
