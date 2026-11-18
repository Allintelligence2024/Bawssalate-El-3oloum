// P3.2 — défi hebdomadaire choisi + badges de contenu, tout calculé localement
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import type { Etat } from '../../types';
import { choisirDefi, avancementDefi, consoliderDefi, badgesAffiches, CIBLE_DRILLS } from '../defis';

beforeAll(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-16T10:00:00')); });
afterAll(() => vi.useRealTimers());

function vierge(extra: Partial<Etat> = {}): Etat {
  return {
    version: 2, progression: {}, jalons: {}, notes: [], carnet: [], journal: [], minutesTotales: 0, revisions: 0,
    nom: 'x', dateBac: '2027-06-10', seancesComptees: 0, ateliers: {}, consentementSync: false, ...extra,
  };
}

describe('defis', () => {
  it('défi drills : base figée au choix, progrès = nouveaux drills, pas de changement de défi dans la semaine', () => {
    const e0 = vierge({ drills: { q001: true, q002: true } });
    const e1 = choisirDefi(e0, 'drills');
    expect(e1.defi).toEqual({ semaine: '2026-11-15', type: 'drills', choisiLe: '2026-11-16', baseDrills: 2 });
    expect(choisirDefi(e1, 'examen').defi?.type).toBe('drills');
    expect(avancementDefi(e1)).toMatchObject({ fait: 0, cible: CIBLE_DRILLS, accompli: false });
    const drills = Object.fromEntries(Array.from({ length: 25 }, (_, i) => [`q${i}`, true as const]));
    const e2 = { ...e1, drills };
    expect(avancementDefi(e2)).toMatchObject({ fait: CIBLE_DRILLS, accompli: true });
    const e3 = consoliderDefi(e2);
    expect(e3.defisAccomplis).toEqual(['2026-11-15']);
    expect(consoliderDefi(e3).defisAccomplis).toEqual(['2026-11-15']); // idempotent
    expect(avancementDefi(e3, '2026-11-23')).toBeNull(); // semaine suivante : à rechoisir
  });

  it('défi croisée et examen : accompli seulement par un événement de cette semaine, après le choix', () => {
    const c = choisirDefi(vierge({ revueCroisee: { semaine: '2026-11-08', lessonIds: ['a', 'b'], faiteLe: '2026-11-10' } }), 'croisee');
    expect(avancementDefi(c)?.accompli).toBe(false); // revue de la semaine passée
    expect(avancementDefi({ ...c, revueCroisee: { semaine: '2026-11-15', lessonIds: ['a', 'b'], faiteLe: '2026-11-17' } })?.accompli).toBe(true);
    const x = choisirDefi(vierge({ examensBlancs: ['2026-11-15T18:00:00.000Z'] }), 'examen');
    expect(avancementDefi(x)?.accompli).toBe(false); // examen d'hier, avant le choix
    expect(avancementDefi({ ...x, examensBlancs: ['2026-11-15T18:00:00.000Z', '2026-11-18T09:00:00.000Z'] })?.accompli).toBe(true);
  });

  it('badges : obtenus + un seul « prochain » par famille, sans comparaison', () => {
    const e = vierge({ jalons: { u1: { fait: true }, u2: { fait: true } }, revisions: 12, examensBlancs: [], defisAccomplis: ['2026-11-01', '2026-11-08', '2026-11-15', '2026-11-22'] });
    const { obtenus, prochains } = badgesAffiches(e);
    expect(obtenus.map((b) => b.nom)).toEqual(['أوّل جسر', 'عشر عودات', 'أوّل تحدٍّ', 'شهر من التحدّيات']);
    expect(prochains.map((b) => [b.famille, b.seuil])).toEqual([['جسور', 5], ['استرجاعات', 50], ['امتحانات تجريبية', 1], ['تحدّيات أسبوعية', 10]]);
  });
});
