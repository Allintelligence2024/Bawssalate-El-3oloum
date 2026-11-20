import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { adresseRetourVerification, demanderLienVerification, terminerVerification } from '../identiteSync';

function authFictive() {
  return {
    signInWithOtp: vi.fn<SupabaseClient['auth']['signInWithOtp']>(),
    exchangeCodeForSession: vi.fn<SupabaseClient['auth']['exchangeCodeForSession']>(),
  };
}

describe('lien de vérification de la synchronisation web', () => {
  it('adresse le lien à une origine HTTPS fixe et ne confond pas demande et vérification', async () => {
    const auth = authFictive();
    auth.signInWithOtp.mockResolvedValue({ data: { user: null, session: null }, error: null });
    expect(await demanderLienVerification(auth, ' test@example.invalid ', 'https://app.example.invalid')).toBe('lien_demande');
    expect(auth.signInWithOtp).toHaveBeenCalledWith({ email: 'test@example.invalid', options: { emailRedirectTo: 'https://app.example.invalid/?verification-sync=1' } });
    expect(auth.exchangeCodeForSession).not.toHaveBeenCalled();
    for (const origine of ['http://app.example.invalid', 'https://app.example.invalid/?next=ailleurs']) {
      expect(() => adresseRetourVerification(origine)).toThrow();
    }
  });

  it('renvoie un échec générique si la demande échoue', async () => {
    const auth = authFictive();
    auth.signInWithOtp.mockRejectedValue(new Error('réseau'));
    expect(await demanderLienVerification(auth, 'test@example.invalid', 'https://app.example.invalid')).toBe('indisponible');
  });

  it('confirme uniquement une session avec adresse vérifiée', async () => {
    const auth = authFictive();
    const user = { id: 'fictif', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '2026-11-19' };
    const session = { access_token: 'fictif', refresh_token: 'fictif', expires_in: 60, token_type: 'bearer' as const, user };
    const retour = new URL('https://app.example.invalid/?verification-sync=1&code=fictif');
    auth.exchangeCodeForSession.mockResolvedValueOnce({ data: { user, session }, error: null });
    expect(await terminerVerification(auth, retour, vi.fn())).toBe('echec');
    const confirme = { ...user, email_confirmed_at: '2026-11-19' };
    auth.exchangeCodeForSession.mockResolvedValueOnce({ data: { user: confirme, session: { ...session, user: confirme } }, error: null });
    expect(await terminerVerification(auth, retour, vi.fn())).toBe('verifie');
  });

  it('nettoie le retour avant échange et ne confirme pas sans session', async () => {
    const auth = authFictive();
    const nettoyer = vi.fn();
    auth.exchangeCodeForSession.mockImplementation(async () => {
      expect(nettoyer).toHaveBeenCalledWith('/');
      throw new Error('code expiré ou autre navigateur');
    });
    expect(await terminerVerification(auth, new URL('https://app.example.invalid/?verification-sync=1&code=fictif'), nettoyer)).toBe('echec');
    expect(auth.exchangeCodeForSession).toHaveBeenCalledOnce();
    expect(await terminerVerification(auth, new URL('https://app.example.invalid/?verification-sync=1&code=a&code=b'), nettoyer)).toBe('echec');
    expect(await terminerVerification(auth, new URL('https://app.example.invalid/?code=a'), nettoyer)).toBe('sans_code');
    expect(auth.exchangeCodeForSession).toHaveBeenCalledOnce();
  });
});
