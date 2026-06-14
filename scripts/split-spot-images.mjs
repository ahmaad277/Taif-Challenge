import sharp from 'sharp';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const spotDir = join(__dirname, '..', 'assets', 'spot');

async function split(src, baseName, modName) {
  const meta = await sharp(src).metadata();
  const halfW = Math.floor(meta.width / 2);
  await sharp(src).extract({ left: 0,     top: 0, width: halfW,              height: meta.height }).resize(800, 600, { fit: 'cover' }).jpeg({ quality: 88 }).toFile(join(spotDir, baseName));
  await sharp(src).extract({ left: halfW, top: 0, width: meta.width - halfW, height: meta.height }).resize(800, 600, { fit: 'cover' }).jpeg({ quality: 88 }).toFile(join(spotDir, modName));
  console.log(`Split ${src.split(/[\\/]/).pop()} (${meta.width}x${meta.height}) → ${baseName} + ${modName}`);
}

async function main() {
  await split(join(spotDir, 'beach_a.png'),    'beach2-base.jpg',    'beach2-mod.jpg');
  await split(join(spotDir, 'bear_a.png'),     'bear-base.jpg',      'bear-mod.jpg');
  await split(join(spotDir, 'room_a.jpeg'),    'room-base.jpg',      'room-mod.jpg');
  console.log('Done.');
}
main().catch(e => { console.error(e); process.exit(1); });
