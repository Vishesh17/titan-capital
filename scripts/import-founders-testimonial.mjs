/**
 * One-shot Sanity import — Founders Testimonial section.
 *
 *   USAGE:
 *     node --env-file=.env.local scripts/import-founders-testimonial.mjs
 *
 *   WHAT IT DOES:
 *     1. Reads the 6 testimonials hardcoded below
 *     2. Uploads each founder portrait from public/images/... to Sanity
 *     3. Creates (or replaces) the singleton "foundersTestimonial" document
 *        with text + image references all wired up.
 *
 *   AFTER RUNNING:
 *     Open Sanity Studio → "Home — Founders Testimonial Section"
 *     → click Publish. That's it.
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
      "  Run with: node --env-file=.env.local scripts/import-founders-testimonial.mjs"
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
   Source content — matches the hardcoded fallback in
   FoundersTestimonialClient.tsx. Edit the TEXT here if you
   want different wording; image paths are relative to /public.
   ──────────────────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    name: "Abhiraj Bahl",
    role: "Cofounder, Urban Company",
    imagePath: "public/images/hero_founders_images/abhiraj_bahl.png",
    text: "”Kunal and Rohit were the first investors to believe in Urban Company, even before we launched the platform or decided on the name. Their unwavering support has been a constant throughout our journey, guiding us through ups and downs. As Founders, we deeply value their mentorship and friendship. An early-stage company couldn’t ask for better partners than Titan Capital.”",
    longText: false,
  },
  {
    name: "Disha Singh",
    role: "Cofounder, Zouk",
    imagePath: "public/images/Testimonials/disha-singh.avif",
    text: "”Titan Capital has been an invaluable partner in our journey to build Zouk. Kunal and Rohit have consistently provided invaluable guidance on cultivating a long-lasting business with strong brand loyalty. Their counsel has been instrumental in guiding our focus on critical areas such as efficient working capital management, deep category penetration, and developing a sustainable competitive advantage.”",
    longText: true,
  },
  {
    name: "Rishabh Goel",
    role: "Cofounder, Credgenics",
    imagePath: "public/images/Testimonials/Rishabh.jpeg",
    text: "“Titan Capital has been more than just an investor for Credgenics - they’ve been our first partner in this journey. Our early conversations made it clear that they weren’t your typical investors. Despite us venturing into a relatively complex and niche segment of debt collections, they backed us with insights and shared perspectives that reshaped how we approached the key challenges.”",
    longText: true,
  },
  {
    name: "Raghu Ravinutala",
    role: "Cofounder, Yellow.ai",
    imagePath: "public/images/Testimonials/Raghu-Ravinutala.webp",
    text: "“Titan Capital is truly ‘founder only’. From the first interaction, I was very overwhelmed with their focus on making the founder successful beyond anything. They were always there as a great sounding board whenever we had to make critical decisions. I always felt Titan Capital had our back whatever is the situation and that’s a great support an early-stage founder can have.”",
    longText: false,
  },
  {
    name: "Aarti Gill",
    role: "Cofounder, OZiva",
    imagePath: "public/images/Testimonials/Aarti Gill.png",
    text: "“When I first met Kunal, I wasn’t even considering raising equity capital - but that one conversation completely changed my perspective. Partnering with Titan Capital was one of the best decisions we made at OZiva. With Kunal’s guidance, I learned not just business strategies like fundraising, negotiation, and stakeholder management, but also invaluable life lessons.”",
    longText: false,
  },
  {
    name: "Anand Yadav",
    role: "Cofounder, Mekr",
    imagePath: "public/images/Testimonials/Anand_yadav.png",
    text: "“Titan Capital was among the first to believe in what we were building at Mekr and backed us when it mattered most. Since then, they have gone beyond capital - offering strategic guidance, opening doors through their network, and supporting us through every stage of our journey. Their founder-first mindset makes them the kind of partner every founder hopes to have by their side.”",
    longText: false,
  },
];

/** Stable singleton document ID — re-running the script overwrites it
 *  instead of creating duplicates. */
const DOC_ID = "foundersTestimonial-singleton";

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

function makeKey(seed, i) {
  // Sanity arrays require each item to have a unique `_key`.
  return `${seed.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-${i}`;
}

/* ────────────────────────────────────────────────────────
   Main
   ──────────────────────────────────────────────────────── */
async function main() {
  console.log("→ Uploading testimonial portraits to Sanity assets...\n");

  const items = [];
  for (let i = 0; i < TESTIMONIALS.length; i++) {
    const t = TESTIMONIALS[i];
    const absPath = path.resolve(REPO_ROOT, t.imagePath);

    if (!fs.existsSync(absPath)) {
      console.log(`  ✗ ${t.name}: image not found at ${t.imagePath} — skipping`);
      continue;
    }

    process.stdout.write(`  • ${t.name.padEnd(22, " ")}`);
    try {
      const assetId = await uploadImage(absPath);
      console.log(` ✓ uploaded`);

      items.push({
        _key: makeKey(t.name, i),
        _type: "testimonialItem",
        name: t.name,
        role: t.role,
        text: t.text,
        longText: !!t.longText,
        image: {
          _type: "image",
          asset: { _type: "reference", _ref: assetId },
        },
      });
    } catch (err) {
      console.log(` ✗ ${err.message}`);
    }
  }

  if (items.length === 0) {
    console.error("\n✗ No testimonials uploaded — aborting document write.");
    process.exit(1);
  }

  console.log(`\n→ Writing foundersTestimonial document (id: ${DOC_ID})...\n`);

  const doc = {
    _id: DOC_ID,
    _type: "foundersTestimonial",
    topHeadingFirst: "What Our",
    topHeadingSecond: "Founders Say",
    bottomHeadingFirst: "We're Listening.",
    bottomHeadingSecond: "Tell Us What You're Building.",
    ctaLabel: "Get Investment",
    testimonials: items,
  };

  const result = await client.createOrReplace(doc);

  console.log(`✓ Document written: ${result._id}`);
  console.log(`  ${items.length} testimonials, ${items.length} portraits uploaded.`);
  console.log("\nNext: open Sanity Studio → 'Home — Founders Testimonial Section'");
  console.log("       click Publish (bottom-right). Then refresh /portfolio in your dev server.\n");
}

main().catch((err) => {
  console.error("\n✗ Import failed:", err);
  process.exit(1);
});
