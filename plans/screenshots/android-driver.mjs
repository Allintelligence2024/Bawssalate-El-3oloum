// Driver minimal pour l'émulateur Android v2 :
// - parcourt les onglets (tape ابدأ si écran d'accueil, puis اليوم/مساري/البوصلة/تدريبات/أنا)
// - sauvegarde la hiérarchie UI (uiautomator dump -> XML, décodé UTF-16 -> UTF-8)
// - prend des captures d'écran (raw -> PNG)
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const ADB = process.env.ANDROID_HOME ? process.env.ANDROID_HOME + '\\platform-tools\\adb.exe' : 'adb.exe';
const OUT = 'plans\\screenshots';
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, ms);

function adbRaw(args) {
  const r = spawnSync(ADB, args, { encoding: 'buffer' });
  if (r.error || r.status !== 0) throw new Error(`adb ${args.join(' ')}: ${r.error || 'status=' + r.status} stderr=${r.stderr}`);
  return Buffer.from(r.stdout || Buffer.alloc(0));
}
function decodeXml(buf) {
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) return buf.toString('utf16le');
  return buf.toString('utf8');
}
function dumpScreen(name) {
  const msg = adbRaw(['shell', 'uiautomator', 'dump']).toString('utf8').trim();
  const m = msg.match(/dumped to: (\S+)/);
  const path = m ? m[1] : '/sdcard/window_dump.xml';
  let xml = decodeXml(adbRaw(['exec-out', 'cat', path]));
  writeFileSync(`${OUT}/ui-${name}.xml`, xml);
  console.log(`ui-${name}.xml saved (${xml.length} bytes)`);
  return xml;
}
function screenshot(name) {
  const r = spawnSync(ADB, ['exec-out', 'screencap'], { encoding: 'buffer', maxBuffer: 32 * 1024 * 1024 });
  if (r.error) { console.log(`screen-${name}: spawn error ${r.error.message}`); return; }
  if (r.status !== 0) { console.log(`screen-${name}: status=${r.status} stderr=${r.stderr}`); return; }
  if (!r.stdout || r.stdout.length === 0) { console.log(`screen-${name}: empty stdout`); return; }
  const raw = `${OUT}/screen-${name}.raw`;
  writeFileSync(raw, r.stdout);
  const c = spawnSync(process.execPath, [`${OUT}\\raw2png.mjs`, raw, `${OUT}\\screen-${name}.png`], { encoding: 'utf8' });
  console.log(`screen-${name}: ${r.stdout.length} bytes raw -> png (${(c.stdout || '').trim()})`);
}
function tap(x, y) {
  adbRaw(['shell', 'input', 'tap', String(x), String(y)]);
}
function findBounds(xml, text) {
  for (const m of xml.matchAll(/<node[^>]*>/g)) {
    const tag = m[0];
    const tm = tag.match(/\btext="([^"]*)"/);
    const bm = tag.match(/\bbounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
    if (tm && bm && tm[1] && tm[1].includes(text)) {
      const [x1, y1, x2, y2] = [+bm[1], +bm[2], +bm[3], +bm[4]];
      return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
    }
  }
  return null;
}

const TABS = [
  ['02-masari', 'مساري'],
  ['03-boussole', 'البوصلة'],
  ['04-exercices', 'تدريبات'],
  ['05-ana', 'أنا'],
  ['06-aujourdhui', 'اليوم'],
];

console.log('== session 2 : ecran actuel ==');
let xml = dumpScreen('00-lancement');
const start = findBounds(xml, 'ابدأ');
if (start) {
  console.log(`ecran de bienvenue : tap sur ابدأ (${start.x}, ${start.y})`);
  tap(start.x, start.y);
  sleep(2500);
  xml = dumpScreen('01-main');
} else {
  console.log('pas d\u2019ecran de bienvenue detectable (ex: on est deja dans l\'app)');
}
screenshot('01-main');
for (const [name, label] of TABS) {
  const b = findBounds(xml, label);
  if (!b) { console.log(`onglet ${label} : NON TROUVE`); continue; }
  console.log(`onglet ${label} : tap en (${b.x}, ${b.y})`);
  tap(b.x, b.y);
  sleep(900);
  xml = dumpScreen(name);
  screenshot(name);
}
console.log('android-driver done');
