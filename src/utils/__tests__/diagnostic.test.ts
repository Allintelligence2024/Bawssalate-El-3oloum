// P2.1 — test de positionnement : sélection déterministe, évaluation par unité, aucun effet sur le chemin
import { describe, it, expect } from 'vitest';
import type { Etat } from '../../types';
import { evaluerDiagnostic, bilanDiagnostic, niveauUnite, messageAccueil } from '../diagnostic';
import { questionsDiagnostic } from '../diagnosticQuestions';
import { UNITES } from '../../data/programme';
import { itemVerrouille, prochainItem } from '../moteur';
import { CHEMIN } from '../../data/programme';

function vierge(extra: Partial<Etat> = {}): Etat {
  return {
    version: 2, progression: {}, jalons: {}, notes: [], carnet: [], journal: [], minutesTotales: 0, revisions: 0,
    nom: 'x', dateBac: '2027-06-10', seancesComptees: 0, ateliers: {}, consentementSync: false, ...extra,
  };
}

describe('diagnostic (P2.1)', () => {
  it('22 questions : 2 par unité, 4 options chacune, déterministes', () => {
    const qs = questionsDiagnostic();
    expect(qs.length).toBe(2 * UNITES.length);
    for (const u of UNITES) expect(qs.filter((q) => q.uniteId === u.id).length).toBe(2);
    expect(qs.every((q) => q.options.length === 4)).toBe(true);
    expect(questionsDiagnostic()).toEqual(qs);
  });

  it('évalue par unité : 0 = bonne réponse (ordre du banc), null = sans réponse', () => {
    const qs = questionsDiagnostic();
    const reponses = qs.map((_, i) => (i % 2 === 0 ? 0 : null));
    const d = evaluerDiagnostic(qs, reponses, '2026-11-16');
    for (const u of UNITES) expect(d.parUnite[u.id]).toEqual({ justes: 1, total: 2 });
    expect(niveauUnite({ justes: 2, total: 2 })).toBe('force');
    expect(niveauUnite({ justes: 0, total: 2 })).toBe('fragile');
    expect(niveauUnite({ justes: 1, total: 2 })).toBe('moyen');
  });

  it('bilan en mots + message d\'accueil sans chiffre ni pourcentage', () => {
    const qs = questionsDiagnostic();
    // u6 : deux erreurs (fragile) ; toutes les autres unités : 2/2 (force)
    const reponses = qs.map((q) => (q.uniteId === 'u6' ? 2 : 0));
    const d = evaluerDiagnostic(qs, reponses, '2026-11-16');
    const b = bilanDiagnostic(d);
    expect(b.fortes).toContain('u1');
    expect(b.fragiles).toEqual(['u6']);
    const msg = messageAccueil(vierge({ diagnostic: d }))!;
    expect(msg).toMatch(/التموضع/);
    expect(msg).not.toMatch(/%|\d/);
  });

  it('ne déverrouille rien : le chemin est identique avec ou sans diagnostic', () => {
    const qs = questionsDiagnostic();
    const parfait = evaluerDiagnostic(qs, qs.map(() => 0), '2026-11-16');
    const avec = vierge({ diagnostic: parfait });
    const sans = vierge();
    expect(prochainItem(avec)).toEqual(prochainItem(sans));
    expect(CHEMIN.map((c) => itemVerrouille(avec, c))).toEqual(CHEMIN.map((c) => itemVerrouille(sans, c)));
  });
});
