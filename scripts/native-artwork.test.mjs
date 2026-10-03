import { test } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { nativeArtworkFiles, prepareNativeArtwork, restoreNativeCatalog } from './native-artwork.mjs';

test('native replacement preserves web originals, dimensions, format and repeatable backups', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'native-artwork-'));
  try {
    const original = await sharp({ create: { width: 80, height: 100, channels: 4, background: '#ff0000' } }).png().toBuffer();
    for (const name of nativeArtworkFiles) {
      for (const directory of ['public/lovable-uploads', 'dist/lovable-uploads']) {
        await fs.mkdir(path.join(root, directory), { recursive: true });
        const buffer = name.endsWith('.webp') ? await sharp(original).webp().toBuffer() : original;
        await fs.writeFile(path.join(root, directory, name), buffer);
      }
    }
    for (const directory of ['AppIcon.appiconset', 'Splash.imageset']) {
      const folder = path.join(root, 'ios/App/App/Assets.xcassets', directory);
      await fs.mkdir(folder, { recursive: true });
      await fs.writeFile(path.join(folder, 'Contents.json'), JSON.stringify({ images: [{ filename: 'image.png' }, { filename: 'image.png' }] }));
      await fs.writeFile(path.join(folder, 'image.png'), original);
    }
    await prepareNativeArtwork(root);
    await prepareNativeArtwork(root);
    for (const name of nativeArtworkFiles) {
      const web = await fs.readFile(path.join(root, 'public/lovable-uploads', name));
      const native = await fs.readFile(path.join(root, 'dist/lovable-uploads', name));
      assert.notDeepEqual(native, web);
      const meta = await sharp(native).metadata();
      assert.equal(meta.width, 80); assert.equal(meta.height, 100);
      assert.equal(meta.format, name.endsWith('.webp') ? 'webp' : 'png');
    }
    assert.deepEqual(await fs.readFile(path.join(root, 'node_modules/.cache/native-artwork-originals/AppIcon.appiconset/image.png')), original);
    await restoreNativeCatalog(root);
    assert.deepEqual(await fs.readFile(path.join(root, 'ios/App/App/Assets.xcassets/AppIcon.appiconset/image.png')), original);
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});
