// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { etatHorsLigne } from '../pwa';

afterEach(() => { vi.unstubAllGlobals(); document.head.innerHTML = ''; });
function simulation(resultat: unknown) {
  const postMessage = vi.fn((_data, ports) => { queueMicrotask(() => ports[0].envoi(resultat)); });
  vi.stubGlobal('navigator', { serviceWorker: { controller: { postMessage } } });
  vi.stubGlobal('MessageChannel', class {
    port1: any = { onmessage: null, close: vi.fn() };
    port2: any = { envoi: (data: unknown) => this.port1.onmessage({ data }) };
  });
  document.head.innerHTML = '<meta name="kunz-build-id" content="abc">';
  return postMessage;
}

describe('état hors ligne de la page courante', () => {
  it('demande la reprise et accepte uniquement un état cohérent de la même version', async () => {
    const post = simulation({ ok: true, version: 'abc', total: 10, manquants: 1, octets: 42 });
    expect(await etatHorsLigne(true)).toMatchObject({ total: 10, manquants: 1 });
    expect(post.mock.calls[0][0]).toEqual({ type: 'TELECHARGER_HORS_LIGNE' });
  });
  it('ne promet pas le hors ligne si la version ou le décompte ne correspond pas', async () => {
    simulation({ ok: true, version: 'ancienne', total: 10, manquants: 0, octets: 42 });
    await expect(etatHorsLigne()).rejects.toThrow();
    simulation({ ok: true, version: 'abc', total: 10, manquants: 11, octets: 42 });
    await expect(etatHorsLigne()).rejects.toThrow();
  });
  it('indique l’indisponibilité sans worker contrôlant la page', async () => {
    vi.stubGlobal('navigator', {});
    await expect(etatHorsLigne()).rejects.toThrow();
  });
});
