/**
 * One-shot Sanity import — every section on /indicorns.
 *
 *   USAGE:
 *     node --env-file=.env.local scripts/import-indicorns-page.mjs
 *
 *   WHAT IT DOES:
 *     Creates (or replaces) the four singletons behind the page:
 *       1. indicornsHero        — the folded card that unfolds on scroll
 *       2. whyIndicorns         — story + timeline carousel
 *       3. indicornCompanies    — "Indicorns We Backed" cards
 *       4. indicornTestimonials — founder quotes on the 3D cylinder
 *
 *     Images referenced below are uploaded from /public when the file exists.
 *     Missing files are skipped with a warning rather than failing the run —
 *     an editor can upload them in Studio afterwards.
 *
 *   CONTENT SOURCE:
 *     Copied verbatim from the FALLBACK_* constants in the four client
 *     components, so importing changes nothing visually — it just moves the
 *     copy into the CMS.
 *
 *   AFTER RUNNING:
 *     Open Sanity Studio → each "Indicorns — ..." document → Publish.
 *
 *   REQUIRES: SANITY_API_WRITE_TOKEN in .env.local (Editor scope)
 *   Safe to re-run — uses createOrReplace.
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
      "  Run with: node --env-file=.env.local scripts/import-indicorns-page.mjs"
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
   Helpers
   ──────────────────────────────────────────────────────── */
const assetCache = new Map();

