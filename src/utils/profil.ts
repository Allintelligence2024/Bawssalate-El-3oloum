// Profil de compétences C1–C8, bâti sur le travail réel de l'entraîneur (§11 resté sans
// consommateur jusqu'ici : `bridge.ts` était complet et testé, mais aucun écran ne l'appelait).
//
// Ce module relie les auto-évaluations 0/1/2 enregistrées par sujet (`maitriseSujets`) aux
// quatre briques de `bridge`. Il est **déterministe** : aucun `Date.now()`, l'horodatage de
// chaque événement est dérivé de `sujetId:clé`. Un même état donne donc toujours le même
// profil, ce qui rend le calcul testable et le tri stable.
import { SUJETS_OFFICIELS } from '../data/sujetsOfficiels';
import type { NiveauMaitrise } from './entrainement';
import { construireGrille, cleConsigne } from './entrainement';
import { competencesTriees, niveauxVierges, writeBack, raisons, type Niveaux } from './bridge';
import type { Competence } from './bridgeAdapter';

/** Évaluations enregistrées : sujet → clé de consigne → niveau 0/1/2. */
export type EvaluationsParSujet = Record<string, Record<string, NiveauMaitrise>>;

/**
 * Reconstruit les niveaux de compétence à partir de tout le travail enregistré.
 * Les sujets sont parcourus dans l'ordre du programme et les consignes dans l'ordre du
 * sujet : deux appels sur le même état donnent le même `Niveaux`, au bit près.
 */
export function profilCompetences(evaluations: EvaluationsParSujet): Niveaux {
  let niveaux = niveauxVierges();
  for (const sujet of SUJETS_OFFICIELS) {
    const parConsigne = evaluations[sujet.id];
    if (!parConsigne) continue;
    for (const consigne of construireGrille(sujet).consignes) {
      const cle = cleConsigne(consigne);
      const score = parConsigne[cle];
      // Une clé qui ne correspond plus à aucune consigne (sujet réédité) est ignorée :
      // elle ne doit ni lever, ni polluer une compétence au hasard.
      if (score === 0 || score === 1 || score === 2) {
        niveaux = writeBack(niveaux, { verbe: consigne.verbe, score, le: `${sujet.id}:${cle}` });
      }
    }
  }
  return niveaux;
}

export interface Faiblesse {
  competence: Competence;
  preuves: number;
  /** Explications en arabe, à afficher telles quelles (jamais un pourcentage nu) */
  raisons: string[];
}

/**
 * Les compétences à travailler, **mesurées uniquement**, les plus faibles d'abord.
 * Une compétence sans aucune preuve est exclue : proposer « travaille ce que tu n'as
 * jamais fait » n'aide pas, et c'est exactement le défaut corrigé en Phase 11.
 */
export function faiblessesMesurees(evaluations: EvaluationsParSujet, plafond = 3): Faiblesse[] {
  const niveaux = profilCompetences(evaluations);
  return competencesTriees(niveaux)
    .filter((c) => c.preuves > 0)
    .slice(0, plafond)
    .map((c) => ({ competence: c.competence, preuves: c.preuves, raisons: raisons(niveaux[c.competence]) }));
}

/** Nombre de consignes évaluées, tous sujets confondus — sert à motiver l'affichage. */
export function nombreEvaluations(evaluations: EvaluationsParSujet): number {
  return Object.values(evaluations).reduce((n, parConsigne) => n + Object.keys(parConsigne).length, 0);
}

/** Libellé arabe court de chaque compétence, pour l'écran (pas d'identifiant technique). */
export const LIBELLE_COMPETENCE: Record<Competence, string> = {
  C1_exploiter_document: 'استغلال وثيقة',
  C2_analyser_courbe: 'تحليل منحنى',
  C3_mettre_en_relation: 'ربط النتيجة بالدرس',
  C4_argumenter: 'تعليل ومناقشة',
  C5_conclure: 'استخلاص واستنتاج',
  C6_schematiser: 'مخطّط ورسم وظيفي',
  C7_rediger_scientifique: 'نصّ علمي منظّم',
  C8_proposer: 'اقتراح فرضية أو نصيحة',
};
