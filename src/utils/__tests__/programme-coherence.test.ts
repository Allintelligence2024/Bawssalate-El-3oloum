// Cohérence du programme : le chemin, les résumés dorés et les priorités doivent rester
// alignés : une leçon ajoutée ne doit pas passer sans résumé, titre ou priorité.
import { describe, it, expect } from 'vitest';
import { CHEMIN, LECONS_ENRICHISSEMENT, TOUTES_LECONS, TOTAL_LECONS, UNITES } from '../../data/programme';
import { LESSON_GOLD_SUMMARIES } from '../../data/lessonGoldSummaries';
import { PRIORITE_LECON } from '../../data/priorites';
import { TITRES_LECONS } from '../../data/programme';

describe('programme ↔ résumés dorés ↔ priorités', () => {
  it('chaque leçon servie a un résumé doré', () => {
    expect(TOUTES_LECONS.filter((id) => !LESSON_GOLD_SUMMARIES[id])).toEqual([]);
  });

  it('chaque leçon servie a une priorité Bac (aucune retombe sur le défaut 2 par oubli)', () => {
    expect(TOUTES_LECONS.filter((id) => !(id in PRIORITE_LECON))).toEqual([]);
  });

  it('chaque leçon servie a un titre lisible', () => {
    expect(TOUTES_LECONS.filter((id) => !(id in TITRES_LECONS))).toEqual([]);
  });

  it('aucune leçon servie deux fois (ni dans deux unités, ni chemin + enrichissement)', () => {
    const doublons = TOUTES_LECONS.filter((id, i) => TOUTES_LECONS.indexOf(id) !== i);
    expect(doublons).toEqual([]);
  });

  it('les leçons d’enrichissement ne sont pas dans le chemin verrouillé', () => {
    const dansLeChemin = CHEMIN.filter((c) => c.type === 'lecon').map((c) => (c as { id: string }).id);
    for (const id of LECONS_ENRICHISSEMENT) expect(dansLeChemin).not.toContain(id);
    // Les deux leçons de U11 absentes de la liste officielle des activités 3AS.
    expect(LECONS_ENRICHISSEMENT).toEqual(['phase22_chapitres_43_44', 'phase22_chapitres_43_44_2']);
  });

  it('TOTAL_LECONS compte le chemin (les enrichissements ne gonflent pas la progression)', () => {
    expect(TOTAL_LECONS).toBe(CHEMIN.filter((item) => item.type === 'lecon').length);
    expect(TOTAL_LECONS).toBe(TOUTES_LECONS.length - LECONS_ENRICHISSEMENT.length);
  });

  it('un prérequis d’unité est une vraie leçon, et il ouvre bien l’unité', () => {
    for (const u of UNITES) {
      for (const p of u.prerequis ?? []) {
        expect(LESSON_GOLD_SUMMARIES[p], `${u.id} : prérequis ${p} sans résumé`).toBeDefined();
        expect(u.lessonIds, `${u.id} : prérequis ${p} aussi dans lessonIds`).not.toContain(p);
        // Dans le chemin, le prérequis précède les leçons de son unité.
        const iPrerequis = CHEMIN.findIndex((c) => c.type === 'lecon' && c.id === p);
        const iPremiere = CHEMIN.findIndex((c) => c.type === 'lecon' && c.id === u.lessonIds[0]);
        expect(iPrerequis, `${u.id} : ${p} doit précéder la première leçon`).toBeLessThan(iPremiere);
      }
    }
  });
});
