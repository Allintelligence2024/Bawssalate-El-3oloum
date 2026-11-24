/* ==========================================================================
   بوصلة العلوم · النسخة الشاملة
   data-svt-3as.js — contenu scientifique exact (3AS Sciences Expérimentales).
   Source de vérité de la phase 1 : الوحدة 1 · تركيب البروتين.
   Les intitulés de compétences C1→C8 sont ceux du pont « جسر البوصلة ».
   ========================================================================== */
(function () {
  "use strict";

  var B = window.Bawssala;

  /* ----------------------------------------------------------------------
     Compétences (8) — reprises telles quelles du pont
     ---------------------------------------------------------------------- */
  var COMPETENCES = [
    { id: "c1", code: "C1", nom: "استخراج المعلومة", verbe: "استخرج" },
    { id: "c2", code: "C2", nom: "تحليل النتائج والمقارنة", verbe: "حلّل" },
    { id: "c3", code: "C3", nom: "التفسير الآلي", verbe: "فسّر" },
    { id: "c4", code: "C4", nom: "الاستدلال بالوثائق", verbe: "استدلّ" },
    { id: "c5", code: "C5", nom: "الاستنتاج والحكم المبرَّر", verbe: "استنتج" },
    { id: "c6", code: "C6", nom: "التمثيل بالمخطط", verbe: "مثّل" },
    { id: "c7", code: "C7", nom: "الكتابة العلمية", verbe: "حرّر" },
    { id: "c8", code: "C8", nom: "الفرضية والنقد العلمي", verbe: "اقترح فرضية" }
  ];

  /* ----------------------------------------------------------------------
     Unité 1 — تركيب البروتين
     ---------------------------------------------------------------------- */
  var UNITE1 = {
    id: "u1",
    numero: 1,
    domaine: "التخصص الوظيفي للبروتينات",
    titre: "تركيب البروتين",
    question:
      "كيف تنتقل المعلومة الوراثية من النواة لتصبح بروتينًا ينفّذ وظيفة؟",
    etapes: ["استنساخ", "نضج وهجرة", "ترجمة"],
    lieux: { transcription: "النواة", traduction: "الهيولى" }
  };

  /* ----------------------------------------------------------------------
     Les 3 manches de la phase 1 — « قاعدة البوصلة 1-2-3 »
     1) بدّل الشرط  2) قارن الدليل  3) جرّب بيدك
     ---------------------------------------------------------------------- */
  var MANCHES = [
    {
      id: "m1",
      pas: 1,
      pasTitre: "بدّل الشرط",
      badge: "محاكاة · باك 2022",
      titre: "الوثيقة: α-amanitine",
      consigne: "أضفنا α-amanitine إلى خلية. شنو يصرا في النواة؟",
      visuel: { type: "cellule", condition: "amanitine" },
      options: [
        {
          id: "a",
          texte: "ARN بوليميراز يتوقّف، فما كاينش ARNm",
          juste: true,
          motif: "التثبيط يمنع الاستطالة، فتتوقّف صناعة ARNm"
        },
        {
          id: "b",
          texte: "ARNm يتصنع، والريبوزوم ما يقراهش.",
          motif: "لو كان ARNm موجودًا لوجدناه في الهيولى."
        },
        {
          id: "c",
          texte: "البروتين يتصنع ناقص في الهيولى.",
          motif: "بلا ARNm، الترجمة ما تبداش أصلًا."
        }
      ],
      retourJuste: "صحيح. الإنزيم وقف، والـARNm ما خرجش.",
      retourFaux: "شوف النواة: الإنزيم واقف. بلا ARNm ما كاين ترجمة.",
      legendeApres: "0 ARNm · 0 بروتين",
      preuve: {
        code: "د1",
        texte: "α-amanitine يثبّط ARN بوليميراز ⇒ انعدام ARNm",
        source: "باك 2022 · وثيقة تجريبية"
      },
      kafaa: { c1: 2, c4: 3 }
    },
    {
      id: "m2",
      pas: 2,
      pasTitre: "قارن الدليل",
      badge: "استدلال علمي",
      titre: "وثيقتان · نفس الخلية",
      consigne: "وثيقتان من باك 2022. أي استنتاج صحيح؟",
      visuel: {
        type: "documents",
        docs: [
          {
            cle: "A",
            titre: "α-amanitine",
            arnm: false,
            proteine: "none",
            valeur: "0 ARNm"
          },
          {
            cle: "B",
            titre: "جينتاميسين",
            arnm: true,
            proteine: "naqis",
            valeur: "ARNm موجود · بروتين ناقص"
          }
        ]
      },
      options: [
        {
          id: "a",
          texte: "α-amanitine يوقف الاستنساخ، والجينتاميسين يوقف الترجمة.",
          juste: true,
          motif: "مستويان مختلفان: النسخ ثم الترجمة."
        },
        {
          id: "b",
          texte: "الاثنان يوقفان الاستنساخ.",
          motif: "عند B، ARNm موجود: النسخ ما توقفش."
        },
        {
          id: "c",
          texte: "الجينتاميسين يوقف الاستنساخ، وα-amanitine يوقف الترجمة.",
          motif: "اعكس الترتيب: A بلا ARNm، B عنده ARNm"
        }
      ],
      retourJuste: "صحيح. وثيقة B تثبت أن الترجمة خطوة مستقلة.",
      retourFaux: "ARNm موجود عند B ⇒ المشكل في الترجمة، ماشي في النسخ.",
      preuve: {
        code: "د2",
        texte: "ARNm موجود بلا بروتين = توقّف الترجمة، لا النسخ.",
        source: "باك 2022 · استدلال بالوثائق"
      },
      kafaa: { c2: 3, c5: 2 }
    },
    {
      id: "m3",
      pas: 3,
      pasTitre: "جرّب بيدك",
      badge: "سلسلة · 3 خطوات",
      titre: "من النواة إلى البروتين",
      consigne: "رتّب السلسلة: من النواة إلى البروتين.",
      visuel: { type: "ordre" },
      items: [
        {
          id: "transcription",
          ordre: 1,
          texte: "استنساخ: ARNm يتصنع في النواة"
        },
        {
          id: "maturation",
          ordre: 2,
          texte: "نضج وهجرة: ARNm يخرج للهيولى"
        },
        {
          id: "traduction",
          ordre: 3,
          texte: "ترجمة: ريبوزوم يبني البروتين"
        }
      ],
      retourJuste: "مضبوط. هكذا تُقرأ الوحدة 1 كسلسلة.",
      retourFaux: "الترتيب: نسخ داخل النواة، ثم هجرة، ثم ترجمة.",
      correctionOptions: [
        {
          id: "juste",
          texte: "الترجمة تحدث في الهيولى على الريبوزوم.",
          juste: true
        },
        {
          id: "faux",
          texte: "الترجمة تحدث في النواة مع الاستنساخ.",
          juste: false
        }
      ],
      preuve: {
        code: "د3",
        texte: "الاستنساخ في النواة، والترجمة في الهيولى.",
        source: "الوحدة 1 · تركيب البروتين"
      },
      kafaa: { c3: 3, c6: 2 }
    }
  ];

  /* ----------------------------------------------------------------------
     Pièges authentiques (préparés pour la phase 5 · صيّاد الفخاخ)
     ---------------------------------------------------------------------- */
  var PIEGES = [
    {
      id: "p1",
      annee: null,
      affirmation: "ARNm يحتوي على T بدل U",
      faux: true,
      correction: "U يعوّض T في ARN فقط. ADN هو الذي يحمل T",
      kafaa: "c1"
    },
    {
      id: "p2",
      annee: 2022,
      affirmation: "الترجمة تحدث داخل النواة.",
      faux: true,
      correction: "الترجمة على الريبوزوم في الهيولى. النواة للاستنساخ.",
      kafaa: "c3"
    },
    {
      id: "p3",
      annee: null,
      affirmation: "ARNt هو الذي يحدّد الحمض الأميني.",
      faux: true,
      correction: "الرامزة على ARNm تحدّد الحمض الأميني؛ ARNt يجلب المطابق.",
      kafaa: "c1"
    },
    {
      id: "p4",
      annee: null,
      affirmation: "كل رامزة توافق حمضًا أمينيًا.",
      faux: true,
      correction: "UAA وUAG وUGA رامزات توقّف بلا حمض أميني.",
      kafaa: "c1"
    },
    {
      id: "p5",
      annee: 2022,
      affirmation: "α-amanitine يثبّط الترجمة مباشرة.",
      faux: true,
      correction: "يثبّط ARN بوليميراز في النواة: يوقف الاستنساخ.",
      kafaa: "c4"
    }
  ];

  /* ----------------------------------------------------------------------
     Cartes SM-2 de départ (révisions réelles de l'unité 1)
     ---------------------------------------------------------------------- */
  var CARTES_DEPART = [
    {
      id: "lecon:u1:transcription",
      famille: "lecon",
      titre: "الاستنساخ · الوحدة 1",
      repere: "النواة · ARN بوليميراز",
      dueAt: 0,
      intervalle: 1,
      facilite: 2.5,
      repetitions: 0
    },
    {
      id: "lecon:u1:traduction",
      famille: "lecon",
      titre: "الترجمة · الوحدة 1",
      repere: "الريبوزوم · ARNm",
      dueAt: 1,
      intervalle: 2,
      facilite: 2.5,
      repetitions: 1
    },
    {
      id: "competence:c4",
      famille: "competence",
      titre: "C4 · الاستدلال بالوثائق",
      repere: "بطاقة كفاءة",
      dueAt: 2,
      intervalle: 3,
      facilite: 2.5,
      repetitions: 1
    }
  ];

  /* ----------------------------------------------------------------------
     Sources et garde-fous éditoriaux
     ---------------------------------------------------------------------- */
  var SOURCES = {
    mention: "مؤشّر توجيهي غير مُعايَر",
    bac: "بكالوريا 2022 · علوم تجريبية · عناصر الإجابة (بتصرّف)",
    noteDroits:
      "الوثائق العلمية مُعاد صياغتها للتدريب. النشر العمومي يحتاج قرار حقوق ومراجعة أستاذ."
  };


  /* ----------------------------------------------------------------------
     Quêtes 3 minutes — الوحدة 1 · تركيب البروتين
     Chaque quête = 3 étapes (بدّل الشرط / قارن الدليل / طبّق) + بطاقة دليل.
     Aucun chrono dur : la durée affichée est une promesse, pas une pression.
     ---------------------------------------------------------------------- */
  var QUETES = [
    {
      id: "q1",
      uniteId: "u1",
      numero: 1,
      titre: "الاستنساخ",
      sous: "كيف تُنسخ المعلومة؟",
      duree: 3,
      lecons: ["مقرّ تركيب البروتين", "الاستنساخ"],
      kafaa: { c1: 1, c4: 2, c5: 1 },
      preuve: {
        code: "د4",
        texte: "ARN بوليميراز يصنع ARNm في النواة.",
        source: "باك 2022 · استرجاع"
      },
      lecon: {
        code: "ب1",
        titre: "الاستنساخ",
        unite: "تركيب البروتين",
        lignes: [
          "ARN بوليميراز يبني ARNm مكمّلًا لِـ ADN، داخل النواة.",
          "ARNm يخضع للنضج ثم يهاجر إلى الهيولى.",
          "α-amanitine يوقف الاستنساخ، فينقص البروتين بالنتيجة."
        ],
        question: "ما دور ARN بوليميراز؟ وأين يعمل؟",
        cle: "يبني ARNm مكمّلًا لِـ ADN، داخل النواة؛ بلا ARNm ما كاينش بروتين.",
        reflexe: "إذا اختفى ARNm، ابحث عن السبب في النواة.",
        source: "الوحدة 1 · باك 2022"
      },
      etapes: [
        {
          id: "e1",
          pas: "بدّل الشرط",
          consigne: "أضفنا α-amanitine إلى نواة خلية. شنو يصرا أوّلًا؟",
          options: [
            {
              id: "a",
              texte: "ARN بوليميراز يتوقّف، فما يتصنعش ARNm",
              juste: true,
              motif: "التثبيط يوقف الاستطالة قبل أي شيء آخر."
            },
            {
              id: "b",
              texte: "ADN يتفكّك، فتضيع المعلومة.",
              juste: false,
              motif: "ADN يبقى سليمًا: الاستنساخ وحده يتوقّف."
            },
            {
              id: "c",
              texte: "البروتين ينقص في الهيولى.",
              juste: false,
              motif: "نقص البروتين نتيجة ثانوية، ماشي أوّل حدث."
            }
          ],
          retourJuste: "مضبوط: الإنزيم يتوقّف قبل كل شيء.",
          retourFaux: "اسأل: شنو أوّل جزيء يتأثّر؟ ماشي النتيجة الأخيرة."
        },
        {
          id: "e2",
          pas: "قارن الدليل",
          consigne: "شنو تستنتج من الوثيقتين؟",
          documents: [
            {
              code: "أ",
              titre: "خلية سليمة · 30 دقيقة",
              texte: "ARNm في الهيولى، وبروتين ظهر."
            },
            {
              code: "ب",
              titre: "خلية + α-amanitine",
              texte: "لا ARNm في الهيولى، لا بروتين."
            }
          ],
          options: [
            {
              id: "a",
              texte: "الاستنساخ شرط لظهور ARNm والبروتين.",
              juste: true,
              motif: "بلا ARNm ما كاينش بروتين: السلسلة تبدأ من النواة."
            },
            {
              id: "b",
              texte: "البروتين يتصنع مباشرة من ADN",
              juste: false,
              motif: "ADN ما يخرجش من النواة، والريبوزوم في الهيولى."
            },
            {
              id: "c",
              texte: "α-amanitine يثبّط الترجمة في الهيولى.",
              juste: false,
              motif: "التثبيط في النواة، والترجمة نقصت بالنتيجة."
            }
          ],
          retourJuste: "صحيح: الوثيقة ب تقطع السلسلة من أوّلها.",
          retourFaux: "قارن: واش النقص جاء من النواة ولا من الهيولى؟"
        },
        {
          id: "e3",
          pas: "طبّق",
          consigne: "أيّ جزيء يحمل نسخة المعلومة إلى الريبوزوم؟",
          options: [
            {
              id: "a",
              texte: "ARNm",
              juste: true,
              motif: "هو الوسيط الذي يخرج من النواة."
            },
            {
              id: "b",
              texte: "ARNt",
              juste: false,
              motif: "ARNt ناقل أحماض أمينية، ماشي نسخة المعلومة."
            },
            {
              id: "c",
              texte: "ADN",
              juste: false,
              motif: "ADN يبقى في النواة."
            }
          ],
          retourJuste: "مضبوط: ARNm هو الرسول.",
          retourFaux: "الرسول هو ARNm، وARNt غير ناقل."
        }
      ]
    },
    {
      id: "q2",
      uniteId: "u1",
      numero: 2,
      titre: "الشفرة الوراثية",
      sous: "علاش ثلاثية؟",
      duree: 3,
      lecons: ["الشفرة الوراثية وتنشيط الأحماض الأمينية"],
      kafaa: { c2: 2, c3: 1, c5: 1 },
      preuve: {
        code: "د5",
        texte: "الشفرة ثلاثية: 3 قواعد = حمض أميني.",
        source: "الكتاب المدرسي · الوحدة 1"
      },
      lecon: {
        code: "ب2",
        titre: "الشفرة الوراثية",
        unite: "تركيب البروتين",
        lignes: [
          "3 قواعد = كودون = حمض أميني واحد.",
          "64 كودونًا لـ20 حمضًا: الشفرة فسيفساء.",
          "AUG بداية، وUAA وUAG وUGA توقّف."
        ],
        question: "علّل: الشفرة الوراثية ثلاثية.",
        cle: "4 قواعد لا تكفي 20 حمضًا؛ 4³ = 64 احتمالًا يغطّيها.",
        reflexe: "لا تُقرأ الشفرة قاعدةً بقاعدة أبدًا.",
        source: "الوحدة 1 · الشفرة الوراثية"
      },
      etapes: [
        {
          id: "e1",
          pas: "بدّل الشرط",
          consigne: "لو قُرئت الشفرة قاعدةً بقاعدة، كم احتمالًا؟",
          options: [
            {
              id: "a",
              texte: "4 فقط، ما تكفيش لـ20 حمضًا.",
              juste: true,
              motif: "4 < 20: الشفرة تحتاج تجميعًا."
            },
            {
              id: "b",
              texte: "20 بالضبط، وحدة لكل حمض.",
              juste: false,
              motif: "العشوائية ما تعطيش 20 بالضبط."
            },
            {
              id: "c",
              texte: "64، وهي كافية.",
              juste: false,
              motif: "64 تطلع من الثلاثية، ماشي من القاعدة."
            }
          ],
          retourJuste: "صحيح: 4 ما تكفيش، فما تكونش ثلاثية.",
          retourFaux: "عدّ: 4 قواعد فقط، والحمضات 20."
        },
        {
          id: "e2",
          pas: "قارن الدليل",
          consigne: "علاش الشفرة ثلاثية تحديدًا؟",
          documents: [
            {
              code: "أ",
              titre: "قراءة قاعدة واحدة",
              texte: "4¹ = 4 احتمالات."
            },
            {
              code: "ب",
              titre: "قراءة ثلاثية",
              texte: "4³ = 64 احتمالًا لـ20 حمضًا."
            }
          ],
          options: [
            {
              id: "a",
              texte: "باش تكفي 20 حمضًا، مع فسيفساء.",
              juste: true,
              motif: "64 > 20: بعض الحمضات عندها عدّة كودونات."
            },
            {
              id: "b",
              texte: "باش كل حمض ياخذ قاعدتين.",
              juste: false,
              motif: "بالقاعدتين: 16 احتمالًا فقط."
            },
            {
              id: "c",
              texte: "لأن ADN فيه أربع قواعد.",
              juste: false,
              motif: "هذا يفسّر 4، ماشي 64."
            }
          ],
          retourJuste: "مضبوط: 64 تغطّي 20 مع فسيفساء.",
          retourFaux: "حسب: 4² = 16، ما تكفيش."
        },
        {
          id: "e3",
          pas: "طبّق",
          consigne: "كم قاعدة تُشفّر حمضًا أمينيًّا واحدًا؟",
          options: [
            {
              id: "a",
              texte: "3 قواعد = كودون.",
              juste: true,
              motif: "الوحدة هي الكودون."
            },
            {
              id: "b",
              texte: "قاعدة واحدة.",
              juste: false,
              motif: "4 احتمالات فقط: غير كافية."
            },
            {
              id: "c",
              texte: "4 قواعد.",
              juste: false,
              motif: "4^4 = 256: أكثر من اللازم."
            }
          ],
          retourJuste: "صحيح: الكودون ثلاثي.",
          retourFaux: "الكودون = 3 قواعد."
        }
      ]
    },
    {
      id: "q3",
      uniteId: "u1",
      numero: 3,
      titre: "الترجمة",
      sous: "كيف يُبنى البروتين؟",
      duree: 3,
      lecons: ["مراحل الترجمة", "الشفرة الوراثية وتنشيط الأحماض الأمينية"],
      kafaa: { c1: 1, c3: 2, c4: 1 },
      preuve: {
        code: "د6",
        texte: "الترجمة تحدث في الهيولى على الريبوزوم.",
        source: "باك 2022 · الترجمة"
      },
      lecon: {
        code: "ب3",
        titre: "الترجمة",
        unite: "تركيب البروتين",
        lignes: [
          "الترجمة تحدث في الهيولى، على الريبوزوم.",
          "ARNt يجلب الحمض الأميني حسب الكودون.",
          "كودون التوقّف ينهي السلسلة ويحرّرها."
        ],
        question: "حدّد دور ARNt في الترجمة.",
        cle: "ينقل الحمض الأميني، ومضاد كودونه يطابق كودون ARNm",
        reflexe: "الكودون على ARNm، ومضاد الكودون على ARNt",
        source: "الوحدة 1 · مراحل الترجمة"
      },
      etapes: [
        {
          id: "e1",
          pas: "بدّل الشرط",
          consigne: "الريبوزوم وصل إلى الكودون UAA. شنو يصرا؟",
          options: [
            {
              id: "a",
              texte: "الترجمة تتوقّف وتنفصل السلسلة.",
              juste: true,
              motif: "UAA كودون توقّف."
            },
            {
              id: "b",
              texte: "يتغيّر الكودون إلى AUG",
              juste: false,
              motif: "الكودون ما يتبدّلش بالقراءة."
            },
            {
              id: "c",
              texte: "يبدأ الاستنساخ من جديد.",
              juste: false,
              motif: "الاستنساخ مكانه النواة."
            }
          ],
          retourJuste: "مضبوط: كودون التوقّف ينهي التركيب.",
          retourFaux: "UAA ماشي كودون حمض أميني."
        },
        {
          id: "e2",
          pas: "قارن الدليل",
          consigne: "شنو دور ARNt في الترجمة؟",
          documents: [
            {
              code: "أ",
              titre: "ARNt في الريبوزوم",
              texte: "معه حمض أميني، ومضاد كودونه يطابق ARNm"
            },
            {
              code: "ب",
              titre: "ARNm بين وحدتي الريبوزوم",
              texte: "يمرّ كودونًا بكودون، والسلسلة تطول."
            }
          ],
          options: [
            {
              id: "a",
              texte: "ينقل الأحماض الأمينية حسب الكودون.",
              juste: true,
              motif: "التطابق مضاد الكودون/الكودون يضمن الترتيب."
            },
            {
              id: "b",
              texte: "يصنع ARNm انطلاقًا من ADN",
              juste: false,
              motif: "هذا عمل ARN بوليميراز."
            },
            {
              id: "c",
              texte: "يشكّل وحدتي الريبوزوم.",
              juste: false,
              motif: "هذا دور ARNr مع البروتينات."
            }
          ],
          retourJuste: "صحيح: ARNt هو الناقل المتخصّص.",
          retourFaux: "فرّق بين ARNm وARNt وARNr"
        },
        {
          id: "e3",
          pas: "طبّق",
          consigne: "وين تحدث الترجمة؟",
          options: [
            {
              id: "a",
              texte: "في الهيولى، على الريبوزوم.",
              juste: true,
              motif: "الريبوزومات في الهيولى أو على الشبكة الفعّالة."
            },
            {
              id: "b",
              texte: "في النواة، مع الاستنساخ.",
              juste: false,
              motif: "النواة فيها الاستنساخ فقط."
            },
            {
              id: "c",
              texte: "في الميتوكوندري فقط.",
              juste: false,
              motif: "الميتوكوندري عنده ترجمة خاصة، ماشي الأساسية."
            }
          ],
          retourJuste: "مضبوط: الهيولى هي الورشة.",
          retourFaux: "الترجمة في الهيولى."
        }
      ]
    },
    {
      id: "q4",
      uniteId: "u1",
      numero: 4,
      titre: "من المورثة إلى البروتين",
      sous: "السلسلة كاملة",
      duree: 3,
      lecons: ["تقديم الوحدة: من المورثة إلى البروتين", "مقرّ تركيب البروتين"],
      kafaa: { c4: 1, c5: 2, c6: 1 },
      preuve: {
        code: "د7",
        texte: "السلسلة: نسخ في النواة، هجرة، ترجمة في الهيولى.",
        source: "الوحدة 1 · تركيب البروتين"
      },
      lecon: {
        code: "ب4",
        titre: "من المورثة إلى البروتين",
        unite: "تركيب البروتين",
        lignes: [
          "نسخ في النواة: ADN ← ARNm",
          "نضج وهجرة نحو الهيولى.",
          "ترجمة على الريبوزوم: ARNm ← بروتين."
        ],
        question: "لخّص في ثلاث خطوات انتقال المعلومة من ADN إلى البروتين.",
        cle: "نسخ في النواة ← نضج وهجرة ← ترجمة على الريبوزوم.",
        reflexe: "ثلاث خطوات، وكلّ خطوة في مكانها.",
        source: "الوحدة 1 · تركيب البروتين"
      },
      etapes: [
        {
          id: "e1",
          pas: "بدّل الشرط",
          consigne: "لو مُنعت هجرة ARNm من النواة؟",
          options: [
            {
              id: "a",
              texte: "ما يتصنعش بروتين.",
              juste: true,
              motif: "بلا هجرة، ما توصلش الرسالة للريبوزوم."
            },
            {
              id: "b",
              texte: "البروتين يتصنع في النواة.",
              juste: false,
              motif: "الريبوزوم ما كاينش في النواة."
            },
            {
              id: "c",
              texte: "الاستنساخ يتوقّف فورًا.",
              juste: false,
              motif: "الاستنساخ مستقل عن الهجرة."
            }
          ],
          retourJuste: "صحيح: الهجرة حلقة إلزامية.",
          retourFaux: "وين يلقى الريبوزوم ARNm؟ في الهيولى."
        },
        {
          id: "e2",
          pas: "قارن الدليل",
          consigne: "شنو تخلص من المقارنة؟",
          documents: [
            {
              code: "أ",
              titre: "خلية أ",
              texte: "ARNm في النواة فقط، بلا بروتين."
            },
            {
              code: "ب",
              titre: "خلية ب",
              texte: "ARNm في الهيولى، وبروتين موجود."
            }
          ],
          options: [
            {
              id: "a",
              texte: "الهجرة شرط لحدوث الترجمة.",
              juste: true,
              motif: "الفرق الوحيد بين الخليتين هو مكان ARNm"
            },
            {
              id: "b",
              texte: "النواة هي مصنع البروتين.",
              juste: false,
              motif: "خلية أ عندها ARNm في النواة وبلا بروتين."
            },
            {
              id: "c",
              texte: "البروتين يمنع هجرة ARNm",
              juste: false,
              motif: "الاتجاه معاكس: الهجرة تسبق البروتين."
            }
          ],
          retourJuste: "مضبوط: قارن المتغيّر الوحيد.",
          retourFaux: "شنو الفرق الوحيد بين أ وب؟"
        },
        {
          id: "e3",
          pas: "طبّق",
          consigne: "أيّ سلسلة صحيحة؟",
          options: [
            {
              id: "a",
              texte: "نسخ ← نضج وهجرة ← ترجمة.",
              juste: true,
              motif: "الترتيب الرسمي للوحدة 1."
            },
            {
              id: "b",
              texte: "ترجمة ← نسخ ← هجرة.",
              juste: false,
              motif: "الترجمة تحتاج ARNm أوّلًا."
            },
            {
              id: "c",
              texte: "هجرة ← نسخ ← ترجمة.",
              juste: false,
              motif: "ما كاينش هجرة قبل النسخ."
            }
          ],
          retourJuste: "صحيح: هذه سلسلة الوحدة 1.",
          retourFaux: "ابدأ من النواة: نسخ."
        }
      ]
    }
  ];


  /* ----------------------------------------------------------------------
     Application Bac — sujet réel 2022 (الدورة الثانية) · التمرين 2 · 7 نقاط
     « الاستدلال العلمي » : α-amanitine ثم الدواء ATAC.
     Les briques sont des éléments de réponse : on compose, on ne rédige pas.
     ---------------------------------------------------------------------- */
  /* ----------------------------------------------------------------------
     Application Bac — sujet réel 2022 (الدورة الثانية) · التمرين 2 · 7 نقاط
     « الاستدلال العلمي » : α-amanitine ثم الدواء ATAC.
     Le mode guidé marche par micro-décisions : lire une pièce, choisir,
     comprendre tout de suite. Les « briques » ne servent plus qu'à la
     synthèse finale (le corrigé assemblé), pas à un QCM géant.
     ---------------------------------------------------------------------- */
  /* Preuves gagnées en terminant l'exercice de bac : elles rejoignent le
     registre commun (tiroir « الأدلة », carte des preuves dans مساري). */
  var BAC_PREUVES = [
    {
      code: "bac-c4",
      source: "بكالوريا 2022 · تمرين 2 · س 1",
      competence: "c4",
      texte:
        "نشاط الإنزيم ينقص عكسيًّا مع التركيز، وα-amanitine يثبّت حلقة TL فيمنع دمج النيكليوتيدات: تتوقّف الاستطالة.",
      figure: { type: "courbe" }
    },
    {
      code: "bac-c5",
      source: "بكالوريا 2022 · تمرين 2 · س 2",
      competence: "c5",
      texte:
        "ATAC = جسم مضاد نوعي + α-amanitine؛ يرتبط ببروتين غشائي خاص ثم يُبلعم، ويفكّكه الليزوزوم، فيتوقّف نمو الورم.",
      figure: { type: "atac" }
    }
  ];

  var BAC = {
    id: "bac-2022-u1",
    annee: 2022,
    session: "الدورة الثانية",
    exercice: 2,
    format: "الاستدلال العلمي · 7 نقاط",
    titre: "α-amanitine: من السّمّ إلى الدواء",
    conseil: "تمرين تدريبي مفتوح. ابدأ بالوثائق، والمفاتيح تجي وحدها.",
    chapeau:
      "α-amanitine مادّة سامّة تثبّط إنزيم ARN بوليميراز. ندرس نشاطه، ثم نستعمل جسمًا مضادًّا (ATAC) لإيصاله إلى الخلايا السرطانية.",
    documents: [
      {
        code: "أ",
        titre: "نشاط الإنزيم",
        figure: { type: "courbe" },
        texte: "الوثيقة أ: النشاط 100 % بلا α-amanitine، و60 % مع 10 µg/ml. التناسب عكسي مع التركيز."
      },
      {
        code: "ب",
        titre: "حلقة TL",
        figure: { type: "tl" },
        texte: "α-amanitine يثبّت الحلقة TL فتحافظ على شكلها، فلا تُدمج نيكليوتيدات جديدة."
      },
      {
        code: "ج",
        titre: "حجم الورم",
        figure: { type: "barres" },
        texte: "بلا دواء: من 200 إلى 2000 mm³. بـ2 mg/kg: ينقص ثم يعاود. بـ4 mg/kg: يختفي من اليوم 15."
      },
      {
        code: "د",
        titre: "آلية ATAC",
        figure: { type: "atac" },
        texte: "جسم مضاد نوعي + جزيئتا α-amanitine؛ يُبلعم، والليزوزوم يفكّكه، فتُحرَّر α-amanitine في النواة."
      }
    ],
    questions: [
      {
        id: "q1",
        points: 3.25,
        competence: "c4",
        intitule: "حلّل الشكلين (أ) و(ب)، ثم فسّر تثبيط α-amanitine",
        cartesUtiles: ["ب1"],
        attendu:
          "النشاط ينقص عكسيًّا مع التركيز؛ التثبّت على الحلقة TL يمنع دمج النيكليوتيدات؛ فتتوقّف الاستطالة في الاستنساخ.",
        briques: [
          { id: "a1", texte: "النشاط ينقص كلّما زاد التركيز: تناسب عكسي.", juste: true },
          { id: "a2", texte: "α-amanitine يثبّت الحلقة TL فيمنع دمج النيكليوتيدات.", juste: true },
          { id: "a3", texte: "النتيجة: توقّف الاستطالة في الاستنساخ.", juste: true },
          { id: "a4", texte: "ARN بوليميراز يعمل في النواة على ADN", juste: true }
        ],
        etapes: [
          {
            id: "q1-e1",
            pas: "الوثيقة",
            doc: "أ",
            consigne: "أيّ وثيقة تبيّن تأثير التركيز؟",
            aide: "شوف المحور: التركيز ← نشاط الإنزيم.",
            cle: "وثيقة أ: تناسب عكسي.",
            options: [
              {
                id: "a",
                texte: "وثيقة أ · نشاط الإنزيم",
                juste: true,
                retour: "النشاط ينقص كلّما زاد التركيز. هذا دليلك الأول."
              },
              {
                id: "b",
                texte: "وثيقة ب · حلقة TL",
                juste: false,
                retour: "وثيقة ب تحكي على الآلية، ماشي على التركيز."
              },
              {
                id: "c",
                texte: "وثيقة ج · حجم الورم",
                juste: false,
                retour: "وثيقة ج على الورم، ماشي على الإنزيم."
              },
              {
                id: "d",
                texte: "وثيقة د · آلية ATAC",
                juste: false,
                retour: "وثيقة د على الدواء، ماشي على الإنزيم."
              }
            ]
          },
          {
            id: "q1-e2",
            pas: "الآلية",
            doc: "ب",
            consigne: "وين يتثبّت α-amanitine بالضبط؟",
            aide: "الوثيقة ب: الحلقة TL",
            cle: "على الحلقة TL",
            options: [
              {
                id: "a",
                texte: "على الحلقة TL",
                juste: true,
                retour: "يتثبّت عليها، فيمنع دمج النيكليوتيدات."
              },
              {
                id: "b",
                texte: "على الريبوزوم",
                juste: false,
                retour: "الريبوزوم للترجمة، وهنا نحن في الاستنساخ."
              },
              {
                id: "c",
                texte: "على غشاء الخلية",
                juste: false,
                retour: "الغشاء يخصّ الدخول، والآلية داخل النواة."
              },
              {
                id: "d",
                texte: "على ARNm",
                juste: false,
                retour: "ARNm هو الناتج، ماشي الهدف."
              }
            ]
          },
          {
            id: "q1-e3",
            pas: "النتيجة",
            doc: "ب",
            consigne: "شنو النتيجة المباشرة على الاستنساخ؟",
            aide: "بلا استطالة، ما كاينش ARNm جديد.",
            cle: "توقّف الاستطالة في الاستنساخ.",
            options: [
              {
                id: "a",
                texte: "توقّف الاستطالة في الاستنساخ",
                juste: true,
                retour: "الإنزيم توقّف، فالنسخ توقّف. هذه النتيجة المباشرة."
              },
              {
                id: "b",
                texte: "توقّف الترجمة على الريبوزوم",
                juste: false,
                retour: "الترجمة تتوقّف كنتيجة ثانية، ماشي مباشرة."
              },
              {
                id: "c",
                texte: "تفكّك ADN",
                juste: false,
                retour: "ADN يبقى سليم؛ الإنزيم هو اللي توقّف."
              },
              {
                id: "d",
                texte: "منع هجرة ARNm",
                juste: false,
                retour: "الهجرة ماشي هي المشكل في هذا السؤال."
              }
            ]
          }
        ]
      },
      {
        id: "q2",
        points: 3.75,
        competence: "c5",
        intitule: "اشرح آلية ATAC، ثم استنتج أثره على الخلية السرطانية.",
        cartesUtiles: ["ب1", "ب4"],
        attendu:
          "جسم مضاد نوعي + α-amanitine؛ ارتباط بالبروتين الغشائي ثم بلعمة؛ تحرير α-amanitine في النواة؛ توقّف الاستنساخ فيتوقّف نمو الورم.",
        briques: [
          { id: "c1", texte: "ATAC = جسم مضاد نوعي + جزيئتا α-amanitine", juste: true },
          { id: "c2", texte: "يرتبط ببروتين غشائي خاص بالخلية السرطانية ثم يُبلعم.", juste: true },
          { id: "c3", texte: "الليزوزوم يفكّك المعقّد فتتحرّر α-amanitine", juste: true },
          { id: "c4", texte: "α-amanitine يوقف الاستنساخ، فيتوقّف نمو الورم.", juste: true }
        ],
        etapes: [
          {
            id: "q2-e1",
            pas: "التركيب",
            doc: "د",
            consigne: "ATAC مركّب من شنو؟",
            aide: "الوثيقة د، السطر الأول.",
            cle: "جسم مضاد نوعي + α-amanitine",
            options: [
              {
                id: "a",
                texte: "جسم مضاد نوعي + α-amanitine",
                juste: true,
                retour: "النوعية هي اللي توجّه الدواء للخلية السرطانية."
              },
              {
                id: "b",
                texte: "جسم مضاد + سكر",
                juste: false,
                retour: "ما كاينش سكر في الوثيقة د."
              },
              {
                id: "c",
                texte: "إنزيم + دواء",
                juste: false,
                retour: "ماشي إنزيم؛ هو جسم مضاد."
              },
              {
                id: "d",
                texte: "مضاد حيوي + فيتامين",
                juste: false,
                retour: "ماشي مضاد حيوي؛ راجع الوثيقة د."
              }
            ]
          },
          {
            id: "q2-e2",
            pas: "الدخول",
            doc: "د",
            consigne: "كيفاش يدخل للخلية السرطانية؟",
            aide: "شوف الترتيب: ارتباط، من بعد بلعمة.",
            cle: "ارتباط نوعي ثم بلعمة.",
            options: [
              {
                id: "a",
                texte: "يرتبط ببروتين غشائي خاص ثم يُبلعم",
                juste: true,
                retour: "الارتباط النوعي هو اللي يخليه يدخل بالبلعمة."
              },
              {
                id: "b",
                texte: "يدخل مباشرة عبر الغشاء",
                juste: false,
                retour: "يحتاج ارتباط نوعي أولًا."
              },
              {
                id: "c",
                texte: "يدخل عبر قناة أيونية",
                juste: false,
                retour: "ما كاينش قناة في الوثيقة."
              },
              {
                id: "d",
                texte: "يبقى في الدم",
                juste: false,
                retour: "يبقى برّا، وما يخدمش على الورم."
              }
            ]
          },
          {
            id: "q2-e3",
            pas: "الأثر",
            doc: "د",
            consigne: "شنو النتيجة على الورم؟",
            aide: "توقّف الاستنساخ ← توقّف نمو الورم.",
            cle: "توقّف الاستنساخ ← توقّف نمو الورم.",
            options: [
              {
                id: "a",
                texte: "توقّف الاستنساخ فيتوقّف نمو الورم",
                juste: true,
                retour: "هذا هو الاستنتاج: بلا نسخ، الخلية ما تقدرش تتكاثر."
              },
              {
                id: "b",
                texte: "الجسم المضاد يحطّم ADN",
                juste: false,
                retour: "ADN ما يتحطّمش؛ الإنزيم هو اللي يتوقّف."
              },
              {
                id: "c",
                texte: "α-amanitine ينشّط الاستنساخ",
                juste: false,
                retour: "بالعكس تمامًا: يوقفه."
              },
              {
                id: "d",
                texte: "الورم يكبر",
                juste: false,
                retour: "الوثيقة ج تبيّن العكس: الورم ينقص."
              }
            ]
          }
        ]
      }
    ]
  };

  /* ----------------------------------------------------------------------
     المرحلة 5 — صيّاد الفخاخ · 8 جمل، نصفها فخاخ
     Règle : une phrase, un choix (فخّ / صحيح), la preuve tout de suite.
     Jamais de chrono qui punit, jamais de Game Over.
     ---------------------------------------------------------------------- */
  var FAKH = [
    {
      id: "f1",
      affirmation: "ARNm فيه T بدل U",
      faux: true,
      correction: "الحرف U يعوّض T في ARN فقط، والـ T يبقى في ADN",
      indice: "شوف الحروف: ADN فيه T، وARN فيه U",
      kafaa: "c1",
      source: null
    },
    {
      id: "f2",
      affirmation: "الاستنساخ يحدث في النواة.",
      faux: false,
      correction: "صحيح. النواة مقر الاستنساخ، والهيولى مقر الترجمة.",
      indice: null,
      kafaa: "c3",
      source: null
    },
    {
      id: "f3",
      affirmation: "الترجمة تحدث داخل النواة.",
      faux: true,
      correction: "لا: الترجمة على الريبوزوم في الهيولى. النواة للاستنساخ فقط.",
      indice: "الريبوزوم وين يكون؟",
      kafaa: "c3",
      source: { annee: 2022, ref: "بكالوريا 2022 · تمرين 1" }
    },
    {
      id: "f5",
      affirmation: "الرامزة على ARNm هي اللي تحدّد الحمض الأميني.",
      faux: false,
      correction: "صحيح. الرامزة = 3 نيكليوتيدات، وARNt يجيب الحمض المطابق.",
      indice: null,
      kafaa: "c1",
      source: null
    },
    {
      id: "f4",
      affirmation: "ARNt هو اللي يحدّد الحمض الأميني.",
      faux: true,
      correction: "الرامزة على ARNm هي اللي تحدّد؛ ARNt ينقل الحمض المطابق فقط.",
      indice: "الرامزة وين محطوطة: على ARNm ولا على ARNt؟",
      kafaa: "c1",
      source: null
    },
    {
      id: "f6",
      affirmation: "كل رامزة توافق حمضًا أمينيًا.",
      faux: true,
      correction: "لا: UAA وUAG وUGA رامزات توقّف، ما توافقش حمض أميني.",
      indice: "شحال من رامزة توقّف عندك؟",
      kafaa: "c1",
      source: null
    },
    {
      id: "f8",
      affirmation: "α-amanitine يوقف الاستنساخ في النواة.",
      faux: false,
      correction: "صحيح. وهذا اللي يفسّر نقص ARNm، ومن بعد نقص البروتين.",
      indice: null,
      kafaa: "c4",
      source: null
    },
    {
      id: "f7",
      affirmation: "α-amanitine يثبّط الترجمة مباشرة.",
      faux: true,
      correction: "لا: يثبّط ARN بوليميراز في النواة ← يوقف الاستنساخ، والترجمة تتوقّف من بعدو.",
      indice: "تذكّر الوثيقة ب: وين كان التوقّف بالضبط؟",
      kafaa: "c4",
      source: { annee: 2022, ref: "بكالوريا 2022 · تمرين 2 · س 1" }
    }
  ];

  var FAKH_PREUVES = [
    {
      code: "fakh-p2",
      source: "بكالوريا 2022 · تمرين 1",
      competence: "c3",
      texte: "الترجمة على الريبوزوم في الهيولى، ماشي في النواة.",
      fakh: "f3"
    },
    {
      code: "fakh-p5",
      source: "بكالوريا 2022 · تمرين 2 · س 1",
      competence: "c4",
      texte: "α-amanitine يثبّط ARN بوليميراز ← يوقف الاستنساخ في النواة.",
      fakh: "f7"
    }
  ];

  B.Donnees = {
    app: { nom: "بوصلة العلوم", version: "النسخة الشاملة · المرحلة 4 · 1.4" },
    competences: COMPETENCES,
    unite1: UNITE1,
    manches: MANCHES,
    quetes: QUETES,
    bac: BAC,
    registrePreuves: MANCHES.map(function (m) {
      return m.preuve;
    })
      .concat(
        QUETES.map(function (q) {
          return q.preuve;
        })
      )
      .concat(BAC_PREUVES)
      .concat(FAKH_PREUVES),
    bacPreuves: BAC_PREUVES,
    fakh: { id: "fakh-u1", items: FAKH },
    fakhPreuves: FAKH_PREUVES,
    pieges: PIEGES,
    cartesDepart: CARTES_DEPART,
    sources: SOURCES,
    regularite: { objectif: 4, fenetre: 7, bouclierMax: 3 },
    plan: { plafond: 5 }
  };

  /* Index pratiques */
  B.Donnees.competenceParId = {};
  COMPETENCES.forEach(function (c) {
    B.Donnees.competenceParId[c.id] = c;
  });

  B.Donnees.mancheParId = {};
  MANCHES.forEach(function (m) {
    B.Donnees.mancheParId[m.id] = m;
  });

  B.Donnees.queteParId = {};
  QUETES.forEach(function (q) {
    B.Donnees.queteParId[q.id] = q;
  });

  B.Donnees.fakhParId = {};
  FAKH.forEach(function (f) {
    B.Donnees.fakhParId[f.id] = f;
  });

  B.Donnees.preuveParCode = {};
  B.Donnees.registrePreuves.forEach(function (p) {
    B.Donnees.preuveParCode[p.code] = p;
  });
})();
