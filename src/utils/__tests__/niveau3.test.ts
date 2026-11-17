// P1.5 (dépôt 1) — items niveau 3 : cohérence avec les axes, chargement par domaine, escalier à 3 marches
import { describe, it, expect } from 'vitest';
import { ITEMS_N3 } from '../../data/drills/niveau3';
import { AXES, TOTAL_QCM } from '../../data/drills/axes';
import { chargerDomaine } from '../drills';
import { demarrerAdaptatif } from '../adaptatif';

describe('niveau 3', () => {
  it('40 items (2 dépôts), tous n=3, 4 options distinctes, explication, ids uniques et préfixés n', () => {
    expect(ITEMS_N3.length).toBe(40);
    const ids = new Set<string>();
    for (const i of ITEMS_N3) {
      expect(i.n).toBe(3);
      expect(i.o.length).toBe(4);
      expect(new Set(i.o).size).toBe(4);
      expect(i.e.length).toBeGreaterThan(20);
      expect(i.id).toMatch(/^n\d{3}$/);
      expect(ids.has(i.id)).toBe(false);
      ids.add(i.id);
    }
  });

  it("chaque item appartient à un axe de sa propre unité, et l'axe le référence", () => {
    for (const i of ITEMS_N3) {
      const axe = AXES.find((a) => a.id === i.a);
      expect(axe, i.id).toBeDefined();
      expect(axe!.u, i.id).toBe(i.u);
      expect(axe!.ids, i.id).toContain(i.id);
    }
    expect(TOTAL_QCM).toBe(500 + ITEMS_N3.length);
    // distribution prioritaire du plan : U4 d'abord, puis U3/U9/U11
    const parU = (u: number) => ITEMS_N3.filter((i) => i.u === u).length;
    expect(parU(4)).toBe(6);
    expect([parU(3), parU(9), parU(11)]).toEqual([4, 4, 4]);
    // dépôt 2 : chaque unité du programme a désormais au moins 2 items de niveau 3 (u8/u10 incluses)
    for (let u = 1; u <= 11; u++) expect(parU(u), `u${u}`).toBeGreaterThanOrEqual(2);
  });

  it('le chargement par domaine inclut les n3 de ses unités, et l’escalier gagne sa 3ᵉ marche sur un axe doté', async () => {
    const d1 = await chargerDomaine(1);
    expect(d1.some((i) => i.id === 'n001')).toBe(true);
    expect(d1.some((i) => i.id === 'n011')).toBe(false); // u9 → domaine 3
    const axe15 = d1.filter((i) => i.a === 15);
    const e = demarrerAdaptatif(axe15);
    expect(e.min).toBe(1);
    expect(e.max).toBe(3);
  });
});
