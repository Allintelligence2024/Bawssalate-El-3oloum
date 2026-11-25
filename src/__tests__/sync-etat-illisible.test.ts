// @vitest-environment jsdom
// Client simulé : vérifie le garde de l'application, sans service distant.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';

const reseau = vi.hoisted(() => ({ upsert: vi.fn(async () => ({ error: null })) }));
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ from: () => ({ upsert: reseau.upsert }) }),
}));
vi.mock('../components/Inscription', async () => {
  const { createElement: element } = await import('react');
  return { default: ({ onValide }: { onValide: (compte: unknown) => void }) => element('button', {
    onClick: () => onValide({ email: 'eleve@example.invalid', jeton: 'jeton-fictif', wilaya: '31', daira: '01', creeLe: '2026-01-01' }),
  }, 'Compte fictif') };
});

let root: Root | undefined;
let zone: HTMLDivElement | undefined;
afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  root = undefined;
  zone?.remove();
  zone = undefined;
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

async function cliquer(texte: string) {
  const bouton = [...zone!.querySelectorAll('button')].find((b) => b.textContent?.trim() === texte);
  expect(bouton, texte).toBeDefined();
  await act(async () => { bouton!.click(); });
}

describe('synchronisation avec progression illisible', () => {
  it('ne transmet pas un état de secours même après création de compte et clic sur oui', async () => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    reseau.upsert.mockClear();
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.invalid');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'cle-fictive');
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    localStorage.clear();
    sessionStorage.clear();
    const invalide = '{état cassé';
    localStorage.setItem('murajih_svt_v1', invalide);
    sessionStorage.setItem('kunz_demarrage', '1');
    const { default: App } = await import('../App');
    vi.useFakeTimers();
    zone = document.createElement('div');
    document.body.append(zone);
    root = createRoot(zone);
    await act(async () => { root!.render(createElement(App)); });
    // Phase 2 : plus d'écran de compte obligatoire. On ouvre la fiche de compte du bandeau XP,
    // puis on crée le compte — le garde de synchronisation doit rester le même.
    const fiche = zone.querySelector('[aria-label="نقاط الخبرة وأيام النشاط"]') as HTMLElement | null;
    expect(fiche, 'fiche XP absente').toBeTruthy();
    await act(async () => { fiche!.click(); });
    await cliquer('أنشئ حسابًا (اختياري)');
    await cliquer('Compte fictif');
    await cliquer('نعم، أفعّل المزامنة');
    await act(async () => {
      window.dispatchEvent(new Event('online'));
      await vi.advanceTimersByTimeAsync(6001);
    });
    expect(reseau.upsert).not.toHaveBeenCalled();
    expect(localStorage.getItem('murajih_svt_v1')).toBe(invalide);
    expect(zone.textContent).toContain('تعذّر قراءة بياناتك');
  });
});
