// Contrôle de ce qui est RÉELLEMENT servi après un build — niveau « smoke test ».
// Comble un trou réel : `vite build` pouvait réussir en production alors que `tsc -b` n'avait
// jamais tourné (Vercel lançait `vite build` seul). On vérifie donc ici :
//   1. le HTML répond 200 avec le bon `build-id` ;
//   2. le manifeste de précache est valide et versionné comme le build ;
//   3. le worker est servi avec les bons en-têtes et sans placeholder ;
//   4. le manifeste PWA et l'icône sont servis avec le bon type ;
//   5. le laboratoire Boussole est bien servi (il est hors précache obligatoire mais en ligne).
// À lancer APRÈS `npm run build`. Ne remplace pas un essai sur appareil réel.
import { readFileSync, existsSync } from 'node:fs';
import { preview } from 'vite';

if (!existsSync('dist/precache-manifest.json')) {
  console.error('ABSENT : dist/precache-manifest.json — lancer « npm run build » d’abord.');
  process.exit(1);
}
const manifeste = JSON.parse(readFileSync('dist/precache-manifest.json', 'utf8'));
const version = manifeste.version;
const serveur = await preview({ preview: { port: 0, host: '127.0.0.1' } });
const base = `http://127.0.0.1:${serveur.httpServer.address().port}`;
const problemes = [];

async function attendre(chemin, { type, contient, status = 200 } = {}) {
  try {
    const r = await fetch(base + chemin);
    const corps = await r.text();
    const ct = (r.headers.get('content-type') || '').toLowerCase();
    if (r.status !== status) problemes.push(`${chemin} — HTTP ${r.status} (attendu ${status})`);
    if (type && !ct.includes(type)) problemes.push(`${chemin} — type « ${ct} » (attendu ~${type})`);
    if (contient && !corps.includes(contient)) problemes.push(`${chemin} — contenu attendu absent : ${contient}`);
    return { r, corps };
  } catch (e) {
    problemes.push(`${chemin} — ${e.message}`);
    return null;
  }
}

await attendre('/', { type: 'text/html', contient: `name="kunz-build-id" content="${version}"` });
await attendre('/index.html', { type: 'text/html', contient: version });
const sw = await attendre('/sw.js', { type: 'javascript' });
if (sw && sw.corps.includes('__KUNZ_BUILD_ID__')) problemes.push('/sw.js — placeholder de version non remplacé');
if (sw && !sw.corps.includes(version)) problemes.push('/sw.js — ne porte pas la version du build');
await attendre('/precache-manifest.json', { type: 'json' });
await attendre('/manifest.webmanifest', { type: 'json' });
await attendre('/icon.svg', { type: 'svg' });
await attendre('/boussole/index.html', { type: 'text/html' });

// La coquille doit rester légère : c'est la promesse « Lite ».
const MIO = 1024 * 1024;
const BUDGET_COQUILLE = 2.5 * MIO;
if (manifeste.octetsCoquille > BUDGET_COQUILLE) {
  problemes.push(`coquille ${(manifeste.octetsCoquille / MIO).toFixed(2)} Mio > ${BUDGET_COQUILLE / MIO} Mio`);
}
await serveur.close();

console.log('── contrôle de déploiement (smoke test) ──');
console.log(`version du build : ${version}`);
console.log(`coquille         : ${(manifeste.octetsCoquille / MIO).toFixed(2)} Mio (plafond ${BUDGET_COQUILLE / MIO} Mio)`);
console.log(`contenu          : ${(manifeste.octetsContenu / MIO).toFixed(2)} Mio (sur demande)`);
console.log(`problèmes        : ${problemes.length}`);
for (const p of problemes) console.log(`  ✗ ${p}`);
if (problemes.length) {
  console.log('RÉSULTAT : ÉCHEC');
  process.exit(1);
}
console.log('RÉSULTAT : OK — le build sert bien l’interface, le worker et le laboratoire.');
