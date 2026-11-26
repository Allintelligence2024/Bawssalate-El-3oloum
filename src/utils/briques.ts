// Constructeur de réponse par briques — vérification de **structure**, jamais de texte.
//
// L'élève assemble sa réponse en cliquant des blocs académiques courts. L'application ne
// compare aucun texte libre : elle vérifie deux choses seulement, celles que le correcteur
// regarde d'abord — les **rôles** présents et leur **ordre**. Un piège choisi n'enlève pas de
// point : il déclenche un diagnostic nommé, puis l'élève réessaie.
//
// Ce module est pur (aucun import React, aucune date implicite) : l'horodatage vient de
// l'appelant, ce qui rend les tests reproductibles.

import type { BriqueReponse, BriqueRole, JeuBriques } from '../data/briques/types';
import type { VerbeConsigne } from '../data/sujetsOfficiels';

export type { BriqueReponse, BriqueRole, JeuBriques };

/** Ordre canonique des rôles (le rôle « piège » est hors structure). */
export const ORDRE_ROLES: Exclude<BriqueRole, 'piege'>[] = [
  'observation',
  'comparaison',
  'interpretation',
  'conclusion',
];

export const LIBELLE_ROLE: Record<BriqueRole, string> = {
  observation: 'الملاحظة',
  comparaison: 'المقارنة بالشاهد',
  interpretation: 'التفسير العلمي',
  conclusion: 'الاستنتاج',
  piege: 'فخّ',
};

/** Ce qu'il faut ajouter quand un critère manque — une consigne, pas un reproche. */
export const REMEDE_ROLE: Record<Exclude<BriqueRole, 'piege'>, string> = {
  observation: 'ابدأ بما تُظهره الوثيقة: قيمة أو تغيّر، بلا تفسير بعد.',
  comparaison: 'قارن بالشاهد: نفس المعيار، ثم الفرق.',
  interpretation: 'اربط الملاحظة بآلية من الدرس: «لأنّ…».',
  conclusion: 'اجزم بما يثبته الدليل: «نستنتج أنّ…».',
};

export interface EvaluationBriques {
  /** Toutes les briques exigées sont présentes (une par critère, pas une par rôle). */
  complete: boolean;
  rolesChoisis: BriqueRole[];
  /** Rôles exigés dont il manque au moins une brique (liste de rôles, pas de briques). */
  manquants: Exclude<BriqueRole, 'piege'>[];
  /** Vrai si un rôle arrive après un rôle qui devait le suivre. */
  horsOrdre: boolean;
  /** Briques « piège » retenues par l'élève (diagnostic à afficher, pas de sanction). */
  pieges: BriqueReponse[];
  /** Briques exigées et non retenues (une entrée par brique, source d'affichage). */
  briquesManquantes: BriqueReponse[];
  /** Nombre de briques exigées qui manquent — 0 s'il n'en manque aucune. */
  criteresManquants: number;
  /** Premier critère manquant, nommé — `null` si l'assemblage est complet. */
  critereNomme: string | null;
  /** Nombre de briques exigées satisfaites sur le total exigé (base de l'Avant/Après). */
  score: number;
  total: number;
  /** Message court, en arabe, prêt à afficher. */
  message: string;
}

/** Rôles exigés par un jeu (le piège est facultatif et hors structure). */
export function rolesExiges(jeu: JeuBriques): Exclude<BriqueRole, 'piege'>[] {
  return jeu.structure.filter((r): r is Exclude<BriqueRole, 'piege'> => r !== 'piege');
}

/**
 * Critères exigés, **brique par brique**.
 *
 * Un rôle n'est pas un critère : `rolesDepuisModele(5)` produit deux `observation` et deux
 * `interpretation` (et les jeux de `u1.ts` portent un `comparaison` de plus). Compter les rôles
 * distincts laissait donc l'app déclarer « البنية كاملة » alors qu'il manquait la moitié de la
 * réponse — faux positif mesuré sur 10 des 16 jeux (16 réponses fausses acceptées sur 32
 * combinaisons possibles). Un critère = une brique exigée.
 *
 * Seuls les rôles de `structure` sont exigés : un rôle présent dans les briques mais absent de
 * la structure (par exemple `comparaison` dans un modèle qui n'en a pas) n'est jamais réclamé.
 */
export function briquesExigees(jeu: JeuBriques): BriqueReponse[] {
  const exigés = rolesExiges(jeu);
  return jeu.briques.filter(
    (b) => b.role !== 'piege' && exigés.includes(b.role as Exclude<BriqueRole, 'piege'>),
  );
}

/** Ajoute ou retire une brique de l'assemblage (bascule, ordre d'ajout conservé). */
export function basculerBrique(choisis: string[], briqueId: string): string[] {
  return choisis.includes(briqueId) ? choisis.filter((id) => id !== briqueId) : [...choisis, briqueId];
}

/** Les briques de l'assemblage, dans l'ordre où l'élève les a posées. */
export function briquesChoisies(jeu: JeuBriques, ids: string[]): BriqueReponse[] {
  return ids
    .map((id) => jeu.briques.find((b) => b.id === id))
    .filter((b): b is BriqueReponse => Boolean(b));
}

