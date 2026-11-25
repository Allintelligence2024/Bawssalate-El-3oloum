// Jeux de briques — unité 1 (التخصص الوظيفي للبروتينات).
//
// Source : les onze exercices déjà présents dans `src/data/methodologie/exercicesUnite1.ts`
// (document, consigne, preuve, réponse modèle, erreur classique). Chaque brique est un **morceau
// de ces phrases** : aucune donnée scientifique nouvelle n'est introduite ici. Les quatre jeux
// marqués `actif` sont ceux dont le document et la réponse existent déjà mot pour mot dans le
// dépôt ; les suivants resteront `a_valider_enseignant` jusqu'à relecture.

import type { JeuBriques } from './types';
import { brique } from './types';

export const JEUX_UNITE1: JeuBriques[] = [
  {
    id: 'jb:u1:e2',
    document: 'السند 2 · خليتان مجهريتان',
    question: 'قارن بين مكان الاستنساخ ومكان الترجمة عند الخليتين.',
    verbe: 'قارن',
    attendu: 'تشابه ثمّ اختلاف، في الشروط نفسها (نفس المعيار للطرفين).',
    structure: ['observation', 'comparaison', 'interpretation', 'conclusion'],
    uniteId: 'u1',
    statut: 'actif',
    briques: [
      brique('jb:u1:e2', 1, 'observation', 'في الوثيقة خليتان: واحدة بنواة حقيقية والأخرى بلا نواة.', 'exercicesUnite1 · السند 2'),
      brique('jb:u1:e2', 2, 'comparaison', 'عند حقيقيات النوى: الاستنساخ في النواة ثم تخرج ARNm إلى الهيولى للترجمة.', 'exercicesUnite1 · reponse'),
      brique('jb:u1:e2', 3, 'interpretation', 'عند بدائيات النوى: العمليتان في الهيولى ويمكن أن تكونا متزامنتين.', 'exercicesUnite1 · reponse'),
      brique('jb:u1:e2', 4, 'conclusion', 'الفرق الحقيقي بينهما هو مقر الاستنساخ، لا وجود الترجمة.', 'exercicesUnite1 · erreurCible'),
      brique('jb:u1:e2', 5, 'piege', 'ADN يخرج من النواة ليُترجم في الهيولى.', 'exercicesUnite1 · erreur'),
      brique('jb:u1:e2', 6, 'piege', 'الترجمة لا تتمّ عند بدائيات النوى.', 'exercicesUnite1 · erreurCible'),
    ],
  },
  {
    id: 'jb:u1:e3',
    document: 'السند 3 · معالجة ARNm',
    question: 'فسّر لماذا لا يغادر ARNm الأولي النواة مباشرة.',
    verbe: 'فسِّر',
    attendu: 'ربط الملاحظة بآلية من الدرس (السبب، لا الوصف).',
    structure: ['observation', 'comparaison', 'interpretation', 'conclusion'],
    uniteId: 'u1',
    statut: 'actif',
    briques: [
      brique('jb:u1:e3', 1, 'observation', 'ARNm الأولي يبقى في النواة ولا يغادرها مباشرة.', 'exercicesUnite1 · السند 3'),
      brique('jb:u1:e3', 2, 'comparaison', 'ARNm الأولي يحمل إنترونات، وARNm الناضج لا يحملها.', 'exercicesUnite1 · السند 3'),
      brique('jb:u1:e3', 3, 'interpretation', 'تُحذف الإنترونات وتُربط الإكسونات داخل النواة (المعالجة).', 'exercicesUnite1 · reponse'),
      brique('jb:u1:e3', 4, 'conclusion', 'لذلك لا يغادر النواة إلا ARNm ناضج قابل للترجمة.', 'exercicesUnite1 · reponse'),
      brique('jb:u1:e3', 5, 'piege', 'المعالجة تحدث في الريبوزوم أثناء الترجمة.', 'exercicesUnite1 · erreur'),
      brique('jb:u1:e3', 6, 'piege', 'الإكسونات هي التي تُحذف وتُرمى.', 'exercicesUnite1 · erreurCible'),
    ],
  },
  {
    id: 'jb:u1:e5',
    document: 'السند 5 · مقارنة تسلسلين',
    question: 'استنتج أثر استبدال رامزة واحدة في تسلسل مورثة.',
    verbe: 'استنتج',
    attendu: 'ما يلزم من المعطيات، بجملة واحدة، بالمستوى المطلوب.',
    structure: ['observation', 'comparaison', 'interpretation', 'conclusion'],
    uniteId: 'u1',
    statut: 'actif',
    briques: [
      brique('jb:u1:e5', 1, 'observation', 'التسلسلان متطابقان إلا في قاعدة واحدة.', 'exercicesUnite1 · السند 5'),
      brique('jb:u1:e5', 2, 'comparaison', 'القاعدة المستبدلة تغيّر رامزة واحدة فقط.', 'exercicesUnite1 · السند 5'),
      brique('jb:u1:e5', 3, 'interpretation', 'الرامزة الجديدة قد تقابل حمضًا أمينيًا مختلفًا.', 'exercicesUnite1 · reponse'),
      brique('jb:u1:e5', 4, 'conclusion', 'قد تتغير البنية الفراغية والوظيفة، حسب موضع التغيّر وأثره.', 'exercicesUnite1 · reponse'),
      brique('jb:u1:e5', 5, 'piege', 'كل طفرة تؤدي حتمًا إلى فقدان الوظيفة.', 'exercicesUnite1 · erreur'),
      brique('jb:u1:e5', 6, 'piege', 'البروتين هو سبب تغيّر المورثة.', 'exercicesUnite1 · erreurCible'),
    ],
  },
  {
    id: 'jb:u1:e8',
    document: 'السند 8 · مسار بروتين مفرز',
    question: 'علّل وجود بروتين مُفرز خارج الخلية في الشبكة الهيولية المحببة.',
    verbe: 'برِّر',
    attendu: 'حجّة من الوثيقة + حجّة من المعرفة، ثمّ موقف.',
    structure: ['observation', 'comparaison', 'interpretation', 'conclusion'],
    uniteId: 'u1',
    statut: 'actif',
    briques: [
      brique('jb:u1:e8', 1, 'observation', 'الوثيقة تُظهر بروتينًا مفرزًا يظهر خارج الخلية.', 'exercicesUnite1 · السند 8'),
      brique('jb:u1:e8', 2, 'comparaison', 'ريبوزومات مرتبطة بالشبكة المحببة تنتج البروتين المفرز، والحرّة لا تُفرزه.', 'exercicesUnite1 · السند 8'),
      brique('jb:u1:e8', 3, 'interpretation', 'ببتيد الإشارة يوجّه الريبوزوم نحو الشبكة الهيولية المحببة، فيدخل البروتين مسار الإفراز.', 'exercicesUnite1 · reponse'),
      brique('jb:u1:e8', 4, 'conclusion', 'التوجيه بببتيد الإشارة يفسّر وجوده في الشبكة ثم خارج الخلية.', 'exercicesUnite1 · reponse'),
      brique('jb:u1:e8', 5, 'piege', 'الريبوزوم الحر وحده يكفي لتفسير إفراز البروتين.', 'exercicesUnite1 · erreur'),
      brique('jb:u1:e8', 6, 'piege', 'خارج الخلية هي المحطة الأولى للبروتين بعد النواة.', 'exercicesUnite1 · erreurCible'),
    ],
  },
];

/** Jeux d'une unité, sans charger les autres (le catalogue complet est paresseux). */
export function jeuxUnite1(): JeuBriques[] {
  return JEUX_UNITE1;
}
