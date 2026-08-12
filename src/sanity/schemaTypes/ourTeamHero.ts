import { defineField, defineType } from "sanity";

export const ourTeamHero = defineType({
  name: "ourTeamHero",
  title: "Our Team — Hero",
  type: "document",
  fields: [
    defineField({
      name: "titleLine1",
      title: "Title Line 1",
      type: "string",
      description: 'e.g., "Builders"',
    }),
    defineField({
      name: "titleLine2",
      title: "Title Line 2 (Highlighted)",
      type: "string",
      description: 'e.g., "Backing"',
    }),
    defineField({
      name: "titleLine3",
      title: "Title Line 3",
      type: "string",
      description: 'e.g., "Builders"',
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "members",
      title: "Team Member Images",
      type: "array",
      of: [
        {
          type: "image",
          /* Framing lives on the image itself rather than wrapping it in a new
             object type — that keeps every existing entry valid instead of
             invalidating the array on the next deploy. */
          fields: [
            defineField({
              name: "offsetX",
              title: "Nudge horizontally (%)",
              description:
                "Shifts which part of the photo shows in the card. Negative = show more of the left, positive = more of the right. 0 is centred; try ±10-30.",
              type: "number",
              initialValue: 0,
              validation: (Rule) => Rule.min(-50).max(50),
            }),
            defineField({
              name: "offsetY",
              title: "Nudge vertically (%)",
              description:
                "Negative = show more of the top (usually what you want for faces), positive = more of the bottom. 0 is centred; try ±5-15. Use this to line every face's eyes up at the same height.",
              type: "number",
              initialValue: 0,
              validation: (Rule) => Rule.min(-50).max(50),
            }),
            defineField({
              name: "scale",
              title: "Zoom",
              description:
                "1.1 is the default. Raise it for a photo taken from far away so the face fills as much of the card as everyone else's; lower it for a tight close-up. This is the control for head SIZE — the two nudges above only slide the photo around, they cannot make a small face bigger. Zooming also gives the nudges more room to move.",
              type: "number",
              initialValue: 1.1,
              validation: (Rule) => Rule.min(1).max(2.5),
            }),
          ],
        },
      ],
      description:
        "Upload 15 images to fill the desktop grid exactly — 7 across the top row, then 4 and 4 beside the heading. Fewer works: the remaining cards cycle back through the images you have provided, so faces repeat. Mobile shows the first 10.",
      validation: (Rule) => Rule.max(15),
    }),
  ],
});