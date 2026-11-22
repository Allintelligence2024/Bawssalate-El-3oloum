// Métriques du README — source unique de vérité (9.2 du Plan V2).
//
// Le README annonçait des chiffres qui vieillissaient seuls : « 46 leçons », « 700 items »,
// « 8,02 Mio »… Un lecteur ne pouvait pas savoir lesquels étaient encore vrais. Ce script
// recalcule tout depuis le code et réécrit le bloc entre les balises `<!-- METRICS:START -->`
// et `<!-- METRICS:END -->`.
//
// Usage :
//   node scripts/sync-metrics.mjs           # met le README à jour
//   node scripts/sync-metrics.mjs --check   # échoue si le README diverge (à mettre en CI)
//
// Aucun chiffre n'est saisi à la main ici : tout est compté. Si un chiffre est faux dans le
// README, il est faux ici aussi et la CI le dit.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DEBUT = '<!-- METRICS:START -->';
const FIN = '<!-- METRICS:END -->';

/** Les sources TypeScript s'importent telles quelles via vite-node, évité ici pour rester
 *  exécutable en `node` nu : on compte par expressions régulières sur un contenu connu. */
function lire(chemin) {
  return readFileSync(chemin, 'utf8');
}

const compte = (texte, motif) => (texte.match(motif) ?? []).length;

