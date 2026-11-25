// Accès aux sujets Bac : recommandation, jamais de verrou.
//
// `bridge.accesSujetBac` portait déjà la règle (libre: true, recommandation si couverture
// < 50 %). Ce module calcule la couverture réelle à partir du travail de l'élève et trace son
// choix de passer outre — sans jamais le juger ni le lui rappeler ensuite.

import { accesSujetBac, type AccesSujet } from './bridge';
import { construireGrille, cleConsigne, estEntrainable } from './entrainement';
import { SUJETS_OFFICIELS, type SujetOfficiel } from '../data/sujetsOfficiels';
import type { Etat } from '../types';

export interface AccesSujetCalcule extends AccesSujet {
  /** Part des consignes déjà auto-évaluées, en pourcentage interne (jamais affichée telle quelle). */
  couverture: number;
  /** L'élève a déjà ouvert ce sujet malgré une couverture faible. */
  dejaPasseOutre: boolean;
}

/** Couverture interne d'un sujet : consignes évaluées (0/1/2) sur consignes entraînables. */
export function couvertureSujet(etat: Etat, sujet: SujetOfficiel): number {
  if (!estEntrainable(sujet.id)) return 0;
  const grille = construireGrille(sujet);
  if (grille.consignes.length === 0) return 0;
  const evaluations = etat.maitriseSujets?.[sujet.id] ?? {};
  const faites = grille.consignes.filter((c) => {
    const niveau = evaluations[cleConsigne(c)];
    return niveau === 0 || niveau === 1 || niveau === 2;
  }).length;
  return Math.round((faites / grille.consignes.length) * 100);
}

export function sujetParId(sujetId: string): SujetOfficiel | undefined {
  return SUJETS_OFFICIELS.find((s) => s.id === sujetId);
}

/** Accès calculé pour un sujet : toujours libre, avec recommandation et trace. */
export function accesSujet(etat: Etat, sujetId: string): AccesSujetCalcule {
  const sujet = sujetParId(sujetId);
  const couverture = sujet ? couvertureSujet(etat, sujet) : 0;
  const dejaPasseOutre = Boolean(etat.derogationsSujets?.[sujetId]);
  const acces = accesSujetBac(couverture, dejaPasseOutre);
  return { ...acces, couverture, dejaPasseOutre };
}

/** Tracé local du « متابعة رغم ذلك » : une date ISO, rien d'autre. */
export function tracerDerogation(etat: Etat, sujetId: string, le: string): Etat {
  if (etat.derogationsSujets?.[sujetId]) return etat;
  return { ...etat, derogationsSujets: { ...(etat.derogationsSujets ?? {}), [sujetId]: le } };
}

/** Sujet pilote du mode guidé (gabarit complet déjà découpé en briques). */
export const SUJET_PILOTE = '2025-1';

export function estSujetPilote(sujetId: string): boolean {
  return sujetId === SUJET_PILOTE;
}
