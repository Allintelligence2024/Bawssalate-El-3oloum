// Sauvegarde « complète » : aucun champ de progression ne doit disparaître à l'import.
//
// Constat du 2026-11-21 : `etatSchema` (zod) ne déclarait que 34 des 47 champs d'`Etat`.
// Un export puis un import effaçait donc silencieusement les cartes de leçon, les jeux de
// briques, les trophées, les pièges démasqués, les étapes du Bac pas à pas, les dérogations,
// les défis 60 s et le mode invité. Ces tests verrouillent la liste — et empêchent qu'un
// champ futur soit oublié de la même façon.
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import type { Etat } from '../../types';
import { etatDepuisFichier, lireSauvegarde } from '../backup';
import { etatDepuisBrut } from '../etat';
import { effacerAlerteStockage } from '../echecsStockage';
import { memoriserValeur, reinitialiserEtatPerime } from '../coherenceStockage';
import { paquetExportComplet, sauvegarderEtat, autoriserRemplacementEtat } from '../storage';
import { restaurerStats, viderStats } from '../stats';

let store: Record<string, string>;

beforeEach(() => {
  store = {};
  (globalThis as any).localStorage = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
  };
  reinitialiserEtatPerime();
  memoriserValeur('murajih_svt_v1', null);
  memoriserValeur('kunz_stats_v1', null);
  effacerAlerteStockage();
  autoriserRemplacementEtat();
  viderStats();
});

afterEach(() => { (globalThis as any).localStorage = undefined; });

const ISO = '2026-11-21T09:30:00.000Z';

/** Un état qui remplit les 10 champs auparavant perdus à l'import. */
function etatRempli(): Etat {
  const base = etatDepuisBrut({});
  return {
    ...base,
    modeInvite: true,
    invitationCompteVue: ISO,
    fakh: { 'fakh:u1:piege:0': true, 'fakh:u3:piege:2': true },
    fakhSeries: { 'serie:u1:1': true },
    bacEtapes: { '2022-1:2:1:1': 3, '2022-1:2:1:2': 0 },
    bacExercices: { '2022-1:2': true },
    cartesLecons: {
      lecon_transcription: {
        gagneeLe: ISO,
        points: ['الرامزة تُقرأ ثلاثًا', 'النسخ يبدأ من المروّج', 'الترجمة في الهيولى'],
        version: 1,
      },
    },
    briques: {
      'jb:u1:e1': {
        jeuId: 'jb:u1:e1',
        rolesChoisis: ['observation', 'comparaison'],
        manquants: ['conclusion'],
        complete: false,
        le: ISO,
        avant: 0,
        apres: 2,
      },
    },
    derogationsSujets: { '2025-1': ISO },
    trophees: { استنتج: { le: ISO, n: 3 } },
    defis60: [ISO],
    // Identité et consentement : exportés hors paquet, jamais importés.
    compte: {
      email: 'eleve@exemple.dz',
      motDePasse: 'a'.repeat(64),
      jeton: 'b'.repeat(32),
      wilaya: '31',
      daira: 'السانيا',
      creeLe: ISO,
    },
    consentementSync: true,
    consentementSyncDecideLe: ISO,
  };
}

describe('export → import d’une sauvegarde complète', () => {
  it('conserve les 10 champs de progression auparavant perdus par zod', () => {
    const etat = etatRempli();
    sauvegarderEtat(etat);
    const paquet = paquetExportComplet(etat);
    const relu = etatDepuisFichier(JSON.parse(JSON.stringify(paquet)));
    expect(relu).not.toBeNull();
    const revenu = relu as Etat;
    expect(revenu.modeInvite).toBe(true);
    expect(revenu.invitationCompteVue).toBe(ISO);
    expect(revenu.fakh).toEqual(etat.fakh);
    expect(revenu.fakhSeries).toEqual(etat.fakhSeries);
    expect(revenu.bacEtapes).toEqual(etat.bacEtapes);
    expect(revenu.bacExercices).toEqual(etat.bacExercices);
    expect(revenu.cartesLecons).toEqual(etat.cartesLecons);
    expect(revenu.briques).toEqual(etat.briques);
    expect(revenu.derogationsSujets).toEqual(etat.derogationsSujets);
    expect(revenu.trophees).toEqual(etat.trophees);
    expect(revenu.defis60).toEqual(etat.defis60);
  });

  it('n’importe jamais le compte ni le consentement (règle de sécurité inchangée)', () => {
    const etat = etatRempli();
    sauvegarderEtat(etat);
    const paquet = paquetExportComplet(etat);
    expect(paquet.etat.compte).toBeUndefined();
    const relu = etatDepuisFichier(JSON.parse(JSON.stringify(paquet))) as Etat;
    expect(relu.compte).toBeUndefined();
    expect(relu.consentementSync).toBe(false);
    expect(relu.consentementSyncDecideLe).toBeUndefined();
  });

  it('refuse une valeur hors du domaine connu au lieu de la deviner', () => {
    const base = etatDepuisBrut({});
    const invalide = { version: 3, progression: {}, bacEtapes: { '2022-1:2:1:1': 7 } };
    expect(lireSauvegarde({ ...base, ...invalide })).toBeNull();
  });
});

describe('garde structurelle : aucun champ d’Etat ne peut être oublié du schéma', () => {
  // Les seuls champs volontairement absents : l'identité et le consentement locaux.
  const EXCLUS_VOLONTAIRES = new Set([
    'compte', 'consentementSync', 'consentementSyncDecideLe',
  ]);

  it('chaque champ de progression de `interface Etat` est déclaré dans `etatSchema`', () => {
    const types = readFileSync('src/types.ts', 'utf8');
    const bloc = types.split('export interface Etat {')[1].split('\n}')[0];
    const champs = [...bloc.matchAll(/^\s{2}([a-zA-Z][a-zA-Z0-9]*)\??:/gm)].map((m) => m[1]);
    expect(champs.length).toBeGreaterThan(40);

    const backup = readFileSync('src/utils/backup.ts', 'utf8');
    const schema = backup.split('const etatSchema = z.object({')[1].split('const compteurs')[0];
    const oublies = champs
      .filter((c) => !EXCLUS_VOLONTAIRES.has(c))
      .filter((c) => !new RegExp(`\\b${c}\\??\\s*:`).test(schema));
    expect(oublies, `champs absents de etatSchema : ${oublies.join(', ')}`).toEqual([]);
  });
});
