/**
 * Process spot-the-difference images:
 * 1. Split combined images (left=base, right=modified) into pairs
 * 2. Resize all images to 800×600 for consistent game display
 */
import sharp from 'sharp';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const spotDir = join(__dirname, '..', 'assets', 'spot');

async function splitAndResize(src, baseName, modName) {
  const meta = await sharp(src).metadata();
  const halfW = Math.floor(meta.width / 2);

  await sharp(src)
    .extract({ left: 0, top: 0, width: halfW, height: meta.height })
    .resize(800, 600, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 88 })
    .toFile(join(spotDir, baseName));

  await sharp(src)
    .extract({ left: halfW, top: 0, width: meta.width - halfW, height: meta.height })
    .resize(800, 600, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 88 })
    .toFile(join(spotDir, modName));

  console.log(`Split ${src.split(/[\\/]/).pop()} → ${baseName} + ${modName} (${meta.width}×${meta.height})`);
}

async function resize(src, outName) {
  const meta = await sharp(src).metadata();
  await sharp(src)
    .resize(800, 600, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 88 })
    .toFile(join(spotDir, outName));
  console.log(`Resized ${src.split(/[\\/]/).pop()} (${meta.width}×${meta.height}) → ${outName}`);
}

async function main() {
  // Split combined images
  await splitAndResize(join(spotDir, 'beach-combined.png'),   'beach-base.jpg',    'beach-mod.jpg');
  await splitAndResize(join(spotDir, 'marathon-combined.jpg'),'marathon-base.jpg', 'marathon-mod.jpg');

  // Resize separate pairs
  await resize(join(spotDir, 'camels-base.jpg'), 'camels-base-r.jpg');
  await resize(join(spotDir, 'camels-mod.jpg'),  'camels-mod-r.jpg');
  await resize(join(spotDir, 'city-base.jpg'),   'city-base-r.jpg');
  await resize(join(spotDir, 'city-mod.jpg'),    'city-mod-r.jpg');

  console.log('All done.');
}

main().catch(e => { console.error(e); process.exit(1); });
