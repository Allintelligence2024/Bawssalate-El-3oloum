// كويست اليوم — la quête courte qui ouvre la journée (3 minutes, 3 étapes).
//
// Elle ne crée aucune donnée pédagogique : elle pioche dans `QCM_LECONS`
// (rappel → synthèse → piège) la leçon que le moteur propose déjà.
// Le protocole 46 min reste la séance complète ; la quête n'en est que la porte.

import { QCM_LECONS, type QcmLecon } from '../data/qcmLecons';
import { titreLecon, uniteDeLecon } from '../data/programme';
import type { Etat } from '../types';
import { prochaineAction } from './moteur';

export type TypeEtapeKouest = 'rappel' | 'synthese' | 'piege';

export interface EtapeKouest {
  /** Clé stable — sert aussi d'identifiant de réussite dans `etat.drills`. */
  cle: string;
  type: TypeEtapeKouest;
  titre: string;
  question: string;
  /** Options mélangées de façon déterministe (même clé = même ordre). */
  options: string[];
  bonne: string;
  explication: string;
}

const TITRES: Record<TypeEtapeKouest, string> = {
  rappel: 'استرجاع',
  synthese: 'ترسية',
  piege: 'مفخّ',
};

/** Mélange déterministe : l'ordre ne change pas entre deux rendus de la même étape. */
function melangeDeterministe<T>(liste: T[], graine: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < graine.length; i++) h = (h ^ graine.charCodeAt(i)) * 16777619;
  const sortie = [...liste];
  for (let i = sortie.length - 1; i > 0; i--) {
    h = (h * 1664525 + 1013904223) >>> 0;
    const j = h % (i + 1);
    [sortie[i], sortie[j]] = [sortie[j], sortie[i]];
  }
  return sortie;
}

function versEtape(lessonId: string, type: TypeEtapeKouest, q: QcmLecon): EtapeKouest {
  const cle = `kouest:${lessonId}:${type}`;
  const bonne = q.options[0];
  return {
    cle,
    type,
    titre: TITRES[type],
    question: q.question,
    options: melangeDeterministe(q.options, cle),
    bonne,
    explication: q.explication,
  };
}

/**
 * Les étapes de la quête d'une leçon : rappel → synthèse → un piège s'il existe.
 * Une leçon sans QCM rend un tableau vide : l'appelant saute la quête au lieu de
 * fabriquer de fausses questions.
 */
export function etapesKouest(lessonId: string): EtapeKouest[] {
  const qcm = QCM_LECONS[lessonId];
  if (!qcm) return [];
  const etapes: EtapeKouest[] = [
    versEtape(lessonId, 'rappel', qcm.rappel),
    versEtape(lessonId, 'synthese', qcm.synthese),
  ];
  const piege = qcm.pieges?.[0];
  if (piege) etapes.push(versEtape(lessonId, 'piege', piege));
  return etapes;
}

/** La leçon que la quête doit viser maintenant, ou null si le moteur ne propose rien. */
export function leconDeLaQuete(etat: Etat): string | null {
  const action = prochaineAction(etat);
  switch (action.type) {
    case 'reprise':
    case 'nouvelle':
      return action.item.type === 'lecon' ? action.item.id : null;
    case 'rappel':
      return action.lessonIds[0] ?? null;
    case 'repos':
      return action.prochaineItem?.type === 'lecon' ? action.prochaineItem.id : null;
    case 'fini':
      return null;
  }
}

/** Contexte affiché en tête de quête (leçon + unité), sans jargon. */
export function contexteKouest(lessonId: string): { lecon: string; unite: string } {
  const unite = uniteDeLecon(lessonId);
  return {
    lecon: titreLecon(lessonId),
    unite: unite ? `الوحدة ${unite.numero} · ${unite.titre}` : '',
  };
}

/** Nombre d'étapes déjà réussies pour cette leçon (0..3). */
export function etapesReussies(etat: Etat, lessonId: string): number {
  const drills = etat.drills ?? {};
  return etapesKouest(lessonId).filter((e) => drills[e.cle]).length;
}
