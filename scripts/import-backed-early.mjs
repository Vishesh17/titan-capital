/**
 * One-shot Sanity import — Portfolio "Backed Early. Built To Last" hero.
 *
 *   USAGE:
 *     node --env-file=.env.local scripts/import-backed-early.mjs
 *
 *   WHAT IT DOES:
 *     1. Uploads each company's background photo and logo from public/images
 *     2. Creates (or replaces) the "backedEarly" singleton with the headings
 *        and the 12 marquee cards.
 *
 *   Mirrors FALLBACK_COMPANIES in BackedEarlyClient.tsx — keep the two in step.
 *
 *   AFTER RUNNING:
 *     Sanity Studio → "Portfolio — Backed Early Hero" → Publish.
 *
 *   REQUIRES:
 *     SANITY_API_WRITE_TOKEN in .env.local (Editor scope)
 */

import { createClient } from "@sanity/client";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error(
    "✗ SANITY_API_WRITE_TOKEN missing from environment.\n" +
      "  Run with: node --env-file=.env.local scripts/import-backed-early.mjs"
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

const HEADING_FIRST = "Backed Early";
const HEADING_SECOND = "Built To Last";

const BG = "public/images/portfolio";
const LOGO = "public/images/logos_backup";

/* Logos here must be TIGHTLY CROPPED. They are sized by their box, so a mark
   padded inside a large square canvas renders small. */
const COMPANIES = [
  { name: "Shadowfax",     bg: `${BG}/shadowfax.webp`,    logo: `${LOGO}/Shadowfax.svg`,                logoScale: 1.2 },
  { name: "Credgenics",    bg: `${BG}/credgenics.webp`,   logo: `${LOGO}/Credgenics.svg`,               logoScale: 0.9 },
  { name: "OLA",           bg: `${BG}/ola_bg.webp`,       logo: `${LOGO}/ola.svg`,                      logoScale: 0.7 },
  { name: "Zouk",          bg: `${BG}/zouk.webp`,         logo: `${LOGO}/zouk_new_logo.webp`,           logoScale: 0.8 },
  { name: "Unicommerce",   bg: `${BG}/unicommerce.webp`,  logo: `${LOGO}/unicommerce-logo.svg`,         logoScale: 1.0 },
  { name: "Khatabook",     bg: `${BG}/khatabook.webp`,    logo: `${LOGO}/khatabook.png`,                logoScale: 1.2, logoClass: "translate-y-[5px]" },
  { name: "Mamaearth",     bg: `${BG}/mamaearth.webp`,    logo: `${LOGO}/mamaearth_new.webp`,           logoScale: 1.0 },
  { name: "Cart.com",      bg: `${BG}/cartdotcom.webp`,   logo: `${LOGO}/cartdotcom.svg`,               logoScale: 1.0, noInvert: true },
  { name: "Razorpay",      bg: `${BG}/razorpay.webp`,     logo: `${LOGO}/Razorpay-logo.webp`,           logoScale: 1.0 },
  { name: "Snapdeal",      bg: `${BG}/snapdeal.webp`,     logo: `${LOGO}/snapdeal-company-1-logo.webp`, logoScale: 1.0 },
  { name: "Urban Company", bg: `${BG}/urbancompany.webp`, logo: `${LOGO}/uc_white.png`,                 logoScale: 1.0 },
  { name: "Ofbusiness",    bg: `${BG}/ofbusiness.webp`,   logo: `${LOGO}/ofbusiness_white.svg`,         logoScale: 1.0 },
];

const DOC_ID = "backedEarly-singleton";

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

async function main() {
  /* Pre-flight: check every file exists AND actually decodes, before uploading
     anything. Sanity rejects images it can't process — e.g. Illustrator SVGs
     carrying invalid namespace URIs like xmlns:i="ns_ai;" — and without this
     the run dies halfway through, having already uploaded assets. */
  const paths = COMPANIES.flatMap((c) => [c.bg, c.logo]);
  const problems = [];
  for (const p of paths) {
    const abs = path.resolve(REPO_ROOT, p);
    if (!fs.existsSync(abs)) {
      problems.push(`${p} — not found`);
      continue;
    }
    try {
      await sharp(abs).metadata();
    } catch (err) {
      problems.push(`${p} — unreadable (${err.message.split("\n")[0]})`);
    }
  }
  if (problems.length) {
    console.error("✗ Fix these before importing:\n" + problems.map((m) => "   " + m).join("\n"));
    process.exit(1);
  }

  console.log(`Uploading ${COMPANIES.length} companies (photo + logo each)\n`);

  const companies = [];
  for (const [i, c] of COMPANIES.entries()) {
    process.stdout.write(`  ${c.name.padEnd(16)} `);
    const [bgId, logoId] = await Promise.all([uploadImage(c.bg), uploadImage(c.logo)]);
    companies.push({
      _type: "backedEarlyCompany",
      _key: makeKey(c.name, i),
      name: c.name,
      logoScale: c.logoScale ?? 1,
      ...(c.logoClass ? { logoClass: c.logoClass } : {}),
      ...(c.noInvert ? { noInvert: true } : {}),
      bgImage: imageRef(bgId),
      logo: imageRef(logoId),
    });
    console.log("✓");
  }

  await client.createOrReplace({
    _id: DOC_ID,
    _type: "backedEarly",
    headingFirst: HEADING_FIRST,
    headingSecond: HEADING_SECOND,
    companies,
  });

  console.log(`\n✓ ${companies.length} companies written to ${DOC_ID}`);
  console.log("  Next: Sanity Studio → 'Portfolio — Backed Early Hero' → Publish.");
}

main().catch((err) => {
  console.error("\n✗ Import failed:", err.message);
  process.exit(1);
});
