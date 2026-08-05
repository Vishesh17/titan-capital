/**
 * One-shot Sanity import — Our Story "15 Years of Showing Up" singleton.
 *
 *   USAGE:
 *     set -a; source .env.local; set +a
 *     node scripts/import-fifteen-years.mjs
 *
 *   Writes (or replaces) the singleton "fifteenYears" document: the two
 *   heading pieces + one entry per year. The odometer/timeline itself is
 *   driven by SCROLL on the site — this script only supplies the copy.
 *
 *   ── FILL IN EACH YEAR BELOW ──
 *     subtitle    The big bold line (e.g. "Ola Cabs — our first cheque").
 *     description The paragraph below it. Use \n for line breaks.
 *
 *   Leave a year's subtitle AND description both "" to OMIT that year — its
 *   chip won't appear and the scroll won't stop on it. Delete a row to drop
 *   a year entirely, or add rows for more years.
 *
 *   Re-run any time — it uses createOrReplace, so it's safe to run again.
 */

import { createClient } from "@sanity/client";

const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error(
    "✗ SANITY_API_WRITE_TOKEN missing.\n" +
      "  Run with env loaded:\n" +
      "    set -a; source .env.local; set +a; node scripts/import-fifteen-years.mjs"
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

const DOC_ID = "fifteenYears-singleton";

const HEADING_FIRST = "15 Years of Showing Up";
const HEADING_HIGHLIGHT = "Showing Up";

/* ─────────────────────────────────────────────────────────
   One entry per year — fill subtitle + description.
   (Both empty → that year is skipped.)
   ───────────────────────────────────────────────────────── */
const YEARS = [
  { year: 2011, subtitle: "", description: "" },
  { year: 2012, subtitle: "", description: "" },
  { year: 2013, subtitle: "", description: "" },
  { year: 2014, subtitle: "", description: "" },
  { year: 2015, subtitle: "", description: "" },
  { year: 2016, subtitle: "", description: "" },
  { year: 2017, subtitle: "", description: "" },
  { year: 2018, subtitle: "", description: "" },
  { year: 2019, subtitle: "", description: "" },
  { year: 2020, subtitle: "", description: "" },
  { year: 2021, subtitle: "", description: "" },
  { year: 2022, subtitle: "", description: "" },
  { year: 2023, subtitle: "", description: "" },
  { year: 2024, subtitle: "", description: "" },
  { year: 2025, subtitle: "", description: "" },
  { year: 2026, subtitle: "", description: "" },
];

async function main() {
  const years = YEARS.filter(
    (y) => (y.subtitle && y.subtitle.trim()) || (y.description && y.description.trim())
  )
    .sort((a, b) => a.year - b.year)
    .map((y) => ({
      _key: `year-${y.year}`,
      _type: "yearEntry",
      year: y.year,
      subtitle: y.subtitle || "",
      description: y.description || "",
    }));

  if (years.length === 0) {
    console.error(
      "\n✗ No years filled in — add a subtitle/description to at least one year\n" +
        "  in the YEARS array before running.\n"
    );
    process.exit(1);
  }

  const doc = {
    _id: DOC_ID,
    _type: "fifteenYears",
    headingFirst: HEADING_FIRST,
    headingHighlight: HEADING_HIGHLIGHT,
    years,
  };

  console.log("→ Writing fifteenYears singleton...");
  const result = await client.createOrReplace(doc);

  console.log(`✓ Document written: ${result._id}`);
  console.log(`\n  Years: ${years.length} (${years.map((y) => y.year).join(", ")})`);
  console.log("\nDone. Refresh /ourstory on your dev server.\n");
}

main().catch((err) => {
  console.error("\n✗ Import failed:", err);
  process.exit(1);
});
