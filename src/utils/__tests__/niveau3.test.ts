// P1.5 + P-2.1 — items niveau 3 : cohérence avec les axes, chargement par domaine, escalier à 3 marches
import { describe, it, expect } from 'vitest';
import { ITEMS_N3 } from '../../data/drills/niveau3';
import { AXES, TOTAL_QCM, TOTAL_DEFS, TOTAL_ITEMS } from '../../data/drills/axes';
import { chargerDomaine } from '../drills';
import { demarrerAdaptatif } from '../adaptatif';

// distribution finale du plan (P-2.1) : u1=7, u2=7, u3=5, u4=8, u5=8, u6=8, u7=8, u8=9, u9=5, u10=10, u11=5 (=80)
const DISTRIBUTION_FINALE: Record<number, number> = { 1: 7, 2: 7, 3: 5, 4: 8, 5: 8, 6: 8, 7: 8, 8: 9, 9: 5, 10: 10, 11: 5 };

describe('niveau 3', () => {
  it('80 items (3 dépôts), tous n=3, 4 options distinctes, explication, ids uniques et préfixés n', () => {
    expect(ITEMS_N3.length).toBe(80);
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

  it("chaque item appartient à un axe de sa propre unité, et l'axe le référence (compteur qcm cohérent)", () => {
    for (const i of ITEMS_N3) {
      const axe = AXES.find((a) => a.id === i.a);
      expect(axe, i.id).toBeDefined();
      expect(axe!.u, i.id).toBe(i.u);
      expect(axe!.ids, i.id).toContain(i.id);
    }
    expect(TOTAL_QCM).toBe(500 + ITEMS_N3.length);
    expect(TOTAL_ITEMS).toBe(TOTAL_QCM + TOTAL_DEFS);
    expect(TOTAL_ITEMS).toBe(700);
    expect(ITEMS_N3.find((i) => i.id === 'n045')?.a).toBe(6);
    // distribution finale : chaque unité a son effectif cible
    for (const u of Object.keys(DISTRIBUTION_FINALE).map(Number)) {
      expect(ITEMS_N3.filter((i) => i.u === u).length, `u${u}`).toBe(DISTRIBUTION_FINALE[u]);
    }
    expect(ITEMS_N3.length).toBe(Object.values(DISTRIBUTION_FINALE).reduce((s, x) => s + x, 0));
  });

  it("les compteurs qcm+defs de chaque axe coïncident avec son nombre d'ids", () => {
    for (const a of AXES) {
      expect(a.ids.length, `axe ${a.id}`).toBe(a.qcm + a.defs);
    }
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

describe('régressions de la relecture méthodologique', () => {
  it('le diagnostic demande l’opération sans donner le verbe de la réponse', async () => {
    const { diagnostic } = await import('../../data/methodologie/exercicesUnite1');
    for (const [question, options, correct, cible] of diagnostic) {
      expect(question).not.toContain(options[correct]);
      expect(Object.keys(cible).sort()).toEqual(options.filter((_, i) => i !== correct).sort());
    }
  });
  it('le verbe analyser utilise les données et non le palier d’explication', async () => {
    const { VERBE_OPERATION } = await import('../../data/methodologie/verbesEtMethodes');
    const { ATTENDU_PAR_VERBE } = await import('../../data/methodologie/attenduVerbes');
    expect(VERBE_OPERATION['حلّل']).toBe(0);
    expect(ATTENDU_PAR_VERBE['حلِّل'].attendu).toContain('دون تفسير');
  });
});
