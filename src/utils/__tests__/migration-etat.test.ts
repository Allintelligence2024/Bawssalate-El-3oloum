import { describe, expect, it } from 'vitest';
import { VERSION_ETAT, attribuerCarteLecon, etatDepuisBrut, migrerEtat } from '../etat';
import { etatVierge, type Etat } from '../../types';
import { UNITES } from '../../data/programme';

const LECON = UNITES[0].lessonIds[0];

describe('migration d’état — compléter, jamais réinitialiser', () => {
  it('un profil v1 sans les champs v0.11 est complété, sa progression intacte', () => {
    const ancien = {
      version: 1,
      nom: 'أمينة',
      progression: {
        [LECON]: {
          statut: 'en_cours' as const,
          phases: [1, 2],
          minutes: 7,
          repetitions: 0,
          intervalle: 1,
          facilite: 2.5,
        },
      },
      journal: ['2026-11-19'],
      minutesTotales: 120,
    };
    const migre = migrerEtat(ancien);
    expect(migre.version).toBe(VERSION_ETAT);
    expect(migre.nom).toBe('أمينة');
    expect(migre.progression[LECON].phases).toEqual([1, 2]);
    expect(migre.minutesTotales).toBe(120);
    expect(migre.journal).toEqual(['2026-11-19']);
  });

  it('les nouveaux champs existent toujours (itérables, jamais undefined)', () => {
    const migre = migrerEtat({ version: 2 });
    expect(migre.cartesLecons).toEqual({});
    expect(migre.briques).toEqual({});
    expect(migre.derogationsSujets).toEqual({});
    expect(migre.trophees).toEqual({});
    expect(migre.defis60).toEqual([]);
    expect(migre.notes).toEqual([]);
    expect(migre.carnet).toEqual([]);
    expect(migre.kafaa).toEqual({});
  });

  it('rejouer la migration ne change plus rien (idempotence)', () => {
    const une = migrerEtat({ version: 1, nom: 'ياسين' });
    const deux = migrerEtat(JSON.parse(JSON.stringify(une)) as Partial<Etat>);
    expect(deux).toEqual(une);
    const trois = migrerEtat(JSON.parse(JSON.stringify(deux)) as Partial<Etat>);
    expect(trois).toEqual(deux);
  });

  it('une version future est refusée plutôt que devinée', () => {
    expect(() => migrerEtat({ version: VERSION_ETAT + 1 })).toThrow(/future/);
  });

  it('un état sans version est traité comme v2, pas comme corrompu', () => {
    expect(migrerEtat({ nom: 'x' }).version).toBe(VERSION_ETAT);
  });

  it('les données v0.11 déjà écrites survivent à la migration', () => {
    const etat = etatVierge();
    const rempli: Etat = {
      ...etat,
      trophees: { 'قارن': { le: '2026-11-20T10:00:00.000Z', n: 3 } },
      derogationsSujets: { '2025-1': '2026-11-20T10:00:00.000Z' },
      briques: { 'jb:u1:e2': { jeuId: 'jb:u1:e2', rolesChoisis: ['observation'], manquants: [], complete: false, le: '2026-11-20T10:00:00.000Z', apres: 1 } },
    };
    const migre = migrerEtat(JSON.parse(JSON.stringify(rempli)) as Partial<Etat>);
    expect(migre.trophees?.['قارن'].n).toBe(3);
    expect(migre.derogationsSujets?.['2025-1']).toBeTruthy();
    expect(migre.briques?.['jb:u1:e2'].apres).toBe(1);
  });
});

describe('normalisation commune (stockage local et sauvegarde)', () => {
  it('etatDepuisBrut remplit les tableaux sans toucher au reste', () => {
    const e = etatDepuisBrut({ nom: 'سارة', minutesTotales: 42 } as Partial<Etat>);
    expect(e.nom).toBe('سارة');
    expect(e.minutesTotales).toBe(42);
    expect(Array.isArray(e.journal)).toBe(true);
    expect(e.consentementSync).toBe(false);
  });
});

describe('carte de leçon — preuve de complétion, jamais un score', () => {
  const POINTS: [string, string, string] = ['سؤال', 'خلاصة', 'فخّ'];
  const LE = '2026-11-21T10:00:00.000Z';

  function etatAvecPhases(phases: number[]): Etat {
    const e = etatVierge();
    e.progression[LECON] = {
      statut: 'terminee', phases, minutes: 46, repetitions: 1, intervalle: 3, facilite: 2.5,
    };
    return e;
  }

  it('cinq phases sur six : pas encore de carte', () => {
    const avant = etatAvecPhases([1, 2, 3, 4, 5]);
    const apres = attribuerCarteLecon(avant, LECON, POINTS, LE);
    expect(apres.cartesLecons?.[LECON]).toBeUndefined();
    expect(apres).toEqual(avant);
  });

  it('les six phases faites : la carte est attribuée une fois, avec ses trois points', () => {
    const e = attribuerCarteLecon(etatAvecPhases([1, 2, 3, 4, 5, 6]), LECON, POINTS, LE);
    expect(e.cartesLecons?.[LECON]).toMatchObject({ gagneeLe: LE, points: POINTS });
    expect(JSON.stringify(e.cartesLecons?.[LECON])).toContain('سؤال');
  });

  it('réattribuer ne duplique pas et ne déplace pas la date', () => {
    const une = attribuerCarteLecon(etatAvecPhases([1, 2, 3, 4, 5, 6]), LECON, POINTS, LE);
    const deux = attribuerCarteLecon(une, LECON, POINTS, '2027-01-01T00:00:00.000Z');
    expect(deux.cartesLecons?.[LECON]).toEqual(une.cartesLecons?.[LECON]);
  });

  it('la carte ne contient ni note ni pourcentage', () => {
    const e = attribuerCarteLecon(etatAvecPhases([1, 2, 3, 4, 5, 6]), LECON, POINTS, LE);
    expect(JSON.stringify(e.cartesLecons)).not.toMatch(/%|\/20|score/i);
  });
});
