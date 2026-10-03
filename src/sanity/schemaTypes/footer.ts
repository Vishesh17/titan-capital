import { defineField, defineType } from "sanity";

/**
 * Global Footer — singleton appearing on every page.
 *
 * Editorial text, the navigation columns and every social URL are
 * CMS-controlled. What stays in code is the things that are genuinely
 * engineering: the layout, the icon artwork, the watermark and how the
 * newsletter form behaves.
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

    /* ─────────── SOCIAL ───────────
       All seven profile links. The icons are drawn in code — only where they
       POINT is editable here, which is the part that actually changes.

       THE THREE ORIGINALS KEEP A FALLBACK, THE OTHER FOUR DO NOT, and the
       difference is deliberate. LinkedIn, X and YouTube have been the same
       accounts since launch, so if this document is empty or Sanity cannot be
       reached the footer still shows them, exactly like the address and the
       copyright line do.

       Instagram, Substack, Facebook and Reddit have no established account to
       fall back to, so an empty field there means no icon at all — better than
       a dead link to a profile that may not exist. Filling one in is all it
       takes to make its icon appear; the glyph is already in the code.

       Consequence worth knowing: clearing LinkedIn, X or YouTube here does
       NOT remove the icon, it just reverts it to the built-in URL. Removing
       one of those three is a code change. */
    defineField({
      name: "linkedinUrl",
      title: "LinkedIn",
      description:
        'Full profile URL. Leave empty to use the built-in "https://www.linkedin.com/company/titan-capital-vc/".',
      type: "url",
      validation: (r) =>
        r.uri({ scheme: ["http", "https"] }).error("Use a full URL starting with https://"),
    }),
    defineField({
      name: "twitterUrl",
      title: "X (Twitter)",
      description:
        'Full profile URL. Leave empty to use the built-in "https://twitter.com/TitanCapitalVC".',
      type: "url",
      validation: (r) =>
        r.uri({ scheme: ["http", "https"] }).error("Use a full URL starting with https://"),
    }),
    defineField({
      name: "youtubeUrl",
      title: "YouTube",
      description:
        'Full channel URL. Leave empty to use the built-in "https://www.youtube.com/@TitanCapitalVC".',
      type: "url",
      validation: (r) =>
        r.uri({ scheme: ["http", "https"] }).error("Use a full URL starting with https://"),
    }),
    defineField({
      name: "instagramUrl",
      title: "Instagram",
      description:
        'Full profile URL, e.g. "https://www.instagram.com/titancapitalvc/". Leave empty and NO Instagram icon is shown — this one has no built-in fallback.',
      type: "url",
      validation: (r) =>
        r.uri({ scheme: ["http", "https"] }).error("Use a full URL starting with https://"),
    }),
    defineField({
      name: "substackUrl",
      title: "Substack",
      description:
        'Full publication URL, e.g. "https://titancapital.substack.com". Leave empty and NO Substack icon is shown.',
      type: "url",
      validation: (r) =>
        r.uri({ scheme: ["http", "https"] }).error("Use a full URL starting with https://"),
    }),
    defineField({
      name: "facebookUrl",
      title: "Facebook",
      description:
        'Full page URL, e.g. "https://www.facebook.com/titancapitalvc". Leave empty and NO Facebook icon is shown.',
      type: "url",
      validation: (r) =>
        r.uri({ scheme: ["http", "https"] }).error("Use a full URL starting with https://"),
    }),
    defineField({
      name: "redditUrl",
      title: "Reddit",
      description:
        'Full profile or subreddit URL, e.g. "https://www.reddit.com/user/titancapital". Leave empty and NO Reddit icon is shown.',
      type: "url",
      validation: (r) =>
        r.uri({ scheme: ["http", "https"] }).error("Use a full URL starting with https://"),
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
