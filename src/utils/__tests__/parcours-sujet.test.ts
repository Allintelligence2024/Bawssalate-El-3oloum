import { describe, expect, it } from 'vitest';
import { parcoursSujet, avancementGuide, sujetParId, titreSujet } from '../parcoursSujet';
import { SUJETS_OFFICIELS } from '../../data/sujetsOfficiels';
import { cleConsigne } from '../entrainement';

describe('parcours d’un sujet complet — 2022 en exemple', () => {
  const parcours = parcoursSujet('2022-1');

  it('le sujet 2022-1 existe et donne toutes ses consignes, dans l’ordre du papier', () => {
    expect(parcours).not.toBeNull();
    expect(parcours!.titre).toContain('2022');
    expect(parcours!.etapes).toHaveLength(9);
    expect(parcours!.etapes.map((e) => e.numero)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    // Ordre strict : exercice puis partie puis consigne, jamais mélangé.
    const rangs = parcours!.etapes.map((e) => e.exercice * 10000 + e.partie * 100 + e.consigne);
    expect([...rangs].sort((a, b) => a - b)).toEqual(rangs);
  });

  it('chaque consigne porte le verbe, l’attendu du correcteur et sa checklist de 3 points', () => {
    for (const e of parcours!.etapes) {
      expect(e.verbe.length).toBeGreaterThan(0);
      expect(e.texte.length).toBeGreaterThan(0);
      expect(e.attendu.length).toBeGreaterThan(10);
      expect(e.checklist).toHaveLength(3);
      for (const point of e.checklist) expect(point.length).toBeGreaterThan(5);
    }
  });

  it('les éléments de réponse viennent du corrigé officiel, jamais d’une invention', () => {
    for (const e of parcours!.etapes) {
      expect(e.elements.length).toBeGreaterThan(0);
      expect(e.sourceCorrige).toBeTruthy();
    }
    expect(parcours!.avecElements).toBe(parcours!.etapes.length);
  });

  it('le barème du parcours est celui du corrigé (20 points), sans être présenté comme une note', () => {
    expect(parcours!.baremeTotal).toBe(20);
    for (const e of parcours!.etapes) {
      expect(e.points).not.toBeNull();
      expect(e.points).toBeGreaterThan(0);
    }
  });

  it('les clés sont celles de l’entraîneur du sujet (une seule évaluation, deux écrans)', () => {
    for (const e of parcours!.etapes) {
      expect(e.cle).toBe(cleConsigne(e));
    }
    expect(new Set(parcours!.etapes.map((e) => e.cle)).size).toBe(parcours!.etapes.length);
  });

  it('les exercices sont regroupés : 3 blocs, chacun avec ses consignes', () => {
    expect(parcours!.exercices).toHaveLength(3);
    const total = parcours!.exercices.reduce((s, b) => s + b.etapes.length, 0);
    expect(total).toBe(parcours!.etapes.length);
    expect(parcours!.exercices.map((b) => b.numero)).toEqual([1, 2, 3]);
  });

  it('un sujet inconnu ne fabrique rien : retour `null`', () => {
    expect(parcoursSujet('1999-9')).toBeNull();
  });

  it('titre et lookup honnêtes', () => {
    expect(titreSujet(sujetParId('2022-1')!)).toContain('2022');
  });
});

describe('les 30 sujets sont réellement faisables de bout en bout', () => {
  it('chaque consigne de chaque sujet a des éléments officiels et un barème', () => {
    let consignes = 0;
    for (const s of SUJETS_OFFICIELS) {
      const p = parcoursSujet(s.id);
      expect(p, s.id).not.toBeNull();
      expect(p!.etapes.length).toBeGreaterThan(0);
      for (const e of p!.etapes) {
        consignes += 1;
        expect(e.elements.length, `${s.id} / ${e.cle}`).toBeGreaterThan(0);
        expect(e.points, `${s.id} / ${e.cle}`).not.toBeNull();
      }
    }
    // Vérifié sur le dépôt : 30 sujets, 331 consignes.
    expect(SUJETS_OFFICIELS).toHaveLength(30);
    expect(consignes).toBe(331);
  });
});

describe('avancement — travail fait, jamais « réussite »', () => {
  const parcours = parcoursSujet('2022-1')!;

  it('sans évaluation : 0 travaillée, pas terminé', () => {
    expect(avancementGuide(parcours, undefined)).toEqual({
      travaillees: 0,
      total: 9,
      termine: false,
    });
  });

  it('les niveaux 0/1/2 comptent comme travaillés, le reste non', () => {
    const maitrise = { [parcours.etapes[0].cle]: 0, [parcours.etapes[1].cle]: 2, autre: 5 };
    const a = avancementGuide(parcours, maitrise);
    expect(a.travaillees).toBe(2);
    expect(a.termine).toBe(false);
  });

  it('tout évalué → terminé (sans aucune notion de score)', () => {
    const maitrise = Object.fromEntries(parcours.etapes.map((e) => [e.cle, 1]));
    const a = avancementGuide(parcours, maitrise);
    expect(a.termine).toBe(true);
    expect(a.travaillees).toBe(a.total);
    expect(JSON.stringify(a)).not.toMatch(/%|\/20|note|score/i);
  });
});
