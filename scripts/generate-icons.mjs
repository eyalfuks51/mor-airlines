import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const sourceLogo = join(root, 'public', 'mor-airlines-logo.png');

const generateIcon = (size, filename) =>
  sharp(sourceLogo)
    .resize(size, size, { fit: 'cover', position: 'center' })
    .png()
    .toFile(join(root, 'public', filename));

await Promise.all([
  generateIcon(512, 'icon.png'),
  generateIcon(512, 'pwa-512.png'),
  generateIcon(192, 'pwa-192.png'),
  generateIcon(180, 'apple-touch-icon.png'),
]);

console.log('Icons generated successfully.');
