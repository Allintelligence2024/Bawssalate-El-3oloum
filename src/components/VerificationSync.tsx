import EssaiSyncVerifiee from './EssaiSyncVerifiee';
import { protocoleSyncVerifiee } from '../utils/protocoleSyncVerifiee';
import { useEffect, useState, type FormEvent } from 'react';
import { creerClientIdentiteSync, demanderLienVerification, terminerVerification, type RetourVerification } from '../utils/identiteSync';

export interface ConfigurationVerification {
  origine: string;
  urlAuth: string;
  clePublique: string;
  essaiRpc?: boolean;
}

type Phase = 'pret' | 'en_cours' | 'lien_demande' | 'indisponible' | RetourVerification;
const textes: Record<Phase, string> = {
  pret: '', sans_code: '', en_cours: 'يرجى الانتظار…',
  lien_demande: 'طُلب إرسال الرابط. افتحه في المتصفح نفسه، وتحقق من مجلد الرسائل غير المرغوب فيها.',
  indisponible: 'تعذّر طلب الرابط. تحقق من الاتصال وحاول مجددًا.',
  echec: 'تعذّر تأكيد البريد. اطلب رابطًا جديدًا من هذا المتصفح.',
  verifie: 'تم تأكيد البريد الإلكتروني. لم تُفعّل المزامنة ولم تُرسل بيانات تقدّمك.',
};

export default function VerificationSync({ config }: { config: ConfigurationVerification }) {
  const [client] = useState(() => {
    let connexion: ReturnType<typeof creerClientIdentiteSync> | undefined;
    let retour: Promise<RetourVerification> | undefined;
    const obtenir = () => connexion ??= creerClientIdentiteSync(config.urlAuth, config.clePublique);
    return {
      obtenir,
      retour: () => retour ??= (async () => {
        const adresse = new URL(window.location.href);
        if (adresse.searchParams.get('verification-sync') !== '1') return 'sans_code';
        // Nettoyer même si le chargement du client Auth échoue (p. ex. hors ligne).
        window.history.replaceState(window.history.state, '', '/');
        try {
          const sb = await obtenir();
          return terminerVerification(sb.auth, adresse, () => {});
        } catch { return 'echec'; }
      })(),
    };
  });
  const [phase, setPhase] = useState<Phase>(() => new URLSearchParams(window.location.search).get('verification-sync') === '1' ? 'en_cours' : 'pret');
  const [api, setApi] = useState<ReturnType<typeof protocoleSyncVerifiee> | null>(null);
  useEffect(() => {
    let actif = true;
    void client.retour().then(async (resultat) => {
      if (!actif || resultat === 'sans_code') return;
      setPhase(resultat);
      if (resultat === 'verifie' && config.essaiRpc) {
        const sb = await client.obtenir();
        const { data } = await sb.auth.getSession();
        const session = data.session;
        if (!actif || !session?.user.email_confirmed_at) return;
        const { createClient } = await import('@supabase/supabase-js');
        // Épingler la session de recette : un changement de compte dans un autre onglet
        // ne doit pas rediriger un retry vers un autre profil. Pas de renouvellement automatique.
        const rpc = createClient(config.urlAuth, config.clePublique, { accessToken: async () => session.access_token });
        if (actif) setApi(protocoleSyncVerifiee(rpc));
      }
    }).catch(() => { if (actif) setPhase('echec'); });
    return () => { actif = false; };
  }, [client, config.essaiRpc, config.urlAuth, config.clePublique]);

  async function demander(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (phase === 'en_cours') return;
    const email = String(new FormData(e.currentTarget).get('email') ?? '');
    setPhase('en_cours');
    try {
      const sb = await client.obtenir();
      setPhase(await demanderLienVerification(sb.auth, email, config.origine));
    } catch { setPhase('indisponible'); }
  }

  return <aside dir="rtl" className="mx-auto my-4 max-w-3xl rounded-xl border p-4" aria-label="التحقق من البريد الإلكتروني">
    <p>التحقق من البريد الإلكتروني — تجربة اختيارية، لا تُفعّل المزامنة.</p>
    {phase !== 'verifie' && <form onSubmit={demander} className="flex flex-wrap items-center gap-2">
      <label>البريد الإلكتروني <input name="email" type="email" autoComplete="email" dir="ltr" required maxLength={254} className="rounded border px-2" /></label>
      <button type="submit" disabled={phase === 'en_cours'} className="rounded border px-3 py-1">اطلب رابط التحقق</button>
    </form>}
    <p role="status">{textes[phase]}</p>
    {api && <EssaiSyncVerifiee api={api} />}
  </aside>;
}
