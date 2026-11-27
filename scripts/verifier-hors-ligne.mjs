// Vérification automatisée hors-ligne (NIVEAU 1) — P0.7 / P1-1.
// Contrôle HTTP réel sur chaque entrée du manifeste de précache du build courant, plus la
// cohérence HTML ↔ manifeste ↔ worker (mêmes règles que l'install du worker dans sw.js).
// S'exécuter APRÈS `npm run build`. Le niveau 2 (appareil réel, mode avion) n'est jamais
// remplacé par ce script : cf. plans/preuves/hors-ligne.md §2.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { preview } from 'vite';


if (!existsSync('dist/precache-manifest.json')) {
  console.error('ABSENT : dist/precache-manifest.json — lancer « npm run build » d\'abord.');
  process.exit(1);
}

const manifeste = JSON.parse(readFileSync('dist/precache-manifest.json', 'utf8'));
const sw = readFileSync('dist/sw.js', 'utf8');
const html = readFileSync('dist/index.html', 'utf8');
const version = manifeste.version;
const problemes = [];
const DOSSIER_IMAGES = 'public/lecons/img';

// ── 1. Cohérence statique du build (règles de valideManifeste + install dans sw.js) ──
if (sw.includes('__KUNZ_BUILD_ID__')) problemes.push('sw.js : identifiant de version non remplacé');
if (html.includes('__KUNZ_BUILD_ID__')) problemes.push('index.html : identifiant de version non remplacé');
if (!sw.includes(`'${version}'`)) problemes.push('sw.js : VERSION non remplacée par l\'identifiant du build');
if (!sw.includes('kunz-hors-ligne-')) problemes.push('sw.js : préfixe du cache de version absent');
if (!html.includes(`name="kunz-build-id" content="${version}"`)) problemes.push('index.html : meta kunz-build-id absente');
if (!Array.isArray(manifeste.assets) || !manifeste.assets.every((u) => /^\/assets\/[a-zA-Z0-9_.-]+\.(js|css)$/.test(u))) {
  problemes.push('manifeste : assets non conformes à la règle du worker');
}
// Coquille (statiques) et contenu lourd (contenu) ont chacun leur règle, comme dans sw.js.
// La liste blanche de la coquille vit dans sw.js : on la lit au lieu de la recopier,
// sinon trois fichiers (worker, vite.config, ce script) finissent par diverger.
const swSource = readFileSync('public/sw.js', 'utf8');
const blocCoquille = /const COQUILLE = \[([^\]]*)\]/.exec(swSource);
if (!blocCoquille) {
  console.error('impossible de lire COQUILLE dans public/sw.js');
  process.exit(1);
}
const COQUILLE = [...blocCoquille[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
const coquilleOk = Array.isArray(manifeste.statiques) && manifeste.statiques.length > 0 &&
  manifeste.statiques.every((u) => COQUILLE.includes(u));
if (!coquilleOk) problemes.push('manifeste : entrées de coquille non conformes à la règle du worker');
const SCHEMA_CHUNK = /^\/assets\/schemasSvt-[a-zA-Z0-9_.-]+\.js$/;
const AUDIO_CHUNK = /^\/assets\/audioMourchid-[a-zA-Z0-9_.-]+\.js$/;
const AUDIO_LECONS_CHUNK = /^\/assets\/audioLecons-[a-zA-Z0-9_.-]+\.js$/;
if (Array.isArray(manifeste.assets) && manifeste.assets.some((u) => SCHEMA_CHUNK.test(u))) {
  problemes.push('manifeste : schemasSvt-*.js ne doit jamais entrer dans la coquille (assets)');
}
if (Array.isArray(manifeste.assets) && manifeste.assets.some((u) => AUDIO_CHUNK.test(u))) {
  problemes.push('manifeste : audioMourchid-*.js ne doit jamais entrer dans la coquille (assets)');
}
if (Array.isArray(manifeste.assets) && manifeste.assets.some((u) => AUDIO_LECONS_CHUNK.test(u))) {
  problemes.push('manifeste : audioLecons-*.js ne doit jamais entrer dans la coquille (assets)');
}
const contenu = Array.isArray(manifeste.contenu) ? manifeste.contenu : null;
if (!contenu) problemes.push('manifeste : liste « contenu » absente');
else {
  const contenuOk = contenu.every((u) => /^\/lecons\/[a-zA-Z0-9_.-]+\.html$/.test(u) ||
    SCHEMA_CHUNK.test(u) ||
    AUDIO_CHUNK.test(u) ||
    AUDIO_LECONS_CHUNK.test(u) ||
    ['/boussole/index.html', '/boussole/cahier-bac-2022.pdf', '/boussole/memo.pdf'].includes(u));
  if (!contenuOk) problemes.push('manifeste : entrées de contenu non conformes à la règle du worker');
  if (contenu.length === 0) problemes.push('manifeste : contenu lourd vide (le bouton de téléchargement ne servirait à rien)');
  if (!contenu.some((u) => SCHEMA_CHUNK.test(u))) {
    problemes.push('manifeste : schemasSvt-*.js absent du lot « contenu » (hors-ligne sur demande)');
  }
  if (!contenu.some((u) => AUDIO_CHUNK.test(u))) {
    problemes.push('manifeste : audioMourchid-*.js absent du lot « contenu » (hors-ligne sur demande)');
  }
  if (!contenu.some((u) => AUDIO_LECONS_CHUNK.test(u))) {
    problemes.push('manifeste : audioLecons-*.js absent du lot « contenu » (hors-ligne sur demande)');
  }
}
// Phase 2 : aucune illustration WebP ne doit entrer dans le précache de démarrage.
const precisementPrecache = [...manifeste.assets, ...manifeste.statiques, ...(contenu ?? [])];
for (const u of precisementPrecache) {
  if (u.startsWith('/lecons/img/')) problemes.push(`précache : ${u} est une illustration, elle doit être chargée à la volée`);
}
for (const champ of ['octetsCoquille', 'octetsContenu', 'octets']) {
  if (!Number.isFinite(manifeste[champ]) || manifeste[champ] < 0) problemes.push(`manifeste : ${champ} invalide`);
}
if (Number.isFinite(manifeste.octetsCoquille) && Number.isFinite(manifeste.octetsContenu) &&
    Number.isFinite(manifeste.octets) && manifeste.octets < manifeste.octetsCoquille + manifeste.octetsContenu) {
  problemes.push('manifeste : total inférieur à la somme coquille + contenu');
}
const demarrage = [...html.matchAll(/(?:src|href)="(\/assets\/[^"?]+\.(?:js|css))"/g)].map((x) => x[1]);
if (!demarrage.length) problemes.push('index.html : aucun asset de démarrage');
for (const u of demarrage) if (!manifeste.assets.includes(u)) problemes.push(`asset de démarrage hors manifeste : ${u}`);

// ── 2. Serveur preview + requêtes HTTP réelles ──
const serveur = await preview({ preview: { port: 0, host: '127.0.0.1' } });
const BASE = `http://127.0.0.1:${serveur.httpServer.address().port}`;

const typeOk = (url, res) => {
  const t = (res.headers.get('content-type') || '').toLowerCase();
  if (url.endsWith('.pdf')) return t.includes('application/pdf');
  if (url.endsWith('.js')) return t.includes('javascript');
  if (url.endsWith('.css')) return t.includes('text/css');
  if (url.endsWith('.html') || url === '/') return t.includes('text/html');
  if (url.endsWith('.webp')) return t.includes('image/webp') || t.includes('application/octet-stream');
  if (url.endsWith('.svg')) return t.includes('image/svg+xml') || t.includes('application/octet-stream');
  return true;
};

const cibles = ['/', '/index.html', '/precache-manifest.json', ...manifeste.statiques, ...(contenu ?? []), ...manifeste.assets];
const images = existsSync(DOSSIER_IMAGES)
  ? readdirSync(DOSSIER_IMAGES).filter((f) => f.endsWith('.webp') || f.endsWith('.svg')).sort().map((f) => `/lecons/img/${f}`)
  : [];
let echecs = 0;
let octets = 0;
const lignesEchec = [];
for (const u of [...cibles, ...images]) {
  try {
    const r = await fetch(BASE + u);
    const corps = await r.arrayBuffer();
    octets += corps.byteLength;
    if (!r.ok || !typeOk(u, r)) {
      echecs++;
      lignesEchec.push(`${u} — HTTP ${r.status}, type « ${r.headers.get('content-type')} »`);
    }
  } catch (e) {
    echecs++;
    lignesEchec.push(`${u} — ${e.message}`);
  }
}
await serveur.close();

// ── 2 bis. Budget de poids : une app « Lite » qui grossit en silence n'est plus « Lite » ──
// Seuils volontairement atteignables : ils doivent échouer seulement sur une vraie régression,
// pas sur un build normal — sinon la CI sera désactivée au bout de trois commits.
const MIO = 1024 * 1024;
const BUDGET_COQUILLE = 2.25 * MIO;  // Phase 2 : plafond sacré, ~2,18 Mio mesurés avant pilote
const BUDGET_CONTENU = 5.0 * MIO;    // leçons + laboratoire + PDF, sur demande explicite
// Phase 3 : plafond d'acceptation ≤ 150 Ko par WebP de leçon. L'importeur garde une
// cible plus stricte de 100 Ko ; ce garde-fou est la porte de non-retour de la CI.
const BUDGET_ILLUSTRATION = 150 * 1024;
// Plan V2 §8.2 : une image de public/ au-delà de 150 ko est un accident, pas un choix.
// (Les anciens PNG faisaient 600 ko et 1 Mo : c'est exactement ce que ce seuil interdit.)
const BUDGET_FICHIER = 150 * 1024;
// Phase 3 / Lot 1 : le dossier des illustrations ne contient QUE des WebP ou des SVG ≤ 150 Ko,
// et ils n'apparaissent dans aucune liste du précache (vérifié en section 1).
// Les SVG sont écrits à la main (`scripts/generer-schemas-svt.mjs`) : pas de raster, pas de
// texte IA incrusté ; leurs libellés arabes viennent du registre TypeScript.
if (existsSync(DOSSIER_IMAGES)) {
  for (const f of readdirSync(DOSSIER_IMAGES)) {
    const chemin = join(DOSSIER_IMAGES, f);
    if (!statSync(chemin).isFile()) {
      problemes.push(`illustrations : ${f} est un dossier, pas un fichier`);
    } else if (!f.endsWith('.webp') && !f.endsWith('.svg')) {
      problemes.push(`illustrations : ${f} doit être un .webp (photo) ou un .svg (schéma vectoriel)`);
    } else if (statSync(chemin).size > BUDGET_ILLUSTRATION) {
      problemes.push(`illustrations : ${f} pèse ${Math.round(statSync(chemin).size / 1024)} ko > 150 ko`);
    } else if (f.endsWith('.svg')) {
      const source = readFileSync(chemin, 'utf8');
      if (!source.startsWith('<svg')) problemes.push(`illustrations : ${f} n'est pas un SVG autonome`);
      if (source.includes('base64') || /<image[\s>]/.test(source)) {
        problemes.push(`illustrations : ${f} embarque un raster (interdit : schéma vectoriel)`);
      }
      if (/[\u0600-\u06FF]/.test(source)) {
        problemes.push(`illustrations : ${f} contient du texte arabe incrusté (doit venir de l'app)`);
      }
    }
  }
}
if (manifeste.octetsCoquille > BUDGET_COQUILLE) {
  problemes.push(`budget : coquille ${(manifeste.octetsCoquille / MIO).toFixed(2)} Mio > ${BUDGET_COQUILLE / MIO} Mio`);
}
if (manifeste.octetsContenu > BUDGET_CONTENU) {
  problemes.push(`budget : contenu ${(manifeste.octetsContenu / MIO).toFixed(2)} Mio > ${BUDGET_CONTENU / MIO} Mio`);
}
if (contenu) {
  for (const u of [...manifeste.statiques, ...contenu]) {
    if (/\.pdf$/.test(u) || u.startsWith('/boussole/')) continue;
    const taille = readFileSync(`dist${u}`).byteLength;
    if (taille > BUDGET_FICHIER) problemes.push(`budget : ${u} pèse ${Math.round(taille / 1024)} ko > ${BUDGET_FICHIER / 1024} ko`);
  }
}
// Plan V2 §8.2 : `public/` entier est concerné, pas seulement ce qui entre en cache.
// Une image oubliée dans public/ finit toujours par se retrouver dans un précache un jour.
// Phase 3 : aucun fichier audio (.mp3/.wav/.ogg/.opus/.m4a) ne doit jamais entrer dans public/ ou dist/
// (les capsules TTS du المرشد sont publiées sur Cloudflare R2, jamais dans Git ni le bundle).
{
  const lourds = [];
  const audiosInterdits = [];
  const parcourir = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const chemin = join(dir, e.name);
      if (e.isDirectory()) { parcourir(chemin); continue; }
      if (/\.(mp3|wav|ogg|opus|m4a)$/i.test(e.name)) {
        audiosInterdits.push(chemin);
        continue;
      }
      if (/\.(pdf|mp4)$/i.test(e.name)) continue; // vidéo et PDF : exclus par le plan
      if (chemin.includes('/boussole/')) continue;
      const taille = statSync(chemin).size;
      if (taille > BUDGET_FICHIER) lourds.push(`${chemin.replace('public/', '/')} (${Math.round(taille / 1024)} ko)`);
    }
  };
  parcourir('public');
  if (existsSync('dist')) {
    const parcourirDist = (dir) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const chemin = join(dir, e.name);
        if (e.isDirectory()) { parcourirDist(chemin); continue; }
        if (/\.(mp3|wav|ogg|opus|m4a)$/i.test(e.name)) audiosInterdits.push(chemin);
      }
    };
    parcourirDist('dist');
  }
  for (const f of lourds) problemes.push(`budget : ${f} > ${BUDGET_FICHIER / 1024} ko — convertir ou redimensionner`);
  for (const f of audiosInterdits) problemes.push(`audio : ${f} interdit dans public/ ou dist/ (déployer sur R2)`);
}

