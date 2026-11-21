import { points, solo } from "./model";
export const ids = ["nerve", "enzyme", "immunity", "protein"] as const;
export type Lab = (typeof ids)[number];
export type Bit = 0 | 1;
export type Session = Record<
  Lab,
  { condition: Bit; compared: boolean; thought: Bit | null }
>;
export const freshSession = (): Session => ({
  protein: { condition: 0, compared: false, thought: null },
  nerve: { condition: 0, compared: false, thought: null },
  enzyme: { condition: 0, compared: false, thought: null },
  immunity: { condition: 0, compared: false, thought: null },
});
export function examine(s: Session, k: Lab, condition: Bit): Session {
  return {
    ...s,
    [k]: { ...s[k], condition, compared: s[k].compared || condition === 1 },
  };
}
export function interpret(s: Session, k: Lab, thought: Bit): Session {
  return s[k].compared ? { ...s, [k]: { ...s[k], thought } } : s;
}
export const labFromHash = (h: string) =>
  ids.find((k) => h === "#explore-" + k);
type File = {
  label: string;
  number: string;
  icon: string;
  source: string;
  title: readonly [string, string];
  question: string;
  labels: readonly [string, string];
  measure: string;
  obs: readonly [string, string];
  values?: readonly [number, number];
  prompt: string;
  thoughts: readonly [string, string];
  supported: Bit;
  why: string;
  revise: string;
  path: string;
  next: string;
  invitation: string;
};
export const files: Record<Lab, File> = {
  protein: {
    label: "تركيب البروتين",
    number: "04",
    icon: "layers",
    source: "بكالوريا 2022 · الشكل جـ",
    title: ["لامينين مكتمل،", "هل تتغيّر نسبته؟"],
    question:
      "بدّل تركيز الجنتاميسين واقرأ نسبة التعبير عن البروتين المكتمل لدى المصاب في الوثيقة.",
    labels: ["تركيز 6.25", "تركيز 12.5"],
    measure: "اللامينين المكتمل · نسبة التعبير",
    obs: [
      "عند 6.25 ميكروغرام/مل، النسبة 10٪.",
      "عند 12.5 ميكروغرام/مل، النسبة 20٪.",
    ],
    values: [10, 20],
    prompt: "أيّ استنتاج يسنده العمودان؟",
    thoughts: [
      "زاد التعبير عن البروتين المكتمل بين الشرطين",
      "عادت المورّثة الطافرة إلى حالتها السليمة",
    ],
    supported: 0,
    why: "تضاعفت النسبة من 10٪ إلى 20٪ بين هذين الشرطين. قيس التعبير عن اللامينين، لا تسلسل المورّثة.",
    revise:
      "ما الذي يقيسه ارتفاع العمود: نسبة التعبير عن البروتين أم تسلسل المورّثة؟",
    path: "#protein-doc",
    next: "أفحص أعمدة الشكل الأصلي",
    invitation:
      "واش تلاحظ؟ هل تكفي زيادة البروتين المكتمل للقول إنّ المورّثة تغيّرت؟",
  },
  nerve: {
    label: "المشابك",
    number: "01",
    icon: "pulse",
    source: "بكالوريا 2022 · الوثيقة 1",
    title: ["نفس الجهاز،", "أثرٌ معاكس؟"],
    question:
      "الجهاز ج3 لم يتحرّك. بدّل العصبون المنبَّه وانظر إلى الأثر المسجّل.",
    labels: ["أنبّه ع1", "أنبّه ع2"],
    measure: "الكمون الغشائي · ج3",
    obs: [
      "يرتفع الأثر فوق كمون الراحة ثم يعود إليه.",
      "ينخفض الأثر تحت كمون الراحة ثم يعود إليه.",
    ],
    prompt: "ما الذي تغيّر فعلاً في ج3؟",
    thoughts: ["موضع جهاز التسجيل", "اتجاه تغيّر الكمون"],
    supported: 1,
    why: "في ج3 أثر صاعد مع ع1 ونازل مع ع2. هذا يميّز التنبيه من التثبيط، ولا يحدّد اسم المبلّغ. أيّ سطر حقن يعيد أثر كلّ تنبيه؟",
    revise:
      "ج3 في الموضع نفسه في الحالتين. تتبّع الأثر بالنسبة إلى خطّ الراحة عند سالب 70 ميلي فولط.",
    path: "#doc1-traces",
    next: "أتتبّع التسجيلات في موضوع الباك",
    invitation:
      "واش تلاحظ؟ كيف يعطي الجهاز ج3 أثراً صاعداً مرّة ونازلاً مرّة أخرى؟",
  },
  enzyme: {
    label: "الإنزيمات",
    number: "02",
    icon: "flask",
    source: "قياسات تدريبية · نشاط إنزيمي",
    title: ["إنزيم واحد،", "نشاطان مختلفان؟"],
    question: "ثبّتنا الحرارة وغيّرنا درجة الحموضة. قارن قياسَي النشاط.",
    labels: ["درجة الحموضة 3", "درجة الحموضة 5"],
    measure: "النشاط · وحدة اعتبارية",
    values: [points[0][1], points[1][1]],
    obs: [
      "عند درجة الحموضة 3، النشاط وحدة اعتبارية واحدة.",
      "عند درجة الحموضة 5، النشاط 4 وحدات اعتبارية.",
    ],
    prompt: "أيّ عبارة يسندها القياسان؟",
    thoughts: [
      "النشاط أكبر عند 5 منه عند 3",
      "يستمرّ النشاط في الارتفاع دائماً",
    ],
    supported: 0,
    why: "ارتفع النشاط من 1 إلى 4 بين هذين الشرطين فقط. ارجع إلى المنحنى لتفحص الشروط الأخرى.",
    revise:
      "لدينا قياسان فقط. نستطيع المقارنة بينهما، لا توقّع شكل المنحنى كلّه.",
    path: "#warm",
    next: "أختبر فكرتي على المنحنى",
    invitation: "واش تلاحظ؟ هل تكفي نقطتان لمعرفة أين يبلغ الإنزيم أعلى نشاط؟",
  },
  immunity: {
    label: "المناعة",
    number: "03",
    icon: "antibody",
    source: "قياسات تدريبية · بعد التلقيح",
    title: ["ارتفع التركيز،", "فهل يواصل الارتفاع؟"],
    question:
      "لدينا قياسان بعد التلقيح. بدّل اليوم، ثم اسأل: ماذا نعرف عن اليوم التالي؟",
    labels: ["اليوم 7", "اليوم 14"],
    measure: "تركيز الأجسام المضادّة · وحدة اعتبارية",
    values: [solo.levels[1], solo.levels[2]],
    obs: [
      "في اليوم 7 بلغ التركيز وحدتين اعتباريتين.",
      "في اليوم 14 بلغ التركيز 9 وحدات اعتبارية.",
    ],
    prompt: "هل نعرف الآن تركيز اليوم 21؟",
    thoughts: ["نعم، نكرّر الزيادة نفسها", "لا، نحتاج إلى قياس ذلك اليوم"],
    supported: 1,
    why: "ارتفع التركيز بين اليومين 7 و14. قيمة اليوم 21 تُقرأ من وثيقته ولا تُستنتج بمدّ الخطّ.",
    revise:
      "الزيادة بين قياسين ليست قاعدة للأيام التالية. ابحث عن قياس اليوم المطلوب في الجدول.",
    path: "#solo",
    next: "أبحث عن الدليل على ورقتي",
    invitation:
      "واش تلاحظ؟ إذا ارتفع تركيز الأجسام المضادّة بين قياسين، فهل تعرف قيمة القياس التالي؟",
  },
};
/** لا نشارك المسار المحلي أو الاستعلام أو ما كتبه التلميذ. */
export function sharedQuestion(id: Lab, href: string) {
  const text = files[id].invitation;
  try {
    const u = new URL(href);
    if (
      ["http:", "https:"].includes(u.protocol) &&
      !["127.0.0.1", "localhost", "0.0.0.0", "[::1]"].includes(u.hostname)
    ) {
      return text + "\n" + u.origin + u.pathname + "#explore-" + id;
    }
  } catch {}
  return text;
}
