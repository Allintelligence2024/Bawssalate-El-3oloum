// التطبيق — 5 تبويبات (اليوم / مساري / تدريبات / منهجية / أنا) + أوضاع جلسة كاملة الشاشة.
// تصميم حديث، ترفيهي، أصوات تفاعل، تأثيرات تصفيق.
// كل الحالة في localStorage. لا خادم، لا تحليلات، لا تبعات ثقيلة.

import { lazy, Suspense, useEffect, useRef, useState, type ReactElement } from 'react';
import type { Etat, CarteKafaa, FauteCarnet } from './types';
import {
  abandonnerJournalRestauration, chargerEtat, CLE_ETAT, fusionnerProgressionImportee,
  restaurationBloqueeAuChargement, restaurerEtatEtStats, sauvegarderEtat,
  suspendreEcrituresLocalement, surEchecSauvegarde, surEtatPerime, verifierLectureEtat, viderStockage,
} from './utils/storage';
import { verifierCoherence } from './utils/coherenceStockage';
import { effacerAlerteStockage, signalerEchecStockage } from './utils/echecsStockage';
import { CLE_STATS, statsPourExport, type StatsReponses } from './utils/stats';
import { CLE_RESTAURATION, restaurationEnAttente, type CarnetBoussole } from './utils/carnetBoussole';
import { ajouterJours, aujourdhui } from './utils/dates';
import { debutSemaine, enregistrerSeance, modeIntensifActif, quotaDe } from './utils/moteur';
import { demarrerRevueCroisee, terminerRevueCroisee } from './utils/revueCroisee';
import { avancementDefi, choisirDefi, consoliderDefi } from './utils/defis';
import { envoyerSnapshot, syncActive, doitDemanderConsentement, suspendreSync, reprendreSync } from './utils/sync';
import type { ItemChemin } from './data/programme';
import type { SituationSynthese } from './data/syntheses';
import { SUJETS_OFFICIELS } from './data/sujetsOfficiels';
import type { Qualite } from './utils/srs';
import { mettreAJourSrs, mettreAJourSrsIntensif, premiereRevision } from './utils/srs';
import { synchroniserRappel } from './utils/rappels';
import Aujourdhui from './components/Aujourdhui';
import Masari from './components/Masari';
import Exercices from './components/Exercices';
// Methodologie est l'écran le plus lourd (~190 kB source) : chargé à la demande (React.lazy).
const Methodologie = lazy(() => import('./components/Methodologie'));
const Bac = lazy(() => import('./components/Bac'));
const BacPasAPas = lazy(() => import('./components/BacPasAPas'));
const Kouest = lazy(() => import('./components/Kouest'));
import EcranDemarrage from './components/EcranDemarrage';
import { ListeDonneesSync } from './components/CarteSync';
// P3.6 — écrans plein écran chargés à la demande : ils tirent les gros fichiers de données
// (lessonGoldSummaries, qcmLecons) qui n'ont rien à faire dans le chunk de démarrage.
const ExamBlanc = lazy(() => import('./components/ExamBlanc'));
const SyntheseLibre = lazy(() => import('./components/SyntheseLibre'));
const Ana = lazy(() => import('./components/Ana'));
const ProtocoleRunner = lazy(() => import('./components/ProtocoleRunner'));
const SessionRevision = lazy(() => import('./components/SessionRevision'));
const Confidentialite = lazy(() => import('./components/Confidentialite'));
const Mourchid = lazy(() => import('./components/Mourchid'));
const SchemaALegender = lazy(() => import('./components/SchemaALegender'));
const ChoixSynthese = lazy(() => import('./components/ChoixSynthese'));
const SujetsOfficiels = lazy(() => import('./components/SujetsOfficiels'));
const JalonUnite = lazy(() => import('./components/JalonUnite'));
const LecteurLecon = lazy(() => import('./components/LecteurLecon'));
const AtelierDomaine1 = lazy(() => import('./components/AtelierDomaine1'));
const AtelierImmunite = lazy(() => import('./components/AtelierImmunite'));
const AtelierOrogenese = lazy(() => import('./components/AtelierOrogenese'));
const AtelierStructureTerre = lazy(() => import('./components/AtelierStructureTerre'));
const Mindmap = lazy(() => import('./components/Mindmap'));
const Diagnostic = lazy(() => import('./components/Diagnostic'));
const Recherche = lazy(() => import('./components/Recherche'));
const Flashcards = lazy(() => import('./components/Flashcards'));
import Inscription from './components/Inscription';
import BaguetteXp from './components/BaguetteXp';
import GamifiedOverlay from './components/GamifiedOverlay';
import { fermerSession, ouvrirSession, sessionOuverte } from './utils/compte';
import type { Compte } from './types';
import {
  IcoCarnet,
  IcoBoussole,
  IcoDiplome,
  IcoLune,
  IcoRoute,
  IcoCible,
} from './components/Icones';

// أربعة أبواب فقط: كويست · مساري · الباك · أنا.
// 'exercices' و'methodo' بقاو قيمًا صالحة، لكن كشاشات فرعية بلا تبويب خاصّ بها.
type Onglet = 'aujourdhui' | 'masari' | 'bac' | 'ana' | 'exercices' | 'methodo';
type Mode =
  | { type: 'methodoExos' }
  | { type: 'structureTerre' }
  | { type: 'orogenese' }
  | { type: 'immunite' }
  | { type: 'atelier'; domaineId: string }
  | { type: 'protocole'; lessonId: string }
  | { type: 'revision'; lessonIds: string[]; croisee?: boolean }
  | { type: 'confidentialite' }
  | { type: 'mourchid' }
  | { type: 'jalon'; uniteId: string }
  | { type: 'examenBlanc' }
  | { type: 'synthese'; uniteId: string; sujet: string; question: string; modele: string[]; pieges: string[]; diagnostic: { id: string; ar: string }; retour?: Mode }
  | { type: 'mindmap' }
  | { type: 'recherche'; q?: string }
  | { type: 'schemas' }
  | { type: 'choixSynthese' }
  | { type: 'sujets' }
  | { type: 'bacPasAPas'; sujetId: string; exercice: number }
  | { type: 'kouest'; lessonId: string }
  | { type: 'flashcards' }
  | { type: 'lecture'; lessonId: string; retour?: Mode }

const ONGLETS: { id: Onglet; label: string; icone: typeof IcoCible }[] = [
  { id: 'masari', label: 'مساري', icone: IcoRoute },
  { id: 'aujourdhui', label: 'كويست', icone: IcoCible },
  { id: 'bac', label: 'الباك', icone: IcoDiplome },
  { id: 'ana', label: 'أنا', icone: IcoCarnet },
];

/** L'onglet réellement allumé : un sous-écran allume son parent. */
function ongletParent(o: Onglet): Onglet {
  if (o === 'exercices') return 'aujourdhui';
  if (o === 'methodo') return 'bac';
  return o;
}

