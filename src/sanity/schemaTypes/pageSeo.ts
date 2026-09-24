import { defineField, defineType } from "sanity";

/**
 * Per-page SEO override.
 *
 * One document per page (Portfolio, Winners Fund, etc.). Anything left
 * blank falls through to `siteSeo` defaults. The `pageKey` is the stable
 * lookup key used by Next.js's generateMetadata() in each page.tsx — do
 * NOT change it after launch.
 */
export const pageSeo = defineType({
  name: "pageSeo",
  title: "SEO — Per-Page Overrides",
  type: "document",

  fields: [
    defineField({
      name: "pageKey",
      title: "Page",
      description:
        "Which page on the website this SEO applies to. Do not change after launch — the code looks pages up by this key.",
      type: "string",
      options: {
        /* THESE VALUES ARE THE KEYS THE PAGES ACTUALLY ASK FOR — each one is
           the exact string passed to buildMetadata() in that page's
           page.tsx, so they are matched character for character, case
           included. Four pages were missing from this list entirely (Blogs,
           Indicorns, Titan Ecosystem, Founders' Stories) and so could never
           be given SEO at all, and "ourStory" did not match the "ourstory"
           the page asks for. Both faults showed the same way: the page fell
           back to the sitewide default title.

           The casing is inconsistent — "winnersFund" beside "ourstory" —
           and it is left that way on purpose. These are lookup keys, not
           labels, and the documents already published in the Studio carry
           them; tidying the spelling would orphan those documents. */
        list: [
          { title: "Home", value: "home" },
          { title: "Portfolio", value: "portfolio" },
          { title: "Our Story", value: "ourstory" },
          { title: "Meet The Team", value: "ourteam" },
          { title: "Founders' Stories", value: "foundersstory" },
          { title: "Blogs & News", value: "blogs" },
          { title: "Indicorns", value: "indicorns" },
          { title: "Titan Ecosystem", value: "titanEcosystem" },
          { title: "Get Investment", value: "getinvestment" },
          { title: "Privacy Policy", value: "privacy" },
          { title: "Grievance Redressal", value: "grievance" },
          { title: "Winners Fund (page is off)", value: "winnersFund" },
          { title: "Titan Seed Fund (page is off)", value: "titanSeedFund" },
        ],
        layout: "dropdown",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "metaTitle",
      title: "Browser tab title",
      description:
        'What shows in the browser tab and as the headline in Google results. Leave blank to use the sitewide default. e.g. "Portfolio"',
      type: "string",
    }),
    defineField({
      name: "metaDescription",
      title: "Page description",
      description:
        "The snippet Google shows under your link. ~150 characters works best. Leave blank to use the sitewide default.",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "keywords",
      title: "Keywords",
      description:
        "Search terms for THIS page, e.g. \"seed funding India\", \"pre-seed investors\". Leave empty and the page uses the sitewide keyword list instead. Type a term and press Enter.",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "shareImage",
      title: "Share image (OG image)",
      description:
        "Shown when someone shares THIS page on WhatsApp / LinkedIn / Twitter. 1200×630 pixels. Leave blank to use the sitewide default.",
      type: "image",
      options: { hotspot: true },
    }),
  ],

  preview: {
    select: { title: "pageKey", subtitle: "metaTitle" },
    prepare: ({ title, subtitle }) => ({
      title: `${title ?? "(no page)"} — SEO`,
      subtitle: subtitle ?? "(uses sitewide default)",
    }),
  },
});
