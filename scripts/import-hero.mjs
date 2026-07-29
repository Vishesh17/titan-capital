/**
 * One-shot Sanity import — Home Hero section.
 *
 *   USAGE:
 *     node --env-file=.env.local scripts/import-hero.mjs
 *
 *   WHAT IT DOES:
 *     1. Uploads every hero-founder image to Sanity assets.
 *     2. Creates (or replaces) the singleton "hero" document with
 *        headline, subtitle, CTA labels, and the flat `founders` array.
 *     3. Writes per-card scale/position tuning:
 *          - scaleFactor / positionX / positionY  → heading-photo slot
 *          - squareScaleFactor / squarePositionX / squarePositionY → slideshow
 *
 *   ORDER MATTERS: the card at index 3 (4th entry) is the visual anchor
 *   of the fanned deck and the first frame of the slideshow — that's
 *   where the Titan Capital logo sits with isLogo: true.
 *
 *   AFTER RUNNING:
 *     Open Sanity Studio → "Home — Hero Section" → click Publish.
 *     Restart the dev server so the updated GROQ query is picked up.
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
   Source content — mirrors FALLBACK_FOUNDERS in HeroClient.tsx.
   Paths are relative to the repo root. Edit values below to
   retune photos, scales, or positions.
   ──────────────────────────────────────────────────────── */
const FOUNDERS = [
  {
    name: "Abhiraj Singh Bhal",
    role: "Co-Founder, Urban Company",
    imagePath: "public/images/hero_founders_images/15.png",
    scaleFactor: 1.5,
    positionX: 0,
    positionY: 0,
    squareScaleFactor: 1,
    squarePositionX: -3,
    squarePositionY: 0,
  },
  {
    name: "Ashutosh Valani",
    role: "Co-Founder, RENÉE Cosmetics",
    imagePath: "public/images/hero_founders_images/12.png",
    scaleFactor: 1.5,
    positionX: 5,
    positionY: -5,
    squareScaleFactor: 1,
    squarePositionX: 0,
    squarePositionY: 0,
  },
  {
    name: "Abhishek Bansal",
    role: "Co-Founder, Shadowfax",
    imagePath: "public/images/hero_founders_images/1.png",
    scaleFactor: 1.5,
    positionX: 0,
    positionY: -10,
    squareScaleFactor: 1,
    squarePositionX: 0,
    squarePositionY: 0,
  },
  {
    name: "Titan Capital",
    role: "",
    imagePath: "public/images/logos/titancapitallogo.svg",
    isLogo: true,
    scaleFactor: 0.7,
    positionX: 0,
    positionY: 0,
    squareScaleFactor: 1,
    squarePositionX: 0,
    squarePositionY: 0,
  },
  {
    name: "Varun Khaitan",
    role: "Co-Founder, Urban Company",
    imagePath: "public/images/hero_founders_images/5.png",
    scaleFactor: 1.5,
    positionX: 0,
    positionY: -5,
    squareScaleFactor: 1,
    squarePositionX: 0,
    squarePositionY: 0,
  },
  {
    name: "Ishendra Agarwal",
    role: "Co-Founder, GIVA",
    imagePath: "public/images/hero_founders_images/7.png",
    scaleFactor: 1.5,
    positionX: 0,
    positionY: -12,
    squareScaleFactor: 1.2,
    squarePositionX: 0,
    squarePositionY: 0,
  },
  {
    name: "Anand Agrawal",
    role: "Co-Founder, Credgenics",
    imagePath: "public/images/hero_founders_images/6.png",
    scaleFactor: 1.5,
    positionX: 0,
    positionY: -10,
    squareScaleFactor: 1,
    squarePositionX: 0,
    squarePositionY: 0,
  },
  {
    name: "Ruchi Kalra",
    role: "Co-Founder, Ofbusiness",
    imagePath: "public/images/hero_founders_images/4.png",
    scaleFactor: 1.5,
    positionX: 0,
    positionY: -15,
    squareScaleFactor: 1,
    squarePositionX: 0,
    squarePositionY: 0,
  },
];

const TEXT = {
  titleLine1: "Backing Founder",
  titleLine2Before: "For Enduring",
  titleLine2Emphasis: "Impact",
  subtitle:
    "We partner with entrepreneurs from day one. We invest conviction, not just capital, and stay by their side through every stage of their journey.",
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
        scaleFactor: entry.scaleFactor ?? 1,
        positionX: entry.positionX ?? 0,
        positionY: entry.positionY ?? 0,
        squareScaleFactor: entry.squareScaleFactor ?? 1,
        squarePositionX: entry.squarePositionX ?? 0,
        squarePositionY: entry.squarePositionY ?? 0,
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
  console.log(`  ${founders.length} founder cards. Logo anchor: ${founders.find((f) => f.isLogo)?.name ?? "—"}`);
  console.log("\nNext:");
  console.log("  1. Restart the Next.js dev server so the updated GROQ query is picked up.");
  console.log("  2. Open Sanity Studio → 'Home — Hero Section' → click Publish if needed.\n");
}

main().catch((err) => {
  console.error("\n✗ Import failed:", err);
  process.exit(1);
});
