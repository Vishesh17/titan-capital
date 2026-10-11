import { defineField, defineType } from "sanity";

/**
 * /portfolio — the four-metric stats bar under the hero. Singleton.
 *
 * IT WAS NEVER WIRED TO SANITY. The four figures were a `const stats = [...]`
 * at the top of the component, so changing "300+ Companies Backed" meant a
 * code edit and a deploy. Everything here is exactly what it was already
 * showing, now editable.
 *
 * HOW THE FIGURES ANIMATE, because it constrains what to type. Each value is
 * split into a leading run, a run of digits, and a trailing run — so "$4B+"
 * becomes "$" + "4" + "B+" and only the digits roll, on a suitcase-lock
 * column. "300+" and "7" work the same way.
 *
 * A value with no digits at all ("Many") simply sits still, and a value with
 * digits on both sides of a separator ("1,200") rolls the digits and draws the
 * comma static. Neither breaks, but a single run of digits is what the
 * animation was designed around and what reads best.
 */
export const portfolioStats = defineType({
  name: "portfolioStats",
  title: "Portfolio — Stats bar",
  type: "document",

  fields: [
    defineField({
      name: "stats",
      title: "Stats",
      description:
        "The row under the portfolio hero. FOUR is the designed count — the row is a single line on desktop and a 2x2 grid on mobile, so four fills both exactly. Three or five still render, but the mobile grid leaves a hole. Leave the list empty to keep the four the site shipped with.",
      type: "array",
      of: [
        {
          type: "object",
          name: "portfolioStat",
          fields: [
            defineField({
              name: "value",
              title: "Figure",
              description:
                'The big number, e.g. "300+", "7", "$4B+". Digits roll on a counter; anything around them is drawn static.',
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "label",
              title: "Label",
              description: 'The line underneath, e.g. "Companies Backed".',
              type: "string",
              validation: (r) => r.required(),
            }),
          ],
          preview: {
            select: { title: "value", subtitle: "label" },
          },
        },
      ],
      validation: (r) => r.max(6),
    }),
  ],

  preview: {
    select: { stats: "stats" },
    prepare: ({ stats }) => ({
      title: "Portfolio — Stats bar",
      subtitle: Array.isArray(stats) && stats.length
        ? stats.map((s: { value?: string }) => s?.value).filter(Boolean).join("  ·  ")
        : "Using the built-in four",
    }),
  },
});
