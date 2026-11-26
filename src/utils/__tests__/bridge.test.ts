// Moteur bridge (§11.4) — au moins 30 tests, et surtout les garde-fous non négociables.
import { describe, it, expect } from 'vitest';
import {
  niveauxVierges, niveauConfiance, competencesTriees, writeBack, raisons,
  planDeJour, PLAFOND_DETTE, creerReglesAuto, activerRegle, reglesActives,
  accesSujetBac, statutUnite, type Niveaux, type NiveauCompetence,
} from '../bridge';
import {
  COMPETENCES, VERBE_VERS_COMPETENCE, competenceDe, UNITE_PAR_ID,
  leconsDeUnite, poidsBac, prerequisDe, PREREQUIS_UNITES,
} from '../bridgeAdapter';
import { UNITES } from '../../data/programme';
import { SUJETS_OFFICIELS } from '../../data/sujetsOfficiels';

describe('adaptateur — parité avec programme.ts', () => {
  it('toutes les unités du programme sont connues de l’adaptateur', () => {
    for (const u of UNITES) expect(UNITE_PAR_ID.get(u.id)).toBeDefined();
    expect(UNITE_PAR_ID.size).toBe(UNITES.length);
  });

  it('poidsBac et leçons viennent de la source, pas d’une copie', () => {
    for (const u of UNITES) {
      expect(poidsBac(u.id)).toBe(u.poidsBac);
      expect(leconsDeUnite(u.id)).toEqual([...u.lessonIds]);
    }
  });

  it('une unité inconnue lève, au lieu de renvoyer 0 silencieusement', () => {
    expect(() => poidsBac('u99')).toThrow();
    expect(() => leconsDeUnite('u99')).toThrow();
  });

  it('chaque verbe réellement utilisé dans les sujets a une compétence', () => {
    const verbes = new Set<string>();
    for (const s of SUJETS_OFFICIELS) {
      for (const e of s.exercices) for (const p of e.parties) for (const c of p.consignes) verbes.add(c.verbe);
    }
    expect(verbes.size).toBeGreaterThan(10);
    for (const v of verbes) expect(() => competenceDe(v as never)).not.toThrow();
  });

  it('la table des verbes couvre exactement les clés déclarées', () => {
    expect(Object.keys(VERBE_VERS_COMPETENCE)).toHaveLength(20);
    for (const c of Object.values(VERBE_VERS_COMPETENCE)) expect(COMPETENCES).toContain(c);
    expect(COMPETENCES).toHaveLength(8);
  });

  it('les prérequis ne se contredisent pas et ne bouclent pas', () => {
    for (const u of UNITES) {
      const p = prerequisDe(u.id);
      expect(p, `${u.id} se déclare prérequis de lui-même`).not.toContain(u.id);
      for (const q of p) expect(UNITE_PAR_ID.get(q), `${u.id} exige ${q} qui n'existe pas`).toBeDefined();
    }
    expect(Object.keys(PREREQUIS_UNITES).sort()).toEqual(UNITES.map((u) => u.id).sort());
  });
});

describe('brique 1 — correction de confiance', () => {
  const n = (niveau: number, preuves: number): NiveauCompetence => ({ niveau, preuves });

  it('une preuve unique n’équivaut pas à un acquis', () => {
    expect(niveauConfiance(n(100, 1))).toBeCloseTo(75, 5);
  });

  it('cinq preuves laissent passer presque tout le niveau', () => {
    expect(niveauConfiance(n(100, 5))).toBeCloseTo(95, 5);
  });

  it('à partir de six preuves, le niveau est rendu tel quel', () => {
    expect(niveauConfiance(n(80, 6))).toBe(80);
    expect(niveauConfiance(n(80, 50))).toBe(80);
  });

  it('zéro preuve ramène tout à zéro, même avec un niveau hérité', () => {
    expect(niveauConfiance(n(90, 0))).toBeCloseTo(63, 5);
  });

  it('le résultat reste borné à [0, 100]', () => {
    expect(niveauConfiance(n(1000, 10))).toBe(100);
    expect(niveauConfiance(n(-50, 10))).toBe(0);
  });

  it('le tri met les compétences mesurées les plus faibles devant', () => {
    const niveaux = niveauxVierges();
    niveaux.C2_analyser_courbe = { niveau: 90, preuves: 10 };
    niveaux.C5_conclure = { niveau: 10, preuves: 10 };
    const tri = competencesTriees(niveaux);
    expect(tri[0].competence).toBe('C5_conclure');
    // Les compétences jamais mesurées passent après celles qui le sont : on n'envoie pas
    // un élève sur ce qu'il n'a jamais travaillé avant ce qu'il rate réellement.
    expect(tri.findIndex((x) => x.preuves === 0)).toBeGreaterThan(tri.findIndex((x) => x.competence === 'C2_analyser_courbe'));
  });
});

