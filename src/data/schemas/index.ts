// مخطّطات للتسمية (P1.6) — 6 مخطّطات ذات أولوية، مرسومة بـ SVG مبسّط داخل التطبيق (بلا صور، بلا شبكة).
// كلّ مخطّط: أشكال زخرفية + مناطق مرقّمة لها اسم. التلميذ ينقر المنطقة ثمّ ينقر البطاقة المناسبة.
// المحتوى مطابق لمصطلحات الملخّصات الذهبية؛ يُراجَع في تدفّق P0.5 (مطابقة الرسم للكتاب المدرسي).

export interface ZoneSchema {
  id: string;
  nom: string;
  /** موضع الرقم (إحداثيات viewBox) */
  x: number;
  y: number;
}

export interface FormeSchema {
  type: 'rect' | 'ellipse' | 'path' | 'line' | 'circle' | 'text';
  attrs: Record<string, string | number>;
  texte?: string;
}

export interface Schema {
  id: string;
  titre: string;
  unite: number;
  /** الدرس المرجعي لفتحه بعد التمرين */
  lessonHint: string;
  viewBox: string;
  formes: FormeSchema[];
  zones: ZoneSchema[];
}

const G = '#2f5d50';
const S = '#cfe3d6';
const O = '#d9b45b';
const C = '#c47a5a';

