/**
 * Set Status from scripts/data/statuses.mjs, and CLEAR it on every company
 * not in that list.
 *
 *   USAGE:
 *     node --env-file=.env.local scripts/backfill-statuses.mjs --dry   # preview
 *     node --env-file=.env.local scripts/backfill-statuses.mjs         # apply
 *
 * Unlike the sector backfill, this one is exhaustive: the list defines the
 * complete set of companies that have a status, so everything else is
 * unset. "Active" is no longer a value — an active company simply has no
 * status. Nothing displays the field (it drives only the Status filter in
 * PortfolioGrid.tsx), so clearing it keeps those companies in the grid and
 * merely excludes them when someone filters by Status.
 *
 * Touches `status` and nothing else: logos, sector, stage, milestones and
 * every other field pass through unchanged.
 *
 * Refuses to write if a listed name matches no Sanity company, so a typo
 * can't leave a company without its status. Override with --force.
 */

import { createClient } from "@sanity/client";
import { STATUSES } from "../src/lib/portfolioFilters.mjs";
import {
  STATUS_ASSIGNMENTS,
  ALIASES,
  NOT_YET_IN_SANITY,
  PRESERVED_TAGS,
} from "./data/statuses.mjs";
import { norm, indexCompanies, resolveCompany } from "./lib/companyMatch.mjs";

const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error(
    "✗ SANITY_API_WRITE_TOKEN missing.\n" +
      "  Run with: node --env-file=.env.local scripts/backfill-statuses.mjs"
  );
  process.exit(1);
}

const DRY = process.argv.includes("--dry");
const FORCE = process.argv.includes("--force");
const FLATTEN_TAGS = process.argv.includes("--flatten-tags");
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

Object.keys(STATUS_ASSIGNMENTS)
  .filter((s) => !STATUSES.includes(s))
  .forEach((s) => problems.push(`Status "${s}" is not one of: ${STATUSES.join(", ")}`));

const wanted = new Map(); // normalised name → status
const spelling = new Map();
const conflicted = new Set();

for (const [status, names] of Object.entries(STATUS_ASSIGNMENTS)) {
  for (const name of names) {
    const k = norm(name);
    if (wanted.has(k) && wanted.get(k) !== status) {
      dupes.push(`${name}: listed under both "${wanted.get(k)}" and "${status}" — SKIPPED, pick one`);
      conflicted.add(k);
    }
    wanted.set(k, status);
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

const resolved = new Map(); // company index → status
const missing = [];

const pending = [];

for (const [k, status] of wanted) {
  const name = spelling.get(k);
  const idx = resolveCompany(name, byKey, ALIASES);
  if (idx === undefined) {
    // Known-pending names are expected; anything else is a typo worth halting on.
    (NOT_YET_IN_SANITY.includes(name) ? pending : missing).push(`${name}  →  "${status}"`);
    continue;
  }
  resolved.set(idx, status);
}

/* ── Build the patch ── */

const set = [];
const cleared = [];
const ribbons = [];
const keptTags = [];

const next = companies.map((c, i) => {
  const status = resolved.get(i);
  const oldStatus = (c.status || "").trim();
  const oldTags = (c.tags || "").trim();

  /* `tags` drives the card ribbon and `status` drives the filter. They are
     separate fields that had drifted apart, so both are written here: the
     ribbon now always reflects the status. */

  if (status) {
    const changes = {};
    if (oldStatus !== status) {
      changes.status = status;
      set.push(`  ~  ${c.brandName}: status "${oldStatus || "(empty)"}" → "${status}"`);
    }
    if (oldTags !== status) {
      changes.tags = status;
      ribbons.push(`  ●  ${c.brandName}: ribbon "${oldTags || "(none)"}" → "${status}"`);
    }
    return Object.keys(changes).length ? { ...c, ...changes } : c;
  }

  // Not in either list → active: no status, and a plain "Active" tag so no
  // ribbon renders.
  const keepTag = !FLATTEN_TAGS && PRESERVED_TAGS.includes(oldTags);
  if (keepTag) keptTags.push(`  ○  ${c.brandName}: keeping ribbon "${oldTags}"`);

  const nextTags = keepTag ? oldTags : "Active";
  const tagsChanged = oldTags !== nextTags;
  if (tagsChanged) {
    ribbons.push(`  ●  ${c.brandName}: ribbon "${oldTags || "(none)"}" → "Active" (hidden)`);
  }
  if (!oldStatus && !tagsChanged) return c;

  if (oldStatus) cleared.push(`  −  ${c.brandName}: status "${oldStatus}" → (none)`);
  const { status: _drop, ...rest } = c;
  return { ...rest, tags: nextTags };
});

/* ── Report ── */

console.log(`Sanity companies: ${companies.length}`);
console.log(`Names in list:    ${wanted.size} unique`);
console.log(`Matched:          ${resolved.size}\n`);

if (set.length) {
  console.log(`Setting status (${set.length}):`);
  set.forEach((l) => console.log(l));
}
if (cleared.length) {
  console.log(`\nClearing status (${cleared.length}) — these become active with no status:`);
  const byOld = new Map();
  cleared.forEach((l) => {
    const old = l.match(/"([^"]+)"/)[1];
    byOld.set(old, (byOld.get(old) || 0) + 1);
  });
  [...byOld].forEach(([v, n]) => console.log(`     ${String(n).padStart(4)}  was "${v}"`));
}

if (ribbons.length) {
  console.log(`\nRibbon (\`tags\`) updates (${ribbons.length}):`);
  ribbons.forEach((l) => console.log(l));
}
if (keptTags.length) {
  console.log(`\nRibbons preserved (${keptTags.length}) — say what Status cannot; --flatten-tags to drop them:`);
  keptTags.forEach((l) => console.log(l));
}

console.log(`\n${set.length} status set, ${cleared.length} status cleared, ${ribbons.length} ribbons updated.`);

if (missing.length) {
  console.log(
    `\n✗ ${missing.length} listed name(s) match NO company in Sanity — these would not get a status:`
  );
  missing.forEach((m) => console.log(`     ${m}`));
  problems.push(`${missing.length} unmatched name(s)`);
}
if (pending.length) {
  console.log(`\n⚠ ${pending.length} listed name(s) not in Sanity yet — add the company, then re-run:`);
  pending.forEach((m) => console.log(`     ${m}`));
}
if (dupes.length) {
  console.log(`\n⚠ listed under two statuses — left untouched:`);
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
if (set.length + cleared.length + ribbons.length === 0) {
  console.log("\nNothing to write.");
  process.exit(0);
}

await client.patch(DOC_ID).set({ companies: next }).commit();
console.log(`\n✓ Written to ${DOC_ID}`);
