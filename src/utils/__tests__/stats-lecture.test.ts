import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('protection des statistiques illisibles', () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => vi.unstubAllGlobals());

  it('ne remplace pas les données présentes après une erreur de lecture', async () => {
    const setItem = vi.fn();
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', { getItem: () => { throw Error('refus'); }, setItem });
    const { noterReponse, restaurerStats, statsActuelles } = await import('../stats');
    const { surEchecSauvegarde } = await import('../echecsStockage');
    const alerte = vi.fn();
    const stop = surEchecSauvegarde(alerte);
    noterReponse('phase', true);
    expect(setItem).not.toHaveBeenCalled();
    expect(alerte).toHaveBeenCalled();
    restaurerStats(statsActuelles());
    expect(setItem).toHaveBeenCalledTimes(1);
    stop();
  });

  it('protège également les statistiques au format incohérent', async () => {
    const setItem = vi.fn();
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', { getItem: () => '{"justes":"non"}', setItem });
    const { noterReponse } = await import('../stats');
    noterReponse('phase', false);
    expect(setItem).not.toHaveBeenCalled();
  });
});
