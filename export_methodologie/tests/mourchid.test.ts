// P3.5 — المرشد الموسّع : 25 questions, 5 branches, liens internes valides, aucun pourcentage
import { describe, it, expect } from 'vitest';
import { BRANCHES, QUESTIONS, questionsDeBranche, questionParId } from '../../data/mourchid';

describe('mourchid', () => {
  it('25 questions réparties sur 5 branches, 5 par branche, ids uniques', () => {
    expect(QUESTIONS.length).toBe(25);
    expect(BRANCHES.length).toBe(5);
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(25);
    for (const b of BRANCHES) expect(questionsDeBranche(b.id).length).toBe(5);
  });
  it('chaque « voir aussi » pointe vers une question existante et différente ; chaque réponse a ≥ 2 paragraphes sans %', () => {
    for (const q of QUESTIONS) {
      expect(BRANCHES.some((b) => b.id === q.branche), q.id).toBe(true);
      expect(q.reponse.length, q.id).toBeGreaterThanOrEqual(2);
      for (const p of q.reponse) expect(p, q.id).not.toMatch(/%|٪/);
      for (const v of q.voirAussi ?? []) {
        expect(v, `${q.id} → ${v}`).not.toBe(q.id);
        expect(questionParId(v), `${q.id} → ${v}`).toBeDefined();
      }
    }
  });
});
