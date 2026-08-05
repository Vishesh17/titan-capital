/**
 * One-shot Sanity import — Our Team page singleton.
 *
 *   USAGE:
 *     set -a; source .env.local; set +a
 *     node scripts/import-our-team.mjs
 *
 *   Writes (or replaces) the singleton "ourTeam" document with the
 *   three team arrays. Each member is an inline object with a slug
 *   that drives the /ourteam/<slug> detail page.
 *
 *   Editing workflow:
 *     1. Edit the TEAM_DATA constant below to add/remove/change members
 *     2. Re-run this script — it uses createOrReplace so it's safe to
 *        run any number of times
 *     3. After uploading, edit individual members in Studio to add
 *        photos, bios, and real social links
 *
 *   No images are uploaded here. Photos must be uploaded in Studio
 *   one-by-one (Sanity hot-spot crops require a UI). The script
 *   leaves the image field empty; Studio shows an upload button.
 */

import { createClient } from "@sanity/client";

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

/* ─────────────────────────────────────────────────────────
   Source of truth — every team member, grouped by team.
   ───────────────────────────────────────────────────────── */

const TEAM_DATA = {
  corporateTeam: [
    { name: "Chetan Rana", title: "CFO" },
    { name: "Aakriti Kakkar", title: "Vice President, Corporate Development" },
    { name: "Supriya Gupta", title: "Community Marketing Lead" },
    { name: "Aditi Jain", title: "Associate Investment Director" },
    { name: "Manya Awasthi", title: "Manager — Investment Operations" },
    { name: "Ram Damani", title: "Manager — Finance and Operations" },
    { name: "Aashray Satija", title: "Corporate Development" },
  ],
  seedTeam: [
    { name: "Manik Pasricha", title: "Vice President" },
    { name: "Utpal Sharma", title: "Vice President" },
    { name: "Preetit Singhi", title: "Associate" },
    { name: "Chiragh Cariappa", title: "Investment Analyst" },
    { name: "Aditya Jaikumar", title: "Investment Analyst" },
    { name: "Geetansh Popli", title: "Investment Analyst" },
  ],
  winnerFundTeam: [
    { name: "Shiv Kapoor", title: "Vice President" },
    { name: "Vrinda Gupta", title: "Investment Analyst" },
    { name: "Vatsal Singh", title: "Investment Analyst" },
  ],
};

const HEADING_FIRST = "Meet The";
const HEADING_SECOND = "Full Team.";

/* ── Helpers ── */

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toMember(input, index) {
  return {
    _key: `member-${slugify(input.name)}-${index}`,
    _type: "teamMember",
    name: input.name,
    slug: { _type: "slug", current: slugify(input.name) },
    title: input.title,
    bio: input.bio || undefined,
    linkedinUrl: input.linkedinUrl || undefined,
    emailUrl: input.emailUrl || undefined,
    twitterUrl: input.twitterUrl || undefined,
  };
}

async function main() {
  const doc = {
    _id: DOC_ID,
    _type: "ourTeam",
    headingFirst: HEADING_FIRST,
    headingSecond: HEADING_SECOND,
    corporateTeam: TEAM_DATA.corporateTeam.map(toMember),
    seedTeam: TEAM_DATA.seedTeam.map(toMember),
    winnerFundTeam: TEAM_DATA.winnerFundTeam.map(toMember),
  };

  console.log("→ Writing ourTeam singleton...\n");

  const result = await client.createOrReplace(doc);

  console.log(`✓ Document written: ${result._id}`);
  console.log(
    `\n  Corporate: ${doc.corporateTeam.length} members` +
      `\n  Seed:      ${doc.seedTeam.length} members` +
      `\n  Winner:    ${doc.winnerFundTeam.length} members`
  );
  console.log(
    "\nDone. Refresh /ourteam on your dev server, then open /studio\n" +
      "→ \"Our Team Page\" to upload photos and add social links.\n"
  );
}

main().catch((err) => {
  console.error("\n✗ Import failed:", err);
  process.exit(1);
});
