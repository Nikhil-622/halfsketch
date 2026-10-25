/**
 * Compress public/assets images to WebP (max 1400px) for faster Vercel loads.
 * Run: node scripts/optimize-images.mjs
 */
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const assets = path.join(root, "public", "assets");
const exts = new Set([".jpg", ".jpeg", ".png"]);

const files = (await readdir(assets)).filter((name) => exts.has(path.extname(name).toLowerCase()));

for (const name of files) {
  const input = path.join(assets, name);
  const base = name.replace(/\.(jpe?g|png)$/i, "");
  const out = path.join(assets, `${base}.webp`);
  const before = (await stat(input)).size;
  const meta = await sharp(input).metadata();
  const width = meta.width && meta.width > 1400 ? 1400 : undefined;
  await sharp(input)
    .rotate()
    .resize(width ? { width, withoutEnlargement: true } : undefined)
    .webp({ quality: 78, effort: 4 })
    .toFile(out);
  const after = (await stat(out)).size;
  console.log(`${name} → ${base}.webp  ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB`);
}

console.log(`Optimized ${files.length} images.`);
