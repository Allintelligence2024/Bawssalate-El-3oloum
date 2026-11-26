// Phase 2 — pipeline réutilisable Drive → WebP → registre typé des illustrations.
//
//   node scripts/importer-images-lecons.mjs --unites=u6
//   node scripts/importer-images-lecons.mjs --unites=u6,u7,u8,u9,u11 --source-dir=.cache/drive-images
//   node scripts/importer-images-lecons.mjs --unites=u6 --download   # nécessite GOOGLE_DRIVE_ACCESS_TOKEN
//
// Règles strictes :
//  - seules les entrées `qaStatus === 'OK'` du manifeste sont importées ;
//  - sortie unique : `public/lecons/img/<proposedName>.webp`, jamais de JPEG dans Git ;
//  - WebP largeur max 1200 px, qualité 80, EXIF/métadonnées supprimés, cible ≤ 100 Ko
//    et plafond d'acceptation ≤ 150 Ko (Phase 3) si aucun palier n'atteint la cible ;
//  - `src/data/illustrationsLegacy.gen.ts` est régénéré avec `statut: 'a_valider_enseignant'`
//    et `reviewed: false` (jamais promu `true`) ; un import partiel (`--unites=u6`) conserve
//    les entrées des autres unités déjà présentes dans le fichier.
//
// La conversion s'appuie sur ImageMagick (`convert` + `identify`, délégué WebP présent
// dans l'environnement de build) : aucune dépendance npm supplémentaire, donc aucun
// impact sur la coquille hors ligne.

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MANIFESTE = join(RACINE, 'plans/inventaire-images-livre.json');
const INDEX_LOCAL = join(RACINE, 'plans/_travail-images/index.tsv');
// Le registre GÉNÉRÉ ne contient que les 21 WebP du manuel. Les types, la fusion avec les
// schémas créés et les helpers vivent dans `src/data/illustrationsLecons.ts`, qui n'est
// JAMAIS réécrit par ce script.
const REGISTRE = join(RACINE, 'src/data/illustrationsLegacy.gen.ts');
const DOSSIER_SORTIE = join(RACINE, 'public/lecons/img');
const LIMITE_OCTETS = 100 * 1024;   // cible historique du pilote U6 : on la garde
const LIMITE_PLAFOND = 150 * 1024;  // plafond d'acceptation Phase 3, vérifié en CI
const LARGEURS = [1200, 1150, 1100, 1050, 1000, 950, 900, 850, 800, 750, 700, 650, 600];

const args = process.argv.slice(2);
const aide = args.includes('--help') || args.includes('-h');
const telecharger = args.includes('--download');

function valeur(nom) {
  const prefixe = `--${nom}=`;
  const avecEgal = args.find((a) => a.startsWith(prefixe));
  if (avecEgal) return avecEgal.slice(prefixe.length);
  const i = args.indexOf(`--${nom}`);
  return i >= 0 ? args[i + 1] : undefined;
}

if (aide) {
  console.log([
    'Usage : node scripts/importer-images-lecons.mjs [--unites=u6|u6,u7,u8,u9,u11]',
    '        [--source-dir=.cache/drive-images] [--download]',
    '',
    '--download requiert GOOGLE_DRIVE_ACCESS_TOKEN (API Drive v3, alt=media).',
    'Sans --download, les copies locales sont cherchées dans --source-dir :',
    '  - par nom Drive exact, par proposedName, ou par imgNNN.jpg via l’index TSV.',
    '',
    'Sorties : public/lecons/img/*.webp + src/data/illustrationsLegacy.gen.ts',
  ].join('\n'));
  process.exit(0);
}

const sourceRel = valeur('source-dir') ?? '.cache/drive-images';
const DOSSIER_SOURCE = resolve(RACINE, sourceRel);

const brutUnites = valeur('unites');
const unites = brutUnites
  ? brutUnites.split(',').map((u) => u.trim()).filter(Boolean)
  : null;

function echapperHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function echapperTs(s) {
  return String(s)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r?\n/g, '\\n');
}

function indexParIdentifiant() {
  if (!existsSync(INDEX_LOCAL)) return new Map();
  const lignes = readFileSync(INDEX_LOCAL, 'utf8').split(/\r?\n/).filter(Boolean);
  const map = new Map();
  for (let i = 1; i < lignes.length; i++) {
    const colonnes = lignes[i].split('\t');
    if (colonnes.length < 2) continue;
    map.set(colonnes[1], `img${String(i).padStart(3, '0')}.jpg`);
  }
  return map;
}

