// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import App from '../App';
import { effacerAlerteStockage } from '../utils/echecsStockage';
import { autoriserRemplacementEtat } from '../utils/storage';
import { etatVierge } from '../types';

vi.mock('../components/Aujourdhui', () => ({
  default: ({ onOuvrirExamenBlanc }: { onOuvrirExamenBlanc: () => void }) => createElement('button', { onClick: onOuvrirExamenBlanc }, 'Ouvrir examen'),
}));
vi.mock('../components/ExamBlanc', () => ({ default: () => createElement('div', null, 'Examen') }));

let root: Root;
let zone: HTMLDivElement;
beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  effacerAlerteStockage();
  autoriserRemplacementEtat();
  zone = document.createElement('div');
  document.body.appendChild(zone);
  root = createRoot(zone);
});
afterEach(async () => {
  await act(async () => root.unmount());
  zone.remove();
  vi.unstubAllGlobals();
});

describe('avertissement stockage au démarrage', () => {
  it('affiche le premier échec de sauvegarde avant la création du compte', async () => {
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => { throw Error('quota'); }, removeItem: () => {} });
    vi.stubGlobal('sessionStorage', { getItem: () => '1', setItem: () => {}, removeItem: () => {} });
    await act(async () => { root.render(createElement(App)); });
    expect(zone.querySelector('[role="alert"]')?.textContent).toContain('تعذّر قراءة بياناتك أو حفظها');
    // Phase 2 : aucun péage — même sans stockage, l'app s'ouvre (l'alerte reste visible).
    expect(zone.textContent).toContain('Ouvrir examen');
  });

  it('reste utilisable si sessionStorage et localStorage refusent les accès', async () => {
    const refuse = () => { throw Error('refus'); };
    vi.stubGlobal('localStorage', { getItem: refuse, setItem: refuse, removeItem: refuse });
    vi.stubGlobal('sessionStorage', { getItem: refuse, setItem: refuse, removeItem: refuse });
    await act(async () => { root.render(createElement(App)); });
    expect(zone.querySelector('[role="alert"]')?.textContent).toContain('تعذّر قراءة بياناتك أو حفظها');
    // Aucun écran de démarrage à franchir, aucun compte à créer : l'accueil est là.
    expect(zone.textContent).toContain('Ouvrir examen');
  });
  it('maintient l’avertissement pendant un écran plein écran', async () => {
    const compte = { email: 'eleve@example.com', motDePasse: 'hash', jeton: 'jeton', wilaya: '16', daira: '1', creeLe: '2026-11-17' };
    const sauvegarde = JSON.stringify({ ...etatVierge(), compte });
    vi.stubGlobal('localStorage', { getItem: (k: string) => k === 'murajih_svt_v1' ? sauvegarde : null, setItem: () => { throw Error('quota'); }, removeItem: () => {} });
    vi.stubGlobal('sessionStorage', { getItem: (k: string) => k === 'kunz_session_v1' ? compte.email : '1', setItem: () => {}, removeItem: () => {} });
    await act(async () => { root.render(createElement(App)); });
    const bouton = Array.from(zone.querySelectorAll('button')).find(b => b.textContent === 'Ouvrir examen');
    expect(bouton).toBeDefined();
    await act(async () => { bouton!.click(); });
    expect(zone.textContent).toContain('Examen');
    expect(zone.querySelector('[role="alert"]')?.textContent).toContain('تعذّر قراءة بياناتك أو حفظها');
  });

});
