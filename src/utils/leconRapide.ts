// منطق المسار السريع للدرس (3 خطوات مباشرة · ~8 دقائق بأسلوب Duolingo BAC).
// دالّات نقية وقابلة للاختبار الوحدوي لتوليد بطاقات التثبيت، بطاقة جملة الباك،
// الملخّص العربي القصير البديل، وتوافق المراحل مع البنية المحفوظة في الحالة.

import type { LessonGoldSummary } from '../data/lessonGoldSummaries';
import type { QcmDeLecon } from '../data/qcmLecons';
import type { ProgressionLecon } from '../types';

export type CategorieCarte = 'mecanisme' | 'preuve' | 'piege';

export interface CarteExerciceRapide {
  id: string;
  categorie: CategorieCarte;
  badgeAr: string;
  question: string;
  options: string[];
  bonneReponse: string;
  explication: string;
}

export interface EtapeLeconMeta {
  index: 0 | 1 | 2;
  titreAr: string;
  dureeAr: string;
  sousTitreAr: string;
}

export const ETAPES_LECON: readonly EtapeLeconMeta[] = [
  { index: 0, titreAr: 'افهم الفكرة', dureeAr: '3 د', sousTitreAr: 'السؤال، الآلية والشكل الأساسي' },
  { index: 1, titreAr: 'ثبّت بالتمرين', dureeAr: '3 د', sousTitreAr: '3 بطاقات سريعة: آلية · دليل · فخّ الباك' },
  { index: 2, titreAr: 'جملة الباك والملخّص', dureeAr: '2 د', sousTitreAr: 'صياغة الباك · بطاقة الدرس · الملخّص الصوتي' },
] as const;

export const DUREE_LECON_RAPIDE_MIN = 8;

