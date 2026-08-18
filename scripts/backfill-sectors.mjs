/**
 * Fill the Sector field on every portfolio company from scripts/data/sectors.mjs.
 *
 *   USAGE:
 *     node --env-file=.env.local scripts/backfill-sectors.mjs --dry   # preview
 *     node --env-file=.env.local scripts/backfill-sectors.mjs         # apply
 *
 * Backfill only: reads the live document, changes nothing but `sector`, and
 * writes the same companies back. Logos, founder images, milestones, stage,
 * status and every other field pass through untouched.
 *
 * A company absent from the list keeps whatever sector it already has — this
 * never blanks a field. Anything that fails to match a Sanity brandName is
 * reported and skipped, never guessed at.
 *
 * Refuses to write if a listed name matches no Sanity company, so a typo
 * can't cause a company to silently miss its sector. Override with --force
 * once you've read the report. A company listed under two sectors is only a
 * warning: it is left untouched and the rest still apply.
 */

import { createClient } from "@sanity/client";
import { SECTORS } from "../src/lib/portfolioFilters.mjs";
import { SECTOR_ASSIGNMENTS, ALIASES } from "./data/sectors.mjs";
import { norm, indexCompanies, resolveCompany } from "./lib/companyMatch.mjs";

const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error(
    "✗ SANITY_API_WRITE_TOKEN missing.\n" +
      "  Run with: node --env-file=.env.local scripts/backfill-sectors.mjs"
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

/* ── Validate the list before touching Sanity ── */

const problems = [];

const badSectors = Object.keys(SECTOR_ASSIGNMENTS).filter((s) => !SECTORS.includes(s));
badSectors.forEach((s) => problems.push(`Sector "${s}" is not one of: ${SECTORS.join(", ")}`));

/** normalised name → sector */
const wanted = new Map();
/** normalised name → original spelling, for reporting */
const spelling = new Map();
const dupes = [];

const conflicted = new Set();

for (const [sector, names] of Object.entries(SECTOR_ASSIGNMENTS)) {
  for (const name of names) {
    const k = norm(name);
    if (wanted.has(k) && wanted.get(k) !== sector) {
      dupes.push(`${name}: listed under both "${wanted.get(k)}" and "${sector}" — SKIPPED, pick one`);
      conflicted.add(k);
    }
    wanted.set(k, sector);
    spelling.set(k, name);
  }
}
// Leave conflicted companies untouched rather than letting object key order
// decide which of the two sectors wins.
conflicted.forEach((k) => wanted.delete(k));

/* ── Load Sanity and match ── */

const doc = await client.getDocument(DOC_ID);
if (!doc) {
  console.error(`✗ Document "${DOC_ID}" not found.`);
  process.exit(1);
}
const companies = doc.companies || [];

const byKey = indexCompanies(companies);

const resolved = new Map(); // company index → sector
const unmatched = [];

for (const [k, sector] of wanted) {
  const idx = resolveCompany(spelling.get(k), byKey, ALIASES);
  if (idx === undefined) {
    unmatched.push(spelling.get(k));
    continue;
  }
  resolved.set(idx, sector);
}

unmatched.forEach((n) => problems.push(`No Sanity company matches "${n}"`));

/* ── Build the patch ── */

let changed = 0;
let same = 0;

const changes = [];
const next = companies.map((c, i) => {
  const sector = resolved.get(i);
  if (!sector) return c;
  const existing = (c.sector || "").trim();
  if (existing === sector) {
    same++;
    return c;
  }
  changed++;
  changes.push(`  ~  ${c.brandName}: "${existing || "(empty)"}" → "${sector}"`);
  return { ...c, sector };
});

const untouched = companies.filter((_, i) => !resolved.has(i));

/* ── Report ── */

console.log(`Sanity companies: ${companies.length}`);
console.log(`Names in list:    ${wanted.size} unique`);
console.log(`Matched:          ${resolved.size}\n`);

changes.forEach((l) => console.log(l));
console.log(`\n${changed} to change, ${same} already correct.`);

if (untouched.length) {
  console.log(`\n⚠ ${untouched.length} Sanity companies are NOT in your list (sector left as-is):`);
  untouched.forEach((c) => console.log(`     ${c.brandName}  (currently "${c.sector || "(empty)"}")`));
}

if (dupes.length) {
  console.log(`\n⚠ ${dupes.length} company listed under two sectors — left untouched, decide and set it by hand:`);
  dupes.forEach((d) => console.log(`     ${d}`));
}

if (problems.length) {
  console.log(`\n✗ ${problems.length} problem(s):`);
  problems.forEach((p) => console.log(`     ${p}`));
}

if (DRY) {
  console.log("\n(--dry: nothing written)");
  process.exit(0);
}
if (problems.length && !FORCE) {
  console.log("\n✗ Not writing. Fix the problems above, or re-run with --force to apply anyway.");
  process.exit(1);
}
if (changed === 0) {
  console.log("\nNothing to write.");
  process.exit(0);
}

await client.patch(DOC_ID).set({ companies: next }).commit();
console.log(`\n✓ Written to ${DOC_ID}`);
