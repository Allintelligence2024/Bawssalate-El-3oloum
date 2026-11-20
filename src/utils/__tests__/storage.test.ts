// Tests de l'export/import et de la persistance — P0.4
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Etat } from '../../types';
import { etatDepuisFichier, lireSauvegarde } from '../backup';
import { noterReponse, statsActuelles, restaurerStats } from '../stats';
import { effacerAlerteStockage } from '../echecsStockage';
import {
  chargerEtat,
  sauvegarderEtat,
  etatDepuisBrut,
  paquetExportComplet,
  surEchecSauvegarde,
  progressionDe,
  viderStockage,
  minutesStockees,
  fusionnerProgressionImportee,
  autoriserRemplacementEtat,
} from '../storage';

// Mock localStorage global avant chaque test
let stored = '';
beforeEach(() => {
  effacerAlerteStockage();
  autoriserRemplacementEtat();
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

  it.each(['5', null, -1, 1_000_000_001])('protège un état avec des minutes locales invalides : %j', (minutes) => {
    stored = JSON.stringify({ progression: { l1: { minutes } } });
    const initial = stored;
    const lu = chargerEtat();
    expect(lu.progression).toEqual({});
    expect(minutesStockees('l1')).toBe(0);
    sauvegarderEtat(lu);
    expect(stored).toBe(initial);
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

describe('protection après échec de lecture', () => {
  it('ne remplace pas des données existantes si la lecture échoue', () => {
    let brut = '{"progression":{"important":{}}}';
    const writes = vi.fn((_cle: string, valeur: string) => { brut = valeur; });
    (globalThis as any).localStorage = { getItem: () => { throw new Error('lecture refusée'); }, setItem: writes };
    const ecouteur = vi.fn();
    const stop = surEchecSauvegarde(ecouteur);
    const etat = chargerEtat();
    sauvegarderEtat(etat);
    expect(writes).not.toHaveBeenCalled();
    expect(brut).toContain('important');
    expect(ecouteur).toHaveBeenCalled();
    stop();
  });
  it('protège les données illisibles jusqu’à un remplacement explicite', () => {
    stored = '{JSON cassé';
    const etat = chargerEtat();
    sauvegarderEtat(etat);
    expect(stored).toBe('{JSON cassé');
    autoriserRemplacementEtat();
    sauvegarderEtat(etat);
    expect(JSON.parse(stored).progression).toEqual({});
  });
  it('ne remplace pas un état de structure incohérente', () => {
    stored = JSON.stringify({ progression: {}, notes: 'pas une liste' });
    const brut = stored;
    sauvegarderEtat(chargerEtat());
    expect(stored).toBe(brut);
  });
  it('signale un échec de suppression', () => {
    const ecouteur = vi.fn();
    const stop = surEchecSauvegarde(ecouteur);
    (globalThis as any).localStorage.removeItem = () => { throw new Error('refus'); };
    viderStockage();
    expect(ecouteur).toHaveBeenCalled();
    stop();
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
    carnet: [{ id: 'f1', ts: '2026-11-16T09:00:00Z', contexte: 'test', enonce: 'question', donne: 'réponse', diagnostic: 'erreur' }],
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
    expect(paquet.version).toBe(3);
    expect(paquet.application).toContain('بوصلة العلوم');
    expect(typeof paquet.exporteLe).toBe('string');
    // l'export n'embarque aucun secret réutilisable
    expect(paquet.etat.compte).toBeUndefined();
    expect(JSON.stringify(paquet)).not.toContain('jeton-123');
    expect(paquet.etat.consentementSync).toBeUndefined();
    // re-import du JSON sérialisé (le vrai chemin passe par JSON.stringify)
    const restaure = etatDepuisFichier(JSON.parse(JSON.stringify(paquet)));
    expect(restaure).not.toBeNull();
    expect(restaure!.progression).toEqual(original.progression);
    expect(restaure!.jalons).toEqual(original.jalons);
    expect(restaure!.notes).toEqual(original.notes);
    expect(restaure!.carnet).toEqual(original.carnet);
    expect(restaure!.consentementSync).toBe(false);
    expect(restaure!.consentementSyncDecideLe).toBeUndefined();
    expect(restaure!.compte).toBeUndefined();
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
    expect(restaure!.compte).toBeUndefined();
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

describe('sauvegarde sécurisée', () => {
  it('rejette les données mal formées, les versions futures et les valeurs hors limites', () => {
    expect(etatDepuisFichier({ progression: [] })).toBeNull();
    expect(etatDepuisFichier({ progression: { a: { statut: 'terminee' } } })).toBeNull();
    expect(etatDepuisFichier({ progression: {}, notes: 'oops' })).toBeNull();
    expect(etatDepuisFichier({ progression: {}, minutesTotales: -1 })).toBeNull();
    expect(etatDepuisFichier({ version: 999, etat: { progression: {} } })).toBeNull();
    expect(etatDepuisFichier({ etat: { progression: {} }, stats: { justes: 'oops' } })).toBeNull();
  });
  it('exporte et restaure les statistiques, sans transférer le compte ni le consentement', () => {
    noterReponse('phase', true);
    const avant = statsActuelles();
    const lu = lireSauvegarde(JSON.parse(JSON.stringify(paquetExportComplet({ ...etatComplet(), consentementSync: true }))));
    expect(lu?.stats).toEqual(avant);
    expect(lu?.etat.compte).toBeUndefined();
    expect(lu?.etat.consentementSync).toBeUndefined();
    restaurerStats(lu!.stats!);
    expect(statsActuelles()).toEqual(avant);
  });
  it('conserve le compte et le consentement courants, jamais ceux du fichier', () => {
    const courant = etatComplet();
    const lu = etatDepuisFichier({ ...etatComplet(), compte: { email: 'intrus', jeton: 'secret' }, consentementSync: false });
    expect(lu).not.toBeNull();
    const resultat = fusionnerProgressionImportee(courant, lu!);
    expect(resultat.compte).toEqual(courant.compte);
    expect(resultat.consentementSync).toBe(courant.consentementSync);
    expect(resultat.consentementSyncDecideLe).toBe(courant.consentementSyncDecideLe);
  });
  it('signale aussi une erreur antérieure à l’abonnement et les échecs de statistiques', () => {
    (globalThis as any).localStorage.setItem = () => { throw new Error('quota'); };
    noterReponse('phase', true);
    const appel = vi.fn();
    const stop = surEchecSauvegarde(appel);
    expect(appel).toHaveBeenCalledTimes(1);
    stop();
  });

});
