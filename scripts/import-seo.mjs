/**
 * One-shot Sanity import — SEO defaults + per-page overrides.
 *
 *   USAGE:
 *     node scripts/import-seo.mjs
 *     (env vars must be loaded — e.g. `set -a; source .env.local; set +a` first)
 *
 *   Seeds:
 *     - one "siteSeo" singleton (sitewide defaults)
 *     - one "pageSeo" doc per known page (portfolio, winnersFund, etc.)
 *
 *   Values mirror the previous hardcoded metadata in layout.tsx and each
 *   page.tsx so nothing changes visually after the migration.
 *
 *   Safe to re-run — uses createOrReplace with stable IDs.
 */

import { createClient } from "@sanity/client";

const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error(
    "✗ SANITY_API_WRITE_TOKEN missing.\n" +
      "  Run with env loaded: set -a; source .env.local; set +a; node scripts/import-seo.mjs"
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

const SITE_DEFAULTS = {
  _id: "siteSeo-singleton",
  _type: "siteSeo",
  siteName: "Titan Capital",
  siteUrl: "https://titan-capital-puce.vercel.app",
  defaultTitle: "Titan Capital",
  defaultDescription:
    "Titan Capital invests behind world class entrepreneurs looking to create wide-scale positive impact on India and the World.",
  keywords: [
    "Titan Capital",
    "venture capital",
    "early stage",
    "seed funding",
    "Kunal Bahl",
    "Rohit Bansal",
    "startup investment",
    "India VC",
  ],
};

const PAGE_OVERRIDES = [
  {
    _id: "pageSeo-home",
    _type: "pageSeo",
    pageKey: "home",
    metaTitle: "Titan Capital",
    metaDescription:
      "Titan Capital invests behind world class entrepreneurs looking to create wide-scale positive impact on India and the World.",
  },
  {
    _id: "pageSeo-portfolio",
    _type: "pageSeo",
    pageKey: "portfolio",
    metaTitle: "Portfolio",
    metaDescription:
      "Explore Titan Capital's portfolio of 200+ companies including Razorpay, OLA, Urban Company, Mamaearth, and more.",
  },
  {
    _id: "pageSeo-winnersFund",
    _type: "pageSeo",
    pageKey: "winnersFund",
    metaTitle: "Winners Fund",
    metaDescription:
      "Titan Capital Winners Fund — a SEBI-registered Category II AIF investing in high-growth portfolio companies.",
  },
  {
    _id: "pageSeo-titanSeedFund",
    _type: "pageSeo",
    pageKey: "titanSeedFund",
    metaTitle: "Titan Seed Fund",
    metaDescription:
      "Titan Seed Fund backs exceptional founders at the earliest stages. Learn what we look for and why founders choose Titan.",
  },
  {
    _id: "pageSeo-getinvestment",
    _type: "pageSeo",
    pageKey: "getInvestment",
    metaTitle: "Get Investment",
    metaDescription:
      "Apply for early stage funding from Titan Capital. Submit your pitch and connect with Kunal Bahl & Rohit Bansal.",
  },
  {
    _id: "pageSeo-privacy",
    _type: "pageSeo",
    pageKey: "privacy",
    metaTitle: "Privacy Policy",
    metaDescription:
      "Read the privacy policy of Titan Winners Fund Management LLP — how we collect, use and disclose information provided by users of the Titan Capital website.",
  },
  {
    _id: "pageSeo-grievance",
    _type: "pageSeo",
    pageKey: "grievance",
    metaTitle: "Grievance Redressal",
    metaDescription:
      "Titan Capital's grievance redressal mechanism — escalation channels, SEBI SCORES, ODR, and fund-level details for Winners Fund I and II.",
  },
];

async function main() {
  console.log("→ Writing siteSeo singleton...");
  await client.createOrReplace(SITE_DEFAULTS);
  console.log(`  ✓ ${SITE_DEFAULTS._id}\n`);

  console.log(`→ Writing ${PAGE_OVERRIDES.length} pageSeo docs...`);
  for (const doc of PAGE_OVERRIDES) {
    await client.createOrReplace(doc);
    console.log(`  ✓ ${doc._id}  (pageKey: ${doc.pageKey})`);
  }

  console.log("\nDone. Open /studio → 'SEO — Sitewide Defaults' or 'SEO — Per-Page Overrides' to edit.\n");
}

main().catch((err) => {
  console.error("\n✗ Import failed:", err);
  process.exit(1);
});
