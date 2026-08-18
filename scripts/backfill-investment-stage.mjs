/**
 * Set Investment Stage from scripts/data/stages.mjs.
 *
 *   USAGE:
 *     node --env-file=.env.local scripts/backfill-investment-stage.mjs --dry   # preview
 *     node --env-file=.env.local scripts/backfill-investment-stage.mjs         # apply
 *
 * Exhaustive: the list names the Series A and Series B companies, and every
 * other company becomes "Seed". That also sweeps up the legacy "Pre-Seed",
 * "Pre Seed" and "Pre-Series A" values, which are no longer in the dropdown
 * and so match no filter on /portfolio.
 *
 * Touches `investmentStage` and nothing else: logos, sector, status, tags,
 * milestones and every other field pass through unchanged.
 *
 * Refuses to write if a listed name matches no Sanity company (and isn't in
 * NOT_YET_IN_SANITY), so a typo can't leave a company on the wrong stage.
 * Override with --force.
 */

import { createClient } from "@sanity/client";
import { STAGES } from "../src/lib/portfolioFilters.mjs";
import {
  STAGE_ASSIGNMENTS,
  DEFAULT_STAGE,
  ALIASES,
  NOT_YET_IN_SANITY,
} from "./data/stages.mjs";
import { norm, indexCompanies, resolveCompany } from "./lib/companyMatch.mjs";

const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error(
    "✗ SANITY_API_WRITE_TOKEN missing.\n" +
      "  Run with: node --env-file=.env.local scripts/backfill-investment-stage.mjs"
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

/* ── Validate the list ── */

const problems = [];
const dupes = [];

[...Object.keys(STAGE_ASSIGNMENTS), DEFAULT_STAGE]
  .filter((s) => !STAGES.includes(s))
  .forEach((s) => problems.push(`Stage "${s}" is not one of: ${STAGES.join(", ")}`));

const wanted = new Map(); // normalised name → stage
const spelling = new Map();
const conflicted = new Set();

for (const [stage, names] of Object.entries(STAGE_ASSIGNMENTS)) {
  for (const name of names) {
    const k = norm(name);
    if (wanted.has(k) && wanted.get(k) !== stage) {
      dupes.push(`${name}: listed under both "${wanted.get(k)}" and "${stage}" — SKIPPED, pick one`);
      conflicted.add(k);
    }
    wanted.set(k, stage);
    spelling.set(k, name);
  }
}
conflicted.forEach((k) => wanted.delete(k));

/* ── Load Sanity and match ── */

const doc = await client.getDocument(DOC_ID);
if (!doc) {
  console.error(`✗ Document "${DOC_ID}" not found.`);
  process.exit(1);
}
const companies = doc.companies || [];
const byKey = indexCompanies(companies);

const resolved = new Map(); // company index → stage
const missing = [];
const pending = [];

for (const [k, stage] of wanted) {
  const name = spelling.get(k);
  const idx = resolveCompany(name, byKey, ALIASES);
  if (idx === undefined) {
    (NOT_YET_IN_SANITY.includes(name) ? pending : missing).push(`${name}  →  "${stage}"`);
    continue;
  }
  resolved.set(idx, stage);
}

/* ── Build the patch ── */

const promoted = [];
const defaulted = [];

const next = companies.map((c, i) => {
  const stage = resolved.get(i) || DEFAULT_STAGE;
  const existing = (c.investmentStage || "").trim();
  if (existing === stage) return c;

  const line = `  ~  ${c.brandName}: "${existing || "(empty)"}" → "${stage}"`;
  (resolved.has(i) ? promoted : defaulted).push(line);
  return { ...c, investmentStage: stage };
});

/* ── Report ── */

console.log(`Sanity companies: ${companies.length}`);
console.log(`Names in list:    ${wanted.size} unique`);
console.log(`Matched:          ${resolved.size}\n`);

if (promoted.length) {
  console.log(`Series A / Series B (${promoted.length}):`);
  promoted.forEach((l) => console.log(l));
}
if (defaulted.length) {
  console.log(`\nDefaulted to "${DEFAULT_STAGE}" (${defaulted.length}):`);
  defaulted.forEach((l) => console.log(l));
}

console.log(`\n${promoted.length + defaulted.length} to change.`);

if (missing.length) {
  console.log(`\n✗ ${missing.length} listed name(s) match NO company in Sanity:`);
  missing.forEach((m) => console.log(`     ${m}`));
  problems.push(`${missing.length} unmatched name(s)`);
}
if (pending.length) {
  console.log(`\n⚠ ${pending.length} listed name(s) not in Sanity yet — add the company, then re-run:`);
  pending.forEach((m) => console.log(`     ${m}`));
}
if (dupes.length) {
  console.log(`\n⚠ listed under two stages — left untouched:`);
  dupes.forEach((d) => console.log(`     ${d}`));
}

if (DRY) {
  console.log("\n(--dry: nothing written)");
  process.exit(0);
}
if (problems.length && !FORCE) {
  console.log("\n✗ Not writing. Fix the problems above, or re-run with --force to apply anyway.");
  process.exit(1);
}
if (promoted.length + defaulted.length === 0) {
  console.log("\nNothing to write.");
  process.exit(0);
}

await client.patch(DOC_ID).set({ companies: next }).commit();
console.log(`\n✓ Written to ${DOC_ID}`);
