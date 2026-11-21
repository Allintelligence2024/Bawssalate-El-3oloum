import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { etatVierge } from '../../types';
import { lireSauvegarde } from '../backup';
import { CarnetBoussoleIllisible, CLE_CARNET_BOUSSOLE, type CarnetBoussole } from '../carnetBoussole';
import { effacerAlerteStockage, surEchecSauvegarde } from '../echecsStockage';
import { memoriserValeur, reinitialiserEtatPerime } from '../coherenceStockage';
import { appliquerStats, CLE_STATS, noterReponse, restaurerStats, statsActuelles, viderStats, type StatsReponses } from '../stats';
import {
  autoriserRemplacementEtat, chargerEtat, paquetExportComplet, RestaurationEnAttente, restaurerEtatEtStats,
  sauvegarderEtat, suspendreEcrituresLocalement, viderStockage,
} from '../storage';

const ETAT = 'murajih_svt_v1';
const JOURNAL = 'murajih_restauration_v1';
const carnet: CarnetBoussole = {
  version: 1, solo: 'محاولة ١\nنصّ خاص', link: '', first: 'الدليل', events: '',
  inhibit: 'فكرة شخصية 🧪', soloHelp: true, docHelp: false, recent: ['inhibit', 'solo', 'first'],
};
const stats: StatsReponses = {
  justes: 5, fausses: 1,
  parSource: {
    phase: { justes: 5, fausses: 1 }, revision: { justes: 0, fausses: 0 },
    jalon: { justes: 0, fausses: 0 }, atelier: { justes: 0, fausses: 0 }, exercice: { justes: 0, fausses: 0 },
  },
  parJour: {},
};
let store: Record<string, string>;
let ecritures: string[];
let bloqueEcriture: Set<string>;
let bloqueSuppression: Set<string>;

beforeEach(() => {
  store = {};
  ecritures = [];
  bloqueEcriture = new Set();
  bloqueSuppression = new Set();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null,
    setItem: (key: string, value: string) => {
      if (bloqueEcriture.has(key)) throw new Error('quota');
      store[key] = value;
      ecritures.push(key);
    },
    removeItem: (key: string) => {
      if (bloqueSuppression.has(key)) throw new Error('suppression refusée');
      delete store[key];
    },
  });
  // Nouveau navigateur fictif : ne pas conserver les références du test précédent.
  reinitialiserEtatPerime();
  memoriserValeur(ETAT, null);
  memoriserValeur(CLE_STATS, null);
  viderStats();
  autoriserRemplacementEtat();
  effacerAlerteStockage();
});
afterEach(() => vi.unstubAllGlobals());

// Simule la lecture préalable des données initiales, sans événement inter-onglets.
function memoriserFixtures() {
  memoriserValeur(ETAT, store[ETAT] ?? null);
  memoriserValeur(CLE_STATS, store[CLE_STATS] ?? null);
}

