// P2.2 objectif → quota, P2.3 mode intensif (verrous, prochain item, plan), SRS plafonnée
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Etat } from '../../types';
import {
  QUOTA_PAR_OBJECTIF,
  QUOTA_INTENSIF,
  quotaDe,
  bonusDispoAujourdhui,
  prochaineAction,
  prochainItem,
  itemVerrouille,
  modeIntensifActif,
  phaseIntensive,
  unitesPrioritaires,
  planIntensif,
  competenceDue,
  debutSemaine,
} from '../moteur';
import { mettreAJourSrs, PLAFOND_INTENSIF_JOURS, type Srs } from '../srs';
import { CHEMIN, UNITES, UNITE_PAR_ID, uniteDeItem } from '../../data/programme';
import { aujourdhui, ajouterJours } from '../dates';

function vierge(extra: Partial<Etat> = {}): Etat {
  return {
    version: 2, progression: {}, jalons: {}, notes: [], carnet: [], journal: [], minutesTotales: 0, revisions: 0,
    nom: 'x', dateBac: '2027-06-10', seancesComptees: 0, ateliers: {}, consentementSync: false, ...extra,
  };
}

describe('P2.2 — objectif de note → quota', () => {
  it('table objectif → quota : 10 = 1 séance sans bonus ; 14 = 1 + bonus ; 18 = 2 + bonus, 3 kafaa/sem', () => {
    expect(QUOTA_PAR_OBJECTIF[10]).toEqual({ seances: 1, bonus: false, kafaaSemaine: 2 });
    expect(QUOTA_PAR_OBJECTIF[14]).toEqual({ seances: 1, bonus: true, kafaaSemaine: 2 });
    expect(QUOTA_PAR_OBJECTIF[18]).toEqual({ seances: 2, bonus: true, kafaaSemaine: 3 });
  });

  it('sans objectif, le comportement historique est conservé (= 14)', () => {
    expect(quotaDe(vierge())).toEqual(QUOTA_PAR_OBJECTIF[14]);
  });

  it('transition de quota : objectif 18 → une 2e séance reste « nouvelle », pas « repos »', () => {
    const auj = aujourdhui();
    const apresUne = vierge({ seancesJour: auj, seancesComptees: 1 });
    expect(prochaineAction({ ...apresUne, objectif: 14 }).type).toBe('repos');
    expect(prochaineAction({ ...apresUne, objectif: 18 }).type).toBe('nouvelle');
    expect(prochaineAction({ ...apresUne, objectif: 18, seancesComptees: 2 }).type).toBe('repos');
  });

  it('objectif 10 : jamais de bonus proposé', () => {
    expect(bonusDispoAujourdhui(vierge({ objectif: 10 }))).toBe(false);
    expect(bonusDispoAujourdhui(vierge({ objectif: 14 }))).toBe(true);
  });

  it('objectif 18 : plafond kafaa 3/semaine au lieu de 2', () => {
    const carte = { verbe: 'v', exercice: 'e', erreur: 'r', repetitions: 1, intervalle: 1, facilite: 2.5, prochaineRevision: aujourdhui() };
    const base = vierge({ kafaa: { k1: carte }, kafaaHebdo: { debut: debutSemaine(aujourdhui()), n: 2 } });
    expect(competenceDue({ ...base, objectif: 14 })).toBeNull();
    expect(competenceDue({ ...base, objectif: 18 })?.key).toBe('k1');
  });
});

