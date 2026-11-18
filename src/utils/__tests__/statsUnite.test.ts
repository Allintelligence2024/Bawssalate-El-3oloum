// P2.4 — stats par unité : forces/faiblesses en mots, calculées sur les unités commencées seulement
import { describe, it, expect } from 'vitest';
import type { Etat } from '../../types';
import { statsParUnite, forcesFaiblesses, conseilPourFaible } from '../statsUnite';
import { UNITE_PAR_ID } from '../../data/programme';
import { AXES } from '../../data/drills/axes';

function vierge(extra: Partial<Etat> = {}): Etat {
  return {
    version: 2, progression: {}, jalons: {}, notes: [], carnet: [], journal: [], minutesTotales: 0, revisions: 0,
    nom: 'x', dateBac: '2027-06-10', seancesComptees: 0, ateliers: {}, consentementSync: false, ...extra,
  };
}
const fin = (fragile = false) => ({ statut: 'terminee' as const, phases: [1, 2, 3, 4, 5, 6], minutes: 40, repetitions: 1, intervalle: 3, facilite: 2.5, fragile });

describe('statsUnite', () => {
  it('état vierge : 11 unités, aucune commencée, ni forte ni faible', () => {
    const s = statsParUnite(vierge());
    expect(s.length).toBe(11);
    expect(s.every((x) => !x.commencee)).toBe(true);
    expect(s.find((x) => x.uniteId === 'u1')!.drillsTotal).toBe(AXES.filter((a) => a.u === 1).reduce((n, a) => n + a.ids.length, 0));
    expect(forcesFaiblesses(vierge())).toEqual({ plusForte: null, plusFaible: null });
  });

  it('une seule unité commencée : forte si saine, faible si elle a une leçon fragile', () => {
    const u1 = UNITE_PAR_ID.u1.lessonIds;
    const saine = vierge({ progression: { [u1[0]]: fin(false) } });
    expect(forcesFaiblesses(saine).plusForte?.uniteId).toBe('u1');
    expect(forcesFaiblesses(saine).plusFaible).toBeNull();
    const hesitante = vierge({ progression: { [u1[0]]: fin(true) } });
    expect(forcesFaiblesses(hesitante).plusFaible?.uniteId).toBe('u1');
    expect(forcesFaiblesses(hesitante).plusForte).toBeNull();
  });

  it('deux unités : la fragile est la plus faible, la couverte est la plus forte ; conseil nomme l\'action', () => {
    const u1 = UNITE_PAR_ID.u1.lessonIds;
    const u3 = UNITE_PAR_ID.u3.lessonIds;
    const drillsU1 = Object.fromEntries(AXES.filter((a) => a.u === 1).flatMap((a) => a.ids).map((id) => [id, true as const]));
    const etat = vierge({
      progression: { ...Object.fromEntries(u1.map((id) => [id, fin(false)])), [u3[0]]: fin(true), [u3[1]]: fin(false) },
      drills: drillsU1,
    });
    const ff = forcesFaiblesses(etat);
    expect(ff.plusForte?.uniteId).toBe('u1');
    expect(ff.plusFaible?.uniteId).toBe('u3');
    expect(ff.plusFaible?.fragiles).toEqual([u3[0]]);
    expect(conseilPourFaible(ff.plusFaible!)).toMatch(/استرجاع/);
    expect(conseilPourFaible({ ...ff.plusFaible!, fragiles: [], couverture: 0 })).toMatch(/تدريبات/);
  });
});
