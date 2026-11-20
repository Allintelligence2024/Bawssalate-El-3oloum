// P1.1 (structure sans corrigé) — 30 sujets structurés (2013→2026, 2017 ×2 sessions) : barème 20, 3 exercices, unités valides, verbes typés
import { describe, it, expect } from 'vitest';
import { SUJETS_OFFICIELS, frequenceVerbes, frequenceUnites, ANNEES_STRUCTUREES, fideliteDe, LIBELLE_FIDELITE } from '../../data/sujetsOfficiels';
import { UNITES } from '../../data/programme';
import { situationDeUnite } from '../../data/syntheses';

describe('sujets officiels structurés', () => {
  it('30 sujets (14 années, 2017 avec session exceptionnelle), 3 exercices sur 20 points, 4 h 30, unités du programme, aucune réponse embarquée', () => {
    expect(ANNEES_STRUCTUREES).toEqual([2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013]);
    expect(SUJETS_OFFICIELS.length).toBe(30);
    expect(new Set(SUJETS_OFFICIELS.map((s) => s.id)).size).toBe(30);
    expect(SUJETS_OFFICIELS.filter((s) => s.annee === 2017).map((s) => `${s.session}-${s.numero}`)).toEqual(['عادية-1', 'عادية-2', 'استثنائية-1', 'استثنائية-2']);
    // ordre : du plus récent au plus ancien
    for (let i = 1; i < SUJETS_OFFICIELS.length; i++) expect(SUJETS_OFFICIELS[i - 1].annee).toBeGreaterThanOrEqual(SUJETS_OFFICIELS[i].annee);
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

  it('les fréquences se calculent depuis les données : « نصّ علمي » dans chaque sujet, schéma/مخطّط fréquents', () => {
    const v = Object.fromEntries(frequenceVerbes().map((x) => [x.verbe, x.n]));
    expect(v['نصّ علمي']).toBeGreaterThanOrEqual(30); // au moins un par sujet
    expect((v['مخطّط'] ?? 0) + (v['رسم تخطيقي'] ?? 0) + (v['رسم تخطيطي'] ?? 0)).toBeGreaterThanOrEqual(20);
    const u = frequenceUnites();
    expect(Object.values(u).reduce((a, b) => a + b, 0)).toBe(90); // 30 sujets × 3 exercices
    // l'immunologie (u4) et le nerveux (u5) sont les unités les plus visées comme exercice complet
    expect(u.u4).toBeGreaterThanOrEqual(u.u1);
    expect(u.u5).toBeGreaterThanOrEqual(u.u6);
  });

  it('étiquette de fidélité : a (couche texte) pour 2021/2023, c (reformulé) pour 2020, b (lecture à l\'œil) ailleurs — libellé défini', () => {
    const parAnnee: Record<number, Set<string>> = {};
    for (const s of SUJETS_OFFICIELS) {
      const f = fideliteDe(s);
      expect(LIBELLE_FIDELITE[f]).toBeTruthy();
      (parAnnee[s.annee] ??= new Set()).add(f);
    }
    expect([...parAnnee[2023]]).toEqual(['a']);
    expect([...parAnnee[2021]]).toEqual(['a']);
    expect([...parAnnee[2020]]).toEqual(['c']);
    for (const a of [2026, 2025, 2024, 2022, 2019, 2018, 2017, 2016, 2015, 2014, 2013]) expect([...parAnnee[a]]).toEqual(['b']);
  });
});
