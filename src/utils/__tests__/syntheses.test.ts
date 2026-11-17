// P1.3 — 11 situations de synthèse (une par unité), modèle 4–6 éléments, pièges tirés du programme
import { describe, it, expect } from 'vitest';
import { SITUATIONS_SYNTHESE, situationDeUnite } from '../../data/syntheses';
import { UNITES } from '../../data/programme';

describe('synthèses libres', () => {
  it('une situation par unité, complète, avec les pièges officiels de l’unité', () => {
    expect(SITUATIONS_SYNTHESE.map((s) => s.uniteId)).toEqual(UNITES.map((u) => u.id));
    for (const s of SITUATIONS_SYNTHESE) {
      expect(s.sujet.length).toBeGreaterThan(40);
      expect(s.question.length).toBeGreaterThan(30);
      expect(s.modele.length).toBeGreaterThanOrEqual(4);
      expect(s.modele.length).toBeLessThanOrEqual(6);
      expect(['T1', 'T2', 'T3', 'T4']).toContain(s.diagnostic.id);
      const u = UNITES.find((x) => x.id === s.uniteId)!;
      expect(s.pieges).toEqual(u.piegesAr);
      // aucune note / pourcentage dans les éléments de réponse (langue du jury, pas de barème machine)
      for (const m of s.modele) expect(m).not.toMatch(/%/);
    }
    expect(situationDeUnite('U4')?.uniteId).toBe('u4');
  });
});
