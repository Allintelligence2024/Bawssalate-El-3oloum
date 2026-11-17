// Tests du moteur (Next Best Action) — P0.4
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Etat } from '../../types';
import {
  itemFait,
  itemVerrouille,
  prochainItem,
  itemsFaits,
  leconEnCours,
  revisionsDues,
  seancesAujourdhui,
  bonusDispoAujourdhui,
  enregistrerSeance,
  enregistrerActivite,
  competenceDue,
  debutSemaine,
} from '../moteur';

// Etat de base avec 2 leçons finies et 1 en cours
function etatBase() {
  const etat: Etat = {
    version: 2,
    progression: {
      'd1-u1-l1-expression-genique': { statut: 'terminee', phases: [1, 2, 3], minutes: 12, repetitions: 1, intervalle: 1, facilite: 2.5 },
      'phase1_chapitres_1_2': { statut: 'terminee', phases: [1, 2], minutes: 8, repetitions: 0, intervalle: 1, facilite: 2.5 },
      'lecon_transcription': { statut: 'en_cours', phases: [1], minutes: 5, repetitions: 0, intervalle: 1, facilite: 2.5 },
    },
    jalons: {},
    notes: [],
    carnet: [],
    journal: [],
    minutesTotales: 25,
    revisions: 0,
    nom: 'تلميذ',
    dateBac: '2027-06-10',
    seancesComptees: 0,
    ateliers: {},
    consentementSync: false,
  };
  return etat;
}

// Horloge fixée : ces tests raisonnent sur « aujourd'hui = 16/11/2026 » (dates en dur ci-dessous).
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-16T09:00:00'));
});
afterEach(() => vi.useRealTimers());

describe('moteur — itemFait', () => {
  it('reporte une leçon terminee', () => {
    const etat = etatBase();
    expect(itemFait(etat, { type: 'lecon', id: 'd1-u1-l1-expression-genique' })).toBe(true);
    expect(itemFait(etat, { type: 'lecon', id: 'phase1_chapitres_1_2' })).toBe(true);
    expect(itemFait(etat, { type: 'lecon', id: 'lecon_transcription' })).toBe(false);
  });

  it('reporte un jalon fait', () => {
    const etat = etatBase();
    etat.jalons = { u1: { fait: true } };
    expect(itemFait(etat, { type: 'jalon', uniteId: 'u1' })).toBe(true);
    expect(itemFait(etat, { type: 'jalon', uniteId: 'u2' })).toBe(false);
  });
});

describe('moteur — verrouillage', () => {
  it('verrouille les leçons non parcourues', () => {
    const etat = etatBase();
    // l1 finie, l2 finie, l3 en cours → l3 doit être rouverte, l4 verrouillée
    const l3 = { type: 'lecon' as const, id: 'lecon_transcription' };
    const l4 = { type: 'lecon' as const, id: 'phase1_chapitres_1_2_2' };
    expect(itemVerrouille(etat, l3)).toBe(false); // en cours → ouverte
    expect(itemVerrouille(etat, l4)).toBe(true); // non faite et précédente non finie
  });
});

describe('moteur — prochainItem', () => {
  it('renvoie la première leçon non faite', () => {
    const etat = etatBase();
    const p = prochainItem(etat);
    // lecon_transcription est la première non terminée (l1, l2 finies)
    expect(p?.type).toBe('lecon');
    if (p && p.type === 'lecon') {
      expect(p.id).toBe('lecon_transcription');
    }
  });
});

describe('moteur — sessions', () => {
  it('compte les séances du jour', () => {
    const etat = etatBase();
    etat.seancesJour = '2026-11-16';
    etat.seancesComptees = 2;
    expect(seancesAujourdhui(etat)).toBe(2);
  });

  it('bonus disponible si pas encore utilisé aujourd\'hui', () => {
    const etat = etatBase();
    etat.bonusJour = '2026-11-15'; // utilisé hier
    expect(bonusDispoAujourdhui(etat)).toBe(true);
  });

  it('enregistrerSeance ajoute une séance et le jour', () => {
    const etat = etatBase();
    etat.seancesJour = '2026-11-16';
    etat.seancesComptees = 1;
    const next = enregistrerSeance(etat);
    expect(next.seancesComptees).toBe(2);
    expect(next.journal.length).toBe(1); // nouveau jour → ajout
  });
});

describe('moteur — debutSemaine (calendrier algérien: sam → dim)', () => {
  it('retourne le dimanche qui commence la semaine', () => {
    // si aujourd'hui est mercredi (getDay() = 3), la semaine commence un dimanche avant
    const wed = '2026-11-18';
    const dim = debutSemaine(wed);
    expect(dim).toBe('2026-11-15');
  });
});
