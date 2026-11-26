// Types et prédicats purs des illustrations : **aucune donnée lourde**.
//
// Pourquoi ce fichier existe : le registre complet (`illustrationsLecons.ts`) agrège les
// 16 schémas créés, dont les libellés arabes pèsent ~30 Ko non compressés. L'écran de leçon
// n'a besoin que des types et de deux prédicats au premier rendu ; il charge désormais les
// schémas par `import()` (voir `IllustrationsLecon.tsx`), ce qui sort ces données du bundle de
// démarrage et rend la coquille hors-ligne indépendante du nombre de schémas à venir.
//
// Les tests, les scripts d'audit et les métriques continuent d'importer le registre complet :
// ici on ne trouve que le contrat.

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

/** Type effectif d'une entrée : les 21 WebP du manuel n'ont pas de champ `typeVisuel`. */
export function typeVisuelDe(illustration: IllustrationLecon): TypeVisuel {
  return illustration.typeVisuel ?? 'webp_legacy';
}

/** Vrai si le visuel est une image muette portant des pastilles posées par l'application. */
export function aDesAnnotations(illustration: IllustrationLecon): boolean {
  return (illustration.annotations?.length ?? 0) > 0;
}
