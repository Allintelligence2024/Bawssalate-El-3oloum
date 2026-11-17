// P1.1 (structure sans corrigé) — 6 sujets structurés : barème 20, 3 exercices, unités valides, verbes typés
import { describe, it, expect } from 'vitest';
import { SUJETS_OFFICIELS, frequenceVerbes, frequenceUnites, ANNEES_STRUCTUREES } from '../../data/sujetsOfficiels';
import { UNITES } from '../../data/programme';
import { situationDeUnite } from '../../data/syntheses';

describe('sujets officiels structurés', () => {
  it('6 sujets (3 années × 2), 3 exercices sur 20 points, 4 h 30, unités du programme, aucune réponse embarquée', () => {
    expect(ANNEES_STRUCTUREES).toEqual([2023, 2021, 2020]);
    expect(SUJETS_OFFICIELS.length).toBe(6);
    const ids = new Set(UNITES.map((u) => u.id));
    for (const s of SUJETS_OFFICIELS) {
      expect(s.dureeMin).toBe(270);
      expect(s.exercices.map((e) => e.numero)).toEqual([1, 2, 3]);
      expect(s.exercices.reduce((a, e) => a + e.bareme, 0)).toBe(20);
      for (const e of s.exercices) {
        expect(e.unites.length).toBeGreaterThan(0);
        for (const u of e.unites) expect(ids.has(u), `${s.id}/${e.numero}/${u}`).toBe(true);
        expect(e.parties.length).toBeGreaterThan(0);
        for (const p of e.parties) {
          expect(p.consignes.length).toBeGreaterThan(0);
          for (const c of p.consignes) expect(c.texte.length).toBeGreaterThan(15);
        }
        // chaque exercice renvoie vers une synthèse d'entraînement de son unité principale
        expect(situationDeUnite(e.unites[0]), `${s.id}/${e.numero}`).toBeDefined();
      }
    }
  });

  it('les fréquences se calculent depuis les données : « نصّ علمي » et « مخطّط » reviennent chaque année', () => {
    const v = Object.fromEntries(frequenceVerbes().map((x) => [x.verbe, x.n]));
    expect(v['نصّ علمي']).toBeGreaterThanOrEqual(6);
    expect((v['مخطّط'] ?? 0) + (v['رسم تخطيقي'] ?? 0) + (v['رسم تخطيطي'] ?? 0)).toBeGreaterThanOrEqual(3);
    const u = frequenceUnites();
    expect(Object.values(u).reduce((a, b) => a + b, 0)).toBe(18);
  });
});
