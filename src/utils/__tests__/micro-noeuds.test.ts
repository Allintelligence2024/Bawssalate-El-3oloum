import { describe, expect, it } from 'vitest';
import {
  MINUTES_NOEUD,
  TYPE_PAR_PHASE,
  minutesRestantes,
  noeudsDeLecon,
  phasesFaites,
  prochainNoeud,
  prochainePhase,
  resumeNoeuds,
} from '../microNoeuds';
import { etatVierge, type ProgressionLecon } from '../../types';
import { UNITES } from '../../data/programme';

/** Une leçon réelle du programme (aucune leçon inventée dans les tests). */
const LECON = UNITES[0].lessonIds[0];

describe('micro-nœuds = les six phases du protocole', () => {
  it('six nœuds, un par phase, dans l’ordre', () => {
    const noeuds = noeudsDeLecon(LECON);
    expect(noeuds.map((n) => n.phase)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(noeuds.every((n) => n.id === `mn:${LECON}:${n.phase}`)).toBe(true);
  });

  it('chaque nœud dure entre 3 et 5 minutes — promesse produit', () => {
    for (const n of noeudsDeLecon(LECON)) {
      expect(n.minutes).toBeGreaterThanOrEqual(3);
      expect(n.minutes).toBeLessThanOrEqual(5);
      expect(n.minutes).toBe(MINUTES_NOEUD[n.type]);
      expect(n.type).toBe(TYPE_PAR_PHASE[n.phase]);
    }
  });

  it('chaque nœud annonce un savoir-faire et une porte, jamais une note', () => {
    for (const n of noeudsDeLecon(LECON)) {
      expect(n.savoirFaire.length).toBeGreaterThan(10);
      expect(n.titre.length).toBeGreaterThan(0);
      expect(n.savoirFaire).not.toMatch(/\/\s*20|%|نقطة/);
      expect(n.porte).toBeTruthy();
    }
  });
});

function prog(phases: (1 | 2 | 3 | 4 | 5 | 6)[]): ProgressionLecon {
  return { statut: 'en_cours', phases, minutes: phases.length * 4, repetitions: 0, intervalle: 1, facilite: 2.5 };
}

describe('reprise : la progression vient de `phases`, une seule vérité', () => {
  it('sans progression, la prochaine phase est 1', () => {
    expect(phasesFaites(undefined)).toEqual([]);
    expect(prochainePhase(undefined)).toBe(1);
    expect(prochainNoeud(LECON, undefined)?.phase).toBe(1);
    expect(minutesRestantes(LECON, undefined)).toBe(24);
  });

  it('reprend exactement là où l’élève s’est arrêté', () => {
    const p = prog([1, 2]);
    expect(prochainePhase(p)).toBe(3);
    expect(prochainNoeud(LECON, p)?.phase).toBe(3);
    expect(minutesRestantes(LECON, p)).toBe(4 + 4 + 5 + 5);
  });

  it('toutes les phases faites : plus de nœud, zéro minute restante', () => {
    const p = prog([1, 2, 3, 4, 5, 6]);
    expect(prochainePhase(p)).toBeNull();
    expect(prochainNoeud(LECON, p)).toBeNull();
    expect(minutesRestantes(LECON, p)).toBe(0);
  });

  it('le résumé ne calcule pas de pourcentage ni d’objectif à « ne pas casser »', () => {
    const etat = etatVierge();
    const resume = resumeNoeuds({ ...etat, progression: { [LECON]: prog([1]) } }, LECON);
    expect(resume.faites).toBe(1);
    expect(resume.noeuds).toHaveLength(6);
    expect(resume.restantes).toBe(24 - 3);
    expect(JSON.stringify(resume)).not.toMatch(/%|série|streak/i);
  });
});
