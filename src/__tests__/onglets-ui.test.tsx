// @vitest-environment jsdom
// أربعة أبواب موحّدة: الرئيسية · مساري · تدريباتي (كويست + الباك) · أنا.
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
  return [...zone!.querySelectorAll('nav[aria-label="أبواب البوصلة"] button')] as HTMLButtonElement[];
}

describe('أبواب البوصلة الأربعة الموحّدة', () => {
  it('تعرض أربعة أبواب وتفتح تدريباتي (كويست + الباك) بدون حاسبة معدل', async () => {
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
    expect(libelles).toEqual(['الرئيسية', 'مساري', 'تدريباتي', 'أنا']);
    expect(boutons()[0].getAttribute('aria-current')).toBe('page');
    // خطة الـ 30 يومًا تُحمَّل تلقائيًّا في الرئيسية
    expect(zone.textContent).toContain('خطتك الذكية لـ 30 يومًا في العلوم');
    expect(zone.textContent).not.toContain('محاكي المعدل');

    await act(async () => { await import('../components/Tadarobati'); });
    await act(async () => { boutons()[2].click(); });
    await vider(60);
    expect(zone.textContent).toContain('تدريباتي');
    expect(zone.textContent).toContain('كويست اليوم');
    expect(zone.textContent).toContain('كيفاش تخدم موضوع');
    expect(zone.textContent).toContain('الأفعال اللي تتكرّر');
    expect(zone.textContent).not.toContain('محاكي المعدل');
    expect(boutons()[2].getAttribute('aria-current')).toBe('page');
    expect(boutons()[0].getAttribute('aria-current')).toBeNull();
  });
});
