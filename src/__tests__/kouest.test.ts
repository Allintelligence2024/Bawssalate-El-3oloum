// كويست اليوم : 3 étapes tirées du QCM réel de la leçon, options mélangées mais
// stables, et aucune étape inventée si la leçon n'a pas de QCM.
import { describe, expect, it } from 'vitest';
import { QCM_LECONS } from '../data/qcmLecons';
import { etatVierge } from '../types';
import { xpDe } from '../utils/xp';
import {
  etapesKouest,
  etapesReussies,
  leconDeLaQuete,
  contexteKouest,
} from '../utils/kouest';

const avecPiege = Object.keys(QCM_LECONS).find((id) => (QCM_LECONS[id].pieges?.length ?? 0) > 0)!;
const sansPiege = Object.keys(QCM_LECONS).find((id) => !(QCM_LECONS[id].pieges?.length ?? 0))!;

describe('كويست اليوم', () => {
  it('compose rappel → synthèse → piège quand la leçon en porte un', () => {
    const etapes = etapesKouest(avecPiege);
    expect(etapes.map((e) => e.type)).toEqual(['rappel', 'synthese', 'piege']);
    expect(etapes.every((e) => e.options.length === 4)).toBe(true);
    // La bonne réponse vient toujours de la banque, jamais d'une option inventée.
    expect(etapes[0].bonne).toBe(QCM_LECONS[avecPiege].rappel.options[0]);
    expect(etapes.every((e) => e.options.includes(e.bonne))).toBe(true);
  });

  it('n’invente pas de piège quand il n’y en a pas', () => {
    const etapes = etapesKouest(sansPiege);
    expect(etapes.map((e) => e.type)).toEqual(['rappel', 'synthese']);
  });

  it('mélange de façon stable : même clé, même ordre', () => {
    const a = etapesKouest(avecPiege).map((e) => e.options.join('|'));
    const b = etapesKouest(avecPiege).map((e) => e.options.join('|'));
    expect(a).toEqual(b);
    // Les options sont bien mélangées (la bonne n'est pas toujours la première).
    const etapes = etapesKouest(avecPiege);
    expect(etapes.some((e) => e.options[0] !== e.bonne)).toBe(true);
  });

  it('rend un tableau vide pour une leçon inconnue (l’écran saute la quête)', () => {
    expect(etapesKouest('lecon-inexistante')).toEqual([]);
  });

  it('compte une réussite par étape et 3 XP par étape', () => {
    const etapes = etapesKouest(avecPiege);
    const base = etatVierge();
    expect(etapesReussies(base, avecPiege)).toBe(0);
    expect(xpDe(base)).toBe(0);

    const aprés = {
      ...base,
      drills: { [etapes[0].cle]: true as const, [etapes[1].cle]: true as const },
    };
    expect(etapesReussies(aprés, avecPiege)).toBe(2);
    expect(xpDe(aprés)).toBe(6);
  });

  it('vise la leçon proposée par le moteur', () => {
    const base = etatVierge();
    const lecon = leconDeLaQuete(base);
    expect(lecon).toBeTruthy();
    const ctx = contexteKouest(lecon!);
    expect(ctx.lecon.length).toBeGreaterThan(0);
    expect(ctx.unite).toContain('الوحدة');
  });
});
