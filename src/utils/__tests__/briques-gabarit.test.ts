// Phase 4 — le gabarit de jeu : rien d'inventé, statut prudent, porte d'aperçu.
//
// Ces tests portent sur le contenu lui-même : c'est le seul endroit du dépôt où l'on vérifie
// que les briques d'une unité prioritaire sont bien des **morceaux** d'un texte existant.
import { describe, expect, it } from 'vitest';
import { chargerJeuxUnite, UNITES_AVEC_BRIQUES, chargerJeuxSujet } from '../../data/briques';
import { rolesDepuisModele, jeuBriques } from '../../data/briques/gabarit';
import { situationsDeUnite } from '../../data/syntheses';
import { apercuRequis, jeuxJouables } from '../briques';
import type { JeuBriques } from '../../data/briques/types';

const norm = (s: string) => s.replace(/\s+/g, ' ').trim();

describe('gabarit — rôles et numérotation', () => {
  it('répartit observation / interpretation / conclusion dans l’ordre canonique', () => {
    expect(rolesDepuisModele(5)).toEqual(['observation', 'observation', 'interpretation', 'interpretation', 'conclusion']);
    expect(rolesDepuisModele(3)).toEqual(['observation', 'interpretation', 'conclusion']);
    expect(rolesDepuisModele(0)).toEqual([]);
  });

  it('numérote les briques dans l’ordre et applique le statut par défaut', () => {
    const jeu = jeuBriques({
      id: 'jb:test:e0',
      document: 'd',
      question: 'q',
      verbe: 'بيِّن',
      attendu: 'a',
      structure: ['observation', 'conclusion'],
      briques: [
        { role: 'observation', texte: 'un', source: 's' },
        { role: 'conclusion', texte: 'deux', source: 's' },
      ],
    });
    expect(jeu.statut).toBe('a_valider_enseignant');
    expect(jeu.briques.map((b) => b.id)).toEqual(['b:jb:test:e0:1', 'b:jb:test:e0:2']);
    expect(jeu.briques.every((b) => b.statut === 'a_valider_enseignant')).toBe(true);
  });

  it('refuse un jeu vide', () => {
    expect(() => jeuBriques({
      id: 'jb:test:vide', document: 'd', question: 'q', verbe: 'بيِّن', attendu: 'a',
      structure: ['conclusion'], briques: [],
    })).toThrow(/sans brique/);
  });
});

describe('unités prioritaires u3 et u4', () => {
  it('sont cataloguées avec un jeu chacune, non relu', async () => {
    expect(UNITES_AVEC_BRIQUES).toEqual(expect.arrayContaining(['u1', 'u3', 'u4']));
    for (const uniteId of ['u3', 'u4']) {
      const jeux = await chargerJeuxUnite(uniteId);
      expect(jeux).toHaveLength(1);
      expect(jeux[0].statut).toBe('a_valider_enseignant');
      expect(jeux[0].uniteId).toBe(uniteId);
      expect(jeux[0].id).toBe(`jb:${uniteId}:e1`);
      // Trois rôles au moins, un piège au moins, des id stables.
      expect(jeux[0].structure.length).toBeGreaterThanOrEqual(3);
      expect(jeux[0].briques.some((b) => b.role === 'piege')).toBe(true);
      const ids = jeux[0].briques.map((b) => b.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('ne servent aucun jeu sans aperçu explicite', async () => {
    for (const uniteId of ['u3', 'u4']) {
      const jeux = await chargerJeuxUnite(uniteId);
      expect(jeuxJouables(jeux)).toEqual([]);
      expect(apercuRequis(jeux)).toBe(true);
      expect(jeuxJouables(jeux, true)).toHaveLength(1);
    }
  });

  it('découpent des phrases existantes, mot pour mot (aucun énoncé inventé)', async () => {
    for (const [uniteId, situationId] of [['u3', 'u3b'], ['u4', 'u4']] as const) {
      const situation = situationsDeUnite(uniteId).find((s) => s.id === situationId)!;
      expect(situation).toBeDefined();
      const [jeu] = await chargerJeuxUnite(uniteId);
      // Le document et la question sont ceux de la synthèse, sans retouche.
      expect(jeu.document).toBe(situation.sujet);
      expect(jeu.question).toBe(situation.question);
      // Le corps du jeu = le modèle de réponse, dans l'ordre, sans phrase ajoutée.
      const corps = jeu.briques.filter((b) => b.role !== 'piege');
      expect(corps.map((b) => b.texte)).toEqual(situation.modele);
      // Les pièges sont ceux de l'unité, verbatim.
      const pieges = jeu.briques.filter((b) => b.role === 'piege');
      expect(pieges.length).toBe(situation.pieges.length);
      for (const piege of pieges) {
        expect(situation.pieges.map(norm)).toContain(norm(piege.texte));
      }
    }
  });

  it('garde des briques courtes et sourcées (lisibilité + relecture)', async () => {
    const tous: JeuBriques[] = [
      ...(await chargerJeuxUnite('u1')),
      ...(await chargerJeuxUnite('u3')),
      ...(await chargerJeuxUnite('u4')),
      ...(await chargerJeuxSujet('2025-1')),
    ];
    expect(tous.length).toBeGreaterThan(4);
    const ids = tous.map((j) => j.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const jeu of tous) {
      for (const b of jeu.briques) {
        expect(b.source.length).toBeGreaterThan(0);
        expect(b.texte.length).toBeLessThanOrEqual(320);
      }
    }
  });
});
