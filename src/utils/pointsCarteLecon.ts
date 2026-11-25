// Les trois points de « بطاقة الدرس », dérivés de la fiche dorée — module **lourd** à part.
//
// `data/lessonGoldSummaries` pèse ~120 Kio : l'importer depuis `utils/microNoeuds` (utilisé par
// l'écran d'accueil) ferait entrer toute la base de fiches dans la coquille hors-ligne. Ce module
// est donc réservé aux écrans paresseux (la carte, le tiroir) et chargé à la demande côté App.

import { getLessonGoldSummary } from '../data/lessonGoldSummaries';

/**
 * Les trois points de la carte :
 *   1. le problème que la leçon résout ;
 *   2. la conclusion de la chaîne causale ;
 *   3. le piège classique du Bac.
 */
export function pointsCarteLecon(lessonId: string): [string, string, string] {
  const lecon = getLessonGoldSummary(lessonId);
  if (!lecon) {
    return ['درس بلا ملخّص ذهبي', '—', '—'];
  }
  const conclusion = lecon.mechanismAr[lecon.mechanismAr.length - 1] ?? lecon.evidenceAr;
  return [`السؤال: ${lecon.missionAr}`, `الخلاصة: ${conclusion}`, `الفخّ: ${lecon.commonErrorAr}`];
}