export function evaluerAssemblage(jeu: JeuBriques, ids: string[]): EvaluationBriques {
  const briques = briquesChoisies(jeu, ids);
  const exigés = rolesExiges(jeu);
  const attendues = briquesExigees(jeu);
  const choisies = briques.filter((b) => b.role !== 'piege');
  const rolesChoisis = choisies.map((b) => b.role as Exclude<BriqueRole, 'piege'>);
  const pieges = briques.filter((b) => b.role === 'piege');

  // Un critère = une brique exigée présente. Deux observations exigées, une seule posée : il
  // manque un critère (cf. `briquesExigees`).
  const briquesManquantes = attendues.filter((b) => !choisies.some((c) => c.id === b.id));
  const manquants = exigés.filter((role) => briquesManquantes.some((b) => b.role === role));

  // Ordre : la suite des rôles retenus doit respecter l'index de la structure.
  const indices = rolesChoisis.map((role) => exigés.indexOf(role));
  const horsOrdre = indices.some((valeur, i) => i > 0 && valeur < indices[i - 1]);

  const score = attendues.length - briquesManquantes.length;
  const complete = briquesManquantes.length === 0 && !horsOrdre;

  let message: string;
  let critereNomme: string | null = null;
  if (complete) {
    // Le libellé des rôles est généré depuis la structure : un jeu à 3 rôles ne doit pas
    // annoncer une comparaison qu'il ne demande pas.
    const libelles = exigés.map((role) => LIBELLE_ROLE[role]).join('، ');
    message = `البنية كاملة: ${libelles}. هذه هي إجابة المصحّح.`;
  } else if (briquesManquantes.length > 0) {
    const premier = manquants[0];
    critereNomme = LIBELLE_ROLE[premier];
    const reste = briquesManquantes.filter((b) => b.role === premier).length;
    message =
      reste > 1
        ? `ناقص: ${LIBELLE_ROLE[premier]} (${reste} عناصر) — ${REMEDE_ROLE[premier]}`
        : `ناقص: ${LIBELLE_ROLE[premier]} — ${REMEDE_ROLE[premier]}`;
  } else {
    critereNomme = 'الترتيب';
    // L'ordre attendu est celui de la structure du jeu, pas un ordre générique : les jeux à
    // trois rôles ne doivent pas réclamer une comparaison qu'ils n'exigent pas.
    const ordre = exigés.map((role) => LIBELLE_ROLE[role]).join(' ← ');
    message = `العناصر كلها موجودة، لكن الترتيب مقلوب. الترتيب الذي يريده المصحّح: ${ordre}.`;
  }

  if (pieges.length > 0 && !complete) {
    message += ` · الفخّ الذي اخترته: ${pieges[0].texte}`;
  }

  return {
    complete,
    rolesChoisis,
    manquants,
    horsOrdre,
    pieges,
    briquesManquantes,
    criteresManquants: briquesManquantes.length,
    critereNomme,
    score,
    total: attendues.length,
    message,
  };
}

/** Diagnostic détaillé d'un piège (aucune révélation de la bonne réponse). */
export function diagnosticPiege(brique: BriqueReponse): string {
  return `هذه العبارة فخّ شائع في البكالوريا («${brique.texte}»). ما يثبتها الدليل؟ إن لم تجد، فهي ليست في جوابك.`;
}

/** Progression Avant / Après, en critères satisfaits (jamais en points, jamais en /20). */
export function avantApres(avant: number, apres: number): { avant: number; apres: number; gain: number } {
  return { avant, apres, gain: Math.max(0, apres - avant) };
}

/** Un jeu n'est jouable que s'il est explicitement actif (traçabilité éditoriale). */
export function jeuActif(jeu: JeuBriques | undefined): jeu is JeuBriques {
  return Boolean(jeu && jeu.statut === 'actif');
}

/**
 * Jeux réellement servis par l'écran 1-2-3.
 *
 * Règle éditoriale du dépôt (cf. `data/briques/types.ts`) : un jeu `a_valider_enseignant`
 * n'est pas jouable, parce qu'il n'a pas encore été relu. Sans aperçu, l'écran ne reçoit donc
 * que les jeux `actif`. Avec un aperçu **explicite** demandé par l'élève ou l'enseignant
 * (`apercu = true`), il reçoit aussi les autres — l'écran doit alors afficher la mention
 * « قيد المراجعة », jamais laisser croire à un corrigé validé.
 *
 * Corollaire vérifié par test : si le catalogue ne contient aucun jeu actif, la fonction rend
 * une liste vide sans aperçu (l'écran affiche alors la porte d'aperçu, pas des exercices).
 */
export function jeuxJouables(jeux: readonly JeuBriques[], apercu = false): JeuBriques[] {
  const actifs = jeux.filter((jeu) => jeuActif(jeu));
  if (actifs.length > 0) return actifs;
  return apercu ? [...jeux] : [];
}

/** Vrai si du contenu existe mais qu'aucun jeu n'est validé : l'écran doit demander un aperçu. */
export function apercuRequis(jeux: readonly JeuBriques[]): boolean {
  return jeux.length > 0 && !jeux.some((jeu) => jeuActif(jeu));
}

/** Attendu affiché en tête de l'étape 1 — repli sûr si le jeu n'en porte pas. */
export function attenduDuJeu(jeu: JeuBriques, verbe: VerbeConsigne): string {
  return jeu.attendu || `ما ينتظره المصحّح من الفعل «${verbe}».`;
}
