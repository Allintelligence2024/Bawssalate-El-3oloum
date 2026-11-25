import { describe, expect, it } from 'vitest';
import {
  avantApres,
  basculerBrique,
  briquesChoisies,
  diagnosticPiege,
  evaluerAssemblage,
  apercuRequis,
  jeuActif,
  jeuxJouables,
  rolesExiges,
} from '../briques';
import { JEUX_UNITE1 } from '../../data/briques/u1';
import { JEUX_SUJET_2025_1 } from '../../data/briques/sujet-2025-1';
import { chargerJeuxSujet, chargerJeuxUnite, jeuPourConsigne } from '../../data/briques';
import type { JeuBriques } from '../../data/briques/types';

const e2 = JEUX_UNITE1.find((j) => j.id === 'jb:u1:e2')!;

/** Le jeu complet dans l'ordre : les 4 rôles de la structure, sans piège. */
function assemblageComplet(jeu: JeuBriques): string[] {
  return rolesExiges(jeu).map((role) => jeu.briques.find((b) => b.role === role)!.id);
}

describe('évaluation par rôles — la structure, jamais le texte', () => {
  it('un assemblage complet et ordonné est complet, score = total', () => {
    const ev = evaluerAssemblage(e2, assemblageComplet(e2));
    expect(ev.complete).toBe(true);
    expect(ev.manquants).toEqual([]);
    expect(ev.horsOrdre).toBe(false);
    expect(ev.score).toBe(ev.total);
    expect(ev.critereNomme).toBeNull();
  });

  it('un rôle manquant est nommé, et le remède est une consigne (pas une note)', () => {
    const ids = assemblageComplet(e2).filter((id) => id !== e2.briques.find((b) => b.role === 'comparaison')!.id);
    const ev = evaluerAssemblage(e2, ids);
    expect(ev.complete).toBe(false);
    expect(ev.manquants).toEqual(['comparaison']);
    expect(ev.critereNomme).toBe('المقارنة بالشاهد');
    expect(ev.message).toContain('ناقص');
    // Aucune note, aucun /20, aucun pourcentage anxiogène.
    expect(ev.message).not.toMatch(/\/\s*20|%|نقطة/);
  });

  it('tous les rôles présents mais inversés : hors ordre, pas « incomplet »', () => {
    const ids = assemblageComplet(e2).reverse();
    const ev = evaluerAssemblage(e2, ids);
    expect(ev.manquants).toEqual([]);
    expect(ev.horsOrdre).toBe(true);
    expect(ev.complete).toBe(false);
    expect(ev.critereNomme).toBe('الترتيب');
  });

  it('un piège ne retire pas de critère : il déclenche un diagnostic', () => {
    const piege = e2.briques.find((b) => b.role === 'piege')!;
    const ev = evaluerAssemblage(e2, [...assemblageComplet(e2), piege.id]);
    expect(ev.complete).toBe(true);
    expect(ev.score).toBe(ev.total);
    expect(ev.pieges.map((p) => p.id)).toEqual([piege.id]);
    expect(diagnosticPiege(piege)).toContain('فخّ');
    // Le diagnostic ne révèle jamais la bonne réponse.
    expect(diagnosticPiege(piege)).not.toContain('الجواب الصحيح');
  });

  it('un assemblage vide ne plante pas et nomme le premier critère', () => {
    const ev = evaluerAssemblage(e2, []);
    expect(ev.complete).toBe(false);
    expect(ev.score).toBe(0);
    expect(ev.critereNomme).toBe('الملاحظة');
  });
});

describe('bascule et lecture de l’assemblage', () => {
  it('basculer ajoute puis retire, en conservant l’ordre d’ajout', () => {
    const a = basculerBrique([], 'x');
    expect(a).toEqual(['x']);
    expect(basculerBrique(a, 'y')).toEqual(['x', 'y']);
    expect(basculerBrique(['x', 'y'], 'x')).toEqual(['y']);
  });

  it('les identifiants inconnus sont ignorés (état local corrompu)', () => {
    expect(briquesChoisies(e2, ['inconnu'])).toEqual([]);
  });
});

