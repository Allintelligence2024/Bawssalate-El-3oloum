// Micro-nœuds — projection 1-1 des six phases du protocole (46 min) en étapes de 3 à 5 minutes.
//
// Décision structurante (§2.1 du plan directeur) : un micro-nœud EST une phase. Les faits
// s'écrivent dans `progression[lessonId].phases`, exactement comme aujourd'hui. Rien ne peut
// donc diverger entre « mode nœud » et « séance complète » : la reprise, le SM-2 et les tests
// existants continuent de fonctionner sans modification.
//
// Ce module ne contient que des fonctions pures : aucune écriture d'état, aucun import de React.

import { PROTOCOLE, DUREE_TOTALE_MIN } from '../data/protocole';
import { titreLecon, uniteDeLecon } from '../data/programme';
import type { Etat, ProgressionLecon } from '../types';

export type TypeNoeud = 'lire' | 'mots' | 'rappel' | 'mecanisme' | 'preuve' | 'ancrage';

/** Minutes par nœud : plafond dur de 5, plancher de 3. Aucun nœud ne sort de cet intervalle. */
export interface NoeudMicro {
  /** `mn:<lessonId>:<phase>` — identifiant stable, utilisable en analytique locale. */
  id: string;
  phase: 1 | 2 | 3 | 4 | 5 | 6;
  type: TypeNoeud;
  minutes: 3 | 4 | 5;
  titre: string;
  /** Ce que l'élève saura faire à la fin — affiché AVANT de commencer. */
  savoirFaire: string;
  /** Ce que la porte demandera (repris du protocole : une seule vérité). */
  porte: string;
}

export const MINUTES_NOEUD: Record<TypeNoeud, 3 | 4 | 5> = {
  lire: 3,
  mots: 3,
  rappel: 4,
  mecanisme: 4,
  preuve: 5,
  ancrage: 5,
};

export const TYPE_PAR_PHASE: Record<1 | 2 | 3 | 4 | 5 | 6, TypeNoeud> = {
  1: 'lire',
  2: 'mots',
  3: 'rappel',
  4: 'mecanisme',
  5: 'preuve',
  6: 'ancrage',
};

/** Le « savoir-faire » annoncé, par nœud : une phrase, jamais un programme. */
const SAVOIR_FAIRE: Record<TypeNoeud, string> = {
  lire: 'تحدّد سؤال الدرس قبل أن تقرأ، فتعرف ما تبحث عنه.',
  mots: 'تفرّق بين مصطلح تعرفه ومصطلح جديد قبل أن تخلط بينهما.',
  rappel: 'تسترجع من ذاكرتك، بلا نظر إلى الدرس، الفكرة الأولى.',
  mecanisme: 'ترتّب الخطوات السببية للآلية بالترتيب الصحيح.',
  preuve: 'تقرأ الدليل الوثائقي وتقول ما يثبته بالضبط.',
  ancrage: 'تكتب جملة الباك التي تُقنع المصحّح، وتتجنّب الفخّ الشائع.',
};

/** Nom court de chaque nœud, tel qu'il apparaît sur la carte. */
const TITRES: Record<TypeNoeud, string> = {
  lire: 'اقرأ بسؤال',
  mots: 'كلمات المفتاح',
  rappel: 'استرجع من ذاكرتك',
  mecanisme: 'رتّب الآلية',
  preuve: 'اقرأ الدليل',
  ancrage: 'اكتب جملة الباك',
};

const PHASES = [1, 2, 3, 4, 5, 6] as const;

/**
 * Les six nœuds d'une leçon, dans l'ordre. Aucun contenu inventé : les titres, questions et
 * portes viennent du protocole et de la fiche dorée de la leçon.
 */
export function noeudsDeLecon(lessonId: string): NoeudMicro[] {
  return PHASES.map((phase) => {
    const type = TYPE_PAR_PHASE[phase];
    const source = PROTOCOLE.find((p) => p.id === phase);
    return {
      id: `mn:${lessonId}:${phase}`,
      phase,
      type,
      minutes: MINUTES_NOEUD[type],
      titre: TITRES[type],
      savoirFaire: SAVOIR_FAIRE[type],
      porte: source?.verrouAr ?? 'بوّابة المرحلة',
    };
  });
}

/** Phases déjà validées pour cette leçon (0 si jamais ouverte). */
export function phasesFaites(p?: ProgressionLecon): (1 | 2 | 3 | 4 | 5 | 6)[] {
  const brutes = p?.phases ?? [];
  return PHASES.filter((phase) => brutes.includes(phase));
}

/** Prochaine phase à travailler, ou `null` si les six sont faites. */
export function prochainePhase(p?: ProgressionLecon): 1 | 2 | 3 | 4 | 5 | 6 | null {
  return PHASES.find((phase) => !(p?.phases ?? []).includes(phase)) ?? null;
}

/**
 * Le nœud à proposer maintenant : la première phase non validée.
 * `null` quand la leçon est complète — l'appelant propose alors la fiche ou la suite du chemin.
 */
export function prochainNoeud(lessonId: string, p?: ProgressionLecon): NoeudMicro | null {
  const phase = prochainePhase(p);
  if (phase === null) return null;
  return noeudsDeLecon(lessonId).find((n) => n.phase === phase) ?? null;
}

/** Durée restante estimée d'une leçon en mode nœuds (3 à 5 min par nœud restant). */
export function minutesRestantes(lessonId: string, p?: ProgressionLecon): number {
  return noeudsDeLecon(lessonId)
    .filter((n) => !(p?.phases ?? []).includes(n.phase))
    .reduce((somme, n) => somme + n.minutes, 0);
}

export interface ResumeNoeuds {
  lessonId: string;
  lecon: string;
  unite: string;
  noeuds: NoeudMicro[];
  faites: number;
  /** Somme des minutes des nœuds restants. */
  restantes: number;
  /** Total du protocole complet, pour le lien secondaire « séance complète ». */
  totalSeance: number;
  ficheDisponible: boolean;
}

export function resumeNoeuds(etat: Etat, lessonId: string): ResumeNoeuds {
  const p = etat.progression[lessonId];
  const unite = uniteDeLecon(lessonId);
  const noeuds = noeudsDeLecon(lessonId);
  return {
    lessonId,
    lecon: titreLecon(lessonId),
    unite: unite ? `الوحدة ${unite.numero} · ${unite.titre}` : '',
    noeuds,
    faites: phasesFaites(p).length,
    restantes: minutesRestantes(lessonId, p),
    totalSeance: DUREE_TOTALE_MIN,
    ficheDisponible: Boolean(etat.cartesLecons?.[lessonId]) || phasesFaites(p).includes(6),
  };
}
