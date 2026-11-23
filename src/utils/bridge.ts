// Moteur de maîtrise `bridge` (§11.2 du Plan V2) — fonctions pures.
//
// Quatre briques, reprises des mécaniques validées (Avis 5 et 7) et **pas** du moteur
// d'origine : celui-ci produisait une fausse note /20, sautait des prérequis et activait
// des règles générées automatiquement sans relecture.
//
// Garde-fous produit appliqués ici (§11.3), non négociables :
//   1. aucune note sur 20, sous aucune forme (`noteMin`/`noteMax` n'existent pas) ;
//   2. la maîtrise sert à ordonner des actions, pas à juger un élève ;
//   3. aucun verrou dur sur les sujets de Bac : au pire une recommandation + une trace ;
//   4. les prérequis d'unités sont respectés, avec dérogation explicite et tracée.
import {
  COMPETENCES, competenceDe, leconsDeUnite, poidsBac, prerequisDe, UNITE_PAR_ID,
  type Competence,
} from './bridgeAdapter';
import type { VerbeConsigne } from '../data/sujetsOfficiels';

/** Niveau d'une compétence, 0 à 100, avec le nombre de preuves qui le soutiennent. */
export interface NiveauCompetence {
  niveau: number;
  preuves: number;
  /** Dernière fois qu'une preuve a été enregistrée (ISO) */
  vuLe?: string;
}

export type Niveaux = Record<Competence, NiveauCompetence>;

export function niveauxVierges(): Niveaux {
  return Object.fromEntries(
    COMPETENCES.map((c) => [c, { niveau: 0, preuves: 0 }]),
  ) as Niveaux;
}

const borner = (n: number) => Math.max(0, Math.min(100, n));

/**
 * Brique 1 — correction de confiance.
 * Un niveau soutenu par une seule preuve n'est pas un niveau : on l'abaisse par
 * `min(1, 0.7 + 0.05 × preuves)`. À 1 preuve : ×0,75. À 6 preuves : ×1.
 * Sans ça, un élève qui réussit une fois passe pour acquis sur toute une compétence.
 */
export function niveauConfiance(n: NiveauCompetence): number {
  const ponderation = Math.min(1, 0.7 + 0.05 * Math.max(0, n.preuves));
  return borner(n.niveau * ponderation);
}

/**
 * Vue lisible : les compétences triées pour ordonner les actions.
 *
 * Le tri ne peut pas porter sur le seul niveau : une compétence jamais travaillée vaut 0
 * et passerait avant une compétence réellement faible mais déjà mesurée — on enverrait
 * l'élève sur ce qu'il n'a jamais fait, pas sur ce qu'il rate. On trie donc d'abord par
 * « mesurée ou non » (les mesurées d'abord), puis par niveau corrigé croissant.
 */
export function competencesTriees(niveaux: Niveaux): { competence: Competence; niveauConfiance: number; preuves: number }[] {
  return COMPETENCES
    .map((c) => ({ competence: c, niveauConfiance: niveauConfiance(niveaux[c]), preuves: niveaux[c].preuves }))
    .sort((a, b) => {
      const mesuree = (x: { preuves: number }) => (x.preuves > 0 ? 0 : 1);
      return mesuree(a) - mesuree(b) || a.niveauConfiance - b.niveauConfiance;
    });
}

export interface Evenement {
  verbe: VerbeConsigne;
  /** Score observé sur la consigne, de 0 à 2 (grille d'auto-évaluation §10.3) */
  score: 0 | 1 | 2;
  /** Mode chronométré : lissage plus rapide, car l'épreuve ne pardonne pas l'attente */
  chronometre?: boolean;
  le?: string;
}

/**
 * Brique 2 — lissage `writeBack`.
 * L'observation est convertie sur 100 (`score / 2 × 100`) puis intégrée par lissage :
 *   `nouveau = (1 − α) × ancien + α × observé`, avec α = 0,3 (0,4 en chronométré).
 * Écrasement immédiat vers « fragile » (≤ 20) si le score observé est ≤ 1 : une réussite
 * partielle ne doit pas être noyée dans une moyenne historique flatteuse.
 *
 * Idempotence : rejouer le même événement deux fois ne change pas le niveau au-delà du
 * premier passage si `vuLe` est identique — c'est testé.
 */
export function writeBack(niveaux: Niveaux, evenement: Evenement): Niveaux {
  const competence = competenceDe(evenement.verbe);
  const actuel = niveaux[competence];
  if (evenement.le && actuel.vuLe === evenement.le) return niveaux; // déjà appliqué

  const alpha = evenement.chronometre ? 0.4 : 0.3;
  const observe = (evenement.score / 2) * 100;
  let suivant = (1 - alpha) * actuel.niveau + alpha * observe;

  if (evenement.score <= 1) suivant = Math.min(suivant, 20); // effondrement vers fragile

  return {
    ...niveaux,
    [competence]: {
      niveau: borner(suivant),
      preuves: actuel.preuves + 1,
      vuLe: evenement.le ?? actuel.vuLe,
    },
  };
}

/** Raisons explicites, en arabe, pour l'écran (jamais un pourcentage nu). */
export function raisons(niveau: NiveauCompetence): string[] {
  const r: string[] = [];
  if (niveau.preuves === 0) r.push('لا توجد بعد إجابات على تعليمات هذه الكفاءة.');
  else if (niveau.preuves <= 2) r.push(`عدد الأدلّة قليل (${niveau.preuves})؛ الحكم مؤقّت.`);
  else r.push(`مبنيّ على ${niveau.preuves} أدلّة.`);
  const conf = niveauConfiance(niveau);
  if (conf < 40) r.push('المستوى ما زال هشًّا: ابدأ بوثيقة قصيرة.');
  else if (conf < 75) r.push('المستوى في الطريق: زد تدريبًا على نفس الفعل.');
  else r.push('المستوى متين: انتقل إلى فعل آخر.');
  return r;
}

