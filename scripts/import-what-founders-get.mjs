/**
 * One-shot Sanity import — "How We Show Up" section (whatFoundersGet).
 *
 *   USAGE:
 *     node --env-file=.env.local scripts/import-what-founders-get.mjs
 *
 *   WHAT IT DOES:
 *     Creates (or replaces) the singleton "whatFoundersGet" document with the
 *     ACCORDION shape the section reads today: a `heading` plus 6 `rows`.
 *
 *     The previous version of this script wrote the section's ORIGINAL shape
 *     — headingFirst / headingSecond / features[] of `featureItem`. The
 *     component, schema and GROQ query were all rewritten for the accordion,
 *     but this script never was, so the live document still held the old
 *     fields. The query therefore returned nulls and the section quietly
 *     rendered from its hardcoded FALLBACK_ROWS — editing in the Studio
 *     changed nothing on the page. Running this once fixes that.
 *
 *     createOrReplace REPLACES the whole document, so the stale
 *     headingFirst / headingSecond / features fields are dropped with it.
 *
 *   SHAPE — must stay in step with:
 *     schema : src/sanity/schemaTypes/whatFoundersGet.ts  (object name
 *              `howWeShowUpRow` — the _type below must match it)
 *     query  : whatFoundersGetQuery in src/sanity/lib/queries.ts
 *     client : HowWeShowUpRow in WhatFoundersGetClient.tsx
 *
 *   No images — pure text — so this runs in well under a second.
 *
 *   REQUIRES:
 *     SANITY_API_WRITE_TOKEN in .env.local (Editor scope)
 */

import { createClient } from "@sanity/client";

const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error(
    "\u2717 SANITY_API_WRITE_TOKEN missing.\n" +
      "  Run with: node --env-file=.env.local scripts/import-what-founders-get.mjs"
  );
  process.exit(1);
}

const client = createClient({
  projectId: "suel5z6g",
  dataset: "production",
  apiVersion: "2026-06-19",
  token,
  useCdn: false,
});

const DOC_ID = "whatFoundersGet-singleton";
const HEADING = "How We Show Up";

/* Seeded from the component's FALLBACK_ROWS, which is what the live site has
   actually been rendering. Importing these means the Studio starts from the
   copy already on the page rather than from something older. */
