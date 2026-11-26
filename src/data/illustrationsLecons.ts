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

import { ILLUSTRATIONS_LECONS_LEGACY } from './illustrationsLegacy.gen';
import { SCHEMAS_SVT } from './schemasSvt';

/** Pastille numérotée posée sur une image muette. */
export interface AnnotationSchema {
  /** Numéro affiché sur la pastille (1, 2, 3…) */
  num: number;
  /** Coordonnée horizontale en pourcentage (0..100, depuis la gauche de l'image) */
  x: number;
  /** Coordonnée verticale en pourcentage (0..100, depuis le haut de l'image) */
  y: number;
  /** Terme scientifique officiel 3AS Algérie (arabe) */
  labelAr: string;
  /** Courte précision pédagogique facultative (≤ 90 car.) */
  detailAr?: string;
}

/** Nature du visuel — décide de la façon dont l'écran l'annonce. */
export type TypeVisuel = 'webp_annote' | 'svg_vectoriel' | 'webp_legacy';

export interface IllustrationLecon {
  id: string;
  lessonId: string;
  uniteId: string;
  docNum?: string;
  /** Absent = entrée historique du manuel (équivaut à `webp_legacy`). */
  typeVisuel?: TypeVisuel;
  fichier: string;          // nom .webp ou .svg dans public/lecons/img/
  largeur: number;
  hauteur: number;
  titreAr: string;
  altAr: string;
  legendeAr?: string;       // légende HTML nette en arabe (RTL)
  /** Pastilles numérotées superposées sur l'image muette + liste de légende arabe RTL dessous */
  annotations?: AnnotationSchema[];
  statut: 'a_valider_enseignant' | 'actif';
  reviewed: boolean;
}

/**
 * Les 21 WebP du manuel viennent en premier : l'ordre historique du lecteur est conservé,
 * les schémas créés s'ajoutent à la suite de chaque leçon.
 */
export const ILLUSTRATIONS_LECONS: IllustrationLecon[] = [
  ...ILLUSTRATIONS_LECONS_LEGACY,
  ...SCHEMAS_SVT,
];

/** Type effectif d'une entrée : les 21 WebP générées n'ont pas de champ `typeVisuel`. */
export function typeVisuelDe(illustration: IllustrationLecon): TypeVisuel {
  return illustration.typeVisuel ?? 'webp_legacy';
}

/** Vrai si le visuel est une image muette portant des pastilles posées par l'application. */
export function aDesAnnotations(illustration: IllustrationLecon): boolean {
  return (illustration.annotations?.length ?? 0) > 0;
}

export function illustrationsParLecon(lessonId: string): IllustrationLecon[] {
  return ILLUSTRATIONS_LECONS.filter((i) => i.lessonId === lessonId)
    .sort((a, b) => (a.docNum ?? '').localeCompare(b.docNum ?? '') || a.fichier.localeCompare(b.fichier));
}

export function illustrationsParUnite(uniteId: string): IllustrationLecon[] {
  return ILLUSTRATIONS_LECONS.filter((i) => i.uniteId === uniteId)
    .sort((a, b) => a.lessonId.localeCompare(b.lessonId) || a.fichier.localeCompare(b.fichier));
}
