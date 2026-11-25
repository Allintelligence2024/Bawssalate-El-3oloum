// Contrat typé v1 du pont postMessage entre le laboratoire Boussole (iframe) et l'application hôte Masari.
// Principe fondamental : « Preuve ≠ Complétion » et « Aucun texte libre écrit par l'élève n'est émis ».

import { z } from 'zod';

export const BOUSSOLE_EVENT_TYPE = 'learning.attempt.completed' as const;
export const BOUSSOLE_SCHEMA_VERSION = 1 as const;
export const BOUSSOLE_SOURCE = 'boussole' as const;

export const UNITE_IDS = ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10', 'u11'] as const;

// v0.11 — champs OPTIONNELS ajoutés par l'hôte (briques, exercices, sujets). Le laboratoire
// embarqué continue d'émettre exactement le même v1 : un ancien producteur reste valide, et
// `parseBoussoleEvent` normalise l'origine pour que les consommateurs n'aient qu'un seul cas.
export const ORIGINES_EVENEMENT = ['boussole', 'exercice', 'sujet', 'drill', 'briques'] as const;
export const MODES_EVENEMENT = ['atelier', 'briques', 'redaction', 'libre'] as const;
export const CRITERES_EVENEMENT = ['observation', 'comparaison', 'interpretation', 'conclusion', 'piege'] as const;

export const boussoleAttemptEventSchema = z.object({
  type: z.literal(BOUSSOLE_EVENT_TYPE),
  schemaVersion: z.literal(BOUSSOLE_SCHEMA_VERSION),
  source: z.literal(BOUSSOLE_SOURCE),
  attemptId: z.string().min(8).max(128),
  exerciseId: z.string().min(2).max(100),
  unitId: z.enum(UNITE_IDS),
  verbe: z.string().min(1).max(60),
  titre: z.string().min(1).max(160),
  reussi: z.boolean(),
  erreurTag: z.string().max(300).optional(),
  prompt: z.string().max(300).optional(),
  choix: z.string().max(200).optional(),
  timestamp: z.string().min(10).max(64),
  origine: z.enum(ORIGINES_EVENEMENT).optional(),
  mode: z.enum(MODES_EVENEMENT).optional(),
  jeuId: z.string().min(2).max(100).optional(),
  criteres: z.array(z.enum(CRITERES_EVENEMENT)).max(8).optional(),
});

export type BoussoleAttemptEvent = z.infer<typeof boussoleAttemptEventSchema>;

export function parseBoussoleEvent(raw: unknown): BoussoleAttemptEvent | null {
  const res = boussoleAttemptEventSchema.safeParse(raw);
  if (!res.success) return null;
  return { ...res.data, origine: res.data.origine ?? BOUSSOLE_SOURCE };
}
