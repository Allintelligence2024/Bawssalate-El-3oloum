// Catalogue paresseux des jeux de briques.
//
// Budget : le préacheminement (`vite.config.ts`) compte tous les chunks, pas seulement ceux du
// démarrage. Chaque unité (et chaque sujet Bac) est donc à la fois chargée **à la demande** (import
// dynamique : hors du chunk de démarrage) et **exclue du préacheminement** (règle HORS_PRECACHE) :
// un élève qui n'ouvre pas l'atelier ne paie pas ses briques, et l'atelier reste utilisable hors
// ligne après un premier chargement (cache à la volée du worker).

import type { JeuBriques } from './types';

export type { JeuBriques };

// Une unité peut avoir deux origines :
//   · un fichier **écrit à la main** (u1 : quatre jeux actifs découpés dans les exercices de
//     méthodologie) — chargé par son propre chunk ;
//   · sinon, un jeu **dérivé** de sa situation de synthèse par `unites.ts` (chargé à la demande,
//     jamais au démarrage, et exclu du précache comme les autres jeux).
const CHARGEURS_UNITES: Record<string, () => Promise<JeuBriques[]>> = {
  u1: () => import('./u1').then((m) => m.JEUX_UNITE1),
};
const chargerDerives = () => import('./unites');

const CHARGEURS_SUJETS: Record<string, () => Promise<JeuBriques[]>> = {
  '2025-1': () => import('./sujet-2025-1').then((m) => m.JEUX_SUJET_2025_1),
};

const cache = new Map<string, JeuBriques[]>();

/** Jeux d'une unité (vide si l'unité n'a ni jeux écrits ni situation de synthèse). */
export async function chargerJeuxUnite(uniteId: string): Promise<JeuBriques[]> {
  const cle = `unite:${uniteId}`;
  const enCache = cache.get(cle);
  if (enCache) return enCache;
  const chargeur = CHARGEURS_UNITES[uniteId];
  let jeux: JeuBriques[];
  if (chargeur) {
    jeux = await chargeur();
  } else {
    const { jeuxSynthese } = await chargerDerives();
    jeux = jeuxSynthese(uniteId);
  }
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

/**
 * Unités qui disposent d'au moins un jeu (pour afficher « تدريب بالبنى » sans mentir).
 *
 * La liste est écrite ici plutôt qu'importée de `unites.ts` : cet import ramènerait
 * `syntheses.ts` dans le chunk de démarrage. Un test vérifie qu'elle reste égale à
 * `['u1', ...UNITES_SYNTHESE]` — la dérive est donc détectée, pas seulement évitée.
 */
export const UNITES_AVEC_BRIQUES = ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10', 'u11'];
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
