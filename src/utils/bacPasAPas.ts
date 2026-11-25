// «الباك خطوة بخطوة» — قلب cette étape : une consigne de l'examen devient UNE étape.
//
// Aucune donnée n'est recopiée ici : on lit `sujetsOfficiels` (structure) et
// `sujetsCorriges` (éléments de réponse). Le lien entre les deux se fait par
// `${sujetId}:${numéroExercice}:${partie}:${consigne}` — la même clé sert au stockage.

import type { ExerciceOfficiel, SujetOfficiel } from '../data/sujetsOfficiels';
import { corrigeDe } from '../data/sujetsCorriges';
import type { Etat } from '../types';

/** Qualité auto-évaluée d'une étape — elle vaut aussi le nombre d'XP gagnés. */
export type QualiteEtape = 3 | 2 | 0;

export interface EtapeBac {
  cle: string;
  numero: number; // 1-based, pour « خطوة 2 من 5 »
  partie: string; // 'الجزء الأول' ou le thème de l'exercice
  contexte?: string;
  verbe: string;
  texte: string;
  surDocument: boolean;
  documents: string[];
  attendu: string[];
  points?: number;
}

export function cleExercice(sujetId: string, numeroExercice: number): string {
  return `${sujetId}:${numeroExercice}`;
}

function cleEtape(sujetId: string, numeroExercice: number, partie: number, consigne: number): string {
  return `${sujetId}:${numeroExercice}:${partie}:${consigne}`;
}

/** Toutes les étapes d'un exercice, dans l'ordre du sujet. */
export function etapesDe(sujet: SujetOfficiel, exercice: ExerciceOfficiel): EtapeBac[] {
  const corrige = corrigeDe(sujet.id)?.exercices.find((e) => e.numero === exercice.numero);
  const etapes: EtapeBac[] = [];

  exercice.parties.forEach((partie, pi) => {
    const partieCorrigee = corrige?.parties[pi];
    partie.consignes.forEach((consigne, ci) => {
      const reponse = partieCorrigee?.reponses.find((r) => r.consigne === ci);
      etapes.push({
        cle: cleEtape(sujet.id, exercice.numero, pi, ci),
        numero: etapes.length + 1,
        partie: partie.titre || exercice.theme,
        contexte: partie.contexte,
        verbe: consigne.verbe,
        texte: consigne.texte,
        surDocument: Boolean(consigne.surDocument),
        documents: partieCorrigee?.documents ?? [],
        attendu: reponse?.attendu ?? [],
        points: reponse?.points,
      });
    });
  });

  return etapes;
}

/** Combien d'étapes de cet exercice sont déjà évaluées, et pour combien d'XP. */
export function avancementExercice(
  etat: Etat,
  etapes: EtapeBac[],
): { faites: number; xp: number; terminee: boolean } {
  let xp = 0;
  let faites = 0;
  for (const e of etapes) {
    const q = etat.bacEtapes?.[e.cle];
    if (q === undefined) continue;
    faites += 1;
    xp += q;
  }
  return { faites, xp, terminee: etapes.length > 0 && faites === etapes.length };
}

/** Nombre d'étapes déjà traitées dans tous les sujets (pour les statistiques). */
export function etapesFaites(etat: Etat): number {
  return Object.keys(etat.bacEtapes ?? {}).length;
}
