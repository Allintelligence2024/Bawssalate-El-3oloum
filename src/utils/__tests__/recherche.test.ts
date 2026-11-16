// P3.3 — recherche locale : normalisation arabe, couverture des 58 leçons, exemple du plan « كالفن »
import { describe, it, expect } from 'vitest';
import { normaliser, construireIndex, rechercher } from '../recherche';
import { CHEMIN } from '../../data/programme';

describe('recherche locale', () => {
  it('normalise hamza, ta marbouta, alif maqsura, tashkil et tatwil', () => {
    expect(normaliser('أكْسِجين')).toBe('اكسجين');
    expect(normaliser('الطاقــة')).toBe('الطاقه');
    expect(normaliser('مستوى')).toBe('مستوي');
    expect(normaliser('ATP ')).toBe('atp');
  });

  it("indexe toutes les leçons du chemin", () => {
    const idx = construireIndex();
    const lecons = CHEMIN.filter((c) => c.type === 'lecon').length;
    expect(idx.length).toBe(lecons);
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
});
