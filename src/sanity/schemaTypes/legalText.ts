import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * LEGAL PROSE — the editor for the Privacy Policy and Grievance Redressal
 * pages, and only those.
 *
 * WHY NOT `richText`: that type is for descriptions and labels, and it
 * deliberately carries no headings, no lists and no links — a description with
 * an H2 in it would put two heading systems on one page. Legal copy is the
 * opposite case. It is a document: it needs clause sub-headings, bulleted
 * conditions, and live mailto/SEBI links, all of which appear on these pages
 * today.
 *
 * WHY NOT `storyContent`: that one adds colours, numbered lists, drop caps and
 * a "small print" style aimed at editorial features. Handing a compliance page
 * a colour picker invites a policy clause set in brand blue.
 *
 * So this sits between the two: prose, structure and links, nothing decorative.
 */
export const legalText = defineType({
  name: "legalText",
  title: "Legal text",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      /* Named for what they do on the page, not by tag — "h2" means nothing to
         whoever is maintaining a privacy policy. */
      styles: [
        { title: "Body", value: "normal" },
        { title: "Sub-heading", value: "h2" },
        { title: "Eyebrow (small, grey, spaced)", value: "h4" },
        { title: "Lead-in (medium weight)", value: "h5" },
      ],
      lists: [{ title: "Bulleted", value: "bullet" }],
      marks: {
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Italic", value: "em" },
          { title: "Underline", value: "underline" },
        ],
        annotations: [
          {
            name: "link",
            title: "Link",
            type: "object",
            fields: [
              defineField({
                name: "href",
                title: "URL",
                description:
                  'Full URL, or "mailto:someone@titancapital.vc" for an email address.',
                type: "url",
                validation: (r) =>
                  r.uri({
                    allowRelative: true,
                    scheme: ["http", "https", "mailto", "tel"],
                  }),
              }),
            ],
          },
        ],
      },
    }),
  ],
});
