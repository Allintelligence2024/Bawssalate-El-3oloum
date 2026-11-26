// P3.3 — recherche locale : normalisation arabe, couverture des 58 leçons, exemple du plan « كالفن »
import { describe, it, expect } from 'vitest';
import { normaliser, construireIndex, rechercher } from '../recherche';
import { CHEMIN, DOMAINES, LECONS_ENRICHISSEMENT, UNITE_PAR_ID } from '../../data/programme';

describe('recherche locale', () => {
  it('normalise hamza, ta marbouta, alif maqsura, tashkil et tatwil', () => {
    expect(normaliser('أكْسِجين')).toBe('اكسجين');
    expect(normaliser('الطاقــة')).toBe('الطاقه');
    expect(normaliser('مستوى')).toBe('مستوي');
    expect(normaliser('ATP ')).toBe('atp');
  });

  it("indexe les leçons du chemin et les enrichissements", () => {
    const idx = construireIndex();
    const lecons = CHEMIN.filter((c) => c.type === 'lecon').length;
    expect(idx.length).toBe(lecons + LECONS_ENRICHISSEMENT.length);
    for (const id of LECONS_ENRICHISSEMENT) expect(idx.some((e) => e.lessonId === id)).toBe(true);
    expect(idx.every((e) => e.champs.length >= 2)).toBe(true);
  });

  it('« كالفن » ouvre une leçon du domaine 2 (photosynthèse), avec un contexte', () => {
    const r = rechercher('كالفن');
    expect(r.length).toBeGreaterThan(0);
    expect(r[0].entree.uniteId).toMatch(/^u(6|7|8)$/);
  });

  it('plusieurs mots = tous requis ; moins de 2 caractères = rien ; insensible à la hamza', () => {
    expect(rechercher('a')).toEqual([]);
    const avecHamza = rechercher('أكسجين');
    const sansHamza = rechercher('اكسجين');
    expect(avecHamza.map((x) => x.entree.lessonId)).toEqual(sansHamza.map((x) => x.entree.lessonId));
    const deux = rechercher('ATP بروتون');
    expect(deux.every((x) => x.entree.cle.includes('atp') && x.entree.cle.includes('بروتون'))).toBe(true);
  });

  it('filtres par domaine/unité : restreignent la recherche ; sans requête, listent tout le périmètre', () => {
    const d2 = DOMAINES[1];
    const tout = rechercher('', 60, { domaineId: d2.id });
    const attendu = d2.unites.reduce((n, u) => n + (UNITE_PAR_ID[u].prerequis?.length ?? 0) + UNITE_PAR_ID[u].lessonIds.length, 0);
    expect(tout.length).toBe(attendu);
    expect(tout.every((r) => d2.unites.includes(r.entree.uniteId))).toBe(true);
    expect(rechercher('', 60, { uniteId: 'u1' }).every((r) => r.entree.uniteId === 'u1')).toBe(true);
    // « كالفن » est dans le domaine 2 : filtré sur le domaine 3 → rien
    expect(rechercher('كالفن', 20, { domaineId: 'd3' })).toEqual([]);
    expect(rechercher('كالفن', 20, { domaineId: 'd2' }).length).toBeGreaterThan(0);
    expect(rechercher('', 60)).toEqual([]); // pas de filtre, pas de requête → rien
  });
});
