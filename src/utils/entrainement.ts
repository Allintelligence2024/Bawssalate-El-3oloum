// Entraîneur Bac (§10.3 du Plan V2) — parcours guidé en 3 temps sur un sujet officiel.
//
// Ce que ce module fait : il transforme un sujet « consultable » en sujet « entraînable ».
// Pour chaque consigne, l'élève lit le verbe, écrit sa réponse, puis s'auto-évalue sur une
// grille 0/1/2 dérivée des critères réels du corrigé.
//
// Ce que ce module refuse de faire :
//   - produire une note sur 20 (aucune calibration statistique) ;
//   - bloquer un élève parce qu'il n'a pas assez révisé ;
//   - prétendre que l'auto-évaluation vaut correction. C'est un entraînement à l'auto-contrôle,
//     pas une note officielle — c'est écrit dans l'interface et testé.
//
// Fonctions pures : aucun accès au stockage, au réseau ou au DOM. La persistance est faite
// par l'appelant, sur les mêmes clés que le reste du moteur local.

import type { SujetOfficiel, VerbeConsigne } from '../data/sujetsOfficiels';
import { corrigeDe } from '../data/sujetsCorriges';

/** Niveau d'auto-évaluation : 0 = non atteint, 1 = partiel, 2 = conforme. */
export type NiveauMaitrise = 0 | 1 | 2;

export interface GrilleConsigne {
  exercice: number;
  partie: number;
  consigne: number;
  verbe: VerbeConsigne;
  texte: string;
  /** Points officiels de cette consigne dans le barème du corrigé */
  points: number | null;
  /** Critères attendus, repris du corrigé (reformulés, jamais recopiés tels quels à l'écran) */
  attendu: string[];
  /** Ce que le correcteur attend du verbe (aide à la demande) */
  attenteDuVerbe?: string;
}

export interface SujetEntrainable {
  sujetId: string;
  titre: string;
  consignes: GrilleConsigne[];
  /** Barème total tel que le corrigé le compte */
  baremeTotal: number;
}

const ATTENTE_DU_VERBE: Partial<Record<VerbeConsigne, string>> = {
  'حلِّل': 'وصف التغيّر بالأرقام ثمّ استنتاج واحد.',
  'قارن': 'تشابه ثمّ اختلاف، في الشروط نفسها.',
  'فسِّر': 'ربط الملاحظة بآلية من الدرس.',
  'برِّر': 'حجّة من الوثيقة + حجّة من المعرفة.',
  'ناقش': 'اختبار كلّ فرضية بنتيجة، مع القبول أو الرفض.',
  'نصّ علمي': 'مقدّمة · عرض بالآليات · خاتمة تجيب عن الإشكال.',
  'مخطّط': 'أسهم مرقّمة، عنوان، بيانات على كلّ سهم.',
  'رسم تخطيطي': 'رسم وظيفي بالبيانات كاملة.',
  'استخلص': 'جملة تعميم، لا إعادة سرد.',
  'استنتج': 'ما يلزم من المعطيات، بجملة واحدة.',
  'سمِّ': 'الاسم الدقيق كما في الدرس.',
  'حدِّد': 'إجابة مباشرة بلا شرح زائد.',
  'اقترح فرضية': 'جملة قابلة للاختبار تبدأ بـ«ربّما».',
  'نصيحة': 'نصيحة مبرّرة بالنتائج العلمية.',
};

/** Le sujet peut-il être entraîné ? Il faut un corrigé : sans lui, pas de critères. */
export function estEntrainable(sujetId: string): boolean {
  return corrigeDe(sujetId) !== undefined;
}

/**
 * Construit la grille d'entraînement d'un sujet.
 * Une consigne sans élément de réponse est incluse avec `points: null` et `attendu: []` :
 * l'élève doit la traiter quand même, mais on ne lui invente pas de critère.
 */
