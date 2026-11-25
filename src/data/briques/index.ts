// Catalogue paresseux des jeux de briques.
//
// Budget : le préacheminement (`vite.config.ts`) compte tous les chunks, pas seulement ceux du
// démarrage. Chaque unité (et chaque sujet Bac) est donc à la fois chargée **à la demande** (import
// dynamique : hors du chunk de démarrage) et **exclue du préacheminement** (règle HORS_PRECACHE) :
// un élève qui n'ouvre pas l'atelier ne paie pas ses briques, et l'atelier reste utilisable hors
// ligne après un premier chargement (cache à la volée du worker).

import type { JeuBriques } from './types';

export type { JeuBriques };

// Chaque unité expose son tableau sous un nom explicite (`JEUX_UNITE1`…) : le chargeur
// normalise, pour que `UNITES_AVEC_BRIQUES` et `chargerJeuxUnite` ne dépendent pas du nom.
const CHARGEURS_UNITES: Record<string, () => Promise<JeuBriques[]>> = {
  u1: () => import('./u1').then((m) => m.JEUX_UNITE1),
  u3: () => import('./u3').then((m) => m.JEUX_UNITE3),
  u4: () => import('./u4').then((m) => m.JEUX_UNITE4),
};

const CHARGEURS_SUJETS: Record<string, () => Promise<JeuBriques[]>> = {
  '2025-1': () => import('./sujet-2025-1').then((m) => m.JEUX_SUJET_2025_1),
};

const cache = new Map<string, JeuBriques[]>();

/** Jeux d'une unité (vide si l'unité n'a pas encore de contenu relu). */
export async function chargerJeuxUnite(uniteId: string): Promise<JeuBriques[]> {
  const cle = `unite:${uniteId}`;
  const enCache = cache.get(cle);
  if (enCache) return enCache;
  const chargeur = CHARGEURS_UNITES[uniteId];
  if (!chargeur) return [];
  const jeux = await chargeur();
  cache.set(cle, jeux);
  return jeux;
}

/** Jeux d'un sujet Bac (vide si le sujet n'a pas encore son gabarit pilote). */
export async function chargerJeuxSujet(sujetId: string): Promise<JeuBriques[]> {
  const cle = `sujet:${sujetId}`;
  const enCache = cache.get(cle);
  if (enCache) return enCache;
  const chargeur = CHARGEURS_SUJETS[sujetId];
  if (!chargeur) return [];
  const jeux = await chargeur();
  cache.set(cle, jeux);
  return jeux;
}

/** Unités qui disposent d'au moins un jeu (pour afficher « تدريب بالبنى » sans mentir). */
export const UNITES_AVEC_BRIQUES = Object.keys(CHARGEURS_UNITES);
export const SUJETS_AVEC_BRIQUES = Object.keys(CHARGEURS_SUJETS);

/**
 * Jeu correspondant à une consigne de sujet. Deux conventions acceptées :
 * `jb:<sujet>:<exercice>:<consigne>` (gabarit pilote) et `jb:<sujet>:<exercice>:<partie>:<consigne>`.
 */
export function jeuPourConsigne(
  jeux: JeuBriques[],
  exercice: number,
  partie: number,
  consigne: number,
): JeuBriques | undefined {
  return jeux.find(
    (j) => j.id.endsWith(`:${exercice}:${partie}:${consigne}`) || j.id.endsWith(`:${exercice}:${consigne}`),
  );
}
