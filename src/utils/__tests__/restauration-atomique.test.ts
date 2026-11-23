// P0.3 — restauration atomique : progression ET statistiques engagées en une seule écriture.
// Preuves attendues :
//  1. un import complet s'engage en une seule écriture (journal) puis s'applique ;
//  2. quota à l'engagement ou à l'application → anciennes données et état affiché inchangés ;
//  3. une sauvegarde ancienne sans statistiques conserve les statistiques existantes ;
//  4. rechargement au milieu de l'opération → le journal est rejoué ou le chargement est bloqué.
// Données 100 % fictives, localStorage simulé ; ne démontre pas l'atomicité entre onglets.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Etat } from '../../types';
import { etatDepuisFichier, lireSauvegarde } from '../backup';
import { noterReponse, statsActuelles, viderStats, CLE_STATS, type StatsReponses } from '../stats';
import { effacerAlerteStockage, surEchecSauvegarde } from '../echecsStockage';
import { memoriserValeur, reinitialiserEtatPerime } from '../coherenceStockage';
import {
  abandonnerJournalRestauration, chargerEtat, sauvegarderEtat, paquetExportComplet, fusionnerProgressionImportee,
  restaurationBloqueeAuChargement, restaurerEtatEtStats, autoriserRemplacementEtat,
} from '../storage';

const CLE_ETAT = 'murajih_svt_v1';
const CLE_JOURNAL = 'murajih_restauration_v1';

let store: Record<string, string>;
let clesBloquees: Set<string>;
let ecritures: { cle: string; valeur: string }[];

beforeEach(() => {
  store = {};
  clesBloquees = new Set();
  ecritures = [];
  (globalThis as any).localStorage = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => {
      if (clesBloquees.has(k)) throw new Error('QuotaExceededError');
      store[k] = v;
      ecritures.push({ cle: k, valeur: v });
    },
    removeItem: (k: string) => { delete store[k]; },
  };
  // Nouveau navigateur fictif : ne pas conserver les références du test précédent.
  reinitialiserEtatPerime();
  memoriserValeur(CLE_ETAT, null);
  memoriserValeur(CLE_STATS, null);
  effacerAlerteStockage();
  autoriserRemplacementEtat();
  viderStats(); // remet à zéro le singleton en mémoire + son état de lecture
});
afterEach(() => { (globalThis as any).localStorage = undefined; });

// Les valeurs installées comme données initiales ont été lues avant l'opération testée.
function memoriserFixtures() {
  memoriserValeur(CLE_ETAT, store[CLE_ETAT] ?? null);
  memoriserValeur(CLE_STATS, store[CLE_STATS] ?? null);
}

const etatMinimal = (): Etat => ({
  version: 2, progression: {}, jalons: {}, notes: [], carnet: [], journal: [], minutesTotales: 0, revisions: 0,
  nom: 'x', dateBac: '2027-06-10', seancesComptees: 0, ateliers: {}, consentementSync: false,
});
const statsValides = (): StatsReponses => ({
  justes: 5, fausses: 1,
  parSource: {
    phase: { justes: 5, fausses: 1 }, revision: { justes: 0, fausses: 0 }, jalon: { justes: 0, fausses: 0 },
    atelier: { justes: 0, fausses: 0 }, exercice: { justes: 0, fausses: 0 },
  },
  parJour: {},
});

