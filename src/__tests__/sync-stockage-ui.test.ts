// @vitest-environment jsdom
// Le client Supabase est simulé : aucune requête ne sort du test.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';

const reseau = vi.hoisted(() => ({
  upsert: vi.fn(async (_payload: Record<string, unknown>, _options: Record<string, unknown>) => ({ error: null })),
}));
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ from: () => ({ upsert: reseau.upsert }) }),
}));

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
  expect(bouton, `${texte} — boutons : ${[...zone!.querySelectorAll('button')].map(b => b.textContent?.trim()).join(' | ')}`).toBeDefined();
  await act(async () => { bouton!.click(); });
}

describe('synchronisation et stockage illisible', () => {
  it('ne transmet pas des statistiques de secours et permet de retirer le consentement', async () => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    reseau.upsert.mockClear();
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.invalid');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'cle-fictive');
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    localStorage.clear();
    sessionStorage.clear();
    const { etatVierge } = await import('../types');
    const email = 'stockage@example.invalid';
    localStorage.setItem('murajih_svt_v1', JSON.stringify({
      ...etatVierge(), compte: { email, jeton: 'jeton-fictif-valide', wilaya: '31', daira: '01', creeLe: '2026-01-01' },
      consentementSync: true, consentementSyncDecideLe: '2026-01-01', diagnosticDecideLe: '2026-01-01',
    }));
    const invalide = '{"justes":"invalide"}';
    localStorage.setItem('kunz_stats_v1', invalide);
    sessionStorage.setItem('kunz_demarrage', '1');
    sessionStorage.setItem('kunz_session_v1', email);
    // Import après la mise en place : la lecture initiale rencontre réellement le JSON corrompu.
    const { default: App } = await import('../App');
    const stats = await import('../utils/stats');
    vi.useFakeTimers();
    zone = document.createElement('div');
    document.body.append(zone);
    root = createRoot(zone);
    await act(async () => { root!.render(createElement(App)); });
    await act(async () => {
      window.dispatchEvent(new Event('online'));
      document.dispatchEvent(new Event('visibilitychange'));
      await vi.advanceTimersByTimeAsync(6001);
    });
    expect(reseau.upsert).not.toHaveBeenCalled();
    expect(localStorage.getItem('kunz_stats_v1')).toBe(invalide);

    vi.useRealTimers();
    await act(async () => { await import('../components/Ana'); });
    await cliquer('أنا');
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
    await cliquer('إيقاف المزامنة');
    expect(JSON.parse(localStorage.getItem('murajih_svt_v1')!).consentementSync).toBe(false);
    expect(reseau.upsert).not.toHaveBeenCalled();
    // La décision explicite peut être enregistrée, mais ne doit pas contourner le blocage d'envoi.
    await cliquer('تفعيل المزامنة');
    expect(JSON.parse(localStorage.getItem('murajih_svt_v1')!).consentementSync).toBe(true);
    expect(reseau.upsert).not.toHaveBeenCalled();
    expect(localStorage.getItem('kunz_stats_v1')).toBe(invalide);

    // Témoin positif : après remplacement explicite par des statistiques lisibles,
    // la même voie « online » atteint bien le client simulé.
    vi.useRealTimers();
    await act(async () => {
      stats.restaurerStats({ ...stats.statsActuelles(), justes: 3 });
      window.dispatchEvent(new Event('online'));
    });
    await vi.waitFor(() => expect(reseau.upsert).toHaveBeenCalledTimes(1));
    expect(reseau.upsert.mock.calls[0][0]).toMatchObject({ email, reponses_justes: 3 });
  });
});
