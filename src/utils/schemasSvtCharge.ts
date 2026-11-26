// Chargement unique du registre des schémas (`src/data/schemasSvt.ts`).
//
// Pourquoi ce module : le registre arabe pèse ~70 Ko et vit dans un chunk séparé, hors
// coquille de démarrage. Sans cache module, chaque montage d'écran relançait l'`import()`
// et l'élève voyait la section « وثائق الدرس » apparaître en retard (retour `null`).
//
// Ici la promesse est mémorisée : le premier écran de leçon paie le téléchargement, les
// suivants ont les schémas immédiatement. En cas d'échec (hors ligne, chunk absent du
// cache) la promesse est oubliée pour permettre une nouvelle tentative au retour du réseau.

import type { IllustrationLecon } from '../data/illustrationsTypes';

let promesse: Promise<IllustrationLecon[]> | null = null;

/** Charge le registre des schémas ; une seule requête réseau par session réussie. */
export function chargerSchemasSvt(): Promise<IllustrationLecon[]> {
  if (!promesse) {
    promesse = import('../data/schemasSvt')
      .then((module) => module.SCHEMAS_SVT)
      .catch((erreur) => {
        // Ne jamais garder une promesse rejetée : la leçon suivante doit pouvoir réessayer.
        promesse = null;
        throw erreur;
      });
  }
  return promesse;
}

/** Préchauffage silencieux : appelé à l'entrée dans un écran de leçon, n'échoue jamais. */
export function prechaufferSchemasSvt(): void {
  chargerSchemasSvt().catch(() => {
    // Silence volontaire : l'écran sait déjà afficher un message si le chunk manque.
  });
}

/** Réservé aux tests : oublie la promesse mémorisée. */
export function oublierSchemasSvt(): void {
  promesse = null;
}
