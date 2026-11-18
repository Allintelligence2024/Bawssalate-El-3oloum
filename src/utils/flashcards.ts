// البطاقات (flashcards) — مشتقّة بالكامل من الفيش الذهبية الموجودة (`lessonGoldSummaries.ts`)، لا محتوى جديد:
//   - «استرجاع»: سؤال الاسترجاع → خطوات الآلية
//   - «دليل»: «ما الدليل الوثائقي الذي يُثبت…؟» → evidenceAr
//   - «فخّ»: «ما الخطأ الشائع في…؟» → commonErrorAr
//
// القواعد:
//   - تُفتح بطاقات الدرس بعد إنهاء بروتوكوله (أو إن كان في المفضّلة) — لا تجاوز للطريق.
//   - صناديق لايتنر 1 → 2 → 3 (غدًا / بعد 3 أيام / بعد أسبوع). «لم أعرفها» تعيدها إلى الصندوق 1.
//   - مستقلّة عن SM-2 الدروس: البطاقة لا تُغيّر حالة الدرس ولا مواعيد استرجاعه.
//   - لا نسبة ولا علامة: يُعرض عدد البطاقات المستحقّة والمعروفة اليوم فقط.

import type { Etat } from '../types';
import { LESSON_GOLD_SUMMARIES } from '../data/lessonGoldSummaries';
import { CHEMIN, titreLecon } from '../data/programme';
import { ajouterJours, aujourdhui, differenceJours } from './dates';

export type TypeCarte = 'rappel' | 'preuve' | 'piege';

export interface Carte {
  id: string; // `${lessonId}#${type}`
  lessonId: string;
  type: TypeCarte;
  recto: string;
  verso: string[];
}

export interface EtatCarte {
  boite: 1 | 2 | 3;
  prochaine: string; // ISO date
  vues: number;
}

export const INTERVALLES_BOITES: Record<1 | 2 | 3, number> = { 1: 1, 2: 3, 3: 7 };
export const TAILLE_SESSION = 12;

const LIBELLE: Record<TypeCarte, string> = { rappel: 'استرجاع', preuve: 'دليل', piege: 'فخّ' };
export function libelleType(t: TypeCarte): string {
  return LIBELLE[t];
}

export function cartesDeLecon(lessonId: string): Carte[] {
  const g = LESSON_GOLD_SUMMARIES[lessonId];
  if (!g) return [];
  const titre = titreLecon(lessonId);
  const out: Carte[] = [];
  if (g.recallQuestionAr && g.mechanismAr?.length) {
    out.push({ id: `${lessonId}#rappel`, lessonId, type: 'rappel', recto: g.recallQuestionAr, verso: g.mechanismAr });
  }
  if (g.evidenceAr) {
    out.push({
      id: `${lessonId}#preuve`,
      lessonId,
      type: 'preuve',
      recto: `ما الدليل الوثائقي الذي يُثبت ما جاء في «${titre}»؟`,
      verso: [g.evidenceAr],
    });
  }
  if (g.commonErrorAr) {
    out.push({
      id: `${lessonId}#piege`,
      lessonId,
      type: 'piege',
      recto: `ما الخطأ الشائع الذي يقع فيه المترشّحون في «${titre}»؟`,
      verso: [g.commonErrorAr],
    });
  }
  return out;
}

/** الدروس التي تُفتح بطاقاتها: المُنهاة + المفضّلة، بترتيب الطريق. */
export function leconsOuvertes(etat: Etat): string[] {
  const fav = new Set(etat.favoris ?? []);
  return CHEMIN.filter(
    (c): c is { type: 'lecon'; id: string } =>
      c.type === 'lecon' && (etat.progression[c.id]?.statut === 'terminee' || fav.has(c.id)),
  ).map((c) => c.id);
}

export function cartesDisponibles(etat: Etat): Carte[] {
  return leconsOuvertes(etat).flatMap(cartesDeLecon);
}

export function carteDue(etat: Etat, carte: Carte, jour = aujourdhui()): boolean {
  const e = etat.flashcards?.[carte.id];
  if (!e) return true; // جديدة
  return differenceJours(jour, e.prochaine) <= 0;
}

/** جلسة اليوم: المستحقّة أولًا (الصندوق 1 قبل 2 قبل 3)، ثم الجديدة، بحدّ TAILLE_SESSION. */
export function sessionDuJour(etat: Etat, jour = aujourdhui()): Carte[] {
  const dispo = cartesDisponibles(etat);
  const dues = dispo.filter((c) => carteDue(etat, c, jour));
  const rang = (c: Carte) => etat.flashcards?.[c.id]?.boite ?? 0; // 0 = جديدة بعد المستحقّة
  const ordre = [...dues].sort((a, b) => {
    const ra = rang(a) === 0 ? 9 : rang(a);
    const rb = rang(b) === 0 ? 9 : rang(b);
    return ra - rb;
  });
  return ordre.slice(0, TAILLE_SESSION);
}

export function repondreCarte(prev: EtatCarte | undefined, connue: boolean, jour = aujourdhui()): EtatCarte {
  const boite: 1 | 2 | 3 = connue ? (Math.min(3, (prev?.boite ?? 0) + 1) as 1 | 2 | 3) : 1;
  return { boite, prochaine: ajouterJours(jour, INTERVALLES_BOITES[boite]), vues: (prev?.vues ?? 0) + 1 };
}

export interface ResumeCartes {
  disponibles: number;
  dues: number;
  parBoite: Record<1 | 2 | 3, number>;
}

export function resumeCartes(etat: Etat, jour = aujourdhui()): ResumeCartes {
  const dispo = cartesDisponibles(etat);
  const parBoite: Record<1 | 2 | 3, number> = { 1: 0, 2: 0, 3: 0 };
  for (const c of dispo) {
    const b = etat.flashcards?.[c.id]?.boite;
    if (b) parBoite[b] += 1;
  }
  return { disponibles: dispo.length, dues: dispo.filter((c) => carteDue(etat, c, jour)).length, parBoite };
}
