import { createHash, webcrypto } from 'node:crypto';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { doitMigrerHachage, hacher, nouveauJeton, verifierMdp } from '../compte';

afterEach(() => vi.unstubAllGlobals());

describe('compatibilité et durcissement du mot de passe local', () => {
  it('vérifie un ancien hachage de repli même si WebCrypto est maintenant disponible et signale sa migration', async () => {
    // Résultat de l'ancien algorithme pour « kunz::مرحبا-🧪 » (UTF-16).
    const ancien = '3d812d7e75783fe4';
    expect(doitMigrerHachage(ancien)).toBe(true);
    vi.stubGlobal('crypto', webcrypto);
    expect(await verifierMdp('مرحبا-🧪', ancien)).toBe(true);
    expect(await verifierMdp('mot incorrect', ancien)).toBe(false);
    vi.stubGlobal('crypto', undefined);
    expect(await verifierMdp('مرحبا-🧪', ancien)).toBe(true);
  });

  it('vérifie un ancien SHA-256 non salé et signale sa migration vers PBKDF2', async () => {
    const ancien = createHash('sha256').update('kunz::مرحبا-🧪').digest('hex');
    expect(doitMigrerHachage(ancien)).toBe(true);
    vi.stubGlobal('crypto', webcrypto);
    expect(await verifierMdp('مرحبا-🧪', ancien)).toBe(true);
    vi.stubGlobal('crypto', undefined);
    expect(await verifierMdp('مرحبا-🧪', ancien)).toBe(true);
    expect(await verifierMdp('mot incorrect', ancien)).toBe(false);
  });

  it.each(['secret', 'مرحبا-🧪', 'x'.repeat(200)])(
    'produit un hachage PBKDF2-SHA256 salé vérifiable avec et sans WebCrypto pour %s',
    async (mdp) => {
      vi.stubGlobal('crypto', webcrypto);
      const h1 = await hacher(mdp);
      const h2 = await hacher(mdp);
      expect(h1).toMatch(/^pbkdf2\$60000\$[0-9a-f]{32}\$[0-9a-f]{64}$/);
      expect(h2).toMatch(/^pbkdf2\$60000\$[0-9a-f]{32}\$[0-9a-f]{64}$/);
      expect(h1).not.toBe(h2); // sel aléatoire distinct à chaque hachage
      expect(doitMigrerHachage(h1)).toBe(false);

      expect(await verifierMdp(mdp, h1)).toBe(true);
      expect(await verifierMdp(`${mdp}!`, h1)).toBe(false);

      // Interopérabilité stricte entre WebCrypto et repli @noble/hashes
      vi.stubGlobal('crypto', undefined);
      expect(await verifierMdp(mdp, h1)).toBe(true);
      expect(await verifierMdp(`${mdp}!`, h1)).toBe(false);

      vi.stubGlobal('crypto', {
        subtle: {
          importKey: () => Promise.reject(new Error('indisponible')),
          deriveBits: () => Promise.reject(new Error('indisponible')),
        },
      });
      const h3 = await hacher(mdp);
      expect(h3).toMatch(/^pbkdf2\$60000\$[0-9a-f]{32}\$[0-9a-f]{64}$/);
      vi.stubGlobal('crypto', webcrypto);
      expect(await verifierMdp(mdp, h3)).toBe(true);
    },
  );

  it('refuse les hachages absents, tronqués ou PBKDF2 mal formés', async () => {
    const invalides = [
      '',
      'pas-un-hash',
      'a'.repeat(15),
      'a'.repeat(65),
      'pbkdf2$10$' + 'a'.repeat(32) + '$' + 'b'.repeat(64), // itérations trop faibles
      'pbkdf2$60000$court$' + 'b'.repeat(64),
      'pbkdf2$60000$' + 'a'.repeat(32) + '$court',
      'pbkdf2$60000$' + 'a'.repeat(32),
    ];
    for (const hash of invalides) {
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
