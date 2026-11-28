// أنا — شاشة مبسّطة من قسمين واضحين فقط:
//   1. «تحليل أدائي»: شجرة تحليل تفاعلية موحّدة (المجالات ← الوحدات، الإجابات، الكفاءات، الأولويات والأخطاء).
//   2. «إعداداتي»: الهوية وتاريخ الباك، تفضيلات المراجعة، العمل دون إنترنت، الحساب والمزامنة، النسخة الاحتياطية، وإعادة الضبط.

import { useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import type { Etat, FauteCarnet, Objectif, TailleTexte } from '../types';
import { EtatIllisible, paquetExportComplet, RestaurationEnAttente } from '../utils/storage';
import { lireSauvegarde, normaliserSauvegarde, TAILLE_MAX_SAUVEGARDE } from '../utils/backup';
import { CLE_CARNET_BOUSSOLE, CarnetBoussoleIllisible, type CarnetBoussole } from '../utils/carnetBoussole';
import { StatsIllisibles, type StatsReponses } from '../utils/stats';
import { aujourdhui, differenceJours, nb, formatJourAr, joursNb } from '../utils/dates';
import { joursConsecutifsAvecBouclier, niveauDe, xpDe, xpTexte } from '../utils/xp';
import { WILAYA_PAR_CODE } from '../data/wilayas';
import { IcoFlamme } from './Icones';
import ArbreAnalyse from './ArbreAnalyse';
import { ReglageSync } from './CarteSync';
import ReglagesParcours from './ReglagesParcours';
import ReglageRappel from './ReglageRappel';
import CarteHorsLigne from './CarteHorsLigne';

interface ImportEnAttente {
  etat: Etat;
  stats?: StatsReponses;
  carnetBoussole?: CarnetBoussole | null;
  carnetAvantConfirmation?: string | null;
  avertissementCarnet: string;
  avertissementStats: string;
}

interface Props {
  etat: Etat;
  carnet?: FauteCarnet[];
  onEffacerCarnet: () => void;
  onNom: (nom: string) => void;
  onDateBac: (iso: string) => void;
  onSupprimerNote: (id: string) => void;
  onReinitialiser: (carnetAvantConfirmation: string | null) => boolean | void;
  onRestaurer: (etat: Etat, stats?: StatsReponses, carnetBoussole?: CarnetBoussole | null, carnetAvantConfirmation?: string | null) => void;
  onDeconnexion?: () => void;
  onCreerCompte?: () => void;
  onConsentementSync: (ok: boolean) => void;
  onObjectif: (o: Objectif) => void;
  onModeIntensif: (m: 'auto' | 'on' | 'off') => void;
  onTailleTexte: (t: TailleTexte) => void;
  onOuvrirDiagnostic: () => void;
  onOuvrirLecon: (lessonId: string) => void;
  onDemarrerRevision: (lessonIds: string[]) => void;
  onBasculerFavori: (lessonId: string) => void;
  onRappel: (r: { actif: boolean; heure: string }) => void;
  onAllerExercices: () => void;
  onOuvrirConfidentialite: () => void;
  onOuvrirFiche?: () => void;
  evaluationsEntraineur?: Record<string, Record<string, 0 | 1 | 2>>;
  onOuvrirEntraineur: () => void;
}

async function exporterJson(paquet: unknown, nomFichier: string, titre: string): Promise<string> {
  const json = JSON.stringify(paquet, null, 2);
  if (Capacitor.isNativePlatform()) {
    const fichier = await Filesystem.writeFile({
      path: nomFichier,
      data: json,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });
    try {
      await Share.share({ title: titre, url: fichier.uri, dialogTitle: titre });
    } catch {
      return `أُلغي أو تعذّر المشاركة. الملف المؤقّت قد يُحذف؛ أعد التصدير واحفظه في مكان آمن.`;
    }
    return `فُتحت المشاركة للملف « ${nomFichier} ». تأكّد بنفسك من حفظه في مكان آمن؛ نسخة ذاكرة التخزين المؤقّت قد تُحذف.`;
  }
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomFichier;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return `طُلِب تنزيل « ${nomFichier} » — تأكّد من وجود الملف واحفظه في مكان آمن.`;
}

function exporterCarnet(fautes: FauteCarnet[]): Promise<string> {
  return exporterJson(
    {
      application: 'بوصلة العلوم · منهجية',
      exporteLe: new Date().toISOString(),
      total: fautes.length,
      carnet: fautes,
    },
    'carnet-failles.json',
    'سجلّ الأخطاء',
  );
}

class SauvegardeTropVolumineuse extends Error {}
class SauvegardeNonRestaurable extends Error {}

async function exporterEtatComplet(etat: Etat): Promise<string> {
  const paquet = paquetExportComplet(etat);
  const json = JSON.stringify(paquet, null, 2);
  if (new Blob([json]).size > TAILLE_MAX_SAUVEGARDE) throw new SauvegardeTropVolumineuse();
  if (!lireSauvegarde(JSON.parse(json))) throw new SauvegardeNonRestaurable();
  return exporterJson(paquet, 'bousala-sauvegarde.json', 'نسخة احتياطية');
}

export default function Ana({
  etat,
  carnet = [],
  onEffacerCarnet,
  onNom,
  onDateBac,
  onSupprimerNote,
  onReinitialiser,
  onRestaurer,
  onDeconnexion,
  onCreerCompte,
  onConsentementSync,
  onObjectif,
  onModeIntensif,
  onTailleTexte,
  onOuvrirDiagnostic,
  onOuvrirLecon,
  onDemarrerRevision,
  onBasculerFavori,
  onRappel,
  onAllerExercices,
  onOuvrirConfidentialite,
  onOuvrirFiche,
  evaluationsEntraineur,
}: Props) {
  const [volet, setVolet] = useState<'analyse' | 'reglages'>('analyse');
  const [confirme, setConfirme] = useState(false);
  const carnetAvantEffacement = useRef<string | null>(null);
  const boutonEffacement = useRef<HTMLButtonElement>(null);
  const titreEffacement = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (confirme) titreEffacement.current?.focus(); }, [confirme]);
  const [erreurImport, setErreurImport] = useState<string | null>(null);
  const [importEnAttente, setImportEnAttente] = useState<ImportEnAttente | null>(null);
  const [erreurReinitialisation, setErreurReinitialisation] = useState(false);
  const [noteExport, setNoteExport] = useState<{ ou: 'carnet' | 'sauvegarde'; texte: string } | null>(null);
  const entreeFichier = useRef<HTMLInputElement>(null);
  const boutonImport = useRef<HTMLButtonElement>(null);
  const titreImport = useRef<HTMLHeadingElement>(null);
  const versionImport = useRef(0);
  useEffect(() => { if (importEnAttente) titreImport.current?.focus(); }, [importEnAttente]);

  const xp = xpDe(etat);
  const niveau = niveauDe(xp);
  const jours = joursConsecutifsAvecBouclier(etat.journal, etat.rythmeBienveillant?.joursRepos);
  const wilaya = etat.compte ? WILAYA_PAR_CODE[etat.compte.wilaya] : undefined;

  async function importerFichier(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const fichier = e.target.files?.[0];
    e.target.value = '';
    if (!fichier) return;
    const version = ++versionImport.current;
    setImportEnAttente(null);
    setErreurImport(null);
    try {
      if (fichier.size > TAILLE_MAX_SAUVEGARDE) {
        setErreurImport('الملف أكبر من ٥ ميغابايت.');
        return;
      }
      const contenu = await fichier.text();
      if (version !== versionImport.current) return;
      const brut: unknown = JSON.parse(contenu);
      const lu = lireSauvegarde(brut);
      if (!lu) {
        setErreurImport('هذا الملف ليس نسخة احتياطية من التطبيق.');
        return;
      }
      const carnetAvantConfirmation = lu.carnetBoussole === undefined
        ? undefined : localStorage.getItem(CLE_CARNET_BOUSSOLE);
      const avertissementCarnet = lu.carnetBoussole === undefined
        ? 'لا يتضمّن الملف مسوّدات البوصلة؛ ستبقى الحالية.'
        : lu.carnetBoussole === null
          ? 'لا يحتوي الملف على دفتر بوصلة؛ ستُمسح مسوّدات البوصلة الحالية.'
          : 'ستُستبدل مسوّدات البوصلة الحالية بما في الملف.';
      const avertissementStats = lu.stats === undefined
        ? 'النسخ القديمة لا تحتوي على الإحصاءات، فتظلّ الحالية.'
        : 'ستُستبدل الإحصاءات بما في الملف.';
      setImportEnAttente({
        etat: normaliserSauvegarde(lu),
        stats: lu.stats,
        carnetBoussole: lu.carnetBoussole,
        carnetAvantConfirmation,
        avertissementCarnet,
        avertissementStats,
      });
    } catch {
      if (version === versionImport.current) {
        setErreurImport('لم أستطع قراءة الملف أو التخزين — تحقّق منهما وجرّب من جديد.');
      }
    }
  }

  return (
    <div dir="rtl" className="mx-auto max-w-3xl px-4 pb-28 pt-6 lg:pb-12">
      <header className="mb-4">
        <p className="oeil">ملفّي وتحليل مستواي</p>
        <h1 className="titre-1 mt-1">أنا</h1>
        <p className="petit doux mt-1">
          شجرة واحدة توضّح لك تقدّمك ونقاط قوّتك وما تراجعه الآن — وإعداداتك في تبويب منفصل وهادئ.
        </p>
      </header>

      {/* قسمان فقط بدل ثلاثة: تحليل أدائي + إعداداتي */}
      <nav
        className="mb-5 grid grid-cols-2 gap-1 rounded-2xl border border-line bg-paper p-1"
        role="tablist"
        aria-label="أقسام صفحتي"
      >
        {(
          [
            ['analyse', 'تحليل أدائي'],
            ['reglages', 'إعداداتي'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={volet === id}
            onClick={() => setVolet(id)}
            className={`min-h-[42px] rounded-xl px-3 text-xs font-extrabold whitespace-nowrap transition-colors ${
              volet === id ? 'bg-forest text-paper' : 'text-ink-soft hover:text-forest'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* ═══ القسم 1: شجرة تحليل الأداء الموحّدة ═══ */}
      <div hidden={volet !== 'analyse'}>
        <ArbreAnalyse
          etat={etat}
          carnet={carnet}
          evaluationsEntraineur={evaluationsEntraineur}
          onOuvrirFiche={onOuvrirFiche}
          onDemarrerRevision={onDemarrerRevision}
          onAllerExercices={onAllerExercices}
          onOuvrirDiagnostic={onOuvrirDiagnostic}
          onOuvrirLecon={onOuvrirLecon}
          onBasculerFavori={onBasculerFavori}
          onSupprimerNote={onSupprimerNote}
          onEffacerCarnet={onEffacerCarnet}
          onExporterCarnet={() => {
            setNoteExport(null);
            exporterCarnet(carnet)
              .then((texte) => setNoteExport({ ou: 'carnet', texte }))
              .catch(() => setNoteExport({ ou: 'carnet', texte: 'تعذّر التصدير — جرّب من جديد.' }));
          }}
          noteExportCarnet={noteExport?.ou === 'carnet' ? noteExport.texte : null}
        />
      </div>

      {/* ═══ القسم 2: إعداداتي (تبقى في الـ DOM مطويّة بـ hidden لحماية الاستعادة والمزامنة) ═══ */}
      <div hidden={volet !== 'reglages'} className="space-y-4">
        {/* الهوية وتاريخ الباك */}
        <section className="card p-5">
          <p className="eyebrow">هويتي وتاريخ الباك</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-ink-soft" htmlFor="nom">
                اسمي
              </label>
              <input
                id="nom"
                type="text"
                dir="rtl"
                value={etat.nom}
                onChange={(e) => onNom(e.target.value)}
                placeholder="اكتب اسمك..."
                className="field mt-1.5 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink-soft" htmlFor="datebac">
                تاريخ امتحاني
              </label>
              <input
                id="datebac"
                type="date"
                value={etat.dateBac ?? ''}
                onChange={(e) => e.target.value && onDateBac(e.target.value)}
                className="field mt-1.5 disabled:opacity-50"
              />
            </div>
          </div>
          {etat.dateBac && (
            <p className="mt-2 text-[11px] text-mute tnum">
              متبقّيًا {nb(Math.max(0, differenceJours(aujourdhui(), etat.dateBac)))} يومًا على
              امتحانك — خُطّط بهدوء، يومًا بيوم.
            </p>
          )}
        </section>

        {/* تفضيلات المراجعة والتذكير */}
        <ReglagesParcours
          etat={etat}
          onObjectif={onObjectif}
          onModeIntensif={onModeIntensif}
          onTailleTexte={onTailleTexte}
        />
        <ReglageRappel etat={etat} onChanger={onRappel} />

        {/* العمل دون إنترنت ووضع 4G وتثبيت التطبيق */}
        <CarteHorsLigne />

        {/* الحساب والمزامنة */}
        {!etat.compte && onCreerCompte && (
          <section className="card p-5">
            <p className="eyebrow">حسابي</p>
            <p className="mt-2 text-sm font-bold">أنت في وضع الزائر</p>
            <p className="mt-1 text-xs leading-relaxed text-mute">
              كل تقدّمك ومسوّداتك محفوظة على هذا الجهاز فقط، بلا بريد ولا كلمة مرور. الحساب اختياري:
              يضيف نقل تقدّمك إلى هاتف آخر، ولا يُرسل شيئًا دون موافقتك.
            </p>
            <button type="button" onClick={onCreerCompte} className="btn btn-primary mt-4 min-h-[44px] w-full text-sm">
              أنشئ حسابًا
            </button>
          </section>
        )}

        {etat.compte && (
          <section className="card p-5">
            <p className="eyebrow">حسابي</p>
            <div className="mt-3 flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-forest text-lg font-black text-paper">
                {etat.compte.email.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold" dir="ltr">
                  {etat.compte.email}
                </p>
                <p className="mt-1 text-xs text-mute">
                  {wilaya ? `${wilaya.nom} — ${etat.compte.daira}` : 'ولايتك غير محدّدة'}
                </p>
                <p className="mt-1 text-[11px] text-mute">
                  عضو منذ {formatJourAr(etat.compte.creeLe.slice(0, 10))}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-ink-soft">
              <span>{niveau.nom}</span>
              <span aria-hidden="true">·</span>
              <span className="tnum">{xpTexte(xp)}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-honey-ink tnum">
                <span className="h-3.5 w-3.5" aria-hidden="true"><IcoFlamme /></span>
                {joursNb(jours)}
              </span>
            </div>
            {onDeconnexion && (
              <>
                <button type="button" onClick={onDeconnexion} className="btn btn-ghost mt-4 min-h-[44px] w-full text-sm">
                  تسجيل الخروج
                </button>
                <p className="mt-2 text-xs leading-relaxed text-mute">
                  تسجيل الخروج لا يمسح المسوّدات. دفتر البوصلة مشترك بين مستخدمي هذا المتصفّح وغير مرتبط بالحساب؛ امسحه قبل تسليم جهاز مشترك.
                </p>
              </>
            )}
          </section>
        )}

        <ReglageSync etat={etat} onChoix={onConsentementSync} />

        <button
          type="button"
          onClick={onOuvrirConfidentialite}
          className="card w-full p-5 text-start transition-colors hover:border-forest"
        >
          <p className="eyebrow">الخصوصية · الأسئلة الشائعة · عن التطبيق</p>
          <p className="mt-1 text-sm font-bold">ما يحدث لبياناتك بالضبط، حقوقك، وحذف سجلّك من الخادم ←</p>
        </button>

        {/* النسخة الاحتياطية */}
        <section className="card p-5">
          <p className="eyebrow">النسخة الاحتياطية</p>
          <p className="mt-2 text-xs leading-relaxed text-mute">
            صدّر مسارك وإحصاءاتك ومسوّدات مختبر البوصلة في ملف واحد، واستعده في أي جهاز.
            يحتوي الملف ملاحظاتك ومسوّداتك وتقدّمك بنص واضح؛ احفظه في مكان آمن. لا ينقل حسابك أو رمز المزامنة أو موافقتك، ولا يشمل دفاتر إصدارات المختبر الأقدم. إذا تعذّرت قراءة التقدّم المحفوظ أو دفتر البوصلة أو الإحصاءات فلن نصدّر نسخة ناقصة.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setNoteExport(null);
                exporterEtatComplet(etat)
                  .then((texte) => setNoteExport({ ou: 'sauvegarde', texte }))
                  .catch((erreur: unknown) => setNoteExport({
                    ou: 'sauvegarde',
                    texte: erreur instanceof CarnetBoussoleIllisible
                      ? 'تعذّرت قراءة دفتر البوصلة؛ لم نصدّر نسخة ناقصة. تحقّق من التخزين دون مسح البيانات.'
                      : erreur instanceof RestaurationEnAttente
                        ? 'تغيّرت البيانات أو توجد استعادة غير مكتملة؛ لم نصدّر بيانات مختلطة. احفظ نصوصك المؤقّتة وأعد فتح التطبيق.'
                        : erreur instanceof StatsIllisibles
                          ? 'تعذّرت قراءة الإحصاءات المحفوظة؛ لم نصدّر نسخة ناقصة. تحقّق من التخزين دون مسح البيانات.'
                          : erreur instanceof EtatIllisible
                            ? 'تعذّرت قراءة التقدّم المحفوظ؛ لم نصدّر نسخة ناقصة. تحقّق من التخزين دون مسح البيانات.'
                            : erreur instanceof SauvegardeTropVolumineuse
                              ? 'النسخة أكبر من ٥ ميغابايت، ولا يمكن استيرادها بهذا الحجم. قلّل البيانات بعد حفظ نسخة منها.'
                              : erreur instanceof SauvegardeNonRestaurable
                                ? 'تعذّر إنشاء نسخة قابلة للاستيراد بسبب صيغة البيانات أو طولها. انسخ ملاحظاتك قبل تعديلها.'
                                : 'تعذّر التصدير — جرّب من جديد.',
                  }));
              }}
              className="btn btn-primary min-h-[44px] flex-1 text-sm"
            >
              تصدير نسختي
            </button>
            <button
              type="button"
              ref={boutonImport}
              onClick={() => entreeFichier.current?.click()}
              className="btn btn-ghost min-h-[44px] flex-1 text-sm"
            >
              استيراد نسخة
            </button>
            <input
              ref={entreeFichier}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={importerFichier}
            />
          </div>
          {importEnAttente && (
            <div
              role="group"
              aria-labelledby="confirmation-import-titre"
              aria-describedby="confirmation-import-detail"
              className="mt-3 rounded-2xl border border-gold-soft bg-gold-soft/40 p-3"
            >
              <h2
                id="confirmation-import-titre"
                ref={titreImport}
                tabIndex={-1}
                aria-describedby="confirmation-import-detail"
                className="text-sm font-bold text-forest-deep"
              >
                تأكيد استيراد النسخة
              </h2>
              <p id="confirmation-import-detail" className="mt-2 text-sm leading-relaxed text-ink-soft">
                ستُستبدل بيانات تقدّمك الحالية. {importEnAttente.avertissementCarnet} {importEnAttente.avertissementStats} سيبقى الحساب والموافقة على هذا الجهاز كما هما. أغلق التبويبات الأخرى قبل الاستيراد حتى لا تعيد كتابة بيانات أقدم.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-primary min-h-[44px] flex-1 text-sm"
                  onClick={() => {
                    const selection = importEnAttente;
                    setImportEnAttente(null);
                    boutonImport.current?.focus();
                    onRestaurer(selection.etat, selection.stats, selection.carnetBoussole, selection.carnetAvantConfirmation);
                  }}
                >
                  نعم، استورد النسخة
                </button>
                <button
                  type="button"
                  className="btn btn-ghost min-h-[44px] flex-1 text-sm"
                  onClick={() => {
                    setImportEnAttente(null);
                    boutonImport.current?.focus();
                  }}
                >
                  إلغاء الاستيراد
                </button>
              </div>
            </div>
          )}
          {noteExport?.ou === 'sauvegarde' && (
            <p
              role="status"
              className="mt-3 rounded-xl border border-forest bg-sage px-3 py-2 text-sm font-bold text-forest-deep"
            >
              {noteExport.texte}
            </p>
          )}
          {erreurImport && (
            <p
              role="alert"
              className="mt-3 rounded-xl border border-clay-soft bg-clay-soft/60 px-3 py-2 text-sm font-bold text-clay"
            >
              {erreurImport}
            </p>
          )}
        </section>

        {/* إعادة الضبط */}
        <section className="card border-clay-soft p-5">
          <p className="eyebrow text-clay">إعادة الضبط</p>
          <p className="mt-2 text-xs leading-relaxed text-mute">
            تحذف الحساب المحلي والتقدّم والملاحظات والإحصاءات ومسوّدات المختبر الحالي من هذا المتصفّح. لا تحذف دفاتر إصدارات المختبر الأقدم، أو الملفات المنزّلة، أو بيانات الخادم. لمحو بيانات الموقع القديمة، احفظ ما تحتاجه ثم امسح بيانات الموقع من إعدادات المتصفّح. أغلق التبويبات الأخرى قبل المسح حتى لا تعيد حفظ بيانات مفتوحة. لا يمكن التراجع.
          </p>
          {erreurReinitialisation && (
            <p role="alert" className="mt-3 text-sm font-bold text-clay">
              لم يُؤكّد مسح جميع البيانات؛ ربما مُسح بعضها فقط. تحقّق من التخزين وأعد المحاولة قبل تسليم الجهاز.
            </p>
          )}
          <button
            type="button"
            ref={boutonEffacement}
            aria-expanded={confirme}
            onClick={() => {
              if (confirme) { setConfirme(false); return; }
              try {
                carnetAvantEffacement.current = localStorage.getItem(CLE_CARNET_BOUSSOLE);
                setErreurReinitialisation(false);
                setConfirme(true);
              } catch {
                setErreurReinitialisation(true);
              }
            }}
            className="btn btn-ghost mt-3 min-h-[44px] w-full text-sm text-clay"
          >
            مسح كل بياناتي
          </button>
          {confirme && (
            <div role="group" aria-labelledby="confirmation-effacement-titre" className="mt-3 rounded-2xl border border-clay-soft p-3">
              <h2 id="confirmation-effacement-titre" ref={titreEffacement} tabIndex={-1} className="text-sm font-bold">
                تأكيد مسح بيانات هذا المتصفّح
              </h2>
              <p className="mt-2 text-sm">لا يمكن التراجع. أغلق التبويبات الأخرى واحفظ ما تحتاجه أولًا.</p>
              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setConfirme(false);
                    boutonEffacement.current?.focus();
                    setErreurReinitialisation(onReinitialiser(carnetAvantEffacement.current) === false);
                  }}
                  className="btn min-h-[44px] flex-1 bg-clay text-paper"
                >
                  نعم، امسح كل شيء
                </button>
                <button
                  type="button"
                  onClick={() => { setConfirme(false); boutonEffacement.current?.focus(); }}
                  className="btn btn-ghost min-h-[44px] flex-1"
                >
                  تراجع
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