// ── 3. Rapport ──
console.log('── vérification hors-ligne (niveau 1) ──');
console.log(`version du build      : ${version}`);
console.log(`assets JS/CSS         : ${manifeste.assets.length} — ${demarrage.length} au démarrage, tous dans le manifeste`);
console.log(`coquille (toujours)   : ${manifeste.statiques.length} entrées — ${(manifeste.octetsCoquille / MIO).toFixed(2)} Mio`);
console.log(`contenu (sur demande) : ${(contenu ?? []).length} entrées — ${(manifeste.octetsContenu / MIO).toFixed(2)} Mio`);
const poidsMaxImage = images.length
  ? Math.max(...images.map((u) => statSync(join(DOSSIER_IMAGES, u.slice('/lecons/img/'.length))).size))
  : 0;
console.log(`illustrations         : ${images.length} fichiers (WebP + SVG) — max ${(poidsMaxImage / 1024).toFixed(1)} Ko / plafond 150 Ko — servies à la volée, hors précache`);
console.log(`fichiers interrogés   : ${cibles.length + images.length} — ${octets} octets non compressés vus par HTTP`);
console.log(`manifeste (déclaré)   : ${manifeste.octets} octets non compressés`);
console.log(`problèmes de cohérence: ${problemes.length}`);
for (const p of problemes) console.log(`  ✗ ${p}`);
console.log(`échecs HTTP/type      : ${echecs}`);
for (const l of lignesEchec) console.log(`  ✗ ${l}`);

if (problemes.length || echecs) {
  console.log('RÉSULTAT : ÉCHEC');
  process.exit(1);
}
console.log('RÉSULTAT : OK — tout le contenu annoncé par le worker est servi réellement par le build.');
