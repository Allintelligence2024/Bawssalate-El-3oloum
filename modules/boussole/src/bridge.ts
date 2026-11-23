// Émetteur postMessage v1 (Boussole → Masari hôte).
// Sans effet hors iframe (mode autonome / fichier local). Aucun texte libre écrit par l'élève n'est transmis.

import type { Lab } from "./explore";

export type BoussoleUnitId =
  | "u1"
  | "u2"
  | "u3"
  | "u4"
  | "u5"
  | "u6"
  | "u7"
  | "u8"
  | "u9"
  | "u10"
  | "u11";

export const LAB_META: Record<
  Lab,
  { unitId: BoussoleUnitId; verbe: string }
> = {
  protein: { unitId: "u1", verbe: "استنتج" },
  nerve: { unitId: "u5", verbe: "حلّل" },
  enzyme: { unitId: "u3", verbe: "قارن" },
  immunity: { unitId: "u4", verbe: "استخرج" },
};

let seq = 0;
function nouveauIdTentative(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {}
  seq += 1;
  return `boussole-${Date.now()}-${seq}-${Math.random().toString(36).slice(2, 10)}`;
}

export interface AttemptInput {
  exerciseId: string;
  unitId: BoussoleUnitId;
  verbe: string;
  titre: string;
  reussi: boolean;
  erreurTag?: string;
  prompt?: string;
  choix?: string;
}

export function emitBoussoleAttempt(input: AttemptInput): void {
  if (typeof window === "undefined" || window.parent === window) return;
  const origin = window.location.origin;
  if (!origin || origin === "null") return;
  try {
    window.parent.postMessage(
      {
        type: "learning.attempt.completed",
        schemaVersion: 1,
        source: "boussole",
        attemptId: nouveauIdTentative(),
        exerciseId: input.exerciseId,
        unitId: input.unitId,
        verbe: input.verbe,
        titre: input.titre,
        reussi: input.reussi,
        ...(input.erreurTag ? { erreurTag: input.erreurTag } : {}),
        ...(input.prompt ? { prompt: input.prompt } : {}),
        ...(input.choix ? { choix: input.choix } : {}),
        timestamp: new Date().toISOString(),
      },
      origin,
    );
  } catch {
    // Isolation iframe / protocole non-HTTP : ignorer silencieusement.
  }
}