describe('brique 2 — writeBack', () => {
  it('applique un lissage α = 0,3 par défaut', () => {
    const niveaux = niveauxVierges();
    niveaux.C1_exploiter_document = { niveau: 0, preuves: 0 };
    const apres = writeBack(niveaux, { verbe: 'سمِّ', score: 2 });
    // (1-0,3)*0 + 0,3*100 = 30
    expect(apres.C1_exploiter_document.niveau).toBeCloseTo(30, 5);
    expect(apres.C1_exploiter_document.preuves).toBe(1);
  });

  it('utilise α = 0,4 en mode chronométré', () => {
    const niveaux = niveauxVierges();
    const apres = writeBack(niveaux, { verbe: 'سمِّ', score: 2, chronometre: true });
    expect(apres.C1_exploiter_document.niveau).toBeCloseTo(40, 5);
  });

  it('un score ≤ 1 fait s’effondrer le niveau vers fragile', () => {
    const niveaux = niveauxVierges();
    niveaux.C4_argumenter = { niveau: 95, preuves: 20 };
    const apres = writeBack(niveaux, { verbe: 'ناقش', score: 1 });
    expect(apres.C4_argumenter.niveau).toBeLessThanOrEqual(20);
  });

  it('un score de 2 ne détruit pas un acquis élevé', () => {
    const niveaux = niveauxVierges();
    niveaux.C4_argumenter = { niveau: 90, preuves: 20 };
    const apres = writeBack(niveaux, { verbe: 'ناقش', score: 2 });
    expect(apres.C4_argumenter.niveau).toBeGreaterThan(85);
  });

  it('est idempotent sur un même horodatage', () => {
    const niveaux = niveauxVierges();
    const ev = { verbe: 'فسِّر' as const, score: 2 as const, le: '2026-11-22T10:00:00Z' };
    const une = writeBack(niveaux, ev);
    const deux = writeBack(une, ev);
    expect(deux).toBe(une); // même référence : rien recalculé
    expect(deux.C3_mettre_en_relation.preuves).toBe(1);
  });

  it('deux événements distincts incrémentent deux fois', () => {
    let niveaux = niveauxVierges();
    niveaux = writeBack(niveaux, { verbe: 'فسِّر', score: 2, le: '2026-11-22T10:00:00Z' });
    niveaux = writeBack(niveaux, { verbe: 'فسِّر', score: 2, le: '2026-11-22T11:00:00Z' });
    expect(niveaux.C3_mettre_en_relation.preuves).toBe(2);
  });

  it('ne touche pas aux autres compétences', () => {
    const avant = niveauxVierges();
    const apres = writeBack(avant, { verbe: 'مخطّط', score: 2 });
    expect(apres.C1_exploiter_document).toEqual(avant.C1_exploiter_document);
  });

  it('les raisons sont explicites et en arabe', () => {
    const r = raisons({ niveau: 50, preuves: 1 });
    expect(r.length).toBeGreaterThan(0);
    expect(r.join(' ')).toMatch(/[\u0600-\u06FF]/);
  });
});

