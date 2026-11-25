// «الباك خطوة بخطوة » : une consigne = une étape, 3/2/0 XP par étape, +6 par exercice.
// Ces tests protègent le lien structure ↔ corrigé et le calcul d'XP (aucune note sur 20).
import { describe, expect, it } from 'vitest';
import { SUJETS_OFFICIELS } from '../data/sujetsOfficiels';
import { etatVierge, type Etat } from '../types';
import { xpDe, VALEURS } from '../utils/xp';
import { avancementExercice, cleExercice, etapesDe, etapesFaites } from '../utils/bacPasAPas';

const sujet = SUJETS_OFFICIELS.find((s) => s.id === '2023-1')!;
const exercice2 = sujet.exercices.find((e) => e.numero === 2)!;

describe('الباك خطوة بخطوة', () => {
  it('transforme chaque consigne en étape, dans l’ordre du sujet', () => {
    const etapes = etapesDe(sujet, exercice2);
    const attendu = exercice2.parties.reduce((s, p) => s + p.consignes.length, 0);
    expect(etapes).toHaveLength(attendu);
    expect(etapes.map((e) => e.numero)).toEqual(etapes.map((_, i) => i + 1));
    expect(etapes[0].verbe).toBe('قارن');
    expect(etapes[0].partie).toBe('الجزء الأول');
    // Les clés sont uniques et stables (elles servent de clé de stockage).
    expect(new Set(etapes.map((e) => e.cle)).size).toBe(etapes.length);
    expect(etapes[0].cle).toBe('2023-1:2:0:0');
  });

  it('branche les éléments de réponse du corrigé quand ils existent', () => {
    const etapes = etapesDe(sujet, exercice2);
    const avecReponse = etapes.filter((e) => e.attendu.length > 0);
    expect(avecReponse.length).toBeGreaterThan(0);
    // Les étapes sans corrigé restent jouables : l'écran le dit, il n'invente rien.
    expect(etapes.every((e) => Array.isArray(e.attendu))).toBe(true);
  });

  it('compte 3/2/0 XP par étape puis +6 pour l’exercice fini', () => {
    const etapes = etapesDe(sujet, exercice2);
    const vide = etatVierge();
    expect(xpDe(vide)).toBe(0);

    const partiel: Etat = {
      ...vide,
      bacEtapes: { [etapes[0].cle]: 3, [etapes[1].cle]: 2 },
    };
    expect(xpDe(partiel)).toBe(5);
    expect(etapesFaites(partiel)).toBe(2);
    expect(avancementExercice(partiel, etapes).faites).toBe(2);
    expect(avancementExercice(partiel, etapes).terminee).toBe(false);

    const fini: Etat = {
      ...partiel,
      bacExercices: { [cleExercice(sujet.id, exercice2.numero)]: true },
    };
    expect(xpDe(fini)).toBe(5 + VALEURS.bacExercice);
  });

  it('ne compte jamais une qualité nulle comme une perte', () => {
    const vide = etatVierge();
    const rate: Etat = { ...vide, bacEtapes: { 'x:1:0:0': 0 } };
    expect(xpDe(rate)).toBe(0);
    expect(avancementExercice(rate, etapesDe(sujet, exercice2)).faites).toBe(0);
  });
});
