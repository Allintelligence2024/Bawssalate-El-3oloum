// Profil C1–C8 (§11) — le moteur `bridge` branché sur le travail réel de l'élève.
//
// Défaut trouvé en revue : `bridge.ts` était complet et testé mais AUCUN écran ne
// l'importait. Le travail de l'entraîneur ne produisait donc rien d'exploitable.
// Ces tests figent le branchement et ses garde-fous.
import { describe, it, expect } from 'vitest';
import { profilCompetences, faiblessesMesurees, nombreEvaluations, LIBELLE_COMPETENCE } from '../profil';
import { COMPETENCES } from '../bridgeAdapter';
import { SUJETS_OFFICIELS } from '../../data/sujetsOfficiels';
import { construireGrille, cleConsigne } from '../entrainement';

const sujet = SUJETS_OFFICIELS.find((s) => s.id === '2023-1')!;
const premieres = construireGrille(sujet).consignes.slice(0, 4);

/** Évalue les n premières consignes du sujet à un niveau donné. */
const evaluer = (n: number, niveau: 0 | 1 | 2) => ({
  [sujet.id]: Object.fromEntries(premieres.slice(0, n).map((c) => [cleConsigne(c), niveau])),
});

describe('profil — reconstruction des niveaux', () => {
  it('sans évaluation, aucune compétence n’a de preuve', () => {
    const niveaux = profilCompetences({});
    for (const c of COMPETENCES) expect(niveaux[c].preuves).toBe(0);
  });

  it('chaque évaluation nourrit la compétence du verbe, et une seule', () => {
    const niveaux = profilCompetences(evaluer(1, 2));
    const nourries = COMPETENCES.filter((c) => niveaux[c].preuves > 0);
    expect(nourries).toHaveLength(1);
    expect(nourries[0]).toBe('C1_exploiter_document'); // « سمِّ » dans 2023-1
    expect(niveaux[nourries[0]].preuves).toBe(1);
  });

  it('est déterministe : deux appels donnent le même résultat', () => {
    const evals = evaluer(4, 1);
    expect(profilCompetences(evals)).toEqual(profilCompetences(evals));
  });

  it('ignore une clé qui ne correspond à aucune consigne', () => {
    const niveaux = profilCompetences({ [sujet.id]: { 'e99p99c99': 2 } });
    for (const c of COMPETENCES) expect(niveaux[c].preuves).toBe(0);
  });

  it('ignore un niveau hors {0,1,2} plutôt que de le convertir', () => {
    const niveaux = profilCompetences({ [sujet.id]: { [cleConsigne(premieres[0])]: 17 as unknown as 2 } });
    for (const c of COMPETENCES) expect(niveaux[c].preuves).toBe(0);
  });

  it('un score faible fait chuter la compétence, un score parfait la fait monter', () => {
    const bas = profilCompetences(evaluer(1, 0)).C1_exploiter_document.niveau;
    const haut = profilCompetences(evaluer(1, 2)).C1_exploiter_document.niveau;
    expect(haut).toBeGreaterThan(bas);
    expect(bas).toBe(0);
  });
});

describe('profil — faiblesses mesurées', () => {
  it('ne propose jamais une compétence sans preuve', () => {
    const faibles = faiblessesMesurees(evaluer(1, 0));
    expect(faibles).toHaveLength(1);
    expect(faibles[0].preuves).toBeGreaterThan(0);
  });

  it('plafonne à trois compétences', () => {
    // Tout le programme évalué au minimum : les huit compétences sont mesurées.
    const tout: Record<string, Record<string, 0 | 1 | 2>> = {};
    for (const s of SUJETS_OFFICIELS) {
      tout[s.id] = Object.fromEntries(construireGrille(s).consignes.map((c) => [cleConsigne(c), 0]));
    }
    expect(faiblessesMesurees(tout)).toHaveLength(3);
  });

  it('fournit des explications en arabe, jamais un pourcentage', () => {
    const [f] = faiblessesMesurees(evaluer(2, 1));
    expect(f.raisons.length).toBeGreaterThan(0);
    for (const r of f.raisons) {
      expect(r).not.toContain('%');
      expect(r).not.toMatch(/\/20/);
    }
  });

  it('aucun libellé de compétence n’est un identifiant technique', () => {
    for (const c of COMPETENCES) {
      expect(LIBELLE_COMPETENCE[c]).not.toContain('C1');
      expect(LIBELLE_COMPETENCE[c]).toMatch(/[\u0600-\u06FF]/);
    }
  });

  it('compte les évaluations tous sujets confondus', () => {
    expect(nombreEvaluations({})).toBe(0);
    expect(nombreEvaluations(evaluer(3, 2))).toBe(3);
  });
});
