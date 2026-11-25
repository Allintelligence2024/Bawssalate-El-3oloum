// Phase 3 — une leçon finie = une séance. Ouvrir n'est pas réviser.
import { describe, expect, it } from 'vitest';
import { cloturerSeance, quotaDe } from '../moteur';
import { migrerEtat } from '../etat';
import { aujourdhui } from '../dates';
import type { ProgressionLecon } from '../../types';

const LECON = 'd1-u1-l1-expression-genique';

function finie(): ProgressionLecon {
  return {
    statut: 'terminee',
    phases: [1, 2, 3, 4, 5, 6],
    minutes: 46,
    repetitions: 1,
    intervalle: 1,
    facilite: 2.5,
  };
}

describe('cloturerSeance', () => {
  it('compte une séance quand une leçon se termine', () => {
    const etat = migrerEtat({});
    const apres = cloturerSeance(etat, LECON, finie());
    expect(apres.seancesComptees).toBe(1);
    expect(apres.seancesJour).toBe(aujourdhui());
    expect(apres.journal).toContain(aujourdhui());
    expect(apres.progression[LECON].statut).toBe('terminee');
  });

  it('ne recompte pas une leçon déjà terminée (double clôture)', () => {
    const une = cloturerSeance(migrerEtat({}), LECON, finie());
    const deux = cloturerSeance(une, LECON, finie());
    expect(deux.seancesComptees).toBe(1);
  });

  it('ne compte rien pour une leçon encore en cours', () => {
    const apres = cloturerSeance(migrerEtat({}), LECON, {
      ...finie(),
      statut: 'en_cours',
      phases: [1, 2],
    });
    expect(apres.seancesComptees).toBe(0);
    expect(apres.progression[LECON].phases).toEqual([1, 2]);
  });

  it('pose la séance bonus au-delà du quota du jour', () => {
    const quota = quotaDe(migrerEtat({})).seances;
    const deja = migrerEtat({
      seancesJour: aujourdhui(),
      seancesComptees: quota,
    });
    const apres = cloturerSeance(deja, LECON, finie());
    expect(apres.seancesComptees).toBe(quota + 1);
    expect(apres.bonusJour).toBe(aujourdhui());
  });
});
