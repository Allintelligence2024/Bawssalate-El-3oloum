// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { createElement, useRef } from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { etatVierge, progressionVierge, type Etat } from '../../types';
import {
  BOUSSOLE_EVENT_TYPE,
  BOUSSOLE_SCHEMA_VERSION,
  BOUSSOLE_SOURCE,
  parseBoussoleEvent,
  type BoussoleAttemptEvent,
} from '../../types/boussoleBridge';
import {
  appliquerEvenementBoussole,
  demoterProgressionDepuisKafaa,
  MAX_BOUSSOLE_EVENTS_SEEN,
} from '../boussoleAdapter';
import { enregistrerDrillReussi, erreursDrill, estDrillFait } from '../drills';
import { lireSauvegarde } from '../backup';
import { UNITE_PAR_ID } from '../../data/programme';
import {
  choisirEnqueteExamBlanc,
  ENQUETES_BAC,
  MICRO_EPREUVES_UNITE,
} from '../../data/enquetesBac';
import { useBoussoleBridge } from '../../hooks/useBoussoleBridge';

function creerEvt(overrides: Partial<BoussoleAttemptEvent> = {}): BoussoleAttemptEvent {
  return {
    type: BOUSSOLE_EVENT_TYPE,
    schemaVersion: BOUSSOLE_SCHEMA_VERSION,
    source: BOUSSOLE_SOURCE,
    attemptId: 'att-12345678-aaaa-bbbb',
    exerciseId: 'boussole:protein',
    unitId: 'u1',
    verbe: 'استنتج',
    titre: 'تركيب البروتين · لامينين مكتمل',
    reussi: true,
    prompt: 'أيّ استنتاج يسنده العمودان؟',
    choix: 'زاد التعبير عن البروتين المكتمل بين الشرطين',
    timestamp: '2026-11-21T15:00:00.000Z',
    ...overrides,
  };
}

describe('Lot 5A — Contrat typé, idempotence et règle « Preuve ≠ Complétion »', () => {
  it('rejette les messages invalides, mauvaise version ou mauvaise source', () => {
    expect(parseBoussoleEvent(null)).toBeNull();
    expect(parseBoussoleEvent({ type: 'autre' })).toBeNull();
    expect(parseBoussoleEvent({ ...creerEvt(), schemaVersion: 2 })).toBeNull();
    expect(parseBoussoleEvent({ ...creerEvt(), source: 'intrus' })).toBeNull();
    expect(parseBoussoleEvent({ ...creerEvt(), attemptId: 'court' })).toBeNull();
    expect(parseBoussoleEvent({ ...creerEvt(), unitId: 'u99' })).toBeNull();
    expect(parseBoussoleEvent(creerEvt())).not.toBeNull();
  });

  it('applique une réussite Boussole dans kafaa SANS jamais marquer une leçon terminée ni un jalon fait', () => {
    const base = etatVierge();
    const evt = creerEvt({ reussi: true, unitId: 'u1' });
    const maj = appliquerEvenementBoussole(base, evt, '2026-11-21');

    expect(maj.kafaa?.['boussole:protein']).toBeDefined();
    expect(maj.kafaa?.['boussole:protein'].repetitions).toBe(1);
    expect(maj.kafaa?.['boussole:protein'].fragile).toBe(false);
    // Règle absolue : Preuve ≠ Complétion
    for (const lid of UNITE_PAR_ID.u1.lessonIds) {
      expect(maj.progression[lid]?.statut).not.toBe('terminee');
    }
    expect(maj.jalons.u1?.fait).not.toBe(true);
    expect(maj.boussoleEventsSeen).toContain(`boussole:${evt.attemptId}`);
  });

  it('est strictement idempotent sur attemptId et borne la file à 500 entrées', () => {
    const base = etatVierge();
    const evt = creerEvt({ reussi: false, erreurTag: 'فرق بين النسبة وتسلسل المورّثة' });
    const once = appliquerEvenementBoussole(base, evt, '2026-11-21');
    const twice = appliquerEvenementBoussole(once, evt, '2026-11-21');

    expect(twice).toBe(once);
    expect(twice.carnet?.length).toBe(1);

    // Vérification du plafond 500
    const sature: Etat = {
      ...base,
      boussoleEventsSeen: Array.from({ length: MAX_BOUSSOLE_EVENTS_SEEN }, (_, i) => `old-event-${i.toString().padStart(4, '0')}`),
    };
    const apres = appliquerEvenementBoussole(sature, creerEvt({ attemptId: 'new-event-99999' }), '2026-11-21');
    expect(apres.boussoleEventsSeen?.length).toBe(MAX_BOUSSOLE_EVENTS_SEEN);
    expect(apres.boussoleEventsSeen?.[0]).toBe('old-event-0001');
    expect(apres.boussoleEventsSeen?.at(-1)).toBe('boussole:new-event-99999');
  });

  it('useBoussoleBridge rejette mauvaise origine / mauvaise source et accepte uniquement le cadre monté', () => {
    const onEvent = vi.fn();
    let frameEl: HTMLIFrameElement | null = null;

    function TestHost() {
      const ref = useRef<HTMLIFrameElement>(null);
      useBoussoleBridge(ref, onEvent);
      return createElement('iframe', {
        ref: (el: HTMLIFrameElement | null) => {
          ref.current = el;
          frameEl = el;
        },
        title: 'test',
      });
    }

    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);
    act(() => {
      root.render(createElement(TestHost));
    });

    const bonWindow = frameEl!.contentWindow;
    const valide = creerEvt();

    // 1. Mauvaise origine → ignoré
    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: 'https://evil.example',
          source: bonWindow,
          data: valide,
        }),
      );
    });
    expect(onEvent).not.toHaveBeenCalled();

    // 2. Bonne origine mais mauvaise source (window au lieu de l'iframe) → ignoré
    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: window.location.origin,
          source: window,
          data: valide,
        }),
      );
    });
    expect(onEvent).not.toHaveBeenCalled();

    // 3. Bonne origine + bonne source + payload invalide → ignoré
    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: window.location.origin,
          source: bonWindow,
          data: { type: 'learning.attempt.completed', schemaVersion: 99 },
        }),
      );
    });
    expect(onEvent).not.toHaveBeenCalled();

    // 4. Bonne origine + bonne source + payload valide → accepté
    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: window.location.origin,
          source: bonWindow,
          data: valide,
        }),
      );
    });
    expect(onEvent).toHaveBeenCalledTimes(1);
    // `parseBoussoleEvent` normalise l'origine : un seul cas côté consommateur (v0.11).
    expect(onEvent).toHaveBeenCalledWith({ ...valide, origine: 'boussole' });

    act(() => {
      root.unmount();
    });
    host.remove();
  });
});

