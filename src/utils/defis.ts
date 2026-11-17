// تحدّي الأسبوع وشارات المحتوى (P3.2) — الانتظام لا النتيجة، ولا مقارنة بأحد.
// التحدّي يختاره التلميذ بنفسه (20 تدريبًا / مراجعة متقاطعة / امتحان تجريبي) ويُقاس من الحالة المحلّية فقط.
// الشارات مشتقّة من المحتوى المُنجز (جسور، استرجاعات SM-2، امتحانات، تحدّيات) — بلا ترتيب ولا سلسلة تُعرض كخسارة.

import type { Etat } from '../types';
import { aujourdhui } from './dates';
import { debutSemaine } from './moteur';

export type TypeDefi = 'drills' | 'croisee' | 'examen';

export interface Defi {
  semaine: string;
  type: TypeDefi;
  choisiLe: string;
  /** عدد التدريبات المُجابة لحظة الاختيار — التقدّم = الفرق (البنك لا يحمل تواريخ) */
  baseDrills: number;
}

export const CIBLE_DRILLS = 20;

export const DEFIS: { type: TypeDefi; titre: string; detail: string }[] = [
  { type: 'drills', titre: `${CIBLE_DRILLS} تدريبًا هذا الأسبوع`, detail: 'جولات السلّم التكيّفي — تُحسب الإجابات الصحيحة الجديدة فقط.' },
  { type: 'croisee', titre: 'مراجعة متقاطعة واحدة', detail: 'درس من كلّ مجال في جلسة واحدة — تظهر في «اليوم» حين تكون جاهزة.' },
  { type: 'examen', titre: 'امتحان تجريبي واحد', detail: 'موضوع كامل بوقته الحقيقي، من «التدريبات».' },
];

export interface AvancementDefi {
  defi: Defi;
  fait: number;
  cible: number;
  accompli: boolean;
}

export function defiCourant(etat: Etat, auj: string = aujourdhui()): Defi | null {
  const d = etat.defi;
  return d && d.semaine === debutSemaine(auj) ? d : null;
}

export function choisirDefi(etat: Etat, type: TypeDefi, auj: string = aujourdhui()): Etat {
  const semaine = debutSemaine(auj);
  const d = etat.defi;
  if (d && d.semaine === semaine) return etat; // تحدّي واحد في الأسبوع، لا تبديل بعد الاختيار
  return { ...etat, defi: { semaine, type, choisiLe: auj, baseDrills: Object.keys(etat.drills ?? {}).length } };
}

export function avancementDefi(etat: Etat, auj: string = aujourdhui()): AvancementDefi | null {
  const defi = defiCourant(etat, auj);
  if (!defi) return null;
  let fait = 0;
  let cible = 1;
  if (defi.type === 'drills') {
    cible = CIBLE_DRILLS;
    fait = Math.min(cible, Math.max(0, Object.keys(etat.drills ?? {}).length - defi.baseDrills));
  } else if (defi.type === 'croisee') {
    const r = etat.revueCroisee;
    fait = r && r.semaine === defi.semaine && r.faiteLe ? 1 : 0;
  } else {
    fait = (etat.examensBlancs ?? []).some((iso) => {
      const jour = iso.slice(0, 10);
      return jour >= defi.choisiLe && debutSemaine(jour) === defi.semaine;
    })
      ? 1
      : 0;
  }
  return { defi, fait, cible, accompli: fait >= cible };
}

/** يُسجَّل أسبوع التحدّي المُنجز مرّة واحدة (للشارة « تحدّيات مُنجزة »). يُستدعى عند كلّ حفظ. */
export function consoliderDefi(etat: Etat, auj: string = aujourdhui()): Etat {
  const av = avancementDefi(etat, auj);
  if (!av?.accompli) return etat;
  const deja = etat.defisAccomplis ?? [];
  if (deja.includes(av.defi.semaine)) return etat;
  return { ...etat, defisAccomplis: [...deja, av.defi.semaine] };
}

// ───────────── الشارات ─────────────

export interface Badge {
  id: string;
  famille: string;
  nom: string;
  detail: string;
  seuil: number;
  valeur: number;
  atteint: boolean;
}

interface FamilleBadge {
  famille: string;
  valeur: (e: Etat) => number;
  paliers: { seuil: number; nom: string; detail: string }[];
}

const FAMILLES: FamilleBadge[] = [
  {
    famille: 'جسور',
    valeur: (e) => Object.values(e.jalons).filter((j) => j.fait).length,
    paliers: [
      { seuil: 1, nom: 'أوّل جسر', detail: 'كتبت تركيب وحدة من الذاكرة' },
      { seuil: 5, nom: 'مجال كامل', detail: 'خمسة جسور — مجال بأكمله مربوط' },
      { seuil: 11, nom: 'كلّ الجسور', detail: 'الوحدات الإحدى عشرة مربوطة' },
    ],
  },
  {
    famille: 'استرجاعات',
    valeur: (e) => e.revisions,
    paliers: [
      { seuil: 10, nom: 'عشر عودات', detail: 'عشر جلسات استرجاع متباعد' },
      { seuil: 50, nom: 'خمسون عودة', detail: 'الاسترجاع صار عادة' },
      { seuil: 150, nom: 'ذاكرة طويلة', detail: 'مئة وخمسون استرجاعًا' },
    ],
  },
  {
    famille: 'امتحانات تجريبية',
    valeur: (e) => (e.examensBlancs ?? []).length,
    paliers: [
      { seuil: 1, nom: 'أوّل موضوع', detail: 'امتحان كامل بوقته الحقيقي' },
      { seuil: 3, nom: 'ثلاثة مواضيع', detail: 'الوقت لم يعد مفاجأة' },
      { seuil: 6, nom: 'ستّة مواضيع', detail: 'موضوع كلّ أسبوعين تقريبًا' },
    ],
  },
  {
    famille: 'تحدّيات أسبوعية',
    valeur: (e) => (e.defisAccomplis ?? []).length,
    paliers: [
      { seuil: 1, nom: 'أوّل تحدٍّ', detail: 'اخترت تحدّيًا وأتممته' },
      { seuil: 4, nom: 'شهر من التحدّيات', detail: 'أربعة أسابيع مُنجزة — لا يُشترط تتاليها' },
      { seuil: 10, nom: 'عشرة تحدّيات', detail: 'الانتظام نفسه صار المكافأة' },
    ],
  },
];

export function badges(etat: Etat): Badge[] {
  return FAMILLES.flatMap((f) => {
    const valeur = f.valeur(etat);
    return f.paliers.map((p, k) => ({
      id: `${f.famille}-${k}`,
      famille: f.famille,
      nom: p.nom,
      detail: p.detail,
      seuil: p.seuil,
      valeur,
      atteint: valeur >= p.seuil,
    }));
  });
}

/** الشارات المحصَّلة + الشارة التالية في كلّ عائلة (لا نعرض السلّم كاملًا حتى لا يُحبط). */
export function badgesAffiches(etat: Etat): { obtenus: Badge[]; prochains: Badge[] } {
  const tous = badges(etat);
  const obtenus = tous.filter((b) => b.atteint);
  const prochains = FAMILLES.map((f) => tous.find((b) => b.famille === f.famille && !b.atteint)).filter((b): b is Badge => Boolean(b));
  return { obtenus, prochains };
}
