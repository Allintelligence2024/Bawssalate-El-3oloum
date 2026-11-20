// إحصاء الإجابات — يقيسه المُرشد: كم إجابة صحيحة، كم ليست صحيحة، ومن أين جاءت.
// مفتاح مستقل تاريخيًا، ويُحفظ مع التقدّم بعد استيراد نسخة كاملة.

import { useSyncExternalStore } from 'react';
import { signalerEchecStockage } from './echecsStockage';
import { ajouterJours, aujourdhui, nb } from './dates';

export type SourceReponse = 'phase' | 'revision' | 'jalon' | 'atelier' | 'exercice';

export interface Compteurs {
  justes: number;
  fausses: number;
}

export interface StatsReponses {
  justes: number;
  fausses: number;
  parSource: Record<SourceReponse, Compteurs>;
  parJour: Record<string, Compteurs>; // تاريخ ISO → عدّاده (آخر 45 يومًا)
}

export const SOURCES: { id: SourceReponse; label: string }[] = [
  { id: 'phase', label: 'بوّابات المراحل' },
  { id: 'revision', label: 'جلسات الاسترجاع' },
  { id: 'jalon', label: 'الجسور' },
  { id: 'atelier', label: 'الورشات' },
  { id: 'exercice', label: 'التدريبات' },
];

import { CLE_STATS_HISTORIQUE as CLE, lireStatsBrutes, ecrireStatsBrutes } from './stockageCommun';
const JOURS_GARDES = 45;
let lectureEnEchec = false;

function vierge(): StatsReponses {
  return {
    justes: 0,
    fausses: 0,
    parSource: {
      phase: { justes: 0, fausses: 0 },
      revision: { justes: 0, fausses: 0 },
      jalon: { justes: 0, fausses: 0 },
      atelier: { justes: 0, fausses: 0 },
      exercice: { justes: 0, fausses: 0 },
    },
    parJour: {},
  };
}

function lire(): StatsReponses {
  try {
    const a = lireStatsBrutes() as Partial<StatsReponses> | null;
    if (a === null) return vierge();
    if (!a || typeof a !== 'object' || Array.isArray(a)) throw new Error('statistiques invalides');
    const compteurValide = (c: unknown): boolean => {
      if (!c || typeof c !== 'object' || Array.isArray(c)) return false;
      const { justes, fausses } = c as Record<string, unknown>;
      return [justes, fausses].every(n => typeof n === 'number' && Number.isSafeInteger(n) && n >= 0);
    };
    const dictionnaireValide = (d: unknown): boolean =>
      !!d && typeof d === 'object' && !Array.isArray(d) && Object.values(d).every(compteurValide);
    if ((a.justes !== undefined && (!Number.isSafeInteger(a.justes) || a.justes < 0)) ||
        (a.fausses !== undefined && (!Number.isSafeInteger(a.fausses) || a.fausses < 0)) ||
        (a.parSource !== undefined && !dictionnaireValide(a.parSource)) ||
        (a.parJour !== undefined && !dictionnaireValide(a.parJour))) throw new Error('statistiques invalides');
    const base = vierge();
    return {
      justes: a.justes ?? 0,
      fausses: a.fausses ?? 0,
      parSource: { ...base.parSource, ...(a.parSource ?? {}) },
      parJour: a.parJour ?? {},
    };
  } catch {
    lectureEnEchec = true;
    // En dehors d'un navigateur (tests/SSR), l'absence du stockage est normale.
    if (typeof window !== 'undefined') signalerEchecStockage();
    return vierge();
  }
}

let stats: StatsReponses = lire();
const ecouteurs = new Set<() => void>();

function incr(c: Compteurs | undefined, juste: boolean): Compteurs {
  const b = c ?? { justes: 0, fausses: 0 };
  return juste
    ? { justes: b.justes + 1, fausses: b.fausses }
    : { justes: b.justes, fausses: b.fausses + 1 };
}

