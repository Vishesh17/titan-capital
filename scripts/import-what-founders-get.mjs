/**
 * One-shot Sanity import — "How We Show Up" / What Founders Get section.
 *
 *   USAGE:
 *     node --env-file=.env.local scripts/import-what-founders-get.mjs
 *
 *   WHAT IT DOES:
 *     Creates (or replaces) the singleton "whatFoundersGet" document.
 *     No images — pure text — so this runs in <1 second.
 *
 *   REQUIRES:
 *     SANITY_API_WRITE_TOKEN in .env.local (Editor scope)
 */

import { createClient } from "@sanity/client";

const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error(
    "✗ SANITY_API_WRITE_TOKEN missing.\n" +
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

const FEATURES = [
  {
    id: "hiring",
    title: "Hiring",
    desc: "Broadcast roles to 20,000+ community members. Warm intros to senior talent, not job board spam.",
  },
  {
    id: "network",
    title: "Network",
    desc: "650+ founders, strategic partnerships with global companies, curated expert network. A network that actually shows up.",
  },
  {
    id: "capital",
    title: "Follow-on Capital",
    desc: "Breakout companies get follow-on through the winners fund. Your earliest believers investing again.",
  },
  {
    id: "fundraising",
    title: "Fundraising",
    desc: "Warm intros to growth-stage funds, pitch preparation, term sheet guidance, and fundraising support from people who’ve seen hundreds of rounds.",
  },
  {
    id: "firefighting",
    title: "Firefighting",
    desc: "Down rounds, team disagreements, co-founder disputes, regulatory surprises. We show up when it's hard, not just when it's easy.",
  },
  {
    id: "playbook",
    title: "Industry Playbook",
    desc: "GTM frameworks, financial models, cap table guides, from founders who've actually built companies themselves.",
  },
];

const DOC_ID = "whatFoundersGet-singleton";

async function main() {
  console.log("→ Writing whatFoundersGet document...\n");

  const features = FEATURES.map((f) => ({
    _key: `${f.id}-feat`,
    _type: "featureItem", // MUST match the inline object name in the schema
    id: f.id,
    title: f.title,
    desc: f.desc,
  }));

  const doc = {
    _id: DOC_ID,
    _type: "whatFoundersGet",
    headingFirst: "How We",
    headingSecond: "Show Up",
    features,
  };

  const result = await client.createOrReplace(doc);

  console.log(`✓ Document written: ${result._id}`);
  console.log(`  ${features.length} features populated.`);
  console.log("\nDocument is live (created in the published perspective).");
  console.log("Refresh / on your dev server to see it.\n");
}

main().catch((err) => {
  console.error("\n✗ Import failed:", err);
  process.exit(1);
});
