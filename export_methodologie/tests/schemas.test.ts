// P1.6 — 6 schémas à légender : structure, zones nommées uniques, dans le viewBox
import { describe, it, expect } from 'vitest';
import { SCHEMAS } from '../../data/schemas';

describe('schemas à légender', () => {
  it('6 schémas prioritaires, ≥ 5 zones chacun, ids et noms uniques, positions dans le viewBox', () => {
    expect(SCHEMAS.map((s) => s.id).sort()).toEqual(['chloroplaste', 'codon', 'enveloppes', 'mitochondrie', 'subduction', 'synapse']);
    for (const s of SCHEMAS) {
      const [, , w, h] = s.viewBox.split(' ').map(Number);
      expect(s.zones.length, s.id).toBeGreaterThanOrEqual(5);
      expect(new Set(s.zones.map((z) => z.id)).size).toBe(s.zones.length);
      expect(new Set(s.zones.map((z) => z.nom)).size).toBe(s.zones.length);
      for (const z of s.zones) {
        expect(z.x, `${s.id}/${z.id}`).toBeGreaterThanOrEqual(0);
        expect(z.x).toBeLessThanOrEqual(w);
        expect(z.y).toBeGreaterThanOrEqual(0);
        expect(z.y).toBeLessThanOrEqual(h);
      }
      expect(s.formes.length).toBeGreaterThan(3);
    }
  });
});