const ROWS = [
  {
    title: "The Ecosystem",
    shortHeading: "Global Founder Network",
    shortDesc: "Access to a 15-year network: 650+ founders, corporate partners and domain experts",
    longHeading: "Who You Can Reach",
    longDesc: "The Titan network represents 15 years of cultivated relationships, trust, and institutional knowledge across different sectors. Being part of the Titan portfolio gives you access to that collective intelligence.",
    valueTitle: "Strategic Value",
    valueBullets: [
      "Targeted Access: Warm introductions to enterprise customers, global corporate partners, and institutional investors.",
      "Titan Expert Network (TEN):  Seasoned operators available for 1:1 sessions on GTM strategy and technical architecture.",
      "Founder Community: A peer group of 650+ founders, often the fastest path to solving a hard operational problem.",
    ],
  },
  {
    title: "Founders' Playbook",
    shortHeading: "Operational Rigour at Scale",
    shortDesc: "Frameworks drawn from operators who have scaled companies to IPO",
    longHeading: "What We've Already Learned",
    longDesc: "We draw on the collective experience of our team and 650+ portfolio founders to shorten the learning curve, sharing the frameworks that have already taken companies from inception to public markets.",
    valueTitle: "Strategic Value",
    valueBullets: [
      "GTM Strategy: Proven approaches for category entry, pricing, and distribution.",
      "Brand & Positioning: Frameworks for building brand equity that compounds into market share.",
      "Operational Pivots: How to navigate the hard calls, from redirecting strategy to reallocating resources.",
    ],
  },
  {
    title: "Fundraising",
    shortHeading: "Fundraising Navigation",
    shortDesc: "End-to-end fundraising support from targeting to close",
    longHeading: "Raising Your Next Round",
    longDesc: "Raising capital takes more than access. It takes the right positioning. Our team helps you walk into every institutional conversation prepared.",
    valueTitle: "Strategic Value",
    valueBullets: [
      "Introductions: Targeted introductions to growth-stage funds calibrated to your sector, stage, and performance metrics.",
      "Pitch Preparation: Deep-dive sessions to stress-test assumptions and sharpen the narrative before it's in front of an investor.",
      "Staying Ready: Inputs on keeping your data room and metrics investor-ready, so nothing slows the round down.",
    ],
  },
  {
    title: "Talent & Hiring",
    shortHeading: "High-Signal Talent Acquisition",
    shortDesc: "Warm introductions to 20,000+ professionals, without the traditional funnel",
    longHeading: "Finding Your First Ten",
    longDesc: "Exceptional talent is one of the hardest things to find at speed. We treat hiring as seriously as everything else we do for our portfolio companies.",
    valueTitle: "Strategic Value",
    valueBullets: [
      "Titan Job Network: Direct access to a 20,000+ member community of vetted professionals.",
      "Senior Leadership Intros: Warm introductions to pre-vetted CXO and VP-level talent.",
      "Advisors: Connections to board-level advisors with specific, relevant operating experience.",
    ],
  },
  {
    title: "Firefighting",
    shortHeading: "Crisis Counsel",
    shortDesc: "Objective counsel for the hardest moments",
    longHeading: "When Things Break",
    longDesc: "Real partnership shows up most in the tough moments. We have been through enough of them to offer steady, objective counsel when the stakes are the highest.",
    valueTitle: "Strategic Value",
    valueBullets: [
      "Second Opinion: An outside perspective before sensitive board updates or high-stakes announcements.",
      "Hard Call Resolution: Guidance on co-founder disputes, restructuring and other issues that require direct and experienced resolution.",
      "Responsive Partnership: Direct access to leadership when it matters most, outside of formal board cycles.",
    ],
  },
  {
    title: "Follow-On Capital",
    shortHeading: "Capital That Stays",
    shortDesc: "High-conviction capital, concentrated in our best companies",
    longHeading: "Backing You Again",
    longDesc: "When a Titan-backed company breaks out, we back it further, from seed through early-growth, with the same conviction that got us in.",
    valueTitle: "Strategic Value",
    valueBullets: [
      "Growth Commitment: Meaningful capital deployed at the moment the company is scaling fastest.",
      "Efficiency: Streamlined processes that leverage existing diligence and relationships, so rounds move faster.",
      "Market Signal: A high-confidence endorsement to the market that initial investors continue to believe in the trajectory.",
    ],
  }
];

/** Stable per-row key so re-running does not churn array keys in the Studio. */
function rowKey(title, i) {
  const slug = title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug}-${i}`;
}

async function main() {
  console.log("\u2192 Writing whatFoundersGet document...\n");

  const rows = ROWS.map((r, i) => ({
    _key: rowKey(r.title, i),
    _type: "howWeShowUpRow", // MUST match the object name in the schema
    ...r,
  }));

  const doc = {
    _id: DOC_ID,
    _type: "whatFoundersGet",
    heading: HEADING,
    rows,
  };

  const result = await client.createOrReplace(doc);

  console.log(`\u2713 Document written: ${result._id}`);
  console.log(`  heading: "${HEADING}"`);
  console.log(`  ${rows.length} rows, ${rows.reduce((n, r) => n + r.valueBullets.length, 0)} bullets total.`);
  console.log("\nThe old headingFirst / headingSecond / features fields are gone");
  console.log("(createOrReplace swaps the whole document).");
  console.log("Refresh / on your dev server to see it.\n");
}

main().catch((err) => {
  console.error("\n\u2717 Import failed:", err);
  process.exit(1);
});
