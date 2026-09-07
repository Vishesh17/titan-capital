import { defineField, defineType } from "sanity";

/**
 * The two legal pages — /privacy-policy and /grievance-redressal.
 *
 * TWO SINGLETONS, not one type with a "which page?" switch. The Studio here
 * runs the default structure, so a shared type would show as a list an editor
 * could add to — and a second document claiming to be the privacy policy is a
 * genuinely bad failure on a compliance page. One document each, named for the
 * page, cannot go wrong that way.
 *
 * Both render through the same tabbed component, so both are fetched on both
 * routes: the tabs switch without a page load.
 */

export const privacyPolicy = defineType({
  name: "privacyPolicy",
  title: "Legal — Privacy Policy",
  type: "document",

  fields: [
    defineField({
      name: "heading",
      title: "Page heading",
      description: 'The <h1> at the top of the page. e.g. "Privacy Policy"',
      type: "string",
    }),
    defineField({
      name: "tabLabel",
      title: "Tab label",
      description:
        'Text on this page\'s tab, shown on both legal pages. e.g. "Privacy Policy"',
      type: "string",
    }),
    defineField({
      name: "body",
      title: "Policy text",
      description:
        "The whole policy. Use Sub-heading for a clause title, Bulleted for lists, and select text then the link button for an email or URL.",
      type: "legalText",
    }),
  ],

  preview: { prepare: () => ({ title: "Legal — Privacy Policy" }) },
});

/** One fund's compliance card at the foot of the Grievance page. */
const fundDetailCard = {
  type: "object" as const,
  name: "legalFundCard",
  fields: [
    defineField({
      name: "title",
      title: "Card title",
      description: 'e.g. "Fund Details — Titan Capital Winners Fund I"',
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "fundName",
      title: "Fund Name",
      description: "The sentence shown against the Fund Name row.",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "effectiveDate",
      title: "Effective Date",
      description: "Left empty renders an em dash, as it does today.",
      type: "string",
    }),
    defineField({ name: "registrationNumber", title: "Registration Number", type: "string" }),
    defineField({
      name: "registeredOffice",
      title: "Registered office of the Fund",
      type: "text",
      rows: 2,
    }),
    defineField({ name: "investmentManager", title: "Investment Manager", type: "string" }),
    defineField({ name: "trustee", title: "Trustee", type: "string" }),
    defineField({ name: "sponsor", title: "Sponsor to the Fund", type: "string" }),
  ],
  preview: { select: { title: "title", subtitle: "registrationNumber" } },
};

export const grievanceRedressal = defineType({
  name: "grievanceRedressal",
  title: "Legal — Grievance Redressal",
  type: "document",

  fields: [
    defineField({
      name: "heading",
      title: "Page heading",
      description: 'The <h1> at the top of the page. e.g. "Grievance Redressal"',
      type: "string",
    }),
    defineField({
      name: "tabLabel",
      title: "Tab label",
      description: 'Text on this page\'s tab. e.g. "Grievance Redressal"',
      type: "string",
    }),
    defineField({
      name: "body",
      title: "Page text",
      description:
        "Everything above the fund cards. Use Eyebrow for the small grey line, Sub-heading for a section title, Bulleted for the contact and exclusion lists, and the link button for the email and SEBI addresses.",
      type: "legalText",
    }),
    defineField({
      name: "funds",
      title: "Fund detail cards",
      description:
        "The white cards at the foot of the page, one per fund, in this order. SEBI registration details — check them against the fund documents before editing.",
      type: "array",
      of: [fundDetailCard],
    }),
  ],

  preview: {
    select: { funds: "funds" },
    prepare: ({ funds }) => ({
      title: "Legal — Grievance Redressal",
      subtitle: `${Array.isArray(funds) ? funds.length : 0} fund card(s)`,
    }),
  },
});
