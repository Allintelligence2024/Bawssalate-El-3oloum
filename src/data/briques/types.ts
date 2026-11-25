// Types du constructeur de réponse par briques (v0.11).
//
// Règle éditoriale du dépôt : **aucun énoncé inventé**. Un jeu de briques ne crée pas de
// sujet : il découpe une réponse déjà présente dans le dépôt (corrigé officiel ou fiche dorée)
// en blocs académiques courts, plus 1 à 2 pièges classiques. Chaque jeu porte son statut :
// `a_valider_enseignant` tant qu'un enseignant ne l'a pas relu — et un jeu non relu n'est pas
// jouable (cf. `jeuActif`).

import type { VerbeConsigne } from '../sujetsOfficiels';
import type { BriqueRole, StatutEditorial } from '../../types';

export type { BriqueRole, StatutEditorial };

export interface BriqueReponse {
  /** `b:<jeuId>:<n>` — stable, utilisable comme clé d'analytique locale. */
  id: string;
  role: BriqueRole;
  /** Bloc court : ≤ 140 caractères, académique, jamais une phrase de cours entière. */
  texte: string;
  /** D'où vient la brique (leçon, corrigé, fiche dorée) — trace de relecture. */
  source: string;
  statut: StatutEditorial;
}

export interface JeuBriques {
  /** `jb:u1:e1` (exercice d'unité) ou `jb:2025-1:2` (exercice de sujet). */
  id: string;
  /** Sujet affiché au-dessus des briques, repris du dépôt. */
  document: string;
  question: string;
  verbe: VerbeConsigne;
  /** Ce qu'attend le correcteur, en une ligne. */
  attendu: string;
  /** Rôles exigés, dans l'ordre canonique. */
  structure: BriqueRole[];
  briques: BriqueReponse[];
  uniteId?: string;
  statut: StatutEditorial;
}

/** Fabrique utilitaire : garantit un id stable et le statut éditorial par défaut. */
export function brique(
  jeuId: string,
  n: number,
  role: BriqueRole,
  texte: string,
  source: string,
  statut: StatutEditorial = 'a_valider_enseignant',
): BriqueReponse {
  return { id: `b:${jeuId}:${n}`, role, texte, source, statut };
}
