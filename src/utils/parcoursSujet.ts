// Parcours guidé d'un sujet complet — le sujet entier, dans l'ordre du papier, consigne par consigne.
//
// Ce module ne crée aucun contenu : il **assemble** trois sources déjà présentes dans le dépôt
//   1. `data/sujetsOfficiels`  → la consigne, son verbe, la partie, les unités visées ;
//   2. `data/sujetsCorriges`   → les descriptions de documents et les éléments de réponse
//                                officiels (A-009, jamais réécrits ici) ;
//   3. `data/methodologie/attenduVerbes` → ce qu'attend le correcteur + la checklist en 3 points.
//
// Il est pur (aucun import React, aucune date) : l'écran et les tests consomment la même vérité.

import { SUJETS_OFFICIELS, type SujetOfficiel, type VerbeConsigne } from '../data/sujetsOfficiels';
import { corrigeDe } from '../data/sujetsCorriges';
import { attenduDe } from '../data/methodologie/attenduVerbes';
import { cleConsigne } from './entrainement';
import { nb } from './dates';

export interface EtapeGuide {
  /** Même clé que `maitriseSujets` : l'auto-évaluation est partagée avec l'entraîneur du sujet. */
  cle: string;
  exercice: number;
  partie: number;
  consigne: number;
  /** Rang 1-based dans le sujet complet. */
  numero: number;
  exerciceTitre: string;
  unites: string[];
  partieTitre: string;
  contexte?: string;
  /** Descriptions textuelles des documents (le dessin n'est pas dans le dépôt). */
  documents: string[];
  texte: string;
  verbe: VerbeConsigne;
  surDocument: boolean;
  points: number | null;
  /** Ce qu'attend le correcteur, en une ligne (règle de méthode). */
  attendu: string;
  /** Trois points de vérification, dans l'ordre où on les contrôle. */
  checklist: [string, string, string];
  /** Éléments de réponse officiels — vides si le corrigé ne les fournit pas. */
  elements: string[];
  /** D'où viennent les éléments (traçabilité affichée). */
  sourceCorrige?: string;
}

export interface BlocExercice {
  numero: number;
  theme: string;
  unites: string[];
  bareme: number;
  etapes: EtapeGuide[];
}

export interface ParcoursSujet {
  sujet: SujetOfficiel;
  titre: string;
  etapes: EtapeGuide[];
  exercices: BlocExercice[];
  /** Somme des barèmes officiels (jamais présentée comme une note). */
  baremeTotal: number;
  /** Consignes pour lesquelles des éléments de réponse existent réellement. */
  avecElements: number;
}

export function titreSujet(sujet: SujetOfficiel): string {
  return `بكالوريا ${nb(sujet.annee)} · الموضوع ${nb(sujet.numero)}`;
}

export function sujetParId(sujetId: string): SujetOfficiel | undefined {
  return SUJETS_OFFICIELS.find((s) => s.id === sujetId);
}

/** Repli honnête quand la méthode n'a pas encore de règle pour ce verbe. */
function repliAttendu(verbe: VerbeConsigne): { attendu: string; checklist: [string, string, string] } {
  return {
    attendu: `ما ينتظره المصحّح من الفعل «${verbe}»: جواب يبدأ من الوثيقة وينتهي بخلاصة.`,
    checklist: [
      'أستشهد بالوثيقة (معطى، قيمة، تغيّر)',
      'أصِل كل معطى بمعرفة من الدرس',
      'أختم بجملة تجيب عن الفعل المطلوب',
    ],
  };
}

/**
 * Le parcours complet d'un sujet, ou `null` si le sujet n'existe pas.
 * L'ordre est celui du papier : exercice → partie → consigne.
 */
export function parcoursSujet(sujetId: string): ParcoursSujet | null {
  const sujet = sujetParId(sujetId);
  if (!sujet) return null;
  const corrige = corrigeDe(sujet.id);

  const etapes: EtapeGuide[] = [];
  const exercices: BlocExercice[] = [];
  let baremeTotal = 0;
  let avecElements = 0;

  for (const exercice of sujet.exercices) {
    const exCorrige = corrige?.exercices.find((e) => e.numero === exercice.numero);
    baremeTotal += exCorrige?.baremeCorrige ?? exercice.bareme;
    const bloc: BlocExercice = {
      numero: exercice.numero,
      theme: exercice.theme,
      unites: exercice.unites,
      bareme: exCorrige?.baremeCorrige ?? exercice.bareme,
      etapes: [],
    };

    exercice.parties.forEach((partie, ip) => {
      const partieCorrigee = exCorrige?.parties[ip];
      partie.consignes.forEach((consigne, ic) => {
        const reponse = partieCorrigee?.reponses.find((r) => r.consigne === ic);
        const regle = attentuPour(consigne.verbe);
        const elements = reponse?.attendu ?? [];
        if (elements.length > 0) avecElements += 1;
        const etape: EtapeGuide = {
          cle: cleConsigne({ exercice: exercice.numero, partie: ip, consigne: ic }),
          exercice: exercice.numero,
          partie: ip,
          consigne: ic,
          numero: etapes.length + 1,
          exerciceTitre: `${nb(exercice.numero)} · ${exercice.theme}`,
          unites: exercice.unites,
          partieTitre: partie.titre || exercice.theme,
          contexte: partie.contexte,
          documents: partieCorrigee?.documents ?? [],
          texte: consigne.texte,
          verbe: consigne.verbe,
          surDocument: Boolean(consigne.surDocument),
          points: reponse?.points ?? null,
          attendu: regle.attendu,
          checklist: regle.checklist,
          elements,
          sourceCorrige: elements.length ? corrige?.source : undefined,
        };
        etapes.push(etape);
        bloc.etapes.push(etape);
      });
    });

    exercices.push(bloc);
  }

  return {
    sujet,
    titre: titreSujet(sujet),
    etapes,
    exercices,
    baremeTotal,
    avecElements,
  };
}

function attentuPour(verbe: VerbeConsigne): { attendu: string; checklist: [string, string, string] } {
  const regle = attenduDe(verbe);
  return regle ? { attendu: regle.attendu, checklist: regle.checklist } : repliAttendu(verbe);
}

/**
 * Avancement du parcours à partir des auto-évaluations 0/1/2 partagées avec l'entraîneur.
 * On ne parle jamais de réussite : seulement de consignes déjà travaillées.
 */
export function avancementGuide(
  parcours: ParcoursSujet,
  maitrise: Record<string, number> | undefined,
): { travaillees: number; total: number; termine: boolean } {
  const total = parcours.etapes.length;
  const travaillees = parcours.etapes.filter((e) => {
    const niveau = maitrise?.[e.cle];
    return niveau === 0 || niveau === 1 || niveau === 2;
  }).length;
  return { travaillees, total, termine: total > 0 && travaillees === total };
}
