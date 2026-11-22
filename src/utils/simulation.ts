// Simulation d'épreuve Bac — 270 min (§10.4 du Plan V2).
//
// Ce module est **pur** : il ne connaît ni React, ni le stockage, ni le réseau. Il calcule
// le temps restant, l'allocation par exercice, et les repères de mi-parcours.
//
// Trois refus, les mêmes qu'en Phase 11 :
//   1. aucune note /20 : la simulation mesure le TEMPS et la COMPLÉTUDE, pas la valeur ;
//   2. aucun arrêt forcé : à 0 il ne se passe rien de grave — on signale, on laisse finir ;
//   3. aucun exercice « obligatoire » : l'élève peut en sauter un, c'est une info de gestion.
import type { SujetOfficiel } from '../data/sujetsOfficiels';

/** Durée officielle : 270 min (4 h 30). */
export const DUREE_BAC_MIN = 270;

export type EtatSimulation = 'preparation' | 'en_cours' | 'pause' | 'finie';

export interface AllocationExercice {
  numero: number;
  bareme: number;
  /** Minutes conseillées, proportionnelles au barème officiel */
  minutes: number;
  /** Heure (minute depuis le début) de la fin conseillée de cet exercice */
  finConseillee: number;
}

/**
 * Répartit 270 min au prorata des barèmes RÉELS du sujet.
 * Une répartition égale (90/90/90) est fausse pour un barème 5/7/8 : elle donne autant de
 * temps à 5 points qu'à 8, et pousse l'élève à bâcler le dernier exercice.
 * On réserve 15 min de relecture avant de répartir — comme le fait un correcteur.
 */
export const MINUTES_RELECTURE = 15;

export function allouerTemps(sujet: Pick<SujetOfficiel, 'exercices'>, dureeMin = DUREE_BAC_MIN): AllocationExercice[] {
  const baremeTotal = sujet.exercices.reduce((n, e) => n + e.bareme, 0);
  const aRepartir = Math.max(0, dureeMin - MINUTES_RELECTURE);
  if (baremeTotal <= 0) return [];
  let cumul = 0;
  return sujet.exercices.map((e) => {
    const minutes = Math.round((e.bareme / baremeTotal) * aRepartir);
    cumul += minutes;
    return { numero: e.numero, bareme: e.bareme, minutes, finConseillee: cumul };
  });
}

/** « 4:30:00 » / « 0:07:12 » — format d'horloge, jamais un pourcentage. */
export function formatDuree(secondes: number): string {
  const s = Math.max(0, Math.trunc(secondes));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export type NiveauAlerte = 'calme' | 'attention' | 'depasse';

/**
 * État du chrono. `depasse` n'est ni une erreur ni un échec : le Bac réel s'arrête,
 * l'entraînement continue — on continue de compter pour que l'élève sache où il en est.
 */
export function alerte(secondesRestantes: number): NiveauAlerte {
  if (secondesRestantes <= 0) return 'depasse';
  if (secondesRestantes <= 15 * 60) return 'attention';
  return 'calme';
}

export interface ResultatSimulation {
  /** Minutes réellement passées */
  minutesUtilisees: number;
  /** Exercices terminés / total — pas de note */
  exercicesTermines: number;
  exercicesTotal: number;
  /** Exercices où l'élève a dépassé le temps conseillé */
  depassements: { numero: number; minutesEnPlus: number }[];
  /** Relecture faite ou non — c'est le seul « conseil » de la synthèse */
  relectureFaite: boolean;
}

export function conclureSimulation(
  allocations: AllocationExercice[],
  constats: { numero: number; minutesPassees: number; termine: boolean }[],
  minutesUtilisees: number,
  relectureFaite: boolean,
): ResultatSimulation {
  const parNumero = new Map(constats.map((c) => [c.numero, c]));
  const depassements = allocations
    .map((a) => {
      const c = parNumero.get(a.numero);
      return c ? { numero: a.numero, minutesEnPlus: Math.max(0, Math.round(c.minutesPassees - a.minutes)) } : null;
    })
    .filter((d): d is { numero: number; minutesEnPlus: number } => d !== null && d.minutesEnPlus > 0)
    .sort((a, b) => b.minutesEnPlus - a.minutesEnPlus);

  return {
    minutesUtilisees: Math.max(0, Math.round(minutesUtilisees)),
    exercicesTermines: constats.filter((c) => c.termine).length,
    exercicesTotal: allocations.length,
    depassements,
    relectureFaite,
  };
}

/**
 * Une phrase de synthèse, en arabe, sans jugement et sans chiffre de réussite.
 * Elle parle d'organisation, pas de niveau en SVT.
 */
export function syntheseAr(r: ResultatSimulation): string {
  if (r.exercicesTermines === 0) {
    return 'لم تُنهِ أيّ تمرين. هذه ليست نقطة ولا حكمًا: أعِد التجربة، وابدأ بالتمرين الأقصر.';
  }
  const parties: string[] = [];
  parties.push(`أنهيت ${r.exercicesTermines} من ${r.exercicesTotal} تمرين في ${r.minutesUtilisees} دقيقة.`);
  if (r.depassements.length > 0) {
    const d = r.depassements[0];
    parties.push(`أطول تجاوز: التمرين ${d.numero} (+${d.minutesEnPlus} دقيقة).`);
  } else {
    parties.push('لم تتجاوز الوقت المسموح لأي تمرين.');
  }
  parties.push(r.relectureFaite ? 'خصّصت وقتًا للمراجعة.' : 'لم تصل إلى المراجعة الأخيرة — احفظ لها ربع ساعة.');
  return parties.join(' ');
}