function trouverSource(entree, index) {
  const noms = [entree.originalName, entree.proposedName];
  const img = index.get(entree.driveFileId);
  if (img) noms.push(img);
  if (/\.jpe?g$/i.test(entree.originalName)) {
    noms.push(entree.originalName.replace(/\.jpe?g$/i, '.jpg'));
  }
  for (const nom of noms) {
    const chemin = join(DOSSIER_SOURCE, nom);
    if (existsSync(chemin) && statSync(chemin).isFile()) return chemin;
  }
  return null;
}

async function telechargerDepuisDrive(entree, destination) {
  const jeton = process.env.GOOGLE_DRIVE_ACCESS_TOKEN;
  if (!jeton) {
    throw new Error('--download exige GOOGLE_DRIVE_ACCESS_TOKEN (jeton OAuth Drive v3).');
  }
  const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(entree.driveFileId)}?alt=media&supportsAllDrives=true`;
  const reponse = await fetch(url, { headers: { Authorization: `Bearer ${jeton}` } });
  if (!reponse.ok) {
    throw new Error(`Drive a refusé ${entree.driveFileId} : HTTP ${reponse.status}`);
  }
  const octets = Buffer.from(await reponse.arrayBuffer());
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, octets);
  return destination;
}

function convertir(source, sortie, largeurMax) {
  const r = spawnSync('convert', [
    source,
    '-auto-orient',
    '-strip',
    '-resize', `${largeurMax}x${largeurMax}>`,
    '-quality', '80',
    '-define', 'webp:method=6',
    sortie,
  ], { encoding: 'utf8' });
  if (r.error || r.status !== 0) {
    throw new Error(`convert a échoué pour ${source} : ${r.error?.message ?? r.stderr?.trim() ?? 'status ' + r.status}`);
  }
}

function dimensions(sortie) {
  const r = spawnSync('identify', ['-format', '%w %h', sortie], { encoding: 'utf8' });
  if (r.error || r.status !== 0) {
    throw new Error(`identify a échoué pour ${sortie} : ${r.error?.message ?? r.stderr?.trim() ?? ''}`);
  }
  const [largeur, hauteur] = r.stdout.trim().split(/\s+/).map(Number);
  if (!Number.isInteger(largeur) || !Number.isInteger(hauteur) || largeur < 1 || hauteur < 1) {
    throw new Error(`dimensions illisibles pour ${sortie} : « ${r.stdout.trim()} »`);
  }
  return { largeur, hauteur };
}

function verifierSansExif(sortie) {
  const r = spawnSync('identify', ['-format', '%[EXIF:*]', sortie], { encoding: 'utf8' });
  if (r.error || r.status !== 0 || r.stdout.trim() !== '') {
    throw new Error(`métadonnées EXIF encore présentes dans ${sortie}`);
  }
}

function produireWebp(source, sortie) {
  // 1) Cible : ≤ 100 Ko, quitte à réduire la largeur par pas de 50 px.
  let retenu = null;
  for (const largeurMax of LARGEURS) {
    convertir(source, sortie, largeurMax);
    const taille = statSync(sortie).size;
    if (taille <= LIMITE_OCTETS) {
      retenu = { largeurMax, taille };
      break;
    }
  }
  // 2) Repli : le plafond d'acceptation de 150 Ko, uniquement si aucun palier n'a
  //    permis d'atteindre la cible — on garde alors la plus grande largeur lisible.
  if (!retenu) {
    for (const largeurMax of LARGEURS) {
      convertir(source, sortie, largeurMax);
      const taille = statSync(sortie).size;
      if (taille <= LIMITE_PLAFOND) {
        retenu = { largeurMax, taille };
        break;
      }
    }
  }
  if (!retenu) {
    throw new Error(`impossible de descendre sous ${LIMITE_PLAFOND} octets pour ${sortie}`);
  }
  verifierSansExif(sortie);
  const { largeur, hauteur } = dimensions(sortie);
  if (largeur > 1200 || hauteur > 1200) {
    throw new Error(`${sortie} dépasse 1200 px : ${largeur}x${hauteur}`);
  }
  return { ...retenu, largeur, hauteur };
}

function legendeAr(entree, docNum) {
  const titre = echapperHtml(entree.titreAr);
  const numero = docNum ? `<strong>الوثيقة (${docNum})</strong> — ` : '';
  return `<span>${numero}${titre}</span>`;
}

/** Relit le registre généré (format machine stable) pour ne pas perdre les autres unités. */
function lireEntreesExistantes() {
  if (!existsSync(REGISTRE)) return [];
  const source = readFileSync(REGISTRE, 'utf8');
  const entrees = [];
  const blocs = source.split(/\n {2}\{\n/).slice(1);
  for (const bloc of blocs) {
    const champ = (nom) => {
      const m = new RegExp(`\\n    ${nom}: ('(?:[^'\\\\]|\\\\.)*'|\\d+),`).exec(bloc);
      if (!m) return undefined;
      if (m[1].startsWith("'")) {
        return m[1].slice(1, -1).replace(/\\'/g, "'").replace(/\\\\/g, '\\');
      }
      return Number(m[1]);
    };
    const id = champ('id');
    if (!id) continue;
    const entree = {
      id,
      lessonId: champ('lessonId'),
      uniteId: champ('uniteId'),
      docNum: champ('docNum'),
      fichier: champ('fichier'),
      largeur: champ('largeur'),
      hauteur: champ('hauteur'),
      titreAr: champ('titreAr'),
      altAr: champ('altAr'),
      legendeAr: champ('legendeAr'),
    };
    if (entree.lessonId && entree.uniteId && entree.fichier) entrees.push(entree);
  }
  return entrees;
}

