import { defineField, defineType } from "sanity";

/**
 * Reusable object type — one entry in any of the three Our Team
 * arrays (corporate / seed / winnerFund). Defining it once means
 * the Studio UI stays consistent across all three and we can add
 * fields (e.g. bio, location) in one place later.
 */
export const teamMember = defineType({
  name: "teamMember",
  title: "Team Member",
  type: "object",

  fields: [
    defineField({
      name: "name",
      title: "Full name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug (URL — /ourteam/<slug>)",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (r) => r.required().error("Slug is required for the detail page URL"),
    }),
    defineField({
      name: "title",
      title: "Job title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "image",
      title: "Photo",
      description:
        "Square photo, ideally on a plain or simple background. Renders as monochrome by default; colour appears on hover.",
      type: "image",
      options: { hotspot: true },
    }),
    /* ── Framing inside the blob ──────────────────────────────────────────
       The photo is clipped by an organic blob shape. Because every portrait
       is cropped differently, these three let you position each face inside
       that blob without re-cutting the image. They apply to BOTH the team
       grid and the member's detail page.

       Scaling is anchored at the bottom-centre, so the subject stays planted
       on the blob's base as you size it. Offsets are percentages of the photo
       frame, so the framing holds at every screen size — and they are applied
       after the scale, so changing one doesn't shift the other.
       ─────────────────────────────────────────────────────────────────────── */
    defineField({
      name: "imageScale",
      title: "Photo zoom (1 = default)",
      description:
        "Zooms the photo inside the blob. Above 1 crops in on the face, below 1 pulls back. Try 0.9–1.4.",
      type: "number",
      initialValue: 1,
      validation: (r) => r.min(0.3).max(3),
    }),
    defineField({
      name: "imageOffsetX",
      title: "Photo nudge — horizontal (%)",
      description:
        "Positive moves the photo right, negative left. 0 for most. Try ±5–25.",
      type: "number",
      initialValue: 0,
      validation: (r) => r.min(-100).max(100),
    }),
    defineField({
      name: "imageOffsetY",
      title: "Photo nudge — vertical (%)",
      description:
        "Positive moves the photo down, negative up. 0 for most. Try ±5–25.",
      type: "number",
      initialValue: 0,
      validation: (r) => r.min(-100).max(100),
    }),

    defineField({
      name: "bio",
      title: "Bio (shown on the detail page)",
      type: "text",
      rows: 6,
    }),
    defineField({
      name: "linkedinUrl",
      title: "LinkedIn URL",
      type: "url",
    }),
    defineField({
      name: "emailUrl",
      title: "Email (mailto: link or email address)",
      description: 'Either a "mailto:foo@bar.com" URL or just "foo@bar.com".',
      type: "string",
    }),
    defineField({
      name: "twitterUrl",
      title: "X / Twitter URL",
      type: "url",
    }),
  ],

  preview: {
    select: { title: "name", subtitle: "title", media: "image" },
  },
});
