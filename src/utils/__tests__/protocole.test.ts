// P-1.5 (D5) — comptage des minutes en reprise de séance
// Scénario de l'audit externe : phase 1 validée (8 min) dans une session passée,
// l'élève quitte, revient, valide la phase 2 (3 min) → le total doit être 11, pas 19.
import { describe, it, expect } from 'vitest';
import { PROTOCOLE, minutesCumulees } from '../../data/protocole';

describe('protocole — minutesCumulees (P-1.5 : pas de double comptage)', () => {
  it('scénario de l\'audit : reprise après phase 1 → 8 + 3 = 11 min, pas 19', () => {
    // Session passée : phase 1 validée (8 min) → progression.minutes = 8, phases = [1]
    const minutesDepart = 8;
    const indiceDepart = 1; // la phase 1 est déjà comptée
    // En reprise, l'élève est sur la phase 2 (index 1) et la valide
    const indexPhase2 = 1;
    expect(minutesCumulees(minutesDepart, indiceDepart, indexPhase2)).toBe(11);
  });

  it('l\'ancien comportement (8 + slice(0, index+1)) donnait bien 19 — le bogue est identifié', () => {
    // Pour la trace : l'ancienne formule sommait les phases 1 ET 2 (8+3) par-dessus minutesDepart
    const ancien = 8 + PROTOCOLE.slice(0, 2).reduce((s, p) => s + p.dureeMin, 0);
    expect(ancien).toBe(19);
    expect(minutesCumulees(8, 1, 1)).not.toBe(ancien);
  });

  it('session neuve : chaque validation ajoute la phase courante au total', () => {
    // pas de progression → minutesDepart = 0, indiceDepart = 0
    expect(minutesCumulees(0, 0, 0)).toBe(PROTOCOLE[0].dureeMin);
    expect(minutesCumulees(0, 0, 1)).toBe(PROTOCOLE[0].dureeMin + PROTOCOLE[1].dureeMin);
  });

  it('fin de session : minutesDepart + toutes les phases de la session courante', () => {
    // reprise à la phase 3 (index 2), phases 3..6 validées dans cette session
    const faites = [1, 2]; // phases déjà comptées dans les sessions passées
    const minutesDepart = PROTOCOLE.slice(0, faites.length).reduce((s: number, p) => s + p.dureeMin, 0);
    const attendu = minutesDepart + PROTOCOLE.slice(2).reduce((s: number, p) => s + p.dureeMin, 0);
    expect(minutesCumulees(minutesDepart, 2, PROTOCOLE.length - 1)).toBe(attendu);
    // et c'est bien le total complet du protocole (invariant minutes = somme des phases validées)
    expect(attendu).toBe(PROTOCOLE.reduce((s, p) => s + p.dureeMin, 0));
  });
});
