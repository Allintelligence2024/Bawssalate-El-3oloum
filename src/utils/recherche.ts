// البحث المحلّي (P3.3) — فهرس مبنيّ في الذاكرة من عناوين الدروس والوحدات والمصطلحات والإشكاليات.
// لا شبكة، لا مكتبة: تطبيع عربي بسيط (همزات، تاء مربوطة، ألف مقصورة، تشكيل) + مطابقة جزئية.

import { DOMAINES, UNITES, UNITE_PAR_ID, titreLecon, uniteDeLecon } from '../data/programme';
import { LESSON_GOLD_SUMMARIES } from '../data/lessonGoldSummaries';
import { LECONS_PASSIVES } from '../data/leconsPassives';

export interface EntreeIndex {
  lessonId: string;
  uniteId: string;
  titre: string;
  /** أين وُجد التطابق — يُعرض كسياق */
  champs: { type: 'titre' | 'mot' | 'question' | 'unite'; texte: string }[];
  /** نصّ مُطبَّع للبحث */
  cle: string;
}

/** تطبيع عربي للبحث: يزيل التشكيل والتطويل، يوحّد الهمزات والياء والتاء المربوطة، ويخفض اللاتيني. */
export function normaliser(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '') // تشكيل + تطويل
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim();
}

let cache: EntreeIndex[] | null = null;

export function construireIndex(): EntreeIndex[] {
  if (cache) return cache;
  const out: EntreeIndex[] = [];
  for (const u of UNITES) {
    for (const lessonId of [...(u.prerequis ?? []), ...u.lessonIds, ...(u.enrichissement ?? [])]) {
      const g = LESSON_GOLD_SUMMARIES[lessonId];
      const p = LECONS_PASSIVES[lessonId];
      const champs: EntreeIndex['champs'] = [
        { type: 'titre', texte: titreLecon(lessonId) },
        { type: 'unite', texte: u.titre },
      ];
      if (g?.missionAr) champs.push({ type: 'question', texte: g.missionAr });
      else if (p?.question) champs.push({ type: 'question', texte: p.question.replace(/^⚠️\s*/, '') });
      for (const mot of g?.vocabulary ?? []) champs.push({ type: 'mot', texte: mot });
      out.push({
        lessonId,
        uniteId: u.id,
        titre: titreLecon(lessonId),
        champs,
        cle: normaliser(champs.map((c) => c.texte).join(' | ')),
      });
    }
  }
  cache = out;
  return out;
}

export interface Resultat {
  entree: EntreeIndex;
  /** السياق الأفضل: المصطلح أو الإشكالية التي طابقت (العنوان إن طابق) */
  contexte: string;
  score: number;
}

/** مرشّح اختياري (P3.3): مجال أو وحدة. */
export interface FiltreRecherche {
  domaineId?: string;
  uniteId?: string;
}

export function entreeDansFiltre(e: EntreeIndex, filtre?: FiltreRecherche): boolean {
  if (!filtre) return true;
  if (filtre.uniteId && e.uniteId !== filtre.uniteId) return false;
  if (filtre.domaineId) {
    const d = DOMAINES.find((x) => x.id === filtre.domaineId);
    if (d && !d.unites.includes(e.uniteId)) return false;
  }
  return true;
}

/** بحث بكلمات متعدّدة: كل كلمة يجب أن تظهر. ترتيب: عنوان > مصطلح > إشكالية > وحدة، ثم ترتيب البرنامج.
 *  مع مرشّح وبلا استعلام (أو استعلام أقصر من حرفين): تُعرض كلّ دروس المجال/الوحدة بترتيب البرنامج. */
export function rechercher(requete: string, limite = 20, filtre?: FiltreRecherche): Resultat[] {
  const q = normaliser(requete);
  const avecFiltre = Boolean(filtre?.domaineId || filtre?.uniteId);
  if (q.length < 2) {
    if (!avecFiltre) return [];
    return construireIndex()
      .filter((e) => entreeDansFiltre(e, filtre))
      .map((e) => ({ entree: e, contexte: '', score: 0 }));
  }
  const mots = q.split(' ').filter(Boolean);
  const res: Resultat[] = [];
  for (const e of construireIndex()) {
    if (!entreeDansFiltre(e, filtre)) continue;
    if (!mots.every((m) => e.cle.includes(m))) continue;
    let score = 0;
    let contexte = '';
    for (const c of e.champs) {
      const n = normaliser(c.texte);
      if (!mots.some((m) => n.includes(m))) continue;
      const poids = c.type === 'titre' ? 4 : c.type === 'mot' ? 3 : c.type === 'question' ? 2 : 1;
      if (poids > score) {
        score = poids;
        contexte = c.type === 'titre' ? '' : c.texte;
      }
    }
    res.push({ entree: e, contexte, score });
  }
  return res.sort((a, b) => b.score - a.score).slice(0, limite);
}

export function libelleUnite(lessonId: string): string {
  const u = uniteDeLecon(lessonId) ?? UNITE_PAR_ID[construireIndex().find((e) => e.lessonId === lessonId)?.uniteId ?? ''];
  return u ? `الوحدة ${u.numero} · ${u.titre}` : '';
}
