// Convertir un screenshot brut adb (raw RGBA + 16-octet en-tete) en PNG valide.
import { readFileSync, writeFileSync } from 'node:fs';
import { crc32, deflateSync } from 'node:zlib';

const [src, dst] = process.argv.slice(2);
const data = readFileSync(src);
const W = data.readUInt32LE(0);
const H = data.readUInt32LE(4);
const pix = data.subarray(16);
if (pix.length !== W * H * 4) throw new Error(`taille inattendue: ${pix.length} != ${W * H * 4}`);

function chunk(type, d) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(d.length);
  const typeBuf = Buffer.from(type, 'latin1');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, d])) >>> 0);
  return Buffer.concat([len, typeBuf, d, crcBuf]);
}

const rows = [];
for (let y = 0; y < H; y++) {
  rows.push(Buffer.from([0]));
  rows.push(pix.subarray(y * W * 4, (y + 1) * W * 4));
}
const raw = Buffer.concat(rows);

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 6; // color type 6 = RGBA

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);
writeFileSync(dst, png);
console.log(`ok: ${src} -> ${dst} (${W}x${H})`);
