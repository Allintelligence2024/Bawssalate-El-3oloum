// Régénère toutes les icônes de l'app installée à partir de `public/icon.svg` :
//   node scripts/generer-icones.mjs
// Sorties : public/icons/*.webp (manifeste), public/icons/apple-touch-180.png (iOS) et
// android/…/res/mipmap-* + drawable-*-*/splash.png (lanceur et écran de démarrage Android).
// On rasterise avec Chromium parce qu'ImageMagick n'a pas de délégué SVG ici, puis on encode
// en WebP avec ImageMagick (Chromium ne sait pas écrire de WebP via `screenshot`).
//
// v0.13 — les icônes **livrées** ne viennent pas de ce SVG mais de l'artwork officiel
// (voir `plans/sources/medias.md`) : ce script reste la voie vectorielle (Android, secours).
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { chromium } from 'playwright';

const svg = readFileSync('public/icon.svg', 'utf8');

// Sur un poste normal, Playwright a son Chromium ; sinon on accepte celui de
// @sparticuz (environnements sans navigateur installé) et un LD_LIBRARY_PATH local.
let executablePath;
try {
  const chemin = chromium.executablePath();
  if (!existsSync(chemin)) throw new Error('binaire absent');
  executablePath = chemin;
} catch {
  const sparticuz = (await import('@sparticuz/chromium')).default;
  executablePath = await sparticuz.executablePath();
}
const navigateur = await chromium.launch({
  executablePath,
  env: { ...process.env, ...(process.env.KUNZ_LD_LIBRARY_PATH ? { LD_LIBRARY_PATH: process.env.KUNZ_LD_LIBRARY_PATH } : {}) },
  args: ['--disable-gpu', '--no-sandbox'],
});

/** Rend l'icône dans un carré `taille` ; contenu à `part` du côté ; fond optionnel. */
async function rendre(taille, chemin, { part = 1, fond = null } = {}) {
  const page = await navigateur.newPage({
    viewport: { width: taille, height: taille },
    deviceScaleFactor: 1,
  });
  const dedans = Math.round(taille * part);
  const marge = Math.round((taille - dedans) / 2);
  const html = `<!doctype html><html><head><meta charset="utf-8">
    <style>
      html, body { margin: 0; padding: 0; width: ${taille}px; height: ${taille}px; }
      body { background: ${fond ?? 'transparent'}; }
      .c { position: absolute; left: ${marge}px; top: ${marge}px; width: ${dedans}px; height: ${dedans}px; }
    </style></head><body><div class="c">${svg.replace(
      '<svg ',
      `<svg width="${dedans}" height="${dedans}" `,
    )}</div></body></html>`;
  await page.setContent(html, { waitUntil: 'load' });
  await page.screenshot({
    path: chemin,
    omitBackground: fond === null,
    clip: { x: 0, y: 0, width: taille, height: taille },
  });
  await page.close();
}

mkdirSync('public/icons', { recursive: true });
const tampon = '.cache/icones';
mkdirSync(tampon, { recursive: true });
/** Rend en PNG dans `.cache/icones`, puis encode en WebP (qualité 82, alpha conservé). */
async function rendreWebp(taille, chemin, { part = 1, fond = null, qualite = 82 } = {}) {
  const png = `${tampon}/${chemin.split('/').pop().replace(/\.webp$/, '')}.png`;
  await rendre(taille, png, { part, fond });
  const r = spawnSync('convert', [png, '-resize', `${taille}x${taille}`, '-quality', String(qualite), chemin]);
  if (r.status !== 0) throw new Error(`ImageMagick n'a pas pu écrire ${chemin} — installer ImageMagick.`);
}
await rendreWebp(192, 'public/icons/icon-192.webp');
await rendreWebp(512, 'public/icons/icon-512.webp');
// Icône iOS : opaque (iOS n'accepte pas la transparence sur l'écran d'accueil).
await rendre(180, 'public/icons/apple-touch-180.png', { part: 0.92, fond: '#0b3b2c' });
// Maskable : fond plein (pas de transparence), contenu dans les 80 % sûrs.
await rendreWebp(512, 'public/icons/maskable-512.webp', { part: 0.78, fond: '#0b3b2c' });

const densites = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
for (const [d, f] of Object.entries(densites)) {
  const dossier = `android/app/src/main/res/mipmap-${d}`;
  await rendre(Math.round(48 * f), `${dossier}/ic_launcher.png`);
  await rendre(Math.round(48 * f), `${dossier}/ic_launcher_round.png`);
  // Avant-plan adaptatif : 108 dp, contenu utile dans les 72 dp centraux.
  await rendre(Math.round(108 * f), `${dossier}/ic_launcher_foreground.png`, { part: 0.62 });
}

// Écran de démarrage Android : logo centré sur papier.
for (const [d] of Object.entries(densites)) {
  const portrait = { mdpi: [320, 480], hdpi: [480, 800], xhdpi: [720, 1280], xxhdpi: [960, 1600], xxxhdpi: [1280, 1920] }[d];
  for (const [sens, [l, h]] of [
    ['port', portrait],
    ['land', [portrait[1], portrait[0]]],
  ]) {
    const page = await navigateur.newPage({ viewport: { width: l, height: h }, deviceScaleFactor: 1 });
    const cote = Math.round(Math.min(l, h) * 0.42);
    await page.setContent(
      `<!doctype html><html><head><meta charset="utf-8">
        <style>
          html, body { margin:0; width:${l}px; height:${h}px; background:#fffef8;
            display:flex; align-items:center; justify-content:center; }
        </style></head><body>${svg.replace('<svg ', `<svg width="${cote}" height="${cote}" `)}</body></html>`,
      { waitUntil: 'load' },
    );
    await page.screenshot({ path: `android/app/src/main/res/drawable-${sens}-${d}/splash.png` });
    await page.close();
  }
}

await navigateur.close();

// Chromium sort des PNG non optimisés (180 px ≈ 60 ko). Le vérificateur hors-ligne impose
// 150 ko par fichier et 2,5 Mio de coquille : on quantifie le seul PNG restant (iOS).
const pngs = ['public/icons/apple-touch-180.png'];
for (const f of pngs) {
  const r = spawnSync('convert', [f, '-strip', '-colors', '96', '-define', 'png:compression-level=9', f]);
  if (r.error) {
    console.warn('ImageMagick absent : les PNG resteront plus lourds que le budget.');
    break;
  }
}
console.log('icônes rendues');
