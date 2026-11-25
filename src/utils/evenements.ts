// Contrat d'événement local `learning.attempt.completed` (v1 étendu, rétro-compatible).
//
// Trois promesses, vérifiées par les tests :
//   1. **Evidence ≠ Completion** — un événement n'écrit JAMAIS `progression[].statut`,
//      `progression[].phases` ni `jalons` : il ne fait que nourrir `kafaa`, `trophees` et le
//      carnet. Seule une porte de micro-nœud termine une leçon.
//   2. **Idempotence** — le même `attemptId` rejoué n'a aucun effet supplémentaire
//      (`boussoleEventsSeen`, plafonné à 500 identifiants).
//   3. **Zéro texte libre** — un événement ne transporte que des identifiants et des énumérations ;
//      les brouillons de l'élève restent dans `localStorage`, jamais dans l'événement.

import type { BoussoleAttemptEvent } from '../types/boussoleBridge';
import type { BriqueRole, Etat } from '../types';
import { aujourdhui } from './dates';

export const PLAFOND_EVENEMENTS = 500;

export const ORIGINES = ['boussole', 'exercice', 'sujet', 'drill', 'briques'] as const;
export type Origine = (typeof ORIGINES)[number];

export const MODES = ['atelier', 'briques', 'redaction', 'libre'] as const;
export type ModeTentative = (typeof MODES)[number];

export interface TentativeLocale {
  type: 'learning.attempt.completed';
  schemaVersion: 1;
  /** `briques` (local) ou `boussole` (iframe) : les deux passent par le même contrat. */
  source: 'boussole' | 'briques';
  attemptId: string;
  origine: Origine;
  mode: ModeTentative;
  exerciceId: string;
  uniteId: string;
  verbe: string;
  titre: string;
  reussi: boolean;
  /** Rôles de briques satisfaits (jamais le texte des réponses). */
  criteres?: BriqueRole[];
  /** Diagnostic nommé quand une tentative est incomplète. */
  erreurTag?: string;
  timestamp: string;
}

/** Fabrique déterministe : l'appelant fournit l'horodatage (aucun `Date.now()` caché). */
export function tentative(params: {
  attemptId: string;
  origine: Origine;
  mode: ModeTentative;
  exerciceId: string;
  uniteId: string;
  verbe: string;
  titre: string;
  reussi: boolean;
  criteres?: BriqueRole[];
  erreurTag?: string;
  timestamp: string;
}): TentativeLocale {
  return {
    type: 'learning.attempt.completed',
    schemaVersion: 1,
    source: params.origine === 'boussole' ? 'boussole' : 'briques',
    attemptId: params.attemptId,
    origine: params.origine,
    mode: params.mode,
    exerciceId: params.exerciceId,
    uniteId: params.uniteId,
    verbe: params.verbe,
    titre: params.titre.slice(0, 160),
    reussi: params.reussi,
    ...(params.criteres ? { criteres: params.criteres } : {}),
    ...(params.erreurTag ? { erreurTag: params.erreurTag.slice(0, 300) } : {}),
    timestamp: params.timestamp,
  };
}

/** Clé d'idempotence : le couple (origine, attemptId) suffit à distinguer un rejeu. */
export function cleEvenement(t: { origine?: Origine; attemptId: string }): string {
  return `${t.origine ?? 'boussole'}:${t.attemptId}`;
}

export function dejaVu(etat: Etat, cle: string): boolean {
  return (etat.boussoleEventsSeen ?? []).includes(cle);
}

/** Ajoute la clé vue, en gardant les `PLAFOND_EVENEMENTS` dernières. */
export function marquerVu(etat: Etat, cle: string): string[] {
  const vus = etat.boussoleEventsSeen ?? [];
  if (vus.includes(cle)) return vus;
  return [...vus, cle].slice(-PLAFOND_EVENEMENTS);
}

/**
 * Trophées tactiques : un compteur par verbe travaillé en 1-2-3.
 * Ce n'est ni une note ni une série à ne pas casser — seulement la trace d'un travail.
 */
export function consignerTrophee(etat: Etat, verbe: string, le: string): Etat['trophees'] {
  const actuels = etat.trophees ?? {};
  const existant = actuels[verbe];
  return {
    ...actuels,
    [verbe]: { le, n: (existant?.n ?? 0) + 1 },
  };
}

// ───────────── Boucliers SM-2 (anti-anxiété) ─────────────
// Un bouclier = quatre jours d'activité sur les sept derniers. Il ne s'agit pas d'une série
// à ne pas casser : le bouclier est acquis, il ne se perd pas, et il autorise un jour de repos
// sans que rien ne « casse ».

export const SEUIL_BOUCLIER = 4;
export const BOUCLIERS_MAX = 3;

export function boucliers(etat: Etat, aujourdhuiIso: string = aujourdhui()): { acquis: number; jours: number } {
  const jours = new Set(etat.journal);
  const sept = new Set<string>();
  const d = new Date(`${aujourdhuiIso}T12:00:00`);
  for (let i = 0; i < 7; i++) {
    const copie = new Date(d);
    copie.setDate(d.getDate() - i);
    const iso = `${copie.getFullYear()}-${String(copie.getMonth() + 1).padStart(2, '0')}-${String(copie.getDate()).padStart(2, '0')}`;
    if (jours.has(iso)) sept.add(iso);
  }
  // Barème produit (plan directeur §6) : 4 ou 5 jours = 1 bouclier, 6 jours = 2, 7 jours = 3.
  // Explicite plutôt qu'une formule : la progression est une promesse faite à l'élève.
  const acquis =
    sept.size >= 7 ? BOUCLIERS_MAX : sept.size >= 6 ? 2 : sept.size >= SEUIL_BOUCLIER ? 1 : 0;
  return { acquis, jours: sept.size };
}
