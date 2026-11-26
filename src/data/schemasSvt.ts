// Schémas créés pour couvrir le programme officiel (Lots 1 à 3) — règle d'or « ZÉRO TEXTE IA ».
//
// Le visuel ne porte JAMAIS de texte généré par un modèle d'image :
//  - `svg_vectoriel` : le SVG est écrit à la main (`scripts/generer-schemas-svt.mjs`) ; les mots
//    latins qu'il contient (pH, Vmax, ARN…) sont des symboles scientifiques contrôlés, pas du
//    texte narratif, et ils sont doublés en arabe par `legendeAr` + `annotations`.
//  - `webp_annote`  : l'image générée est 100 % muette (aucune lettre, aucun chiffre) ; les
//    pastilles numérotées et leurs libellés arabes sont posés par l'application en HTML.
//
// Tout est `a_valider_enseignant` + `reviewed: false` : aucune signature humaine n'existe encore.
// Coordonnées des pastilles : pourcentage depuis le coin supérieur gauche du visuel.

import type { IllustrationLecon } from './illustrationsLecons';

export const SCHEMAS_SVT: IllustrationLecon[] = [
  // ───────────────────────────────────────────────────────────────────────────
  // U1 — Domaine 1 : expression de l'information génétique
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'schema-u1-reticulum-golgi',
    lessonId: 'phase1_chapitres_1_2',
    uniteId: 'u1',
    typeVisuel: 'webp_annote',
    fichier: 'u1-reticulum-golgi.webp',
    largeur: 1200,
    hauteur: 896,
    titreAr: 'البنيات الخلوية المسؤولة عن تركيب البروتين وإفرازه (خلية عنقودية بنكرياسية)',
    altAr:
      'رسم تخطيطي لخلية عنقودية بنكرياسية: نواة ونوية، شبكة هيولية محببة مغطاة بالريبوزومات، جهاز غولجي، حويصلات إفرازية وميتوكندريات.',
    legendeAr:
      '<span><strong>الوثيقة</strong> — مقر تركيب البروتين: الشبكة الهيولية المحببة، ثم جهاز غولجي، ثم الحويصلات الإفرازية (تجربة اللوسين المشع).</span>',
    annotations: [
      { num: 1, x: 42, y: 37, labelAr: 'الشبكة الهيولية المحببة', detailAr: 'مقر دمج الأحماض الأمينية وتركيب السلسلة الببتيدية' },
      { num: 2, x: 60, y: 42, labelAr: 'الريبوزومات المرتبطة بالغشاء', detailAr: 'هي سبب تسمية الشبكة «محببة»، وهي مقر الترجمة' },
      { num: 3, x: 47, y: 19, labelAr: 'جهاز غولجي', detailAr: 'إتمام غلكزة البروتين وتوجيهه نحو الحويصلات' },
      { num: 4, x: 66, y: 15, labelAr: 'الحويصلات الإفرازية', detailAr: 'تخزين البروتين ثم إفرازه خارج الخلية' },
      { num: 5, x: 77, y: 73, labelAr: 'الميتوكندري', detailAr: 'يوفّر الطاقة الضرورية للتركيب والإفراز' },
      { num: 6, x: 18, y: 58, labelAr: 'النواة', detailAr: 'تحتوي المورثة، ولا تُركَّب فيها البروتينات' },
      { num: 7, x: 25, y: 48, labelAr: 'النوية', detailAr: 'تحتوي المعلومة الوراثية وتُصدّر ARNm نحو الهيولى' },
    ],
    statut: 'a_valider_enseignant',
    reviewed: false,
  },
  {
    id: 'schema-u1-flux-information',
    lessonId: 'd1-u1-l1-expression-genique',
    uniteId: 'u1',
    typeVisuel: 'svg_vectoriel',
    fichier: 'u1-flux-information.svg',
    largeur: 1200,
    hauteur: 760,
    titreAr: 'مسار المعلومة الوراثية: من ADN النواة إلى البروتين في الهيولى',
    altAr:
      'مخطط: ADN داخل النواة يُنسَخ إلى ARNm يخرج عبر ثقبة نووية، ثم تُترجَم على الريبوزومات إلى سلسلة ببتيدية.',
    legendeAr:
      '<span><strong>المخطط</strong> — ADN ← (استنساخ داخل النواة) ← ARNm ← (خروج عبر الثقبة النووية) ← (ترجمة على الريبوزوم) ← بروتين.</span>',
    annotations: [
      { num: 1, x: 65.8, y: 25.8, labelAr: 'ADN (سلسلتان متكاملتان)', detailAr: 'يُقرأ على شكل رامزات، ولا يغادر النواة' },
      { num: 2, x: 75, y: 25.8, labelAr: 'إنزيم ARN بوليميراز', detailAr: 'يفتح السلسلتين ويبني ARNm بالتكامل' },
      { num: 3, x: 58.3, y: 40.8, labelAr: 'ARNm حديث التركيب', detailAr: 'نسخة أحادية السلسلة من المورثة' },
      { num: 4, x: 50.2, y: 42.6, labelAr: 'الثقبة النووية', detailAr: 'معبر ARNm من النواة إلى الهيولى' },
      { num: 5, x: 22.9, y: 39.7, labelAr: 'ريبوزوم', detailAr: 'مقر الترجمة، يربط الرامزات بالرامزات المضادة' },
      { num: 6, x: 25, y: 23.2, labelAr: 'السلسلة الببتيدية', detailAr: 'تتطاول بحمض أميني واحد في كل خطوة' },
      { num: 7, x: 32.7, y: 51.6, labelAr: 'متعدد الريبوزوم', detailAr: 'عدة ريبوزومات تُترجم نفس ARNm في الوقت نفسه' },
      { num: 8, x: 70.5, y: 61.8, labelAr: 'النواة', detailAr: 'مقر الاستنساخ؛ ADN لا يخرج منها' },
      { num: 9, x: 10, y: 84.2, labelAr: 'الهيولى', detailAr: 'مقر الترجمة: الريبوزومات والأحماض الأمينية' },
    ],
    statut: 'a_valider_enseignant',
    reviewed: false,
  },
  {
    id: 'schema-u1-transcription',
    lessonId: 'lecon_transcription',
    uniteId: 'u1',
    typeVisuel: 'webp_annote',
    fichier: 'u1-transcription.webp',
    largeur: 1200,
    hauteur: 896,
    titreAr: 'الاستنساخ: فتح ADN وتركيب ARNm داخل النواة',
    altAr:
      'رسم تخطيطي للاستنساخ: حلزون ADN مزدوج يُفتح جزئيًا داخل إنزيم ARN بوليميراز، وسلسلة ARNm خضراء تخرج من الإنزيم.',
    legendeAr:
      '<span><strong>الوثيقة</strong> — الاستنساخ: ARN بوليميراز يفتح ADN ويبني ARNm بالتكامل مع السلسلة المستنسخة.</span>',
    annotations: [
      { num: 1, x: 88, y: 45, labelAr: 'ADN (سلسلتان متكاملتان)', detailAr: 'المعلومة الوراثية محفوظة داخل النواة' },
      { num: 2, x: 49, y: 29, labelAr: 'إنزيم ARN بوليميراز', detailAr: 'يقرأ السلسلة المستنسخة في الاتجاه 3′←5′' },
      { num: 3, x: 52, y: 44, labelAr: 'فتح جزئي للسلسلتين', detailAr: 'منطقة تُفصَل فيها السلسلتان ليُقرأ التتابع' },
      { num: 4, x: 31, y: 70, labelAr: 'ARNm حديث التركيب', detailAr: 'يُبنى في الاتجاه 5′←3′ بالتكامل مع ADN' },
      { num: 5, x: 25, y: 80, labelAr: 'الطرف 5′ الحر', detailAr: 'بداية السلسلة التي تُركَّب أولًا' },
    ],
    statut: 'a_valider_enseignant',
    reviewed: false,
  },
  {
    id: 'schema-u1-code-genetique',
    lessonId: 'phase1_chapitres_1_2_2',
    uniteId: 'u1',
    typeVisuel: 'svg_vectoriel',
    fichier: 'u1-code-genetique.svg',
    largeur: 1200,
    hauteur: 790,
    titreAr: 'الشفرة الوراثية: الرامزة، الرامزة المضادة وتنشيط الأحماض الأمينية',
    altAr:
      'مخطط: ARNm برامزات AUG وGCU، ARNt برامزة مضادة تحمل حمضًا أمينيًا، ومعادلة تنشيط aa-ARNt بوجود ATP.',
    legendeAr:
      '<span><strong>المخطط</strong> — 4 قواعد ← 64 رامزة ← 20 حمضًا أمينيًا؛ وكل حمض أميني يُنشَّط قبل الترجمة عبر aa-ARNt.</span>',
    annotations: [
      { num: 1, x: 16.3, y: 61.5, labelAr: 'الرامزة (كودون)', detailAr: 'ثلاثية قواعد تُقرأ على ARNm انطلاقًا من AUG' },
      { num: 2, x: 13, y: 49.4, labelAr: 'الرامزة المضادة', detailAr: 'تُكمل الرامزة بالتكامل، وهي محددة للحمض الأميني' },
      { num: 3, x: 20.2, y: 38.2, labelAr: 'ARNt (الناقل)', detailAr: 'يحمل حمضًا أمينيًا واحدًا في كل مرة' },
      { num: 4, x: 12.7, y: 31.4, labelAr: 'الحمض الأميني (الميثيونين)', detailAr: 'رامزة البداية AUG تشفّر للميثيونين' },
      { num: 5, x: 79.2, y: 73.2, labelAr: 'الحساب 4³ = 64', detailAr: '64 رامزة مقابل 20 حمضًا أمينيًا فقط' },
      { num: 6, x: 14.2, y: 73.2, labelAr: 'رامزات التوقف', detailAr: 'UAA وUAG وUGA لا تشفّر لأي حمض أميني' },
      { num: 7, x: 73, y: 22.5, labelAr: 'إنزيم التنشيط', detailAr: 'aa + ARNt + ATP ← معقد aa-ARNt + AMP + PPi' },
    ],
    statut: 'a_valider_enseignant',
    reviewed: false,
  },
  {
    id: 'schema-u1-traduction',
    lessonId: 'phase2_chapitres_3_4',
    uniteId: 'u1',
    typeVisuel: 'webp_annote',
    fichier: 'u1-traduction.webp',
    largeur: 1200,
    hauteur: 896,
    titreAr: 'الترجمة على مستوى الريبوزوم: مواقع A وP وسلسلة ببتيدية نامية',
    altAr:
      'رسم تخطيطي للترجمة: ريبوزوم متكون من تحت وحدتين على ARNm، ARNt في الموقعين A وP، سلسلة ببتيدية تخرج من تحت الوحدة الكبرى.',
    legendeAr:
      '<span><strong>الوثيقة</strong> — الترجمة: تثبّت ARNt الحاملة للحمض الأميني في الموقع A وتُشكّل الرابطة الببتيدية، ثم ينتقل الريبوزوم على ARNm.</span>',
    annotations: [
      { num: 1, x: 40, y: 42, labelAr: 'تحت الوحدة الكبرى', detailAr: 'تحتوي على نفق خروج السلسلة الببتيدية' },
      { num: 2, x: 36, y: 75, labelAr: 'تحت الوحدة الصغرى', detailAr: 'تثبّت ARNm وتتحقق من تكامل الرامزة' },
      { num: 3, x: 21, y: 69, labelAr: 'ARNm (الحمض الريبي الرسول)', detailAr: 'يُقرأ في الاتجاه 5′←3′ رامزة بعد رامزة' },
      { num: 4, x: 44, y: 56, labelAr: 'الموقع P', detailAr: 'موقع السلسلة الببتيدية النامية' },
      { num: 5, x: 58, y: 56, labelAr: 'الموقع A', detailAr: 'موقع دخول ARNt الجديد الحامل للحمض الأميني' },
      { num: 6, x: 30, y: 25, labelAr: 'السلسلة الببتيدية', detailAr: 'تتطاول برابطة ببتيدية عند كل رامزة' },
      { num: 7, x: 49, y: 34, labelAr: 'الحمض الأميني المحمول', detailAr: 'مرتبط بالطرف 3′ لـ ARNt' },
      { num: 8, x: 80, y: 44, labelAr: 'ARNt قادم (ناقل)', detailAr: 'يحمل حمضًا أمينيًا ورامزة مضادة مكملة' },
    ],
    statut: 'a_valider_enseignant',
    reviewed: false,
  },

  // ───────────────────────────────────────────────────────────────────────────
  // U2 — Domaine 2 : structure et propriétés des protéines
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'schema-u2-niveaux-structure',
    lessonId: 'phase2_chapitres_3_4_2',
    uniteId: 'u2',
    typeVisuel: 'svg_vectoriel',
    fichier: 'u2-niveaux-structure.svg',
    largeur: 1200,
    hauteur: 880,
    titreAr: 'مستويات البنية الفراغية للبروتين: من الأولية إلى الرابعية',
    altAr:
      'أربعة ألواح: سلسلة أحماض أمينية، ثم لولب α وورقة β، ثم كتلة كروية بروابط ثنائي الكبريت، ثم تجمع تحت وحدات.',
    legendeAr:
      '<span><strong>المخطط</strong> — البنية الأولية ← الثانوية ← الثالثية ← الرابعية؛ الجسور ثنائية الكبريت تُثبّت البنية الثالثية.</span>',
    annotations: [
      { num: 1, x: 88.3, y: 17, labelAr: 'البنية الأولية', detailAr: 'تتابع الأحماض الأمينية بروابط ببتيدية' },
      { num: 2, x: 12.5, y: 17, labelAr: 'البنية الثانوية', detailAr: 'انتظام موضعي: لولب α أو ورقة β' },
      { num: 3, x: 74.2, y: 60, labelAr: 'البنية الثالثية', detailAr: 'انطواء سلسلة واحدة في كتلة كروية' },
      { num: 4, x: 20.8, y: 68.2, labelAr: 'البنية الرابعية', detailAr: 'تجمع تحت وحدتين أو أكثر' },
      { num: 5, x: 82.5, y: 75.5, labelAr: 'الجسر ثنائي الكبريت', detailAr: 'رابطة تكافؤية بين سيستيين تُثبّت الانطواء' },
      { num: 6, x: 29.3, y: 12, labelAr: 'ورقة β', detailAr: 'سلسلتان على استقامة واحدة، يمكن أن تكونا متضادتين' },
      { num: 7, x: 26.7, y: 75.9, labelAr: 'تحت الوحدات', detailAr: 'كل وحدة سلسلة ثالثية مستقلة' },
    ],
    statut: 'a_valider_enseignant',
    reviewed: false,
  },
  {
    id: 'schema-u2-structure-3d',
    lessonId: 'lecon_representation',
    uniteId: 'u2',
    typeVisuel: 'webp_annote',
    fichier: 'u2-structure-3d.webp',
    largeur: 1200,
    hauteur: 896,
    titreAr: 'نمذجة البنية الفراغية للبروتين: النموذج الشريطي (Rastop)',
    altAr:
      'نموذج شريطي لبروتين كروي: أسهم مسطحة تمثل أوراق β، حلقات تربط العناصر البنيوية، وكتلة منطوية في الفضاء.',
    legendeAr:
      '<span><strong>الوثيقة</strong> — النموذج الشريطي يُظهر العناصر البنيوية (لوالب وأوراق β) والانطواء العام للسلسلة، وهو مكمّل للنموذج الكروي والذرّي.</span>',
    annotations: [
      { num: 1, x: 58, y: 33, labelAr: 'ورقة β', detailAr: 'سهم مسطح يدل على اتجاه السلسلة داخل الورقة' },
      { num: 2, x: 25, y: 28, labelAr: 'حلقة (انعطاف)', detailAr: 'تربط بين عناصر البنية الثانوية' },
      { num: 3, x: 40, y: 63, labelAr: 'انطواء السلسلة', detailAr: 'البنية الثالثية: تموضع فراغي محدد' },
      { num: 4, x: 75, y: 73, labelAr: 'النموذج الشريطي', detailAr: 'نمذجة ثلاثية الأبعاد بواسطة الحاسوب (Rastop)' },
      { num: 5, x: 50, y: 50, labelAr: 'تجويف داخل البنية', detailAr: 'فراغ قد يكوّن موقعًا للارتباط في البروتين' },
    ],
    statut: 'a_valider_enseignant',
    reviewed: false,
  },
  {
    id: 'schema-u2-electrophorese',
    lessonId: 'amino_acid_behavior',
    uniteId: 'u2',
    typeVisuel: 'svg_vectoriel',
    fichier: 'u2-electrophorese.svg',
    largeur: 1200,
    hauteur: 820,
    titreAr: 'الهجرة الكهربائية للحمض الأميني حسب pH الوسط',
    altAr:
      'منحنى شحنة الحمض الأميني بدلالة pH مع ثلاث نقاط، وثلاث مسارات هجرة في حوض كهربائي: نحو المهبط في الوسط الحمضي، لا هجرة عند pHi، نحو المصعد في الوسط القاعدي.',
    legendeAr:
      '<span><strong>المخطط</strong> — عند pH = pHi يكون الحمض الأميني متعادل الشحنة (لا يهاجر)؛ حمضي ← شحنة موجبة ← المهبط؛ قاعدي ← شحنة سالبة ← المصعد.</span>',
    annotations: [
      { num: 1, x: 71.4, y: 65.9, labelAr: 'نقطة التعادل الكهربائي pHi = 6', detailAr: 'عندها الشحنة الكلية معدومة' },
      { num: 2, x: 63, y: 23.3, labelAr: 'وسط حمضي: شحنة موجبة', detailAr: 'بروتونات إضافية على مجموعات الأمين' },
      { num: 3, x: 90, y: 74.3, labelAr: 'وسط قاعدي: شحنة سالبة', detailAr: 'فقدان البروتونات من مجموعات الكربوكسيل' },
      { num: 4, x: 16, y: 30, labelAr: 'الهجرة نحو المهبط (−)', detailAr: 'الجزيء الموجب الشحنة ينجذب إلى القطب السالب' },
      { num: 5, x: 37.5, y: 58, labelAr: 'الهجرة نحو المصعد (+)', detailAr: 'الجزيء السالب الشحنة ينجذب إلى القطب الموجب' },
      { num: 6, x: 26.7, y: 38.8, labelAr: 'عند pH = pHi: لا هجرة', detailAr: 'غياب الشحنة الصافية يوقف الحركة' },
    ],
    statut: 'a_valider_enseignant',
    reviewed: false,
  },
  {
    id: 'schema-u2-anfinsen',
    lessonId: 'phase3_chapitres_5_6',
    uniteId: 'u2',
    typeVisuel: 'svg_vectoriel',
    fichier: 'u2-anfinsen.svg',
    largeur: 1200,
    hauteur: 730,
    titreAr: 'تجربة أنفينسن: التمسخ وإعادة الانطواء',
    altAr:
      'ثلاث حالات: بروتين نشط بجسور ثنائي الكبريت، ثم بروتين متمسخ بسلسلة حررت مجموعاتها SH، ثم استرجاع كامل للنشاط بعد إزالة العاملين.',
    legendeAr:
      '<span><strong>المخطط</strong> — اليوريا + β-مركابتوإيثانول ← تمسخ كامل ونشاط 0 %؛ إزالة العاملين ← إعادة انطواء تلقائي ونشاط 100 %.</span>',
    annotations: [
      { num: 1, x: 17.3, y: 54.5, labelAr: 'بنية فراغية نشطة (100 %)', detailAr: 'الحالة الأصلية للبروتين قبل المعالجة' },
      { num: 2, x: 25.5, y: 39.5, labelAr: 'الجسور ثنائية الكبريت ×4', detailAr: 'روابط تكافؤية بين مجموعات SH للسيستيين' },
      { num: 3, x: 33.2, y: 44.1, labelAr: 'اليوريا + β-مركابتوإيثانول', detailAr: 'كاشف يفكك الجسور ويخرّب الروابط الضعيفة' },
      { num: 4, x: 48.5, y: 55.3, labelAr: 'نشاط 0 %: تمسخ كامل', detailAr: 'سلسلة خطية ومجموعات SH حرة' },
      { num: 5, x: 65.7, y: 47.1, labelAr: 'إزالة العاملين بالغسيل', detailAr: 'عودة الشروط الأصلية دون تدخل آخر' },
      { num: 6, x: 90.5, y: 39.5, labelAr: 'استرجاع النشاط 100 %', detailAr: 'المعلومة الفراغية محفوظة في البنية الأولية' },
    ],
    statut: 'a_valider_enseignant',
    reviewed: false,
  },

  // ───────────────────────────────────────────────────────────────────────────
  // U3 — Domaine 3 : l'activité enzymatique
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'schema-u3-complexe-enzyme-substrat',
    lessonId: 'phase3_chapitres_5_6_2',
    uniteId: 'u3',
    typeVisuel: 'webp_annote',
    fichier: 'u3-complexe-enzyme-substrat.webp',
    largeur: 1200,
    hauteur: 896,
    titreAr: 'المعقد إنزيم–ركيزة: التوافق المحرض والنواتج',
    altAr:
      'ثلاث مراحل: ركيزة تقترب من الموقع الفعال، ثم تثبت فيه بتغير شكل الموقع، ثم تتحرر نواتج ويعود الإنزيم سليمًا.',
    legendeAr:
      '<span><strong>الوثيقة</strong> — الإنزيم + الركيزة ← معقد ES ← الإنزيم + النواتج؛ الإنزيم لا يُستهلك ويعاد استخدامه.</span>',
    annotations: [
      { num: 1, x: 17, y: 50, labelAr: 'الإنزيم', detailAr: 'بروتين ذو موقع فعال محدد الشكل' },
      { num: 2, x: 30, y: 28, labelAr: 'الركيزة', detailAr: 'تتجه نحو الموقع الفعال بحركة عشوائية' },
      { num: 3, x: 57, y: 52, labelAr: 'المعقد ES', detailAr: 'التوافق المحرض: يتغير شكل الموقع لاحتواء الركيزة' },
      { num: 4, x: 63, y: 40, labelAr: 'النواتج', detailAr: 'تتحرر بعد كسر أو تشكيل الروابط' },
      { num: 5, x: 82, y: 54, labelAr: 'الإنزيم سليم', detailAr: 'لا يُستهلك في التفاعل، يعاد استخدامه عدة مرات' },
    ],
    statut: 'a_valider_enseignant',
    reviewed: false,
  },
  {
    id: 'schema-u3-specificite',
    lessonId: 'lecon_activite_structure',
    uniteId: 'u3',
    typeVisuel: 'svg_vectoriel',
    fichier: 'u3-specificite.svg',
    largeur: 1200,
    hauteur: 700,
    titreAr: 'تخصص الإنزيم: توافق شكل الموقع الفعال مع الركيزة',
    altAr:
      'إنزيم بموقع فعال على شكل أخدود يستقبل جزيء نشاء ويهدمه إلى مالتوز، بينما لا يتوافق مع السليلوز فيبقى دون تفاعل.',
    legendeAr:
      '<span><strong>المخطط</strong> — التخصص يرجع إلى تكامل بنيوي بين الموقع الفعال والركيزة: النشاء (α-1,4) يُهدم، والسليلوز (β-1,4) لا يُهدم.</span>',
    annotations: [
      { num: 1, x: 67.2, y: 31.7, labelAr: 'الموقع الفعال', detailAr: 'أخدود ذو شكل محدد ينتج عن الانطواء الفراغي' },
      { num: 2, x: 51.7, y: 35.1, labelAr: 'النشاء (ركيزة متوافقة)', detailAr: 'سلاسل غلوكوز مرتبطة بروابط α-1,4' },
      { num: 3, x: 62.3, y: 36, labelAr: 'المعقد ES', detailAr: 'تكامل بنيوي دقيق بين الركيزة والموقع' },
      { num: 4, x: 51.7, y: 70, labelAr: 'السليلوز', detailAr: 'نفس الوحدات، لكن ترتيب الروابط β-1,4 معاكس' },
      { num: 5, x: 61.8, y: 70, labelAr: 'لا يتشكل المعقد ES', detailAr: 'الموقع الفعال غير متكامل مع السليلوز: لا تفاعل' },
      { num: 6, x: 87.9, y: 28.6, labelAr: 'المالتوز', detailAr: 'ناتج التحلل المائي للنشاء' },
    ],
    statut: 'a_valider_enseignant',
    reviewed: false,
  },
  {
    id: 'schema-u3-ph',
    lessonId: 'phase4_chapitres_7_8',
    uniteId: 'u3',
    typeVisuel: 'svg_vectoriel',
    fichier: 'u3-ph.svg',
    largeur: 1200,
    hauteur: 810,
    titreAr: 'تأثير pH الوسط على النشاط الإنزيمي',
    altAr:
      'ثلاث منحنيات جرسية: الببسين عند pH 2، الأميلاز اللعابي عند pH 7، وإنزيمات البنكرياس عند pH 8,5، مع تأين المجموعات الأمينية والكربوكسيلية.',
    legendeAr:
      '<span><strong>المخطط</strong> — لكل إنزيم pH أمثل؛ الانحراف عنه يغيّر تأين الموقع الفعال ويخفض النشاط (تغير شكل الموقع).</span>',
    annotations: [
      { num: 1, x: 19.5, y: 17.3, labelAr: 'الببسين: pH الأمثل 2', detailAr: 'إنزيم المعدة، يعمل في وسط شديد الحموضة' },
      { num: 2, x: 47.5, y: 17.3, labelAr: 'الأميلاز اللعابي: pH الأمثل 7', detailAr: 'يعمل في الفم حيث pH معتدل' },
      { num: 3, x: 55.9, y: 17.3, labelAr: 'إنزيمات البنكرياس: pH 8,5', detailAr: 'تعمل في الوسط القاعدي للأمعاء' },
      { num: 4, x: 36.6, y: 71, labelAr: 'انحراف نحو الحموضة', detailAr: 'تأين غير ملائم لجذور الموقع الفعال' },
      { num: 5, x: 80.2, y: 71.7, labelAr: 'انحراف نحو القاعدية', detailAr: 'تفقد الروابط الضعيفة فتنخفض الفعالية' },
      { num: 6, x: 12.5, y: 92.3, labelAr: 'تأين المجموعات الأمينية والكربوكسيلية', detailAr: 'يتغير بتغير pH فيتغير شكل الموقع الفعال' },
    ],
    statut: 'a_valider_enseignant',
    reviewed: false,
  },
  {
    id: 'schema-u3-temperature',
    lessonId: 'phase4_chapitres_7_8_2',
    uniteId: 'u3',
    typeVisuel: 'svg_vectoriel',
    fichier: 'u3-temperature.svg',
    largeur: 1200,
    hauteur: 800,
    titreAr: 'تأثير درجة الحرارة على النشاط الإنزيمي',
    altAr:
      'منحنى يبدأ من الصفر، يبلغ قمة عند 37 درجة مئوية، يثبت ثم يهبط بسرعة عند 50–60 درجة مئوية إلى الصفر.',
    legendeAr:
      '<span><strong>المخطط</strong> — الحرارة المثلى 37 °م؛ فوق 50 °م يحدث تمسخ غير عكوس، والتبريد قبل التمسخ يوقف النشاط مؤقتًا فقط.</span>',
    annotations: [
      { num: 1, x: 43.2, y: 19.3, labelAr: 'الحرارة المثلى 37 °م', detailAr: 'سرعة التفاعل أقصى ما يمكن' },
      { num: 2, x: 62.7, y: 57.8, labelAr: 'بداية التمسخ', detailAr: 'فوق 50 °م تنكسر الروابط الضعيفة وتتغير البنية' },
      { num: 3, x: 19.6, y: 69.5, labelAr: 'تبريد: توقف مؤقت', detailAr: 'الطاقة الحركية ضعيفة، لكن البنية سليمة' },
      { num: 4, x: 15, y: 88.3, labelAr: 'التبريد عكوس (0–4 °م ⇄ 37 °م)', detailAr: 'عودة النشاط عند إعادة الحرارة المثلى' },
      { num: 5, x: 56.7, y: 88.3, labelAr: 'التسخين القوي غير عكوس (> 60 °م)', detailAr: 'التمسخ نهائي: النشاط لا يعود بعد التبريد' },
    ],
    statut: 'a_valider_enseignant',
    reviewed: false,
  },
  {
    id: 'schema-u3-michaelis',
    lessonId: 'd1-u3-l1-enzyme',
    uniteId: 'u3',
    typeVisuel: 'svg_vectoriel',
    fichier: 'u3-michaelis.svg',
    largeur: 1200,
    hauteur: 800,
    titreAr: 'تأثير تركيز الركيزة على سرعة التفاعل: Km وVmax',
    altAr:
      'منحنى مفرط: السرعة تزداد مع تركيز الركيزة ثم تنحو نحو قيمة عظمى Vmax؛ Km هو تركيز الركيزة الموافق لنصف Vmax.',
    legendeAr:
      '<span><strong>المخطط</strong> — السرعة تتناسب مع [S] في البداية ثم تشبع عند Vmax؛ Km يعبّر عن الألفة بين الإنزيم والركيزة.</span>',
    annotations: [
      { num: 1, x: 18.7, y: 42.7, labelAr: 'Km: تركيز الركيزة عند نصف Vmax', detailAr: 'كلما صغر Km زادت الألفة بين الإنزيم والركيزة' },
      { num: 2, x: 82.6, y: 22.7, labelAr: 'Vmax: تشبع المواقع الفعالة', detailAr: 'كل جزيئات الإنزيم مرتبطة بالركيزة' },
      { num: 3, x: 72.2, y: 36, labelAr: 'نقاط القياس', detailAr: 'منحنى مفرط وليس مستقيمًا' },
      { num: 4, x: 14.6, y: 88.3, labelAr: '[S] ≪ Km: نظام خطي', detailAr: 'السرعة تكاد تتناسب مع تركيز الركيزة' },
      { num: 5, x: 64.2, y: 88.3, labelAr: '[S] ≫ Km: تشبع', detailAr: 'زيادة الركيزة لا ترفع السرعة' },
    ],
    statut: 'a_valider_enseignant',
    reviewed: false,
  },
  {
    id: 'schema-u3-inhibition',
    lessonId: 'enzyme_inhibitors',
    uniteId: 'u3',
    typeVisuel: 'svg_vectoriel',
    fichier: 'u3-inhibition.svg',
    largeur: 1200,
    hauteur: 800,
    titreAr: 'التثبيط التنافسي واللاتنافسي: مقارنة Vmax وKm',
    altAr:
      'ثلاثة منحنيات: الشاهد، المثبط التنافسي بنفس Vmax وKm أعلى، والمثبط اللاتنافسي بـ Vmax أقل وKm ثابت، مع رسوم للموقع الفعال.',
    legendeAr:
      '<span><strong>المخطط</strong> — مثبط تنافسي: يحتل الموقع الفعال ← Km يرتفع وVmax ثابت؛ مثبط لاتنافسي: يتثبت في موقع آخر ← Vmax ينخفض وKm ثابت.</span>',
    annotations: [
      { num: 1, x: 69, y: 25.9, labelAr: 'الشاهد (دون مثبط)', detailAr: 'المرجع: Vmax وKm الأصليان' },
      { num: 2, x: 69, y: 34.2, labelAr: 'المثبط التنافسي', detailAr: 'نفس Vmax، لكن Km يرتفع (ألفة أقل)' },
      { num: 3, x: 69, y: 47.6, labelAr: 'المثبط اللاتنافسي', detailAr: 'Vmax ينخفض، وKm يبقى ثابتًا' },
      { num: 4, x: 32.8, y: 41.5, labelAr: 'ارتفاع Km مع التنافسي', detailAr: 'يلزم تركيز أكبر من الركيزة لنصف Vmax' },
      { num: 5, x: 29.3, y: 83, labelAr: 'المثبط التنافسي في الموقع الفعال', detailAr: 'تنافس مباشر مع الركيزة، يُرفع بالزيادة في [S]' },
      { num: 6, x: 66.2, y: 91, labelAr: 'المثبط اللاتنافسي خارج الموقع', detailAr: 'يغيّر شكل الموقع الفعال فيُخفض Vmax' },
    ],
    statut: 'a_valider_enseignant',
    reviewed: false,
  },
];
