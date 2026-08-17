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
        list: [
          { title: "Home", value: "home" },
          { title: "Portfolio", value: "portfolio" },
          { title: "Winners Fund", value: "winnersFund" },
          { title: "Titan Seed Fund", value: "titanSeedFund" },
          { title: "Get Investment", value: "getInvestment" },
          { title: "Our Story", value: "ourStory" },
          { title: "Our Team", value: "ourteam" },
          { title: "Privacy Policy", value: "privacy" },
          { title: "Grievance Redressal", value: "grievance" },
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
