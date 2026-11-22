// Télémétrie locale (§12.1) — anonyme par construction, pas par promesse.
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  telemetrieVierge, entrerPhase, sortirPhase, incrementer, mediane, tauxAbandon,
  rapportPilote, lireTelemetrie, rapportSansDonneePersonnelle, CLE_TELEMETRIE,
  phaseDepuisId, consignerPhase, consignerCompteur,
  type Telemetrie,
} from '../telemetrie';

const T = '2026-11-22T10:00:00Z';

describe('télémétrie — comptage', () => {
  it('démarre à zéro sur les 6 phases', () => {
    const t = telemetrieVierge();
    expect(Object.keys(t.phases)).toEqual(['P1', 'P2', 'P3', 'P4', 'P5', 'P6']);
    for (const p of Object.values(t.phases)) expect(p).toEqual({ entrees: 0, abandons: 0, durees: [] });
  });

  it('compte les entrées et fixe la fenêtre', () => {
    const t = entrerPhase(telemetrieVierge(), 'P2', T);
    expect(t.phases.P2.entrees).toBe(1);
    expect(t.debut).toBe(T);
    expect(t.fin).toBe(T);
  });

  it('la fenêtre garde la première entrée comme début', () => {
    let t = entrerPhase(telemetrieVierge(), 'P1', '2026-11-20T10:00:00Z');
    t = entrerPhase(t, 'P2', '2026-11-22T10:00:00Z');
    expect(t.debut).toBe('2026-11-20T10:00:00Z');
    expect(t.fin).toBe('2026-11-22T10:00:00Z');
  });

  it('une sortie terminée n’est pas un abandon', () => {
    const t = sortirPhase(telemetrieVierge(), 'P3', 120, true, T);
    expect(t.phases.P3.abandons).toBe(0);
    expect(t.phases.P3.durees).toEqual([120]);
  });

  it('une sortie non terminée compte un abandon', () => {
    const t = sortirPhase(telemetrieVierge(), 'P3', 30, false, T);
    expect(t.phases.P3.abandons).toBe(1);
  });

  it('borne les durées à 2 h et ne garde que les 200 dernières', () => {
    let t = telemetrieVierge();
    t = sortirPhase(t, 'P1', 99_999, true, T);
    expect(t.phases.P1.durees[0]).toBe(7200);
    for (let i = 0; i < 250; i++) t = sortirPhase(t, 'P1', i, true, T);
    expect(t.phases.P1.durees).toHaveLength(200);
    expect(t.phases.P1.durees.at(-1)).toBe(249);
  });

  it('incrémente les compteurs simples', () => {
    let t = telemetrieVierge();
    t = incrementer(t, 'blocagesPortes');
    t = incrementer(t, 'indicesMurshid', 5);
    expect(t.blocagesPortes).toBe(1);
    expect(t.indicesMurshid).toBe(5);
  });

  it('ne mute jamais l’entrée', () => {
    const avant = telemetrieVierge();
    const copie = JSON.parse(JSON.stringify(avant));
    entrerPhase(avant, 'P1', T);
    incrementer(avant, 'modeIntensif');
    expect(avant).toEqual(copie);
  });
});

describe('télémétrie — agrégats', () => {
  it('calcule la médiane, pair et impair', () => {
    expect(mediane([3])).toBe(3);
    expect(mediane([5, 1, 3])).toBe(3);
    expect(mediane([1, 2, 3, 4])).toBe(3);
    expect(mediane([])).toBe(0);
  });

  it('calcule un taux d’abandon sans diviser par zéro', () => {
    expect(tauxAbandon(telemetrieVierge(), 'P1')).toBe(0);
    let t = entrerPhase(telemetrieVierge(), 'P1', T);
    t = entrerPhase(t, 'P1', T);
    t = sortirPhase(t, 'P1', 10, false, T);
    expect(tauxAbandon(t, 'P1')).toBe(0.5);
  });

  it('le taux d’abandon reste dans [0, 1]', () => {
    let t = telemetrieVierge();
    for (let i = 0; i < 5; i++) { t = entrerPhase(t, 'P2', T); t = sortirPhase(t, 'P2', 1, false, T); }
    const taux = tauxAbandon(t, 'P2');
    expect(taux).toBeGreaterThanOrEqual(0);
    expect(taux).toBeLessThanOrEqual(1);
  });
});

