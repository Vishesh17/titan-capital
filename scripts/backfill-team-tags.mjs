/**
 * Fill the `tags` field on team members.
 *
 *   USAGE:
 *     node --env-file=.env.local scripts/backfill-team-tags.mjs --dry   # preview
 *     node --env-file=.env.local scripts/backfill-team-tags.mjs         # apply
 *
 * Backfill only. It reads the ourTeam document, spreads each member object
 * through untouched and sets `tags` on the named ones — photo, framing, bio,
 * socials, slug and _key all pass through by construction. A member not named
 * below is written back byte-for-byte as it was read.
 *
 * Refuses to write if any listed name matches no member, so a typo cannot
 * quietly leave someone without their tags. Matching is on the normalised
 * name, and a name that matches more than one member is an error rather than
 * a guess.
 */

import { createClient } from "@sanity/client";

const DRY = process.argv.includes("--dry");

const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error("✗ SANITY_API_WRITE_TOKEN missing. Run with --env-file=.env.local");
  process.exit(1);
}

const client = createClient({
  projectId: "suel5z6g",
  dataset: "production",
  apiVersion: "2026-06-19",
  token,
  useCdn: false,
  // Drafts too: Studio edits live on a draft, and a published-only write would
  // be invisible to anyone with the document open.
  perspective: "raw",
});

const TECH = ["AI", "SaaS", "Enterprise & B2B", "FinTech", "Frontier Tech"];
const CONSUMER = ["Consumer Tech", "Marketplaces", "Brands", "B2B Services"];

/** Keyed on a distinctive part of the name, matched case-insensitively. */
const ASSIGNMENTS = [
  { match: "manik", tags: TECH },
  { match: "geetansh", tags: TECH },
  { match: "pramit", tags: TECH },
  { match: "utpal", tags: CONSUMER },
  { match: "chiragh", tags: CONSUMER },
  { match: "aditya", tags: CONSUMER },
];

const GROUPS = ["corporateTeam", "seedTeam", "winnerFundTeam"];
const norm = (s) => (s || "").toLowerCase();

const docs = await client.fetch(
  `*[_type == "ourTeam"]{ _id, corporateTeam, seedTeam, winnerFundTeam }`
);

if (docs.length === 0) {
  console.error("✗ No ourTeam document found.");
  process.exit(1);
}

let hadError = false;

for (const doc of docs) {
  console.log(`\n─── ${doc._id} ───`);
  const patch = {};

  // Every member across every group, so a name can be found wherever it lives.
  const hits = new Map(ASSIGNMENTS.map((a) => [a.match, []]));
  for (const group of GROUPS) {
    for (const m of doc[group] || []) {
      for (const a of ASSIGNMENTS) {
        if (norm(m.name).includes(a.match)) hits.get(a.match).push({ group, name: m.name });
      }
    }
  }

  for (const a of ASSIGNMENTS) {
    const found = hits.get(a.match);
    if (found.length === 0) {
      console.error(`  ✗ "${a.match}" matched no member`);
      hadError = true;
    } else if (found.length > 1) {
      console.error(`  ✗ "${a.match}" matched ${found.length}: ${found.map((f) => f.name).join(", ")}`);
      hadError = true;
    }
  }

  for (const group of GROUPS) {
    const members = doc[group];
    if (!Array.isArray(members)) continue;
    let touched = false;
    const next = members.map((m) => {
      const a = ASSIGNMENTS.find((x) => norm(m.name).includes(x.match));
      if (!a) return m;
      touched = true;
      console.log(`  • ${m.name.padEnd(22)} → ${a.tags.join(", ")}`);
      return { ...m, tags: a.tags };
    });
    if (touched) patch[group] = next;
  }

  if (hadError) continue;
  if (Object.keys(patch).length === 0) {
    console.log("  (nothing to change)");
    continue;
  }
  if (DRY) {
    console.log(`  [dry] would patch: ${Object.keys(patch).join(", ")}`);
  } else {
    await client.patch(doc._id).set(patch).commit();
    console.log(`  ✓ written`);
  }
}

if (hadError) {
  console.error("\n✗ Nothing written — resolve the unmatched names above first.");
  process.exit(1);
}
console.log(DRY ? "\nDry run complete — re-run without --dry to apply." : "\nDone.");
