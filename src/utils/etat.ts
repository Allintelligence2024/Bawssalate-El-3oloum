import { etatVierge, type Etat } from '../types';

/** Version courante du modèle d'état (v3 : cartes de leçons, briques, dérogations, trophées). */
export const VERSION_ETAT = 3;

/**
 * Migration douce et **idempotente** de l'état.
 *
 * Règles (plan directeur §2.5) :
 *   1. un état v1/v2 est **complété** avec les défauts, jamais réinitialisé : l'élève qui
 *      revient après la mise à jour retrouve sa progression intacte ;
 *   2. rejouer la migration sur un état déjà migré ne change rien (mêmes objets logiques) ;
 *   3. une version **future** n'est pas devinée : on lève, et l'appelant conserve l'état brut
 *      (comportement déjà en place pour les sauvegardes, cf. `storage.ts`).
 */
export function migrerEtat(brut: Partial<Etat> & { version?: number }): Etat {
  const version = typeof brut.version === 'number' ? brut.version : 2;
  if (version > VERSION_ETAT) {
    throw new Error(`État d'une version future (${version}) : lecture refusée plutôt que devinée.`);
  }
  const base = etatDepuisBrut(brut);
  return { ...base, version: VERSION_ETAT };
}

/** Normalisation commune au stockage local et à une sauvegarde déjà validée. */
export function etatDepuisBrut(analyse: Partial<Etat>): Etat {
  return {
    ...etatVierge(),
    ...analyse,
    progression: { ...analyse.progression },
    jalons: { ...analyse.jalons },
    notes: analyse.notes ?? [],
    carnet: analyse.carnet ?? [],
    journal: [...new Set(analyse.journal ?? [])],
    kafaa: analyse.kafaa ?? {},
    drills: analyse.drills ?? {},
    ateliers: analyse.ateliers ?? {},
    // v0.11 — champs ajoutés : défauts vides, jamais `undefined` pour les lecteurs qui itèrent.
    cartesLecons: analyse.cartesLecons ?? {},
    briques: analyse.briques ?? {},
    derogationsSujets: analyse.derogationsSujets ?? {},
    trophees: analyse.trophees ?? {},
    defis60: analyse.defis60 ?? [],
    sprints3Min: analyse.sprints3Min ?? [],
    ...(analyse.plan30Jours ? { plan30Jours: analyse.plan30Jours } : {}),
    ...(analyse.rythmeBienveillant ? { rythmeBienveillant: analyse.rythmeBienveillant } : {}),
  };
}

/**
 * Attribue « بطاقة الدرس » une seule fois, quand les six nœuds sont faits.
 * Retourne l'état inchangé si la carte existe déjà ou si la leçon n'est pas terminée.
 */
export function attribuerCarteLecon(
  etat: Etat,
  lessonId: string,
  points: [string, string, string],
  le: string,
): Etat {
  if (etat.cartesLecons?.[lessonId]) return etat;
  const phases = etat.progression[lessonId]?.phases ?? [];
  if (![1, 2, 3, 4, 5, 6].every((p) => phases.includes(p))) return etat;
  return {
    ...etat,
    cartesLecons: {
      ...(etat.cartesLecons ?? {}),
      [lessonId]: { gagneeLe: le, points, version: 1 },
    },
  };
}
