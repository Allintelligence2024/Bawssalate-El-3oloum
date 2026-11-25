// Boucle d'amélioration guidée : après une première tentative incomplète, l'application nomme
// le critère manquant, renvoie l'élève au bon onglet du tiroir, puis montre le progrès
// **Avant / Après** — en critères satisfaits, jamais en points.

import type { BriqueRole, Etat } from '../types';
import { LIBELLE_ROLE, type EvaluationBriques } from './briques';

/** Clé de persistance d'un jeu : une seule dernière tentative par jeu (pas d'historique lourd). */
export function cleTentative(jeuId: string): string {
  return jeuId;
}

export interface Progres {
  avant: number;
  apres: number;
  gain: number;
  /** Une ligne à afficher, sans félicitation excessive ni reproche. */
  phrase: string;
}

export function progres(avant: number, apres: number, total: number): Progres {
  const gain = Math.max(0, apres - avant);
  const phrase =
    gain > 0
      ? `تقدّمت: ${avant} من ${total} ← ${apres} من ${total} عنصرًا في البنية.`
      : `البنية لم تتغيّر بعد (${apres} من ${total}) — جرّب عنصرًا آخر من العناصر الناقصة.`;
  return { avant, apres, gain, phrase };
}

/** Où envoyer l'élève dans le tiroir quand un critère manque. */
export function ongletConseille(evaluation: EvaluationBriques | null): 'verificateur' | 'verbe' | 'pieges' {
  if (!evaluation) return 'verificateur';
  if (evaluation.pieges.length > 0) return 'pieges';
  // Ordre inversé ou assemblage déjà complet : c'est l'onglet des trois contrôles (témoin,
  // condition unique, preuve écrite) qui sert — pas celui des verbes.
  if (evaluation.complete || evaluation.horsOrdre) return 'verificateur';
  if (evaluation.manquants.includes('comparaison') || evaluation.manquants.includes('observation')) {
    return 'verificateur';
  }
  return 'verbe';
}

export function libelleManquant(evaluation: EvaluationBriques | null): string | null {
  if (!evaluation || evaluation.complete) return null;
  if (evaluation.manquants.length === 0) return 'الترتيب';
  return LIBELLE_ROLE[evaluation.manquants[0]];
}

/** Enregistre la tentative (dernière par jeu) et calcule l'Avant/Après avec la précédente. */
export function enregistrerTentative(
  etat: Etat,
  jeuId: string,
  evaluation: EvaluationBriques,
  le: string,
): Etat {
  const cle = cleTentative(jeuId);
  const precedente = etat.briques?.[cle];
  const avant = precedente?.apres ?? precedente?.avant;
  const entree = {
    jeuId,
    rolesChoisis: evaluation.rolesChoisis,
    manquants: evaluation.manquants as BriqueRole[],
    complete: evaluation.complete,
    le,
    ...(avant !== undefined ? { avant } : {}),
    apres: evaluation.score,
  };
  return { ...etat, briques: { ...(etat.briques ?? {}), [cle]: entree } };
}

/** Progrès affichable pour un jeu, ou `null` s'il n'y a qu'une seule tentative. */
export function progresDuJeu(etat: Etat, jeuId: string, total: number): Progres | null {
  const t = etat.briques?.[cleTentative(jeuId)];
  if (!t || t.avant === undefined) return null;
  return progres(t.avant, t.apres ?? t.avant, total);
}
