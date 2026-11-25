// @vitest-environment jsdom
// Phase 3 — « أنا » en trois volets : تقدّمي · كرّاستي · إعداداتي.
//
// Rien n'est supprimé : les cartes restent dans la page et sont repliées par `hidden`.
// Un élève qui revient sur « إعداداتي » retrouve tout, et la sauvegarde ne bouge pas
// d'un volet à l'autre.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import Ana from '../components/Ana';
import { migrerEtat } from '../utils/etat';

let root: Root | undefined;
let zone: HTMLDivElement | undefined;

afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  root = undefined;
  zone?.remove();
  zone = undefined;
});

async function monter() {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  zone = document.createElement('div');
  document.body.append(zone);
  root = createRoot(zone);
  const rien = vi.fn();
  await act(async () => {
    root!.render(createElement(Ana, {
      etat: migrerEtat({ nom: 'أمين', journal: ['2026-11-20', '2026-11-21'] }),
      carnet: [],
      onEffacerCarnet: rien,
      onNom: rien,
      onDateBac: rien,
      onSupprimerNote: rien,
      onReinitialiser: () => true,
      onRestaurer: rien,
      onConsentementSync: rien,
      onObjectif: rien,
      onModeIntensif: rien,
      onTailleTexte: rien,
      onOuvrirDiagnostic: rien,
      onOuvrirLecon: rien,
      onDemarrerRevision: rien,
      onBasculerFavori: rien,
      onRappel: rien,
      onAllerExercices: rien,
      onOuvrirConfidentialite: rien,
      onOuvrirEntraineur: rien,
    }));
  });
  return zone;
}

const onglet = (nom: string) =>
  [...zone!.querySelectorAll('[role="tab"]')].find((b) => (b.textContent ?? '').trim() === nom) as HTMLElement | undefined;
const choisir = async (nom: string) => {
  const b = onglet(nom);
  expect(b).toBeTruthy();
  await act(async () => { b!.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
};
/** La section dont le titre d'œil / l'étiquette contient ce texte. */
const sectionDe = (motif: string) => {
  const sections = [...zone!.querySelectorAll('section')];
  return sections.find((s) => (s.textContent ?? '').includes(motif)) as HTMLElement | undefined;
};

describe('les trois volets d’أنا', () => {
  it('ouvre sur « تقدّمي » et laisse les deux autres repliés', async () => {
    await monter();
    expect(zone!.querySelectorAll('[role="tab"]').length).toBe(3);
    expect(onglet('تقدّمي')!.getAttribute('aria-selected')).toBe('true');
    expect(onglet('كرّاستي')!.getAttribute('aria-selected')).toBe('false');
    expect(onglet('إعداداتي')!.getAttribute('aria-selected')).toBe('false');

    expect(sectionDe('رحلتي بالأرقام')!.hasAttribute('hidden')).toBe(false);
    expect(sectionDe('سجلّ الأخطاء')!.hasAttribute('hidden')).toBe(true);
    expect(sectionDe('اسمي')!.hasAttribute('hidden')).toBe(true);
  });

  it('bascule vers « كرّاستي » puis « إعداداتي » sans rien perdre', async () => {
    await monter();
    await choisir('كرّاستي');
    expect(sectionDe('دوّن')!.hasAttribute('hidden')).toBe(false);
    expect(sectionDe('سجلّ الأخطاء')!.hasAttribute('hidden')).toBe(false);
    expect(sectionDe('رحلتي بالأرقام')!.hasAttribute('hidden')).toBe(true);

    await choisir('إعداداتي');
    expect(sectionDe('اسمي')!.hasAttribute('hidden')).toBe(false);
    expect(sectionDe('النسخة الاحتياطية')!.hasAttribute('hidden')).toBe(false);
    expect(sectionDe('سجلّ الأخطاء')!.hasAttribute('hidden')).toBe(true);

    await choisir('تقدّمي');
    expect(sectionDe('أيام نشاطي')!.hasAttribute('hidden')).toBe(false);
    // le nom saisi n'a jamais été démonté
    expect(zone!.querySelector<HTMLInputElement>('#nom')!.value).toBe('أمين');
  });
});
