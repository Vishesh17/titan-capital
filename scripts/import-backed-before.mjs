/**
 * One-shot Sanity import — Backed Before section.
 *
 *   USAGE:
 *     node --env-file=.env.local scripts/import-backed-before.mjs
 *
 *   WHAT IT DOES:
 *     1. Uploads each row's logos from public/images/... to Sanity
 *     2. Creates (or replaces) the singleton "backedBefore" document
 *        with text + image references all wired up.
 *
 *   AFTER RUNNING:
 *     Open Sanity Studio → "Home — Backed Before Section"
 *     → click Publish (if not already published).
 *
 *   REQUIRES:
 *     SANITY_API_WRITE_TOKEN in .env.local (Editor scope)
 */

import { createClient } from "@sanity/client";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

/* ────────────────────────────────────────────────────────
   Sanity client
   ──────────────────────────────────────────────────────── */
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error(
    "✗ SANITY_API_WRITE_TOKEN missing from environment.\n" +
      "  Run with: node --env-file=.env.local scripts/import-backed-before.mjs"
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

/* ────────────────────────────────────────────────────────
   Source content — mirrors the hardcoded fallback in
   BackedBeforeClient.tsx. Paths are RELATIVE to /public.
   (Leading slash would make path.resolve treat them as
   absolute and lose REPO_ROOT.)
   ──────────────────────────────────────────────────────── */
const ROW_1 = [
  { name: "Ola",           imagePath: "public/images/logos_backup/ola.svg",                  scaleClass: "scale-[0.7]" },
  { name: "Urban Company", imagePath: "public/images/logos_backup/Urban Company.webp",       scaleClass: "" },
  { name: "Mamaearth",     imagePath: "public/images/logos_backup/mamaearthpng.webp",        scaleClass: "scale-[1.3]" },
  { name: "Shadowfax",     imagePath: "public/images/logos_backup/Shadowfax.svg",            scaleClass: "scale-[1.2]" },
  { name: "Razorpay",      imagePath: "public/images/logos_backup/Razorpay.webp",            scaleClass: "scale-[1.3]" },
  { name: "Ofbusiness",    imagePath: "public/images/logos_backup/Ofbusiness.png",           scaleClass: "scale-[1.6]" },
  { name: "Cart.com",      imagePath: "public/images/logos_backup/Cart.com.webp",            scaleClass: "scale-[1.3]" },
  { name: "Unicommerce",   imagePath: "public/images/logos_backup/unicommerce-logo.svg",     scaleClass: "" },
  { name: "Snapdeal",      imagePath: "public/images/logos_backup/snapdeal-company-1.webp",  scaleClass: "scale-[1.3]" },
  { name: "Credgenics",    imagePath: "public/images/logos_backup/Credgenics.svg",           scaleClass: "scale-[1.3]" },
];

const ROW_2 = [
  { name: "Giva",       imagePath: "public/images/logos_backup/GIVA.webp",              scaleClass: "scale-[0.8]" },
  { name: "Boba Bhai",  imagePath: "public/images/logos_backup/bobabhai.webp",          scaleClass: "" },
  { name: "Invideo",    imagePath: "public/images/logos_backup/invideo.svg",            scaleClass: "scale-[0.8]" },
  { name: "Park+",      imagePath: "public/images/portfolio_grid/PARK+logo.png",        scaleClass: "scale-[1.8]" },
  { name: "Renee",      imagePath: "public/images/logos_backup/RENEE.svg",              scaleClass: "scale-[0.7]" },
  { name: "Supertails", imagePath: "public/images/portfolio_grid/supertails_black.png", scaleClass: "scale-[3.2]" },
  { name: "Zingbus",    imagePath: "public/images/logos_backup/zingbus.webp",           scaleClass: "" },
  { name: "Anveshan",   imagePath: "public/images/logos_backup/anveshan.webp",          scaleClass: "" },
  { name: "Kutumb",     imagePath: "public/images/logos_backup/Kutumb.webp",            scaleClass: "scale-[1.3]" },
  { name: "Magma",      imagePath: "public/images/logos_backup/magma factory.webp",     scaleClass: "scale-[2.4]" },
  { name: "Mekr",       imagePath: "public/images/logos_backup/mekr.webp",              scaleClass: "" },
  { name: "Slovic",     imagePath: "public/images/logos_backup/slovic.avif",            scaleClass: "scale-[1.3]" },
  { name: "Zouk",       imagePath: "public/images/logos_backup/zouk_new_logo.webp",     scaleClass: "scale-[0.8]" },
];

/** Stable singleton document ID — re-running the script overwrites it. */
const DOC_ID = "backedBefore-singleton";

/* ────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────── */

/** Some hand-exported SVGs (notably ola.svg) carry malformed namespace
 *  declarations like `xmlns:ns_extend="ns_extend;"` and bloated <metadata>
 *  blocks that Sanity's image processor rejects with
 *  "Unprocessable Entity - Invalid image, could not process".
 *  Strip both before upload so the SVG parses cleanly. Same sanitisation
 *  used by scripts/process-logos.cjs. */
function sanitiseSvg(absPath) {
  let svgStr = fs.readFileSync(absPath, "utf8");
  svgStr = svgStr
    .replace(/xmlns:\w+="ns_\w+;"\s*/g, "")
    .replace(/<metadata>[\s\S]*?<\/metadata>/g, "");
  return Buffer.from(svgStr);
}

async function uploadImage(absPath) {
  const ext = path.extname(absPath).toLowerCase();
  const buffer = ext === ".svg" ? sanitiseSvg(absPath) : fs.readFileSync(absPath);
  const asset = await client.assets.upload("image", buffer, {
    filename: path.basename(absPath),
  });
  return asset._id;
}

function makeKey(seed, rowIndex, i) {
  return `${seed.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-r${rowIndex}-${i}`;
}

/** Upload one row's logos and return Sanity-shaped array items. */
async function buildRowItems(row, rowIndex) {
  const items = [];
  for (let i = 0; i < row.length; i++) {
    const entry = row[i];
    const absPath = path.resolve(REPO_ROOT, entry.imagePath);

    if (!fs.existsSync(absPath)) {
      console.log(`  ✗ ${entry.name}: image not found at ${entry.imagePath} — skipping`);
      continue;
    }

    process.stdout.write(`  • ${entry.name.padEnd(20, " ")}`);
    try {
      const assetId = await uploadImage(absPath);
      console.log(` ✓ uploaded`);

      items.push({
        _key: makeKey(entry.name, rowIndex, i),
        _type: "backedBeforeLogo", // MUST match the inline object name in the schema
        name: entry.name,
        scaleClass: entry.scaleClass || "",
        image: {
          _type: "image",
          asset: { _type: "reference", _ref: assetId },
        },
      });
    } catch (err) {
      console.log(` ✗ ${err.message}`);
    }
  }
  return items;
}

/* ────────────────────────────────────────────────────────
   Main
   ──────────────────────────────────────────────────────── */
async function main() {
  console.log("→ Uploading Backed Before logos to Sanity assets...\n");

  console.log("  ── Row 1 (10 logos) ──");
  const marquet1 = await buildRowItems(ROW_1, 1);

  console.log("\n  ── Row 2 (13 logos) ──");
  const marquet2 = await buildRowItems(ROW_2, 2);

  if (marquet1.length === 0 && marquet2.length === 0) {
    console.error("\n✗ No logos uploaded — aborting document write.");
    process.exit(1);
  }

  console.log(`\n→ Writing backedBefore document (id: ${DOC_ID})...\n`);

  const doc = {
    _id: DOC_ID,
    _type: "backedBefore", // MUST match schema's `name`
    heading1: "Backed Before",
    heading2: "Anyone Else Did",
    marquet1,
    marquet2,
  };

  const result = await client.createOrReplace(doc);

  console.log(`✓ Document written: ${result._id}`);
  console.log(`  ${marquet1.length} row-1 logos, ${marquet2.length} row-2 logos.`);
  console.log("\nNext: open Sanity Studio → 'Home — Backed Before Section'");
  console.log("       click Publish if needed. Then refresh / on your dev server.\n");
}

main().catch((err) => {
  console.error("\n✗ Import failed:", err);
  process.exit(1);
});
