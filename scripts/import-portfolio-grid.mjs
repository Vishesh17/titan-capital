/**
 * One-shot Sanity import — Portfolio Grid (all columns).
 *
 *   USAGE:
 *     node --env-file=.env.local scripts/import-portfolio-grid.mjs
 *
 *   Google Sheet columns (0-indexed):
 *     0: Brand Name | 1: Year | 2: Sector | 3: Status | 4: Tags |
 *     5: Investment Stage | 6: Fund Type | 7: Logo | 8: Founders Image |
 *     9: Founding Year | 10: One Liner | 11: About the company | 12: Website |
 *     13: Founder 1 Name | 14: Linkedin | 15: Founder 2 Name | 16: Linkedin |
 *     17: Founder 3 Name | 18: Linkedin | 19: Founder 4 Name | 20: Linkedin |
 *     21: Founder 5 Name | 22: Linkedin | 23: News/Blogs | 24: Youtube |
 *     25: Milestones | 26: About | 27: Company LinkedIn
 */

import { createClient } from "@sanity/client";
import { deriveMilestones } from "../src/lib/milestones.mjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error(
    "✗ SANITY_API_WRITE_TOKEN missing.\n" +
      "  Run with: node --env-file=.env.local scripts/import-portfolio-grid.mjs"
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

const SHEET_ID = "1LvHYkFm6HUzlXJbr_3Xuhs7k5YxtSUcDw6aiyZ8X8G4";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;
const DOC_ID = "portfolioGrid-singleton";

/* ── Helpers ── */