/** Barre de retour des écrans qui ne sont plus des onglets (تدريبات، المنهجية). */
function BarreRetour({ texte, onRetour }: { texte: string; onRetour: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-4">
      <button type="button" className="btn-mini" onClick={onRetour}>
        <span aria-hidden="true">→</span> {texte}
      </button>
    </div>
  );
}

/** Écran d'attente pendant le chargement paresseux de المنهجية. */
function ChargementEcran() {
  return (
    <div className="grid min-h-dvh place-items-center bg-cream">
      <p className="font-naskh text-lg font-bold text-mute">لحظة…</p>
    </div>
  );
}

// Écran de consentement sync après inscription (P0.2)
function EcranConsentementSync({ onChoix }: { onChoix: (ok: boolean) => void }) {
  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-forest-deep">
      <div
        className="pointer-events-none fixed left-1/2 top-0 h-[60vmin] w-[60vmin] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(47,93,71,0.55), transparent 70%)' }}
      />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
        <div className="mb-6 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-gold-soft/80">
            بوصلة العلوم
          </p>
          <h1 className="font-naskh mt-1.5 text-4xl font-black text-paper">
            المزامنة مع المطوّر
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-sage/90">
            هل توافق على إرسال ملخّص تقدّمك (بدون كلمات مرور ولا ملاحظات شخصية) لتحسين التطبيق؟
            بياناتك تبقى على جهازك أولاً — وهذا حقّك كاملًا.
          </p>
        </div>

        <div className="rounded-3xl border border-line bg-paper p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
          <p className="text-xs leading-relaxed text-mute">
            يُرسَل ملخّص دوري فقط عند توفّر الإنترنت، ولا يحجب شيئًا عند انقطاع الشبكة.
          </p>
          <div className="mt-3 rounded-2xl border border-line bg-cream p-3">
            <ListeDonneesSync compact />
          </div>
          <div className="mt-5 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => onChoix(true)}
              className="btn btn-primary text-sm"
            >
              نعم، أفعّل المزامنة
            </button>
            <button
              type="button"
              onClick={() => onChoix(false)}
              className="btn btn-ghost text-sm text-forest-deep"
            >
              لا، لاحقًا
            </button>
          </div>
        </div>

        <p className="mt-5 text-center text-[11px] leading-relaxed text-sage/75">
          🔒 يمكنك تغيير هذا الاختيار لاحقاً من كرّاسة «أنا» — لا إرسال بدون موافقتك.
        </p>
      </div>
    </div>
  );
}

function AlerteStockage({ visible, pret, onBackup, onFermer }: { visible: boolean; pret: boolean; onBackup: () => void; onFermer: () => void }) {
  if (!visible) return null;
  return (
    <div role="alert" className="fixed inset-x-0 top-0 z-[120] border-b border-line bg-cream shadow-md">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <p className="text-sm leading-relaxed text-ink-soft">
          ⚠️ تعذّر قراءة بياناتك أو حفظها أو حذفها على هذا الجهاز. قد تكون العملية غير مكتملة والبيانات السابقة غير ظاهرة. تحقّق من التخزين قبل إعادة المحاولة. قد يتعذّر التصدير إذا لم يُقرأ التقدّم أو دفتر البوصلة أو الإحصاءات.
        </p>
        <div className="flex shrink-0 items-center gap-2">
          {pret && <button type="button" onClick={onBackup} className="btn btn-primary px-4 py-1.5 text-xs">النسخة الاحتياطية</button>}
          <button type="button" onClick={onFermer} className="btn btn-ghost px-3 py-1.5 text-xs">لاحقًا</button>
        </div>
      </div>
    </div>
  );
}

