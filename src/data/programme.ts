// البرنامج الرسمي — بكالوريا علوم تجريبية (الجزائر)
// 3 مجالات → 11 وحدة. Le chemin obligatoire compte les leçons des `lessonIds` + un jalon par
// unité ; s'y ajoutent les `prerequis` (rappel mobilisé) et, hors chemin, les `enrichissement`.
// Les résumés dorés décrivent les leçons, pas les jalons.
// المرجع: الكتاب المدرسي الرسمي (طبعة الكتاب المصحح v1.0).
//
// كل وحدة تحمل 4 بيانات معماريّة (OPUS 5.5 MAX):
//   questionAr  — سؤال الوحدة الذي يُجاب عنه في الجسر
//   fenetre     — التدرّب السنوي الرسمي (بالأسابيع، الأسبوع 1 = منتصف سبتمبر)
//   poidsBac    — ثقل الوحدة في البكالوريا (1..5)، تقدير من كتل التمارين في corpus المواضيع
//                 رسميًّا (2013–2026) باحتساب النقاط: نسبة كل وحدة من مجموع النقاط،
//                 مع تقدير تربوي على سلّم 1..5. الجيولوجيا (u9/u10/u11) نزلت إلى 2 لأنها لا تغطي سوى
//                 حصّتها أقلّ في هذا corpus؛ وهذه أوزان تقديرية لا بديل عن مراجعة المدرّس.
//   piegesAr    — فخّان رسميان يظهران في جسر الوحدة

import type { Domaine, Unite } from '../types';
import { calendrierPour } from '../config/annee';

/** بداية الأسبوع 1 — تُقرأ من التقويم المدرسي (src/config/annee.ts)، لا ثابت مدفون هنا. */
export function debutAnnee(isoAujourdhui: string): string {
  return calendrierPour(isoAujourdhui).debut;
}

export const DOMAINES: Domaine[] = [
  {
    id: 'd1',
    titre: 'المجال الأول: التخصص الوظيفي للبروتينات',
    accent: 'forest',
    unites: ['u1', 'u2', 'u3', 'u4', 'u5'],
  },
  {
    id: 'd2',
    titre: 'المجال الثاني: التحوّلات الطاقوية',
    accent: 'gold',
    unites: ['u6', 'u7', 'u8'],
  },
  {
    id: 'd3',
    titre: 'المجال الثالث: التكتونية العامة',
    accent: 'clay',
    unites: ['u9', 'u10', 'u11'],
  },
];

