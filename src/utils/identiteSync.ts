// Phase 1 : identité web séparée du compte local et du client de synchronisation historique.
import type { SupabaseClient } from '@supabase/supabase-js';

type AuthVerification = Pick<SupabaseClient['auth'], 'signInWithOtp' | 'exchangeCodeForSession'>;
export type DemandeVerification = 'lien_demande' | 'indisponible';
export type RetourVerification = 'sans_code' | 'verifie' | 'echec';

/** Origine de publication fournie par la configuration, jamais par un paramètre d'URL. */
export function adresseRetourVerification(originePubliee: string): string {
  const origine = new URL(originePubliee);
  if (origine.protocol !== 'https:' || origine.href !== `${origine.origin}/`) {
    throw new Error('Origine HTTPS de publication requise');
  }
  return `${origine.origin}/?verification-sync=1`;
}

export async function demanderLienVerification(auth: AuthVerification, email: string, originePubliee: string): Promise<DemandeVerification> {
  try {
    const emailRedirectTo = adresseRetourVerification(originePubliee);
    const { error } = await auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo } });
    return error ? 'indisponible' : 'lien_demande';
  } catch {
    return 'indisponible';
  }
}

/** Efface le code de la barre d'adresse avant l'échange ; le lien se rouvre sur demande en cas d'échec. */
export async function terminerVerification(
  auth: AuthVerification,
  adresse: URL,
  remplacerAdresse: (url: string) => void,
): Promise<RetourVerification> {
  if (adresse.searchParams.get('verification-sync') !== '1') return 'sans_code';
  const codes = adresse.searchParams.getAll('code');
  const retourPropre = new URL(adresse.origin + adresse.pathname);
  remplacerAdresse(retourPropre.pathname);
  if (codes.length !== 1 || !codes[0]) return 'echec';
  try {
    const { data, error } = await auth.exchangeCodeForSession(codes[0]);
    return !error && data.session?.user.email_confirmed_at ? 'verifie' : 'echec';
  } catch {
    return 'echec';
  }
}

export async function creerClientIdentiteSync(url: string, clePublique: string) {
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(url, clePublique, {
    auth: { flowType: 'pkce', detectSessionInUrl: false, storageKey: 'kunz-identite-sync-v1' },
  });
}
