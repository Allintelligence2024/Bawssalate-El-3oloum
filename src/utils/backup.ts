// Sauvegardes non fiables : valider avant toute modification de l'état local.
// Les comptes, jetons et consentements sont toujours ignorés à l'import.
import { z } from 'zod';
import type { Etat } from '../types';
import type { StatsReponses } from './stats';
import { etatDepuisBrut } from './storage';

const texte = z.string().max(10000);
const court = z.string().max(300);
const date = z.string().max(100);
const nombre = z.number().finite().min(0).max(1000000000);
const entier = nombre.int();
const dictionnaire = <T extends z.ZodTypeAny>(schema: T) =>
  z.record(court, schema).refine((v) => Object.keys(v).length <= 5000);
const liste = <T extends z.ZodTypeAny>(schema: T) => z.array(schema).max(5000);
const progression = z.object({
  statut: z.enum(['vierge', 'en_cours', 'terminee']),
  phases: liste(z.number().int().min(1).max(6)),
  minutes: nombre, repetitions: entier, intervalle: entier, facilite: nombre,
  derniereSession: date.optional(), prochaineRevision: date.optional(),
  lue: z.boolean().optional(), fragile: z.boolean().optional(),
  reponses: dictionnaire(texte).optional(), diagnostic: court.optional(),
  note: nombre.optional(), reussitesIntensif: entier.optional(), acquisIntensifLe: date.optional(),
});
const note = z.object({ id: court, kind: z.enum(['note', 'question']), texte, ts: date, lessonId: court.optional(), uniteId: court.optional() });
const faute = z.object({ id: court, ts: date, contexte: texte, enonce: texte, donne: texte, diagnostic: texte });
const carte = z.object({ verbe: court, exercice: texte, erreur: texte, repetitions: entier, intervalle: entier, facilite: nombre, prochaineRevision: date.optional(), fragile: z.boolean().optional() });
const etatSchema = z.object({
  version: entier.optional(), progression: dictionnaire(progression),
  jalons: dictionnaire(z.object({ fait: z.boolean(), synthese: texte.optional(), ts: date.optional() })).optional(),
  notes: liste(note).optional(), carnet: liste(faute).optional(), journal: liste(date).optional(),
  minutesTotales: nombre.optional(), revisions: entier.optional(), nom: court.optional(), dateBac: date.optional(),
  seancesJour: date.optional(), seancesComptees: entier.optional(), bonusJour: date.optional(),
  drills: dictionnaire(z.literal(true)).optional(), ateliers: dictionnaire(z.object({ fait: z.boolean(), ts: date })).optional(),
  kafaa: dictionnaire(carte).optional(), kafaaHebdo: z.object({ debut: date, n: entier }).optional(),
  revueCroisee: z.object({ semaine: date, lessonIds: liste(court), faiteLe: date.optional() }).optional(),
  defi: z.object({ semaine: date, type: z.enum(['drills', 'croisee', 'examen']), choisiLe: date, baseDrills: entier }).optional(),
  defisAccomplis: liste(date).optional(), objectif: z.union([z.literal(10), z.literal(14), z.literal(18)]).optional(),
  modeIntensif: z.enum(['auto', 'on', 'off']).optional(), tailleTexte: z.enum(['s', 'm', 'l']).optional(),
  diagnostic: z.object({ date, parUnite: dictionnaire(z.object({ justes: entier, total: entier })) }).optional(),
  diagnosticDecideLe: date.optional(), favoris: liste(court).optional(), examensBlancs: liste(date).optional(),
  examens: liste(z.object({ date, secondes: entier, chrono: z.boolean(), qcm: entier, directs: entier, erreursEnquete: entier, unitesFaibles: liste(entier) })).optional(),
  rappel: z.object({ actif: z.boolean(), heure: court }).optional(),
  flashcards: dictionnaire(z.object({ boite: z.union([z.literal(1), z.literal(2), z.literal(3)]), prochaine: date, vues: entier })).optional(),
  schemas: dictionnaire(z.literal(true)).optional(),
});
const compteurs = z.object({ justes: entier, fausses: entier });
const statsSchema = z.object({
  justes: entier, fausses: entier,
  parSource: z.object({ phase: compteurs, revision: compteurs, jalon: compteurs, atelier: compteurs, exercice: compteurs }),
  parJour: dictionnaire(compteurs),
});

export interface SauvegardeLue { etat: Partial<Etat>; stats?: StatsReponses }

/** Formats plats et enveloppés v1/v2/v3 ; un fichier invalide ne modifie rien. */
export function lireSauvegarde(brut: unknown): SauvegardeLue | null {
  if (!brut || typeof brut !== 'object' || Array.isArray(brut)) return null;
  const wrapper = brut as Record<string, unknown>;
  const estEnveloppe = Object.prototype.hasOwnProperty.call(wrapper, 'etat');
  if (wrapper.version !== undefined && ![1, 2, 3].includes(wrapper.version as number)) return null;
  const etatBrut = estEnveloppe ? wrapper.etat : wrapper;
  if (etatBrut && typeof etatBrut === 'object' && !Array.isArray(etatBrut)) {
    const versionEtat = (etatBrut as Record<string, unknown>).version;
    if (versionEtat !== undefined && ![1, 2, 3].includes(versionEtat as number)) return null;
  }
  const resultat = etatSchema.safeParse(etatBrut);
  if (!resultat.success) return null;
  const stats = wrapper.stats === undefined ? undefined : statsSchema.safeParse(wrapper.stats);
  if (stats && !stats.success) return null;
  return { etat: resultat.data as Partial<Etat>, stats: stats?.data as StatsReponses | undefined };
}

/** Normalise uniquement après validation ; aucun compte ou consentement n'est importé. */
export function etatDepuisFichier(brut: unknown): Etat | null {
  const lu = lireSauvegarde(brut);
  if (!lu) return null;
  return normaliserSauvegarde(lu);
}

export function normaliserSauvegarde(lu: SauvegardeLue): Etat {
  return { ...etatDepuisBrut(lu.etat), consentementSync: false, consentementSyncDecideLe: undefined };
}
