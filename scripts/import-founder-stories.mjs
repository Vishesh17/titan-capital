/**
 * One-shot Sanity import — "Their Stories, Our Credentials" cards.
 *
 *   USAGE:
 *     node --env-file=.env.local scripts/import-founder-stories.mjs
 *
 *   WHAT IT DOES:
 *     1. Uploads each founder photo and company logo from
 *        public/images/FounderStories/ to Sanity
 *     2. PATCHES the existing "impactAtGlance" singleton's `founderStories`
 *        field only — headings, impactStats and ctaLabel are left untouched.
 *        (createOrReplace would wipe them.)
 *
 *   AFTER RUNNING:
 *     Sanity Studio → "Home — Impact & Stories Section" → Publish.
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

const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error(
    "✗ SANITY_API_WRITE_TOKEN missing from environment.\n" +
      "  Run with: node --env-file=.env.local scripts/import-founder-stories.mjs"
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
   Source content — mirrors FALLBACK_SLIDES in
   ImpactAtGlanceClient.tsx. Keep the two in step.

   Tag convention: 1) sector  2) stage + year  3) milestone.
   ──────────────────────────────────────────────────────── */
const IMG = "public/images/FounderStories";
/* Logos come from the shared portfolio-grid set so every company uses one
   canonical mark. They are 400x400 canvases with the artwork letterboxed
   inside, so each story carries a `logoScale` that zooms it back to a
   consistent visual height (measured from each mark's trimmed bounding box). */
const LOGO = "public/images/portfolio_grid";

const STORIES = [
  {
    name: "Abhiraj Singh Bhal",
    role: "Cofounder & CEO, Urban Company",
    imagePath: `${IMG}/Urban Company.webp`,
    logoPath: `${LOGO}/Urban Company.png`,
    logoOffsetY: -20,
    logoScale: 1.52,
    text: `"Nobody wants a marketplace of plumbers. They want the plumber to show up and do the job well."`,
    tags: ["Home Services", "Series A · 2015", "Listed 2025"],
  },
  {
    name: "Varun Alagh",
    role: "Co-Founder, Mamaearth",
    imagePath: `${IMG}/Mamaearth.webp`,
    logoPath: `${LOGO}/mamaearth_new.png`,
    logoOffsetY: 67,
    logoScale: 3.25,
    text: `"Every brand says it wants to be in every home in India. Very few are willing to rebuild their distribution to actually get there."`,
    tags: ["Consumer Brands", "Series B · 2017", "Listed 2023"],
  },
  {
    name: "Asish Mohapatra",
    role: "Co-Founder & CEO, Ofbusiness",
    imagePath: `${IMG}/Ofbusiness.webp`,
    logoPath: `${LOGO}/Ofbusiness.png`,
    logoScale: 2,
    text: `"Whatever is unsexy, there's more profit. Everybody wants to be glamorous, so that's where the competition is."`,
    tags: ["B2B Commerce & Lending", "Seed · 2015", "Profitable at scale"],
  },
  {
    name: "Harshil Mathur",
    role: "CEO & Co-Founder, Razorpay",
    imagePath: `${IMG}/Razorpay.webp`,
    logoPath: `${LOGO}/Razorpay-logo.png`,
    logoScale: 2,
    text: `"A payment gateway that takes three weeks to integrate isn't infrastructure. It's a project."`,
    tags: ["Payments Infrastructure", "Seed · 2015", "10M+ businesses"],
  },
  {
    name: "Vaibhav Khandelwal",
    role: "Co-founder & CTO, Shadowfax",
    imagePath: `${IMG}/Shadowfax.webp`,
    logoPath: `${LOGO}/Shadowfax.png`,
    logoScale: 2,
    text: `"In India, logistics isn't about speed. It is about reaching the right place even when the address is wrong."`,
    tags: ["Last-Mile Logistics", "Seed · 2015", "Listed 2026"],
  },
  {
    name: "Rishabh Goel",
    role: "Co-founder & CEO, Credgenics",
    imagePath: `${IMG}/Credgenics.webp`,
    logoPath: `${LOGO}/Credgenics.png`,
    logoOffsetY: 14,
    logoScale: 2.21,
    text: `"Lending is a collections industry. Money can be distributed easily; the core of the business is getting it back."`,
    tags: ["AI-first Collections Software", "Pre-seed · 2019", "Profitable, SE Asia"],
  },
];

/* ────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────── */
const uploadCache = new Map();

async function uploadImage(relPath) {
  if (uploadCache.has(relPath)) return uploadCache.get(relPath);
  const abs = path.resolve(REPO_ROOT, relPath);
  if (!fs.existsSync(abs)) throw new Error(`file not found: ${relPath}`);
  const asset = await client.assets.upload("image", fs.readFileSync(abs), {
    filename: path.basename(abs),
  });
  uploadCache.set(relPath, asset._id);
  return asset._id;
}

const imageRef = (id) => ({ _type: "image", asset: { _type: "reference", _ref: id } });
const makeKey = (seed, i) => `${seed.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-${i}`;

/* ────────────────────────────────────────────────────────
   Main
   ──────────────────────────────────────────────────────── */
async function main() {
  const existing = await client.fetch(`*[_type == "impactAtGlance"][0]{_id}`);
  const docId = existing?._id ?? "impactAtGlance-singleton";
  console.log(
    existing
      ? `Patching existing document ${docId}\n`
      : `No impactAtGlance document found — creating ${docId}\n`
  );

  const founderStories = [];
  for (const [i, s] of STORIES.entries()) {
    process.stdout.write(`  ${s.name.padEnd(20)} `);
    const [imageId, logoId] = await Promise.all([
      uploadImage(s.imagePath),
      uploadImage(s.logoPath),
    ]);
    founderStories.push({
      _type: "founderStory",
      _key: makeKey(s.name, i),
      name: s.name,
      role: s.role,
      text: s.text,
      tags: s.tags,
      logoScale: s.logoScale ?? 1,
      logoOffsetY: s.logoOffsetY ?? 0,
      image: imageRef(imageId),
      logo: imageRef(logoId),
    });
    console.log("✓ photo + logo uploaded");
  }

  if (existing) {
    // Patch only this field so headings / impactStats / ctaLabel survive.
    await client.patch(docId).set({ founderStories }).commit();
  } else {
    await client.createOrReplace({ _id: docId, _type: "impactAtGlance", founderStories });
  }

  console.log(`\n✓ ${founderStories.length} founder stories written to ${docId}`);
  console.log("  Next: Sanity Studio → 'Home — Impact & Stories Section' → Publish.");
}

main().catch((err) => {
  console.error("\n✗ Import failed:", err.message);
  process.exit(1);
});
