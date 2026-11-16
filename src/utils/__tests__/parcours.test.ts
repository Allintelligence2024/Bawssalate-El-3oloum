// P2.2 objectif → quota, P2.3 mode intensif (verrous, prochain item, plan), SRS plafonnée
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Etat, ProgressionLecon } from '../../types';
import { prioriteLecon } from '../../data/priorites';
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
  itemPrioritaire,
  leconPrioritaire,
  revisionsDues,
  leconsAcquisesIntensif,
  sujetCetteSemaine,
} from '../moteur';
import { mettreAJourSrs, mettreAJourSrsIntensif, PLAFOND_INTENSIF_JOURS, type Srs } from '../srs';
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

  it('phases : J60 → leçons de priorité 1 ; J30 → 1 et 2 ; J7 (priorités P1.7 issues des sujets)', () => {
    expect(phaseIntensive(vierge())).toBe('J60');
    const u60 = unitesPrioritaires(vierge());
    expect(u60.every((id) => UNITE_PAR_ID[id].lessonIds.some((l) => prioriteLecon(l) === 1))).toBe(true);
    expect(u60).toEqual(UNITES.filter((u) => u.lessonIds.some((l) => prioriteLecon(l) === 1)).map((u) => u.id));
    // une leçon de priorité 2 n'est pas dans la phase J60, une de priorité 1 l'est
    const p1 = CHEMIN.find((c) => c.type === 'lecon' && prioriteLecon(c.id) === 1)!;
    const p2 = CHEMIN.find((c) => c.type === 'lecon' && prioriteLecon(c.id) === 2)!;
    expect(itemPrioritaire(vierge(), p1)).toBe(true);
    expect(itemPrioritaire(vierge(), p2)).toBe(false);
    vi.setSystemTime(new Date('2027-05-20T09:00:00')); // J-21
    expect(phaseIntensive(vierge())).toBe('J30');
    expect(unitesPrioritaires(vierge()).length).toBeGreaterThan(u60.length);
    expect(itemPrioritaire(vierge(), p2)).toBe(true);
    // la priorité 3 (enrichissement / prérequis) ne rentre jamais dans le plan intensif
    const p3 = CHEMIN.find((c) => c.type === 'lecon' && prioriteLecon(c.id) === 3)!;
    expect(itemPrioritaire(vierge(), p3)).toBe(false);
    vi.setSystemTime(new Date('2027-06-05T09:00:00')); // J-5
    expect(phaseIntensive(vierge())).toBe('J7');
    expect(itemPrioritaire(vierge(), p3)).toBe(false);
  });

  it('priorités P1.7 : toutes les leçons du chemin couvertes, trois niveaux présents, u8 et prérequis à 3', () => {
    const lecons = CHEMIN.filter((c) => c.type === 'lecon') as { type: 'lecon'; id: string }[];
    expect(lecons.every((c) => [1, 2, 3].includes(prioriteLecon(c.id)))).toBe(true);
    expect(new Set(lecons.map((c) => prioriteLecon(c.id))).size).toBe(3);
    for (const id of UNITE_PAR_ID.u8.lessonIds) expect(prioriteLecon(id)).toBe(3);
    expect(prioriteLecon('prerequis2AS_genetique')).toBe(3);
    expect(prioriteLecon('enzyme_inhibitors')).toBe(3);
  });

  it("scénario « élève qui installe à J-45 » : aucune leçon prioritaire n'est verrouillée derrière les unités précédentes", () => {
    const etat = vierge();
    const prioritaires = CHEMIN.filter((c) => itemPrioritaire(etat, c));
    // le premier item prioritaire de chaque unité prioritaire est ouvert immédiatement
    for (const uId of unitesPrioritaires(etat)) {
      const premiere = prioritaires.find((c) => uniteDeItem(c)!.id === uId)!;
      expect(itemVerrouille(etat, premiere), `unité ${uId} devrait être ouverte`).toBe(false);
    }
    // mais l'ordre interne des leçons prioritaires de l'unité est conservé : la 2e attend la 1re
    const u = UNITE_PAR_ID[unitesPrioritaires(etat)[0]];
    const [l1, l2] = u.lessonIds.filter((id) => leconPrioritaire(etat, id));
    expect(itemVerrouille(etat, { type: 'lecon', id: l2 })).toBe(true);
    expect(itemVerrouille(etat, { type: 'lecon', id: l1 })).toBe(false);
    // et une leçon non prioritaire reste verrouillée normalement (derrière tout ce qui précède)
    const nonPrio = CHEMIN.find((c) => c.type === 'lecon' && !itemPrioritaire(etat, c) && c !== CHEMIN[0])!;
    expect(itemVerrouille(etat, nonPrio)).toBe(true);
  });

  it('prochainItem vise la première leçon prioritaire non faite ; quota intensif = 3 ; plan hebdomadaire calculé', () => {
    const etat = vierge();
    const item = prochainItem(etat)!;
    expect(unitesPrioritaires(etat)).toContain(uniteDeItem(item)!.id);
    expect(quotaDe(etat)).toEqual(QUOTA_INTENSIF);
    const plan = planIntensif(etat)!;
    expect(plan.phase).toBe('J60');
    expect(plan.joursRestants).toBe(45);
    expect(plan.restants).toBe(CHEMIN.filter((c) => itemPrioritaire(etat, c)).length);
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

  it('SRS intensive : J+1 sur erreur, J+3 au 1er succès, sortie du rappel au 2e succès consécutif ; une erreur remet le compteur à 0', () => {
    const p0: ProgressionLecon = { statut: 'terminee', phases: [1, 2, 3, 4, 5, 6], minutes: 40, repetitions: 0, intervalle: 1, facilite: 2.5 };
    const p1 = mettreAJourSrsIntensif(p0, 5);
    expect(p1.reussitesIntensif).toBe(1);
    expect(p1.prochaineRevision).toBe(ajouterJours(aujourdhui(), 1)); // SM-2 : 1re répétition = J+1
    const p2 = mettreAJourSrsIntensif(p1, 5);
    expect(p2.reussitesIntensif).toBe(2);
    expect(p2.prochaineRevision).toBeUndefined(); // sortie : plus de rappel jusqu'au Bac
    expect(p2.acquisIntensifLe).toBe(aujourdhui());
    expect(revisionsDues(vierge({ progression: { x: p2 } }))).toEqual([]);
    expect(leconsAcquisesIntensif(vierge({ progression: { x: p2 } }))).toEqual(['x']);
    // une erreur après un succès : retour à J+1 et compteur à zéro
    const e = mettreAJourSrsIntensif(p1, 1);
    expect(e.reussitesIntensif).toBe(0);
    expect(e.acquisIntensifLe).toBeUndefined();
    expect(e.prochaineRevision).toBe(ajouterJours(aujourdhui(), 1));
    expect(e.fragile).toBe(true);
  });

  it('suivi « 1 sujet/semaine » : vrai seulement si un examen blanc a été terminé dans les 7 derniers jours', () => {
    expect(sujetCetteSemaine(vierge())).toBe(false);
    expect(sujetCetteSemaine(vierge({ examensBlancs: [new Date().toISOString()] }))).toBe(true);
    expect(sujetCetteSemaine(vierge({ examensBlancs: [ajouterJours(aujourdhui(), -6) + 'T10:00:00.000Z'] }))).toBe(true);
    expect(sujetCetteSemaine(vierge({ examensBlancs: [ajouterJours(aujourdhui(), -7) + 'T10:00:00.000Z'] }))).toBe(false);
    const plan = planIntensif(vierge({ examensBlancs: [new Date().toISOString()] }))!;
    expect(plan.sujetFait).toBe(true);
    expect(plan.acquises).toBe(0);
  });
});
