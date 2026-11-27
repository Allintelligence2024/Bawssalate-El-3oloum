// Chargeur à la demande + cache module pour `src/data/schemasSvt.ts`.
//
// Pourquoi ce module existe :
//  1. Garde `schemasSvt-*.js` hors du bundle de démarrage (coquille ≤ 2,25 Mio).
//  2. Permet un préchauffage discret dès l'entrée dans `LecteurLecon` ou `ProtocoleRunner`,
//     puis un accès synchrone sur toutes les leçons suivantes (zéro clignotement `null`).
//  3. En cas d'échec réseau hors ligne, la promesse rejetée n'est PAS mise en cache afin
//     qu'une tentative ultérieure après reconnexion puisse réussir.

import type { IllustrationLecon } from '../data/illustrationsTypes';

export type ImporteurSchemasSvt = () => Promise<{ SCHEMAS_SVT: IllustrationLecon[] }>;

const importParDefaut: ImporteurSchemasSvt = () => import('../data/schemasSvt');

let importeur: ImporteurSchemasSvt = importParDefaut;
let cache: IllustrationLecon[] | null = null;
let promesseEnCours: Promise<IllustrationLecon[]> | null = null;

/** Lecture synchrone du cache module (`null` tant que le chunk n'a pas été chargé). */
export function lireSchemasSvtCache(): IllustrationLecon[] | null {
  return cache;
}

/** Charge le chunk `schemasSvt` une seule fois (déduplique les appels concurrents). */
export function chargerSchemasSvt(): Promise<IllustrationLecon[]> {
  if (cache !== null) return Promise.resolve(cache);
  if (promesseEnCours) return promesseEnCours;
  const p = importeur()
    .then((mod) => {
      cache = mod.SCHEMAS_SVT;
      promesseEnCours = null;
      return cache;
    })
    .catch((erreur) => {
      promesseEnCours = null;
      throw erreur;
    });
  promesseEnCours = p;
  return p;
}

/**
 * Préchauffage discret au montage d'un écran de leçon (`LecteurLecon` / `ProtocoleRunner`).
 * Ne rejette jamais : l'état d'erreur éventuel est géré par `IllustrationsLecon`.
 */
export function prechaufferSchemasSvt(): void {
  void chargerSchemasSvt().catch(() => {});
}

/** Réservé aux tests unitaires : remet le cache à zéro et permet d'injecter un importeur. */
export function reinitialiserChargeurSchemasSvtPourTests(fn?: ImporteurSchemasSvt): void {
  cache = null;
  promesseEnCours = null;
  importeur = fn ?? importParDefaut;
}