/** تجزئة حتمية خفيفة بدون Math.random (نفس القيم في كلّ جهاز وجلسة). */
function hache(cle: string): number {
  let h = 2166136261;
  for (let i = 0; i < cle.length; i++) {
    h ^= cle.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** خلط حتمي للخيارات يضمن عدم ظهور الإجابة الصحيحة دائمًا في المرتبة الأولى. */
export function melangerOptions(options: string[], graine: string): string[] {
  const uniques = Array.from(new Set(options.map((o) => o.trim()).filter(Boolean)));
  const arr = [...uniques];
  let etat = hache(graine) || 1;
  for (let i = arr.length - 1; i > 0; i--) {
    etat = (Math.imul(etat, 1664525) + 1013904223) >>> 0;
    const j = etat % (i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

/**
 * يبني 3 بطاقات تفاعلية سريعة للخطوة 2:
 *  1) تسلسل الآلية (مشتقّة من mechanismAr)
 *  2) الدليل العلمي / الاسترجاع (من qcm.rappel أو evidenceAr)
 *  3) فخّ الباك (من qcm.pieges[0] أو commonErrorAr)
 */
export function construireCartesExercice(
  lessonId: string,
  lecon: LessonGoldSummary,
  qcm?: QcmDeLecon
): CarteExerciceRapide[] {
  const cartes: CarteExerciceRapide[] = [];

  // 1) بطاقة تسلسل الآلية
  if (lecon.mechanismAr.length >= 3) {
    const idx = hache(`${lessonId}:seq`) % (lecon.mechanismAr.length - 1);
    const precedente = lecon.mechanismAr[idx];
    const bonne = lecon.mechanismAr[idx + 1];
    const autres = lecon.mechanismAr.filter((s, j) => j !== idx && j !== idx + 1 && s !== bonne);
    const distracteurs = autres.slice(0, 2);
    if (distracteurs.length < 2 && lecon.commonErrorAr) {
      distracteurs.push(lecon.commonErrorAr);
    }
    cartes.push({
      id: `${lessonId}:mecanisme`,
      categorie: 'mecanisme',
      badgeAr: 'تسلسل الآلية',
      question: `بعد خطوة: «${precedente}»، ماذا يحدث مباشرةً في الآلية؟`,
      options: melangerOptions([bonne, ...distracteurs], `${lessonId}:seq-opt`),
      bonneReponse: bonne,
      explication: `التسلسل الصحيح: بعد «${precedente}» تأتي خطوة «${bonne}».`,
    });
  } else if (qcm?.rappel) {
    const bonne = qcm.rappel.options[0];
    cartes.push({
      id: `${lessonId}:mecanisme`,
      categorie: 'mecanisme',
      badgeAr: 'فهم الآلية',
      question: qcm.rappel.question,
      options: melangerOptions(qcm.rappel.options, `${lessonId}:mec-opt`),
      bonneReponse: bonne,
      explication: qcm.rappel.explication,
    });
  }

  // 2) بطاقة الدليل العلمي / الاسترجاع الأساسي
  if (qcm?.rappel && cartes.every((c) => c.question !== qcm.rappel.question)) {
    const bonne = qcm.rappel.options[0];
    cartes.push({
      id: `${lessonId}:preuve`,
      categorie: 'preuve',
      badgeAr: 'الدليل العلمي',
      question: qcm.rappel.question,
      options: melangerOptions(qcm.rappel.options, `${lessonId}:preuve-opt`),
      bonneReponse: bonne,
      explication: qcm.rappel.explication,
    });
  } else {
    const bonne = lecon.evidenceAr;
    const dist1 = lecon.commonErrorAr;
    const dist2 =
      lecon.mechanismAr[0] && lecon.mechanismAr[0] !== bonne
        ? `مجرّد افتراض نظري دون سند تجريبي حول: ${lecon.vocabulary[0] ?? 'الظاهرة'}`
        : 'ملاحظة ظاهرية فقط لا تثبت الآلية العلمية للدرس';
    cartes.push({
      id: `${lessonId}:preuve`,
      categorie: 'preuve',
      badgeAr: 'الدليل العلمي',
      question: lecon.recallQuestionAr || 'أيّ دليل تجريبي أو وثائقي يثبت فكرة هذا الدرس في الباك؟',
      options: melangerOptions([bonne, dist1, dist2], `${lessonId}:preuve-fb`),
      bonneReponse: bonne,
      explication: `الدليل المعتمد في الباك: ${lecon.evidenceAr}`,
    });
  }

  // 3) بطاقة فخّ الباك
  const piegeCurate = qcm?.pieges?.[0];
  if (piegeCurate) {
    const bonne = piegeCurate.options[0];
    cartes.push({
      id: `${lessonId}:piege`,
      categorie: 'piege',
      badgeAr: 'فخّ الباك',
      question: piegeCurate.question,
      options: melangerOptions(piegeCurate.options, `${lessonId}:piege-opt`),
      bonneReponse: bonne,
      explication: piegeCurate.explication,
    });
  } else {
    const bonne =
      lecon.mechanismAr[lecon.mechanismAr.length - 1] ??
      lecon.evidenceAr;
    const erreur = lecon.commonErrorAr;
    const distracteur2 = `الاكتفاء بذكر المصطلح «${lecon.vocabulary[0] ?? 'الآلية'}» دون ربطه بالنتيجة التجريبية.`;
    cartes.push({
      id: `${lessonId}:piege`,
      categorie: 'piege',
      badgeAr: 'فخّ الباك',
      question: 'انتبه من الخطأ الشائع في مواضيع البكالوريا — أيّ عبارة صحيحة علميًّا؟',
      options: melangerOptions([bonne, erreur, distracteur2], `${lessonId}:piege-fb`),
      bonneReponse: bonne,
      explication: `الفخّ الذي يجب تفاديه: ${erreur}`,
    });
  }

  return cartes;
}

/**
 * بطاقة التحقّق من صياغة الباك في الخطوة 3 («جملة الباك»).
 */
export function construireCarteBac(
  lessonId: string,
  lecon: LessonGoldSummary,
  qcm?: QcmDeLecon
): CarteExerciceRapide {
  if (qcm?.synthese) {
    const bonne = qcm.synthese.options[0];
    return {
      id: `${lessonId}:bac`,
      categorie: 'preuve',
      badgeAr: 'جملة الباك',
      question: qcm.synthese.question,
      options: melangerOptions(qcm.synthese.options, `${lessonId}:bac-opt`),
      bonneReponse: bonne,
      explication: qcm.synthese.explication,
    };
  }
  const conclusion = lecon.mechanismAr[lecon.mechanismAr.length - 1] ?? lecon.evidenceAr;
  const dist1 = lecon.commonErrorAr;
  const dist2 = 'الظاهرة تحدث عشوائيًّا دون علاقة بالوثيقة أو شروط التجربة.';
  return {
    id: `${lessonId}:bac`,
    categorie: 'preuve',
    badgeAr: 'جملة الباك',
    question: 'أيّ خلاصة تُكتب بصياغة علمية سليمة في ورقة البكالوريا؟',
    options: melangerOptions([conclusion, dist1, dist2], `${lessonId}:bac-fb`),
    bonneReponse: conclusion,
    explication: `الصياغة السليمة: ${conclusion}`,
  };
}

/**
 * نصّ ملخّص عربي قصير (للقراءة الصوتية التلقائية عند عدم توفّر ملف MP3 مسجّل).
 */
export function construireResumeCourtAr(lecon: LessonGoldSummary, titre: string): string {
  const conclusion = lecon.mechanismAr[lecon.mechanismAr.length - 1] ?? '';
  return [
    `ملخّص درس ${titre}.`,
    `الفكرة الأساسية تجيب عن السؤال: ${lecon.missionAr}`,
    conclusion ? `الخلاصة العلمية: ${conclusion}.` : '',
    `الدليل في البكالوريا: ${lecon.evidenceAr}`,
    `انتبه من الفخّ الشائع: ${lecon.commonErrorAr}`,
  ]
    .filter(Boolean)
    .join(' ');
}

/** تحديد خطوة البداية عند العودة لدرس بدأه التلميذ سابقًا (متوافق مع phases 1..6). */
export function etapeInitialeDepuisProgression(progression?: ProgressionLecon): 0 | 1 | 2 {
  const n = progression?.phases?.length ?? 0;
  if (n >= 4) return 2;
  if (n >= 2) return 1;
  return 0;
}

/** تحويل الخطوة المنجزة (0، 1، 2) إلى مصفوفة المراحل المتوافقة مع الحالة وبطاقة الدرس. */
export function phasesPourEtape(etape: 0 | 1 | 2): number[] {
  if (etape === 0) return [1, 2];
  if (etape === 1) return [1, 2, 3, 4];
  return [1, 2, 3, 4, 5, 6];
}
