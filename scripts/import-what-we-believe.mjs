/**
 * One-shot Sanity import — What We Believe section.
 *
 *   USAGE:
 *     node --env-file=.env.local scripts/import-what-we-believe.mjs
 *
 *   WHAT IT DOES:
 *     Creates (or replaces) the singleton "whatWeBelieve" document.
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
      "  Run with: node --env-file=.env.local scripts/import-what-we-believe.mjs"
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

const BELIEFS = [
  {
    title: "Founder-First, Always",
    description:
      "We back people before we back markets. Great founders always figure it out, and we help them do that.",
  },
  {
    title: "Conviction Over Consensus",
    description:
      "The best companies look obvious only in hindsight. We make decisions on first principles, not on what is already crowded or consensus-driven.",
  },
  {
    title: "Built For Endurance",
    description:
      "We are not chasing the next round. We are building partnerships that compound over a decade, through every market, every cycle.",
  },
];

const DOC_ID = "whatWeBelieve-singleton";

function makeKey(seed, i) {
  return `${seed.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-${i}`;
}

async function main() {
  console.log("→ Writing whatWeBelieve document...\n");

  const beliefs = BELIEFS.map((b, i) => ({
    _key: makeKey(b.title, i),
    _type: "beliefItem", // MUST match the inline object name in the schema
    title: b.title,
    description: b.description,
  }));

  const doc = {
    _id: DOC_ID,
    _type: "whatWeBelieve",
    headingFirst: "What",
    headingSecond: "We Believe",
    beliefs,
  };

  const result = await client.createOrReplace(doc);

  console.log(`✓ Document written: ${result._id}`);
  console.log(`  ${beliefs.length} beliefs populated.`);
  console.log("\nDocument is live (created in the published perspective).");
  console.log("Refresh / on your dev server to see it.\n");
}

main().catch((err) => {
  console.error("\n✗ Import failed:", err);
  process.exit(1);
});
