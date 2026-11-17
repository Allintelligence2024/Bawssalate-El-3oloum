// src/utils/moteur.ts — محرّك الطريق المُرشد (Next Best Action)
//
// أولوية مهمّة اليوم (مهمّة واحدة تُعرض):
//   1. استئناف الدرس المبدوء؛
//   2. استرجاع مستحق (قبل أي جديد)؛
//   3. حصّة جديدة إن لم يُبلغ الحصّة اليومية (1 + إضافية)؛
//   4. وإلا: راحة (« يكفي اليوم »).
//
// لا نسبة مئوية، لا عدّ تنازلي، لا سلسلة قابلة للكسر (OPUS: مضاد للقلق).
//
// P2.2 — هدف العلامة يضبط الحصّة اليومية (QUOTA_PAR_OBJECTIF).
// P2.3 — المراجعة المكثّفة (≤ 60 يومًا من بكالوريا التلميذ): مسار موازٍ يفتح وحدات الأولوية
//        دون انتظار ما قبلها (القفل يبقى داخل الوحدة)، ويرفع الحصّة إلى 3.

import {
  CHEMIN,
  UNITE_PAR_ID,
  UNITES,
  cleItem,
  debutAnnee,
  uniteDeItem,
  type ItemChemin,
} from '../data/programme';
import { prioriteLecon, type Priorite } from '../data/priorites';
import type { CarteKafaa, Etat, Objectif } from '../types';
import { ajouterJours, aujourdhui, differenceJours } from './dates';
import { aReviserAujourdhui } from './srs';

export type ActionJour =
  | { type: 'reprise'; item: ItemChemin }
  | { type: 'rappel'; lessonIds: string[] }
  | { type: 'nouvelle'; item: ItemChemin }
  | { type: 'repos'; bonusDispo: boolean; prochaineItem: ItemChemin | null }
  | { type: 'fini' };

// ───────────── حالة بنود الطريق ─────────────

export function itemFait(etat: Etat, item: ItemChemin): boolean {
  if (item.type === 'lecon') return etat.progression[item.id]?.statut === 'terminee';
  return Boolean(etat.jalons[item.uniteId]?.fait);
}

export function itemVerrouille(etat: Etat, item: ItemChemin): boolean {
  const idx = CHEMIN.findIndex((c) => cleItem(c) === cleItem(item));
  const avant = CHEMIN.slice(0, idx);
  // المراجعة المكثّفة: البند ذو الأولوية يُقفل خلف بنود وحدته ذات الأولوية فقط (ترتيبها محفوظ)،
  // لا خلف كل الوحدات السابقة ولا خلف دروس وحدته غير المدرجة في الخطة — وإلا بقي الدرس المهم بعيد المنال في ماي.
  if (modeIntensifActif(etat) && itemPrioritaire(etat, item)) {
    const uId = uniteDeItem(item)?.id;
    return avant.some((c) => uniteDeItem(c)?.id === uId && itemPrioritaire(etat, c) && !itemFait(etat, c));
  }
  return avant.some((c) => !itemFait(etat, c));
}

export function prochainItem(etat: Etat): ItemChemin | null {
  if (modeIntensifActif(etat)) {
    const prioritaire = CHEMIN.find((c) => itemPrioritaire(etat, c) && !itemFait(etat, c));
    if (prioritaire) return prioritaire;
  }
  return CHEMIN.find((c) => !itemFait(etat, c)) ?? null;
}

export function itemsFaits(etat: Etat): number {
  return CHEMIN.filter((c) => itemFait(etat, c)).length;
}

// درس مبدوء لم يكتمل (للاستئناف): نأخذ الأحدث
export function leconEnCours(etat: Etat): ItemChemin | null {
  const enCours = CHEMIN.filter(
    (c): c is { type: 'lecon'; id: string } =>
      c.type === 'lecon' && etat.progression[c.id]?.statut === 'en_cours'
  );
  if (!enCours.length) return null;
  const plusRecente = enCours.reduce((a, b) => {
    const da = etat.progression[a.id]?.derniereSession ?? '';
    const db = etat.progression[b.id]?.derniereSession ?? '';
    return db > da ? b : a;
  });
  return plusRecente;
}

export function revisionsDues(etat: Etat): string[] {
  return Object.keys(etat.progression).filter((id) => aReviserAujourdhui(etat.progression[id]));
}

// ───────────── الحصّة اليومية ─────────────

export function seancesAujourdhui(etat: Etat): number {
  return etat.seancesJour === aujourdhui() ? etat.seancesComptees : 0;
}

// ───────────── هدف العلامة → الحصّة (P2.2) ─────────────

