/**
 * One-shot Sanity import — Home Hero section.
 *
 *   USAGE:
 *     node --env-file=.env.local scripts/import-hero.mjs
 *
 *   WHAT IT DOES:
 *     1. Uploads every hero-founder image from
 *        public/images/hero_founders_images/ to Sanity assets.
 *     2. Creates (or replaces) the singleton "hero" document with
 *        headline, subtitle, CTA labels, and a flat `founders` array —
 *        with the Titan Capital logo card sitting at position 5 (index 4),
 *        the visual anchor of the fanned deck.
 *
 *   AFTER RUNNING:
 *     Open Sanity Studio → "Home — Hero Section" → click Publish
 *     (if not already published). Then refresh your dev server.
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
      "  Run with: node --env-file=.env.local scripts/import-hero.mjs"
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
   Source content — mirrors the FALLBACK_FOUNDERS array in
   HeroClient.tsx. Paths are RELATIVE to /public.

   ORDER MATTERS: the card at index 4 (5th entry) is the
   visual anchor of the fanned deck and the first frame of
   the slideshow — that's where the Titan Capital logo sits.
   ──────────────────────────────────────────────────────── */
const FOUNDERS = [
  { name: "Ghazal Alagh",        role: "Co-Founder, Mamaearth",         imagePath: "public/images/herosection/1. Abhishek 2.png" },
  { name: "Abhiraj Singh Bhal",  role: "Co-Founder, Urban Company",     imagePath: "public/images/herosection/3. Varun Khaitan  1.png" },
  { name: "Ashutosh Valani",     role: "Co-Founder, RENÉE Cosmetics",   imagePath: "public/images/herosection/4. Ghazal 1.png" },
  { name: "Abhishek Bansal",     role: "Co-Founder, Shadowfax",         imagePath: "public/images/herosection/6. Ashtosh Valani 1.png" },
  { name: "Titan Capital",       role: "",                              imagePath: "public/images/hero_founders_images/titan-capital.png",     isLogo: true },
  { name: "Ruchi Kalra",         role: "Co-Founder, Ofbusiness",        imagePath: "public/images/herosection/Aarti Gill 2.png" },
  { name: "Varun Khaitan",       role: "Co-Founder, Urban Company",     imagePath: "public/images/herosection/Asish Mohapatra 1.png" },
  { name: "Ishendra Agarwal",    role: "Co-Founder, GIVA",              imagePath: "public/images/herosection/image 177.png" },
  { name: "Anand Agrawal",       role: "Co-Founder, Credgenics",        imagePath: "public/images/herosection/Rishabh 2.png" },
];

const TEXT = {
  titleLine1: "Backing Founder",
  titleLine2Before: "For Enduring",
  titleLine2Emphasis: "Impact",
  subtitle:
    "We partner with founders from day one. We invest conviction, not just capital, and stay by their side through every stage of their journey.",
  primaryCtaLabel: "Get Investment",
  secondaryCtaLabel: "View Portfolio",
};

/** Stable singleton document ID — re-running the script overwrites it. */
const DOC_ID = "hero-singleton";

/* ────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────── */

async function uploadImage(absPath) {
  const buffer = fs.readFileSync(absPath);
  const asset = await client.assets.upload("image", buffer, {
    filename: path.basename(absPath),
  });
  return asset._id;
}

function makeKey(name, i) {
  return `${name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-${i}`;
}

/* ────────────────────────────────────────────────────────
   Main
   ──────────────────────────────────────────────────────── */
async function main() {
  console.log("→ Uploading hero founder images to Sanity assets...\n");

  const founders = [];
  for (let i = 0; i < FOUNDERS.length; i++) {
    const entry = FOUNDERS[i];
    const absPath = path.resolve(REPO_ROOT, entry.imagePath);

    if (!fs.existsSync(absPath)) {
      console.log(`  ✗ ${entry.name}: image not found at ${entry.imagePath} — skipping`);
      continue;
    }

    process.stdout.write(`  • [${i}] ${entry.name.padEnd(22, " ")}`);
    try {
      const assetId = await uploadImage(absPath);
      console.log(` ✓ uploaded`);

      founders.push({
        _key: makeKey(entry.name, i),
        _type: "heroFounder",
        name: entry.name,
        role: entry.role || "",
        isLogo: entry.isLogo === true,
        image: {
          _type: "image",
          asset: { _type: "reference", _ref: assetId },
        },
      });
    } catch (err) {
      console.log(` ✗ ${err.message}`);
    }
  }

  if (founders.length === 0) {
    console.error("\n✗ No founders uploaded — aborting document write.");
    process.exit(1);
  }

  console.log(`\n→ Writing hero document (id: ${DOC_ID})...\n`);

  const doc = {
    _id: DOC_ID,
    _type: "hero",
    ...TEXT,
    founders,
  };

  const result = await client.createOrReplace(doc);

  console.log(`✓ Document written: ${result._id}`);
  console.log(`  ${founders.length} founder cards. Anchor (index 4): ${founders[4]?.name ?? "—"}`);
  console.log("\nNext: open Sanity Studio → 'Home — Hero Section'");
  console.log("       click Publish if needed. Then refresh your dev server.\n");
}

main().catch((err) => {
  console.error("\n✗ Import failed:", err);
  process.exit(1);
});
