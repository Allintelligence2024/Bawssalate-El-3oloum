// اختبار التموضع (P2.1) — 22 سؤالًا (سؤالان لكل وحدة)، ≈ 12 دقيقة، قابل للرفض.
//
// ما يفعله: رسالة ترحيب شخصية، «نقاط القوّة / ما يحتاج تثبيتًا» في «أنا».
// ما لا يفعله أبدًا: لا يفتح الطريق (القفل المتسلسل هو ضمانة ضدّ الثغرات)، لا علامة، لا نسبة، لا مقارنة.
//
// الأسئلة في `diagnosticQuestions.ts` (تستورد بنك QCM) — هذا الملف خفيف ويُستورد من شاشة «اليوم».

import { UNITES, UNITE_PAR_ID } from '../data/programme';
import type { QuestionDiagnostic } from './diagnosticQuestions';
import type { Etat } from '../types';

export const DUREE_DIAGNOSTIC_MIN = 12;

export interface ResultatUnite {
  justes: number;
  total: number;
}

export interface Diagnostic {
  date: string; // ISO
  parUnite: Record<string, ResultatUnite>;
}

/** reponses[i] = فهرس الخيار المختار في ترتيب البنك (0 = صحيح)، أو null إن تُرك. */
export function evaluerDiagnostic(
  questions: QuestionDiagnostic[],
  reponses: Array<number | null>,
  dateIso: string,
): Diagnostic {
  const parUnite: Record<string, ResultatUnite> = {};
  questions.forEach((q, i) => {
    const r = (parUnite[q.uniteId] ??= { justes: 0, total: 0 });
    r.total += 1;
    if (reponses[i] === 0) r.justes += 1;
  });
  return { date: dateIso, parUnite };
}

export type NiveauUnite = 'force' | 'moyen' | 'fragile';

export function niveauUnite(r: ResultatUnite): NiveauUnite {
  if (r.total === 0) return 'moyen';
  if (r.justes === r.total) return 'force';
  if (r.justes === 0) return 'fragile';
  return 'moyen';
}

export interface BilanDiagnostic {
  fortes: string[]; // uniteIds
  moyennes: string[];
  fragiles: string[];
}

export function bilanDiagnostic(d: Diagnostic): BilanDiagnostic {
  const b: BilanDiagnostic = { fortes: [], moyennes: [], fragiles: [] };
  for (const u of UNITES) {
    const r = d.parUnite[u.id];
    if (!r) continue;
    const n = niveauUnite(r);
    (n === 'force' ? b.fortes : n === 'fragile' ? b.fragiles : b.moyennes).push(u.id);
  }
  return b;
}

/** جملة ترحيب شخصية لشاشة «اليوم» — كلمات لا أرقام، ولا تغيّر الطريق. */
export function messageAccueil(etat: Etat): string | null {
  if (!etat.diagnostic) return null;
  const b = bilanDiagnostic(etat.diagnostic);
  const nom = (id: string) => UNITE_PAR_ID[id]?.titre ?? id;
  if (b.fortes.length && b.fragiles.length) {
    return `من اختبار التموضع: «${nom(b.fortes[0])}» نقطة قوّة عندك، و«${nom(b.fragiles[0])}» تستحقّ تثبيتًا هادئًا حين يأتي دورها في الطريق.`;
  }
  if (b.fortes.length) return `من اختبار التموضع: أساس متين في «${nom(b.fortes[0])}». الطريق نفسه، بخطى أثبت.`;
  if (b.fragiles.length) return `من اختبار التموضع: «${nom(b.fragiles[0])}» تحتاج تثبيتًا — وهذا بالضبط ما صُمّم له الطريق، خطوة بخطوة.`;
  return 'من اختبار التموضع: صورة متوازنة. الطريق خطوة بخطوة هو أقصر طريق.';
}
