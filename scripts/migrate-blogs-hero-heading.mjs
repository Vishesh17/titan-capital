/**
 * blogsHero: headingFirst + headingSecond  ->  one `heading` field.
 *
 * The two old fields were the two lines of the headline, so the new value is
 * simply them joined by a newline — which is what the single field now means.
 *
 *   node scripts/migrate-blogs-hero-heading.mjs --dry
 *   node scripts/migrate-blogs-hero-heading.mjs
 *
 * REFUSES TO OVERWRITE. A document that already has `heading` is left alone,
 * so running this twice cannot clobber an edit made in the Studio in between.
 * The old fields are unset only after the new one is written.
 *
 * Needs a token with write access:  SANITY_WRITE_TOKEN=... node scripts/...
 */
import { createClient } from "@sanity/client";

const DRY = process.argv.includes("--dry");
const token = process.env.SANITY_WRITE_TOKEN;

if (!DRY && !token) {
  console.error("SANITY_WRITE_TOKEN is required for a real run (use --dry to preview).");
  process.exit(1);
}

const client = createClient({
  projectId: "suel5z6g",
  dataset: "production",
  apiVersion: "2026-06-19",
  token,
  useCdn: false,
  // Drafts included: the Studio's unpublished copy needs migrating too, or an
  // editor publishing later would silently restore the old shape.
  perspective: "raw",
});

const docs = await client.fetch(
  `*[_type == "blogsHero"]{ _id, heading, headingFirst, headingSecond }`
);

if (!docs.length) {
  console.log("No blogsHero documents found.");
  process.exit(0);
}

let written = 0;
for (const doc of docs) {
  if (typeof doc.heading === "string" && doc.heading.trim()) {
    console.log(`skip  ${doc._id} — already has heading: ${JSON.stringify(doc.heading)}`);
    continue;
  }
  const lines = [doc.headingFirst, doc.headingSecond].filter(
    (l) => typeof l === "string" && l.trim()
  );
  if (!lines.length) {
    console.log(`skip  ${doc._id} — nothing to migrate`);
    continue;
  }
  const heading = lines.join("\n");
  console.log(`${DRY ? "would " : ""}write ${doc._id} -> ${JSON.stringify(heading)}`);
  if (!DRY) {
    await client
      .patch(doc._id)
      .set({ heading })
      .unset(["headingFirst", "headingSecond"])
      .commit();
    written += 1;
  }
}

console.log(DRY ? "\nDry run — nothing written." : `\nDone. ${written} document(s) updated.`);