export function construireGrille(sujet: SujetOfficiel): SujetEntrainable {
  const corrige = corrigeDe(sujet.id);
  const consignes: GrilleConsigne[] = [];
  let baremeTotal = 0;

  for (const exercice of sujet.exercices) {
    const exCorrige = corrige?.exercices.find((e) => e.numero === exercice.numero);
    baremeTotal += exCorrige?.baremeCorrige ?? exercice.bareme;
    exercice.parties.forEach((partie, ip) => {
      partie.consignes.forEach((consigne, ic) => {
        const reponse = exCorrige?.parties[ip]?.reponses.find((r) => r.consigne === ic);
        consignes.push({
          exercice: exercice.numero,
          partie: ip,
          consigne: ic,
          verbe: consigne.verbe,
          texte: consigne.texte,
          points: reponse?.points ?? null,
          attendu: reponse?.attendu ?? [],
          attenteDuVerbe: ATTENTE_DU_VERBE[consigne.verbe],
        });
      });
    });
  }

  return { sujetId: sujet.id, titre: `بكالوريا ${sujet.annee} — الموضوع ${sujet.numero}`, consignes, baremeTotal };
}

/**
 * Score d'un sujet auto-évalué, exprimé en deux choses distinctes :
 *   - `pointsObtenus` sur `baremeTotal` (barème officiel, informatif) ;
 *   - `maitrise` de 0 à 100, moyenne pondérée par les points (indicateur interne).
 * Aucune des deux n'est une prédiction de note au Bac.
 */
export interface ResultatEntrainement {
  sujetId: string;
  pointsObtenus: number;
  baremeTotal: number;
  maitrise: number;
  parConsigne: Record<string, NiveauMaitrise>;
  consignesSansCritere: number;
}

export function calculerResultat(
  entrainable: SujetEntrainable,
  evaluations: Record<string, NiveauMaitrise>,
): ResultatEntrainement {
  let pointsObtenus = 0;
  let poidsTotal = 0;
  let ponderee = 0;
  let sansCritere = 0;

  for (const c of entrainable.consignes) {
    const cle = cleConsigne(c);
    const niveau = evaluations[cle];
    if (niveau === undefined) continue;
    const points = c.points ?? 0;
    if (c.points === null || c.attendu.length === 0) sansCritere++;

    // Barème officiel : la consigne vaut ses points × niveau/2.
    pointsObtenus += (points * niveau) / 2;

    // Maîtrise : pondérée par l'importance réelle de la consigne, jamais par le nombre
    // de clics. Une consigne sans points compte pour 1 afin de ne pas disparaître.
    const poids = points > 0 ? points : 1;
    poidsTotal += poids;
    ponderee += poids * (niveau / 2);
  }

  return {
    sujetId: entrainable.sujetId,
    pointsObtenus: Math.round(pointsObtenus * 100) / 100,
    baremeTotal: entrainable.baremeTotal,
    maitrise: poidsTotal === 0 ? 0 : Math.round((ponderee / poidsTotal) * 100),
    parConsigne: { ...evaluations },
    consignesSansCritere: sansCritere,
  };
}

export function cleConsigne(c: Pick<GrilleConsigne, 'exercice' | 'partie' | 'consigne'>): string {
  return `e${c.exercice}p${c.partie}c${c.consigne}`;
}

/** Statut qualitatif, jamais un pourcentage affiché comme une note (§11.3). */
export function statutQualitatif(maitrise: number): 'fragile' | 'en_cours' | 'solide' {
  if (maitrise < 40) return 'fragile';
  if (maitrise < 75) return 'en_cours';
  return 'solide';
}

/**
 * Les consignes à retravailler en priorité : celles évaluées 0 ou 1, les plus lourdes
 * d'abord. Plafonné à 5, comme `planDeJour` (§11.2) : un mur de retard ne motive personne.
 */
export function priorites(entrainable: SujetEntrainable, evaluations: Record<string, NiveauMaitrise>, plafond = 5): GrilleConsigne[] {
  return entrainable.consignes
    .filter((c) => {
      const n = evaluations[cleConsigne(c)];
      return n === 0 || n === 1;
    })
    .sort((a, b) => (b.points ?? 0) - (a.points ?? 0))
    .slice(0, plafond);
}
