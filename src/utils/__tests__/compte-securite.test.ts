import { describe, it, expect, vi, afterEach } from 'vitest';
import { nouveauJeton } from '../compte';

afterEach(() => vi.unstubAllGlobals());
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
