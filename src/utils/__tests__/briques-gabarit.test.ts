// Phase 4 — le gabarit de jeu : rien d'inventé, statut prudent, porte d'aperçu.
//
// Ces tests portent sur le contenu lui-même : c'est le seul endroit du dépôt où l'on vérifie
// que les briques d'une unité prioritaire sont bien des **morceaux** d'un texte existant.
import { describe, expect, it } from 'vitest';
import { chargerJeuxUnite, UNITES_AVEC_BRIQUES, chargerJeuxSujet } from '../../data/briques';
import { CHOIX_UNITES, UNITES_SYNTHESE } from '../../data/briques/unites';
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

describe('catalogue des unités', () => {
  it('la liste annoncée correspond exactement aux unités servies', () => {
    expect(UNITES_AVEC_BRIQUES).toEqual(['u1', ...UNITES_SYNTHESE]);
    expect(UNITES_SYNTHESE).toHaveLength(10);
  });

  it('chaque unité dérivée a un jeu, non relu, avec les rôles et les pièges', async () => {
    for (const uniteId of UNITES_SYNTHESE) {
      const jeux = await chargerJeuxUnite(uniteId);
      expect(jeux, uniteId).toHaveLength(1);
      expect(jeux[0].statut).toBe('a_valider_enseignant');
      expect(jeux[0].uniteId).toBe(uniteId);
      expect(jeux[0].id).toBe(`jb:${uniteId}:e1`);
      expect(jeux[0].verbe).toBe(CHOIX_UNITES[uniteId].verbe);
      expect(jeux[0].attendu).toBe(CHOIX_UNITES[uniteId].attendu);
      expect(jeux[0].structure.length).toBeGreaterThanOrEqual(3);
      expect(jeux[0].briques.filter((b) => b.role === 'piege').length).toBeGreaterThanOrEqual(1);
      expect(jeux[0].briques.filter((b) => b.role === 'conclusion')).toHaveLength(1);
    }
  });

  it('u3 et u4 restent les situations choisies (u3b pour le ribonucléase)', async () => {
    expect(CHOIX_UNITES.u3.situation).toBe('u3b');
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
    for (const uniteId of UNITES_SYNTHESE) {
      const jeux = await chargerJeuxUnite(uniteId);
      expect(jeuxJouables(jeux)).toEqual([]);
      expect(apercuRequis(jeux)).toBe(true);
      expect(jeuxJouables(jeux, true)).toHaveLength(1);
    }
  });

  it('découpent des phrases existantes, mot pour mot (aucun énoncé inventé)', async () => {
    const cibles: [string, string][] = UNITES_SYNTHESE.map((u) => [u, CHOIX_UNITES[u].situation ?? u]);
    for (const [uniteId, situationId] of cibles) {
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
      ...(await Promise.all(UNITES_SYNTHESE.map((u) => chargerJeuxUnite(u)))).flat(),
      ...(await chargerJeuxSujet('2025-1')),
    ];
    // 4 jeux u1 + 10 unités dérivées + 2 du sujet pilote.
    expect(tous).toHaveLength(16);
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