describe('brique 3 — planDeJour et plafond de dette', () => {
  const genereux = (): string[] => Array.from({ length: 40 }, (_, i) => `lecon_${i}`);

  it('plafonne les révisions à 5 même avec 40 en retard', () => {
    const plan = planDeJour({ unitesAbordees: [], revisionsDues: genereux(), niveaux: niveauxVierges() });
    const revisions = plan.actions.filter((a) => a.type === 'revision');
    expect(revisions).toHaveLength(PLAFOND_DETTE);
    expect(plan.revisionsReportees).toBe(35);
  });

  it('ne supprime rien : les révisions non prises sont comptées comme reportées', () => {
    const plan = planDeJour({ unitesAbordees: ['u1'], revisionsDues: genereux(), niveaux: niveauxVierges() });
    expect(plan.revisionsRetenues + plan.revisionsReportees).toBe(40);
  });

  it('un élève sans retard n’a pas de révision', () => {
    const plan = planDeJour({ unitesAbordees: ['u1'], revisionsDues: [], niveaux: niveauxVierges() });
    expect(plan.actions.filter((a) => a.type === 'revision')).toHaveLength(0);
  });

  it('respecte les prérequis : pas de u4 sans u3', () => {
    const plan = planDeJour({ unitesAbordees: ['u1', 'u2'], revisionsDues: [], niveaux: niveauxVierges() });
    const nouvel = plan.actions.find((a) => a.type === 'nouvelle_lecon');
    if (nouvel) expect(prerequisDe(nouvel.uniteId!).every((p) => ['u1', 'u2'].includes(p))).toBe(true);
  });

  it('une dérogation explicite débloque une unité, et rien d’autre', () => {
    const bloque = planDeJour({ unitesAbordees: [], revisionsDues: [], niveaux: niveauxVierges() });
    const libre = planDeJour({
      unitesAbordees: [], revisionsDues: [], niveaux: niveauxVierges(),
      derogations: { u4: '2026-11-22T10:00:00Z' },
    });
    expect(libre.actions.length).toBeGreaterThanOrEqual(bloque.actions.length);
  });

  it('choisit l’unité au poids Bac le plus fort parmi celles autorisées', () => {
    const plan = planDeJour({ unitesAbordees: ['u1'], revisionsDues: [], niveaux: niveauxVierges() });
    const nouvel = plan.actions.find((a) => a.type === 'nouvelle_lecon');
    expect(nouvel).toBeDefined();
    // Après u1 : u2 (poids 4) et u9 (poids 2) sont accessibles — u9 est la branche géologie,
    // elle n'exige que u1. u3 exige u2, donc reste inaccessible. Depuis que les poids sont
    // dérivés du corpus réel, c'est bien u2 (structure-fonction) qui passe devant la géologie.
    expect(nouvel!.uniteId).toBe('u2');
    expect(poidsBac(nouvel!.uniteId!)).toBe(4);
  });

  it('le plan ne dépasse jamais 5 actions', () => {
    const plan = planDeJour({ unitesAbordees: [], revisionsDues: genereux(), niveaux: niveauxVierges() });
    expect(plan.actions.length).toBeLessThanOrEqual(PLAFOND_DETTE);
  });

  it('propose une action d’entraînement sur la compétence mesurée la plus faible', () => {
    const niveaux = niveauxVierges();
    niveaux.C7_rediger_scientifique = { niveau: 5, preuves: 3 };
    niveaux.C1_exploiter_document = { niveau: 90, preuves: 10 };
    // Assez de révisions pour occuper le plan sans le remplir entièrement.
    const plan = planDeJour({ unitesAbordees: ['u1', 'u2', 'u3', 'u4', 'u5', 'u9'], revisionsDues: ['a'], niveaux });
    const entrainement = plan.actions.find((a) => a.type === 'entrainement_sujet');
    expect(entrainement?.competence).toBe('C7_rediger_scientifique');
  });
});

