import sharp from 'sharp';
import fs from 'node:fs/promises';

const svg = await fs.readFile('public/favicon.svg');
const background = '#07121f';
await sharp(svg).resize(192, 192).png().toFile('public/pwa-192x192.png');
await sharp(svg).resize(512, 512).png().toFile('public/pwa-512x512.png');
await sharp(svg).resize(180, 180).png().toFile('public/apple-touch-icon.png');
// The whole mark remains inside the maskable safe area (central 80% of image).
await sharp(svg).resize(400, 400).extend({
  top: 56, bottom: 56, left: 56, right: 56, background,
}).png().toFile('public/pwa-maskable-512x512.png');
console.log('Generated refreshed Tenvylo favicon and PWA icons');