export interface Quota {
  /** الحصص الجديدة المقترحة في اليوم */
  seances: number;
  /** هل تُتاح حصّة إضافية واحدة بعد بلوغ الحصّة؟ */
  bonus: boolean;
  /** سقف مراجعات بطاقات الكفاءة في الأسبوع */
  kafaaSemaine: number;
}

export const OBJECTIF_PAR_DEFAUT: Objectif = 14;

/** الجدول الوحيد الذي يربط الهدف بالإيقاع — لا نسب، لا مقارنة بالآخرين. */
export const QUOTA_PAR_OBJECTIF: Record<Objectif, Quota> = {
  10: { seances: 1, bonus: false, kafaaSemaine: 2 },
  14: { seances: 1, bonus: true, kafaaSemaine: 2 },
  18: { seances: 2, bonus: true, kafaaSemaine: 3 },
};

/** حصّة المراجعة المكثّفة: 3 حصص (≈ 2 س 20 د) + إضافية — سقف صريح، لا «بلا حدود». */
export const QUOTA_INTENSIF: Quota = { seances: 3, bonus: true, kafaaSemaine: 3 };

export function objectifDe(etat: Etat): Objectif {
  return etat.objectif ?? OBJECTIF_PAR_DEFAUT;
}

export function quotaDe(etat: Etat): Quota {
  if (modeIntensifActif(etat)) return QUOTA_INTENSIF;
  return QUOTA_PAR_OBJECTIF[objectifDe(etat)];
}

export function bonusDispoAujourdhui(etat: Etat): boolean {
  return quotaDe(etat).bonus && etat.bonusJour !== aujourdhui();
}

export function enregistrerSeance(etat: Etat): Etat {
  const auj = aujourdhui();
  const comptees = etat.seancesJour === auj ? etat.seancesComptees + 1 : 1;
  return {
    ...etat,
    seancesJour: auj,
    seancesComptees: comptees,
    journal: etat.journal.includes(auj) ? etat.journal : [...etat.journal, auj],
  };
}

export function enregistrerActivite(etat: Etat): Etat {
  const auj = aujourdhui();
  if (etat.journal.includes(auj)) return etat;
  return { ...etat, journal: [...etat.journal, auj] };
}

// ───────────── إيقاع الأسبوع 5/7 ─────────────

export interface RythmeJour {
  iso: string;
  actif: boolean;
  aujourdhui: boolean;
}

export interface Rythme {
  jours: number;
  cible: number;
  /** les 7 derniers jours, du plus ancien (à droite) à aujourd'hui (à gauche) */
  sept: RythmeJour[];
}

export function rythmeSemaine(etat: Etat): Rythme {
  const auj = aujourdhui();
  const sept: RythmeJour[] = [];
  let jours = 0;
  for (let i = 6; i >= 0; i--) {
    const iso = ajouterJours(auj, -i);
    const actif = etat.journal.includes(iso);
    if (actif) jours++;
    sept.push({ iso, actif, aujourdhui: i === 0 });
  }
  return { jours: Math.min(jours, 7), cible: 5, sept };
}

// ───────────── موضع القسم (التدرّج السنوي) ─────────────

export function semaineActuelle(): number {
  const auj = aujourdhui();
  return Math.floor(differenceJours(debutAnnee(auj), auj) / 7) + 1;
}

export function uniteDeLaClasse(): string | null {
  const s = semaineActuelle();
  const u = UNITES.find((x) => s >= x.fenetre.debut && s <= x.fenetre.fin);
  return u?.id ?? null;
}

export type PositionClasse = {
  statut: 'aligne' | 'avance' | 'retard' | 'termine';
  texteAr: string;
  uniteId: string | null;
};

export function positionClasse(etat: Etat): PositionClasse {
  const prochUnite = prochainItem(etat);
  const prochaineUniteId = prochUnite ? uniteDeItem(prochUnite)?.id : null;
  const classeId = uniteDeLaClasse();

  if (!prochaineUniteId) {
    return {
      statut: 'termine',
      uniteId: null,
      texteAr: 'أنهيت كل البرنامج. الآن وقت الاسترجاع والامتحان التجريبي فقط.',
    };
  }
  if (!classeId) {
    return {
      statut: 'termine',
      uniteId: prochaineUniteId,
      texteAr: 'انتهى التدرّج السنوي في القسم. ركّز على الاسترجاع والأسابيع الأخيرة قبل البكالوريا.',
    };
  }
  if (classeId === prochaineUniteId) {
    return {
      statut: 'aligne',
      uniteId: classeId,
      texteAr: 'أنت في نفس وحدة قسمك تمامًا. خطوة واحدة كل يوم تبقيك هناك.',
    };
  }
  const np = UNITE_PAR_ID[prochaineUniteId].numero;
  const nc = UNITE_PAR_ID[classeId].numero;
  if (np > nc) {
    return {
      statut: 'avance',
      uniteId: prochaineUniteId,
      texteAr: 'أنت متقدّم على التدرّج السنوي. لا تتسرّع: ثبّت ما تعلّمته قبل الانتقال.',
    };
  }
  return {
    statut: 'retard',
    uniteId: prochaineUniteId,
    texteAr: 'تأخّرت قليلاً عن التدرّج السنوي. الخطة: حصّة واحدة كل يوم تكفي لتلحق قبل البكالوريا.',
  };
}

