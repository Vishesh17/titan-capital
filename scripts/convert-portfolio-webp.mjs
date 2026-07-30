/**
 * One-shot: convert every PNG in public/images/portfolio to WebP,
 * downscaled to max 1600px wide (still crisp on retina at any
 * card size the site uses) and encoded at quality 82.
 *
 *   USAGE:
 *     node scripts/convert-portfolio-webp.mjs
 *
 *   WHAT IT DOES:
 *     - Reads every .png in public/images/portfolio/
 *     - Writes a .webp sibling with the same base name
 *     - Prints before/after size per file + total savings
 *     - Leaves the original .png files untouched (delete manually
 *       once you've verified the site looks good with the .webp version)
 *
 *   AFTER RUNNING:
 *     Update the code references from .png → .webp (BackedEarly.tsx
 *     `companies` array). This script does NOT modify source code.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.resolve(__dirname, "..", "public", "images", "portfolio");

const MAX_WIDTH = 1600;
const QUALITY = 82;

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

async function main() {
  const files = fs
    .readdirSync(DIR)
    .filter((f) => f.toLowerCase().endsWith(".png"));

  if (files.length === 0) {
    console.log("No .png files found in", DIR);
    return;
  }

  console.log(`Converting ${files.length} PNG → WebP (max ${MAX_WIDTH}px wide, Q${QUALITY})\n`);

  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of files) {
    const src = path.join(DIR, file);
    const dst = path.join(DIR, file.replace(/\.png$/i, ".webp"));

    const beforeSize = fs.statSync(src).size;
    totalBefore += beforeSize;

    try {
      const meta = await sharp(src).metadata();
      const resize = meta.width && meta.width > MAX_WIDTH ? { width: MAX_WIDTH } : {};

      await sharp(src).resize(resize).webp({ quality: QUALITY, effort: 6 }).toFile(dst);

      const afterSize = fs.statSync(dst).size;
      totalAfter += afterSize;

      const pct = ((1 - afterSize / beforeSize) * 100).toFixed(0);
      console.log(
        `  ✓ ${file.padEnd(24)} ${fmtBytes(beforeSize).padStart(9)} → ${fmtBytes(afterSize).padStart(9)}  (-${pct}%)`
      );
    } catch (err) {
      console.log(`  ✗ ${file}: ${err.message}`);
    }
  }

  const pct = ((1 - totalAfter / totalBefore) * 100).toFixed(1);
  console.log(
    `\nTotal: ${fmtBytes(totalBefore)} → ${fmtBytes(totalAfter)} (saved ${fmtBytes(totalBefore - totalAfter)}, -${pct}%)`
  );
  console.log("\nNext: update .png references to .webp in the code, then delete the originals if desired.");
}

main().catch((err) => {
  console.error("✗ Conversion failed:", err);
  process.exit(1);
});