export const UNITES: Unite[] = [
  {
    id: 'u1',
    domaineId: 'd1',
    numero: 1,
    titre: 'تركيب البروتين',
    competence: 'يفسّر آلية تركيب البروتين انطلاقًا من المعلومة الوراثية ويوظفها في حل وضعيات',
    page: 10,
    lessonIds: [
      'd1-u1-l1-expression-genique',
      'phase1_chapitres_1_2',
      'lecon_transcription',
      'phase1_chapitres_1_2_2',
      'phase2_chapitres_3_4',
    ],
    questionAr: 'كيف تنتقل المعلومة الوراثية من النواة لتصبح بروتينًا ينفذ وظيفة في الجسم؟',
    fenetre: { debut: 1, fin: 5 },
    fenetreAr: 'من منتصف سبتمبر إلى منتصف أكتوبر',
    poidsBac: 5,
    piegesAr: [
      'الخلط بين ADN الذي يبقى في النواة و ARNm الذي يحمل نسخة المعلومة إلى الهيولى',
      'القول إن الشفرة الوراثية تُقرأ بالحرف الواحد بدل الثلاثية (الكودون)',
    ],
  },
  {
    id: 'u2',
    domaineId: 'd1',
    numero: 2,
    titre: 'البنية والوظيفة',
    competence: 'يبرز العلاقة بين البنية الفراغية للبروتين ووظيفته البيولوجية',
    page: 39,
    lessonIds: [
      'lecon_representation',
      'phase2_chapitres_3_4_2',
      'phase3_chapitres_5_6',
      // Leçon centrale de 3AS (ch. 8 du manuel) : charge de l'acide aminé et migration
      // électrophorétique. Elle était rangée en prérequis 2AS de l'unité 3, donc placée AVANT
      // le concept d'enzyme ; sa place est ici, avant la structure-fonction.
      'amino_acid_behavior',
    ],
    questionAr: 'لماذا يحدد شكل البروتين الفراغي وظيفته، وكيف يفسر تغيره تغير الوظيفة؟',
    fenetre: { debut: 6, fin: 8 },
    fenetreAr: 'منتصف أكتوبر إلى بداية نوفمبر',
    poidsBac: 4,
    piegesAr: [
      'القول إن تغير حمض أميني واحد يغير الشكل فقط دون الوظيفة',
      'الخلط بين البنية الثانوية (الالتفاف) والبنية الثلاثية (الطي الفراغي)',
    ],
  },
  {
    id: 'u3',
    domaineId: 'd1',
    numero: 3,
    titre: 'النشاط الإنزيمي',
    competence: 'يوظف المعارف المتعلقة بالنشاط الإنزيمي لتفسير سرعة وتخصص التفاعلات الخلوية',
    page: 57,
    // Aucun prérequis 2AS ici : l'ancien `enzyme_inhibitors` obligeait l'élève à étudier les
    // inhibiteurs (Vmax, Km) AVANT le concept d'enzyme. Il devient la dernière leçon de l'unité,
    // une fois `d1-u3-l1-enzyme` (influence de [S], Vmax) vu.
    prerequis: [],
    lessonIds: [
      'phase3_chapitres_5_6_2',
      'lecon_activite_structure',
      'phase4_chapitres_7_8',
      'phase4_chapitres_7_8_2',
      'd1-u3-l1-enzyme',
      'enzyme_inhibitors',
    ],
    questionAr: 'لماذا تتسارع التفاعلات الخلوية وتتخصص رغم ظروف الخلية القاسية؟',
    fenetre: { debut: 9, fin: 13 },
    fenetreAr: 'من نوفمبر إلى بداية ديسمبر',
    poidsBac: 4,
    piegesAr: [
      'القول إن الإنزيم يُستهلك أثناء التفاعل فيتحول إلى ناتج',
      'الخلط بين تأثير pH وتأثير درجة الحرارة على الموقع النشط',
    ],
  },
  {
    id: 'u4',
    domaineId: 'd1',
    numero: 4,
    titre: 'الدفاع عن الذات',
    competence: 'يفسّر آليات الدفاع عن الذات انطلاقًا من الاستجابة المناعية الخلطية والخلوية',
    page: 73,
    // Le rappel de génétique (allèles, codominance, HLA) ouvre l'unité : il était en 9ᵉ et
    // dernière position, donc à étudier APRÈS le VIH/SIDA qu'il est censé préparer.
    prerequis: ['prerequis2AS_genetique'],
    lessonIds: [
      'phase5_chapitres_9_10',
      'phase5_chapitres_9_10_2',
      'phase6_chapitres_11_12',
      'phase6_chapitres_11_12_2',
      'phase7_chapitres_13_14',
      'phase7_chapitres_13_14_2',
      'immunity_memory_response',
      'immunity_hiv_aids',
    ],
    questionAr: 'كيف يتعرف الجسم على ما ليس منه، وكيف يذكّر غزواته السابقة ليكون أسرع؟',
    fenetre: { debut: 13, fin: 19 },
    fenetreAr: 'من ديسمبر إلى نهاية جانفي',
    poidsBac: 5,
    piegesAr: [
      'القول إن الجسم المضاد يقتل المستضد بنفسه',
      'الخلط بين الاستجابة الخلطية (LB والأجسام المضادة) والاستجابة الخلوية (LTc)',
    ],
  },
  {
    id: 'u5',
    domaineId: 'd1',
    numero: 5,
    titre: 'الاتصال العصبي',
    competence: 'يفسّر آلية الاتصال العصبي والإدماج العصبي وتأثير المخدرات على المشابك',
    page: 127,
    lessonIds: [
      'phase8_chapitres_15_16',
      'phase8_chapitres_15_16_2',
      'phase9_chapitres_17_18',
      'phase9_chapitres_17_18_2',
      'phase10_chapitres_19_20',
    ],
    questionAr: 'كيف تتحول السيالة العصبية إلى قرار، وكيف تعدّل المخدرات والمورفين هذا التحول؟',
    fenetre: { debut: 20, fin: 24 },
    fenetreAr: 'فيفري إلى بداية مارس',
    poidsBac: 5,
    piegesAr: [
      'القول إن السيالة العصبية تنتقل بالكهرباء عبر الفراغ المشبكي',
      'الخلط بين كمون الراحة (المولد للكهرباء) وكمون العمل (السيالة)',
    ],
  },
  {
    id: 'u6',
    domaineId: 'd2',
    numero: 6,
    titre: 'التركيب الضوئي',
    competence: 'يفسّر آلية تحويل الطاقة الضوئية إلى طاقة كيميائية قابلة للاستثمار',
    page: 174,
    // Ordre pédagogique : chaque expérience fondatrice vient APRÈS la leçon qu'elle démontre
    // (Hill & Ruben après la phase photochimique, Jagendorf après le couplage, Calvin après
    // la phase chimique), au lieu d'arriver après la leçon de synthèse.
    lessonIds: [
      'phase10_chapitres_19_20_2',
      'phase11_chapitres_21_22_2',
      'd2-u6-l1-hill-ruben',
      'd2-u6-l2-jagendorf',
      'phase12_chapitres_23_24',
      'd2-u6-l3-calvin',
      'phase12_chapitres_23_24_2',
    ],
    questionAr: 'من أين يأتي الأكسجين والسكر، وكيف تُخزن طاقة الشمس في روابط الجزيئات؟',
    fenetre: { debut: 25, fin: 28 },
    fenetreAr: 'مارس إلى بداية أفريل',
    poidsBac: 4,
    piegesAr: [
      'القول إن الأكسجين المنطلق في التركيب الضوئي مصدره CO₂',
      'الخلط بين المرحلة الكيميوضوئية (الضوء وتدرج H⁺) والمرحلة الكيميوحيوية (كالفن)',
    ],
  },
  {
    id: 'u7',
    domaineId: 'd2',
    numero: 7,
    titre: 'التنفّس الخلوي وإنتاج ATP',
    competence: 'يفسّر آلية إنتاج الطاقة الخلوية (ATP) انطلاقًا من الأكسدة التنفسية',
    page: 205,
    lessonIds: [
      'phase13_chapitres_25_26',
      'phase13_chapitres_25_26_2',
      'phase14_chapitres_27_28',
      'd2-u7-l1-mitchell-racker',
      'phase14_chapitres_27_28_2',
    ],
    questionAr: 'من أين تأتي طاقة الحياة، وكيف يُصنع الـ ATP حتى حين ينقطع الأكسجين؟',
    fenetre: { debut: 28, fin: 30 },
    fenetreAr: 'أفريل',
    poidsBac: 3,
    piegesAr: [
      'القول إن الـ ATP يُركب فقط داخل الميتوكندرون',
      'الخلط بين التحلل السكري (السيتوبلازم) والفسفرة التأكسدية (الميتوكندرون)',
    ],
  },
  {
    id: 'u8',
    domaineId: 'd2',
    numero: 8,
    titre: 'وحدة إثرائية: توظيف المكتسبات الطاقوية',
    competence: 'يوظف المكتسبات الطاقوية لحل وضعيات شاملة',
    page: 227,
    lessonIds: ['phase15_chapitres_29_30', 'phase15_chapitres_29_30_2'],
    questionAr: 'كيف تتكامل التحوّلات الطاقوية في كائن حي ومنظومة بيئية كاملة؟',
    fenetre: { debut: 30, fin: 31 },
    fenetreAr: 'أفريل (وحدة إثرائية)',
    poidsBac: 1,
    piegesAr: ['القول إن دورة الطاقة مستقلة عن دورة المادة في المنظومة'],
  },
  {
    id: 'u9',
    domaineId: 'd3',
    numero: 9,
    titre: 'النشاط التكتوني للصفائح',
    competence: 'يفسّر حركية الصفائح التكتونية وانعكاساتها على سطح الأرض',
    page: 237,
    lessonIds: [
      'phase16_chapitres_31_32',
      'phase16_chapitres_31_32_2',
      'phase17_chapitres_33_34',
      'phase18_chapitres_35_36',
      'phase18_chapitres_35_36_2',
    ],
    questionAr: 'لماذا تتحرك قارات الأرض، وماذا ينتج عن حركتها على السطح؟',
    fenetre: { debut: 31, fin: 33 },
    fenetreAr: 'أفريل إلى بداية ماي',
    poidsBac: 2,
    piegesAr: [
      'القول إن التيارات الحملية تحمل الصفائح من أعلاها مباشرة',
      'الخلط بين مناطق الغوص (تنخفض) ومناطق الاتساع (تتسع)',
    ],
  },
  {
    id: 'u10',
    domaineId: 'd3',
    numero: 10,
    titre: 'بنية الكرة الأرضية',
    competence: 'يستخرج بنية الكرة الأرضية انطلاقًا من نتائج الدراسات الجيوفيزيائية',
    page: 259,
    lessonIds: ['phase19_chapitres_37_38', 'phase19_chapitres_37_38_2', 'phase20_chapitres_39_40'],
    questionAr: 'كيف عرفنا أن باطن الأرض طبقات، وأن نواتها الخارجية سائلة، دون أن نحفرها؟',
    fenetre: { debut: 33, fin: 35 },
    fenetreAr: 'ماي',
    poidsBac: 2,
    piegesAr: [
      'القول إن النواة الخارجية صلبة لأن الضغط فيها هائل',
      'الخلط بين البذرة (النواة الداخلية الصلبة) والبرنس (الوشاح السفلي الصلب)',
    ],
  },
  {
    id: 'u11',
    domaineId: 'd3',
    numero: 11,
    titre: 'البنيات الجيولوجية الناتجة عن النشاط التكتوني',
    competence: 'يربط بين البنيات الجيولوجية للقشرة والنشاط التكتوني للصفائح',
    page: 287,
    lessonIds: [
      'phase17_chapitres_33_34_2',
      'phase20_chapitres_39_40_2',
      'phase21_chapitres_41_42',
      'phase21_chapitres_41_42_2',
      'd3-u11-l1-migmatite',
    ],
    // Hors du chemin obligatoire : ces deux leçons (دورة الصخور، الموارد الجيولوجية في الجزائر)
    // ne figurent pas dans la liste officielle des activités de 3AS SE, qui s'arrête à
    // « شواهد محيط قديم ». Leur contenu reste disponible (enrichissement), mais l'élève ne les
    // rencontre plus sur le chemin verrouillé — il ne peut donc plus être bloqué par une leçon
    // hors programme à trois semaines du Bac.
    enrichissement: ['phase22_chapitres_43_44', 'phase22_chapitres_43_44_2'],
    questionAr: 'كيف يصنع النشاط التكتوني جبال إيفرست وسهل متيجة والبنيات المطوية للشمال الجزائري؟',
    fenetre: { debut: 35, fin: 38 },
    fenetreAr: 'ماي إلى نهاية ماي',
    poidsBac: 2,
    piegesAr: [
      'الخلط بين المغماتية (انصهار جزئي) والانصهار الكامل للصخر',
      'القول إن الطيات تنشأ من تمدد القشرة لا من تقلصها',
    ],
  },
];

