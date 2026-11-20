// Vérification automatisée hors-ligne (NIVEAU 1) — P0.7 / P1-1.
// Contrôle HTTP réel sur chaque entrée du manifeste de précache du build courant, plus la
// cohérence HTML ↔ manifeste ↔ worker (mêmes règles que l'install du worker dans sw.js).
// S'exécuter APRÈS `npm run build`. Le niveau 2 (appareil réel, mode avion) n'est jamais
// remplacé par ce script : cf. plans/preuves/hors-ligne.md §2.
import { readFileSync, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';

const PORT = 4187;
const BASE = `http://127.0.0.1:${PORT}`;

if (!existsSync('dist/precache-manifest.json')) {
  console.error('ABSENT : dist/precache-manifest.json — lancer « npm run build » d\'abord.');
  process.exit(1);
}
const VITE = 'node_modules/vite/bin/vite.js';
if (!existsSync(VITE)) {
  console.error('ABSENT : ' + VITE + ' — lancer « npm install » d\'abord.');
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
const statiquesOk = Array.isArray(manifeste.statiques) && manifeste.statiques.length > 0 &&
  manifeste.statiques.every((u) => /^\/lecons\/[a-zA-Z0-9_.-]+\.html$/.test(u) ||
    ['/icon.svg', '/manifest.webmanifest', '/mascotte.png', '/personnage-pirate.png'].includes(u));
if (!statiquesOk) problemes.push('manifeste : entrées statiques non conformes à la règle du worker');
const demarrage = [...html.matchAll(/(?:src|href)="(\/assets\/[^"?]+\.(?:js|css))"/g)].map((x) => x[1]);
if (!demarrage.length) problemes.push('index.html : aucun asset de démarrage');
for (const u of demarrage) if (!manifeste.assets.includes(u)) problemes.push(`asset de démarrage hors manifeste : ${u}`);

// ── 2. Serveur preview + requêtes HTTP réelles ──
// Lancé directement par node (pas de shell ni de commande propre à un OS) : l'arrêt
// se fait par l'arrêt normal du processus, sur toutes les plateformes.
const serveur = spawn(process.execPath, [VITE, 'preview', '--port', String(PORT), '--strictPort', '--host', '127.0.0.1'], {
  stdio: 'ignore',
});
const arreterServeur = () => {
  if (serveur.exitCode === null && serveur.pid) { try { serveur.kill(); } catch { /* déjà arrêté */ } }
};
let pret = false;
for (let i = 0; i < 60 && !pret; i++) {
  try { const r = await fetch(BASE + '/index.html'); pret = r.ok; } catch { await new Promise((r) => setTimeout(r, 500)); }
}
if (!pret) {
  console.error('ÉCHEC : le serveur preview n\'a pas démarré sur ' + BASE);
  arreterServeur();
  process.exit(1);
}

const typeOk = (url, res) => {
  const t = (res.headers.get('content-type') || '').toLowerCase();
  if (url.endsWith('.js')) return t.includes('javascript');
  if (url.endsWith('.css')) return t.includes('text/css');
  if (url.endsWith('.html') || url === '/') return t.includes('text/html');
  return true;
};

const cibles = ['/', '/index.html', '/precache-manifest.json', ...manifeste.statiques, ...manifeste.assets];
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
arreterServeur();

// ── 3. Rapport ──
console.log('── vérification hors-ligne (niveau 1) ──');
console.log(`version du build      : ${version}`);
console.log(`assets JS/CSS         : ${manifeste.assets.length} — ${demarrage.length} au démarrage, tous dans le manifeste`);
console.log(`entrées statiques     : ${manifeste.statiques.length} (leçons HTML + icônes/manifeste)`);
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