// ── Contenu pédagogique ──
const programme = lire('src/data/programme.ts');
const unites = compte(programme, /^ {2}\{\s*$/gm) > 0
  ? compte(programme, /\bid:\s*'u\d+'/g)
  : 0;
const leconsIds = (programme.match(/lessonIds:\s*\[[^\]]*\]/g) ?? [])
  .flatMap((bloc) => (bloc.match(/'[^']+'/g) ?? [])).length;

const resumes = lire('src/data/lessonGoldSummaries.ts');
// Une entrée = `cle: {` au niveau 2 du Record (les champs internes sont plus indentés).
const resumesTotal = compte(resumes, /^ {2}'[^']+':\s*\{$/gm) + compte(resumes, /^ {2}[\w-]+:\s*\{$/gm);
const resumesRelus = compte(resumes, /reviewed:\s*true/g);

// Les sujets sont répartis : 2020–2023 dans sujetsOfficiels.ts, le reste dans sujets/*.ts.
let sujetsOfficiels = compte(lire('src/data/sujetsOfficiels.ts'), /\bid:\s*'\d{4}-\d'/g);
for (const f of readdirSync('src/data/sujets')) {
  if (f.endsWith('.ts')) sujetsOfficiels += compte(lire(join('src/data/sujets', f)), /\bid:\s*'\d{4}-\d'/g);
}
// Les corrigés : 2023–2026 dans sujetsCorriges.ts, 2013–2022 dans corriges/c*.ts.
let corriges = compte(lire('src/data/sujetsCorriges.ts'), /\bsujetId:\s*'\d{4}-\d'/g);
for (const f of readdirSync('src/data/corriges')) {
  if (f.endsWith('.ts')) corriges += compte(lire(join('src/data/corriges', f)), /\bsujetId:\s*'\d{4}-\d'/g);
}

// Drills : un item = un `id:` dans les fichiers de domaine (les `axes.ts` ne font que compter).
// Quatre fichiers portent des items : domaine1..3 ET niveau3 (oublié lors du premier
// comptage — l'écart 620/700 venait de là). CRLF normalisé : sinon `$` ne s'ancre pas
// et des items disparaissent silencieusement du décompte.
const FICHIERS_ITEMS = ['domaine1', 'domaine2', 'domaine3', 'niveau3'];
let drills = 0;
let axes = 0;
for (const f of FICHIERS_ITEMS) {
  const contenu = lire(join('src/data/drills', `${f}.ts`)).replace(/\r\n/g, '\n');
  drills += compte(contenu, /^\s*\{ id: '/gm);
}
const fichiersDrills = FICHIERS_ITEMS.length;
const contenuAxes = lire('src/data/drills/axes.ts').replace(/\r\n/g, '\n');
axes = compte(contenuAxes, /^\s*\{\s*id:\s*\d+,/gm);

// ── Qualité ──
let fichiersTests = 0;
for (const racine of ['src']) {
  const parcourir = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const chemin = join(dir, e.name);
      if (e.isDirectory()) parcourir(chemin);
      else if (/\.test\.tsx?$/.test(e.name)) fichiersTests++;
    }
  };
  parcourir(racine);
}

// ── Poids (nécessite un build ; on lit le manifeste s'il existe) ──
const cheminManifeste = 'dist/precache-manifest.json';
let poids = null;
if (existsSync(cheminManifeste)) {
  const m = JSON.parse(lire(cheminManifeste));
  poids = {
    coquille: m.octetsCoquille,
    contenu: m.octetsContenu,
    statiques: m.statiques.length,
    contenuEntrees: m.contenu.length,
  };
}

const mo = (o) => `${(o / (1024 * 1024)).toFixed(2)} Mio`;

const lignes = [];
lignes.push(DEBUT);
lignes.push('');
lignes.push('<!-- Bloc généré par `node scripts/sync-metrics.mjs`. Ne pas modifier à la main. -->');
lignes.push('');
lignes.push('| Métrique | Valeur |');
lignes.push('| --- | --- |');
lignes.push(`| Unités du programme | **${unites}** |`);
lignes.push(`| Leçons référencées | **${leconsIds}** |`);
lignes.push(`| Résumés dorés | **${resumesTotal}** (relus : ${resumesRelus}) |`);
lignes.push(`| Sujets officiels structurés | **${sujetsOfficiels}** |`);
lignes.push(`| Sujets avec éléments de réponse | **${corriges}** |`);
lignes.push(`| Axes de drills | **${axes}** |`);
lignes.push(`| Items de drills | **${drills}** (${fichiersDrills} fichiers) |`);
lignes.push(`| Fichiers de tests | **${fichiersTests}** |`);
if (poids) {
  lignes.push(`| Coquille hors ligne (téléchargée d'office) | **${mo(poids.coquille)}** (${poids.statiques} entrées) |`);
  lignes.push(`| Contenu hors ligne (sur demande) | **${mo(poids.contenu)}** (${poids.contenuEntrees} entrées) |`);
} else {
  lignes.push('| Poids hors ligne | *non mesuré — lancer `npm run build`* |');
}
lignes.push('');
lignes.push(FIN);

const bloc = lignes.join('\n');

const cheminReadme = 'README.md';
const readme = lire(cheminReadme);
const motif = new RegExp(`${DEBUT}[\\s\\S]*?${FIN}`);

if (!motif.test(readme)) {
  console.error(`Le README ne contient pas les balises ${DEBUT} / ${FIN}.`);
  console.error('Ajoutez-les là où le bloc de métriques doit vivre, puis relancez.');
  process.exit(2);
}

const nouveau = readme.replace(motif, bloc);

if (process.argv.includes('--check')) {
  if (nouveau !== readme) {
    console.error('Le bloc de métriques du README est périmé.');
    console.error('Lancer : node scripts/sync-metrics.mjs');
    // On montre le diff pour que la correction soit évidente.
    const avant = readme.match(motif)[0].split('\n');
    const apres = bloc.split('\n');
    for (let i = 0; i < Math.max(avant.length, apres.length); i++) {
      if (avant[i] !== apres[i]) {
        console.error(`  ligne ${i + 1}:`);
        console.error(`    - ${avant[i] ?? '(absente)'}`);
        console.error(`    + ${apres[i] ?? '(absente)'}`);
      }
    }
    process.exit(1);
  }
  console.log('README à jour : aucune dérive de métriques.');
  process.exit(0);
}

writeFileSync(cheminReadme, nouveau, 'utf8');
console.log('README mis à jour.');
console.log(bloc);