export const UNITE_PAR_ID: Record<string, Unite> = Object.fromEntries(UNITES.map((u) => [u.id, u]));

// ───────────── الطريق: كل بند مرتّب، لا طريق آخر نحو المحتوى ─────────────

export type ItemChemin = { type: 'lecon'; id: string } | { type: 'jalon'; uniteId: string };

export function idJalon(uniteId: string): string {
  return `jalon:${uniteId}`;
}

export function idUniteDeJalon(jalonId: string): string {
  return jalonId.slice(6);
}

// المتطلبات السابقة تُفتح قبل دروس الوحدة مباشرة
export const CHEMIN: ItemChemin[] = UNITES.flatMap((u) => [
  ...(u.prerequis ?? []).map((id) => ({ type: 'lecon' as const, id })),
  ...u.lessonIds.map((id) => ({ type: 'lecon' as const, id })),
  { type: 'jalon' as const, uniteId: u.id },
]);

export const TOTAL_ITEMS = CHEMIN.length;
/**
 * Toutes les leçons servies : le chemin obligatoire + les leçons d'enrichissement.
 * `TOTAL_LECONS` compte le **chemin** (ce que l'élève doit faire) ; `TOUTES_LECONS` sert aux
 * écrans qui doivent trouver une leçon quelle que soit sa place (recherche, lecteur).
 */
