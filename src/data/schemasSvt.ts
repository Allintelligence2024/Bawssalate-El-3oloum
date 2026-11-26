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
    id: 'schema-u2-drepanocytose',
    lessonId: 'phase3_chapitres_5_6',
    uniteId: 'u2',
    typeVisuel: 'svg_vectoriel',
    fichier: 'u2-drepanocytose.svg',
    largeur: 1200,
    hauteur: 700,
    titreAr: 'فقر الدم المنجلي: من استبدال حمض أميني واحد إلى تغيّر شكل الكرية',
    altAr:
      'ثلاثة ألواح: هيموغلوبين سليم مع غلوتاميك مشحون وكرية دموية مقعّرة، ثم هيموغلوبين HbS بفالين كاره للماء وألياف متراصة، ثم كرية منجلية مشوّهة.',
    legendeAr:
      '<span><strong>المخطط</strong> — استبدال الغلوتاميك بالفالين في الموضع 6 من السلسلة β يخلق رقعة لاصقة؛ تتراص جزيئات HbS في ألياف تشوّه الكرية إلى شكل منجلي.</span>',
    annotations: [
      { num: 1, x: 82.5, y: 75.4, labelAr: 'كرية دموية حمراء سليمة', detailAr: 'قرص مقعّر الوجهين، مرن، يمرّ في الشعيرات الدقيقة' },
      { num: 2, x: 73.7, y: 28.6, labelAr: 'الهيموغلوبين HbA', detailAr: 'أربع تحت وحدات: سلسلتان α وسلسلتان β' },
      { num: 3, x: 92.7, y: 48.3, labelAr: 'الغلوتاميك Glu6', detailAr: 'حمض أميني مشحون سالبًا على سطح السلسلة β' },
      { num: 4, x: 58.5, y: 44, labelAr: 'الطفرة: استبدال Glu6 بـ Val6', detailAr: 'الفالين كاره للماء يخلق رقعة لاصقة على سطح الجزيء' },
      { num: 5, x: 48.7, y: 60.9, labelAr: 'ألياف HbS المتراصة', detailAr: 'تراص الجزيئات المتجاورات يكوّن أليافًا صلبة داخل الكرية' },
      { num: 6, x: 17.9, y: 47.1, labelAr: 'كرية دموية منجلية', detailAr: 'التشوّه يعيق المرور في الشعيرات ويسبب فقر الدم المنجلي' },
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
  // ───────────────────────────────────────────────────────────────────────────
  // U4 — Domaine 1 : immunologie (Lot 2)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'schema-u4-cmh',
    lessonId: 'phase5_chapitres_9_10',
    uniteId: 'u4',
    typeVisuel: 'svg_vectoriel',
    fichier: 'u4-cmh.svg',
    largeur: 1200,
    hauteur: 700,
    titreAr: 'جزيئتا CMH-I وCMH-II: أي خلية تعرض أي ببتيد؟',
    altAr:
      'مخططان متقابلان: خلية منوّاة عادية تعرض ببتيدًا داخليًا على CMH-I، وخلية عارضة للمستضد تعرض ببتيدًا خارجيًا على CMH-II.',
    legendeAr:
      '<span><strong>الوثيقة</strong> — CMH-I موجود على سطح كل الخلايا المنوّاة ويعرض ببتيدات داخلية؛ CMH-II خاص بالخلايا العارضة للمستضد ويعرض ببتيدات خارجية.</span>',
    annotations: [
      { num: 1, x: 58.3, y: 30, labelAr: 'جزيئة CMH-I', detailAr: 'توجد على سطح كل الخلايا المنوّاة، وتُعرّف LTc بمحتواها الداخلي' },
      { num: 2, x: 71.7, y: 25.4, labelAr: 'الببتيد المستضدي المعروض', detailAr: 'قطعة بروتينية داخلية تُثبَّت في أخدود CMH-I' },
      { num: 3, x: 78.5, y: 71.4, labelAr: 'النواة والـADN', detailAr: 'مصدر الببتيدات الداخلية المعروضة على CMH-I' },
      { num: 4, x: 16.8, y: 33.7, labelAr: 'CMH-II مع ببتيد خارجي', detailAr: 'يُلتقط الببتيد من البلعمة ثم يُعرض على CMH-II' },
      { num: 5, x: 27.5, y: 80, labelAr: 'خلية عارضة للمستضد (CPA)', detailAr: 'بلعم أو خلية تغصنية تعرض المستضد لـLT4' },
    ],
    statut: 'a_valider_enseignant',
    reviewed: false,
  },
  {
    id: 'schema-u4-groupes-abo',
    lessonId: 'phase5_chapitres_9_10_2',
    uniteId: 'u4',
    typeVisuel: 'svg_vectoriel',
    fichier: 'u4-groupes-abo.svg',
    largeur: 1200,
    hauteur: 780,
    titreAr: 'الزمر الدموية ABO: المستضدات الغشائية والأجسام المضادة الطبيعية',
    altAr:
      'أربع خلايا دموية: A تحمل مستضد A وأجسامًا مضادة لـB، B تحمل مستضد B وأجسامًا مضادة لـA، AB تحمل المستضدين بلا أجسام، O تحمل المادة H فقط مع الأجسام المضادة لـA وB، أسفلها ظاهرة التراص.',
    legendeAr:
      '<span><strong>الوثيقة</strong> — الزمرة تُحدَّد بالمستضدات الغشائية (A، B، أو المادة H عند O)، والمصل يحمل الأجسام المضادة الطبيعية للزمرة الغائبة، فتحدث البلعمة والتراص عند التلقيح غير المتوافق.</span>',
    annotations: [
      { num: 1, x: 10, y: 19.2, labelAr: 'مستضد A', detailAr: 'سكر غشائي خاص بالزمرة A (أو AB)' },
      { num: 2, x: 35, y: 19.2, labelAr: 'مستضد B', detailAr: 'سكر غشائي خاص بالزمرة B (أو AB)' },
      { num: 3, x: 87.2, y: 19.5, labelAr: 'المادة H', detailAr: 'سكر أولي لا يُحوَّل عند الزمرة O' },
      { num: 4, x: 34.2, y: 51.5, labelAr: 'جسم مضاد طبيعي مضاد لـA', detailAr: 'موجود في مصل الزمرة B دون تحسيس سابق' },
      { num: 5, x: 10.5, y: 51.5, labelAr: 'جسم مضاد طبيعي مضاد لـB', detailAr: 'موجود في مصل الزمرة A، وهو سبب عدم التوافق' },
      { num: 6, x: 50.8, y: 84.6, labelAr: 'ظاهرة التراص', detailAr: 'شبكة مستضد–جسم مضاد تكشفها الملاحظة المجهرية' },
    ],
    statut: 'a_valider_enseignant',
    reviewed: false,
  },
  {
    id: 'schema-u4-phagocytose',
    lessonId: 'phase6_chapitres_11_12_2',
    uniteId: 'u4',
    typeVisuel: 'svg_vectoriel',
    fichier: 'u4-phagocytose.svg',
    largeur: 1200,
    hauteur: 720,
    titreAr: 'البلعمة: من المعقد المناعي إلى الهضم داخل البلاعم',
    altAr:
      'أربع مراحل: معقد مناعي (مستضد محاط بأجسام مضادة)، تثبيته على مستقبل Fc لبلعم، انطواء الغشاء وتشكّل الفجوة البلعمية، ثم اندماج الليزوزوم وهضم المستضد.',
    legendeAr:
      '<span><strong>الوثيقة</strong> — Ag–Ac ← تثبيت على مستقبل Fc ← بلعمة (انطواء الغشاء) ← فجوة بلعمية ← اندماج مع الليزوزوم ← هضم.</span>',
    annotations: [
      { num: 1, x: 15.8, y: 34.7, labelAr: 'المستضد (Ag)', detailAr: 'جسم غريب يُحيط به الجهاز المناعي' },
      { num: 2, x: 15.8, y: 26.1, labelAr: 'الجسم المضاد (Ac)', detailAr: 'يرتبط بالمستضد فيُشكّل معقدًا مناعيًا' },
      { num: 3, x: 34.2, y: 41.7, labelAr: 'مستقبل Fc', detailAr: 'يتعرّف على الجزء الثابت من الجسم المضاد' },
      { num: 4, x: 56, y: 42.5, labelAr: 'انطواء الغشاء البلعمي', detailAr: 'يحيط بالمعقد ثم ينغلق مشكّلًا حويصلة' },
      { num: 5, x: 63.5, y: 48.6, labelAr: 'الفجوة البلعمية', detailAr: 'حويصلة داخلية تحمل المستضد محصورًا' },
      { num: 6, x: 90.2, y: 46.4, labelAr: 'الاندماج مع الليزوزوم', detailAr: 'إنزيمات الهضم تحلّل المستضد إلى قطع صغيرة' },
    ],
    statut: 'a_valider_enseignant',
    reviewed: false,
  },
  {
    id: 'schema-u4-ltc-perforine',
    lessonId: 'phase7_chapitres_13_14',
    uniteId: 'u4',
    typeVisuel: 'svg_vectoriel',
    fichier: 'u4-ltc-perforine.svg',
    largeur: 1200,
    hauteur: 700,
    titreAr: 'الخلية التائية القاتلة LTc: تعرّف مزدوج ثم برفورين',
    altAr:
      'يسارًا: خلية مصابة يلامسها LTc، بمستقبل TCR يتعرّف على الببتيد المعروض على CMH-I وقرص CD8. يمينًا: LTc تفرز البرفورين الذي يُحدث ثقوبًا في غشاء الخلية الهدف فتدخلها الماء وتتحلّل.',
    legendeAr:
      '<span><strong>الوثيقة</strong> — التعرّف المزدوج (TCR على CMH-I + CD8) يُفعّل LTc، فتفرز البرفورين: ثقوب ← دخول الماء ← صدمة حلولية.</span>',
    annotations: [
      { num: 1, x: 35.5, y: 67.1, labelAr: 'الخلية التائية القاتلة LTc', detailAr: 'تنتمي إلى المناعة الخلوية وتقتل الخلايا المصابة' },
      { num: 2, x: 33, y: 57.1, labelAr: 'المستقبل TCR', detailAr: 'يتعرّف على الببتيد المعروض على CMH-I' },
      { num: 3, x: 42.3, y: 57.7, labelAr: 'القرص CD8', detailAr: 'يُثبّت التلامس مع الجزء الثابت من CMH-I' },
      { num: 4, x: 35.5, y: 50.3, labelAr: 'CMH-I مع الببتيد', detailAr: 'إشارة «خلية مصابة» تعرض بروتينات الفيروس' },
      { num: 5, x: 55.2, y: 61.4, labelAr: 'البرفورين', detailAr: 'بروتين يُحدث ثقوبًا في غشاء الخلية الهدف' },
      { num: 6, x: 86.7, y: 57.7, labelAr: 'الصدمة الحلولية', detailAr: 'دخول الماء وتضخّم الخلية الهدف ثم تحلّلها' },
    ],
    statut: 'a_valider_enseignant',
    reviewed: false,
  },
  {
    id: 'schema-u4-cooperation-lt4',
    lessonId: 'phase7_chapitres_13_14_2',
    uniteId: 'u4',
    typeVisuel: 'svg_vectoriel',
    fichier: 'u4-cooperation-lt4.svg',
    largeur: 1200,
    hauteur: 780,
    titreAr: 'التعاون الخلوي: LT4 تُفرز IL-2 فتنشّط LB وLTc',
    altAr:
      'مخطط: خلية عارضة للمستضد تُنشّط LT4، التي تُفرز IL-2؛ فتنقسم خلايا LB وتتمايز إلى خلايا بلازمية مفرزة للأجسام المضادة، وتتمايز LTc إلى خلايا قاتلة نشطة.',
    legendeAr:
      '<span><strong>المخطط</strong> — CPA ← LT4 ← IL-2 ← تمايز LB إلى خلايا بلازمية (أجسام مضادة) وLTc إلى خلايا قاتلة نشطة.</span>',
    annotations: [
      { num: 1, x: 86.7, y: 46.8, labelAr: 'خلية عارضة للمستضد', detailAr: 'تعرض المستضد على CMH-II فتُنشّط LT4' },
      { num: 2, x: 62.1, y: 42.3, labelAr: 'الخلية التائية LT4', detailAr: 'منسّقة الاستجابة المناعية، تتعرّف على CMH-II' },
      { num: 3, x: 69.8, y: 61, labelAr: 'الإنترلوكين IL-2', detailAr: 'رسول كيميائي يُفرزه LT4 فينشّط LB وLTc' },
      { num: 4, x: 58.3, y: 15.1, labelAr: 'خلية B (LB)', detailAr: 'تتكاثر بتأثير IL-2 ثم تتمايز' },
      { num: 5, x: 42.5, y: 15.1, labelAr: 'خلية بلازمية', detailAr: 'تفرز أجسامًا مضادة نوعية ضد المستضد' },
      { num: 6, x: 58.3, y: 75.4, labelAr: 'خلية LTc خاملة', detailAr: 'تحتاج إلى IL-2 لتصبح قاتلة' },
      { num: 7, x: 42.5, y: 75.4, labelAr: 'خلية LTc نشطة', detailAr: 'تقتل الخلايا المصابة بالبرفورين' },
    ],
    statut: 'a_valider_enseignant',
    reviewed: false,
  },
  {
    id: 'schema-u4-vih',
    lessonId: 'immunity_hiv_aids',
    uniteId: 'u4',
    typeVisuel: 'svg_vectoriel',
    fichier: 'u4-vih.svg',
    largeur: 1200,
    hauteur: 760,
    titreAr: 'تطوّر تعداد LT4/mm³ عبر مراحل الإصابة بفيروس HIV',
    altAr:
      'منحنى: انخفاض مفاجئ لتعداد LT4 عند بداية الإصابة ثم ارتفاع مصلي، فطور كمون بطيء، ثم انخفاض حاد تحت عتبة 200 LT4/mm³ في مرحلة السيدا.',
    legendeAr:
      '<span><strong>المنحنى</strong> — انقلاب مصلي ← طور كمون سريري ← انخفاض تحت 200 LT4/mm³ ← أمراض انتهازية (السيدا)، مع مقارنة حالة المعالجة.</span>',
    annotations: [
      { num: 1, x: 14.9, y: 54.3, labelAr: 'الانقلاب المصلي', detailAr: 'ظهور الأجسام المضادة المضادة للفيروس في الدم' },
      { num: 2, x: 52.5, y: 51.2, labelAr: 'طور الكمون السريري', detailAr: 'تعداد LT4 ينخفض ببطء دون أعراض واضحة' },
      { num: 3, x: 87.6, y: 15.8, labelAr: 'منطقة السيدا', detailAr: 'مرحلة تتكاثر فيها الأمراض الانتهازية' },
      { num: 4, x: 63.9, y: 70.1, labelAr: 'عتبة 200 LT4/mm³', detailAr: 'تحت هذه القيمة يُشخَّص نقص المناعة المكتسبة' },
      { num: 5, x: 90.9, y: 71.6, labelAr: 'انهيار المناعة', detailAr: 'غياب المعالجة يُفضي إلى انخفاض لا رجعة فيه' },
    ],
    statut: 'a_valider_enseignant',
    reviewed: false,
  },
  // ───────────────────────────────────────────────────────────────────────────
  // U5 — Domaine 1 : الاتصال العصبي (Lot 2)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'schema-u5-potentiel-repos',
    lessonId: 'phase8_chapitres_15_16',
    uniteId: 'u5',
    typeVisuel: 'svg_vectoriel',
    fichier: 'u5-potentiel-repos.svg',
    largeur: 1200,
    hauteur: 700,
    titreAr: 'أصل كمون الراحة: توزيع الشوارد ومضخة Na⁺/K⁺',
    altAr:
      'مقطع غشاء عصبي: شوارد Na⁺ عالية خارجًا وK⁺ عالية داخلًا، قناة تسرب K⁺، ومضخة Na⁺/K⁺ تستهلك ATP وتُخرج 3 Na⁺ مقابل دخول 2 K⁺، مع كمون غشاء −70 mV.',
    legendeAr:
      '<span><strong>الوثيقة</strong> — عدم تماثل التوزيع + نفاذية انتقائية لـK⁺ + عمل المضخة = كمون راحة قيمته −70 mV.</span>',
    annotations: [
      { num: 1, x: 10, y: 21.4, labelAr: 'شوارد Na⁺', detailAr: 'تركيزها أعلى في الوسط خارج الخلوي' },
      { num: 2, x: 33.3, y: 71.4, labelAr: 'شوارد K⁺', detailAr: 'تركيزها أعلى داخل الخلية' },
      { num: 3, x: 48.6, y: 57.7, labelAr: 'قناة تسرب K⁺', detailAr: 'مفتوحة دائمًا: تسريب بطيء نحو الخارج' },
      { num: 4, x: 73.2, y: 45.7, labelAr: 'مضخة Na⁺/K⁺', detailAr: 'تُخرج 3 Na⁺ مقابل إدخال 2 K⁺' },
      { num: 5, x: 76.8, y: 49.1, labelAr: 'الـATP', detailAr: 'طاقة ضرورية لعمل المضخة (نقل نشط)' },
      { num: 6, x: 69.8, y: 91.4, labelAr: 'كمون الراحة −70 mV', detailAr: 'الفرق الكهربائي بين الوجهين الداخلي والخارجي' },
    ],
    statut: 'a_valider_enseignant',
    reviewed: false,
  },
  {
    id: 'schema-u5-potentiel-action',
    lessonId: 'phase8_chapitres_15_16_2',
    uniteId: 'u5',
    typeVisuel: 'svg_vectoriel',
    fichier: 'u5-potentiel-action.svg',
    largeur: 1200,
    hauteur: 780,
    titreAr: 'مراحل كمون العمل وقانون الكل أو لا شيء',
    altAr:
      'منحنى كمون العمل: كمون راحة −70 mV، عتبة −50 mV، ذروة +30 mV، عودة استقطاب، فرط استقطاب ثم عودة. إلى اليمين، تنبيهان ضعيف وقوي يُنتجان نفس كمون العمل.',
    legendeAr:
      '<span><strong>المنحنى</strong> — تنبيه عتبة ← فتح قنوات Na⁺ ← زوال استقطاب ← عودة استقطاب بـK⁺ ← فرط استقطاب ← عودة إلى الراحة.</span>',
    annotations: [
      { num: 1, x: 18.8, y: 63.5, labelAr: 'كمون الراحة', detailAr: 'القيمة المرجعية قبل التنبيه: −70 mV' },
      { num: 2, x: 32.3, y: 53.7, labelAr: 'عتبة التنبيه', detailAr: 'قيمة −50 mV التي يبدأ عندها كمون العمل' },
      { num: 3, x: 34.9, y: 13.7, labelAr: 'ذروة زوال الاستقطاب', detailAr: 'انفتاح قنوات Na⁺ ودخولها الجماعي (+30 mV)' },
      { num: 4, x: 43.5, y: 50.1, labelAr: 'عودة الاستقطاب', detailAr: 'انغلاق قنوات Na⁺ وخروج K⁺ من الخلية' },
      { num: 5, x: 45.3, y: 75.7, labelAr: 'فرط الاستقطاب', detailAr: 'خروج K⁺ زائد فينزل الكمون تحت −70 mV' },
      { num: 6, x: 82.2, y: 61.5, labelAr: 'قانون الكل أو لا شيء', detailAr: 'شدة كمون العمل ثابتة، وتزداد الترددات فقط' },
    ],
    statut: 'a_valider_enseignant',
    reviewed: false,
  },
  {
    id: 'schema-u5-integration',
    lessonId: 'phase9_chapitres_17_18_2',
    uniteId: 'u5',
    typeVisuel: 'svg_vectoriel',
    fichier: 'u5-integration.svg',
    largeur: 1200,
    hauteur: 720,
    titreAr: 'التكامل العصبي: مشابك منبهة ومثبطة على مستوى القطعة الابتدائية',
    altAr:
      'جسم خلوي عصبي مع محور أسطواني: مشابك منبهة تُدخل Na⁺ (PPSE)، مشابك مثبطة تُدخل Cl⁻ (PPSI)، وتجميع زمني لتنبيهين، ثم توليد كمون العمل انطلاقًا من القطعة الابتدائية.',
    legendeAr:
      '<span><strong>المخطط</strong> — PPSE + PPSI ← تجميع مكاني وزمني ← تكامل في القطعة الابتدائية ← كمون عمل أو لا شيء.</span>',
    annotations: [
      { num: 1, x: 81.3, y: 27.2, labelAr: 'مشبك منبّه', detailAr: 'دخول Na⁺ يُحدث كمون بعد مشبكي استثاري (PPSE)' },
      { num: 2, x: 94.7, y: 14.7, labelAr: 'مشبك مثبّط', detailAr: 'دخول Cl⁻ يُحدث كمونًا تثبيطيًا (PPSI)' },
      { num: 3, x: 94.7, y: 66.1, labelAr: 'التجميع الزمني', detailAr: 'تنبيهات متقاربة زمنيًا تتجمع فيُبلَغ العتبة' },
      { num: 4, x: 49.7, y: 41.7, labelAr: 'القطعة الابتدائية', detailAr: 'مقر تكامل المعلومات: تتقرر فيها الاستجابة' },
      { num: 5, x: 29.3, y: 62.2, labelAr: 'كمون العمل الناتج', detailAr: 'ينتقل على المحور نحو المشابك التالية' },
    ],
    statut: 'a_valider_enseignant',
    reviewed: false,
  },
  {
    id: 'schema-u5-morphine',
    lessonId: 'phase10_chapitres_19_20',
    uniteId: 'u5',
    typeVisuel: 'svg_vectoriel',
    fichier: 'u5-morphine.svg',
    largeur: 1200,
    hauteur: 720,
    titreAr: 'المورفين: مستقبل أفيوني يُعطّل قناة Ca²⁺ ويمنع الألم',
    altAr:
      'مشبك عصبي: المورفين يرتبط بمستقبل أفيوني على النهاية قبل المشبكية، فيُغلق قناة Ca²⁺ ويمنع تحرّر المادة P من الحويصلات نحو المستقبلات بعد المشبكية.',
    legendeAr:
      '<span><strong>الوثيقة</strong> — المورفين ← مستقبل أفيوني ← تعطيل قناة Ca²⁺ ← توقف إفراز المادة P ← لا يصل إحساس الألم.</span>',
    annotations: [
      { num: 1, x: 42.3, y: 63.3, labelAr: 'المورفين', detailAr: 'جزيء خارجي يُشبه الأفيونات الداخلية' },
      { num: 2, x: 41.7, y: 55, labelAr: 'المستقبل الأفيوني', detailAr: 'مستقبل نوعي على النهاية قبل المشبكية' },
      { num: 3, x: 56.7, y: 57.2, labelAr: 'قناة Ca²⁺ معطَّلة', detailAr: 'غياب Ca²⁺ يمنع اندماج الحويصلات' },
      { num: 4, x: 50, y: 27.8, labelAr: 'حويصلات المادة P', detailAr: 'تحتوي ناقل الألم ولا تُفرَّغ' },
      { num: 5, x: 53.7, y: 48.9, labelAr: 'توقف الإفراز', detailAr: 'لا تحرّر للناقل العصبي في الشق المشبكي' },
      { num: 6, x: 43.3, y: 72.2, labelAr: 'مستقبلات المادة P', detailAr: 'بعد مشبكية تبقى دون تنبيه، فيغيب الألم' },
    ],
    statut: 'a_valider_enseignant',
    reviewed: false,
  },
  // ───────────────────────────────────────────────────────────────────────────
  // U6 — Domaine 2 : photosynthèse (Lot 3)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'schema-u6-cycle-calvin',
    lessonId: 'phase12_chapitres_23_24',
    uniteId: 'u6',
    typeVisuel: 'svg_vectoriel',
    fichier: 'u6-cycle-calvin.svg',
    largeur: 1200,
    hauteur: 760,
    titreAr: 'حلقة كالفن: تثبيت CO₂ ثم إرجاع ثم تجديد',
    altAr:
      'مخطط حلقة: RuBP يستقبل ثلاث جزيئات CO₂ فيتكوّن APG، ثم يُرجَع إلى PGAL بفضل ATP وNADPH، ويعود خمسة أسداس PGAL لتجديد RuBP بينما يخرج السدس نحو الغلوكوز.',
    legendeAr:
      '<span><strong>الوثيقة</strong> — التثبيت (RuBP + CO₂ ← APG) ثم الإرجاع (APG + ATP + NADPH ← PGAL) ثم التجديد (5/6 PGAL ← RuBP) مع خروج 1/6 نحو السكريات.</span>',
    annotations: [
      { num: 1, x: 82.9, y: 33.7, labelAr: 'مستقبل CO₂ (RuBP، C5)', detailAr: 'جزيء خماسي الكربون يُثبّت الكربون الغازي' },
      { num: 2, x: 94.5, y: 53.2, labelAr: 'ثلاث جزيئات CO₂', detailAr: 'تدخل الحلقة في مرحلة التثبيت' },
      { num: 3, x: 78.2, y: 54.7, labelAr: 'حمض APG (C3)', detailAr: 'أول مركّب مستقرّ يحمل الكربون المشعّ في تجربة كالفن' },
      { num: 4, x: 51.3, y: 54.7, labelAr: 'سكر PGAL (C3)', detailAr: 'ناتج الإرجاع، وهو أصل السكريات في الحلقة' },
      { num: 5, x: 69.6, y: 71.1, labelAr: 'ATP وNADPH', detailAr: 'طاقة وإرجاع يوفّرهما الغشاء الكيميوضوئي' },
      { num: 6, x: 80, y: 29.7, labelAr: 'تجديد RuBP', detailAr: 'خمسة أسداس PGAL تعود لتجديد المستقبل' },
      { num: 7, x: 29.2, y: 54.7, labelAr: 'غلوكوز (C6)', detailAr: 'سُدس واحد يخرج لبناء السكريات' },
    ],
    statut: 'a_valider_enseignant',
    reviewed: false,
  },
  {
    id: 'schema-u6-calvin-experience',
    lessonId: 'd2-u6-l3-calvin',
    uniteId: 'u6',
    typeVisuel: 'svg_vectoriel',
    fichier: 'u6-calvin-experience.svg',
    largeur: 1200,
    hauteur: 760,
    titreAr: 'تجربة كالفن: تتبّع الكربون المشعّ بالزمن',
    altAr:
      'منحنى بثلاثة مسارات: النشاط الإشعاعي في APG يبلغ ذروته بعد ثوانٍ قليلة، ثم في PGAL، ثم في السكريات، بعد حقن ¹⁴CO₂ في وسط يحتوي طحلبًا أخضر.',
    legendeAr:
      '<span><strong>الوثيقة</strong> — ظهور APG أولًا ثم PGAL ثم السكريات يثبت أن الكربون يمرّ بهذا الترتيب داخل الحلقة.</span>',
    annotations: [
      { num: 1, x: 20.5, y: 19.5, labelAr: 'APG أولًا', detailAr: 'ذروة سريعة بعد خمس ثوانٍ فقط من الحقن' },
      { num: 2, x: 33.7, y: 32.6, labelAr: 'PGAL ثانيًا', detailAr: 'ذروته بعد عشرين ثانية تقريبًا' },
      { num: 3, x: 75.5, y: 39.5, labelAr: 'السكريات أخيرًا', detailAr: 'نشاط إشعاعي يتصاعد ببطء دون ذروة واضحة' },
      { num: 4, x: 9.8, y: 8.7, labelAr: 'حقن ¹⁴CO₂', detailAr: 'لحظة t = 0 في وسط الطحلب الأخضر' },
      { num: 5, x: 49, y: 61.8, labelAr: 'تحوّل APG', detailAr: 'انخفاض نشاطه يدل على استهلاكه في المراحل الموالية' },
    ],
    statut: 'a_valider_enseignant',
    reviewed: false,
  },
  // ───────────────────────────────────────────────────────────────────────────
  // U7 — Domaine 2 : respiration cellulaire (Lot 3)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'schema-u7-glycolyse',
    lessonId: 'phase13_chapitres_25_26',
    uniteId: 'u7',
    typeVisuel: 'svg_vectoriel',
    fichier: 'u7-glycolyse.svg',
    largeur: 1200,
    hauteur: 780,
    titreAr: 'التحلّل السكري: من الغلوكوز إلى حمض البيروفيك',
    altAr:
      'مخطط: غلوكوز سداسي الكربون يُفسفَر باستهلاك 2 ATP ثم ينقسم إلى جزيئي PGAL ثلاثي الكربون، وكل واحد يعطي حمض البيروفيك مع إنتاج 4 ATP و2 NADH، والحصيلة الصافية 2 ATP.',
    legendeAr:
      '<span><strong>الوثيقة</strong> — استثمار 2 ATP ثم انقسام C6 إلى جزيئي C3 ثم استخلاص 4 ATP + 2 NADH، أي حصيلة صافية 2 ATP.</span>',
    annotations: [
      { num: 1, x: 37.7, y: 17.9, labelAr: 'الغلوكوز (C6)', detailAr: 'يُفكَّك في الهيولى الأساسية دون أكسجين' },
      { num: 2, x: 33.7, y: 30.8, labelAr: 'فركتوز 1,6 ثنائي الفوسفات', detailAr: 'المرحلة المستهلكة للطاقة: −2 ATP' },
      { num: 3, x: 23.7, y: 50, labelAr: 'سكر PGAL (C3)', detailAr: 'يتكرّر مرتين بعد انقسام الجزيء الأم' },
      { num: 4, x: 76.3, y: 50, labelAr: 'الجزيء الثاني من PGAL', detailAr: 'نفس التفاعلات تتكرّر مرتين في الآن نفسه' },
      { num: 5, x: 22, y: 71.8, labelAr: 'حمض البيروفيك (C3)', detailAr: 'ناتج التحلّل السكري، يدخل الميتوكندري بوجود O₂' },
      { num: 6, x: 27.5, y: 86.9, labelAr: 'الحصيلة الصافية', detailAr: '2 ATP نافعة + 2 NADH مقابل 4 ATP منتجة إجمالًا' },
    ],
    statut: 'a_valider_enseignant',
    reviewed: false,
  },
  {
    id: 'schema-u7-cycle-krebs',
    lessonId: 'phase13_chapitres_25_26_2',
    uniteId: 'u7',
    typeVisuel: 'svg_vectoriel',
    fichier: 'u7-cycle-krebs.svg',
    largeur: 1200,
    hauteur: 760,
    titreAr: 'حلقة كريبس: أكسدة الأستيل وتحرير النواقل المرجعة',
    altAr:
      'حلقة: أستيل-CoA ثنائي الكربون يندمج مع أوكسالوأسيتات رباعي الكربون فيتكوّن حمض الستريك سداسي الكربون، ثم يُحرّر نزعا كربوكسيل جزيئي CO₂ و3 NADH و1 FADH₂ و1 ATP، ويعود المستقبل.',
    legendeAr:
      '<span><strong>الوثيقة</strong> — لكل دورة: 2 CO₂ + 3 NADH + 1 FADH₂ + 1 ATP، مع تجديد المستقبل أوكسالوأسيتات.</span>',
    annotations: [
      { num: 1, x: 76.7, y: 43.2, labelAr: 'أوكسالوأسيتات (C4)', detailAr: 'المستقبل الذي يندمج مع جزيء الأستيل' },
      { num: 2, x: 50, y: 16.8, labelAr: 'حمض الستريك (C6)', detailAr: 'أول مركّب في الحلقة، ستة كربونات' },
      { num: 3, x: 23.3, y: 43.2, labelAr: 'من C5 إلى C4', detailAr: 'مرحلتا نزع كربوكسيل تُحرّران CO₂' },
      { num: 4, x: 50, y: 84.2, labelAr: 'تجديد OAA', detailAr: 'يعود المستقبل إلى بداية الدورة' },
      { num: 5, x: 68.2, y: 19.7, labelAr: 'جزيئا CO₂', detailAr: 'تحرير كامل لكربون الأستيل على شكل غاز' },
      { num: 6, x: 22.2, y: 31.3, labelAr: 'ثلاثة نواقل NADH', detailAr: 'نواقل مرجعة تنقل الإلكترونات إلى السلسلة التنفسية' },
    ],
    statut: 'a_valider_enseignant',
    reviewed: false,
  },
  {
    id: 'schema-u7-chaine-respiratoire',
    lessonId: 'phase14_chapitres_27_28',
    uniteId: 'u7',
    typeVisuel: 'svg_vectoriel',
    fichier: 'u7-chaine-respiratoire.svg',
    largeur: 1200,
    hauteur: 760,
    titreAr: 'الفسفرة التأكسدية: السلسلة التنفسية ومُركّب ATP',
    altAr:
      'مخطط غشاء الميتوكندري الداخلي: NADH وFADH₂ يغذّيان الناقلين T1 وT2، وتضخّ T1 وT3 وT4 بروتونات نحو الفراغ بين الغشائي، فيعود H⁺ عبر ATP synthase فيتكوّن ATP، والأكسجين يقبل الإلكترونات فيعطي ماءً.',
    legendeAr:
      '<span><strong>الوثيقة</strong> — نقل الإلكترونات ثم ضخّ H⁺ ثم عودة H⁺ عبر ATP synthase تُنتج ATP، والأكسجين هو المستقبل النهائي للإلكترونات.</span>',
    annotations: [
      { num: 1, x: 25, y: 57.9, labelAr: 'الناقل T1', detailAr: 'يتلقّى إلكترونات NADH ويضخّ البروتونات' },
      { num: 2, x: 45, y: 57.9, labelAr: 'الناقل T2', detailAr: 'يتلقّى إلكترونات FADH₂ دون ضخّ بروتونات' },
      { num: 3, x: 65.7, y: 43.4, labelAr: 'ضخّ البروتونات', detailAr: 'T1 وT3 وT4 تضخّ H⁺ نحو الفراغ بين الغشائي' },
      { num: 4, x: 80, y: 57.9, labelAr: 'الناقل T4', detailAr: 'ينقل الإلكترونات إلى الأكسجين' },
      { num: 5, x: 80, y: 31.6, labelAr: 'الأكسجين', detailAr: 'المستقبل النهائي للإلكترونات، ويتحوّل إلى ماء' },
      { num: 6, x: 87.5, y: 57.9, labelAr: 'مركّب ATP synthase', detailAr: 'عودة H⁺ تُحرّك تركيب ATP' },
      { num: 7, x: 87.2, y: 77.9, labelAr: 'ATP المتكوّن', detailAr: 'أكبر رصيد طاقوي تُنتجه الخلية' },
    ],
    statut: 'a_valider_enseignant',
    reviewed: false,
  },
  // ───────────────────────────────────────────────────────────────────────────
  // U8 — Domaine 2 : cycle de la matière et flux d'énergie (Lot 3)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'schema-u8-cycle-matiere-energie',
    lessonId: 'phase15_chapitres_29_30_2',
    uniteId: 'u8',
    typeVisuel: 'svg_vectoriel',
    fichier: 'u8-cycle-matiere-energie.svg',
    largeur: 1200,
    hauteur: 760,
    titreAr: 'دورة المادة وتدفّق الطاقة بين التركيب الضوئي والتنفس',
    altAr:
      'مخططان متقابلان: الصانعة الخضراء تستهلك CO₂ وH₂O وتُنتج غلوكوز وO₂ بفضل الضوء، والميتوكندري يستهلك الغلوكوز وO₂ ويعيد CO₂ وH₂O مع تحرير ATP وحرارة.',
    legendeAr:
      '<span><strong>الوثيقة</strong> — المادة تدور في حلقة مغلقة (CO₂، H₂O، O₂، الغلوكوز) بينما الطاقة تتدفّق في اتجاه واحد: ضوء ← ATP ← حرارة متبددة.</span>',
    annotations: [
      { num: 1, x: 25.8, y: 34.2, labelAr: 'الصانعة الخضراء', detailAr: 'تحوّل الطاقة الضوئية إلى طاقة كيميائية كامنة' },
      { num: 2, x: 74.2, y: 34.2, labelAr: 'الميتوكندري', detailAr: 'يحرّر الطاقة الكامنة في الغلوكوز' },
      { num: 3, x: 50.8, y: 34.5, labelAr: 'ثاني أكسيد الكربون والماء', detailAr: 'ينتقلان من التنفس إلى التركيب الضوئي' },
      { num: 4, x: 50.8, y: 72.1, labelAr: 'O₂ + الغلوكوز', detailAr: 'ينتقلان من التركيب الضوئي إلى التنفس' },
      { num: 5, x: 16.3, y: 8.7, labelAr: 'الطاقة الضوئية', detailAr: 'المصدر الأول للطاقة، ولا يعود إلى الشمس' },
      { num: 6, x: 74.2, y: 84.2, labelAr: 'حرارة متبددة', detailAr: 'الطاقة غير القابلة للاستعمال تخرج من المنظومة' },
    ],
    statut: 'a_valider_enseignant',
    reviewed: false,
  },
];
