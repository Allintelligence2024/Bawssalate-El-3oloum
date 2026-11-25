// @vitest-environment jsdom
// Règle éditoriale : un jeu `a_valider_enseignant` n'est jamais servi comme corrigé validé.
// L'écran 1-2-3 doit montrer une porte d'aperçu explicite, puis une mention visible.
import { afterEach, describe, expect, it } from 'vitest';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import EcranBriques from '../components/EcranBriques';
import { etatDepuisBrut } from '../utils/etat';

let root: Root | undefined;
let zone: HTMLDivElement | undefined;

afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  root = undefined;
  zone?.remove();
  zone = undefined;
});

async function attendre(condition: () => boolean, ms = 3000) {
  const debut = Date.now();
  while (!condition() && Date.now() - debut < ms) {
    await act(async () => { await new Promise((r) => setTimeout(r, 20)); });
  }
  return condition();
}

describe('écran 1-2-3 et statut éditorial', () => {
  it('le seul gabarit sujet est `a_valider_enseignant` : l’écran demande un aperçu', async () => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    zone = document.createElement('div');
    document.body.append(zone);
    root = createRoot(zone);

    await act(async () => {
      root!.render(createElement(EcranBriques, {
        etat: etatDepuisBrut({}),
        sujetId: '2025-1',
        onFermer: () => {},
        onTentative: () => {},
      }));
    });

    const pret = await attendre(() => (zone!.textContent ?? '').includes('قيد مراجعة الأستاذ'));
    expect(pret, 'porte d’aperçu absente').toBe(true);
    // Aucun exercice n'est servi avant l'aperçu : pas de bloc de brique cliquable.
    expect((zone.textContent ?? '').includes('الفخّ')).toBe(false);

    const bouton = [...zone.querySelectorAll('button')].find((b) =>
      (b.textContent ?? '').includes('افتح المعاينة'),
    );
    expect(bouton, 'bouton d’aperçu absent').toBeTruthy();
    // Sur un sujet, « choisir une autre unité » ne changerait rien : pas de bouton mort.
    expect((zone.textContent ?? '').includes('اختر وحدة أخرى')).toBe(false);

    await act(async () => {
      bouton!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const mention = await attendre(() => (zone!.textContent ?? '').includes('محتوى قيد المراجعة'));
    expect(mention, 'mention « قيد المراجعة » absente après ouverture de l’aperçu').toBe(true);
  });

  it('un contenu actif (unité 1) s’ouvre directement, sans porte d’aperçu', async () => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    zone = document.createElement('div');
    document.body.append(zone);
    root = createRoot(zone);

    await act(async () => {
      root!.render(createElement(EcranBriques, {
        etat: etatDepuisBrut({}),
        uniteId: 'u1',
        onFermer: () => {},
        onTentative: () => {},
      }));
    });

    const pret = await attendre(() => !(zone!.textContent ?? '').includes('قيد مراجعة الأستاذ'));
    expect(pret).toBe(true);
    expect((zone.textContent ?? '').includes('محتوى قيد المراجعة')).toBe(false);
  });
});
