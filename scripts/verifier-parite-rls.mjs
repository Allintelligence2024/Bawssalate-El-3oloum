// Parité RLS code ↔ production (7.3.3 du Plan V2).
//
// Ce script interroge la base cible et échoue si une politique ou une fonction attendue
// par `supabase/schema.sql` manque en production — ou si la base contient une politique
// qui n'est décrite nulle part dans le dépôt (drift inverse, tout aussi dangereux).
//
// Usage :
//   SUPABASE_DB_URL=postgres://... node scripts/verifier-parite-rls.mjs
//   node scripts/verifier-parite-rls.mjs --fichier policies.json  (pour un test hors ligne)
//
// Sans URL ni fichier, le script explique quoi faire et sort en erreur : il ne prétend
// jamais que la parité est vérifiée alors qu'il n'a rien regardé.
import { readFileSync } from 'node:fs';

/** Politiques que `schema.sql` / les migrations déclarent pour `public.eleves`. */
const ATTENDU = [
  { nom: 'eleves_jeton_obligatoire', permissive: 'RESTRICTIVE', cmd: 'ALL' },
  { nom: 'ecriture_app', permissive: 'PERMISSIVE', cmd: 'INSERT' },
  { nom: 'maj_app', permissive: 'PERMISSIVE', cmd: 'UPDATE' },
  { nom: 'suppression_app', permissive: 'PERMISSIVE', cmd: 'DELETE' },
  { nom: 'lecture_proprietaire', permissive: 'PERMISSIVE', cmd: 'SELECT' },
];

/** Fonctions attendues (nom, arguments). */
const FONCTIONS_ATTENDUES = [
  { nom: 'eleves_jeton_autorise', args: 'jeton text' },
];

const fichier = process.argv.includes('--fichier')
  ? process.argv[process.argv.indexOf('--fichier') + 1]
  : null;
const url = process.env.SUPABASE_DB_URL;

let politiques;
let fonctions;

if (fichier) {
  // Mode hors ligne : un export JSON de `pg_policies` + `pg_proc` déjà collecté.
  const contenu = JSON.parse(readFileSync(fichier, 'utf8'));
  politiques = contenu.politiques;
  fonctions = contenu.fonctions;
} else if (url) {
  const { default: postgres } = await import('postgres');
  const sql = postgres(url, { max: 1, onnotice: () => {} });
  try {
    politiques = await sql`
      select policyname as nom, permissive, cmd
      from pg_policies where schemaname = 'public' and tablename = 'eleves'
      order by policyname`;
    fonctions = await sql`
      select p.proname as nom, pg_get_function_identity_arguments(p.oid) as args
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname like 'eleves%'
      order by p.proname`;
  } finally {
    await sql.end();
  }
} else {
  console.error('── parité RLS ──');
  console.error('Aucune source : ni SUPABASE_DB_URL, ni --fichier.');
  console.error('La parité n’a donc PAS été vérifiée. Rien n’est prouvé par cette sortie.');
  console.error('  SUPABASE_DB_URL=postgres://… node scripts/verifier-parite-rls.mjs');
  process.exit(2);
}

const problemes = [];

for (const attendu of ATTENDU) {
  const trouvee = politiques.find((p) => p.nom === attendu.nom);
  if (!trouvee) {
    problemes.push(`politique manquante en base : ${attendu.nom} (${attendu.permissive} ${attendu.cmd})`);
    continue;
  }
  if (trouvee.permissive !== attendu.permissive) {
    problemes.push(`${attendu.nom} : ${trouvee.permissive} en base, ${attendu.permissive} attendue`);
  }
  if (trouvee.cmd !== attendu.cmd) {
    problemes.push(`${attendu.nom} : commande ${trouvee.cmd} en base, ${attendu.cmd} attendue`);
  }
}

for (const f of FONCTIONS_ATTENDUES) {
  if (!fonctions.some((x) => x.nom === f.nom)) {
    problemes.push(`fonction manquante en base : ${f.nom}(${f.args})`);
  }
}

// Drift inverse : une politique présente en base mais absente du dépôt est un changement
// non versionné — il disparaîtra au prochain rétablissement.
const nomsAttendus = new Set(ATTENDU.map((p) => p.nom));
for (const p of politiques) {
  if (!nomsAttendus.has(p.nom)) {
    problemes.push(`politique en base absente du dépôt (non versionnée) : ${p.nom}`);
  }
}

console.log('── parité RLS code ↔ base ──');
console.log(`politiques en base  : ${politiques.length}`);
console.log(`politiques attendues: ${ATTENDU.length}`);
console.log(`fonctions en base   : ${fonctions.length}`);
console.log(`problèmes           : ${problemes.length}`);
for (const p of problemes) console.log(`  ✗ ${p}`);

if (problemes.length) {
  console.log('RÉSULTAT : ÉCHEC — la base a divergé du dépôt.');
  process.exit(1);
}
console.log('RÉSULTAT : OK — la base correspond exactement à ce que le dépôt déclare.');