describe('télémétrie — rapport exportable', () => {
  const t = (() => {
    let x = entrerPhase(telemetrieVierge(), 'P1', T);
    x = sortirPhase(x, 'P1', 600, true, T);
    x = entrerPhase(x, 'P2', T);
    x = sortirPhase(x, 'P2', 60, false, T);
    x = incrementer(x, 'indicesMurshid', 3);
    return x;
  })();

  it('contient un format et une version identifiables', () => {
    const r = rapportPilote(t, T);
    expect(r.format).toBe('kunz-rapport-pilote');
    expect(r.version).toBe(1);
    expect(r.genereLe).toBe(T);
  });

  it('exporte des médianes, pas les durées brutes', () => {
    const r = rapportPilote(t, T);
    expect(r.phases.P1.dureeMedianeSecondes).toBe(600);
    expect(JSON.stringify(r)).not.toContain('"durees"');
  });

  it('ne contient aucune donnée personnelle', () => {
    // On injecte volontairement des données identifiantes dans une télémétrie corrompue :
    // elles ne doivent pas ressortir dans le rapport.
    const piege: Telemetrie = { ...t } as Telemetrie;
    (piege as unknown as Record<string, unknown>).email = 'eleve@example.com';
    (piege as unknown as Record<string, unknown>).nom = 'Ahmed';
    const r = rapportPilote(piege, T);
    expect(rapportSansDonneePersonnelle(r)).toBe(true);
    expect(JSON.stringify(r)).not.toContain('eleve@example.com');
  });

  it('le rapport dit lui-même qu’il est anonyme et non envoyé', () => {
    expect(rapportPilote(t, T).avertissementAnonymat).toMatch(/مجهول/);
    expect(rapportPilote(t, T).avertissementAnonymat).toMatch(/لا يُرسَل/);
  });

  it('n’emploie nulle part le vocabulaire de la note scolaire', () => {
    // Le rapport ne doit contenir ni « note », ni « /20 » : ce serait réintroduire par la
    // petite porte la note prédite que la Phase 11 interdit.
    const texte = JSON.stringify(rapportPilote(t, T)).toLowerCase();
    expect(texte).not.toMatch(/\bnote\b/);
    expect(texte).not.toContain('/20');
  });
});

describe('télémétrie — lecture défensive', () => {
  it('relit une télémétrie valide', () => {
    const t = incrementer(telemetrieVierge(), 'blocagesPortes', 4);
    expect(lireTelemetrie(JSON.stringify(t)).blocagesPortes).toBe(4);
  });

  it('repart de zéro sur JSON corrompu, sans lever', () => {
    expect(lireTelemetrie('{pas du json')).toEqual(telemetrieVierge());
    expect(lireTelemetrie('null')).toEqual(telemetrieVierge());
    expect(lireTelemetrie(null)).toEqual(telemetrieVierge());
  });

  it('rejette une version inconnue', () => {
    expect(lireTelemetrie(JSON.stringify({ version: 99 }))).toEqual(telemetrieVierge());
  });

  it('nettoie les valeurs absurdes (négatifs, NaN, durées hors bornes)', () => {
    const brut = JSON.stringify({
      version: 1,
      phases: { P1: { entrees: -5, abandons: 'x', durees: [-10, 5, 1e9, 30] } },
      blocagesPortes: -2,
    });
    const t = lireTelemetrie(brut);
    expect(t.phases.P1.entrees).toBe(0);
    expect(t.phases.P1.abandons).toBe(0);
    expect(t.phases.P1.durees).toEqual([5, 30]);
    expect(t.blocagesPortes).toBe(0);
  });

  it('la clé de stockage est propre à la télémétrie', () => {
    expect(CLE_TELEMETRIE).toBe('kunz_telemetrie_v1');
  });
});

describe('télémétrie — pont applicatif', () => {
  // Environnement `node` (vitest.config.ts) : pas de localStorage, on en fournit un
  // minimal — même approche que carnet-boussole.test.ts.
  let stockage: Map<string, string>;
  beforeEach(() => {
    stockage = new Map();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => stockage.get(k) ?? null,
      setItem: (k: string, v: string) => { stockage.set(k, String(v)); },
      removeItem: (k: string) => { stockage.delete(k); },
      clear: () => { stockage.clear(); },
    });
  });

  it('l’id de phase est ramené dans 1..6', () => {
    expect(phaseDepuisId(1)).toBe('P1');
    expect(phaseDepuisId(6)).toBe('P6');
    expect(phaseDepuisId(0)).toBe('P1');
    expect(phaseDepuisId(9)).toBe('P6');
    expect(phaseDepuisId(3.7)).toBe('P3');
  });

  it('consigne une entrée puis une sortie dans le stockage local', () => {
    localStorage.clear();
    consignerPhase('entree', 2, T);
    consignerPhase('sortie', 2, 90, false, T);
    const t = lireTelemetrie(localStorage.getItem(CLE_TELEMETRIE));
    expect(t.phases.P2.entrees).toBe(1);
    expect(t.phases.P2.abandons).toBe(1);
    expect(t.phases.P2.durees).toEqual([90]);
  });

  it('n’accumule pas de session fantôme si l’entrée est rejouée', () => {
    localStorage.clear();
    consignerPhase('entree', 1, T);
    consignerPhase('entree', 1, T);
    expect(lireTelemetrie(localStorage.getItem(CLE_TELEMETRIE)).phases.P1.entrees).toBe(2);
  });

  it('ne lève jamais, même si le stockage est corrompu', () => {
    localStorage.setItem(CLE_TELEMETRIE, '{cassé');
    expect(() => consignerPhase('sortie', 4, 10, true, T)).not.toThrow();
    expect(lireTelemetrie(localStorage.getItem(CLE_TELEMETRIE)).phases.P4.durees).toEqual([10]);
  });

  it('compte un compteur simple sans lever', () => {
    localStorage.clear();
    consignerCompteur('indicesMurshid');
    consignerCompteur('indicesMurshid', 2);
    expect(lireTelemetrie(localStorage.getItem(CLE_TELEMETRIE)).indicesMurshid).toBe(3);
  });
});
