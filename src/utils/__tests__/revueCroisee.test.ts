// P2.4 — revue croisée hebdomadaire : 1 leçon terminée par domaine, 1 fois par semaine, composition figée
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import type { Etat } from '../../types';
import { composerRevueCroisee, disponibiliteCroisee, demarrerRevueCroisee, terminerRevueCroisee, nomDomaine } from '../revueCroisee';
import { UNITE_PAR_ID } from '../../data/programme';

beforeAll(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-16T10:00:00')); }); // lundi
afterAll(() => vi.useRealTimers());

function vierge(extra: Partial<Etat> = {}): Etat {
  return {
    version: 2, progression: {}, jalons: {}, notes: [], carnet: [], journal: [], minutesTotales: 0, revisions: 0,
    nom: 'x', dateBac: '2027-06-10', seancesComptees: 0, ateliers: {}, consentementSync: false, ...extra,
  };
}
const fin = (o: { fragile?: boolean; derniereSession?: string; prochaineRevision?: string } = {}) => ({
  statut: 'terminee' as const, phases: [1, 2, 3, 4, 5, 6], minutes: 40, repetitions: 1, intervalle: 3, facilite: 2.5,
  prochaineRevision: '2026-12-01', ...o,
});
const u1 = UNITE_PAR_ID.u1.lessonIds, u6 = UNITE_PAR_ID.u6.lessonIds, u9 = UNITE_PAR_ID.u9.lessonIds;

describe('revueCroisee', () => {
  it('un seul domaine commencé → indisponible (pas « croisé ») ; deux domaines → prête', () => {
    const seul = vierge({ progression: { [u1[0]]: fin(), [u1[1]]: fin() } });
    expect(composerRevueCroisee(seul)).toEqual([u1[0]]);
    expect(disponibiliteCroisee(seul)).toBe('indisponible');
    const deux = vierge({ progression: { [u1[0]]: fin(), [u6[0]]: fin() } });
    expect(disponibiliteCroisee(deux)).toBe('prete');
  });

  it('1 leçon par domaine, fragile d’abord puis la moins récemment vue, dues du jour exclues', () => {
    const etat = vierge({
      progression: {
        [u1[0]]: fin({ derniereSession: '2026-11-10' }),
        [u1[1]]: fin({ derniereSession: '2026-11-01' }),
        [u1[2]]: fin({ fragile: true, derniereSession: '2026-11-15' }),
        [u6[0]]: fin({ prochaineRevision: '2026-11-16' }), // due aujourd'hui → laissée à l'استرجاع
        [u6[1]]: fin({ derniereSession: '2026-11-05' }),
        [u9[0]]: fin(),
      },
    });
    const ids = composerRevueCroisee(etat);
    expect(ids).toEqual([u1[2], u6[1], u9[0]]);
    expect(nomDomaine(u1[2])).toMatch(/بروتينات/);
  });

  it('composition figée pour la semaine, terminée → « faite », nouvelle semaine → de nouveau prête', () => {
    const etat0 = vierge({ progression: { [u1[0]]: fin(), [u1[1]]: fin(), [u6[0]]: fin() } });
    const { etat: etat1, lessonIds } = demarrerRevueCroisee(etat0);
    expect(lessonIds).toEqual([u1[0], u6[0]]);
    expect(etat1.revueCroisee?.semaine).toBe('2026-11-15'); // dimanche
    // même semaine, même composition même si la progression bouge
    const etat1b = { ...etat1, progression: { ...etat1.progression, [u1[0]]: fin({ derniereSession: '2026-11-16' }) } };
    expect(demarrerRevueCroisee(etat1b).lessonIds).toEqual(lessonIds);
    expect(disponibiliteCroisee(etat1b)).toBe('prete');
    const etat2 = terminerRevueCroisee(etat1b);
    expect(disponibiliteCroisee(etat2)).toBe('faite');
    expect(etat2.revueCroisee?.faiteLe).toBe('2026-11-16');
    expect(disponibiliteCroisee(etat2, '2026-11-22')).toBe('prete'); // dimanche suivant
    expect(disponibiliteCroisee(etat2, '2026-11-21')).toBe('faite'); // samedi, même semaine
  });
});
