// Vérification automatisée hors-ligne (NIVEAU 1) — P0.7 / P1-1.
// Contrôle HTTP réel sur chaque entrée du manifeste de précache du build courant, plus la
// cohérence HTML ↔ manifeste ↔ worker (mêmes règles que l'install du worker dans sw.js).
// S'exécuter APRÈS `npm run build`. Le niveau 2 (appareil réel, mode avion) n'est jamais
// remplacé par ce script : cf. plans/preuves/hors-ligne.md §2.
import { readFileSync, existsSync } from 'node:fs';
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
const COQUILLE = ['/icon.svg', '/manifest.webmanifest', '/mascotte.webp', '/personnage-pirate.webp'];
const coquilleOk = Array.isArray(manifeste.statiques) && manifeste.statiques.length > 0 &&
  manifeste.statiques.every((u) => COQUILLE.includes(u));
if (!coquilleOk) problemes.push('manifeste : entrées de coquille non conformes à la règle du worker');
const contenu = Array.isArray(manifeste.contenu) ? manifeste.contenu : null;
if (!contenu) problemes.push('manifeste : liste « contenu » absente');
else {
  const contenuOk = contenu.every((u) => /^\/lecons\/[a-zA-Z0-9_.-]+\.html$/.test(u) ||
    ['/boussole/index.html', '/boussole/cahier-bac-2022.pdf', '/boussole/memo.pdf'].includes(u));
  if (!contenuOk) problemes.push('manifeste : entrées de contenu non conformes à la règle du worker');
  if (contenu.length === 0) problemes.push('manifeste : contenu lourd vide (le bouton de téléchargement ne servirait à rien)');
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
  return true;
};

const cibles = ['/', '/index.html', '/precache-manifest.json', ...manifeste.statiques, ...(contenu ?? []), ...manifeste.assets];
let echecs = 0;
let octets = 0;
const lignesEchec = [];
for (const u of cibles) {
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
const BUDGET_COQUILLE = 2.5 * MIO;   // interface + assets, ce que tout élève télécharge
const BUDGET_CONTENU = 5.0 * MIO;    // leçons + laboratoire + PDF, sur demande explicite
const BUDGET_FICHIER = 300 * 1024;   // aucun fichier de public/ au-delà (hors PDF/labo)
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

// ── 3. Rapport ──
console.log('── vérification hors-ligne (niveau 1) ──');
console.log(`version du build      : ${version}`);
console.log(`assets JS/CSS         : ${manifeste.assets.length} — ${demarrage.length} au démarrage, tous dans le manifeste`);
console.log(`coquille (toujours)   : ${manifeste.statiques.length} entrées — ${(manifeste.octetsCoquille / MIO).toFixed(2)} Mio`);
console.log(`contenu (sur demande) : ${(contenu ?? []).length} entrées — ${(manifeste.octetsContenu / MIO).toFixed(2)} Mio`);
console.log(`fichiers interrogés   : ${cibles.length} — ${octets} octets non compressés vus par HTTP`);
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
