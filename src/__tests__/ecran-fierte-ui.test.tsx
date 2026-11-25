// @vitest-environment jsdom
// Phase 3 — l'écran de fierté de fin des six nœuds.
//
// Contrat : on constate un travail (six phases, carte gagnée, revision programmée),
// on ne félicite pas un score. Un seul geste utile : voir la carte, enchaîner, ou
// s'arrêter. Aucun pourcentage, aucun bouton mort.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import EcranFierte from '../components/EcranFierte';
import { migrerEtat } from '../utils/etat';

const LECON = 'd1-u1-l1-expression-genique';

let root: Root | undefined;
let zone: HTMLDivElement | undefined;

afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  root = undefined;
  zone?.remove();
  zone = undefined;
});

async function monter(element: React.ReactElement) {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  zone = document.createElement('div');
  document.body.append(zone);
  root = createRoot(zone);
  await act(async () => { root!.render(element); });
  return zone;
}

const clic = async (b: HTMLElement) => {
  await act(async () => { b.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
};

function etatTermine() {
  return migrerEtat({
    progression: {
      [LECON]: {
        statut: 'terminee',
        phases: [1, 2, 3, 4, 5, 6],
        minutes: 46,
        repetitions: 1,
        intervalle: 1,
        facilite: 2.5,
        prochaineRevision: '2026-11-24T08:00:00.000Z',
      },
    },
    cartesLecons: {
      [LECON]: {
        gagneeLe: '2026-11-21T10:00:00.000Z',
        points: ['السؤال؟', 'الخلاصة.', 'الفخّ.'] as [string, string, string],
        version: 1,
      },
    },
  });
}

const bouton = (motif: string) =>
  [...zone!.querySelectorAll('button')].find((b) =>
    (b.textContent ?? '').replace(/\s+/g, ' ').includes(motif));

describe('l’écran de fierté', () => {
  it('annonce le travail fait : phases, carte, revision — sans pourcentage', async () => {
    await monter(createElement(EcranFierte, {
      etat: etatTermine(), lessonId: LECON, onOuvrirItem: vi.fn(), onFermer: vi.fn(),
    }));
    const texte = zone!.textContent ?? '';
    expect(texte).toContain('خلّصت الدرس');
    expect(texte).toContain('6 / 6');
    expect(texte).toContain('بطاقة الدرس');
    expect(texte).toContain('24 نوفمبر');
    expect(texte).not.toMatch(/%/);
    // le visuel du guide est bien branché (clair + sombre, un seul visible en CSS)
    expect(zone!.querySelectorAll('img').length).toBe(2);
  });

  it('montre la carte en un clic, puis la cache', async () => {
    await monter(createElement(EcranFierte, {
      etat: etatTermine(), lessonId: LECON, onOuvrirItem: vi.fn(), onFermer: vi.fn(),
    }));
    expect(zone!.querySelector('[aria-label^="بطاقة الدرس"]')).toBeNull();
    const voir = bouton('شوف بطاقة الدرس')!;
    expect(voir.getAttribute('aria-expanded')).toBe('false');
    await clic(voir);
    expect(zone!.querySelector('[aria-label^="بطاقة الدرس"]')).not.toBeNull();
    expect(zone!.textContent).toContain('السؤال؟');
    const cacher = bouton('خبّي بطاقة الدرس')!;
    expect(cacher.getAttribute('aria-expanded')).toBe('true');
    await clic(cacher);
    expect(zone!.querySelector('[aria-label^="بطاقة الدرس"]')).toBeNull();
  });

  it('propose d’enchaîner ou de s’arrêter — jamais les deux au même endroit', async () => {
    const onOuvrirItem = vi.fn();
    const onFermer = vi.fn();
    await monter(createElement(EcranFierte, {
      etat: etatTermine(), lessonId: LECON, onOuvrirItem, onFermer,
    }));
    const stop = bouton('يكفي اليوم')!;
    await clic(stop);
    expect(onFermer).toHaveBeenCalledTimes(1);
    expect(onOuvrirItem).not.toHaveBeenCalled();

    const suite = bouton('الدرس التالي') ?? bouton('التالي في مسارك');
    expect(suite).toBeTruthy();
    await clic(suite!);
    expect(onOuvrirItem).toHaveBeenCalledTimes(1);
  });
});
