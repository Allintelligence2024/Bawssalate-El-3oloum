import { expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { protocoleSyncVerifiee } from '../protocoleSyncVerifiee';

function fixture() {
  const repondre = vi.fn();
  const rpc = vi.fn(() => ({ abortSignal: repondre }));
  return { rpc, repondre, api: protocoleSyncVerifiee({ rpc } as unknown as Pick<SupabaseClient, 'rpc'>) };
}

it('refuse les contrats inattendus et garde la génération dans chaque mutation', async () => {
  const { api, rpc, repondre } = fixture();
  repondre.mockResolvedValueOnce({ data: [{ generation: 2, autorise: false }] });
  expect(await api.etat()).toEqual({ generation: 2, autorise: false });
  repondre.mockResolvedValueOnce({ data: '3' });
  expect(await api.consentir(2)).toEqual({ resultat: 'indetermine' });
  repondre.mockResolvedValueOnce({ data: 3 });
  expect(await api.consentir(2)).toEqual({ resultat: 'confirme', generation: 3 });
  repondre.mockResolvedValueOnce({ data: false });
  expect(await api.ecrire(1, { minutes_totales: 5 })).toBe('refuse');
  expect(rpc.mock.lastCall).toEqual(['kunz_sync_ecrire', { attendue: 1, contenu: { minutes_totales: 5 } }]);
  expect(await api.effacer(Number.MAX_SAFE_INTEGER + 1)).toBe('refuse');
  expect(rpc).toHaveBeenCalledTimes(4);
});

it('ne confond pas une réponse perdue et un effacement confirmé ; le retry garde la génération', async () => {
  const { api, rpc, repondre } = fixture();
  repondre.mockRejectedValueOnce(new Error('coupure simulée')).mockResolvedValueOnce({ data: true });
  expect(await api.effacer(3)).toBe('indetermine');
  expect(rpc).toHaveBeenCalledOnce();
  expect(await api.effacer(3)).toBe('confirme');
  expect(rpc.mock.calls).toEqual(Array(2).fill(['kunz_sync_effacer', { attendue: 3 }]));
  expect(repondre.mock.calls[0][0]).toBeInstanceOf(AbortSignal);
});
