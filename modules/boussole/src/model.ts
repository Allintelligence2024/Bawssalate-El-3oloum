/** لا يُفتح دفتر الإصدار السابق ولا يقرأه هذا النموذج. */
export const points = [
  [3, 1],
  [5, 4],
  [7, 8],
  [9, 3],
  [11, 1],
] as const;
export const warmPrompt = "استخرج قيمة نشاط الإنزيم عندما تكون درجة الحموضة 9.";
export function reading(x: number) {
  const point = points.find((p) => p[0] === x);
  if (!point) return null;
  const [ph, y] = point;
  if (ph === 9)
    return {
      right: true,
      title: "الشرط صحيح، والقراءة 3 وحدات اعتبارية.",
      body: "قرأ التلميذ 8 عند درجة الحموضة 7. أمّا عند درجة الحموضة 9 فنقرأ 3 على محور النشاط. تكفي هنا القيمة ووحدتها عند الشرط المطلوب.",
    };
  if (ph === 7)
    return {
      right: false,
      title: "8 قراءة صحيحة، لكن عند درجة الحموضة 7.",
      body: "هذه نقطة القمّة التي قرأها التلميذ. السؤال لا يطلب أكبر نشاط. ابحث عن 9 على المحور الأفقي واختر النقطة المقابلة لها.",
    };
  const amount = y === 1 ? "وحدة اعتبارية واحدة" : `${y} وحدات اعتبارية`;
  return {
    right: false,
    title: `اخترت درجة الحموضة ${ph}.`,
    body: `النشاط عندها ${amount}، لكن الشرط في السؤال هو درجة الحموضة 9. انطلق من 9 على المحور الأفقي وحاول مجدداً.`,
  };
}
export const solo = {
  question:
    "استخرج تركيز الأجسام المضادّة في اليوم 21 بعد التلقيح، مع ذكر الوحدة.",
  days: [0, 7, 14, 21],
  levels: [0, 2, 9, 5],
  reference:
    "في اليوم 21 بعد التلقيح بلغ تركيز الأجسام المضادّة 5 وحدات اعتبارية.",
};
export const instructions = [
  "بيّن باستغلالك لنتائج الشكل (ب) العلاقة بين أنواع المشابك الممثّلة في الشكل (أ) والمبلّغات العصبية المدروسة.",
  "أبرز مختلف الظواهر الناتجة عن وصول الرسالة العصبية إلى نهاية العصبون (ع1) اعتمادا على الشكل (أ).",
  "اشرح كيف تتدخل البروتينات الغشائية على مستوى المشابك في كبح وصول الرسالة العصبية إلى العضلة وتأمين استرخائها وذلك باستغلال معطيات الشكل (ب) من الوثيقة (2).",
] as const;
export const pivot = "ما الذي تضيفه الوثيقة 2 ولا تبيّنه الوثيقة 1 وحدها؟";
export const sources = {
  exam: "https://drive.google.com/file/d/12B1vbw5OP1MBkJEJU121f1Ph8apNuf6v/view",
  correction:
    "https://drive.google.com/file/d/1MVcF_q24A014thaFa589991aKP2l-s4L/view",
};
export const codes: Record<number, string> = {
  1: "شوارد الكالسيوم",
  2: "مستقبل غابا من النمط ب",
  3: "شوارد البوتاسيوم",
  4: "شوارد الكلوريد",
  5: "مستقبل غابا من النمط أ",
  6: "المبلّغ العصبي غابا",
  7: "شوارد الصوديوم",
};
export const traceTypes = [
  ["spike", "rest", "rise"],
  ["dip", "spike", "dip"],
  ["rest", "rest", "rise"],
  ["dip", "rest", "dip"],
] as const;
export const traceText = {
  spike: "قمة تتجاوز الصفر ثم عودة إلى كمون الراحة",
  rest: "كمون ثابت عند سالب 70 ميلي فولط",
  rise: "ارتفاع عابر فوق كمون الراحة دون بلوغ الصفر",
  dip: "انخفاض عابر تحت كمون الراحة",
};
export const traceRows = [
  "تنبيه العصبون 1",
  "تنبيه العصبون 2",
  "حقن الغلوتامات في س",
  "حقن غابا في س",
];
export type Page = "protein-doc" | "warm" | "solo" | "doc1" | "doc2" | "answer";
export const names: Record<Page, string> = {
  "protein-doc": "وثيقة اللامينين",
  warm: "صحّح الإجابة",
  solo: "أجرّب بمفردي",
  doc1: "الوثيقة 1",
  doc2: "الوثيقة 2",
  answer: "ورقة الإجابة",
};
export const route = (s: string): Page =>
  Object.prototype.hasOwnProperty.call(names, s.replace(/^#/, ""))
    ? (s.replace(/^#/, "") as Page)
    : "warm";
export type Journal = {
  version: 1;
  solo: string;
  link: string;
  first: string;
  events: string;
  inhibit: string;
  soloHelp: boolean;
  docHelp: boolean;
};
export const empty = (): Journal => ({
  version: 1,
  solo: "",
  link: "",
  first: "",
  events: "",
  inhibit: "",
  soloHelp: false,
  docHelp: false,
});
export type Writing = "solo" | "link" | "first" | "events" | "inhibit";
export function decode(raw: string | null): Journal {
  const fresh = empty();
  if (!raw) return fresh;
  try {
    const o = JSON.parse(raw);
    if (!o || o.version !== 1 || typeof o !== "object") return fresh;
    for (const k of ["solo", "link", "first", "events", "inhibit"] as const)
      if (typeof o[k] === "string") fresh[k] = o[k];
    for (const k of ["soloHelp", "docHelp"] as const) fresh[k] = o[k] === true;
    return fresh;
  } catch {
    return fresh;
  }
}
export function exportText(j: Journal): string {
  return [
    "بوصلة العلوم | ورشة الإجابة",
    "محاولتي المستقلة",
    solo.question,
    j.solo || "لم أدوّن إجابة هنا.",
    "بكالوريا 2022 | الموضوع 1، التمرين 2",
    ...(["first", "events", "inhibit"] as const).flatMap((k, i) => [
      instructions[i],
      j[k] || "لم أدوّن إجابة هنا.",
    ]),
    "سؤال ربط من بوصلة (اختياري)",
    pivot,
    j.link || "لم أدوّن ملاحظة هنا.",
  ].join("\n\n");
}
