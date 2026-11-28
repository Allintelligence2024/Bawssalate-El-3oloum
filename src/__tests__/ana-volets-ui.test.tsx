// @vitest-environment jsdom
// «أنا» المبسّطة في قسمين واضحين: «تحليل أدائي» (شجرة التحليل التفاعلية) + «إعداداتي».
// الإعدادات تبقى مركّبة بـ hidden حتى لا تفقد الاستعادة والمزامنة الوصول إليها.
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

describe('شاشة «أنا» المبسّطة وشجرة التحليل', () => {
  it('تفتح على شجرة تحليل الأداء وتُبقي الإعدادات مطوية دون تفكيكها', async () => {
    await monter();
    expect(zone!.querySelectorAll('[role="tab"]').length).toBe(2);
    expect(onglet('تحليل أدائي')!.getAttribute('aria-selected')).toBe('true');
    expect(onglet('إعداداتي')!.getAttribute('aria-selected')).toBe('false');

    const arbre = zone!.querySelector('[data-testid="arbre-analyse-dashboard"]') as HTMLElement;
    expect(arbre).toBeTruthy();
    expect(arbre.parentElement?.hasAttribute('hidden')).toBe(false);
    expect(zone!.textContent).toContain('شجرة تحليل أدائك');
    expect(zone!.textContent).toContain('3 مجالات ← 11 وحدة رسمية');

    const nomInput = zone!.querySelector<HTMLInputElement>('#nom')!;
    expect(nomInput.value).toBe('أمين');
    expect(nomInput.closest('div[hidden]')).toBeTruthy();
  });

  it('تبدّل بين «تحليل أدائي» و«إعداداتي» بسلاسة دون فقدان حالة الاسم', async () => {
    await monter();
    await choisir('إعداداتي');
    expect(onglet('إعداداتي')!.getAttribute('aria-selected')).toBe('true');
    const nomInput = zone!.querySelector<HTMLInputElement>('#nom')!;
    expect(nomInput.closest('div[hidden]')).toBeNull();
    expect(zone!.textContent).toContain('النسخة الاحتياطية');

    await choisir('تحليل أدائي');
    expect(onglet('تحليل أدائي')!.getAttribute('aria-selected')).toBe('true');
    expect(zone!.querySelector<HTMLInputElement>('#nom')!.value).toBe('أمين');
  });
});
