// شاشة الحساب — إنشاء حساب (بريد + كلمة مرور + ولاية + دائرة) ثم الدخول.
// إجبارية بعد شاشة الإقلاع: لا وصول للتطبيق قبل حساب محلي.
// كل شيء يبقى في هذا الجهاز — لا إرسال ولا خادم.

import { useState } from 'react';
import type { Compte } from '../types';
import { WILAYAS, WILAYA_PAR_CODE } from '../data/wilayas';
import {
  MIN_MDP,
  courrielValide,
  hacher,
  messageCompte,
  nouveauJeton,
  normaliserEmail,
  verifierMdp,
} from '../utils/compte';

interface Props {
  compte?: Compte;
  onValide: (compte: Compte) => void;
  onSupprimerCompte?: () => void;
}

type Vue = 'creation' | 'connexion';

export default function Inscription({ compte, onValide, onSupprimerCompte }: Props) {
  const [vue, setVue] = useState<Vue>(compte ? 'connexion' : 'creation');
  const [email, setEmail] = useState(compte?.email ?? '');
  const [mdp, setMdp] = useState('');
  const [mdp2, setMdp2] = useState('');
  const [wilaya, setWilaya] = useState(compte?.wilaya ?? '');
  const [daira, setDaira] = useState(compte?.daira ?? '');
  const [voirMdp, setVoirMdp] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [occupe, setOccupe] = useState(false);
  const [confirmeEffacer, setConfirmeEffacer] = useState(false);

  const wilayaChoisie = wilaya ? WILAYA_PAR_CODE[wilaya] : undefined;
  const dairas = wilayaChoisie?.dairas ?? [];

  function annoncer(texte: string) {
    setErreur(texte);
  }

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    if (occupe) return;
    setErreur(null);

    if (!courrielValide(email)) return annoncer(messageCompte('email'));
    if (vue === 'connexion') {
      if (!compte) return annoncer('لا يوجد حساب على هذا الجهاز. أنشئ حسابًا جديدًا.');
      if (normaliserEmail(email) !== compte.email) {
        return annoncer('لا يوجد حساب بهذا البريد على هذا الجهاز.');
      }
      if (mdp.length === 0) return annoncer(messageCompte('mdp'));
      setOccupe(true);
      if (!compte.motDePasse) {
        setOccupe(false);
        return annoncer('لا يمكن التحقّق من كلمة مرور هذا الحساب القديم. يمكنك حذف الحساب المحلي مع إبقاء تقدّمك وإنشاء حساب جديد؛ هذا لا يستعيد رمز الخادم.');
      }
      const bon = await verifierMdp(mdp, compte.motDePasse);
      if (!bon) {
        setOccupe(false);
        return annoncer(messageCompte('mdp', { mdp: true }));
      }
      // Migrer l'ancien repli uniquement après vérification du mot de passe.
      const motDePasse = compte.motDePasse.length === 16 ? await hacher(mdp) : compte.motDePasse;
      setOccupe(false);
      onValide({ ...compte, motDePasse });
      return;
    }

    if (mdp.length < MIN_MDP) return annoncer(messageCompte('mdp'));
    if (mdp !== mdp2) return annoncer(messageCompte('mdp2'));
    if (!wilaya) return annoncer(messageCompte('wilaya'));
    if (!daira) return annoncer(messageCompte('daira'));

    setOccupe(true);
    const hash = await hacher(mdp);
    setOccupe(false);
    onValide({
      email: normaliserEmail(email),
      motDePasse: hash,
      jeton: nouveauJeton(), // exigé par la policy UPDATE côté Supabase (écriture protégée)
      wilaya,
      daira,
      creeLe: new Date().toISOString(),
    });
  }

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-forest-deep">
      {/* هالة ذهبية خلفية */}
      <div
        className="pointer-events-none fixed left-1/2 top-0 h-[60vmin] w-[60vmin] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(47,93,71,0.55), transparent 70%)' }}
      />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
        {/* الهوية */}
        <div className="mb-6 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-soft/80">
            بوصلة العلوم · ملفّ محلي على هذا الجهاز
          </p>
          <h1 className="font-naskh mt-1.5 text-4xl font-black text-paper">
            {vue === 'creation' ? 'أنشئ حسابك' : 'سجّل الدخول'}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-sage/90">
            {vue === 'creation'
              ? 'ملفّ محلي على هذا الجهاز فقط — لا خادم ولا إرسال تلقائي. المزامنة السحابية اختيارية تمامًا.'
              : 'أدخل بريدك وكلمة المرور لاستئناف ملفّك المحلي على هذا الجهاز.'}
          </p>
        </div>

        <form
          onSubmit={envoyer}
          noValidate
          className="rounded-3xl border border-line bg-paper p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
        >
          {/* البريد */}
          <label className="block text-xs font-bold text-ink-soft" htmlFor="email">
            البريد الإلكتروني
          </label>
          <input
            id="email"
            type="email"
            dir="ltr"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErreur(null);
            }}
            placeholder="eleve@gmail.com"
            className="field mt-1.5 text-start"
          />

          {/* كلمة المرور */}
          <label className="mt-4 block text-xs font-bold text-ink-soft" htmlFor="mdp">
            كلمة المرور
          </label>
          <div className="relative mt-1.5">
            <input
              id="mdp"
              type={voirMdp ? 'text' : 'password'}
              dir="ltr"
              autoComplete={vue === 'creation' ? 'new-password' : 'current-password'}
              value={mdp}
              onChange={(e) => {
                setMdp(e.target.value);
                setErreur(null);
              }}
              placeholder="••••••"
              className="field w-full pe-16"
            />
            <button
              type="button"
              onClick={() => setVoirMdp((v) => !v)}
              className="absolute end-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-[11px] font-bold text-mute transition-colors hover:text-forest"
            >
              {voirMdp ? 'إخفاء' : 'إظهار'}
            </button>
          </div>
          {vue === 'creation' && (
            <p className="mt-1.5 text-[11px] text-mute">6 أحرف على الأقل.</p>
          )}

          {/* تأكيد كلمة المرور — في الإنشاء فقط */}
          {vue === 'creation' && (
            <>
              <label className="mt-4 block text-xs font-bold text-ink-soft" htmlFor="mdp2">
                تأكيد كلمة المرور
              </label>
              <input
                id="mdp2"
                type={voirMdp ? 'text' : 'password'}
                dir="ltr"
                autoComplete="new-password"
                value={mdp2}
                onChange={(e) => {
                  setMdp2(e.target.value);
                  setErreur(null);
                }}
                placeholder="••••••"
                className="field mt-1.5"
              />
            </>
          )}

          {/* الولاية + الدائرة */}
          {vue === 'creation' && (
            <>
              <label className="mt-4 block text-xs font-bold text-ink-soft" htmlFor="wilaya">
                الولاية
              </label>
              <select
                id="wilaya"
                value={wilaya}
                onChange={(e) => {
                  setWilaya(e.target.value);
                  setDaira('');
                  setErreur(null);
                }}
                className="field mt-1.5"
              >
                <option value="">— اختر ولايتك —</option>
                {WILAYAS.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.nom}
                  </option>
                ))}
              </select>

              <label className="mt-4 block text-xs font-bold text-ink-soft" htmlFor="daira">
                الدائرة
              </label>
              <select
                id="daira"
                value={daira}
                disabled={!wilayaChoisie}
                onChange={(e) => {
                  setDaira(e.target.value);
                  setErreur(null);
                }}
                className="field mt-1.5 disabled:opacity-50"
              >
                <option value="">
                  {wilayaChoisie ? '— اختر دائرتك —' : 'اختر الولاية أولًا'}
                </option>
                {dairas.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* الخطأ */}
          {erreur && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-clay-soft bg-clay-soft/60 px-3 py-2 text-sm font-bold text-clay"
            >
              {erreur}
            </p>
          )}

          <button type="submit" disabled={occupe} className="btn btn-primary mt-5 w-full">
            {occupe ? 'لحظة من فضلك…' : vue === 'creation' ? 'أنشئ الحساب ←' : 'دخول ←'}
          </button>

          <button
            type="button"
            onClick={() => {
              setVue(vue === 'creation' ? 'connexion' : 'creation');
              setErreur(null);
              setMdp('');
              setMdp2('');
            }}
            className="mt-3 w-full text-center text-sm font-bold text-forest underline decoration-line underline-offset-4"
          >
            {vue === 'creation'
              ? compte
                ? 'لديك حساب على هذا الجهاز؟ سجّل الدخول'
                : 'لديك حساب؟ سجّل الدخول'
              : 'ليس لديك حساب؟ أنشئ حسابًا'}
          </button>

          {/* خيار آمن: حذف الحساب مع إبقاء التقدّم */}
          {compte && vue === 'connexion' && onSupprimerCompte && (
            <div className="mt-4 border-t border-line pt-4 text-center">
              {!confirmeEffacer ? (
                <button
                  type="button"
                  onClick={() => setConfirmeEffacer(true)}
                  className="text-xs font-bold text-mute transition-colors hover:text-clay"
                >
                  نسيت كلمة المرور؟ احذف الحساب وابدأ من جديد
                </button>
              ) : (
                <div><p className="mb-2 text-xs">يُحذف الحساب المحلي فقط ويظلّ التقدّم ومسوّدات مختبر البوصلة في هذا المتصفّح. لا يحذف هذا بيانات الخادم ولا يستعيد رمزها.</p><div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmeEffacer(false);
                      onSupprimerCompte();
                    }}
                    className="btn btn-ghost flex-1 text-sm text-clay"
                  >
                    احذف الحساب
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmeEffacer(false)}
                    className="btn btn-ghost flex-1 text-sm"
                  >
                    تراجع
                  </button>
                </div></div>
              )}
            </div>
          )}
        </form>

        <p className="mt-5 text-center text-[11px] leading-relaxed text-sage/75">
          ملفّ محلي على هذا الجهاز: كلمة المرور لا تُرسَل، والحساب لا يشفّر البيانات أو المسوّدات التي تبقى ظاهرة لأي مستخدم لهذا المتصفّح. على جهاز مشترك، استعمل «مسح كل بياناتي» من تبويب «أنا» قبل تسليمه.
        </p>
      </div>
    </div>
  );
}