export const TOTAL_LECONS = CHEMIN.filter((item) => item.type === 'lecon').length;
export const LECONS_ENRICHISSEMENT = UNITES.flatMap((u) => u.enrichissement ?? []);
export const TOUTES_LECONS = [...CHEMIN.flatMap((item) => item.type === 'lecon' ? [item.id] : []), ...LECONS_ENRICHISSEMENT];

// عناوين الدروس — مأخوذة حرفياً من تسميات الأنشطة الرسمية
export const TITRES_LECONS: Record<string, string> = {
  // U1
  'd1-u1-l1-expression-genique': 'تقديم الوحدة: من المورثة إلى البروتين',
  phase1_chapitres_1_2: 'مقرّ تركيب البروتين',
  lecon_transcription: 'الاستنساخ',
  phase1_chapitres_1_2_2: 'الشفرة الوراثية وتنشيط الأحماض الأمينية',
  phase2_chapitres_3_4: 'مراحل الترجمة',
  // U2
  lecon_representation: 'النمذجة الفراغية (Rastop)',
  phase2_chapitres_3_4_2: 'مستويات البنية الفراغية',
  phase3_chapitres_5_6: 'البنية والوظيفة (تجربة أنفنصن)',
  // U3
  phase3_chapitres_5_6_2: 'مفهوم الإنزيم',
  lecon_activite_structure: 'النشاط الإنزيمي وعلاقته بالبنية',
  phase4_chapitres_7_8: 'تأثير درجة الحموضة (pH)',
  phase4_chapitres_7_8_2: 'تأثير درجة الحرارة',
  'd1-u3-l1-enzyme': 'تأثير تركيز الركيزة على سرعة التفاعل',
  // U4
  phase5_chapitres_9_10: 'الذات واللاذات ونظام CMH',
  phase5_chapitres_9_10_2: 'الزمر الدموية (ABO و Rh)',
  phase6_chapitres_11_12: 'مصدر الأجسام المضادة',
  phase6_chapitres_11_12_2: 'المعقد المناعي والبلعمة',
  phase7_chapitres_13_14: 'الاستجابة المناعية الخلوية (LTc)',
  phase7_chapitres_13_14_2: 'تنسيق الاستجابة (LT4 و IL-2)',
  immunity_memory_response: 'الاستجابة المناعية الذاكرة',
  immunity_hiv_aids: 'اختيار نمط الاستجابة وفقدان المناعة المكتسبة',
  prerequis2AS_genetique: 'متطلبات سابقة في علم الوراثة',
  // U5
  phase8_chapitres_15_16: 'الكمون الكهربائي للراحة',
  phase8_chapitres_15_16_2: 'الكمون الكهربائي للعمل',
  phase9_chapitres_17_18: 'النقل المشبكي',
  phase9_chapitres_17_18_2: 'الإدماج العصبي',
  phase10_chapitres_19_20: 'تأثير المخدرات على المشابك',
  // U6
  phase10_chapitres_19_20_2: 'مقرّ التركيب الضوئي',
  phase11_chapitres_21_22_2: 'المرحلة الكيميوضوئية',
  phase12_chapitres_23_24: 'المرحلة الكيميوحيوية وحلقة كالفن',
  phase12_chapitres_23_24_2: 'التكامل بين المرحلتين',
  'd2-u6-l1-hill-ruben': 'تجربة هيل وروبن (1937 / 1941)',
  'd2-u6-l2-jagendorf': 'تجربة جاغندورف (1966)',
  'd2-u6-l3-calvin': 'تجربة كالفن',
  // U7
  phase13_chapitres_25_26: 'التحلّل السكري',
  phase13_chapitres_25_26_2: 'حلقة كريبس',
  phase14_chapitres_27_28: 'الفسفرة التأكسدية',
  phase14_chapitres_27_28_2: 'الوسط اللاهوائي والتخمّر',
  'd2-u7-l1-mitchell-racker': 'تجربة ميتشل وراكر (1961 / 1974)',
  // U8
  phase15_chapitres_29_30: 'التحوّلات الطاقوية الخلوية',
  phase15_chapitres_29_30_2: 'دورة الطاقة والمادة',
  // U9
  phase16_chapitres_31_32: 'تحديد الصفائح التكتونية',
  phase16_chapitres_31_32_2: 'اتساع قاع المحيط والمغناطيسية القديمة',
  phase17_chapitres_33_34: 'الظواهر المرتبطة بالغوص',
  phase18_chapitres_35_36: 'الطاقة الداخلية للكرة الأرضية',
  phase18_chapitres_35_36_2: 'تيارات الحمل الحراري محرك الصفائح',
  // U10
  phase19_chapitres_37_38: 'الموجات الزلزالية',
  phase19_chapitres_37_38_2: 'التركيب الكيميائي للصخور',
  phase20_chapitres_39_40: 'النمذجة البنيوية للأرض',
  // U11
  phase17_chapitres_33_34_2: 'الانصهار الجزئي في مناطق الغوص',
  phase20_chapitres_39_40_2: 'شواهد التقلص: الطيات والفوالق',
  phase21_chapitres_41_42: 'المغماتية وتشكّل اللوح المحيطي',
  phase21_chapitres_41_42_2: 'التضاريس الناجمة عن التصادم',
  phase22_chapitres_43_44: 'دورة الصخور في الطبيعة',
  phase22_chapitres_43_44_2: 'الموارد الجيولوجية والطاقوية في الجزائر',
  'd3-u11-l1-migmatite': 'المغماتيت وشواهد التقلص',
  // دروس كانت مصنّفة « متطلبات سابقة » وليست كذلك (أعيدت إلى وحداتها)
  enzyme_inhibitors: 'تثبيط الإنزيمات (آخر درس في الوحدة)',
  amino_acid_behavior: 'سلوك الأحماض الأمينية وهجرتها الكهربائية',
};

export function titreLecon(lessonId: string): string {
  return TITRES_LECONS[lessonId] ?? lessonId;
}

export function titreItem(item: ItemChemin): string {
  if (item.type === 'lecon') return titreLecon(item.id);
  const u = UNITE_PAR_ID[item.uniteId];
  return `جسر الوحدة ${u.numero}: ${u.titre}`;
}

// مفتاح نصّي ثابت لكل بند — يستعمل لمقارنة بنود الطريق وreact keys
export function cleItem(item: ItemChemin): string {
  return item.type === 'lecon' ? `L:${item.id}` : `J:${item.uniteId}`;
}

export function uniteDeLecon(lessonId: string): Unite | undefined {
  return UNITES.find(
    (u) =>
      u.lessonIds.includes(lessonId) ||
      Boolean(u.prerequis?.includes(lessonId)) ||
      Boolean(u.enrichissement?.includes(lessonId)),
  );
}

export function uniteDeItem(item: ItemChemin): Unite | undefined {
  if (item.type === 'lecon') return uniteDeLecon(item.id);
  return UNITE_PAR_ID[item.uniteId];
}
