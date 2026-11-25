// Adaptateur pur Boussole → Masari (Lot 5A & Lot 5B)
// Règles pédagogiques strictes :
//  1. Idempotence stricte par `attemptId` (anneau borné à 500 événements).
//  2. « Preuve ≠ Complétion » : un événement Boussole ne marque JAMAIS une leçon `terminee`
//     et ne débloque JAMAIS un jalon d'unité.
//  3. Boucle croisée (Lot 5B) : un échec méthodologique en Boussole (ou en Méthodologie)
//     marque les leçons terminées de l'unité liée comme `fragile: true` et réduit de moitié
//     leur intervalle SM-2 (plancher 1 jour), sans jamais effacer `statut: 'terminee'`.

import type { CarteKafaa, Etat, FauteCarnet } from '../types';
import type { BoussoleAttemptEvent } from '../types/boussoleBridge';
import { UNITE_PAR_ID } from '../data/programme';
import { ajouterJours, aujourdhui, differenceJours } from './dates';
import { mettreAJourSrs } from './srs';

export const MAX_BOUSSOLE_EVENTS_SEEN = 500;
const MAX_CARNET_FAUTES = 200;

/**
 * Rétrogradation croisée (Lot 5B) : lorsqu'une carte de méthodologie (`kafaa`) échoue
 * sur une unité donnée, les leçons DÉJÀ terminées de cette unité deviennent `fragile: true`
 * et leur intervalle SM-2 est divisé par 2 (plancher 1 jour) afin d'être revues plus tôt.
 * Ne modifie jamais le statut `terminee` et ne touche pas aux leçons non terminées.
 */
export function demoterProgressionDepuisKafaa(
  etat: Etat,
  uniteId: string,
  auj: string = aujourdhui(),
): Etat {
  const unite = UNITE_PAR_ID[uniteId];
  if (!unite) return etat;

  let modifie = false;
  const progression = { ...etat.progression };

  for (const lessonId of unite.lessonIds) {
    const p = progression[lessonId];
    if (!p || p.statut !== 'terminee') continue;

    const nouvelIntervalle = Math.max(1, Math.floor((p.intervalle || 1) / 2));
    const dateRapprochee = ajouterJours(auj, nouvelIntervalle);
    // On ne repousse jamais une révision déjà plus proche que `dateRapprochee`.
    const prochaineRevision =
      p.prochaineRevision && differenceJours(dateRapprochee, p.prochaineRevision) < 0
        ? p.prochaineRevision
        : dateRapprochee;

    progression[lessonId] = {
      ...p,
      fragile: true,
      intervalle: nouvelIntervalle,
      prochaineRevision,
    };
    modifie = true;
  }

  return modifie ? { ...etat, progression } : etat;
}

/**
 * Applique un événement validé `learning.attempt.completed` (v1) sur l'état Masari.
 * - Ignore tout `attemptId` déjà vu (idempotence).
 * - Alimente `etat.kafaa` (SM-2) avec la clé `boussole:<exerciseId>`.
 * - Sur échec : ajoute une entrée au `carnet` (sans réponse attendue) et déclenche
 *   la rétrogradation croisée douce sur l'unité liée.
 */
export function appliquerEvenementBoussole(
  etat: Etat,
  evt: BoussoleAttemptEvent,
  auj: string = aujourdhui(),
): Etat {
  const dejaVus = etat.boussoleEventsSeen ?? [];
  if (dejaVus.includes(evt.attemptId)) return etat;

  const boussoleEventsSeen = [...dejaVus, evt.attemptId].slice(-MAX_BOUSSOLE_EVENTS_SEEN);

  const cleKafaa = evt.exerciseId.startsWith('boussole:')
    ? evt.exerciseId
    : `boussole:${evt.exerciseId}`;
  const existante = etat.kafaa?.[cleKafaa];
  const baseCarte: CarteKafaa = existante ?? {
    verbe: evt.verbe,
    exercice: evt.titre,
    erreur: evt.erreurTag ?? `راجع توظيف الفعل «${evt.verbe}» على السند`,
    repetitions: 0,
    intervalle: 0,
    facilite: 2.5,
  };

  const carteMaj: CarteKafaa = mettreAJourSrs(
    {
      ...baseCarte,
      verbe: evt.verbe,
      exercice: evt.titre,
      erreur: evt.erreurTag || baseCarte.erreur,
    },
    evt.reussi ? 4 : 1,
  );

  let carnet = etat.carnet ?? [];
  if (!evt.reussi) {
    const nouvelleFaute: FauteCarnet = {
      id: `boussole-${evt.attemptId}`,
      ts: evt.timestamp,
      contexte: `البوصلة · ${evt.titre}`,
      enonce: evt.prompt || evt.titre,
      donne: evt.choix || 'محاولة غير موفّقة',
      diagnostic: evt.erreurTag || `أعد فحص السند قبل تطبيق الفعل «${evt.verbe}».`,
    };
    carnet = [...carnet, nouvelleFaute].slice(-MAX_CARNET_FAUTES);
  }

  let suivant: Etat = {
    ...etat,
    boussoleEventsSeen,
    kafaa: { ...(etat.kafaa ?? {}), [cleKafaa]: carteMaj },
    carnet,
  };

  if (!evt.reussi) {
    suivant = demoterProgressionDepuisKafaa(suivant, evt.unitId, auj);
  }

  return suivant;
}