/** Action proposée : une seule, jamais une liste qui décourage. */
export interface ActionDuJour {
  type: 'revision' | 'nouvelle_lecon' | 'entrainement_sujet';
  uniteId?: string;
  leconId?: string;
  competence?: Competence;
  /** Message explicatif affiché à l'élève, en arabe */
  pourquoi: string;
}

/**
 * Brique 3 — `planDeJour` avec plafond de dette.
 * Après deux ou trois semaines d'absence, le nombre de révisions dues peut dépasser la
 * centaine. Le plafond à 5 est une décision produit : le surplus reste en file, il n'est
 * ni supprimé ni reproché.
 */
export const PLAFOND_DETTE = 5;

export interface EntreePlan {
  /** Unités déjà abordées (au moins une leçon ouverte) */
  unitesAbordees: string[];
  /** Leçons marquées « dues » par le SRS, déjà triées par priorité */
  revisionsDues: string[];
  niveaux: Niveaux;
  /** Unités autorisées malgré les prérequis, avec la date de dérogation */
  derogations?: Record<string, string>;
}

export interface PlanDeJour {
  actions: ActionDuJour[];
  /** Révisions réellement planifiées */
  revisionsRetenues: number;
  /** Révisions laissées en file à cause du plafond */
  revisionsReportees: number;
  /** Recommandations non bloquantes */
  recommandations: string[];
}

export function planDeJour(entree: EntreePlan): PlanDeJour {
  const actions: ActionDuJour[] = [];
  const recommandations: string[] = [];

  // Révisions d'abord, plafonnées.
  const retenues = entree.revisionsDues.slice(0, PLAFOND_DETTE);
  for (const leconId of retenues) {
    actions.push({ type: 'revision', leconId, pourquoi: 'مراجعة مستحقّة — لا تتجاوز اليوم خمسًا.' });
  }
  const reportees = Math.max(0, entree.revisionsDues.length - retenues.length);

  // Puis la compétence la plus faible, si elle est connue.
  const faible = competencesTriees(entree.niveaux)[0];
  if (actions.length < PLAFOND_DETTE && faible && faible.preuves > 0) {
    actions.push({
      type: 'entrainement_sujet',
      competence: faible.competence,
      pourquoi: 'أضعف كفاءة عندك الآن — تدريب قصير يكفي.',
    });
  }

  // Enfin une leçon nouvelle, en respectant les prérequis.
  const candidate = [...UNITE_PAR_ID.keys()]
    .filter((u) => !entree.unitesAbordees.includes(u))
    .filter((u) => prerequisDe(u).every((p) => entree.unitesAbordees.includes(p) || entree.derogations?.[u]))
    .sort((a, b) => poidsBac(b) - poidsBac(a))[0];

  if (candidate && actions.length < PLAFOND_DETTE) {
    const lecon = leconsDeUnite(candidate)[0];
    actions.push({
      type: 'nouvelle_lecon',
      uniteId: candidate,
      leconId: lecon,
      pourquoi: `الوحدة ${candidate} هي الأثقل في البرنامج ضمن ما تسمح به المتطلّبات.`,
    });
  } else if (candidate === undefined) {
    // Pas d'erreur : une recommandation explicable, jamais un blocage.
    recommandations.push('لا توجد وحدة جديدة متاحة الآن دون تجاوز متطلّبات سابقة.');
  }

  return { actions, revisionsRetenues: retenues.length, revisionsReportees: reportees, recommandations };
}

/**
 * Brique 4 — passerelle en file de validation.
 * Toute règle générée automatiquement naît inactive : elle attend une relecture humaine.
 */
export interface ReglePasserelle {
  id: string;
  regle: string;
  source: 'auto' | 'manuel';
  actif: boolean;
}

export function creerReglesAuto(regles: { id: string; regle: string }[]): ReglePasserelle[] {
  return regles.map((r) => ({ ...r, source: 'auto' as const, actif: false }));
}

/** Seul un passage explicite à `manuel` active une règle. */
export function activerRegle(regle: ReglePasserelle): ReglePasserelle {
  if (regle.source !== 'manuel') return regle; // une règle auto ne s'active pas elle-même
  return { ...regle, actif: true };
}

export function reglesActives(regles: ReglePasserelle[]): ReglePasserelle[] {
  return regles.filter((r) => r.actif && r.source === 'manuel');
}

/**
 * Garde-fou §11.3 — accès à un sujet de Bac.
 * L'application ne bloque jamais : elle recommande, et trace le choix de l'élève.
 */
export interface AccesSujet {
  libre: true;
  recommandation?: string;
  /** L'élève a choisi de passer outre : on le note, sans le juger */
  passeOutre: boolean;
}

export function accesSujetBac(couverture: number, passeOutre: boolean): AccesSujet {
  const seuil = 50;
  if (couverture >= seuil || passeOutre) return { libre: true, passeOutre };
  return {
    libre: true,
    passeOutre: false,
    recommandation: 'التغطية ما زالت منخفضة — ننصح بمراجعة الوحدة أولاً، ويمكنك المتابعة رغم ذلك.',
  };
}

/** Statut qualitatif d'une unité, pour l'affichage sobre (jamais un pourcentage anxieux). */
export function statutUnite(niveaux: Niveaux): 'fragile' | 'en_cours' | 'solide' {
  const moyenne = COMPETENCES.reduce((s, c) => s + niveauConfiance(niveaux[c]), 0) / COMPETENCES.length;
  if (moyenne < 40) return 'fragile';
  if (moyenne < 75) return 'en_cours';
  return 'solide';
}
