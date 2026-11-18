// Tests de l'export/import et de la persistance — P0.4
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { Etat } from '../../types';
import {
  chargerEtat,
  sauvegarderEtat,
  etatDepuisBrut,
  etatDepuisFichier,
  paquetExportComplet,
  surEchecSauvegarde,
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

// ───────────── Export complet → import (P-1.1 — D1) ─────────────

/** État complet avec compte, progression, SRS, carnet, notes — pour l'aller-retour. */
function etatComplet(): Etat {
  return {
    version: 2,
    compte: { email: 'test@example.com', motDePasse: 'hachage-secret', jeton: 'jeton-123', wilaya: '16', daira: '1613', creeLe: '2026-11-16T00:00:00Z' },
    progression: {
      'd1-u1-l1-expression-genique': { statut: 'terminee', phases: [1, 2, 3], minutes: 12, repetitions: 1, intervalle: 3, facilite: 2.6, prochaineRevision: '2026-11-19', fragile: false },
      'lecon_transcription': { statut: 'en_cours', phases: [1], minutes: 5, repetitions: 0, intervalle: 0, facilite: 2.5 },
    },
    jalons: { u1: { fait: true, synthese: 's', ts: '2026-11-16T09:00:00Z' } },
    notes: [{ id: 'n1', kind: 'question', uniteId: 'u1', texte: 'pourquoi ?', ts: '2026-11-16T09:00:00Z' } as any],
    carnet: [{ id: 'f1', ts: '2026-11-16T09:00:00Z' } as any],
    journal: ['2026-11-16'],
    minutesTotales: 17, revisions: 3,
    nom: 'تلميذ', dateBac: '2027-06-10', seancesJour: '2026-11-16', seancesComptees: 1,
    ateliers: { u1: { fait: true, ts: '2026-11-16T09:00:00Z' } },
    consentementSync: true, consentementSyncDecideLe: '2026-11-16T10:00:00Z',
    schemas: { 'schema-1': true },
  };
}

describe('storage — export complet → import (P-1.1)', () => {
  it('aller-retour : l\'export enveloppé est réimporté champ par champ', () => {
    const original = etatComplet();
    const paquet = paquetExportComplet(original);
    // enveloppe versionnée
    expect(paquet.version).toBe(2);
    expect(paquet.application).toContain('بوصلة العلوم');
    expect(typeof paquet.exporteLe).toBe('string');
    // l'export n'embarque aucun secret réutilisable
    expect(paquet.etat.compte?.motDePasse).toBe('');
    expect(paquet.etat.compte?.jeton).toBe('jeton-123'); // exigé par la policy Supabase
    // re-import du JSON sérialisé (le vrai chemin passe par JSON.stringify)
    const restaure = etatDepuisFichier(JSON.parse(JSON.stringify(paquet)));
    expect(restaure).not.toBeNull();
    expect(restaure!.progression).toEqual(original.progression);
    expect(restaure!.jalons).toEqual(original.jalons);
    expect(restaure!.notes).toEqual(original.notes);
    expect(restaure!.carnet).toEqual(original.carnet);
    expect(restaure!.consentementSync).toBe(true);
    expect(restaure!.consentementSyncDecideLe).toBe(original.consentementSyncDecideLe);
    expect(restaure!.compte?.email).toBe('test@example.com');
    expect(restaure!.compte?.motDePasse).toBe(''); // jamais de hachage restauré
  });

  it('l\'import accepte le format plat historique (progression à la racine)', () => {
    const original = etatComplet();
    delete (original as any).compte;
    const restaure = etatDepuisFichier(original);
    expect(restaure).not.toBeNull();
    expect(restaure!.progression['d1-u1-l1-expression-genique']?.statut).toBe('terminee');
    expect(restaure!.minutesTotales).toBe(17);
  });

  it('un fichier invalide → null (l\'app affiche l\'erreur sans écraser l\'état courant)', () => {
    expect(etatDepuisFichier(null)).toBeNull();
    expect(etatDepuisFichier({})).toBeNull();
    expect(etatDepuisFichier({ application: 'x', exporteLe: 'y' })).toBeNull(); // enveloppé sans etat
    expect(etatDepuisFichier('salut')).toBeNull();
  });

  it('un fichier importé ne restaure jamais un hachage de mot de passe', () => {
    const paquet = {
      application: 'copie-tierce', version: 1, exporteLe: 'x',
      etat: {
        ...etatComplet(),
        compte: { email: 'autre@example.com', motDePasse: 'hash-injecté', jeton: 'j2', wilaya: '16', daira: '1613', creeLe: 'x' },
      },
    };
    const restaure = etatDepuisFichier(paquet);
    expect(restaure!.compte?.motDePasse).toBe('');
  });
});

// ───────────── Échec de sauvegarde visible (P-1.4 — D4) ─────────────

describe('storage — surEchecSauvegarde (P-1.4)', () => {
  it('prévient les écouteurs quand l\'écriture échoue (quota plein / mode privé)', () => {
    (globalThis as any).localStorage = {
      getItem: () => null,
      setItem: () => { throw new Error('QuotaExceededError'); },
      removeItem: () => {},
    };
    const appels: number[] = [];
    const desabonner = surEchecSauvegarde(() => appels.push(1));
    sauvegarderEtat(etatComplet());
    expect(appels).toEqual([1]);
    // désinscription : plus de notification
    desabonner();
    sauvegarderEtat(etatComplet());
    expect(appels).toEqual([1]);
  });

  it('n\'appelle rien quand l\'écriture réussit', () => {
    const appels: number[] = [];
    surEchecSauvegarde(() => appels.push(1));
    sauvegarderEtat(etatComplet());
    expect(appels).toEqual([]);
  });
});
