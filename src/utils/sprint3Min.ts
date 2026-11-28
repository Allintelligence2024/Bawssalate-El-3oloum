// « سبرينت ٣ دقائق » — جلسة سريعة من 6 عناصر قصيرة (QCM + فخاخ الباك + منهجية)
// مصمّمة لتلميذ البكالوريا: تركيز قصير، تغذية راجعة فورية، واختيار هادئ « بلا ضغط ».
// الخلط حتمي وغير منحاز باستعمال Math.imul (خالي من عيب PASS2-F001).

import { QCM_LECONS } from '../data/qcmLecons';
import { UNITES, titreLecon } from '../data/programme';
import type { Etat } from '../types';
import { aujourdhui } from './dates';

export type CategorieSprint = 'rappel' | 'piege' | 'methode';

export interface ItemSprint3Min {
  id: string;
  categorie: CategorieSprint;
  categorieAr: string;
  uniteTitre: string;
  leconTitre: string;
  question: string;
  options: string[];
  bonneReponse: string;
  explication: string;
}

const VERBES_METHODE: { question: string; options: string[]; explication: string }[] = [
  {
    question: 'في تعليمة « حلّل الوثيقة » في البكالوريا، ما هي البنية الصحيحة التي ينتظرها المصحّح؟',
    options: [
      'التعريف بالوثيقة + استخراج الملاحظات بدقة (تغيّرات/قيم) + استنتاج علمي مختصر',
      'كتابة الدرس المحفوظ كاملًا دون الإشارة إلى منحنيات الوثيقة',
      'إعطاء النتيجة النهائية مباشرة في سطر واحد دون ذكر معطيات الوثيقة',
      'تفسير الآلية الجزيئية قبل قراءة المتغيّر التابع في الوثيقة',
    ],
    explication: 'التحليل يبدأ دائمًا بتفكيك معطيات الوثيقة بدقة ثم الخروج باستنتاج مباشر مرتبط بها.',
  },
  {
    question: 'متى تستعمل الفعل المنهجي « فسّر » في ورقة الإجابة؟',
    options: [
      'لربط النتيجة الملاحظة بآليتها العلمية وأسبابها الخلوية أو الجزيئية (لماذا وكيف؟)',
      'لوصف الشكل الخارجي للمنحنى فقط دون ذكر الأسباب',
      'لاقتراح فرضية جديدة دون استعمال معطيات التجربة',
      'لإعادة صياغة نصّ التمرين بكلمات مختلفة',
    ],
    explication: 'التفسير يجيب عن « لماذا حدث ذلك؟ » بربط الدليل التجريبي بالآلية العلمية الدقيقة.',
  },
  {
    question: 'في تمرين المسعى العلمي، كيف تتعامل مع الفرضيات المقترحة في الجزء الأول؟',
    options: [
      'تصوغ فرضيات وجيهة قابلة للاختبار، ثم تصادق على الصحيحة منها بدليل من وثائق الجزء الثاني',
      'تختار الفرضية الصحيحة فقط من البداية وتخفي بقية الاحتمالات المنطقية',
      'تكتب فرضية عامة لا علاقة لها بمعطيات الجزء الأول',
      'تعيد ذكر الفرضية في الخاتمة دون ربطها بنتائج التجارب',
    ],
    explication: 'المسعى العلمي يقوم على طرح فرضيات قابلة للاختبار ثم المصادقة عليها بأدلة مستغَلّة من الوثائق.',
  },
];

/** خلط Fisher-Yates حتمي وغير منحاز باستعمال Math.imul (32 بت حقيقية). */
export function melangerSprint<T>(liste: readonly T[], graine: string): T[] {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < graine.length; i++) {
    h ^= graine.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  const sortie = [...liste];
  for (let i = sortie.length - 1; i > 0; i--) {
    h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
    const j = h % (i + 1);
    [sortie[i], sortie[j]] = [sortie[j], sortie[i]];
  }
  return sortie;
}

