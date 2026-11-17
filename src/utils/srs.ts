// التكرار المتباعد — خوارزمية SM-2 (Ebbinghaus → Leitner → Anki)
// الجدول: J+1 → J+3 → J+7 → J+14 → J+28
// المراجعة بعد البروتوكول: سهلة → J+3، صعبة (هشّة) → J+1

import type { ProgressionLecon } from '../types';
import { ajouterJours, aujourdhui, differenceJours } from './dates';

export type Qualite = 0 | 1 | 2 | 3 | 4 | 5;

/** سقف الفاصل في المراجعة المكثّفة (P2.3): J+1 / J+3 — لا J+7 ولا J+14 قبل الامتحان. */
export const PLAFOND_INTENSIF_JOURS = 3;

// نواة تكرار سباقات — مشتركة بين دروس وبطاقات الكفاءة (منهجية)
export interface Srs {
  repetitions: number;
  intervalle: number;
  facilite: number;
  prochaineRevision?: string;
  fragile?: boolean;
}

// نتيجة واحدة ← تحديث معاملات الدرس
/** @param plafondIntervalle سقف الفاصل بالأيام (المراجعة المكثّفة: 3 — J+1/J+3 فقط) */
export function mettreAJourSrs<T extends Srs>(p: T, qualite: Qualite, plafondIntervalle?: number): T {
  let { repetitions, intervalle, facilite } = p;

  if (qualite < 3) {
    // نسيان: إعادة الضبط إلى البداية
    repetitions = 0;
    intervalle = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) intervalle = 1;
    else if (repetitions === 2) intervalle = 3;
    else intervalle = Math.round(intervalle * facilite);
    facilite = Math.max(1.3, facilite + (0.1 - (5 - qualite) * (0.08 + (5 - qualite) * 0.02)));
  }

  if (plafondIntervalle !== undefined) intervalle = Math.min(intervalle, plafondIntervalle);

  return {
    ...p,
    repetitions,
    intervalle,
    facilite,
    fragile: qualite < 3,
    prochaineRevision: ajouterJours(aujourdhui(), intervalle),
  };
}

/** عدد النجاحات المتتالية التي تُخرج الدرس من الاسترجاع في المراجعة المكثّفة. */
export const SORTIE_INTENSIF_REUSSITES = 2;

/**
 * المراجعة المكثّفة (P2.3): J+1 عند الخطأ، J+3 عند أول نجاح، وبعد نجاحين متتاليين يخرج الدرس من قائمة
 * الاسترجاع حتى الامتحان (لا موعد قادم) — الوقت المتبقّي يُصرف على ما لم يثبت بعد. الخطأ يعيد العدّاد إلى الصفر.
 */
export function mettreAJourSrsIntensif(p: ProgressionLecon, qualite: Qualite): ProgressionLecon {
  const base = mettreAJourSrs(p, qualite, PLAFOND_INTENSIF_JOURS);
  if (qualite < 3) return { ...base, reussitesIntensif: 0, acquisIntensifLe: undefined };
  const reussites = (p.reussitesIntensif ?? 0) + 1;
  if (reussites >= SORTIE_INTENSIF_REUSSITES) {
    return { ...base, reussitesIntensif: reussites, prochaineRevision: undefined, fragile: false, acquisIntensifLe: aujourdhui() };
  }
  return { ...base, reussitesIntensif: reussites };
}

// أول دورة بعد إنهاء البروتوكول
export function premiereRevision(p: ProgressionLecon, fragile: boolean): ProgressionLecon {
  return {
    ...p,
    repetitions: 0,
    intervalle: fragile ? 1 : 3,
    fragile,
    prochaineRevision: ajouterJours(aujourdhui(), fragile ? 1 : 3),
  };
}

export function aReviserAujourdhui(p?: { prochaineRevision?: string } | Srs): boolean {
  if (!p || !p.prochaineRevision) return false;
  return differenceJours(aujourdhui(), p.prochaineRevision) <= 0;
}

// الجدول المعروض للتلميذ: 1 → 3 → 7 → 14 → 28
export const GRILLE_EBBINGHAUS = [1, 3, 7, 14, 28];
