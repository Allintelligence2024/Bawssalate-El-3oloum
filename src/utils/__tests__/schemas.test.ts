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

it('les séquences codon et anticodons sont explicitement en lecture gauche-droite', () => {
  const codon = SCHEMAS.find((s) => s.id === 'codon')!;
  for (const seq of ['AUG', 'GCU', 'UAA', 'UAC', 'CGA']) {
    const texte = codon.formes.find((f) => f.texte === seq);
    expect(texte?.attrs.direction, seq).toBe('ltr');
  }
});

it('la membrane interne est une boucle fermée et les ATP synthases sont reliées aux crêtes', () => {
  const mito = SCHEMAS.find((s) => s.id === 'mitochondrie')!;
  const interne = mito.formes.find((f) => f.type === 'path');
  expect(String(interne?.attrs.d)).toMatch(/Z$/);
  const tiges = mito.formes.filter((f) => f.type === 'line');
  for (const sphere of mito.formes.filter((f) => f.type === 'circle')) {
    expect(tiges.some((t) => t.attrs.y1 === sphere.attrs.cy && t.attrs.y2 === sphere.attrs.cy &&
      Math.abs(Number(t.attrs.x2) - Number(sphere.attrs.cx)) === Number(sphere.attrs.r))).toBe(true);
  }
});


it('les repères du chloroplaste désignent les deux piles', () => {
  const s = SCHEMAS.find((x) => x.id === 'chloroplaste')!;
  expect(s.zones.find((z) => z.id === 'granum')).toMatchObject({ x: 95, y: 96 });
  expect(s.zones.find((z) => z.id === 'thylakoide')).toMatchObject({ x: 215, y: 99 });
});
