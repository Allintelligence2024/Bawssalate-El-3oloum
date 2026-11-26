// P1.1 phase 2 — عناصر الإجابة (2023) : chaque réponse pointe vers une consigne existante, points cohérents avec le barème
import { describe, it, expect } from 'vitest';
import { SUJETS_CORRIGES, corrigeDe, CORRIGES_ACTIVES } from '../../data/sujetsCorriges';
import { SUJETS_OFFICIELS } from '../../data/sujetsOfficiels';

describe('corrigés officiels (phase 2)', () => {
  it('chaque sujet officiel a un corrigé aligné sur la structure, somme des points = barème de l\'exercice', () => {
    expect(CORRIGES_ACTIVES).toBe(true);
    const ids = SUJETS_CORRIGES.map((c) => c.sujetId);
    expect(new Set(ids).size).toBe(ids.length);
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
        expect(total, `${c.sujetId}/ex${ex.numero}`).toBe(ex.baremeCorrige ?? e.bareme);
      }
    }
    for (const s of SUJETS_OFFICIELS) expect(ids, `corrigé manquant pour ${s.id}`).toContain(s.id);
    expect(corrigeDe('2023-1')).toBeDefined();
    expect(corrigeDe('1999-1')).toBeUndefined();
  });
});

it('conserve les distinctions scientifiques corrigées dans les annales ciblées', () => {
  const ex = SUJETS_OFFICIELS.find((s) => s.id === '2016-2')!.exercices[1];
  expect(ex.unites).toEqual(['u6']);
  expect(ex.parties[0].contexte).toContain('صانعة خضراء');
  const texte2021 = JSON.stringify(corrigeDe('2021-2'));
  expect(texte2021).toContain('استبدال U بـ A');
  expect(texte2021).not.toContain('استبدال A بـ U في الرامزة 6');
  const texte2017x = JSON.stringify(corrigeDe('2017x-1'));
  expect(texte2017x).not.toContain('LT8 تعرّفًا مزدوجًا بفضل TCR على المحدّد المعروض على HLA II');
});
