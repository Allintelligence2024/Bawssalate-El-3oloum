// @vitest-environment jsdom
// Phase 3 — le parcours réel : une leçon non terminée passe par les six nœuds, puis la
// clôture ouvre l'écran de fierté (et compte **une** séance, pas une par ouverture).
//
// Ce test monte l'application entière (comme `stockage-ui.test.ts`) avec les trois écrans
// lourds remplacés par des boutons : il vérifie le câblage des modes, pas le rendu des nœuds.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, createElement, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import App from '../App';
import { effacerAlerteStockage } from '../utils/echecsStockage';

const LECON = 'd1-u1-l1-expression-genique';

// L'accueil (الرئيسية) : un seul bouton qui demande l'ouverture d'une leçon non terminée.
vi.mock('../components/Principal', () => ({
  default: ({ onOuvrirItem }: { onOuvrirItem: (item: { type: 'lecon'; id: string }) => void }) =>
    createElement(
      'div',
      null,
      createElement('p', null, 'Accueil'),
      createElement('button', { onClick: () => onOuvrirItem({ type: 'lecon', id: 'd1-u1-l1-expression-genique' }) }, 'ouvrir leçon'),
    ),
}));

// Les six micro-nœuds : le bouton « ابدأ » du nœud courant.
vi.mock('../components/MicroNoeuds', () => ({
  default: ({ onOuvrirNoeud }: { onOuvrirNoeud: () => void }) =>
    createElement(
      'div',
      null,
      createElement('p', null, 'Six nœuds'),
      createElement('button', { onClick: onOuvrirNoeud }, 'commencer le nœud'),
    ),
}));

// Le protocole : il termine la leçon dès qu'on l'ouvre (ce qui nous intéresse est la suite).
vi.mock('../components/ProtocoleRunner', () => ({
  default: ({ onTerminer }: { onTerminer: (p: unknown) => void }) => {
    const p = {
      statut: 'terminee',
      phases: [1, 2, 3, 4, 5, 6],
      minutes: 46,
      repetitions: 1,
      intervalle: 1,
      facilite: 2.5,
      prochaineRevision: '2026-11-24T08:00:00.000Z',
    };
    // Le vrai runner termine après la sixième phase : ici, à la fin du premier rendu.
    useEffect(() => { onTerminer(p); }, []); // eslint-disable-line react-hooks/exhaustive-deps
    return createElement('p', null, 'Protocole');
  },
}));

let root: Root | undefined;
let zone: HTMLDivElement | undefined;

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  localStorage.clear();
  sessionStorage.clear();
  effacerAlerteStockage();
  zone = document.createElement('div');
  document.body.append(zone);
  root = createRoot(zone);
});

afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  root = undefined;
  zone?.remove();
  zone = undefined;
});

const bouton = (motif: string) =>
  [...zone!.querySelectorAll('button')].find((b) =>
    (b.textContent ?? '').replace(/\s+/g, ' ').includes(motif));

const clic = async (b: HTMLElement) => {
  await act(async () => { b.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
};

/** Les écrans sont chargés en `lazy` : on laisse les imports dynamiques se résoudre. */
async function attendre(texte: string): Promise<void> {
  for (let i = 0; i < 50 && !(zone!.textContent ?? '').includes(texte); i++) {
    await act(async () => { await new Promise((r) => setTimeout(r, 5)); });
  }
  expect(zone!.textContent).toContain(texte);
}

const etatSauve = () => JSON.parse(localStorage.getItem('murajih_svt_v1') ?? '{}');

describe('parcours nœuds → protocole → fierté', () => {
  it('ouvre les six nœuds, puis la fierté, et compte la séance à la clôture', async () => {
    await act(async () => { root!.render(createElement(App)); });
    await clic(bouton('ouvrir leçon')!);
    // Une leçon non terminée passe par MicroNoeuds, pas directement par le protocole.
    expect(zone!.textContent).toContain('Six nœuds');
    // Ouvrir ne compte pas de séance.
    expect(etatSauve().seancesComptees ?? 0).toBe(0);

    await clic(bouton('commencer le nœud')!);
    // Le protocole s'ouvre puis se termine → l'écran de fierté prend la main.
    await attendre('خلّصت الدرس');
    expect(zone!.textContent).toContain('6 / 6');
    expect(zone!.textContent).not.toMatch(/%/);
    expect(bouton('شوف بطاقة الدرس')).toBeDefined();
    expect(etatSauve().seancesComptees).toBe(1);

    await clic(bouton('يكفي اليوم')!);
    expect(zone!.textContent).toContain('Accueil');
  });

  it('ne recompte pas la séance si le même protocole se termine deux fois', async () => {
    await act(async () => { root!.render(createElement(App)); });
    await clic(bouton('ouvrir leçon')!);
    await clic(bouton('commencer le nœud')!);
    await attendre('خلّصت الدرس');
    expect(etatSauve().seancesComptees).toBe(1);
    // Le protocole est resté monté et rappelle onTerminer à chaque rendu : la clôture est
    // idempotente (leçon déjà terminée), donc la séance ne bouge pas.
    await attendre('خلّصت الدرس');
    expect(etatSauve().seancesComptees).toBe(1);
  });
});
