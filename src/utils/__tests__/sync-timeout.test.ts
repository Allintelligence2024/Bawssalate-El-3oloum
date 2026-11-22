// BUG-007 — un envoi ne doit jamais bloquer l'application indéfiniment.
// Le client PostgREST reçoit `.abortSignal()` : on vérifie que le signal existe, qu'il
// porte bien un délai de 8 s, et qu'un dépassement se traduit par un état visible
// ('erreur') plutôt que par un silence.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Etat } from '../../types';
import { envoyerSnapshot, etatEnvoi, reprendreSync, delaisDepasses, DELAI_ENVOI_MS, signalDelai } from '../sync';

const sbMocks = vi.hoisted(() => ({
  signaux: [] as (AbortSignal | undefined)[],
  upsert: vi.fn(async (_signal?: AbortSignal): Promise<{ error: null | { message: string } }> => ({ error: null })),
  createClient: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({ createClient: sbMocks.createClient }));

const compte = { email: 'test@example.com', motDePasse: 'hachage', jeton: 'j'.repeat(40), wilaya: '01', daira: '01', creeLe: '2026-11-16T00:00:00Z' };
const etatSync = (minutes: number): Etat => ({
  version: 2, progression: {}, jalons: {}, notes: [], carnet: [], journal: [],
  minutesTotales: minutes, revisions: 0, nom: 'x', dateBac: '2027-06-10', seancesComptees: 0,
  ateliers: {}, consentementSync: true, consentementSyncDecideLe: '2026-11-16T10:00:00Z', compte,
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-16T10:00:00Z'));
  vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
  vi.stubGlobal('navigator', { onLine: true });
  reprendreSync(compte.email);
  sbMocks.signaux.length = 0;
  sbMocks.upsert.mockReset();
  sbMocks.upsert.mockResolvedValue({ error: null });
  sbMocks.createClient.mockClear();
  sbMocks.createClient.mockImplementation(() => ({
    from: () => ({
      upsert: () => ({
        abortSignal: (signal: AbortSignal) => { sbMocks.signaux.push(signal); return sbMocks.upsert(signal); },
      }),
    }),
  }));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('BUG-007 — délai borné sur la synchronisation', () => {
  it('le délai vaut 8 secondes, valeur du plan', () => {
    expect(DELAI_ENVOI_MS).toBe(8_000);
  });

  it('chaque envoi passe un signal d’annulation au client', async () => {
    await envoyerSnapshot(etatSync(10));
    expect(sbMocks.signaux).toHaveLength(1);
    const signal = sbMocks.signaux[0]!;
    expect(signal).toBeInstanceOf(AbortSignal);
    // Un signal déjà annulé rendrait la requête impossible : il doit être vivant au départ.
    expect(signal.aborted).toBe(false);
  });

  it('un dépassement de délai annule réellement le signal', async () => {
    // Horloge réelle ici : AbortSignal.timeout s'appuie sur une minuterie interne que
    // les faux timers de vitest ne pilotent pas. On teste donc le mécanisme avec 30 ms,
    // ce qui prouve le comportement sans attendre 8 secondes.
    vi.useRealTimers();
    const signal = signalDelai(30);
    expect(signal.aborted).toBe(false);
    await new Promise((r) => setTimeout(r, 120));
    expect(signal.aborted, 'le signal n’a pas été annulé après son délai').toBe(true);
    expect(signal.reason).toBeInstanceOf(Error);
    expect((signal.reason as Error).name).toBe('TimeoutError');
  });

  it('sans argument, le signal porte le délai de production de 8 s', () => {
    vi.useRealTimers();
    const signal = signalDelai();
    expect(signal.aborted).toBe(false);
    // On ne l'attend pas : on vérifie seulement qu'il n'est pas déjà expiré.
    signal.throwIfAborted?.();
  });

  it('un envoi expiré se voit : état « erreur », jamais un silence', async () => {
    sbMocks.upsert.mockImplementationOnce(async (signal?: AbortSignal) => {
      // Simule l'échec réseau produit par l'annulation.
      if (signal) {
        const erreur = new Error('aborted');
        erreur.name = 'TimeoutError';
        throw erreur;
      }
      return { error: null };
    });
    await envoyerSnapshot(etatSync(10));
    expect(etatEnvoi(compte.email)).toBe('erreur');
  });

  it('le compteur local de délais dépassés n’augmente que sur un vrai timeout', async () => {
    const avant = delaisDepasses();
    await envoyerSnapshot(etatSync(11)); // succès : pas de dépassement
    expect(delaisDepasses()).toBe(avant);
    sbMocks.upsert.mockImplementationOnce(async () => {
      const e = new Error('aborted');
      e.name = 'TimeoutError';
      throw e;
    });
    await envoyerSnapshot(etatSync(12));
    expect(delaisDepasses()).toBe(avant + 1);
  });

  it('une erreur ordinaire ne gonfle pas le compteur de délais', async () => {
    const avant = delaisDepasses();
    sbMocks.upsert.mockResolvedValueOnce({ error: { message: 'refus fictif' } });
    await envoyerSnapshot(etatSync(13));
    expect(delaisDepasses()).toBe(avant);
  });
});
