/**
 * One-off content patch for the /indicorns "Why We Created" timeline.
 *
 *   USAGE:
 *     node --env-file=.env.local scripts/patch-indicorn-timeline.mjs --dry   # preview
 *     node --env-file=.env.local scripts/patch-indicorn-timeline.mjs         # apply
 *
 *   WHAT IT DOES
 *     1. September 2024 gains a stat — "1 New Term" — and drops the
 *        "'Indicorn'." line from its title, leaving "The term is coined".
 *     2. October 2024 and 2025 each carried BOTH a `desc` and a `statSub`
 *        saying nearly the same thing, so the card rendered the sentence
 *        twice. The statSub is the better-written of the two, so it becomes
 *        the `desc` and the statSub field is cleared. That leaves each card
 *        with the intended four blocks: date, title, stat, description.
 *
 *   Read-modify-write on the single `timeline` array: every other field on
 *   every entry, and every other field on the document, passes through
 *   untouched. Matching is by `date`, not by array position, so re-ordering
 *   the entries in Studio cannot make this patch hit the wrong card.
 *
 *   Idempotent: an entry already in its target state is reported as such and
 *   left alone, so a second run writes nothing.
 *
 *   REQUIRES: SANITY_API_WRITE_TOKEN in .env.local (Editor scope)
 */

import { createClient } from "@sanity/client";

const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error(
    "✗ SANITY_API_WRITE_TOKEN missing.\n" +
      "  Run with: node --env-file=.env.local scripts/patch-indicorn-timeline.mjs"
  );
  process.exit(1);
}

const DRY = process.argv.includes("--dry");
const DOC_ID = "whyIndicorns-singleton";

const client = createClient({
  projectId: "suel5z6g",
  dataset: "production",
  apiVersion: "2026-06-19",
  token,
  useCdn: false,
});

/** Keyed by the entry's `date`, which is the stable human identifier here. */
const EDITS = {
  "September 2024": {
    title: "The term is coined",
    statNumber: "1",
    statLabel: "New Term",
  },
  // `statSub -> desc` is expressed as a rule rather than literal copy, so the
  // script can never silently overwrite text an editor has since changed.
  "October 2024": { promoteStatSub: true },
  "2025": { promoteStatSub: true },
};

const doc = await client.getDocument(DOC_ID);
if (!doc) {
  console.error(`✗ Document "${DOC_ID}" not found.`);
  process.exit(1);
}

const entries = doc.timeline || [];
const changes = [];
const skipped = [];
const unmatched = new Set(Object.keys(EDITS));

const next = entries.map((entry) => {
  const edit = EDITS[entry.date];
  if (!edit) return entry;
  unmatched.delete(entry.date);

  const out = { ...entry };
  const touched = [];

  if (edit.promoteStatSub) {
    if (!entry.statSub) {
      skipped.push(`  ·  ${entry.date}: no statSub to promote — already done?`);
      return entry;
    }
    touched.push(`desc   "${entry.desc}"\n            →  "${entry.statSub}"`);
    touched.push(`statSub cleared`);
    out.desc = entry.statSub;
    delete out.statSub;
  }

  for (const key of ["title", "statNumber", "statLabel"]) {
    if (edit[key] === undefined) continue;
    if (entry[key] === edit[key]) continue;
    touched.push(
      `${key.padEnd(7)}${JSON.stringify(entry[key] ?? null)}  →  ${JSON.stringify(edit[key])}`
    );
    out[key] = edit[key];
  }

  if (!touched.length) {
    skipped.push(`  ·  ${entry.date}: already in target state`);
    return entry;
  }
  changes.push(`  ~  ${entry.date}\n        ${touched.join("\n        ")}`);
  return out;
});

console.log(`Timeline entries: ${entries.length}\n`);
if (changes.length) {
  console.log(`Changing ${changes.length}:`);
  changes.forEach((c) => console.log(c));
}
if (skipped.length) {
  console.log(`\nUnchanged:`);
  skipped.forEach((s) => console.log(s));
}
if (unmatched.size) {
  console.log(
    `\n✗ ${unmatched.size} target date(s) matched no timeline entry — check the spelling:`
  );
  unmatched.forEach((d) => console.log(`     "${d}"`));
  console.log("\n  Not writing.");
  process.exit(1);
}

if (DRY) {
  console.log("\n(--dry: nothing written)");
  process.exit(0);
}
if (!changes.length) {
  console.log("\nNothing to write.");
  process.exit(0);
}

await client.patch(DOC_ID).set({ timeline: next }).commit();
console.log(`\n✓ Written to ${DOC_ID}`);
