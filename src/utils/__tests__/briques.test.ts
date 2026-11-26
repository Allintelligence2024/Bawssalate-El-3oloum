import { describe, expect, it } from 'vitest';
import {
  avantApres,
  basculerBrique,
  briquesChoisies,
  briquesExigees,
  diagnosticPiege,
  evaluerAssemblage,
  apercuRequis,
  jeuActif,
  jeuxJouables,
  rolesExiges,
} from '../briques';
import { JEUX_UNITE1 } from '../../data/briques/u1';
import { JEUX_SUJET_2025_1 } from '../../data/briques/sujet-2025-1';
import { chargerJeuxSujet, chargerJeuxUnite, jeuPourConsigne, UNITES_AVEC_BRIQUES } from '../../data/briques';
import type { JeuBriques } from '../../data/briques/types';

const e2 = JEUX_UNITE1.find((j) => j.id === 'jb:u1:e2')!;

/** Les rôles d'un jeu, dans l'ordre canonique (l'ordre que l'app exige de l'élève). */
function structureCanonique(jeu: JeuBriques) {
  return rolesExiges(jeu);
}

/**
 * Le jeu complet dans l'ordre : **une brique par critère** (pas une par rôle — `jb:u1:e2` a
 * deux `comparaison`, une seule ne suffit pas), sans piège.
 */
function assemblageComplet(jeu: JeuBriques): string[] {
  const parRole = new Map<string, string[]>();
  for (const b of briquesExigees(jeu)) {
    parRole.set(b.role, [...(parRole.get(b.role) ?? []), b.id]);
  }
  return rolesExiges(jeu).flatMap((role) => parRole.get(role) ?? []);
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
    const ids = [...assemblageComplet(e2)].reverse();
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

describe('un critère = une brique, pas un rôle', () => {
  // Régression : `evaluerAssemblage` comptait les rôles **distincts**. Sur les 10 jeux dérivés
  // des synthèses (2 observations + 2 interprétations + 1 conclusion), l'élève qui ne posait
  // qu'une seule observation et une seule interprétation était déclaré « complete » — la moitié
  // de la réponse manquait. 16 réponses fausses sur 32 combinaisons étaient acceptées.
  const jeuModele = (roleParBrique: Parameters<typeof briquesExigees>[0]['structure']): JeuBriques => ({
    id: 'jb:test:crit',
    document: 'd',
    question: 'q',
    verbe: 'بيِّن',
    attendu: 'a',
    structure: roleParBrique,
    statut: 'actif',
    briques: [
      { id: 'b1', role: 'observation', texte: 'obs 1', source: 's', statut: 'actif' },
      { id: 'b2', role: 'observation', texte: 'obs 2', source: 's', statut: 'actif' },
      { id: 'b3', role: 'interpretation', texte: 'interp 1', source: 's', statut: 'actif' },
      { id: 'b4', role: 'interpretation', texte: 'interp 2', source: 's', statut: 'actif' },
      { id: 'b5', role: 'conclusion', texte: 'concl', source: 's', statut: 'actif' },
    ],
  });

  it('deux observations exigées : une seule ne suffit pas', () => {
    const jeu = jeuModele(['observation', 'interpretation', 'conclusion']);
    const ev = evaluerAssemblage(jeu, ['b1', 'b3', 'b5']);
    expect(ev.complete).toBe(false);
    // Les deux rôles sont touchés (une brique manque de chaque), mais un seul l'est à moitié :
    // le message le dit en clair au lieu d'annoncer « البنية كاملة ».
    expect(ev.manquants).toEqual(['observation', 'interpretation']);
    expect(ev.criteresManquants).toBe(2);
    expect(ev.briquesManquantes.map((b) => b.id)).toEqual(['b2', 'b4']);
    expect(ev.score).toBe(3);
    expect(ev.total).toBe(5);
    expect(ev.message).toContain('ناقص: الملاحظة');
  });

  it('toutes les briques exigées : complet, score = total', () => {
    const jeu = jeuModele(['observation', 'interpretation', 'conclusion']);
    const ev = evaluerAssemblage(jeu, ['b1', 'b2', 'b3', 'b4', 'b5']);
    expect(ev.complete).toBe(true);
    expect(ev.score).toBe(ev.total);
    expect(ev.briquesManquantes).toEqual([]);
  });

  it('les 10 jeux dérivés refusent la moitié de la réponse (aucun faux positif)', async () => {
    for (const uniteId of UNITES_AVEC_BRIQUES) {
      const [jeu] = await chargerJeuxUnite(uniteId);
      expect(jeu, uniteId).toBeDefined();
      const exigees = briquesExigees(jeu);
      if (exigees.length < 2) continue;
      // Une brique retirée au hasard (la première) : l'assemblage ne peut plus être complet.
      const ids = exigees.slice(1).map((b) => b.id);
      const ev = evaluerAssemblage(jeu, ids);
      expect(ev.complete, `${jeu!.id} : réponse incomplète déclarée complète`).toBe(false);
      expect(ev.criteresManquants).toBeGreaterThan(0);
    }
  });

  it('le message de réussite cite les rôles du jeu, jamais un rôle absent', async () => {
    const [jeu] = await chargerJeuxUnite('u6');
    const ev = evaluerAssemblage(jeu, briquesExigees(jeu).map((b) => b.id));
    expect(ev.complete).toBe(true);
    expect(ev.message).not.toContain('مقارنة');
  });

  it('un jeu sans structure n’exige rien et n’invente pas de critère', () => {
    const jeu = jeuModele([]);
    const ev = evaluerAssemblage(jeu, []);
    expect(ev.total).toBe(0);
    expect(ev.manquants).toEqual([]);
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

  it('chaque jeu serti porte au moins un piège et des rôles dans l’ordre canonique', () => {
    for (const jeu of [...JEUX_UNITE1, ...JEUX_SUJET_2025_1]) {
      expect(rolesExiges(jeu)).toEqual(structureCanonique(jeu));
      expect(jeu.briques.filter((b) => b.role === 'piege').length).toBeGreaterThanOrEqual(1);
      // Un bloc reste un bloc : court, lisible au pouce.
      for (const b of jeu.briques) expect(b.texte.length).toBeLessThanOrEqual(140);
    }
  });

  it('le jeu 2025 adapté est évaluable en aperçu, sans prétendre noter un texte scientifique', () => {
    const jeu = JEUX_SUJET_2025_1.find((j) => j.id === 'jb:2025-1:1:1')!;
    expect(jeu.verbe).toBe('بيِّن');
    expect(jeu.statut).toBe('a_valider_enseignant');
    expect(jeuActif(jeu)).toBe(false);
    expect(jeu.structure).toEqual(['observation', 'interpretation', 'conclusion']);
    const ids = assemblageComplet(jeu);
    expect(ids).toHaveLength(4);
    expect(evaluerAssemblage(jeu, []).complete).toBe(false);
    expect(evaluerAssemblage(jeu, ids).complete).toBe(true);
    for (const id of ids) expect(evaluerAssemblage(jeu, ids.filter((x) => x !== id)).complete).toBe(false);
    expect(evaluerAssemblage(jeu, [...ids].reverse()).horsOrdre).toBe(true);
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
    // Depuis la phase 4, chaque unité du programme a un jeu dérivé de sa synthèse : l'état
    // vide ne concerne donc plus une unité réelle mais un identifiant inconnu (ancien état,
    // lien obsolète) — et il reste honnête : un tableau vide, pas une erreur.
    await expect(chargerJeuxUnite('u99')).resolves.toEqual([]);
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
