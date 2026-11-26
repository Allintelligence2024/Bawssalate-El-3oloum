// Registre typé des illustrations et schémas de leçons — source unique pour le lecteur.
//
// Deux familles cohabitent, et elles ne se mélangent jamais :
//
//  - `illustrationsLegacy.gen.ts` — les 21 WebP `OK` importés du manuel (u6, u7, u8, u9, u11).
//    Fichier GÉNÉRÉ par `scripts/importer-images-lecons.mjs` : on ne l'édite pas à la main.
//  - `schemasSvt.ts` — les schémas créés pour couvrir le programme (Domaines 1 à 3), écrits
//    sous la règle d'or « ZÉRO TEXTE IA » : le visuel ne porte jamais de texte généré par un
//    modèle d'image. Les repères numérotés, les légendes, les titres, les formules et les
//    unités sont rendus par l'application à partir des données ci-dessous.
//
// Ce module est le point d'entrée public : les écrans, les tests et les scripts d'audit
// importent `ILLUSTRATIONS_LECONS` et les helpers, jamais les fichiers internes.

import type { IllustrationLecon } from './illustrationsTypes';
import { ILLUSTRATIONS_LECONS_LEGACY } from './illustrationsLegacy.gen';
import { SCHEMAS_SVT } from './schemasSvt';

export type { AnnotationSchema, TypeVisuel, IllustrationLecon } from './illustrationsTypes';
export { aDesAnnotations, typeVisuelDe } from './illustrationsTypes';

/**
 * Les 21 WebP du manuel viennent en premier : l'ordre historique du lecteur est conservé,
 * les schémas créés s'ajoutent à la suite de chaque leçon.
 */
export const ILLUSTRATIONS_LECONS: IllustrationLecon[] = [
  ...ILLUSTRATIONS_LECONS_LEGACY,
  ...SCHEMAS_SVT,
];

export function illustrationsParLecon(lessonId: string): IllustrationLecon[] {
  return ILLUSTRATIONS_LECONS.filter((i) => i.lessonId === lessonId)
    .sort((a, b) => (a.docNum ?? '').localeCompare(b.docNum ?? '') || a.fichier.localeCompare(b.fichier));
}

export function illustrationsParUnite(uniteId: string): IllustrationLecon[] {
  return ILLUSTRATIONS_LECONS.filter((i) => i.uniteId === uniteId)
    .sort((a, b) => a.lessonId.localeCompare(b.lessonId) || a.fichier.localeCompare(b.fichier));
}