describe('carnet du laboratoire — sauvegarde et compatibilité', () => {
  it('exporte puis restaure exactement les brouillons, avec état et statistiques, sans secrets', () => {
    const etat = { ...etatVierge(), nom: 'تلميذ', consentementSync: true,
      compte: { email: 'a@b.c', motDePasse: 'secret-hash', jeton: 'secret-token', wilaya: '16', daira: 'x', creeLe: '2026-01-01' } };
    store[CLE_CARNET_BOUSSOLE] = JSON.stringify(carnet);
    store[CLE_STATS] = JSON.stringify(stats);
    appliquerStats(stats);
    memoriserFixtures();
    const paquet = JSON.parse(JSON.stringify(paquetExportComplet(etat)));
    expect(paquet.carnetBoussole).toEqual(carnet);
    expect(JSON.stringify(paquet)).not.toContain('secret-');
    expect(paquet.etat.compte).toBeUndefined();
    expect(paquet.etat.consentementSync).toBeUndefined();
    const lu = lireSauvegarde(paquet)!;
    store[CLE_CARNET_BOUSSOLE] = JSON.stringify({ ...carnet, solo: 'autre' });
    expect(restaurerEtatEtStats(etatVierge(), lu.stats, lu.carnetBoussole, store[CLE_CARNET_BOUSSOLE] ?? null)).toBe(true);
    expect(ecritures[0]).toBe(JOURNAL);
    expect(JSON.parse(store[CLE_CARNET_BOUSSOLE])).toEqual(carnet);
    expect(statsActuelles()).toEqual(stats);
    expect(store[JOURNAL]).toBeUndefined();
  });

  it('un nouveau fichier sans carnet contient null et retire un ancien carnet à la restauration', () => {
    const paquet = paquetExportComplet(etatVierge());
    expect(paquet.carnetBoussole).toBeNull();
    store[CLE_CARNET_BOUSSOLE] = JSON.stringify(carnet);
    const lu = lireSauvegarde(paquet)!;
    expect(restaurerEtatEtStats(etatVierge(), lu.stats, lu.carnetBoussole, store[CLE_CARNET_BOUSSOLE] ?? null)).toBe(true);
    expect(store[CLE_CARNET_BOUSSOLE]).toBeUndefined();
  });

  it('un ancien fichier sans champ carnet ni statistiques conserve les deux données locales', () => {
    store[CLE_CARNET_BOUSSOLE] = JSON.stringify(carnet);
    store[CLE_STATS] = JSON.stringify(stats);
    appliquerStats(stats);
    memoriserFixtures();
    const lu = lireSauvegarde({ version: 1, progression: {} })!;
    expect(lu.carnetBoussole).toBeUndefined();
    expect(lu.stats).toBeUndefined();
    expect(restaurerEtatEtStats(etatVierge(), lu.stats, lu.carnetBoussole, store[CLE_CARNET_BOUSSOLE] ?? null)).toBe(true);
    expect(JSON.parse(store[CLE_CARNET_BOUSSOLE])).toEqual(carnet);
    expect(statsActuelles()).toEqual(stats);
    expect(JSON.parse(store[CLE_STATS])).toEqual(stats);
  });

  it('refuse tout fichier dont le carnet est corrompu, futur, incomplet ou inconnu', () => {
    store[CLE_CARNET_BOUSSOLE] = JSON.stringify(carnet);
    const mauvais = [
      'texte', [], { ...carnet, version: 2 }, { ...carnet, solo: 12 },
      { ...carnet, recent: ['mot-de-passe'] }, { ...carnet, inattendu: 'secret' },
      { version: 1 },
    ];
    for (const valeur of mauvais) {
      expect(lireSauvegarde({ version: 3, etat: { progression: {} }, carnetBoussole: valeur })).toBeNull();
    }
    expect(store[CLE_CARNET_BOUSSOLE]).toBe(JSON.stringify(carnet));
    expect(store[ETAT]).toBeUndefined();
  });

  it('ne produit pas une copie prétendument complète si le carnet local ne peut être lu', () => {
    store[CLE_CARNET_BOUSSOLE] = '{corrompu';
    expect(() => paquetExportComplet(etatVierge())).toThrow(CarnetBoussoleIllisible);
    expect(store[CLE_CARNET_BOUSSOLE]).toBe('{corrompu');
    vi.stubGlobal('localStorage', { getItem: () => { throw new Error('accès refusé'); } });
    // L'accès est maintenant refusé à toutes les clés : la comparaison elle-même échoue.
    expect(() => paquetExportComplet(etatVierge())).toThrow(RestaurationEnAttente);
  });
});

