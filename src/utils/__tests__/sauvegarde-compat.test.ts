// P0.3 — matrice de compatibilité et tests de panne de la sauvegarde (données fictives).
// Clôture : compatibilité plats/enveloppés v1-v3, versions inconnues, écriture partielle
// état/statistiques, JSON corrompu, quota, « redémarrage » après restauration, et textes
// d'assistance conformes au comportement réel.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import type { Etat } from '../../types';
import { etatDepuisFichier, lireSauvegarde } from '../backup';
import { noterReponse, statsActuelles, restaurerStats, viderStats, type StatsReponses } from '../stats';
import { effacerAlerteStockage, surEchecSauvegarde } from '../echecsStockage';
import { memoriserValeur, reinitialiserEtatPerime } from '../coherenceStockage';
import {
  chargerEtat, sauvegarderEtat, paquetExportComplet, EtatIllisible, fusionnerProgressionImportee, autoriserRemplacementEtat,
} from '../storage';

// localStorage multi-clés avec clés dont l'écriture peut être bloquée (quota simulé).
let store: Record<string, string>;
let clesBloquees: Set<string>;
beforeEach(() => {
  store = {};
  clesBloquees = new Set();
  (globalThis as any).localStorage = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => {
      if (clesBloquees.has(k)) throw new Error('QuotaExceededError');
      store[k] = v;
    },
    removeItem: (k: string) => { delete store[k]; },
  };
  // Nouveau navigateur fictif : ne pas conserver les références du test précédent.
  reinitialiserEtatPerime();
  memoriserValeur('murajih_svt_v1', null);
  memoriserValeur('kunz_stats_v1', null);
  effacerAlerteStockage();
  autoriserRemplacementEtat();
  viderStats(); // remet à zéro le singleton en mémoire + son état de lecture
});
afterEach(() => { (globalThis as any).localStorage = undefined; });

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

describe('P0.3 — matrice de compatibilité des fichiers', () => {
  it('accepte 5 000 entrées et rejette la suivante avant de lire les valeurs', () => {
    const drills: Record<string, true> = Object.fromEntries(Array.from({ length: 5000 }, (_, i) => [`d${i}`, true as const]));
    const fichier = { version: 3, progression: {}, drills };
    expect(Object.keys(lireSauvegarde(fichier)?.etat.drills ?? {})).toHaveLength(5000);
    const lireValeur = vi.fn(() => true);
    Object.defineProperty(drills, 'd0', { enumerable: true, get: lireValeur });
    drills.supplementaire = true;
    expect(lireSauvegarde(fichier)).toBeNull();
    expect(lireValeur).not.toHaveBeenCalled();
  });

  it('rejette les listes hors limites avant de lire le premier élément', () => {
    const journal = Array<string>(5001).fill('2026-11-19');
    const lireJour = vi.fn(() => '2026-11-19');
    Object.defineProperty(journal, '0', { get: lireJour });
    expect(lireSauvegarde({ progression: {}, journal })).toBeNull();
    expect(lireJour).not.toHaveBeenCalled();
    expect(lireSauvegarde({ progression: {}, journal: Array<string>(5000).fill('2026-11-19') })?.etat.journal).toHaveLength(5000);
  });

  it('enveloppe v1, v2, v3 acceptées', () => {
    for (const version of [1, 2, 3]) {
      const lu = etatDepuisFichier({ application: 'أ', version, exporteLe: '2026-11-17', etat: { progression: {} } });
      expect(lu, `enveloppe v${version}`).not.toBeNull();
    }
  });

  it('format plat (progression à la racine) v1, v2, v3 accepté', () => {
    for (const version of [1, 2, 3]) {
      expect(etatDepuisFichier({ progression: {}, version }), `plat v${version}`).not.toBeNull();
    }
  });

  it('versions inconnues refusées sur l\'enveloppe ET sur l\'état (0, 4, 999, « 3 » texte, null)', () => {
    for (const version of [0, 4, 999, '3', null]) {
      expect(etatDepuisFichier({ version, etat: { progression: {} } }), `env ${String(version)}`).toBeNull();
      expect(etatDepuisFichier({ progression: {}, version }), `plat ${String(version)}`).toBeNull();
    }
  });

  it('ancien fichier sans statistiques → les statistiques actuelles sont conservées (branche App `if (stats)`)', () => {
    noterReponse('phase', true);
    noterReponse('exercice', false);
    const avant = statsActuelles();
    const lu = lireSauvegarde({ progression: {}, version: 1 });
    expect(lu?.stats).toBeUndefined();
    if (lu?.stats) restaurerStats(lu.stats); // exactement la condition de App.tsx:527
    expect(statsActuelles()).toEqual(avant);
  });

  it('statistiques invalides dans le fichier → refusé entièrement, rien n\'est restauré', () => {
    const avant = statsActuelles();
    expect(etatDepuisFichier({ progression: {}, stats: { justes: -1 } })).toBeNull();
    expect(statsActuelles()).toEqual(avant);
  });

  it('respecte les bornes de collections après la mise à jour du validateur', () => {
    const note = { id: 'n', kind: 'note', texte: 'texte', ts: '2026-01-01' };
    expect(lireSauvegarde({ version: 3, etat: { progression: {}, notes: Array(5000).fill(note) } })).not.toBeNull();
    expect(lireSauvegarde({ version: 3, etat: { progression: {}, notes: Array(5001).fill(note) } })).toBeNull();
    const progression = Object.fromEntries(Array.from({ length: 5001 }, (_, i) => [`l${i}`, {
      statut: 'vierge', phases: [], minutes: 0, repetitions: 0, intervalle: 0, facilite: 2.5,
    }]));
    expect(lireSauvegarde({ version: 3, etat: { progression } })).toBeNull();
  });
});

