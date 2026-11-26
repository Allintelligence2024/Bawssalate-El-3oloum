// Ce qu'attend le correcteur, verbe par verbe — et la checklist en trois points du tiroir.
//
// Traçabilité éditoriale (règle du dépôt) : ces formulations sont des **règles de méthode**,
// pas des contenus scientifiques. Elles prolongent `verbesEtMethodes.ts` et l'ancienne table
// partielle `ATTENTE_DU_VERBE` (14 verbes sur 20) de `entrainement.ts`. Tant qu'un enseignant
// ne les a pas relues, elles restent marquées `a_valider_enseignant` et l'application les
// présente comme telles dans le tiroir.

import type { VerbeConsigne } from '../sujetsOfficiels';
import type { StatutEditorial } from '../../types';

export type AttenduVerbe = {
  /** Une ligne : ce que le correcteur attend, formulé comme un critère. */
  attendu: string;
  /** Trois points de vérification, dans l'ordre où on les contrôle. */
  checklist: [string, string, string];
};

export const STATUT_ATTENDUS: StatutEditorial = 'a_valider_enseignant';

/**
 * Table **complète** des 20 verbes de consigne du Bac SVT.
 * Un test vérifie qu'elle couvre exactement `VerbeConsigne` : un verbe ajouté sans attendu
 * casse la CI, il ne peut pas passer silencieusement.
 */
export const ATTENDU_PAR_VERBE: Record<VerbeConsigne, AttenduVerbe> = {
  'سمِّ': {
    attendu: 'الاسم الدقيق كما ورد في الدرس، بلا شرح زائد.',
    checklist: ['الاسم العلمي كاملًا', 'بلا تعريف ولا تعليل', 'المصطلح نفسه الوارد في الدرس'],
  },
  'تعرَّف': {
    attendu: 'تسمية العنصر المعروض على الوثيقة بدقّة، لا وصفًا له.',
    checklist: ['أشير إلى العنصر في الوثيقة', 'أسمّيه بمصطلح الدرس', 'لا أفسّر وظيفته'],
  },
  'حدِّد': {
    attendu: 'إجابة مباشرة: قيمة، موضع، أو عنصر — بلا شرح.',
    checklist: ['القيمة أو الموضع بالضبط', 'الوحدة إن وُجدت', 'بلا تفسير'],
  },
  'استخرج': {
    attendu: 'نقل معلومة موجودة في الوثيقة، بأرقامها أو نصّها.',
    checklist: ['المعلومة من الوثيقة حرفيًا', 'الرقم أو اللفظ كما هو', 'لا أضيف معرفة من عندي'],
  },
  'حلِّل': {
    attendu: 'وصف التغيّر بالأرقام ثمّ استنتاج علاقة موجزة دون تفسير بآلية من الدرس.',
    checklist: ['أعرّف الوثيقة والمتغيّرين', 'أذكر المعطيات بأرقامها وأقارن بين الحالات', 'أصوغ علاقة واحدة بلا تفسير'],
  },
  'قارن': {
    attendu: 'تشابه ثمّ اختلاف، في الشروط نفسها.',
    checklist: ['نفس المعيار للطرفين', 'تشابه صريح', 'اختلاف صريح'],
  },
  'فسِّر': {
    attendu: 'ربط الملاحظة بآلية من الدرس (السبب، لا الوصف).',
    checklist: ['أذكّر بالملاحظة في سطر', 'أذكر الآلية من الدرس', 'أربط السبب بالنتيجة'],
  },
  'برِّر': {
    attendu: 'حجّة من الوثيقة + حجّة من المعرفة، ثمّ موقف.',
    checklist: ['حجّة وثائقية', 'حجّة من الدرس', 'موقف واضح'],
  },
  'بيِّن': {
    attendu: 'إظهار العلاقة بين معطيين بالدليل، لا رأيًا.',
    checklist: ['الطرفان محدّدان', 'الدليل على العلاقة', 'جملة ربط صريحة'],
  },
  'اشرح': {
    attendu: 'سلسلة سببية مرتّبة: من الشرط إلى النتيجة.',
    checklist: ['البداية: الشرط', 'الوسط: الآلية بخطواتها', 'النهاية: النتيجة'],
  },
  'وضِّح': {
    attendu: 'جعل المعطى مفهومًا: ما يعنيه، ولماذا وُضع في الموضوع.',
    checklist: ['ما يقوله المعطى', 'ما يعنيه علميًا', 'صلته بالإشكال'],
  },
  'استدلّ': {
    attendu: 'الاستنتاج من الدليل: ماذا تُثبت هذه النتيجة؟',
    checklist: ['الدليل المعتمد', 'ما يثبته بالضبط', 'ما لا يثبته (بلا مبالغة)'],
  },
  'استخلص': {
    attendu: 'جملة تعميم، لا إعادة سرد للمعطيات.',
    checklist: ['جملة واحدة', 'بلا أرقام جديدة', 'تعميم يغطّي الحالة المدروسة'],
  },
  'استنتج': {
    attendu: 'ما يلزم من المعطيات، بجملة واحدة، بالمستوى المطلوب.',
    checklist: ['النتيجة لا الوصف', 'مطابقة للمعطيات', 'بلا معرفة خارج الدرس'],
  },
  'ناقش': {
    attendu: 'اختبار كلّ فرضية بنتيجة، مع القبول أو الرفض المبرّر.',
    checklist: ['كل فرضية على حدة', 'النتيجة التي تختبرها', 'القبول أو الرفض بتبرير'],
  },
  'نصّ علمي': {
    attendu: 'مقدّمة · عرض بالآليات وروابطها · خاتمة تجيب عن الإشكال.',
    checklist: ['مقدّمة تطرح الإشكال', 'عرض بالآليات والروابط', 'خاتمة تجيب'],
  },
  'مخطّط': {
    attendu: 'أسهم مرقّمة، عنوان، وبيانات على كلّ سهم.',
    checklist: ['العنوان', 'الأسهم المرقّمة', 'بيان على كل سهم'],
  },
  'رسم تخطيطي': {
    attendu: 'رسم وظيفي بالبيانات كاملة، بنسب مقبولة.',
    checklist: ['الشكل والبنى', 'البيانات كلها', 'الاتجاهات الوظيفية'],
  },
  'اقترح فرضية': {
    attendu: 'جملة قابلة للاختبار تبدأ بـ«ربّما»، تربط السبب بالأثر.',
    checklist: ['صيغة قابلة للاختبار', 'سبب وأثر', 'بلا جزم'],
  },
  'نصيحة': {
    attendu: 'نصيحة عملية مبرَّرة بالنتائج العلمية للموضوع.',
    checklist: ['النصيحة عملية', 'مبرّرة بنتيجة من الموضوع', 'بلا وعظ'],
  },
};

export const VERBES_ATTENDUS: VerbeConsigne[] = Object.keys(ATTENDU_PAR_VERBE) as VerbeConsigne[];

/** Attendu d'un verbe ; `undefined` si le verbe n'a pas encore d'attendu rédigé. */
export function attenduDe(verbe: VerbeConsigne | string): AttenduVerbe | undefined {
  return ATTENDU_PAR_VERBE[verbe as VerbeConsigne];
}

/** Libellé sobre du statut éditorial, à afficher dans le tiroir. */
export const MENTION_STATUT: Record<StatutEditorial, string> = {
  a_valider_enseignant: 'قواعد طريقة — في انتظار مراجعة أستاذ',
  actif: 'قواعد طريقة معتمدة في التطبيق',
};
