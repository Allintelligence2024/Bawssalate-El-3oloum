// نقاط الخبرة (XP) والأيام المتتالية — كلها محسوبة من الحالة، بلا إعداد يدوي،
// وبلا نسبة مئوية ولا سلسلة تُعرض كخسارة (القاعدة المضادة للقلق تبقى كاملة).

import type { Etat } from '../types';
import { aujourdhui, differenceJours, nbGrand } from './dates';

// مكوّنات الخبرة — كل واحدة لها حدّ معروف ليشعر التلميذ بما يكسبه.
export const VALEURS = {
  phase: 15, // مرحلة من مراحل الستّ مُنجزة
  lecon: 60, // درس مُتمّم كاملًا
  jalon: 200, // جسر وحدة مكتوب
  atelier: 150, // ورشة منجزة
  drill: 3, // عنصر تدريب جيب عنه correctly
  demiHeure: 10, // كل نصف ساعة تركيز مسجّلة
  bacExercice: 6, // exercice du Bac terminé pas à pas (les étapes valent déjà 3/2/0)
  fakh: 2, // piège démasqué (juste ou piège, tant que le jugement est bon)
  fakhSerie: 4, // série de 8 terminée
} as const;

export const PALIERS: { seuil: number; nom: string }[] = [
  { seuil: 0, nom: 'مبتدئ' },
  { seuil: 600, nom: 'متمكّن' },
  { seuil: 1800, nom: 'متقدّم' },
  { seuil: 4000, nom: 'خبير' },
  { seuil: 8000, nom: 'بطل بوصلة العلوم' },
];

export function xpDe(etat: Etat): number {
  let xp = 0;
  for (const p of Object.values(etat.progression)) {
    xp += p.phases.length * VALEURS.phase;
    if (p.statut === 'terminee') xp += VALEURS.lecon;
  }
  xp += Object.values(etat.jalons).filter((j) => j.fait).length * VALEURS.jalon;
  xp += Object.values(etat.ateliers ?? {}).filter((a) => a.fait).length * VALEURS.atelier;
  xp += Object.keys(etat.drills ?? {}).length * VALEURS.drill;
  const minutesSures = Number.isFinite(etat.minutesTotales) ? Math.max(0, etat.minutesTotales) : 0;
  xp += Math.floor(minutesSures / 30) * VALEURS.demiHeure;
  // الباك خطوة بخطوة : كلّ تعليمة قُيّمت ذاتيًّا تغلّي 3 أو 2 أو 0، والتمرين الكامل +6.
  xp += Object.values(etat.bacEtapes ?? {}).reduce<number>(
    (somme, q) => somme + (Number.isFinite(q) && q > 0 ? q : 0),
    0,
  );
  xp += Object.keys(etat.bacExercices ?? {}).length * VALEURS.bacExercice;
  xp += Object.keys(etat.fakh ?? {}).length * VALEURS.fakh;
  xp += Object.keys(etat.fakhSeries ?? {}).length * VALEURS.fakhSerie;
  return xp;
}

export function niveauDe(xp: number): { nom: string; seuil: number } {
  let courant = PALIERS[0];
  for (const p of PALIERS) if (xp >= p.seuil) courant = p;
  return courant;
}

/** أيام نشاط متتالية — آخر نشاط أمس أو اليوم. بلا عقاب: انقطاعٌ لا يُعرض ولا يُحسّ. */
export function joursConsecutifs(journal: string[]): number {
  const auj = aujourdhui();
  const jours = [...new Set(journal)]
    .filter((j) => /^\d{4}-\d{2}-\d{2}$/.test(j) && j <= auj)
    .sort();
  if (jours.length === 0) return 0;
  const dernier = jours[jours.length - 1];
  const ecart = differenceJours(dernier, auj);
  if (ecart < 0 || ecart > 1) return 0;
  let n = 1;
  for (let i = jours.length - 1; i > 0; i--) {
    if (differenceJours(jours[i - 1], jours[i]) === 1) n++;
    else break;
  }
  return n;
}

export function xpTexte(xp: number): string {
  return `${nbGrand(xp)} XP`;
}
