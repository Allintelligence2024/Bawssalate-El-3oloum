// Fetch du dump UI courant : uiautomator dump -> exec-out cat /sdcard/window_dump.xml -> fichier UTF-8.
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const ADB = process.env.ANDROID_HOME ? process.env.ANDROID_HOME + '\\platform-tools\\adb.exe' : 'adb.exe';
const out = process.argv[2];

function raw(args) {
  const r = spawnSync(ADB, args, { encoding: 'buffer', maxBuffer: 32 * 1024 * 1024 });
  if (r.error || r.status !== 0) throw new Error(`adb ${args.join(' ')}: ${r.error || 'status=' + r.status} stderr=${r.stderr}`);
  return Buffer.from(r.stdout || Buffer.alloc(0));
}

function decode(buf) {
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
    return Buffer.from(buf.subarray(2).toString('utf16le'), 'utf8');
  }
  const s = buf.toString('utf8');
  if (s.includes('<hierarchy') || s.includes('<?xml') || s.includes('<node')) return buf;
  const s16 = buf.toString('utf16le');
  if (s16.includes('<hierarchy') || s16.includes('<?xml')) return Buffer.from(s16, 'utf8');
  if (buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff) {
    const swapped = Buffer.from(buf.subarray(2));
    for (let i = 0; i + 1 < swapped.length; i += 2) { const t = swapped[i]; swapped[i] = swapped[i + 1]; swapped[i + 1] = t; }
    const s16b = swapped.toString('utf16le');
    if (s16b.includes('<hierarchy') || s16b.includes('<?xml')) return Buffer.from(s16b, 'utf8');
  }
  return buf;
}

const msg = raw(['shell', 'uiautomator', 'dump']).toString('utf8').trim();
const m = msg.match(/dumped to: (\S+)/);
const path = m ? m[1] : '/sdcard/window_dump.xml';
const buf = raw(['exec-out', 'cat', path]);
const utf8 = decode(buf);
writeFileSync(out, utf8);
console.log(`dumped to ${out}: ${utf8.length} bytes (utf8)`);
