// Adaptateur de types du moteur `bridge` (§11.1 du Plan V2).
//
// Rôle : relier les concepts du moteur de maîtrise aux vraies structures du dépôt, sans
// dupliquer `programme.ts`. Toute clé inconnue doit échouer bruyamment, pas silencieusement :
// un identifiant de leçon ou d'unité faux produirait un plan de révision qui pointe dans le vide.
//
// Ce fichier ne contient que des données dérivées et des fonctions pures de correspondance.
import { UNITES } from '../data/programme';
import type { VerbeConsigne } from '../data/sujetsOfficiels';

/** Une compétence scientifique entraînable, indépendante d'une unité particulière. */
export type Competence =
  | 'C1_exploiter_document'   // lire un document, en extraire l'information
  | 'C2_analyser_courbe'      // décrire une variation, comparer des séries
  | 'C3_mettre_en_relation'   // relier un résultat à une connaissance du cours
  | 'C4_argumenter'           // justifier, discuter une hypothèse
  | 'C5_conclure'             // généraliser, répondre à l'échelon demandé
  | 'C6_schematiser'          // traduire en schéma fonctionnel légendé
  | 'C7_rediger_scientifique' // structurer une réponse longue
  | 'C8_proposer';            // formuler une hypothèse ou une prévention

export const COMPETENCES: Competence[] = [
  'C1_exploiter_document', 'C2_analyser_courbe', 'C3_mettre_en_relation', 'C4_argumenter',
  'C5_conclure', 'C6_schematiser', 'C7_rediger_scientifique', 'C8_proposer',
];

/**
 * Table officielle verbe de consigne → compétence.
 * Les 20 verbes du Bac tombent tous ici ; aucune exception silencieuse : `competenceDe`
 * lève sur un verbe absent, et un test vérifie que la table couvre exactement les verbes
 * réellement utilisés dans `sujetsOfficiels.ts`.
 */
export const VERBE_VERS_COMPETENCE: Record<VerbeConsigne, Competence> = {
  'سمِّ': 'C1_exploiter_document',
  'تعرَّف': 'C1_exploiter_document',
  'حدِّد': 'C1_exploiter_document',
  'استخرج': 'C1_exploiter_document',
  'حلِّل': 'C2_analyser_courbe',
  'قارن': 'C2_analyser_courbe',
  'فسِّر': 'C3_mettre_en_relation',
  'بيِّن': 'C3_mettre_en_relation',
  'اشرح': 'C3_mettre_en_relation',
  'وضِّح': 'C3_mettre_en_relation',
  'استدلّ': 'C3_mettre_en_relation',
  'برِّر': 'C4_argumenter',
  'ناقش': 'C4_argumenter',
  'استخلص': 'C5_conclure',
  'استنتج': 'C5_conclure',
  'مخطّط': 'C6_schematiser',
  'رسم تخطيطي': 'C6_schematiser',
  'نصّ علمي': 'C7_rediger_scientifique',
  'اقترح فرضية': 'C8_proposer',
  'نصيحة': 'C8_proposer',
};

export function competenceDe(verbe: VerbeConsigne): Competence {
  const c = VERBE_VERS_COMPETENCE[verbe];
  if (!c) throw new Error(`Verbe sans compétence associée : ${verbe}`);
  return c;
}

/** Accès indexé aux unités, construit une seule fois depuis la source de vérité. */
export const UNITE_PAR_ID: ReadonlyMap<string, (typeof UNITES)[number]> = new Map(
  UNITES.map((u) => [u.id, u]),
);

/** Poids Bac d'une unité, ou erreur explicite : jamais un 0 silencieux. */
export function poidsBac(uniteId: string): number {
  const u = UNITE_PAR_ID.get(uniteId);
  if (!u) throw new Error(`Unité inconnue : ${uniteId}`);
  return u.poidsBac;
}

/** Leçons d'une unité, dans l'ordre du programme. */
export function leconsDeUnite(uniteId: string): string[] {
  const u = UNITE_PAR_ID.get(uniteId);
  if (!u) throw new Error(`Unité inconnue : ${uniteId}`);
  return [...u.lessonIds];
}

/**
 * Prérequis d'unités (§11.3) : l'ordre du programme n'est pas une suggestion.
 * `u3` avant `u4` etc. — la table est explicite plutôt que déduite d'un numéro, parce que
 * les prérequis réels ne suivent pas toujours l'ordre des numéros.
 */
export const PREREQUIS_UNITES: Record<string, string[]> = {
  u1: [],
  u2: ['u1'],
  u3: ['u2'],
  u4: ['u3'],
  u5: ['u4'],
  u6: ['u3'],
  u7: ['u6'],
  u8: ['u7'],
  u9: ['u1'],
  u10: ['u9'],
  u11: ['u10'],
};

/** Unités qu'il faut avoir abordées avant celle-ci, d'après le programme. */
export function prerequisDe(uniteId: string): string[] {
  return PREREQUIS_UNITES[uniteId] ?? [];
}
