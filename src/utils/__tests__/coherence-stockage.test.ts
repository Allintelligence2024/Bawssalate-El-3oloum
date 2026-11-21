// Une notification « storage » peut arriver après la prochaine action locale.
// Simuler le changement directement, sans envoyer cet événement.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ETAT = 'murajih_svt_v1';
const STATS = 'kunz_stats_v1';
const JOURNAL = 'murajih_restauration_v1';
const CARNET = 'boussole.bac.classe16.carnet.1';
const initial = JSON.stringify({ progression: {}, nom: 'version initiale' });
const autreEtat = JSON.stringify({ progression: {}, nom: 'version du deuxième onglet' });
const compteurs = (justes: number) => JSON.stringify({
  justes, fausses: 0,
  parSource: Object.fromEntries(['phase', 'revision', 'jalon', 'atelier', 'exercice'].map(k => [k, { justes: 0, fausses: 0 }])),
  parJour: {},
});

let donnees: Map<string, string>;
let ecrites: string[];
let refusLecture: string | null;

beforeEach(() => {
  vi.resetModules();
  donnees = new Map([[ETAT, initial], [STATS, compteurs(0)]]);
  ecrites = [];
  refusLecture = null;
  vi.stubGlobal('window', {});
  vi.stubGlobal('localStorage', {
    getItem: (cle: string) => {
      if (cle === refusLecture) throw Error('lecture refusée');
      return donnees.get(cle) ?? null;
    },
    setItem: (cle: string, valeur: string) => { donnees.set(cle, valeur); ecrites.push(cle); },
    removeItem: (cle: string) => { donnees.delete(cle); ecrites.push(cle); },
  });
});
afterEach(() => vi.unstubAllGlobals());

describe('protection avant réception de storage', () => {
  it('refuse une sauvegarde périmée et signale le conflit immédiatement', async () => {
    const storage = await import('../storage');
    const etat = storage.chargerEtat();
    const conflit = vi.fn();
    const stop = storage.surEtatPerime(conflit);
    donnees.set(ETAT, autreEtat); // modification distante sans événement
    storage.sauvegarderEtat({ ...etat, nom: 'ancienne copie' });
    expect(donnees.get(ETAT)).toBe(autreEtat);
    expect(ecrites).not.toContain(ETAT);
    expect(conflit).toHaveBeenCalledTimes(1);
    expect(() => storage.paquetExportComplet(etat)).toThrow(storage.RestaurationEnAttente);
    stop();
  });

  it.each([ETAT, STATS])('refuse une réponse statistique si %s a changé sans notification', async (cle) => {
    const storage = await import('../storage');
    const stats = await import('../stats');
    storage.chargerEtat();
    const conflit = vi.fn();
    const stop = storage.surEtatPerime(conflit);
    const distance = cle === ETAT ? autreEtat : compteurs(4);
    donnees.set(cle, distance);
    stats.noterReponse('phase', true);
    expect(donnees.get(cle)).toBe(distance);
    expect(ecrites).not.toContain(STATS);
    expect(conflit).toHaveBeenCalledTimes(1);
    stop();
  });

  it.each([ETAT, STATS])('refuse aussi export, import et reset quand %s est périmé', async (cle) => {
    const storage = await import('../storage');
    const etat = storage.chargerEtat();
    const distance = cle === ETAT ? autreEtat : compteurs(4);
    donnees.set(cle, distance);
    expect(() => storage.paquetExportComplet(etat)).toThrow(storage.RestaurationEnAttente);
    expect(storage.restaurerEtatEtStats({ ...etat, nom: 'import' })).toBe(false);
    expect(storage.viderStockage(null)).toBe(false);
    expect(donnees.get(cle)).toBe(distance);
    expect(donnees.has(JOURNAL)).toBe(false);
    expect(ecrites).toEqual([]);
  });

  it.each(['import', 'reset'])('refuse %s si le carnet a changé depuis la confirmation', async (action) => {
    const storage = await import('../storage');
    const etat = storage.chargerEtat();
    const avantConfirmation = JSON.stringify({ version: 1, solo: 'avant', link: '', first: '', events: '', inhibit: '', soloHelp: false, docHelp: false, recent: ['solo'] });
    donnees.set(CARNET, avantConfirmation);
    const apresConfirmation = avantConfirmation.replace('avant', 'après');
    donnees.set(CARNET, apresConfirmation); // aucun changement de l’état ni des stats
    const conflit = vi.fn();
    const stop = storage.surEtatPerime(conflit);
    const ok = action === 'import'
      ? storage.restaurerEtatEtStats(etat, undefined, null, avantConfirmation)
      : storage.viderStockage(avantConfirmation);
    expect(ok).toBe(false);
    expect(donnees.get(CARNET)).toBe(apresConfirmation);
    expect(donnees.get(ETAT)).toBe(initial);
    expect(donnees.has(JOURNAL)).toBe(false);
    expect(ecrites).toEqual([]);
    expect(conflit).toHaveBeenCalledTimes(1);
    stop();
  });

  it('refuse un import qui modifierait le carnet sans référence prise à la confirmation', async () => {
    const storage = await import('../storage');
    const etat = storage.chargerEtat();
    donnees.set(CARNET, 'à conserver');
    expect(storage.restaurerEtatEtStats(etat, undefined, null)).toBe(false);
    expect(donnees.get(CARNET)).toBe('à conserver');
    expect(donnees.has(JOURNAL)).toBe(false);
    expect(ecrites).toEqual([]);
  });

  it('accepte les modifications successives de cet onglet sans faux conflit', async () => {
    const storage = await import('../storage');
    const stats = await import('../stats');
    const etat = storage.chargerEtat();
    const conflit = vi.fn();
    const stop = storage.surEtatPerime(conflit);
    const suivant = { ...etat, nom: 'écrit ici' };
    storage.sauvegarderEtat(suivant);
    stats.noterReponse('phase', true);
    storage.sauvegarderEtat({ ...suivant, nom: 'écrit encore ici' });
    expect(JSON.parse(donnees.get(ETAT)!).nom).toBe('écrit encore ici');
    expect(JSON.parse(donnees.get(STATS)!).justes).toBe(1);
    expect(storage.paquetExportComplet(suivant).stats.justes).toBe(1);
    expect(conflit).not.toHaveBeenCalled();
    stop();
  });

  it('n’écrit pas si la comparaison avec le stockage devient impossible', async () => {
    const storage = await import('../storage');
    const etat = storage.chargerEtat();
    refusLecture = STATS;
    storage.sauvegarderEtat({ ...etat, nom: 'ne pas écrire' });
    expect(donnees.get(ETAT)).toBe(initial);
    expect(ecrites).toEqual([]);
    expect(() => storage.paquetExportComplet(etat)).toThrow(storage.RestaurationEnAttente);
  });
});