describe('Avant / Après — des critères, jamais des points', () => {
  it('le gain ne peut pas être négatif', () => {
    expect(avantApres(2, 4)).toEqual({ avant: 2, apres: 4, gain: 2 });
    expect(avantApres(4, 3).gain).toBe(0);
  });
});

describe('catalogue et statuts éditoriaux', () => {
  it('seuls les jeux explicitement actifs sont jouables', () => {
    for (const jeu of JEUX_UNITE1) expect(jeuActif(jeu)).toBe(jeu.statut === 'actif');
    expect(jeuActif(undefined)).toBe(false);
  });

  it('l’écran ne reçoit jamais un jeu non relu sans aperçu explicite', () => {
    // Contenu actif (unité 1) : servi directement, et seulement lui.
    expect(jeuxJouables(JEUX_UNITE1)).toEqual(JEUX_UNITE1.filter(jeuActif));
    expect(apercuRequis(JEUX_UNITE1)).toBe(false);
    // Contenu non relu : rien sans aperçu, tout avec un aperçu explicite.
    expect(jeuxJouables(JEUX_SUJET_2025_1)).toEqual([]);
    expect(apercuRequis(JEUX_SUJET_2025_1)).toBe(true);
    expect(jeuxJouables(JEUX_SUJET_2025_1, true)).toEqual(JEUX_SUJET_2025_1);
    // Mélange : l'aperçu ne réintroduit pas les jeux non relus à côté des actifs.
    expect(jeuxJouables([...JEUX_UNITE1, ...JEUX_SUJET_2025_1], true)).toEqual(JEUX_UNITE1.filter(jeuActif));
    // Catalogue vide : ni porte d'aperçu, ni exercice.
    expect(jeuxJouables([])).toEqual([]);
    expect(apercuRequis([])).toBe(false);
  });

  it('le gabarit pilote 2025-1 n’est pas jouable avant relecture enseignante', () => {
    expect(JEUX_SUJET_2025_1.length).toBeGreaterThan(0);
    for (const jeu of JEUX_SUJET_2025_1) {
      expect(jeu.statut).toBe('a_valider_enseignant');
      expect(jeuActif(jeu)).toBe(false);
    }
  });

  it('chaque jeu porte les quatre rôles dans l’ordre, et au moins un piège', () => {
    for (const jeu of [...JEUX_UNITE1, ...JEUX_SUJET_2025_1]) {
      expect(rolesExiges(jeu)).toEqual(['observation', 'comparaison', 'interpretation', 'conclusion']);
      expect(jeu.briques.filter((b) => b.role === 'piege').length).toBeGreaterThanOrEqual(1);
      // Un bloc reste un bloc : court, lisible au pouce.
      for (const b of jeu.briques) expect(b.texte.length).toBeLessThanOrEqual(140);
    }
  });

  it('les briques ne sont actives que si le jeu l’est (pas de contenu non Relu joué)', () => {
    for (const jeu of [...JEUX_UNITE1, ...JEUX_SUJET_2025_1]) {
      for (const b of jeu.briques) {
        if (!jeuActif(jeu)) expect(b.statut).toBe('a_valider_enseignant');
      }
    }
  });
});

describe('chargement paresseux', () => {
  it('charge l’unité 1 puis la sert depuis le cache', async () => {
    const a = await chargerJeuxUnite('u1');
    const b = await chargerJeuxUnite('u1');
    expect(a.length).toBe(4);
    expect(b).toBe(a);
  });

  it('une unité sans contenu renvoie un tableau vide (état vide honnête)', async () => {
    await expect(chargerJeuxUnite('u9')).resolves.toEqual([]);
    await expect(chargerJeuxSujet('1999-1')).resolves.toEqual([]);
  });

  it('retrouve le jeu d’une consigne (convention 3 segments : jb:sujet:ex:consigne)', () => {
    const jeux = JEUX_SUJET_2025_1;
    expect(jeux[0].id).toBe('jb:2025-1:1:1');
    expect(jeuPourConsigne(jeux, 1, 1, 1)?.id).toBe('jb:2025-1:1:1');
    // Hors sujet : aucune correspondance, pas de faux positif.
    expect(jeuPourConsigne(jeux, 3, 2, 9)).toBeUndefined();
  });
});
