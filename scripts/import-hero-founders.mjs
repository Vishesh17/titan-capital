/**
 * One-shot Sanity import — Home Hero founder lists.
 *
 *   USAGE:
 *     node --env-file=.env.local scripts/import-hero-founders.mjs
 *
 *   WHAT IT DOES:
 *     1. Uploads every referenced image to Sanity assets ONCE (deduped by
 *        file path — an image reused across both lists is uploaded once).
 *     2. Patches the singleton "hero" document with TWO founder lists:
 *          • founders    → the curated film-strip / vertical-line set
 *                          (small; logo anchor in the middle).
 *          • allFounders → EVERY founder photo, cycled through in the intro
 *                          slideshow flicker + the rotating heading photo.
 *     3. Preserves any headline/subtitle/CTA text you've already edited in
 *        Studio (uses setIfMissing for text, set for the two arrays).
 *
 *   EDIT THE TWO LISTS BELOW to add/remove founders or retune framing:
 *     - scaleFactor / positionX / positionY          → heading-photo slot
 *     - squareScaleFactor / squarePositionX/Y         → slideshow card
 *
 *   AFTER RUNNING:
 *     Open Sanity Studio → "Home — Hero Section" → click Publish.
 *     Restart the Next.js dev server so the updated GROQ query is picked up.
 *
 *   REQUIRES:
 *     SANITY_API_WRITE_TOKEN in .env.local (Editor scope).
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
      "  Run with: node --env-file=.env.local scripts/import-hero-founders.mjs"
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

/** Stable singleton document ID (same as import-hero.mjs). */
const DOC_ID = "hero-singleton";

const IMG_DIR = "public/images/hero_founders_images";

/* ════════════════════════════════════════════════════════
   1) CURATED FILM-STRIP SET  →  hero.founders
   The card at index 3 (the logo) is the visual anchor of the fanned deck.
   Keep this small (8–9). Framing fields tune the heading + slideshow.
   ════════════════════════════════════════════════════════ */
const FOUNDERS = [
  { name: "Abhiraj Singh Bhal", role: "Co-Founder, Urban Company",   imagePath: `${IMG_DIR}/16.png`, scaleFactor: 1.5, positionX: 0, positionY: 0,   squareScaleFactor: 1,   squarePositionX: -3, squarePositionY: 0 },
  { name: "Ashutosh Valani",    role: "Co-Founder, RENÉE Cosmetics", imagePath: `${IMG_DIR}/12.png`, scaleFactor: 1.5, positionX: 5, positionY: -5,  squareScaleFactor: 1,   squarePositionX: 0,  squarePositionY: 0 },
  { name: "Abhishek Bansal",    role: "Co-Founder, Shadowfax",       imagePath: `${IMG_DIR}/1.png`,  scaleFactor: 1.5, positionX: 0, positionY: -10, squareScaleFactor: 1,   squarePositionX: 0,  squarePositionY: 0 },
  { name: "Titan Capital",      role: "",                            imagePath: "public/images/logos/titancapitallogo.svg", isLogo: true, scaleFactor: 0.7, positionX: 0, positionY: 0, squareScaleFactor: 1, squarePositionX: 0, squarePositionY: 0 },
  { name: "Varun Khaitan",      role: "Co-Founder, Urban Company",   imagePath: `${IMG_DIR}/5.png`,  scaleFactor: 1.5, positionX: 0, positionY: -5,  squareScaleFactor: 1,   squarePositionX: 0,  squarePositionY: 0 },
  { name: "Ishendra Agarwal",   role: "Co-Founder, GIVA",            imagePath: `${IMG_DIR}/7.png`,  scaleFactor: 1.5, positionX: 0, positionY: -12, squareScaleFactor: 1.2, squarePositionX: 0,  squarePositionY: 0 },
  { name: "Anand Agrawal",      role: "Co-Founder, Credgenics",      imagePath: `${IMG_DIR}/6.png`,  scaleFactor: 1.5, positionX: 0, positionY: -10, squareScaleFactor: 1,   squarePositionX: 0,  squarePositionY: 0 },
  { name: "Ruchi Kalra",        role: "Co-Founder, Ofbusiness",      imagePath: `${IMG_DIR}/4.png`,  scaleFactor: 1.5, positionX: 0, positionY: -15, squareScaleFactor: 1,   squarePositionX: 0,  squarePositionY: 0 },
];