describe('restauration et suppression des trois magasins', () => {
  it('un onglet périmé ne peut ni exporter, ni réimporter, ni effacer après disparition du journal', async () => {
    const courant = { ...etatVierge(), nom: 'copie affichée' };
    store[ETAT] = JSON.stringify({ ...etatVierge(), nom: 'copie restaurée' });
    store[CLE_STATS] = JSON.stringify(stats);
    store[CLE_CARNET_BOUSSOLE] = JSON.stringify(carnet);
    suspendreEcrituresLocalement(); // événement de restauration d'un autre onglet
    expect(() => paquetExportComplet(courant)).toThrow();
    expect(restaurerEtatEtStats(courant, stats, carnet, store[CLE_CARNET_BOUSSOLE] ?? null)).toBe(false);
    expect(viderStockage(store[CLE_CARNET_BOUSSOLE] ?? null)).toBe(false);
    expect(JSON.parse(store[ETAT]).nom).toBe('copie restaurée');
    expect(JSON.parse(store[CLE_CARNET_BOUSSOLE])).toEqual(carnet);
    expect(store[JOURNAL]).toBeUndefined();
    // Relire uniquement l'état ne remet pas les statistiques en mémoire à jour.
    expect(chargerEtat().nom).toBe('copie restaurée');
    expect(() => paquetExportComplet({ ...etatVierge(), nom: 'copie restaurée' })).toThrow();
    // Un vrai rechargement de page réinitialise aussi le singleton de statistiques.
    vi.resetModules();
    const nouvelOnglet = await import('../storage');
    const relu = nouvelOnglet.chargerEtat();
    expect(relu.nom).toBe('copie restaurée');
    expect(nouvelOnglet.paquetExportComplet(relu).stats).toEqual(stats);
  });

  it('un journal laissé par un autre document bloque les écritures ordinaires et les exports incohérents', () => {
    const ancienEtat = JSON.stringify({ ...etatVierge(), nom: 'avant' });
    const anciennesStats = JSON.stringify(stats);
    const journal = JSON.stringify({ etat: { ...etatVierge(), nom: 'importé' }, stats, carnetBoussole: carnet });
    store[ETAT] = ancienEtat;
    store[CLE_STATS] = anciennesStats;
    store[JOURNAL] = journal;
    appliquerStats(stats);
    memoriserFixtures();
    const alerte = vi.fn();
    const stop = surEchecSauvegarde(alerte);
    sauvegarderEtat({ ...etatVierge(), nom: 'ne pas écraser' });
    noterReponse('phase', true);
    restaurerStats({ ...stats, justes: 9 });
    expect(store[ETAT]).toBe(ancienEtat);
    expect(store[CLE_STATS]).toBe(anciennesStats);
    expect(store[JOURNAL]).toBe(journal);
    expect(() => paquetExportComplet(etatVierge())).toThrow();
    expect(alerte).toHaveBeenCalled();
    stop();
  });

  it('une deuxième restauration ne rejoue pas un journal à l’insu de l’état affiché', () => {
    const avant = JSON.stringify({ ...etatVierge(), nom: 'avant' });
    const journal = JSON.stringify({ etat: { ...etatVierge(), nom: 'import interrompu' }, carnetBoussole: carnet });
    store[ETAT] = avant;
    store[JOURNAL] = journal;
    memoriserFixtures();
    expect(restaurerEtatEtStats({ ...etatVierge(), nom: 'nouvel import' }, undefined, carnet, store[CLE_CARNET_BOUSSOLE] ?? null)).toBe(false);
    expect(store[ETAT]).toBe(avant);
    expect(store[JOURNAL]).toBe(journal);
    expect(chargerEtat().nom).toBe('import interrompu');
    expect(store[JOURNAL]).toBeUndefined();
  });

  it('échec sur le carnet : restaure les anciens octets des autres clés et signale l’échec', () => {
    const avantEtat = JSON.stringify({ ...etatVierge(), nom: 'avant' });
    const avantStats = JSON.stringify(stats);
    const avantCarnet = JSON.stringify({ ...carnet, solo: 'avant' });
    store[ETAT] = avantEtat;
    store[CLE_STATS] = avantStats;
    store[CLE_CARNET_BOUSSOLE] = avantCarnet;
    appliquerStats(stats);
    memoriserFixtures();
    bloqueEcriture.add(CLE_CARNET_BOUSSOLE);
    const alerte = vi.fn();
    const stop = surEchecSauvegarde(alerte);
    const nouvellesStats = { ...stats, justes: 99 };
    expect(restaurerEtatEtStats({ ...etatVierge(), nom: 'après' }, nouvellesStats, carnet, store[CLE_CARNET_BOUSSOLE] ?? null)).toBe(false);
    expect(store[ETAT]).toBe(avantEtat);
    expect(store[CLE_STATS]).toBe(avantStats);
    expect(store[CLE_CARNET_BOUSSOLE]).toBe(avantCarnet);
    expect(store[JOURNAL]).toBeUndefined();
    expect(statsActuelles()).toEqual(stats);
    expect(alerte).toHaveBeenCalled();
    stop();
  });

  it('si le journal ne peut pas être retiré, protège les écritures puis rejoue à la reprise', () => {
    const avant = JSON.stringify({ ...etatVierge(), nom: 'avant' });
    const avantCarnet = JSON.stringify({ ...carnet, solo: 'avant' });
    store[ETAT] = avant;
    store[CLE_CARNET_BOUSSOLE] = avantCarnet;
    memoriserFixtures();
    bloqueSuppression.add(JOURNAL);
    const alerte = vi.fn();
    const stop = surEchecSauvegarde(alerte);
    expect(restaurerEtatEtStats({ ...etatVierge(), nom: 'importé' }, undefined, carnet, store[CLE_CARNET_BOUSSOLE] ?? null)).toBe(false);
    expect(store[ETAT]).toBe(avant);
    expect(store[CLE_CARNET_BOUSSOLE]).toBe(avantCarnet);
    expect(store[JOURNAL]).toBeDefined(); // l'effacement du journal a échoué
    sauvegarderEtat({ ...etatVierge(), nom: 'ne pas écraser' });
    expect(store[ETAT]).toBe(avant);
    expect(alerte).toHaveBeenCalled();
    bloqueSuppression.clear();
    expect(chargerEtat().nom).toBe('importé');
    expect(JSON.parse(store[CLE_CARNET_BOUSSOLE])).toEqual(carnet);
    expect(store[JOURNAL]).toBeUndefined();
    stop();
  });

  it('reprend un journal interrompu avec le carnet avant de lire l’état', () => {
    const nouveau = { ...etatVierge(), nom: 'après' };
    store[JOURNAL] = JSON.stringify({ etat: nouveau, stats, carnetBoussole: carnet });
    store[ETAT] = JSON.stringify({ ...etatVierge(), nom: 'avant' });
    expect(chargerEtat().nom).toBe('après');
    expect(JSON.parse(store[CLE_CARNET_BOUSSOLE])).toEqual(carnet);
    expect(JSON.parse(store[CLE_STATS])).toEqual(stats);
    expect(statsActuelles()).toEqual(stats);
    expect(store[JOURNAL]).toBeUndefined();
  });

  it('un rejeu refusé reste signalé et protégé, puis peut être achevé au prochain essai', () => {
    store[JOURNAL] = JSON.stringify({ etat: { ...etatVierge(), nom: 'importé' }, stats, carnetBoussole: carnet });
    bloqueEcriture.add(CLE_CARNET_BOUSSOLE);
    const alerte = vi.fn();
    const stop = surEchecSauvegarde(alerte);
    expect(chargerEtat().nom).not.toBe('importé'); // pas d'état partiellement appliqué présenté
    const partiel = store[ETAT];
    sauvegarderEtat({ ...etatVierge(), nom: 'écrasement' });
    expect(store[ETAT]).toBe(partiel);
    expect(store[JOURNAL]).toBeDefined();
    expect(alerte).toHaveBeenCalled();
    bloqueEcriture.clear();
    expect(chargerEtat().nom).toBe('importé');
    expect(JSON.parse(store[CLE_CARNET_BOUSSOLE])).toEqual(carnet);
    expect(store[JOURNAL]).toBeUndefined();
    stop();
  });

  it('efface aussi le journal avant le carnet et n’efface pas les clés sans rapport', () => {
    store[ETAT] = JSON.stringify(etatVierge());
    store[CLE_STATS] = JSON.stringify(stats);
    store[CLE_CARNET_BOUSSOLE] = JSON.stringify(carnet);
    store[JOURNAL] = JSON.stringify({ etat: etatVierge(), stats, carnetBoussole: carnet });
    store.autre = 'garder';
    memoriserFixtures();
    expect(viderStockage(store[CLE_CARNET_BOUSSOLE] ?? null)).toBe(true);
    expect(store[ETAT]).toBeUndefined();
    expect(store[CLE_STATS]).toBeUndefined();
    expect(store[CLE_CARNET_BOUSSOLE]).toBeUndefined();
    expect(store[JOURNAL]).toBeUndefined();
    expect(store.autre).toBe('garder');
    chargerEtat();
    expect(store[CLE_CARNET_BOUSSOLE]).toBeUndefined();
  });

  it('suppression du journal refusée : ne prétend pas avoir effacé les données', () => {
    store[JOURNAL] = JSON.stringify({ etat: etatVierge(), carnetBoussole: carnet });
    store[CLE_CARNET_BOUSSOLE] = JSON.stringify(carnet);
    store[ETAT] = JSON.stringify(etatVierge());
    memoriserFixtures();
    bloqueSuppression.add(JOURNAL);
    const alerte = vi.fn();
    const stop = surEchecSauvegarde(alerte);
    expect(viderStockage(store[CLE_CARNET_BOUSSOLE] ?? null)).toBe(false);
    expect(store[CLE_CARNET_BOUSSOLE]).toBe(JSON.stringify(carnet));
    expect(store[ETAT]).toBeDefined();
    expect(alerte).toHaveBeenCalled();
    stop();
  });

  it('effacement partiel refusé : avertissement, pas de réécriture automatique de l’ancien état', () => {
    store[CLE_CARNET_BOUSSOLE] = JSON.stringify(carnet);
    store[ETAT] = JSON.stringify(etatVierge());
    memoriserFixtures();
    bloqueSuppression.add(CLE_CARNET_BOUSSOLE);
    const alerte = vi.fn();
    const stop = surEchecSauvegarde(alerte);
    expect(viderStockage(store[CLE_CARNET_BOUSSOLE] ?? null)).toBe(false);
    expect(store[CLE_CARNET_BOUSSOLE]).toBeDefined();
    sauvegarderEtat({ ...etatVierge(), nom: 'état affiché avant échec' });
    expect(store[ETAT]).toBeUndefined();
    expect(alerte).toHaveBeenCalled();
    stop();
  });
});
