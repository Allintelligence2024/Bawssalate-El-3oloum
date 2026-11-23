// Entraîneur Bac (§10.3) — le parcours doit être vérifiable, pas décoratif.
import { describe, it, expect } from 'vitest';
import {
  construireGrille, calculerResultat, cleConsigne, estEntrainable,
  statutQualitatif, priorites, type NiveauMaitrise,
} from '../entrainement';
import { SUJETS_OFFICIELS } from '../../data/sujetsOfficiels';
import { corrigeDe } from '../../data/sujetsCorriges';

const sujet = SUJETS_OFFICIELS.find((s) => s.id === '2023-1')!;

describe('entraîneur Bac — construction de la grille', () => {
  it('un sujet sans corrigé n’est pas entraînable', () => {
    expect(estEntrainable('1999-1')).toBe(false);
    expect(estEntrainable('2023-1')).toBe(true);
  });

  it('chaque consigne du sujet devient une ligne de grille', () => {
    const grille = construireGrille(sujet);
    const attendues = sujet.exercices.reduce(
      (s, e) => s + e.parties.reduce((t, p) => t + p.consignes.length, 0), 0,
    );
    expect(grille.consignes).toHaveLength(attendues);
    expect(grille.sujetId).toBe('2023-1');
  });

  it('les points de chaque consigne viennent du corrigé, pas d’un partage égal', () => {
    const grille = construireGrille(sujet);
    const corrige = corrigeDe('2023-1')!;
    for (const c of grille.consignes) {
      const ex = corrige.exercices.find((e) => e.numero === c.exercice)!;
      const rep = ex.parties[c.partie]?.reponses.find((r) => r.consigne === c.consigne);
      expect(c.points, `e${c.exercice}p${c.partie}c${c.consigne}`).toBe(rep?.points ?? null);
    }
    // Le barème n'est pas un partage égal : les points sont hétérogènes (0,5 à 4).
    // Si ce test casse, c'est que la lecture du barème a changé de nature.
    const distincts = new Set(grille.consignes.map((c) => c.points));
    expect(distincts.size).toBeGreaterThan(2);
    expect(Math.max(...grille.consignes.map((c) => c.points ?? 0))).toBeGreaterThan(1);
  });

  it('le barème total suit les corrections officielles (baremeCorrige)', () => {
    const grille = construireGrille(sujet);
    const corrige = corrigeDe('2023-1')!;
    const attendu = sujet.exercices.reduce((s, e) => {
      const ex = corrige.exercices.find((x) => x.numero === e.numero);
      return s + (ex?.baremeCorrige ?? e.bareme);
    }, 0);
    expect(grille.baremeTotal).toBe(attendu);
  });

  it('aucune consigne n’invente de critère : sans attendu, aucun point n’est promis', () => {
    const grille = construireGrille(sujet);
    // 2023-1 est entièrement corrigé : aucun critère ne doit manquer.
    expect(grille.consignes.every((c) => c.attendu.length > 0)).toBe(true);
    // Et la règle inverse doit tenir sur un sujet non corrigé.
    const orphelin = { ...sujet, id: '1999-1' };
    const g2 = construireGrille(orphelin);
    expect(g2.consignes.every((c) => c.points === null && c.attendu.length === 0)).toBe(true);
  });
});

describe('entraîneur Bac — résultat et garde-fous', () => {
  const grille = construireGrille(sujet);
  const toutParfait = Object.fromEntries(grille.consignes.map((c) => [cleConsigne(c), 2 as NiveauMaitrise]));
  const toutNul = Object.fromEntries(grille.consignes.map((c) => [cleConsigne(c), 0 as NiveauMaitrise]));

  it('2 partout donne le barème complet et 100 de maîtrise', () => {
    const r = calculerResultat(grille, toutParfait);
    expect(r.pointsObtenus).toBe(grille.baremeTotal);
    expect(r.maitrise).toBe(100);
  });

  it('0 partout donne 0 point et 0 de maîtrise', () => {
    const r = calculerResultat(grille, toutNul);
    expect(r.pointsObtenus).toBe(0);
    expect(r.maitrise).toBe(0);
  });

  it('1 partout donne exactement la moitié', () => {
    const moitie = Object.fromEntries(grille.consignes.map((c) => [cleConsigne(c), 1 as NiveauMaitrise]));
    const r = calculerResultat(grille, moitie);
    expect(r.pointsObtenus).toBeCloseTo(grille.baremeTotal / 2, 1);
    expect(r.maitrise).toBe(50);
  });

  it('une consigne non évaluée ne compte pas comme un échec', () => {
    const partiel = { [cleConsigne(grille.consignes[0])]: 2 as NiveauMaitrise };
    const r = calculerResultat(grille, partiel);
    expect(r.pointsObtenus).toBeGreaterThan(0);
    expect(r.maitrise).toBe(100); // seule la consigne évaluée compte
  });

  it('le résultat ne produit JAMAIS de note sur 20', () => {
    const r = calculerResultat(grille, toutParfait);
    expect(r).not.toHaveProperty('note');
    expect(r).not.toHaveProperty('noteSur20');
    expect(r).not.toHaveProperty('noteMin');
    expect(r).not.toHaveProperty('noteMax');
    // Sérialisation : aucun champ « note » ne doit s'y glisser.
    expect(Object.keys(JSON.parse(JSON.stringify(r))).some((k) => /note/i.test(k))).toBe(false);
  });

  it('la maîtrise reste bornée à [0, 100]', () => {
    for (const jeu of [toutParfait, toutNul, {}]) {
      const m = calculerResultat(grille, jeu as Record<string, NiveauMaitrise>).maitrise;
      expect(m).toBeGreaterThanOrEqual(0);
      expect(m).toBeLessThanOrEqual(100);
    }
  });

  it('le statut est qualitatif, jamais un pourcentage présenté comme note', () => {
    expect(statutQualitatif(0)).toBe('fragile');
    expect(statutQualitatif(39)).toBe('fragile');
    expect(statutQualitatif(40)).toBe('en_cours');
    expect(statutQualitatif(74)).toBe('en_cours');
    expect(statutQualitatif(75)).toBe('solide');
    expect(statutQualitatif(100)).toBe('solide');
  });
});

describe('entraîneur Bac — priorités de reprise', () => {
  const grille = construireGrille(sujet);

  it('plafonne à 5, quel que soit le retard accumulé', () => {
    const evaluations = Object.fromEntries(grille.consignes.map((c) => [cleConsigne(c), 0 as NiveauMaitrise]));
    expect(grille.consignes.length).toBeGreaterThan(5);
    expect(priorites(grille, evaluations)).toHaveLength(5);
  });

  it('les consignes les plus lourdes passent devant', () => {
    const evaluations = Object.fromEntries(grille.consignes.map((c) => [cleConsigne(c), 0 as NiveauMaitrise]));
    const p = priorites(grille, evaluations);
    const points = p.map((c) => c.points ?? 0);
    expect([...points].sort((a, b) => b - a)).toEqual(points);
  });

  it('une consigne réussie sort de la liste', () => {
    const toutReussi = Object.fromEntries(grille.consignes.map((c) => [cleConsigne(c), 2 as NiveauMaitrise]));
    expect(priorites(grille, toutReussi)).toEqual([]);
  });

  it('un élève qui n’a rien évalué n’a aucune priorité (pas de reproche)', () => {
    expect(priorites(grille, {})).toEqual([]);
  });
});