describe('restauration atomique — engagement en une seule écriture', () => {
  it('succès : la première écriture engage état ET statistiques, puis application, journal retiré, mémoire alignée', () => {
    const nouveau: Etat = { ...etatMinimal(), minutesTotales: 42, nom: 'مريم' };
    const ok = restaurerEtatEtStats(nouveau, statsValides());
    expect(ok).toBe(true);
    // Une seule écriture contient les deux valeurs (phase d'engagement).
    expect(ecritures[0].cle).toBe(CLE_JOURNAL);
    const engage = JSON.parse(ecritures[0].valeur);
    expect(engage.etat.minutesTotales).toBe(42);
    expect(engage.stats.justes).toBe(5);
    // Application sur les deux clés canoniques, puis retrait du journal.
    expect(JSON.parse(store[CLE_ETAT]).minutesTotales).toBe(42);
    expect(JSON.parse(store[CLE_STATS]).justes).toBe(5);
    expect(store[CLE_JOURNAL]).toBeUndefined();
    expect(statsActuelles().justes).toBe(5); // mémoire alignée sur le disque
    expect(chargerEtat().nom).toBe('مريم'); // « redémarrage » : relu depuis le disque
  });

  it('sauvegarde ancienne sans statistiques : les statistiques existantes sont conservées (clé ET mémoire)', () => {
    noterReponse('phase', true);
    noterReponse('exercice', false);
    const avant = statsActuelles();
    const lu = lireSauvegarde({ progression: {}, version: 1 });
    expect(lu?.stats).toBeUndefined();
    const ok = restaurerEtatEtStats({ ...etatMinimal(), minutesTotales: 7 }, lu?.stats);
    expect(ok).toBe(true);
    expect(statsActuelles()).toEqual(avant); // mémoire : jamais remise à zéro
    expect(store[CLE_STATS]).toBe(JSON.stringify(avant)); // disque : inchangé
    expect(JSON.parse(store[CLE_ETAT]).minutesTotales).toBe(7); // la progression, elle, est restaurée
    expect(store[CLE_JOURNAL]).toBeUndefined();
  });
});

it('bloque la sauvegarde automatique tant que le rejeu du journal est incomplet', () => {
  store[CLE_ETAT] = JSON.stringify(etatMinimal());
  const journal = JSON.stringify({ etat: { ...etatMinimal(), nom: 'Restauré' }, stats: statsValides() });
  store[CLE_JOURNAL] = journal;
  clesBloquees.add(CLE_STATS);
  const alerte = vi.fn();
  const stop = surEchecSauvegarde(alerte);
  try {
    const lu = chargerEtat();
    expect(lu.nom).not.toBe('Restauré');
    const étatSurDisque = store[CLE_ETAT];
    sauvegarderEtat({ ...lu, nom: 'Ne pas écrire' });
    expect(store[CLE_ETAT]).toBe(étatSurDisque);
    expect(store[CLE_JOURNAL]).toBe(journal);
    expect(alerte).toHaveBeenCalled();
    clesBloquees.clear();
    expect(chargerEtat().nom).toBe('Restauré');
    expect(statsActuelles().justes).toBe(5);
    expect(store[CLE_JOURNAL]).toBeUndefined();
  } finally { stop(); }
});

describe('restauration atomique — quota (rien ne bouge)', () => {
  it('quota sur le journal d\'engagement : aucune autre clé touchée, alerte, mémoire inchangée', () => {
    const ancien = JSON.stringify(etatMinimal());
    store[CLE_ETAT] = ancien;
    store[CLE_STATS] = JSON.stringify(statsValides());
    const avant = statsActuelles();
    memoriserFixtures();
    clesBloquees.add(CLE_JOURNAL);
    const alerte = vi.fn();
    const stop = surEchecSauvegarde(alerte);
    const ok = restaurerEtatEtStats({ ...etatMinimal(), minutesTotales: 99 }, statsValides());
    expect(ok).toBe(false);
    expect(alerte).toHaveBeenCalled(); // l'échec n'est jamais silencieux
    expect(store[CLE_ETAT]).toBe(ancien);
    expect(store[CLE_STATS]).toBe(JSON.stringify(statsValides()));
    expect(statsActuelles()).toEqual(avant);
    expect(store[CLE_JOURNAL]).toBeUndefined();
    stop();
  });

  it('quota sur la clé état (phase d\'application) : l\'ancien contenu reste intact, journal retiré', () => {
    const ancien = JSON.stringify({ ...etatMinimal(), minutesTotales: 13 });
    store[CLE_ETAT] = ancien;
    store[CLE_STATS] = JSON.stringify(statsValides());
    const avant = statsActuelles();
    memoriserFixtures();
    clesBloquees.add(CLE_ETAT);
    const alerte = vi.fn();
    const stop = surEchecSauvegarde(alerte);
    const ok = restaurerEtatEtStats({ ...etatMinimal(), minutesTotales: 99 }, statsValides());
    expect(ok).toBe(false);
    expect(alerte).toHaveBeenCalled();
    expect(store[CLE_ETAT]).toBe(ancien); // ni écrasé, ni corrompu
    expect(store[CLE_STATS]).toBe(JSON.stringify(statsValides())); // jamais touchée
    expect(statsActuelles()).toEqual(avant);
    expect(store[CLE_JOURNAL]).toBeUndefined(); // annulation complète : pas de rejeu surprise
    stop();
  });

  it('quota sur la clé statistiques (phase d\'application) : l\'ancien état est remis en place, tout reste cohérent', () => {
    const ancienEtat = JSON.stringify({ ...etatMinimal(), minutesTotales: 13 });
    const ancienStats = JSON.stringify(statsValides());
    store[CLE_ETAT] = ancienEtat;
    store[CLE_STATS] = ancienStats;
    const avant = statsActuelles();
    memoriserFixtures();
    clesBloquees.add(CLE_STATS);
    const alerte = vi.fn();
    const stop = surEchecSauvegarde(alerte);
    const ok = restaurerEtatEtStats({ ...etatMinimal(), minutesTotales: 99 }, statsValides());
    expect(ok).toBe(false);
    expect(alerte).toHaveBeenCalled();
    expect(store[CLE_ETAT]).toBe(ancienEtat); // rollback : ancien octet rétabli
    expect(store[CLE_STATS]).toBe(ancienStats);
    expect(statsActuelles()).toEqual(avant); // état affiché inchangé
    expect(store[CLE_JOURNAL]).toBeUndefined();
    stop();
  });
});

