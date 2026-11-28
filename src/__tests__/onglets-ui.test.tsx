// @vitest-environment jsdom
// Cinq portes : la décision du 2026-11-27 (« الرئيسية » séparée de « كويست ») est un
// contrat. Ce test la protège : si quelqu'un change la barre du bas, il casse ici.
import { afterEach, describe, expect, it } from 'vitest';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';

let root: Root | undefined;
let zone: HTMLDivElement | undefined;

afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  root = undefined;
  zone?.remove();
  zone = undefined;
  document.documentElement.removeAttribute('data-theme');
  localStorage.clear();
  sessionStorage.clear();
});

function vider(ms = 0) {
  return act(async () => { await new Promise((r) => setTimeout(r, ms)); });
}

function boutons(): HTMLButtonElement[] {
  // Uniquement la barre du bas (les liens rapides de الرئيسية ont aussi un <nav>).
  return [...zone!.querySelectorAll('nav[aria-label="أبواب البوصلة"] button')] as HTMLButtonElement[];
}

describe('les cinq portes de la boussole', () => {
  it('affiche exactement cinq onglets et ouvre الباك depuis la barre', async () => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    const { etatVierge } = await import('../types');
    const email = 'portes@example.invalid';
    localStorage.setItem('murajih_svt_v1', JSON.stringify({
      ...etatVierge(),
      compte: { email, jeton: 'jeton-fictif-valide', wilaya: '31', daira: '01', creeLe: '2026-01-01' },
      consentementSync: false, consentementSyncDecideLe: '2026-01-01', diagnosticDecideLe: '2026-01-01',
    }));
    sessionStorage.setItem('kunz_demarrage', '1');
    sessionStorage.setItem('kunz_session_v1', email);

    const { default: App } = await import('../App');
    zone = document.createElement('div');
    document.body.append(zone);
    root = createRoot(zone);
    await act(async () => { root!.render(createElement(App)); });
    await vider(30);

    const libelles = boutons().map((b) => b.textContent?.trim());
    expect(libelles).toEqual(['الرئيسية', 'مساري', 'كويست', 'الباك', 'أنا']);
    // الرئيسية (« main ») est la porte d'entrée par défaut.
    expect(boutons()[0].getAttribute('aria-current')).toBe('page');

    // On pré-charge le morceau différé : en jsdom, Suspense ne se résout pas seul.
    await act(async () => { await import('../components/Bac'); });
    await act(async () => { boutons()[3].click(); });
    await vider(60);
    // الباك est chargée en différé : on attend son contenu réel.
    expect(zone.textContent).toContain('كيفاش تخدم موضوع');
    expect(zone.textContent).toContain('الأفعال اللي تتكرّر');
    expect(boutons()[3].getAttribute('aria-current')).toBe('page');

    await act(async () => { boutons()[2].click(); });
    await vider(30);
    expect(boutons()[2].getAttribute('aria-current')).toBe('page');
    expect(boutons()[3].getAttribute('aria-current')).toBeNull();
  });
});
