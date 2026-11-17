// الجولة التكيّفية المحدودة (P3.1) — «سلّم» من 10 أسئلة:
//   نجاحان متتاليان (من أول محاولة) → درجة أعلى ؛ خطآن متتاليان → درجة أدنى + دعوة لفتح الدرس.
//   الحدود: [1, أعلى مستوى متوفّر في المحور] — اليوم المستوى 3 غير متوفّر في البنك (أُزيلت عناصره غير الموثّقة)،
//   فالسلّم عمليًّا درجتان حتى تصل عناصر n3 الموثّقة (P1.5).
//   لغة الواجهة: صعود/نزول على سلّم، لا «سقوط» ولا نسبة ولا علامة. النزول يُقدَّم كتثبيت للأساس.

import type { ItemDrill } from '../data/drills/types';

export type Niveau = 1 | 2 | 3;
export const TAILLE_SESSION_ADAPTATIVE = 10;
export const SEUIL_MONTEE = 2;
export const SEUIL_DESCENTE = 2;

export interface EtatAdaptatif {
  niveau: Niveau;
  min: Niveau;
  max: Niveau;
  serieReussites: number;
  serieEchecs: number;
  historique: { id: string; niveau: Niveau; juste: boolean }[];
}

export type Evenement = 'montee' | 'descente' | 'plancher' | null;

export interface Transition {
  etat: EtatAdaptatif;
  /** ما حدث على السلّم بعد هذه الإجابة */
  evenement: Evenement;
  /** دعوة لفتح الدرس (بعد خطأين متتاليين، سواء نزلنا أم كنّا في الدرجة الدنيا) */
  inviterCours: boolean;
}

export function niveauxDisponibles(pool: ItemDrill[]): Niveau[] {
  return ([1, 2, 3] as Niveau[]).filter((n) => pool.some((i) => i.n === n));
}

/** يبدأ من الدرجة الأولى دائمًا — الصعود يُكتسب، لا يُفترض. */
export function demarrerAdaptatif(pool: ItemDrill[]): EtatAdaptatif {
  const dispo = niveauxDisponibles(pool);
  const min = (dispo[0] ?? 1) as Niveau;
  const max = (dispo[dispo.length - 1] ?? 1) as Niveau;
  return { niveau: min, min, max, serieReussites: 0, serieEchecs: 0, historique: [] };
}

export function appliquerReponse(e: EtatAdaptatif, item: ItemDrill, juste: boolean): Transition {
  const historique = [...e.historique, { id: item.id, niveau: e.niveau, juste }];
  if (juste) {
    const serie = e.serieReussites + 1;
    if (serie >= SEUIL_MONTEE && e.niveau < e.max) {
      return {
        etat: { ...e, niveau: (e.niveau + 1) as Niveau, serieReussites: 0, serieEchecs: 0, historique },
        evenement: 'montee',
        inviterCours: false,
      };
    }
    return { etat: { ...e, serieReussites: serie, serieEchecs: 0, historique }, evenement: null, inviterCours: false };
  }
  const serie = e.serieEchecs + 1;
  if (serie >= SEUIL_DESCENTE) {
    if (e.niveau > e.min) {
      return {
        etat: { ...e, niveau: (e.niveau - 1) as Niveau, serieReussites: 0, serieEchecs: 0, historique },
        evenement: 'descente',
        inviterCours: true,
      };
    }
    return { etat: { ...e, serieReussites: 0, serieEchecs: 0, historique }, evenement: 'plancher', inviterCours: true };
  }
  return { etat: { ...e, serieEchecs: serie, serieReussites: 0, historique }, evenement: null, inviterCours: false };
}

/**
 * العنصر التالي: من الدرجة الحالية، غير مطروح في هذه الجولة، غير مُجاب سابقًا إن أمكن.
 * إن خلت الدرجة: ننزل درجة ثم نصعد. null إن نفد كل شيء.
 */
export function prochainItemAdaptatif(
  pool: ItemDrill[],
  e: EtatAdaptatif,
  dejaFait: Set<string>,
  alea: () => number = Math.random,
): ItemDrill | null {
  const poses = new Set(e.historique.map((h) => h.id));
  const ordreNiveaux: Niveau[] = [e.niveau, ...([e.niveau - 1, e.niveau + 1, e.niveau - 2, e.niveau + 2] as number[])
    .filter((n) => n >= 1 && n <= 3)
    .map((n) => n as Niveau)];
  for (const n of ordreNiveaux) {
    const candidats = pool.filter((i) => i.n === n && !poses.has(i.id));
    if (!candidats.length) continue;
    const frais = candidats.filter((i) => !dejaFait.has(i.id));
    const base = frais.length ? frais : candidats;
    return base[Math.floor(alea() * base.length)];
  }
  return null;
}

export interface BilanAdaptatif {
  /** أعلى درجة بلغتها الجولة */
  sommet: Niveau;
  /** الدرجة عند النهاية */
  finale: Niveau;
  justes: number;
  total: number;
  /** جملة واحدة بالكلمات — لا نسبة */
  phrase: string;
}

export function bilanAdaptatif(e: EtatAdaptatif): BilanAdaptatif {
  const sommet = e.historique.reduce<Niveau>((m, h) => (h.niveau > m ? h.niveau : m), e.min);
  const justes = e.historique.filter((h) => h.juste).length;
  const total = e.historique.length;
  let phrase: string;
  if (total === 0) phrase = 'لم تبدأ بعد.';
  else if (e.max === e.min) phrase = 'درجة واحدة متاحة في هذا المحور اليوم — ثبّتها جيّدًا.';
  else if (e.niveau === e.max && sommet === e.max) phrase = 'بلغت أعلى درجات السلّم وثبتَّ عليها.';
  else if (sommet === e.max) phrase = 'بلغت القمّة ثم نزلت درجة لتثبيت الأساس — هذا طبيعي.';
  else if (e.niveau > e.min) phrase = 'ارتقيت درجة. الدرجة التالية تُكتسب بنجاحين متتاليين.';
  else phrase = 'بقيت على الدرجة الأولى — الأساس أولًا، ثم السلّم.';
  return { sommet, finale: e.niveau, justes, total, phrase };
}
