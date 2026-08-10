/**
 * Convert a folder of images to WebP.
 *
 * Generalises scripts/convert-portfolio-webp.mjs (which hard-codes
 * public/images/portfolio) so any folder can be processed.
 *
 *   USAGE:
 *     node scripts/convert-webp.mjs <dir> [--max=1600] [--quality=90] [--trim]
 *
 *   EXAMPLES:
 *     node scripts/convert-webp.mjs public/images/FounderStories
 *     node scripts/convert-webp.mjs public/images/logos --trim --max=800
 *
 *   --trim  crops fully transparent (or uniform) borders before encoding.
 *           Use for logos sitting letterboxed on an oversized square canvas:
 *           it makes the artwork fill the frame, so the layout can size them
 *           by height instead of scaling them up with a blurry CSS transform.
 *
 *   Originals are left untouched — delete them once the site looks right.
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const args = process.argv.slice(2);
const dir = args.find((a) => !a.startsWith("--"));
const flag = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? Number(hit.split("=")[1]) : fallback;
};

const MAX_WIDTH = flag("max", 1600);
const QUALITY = flag("quality", 90);
const TRIM = args.includes("--trim");

if (!dir) {
  console.error("Usage: node scripts/convert-webp.mjs <dir> [--max=N] [--quality=N] [--trim]");
  process.exit(1);
}
if (!fs.existsSync(dir)) {
  console.error(`Directory not found: ${dir}`);
  process.exit(1);
}

const fmt = (n) =>
  n < 1024 ? `${n} B`
  : n < 1048576 ? `${(n / 1024).toFixed(1)} KB`
  : `${(n / 1048576).toFixed(2)} MB`;

const SOURCES = /\.(png|jpe?g)$/i;

async function main() {
  const files = fs.readdirSync(dir).filter((f) => SOURCES.test(f));
  if (files.length === 0) {
    console.log(`No PNG/JPEG files in ${dir}`);
    return;
  }

  console.log(
    `Converting ${files.length} file(s) in ${dir} → WebP ` +
      `(max ${MAX_WIDTH}px, Q${QUALITY}${TRIM ? ", trimmed" : ""})\n`
  );

  let before = 0;
  let after = 0;

  for (const file of files) {
    const src = path.join(dir, file);
    const dst = path.join(dir, file.replace(SOURCES, ".webp"));
    const srcSize = fs.statSync(src).size;
    before += srcSize;

    try {
      let img = sharp(src);
      const meta = await img.metadata();

      if (TRIM) img = img.trim({ threshold: 10 });
      if (meta.width && meta.width > MAX_WIDTH) img = img.resize({ width: MAX_WIDTH });

      await img.webp({ quality: QUALITY, effort: 6 }).toFile(dst);

      const outSize = fs.statSync(dst).size;
      const out = await sharp(dst).metadata();
      after += outSize;

      const pct = ((1 - outSize / srcSize) * 100).toFixed(0);
      console.log(
        `  ✓ ${file.padEnd(24)} ${String(meta.width + "x" + meta.height).padStart(10)} → ` +
          `${String(out.width + "x" + out.height).padStart(10)}  ` +
          `${fmt(srcSize).padStart(9)} → ${fmt(outSize).padStart(9)}  (-${pct}%)`
      );
    } catch (err) {
      console.log(`  ✗ ${file}: ${err.message}`);
    }
  }

  const pct = ((1 - after / before) * 100).toFixed(1);
  console.log(`\nTotal: ${fmt(before)} → ${fmt(after)}  (saved ${fmt(before - after)}, -${pct}%)`);
}

main().catch((err) => {
  console.error("✗ Conversion failed:", err);
  process.exit(1);
});