/* ════════════════════════════════════════════════════════
   2) FULL SET  →  hero.allFounders  (slideshow + rotating heading photo)
   Every photo 1–16. Reuses the tuned framing from FOUNDERS above where an
   image matches; the rest get a sensible default (nudged up for the face).
   ════════════════════════════════════════════════════════ */
const TUNED_BY_PATH = new Map(FOUNDERS.map((f) => [f.imagePath, f]));
const ALL_FOUNDERS = Array.from({ length: 16 }, (_, i) => {
  const imagePath = `${IMG_DIR}/${i + 1}.png`;
  const tuned = TUNED_BY_PATH.get(imagePath);
  return (
    tuned ?? {
      name: `Founder ${i + 1}`,
      imagePath,
      scaleFactor: 1.5,
      positionX: 0,
      positionY: -8,
      squareScaleFactor: 1,
      squarePositionX: 0,
      squarePositionY: 0,
    }
  );
});

/** Text defaults — only applied if the doc doesn't already have them. */
const TEXT_DEFAULTS = {
  titleLine1: "Backing Founders",
  titleLine2Before: "Building",
  titleLine2Emphasis: "Enduring Companies",
  subtitle:
    "We partner with entrepreneurs from day one. We invest conviction, not just capital, and stay by their side through every stage of their journey.",
  primaryCtaLabel: "Get Investment",
  secondaryCtaLabel: "View Portfolio",
};

/* ────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────── */
const assetCache = new Map(); // imagePath → assetId (upload once)

async function uploadOnce(imagePath) {
  if (assetCache.has(imagePath)) return assetCache.get(imagePath);
  const absPath = path.resolve(REPO_ROOT, imagePath);
  if (!fs.existsSync(absPath)) {
    console.log(`    ✗ image not found: ${imagePath} — skipping`);
    return null;
  }
  const buffer = fs.readFileSync(absPath);
  const asset = await client.assets.upload("image", buffer, {
    filename: path.basename(absPath),
  });
  assetCache.set(imagePath, asset._id);
  console.log(`    ✓ ${imagePath}`);
  return asset._id;
}

const key = (name, i) => `${String(name).replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-${i}`;

function imageField(assetId) {
  return { _type: "image", asset: { _type: "reference", _ref: assetId } };
}

async function buildFounders(list, typeName) {
  const out = [];
  for (let i = 0; i < list.length; i++) {
    const e = list[i];
    const assetId = await uploadOnce(e.imagePath);
    if (!assetId) continue;
    out.push({
      _key: key(e.name, i),
      _type: typeName,
      name: e.name ?? "",
      ...(typeName === "heroFounder"
        ? { role: e.role ?? "", isLogo: e.isLogo === true }
        : {}),
      scaleFactor: e.scaleFactor ?? 1,
      positionX: e.positionX ?? 0,
      positionY: e.positionY ?? 0,
      squareScaleFactor: e.squareScaleFactor ?? 1,
      squarePositionX: e.squarePositionX ?? 0,
      squarePositionY: e.squarePositionY ?? 0,
      image: imageField(assetId),
    });
  }
  return out;
}

/* ────────────────────────────────────────────────────────
   Main
   ──────────────────────────────────────────────────────── */
async function main() {
  console.log("→ Uploading images (deduped)…\n");
  console.log("  Curated film-strip set (hero.founders):");
  const founders = await buildFounders(FOUNDERS, "heroFounder");
  console.log("\n  Full set (hero.allFounders):");
  const allFounders = await buildFounders(ALL_FOUNDERS, "heroAllFounder");

  if (founders.length === 0 && allFounders.length === 0) {
    console.error("\n✗ Nothing uploaded — aborting.");
    process.exit(1);
  }

  console.log(`\n→ Patching hero document (id: ${DOC_ID})…`);
  await client.createIfNotExists({ _id: DOC_ID, _type: "hero" });
  await client
    .patch(DOC_ID)
    .setIfMissing(TEXT_DEFAULTS)
    .set({ founders, allFounders })
    .commit();

  console.log(`\n✓ Done.`);
  console.log(`   founders (film-strip): ${founders.length}`);
  console.log(`   allFounders (slideshow + heading): ${allFounders.length}`);
  console.log("\nNext:");
  console.log("  1. Restart the Next.js dev server (picks up the updated GROQ query).");
  console.log("  2. Sanity Studio → 'Home — Hero Section' → Publish.\n");
}

main().catch((err) => {
  console.error("\n✗ Import failed:", err);
  process.exit(1);
});