describe('restauration atomique — rechargement et protection', () => {
  it('journal corrompu au chargement : conservé et signalé, état potentiellement partiel protégé', () => {
    const ancien = JSON.stringify({ ...etatMinimal(), minutesTotales: 13 });
    store[CLE_ETAT] = ancien;
    store[CLE_STATS] = JSON.stringify(statsValides());
    store[CLE_JOURNAL] = '{JSON cassé';
    const avant = statsActuelles();
    const alerte = vi.fn();
    const stop = surEchecSauvegarde(alerte);
    const relu = chargerEtat();
    expect(relu.minutesTotales).not.toBe(13); // ne pas présenter une restauration partielle comme complète
    sauvegarderEtat({ ...etatMinimal(), minutesTotales: 99 });
    expect(store[CLE_ETAT]).toBe(ancien);
    expect(store[CLE_JOURNAL]).toBe('{JSON cassé');
    expect(statsActuelles()).toEqual(avant);
    expect(restaurationBloqueeAuChargement()).toBe(true);
    expect(alerte).toHaveBeenCalled();
    // L'abandon n'intervient qu'après une décision explicite dans l'interface.
    expect(abandonnerJournalRestauration()).toBe(true);
    expect(chargerEtat().minutesTotales).toBe(13);
    expect(restaurationBloqueeAuChargement()).toBe(false);
    stop();
  });

  it('refuse sans supprimer un journal vide, futur ou aux statistiques invalides', () => {
    const ancien = JSON.stringify({ ...etatMinimal(), minutesTotales: 13 });
    store[CLE_ETAT] = ancien;
    for (const journal of [
      '',
      JSON.stringify({ etat: { ...etatMinimal(), version: 99 }, stats: statsValides() }),
      JSON.stringify({ etat: etatMinimal(), stats: { justes: 'invalide' } }),
      JSON.stringify({ etat: etatMinimal(), carnetBoussole: { version: 2 } }),
      JSON.stringify({ etat: etatMinimal(), nouveauteVersionFuture: { aPreserver: true } }),
      JSON.stringify({ etat: { ...etatMinimal(), compte: { email: [] } }, stats: statsValides() }),
    ]) {
      store[CLE_JOURNAL] = journal;
      expect(chargerEtat().minutesTotales).not.toBe(13);
      expect(store[CLE_ETAT]).toBe(ancien);
      expect(store[CLE_JOURNAL]).toBe(journal);
    }
  });

  it('ne traite pas un état présent mais vide comme une absence de données', () => {
    store[CLE_ETAT] = '';
    const alerte = vi.fn();
    const stop = surEchecSauvegarde(alerte);
    chargerEtat();
    sauvegarderEtat({ ...etatMinimal(), nom: 'ne pas écraser' });
    expect(store[CLE_ETAT]).toBe('');
    expect(alerte).toHaveBeenCalled();
    stop();
  });

  it('protection de lecture : conservée après un échec de restauration, levée après un succès', () => {
    store[CLE_ETAT] = '{JSON cassé';
    chargerEtat(); // lecture impossible → protection de ré-écriture active
    clesBloquees.add(CLE_JOURNAL);
    const refus = restaurerEtatEtStats({ ...etatMinimal(), minutesTotales: 99 }, statsValides());
    expect(refus).toBe(false);
    sauvegarderEtat({ ...etatMinimal(), minutesTotales: 99 });
    expect(store[CLE_ETAT]).toBe('{JSON cassé'); // toujours protégé : l'ancien n'est pas écrasé
    clesBloquees.delete(CLE_JOURNAL);
    const ok = restaurerEtatEtStats({ ...etatMinimal(), minutesTotales: 42 }, statsValides());
    expect(ok).toBe(true); // l'import validé lève la protection
    sauvegarderEtat({ ...etatMinimal(), minutesTotales: 43 });
    expect(JSON.parse(store[CLE_ETAT]).minutesTotales).toBe(43);
  });

  it('redémarrage après restauration réussie : progression relu à l\'identique, identité et consentement locaux conservés', () => {
    const courant: Etat = {
      ...etatMinimal(),
      compte: { email: 'a@b.c', motDePasse: 'h', wilaya: '16', daira: 'x', creeLe: '2026-11-01' },
      consentementSync: false,
    };
    store[CLE_ETAT] = JSON.stringify(courant);
    chargerEtat(); // état courant lu avant l'export et l'import
    const original: Etat = {
      ...etatMinimal(),
      progression: {
        'd1-u1-l1-expression-genique': { statut: 'terminee', phases: [1, 2, 3], minutes: 12, repetitions: 1, intervalle: 3, facilite: 2.6 },
      },
      minutesTotales: 12, nom: 'تلميذ',
    };
    const importe = etatDepuisFichier(JSON.parse(JSON.stringify(paquetExportComplet(original))));
    expect(importe).not.toBeNull();
    const fusionne = fusionnerProgressionImportee(courant, importe!);
    const ok = restaurerEtatEtStats(fusionne, statsValides());
    expect(ok).toBe(true);
    const relu = chargerEtat(); // « redémarrage »
    expect(relu.progression).toEqual(original.progression);
    expect(relu.compte).toEqual(courant.compte); // l'identité vient de l'appareil, pas du fichier
    expect(relu.consentementSync).toBe(false);
    expect(statsActuelles().justes).toBe(5);
    expect(store[CLE_JOURNAL]).toBeUndefined();
  });

  it('rechargement des modules au milieu de l\'opération : le journal est rejoué (restauration complète)', async () => {
    const nouveau: Etat = { ...etatMinimal(), minutesTotales: 77, nom: 'بعد إعادة التحميل' };
    // État après phase d'engagement, avant phase d'application (coupure au milieu).
    store[CLE_ETAT] = JSON.stringify(etatMinimal());
    store[CLE_JOURNAL] = JSON.stringify({ etat: nouveau, stats: statsValides() });
    vi.resetModules(); // « nouvelle session » : modules entièrement rechargés
    const { chargerEtat: recharger } = await import('../storage');
    const { statsActuelles: statsFraiches } = await import('../stats');
    const relu = recharger();
    expect(relu.minutesTotales).toBe(77);
    expect(relu.nom).toBe('بعد إعادة التحميل');
    expect(store[CLE_ETAT]).toBe(JSON.stringify(nouveau));
    expect(store[CLE_STATS]).toBe(JSON.stringify(statsValides()));
    expect(statsFraiches().justes).toBe(5); // mémoire fraîche alignée par le rejeu
    expect(store[CLE_JOURNAL]).toBeUndefined(); // rejoué une seule fois
  });
});
