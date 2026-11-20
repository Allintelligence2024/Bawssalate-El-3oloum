import { afterEach, expect, it, vi } from 'vitest';

function stockageFictif() {
  const donnees = new Map<string, string>();
  const setItem = vi.fn((cle: string, valeur: string) => { donnees.set(cle, valeur); });
  vi.stubGlobal('localStorage', {
    getItem: (cle: string) => donnees.get(cle) ?? null,
    setItem,
    removeItem: (cle: string) => donnees.delete(cle),
  });
  vi.resetModules();
  return { donnees, setItem };
}
afterEach(() => vi.unstubAllGlobals());

it('publie progression et statistiques ensemble, même après redémarrage simulé', async () => {
  const { setItem } = stockageFictif();
  const { etatVierge } = await import('../../types');
  const { restaurerProgression, sauvegarderEtat, chargerEtat, paquetExportComplet } = await import('../storage');
  const { statsActuelles, noterReponse } = await import('../stats');
  const initial = { ...etatVierge(), consentementSync: true };
  const restores = { ...statsActuelles(), justes: 3 };
  const nouveau = restaurerProgression(initial, { ...etatVierge(), minutesTotales: 80 }, restores)!;
  expect(setItem).toHaveBeenCalledTimes(1);
  expect(nouveau.consentementSync).toBe(true);
  expect(statsActuelles().justes).toBe(3);
  sauverSansStats();
  noterReponse('phase', true);
  vi.resetModules();
  const disk = await import('../storage');
  expect(disk.chargerEtat().minutesTotales).toBe(90);
  expect((await import('../stats')).statsActuelles().justes).toBe(4);
  expect(JSON.stringify(paquetExportComplet(chargerEtat()))).not.toContain('__statsRestaureesV1');
  function sauverSansStats() { sauvegarderEtat({ ...nouveau, minutesTotales: 90 }); }
});

it('garde les deux anciennes données et la mémoire si le quota bloque le commit', async () => {
  const { donnees, setItem } = stockageFictif();
  const { etatVierge } = await import('../../types');
  const { sauvegarderEtat, restaurerProgression } = await import('../storage');
  const { statsActuelles, noterReponse } = await import('../stats');
  const initial = { ...etatVierge(), minutesTotales: 12 };
  sauvegarderEtat(initial);
  noterReponse('phase', true);
  const avant = [...donnees];
  const stats = statsActuelles();
  setItem.mockImplementationOnce(() => { throw new DOMException('quota', 'QuotaExceededError'); });
  expect(restaurerProgression(initial, { ...initial, minutesTotales: 80 }, { ...stats, justes: 3 })).toBeNull();
  expect([...donnees]).toEqual(avant);
  expect(statsActuelles()).toBe(stats);
});
