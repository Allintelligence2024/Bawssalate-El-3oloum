// Cohérence matérielle de l'inventaire local, pas vérification des droits.
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racineDefaut = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const debut = '<!-- BOUSSOLE-INVENTAIRE-DEBUT -->';
const fin = '<!-- BOUSSOLE-INVENTAIRE-FIN -->';
const dossierInventaire = 'plans/sources/INVENTAIRE-BOUSSOLE-2026-11-21.md';

/** Uniquement les octets du laboratoire : pas les autres contenus de l'application. */
export async function verifierInventaire(racine = racineDefaut) {
  const erreurs = [];
  const cheminRegistre = path.join(racine, dossierInventaire);
  let texte;
  try { texte = await readFile(cheminRegistre, 'utf8'); }
  catch { return { erreurs: [`Inventaire introuvable : ${dossierInventaire}`], nombre: 0 }; }

  const blocs = texte.split(debut);
  const fins = blocs.length === 2 ? blocs[1].split(fin) : [];
  if (blocs.length !== 2 || fins.length !== 2) {
    return { erreurs: ['Balises d’inventaire manquantes ou dupliquées.'], nombre: 0 };
  }
  const inscrits = new Map();
  for (const ligne of fins[0].split('\n')) {
    if (!ligne.startsWith('| `')) continue;
    const m = /^\| `([^`]+)` \| `([0-9a-f]{64})` \| [^|]+ \|$/.exec(ligne.trim());
    if (!m) { erreurs.push(`Ligne d’inventaire invalide : ${ligne.slice(0, 150)}`); continue; }
    const [, nom, empreinte] = m;
    if (inscrits.has(nom)) erreurs.push(`Entrée dupliquée : ${nom}`);
    inscrits.set(nom, empreinte);
  }
  if (inscrits.size === 0) erreurs.push('Inventaire vide.');

  const presents = new Set();
  async function parcourir(relatif) {
    let entrees;
    try { entrees = await readdir(path.join(racine, relatif), { withFileTypes: true }); }
    catch { erreurs.push(`Dossier introuvable : ${relatif}`); return; }
    for (const e of entrees) {
      const nom = `${relatif}/${e.name}`;
      if (e.isSymbolicLink()) { erreurs.push(`Lien symbolique non inventorié : ${nom}`); continue; }
      if (e.isDirectory()) await parcourir(nom);
      else if (e.isFile()) presents.add(nom);
      else erreurs.push(`Entrée non ordinaire : ${nom}`);
    }
  }
  await parcourir('modules/boussole/assets');
  await parcourir('public/boussole');

  for (const nom of presents) if (!inscrits.has(nom)) erreurs.push(`Fichier absent de l’inventaire : ${nom}`);
  for (const [nom, empreinte] of inscrits) {
    if (!presents.has(nom)) { erreurs.push(`Fichier inventorié absent : ${nom}`); continue; }
    const octets = await readFile(path.join(racine, nom));
    const actuelle = createHash('sha256').update(octets).digest('hex');
    if (actuelle !== empreinte) erreurs.push(`Empreinte modifiée : ${nom}`);
  }
  return { erreurs, nombre: inscrits.size };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const resultat = await verifierInventaire();
  if (resultat.erreurs.length) {
    console.error(resultat.erreurs.join('\n'));
    process.exitCode = 1;
  } else {
    console.log(`Inventaire matériel cohérent : ${resultat.nombre} fichiers.`);
    console.log('Ce contrôle ne vérifie ni les droits, ni la relecture, ni l’autorisation de diffusion.');
  }
}
