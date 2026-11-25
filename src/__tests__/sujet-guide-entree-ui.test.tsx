// @vitest-environment jsdom
// L'entrée du parcours guidé est réellement branchée : un bouton «الموضوع كاملًا» par sujet,
// qui remonte l'identifiant du sujet affiché. (Le retour d'usage était : « je clique, rien ne se passe ».)
import { afterEach, describe, expect, it } from 'vitest';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import SujetsOfficiels from '../components/SujetsOfficiels';

let root: Root | undefined;
let zone: HTMLDivElement | undefined;

afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  root = undefined;
  zone?.remove();
  zone = undefined;
});

describe('entrée « sujet complet » depuis la liste des sujets', () => {
  it('le bouton du sujet affiché ouvre le parcours guidé avec le bon identifiant', async () => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    const ouverts: string[] = [];
    zone = document.createElement('div');
    document.body.append(zone);
    root = createRoot(zone);

    await act(async () => {
      root!.render(
        createElement(SujetsOfficiels, {
          onOuvrirSynthese: () => {},
          onOuvrirRecherche: () => {},
          onFermer: () => {},
          onOuvrirGuide: (sujetId: string) => ouverts.push(sujetId),
        }),
      );
    });

    const bouton = [...zone.querySelectorAll('button')].find((b) =>
      (b.textContent ?? '').includes('الموضوع كاملًا'),
    );
    expect(bouton, 'bouton «الموضوع كاملًا» absent de la carte du sujet').toBeTruthy();

    await act(async () => {
      bouton!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(ouverts).toHaveLength(1);
    expect(ouverts[0]).toMatch(/^\d{4}(x)?-\d$/);
  });

  it('sans le gestionnaire, le bouton n’est pas affiché (pas de bouton mort)', async () => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    zone = document.createElement('div');
    document.body.append(zone);
    root = createRoot(zone);
    await act(async () => {
      root!.render(
        createElement(SujetsOfficiels, {
          onOuvrirSynthese: () => {},
          onOuvrirRecherche: () => {},
          onFermer: () => {},
        }),
      );
    });
    const bouton = [...zone.querySelectorAll('button')].find((b) =>
      (b.textContent ?? '').includes('الموضوع كاملًا'),
    );
    expect(bouton).toBeUndefined();
  });
});