function EcranReprise({ cause, onCopier }: { cause: 'locale' | 'autre'; onCopier: () => void }) {
  const [confirmer, setConfirmer] = useState(false);
  const [erreur, setErreur] = useState(false);
  const titre = useRef<HTMLHeadingElement>(null);
  const dialogue = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = dialogue.current;
    if (el && !el.open) el.showModal();
    titre.current?.focus();
    return () => { if (el?.open) el.close(); };
  }, []);
  return (
    <dialog ref={dialogue} onCancel={(e) => e.preventDefault()} aria-labelledby="reprise-titre"
      className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto border-0 bg-cream p-0 backdrop:bg-black/60">
    <main dir="rtl" className="grid min-h-dvh place-items-center px-4 py-8">
      <section className="card w-full max-w-xl p-5 sm:p-7">
        <h1 id="reprise-titre" ref={titre} tabIndex={-1} className="font-naskh text-2xl font-bold">
          توقّف هذا التبويب لحماية بياناتك
        </h1>
        <p role="alert" className="mt-3 text-sm leading-relaxed">
          {cause === 'locale'
            ? 'تعذّر إكمال استعادة سابقة أو قراءة سجلّها. أوقفنا الكتابة حتى لا نعرض بيانات قد تكون ناقصة. أغلق التبويبات الأخرى، تحقّق من مساحة التخزين ثم أعد فتح التطبيق. لا تمسح بيانات الموقع قبل حفظ ما تحتاجه.'
            : 'تغيّرت البيانات أو بدأ استيرادها أو مسحها في تبويب آخر. أوقفنا الكتابة هنا حتى لا نعيد حفظ نسخة قديمة. أغلق التبويبات الأخرى ثم أعد فتح التطبيق.'}
        </p>
        {cause === 'autre' && (
          <p className="mt-3 text-sm leading-relaxed">
            إن كان لديك نصّ غير محفوظ، انسخه أو نزّله قبل إعادة الفتح. لن تُحفَظ تغييرات التطبيق في هذا التبويب.
          </p>
        )}
        <button type="button" onClick={() => window.location.reload()} className="btn btn-primary mt-4 w-full">
          أعيد فتح التطبيق
        </button>
        {cause === 'autre' && (
          <button type="button" onClick={onCopier} className="btn btn-ghost mt-2 w-full text-sm">
            أعود لنسخ مسوّدتي المؤقّتة
          </button>
        )}
        {cause === 'locale' && (
          <div className="mt-5 border-t border-line pt-4">
            {!confirmer ? (
              <button type="button" onClick={() => setConfirmer(true)} className="btn btn-ghost w-full text-sm">
                الاستعادة لا تعمل؟ خيارات متقدّمة
              </button>
            ) : (
              <div>
                <p className="text-sm leading-relaxed">
                  التخلّي يحذف سجلّ الاستعادة فقط، وقد يترك البيانات الحالية غير مكتملة. أغلق التبويبات الأخرى واحتفظ بملفّ النسخة الاحتياطية؛ قد تحتاج إلى استيراده من جديد.
                </p>
                {erreur && <p role="alert" className="mt-2 text-sm font-bold text-clay">تعذّر حذف السجلّ. تحقّق من التخزين وأعد المحاولة.</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => {
                    if (abandonnerJournalRestauration()) window.location.reload();
                    else setErreur(true);
                  }} className="btn bg-clay text-paper">نعم، أتخلّى عن الاستعادة</button>
                  <button type="button" onClick={() => { setConfirmer(false); setErreur(false); }} className="btn btn-ghost">تراجع</button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
    </dialog>
  );
}

function BandeauReprise({ onOuvrir }: { onOuvrir: () => void }) {
  return (
    <aside role="alert" dir="rtl" className="fixed inset-x-0 top-0 z-[120] border-b border-line bg-cream px-4 py-2 shadow-md">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
        <p className="text-sm leading-relaxed">
          هذا التبويب متوقّف عن الحفظ. انسخ أو نزّل نصّك المؤقّت قبل مغادرة صفحته، ثم أعد فتح التطبيق؛ لا تتابع العمل هنا.
        </p>
        <button type="button" onClick={onOuvrir} className="btn btn-primary px-4 py-1.5 text-xs">خيارات إعادة الفتح</button>
      </div>
    </aside>
  );
}

export default function App() {
  const [etat, setEtat] = useState<Etat>(() => chargerEtat());
  const [blocageRestauration, setBlocageRestauration] = useState<'locale' | 'autre' | null>(
    () => restaurationBloqueeAuChargement() ? 'locale' : null,
  );
  const blocageRef = useRef(blocageRestauration);
  blocageRef.current = blocageRestauration;
  const [repriseVisible, setRepriseVisible] = useState(true);
  const [onglet, setOnglet] = useState<Onglet>('aujourdhui');
  // Changer de porte remet la page en haut : sinon on hérite du défilement du parent.
  useEffect(() => {
    // En jsdom (tests) scrollY vaut toujours 0 : on n'appelle rien.
    if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'auto' });
  }, [onglet]);
  // P-1.4 (D4): échec d'écriture localStorage → bandeau visible (perte silencieuse interdite)
  const [stockageDefaillant, setStockageDefaillant] = useState(false);
  const [mode, setMode] = useState<Mode | null>(null);
  const [ouverteLecon, setOuverteLecon] = useState<string | null>(null);
  // قراءة الدرس مُفروضة: لا تُفتح بوّابة المرحلة 1 قبل فتح القارئ وإغلاقه فعلًا
  const [leconLue, setLeconLue] = useState(false);
  const [demarrage, setDemarrage] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try { return !sessionStorage.getItem('kunz_demarrage'); } catch { return true; }
  });
  // جلسة الدخول: تبقى مفتوحة ما دام التبويب مفتوحًا (لا كلمة مرور في كل تحميل)
  const [session, setSession] = useState<boolean>(() => sessionOuverte(etat.compte?.email));
  // السمة: داكن أو فاتح — يُحفظ في localStorage
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    try { return (localStorage.getItem('kunz_theme') as 'light' | 'dark') ?? 'light'; }
    catch { signalerEchecStockage(); return 'light'; }
  });

  // Écran de consentement sync (P0.2/P0.8) : après inscription, et aussi pour les comptes
  // existants qui n'ont jamais répondu (anciennes installations où l'envoi était actif par défaut).
  const [afficheConsentement, setAfficheConsentement] = useState<boolean>(
    () => sessionOuverte(etat.compte?.email) && doitDemanderConsentement(etat)
  );

  // اختبار التموضع (P2.1): يُعرض تلقائيًّا مرّة واحدة بعد شاشة الموافقة، قابل للرفض؛ ويُعاد من «أنا»
  const [afficheDiagnostic, setAfficheDiagnostic] = useState(false);
  function doitProposerDiagnostic(e: Etat): boolean {
    return Boolean(e.compte) && !e.diagnostic && !e.diagnosticDecideLe;
  }
  function onDiagnosticTermine(d: NonNullable<Etat['diagnostic']>): void {
    setEtat((prev) => ({ ...prev, diagnostic: d, diagnosticDecideLe: d.date }));
  }
  function onDiagnosticRefuse(): void {
    setEtat((prev) => ({ ...prev, diagnosticDecideLe: new Date().toISOString() }));
    setAfficheDiagnostic(false);
  }

  // التذكير اليومي (P2.4): إعادة جدولة هادئة عند الفتح إن كان مفعّلًا (لا شيء يحدث إن كان معطّلًا أو على المتصفح)
  useEffect(() => {
    if (etat.rappel?.actif) void synchroniserRappel(etat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // تحدّي الأسبوع (P3.2): حين يكتمل يُسجَّل أسبوعه مرّة واحدة (للشارة) — حساب محلّي صرف
  useEffect(() => {
    if (avancementDefi(etat)?.accompli && !(etat.defisAccomplis ?? []).includes(etat.defi?.semaine ?? '')) {
      setEtat((prev) => consoliderDefi(prev));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etat.drills, etat.revueCroisee, etat.examensBlancs, etat.defi]);

  // حجم الخط (P3.3): سمة على <html> تُحرّك rem كلّه، وتُنسخ إلى iframes الدروس عند تحميلها
  useEffect(() => {
    document.documentElement.dataset.taille = etat.tailleTexte ?? 'm';
  }, [etat.tailleTexte]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('kunz_theme', theme); } catch { signalerEchecStockage(); }
  }, [theme]);

  function basculerTheme() {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }

  function fermerDemarrage() {
    try { sessionStorage.setItem('kunz_demarrage', '1'); } catch { /* le parcours reste accessible dans cet onglet */ }
    setDemarrage(false);
  }

  // ───────────── الحساب ─────────────

  function onCompteValide(compte: Compte) {
    const memeCompte = etat.compte?.email === compte.email && etat.compte?.jeton === compte.jeton;
    const suivant = memeCompte ? { ...etat, compte } : { ...etat, compte, consentementSync: false, consentementSyncDecideLe: undefined };
    if (!memeCompte) suspendreSync(etat.compte?.email);
    setEtat(suivant);
    ouvrirSession(compte.email);
    setSession(true);
    // Afficher l'écran de consentement si l'élève n'a encore jamais répondu
    if (doitDemanderConsentement(suivant)) setAfficheConsentement(true);
    else if (doitProposerDiagnostic(suivant)) setAfficheDiagnostic(true);
  }

  function onDeconnexion() {
    fermerSession();
    setSession(false);
    setOnglet('aujourdhui');
    setMode(null);
  }

  function onSupprimerCompte() {
    fermerSession();
    setSession(false);
    suspendreSync(etat.compte?.email);
    setEtat((prev) => {
      const suivant = { ...prev, consentementSync: false, consentementSyncDecideLe: undefined };
      delete suivant.compte;
      return suivant;
    });
  }

  useEffect(() => {
    // إعادة حساب إجمالي الدقائق من كل الدروس (تفادي التراكم)
    const minutes = Object.values(etat.progression).reduce((s, p) => s + (p.minutes ?? 0), 0);
    sauvegarderEtat({ ...etat, minutesTotales: minutes });
  }, [etat]);

  // P-1.4: كل فشل كتابة في التخزين يرفع البانر — يُخفى يدويًّا، ويُعاد عند الفشل التالي
  useEffect(() => surEchecSauvegarde(() => setStockageDefaillant(true)), []);

  // Une comparaison synchrone peut aussi détecter le conflit avant la réception
  // de « storage ». Le signal est mémorisé même avant l'abonnement React.
  useEffect(() => surEtatPerime(() => {
    if (blocageRef.current === 'locale') return;
    blocageRef.current = 'autre';
    setRepriseVisible(true);
    setBlocageRestauration('autre');
  }), []);

  // Toute modification du profil ou des statistiques par un autre onglet peut
  // rendre notre copie périmée, même sans import. La geler plutôt que l'écraser.
  useEffect(() => {
    const change = (event: StorageEvent) => {
      try { if (event.storageArea !== localStorage) return; } catch { return; }
      const restauration = event.key === CLE_RESTAURATION && event.newValue !== null;
      const donnees = event.key === null || event.key === CLE_ETAT || event.key === CLE_STATS;
      if ((!restauration && !donnees) || blocageRef.current === 'locale') return;
      suspendreEcrituresLocalement();
    };
    window.addEventListener('storage', change);
    return () => window.removeEventListener('storage', change);
  }, []);

  // ───────────── المزامنة الاختيارية (صامتة، offline-first) ─────────────

  const etatRef = useRef(etat);
  etatRef.current = etat;

  function stockageCourant(): boolean {
    try {
      if (restaurationEnAttente()) {
        suspendreEcrituresLocalement();
        return false;
      }
      if (!verifierCoherence()) return false;
      verifierLectureEtat();
      return true;
    } catch {
      signalerEchecStockage();
      return false;
    }
  }

  function stockageCourantPourSync(): boolean {
    if (!stockageCourant()) return false;
    try {
      statsPourExport(); // ne pas envoyer des compteurs de secours après lecture impossible
      return true;
    } catch {
      signalerEchecStockage();
      return false;
    }
  }

  useEffect(() => {
    if (!syncActive() || blocageRestauration) return;
    const envoyerSiCourant = () => {
      if (!blocageRef.current && stockageCourantPourSync()) void envoyerSnapshot(etatRef.current);
    };
    // بعد كل تغيير: انتظر 6 ثوانٍ ثم أرسل (تفادي الإرسال المتكرر)
    const delai = setTimeout(envoyerSiCourant, 6000);
    // عند تصغير التطبيق أو تبديل التبويب: أرسل فورًا
    const onVisibilite = () => {
      if (document.visibilityState === 'hidden') envoyerSiCourant();
    };
    // عند عودة الشبكة: أرسل ما تجمّع
    const onLigne = envoyerSiCourant;
    document.addEventListener('visibilitychange', onVisibilite);
    window.addEventListener('online', onLigne);
    return () => {
      clearTimeout(delai);
      document.removeEventListener('visibilitychange', onVisibilite);
      window.removeEventListener('online', onLigne);
    };
  }, [etat, blocageRestauration]);

  // ───────────── فتح بنود الطريق ─────────────

  function ouvrirItem(item: ItemChemin): void {
    if (item.type === 'jalon') {
      setMode({ type: 'jalon', uniteId: item.uniteId });
      return;
    }
    const terminee = etat.progression[item.id]?.statut === 'terminee';
    if (terminee) {
      setMode({ type: 'lecture', lessonId: item.id });
      return;
    }
    // حصّة جديدة تُحتسب في الحصّة اليومية (أو تُسجّل كإضافية)
    setEtat((prev) => {
      const comptees = prev.seancesJour === aujourdhui() ? prev.seancesComptees : 0;
      const suivant = enregistrerSeance(prev);
      // ما بعد الحصّة اليومية (حسب الهدف / المكثّفة) يُسجَّل كحصّة إضافية
      if (comptees >= quotaDe(prev).seances) suivant.bonusJour = aujourdhui();
      return suivant;
    });
    setLeconLue(false);
    setMode({ type: 'protocole', lessonId: item.id });
  }

  // ───────────── ouverture depuis la الخريطة الذهنية ─────────────
  // Fermer une session lancée depuis la carte mentale y ramène (retour contextuel),
  // au lieu de renvoyer l'élève vers مساري.
  const [retourMindmap, setRetourMindmap] = useState(false);
  useEffect(() => {
    if (!mode) setRetourMindmap(false);
  }, [mode]);

  function ouvrirDepuisMindmap(item: ItemChemin): void {
    setRetourMindmap(true);
    if (item.type === 'jalon') {
      setMode({ type: 'jalon', uniteId: item.uniteId });
      return;
    }
    const terminee = etat.progression[item.id]?.statut === 'terminee';
    if (terminee) {
      setMode({ type: 'lecture', lessonId: item.id, retour: { type: 'mindmap' } });
      return;
    }
    setEtat((prev) => {
      const comptees = prev.seancesJour === aujourdhui() ? prev.seancesComptees : 0;
      const suivant = enregistrerSeance(prev);
      // ما بعد الحصّة اليومية (حسب الهدف / المكثّفة) يُسجَّل كحصّة إضافية
      if (comptees >= quotaDe(prev).seances) suivant.bonusJour = aujourdhui();
      return suivant;
    });
    setLeconLue(false);
    setMode({ type: 'protocole', lessonId: item.id });
  }

  // ───────────── ردود البروتوكول ─────────────

  function onProgresse(lessonId: string, p: Etat['progression'][string]): void {
    setEtat((prev) => ({ ...prev, progression: { ...prev.progression, [lessonId]: p } }));
  }

  function onTerminer(lessonId: string, p: Etat['progression'][string]): void {
    setEtat((prev) => ({
      ...prev,
      progression: { ...prev.progression, [lessonId]: p },
      revisions: prev.revisions,
    }));
    setMode(retourMindmap ? { type: 'mindmap' } : null);
  }

  // ───────────── الاسترجاع ─────────────

  function onResultatRevision(lessonId: string, qualite: Qualite): void {
    setEtat((prev) => {
      const p = prev.progression[lessonId];
      if (!p) return prev;
      return {
        ...prev,
        progression: {
          ...prev.progression,
          // المراجعة المكثّفة: J+1/J+3 فقط، وخروج من الاسترجاع بعد نجاحين متتاليين
          [lessonId]: modeIntensifActif(prev) ? mettreAJourSrsIntensif(p, qualite) : mettreAJourSrs(p, qualite),
        },
        revisions: prev.revisions + 1,
      };
    });
  }

  // ───────────── الجسر ─────────────

  function onEnregistrerJalon(uniteId: string, synthese: string): void {
    setEtat((prev) => ({
      ...prev,
      jalons: {
        ...prev.jalons,
        [uniteId]: { fait: true, synthese, ts: new Date().toISOString() },
      },
    }));
    setMode(null);
  }

  // ───────────── التدريبات ─────────────

  function onItemReussi(id: string): void {
    setEtat((prev) =>
      prev.drills?.[id]
        ? prev
        : { ...prev, drills: { ...(prev.drills ?? {}), [id]: true } }
    );
  }

  // ───────────── بطاقات الكفاءة (منهجية) — même SM-2 que les leçons ─────────────

  /** Réussite d'un exercice de منهجية ou auto-évaluation d'une revue : la carte كفاءة
   *  est programmée par mettreAJourSrs (réussite directe → J+3, réussite après erreurs → J+1).
   *  `estRevue` est réservé à la revue hebdomadaire de l'écran اليوم : seule une REVUE
   *  consomme le quota kafaaHebdo (≤ 2 par semaine). Une réussite d'exercice crée ou
   *  programme la carte SANS épuiser le quota (audit : sinon, plus on s'entraîne,
   *  plus vite le planificateur se désactive). */
  function onResultatKafaa(
    key: string,
    qualite: Qualite,
    meta: { verbe: string; exercice: string; erreur: string },
    estRevue = false
  ): void {
    setEtat((prev) => {
      const existante = prev.kafaa?.[key];
      const auj = aujourdhui();
      // Déjà programmée pour plus tard : pas d'accélération le même jour.
      if (existante?.prochaineRevision && existante.prochaineRevision > auj) return prev;
      const base: CarteKafaa = existante ?? {
        verbe: meta.verbe,
        exercice: meta.exercice,
        erreur: meta.erreur,
        repetitions: 0,
        intervalle: 0,
        facilite: 2.5,
      };
      const maj = mettreAJourSrs(base, qualite);
      // Réussite directe : premier palier J+3 (audit) ; réussite avec erreurs : J+1.
      if (maj.repetitions === 1 && qualite === 5) {
        maj.intervalle = 3;
        maj.prochaineRevision = ajouterJours(aujourdhui(), 3);
      }
      const debut = debutSemaine(aujourdhui());
      const hebdo = prev.kafaaHebdo?.debut === debut ? prev.kafaaHebdo.n : 0;
      return {
        ...prev,
        kafaa: { ...(prev.kafaa ?? {}), [key]: maj },
        // Seule une REVUE (écran اليوم) consomme le quota hebdomadaire (≤ 2) ;
        // une réussite d'exercice programme la carte sans l'épuiser.
        ...(estRevue ? { kafaaHebdo: { debut, n: hebdo + 1 } } : {}),
      };
    });
  }

  // ───────────── سجلّ الأخطاء الذرّية (v0.8) — capturé dans les exercices de منهجية ─────────────

  /** Chaque erreur d'exercice est ajoutée au carnet (persisté, offline). Cap à 400 entrées :
   *  l'export JSON du carnet couvre l'historique complet. Les bonnes réponses n'y figurent
   *  jamais (anti-stress) — on y voit « j'ai choisi X, voici pourquoi c'est fautif ». */
  function onCarnetFaute(f: Omit<FauteCarnet, 'id' | 'ts'>): void {
    setEtat((prev) => {
      const entree: FauteCarnet = {
        ...f,
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        ts: new Date().toISOString(),
      };
      return { ...prev, carnet: [...(prev.carnet ?? []), entree].slice(-400) };
    });
  }

  function onEffacerCarnet(): void {
    setEtat((prev) => ({ ...prev, carnet: [] }));
  }

  // ───────────── موافقة المزامنة ─────────────

  // المفضّلة (P3.3)
  function basculerFavori(lessonId: string): void {
    setEtat((prev) => {
      const f = prev.favoris ?? [];
      return { ...prev, favoris: f.includes(lessonId) ? f.filter((x) => x !== lessonId) : [...f, lessonId] };
    });
  }

  function onConsentementSync(ok: boolean): void {
    // Même si cet onglet est périmé, cesser immédiatement ses nouveaux envois.
    if (!ok) suspendreSync(etatRef.current.compte?.email);
    // Une statistique illisible bloque l'envoi, pas la décision de consentement
    // lorsque la progression elle-même reste lisible et cohérente.
    if (blocageRef.current || !stockageCourant()) return;
    if (ok) reprendreSync(etatRef.current.compte?.email);
    const decide = { consentementSync: ok, consentementSyncDecideLe: new Date().toISOString() };
    setEtat((prev) => ({ ...prev, ...decide }));
    if (ok && stockageCourantPourSync()) void envoyerSnapshot({ ...etatRef.current, ...decide });
  }

  // ───────────── الملاحظات والهوية ─────────────

  function onSupprimerNote(id: string): void {
    setEtat((prev) => ({ ...prev, notes: prev.notes.filter((n) => n.id !== id) }));
  }

  function onReinitialiser(carnetAvantConfirmation: string | null): boolean {
    if (blocageRef.current) return false;
    if (!viderStockage(carnetAvantConfirmation)) return false; // Une suppression partielle n'est pas annoncée comme réussie.
    fermerSession();
    setSession(false);
    setEtat(chargerEtat());
    setMode(null);
    setOnglet('aujourdhui');
    return true;
  }

  // استيراد نسخة احتياطية كاملة (من أنا) — identité et consentement restent locaux.
  function onRestaurerEtat(nouveau: Etat, stats?: StatsReponses, carnetBoussole?: CarnetBoussole | null, carnetAvantConfirmation?: string | null): void {
    if (blocageRef.current) return;
    const fusionne = fusionnerProgressionImportee(etatRef.current, nouveau);
    if (!restaurerEtatEtStats(fusionne, stats, carnetBoussole, carnetAvantConfirmation)) {
      let repriseNecessaire = true;
      try { repriseNecessaire = restaurationEnAttente(); } catch { /* stockage non vérifiable */ }
      if (repriseNecessaire) {
        blocageRef.current = 'locale';
        suspendreEcrituresLocalement();
        setRepriseVisible(true);
        setBlocageRestauration('locale');
      }
      return;
    }
    setEtat(fusionne);
    setMode(null);
    setOnglet('ana');
  }

  function onTerminerAtelier(domaineId: string): void {
    setEtat((prev) => ({
      ...prev,
      ateliers: {
        ...(prev.ateliers ?? {}),
        [domaineId]: { fait: true, ts: new Date().toISOString() },
      },
    }));
    setMode(null);
  }

  // ───────────── الأوضاع كاملة الشاشة ─────────────

  // Garder l'écran courant monté derrière la reprise : le laboratoire peut
  // contenir une saisie temporaire que l'élève doit pouvoir copier ou télécharger.
  const reprise = blocageRestauration && (repriseVisible
    ? <EcranReprise cause={blocageRestauration} onCopier={() => setRepriseVisible(false)} />
    : <BandeauReprise onOuvrir={() => setRepriseVisible(true)} />);
  const ecranInerte = Boolean(blocageRestauration && repriseVisible);

  if (mode) {
    // كل الشاشات أدناه كسولة التحميل (P3.6): Suspense واحد يغلّفها جميعًا
    return <>
      {reprise}
      <div inert={ecranInerte} aria-hidden={ecranInerte}>
        <AlerteStockage visible={stockageDefaillant && !blocageRestauration} pret={false} onBackup={() => { setMode(null); setOnglet('ana'); }} onFermer={() => { effacerAlerteStockage(); setStockageDefaillant(false); }} />
        <Suspense fallback={<ChargementEcran />}>{ecranMode(mode)}</Suspense>
      </div>
    </>;
  }

  function ecranMode(mode: Mode): ReactElement | null {
    // القارئ يُفتح فوق الورشة فلا يُفقد التقدّم المكتسب فيها
    const lecteurAtelier = ouverteLecon ? (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-cream">
        <LecteurLecon lessonId={ouverteLecon} onFermer={() => setOuverteLecon(null)} />
      </div>
    ) : null;

    // تمارين المنهجية: 3e porte de تدريبات — ouverte directement sur مستويات التدريب,
    // la fermeture (setMode(null)) retourne à l'onglet تدريبات.
    if (mode.type === 'methodoExos') {
      return (
        <Suspense fallback={<ChargementEcran />}>
          <Methodologie
            modeInitial="niveaux"
            onFermer={() => setMode(null)}
            onResultatKafaa={onResultatKafaa}
            onCarnetFaute={onCarnetFaute}
          />
        </Suspense>
      );
    }
    if (mode.type === 'flashcards') {
      return (
        <Flashcards
          etat={etat}
          onFermer={() => setMode(null)}
          onOuvrirLecon={(lessonId) => setMode({ type: 'lecture', lessonId, retour: { type: 'flashcards' } })}
          onReponse={(carteId, etatCarte) =>
            setEtat((prev) => ({ ...prev, flashcards: { ...(prev.flashcards ?? {}), [carteId]: etatCarte } }))
          }
        />
      );
    }
    if (mode.type === 'sujets') {
      return (
        <SujetsOfficiels
          onFermer={() => setMode(null)}
          onOuvrirRecherche={(q) => setMode({ type: 'recherche', q })}
          onOuvrirPasAPas={(sujetId, exercice) => setMode({ type: 'bacPasAPas', sujetId, exercice })}
          onOuvrirSynthese={(s: SituationSynthese) =>
            setMode({
              type: 'synthese',
              uniteId: s.id.toUpperCase(),
              sujet: s.sujet,
              question: s.question,
              modele: s.modele,
              pieges: s.pieges,
              diagnostic: s.diagnostic,
              retour: { type: 'sujets' },
            })
          }
        />
      );
    }
    if (mode.type === 'kouest') {
      return (
        <Kouest
          etat={etat}
          lessonId={mode.lessonId}
          onBonneReponse={(cle) =>
            setEtat((prev) =>
              prev.drills?.[cle] ? prev : { ...prev, drills: { ...(prev.drills ?? {}), [cle]: true } },
            )
          }
          onTerminerSeance={(lessonId) => setMode({ type: 'protocole', lessonId })}
          onFermer={() => setMode(null)}
        />
      );
    }
    if (mode.type === 'bacPasAPas') {
      const sujet = SUJETS_OFFICIELS.find((x) => x.id === mode.sujetId);
      const exercice = sujet?.exercices.find((e) => e.numero === mode.exercice);
      if (!sujet || !exercice) {
        setMode(null);
        return null;
      }
      return (
        <BacPasAPas
          etat={etat}
          sujet={sujet}
          exercice={exercice}
          onEtape={(cle, qualite) =>
            setEtat((prev) => ({ ...prev, bacEtapes: { ...(prev.bacEtapes ?? {}), [cle]: qualite } }))
          }
          onTermine={(cle) =>
            setEtat((prev) =>
              prev.bacExercices?.[cle] ? prev : { ...prev, bacExercices: { ...(prev.bacExercices ?? {}), [cle]: true } },
            )
          }
          onCarnetFaute={onCarnetFaute}
          onFermer={() => setMode(null)}
        />
      );
    }
    if (mode.type === 'choixSynthese') {
      return (
        <ChoixSynthese
          etat={etat}
          onFermer={() => setMode(null)}
          onChoisir={(s: SituationSynthese) => {
            setMode({
              type: 'synthese',
              uniteId: s.id.toUpperCase(),
              sujet: s.sujet,
              question: s.question,
              modele: s.modele,
              pieges: s.pieges,
              diagnostic: s.diagnostic,
              retour: { type: 'choixSynthese' },
            });
          }}
        />
      );
    }
    if (mode.type === 'schemas') {
      return (
        <SchemaALegender
          faits={etat.schemas ?? {}}
          onTermine={(id) => setEtat((prev) => (prev.schemas?.[id] ? prev : { ...prev, schemas: { ...(prev.schemas ?? {}), [id]: true } }))}
          onOuvrirRecherche={(q) => setMode({ type: 'recherche', q })}
          onFermer={() => setMode(null)}
        />
      );
    }
    if (mode.type === 'mourchid') {
      return (
        <Mourchid
          onFermer={() => setMode(null)}
          onAller={(vers) => {
            setMode(null);
            if (vers === 'examen') setMode({ type: 'examenBlanc' });
            else if (vers === 'recherche') setMode({ type: 'recherche' });
            else if (vers === 'methodo') setOnglet('methodo');
            else if (vers === 'exercices') setOnglet('exercices');
            else setOnglet('aujourdhui');
          }}
        />
      );
    }
    if (mode.type === 'confidentialite') {
      return (
        <Confidentialite
          etat={etat}
          onRetirerConsentement={() => onConsentementSync(false)}
          onFermer={() => setMode(null)}
        />
      );
    }
    if (mode.type === 'recherche') {
      return (
        <Recherche
          etat={etat}
          requeteInitiale={mode.q}
          onFermer={() => setMode(null)}
          onOuvrirLecon={(lessonId) => setMode({ type: 'lecture', lessonId, retour: { type: 'recherche' } })}
        />
      );
    }
    if (mode.type === 'examenBlanc') {
      return (
        <ExamBlanc
          etat={etat}
          onFermer={() => setMode(null)}
          onTermine={(bilan) =>
            setEtat((prev) => ({
              ...prev,
              examensBlancs: [...(prev.examensBlancs ?? []), bilan.date],
              examens: [...(prev.examens ?? []), bilan].slice(-20),
            }))
          }
          onItemReussi={onItemReussi}
          onResultatKafaa={onResultatKafaa}
          onCarnetFaute={onCarnetFaute}
        />
      );
    }
    if (mode.type === 'mindmap') {
      return (
        <Mindmap
          etat={etat}
          onFermer={() => setMode(null)}
          onOuvrirItem={ouvrirDepuisMindmap}
        />
      );
    }
    if (mode.type === 'structureTerre') {
      return (
        <AtelierStructureTerre
          onFermer={() => setMode(null)}
          onTerminer={() => onTerminerAtelier('structure')}
        />
      );
    }
    if (mode.type === 'orogenese') {
      return (
        <>
          <AtelierOrogenese
            onFermer={() => setMode(null)}
            onTerminer={() => onTerminerAtelier('orogenese')}
            onVoirLecon={() => setOuverteLecon('phase21_chapitres_41_42_2')}
          />
          {lecteurAtelier}
        </>
      );
    }
    if (mode.type === 'immunite') {
      return (
        <>
          <AtelierImmunite
            onFermer={() => setMode(null)}
            onTerminer={() => onTerminerAtelier('immunite')}
            onVoirLecon={() => setOuverteLecon('phase7_chapitres_13_14_2')}
          />
          {lecteurAtelier}
        </>
      );
    }
    if (mode.type === 'atelier') {
      return (
        <>
          <AtelierDomaine1
            fait={Boolean(etat.ateliers?.[mode.domaineId])}
            onTerminer={() => onTerminerAtelier(mode.domaineId)}
            onFermer={() => setMode(null)}
            onVoirLecon={() => setOuverteLecon('lecon_transcription')}
          />
          {lecteurAtelier}
        </>
      );
    }
    if (mode.type === 'protocole') {
      const terminerLecon = () => {
        const p = etat.progression[mode.lessonId];
        const base = p ?? {
          statut: 'en_cours' as const,
          phases: [1, 2, 3, 4, 5, 6] as number[],
          minutes: 0,
          repetitions: 0,
          intervalle: 0,
          facilite: 2.5,
        };
        const frag = base.fragile ?? false;
        const minutesFinales = base.minutes;
        onTerminer(mode.lessonId, premiereRevision({ ...base, statut: 'terminee', fragile: frag }, frag));
      };
      return (
        <>
          <ProtocoleRunner
            key={mode.lessonId}
            lessonId={mode.lessonId}
            progression={etat.progression[mode.lessonId]}
            onProgresse={(p) => onProgresse(mode.lessonId, p)}
            onTerminer={(p) => onTerminer(mode.lessonId, p)}
            onLireLecon={() => setOuverteLecon(mode.lessonId)}
            leconLue={leconLue}
            onFermer={() => setMode(retourMindmap ? { type: 'mindmap' } : null)}
            onAllerMethodo={() => {
              terminerLecon();
              setMode({ type: 'methodoExos' });
            }}
          />
          {ouverteLecon && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-cream">
              <LecteurLecon
                lessonId={ouverteLecon}
                onFermer={() => {
                  setOuverteLecon(null);
                  setLeconLue(true);
                }}
              />
            </div>
          )}
        </>
      );
    }
    if (mode.type === 'revision') {
      const diagnostics: Record<string, string> = {};
      for (const id of mode.lessonIds) {
        const d = etat.progression[id]?.diagnostic;
        if (d) diagnostics[id] = d;
      }
      return (
        <SessionRevision
          lessonIds={mode.lessonIds}
          onResultat={(lessonId, qualite) => {
            onResultatRevision(lessonId, qualite);
            // المراجعة المتقاطعة تُعدّ مُنجزة حين يُقيَّم آخر درس فيها
            if (mode.croisee && lessonId === mode.lessonIds[mode.lessonIds.length - 1]) {
              setEtat((prev) => terminerRevueCroisee(prev));
            }
          }}
          onFermer={() => setMode(null)}
          diagnostics={diagnostics}
        />
      );
    }
    if (mode.type === 'jalon') {
      return (
        <JalonUnite
          uniteId={mode.uniteId}
          etat={etat}
          onEnregistrer={(synthese) => onEnregistrerJalon(mode.uniteId, synthese)}
          onRelireLecon={(lessonId) =>
            setMode({ type: 'lecture', lessonId, retour: { type: 'jalon', uniteId: mode.uniteId } })
          }
          onFermer={() => setMode(retourMindmap ? { type: 'mindmap' } : null)}
        />
      );
    }
    if (mode.type === 'synthese') {
      return (
        <SyntheseLibre
          uniteId={mode.uniteId}
          sujet={mode.sujet}
          question={mode.question}
          modele={mode.modele}
          pieges={mode.pieges}
          diagnostic={mode.diagnostic}
          onResultatKafaa={onResultatKafaa}
          onCarnetFaute={onCarnetFaute}
          onFermer={() => setMode(mode.retour ?? null)}
        />
      );
    }
    return (
      <LecteurLecon
        lessonId={mode.lessonId}
        onFermer={() => setMode(mode.retour ?? null)}
        favori={(etat.favoris ?? []).includes(mode.lessonId)}
        onBasculerFavori={() => basculerFavori(mode.lessonId)}
      />
    );
  }

  const inscrit = Boolean(etat.compte) && session;
  // لا تبويبات ولا شارة قبل اكتمال شاشة الإقلاع وفتح حساب
  const pret = inscrit && !demarrage;

  return <>
    {reprise}
    <div className="min-h-dvh" inert={ecranInerte} aria-hidden={ecranInerte}>
      <AlerteStockage visible={stockageDefaillant && !blocageRestauration} pret={pret} onBackup={() => { setMode(null); setOnglet('ana'); }} onFermer={() => { effacerAlerteStockage(); setStockageDefaillant(false); }} />
      {demarrage && <EcranDemarrage onTerminer={fermerDemarrage} />}
      {!demarrage && (
        <>
          {/* الشريط العلوي الحديث — اسم التطبيق، السمة، المستخدم */}
          <header className="fixed top-0 left-0 right-0 z-40 h-16 border-b border-line bg-surface">
            <div className="mx-auto flex h-full max-w-5xl items-center justify-between gap-2 px-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 shrink-0 rounded-2xl bg-gradient-to-br from-primary to-forest-deep flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-primary/25">
                  <span className="h-7 w-7"><IcoBoussole /></span>
                </div>
                <div className="hidden min-w-0 sm:block">
                  <h1 className="app-brand truncate tracking-tight leading-none">بوصلة العلوم</h1>
                  <p className="text-[11px] font-medium text-mute">مراجعة البكالوريا — علوم الطبيعة والحياة</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* شارة XP — مصدر وحيد للمستوى (popup منسدل، لا يغطي المحتوى) */}
                {pret && <BaguetteXp etat={etat} onDeconnexion={onDeconnexion} />}
                <button
                  type="button"
                  onClick={basculerTheme}
                  className="h-10 w-10 shrink-0 rounded-xl border border-line bg-surface flex items-center justify-center text-ink-soft hover:bg-primary/5 hover:text-primary transition-colors"
                  aria-label={theme === 'light' ? 'الوضع الليلي' : 'الوضع النهاري'}
                >
                  {theme === 'light' ? (
                    /* soleil (mode clair) — le path « lune pleine » en stroke donnait un glyphe déformé */
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="4.5" />
                      <path d="M12 1.5v2.5m0 16v2.5M4.57 4.57l1.77 1.77m11.32 11.32l1.77 1.77M1.5 12h2.5m16 0h2.5M4.57 19.43l1.77-1.77M17.66 6.34l1.77-1.77" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 0111.21 3 7 7 0 003 11.79a9 9 0 019 9c2.22 0 4.31-.69 6.02-1.79z" />
                    </svg>
                  )}
                </button>
                {etat.compte && (
                  <div className="flex shrink-0 items-center gap-2 rounded-xl border border-line bg-surface py-1.5 pe-3 ps-2 text-xs font-bold text-ink-soft">
                    <span className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-forest-deep flex items-center justify-center text-white text-[10px] font-bold">
                      {etat.compte.email.charAt(0).toUpperCase()}
                    </span>
                    <span className="hidden truncate max-w-[120px] md:inline">{etat.compte.email}</span>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* الطبقة الترفيهية — شريط XP + تصفيق (لا شيء عائم فوق المحتوى) */}
          <GamifiedOverlay etat={etat} />

      {!demarrage && !inscrit && (
        <Inscription
          compte={etat.compte}
          onValide={onCompteValide}
          onSupprimerCompte={etat.compte ? onSupprimerCompte : undefined}
        />
      )}

      {/* Écran de consentement sync après inscription (P0.2) */}
      {afficheConsentement && (
        <EcranConsentementSync
          onChoix={(ok) => {
            onConsentementSync(ok);
            setAfficheConsentement(false);
            if (doitProposerDiagnostic(etatRef.current)) setAfficheDiagnostic(true);
          }}
        />
      )}

      {/* اختبار التموضع (P2.1) — فوق كل شيء، قابل للرفض */}
      {afficheDiagnostic && !afficheConsentement && (
        <Suspense fallback={<ChargementEcran />}>
          <Diagnostic
            precedent={etat.diagnostic}
            onTerminer={onDiagnosticTermine}
            onRefuser={onDiagnosticRefuse}
            onFermer={() => setAfficheDiagnostic(false)}
          />
        </Suspense>
      )}

      {/* إزاحة المحتوى أسفل الشريط العلوي الثابت (h-16) */}
      <div className="pt-16">
      {pret && onglet === 'aujourdhui' && (
        <Aujourdhui
          etat={etat}
          onOuvrirItem={ouvrirItem}
          onDemarrerRevision={(lessonIds) => setMode({ type: 'revision', lessonIds })}
          onVoirUnite={(uniteId) => setMode({ type: 'jalon', uniteId })}
          onResultatKafaa={onResultatKafaa}
          onOuvrirMethodologie={() => setOnglet('methodo')}
          onOuvrirExamenBlanc={() => setMode({ type: 'examenBlanc' })}
          onChoisirDefi={(type) => setEtat((prev) => choisirDefi(prev, type))}
          onDemarrerKouest={(lessonId) => setMode({ type: 'kouest', lessonId })}
          onDemarrerRevueCroisee={() => {
            const { etat: suivant, lessonIds } = demarrerRevueCroisee(etat);
            if (lessonIds.length < 2) return;
            setEtat(suivant);
            setMode({ type: 'revision', lessonIds, croisee: true });
          }}
        />
      )}
      {pret && onglet === 'masari' && (
        <Masari
          etat={etat}
          onOuvrirItem={ouvrirItem}
          onVoirUnite={(uniteId) => setMode({ type: 'jalon', uniteId })}
          onOuvrirMindmap={() => setMode({ type: 'mindmap' })}
          onOuvrirRecherche={() => setMode({ type: 'recherche' })}
        />
      )}
      {pret && onglet === 'bac' && (
        <Suspense fallback={<ChargementEcran />}>
          <Bac
            etat={etat}
            onOuvrirSujets={() => setMode({ type: 'sujets' })}
            onOuvrirExamen={() => setMode({ type: 'examenBlanc' })}
            onOuvrirMethodo={() => setOnglet('methodo')}
            onOuvrirSchemas={() => setMode({ type: 'schemas' })}
          />
        </Suspense>
      )}
      {pret && onglet === 'exercices' && (
        <>
        <BarreRetour texte="رجوع إلى كويست" onRetour={() => setOnglet('aujourdhui')} />
        <Exercices
          etat={etat}
          onItemReussi={onItemReussi}
          onOuvrirAtelier={() => setMode({ type: 'atelier', domaineId: 'd1' })}
          onOuvrirImmunite={() => setMode({ type: 'immunite' })}
          onOuvrirOrogenese={() => setMode({ type: 'orogenese' })}
          onOuvrirStructureTerre={() => setMode({ type: 'structureTerre' })}
          onOuvrirMethodo={() => setMode({ type: 'methodoExos' })}
          onOuvrirExamen={() => setMode({ type: 'examenBlanc' })}
          onOuvrirFlashcards={() => setMode({ type: 'flashcards' })}
          onOuvrirSchemas={() => setMode({ type: 'schemas' })}
          onOuvrirSyntheses={() => setMode({ type: 'choixSynthese' })}
          onOuvrirSujets={() => setMode({ type: 'sujets' })}
          onOuvrirLecon={(lessonId) => setMode({ type: 'lecture', lessonId })}
        />
        </>
      )}
      {pret && onglet === 'methodo' && (
        <Suspense fallback={<ChargementEcran />}>
          <Methodologie
            onFermer={() => setOnglet('bac')}
            onResultatKafaa={onResultatKafaa}
            onCarnetFaute={onCarnetFaute}
            onOuvrirSynthese={(data) => setMode({ type: 'synthese', ...data, retour: { type: 'methodoExos' } })}
            onOuvrirMourchid={() => setMode({ type: 'mourchid' })}
          />
        </Suspense>
      )}
      {pret && onglet === 'ana' && (
        <Suspense fallback={<ChargementEcran />}>
        <Ana
          etat={etat}
          carnet={etat.carnet ?? []}
          onEffacerCarnet={onEffacerCarnet}
          onNom={(nom) => setEtat((prev) => ({ ...prev, nom }))}
          onDateBac={(iso) => setEtat((prev) => ({ ...prev, dateBac: iso }))}
          onSupprimerNote={onSupprimerNote}
          onReinitialiser={onReinitialiser}
          onRestaurer={onRestaurerEtat}
          onDeconnexion={onDeconnexion}
          onConsentementSync={onConsentementSync}
          onObjectif={(objectif) => setEtat((prev) => ({ ...prev, objectif }))}
          onModeIntensif={(modeIntensif) => setEtat((prev) => ({ ...prev, modeIntensif }))}
          onTailleTexte={(tailleTexte) => setEtat((prev) => ({ ...prev, tailleTexte }))}
          onOuvrirDiagnostic={() => setAfficheDiagnostic(true)}
          onOuvrirLecon={(lessonId) => setMode({ type: 'lecture', lessonId })}
          onDemarrerRevision={(lessonIds) => setMode({ type: 'revision', lessonIds })}
          onBasculerFavori={basculerFavori}
          onRappel={(rappel) => setEtat((prev) => ({ ...prev, rappel }))}
          onAllerExercices={() => setOnglet('exercices')}
          onOuvrirConfidentialite={() => setMode({ type: 'confidentialite' })}
        />
        </Suspense>
      )}
      </div>

          {/* أربعة أبواب، لا أكثر. الشاشات الفرعية تُضيء أباها. */}
          {pret && <nav className="fixed inset-x-0 bottom-0 z-40" aria-label="أبواب البوصلة">
            <div className="mx-auto max-w-5xl">
              <div className="onglets">
                {ONGLETS.map((o) => {
                  const Ico = o.icone;
                  const actif = o.id === ongletParent(onglet);
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setOnglet(o.id)}
                      className="onglet"
                      aria-current={actif ? 'page' : undefined}
                    >
                      <span className="block h-[18px] w-[18px]" aria-hidden="true">
                        <Ico />
                      </span>
                      <span>{o.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>}
        </>
      )}
    </div>
  </>;
}