/** Upload a /public image once and reuse the asset id for repeat paths. */
async function uploadImage(publicPath) {
  if (!publicPath) return null;
  if (assetCache.has(publicPath)) return assetCache.get(publicPath);

  const abs = path.resolve(REPO_ROOT, "public", publicPath.replace(/^\//, ""));
  if (!fs.existsSync(abs)) {
    console.warn(`  ⚠ missing on disk, skipped: ${publicPath}`);
    assetCache.set(publicPath, null);
    return null;
  }
  const asset = await client.assets.upload("image", fs.readFileSync(abs), {
    filename: path.basename(abs),
  });
  console.log(`  ✓ ${publicPath}`);
  assetCache.set(publicPath, asset._id);
  return asset._id;
}

const imageRef = (id) =>
  id ? { _type: "image", asset: { _type: "reference", _ref: id } } : undefined;

const key = (seed, i) =>
  `${String(seed).replace(/[^a-zA-Z0-9]/g, "-").toLowerCase().slice(0, 40)}-${i}`;

/* ────────────────────────────────────────────────────────
   1. Hero — folded card
   ──────────────────────────────────────────────────────── */
const HERO = {
  headingPrefix: "What Are",
  wordmark: "/images/indicorns/Indi.png",
  panelOne:
    "For too long, India's startup ecosystem has measured success by a single metric borrowed from Silicon Valley: the unicorn — a company worth $1 billion or more. But a billion-dollar valuation is a number defined by someone else, in a currency that's not ours, against a benchmark that has no grounding in the reality of Indian business",
  panelTwo:
    "We asked a different question: what does real, enduring success look like in India?",
  panelThreeIntro: "The answer became Indicorn — a company that is",
  criteria: [
    { before: "Founded in", highlight: "India within the last 15 years", after: "" },
    { before: "Has crossed", highlight: "₹100 crore in annual revenue", after: "" },
    {
      before: "Has",
      highlight: "achieved profitability",
      after: "— building a business that sustains itself",
    },
  ],
};

/* ────────────────────────────────────────────────────────
   2. Why We Created — story + timeline
   ──────────────────────────────────────────────────────── */
const WHY = {
  headingTop: "Why We Created",
  headingBottom: "The Indicorns?",
  storyLabel: "September 2024",
  storyImage: "/images/indicorns/techsparks-stage.jpeg",
  storyParagraphs: [
    "On the main stage of YourStory's TechSparks India's largest startup summit - Kunal Bahl introduced one word to the ecosystem: Indicorn.",
    "It wasn't just a new word. It was a challenge to change how India defines, celebrates, and aspires toward success measured in revenue and profit, not a valuation set in someone else's currency.",
  ],
  // Deliberately different wording from desktop — preserved as-is.
  storyParagraphsMobile: [
    "On the main stage at TechSparks, India's largest startup summit, Kunal Bahl introduced a word the ecosystem didn't have: Indicorn.",
    "The businesses it described had been building quietly for years: profitable, growing, and largely unfunded. They had every marker of success except one: recognition. A month later, Titan Capital published the first list.",
  ],
  timeline: [
    {
      date: "September 2024",
      title: "The term is coined\n'Indicorn'.",
      desc: '"Indicorn" is unveiled on the TechSparks main stage naming a kind of company that always existed but was never celebrated.',
    },
    {
      date: "October 2024",
      title: "The First List",
      desc: "Titan Capital publishes the inaugural index, built to make the criteria clear and the data irrefutable.",
      statNumber: "186",
      statLabel: "Companies\nRecognized",
      statSub: "Powered by Tracxn - 3M+ Companies, 2,700\nsector",
    },
    {
      date: "2025",
      title: "The Moment Grows.",
      desc: "A year on, the index expands-proof that profitable, enduring businesses are scaling right across India.",
      statNumber: "202",
      statLabel: "Indicorns\nIdentified",
      statSub: "₹1,51,137 Cr in revenue, ₹7,393 Cr in profits",
    },
    {
      date: "2026",
      title: "The next list\nComing soon",
      desc: "The third edition is in preparation. If your company meets the criteria, tell us.",
    },
  ],
};

/* ────────────────────────────────────────────────────────
   3. Companies We Backed
   ──────────────────────────────────────────────────────── */
const COMPANIES = {
  heading: "Indicorns We Backed",
  companies: [
    {
      name: "Unicommerce",
      logo: "/images/portfolio_grid/unicommerce-logo.png",
      description:
        "India's leading e-commerce SaaS platform, enabling thousands of brands to manage multi-channel operations.",
      logoScale: 0.8,
    },
    {
      name: "Razorpay",
      logo: "/images/portfolio_grid/Razorpay-logo.png",
      description:
        "India's leading payments platform, powering online transactions for over 10 million businesses.",
      logoScale: 1.5,
    },
    {
      name: "OfBusiness",
      logo: "/images/portfolio_grid/Ofbusiness.png",
      description:
        "India's largest B2B raw materials platform, combining procurement and financing for manufacturing SMEs.",
      logoScale: 1.5,
    },
    {
      name: "Credgenics",
      logo: "/images/portfolio_grid/credgenics.png",
      description:
        "India's leading AI-powered debt collections platform, helping banks and lenders improve recovery efficiency.",
      logoScale: 1.5,
    },
  ],
};

/* ────────────────────────────────────────────────────────
   4. Founder testimonials
   ──────────────────────────────────────────────────────── */
const TESTIMONIALS = {
  headingTop: "What Founders Say",
  headingBottom: "About The Indicorns",
  description:
    "We asked founders from the Indicorn community what the recognition means to them — and how it changed the way they think about building a company.",
  testimonials: [
    {
      image: "/images/indicorns/kapil_makhija.png",
      quote:
        '"The unicorn framing was never ours. Indicorn is. It asks the right question: have you built something real? Have you built something that lasts? That\'s what we were always trying to do."',
      name: "Kapil Makhija",
      role: "CEO, Unicommerce",
    },
    {
      image: "/images/indicorns/Varun_alagh.png",
      quote:
        '"Profitability was always our north star. We built Mamaearth for the long run, not for the next funding round. The Indicorn term finally gives that philosophy a name."',
      name: "Varun Alagh",
      role: "Co-founder & CEO, Mamaearth",
    },
    {
      image: "/images/indicorns/kunal_bahl.png",
      quote:
        '"The unicorn framing was never ours. Indicorn is. It asks the right question: have you built something real? Have you built something that lasts? That\'s what we were always trying to do."',
      name: "Kunal Bahl",
      role: "Co-founder, Titan Capital",
    },
  ],
};

/* ────────────────────────────────────────────────────────
   Main
   ──────────────────────────────────────────────────────── */
async function main() {
  console.log("→ Uploading images...\n");

  const heroWordmark = await uploadImage(HERO.wordmark);
  const whyStoryImage = await uploadImage(WHY.storyImage);
  const companyLogos = [];
  for (const c of COMPANIES.companies) companyLogos.push(await uploadImage(c.logo));
  const founderPhotos = [];
  for (const t of TESTIMONIALS.testimonials) founderPhotos.push(await uploadImage(t.image));

  console.log("\n→ Writing documents...\n");

  const docs = [
    {
      _id: "indicornsHero-singleton",
      _type: "indicornsHero",
      headingPrefix: HERO.headingPrefix,
      ...(heroWordmark && { wordmark: imageRef(heroWordmark) }),
      panelOne: HERO.panelOne,
      panelTwo: HERO.panelTwo,
      panelThreeIntro: HERO.panelThreeIntro,
      criteria: HERO.criteria.map((c, i) => ({
        _type: "indicornCriterion",
        _key: key(c.highlight, i),
        ...c,
      })),
    },
    {
      _id: "whyIndicorns-singleton",
      _type: "whyIndicorns",
      headingTop: WHY.headingTop,
      headingBottom: WHY.headingBottom,
      storyLabel: WHY.storyLabel,
      ...(whyStoryImage && { storyImage: imageRef(whyStoryImage) }),
      storyParagraphs: WHY.storyParagraphs,
      storyParagraphsMobile: WHY.storyParagraphsMobile,
      timeline: WHY.timeline.map((t, i) => ({
        _type: "indicornTimelineEntry",
        _key: key(t.date, i),
        ...t,
      })),
    },
    {
      _id: "indicornCompanies-singleton",
      _type: "indicornCompanies",
      heading: COMPANIES.heading,
      companies: COMPANIES.companies.map((c, i) => ({
        _type: "indicornCompany",
        _key: key(c.name, i),
        name: c.name,
        description: c.description,
        logoScale: c.logoScale,
        ...(companyLogos[i] && { logo: imageRef(companyLogos[i]) }),
      })),
    },
    {
      _id: "indicornTestimonials-singleton",
      _type: "indicornTestimonials",
      headingTop: TESTIMONIALS.headingTop,
      headingBottom: TESTIMONIALS.headingBottom,
      description: TESTIMONIALS.description,
      testimonials: TESTIMONIALS.testimonials.map((t, i) => ({
        _type: "indicornTestimonial",
        _key: key(t.name, i),
        quote: t.quote,
        name: t.name,
        role: t.role,
        ...(founderPhotos[i] && { image: imageRef(founderPhotos[i]) }),
      })),
    },
  ];

  for (const doc of docs) {
    const res = await client.createOrReplace(doc);
    console.log(`  ✓ ${res._type}  (${res._id})`);
  }

  console.log("\n✓ Done. Publish each document in Studio.");
}

main().catch((err) => {
  console.error("\n✗ Import failed:", err.message);
  process.exit(1);
});
