// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import Confidentialite from '../components/Confidentialite';
import { etatVierge } from '../types';

let zone: HTMLDivElement;
let root: Root;
beforeEach(async () => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  zone = document.createElement('div');
  document.body.append(zone);
  root = createRoot(zone);
  await act(async () => root.render(createElement(Confidentialite, {
    etat: etatVierge(), onRetirerConsentement: () => {}, onFermer: () => {},
  })));
});
afterEach(async () => { await act(async () => root.unmount()); zone.remove(); });

describe('FAQ de confidentialité', () => {
  it('relie chaque question à sa réponse et annonce son état ouvert ou fermé', async () => {
    const boutons = [...zone.querySelectorAll<HTMLButtonElement>('button[aria-controls^="faq-reponse-"]')];
    expect(boutons.length).toBeGreaterThan(2);
    for (const bouton of boutons) {
      const cible = zone.querySelector<HTMLElement>(`#${bouton.getAttribute('aria-controls')}`);
      expect(cible).not.toBeNull();
      expect(bouton.getAttribute('aria-expanded')).toBe('false');
      expect(cible?.hidden).toBe(true);
    }
    const [premier, deuxieme] = boutons;
    const premiereReponse = zone.querySelector<HTMLElement>(`#${premier.getAttribute('aria-controls')}`)!;
    await act(async () => premier.click());
    expect(premier.getAttribute('aria-expanded')).toBe('true');
    expect(premiereReponse.hidden).toBe(false);
    await act(async () => deuxieme.click());
    expect(premier.getAttribute('aria-expanded')).toBe('false');
    expect(premiereReponse.hidden).toBe(true);
    expect(deuxieme.getAttribute('aria-expanded')).toBe('true');
    await act(async () => deuxieme.click());
    expect(deuxieme.getAttribute('aria-expanded')).toBe('false');
  });
});