// ───────────── المراجعة المكثّفة (P2.3) ─────────────

export const SEUIL_INTENSIF_JOURS = 60;
export type PhaseIntensive = 'J60' | 'J30' | 'J7';

export function joursAvantBac(etat: Etat): number | null {
  if (!etat.dateBac) return null;
  return differenceJours(aujourdhui(), etat.dateBac);
}

/** هل المراجعة المكثّفة فعّالة؟ 'on' دائمًا، 'off' أبدًا، 'auto' عند ≤ 60 يومًا وقبل يوم الامتحان. */
export function modeIntensifActif(etat: Etat): boolean {
  const choix = etat.modeIntensif ?? 'auto';
  if (choix === 'on') return true;
  if (choix === 'off') return false;
  const j = joursAvantBac(etat);
  return j !== null && j >= 0 && j <= SEUIL_INTENSIF_JOURS;
}

/** المرحلة: J60 (أولوية 1 = poidsBac ≥ 4) → J30 (أولوية 1 و2 = poidsBac ≥ 3) → J7 (استرجاع ومواضيع). */
export function phaseIntensive(etat: Etat): PhaseIntensive | null {
  if (!modeIntensifActif(etat)) return null;
  const j = joursAvantBac(etat);
  if (j === null) return 'J60'; // تفعيل يدوي بلا تاريخ
  if (j <= 7) return 'J7';
  if (j <= 30) return 'J30';
  return 'J60';
}

/** عتبة الأولوية حسب المرحلة (P1.7: أولوية لكل درس مُسندة إلى تحليل المواضيع، `src/data/priorites.ts`).
 *  J60 → الدروس ذات الأولوية 1 فقط ؛ J30 و J7 → 1 و 2. الأولوية 3 (إثرائي / متطلّب سابق / غائب عن المواضيع) لا تدخل الخطة المكثّفة. */
export function seuilPriorite(phase: PhaseIntensive): Priorite {
  return phase === 'J60' ? 1 : 2;
}

/** هل الدرس ضمن الخطة المكثّفة الحالية؟ (false خارج الوضع المكثّف) */
export function leconPrioritaire(etat: Etat, lessonId: string): boolean {
  const phase = phaseIntensive(etat);
  return phase !== null && prioriteLecon(lessonId) <= seuilPriorite(phase);
}

/** الوحدات التي تضمّ درسًا واحدًا على الأقل ضمن الخطة — للعرض والجسور. */
export function unitesPrioritaires(etat: Etat): string[] {
  const phase = phaseIntensive(etat);
  if (!phase) return [];
  const seuil = seuilPriorite(phase);
  return UNITES.filter((u) => u.lessonIds.some((id) => prioriteLecon(id) <= seuil)).map((u) => u.id);
}

/** درس: حسب أولويته ؛ جسر: إن كانت وحدته تضمّ درسًا ذا أولوية (الجسر يثبّت الوحدة). */
export function itemPrioritaire(etat: Etat, item: ItemChemin): boolean {
  if (item.type === 'lecon') return leconPrioritaire(etat, item.id);
  return unitesPrioritaires(etat).includes(item.uniteId);
}

/** هل أُنجز امتحان تجريبي خلال الأيام السبعة الأخيرة (اليوم مشمول)؟ */
export function sujetCetteSemaine(etat: Etat): boolean {
  const auj = aujourdhui();
  return (etat.examensBlancs ?? []).some((iso) => {
    const d = differenceJours(iso.slice(0, 10), auj);
    return d >= 0 && d < 7;
  });
}

/** الدروس التي خرجت من الاسترجاع المكثّف بعد نجاحين. */
export function leconsAcquisesIntensif(etat: Etat): string[] {
  return Object.keys(etat.progression).filter((id) => Boolean(etat.progression[id]?.acquisIntensifLe));
}

export interface PlanIntensif {
  phase: PhaseIntensive;
  joursRestants: number | null;
  /** موضوع هذا الأسبوع أُنجز؟ */
  sujetFait: boolean;
  /** عدد الدروس التي ثبتت (نجاحان) */
  acquises: number;
  /** بنود الأولوية (دروس + جسور) غير المنجزة */
  restants: number;
  /** الإيقاع المقترح في الأسبوع لإنهاء البنود قبل الامتحان (مسقوف بـ 7 × الحصّة) */
  parSemaine: number;
  unites: string[];
}

