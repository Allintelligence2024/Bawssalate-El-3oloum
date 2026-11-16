// Tests du SM-2 (répétition espacée) — P0.4
import { describe, it, expect } from 'vitest';
import type { ProgressionLecon } from '../../types';
import { mettreAJourSrs, premiereRevision, aReviserAujourdhui, GRILLE_EBBINGHAUS } from '../srs';

describe('srs — mettreAJourSrs', () => {
  it('négligence: reset à 0 répétitions, intervalle 1', () => {
    const p = { repetitions: 5, intervalle: 14, facilite: 2.5, prochaineRevision: '2026-11-16' };
    const next = mettreAJourSrs(p, 1) as ProgressionLecon; // 1 = erreur
    expect(next.repetitions).toBe(0);
    expect(next.intervalle).toBe(1);
    expect(next.fragile).toBe(true);
    expect(next.prochaineRevision).toBe('2026-11-17'); // +1 jour
  });

  it('réussite à t=1: intervalle 1, répétitions 1', () => {
    const p = { repetitions: 0, intervalle: 0, facilite: 2.5, prochaineRevision: '2026-11-16' };
    const next = mettreAJourSrs(p, 4) as ProgressionLecon;
    expect(next.repetitions).toBe(1);
    expect(next.intervalle).toBe(1);
    expect(next.fragile).toBe(false);
  });

  it('réussite à t=2: intervalle 3', () => {
    const p = { repetitions: 1, intervalle: 1, facilite: 2.5, prochaineRevision: '2026-11-16' };
    const next = mettreAJourSrs(p, 4) as ProgressionLecon;
    expect(next.repetitions).toBe(2);
    expect(next.intervalle).toBe(3);
    expect(next.fragile).toBe(false);
  });

  it('réussite t≥3: intervalle × facilite', () => {
    const p = { repetitions: 2, intervalle: 3, facilite: 2.0, prochaineRevision: '2026-11-16' };
    const next = mettreAJourSrs(p, 5) as ProgressionLecon;
    expect(next.repetitions).toBe(3);
    expect(next.intervalle).toBe(6); // 3 × 2.0
  });
});

describe('srs — premiereRevision', () => {
  it('fragile → J+1', () => {
    const p: ProgressionLecon = {
      statut: 'terminee', phases: [1], minutes: 10, repetitions: 0, intervalle: 0, facilite: 2.5,
    };
    const next = premiereRevision(p, true);
    expect(next.repetitions).toBe(0);
    expect(next.intervalle).toBe(1);
    expect(next.fragile).toBe(true);
    expect(next.prochaineRevision).toBe('2026-11-17');
  });

  it('stable → J+3', () => {
    const p: ProgressionLecon = {
      statut: 'terminee', phases: [1], minutes: 10, repetitions: 0, intervalle: 0, facilite: 2.5,
    };
    const next = premiereRevision(p, false);
    expect(next.intervalle).toBe(3);
    expect(next.fragile).toBe(false);
    expect(next.prochaineRevision).toBe('2026-11-19');
  });
});

describe('srs — aReviserAujourdhui', () => {
  it('true quand la révision est due ou en retard', () => {
    expect(aReviserAujourdhui({ prochaineRevision: '2026-11-16' })).toBe(true); // aujourd'hui
    expect(aReviserAujourdhui({ prochaineRevision: '2026-11-15' })).toBe(true); // avance
    expect(aReviserAujourdhui({ prochaineRevision: '2026-11-17' })).toBe(false); // futur
  });

  it('false quand prochaineRevision absent', () => {
    expect(aReviserAujourdhui(undefined)).toBe(false);
    expect(aReviserAujourdhui({})).toBe(false);
  });
});

describe('srs — grille Ebbinghaus', () => {
  it('contient 1, 3, 7, 14, 28', () => {
    expect(GRILLE_EBBINGHAUS).toEqual([1, 3, 7, 14, 28]);
  });
});
