#!/usr/bin/env node
// Generate PWA icons from a source PNG using sharp
// Usage: node scripts/gen-icons.js public/icons/favicon.png
const fs = require('fs');
const path = require('path');

async function main() {
  const [,, src] = process.argv;
  if (!src) {
    console.error('Usage: node scripts/gen-icons.js <source.png>');
    process.exit(1);
  }
  const sharp = require('sharp');
  const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];
  const outDir = path.join('public', 'icons');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  for (const size of sizes) {
    const out = path.join(outDir, `icon-${size}.png`);
    // eslint-disable-next-line no-console
    console.log(`Generating ${out}`);
    await sharp(src)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toFile(out);
  }
  // eslint-disable-next-line no-console
  console.log('Done.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
