// @vitest-environment jsdom
// « أفتح البوصلة وأعود إلى تمريني » — l'aide contextuelle doit ouvrir le laboratoire,
// pas un onglet de méthode vide de l'exemple promis.
//
// Régression réelle (CI rouge depuis la v0.11) : le tiroir a été extrait en composant et son
// onglet par défaut est devenu « تحقّق » ; le bouton d'aide ouvrait donc un écran sans le
// laboratoire, alors que le titre promet « le laboratoire explique avec un exemple de
// synthèse des protéines ». Le parcours Playwright attendait `.case-protein` : timeout.
import { afterEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { AideBoussole } from '../components/Boussole';

let root: Root | undefined;
let zone: HTMLDivElement | undefined;

afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  root = undefined;
  zone?.remove();
  zone = undefined;
});

async function monter(ongletInitial?: 'verificateur' | 'labo') {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  zone = document.createElement('div');
  document.body.append(zone);
  root = createRoot(zone);
  await act(async () => {
    root!.render(
      <AideBoussole
        document="الوثيقة 1"
        verbe="فسّر"
        ongletInitial={ongletInitial}
        onFermer={() => {}}
      />,
    );
  });
  return zone;
}

describe('aide contextuelle « البوصلة داخل التمرين »', () => {
  it('par défaut : pas de laboratoire (l’élève voit d’abord la règle)', async () => {
    const z = await monter();
    expect(z.querySelector('dialog[aria-label="البوصلة داخل التمرين"]')).toBeTruthy();
    expect(z.querySelector('iframe')).toBeNull();
    expect(z.textContent).toContain('حدّدت الشاهد');
  });

  it('avec l’onglet laboratoire : la iframe vise bien l’exemple protéine', async () => {
    const z = await monter('labo');
    const cadre = z.querySelector('iframe');
    expect(cadre, 'aucune iframe de laboratoire dans l’aide').toBeTruthy();
    expect(cadre!.getAttribute('src')).toBe('/boussole/index.html#explore-protein');
    expect(z.textContent).toContain('ليس حلّ تمرينك');
    expect(z.textContent).toMatch(/الفعل «/);
  });

  it('le bouton de retour existe et porte le focus', async () => {
    const z = await monter('labo');
    const retour = [...z.querySelectorAll('button')].find(
      (b) => (b.textContent ?? '').trim() === 'أعود إلى تمريني',
    );
    expect(retour).toBeTruthy();
  });
});
