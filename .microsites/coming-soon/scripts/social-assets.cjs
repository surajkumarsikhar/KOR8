// Deterministic brand artwork; requires sharp (provided by Next.js).
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '../public');
(async () => {
 const symbol = (await fs.readFile(path.join(root, 'images/brand-symbol.svg'))).toString('base64');
 const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#050505"/><image href="data:image/svg+xml;base64,${symbol}" x="886" y="77" width="242" height="160"/><g fill="#F2F0EC" font-family="Arial, sans-serif"><text x="72" y="129" font-size="62" font-weight="900">KOR8</text><text x="76" y="181" font-size="17" letter-spacing="3">INDEPENDENT CREATIVE PRODUCTION</text><text x="68" y="398" font-size="77" font-weight="900" letter-spacing="-2">THE NEXT FRAME</text><text x="68" y="487" font-size="77" font-weight="900" letter-spacing="-2">IS INFINITE.</text></g></svg>`;
 await sharp(Buffer.from(svg)).png().toFile(path.join(root, 'og-image.png'));
 for (const [name, size] of [['apple-touch-icon.png',180],['icon-192.png',192],['icon-512.png',512]]) {
  const mark = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" rx="64" fill="#050505"/><image href="data:image/svg+xml;base64,${symbol}" x="56" y="124" width="400" height="264"/></svg>`;
  await sharp(Buffer.from(mark)).resize(size,size).png().toFile(path.join(root,name));
 }
})();