export const SCHEMAS: Schema[] = [
  {
    id: 'synapse',
    titre: 'المشبك الكيميائي',
    unite: 5,
    lessonHint: 'المشبك',
    viewBox: '0 0 320 220',
    formes: [
      { type: 'path', attrs: { d: 'M20 40 Q90 20 150 60 L150 150 Q90 190 20 170 Z', fill: S, stroke: G, 'stroke-width': 2 } },
      { type: 'path', attrs: { d: 'M190 55 L300 30 L300 190 L190 160 Z', fill: S, stroke: G, 'stroke-width': 2 } },
      { type: 'circle', attrs: { cx: 105, cy: 85, r: 11, fill: '#fff', stroke: G } },
      { type: 'circle', attrs: { cx: 125, cy: 115, r: 11, fill: '#fff', stroke: G } },
      { type: 'circle', attrs: { cx: 100, cy: 135, r: 11, fill: '#fff', stroke: G } },
      { type: 'circle', attrs: { cx: 165, cy: 95, r: 3, fill: G } },
      { type: 'circle', attrs: { cx: 172, cy: 120, r: 3, fill: G } },
      { type: 'circle', attrs: { cx: 160, cy: 130, r: 3, fill: G } },
      { type: 'rect', attrs: { x: 186, y: 85, width: 8, height: 14, fill: O, stroke: G } },
      { type: 'rect', attrs: { x: 186, y: 115, width: 8, height: 14, fill: O, stroke: G } },
      { type: 'rect', attrs: { x: 140, y: 70, width: 12, height: 10, fill: C, stroke: G } },
      { type: 'text', attrs: { x: 60, y: 200, 'font-size': 11, fill: G }, texte: 'قبل مشبكي' },
      { type: 'text', attrs: { x: 215, y: 205, 'font-size': 11, fill: G }, texte: 'بعد مشبكي' },
    ],
    zones: [
      { id: 'vesicule', nom: 'حويصلة مشبكية (مبلّغ عصبي)', x: 85, y: 85 },
      { id: 'fente', nom: 'الشقّ المشبكي', x: 170, y: 160 },
      { id: 'recepteur', nom: 'مستقبل قنوي بعد مشبكي', x: 215, y: 92 },
      { id: 'ca', nom: 'قناة Ca²⁺ فولطية', x: 146, y: 50 },
      { id: 'neuromediateur', nom: 'مبلّغ عصبي محرَّر', x: 166, y: 108 },
    ],
  },
  {
    id: 'chloroplaste',
    titre: 'الصانعة الخضراء والتيلاكويد',
    unite: 6,
    lessonHint: 'الصانعة',
    viewBox: '0 0 320 200',
    formes: [
      { type: 'ellipse', attrs: { cx: 160, cy: 100, rx: 145, ry: 80, fill: '#eef5ef', stroke: G, 'stroke-width': 2 } },
      { type: 'ellipse', attrs: { cx: 160, cy: 100, rx: 132, ry: 68, fill: '#f7fbf7', stroke: G, 'stroke-width': 1.5 } },
      { type: 'rect', attrs: { x: 70, y: 70, width: 50, height: 10, rx: 4, fill: S, stroke: G } },
      { type: 'rect', attrs: { x: 70, y: 84, width: 50, height: 10, rx: 4, fill: S, stroke: G } },
      { type: 'rect', attrs: { x: 70, y: 98, width: 50, height: 10, rx: 4, fill: S, stroke: G } },
      { type: 'rect', attrs: { x: 70, y: 112, width: 50, height: 10, rx: 4, fill: S, stroke: G } },
      { type: 'rect', attrs: { x: 190, y: 80, width: 50, height: 10, rx: 4, fill: S, stroke: G } },
      { type: 'rect', attrs: { x: 190, y: 94, width: 50, height: 10, rx: 4, fill: S, stroke: G } },
      { type: 'rect', attrs: { x: 190, y: 108, width: 50, height: 10, rx: 4, fill: S, stroke: G } },
      { type: 'path', attrs: { d: 'M120 92 Q155 60 190 85', fill: 'none', stroke: G, 'stroke-width': 3 } },
    ],
    zones: [
      { id: 'enveloppe', nom: 'الغشاء المزدوج (الغلاف)', x: 160, y: 26 },
      { id: 'stroma', nom: 'الحشوة (Stroma) — حلقة كالفن', x: 160, y: 150 },
      { id: 'granum', nom: 'البذيرة (Granum) — رزمة تيلاكويدات', x: 95, y: 96 },
      { id: 'thylakoide', nom: 'تيلاكويد — المرحلة الكيميوضوئية', x: 215, y: 99 },
      { id: 'lamelle', nom: 'صفيحة حشوية (تيلاكويد رابط)', x: 155, y: 62 },
    ],
  },
  {
    id: 'mitochondrie',
    titre: 'الميتوكندري',
    unite: 7,
    lessonHint: 'الميتوكندري',
    viewBox: '0 0 320 200',
    formes: [
      { type: 'ellipse', attrs: { cx: 160, cy: 100, rx: 145, ry: 75, fill: '#f6efe6', stroke: C, 'stroke-width': 2 } },
      { type: 'path', attrs: { d: 'M30 100 Q36 48 75 48 L85 48 L85 115 Q85 130 100 130 Q115 130 115 115 L115 48 L145 48 L145 115 Q145 130 160 130 Q175 130 175 115 L175 48 L205 48 L205 115 Q205 130 220 130 Q235 130 235 115 L235 52 Q275 55 290 100 Q280 160 160 162 Q45 160 30 100 Z', fill: 'none', stroke: C, 'stroke-width': 2 } },
      { type: 'line', attrs: { x1: 115, y1: 85, x2: 121, y2: 85, stroke: G } },
      { type: 'circle', attrs: { cx: 125, cy: 85, r: 4, fill: O, stroke: G } },
      { type: 'line', attrs: { x1: 235, y1: 85, x2: 241, y2: 85, stroke: G } },
      { type: 'circle', attrs: { cx: 245, cy: 85, r: 4, fill: O, stroke: G } },
    ],
    zones: [
      { id: 'externe', nom: 'الغشاء الخارجي', x: 160, y: 24 },
      { id: 'interne', nom: 'الغشاء الداخلي (السلسلة التنفسية)', x: 100, y: 143 },
      { id: 'crete', nom: 'عرف (Crête) — زيادة السطح', x: 175, y: 100 },
      { id: 'matrice', nom: 'المادة الأساسية (Matrice) — حلقة كريبس', x: 262, y: 128 },
      { id: 'intermembranaire', nom: 'الفراغ بين الغشائين — تراكم H⁺', x: 48, y: 58 },
      { id: 'atpsynthase', nom: 'ATP synthase (كرية مذنّبة)', x: 125, y: 69 },
    ],
  },
  {
    id: 'subduction',
    titre: 'منطقة الغوص ومستوى بنيوف',
    unite: 11,
    lessonHint: 'الغوص',
    viewBox: '0 0 340 220',
    formes: [
      { type: 'rect', attrs: { x: 0, y: 0, width: 340, height: 220, fill: '#fbf7ef' } },
      { type: 'rect', attrs: { x: 0, y: 60, width: 170, height: 30, fill: '#cde0ea' } },
      { type: 'path', attrs: { d: 'M0 90 L150 90 L190 120 L230 170 L270 215 L240 220 L200 180 L160 125 L0 118 Z', fill: '#8fa89c', stroke: G, 'stroke-width': 1.5 } },
      { type: 'path', attrs: { d: 'M170 60 L340 40 L340 120 L200 120 L170 90 Z', fill: '#d8c7a4', stroke: G, 'stroke-width': 1.5 } },
      { type: 'path', attrs: { d: 'M190 120 L340 120 L340 220 L270 220 Z', fill: '#e9d9b8' } },
      { type: 'path', attrs: { d: 'M250 40 L262 10 L274 40 Z', fill: C, stroke: G } },
      { type: 'line', attrs: { x1: 262, y1: 118, x2: 262, y2: 40, stroke: C, 'stroke-width': 3 } },
      { type: 'circle', attrs: { cx: 185, cy: 105, r: 2.5, fill: '#000' } },
      { type: 'circle', attrs: { cx: 210, cy: 140, r: 2.5, fill: '#000' } },
      { type: 'circle', attrs: { cx: 235, cy: 175, r: 2.5, fill: '#000' } },
      { type: 'circle', attrs: { cx: 255, cy: 200, r: 2.5, fill: '#000' } },
    ],
    zones: [
      { id: 'plaque_oceanique', nom: 'صفيحة محيطية كثيفة', x: 60, y: 104 },
      { id: 'fosse', nom: 'الخندق المحيطي', x: 160, y: 75 },
      { id: 'plaque_sup', nom: 'صفيحة طافية (قارّية)', x: 300, y: 80 },
      { id: 'benioff', nom: 'مستوى بنيوف (بؤر زلزالية متعمّقة)', x: 215, y: 160 },
      { id: 'arc', nom: 'قوس بركاني (ماغما أنديزيتية)', x: 285, y: 22 },
      { id: 'slab', nom: 'اللوح الغائص (تجفاف → انصهار جزئي فوقه)', x: 245, y: 205 },
    ],
  },
  {
    id: 'enveloppes',
    titre: 'بنية الكرة الأرضية (الأغلفة والانقطاعات)',
    unite: 10,
    lessonHint: 'بنية',
    viewBox: '0 0 320 320',
    formes: [
      { type: 'circle', attrs: { cx: 160, cy: 160, r: 150, fill: '#d8c7a4', stroke: G, 'stroke-width': 2 } },
      { type: 'circle', attrs: { cx: 160, cy: 160, r: 142, fill: '#c7a56e', stroke: G } },
      { type: 'circle', attrs: { cx: 160, cy: 160, r: 112, fill: '#b58a52', stroke: G } },
      { type: 'circle', attrs: { cx: 160, cy: 160, r: 72, fill: '#d9b45b', stroke: G } },
      { type: 'circle', attrs: { cx: 160, cy: 160, r: 30, fill: '#f0e2a8', stroke: G } },
      { type: 'line', attrs: { x1: 160, y1: 160, x2: 310, y2: 160, stroke: '#333', 'stroke-dasharray': '3 3' } },
      { type: 'text', attrs: { x: 236, y: 156, 'font-size': 9, fill: '#333' }, texte: '≈2900 km' },
      { type: 'text', attrs: { x: 192, y: 156, 'font-size': 9, fill: '#333' }, texte: '≈5100 km' },
      { type: 'text', attrs: { x: 283, y: 175, 'font-size': 9, fill: '#333' }, texte: '≈30–70 km' },
    ],
    zones: [
      { id: 'croute', nom: 'القشرة', x: 160, y: 14 },
      { id: 'moho', nom: 'انقطاع موهو (≈7–10 كم محيطيًا / 30–70 كم قاريًا)', x: 300, y: 185 },
      { id: 'manteau', nom: 'الوشاح (بريدوتيت)', x: 160, y: 60 },
      { id: 'gutenberg', nom: 'انقطاع غوتنبرغ', x: 232, y: 145 },
      { id: 'noyau_ext', nom: 'النواة الخارجية السائلة (لا تعبرها S)', x: 160, y: 108 },
      { id: 'lehmann', nom: 'انقطاع ليمان', x: 190, y: 145 },
      { id: 'graine', nom: 'النواة الداخلية الصلبة (البذرة)', x: 160, y: 160 },
    ],
  },
  {
    id: 'codon',
    titre: 'الترجمة: الرامزة، ARNt والريبوزوم',
    unite: 1,
    lessonHint: 'الترجمة',
    viewBox: '0 0 340 220',
    formes: [
      { type: 'ellipse', attrs: { cx: 170, cy: 95, rx: 110, ry: 55, fill: S, stroke: G, 'stroke-width': 2 } },
      { type: 'ellipse', attrs: { cx: 170, cy: 165, rx: 125, ry: 30, fill: '#e3efe6', stroke: G, 'stroke-width': 2 } },
      { type: 'line', attrs: { x1: 10, y1: 150, x2: 330, y2: 150, stroke: G, 'stroke-width': 3 } },
      { type: 'text', attrs: { x: 134, y: 162, 'font-size': 12, fill: '#000', 'font-weight': 'bold', direction: 'ltr' }, texte: 'AUG' },
      { type: 'text', attrs: { x: 185, y: 162, 'font-size': 12, fill: '#000', 'font-weight': 'bold', direction: 'ltr' }, texte: 'GCU' },
      { type: 'text', attrs: { x: 238, y: 162, 'font-size': 12, fill: '#000', 'font-weight': 'bold', direction: 'ltr' }, texte: 'UAA' },
      { type: 'path', attrs: { d: 'M135 130 L135 80 Q150 60 165 80 L165 130', fill: 'none', stroke: C, 'stroke-width': 3 } },
      { type: 'path', attrs: { d: 'M185 130 L185 80 Q200 60 215 80 L215 130', fill: 'none', stroke: C, 'stroke-width': 3 } },
      { type: 'text', attrs: { x: 134, y: 142, 'font-size': 10, fill: C, direction: 'ltr' }, texte: 'UAC' },
      { type: 'text', attrs: { x: 185, y: 142, 'font-size': 10, fill: C, direction: 'ltr' }, texte: 'CGA' },
      { type: 'circle', attrs: { cx: 150, cy: 55, r: 9, fill: O, stroke: G } },
      { type: 'circle', attrs: { cx: 200, cy: 55, r: 9, fill: O, stroke: G } },
      { type: 'line', attrs: { x1: 159, y1: 55, x2: 191, y2: 55, stroke: G, 'stroke-width': 2 } },
      { type: 'line', attrs: { x1: 128, y1: 179, x2: 145, y2: 164, stroke: G } },
      { type: 'line', attrs: { x1: 260, y1: 179, x2: 249, y2: 164, stroke: G } },
      { type: 'text', attrs: { x: 36, y: 140, 'font-size': 10, fill: G }, texte: "5'" },
      { type: 'text', attrs: { x: 300, y: 140, 'font-size': 10, fill: G }, texte: "3'" },
    ],
    zones: [
      { id: 'arnm', nom: 'ARNm (يُقرأ من 5\' إلى 3\')', x: 60, y: 165 },
      { id: 'codon', nom: 'رامزة (ثلاثية) — AUG رامزة البدء', x: 122, y: 185 },
      { id: 'anticodon', nom: 'رامزة مضادّة على ARNt (3′ إلى 5′ أمام الرامزة)', x: 230, y: 135 },
      { id: 'arnt', nom: 'ARNt حامل لحمض أميني', x: 232, y: 85 },
      { id: 'aa', nom: 'حمض أميني (ميثيونين على AUG)', x: 128, y: 40 },
      { id: 'liaison', nom: 'رابطة ببتيدية قيد التشكّل', x: 175, y: 34 },
      { id: 'ribosome', nom: 'الريبوزوم (تحت وحدتان)', x: 300, y: 60 },
      { id: 'stop', nom: 'رامزة توقّف UAA — لا ARNt موافق', x: 267, y: 185 },
    ],
  },
];

export function schemaParId(id: string): Schema | undefined {
  return SCHEMAS.find((s) => s.id === id);
}