// محاولة واحدة = محاولة واحدة (تُحتسب مرة حتى لو أُعيد النقر على الخيار نفسه)
export function noterReponse(source: SourceReponse, juste: boolean): void {
  const jour = aujourdhui();
  const parJour = { ...stats.parJour, [jour]: incr(stats.parJour[jour], juste) };
  const cles = Object.keys(parJour).sort();
  while (cles.length > JOURS_GARDES) {
    const plusVieux = cles.shift();
    if (plusVieux) delete parJour[plusVieux];
  }
  stats = {
    justes: stats.justes + (juste ? 1 : 0),
    fausses: stats.fausses + (juste ? 0 : 1),
    parSource: { ...stats.parSource, [source]: incr(stats.parSource[source], juste) },
    parJour,
  };
  try {
    if (lectureEnEchec) throw new Error('lecture précédente impossible');
    ecrireStatsBrutes(stats);
  } catch {
    signalerEchecStockage();
  }
  ecouteurs.forEach((fn) => fn());
}

/** Restaurer uniquement des statistiques validées par lireSauvegarde. */
export function restaurerStats(nouvelles: StatsReponses): void {
  stats = nouvelles;
  lectureEnEchec = false; // remplacement explicitement confirmé
  try { ecrireStatsBrutes(stats); }
  catch { signalerEchecStockage(); }
  ecouteurs.forEach((fn) => fn());
}

/** Met à jour la mémoire après une écriture atomique effectuée par storage.ts. */
export function publierStatsRestaurees(nouvelles: StatsReponses): void {
  stats = nouvelles;
  lectureEnEchec = false;
  ecouteurs.forEach(fn => fn());
}

export function statsActuelles(): StatsReponses {
  return stats;
}

export function abonnerStats(fn: () => void): () => void {
  ecouteurs.add(fn);
  return () => {
    ecouteurs.delete(fn);
  };
}

export function useStats(): StatsReponses {
  return useSyncExternalStore(abonnerStats, statsActuelles, statsActuelles);
}

export function statsSemaine(s: StatsReponses): Compteurs {
  const auj = aujourdhui();
  let justes = 0;
  let fausses = 0;
  for (let i = 0; i < 7; i++) {
    const c = s.parJour[ajouterJours(auj, -i)];
    if (c) {
      justes += c.justes;
      fausses += c.fausses;
    }
  }
  return { justes, fausses };
}

export function totalReponses(s: StatsReponses): number {
  return s.justes + s.fausses;
}

// كلام المُرشد حول الأرقام — تحفيز بلا نسبة وبلا لوم
export function messageTuteur(s: StatsReponses): string {
  const total = totalReponses(s);
  if (total === 0) {
    return 'لم تسجَّل بعد أي إجابة. أول سؤال يفتح الحصيلة — والخطأ هنا وسيلة للتعلّم لا حكم عليك.';
  }
  const sem = statsSemaine(s);
  if (sem.justes + sem.fausses === 0) {
    return 'لا محاولة جديدة هذا الأسبوع. الراحة جزء من الخطة، ولا شيء يُضاع هنا.';
  }
  if (sem.fausses === 0) {
    return `كل إجاباتك هذا الأسبوع صحيحة (${nb(sem.justes)}). ارفع الإيقاع: بوّابة أعلى أو درس جديد.`;
  }
  if (sem.fausses > sem.justes) {
    return 'الخطوات السببية قبل اليقين: أعِد قراءة الدرس ثم أعد المحاولة. كل خاطئة هنا بطاقة تعريف بما يحتاج مراجعة.';
  }
  return `${nb(sem.justes)} صحيحة و${nb(sem.fausses)} ليست صحيحة هذا الأسبوع — هذا هو التقدّم الحقيقي: تُحاول، تُراجع، تتقدّم.`;
}

// «إعادة الضبط» تمسح الإحصاء مع كل شيء
export function viderStats(): void {
  stats = vierge();
  try {
    localStorage.removeItem(CLE);
    lectureEnEchec = false;
  } catch {
    lectureEnEchec = true;
    signalerEchecStockage();
  }
  ecouteurs.forEach((fn) => fn());
}