function ecrireRegistre(fraiches) {
  // Fusion par `id` : une unité réimportée remplace ses propres entrées, les autres restent.
  const parId = new Map(lireEntreesExistantes().map((e) => [e.id, e]));
  for (const e of fraiches) parId.set(e.id, e);
  const entrees = [...parId.values()].sort(
    (a, b) => String(a.uniteId).localeCompare(String(b.uniteId)) || String(a.id).localeCompare(String(b.id)),
  );
  const L = [];
  L.push('// GÉNÉRÉ par `node scripts/importer-images-lecons.mjs`. Ne pas éditer à la main.');
  L.push('// Les WebP `OK` du manuel (Phase 2/3) — copies optimisées, en attente de validation enseignant.');
  L.push('// Ce fichier ne contient QUE des données : les types, la fusion avec les schémas créés');
  L.push('// et les helpers vivent dans `src/data/illustrationsLecons.ts`.');
  L.push('');
  L.push("import type { IllustrationLecon } from './illustrationsLecons';");
  L.push('');
  L.push('export const ILLUSTRATIONS_LECONS_LEGACY: IllustrationLecon[] = [');
  for (const e of entrees) {
    L.push('  {');
    L.push(`    id: '${echapperTs(e.id)}',`);
    L.push(`    lessonId: '${echapperTs(e.lessonId)}',`);
    L.push(`    uniteId: '${echapperTs(e.uniteId)}',`);
    if (e.docNum) L.push(`    docNum: '${echapperTs(e.docNum)}',`);
    L.push(`    typeVisuel: 'webp_legacy',`);
    L.push(`    fichier: '${echapperTs(e.fichier)}',`);
    L.push(`    largeur: ${e.largeur},`);
    L.push(`    hauteur: ${e.hauteur},`);
    L.push(`    titreAr: '${echapperTs(e.titreAr)}',`);
    L.push(`    altAr: '${echapperTs(e.altAr)}',`);
    L.push(`    legendeAr: '${echapperTs(e.legendeAr)}',`);
    L.push("    statut: 'a_valider_enseignant',");
    L.push('    reviewed: false,');
    L.push('  },');
  }
  L.push('];');
  L.push('');
  writeFileSync(REGISTRE, L.join('\n'), 'utf8');
}

