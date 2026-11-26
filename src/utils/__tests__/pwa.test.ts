// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { etatHorsLigne } from '../pwa';
import { legendeArSecurisee, urlIllustration } from '../illustrations';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); document.head.innerHTML = ''; });
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
    const post = simulation({ ok: true, version: 'abc', total: 10, manquants: 1, octets: 42, octetsCoquille: 30, octetsContenu: 12 });
    expect(await etatHorsLigne(true)).toMatchObject({ total: 10, manquants: 1 });
    // Sans portée explicite, un téléchargement vise tout le contenu.
    expect(post.mock.calls[0][0]).toEqual({ type: 'TELECHARGER_CONTENU' });
  });

  it('distingue la coquille du contenu lourd', async () => {
    const post = simulation({ ok: true, version: 'abc', total: 5, manquants: 0, octets: 30, octetsCoquille: 30, octetsContenu: 12 });
    await etatHorsLigne(true, 'coquille');
    expect(post.mock.calls[0][0]).toEqual({ type: 'TELECHARGER_HORS_LIGNE' });
    // L'état ne dépend pas du niveau : il compte toujours le périmètre demandé.
    await etatHorsLigne(false, 'coquille');
    expect(post.mock.calls[1][0]).toEqual({ type: 'ETAT_HORS_LIGNE' });
  });

  it('refuse un état sans les deux poids séparés', async () => {
    simulation({ ok: true, version: 'abc', total: 10, manquants: 0, octets: 42 });
    await expect(etatHorsLigne()).rejects.toThrow();
  });
  it('ne promet pas le hors ligne si la version ou le décompte ne correspond pas', async () => {
    simulation({ ok: true, version: 'ancienne', total: 10, manquants: 0, octets: 42, octetsCoquille: 30, octetsContenu: 12 });
    await expect(etatHorsLigne()).rejects.toThrow();
    simulation({ ok: true, version: 'abc', total: 10, manquants: 11, octets: 42, octetsCoquille: 30, octetsContenu: 12 });
    await expect(etatHorsLigne()).rejects.toThrow();
  });
  it('indique l’indisponibilité sans worker contrôlant la page', async () => {
    vi.stubGlobal('navigator', {});
    await expect(etatHorsLigne()).rejects.toThrow();
  });
});

describe('urlIllustration — Phase 2', () => {
  it('replie sur BASE_URL + lecons/img/ sans variable R2', () => {
    vi.stubEnv('VITE_ILLUSTRATIONS_BASE_URL', '');
    expect(urlIllustration('doc02.webp')).toBe('/lecons/img/doc02.webp');
  });

  it('utilise la base Cloudflare R2 optionnelle, avec ou sans slash final', () => {
    vi.stubEnv('VITE_ILLUSTRATIONS_BASE_URL', 'https://r2.example.test/lecons/img');
    expect(urlIllustration('doc02.webp')).toBe('https://r2.example.test/lecons/img/doc02.webp');
    vi.stubEnv('VITE_ILLUSTRATIONS_BASE_URL', 'https://r2.example.test/lecons/img/');
    expect(urlIllustration('doc02.webp')).toBe('https://r2.example.test/lecons/img/doc02.webp');
  });

  it('refuse un nom de fichier qui n’est pas un simple .webp', () => {
    expect(() => urlIllustration('../secret.jpg')).toThrow();
    expect(() => urlIllustration('doc02.png')).toThrow();
  });
});

describe('legendeArSecurisee — Phase 2', () => {
  it('garde la mise en forme RTL mais supprime attributs et balises exécutables', () => {
    const net = legendeArSecurisee(
      '<span onclick="voler()"><strong>الوثيقة</strong><script>alerte()</script><em>نص</em></span>',
    );
    expect(net).toBe('<span><strong>الوثيقة</strong>alerte()<em>نص</em></span>');
    expect(net).not.toContain('onclick');
    expect(net).not.toContain('<script');
  });

  it('accepte une légende absente', () => {
    expect(legendeArSecurisee(undefined)).toBe('');
  });
});
