import { createHash, webcrypto } from 'node:crypto';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { hacher, nouveauJeton, verifierMdp } from '../compte';

afterEach(() => vi.unstubAllGlobals());

describe('compatibilité du mot de passe local', () => {
  it('vérifie un ancien hachage de repli même si WebCrypto est maintenant disponible', async () => {
    // Résultat de l'ancien algorithme pour « kunz::مرحبا-🧪 » (UTF-16).
    const ancien = '3d812d7e75783fe4';
    vi.stubGlobal('crypto', webcrypto);
    expect(await verifierMdp('مرحبا-🧪', ancien)).toBe(true);
    expect(await verifierMdp('mot incorrect', ancien)).toBe(false);
    vi.stubGlobal('crypto', undefined);
    expect(await verifierMdp('مرحبا-🧪', ancien)).toBe(true);
  });

  it('vérifie un ancien SHA-256 lorsque WebCrypto est indisponible', async () => {
    const ancien = createHash('sha256').update('kunz::مرحبا-🧪').digest('hex');
    vi.stubGlobal('crypto', undefined);
    expect(await verifierMdp('مرحبا-🧪', ancien)).toBe(true);
    expect(await verifierMdp('mot incorrect', ancien)).toBe(false);
  });

  it.each(['secret', 'مرحبا-🧪', 'x'.repeat(1000), '\ud800'])('produit le même SHA-256 pour %s, avec ou sans WebCrypto', async (mdp) => {
    const attendu = createHash('sha256').update(`kunz::${mdp}`).digest('hex');
    vi.stubGlobal('crypto', webcrypto);
    expect(await hacher(mdp)).toBe(attendu);
    vi.stubGlobal('crypto', undefined);
    expect(await hacher(mdp)).toBe(attendu);
    vi.stubGlobal('crypto', { subtle: { digest: () => Promise.reject(new Error('indisponible')) } });
    expect(await hacher(mdp)).toBe(attendu);
  });

  it('refuse les hachages absents ou de format inconnu', async () => {
    for (const hash of ['', 'pas-un-hash', 'a'.repeat(15), 'a'.repeat(65)]) {
      expect(await verifierMdp('secret', hash)).toBe(false);
    }
  });
});

describe('jeton de synchronisation', () => {
  it('ne fabrique pas de jeton sans source aléatoire cryptographique', () => {
    vi.stubGlobal('crypto', undefined);
    expect(nouveauJeton()).toBeUndefined();
    vi.stubGlobal('crypto', { getRandomValues: () => { throw new Error('indisponible'); } });
    expect(nouveauJeton()).toBeUndefined();
  });
  it('utilise les octets cryptographiques disponibles', () => {
    vi.stubGlobal('crypto', { getRandomValues: (b: Uint8Array) => b.fill(42) });
    expect(nouveauJeton()).toBe('2a'.repeat(16));
  });
});