describe('Lot 5B — Rétrogradation croisée kafaa ↔ progression et DrillRecord enrichi', () => {
  it('marque les leçons terminées de l’unité comme fragiles et divise leur intervalle par 2 (plancher 1 j)', () => {
    const [l1, l2] = UNITE_PAR_ID.u1.lessonIds;
    const base: Etat = {
      ...etatVierge(),
      progression: {
        [l1]: {
          ...progressionVierge(),
          statut: 'terminee',
          intervalle: 14,
          prochaineRevision: '2026-12-05',
          fragile: false,
        },
        [l2]: {
          ...progressionVierge(),
          statut: 'en_cours',
          intervalle: 0,
        },
      },
    };

    const maj = demoterProgressionDepuisKafaa(base, 'u1', '2026-11-21');
    expect(maj.progression[l1].statut).toBe('terminee');
    expect(maj.progression[l1].fragile).toBe(true);
    expect(maj.progression[l1].intervalle).toBe(7);
    expect(maj.progression[l1].prochaineRevision).toBe('2026-11-28');
    // Leçon non terminée non touchée
    expect(maj.progression[l2].statut).toBe('en_cours');
    expect(maj.progression[l2].fragile).toBeUndefined();
  });

  it('DrillRecord conserve la rétrocompatibilité avec true et valide à l’import de sauvegarde', () => {
    const legacy = { 'd1-1': true as const };
    expect(estDrillFait(legacy['d1-1'])).toBe(true);
    expect(erreursDrill(legacy['d1-1'])).toBe(0);

    const enrichi = enregistrerDrillReussi(legacy, 'd1-1', 2, '2026-11-21');
    expect(estDrillFait(enrichi['d1-1'])).toBe(true);
    expect(erreursDrill(enrichi['d1-1'])).toBe(2);
    expect(enrichi['d1-1']).toEqual({
      done: true,
      errors: 2,
      attempts: 2,
      lastSeen: '2026-11-21',
      nextReview: '2026-11-22',
    });

    const sauvegarde = lireSauvegarde({
      version: 3,
      etat: {
        progression: {},
        drills: {
          'ancien-id': true,
          'nouveau-id': enrichi['d1-1'],
        },
        boussoleEventsSeen: ['att-12345678'],
      },
    });
    expect(sauvegarde).not.toBeNull();
  });
});

describe('Lot 5C — Banque d’enquêtes ExamBlanc et micro-épreuves documentaires JalonUnite', () => {
  it('fournit 5 enquêtes distinctes couvrant U1, U3, U4, U5 et U6 avec structure complète', () => {
    expect(ENQUETES_BAC.length).toBeGreaterThanOrEqual(5);
    const unites = new Set(ENQUETES_BAC.map((e) => e.unitId));
    expect(unites).toEqual(new Set(['u1', 'u3', 'u4', 'u5', 'u6']));
    for (const e of ENQUETES_BAC) {
      expect(e.etapes).toHaveLength(4);
      for (const st of e.etapes) {
        expect(st.options).toHaveLength(3);
        expect(st.cible[1]).toBeTruthy();
        expect(st.cible[2]).toBeTruthy();
      }
      expect(e.review.reviewed).toBe(false);
    }
  });

  it('choisirEnqueteExamBlanc évite la répétition et cible les unités faibles', () => {
    const etat = etatVierge();
    const premiere = choisirEnqueteExamBlanc(etat);
    const etatApres: Etat = {
      ...etat,
      examens: [
        {
          date: '2026-11-21T10:00:00.000Z',
          secondes: 600,
          chrono: false,
          qcm: 6,
          directs: 4,
          erreursEnquete: 1,
          unitesFaibles: [4],
          enqueteId: premiere.id,
        },
      ],
    };
    const deuxieme = choisirEnqueteExamBlanc(etatApres);
    expect(deuxieme.id).not.toBe(premiere.id);
    expect(deuxieme.unitId).toBe('u4');
  });

  it('fournit des micro-épreuves documentaires valides pour U1 à U6', () => {
    for (const uid of ['u1', 'u2', 'u3', 'u4', 'u5', 'u6']) {
      const m = MICRO_EPREUVES_UNITE[uid];
      expect(m).toBeDefined();
      expect(m.qcm.options.length).toBe(4);
      expect(m.qcm.explication.length).toBeGreaterThan(10);
    }
  });
});
