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
  /** Tous les rôles de la structure sont présents. */
  complete: boolean;
  rolesChoisis: BriqueRole[];
  /** Rôles exigés par la structure et absents de l'assemblage. */
  manquants: Exclude<BriqueRole, 'piege'>[];
  /** Vrai si un rôle arrive après un rôle qui devait le suivre. */
  horsOrdre: boolean;
  /** Briques « piège » retenues par l'élève (diagnostic à afficher, pas de sanction). */
  pieges: BriqueReponse[];
  /** Premier critère manquant, nommé — `null` si l'assemblage est complet. */
  critereNomme: string | null;
  /** Nombre de critères satisfaits sur le total exigé (base de l'Avant/Après). */
  score: number;
  total: number;
  /** Message court, en arabe, prêt à afficher. */
  message: string;
}

/** Rôles exigés par un jeu (le piège est facultatif et hors structure). */
export function rolesExiges(jeu: JeuBriques): Exclude<BriqueRole, 'piege'>[] {
  return jeu.structure.filter((r): r is Exclude<BriqueRole, 'piege'> => r !== 'piege');
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
  const rolesChoisis = briques.filter((b) => b.role !== 'piege').map((b) => b.role as Exclude<BriqueRole, 'piege'>);
  const manquants = exigés.filter((role) => !rolesChoisis.includes(role));
  const pieges = briques.filter((b) => b.role === 'piege');

  // Ordre : la suite des rôles retenus doit respecter l'index de la structure.
  const indices = rolesChoisis.map((role) => exigés.indexOf(role));
  const horsOrdre = indices.some((valeur, i) => i > 0 && valeur < indices[i - 1]);

  const score = exigés.length - manquants.length;
  const complete = manquants.length === 0 && !horsOrdre;

  let message: string;
  let critereNomme: string | null = null;
  if (complete) {
    message = 'البنية كاملة: ملاحظة، مقارنة، تفسير، استنتاج. هذه هي إجابة المصحّح.';
  } else if (manquants.length > 0) {
    const premier = manquants[0];
    critereNomme = LIBELLE_ROLE[premier];
    message = `ناقص: ${LIBELLE_ROLE[premier]} — ${REMEDE_ROLE[premier]}`;
  } else {
    critereNomme = 'الترتيب';
    message = 'العناصر كلها موجودة، لكن الترتيب مقلوب: الملاحظة قبل المقارنة، والاستنتاج في الأخير.';
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
    critereNomme,
    score,
    total: exigés.length,
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

/** Attendu affiché en tête de l'étape 1 — repli sûr si le jeu n'en porte pas. */
export function attenduDuJeu(jeu: JeuBriques, verbe: VerbeConsigne): string {
  return jeu.attendu || `ما ينتظره المصحّح من الفعل «${verbe}».`;
}
