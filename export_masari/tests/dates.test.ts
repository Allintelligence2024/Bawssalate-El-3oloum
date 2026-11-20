// Tests des utilitaires de dates (latins, zéro %) — P0.4
import { describe, it, expect } from 'vitest';
import {
  nb,
  nbMin,
  nbGrand,
  joursNb,
  minutesNb,
  compteLecons,
  compteLeconsAdj,
  formatJourAr,
  formatCourteAr,
  aujourdhui,
  ajouterJours,
  differenceJours,
  salue,
} from '../dates';

describe('dates — chiffres latins, zéro %', () => {
  it('nb renvoie la chaîne du nombre', () => {
    expect(nb(42)).toBe('42');
  });

  it('joursNb: 1 يوم / 2 يوم / 5 أيام / 12 يومًا', () => {
    expect(joursNb(1)).toBe('1 يوم');
    expect(joursNb(2)).toBe('2 يوم');
    expect(joursNb(5)).toBe('5 أيام');
    expect(joursNb(12)).toBe('12 يومًا');
    expect(joursNb(0)).toBe('ابدأ اليوم');
  });

  it('minutesNb: 0 دقيقة / 2 دقيقة / 4 دقائق', () => {
    expect(minutesNb(0)).toBe('0 دقيقة');
    expect(minutesNb(2)).toBe('2 دقيقة');
    expect(minutesNb(4)).toBe('4 دقائق');
  });

  it('compteLecons: 1 / 2 / 4 / 11 دروس', () => {
    expect(compteLecons(1)).toBe('1 درس');
    expect(compteLecons(2)).toBe('2 درس');
    expect(compteLecons(4)).toBe('4 دروس');
    expect(compteLecons(11)).toBe('11 درسًا');
  });

  it('compteLeconsAdj: 1 درس un / 2 درس deux / 4 دروس plus', () => {
    expect(compteLeconsAdj(1, 'un', 'deux', 'plus', 'accordé')).toBe('1 درس un');
    expect(compteLeconsAdj(2, 'un', 'deux', 'plus', 'accordé')).toBe('2 درس deux');
    expect(compteLeconsAdj(4, 'un', 'deux', 'plus', 'accordé')).toBe('4 دروس plus');
  });
});

describe('dates — formats arabes', () => {
  it('formatJourAr: « الثلاثاء 5 أكتوبر 2026 »', () => {
    const iso = '2026-10-05';
    const s = formatJourAr(iso);
    expect(s).toContain('5');
    expect(s).toContain('أكتوبر');
    expect(s).toContain('2026');
  });

  it('formatCourteAr: « 5 أكتوبر »', () => {
    expect(formatCourteAr('2026-10-05')).toContain('5');
    expect(formatCourteAr('2026-10-05')).toContain('أكتوبر');
  });

  it('aujourdhui renvoie une chaîne ISO valide', () => {
    const s = aujourdhui();
    expect(s).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('ajouterJours: +1, +3, +7', () => {
    expect(ajouterJours('2026-11-16', 1)).toBe('2026-11-17');
    expect(ajouterJours('2026-11-16', 3)).toBe('2026-11-19');
    expect(ajouterJours('2026-11-14', 7)).toBe('2026-11-21');
  });

  it('differenceJours: calcule la différence en jours', () => {
    expect(differenceJours('2026-11-16', '2026-11-16')).toBe(0);
    expect(differenceJours('2026-11-16', '2026-11-19')).toBe(3);
    expect(differenceJours('2026-11-19', '2026-11-16')).toBe(-3);
  });

  it('salue: salutation par heure', () => {
    expect(salue()).toMatch(/^(صباح الخير|مساء الخير)$/);
  });
});