describe('P0.3 — tests de panne (quota, JSON corrompu, écriture partielle)', () => {
  it('quota plein sur l\'état : alerte + ancien contenu intact (rien de corrompu)', () => {
    const ancien = JSON.stringify(etatMinimal());
    store['murajih_svt_v1'] = ancien;
    chargerEtat(); // le quota est testé après lecture de cette valeur
    clesBloquees.add('murajih_svt_v1');
    const alerte = vi.fn();
    const stop = surEchecSauvegarde(alerte);
    sauvegarderEtat({ ...etatMinimal(), minutesTotales: 999 });
    expect(alerte).toHaveBeenCalled();
    expect(store['murajih_svt_v1']).toBe(ancien); // l'ancien état reste valide sur le disque
    stop();
  });

  it('JSON local corrompu : refuse un export complet trompeur sans écraser l\'original', () => {
    store['murajih_svt_v1'] = '{JSON cassé';
    const etat = chargerEtat(); // vierge temporaire + protection active
    expect(etat.progression).toEqual({});
    expect(() => paquetExportComplet(etat)).toThrow(EtatIllisible);
    expect(store['murajih_svt_v1']).toBe('{JSON cassé');
    sauvegarderEtat(etat); // toujours protégé
    expect(store['murajih_svt_v1']).toBe('{JSON cassé');
    autoriserRemplacementEtat(); // remplacement explicite
    sauvegarderEtat(etat);
    expect(JSON.parse(store['murajih_svt_v1']).progression).toEqual({});
  });

  it('écriture partielle A : les statistiques échouent, l\'état réussit — alerte, divergence visible, pas de corruption', () => {
    clesBloquees.add('kunz_stats_v1');
    const alerte = vi.fn();
    const stop = surEchecSauvegarde(alerte);
    restaurerStats(statsValides());
    expect(alerte).toHaveBeenCalled(); // l'échec n'est jamais silencieux
    expect(store['kunz_stats_v1']).toBeUndefined(); // disque : anciennes stats absentes
    expect(statsActuelles().justes).toBe(5); // mémoire : nouvelles (restauration en mémoire réussie)
    sauvegarderEtat({ ...etatMinimal(), minutesTotales: 11 });
    expect(JSON.parse(store['murajih_svt_v1']).minutesTotales).toBe(11); // l'état s'écrit malgré l'échec des stats
    stop();
    // « Nouvelle session » : état relu depuis le disque (écrit), stats relues depuis le disque
    // (absentes → vierges) : la divergence est visible et signalée, jamais un JSON cassé.
    expect(chargerEtat().minutesTotales).toBe(11);
  });

  it('écriture partielle B : l\'état échoue, les statistiques réussissent — l\'ancien état reste valide', () => {
    const ancien = JSON.stringify(etatMinimal());
    store['murajih_svt_v1'] = ancien;
    chargerEtat();
    clesBloquees.add('murajih_svt_v1');
    const alerte = vi.fn();
    const stop = surEchecSauvegarde(alerte);
    sauvegarderEtat({ ...etatMinimal(), minutesTotales: 4242 });
    expect(alerte).toHaveBeenCalled();
    expect(store['murajih_svt_v1']).toBe(ancien); // l'ancien état n'est ni écrasé ni corrompu
    restaurerStats(statsValides());
    expect(store['kunz_stats_v1']).toBeDefined(); // les stats s'écrivent indépendamment
    expect(chargerEtat().minutesTotales).toBe(0); // relecture : ancien état valide
    stop();
  });

  it('restauration puis redémarrage : l\'état importé est relu à l\'identique, identité locale conservée', () => {
    const original: Etat = {
      ...etatMinimal(),
      progression: {
        'd1-u1-l1-expression-genique': { statut: 'terminee', phases: [1, 2, 3], minutes: 12, repetitions: 1, intervalle: 3, facilite: 2.6 },
      },
      minutesTotales: 12, nom: 'تلميذ',
    };
    const importe = etatDepuisFichier(JSON.parse(JSON.stringify(paquetExportComplet(original))));
    expect(importe).not.toBeNull();
    // « Nouvelle session » : état vierge lu au démarrage, puis fusion + écriture + relecture.
    const courant = chargerEtat();
    expect(courant.progression).toEqual({});
    const fusionne = fusionnerProgressionImportee(courant, importe!);
    autoriserRemplacementEtat();
    sauvegarderEtat(fusionne);
    const relu = chargerEtat(); // « redémarrage »
    expect(relu.progression).toEqual(original.progression);
    expect(relu.nom).toBe('تلميذ');
    expect(relu.consentementSync).toBe(false); // import : jamais de consentement du fichier
    expect(relu.compte).toBeUndefined();
  });

  it('parcours d\'assistance : les textes annoncent les vraies limites (Inscription, Ana)', () => {
    const inscription = readFileSync('src/components/Inscription.tsx', 'utf8');
    // Suppression du compte local : ni effacement serveur, ni récupération de jeton.
    expect(inscription).toContain('لا يحذف هذا بيانات الخادم ولا يستعيد رمزها');
    const ana = readFileSync('src/components/Ana.tsx', 'utf8');
    expect(ana).toContain('الملف أكبر من ٥ ميغابايت'); // limite 5 Mio annoncée avant lecture
    expect(ana).toContain('هذا الملف ليس نسخة احتياطية'); // fichier non validé
    expect(ana).toContain('لم أستطع قراءة الملف'); // JSON illisible
    expect(ana).toContain('النسخ القديمة لا تحتوي على الإحصاءات'); // anciens formats sans stats
    expect(ana).toContain('أُلغي أو تعذّر المشاركة'); // partage annulé (Android)
  });
});
