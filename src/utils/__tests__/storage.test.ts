// Tests de l'export/import et de la persistance — P0.4
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { Etat } from '../../types';
import {
  chargerEtat,
  sauvegarderEtat,
  etatDepuisBrut,
  progressionDe,
  viderStockage,
  minutesStockees,
} from '../storage';

// Mock localStorage global avant chaque test
let stored = '';
beforeEach(() => {
  (globalThis as any).localStorage = {
    getItem: (k: string) => (k === 'murajih_svt_v1' ? stored : null),
    setItem: (k: string, v: string) => { stored = v; },
    removeItem: (k: string) => { if (k === 'murajih_svt_v1') stored = ''; },
  };
  stored = '';
});

afterEach(() => {
  (globalThis as any).localStorage = undefined;
});

describe('storage — chargeur/sauveur', () => {
  it('retourne un état vierge si pas de donnée', () => {
    const e = chargerEtat();
    expect(e.version).toBe(2);
    expect(e.progression).toEqual({});
  });

  it('recharge un état sauvegardé', () => {
    const etat: Etat = {
      version: 2, progression: { 'd1-u1-l1-expression-genique': { statut: 'terminee', phases: [], minutes: 5, repetitions: 0, intervalle: 0, facilite: 2.5 } },
      jalons: {}, notes: [], carnet: [], journal: [], minutesTotales: 5, revisions: 0,
      nom: 'تلميذ', dateBac: '2027-06-10', seancesComptees: 0, ateliers: {}, consentementSync: false,
    };
    (globalThis as any).localStorage.setItem('murajih_svt_v1', JSON.stringify(etat));
    const e = chargerEtat();
    expect(e.progression['d1-u1-l1-expression-genique']?.statut).toBe('terminee');
  });

  it('sauvegarde puis recharge', () => {
    const etat: Etat = {
      version: 3, progression: {'u1': { statut: 'en_cours', phases: [], minutes: 1, repetitions: 0, intervalle: 0, facilite: 2.5 }},
      jalons: {}, notes: [], carnet: [], journal: ['2026-11-16'], minutesTotales: 1, revisions: 0,
      nom: 'تلميذ', dateBac: '2027-06-10', seancesComptees: 0, ateliers: {}, consentementSync: false,
    };
    sauvegarderEtat(etat);
    const e = chargerEtat();
    expect(e.version).toBe(3);
    expect(Object.keys(e.progression).length).toBe(1);
  });

  it('etatDepuisBrut comble les champs manquants', () => {
    const brut = { progression: {}, jalons: {}, notes: [], carnet: [], journal: [], minutesTotales: 0, revisions: 0, nom: 'x', dateBac: '2027-06-10', seancesComptees: 0, ateliers: {} };
    const e = etatDepuisBrut(brut as any);
    expect(e.version).toBe(2); // valeur par défaut
    expect(e.nom).toBe('x');
    expect(e.consentementSync).toBe(false); // valeur par défaut
  });

  it('progressionDe renvoie l\'état vierge si absent', () => {
    const etat: Etat = { version: 2, progression: {}, jalons: {}, notes: [], carnet: [], journal: [], minutesTotales: 0, revisions: 0, nom: 'x', dateBac: '2027-06-10', seancesComptees: 0, ateliers: {}, consentementSync: false };
    const p = progressionDe(etat, 'd1-u1-l1-expression-genique');
    expect(p.statut).toBe('vierge');
  });

  it('viderStockage efface localStorage et stats', () => {
    const etat: Etat = {
      version: 2, progression: {}, jalons: {}, notes: [], carnet: [], journal: [], minutesTotales: 0, revisions: 0,
      nom: 'x', dateBac: '2027-06-10', seancesComptees: 0, ateliers: {}, consentementSync: false,
    };
    (globalThis as any).localStorage.setItem('murajih_svt_v1', JSON.stringify(etat));
    viderStockage();
    expect((globalThis as any).localStorage.getItem('murajih_svt_v1')).toBe('');
  });

  it('minutesStockees lit les minutes du leçon', () => {
    const etat: Etat = {
      version: 2, progression: { 'd1-u1-l1-expression-genique': { statut: 'en_cours', phases: [], minutes: 7, repetitions: 0, intervalle: 0, facilite: 2.5 } },
      jalons: {}, notes: [], carnet: [], journal: [], minutesTotales: 7, revisions: 0,
      nom: 'x', dateBac: '2027-06-10', seancesComptees: 0, ateliers: {}, consentementSync: false,
    };
    (globalThis as any).localStorage.setItem('murajih_svt_v1', JSON.stringify(etat));
    expect(minutesStockees('d1-u1-l1-expression-genique')).toBe(7);
  });
});
