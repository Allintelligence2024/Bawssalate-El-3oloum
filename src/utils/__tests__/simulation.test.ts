// Simulation Bac 270 min (§10.4) — le temps, jamais la note.
import { describe, it, expect } from 'vitest';
import {
  allouerTemps, formatDuree, alerte, conclureSimulation, syntheseAr,
  DUREE_BAC_MIN, MINUTES_RELECTURE,
} from '../simulation';
import { SUJETS_OFFICIELS } from '../../data/sujetsOfficiels';

const sujet = SUJETS_OFFICIELS.find((s) => s.id === '2023-1')!;

describe('simulation — allocation du temps', () => {
  it('dure 270 min au total', () => {
    expect(DUREE_BAC_MIN).toBe(270);
  });

  it('réserve la relecture avant de répartir', () => {
    const alloc = allouerTemps(sujet);
    const total = alloc.reduce((n, a) => n + a.minutes, 0);
    expect(total).toBe(DUREE_BAC_MIN - MINUTES_RELECTURE);
  });

  it('répartit au prorata du barème réel, pas à parts égales', () => {
    const alloc = allouerTemps(sujet);
    const [e1, e2, e3] = sujet.exercices;
    expect(alloc).toHaveLength(3);
    // Le sujet 2023-1 n'a pas un barème égal : l'exercice le plus lourd reçoit le plus.
    const plusLourd = alloc.reduce((a, b) => (a.bareme >= b.bareme ? a : b));
    const plusLeger = alloc.reduce((a, b) => (a.bareme <= b.bareme ? a : b));
    if (e1.bareme !== e2.bareme || e2.bareme !== e3.bareme) {
      expect(plusLourd.minutes).toBeGreaterThan(plusLeger.minutes);
    }
    expect(alloc.map((a) => a.numero)).toEqual([1, 2, 3]);
  });

  it('les fins conseillées sont croissantes', () => {
    const alloc = allouerTemps(sujet);
    for (let i = 1; i < alloc.length; i++) {
      expect(alloc[i].finConseillee).toBeGreaterThan(alloc[i - 1].finConseillee);
    }
  });

  it('supporte un barème nul sans diviser par zéro', () => {
    const faux = { exercices: [{ numero: 1, bareme: 0 }] } as unknown as Parameters<typeof allouerTemps>[0];
    expect(allouerTemps(faux)).toEqual([]);
  });

  it('supporte une durée personnalisée (entraînement plus court)', () => {
    const alloc = allouerTemps(sujet, 90);
    expect(alloc.reduce((n, a) => n + a.minutes, 0)).toBe(90 - MINUTES_RELECTURE);
  });
});

describe('simulation — horloge', () => {
  it('formate les durées en horloge, jamais en pourcentage', () => {
    expect(formatDuree(0)).toBe('0:00:00');
    expect(formatDuree(432)).toBe('0:07:12');
    expect(formatDuree(270 * 60)).toBe('4:30:00');
    expect(formatDuree(-30)).toBe('0:00:00');
  });

  it('passe en attention dans le dernier quart d’heure', () => {
    expect(alerte(60 * 60)).toBe('calme');
    expect(alerte(15 * 60)).toBe('attention');
    expect(alerte(1)).toBe('attention');
  });

  it('dépasser n’est pas une faute : le chrono continue de compter', () => {
    expect(alerte(0)).toBe('depasse');
    expect(formatDuree(-90)).toBe('0:00:00');
  });
});

describe('simulation — synthèse', () => {
  const alloc = allouerTemps(sujet);

  it('ne parle que de temps et de complétude', () => {
    const r = conclureSimulation(alloc, [], 0, false);
    expect(r).toEqual({ minutesUtilisees: 0, exercicesTermines: 0, exercicesTotal: 3, depassements: [], relectureFaite: false });
    const texte = JSON.stringify(r).toLowerCase();
    expect(texte).not.toMatch(/note|sur20|\/20|moyenne/);
  });

  it('repère les dépassements, du pire au moindre', () => {
    const r = conclureSimulation(
      alloc,
      [
        { numero: 1, minutesPassees: alloc[0].minutes + 40, termine: true },
        { numero: 2, minutesPassees: alloc[1].minutes + 5, termine: true },
        { numero: 3, minutesPassees: alloc[2].minutes, termine: false },
      ],
      300,
      true,
    );
    expect(r.depassements[0].numero).toBe(1);
    expect(r.depassements[0].minutesEnPlus).toBe(40);
    expect(r.depassements[1].minutesEnPlus).toBe(5);
    expect(r.exercicesTermines).toBe(2);
    expect(r.relectureFaite).toBe(true);
  });

  it('n’invente pas de dépassement quand l’élève est dans les temps', () => {
    const r = conclureSimulation(alloc, [{ numero: 1, minutesPassees: 10, termine: true }], 10, false);
    expect(r.depassements).toEqual([]);
  });

  it('la phrase arabe ne juge pas et ne note pas', () => {
    const r = conclureSimulation(alloc, [{ numero: 1, minutesPassees: 100, termine: true }], 100, false);
    const t = syntheseAr(r);
    // Le seul « point » que la phrase peut contenir est « نقطة » dans le cas zéro exercice ;
    // ici l'élève a travaillé, la phrase parle donc uniquement d'organisation.
    expect(t).toContain('دقيقة');
    expect(t).not.toMatch(/نقطة|20|معدّل/);
  });

  it('ne dit rien d’humiliant si rien n’a été terminé', () => {
    const t = syntheseAr(conclureSimulation(alloc, [], 20, false));
    expect(t).toContain('ليست نقطة');
    expect(t).toContain('أعِد');
  });

  it('rappelle la relecture quand elle a manqué', () => {
    const t = syntheseAr(conclureSimulation(alloc, [{ numero: 1, minutesPassees: 10, termine: true }], 10, false));
    expect(t).toContain('ربع ساعة');
  });

  it('ne produit jamais de NaN quand les constats sont incomplets', () => {
    const r = conclureSimulation(alloc, [], 0, false);
    expect(Number.isFinite(r.minutesUtilisees)).toBe(true);
    expect(r.exercicesTermines).toBe(0);
  });
});
