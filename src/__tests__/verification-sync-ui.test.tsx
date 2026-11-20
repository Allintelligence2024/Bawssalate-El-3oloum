// @vitest-environment jsdom
import { act, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import VerificationSync from '../components/VerificationSync';

const auth = vi.hoisted(() => ({ signInWithOtp: vi.fn(), exchangeCodeForSession: vi.fn() }));
vi.mock('../utils/identiteSync', async (original) => ({
  ...await original<typeof import('../utils/identiteSync')>(),
  creerClientIdentiteSync: async () => ({ auth }),
}));

const config = { origine: 'https://pilote.example.invalid', urlAuth: 'https://auth.example.invalid', clePublique: 'fictive' };
let zone: HTMLDivElement;
let root: Root;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.resetAllMocks();
  zone = document.createElement('div');
  document.body.append(zone);
  root = createRoot(zone);
});
afterEach(async () => {
  await act(async () => root.unmount());
  zone.remove();
  history.replaceState(null, '', '/');
});

it('demande un lien sans annoncer une vérification ni activer la synchronisation', async () => {
  auth.signInWithOtp.mockResolvedValue({ error: null });
  await act(async () => root.render(<VerificationSync config={config} />));
  zone.querySelector('input')!.value = 'fictif@example.invalid';
  await act(async () => { zone.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
  expect(auth.signInWithOtp).toHaveBeenCalledOnce();
  expect(zone.querySelector('[role=status]')?.textContent).toContain('طُلب إرسال الرابط');
  expect(auth.exchangeCodeForSession).not.toHaveBeenCalled();
});

it('consomme le retour une seule fois sous StrictMode et retire le code avant échange', async () => {
  history.replaceState(null, '', '/?verification-sync=1&code=fictif');
  auth.exchangeCodeForSession.mockImplementation(async () => {
    expect(location.search).toBe('');
    return { error: null, data: { session: { user: { email_confirmed_at: '2026-11-19' } } } };
  });
  await act(async () => root.render(<StrictMode><VerificationSync config={config} /></StrictMode>));
  expect(auth.exchangeCodeForSession.mock.calls).toEqual([['fictif']]);
  expect(zone.querySelector('[role=status]')?.textContent).toContain('لم تُفعّل المزامنة');
});
