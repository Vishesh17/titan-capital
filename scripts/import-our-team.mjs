/**
 * One-shot Sanity import — Our Team page singleton.
 *
 *   USAGE:
 *     set -a; source .env.local; set +a
 *     node scripts/import-our-team.mjs
 *
 *   Writes (or replaces) the singleton "ourTeam" document with the three
 *   team arrays. Each member is an inline object with a slug that drives
 *   the /ourteam/<slug> detail page.
 *
 *   ── FILL IN EACH MEMBER BELOW ──
 *   Every field a member can have is listed in the array. Fill what you
 *   have; LEAVE "" TO OMIT a field entirely — omitted fields are NOT
 *   written to Sanity and therefore DON'T render on the site (no empty
 *   title, no dead social icon, no blank bio card).
 *
 *     name        (required) Full name — also drives the /ourteam/<slug> URL.
 *     title       Job title (e.g. "Investment Analyst").
 *     image       LOCAL file path relative to the repo root, e.g.
 *                 "public/images/team/chetan.jpg". The photo is uploaded to
 *                 Sanity automatically. Leave "" for no photo.
 *     bio         Long text shown on the detail page. Use \n for line breaks.
 *     linkedinUrl Full https URL.
 *     emailUrl    "someone@titancapital.vc"  OR  "mailto:someone@...".
 *     twitterUrl  Full https URL (X / Twitter).
 *
 *   Re-run any time — it uses createOrReplace, so it's safe to run again.
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
    "✗ SANITY_API_WRITE_TOKEN missing.\n" +
      "  Run with env loaded:\n" +
      "    set -a; source .env.local; set +a; node scripts/import-our-team.mjs"
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

const DOC_ID = "ourTeam-singleton";

const HEADING_FIRST = "Meet The";
const HEADING_SECOND = "Full Team.";

/* ─────────────────────────────────────────────────────────
   Source of truth — every team member, grouped by team.
   Fill each field; leave "" to omit it (won't show on the site).
   ───────────────────────────────────────────────────────── */

const TEAM_DATA = {
  corporateTeam: [
    { name: "Chetan Rana",     title: "CFO, Titan Capital Winners Fund",                                  image: "", bio: "", linkedinUrl: "https://www.linkedin.com/in/chetan-r-2a804045/", emailUrl: "", twitterUrl: "" },
    { name: "Aakriti Kakkar",  title: "Vice President, Corporate Development", image: "", bio: "", linkedinUrl: "https://www.linkedin.com/in/aakriti-kakkar/", emailUrl: "", twitterUrl: "" },
    { name: "Supriya Gupta",   title: "Community Marketing Lead",             image: "", bio: "", linkedinUrl: "", emailUrl: "", twitterUrl: "" },
    { name: "Aditi Jain",      title: "Associate Investment Director",        image: "", bio: "", linkedinUrl: "", emailUrl: "", twitterUrl: "" },
    { name: "Manya Awasthi",   title: "Manager — Investment Operations",      image: "", bio: "", linkedinUrl: "", emailUrl: "", twitterUrl: "" },
    { name: "Ram Damani",      title: "Manager — Finance and Operations",     image: "", bio: "", linkedinUrl: "", emailUrl: "", twitterUrl: "" },
    { name: "Aashray Satija",  title: "Corporate Development",                image: "", bio: "", linkedinUrl: "", emailUrl: "", twitterUrl: "" },
  ],
  seedTeam: [
    { name: "Manik Pasricha",   title: "Vice President",     image: "", bio: "", linkedinUrl: "", emailUrl: "", twitterUrl: "" },
    { name: "Utpal Sharma",     title: "Vice President",     image: "", bio: "", linkedinUrl: "", emailUrl: "", twitterUrl: "" },
    { name: "Preetit Singhi",   title: "Associate",          image: "", bio: "", linkedinUrl: "", emailUrl: "", twitterUrl: "" },
    { name: "Chiragh Cariappa", title: "Investment Analyst", image: "", bio: "", linkedinUrl: "", emailUrl: "", twitterUrl: "" },
    { name: "Aditya Jaikumar",  title: "Investment Analyst", image: "", bio: "", linkedinUrl: "", emailUrl: "", twitterUrl: "" },
    { name: "Geetansh Popli",   title: "Investment Analyst", image: "", bio: "", linkedinUrl: "", emailUrl: "", twitterUrl: "" },
  ],
  winnerFundTeam: [
    { name: "Shiv Kapoor",   title: "Vice President",     image: "", bio: "", linkedinUrl: "", emailUrl: "", twitterUrl: "" },
    { name: "Vrinda Gupta",  title: "Investment Analyst", image: "", bio: "", linkedinUrl: "", emailUrl: "", twitterUrl: "" },
    { name: "Vatsal Singh",  title: "Investment Analyst", image: "", bio: "", linkedinUrl: "", emailUrl: "", twitterUrl: "" },
  ],
};

/* ── Helpers ── */

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Upload a LOCAL image once (deduped by path) → Sanity image field.
// Returns undefined for empty/missing paths so the field is omitted.
const assetCache = new Map();
async function uploadImage(imagePath) {
  if (!imagePath) return undefined;
  if (assetCache.has(imagePath)) return assetCache.get(imagePath);

  const abs = path.resolve(REPO_ROOT, imagePath);
  if (!fs.existsSync(abs)) {
    console.warn(`  ⚠ image not found — skipping: ${imagePath}`);
    return undefined;
  }

  const asset = await client.assets.upload("image", fs.readFileSync(abs), {
    filename: path.basename(abs),
  });
  const field = { _type: "image", asset: { _type: "reference", _ref: asset._id } };
  assetCache.set(imagePath, field);
  console.log(`  ✓ uploaded ${imagePath}`);
  return field;
}

async function buildMember(input, index) {
  const member = {
    _key: `member-${slugify(input.name)}-${index}`,
    _type: "teamMember",
    name: input.name,
    slug: { _type: "slug", current: slugify(input.name) },
    title: input.title || undefined,
    image: await uploadImage(input.image),
    bio: input.bio || undefined,
    linkedinUrl: input.linkedinUrl || undefined,
    emailUrl: input.emailUrl || undefined,
    twitterUrl: input.twitterUrl || undefined,
  };
  // Drop empty fields entirely so they never render on the site.
  Object.keys(member).forEach((k) => member[k] === undefined && delete member[k]);
  return member;
}

async function buildTeam(list) {
  const out = [];
  for (let i = 0; i < list.length; i++) out.push(await buildMember(list[i], i));
  return out;
}

async function main() {
  console.log("→ Uploading photos (if any) and building the document...\n");

  const corporateTeam = await buildTeam(TEAM_DATA.corporateTeam);
  const seedTeam = await buildTeam(TEAM_DATA.seedTeam);
  const winnerFundTeam = await buildTeam(TEAM_DATA.winnerFundTeam);

  const doc = {
    _id: DOC_ID,
    _type: "ourTeam",
    headingFirst: HEADING_FIRST,
    headingSecond: HEADING_SECOND,
    corporateTeam,
    seedTeam,
    winnerFundTeam,
  };

  console.log("\n→ Writing ourTeam singleton...");
  const result = await client.createOrReplace(doc);

  console.log(`✓ Document written: ${result._id}`);
  console.log(
    `\n  Corporate: ${corporateTeam.length} members` +
      `\n  Seed:      ${seedTeam.length} members` +
      `\n  Winner:    ${winnerFundTeam.length} members`
  );
  console.log("\nDone. Refresh /ourteam on your dev server.\n");
}

main().catch((err) => {
  console.error("\n✗ Import failed:", err);
  process.exit(1);
});