describe('P2.3 — mode intensif', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2027-04-26T09:00:00')); // J-45 avant le 10 juin 2027
  });
  afterEach(() => vi.useRealTimers());

  it("s'active automatiquement à J-45, pas à J-206, et respecte on/off", () => {
    expect(modeIntensifActif(vierge())).toBe(true);
    expect(modeIntensifActif(vierge({ modeIntensif: 'off' }))).toBe(false);
    vi.setSystemTime(new Date('2026-11-16T09:00:00'));
    expect(modeIntensifActif(vierge())).toBe(false);
    expect(modeIntensifActif(vierge({ modeIntensif: 'on' }))).toBe(true);
  });

  it('phases : J60 → poidsBac ≥ 4 ; J30 → ≥ 3 ; J7', () => {
    expect(phaseIntensive(vierge())).toBe('J60');
    const u60 = unitesPrioritaires(vierge());
    expect(u60.every((id) => UNITE_PAR_ID[id].poidsBac >= 4)).toBe(true);
    expect(u60).toEqual(UNITES.filter((u) => u.poidsBac >= 4).map((u) => u.id));
    vi.setSystemTime(new Date('2027-05-20T09:00:00')); // J-21
    expect(phaseIntensive(vierge())).toBe('J30');
    expect(unitesPrioritaires(vierge()).length).toBeGreaterThan(u60.length);
    vi.setSystemTime(new Date('2027-06-05T09:00:00')); // J-5
    expect(phaseIntensive(vierge())).toBe('J7');
  });

  it("scénario « élève qui installe à J-45 » : aucune leçon prioritaire n'est verrouillée derrière les unités précédentes", () => {
    const etat = vierge();
    const prioritaires = CHEMIN.filter((c) => unitesPrioritaires(etat).includes(uniteDeItem(c)!.id));
    // la première leçon de chaque unité prioritaire est ouverte immédiatement
    for (const uId of unitesPrioritaires(etat)) {
      const premiere = prioritaires.find((c) => uniteDeItem(c)!.id === uId)!;
      expect(itemVerrouille(etat, premiere), `unité ${uId} devrait être ouverte`).toBe(false);
    }
    // mais l'ordre interne de l'unité est conservé : la 2e leçon attend la 1re
    const u = UNITE_PAR_ID[unitesPrioritaires(etat)[0]];
    expect(itemVerrouille(etat, { type: 'lecon', id: u.lessonIds[1] })).toBe(true);
    // et une unité non prioritaire reste verrouillée normalement
    const nonPrio = UNITES.find((x) => !unitesPrioritaires(etat).includes(x.id) && x.numero > 1)!;
    expect(itemVerrouille(etat, { type: 'lecon', id: nonPrio.lessonIds[0] })).toBe(true);
  });

  it('prochainItem vise la première leçon prioritaire non faite ; quota intensif = 3 ; plan hebdomadaire calculé', () => {
    const etat = vierge();
    const item = prochainItem(etat)!;
    expect(unitesPrioritaires(etat)).toContain(uniteDeItem(item)!.id);
    expect(quotaDe(etat)).toEqual(QUOTA_INTENSIF);
    const plan = planIntensif(etat)!;
    expect(plan.phase).toBe('J60');
    expect(plan.joursRestants).toBe(45);
    expect(plan.restants).toBe(CHEMIN.filter((c) => plan.unites.includes(uniteDeItem(c)!.id)).length);
    expect(plan.parSemaine).toBe(Math.min(21, Math.ceil(plan.restants / 7)));
  });

  it('hors mode intensif, le chemin reste strictement séquentiel (garantie anti-lacunes)', () => {
    const etat = vierge({ modeIntensif: 'off' });
    expect(prochainItem(etat)).toEqual(CHEMIN[0]);
    expect(itemVerrouille(etat, CHEMIN[1])).toBe(true);
  });

  it('SRS plafonnée : avec le plafond, jamais plus de J+3 ; sans plafond, SM-2 inchangée', () => {
    const p: Srs = { repetitions: 2, intervalle: 3, facilite: 2.5 };
    const libre = mettreAJourSrs(p, 5);
    expect(libre.intervalle).toBe(8); // round(3 × 2.5)
    const borne = mettreAJourSrs(p, 5, PLAFOND_INTENSIF_JOURS);
    expect(borne.intervalle).toBe(3);
    expect(borne.prochaineRevision).toBe(ajouterJours(aujourdhui(), 3));
    expect(borne.facilite).toBe(libre.facilite); // la facilité continue d'évoluer : on borne la date, pas l'apprentissage
  });
});
