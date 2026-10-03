/** Native-only temporary artwork. Web/public assets are never modified.
 * Restore only after rights are documented: remove this step from mobile:sync.
 * Originals remain versioned in public/ and ios/; no third-party replacements.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { spawnSync } from 'node:child_process';

export const nativeArtworkFiles = [
  '6b2888cd-7dd2-4048-b4ca-c9636e93d4a6.png',
  '6b2888cd-7dd2-4048-b4ca-c9636e93d4a6.webp',
  'flu-logo-sm.webp',
  '0aa3609f-0584-4bf4-8303-e03f50f7e131.png',
  '20457a11-5436-48c6-906d-82b9451bc16d.png',
  'efaf362c-8726-4049-98bc-ebb26dcdd4e1.png',
];

export function monogramSvg(width, height) {
  const size = Math.min(width, height);
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#780028"/><circle cx="${width / 2}" cy="${height / 2}" r="${size * .39}" fill="#00543d"/><text x="50%" y="50%" dy=".35em" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="${size * .34}" fill="#ffffff">LD</text></svg>`);
}

async function replaceImage(file) {
  const { width, height } = await sharp(file).metadata();
  if (!width || !height) throw new Error(`Invalid artwork dimensions: ${file}`);
  const image = sharp(monogramSvg(width, height));
  const output = file.endsWith('.webp') ? await image.webp().toBuffer() : await image.png().toBuffer();
  await fs.writeFile(file, output);
}

export async function prepareNativeArtwork(root = process.cwd()) {
  // Replace the copied bundle, not public/. Preserve dimensions and file format.
  for (const name of nativeArtworkFiles) {
    await replaceImage(path.join(root, 'dist/lovable-uploads', name));
  }
  const catalog = path.join(root, 'ios/App/App/Assets.xcassets');
  for (const directory of ['AppIcon.appiconset', 'Splash.imageset']) {
    const folder = path.join(catalog, directory);
    const manifest = JSON.parse(await fs.readFile(path.join(folder, 'Contents.json'), 'utf8'));
    for (const name of new Set(manifest.images.map(image => image.filename).filter(Boolean))) {
      // Build-local backup outside the asset catalog/bundle; git originals stay intact.
      const file = path.join(folder, name);
      const backup = path.join(root, 'node_modules/.cache/native-artwork-originals', directory, name);
      await fs.mkdir(path.dirname(backup), { recursive: true });
      try { await fs.copyFile(file, backup, 1); } catch (error) { if (error.code !== 'EEXIST') throw error; }
      await replaceImage(file);
    }
  }
  console.log('Native-only LD artwork prepared. Web assets unchanged. Remote photos are NOT filtered.');
}

export async function restoreNativeCatalog(root = process.cwd()) {
  for (const directory of ['AppIcon.appiconset', 'Splash.imageset']) {
    const backup = path.join(root, 'node_modules/.cache/native-artwork-originals', directory);
    for (const name of await fs.readdir(backup)) {
      await fs.copyFile(path.join(backup, name), path.join(root, 'ios/App/App/Assets.xcassets', directory, name));
    }
  }
  await fs.rm(path.join(root, 'node_modules/.cache/native-artwork-originals'), { recursive: true });
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  if (process.argv.includes('--restore')) {
    await restoreNativeCatalog();
  } else {
    await prepareNativeArtwork();
  }
  if (process.argv.includes('--sync')) {
    // cap sync does not compile the Xcode catalog: keep native artwork until Xcode builds.
    const result = spawnSync('npx', ['cap', 'sync', 'ios'], { stdio: 'inherit' });
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 1;
  }
  // Originals in git remain untouched; generated catalog changes are build-local.
}
