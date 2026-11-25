import { describe, expect, it } from 'vitest';
import { SUJETS_OFFICIELS } from '../../data/sujetsOfficiels';
import {
  SUJET_PILOTE,
  accesSujet,
  couvertureSujet,
  estSujetPilote,
  sujetParId,
  tracerDerogation,
} from '../accesSujets';
import { construireGrille, cleConsigne, estEntrainable } from '../entrainement';
import { etatVierge, type Etat } from '../../types';

const LE = '2026-11-21T10:00:00.000Z';

describe('accès aux 30 sujets — recommandation, jamais de verrou', () => {
  it('aucun sujet du dépôt n’est verrouillé, quel que soit l’état', () => {
    const etats: Etat[] = [etatVierge()];
    for (const s of SUJETS_OFFICIELS) {
      for (const etat of etats) {
        const acces = accesSujet(etat, s.id);
        expect(acces.libre).toBe(true);
      }
    }
  });

  it('un état vierge conseille mais laisse passer, pour chaque sujet entraînable', () => {
    const etat = etatVierge();
    for (const s of SUJETS_OFFICIELS.filter((x) => estEntrainable(x.id))) {
      const acces = accesSujet(etat, s.id);
      expect(acces.libre).toBe(true);
      expect(acces.recommandation).toBeTruthy();
      expect(acces.recommandation).toContain('رغم ذلك');
      expect(acces.couverture).toBe(0);
    }
  });

  it('un id inconnu reste libre (aucune impasse)', () => {
    const acces = accesSujet(etatVierge(), 'sujet-inexistant');
    expect(acces.libre).toBe(true);
    expect(acces.couverture).toBe(0);
    expect(sujetParId('sujet-inexistant')).toBeUndefined();
  });
});

describe('couverture : ce qui a été évalué, sur ce qui est entraînable', () => {
  it('0 % sans aucune auto-évaluation, et 0 % pour un sujet non entraînable', () => {
    const etat = etatVierge();
    for (const s of SUJETS_OFFICIELS) {
      expect(couvertureSujet(etat, s)).toBeGreaterThanOrEqual(0);
      if (!estEntrainable(s.id)) expect(couvertureSujet(etat, s)).toBe(0);
    }
  });

  it('évaluer toutes les consignes met la couverture à 100 et retire la recommandation', () => {
    const sujet = SUJETS_OFFICIELS.find((s) => estEntrainable(s.id))!;
    const grille = construireGrille(sujet);
    const maitrise: Record<string, 0 | 1 | 2> = {};
    for (const c of grille.consignes) maitrise[cleConsigne(c)] = 2;
    const etat: Etat = { ...etatVierge(), maitriseSujets: { [sujet.id]: maitrise } };
    expect(couvertureSujet(etat, sujet)).toBe(100);
    const acces = accesSujet(etat, sujet.id);
    expect(acces.recommandation).toBeUndefined();
    expect(acces.libre).toBe(true);
  });
});

describe('« متابعة رغم ذلك » : tracé une fois, jamais reproché', () => {
  it('le tracé est idempotent : la première date est conservée', () => {
    const sujet = SUJETS_OFFICIELS.find((s) => estEntrainable(s.id))!;
    const une = tracerDerogation(etatVierge(), sujet.id, LE);
    expect(une.derogationsSujets?.[sujet.id]).toBe(LE);
    const deux = tracerDerogation(une, sujet.id, '2027-01-01T00:00:00.000Z');
    expect(deux).toBe(une);
    expect(deux.derogationsSujets?.[sujet.id]).toBe(LE);
  });

  it('après le tracé, la recommandation disparaît mais le sujet reste ouvert', () => {
    const sujet = SUJETS_OFFICIELS.find((s) => estEntrainable(s.id))!;
    const etat = tracerDerogation(etatVierge(), sujet.id, LE);
    const acces = accesSujet(etat, sujet.id);
    expect(acces.libre).toBe(true);
    expect(acces.recommandation).toBeUndefined();
    expect(acces.dejaPasseOutre).toBe(true);
    expect(acces.passeOutre).toBe(true);
  });

  it('la trace ne stocke qu’une date ISO, aucun jugement', () => {
    const sujet = SUJETS_OFFICIELS[0];
    const etat = tracerDerogation(etatVierge(), sujet.id, LE);
    expect(JSON.stringify(etat.derogationsSujets)).toBe(JSON.stringify({ [sujet.id]: LE }));
  });
});

describe('sujet pilote du mode guidé', () => {
  it('le gabarit 1-2-3 est celui de 2025-1, et il existe dans le dépôt', () => {
    expect(SUJET_PILOTE).toBe('2025-1');
    expect(estSujetPilote('2025-1')).toBe(true);
    expect(estSujetPilote('2024-1')).toBe(false);
    expect(sujetParId(SUJET_PILOTE)).toBeTruthy();
  });
});
