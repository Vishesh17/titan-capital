import { defineField, defineType } from "sanity";

/**
 * Global Footer — singleton appearing on every page.
 *
 * Editorial text and the three navigation columns are CMS-controlled. What
 * stays in code is the things that are genuinely engineering: the layout, the
 * social URLs, the watermark and how the newsletter form behaves.
 *
 * THE FOOTER NAV IS DELIBERATELY ITS OWN FIELD HERE, not shared with the
 * `navbar` document. The two menus have never listed the same things — the
 * footer has an "About" column the header does not, groups its entries
 * differently, and disables a different set — so one shared list would mean
 * every edit to either menu needing to be checked against the other.
 */
export const footer = defineType({
  name: "footer",
  title: "Global — Footer",
  type: "document",

  fields: [
    defineField({
      name: "address",
      title: "Address",
      description: 'e.g. "M3M Urbana, Sector 67, Gurugram, India"',
      type: "string",
    }),
    defineField({
      name: "email",
      title: "Contact email",
      description: 'e.g. "info@titancapital.vc" (shown under the logo)',
      type: "string",
    }),
    defineField({
      name: "copyright",
      title: "Copyright text",
      description: 'e.g. "© 2026 Titan Capital. All rights reserved."',
      type: "string",
    }),
    defineField({
      name: "privacyPolicyLabel",
      title: "Privacy Policy link label",
      description: 'e.g. "Privacy Policy"',
      type: "string",
    }),
    defineField({
      name: "grievanceLabel",
      title: "Grievance Redressal link label",
      description: 'e.g. "Grievance Redressal"',
      type: "string",
    }),
    defineField({
      name: "newsletterTitle",
      title: "Newsletter form title",
      description:
        'Shown above the email input in the cream subscribe card. ' +
        'e.g. "Stay close to what founders are building and where markets are moving - with Titan Capital."',
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "newsletterPlaceholder",
      title: "Newsletter email placeholder",
      description: 'e.g. "Email Id"',
      type: "string",
    }),
    defineField({
      name: "newsletterButtonLabel",
      title: "Newsletter button label",
      description: 'e.g. "Subscribe to Newsletter"',
      type: "string",
    }),

    /* ─────────── NAVIGATION ───────────
       One column per group, one entry per link. In code this used to be three
       separate lists that had to line up by hand — the labels in one array,
       their URLs in a lookup object, and the greyed-out ones in a third set —
       so a renamed label silently lost its link. Here a link is one object
       that carries its own label, destination and state, and they cannot
       drift apart. Leave this empty and the footer falls back to exactly the
       menu that is live today. */
    defineField({
      name: "navColumns",
      title: "Footer navigation",
      description:
        "The link columns in the footer. Drag to reorder; the site shows them left to right in this order.",
      type: "array",
      of: [
        {
          type: "object",
          name: "footerNavColumn",
          title: "Column",
          fields: [
            defineField({
              name: "title",
              title: "Column heading",
              description: 'e.g. "About"',
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "links",
              title: "Links",
              type: "array",
              of: [
                {
                  type: "object",
                  name: "footerNavLink",
                  title: "Link",
                  fields: [
                    defineField({
                      name: "label",
                      title: "Label",
                      description: "The words the reader sees.",
                      type: "string",
                      validation: (r) => r.required(),
                    }),
                    defineField({
                      name: "url",
                      title: "Destination",
                      description: 'A path on this site, e.g. "/portfolio".',
                      type: "string",
                    }),
                    defineField({
                      name: "disabled",
                      title: "Not live yet",
                      description:
                        "Shows the label greyed out and unclickable, rather than removing it. Use while a page is being built.",
                      type: "boolean",
                      initialValue: false,
                    }),
                  ],
                  preview: {
                    select: { title: "label", subtitle: "url", disabled: "disabled" },
                    prepare: ({ title, subtitle, disabled }) => ({
                      title: disabled ? `${title} — not live` : title,
                      subtitle,
                    }),
                  },
                },
              ],
            }),
          ],
          preview: {
            select: { title: "title", links: "links" },
            prepare: ({ title, links }) => ({
              title,
              subtitle: `${Array.isArray(links) ? links.length : 0} link(s)`,
            }),
          },
        },
      ],
    }),
  ],

  preview: { prepare: () => ({ title: "Global — Footer" }) },
});
