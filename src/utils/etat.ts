import { etatVierge, type Etat } from '../types';

/** Normalisation commune au stockage local et à une sauvegarde déjà validée. */
export function etatDepuisBrut(analyse: Partial<Etat>): Etat {
  return {
    ...etatVierge(),
    ...analyse,
    progression: { ...analyse.progression },
    jalons: { ...analyse.jalons },
    notes: analyse.notes ?? [],
    carnet: analyse.carnet ?? [],
    journal: analyse.journal ?? [],
    kafaa: analyse.kafaa ?? {},
    drills: analyse.drills ?? {},
    ateliers: analyse.ateliers ?? {},
  };
}