function nettoyerSorties(attendus) {
  const problemes = [];
  for (const nom of readdirSync(DOSSIER_SORTIE)) {
    const chemin = join(DOSSIER_SORTIE, nom);
    if (!statSync(chemin).isFile()) {
      problemes.push(`entrée non fichier dans public/lecons/img/ : ${nom}`);
      continue;
    }
    if (nom.endsWith('.svg')) continue; // schémas vectoriels créés : hors périmètre de l'importeur
    if (!nom.endsWith('.webp')) {
      problemes.push(`fichier brut interdit dans public/lecons/img/ : ${nom}`);
      continue;
    }
    if (!attendus.has(nom)) {
      unlinkSync(chemin);
      console.log(`  WebP obsolète supprimé : ${nom}`);
    }
  }
  if (problemes.length) throw new Error(problemes.join('\n'));
}

async function main() {
  const manifeste = JSON.parse(readFileSync(MANIFESTE, 'utf8'));
  const unitesConnues = new Set(manifeste.map((x) => x.uniteId));
  if (unites) {
    for (const u of unites) {
      if (!unitesConnues.has(u)) throw new Error(`unité inconnue dans le manifeste : ${u}`);
    }
  }
  const retenues = manifeste.filter((x) =>
    x.qaStatus === 'OK' && (!unites || unites.includes(x.uniteId)));
  const ignorees = manifeste.filter((x) =>
    x.qaStatus !== 'OK' && (!unites || unites.includes(x.uniteId)));
  const parStatut = ignorees.reduce((acc, x) => {
    acc[x.qaStatus] = (acc[x.qaStatus] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`Manifest : ${manifeste.length} entrées — ${retenues.length} OK retenues, ${ignorees.length} ignorées`);
  if (ignorees.length) {
    console.log(`  refus d'importer : ${Object.entries(parStatut).map(([k, v]) => `${k}=${v}`).join(', ')}`);
  }
  if (unites) console.log(`  filtre --unites : ${unites.join(', ')}`);

  mkdirSync(DOSSIER_SORTIE, { recursive: true });
  const index = indexParIdentifiant();
  const entrees = [];

  for (const entree of retenues) {
    const fichier = entree.proposedName.replace(/\.jpe?g$/i, '.webp');
    const sortie = join(DOSSIER_SORTIE, fichier);
    let source = trouverSource(entree, index);
    if (!source && telecharger) {
      source = await telechargerDepuisDrive(entree, join(DOSSIER_SOURCE, entree.originalName));
      console.log(`  téléchargé : ${entree.originalName}`);
    }
    if (!source) {
      throw new Error(
        `source introuvable pour ${entree.originalName} (${entree.driveFileId}). ` +
        `Placer les copies dans ${DOSSIER_SOURCE} ou utiliser --download.`,
      );
    }
    const resultat = produireWebp(source, sortie);
    const docNum = entree.docNum == null ? undefined : String(entree.docNum).padStart(2, '0');
    entrees.push({
      id: fichier.replace(/\.webp$/, ''),
      lessonId: entree.lessonId,
      uniteId: entree.uniteId,
      docNum,
      fichier,
      largeur: resultat.largeur,
      hauteur: resultat.hauteur,
      titreAr: entree.titreAr,
      altAr: entree.altAr,
      legendeAr: legendeAr(entree, docNum),
      taille: resultat.taille,
      largeurMax: resultat.largeurMax,
    });
    console.log(
      `  ${fichier} — ${resultat.largeur}x${resultat.hauteur}, ` +
      `${(resultat.taille / 1024).toFixed(1)} Ko, largeur max ${resultat.largeurMax} px`,
    );
  }

  entrees.sort((a, b) =>
    a.uniteId.localeCompare(b.uniteId) ||
    a.lessonId.localeCompare(b.lessonId) ||
    a.fichier.localeCompare(b.fichier));
  ecrireRegistre(entrees);
  nettoyerSorties(new Set(entrees.map((e) => e.fichier)));

  const total = entrees.reduce((s, e) => s + e.taille, 0);
  const max = entrees.reduce((m, e) => Math.max(m, e.taille), 0);
  console.log(`Registre : ${REGISTRE.replace(`${RACINE}/`, '')} (${entrees.length} entrées)`);
  console.log(`WebP     : ${entrees.length} fichiers, ${(total / 1024).toFixed(1)} Ko au total, max ${(max / 1024).toFixed(1)} Ko`);
  console.log('OK — aucune image FIX_TEXT/REJECT importée, aucun JPEG, reviewed=false partout.');
}

main().catch((erreur) => {
  console.error(`ÉCHEC : ${erreur.message}`);
  process.exitCode = 1;
});
