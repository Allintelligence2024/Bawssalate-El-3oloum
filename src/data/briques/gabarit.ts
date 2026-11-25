// Gabarit d'un jeu de briques (Phase 4).
//
// Un jeu de briques ne s'écrit pas à la main : il se **découpe** dans un texte déjà présent
// dans le dépôt. Ce module impose les trois règles du dépôt :
//
//   1. **Rien n'est inventé** : les briques viennent d'une situation de synthèse
//      (`syntheses.ts`, elle-même écrite depuis les résumés dorés) et les pièges de
//      `piegesAr` de l'unité. `jeuDepuisSituation()` ne reçoit donc aucun texte scientifique,
//      seulement des choix éditoriaux (identifiant, verbe, attendu).
//   2. **Statut par défaut `a_valider_enseignant`** : un jeu non relu n'est pas jouable
//      (`jeuxJouables`) et n'est visible que par la porte d'aperçu.
//   3. **Numérotation stable** : `b:<jeuId>:<n>` dans l'ordre du tableau, pour que
//      l'analytique locale et les tests restent stables quand un jeu évolue.
//
// `jeuBriques()` reste disponible pour un gabarit Bac (`sujet-2025-1.ts`) où les briques
// sortent d'un corrigé officiel plutôt que d'une synthèse.

import type { SituationSynthese } from '../syntheses';
import { brique, type BriqueRole, type JeuBriques, type StatutEditorial } from './types';
import type { VerbeConsigne } from '../sujetsOfficiels';

export interface BriqueSource {
  role: BriqueRole;
  texte: string;
  /** Provenance lisible par un relecteur : `syntheses · u3 · modele[2]`. */
  source: string;
  statut?: StatutEditorial;
}

export interface ConfigJeu {
  id: string;
  document: string;
  question: string;
  verbe: VerbeConsigne;
  attendu: string;
  structure: BriqueRole[];
  briques: BriqueSource[];
  uniteId?: string;
  statut?: StatutEditorial;
}

/** Construit un jeu : numérote les briques et applique le statut éditorial par défaut. */
export function jeuBriques(config: ConfigJeu): JeuBriques {
  if (config.briques.length === 0) {
    throw new Error(`Jeu ${config.id} sans brique : un jeu vide n'est jamais servi.`);
  }
  const statut = config.statut ?? 'a_valider_enseignant';
  return {
    id: config.id,
    document: config.document,
    question: config.question,
    verbe: config.verbe,
    attendu: config.attendu,
    structure: [...config.structure],
    ...(config.uniteId ? { uniteId: config.uniteId } : {}),
    statut,
    briques: config.briques.map((b, i) =>
      brique(config.id, i + 1, b.role, b.texte, b.source, b.statut ?? statut),
    ),
  };
}

/**
 * Rôles académiques d'un modèle de réponse, dans l'ordre canonique.
 *
 * Convention (documentée, donc discutable en relecture) : sur un modèle de `n` éléments, le
 * **dernier** est la `خلاصة` de la synthèse → `conclusion` ; la première moitié des autres
 * décrit ce qu'on lit dans le document → `observation` ; la seconde moitié explique → 
 * `interpretation`. Pour `n = 5` : observation, observation, interpretation, interpretation,
 * conclusion.
 */
export function rolesDepuisModele(n: number): BriqueRole[] {
  if (n <= 0) return [];
  const corps = n - 1;
  const moitie = Math.ceil(corps / 2);
  return [
    ...Array.from({ length: corps }, (_, i) => (i < moitie ? 'observation' : 'interpretation') as BriqueRole),
    'conclusion',
  ];
}

/**
 * Découpe une situation de synthèse en jeu de briques.
 *
 * `document` = le `sujet` de la situation, `question` = sa `question`, briques = son `modele`
 * (verbatim, dans l'ordre), pièges = ses `pieges` (verbatim eux aussi). Aucun texte nouveau.
 */
export function jeuDepuisSituation(
  situation: SituationSynthese,
  options: {
    id: string;
    verbe: VerbeConsigne;
    attendu: string;
    statut?: StatutEditorial;
    /**
     * Rôle de chaque élément de `modele`, dans l'ordre. Pour un `قارن`, la position de la
     * comparaison est un choix éditorial explicite (aucune heuristique ne peut la deviner) :
     * elle doit être donnée ici, sinon le jeu ne demande aucune comparaison.
     */
    roles?: BriqueRole[];
  },
): JeuBriques {
  if (options.roles && options.roles.length !== situation.modele.length) {
    throw new Error(
      `Jeu ${options.id} : ${options.roles.length} rôles pour ${situation.modele.length} éléments de modèle.`,
    );
  }
  const roles = options.roles ?? rolesDepuisModele(situation.modele.length);
  const briques: BriqueSource[] = situation.modele.map((texte, i) => ({
    role: roles[i],
    texte,
    source: `syntheses · ${situation.id} · modele[${i}]`,
  }));
  for (const piege of situation.pieges) {
    briques.push({ role: 'piege', texte: piege, source: `programme · ${situation.uniteId} · piegesAr` });
  }
  // La structure est exactement l'ensemble des rôles réellement produits (dans l'ordre
  // canonique). Aucun rôle fantôme : une structure qui annonce un rôle absent des briques
  // réclame au correcteur un critère que l'élève ne peut pas poser. Quand le verbe est `قارن`
  // et que le découpage ne produit aucune comparaison, c'est le découpage qu'on corrige
  // (option `roles`), pas la structure qu'on invente.
  const produits = new Set<BriqueRole>(roles);
  const structure = (['observation', 'comparaison', 'interpretation', 'conclusion'] as BriqueRole[]).filter(
    (role) => produits.has(role),
  );
  return jeuBriques({
    id: options.id,
    document: situation.sujet,
    question: situation.question,
    verbe: options.verbe,
    attendu: options.attendu,
    structure,
    uniteId: situation.uniteId,
    ...(options.statut ? { statut: options.statut } : {}),
    briques,
  });
}