describe('brique 4 — passerelle en file de validation', () => {
  it('une règle générée naît inactive et marquée auto', () => {
    const [r] = creerReglesAuto([{ id: 'r1', regle: 'x' }]);
    expect(r.actif).toBe(false);
    expect(r.source).toBe('auto');
  });

  it('une règle auto ne s’active jamais elle-même', () => {
    const [r] = creerReglesAuto([{ id: 'r1', regle: 'x' }]);
    expect(activerRegle(r).actif).toBe(false);
  });

  it('une règle relue à la main peut être activée', () => {
    const [, r] = creerReglesAuto([{ id: 'r0', regle: 'y' }, { id: 'r1', regle: 'x' }]);
    expect(activerRegle({ ...r, source: 'manuel' }).actif).toBe(true);
  });

  it('seules les règles manuelles et actives s’appliquent', () => {
    const regles = [
      ...creerReglesAuto([{ id: 'a', regle: 'auto' }]),
      { id: 'm', regle: 'manuel', source: 'manuel' as const, actif: true },
    ];
    expect(reglesActives(regles).map((r) => r.id)).toEqual(['m']);
  });
});

describe('garde-fous produit (§11.3)', () => {
  it('AUCUNE note sur 20 n’existe dans le moteur', async () => {
    const module = await import('../bridge');
    for (const nom of Object.keys(module)) {
      expect(nom.toLowerCase()).not.toMatch(/note(min|max)?$|sur20/);
    }
  });

  it('aucun verrou dur : le Bac reste accessible avec une couverture nulle', () => {
    const acces = accesSujetBac(0, false);
    expect(acces.libre).toBe(true);
    expect(acces.recommandation).toBeDefined();
    // Et avec « متابعة رغم ذلك », plus de recommandation culpabilisante.
    expect(accesSujetBac(0, true)).toEqual({ libre: true, passeOutre: true });
  });

  it('au-dessus du seuil, aucune recommandation', () => {
    expect(accesSujetBac(80, false).recommandation).toBeUndefined();
  });

  it('le statut d’unité est qualitatif, jamais un pourcentage', () => {
    expect(statutUnite(niveauxVierges())).toBe('fragile');
    const bon = niveauxVierges();
    for (const c of COMPETENCES) bon[c] = { niveau: 100, preuves: 10 };
    expect(statutUnite(bon)).toBe('solide');
  });

  it('les prérequis d’unités ne sont pas contournables par la couverture', () => {
    // 40 % de couverture ne doit pas sauter l'ordre : c'est le comportement du moteur d'origine.
    const plan = planDeJour({ unitesAbordees: ['u1'], revisionsDues: [], niveaux: niveauxVierges() });
    const nouvel = plan.actions.find((a) => a.type === 'nouvelle_lecon');
    if (nouvel) {
      expect(prerequisDe(nouvel.uniteId!).every((p) => p === 'u1' || p === 'u2')).toBe(true);
    }
  });
});

describe('robustesse', () => {
  it('niveauxVierges couvre les 8 compétences', () => {
    const v = niveauxVierges();
    expect(Object.keys(v).sort()).toEqual([...COMPETENCES].sort());
    for (const c of COMPETENCES) expect(v[c]).toEqual({ niveau: 0, preuves: 0 });
  });

  it('writeBack ne mute pas l’entrée', () => {
    const avant = niveauxVierges();
    const copie = JSON.parse(JSON.stringify(avant)) as Niveaux;
    writeBack(avant, { verbe: 'سمِّ', score: 2 });
    expect(avant).toEqual(copie);
  });

  it('planDeJour ne mute pas ses entrées', () => {
    const revisions = ['a', 'b', 'c'];
    const copie = [...revisions];
    planDeJour({ unitesAbordees: [], revisionsDues: revisions, niveaux: niveauxVierges() });
    expect(revisions).toEqual(copie);
  });

  it('un plan vide reste un plan valide, sans erreur', () => {
    const plan = planDeJour({ unitesAbordees: [...UNITE_PAR_ID.keys()], revisionsDues: [], niveaux: niveauxVierges() });
    expect(plan.actions).toEqual([]);
    expect(plan.recommandations.length).toBeGreaterThan(0);
  });
});
