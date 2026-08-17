/**
 * Fill the Milestones field on every portfolio company that has none.
 *
 *   USAGE:
 *     node --env-file=.env.local scripts/backfill-milestones.mjs --dry   # preview
 *     node --env-file=.env.local scripts/backfill-milestones.mjs         # apply
 *     node --env-file=.env.local scripts/backfill-milestones.mjs --force # also overwrite hand-typed values
 *
 * The site already renders these values (see src/lib/milestones.mjs), so this
 * changes nothing on the front end. It exists so the team opening the Studio
 * sees Milestones filled in rather than an empty field.
 *
 * Safe to re-run. Without --force it only touches empty fields, so anything an
 * editor typed by hand is left alone.
 *
 * Note: import-portfolio-grid.mjs does a createOrReplace and now derives the
 * same values itself, so a later sheet import won't wipe these.
 */

import { createClient } from "@sanity/client";
import { deriveMilestones } from "../src/lib/milestones.mjs";

const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error(
    "✗ SANITY_API_WRITE_TOKEN missing.\n" +
      "  Run with: node --env-file=.env.local scripts/backfill-milestones.mjs"
  );
  process.exit(1);
}

const DRY = process.argv.includes("--dry");
const FORCE = process.argv.includes("--force");
const DOC_ID = "portfolioGrid-singleton";

const client = createClient({
  projectId: "suel5z6g",
  dataset: "production",
  apiVersion: "2026-06-19",
  token,
  useCdn: false,
});

const doc = await client.getDocument(DOC_ID);
if (!doc) {
  console.error(`✗ Document "${DOC_ID}" not found.`);
  process.exit(1);
}

const companies = doc.companies || [];
console.log(`Found ${companies.length} companies.\n`);

let filled = 0;
let overwritten = 0;
let skipped = 0;
let empty = 0;

const next = companies.map((c) => {
  const derived = deriveMilestones(c).join(", ");
  const existing = (c.milestones || "").trim();

  if (existing && !FORCE) {
    skipped++;
    return c;
  }
  if (!derived) {
    // No founding year, no year, no IPO tag — nothing to derive.
    empty++;
    console.log(`  –  ${c.brandName}: no source data, left blank`);
    return c;
  }
  if (existing) {
    overwritten++;
    console.log(`  ~  ${c.brandName}: "${existing}" → "${derived}"`);
  } else {
    filled++;
    console.log(`  +  ${c.brandName}: "${derived}"`);
  }
  return { ...c, milestones: derived };
});

console.log(
  `\n${filled} to fill, ${overwritten} to overwrite, ${skipped} kept as-is, ${empty} with no source data.`
);

if (DRY) {
  console.log("\n(--dry: nothing written)");
  process.exit(0);
}

if (filled === 0 && overwritten === 0) {
  console.log("\nNothing to write.");
  process.exit(0);
}

await client.patch(DOC_ID).set({ companies: next }).commit();
console.log(`\n✓ Written to ${DOC_ID}`);