export function planIntensif(etat: Etat): PlanIntensif | null {
  const phase = phaseIntensive(etat);
  if (!phase) return null;
  const unites = unitesPrioritaires(etat);
  const restants = CHEMIN.filter((c) => itemPrioritaire(etat, c) && !itemFait(etat, c)).length;
  const jours = joursAvantBac(etat);
  const semaines = jours === null ? 4 : Math.max(1, Math.ceil(jours / 7));
  const plafond = 7 * QUOTA_INTENSIF.seances;
  const parSemaine = Math.min(plafond, Math.ceil(restants / semaines));
  return {
    phase,
    joursRestants: jours,
    restants,
    parSemaine,
    unites,
    sujetFait: sujetCetteSemaine(etat),
    acquises: leconsAcquisesIntensif(etat).length,
  };
}

// ───────────── المهمّة الواحدة ─────────────

export function prochaineAction(etat: Etat): ActionJour {
  // 0. كل شيء أُنجز
  if (!prochainItem(etat)) return { type: 'fini' };

  // 1. استئناف
  const enCours = leconEnCours(etat);
  if (enCours) return { type: 'reprise', item: enCours };

  // 2. استرجاع مستحق قبل أي جديد
  const dues = revisionsDues(etat);
  if (dues.length) return { type: 'rappel', lessonIds: dues };

  // 3. حصّة جديدة ضمن الحصّة اليومية (حسب الهدف أو المراجعة المكثّفة)
  if (seancesAujourdhui(etat) < quotaDe(etat).seances) {
    const item = prochainItem(etat);
    if (item) return { type: 'nouvelle', item };
  }

  // 4. راحة (مع إمكانية حصّة إضافية واحدة)
  return {
    type: 'repos',
    bonusDispo: bonusDispoAujourdhui(etat),
    prochaineItem: prochainItem(etat),
  };
}

// ───────────── بطاقة الكفاءة (منهجية) — مراجعة قصيرة ─────────────

/** ISO du lundi qui commence la semaine de `iso` (la semaine commence un samedi dans le calendrier scolaire algérien : dim → sam, on part du dimanche). */
export function debutSemaine(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  const recul = d.getDay(); // 0 = dimanche
  d.setDate(d.getDate() - recul);
  const a = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const j = String(d.getDate()).padStart(2, '0');
  return `${a}-${m}-${j}`;
}

/** Première carte كفاءة due aujourd'hui, ou null (aucune, ou 2 revues déjà faites cette semaine). */
export function competenceDue(etat: Etat): { key: string; carte: CarteKafaa } | null {
  if (!etat.kafaa) return null;
  const auj = aujourdhui();
  const hebdo =
    etat.kafaaHebdo?.debut === debutSemaine(aujourdhui()) ? etat.kafaaHebdo.n : 0;
  if (hebdo >= quotaDe(etat).kafaaSemaine) return null;
  const dues = Object.entries(etat.kafaa)
    .filter(([, c]) => c.prochaineRevision !== undefined && c.prochaineRevision <= auj)
    .sort((a, b) => (a[1].prochaineRevision ?? '').localeCompare(b[1].prochaineRevision ?? ''));
  if (!dues.length) return null;
  return { key: dues[0][0], carte: dues[0][1] };
}

// ───────────── مساعدات الوحدة ─────────────

export function leconsUniteFaites(etat: Etat, uniteId: string): number {
  const u = UNITE_PAR_ID[uniteId];
  return u.lessonIds.filter((id) => etat.progression[id]?.statut === 'terminee').length;
}

export function uniteTerminee(etat: Etat, uniteId: string): boolean {
  const u = UNITE_PAR_ID[uniteId];
  return u.lessonIds.every((id) => etat.progression[id]?.statut === 'terminee');
}

/** أضعف دروس الوحدة (هشّ أو أقل تقييم) — يُسمّى في الجسر */
export function leconLaPlusFragile(etat: Etat, uniteId: string): string | null {
  const u = UNITE_PAR_ID[uniteId];
  let candidate: string | null = null;
  let pire = 99;
  for (const id of u.lessonIds) {
    const p = etat.progression[id];
    if (!p || p.statut !== 'terminee') continue;
    const score = p.fragile ? -10 + (p.note ?? 6) : p.note ?? 6;
    if (score < pire) {
      pire = score;
      candidate = id;
    }
  }
  return candidate;
}

export function questionsGardees(etat: Etat, uniteId: string): number {
  return etat.notes.filter((n) => n.kind === 'question' && n.uniteId === uniteId).length;
}