function slugify(name) {
  return name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function titleCase(s) {
  return s.replace(/[a-zA-Z]+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function parseCSV(csv) {
  const rows = [];
  let currentRow = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    if (inQuotes) {
      if (char === '"' && csv[i + 1] === '"') { currentField += '"'; i++; }
      else if (char === '"') { inQuotes = false; }
      else { currentField += char; }
    } else {
      if (char === '"') { inQuotes = true; }
      else if (char === ',') { currentRow.push(currentField.trim()); currentField = ""; }
      else if (char === '\n' || char === '\r') {
        if (char === '\r' && csv[i + 1] === '\n') i++;
        currentRow.push(currentField.trim());
        rows.push(currentRow);
        currentRow = [];
        currentField = "";
      } else { currentField += char; }
    }
  }
  if (currentField !== "" || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }
  return rows;
}

function sanitiseSvg(buffer) {
  let svgStr = buffer.toString("utf8");
  svgStr = svgStr.replace(/xmlns:\w+="ns_\w+;"\s*/g, "").replace(/<metadata>[\s\S]*?<\/metadata>/g, "");
  return Buffer.from(svgStr);
}

async function uploadImageFromPath(localPath) {
  const absPath = path.resolve(REPO_ROOT, localPath.startsWith("/") ? localPath.slice(1) : localPath);
  if (!fs.existsSync(absPath)) return null;
  const ext = path.extname(absPath).toLowerCase();
  const buffer = ext === ".svg" ? sanitiseSvg(fs.readFileSync(absPath)) : fs.readFileSync(absPath);
  try {
    const asset = await client.assets.upload("image", buffer, { filename: path.basename(absPath) });
    return asset._id;
  } catch (err) { return null; }
}

async function uploadImageFromUrl(url) {
  if (!url || !url.startsWith("http")) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    const asset = await client.assets.upload("image", buffer, { filename: url.split("/").pop() || "image.jpg" });
    return asset._id;
  } catch { return null; }
}

function remapLogoPath(raw) {
  if (!raw) return raw;
  const normalised = raw.startsWith("/") ? raw : `/${raw}`;
  const match = normalised.match(/^\/images\/logos\/(.+)\.\w+$/);
  if (match) return `/images/portfolio_grid/${match[1]}.png`;
  return normalised;
}

/* ── Main ── */

async function main() {
  console.log("→ Fetching Google Sheet CSV...\n");
  const res = await fetch(CSV_URL);
  if (!res.ok) { console.error("✗ Failed to fetch Google Sheet"); process.exit(1); }

  const csvText = await res.text();
  const rows = parseCSV(csvText);
  const dataRows = rows.slice(1).filter((r) => r.length > 1 && r[0]);

  console.log(`  Found ${dataRows.length} companies.\n→ Processing...\n`);

  const companies = [];

  for (let i = 0; i < dataRows.length; i++) {
    const fields = dataRows[i];
    const get = (idx) => (fields[idx] || "").trim();

    const brandName = get(0);
    if (!brandName) continue;

    process.stdout.write(`  [${i + 1}/${dataRows.length}] ${brandName.padEnd(25)}`);

    // Col 7: Logo
    const logoRaw = get(7);
    let logoAssetId = null;
    if (logoRaw) {
      if (logoRaw.startsWith("http")) {
        logoAssetId = await uploadImageFromUrl(logoRaw);
      } else {
        const logoPath = remapLogoPath(logoRaw);
        logoAssetId = await uploadImageFromPath(logoPath.startsWith("/") ? `public${logoPath}` : `public/${logoPath}`);
      }
    }

    // Col 8: Founders Image
    const founderImgRaw = get(8);
    let founderImageAssetId = null;
    if (founderImgRaw) {
      if (founderImgRaw.startsWith("http")) {
        founderImageAssetId = await uploadImageFromUrl(founderImgRaw);
      } else {
        const fp = founderImgRaw.startsWith("/") ? `public${founderImgRaw}` : `public/${founderImgRaw}`;
        founderImageAssetId = await uploadImageFromPath(fp);
      }
    }

    // Cols 13-22: Founders (5 pairs)
    const founders = [];
    for (let f = 0; f < 5; f++) {
      const nameIdx = 13 + f * 2;
      const linkedinIdx = 14 + f * 2;
      const founderName = get(nameIdx);
      if (founderName) {
        founders.push({
          _key: `founder-${f}`,
          _type: "gridFounder",
          name: founderName,
          linkedin: get(linkedinIdx) || undefined,
        });
      }
    }

    const company = {
      _key: `company-${slugify(brandName)}-${i}`,
      _type: "portfolioGridCompany",
      brandName,
      year: get(1) || undefined,
      sector: get(2) || undefined,
      status: get(3) || undefined,
      tags: get(4) || undefined,
      investmentStage: titleCase(get(5)) || undefined,
      fundType: get(6) || undefined,
      foundingYear: get(9) || undefined,
      oneLiner: get(10) || undefined,
      about: get(11) || undefined,
      website: get(12) || undefined,
      newsBlogs: get(23) || undefined,
      youtube: get(24) || undefined,
      /* Sheet value wins; otherwise fall back to the derived list so the
         field arrives pre-filled instead of blank. Same rule the site uses to
         render, so this changes nothing visually — it just means the Studio
         shows the milestones rather than an empty box. */
      milestones:
        get(25) ||
        deriveMilestones({ foundingYear: get(9), year: get(1), tags: get(4) }).join(", ") ||
        undefined,
      companyLinkedin: get(27) || undefined,
      ...(logoAssetId && { logo: { _type: "image", asset: { _type: "reference", _ref: logoAssetId } } }),
      ...(founderImageAssetId && { founderImage: { _type: "image", asset: { _type: "reference", _ref: founderImageAssetId } } }),
      ...(founders.length > 0 && { founders }),
    };

    companies.push(company);
    console.log("✓");
  }

  console.log(`\n→ Writing portfolioGrid document (${companies.length} companies)...\n`);

  const doc = { _id: DOC_ID, _type: "portfolioGrid", companies };
  const result = await client.createOrReplace(doc);

  console.log(`✓ Document written: ${result._id}`);
  console.log(`  ${companies.length} companies.`);
  console.log("\nRefresh /portfolio on your dev server.\n");
}

main().catch((err) => { console.error("\n✗ Import failed:", err); process.exit(1); });
