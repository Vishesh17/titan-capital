/**
 * Fold the two Stories heading fields into one.
 *
 *   USAGE:
 *     node --env-file=.env.local scripts/migrate-stories-heading.mjs --dry
 *     node --env-file=.env.local scripts/migrate-stories-heading.mjs
 *
 * `storiesHeadingFirst` + `storiesHeadingSecond` become a single
 * `storiesHeading` with a newline between them — which is exactly what an
 * editor would now type, since the field is a two-row text box and the
 * rendered heading preserves line breaks.
 *
 * DRAFTS TOO. Studio edits live on a draft document, so a published-only write
 * would leave anyone with the document open still looking at the old shape.
 *
 * The old fields are left in place rather than unset: the query coalesces to
 * them, so nothing breaks if this is run before the deploy, and they can be
 * cleared by hand once the new field is confirmed.
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
  perspective: "raw",
});

const docs = await client.fetch(
  `*[_type == "impactAtGlance"]{ _id, storiesHeading, storiesHeadingFirst, storiesHeadingSecond }`
);

if (docs.length === 0) {
  console.error("✗ No impactAtGlance document found.");
  process.exit(1);
}

for (const d of docs) {
  const combined = [d.storiesHeadingFirst, d.storiesHeadingSecond]
    .filter((v) => typeof v === "string" && v.trim())
    .join("\n");

  console.log(`\n─── ${d._id} ───`);
  console.log(`  line 1: ${JSON.stringify(d.storiesHeadingFirst ?? null)}`);
  console.log(`  line 2: ${JSON.stringify(d.storiesHeadingSecond ?? null)}`);

  if (d.storiesHeading) {
    console.log(`  • already has storiesHeading: ${JSON.stringify(d.storiesHeading)} — skipped`);
    continue;
  }
  if (!combined) {
    console.log("  • nothing to fold — skipped");
    continue;
  }

  console.log(`  → storiesHeading: ${JSON.stringify(combined)}`);
  if (DRY) console.log("  [dry] not written");
  else {
    await client.patch(d._id).set({ storiesHeading: combined }).commit();
    console.log("  ✓ written");
  }
}

console.log(DRY ? "\nDry run complete — re-run without --dry to apply." : "\nDone.");