/** يركّب جلسة « سبرينت ٣ دقائق » من 6 عناصر متنوعة (تذكّر + فخاخ الباك + منهجية). */
export function composerSprint3Min(etat: Etat, graine: string = aujourdhui()): ItemSprint3Min[] {
  // أولوية الدروس: الهشّة أو الجارية أو المراجعة أولًا، ثم وحدات ذات وزن عالٍ في البكالوريا
  const leconsPrioritaires: { lessonId: string; uniteTitre: string; poids: number }[] = [];
  for (const u of UNITES) {
    for (const lid of u.lessonIds) {
      if (!QCM_LECONS[lid]) continue;
      const p = etat.progression[lid];
      const bonus = p?.fragile ? 30 : p?.statut === 'en_cours' ? 20 : p?.statut === 'terminee' ? 10 : 5;
      leconsPrioritaires.push({ lessonId: lid, uniteTitre: u.titre, poids: u.poidsBac * 4 + bonus });
    }
  }
  leconsPrioritaires.sort((a, b) => b.poids - a.poids || a.lessonId.localeCompare(b.lessonId));

  const poolRappel: ItemSprint3Min[] = [];
  const poolPieges: ItemSprint3Min[] = [];

  for (const { lessonId, uniteTitre } of leconsPrioritaires) {
    const qcm = QCM_LECONS[lessonId];
    if (!qcm) continue;
    const leconTitre = titreLecon(lessonId);

    if (qcm.rappel?.options?.length >= 2) {
      const bonne = qcm.rappel.options[0];
      poolRappel.push({
        id: `sprint:rappel:${lessonId}`,
        categorie: 'rappel',
        categorieAr: 'تثبيت سريع',
        uniteTitre,
        leconTitre,
        question: qcm.rappel.question,
        options: melangerSprint(qcm.rappel.options, `${graine}:r:${lessonId}`),
        bonneReponse: bonne,
        explication: qcm.rappel.explication,
      });
    }

    if (qcm.pieges?.length) {
      qcm.pieges.forEach((piege, idx) => {
        if (piege.options?.length >= 2) {
          const bonne = piege.options[0];
          poolPieges.push({
            id: `sprint:piege:${lessonId}:${idx}`,
            categorie: 'piege',
            categorieAr: 'فخّ شائع في الباك',
            uniteTitre,
            leconTitre,
            question: piege.question,
            options: melangerSprint(piege.options, `${graine}:p:${lessonId}:${idx}`),
            bonneReponse: bonne,
            explication: piege.explication,
          });
        }
      });
    } else if (qcm.synthese?.options?.length >= 2) {
      const bonne = qcm.synthese.options[0];
      poolRappel.push({
        id: `sprint:synthese:${lessonId}`,
        categorie: 'rappel',
        categorieAr: 'خلاصة علمية',
        uniteTitre,
        leconTitre,
        question: qcm.synthese.question,
        options: melangerSprint(qcm.synthese.options, `${graine}:s:${lessonId}`),
        bonneReponse: bonne,
        explication: qcm.synthese.explication,
      });
    }
  }

  const poolMethode: ItemSprint3Min[] = VERBES_METHODE.map((m, idx) => ({
    id: `sprint:methode:${idx}`,
    categorie: 'methode',
    categorieAr: 'منهجية البكالوريا',
    uniteTitre: 'منهجية الإجابة العلمية',
    leconTitre: 'أفعال التعليمات',
    question: m.question,
    options: melangerSprint(m.options, `${graine}:m:${idx}`),
    bonneReponse: m.options[0],
    explication: m.explication,
  }));

  const rappelsChoisis = melangerSprint(poolRappel.slice(0, 18), `${graine}:pick-r`).slice(0, 3);
  const piegesChoisis = melangerSprint(poolPieges.slice(0, 16), `${graine}:pick-p`).slice(0, 2);
  const methodeChoisie = melangerSprint(poolMethode, `${graine}:pick-m`).slice(0, 1);

  const selection = [...rappelsChoisis, ...piegesChoisis, ...methodeChoisie];
  // ضمان 6 عناصر حتى لو كانت قائمة الفخاخ فارغة
  if (selection.length < 6) {
    const vus = new Set(selection.map((s) => s.id));
    for (const item of poolRappel) {
      if (selection.length >= 6) break;
      if (!vus.has(item.id)) {
        vus.add(item.id);
        selection.push(item);
      }
    }
  }

  return melangerSprint(selection.slice(0, 6), `${graine}:ordre-final`);
}
