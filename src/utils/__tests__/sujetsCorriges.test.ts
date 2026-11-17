// P1.1 phase 2 — عناصر الإجابة (2023) : chaque réponse pointe vers une consigne existante, points cohérents avec le barème
import { describe, it, expect } from 'vitest';
import { SUJETS_CORRIGES, corrigeDe, CORRIGES_ACTIVES } from '../../data/sujetsCorriges';
import { SUJETS_OFFICIELS } from '../../data/sujetsOfficiels';

describe('corrigés officiels (phase 2)', () => {
  it('2023 : les deux sujets ont un corrigé aligné sur la structure, somme des points = barème de l\'exercice', () => {
    expect(CORRIGES_ACTIVES).toBe(true);
    expect(SUJETS_CORRIGES.map((c) => c.sujetId)).toEqual(['2023-1', '2023-2']);
    for (const c of SUJETS_CORRIGES) {
      const sujet = SUJETS_OFFICIELS.find((s) => s.id === c.sujetId)!;
      expect(sujet).toBeDefined();
      expect(c.source).toContain('ديوان الوطني');
      for (const ex of c.exercices) {
        const e = sujet.exercices.find((x) => x.numero === ex.numero)!;
        expect(ex.parties.length).toBe(e.parties.length);
        let total = 0;
        ex.parties.forEach((p, i) => {
          for (const r of p.reponses) {
            expect(e.parties[i].consignes[r.consigne], `${c.sujetId}/${ex.numero}/${i}/${r.consigne}`).toBeDefined();
            expect(r.attendu.length).toBeGreaterThan(0);
            for (const a of r.attendu) expect(a.length).toBeGreaterThan(10);
            total += r.points ?? 0;
          }
        });
        expect(total, `${c.sujetId}/ex${ex.numero}`).toBe(e.bareme);
      }
    }
    expect(corrigeDe('2023-1')).toBeDefined();
    expect(corrigeDe('2022-1')).toBeUndefined();
  });
});
